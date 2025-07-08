// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {BaseObligation} from "@src/BaseObligation.sol";
import {SchemaResolver} from "@eas/resolver/SchemaResolver.sol";
import {IEAS, Attestation} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

// Mock implementation of BaseObligation for testing
contract MockBaseObligation is BaseObligation {
    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    ) BaseObligation(_eas, _schemaRegistry, "mock schema", true) {}

    // Public wrapper for onAttest for testing
    function testOnAttest(
        Attestation calldata attestation,
        uint256 value
    ) public view returns (bool) {
        return onAttest(attestation, value);
    }

    // Public wrapper for onRevoke for testing
    function testOnRevoke(
        Attestation calldata attestation,
        uint256 value
    ) public view returns (bool) {
        return onRevoke(attestation, value);
    }
}

contract BaseObligationTest is Test {
    MockBaseObligation public baseObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        baseObligation = new MockBaseObligation(eas, schemaRegistry);
    }

    function testConstructor() public view {
        // Verify the schema was registered
        bytes32 schemaId = baseObligation.ATTESTATION_SCHEMA();
        assertNotEq(schemaId, bytes32(0), "Schema should be registered");

        // Verify schema details
        SchemaRecord memory schema = baseObligation.getSchema();
        assertEq(schema.uid, schemaId, "Schema UID should match");
        assertEq(schema.schema, "mock schema", "Schema string should match");
        assertTrue(schema.revocable, "Schema should be revocable");
    }

    function testOnAttest() public {
        address testAddress = makeAddr("testAddress");

        // Create a test attestation from the statement contract
        Attestation memory validAttestation = Attestation({
            uid: bytes32(0),
            schema: baseObligation.ATTESTATION_SCHEMA(),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(baseObligation),
            revocable: true,
            data: bytes("")
        });

        // Create an invalid attestation (not from statement contract)
        Attestation memory invalidAttestation = Attestation({
            uid: bytes32(0),
            schema: baseObligation.ATTESTATION_SCHEMA(),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: testAddress, // Different attester
            revocable: true,
            data: bytes("")
        });

        assertTrue(
            baseObligation.testOnAttest(validAttestation, 0),
            "onAttest should return true for valid attestation"
        );
        assertFalse(
            baseObligation.testOnAttest(invalidAttestation, 0),
            "onAttest should return false for invalid attestation"
        );
    }

    function testOnRevoke() public {
        address testAddress = makeAddr("testAddress");

        // Create a test attestation from the statement contract
        Attestation memory validAttestation = Attestation({
            uid: bytes32(0),
            schema: baseObligation.ATTESTATION_SCHEMA(),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(baseObligation),
            revocable: true,
            data: bytes("")
        });

        // Create an invalid attestation (not from statement contract)
        Attestation memory invalidAttestation = Attestation({
            uid: bytes32(0),
            schema: baseObligation.ATTESTATION_SCHEMA(),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: testAddress, // Different attester
            revocable: true,
            data: bytes("")
        });

        assertTrue(
            baseObligation.testOnRevoke(validAttestation, 0),
            "onRevoke should return true for valid attestation"
        );
        assertFalse(
            baseObligation.testOnRevoke(invalidAttestation, 0),
            "onRevoke should return false for invalid attestation"
        );
    }

    function testGetStatement() public {
        bytes32 validSchema = baseObligation.ATTESTATION_SCHEMA();
        bytes32 invalidSchema = bytes32(uint256(1));

        // Mock getAttestation to return a valid attestation
        vm.mockCall(
            address(eas),
            abi.encodeWithSelector(IEAS.getAttestation.selector, validSchema),
            abi.encode(
                Attestation({
                    uid: validSchema,
                    schema: validSchema,
                    time: uint64(block.timestamp),
                    expirationTime: uint64(0),
                    revocationTime: uint64(0),
                    refUID: bytes32(0),
                    recipient: address(0),
                    attester: address(baseObligation),
                    revocable: true,
                    data: bytes("")
                })
            )
        );

        // Mock getAttestation to return an invalid attestation
        vm.mockCall(
            address(eas),
            abi.encodeWithSelector(IEAS.getAttestation.selector, invalidSchema),
            abi.encode(
                Attestation({
                    uid: invalidSchema,
                    schema: bytes32(uint256(2)), // Different schema
                    time: uint64(block.timestamp),
                    expirationTime: uint64(0),
                    revocationTime: uint64(0),
                    refUID: bytes32(0),
                    recipient: address(0),
                    attester: address(baseObligation),
                    revocable: true,
                    data: bytes("")
                })
            )
        );

        // Valid attestation should work
        Attestation memory attestation = baseObligation.getStatement(
            validSchema
        );
        assertEq(attestation.uid, validSchema, "UID should match");

        // Invalid attestation should revert
        vm.expectRevert(BaseObligation.NotFromObligation.selector);
        baseObligation.getStatement(invalidSchema);
    }
}
