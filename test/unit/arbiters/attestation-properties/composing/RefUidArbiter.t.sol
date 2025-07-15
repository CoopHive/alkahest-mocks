// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {RefUidArbiter} from "@src/arbiters/attestation-properties/composing/RefUidArbiter.sol";

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

contract RefUidArbiterTest is Test {
    RefUidArbiter arbiter;
    MockArbiter mockArbiterTrue;
    MockArbiter mockArbiterFalse;
    bytes32 refUid = bytes32(uint256(123));

    function setUp() public {
        arbiter = new RefUidArbiter();
        mockArbiterTrue = new MockArbiter(true);
        mockArbiterFalse = new MockArbiter(false);
    }

    function testCheckObligationWithCorrectRefUid() public view {
        // Create a test attestation with the correct refUID
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: refUid,
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with the correct refUID and a base arbiter that returns true
        RefUidArbiter.DemandData memory demandData = RefUidArbiter.DemandData({
            baseArbiter: address(mockArbiterTrue),
            baseDemand: bytes(""),
            refUID: refUid
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Should accept attestation with correct refUID and base arbiter returning true"
        );
    }

    function testCheckObligationWithCorrectRefUidButBaseArbiterReturnsFalse()
        public
        view
    {
        // Create a test attestation with the correct refUID
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: refUid,
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with the correct refUID but a base arbiter that returns false
        RefUidArbiter.DemandData memory demandData = RefUidArbiter.DemandData({
            refUID: refUid,
            baseArbiter: address(mockArbiterFalse),
            baseDemand: bytes("")
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return false
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertFalse(result, "Should reject when base arbiter returns false");
    }

    function testCheckObligationWithIncorrectRefUid() public {
        // Create a test attestation with an incorrect refUID
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(uint256(456)), // Different from demanded refUID
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with the correct refUID
        RefUidArbiter.DemandData memory demandData = RefUidArbiter.DemandData({
            refUID: refUid,
            baseArbiter: address(mockArbiterTrue),
            baseDemand: bytes("")
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with RefUidMismatched
        vm.expectRevert(RefUidArbiter.RefUidMismatched.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testDecodeDemandData() public {
        RefUidArbiter.DemandData memory expectedDemandData = RefUidArbiter.DemandData({
            refUID: refUid,
            baseArbiter: address(mockArbiterTrue),
            baseDemand: bytes("test")
        });
        
        bytes memory encodedData = abi.encode(expectedDemandData);
        
        RefUidArbiter.DemandData memory decodedData = arbiter.decodeDemandData(encodedData);
        
        assertEq(decodedData.refUID, expectedDemandData.refUID, "RefUID should match");
        assertEq(decodedData.baseArbiter, expectedDemandData.baseArbiter, "Base arbiter should match");
        assertEq(keccak256(decodedData.baseDemand), keccak256(expectedDemandData.baseDemand), "Base demand should match");
    }
}