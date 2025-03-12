// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseStatement} from "../../BaseStatement.sol";
import {IArbiter} from "../../IArbiter.sol";
import {ArbiterUtils} from "../../ArbiterUtils.sol";

contract RedisProvisionObligation is BaseStatement, IArbiter {
    using ArbiterUtils for Attestation;

    struct StatementData {
        address user;
        uint256 capacity; // bytes
        uint256 egress; // bytes
        uint256 cpus; // cores
        string serverName;
        string url;
    }

    struct DemandData {
        bytes32 replaces;
        address user;
        uint256 capacity;
        uint256 egress;
        uint256 cpus;
        uint64 expiration;
        string serverName;
    }

    struct ChangeData {
        uint256 addedCapacity;
        uint256 addedEgress;
        uint256 addedCpus;
        uint64 addedDuration;
        string newServerName;
        string newUrl;
    }

    error UnauthorizedCall();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseStatement(
            _eas,
            _schemaRegistry,
            "address user, uint256 capacity, uint256 egress, uint256 cpus, string memory serverName, string memory url",
            true
        )
    {}

    function makeStatement(
        StatementData calldata data,
        uint64 expirationTime
    ) public returns (bytes32) {
        return
            eas.attest(
                AttestationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: AttestationRequestData({
                        recipient: msg.sender,
                        expirationTime: expirationTime,
                        revocable: true,
                        refUID: 0,
                        data: abi.encode(data),
                        value: 0
                    })
                })
            );
    }

    function reviseStatement(
        bytes32 statementUID,
        ChangeData calldata changeData
    ) public returns (bytes32) {
        Attestation memory statement = eas.getAttestation(statementUID);
        StatementData memory statementData = abi.decode(
            statement.data,
            (StatementData)
        );

        if (statement.recipient != msg.sender) revert UnauthorizedCall();

        statement.expirationTime += changeData.addedDuration;
        statementData.capacity += changeData.addedCapacity;
        statementData.egress += changeData.addedEgress;
        statementData.cpus += changeData.addedCpus;

        if (bytes(changeData.newUrl).length != 0) {
            statementData.url = changeData.newUrl;
        }

        if (bytes(changeData.newServerName).length != 0) {
            statementData.serverName = changeData.newServerName;
        }

        eas.revoke(
            RevocationRequest({
                schema: ATTESTATION_SCHEMA,
                data: RevocationRequestData({uid: statementUID, value: 0})
            })
        );

        return
            eas.attest(
                AttestationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: AttestationRequestData({
                        recipient: msg.sender,
                        expirationTime: statement.expirationTime,
                        revocable: true,
                        refUID: statementUID,
                        data: abi.encode(statementData),
                        value: 0
                    })
                })
            );
    }

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 /* counteroffer */
    ) public view override returns (bool) {
        if (!statement._checkIntrinsic(ATTESTATION_SCHEMA)) return false;

        DemandData memory demandData = abi.decode(demand, (DemandData));
        StatementData memory statementData = abi.decode(
            statement.data,
            (StatementData)
        );

        return
            demandData.replaces == statement.refUID &&
            demandData.expiration <= statement.expirationTime &&
            demandData.user == statementData.user &&
            demandData.capacity <= statementData.capacity &&
            demandData.egress <= statementData.egress &&
            demandData.cpus <= statementData.cpus &&
            keccak256(bytes(demandData.serverName)) ==
            keccak256(bytes(statementData.serverName));
    }
}
