// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {IEAS, Attestation} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {CommitRevealObligation} from "@src/obligations/CommitRevealObligation.sol";
import {NativeTokenEscrowObligation} from "@src/obligations/escrow/default/NativeTokenEscrowObligation.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract CommitRevealObligationTest is Test {
    CommitRevealObligation public obligation;
    NativeTokenEscrowObligation public nativeEscrow;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    address internal claimer;
    address internal treasury;
    uint256 internal constant BOND = 0.1 ether;
    uint256 internal constant COMMIT_DEADLINE = 1 hours;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        treasury = makeAddr("treasury");
        obligation = new CommitRevealObligation(eas, schemaRegistry, treasury);
        nativeEscrow = new NativeTokenEscrowObligation(eas, schemaRegistry);
        claimer = makeAddr("claimer");
    }

    function _obligationData() internal pure returns (CommitRevealObligation.ObligationData memory) {
        return CommitRevealObligation.ObligationData({
            payload: bytes("payload"), salt: bytes32("salt"), schema: bytes32("schema-tag")
        });
    }

    function _demand(uint256 bondAmount) internal pure returns (bytes memory) {
        return _demand(bondAmount, COMMIT_DEADLINE);
    }

    function _demand(uint256 bondAmount, uint256 commitDeadline) internal pure returns (bytes memory) {
        return abi.encode(CommitRevealObligation.DemandData({bondAmount: bondAmount, commitDeadline: commitDeadline}));
    }

    function _makeEscrow(uint256 bondAmount) internal returns (bytes32 escrowUid, bytes memory demand) {
        demand = _demand(bondAmount);
        NativeTokenEscrowObligation.ObligationData memory escrowData =
            NativeTokenEscrowObligation.ObligationData({arbiter: address(obligation), demand: demand, amount: 0});
        escrowUid = nativeEscrow.doObligation{value: 0}(escrowData, 0);
    }

    function testCommitRevealReclaimsCommittedBondAndSatisfiesDemand() public {
        (bytes32 escrowUid, bytes memory demand) = _makeEscrow(BOND);
        CommitRevealObligation.ObligationData memory data = _obligationData();
        bytes32 commitment = obligation.computeCommitment(claimer, escrowUid, data);

        vm.deal(claimer, BOND);
        vm.prank(claimer);
        obligation.commit{value: BOND}(commitment, COMMIT_DEADLINE);

        vm.roll(block.number + 1);

        uint256 claimerBalanceBefore = claimer.balance;
        vm.prank(claimer);
        bytes32 fulfillmentUid = obligation.doObligation(data, escrowUid);

        assertEq(claimer.balance, claimerBalanceBefore + BOND, "claimer received committed bond");

        Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);
        assertFalse(fulfillment.revocable);
        assertTrue(obligation.check(fulfillment, demand, escrowUid));
    }

    function testCheckObligationReturnsFalseForMismatchedBondDemand() public {
        (bytes32 escrowUid, bytes memory demand) = _makeEscrow(BOND);
        CommitRevealObligation.ObligationData memory data = _obligationData();
        bytes32 commitment = obligation.computeCommitment(claimer, escrowUid, data);

        vm.deal(claimer, BOND / 2);
        vm.prank(claimer);
        obligation.commit{value: BOND / 2}(commitment, COMMIT_DEADLINE);

        vm.roll(block.number + 1);

        uint256 claimerBalanceBefore = claimer.balance;
        vm.prank(claimer);
        bytes32 fulfillmentUid = obligation.doObligation(data, escrowUid);

        assertEq(claimer.balance, claimerBalanceBefore + BOND / 2, "claimer received actual committed bond");

        Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);
        assertFalse(obligation.check(fulfillment, demand, escrowUid));
        assertTrue(obligation.check(fulfillment, _demand(BOND / 2), escrowUid));
    }

    function testRevealRequiresCommitterAsRecipient() public {
        (bytes32 escrowUid,) = _makeEscrow(BOND);
        CommitRevealObligation.ObligationData memory data = _obligationData();
        address otherRecipient = makeAddr("otherRecipient");
        bytes32 commitment = obligation.computeCommitment(otherRecipient, escrowUid, data);

        vm.deal(claimer, BOND);
        vm.prank(claimer);
        obligation.commit{value: BOND}(commitment, COMMIT_DEADLINE);

        vm.roll(block.number + 1);

        vm.prank(claimer);
        vm.expectRevert(
            abi.encodeWithSelector(CommitRevealObligation.UnauthorizedReveal.selector, claimer, claimer, otherRecipient)
        );
        obligation.doObligationFor(data, otherRecipient, escrowUid);
    }

    function testThirdPartyCannotRevealForCommitterRecipient() public {
        (bytes32 escrowUid,) = _makeEscrow(BOND);
        CommitRevealObligation.ObligationData memory data = _obligationData();
        bytes32 commitment = obligation.computeCommitment(claimer, escrowUid, data);
        address attacker = makeAddr("attacker");

        vm.deal(claimer, BOND);
        vm.prank(claimer);
        obligation.commit{value: BOND}(commitment, COMMIT_DEADLINE);

        vm.roll(block.number + 1);

        vm.prank(attacker);
        vm.expectRevert(
            abi.encodeWithSelector(CommitRevealObligation.UnauthorizedReveal.selector, attacker, claimer, claimer)
        );
        obligation.doObligationFor(data, claimer, escrowUid);

        vm.prank(claimer);
        obligation.doObligation(data, escrowUid);
    }

    function testCommitRejectsZeroBond() public {
        (bytes32 escrowUid,) = _makeEscrow(BOND);
        CommitRevealObligation.ObligationData memory data = _obligationData();
        bytes32 commitment = obligation.computeCommitment(claimer, escrowUid, data);

        vm.prank(claimer);
        vm.expectRevert(CommitRevealObligation.ZeroBondAmount.selector);
        obligation.commit{value: 0}(commitment, COMMIT_DEADLINE);
    }

    function testSlashBondUsesCommittedAmount() public {
        (bytes32 escrowUid,) = _makeEscrow(BOND);
        CommitRevealObligation.ObligationData memory data = _obligationData();
        bytes32 commitment = obligation.computeCommitment(claimer, escrowUid, data);
        uint256 committedBond = BOND / 2;

        vm.deal(claimer, committedBond);
        vm.prank(claimer);
        obligation.commit{value: committedBond}(commitment, COMMIT_DEADLINE);

        vm.warp(block.timestamp + COMMIT_DEADLINE + 1);

        uint256 treasuryBefore = treasury.balance;
        uint256 slashed = obligation.slashBond(commitment);

        assertEq(slashed, committedBond, "slashed committed amount");
        assertEq(treasury.balance, treasuryBefore + committedBond, "treasury received committed bond");
    }

    function testOwnerCannotMakeExistingCommitmentTooLateByChangingGlobalDeadline() public {
        (bytes32 escrowUid, bytes memory demand) = _makeEscrow(BOND);
        CommitRevealObligation.ObligationData memory data = _obligationData();
        bytes32 commitment = obligation.computeCommitment(claimer, escrowUid, data);

        vm.deal(claimer, BOND);
        vm.prank(claimer);
        obligation.commit{value: BOND}(commitment, COMMIT_DEADLINE);

        vm.roll(block.number + 1);
        vm.warp(block.timestamp + 2 minutes);
        vm.prank(claimer);
        bytes32 fulfillmentUid = obligation.doObligation(data, escrowUid);

        Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);
        assertTrue(obligation.check(fulfillment, demand, escrowUid));
    }

    function testOwnerCannotMakeExistingCommitmentSlashableByChangingGlobalDeadline() public {
        (bytes32 escrowUid,) = _makeEscrow(BOND);
        CommitRevealObligation.ObligationData memory data = _obligationData();
        bytes32 commitment = obligation.computeCommitment(claimer, escrowUid, data);

        vm.deal(claimer, BOND);
        vm.prank(claimer);
        obligation.commit{value: BOND}(commitment, COMMIT_DEADLINE);

        vm.warp(block.timestamp + 2 minutes);
        vm.expectRevert(abi.encodeWithSelector(CommitRevealObligation.CommitDeadlineNotReached.selector, commitment));
        obligation.slashBond(commitment);
    }

    function testCheckObligationReturnsFalseForMismatchedDeadlineDemand() public {
        (bytes32 escrowUid, bytes memory demand) = _makeEscrow(BOND);
        CommitRevealObligation.ObligationData memory data = _obligationData();
        bytes32 commitment = obligation.computeCommitment(claimer, escrowUid, data);

        vm.deal(claimer, BOND);
        vm.prank(claimer);
        obligation.commit{value: BOND}(commitment, COMMIT_DEADLINE * 2);

        vm.roll(block.number + 1);

        vm.prank(claimer);
        bytes32 fulfillmentUid = obligation.doObligation(data, escrowUid);

        Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);
        assertFalse(obligation.check(fulfillment, demand, escrowUid));
        assertTrue(obligation.check(fulfillment, _demand(BOND, COMMIT_DEADLINE * 2), escrowUid));
    }

    function testCheckObligationAcceptsDifferentEscrowUidForGlobalReveal() public {
        (bytes32 escrowUid, bytes memory demand) = _makeEscrow(BOND);
        (bytes32 otherEscrowUid,) = _makeEscrow(BOND);
        CommitRevealObligation.ObligationData memory data = _obligationData();
        bytes32 commitment = obligation.computeCommitment(claimer, escrowUid, data);

        vm.deal(claimer, BOND);
        vm.prank(claimer);
        obligation.commit{value: BOND}(commitment, COMMIT_DEADLINE);

        vm.roll(block.number + 1);

        vm.prank(claimer);
        bytes32 fulfillmentUid = obligation.doObligation(data, escrowUid);

        Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);
        assertTrue(obligation.check(fulfillment, demand, otherEscrowUid));
    }

    function testCommitmentBindsRefUid() public {
        (bytes32 escrowUid,) = _makeEscrow(BOND);
        (bytes32 otherEscrowUid,) = _makeEscrow(BOND);
        CommitRevealObligation.ObligationData memory data = _obligationData();
        bytes32 commitment = obligation.computeCommitment(claimer, escrowUid, data);

        vm.deal(claimer, BOND);
        vm.prank(claimer);
        obligation.commit{value: BOND}(commitment, COMMIT_DEADLINE);

        vm.roll(block.number + 1);

        vm.prank(claimer);
        vm.expectRevert();
        obligation.doObligation(data, otherEscrowUid);
    }

    function testCommitmentBindsExpirationTime() public {
        (bytes32 escrowUid,) = _makeEscrow(BOND);
        CommitRevealObligation.ObligationData memory data = _obligationData();
        uint64 expirationTime = uint64(block.timestamp + 1 days);
        bytes32 commitment = obligation.computeCommitment(claimer, expirationTime, escrowUid, data);

        vm.deal(claimer, BOND);
        vm.prank(claimer);
        obligation.commit{value: BOND}(commitment, COMMIT_DEADLINE);

        vm.roll(block.number + 1);

        vm.prank(claimer);
        vm.expectRevert();
        obligation.doObligation(data, escrowUid);

        vm.prank(claimer);
        bytes32 fulfillmentUid = obligation.doObligation(data, expirationTime, escrowUid);

        Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);
        assertEq(fulfillment.expirationTime, expirationTime);
    }

    function testComputeRawCommitmentMatchesTypedCommitment() public view {
        bytes32 escrowUid = keccak256(bytes("escrow"));
        CommitRevealObligation.ObligationData memory data = _obligationData();
        bytes memory encodedData = abi.encode(data);

        assertEq(
            obligation.computeRawCommitment(claimer, 0, escrowUid, encodedData),
            obligation.computeCommitment(claimer, escrowUid, data)
        );
    }

    function testDecodeDemandData() public view {
        CommitRevealObligation.DemandData memory decoded = obligation.decodeDemandData(_demand(BOND));
        assertEq(decoded.bondAmount, BOND);
        assertEq(decoded.commitDeadline, COMMIT_DEADLINE);
    }
}
