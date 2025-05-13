// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {NotArbiter} from "@src/arbiters/logical/NotArbiter.sol";
import {IntrinsicsArbiter} from "@src/arbiters/IntrinsicsArbiter.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {ArbiterUtils} from "@src/ArbiterUtils.sol";

// Mock arbiters for testing
contract MockSuccessArbiter is IArbiter {
    function checkStatement(
        Attestation memory,
        bytes memory,
        bytes32
    ) public pure override returns (bool) {
        return true;
    }
}

contract MockFailArbiter is IArbiter {
    function checkStatement(
        Attestation memory,
        bytes memory,
        bytes32
    ) public pure override returns (bool) {
        return false;
    }
}

contract MockRevertArbiter is IArbiter {
    function checkStatement(
        Attestation memory,
        bytes memory,
        bytes32
    ) public pure override returns (bool) {
        revert("Arbiter reverted");
    }
}

contract NotArbiterTest is Test {
    NotArbiter notArbiter;
    IntrinsicsArbiter intrinsicsArbiter;
    MockSuccessArbiter successArbiter;
    MockFailArbiter failArbiter;
    MockRevertArbiter revertArbiter;
    uint64 currentTime;

    function setUp() public {
        // Set block timestamp to a sufficiently large value to avoid underflows
        vm.warp(10_000_000);
        currentTime = uint64(block.timestamp);

        // Deploy the arbiters
        notArbiter = new NotArbiter();
        intrinsicsArbiter = new IntrinsicsArbiter();
        successArbiter = new MockSuccessArbiter();
        failArbiter = new MockFailArbiter();
        revertArbiter = new MockRevertArbiter();
    }

    function createValidAttestation()
        internal
        view
        returns (Attestation memory)
    {
        return
            Attestation({
                uid: bytes32(0),
                schema: bytes32(0),
                time: currentTime,
                expirationTime: currentTime + 1 days, // expires in the future
                revocationTime: uint64(0), // not revoked
                refUID: bytes32(0),
                recipient: address(0),
                attester: address(0),
                revocable: true,
                data: bytes("")
            });
    }

    function createExpiredAttestation()
        internal
        view
        returns (Attestation memory)
    {
        return
            Attestation({
                uid: bytes32(0),
                schema: bytes32(0),
                time: currentTime - 2 days,
                expirationTime: currentTime - 1 days, // expired in the past
                revocationTime: uint64(0), // not revoked
                refUID: bytes32(0),
                recipient: address(0),
                attester: address(0),
                revocable: true,
                data: bytes("")
            });
    }

    function createDemandData(
        address arbiter,
        bytes memory baseDemand
    ) internal pure returns (bytes memory) {
        NotArbiter.DemandData memory demandData = NotArbiter.DemandData({
            baseArbiter: arbiter,
            baseDemand: baseDemand
        });
        return abi.encode(demandData);
    }

    function testTrueArbiterInversion() public view {
        // Create demand data with a success arbiter
        bytes memory demandData = createDemandData(
            address(successArbiter),
            bytes("")
        );

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // The NotArbiter should invert the successful result to false
        bool result = notArbiter.checkStatement(
            attestation,
            demandData,
            bytes32(0)
        );
        assertFalse(result, "NotArbiter should invert success to failure");
    }

    function testFalseArbiterInversion() public view {
        // Create demand data with a fail arbiter
        bytes memory demandData = createDemandData(
            address(failArbiter),
            bytes("")
        );

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // The NotArbiter should invert the failed result to true
        bool result = notArbiter.checkStatement(
            attestation,
            demandData,
            bytes32(0)
        );
        assertTrue(result, "NotArbiter should invert failure to success");
    }

    function testRevertArbiterHandling() public view {
        // Create demand data with a reverting arbiter
        bytes memory demandData = createDemandData(
            address(revertArbiter),
            bytes("")
        );

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // When the base arbiter reverts, NotArbiter should treat it as success (returning true)
        bool result = notArbiter.checkStatement(
            attestation,
            demandData,
            bytes32(0)
        );
        assertTrue(
            result,
            "NotArbiter should return true when base arbiter reverts"
        );
    }

    function testIntrinsicsArbiterWithValidAttestation() public view {
        // Create demand data with IntrinsicsArbiter
        bytes memory demandData = createDemandData(
            address(intrinsicsArbiter),
            bytes("")
        );

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // IntrinsicsArbiter validates the attestation, so NotArbiter should invert to false
        bool result = notArbiter.checkStatement(
            attestation,
            demandData,
            bytes32(0)
        );
        assertFalse(
            result,
            "Should return false for valid attestation with IntrinsicsArbiter"
        );
    }

    function testIntrinsicsArbiterWithExpiredAttestation() public view {
        // Create demand data with IntrinsicsArbiter
        bytes memory demandData = createDemandData(
            address(intrinsicsArbiter),
            bytes("")
        );

        // Create an expired attestation
        Attestation memory attestation = createExpiredAttestation();

        // IntrinsicsArbiter would revert for expired attestation, so NotArbiter should return true
        bool result = notArbiter.checkStatement(
            attestation,
            demandData,
            bytes32(0)
        );
        assertTrue(
            result,
            "Should return true for expired attestation with IntrinsicsArbiter"
        );
    }

    function testDecodeDemandData() public view {
        // Create sample demand data
        bytes memory baseDemand = bytes("sample demand data");
        bytes memory encodedData = createDemandData(
            address(successArbiter),
            baseDemand
        );

        // Decode the demand data
        NotArbiter.DemandData memory decodedData = notArbiter.decodeDemandData(
            encodedData
        );

        // Verify decoded data matches original
        assertEq(
            decodedData.baseArbiter,
            address(successArbiter),
            "Base arbiter address mismatch"
        );

        // Compare the demand data bytes
        assertEq(
            keccak256(decodedData.baseDemand),
            keccak256(baseDemand),
            "Base demand data mismatch"
        );
    }

    function testNestedNotArbiters() public {
        // Create a NotArbiter that inverts a SuccessArbiter (resulting in false)
        bytes memory firstLevelDemand = createDemandData(
            address(successArbiter),
            bytes("")
        );

        // Create another NotArbiter that inverts the first NotArbiter (resulting in true)
        NotArbiter secondLevelNotArbiter = new NotArbiter();
        bytes memory secondLevelDemand = createDemandData(
            address(notArbiter),
            firstLevelDemand
        );

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // The nested NotArbiters should result in true (inverting the inversion)
        bool result = secondLevelNotArbiter.checkStatement(
            attestation,
            secondLevelDemand,
            bytes32(0)
        );
        assertTrue(
            result,
            "Double negation should result in the original value"
        );
    }
}
