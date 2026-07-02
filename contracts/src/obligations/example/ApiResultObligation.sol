// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseObligation} from "../BaseObligation.sol";

/**
 * @title ApiResultObligation
 * @notice Specialized fulfillment contract for API results without IArbiter implementation
 * @dev This contract provides structured API result attestations that can be validated
 *      by external arbiters like TrustedOracleArbiter
 */
contract ApiResultObligation is BaseObligation {
    /**
     * @notice Structured data for API results
     * @param endpoint The API endpoint that was called
     * @param method HTTP method used (GET, POST, etc.)
     * @param statusCode HTTP status code of the response
     * @param headers Encoded headers as string (e.g., "Content-Type: application/json")
     * @param body The response body
     * @param timestamp When the API was called
     */
    struct ObligationData {
        string endpoint;
        string method;
        uint16 statusCode;
        string headers;
        string body;
        uint256 timestamp;
    }

    // Events
    event ApiResultSubmitted(bytes32 indexed uid, address indexed submitter, string endpoint, uint16 statusCode);

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        BaseObligation(
            _eas,
            _schemaRegistry,
            "string endpoint,string method,uint16 statusCode,string headers,string body,uint256 timestamp",
            true // revocable
        )
    {}

    /**
     * @notice Submit an API result as an attestation
     * @param data The API result data
     * @param refUID Reference to the escrow/demand being fulfilled
     * @return uid The attestation UID of the submitted result
     */
    function doObligation(ObligationData memory data, bytes32 refUID) public returns (bytes32 uid) {
        // Validate basic data
        require(bytes(data.endpoint).length > 0, "Endpoint cannot be empty");
        require(bytes(data.method).length > 0, "Method cannot be empty");
        require(data.statusCode > 0, "Invalid status code");
        require(data.timestamp > 0, "Invalid timestamp");

        bytes memory encodedData = encodeObligationData(data);

        uid = _doObligationForRaw(
            encodedData,
            0, // no expiration
            msg.sender,
            refUID
        );

        emit ApiResultSubmitted(uid, msg.sender, data.endpoint, data.statusCode);

        return uid;
    }

    /**
     * @notice Submit a simple API result (convenience function)
     * @param endpoint The API endpoint
     * @param body The response body
     * @param refUID Reference to the escrow/demand
     * @return uid The attestation UID
     */
    function doSimpleObligation(string calldata endpoint, string calldata body, bytes32 refUID)
        external
        returns (bytes32 uid)
    {
        ObligationData memory data = ObligationData({
            endpoint: endpoint,
            method: "GET",
            statusCode: 200,
            headers: "Content-Type: application/json",
            body: body,
            timestamp: block.timestamp
        });

        return doObligation(data, refUID);
    }

    /**
     * @notice Encode obligation data for storage
     * @param data The obligation data to encode
     * @return The encoded data
     */
    function encodeObligationData(ObligationData memory data) public pure returns (bytes memory) {
        return abi.encode(data.endpoint, data.method, data.statusCode, data.headers, data.body, data.timestamp);
    }

    /**
     * @notice Decode obligation data from storage
     * @param encodedData The encoded data
     * @return data The decoded obligation data
     */
    function decodeObligationData(bytes memory encodedData) public pure returns (ObligationData memory data) {
        (
            string memory endpoint,
            string memory method,
            uint16 statusCode,
            string memory headers,
            string memory body,
            uint256 timestamp
        ) = abi.decode(encodedData, (string, string, uint16, string, string, uint256));

        return ObligationData({
            endpoint: endpoint,
            method: method,
            statusCode: statusCode,
            headers: headers,
            body: body,
            timestamp: timestamp
        });
    }

    /**
     * @notice Get obligation data from an attestation UID
     * @param uid The attestation UID
     * @return data The obligation data
     */
    function getObligationData(bytes32 uid) external view returns (ObligationData memory data) {
        Attestation memory attestation = _getAttestation(uid);
        return decodeObligationData(attestation.data);
    }

    /**
     * @notice Check if an attestation represents a successful API call
     * @param uid The attestation UID
     * @return success True if status code is 200-299
     */
    function isSuccessfulCall(bytes32 uid) external view returns (bool success) {
        Attestation memory attestation = _getAttestation(uid);
        ObligationData memory data = decodeObligationData(attestation.data);
        return data.statusCode >= 200 && data.statusCode < 300;
    }

    /**
     * @notice Get just the response body from an attestation
     * @param uid The attestation UID
     * @return body The response body
     */
    function getResponseBody(bytes32 uid) external view returns (string memory body) {
        Attestation memory attestation = _getAttestation(uid);
        ObligationData memory data = decodeObligationData(attestation.data);
        return data.body;
    }

    /**
     * @notice Check if an attestation is for a specific endpoint
     * @param uid The attestation UID
     * @param endpoint The endpoint to check
     * @return matches True if the attestation is for the specified endpoint
     */
    function matchesEndpoint(bytes32 uid, string calldata endpoint) external view returns (bool matches) {
        Attestation memory attestation = _getAttestation(uid);
        ObligationData memory data = decodeObligationData(attestation.data);
        return keccak256(bytes(data.endpoint)) == keccak256(bytes(endpoint));
    }

    /**
     * @notice Batch submit multiple API results
     * @param results Array of API results
     * @param refUID Reference to the escrow/demand
     * @return uids Array of attestation UIDs
     */
    function batchDoObligation(ObligationData[] memory results, bytes32 refUID)
        external
        returns (bytes32[] memory uids)
    {
        uids = new bytes32[](results.length);

        for (uint256 i = 0; i < results.length; i++) {
            uids[i] = doObligation(results[i], refUID);
        }

        return uids;
    }
}
