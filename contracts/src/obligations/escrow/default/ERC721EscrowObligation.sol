// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {BaseEscrowObligation} from "../BaseEscrowObligation.sol";
import {IArbiter} from "../../../IArbiter.sol";
import {BaseArbiter} from "../../../BaseArbiter.sol";
import {ArbiterUtils} from "../../../libraries/ArbiterUtils.sol";
import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @title ERC721EscrowObligation
/// @notice Escrows an ERC721 token behind an arbiter-defined fulfillment condition.
/// @dev Uses the default escrow checks: fulfillment must reference the escrow UID and pass intrinsic attestation validation.
contract ERC721EscrowObligation is BaseEscrowObligation, BaseArbiter {
    using ArbiterUtils for Attestation;

    /// @notice ERC721 escrow terms encoded in each escrow attestation.
    struct ObligationData {
        address arbiter;
        bytes demand;
        address token;
        uint256 tokenId;
    }

    /// @notice Raised when the ERC721 transfer fails or ownership does not move as expected.
    error ERC721TransferFailed(address token, address from, address to, uint256 tokenId);

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        BaseEscrowObligation(
            _eas, _schemaRegistry, "address arbiter, bytes demand, address token, uint256 tokenId", true
        )
    {}

    /// @inheritdoc BaseEscrowObligation
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(BaseEscrowObligation, BaseArbiter)
        returns (bool)
    {
        return interfaceId == type(IArbiter).interfaceId || super.supportsInterface(interfaceId);
    }

    // Extract arbiter and demand from encoded data
    /// @inheritdoc BaseEscrowObligation
    function decodeCondition(bytes memory data) public pure override returns (address arbiter, bytes memory demand) {
        ObligationData memory decoded = abi.decode(data, (ObligationData));
        return (decoded.arbiter, decoded.demand);
    }

    // Transfer token into escrow
    function _lockEscrow(bytes memory data, address from) internal override {
        ObligationData memory decoded = abi.decode(data, (ObligationData));

        // Check ownership before transfer
        address ownerBefore = IERC721(decoded.token).ownerOf(decoded.tokenId);
        if (ownerBefore != from) {
            revert ERC721TransferFailed(decoded.token, from, address(this), decoded.tokenId);
        }

        try IERC721(decoded.token).transferFrom(from, address(this), decoded.tokenId) {
        // Transfer succeeded
        }
        catch {
            revert ERC721TransferFailed(decoded.token, from, address(this), decoded.tokenId);
        }

        // Check ownership after transfer
        address ownerAfter = IERC721(decoded.token).ownerOf(decoded.tokenId);
        if (ownerAfter != address(this)) {
            revert ERC721TransferFailed(decoded.token, from, address(this), decoded.tokenId);
        }
    }

    // Transfer token to fulfiller
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

        // Check ownership before transfer
        address ownerBefore = IERC721(decoded.token).ownerOf(decoded.tokenId);
        if (ownerBefore != address(this)) {
            revert ERC721TransferFailed(decoded.token, address(this), to, decoded.tokenId);
        }

        try IERC721(decoded.token).transferFrom(address(this), to, decoded.tokenId) {
        // Transfer succeeded
        }
        catch {
            revert ERC721TransferFailed(decoded.token, address(this), to, decoded.tokenId);
        }

        // Check ownership after transfer
        address ownerAfter = IERC721(decoded.token).ownerOf(decoded.tokenId);
        if (ownerAfter != to) {
            revert ERC721TransferFailed(decoded.token, address(this), to, decoded.tokenId);
        }

        return "";
    }

    // Return token to original owner on expiry
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
            && payment.arbiter == demandData.arbiter && keccak256(payment.demand) == keccak256(demandData.demand);
    }

    // Typed convenience methods
    /// @notice Locks the ERC721 token and creates an escrow attestation for the caller.
    function doObligation(ObligationData calldata data, uint64 expirationTime) external returns (bytes32) {
        return _doObligationForRaw(abi.encode(data), expirationTime, msg.sender, bytes32(0));
    }

    /// @notice Locks the ERC721 token and creates an escrow attestation for an explicit recipient.
    function doObligationFor(ObligationData calldata data, uint64 expirationTime, address recipient)
        external
        returns (bytes32)
    {
        return _doObligationForRaw(abi.encode(data), expirationTime, recipient, bytes32(0));
    }

    /// @notice Loads and decodes ERC721 escrow data from this contract's attestation.
    function getObligationData(bytes32 uid) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    /// @notice Decodes ABI-encoded ERC721 escrow data.
    function decodeObligationData(bytes calldata data) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
