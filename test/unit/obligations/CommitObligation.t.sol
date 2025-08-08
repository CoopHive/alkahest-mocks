// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {CommitObligation} from "@src/obligations/CommitObligation.sol";
import {IEAS, Attestation} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract CommitObligationTest is Test {
    CommitObligation public commitObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    address internal testUser;
    address internal anotherUser;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        testUser = makeAddr("testUser");
        anotherUser = makeAddr("anotherUser");
        commitObligation = new CommitObligation(eas, schemaRegistry);
    }

    function testConstructor() public view {
        // Check schema registration
        bytes32 schemaId = commitObligation.ATTESTATION_SCHEMA();
        assertNotEq(schemaId, bytes32(0), "Schema should be registered");

        // Verify schema details
        SchemaRecord memory schema = commitObligation.getSchema();
        assertEq(schema.uid, schemaId, "Schema UID should match");
        assertEq(schema.schema, "string commitHash,uint8 commitAlgo,string[] hosts", "Schema string should match");
    }

    function testDoObligationWithSha256() public {
        // Setup test data with SHA256
        string[] memory hosts = new string[](2);
        hosts[0] = "host1.example.com";
        hosts[1] = "host2.example.com";

        CommitObligation.ObligationData memory data = CommitObligation
            .ObligationData({
                commitHash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
                commitAlgo: CommitObligation.CommitAlgo.Sha256,
                hosts: hosts
            });

        // Make an obligation
        vm.prank(testUser);
        bytes32 attestationId = commitObligation.doObligation(data, bytes32(0));
        
        // Verify attestation exists
        assertNotEq(attestationId, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = eas.getAttestation(attestationId);
        assertEq(
            attestation.schema,
            commitObligation.ATTESTATION_SCHEMA(),
            "Schema should match"
        );
        assertEq(
            attestation.recipient,
            testUser,
            "Recipient should be the test user"
        );
        assertEq(
            attestation.attester,
            address(commitObligation),
            "Attester should be the contract itself"
        );

        // Decode and verify data using getObligationData
        CommitObligation.ObligationData memory retrievedData = commitObligation.getObligationData(attestationId);
        assertEq(
            retrievedData.commitHash,
            "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
            "Commit hash should match"
        );
        assertEq(
            uint8(retrievedData.commitAlgo),
            uint8(CommitObligation.CommitAlgo.Sha256),
            "Commit algorithm should be SHA256"
        );
        assertEq(retrievedData.hosts.length, 2, "Should have 2 hosts");
        assertEq(retrievedData.hosts[0], "host1.example.com", "First host should match");
        assertEq(retrievedData.hosts[1], "host2.example.com", "Second host should match");
    }

    function testDoObligationWithSha1() public {
        // Setup test data with SHA1
        string[] memory hosts = new string[](1);
        hosts[0] = "single-host.example.com";

        CommitObligation.ObligationData memory data = CommitObligation
            .ObligationData({
                commitHash: "da39a3ee5e6b4b0d3255bfef95601890afd80709",
                commitAlgo: CommitObligation.CommitAlgo.Sha1,
                hosts: hosts
            });

        // Make an obligation
        vm.prank(anotherUser);
        bytes32 attestationId = commitObligation.doObligation(data, bytes32(0));
        
        // Verify attestation exists
        assertNotEq(attestationId, bytes32(0), "Attestation should be created");

        // Decode and verify data
        CommitObligation.ObligationData memory retrievedData = commitObligation.getObligationData(attestationId);
        assertEq(
            retrievedData.commitHash,
            "da39a3ee5e6b4b0d3255bfef95601890afd80709",
            "Commit hash should match"
        );
        assertEq(
            uint8(retrievedData.commitAlgo),
            uint8(CommitObligation.CommitAlgo.Sha1),
            "Commit algorithm should be SHA1"
        );
        assertEq(retrievedData.hosts.length, 1, "Should have 1 host");
        assertEq(retrievedData.hosts[0], "single-host.example.com", "Host should match");
    }

    function testDoObligationWithEmptyHosts() public {
        // Setup test data with empty hosts array
        string[] memory hosts = new string[](0);

        CommitObligation.ObligationData memory data = CommitObligation
            .ObligationData({
                commitHash: "0123456789abcdef0123456789abcdef01234567",
                commitAlgo: CommitObligation.CommitAlgo.Sha1,
                hosts: hosts
            });

        // Make an obligation
        vm.prank(testUser);
        bytes32 attestationId = commitObligation.doObligation(data, bytes32(0));
        
        // Verify attestation exists
        assertNotEq(attestationId, bytes32(0), "Attestation should be created");

        // Verify empty hosts array
        CommitObligation.ObligationData memory retrievedData = commitObligation.getObligationData(attestationId);
        assertEq(retrievedData.hosts.length, 0, "Should have no hosts");
    }

    function testDoObligationWithRefUID() public {
        // First create a reference obligation
        string[] memory hosts1 = new string[](1);
        hosts1[0] = "ref-host.example.com";

        CommitObligation.ObligationData memory refData = CommitObligation
            .ObligationData({
                commitHash: "reference123456789abcdef",
                commitAlgo: CommitObligation.CommitAlgo.Sha1,
                hosts: hosts1
            });

        vm.prank(testUser);
        bytes32 refAttestationId = commitObligation.doObligation(refData, bytes32(0));

        // Now create a second obligation referencing the first
        string[] memory hosts2 = new string[](1);
        hosts2[0] = "child-host.example.com";

        CommitObligation.ObligationData memory childData = CommitObligation
            .ObligationData({
                commitHash: "child123456789abcdef",
                commitAlgo: CommitObligation.CommitAlgo.Sha256,
                hosts: hosts2
            });

        vm.prank(anotherUser);
        bytes32 childAttestationId = commitObligation.doObligation(childData, refAttestationId);

        // Verify the reference relationship
        Attestation memory childAttestation = eas.getAttestation(childAttestationId);
        assertEq(childAttestation.refUID, refAttestationId, "Reference UID should match");
    }

    function testDecodeObligationData() public view {
        // Setup test data
        string[] memory hosts = new string[](2);
        hosts[0] = "decode-host1.example.com";
        hosts[1] = "decode-host2.example.com";

        CommitObligation.ObligationData memory originalData = CommitObligation
            .ObligationData({
                commitHash: "decodetest123456789abcdef",
                commitAlgo: CommitObligation.CommitAlgo.Sha256,
                hosts: hosts
            });

        // Encode the data
        bytes memory encodedData = abi.encode(originalData);

        // Decode using the contract function
        CommitObligation.ObligationData memory decodedData = commitObligation.decodeObligationData(encodedData);

        // Verify decoded data matches original
        assertEq(decodedData.commitHash, originalData.commitHash, "Commit hash should match");
        assertEq(uint8(decodedData.commitAlgo), uint8(originalData.commitAlgo), "Commit algorithm should match");
        assertEq(decodedData.hosts.length, originalData.hosts.length, "Hosts array length should match");
        for (uint i = 0; i < decodedData.hosts.length; i++) {
            assertEq(decodedData.hosts[i], originalData.hosts[i], "Host should match");
        }
    }

    function testCommitAlgoEnum() public pure {
        // Test enum values
        assertEq(uint8(CommitObligation.CommitAlgo.Sha1), 0, "SHA1 should be 0");
        assertEq(uint8(CommitObligation.CommitAlgo.Sha256), 1, "SHA256 should be 1");
    }

    function testMultipleObligations() public {
        // Create multiple obligations to test uniqueness
        string[] memory hosts = new string[](1);
        hosts[0] = "multi-host.example.com";

        CommitObligation.ObligationData memory data1 = CommitObligation
            .ObligationData({
                commitHash: "first123456789abcdef",
                commitAlgo: CommitObligation.CommitAlgo.Sha1,
                hosts: hosts
            });

        CommitObligation.ObligationData memory data2 = CommitObligation
            .ObligationData({
                commitHash: "second123456789abcdef",
                commitAlgo: CommitObligation.CommitAlgo.Sha256,
                hosts: hosts
            });

        // Create obligations from different users
        vm.prank(testUser);
        bytes32 attestationId1 = commitObligation.doObligation(data1, bytes32(0));

        vm.prank(anotherUser);
        bytes32 attestationId2 = commitObligation.doObligation(data2, bytes32(0));

        // Verify they are different
        assertNotEq(attestationId1, attestationId2, "Attestation IDs should be different");

        // Verify data integrity for both
        CommitObligation.ObligationData memory retrieved1 = commitObligation.getObligationData(attestationId1);
        CommitObligation.ObligationData memory retrieved2 = commitObligation.getObligationData(attestationId2);

        assertEq(retrieved1.commitHash, "first123456789abcdef", "First commit hash should match");
        assertEq(retrieved2.commitHash, "second123456789abcdef", "Second commit hash should match");
        assertEq(uint8(retrieved1.commitAlgo), uint8(CommitObligation.CommitAlgo.Sha1), "First algo should be SHA1");
        assertEq(uint8(retrieved2.commitAlgo), uint8(CommitObligation.CommitAlgo.Sha256), "Second algo should be SHA256");
    }
}
