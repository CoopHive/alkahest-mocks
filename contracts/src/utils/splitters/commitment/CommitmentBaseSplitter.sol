// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {IEscrow} from "../../../IEscrow.sol";
import {SplitterDemandData, BaseSplitter} from "../default/BaseSplitter.sol";
import {SplitterVerification} from "../SplitterVerification.sol";

/// @title CommitmentBaseSplitter
/// @notice Base for splitter variants whose oracle decisions are made before the fulfillment UID exists.
/// @dev Decisions are keyed by `(fulfillmentIntentHash(fulfillment, recordedFulfiller), escrowUid)`.
/// @dev Security note: This contract has not been included in professional manual audits and
///      has only been reviewed by automated audit tooling so far.
abstract contract CommitmentBaseSplitter is BaseSplitter {
    using SplitterVerification for Attestation;

    /// @notice Emitted by an escrow participant to request a split decision for a future fulfillment.
    event CommitmentArbitrationRequested(
        bytes32 indexed intentHash, bytes32 indexed escrow, address indexed oracle, bytes demand
    );

    /// @param _eas EAS contract used to load attestations.
    /// @param _escrowObligation Canonical escrow obligation this splitter settles.
    constructor(IEAS _eas, IEscrow _escrowObligation) BaseSplitter(_eas, _escrowObligation) {}

    /// @notice Emits an arbitration request for a future fulfillment when called by the escrow attester or recipient.
    function requestArbitration(bytes32 intentHash, bytes32 escrow, address oracle, bytes memory demand)
        external
        override
    {
        Attestation memory escrowAttestation = eas.getAttestation(escrow);
        if (escrowAttestation.attester != msg.sender && escrowAttestation.recipient != msg.sender) {
            revert UnauthorizedArbitrationRequest();
        }
        emit CommitmentArbitrationRequested(intentHash, escrow, oracle, demand);
    }

    /// @inheritdoc BaseSplitter
    function check(Attestation memory fulfillment, bytes memory demand, bytes32 escrow)
        public
        view
        virtual
        override
        returns (bool)
    {
        fulfillment.verifyFulfillmentRecipient();
        SplitterDemandData memory demandData = abi.decode(demand, (SplitterDemandData));
        bytes32 decisionKey = _decisionKeyForFulfillment(fulfillment, escrow);
        return activeSettlement == decisionKey && hasDecision[demandData.oracle][decisionKey];
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

    /// @notice Hashes a splitter fulfillment intent, binding the attestation fields to the recorded fulfiller.
    function fulfillmentIntentHash(Attestation memory attestation, address fulfiller) public pure returns (bytes32) {
        return fulfillmentIntentHash(
            attestation.schema,
            attestation.attester,
            attestation.recipient,
            attestation.expirationTime,
            attestation.revocable,
            attestation.refUID,
            keccak256(attestation.data),
            fulfiller
        );
    }

    /// @notice Hashes a splitter fulfillment intent from pre-encoded attestation data.
    function fulfillmentIntentHash(
        bytes32 schema,
        address attester,
        address recipient,
        uint64 expirationTime,
        bool revocable,
        bytes32 refUID,
        bytes memory data,
        address fulfiller
    ) public pure returns (bytes32) {
        return fulfillmentIntentHash(
            schema, attester, recipient, expirationTime, revocable, refUID, keccak256(data), fulfiller
        );
    }

    /// @notice Hashes a splitter fulfillment intent from an already-computed data hash.
    function fulfillmentIntentHash(
        bytes32 schema,
        address attester,
        address recipient,
        uint64 expirationTime,
        bool revocable,
        bytes32 refUID,
        bytes32 dataHash,
        address fulfiller
    ) public pure returns (bytes32) {
        return keccak256(
            abi.encode(
                attestationIntentHash(schema, attester, recipient, expirationTime, revocable, refUID, dataHash),
                fulfiller
            )
        );
    }

    function _decisionKeyForFulfillment(Attestation memory fulfillment, bytes32 escrow)
        internal
        view
        virtual
        override
        returns (bytes32)
    {
        return _decisionKey(fulfillmentIntentHash(fulfillment, fulfillers[fulfillment.uid]), escrow);
    }

    function _collectEscrow(bytes32 escrow, bytes32 fulfillment)
        internal
        virtual
        override
        returns (bytes memory result)
    {
        Attestation memory fulfillmentAttestation = eas.getAttestation(fulfillment);
        bytes32 decisionKey = _decisionKeyForFulfillment(fulfillmentAttestation, escrow);
        activeSettlement = decisionKey;
        result = escrowObligation.collect(escrow, fulfillment);
        activeSettlement = bytes32(0);
    }
}
