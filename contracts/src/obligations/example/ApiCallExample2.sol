// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {ApiResultObligation} from "./ApiResultObligation.sol";
import {TrustedOracleArbiter} from "../../arbiters/trusted-oracle/TrustedOracleArbiter.sol";
import {ERC20EscrowObligation} from "../escrow/default/ERC20EscrowObligation.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ApiCallExample2
 * @notice Example 2: Using specialized ApiResultObligation with TrustedOracleArbiter
 * @dev This example demonstrates a more structured approach to API compute jobs:
 *      1. Alice creates an escrow with structured API query (endpoint, method, params)
 *      2. Bob fulfills using ApiResultObligation which provides structured results
 *      3. Charlie validates the result matches the query with detailed verification
 *      4. The specialized contract provides better type safety and validation
 */
contract ApiCallExample2 {
    IEAS public immutable eas;
    ISchemaRegistry public immutable schemaRegistry;
    ApiResultObligation public immutable apiResultObligation;
    TrustedOracleArbiter public immutable trustedOracleArbiter;
    ERC20EscrowObligation public immutable erc20EscrowObligation;

    /**
     * @notice Structured API query format
     * @param endpoint The API endpoint to call
     * @param method HTTP method (GET, POST, etc.)
     * @param params Query parameters or request body
     * @param expectedStatusCode Expected HTTP status code (0 for any)
     * @param timeout Maximum time allowed for the request (seconds)
     */
    struct ApiQuery {
        string endpoint;
        string method;
        string params;
        uint16 expectedStatusCode;
        uint256 timeout;
    }

    // Events
    event StructuredApiQueryCreated(
        bytes32 indexed escrowUid, address indexed requester, string endpoint, string method, address oracle
    );

    event StructuredApiResultSubmitted(
        bytes32 indexed fulfillmentUid, address indexed provider, string endpoint, uint16 statusCode, bytes32 escrowUid
    );

    event DetailedValidation(
        bytes32 indexed fulfillmentUid, bool endpointMatch, bool statusMatch, bool timeMatch, bool overall
    );

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry,
        ApiResultObligation _apiResultObligation,
        TrustedOracleArbiter _trustedOracleArbiter,
        ERC20EscrowObligation _erc20EscrowObligation
    ) {
        eas = _eas;
        schemaRegistry = _schemaRegistry;
        apiResultObligation = _apiResultObligation;
        trustedOracleArbiter = _trustedOracleArbiter;
        erc20EscrowObligation = _erc20EscrowObligation;
    }

    /**
     * @notice Create an escrow with structured API query
     * @param paymentToken Token to pay with
     * @param paymentAmount Amount to pay
     * @param oracle Trusted oracle who will validate
     * @param query The structured API query
     * @param expirationTime When the escrow expires
     * @return escrowUid The attestation UID of the created escrow
     */
    function createStructuredApiRequest(
        IERC20 paymentToken,
        uint256 paymentAmount,
        address oracle,
        ApiQuery calldata query,
        uint64 expirationTime
    ) external returns (bytes32 escrowUid) {
        // Validate query
        require(bytes(query.endpoint).length > 0, "Endpoint required");
        require(bytes(query.method).length > 0, "Method required");
        require(query.timeout > 0, "Timeout required");

        // Encode the structured query
        bytes memory innerDemand = abi.encode(query);

        // Create TrustedOracleArbiter demand
        TrustedOracleArbiter.DemandData memory demandData =
            TrustedOracleArbiter.DemandData({oracle: oracle, data: innerDemand});
        bytes memory demand = abi.encode(demandData);

        // Note: Caller must approve token transfer to erc20EscrowObligation before calling

        ERC20EscrowObligation.ObligationData memory escrowData = ERC20EscrowObligation.ObligationData({
            token: address(paymentToken), amount: paymentAmount, arbiter: address(trustedOracleArbiter), demand: demand
        });

        escrowUid = erc20EscrowObligation.doObligation(escrowData, expirationTime);

        emit StructuredApiQueryCreated(escrowUid, msg.sender, query.endpoint, query.method, oracle);

        return escrowUid;
    }

    /**
     * @notice Submit a structured API result
     * @param endpoint The API endpoint that was called
     * @param method HTTP method used
     * @param statusCode HTTP status code received
     * @param headers Response headers
     * @param body Response body
     * @param escrowUid The escrow being fulfilled
     * @return fulfillmentUid The attestation UID
     */
    function submitStructuredApiResult(
        string calldata endpoint,
        string calldata method,
        uint16 statusCode,
        string calldata headers,
        string calldata body,
        bytes32 escrowUid
    ) external returns (bytes32 fulfillmentUid) {
        ApiResultObligation.ObligationData memory resultData = ApiResultObligation.ObligationData({
            endpoint: endpoint,
            method: method,
            statusCode: statusCode,
            headers: headers,
            body: body,
            timestamp: block.timestamp
        });

        fulfillmentUid = apiResultObligation.doObligation(resultData, escrowUid);

        emit StructuredApiResultSubmitted(fulfillmentUid, msg.sender, endpoint, statusCode, escrowUid);

        return fulfillmentUid;
    }

    /**
     * @notice Simplified submission for common GET requests
     * @param endpoint The API endpoint
     * @param body The response body
     * @param escrowUid The escrow being fulfilled
     * @return fulfillmentUid The attestation UID
     */
    function submitSimpleApiResult(string calldata endpoint, string calldata body, bytes32 escrowUid)
        external
        returns (bytes32 fulfillmentUid)
    {
        return apiResultObligation.doSimpleObligation(endpoint, body, escrowUid);
    }

    /**
     * @notice Oracle validates with detailed checks
     * @param fulfillmentUid The fulfillment to validate
     * @param escrowUid The original escrow
     * @param performDetailedCheck Whether to perform detailed validation
     */
    function validateStructuredResult(bytes32 fulfillmentUid, bytes32 escrowUid, bool performDetailedCheck) external {
        // Get escrow and verify oracle
        Attestation memory escrow = eas.getAttestation(escrowUid);
        ERC20EscrowObligation.ObligationData memory escrowData =
            abi.decode(escrow.data, (ERC20EscrowObligation.ObligationData));
        TrustedOracleArbiter.DemandData memory demandData =
            abi.decode(escrowData.demand, (TrustedOracleArbiter.DemandData));

        require(msg.sender == demandData.oracle, "Only designated oracle");

        bool isValid = true;

        if (performDetailedCheck) {
            // Decode the query
            ApiQuery memory query = abi.decode(demandData.data, (ApiQuery));

            // Get the fulfillment
            ApiResultObligation.ObligationData memory result = apiResultObligation.getObligationData(fulfillmentUid);

            // Detailed validation
            bool endpointMatch = keccak256(bytes(result.endpoint)) == keccak256(bytes(query.endpoint));
            bool methodMatch = keccak256(bytes(result.method)) == keccak256(bytes(query.method));
            bool statusMatch = query.expectedStatusCode == 0 || result.statusCode == query.expectedStatusCode;
            bool timeMatch = result.timestamp <= escrow.time + query.timeout;

            isValid = endpointMatch && methodMatch && statusMatch && timeMatch;

            emit DetailedValidation(fulfillmentUid, endpointMatch, statusMatch, timeMatch, isValid);
        }

        trustedOracleArbiter.arbitrate(fulfillmentUid, demandData.data, isValid);
    }

    /**
     * @notice Request arbitration for a fulfillment
     */
    function requestArbitration(bytes32 fulfillmentUid, address oracle, bytes memory demand) external {
        trustedOracleArbiter.requestArbitration(fulfillmentUid, oracle, demand);
    }

    /**
     * @notice Claim payment after successful validation
     */
    function claimPayment(bytes32 escrowUid, bytes32 fulfillmentUid) external {
        erc20EscrowObligation.collect(escrowUid, fulfillmentUid);
    }

    /**
     * @notice Get structured query from escrow
     * @param escrowUid The escrow attestation UID
     * @return query The structured API query
     */
    function getStructuredQuery(bytes32 escrowUid) external view returns (ApiQuery memory query) {
        Attestation memory escrow = eas.getAttestation(escrowUid);
        ERC20EscrowObligation.ObligationData memory escrowData =
            abi.decode(escrow.data, (ERC20EscrowObligation.ObligationData));
        TrustedOracleArbiter.DemandData memory demandData =
            abi.decode(escrowData.demand, (TrustedOracleArbiter.DemandData));
        query = abi.decode(demandData.data, (ApiQuery));
    }

    /**
     * @notice Check if a fulfillment matches query requirements
     * @param fulfillmentUid The fulfillment to check
     * @param escrowUid The escrow with the query
     * @return matches Whether the fulfillment matches the query
     */
    function checkFulfillmentMatch(bytes32 fulfillmentUid, bytes32 escrowUid) external view returns (bool matches) {
        ApiQuery memory query = this.getStructuredQuery(escrowUid);
        ApiResultObligation.ObligationData memory result = apiResultObligation.getObligationData(fulfillmentUid);

        return keccak256(bytes(result.endpoint)) == keccak256(bytes(query.endpoint))
            && keccak256(bytes(result.method)) == keccak256(bytes(query.method))
            && (query.expectedStatusCode == 0 || result.statusCode == query.expectedStatusCode);
    }

    /**
     * @notice Batch validate multiple fulfillments
     * @param fulfillmentUids Array of fulfillment UIDs
     * @param escrowUids Corresponding escrow UIDs
     * @param decisions Validation decisions for each
     */
    function batchValidate(bytes32[] calldata fulfillmentUids, bytes32[] calldata escrowUids, bool[] calldata decisions)
        external
    {
        require(
            fulfillmentUids.length == escrowUids.length && fulfillmentUids.length == decisions.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < fulfillmentUids.length; i++) {
            // Verify oracle for each
            Attestation memory escrow = eas.getAttestation(escrowUids[i]);
            ERC20EscrowObligation.ObligationData memory escrowData =
                abi.decode(escrow.data, (ERC20EscrowObligation.ObligationData));
            TrustedOracleArbiter.DemandData memory demandData =
                abi.decode(escrowData.demand, (TrustedOracleArbiter.DemandData));

            require(msg.sender == demandData.oracle, "Unauthorized for this escrow");

            trustedOracleArbiter.arbitrate(fulfillmentUids[i], demandData.data, decisions[i]);
        }
    }
}
