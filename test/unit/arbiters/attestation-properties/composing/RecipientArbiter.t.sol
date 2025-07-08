// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {RecipientArbiter} from "@src/arbiters/attestation-properties/composing/RecipientArbiter.sol";

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

contract RecipientArbiterTest is Test {
    RecipientArbiter arbiter;
    MockArbiter mockArbiterTrue;
    MockArbiter mockArbiterFalse;
    address recipient = address(0x123);

    function setUp() public {
        arbiter = new RecipientArbiter();
        mockArbiterTrue = new MockArbiter(true);
        mockArbiterFalse = new MockArbiter(false);
    }

    function testCheckObligationWithCorrectRecipient() public view {
        // Create a test attestation with the correct recipient
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: recipient,
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with the correct recipient and a base arbiter that returns true
        RecipientArbiter.DemandData memory demandData = RecipientArbiter
            .DemandData({
                baseArbiter: address(mockArbiterTrue),
                baseDemand: bytes(""),
                recipient: recipient
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return true
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertTrue(
            result,
            "Should accept attestation with correct recipient and base arbiter returning true"
        );
    }

    function testCheckObligationWithCorrectRecipientButBaseArbiterReturnsFalse()
        public
        view
    {
        // Create a test attestation with the correct recipient
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: recipient,
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with the correct recipient but a base arbiter that returns false
        RecipientArbiter.DemandData memory demandData = RecipientArbiter
            .DemandData({
                recipient: recipient,
                baseArbiter: address(mockArbiterFalse),
                baseDemand: bytes("")
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should return false
        bool result = arbiter.checkObligation(attestation, demand, bytes32(0));
        assertFalse(result, "Should reject when base arbiter returns false");
    }

    function testCheckObligationWithIncorrectRecipient() public {
        // Create a test attestation with an incorrect recipient
        Attestation memory attestation = Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0x456), // Different from demanded recipient
            attester: address(0),
            revocable: true,
            data: bytes("")
        });

        // Create demand data with the correct recipient
        RecipientArbiter.DemandData memory demandData = RecipientArbiter
            .DemandData({
                recipient: recipient,
                baseArbiter: address(mockArbiterTrue),
                baseDemand: bytes("")
            });
        bytes memory demand = abi.encode(demandData);

        // Check obligation should revert with RecipientMismatched
        vm.expectRevert(RecipientArbiter.RecipientMismatched.selector);
        arbiter.checkObligation(attestation, demand, bytes32(0));
    }

    function testDecodeDemandData() public {
        RecipientArbiter.DemandData memory expectedDemandData = RecipientArbiter
            .DemandData({
                recipient: recipient,
                baseArbiter: address(mockArbiterTrue),
                baseDemand: bytes("test")
            });
        
        bytes memory encodedData = abi.encode(expectedDemandData);
        
        RecipientArbiter.DemandData memory decodedData = arbiter.decodeDemandData(encodedData);
        
        assertEq(decodedData.recipient, expectedDemandData.recipient, "Recipient should match");
        assertEq(decodedData.baseArbiter, expectedDemandData.baseArbiter, "Base arbiter should match");
        assertEq(keccak256(decodedData.baseDemand), keccak256(expectedDemandData.baseDemand), "Base demand should match");
    }
}