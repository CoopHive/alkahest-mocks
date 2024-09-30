// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {IArbiter} from "./IArbiter.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {SchemaResolver} from "@eas/resolver/SchemaResolver.sol";
import {Attestation} from "@eas/Common.sol";

abstract contract IStatement is IArbiter, SchemaResolver {
    ISchemaRegistry public immutable schemaRegistry;
    IEAS public immutable eas;
    bytes32 public immutable ATTESTATION_SCHEMA;

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry,
        string memory schema,
        bool revocable
    ) SchemaResolver(_eas) {
        eas = _eas;
        schemaRegistry = _schemaRegistry;
        ATTESTATION_SCHEMA = schemaRegistry.register(schema, this, revocable);
    }

    function onAttest(
        Attestation calldata attestation,
        uint256 /* value */
    ) internal view override returns (bool) {
        // only statement contract can attest
        return attestation.attester == address(this);
    }

    function onRevoke(
        Attestation calldata,
        uint256 /* value */
    ) internal pure override returns (bool) {
        return true;
    }

    function getStatement(
        bytes32 uid
    ) external view returns (Attestation memory) {
        Attestation memory attestation = eas.getAttestation(uid);
        if (!_checkSchema(attestation, ATTESTATION_SCHEMA))
            revert InvalidSchema();
        return attestation;
    }

    function getSchema() external view returns (SchemaRecord memory) {
        return schemaRegistry.getSchema(ATTESTATION_SCHEMA);
    }
}
