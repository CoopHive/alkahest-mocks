// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {TrustedPartyArbiter} from "@src/arbiters/deprecated/TrustedPartyArbiter.sol";
import {TrivialArbiter} from "@src/arbiters/TrivialArbiter.sol";

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

contract TrustedPartyArbiterTest is Test {
    TrustedPartyArbiter arbiter;
    MockArbiter mockArbiterTrue;
    MockArbiter mockArbiterFalse;
    address creator = address(0x123);

    function setUp() public {
        arbiter = new TrustedPartyArbiter();
        mockArbiterTrue = new MockArbiter(true);
        mockArbiterFalse = new MockArbiter(false);
    }

    function testCheckObligationWithCorrectCreator() public view {
        // Create a test attestation with the correct recipient (creator)
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: creator,
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with the correct creator and a base arbiter that returns true
        TrustedPartyArbiter.DemandData memory demandData = TrustedPartyArbiter
            .DemandData({
                baseArbiter: address(mockArbiterTrue),
                baseDemand: bytes(""),
                creator: creator
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Should accept attestation with correct creator and base arbiter returning true"
        );
    }

    function testCheckObligationWithCorrectCreatorButBaseArbiterReturnsFalse()
        public
        view
    {
        // Create a test attestation with the correct recipient (creator)
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: creator,
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with the correct creator but a base arbiter that returns false
        TrustedPartyArbiter.DemandData memory demandData = TrustedPartyArbiter
            .DemandData({
                creator: creator,
                baseArbiter: address(mockArbiterFalse),
                baseDemand: bytes("")
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return false
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertFalse(result, "Should reject when base arbiter returns false");
    }

    function testCheckObligationWithIncorrectCreator() public {
        // Create a test attestation with an incorrect recipient (not the creator)
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0x456), // Different from creator
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with the correct creator
        TrustedPartyArbiter.DemandData memory demandData = TrustedPartyArbiter
            .DemandData({
                creator: creator,
                baseArbiter: address(mockArbiterTrue),
                baseDemand: bytes("")
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with NotTrustedParty
        vm.expectRevert(TrustedPartyArbiter.NotTrustedParty.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }
}
