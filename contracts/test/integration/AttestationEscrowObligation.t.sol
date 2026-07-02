// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {AttestationEscrowObligation} from "@src/obligations/escrow/default/AttestationEscrowObligation.sol";
import {BaseEscrowObligation} from "@src/BaseEscrowObligation.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {BaseArbiter} from "@src/BaseArbiter.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {ISchemaResolver} from "@eas/resolver/ISchemaResolver.sol";
import {Attestation} from "@eas/Common.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract MockArbiter is BaseArbiter {
    bool public shouldPass;

    constructor(bool _shouldPass) {
        shouldPass = _shouldPass;
    }

    function check(Attestation memory, bytes memory, bytes32) external view returns (bool) {
        return shouldPass;
    }
}

contract AttestationEscrowObligationTest is Test {
    AttestationEscrowObligation public escrowObligation;
    MockArbiter public mockArbiter;
    MockArbiter public failingArbiter;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    bytes32 public producedAttestationSchema;

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
        producedAttestationSchema = schemaRegistry.register("bytes data", ISchemaResolver(address(0)), false);
    }

    function testCreateEscrow() public {
        AttestationRequest memory attestationRequest = AttestationRequest({
            schema: producedAttestationSchema,
            data: AttestationRequestData({
                recipient: bob,
                expirationTime: uint64(block.timestamp + 1 days),
                revocable: false,
                refUID: bytes32(0),
                data: abi.encode("Test attestation data"),
                value: 0
            })
        });

        AttestationEscrowObligation.ObligationData memory obligationData = AttestationEscrowObligation.ObligationData({
            attestation: attestationRequest, arbiter: address(mockArbiter), demand: abi.encode("Test demand")
        });

        vm.prank(alice);
        bytes32 escrowId = escrowObligation.doObligation(obligationData, uint64(block.timestamp + 1 days));

        assertNotEq(escrowId, bytes32(0), "Escrow should be created");
    }

    function testCollectEscrowSuccess() public {
        // Create escrow
        AttestationRequest memory attestationRequest = AttestationRequest({
            schema: producedAttestationSchema,
            data: AttestationRequestData({
                recipient: bob,
                expirationTime: uint64(block.timestamp + 1 days),
                revocable: false,
                refUID: bytes32(0),
                data: abi.encode("Test attestation data"),
                value: 0
            })
        });

        AttestationEscrowObligation.ObligationData memory obligationData = AttestationEscrowObligation.ObligationData({
            attestation: attestationRequest, arbiter: address(mockArbiter), demand: abi.encode("Test demand")
        });

        vm.prank(alice);
        bytes32 escrowId = escrowObligation.doObligation(obligationData, uint64(block.timestamp + 1 days));

        // Create fulfillment attestation using StringObligation that references the escrow
        StringObligation stringObligation = new StringObligation(eas, schemaRegistry);

        vm.prank(bob);
        bytes32 fulfillmentId = stringObligation.doObligation(
            StringObligation.ObligationData({item: "Test demand", schema: bytes32(0)}),
            escrowId // Reference the escrow for default pattern
        );

        vm.prank(bob);
        bytes32 resultId = abi.decode(escrowObligation.collect(escrowId, fulfillmentId), (bytes32));

        assertNotEq(resultId, bytes32(0), "Payment collection should succeed");
    }

    function testCollectEscrowFailure() public {
        // Create escrow with failing arbiter
        AttestationRequest memory attestationRequest = AttestationRequest({
            schema: producedAttestationSchema,
            data: AttestationRequestData({
                recipient: bob,
                expirationTime: uint64(block.timestamp + 1 days),
                revocable: false,
                refUID: bytes32(0),
                data: abi.encode("Test attestation data"),
                value: 0
            })
        });

        AttestationEscrowObligation.ObligationData memory obligationData = AttestationEscrowObligation.ObligationData({
            attestation: attestationRequest, arbiter: address(failingArbiter), demand: abi.encode("Test demand")
        });

        vm.prank(alice);
        bytes32 escrowId = escrowObligation.doObligation(obligationData, uint64(block.timestamp + 1 days));

        // Create fulfillment attestation through the escrow contract
        vm.prank(bob);
        bytes32 fulfillmentId = escrowObligation.doObligation(obligationData, uint64(block.timestamp + 1 days));

        vm.prank(bob);
        vm.expectRevert(BaseEscrowObligation.InvalidFulfillment.selector);
        escrowObligation.collect(escrowId, fulfillmentId);
    }

    function testInvalidEscrowAttestation() public {
        vm.prank(bob);
        vm.expectRevert();
        escrowObligation.collect(bytes32(0), bytes32(0));
    }

    function testCheckObligation() public {
        AttestationRequest memory attestationRequest = AttestationRequest({
            schema: producedAttestationSchema,
            data: AttestationRequestData({
                recipient: bob,
                expirationTime: uint64(block.timestamp + 1 days),
                revocable: false,
                refUID: bytes32(0),
                data: abi.encode("Test attestation data"),
                value: 0
            })
        });

        AttestationEscrowObligation.ObligationData memory obligationData = AttestationEscrowObligation.ObligationData({
            attestation: attestationRequest, arbiter: address(mockArbiter), demand: abi.encode("Test demand")
        });

        vm.prank(alice);
        bytes32 attestationId = escrowObligation.doObligation(obligationData, uint64(block.timestamp + 1 days));

        Attestation memory attestation = eas.getAttestation(attestationId);

        bool isValid = escrowObligation.check(attestation, abi.encode(obligationData), bytes32(0));

        assertTrue(isValid, "Statement check should pass for valid data");
    }
}
