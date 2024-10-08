// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseStatement} from "../BaseStatement.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract RedisEgressObligation is BaseStatement, IArbiter {
    using ArbiterUtils for Attestation;

    struct StatementData {
        uint256 egressBytes;
    }

    struct DemandData {
        bytes32 provisionStatement;
        uint256 egressBytes;
    }

    error UnauthorizedCall();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    ) BaseStatement(_eas, _schemaRegistry, "uint256 egressBytes", false) {}

    function makeStatement(
        StatementData calldata data,
        bytes32 provisionStatement
    ) public returns (bytes32) {
        Attestation memory provisionStatement_ = eas.getAttestation(
            provisionStatement
        );

        if (msg.sender != provisionStatement_.recipient)
            revert UnauthorizedCall();

        return
            eas.attest(
                AttestationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: AttestationRequestData({
                        recipient: msg.sender,
                        expirationTime: provisionStatement_.expirationTime,
                        revocable: false,
                        refUID: provisionStatement,
                        data: abi.encode(data),
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

        StatementData memory data_ = abi.decode(
            statement.data,
            (StatementData)
        );
        DemandData memory demand_ = abi.decode(demand, (DemandData));

        return
            statement.refUID == demand_.provisionStatement &&
            data_.egressBytes >= demand_.egressBytes;
    }
}
