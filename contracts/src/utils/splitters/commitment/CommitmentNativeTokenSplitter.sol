// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {SplitterVerification} from "../SplitterVerification.sol";
import {CommitmentBaseSplitter} from "./CommitmentBaseSplitter.sol";
import {NativeTokenEscrowObligation} from "../../../obligations/escrow/default/NativeTokenEscrowObligation.sol";

/// @title CommitmentNativeTokenSplitter
/// @notice Collects native-token escrows and distributes the received amount according to oracle-provided splits.
/// @dev Security note: This contract has not been included in professional manual audits and
///      has only been reviewed by automated audit tooling so far.
contract CommitmentNativeTokenSplitter is CommitmentBaseSplitter {
    using SplitterVerification for Attestation;

    /// @notice One native-token distribution recipient and amount.
    struct Split {
        address recipient;
        uint256 amount;
    }

    /// @notice Arbiter demand identifying the trusted oracle and opaque context.
    struct DemandData {
        address oracle;
        bytes data;
    }

    /// @notice Native-token escrow data decoded to validate split totals.
    struct EscrowObligationData {
        address arbiter;
        bytes demand;
        uint256 amount;
    }

    /// @notice Emitted when an oracle records native-token splits for a future fulfillment intent and escrow.
    event ArbitrationMade(
        bytes32 indexed decisionKey, bytes32 indexed intentHash, address indexed oracle, Split[] splits
    );
    /// @notice Emitted after an escrow is collected and native-token splits are distributed.
    event EscrowCollectedAndDistributed(
        bytes32 indexed escrowUid, bytes32 indexed fulfillmentUid, address indexed fulfiller, Split[] splits
    );
    event NativeTransferFailedOnDistribute(address indexed recipient, uint256 amount);

    error InvalidSplits(uint256 totalExpected, uint256 totalProvided);
    error NativeTokenTransferFailed(address to, uint256 amount);

    mapping(address => mapping(bytes32 => Split[])) internal decisions;

    constructor(IEAS _eas, NativeTokenEscrowObligation _escrowObligation)
        CommitmentBaseSplitter(_eas, _escrowObligation)
    {}

    /// @notice Records the caller's split decision for a future fulfillment intent and escrow.
    function arbitrate(bytes32 intentHash, bytes32 escrow, Split[] calldata splits) external {
        Attestation memory escrowAttestation = eas.getAttestation(escrow);
        EscrowObligationData memory escrowData = abi.decode(escrowAttestation.data, (EscrowObligationData));
        _validateSplitsTotal(splits, escrowData.amount);

        bytes32 decisionKey = _decisionKey(intentHash, escrow);
        _storeDecision(msg.sender, decisionKey, splits);

        emit ArbitrationMade(decisionKey, intentHash, msg.sender, splits);
    }

    /// @notice Collects a native token escrow and distributes ETH. Reverts if any transfer fails.
    function collectAndDistribute(bytes32 escrow, bytes32 fulfillment) external nonReentrant {
        Split[] memory splits = _collectAndDecode(escrow, fulfillment);
        address fulfiller = _recordedFulfiller(fulfillment);
        for (uint256 i; i < splits.length; ++i) {
            address recipient = _resolveSentinel(splits[i].recipient, fulfillment, fulfiller);
            (bool success,) = payable(recipient).call{value: splits[i].amount}("");
            if (!success) revert NativeTokenTransferFailed(recipient, splits[i].amount);
        }
        emit EscrowCollectedAndDistributed(escrow, fulfillment, fulfiller, splits);
    }

    /// @notice Creates a splitter-owned fulfillment and atomically collects and distributes the escrow.
    function createFulfillmentAndCollectAndDistribute(
        bytes32 escrow,
        address obligationContract,
        bytes calldata data,
        uint64 expirationTime,
        bytes32 refUID
    ) external payable nonReentrant returns (bytes32 fulfillmentUid) {
        fulfillmentUid = _createFulfillment(obligationContract, data, expirationTime, refUID);
        Split[] memory splits = _collectAndDecode(escrow, fulfillmentUid);
        address fulfiller = _recordedFulfiller(fulfillmentUid);
        for (uint256 i; i < splits.length; ++i) {
            address recipient = _resolveSentinel(splits[i].recipient, fulfillmentUid, fulfiller);
            (bool success,) = payable(recipient).call{value: splits[i].amount}("");
            if (!success) revert NativeTokenTransferFailed(recipient, splits[i].amount);
        }
        emit EscrowCollectedAndDistributed(escrow, fulfillmentUid, fulfiller, splits);
    }

    /// @notice Unsafe partial distribution -- continues on individual transfer failures.
    function unsafePartiallyCollectAndDistribute(bytes32 escrow, bytes32 fulfillment) external nonReentrant {
        _authorizePartialSettlement(fulfillment);
        Split[] memory splits = _collectAndDecode(escrow, fulfillment);
        address fulfiller = _recordedFulfiller(fulfillment);
        for (uint256 i; i < splits.length; ++i) {
            address recipient = _resolveSentinel(splits[i].recipient, fulfillment, fulfiller);
            (bool success,) = payable(recipient).call{value: splits[i].amount}("");
            if (!success) {
                emit NativeTransferFailedOnDistribute(recipient, splits[i].amount);
            }
        }
        emit EscrowCollectedAndDistributed(escrow, fulfillment, fulfiller, splits);
    }

    function _collectAndDecode(bytes32 escrow, bytes32 fulfillment) internal returns (Split[] memory splits) {
        Attestation memory escrowAttestation = eas.getAttestation(escrow);
        escrowAttestation.verifyEscrowAttestation(address(escrowObligation));
        Attestation memory fulfillmentAttestation = eas.getAttestation(fulfillment);
        fulfillmentAttestation.verifyFulfillmentRecipient();

        EscrowObligationData memory escrowData = abi.decode(escrowAttestation.data, (EscrowObligationData));
        DemandData memory demandData = abi.decode(escrowData.demand, (DemandData));
        splits = decisions[demandData.oracle][_decisionKeyForFulfillment(fulfillmentAttestation, escrow)];
        uint256 balanceBefore = address(this).balance;
        _collectEscrow(escrow, fulfillment);
        SplitterVerification.verifyDelta(balanceBefore, address(this).balance, escrowData.amount);
    }

    /// @notice Returns native-token splits recorded by an oracle for a fulfillment intent and escrow.
    function getSplits(address oracle, bytes32 intentHash, bytes32 escrow) external view returns (Split[] memory) {
        return decisions[oracle][_decisionKey(intentHash, escrow)];
    }

    /// @notice Decodes ABI-encoded native-token splitter demand data.
    function decodeDemandData(bytes calldata data) external pure returns (DemandData memory) {
        return abi.decode(data, (DemandData));
    }

    function _validateSplitsTotal(Split[] calldata splits, uint256 expected) internal pure {
        _validateSplitCount(splits.length);

        uint256 total;
        for (uint256 i; i < splits.length; ++i) {
            total += splits[i].amount;
        }
        if (total != expected) revert InvalidSplits(expected, total);
    }

    function _storeDecision(address oracle, bytes32 decisionKey, Split[] calldata splits) internal {
        delete decisions[oracle][decisionKey];
        for (uint256 i; i < splits.length; ++i) {
            decisions[oracle][decisionKey].push(splits[i]);
        }
        _setDecisionRecorded(oracle, decisionKey);
    }
}
