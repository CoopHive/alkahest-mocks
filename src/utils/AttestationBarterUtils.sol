// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {SchemaResolver} from "@eas/resolver/SchemaResolver.sol";
import {AttestationEscrowObligation2} from "../obligations/AttestationEscrowObligation2.sol";

contract AttestationBarterUtils is SchemaResolver {
    IEAS public immutable eas;
    ISchemaRegistry public immutable schemaRegistry;
    AttestationEscrowObligation2 public immutable escrowContract;

    mapping(bytes32 => address) public schemaResolvers;

    event SchemaRegistered(
        bytes32 indexed schemaId,
        string schema,
        address resolver
    );

    error InvalidResolver();
    error InvalidSchema();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry,
        AttestationEscrowObligation2 _escrowContract
    ) SchemaResolver(_eas) {
        eas = _eas;
        schemaRegistry = _schemaRegistry;
        escrowContract = _escrowContract;
    }

    function registerSchema(
        string calldata schema,
        SchemaResolver resolver,
        bool revocable
    ) external returns (bytes32) {
        bytes32 schemaId = schemaRegistry.register(schema, resolver, revocable);
        schemaResolvers[schemaId] = address(resolver);
        emit SchemaRegistered(schemaId, schema, address(resolver));
        return schemaId;
    }

    function attest(
        bytes32 schema,
        address recipient,
        uint64 expirationTime,
        bool revocable,
        bytes32 refUID,
        bytes calldata data
    ) external returns (bytes32) {
        return
            eas.attest(
                AttestationRequest({
                    schema: schema,
                    data: AttestationRequestData({
                        recipient: recipient,
                        expirationTime: expirationTime,
                        revocable: revocable,
                        refUID: refUID,
                        data: data,
                        value: 0
                    })
                })
            );
    }

    function attestAndCreateEscrow(
        AttestationRequest calldata attestationRequest,
        address arbiter,
        bytes calldata demand,
        uint64 expiration
    ) external returns (bytes32 attestationUid, bytes32 escrowUid) {
        // First create the attestation
        attestationUid = eas.attest(attestationRequest);

        // Then create the escrow statement
        AttestationEscrowObligation2.StatementData
            memory escrowData = AttestationEscrowObligation2.StatementData({
                attestationUid: attestationUid,
                arbiter: arbiter,
                demand: demand
            });

        escrowUid = escrowContract.doObligation(escrowData, expiration);
    }

    function onAttest(
        Attestation calldata /* attestation */,
        uint256
    ) internal pure override returns (bool) {
        return true; // Allow all attestations
    }

    function onRevoke(
        Attestation calldata /* attestation */,
        uint256
    ) internal pure override returns (bool) {
        return true; // Allow all revocations
    }

    function getSchema(
        bytes32 schemaId
    ) external view returns (SchemaRecord memory) {
        return schemaRegistry.getSchema(schemaId);
    }
}
