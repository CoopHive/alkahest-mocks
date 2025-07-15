// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {AnyArbiter} from "@src/arbiters/logical/AnyArbiter.sol";
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

contract AnyArbiterTest is Test {
    AnyArbiter anyArbiter;
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
        anyArbiter = new AnyArbiter();
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
        AnyArbiter.DemandData memory demandData = AnyArbiter.DemandData({
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

        // No arbiters to check should result in false
        bool result = anyArbiter.checkObligation(
            attestation,
            demandData,
            bytes32(0)
        );
        assertFalse(result, "Empty arbiter array should return false");
    }

    function testSingleSuccessfulArbiter() public view {
        // Create arrays with one successful arbiter
        address[] memory arbiters = new address[](1);
        arbiters[0] = address(successArbiter);

        bytes[] memory demands = new bytes[](1);
        demands[0] = bytes("");

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // Create demand data
        bytes memory demandData = createDemandData(arbiters, demands);

        // Single successful arbiter should return true
        bool result = anyArbiter.checkObligation(
            attestation,
            demandData,
            bytes32(0)
        );
        assertTrue(result, "Single successful arbiter should return true");
    }

    function testMultipleArbitersOneSucceeds() public view {
        // Create arrays where one arbiter succeeds and others fail
        address[] memory arbiters = new address[](3);
        arbiters[0] = address(failArbiter);
        arbiters[1] = address(successArbiter);
        arbiters[2] = address(failArbiter);

        bytes[] memory demands = new bytes[](3);
        demands[0] = bytes("");
        demands[1] = bytes("");
        demands[2] = bytes("");

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // Create demand data
        bytes memory demandData = createDemandData(arbiters, demands);

        // Should return true because at least one arbiter succeeds
        bool result = anyArbiter.checkObligation(
            attestation,
            demandData,
            bytes32(0)
        );
        assertTrue(
            result,
            "Should return true when at least one arbiter succeeds"
        );
    }

    function testAllArbitersFail() public view {
        // Create arrays where all arbiters fail
        address[] memory arbiters = new address[](2);
        arbiters[0] = address(failArbiter);
        arbiters[1] = address(failArbiter);

        bytes[] memory demands = new bytes[](2);
        demands[0] = bytes("");
        demands[1] = bytes("");

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // Create demand data
        bytes memory demandData = createDemandData(arbiters, demands);

        // Should return false because all arbiters fail
        bool result = anyArbiter.checkObligation(
            attestation,
            demandData,
            bytes32(0)
        );
        assertFalse(result, "Should return false when all arbiters fail");
    }

    function testAllArbitersRevert() public view {
        // Create arrays where all arbiters revert
        address[] memory arbiters = new address[](2);
        arbiters[0] = address(revertArbiter);
        arbiters[1] = address(revertArbiter);

        bytes[] memory demands = new bytes[](2);
        demands[0] = bytes("");
        demands[1] = bytes("");

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // Create demand data
        bytes memory demandData = createDemandData(arbiters, demands);

        // Should return false because all arbiters revert
        bool result = anyArbiter.checkObligation(
            attestation,
            demandData,
            bytes32(0)
        );
        assertFalse(result, "Should return false when all arbiters revert");
    }

    function testSomeArbitersRevertOthersFail() public view {
        // Create arrays where some arbiters revert and others fail
        address[] memory arbiters = new address[](3);
        arbiters[0] = address(revertArbiter);
        arbiters[1] = address(failArbiter);
        arbiters[2] = address(revertArbiter);

        bytes[] memory demands = new bytes[](3);
        demands[0] = bytes("");
        demands[1] = bytes("");
        demands[2] = bytes("");

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // Create demand data
        bytes memory demandData = createDemandData(arbiters, demands);

        // Should return false because all arbiters either revert or fail
        bool result = anyArbiter.checkObligation(
            attestation,
            demandData,
            bytes32(0)
        );
        assertFalse(
            result,
            "Should return false when all arbiters either revert or fail"
        );
    }

    function testSomeArbitersRevertOneSucceeds() public view {
        // Create arrays where some arbiters revert and one succeeds
        address[] memory arbiters = new address[](3);
        arbiters[0] = address(revertArbiter);
        arbiters[1] = address(successArbiter);
        arbiters[2] = address(revertArbiter);

        bytes[] memory demands = new bytes[](3);
        demands[0] = bytes("");
        demands[1] = bytes("");
        demands[2] = bytes("");

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // Create demand data
        bytes memory demandData = createDemandData(arbiters, demands);

        // Should return true because at least one arbiter succeeds, even with reverts
        bool result = anyArbiter.checkObligation(
            attestation,
            demandData,
            bytes32(0)
        );
        assertTrue(
            result,
            "Should return true when at least one arbiter succeeds, even with reverts"
        );
    }

    function testIntrinsicsArbiterWithValidAttestation() public view {
        // Create arrays with IntrinsicsArbiter
        address[] memory arbiters = new address[](1);
        arbiters[0] = address(intrinsicsArbiter);

        bytes[] memory demands = new bytes[](1);
        demands[0] = bytes("");

        // Create a valid attestation
        Attestation memory attestation = createValidAttestation();

        // Create demand data
        bytes memory demandData = createDemandData(arbiters, demands);

        // Should return true because IntrinsicsArbiter should validate the attestation
        bool result = anyArbiter.checkObligation(
            attestation,
            demandData,
            bytes32(0)
        );
        assertTrue(
            result,
            "Should return true with valid attestation for IntrinsicsArbiter"
        );
    }

    function testIntrinsicsArbiterWithExpiredAttestation() public view {
        // Create arrays with IntrinsicsArbiter
        address[] memory arbiters = new address[](1);
        arbiters[0] = address(intrinsicsArbiter);

        bytes[] memory demands = new bytes[](1);
        demands[0] = bytes("");

        // Create an expired attestation
        Attestation memory attestation = createExpiredAttestation();

        // Create demand data
        bytes memory demandData = createDemandData(arbiters, demands);

        // Should return false because IntrinsicsArbiter will revert, but AnyArbiter catches it
        bool result = anyArbiter.checkObligation(
            attestation,
            demandData,
            bytes32(0)
        );
        assertFalse(
            result,
            "Should return false with expired attestation for IntrinsicsArbiter"
        );
    }

    function testExpiredAttestationWithSuccessfulBackup() public view {
        // Create arrays with IntrinsicsArbiter first (will revert) and then a success arbiter
        address[] memory arbiters = new address[](2);
        arbiters[0] = address(intrinsicsArbiter);
        arbiters[1] = address(successArbiter);

        bytes[] memory demands = new bytes[](2);
        demands[0] = bytes("");
        demands[1] = bytes("");

        // Create an expired attestation
        Attestation memory attestation = createExpiredAttestation();

        // Create demand data
        bytes memory demandData = createDemandData(arbiters, demands);

        // Should return true because the second arbiter succeeds
        bool result = anyArbiter.checkObligation(
            attestation,
            demandData,
            bytes32(0)
        );
        assertTrue(
            result,
            "Should return true when at least one arbiter succeeds, even with reverts"
        );
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
        AnyArbiter.DemandData memory decodedData = anyArbiter.decodeDemandData(
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
        vm.expectRevert(AnyArbiter.MismatchedArrayLengths.selector);
        anyArbiter.checkObligation(attestation, demandData, bytes32(0));
    }
}
