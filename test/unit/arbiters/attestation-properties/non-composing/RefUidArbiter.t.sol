// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {RefUidArbiter} from "@src/arbiters/attestation-properties/non-composing/RefUidArbiter.sol";

contract RefUidArbiterTest is Test {
    RefUidArbiter arbiter;
    bytes32 refUid = bytes32(uint256(123));

    function setUp() public {
        arbiter = new RefUidArbiter();
    }

    function testCheckObligationWithCorrectRefUid() public view {
        // Create a test attestation with the correct refUID
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: refUid,
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with matching refUID
        RefUidArbiter.DemandData memory demandData = RefUidArbiter.DemandData({
            refUID: refUid
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(result, "Should accept attestation with matching refUID");
    }

    function testCheckObligationWithIncorrectRefUid() public {
        // Create a test attestation with non-matching refUID
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(uint256(456)), // Different from demanded refUID
            recipient: address(0),
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with refUID
        RefUidArbiter.DemandData memory demandData = RefUidArbiter.DemandData({
            refUID: refUid
        });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with RefUidMismatched
        vm.expectRevert(RefUidArbiter.RefUidMismatched.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testDecodeDemandData() public {
        // Create demand data
        RefUidArbiter.DemandData memory expectedDemandData = RefUidArbiter.DemandData({
            refUID: refUid
        });
        
        bytes memory encodedData = abi.encode(expectedDemandData);
        
        RefUidArbiter.DemandData memory decodedData = arbiter.decodeDemandData(encodedData);
        
        assertEq(decodedData.refUID, expectedDemandData.refUID, "RefUID should match");
    }
}