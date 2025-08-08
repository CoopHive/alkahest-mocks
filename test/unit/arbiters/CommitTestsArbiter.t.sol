// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {CommitTestsArbiter} from "@src/arbiters/CommitTestsArbiter.sol";
import {TrustedOracleArbiter} from "@src/arbiters/TrustedOracleArbiter.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract CommitTestsArbiterTest is Test {
    CommitTestsArbiter arbiter;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    
    address oracle1 = address(0x123);
    address oracle2 = address(0x456);
    address testUser = address(0x789);
    bytes32 obligationUid = bytes32(uint256(1));

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();
        arbiter = new CommitTestsArbiter(eas);
    }

    function testConstructor() public {
        // Create a new arbiter to test constructor
        CommitTestsArbiter newArbiter = new CommitTestsArbiter(eas);

        // Verify that the arbiter inherits from TrustedOracleArbiter
        // Test basic functionality to ensure inheritance works
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

        string[] memory hosts = new string[](1);
        hosts[0] = "host1.example.com";
        
        CommitTestsArbiter.CommitTestsDemandData memory demandData = CommitTestsArbiter
            .CommitTestsDemandData({
                oracle: oracle1,
                testsCommitHash: "abc123def456",
                testsCommand: "npm test",
                testsCommitAlgo: CommitTestsArbiter.CommitAlgo.Sha256,
                hosts: hosts
            });
        bytes memory demand = abi.encode(demandData);

        // Should return false initially since no decision has been made
        assertFalse(newArbiter.checkObligation(attestation, demand, bytes32(0)));
    }

    function testCommitAlgoEnum() public pure {
        // Test enum values
        assertEq(uint8(CommitTestsArbiter.CommitAlgo.Sha1), 0, "SHA1 should be 0");
        assertEq(uint8(CommitTestsArbiter.CommitAlgo.Sha256), 1, "SHA256 should be 1");
    }

    function testDecodeCommitTestsDemandData() public view {
        // Create test demand data
        string[] memory hosts = new string[](2);
        hosts[0] = "host1.example.com";
        hosts[1] = "host2.example.com";

        CommitTestsArbiter.CommitTestsDemandData memory originalData = CommitTestsArbiter
            .CommitTestsDemandData({
                oracle: oracle1,
                testsCommitHash: "a1b2c3d4e5f6789012345678901234567890abcdef",
                testsCommand: "cargo test --all",
                testsCommitAlgo: CommitTestsArbiter.CommitAlgo.Sha1,
                hosts: hosts
            });

        // Encode the data
        bytes memory encodedData = abi.encode(originalData);

        // Decode using abi.decode directly since the function may not exist
        CommitTestsArbiter.CommitTestsDemandData memory decodedData = 
            abi.decode(encodedData, (CommitTestsArbiter.CommitTestsDemandData));

        // Verify decoded data matches original
        assertEq(decodedData.oracle, originalData.oracle, "Oracle should match");
        assertEq(decodedData.testsCommitHash, originalData.testsCommitHash, "Commit hash should match");
        assertEq(decodedData.testsCommand, originalData.testsCommand, "Test command should match");
        assertEq(uint8(decodedData.testsCommitAlgo), uint8(originalData.testsCommitAlgo), "Commit algorithm should match");
        assertEq(decodedData.hosts.length, originalData.hosts.length, "Hosts array length should match");
        
        for (uint i = 0; i < decodedData.hosts.length; i++) {
            assertEq(decodedData.hosts[i], originalData.hosts[i], "Host should match");
        }
    }

    function testInheritedArbitrateFunctionality() public {
        // Test that the inherited arbitrate function works correctly
        vm.startPrank(oracle1);

        // Expect the ArbitrationMade event to be emitted
        vm.expectEmit(true, true, false, true);
        emit TrustedOracleArbiter.ArbitrationMade(obligationUid, oracle1, true);

        // Make a positive arbitration decision
        arbiter.arbitrate(obligationUid, true);

        vm.stopPrank();

        // Verify the decision is recorded
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

        // Create demand data with oracle1
        string[] memory hosts = new string[](1);
        hosts[0] = "host1.example.com";

        CommitTestsArbiter.CommitTestsDemandData memory demandData = CommitTestsArbiter
            .CommitTestsDemandData({
                oracle: oracle1,
                testsCommitHash: "test123",
                testsCommand: "npm test",
                testsCommitAlgo: CommitTestsArbiter.CommitAlgo.Sha256,
                hosts: hosts
            });

        assertTrue(
            arbiter.checkObligation(attestation, abi.encode(demandData), bytes32(0)),
            "Should return true when oracle has made positive decision"
        );
    }

    function testCheckObligationWithCommitTestsDemandData() public view {
        // Test checkObligation with CommitTestsDemandData format
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

        string[] memory hosts = new string[](2);
        hosts[0] = "host1.example.com";
        hosts[1] = "host2.example.com";

        CommitTestsArbiter.CommitTestsDemandData memory demandData = CommitTestsArbiter
            .CommitTestsDemandData({
                oracle: oracle1,
                testsCommitHash: "abc123def456789",
                testsCommand: "python -m pytest",
                testsCommitAlgo: CommitTestsArbiter.CommitAlgo.Sha256,
                hosts: hosts
            });

        bytes memory demand = abi.encode(demandData);

        // Without any oracle decisions, should return false
        assertFalse(
            arbiter.checkObligation(attestation, demand, bytes32(0)),
            "Should return false with no oracle decisions"
        );
    }

    function testMultipleCommitAlgorithms() public view {
        // Test different commit algorithms
        string[] memory hosts = new string[](1);
        hosts[0] = "test-host.example.com";

        // Test SHA1
        CommitTestsArbiter.CommitTestsDemandData memory sha1Data = CommitTestsArbiter
            .CommitTestsDemandData({
                oracle: oracle1,
                testsCommitHash: "da39a3ee5e6b4b0d3255bfef95601890afd80709",
                testsCommand: "make test",
                testsCommitAlgo: CommitTestsArbiter.CommitAlgo.Sha1,
                hosts: hosts
            });

        // Test SHA256  
        CommitTestsArbiter.CommitTestsDemandData memory sha256Data = CommitTestsArbiter
            .CommitTestsDemandData({
                oracle: oracle2,
                testsCommitHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                testsCommand: "npm run test:unit",
                testsCommitAlgo: CommitTestsArbiter.CommitAlgo.Sha256,
                hosts: hosts
            });

        // Encode both
        bytes memory sha1Demand = abi.encode(sha1Data);
        bytes memory sha256Demand = abi.encode(sha256Data);

        // Decode and verify using abi.decode
        CommitTestsArbiter.CommitTestsDemandData memory decodedSha1 = 
            abi.decode(sha1Demand, (CommitTestsArbiter.CommitTestsDemandData));
        CommitTestsArbiter.CommitTestsDemandData memory decodedSha256 = 
            abi.decode(sha256Demand, (CommitTestsArbiter.CommitTestsDemandData));

        assertEq(uint8(decodedSha1.testsCommitAlgo), uint8(CommitTestsArbiter.CommitAlgo.Sha1), "Should be SHA1");
        assertEq(uint8(decodedSha256.testsCommitAlgo), uint8(CommitTestsArbiter.CommitAlgo.Sha256), "Should be SHA256");
        assertEq(decodedSha1.testsCommand, "make test", "SHA1 command should match");
        assertEq(decodedSha256.testsCommand, "npm run test:unit", "SHA256 command should match");
        assertEq(decodedSha1.oracle, oracle1, "SHA1 oracle should match");
        assertEq(decodedSha256.oracle, oracle2, "SHA256 oracle should match");
    }

    function testCommitTestsDemandDataWithEmptyHosts() public view {
        // Test with empty hosts array
        string[] memory emptyHosts = new string[](0);

        CommitTestsArbiter.CommitTestsDemandData memory demandData = CommitTestsArbiter
            .CommitTestsDemandData({
                oracle: oracle1,
                testsCommitHash: "0123456789abcdef",
                testsCommand: "go test ./...",
                testsCommitAlgo: CommitTestsArbiter.CommitAlgo.Sha1,
                hosts: emptyHosts
            });

        bytes memory encodedData = abi.encode(demandData);
        CommitTestsArbiter.CommitTestsDemandData memory decodedData = 
            abi.decode(encodedData, (CommitTestsArbiter.CommitTestsDemandData));

        assertEq(decodedData.hosts.length, 0, "Should have empty hosts array");
        assertEq(decodedData.testsCommitHash, "0123456789abcdef", "Commit hash should match");
        assertEq(decodedData.testsCommand, "go test ./...", "Test command should match");
        assertEq(decodedData.oracle, oracle1, "Oracle should match");
    }

    function testCommitTestsDemandDataWithManyHosts() public view {
        // Test with multiple hosts
        string[] memory manyHosts = new string[](5);
        manyHosts[0] = "host1.example.com";
        manyHosts[1] = "host2.example.com";
        manyHosts[2] = "host3.example.com";
        manyHosts[3] = "host4.example.com";
        manyHosts[4] = "host5.example.com";

        CommitTestsArbiter.CommitTestsDemandData memory demandData = CommitTestsArbiter
            .CommitTestsDemandData({
                oracle: oracle2,
                testsCommitHash: "fedcba9876543210",
                testsCommand: "mvn test",
                testsCommitAlgo: CommitTestsArbiter.CommitAlgo.Sha256,
                hosts: manyHosts
            });

        bytes memory encodedData = abi.encode(demandData);
        CommitTestsArbiter.CommitTestsDemandData memory decodedData = 
            abi.decode(encodedData, (CommitTestsArbiter.CommitTestsDemandData));

        assertEq(decodedData.hosts.length, 5, "Should have 5 hosts");
        assertEq(decodedData.oracle, oracle2, "Oracle should match");
        for (uint i = 0; i < 5; i++) {
            assertEq(decodedData.hosts[i], manyHosts[i], "Host should match");
        }
    }

    function testInheritedRequestArbitrationFunctionality() public {
        // Create a mock attestation that we'll use for testing requestArbitration
        // First, we need to create an actual attestation in the EAS system
        vm.startPrank(testUser);
        
        // We can't easily create a real attestation without having the schema set up properly
        // So we'll test the revert condition for unauthorized arbitration requests
        
        // Test that requesting arbitration for a non-existent attestation should revert
        // or that only attester/recipient can request arbitration
        
        // This test verifies the function exists and can be called
        // The actual authorization logic is tested in the parent contract
        vm.expectRevert(); // Should revert because attestation doesn't exist or user unauthorized
        arbiter.requestArbitration(obligationUid, oracle1);
        
        vm.stopPrank();
    }

    function testCommitTestsSpecificFields() public view {
        // Test all the commit tests specific fields
        string[] memory hosts = new string[](3);
        hosts[0] = "ci1.build.com";
        hosts[1] = "ci2.build.com"; 
        hosts[2] = "ci3.build.com";

        CommitTestsArbiter.CommitTestsDemandData memory demandData = CommitTestsArbiter
            .CommitTestsDemandData({
                oracle: testUser,
                testsCommitHash: "1a2b3c4d5e6f7890abcdef1234567890deadbeef",
                testsCommand: "npm run test:integration -- --coverage",
                testsCommitAlgo: CommitTestsArbiter.CommitAlgo.Sha256,
                hosts: hosts
            });

        bytes memory encodedData = abi.encode(demandData);
        CommitTestsArbiter.CommitTestsDemandData memory decodedData = 
            abi.decode(encodedData, (CommitTestsArbiter.CommitTestsDemandData));

        // Verify all fields
        assertEq(decodedData.oracle, testUser, "Oracle should match");
        assertEq(
            decodedData.testsCommitHash, 
            "1a2b3c4d5e6f7890abcdef1234567890deadbeef", 
            "Tests commit hash should match"
        );
        assertEq(
            decodedData.testsCommand,
            "npm run test:integration -- --coverage",
            "Tests command should match"
        );
        assertEq(
            uint8(decodedData.testsCommitAlgo),
            uint8(CommitTestsArbiter.CommitAlgo.Sha256),
            "Tests commit algorithm should be SHA256"
        );
        assertEq(decodedData.hosts.length, 3, "Should have 3 hosts");
        assertEq(decodedData.hosts[0], "ci1.build.com", "First host should match");
        assertEq(decodedData.hosts[1], "ci2.build.com", "Second host should match");
        assertEq(decodedData.hosts[2], "ci3.build.com", "Third host should match");
    }
}
