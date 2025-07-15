// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {TrivialArbiter} from "@src/arbiters/TrivialArbiter.sol";

contract TrivialArbiterTest is Test {
    TrivialArbiter arbiter;

    function setUp() public {
        arbiter = new TrivialArbiter();
    }

    function testCheckObligationAlwaysReturnsTrue() public {
        // Create a test attestation (values don't matter for TrivialArbiter)
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

        // Empty demand data
        bytes memory demand = bytes("");

        // Check obligation should always return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(result, "TrivialArbiter should always return true");

        // Try with different values, should still return true
        attestation.uid = bytes32(uint256(1));
        demand = abi.encode("some data");

        result = arbiter.checkObligation(
            attestation,
            demand,
            bytes32(uint256(42))
        );
        assertTrue(
            result,
            "TrivialArbiter should always return true regardless of inputs"
        );
    }
}
