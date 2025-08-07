// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import {IEAS} from "@eas/IEAS.sol";

import {ERC20BarterUtils} from "@src/utils/ERC20BarterUtils.sol";
import {ERC721BarterUtils} from "@src/utils/ERC721BarterUtils.sol";
import {ERC1155BarterUtils} from "@src/utils/ERC1155BarterUtils.sol";

import {ERC20EscrowObligation} from "@src/obligations/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "@src/obligations/ERC20PaymentObligation.sol";
import {ERC721EscrowObligation} from "@src/obligations/ERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "@src/obligations/ERC721PaymentObligation.sol";
import {ERC1155EscrowObligation} from "@src/obligations/ERC1155EscrowObligation.sol";
import {ERC1155PaymentObligation} from "@src/obligations/ERC1155PaymentObligation.sol";
import {TokenBundleEscrowObligation2} from "@src/obligations/TokenBundleEscrowObligation2.sol";
import {TokenBundlePaymentObligation2} from "@src/obligations/TokenBundlePaymentObligation2.sol";
import {NativeTokenEscrowObligation} from "@src/obligations/NativeTokenEscrowObligation.sol";
import {NativeTokenPaymentObligation} from "@src/obligations/NativeTokenPaymentObligation.sol";

contract DeployCrossTokenBarter is Script {
    function run() external {
        // Load environment variables
        address easAddress = vm.envAddress("EAS_ADDRESS");
        uint256 deployerPrivateKey = vm.envUint("DEPLOYMENT_KEY");

        // Previously deployed contract addresses cast to their actual types
        ERC20EscrowObligation erc20Escrow = ERC20EscrowObligation(
            payable(0x66F9e3Fa7CFc472fB61a3F61bE42558c80C0FC72)
        );
        ERC20PaymentObligation erc20Payment = ERC20PaymentObligation(
            payable(0x417b73fF013c5E47639816c037e89aE053FD4A63)
        );
        ERC721EscrowObligation erc721Escrow = ERC721EscrowObligation(
            payable(0x868e59ecd79067087Cac7447061b1436eD6C9417)
        );
        ERC721PaymentObligation erc721Payment = ERC721PaymentObligation(
            payable(0x0F13f5c62D88BE6C85205A1A010511BF54269615)
        );
        ERC1155EscrowObligation erc1155Escrow = ERC1155EscrowObligation(
            payable(0x93B7D9cdD97887a8f7603c77F12938bf3d1331F6)
        );
        ERC1155PaymentObligation erc1155Payment = ERC1155PaymentObligation(
            payable(0x1395A7b129503E23eDAa7823b5F5994D65a26BF0)
        );
        TokenBundleEscrowObligation2 bundleEscrow = TokenBundleEscrowObligation2(
                payable(0x7cCE97b9552dFf0105eC96A46f5721764a24D9AC)
            );
        TokenBundlePaymentObligation2 bundlePayment = TokenBundlePaymentObligation2(
                payable(0x678f5601fe66485CEeD3d41D7385983881411c70)
            );
        NativeTokenEscrowObligation nativeEscrow = NativeTokenEscrowObligation(
            payable(address(0)) // TODO: Replace with deployed address
        );
        NativeTokenPaymentObligation nativePayment = NativeTokenPaymentObligation(
            payable(address(0)) // TODO: Replace with deployed address
        );

        vm.startBroadcast(deployerPrivateKey);

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

        vm.stopBroadcast();

        // Print deployed addresses
        console.log("\nBarter Utils Contracts:");
        console.log("ERC20BarterUtils:", address(erc20BarterUtils));
        console.log("ERC721BarterUtils:", address(erc721BarterUtils));
        console.log("ERC1155BarterUtils:", address(erc1155BarterUtils));
    }
}
