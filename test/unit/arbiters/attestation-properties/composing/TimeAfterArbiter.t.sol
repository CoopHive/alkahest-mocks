// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {TimeAfterArbiter} from "@src/arbiters/attestation-properties/composing/TimeAfterArbiter.sol";

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

contract TimeAfterArbiterTest is Test {
    TimeAfterArbiter arbiter;
    MockArbiter mockArbiterTrue;
    MockArbiter mockArbiterFalse;
    uint64 timestampThreshold;

    function setUp() public {
        arbiter = new TimeAfterArbiter();
        mockArbiterTrue = new MockArbiter(true);
        mockArbiterFalse = new MockArbiter(false);

        vm.warp(1000);
        timestampThreshold = uint64(block.timestamp - 100); // 100 seconds in the past
    }

    function testCheckObligationWithTimeAfterThreshold() public view {
        // Create a test attestation with time after the threshold
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

        // Create demand data with time threshold and a base arbiter that returns true
        TimeAfterArbiter.DemandData memory demandData = TimeAfterArbiter
            .DemandData({
                baseArbiter: address(mockArbiterTrue),
                baseDemand: bytes(""),
                time: timestampThreshold
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Should accept attestation with time after threshold and base arbiter returning true"
        );
    }

    function testCheckObligationWithTimeAfterThresholdButBaseArbiterReturnsFalse()
        public
        view
    {
        // Create a test attestation with time after the threshold
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

        // Create demand data with time threshold but a base arbiter that returns false
        TimeAfterArbiter.DemandData memory demandData = TimeAfterArbiter
            .DemandData({
                time: timestampThreshold,
                baseArbiter: address(mockArbiterFalse),
                baseDemand: bytes("")
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return false
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertFalse(result, "Should reject when base arbiter returns false");
    }

    function testCheckObligationWithTimeBeforeThreshold() public {
        // Create a test attestation with time before the threshold
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp - 200), // Before the threshold
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with time threshold
        TimeAfterArbiter.DemandData memory demandData = TimeAfterArbiter
            .DemandData({
                time: timestampThreshold,
                baseArbiter: address(mockArbiterTrue),
                baseDemand: bytes("")
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with TimeNotAfter
        vm.expectRevert(TimeAfterArbiter.TimeNotAfter.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testDecodeDemandData() public {
        TimeAfterArbiter.DemandData memory expectedDemandData = TimeAfterArbiter
            .DemandData({
                time: timestampThreshold,
                baseArbiter: address(mockArbiterTrue),
                baseDemand: bytes("test")
            });

        bytes memory encodedData = abi.encode(expectedDemandData);

        TimeAfterArbiter.DemandData memory decodedData = arbiter
            .decodeDemandData(encodedData);

        assertEq(
            decodedData.time,
            expectedDemandData.time,
            "Time should match"
        );
        assertEq(
            decodedData.baseArbiter,
            expectedDemandData.baseArbiter,
            "Base arbiter should match"
        );
        assertEq(
            keccak256(decodedData.baseDemand),
            keccak256(expectedDemandData.baseDemand),
            "Base demand should match"
        );
    }
}
