// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {NativeTokenEscrowObligation} from "@src/obligations/escrow/default/NativeTokenEscrowObligation.sol";
import {BaseEscrowObligation} from "@src/obligations/escrow/BaseEscrowObligation.sol";
import {ArbiterUtils} from "@src/libraries/ArbiterUtils.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {IEscrow} from "@src/IEscrow.sol";
import {MockArbiter} from "../../fixtures/MockArbiter.sol";
import {IEAS, Attestation, AttestationRequestData, AttestationRequest} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract NativeTokenEscrowObligationTest is Test {
    NativeTokenEscrowObligation public escrowObligation;
    NativeTokenEscrowObligation public wrongSchemaObligation;
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
        // Create a second instance with a different schema ID (different resolver = different schema)
        wrongSchemaObligation = new NativeTokenEscrowObligation(eas, schemaRegistry);
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
        NativeTokenEscrowObligation.ObligationData memory data = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        uint256 buyerBalanceBefore = buyer.balance;
        uint256 contractBalanceBefore = address(escrowObligation).balance;

        vm.prank(buyer);
        bytes32 uid = escrowObligation.doObligation{value: AMOUNT}(data, uint64(block.timestamp + EXPIRATION_TIME));

        // Check balances
        assertEq(buyer.balance, buyerBalanceBefore - AMOUNT);
        assertEq(address(escrowObligation).balance, contractBalanceBefore + AMOUNT);

        // Check obligation data
        NativeTokenEscrowObligation.ObligationData memory storedData = escrowObligation.getObligationData(uid);
        assertEq(storedData.arbiter, data.arbiter);
        assertEq(storedData.demand, data.demand);
        assertEq(storedData.amount, data.amount);
    }

    function testSupportsERC165IEscrowAndIArbiter() public view {
        assertTrue(escrowObligation.supportsInterface(type(IERC165).interfaceId));
        assertTrue(escrowObligation.supportsInterface(type(IEscrow).interfaceId));
        assertTrue(escrowObligation.supportsInterface(type(IArbiter).interfaceId));
    }

    function testDoObligationFor() public {
        NativeTokenEscrowObligation.ObligationData memory data = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        uint256 buyerBalanceBefore = buyer.balance;
        uint256 contractBalanceBefore = address(escrowObligation).balance;

        vm.prank(buyer);
        bytes32 uid =
            escrowObligation.doObligationFor{value: AMOUNT}(data, uint64(block.timestamp + EXPIRATION_TIME), seller);

        // Check balances
        assertEq(buyer.balance, buyerBalanceBefore - AMOUNT);
        assertEq(address(escrowObligation).balance, contractBalanceBefore + AMOUNT);

        // Check attestation recipient
        Attestation memory attestation = eas.getAttestation(uid);
        assertEq(attestation.recipient, seller);
    }

    function testIncorrectPaymentUnderpay() public {
        NativeTokenEscrowObligation.ObligationData memory data = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(NativeTokenEscrowObligation.IncorrectPayment.selector, AMOUNT, 0.5 ether)
        );
        escrowObligation.doObligation{value: 0.5 ether}(data, uint64(block.timestamp + EXPIRATION_TIME));
    }

    function testIncorrectPaymentOverpay() public {
        NativeTokenEscrowObligation.ObligationData memory data = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        vm.prank(buyer);
        vm.expectRevert(abi.encodeWithSelector(NativeTokenEscrowObligation.IncorrectPayment.selector, AMOUNT, 2 ether));
        escrowObligation.doObligation{value: 2 ether}(data, uint64(block.timestamp + EXPIRATION_TIME));
    }

    function testCollectEscrow() public {
        // First create an escrow
        NativeTokenEscrowObligation.ObligationData memory escrowData = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        vm.prank(buyer);
        bytes32 escrowUid =
            escrowObligation.doObligation{value: AMOUNT}(escrowData, uint64(block.timestamp + EXPIRATION_TIME));

        // Create fulfillment (string obligation)
        vm.prank(seller);
        bytes32 fulfillmentUid = stringObligation.doObligation(
            StringObligation.ObligationData({item: "hello", schema: bytes32(0)}), escrowUid
        );

        uint256 sellerBalanceBefore = seller.balance;
        uint256 contractBalanceBefore = address(escrowObligation).balance;

        // Collect escrow
        vm.prank(seller);
        escrowObligation.collect(escrowUid, fulfillmentUid);

        // Check seller received the funds
        assertEq(seller.balance, sellerBalanceBefore + AMOUNT);
        assertEq(address(escrowObligation).balance, contractBalanceBefore - AMOUNT);

        // Check escrow was revoked
        Attestation memory revokedEscrow = eas.getAttestation(escrowUid);
        assertTrue(revokedEscrow.revocationTime > 0);
    }

    function testCollectEscrowWithInvalidFulfillment() public {
        // Create escrow
        NativeTokenEscrowObligation.ObligationData memory escrowData = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(rejectingArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        vm.prank(buyer);
        bytes32 escrowUid =
            escrowObligation.doObligation{value: AMOUNT}(escrowData, uint64(block.timestamp + EXPIRATION_TIME));

        // Create wrong fulfillment
        vm.prank(seller);
        bytes32 fulfillmentUid = stringObligation.doObligation(
            StringObligation.ObligationData({item: "goodbye", schema: bytes32(0)}), escrowUid
        );

        // Try to collect escrow
        vm.prank(seller);
        vm.expectRevert(BaseEscrowObligation.InvalidFulfillment.selector);
        escrowObligation.collect(escrowUid, fulfillmentUid);
    }

    function testReclaimExpired() public {
        // Create an escrow with short expiration
        NativeTokenEscrowObligation.ObligationData memory data = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        vm.prank(buyer);
        bytes32 uid = escrowObligation.doObligation{value: AMOUNT}(data, uint64(block.timestamp + 100));

        // Try to reclaim before expiration
        vm.prank(buyer);
        vm.expectRevert(BaseEscrowObligation.UnauthorizedCall.selector);
        escrowObligation.reclaim(uid);

        // Move time forward past expiration
        vm.warp(block.timestamp + 101);

        uint256 buyerBalanceBefore = buyer.balance;

        // Reclaim expired escrow
        vm.prank(buyer);
        bool success = escrowObligation.reclaim(uid);
        assertTrue(success);

        // Check buyer got their funds back
        assertEq(buyer.balance, buyerBalanceBefore + AMOUNT);
    }

    function testReclaimExpiredWithZeroExpirationTime() public {
        // Create an escrow with no expiration (expirationTime = 0 means never expires)
        NativeTokenEscrowObligation.ObligationData memory data = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        vm.prank(buyer);
        bytes32 uid = escrowObligation.doObligation{value: AMOUNT}(
            data,
            0 // Never expires
        );

        // Move time forward arbitrarily
        vm.warp(block.timestamp + 365 days);

        // Try to reclaim non-expiring escrow - should revert
        vm.prank(buyer);
        vm.expectRevert(BaseEscrowObligation.UnauthorizedCall.selector);
        escrowObligation.reclaim(uid);
    }

    function testReclaimExpiredRevokesAttestation() public {
        // Create an escrow with short expiration
        NativeTokenEscrowObligation.ObligationData memory data = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        vm.prank(buyer);
        bytes32 uid = escrowObligation.doObligation{value: AMOUNT}(data, uint64(block.timestamp + 100));

        // Move time forward past expiration
        vm.warp(block.timestamp + 101);

        // Reclaim expired escrow
        vm.prank(buyer);
        escrowObligation.reclaim(uid);

        // Check attestation was revoked
        Attestation memory revokedAttestation = eas.getAttestation(uid);
        assertTrue(revokedAttestation.revocationTime > 0);
    }

    function testReclaimExpiredPreventsReentry() public {
        // Create an escrow with short expiration
        NativeTokenEscrowObligation.ObligationData memory data = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        vm.prank(buyer);
        bytes32 uid = escrowObligation.doObligation{value: AMOUNT}(data, uint64(block.timestamp + 100));

        // Move time forward past expiration
        vm.warp(block.timestamp + 101);

        // Reclaim expired escrow first time
        vm.prank(buyer);
        escrowObligation.reclaim(uid);

        // Try to reclaim again - should fail because attestation is already revoked
        vm.prank(buyer);
        vm.expectRevert(abi.encodeWithSelector(BaseEscrowObligation.RevocationFailed.selector, uid));
        escrowObligation.reclaim(uid);
    }

    function testCheckObligation() public {
        NativeTokenEscrowObligation.ObligationData memory data = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        vm.prank(buyer);
        bytes32 uid = escrowObligation.doObligation{value: AMOUNT}(data, uint64(block.timestamp + EXPIRATION_TIME));

        Attestation memory attestation = eas.getAttestation(uid);

        // Should match with same data
        bool result = escrowObligation.check(attestation, abi.encode(data), bytes32(0));
        assertTrue(result);

        // Should match with lower demanded amount
        NativeTokenEscrowObligation.ObligationData memory lowerDemand = data;
        lowerDemand.amount = 0.5 ether;
        result = escrowObligation.check(attestation, abi.encode(lowerDemand), bytes32(0));
        assertTrue(result);

        // Should not match with higher demanded amount
        NativeTokenEscrowObligation.ObligationData memory higherDemand = data;
        higherDemand.amount = 2 ether;
        result = escrowObligation.check(attestation, abi.encode(higherDemand), bytes32(0));
        assertFalse(result);

        // Should not match with different arbiter
        NativeTokenEscrowObligation.ObligationData memory differentArbiter = data;
        differentArbiter.arbiter = address(rejectingArbiter);
        result = escrowObligation.check(attestation, abi.encode(differentArbiter), bytes32(0));
        assertFalse(result);

        // Should not match with different demand
        NativeTokenEscrowObligation.ObligationData memory differentDemand = data;
        differentDemand.demand = abi.encode("different demand");
        result = escrowObligation.check(attestation, abi.encode(differentDemand), bytes32(0));
        assertFalse(result);
    }

    function testExtractArbiterAndDemand() public view {
        NativeTokenEscrowObligation.ObligationData memory data = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        (address extractedArbiter, bytes memory extractedDemand) = escrowObligation.decodeCondition(abi.encode(data));

        assertEq(extractedArbiter, data.arbiter);
        assertEq(extractedDemand, data.demand);
    }

    function testDecodeObligationData() public view {
        NativeTokenEscrowObligation.ObligationData memory data = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        NativeTokenEscrowObligation.ObligationData memory decoded =
            escrowObligation.decodeObligationData(abi.encode(data));

        assertEq(decoded.arbiter, data.arbiter);
        assertEq(decoded.demand, data.demand);
        assertEq(decoded.amount, data.amount);
    }

    function testDirectNativeTransferReverts() public {
        vm.prank(buyer);
        (bool success,) = address(escrowObligation).call{value: 1 ether}("");

        assertFalse(success);
        assertEq(address(escrowObligation).balance, 0);
    }

    function testCollectEscrowWithWrongSchema() public {
        // Create escrow with wrong schema (using wrongSchemaObligation)
        NativeTokenEscrowObligation.ObligationData memory escrowData = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        vm.prank(buyer);
        bytes32 wrongSchemaEscrowUid =
            wrongSchemaObligation.doObligation{value: AMOUNT}(escrowData, uint64(block.timestamp + EXPIRATION_TIME));

        // Create valid fulfillment
        vm.prank(seller);
        bytes32 fulfillmentUid = stringObligation.doObligation(
            StringObligation.ObligationData({item: "hello", schema: bytes32(0)}), wrongSchemaEscrowUid
        );

        // Try to collect escrow with wrong schema - should revert
        vm.prank(seller);
        vm.expectRevert(BaseEscrowObligation.InvalidEscrowAttestation.selector);
        escrowObligation.collect(wrongSchemaEscrowUid, fulfillmentUid);
    }

    function testCollectEscrowWithExpiredFulfillmentReverts() public {
        NativeTokenEscrowObligation.ObligationData memory escrowData = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        vm.prank(buyer);
        bytes32 escrowUid =
            escrowObligation.doObligation{value: AMOUNT}(escrowData, uint64(block.timestamp + EXPIRATION_TIME));

        vm.prank(seller);
        bytes32 fulfillmentUid = stringObligation.doObligationRaw(
            abi.encode(StringObligation.ObligationData({item: "hello", schema: bytes32(0)})),
            uint64(block.timestamp + 1),
            escrowUid
        );

        vm.warp(block.timestamp + 2);

        vm.prank(seller);
        vm.expectRevert(ArbiterUtils.DeadlineExpired.selector);
        escrowObligation.collect(escrowUid, fulfillmentUid);
    }

    function testCollectEscrowWithMissingEscrowRevertsAttestationNotFound() public {
        bytes32 missingEscrow = bytes32("missing escrow");
        bytes32 missingFulfillment = bytes32("missing fulfillment");

        vm.expectRevert(abi.encodeWithSelector(BaseEscrowObligation.AttestationNotFound.selector, missingEscrow));
        escrowObligation.collect(missingEscrow, missingFulfillment);
    }

    function testCollectEscrowWithMissingFulfillmentRevertsAttestationNotFound() public {
        NativeTokenEscrowObligation.ObligationData memory escrowData = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        vm.prank(buyer);
        bytes32 escrowUid =
            escrowObligation.doObligation{value: AMOUNT}(escrowData, uint64(block.timestamp + EXPIRATION_TIME));
        bytes32 missingFulfillment = bytes32("missing fulfillment");

        vm.expectRevert(abi.encodeWithSelector(BaseEscrowObligation.AttestationNotFound.selector, missingFulfillment));
        escrowObligation.collect(escrowUid, missingFulfillment);
    }

    function testReclaimExpiredWithWrongSchema() public {
        // Create escrow with wrong schema (using wrongSchemaObligation)
        NativeTokenEscrowObligation.ObligationData memory data = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        vm.prank(buyer);
        bytes32 wrongSchemaUid = wrongSchemaObligation.doObligation{value: AMOUNT}(data, uint64(block.timestamp + 100));

        // Move time forward past expiration
        vm.warp(block.timestamp + 101);

        // Try to reclaim with wrong schema - should revert
        vm.prank(buyer);
        vm.expectRevert(BaseEscrowObligation.InvalidEscrowAttestation.selector);
        escrowObligation.reclaim(wrongSchemaUid);
    }

    function testReclaimExpiredWithMissingEscrowRevertsAttestationNotFound() public {
        bytes32 missingEscrow = bytes32("missing escrow");

        vm.expectRevert(abi.encodeWithSelector(BaseEscrowObligation.AttestationNotFound.selector, missingEscrow));
        escrowObligation.reclaim(missingEscrow);
    }

    function testNativeTokenTransferFailed() public {
        // Create a contract that rejects ETH
        RevertingReceiver revertingReceiver = new RevertingReceiver();

        // Create escrow demanding a fulfillment that will be done by reverting receiver
        NativeTokenEscrowObligation.ObligationData memory escrowData = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(mockArbiter), demand: abi.encode("test demand"), amount: AMOUNT
        });

        vm.prank(buyer);
        bytes32 escrowUid =
            escrowObligation.doObligation{value: AMOUNT}(escrowData, uint64(block.timestamp + EXPIRATION_TIME));

        // Create fulfillment from reverting receiver
        vm.prank(address(revertingReceiver));
        bytes32 fulfillmentUid = stringObligation.doObligation(
            StringObligation.ObligationData({item: "hello", schema: bytes32(0)}), escrowUid
        );

        // Try to collect escrow - should fail when trying to send to reverting receiver
        vm.prank(address(revertingReceiver));
        vm.expectRevert(
            abi.encodeWithSelector(
                NativeTokenEscrowObligation.NativeTokenTransferFailed.selector, address(revertingReceiver), AMOUNT
            )
        );
        escrowObligation.collect(escrowUid, fulfillmentUid);
    }
}

contract RevertingReceiver {
    receive() external payable {
        revert("I don't accept ETH");
    }
}
