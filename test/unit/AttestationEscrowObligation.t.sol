// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {AttestationEscrowObligation} from "../../src/Statements/AttestationEscrowObligation.sol";
import {IArbiter} from "../../src/IArbiter.sol";
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

contract AttestationEscrowObligationTest is Test {
    AttestationEscrowObligation public escrowObligation;
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

    uint64 constant EXPIRATION_TIME = 365 days;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        escrowObligation = new AttestationEscrowObligation(eas, schemaRegistry);
        mockArbiter = new MockArbiter(true);
        rejectingArbiter = new MockArbiter(false);

        requester = makeAddr("requester");
        attester = makeAddr("attester");
        recipient = makeAddr("recipient");

        // Register a test schema for our tests
        vm.prank(address(this));
        testSchemaId = schemaRegistry.register("string testData", ISchemaResolver(address(0)), false);
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
            "tuple(bytes32 schema, tuple(address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data) attestation, address arbiter, bytes demand",
            "Schema string should match"
        );
    }

    function testMakeStatement() public {
        vm.startPrank(requester);

        // Create the attestation request
        AttestationRequest memory attestationRequest = createTestAttestationRequest();
        
        // Create the statement data
        AttestationEscrowObligation.StatementData memory data = AttestationEscrowObligation.StatementData({
            attestation: attestationRequest,
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
    }

    function testMakeStatementFor() public {
        // Create the attestation request
        AttestationRequest memory attestationRequest = createTestAttestationRequest();
        
        // Create the statement data
        AttestationEscrowObligation.StatementData memory data = AttestationEscrowObligation.StatementData({
            attestation: attestationRequest,
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
    }

    function testCollectPayment() public {
        // Setup: create an escrow
        vm.startPrank(requester);

        // Create the attestation request
        AttestationRequest memory attestationRequest = createTestAttestationRequest();
        
        // Create the statement data
        AttestationEscrowObligation.StatementData memory data = AttestationEscrowObligation.StatementData({
            attestation: attestationRequest,
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
        bytes32 attestationUid = escrowObligation.collectPayment(escrowUid, fulfillmentUid);
        
        assertNotEq(attestationUid, bytes32(0), "Attestation UID should not be empty");
        
        // Verify that the escrowed attestation was created
        Attestation memory resultAttestation = eas.getAttestation(attestationUid);
        assertEq(
            resultAttestation.schema,
            testSchemaId,
            "Resulting attestation should have the requested schema"
        );
        assertEq(
            resultAttestation.recipient, 
            recipient, 
            "Resulting attestation should have the correct recipient"
        );
    }

    function testCollectPaymentWithRejectedFulfillment() public {
        // Setup: create an escrow with rejecting arbiter
        vm.startPrank(requester);

        // Create the attestation request
        AttestationRequest memory attestationRequest = createTestAttestationRequest();
        
        // Create the statement data with rejecting arbiter
        AttestationEscrowObligation.StatementData memory data = AttestationEscrowObligation.StatementData({
            attestation: attestationRequest,
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
        vm.expectRevert(AttestationEscrowObligation.InvalidFulfillment.selector);
        escrowObligation.collectPayment(escrowUid, fulfillmentUid);
    }

    function testCheckStatement() public {
        // Create statement data
        AttestationRequest memory attestationRequest = createTestAttestationRequest();
        
        AttestationEscrowObligation.StatementData memory escrowData = AttestationEscrowObligation.StatementData({
            attestation: attestationRequest,
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
        AttestationEscrowObligation.StatementData memory exactDemand = AttestationEscrowObligation.StatementData({
            attestation: attestationRequest,
            arbiter: address(mockArbiter),
            demand: abi.encode("specific demand")
        });

        bool exactMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(exactDemand),
            bytes32(0)
        );
        assertTrue(exactMatch, "Should match exact demand");

        // Test different attestation request (should fail)
        AttestationRequest memory differentAttestationRequest = createTestAttestationRequest();
        differentAttestationRequest.data.data = abi.encode("different data");
        
        AttestationEscrowObligation.StatementData memory differentAttestationDemand = AttestationEscrowObligation.StatementData({
            attestation: differentAttestationRequest,
            arbiter: address(mockArbiter),
            demand: abi.encode("specific demand")
        });

        bool differentAttestationMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(differentAttestationDemand),
            bytes32(0)
        );
        assertFalse(differentAttestationMatch, "Should not match different attestation request");

        // Test different arbiter (should fail)
        AttestationEscrowObligation.StatementData memory differentArbiterDemand = AttestationEscrowObligation.StatementData({
            attestation: attestationRequest,
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
        AttestationEscrowObligation.StatementData memory differentDemandData = AttestationEscrowObligation.StatementData({
            attestation: attestationRequest,
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
        vm.expectRevert(AttestationEscrowObligation.InvalidEscrowAttestation.selector);
        escrowObligation.collectPayment(randomAttestationId, fulfillmentUid);
    }

    // Helper function to create a test attestation request
    function createTestAttestationRequest() internal view returns (AttestationRequest memory) {
        AttestationRequestData memory requestData = AttestationRequestData({
            recipient: recipient,
            expirationTime: 0,
            revocable: true,
            refUID: bytes32(0),
            data: abi.encode("test attestation data"),
            value: 0
        });

        return AttestationRequest({
            schema: testSchemaId,
            data: requestData
        });
    }
}