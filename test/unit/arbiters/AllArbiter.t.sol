// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {AllArbiter} from "@src/arbiters/logical/AllArbiter.sol";
import {IntrinsicsArbiter} from "@src/arbiters/IntrinsicsArbiter.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {ArbiterUtils} from "@src/ArbiterUtils.sol";

// Mock arbiters for testing
contract MockSuccessArbiter is IArbiter {
    function checkObligation(
        Attestation memory,
        bytes memory,
        bytes32
    ) public pure override returns (bool) {
        return true;
    }
}

contract MockFailArbiter is IArbiter {
    function checkObligation(
        Attestation memory,
        bytes memory,
        bytes32
    ) public pure override returns (bool) {
        return false;
    }
}

contract MockRevertArbiter is IArbiter {
    function checkObligation(
        Attestation memory,
        bytes memory,
        bytes32
    ) public pure override returns (bool) {
        revert("Arbiter reverted");
    }
}

contract AllArbiterTest is Test {
    AllArbiter allArbiter;
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
        allArbiter = new AllArbiter();
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
        address[] memory arbiters,
        bytes[] memory demands
    ) internal pure returns (bytes memory) {
        AllArbiter.DemandData memory demandData = AllArbiter.DemandData({
            arbiters: arbiters,
            demands: demands
        });
        return abi.encode(demandData);
    }

    function testEmptyArbiters() public view {
        // Create empty arrays for arbiters and demands
        address[] memory arbiters = new address[](0);
        bytes[] memory demands = new bytes[](0);

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // Create demand data with empty arrays
        bytes memory demandData = createDemandData(arbiters, demands);

        // No arbiters to check should result in true
        bool result = allArbiter.checkObligation(
            attestation,
            demandData,
            bytes32(0)
        );
        assertTrue(result, "Empty arbiter array should return true");
    }

    function testAllArbitersSucceed() public view {
        // Create arrays for arbiters and demands with multiple successful arbiters
        address[] memory arbiters = new address[](2);
        arbiters[0] = address(successArbiter);
        arbiters[1] = address(intrinsicsArbiter);

        bytes[] memory demands = new bytes[](2);
        demands[0] = bytes("");
        demands[1] = bytes("");

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // Create demand data with multiple successful arbiters
        bytes memory demandData = createDemandData(arbiters, demands);

        // All arbiters succeed, should return true
        bool result = allArbiter.checkObligation(
            attestation,
            demandData,
            bytes32(0)
        );
        assertTrue(result, "All successful arbiters should return true");
    }

    function testOneArbiterFails() public view {
        // Create arrays for arbiters and demands with one failing arbiter
        address[] memory arbiters = new address[](2);
        arbiters[0] = address(successArbiter);
        arbiters[1] = address(failArbiter);

        bytes[] memory demands = new bytes[](2);
        demands[0] = bytes("");
        demands[1] = bytes("");

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // Create demand data with one failing arbiter
        bytes memory demandData = createDemandData(arbiters, demands);

        // One arbiter fails, should return false
        bool result = allArbiter.checkObligation(
            attestation,
            demandData,
            bytes32(0)
        );
        assertFalse(
            result,
            "One failing arbiter should cause function to return false"
        );
    }

    function testOneArbiterReverts() public {
        // Create arrays for arbiters and demands with one reverting arbiter
        address[] memory arbiters = new address[](2);
        arbiters[0] = address(successArbiter);
        arbiters[1] = address(revertArbiter);

        bytes[] memory demands = new bytes[](2);
        demands[0] = bytes("");
        demands[1] = bytes("");

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // Create demand data with one reverting arbiter
        bytes memory demandData = createDemandData(arbiters, demands);

        // One arbiter reverts, AllArbiter should also revert with the same error
        vm.expectRevert("Arbiter reverted");
        allArbiter.checkObligation(attestation, demandData, bytes32(0));
    }

    function testIntrinsicsArbiterWithExpiredAttestation() public {
        // Create arrays for arbiters and demands with IntrinsicsArbiter
        address[] memory arbiters = new address[](1);
        arbiters[0] = address(intrinsicsArbiter);

        bytes[] memory demands = new bytes[](1);
        demands[0] = bytes("");

        // Create an expired attestation
        Attestation memory attestation = createExpiredAttestation();

        // Create demand data
        bytes memory demandData = createDemandData(arbiters, demands);

        // Should revert with DeadlineExpired from IntrinsicsArbiter
        vm.expectRevert(ArbiterUtils.DeadlineExpired.selector);
        allArbiter.checkObligation(attestation, demandData, bytes32(0));
    }

    function testMultipleValidArbiters() public view {
        // Test with two real arbiters that should all pass
        address[] memory arbiters = new address[](2);
        arbiters[0] = address(intrinsicsArbiter);
        arbiters[1] = address(successArbiter);

        bytes[] memory demands = new bytes[](2);
        demands[0] = bytes("");
        demands[1] = bytes("");

        Attestation memory attestation = createValidAttestation();
        bytes memory demandData = createDemandData(arbiters, demands);

        bool result = allArbiter.checkObligation(
            attestation,
            demandData,
            bytes32(0)
        );
        assertTrue(result, "Multiple valid arbiters should return true");
    }

    function testDecodeDemandData() public view {
        // Create sample demand data
        address[] memory arbiters = new address[](2);
        arbiters[0] = address(successArbiter);
        arbiters[1] = address(intrinsicsArbiter);

        bytes[] memory demands = new bytes[](2);
        demands[0] = bytes("demand1");
        demands[1] = bytes("demand2");

        bytes memory encodedData = createDemandData(arbiters, demands);

        // Decode the demand data
        AllArbiter.DemandData memory decodedData = allArbiter.decodeDemandData(
            encodedData
        );

        // Verify decoded data matches original
        assertEq(
            decodedData.arbiters.length,
            arbiters.length,
            "Arbiter array length mismatch"
        );
        assertEq(
            decodedData.demands.length,
            demands.length,
            "Demands array length mismatch"
        );
        assertEq(
            decodedData.arbiters[0],
            arbiters[0],
            "First arbiter address mismatch"
        );
        assertEq(
            decodedData.arbiters[1],
            arbiters[1],
            "Second arbiter address mismatch"
        );

        // Compare the demand data bytes
        assertEq(
            keccak256(decodedData.demands[0]),
            keccak256(demands[0]),
            "First demand data mismatch"
        );
        assertEq(
            keccak256(decodedData.demands[1]),
            keccak256(demands[1]),
            "Second demand data mismatch"
        );
    }

    function testMismatchedArrayLengths() public {
        // Create arrays with mismatched lengths
        address[] memory arbiters = new address[](2);
        arbiters[0] = address(successArbiter);
        arbiters[1] = address(intrinsicsArbiter);

        bytes[] memory demands = new bytes[](1); // Only one demand for two arbiters
        demands[0] = bytes("");

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // Create demand data with mismatched array lengths
        bytes memory demandData = createDemandData(arbiters, demands);

        // This should revert with an out of bounds error when trying to access demands[1]
        vm.expectRevert(AllArbiter.MismatchedArrayLengths.selector);
        allArbiter.checkObligation(attestation, demandData, bytes32(0));
    }

    function testArbitersWithSpecificDemands() public view {
        // To further test integration with real arbiters, we could create specific
        // demand data for each arbiter if they require it
        // This is a simplified example
        address[] memory arbiters = new address[](2);
        arbiters[0] = address(successArbiter);
        arbiters[1] = address(intrinsicsArbiter);

        bytes[] memory demands = new bytes[](2);
        demands[0] = bytes("specific demand for success arbiter");
        demands[1] = bytes("specific demand for intrinsics arbiter");

        Attestation memory attestation = createValidAttestation();
        bytes memory demandData = createDemandData(arbiters, demands);

        bool result = allArbiter.checkObligation(
            attestation,
            demandData,
            bytes32(0)
        );
        assertTrue(result, "Arbiters with specific demands should return true");
    }
}
