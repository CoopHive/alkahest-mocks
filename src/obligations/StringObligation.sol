// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseObligation} from "../BaseObligation.sol";

contract StringObligation is BaseObligation {
    struct ObligationData {
        string item;
    }

    error AttestationCreateFailed();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    ) BaseObligation(_eas, _schemaRegistry, "string item", true) {}

    function doObligation(
        ObligationData calldata data,
        bytes32 refUID
    ) public returns (bytes32 uid_) {
        // Create attestation with try/catch for potential EAS failures
        try
            eas.attest(
                AttestationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: AttestationRequestData({
                        recipient: msg.sender,
                        expirationTime: 0,
                        revocable: false,
                        refUID: refUID,
                        data: abi.encode(data),
                        value: 0
                    })
                })
            )
        returns (bytes32 uid) {
            uid_ = uid;
        } catch {
            revert AttestationCreateFailed();
        }
    }

    function getObligationData(
        bytes32 uid
    ) public view returns (ObligationData memory) {
        Attestation memory attestation = eas.getAttestation(uid);
        if (attestation.schema != ATTESTATION_SCHEMA) revert NotFromObligation();
        return abi.decode(attestation.data, (ObligationData));
    }

    function decodeObligationData(
        bytes calldata data
    ) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
