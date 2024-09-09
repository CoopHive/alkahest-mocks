// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {
    IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData
} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IStatement} from "../IStatement.sol";

/**
 * @title StringResultStatement
 * @dev A contract for managing statements about string results with attestations.
 * This contract allows users to make, revise, and check statements about string results,
 * which can include information about the user, size, duration, and URL.
 */
contract StringResultStatement is IStatement {
    /**
     * @dev Struct to hold the data for a statement
     * @param user The address of the user associated with the statement
     * @param size The size of the result
     * @param duration The duration of the result's validity
     * @param url The URL where the result can be found
     */
    struct StatementData {
        address user;
        uint256 size;
        uint64 duration;
        string url;
    }

    /**
     * @dev Struct to hold the data for a demand
     * @param user The address of the user associated with the demand
     * @param size The required size of the result
     * @param duration The required duration of the result's validity
     */
    struct DemandData {
        address user;
        uint256 size;
        uint256 duration;
    }

    /**
     * @dev Struct to hold the data for changing a statement
     * @param addedSize The additional size to be added to the existing statement
     * @param addedDuration The additional duration to be added to the existing statement
     * @param newUrl The new URL to replace the existing one (if provided)
     */
    struct ChangeData {
        uint256 addedSize;
        uint64 addedDuration;
        string newUrl;
    }

    // Custom errors
    error InvalidResultAttestation();
    error InvalidDemand();
    error UnauthorizedCall();

    // Constants
    string public constant SCHEMA_ABI = "address user, uint256 size, uint256 duration, string url";
    string public constant DEMAND_ABI = "address user, uint256 size, uint256 duration";
    bool public constant IS_REVOCABLE = true;

    /**
     * @dev Constructor to initialize the contract
     * @param _eas The address of the EAS (Ethereum Attestation Service) contract
     * @param _schemaRegistry The address of the schema registry contract
     */
    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        IStatement(_eas, _schemaRegistry, SCHEMA_ABI, IS_REVOCABLE)
    {}

    /**
     * @dev Makes a new statement
     * @param data The statement data
     * @param refUID The reference UID for the attestation
     * @return The UID of the created attestation
     */
    function makeStatement(StatementData calldata data, bytes32 refUID) public returns (bytes32) {
        return eas.attest(
            AttestationRequest({
                schema: ATTESTATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: msg.sender,
                    expirationTime: uint64(block.timestamp) + data.duration,
                    revocable: true,
                    refUID: refUID,
                    data: abi.encode(data),
                    value: 0
                })
            })
        );
    }

    /**
     * @dev Revises an existing statement
     * @param statementUID The UID of the statement to revise
     * @param changeData The data containing the changes to apply
     * @return The UID of the new, revised attestation
     */
    function reviseStatement(bytes32 statementUID, ChangeData calldata changeData) public returns (bytes32) {
        Attestation memory statement = eas.getAttestation(statementUID);
        StatementData memory statementData = abi.decode(statement.data, (StatementData));

        if (statementData.user != msg.sender) revert UnauthorizedCall();

        statementData.duration += changeData.addedDuration;
        statementData.size += changeData.addedSize;

        if (bytes(changeData.newUrl).length != 0) {
            statementData.url = changeData.newUrl;
        }

        eas.revoke(
            RevocationRequest({schema: ATTESTATION_SCHEMA, data: RevocationRequestData({uid: statementUID, value: 0})})
        );

        return eas.attest(
            AttestationRequest({
                schema: ATTESTATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: msg.sender,
                    expirationTime: statement.expirationTime - uint64(block.timestamp) + changeData.addedDuration,
                    revocable: true,
                    refUID: statement.refUID,
                    data: abi.encode(statementData),
                    value: 0
                })
            })
        );
    }

    /**
     * @dev Checks if a statement meets the requirements of a demand
     * @param statement The attestation of the statement to check
     * @param demand The encoded demand data
     * @return A boolean indicating whether the statement meets the demand
     */
    function checkStatement(Attestation memory statement, bytes memory demand, bytes32 /* counteroffer */ )
        public
        view
        override
        returns (bool)
    {
        if (!_checkIntrinsic(statement)) return false;

        DemandData memory demandData = abi.decode(demand, (DemandData));
        StatementData memory statementData = abi.decode(statement.data, (StatementData));

        return demandData.user == statementData.user && demandData.size == statementData.size
            && demandData.duration == statementData.duration;
    }

    /**
     * @dev Returns the ABI of the schema used for statements
     * @return A string containing the schema ABI
     */
    function getSchemaAbi() public pure override returns (string memory) {
        return SCHEMA_ABI;
    }

    /**
     * @dev Returns the ABI of the demand format
     * @return A string containing the demand ABI
     */
    function getDemandAbi() public pure override returns (string memory) {
        return DEMAND_ABI;
    }
}
