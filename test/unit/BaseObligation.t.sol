// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {BaseObligation} from "@src/BaseObligation.sol";
import {BaseAttester} from "@src/BaseAttester.sol";
import {SchemaResolver} from "@eas/resolver/SchemaResolver.sol";
import {IEAS, Attestation, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

// Mock implementation of BaseObligation for testing
contract MockBaseObligation is BaseObligation {
    // Track calls to hooks for testing
    bool public beforeAttestCalled;
    bool public afterAttestCalled;
    bytes public lastBeforeAttestData;
    address public lastBeforeAttestPayer;
    address public lastBeforeAttestRecipient;
    bytes32 public lastAfterAttestUid;
    bytes public lastAfterAttestData;
    address public lastAfterAttestPayer;
    address public lastAfterAttestRecipient;

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    ) BaseObligation(_eas, _schemaRegistry, "string data", true) {}

    // Override hooks to track calls
    function _beforeAttest(
        bytes calldata data,
        address payer,
        address recipient
    ) internal override {
        beforeAttestCalled = true;
        lastBeforeAttestData = data;
        lastBeforeAttestPayer = payer;
        lastBeforeAttestRecipient = recipient;
    }

    function _afterAttest(
        bytes32 uid,
        bytes calldata data,
        address payer,
        address recipient
    ) internal override {
        afterAttestCalled = true;
        lastAfterAttestUid = uid;
        lastAfterAttestData = data;
        lastAfterAttestPayer = payer;
        lastAfterAttestRecipient = recipient;
    }

    // Public wrapper for onAttest for testing
    function testOnAttest(
        Attestation calldata attestation,
        uint256 value
    ) public view returns (bool) {
        return onAttest(attestation, value);
    }

    // Public wrapper for onRevoke for testing
    function testOnRevoke(
        Attestation calldata attestation,
        uint256 value
    ) public view returns (bool) {
        return onRevoke(attestation, value);
    }

    // Reset tracking variables
    function resetTracking() public {
        beforeAttestCalled = false;
        afterAttestCalled = false;
        lastBeforeAttestData = "";
        lastBeforeAttestPayer = address(0);
        lastBeforeAttestRecipient = address(0);
        lastAfterAttestUid = bytes32(0);
        lastAfterAttestData = "";
        lastAfterAttestPayer = address(0);
        lastAfterAttestRecipient = address(0);
    }
}

contract BaseObligationTest is Test {
    MockBaseObligation public baseObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    address public testUser;
    address public testRecipient;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        baseObligation = new MockBaseObligation(eas, schemaRegistry);
        testUser = makeAddr("testUser");
        testRecipient = makeAddr("testRecipient");
    }

    function testConstructor() public view {
        // Verify the schema was registered
        bytes32 schemaId = baseObligation.ATTESTATION_SCHEMA();
        assertNotEq(schemaId, bytes32(0), "Schema should be registered");

        // Verify schema details
        SchemaRecord memory schema = baseObligation.getSchema();
        assertEq(schema.uid, schemaId, "Schema UID should match");
        assertEq(schema.schema, "string data", "Schema string should match");
        assertTrue(schema.revocable, "Schema should be revocable");
    }

    function testDoObligationRaw() public {
        bytes memory testData = abi.encode("test obligation");
        uint64 expirationTime = uint64(block.timestamp + 1 days);
        bytes32 refUID = bytes32(uint256(123));

        vm.startPrank(testUser);

        // Mock the eas.attest call to return a UID
        bytes32 expectedUID = keccak256("test_uid");
        vm.mockCall(
            address(eas),
            abi.encodeWithSelector(IEAS.attest.selector),
            abi.encode(expectedUID)
        );

        bytes32 uid = baseObligation.doObligationRaw(
            testData,
            expirationTime,
            refUID
        );

        vm.stopPrank();

        // Verify the UID matches
        assertEq(uid, expectedUID, "UID should match expected");

        // Verify hooks were called
        assertTrue(
            baseObligation.beforeAttestCalled(),
            "beforeAttest should be called"
        );
        assertTrue(
            baseObligation.afterAttestCalled(),
            "afterAttest should be called"
        );

        // Verify hook parameters
        assertEq(
            baseObligation.lastBeforeAttestData(),
            testData,
            "Before data should match"
        );
        assertEq(
            baseObligation.lastBeforeAttestPayer(),
            testUser,
            "Before payer should match"
        );
        assertEq(
            baseObligation.lastBeforeAttestRecipient(),
            testUser,
            "Before recipient should match"
        );

        assertEq(
            baseObligation.lastAfterAttestUid(),
            expectedUID,
            "After UID should match"
        );
        assertEq(
            baseObligation.lastAfterAttestData(),
            testData,
            "After data should match"
        );
        assertEq(
            baseObligation.lastAfterAttestPayer(),
            testUser,
            "After payer should match"
        );
        assertEq(
            baseObligation.lastAfterAttestRecipient(),
            testUser,
            "After recipient should match"
        );
    }

    function testDoObligationForRaw() public {
        bytes memory testData = abi.encode("test obligation for someone");
        uint64 expirationTime = uint64(block.timestamp + 2 days);
        bytes32 refUID = bytes32(uint256(456));

        vm.startPrank(testUser);

        // Mock the eas.attest call to return a UID
        bytes32 expectedUID = keccak256("test_uid_for");
        vm.mockCall(
            address(eas),
            abi.encodeWithSelector(IEAS.attest.selector),
            abi.encode(expectedUID)
        );

        bytes32 uid = baseObligation.doObligationForRaw(
            testData,
            expirationTime,
            testUser, // payer
            testRecipient, // recipient
            refUID
        );

        vm.stopPrank();

        // Verify the UID matches
        assertEq(uid, expectedUID, "UID should match expected");

        // Verify hooks were called with correct parameters
        assertEq(
            baseObligation.lastBeforeAttestPayer(),
            testUser,
            "Before payer should match"
        );
        assertEq(
            baseObligation.lastBeforeAttestRecipient(),
            testRecipient,
            "Before recipient should match"
        );
        assertEq(
            baseObligation.lastAfterAttestRecipient(),
            testRecipient,
            "After recipient should match"
        );
    }

    function testOnAttest() public {
        // Create a test attestation from the obligation contract
        Attestation memory validAttestation = Attestation({
            uid: bytes32(0),
            schema: baseObligation.ATTESTATION_SCHEMA(),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(baseObligation),
            revocable: true,
            data: bytes("")
        });

        // Create an invalid attestation (not from obligation contract)
        Attestation memory invalidAttestation = Attestation({
            uid: bytes32(0),
            schema: baseObligation.ATTESTATION_SCHEMA(),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: testUser, // Different attester
            revocable: true,
            data: bytes("")
        });

        assertTrue(
            baseObligation.testOnAttest(validAttestation, 0),
            "onAttest should return true for valid attestation"
        );
        assertFalse(
            baseObligation.testOnAttest(invalidAttestation, 0),
            "onAttest should return false for invalid attestation"
        );
    }

    function testOnRevoke() public {
        // Create a test attestation from the obligation contract
        Attestation memory validAttestation = Attestation({
            uid: bytes32(0),
            schema: baseObligation.ATTESTATION_SCHEMA(),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: address(baseObligation),
            revocable: true,
            data: bytes("")
        });

        // Create an invalid attestation (not from obligation contract)
        Attestation memory invalidAttestation = Attestation({
            uid: bytes32(0),
            schema: baseObligation.ATTESTATION_SCHEMA(),
            time: uint64(block.timestamp),
            expirationTime: uint64(0),
            revocationTime: uint64(0),
            refUID: bytes32(0),
            recipient: address(0),
            attester: testUser, // Different attester
            revocable: true,
            data: bytes("")
        });

        assertTrue(
            baseObligation.testOnRevoke(validAttestation, 0),
            "onRevoke should return true for valid attestation"
        );
        assertFalse(
            baseObligation.testOnRevoke(invalidAttestation, 0),
            "onRevoke should return false for invalid attestation"
        );
    }

    function testHookOrdering() public {
        bytes memory testData = abi.encode("hook test");

        vm.startPrank(testUser);

        // Reset tracking
        baseObligation.resetTracking();

        // Mock the eas.attest call
        bytes32 expectedUID = keccak256("hook_test_uid");
        vm.mockCall(
            address(eas),
            abi.encodeWithSelector(IEAS.attest.selector),
            abi.encode(expectedUID)
        );

        // Ensure hooks are not called yet
        assertFalse(
            baseObligation.beforeAttestCalled(),
            "beforeAttest should not be called yet"
        );
        assertFalse(
            baseObligation.afterAttestCalled(),
            "afterAttest should not be called yet"
        );

        // Call doObligationRaw
        baseObligation.doObligationRaw(testData, 0, bytes32(0));

        // Verify both hooks were called
        assertTrue(
            baseObligation.beforeAttestCalled(),
            "beforeAttest should be called"
        );
        assertTrue(
            baseObligation.afterAttestCalled(),
            "afterAttest should be called"
        );

        vm.stopPrank();
    }
}
