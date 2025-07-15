// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {UidArbiter} from "@src/arbiters/attestation-properties/non-composing/UidArbiter.sol";

contract UidArbiterTest is Test {
    UidArbiter arbiter;

    function setUp() public {
        arbiter = new UidArbiter();
    }

    function testCheckObligationWithCorrectUID() public view {
        // Create a test attestation
        bytes32 uid = bytes32(uint256(1));
        Attestation memory attestation = Attestation({
            uid: uid,
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

        // Create demand data with matching UID
        UidArbiter.DemandData memory demandData = UidArbiter.DemandData({
            uid: uid
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(result, "Should accept attestation with matching UID");
    }

    function testCheckObligationWithIncorrectUID() public {
        // Create a test attestation
        bytes32 uid = bytes32(uint256(1));
        Attestation memory attestation = Attestation({
            uid: uid,
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

        // Create demand data with non-matching UID
        UidArbiter.DemandData memory demandData = UidArbiter.DemandData({
            uid: bytes32(uint256(2))
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with UidMismatched
        vm.expectRevert(UidArbiter.UidMismatched.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testDecodeDemandData() public {
        // Create demand data
        UidArbiter.DemandData memory expectedDemandData = UidArbiter.DemandData({
            uid: bytes32(uint256(123))
        });
        
        bytes memory encodedData = abi.encode(expectedDemandData);
        
        UidArbiter.DemandData memory decodedData = arbiter.decodeDemandData(encodedData);
        
        assertEq(decodedData.uid, expectedDemandData.uid, "UID should match");
    }
}