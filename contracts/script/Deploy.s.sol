// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {AtomicPaymentUtils} from "@src/utils/atomic/AtomicPaymentUtils.sol";
import {AtomicAttestationUtils} from "@src/utils/atomic/AtomicAttestationUtils.sol";
import {ERC20Splitter} from "@src/utils/splitters/default/ERC20Splitter.sol";
import {ERC1155Splitter} from "@src/utils/splitters/default/ERC1155Splitter.sol";
import {NativeTokenSplitter} from "@src/utils/splitters/default/NativeTokenSplitter.sol";
import {TokenBundleSplitter} from "@src/utils/splitters/default/TokenBundleSplitter.sol";
import {TokenBundleSplitterUnvalidated} from "@src/utils/splitters/default/TokenBundleSplitterUnvalidated.sol";
import {CommitmentERC20Splitter} from "@src/utils/splitters/commitment/CommitmentERC20Splitter.sol";
import {CommitmentERC1155Splitter} from "@src/utils/splitters/commitment/CommitmentERC1155Splitter.sol";
import {CommitmentNativeTokenSplitter} from "@src/utils/splitters/commitment/CommitmentNativeTokenSplitter.sol";
import {CommitmentTokenBundleSplitter} from "@src/utils/splitters/commitment/CommitmentTokenBundleSplitter.sol";
import {
    CommitmentTokenBundleSplitterUnvalidated
} from "@src/utils/splitters/commitment/CommitmentTokenBundleSplitterUnvalidated.sol";

// ERC20 Contracts
import {ERC20EscrowObligation} from "@src/obligations/escrow/default/ERC20EscrowObligation.sol";
import {
    UnconditionalERC20EscrowObligation
} from "@src/obligations/escrow/unconditional/UnconditionalERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "@src/obligations/payment/ERC20PaymentObligation.sol";

// ERC721 Contracts
import {ERC721EscrowObligation} from "@src/obligations/escrow/default/ERC721EscrowObligation.sol";
import {
    UnconditionalERC721EscrowObligation
} from "@src/obligations/escrow/unconditional/UnconditionalERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "@src/obligations/payment/ERC721PaymentObligation.sol";

// ERC1155 Contracts
import {ERC1155EscrowObligation} from "@src/obligations/escrow/default/ERC1155EscrowObligation.sol";
import {
    UnconditionalERC1155EscrowObligation
} from "@src/obligations/escrow/unconditional/UnconditionalERC1155EscrowObligation.sol";
import {ERC1155PaymentObligation} from "@src/obligations/payment/ERC1155PaymentObligation.sol";

// TokenBundle Contracts
import {TokenBundleEscrowObligation} from "@src/obligations/escrow/default/TokenBundleEscrowObligation.sol";
import {
    UnconditionalTokenBundleEscrowObligation
} from "@src/obligations/escrow/unconditional/UnconditionalTokenBundleEscrowObligation.sol";
import {TokenBundlePaymentObligation} from "@src/obligations/payment/TokenBundlePaymentObligation.sol";

// Native Token Contracts
import {NativeTokenEscrowObligation} from "@src/obligations/escrow/default/NativeTokenEscrowObligation.sol";
import {
    UnconditionalNativeTokenEscrowObligation
} from "@src/obligations/escrow/unconditional/UnconditionalNativeTokenEscrowObligation.sol";
import {NativeTokenPaymentObligation} from "@src/obligations/payment/NativeTokenPaymentObligation.sol";

// Attestation Contracts
import {AttestationEscrowObligation} from "@src/obligations/escrow/default/AttestationEscrowObligation.sol";
import {
    AttestationReferenceEscrowObligation
} from "@src/obligations/escrow/default/AttestationReferenceEscrowObligation.sol";
import {
    UnconditionalAttestationEscrowObligation
} from "@src/obligations/escrow/unconditional/UnconditionalAttestationEscrowObligation.sol";
import {
    UnconditionalAttestationReferenceEscrowObligation
} from "@src/obligations/escrow/unconditional/UnconditionalAttestationReferenceEscrowObligation.sol";

// Hook-based Escrow Contracts
import {HookEscrowObligation} from "@src/obligations/escrow/hook-based/HookEscrowObligation.sol";
import {HooksEscrowObligation} from "@src/obligations/escrow/hook-based/HooksEscrowObligation.sol";
import {ERC20EscrowHook} from "@src/obligations/escrow/hook-based/hooks/ERC20EscrowHook.sol";
import {ERC721EscrowHook} from "@src/obligations/escrow/hook-based/hooks/ERC721EscrowHook.sol";
import {ERC1155EscrowHook} from "@src/obligations/escrow/hook-based/hooks/ERC1155EscrowHook.sol";
import {NativeTokenEscrowHook} from "@src/obligations/escrow/hook-based/hooks/NativeTokenEscrowHook.sol";
import {AttestationEscrowHook} from "@src/obligations/escrow/hook-based/hooks/AttestationEscrowHook.sol";
import {
    AttestationReferenceEscrowHook
} from "@src/obligations/escrow/hook-based/hooks/AttestationReferenceEscrowHook.sol";

// Arbiter Contracts
import {TrivialArbiter} from "@src/arbiters/TrivialArbiter.sol";
import {TrustedOracleArbiter} from "@src/arbiters/trusted-oracle/TrustedOracleArbiter.sol";
import {CommitmentTrustedOracleArbiter} from "@src/arbiters/trusted-oracle/CommitmentTrustedOracleArbiter.sol";
import {ReferencesEscrowArbiter} from "@src/arbiters/ReferencesEscrowArbiter.sol";

// Additional Arbiters
import {AllArbiter} from "@src/arbiters/logical/AllArbiter.sol";
import {AnyArbiter} from "@src/arbiters/logical/AnyArbiter.sol";
import {IntrinsicsArbiter} from "@src/arbiters/IntrinsicsArbiter.sol";
import {ERC8004Arbiter} from "@src/arbiters/ERC8004Arbiter.sol";

// Confirmation Arbiters
import {
    NonexclusiveUnrevocableConfirmationArbiter
} from "@src/arbiters/confirmation/NonexclusiveUnrevocableConfirmationArbiter.sol";
import {
    NonexclusiveRevocableConfirmationArbiter
} from "@src/arbiters/confirmation/NonexclusiveRevocableConfirmationArbiter.sol";
import {
    ExclusiveUnrevocableConfirmationArbiter
} from "@src/arbiters/confirmation/ExclusiveUnrevocableConfirmationArbiter.sol";
import {
    ExclusiveRevocableConfirmationArbiter
} from "@src/arbiters/confirmation/ExclusiveRevocableConfirmationArbiter.sol";

// Attestation Property Arbiters
import {AttesterArbiter} from "@src/arbiters/attestation-properties/AttesterArbiter.sol";
import {ExpirationTimeAfterArbiter} from "@src/arbiters/attestation-properties/ExpirationTimeAfterArbiter.sol";
import {ExpirationTimeBeforeArbiter} from "@src/arbiters/attestation-properties/ExpirationTimeBeforeArbiter.sol";
import {ExpirationTimeEqualArbiter} from "@src/arbiters/attestation-properties/ExpirationTimeEqualArbiter.sol";
import {RecipientArbiter} from "@src/arbiters/attestation-properties/RecipientArbiter.sol";
import {RefUidArbiter} from "@src/arbiters/attestation-properties/RefUidArbiter.sol";
import {RevocableArbiter} from "@src/arbiters/attestation-properties/RevocableArbiter.sol";
import {SchemaArbiter} from "@src/arbiters/attestation-properties/SchemaArbiter.sol";
import {TimeAfterArbiter} from "@src/arbiters/attestation-properties/TimeAfterArbiter.sol";
import {TimeBeforeArbiter} from "@src/arbiters/attestation-properties/TimeBeforeArbiter.sol";
import {TimeEqualArbiter} from "@src/arbiters/attestation-properties/TimeEqualArbiter.sol";
import {UidArbiter} from "@src/arbiters/attestation-properties/UidArbiter.sol";

// String Obligation
import {StringObligation} from "@src/obligations/StringObligation.sol";

// Commit Reveal Obligation
import {CommitRevealObligation} from "@src/obligations/CommitRevealObligation.sol";

contract Deploy is Script {
    function run() external virtual {
        // Load environment variables
        string memory easAddressStr = vm.envString("EAS_ADDRESS");
        string memory easSrAddressStr = vm.envString("EAS_SR_ADDRESS");
        uint256 deployerPrivateKey = vm.envOr("DEPLOYMENT_KEY", uint256(0));

        if (deployerPrivateKey != 0) {
            vm.startBroadcast(deployerPrivateKey);
        } else {
            vm.startBroadcast();
        }

        address easAddress = vm.parseAddress(easAddressStr);
        address schemaRegistryAddress = vm.parseAddress(easSrAddressStr);

        _deploy(easAddress, schemaRegistryAddress);
    }

    function _deploy(address easAddress, address schemaRegistryAddress) internal {
        // Deploy arbiters
        TrivialArbiter trivialArbiter = new TrivialArbiter();
        TrustedOracleArbiter trustedOracleArbiter = new TrustedOracleArbiter(IEAS(easAddress));
        CommitmentTrustedOracleArbiter commitmentTrustedOracleArbiter = new CommitmentTrustedOracleArbiter();
        ReferencesEscrowArbiter referencesEscrowArbiter = new ReferencesEscrowArbiter();

        // Deploy Additional Arbiters
        AllArbiter allArbiter = new AllArbiter();
        AnyArbiter anyArbiter = new AnyArbiter();
        IntrinsicsArbiter intrinsicsArbiter = new IntrinsicsArbiter();
        ERC8004Arbiter erc8004Arbiter = new ERC8004Arbiter();

        // Deploy Confirmation Arbiters
        NonexclusiveUnrevocableConfirmationArbiter nonexclusiveUnrevocableConfirmationArbiter =
            new NonexclusiveUnrevocableConfirmationArbiter(IEAS(easAddress));
        NonexclusiveRevocableConfirmationArbiter nonexclusiveRevocableConfirmationArbiter =
            new NonexclusiveRevocableConfirmationArbiter(IEAS(easAddress));
        ExclusiveUnrevocableConfirmationArbiter exclusiveUnrevocableConfirmationArbiter =
            new ExclusiveUnrevocableConfirmationArbiter(IEAS(easAddress));
        ExclusiveRevocableConfirmationArbiter exclusiveRevocableConfirmationArbiter =
            new ExclusiveRevocableConfirmationArbiter(IEAS(easAddress));

        // Deploy Attestation Property Arbiters
        AttesterArbiter attesterArbiter = new AttesterArbiter();
        ExpirationTimeAfterArbiter expirationTimeAfterArbiter = new ExpirationTimeAfterArbiter();
        ExpirationTimeBeforeArbiter expirationTimeBeforeArbiter = new ExpirationTimeBeforeArbiter();
        ExpirationTimeEqualArbiter expirationTimeEqualArbiter = new ExpirationTimeEqualArbiter();
        RecipientArbiter recipientArbiter = new RecipientArbiter();
        RefUidArbiter refUidArbiter = new RefUidArbiter();
        RevocableArbiter revocableArbiter = new RevocableArbiter();
        SchemaArbiter schemaArbiter = new SchemaArbiter();
        TimeAfterArbiter timeAfterArbiter = new TimeAfterArbiter();
        TimeBeforeArbiter timeBeforeArbiter = new TimeBeforeArbiter();
        TimeEqualArbiter timeEqualArbiter = new TimeEqualArbiter();
        UidArbiter uidArbiter = new UidArbiter();

        // Deploy StringObligation
        StringObligation stringObligation =
            new StringObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));

        // Deploy CommitRevealObligation
        CommitRevealObligation commitRevealObligation = new CommitRevealObligation(
            IEAS(easAddress),
            ISchemaRegistry(schemaRegistryAddress),
            0x07dD7186410Aa0fe85670531FC6EFc9cd980c558 // slashedBondRecipient (treasury)
        );
        // Deploy ERC20 contracts
        ERC20EscrowObligation erc20Escrow =
            new ERC20EscrowObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));
        UnconditionalERC20EscrowObligation erc20UnconditionalEscrow =
            new UnconditionalERC20EscrowObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));
        ERC20PaymentObligation erc20Payment =
            new ERC20PaymentObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));

        // Deploy ERC721 contracts
        ERC721EscrowObligation erc721Escrow =
            new ERC721EscrowObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));
        UnconditionalERC721EscrowObligation erc721UnconditionalEscrow =
            new UnconditionalERC721EscrowObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));
        ERC721PaymentObligation erc721Payment =
            new ERC721PaymentObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));

        // Deploy ERC1155 contracts
        ERC1155EscrowObligation erc1155Escrow =
            new ERC1155EscrowObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));
        UnconditionalERC1155EscrowObligation erc1155UnconditionalEscrow =
            new UnconditionalERC1155EscrowObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));
        ERC1155PaymentObligation erc1155Payment =
            new ERC1155PaymentObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));

        // Deploy TokenBundle contracts
        TokenBundleEscrowObligation bundleEscrow =
            new TokenBundleEscrowObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));
        UnconditionalTokenBundleEscrowObligation bundleUnconditionalEscrow =
            new UnconditionalTokenBundleEscrowObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));
        TokenBundlePaymentObligation bundlePayment =
            new TokenBundlePaymentObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));

        // Deploy Native Token contracts
        NativeTokenEscrowObligation nativeEscrow =
            new NativeTokenEscrowObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));
        UnconditionalNativeTokenEscrowObligation nativeUnconditionalEscrow =
            new UnconditionalNativeTokenEscrowObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));
        NativeTokenPaymentObligation nativePayment =
            new NativeTokenPaymentObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));

        // Deploy atomic payment utility contract
        AtomicPaymentUtils atomicPaymentUtils = new AtomicPaymentUtils(
            IEAS(easAddress), erc20Payment, erc721Payment, erc1155Payment, nativePayment, bundlePayment
        );

        // Deploy attestation contracts
        AttestationEscrowObligation attestationEscrow =
            new AttestationEscrowObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));
        UnconditionalAttestationEscrowObligation attestationUnconditionalEscrow =
            new UnconditionalAttestationEscrowObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));
        AttestationReferenceEscrowObligation attestationReferenceEscrow =
            new AttestationReferenceEscrowObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));
        UnconditionalAttestationReferenceEscrowObligation attestationReferenceUnconditionalEscrow = new UnconditionalAttestationReferenceEscrowObligation(
            IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress)
        );
        AtomicAttestationUtils atomicAttestationUtils = new AtomicAttestationUtils(IEAS(easAddress));

        // Deploy hook-based escrow contracts and hooks
        HookEscrowObligation hookEscrow =
            new HookEscrowObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));
        HooksEscrowObligation hooksEscrow =
            new HooksEscrowObligation(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));
        ERC20EscrowHook erc20EscrowHook = new ERC20EscrowHook();
        ERC721EscrowHook erc721EscrowHook = new ERC721EscrowHook();
        ERC1155EscrowHook erc1155EscrowHook = new ERC1155EscrowHook();
        NativeTokenEscrowHook nativeTokenEscrowHook = new NativeTokenEscrowHook();
        AttestationEscrowHook attestationEscrowHook = new AttestationEscrowHook(IEAS(easAddress));
        AttestationReferenceEscrowHook attestationReferenceEscrowHook =
            new AttestationReferenceEscrowHook(IEAS(easAddress), ISchemaRegistry(schemaRegistryAddress));

        // Deploy splitters
        ERC20Splitter erc20Splitter = new ERC20Splitter(IEAS(easAddress), erc20Escrow);
        ERC1155Splitter erc1155Splitter = new ERC1155Splitter(IEAS(easAddress), erc1155Escrow);
        NativeTokenSplitter nativeTokenSplitter = new NativeTokenSplitter(IEAS(easAddress), nativeEscrow);
        TokenBundleSplitter tokenBundleSplitter = new TokenBundleSplitter(IEAS(easAddress), bundleEscrow);
        TokenBundleSplitterUnvalidated tokenBundleSplitterUnvalidated =
            new TokenBundleSplitterUnvalidated(IEAS(easAddress), bundleEscrow);
        CommitmentERC20Splitter commitmentERC20Splitter = new CommitmentERC20Splitter(IEAS(easAddress), erc20Escrow);
        CommitmentERC1155Splitter commitmentERC1155Splitter =
            new CommitmentERC1155Splitter(IEAS(easAddress), erc1155Escrow);
        CommitmentNativeTokenSplitter commitmentNativeTokenSplitter =
            new CommitmentNativeTokenSplitter(IEAS(easAddress), nativeEscrow);
        CommitmentTokenBundleSplitter commitmentTokenBundleSplitter =
            new CommitmentTokenBundleSplitter(IEAS(easAddress), bundleEscrow);
        CommitmentTokenBundleSplitterUnvalidated commitmentTokenBundleSplitterUnvalidated =
            new CommitmentTokenBundleSplitterUnvalidated(IEAS(easAddress), bundleEscrow);

        vm.stopBroadcast();

        // Print all deployed addresses
        console.log("\nEAS:");
        console.log("EAS:", easAddress);
        console.log("Schema Registry:", schemaRegistryAddress);

        console.log("\nArbiters:");
        console.log("TrivialArbiter:", address(trivialArbiter));
        console.log("TrustedOracleArbiter:", address(trustedOracleArbiter));
        console.log("CommitmentTrustedOracleArbiter:", address(commitmentTrustedOracleArbiter));
        console.log("ReferencesEscrowArbiter:", address(referencesEscrowArbiter));

        console.log("\nAdditional Arbiters:");
        console.log("AllArbiter:", address(allArbiter));
        console.log("AnyArbiter:", address(anyArbiter));
        console.log("IntrinsicsArbiter:", address(intrinsicsArbiter));
        console.log("ERC8004Arbiter:", address(erc8004Arbiter));

        console.log("\nConfirmation Arbiters:");
        console.log("NonexclusiveUnrevocableConfirmationArbiter:", address(nonexclusiveUnrevocableConfirmationArbiter));
        console.log("NonexclusiveRevocableConfirmationArbiter:", address(nonexclusiveRevocableConfirmationArbiter));
        console.log("ExclusiveUnrevocableConfirmationArbiter:", address(exclusiveUnrevocableConfirmationArbiter));
        console.log("ExclusiveRevocableConfirmationArbiter:", address(exclusiveRevocableConfirmationArbiter));

        console.log("\nAttestation Property Arbiters:");
        console.log("AttesterArbiter:", address(attesterArbiter));
        console.log("ExpirationTimeAfterArbiter:", address(expirationTimeAfterArbiter));
        console.log("ExpirationTimeBeforeArbiter:", address(expirationTimeBeforeArbiter));
        console.log("ExpirationTimeEqualArbiter:", address(expirationTimeEqualArbiter));
        console.log("RecipientArbiter:", address(recipientArbiter));
        console.log("RefUidArbiter:", address(refUidArbiter));
        console.log("RevocableArbiter:", address(revocableArbiter));
        console.log("SchemaArbiter:", address(schemaArbiter));
        console.log("TimeAfterArbiter:", address(timeAfterArbiter));
        console.log("TimeBeforeArbiter:", address(timeBeforeArbiter));
        console.log("TimeEqualArbiter:", address(timeEqualArbiter));
        console.log("UidArbiter:", address(uidArbiter));

        console.log("\nString Obligation:");
        console.log("StringObligation:", address(stringObligation));

        console.log("\nCommit Reveal Obligation:");
        console.log("CommitRevealObligation:", address(commitRevealObligation));

        console.log("\nERC20 Contracts:");
        console.log("ERC20EscrowObligation:", address(erc20Escrow));
        console.log("UnconditionalERC20EscrowObligation:", address(erc20UnconditionalEscrow));
        console.log("ERC20PaymentObligation:", address(erc20Payment));

        console.log("\nERC721 Contracts:");
        console.log("ERC721EscrowObligation:", address(erc721Escrow));
        console.log("UnconditionalERC721EscrowObligation:", address(erc721UnconditionalEscrow));
        console.log("ERC721PaymentObligation:", address(erc721Payment));

        console.log("\nERC1155 Contracts:");
        console.log("ERC1155EscrowObligation:", address(erc1155Escrow));
        console.log("UnconditionalERC1155EscrowObligation:", address(erc1155UnconditionalEscrow));
        console.log("ERC1155PaymentObligation:", address(erc1155Payment));

        console.log("\nTokenBundle Contracts:");
        console.log("TokenBundleEscrowObligation:", address(bundleEscrow));
        console.log("UnconditionalTokenBundleEscrowObligation:", address(bundleUnconditionalEscrow));
        console.log("TokenBundlePaymentObligation:", address(bundlePayment));

        console.log("\nNative Token Contracts:");
        console.log("NativeTokenEscrowObligation:", address(nativeEscrow));
        console.log("UnconditionalNativeTokenEscrowObligation:", address(nativeUnconditionalEscrow));
        console.log("NativeTokenPaymentObligation:", address(nativePayment));

        console.log("\nPayment Utility Contracts:");
        console.log("AtomicPaymentUtils:", address(atomicPaymentUtils));

        console.log("\nAttestation Contracts:");
        console.log("AttestationEscrowObligation:", address(attestationEscrow));
        console.log("UnconditionalAttestationEscrowObligation:", address(attestationUnconditionalEscrow));
        console.log("AttestationReferenceEscrowObligation:", address(attestationReferenceEscrow));
        console.log(
            "UnconditionalAttestationReferenceEscrowObligation:", address(attestationReferenceUnconditionalEscrow)
        );
        console.log("AtomicAttestationUtils:", address(atomicAttestationUtils));

        console.log("\nHook-based Escrow Contracts:");
        console.log("HookEscrowObligation:", address(hookEscrow));
        console.log("HooksEscrowObligation:", address(hooksEscrow));
        console.log("ERC20EscrowHook:", address(erc20EscrowHook));
        console.log("ERC721EscrowHook:", address(erc721EscrowHook));
        console.log("ERC1155EscrowHook:", address(erc1155EscrowHook));
        console.log("NativeTokenEscrowHook:", address(nativeTokenEscrowHook));
        console.log("AttestationEscrowHook:", address(attestationEscrowHook));
        console.log("AttestationReferenceEscrowHook:", address(attestationReferenceEscrowHook));

        console.log("\nSplitters:");
        console.log("ERC20Splitter:", address(erc20Splitter));
        console.log("ERC1155Splitter:", address(erc1155Splitter));
        console.log("NativeTokenSplitter:", address(nativeTokenSplitter));
        console.log("TokenBundleSplitter:", address(tokenBundleSplitter));
        console.log("TokenBundleSplitterUnvalidated:", address(tokenBundleSplitterUnvalidated));
        console.log("CommitmentERC20Splitter:", address(commitmentERC20Splitter));
        console.log("CommitmentERC1155Splitter:", address(commitmentERC1155Splitter));
        console.log("CommitmentNativeTokenSplitter:", address(commitmentNativeTokenSplitter));
        console.log("CommitmentTokenBundleSplitter:", address(commitmentTokenBundleSplitter));
        console.log("CommitmentTokenBundleSplitterUnvalidated:", address(commitmentTokenBundleSplitterUnvalidated));

        // Create JSON with deployed addresses
        string memory deploymentJson = "deploymentJson";

        // Add EAS addresses
        vm.serializeAddress(deploymentJson, "eas", easAddress);
        vm.serializeAddress(deploymentJson, "easSchemaRegistry", schemaRegistryAddress);

        // Add arbiter addresses
        vm.serializeAddress(deploymentJson, "trivialArbiter", address(trivialArbiter));
        vm.serializeAddress(deploymentJson, "trustedOracleArbiter", address(trustedOracleArbiter));
        vm.serializeAddress(deploymentJson, "commitmentTrustedOracleArbiter", address(commitmentTrustedOracleArbiter));
        vm.serializeAddress(deploymentJson, "referencesEscrowArbiter", address(referencesEscrowArbiter));

        // Add Additional Arbiters
        vm.serializeAddress(deploymentJson, "allArbiter", address(allArbiter));
        vm.serializeAddress(deploymentJson, "anyArbiter", address(anyArbiter));
        vm.serializeAddress(deploymentJson, "intrinsicsArbiter", address(intrinsicsArbiter));
        vm.serializeAddress(deploymentJson, "erc8004Arbiter", address(erc8004Arbiter));

        // Add Confirmation Arbiters
        vm.serializeAddress(
            deploymentJson,
            "nonexclusiveUnrevocableConfirmationArbiter",
            address(nonexclusiveUnrevocableConfirmationArbiter)
        );
        vm.serializeAddress(
            deploymentJson,
            "nonexclusiveRevocableConfirmationArbiter",
            address(nonexclusiveRevocableConfirmationArbiter)
        );
        vm.serializeAddress(
            deploymentJson, "exclusiveUnrevocableConfirmationArbiter", address(exclusiveUnrevocableConfirmationArbiter)
        );
        vm.serializeAddress(
            deploymentJson, "exclusiveRevocableConfirmationArbiter", address(exclusiveRevocableConfirmationArbiter)
        );

        // Add Attestation Property Arbiters
        vm.serializeAddress(deploymentJson, "attesterArbiter", address(attesterArbiter));
        vm.serializeAddress(deploymentJson, "expirationTimeAfterArbiter", address(expirationTimeAfterArbiter));
        vm.serializeAddress(deploymentJson, "expirationTimeBeforeArbiter", address(expirationTimeBeforeArbiter));
        vm.serializeAddress(deploymentJson, "expirationTimeEqualArbiter", address(expirationTimeEqualArbiter));
        vm.serializeAddress(deploymentJson, "recipientArbiter", address(recipientArbiter));
        vm.serializeAddress(deploymentJson, "refUidArbiter", address(refUidArbiter));
        vm.serializeAddress(deploymentJson, "revocableArbiter", address(revocableArbiter));
        vm.serializeAddress(deploymentJson, "schemaArbiter", address(schemaArbiter));
        vm.serializeAddress(deploymentJson, "timeAfterArbiter", address(timeAfterArbiter));
        vm.serializeAddress(deploymentJson, "timeBeforeArbiter", address(timeBeforeArbiter));
        vm.serializeAddress(deploymentJson, "timeEqualArbiter", address(timeEqualArbiter));
        vm.serializeAddress(deploymentJson, "uidArbiter", address(uidArbiter));

        // Add string obligation
        vm.serializeAddress(deploymentJson, "stringObligation", address(stringObligation));

        // Add commit reveal obligation
        vm.serializeAddress(deploymentJson, "commitRevealObligation", address(commitRevealObligation));

        // Add ERC20 addresses
        vm.serializeAddress(deploymentJson, "erc20EscrowObligation", address(erc20Escrow));
        vm.serializeAddress(deploymentJson, "erc20UnconditionalEscrowObligation", address(erc20UnconditionalEscrow));
        vm.serializeAddress(deploymentJson, "erc20PaymentObligation", address(erc20Payment));

        // Add ERC721 addresses
        vm.serializeAddress(deploymentJson, "erc721EscrowObligation", address(erc721Escrow));
        vm.serializeAddress(deploymentJson, "erc721UnconditionalEscrowObligation", address(erc721UnconditionalEscrow));
        vm.serializeAddress(deploymentJson, "erc721PaymentObligation", address(erc721Payment));

        // Add ERC1155 addresses
        vm.serializeAddress(deploymentJson, "erc1155EscrowObligation", address(erc1155Escrow));
        vm.serializeAddress(deploymentJson, "erc1155UnconditionalEscrowObligation", address(erc1155UnconditionalEscrow));
        vm.serializeAddress(deploymentJson, "erc1155PaymentObligation", address(erc1155Payment));

        // Add TokenBundle addresses
        vm.serializeAddress(deploymentJson, "tokenBundleEscrowObligation", address(bundleEscrow));
        vm.serializeAddress(
            deploymentJson, "tokenBundleUnconditionalEscrowObligation", address(bundleUnconditionalEscrow)
        );
        vm.serializeAddress(deploymentJson, "tokenBundlePaymentObligation", address(bundlePayment));

        // Add atomic payment utility address under current config keys.
        vm.serializeAddress(deploymentJson, "erc20AtomicPaymentUtils", address(atomicPaymentUtils));
        vm.serializeAddress(deploymentJson, "erc721AtomicPaymentUtils", address(atomicPaymentUtils));
        vm.serializeAddress(deploymentJson, "erc1155AtomicPaymentUtils", address(atomicPaymentUtils));
        vm.serializeAddress(deploymentJson, "tokenBundleAtomicPaymentUtils", address(atomicPaymentUtils));
        vm.serializeAddress(deploymentJson, "nativeTokenAtomicPaymentUtils", address(atomicPaymentUtils));

        // Add Native Token addresses
        vm.serializeAddress(deploymentJson, "nativeTokenEscrowObligation", address(nativeEscrow));
        vm.serializeAddress(
            deploymentJson, "nativeTokenUnconditionalEscrowObligation", address(nativeUnconditionalEscrow)
        );
        vm.serializeAddress(deploymentJson, "nativeTokenPaymentObligation", address(nativePayment));

        // Add Attestation addresses
        vm.serializeAddress(deploymentJson, "attestationEscrowObligation", address(attestationEscrow));
        vm.serializeAddress(
            deploymentJson, "attestationUnconditionalEscrowObligation", address(attestationUnconditionalEscrow)
        );
        vm.serializeAddress(deploymentJson, "attestationReferenceEscrowObligation", address(attestationReferenceEscrow));
        vm.serializeAddress(
            deploymentJson,
            "attestationReferenceUnconditionalEscrowObligation",
            address(attestationReferenceUnconditionalEscrow)
        );
        vm.serializeAddress(deploymentJson, "atomicAttestationUtils", address(atomicAttestationUtils));

        // Add hook-based escrow addresses
        vm.serializeAddress(deploymentJson, "hookEscrowObligation", address(hookEscrow));
        vm.serializeAddress(deploymentJson, "hooksEscrowObligation", address(hooksEscrow));
        vm.serializeAddress(deploymentJson, "erc20EscrowHook", address(erc20EscrowHook));
        vm.serializeAddress(deploymentJson, "erc721EscrowHook", address(erc721EscrowHook));
        vm.serializeAddress(deploymentJson, "erc1155EscrowHook", address(erc1155EscrowHook));
        vm.serializeAddress(deploymentJson, "nativeTokenEscrowHook", address(nativeTokenEscrowHook));
        vm.serializeAddress(deploymentJson, "attestationEscrowHook", address(attestationEscrowHook));
        vm.serializeAddress(deploymentJson, "attestationReferenceEscrowHook", address(attestationReferenceEscrowHook));

        // Add splitter addresses
        vm.serializeAddress(deploymentJson, "erc20Splitter", address(erc20Splitter));
        vm.serializeAddress(deploymentJson, "erc1155Splitter", address(erc1155Splitter));
        vm.serializeAddress(deploymentJson, "nativeTokenSplitter", address(nativeTokenSplitter));
        vm.serializeAddress(deploymentJson, "tokenBundleSplitter", address(tokenBundleSplitter));
        vm.serializeAddress(deploymentJson, "tokenBundleSplitterUnvalidated", address(tokenBundleSplitterUnvalidated));
        vm.serializeAddress(deploymentJson, "commitmentERC20Splitter", address(commitmentERC20Splitter));
        vm.serializeAddress(deploymentJson, "commitmentERC1155Splitter", address(commitmentERC1155Splitter));
        vm.serializeAddress(deploymentJson, "commitmentNativeTokenSplitter", address(commitmentNativeTokenSplitter));
        vm.serializeAddress(deploymentJson, "commitmentTokenBundleSplitter", address(commitmentTokenBundleSplitter));
        string memory finalJson = vm.serializeAddress(
            deploymentJson,
            "commitmentTokenBundleSplitterUnvalidated",
            address(commitmentTokenBundleSplitterUnvalidated)
        );

        // Generate timestamp for filename
        uint256 timestamp = block.timestamp;
        string memory filename = string.concat("./deployments/deployment_", vm.toString(timestamp), ".json");

        // Write JSON to file
        vm.writeJson(finalJson, filename);
        console.log("\nSaving addresses to", filename);

        console.log("\nDeployment complete!");
    }
}
