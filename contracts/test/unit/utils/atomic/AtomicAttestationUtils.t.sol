// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {AttestationRequest, AttestationRequestData, IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {ISchemaResolver} from "@eas/resolver/ISchemaResolver.sol";
import {TrivialArbiter} from "@src/arbiters/TrivialArbiter.sol";
import {
    AttestationReferenceEscrowObligation
} from "@src/obligations/escrow/default/AttestationReferenceEscrowObligation.sol";
import {AtomicAttestationUtils} from "@src/utils/atomic/AtomicAttestationUtils.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract AtomicAttestationUtilsTest is Test {
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    TrivialArbiter public trivialArbiter;
    AttestationReferenceEscrowObligation public referenceEscrow;
    AtomicAttestationUtils public atomicUtils;

    uint256 internal constant ALICE_PRIVATE_KEY = 0xa11ce;

    address public alice;
    bytes32 public testSchema;

    event ReferenceEscrowCreated(
        address indexed escrow, bytes32 indexed attestationUid, bytes32 indexed escrowUid, bool unconditional
    );

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        alice = vm.addr(ALICE_PRIVATE_KEY);
        trivialArbiter = new TrivialArbiter();
        referenceEscrow = new AttestationReferenceEscrowObligation(eas, schemaRegistry);
        atomicUtils = new AtomicAttestationUtils(eas);

        testSchema = schemaRegistry.register("bool value", ISchemaResolver(address(0)), true);
    }

    function testAttestAndCreateReferenceEscrow() public {
        AttestationRequest memory request = AttestationRequest({
            schema: testSchema,
            data: AttestationRequestData({
                recipient: alice,
                expirationTime: uint64(block.timestamp + 1 days),
                revocable: false,
                refUID: bytes32(0),
                data: abi.encode(true),
                value: 0
            })
        });

        AtomicAttestationUtils.ReferenceEscrowData memory escrowData = AtomicAttestationUtils.ReferenceEscrowData({
            arbiter: address(trivialArbiter),
            demand: "",
            expirationTime: uint64(block.timestamp + 2 days)
        });

        vm.prank(alice);
        vm.recordLogs();
        (bytes32 attestationUid, bytes32 escrowUid) = atomicUtils.attestAndCreateReferenceEscrow(
            referenceEscrow, request, escrowData, uint64(block.timestamp + 3 days)
        );

        assertNotEq(attestationUid, bytes32(0), "Attestation should be created");
        assertNotEq(escrowUid, bytes32(0), "Escrow should be created");
        assertEq(eas.getAttestation(attestationUid).attester, address(atomicUtils), "Utility should attest");
        assertEq(eas.getAttestation(escrowUid).recipient, alice, "Escrow should be credited to caller");

        AttestationReferenceEscrowObligation.ObligationData memory createdEscrow =
            referenceEscrow.getObligationData(escrowUid);
        assertEq(createdEscrow.referencedAttestationUid, attestationUid, "Escrow should reference created attestation");
        assertEq(createdEscrow.arbiter, address(trivialArbiter), "Arbiter should match");
        assertEq(createdEscrow.expirationTime, escrowData.expirationTime, "Reference attestation expiration");

        Vm.Log[] memory logs = vm.getRecordedLogs();
        bytes32 eventSignature = keccak256("ReferenceEscrowCreated(address,bytes32,bytes32,bool)");
        bool found;
        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].emitter == address(atomicUtils) && logs[i].topics[0] == eventSignature) {
                assertEq(address(uint160(uint256(logs[i].topics[1]))), address(referenceEscrow), "Event escrow");
                assertEq(logs[i].topics[2], attestationUid, "Event attestation UID");
                assertEq(logs[i].topics[3], escrowUid, "Event escrow UID");
                assertEq(abi.decode(logs[i].data, (bool)), false, "Event variant");
                found = true;
            }
        }
        assertTrue(found, "ReferenceEscrowCreated event should be emitted");
    }

    function testRejectsRevocableAttestation() public {
        AttestationRequest memory request = AttestationRequest({
            schema: testSchema,
            data: AttestationRequestData({
                recipient: alice,
                expirationTime: uint64(block.timestamp + 1 days),
                revocable: true,
                refUID: bytes32(0),
                data: abi.encode(true),
                value: 0
            })
        });

        AtomicAttestationUtils.ReferenceEscrowData memory escrowData = AtomicAttestationUtils.ReferenceEscrowData({
            arbiter: address(trivialArbiter),
            demand: "",
            expirationTime: uint64(block.timestamp + 2 days)
        });

        vm.prank(alice);
        vm.expectRevert(AtomicAttestationUtils.UnsupportedRevocableAttestation.selector);
        atomicUtils.attestAndCreateReferenceEscrow(referenceEscrow, request, escrowData, uint64(block.timestamp + 3 days));
    }
}
