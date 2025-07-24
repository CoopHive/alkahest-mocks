// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseObligation} from "../BaseObligation.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract NativeTokenPaymentObligation is BaseObligation, IArbiter {
    using ArbiterUtils for Attestation;

    struct ObligationData {
        uint256 amount;
        address payee;
    }

    event PaymentMade(bytes32 indexed payment, address indexed buyer);

    error InsufficientPayment(uint256 expected, uint256 received);
    error NativeTokenTransferFailed(address to, uint256 amount);

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseObligation(
            _eas,
            _schemaRegistry,
            "uint256 amount, address payee",
            true
        )
    {}

    function doObligation(
        ObligationData calldata data
    ) public payable returns (bytes32 uid_) {
        bytes memory encodedData = abi.encode(data);
        uid_ = this.doObligationForRaw{value: msg.value}(
            encodedData,
            0,
            msg.sender,
            msg.sender,
            bytes32(0)
        );
    }

    function doObligationFor(
        ObligationData calldata data,
        address payer,
        address recipient
    ) public payable returns (bytes32 uid_) {
        bytes memory encodedData = abi.encode(data);
        uid_ = this.doObligationForRaw{value: msg.value}(
            encodedData,
            0,
            payer,
            recipient,
            bytes32(0)
        );
    }

    function _beforeAttest(
        bytes calldata data,
        address payer,
        address /* recipient */
    ) internal override {
        ObligationData memory obligationData = abi.decode(
            data,
            (ObligationData)
        );

        // Verify sufficient payment was sent
        if (msg.value < obligationData.amount) {
            revert InsufficientPayment(obligationData.amount, msg.value);
        }

        // Transfer native tokens to payee
        (bool success, ) = payable(obligationData.payee).call{
            value: obligationData.amount
        }("");

        if (!success) {
            revert NativeTokenTransferFailed(
                obligationData.payee,
                obligationData.amount
            );
        }

        // Return excess payment if any
        if (msg.value > obligationData.amount) {
            uint256 excess = msg.value - obligationData.amount;
            (bool refundSuccess, ) = payable(payer).call{value: excess}("");
            if (!refundSuccess) {
                revert NativeTokenTransferFailed(payer, excess);
            }
        }
    }

    function _afterAttest(
        bytes32 uid,
        bytes calldata /* data */,
        address /* payer */,
        address recipient
    ) internal override {
        emit PaymentMade(uid, recipient);
    }

    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 /* counteroffer */
    ) public view override returns (bool) {
        if (!obligation._checkIntrinsic(ATTESTATION_SCHEMA)) return false;

        ObligationData memory payment = abi.decode(
            obligation.data,
            (ObligationData)
        );
        ObligationData memory demandData = abi.decode(demand, (ObligationData));

        return
            payment.amount >= demandData.amount &&
            payment.payee == demandData.payee;
    }

    function getObligationData(
        bytes32 uid
    ) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    function decodeObligationData(
        bytes calldata data
    ) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }

    // Allow contract to receive native tokens (for refunds)
    receive() external payable override {}
}
