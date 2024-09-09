// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IStatement} from "../IStatement.sol";

/**
 * @title StringResultStatement
 * @dev Contract for creating and managing string result statements in the EAS ecosystem.
 * This contract extends IStatement to provide functionality specific to string results.
 */
contract StringResultStatement is IStatement {
    /**
     * @dev Struct to hold the statement data (the result string).
     */
    struct StatementData {
        string result;
    }

    /**
     * @dev Struct to hold the demand data (the query string).
     */
    struct DemandData {
        string query;
    }

    /// @dev Error thrown when the result attestation is invalid
    error InvalidResultAttestation();
    /// @dev Error thrown when the demand is invalid
    error InvalidDemand();

    /// @notice The ABI schema for the statement
    string public constant SCHEMA_ABI = "string result";
    /// @notice The ABI schema for the demand
    string public constant DEMAND_ABI = "string query";
    /// @notice Whether the statement is revocable (false in this case)
    bool public constant IS_REVOCABLE = false;

    /**
     * @dev Constructor to initialize the StringResultStatement contract.
     * @param _eas The EAS instance.
     * @param _schemaRegistry The schema registry instance.
     */
    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        IStatement(_eas, _schemaRegistry, SCHEMA_ABI, IS_REVOCABLE)
    {}

    /**
     * @dev Creates a new statement attestation.
     * @param data The statement data containing the result string.
     * @param refUID The reference UID for the attestation.
     * @return bytes32 The UID of the created attestation.
     */
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

    /**
     * @dev Checks if a statement meets the requirements of a demand.
     * @param statement The attestation to check.
     * @param demand The demand data to check against.
     * @param counteroffer An optional counteroffer to consider.
     * @return bool Returns true if the statement meets the demand requirements.
     */
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

    /**
     * @dev Returns the ABI schema for the statement.
     * @return string The statement ABI schema as a string.
     */
    function getSchemaAbi() public pure override returns (string memory) {
        return SCHEMA_ABI;
    }

    /**
     * @dev Returns the ABI schema for the demand.
     * @return string The demand ABI schema as a string.
     */
    function getDemandAbi() public pure override returns (string memory) {
        return DEMAND_ABI;
    }
}
