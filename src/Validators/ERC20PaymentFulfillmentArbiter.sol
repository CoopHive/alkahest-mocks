// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {ERC20PaymentStatement} from "../Statements/ERC20PaymentStatement.sol";
import {IArbiter} from "../IArbiter.sol";

contract ERC20PaymentFulfillmentArbiter is IArbiter {
    struct DemandData {
        address token;
        uint256 amount;
    }

    error InvalidStatement();
    error InvalidValidation();

    ERC20PaymentStatement public immutable paymentStatement;
    ISchemaRegistry public immutable schemaRegistry;
    IEAS public immutable eas;

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry,
        ERC20PaymentStatement _baseStatement
    ) {
        eas = _eas;
        schemaRegistry = _schemaRegistry;
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
        if (_checkExpired(statement)) revert InvalidStatement();

        if (statement.refUID != counteroffer) revert InvalidValidation();
        // ERC20PaymentStatement.StatementData memory statementData = abi.decode(
        //     statement.data,
        //     (ERC20PaymentStatement.StatementData)
        // );

        // if (statementData.token != validationData.token)
        //     revert InvalidValidation();
        // if (statementData.amount < validationData.amount)
        //     revert InvalidValidation();
        return
            paymentStatement.checkStatement(
                statement,
                abi.encode(
                    ERC20PaymentStatement.StatementData({
                        token: validationData.token,
                        amount: validationData.amount,
                        arbiter: address(0),
                        demand: ""
                    })
                ),
                counteroffer
            );

        // return true;
    }
}
