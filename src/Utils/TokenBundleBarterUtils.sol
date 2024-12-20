// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {TokenBundleEscrowObligation} from "../Statements/TokenBundleEscrowObligation.sol";
import {TokenBundlePaymentObligation} from "../Statements/TokenBundlePaymentObligation.sol";

contract TokenBundleBarterUtils {
    IEAS internal eas;
    TokenBundleEscrowObligation internal bundleEscrow;
    TokenBundlePaymentObligation internal bundlePayment;

    error CouldntCollectPayment();

    constructor(
        address _eas,
        address payable _bundleEscrow,
        address payable _bundlePayment
    ) {
        eas = IEAS(_eas);
        bundleEscrow = TokenBundleEscrowObligation(_bundleEscrow);
        bundlePayment = TokenBundlePaymentObligation(_bundlePayment);
    }

    function _buyBundleForBundle(
        TokenBundleEscrowObligation.StatementData calldata bidData,
        uint64 expiration
    ) internal returns (bytes32) {
        return
            bundleEscrow.makeStatementFor(
                bidData,
                expiration,
                bytes32(0),
                msg.sender,
                msg.sender
            );
    }

    function _payBundleForBundle(
        bytes32 buyAttestation,
        TokenBundlePaymentObligation.StatementData memory demand
    ) internal returns (bytes32) {
        bytes32 sellAttestation = bundlePayment.makeStatementFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!bundleEscrow.collectPayment(buyAttestation, sellAttestation)) {
            revert CouldntCollectPayment();
        }

        return sellAttestation;
    }

    function buyBundleForBundle(
        TokenBundleEscrowObligation.StatementData calldata bidData,
        uint64 expiration
    ) external returns (bytes32) {
        return _buyBundleForBundle(bidData, expiration);
    }

    function payBundleForBundle(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        TokenBundleEscrowObligation.StatementData memory escrowData = abi
            .decode(bid.data, (TokenBundleEscrowObligation.StatementData));
        TokenBundlePaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (TokenBundlePaymentObligation.StatementData)
        );

        return _payBundleForBundle(buyAttestation, demand);
    }
}
