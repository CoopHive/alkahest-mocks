// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {SplitterVerification} from "../SplitterVerification.sol";
import {CommitmentBaseSplitter} from "./CommitmentBaseSplitter.sol";
import {ERC20EscrowObligation} from "../../../obligations/escrow/default/ERC20EscrowObligation.sol";

/// @title CommitmentERC20Splitter
/// @notice Collects ERC20 escrows and distributes the received amount according to oracle-provided splits.
/// @dev Security note: This contract has not been included in professional manual audits and
///      has only been reviewed by automated audit tooling so far.
contract CommitmentERC20Splitter is CommitmentBaseSplitter {
    using SplitterVerification for Attestation;
    using SafeERC20 for IERC20;

    /// @notice One ERC20 distribution recipient and amount.
    struct Split {
        address recipient;
        uint256 amount;
    }

    /// @notice Arbiter demand identifying the trusted oracle and opaque context.
    struct DemandData {
        address oracle;
        bytes data;
    }

    /// @notice ERC20 escrow data decoded to validate split totals.
    struct EscrowObligationData {
        address arbiter;
        bytes demand;
        address token;
        uint256 amount;
    }

    /// @notice Emitted when an oracle records ERC20 splits for a future fulfillment intent and escrow.
    event ArbitrationMade(
        bytes32 indexed decisionKey, bytes32 indexed intentHash, address indexed oracle, Split[] splits
    );
    /// @notice Emitted after an escrow is collected and ERC20 splits are distributed.
    event EscrowCollectedAndDistributed(
        bytes32 indexed escrowUid,
        bytes32 indexed fulfillmentUid,
        address indexed fulfiller,
        address token,
        Split[] splits
    );
    event ERC20TransferFailedOnDistribute(address indexed recipient, address indexed token, uint256 amount);

    error InvalidSplits(uint256 totalExpected, uint256 totalProvided);
    error ERC20TransferFailed(address token, address to, uint256 amount);

    mapping(address => mapping(bytes32 => Split[])) internal decisions;

    constructor(IEAS _eas, ERC20EscrowObligation _escrowObligation) CommitmentBaseSplitter(_eas, _escrowObligation) {}

    /// @notice Records the caller's split decision for a future fulfillment intent and escrow.
    function arbitrate(bytes32 intentHash, bytes32 escrow, Split[] calldata splits) external {
        Attestation memory escrowAttestation = eas.getAttestation(escrow);
        EscrowObligationData memory escrowData = abi.decode(escrowAttestation.data, (EscrowObligationData));
        _validateSplitsTotal(splits, escrowData.amount);

        bytes32 decisionKey = _decisionKey(intentHash, escrow);
        _storeDecision(msg.sender, decisionKey, splits);

        emit ArbitrationMade(decisionKey, intentHash, msg.sender, splits);
    }

    /// @notice Collects an ERC20 escrow and distributes tokens per oracle splits.
    ///         Reverts if any transfer fails.
    function collectAndDistribute(bytes32 escrow, bytes32 fulfillment) external nonReentrant {
        (Split[] memory splits, address token) = _collectAndDecode(escrow, fulfillment);
        address fulfiller = _recordedFulfiller(fulfillment);
        for (uint256 i; i < splits.length; ++i) {
            address recipient = _resolveSentinel(splits[i].recipient, fulfillment, fulfiller);
            bool success = IERC20(token).trySafeTransfer(recipient, splits[i].amount);
            if (!success) revert ERC20TransferFailed(token, recipient, splits[i].amount);
        }
        emit EscrowCollectedAndDistributed(escrow, fulfillment, fulfiller, token, splits);
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
        (Split[] memory splits, address token) = _collectAndDecode(escrow, fulfillmentUid);
        address fulfiller = _recordedFulfiller(fulfillmentUid);
        for (uint256 i; i < splits.length; ++i) {
            address recipient = _resolveSentinel(splits[i].recipient, fulfillmentUid, fulfiller);
            bool success = IERC20(token).trySafeTransfer(recipient, splits[i].amount);
            if (!success) revert ERC20TransferFailed(token, recipient, splits[i].amount);
        }
        emit EscrowCollectedAndDistributed(escrow, fulfillmentUid, fulfiller, token, splits);
    }

    /// @notice Unsafe partial distribution -- continues on individual transfer failures.
    /// @dev Use only as a last resort when collectAndDistribute is permanently blocked.
    ///      Failed transfers emit events but do not revert. Stuck tokens remain in the splitter.
    function unsafePartiallyCollectAndDistribute(bytes32 escrow, bytes32 fulfillment) external nonReentrant {
        _authorizePartialSettlement(fulfillment);
        (Split[] memory splits, address token) = _collectAndDecode(escrow, fulfillment);
        address fulfiller = _recordedFulfiller(fulfillment);
        for (uint256 i; i < splits.length; ++i) {
            address recipient = _resolveSentinel(splits[i].recipient, fulfillment, fulfiller);
            bool success = IERC20(token).trySafeTransfer(recipient, splits[i].amount);
            if (!success) {
                emit ERC20TransferFailedOnDistribute(recipient, token, splits[i].amount);
            }
        }
        emit EscrowCollectedAndDistributed(escrow, fulfillment, fulfiller, token, splits);
    }

    function _collectAndDecode(bytes32 escrow, bytes32 fulfillment)
        internal
        returns (Split[] memory splits, address token)
    {
        Attestation memory escrowAttestation = eas.getAttestation(escrow);
        escrowAttestation.verifyEscrowAttestation(address(escrowObligation));
        Attestation memory fulfillmentAttestation = eas.getAttestation(fulfillment);
        fulfillmentAttestation.verifyFulfillmentRecipient();

        EscrowObligationData memory escrowData = abi.decode(escrowAttestation.data, (EscrowObligationData));
        DemandData memory demandData = abi.decode(escrowData.demand, (DemandData));
        splits = decisions[demandData.oracle][_decisionKeyForFulfillment(fulfillmentAttestation, escrow)];
        token = escrowData.token;
        uint256 balanceBefore = IERC20(token).balanceOf(address(this));
        _collectEscrow(escrow, fulfillment);
        SplitterVerification.verifyDelta(balanceBefore, IERC20(token).balanceOf(address(this)), escrowData.amount);
    }

    /// @notice Returns ERC20 splits recorded by an oracle for a fulfillment intent and escrow.
    function getSplits(address oracle, bytes32 intentHash, bytes32 escrow) external view returns (Split[] memory) {
        return decisions[oracle][_decisionKey(intentHash, escrow)];
    }

    /// @notice Decodes ABI-encoded ERC20 splitter demand data.
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
