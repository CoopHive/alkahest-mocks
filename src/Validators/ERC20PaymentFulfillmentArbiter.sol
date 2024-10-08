// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {ERC20PaymentObligation} from "../Statements/ERC20PaymentObligation.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract ERC20PaymentFulfillmentArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    struct DemandData {
        address token;
        uint256 amount;
    }

    error InvalidStatement();
    error InvalidValidation();

    ERC20PaymentObligation public immutable paymentStatement;

    constructor(ERC20PaymentObligation _baseStatement) {
        paymentStatement = _baseStatement;
    }

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 counteroffer
    ) public view override returns (bool) {
        DemandData memory validationData = abi.decode(demand, (DemandData));

        if (statement.schema != paymentStatement.ATTESTATION_SCHEMA())
            revert InvalidStatement();
        if (statement._checkExpired()) revert InvalidStatement();

        if (statement.refUID != counteroffer) revert InvalidValidation();

        ERC20PaymentObligation.StatementData memory statementData = abi.decode(
            statement.data,
            (ERC20PaymentObligation.StatementData)
        );

        if (statementData.token != validationData.token)
            revert InvalidValidation();
        if (statementData.amount < validationData.amount)
            revert InvalidValidation();

        return true;
    }
}
