// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IArbiter} from "./IArbiter.sol";
import {IEAS} from "lib/eas-contracts/contracts/IEAS.sol";
import {ISchemaRegistry} from "lib/eas-contracts/contracts/ISchemaRegistry.sol";
import {SchemaResolver} from "lib/eas-contracts/contracts/resolver/SchemaResolver.sol";

abstract contract IStatement is IArbiter, SchemaResolver {
    ISchemaRegistry public schemaRegistry;
    IEAS public eas;

    constructor(IEAS _eas) SchemaResolver(_eas) {}
}
