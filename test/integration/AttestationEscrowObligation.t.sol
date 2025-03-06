// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {AttestationEscrowObligation} from "../../src/obligations/AttestationEscrowObligation.sol";
import {IArbiter} from "../../src/IArbiter.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";

contract MockArbiter is IArbiter {
    bool public shouldPass;

    constructor(bool _shouldPass) {
        shouldPass = _shouldPass;
    }

    function checkStatement(
        Attestation memory,
        bytes memory,
        bytes32
    ) external view returns (bool) {
        return shouldPass;
    }
}

contract AttestationEscrowObligationTest is Test {
    AttestationEscrowObligation public escrowObligation;
    MockArbiter public mockArbiter;
    MockArbiter public failingArbiter;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    address public constant EAS_ADDRESS =
        0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS =
        0xA7b39296258348C78294F95B872b282326A97BDF;

    uint256 internal constant ALICE_PRIVATE_KEY = 0xa11ce;
    uint256 internal constant BOB_PRIVATE_KEY = 0xb0b;

    address public alice;
    address public bob;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        mockArbiter = new MockArbiter(true);
        failingArbiter = new MockArbiter(false);

        escrowObligation = new AttestationEscrowObligation(eas, schemaRegistry);
    }

    function testCreateEscrow() public {
        AttestationRequest memory attestationRequest = AttestationRequest({
            schema: escrowObligation.ATTESTATION_SCHEMA(),
            data: AttestationRequestData({
                recipient: bob,
                expirationTime: uint64(block.timestamp + 1 days),
                revocable: true,
                refUID: bytes32(0),
                data: abi.encode("Test attestation data"),
                value: 0
            })
        });

        AttestationEscrowObligation.StatementData
            memory statementData = AttestationEscrowObligation.StatementData({
                attestation: attestationRequest,
                arbiter: address(mockArbiter),
                demand: abi.encode("Test demand")
            });

        vm.prank(alice);
        bytes32 escrowId = escrowObligation.makeStatement(
            statementData,
            uint64(block.timestamp + 1 days)
        );

        assertNotEq(escrowId, bytes32(0), "Escrow should be created");
    }

    function testCollectPaymentSuccess() public {
        // Create escrow
        AttestationRequest memory attestationRequest = AttestationRequest({
            schema: escrowObligation.ATTESTATION_SCHEMA(),
            data: AttestationRequestData({
                recipient: bob,
                expirationTime: uint64(block.timestamp + 1 days),
                revocable: true,
                refUID: bytes32(0),
                data: abi.encode("Test attestation data"),
                value: 0
            })
        });

        AttestationEscrowObligation.StatementData
            memory statementData = AttestationEscrowObligation.StatementData({
                attestation: attestationRequest,
                arbiter: address(mockArbiter),
                demand: abi.encode("Test demand")
            });

        vm.prank(alice);
        bytes32 escrowId = escrowObligation.makeStatement(
            statementData,
            uint64(block.timestamp + 1 days)
        );

        // Create fulfillment attestation through the escrow contract
        vm.prank(bob);
        bytes32 fulfillmentId = escrowObligation.makeStatement(
            statementData,
            uint64(block.timestamp + 1 days)
        );

        vm.prank(bob);
        bytes32 resultId = escrowObligation.collectPayment(
            escrowId,
            fulfillmentId
        );

        assertNotEq(resultId, bytes32(0), "Payment collection should succeed");
    }

    function testCollectPaymentFailure() public {
        // Create escrow with failing arbiter
        AttestationRequest memory attestationRequest = AttestationRequest({
            schema: escrowObligation.ATTESTATION_SCHEMA(),
            data: AttestationRequestData({
                recipient: bob,
                expirationTime: uint64(block.timestamp + 1 days),
                revocable: true,
                refUID: bytes32(0),
                data: abi.encode("Test attestation data"),
                value: 0
            })
        });

        AttestationEscrowObligation.StatementData
            memory statementData = AttestationEscrowObligation.StatementData({
                attestation: attestationRequest,
                arbiter: address(failingArbiter),
                demand: abi.encode("Test demand")
            });

        vm.prank(alice);
        bytes32 escrowId = escrowObligation.makeStatement(
            statementData,
            uint64(block.timestamp + 1 days)
        );

        // Create fulfillment attestation through the escrow contract
        vm.prank(bob);
        bytes32 fulfillmentId = escrowObligation.makeStatement(
            statementData,
            uint64(block.timestamp + 1 days)
        );

        vm.prank(bob);
        vm.expectRevert(
            AttestationEscrowObligation.InvalidFulfillment.selector
        );
        escrowObligation.collectPayment(escrowId, fulfillmentId);
    }

    function testInvalidEscrowAttestation() public {
        vm.prank(bob);
        vm.expectRevert();
        escrowObligation.collectPayment(bytes32(0), bytes32(0));
    }

    function testCheckStatement() public {
        AttestationRequest memory attestationRequest = AttestationRequest({
            schema: escrowObligation.ATTESTATION_SCHEMA(),
            data: AttestationRequestData({
                recipient: bob,
                expirationTime: uint64(block.timestamp + 1 days),
                revocable: true,
                refUID: bytes32(0),
                data: abi.encode("Test attestation data"),
                value: 0
            })
        });

        AttestationEscrowObligation.StatementData
            memory statementData = AttestationEscrowObligation.StatementData({
                attestation: attestationRequest,
                arbiter: address(mockArbiter),
                demand: abi.encode("Test demand")
            });

        vm.prank(alice);
        bytes32 attestationId = escrowObligation.makeStatement(
            statementData,
            uint64(block.timestamp + 1 days)
        );

        Attestation memory attestation = eas.getAttestation(attestationId);

        bool isValid = escrowObligation.checkStatement(
            attestation,
            abi.encode(statementData),
            bytes32(0)
        );

        assertTrue(isValid, "Statement check should pass for valid data");
    }
}
