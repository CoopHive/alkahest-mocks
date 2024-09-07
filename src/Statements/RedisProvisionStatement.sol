// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IStatement} from "../IStatement.sol";

contract StringResultStatement is IStatement {
    struct StatementData {
        address user;
        uint256 size;
        uint256 duration;
        bytes32 serviceId;
        string url;
    }

    struct DemandData {
        address user;
        uint256 size;
        uint256 duration;
    }

    error InvalidResultAttestation();
    error InvalidDemand();

    string public constant SCHEMA_ABI = "address user, uint256 size, uint256 duration, bytes32 serviceId, string url";
    string public constant DEMAND_ABI = "address user, uint256 size, uint256 duration";
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

    function checkStatement(Attestation memory statement, bytes memory demand, bytes32 counteroffer)
        public
        view
        override
        returns (bool)
    {
        if (!_checkIntrinsic(statement)) {
            return false;
        }

        DemandData memory demandData = abi.decode(demand, (DemandData));
        StatementData memory statementData = abi.decode(statement.data, (StatementData));
    }

    function getSchemaAbi() public pure override returns (string memory) {
        return SCHEMA_ABI;
    }

    function getDemandAbi() public pure override returns (string memory) {
        return DEMAND_ABI;
    }
}
