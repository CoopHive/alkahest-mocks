// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC20PaymentStatement} from "../src/Statements/ERC20PaymentStatement.sol";
import {ERC20PaymentFulfillmentArbiter} from "../src/Validators/ERC20PaymentFulfillmentArbiter.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import "@openzeppelin/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract ERC20PaymentStatementTest is Test {
    ERC20PaymentStatement public paymentStatement;
    ERC20PaymentFulfillmentArbiter public validator;
    MockERC20 public tokenA;
    MockERC20 public tokenB;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    address public constant EAS_ADDRESS =
        0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS =
        0xA7b39296258348C78294F95B872b282326A97BDF;

    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));
        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        tokenA = new MockERC20("Token A", "TKA");
        tokenB = new MockERC20("Token B", "TKB");

        paymentStatement = new ERC20PaymentStatement(eas, schemaRegistry);
        validator = new ERC20PaymentFulfillmentArbiter(
            eas,
            schemaRegistry,
            paymentStatement
        );

        tokenA.transfer(alice, 1000 * 10 ** 18);
        tokenB.transfer(bob, 1000 * 10 ** 18);
    }

    function testERC20PaymentStatementSelfReferential() public {
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupTrade();

        // Bob collects Alice's payment
        vm.prank(bob);
        bool successBob = paymentStatement.collectPayment(
            alicePaymentUID,
            bobPaymentUID
        );
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's payment
        vm.prank(alice);
        bool successAlice = paymentStatement.collectPayment(
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
        bool successAlice = paymentStatement.collectPayment(
            bobPaymentUID,
            alicePaymentUID
        );
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Bob collects Alice's payment
        vm.prank(bob);
        bool successBob = paymentStatement.collectPayment(
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
        bool successBob = paymentStatement.collectPayment(
            alicePaymentUID,
            bobPaymentUID
        );
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's payment
        vm.prank(alice);
        bool successAlice = paymentStatement.collectPayment(
            bobPaymentUID,
            alicePaymentUID
        );
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Alice attempts to double spend
        vm.prank(alice);
        vm.expectRevert();
        paymentStatement.collectPayment(bobPaymentUID, alicePaymentUID);
    }

    function testDoubleSpendingBob() public {
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupTrade();

        // Alice collects Bob's payment
        vm.prank(alice);
        bool successAlice = paymentStatement.collectPayment(
            bobPaymentUID,
            alicePaymentUID
        );
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Bob collects Alice's payment
        vm.prank(bob);
        bool successBob = paymentStatement.collectPayment(
            alicePaymentUID,
            bobPaymentUID
        );
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Bob attempts to double spend
        vm.prank(bob);
        vm.expectRevert();
        paymentStatement.collectPayment(alicePaymentUID, bobPaymentUID);
    }

    function _setupTrade()
        internal
        returns (bytes32 alicePaymentUID, bytes32 bobPaymentUID)
    {
        vm.startPrank(alice);
        tokenA.approve(address(paymentStatement), 100 * 10 ** 18);
        ERC20PaymentStatement.StatementData
            memory alicePaymentData = ERC20PaymentStatement.StatementData({
                token: address(tokenA),
                amount: 100 * 10 ** 18,
                arbiter: address(validator),
                demand: abi.encode(
                    ERC20PaymentFulfillmentArbiter.DemandData({
                        token: address(tokenB),
                        amount: 200 * 10 ** 18
                    })
                )
            });
        alicePaymentUID = paymentStatement.makeStatement(
            alicePaymentData,
            0,
            bytes32(0)
        );
        vm.stopPrank();

        vm.startPrank(bob);
        tokenB.approve(address(paymentStatement), 200 * 10 ** 18);
        ERC20PaymentStatement.StatementData
            memory bobPaymentData = ERC20PaymentStatement.StatementData({
                token: address(tokenB),
                amount: 200 * 10 ** 18,
                arbiter: address(0),
                demand: ""
            });
        bobPaymentUID = paymentStatement.makeStatement(
            bobPaymentData,
            0,
            alicePaymentUID
        );

        vm.stopPrank();
    }

    function _assertFinalBalances() internal view {
        assertEq(
            tokenA.balanceOf(alice),
            900 * 10 ** 18,
            "Alice should have 900 Token A"
        );
        assertEq(
            tokenA.balanceOf(bob),
            100 * 10 ** 18,
            "Bob should have 100 Token A"
        );
        assertEq(
            tokenB.balanceOf(alice),
            200 * 10 ** 18,
            "Alice should have 200 Token B"
        );
        assertEq(
            tokenB.balanceOf(bob),
            800 * 10 ** 18,
            "Bob should have 800 Token B"
        );
        assertEq(
            tokenA.balanceOf(address(paymentStatement)),
            0,
            "Payment contract should have no Token A"
        );
        assertEq(
            tokenB.balanceOf(address(paymentStatement)),
            0,
            "Payment contract should have no Token B"
        );
    }
}
