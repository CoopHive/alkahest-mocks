// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {BaseObligation} from "./BaseObligation.sol";
import {IArbiter} from "./IArbiter.sol";
import {ArbiterUtils} from "./ArbiterUtils.sol";
import {Attestation} from "@eas/Common.sol";
import {IEAS, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";

// Note: Does NOT implement IArbiter - that's left to specific implementations
abstract contract BaseEscrowObligation is BaseObligation {
    using ArbiterUtils for Attestation;

    // Common events for all escrow types
    event EscrowMade(bytes32 indexed escrow, address indexed buyer);
    event EscrowCollected(
        bytes32 indexed escrow,
        bytes32 indexed fulfillment,
        address indexed fulfiller
    );

    // Common errors
    error InvalidEscrowAttestation();
    error InvalidFulfillment();
    error UnauthorizedCall();
    error AttestationNotFound(bytes32 attestationId);
    error RevocationFailed(bytes32 attestationId);

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry,
        string memory schema,
        bool revocable
    ) BaseObligation(_eas, _schemaRegistry, schema, revocable) {}

    // Abstract methods that escrow types must implement

    // Called when escrow is created (in _beforeObligation)
    function _lockEscrow(bytes memory data, address from) internal virtual;

    // Called when escrow is collected (after successful fulfillment check)
    function _releaseEscrow(
        bytes memory escrowData,
        address to,
        bytes32 fulfillmentUid
    ) internal virtual returns (bytes memory result);

    // Called when escrow expires and is reclaimed
    function _returnEscrow(bytes memory data, address to) internal virtual;

    // Extract arbiter and demand from encoded data
    function extractArbiterAndDemand(
        bytes memory data
    ) public pure virtual returns (address arbiter, bytes memory demand);

    // Common escrow collection implementation
    function collectEscrowRaw(
        bytes32 _escrow,
        bytes32 _fulfillment
    ) public virtual returns (bytes memory) {
        Attestation memory escrow;
        Attestation memory fulfillment;

        // Get attestations with error handling
        try eas.getAttestation(_escrow) returns (
            Attestation memory attestationResult
        ) {
            escrow = attestationResult;
        } catch {
            revert AttestationNotFound(_escrow);
        }

        try eas.getAttestation(_fulfillment) returns (
            Attestation memory attestationResult
        ) {
            fulfillment = attestationResult;
        } catch {
            revert AttestationNotFound(_fulfillment);
        }

        if (!escrow._checkIntrinsic()) revert InvalidEscrowAttestation();

        // Extract arbiter and demand from escrow data
        (address arbiter, bytes memory demand) = extractArbiterAndDemand(
            escrow.data
        );

        // Check fulfillment via the specified arbiter
        if (!IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid))
            revert InvalidFulfillment();

        // Revoke attestation
        try
            eas.revoke(
                RevocationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: RevocationRequestData({uid: _escrow, value: 0})
                })
            )
        {} catch {
            revert RevocationFailed(_escrow);
        }

        // Execute the escrow release
        bytes memory result = _releaseEscrow(
            escrow.data,
            fulfillment.recipient,
            _fulfillment
        );

        emit EscrowCollected(_escrow, _fulfillment, fulfillment.recipient);
        return result;
    }

    function reclaimExpired(bytes32 uid) public virtual returns (bool) {
        Attestation memory attestation;

        // Get attestation with error handling
        try eas.getAttestation(uid) returns (Attestation memory result) {
            attestation = result;
        } catch {
            revert AttestationNotFound(uid);
        }

        if (block.timestamp < attestation.expirationTime)
            revert UnauthorizedCall();

        // Return escrowed value to original recipient
        _returnEscrow(attestation.data, attestation.recipient);

        return true;
    }

    // Hook implementations
    function _beforeAttest(
        bytes calldata data,
        address payer,
        address /*recipient*/
    ) internal virtual override {
        _lockEscrow(data, payer);
    }

    // Hook implementations

    function _afterAttest(
        bytes32 uid,
        bytes calldata /*data*/,
        address /*payer*/,
        address recipient
    ) internal override {
        emit EscrowMade(uid, recipient);
    }
}
