// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseStatement} from "../BaseStatement.sol";

contract JobResultObligation is BaseStatement {
    struct StatementData {
        string result;
    }

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    ) BaseStatement(_eas, _schemaRegistry, "string result", true) {}

    function makeStatement(
        StatementData calldata data,
        bytes32 refUID
    ) public returns (bytes32) {
        return
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
            );
    }
}
