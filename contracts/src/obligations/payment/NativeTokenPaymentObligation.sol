// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {
    IEAS,
    AttestationRequest,
    AttestationRequestData,
    RevocationRequest,
    RevocationRequestData
} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseObligation} from "../../BaseObligation.sol";
import {BaseArbiter} from "../../BaseArbiter.sol";
import {IArbiter} from "../../IArbiter.sol";
import {ArbiterUtils} from "../../libraries/ArbiterUtils.sol";

/// @title NativeTokenPaymentObligation
/// @notice Transfers native tokens to a payee and records the payment as an EAS attestation.
/// @dev Refunds excess `msg.value`; as an arbiter, accepts payment attestations referencing the escrow UID with the demanded payee and minimum amount.
contract NativeTokenPaymentObligation is BaseObligation, BaseArbiter {
    using ArbiterUtils for Attestation;

    /// @notice Native-token payment terms encoded in each obligation attestation.
    struct ObligationData {
        /// @notice Amount of native token to pay.
        uint256 amount;
        /// @notice Recipient of the native-token payment.
        address payee;
    }

    /// @notice Emitted after a native-token payment attestation is created.
    event PaymentMade(bytes32 indexed payment, address indexed buyer);

    /// @notice Raised when `msg.value` is below the requested payment amount.
    error InsufficientPayment(uint256 expected, uint256 received);
    /// @notice Raised when a native-token transfer or refund fails.
    error NativeTokenTransferFailed(address to, uint256 amount);

    /// @param _eas EAS contract used to create and read payment attestations.
    /// @param _schemaRegistry EAS schema registry used to register or reuse the payment schema.
    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        BaseObligation(_eas, _schemaRegistry, "uint256 amount, address payee", false)
    {}

    /// @notice Pays native token and attests to the payment for the caller.
    function doObligation(ObligationData calldata data, bytes32 refUID) public payable returns (bytes32 uid_) {
        bytes memory encodedData = abi.encode(data);
        uid_ = _doObligationForRaw(encodedData, 0, msg.sender, refUID);
    }

    /// @notice Pays native token and attests to the payment for an explicit attestation recipient.
    function doObligationFor(ObligationData calldata data, address recipient, bytes32 refUID)
        public
        payable
        returns (bytes32 uid_)
    {
        bytes memory encodedData = abi.encode(data);
        uid_ = _doObligationForRaw(encodedData, 0, recipient, refUID);
    }

    function _beforeAttest(
        bytes memory data,
        address payer,
        address /* recipient */
    )
        internal
        override
    {
        ObligationData memory obligationData = abi.decode(data, (ObligationData));

        // Verify sufficient payment was sent
        if (msg.value < obligationData.amount) {
            revert InsufficientPayment(obligationData.amount, msg.value);
        }

        // Transfer native tokens to payee
        (bool success,) = payable(obligationData.payee).call{value: obligationData.amount}("");

        if (!success) {
            revert NativeTokenTransferFailed(obligationData.payee, obligationData.amount);
        }

        // Return excess payment if any
        if (msg.value > obligationData.amount) {
            uint256 excess = msg.value - obligationData.amount;
            (bool refundSuccess,) = payable(payer).call{value: excess}("");
            if (!refundSuccess) {
                revert NativeTokenTransferFailed(payer, excess);
            }
        }
    }

    function _afterAttest(Attestation memory attestation) internal override {
        emit PaymentMade(attestation.uid, attestation.recipient);
    }

    /// @inheritdoc IArbiter
    function check(Attestation memory fulfillment, bytes memory demand, bytes32 escrowUid)
        public
        view
        override
        returns (bool)
    {
        if (fulfillment.schema != ATTESTATION_SCHEMA) return false;

        // Check that the payment references the correct escrow
        if (fulfillment.refUID != escrowUid) return false;

        ObligationData memory payment = abi.decode(fulfillment.data, (ObligationData));
        ObligationData memory demandData = abi.decode(demand, (ObligationData));

        return payment.amount >= demandData.amount && payment.payee == demandData.payee;
    }

    /// @notice Loads and decodes native-token payment data from this contract's attestation.
    function getObligationData(bytes32 uid) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    /// @notice Decodes ABI-encoded native-token payment data.
    function decodeObligationData(bytes calldata data) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
