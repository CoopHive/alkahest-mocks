// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {TokenBundleEscrowObligation} from "../../../obligations/escrow/default/TokenBundleEscrowObligation.sol";
import {TokenBundleSplitterBase} from "./TokenBundleSplitterBase.sol";

/// @notice Token bundle splitter without validation of split totals.
///         Cheaper oracle calls, but incorrect splits will only surface
///         as reverts during collectAndDistribute (over-allocation) or
///         stranded tokens in the splitter (under-allocation).
/// @title TokenBundleSplitterUnvalidated
/// @notice Token-bundle splitter variant that stores oracle splits without validating totals up front.
/// @dev Distribution can still fail later if the stored split asks for more than was collected.
/// @dev Security note: This contract has not been included in professional manual audits and
///      has only been reviewed by automated audit tooling so far.
contract TokenBundleSplitterUnvalidated is TokenBundleSplitterBase {
    constructor(IEAS _eas, TokenBundleEscrowObligation _escrowObligation)
        TokenBundleSplitterBase(_eas, _escrowObligation)
    {}

    /// @notice Oracle submits a split decision without validation.
    ///         Only checks for empty splits and zero-address recipients.
    /// @inheritdoc TokenBundleSplitterBase
    function arbitrate(bytes32 fulfillment, bytes32 escrow, BundleSplit[] calldata splits) external override {
        if (fulfillment == bytes32(0)) revert InvalidFulfillmentUid();

        bytes32 decisionKey = _decisionKey(fulfillment, escrow);

        _storeDecision(msg.sender, decisionKey, splits);

        emit ArbitrationMade(decisionKey, escrow, msg.sender);
    }
}
