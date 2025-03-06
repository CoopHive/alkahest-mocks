// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {ERC1155EscrowObligation} from "../../obligations/ERC1155EscrowObligation.sol";
import {IArbiter} from "../../IArbiter.sol";
import {ArbiterUtils} from "../../ArbiterUtils.sol";
import {SpecificAttestationArbiter} from "../../arbiters/SpecificAttestationArbiter.sol";

contract ERC1155PaymentFulfillmentArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    struct DemandData {
        address token;
        uint256 tokenId;
        uint256 amount;
    }

    error InvalidStatement();
    error InvalidValidation();

    ERC1155EscrowObligation public immutable paymentStatement;
    SpecificAttestationArbiter public immutable specificAttestation;

    constructor(
        ERC1155EscrowObligation _baseStatement,
        SpecificAttestationArbiter _specificAttestation
    ) {
        paymentStatement = _baseStatement;
        specificAttestation = _specificAttestation;
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

        ERC1155EscrowObligation.StatementData memory statementData = abi.decode(
            statement.data,
            (ERC1155EscrowObligation.StatementData)
        );

        if (statementData.token != validationData.token)
            revert InvalidValidation();
        if (statementData.tokenId != validationData.tokenId)
            revert InvalidValidation();
        if (statementData.amount < validationData.amount)
            revert InvalidValidation();

        if (statementData.arbiter != address(specificAttestation))
            revert InvalidValidation();

        SpecificAttestationArbiter.DemandData memory demandData = abi.decode(
            statementData.demand,
            (SpecificAttestationArbiter.DemandData)
        );

        if (demandData.uid != counteroffer) revert InvalidValidation();

        return true;
    }
}
