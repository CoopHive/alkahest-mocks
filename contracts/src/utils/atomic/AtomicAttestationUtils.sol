// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {IEAS, AttestationRequest} from "@eas/IEAS.sol";
import {
    AttestationReferenceEscrowObligation
} from "../../obligations/escrow/default/AttestationReferenceEscrowObligation.sol";
import {
    UnconditionalAttestationReferenceEscrowObligation
} from "../../obligations/escrow/unconditional/UnconditionalAttestationReferenceEscrowObligation.sol";

/// @title AtomicAttestationUtils
/// @notice Helpers that create an EAS attestation and an attestation-reference escrow in one transaction.
/// @dev Security note: This contract has not been included in professional manual audits and
///      has only been reviewed by automated audit tooling so far.
contract AtomicAttestationUtils {
    /// @notice EAS contract used to create attestations.
    IEAS public immutable eas;

    /// @notice Raised when `msg.value` does not exactly match the EAS attestation value.
    error IncorrectAttestationValue(uint256 expected, uint256 actual);
    /// @notice Raised when the requested attestation is revocable but this utility has no revoke path.
    error UnsupportedRevocableAttestation();

    /// @notice Emitted with the exact UIDs created by an atomic reference-escrow helper call.
    event ReferenceEscrowCreated(
        address indexed escrow, bytes32 indexed attestationUid, bytes32 indexed escrowUid, bool unconditional
    );

    /// @notice Escrow parameters shared by default and unconditional attestation-reference escrows.
    struct ReferenceEscrowData {
        /// @notice Arbiter contract that will validate the fulfillment.
        address arbiter;
        /// @notice ABI-encoded demand for the arbiter.
        bytes demand;
        /// @notice Expiration timestamp for the attestation created when the escrow is collected.
        uint64 expirationTime;
    }

    /// @param _eas EAS contract used to create attestations.
    constructor(IEAS _eas) {
        eas = _eas;
    }

    /// @notice Creates an EAS attestation and then creates a default attestation-reference escrow for it.
    function attestAndCreateReferenceEscrow(
        AttestationReferenceEscrowObligation escrow,
        AttestationRequest calldata request,
        ReferenceEscrowData calldata escrowData,
        uint64 escrowExpirationTime
    ) external payable returns (bytes32 attestationUid, bytes32 escrowUid) {
        attestationUid = _attest(request);
        escrowUid = escrow.doObligationFor(
            AttestationReferenceEscrowObligation.ObligationData({
                arbiter: escrowData.arbiter,
                demand: escrowData.demand,
                referencedAttestationUid: attestationUid,
                expirationTime: escrowData.expirationTime
            }),
            escrowExpirationTime,
            msg.sender
        );
        emit ReferenceEscrowCreated(address(escrow), attestationUid, escrowUid, false);
    }

    /// @notice Creates an EAS attestation and then creates an unconditional attestation-reference escrow for it.
    function attestAndCreateUnconditionalReferenceEscrow(
        UnconditionalAttestationReferenceEscrowObligation escrow,
        AttestationRequest calldata request,
        ReferenceEscrowData calldata escrowData,
        uint64 escrowExpirationTime
    ) external payable returns (bytes32 attestationUid, bytes32 escrowUid) {
        attestationUid = _attest(request);
        escrowUid = escrow.doObligationFor(
            UnconditionalAttestationReferenceEscrowObligation.ObligationData({
                arbiter: escrowData.arbiter,
                demand: escrowData.demand,
                referencedAttestationUid: attestationUid,
                expirationTime: escrowData.expirationTime
            }),
            escrowExpirationTime,
            msg.sender
        );
        emit ReferenceEscrowCreated(address(escrow), attestationUid, escrowUid, true);
    }

    /// @notice Creates the EAS attestation after validating the supplied ETH value.
    function _attest(AttestationRequest calldata request) internal returns (bytes32) {
        uint256 value = request.data.value;
        if (request.data.revocable) revert UnsupportedRevocableAttestation();
        if (msg.value != value) revert IncorrectAttestationValue(value, msg.value);
        return eas.attest{value: value}(request);
    }
}
