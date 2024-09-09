// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IValidator} from "../IValidator.sol";
import {ERC20PaymentStatement} from "../Statements/ERC20PaymentStatement.sol";

/**
 * @title TrustedPartyValidator
 * @dev A contract that implements a trusted party validator system for attestations
 * using the Ethereum Attestation Service (EAS).
 */
contract TrustedPartyValidator is IValidator {
    /**
     * @dev Struct to hold validation data
     * @param statement Address of the statement contract
     * @param creator Address of the creator
     */
    struct ValidationData {
        address statement;
        address creator;
    }

    /**
     * @dev Emitted when a new validation is created
     * @param validationUID The UID of the created validation
     * @param statementUID The UID of the statement being validated
     */
    event ValidationCreated(bytes32 indexed validationUID, bytes32 indexed statementUID);

    /// @dev Error thrown when the statement is invalid
    error InvalidStatement();
    /// @dev Error thrown when the validation is invalid
    error InvalidValidation();

    /// @dev ABI schema for the validation data
    string public constant SCHEMA_ABI = "address statement, address creator";
    /// @dev ABI schema for the demand data
    string public constant DEMAND_ABI = "address statement, address creator";
    /// @dev Indicates whether the attestation is revocable
    bool public constant IS_REVOCABLE = false;

    /**
     * @dev Constructor to initialize the TrustedPartyValidator contract
     * @param _eas Address of the EAS contract
     * @param _schemaRegistry Address of the schema registry contract
     * @param _baseStatement Address of the base ERC20PaymentStatement contract
     */
    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry, ERC20PaymentStatement _baseStatement)
        IValidator(_eas, _schemaRegistry, SCHEMA_ABI, IS_REVOCABLE)
    {}

    /**
     * @dev Creates a new validation attestation
     * @param statementUID The UID of the statement to validate
     * @param validationData The validation data
     * @return validationUID The UID of the created validation attestation
     */
    function createValidation(bytes32 statementUID, ValidationData calldata validationData)
        external
        returns (bytes32 validationUID)
    {
        Attestation memory statement = eas.getAttestation(statementUID);

        if (statement.revocationTime != 0) revert InvalidStatement();
        if (statement.recipient != msg.sender) revert InvalidStatement();

        if (statement.attester != validationData.statement) revert InvalidValidation();
        if (statement.recipient != validationData.creator) revert InvalidValidation();

        validationUID = eas.attest(
            AttestationRequest({
                schema: ATTESTATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: msg.sender,
                    expirationTime: statement.expirationTime,
                    revocable: false,
                    refUID: statementUID,
                    data: abi.encode(validationData),
                    value: 0
                })
            })
        );
        emit ValidationCreated(validationUID, statementUID);
    }

    /**
     * @dev Checks if a statement is valid according to the validation rules
     * @param statement The attestation to check
     * @param demand The encoded demand data
     * @return bool indicating whether the statement is valid
     */
    function checkStatement(Attestation memory statement, bytes memory demand, bytes32 /* counteroffer */ )
        public
        view
        override
        returns (bool)
    {
        if (!_checkIntrinsic(statement)) return false;

        ValidationData memory statement_ = abi.decode(statement.data, (ValidationData));
        ValidationData memory demand_ = abi.decode(demand, (ValidationData));

        return statement_.statement == demand_.statement && statement_.creator == demand_.creator;
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
