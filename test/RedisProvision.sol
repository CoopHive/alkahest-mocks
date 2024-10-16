// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {RedisProvisionObligation} from "../src/Statements/RedisProvisionObligation.sol";
import {
    IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData
} from "@eas/IEAS.sol";
import {Attestation} from "@eas/Common.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";

contract RedisProvisionObligationTest is Test {
    RedisProvisionObligation public provisionObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    address public constant EAS_ADDRESS = 0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS = 0xA7b39296258348C78294F95B872b282326A97BDF;

    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        // Fork Ethereum mainnet to test in a real environment
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        // Set the actual EAS and Schema Registry addresses
        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        // Deploy RedisProvisionObligation contract
        provisionObligation = new RedisProvisionObligation(eas, schemaRegistry);
    }

    function testAliceCanMakeNewProvisionStatement() public {
        vm.startPrank(alice);

        // Create a new provision statement for Redis
        RedisProvisionObligation.StatementData memory statementData = RedisProvisionObligation.StatementData({
            user: alice,
            capacity: 1024 * 1024 * 1024, // 1 GB
            ingress: 500 * 1024 * 1024, // 500 MB
            egress: 500 * 1024 * 1024, // 500 MB
            expiration: uint64(block.timestamp + 30 days),
            url: "redis://example.com:6379"
        });

        bytes32 statementUID = provisionObligation.makeStatement(statementData);

        // Retrieve the attestation and verify it matches the input data
        Attestation memory attestation = eas.getAttestation(statementUID);
        RedisProvisionObligation.StatementData memory retrievedData =
            abi.decode(attestation.data, (RedisProvisionObligation.StatementData));

        assertEq(retrievedData.user, statementData.user, "User should match");
        assertEq(retrievedData.capacity, statementData.capacity, "Capacity should match");
        assertEq(retrievedData.ingress, statementData.ingress, "Ingress should match");
        assertEq(retrievedData.egress, statementData.egress, "Egress should match");
        assertEq(retrievedData.expiration, statementData.expiration, "Expiration should match");
        assertEq(retrievedData.url, statementData.url, "URL should match");

        vm.stopPrank();
    }

    function testAliceCanUpdateProvisionStatement() public {
        vm.startPrank(alice);

        // Create initial provision statement
        RedisProvisionObligation.StatementData memory statementData = RedisProvisionObligation.StatementData({
            user: alice,
            capacity: 1024 * 1024 * 1024, // 1 GB
            ingress: 500 * 1024 * 1024, // 500 MB
            egress: 500 * 1024 * 1024, // 500 MB
            expiration: uint64(block.timestamp + 30 days),
            url: "redis://example.com:6379"
        });

        bytes32 initialUID = provisionObligation.makeStatement(statementData);

        // Update the provision statement (increase capacity and expiration)
        RedisProvisionObligation.ChangeData memory changeData = RedisProvisionObligation.ChangeData({
            addedCapacity: 512 * 1024 * 1024, // Add 512 MB
            addedIngress: 100 * 1024 * 1024, // Add 100 MB
            addedEgress: 100 * 1024 * 1024, // Add 100 MB
            addedDuration: uint64(15 days), // Extend by 15 days
            newUrl: "" // No change to URL
        });

        bytes32 updatedUID = provisionObligation.reviseStatement(initialUID, changeData);

        // Retrieve the updated attestation
        Attestation memory updatedAttestation = eas.getAttestation(updatedUID);
        RedisProvisionObligation.StatementData memory updatedData =
            abi.decode(updatedAttestation.data, (RedisProvisionObligation.StatementData));

        // Check that the updates were applied
        assertEq(updatedData.capacity, statementData.capacity + changeData.addedCapacity, "Capacity should be updated");
        assertEq(updatedData.ingress, statementData.ingress + changeData.addedIngress, "Ingress should be updated");
        assertEq(updatedData.egress, statementData.egress + changeData.addedEgress, "Egress should be updated");
        assertEq(
            updatedData.expiration, statementData.expiration + changeData.addedDuration, "Expiration should be updated"
        );
        assertEq(updatedData.url, statementData.url, "URL should remain the same");

        vm.stopPrank();
    }

    function testAliceCanUpdateIndividualParams() public {
        vm.startPrank(alice);

        // Create initial provision statement
        RedisProvisionObligation.StatementData memory statementData = RedisProvisionObligation.StatementData({
            user: alice,
            capacity: 1024 * 1024 * 1024, // 1 GB
            ingress: 500 * 1024 * 1024, // 500 MB
            egress: 500 * 1024 * 1024, // 500 MB
            expiration: uint64(block.timestamp + 30 days),
            url: "redis://example.com:6379"
        });

        bytes32 initialUID = provisionObligation.makeStatement(statementData);

        // Update only the capacity
        RedisProvisionObligation.ChangeData memory changeCapacity = RedisProvisionObligation.ChangeData({
            addedCapacity: 512 * 1024 * 1024, // Add 512 MB
            addedIngress: 0,
            addedEgress: 0,
            addedDuration: 0,
            newUrl: ""
        });

        bytes32 updatedUID1 = provisionObligation.reviseStatement(initialUID, changeCapacity);

        // Update only the expiration
        RedisProvisionObligation.ChangeData memory changeExpiration = RedisProvisionObligation.ChangeData({
            addedCapacity: 0,
            addedIngress: 0,
            addedEgress: 0,
            addedDuration: uint64(15 days), // Extend by 15 days
            newUrl: ""
        });

        bytes32 updatedUID2 = provisionObligation.reviseStatement(updatedUID1, changeExpiration);

        // Update only the URL
        RedisProvisionObligation.ChangeData memory changeUrl = RedisProvisionObligation.ChangeData({
            addedCapacity: 0,
            addedIngress: 0,
            addedEgress: 0,
            addedDuration: 0,
            newUrl: "redis://newexample.com:6379"
        });

        bytes32 updatedUID3 = provisionObligation.reviseStatement(updatedUID2, changeUrl);

        // Retrieve the updated attestation
        Attestation memory updatedAttestation = eas.getAttestation(updatedUID3);
        RedisProvisionObligation.StatementData memory updatedData =
            abi.decode(updatedAttestation.data, (RedisProvisionObligation.StatementData));

        // Check that the updates were applied
        assertEq(
            updatedData.capacity, statementData.capacity + changeCapacity.addedCapacity, "Capacity should be updated"
        );
        assertEq(
            updatedData.expiration,
            statementData.expiration + changeExpiration.addedDuration,
            "Expiration should be updated"
        );
        assertEq(updatedData.url, changeUrl.newUrl, "URL should be updated");

        vm.stopPrank();
    }

    function testBobCannotUpdateAlicesProvisionStatement() public {
        vm.startPrank(alice);

        // Alice creates a provision statement
        RedisProvisionObligation.StatementData memory statementData = RedisProvisionObligation.StatementData({
            user: alice,
            capacity: 1024 * 1024 * 1024, // 1 GB
            ingress: 500 * 1024 * 1024, // 500 MB
            egress: 500 * 1024 * 1024, // 500 MB
            expiration: uint64(block.timestamp + 30 days),
            url: "redis://example.com:6379"
        });

        bytes32 aliceUID = provisionObligation.makeStatement(statementData);

        vm.stopPrank();

        vm.startPrank(bob);

        // Bob tries to update Alice's provision statement
        RedisProvisionObligation.ChangeData memory changeData = RedisProvisionObligation.ChangeData({
            addedCapacity: 512 * 1024 * 1024, // Attempt to add 512 MB
            addedIngress: 0,
            addedEgress: 0,
            addedDuration: 0,
            newUrl: ""
        });

        vm.expectRevert(abi.encodeWithSignature("UnauthorizedCall()"));
        provisionObligation.reviseStatement(aliceUID, changeData);

        vm.stopPrank();
    }
}
