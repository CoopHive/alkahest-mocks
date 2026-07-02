// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {CommitmentTrustedOracleArbiter} from "@src/arbiters/trusted-oracle/CommitmentTrustedOracleArbiter.sol";
import {CommitRevealObligation} from "@src/obligations/CommitRevealObligation.sol";
import {NativeTokenEscrowObligation} from "@src/obligations/escrow/default/NativeTokenEscrowObligation.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract CommitmentTrustedOracleArbiterTest is Test {
    CommitmentTrustedOracleArbiter internal arbiter;
    CommitRevealObligation internal commitReveal;
    NativeTokenEscrowObligation internal nativeEscrow;
    IEAS internal eas;
    ISchemaRegistry internal schemaRegistry;

    address internal oracle;
    address internal claimer;
    address internal attacker;
    address internal treasury;

    uint256 internal constant BOND = 0.1 ether;
    uint256 internal constant COMMIT_DEADLINE = 1 hours;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        arbiter = new CommitmentTrustedOracleArbiter();

        treasury = makeAddr("treasury");
        commitReveal = new CommitRevealObligation(eas, schemaRegistry, treasury);
        nativeEscrow = new NativeTokenEscrowObligation(eas, schemaRegistry);

        oracle = makeAddr("oracle");
        claimer = makeAddr("claimer");
        attacker = makeAddr("attacker");
    }

    function _obligationData() internal pure returns (CommitRevealObligation.ObligationData memory) {
        return CommitRevealObligation.ObligationData({
            payload: bytes("payload"), salt: bytes32("salt"), schema: bytes32("schema-tag")
        });
    }

    function _demand(bytes memory oracleContext) internal view returns (bytes memory) {
        return abi.encode(CommitmentTrustedOracleArbiter.DemandData({oracle: oracle, data: oracleContext}));
    }

    function _makeEscrow() internal returns (bytes32) {
        NativeTokenEscrowObligation.ObligationData memory escrowData =
            NativeTokenEscrowObligation.ObligationData({arbiter: address(arbiter), demand: _demand(""), amount: 0});
        return nativeEscrow.doObligation{value: 0}(escrowData, 0);
    }

    function _intentHash(
        address recipient,
        uint64 expirationTime,
        bytes32 refUID,
        CommitRevealObligation.ObligationData memory data
    ) internal view returns (bytes32) {
        return arbiter.attestationIntentHash(
            commitReveal.ATTESTATION_SCHEMA(),
            address(commitReveal),
            recipient,
            expirationTime,
            false,
            refUID,
            abi.encode(data)
        );
    }

    function testOracleCanApproveCommitRevealIntentBeforeFulfillmentExists() public {
        bytes32 escrowUid = _makeEscrow();
        bytes memory oracleContext = abi.encode("capitalize hello");
        CommitRevealObligation.ObligationData memory data = _obligationData();

        bytes32 commitment = commitReveal.computeCommitment(claimer, escrowUid, data);
        bytes32 intentHash = _intentHash(claimer, 0, escrowUid, data);

        vm.prank(oracle);
        arbiter.arbitrate(intentHash, oracleContext, true);

        vm.deal(claimer, BOND);
        vm.prank(claimer);
        commitReveal.commit{value: BOND}(commitment, COMMIT_DEADLINE);

        vm.roll(block.number + 1);

        vm.prank(claimer);
        bytes32 fulfillmentUid = commitReveal.doObligation(data, escrowUid);
        Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);

        assertEq(arbiter.attestationIntentHash(fulfillment), intentHash);
        assertTrue(arbiter.check(fulfillment, _demand(oracleContext), escrowUid));
    }

    function testCopiedRevealForDifferentRecipientDoesNotUseOriginalApproval() public {
        bytes32 escrowUid = _makeEscrow();
        bytes memory oracleContext = abi.encode("capitalize hello");
        CommitRevealObligation.ObligationData memory data = _obligationData();

        bytes32 claimerIntentHash = _intentHash(claimer, 0, escrowUid, data);

        vm.prank(oracle);
        arbiter.arbitrate(claimerIntentHash, oracleContext, true);

        bytes32 attackerCommitment = commitReveal.computeCommitment(attacker, escrowUid, data);
        vm.deal(attacker, BOND);
        vm.prank(attacker);
        commitReveal.commit{value: BOND}(attackerCommitment, COMMIT_DEADLINE);

        vm.roll(block.number + 1);

        vm.prank(attacker);
        bytes32 attackerFulfillmentUid = commitReveal.doObligation(data, escrowUid);
        Attestation memory attackerFulfillment = eas.getAttestation(attackerFulfillmentUid);

        bytes32 attackerIntentHash = arbiter.attestationIntentHash(attackerFulfillment);
        assertNotEq(attackerIntentHash, claimerIntentHash);
        assertFalse(arbiter.check(attackerFulfillment, _demand(oracleContext), escrowUid));
    }

    function testDecisionIsScopedByDemandContext() public {
        bytes32 escrowUid = _makeEscrow();
        bytes memory approvedContext = abi.encode("approved");
        bytes memory otherContext = abi.encode("other");
        CommitRevealObligation.ObligationData memory data = _obligationData();

        bytes32 commitment = commitReveal.computeCommitment(claimer, escrowUid, data);
        bytes32 intentHash = _intentHash(claimer, 0, escrowUid, data);

        vm.prank(oracle);
        arbiter.arbitrate(intentHash, approvedContext, true);

        vm.deal(claimer, BOND);
        vm.prank(claimer);
        commitReveal.commit{value: BOND}(commitment, COMMIT_DEADLINE);

        vm.roll(block.number + 1);

        vm.prank(claimer);
        bytes32 fulfillmentUid = commitReveal.doObligation(data, escrowUid);
        Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);

        assertTrue(arbiter.check(fulfillment, _demand(approvedContext), escrowUid));
        assertFalse(arbiter.check(fulfillment, _demand(otherContext), escrowUid));
    }

    function testIntentHashBindsExpirationAndDataHash() public view {
        bytes32 escrowUid = keccak256("escrow");
        CommitRevealObligation.ObligationData memory data = _obligationData();
        CommitRevealObligation.ObligationData memory otherData =
            CommitRevealObligation.ObligationData({payload: bytes("other"), salt: data.salt, schema: data.schema});

        bytes32 baseIntent = _intentHash(claimer, 0, escrowUid, data);
        bytes32 expiringIntent = _intentHash(claimer, 1 days, escrowUid, data);
        bytes32 otherDataIntent = _intentHash(claimer, 0, escrowUid, otherData);

        assertNotEq(baseIntent, expiringIntent);
        assertNotEq(baseIntent, otherDataIntent);
    }

    function testDecodeDemandData() public view {
        bytes memory context = abi.encode("context");
        CommitmentTrustedOracleArbiter.DemandData memory decoded = arbiter.decodeDemandData(_demand(context));

        assertEq(decoded.oracle, oracle);
        assertEq(decoded.data, context);
    }
}
