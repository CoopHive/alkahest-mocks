// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {ExpirationTimeEqualArbiter} from "@src/arbiters/attestation-properties/composing/ExpirationTimeEqualArbiter.sol";

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

contract ExpirationTimeEqualArbiterTest is Test {
    ExpirationTimeEqualArbiter arbiter;
    MockArbiter mockArbiterTrue;
    MockArbiter mockArbiterFalse;
    uint64 expirationTimeValue;

    function setUp() public {
        arbiter = new ExpirationTimeEqualArbiter();
        mockArbiterTrue = new MockArbiter(true);
        mockArbiterFalse = new MockArbiter(false);

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

        // Create demand data with matching expiration time and a base arbiter that returns true
        ExpirationTimeEqualArbiter.DemandData
            memory demandData = ExpirationTimeEqualArbiter.DemandData({
                baseArbiter: address(mockArbiterTrue),
                baseDemand: bytes(""),
                expirationTime: expirationTimeValue
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Should accept attestation with equal expiration time and base arbiter returning true"
        );
    }

    function testCheckObligationWithExpirationTimeEqualButBaseArbiterReturnsFalse()
        public
        view
    {
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

        // Create demand data with matching expiration time but a base arbiter that returns false
        ExpirationTimeEqualArbiter.DemandData
            memory demandData = ExpirationTimeEqualArbiter.DemandData({
                expirationTime: expirationTimeValue,
                baseArbiter: address(mockArbiterFalse),
                baseDemand: bytes("")
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return false
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertFalse(result, "Should reject when base arbiter returns false");
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
                expirationTime: expirationTimeValue,
                baseArbiter: address(mockArbiterTrue),
                baseDemand: bytes("")
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
                expirationTime: expirationTimeValue,
                baseArbiter: address(mockArbiterTrue),
                baseDemand: bytes("test")
            });

        bytes memory encodedData = abi.encode(expectedDemandData);

        ExpirationTimeEqualArbiter.DemandData memory decodedData = arbiter
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
