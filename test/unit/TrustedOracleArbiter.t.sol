// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../../src/IArbiter.sol";
import {TrustedOracleArbiter} from "../../src/arbiters/TrustedOracleArbiter.sol";
import {IEAS} from "@eas/IEAS.sol";

contract MockEAS is IEAS {
    function attest(IEAS.AttestationRequest calldata request) external payable returns (bytes32) {
        return bytes32(0);
    }

    function attestByDelegation(IEAS.DelegatedAttestationRequest calldata request) external payable returns (bytes32) {
        return bytes32(0);
    }

    function revoke(IEAS.RevocationRequest calldata request) external payable {
        // Do nothing
    }

    function revokeByDelegation(IEAS.DelegatedRevocationRequest calldata request) external payable {
        // Do nothing
    }

    function multiAttest(IEAS.AttestationRequest[] calldata requests) external payable returns (bytes32[] memory) {
        bytes32[] memory uids = new bytes32[](requests.length);
        return uids;
    }

    function multiAttestByDelegation(IEAS.DelegatedAttestationRequest[] calldata requests) external payable returns (bytes32[] memory) {
        bytes32[] memory uids = new bytes32[](requests.length);
        return uids;
    }

    function multiRevoke(IEAS.RevocationRequest[] calldata requests) external payable {
        // Do nothing
    }

    function multiRevokeByDelegation(IEAS.DelegatedRevocationRequest[] calldata requests) external payable {
        // Do nothing
    }

    function getAttestation(bytes32 uid) external view returns (Attestation memory) {
        return Attestation({
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
    }

    function getTimestamp() external view returns (uint64) {
        return uint64(block.timestamp);
    }

    function getRevokeOffchain(address revoker, bytes32 data) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(revoker, data));
    }

    function getSchemaRegistry() external view returns (address) {
        return address(0);
    }

    function getAttestTypeHash() external pure returns (bytes32) {
        return keccak256("AttestationRequest(bytes32 schema,address recipient,uint64 expirationTime,bool revocable,bytes32 refUID,bytes data,uint256 value)");
    }

    function getRevokeTypeHash() external pure returns (bytes32) {
        return keccak256("RevocationRequest(bytes32 schema,bytes32 uid,uint256 value)");
    }
}

contract TrustedOracleArbiterTest is Test {
    TrustedOracleArbiter arbiter;
    MockEAS mockEAS;
    address oracle = address(0x123);
    bytes32 statementUid = bytes32(uint256(1));
    
    function setUp() public {
        mockEAS = new MockEAS();
        arbiter = new TrustedOracleArbiter(mockEAS);
    }
    
    function testConstructor() public {
        // Create a new arbiter to test constructor
        TrustedOracleArbiter newArbiter = new TrustedOracleArbiter(mockEAS);
        
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
        
        TrustedOracleArbiter.DemandData memory demandData = TrustedOracleArbiter.DemandData({
            oracle: oracle
        });
        bytes memory demand = abi.encode(demandData);
        
        // Should return false initially since no decision has been made
        assertFalse(newArbiter.checkStatement(attestation, demand, bytes32(0)));
    }
    
    function testArbitrate() public {
        // Test that arbitrate function updates the decision
        vm.startPrank(oracle);
        
        // Initially the decision should be false (default value)
        assertFalse(arbiter.checkStatement(
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
            abi.encode(TrustedOracleArbiter.DemandData({
                oracle: oracle
            })),
            bytes32(0)
        ));
        
        // Expect the ArbitrationMade event to be emitted
        vm.expectEmit(true, true, false, true);
        emit TrustedOracleArbiter.ArbitrationMade(oracle, statementUid, true);
        
        // Make a positive arbitration decision
        arbiter.arbitrate(statementUid, true);
        
        // Now the decision should be true
        assertTrue(arbiter.checkStatement(
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
            abi.encode(TrustedOracleArbiter.DemandData({
                oracle: oracle
            })),
            bytes32(0)
        ));
        
        vm.stopPrank();
    }
    
    function testCheckStatementWithDifferentOracles() public {
        // Set up two different oracles with different decisions
        address oracle1 = address(0x123);
        address oracle2 = address(0x456);
        bytes32 statementUid = bytes32(uint256(1));
        
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
        assertTrue(arbiter.checkStatement(
            attestation,
            abi.encode(TrustedOracleArbiter.DemandData({
                oracle: oracle1
            })),
            bytes32(0)
        ));
        
        // Check with oracle2 - should be false
        assertFalse(arbiter.checkStatement(
            attestation,
            abi.encode(TrustedOracleArbiter.DemandData({
                oracle: oracle2
            })),
            bytes32(0)
        ));
    }
    
    function testCheckStatementWithNoDecision() public {
        // Test with an oracle that hasn't made a decision
        address newOracle = address(0x789);
        bytes32 statementUid = bytes32(uint256(1));
        
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
        assertFalse(arbiter.checkStatement(
            attestation,
            abi.encode(TrustedOracleArbiter.DemandData({
                oracle: newOracle
            })),
            bytes32(0)
        ));
    }
}
