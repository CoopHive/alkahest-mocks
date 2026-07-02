// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
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
 * @title ApiCallExample1Test
 * @notice Tests demonstrating the pattern of using StringObligation with TrustedOracleArbiter
 *         for API-like compute jobs where results are validated by an oracle
 * @dev This test demonstrates:
 *      - Creating escrows with structured demands for external oracles
 *      - Using generic string obligations for flexible result submission
 *      - Oracle-based validation of compute job results
 */
contract ApiCallExample1Test is Test {
    // Core contracts
    IEAS eas;
    ISchemaRegistry schemaRegistry;
    StringObligation stringObligation;
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

    // Test data
    string constant API_QUERY = "GET weather NYC";
    string constant API_RESULT = "72F, sunny";
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
        stringObligation = new StringObligation(eas, schemaRegistry);
        trustedOracleArbiter = new TrustedOracleArbiter(eas);
        erc20EscrowObligation = new ERC20EscrowObligation(eas, schemaRegistry);

        // Deploy and distribute tokens
        paymentToken = new MockToken();
        paymentToken.transfer(alice, PAYMENT_AMOUNT * 10);

        // Fund test accounts with ETH
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(charlie, 10 ether);

        // Label addresses for better trace output
        vm.label(alice, "Alice (Requester)");
        vm.label(bob, "Bob (Provider)");
        vm.label(charlie, "Charlie (Oracle)");
        vm.label(address(stringObligation), "StringObligation");
        vm.label(address(trustedOracleArbiter), "TrustedOracleArbiter");
        vm.label(address(erc20EscrowObligation), "ERC20EscrowObligation");
    }

    /**
     * @notice Test the complete flow of an API-like compute job using StringObligation
     * @dev Demonstrates the pattern where:
     *      1. A requester creates an escrow with a query for an oracle to validate
     *      2. A provider submits a generic string result
     *      3. An oracle validates whether the result satisfies the query
     */
    function test_ApiCallPatternWithStringObligation() public {
        // Step 1: Alice creates escrow with API query for oracle validation
        vm.startPrank(alice);

        // Encode the API query as the inner demand data
        bytes memory innerDemand = abi.encode(API_QUERY);

        // Create TrustedOracleArbiter demand
        TrustedOracleArbiter.DemandData memory demandData =
            TrustedOracleArbiter.DemandData({oracle: charlie, data: innerDemand});
        bytes memory demand = abi.encode(demandData);

        // Approve and create escrow
        paymentToken.approve(address(erc20EscrowObligation), PAYMENT_AMOUNT);

        ERC20EscrowObligation.ObligationData memory escrowData = ERC20EscrowObligation.ObligationData({
            token: address(paymentToken), amount: PAYMENT_AMOUNT, arbiter: address(trustedOracleArbiter), demand: demand
        });

        bytes32 escrowUid = erc20EscrowObligation.doObligation(escrowData, uint64(block.timestamp + 1 days));
        vm.stopPrank();

        assertEq(paymentToken.balanceOf(address(erc20EscrowObligation)), PAYMENT_AMOUNT, "Escrow should hold payment");

        // Step 2: Bob submits API result using StringObligation
        vm.startPrank(bob);
        StringObligation.ObligationData memory resultData =
            StringObligation.ObligationData({item: API_RESULT, schema: bytes32(0)});

        bytes32 fulfillmentUid = stringObligation.doObligation(resultData, escrowUid);

        // Request arbitration from oracle
        trustedOracleArbiter.requestArbitration(fulfillmentUid, charlie, innerDemand);
        vm.stopPrank();

        // Step 3: Charlie (oracle) validates the result
        vm.startPrank(charlie);

        // In a real scenario, Charlie would:
        // 1. Parse the query from the escrow demand
        // 2. Check if the result satisfies the query
        // 3. Submit the validation decision

        trustedOracleArbiter.arbitrate(fulfillmentUid, innerDemand, true);
        vm.stopPrank();

        // Step 4: Bob claims the payment
        uint256 bobBalanceBefore = paymentToken.balanceOf(bob);

        vm.prank(bob);
        erc20EscrowObligation.collect(escrowUid, fulfillmentUid);

        assertEq(paymentToken.balanceOf(bob), bobBalanceBefore + PAYMENT_AMOUNT, "Bob should receive payment");
        assertEq(paymentToken.balanceOf(address(erc20EscrowObligation)), 0, "Escrow should be empty");
    }

    /**
     * @notice Test that only the designated oracle can validate results
     * @dev Demonstrates the security pattern where arbitration is restricted
     */
    function test_OnlyDesignatedOracleCanValidate() public {
        // Create escrow with Charlie as oracle
        vm.startPrank(alice);
        bytes memory innerDemand = abi.encode(API_QUERY);
        TrustedOracleArbiter.DemandData memory demandData =
            TrustedOracleArbiter.DemandData({oracle: charlie, data: innerDemand});
        bytes memory demand = abi.encode(demandData);

        paymentToken.approve(address(erc20EscrowObligation), PAYMENT_AMOUNT);
        ERC20EscrowObligation.ObligationData memory escrowData = ERC20EscrowObligation.ObligationData({
            token: address(paymentToken), amount: PAYMENT_AMOUNT, arbiter: address(trustedOracleArbiter), demand: demand
        });

        bytes32 escrowUid = erc20EscrowObligation.doObligation(escrowData, uint64(block.timestamp + 1 days));
        vm.stopPrank();

        // Bob submits result
        vm.prank(bob);
        bytes32 fulfillmentUid = stringObligation.doObligation(
            StringObligation.ObligationData({item: API_RESULT, schema: bytes32(0)}), escrowUid
        );

        // Bob (not the oracle) tries to validate - this should work but won't be recognized
        vm.prank(bob);
        trustedOracleArbiter.arbitrate(fulfillmentUid, innerDemand, true);

        // Bob's arbitration won't work because the demand specifies Charlie
        vm.prank(bob);
        vm.expectRevert();
        erc20EscrowObligation.collect(escrowUid, fulfillmentUid);

        // Charlie's arbitration will work
        vm.prank(charlie);
        trustedOracleArbiter.arbitrate(fulfillmentUid, innerDemand, true);

        vm.prank(bob);
        erc20EscrowObligation.collect(escrowUid, fulfillmentUid);

        assertGt(paymentToken.balanceOf(bob), 0, "Bob should receive payment after correct oracle validation");
    }

    /**
     * @notice Test negative validation by oracle
     * @dev Demonstrates the pattern where invalid results are rejected
     */
    function test_OracleRejectsInvalidResult() public {
        // Create escrow
        vm.startPrank(alice);
        bytes memory demand =
            abi.encode(TrustedOracleArbiter.DemandData({oracle: charlie, data: abi.encode(API_QUERY)}));

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

        // Bob submits wrong result
        vm.prank(bob);
        bytes32 fulfillmentUid = stringObligation.doObligation(
            StringObligation.ObligationData({item: "wrong result", schema: bytes32(0)}), escrowUid
        );

        // Charlie validates as false
        vm.prank(charlie);
        trustedOracleArbiter.arbitrate(fulfillmentUid, abi.encode(API_QUERY), false);

        // Bob cannot claim payment
        vm.prank(bob);
        vm.expectRevert();
        erc20EscrowObligation.collect(escrowUid, fulfillmentUid);

        assertEq(
            paymentToken.balanceOf(address(erc20EscrowObligation)),
            PAYMENT_AMOUNT,
            "Payment should remain in escrow after rejection"
        );
    }

    /**
     * @notice Test expired escrow reclaim
     * @dev Demonstrates the pattern where requesters can reclaim funds if no valid fulfillment occurs
     */
    function test_ReclaimExpiredEscrow() public {
        // Create escrow with short expiration
        vm.startPrank(alice);
        bytes memory demand =
            abi.encode(TrustedOracleArbiter.DemandData({oracle: charlie, data: abi.encode(API_QUERY)}));

        paymentToken.approve(address(erc20EscrowObligation), PAYMENT_AMOUNT);
        bytes32 escrowUid = erc20EscrowObligation.doObligation(
            ERC20EscrowObligation.ObligationData({
                token: address(paymentToken),
                amount: PAYMENT_AMOUNT,
                arbiter: address(trustedOracleArbiter),
                demand: demand
            }),
            uint64(block.timestamp + 1 hours)
        );
        vm.stopPrank();

        // Fast forward past expiration
        vm.warp(block.timestamp + 2 hours);

        // Alice reclaims expired escrow
        uint256 aliceBalanceBefore = paymentToken.balanceOf(alice);
        vm.prank(alice);
        erc20EscrowObligation.reclaim(escrowUid);

        assertEq(
            paymentToken.balanceOf(alice), aliceBalanceBefore + PAYMENT_AMOUNT, "Alice should reclaim full payment"
        );
    }
}
