// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {EASDeployer} from "test/utils/EASDeployer.sol";

// ERC20 Contracts
import {ERC20EscrowObligation} from "@src/obligations/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "@src/obligations/ERC20PaymentObligation.sol";
import {ERC20BarterUtils} from "@src/utils/ERC20BarterUtils.sol";

// ERC721 Contracts
import {ERC721EscrowObligation} from "@src/obligations/ERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "@src/obligations/ERC721PaymentObligation.sol";
import {ERC721BarterUtils} from "@src/utils/ERC721BarterUtils.sol";

// ERC1155 Contracts
import {ERC1155EscrowObligation} from "@src/obligations/ERC1155EscrowObligation.sol";
import {ERC1155PaymentObligation} from "@src/obligations/ERC1155PaymentObligation.sol";
import {ERC1155BarterUtils} from "@src/utils/ERC1155BarterUtils.sol";

// TokenBundle Contracts
import {TokenBundleEscrowObligation2} from "@src/obligations/TokenBundleEscrowObligation2.sol";
import {TokenBundlePaymentObligation2} from "@src/obligations/TokenBundlePaymentObligation2.sol";
import {TokenBundleBarterUtils} from "@src/utils/TokenBundleBarterUtils.sol";

// Native Token Contracts
import {NativeTokenEscrowObligation} from "@src/obligations/NativeTokenEscrowObligation.sol";
import {NativeTokenPaymentObligation} from "@src/obligations/NativeTokenPaymentObligation.sol";

// Attestation Contracts
import {AttestationEscrowObligation} from "@src/obligations/AttestationEscrowObligation.sol";
import {AttestationEscrowObligation2} from "@src/obligations/AttestationEscrowObligation2.sol";
import {AttestationBarterUtils} from "@src/utils/AttestationBarterUtils.sol";

// Arbiter Contracts
// import {SpecificAttestationArbiter} from "@src/arbiters/SpecificAttestationArbiter.sol";
// import {TrustedPartyArbiter} from "@src/arbiters/TrustedPartyArbiter.sol";
import {TrivialArbiter} from "@src/arbiters/TrivialArbiter.sol";
import {TrustedOracleArbiter} from "@src/arbiters/TrustedOracleArbiter.sol";

// Additional Arbiters
import {AllArbiter} from "@src/arbiters/logical/AllArbiter.sol";
import {AnyArbiter} from "@src/arbiters/logical/AnyArbiter.sol";
import {NotArbiter} from "@src/arbiters/logical/NotArbiter.sol";
import {IntrinsicsArbiter} from "@src/arbiters/IntrinsicsArbiter.sol";
import {IntrinsicsArbiter2} from "@src/arbiters/IntrinsicsArbiter2.sol";

// Composing Attestation Property Arbiters
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

// Non-Composing Attestation Property Arbiters
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

// String Obligation
import {StringObligation} from "@src/obligations/StringObligation.sol";

contract Deploy is Script {
    function run() external {
        // Load environment variables
        address easAddress = vm.envAddress("EAS_ADDRESS");
        address schemaRegistryAddress = vm.envAddress("EAS_SR_ADDRESS");
        uint256 deployerPrivateKey = vm.envUint("DEPLOYMENT_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy EAS and schema registry
        // IEAS eas;
        // ISchemaRegistry schemaRegistry;
        // EASDeployer easDeployer = new EASDeployer();
        // (eas, schemaRegistry) = easDeployer.deployEAS();
        // address easAddress = address(eas);
        // address schemaRegistryAddress = address(schemaRegistry);

        // Deploy arbiters
        // SpecificAttestationArbiter specificArbiter = new SpecificAttestationArbiter();
        // TrustedPartyArbiter trustedPartyArbiter = new TrustedPartyArbiter();
        TrivialArbiter trivialArbiter = new TrivialArbiter();
        TrustedOracleArbiter trustedOracleArbiter = new TrustedOracleArbiter(
            IEAS(easAddress)
        );

        // Deploy Additional Arbiters
        AllArbiter allArbiter = new AllArbiter();
        AnyArbiter anyArbiter = new AnyArbiter();
        NotArbiter notArbiter = new NotArbiter();
        IntrinsicsArbiter intrinsicsArbiter = new IntrinsicsArbiter();
        IntrinsicsArbiter2 intrinsicsArbiter2 = new IntrinsicsArbiter2();

        // Deploy Composing Attestation Property Arbiters
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

        // Deploy Non-Composing Attestation Property Arbiters
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

        // Deploy StringObligation
        StringObligation stringObligation = new StringObligation(
            IEAS(easAddress),
            ISchemaRegistry(schemaRegistryAddress)
        );

        // Deploy ERC20 contracts
        ERC20EscrowObligation erc20Escrow = new ERC20EscrowObligation(
            IEAS(easAddress),
            ISchemaRegistry(schemaRegistryAddress)
        );
        ERC20PaymentObligation erc20Payment = new ERC20PaymentObligation(
            IEAS(easAddress),
            ISchemaRegistry(schemaRegistryAddress)
        );
        // ERC20BarterUtils erc20BarterUtils = new ERC20BarterUtils(
        //     IEAS(easAddress),
        //     erc20Escrow,
        //     erc20Payment
        // );

        // Deploy ERC721 contracts
        ERC721EscrowObligation erc721Escrow = new ERC721EscrowObligation(
            IEAS(easAddress),
            ISchemaRegistry(schemaRegistryAddress)
        );
        ERC721PaymentObligation erc721Payment = new ERC721PaymentObligation(
            IEAS(easAddress),
            ISchemaRegistry(schemaRegistryAddress)
        );
        // ERC721BarterUtils erc721BarterUtils = new ERC721BarterUtils(
        //     IEAS(easAddress),
        //     erc721Escrow,
        //     erc721Payment
        // );

        // Deploy ERC1155 contracts
        ERC1155EscrowObligation erc1155Escrow = new ERC1155EscrowObligation(
            IEAS(easAddress),
            ISchemaRegistry(schemaRegistryAddress)
        );
        ERC1155PaymentObligation erc1155Payment = new ERC1155PaymentObligation(
            IEAS(easAddress),
            ISchemaRegistry(schemaRegistryAddress)
        );
        // ERC1155BarterUtils erc1155BarterUtils = new ERC1155BarterUtils(
        //     IEAS(easAddress),
        //     erc1155Escrow,
        //     erc1155Payment
        // );

        // Deploy TokenBundle contracts
        TokenBundleEscrowObligation2 bundleEscrow = new TokenBundleEscrowObligation2(
                IEAS(easAddress),
                ISchemaRegistry(schemaRegistryAddress)
            );
        TokenBundlePaymentObligation2 bundlePayment = new TokenBundlePaymentObligation2(
                IEAS(easAddress),
                ISchemaRegistry(schemaRegistryAddress)
            );
        TokenBundleBarterUtils bundleBarterUtils = new TokenBundleBarterUtils(
            IEAS(easAddress),
            bundleEscrow,
            bundlePayment
        );

        // Deploy Native Token contracts
        NativeTokenEscrowObligation nativeEscrow = new NativeTokenEscrowObligation(
                IEAS(easAddress),
                ISchemaRegistry(schemaRegistryAddress)
            );
        NativeTokenPaymentObligation nativePayment = new NativeTokenPaymentObligation(
                IEAS(easAddress),
                ISchemaRegistry(schemaRegistryAddress)
            );

        // Deploy barter utils contracts
        ERC20BarterUtils erc20BarterUtils = new ERC20BarterUtils(
            IEAS(easAddress),
            erc20Escrow,
            erc20Payment,
            erc721Escrow,
            erc721Payment,
            erc1155Escrow,
            erc1155Payment,
            bundleEscrow,
            bundlePayment,
            nativeEscrow,
            nativePayment
        );

        ERC721BarterUtils erc721BarterUtils = new ERC721BarterUtils(
            IEAS(easAddress),
            erc20Escrow,
            erc20Payment,
            erc721Escrow,
            erc721Payment,
            erc1155Escrow,
            erc1155Payment,
            bundleEscrow,
            bundlePayment,
            nativeEscrow,
            nativePayment
        );

        ERC1155BarterUtils erc1155BarterUtils = new ERC1155BarterUtils(
            IEAS(easAddress),
            erc20Escrow,
            erc20Payment,
            erc721Escrow,
            erc721Payment,
            erc1155Escrow,
            erc1155Payment,
            bundleEscrow,
            bundlePayment,
            nativeEscrow,
            nativePayment
        );

        // Deploy attestation barter contracts
        AttestationEscrowObligation attestationEscrow = new AttestationEscrowObligation(
                IEAS(easAddress),
                ISchemaRegistry(schemaRegistryAddress)
            );
        AttestationEscrowObligation2 attestationEscrow2 = new AttestationEscrowObligation2(
                IEAS(easAddress),
                ISchemaRegistry(schemaRegistryAddress)
            );
        AttestationBarterUtils attestationBarterUtils = new AttestationBarterUtils(
                IEAS(easAddress),
                ISchemaRegistry(schemaRegistryAddress),
                attestationEscrow2
            );

        vm.stopBroadcast();

        // Print all deployed addresses
        console.log("\nEAS:");
        console.log("EAS:", easAddress);
        console.log("Schema Registry:", schemaRegistryAddress);

        console.log("\nArbiters:");
        // console.log("SpecificAttestationArbiter:", address(specificArbiter));
        // console.log("TrustedPartyArbiter:", address(trustedPartyArbiter));
        console.log("TrivialArbiter:", address(trivialArbiter));
        console.log("TrustedOracleArbiter:", address(trustedOracleArbiter));

        console.log("\nAdditional Arbiters:");
        console.log("AllArbiter:", address(allArbiter));
        console.log("AnyArbiter:", address(anyArbiter));
        console.log("NotArbiter:", address(notArbiter));
        console.log("IntrinsicsArbiter:", address(intrinsicsArbiter));
        console.log("IntrinsicsArbiter2:", address(intrinsicsArbiter2));

        console.log("\nComposing Attestation Property Arbiters:");
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

        console.log("\nNon-Composing Attestation Property Arbiters:");
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

        console.log("\nString Obligation:");
        console.log("StringObligation:", address(stringObligation));

        console.log("\nERC20 Contracts:");
        console.log("ERC20EscrowObligation:", address(erc20Escrow));
        console.log("ERC20PaymentObligation:", address(erc20Payment));
        console.log("ERC20BarterUtils:", address(erc20BarterUtils));

        console.log("\nERC721 Contracts:");
        console.log("ERC721EscrowObligation:", address(erc721Escrow));
        console.log("ERC721PaymentObligation:", address(erc721Payment));
        console.log("ERC721BarterUtils:", address(erc721BarterUtils));

        console.log("\nERC1155 Contracts:");
        console.log("ERC1155EscrowObligation:", address(erc1155Escrow));
        console.log("ERC1155PaymentObligation:", address(erc1155Payment));
        console.log("ERC1155BarterUtils:", address(erc1155BarterUtils));

        console.log("\nTokenBundle Contracts:");
        console.log("TokenBundleEscrowObligation2:", address(bundleEscrow));
        console.log("TokenBundlePaymentObligation2:", address(bundlePayment));
        console.log("TokenBundleBarterUtils:", address(bundleBarterUtils));

        console.log("\nAttestation Barter Contracts:");
        console.log("AttestationEscrowObligation:", address(attestationEscrow));
        console.log(
            "AttestationEscrowObligation2:",
            address(attestationEscrow2)
        );
        console.log("AttestationBarterUtils:", address(attestationBarterUtils));

        // Create JSON with deployed addresses
        string memory deploymentJson = "deploymentJson";

        // Add EAS addresses
        vm.serializeAddress(deploymentJson, "eas", easAddress);
        vm.serializeAddress(
            deploymentJson,
            "easSchemaRegistry",
            schemaRegistryAddress
        );

        // Add arbiter addresses
        // vm.serializeAddress(
        //     deploymentJson,
        //     "specificAttestationArbiter",
        //     address(specificArbiter)
        // );
        // vm.serializeAddress(
        //     deploymentJson,
        //     "trustedPartyArbiter",
        //     address(trustedPartyArbiter)
        // );
        vm.serializeAddress(
            deploymentJson,
            "trivialArbiter",
            address(trivialArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "trustedOracleArbiter",
            address(trustedOracleArbiter)
        );

        // Add Additional Arbiters
        vm.serializeAddress(deploymentJson, "allArbiter", address(allArbiter));
        vm.serializeAddress(deploymentJson, "anyArbiter", address(anyArbiter));
        vm.serializeAddress(deploymentJson, "notArbiter", address(notArbiter));
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

        // Add Composing Attestation Property Arbiters
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

        // Add Non-Composing Attestation Property Arbiters
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
        vm.serializeAddress(
            deploymentJson,
            "nonComposingUidArbiter",
            address(nonComposingUidArbiter)
        );

        // Add string obligation
        vm.serializeAddress(
            deploymentJson,
            "stringObligation",
            address(stringObligation)
        );

        // Add ERC20 addresses
        vm.serializeAddress(
            deploymentJson,
            "erc20EscrowObligation",
            address(erc20Escrow)
        );
        vm.serializeAddress(
            deploymentJson,
            "erc20PaymentObligation",
            address(erc20Payment)
        );

        // Add ERC721 addresses
        vm.serializeAddress(
            deploymentJson,
            "erc721EscrowObligation",
            address(erc721Escrow)
        );
        vm.serializeAddress(
            deploymentJson,
            "erc721PaymentObligation",
            address(erc721Payment)
        );

        // Add ERC1155 addresses
        vm.serializeAddress(
            deploymentJson,
            "erc1155EscrowObligation",
            address(erc1155Escrow)
        );
        vm.serializeAddress(
            deploymentJson,
            "erc1155PaymentObligation",
            address(erc1155Payment)
        );

        // Add TokenBundle addresses
        vm.serializeAddress(
            deploymentJson,
            "tokenBundleEscrowObligation",
            address(bundleEscrow)
        );
        vm.serializeAddress(
            deploymentJson,
            "tokenBundlePaymentObligation",
            address(bundlePayment)
        );
        vm.serializeAddress(
            deploymentJson,
            "tokenBundleBarterUtils",
            address(bundleBarterUtils)
        );

        // Add BarterUtils addresses (using CrossToken contracts)
        vm.serializeAddress(
            deploymentJson,
            "erc20BarterUtils",
            address(erc20BarterUtils)
        );
        vm.serializeAddress(
            deploymentJson,
            "erc721BarterUtils",
            address(erc721BarterUtils)
        );
        vm.serializeAddress(
            deploymentJson,
            "erc1155BarterUtils",
            address(erc1155BarterUtils)
        );

        // Add Attestation addresses
        vm.serializeAddress(
            deploymentJson,
            "attestationEscrowObligation",
            address(attestationEscrow)
        );
        vm.serializeAddress(
            deploymentJson,
            "attestationEscrowObligation2",
            address(attestationEscrow2)
        );
        string memory finalJson = vm.serializeAddress(
            deploymentJson,
            "attestationBarterUtils",
            address(attestationBarterUtils)
        );

        // Generate timestamp for filename
        uint256 timestamp = block.timestamp;
        string memory filename = string.concat(
            "./deployments/deployment_",
            vm.toString(timestamp),
            ".json"
        );

        // Write JSON to file
        vm.writeJson(finalJson, filename);
        console.log("\nSaving addresses to", filename);

        console.log("\nDeployment complete!");
    }
}
