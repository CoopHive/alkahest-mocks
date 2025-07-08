// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {UidArbiter} from "@src/arbiters/attestation-properties/composing/UidArbiter.sol";

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

contract UidArbiterTest is Test {
    UidArbiter arbiter;
    MockArbiter mockArbiterTrue;
    MockArbiter mockArbiterFalse;
    bytes32 uid = bytes32(uint256(123));

    function setUp() public {
        arbiter = new UidArbiter();
        mockArbiterTrue = new MockArbiter(true);
        mockArbiterFalse = new MockArbiter(false);
    }

    function testCheckObligationWithCorrectUid() public view {
        // Create a test attestation with the correct UID
        Attestation memory attestation = Attestation({
            uid: uid,
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

        // Create demand data with the correct UID and a base arbiter that returns true
        UidArbiter.DemandData memory demandData = UidArbiter.DemandData({
            baseArbiter: address(mockArbiterTrue),
            baseDemand: bytes(""),
            uid: uid
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Should accept attestation with correct UID and base arbiter returning true"
        );
    }

    function testCheckObligationWithCorrectUidButBaseArbiterReturnsFalse()
        public
        view
    {
        // Create a test attestation with the correct UID
        Attestation memory attestation = Attestation({
            uid: uid,
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

        // Create demand data with the correct UID but a base arbiter that returns false
        UidArbiter.DemandData memory demandData = UidArbiter.DemandData({
            uid: uid,
            baseArbiter: address(mockArbiterFalse),
            baseDemand: bytes("")
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return false
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertFalse(result, "Should reject when base arbiter returns false");
    }

    function testCheckObligationWithIncorrectUid() public {
        // Create a test attestation with an incorrect UID
        Attestation memory attestation = Attestation({
            uid: bytes32(uint256(456)), // Different from demanded UID
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

        // Create demand data with the correct UID
        UidArbiter.DemandData memory demandData = UidArbiter.DemandData({
            uid: uid,
            baseArbiter: address(mockArbiterTrue),
            baseDemand: bytes("")
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with UidMismatched
        vm.expectRevert(UidArbiter.UidMismatched.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testDecodeDemandData() public {
        UidArbiter.DemandData memory expectedDemandData = UidArbiter.DemandData({
            uid: uid,
            baseArbiter: address(mockArbiterTrue),
            baseDemand: bytes("test")
        });
        
        bytes memory encodedData = abi.encode(expectedDemandData);
        
        UidArbiter.DemandData memory decodedData = arbiter.decodeDemandData(encodedData);
        
        assertEq(decodedData.uid, expectedDemandData.uid, "UID should match");
        assertEq(decodedData.baseArbiter, expectedDemandData.baseArbiter, "Base arbiter should match");
        assertEq(keccak256(decodedData.baseDemand), keccak256(expectedDemandData.baseDemand), "Base demand should match");
    }
}