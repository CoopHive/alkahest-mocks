// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IValidator} from "../IValidator.sol";
import {ERC20PaymentStatement} from "../Statements/ERC20PaymentStatement.sol";

/**
 * @title ERC20PaymentFulfillmentValidator
 * @dev A contract for validating ERC20 payment fulfillments using the Ethereum Attestation Service (EAS).
 * This contract implements the IValidator interface.
 */
contract ERC20PaymentFulfillmentValidator is IValidator {
    /**
     * @dev Struct to hold the validation data
     * @param token The address of the ERC20 token
     * @param amount The amount of tokens
     * @param fulfilling The UID of the attestation being fulfilled
     */
    struct ValidationData {
        address token;
        uint256 amount;
        bytes32 fulfilling;
    }

    /**
     * @dev Struct to hold the demand data
     * @param token The address of the ERC20 token
     * @param amount The amount of tokens
     */
    struct DemandData {
        address token;
        uint256 amount;
    }

    // Event declarations
    event ValidationCreated(bytes32 indexed validationUID, bytes32 indexed paymentUID);

    // Error declarations
    error InvalidStatement();
    error InvalidValidation();

    // Constants
    string public constant SCHEMA_ABI = "address token, uint256 amount, bytes32 fulfilling";
    string public constant DEMAND_ABI = "address token, uint256 amount";
    bool public constant IS_REVOCABLE = true;

    ERC20PaymentStatement public immutable paymentStatement;

    /**
     * @dev Constructor to initialize the ERC20PaymentFulfillmentValidator contract
     * @param _eas The address of the EAS contract
     * @param _schemaRegistry The address of the schema registry contract
     * @param _baseStatement The address of the ERC20PaymentStatement contract
     */
    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry, ERC20PaymentStatement _baseStatement)
        IValidator(_eas, _schemaRegistry, SCHEMA_ABI, IS_REVOCABLE)
    {
        paymentStatement = _baseStatement;
    }

    /**
     * @dev Function to create a validation attestation
     * @param paymentUID The UID of the payment attestation
     * @param validationData The ValidationData struct containing the validation details
     * @return validationUID The UID of the created validation attestation
     */
    function createValidation(bytes32 paymentUID, ValidationData calldata validationData)
        external
        returns (bytes32 validationUID)
    {
        Attestation memory paymentAttestation = eas.getAttestation(paymentUID);
        if (paymentAttestation.schema != paymentStatement.ATTESTATION_SCHEMA()) revert InvalidStatement();
        if (paymentAttestation.revocationTime != 0) revert InvalidStatement();
        if (paymentAttestation.recipient != msg.sender) revert InvalidStatement();

        if (paymentAttestation.refUID != validationData.fulfilling) revert InvalidValidation();

        if (
            !paymentStatement.checkStatement(
                paymentAttestation,
                abi.encode(
                    ERC20PaymentStatement.StatementData({
                        token: validationData.token,
                        amount: validationData.amount,
                        arbiter: address(0),
                        demand: ""
                    })
                ),
                0
            )
        ) revert InvalidStatement();

        validationUID = eas.attest(
            AttestationRequest({
                schema: ATTESTATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: msg.sender,
                    expirationTime: paymentAttestation.expirationTime,
                    revocable: paymentAttestation.revocable,
                    refUID: paymentUID,
                    data: abi.encode(validationData),
                    value: 0
                })
            })
        );

        emit ValidationCreated(validationUID, paymentUID);
    }

    /**
     * @dev Function to check if a statement meets the specified demand
     * @param statement The Attestation struct of the statement to be checked
     * @param demand The encoded demand data to check against
     * @param counteroffer The UID of the counteroffer attestation
     * @return A boolean indicating whether the statement meets the demand
     */
    function checkStatement(Attestation memory statement, bytes memory demand, bytes32 counteroffer)
        public
        view
        override
        returns (bool)
    {
        if (!_checkIntrinsic(statement)) return false;

        ValidationData memory validationData = abi.decode(statement.data, (ValidationData));
        DemandData memory demandData = abi.decode(demand, (DemandData));

        return validationData.fulfilling == counteroffer && validationData.token == demandData.token
            && validationData.amount >= demandData.amount;
    }

    /**
     * @dev Function to get the schema ABI
     * @return The schema ABI as a string
     */
    function getSchemaAbi() public pure override returns (string memory) {
        return SCHEMA_ABI;
    }

    /**
     * @dev Function to get the demand ABI
     * @return The demand ABI as a string
     */
    function getDemandAbi() public pure override returns (string memory) {
        return DEMAND_ABI;
    }
}
