// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {IEAS, Attestation} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract StringObligationTest is Test {
    StringObligation public stringObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    address internal testUser;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        testUser = makeAddr("testUser");
        stringObligation = new StringObligation(eas, schemaRegistry);
    }

    function testConstructor() public view {
        // Check schema registration
        bytes32 schemaId = stringObligation.ATTESTATION_SCHEMA();
        assertNotEq(schemaId, bytes32(0), "Schema should be registered");

        // Verify schema details
        SchemaRecord memory schema = stringObligation.getSchema();
        assertEq(schema.uid, schemaId, "Schema UID should match");
        assertEq(schema.schema, "string item", "Schema string should match");
    }

    function testDoObligation() public {
        // Setup test data
        StringObligation.ObligationData memory data = StringObligation
            .ObligationData({item: "Test String Data"});

        // Make an obligation
        vm.prank(testUser);
        bytes32 attestationId = stringObligation.doObligation(data, "");
        // Verify attestation exists
        assertNotEq(attestationId, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = eas.getAttestation(attestationId);
        assertEq(
            attestation.schema,
            stringObligation.ATTESTATION_SCHEMA(),
            "Schema should match"
        );
        assertEq(
            attestation.recipient,
            testUser,
            "Recipient should be the test user"
        );

        // Decode and verify data
        StringObligation.ObligationData memory decodedData = abi.decode(
            attestation.data,
            (StringObligation.ObligationData)
        );
        assertEq(
            decodedData.item,
            "Test String Data",
            "Statement data should match"
        );
    }
}
