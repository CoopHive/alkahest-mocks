// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {AttestationEscrowObligation} from "@src/obligations/AttestationEscrowObligation.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract MockArbiter is IArbiter {
    bool public shouldPass;

    constructor(bool _shouldPass) {
        shouldPass = _shouldPass;
    }

    function checkObligation(
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

    uint256 internal constant ALICE_PRIVATE_KEY = 0xa11ce;
    uint256 internal constant BOB_PRIVATE_KEY = 0xb0b;

    address public alice;
    address public bob;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

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

        AttestationEscrowObligation.ObligationData
            memory obligationData = AttestationEscrowObligation.ObligationData({
                attestation: attestationRequest,
                arbiter: address(mockArbiter),
                demand: abi.encode("Test demand")
            });

        vm.prank(alice);
        bytes32 escrowId = escrowObligation.doObligation(
            obligationData,
            uint64(block.timestamp + 1 days)
        );

        assertNotEq(escrowId, bytes32(0), "Escrow should be created");
    }

    function testCollectEscrowSuccess() public {
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

        AttestationEscrowObligation.ObligationData
            memory obligationData = AttestationEscrowObligation.ObligationData({
                attestation: attestationRequest,
                arbiter: address(mockArbiter),
                demand: abi.encode("Test demand")
            });

        vm.prank(alice);
        bytes32 escrowId = escrowObligation.doObligation(
            obligationData,
            uint64(block.timestamp + 1 days)
        );

        // Create fulfillment attestation through the escrow contract
        vm.prank(bob);
        bytes32 fulfillmentId = escrowObligation.doObligation(
            obligationData,
            uint64(block.timestamp + 1 days)
        );

        vm.prank(bob);
        bytes32 resultId = escrowObligation.collectEscrow(
            escrowId,
            fulfillmentId
        );

        assertNotEq(resultId, bytes32(0), "Payment collection should succeed");
    }

    function testCollectEscrowFailure() public {
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

        AttestationEscrowObligation.ObligationData
            memory obligationData = AttestationEscrowObligation.ObligationData({
                attestation: attestationRequest,
                arbiter: address(failingArbiter),
                demand: abi.encode("Test demand")
            });

        vm.prank(alice);
        bytes32 escrowId = escrowObligation.doObligation(
            obligationData,
            uint64(block.timestamp + 1 days)
        );

        // Create fulfillment attestation through the escrow contract
        vm.prank(bob);
        bytes32 fulfillmentId = escrowObligation.doObligation(
            obligationData,
            uint64(block.timestamp + 1 days)
        );

        vm.prank(bob);
        vm.expectRevert(
            AttestationEscrowObligation.InvalidFulfillment.selector
        );
        escrowObligation.collectEscrow(escrowId, fulfillmentId);
    }

    function testInvalidEscrowAttestation() public {
        vm.prank(bob);
        vm.expectRevert();
        escrowObligation.collectEscrow(bytes32(0), bytes32(0));
    }

    function testCheckObligation() public {
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

        AttestationEscrowObligation.ObligationData
            memory obligationData = AttestationEscrowObligation.ObligationData({
                attestation: attestationRequest,
                arbiter: address(mockArbiter),
                demand: abi.encode("Test demand")
            });

        vm.prank(alice);
        bytes32 attestationId = escrowObligation.doObligation(
            obligationData,
            uint64(block.timestamp + 1 days)
        );

        Attestation memory attestation = eas.getAttestation(attestationId);

        bool isValid = escrowObligation.checkObligation(
            attestation,
            abi.encode(obligationData),
            bytes32(0)
        );

        assertTrue(isValid, "Statement check should pass for valid data");
    }
}
