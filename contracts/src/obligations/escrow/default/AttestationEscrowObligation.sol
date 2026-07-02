// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {BaseEscrowObligation} from "../../../BaseEscrowObligation.sol";
import {IArbiter} from "../../../IArbiter.sol";
import {BaseArbiter} from "../../../BaseArbiter.sol";
import {ArbiterUtils} from "../../../libraries/ArbiterUtils.sol";
import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";

/// @title AttestationEscrowObligation
/// @notice Escrows native token and releases it with the fulfillment attestation data.
/// @dev Uses the default escrow checks: fulfillment must reference the escrow UID and pass intrinsic attestation validation.
contract AttestationEscrowObligation is BaseEscrowObligation, BaseArbiter {
    using ArbiterUtils for Attestation;

    /// @notice Attestation escrow terms encoded in each escrow attestation.
    struct ObligationData {
        address arbiter;
        bytes demand;
        AttestationRequest attestation;
    }

    error AttestationCreationFailed();
    error IncorrectPayment(uint256 expected, uint256 received);
    error NativeTokenTransferFailed(address to, uint256 amount);
    error UnsupportedRevocableAttestation();

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        BaseEscrowObligation(
            _eas,
            _schemaRegistry,
            "address arbiter, bytes demand, tuple(bytes32 schema, tuple(address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data) attestation",
            true
        )
    {}

    /// @inheritdoc BaseEscrowObligation
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(BaseEscrowObligation, BaseArbiter)
        returns (bool)
    {
        return interfaceId == type(IArbiter).interfaceId || super.supportsInterface(interfaceId);
    }

    // Extract arbiter and demand from encoded data
    /// @inheritdoc BaseEscrowObligation
    function decodeCondition(bytes memory data) public pure override returns (address arbiter, bytes memory demand) {
        ObligationData memory decoded = abi.decode(data, (ObligationData));
        return (decoded.arbiter, decoded.demand);
    }

    // No assets to lock for attestation escrows
    function _lockEscrow(bytes memory data, address) internal override {
        ObligationData memory decoded = abi.decode(data, (ObligationData));
        if (decoded.attestation.data.revocable) revert UnsupportedRevocableAttestation();
        uint256 requiredValue = decoded.attestation.data.value;
        if (msg.value != requiredValue) {
            revert IncorrectPayment(requiredValue, msg.value);
        }
    }

    // Create the escrowed attestation
    function _releaseEscrow(Attestation memory escrow, address, bytes32) internal override returns (bytes memory) {
        ObligationData memory decoded = abi.decode(escrow.data, (ObligationData));
        if (decoded.attestation.schema == ATTESTATION_SCHEMA) revert InvalidEscrowAttestation();

        bytes32 attestationUid;
        try eas.attest{value: decoded.attestation.data.value}(decoded.attestation) returns (bytes32 uid) {
            attestationUid = uid;
        } catch {
            revert AttestationCreationFailed();
        }

        return abi.encode(attestationUid);
    }

    // No assets to return for attestation escrows
    function _returnEscrow(Attestation memory escrow, address to) internal override {
        ObligationData memory decoded = abi.decode(escrow.data, (ObligationData));
        uint256 requiredValue = decoded.attestation.data.value;
        if (requiredValue != 0) {
            (bool success,) = payable(to).call{value: requiredValue}("");
            if (!success) {
                revert NativeTokenTransferFailed(to, requiredValue);
            }
        }
    }

    // Implement IArbiter
    /// @inheritdoc IArbiter
    function check(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 /* fulfilling */
    )
        public
        view
        override
        returns (bool)
    {
        if (obligation.schema != ATTESTATION_SCHEMA) return false;

        ObligationData memory escrow = abi.decode(obligation.data, (ObligationData));
        ObligationData memory demandData = abi.decode(demand, (ObligationData));

        return keccak256(abi.encode(escrow.attestation)) == keccak256(abi.encode(demandData.attestation))
            && escrow.arbiter == demandData.arbiter && keccak256(escrow.demand) == keccak256(demandData.demand);
    }

    // Typed convenience methods
    /// @notice Locks native token and creates an attestation escrow for the caller.
    function doObligation(ObligationData calldata data, uint64 expirationTime) external payable returns (bytes32) {
        return _doObligationForRaw(abi.encode(data), expirationTime, msg.sender, bytes32(0));
    }

    /// @notice Locks native token and creates an attestation escrow for an explicit recipient.
    function doObligationFor(ObligationData calldata data, uint64 expirationTime, address recipient)
        external
        payable
        returns (bytes32)
    {
        return _doObligationForRaw(abi.encode(data), expirationTime, recipient, bytes32(0));
    }

    /// @notice Loads and decodes attestation escrow data from this contract's attestation.
    function getObligationData(bytes32 uid) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    /// @notice Decodes ABI-encoded attestation escrow data.
    function decodeObligationData(bytes calldata data) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
