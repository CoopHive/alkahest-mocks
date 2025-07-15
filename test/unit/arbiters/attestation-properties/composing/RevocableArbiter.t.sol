// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {RevocableArbiter} from "@src/arbiters/attestation-properties/composing/RevocableArbiter.sol";

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

contract RevocableArbiterTest is Test {
    RevocableArbiter arbiter;
    MockArbiter mockArbiterTrue;
    MockArbiter mockArbiterFalse;

    function setUp() public {
        arbiter = new RevocableArbiter();
        mockArbiterTrue = new MockArbiter(true);
        mockArbiterFalse = new MockArbiter(false);
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
            baseArbiter: address(mockArbiterTrue),
            baseDemand: bytes(""),
            revocable: true
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Should accept attestation with matching revocable status and base arbiter returning true"
        );
    }

    function testCheckObligationWithMatchingRevocableButBaseArbiterReturnsFalse()
        public
        view
    {
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

        // Create demand data requiring revocable attestation but a base arbiter that returns false
        RevocableArbiter.DemandData memory demandData = RevocableArbiter.DemandData({
            revocable: true,
            baseArbiter: address(mockArbiterFalse),
            baseDemand: bytes("")
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return false
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertFalse(result, "Should reject when base arbiter returns false");
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
            baseArbiter: address(mockArbiterTrue),
            baseDemand: bytes(""),
            revocable: false
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Should accept attestation with matching non-revocable status"
        );
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
            revocable: false,
            baseArbiter: address(mockArbiterTrue),
            baseDemand: bytes("")
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with RevocabilityMismatched
        vm.expectRevert(RevocableArbiter.RevocabilityMismatched.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testDecodeDemandData() public {
        RevocableArbiter.DemandData memory expectedDemandData = RevocableArbiter.DemandData({
            revocable: true,
            baseArbiter: address(mockArbiterTrue),
            baseDemand: bytes("test")
        });
        
        bytes memory encodedData = abi.encode(expectedDemandData);
        
        RevocableArbiter.DemandData memory decodedData = arbiter.decodeDemandData(encodedData);
        
        assertEq(decodedData.revocable, expectedDemandData.revocable, "Revocable status should match");
        assertEq(decodedData.baseArbiter, expectedDemandData.baseArbiter, "Base arbiter should match");
        assertEq(keccak256(decodedData.baseDemand), keccak256(expectedDemandData.baseDemand), "Base demand should match");
    }
}