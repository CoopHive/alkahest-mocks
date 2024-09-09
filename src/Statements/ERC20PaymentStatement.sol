// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {
    IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData
} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";
import {IStatement} from "../IStatement.sol";
import {IArbiter} from "../IArbiter.sol";

/**
 * @title ERC20PaymentStatement
 * @dev A contract for managing ERC20 token payments with attestations.
 * This contract allows users to make statements about ERC20 token payments,
 * which can be collected upon fulfillment of certain conditions.
 */
contract ERC20PaymentStatement is IStatement {
    /**
     * @dev Struct to hold the data for a statement
     * @param token The address of the ERC20 token used for payment
     * @param amount The amount of tokens to be paid
     * @param arbiter The address of the arbiter who can validate fulfillments
     * @param demand The encoded demand data
     */
    struct StatementData {
        address token;
        uint256 amount;
        address arbiter;
        bytes demand;
    }

    // Custom errors
    error InvalidPayment();
    error InvalidPaymentAttestation();
    error InvalidFulfillment();
    error UnauthorizedCall();

    // Constants
    string public constant SCHEMA_ABI = "address token, uint256 amount, address arbiter, bytes demand";
    string public constant DEMAND_ABI = "address token, uint256 amount, address arbiter, bytes demand";
    bool public constant IS_REVOCABLE = true;

    /**
     * @dev Constructor to initialize the contract
     * @param _eas The address of the EAS (Ethereum Attestation Service) contract
     * @param _schemaRegistry The address of the schema registry contract
     */
    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        IStatement(_eas, _schemaRegistry, SCHEMA_ABI, IS_REVOCABLE)
    {}

    /**
     * @dev Makes a new statement (payment)
     * @param data The statement data
     * @param expirationTime The expiration time for the attestation
     * @param refUID The reference UID for the attestation
     * @return The UID of the created attestation
     */
    function makeStatement(StatementData calldata data, uint64 expirationTime, bytes32 refUID)
        public
        returns (bytes32)
    {
        if (!IERC20(data.token).transferFrom(msg.sender, address(this), data.amount)) revert InvalidPayment();

        return eas.attest(
            AttestationRequest({
                schema: ATTESTATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: msg.sender,
                    expirationTime: expirationTime,
                    revocable: true,
                    refUID: refUID,
                    data: abi.encode(data),
                    value: 0
                })
            })
        );
    }

    /**
     * @dev Collects the payment based on a fulfillment
     * @param _payment The UID of the payment attestation
     * @param _fulfillment The UID of the fulfillment attestation
     * @return A boolean indicating whether the payment was successfully collected
     */
    function collectPayment(bytes32 _payment, bytes32 _fulfillment) public returns (bool) {
        Attestation memory payment = eas.getAttestation(_payment);
        Attestation memory fulfillment = eas.getAttestation(_fulfillment);

        if (!_checkIntrinsic(payment)) revert InvalidPaymentAttestation();

        StatementData memory paymentData = abi.decode(payment.data, (StatementData));

        // Check if the fulfillment is valid
        if (!_isValidFulfillment(payment, fulfillment, paymentData)) revert InvalidFulfillment();

        eas.revoke(
            RevocationRequest({schema: ATTESTATION_SCHEMA, data: RevocationRequestData({uid: _payment, value: 0})})
        );
        return IERC20(paymentData.token).transfer(fulfillment.recipient, paymentData.amount);
    }

    /**
     * @dev Cancels a statement and returns the tokens to the original sender
     * @param uid The UID of the attestation to cancel
     * @return A boolean indicating whether the cancellation was successful
     */
    function cancelStatement(bytes32 uid) public returns (bool) {
        Attestation memory attestation = eas.getAttestation(uid);
        if (msg.sender != attestation.recipient) revert UnauthorizedCall();

        eas.revoke(RevocationRequest({schema: ATTESTATION_SCHEMA, data: RevocationRequestData({uid: uid, value: 0})}));

        StatementData memory data = abi.decode(attestation.data, (StatementData));
        return IERC20(data.token).transfer(msg.sender, data.amount);
    }

    /**
     * @dev Checks if a statement meets the requirements of a demand
     * @param statement The attestation of the statement to check
     * @param demand The encoded demand data
     * @return A boolean indicating whether the statement meets the demand
     */
    function checkStatement(Attestation memory statement, bytes memory demand, bytes32 /* counteroffer */ )
        public
        view
        override
        returns (bool)
    {
        if (!_checkIntrinsic(statement)) return false;

        StatementData memory payment = abi.decode(statement.data, (StatementData));
        StatementData memory demandData = abi.decode(demand, (StatementData));

        return payment.token == demandData.token && payment.amount >= demandData.amount
            && payment.arbiter == demandData.arbiter && keccak256(payment.demand) == keccak256(demandData.demand);
    }

    /**
     * @dev Checks if a fulfillment is valid for a given payment
     * @param payment The payment attestation
     * @param fulfillment The fulfillment attestation
     * @param paymentData The decoded payment data
     * @return A boolean indicating whether the fulfillment is valid
     */
    function _isValidFulfillment(
        Attestation memory payment,
        Attestation memory fulfillment,
        StatementData memory paymentData
    ) internal view returns (bool) {
        // Special case: If the payment references this fulfillment, consider it valid
        if (payment.refUID == fulfillment.uid) return true;

        // Regular case: check using the arbiter
        return IArbiter(paymentData.arbiter).checkStatement(fulfillment, paymentData.demand, payment.uid);
    }

    /**
     * @dev Returns the ABI of the schema used for statements
     * @return A string containing the schema ABI
     */
    function getSchemaAbi() public pure override returns (string memory) {
        return SCHEMA_ABI;
    }

    /**
     * @dev Returns the ABI of the demand format
     * @return A string containing the demand ABI
     */
    function getDemandAbi() public pure override returns (string memory) {
        return DEMAND_ABI;
    }
}
