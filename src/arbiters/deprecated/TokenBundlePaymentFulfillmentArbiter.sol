// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {TokenBundleEscrowObligation} from "../../obligations/TokenBundleEscrowObligation.sol";
import {IArbiter} from "../../IArbiter.sol";
import {ArbiterUtils} from "../../ArbiterUtils.sol";
import {SpecificAttestationArbiter} from "../deprecated/SpecificAttestationArbiter.sol";

contract TokenBundlePaymentFulfillmentArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    struct DemandData {
        // ERC20
        address[] erc20Tokens;
        uint256[] erc20Amounts;
        // ERC721
        address[] erc721Tokens;
        uint256[] erc721TokenIds;
        // ERC1155
        address[] erc1155Tokens;
        uint256[] erc1155TokenIds;
        uint256[] erc1155Amounts;
    }

    error InvalidStatement();
    error InvalidValidation();
    error ArrayLengthMismatch();

    TokenBundleEscrowObligation public immutable paymentStatement;
    SpecificAttestationArbiter public immutable specificAttestation;

    constructor(
        TokenBundleEscrowObligation _baseObligation,
        SpecificAttestationArbiter _specificAttestation
    ) {
        paymentStatement = _baseObligation;
        specificAttestation = _specificAttestation;
    }

    function validateArrayLengths(DemandData memory data) internal pure {
        if (data.erc20Tokens.length != data.erc20Amounts.length)
            revert ArrayLengthMismatch();
        if (data.erc721Tokens.length != data.erc721TokenIds.length)
            revert ArrayLengthMismatch();
        if (
            data.erc1155Tokens.length != data.erc1155TokenIds.length ||
            data.erc1155Tokens.length != data.erc1155Amounts.length
        ) revert ArrayLengthMismatch();
    }

    function checkObligation(
        Attestation memory statement,
        bytes memory demand,
        bytes32 counteroffer
    ) public view override returns (bool) {
        DemandData memory validationData = abi.decode(demand, (DemandData));
        validateArrayLengths(validationData);

        if (statement.schema != paymentStatement.ATTESTATION_SCHEMA())
            revert InvalidStatement();
        if (statement._checkExpired()) revert InvalidStatement();

        TokenBundleEscrowObligation.ObligationData memory obligationData = abi
            .decode(
                statement.data,
                (TokenBundleEscrowObligation.ObligationData)
            );

        if (!_validateTokens(obligationData, validationData))
            revert InvalidValidation();

        if (obligationData.arbiter != address(specificAttestation))
            revert InvalidValidation();

        SpecificAttestationArbiter.DemandData memory demandData = abi.decode(
            obligationData.demand,
            (SpecificAttestationArbiter.DemandData)
        );

        if (demandData.uid != counteroffer) revert InvalidValidation();

        return true;
    }

    function _validateTokens(
        TokenBundleEscrowObligation.ObligationData memory statement,
        DemandData memory validation
    ) internal pure returns (bool) {
        // Validate ERC20s
        if (statement.erc20Tokens.length < validation.erc20Tokens.length)
            return false;
        for (uint i = 0; i < validation.erc20Tokens.length; i++) {
            if (
                statement.erc20Tokens[i] != validation.erc20Tokens[i] ||
                statement.erc20Amounts[i] < validation.erc20Amounts[i]
            ) return false;
        }

        // Validate ERC721s
        if (statement.erc721Tokens.length < validation.erc721Tokens.length)
            return false;
        for (uint i = 0; i < validation.erc721Tokens.length; i++) {
            if (
                statement.erc721Tokens[i] != validation.erc721Tokens[i] ||
                statement.erc721TokenIds[i] != validation.erc721TokenIds[i]
            ) return false;
        }

        // Validate ERC1155s
        if (statement.erc1155Tokens.length < validation.erc1155Tokens.length)
            return false;
        for (uint i = 0; i < validation.erc1155Tokens.length; i++) {
            if (
                statement.erc1155Tokens[i] != validation.erc1155Tokens[i] ||
                statement.erc1155TokenIds[i] != validation.erc1155TokenIds[i] ||
                statement.erc1155Amounts[i] < validation.erc1155Amounts[i]
            ) return false;
        }

        return true;
    }
}
