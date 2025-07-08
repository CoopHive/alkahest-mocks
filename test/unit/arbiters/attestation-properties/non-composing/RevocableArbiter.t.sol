// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {RevocableArbiter} from "@src/arbiters/attestation-properties/non-composing/RevocableArbiter.sol";

contract RevocableArbiterTest is Test {
    RevocableArbiter arbiter;

    function setUp() public {
        arbiter = new RevocableArbiter();
    }

    function testCheckObligationWithMatchingRevocable() public view {
        // Create a test attestation that is revocable
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data requiring revocable attestation
        RevocableArbiter.DemandData memory demandData = RevocableArbiter.DemandData({
            revocable: true
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(result, "Should accept attestation with matching revocable status");
    }

    function testCheckObligationWithMatchingNonRevocable() public view {
        // Create a test attestation that is not revocable
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: false,
            data: bytes("")
        });

        // Create demand data requiring non-revocable attestation
        RevocableArbiter.DemandData memory demandData = RevocableArbiter.DemandData({
            revocable: false
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(result, "Should accept attestation with matching non-revocable status");
    }

    function testCheckObligationWithMismatchedRevocability() public {
        // Create a test attestation that is revocable
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data requiring non-revocable attestation
        RevocableArbiter.DemandData memory demandData = RevocableArbiter.DemandData({
            revocable: false
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with RevocabilityMismatched
        vm.expectRevert(RevocableArbiter.RevocabilityMismatched.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testDecodeDemandData() public {
        RevocableArbiter.DemandData memory expectedDemandData = RevocableArbiter.DemandData({
            revocable: true
        });
        
        bytes memory encodedData = abi.encode(expectedDemandData);
        
        RevocableArbiter.DemandData memory decodedData = arbiter.decodeDemandData(encodedData);
        
        assertEq(decodedData.revocable, expectedDemandData.revocable, "Revocable status should match");
    }
}