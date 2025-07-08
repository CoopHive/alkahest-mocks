// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseObligation} from "../BaseObligation.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract AttestationEscrowObligation2 is BaseObligation, IArbiter {
    using ArbiterUtils for Attestation;

    bytes32 public immutable VALIDATION_SCHEMA;

    struct ObligationData {
        address arbiter;
        bytes demand;
        bytes32 attestationUid; // Reference to the pre-made attestation
    }

    event EscrowMade(bytes32 indexed payment, address indexed buyer);
    event EscrowClaimed(
        bytes32 indexed payment,
        bytes32 indexed fulfillment,
        address indexed fulfiller
    );

    error InvalidEscrowAttestation();
    error InvalidFulfillment();
    error UnauthorizedCall();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseObligation(
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

    function doObligationFor(
        ObligationData calldata data,
        uint64 expirationTime,
        address recipient
    ) public returns (bytes32 uid_) {
        uid_ = eas.attest(
            AttestationRequest({
                schema: ATTESTATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: recipient,
                    expirationTime: expirationTime,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode(data),
                    value: 0
                })
            })
        );
        emit EscrowMade(uid_, recipient);
    }

    function doObligation(
        ObligationData calldata data,
        uint64 expirationTime
    ) public returns (bytes32 uid_) {
        return doObligationFor(data, expirationTime, msg.sender);
    }

    function collectEscrow(
        bytes32 _escrow,
        bytes32 _fulfillment
    ) public returns (bytes32) {
        Attestation memory escrow = eas.getAttestation(_escrow);
        Attestation memory fulfillment = eas.getAttestation(_fulfillment);

        if (!escrow._checkIntrinsic()) revert InvalidEscrowAttestation();

        ObligationData memory escrowData = abi.decode(
            escrow.data,
            (ObligationData)
        );

        if (
            !IArbiter(escrowData.arbiter).checkObligation(
                fulfillment,
                escrowData.demand,
                escrow.uid
            )
        ) revert InvalidFulfillment();

        // Revoke the escrow attestation
        eas.revoke(
            RevocationRequest({
                schema: ATTESTATION_SCHEMA,
                data: RevocationRequestData({uid: _escrow, value: 0})
            })
        );

        // Create validation attestation
        bytes32 validationUid = eas.attest(
            AttestationRequest({
                schema: VALIDATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: fulfillment.recipient,
                    expirationTime: 0, // Permanent
                    revocable: false,
                    refUID: escrowData.attestationUid,
                    data: abi.encode(escrowData.attestationUid),
                    value: 0
                })
            })
        );

        emit EscrowClaimed(_escrow, _fulfillment, fulfillment.recipient);
        return validationUid;
    }

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

    function getObligationData(
        bytes32 uid
    ) public view returns (ObligationData memory) {
        Attestation memory attestation = eas.getAttestation(uid);
        if (attestation.schema != ATTESTATION_SCHEMA)
            revert InvalidEscrowAttestation();
        return abi.decode(attestation.data, (ObligationData));
    }

    function decodeObligationData(
        bytes calldata data
    ) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
