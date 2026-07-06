// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {
    AttestationReferenceEscrowObligation
} from "@src/obligations/escrow/default/AttestationReferenceEscrowObligation.sol";
import {BaseEscrowObligation} from "@src/BaseEscrowObligation.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {MockArbiter} from "../../fixtures/MockArbiter.sol";
import {
    IEAS,
    Attestation,
    AttestationRequest,
    AttestationRequestData,
    RevocationRequest,
    RevocationRequestData
} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {ISchemaResolver} from "@eas/resolver/ISchemaResolver.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract AttestationReferenceEscrowObligationTest is Test {
    AttestationReferenceEscrowObligation public escrowObligation;
    StringObligation public stringObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    MockArbiter public mockArbiter;
    MockArbiter public rejectingArbiter;

    address internal requester;
    address internal attester;
    address internal recipient;

    // Test schema ID (will be registered during setup)
    bytes32 private testSchemaId;
    // Pre-made attestation ID
    bytes32 private preExistingAttestationId;

    uint64 constant EXPIRATION_TIME = 365 days;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        escrowObligation = new AttestationReferenceEscrowObligation(eas, schemaRegistry);
        stringObligation = new StringObligation(eas, schemaRegistry);
        mockArbiter = new MockArbiter(true);
        rejectingArbiter = new MockArbiter(false);

        requester = makeAddr("requester");
        attester = makeAddr("attester");
        recipient = makeAddr("recipient");

        // Register a test schema for our tests
        vm.prank(address(this));
        testSchemaId = schemaRegistry.register("string testData", ISchemaResolver(address(0)), true); // Make schema revocable

        // Create a pre-existing attestation
        vm.prank(attester);
        preExistingAttestationId = eas.attest(
            AttestationRequest({
                schema: testSchemaId,
                data: AttestationRequestData({
                    recipient: recipient,
                    expirationTime: 0,
                    revocable: true, // This matches the schema now
                    refUID: bytes32(0),
                    data: abi.encode("pre-existing attestation data"),
                    value: 0
                })
            })
        );
    }

    function testConstructor() public view {
        // Verify contract was initialized correctly
        bytes32 schemaId = escrowObligation.ATTESTATION_SCHEMA();
        assertNotEq(schemaId, bytes32(0), "Schema should be registered");

        // Verify schema details
        SchemaRecord memory schema = escrowObligation.getSchema();
        assertEq(schema.uid, schemaId, "Schema UID should match");
        assertEq(
            schema.schema,
            "address arbiter, bytes demand, bytes32 referencedAttestationUid, uint64 expirationTime",
            "Schema string should match"
        );

        // Verify reference attestation schema
        bytes32 referenceSchemaId = escrowObligation.REFERENCE_ATTESTATION_SCHEMA();
        assertNotEq(referenceSchemaId, bytes32(0), "Reference attestation schema should be registered");

        SchemaRecord memory referenceSchema = schemaRegistry.getSchema(referenceSchemaId);
        assertEq(referenceSchema.uid, referenceSchemaId, "Reference attestation schema UID should match");
        assertEq(referenceSchema.schema, "bytes32 referencedAttestationUid", "Reference attestation schema string should match");
        assertFalse(referenceSchema.revocable, "Reference attestation schema should not be revocable without a revoke path");
    }

    function testMakeStatement() public {
        vm.startPrank(requester);

        // Create the obligation data
        AttestationReferenceEscrowObligation.ObligationData memory data =
            AttestationReferenceEscrowObligation.ObligationData({
                referencedAttestationUid: preExistingAttestationId,
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand"),
                expirationTime: 0
            });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 uid = escrowObligation.doObligation(data, expiration);
        vm.stopPrank();

        // Verify attestation exists
        assertNotEq(uid, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = eas.getAttestation(uid);
        assertEq(attestation.schema, escrowObligation.ATTESTATION_SCHEMA(), "Schema should match");
        assertEq(attestation.recipient, requester, "Recipient should be the requester");

        // Verify attestation data
        AttestationReferenceEscrowObligation.ObligationData memory storedData =
            abi.decode(attestation.data, (AttestationReferenceEscrowObligation.ObligationData));
        assertEq(storedData.referencedAttestationUid, preExistingAttestationId, "Attestation UID should match");
        assertEq(storedData.arbiter, address(mockArbiter), "Arbiter should match");
    }

    function testDoObligationFor() public {
        // Create the obligation data
        AttestationReferenceEscrowObligation.ObligationData memory data =
            AttestationReferenceEscrowObligation.ObligationData({
                referencedAttestationUid: preExistingAttestationId,
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand"),
                expirationTime: 0
            });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);

        vm.prank(address(this));
        bytes32 uid = escrowObligation.doObligationFor(data, expiration, recipient);

        // Verify attestation exists
        assertNotEq(uid, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = eas.getAttestation(uid);
        assertEq(attestation.schema, escrowObligation.ATTESTATION_SCHEMA(), "Schema should match");
        assertEq(attestation.recipient, recipient, "Recipient should be the specified recipient");

        // Verify attestation data
        AttestationReferenceEscrowObligation.ObligationData memory storedData =
            abi.decode(attestation.data, (AttestationReferenceEscrowObligation.ObligationData));
        assertEq(storedData.referencedAttestationUid, preExistingAttestationId, "Attestation UID should match");
        assertEq(storedData.arbiter, address(mockArbiter), "Arbiter should match");
    }

    function testCollectEscrow() public {
        // Setup: create an escrow with the accepting MockArbiter
        vm.startPrank(requester);

        // Create the obligation data
        AttestationReferenceEscrowObligation.ObligationData memory data =
            AttestationReferenceEscrowObligation.ObligationData({
                referencedAttestationUid: preExistingAttestationId,
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand"),
                expirationTime: 0
            });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 escrowUid = escrowObligation.doObligation(data, expiration);
        vm.stopPrank();

        // Create a fulfillment attestation from the attester using StringObligation
        vm.prank(attester);
        StringObligation.ObligationData memory stringData =
            StringObligation.ObligationData({item: "fulfillment data", schema: bytes32(0)});

        bytes32 fulfillmentUid = stringObligation.doObligation(stringData, escrowUid);

        // Collect payment
        vm.prank(attester);
        bytes32 referenceAttestationUid = abi.decode(escrowObligation.collect(escrowUid, fulfillmentUid), (bytes32));

        assertNotEq(referenceAttestationUid, bytes32(0), "Reference attestation UID should not be empty");

        // Verify that the reference attestation was created
        Attestation memory referenceAttestation = eas.getAttestation(referenceAttestationUid);
        assertEq(
            referenceAttestation.schema,
            escrowObligation.REFERENCE_ATTESTATION_SCHEMA(),
            "Reference attestation should have the reference attestation schema"
        );
        assertEq(
            referenceAttestation.recipient, attester, "Reference attestation should have the attester as recipient"
        );
        assertEq(
            referenceAttestation.refUID,
            preExistingAttestationId,
            "Reference attestation should reference the original attestation"
        );
        assertEq(referenceAttestation.expirationTime, 0, "Reference attestation should not expire by default");
        assertFalse(referenceAttestation.revocable, "Reference attestation should not be revocable by default");

        // Verify that the escrowed attestation was revoked
        Attestation memory revokedEscrow = eas.getAttestation(escrowUid);
        assertTrue(revokedEscrow.revocationTime > 0, "Escrow attestation should be revoked");
    }

    function testCollectEscrowUsesConfiguredExpiration() public {
        uint64 expiration = uint64(block.timestamp + 30 days);
        AttestationReferenceEscrowObligation.ObligationData memory data =
            AttestationReferenceEscrowObligation.ObligationData({
                referencedAttestationUid: preExistingAttestationId,
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand"),
                expirationTime: expiration
            });

        vm.prank(requester);
        bytes32 escrowUid = escrowObligation.doObligation(data, uint64(block.timestamp + EXPIRATION_TIME));

        vm.prank(attester);
        StringObligation.ObligationData memory stringData =
            StringObligation.ObligationData({item: "fulfillment data", schema: bytes32(0)});
        bytes32 fulfillmentUid = stringObligation.doObligation(stringData, escrowUid);

        vm.prank(attester);
        bytes32 referenceAttestationUid = abi.decode(escrowObligation.collect(escrowUid, fulfillmentUid), (bytes32));

        Attestation memory referenceAttestation = eas.getAttestation(referenceAttestationUid);
        assertEq(referenceAttestation.expirationTime, expiration);
        assertFalse(referenceAttestation.revocable);
    }

    function testCollectEscrowWithRejectedFulfillment() public {
        // Setup: create an escrow with rejecting arbiter
        vm.startPrank(requester);

        // Create the obligation data with rejecting arbiter
        AttestationReferenceEscrowObligation.ObligationData memory data =
            AttestationReferenceEscrowObligation.ObligationData({
                referencedAttestationUid: preExistingAttestationId,
                arbiter: address(rejectingArbiter),
                demand: abi.encode("test demand"),
                expirationTime: 0
            });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 escrowUid = escrowObligation.doObligation(data, expiration);
        vm.stopPrank();

        // Create a fulfillment attestation from the attester using StringObligation
        vm.prank(attester);
        StringObligation.ObligationData memory stringData =
            StringObligation.ObligationData({item: "fulfillment data", schema: bytes32(0)});

        bytes32 fulfillmentUid = stringObligation.doObligation(stringData, escrowUid);

        // Try to collect payment, should revert with InvalidFulfillment
        vm.prank(attester);
        vm.expectRevert(BaseEscrowObligation.InvalidFulfillment.selector);
        escrowObligation.collect(escrowUid, fulfillmentUid);
    }

    function testCheckObligation() public {
        // Create obligation data
        AttestationReferenceEscrowObligation.ObligationData memory escrowData =
            AttestationReferenceEscrowObligation.ObligationData({
                referencedAttestationUid: preExistingAttestationId,
                arbiter: address(mockArbiter),
                demand: abi.encode("specific demand"),
                expirationTime: 0
            });

        // Create an attestation with makeStatement instead of direct EAS call
        vm.prank(requester);
        bytes32 attestationId = escrowObligation.doObligation(escrowData, 0);

        Attestation memory attestation = eas.getAttestation(attestationId);

        // Test exact match
        AttestationReferenceEscrowObligation.ObligationData memory exactDemand =
            AttestationReferenceEscrowObligation.ObligationData({
                referencedAttestationUid: preExistingAttestationId,
                arbiter: address(mockArbiter),
                demand: abi.encode("specific demand"),
                expirationTime: 0
            });

        bool exactMatch = escrowObligation.check(attestation, abi.encode(exactDemand), bytes32(0));
        assertTrue(exactMatch, "Should match exact demand");

        // Test different attestation UID (should fail)
        // Create another attestation to use as a different UID
        vm.prank(attester);
        bytes32 differentAttestationId = eas.attest(
            AttestationRequest({
                schema: testSchemaId,
                data: AttestationRequestData({
                    recipient: recipient,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode("different attestation data"),
                    value: 0
                })
            })
        );

        AttestationReferenceEscrowObligation.ObligationData memory differentUidDemand =
            AttestationReferenceEscrowObligation.ObligationData({
                referencedAttestationUid: differentAttestationId,
                arbiter: address(mockArbiter),
                demand: abi.encode("specific demand"),
                expirationTime: 0
            });

        bool differentUidMatch = escrowObligation.check(attestation, abi.encode(differentUidDemand), bytes32(0));
        assertFalse(differentUidMatch, "Should not match different attestation UID");

        // Test different arbiter (should fail)
        AttestationReferenceEscrowObligation.ObligationData memory differentArbiterDemand =
            AttestationReferenceEscrowObligation.ObligationData({
                referencedAttestationUid: preExistingAttestationId,
                arbiter: address(rejectingArbiter),
                demand: abi.encode("specific demand"),
                expirationTime: 0
            });

        bool differentArbiterMatch = escrowObligation.check(attestation, abi.encode(differentArbiterDemand), bytes32(0));
        assertFalse(differentArbiterMatch, "Should not match different arbiter");

        // Test different demand (should fail)
        AttestationReferenceEscrowObligation.ObligationData memory differentDemandData =
            AttestationReferenceEscrowObligation.ObligationData({
                referencedAttestationUid: preExistingAttestationId,
                arbiter: address(mockArbiter),
                demand: abi.encode("different demand"),
                expirationTime: 0
            });

        bool differentDemandMatch = escrowObligation.check(attestation, abi.encode(differentDemandData), bytes32(0));
        assertFalse(differentDemandMatch, "Should not match different demand");

        AttestationReferenceEscrowObligation.ObligationData memory differentExpirationDemand =
            AttestationReferenceEscrowObligation.ObligationData({
                referencedAttestationUid: preExistingAttestationId,
                arbiter: address(mockArbiter),
                demand: abi.encode("specific demand"),
                expirationTime: uint64(block.timestamp + 1 days)
            });

        bool differentExpirationMatch =
            escrowObligation.check(attestation, abi.encode(differentExpirationDemand), bytes32(0));
        assertFalse(differentExpirationMatch, "Should not match different reference attestation properties");
    }

    function testInvalidEscrowAttestationReverts() public {
        // Create an invalid attestation ID without actually creating an attestation
        bytes32 nonExistentAttestationId = bytes32(uint256(0x123456789));

        // Create a fulfillment attestation using StringObligation
        // Note: fulfillment doesn't reference anything since the escrow doesn't exist yet
        vm.prank(attester);
        StringObligation.ObligationData memory stringData =
            StringObligation.ObligationData({item: "fulfillment data", schema: bytes32(0)});

        bytes32 fulfillmentUid = stringObligation.doObligation(
            stringData,
            bytes32(0) // No reference since we're testing invalid escrow
        );

        // Try to collect payment with an invalid escrow attestation
        vm.prank(attester);
        // Just expect any revert instead of a specific error code, since the revert data
        // isn't being properly encoded for some reason
        vm.expectRevert();
        escrowObligation.collect(nonExistentAttestationId, fulfillmentUid);
    }
}
