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
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {BaseObligation} from "../../BaseObligation.sol";
import {BaseArbiter} from "../../BaseArbiter.sol";
import {IArbiter} from "../../IArbiter.sol";
import {ArbiterUtils} from "../../libraries/ArbiterUtils.sol";

/// @title ERC1155PaymentObligation
/// @notice Transfers ERC1155 tokens to a payee and records the payment as an EAS attestation.
/// @dev As an arbiter, accepts payment attestations that reference the escrow UID and satisfy the demanded token, ID, payee, and minimum amount.
contract ERC1155PaymentObligation is BaseObligation, BaseArbiter {
    using ArbiterUtils for Attestation;

    /// @notice ERC1155 payment terms encoded in each obligation attestation.
    struct ObligationData {
        /// @notice ERC1155 token contract to transfer.
        address token;
        /// @notice Token ID to transfer.
        uint256 tokenId;
        /// @notice Amount of the token ID to transfer.
        uint256 amount;
        /// @notice Recipient of the ERC1155 payment.
        address payee;
    }

    /// @notice Emitted after an ERC1155 payment attestation is created.
    event PaymentMade(bytes32 indexed payment, address indexed buyer);

    /// @notice Raised when the ERC1155 transfer reverts.
    error ERC1155TransferFailed(address token, address from, address to, uint256 tokenId, uint256 amount);

    /// @param _eas EAS contract used to create and read payment attestations.
    /// @param _schemaRegistry EAS schema registry used to register or reuse the payment schema.
    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        BaseObligation(_eas, _schemaRegistry, "address token, uint256 tokenId, uint256 amount, address payee", false)
    {}

    /// @notice Transfers ERC1155 tokens and attests to the payment for the caller.
    function doObligation(ObligationData calldata data, bytes32 refUID) public returns (bytes32 uid_) {
        bytes memory encodedData = abi.encode(data);
        uid_ = _doObligationForRaw(encodedData, 0, msg.sender, refUID);
    }

    /// @notice Transfers ERC1155 tokens and attests to the payment for an explicit attestation recipient.
    function doObligationFor(ObligationData calldata data, address recipient, bytes32 refUID)
        public
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

        // Try token transfer with error handling
        try IERC1155(obligationData.token)
            .safeTransferFrom(payer, obligationData.payee, obligationData.tokenId, obligationData.amount, "") {
        // Transfer succeeded
        }
        catch {
            revert ERC1155TransferFailed(
                obligationData.token, payer, obligationData.payee, obligationData.tokenId, obligationData.amount
            );
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

        return payment.token == demandData.token && payment.tokenId == demandData.tokenId
            && payment.amount >= demandData.amount && payment.payee == demandData.payee;
    }

    /// @notice Loads and decodes ERC1155 payment data from this contract's attestation.
    function getObligationData(bytes32 uid) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    /// @notice Decodes ABI-encoded ERC1155 payment data.
    function decodeObligationData(bytes calldata data) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
