// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ArbiterUtils} from "@src/libraries/ArbiterUtils.sol";
import {BaseObligation} from "@src/obligations/BaseObligation.sol";
import {BaseArbiter} from "@src/BaseArbiter.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {IEscrow} from "@src/IEscrow.sol";

/// @title GlobalBondCommitRevealObligation
/// @notice Example commit-reveal obligation variant with a globally configured bond.
/// @notice Obligation with built-in commit–reveal anti-front‑running checks.
/// The attestation data is self contained (payload + salt), and the arbiter
/// verifies that a matching commit exists and was made in an earlier block.
///
/// Bond lifecycle:
///   1. `commit()` — locks a bond and records the commitment hash.
///   2. `doObligation()` (reveal) — creates the fulfillment attestation,
///      validates the commitment, enforces the deadline, and atomically
///      returns the bond to the committer.
///   3. `slashBond()` — after the deadline, anyone can slash the bond of
///      a commitment that was never revealed (bond not already reclaimed).
contract GlobalBondCommitRevealObligation is BaseObligation, BaseArbiter, Ownable {
    using ArbiterUtils for Attestation;

    /// @dev Data stored inside the fulfillment attestation.
    struct ObligationData {
        bytes payload; // arbitrary self-contained data the fulfiller reveals
        bytes32 salt; // fulfiller-chosen salt to harden the commitment
        bytes32 schema; // arbitrary tag describing the payload format
    }

    /// @dev Commitment details for a commitment hash.
    struct CommitInfo {
        uint64 commitBlock;
        uint64 commitTimestamp;
        address committer;
    }

    struct BondEpoch {
        uint64 startBlock;
        uint256 amount;
    }

    /// @notice commitments[commitment] => commit information.
    mapping(bytes32 => CommitInfo) public commitments;
    /// @notice commitmentClaimed[commitment] => bond already returned/slashed.
    mapping(bytes32 => bool) public commitmentClaimed;

    event Committed(bytes32 indexed commitment, address indexed claimer);
    event BondReclaimed(bytes32 indexed fulfillmentUid, address indexed claimer, uint256 amount);
    event BondSlashed(bytes32 indexed commitment, address indexed recipient, uint256 amount);

    error CommitmentMissing(bytes32 commitment, address claimer);
    error CommitmentTooRecent(bytes32 commitment, address claimer);
    error CommitmentAlreadyExists(bytes32 commitment);
    error BondAlreadyClaimed(bytes32 commitment);
    error BondTransferFailed(address claimer, uint256 amount);
    error SlashTransferFailed(address recipient, uint256 amount);
    error EmptyCommitment();
    error IncorrectBondAmount(uint256 provided, uint256 required);
    error CommitDeadlineNotReached(bytes32 commitment);
    error RevealTooLate(bytes32 commitment);
    error UnauthorizedReveal(address caller, address committer, address recipient);
    error EscrowCollectionFailed(address escrowContract, bytes32 escrowUid, bytes32 fulfillmentUid, bytes result);

    /// @notice Bond amount epochs. Updates take effect starting the next block.
    BondEpoch[] public bondEpochs;
    /// @notice Seconds after commit within which the reveal must occur to avoid slashing.
    uint256 public commitDeadline;
    /// @notice Recipient of slashed bonds (address(0) = burn).
    address public slashedBondRecipient;

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry,
        uint256 _bondAmount,
        uint256 _commitDeadline,
        address _slashedBondRecipient
    ) BaseObligation(_eas, _schemaRegistry, "bytes payload, bytes32 salt, bytes32 schema", true) Ownable(msg.sender) {
        bondEpochs.push(BondEpoch({startBlock: 0, amount: _bondAmount}));
        commitDeadline = _commitDeadline;
        slashedBondRecipient = _slashedBondRecipient;
    }

    // ---------------------------------------------------------------------
    // Owner-only setters
    // ---------------------------------------------------------------------

    function setBondAmount(uint256 _bondAmount) external onlyOwner {
        uint64 startBlock = uint64(block.number + 1);
        uint256 lastIndex = bondEpochs.length - 1;
        if (bondEpochs[lastIndex].startBlock == startBlock) {
            bondEpochs[lastIndex].amount = _bondAmount;
        } else {
            bondEpochs.push(BondEpoch({startBlock: startBlock, amount: _bondAmount}));
        }
    }

    function setCommitDeadline(uint256 _commitDeadline) external onlyOwner {
        commitDeadline = _commitDeadline;
    }

    function setSlashedBondRecipient(address _slashedBondRecipient) external onlyOwner {
        slashedBondRecipient = _slashedBondRecipient;
    }

    // ---------------------------------------------------------------------
    // Attestation (reveal) path
    // ---------------------------------------------------------------------

    /// @notice Creates a fulfillment attestation containing the payload and salt.
    ///         Validates the commitment, enforces the reveal deadline, and
    ///         atomically returns the bond to the committer.
    /// @param data Revealed data (must match a prior commit) and salt.
    /// @param refUID Escrow attestation UID being fulfilled.
    function doObligation(ObligationData calldata data, bytes32 refUID) external returns (bytes32 uid_) {
        bytes memory encodedData = abi.encode(data);
        uid_ = _doObligationForRaw(encodedData, 0, msg.sender, refUID);
    }

    /// @notice Creates a fulfillment attestation with an explicit recipient.
    ///         The reveal caller, original committer, and attestation recipient
    ///         must all be the same address.
    /// @param data Revealed data (must match a prior commit) and salt.
    /// @param recipient The address to set as the attestation recipient.
    /// @param refUID Escrow attestation UID being fulfilled.
    function doObligationFor(ObligationData calldata data, address recipient, bytes32 refUID)
        external
        returns (bytes32 uid_)
    {
        bytes memory encodedData = abi.encode(data);
        uid_ = _doObligationForRaw(encodedData, 0, recipient, refUID);
    }

    /// @notice Reveals a fulfillment and immediately collects the target escrow.
    /// @param recipient Recipient to set on the fulfillment attestation; must
    ///        equal the original committer and reveal caller.
    function revealAndCollect(
        ObligationData calldata data,
        address recipient,
        IEscrow escrowContract,
        bytes32 escrowUid
    ) external returns (bytes32 fulfillmentUid, bytes memory collectResult) {
        bytes memory encodedData = abi.encode(data);
        fulfillmentUid = _doObligationForRaw(encodedData, 0, recipient, escrowUid);

        try escrowContract.collect(escrowUid, fulfillmentUid) returns (bytes memory result) {
            collectResult = result;
        } catch (bytes memory reason) {
            revert EscrowCollectionFailed(address(escrowContract), escrowUid, fulfillmentUid, reason);
        }
    }

    /// @dev After the attestation is created, validate the commitment, enforce
    ///      the deadline, and reclaim the bond atomically.
    function _afterAttest(Attestation memory attestation) internal override {
        bytes32 revealedCommitment =
            keccak256(abi.encode(attestation.refUID, attestation.recipient, keccak256(attestation.data)));

        CommitInfo memory info = commitments[revealedCommitment];

        // Commitment must exist
        if (info.committer == address(0)) {
            revert CommitmentMissing(revealedCommitment, attestation.recipient);
        }

        if (info.committer != msg.sender || info.committer != attestation.recipient) {
            revert UnauthorizedReveal(msg.sender, info.committer, attestation.recipient);
        }

        // Commitment must be from a prior block (anti-frontrun)
        if (info.commitBlock >= block.number) {
            revert CommitmentTooRecent(revealedCommitment, attestation.recipient);
        }

        // Reveal must be within the deadline
        if (block.timestamp > uint256(info.commitTimestamp) + commitDeadline) {
            revert RevealTooLate(revealedCommitment);
        }

        // Bond must not already be claimed (e.g. slashed)
        if (commitmentClaimed[revealedCommitment]) {
            revert BondAlreadyClaimed(revealedCommitment);
        }

        // Atomically reclaim bond
        uint256 amount = _bondAmountAtBlock(info.commitBlock);
        commitmentClaimed[revealedCommitment] = true;

        (bool success,) = info.committer.call{value: amount}("");
        if (!success) revert BondTransferFailed(info.committer, amount);

        emit BondReclaimed(attestation.uid, info.committer, amount);
    }

    // ---------------------------------------------------------------------
    // Commit phase helpers
    // ---------------------------------------------------------------------

    /// @notice Records a commitment hash, locking the fixed bond.
    /// @param commitment keccak256(abi.encode(refUID, claimer, keccak256(abi.encode(data)))).
    /// @dev msg.value must equal the active `bondAmount()` and is held as a bond reclaimable after a valid reveal.
    function commit(bytes32 commitment) external payable {
        if (commitment == bytes32(0)) revert EmptyCommitment();
        uint256 activeBondAmount = bondAmount();
        if (msg.value != activeBondAmount) revert IncorrectBondAmount(msg.value, activeBondAmount);

        if (commitments[commitment].committer != address(0)) {
            revert CommitmentAlreadyExists(commitment);
        }

        commitments[commitment] = CommitInfo({
            commitBlock: uint64(block.number), commitTimestamp: uint64(block.timestamp), committer: msg.sender
        });

        emit Committed(commitment, msg.sender);
    }

    /// @notice Pure helper to compute the commitment expected by this contract.
    function computeCommitment(bytes32 refUID, address claimer, ObligationData calldata data)
        external
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(refUID, claimer, keccak256(abi.encode(data))));
    }

    // ---------------------------------------------------------------------
    // Arbiter logic (called from escrow contracts)
    // ---------------------------------------------------------------------

    /// @inheritdoc IArbiter
    function check(
        Attestation memory obligation,
        bytes memory,
        /* demand (unused) */
        bytes32 /* fulfilling (unused) */
    )
        public
        view
        override
        returns (bool)
    {
        // Basic attestation sanity checks (schema + expiry + revocation)
        if (obligation.schema != ATTESTATION_SCHEMA) return false;

        // Lookup the prior commitment for the fulfiller
        bytes32 revealedCommitment =
            keccak256(abi.encode(obligation.refUID, obligation.recipient, keccak256(obligation.data)));
        CommitInfo memory info = commitments[revealedCommitment];
        if (info.committer == address(0)) {
            revert CommitmentMissing(revealedCommitment, obligation.recipient);
        }

        // Enforce commitment age to block same-block frontruns
        if (info.commitBlock >= block.number) {
            revert CommitmentTooRecent(revealedCommitment, obligation.recipient);
        }

        // Enforce reveal deadline: the attestation must have been created
        // within the commit deadline window
        if (obligation.time > info.commitTimestamp + commitDeadline) {
            revert RevealTooLate(revealedCommitment);
        }

        return true;
    }

    // ---------------------------------------------------------------------
    // Bond slashing
    // ---------------------------------------------------------------------

    /// @notice Slashes the bond for a commitment whose deadline has passed without a valid reveal.
    /// @param commitment The commitment hash whose bond is being slashed.
    function slashBond(bytes32 commitment) external nonReentrant returns (uint256 amount) {
        CommitInfo memory info = commitments[commitment];
        if (info.committer == address(0)) revert CommitmentMissing(commitment, address(0));
        if (block.timestamp <= info.commitTimestamp + commitDeadline) {
            revert CommitDeadlineNotReached(commitment);
        }
        if (commitmentClaimed[commitment]) revert BondAlreadyClaimed(commitment);

        amount = _bondAmountAtBlock(info.commitBlock);
        commitmentClaimed[commitment] = true;

        (bool success,) = slashedBondRecipient.call{value: amount}("");
        if (!success) revert SlashTransferFailed(slashedBondRecipient, amount);

        emit BondSlashed(commitment, slashedBondRecipient, amount);
    }

    // ---------------------------------------------------------------------
    // Convenience getters
    // ---------------------------------------------------------------------

    function getObligationData(bytes32 uid) external view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    function decodeObligationData(bytes calldata data) external pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }

    function bondAmount() public view returns (uint256) {
        return _bondAmountAtBlock(block.number);
    }

    function bondEpochCount() external view returns (uint256) {
        return bondEpochs.length;
    }

    function _bondAmountAtBlock(uint256 targetBlock) internal view returns (uint256) {
        for (uint256 i = bondEpochs.length; i > 0; --i) {
            BondEpoch memory epoch = bondEpochs[i - 1];
            if (targetBlock >= epoch.startBlock) {
                return epoch.amount;
            }
        }
        revert();
    }
}
