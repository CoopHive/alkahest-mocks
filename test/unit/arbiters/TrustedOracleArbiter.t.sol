// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {TrustedOracleArbiter} from "@src/arbiters/TrustedOracleArbiter.sol";

contract TrustedOracleArbiterTest is Test {
    TrustedOracleArbiter arbiter;
    address oracle = address(0x123);
    bytes32 statementUid = bytes32(uint256(1));

    function setUp() public {
        arbiter = new TrustedOracleArbiter();
    }

    function testConstructor() public {
        // Create a new arbiter to test constructor
        TrustedOracleArbiter newArbiter = new TrustedOracleArbiter();

        // Verify that the EAS address is set correctly
        // This is an indirect test since the eas variable is private
        // We'll test it through functionality
        Attestation memory attestation = Attestation({
            uid: statementUid,
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

        TrustedOracleArbiter.DemandData memory demandData = TrustedOracleArbiter
            .DemandData({oracle: oracle, data: bytes("")});
        bytes memory demand = abi.encode(demandData);

        // Should return false initially since no decision has been made
        assertFalse(newArbiter.checkStatement(attestation, demand, bytes32(0)));
    }

    function testArbitrate() public {
        // Test that arbitrate function updates the decision
        vm.startPrank(oracle);

        // Initially the decision should be false (default value)
        assertFalse(
            arbiter.checkStatement(
                Attestation({
                    uid: statementUid,
                    schema: bytes32(0),
                    time: uint64(block.timestamp),
                    expirationTime: uint64(0),
                    revocationTime: uint64(0),
                    refUID: bytes32(0),
                    recipient: address(0),
                    attester: address(0),
                    revocable: true,
                    data: bytes("")
                }),
                abi.encode(
                    TrustedOracleArbiter.DemandData({
                        oracle: oracle,
                        data: bytes("")
                    })
                ),
                bytes32(0)
            )
        );

        // Expect the ArbitrationMade event to be emitted
        vm.expectEmit(true, true, false, true);
        emit TrustedOracleArbiter.ArbitrationMade(oracle, statementUid, true);

        // Make a positive arbitration decision
        arbiter.arbitrate(statementUid, true);

        // Now the decision should be true
        assertTrue(
            arbiter.checkStatement(
                Attestation({
                    uid: statementUid,
                    schema: bytes32(0),
                    time: uint64(block.timestamp),
                    expirationTime: uint64(0),
                    revocationTime: uint64(0),
                    refUID: bytes32(0),
                    recipient: address(0),
                    attester: address(0),
                    revocable: true,
                    data: bytes("")
                }),
                abi.encode(
                    TrustedOracleArbiter.DemandData({
                        oracle: oracle,
                        data: bytes("")
                    })
                ),
                bytes32(0)
            )
        );

        vm.stopPrank();
    }

    function testCheckStatementWithDifferentOracles() public {
        // Set up two different oracles with different decisions
        address oracle1 = address(0x123);
        address oracle2 = address(0x456);
        // Use the class-level statementUid

        // Oracle 1 makes a positive decision
        vm.prank(oracle1);
        arbiter.arbitrate(statementUid, true);

        // Oracle 2 makes a negative decision
        vm.prank(oracle2);
        arbiter.arbitrate(statementUid, false);

        // Create the attestation
        Attestation memory attestation = Attestation({
            uid: statementUid,
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

        // Check with oracle1 - should be true
        assertTrue(
            arbiter.checkStatement(
                attestation,
                abi.encode(
                    TrustedOracleArbiter.DemandData({
                        oracle: oracle1,
                        data: bytes("")
                    })
                ),
                bytes32(0)
            )
        );

        // Check with oracle2 - should be false
        assertFalse(
            arbiter.checkStatement(
                attestation,
                abi.encode(
                    TrustedOracleArbiter.DemandData({
                        oracle: oracle2,
                        data: bytes("")
                    })
                ),
                bytes32(0)
            )
        );
    }

    function testCheckStatementWithNoDecision() public {
        // Test with an oracle that hasn't made a decision
        address newOracle = address(0x789);
        // Use the class-level statementUid

        // Create the attestation
        Attestation memory attestation = Attestation({
            uid: statementUid,
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

        // Check with the new oracle - should be false (default value)
        assertFalse(
            arbiter.checkStatement(
                attestation,
                abi.encode(
                    TrustedOracleArbiter.DemandData({
                        oracle: newOracle,
                        data: bytes("")
                    })
                ),
                bytes32(0)
            )
        );
    }
}
