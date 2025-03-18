// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseStatement} from "../BaseStatement.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract AttestationEscrowObligation2 is BaseStatement, IArbiter {
    using ArbiterUtils for Attestation;

    bytes32 public immutable VALIDATION_SCHEMA;

    struct StatementData {
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
        BaseStatement(
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

    function makeStatementFor(
        StatementData calldata data,
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

    function makeStatement(
        StatementData calldata data,
        uint64 expirationTime
    ) public returns (bytes32 uid_) {
        return makeStatementFor(data, expirationTime, msg.sender);
    }

    function collectPayment(
        bytes32 _escrow,
        bytes32 _fulfillment
    ) public returns (bytes32) {
        Attestation memory escrow = eas.getAttestation(_escrow);
        Attestation memory fulfillment = eas.getAttestation(_fulfillment);

        if (!escrow._checkIntrinsic()) revert InvalidEscrowAttestation();

        StatementData memory escrowData = abi.decode(
            escrow.data,
            (StatementData)
        );

        if (
            !IArbiter(escrowData.arbiter).checkStatement(
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

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 /* counteroffer */
    ) public view override returns (bool) {
        if (!statement._checkIntrinsic(ATTESTATION_SCHEMA)) return false;

        StatementData memory escrow = abi.decode(
            statement.data,
            (StatementData)
        );
        StatementData memory demandData = abi.decode(demand, (StatementData));

        return
            escrow.attestationUid == demandData.attestationUid &&
            escrow.arbiter == demandData.arbiter &&
            keccak256(escrow.demand) == keccak256(demandData.demand);
    }

    function getStatementData(
        bytes32 uid
    ) public view returns (StatementData memory) {
        Attestation memory attestation = eas.getAttestation(uid);
        if (attestation.schema != ATTESTATION_SCHEMA)
            revert InvalidEscrowAttestation();
        return abi.decode(attestation.data, (StatementData));
    }

    function decodeStatementData(
        bytes calldata data
    ) public pure returns (StatementData memory) {
        return abi.decode(data, (StatementData));
    }
}
