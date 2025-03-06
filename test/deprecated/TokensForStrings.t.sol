// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {ERC20EscrowObligation} from "../../src/obligations/ERC20EscrowObligation.sol";
import {StringResultObligation} from "../../src/obligations/example/StringResultObligation.sol";
import {OptimisticStringValidator} from "../../src/arbiters/example/OptimisticStringValidator.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("MockToken", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract TokensForStringsTest is Test {
    ERC20EscrowObligation public paymentStatement;
    OptimisticStringValidator public validator;
    StringResultObligation public resultStatement;
    MockERC20 public mockToken;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    address public constant EAS_ADDRESS =
        0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS =
        0xA7b39296258348C78294F95B872b282326A97BDF;

    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        // Fork Ethereum mainnet
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        mockToken = new MockERC20();
        resultStatement = new StringResultObligation(eas, schemaRegistry);
        paymentStatement = new ERC20EscrowObligation(eas, schemaRegistry);
        validator = new OptimisticStringValidator(
            eas,
            schemaRegistry,
            resultStatement
        );

        // Fund Alice and Bob with mock tokens
        mockToken.transfer(alice, 1000 * 10 ** 18);
        mockToken.transfer(bob, 1000 * 10 ** 18);
    }

    function testHappyPathWithStringStatementArbiter() public {
        vm.startPrank(alice);
        mockToken.approve(address(paymentStatement), 100 * 10 ** 18);

        StringResultObligation.DemandData
            memory stringDemand = StringResultObligation.DemandData({
                query: "hello world"
            });

        ERC20EscrowObligation.StatementData
            memory paymentData = ERC20EscrowObligation.StatementData({
                token: address(mockToken),
                amount: 100 * 10 ** 18,
                arbiter: address(resultStatement),
                demand: abi.encode(stringDemand)
            });

        bytes32 paymentUID = paymentStatement.makeStatement(paymentData, 0);
        vm.stopPrank();

        vm.startPrank(bob);
        StringResultObligation.StatementData
            memory resultData = StringResultObligation.StatementData({
                result: "HELLO WORLD"
            });
        bytes32 resultUID = resultStatement.makeStatement(
            resultData,
            paymentUID
        );

        // Collect payment
        bool success = paymentStatement.collectPayment(paymentUID, resultUID);
        assertTrue(success, "Payment collection should succeed");
        vm.stopPrank();

        // Check balances
        assertEq(
            mockToken.balanceOf(bob),
            1100 * 10 ** 18,
            "Bob should have received the payment"
        );
        assertEq(
            mockToken.balanceOf(address(paymentStatement)),
            0,
            "Payment contract should have no balance"
        );
    }

    function testHappyPathWithValidator() public {
        vm.startPrank(alice);
        mockToken.approve(address(paymentStatement), 100 * 10 ** 18);

        OptimisticStringValidator.ValidationData
            memory validationDemand = OptimisticStringValidator.ValidationData({
                query: "hello world",
                mediationPeriod: 1 days
            });

        ERC20EscrowObligation.StatementData
            memory paymentData = ERC20EscrowObligation.StatementData({
                token: address(mockToken),
                amount: 100 * 10 ** 18,
                arbiter: address(validator),
                demand: abi.encode(validationDemand)
            });

        bytes32 paymentUID = paymentStatement.makeStatement(paymentData, 0);
        vm.stopPrank();

        vm.startPrank(bob);
        StringResultObligation.StatementData
            memory resultData = StringResultObligation.StatementData({
                result: "HELLO WORLD"
            });
        bytes32 resultUID = resultStatement.makeStatement(
            resultData,
            paymentUID
        );

        OptimisticStringValidator.ValidationData
            memory validationData = OptimisticStringValidator.ValidationData({
                query: "hello world",
                mediationPeriod: 1 days
            });
        bytes32 validationUID = validator.startValidation(
            resultUID,
            validationData
        );
        vm.stopPrank();

        // Wait for the mediation period to pass
        vm.warp(block.timestamp + 2 days);

        // Collect payment
        vm.prank(bob);
        bool success = paymentStatement.collectPayment(
            paymentUID,
            validationUID
        );
        assertTrue(success, "Payment collection should succeed");
        vm.stopPrank();

        // Check balances
        assertEq(
            mockToken.balanceOf(bob),
            1100 * 10 ** 18,
            "Bob should have received the payment"
        );
        assertEq(
            mockToken.balanceOf(address(paymentStatement)),
            0,
            "Payment contract should have no balance"
        );
    }

    function testMediationRequestedCorrect() public {
        vm.startPrank(alice);
        mockToken.approve(address(paymentStatement), 100 * 10 ** 18);

        OptimisticStringValidator.ValidationData
            memory validationDemand = OptimisticStringValidator.ValidationData({
                query: "hello world",
                mediationPeriod: 1 days
            });

        ERC20EscrowObligation.StatementData
            memory paymentData = ERC20EscrowObligation.StatementData({
                token: address(mockToken),
                amount: 100 * 10 ** 18,
                arbiter: address(validator),
                demand: abi.encode(validationDemand)
            });

        bytes32 paymentUID = paymentStatement.makeStatement(paymentData, 0);
        vm.stopPrank();

        vm.startPrank(bob);
        StringResultObligation.StatementData
            memory resultData = StringResultObligation.StatementData({
                result: "HELLO WORLD"
            });
        bytes32 resultUID = resultStatement.makeStatement(
            resultData,
            paymentUID
        );

        OptimisticStringValidator.ValidationData
            memory validationData = OptimisticStringValidator.ValidationData({
                query: "hello world",
                mediationPeriod: 1 days
            });
        bytes32 validationUID = validator.startValidation(
            resultUID,
            validationData
        );
        vm.stopPrank();

        // Request mediation
        validator.mediate(validationUID);

        // Wait for the mediation period to pass
        vm.warp(block.timestamp + 2 days);

        // Collect payment
        vm.prank(bob);
        bool success = paymentStatement.collectPayment(
            paymentUID,
            validationUID
        );
        assertTrue(
            success,
            "Payment collection should succeed after correct mediation and waiting period"
        );
    }

    function testMediationRequestedIncorrect() public {
        vm.startPrank(alice);
        mockToken.approve(address(paymentStatement), 100 * 10 ** 18);

        OptimisticStringValidator.ValidationData
            memory validationDemand = OptimisticStringValidator.ValidationData({
                query: "hello world",
                mediationPeriod: 1 days
            });

        ERC20EscrowObligation.StatementData
            memory paymentData = ERC20EscrowObligation.StatementData({
                token: address(mockToken),
                amount: 100 * 10 ** 18,
                arbiter: address(validator),
                demand: abi.encode(validationDemand)
            });

        bytes32 paymentUID = paymentStatement.makeStatement(paymentData, 0);
        vm.stopPrank();

        vm.startPrank(bob);
        StringResultObligation.StatementData
            memory resultData = StringResultObligation.StatementData({
                result: "INCORRECT RESULT"
            });
        bytes32 resultUID = resultStatement.makeStatement(
            resultData,
            paymentUID
        );

        OptimisticStringValidator.ValidationData
            memory validationData = OptimisticStringValidator.ValidationData({
                query: "hello world",
                mediationPeriod: 1 days
            });
        bytes32 validationUID = validator.startValidation(
            resultUID,
            validationData
        );
        vm.stopPrank();

        // Request mediation
        validator.mediate(validationUID);

        // Wait for the mediation period to pass
        vm.warp(block.timestamp + 2 days);

        // Try to collect payment
        vm.prank(bob);
        vm.expectRevert(); // Expect the transaction to revert
        paymentStatement.collectPayment(paymentUID, validationUID);
    }

    function testIncorrectResultStringLengthsDifferent() public {
        vm.startPrank(alice);
        mockToken.approve(address(paymentStatement), 100 * 10 ** 18);

        StringResultObligation.DemandData
            memory stringDemand = StringResultObligation.DemandData({
                query: "hello world"
            });

        ERC20EscrowObligation.StatementData
            memory paymentData = ERC20EscrowObligation.StatementData({
                token: address(mockToken),
                amount: 100 * 10 ** 18,
                arbiter: address(resultStatement),
                demand: abi.encode(stringDemand)
            });

        bytes32 paymentUID = paymentStatement.makeStatement(paymentData, 0);
        vm.stopPrank();

        vm.startPrank(bob);
        StringResultObligation.StatementData
            memory resultData = StringResultObligation.StatementData({
                result: "INCORRECT LENGTH RESULT"
            });
        bytes32 resultUID = resultStatement.makeStatement(
            resultData,
            paymentUID
        );
        vm.stopPrank();

        // Try to collect payment
        vm.prank(bob);
        vm.expectRevert(); // Expect the transaction to revert
        paymentStatement.collectPayment(paymentUID, resultUID);
    }
}
