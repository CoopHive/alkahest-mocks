// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {
    IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData
} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IStatement} from "./IStatement.sol";
import {IArbiter} from "./IArbiter.sol";
import {StringResultStatement} from "./StringResultStatement.sol";

contract OptimisticStringValidator is IStatement {
    struct ValidationData {
        string query;
        uint64 mediationPeriod;
    }

    event ValidationStarted(bytes32 indexed validationUID, bytes32 indexed resultUID, string query);
    event MediationRequested(bytes32 indexed validationUID, bool success_);

    error InvalidValidationSchema();
    error MediationPeriodExpired();
    error InvalidStatementSchema();
    error StatementRevoked();
    error QueryMismatch();
    error MediationPeriodMismatch();

    string public constant SCHEMA_ABI = "string query, uint64 mediationPeriod";
    string public constant DEMAND_ABI = "string query, uint64 mediationPeriod";
    bool public constant IS_REVOCABLE = true;

    address public immutable BASE_STATEMENT;

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry, address _baseStatement)
        IStatement(_eas, _schemaRegistry, SCHEMA_ABI, IS_REVOCABLE)
    {
        BASE_STATEMENT = _baseStatement;
    }

    function startValidation(bytes32 resultUID, ValidationData calldata validationData)
        external
        returns (bytes32 validationUID_)
    {
        validationUID_ = eas.attest(
            AttestationRequest({
                schema: ATTESTATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: msg.sender,
                    expirationTime: uint64(block.timestamp) + validationData.mediationPeriod,
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
        if (validation.schema != ATTESTATION_SCHEMA) revert InvalidValidationSchema();

        ValidationData memory data = abi.decode(validation.data, (ValidationData));
        if (block.timestamp > validation.time + data.mediationPeriod) revert MediationPeriodExpired();

        Attestation memory resultAttestation = eas.getAttestation(validation.refUID);
        StringResultStatement.StatementData memory resultData =
            abi.decode(resultAttestation.data, (StringResultStatement.StatementData));
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

    function checkStatement(Attestation memory statement, bytes memory demand, bytes32 counteroffer)
        public
        view
        override
        returns (bool)
    {
        if (statement.schema != ATTESTATION_SCHEMA) revert InvalidStatementSchema();
        if (statement.revocationTime != 0) revert StatementRevoked();

        ValidationData memory demandData = abi.decode(demand, (ValidationData));
        ValidationData memory statementData = abi.decode(statement.data, (ValidationData));

        if (keccak256(bytes(statementData.query)) != keccak256(bytes(demandData.query))) revert QueryMismatch();
        if (statementData.mediationPeriod != demandData.mediationPeriod) revert MediationPeriodMismatch();

        if (block.timestamp <= statement.time + statementData.mediationPeriod) {
            return false;
        }

        return IArbiter(BASE_STATEMENT).checkStatement(
            eas.getAttestation(statement.refUID),
            abi.encode(StringResultStatement.DemandData({query: statementData.query})),
            counteroffer
        );
    }

    function _isCapitalized(string memory query, string memory result) internal pure returns (bool) {
        bytes memory queryBytes = bytes(query);
        bytes memory resultBytes = bytes(result);

        if (queryBytes.length != resultBytes.length) {
            return false;
        }

        for (uint256 i = 0; i < queryBytes.length; i++) {
            if (queryBytes[i] >= 0x61 && queryBytes[i] <= 0x7A) {
                // If lowercase, it should be capitalized in the result
                if (uint8(resultBytes[i]) != uint8(queryBytes[i]) - 32) {
                    return false;
                }
            } else {
                // If not lowercase, it should remain the same
                if (resultBytes[i] != queryBytes[i]) {
                    return false;
                }
            }
        }

        return true;
    }

    function getSchemaAbi() public pure override returns (string memory) {
        return SCHEMA_ABI;
    }

    function getDemandAbi() public pure override returns (string memory) {
        return DEMAND_ABI;
    }
}
