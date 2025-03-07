// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC20PaymentObligation} from "@src/obligations/ERC20PaymentObligation.sol";
import {IEAS, Attestation} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MCK") {
        _mint(msg.sender, 10000 * 10 ** 18);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract ERC20PaymentObligationTest is Test {
    ERC20PaymentObligation public paymentObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    MockERC20 public token;

    address public constant EAS_ADDRESS =
        0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS =
        0xA7b39296258348C78294F95B872b282326A97BDF;

    address internal payer;
    address internal payee;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        paymentObligation = new ERC20PaymentObligation(eas, schemaRegistry);
        token = new MockERC20();

        payer = makeAddr("payer");
        payee = makeAddr("payee");

        // Fund the payer account
        token.transfer(payer, 1000 * 10 ** 18);
    }

    function testConstructor() public view {
        // Verify contract was initialized correctly
        bytes32 schemaId = paymentObligation.ATTESTATION_SCHEMA();
        assertNotEq(schemaId, bytes32(0), "Schema should be registered");

        // Verify schema details
        SchemaRecord memory schema = paymentObligation.getSchema();
        assertEq(schema.uid, schemaId, "Schema UID should match");
        assertEq(
            schema.schema,
            "address token, uint256 amount, address payee",
            "Schema string should match"
        );
    }

    function testMakeStatement() public {
        uint256 amount = 100 * 10 ** 18;

        // Approve tokens first
        vm.startPrank(payer);
        token.approve(address(paymentObligation), amount);

        // Make payment
        ERC20PaymentObligation.StatementData
            memory data = ERC20PaymentObligation.StatementData({
                token: address(token),
                amount: amount,
                payee: payee
            });

        bytes32 attestationId = paymentObligation.makeStatement(data);
        vm.stopPrank();

        // Verify attestation exists
        assertNotEq(attestationId, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = paymentObligation.getStatement(
            attestationId
        );
        assertEq(
            attestation.schema,
            paymentObligation.ATTESTATION_SCHEMA(),
            "Schema should match"
        );
        assertEq(attestation.recipient, payer, "Recipient should be the payer");

        // Verify token transfer
        assertEq(
            token.balanceOf(payee),
            amount,
            "Payee should have received tokens"
        );
        assertEq(
            token.balanceOf(payer),
            900 * 10 ** 18,
            "Payer should have sent tokens"
        );
    }

    function testMakeStatementFor() public {
        uint256 amount = 150 * 10 ** 18;
        address recipient = makeAddr("recipient");

        // Approve tokens first
        vm.startPrank(payer);
        token.approve(address(paymentObligation), amount);
        vm.stopPrank();

        // Make payment on behalf of payer
        ERC20PaymentObligation.StatementData
            memory data = ERC20PaymentObligation.StatementData({
                token: address(token),
                amount: amount,
                payee: payee
            });

        vm.prank(address(this));
        bytes32 attestationId = paymentObligation.makeStatementFor(
            data,
            payer,
            recipient
        );

        // Verify attestation exists
        assertNotEq(attestationId, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = paymentObligation.getStatement(
            attestationId
        );
        assertEq(
            attestation.schema,
            paymentObligation.ATTESTATION_SCHEMA(),
            "Schema should match"
        );
        assertEq(
            attestation.recipient,
            recipient,
            "Recipient should be the specified recipient"
        );

        // Verify token transfer
        assertEq(
            token.balanceOf(payee),
            amount,
            "Payee should have received tokens"
        );
        assertEq(
            token.balanceOf(payer),
            850 * 10 ** 18,
            "Payer should have sent tokens"
        );
    }

    function testCheckStatement() public {
        uint256 amount = 200 * 10 ** 18;

        // Approve tokens first
        vm.startPrank(payer);
        token.approve(address(paymentObligation), amount);

        // Make payment
        ERC20PaymentObligation.StatementData
            memory data = ERC20PaymentObligation.StatementData({
                token: address(token),
                amount: amount,
                payee: payee
            });

        bytes32 attestationId = paymentObligation.makeStatement(data);
        vm.stopPrank();

        // Get the attestation
        Attestation memory attestation = paymentObligation.getStatement(
            attestationId
        );

        // Test exact match demand
        ERC20PaymentObligation.StatementData
            memory exactDemand = ERC20PaymentObligation.StatementData({
                token: address(token),
                amount: amount,
                payee: payee
            });

        bool exactMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(exactDemand),
            bytes32(0)
        );
        assertTrue(exactMatch, "Should match exact demand");

        // Test lower amount demand
        ERC20PaymentObligation.StatementData
            memory lowerDemand = ERC20PaymentObligation.StatementData({
                token: address(token),
                amount: amount - 50 * 10 ** 18,
                payee: payee
            });

        bool lowerMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(lowerDemand),
            bytes32(0)
        );
        assertTrue(lowerMatch, "Should match lower amount demand");

        // Test higher amount demand (should fail)
        ERC20PaymentObligation.StatementData
            memory higherDemand = ERC20PaymentObligation.StatementData({
                token: address(token),
                amount: amount + 50 * 10 ** 18,
                payee: payee
            });

        bool higherMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(higherDemand),
            bytes32(0)
        );
        assertFalse(higherMatch, "Should not match higher amount demand");

        // Test different token demand (should fail)
        MockERC20 differentToken = new MockERC20();
        ERC20PaymentObligation.StatementData
            memory differentTokenDemand = ERC20PaymentObligation.StatementData({
                token: address(differentToken),
                amount: amount,
                payee: payee
            });

        bool differentTokenMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(differentTokenDemand),
            bytes32(0)
        );
        assertFalse(
            differentTokenMatch,
            "Should not match different token demand"
        );

        // Test different payee demand (should fail)
        ERC20PaymentObligation.StatementData
            memory differentPayeeDemand = ERC20PaymentObligation.StatementData({
                token: address(token),
                amount: amount,
                payee: makeAddr("differentPayee")
            });

        bool differentPayeeMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(differentPayeeDemand),
            bytes32(0)
        );
        assertFalse(
            differentPayeeMatch,
            "Should not match different payee demand"
        );
    }

    function testInvalidPaymentReverts() public {
        uint256 amount = 2000 * 10 ** 18; // More than payer has

        // Approve tokens first
        vm.startPrank(payer);
        token.approve(address(paymentObligation), amount);

        // Try to make payment with insufficient balance
        ERC20PaymentObligation.StatementData
            memory data = ERC20PaymentObligation.StatementData({
                token: address(token),
                amount: amount,
                payee: payee
            });

        vm.expectRevert();
        paymentObligation.makeStatement(data);
        vm.stopPrank();
    }
}
