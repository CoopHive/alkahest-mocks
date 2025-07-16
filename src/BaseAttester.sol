// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {IArbiter} from "./IArbiter.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {SchemaResolver} from "@eas/resolver/SchemaResolver.sol";
import {Attestation} from "@eas/Common.sol";
import {AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";

abstract contract BaseAttester is SchemaResolver {
    ISchemaRegistry internal immutable schemaRegistry;
    IEAS internal immutable eas;
    bytes32 public immutable ATTESTATION_SCHEMA;

    error NotFromThisAttester();

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
        // only this contract can attest
        return attestation.attester == address(this);
    }

    function onRevoke(
        Attestation calldata attestation,
        uint256 /* value */
    ) internal view override returns (bool) {
        // only this contract can revoke
        return attestation.attester == address(this);
    }

    function getSchema() external view returns (SchemaRecord memory) {
        return schemaRegistry.getSchema(ATTESTATION_SCHEMA);
    }

    // Internal helper for creating attestations
    function _attest(
        bytes memory data,
        address recipient,
        uint64 expirationTime,
        bytes32 refUID
    ) internal returns (bytes32) {
        return
            eas.attest(
                AttestationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: AttestationRequestData({
                        recipient: recipient,
                        expirationTime: expirationTime,
                        revocable: true,
                        refUID: refUID,
                        data: data,
                        value: 0
                    })
                })
            );
    }

    function _getAttestation(
        bytes32 uid
    ) internal view returns (Attestation memory attestation_) {
        attestation_ = eas.getAttestation(uid);
        if (attestation_.schema != ATTESTATION_SCHEMA)
            revert NotFromThisAttester();
    }
}
