// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseStatement} from "../BaseStatement.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract StringResultStatement is BaseStatement, IArbiter {
    using ArbiterUtils for Attestation;

    struct StatementData {
        address user;
        uint256 size;
        uint64 duration;
        string url;
    }

    struct DemandData {
        address user;
        uint256 size;
        uint256 duration;
    }

    struct ChangeData {
        uint256 addedSize;
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
            "address user, uint256 size, uint256 duration, string url",
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
                        expirationTime: uint64(block.timestamp) + data.duration,
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

        if (statementData.user != msg.sender) revert UnauthorizedCall();

        statementData.duration += changeData.addedDuration;
        statementData.size += changeData.addedSize;

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
                        expirationTime: statement.expirationTime -
                            uint64(block.timestamp) +
                            changeData.addedDuration,
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
            demandData.size == statementData.size &&
            demandData.duration == statementData.duration;
    }
}
