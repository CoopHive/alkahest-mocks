// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {BaseEscrowObligation} from "../BaseEscrowObligation.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";
import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";

contract AttestationEscrowObligation2 is BaseEscrowObligation, IArbiter {
    using ArbiterUtils for Attestation;

    bytes32 public immutable VALIDATION_SCHEMA;

    struct ObligationData {
        address arbiter;
        bytes demand;
        bytes32 attestationUid; // Reference to the pre-made attestation
    }

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseEscrowObligation(
            _eas,
            _schemaRegistry,
            "address arbiter, bytes demand, bytes32 attestationUid",
            true
        )
    {
        // Register the validation schema
        VALIDATION_SCHEMA = _schemaRegistry.register(
            "bytes32 validatedAttestationUid",
            this,
            true
        );
    }

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

    // Create validation attestation
    function _releaseEscrow(
        bytes memory escrowData,
        address to,
        bytes32
    ) internal override returns (bytes memory) {
        ObligationData memory decoded = abi.decode(
            escrowData,
            (ObligationData)
        );

        // Create validation attestation
        bytes32 validationUid = eas.attest(
            AttestationRequest({
                schema: VALIDATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: to,
                    expirationTime: 0, // Permanent
                    revocable: false,
                    refUID: decoded.attestationUid,
                    data: abi.encode(decoded.attestationUid),
                    value: 0
                })
            })
        );

        return abi.encode(validationUid);
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
            escrow.attestationUid == demandData.attestationUid &&
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
