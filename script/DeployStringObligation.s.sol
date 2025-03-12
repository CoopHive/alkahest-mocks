// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Script.sol";

import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";

contract DeployStringObligation is Script {
    function run() external {
        // Load environment variables
        address easAddress = vm.envAddress("EAS_ADDRESS");
        address schemaRegistryAddress = vm.envAddress("EAS_SR_ADDRESS");
        uint256 deployerPrivateKey = vm.envUint("DEPLOYMENT_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy
        StringObligation stringObligation = new StringObligation(
            IEAS(easAddress),
            ISchemaRegistry(schemaRegistryAddress)
        );

        vm.stopBroadcast();

        // Print deployed addresses
        console.log("StringObligation:", address(stringObligation));
    }
}
