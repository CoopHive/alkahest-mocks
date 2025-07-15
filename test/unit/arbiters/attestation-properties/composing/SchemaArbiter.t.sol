// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {SchemaArbiter} from "@src/arbiters/attestation-properties/composing/SchemaArbiter.sol";

contract MockArbiter is IArbiter {
    bool public returnValue;

    constructor(bool _returnValue) {
        returnValue = _returnValue;
    }

    function checkObligation(
        Attestation memory /*statement*/,
        bytes memory /*demand*/,
        bytes32 /*counteroffer*/
    ) public view override returns (bool) {
        return returnValue;
    }
}

contract SchemaArbiterTest is Test {
    SchemaArbiter arbiter;
    MockArbiter mockArbiterTrue;
    MockArbiter mockArbiterFalse;
    bytes32 schemaId = bytes32(uint256(123));

    function setUp() public {
        arbiter = new SchemaArbiter();
        mockArbiterTrue = new MockArbiter(true);
        mockArbiterFalse = new MockArbiter(false);
    }

    function testCheckObligationWithCorrectSchema() public view {
        // Create a test attestation with the correct schema
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: schemaId,
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with the correct schema and a base arbiter that returns true
        SchemaArbiter.DemandData memory demandData = SchemaArbiter.DemandData({
            baseArbiter: address(mockArbiterTrue),
            baseDemand: bytes(""),
            schema: schemaId
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Should accept attestation with correct schema and base arbiter returning true"
        );
    }

    function testCheckObligationWithCorrectSchemaButBaseArbiterReturnsFalse()
        public
        view
    {
        // Create a test attestation with the correct schema
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: schemaId,
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with the correct schema but a base arbiter that returns false
        SchemaArbiter.DemandData memory demandData = SchemaArbiter.DemandData({
            schema: schemaId,
            baseArbiter: address(mockArbiterFalse),
            baseDemand: bytes("")
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return false
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertFalse(result, "Should reject when base arbiter returns false");
    }

    function testCheckObligationWithIncorrectSchema() public {
        // Create a test attestation with an incorrect schema
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(uint256(456)), // Different from demanded schema
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with the correct schema
        SchemaArbiter.DemandData memory demandData = SchemaArbiter.DemandData({
            schema: schemaId,
            baseArbiter: address(mockArbiterTrue),
            baseDemand: bytes("")
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with SchemaMismatched
        vm.expectRevert(SchemaArbiter.SchemaMismatched.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testDecodeDemandData() public {
        SchemaArbiter.DemandData memory expectedDemandData = SchemaArbiter.DemandData({
            schema: schemaId,
            baseArbiter: address(mockArbiterTrue),
            baseDemand: bytes("test")
        });
        
        bytes memory encodedData = abi.encode(expectedDemandData);
        
        SchemaArbiter.DemandData memory decodedData = arbiter.decodeDemandData(encodedData);
        
        assertEq(decodedData.schema, expectedDemandData.schema, "Schema should match");
        assertEq(decodedData.baseArbiter, expectedDemandData.baseArbiter, "Base arbiter should match");
        assertEq(keccak256(decodedData.baseDemand), keccak256(expectedDemandData.baseDemand), "Base demand should match");
    }
}