// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC20EscrowObligation} from "@src/obligations/ERC20EscrowObligation.sol";
import {ERC20PaymentFulfillmentArbiter} from "@src/arbiters/deprecated/ERC20PaymentFulfillmentArbiter.sol";
import {SpecificAttestationArbiter} from "@src/arbiters/deprecated/SpecificAttestationArbiter.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract ERC20EscrowObligationTest is Test {
    ERC20EscrowObligation public paymentStatement;
    ERC20PaymentFulfillmentArbiter public erc20PaymentFulfillment;
    SpecificAttestationArbiter public specificAttestation;
    MockERC20 public erc1155TokenA;
    MockERC20 public erc1155TokenB;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        erc1155TokenA = new MockERC20("Token A", "TKA");
        erc1155TokenB = new MockERC20("Token B", "TKB");

        paymentStatement = new ERC20EscrowObligation(eas, schemaRegistry);
        specificAttestation = new SpecificAttestationArbiter();
        erc20PaymentFulfillment = new ERC20PaymentFulfillmentArbiter(
            paymentStatement,
            specificAttestation
        );

        erc1155TokenA.transfer(alice, 1000 * 10 ** 18);
        erc1155TokenB.transfer(bob, 1000 * 10 ** 18);
    }

    function testERC20EscrowObligationSelfReferential() public {
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupTrade();

        // Bob collects Alice's payment
        vm.prank(bob);
        bool successBob = paymentStatement.collectEscrow(
            alicePaymentUID,
            bobPaymentUID
        );
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's payment
        vm.prank(alice);
        bool successAlice = paymentStatement.collectEscrow(
            bobPaymentUID,
            alicePaymentUID
        );
        assertTrue(successAlice, "Alice's payment collection should succeed");

        _assertFinalBalances();
    }

    function testCollectionOrderReversed() public {
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupTrade();

        // Alice collects Bob's payment first
        vm.prank(alice);
        bool successAlice = paymentStatement.collectEscrow(
            bobPaymentUID,
            alicePaymentUID
        );
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Bob collects Alice's payment
        vm.prank(bob);
        bool successBob = paymentStatement.collectEscrow(
            alicePaymentUID,
            bobPaymentUID
        );
        assertTrue(successBob, "Bob's payment collection should succeed");

        _assertFinalBalances();
    }

    function testDoubleSpendingAlice() public {
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupTrade();

        // Bob collects Alice's payment
        vm.prank(bob);
        bool successBob = paymentStatement.collectEscrow(
            alicePaymentUID,
            bobPaymentUID
        );
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's payment
        vm.prank(alice);
        bool successAlice = paymentStatement.collectEscrow(
            bobPaymentUID,
            alicePaymentUID
        );
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Alice attempts to double spend
        vm.prank(alice);
        vm.expectRevert();
        paymentStatement.collectEscrow(bobPaymentUID, alicePaymentUID);
    }

    function testDoubleSpendingBob() public {
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupTrade();

        // Alice collects Bob's payment
        vm.prank(alice);
        bool successAlice = paymentStatement.collectEscrow(
            bobPaymentUID,
            alicePaymentUID
        );
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Bob collects Alice's payment
        vm.prank(bob);
        bool successBob = paymentStatement.collectEscrow(
            alicePaymentUID,
            bobPaymentUID
        );
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Bob attempts to double spend
        vm.prank(bob);
        vm.expectRevert();
        paymentStatement.collectEscrow(alicePaymentUID, bobPaymentUID);
    }

    function _setupTrade()
        internal
        returns (bytes32 alicePaymentUID, bytes32 bobPaymentUID)
    {
        vm.startPrank(alice);
        erc1155TokenA.approve(address(paymentStatement), 100 * 10 ** 18);
        ERC20EscrowObligation.StatementData
            memory alicePaymentData = ERC20EscrowObligation.StatementData({
                token: address(erc1155TokenA),
                amount: 100 * 10 ** 18,
                arbiter: address(erc20PaymentFulfillment),
                demand: abi.encode(
                    ERC20PaymentFulfillmentArbiter.DemandData({
                        token: address(erc1155TokenB),
                        amount: 200 * 10 ** 18
                    })
                )
            });
        alicePaymentUID = paymentStatement.doObligation(alicePaymentData, 0);
        vm.stopPrank();

        vm.startPrank(bob);
        erc1155TokenB.approve(address(paymentStatement), 200 * 10 ** 18);
        ERC20EscrowObligation.StatementData
            memory bobPaymentData = ERC20EscrowObligation.StatementData({
                token: address(erc1155TokenB),
                amount: 200 * 10 ** 18,
                arbiter: address(specificAttestation),
                demand: abi.encode(
                    SpecificAttestationArbiter.DemandData({
                        uid: alicePaymentUID
                    })
                )
            });
        bobPaymentUID = paymentStatement.doObligation(bobPaymentData, 0);

        vm.stopPrank();
    }

    function _assertFinalBalances() internal view {
        assertEq(
            erc1155TokenA.balanceOf(alice),
            900 * 10 ** 18,
            "Alice should have 900 Token A"
        );
        assertEq(
            erc1155TokenA.balanceOf(bob),
            100 * 10 ** 18,
            "Bob should have 100 Token A"
        );
        assertEq(
            erc1155TokenB.balanceOf(alice),
            200 * 10 ** 18,
            "Alice should have 200 Token B"
        );
        assertEq(
            erc1155TokenB.balanceOf(bob),
            800 * 10 ** 18,
            "Bob should have 800 Token B"
        );
        assertEq(
            erc1155TokenA.balanceOf(address(paymentStatement)),
            0,
            "Payment contract should have no Token A"
        );
        assertEq(
            erc1155TokenB.balanceOf(address(paymentStatement)),
            0,
            "Payment contract should have no Token B"
        );
    }
}
