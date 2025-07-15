// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {ERC721EscrowObligation} from "../../obligations/ERC721EscrowObligation.sol";
import {IArbiter} from "../../IArbiter.sol";
import {ArbiterUtils} from "../../ArbiterUtils.sol";
import {SpecificAttestationArbiter} from "../deprecated/SpecificAttestationArbiter.sol";

contract ERC721PaymentFulfillmentArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    struct DemandData {
        address token;
        uint256 tokenId;
    }

    error InvalidObligation();
    error InvalidValidation();

    ERC721EscrowObligation public immutable paymentObligation;
    SpecificAttestationArbiter public immutable specificAttestation;

    constructor(
        ERC721EscrowObligation _baseObligation,
        SpecificAttestationArbiter _specificAttestation
    ) {
        paymentObligation = _baseObligation;
        specificAttestation = _specificAttestation;
    }

    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 counteroffer
    ) public view override returns (bool) {
        DemandData memory validationData = abi.decode(demand, (DemandData));

        if (obligation.schema != paymentObligation.ATTESTATION_SCHEMA())
            revert InvalidObligation();
        if (obligation._checkExpired()) revert InvalidObligation();

        ERC721EscrowObligation.ObligationData memory obligationData = abi.decode(
            obligation.data,
            (ERC721EscrowObligation.ObligationData)
        );

        if (obligationData.token != validationData.token)
            revert InvalidValidation();
        if (obligationData.tokenId != validationData.tokenId)
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
}
