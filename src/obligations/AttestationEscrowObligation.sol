// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {BaseEscrowObligation} from "../BaseEscrowObligation.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";
import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";

contract AttestationEscrowObligation is BaseEscrowObligation, IArbiter {
    using ArbiterUtils for Attestation;

    struct ObligationData {
        address arbiter;
        bytes demand;
        AttestationRequest attestation;
    }

    error AttestationCreationFailed();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseEscrowObligation(
            _eas,
            _schemaRegistry,
            "address arbiter, bytes demand, tuple(bytes32 schema, tuple(address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data) attestation",
            true
        )
    {}

    // Extract arbiter and demand from encoded data
    function extractArbiterAndDemand(
        bytes memory data
    ) public pure override returns (address arbiter, bytes memory demand) {
        ObligationData memory decoded = abi.decode(data, (ObligationData));
        return (decoded.arbiter, decoded.demand);
    }

    // No assets to lock for attestation escrows
    function _lockEscrow(bytes memory, address) internal override {
        // No-op: attestations don't require locking assets
    }

    // Create the escrowed attestation
    function _releaseEscrow(
        bytes memory escrowData,
        address,
        bytes32
    ) internal override returns (bytes memory) {
        ObligationData memory decoded = abi.decode(
            escrowData,
            (ObligationData)
        );

        bytes32 attestationUid;
        try eas.attest(decoded.attestation) returns (bytes32 uid) {
            attestationUid = uid;
        } catch {
            revert AttestationCreationFailed();
        }

        return abi.encode(attestationUid);
    }

    // No assets to return for attestation escrows
    function _returnEscrow(bytes memory, address) internal override {
        // No-op: attestations don't require returning assets
    }

    // Implement IArbiter
    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 /* counteroffer */
    ) public view override returns (bool) {
        if (!obligation._checkIntrinsic(ATTESTATION_SCHEMA)) return false;

        ObligationData memory escrow = abi.decode(
            obligation.data,
            (ObligationData)
        );
        ObligationData memory demandData = abi.decode(demand, (ObligationData));

        return
            keccak256(abi.encode(escrow.attestation)) ==
            keccak256(abi.encode(demandData.attestation)) &&
            escrow.arbiter == demandData.arbiter &&
            keccak256(escrow.demand) == keccak256(demandData.demand);
    }

    // Typed convenience methods
    function doObligation(
        ObligationData calldata data,
        uint64 expirationTime
    ) external returns (bytes32) {
        return
            this.doObligationForRaw(
                abi.encode(data),
                expirationTime,
                msg.sender,
                msg.sender,
                bytes32(0)
            );
    }

    function doObligationFor(
        ObligationData calldata data,
        uint64 expirationTime,
        address recipient
    ) external returns (bytes32) {
        return
            this.doObligationForRaw(
                abi.encode(data),
                expirationTime,
                msg.sender,
                recipient,
                bytes32(0)
            );
    }

    function collectEscrow(
        bytes32 escrow,
        bytes32 fulfillment
    ) external returns (bytes32) {
        bytes memory result = collectEscrowRaw(escrow, fulfillment);
        return abi.decode(result, (bytes32));
    }

    function getObligationData(
        bytes32 uid
    ) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    function decodeObligationData(
        bytes calldata data
    ) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
