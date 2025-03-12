// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import {IEAS} from "@eas/IEAS.sol";

import {TrustedOracleArbiter} from "@src/arbiters/TrustedOracleArbiter.sol";

contract DeployCrossTokenBarter is Script {
    function run() external {
        // Load environment variables
        address easAddress = vm.envAddress("EAS_ADDRESS");
        uint256 deployerPrivateKey = vm.envUint("DEPLOYMENT_KEY");

        // deploy
        vm.startBroadcast(deployerPrivateKey);

        TrustedOracleArbiter trustedOracleArbiter = new TrustedOracleArbiter(
            IEAS(easAddress)
        );

        vm.stopBroadcast();

        // Print deployed addresses
        console.log("TrustedOracleArbiter:", address(trustedOracleArbiter));
    }
}
