// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {TimeEqualArbiter} from "@src/arbiters/attestation-properties/non-composing/TimeEqualArbiter.sol";

contract TimeEqualArbiterTest is Test {
    TimeEqualArbiter arbiter;
    uint64 timestampValue;

    function setUp() public {
        arbiter = new TimeEqualArbiter();

        vm.warp(1000);
        timestampValue = uint64(block.timestamp);
    }

    function testCheckObligationWithTimeEqual() public view {
        // Create a test attestation with time equal to the required time
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: timestampValue,
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with matching time
        TimeEqualArbiter.DemandData memory demandData = TimeEqualArbiter
            .DemandData({time: timestampValue});
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(result, "Should accept attestation with equal time");
    }

    function testCheckObligationWithTimeDifferentThanRequired() public {
        // Create a test attestation with time not equal to the required time
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: timestampValue + 100, // Different from demanded time
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with a specific time
        TimeEqualArbiter.DemandData memory demandData = TimeEqualArbiter
            .DemandData({time: timestampValue});
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with TimeNotEqual
        vm.expectRevert(TimeEqualArbiter.TimeNotEqual.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testDecodeDemandData() public {
        TimeEqualArbiter.DemandData memory expectedDemandData = TimeEqualArbiter
            .DemandData({time: timestampValue});

        bytes memory encodedData = abi.encode(expectedDemandData);

        TimeEqualArbiter.DemandData memory decodedData = arbiter
            .decodeDemandData(encodedData);

        assertEq(
            decodedData.time,
            expectedDemandData.time,
            "Time should match"
        );
    }
}
