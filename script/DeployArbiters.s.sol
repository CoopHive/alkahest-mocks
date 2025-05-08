// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Script.sol";

// import {TrustedPartyArbiter} from "@src/arbiters/TrustedPartyArbiter.sol";
import {TrivialArbiter} from "@src/arbiters/TrivialArbiter.sol";

contract DeployArbiters is Script {
    function run() external {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("DEPLOYMENT_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy
        // TrustedPartyArbiter trustedPartyArbiter = new TrustedPartyArbiter();
        TrivialArbiter trivialArbiter = new TrivialArbiter();

        vm.stopBroadcast();

        // Print deployed addresses
        console.log("\nValidator Contracts:");
        // console.log("TrustedPartyArbiter:", address(trustedPartyArbiter));
        console.log("TrivialArbiter:", address(trivialArbiter));
    }
}
