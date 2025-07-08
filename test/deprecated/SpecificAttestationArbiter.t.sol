// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {SpecificAttestationArbiter} from "@src/arbiters/deprecated/SpecificAttestationArbiter.sol";

contract SpecificAttestationArbiterTest is Test {
    SpecificAttestationArbiter arbiter;

    function setUp() public {
        arbiter = new SpecificAttestationArbiter();
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
        SpecificAttestationArbiter.DemandData
            memory demandData = SpecificAttestationArbiter.DemandData({
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
        SpecificAttestationArbiter.DemandData
            memory demandData = SpecificAttestationArbiter.DemandData({
                uid: bytes32(uint256(2))
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with NotDemandedAttestation
        vm.expectRevert(
            SpecificAttestationArbiter.NotDemandedAttestation.selector
        );
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }
}
