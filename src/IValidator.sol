// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {IArbiter} from "./IArbiter.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {SchemaResolver} from "@eas/resolver/SchemaResolver.sol";
import {Attestation} from "@eas/Common.sol";

/**
 * @title IValidator
 * @dev Abstract contract for validating attestations in the EAS ecosystem.
 * This contract extends IArbiter and SchemaResolver to provide validation-specific functionality.
 */
abstract contract IValidator is IArbiter, SchemaResolver {
    /// @notice The schema registry used for registering validator schemas
    ISchemaRegistry public immutable schemaRegistry;

    /// @notice The EAS (Ethereum Attestation Service) instance
    IEAS public immutable eas;

    /**
     * @dev Constructor to initialize the IValidator contract.
     * @param _eas The EAS instance.
     * @param _schemaRegistry The schema registry instance.
     * @param schema The schema string for the validator.
     * @param revocable Whether the validator attestations are revocable.
     */
    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry, string memory schema, bool revocable)
        SchemaResolver(_eas)
    {
        eas = _eas;
        schemaRegistry = _schemaRegistry;
        ATTESTATION_SCHEMA = schemaRegistry.register(schema, this, revocable);
    }

    /**
     * @dev Callback function for attestation. Ensures only the contract can attest.
     * @param attestation The attestation being made.
     * @return bool Returns true if the attestation is valid.
     */
    function onAttest(Attestation calldata attestation, uint256 /* value */ ) internal view override returns (bool) {
        // only statement contract can attest
        return attestation.attester == address(this);
    }

    /**
     * @dev Callback function for revocation. Always returns true in this implementation.
     * @return bool Always returns true, allowing revocations.
     */
    function onRevoke(Attestation calldata, uint256 /* value */ ) internal pure override returns (bool) {
        return true;
    }
}
