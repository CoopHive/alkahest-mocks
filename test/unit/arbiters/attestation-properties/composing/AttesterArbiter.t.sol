// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {AttesterArbiter} from "@src/arbiters/attestation-properties/composing/AttesterArbiter.sol";

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

contract AttesterArbiterTest is Test {
    AttesterArbiter arbiter;
    MockArbiter mockArbiterTrue;
    MockArbiter mockArbiterFalse;
    address attester = address(0x123);

    function setUp() public {
        arbiter = new AttesterArbiter();
        mockArbiterTrue = new MockArbiter(true);
        mockArbiterFalse = new MockArbiter(false);
    }

    function testCheckObligationWithCorrectAttester() public view {
        // Create a test attestation with the correct attester
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: attester,
            revocable: true,
            data: bytes("")
        });

        // Create demand data with the correct attester and a base arbiter that returns true
        AttesterArbiter.DemandData memory demandData = AttesterArbiter.DemandData({
            baseArbiter: address(mockArbiterTrue),
            baseDemand: bytes(""),
            attester: attester
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Should accept attestation with correct attester and base arbiter returning true"
        );
    }

    function testCheckObligationWithCorrectAttesterButBaseArbiterReturnsFalse()
        public
        view
    {
        // Create a test attestation with the correct attester
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: attester,
            revocable: true,
            data: bytes("")
        });

        // Create demand data with the correct attester but a base arbiter that returns false
        AttesterArbiter.DemandData memory demandData = AttesterArbiter.DemandData({
            attester: attester,
            baseArbiter: address(mockArbiterFalse),
            baseDemand: bytes("")
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return false
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertFalse(result, "Should reject when base arbiter returns false");
    }

    function testCheckObligationWithIncorrectAttester() public {
        // Create a test attestation with an incorrect attester
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0x456), // Different from demanded attester
            revocable: true,
            data: bytes("")
        });

        // Create demand data with the correct attester
        AttesterArbiter.DemandData memory demandData = AttesterArbiter.DemandData({
            attester: attester,
            baseArbiter: address(mockArbiterTrue),
            baseDemand: bytes("")
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with AttesterMismatched
        vm.expectRevert(AttesterArbiter.AttesterMismatched.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testDecodeDemandData() public {
        AttesterArbiter.DemandData memory expectedDemandData = AttesterArbiter.DemandData({
            attester: attester,
            baseArbiter: address(mockArbiterTrue),
            baseDemand: bytes("test")
        });
        
        bytes memory encodedData = abi.encode(expectedDemandData);
        
        AttesterArbiter.DemandData memory decodedData = arbiter.decodeDemandData(encodedData);
        
        assertEq(decodedData.attester, expectedDemandData.attester, "Attester should match");
        assertEq(decodedData.baseArbiter, expectedDemandData.baseArbiter, "Base arbiter should match");
        assertEq(keccak256(decodedData.baseDemand), keccak256(expectedDemandData.baseDemand), "Base demand should match");
    }
}