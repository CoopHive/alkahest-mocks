// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IArbiter} from "../IArbiter.sol";
import {IStatement} from "../IStatement.sol";
import {StringResultStatement} from "../Statements/StringResultStatement.sol";

contract OptimisticStringValidator is IStatement, IArbiter {
    struct ValidationData {
        string query;
        uint64 mediationPeriod;
    }

    event ValidationStarted(
        bytes32 indexed validationUID,
        bytes32 indexed resultUID,
        string query
    );
    event MediationRequested(bytes32 indexed validationUID, bool success_);

    error InvalidStatement();
    error InvalidValidation();
    error MediationPeriodExpired();

    StringResultStatement public immutable resultStatement;

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry,
        StringResultStatement _baseStatement
    )
        IStatement(
            _eas,
            _schemaRegistry,
            "string query, uint64 mediationPeriod",
            true
        )
    {
        resultStatement = _baseStatement;
    }

    function startValidation(
        bytes32 resultUID,
        ValidationData calldata validationData
    ) external returns (bytes32 validationUID_) {
        Attestation memory resultAttestation = eas.getAttestation(resultUID);
        if (resultAttestation.schema != resultStatement.ATTESTATION_SCHEMA())
            revert InvalidStatement();
        if (resultAttestation.revocationTime != 0) revert InvalidStatement();
        if (resultAttestation.recipient != msg.sender)
            revert InvalidStatement();

        validationUID_ = eas.attest(
            AttestationRequest({
                schema: ATTESTATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: msg.sender,
                    expirationTime: 0,
                    revocable: true,
                    refUID: resultUID,
                    data: abi.encode(validationData),
                    value: 0
                })
            })
        );
        emit ValidationStarted(validationUID_, resultUID, validationData.query);
    }

    function mediate(bytes32 validationUID) external returns (bool success_) {
        Attestation memory validation = eas.getAttestation(validationUID);
        if (validation.schema != ATTESTATION_SCHEMA) revert InvalidValidation();

        ValidationData memory data = abi.decode(
            validation.data,
            (ValidationData)
        );
        if (block.timestamp > validation.time + data.mediationPeriod)
            revert MediationPeriodExpired();

        Attestation memory resultAttestation = eas.getAttestation(
            validation.refUID
        );
        StringResultStatement.StatementData memory resultData = abi.decode(
            resultAttestation.data,
            (StringResultStatement.StatementData)
        );
        success_ = _isCapitalized(data.query, resultData.result);

        if (!success_) {
            eas.revoke(
                RevocationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: RevocationRequestData({uid: validationUID, value: 0})
                })
            );
        }

        emit MediationRequested(validationUID, success_);
    }

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 counteroffer
    ) public view override returns (bool) {
        if (!_checkIntrinsic(statement)) return false;

        ValidationData memory demandData = abi.decode(demand, (ValidationData));
        ValidationData memory statementData = abi.decode(
            statement.data,
            (ValidationData)
        );

        if (
            keccak256(bytes(statementData.query)) !=
            keccak256(bytes(demandData.query))
        ) return false;
        if (statementData.mediationPeriod != demandData.mediationPeriod)
            return false;
        if (block.timestamp <= statement.time + statementData.mediationPeriod)
            return false;

        return
            resultStatement.checkStatement(
                eas.getAttestation(statement.refUID),
                abi.encode(
                    StringResultStatement.DemandData({
                        query: statementData.query
                    })
                ),
                counteroffer
            );
    }

    function _isCapitalized(
        string memory query,
        string memory result
    ) internal pure returns (bool) {
        bytes memory queryBytes = bytes(query);
        bytes memory resultBytes = bytes(result);

        if (queryBytes.length != resultBytes.length) return false;

        for (uint256 i = 0; i < queryBytes.length; i++) {
            if (queryBytes[i] >= 0x61 && queryBytes[i] <= 0x7A) {
                // If lowercase, it should be capitalized in the result
                if (uint8(resultBytes[i]) != uint8(queryBytes[i]) - 32)
                    return false;
            } else {
                // If not lowercase, it should remain the same
                if (resultBytes[i] != queryBytes[i]) return false;
            }
        }

        return true;
    }
}
