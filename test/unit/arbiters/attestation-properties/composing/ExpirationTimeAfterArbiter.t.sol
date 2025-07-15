// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {ExpirationTimeAfterArbiter} from "@src/arbiters/attestation-properties/composing/ExpirationTimeAfterArbiter.sol";

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

contract ExpirationTimeAfterArbiterTest is Test {
    ExpirationTimeAfterArbiter arbiter;
    MockArbiter mockArbiterTrue;
    MockArbiter mockArbiterFalse;
    uint64 expirationTimeThreshold;

    function setUp() public {
        arbiter = new ExpirationTimeAfterArbiter();
        mockArbiterTrue = new MockArbiter(true);
        mockArbiterFalse = new MockArbiter(false);

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

        // Create demand data with expiration time threshold and a base arbiter that returns true
        ExpirationTimeAfterArbiter.DemandData
            memory demandData = ExpirationTimeAfterArbiter.DemandData({
                baseArbiter: address(mockArbiterTrue),
                baseDemand: bytes(""),
                expirationTime: expirationTimeThreshold
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Should accept attestation with expiration time after threshold and base arbiter returning true"
        );
    }

    function testCheckObligationWithExpirationTimeAfterThresholdButBaseArbiterReturnsFalse()
        public
        view
    {
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

        // Create demand data with expiration time threshold but a base arbiter that returns false
        ExpirationTimeAfterArbiter.DemandData
            memory demandData = ExpirationTimeAfterArbiter.DemandData({
                expirationTime: expirationTimeThreshold,
                baseArbiter: address(mockArbiterFalse),
                baseDemand: bytes("")
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return false
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertFalse(result, "Should reject when base arbiter returns false");
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
                expirationTime: expirationTimeThreshold,
                baseArbiter: address(mockArbiterTrue),
                baseDemand: bytes("")
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
                expirationTime: expirationTimeThreshold,
                baseArbiter: address(mockArbiterTrue),
                baseDemand: bytes("test")
            });

        bytes memory encodedData = abi.encode(expectedDemandData);

        ExpirationTimeAfterArbiter.DemandData memory decodedData = arbiter
            .decodeDemandData(encodedData);

        assertEq(
            decodedData.expirationTime,
            expectedDemandData.expirationTime,
            "Expiration time should match"
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
