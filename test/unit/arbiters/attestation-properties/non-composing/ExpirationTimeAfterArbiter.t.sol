// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {ExpirationTimeAfterArbiter} from "@src/arbiters/attestation-properties/non-composing/ExpirationTimeAfterArbiter.sol";

contract ExpirationTimeAfterArbiterTest is Test {
    ExpirationTimeAfterArbiter arbiter;
    uint64 expirationTimeThreshold;

    function setUp() public {
        arbiter = new ExpirationTimeAfterArbiter();

        vm.warp(1000);
        expirationTimeThreshold = uint64(block.timestamp - 100); // 100 seconds in the past
    }

    function testCheckObligationWithExpirationTimeAfterThreshold() public view {
        // Create a test attestation with expiration time after the threshold
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(block.timestamp),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with expiration time threshold
        ExpirationTimeAfterArbiter.DemandData
            memory demandData = ExpirationTimeAfterArbiter.DemandData({
                expirationTime: expirationTimeThreshold
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Should accept attestation with expiration time after threshold"
        );
    }

    function testCheckObligationWithExpirationTimeBeforeThreshold() public {
        // Create a test attestation with expiration time before the threshold
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(block.timestamp - 200), // Before the threshold
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with expiration time threshold
        ExpirationTimeAfterArbiter.DemandData
            memory demandData = ExpirationTimeAfterArbiter.DemandData({
                expirationTime: expirationTimeThreshold
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with ExpirationTimeNotAfter
        vm.expectRevert(
            ExpirationTimeAfterArbiter.ExpirationTimeNotAfter.selector
        );
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testDecodeDemandData() public {
        ExpirationTimeAfterArbiter.DemandData
            memory expectedDemandData = ExpirationTimeAfterArbiter.DemandData({
                expirationTime: expirationTimeThreshold
            });

        bytes memory encodedData = abi.encode(expectedDemandData);

        ExpirationTimeAfterArbiter.DemandData memory decodedData = arbiter
            .decodeDemandData(encodedData);

        assertEq(
            decodedData.expirationTime,
            expectedDemandData.expirationTime,
            "Expiration time should match"
        );
    }
}
