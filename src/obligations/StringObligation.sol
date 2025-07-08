// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseStatement} from "../BaseStatement.sol";

contract StringObligation is BaseStatement {
    struct StatementData {
        string item;
    }

    error AttestationCreateFailed();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    ) BaseStatement(_eas, _schemaRegistry, "string item", true) {}

    function doObligation(
        StatementData calldata data,
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

    function getStatementData(
        bytes32 uid
    ) public view returns (StatementData memory) {
        Attestation memory attestation = eas.getAttestation(uid);
        if (attestation.schema != ATTESTATION_SCHEMA) revert NotFromStatement();
        return abi.decode(attestation.data, (StatementData));
    }

    function decodeStatementData(
        bytes calldata data
    ) public pure returns (StatementData memory) {
        return abi.decode(data, (StatementData));
    }
}
