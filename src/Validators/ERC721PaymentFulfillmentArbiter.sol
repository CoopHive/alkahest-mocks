// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {ERC721PaymentObligation} from "../Statements/ERC721PaymentObligation.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

/**
 * @title ERC721PaymentFulfillmentArbiter
 * @dev Arbiter contract to check the validity of ERC721 token payments.
 * This contract checks if an ERC721 token payment meets the required demand and conditions.
 */
contract ERC721PaymentFulfillmentArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    struct DemandData {
        address token; // Address of the ERC721 token contract
        uint256 tokenId; // ID of the specific token being transferred
    }

    // Custom errors for invalid scenarios
    error InvalidStatement();
    error InvalidValidation();

    // Reference to the ERC721PaymentObligation contract
    ERC721PaymentObligation public immutable paymentObligation;

    /**
     * @dev Constructor to set the payment obligation contract
     * @param _baseObligation The ERC721PaymentObligation contract that handles payment obligations
     */
    constructor(ERC721PaymentObligation _baseObligation) {
        paymentObligation = _baseObligation;
    }

        /**
     * @dev Checks if a given ERC721 payment statement meets the specified demand and conditions
     * @param statement The attestation of the statement being checked
     * @param demand Encoded demand data (token contract address, token ID)
     * @param counteroffer The reference UID for the counteroffer
     * @return True if the statement is valid and fulfills the demand, false otherwise
     */
    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 counteroffer
    ) public view override returns (bool) {
        // Decode the demand data (ERC721 token contract and token ID)
        DemandData memory validationData = abi.decode(demand, (DemandData));

        // Check if the statement schema matches the expected attestation schema
        if (statement.schema != paymentObligation.ATTESTATION_SCHEMA()) {
            revert InvalidStatement();
        }

        // Check if the statement has expired or is invalid
        if (statement._checkExpired()) {
            revert InvalidStatement();
        }

        // Ensure the reference UID in the statement matches the counteroffer reference
        if (statement.refUID != counteroffer) {
            revert InvalidValidation();
        }

        // Decode the statement data from the payment obligation
        ERC721PaymentObligation.StatementData memory statementData =
            abi.decode(statement.data, (ERC721PaymentObligation.StatementData));

        // Check if the token address and token ID match between the statement and the demand
        if (statementData.token != validationData.token) {
            revert InvalidValidation();
        }
        if (statementData.tokenId != validationData.tokenId) {
            revert InvalidValidation();
        }

        return true; // Return true if all checks pass
    }
}