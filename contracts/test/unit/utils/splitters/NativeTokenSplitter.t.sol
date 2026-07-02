// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {BaseSplitter} from "@src/utils/splitters/default/BaseSplitter.sol";
import {NativeTokenSplitter} from "@src/utils/splitters/default/NativeTokenSplitter.sol";
import {BaseEscrowObligation} from "@src/BaseEscrowObligation.sol";
import {NativeTokenEscrowObligation} from "@src/obligations/escrow/default/NativeTokenEscrowObligation.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {IEscrow} from "@src/IEscrow.sol";
import {IEAS, Attestation} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";

import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract CollectVictimNativeEscrowObligation is StringObligation {
    IEscrow internal immutable escrow;
    bytes32 internal immutable victimEscrow;
    bytes32 internal immutable victimFulfillment;

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry,
        IEscrow _escrow,
        bytes32 _victimEscrow,
        bytes32 _victimFulfillment
    ) StringObligation(_eas, _schemaRegistry) {
        escrow = _escrow;
        victimEscrow = _victimEscrow;
        victimFulfillment = _victimFulfillment;
    }

    function _afterAttest(Attestation memory) internal override {
        escrow.collect(victimEscrow, victimFulfillment);
    }
}

contract RejectingNativeRecipient {
    receive() external payable {
        revert("NO_ETH");
    }
}

contract NativeTokenSplitterTest is Test {
    NativeTokenSplitter public splitter;
    NativeTokenEscrowObligation public escrowObligation;
    StringObligation public stringObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    address buyer = makeAddr("buyer");
    address oracle = makeAddr("oracle");
    address executor = makeAddr("executor");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address carol = makeAddr("carol");

    uint256 constant AMOUNT = 1 ether;
    uint64 constant EXPIRATION = 365 days;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();
        escrowObligation = new NativeTokenEscrowObligation(eas, schemaRegistry);
        splitter = new NativeTokenSplitter(eas, escrowObligation);
        stringObligation = new StringObligation(eas, schemaRegistry);
        vm.deal(buyer, 10 ether);
        vm.deal(executor, 1 ether);
    }

    function _createEscrow(address _buyer, uint256 amount, uint64 expiration) internal returns (bytes32) {
        bytes memory demand = abi.encode(NativeTokenSplitter.DemandData({oracle: oracle, data: bytes("")}));
        NativeTokenEscrowObligation.ObligationData memory data =
            NativeTokenEscrowObligation.ObligationData({amount: amount, arbiter: address(splitter), demand: demand});
        vm.prank(_buyer);
        return escrowObligation.doObligation{value: amount}(data, expiration);
    }

    function _createFulfillmentViaSplitter(address _executor, bytes32 escrowUid) internal returns (bytes32) {
        bytes memory obligationData =
            abi.encode(StringObligation.ObligationData({item: "fulfillment", schema: bytes32(0)}));
        vm.prank(_executor);
        return splitter.createFulfillment(address(stringObligation), obligationData, 0, escrowUid);
    }

    function testCreateFulfillmentRecordsFulfiller() public {
        bytes32 escrowUid = _createEscrow(buyer, AMOUNT, uint64(block.timestamp + EXPIRATION));
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);
        assertEq(splitter.fulfillers(fulfillmentUid), executor);
        Attestation memory f = eas.getAttestation(fulfillmentUid);
        assertEq(f.recipient, address(splitter));
    }

    function testCreateFulfillmentRejectsVictimEscrowCollectedByMaliciousObligation() public {
        bytes32 victimEscrowUid = _createEscrow(buyer, AMOUNT, uint64(block.timestamp + EXPIRATION));
        bytes32 victimFulfillmentUid = _createFulfillmentViaSplitter(executor, victimEscrowUid);

        NativeTokenSplitter.Split[] memory splits = new NativeTokenSplitter.Split[](1);
        splits[0] = NativeTokenSplitter.Split({recipient: alice, amount: AMOUNT});
        vm.prank(oracle);
        splitter.arbitrate(victimFulfillmentUid, victimEscrowUid, splits);

        CollectVictimNativeEscrowObligation maliciousObligation = new CollectVictimNativeEscrowObligation(
            eas, schemaRegistry, IEscrow(address(escrowObligation)), victimEscrowUid, victimFulfillmentUid
        );
        bytes memory attackData =
            abi.encode(StringObligation.ObligationData({item: "attacker-fulfillment", schema: bytes32(0)}));

        address attacker = makeAddr("attacker");
        uint256 attackerBalanceBefore = attacker.balance;

        vm.prank(attacker);
        vm.expectRevert(BaseEscrowObligation.InvalidFulfillment.selector);
        splitter.createFulfillment(address(maliciousObligation), attackData, 0, bytes32(0));

        assertEq(attacker.balance, attackerBalanceBefore, "attacker does not receive victim escrow as refund");
        assertEq(address(splitter).balance, 0, "victim escrow is not collected into splitter");
        assertEq(address(escrowObligation).balance, AMOUNT, "victim escrow remains locked");
        assertEq(alice.balance, 0, "victim split has not been distributed through fake refund path");

        Attestation memory victimEscrow = eas.getAttestation(victimEscrowUid);
        assertEq(victimEscrow.revocationTime, 0, "malicious obligation does not consume victim escrow");
    }

    function testCollectAndDistribute() public {
        bytes32 escrowUid = _createEscrow(buyer, AMOUNT, uint64(block.timestamp + EXPIRATION));
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);

        NativeTokenSplitter.Split[] memory splits = new NativeTokenSplitter.Split[](2);
        splits[0] = NativeTokenSplitter.Split({recipient: alice, amount: 0.6 ether});
        splits[1] = NativeTokenSplitter.Split({recipient: bob, amount: 0.4 ether});

        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, splits);

        vm.prank(carol);
        splitter.collectAndDistribute(escrowUid, fulfillmentUid);

        assertEq(alice.balance, 0.6 ether);
        assertEq(bob.balance, 0.4 ether);
        assertEq(address(splitter).balance, 0);
    }

    function testCollectAndDistributeWithSentinel() public {
        bytes32 escrowUid = _createEscrow(buyer, AMOUNT, uint64(block.timestamp + EXPIRATION));
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);

        uint256 executorBalBefore = executor.balance;

        NativeTokenSplitter.Split[] memory splits = new NativeTokenSplitter.Split[](2);
        splits[0] = NativeTokenSplitter.Split({recipient: splitter.EXECUTOR_SENTINEL(), amount: 0.6 ether});
        splits[1] = NativeTokenSplitter.Split({recipient: bob, amount: 0.4 ether});

        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, splits);

        // Different caller — sentinel resolves to executor
        vm.prank(carol);
        splitter.collectAndDistribute(escrowUid, fulfillmentUid);

        assertEq(executor.balance, executorBalBefore + 0.6 ether, "Executor gets sentinel share");
        assertEq(bob.balance, 0.4 ether);
    }

    function testUnsafePartialSettlementRequiresFulfillerOrAttester() public {
        RejectingNativeRecipient rejectingRecipient = new RejectingNativeRecipient();
        bytes32 escrowUid = _createEscrow(buyer, AMOUNT, uint64(block.timestamp + EXPIRATION));
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);

        NativeTokenSplitter.Split[] memory splits = new NativeTokenSplitter.Split[](2);
        splits[0] = NativeTokenSplitter.Split({recipient: splitter.EXECUTOR_SENTINEL(), amount: 0.6 ether});
        splits[1] = NativeTokenSplitter.Split({recipient: address(rejectingRecipient), amount: 0.4 ether});

        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, splits);

        vm.prank(carol);
        vm.expectRevert(
            abi.encodeWithSelector(BaseSplitter.UnauthorizedPartialSettlement.selector, fulfillmentUid, carol)
        );
        splitter.unsafePartiallyCollectAndDistribute(escrowUid, fulfillmentUid);

        Attestation memory escrowAfterUnauthorized = eas.getAttestation(escrowUid);
        assertEq(escrowAfterUnauthorized.revocationTime, 0, "unauthorized partial call leaves escrow live");

        vm.prank(carol);
        vm.expectRevert(
            abi.encodeWithSelector(
                NativeTokenSplitter.NativeTokenTransferFailed.selector, address(rejectingRecipient), 0.4 ether
            )
        );
        splitter.collectAndDistribute(escrowUid, fulfillmentUid);

        uint256 executorBalanceBefore = executor.balance;
        vm.prank(executor);
        splitter.unsafePartiallyCollectAndDistribute(escrowUid, fulfillmentUid);

        assertEq(executor.balance, executorBalanceBefore + 0.6 ether);
        assertEq(address(rejectingRecipient).balance, 0);
        assertEq(address(splitter).balance, 0.4 ether);
    }

    function testUnsafePartialSettlementAllowsFulfillmentAttester() public {
        RejectingNativeRecipient rejectingRecipient = new RejectingNativeRecipient();
        bytes32 escrowUid = _createEscrow(buyer, AMOUNT, uint64(block.timestamp + EXPIRATION));

        bytes memory obligationData =
            abi.encode(StringObligation.ObligationData({item: "manual fulfillment", schema: bytes32(0)}));
        vm.prank(address(splitter));
        bytes32 fulfillmentUid = stringObligation.doObligationRaw(obligationData, 0, escrowUid);

        NativeTokenSplitter.Split[] memory splits = new NativeTokenSplitter.Split[](2);
        splits[0] = NativeTokenSplitter.Split({recipient: alice, amount: 0.6 ether});
        splits[1] = NativeTokenSplitter.Split({recipient: address(rejectingRecipient), amount: 0.4 ether});

        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, splits);

        vm.prank(carol);
        vm.expectRevert(
            abi.encodeWithSelector(BaseSplitter.UnauthorizedPartialSettlement.selector, fulfillmentUid, carol)
        );
        splitter.unsafePartiallyCollectAndDistribute(escrowUid, fulfillmentUid);

        vm.prank(address(stringObligation));
        splitter.unsafePartiallyCollectAndDistribute(escrowUid, fulfillmentUid);

        assertEq(alice.balance, 0.6 ether);
        assertEq(address(rejectingRecipient).balance, 0);
        assertEq(address(splitter).balance, 0.4 ether);
    }

    function testCheckObligationRejectsDifferentFulfillment() public {
        bytes32 escrowUid = _createEscrow(buyer, AMOUNT, uint64(block.timestamp + EXPIRATION));
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);

        NativeTokenSplitter.Split[] memory splits = new NativeTokenSplitter.Split[](1);
        splits[0] = NativeTokenSplitter.Split({recipient: alice, amount: AMOUNT});
        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, splits);

        bytes32 attackerFulfillmentUid = _createFulfillmentViaSplitter(alice, escrowUid);
        bytes memory demand = abi.encode(NativeTokenSplitter.DemandData({oracle: oracle, data: bytes("")}));

        Attestation memory attackerF = eas.getAttestation(attackerFulfillmentUid);
        assertFalse(splitter.check(attackerF, demand, escrowUid));
    }

    function testArbitrateRejectsZeroFulfillment() public {
        bytes32 escrowUid = _createEscrow(buyer, AMOUNT, uint64(block.timestamp + EXPIRATION));

        NativeTokenSplitter.Split[] memory splits = new NativeTokenSplitter.Split[](1);
        splits[0] = NativeTokenSplitter.Split({recipient: alice, amount: AMOUNT});

        vm.prank(oracle);
        vm.expectRevert(BaseSplitter.InvalidFulfillmentUid.selector);
        splitter.arbitrate(bytes32(0), escrowUid, splits);
    }

    function testRequestArbitrationAsRecipient() public {
        bytes32 escrowUid = _createEscrow(buyer, AMOUNT, uint64(block.timestamp + EXPIRATION));
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);

        vm.prank(buyer);
        vm.expectEmit(true, true, true, true);
        emit BaseSplitter.ArbitrationRequested(fulfillmentUid, escrowUid, oracle, bytes("demand"));
        splitter.requestArbitration(fulfillmentUid, escrowUid, oracle, bytes("demand"));
    }

    function testRequestArbitrationUnauthorized() public {
        bytes32 escrowUid = _createEscrow(buyer, AMOUNT, uint64(block.timestamp + EXPIRATION));
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);

        vm.prank(carol);
        vm.expectRevert(BaseSplitter.UnauthorizedArbitrationRequest.selector);
        splitter.requestArbitration(fulfillmentUid, escrowUid, oracle, bytes("demand"));
    }

    function testReceiveETH() public {
        vm.deal(address(this), 1 ether);
        (bool success,) = address(splitter).call{value: 0.5 ether}("");
        assertTrue(success);
        assertEq(address(splitter).balance, 0.5 ether);
    }
}
