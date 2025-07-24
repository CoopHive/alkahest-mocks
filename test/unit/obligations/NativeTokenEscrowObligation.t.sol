// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {NativeTokenEscrowObligation} from "@src/obligations/NativeTokenEscrowObligation.sol";
import {BaseEscrowObligation} from "@src/BaseEscrowObligation.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {MockArbiter} from "./MockArbiter.sol";
import {IEAS, Attestation, AttestationRequestData, AttestationRequest} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";

import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract NativeTokenEscrowObligationTest is Test {
    NativeTokenEscrowObligation public escrowObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    MockArbiter public mockArbiter;
    MockArbiter public rejectingArbiter;
    StringObligation public stringObligation;

    address internal buyer;
    address internal seller;
    uint256 constant AMOUNT = 1 ether;
    uint64 constant EXPIRATION_TIME = 365 days;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        escrowObligation = new NativeTokenEscrowObligation(eas, schemaRegistry);
        mockArbiter = new MockArbiter(true);
        rejectingArbiter = new MockArbiter(false);
        stringObligation = new StringObligation(eas, schemaRegistry);

        buyer = makeAddr("buyer");
        seller = makeAddr("seller");

        // Fund test accounts
        vm.deal(buyer, 10 ether);
        vm.deal(seller, 10 ether);
    }

    function testDoObligation() public {
        NativeTokenEscrowObligation.ObligationData
            memory data = NativeTokenEscrowObligation.ObligationData({
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand"),
                amount: AMOUNT
            });

        uint256 buyerBalanceBefore = buyer.balance;
        uint256 contractBalanceBefore = address(escrowObligation).balance;

        vm.prank(buyer);
        bytes32 uid = escrowObligation.doObligation{value: AMOUNT}(
            data,
            uint64(block.timestamp + EXPIRATION_TIME)
        );

        // Check balances
        assertEq(buyer.balance, buyerBalanceBefore - AMOUNT);
        assertEq(
            address(escrowObligation).balance,
            contractBalanceBefore + AMOUNT
        );

        // Check obligation data
        NativeTokenEscrowObligation.ObligationData
            memory storedData = escrowObligation.getObligationData(uid);
        assertEq(storedData.arbiter, data.arbiter);
        assertEq(storedData.demand, data.demand);
        assertEq(storedData.amount, data.amount);
    }

    function testDoObligationFor() public {
        NativeTokenEscrowObligation.ObligationData
            memory data = NativeTokenEscrowObligation.ObligationData({
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand"),
                amount: AMOUNT
            });

        uint256 buyerBalanceBefore = buyer.balance;
        uint256 contractBalanceBefore = address(escrowObligation).balance;

        vm.prank(buyer);
        bytes32 uid = escrowObligation.doObligationFor{value: AMOUNT}(
            data,
            uint64(block.timestamp + EXPIRATION_TIME),
            buyer,
            seller
        );

        // Check balances
        assertEq(buyer.balance, buyerBalanceBefore - AMOUNT);
        assertEq(
            address(escrowObligation).balance,
            contractBalanceBefore + AMOUNT
        );

        // Check attestation recipient
        Attestation memory attestation = eas.getAttestation(uid);
        assertEq(attestation.recipient, seller);
    }

    function testInsufficientPayment() public {
        NativeTokenEscrowObligation.ObligationData
            memory data = NativeTokenEscrowObligation.ObligationData({
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand"),
                amount: AMOUNT
            });

        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(
                NativeTokenEscrowObligation.InsufficientPayment.selector,
                AMOUNT,
                0.5 ether
            )
        );
        escrowObligation.doObligation{value: 0.5 ether}(
            data,
            uint64(block.timestamp + EXPIRATION_TIME)
        );
    }

    function testCollectEscrow() public {
        // First create an escrow
        NativeTokenEscrowObligation.ObligationData
            memory escrowData = NativeTokenEscrowObligation.ObligationData({
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand"),
                amount: AMOUNT
            });

        vm.prank(buyer);
        bytes32 escrowUid = escrowObligation.doObligation{value: AMOUNT}(
            escrowData,
            uint64(block.timestamp + EXPIRATION_TIME)
        );

        // Create fulfillment (string obligation)
        vm.prank(seller);
        bytes32 fulfillmentUid = stringObligation.doObligation(
            StringObligation.ObligationData({item: "hello"}),
            bytes32(0)
        );

        uint256 sellerBalanceBefore = seller.balance;
        uint256 contractBalanceBefore = address(escrowObligation).balance;

        // Collect escrow
        vm.prank(seller);
        bool success = escrowObligation.collectEscrow(
            escrowUid,
            fulfillmentUid
        );
        assertTrue(success);

        // Check seller received the funds
        assertEq(seller.balance, sellerBalanceBefore + AMOUNT);
        assertEq(
            address(escrowObligation).balance,
            contractBalanceBefore - AMOUNT
        );

        // Check escrow was revoked
        Attestation memory revokedEscrow = eas.getAttestation(escrowUid);
        assertTrue(revokedEscrow.revocationTime > 0);
    }

    function testCollectEscrowWithInvalidFulfillment() public {
        // Create escrow
        NativeTokenEscrowObligation.ObligationData
            memory escrowData = NativeTokenEscrowObligation.ObligationData({
                arbiter: address(rejectingArbiter),
                demand: abi.encode("test demand"),
                amount: AMOUNT
            });

        vm.prank(buyer);
        bytes32 escrowUid = escrowObligation.doObligation{value: AMOUNT}(
            escrowData,
            uint64(block.timestamp + EXPIRATION_TIME)
        );

        // Create wrong fulfillment
        vm.prank(seller);
        bytes32 fulfillmentUid = stringObligation.doObligation(
            StringObligation.ObligationData({item: "goodbye"}),
            bytes32(0)
        );

        // Try to collect escrow
        vm.prank(seller);
        vm.expectRevert(BaseEscrowObligation.InvalidFulfillment.selector);
        escrowObligation.collectEscrow(escrowUid, fulfillmentUid);
    }

    function testReclaimExpired() public {
        // Create an escrow with short expiration
        NativeTokenEscrowObligation.ObligationData
            memory data = NativeTokenEscrowObligation.ObligationData({
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand"),
                amount: AMOUNT
            });

        vm.prank(buyer);
        bytes32 uid = escrowObligation.doObligation{value: AMOUNT}(
            data,
            uint64(block.timestamp + 100)
        );

        // Try to reclaim before expiration
        vm.prank(buyer);
        vm.expectRevert(BaseEscrowObligation.UnauthorizedCall.selector);
        escrowObligation.reclaimExpired(uid);

        // Move time forward past expiration
        vm.warp(block.timestamp + 101);

        uint256 buyerBalanceBefore = buyer.balance;

        // Reclaim expired escrow
        vm.prank(buyer);
        bool success = escrowObligation.reclaimExpired(uid);
        assertTrue(success);

        // Check buyer got their funds back
        assertEq(buyer.balance, buyerBalanceBefore + AMOUNT);
    }

    function testCheckObligation() public {
        NativeTokenEscrowObligation.ObligationData
            memory data = NativeTokenEscrowObligation.ObligationData({
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand"),
                amount: AMOUNT
            });

        vm.prank(buyer);
        bytes32 uid = escrowObligation.doObligation{value: AMOUNT}(
            data,
            uint64(block.timestamp + EXPIRATION_TIME)
        );

        Attestation memory attestation = eas.getAttestation(uid);

        // Should match with same data
        bool result = escrowObligation.checkObligation(
            attestation,
            abi.encode(data),
            bytes32(0)
        );
        assertTrue(result);

        // Should match with lower demanded amount
        NativeTokenEscrowObligation.ObligationData memory lowerDemand = data;
        lowerDemand.amount = 0.5 ether;
        result = escrowObligation.checkObligation(
            attestation,
            abi.encode(lowerDemand),
            bytes32(0)
        );
        assertTrue(result);

        // Should not match with higher demanded amount
        NativeTokenEscrowObligation.ObligationData memory higherDemand = data;
        higherDemand.amount = 2 ether;
        result = escrowObligation.checkObligation(
            attestation,
            abi.encode(higherDemand),
            bytes32(0)
        );
        assertFalse(result);

        // Should not match with different arbiter
        NativeTokenEscrowObligation.ObligationData memory differentArbiter = data;
        differentArbiter.arbiter = address(rejectingArbiter);
        result = escrowObligation.checkObligation(
            attestation,
            abi.encode(differentArbiter),
            bytes32(0)
        );
        assertFalse(result);

        // Should not match with different demand
        NativeTokenEscrowObligation.ObligationData memory differentDemand = data;
        differentDemand.demand = abi.encode("different demand");
        result = escrowObligation.checkObligation(
            attestation,
            abi.encode(differentDemand),
            bytes32(0)
        );
        assertFalse(result);
    }

    function testExtractArbiterAndDemand() public view {
        NativeTokenEscrowObligation.ObligationData
            memory data = NativeTokenEscrowObligation.ObligationData({
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand"),
                amount: AMOUNT
            });

        (
            address extractedArbiter,
            bytes memory extractedDemand
        ) = escrowObligation.extractArbiterAndDemand(abi.encode(data));

        assertEq(extractedArbiter, data.arbiter);
        assertEq(extractedDemand, data.demand);
    }

    function testDecodeObligationData() public view {
        NativeTokenEscrowObligation.ObligationData
            memory data = NativeTokenEscrowObligation.ObligationData({
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand"),
                amount: AMOUNT
            });

        NativeTokenEscrowObligation.ObligationData
            memory decoded = escrowObligation.decodeObligationData(
                abi.encode(data)
            );

        assertEq(decoded.arbiter, data.arbiter);
        assertEq(decoded.demand, data.demand);
        assertEq(decoded.amount, data.amount);
    }

    function testReceiveFunction() public {
        uint256 contractBalanceBefore = address(escrowObligation).balance;

        // Send ETH directly to contract
        vm.prank(buyer);
        (bool success, ) = address(escrowObligation).call{value: 1 ether}("");
        assertTrue(success);

        assertEq(
            address(escrowObligation).balance,
            contractBalanceBefore + 1 ether
        );
    }

    function testNativeTokenTransferFailed() public {
        // Create a contract that rejects ETH
        RevertingReceiver revertingReceiver = new RevertingReceiver();

        // Create escrow demanding a fulfillment that will be done by reverting receiver
        NativeTokenEscrowObligation.ObligationData
            memory escrowData = NativeTokenEscrowObligation.ObligationData({
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand"),
                amount: AMOUNT
            });

        vm.prank(buyer);
        bytes32 escrowUid = escrowObligation.doObligation{value: AMOUNT}(
            escrowData,
            uint64(block.timestamp + EXPIRATION_TIME)
        );

        // Create fulfillment from reverting receiver
        vm.prank(address(revertingReceiver));
        bytes32 fulfillmentUid = stringObligation.doObligation(
            StringObligation.ObligationData({item: "hello"}),
            bytes32(0)
        );

        // Try to collect escrow - should fail when trying to send to reverting receiver
        vm.prank(address(revertingReceiver));
        vm.expectRevert(
            abi.encodeWithSelector(
                NativeTokenEscrowObligation.NativeTokenTransferFailed.selector,
                address(revertingReceiver),
                AMOUNT
            )
        );
        escrowObligation.collectEscrow(escrowUid, fulfillmentUid);
    }
}

contract RevertingReceiver {
    receive() external payable {
        revert("I don't accept ETH");
    }
}
