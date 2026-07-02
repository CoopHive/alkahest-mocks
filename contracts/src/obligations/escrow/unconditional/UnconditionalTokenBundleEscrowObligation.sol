// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {BaseEscrowObligationUnconditional} from "../BaseEscrowObligationUnconditional.sol";
import {IArbiter} from "../../../IArbiter.sol";
import {BaseArbiter} from "../../../BaseArbiter.sol";
import {ArbiterUtils} from "../../../libraries/ArbiterUtils.sol";
import {Attestation} from "@eas/Common.sol";
import {IEAS, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

/// @title UnconditionalTokenBundleEscrowObligation
/// @notice Escrows a mixed native/ERC20/ERC721/ERC1155 bundle behind an arbiter-defined fulfillment condition.
/// @dev Does not apply the default fulfillment refUID or intrinsic checks; bundle arrays are positionally matched.
contract UnconditionalTokenBundleEscrowObligation is BaseEscrowObligationUnconditional, BaseArbiter, ERC1155Holder {
    using ArbiterUtils for Attestation;
    using SafeERC20 for IERC20;

    /// @notice Mixed-token escrow terms encoded in each escrow attestation.
    struct ObligationData {
        address arbiter;
        bytes demand;
        // Native tokens
        uint256 nativeAmount;
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

    error ArrayLengthMismatch();
    error TooManyBundleItems(uint256 provided, uint256 max);
    error IncorrectPayment(uint256 expected, uint256 received);
    error ERC20TransferFailed(address token, address from, address to, uint256 amount);
    error ERC721TransferFailed(address token, address from, address to, uint256 tokenId);
    error ERC1155TransferFailed(address token, address from, address to, uint256 tokenId, uint256 amount);
    error NativeTokenTransferFailed(address to, uint256 amount);

    // Events emitted during partial release phase - continue on error
    event NativeTokenTransferFailedOnRelease(address indexed to, uint256 amount);
    event ERC20TransferFailedOnRelease(address indexed token, address indexed to, uint256 amount);
    event ERC721TransferFailedOnRelease(address indexed token, address indexed to, uint256 tokenId);
    event ERC1155TransferFailedOnRelease(address indexed token, address indexed to, uint256 tokenId, uint256 amount);

    uint256 public constant MAX_BUNDLE_ITEMS = 50;

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        BaseEscrowObligationUnconditional(
            _eas,
            _schemaRegistry,
            "address arbiter, bytes demand, uint256 nativeAmount, address[] erc20Tokens, uint256[] erc20Amounts, address[] erc721Tokens, uint256[] erc721TokenIds, address[] erc1155Tokens, uint256[] erc1155TokenIds, uint256[] erc1155Amounts",
            true
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

    function validateArrayLengths(ObligationData memory data) internal pure {
        if (data.erc20Tokens.length != data.erc20Amounts.length) {
            revert ArrayLengthMismatch();
        }
        if (data.erc721Tokens.length != data.erc721TokenIds.length) {
            revert ArrayLengthMismatch();
        }
        if (
            data.erc1155Tokens.length != data.erc1155TokenIds.length
                || data.erc1155Tokens.length != data.erc1155Amounts.length
        ) revert ArrayLengthMismatch();

        uint256 bundleItems = data.erc20Tokens.length + data.erc721Tokens.length + data.erc1155Tokens.length;
        if (bundleItems > MAX_BUNDLE_ITEMS) {
            revert TooManyBundleItems(bundleItems, MAX_BUNDLE_ITEMS);
        }
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
        validateArrayLengths(decoded);

        if (msg.value != decoded.nativeAmount) {
            revert IncorrectPayment(decoded.nativeAmount, msg.value);
        }

        // Handle token bundle
        transferInTokenBundle(decoded, from);
    }

    // Transfer tokens to fulfiller (atomic - reverts on any failure)
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

        // Transfer native tokens - revert on failure
        if (decoded.nativeAmount > 0) {
            (bool success,) = payable(to).call{value: decoded.nativeAmount}("");
            if (!success) {
                revert NativeTokenTransferFailed(to, decoded.nativeAmount);
            }
        }

        // Transfer token bundle - reverts on any failure
        transferOutTokenBundleAtomic(decoded, to);
        return ""; // Token escrows don't return anything
    }

    // Transfer tokens to fulfiller (partial - continues on failure, emits events)
    function _releaseEscrowPartial(bytes memory escrowData, address to) internal returns (bytes memory) {
        ObligationData memory decoded = abi.decode(escrowData, (ObligationData));

        // Transfer native tokens - continue on failure
        if (decoded.nativeAmount > 0) {
            (bool success,) = payable(to).call{value: decoded.nativeAmount}("");
            if (!success) {
                emit NativeTokenTransferFailedOnRelease(to, decoded.nativeAmount);
            }
        }

        // Transfer token bundle - continues on individual failures
        transferOutTokenBundlePartial(decoded, to);
        return ""; // Token escrows don't return anything
    }

    // Return tokens to original owner on expiry
    function _returnEscrow(Attestation memory escrow, address to) internal override {
        _releaseEscrow(escrow, to, bytes32(0));
    }

    function transferInTokenBundle(ObligationData memory data, address from) internal {
        // Transfer ERC20s
        for (uint256 i = 0; i < data.erc20Tokens.length; i++) {
            // Check balance before transfer
            uint256 balanceBefore = IERC20(data.erc20Tokens[i]).balanceOf(address(this));

            bool success = IERC20(data.erc20Tokens[i]).trySafeTransferFrom(from, address(this), data.erc20Amounts[i]);

            // Check balance after transfer
            uint256 balanceAfter = IERC20(data.erc20Tokens[i]).balanceOf(address(this));

            // Verify the actual amount transferred
            if (!success || balanceAfter < balanceBefore + data.erc20Amounts[i]) {
                revert ERC20TransferFailed(data.erc20Tokens[i], from, address(this), data.erc20Amounts[i]);
            }
        }

        // Transfer ERC721s
        for (uint256 i = 0; i < data.erc721Tokens.length; i++) {
            // Check ownership before transfer
            address ownerBefore = IERC721(data.erc721Tokens[i]).ownerOf(data.erc721TokenIds[i]);
            if (ownerBefore != from) {
                revert ERC721TransferFailed(data.erc721Tokens[i], from, address(this), data.erc721TokenIds[i]);
            }

            try IERC721(data.erc721Tokens[i]).transferFrom(from, address(this), data.erc721TokenIds[i]) {
            // Transfer succeeded
            }
            catch {
                revert ERC721TransferFailed(data.erc721Tokens[i], from, address(this), data.erc721TokenIds[i]);
            }

            // Check ownership after transfer
            address ownerAfter = IERC721(data.erc721Tokens[i]).ownerOf(data.erc721TokenIds[i]);
            if (ownerAfter != address(this)) {
                revert ERC721TransferFailed(data.erc721Tokens[i], from, address(this), data.erc721TokenIds[i]);
            }
        }

        // Transfer ERC1155s
        for (uint256 i = 0; i < data.erc1155Tokens.length; i++) {
            // Check balance before transfer
            uint256 balanceBefore = IERC1155(data.erc1155Tokens[i]).balanceOf(address(this), data.erc1155TokenIds[i]);

            try IERC1155(data.erc1155Tokens[i])
                .safeTransferFrom(from, address(this), data.erc1155TokenIds[i], data.erc1155Amounts[i], "") {
            // Transfer succeeded
            }
            catch {
                revert ERC1155TransferFailed(
                    data.erc1155Tokens[i], from, address(this), data.erc1155TokenIds[i], data.erc1155Amounts[i]
                );
            }

            // Check balance after transfer
            uint256 balanceAfter = IERC1155(data.erc1155Tokens[i]).balanceOf(address(this), data.erc1155TokenIds[i]);

            // Verify the actual amount transferred
            if (balanceAfter < balanceBefore + data.erc1155Amounts[i]) {
                revert ERC1155TransferFailed(
                    data.erc1155Tokens[i], from, address(this), data.erc1155TokenIds[i], data.erc1155Amounts[i]
                );
            }
        }
    }

    function transferOutTokenBundleAtomic(ObligationData memory data, address to) internal {
        // Transfer ERC20s - revert on failure
        for (uint256 i = 0; i < data.erc20Tokens.length; i++) {
            // Check balance before transfer
            uint256 balanceBefore = IERC20(data.erc20Tokens[i]).balanceOf(to);

            bool success = IERC20(data.erc20Tokens[i]).trySafeTransfer(to, data.erc20Amounts[i]);

            // Check balance after transfer
            uint256 balanceAfter = IERC20(data.erc20Tokens[i]).balanceOf(to);

            // Verify the actual amount transferred
            if (!success || balanceAfter < balanceBefore + data.erc20Amounts[i]) {
                revert ERC20TransferFailed(data.erc20Tokens[i], address(this), to, data.erc20Amounts[i]);
            }
        }

        // Transfer ERC721s - revert on failure
        for (uint256 i = 0; i < data.erc721Tokens.length; i++) {
            try IERC721(data.erc721Tokens[i]).transferFrom(address(this), to, data.erc721TokenIds[i]) {
            // Transfer succeeded
            }
            catch {
                revert ERC721TransferFailed(data.erc721Tokens[i], address(this), to, data.erc721TokenIds[i]);
            }

            // Verify ownership transferred
            if (IERC721(data.erc721Tokens[i]).ownerOf(data.erc721TokenIds[i]) != to) {
                revert ERC721TransferFailed(data.erc721Tokens[i], address(this), to, data.erc721TokenIds[i]);
            }
        }

        // Transfer ERC1155s - revert on failure
        for (uint256 i = 0; i < data.erc1155Tokens.length; i++) {
            try IERC1155(data.erc1155Tokens[i])
                .safeTransferFrom(address(this), to, data.erc1155TokenIds[i], data.erc1155Amounts[i], "") {
            // Transfer succeeded
            }
            catch {
                revert ERC1155TransferFailed(
                    data.erc1155Tokens[i], address(this), to, data.erc1155TokenIds[i], data.erc1155Amounts[i]
                );
            }
        }
    }

    function transferOutTokenBundlePartial(ObligationData memory data, address to) internal {
        // Transfer ERC20s - continue on failure
        for (uint256 i = 0; i < data.erc20Tokens.length; i++) {
            bool success = IERC20(data.erc20Tokens[i]).trySafeTransfer(to, data.erc20Amounts[i]);

            if (!success) {
                emit ERC20TransferFailedOnRelease(data.erc20Tokens[i], to, data.erc20Amounts[i]);
            }
        }

        // Transfer ERC721s - continue on failure
        for (uint256 i = 0; i < data.erc721Tokens.length; i++) {
            try IERC721(data.erc721Tokens[i]).transferFrom(address(this), to, data.erc721TokenIds[i]) {
            // Transfer succeeded
            }
            catch {
                emit ERC721TransferFailedOnRelease(data.erc721Tokens[i], to, data.erc721TokenIds[i]);
            }
        }

        // Transfer ERC1155s - continue on failure
        for (uint256 i = 0; i < data.erc1155Tokens.length; i++) {
            try IERC1155(data.erc1155Tokens[i])
                .safeTransferFrom(address(this), to, data.erc1155TokenIds[i], data.erc1155Amounts[i], "") {
            // Transfer succeeded
            }
            catch {
                emit ERC1155TransferFailedOnRelease(
                    data.erc1155Tokens[i], to, data.erc1155TokenIds[i], data.erc1155Amounts[i]
                );
            }
        }
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

        return payment.nativeAmount >= demandData.nativeAmount && _checkTokenArrays(payment, demandData)
            && payment.arbiter == demandData.arbiter && keccak256(payment.demand) == keccak256(demandData.demand);
    }

    function _checkTokenArrays(ObligationData memory payment, ObligationData memory demand)
        internal
        pure
        returns (bool)
    {
        // Check ERC20s
        if (payment.erc20Tokens.length < demand.erc20Tokens.length) {
            return false;
        }
        for (uint256 i = 0; i < demand.erc20Tokens.length; i++) {
            if (payment.erc20Tokens[i] != demand.erc20Tokens[i] || payment.erc20Amounts[i] < demand.erc20Amounts[i]) {
                return false;
            }
        }

        // Check ERC721s
        if (payment.erc721Tokens.length < demand.erc721Tokens.length) {
            return false;
        }
        for (uint256 i = 0; i < demand.erc721Tokens.length; i++) {
            if (
                payment.erc721Tokens[i] != demand.erc721Tokens[i]
                    || payment.erc721TokenIds[i] != demand.erc721TokenIds[i]
            ) return false;
        }

        // Check ERC1155s
        if (payment.erc1155Tokens.length < demand.erc1155Tokens.length) {
            return false;
        }
        for (uint256 i = 0; i < demand.erc1155Tokens.length; i++) {
            if (
                payment.erc1155Tokens[i] != demand.erc1155Tokens[i]
                    || payment.erc1155TokenIds[i] != demand.erc1155TokenIds[i]
                    || payment.erc1155Amounts[i] < demand.erc1155Amounts[i]
            ) return false;
        }

        return true;
    }

    // Typed convenience methods
    /// @notice Locks the bundle and creates an escrow attestation for the caller.
    function doObligation(ObligationData calldata data, uint64 expirationTime) external payable returns (bytes32) {
        return _doObligationForRaw(abi.encode(data), expirationTime, msg.sender, bytes32(0));
    }

    /// @notice Locks the bundle and creates an escrow attestation for an explicit recipient.
    function doObligationFor(ObligationData calldata data, uint64 expirationTime, address recipient)
        external
        payable
        returns (bytes32)
    {
        return _doObligationForRaw(abi.encode(data), expirationTime, recipient, bytes32(0));
    }

    /// @notice Unsafe partial escrow collection - continues on individual transfer failures
    /// @dev Use only as a last resort when some tokens in the bundle cannot be collected.
    /// Failed transfers emit events but do not revert. The escrow will be marked as collected
    /// even if some tokens remain stuck. This can result in permanent loss of stuck tokens.
    function unsafePartiallyCollectEscrow(bytes32 _escrow, bytes32 _fulfillment) external nonReentrant returns (bool) {
        Attestation memory escrow = _getExistingAttestation(_escrow);
        Attestation memory fulfillment = _getExistingAttestation(_fulfillment);

        // Validate escrow uses correct schema
        if (escrow.schema != ATTESTATION_SCHEMA) {
            revert InvalidEscrowAttestation();
        }

        if (!escrow._checkIntrinsic()) revert InvalidEscrowAttestation();
        if (msg.sender != fulfillment.recipient) revert UnauthorizedCall();

        // Extract arbiter and demand from escrow data
        (address arbiter, bytes memory demand) = decodeCondition(escrow.data);

        // UNCONDITIONAL: No fulfillment intrinsic or refUID check
        // Use this when fulfillment policy is fully delegated to arbiters

        // Check fulfillment via the specified arbiter
        if (!IArbiter(arbiter).check(fulfillment, demand, escrow.uid)) {
            revert InvalidFulfillment();
        }

        // Revoke attestation
        try eas.revoke(
            RevocationRequest({schema: ATTESTATION_SCHEMA, data: RevocationRequestData({uid: _escrow, value: 0})})
        ) {}
        catch {
            revert RevocationFailed(_escrow);
        }

        // Execute the partial escrow release (continues on failure)
        _releaseEscrowPartial(escrow.data, fulfillment.recipient);

        emit EscrowCollected(_escrow, _fulfillment, fulfillment.recipient);
        return true;
    }

    /// @notice Unsafe partial reclaim - continues on individual transfer failures
    /// @dev Use only as a last resort when some tokens in the bundle cannot be reclaimed.
    /// Failed transfers emit events but do not revert. The escrow will be marked as reclaimed
    /// even if some tokens remain stuck. This can result in permanent loss of stuck tokens.
    function unsafePartiallyReclaimExpired(bytes32 uid) external nonReentrant returns (bool) {
        Attestation memory attestation = _getExistingAttestation(uid);

        // Validate attestation uses correct schema
        if (attestation.schema != ATTESTATION_SCHEMA) {
            revert InvalidEscrowAttestation();
        }

        // Prevent reclaiming non-expiring attestations (expirationTime 0 means never expires)
        if (attestation.expirationTime == 0) revert UnauthorizedCall();

        if (block.timestamp < attestation.expirationTime) {
            revert UnauthorizedCall();
        }

        if (msg.sender != attestation.recipient) revert UnauthorizedCall();

        // Revoke attestation to prevent re-entry
        try eas.revoke(
            RevocationRequest({schema: ATTESTATION_SCHEMA, data: RevocationRequestData({uid: uid, value: 0})})
        ) {}
        catch {
            revert RevocationFailed(uid);
        }

        // Return escrowed value to original recipient (continues on failure)
        _releaseEscrowPartial(attestation.data, attestation.recipient);

        return true;
    }

    /// @notice Loads and decodes bundle escrow data from this contract's attestation.
    function getObligationData(bytes32 uid) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    /// @notice Decodes ABI-encoded bundle escrow data.
    function decodeObligationData(bytes calldata data) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
