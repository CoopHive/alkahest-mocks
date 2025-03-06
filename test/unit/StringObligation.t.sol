// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {StringObligation} from "../../src/Statements/StringObligation.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";

contract StringObligationTest is Test {
    StringObligation public stringObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    address public constant EAS_ADDRESS = 0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS = 0xA7b39296258348C78294F95B872b282326A97BDF;

    address internal testUser;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));
        
        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
        
        testUser = makeAddr("testUser");
        stringObligation = new StringObligation(eas, schemaRegistry);
    }

    function testConstructor() public {
        // Verify contract was initialized correctly
        assertEq(address(stringObligation.eas()), EAS_ADDRESS, "EAS address should match");
        
        // Check schema registration
        bytes32 schemaId = stringObligation.ATTESTATION_SCHEMA();
        assertNotEq(schemaId, bytes32(0), "Schema should be registered");
        
        // Verify schema details
        ISchemaRegistry.SchemaRecord memory schema = stringObligation.getSchema();
        assertEq(schema.uid, schemaId, "Schema UID should match");
        assertEq(schema.schema, "string item", "Schema string should match");
    }
    
    function testMakeStatement() public {
        // Setup test data
        StringObligation.StatementData memory data = StringObligation.StatementData({
            item: "Test String Data"
        });
        
        // Make a statement
        vm.prank(testUser);
        bytes32 attestationId = stringObligation.makeStatement(data, bytes32(0));
        
        // Verify attestation exists
        assertNotEq(attestationId, bytes32(0), "Attestation should be created");
        
        // Verify attestation details
        IEAS.Attestation memory attestation = stringObligation.getStatement(attestationId);
        assertEq(attestation.schema, stringObligation.ATTESTATION_SCHEMA(), "Schema should match");
        assertEq(attestation.recipient, testUser, "Recipient should be the test user");
        
        // Decode and verify data
        StringObligation.StatementData memory decodedData = abi.decode(
            attestation.data,
            (StringObligation.StatementData)
        );
        assertEq(decodedData.item, "Test String Data", "Statement data should match");
    }
    
    function testGetStatementFailsForInvalidUID() public {
        bytes32 invalidUID = bytes32(uint256(1));
        
        vm.expectRevert();
        stringObligation.getStatement(invalidUID);
    }
}