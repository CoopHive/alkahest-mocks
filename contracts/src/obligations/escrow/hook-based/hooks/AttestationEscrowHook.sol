// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {IEscrowHook} from "../IEscrowHook.sol";
import {ApprovedEscrowHook} from "./ApprovedEscrowHook.sol";
import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest} from "@eas/IEAS.sol";

/// @title AttestationEscrowHook
/// @notice An IEscrowHook that creates an EAS attestation on release.
/// @dev hookData is abi.encode(HookData).
///      No assets are locked or returned — the "escrow" is a promise to
///      create an attestation upon fulfillment.
///
///      On lock:    no-op (nothing to escrow).
///      On release: creates the attestation via EAS. The attester is this
///                  hook contract.
///      On return:  no-op (nothing to return).
///
///      No per-caller deposit tracking needed since there are no assets.
///      However, we track a nonce per-caller to prevent replay of release
///      calls for the same escrow.
///
///      Security note: This contract has not been included in professional manual audits and
///      has only been reviewed by automated audit tooling so far.
contract AttestationEscrowHook is IEscrowHook, ApprovedEscrowHook {
    struct HookData {
        AttestationRequest attestation;
    }

    IEAS public immutable eas;

    /// @notice Tracks pending releases: caller → hookDataHash → count.
    mapping(address => mapping(bytes32 => uint256)) public pending;
    mapping(address => mapping(bytes32 => uint256)) public pendingValue;

    error AttestationCreationFailed();
    error NoPendingAttestation(address caller, bytes32 hookDataHash);
    error IncorrectPayment(uint256 expected, uint256 received);
    error NativeTokenTransferFailed(address to, uint256 amount);
    error UnsupportedRevocableAttestation();

    constructor(IEAS _eas) {
        eas = _eas;
    }

    // ──────────────────────────────────────────────

    function onLock(bytes calldata data, address from, address escrow) external payable override {
        _checkLockCaller(from, escrow);
        HookData memory decoded = abi.decode(data, (HookData));
        if (decoded.attestation.data.revocable) revert UnsupportedRevocableAttestation();
        uint256 requiredValue = decoded.attestation.data.value;
        if (msg.value != requiredValue) revert IncorrectPayment(requiredValue, msg.value);

        // Mark as pending so onRelease can verify it was locked via a
        // legitimate obligation flow.
        bytes32 dataHash = keccak256(data);
        pending[msg.sender][dataHash]++;
        pendingValue[msg.sender][dataHash] += requiredValue;
    }

    function onAttest(bytes calldata, Attestation calldata escrow) external view override {
        _checkAttestationCaller(escrow);
    }

    function onRelease(
        bytes calldata data,
        address,
        /* to */
        Attestation calldata escrow,
        bytes32 /* fulfillmentUid */
    )
        external
        override
    {
        _checkAttestationCaller(escrow);
        bytes32 dataHash = keccak256(data);
        if (pending[msg.sender][dataHash] == 0) {
            revert NoPendingAttestation(msg.sender, dataHash);
        }

        pending[msg.sender][dataHash]--;

        HookData memory decoded = abi.decode(data, (HookData));
        uint256 requiredValue = decoded.attestation.data.value;
        pendingValue[msg.sender][dataHash] -= requiredValue;

        try eas.attest{value: requiredValue}(decoded.attestation) {}
        catch {
            revert AttestationCreationFailed();
        }
    }

    function onReturn(bytes calldata data, address to, Attestation calldata escrow) external override {
        _checkAttestationCaller(escrow);
        // Clear the pending state — the attestation won't be created.
        bytes32 dataHash = keccak256(data);
        if (pending[msg.sender][dataHash] > 0) {
            pending[msg.sender][dataHash]--;
            HookData memory decoded = abi.decode(data, (HookData));
            uint256 requiredValue = decoded.attestation.data.value;
            pendingValue[msg.sender][dataHash] -= requiredValue;
            if (requiredValue != 0) {
                (bool success,) = payable(to).call{value: requiredValue}("");
                if (!success) revert NativeTokenTransferFailed(to, requiredValue);
            }
        }
    }

    // ──────────────────────────────────────────────
    // Encoding helpers
    // ──────────────────────────────────────────────

    function encodeHookData(HookData calldata hookData) external pure returns (bytes memory) {
        return abi.encode(hookData);
    }

    function decodeHookData(bytes calldata data) external pure returns (HookData memory) {
        return abi.decode(data, (HookData));
    }
}
