// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../../IArbiter.sol";
import {BaseArbiter} from "../../BaseArbiter.sol";

/// @title CommitmentTrustedOracleArbiter
/// @notice Defers fulfillment acceptance to a trusted oracle decision made over a future attestation intent.
/// @dev Unlike `TrustedOracleArbiter`, decisions are keyed before the fulfillment UID exists. The oracle approves
///      the semantic fields that can be known before EAS creates the attestation: schema, attester, recipient,
///      expiration, revocability, refUID, and data hash. EAS-derived fields such as UID, time, and revocation time
///      are intentionally excluded.
/// @dev Security note: This contract has not been included in professional manual audits and has only been reviewed
///      by automated audit tooling so far.
contract CommitmentTrustedOracleArbiter is BaseArbiter {
    /// @notice Demand specifying which oracle must have approved which opaque context.
    struct DemandData {
        /// @notice Oracle address whose decision is trusted.
        address oracle;
        /// @notice Opaque context bytes included in the decision key.
        bytes data;
    }

    /// @notice Emitted when an oracle records a decision for an attestation intent and context.
    event ArbitrationMade(
        bytes32 indexed decisionKey, bytes32 indexed intentHash, address indexed oracle, bool decision
    );
    /// @notice Emitted to request oracle review of a not-yet-created attestation intent.
    event ArbitrationRequested(bytes32 indexed intentHash, address indexed oracle, bytes demand);

    /// @notice Recorded oracle decisions keyed by oracle and `keccak256(intentHash, demand)`.
    mapping(address => mapping(bytes32 => bool)) public decisions;

    /// @notice Records the caller's oracle decision for an attestation intent and demand context.
    /// @param intentHash Hash returned by `attestationIntentHash`.
    /// @param demand Opaque demand context that must match the escrow's demand data.
    /// @param decision Oracle decision to record.
    function arbitrate(bytes32 intentHash, bytes memory demand, bool decision) public {
        bytes32 decisionKey = decisionKeyFor(intentHash, demand);
        decisions[msg.sender][decisionKey] = decision;
        emit ArbitrationMade(decisionKey, intentHash, msg.sender, decision);
    }

    /// @notice Emits an off-chain hint requesting oracle review for an attestation intent.
    /// @dev Request events are non-authoritative. Settlement uses the escrow demand and recorded oracle decision.
    function requestArbitration(bytes32 intentHash, address oracle, bytes memory demand) public {
        emit ArbitrationRequested(intentHash, oracle, demand);
    }

    /// @inheritdoc IArbiter
    function check(Attestation memory fulfillment, bytes memory demand, bytes32) public view override returns (bool) {
        DemandData memory demand_ = abi.decode(demand, (DemandData));
        bytes32 intentHash = attestationIntentHash(fulfillment);
        bytes32 decisionKey = decisionKeyFor(intentHash, demand_.data);
        return decisions[demand_.oracle][decisionKey];
    }

    /// @notice Returns the decision key used for `(intentHash, demand)`.
    function decisionKeyFor(bytes32 intentHash, bytes memory demand) public pure returns (bytes32) {
        return keccak256(abi.encode(intentHash, demand));
    }

    /// @notice Hashes the semantic attestation fields an oracle can approve before EAS assigns a UID.
    function attestationIntentHash(Attestation memory attestation) public pure returns (bytes32) {
        return attestationIntentHash(
            attestation.schema,
            attestation.attester,
            attestation.recipient,
            attestation.expirationTime,
            attestation.revocable,
            attestation.refUID,
            keccak256(attestation.data)
        );
    }

    /// @notice Hashes an attestation intent from pre-encoded attestation data.
    function attestationIntentHash(
        bytes32 schema,
        address attester,
        address recipient,
        uint64 expirationTime,
        bool revocable,
        bytes32 refUID,
        bytes memory data
    ) public pure returns (bytes32) {
        return attestationIntentHash(schema, attester, recipient, expirationTime, revocable, refUID, keccak256(data));
    }

    /// @notice Hashes an attestation intent from an already-computed data hash.
    function attestationIntentHash(
        bytes32 schema,
        address attester,
        address recipient,
        uint64 expirationTime,
        bool revocable,
        bytes32 refUID,
        bytes32 dataHash
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(schema, attester, recipient, expirationTime, revocable, refUID, dataHash));
    }

    /// @notice Decodes ABI-encoded trusted commitment-oracle demand data.
    function decodeDemandData(bytes calldata data) public pure returns (DemandData memory) {
        return abi.decode(data, (DemandData));
    }
}
