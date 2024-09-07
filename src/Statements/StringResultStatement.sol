// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IStatement} from "../IStatement.sol";

contract StringResultStatement is IStatement {
    struct StatementData {
        string result;
    }

    struct DemandData {
        string query;
    }

    error InvalidResultAttestation();
    error InvalidDemand();

    string public constant SCHEMA_ABI = "string result";
    string public constant DEMAND_ABI = "string query";
    bool public constant IS_REVOCABLE = false;

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        IStatement(_eas, _schemaRegistry, SCHEMA_ABI, IS_REVOCABLE)
    {}

    function makeStatement(StatementData calldata data, bytes32 refUID) public returns (bytes32) {
        return eas.attest(
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

    function checkStatement(
        Attestation memory statement,
        bytes memory demand, /* (string query) */
        bytes32 counteroffer
    ) public view override returns (bool) {
        if (!_checkIntrinsic(statement)) return false;

        // Check if the statement is intended to fulfill the specific counteroffer
        if (statement.refUID != bytes32(0) && statement.refUID != counteroffer) return false;

        StatementData memory result = abi.decode(statement.data, (StatementData));
        DemandData memory demandData = abi.decode(demand, (DemandData));

        // Only compare the length of the query and result
        return bytes(demandData.query).length == bytes(result.result).length;
    }

    function getSchemaAbi() public pure override returns (string memory) {
        return SCHEMA_ABI;
    }

    function getDemandAbi() public pure override returns (string memory) {
        return DEMAND_ABI;
    }
}
