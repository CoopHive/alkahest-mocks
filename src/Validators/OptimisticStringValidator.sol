// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {
    IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData
} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IArbiter} from "../IArbiter.sol";
import {IValidator} from "../IValidator.sol";
import {StringResultStatement} from "../Statements/StringResultStatement.sol";

/**
 * @title OptimisticStringValidator
 * @dev A contract that implements an optimistic validator for string capitalization
 * using the Ethereum Attestation Service (EAS).
 */
contract OptimisticStringValidator is IValidator {
    /**
     * @dev Struct to hold validation data
     * @param query The original string query
     * @param mediationPeriod The time period allowed for mediation
     */
    struct ValidationData {
        string query;
        uint64 mediationPeriod;
    }

    /**
     * @dev Emitted when a new validation is started
     * @param validationUID The UID of the created validation
     * @param resultUID The UID of the result being validated
     * @param query The original string query
     */
    event ValidationStarted(bytes32 indexed validationUID, bytes32 indexed resultUID, string query);

    /**
     * @dev Emitted when mediation is requested
     * @param validationUID The UID of the validation
     * @param success_ Whether the mediation was successful
     */
    event MediationRequested(bytes32 indexed validationUID, bool success_);

    /// @dev Error thrown when the statement is invalid
    error InvalidStatement();
    /// @dev Error thrown when the validation is invalid
    error InvalidValidation();
    /// @dev Error thrown when the mediation period has expired
    error MediationPeriodExpired();

    /// @dev ABI schema for the validation data
    string public constant SCHEMA_ABI = "string query, uint64 mediationPeriod";
    /// @dev ABI schema for the demand data
    string public constant DEMAND_ABI = "string query, uint64 mediationPeriod";
    /// @dev Indicates whether the attestation is revocable
    bool public constant IS_REVOCABLE = true;

    /// @dev The StringResultStatement contract used for result verification
    StringResultStatement public immutable resultStatement;

    /**
     * @dev Constructor to initialize the OptimisticStringValidator contract
     * @param _eas Address of the EAS contract
     * @param _schemaRegistry Address of the schema registry contract
     * @param _baseStatement Address of the base StringResultStatement contract
     */
    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry, StringResultStatement _baseStatement)
        IValidator(_eas, _schemaRegistry, SCHEMA_ABI, IS_REVOCABLE)
    {
        resultStatement = _baseStatement;
    }

    /**
     * @dev Starts a new validation process
     * @param resultUID The UID of the result to validate
     * @param validationData The validation data
     * @return validationUID_ The UID of the created validation attestation
     */
    function startValidation(bytes32 resultUID, ValidationData calldata validationData)
        external
        returns (bytes32 validationUID_)
    {
        Attestation memory resultAttestation = eas.getAttestation(resultUID);
        if (resultAttestation.schema != resultStatement.ATTESTATION_SCHEMA()) revert InvalidStatement();
        if (resultAttestation.revocationTime != 0) revert InvalidStatement();
        if (resultAttestation.recipient != msg.sender) revert InvalidStatement();

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

    /**
     * @dev Initiates the mediation process for a validation
     * @param validationUID The UID of the validation to mediate
     * @return success_ Whether the mediation was successful
     */
    function mediate(bytes32 validationUID) external returns (bool success_) {
        Attestation memory validation = eas.getAttestation(validationUID);
        if (validation.schema != ATTESTATION_SCHEMA) revert InvalidValidation();

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

    /**
     * @dev Checks if a statement is valid according to the validation rules
     * @param statement The attestation to check
     * @param demand The encoded demand data
     * @param counteroffer The counteroffer UID
     * @return bool indicating whether the statement is valid
     */
    function checkStatement(Attestation memory statement, bytes memory demand, bytes32 counteroffer)
        public
        view
        override
        returns (bool)
    {
        if (!_checkIntrinsic(statement)) return false;

        ValidationData memory demandData = abi.decode(demand, (ValidationData));
        ValidationData memory statementData = abi.decode(statement.data, (ValidationData));

        if (keccak256(bytes(statementData.query)) != keccak256(bytes(demandData.query))) return false;
        if (statementData.mediationPeriod != demandData.mediationPeriod) return false;
        if (block.timestamp <= statement.time + statementData.mediationPeriod) return false;

        return resultStatement.checkStatement(
            eas.getAttestation(statement.refUID),
            abi.encode(StringResultStatement.DemandData({query: statementData.query})),
            counteroffer
        );
    }

    /**
     * @dev Checks if a string is properly capitalized
     * @param query The original string query
     * @param result The result string to check
     * @return bool indicating whether the result is properly capitalized
     */
    function _isCapitalized(string memory query, string memory result) internal pure returns (bool) {
        bytes memory queryBytes = bytes(query);
        bytes memory resultBytes = bytes(result);

        if (queryBytes.length != resultBytes.length) return false;

        for (uint256 i = 0; i < queryBytes.length; i++) {
            if (queryBytes[i] >= 0x61 && queryBytes[i] <= 0x7A) {
                // If lowercase, it should be capitalized in the result
                if (uint8(resultBytes[i]) != uint8(queryBytes[i]) - 32) return false;
            } else {
                // If not lowercase, it should remain the same
                if (resultBytes[i] != queryBytes[i]) return false;
            }
        }

        return true;
    }

    /**
     * @dev Returns the ABI schema for the validation data
     * @return string The ABI schema
     */
    function getSchemaAbi() public pure override returns (string memory) {
        return SCHEMA_ABI;
    }

    /**
     * @dev Returns the ABI schema for the demand data
     * @return string The ABI schema
     */
    function getDemandAbi() public pure override returns (string memory) {
        return DEMAND_ABI;
    }
}
