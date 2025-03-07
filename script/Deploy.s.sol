// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import "forge-std/Script.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";

// ERC20 Contracts
import {ERC20EscrowObligation} from "@src/obligations/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "@src/obligations/ERC20PaymentObligation.sol";
import {ERC20BarterUtils} from "@src/utils/ERC20BarterUtils.sol";
import {ERC20PaymentFulfillmentArbiter} from "@src/arbiters/deprecated/ERC20PaymentFulfillmentArbiter.sol";
import {ERC20EscrowBarterUtils} from "@src/utils/deprecated/ERC20EscrowBarterUtils.sol";
import {ERC20BarterCrossToken} from "@src/utils/ERC20BarterCrossToken.sol";

// ERC721 Contracts
import {ERC721EscrowObligation} from "@src/obligations/ERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "@src/obligations/ERC721PaymentObligation.sol";
import {ERC721BarterUtils} from "@src/utils/ERC721BarterUtils.sol";
import {ERC721PaymentFulfillmentArbiter} from "@src/arbiters/deprecated/ERC721PaymentFulfillmentArbiter.sol";
// import {ERC721EscrowBarterUtils} from "@src/utils/ERC721EscrowBarterUtils.sol";
import {ERC721BarterCrossToken} from "@src/utils/ERC721BarterCrossToken.sol";

// ERC1155 Contracts
import {ERC1155EscrowObligation} from "@src/obligations/ERC1155EscrowObligation.sol";
import {ERC1155PaymentObligation} from "@src/obligations/ERC1155PaymentObligation.sol";
import {ERC1155BarterUtils} from "@src/utils/ERC1155BarterUtils.sol";
import {ERC1155PaymentFulfillmentArbiter} from "@src/arbiters/deprecated/ERC1155PaymentFulfillmentArbiter.sol";
// import {ERC1155EscrowBarterUtils} from "@src/utils/ERC1155EscrowBarterUtils.sol";
import {ERC1155BarterCrossToken} from "@src/utils/ERC1155BarterCrossToken.sol";

// TokenBundle Contracts
import {TokenBundleEscrowObligation} from "@src/obligations/TokenBundleEscrowObligation.sol";
import {TokenBundlePaymentObligation} from "@src/obligations/TokenBundlePaymentObligation.sol";
import {TokenBundleBarterUtils} from "@src/utils/TokenBundleBarterUtils.sol";
import {TokenBundlePaymentFulfillmentArbiter} from "@src/arbiters/deprecated/TokenBundlePaymentFulfillmentArbiter.sol";
// import {TokenBundleEscrowBarterUtils} from "@src/utils/TokenBundleEscrowBarterUtils.sol";

// Attestation Contracts
import {AttestationEscrowObligation} from "@src/obligations/AttestationEscrowObligation.sol";
import {AttestationEscrowObligation2} from "@src/obligations/AttestationEscrowObligation2.sol";
import {AttestationBarterUtils} from "@src/utils/AttestationBarterUtils.sol";

// Common
import {SpecificAttestationArbiter} from "@src/arbiters/SpecificAttestationArbiter.sol";

contract Deploy is Script {
    function run() external {
        // Load environment variables
        address easAddress = vm.envAddress("EAS_ADDRESS");
        address schemaRegistryAddress = vm.envAddress("EAS_SR_ADDRESS");
        uint256 deployerPrivateKey = vm.envUint("DEPLOYMENT_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy common contracts
        SpecificAttestationArbiter specificArbiter = new SpecificAttestationArbiter();

        // Deploy ERC20 contracts
        ERC20EscrowObligation erc20Escrow = new ERC20EscrowObligation(
            IEAS(easAddress),
            ISchemaRegistry(schemaRegistryAddress)
        );
        ERC20PaymentObligation erc20Payment = new ERC20PaymentObligation(
            IEAS(easAddress),
            ISchemaRegistry(schemaRegistryAddress)
        );
        ERC20PaymentFulfillmentArbiter erc20FulfillmentArbiter = new ERC20PaymentFulfillmentArbiter(
                erc20Escrow,
                specificArbiter
            );
        ERC20BarterUtils erc20BarterUtils = new ERC20BarterUtils(
            IEAS(easAddress),
            erc20Escrow,
            erc20Payment
        );
        ERC20EscrowBarterUtils erc20EscrowBarterUtils = new ERC20EscrowBarterUtils(
                IEAS(easAddress),
                erc20Escrow,
                erc20FulfillmentArbiter,
                specificArbiter
            );

        // Deploy ERC721 contracts
        ERC721EscrowObligation erc721Escrow = new ERC721EscrowObligation(
            IEAS(easAddress),
            ISchemaRegistry(schemaRegistryAddress)
        );
        ERC721PaymentObligation erc721Payment = new ERC721PaymentObligation(
            IEAS(easAddress),
            ISchemaRegistry(schemaRegistryAddress)
        );
        ERC721PaymentFulfillmentArbiter erc721FulfillmentArbiter = new ERC721PaymentFulfillmentArbiter(
                erc721Escrow,
                specificArbiter
            );
        ERC721BarterUtils erc721BarterUtils = new ERC721BarterUtils(
            IEAS(easAddress),
            erc721Escrow,
            erc721Payment
        );

        /*
        ERC721EscrowBarterUtils erc721EscrowBarterUtils = new ERC721EscrowBarterUtils(
                IEAS(easAddress),
                erc721Escrow,
                erc721FulfillmentArbiter,
                specificArbiter
            );
        */

        // Deploy ERC1155 contracts
        ERC1155EscrowObligation erc1155Escrow = new ERC1155EscrowObligation(
            IEAS(easAddress),
            ISchemaRegistry(schemaRegistryAddress)
        );
        ERC1155PaymentObligation erc1155Payment = new ERC1155PaymentObligation(
            IEAS(easAddress),
            ISchemaRegistry(schemaRegistryAddress)
        );
        ERC1155PaymentFulfillmentArbiter erc1155FulfillmentArbiter = new ERC1155PaymentFulfillmentArbiter(
                erc1155Escrow,
                specificArbiter
            );
        ERC1155BarterUtils erc1155BarterUtils = new ERC1155BarterUtils(
            IEAS(easAddress),
            erc1155Escrow,
            erc1155Payment
        );

        /*
        ERC1155EscrowBarterUtils erc1155EscrowBarterUtils = new ERC1155EscrowBarterUtils(
                IEAS(easAddress),
                erc1155Escrow,
                erc1155FulfillmentArbiter,
                specificArbiter
            );
        */

        // Deploy TokenBundle contracts
        TokenBundleEscrowObligation bundleEscrow = new TokenBundleEscrowObligation(
                IEAS(easAddress),
                ISchemaRegistry(schemaRegistryAddress)
            );
        TokenBundlePaymentObligation bundlePayment = new TokenBundlePaymentObligation(
                IEAS(easAddress),
                ISchemaRegistry(schemaRegistryAddress)
            );
        TokenBundlePaymentFulfillmentArbiter bundleFulfillmentArbiter = new TokenBundlePaymentFulfillmentArbiter(
                bundleEscrow,
                specificArbiter
            );
        TokenBundleBarterUtils bundleBarterUtils = new TokenBundleBarterUtils(
            IEAS(easAddress),
            bundleEscrow,
            bundlePayment
        );

        /*
        TokenBundleEscrowBarterUtils bundleEscrowBarterUtils = new TokenBundleEscrowBarterUtils(
                IEAS(easAddress),
                bundleEscrow,
                bundleFulfillmentArbiter,
                specificArbiter
            );
        */

        // Deploy cross token barter contracts
        ERC20BarterCrossToken erc20BarterCrossToken = new ERC20BarterCrossToken(
            IEAS(easAddress),
            erc20Escrow,
            erc20Payment,
            erc721Escrow,
            erc721Payment,
            erc1155Escrow,
            erc1155Payment,
            bundleEscrow,
            bundlePayment
        );

        ERC721BarterCrossToken erc721BarterCrossToken = new ERC721BarterCrossToken(
                IEAS(easAddress),
                erc20Escrow,
                erc20Payment,
                erc721Escrow,
                erc721Payment,
                erc1155Escrow,
                erc1155Payment,
                bundleEscrow,
                bundlePayment
            );

        ERC1155BarterCrossToken erc1155BarterCrossToken = new ERC1155BarterCrossToken(
                IEAS(easAddress),
                erc20Escrow,
                erc20Payment,
                erc721Escrow,
                erc721Payment,
                erc1155Escrow,
                erc1155Payment,
                bundleEscrow,
                bundlePayment
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
        console.log("\nCommon Contracts:");
        console.log("SpecificAttestationArbiter:", address(specificArbiter));

        console.log("\nERC20 Contracts:");
        console.log("ERC20EscrowObligation:", address(erc20Escrow));
        console.log("ERC20PaymentObligation:", address(erc20Payment));
        console.log(
            "ERC20PaymentFulfillmentArbiter:",
            address(erc20FulfillmentArbiter)
        );
        console.log("ERC20BarterUtils:", address(erc20BarterUtils));
        console.log("ERC20EscrowBarterUtils:", address(erc20EscrowBarterUtils));
        console.log("ERC20BarterCrossToken:", address(erc20BarterCrossToken));

        console.log("\nERC721 Contracts:");
        console.log("ERC721EscrowObligation:", address(erc721Escrow));
        console.log("ERC721PaymentObligation:", address(erc721Payment));
        console.log(
            "ERC721PaymentFulfillmentArbiter:",
            address(erc721FulfillmentArbiter)
        );
        console.log("ERC721BarterUtils:", address(erc721BarterUtils));
        console.log("ERC721BarterCrossToken:", address(erc721BarterCrossToken));

        /*
        console.log(
            "ERC721EscrowBarterUtils:",
            address(erc721EscrowBarterUtils)
        );
        */

        console.log("\nERC1155 Contracts:");
        console.log("ERC1155EscrowObligation:", address(erc1155Escrow));
        console.log("ERC1155PaymentObligation:", address(erc1155Payment));
        console.log(
            "ERC1155PaymentFulfillmentArbiter:",
            address(erc1155FulfillmentArbiter)
        );
        console.log("ERC1155BarterUtils:", address(erc1155BarterUtils));
        console.log(
            "ERC1155BarterCrossToken:",
            address(erc1155BarterCrossToken)
        );

        /*
        console.log(
            "ERC1155EscrowBarterUtils:",
            address(erc1155EscrowBarterUtils)
        );
        */

        console.log("\nTokenBundle Contracts:");
        console.log("TokenBundleEscrowObligation:", address(bundleEscrow));
        console.log("TokenBundlePaymentObligation:", address(bundlePayment));
        console.log(
            "TokenBundlePaymentFulfillmentArbiter:",
            address(bundleFulfillmentArbiter)
        );
        console.log("TokenBundleBarterUtils:", address(bundleBarterUtils));

        /*
        console.log(
            "TokenBundleEscrowBarterUtils:",
            address(bundleEscrowBarterUtils)
        );
        */

        console.log("\nAttestation Barter Contracts:");
        console.log("AttestationEscrowObligation:", address(attestationEscrow));
        console.log(
            "AttestationEscrowObligation2:",
            address(attestationEscrow2)
        );
        console.log("AttestationBarterUtils:", address(attestationBarterUtils));
    }
}
