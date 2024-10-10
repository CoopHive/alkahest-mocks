// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseStatement} from "../BaseStatement.sol";

contract PaymentObligation is BaseStatement {
    struct StatementData {
        address token;
        uint256 amount;
    }

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseStatement(
            _eas,
            _schemaRegistry,
            "address token, uint256 amount",
            false
        )
    {}

    function makeStatement(
        StatementData calldata data,
        uint64 expirationTime,
        bytes32 fulfilling
    ) public returns (bytes32) {
        // implement custom statement logic here
        //...
        return
            eas.attest(
                AttestationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: AttestationRequestData({
                        recipient: msg.sender,
                        expirationTime: expirationTime,
                        revocable: false,
                        refUID: fulfilling,
                        data: abi.encode(data),
                        value: 0
                    })
                })
            );
    }
}
