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
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {BaseObligation} from "../../BaseObligation.sol";
import {BaseArbiter} from "../../BaseArbiter.sol";
import {IArbiter} from "../../IArbiter.sol";
import {ArbiterUtils} from "../../libraries/ArbiterUtils.sol";

/// @title ERC721PaymentObligation
/// @notice Transfers an ERC721 token to a payee and records the payment as an EAS attestation.
/// @dev As an arbiter, accepts payment attestations that reference the escrow UID and match the demanded token, token ID, and payee.
contract ERC721PaymentObligation is BaseObligation, BaseArbiter {
    using ArbiterUtils for Attestation;

    /// @notice ERC721 payment terms encoded in each obligation attestation.
    struct ObligationData {
        /// @notice ERC721 token contract to transfer.
        address token;
        /// @notice Token ID to transfer.
        uint256 tokenId;
        /// @notice Recipient of the ERC721 payment.
        address payee;
    }

    /// @notice Emitted after an ERC721 payment attestation is created.
    event PaymentMade(bytes32 indexed payment, address indexed buyer);

    /// @notice Raised when the ERC721 transfer fails or ownership does not move to the payee.
    error ERC721TransferFailed(address token, address from, address to, uint256 tokenId);

    /// @param _eas EAS contract used to create and read payment attestations.
    /// @param _schemaRegistry EAS schema registry used to register or reuse the payment schema.
    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        BaseObligation(_eas, _schemaRegistry, "address token, uint256 tokenId, address payee", false)
    {}

    /// @notice Transfers the ERC721 token and attests to the payment for the caller.
    function doObligation(ObligationData calldata data, bytes32 refUID) public returns (bytes32 uid_) {
        bytes memory encodedData = abi.encode(data);
        uid_ = _doObligationForRaw(encodedData, 0, msg.sender, refUID);
    }

    /// @notice Transfers the ERC721 token and attests to the payment for an explicit attestation recipient.
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

        if (obligationData.token.code.length == 0) {
            revert ERC721TransferFailed(obligationData.token, payer, obligationData.payee, obligationData.tokenId);
        }

        // Try token transfer with error handling
        try IERC721(obligationData.token).transferFrom(payer, obligationData.payee, obligationData.tokenId) {
        // Transfer succeeded
        }
        catch {
            revert ERC721TransferFailed(obligationData.token, payer, obligationData.payee, obligationData.tokenId);
        }

        try IERC721(obligationData.token).ownerOf(obligationData.tokenId) returns (address owner) {
            if (owner != obligationData.payee) {
                revert ERC721TransferFailed(obligationData.token, payer, obligationData.payee, obligationData.tokenId);
            }
        } catch {
            revert ERC721TransferFailed(obligationData.token, payer, obligationData.payee, obligationData.tokenId);
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

        return
            payment.token == demandData.token && payment.tokenId == demandData.tokenId
                && payment.payee == demandData.payee;
    }

    /// @notice Loads and decodes ERC721 payment data from this contract's attestation.
    function getObligationData(bytes32 uid) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    /// @notice Decodes ABI-encoded ERC721 payment data.
    function decodeObligationData(bytes calldata data) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
