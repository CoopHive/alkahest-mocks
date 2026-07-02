// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {BaseEscrowObligationUnconditional} from "../BaseEscrowObligationUnconditional.sol";
import {IArbiter} from "../../../IArbiter.sol";
import {BaseArbiter} from "../../../BaseArbiter.sol";
import {ArbiterUtils} from "../../../libraries/ArbiterUtils.sol";
import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

/// @title UnconditionalERC1155EscrowObligation
/// @notice Escrows ERC1155 tokens behind an arbiter-defined fulfillment condition.
/// @dev Does not apply the default fulfillment refUID or intrinsic checks; use arbiters to add any required checks.
contract UnconditionalERC1155EscrowObligation is BaseEscrowObligationUnconditional, BaseArbiter, ERC1155Holder {
    using ArbiterUtils for Attestation;

    /// @notice ERC1155 escrow terms encoded in each escrow attestation.
    struct ObligationData {
        address arbiter;
        bytes demand;
        address token;
        uint256 tokenId;
        uint256 amount;
    }

    error ERC1155TransferFailed(address token, address from, address to, uint256 tokenId, uint256 amount);

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        BaseEscrowObligationUnconditional(
            _eas, _schemaRegistry, "address arbiter, bytes demand, address token, uint256 tokenId, uint256 amount", true
        )
    {}

    /// @inheritdoc BaseEscrowObligationUnconditional
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(BaseEscrowObligationUnconditional, BaseArbiter, ERC1155Holder)
        returns (bool)
    {
        return interfaceId == type(IArbiter).interfaceId || super.supportsInterface(interfaceId);
    }

    // Extract arbiter and demand from encoded data
    /// @inheritdoc BaseEscrowObligationUnconditional
    function decodeCondition(bytes memory data) public pure override returns (address arbiter, bytes memory demand) {
        ObligationData memory decoded = abi.decode(data, (ObligationData));
        return (decoded.arbiter, decoded.demand);
    }

    // Transfer tokens into escrow
    function _lockEscrow(bytes memory data, address from) internal override {
        ObligationData memory decoded = abi.decode(data, (ObligationData));

        // Check balance before transfer
        uint256 balanceBefore = IERC1155(decoded.token).balanceOf(address(this), decoded.tokenId);

        try IERC1155(decoded.token).safeTransferFrom(from, address(this), decoded.tokenId, decoded.amount, "") {
        // Transfer succeeded
        }
        catch {
            revert ERC1155TransferFailed(decoded.token, from, address(this), decoded.tokenId, decoded.amount);
        }

        // Check balance after transfer
        uint256 balanceAfter = IERC1155(decoded.token).balanceOf(address(this), decoded.tokenId);

        // Verify the actual amount transferred
        if (balanceAfter < balanceBefore + decoded.amount) {
            revert ERC1155TransferFailed(decoded.token, from, address(this), decoded.tokenId, decoded.amount);
        }
    }

    // Transfer tokens to fulfiller
    function _releaseEscrow(
        Attestation memory escrow,
        address to,
        bytes32 /* fulfillmentUid */
    )
        internal
        override
        returns (bytes memory)
    {
        ObligationData memory decoded = abi.decode(escrow.data, (ObligationData));

        try IERC1155(decoded.token).safeTransferFrom(address(this), to, decoded.tokenId, decoded.amount, "") {
        // Transfer succeeded
        }
        catch {
            revert ERC1155TransferFailed(decoded.token, address(this), to, decoded.tokenId, decoded.amount);
        }

        return ""; // Token escrows don't return anything
    }

    // Return tokens to original owner on expiry
    function _returnEscrow(Attestation memory escrow, address to) internal override {
        _releaseEscrow(escrow, to, bytes32(0));
    }

    // Implement IArbiter
    /// @inheritdoc IArbiter
    function check(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 /* fulfilling */
    )
        public
        view
        override
        returns (bool)
    {
        if (obligation.schema != ATTESTATION_SCHEMA) return false;

        ObligationData memory payment = abi.decode(obligation.data, (ObligationData));
        ObligationData memory demandData = abi.decode(demand, (ObligationData));

        return payment.token == demandData.token && payment.tokenId == demandData.tokenId
            && payment.amount >= demandData.amount && payment.arbiter == demandData.arbiter
            && keccak256(payment.demand) == keccak256(demandData.demand);
    }

    // Typed convenience methods
    /// @notice Locks ERC1155 tokens and creates an escrow attestation for the caller.
    function doObligation(ObligationData calldata data, uint64 expirationTime) external returns (bytes32) {
        return _doObligationForRaw(abi.encode(data), expirationTime, msg.sender, bytes32(0));
    }

    /// @notice Locks ERC1155 tokens and creates an escrow attestation for an explicit recipient.
    function doObligationFor(ObligationData calldata data, uint64 expirationTime, address recipient)
        external
        returns (bytes32)
    {
        return _doObligationForRaw(abi.encode(data), expirationTime, recipient, bytes32(0));
    }

    /// @notice Loads and decodes ERC1155 escrow data from this contract's attestation.
    function getObligationData(bytes32 uid) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    /// @notice Decodes ABI-encoded ERC1155 escrow data.
    function decodeObligationData(bytes calldata data) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
