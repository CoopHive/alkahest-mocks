// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {IEscrowHook} from "../IEscrowHook.sol";
import {ApprovedEscrowHook} from "./ApprovedEscrowHook.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {ISchemaResolver} from "@eas/resolver/ISchemaResolver.sol";
import {SchemaResolver} from "@eas/resolver/SchemaResolver.sol";
import {Attestation} from "@eas/Common.sol";
import {SchemaRegistryUtils} from "../../../../libraries/SchemaRegistryUtils.sol";

/// @title AttestationReferenceEscrowHook
/// @notice An IEscrowHook that creates an attestation referencing
///         a pre-existing attestation on release.
/// @dev hookData is abi.encode(HookData).
///      Like AttestationEscrowHook, no assets are locked. On release, a
///      non-revocable attestation is created that references the original
///      attestation UID.
///
///      The reference-attestation schema is registered at deploy time. The
///      attester of the released attestation is this hook contract.
///
///      Security note: This contract has not been included in professional manual audits and
///      has only been reviewed by automated audit tooling so far.
contract AttestationReferenceEscrowHook is IEscrowHook, ApprovedEscrowHook, SchemaResolver {
    using SchemaRegistryUtils for ISchemaRegistry;

    struct HookData {
        bytes32 referencedAttestationUid;
        address recipient;
        uint64 expirationTime;
    }

    IEAS public immutable eas;
    bytes32 public immutable REFERENCE_ATTESTATION_SCHEMA;

    /// @notice Tracks pending: caller → hookDataHash → count.
    mapping(address => mapping(bytes32 => uint256)) public pending;

    error AttestationCreationFailed();
    error NoPendingReferenceAttestation(address caller, bytes32 hookDataHash);

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry) SchemaResolver(_eas) {
        eas = _eas;
        REFERENCE_ATTESTATION_SCHEMA =
            _schemaRegistry.registerOrReuse("bytes32 referencedAttestationUid", ISchemaResolver(address(this)), false);
    }

    // ──────────────────────────────────────────────

    function onLock(bytes calldata data, address from, address escrow) external payable override {
        _checkLockCaller(from, escrow);
        if (msg.value != 0) revert IEscrowHook.UnexpectedNativeValue();

        bytes32 dataHash = keccak256(data);
        pending[msg.sender][dataHash]++;
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
            revert NoPendingReferenceAttestation(msg.sender, dataHash);
        }

        pending[msg.sender][dataHash]--;

        HookData memory decoded = abi.decode(data, (HookData));
        bytes memory referenceData = abi.encode(decoded.referencedAttestationUid);

        try eas.attest(
            AttestationRequest({
                schema: REFERENCE_ATTESTATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: decoded.recipient,
                    expirationTime: decoded.expirationTime,
                    revocable: false,
                    refUID: decoded.referencedAttestationUid,
                    data: referenceData,
                    value: 0
                })
            })
        ) {}
        catch {
            revert AttestationCreationFailed();
        }
    }

    function onReturn(
        bytes calldata data,
        address,
        /* to */
        Attestation calldata escrow
    )
        external
        override
    {
        _checkAttestationCaller(escrow);
        bytes32 dataHash = keccak256(data);
        if (pending[msg.sender][dataHash] > 0) {
            pending[msg.sender][dataHash]--;
        }
    }

    function onAttest(
        Attestation calldata attestation,
        uint256 /* value */
    )
        internal
        view
        override
        returns (bool)
    {
        return attestation.attester == address(this);
    }

    function onRevoke(
        Attestation calldata attestation,
        uint256 /* value */
    )
        internal
        view
        override
        returns (bool)
    {
        return attestation.attester == address(this);
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
