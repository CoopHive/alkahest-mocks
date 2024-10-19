// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {BundlePaymentObligation} from "../Statements/BundlePaymentObligation.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract BundlePaymentFulfillmentArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    struct DemandData {
        address[] erc20Addresses;
        uint256[] erc20Amounts;
        address[] erc721Addresses;
        uint256[] erc721Ids;
    }

    error InvalidStatement();
    error InvalidValidation();

    BundlePaymentObligation public immutable paymentObligation;

    constructor(BundlePaymentObligation _paymentObligation) {
        paymentObligation = _paymentObligation;
    }

    function checkStatement(Attestation memory statement, bytes memory demand, bytes32 counteroffer)
        public
        view
        override
        returns (bool)
    {
        // Decode the demand into DemandData
        DemandData memory validationData = abi.decode(demand, (DemandData));

        if (statement.schema != paymentObligation.ATTESTATION_SCHEMA()) {
            revert InvalidStatement();
        }
        if (statement._checkExpired()) revert InvalidStatement();

        if (statement.refUID != counteroffer) revert InvalidValidation();

        // Decode the statement data
        BundlePaymentObligation.StatementData memory statementData =
            abi.decode(statement.data, (BundlePaymentObligation.StatementData));

        // Validate that the bundles match
        return _isMatchingBundle(statementData, validationData);
    }

    function _isMatchingBundle(
        BundlePaymentObligation.StatementData memory statementData,
        DemandData memory validationData
    ) internal pure returns (bool) {
        if (statementData.erc20Addresses.length != validationData.erc20Addresses.length) return false;
        if (statementData.erc20Amounts.length != validationData.erc20Amounts.length) return false;
        if (statementData.erc721Addresses.length != validationData.erc721Addresses.length) return false;
        if (statementData.erc721Ids.length != validationData.erc721Ids.length) return false;

        // Compare ERC20 tokens
        for (uint256 i = 0; i < statementData.erc20Addresses.length; i++) {
            if (statementData.erc20Addresses[i] != validationData.erc20Addresses[i]) return false;
            if (statementData.erc20Amounts[i] < validationData.erc20Amounts[i]) return false; // Allow more but not less
        }

        // Compare ERC721 tokens
        for (uint256 i = 0; i < statementData.erc721Addresses.length; i++) {
            if (statementData.erc721Addresses[i] != validationData.erc721Addresses[i]) return false;
            if (statementData.erc721Ids[i] != validationData.erc721Ids[i]) return false;
        }

        return true;
    }
}
