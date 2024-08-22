// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/it1_bytes_arbiters/ERC20PaymentStatement.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract ERC20PaymentStatementSelfReferentialTest is Test {
    ERC20PaymentStatement public paymentStatement;
    MockERC20 public tokenA;
    MockERC20 public tokenB;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    address public constant EAS_ADDRESS = 0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS = 0xA7b39296258348C78294F95B872b282326A97BDF;

    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        // Fork Ethereum mainnet
        vm.createSelectFork(vm.rpcUrl(vm.envString("INFURA_URL_MAINNET")));

        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        // Instantiate the tokens
        tokenA = new MockERC20("Token A", "TKA");
        tokenB = new MockERC20("Token B", "TKB");

        // Instantiate the ERC20PaymentStatement contract
        paymentStatement = new ERC20PaymentStatement(eas, schemaRegistry);

        // Fund Alice and Bob with tokens
        tokenA.transfer(alice, 1000 * 10 ** 18);
        tokenB.transfer(bob, 1000 * 10 ** 18);
    }

    function testERC20PaymentStatementSelfReferential() public {
        // Alice offers to trade 100 Token A for 200 Token B
        vm.startPrank(alice);
        tokenA.approve(address(paymentStatement), 100 * 10 ** 18);

        ERC20PaymentStatement.StatementData memory alicePaymentData = ERC20PaymentStatement.StatementData({
            token: address(tokenA),
            amount: 100 * 10 ** 18,
            arbiter: address(paymentStatement),
            demand: abi.encode(
                ERC20PaymentStatement.StatementData({
                    token: address(tokenB),
                    amount: 200 * 10 ** 18,
                    arbiter: address(0), // Not relevant for this demand
                    demand: "" // Not relevant for this demand
                })
            )
        });

        bytes32 alicePaymentUID = paymentStatement.makeStatement(alicePaymentData, 0, bytes32(0));
        vm.stopPrank();

        // Bob accepts the trade by creating a matching payment statement
        vm.startPrank(bob);
        tokenB.approve(address(paymentStatement), 200 * 10 ** 18);

        ERC20PaymentStatement.StatementData memory bobPaymentData = ERC20PaymentStatement.StatementData({
            token: address(tokenB),
            amount: 200 * 10 ** 18,
            arbiter: address(paymentStatement),
            demand: abi.encode(
                ERC20PaymentStatement.StatementData({
                    token: address(tokenA),
                    amount: 100 * 10 ** 18,
                    arbiter: address(0), // Not relevant for this demand
                    demand: "" // Not relevant for this demand
                })
            )
        });

        bytes32 bobPaymentUID = paymentStatement.makeStatement(bobPaymentData, 0, alicePaymentUID);

        // Bob collects Alice's payment
        bool successBob = paymentStatement.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's payment
        vm.stopPrank();
        vm.prank(alice);
        bool successAlice = paymentStatement.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Check final balances
        assertEq(tokenA.balanceOf(alice), 900 * 10 ** 18, "Alice should have 900 Token A");
        assertEq(tokenA.balanceOf(bob), 100 * 10 ** 18, "Bob should have 100 Token A");
        assertEq(tokenB.balanceOf(alice), 200 * 10 ** 18, "Alice should have 200 Token B");
        assertEq(tokenB.balanceOf(bob), 800 * 10 ** 18, "Bob should have 800 Token B");
        assertEq(tokenA.balanceOf(address(paymentStatement)), 0, "Payment contract should have no Token A");
        assertEq(tokenB.balanceOf(address(paymentStatement)), 0, "Payment contract should have no Token B");
    }
}
