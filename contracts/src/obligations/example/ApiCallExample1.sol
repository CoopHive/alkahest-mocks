// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {StringObligation} from "../StringObligation.sol";
import {TrustedOracleArbiter} from "../../arbiters/trusted-oracle/TrustedOracleArbiter.sol";
import {ERC20EscrowObligation} from "../escrow/default/ERC20EscrowObligation.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ApiCallExample1
 * @notice Example 1: Using StringObligation with TrustedOracleArbiter for API-like compute jobs
 * @dev This example demonstrates a simple API call pattern where:
 *      1. Alice creates an escrow demanding an API result (e.g., weather data, price feed)
 *      2. Bob fulfills using StringObligation to submit the result
 *      3. Charlie (oracle) validates the result matches the query
 */
contract ApiCallExample1 {
    IEAS public immutable eas;
    ISchemaRegistry public immutable schemaRegistry;
    StringObligation public immutable stringObligation;
    TrustedOracleArbiter public immutable trustedOracleArbiter;
    ERC20EscrowObligation public immutable erc20EscrowObligation;

    // Events for tracking the flow
    event ApiQueryCreated(bytes32 indexed escrowUid, address indexed requester, string query, address oracle);
    event ApiResultSubmitted(
        bytes32 indexed fulfillmentUid, address indexed provider, string result, bytes32 escrowUid
    );
    event ApiResultValidated(bytes32 indexed fulfillmentUid, bool isValid);

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry,
        StringObligation _stringObligation,
        TrustedOracleArbiter _trustedOracleArbiter,
        ERC20EscrowObligation _erc20EscrowObligation
    ) {
        eas = _eas;
        schemaRegistry = _schemaRegistry;
        stringObligation = _stringObligation;
        trustedOracleArbiter = _trustedOracleArbiter;
        erc20EscrowObligation = _erc20EscrowObligation;
    }

    /**
     * @notice Step 1: Create an escrow demanding an API result
     * @param paymentToken Token to pay with
     * @param paymentAmount Amount to pay
     * @param oracle Trusted oracle who will validate the result
     * @param apiQuery The API query (e.g., "GET weather for NYC", "GET BTC/USD price")
     * @param expirationTime When the escrow expires
     * @return escrowUid The attestation UID of the created escrow
     */
    function createApiRequest(
        IERC20 paymentToken,
        uint256 paymentAmount,
        address oracle,
        string calldata apiQuery,
        uint64 expirationTime
    ) external returns (bytes32 escrowUid) {
        // Encode the API query as the inner demand data
        bytes memory innerDemand = abi.encode(apiQuery);

        // Create the TrustedOracleArbiter demand
        TrustedOracleArbiter.DemandData memory demandData =
            TrustedOracleArbiter.DemandData({oracle: oracle, data: innerDemand});
        bytes memory demand = abi.encode(demandData);

        // Note: Caller must approve token transfer to erc20EscrowObligation before calling

        // Create the escrow
        ERC20EscrowObligation.ObligationData memory escrowData = ERC20EscrowObligation.ObligationData({
            token: address(paymentToken), amount: paymentAmount, arbiter: address(trustedOracleArbiter), demand: demand
        });

        escrowUid = erc20EscrowObligation.doObligation(escrowData, expirationTime);

        emit ApiQueryCreated(escrowUid, msg.sender, apiQuery, oracle);
        return escrowUid;
    }

    /**
     * @notice Step 2: Submit an API result using StringObligation
     * @param apiResult The result of the API call
     * @param escrowUid The escrow being fulfilled
     * @return fulfillmentUid The attestation UID of the submitted result
     */
    function submitApiResult(string calldata apiResult, bytes32 escrowUid) external returns (bytes32 fulfillmentUid) {
        // Submit the result via StringObligation with reference to the escrow
        StringObligation.ObligationData memory resultData =
            StringObligation.ObligationData({item: apiResult, schema: bytes32(0)});

        fulfillmentUid = stringObligation.doObligation(resultData, escrowUid);

        emit ApiResultSubmitted(fulfillmentUid, msg.sender, apiResult, escrowUid);
        return fulfillmentUid;
    }

    /**
     * @notice Step 3: Request arbitration from the oracle
     * @param fulfillmentUid The fulfillment to be arbitrated
     * @param oracle The oracle address (must match the one in the demand)
     * @param demand The demand data for context
     */
    function requestArbitration(bytes32 fulfillmentUid, address oracle, bytes memory demand) external {
        trustedOracleArbiter.requestArbitration(fulfillmentUid, oracle, demand);
    }

    /**
     * @notice Step 4: Oracle validates the result (called by the oracle)
     * @param fulfillmentUid The fulfillment being validated
     * @param escrowUid The original escrow
     * @param isValid Whether the result is valid
     */
    function validateApiResult(bytes32 fulfillmentUid, bytes32 escrowUid, bool isValid) external {
        // Get the escrow attestation to verify the oracle
        Attestation memory escrow = eas.getAttestation(escrowUid);

        // Decode the escrow to get the demand
        ERC20EscrowObligation.ObligationData memory escrowData =
            abi.decode(escrow.data, (ERC20EscrowObligation.ObligationData));

        // Decode the demand to verify oracle
        TrustedOracleArbiter.DemandData memory demandData =
            abi.decode(escrowData.demand, (TrustedOracleArbiter.DemandData));

        require(msg.sender == demandData.oracle, "Only designated oracle can validate");

        // Submit the arbitration decision
        trustedOracleArbiter.arbitrate(fulfillmentUid, demandData.data, isValid);

        emit ApiResultValidated(fulfillmentUid, isValid);
    }

    /**
     * @notice Step 5: Claim the escrow after successful validation
     * @param escrowUid The escrow to claim
     * @param fulfillmentUid The validated fulfillment
     */
    function claimPayment(bytes32 escrowUid, bytes32 fulfillmentUid) external {
        erc20EscrowObligation.collect(escrowUid, fulfillmentUid);
    }

    /**
     * @notice Helper: Get API query from an escrow
     * @param escrowUid The escrow attestation UID
     * @return query The API query string
     */
    function getApiQuery(bytes32 escrowUid) external view returns (string memory query) {
        Attestation memory escrow = eas.getAttestation(escrowUid);
        ERC20EscrowObligation.ObligationData memory escrowData =
            abi.decode(escrow.data, (ERC20EscrowObligation.ObligationData));
        TrustedOracleArbiter.DemandData memory demandData =
            abi.decode(escrowData.demand, (TrustedOracleArbiter.DemandData));
        query = abi.decode(demandData.data, (string));
    }

    /**
     * @notice Helper: Get result from a fulfillment
     * @param fulfillmentUid The fulfillment attestation UID
     * @return result The API result string
     */
    function getApiResult(bytes32 fulfillmentUid) external view returns (string memory result) {
        Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);
        StringObligation.ObligationData memory resultData =
            abi.decode(fulfillment.data, (StringObligation.ObligationData));
        result = resultData.item;
    }
}

// Example Oracle Validator Contract (for automated validation)
contract ApiOracleValidator {
    TrustedOracleArbiter public immutable arbiter;
    IEAS public immutable eas;

    // Simple registry of valid API endpoints
    mapping(string => bool) public validEndpoints;

    event ValidationPerformed(bytes32 fulfillmentUid, bool isValid);

    constructor(TrustedOracleArbiter _arbiter, IEAS _eas) {
        arbiter = _arbiter;
        eas = _eas;

        // Register some example endpoints
        validEndpoints["GET weather NYC"] = true;
        validEndpoints["GET BTC/USD"] = true;
        validEndpoints["GET ETH/USD"] = true;
    }

    /**
     * @notice Automated validation based on simple rules
     * @dev In production, this would connect to actual APIs and verify results
     */
    function autoValidate(bytes32 fulfillmentUid) external {
        // Get the fulfillment
        Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);

        // Get the escrow from refUID
        bytes32 escrowUid = fulfillment.refUID;
        Attestation memory escrow = eas.getAttestation(escrowUid);

        // Extract and decode the query
        ERC20EscrowObligation.ObligationData memory escrowData =
            abi.decode(escrow.data, (ERC20EscrowObligation.ObligationData));
        TrustedOracleArbiter.DemandData memory demandData =
            abi.decode(escrowData.demand, (TrustedOracleArbiter.DemandData));
        string memory query = abi.decode(demandData.data, (string));

        // Extract the result
        StringObligation.ObligationData memory resultData =
            abi.decode(fulfillment.data, (StringObligation.ObligationData));
        string memory result = resultData.item;

        // Simple validation: check if query is valid and result is non-empty
        bool isValid = validEndpoints[query] && bytes(result).length > 0;

        // For weather queries, check format
        if (_startsWith(query, "GET weather")) {
            isValid = isValid && _containsWeatherData(result);
        }

        // For price queries, check format
        if (_contains(query, "/USD")) {
            isValid = isValid && _isPriceFormat(result);
        }

        // Submit arbitration
        arbiter.arbitrate(fulfillmentUid, demandData.data, isValid);

        emit ValidationPerformed(fulfillmentUid, isValid);
    }

    function _startsWith(string memory str, string memory prefix) private pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory prefixBytes = bytes(prefix);

        if (strBytes.length < prefixBytes.length) return false;

        for (uint256 i = 0; i < prefixBytes.length; i++) {
            if (strBytes[i] != prefixBytes[i]) return false;
        }
        return true;
    }

    function _contains(string memory str, string memory substr) private pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory substrBytes = bytes(substr);

        if (strBytes.length < substrBytes.length) return false;

        for (uint256 i = 0; i <= strBytes.length - substrBytes.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < substrBytes.length; j++) {
                if (strBytes[i + j] != substrBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) return true;
        }
        return false;
    }

    function _containsWeatherData(string memory result) private pure returns (bool) {
        // Check if result contains temperature indicator
        return _contains(result, "degrees") || _contains(result, "temp");
    }

    function _isPriceFormat(string memory result) private pure returns (bool) {
        // Check if result looks like a price (contains numbers and maybe $)
        bytes memory resultBytes = bytes(result);
        bool hasDigit = false;

        for (uint256 i = 0; i < resultBytes.length; i++) {
            if (resultBytes[i] >= 0x30 && resultBytes[i] <= 0x39) {
                // 0-9
                hasDigit = true;
                break;
            }
        }

        return hasDigit;
    }
}
