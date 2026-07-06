// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {TokenBundleEscrowObligation} from "../../../obligations/escrow/default/TokenBundleEscrowObligation.sol";
import {CommitmentTokenBundleSplitterBase} from "./CommitmentTokenBundleSplitterBase.sol";

/// @notice Token bundle splitter with full validation of split totals
///         against the escrow's obligation data in arbitrate().
///         More expensive oracle calls, but guarantees correctness at submission time.
/// @title CommitmentTokenBundleSplitter
/// @notice Validated commitment token-bundle splitter that requires split totals to match the escrowed bundle.
/// @dev Security note: This contract has not been included in professional manual audits and
///      has only been reviewed by automated audit tooling so far.
contract CommitmentTokenBundleSplitter is CommitmentTokenBundleSplitterBase {
    error InvalidNativeSplitTotal(uint256 expected, uint256 provided);
    error InvalidERC20SplitTotal(uint256 tokenIndex, uint256 expected, uint256 provided);
    error InvalidERC1155SplitTotal(uint256 tokenIndex, uint256 expected, uint256 provided);
    error InvalidERC20ArrayLength(uint256 splitIndex, uint256 expected, uint256 provided);
    error InvalidERC1155ArrayLength(uint256 splitIndex, uint256 expected, uint256 provided);
    error DuplicateERC721Assignment(uint256 tokenIndex);
    error MissingERC721Assignment(uint256 tokenIndex);
    error InvalidERC721Index(uint256 index, uint256 max);

    constructor(IEAS _eas, TokenBundleEscrowObligation _escrowObligation)
        CommitmentTokenBundleSplitterBase(_eas, _escrowObligation)
    {}

    /// @notice Oracle submits a split decision with full validation.
    ///         Validates that all split amounts sum to the escrow totals,
    ///         and that each ERC721 is assigned to exactly one recipient.
    /// @inheritdoc CommitmentTokenBundleSplitterBase
    function arbitrate(bytes32 intentHash, bytes32 escrow, BundleSplit[] calldata splits) external override {
        Attestation memory escrowAttestation = eas.getAttestation(escrow);
        EscrowObligationData memory escrowData = abi.decode(escrowAttestation.data, (EscrowObligationData));

        _validateSplits(splits, escrowData);

        bytes32 decisionKey = _decisionKey(intentHash, escrow);

        _storeDecision(msg.sender, decisionKey, splits);

        emit ArbitrationMade(decisionKey, intentHash, msg.sender);
    }

    function _validateSplits(BundleSplit[] calldata splits, EscrowObligationData memory escrowData) internal pure {
        if (splits.length == 0) revert EmptySplits();

        uint256 numSplits = splits.length;

        // --- Native token totals ---
        uint256 nativeTotal;
        for (uint256 s; s < numSplits; ++s) {
            nativeTotal += splits[s].nativeAmount;
        }
        if (nativeTotal != escrowData.nativeAmount) {
            revert InvalidNativeSplitTotal(escrowData.nativeAmount, nativeTotal);
        }

        // --- ERC20 totals ---
        uint256 numErc20 = escrowData.erc20Tokens.length;
        for (uint256 s; s < numSplits; ++s) {
            if (splits[s].erc20Amounts.length != numErc20) {
                revert InvalidERC20ArrayLength(s, numErc20, splits[s].erc20Amounts.length);
            }
        }
        for (uint256 t; t < numErc20; ++t) {
            uint256 total;
            for (uint256 s; s < numSplits; ++s) {
                total += splits[s].erc20Amounts[t];
            }
            if (total != escrowData.erc20Amounts[t]) {
                revert InvalidERC20SplitTotal(t, escrowData.erc20Amounts[t], total);
            }
        }

        // --- ERC721 assignments (each must appear exactly once) ---
        uint256 numErc721 = escrowData.erc721Tokens.length;
        bool[] memory assigned = new bool[](numErc721);
        for (uint256 s; s < numSplits; ++s) {
            for (uint256 i; i < splits[s].erc721Indices.length; ++i) {
                uint256 idx = splits[s].erc721Indices[i];
                if (idx >= numErc721) {
                    revert InvalidERC721Index(idx, numErc721);
                }
                if (assigned[idx]) {
                    revert DuplicateERC721Assignment(idx);
                }
                assigned[idx] = true;
            }
        }
        for (uint256 t; t < numErc721; ++t) {
            if (!assigned[t]) revert MissingERC721Assignment(t);
        }

        // --- ERC1155 totals ---
        uint256 numErc1155 = escrowData.erc1155Tokens.length;
        for (uint256 s; s < numSplits; ++s) {
            if (splits[s].erc1155Amounts.length != numErc1155) {
                revert InvalidERC1155ArrayLength(s, numErc1155, splits[s].erc1155Amounts.length);
            }
        }
        for (uint256 t; t < numErc1155; ++t) {
            uint256 total;
            for (uint256 s; s < numSplits; ++s) {
                total += splits[s].erc1155Amounts[t];
            }
            if (total != escrowData.erc1155Amounts[t]) {
                revert InvalidERC1155SplitTotal(t, escrowData.erc1155Amounts[t], total);
            }
        }
    }
}
