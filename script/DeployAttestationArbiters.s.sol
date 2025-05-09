// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Script.sol";

// Additional Arbiters
import {AllArbiter} from "@src/arbiters/AllArbiter.sol";
import {AnyArbiter} from "@src/arbiters/AnyArbiter.sol";
import {IntrinsicsArbiter} from "@src/arbiters/IntrinsicsArbiter.sol";
import {IntrinsicsArbiter2} from "@src/arbiters/IntrinsicsArbiter2.sol";

// Composing Arbiters
import {AttesterArbiter as ComposingAttesterArbiter} from "@src/arbiters/attestation-properties/composing/AttesterArbiter.sol";
import {ExpirationTimeAfterArbiter as ComposingExpirationTimeAfterArbiter} from "@src/arbiters/attestation-properties/composing/ExpirationTimeAfterArbiter.sol";
import {ExpirationTimeBeforeArbiter as ComposingExpirationTimeBeforeArbiter} from "@src/arbiters/attestation-properties/composing/ExpirationTimeBeforeArbiter.sol";
import {ExpirationTimeEqualArbiter as ComposingExpirationTimeEqualArbiter} from "@src/arbiters/attestation-properties/composing/ExpirationTimeEqualArbiter.sol";
import {RecipientArbiter as ComposingRecipientArbiter} from "@src/arbiters/attestation-properties/composing/RecipientArbiter.sol";
import {RefUidArbiter as ComposingRefUidArbiter} from "@src/arbiters/attestation-properties/composing/RefUidArbiter.sol";
import {RevocableArbiter as ComposingRevocableArbiter} from "@src/arbiters/attestation-properties/composing/RevocableArbiter.sol";
import {SchemaArbiter as ComposingSchemaArbiter} from "@src/arbiters/attestation-properties/composing/SchemaArbiter.sol";
import {TimeAfterArbiter as ComposingTimeAfterArbiter} from "@src/arbiters/attestation-properties/composing/TimeAfterArbiter.sol";
import {TimeBeforeArbiter as ComposingTimeBeforeArbiter} from "@src/arbiters/attestation-properties/composing/TimeBeforeArbiter.sol";
import {TimeEqualArbiter as ComposingTimeEqualArbiter} from "@src/arbiters/attestation-properties/composing/TimeEqualArbiter.sol";
import {UidArbiter as ComposingUidArbiter} from "@src/arbiters/attestation-properties/composing/UidArbiter.sol";

// Non-Composing Arbiters
import {AttesterArbiter as NonComposingAttesterArbiter} from "@src/arbiters/attestation-properties/non-composing/AttesterArbiter.sol";
import {ExpirationTimeAfterArbiter as NonComposingExpirationTimeAfterArbiter} from "@src/arbiters/attestation-properties/non-composing/ExpirationTimeAfterArbiter.sol";
import {ExpirationTimeBeforeArbiter as NonComposingExpirationTimeBeforeArbiter} from "@src/arbiters/attestation-properties/non-composing/ExpirationTimeBeforeArbiter.sol";
import {ExpirationTimeEqualArbiter as NonComposingExpirationTimeEqualArbiter} from "@src/arbiters/attestation-properties/non-composing/ExpirationTimeEqualArbiter.sol";
import {RecipientArbiter as NonComposingRecipientArbiter} from "@src/arbiters/attestation-properties/non-composing/RecipientArbiter.sol";
import {RefUidArbiter as NonComposingRefUidArbiter} from "@src/arbiters/attestation-properties/non-composing/RefUidArbiter.sol";
import {RevocableArbiter as NonComposingRevocableArbiter} from "@src/arbiters/attestation-properties/non-composing/RevocableArbiter.sol";
import {SchemaArbiter as NonComposingSchemaArbiter} from "@src/arbiters/attestation-properties/non-composing/SchemaArbiter.sol";
import {TimeAfterArbiter as NonComposingTimeAfterArbiter} from "@src/arbiters/attestation-properties/non-composing/TimeAfterArbiter.sol";
import {TimeBeforeArbiter as NonComposingTimeBeforeArbiter} from "@src/arbiters/attestation-properties/non-composing/TimeBeforeArbiter.sol";
import {TimeEqualArbiter as NonComposingTimeEqualArbiter} from "@src/arbiters/attestation-properties/non-composing/TimeEqualArbiter.sol";
import {UidArbiter as NonComposingUidArbiter} from "@src/arbiters/attestation-properties/non-composing/UidArbiter.sol";

contract DeployAttestationArbiters is Script {
    function run() external {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("DEPLOYMENT_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Additional Arbiters
        AllArbiter allArbiter = new AllArbiter();
        AnyArbiter anyArbiter = new AnyArbiter();
        IntrinsicsArbiter intrinsicsArbiter = new IntrinsicsArbiter();
        IntrinsicsArbiter2 intrinsicsArbiter2 = new IntrinsicsArbiter2();

        // Deploy Composing Arbiters
        ComposingAttesterArbiter composingAttesterArbiter = new ComposingAttesterArbiter();
        ComposingExpirationTimeAfterArbiter composingExpirationTimeAfterArbiter = new ComposingExpirationTimeAfterArbiter();
        ComposingExpirationTimeBeforeArbiter composingExpirationTimeBeforeArbiter = new ComposingExpirationTimeBeforeArbiter();
        ComposingExpirationTimeEqualArbiter composingExpirationTimeEqualArbiter = new ComposingExpirationTimeEqualArbiter();
        ComposingRecipientArbiter composingRecipientArbiter = new ComposingRecipientArbiter();
        ComposingRefUidArbiter composingRefUidArbiter = new ComposingRefUidArbiter();
        ComposingRevocableArbiter composingRevocableArbiter = new ComposingRevocableArbiter();
        ComposingSchemaArbiter composingSchemaArbiter = new ComposingSchemaArbiter();
        ComposingTimeAfterArbiter composingTimeAfterArbiter = new ComposingTimeAfterArbiter();
        ComposingTimeBeforeArbiter composingTimeBeforeArbiter = new ComposingTimeBeforeArbiter();
        ComposingTimeEqualArbiter composingTimeEqualArbiter = new ComposingTimeEqualArbiter();
        ComposingUidArbiter composingUidArbiter = new ComposingUidArbiter();

        // Deploy Non-Composing Arbiters
        NonComposingAttesterArbiter nonComposingAttesterArbiter = new NonComposingAttesterArbiter();
        NonComposingExpirationTimeAfterArbiter nonComposingExpirationTimeAfterArbiter = new NonComposingExpirationTimeAfterArbiter();
        NonComposingExpirationTimeBeforeArbiter nonComposingExpirationTimeBeforeArbiter = new NonComposingExpirationTimeBeforeArbiter();
        NonComposingExpirationTimeEqualArbiter nonComposingExpirationTimeEqualArbiter = new NonComposingExpirationTimeEqualArbiter();
        NonComposingRecipientArbiter nonComposingRecipientArbiter = new NonComposingRecipientArbiter();
        NonComposingRefUidArbiter nonComposingRefUidArbiter = new NonComposingRefUidArbiter();
        NonComposingRevocableArbiter nonComposingRevocableArbiter = new NonComposingRevocableArbiter();
        NonComposingSchemaArbiter nonComposingSchemaArbiter = new NonComposingSchemaArbiter();
        NonComposingTimeAfterArbiter nonComposingTimeAfterArbiter = new NonComposingTimeAfterArbiter();
        NonComposingTimeBeforeArbiter nonComposingTimeBeforeArbiter = new NonComposingTimeBeforeArbiter();
        NonComposingTimeEqualArbiter nonComposingTimeEqualArbiter = new NonComposingTimeEqualArbiter();
        NonComposingUidArbiter nonComposingUidArbiter = new NonComposingUidArbiter();

        vm.stopBroadcast();

        // Print all deployed addresses
        console.log("\nAdditional Arbiters:");
        console.log("AllArbiter:", address(allArbiter));
        console.log("AnyArbiter:", address(anyArbiter));
        console.log("IntrinsicsArbiter:", address(intrinsicsArbiter));
        console.log("IntrinsicsArbiter2:", address(intrinsicsArbiter2));

        console.log("\nComposing Attestation Arbiters:");
        console.log(
            "ComposingAttesterArbiter:",
            address(composingAttesterArbiter)
        );
        console.log(
            "ComposingExpirationTimeAfterArbiter:",
            address(composingExpirationTimeAfterArbiter)
        );
        console.log(
            "ComposingExpirationTimeBeforeArbiter:",
            address(composingExpirationTimeBeforeArbiter)
        );
        console.log(
            "ComposingExpirationTimeEqualArbiter:",
            address(composingExpirationTimeEqualArbiter)
        );
        console.log(
            "ComposingRecipientArbiter:",
            address(composingRecipientArbiter)
        );
        console.log("ComposingRefUidArbiter:", address(composingRefUidArbiter));
        console.log(
            "ComposingRevocableArbiter:",
            address(composingRevocableArbiter)
        );
        console.log("ComposingSchemaArbiter:", address(composingSchemaArbiter));
        console.log(
            "ComposingTimeAfterArbiter:",
            address(composingTimeAfterArbiter)
        );
        console.log(
            "ComposingTimeBeforeArbiter:",
            address(composingTimeBeforeArbiter)
        );
        console.log(
            "ComposingTimeEqualArbiter:",
            address(composingTimeEqualArbiter)
        );
        console.log("ComposingUidArbiter:", address(composingUidArbiter));

        console.log("\nNon-Composing Attestation Arbiters:");
        console.log(
            "NonComposingAttesterArbiter:",
            address(nonComposingAttesterArbiter)
        );
        console.log(
            "NonComposingExpirationTimeAfterArbiter:",
            address(nonComposingExpirationTimeAfterArbiter)
        );
        console.log(
            "NonComposingExpirationTimeBeforeArbiter:",
            address(nonComposingExpirationTimeBeforeArbiter)
        );
        console.log(
            "NonComposingExpirationTimeEqualArbiter:",
            address(nonComposingExpirationTimeEqualArbiter)
        );
        console.log(
            "NonComposingRecipientArbiter:",
            address(nonComposingRecipientArbiter)
        );
        console.log(
            "NonComposingRefUidArbiter:",
            address(nonComposingRefUidArbiter)
        );
        console.log(
            "NonComposingRevocableArbiter:",
            address(nonComposingRevocableArbiter)
        );
        console.log(
            "NonComposingSchemaArbiter:",
            address(nonComposingSchemaArbiter)
        );
        console.log(
            "NonComposingTimeAfterArbiter:",
            address(nonComposingTimeAfterArbiter)
        );
        console.log(
            "NonComposingTimeBeforeArbiter:",
            address(nonComposingTimeBeforeArbiter)
        );
        console.log(
            "NonComposingTimeEqualArbiter:",
            address(nonComposingTimeEqualArbiter)
        );
        console.log("NonComposingUidArbiter:", address(nonComposingUidArbiter));

        // Create JSON with deployed addresses
        string memory deploymentJson = "attestationArbitersJson";

        // Add Additional Arbiters to JSON
        vm.serializeAddress(deploymentJson, "allArbiter", address(allArbiter));
        vm.serializeAddress(deploymentJson, "anyArbiter", address(anyArbiter));
        vm.serializeAddress(
            deploymentJson,
            "intrinsicsArbiter",
            address(intrinsicsArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "intrinsicsArbiter2",
            address(intrinsicsArbiter2)
        );

        // Add Composing Arbiters to JSON
        vm.serializeAddress(
            deploymentJson,
            "composingAttesterArbiter",
            address(composingAttesterArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "composingExpirationTimeAfterArbiter",
            address(composingExpirationTimeAfterArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "composingExpirationTimeBeforeArbiter",
            address(composingExpirationTimeBeforeArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "composingExpirationTimeEqualArbiter",
            address(composingExpirationTimeEqualArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "composingRecipientArbiter",
            address(composingRecipientArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "composingRefUidArbiter",
            address(composingRefUidArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "composingRevocableArbiter",
            address(composingRevocableArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "composingSchemaArbiter",
            address(composingSchemaArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "composingTimeAfterArbiter",
            address(composingTimeAfterArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "composingTimeBeforeArbiter",
            address(composingTimeBeforeArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "composingTimeEqualArbiter",
            address(composingTimeEqualArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "composingUidArbiter",
            address(composingUidArbiter)
        );

        // Add Non-Composing Arbiters to JSON
        vm.serializeAddress(
            deploymentJson,
            "nonComposingAttesterArbiter",
            address(nonComposingAttesterArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "nonComposingExpirationTimeAfterArbiter",
            address(nonComposingExpirationTimeAfterArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "nonComposingExpirationTimeBeforeArbiter",
            address(nonComposingExpirationTimeBeforeArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "nonComposingExpirationTimeEqualArbiter",
            address(nonComposingExpirationTimeEqualArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "nonComposingRecipientArbiter",
            address(nonComposingRecipientArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "nonComposingRefUidArbiter",
            address(nonComposingRefUidArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "nonComposingRevocableArbiter",
            address(nonComposingRevocableArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "nonComposingSchemaArbiter",
            address(nonComposingSchemaArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "nonComposingTimeAfterArbiter",
            address(nonComposingTimeAfterArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "nonComposingTimeBeforeArbiter",
            address(nonComposingTimeBeforeArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "nonComposingTimeEqualArbiter",
            address(nonComposingTimeEqualArbiter)
        );
        string memory finalJson = vm.serializeAddress(
            deploymentJson,
            "nonComposingUidArbiter",
            address(nonComposingUidArbiter)
        );

        // Generate timestamp for filename
        uint256 timestamp = block.timestamp;
        string memory filename = string.concat(
            "./deployments/attestation_arbiters_",
            vm.toString(timestamp),
            ".json"
        );

        // Write JSON to file
        vm.writeJson(finalJson, filename);
        console.log("\nSaving attestation arbiters addresses to", filename);

        console.log("\nAttestation Arbiters Deployment complete!");
    }
}
