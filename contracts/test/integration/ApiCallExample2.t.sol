// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";
import {ApiResultObligation} from "@src/obligations/example/ApiResultObligation.sol";
import {TrustedOracleArbiter} from "@src/arbiters/trusted-oracle/TrustedOracleArbiter.sol";
import {ERC20EscrowObligation} from "@src/obligations/escrow/default/ERC20EscrowObligation.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

// Mock ERC20 token for testing
contract MockToken is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/**
 * @title ApiCallExample2Test
 * @notice Tests demonstrating the pattern of using specialized fulfillment contracts
 *         that don't implement IArbiter for structured API-like compute jobs
 * @dev This test demonstrates:
 *      - Creating specialized fulfillment contracts for specific data formats
 *      - Structured data storage and validation without implementing IArbiter
 *      - Separation of concerns between data attestation and validation logic
 */
contract ApiCallExample2Test is Test {
    // Core contracts
    IEAS eas;
    ISchemaRegistry schemaRegistry;
    ApiResultObligation apiResultObligation;
    TrustedOracleArbiter trustedOracleArbiter;
    ERC20EscrowObligation erc20EscrowObligation;
    MockToken paymentToken;

    // Test accounts
    uint256 internal constant ALICE_PRIVATE_KEY = 0xa11ce;
    uint256 internal constant BOB_PRIVATE_KEY = 0xb0b;
    uint256 internal constant CHARLIE_PRIVATE_KEY = 0xc0de;

    address alice;
    address bob;
    address charlie;

    // Test data - structured API query
    struct ApiQuery {
        string endpoint;
        string method;
        string params;
    }

    ApiQuery weatherQuery =
        ApiQuery({endpoint: "https://api.weather.com/v1/location/NYC", method: "GET", params: "units=fahrenheit"});

    uint256 constant PAYMENT_AMOUNT = 100 * 10 ** 18;

    function setUp() public {
        // Deploy EAS infrastructure
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        // Setup test accounts
        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);
        charlie = vm.addr(CHARLIE_PRIVATE_KEY);

        // Deploy contracts
        apiResultObligation = new ApiResultObligation(eas, schemaRegistry);
        trustedOracleArbiter = new TrustedOracleArbiter(eas);
        erc20EscrowObligation = new ERC20EscrowObligation(eas, schemaRegistry);

        // Deploy and distribute tokens
        paymentToken = new MockToken();
        paymentToken.transfer(alice, PAYMENT_AMOUNT * 10);

        // Fund test accounts with ETH
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(charlie, 10 ether);

        // Label addresses
        vm.label(alice, "Alice (Requester)");
        vm.label(bob, "Bob (Provider)");
        vm.label(charlie, "Charlie (Oracle)");
        vm.label(address(apiResultObligation), "ApiResultObligation");
        vm.label(address(trustedOracleArbiter), "TrustedOracleArbiter");
        vm.label(address(erc20EscrowObligation), "ERC20EscrowObligation");
    }

    /**
     * @notice Test the pattern of using a specialized fulfillment contract
     * @dev Demonstrates how specialized contracts provide:
     *      - Type safety through structured data
     *      - Better validation capabilities
     *      - Clearer separation of concerns
     */
    function test_SpecializedFulfillmentContractPattern() public {
        // Step 1: Alice creates escrow with structured query
        vm.startPrank(alice);

        // Encode structured query for oracle validation
        bytes memory innerDemand = abi.encode(weatherQuery);
        bytes memory demand = abi.encode(TrustedOracleArbiter.DemandData({oracle: charlie, data: innerDemand}));

        paymentToken.approve(address(erc20EscrowObligation), PAYMENT_AMOUNT);
        bytes32 escrowUid = erc20EscrowObligation.doObligation(
            ERC20EscrowObligation.ObligationData({
                token: address(paymentToken),
                amount: PAYMENT_AMOUNT,
                arbiter: address(trustedOracleArbiter),
                demand: demand
            }),
            uint64(block.timestamp + 1 days)
        );
        vm.stopPrank();

        // Step 2: Bob submits structured API result using specialized contract
        vm.startPrank(bob);

        // The specialized contract enforces structure
        ApiResultObligation.ObligationData memory resultData = ApiResultObligation.ObligationData({
            endpoint: weatherQuery.endpoint,
            method: "GET",
            statusCode: 200,
            headers: "Content-Type: application/json",
            body: '{"temperature": "72", "unit": "fahrenheit"}',
            timestamp: block.timestamp
        });

        bytes32 fulfillmentUid = apiResultObligation.doObligation(resultData, escrowUid);

        // Request arbitration
        trustedOracleArbiter.requestArbitration(fulfillmentUid, charlie, innerDemand);
        vm.stopPrank();

        // Verify structured data was stored correctly
        ApiResultObligation.ObligationData memory storedResult = apiResultObligation.getObligationData(fulfillmentUid);

        assertEq(storedResult.endpoint, weatherQuery.endpoint, "Endpoint should match");
        assertEq(storedResult.statusCode, 200, "Status code should be 200");
        assertTrue(storedResult.timestamp > 0, "Timestamp should be set");

        // Step 3: Oracle validates with access to structured data
        vm.prank(charlie);
        // Oracle can make informed decision based on structured data
        trustedOracleArbiter.arbitrate(fulfillmentUid, innerDemand, true);

        // Step 4: Bob claims payment
        vm.prank(bob);
        erc20EscrowObligation.collect(escrowUid, fulfillmentUid);

        assertGt(paymentToken.balanceOf(bob), 0, "Bob should receive payment");
    }

    /**
     * @notice Test the simple API result submission helper
     * @dev Demonstrates how specialized contracts can provide convenience methods
     *      that maintain structure while simplifying common use cases
     */
    function test_ConvenienceMethodsPattern() public {
        // Create escrow
        vm.startPrank(alice);
        bytes memory demand =
            abi.encode(TrustedOracleArbiter.DemandData({oracle: charlie, data: abi.encode(weatherQuery)}));

        paymentToken.approve(address(erc20EscrowObligation), PAYMENT_AMOUNT);
        bytes32 escrowUid = erc20EscrowObligation.doObligation(
            ERC20EscrowObligation.ObligationData({
                token: address(paymentToken),
                amount: PAYMENT_AMOUNT,
                arbiter: address(trustedOracleArbiter),
                demand: demand
            }),
            uint64(block.timestamp + 1 days)
        );
        vm.stopPrank();

        // Bob uses simplified submission (defaults to GET, 200 status)
        vm.prank(bob);
        bytes32 fulfillmentUid =
            apiResultObligation.doSimpleObligation(weatherQuery.endpoint, '{"temperature": "72"}', escrowUid);

        // Verify defaults were applied correctly
        ApiResultObligation.ObligationData memory result = apiResultObligation.getObligationData(fulfillmentUid);

        assertEq(result.method, "GET", "Should default to GET");
        assertEq(result.statusCode, 200, "Should default to 200");
        assertEq(result.headers, "Content-Type: application/json", "Should have default headers");
    }

    /**
     * @notice Test specialized validation helpers
     * @dev Demonstrates how specialized contracts can provide rich query capabilities
     *      that generic contracts cannot offer
     */
    function test_SpecializedValidationHelpers() public {
        // Setup escrow and fulfillment
        vm.startPrank(alice);
        bytes memory demand =
            abi.encode(TrustedOracleArbiter.DemandData({oracle: charlie, data: abi.encode(weatherQuery)}));

        paymentToken.approve(address(erc20EscrowObligation), PAYMENT_AMOUNT);
        bytes32 escrowUid = erc20EscrowObligation.doObligation(
            ERC20EscrowObligation.ObligationData({
                token: address(paymentToken),
                amount: PAYMENT_AMOUNT,
                arbiter: address(trustedOracleArbiter),
                demand: demand
            }),
            uint64(block.timestamp + 1 days)
        );
        vm.stopPrank();

        // Submit successful result
        vm.prank(bob);
        bytes32 fulfillmentUid = apiResultObligation.doObligation(
            ApiResultObligation.ObligationData({
                endpoint: weatherQuery.endpoint,
                method: "GET",
                statusCode: 200,
                headers: "Content-Type: application/json",
                body: '{"temperature": "72"}',
                timestamp: block.timestamp
            }),
            escrowUid
        );

        // Test specialized helper functions
        assertTrue(apiResultObligation.isSuccessfulCall(fulfillmentUid), "Should identify successful status code");

        string memory body = apiResultObligation.getResponseBody(fulfillmentUid);
        assertEq(body, '{"temperature": "72"}', "Should retrieve body");

        assertTrue(apiResultObligation.matchesEndpoint(fulfillmentUid, weatherQuery.endpoint), "Should match endpoint");

        assertFalse(
            apiResultObligation.matchesEndpoint(fulfillmentUid, "https://different.com"),
            "Should not match different endpoint"
        );
    }

    /**
     * @notice Test validation with wrong status code
     * @dev Demonstrates how structured data enables more precise validation
     */
    function test_StructuredValidationFailure() public {
        // Create escrow
        vm.startPrank(alice);
        bytes memory demand =
            abi.encode(TrustedOracleArbiter.DemandData({oracle: charlie, data: abi.encode(weatherQuery)}));

        paymentToken.approve(address(erc20EscrowObligation), PAYMENT_AMOUNT);
        bytes32 escrowUid = erc20EscrowObligation.doObligation(
            ERC20EscrowObligation.ObligationData({
                token: address(paymentToken),
                amount: PAYMENT_AMOUNT,
                arbiter: address(trustedOracleArbiter),
                demand: demand
            }),
            uint64(block.timestamp + 1 days)
        );
        vm.stopPrank();

        // Bob submits result with error status code
        vm.prank(bob);
        bytes32 fulfillmentUid = apiResultObligation.doObligation(
            ApiResultObligation.ObligationData({
                endpoint: weatherQuery.endpoint,
                method: "GET",
                statusCode: 404, // Error status
                headers: "Content-Type: application/json",
                body: '{"error": "Not found"}',
                timestamp: block.timestamp
            }),
            escrowUid
        );

        // Oracle can check the structured status code
        assertFalse(apiResultObligation.isSuccessfulCall(fulfillmentUid), "Should identify error status");

        // Oracle rejects based on error status
        vm.prank(charlie);
        trustedOracleArbiter.arbitrate(fulfillmentUid, abi.encode(weatherQuery), false);

        // Bob cannot claim payment
        vm.prank(bob);
        vm.expectRevert();
        erc20EscrowObligation.collect(escrowUid, fulfillmentUid);
    }
}
