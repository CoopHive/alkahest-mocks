// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {IntrinsicsArbiter2} from "@src/arbiters/IntrinsicsArbiter2.sol";
import {ArbiterUtils} from "@src/ArbiterUtils.sol";

contract IntrinsicsArbiter2Test is Test {
    IntrinsicsArbiter2 arbiter;
    uint64 currentTime;
    bytes32 constant TEST_SCHEMA = bytes32(uint256(1));

    function setUp() public {
        // Set block timestamp to a sufficiently large value to avoid underflows
        vm.warp(10_000_000);

        arbiter = new IntrinsicsArbiter2();
        currentTime = uint64(block.timestamp);
    }

    function createDemandData(
        bytes32 schema
    ) private pure returns (bytes memory) {
        IntrinsicsArbiter2.DemandData memory demandData = IntrinsicsArbiter2
            .DemandData({schema: schema});
        return abi.encode(demandData);
    }

    function testValidAttestationWithMatchingSchema() public view {
        // Create a valid attestation: not expired, not revoked, with matching schema
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: TEST_SCHEMA,
            time: currentTime,
            expirationTime: currentTime + 1 days, // expires in the future
            revocationTime: uint64(0), // not revoked
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        bytes memory demand = createDemandData(TEST_SCHEMA);
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Valid attestation with matching schema should return true"
        );

        // Attestation with no expiration (expirationTime = 0) should also be valid
        attestation.expirationTime = 0;
        result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(result, "Attestation with no expiration should return true");
    }

    function testInvalidSchema() public {
        // Create an attestation with non-matching schema
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: TEST_SCHEMA,
            time: currentTime,
            expirationTime: currentTime + 1 days, // expires in the future
            revocationTime: uint64(0), // not revoked
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        bytes memory demand = createDemandData(bytes32(uint256(2))); // Different schema

        vm.expectRevert(ArbiterUtils.InvalidSchema.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testExpiredAttestation() public {
        // Create an expired attestation
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: TEST_SCHEMA,
            time: currentTime - 2 days,
            expirationTime: currentTime - 1 days, // expired in the past
            revocationTime: uint64(0), // not revoked
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        bytes memory demand = createDemandData(TEST_SCHEMA);

        vm.expectRevert(ArbiterUtils.DeadlineExpired.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testRevokedAttestation() public {
        // Create a revoked attestation
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: TEST_SCHEMA,
            time: currentTime,
            expirationTime: currentTime + 1 days, // not expired
            revocationTime: currentTime - 1 hours, // revoked
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        bytes memory demand = createDemandData(TEST_SCHEMA);

        vm.expectRevert(ArbiterUtils.AttestationRevoked.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testExpiredAndRevokedAttestation() public {
        // Create an attestation that is both expired and revoked
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: TEST_SCHEMA,
            time: currentTime - 2 days,
            expirationTime: currentTime - 1 days, // expired
            revocationTime: currentTime - 1 hours, // revoked
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        bytes memory demand = createDemandData(TEST_SCHEMA);

        // With correct schema but expired attestation
        vm.expectRevert(ArbiterUtils.DeadlineExpired.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));

        // Test the order of checks - schema should be checked first
        bytes memory wrongSchemaDemand = createDemandData(bytes32(uint256(2)));
        vm.expectRevert(ArbiterUtils.InvalidSchema.selector);
        arbiter.checkObligation(attestation, wrongSchemaDemand, bytes32(0));
    }

    function testTimeManipulation() public {
        // Create a valid attestation
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: TEST_SCHEMA,
            time: currentTime,
            expirationTime: currentTime + 1 days, // expires in the future
            revocationTime: uint64(0), // not revoked
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        bytes memory demand = createDemandData(TEST_SCHEMA);

        // Attestation is valid now
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(result, "Attestation should be valid initially");

        // Warp time to just before expiration
        vm.warp(currentTime + 1 days - 1);
        result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Attestation should still be valid just before expiration"
        );

        // Warp time to exactly at expiration
        vm.warp(currentTime + 1 days);
        result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Attestation should still be valid right at expiration"
        );

        // Warp time past expiration
        vm.warp(currentTime + 1 days + 1);
        vm.expectRevert(ArbiterUtils.DeadlineExpired.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testDecodeDemandData() public view {
        bytes32 testSchema = bytes32(uint256(123));
        IntrinsicsArbiter2.DemandData memory demandData = IntrinsicsArbiter2
            .DemandData({schema: testSchema});

        bytes memory encodedData = abi.encode(demandData);

        IntrinsicsArbiter2.DemandData memory decodedData = arbiter
            .decodeDemandData(encodedData);

        assertEq(
            decodedData.schema,
            testSchema,
            "Decoded schema should match original"
        );
    }
}
