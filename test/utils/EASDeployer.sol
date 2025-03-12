// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "forge-std/console.sol";

// Import the EAS contracts
import {SchemaRegistry} from "@eas/SchemaRegistry.sol";
import {EAS} from "@eas/EAS.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";

contract EASDeployer is Test {
    /// @notice Deploy EAS contracts locally instead of forking a live network
    /// @return eas The deployed EAS contract instance
    /// @return easRegistry The deployed SchemaRegistry contract instance
    function deployEAS() public returns (IEAS, ISchemaRegistry) {
        // Deploy SchemaRegistry first
        SchemaRegistry schemaRegistry = new SchemaRegistry();

        // Deploy EAS with the SchemaRegistry address
        EAS eas = new EAS(schemaRegistry);

        // Log the deployed addresses for debugging
        console.log("SchemaRegistry deployed at:", address(schemaRegistry));
        console.log("EAS deployed at:", address(eas));

        return (IEAS(address(eas)), ISchemaRegistry(address(schemaRegistry)));
    }
}
