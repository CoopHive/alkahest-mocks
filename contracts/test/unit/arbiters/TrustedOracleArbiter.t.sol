// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {ISchemaResolver} from "@eas/resolver/ISchemaResolver.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {TrustedOracleArbiter} from "@src/arbiters/trusted-oracle/TrustedOracleArbiter.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract TrustedOracleArbiterTest is Test {
    TrustedOracleArbiter arbiter;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    bytes32 public testSchema;

    address oracle = address(0x123);
    bytes32 obligationUid = bytes32(uint256(1));

    address attester = makeAddr("attester");
    address recipient = makeAddr("recipient");
    address otherUser = makeAddr("otherUser");

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();
        arbiter = new TrustedOracleArbiter(eas);

        // Register a test schema
        testSchema = schemaRegistry.register("string item, bytes32 schema", ISchemaResolver(address(0)), true);
    }

    function _createAttestation(address _attester, address _recipient, bytes32 refUID) internal returns (bytes32) {
        vm.prank(_attester);
        return eas.attest(
            AttestationRequest({
                schema: testSchema,
                data: AttestationRequestData({
                    recipient: _recipient,
                    expirationTime: 0,
                    revocable: true,
                    refUID: refUID,
                    data: abi.encode("test"),
                    value: 0
                })
            })
        );
    }

    function testConstructor() public {
        // Create a new arbiter to test constructor
        TrustedOracleArbiter newArbiter = new TrustedOracleArbiter(eas);

        // Verify that the EAS address is set correctly
        // This is an indirect test since the eas variable is private
        // We'll test it through functionality
        Attestation memory attestation = Attestation({
            uid: obligationUid,
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

        TrustedOracleArbiter.DemandData memory demandData =
            TrustedOracleArbiter.DemandData({oracle: oracle, data: bytes("")});
        bytes memory demand = abi.encode(demandData);

        // Should return false initially since no decision has been made
        assertFalse(newArbiter.check(attestation, demand, bytes32(0)));
    }

    function testArbitrate() public {
        // Test that arbitrate function updates the decision
        vm.startPrank(oracle);

        bytes memory demandData = bytes("");

        // Initially the decision should be false (default value)
        assertFalse(
            arbiter.check(
                Attestation({
                    uid: obligationUid,
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
                abi.encode(TrustedOracleArbiter.DemandData({oracle: oracle, data: demandData})),
                bytes32(0)
            )
        );

        // Expect the ArbitrationMade event to be emitted
        bytes32 expectedKey = keccak256(abi.encodePacked(obligationUid, demandData));
        vm.expectEmit(true, true, true, true);
        emit TrustedOracleArbiter.ArbitrationMade(expectedKey, obligationUid, oracle, true);

        // Make a positive arbitration decision
        arbiter.arbitrate(obligationUid, demandData, true);

        // Now the decision should be true
        assertTrue(
            arbiter.check(
                Attestation({
                    uid: obligationUid,
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
                abi.encode(TrustedOracleArbiter.DemandData({oracle: oracle, data: demandData})),
                bytes32(0)
            )
        );

        vm.stopPrank();
    }

    function testCheckObligationWithDifferentOracles() public {
        // Set up two different oracles with different decisions
        address oracle1 = address(0x123);
        address oracle2 = address(0x456);
        // Use the class-level obligationUid

        bytes memory demandData = bytes("");

        // Oracle 1 makes a positive decision
        vm.prank(oracle1);
        arbiter.arbitrate(obligationUid, demandData, true);

        // Oracle 2 makes a negative decision
        vm.prank(oracle2);
        arbiter.arbitrate(obligationUid, demandData, false);

        // Create the attestation
        Attestation memory attestation = Attestation({
            uid: obligationUid,
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
            arbiter.check(
                attestation,
                abi.encode(TrustedOracleArbiter.DemandData({oracle: oracle1, data: demandData})),
                bytes32(0)
            )
        );

        // Check with oracle2 - should be false
        assertFalse(
            arbiter.check(
                attestation,
                abi.encode(TrustedOracleArbiter.DemandData({oracle: oracle2, data: demandData})),
                bytes32(0)
            )
        );
    }

    function testCheckObligationWithNoDecision() public {
        // Test with an oracle that hasn't made a decision
        address newOracle = address(0x789);
        // Use the class-level obligationUid

        // Create the attestation
        Attestation memory attestation = Attestation({
            uid: obligationUid,
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
            arbiter.check(
                attestation,
                abi.encode(TrustedOracleArbiter.DemandData({oracle: newOracle, data: bytes("")})),
                bytes32(0)
            )
        );
    }

    function testArbitrateWithDifferentDemands() public {
        // Test that decisions are scoped by demand data
        vm.startPrank(oracle);

        bytes memory demandData1 = bytes("demand1");
        bytes memory demandData2 = bytes("demand2");

        // Make a positive decision for demand1
        arbiter.arbitrate(obligationUid, demandData1, true);

        // Make a negative decision for demand2
        arbiter.arbitrate(obligationUid, demandData2, false);

        Attestation memory attestation = Attestation({
            uid: obligationUid,
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

        // Check with demand1 - should be true
        assertTrue(
            arbiter.check(
                attestation,
                abi.encode(TrustedOracleArbiter.DemandData({oracle: oracle, data: demandData1})),
                bytes32(0)
            )
        );

        // Check with demand2 - should be false
        assertFalse(
            arbiter.check(
                attestation,
                abi.encode(TrustedOracleArbiter.DemandData({oracle: oracle, data: demandData2})),
                bytes32(0)
            )
        );

        vm.stopPrank();
    }

    function testRequestArbitrationAsAttester() public {
        // Create a real attestation
        bytes32 realObligationUid = _createAttestation(attester, recipient, bytes32(0));
        bytes memory demand = bytes("some demand");

        // Request arbitration as the attester
        vm.prank(attester);
        vm.expectEmit(true, true, false, true);
        emit TrustedOracleArbiter.ArbitrationRequested(realObligationUid, oracle, demand);
        arbiter.requestArbitration(realObligationUid, oracle, demand);
    }

    function testRequestArbitrationAsRecipient() public {
        // Create a real attestation
        bytes32 realObligationUid = _createAttestation(attester, recipient, bytes32(0));
        bytes memory demand = bytes("some demand");

        // Request arbitration as the recipient
        vm.prank(recipient);
        vm.expectEmit(true, true, false, true);
        emit TrustedOracleArbiter.ArbitrationRequested(realObligationUid, oracle, demand);
        arbiter.requestArbitration(realObligationUid, oracle, demand);
    }

    function testRequestArbitrationUnauthorized() public {
        // Create a real attestation
        bytes32 realObligationUid = _createAttestation(attester, recipient, bytes32(0));
        bytes memory demand = bytes("some demand");

        // Try to request arbitration as someone who is neither attester nor recipient
        vm.prank(otherUser);
        vm.expectRevert(TrustedOracleArbiter.UnauthorizedArbitrationRequest.selector);
        arbiter.requestArbitration(realObligationUid, oracle, demand);
    }

    function testRequestArbitrationWithNoRecipient() public {
        // Create an attestation with no recipient (address(0))
        bytes32 realObligationUid = _createAttestation(attester, address(0), bytes32(0));
        bytes memory demand = bytes("some demand");

        // Request arbitration as the attester should work
        vm.prank(attester);
        vm.expectEmit(true, true, false, true);
        emit TrustedOracleArbiter.ArbitrationRequested(realObligationUid, oracle, demand);
        arbiter.requestArbitration(realObligationUid, oracle, demand);

        // Request arbitration as otherUser should fail
        vm.prank(otherUser);
        vm.expectRevert(TrustedOracleArbiter.UnauthorizedArbitrationRequest.selector);
        arbiter.requestArbitration(realObligationUid, oracle, demand);
    }
}
