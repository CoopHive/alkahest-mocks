// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {NativeTokenPaymentObligation} from "@src/obligations/NativeTokenPaymentObligation.sol";
import {BaseObligation} from "@src/BaseObligation.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {IEAS, Attestation, AttestationRequestData, AttestationRequest} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";

import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract NativeTokenPaymentObligationTest is Test {
    NativeTokenPaymentObligation public paymentObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    address internal buyer;
    address internal seller;
    address internal randomUser;
    uint256 constant AMOUNT = 1 ether;

    event PaymentMade(bytes32 indexed payment, address indexed buyer);

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        paymentObligation = new NativeTokenPaymentObligation(
            eas,
            schemaRegistry
        );

        buyer = makeAddr("buyer");
        seller = makeAddr("seller");
        randomUser = makeAddr("randomUser");

        // Fund test accounts
        vm.deal(buyer, 10 ether);
        vm.deal(seller, 10 ether);
        vm.deal(randomUser, 10 ether);
    }

    function testDoObligation() public {
        NativeTokenPaymentObligation.ObligationData
            memory data = NativeTokenPaymentObligation.ObligationData({
                amount: AMOUNT,
                payee: seller
            });

        uint256 buyerBalanceBefore = buyer.balance;
        uint256 sellerBalanceBefore = seller.balance;

        // Expect payment event (don't check uid as it's generated)
        vm.expectEmit(false, true, false, false);
        emit PaymentMade(bytes32(0), buyer);

        vm.prank(buyer);
        bytes32 uid = paymentObligation.doObligation{value: AMOUNT}(data);

        // Check balances
        assertEq(buyer.balance, buyerBalanceBefore - AMOUNT);
        assertEq(seller.balance, sellerBalanceBefore + AMOUNT);

        // Check obligation data
        NativeTokenPaymentObligation.ObligationData
            memory storedData = paymentObligation.getObligationData(uid);
        assertEq(storedData.amount, data.amount);
        assertEq(storedData.payee, data.payee);

        // Check attestation
        Attestation memory attestation = eas.getAttestation(uid);
        assertEq(attestation.recipient, buyer);
        assertEq(attestation.attester, address(paymentObligation));
    }

    function testDoObligationFor() public {
        NativeTokenPaymentObligation.ObligationData
            memory data = NativeTokenPaymentObligation.ObligationData({
                amount: AMOUNT,
                payee: seller
            });

        uint256 buyerBalanceBefore = buyer.balance;
        uint256 sellerBalanceBefore = seller.balance;

        // Expect payment event with randomUser as recipient (don't check uid as it's generated)
        vm.expectEmit(false, true, false, false);
        emit PaymentMade(bytes32(0), randomUser);

        vm.prank(buyer);
        bytes32 uid = paymentObligation.doObligationFor{value: AMOUNT}(
            data,
            buyer,
            randomUser
        );

        // Check balances
        assertEq(buyer.balance, buyerBalanceBefore - AMOUNT);
        assertEq(seller.balance, sellerBalanceBefore + AMOUNT);

        // Check attestation recipient
        Attestation memory attestation = eas.getAttestation(uid);
        assertEq(attestation.recipient, randomUser);
    }

    function testInsufficientPayment() public {
        NativeTokenPaymentObligation.ObligationData
            memory data = NativeTokenPaymentObligation.ObligationData({
                amount: AMOUNT,
                payee: seller
            });

        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(
                NativeTokenPaymentObligation.InsufficientPayment.selector,
                AMOUNT,
                0.5 ether
            )
        );
        paymentObligation.doObligation{value: 0.5 ether}(data);
    }

    function testExcessPaymentRefund() public {
        NativeTokenPaymentObligation.ObligationData
            memory data = NativeTokenPaymentObligation.ObligationData({
                amount: AMOUNT,
                payee: seller
            });

        uint256 excessAmount = 0.5 ether;
        uint256 totalPayment = AMOUNT + excessAmount;

        uint256 buyerBalanceBefore = buyer.balance;
        uint256 sellerBalanceBefore = seller.balance;

        vm.prank(buyer);
        bytes32 uid = paymentObligation.doObligation{value: totalPayment}(data);

        // Check balances - buyer should get refund
        assertEq(buyer.balance, buyerBalanceBefore - AMOUNT);
        assertEq(seller.balance, sellerBalanceBefore + AMOUNT);

        // Verify payment was recorded correctly
        NativeTokenPaymentObligation.ObligationData
            memory storedData = paymentObligation.getObligationData(uid);
        assertEq(storedData.amount, AMOUNT); // Should store actual amount, not excess
    }

    function testPaymentToRevertingAddress() public {
        // Create a contract that rejects ETH
        RevertingReceiver revertingReceiver = new RevertingReceiver();

        NativeTokenPaymentObligation.ObligationData
            memory data = NativeTokenPaymentObligation.ObligationData({
                amount: AMOUNT,
                payee: address(revertingReceiver)
            });

        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(
                NativeTokenPaymentObligation.NativeTokenTransferFailed.selector,
                address(revertingReceiver),
                AMOUNT
            )
        );
        paymentObligation.doObligation{value: AMOUNT}(data);
    }

    function testCheckObligation() public {
        NativeTokenPaymentObligation.ObligationData
            memory data = NativeTokenPaymentObligation.ObligationData({
                amount: AMOUNT,
                payee: seller
            });

        vm.prank(buyer);
        bytes32 uid = paymentObligation.doObligation{value: AMOUNT}(data);

        Attestation memory attestation = eas.getAttestation(uid);

        // Should match with same data
        bool result = paymentObligation.checkObligation(
            attestation,
            abi.encode(data),
            bytes32(0)
        );
        assertTrue(result);

        // Should match with lower demanded amount
        NativeTokenPaymentObligation.ObligationData
            memory lowerDemand = NativeTokenPaymentObligation.ObligationData({
                amount: 0.5 ether,
                payee: seller
            });
        result = paymentObligation.checkObligation(
            attestation,
            abi.encode(lowerDemand),
            bytes32(0)
        );
        assertTrue(result);

        // Should not match with higher demanded amount
        NativeTokenPaymentObligation.ObligationData
            memory higherDemand = NativeTokenPaymentObligation.ObligationData({
                amount: 2 ether,
                payee: seller
            });
        result = paymentObligation.checkObligation(
            attestation,
            abi.encode(higherDemand),
            bytes32(0)
        );
        assertFalse(result);

        // Should not match with different payee
        NativeTokenPaymentObligation.ObligationData
            memory differentPayee = NativeTokenPaymentObligation
                .ObligationData({amount: AMOUNT, payee: randomUser});
        result = paymentObligation.checkObligation(
            attestation,
            abi.encode(differentPayee),
            bytes32(0)
        );
        assertFalse(result);
    }

    function testDecodeObligationData() public view {
        NativeTokenPaymentObligation.ObligationData
            memory data = NativeTokenPaymentObligation.ObligationData({
                amount: AMOUNT,
                payee: seller
            });

        NativeTokenPaymentObligation.ObligationData
            memory decoded = paymentObligation.decodeObligationData(
                abi.encode(data)
            );

        assertEq(decoded.amount, data.amount);
        assertEq(decoded.payee, data.payee);
    }

    function testReceiveFunction() public {
        uint256 contractBalanceBefore = address(paymentObligation).balance;

        // Send ETH directly to contract
        vm.prank(buyer);
        (bool success, ) = address(paymentObligation).call{value: 1 ether}("");
        assertTrue(success);

        assertEq(
            address(paymentObligation).balance,
            contractBalanceBefore + 1 ether
        );
    }

    function testRefundFailure() public {
        // Create a contract that rejects ETH for refunds
        RevertingSender revertingSender = new RevertingSender();
        vm.deal(address(revertingSender), 10 ether);

        NativeTokenPaymentObligation.ObligationData
            memory data = NativeTokenPaymentObligation.ObligationData({
                amount: AMOUNT,
                payee: seller
            });

        uint256 excessAmount = 0.5 ether;
        uint256 totalPayment = AMOUNT + excessAmount;

        // The payment will succeed but refund will fail
        vm.prank(address(revertingSender));
        vm.expectRevert(
            abi.encodeWithSelector(
                NativeTokenPaymentObligation.NativeTokenTransferFailed.selector,
                address(revertingSender),
                excessAmount
            )
        );
        revertingSender.makePayment{value: totalPayment}(
            paymentObligation,
            data,
            totalPayment
        );
    }

    function testZeroAmountPayment() public {
        NativeTokenPaymentObligation.ObligationData
            memory data = NativeTokenPaymentObligation.ObligationData({
                amount: 0,
                payee: seller
            });

        uint256 buyerBalanceBefore = buyer.balance;
        uint256 sellerBalanceBefore = seller.balance;

        vm.prank(buyer);
        bytes32 uid = paymentObligation.doObligation(data);

        // Check balances remain unchanged
        assertEq(buyer.balance, buyerBalanceBefore);
        assertEq(seller.balance, sellerBalanceBefore);

        // Check attestation was still created
        Attestation memory attestation = eas.getAttestation(uid);
        assertEq(attestation.recipient, buyer);
    }

    function testMultiplePayments() public {
        NativeTokenPaymentObligation.ObligationData
            memory data = NativeTokenPaymentObligation.ObligationData({
                amount: AMOUNT,
                payee: seller
            });

        uint256 sellerBalanceBefore = seller.balance;

        // Make multiple payments
        vm.prank(buyer);
        paymentObligation.doObligation{value: AMOUNT}(data);

        vm.prank(randomUser);
        paymentObligation.doObligation{value: AMOUNT}(data);

        // Check seller received both payments
        assertEq(seller.balance, sellerBalanceBefore + 2 * AMOUNT);
    }
}

contract RevertingReceiver {
    receive() external payable {
        revert("I don't accept ETH");
    }
}

contract RevertingSender {
    receive() external payable {
        revert("I don't accept ETH");
    }

    function makePayment(
        NativeTokenPaymentObligation obligation,
        NativeTokenPaymentObligation.ObligationData memory data,
        uint256 value
    ) external payable {
        obligation.doObligation{value: value}(data);
    }
}
