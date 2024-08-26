// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {IArbiter} from "./IArbiter.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {SchemaResolver} from "@eas/resolver/SchemaResolver.sol";
import {Attestation} from "@eas/Common.sol";

abstract contract IValidator is IArbiter, SchemaResolver {
    ISchemaRegistry public immutable schemaRegistry;
    IEAS public immutable eas;

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry, string memory schema, bool revocable)
        SchemaResolver(_eas)
    {
        eas = _eas;
        schemaRegistry = _schemaRegistry;
        ATTESTATION_SCHEMA = schemaRegistry.register(schema, this, revocable);
    }

    function onAttest(Attestation calldata attestation, uint256 /* value */ ) internal view override returns (bool) {
        // only statement contract can attest
        if (attestation.attester != address(this)) {
            return false;
        }
        return true;
    }

    function onRevoke(Attestation calldata, uint256 /* value */ ) internal pure override returns (bool) {
        return true;
    }
}
