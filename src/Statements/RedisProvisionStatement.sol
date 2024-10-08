// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseStatement} from "../BaseStatement.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract RedisProvisionStatement is BaseStatement, IArbiter {
    using ArbiterUtils for Attestation;

    struct StatementData {
        address user;
        uint256 capacity; // bytes
        uint64 expiration; // unix timestamp (seconds)
        string url;
    }

    struct DemandData {
        address user;
        uint256 capacity;
        uint256 expiration;
    }

    struct ChangeData {
        uint256 addedCapacity;
        uint64 addedDuration;
        string newUrl;
    }

    error InvalidResultAttestation();
    error InvalidDemand();
    error UnauthorizedCall();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseStatement(
            _eas,
            _schemaRegistry,
            "address user, uint256 size, uint64 duration, string url",
            true
        )
    {}

    function makeStatement(
        StatementData calldata data,
        bytes32 refUID
    ) public returns (bytes32) {
        return
            eas.attest(
                AttestationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: AttestationRequestData({
                        recipient: msg.sender,
                        expirationTime: data.expiration,
                        revocable: true,
                        refUID: refUID,
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

        statementData.expiration += changeData.addedDuration;
        statementData.capacity += changeData.addedCapacity;

        if (bytes(changeData.newUrl).length != 0) {
            statementData.url = changeData.newUrl;
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
                        expirationTime: statementData.expiration,
                        revocable: true,
                        refUID: statement.refUID,
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
        if (!statement._checkIntrinsic()) return false;

        DemandData memory demandData = abi.decode(demand, (DemandData));
        StatementData memory statementData = abi.decode(
            statement.data,
            (StatementData)
        );

        return
            demandData.user == statementData.user &&
            demandData.capacity <= statementData.capacity &&
            demandData.expiration <= statementData.expiration;
    }
}
