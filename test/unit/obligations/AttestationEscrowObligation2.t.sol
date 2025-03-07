// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {AttestationEscrowObligation2} from "@src/obligations/AttestationEscrowObligation2.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {IEAS, Attestation, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {ISchemaResolver} from "@eas/resolver/ISchemaResolver.sol";

// Mock Arbiter for testing
contract MockArbiter is IArbiter {
    bool private shouldAccept;
    
    constructor(bool _shouldAccept) {
        shouldAccept = _shouldAccept;
    }
    
    function setShouldAccept(bool _shouldAccept) public {
        shouldAccept = _shouldAccept;
    }
    
    function checkStatement(
        Attestation memory, 
        bytes memory, 
        bytes32
    ) public view override returns (bool) {
        return shouldAccept;
    }
}

contract AttestationEscrowObligation2Test is Test {
    AttestationEscrowObligation2 public escrowObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    MockArbiter public mockArbiter;
    MockArbiter public rejectingArbiter;

    address public constant EAS_ADDRESS = 0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS = 0xA7b39296258348C78294F95B872b282326A97BDF;

    address internal requester;
    address internal attester;
    address internal recipient;
    
    // Test schema ID (will be registered during setup)
    bytes32 private testSchemaId;
    // Pre-made attestation ID
    bytes32 private preExistingAttestationId;

    uint64 constant EXPIRATION_TIME = 365 days;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        escrowObligation = new AttestationEscrowObligation2(eas, schemaRegistry);
        mockArbiter = new MockArbiter(true);
        rejectingArbiter = new MockArbiter(false);

        requester = makeAddr("requester");
        attester = makeAddr("attester");
        recipient = makeAddr("recipient");

        // Register a test schema for our tests
        vm.prank(address(this));
        testSchemaId = schemaRegistry.register("string testData", ISchemaResolver(address(0)), false);
        
        // Create a pre-existing attestation
        vm.prank(attester);
        preExistingAttestationId = eas.attest(
            AttestationRequest({
                schema: testSchemaId,
                data: AttestationRequestData({
                    recipient: recipient,
                    expirationTime: 0,
                    revocable: true,
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
            "bytes32 attestationUid, address arbiter, bytes demand",
            "Schema string should match"
        );
        
        // Verify validation schema
        bytes32 validationSchemaId = escrowObligation.VALIDATION_SCHEMA();
        assertNotEq(validationSchemaId, bytes32(0), "Validation schema should be registered");
        
        SchemaRecord memory validationSchema = schemaRegistry.getSchema(validationSchemaId);
        assertEq(validationSchema.uid, validationSchemaId, "Validation schema UID should match");
        assertEq(
            validationSchema.schema,
            "bytes32 validatedAttestationUid",
            "Validation schema string should match"
        );
    }

    function testMakeStatement() public {
        vm.startPrank(requester);
        
        // Create the statement data
        AttestationEscrowObligation2.StatementData memory data = AttestationEscrowObligation2.StatementData({
            attestationUid: preExistingAttestationId,
            arbiter: address(mockArbiter),
            demand: abi.encode("test demand")
        });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 uid = escrowObligation.makeStatement(data, expiration);
        vm.stopPrank();

        // Verify attestation exists
        assertNotEq(uid, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = escrowObligation.getStatement(uid);
        assertEq(
            attestation.schema,
            escrowObligation.ATTESTATION_SCHEMA(),
            "Schema should match"
        );
        assertEq(attestation.recipient, requester, "Recipient should be the requester");
        
        // Verify attestation data
        AttestationEscrowObligation2.StatementData memory storedData = abi.decode(
            attestation.data,
            (AttestationEscrowObligation2.StatementData)
        );
        assertEq(storedData.attestationUid, preExistingAttestationId, "Attestation UID should match");
        assertEq(storedData.arbiter, address(mockArbiter), "Arbiter should match");
    }

    function testMakeStatementFor() public {
        // Create the statement data
        AttestationEscrowObligation2.StatementData memory data = AttestationEscrowObligation2.StatementData({
            attestationUid: preExistingAttestationId,
            arbiter: address(mockArbiter),
            demand: abi.encode("test demand")
        });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        
        vm.prank(address(this));
        bytes32 uid = escrowObligation.makeStatementFor(data, expiration, recipient);

        // Verify attestation exists
        assertNotEq(uid, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = escrowObligation.getStatement(uid);
        assertEq(
            attestation.schema,
            escrowObligation.ATTESTATION_SCHEMA(),
            "Schema should match"
        );
        assertEq(attestation.recipient, recipient, "Recipient should be the specified recipient");
        
        // Verify attestation data
        AttestationEscrowObligation2.StatementData memory storedData = abi.decode(
            attestation.data,
            (AttestationEscrowObligation2.StatementData)
        );
        assertEq(storedData.attestationUid, preExistingAttestationId, "Attestation UID should match");
        assertEq(storedData.arbiter, address(mockArbiter), "Arbiter should match");
    }

    function testCollectPayment() public {
        // Setup: create an escrow
        vm.startPrank(requester);
        
        // Create the statement data
        AttestationEscrowObligation2.StatementData memory data = AttestationEscrowObligation2.StatementData({
            attestationUid: preExistingAttestationId,
            arbiter: address(mockArbiter),
            demand: abi.encode("test demand")
        });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 escrowUid = escrowObligation.makeStatement(data, expiration);
        vm.stopPrank();

        // Create a fulfillment attestation from the attester
        vm.prank(attester);
        bytes32 fulfillmentUid = eas.attest(
            AttestationRequest({
                schema: escrowObligation.ATTESTATION_SCHEMA(),
                data: AttestationRequestData({
                    recipient: attester,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode("fulfillment data"),
                    value: 0
                })
            })
        );

        // Collect payment
        vm.prank(attester);
        bytes32 validationUid = escrowObligation.collectPayment(escrowUid, fulfillmentUid);
        
        assertNotEq(validationUid, bytes32(0), "Validation UID should not be empty");
        
        // Verify that the validation attestation was created
        Attestation memory validationAttestation = eas.getAttestation(validationUid);
        assertEq(
            validationAttestation.schema,
            escrowObligation.VALIDATION_SCHEMA(),
            "Validation attestation should have the validation schema"
        );
        assertEq(
            validationAttestation.recipient, 
            attester, 
            "Validation attestation should have the attester as recipient"
        );
        assertEq(
            validationAttestation.refUID,
            preExistingAttestationId,
            "Validation attestation should reference the original attestation"
        );
        
        // Verify that the escrowed attestation was revoked
        Attestation memory revokedEscrow = eas.getAttestation(escrowUid);
        assertTrue(revokedEscrow.revocationTime > 0, "Escrow attestation should be revoked");
    }

    function testCollectPaymentWithRejectedFulfillment() public {
        // Setup: create an escrow with rejecting arbiter
        vm.startPrank(requester);
        
        // Create the statement data with rejecting arbiter
        AttestationEscrowObligation2.StatementData memory data = AttestationEscrowObligation2.StatementData({
            attestationUid: preExistingAttestationId,
            arbiter: address(rejectingArbiter),
            demand: abi.encode("test demand")
        });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 escrowUid = escrowObligation.makeStatement(data, expiration);
        vm.stopPrank();

        // Create a fulfillment attestation from the attester
        vm.prank(attester);
        bytes32 fulfillmentUid = eas.attest(
            AttestationRequest({
                schema: escrowObligation.ATTESTATION_SCHEMA(),
                data: AttestationRequestData({
                    recipient: attester,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode("fulfillment data"),
                    value: 0
                })
            })
        );

        // Try to collect payment, should revert with InvalidFulfillment
        vm.prank(attester);
        vm.expectRevert(AttestationEscrowObligation2.InvalidFulfillment.selector);
        escrowObligation.collectPayment(escrowUid, fulfillmentUid);
    }

    function testCheckStatement() public {
        // Create statement data
        AttestationEscrowObligation2.StatementData memory escrowData = AttestationEscrowObligation2.StatementData({
            attestationUid: preExistingAttestationId,
            arbiter: address(mockArbiter),
            demand: abi.encode("specific demand")
        });

        // Create an attestation
        vm.prank(requester);
        bytes32 attestationId = eas.attest(
            AttestationRequest({
                schema: escrowObligation.ATTESTATION_SCHEMA(),
                data: AttestationRequestData({
                    recipient: requester,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode(escrowData),
                    value: 0
                })
            })
        );

        Attestation memory attestation = eas.getAttestation(attestationId);

        // Test exact match
        AttestationEscrowObligation2.StatementData memory exactDemand = AttestationEscrowObligation2.StatementData({
            attestationUid: preExistingAttestationId,
            arbiter: address(mockArbiter),
            demand: abi.encode("specific demand")
        });

        bool exactMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(exactDemand),
            bytes32(0)
        );
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
        
        AttestationEscrowObligation2.StatementData memory differentUidDemand = AttestationEscrowObligation2.StatementData({
            attestationUid: differentAttestationId,
            arbiter: address(mockArbiter),
            demand: abi.encode("specific demand")
        });

        bool differentUidMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(differentUidDemand),
            bytes32(0)
        );
        assertFalse(differentUidMatch, "Should not match different attestation UID");

        // Test different arbiter (should fail)
        AttestationEscrowObligation2.StatementData memory differentArbiterDemand = AttestationEscrowObligation2.StatementData({
            attestationUid: preExistingAttestationId,
            arbiter: address(rejectingArbiter),
            demand: abi.encode("specific demand")
        });

        bool differentArbiterMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(differentArbiterDemand),
            bytes32(0)
        );
        assertFalse(differentArbiterMatch, "Should not match different arbiter");

        // Test different demand (should fail)
        AttestationEscrowObligation2.StatementData memory differentDemandData = AttestationEscrowObligation2.StatementData({
            attestationUid: preExistingAttestationId,
            arbiter: address(mockArbiter),
            demand: abi.encode("different demand")
        });

        bool differentDemandMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(differentDemandData),
            bytes32(0)
        );
        assertFalse(differentDemandMatch, "Should not match different demand");
    }

    function testInvalidEscrowAttestationReverts() public {
        // Create a random attestation with a different schema
        vm.prank(requester);
        bytes32 randomAttestationId = eas.attest(
            AttestationRequest({
                schema: bytes32(uint256(1)), // Different schema
                data: AttestationRequestData({
                    recipient: requester,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode("random data"),
                    value: 0
                })
            })
        );

        // Create a fulfillment attestation
        vm.prank(attester);
        bytes32 fulfillmentUid = eas.attest(
            AttestationRequest({
                schema: escrowObligation.ATTESTATION_SCHEMA(),
                data: AttestationRequestData({
                    recipient: attester,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode("fulfillment data"),
                    value: 0
                })
            })
        );

        // Try to collect payment with an invalid escrow attestation
        vm.prank(attester);
        vm.expectRevert(AttestationEscrowObligation2.InvalidEscrowAttestation.selector);
        escrowObligation.collectPayment(randomAttestationId, fulfillmentUid);
    }
}