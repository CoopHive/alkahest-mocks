// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseStatement} from "../BaseStatement.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract AttestationEscrowObligation is BaseStatement, IArbiter {
    using ArbiterUtils for Attestation;

    struct StatementData {
        AttestationRequest attestation;
        address arbiter;
        bytes demand;
    }

    event EscrowCreated(bytes32 indexed escrow, address indexed buyer);
    event AttestationClaimed(
        bytes32 indexed escrow,
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
            "tuple(bytes32 schema, tuple(address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data) attestation, address arbiter, bytes demand",
            true
        )
    {}

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
        emit EscrowCreated(uid_, recipient);
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

        eas.revoke(
            RevocationRequest({
                schema: ATTESTATION_SCHEMA,
                data: RevocationRequestData({uid: _escrow, value: 0})
            })
        );

        bytes32 attestationUid = eas.attest(escrowData.attestation);
        emit AttestationClaimed(_escrow, _fulfillment, fulfillment.recipient);
        return attestationUid;
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
            keccak256(abi.encode(escrow.attestation)) ==
            keccak256(abi.encode(demandData.attestation)) &&
            escrow.arbiter == demandData.arbiter &&
            keccak256(escrow.demand) == keccak256(demandData.demand);
    }
}
