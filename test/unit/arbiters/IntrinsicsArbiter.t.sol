// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {IntrinsicsArbiter} from "@src/arbiters/IntrinsicsArbiter.sol";
import {ArbiterUtils} from "@src/ArbiterUtils.sol";

contract IntrinsicsArbiterTest is Test {
    IntrinsicsArbiter arbiter;
    uint64 currentTime;

    function setUp() public {
        // Set block timestamp to a sufficiently large value to avoid underflows
        vm.warp(10_000_000);

        arbiter = new IntrinsicsArbiter();
        currentTime = uint64(block.timestamp);
    }

    function testValidAttestation() public view {
        // Create a valid attestation: not expired, not revoked
        Attestation memory attestation = Attestation({
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

        bool result = arbiter.checkObligation(
            attestation,
            bytes(""),
            bytes32(0)
        );
        assertTrue(result, "Valid attestation should return true");

        // Attestation with no expiration (expirationTime = 0) should also be valid
        attestation.expirationTime = 0;
        result = arbiter.checkObligation(attestation, bytes(""), bytes32(0));
        assertTrue(result, "Attestation with no expiration should return true");
    }

    function testExpiredAttestation() public {
        // Create an expired attestation
        Attestation memory attestation = Attestation({
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

        vm.expectRevert(ArbiterUtils.DeadlineExpired.selector);
        arbiter.checkObligation(attestation, bytes(""), bytes32(0));
    }

    function testRevokedAttestation() public {
        // Create a revoked attestation
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: currentTime,
            expirationTime: currentTime + 1 days, // not expired
            revocationTime: currentTime - 1 hours, // revoked
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        vm.expectRevert(ArbiterUtils.AttestationRevoked.selector);
        arbiter.checkObligation(attestation, bytes(""), bytes32(0));
    }

    function testExpiredAndRevokedAttestation() public {
        // Create an attestation that is both expired and revoked
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: currentTime - 2 days,
            expirationTime: currentTime - 1 days, // expired
            revocationTime: currentTime - 1 hours, // revoked
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // It should revert with DeadlineExpired first because that check is performed first
        vm.expectRevert(ArbiterUtils.DeadlineExpired.selector);
        arbiter.checkObligation(attestation, bytes(""), bytes32(0));
    }

    function testTimeManipulation() public {
        // Create a valid attestation
        Attestation memory attestation = Attestation({
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

        // Attestation is valid now
        bool result = arbiter.checkObligation(
            attestation,
            bytes(""),
            bytes32(0)
        );
        assertTrue(result, "Attestation should be valid initially");

        // Warp time to just before expiration
        vm.warp(currentTime + 1 days - 1);
        result = arbiter.checkObligation(attestation, bytes(""), bytes32(0));
        assertTrue(
            result,
            "Attestation should still be valid just before expiration"
        );

        // Warp time to exactly at expiration
        vm.warp(currentTime + 1 days);
        result = arbiter.checkObligation(attestation, bytes(""), bytes32(0));
        assertTrue(
            result,
            "Attestation should still be valid right at expiration"
        );

        // Warp time past expiration
        vm.warp(currentTime + 1 days + 1);
        vm.expectRevert(ArbiterUtils.DeadlineExpired.selector);
        arbiter.checkObligation(attestation, bytes(""), bytes32(0));
    }
}
