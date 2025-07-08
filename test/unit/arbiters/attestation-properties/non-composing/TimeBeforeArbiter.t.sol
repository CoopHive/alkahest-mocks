// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {TimeBeforeArbiter} from "@src/arbiters/attestation-properties/non-composing/TimeBeforeArbiter.sol";

contract TimeBeforeArbiterTest is Test {
    TimeBeforeArbiter arbiter;
    uint64 timestampThreshold;

    function setUp() public {
        arbiter = new TimeBeforeArbiter();

        vm.warp(1000);
        timestampThreshold = uint64(block.timestamp + 100); // 100 seconds in the future
    }

    function testCheckObligationWithTimeBeforeThreshold() public view {
        // Create a test attestation with time before the threshold
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

        // Create demand data with time threshold
        TimeBeforeArbiter.DemandData memory demandData = TimeBeforeArbiter
            .DemandData({time: timestampThreshold});
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Should accept attestation with time before threshold"
        );
    }

    function testCheckObligationWithTimeAfterThreshold() public {
        // Create a test attestation with time after the threshold
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp + 200), // After the threshold
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with time threshold
        TimeBeforeArbiter.DemandData memory demandData = TimeBeforeArbiter
            .DemandData({time: timestampThreshold});
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with TimeNotBefore
        vm.expectRevert(TimeBeforeArbiter.TimeNotBefore.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testDecodeDemandData() public {
        TimeBeforeArbiter.DemandData
            memory expectedDemandData = TimeBeforeArbiter.DemandData({
                time: timestampThreshold
            });

        bytes memory encodedData = abi.encode(expectedDemandData);

        TimeBeforeArbiter.DemandData memory decodedData = arbiter
            .decodeDemandData(encodedData);

        assertEq(
            decodedData.time,
            expectedDemandData.time,
            "Time should match"
        );
    }
}
