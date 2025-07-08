// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {AttesterArbiter} from "@src/arbiters/attestation-properties/non-composing/AttesterArbiter.sol";

contract AttesterArbiterTest is Test {
    AttesterArbiter arbiter;
    address attester = address(0x123);

    function setUp() public {
        arbiter = new AttesterArbiter();
    }

    function testCheckObligationWithCorrectAttester() public view {
        // Create a test attestation with the correct attester
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: attester,
            revocable: true,
            data: bytes("")
        });

        // Create demand data with matching attester
        AttesterArbiter.DemandData memory demandData = AttesterArbiter.DemandData({
            attester: attester
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(result, "Should accept attestation with matching attester");
    }

    function testCheckObligationWithIncorrectAttester() public {
        // Create a test attestation with non-matching attester
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(0x456), // Different from demanded attester
            revocable: true,
            data: bytes("")
        });

        // Create demand data with attester
        AttesterArbiter.DemandData memory demandData = AttesterArbiter.DemandData({
            attester: attester
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with AttesterMismatched
        vm.expectRevert(AttesterArbiter.AttesterMismatched.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testDecodeDemandData() public {
        // Create demand data
        AttesterArbiter.DemandData memory expectedDemandData = AttesterArbiter.DemandData({
            attester: attester
        });
        
        bytes memory encodedData = abi.encode(expectedDemandData);
        
        AttesterArbiter.DemandData memory decodedData = arbiter.decodeDemandData(encodedData);
        
        assertEq(decodedData.attester, expectedDemandData.attester, "Attester should match");
    }
}