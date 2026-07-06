// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {BaseArbiter} from "../../../BaseArbiter.sol";
import {SplitterVerification} from "../SplitterVerification.sol";
import {BaseSplitter} from "./BaseSplitter.sol";
import {IEscrow} from "../../../IEscrow.sol";

/// @title TokenBundleSplitterBase
/// @notice Shared collection and distribution logic for token-bundle splitters.
/// @dev Security note: Token-bundle splitter contracts were not included in the
///      professional manual audits and have only been reviewed by automated audit tooling so far.
abstract contract TokenBundleSplitterBase is BaseSplitter, ERC1155Holder {
    using SplitterVerification for Attestation;
    using SafeERC20 for IERC20;

    /// @notice One mixed-token distribution recipient and asset bundle.
    struct BundleSplit {
        address recipient;
        uint256 nativeAmount;
        uint256[] erc20Amounts;
        uint256[] erc721Indices;
        uint256[] erc1155Amounts;
    }

    /// @notice Arbiter demand identifying the trusted oracle and opaque context.
    struct DemandData {
        address oracle;
        bytes data;
    }

    /// @notice Token-bundle escrow data decoded to validate split totals.
    struct EscrowObligationData {
        address arbiter;
        bytes demand;
        uint256 nativeAmount;
        address[] erc20Tokens;
        uint256[] erc20Amounts;
        address[] erc721Tokens;
        uint256[] erc721TokenIds;
        address[] erc1155Tokens;
        uint256[] erc1155TokenIds;
        uint256[] erc1155Amounts;
    }

    event ArbitrationMade(bytes32 indexed decisionKey, bytes32 indexed fulfillmentUid, address indexed oracle);
    event EscrowCollectedAndDistributed(
        bytes32 indexed escrowUid, bytes32 indexed fulfillmentUid, address indexed fulfiller
    );
    event NativeTransferFailedOnDistribute(address indexed recipient, uint256 amount);
    event ERC20TransferFailedOnDistribute(address indexed recipient, address indexed token, uint256 amount);
    event ERC721TransferFailedOnDistribute(address indexed recipient, address indexed token, uint256 tokenId);
    event ERC1155TransferFailedOnDistribute(
        address indexed recipient, address indexed token, uint256 tokenId, uint256 amount
    );

    error NativeTokenTransferFailed(address to, uint256 amount);
    error ERC20TransferFailed(address token, address to, uint256 amount);
    error ERC721TransferFailed(address token, address to, uint256 tokenId);
    error ERC1155TransferFailed(address token, address to, uint256 tokenId, uint256 amount);

    mapping(address => mapping(bytes32 => BundleSplit[])) internal decisions;

    constructor(IEAS _eas, IEscrow _escrowObligation) BaseSplitter(_eas, _escrowObligation) {}

    /// @inheritdoc BaseArbiter
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(BaseArbiter, ERC1155Holder)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // -----------------------------------------------------------------
    // Oracle arbitration
    // -----------------------------------------------------------------

    /// @notice Records the caller's split decision for a fulfillment and escrow.
    function arbitrate(bytes32 fulfillment, bytes32 escrow, BundleSplit[] calldata splits) external virtual;

    function _storeDecision(address oracle, bytes32 decisionKey, BundleSplit[] calldata splits) internal {
        if (splits.length == 0) revert EmptySplits();
        if (splits.length > MAX_SPLITS) revert TooManySplits(splits.length, MAX_SPLITS);
        delete decisions[oracle][decisionKey];
        for (uint256 i; i < splits.length; ++i) {
            decisions[oracle][decisionKey].push();
            BundleSplit storage stored = decisions[oracle][decisionKey][i];
            stored.recipient = splits[i].recipient;
            stored.nativeAmount = splits[i].nativeAmount;
            delete stored.erc20Amounts;
            delete stored.erc721Indices;
            delete stored.erc1155Amounts;
            for (uint256 j; j < splits[i].erc20Amounts.length; ++j) {
                stored.erc20Amounts.push(splits[i].erc20Amounts[j]);
            }
            for (uint256 j; j < splits[i].erc721Indices.length; ++j) {
                stored.erc721Indices.push(splits[i].erc721Indices[j]);
            }
            for (uint256 j; j < splits[i].erc1155Amounts.length; ++j) {
                stored.erc1155Amounts.push(splits[i].erc1155Amounts[j]);
            }
        }
        hasDecision[oracle][decisionKey] = true;
    }

    // -----------------------------------------------------------------
    // Collect + distribute
    // -----------------------------------------------------------------

    /// @notice Collects a token bundle escrow and distributes assets. Reverts if any transfer fails.
    /// @notice Collects a token-bundle escrow and distributes all assets per oracle splits.
    function collectAndDistribute(bytes32 escrow, bytes32 fulfillment) external nonReentrant {
        (BundleSplit[] memory splits, EscrowObligationData memory escrowData) = _collectAndDecode(escrow, fulfillment);
        address fulfiller = _recordedFulfiller(fulfillment);
        for (uint256 s; s < splits.length; ++s) {
            address recipient = _resolveSentinel(splits[s].recipient, fulfillment, fulfiller);
            _distributeAtomic(splits[s], escrowData, recipient);
        }
        emit EscrowCollectedAndDistributed(escrow, fulfillment, fulfiller);
    }

    /// @notice Unsafe partial distribution — continues on individual transfer failures.
    /// @dev Use only as a last resort when collectAndDistribute is permanently blocked.
    ///      Failed transfers emit events but do not revert. Stuck tokens remain in the splitter.
    function unsafePartiallyCollectAndDistribute(bytes32 escrow, bytes32 fulfillment) external nonReentrant {
        _authorizePartialSettlement(fulfillment);
        (BundleSplit[] memory splits, EscrowObligationData memory escrowData) = _collectAndDecode(escrow, fulfillment);
        address fulfiller = _recordedFulfiller(fulfillment);
        for (uint256 s; s < splits.length; ++s) {
            address recipient = _resolveSentinel(splits[s].recipient, fulfillment, fulfiller);
            _distributePartial(splits[s], escrowData, recipient);
        }
        emit EscrowCollectedAndDistributed(escrow, fulfillment, fulfiller);
    }

    // -----------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------

    function _collectAndDecode(bytes32 escrow, bytes32 fulfillment)
        internal
        returns (BundleSplit[] memory splits, EscrowObligationData memory escrowData)
    {
        Attestation memory escrowAttestation = eas.getAttestation(escrow);
        escrowAttestation.verifyEscrowAttestation(address(escrowObligation));
        Attestation memory fulfillmentAttestation = eas.getAttestation(fulfillment);
        fulfillmentAttestation.verifyFulfillmentRecipient();

        escrowData = abi.decode(escrowAttestation.data, (EscrowObligationData));
        DemandData memory demandData = abi.decode(escrowData.demand, (DemandData));
        splits = decisions[demandData.oracle][_decisionKeyForFulfillment(fulfillmentAttestation, escrow)];
        _verifyERC721NotAlreadyHeld(escrowData);
        uint256 nativeBefore = address(this).balance;
        uint256[] memory erc20Before = _erc20Balances(escrowData);
        uint256[] memory erc1155Before = _erc1155Balances(escrowData);
        _collectEscrow(escrow, fulfillment);
        _verifyCollectedDeltas(escrowData, nativeBefore, erc20Before, erc1155Before);
    }

    function _erc20Balances(EscrowObligationData memory escrowData) internal view returns (uint256[] memory balances) {
        balances = new uint256[](escrowData.erc20Tokens.length);
        for (uint256 i; i < escrowData.erc20Tokens.length; ++i) {
            balances[i] = IERC20(escrowData.erc20Tokens[i]).balanceOf(address(this));
        }
    }

    function _erc1155Balances(EscrowObligationData memory escrowData)
        internal
        view
        returns (uint256[] memory balances)
    {
        balances = new uint256[](escrowData.erc1155Tokens.length);
        for (uint256 i; i < escrowData.erc1155Tokens.length; ++i) {
            balances[i] = IERC1155(escrowData.erc1155Tokens[i]).balanceOf(address(this), escrowData.erc1155TokenIds[i]);
        }
    }

    function _verifyERC721NotAlreadyHeld(EscrowObligationData memory escrowData) internal view {
        for (uint256 i; i < escrowData.erc721Tokens.length; ++i) {
            if (IERC721(escrowData.erc721Tokens[i]).ownerOf(escrowData.erc721TokenIds[i]) == address(this)) {
                revert SplitterVerification.InvalidERC721Receipt(
                    escrowData.erc721Tokens[i], escrowData.erc721TokenIds[i]
                );
            }
        }
    }

    function _verifyCollectedDeltas(
        EscrowObligationData memory escrowData,
        uint256 nativeBefore,
        uint256[] memory erc20Before,
        uint256[] memory erc1155Before
    ) internal view {
        SplitterVerification.verifyDelta(nativeBefore, address(this).balance, escrowData.nativeAmount);

        for (uint256 i; i < escrowData.erc20Tokens.length; ++i) {
            if (!_isFirstERC20Occurrence(escrowData, i)) continue;

            uint256 expectedAmount = _totalERC20Amount(escrowData, i);
            SplitterVerification.verifyDelta(
                erc20Before[i], IERC20(escrowData.erc20Tokens[i]).balanceOf(address(this)), expectedAmount
            );
        }

        for (uint256 i; i < escrowData.erc721Tokens.length; ++i) {
            if (IERC721(escrowData.erc721Tokens[i]).ownerOf(escrowData.erc721TokenIds[i]) != address(this)) {
                revert SplitterVerification.InvalidERC721Receipt(
                    escrowData.erc721Tokens[i], escrowData.erc721TokenIds[i]
                );
            }
        }

        for (uint256 i; i < escrowData.erc1155Tokens.length; ++i) {
            if (!_isFirstERC1155Occurrence(escrowData, i)) continue;

            uint256 expectedAmount = _totalERC1155Amount(escrowData, i);
            SplitterVerification.verifyDelta(
                erc1155Before[i],
                IERC1155(escrowData.erc1155Tokens[i]).balanceOf(address(this), escrowData.erc1155TokenIds[i]),
                expectedAmount
            );
        }
    }

    function _isFirstERC20Occurrence(EscrowObligationData memory escrowData, uint256 index)
        internal
        pure
        returns (bool)
    {
        address token = escrowData.erc20Tokens[index];
        for (uint256 i; i < index; ++i) {
            if (escrowData.erc20Tokens[i] == token) return false;
        }
        return true;
    }

    function _totalERC20Amount(EscrowObligationData memory escrowData, uint256 index)
        internal
        pure
        returns (uint256 amount)
    {
        address token = escrowData.erc20Tokens[index];
        for (uint256 i; i < escrowData.erc20Tokens.length; ++i) {
            if (escrowData.erc20Tokens[i] == token) {
                amount += escrowData.erc20Amounts[i];
            }
        }
    }

    function _isFirstERC1155Occurrence(EscrowObligationData memory escrowData, uint256 index)
        internal
        pure
        returns (bool)
    {
        address token = escrowData.erc1155Tokens[index];
        uint256 tokenId = escrowData.erc1155TokenIds[index];
        for (uint256 i; i < index; ++i) {
            if (escrowData.erc1155Tokens[i] == token && escrowData.erc1155TokenIds[i] == tokenId) return false;
        }
        return true;
    }

    function _totalERC1155Amount(EscrowObligationData memory escrowData, uint256 index)
        internal
        pure
        returns (uint256 amount)
    {
        address token = escrowData.erc1155Tokens[index];
        uint256 tokenId = escrowData.erc1155TokenIds[index];
        for (uint256 i; i < escrowData.erc1155Tokens.length; ++i) {
            if (escrowData.erc1155Tokens[i] == token && escrowData.erc1155TokenIds[i] == tokenId) {
                amount += escrowData.erc1155Amounts[i];
            }
        }
    }

    function _distributeAtomic(BundleSplit memory split, EscrowObligationData memory escrowData, address recipient)
        internal
    {
        if (split.nativeAmount > 0) {
            (bool success,) = payable(recipient).call{value: split.nativeAmount}("");
            if (!success) revert NativeTokenTransferFailed(recipient, split.nativeAmount);
        }
        for (uint256 i; i < split.erc20Amounts.length; ++i) {
            if (split.erc20Amounts[i] > 0) {
                bool success = IERC20(escrowData.erc20Tokens[i]).trySafeTransfer(recipient, split.erc20Amounts[i]);
                if (!success) revert ERC20TransferFailed(escrowData.erc20Tokens[i], recipient, split.erc20Amounts[i]);
            }
        }
        for (uint256 i; i < split.erc721Indices.length; ++i) {
            uint256 idx = split.erc721Indices[i];
            try IERC721(escrowData.erc721Tokens[idx])
                .safeTransferFrom(address(this), recipient, escrowData.erc721TokenIds[idx]) {}
            catch {
                revert ERC721TransferFailed(escrowData.erc721Tokens[idx], recipient, escrowData.erc721TokenIds[idx]);
            }
        }
        for (uint256 i; i < split.erc1155Amounts.length; ++i) {
            if (split.erc1155Amounts[i] > 0) {
                try IERC1155(escrowData.erc1155Tokens[i])
                    .safeTransferFrom(
                        address(this), recipient, escrowData.erc1155TokenIds[i], split.erc1155Amounts[i], ""
                    ) {}
                catch {
                    revert ERC1155TransferFailed(
                        escrowData.erc1155Tokens[i], recipient, escrowData.erc1155TokenIds[i], split.erc1155Amounts[i]
                    );
                }
            }
        }
    }

    function _distributePartial(BundleSplit memory split, EscrowObligationData memory escrowData, address recipient)
        internal
    {
        if (split.nativeAmount > 0) {
            (bool success,) = payable(recipient).call{value: split.nativeAmount}("");
            if (!success) emit NativeTransferFailedOnDistribute(recipient, split.nativeAmount);
        }
        for (uint256 i; i < split.erc20Amounts.length; ++i) {
            if (split.erc20Amounts[i] > 0) {
                bool success = IERC20(escrowData.erc20Tokens[i]).trySafeTransfer(recipient, split.erc20Amounts[i]);
                if (!success) {
                    emit ERC20TransferFailedOnDistribute(recipient, escrowData.erc20Tokens[i], split.erc20Amounts[i]);
                }
            }
        }
        for (uint256 i; i < split.erc721Indices.length; ++i) {
            uint256 idx = split.erc721Indices[i];
            try IERC721(escrowData.erc721Tokens[idx])
                .safeTransferFrom(address(this), recipient, escrowData.erc721TokenIds[idx]) {}
            catch {
                emit ERC721TransferFailedOnDistribute(
                    recipient, escrowData.erc721Tokens[idx], escrowData.erc721TokenIds[idx]
                );
            }
        }
        for (uint256 i; i < split.erc1155Amounts.length; ++i) {
            if (split.erc1155Amounts[i] > 0) {
                try IERC1155(escrowData.erc1155Tokens[i])
                    .safeTransferFrom(
                        address(this), recipient, escrowData.erc1155TokenIds[i], split.erc1155Amounts[i], ""
                    ) {}
                catch {
                    emit ERC1155TransferFailedOnDistribute(
                        recipient, escrowData.erc1155Tokens[i], escrowData.erc1155TokenIds[i], split.erc1155Amounts[i]
                    );
                }
            }
        }
    }

    // -----------------------------------------------------------------
    // View helpers
    // -----------------------------------------------------------------

    /// @notice Returns bundle splits recorded by an oracle for a fulfillment and escrow.
    function getSplits(address oracle, bytes32 fulfillment, bytes32 escrow)
        external
        view
        returns (BundleSplit[] memory)
    {
        return decisions[oracle][_decisionKey(fulfillment, escrow)];
    }

    /// @notice Decodes ABI-encoded token-bundle splitter demand data.
    function decodeDemandData(bytes calldata data) external pure returns (DemandData memory) {
        return abi.decode(data, (DemandData));
    }
}
