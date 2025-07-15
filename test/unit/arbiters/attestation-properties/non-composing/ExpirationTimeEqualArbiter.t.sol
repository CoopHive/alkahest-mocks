// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {ExpirationTimeEqualArbiter} from "@src/arbiters/attestation-properties/non-composing/ExpirationTimeEqualArbiter.sol";

contract ExpirationTimeEqualArbiterTest is Test {
    ExpirationTimeEqualArbiter arbiter;
    uint64 expirationTimeValue;

    function setUp() public {
        arbiter = new ExpirationTimeEqualArbiter();

        vm.warp(1000);
        expirationTimeValue = uint64(block.timestamp + 100); // 100 seconds in the future
    }

    function testCheckObligationWithExpirationTimeEqual() public view {
        // Create a test attestation with expiration time equal to the required time
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: expirationTimeValue,
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with matching expiration time
        ExpirationTimeEqualArbiter.DemandData
            memory demandData = ExpirationTimeEqualArbiter.DemandData({
                expirationTime: expirationTimeValue
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Should accept attestation with equal expiration time"
        );
    }

    function testCheckObligationWithExpirationTimeDifferent() public {
        // Create a test attestation with expiration time different from the required time
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: expirationTimeValue + 100, // Different time
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with specific expiration time
        ExpirationTimeEqualArbiter.DemandData
            memory demandData = ExpirationTimeEqualArbiter.DemandData({
                expirationTime: expirationTimeValue
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with ExpirationTimeNotEqual
        vm.expectRevert(
            ExpirationTimeEqualArbiter.ExpirationTimeNotEqual.selector
        );
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testDecodeDemandData() public {
        ExpirationTimeEqualArbiter.DemandData
            memory expectedDemandData = ExpirationTimeEqualArbiter.DemandData({
                expirationTime: expirationTimeValue
            });

        bytes memory encodedData = abi.encode(expectedDemandData);

        ExpirationTimeEqualArbiter.DemandData memory decodedData = arbiter
            .decodeDemandData(encodedData);

        assertEq(
            decodedData.expirationTime,
            expectedDemandData.expirationTime,
            "Expiration time should match"
        );
    }
}
