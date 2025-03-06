// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC1155EscrowObligation} from "../../src/Statements/ERC1155EscrowObligation.sol";
import {ERC1155PaymentObligation} from "../../src/Statements/ERC1155PaymentObligation.sol";
import {ERC1155BarterUtils} from "../../src/Utils/ERC1155BarterUtils.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract MockERC1155 is ERC1155 {
    constructor() ERC1155("") {}

    function mint(address to, uint256 id, uint256 amount) public {
        _mint(to, id, amount, "");
    }
}

contract ERC1155BarterUtilsUnitTest is Test {
    ERC1155EscrowObligation public escrowStatement;
    ERC1155PaymentObligation public paymentStatement;
    ERC1155BarterUtils public barterUtils;

    MockERC1155 public tokenA;
    MockERC1155 public tokenB;

    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    address public constant EAS_ADDRESS =
        0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS =
        0xA7b39296258348C78294F95B872b282326A97BDF;

    uint256 internal constant ALICE_PRIVATE_KEY = 0xa11ce;
    uint256 internal constant BOB_PRIVATE_KEY = 0xb0b;

    address public alice;
    address public bob;

    // Token parameters
    uint256 public aliceTokenId = 1;
    uint256 public aliceTokenAmount = 50;
    uint256 public bobTokenId = 2;
    uint256 public bobTokenAmount = 25;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        // Deploy mock ERC1155 tokens
        tokenA = new MockERC1155();
        tokenB = new MockERC1155();

        // Deploy statements
        escrowStatement = new ERC1155EscrowObligation(eas, schemaRegistry);
        paymentStatement = new ERC1155PaymentObligation(eas, schemaRegistry);

        // Deploy barter utils contract
        barterUtils = new ERC1155BarterUtils(
            eas,
            escrowStatement,
            paymentStatement
        );

        // Setup initial token balances
        tokenA.mint(alice, aliceTokenId, aliceTokenAmount); // Alice has tokenA
        tokenB.mint(bob, bobTokenId, bobTokenAmount); // Bob has tokenB
    }

    function testBuyErc1155ForErc1155() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        tokenA.setApprovalForAll(address(escrowStatement), true);
        bytes32 buyAttestation = barterUtils.buyErc1155ForErc1155(
            address(tokenA),
            aliceTokenId,
            aliceTokenAmount,
            address(tokenB),
            bobTokenId,
            bobTokenAmount,
            expiration
        );
        vm.stopPrank();

        assertNotEq(
            buyAttestation,
            bytes32(0),
            "Buy attestation should be created"
        );

        // Validate the attestation data
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC1155EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC1155EscrowObligation.StatementData)
        );
        
        assertEq(escrowData.token, address(tokenA), "Token should match");
        assertEq(escrowData.tokenId, aliceTokenId, "TokenId should match");
        assertEq(escrowData.amount, aliceTokenAmount, "Token amount should match");
        assertEq(escrowData.arbiter, address(paymentStatement), "Arbiter should be payment statement");
        
        // Extract the demand data
        ERC1155PaymentObligation.StatementData memory demandData = abi.decode(
            escrowData.demand,
            (ERC1155PaymentObligation.StatementData)
        );
        
        assertEq(demandData.token, address(tokenB), "Demand token should match");
        assertEq(demandData.tokenId, bobTokenId, "Demand tokenId should match");
        assertEq(demandData.amount, bobTokenAmount, "Demand token amount should match");
        assertEq(demandData.payee, alice, "Payee should be Alice");

        // Verify that Alice's tokens are now escrowed
        assertEq(
            tokenA.balanceOf(address(escrowStatement), aliceTokenId), 
            aliceTokenAmount, 
            "Tokens should be in escrow"
        );
        assertEq(
            tokenA.balanceOf(alice, aliceTokenId), 
            0, 
            "Alice should have no tokens left"
        );
    }

    function testPayErc1155ForErc1155() public {
        // First create a buy attestation
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        tokenA.setApprovalForAll(address(escrowStatement), true);
        bytes32 buyAttestation = barterUtils.buyErc1155ForErc1155(
            address(tokenA),
            aliceTokenId,
            aliceTokenAmount,
            address(tokenB),
            bobTokenId,
            bobTokenAmount,
            expiration
        );
        vm.stopPrank();

        // Initial token balances (after escrow)
        assertEq(tokenA.balanceOf(alice, aliceTokenId), 0);
        assertEq(tokenA.balanceOf(address(escrowStatement), aliceTokenId), aliceTokenAmount);
        assertEq(tokenB.balanceOf(bob, bobTokenId), bobTokenAmount);
        assertEq(tokenB.balanceOf(alice, bobTokenId), 0);

        // Now Bob fulfills the request
        vm.startPrank(bob);
        tokenB.setApprovalForAll(address(paymentStatement), true);
        bytes32 payAttestation = barterUtils.payErc1155ForErc1155(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(
            tokenA.balanceOf(bob, aliceTokenId), 
            aliceTokenAmount, 
            "Bob should now have Alice's tokens"
        );
        assertEq(
            tokenB.balanceOf(alice, bobTokenId), 
            bobTokenAmount, 
            "Alice should now have Bob's tokens"
        );
        assertEq(
            tokenA.balanceOf(address(escrowStatement), aliceTokenId), 
            0, 
            "Escrow should have released tokens"
        );
        assertEq(
            tokenB.balanceOf(bob, bobTokenId), 
            0, 
            "Bob should have no tokens left"
        );
    }

    function testDemandDataExtraction() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        tokenA.setApprovalForAll(address(escrowStatement), true);
        bytes32 buyAttestation = barterUtils.buyErc1155ForErc1155(
            address(tokenA),
            aliceTokenId,
            aliceTokenAmount,
            address(tokenB),
            bobTokenId,
            bobTokenAmount,
            expiration
        );
        vm.stopPrank();

        // Extract the attestation and manually decode it
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC1155EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC1155EscrowObligation.StatementData)
        );
        
        ERC1155PaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (ERC1155PaymentObligation.StatementData)
        );
        
        // Verify the demand data matches what we expect
        assertEq(demand.token, address(tokenB), "Token should match");
        assertEq(demand.tokenId, bobTokenId, "TokenId should match");
        assertEq(demand.amount, bobTokenAmount, "Amount should match");
        assertEq(demand.payee, alice, "Payee should be alice");
    }

    function test_RevertWhen_TokenNotApproved() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice tries to make bid without approving tokens
        vm.startPrank(alice);
        vm.expectRevert(); // ERC1155: caller is not owner nor approved
        barterUtils.buyErc1155ForErc1155(
            address(tokenA),
            aliceTokenId,
            aliceTokenAmount,
            address(tokenB),
            bobTokenId,
            bobTokenAmount,
            expiration
        );
        vm.stopPrank();
    }

    function test_RevertWhen_InsufficientBalance() public {
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 tooManyTokens = aliceTokenAmount * 2; // More than Alice has

        vm.startPrank(alice);
        tokenA.setApprovalForAll(address(escrowStatement), true);
        vm.expectRevert(); // ERC1155: insufficient balance for transfer
        barterUtils.buyErc1155ForErc1155(
            address(tokenA),
            aliceTokenId,
            tooManyTokens,
            address(tokenB),
            bobTokenId,
            bobTokenAmount,
            expiration
        );
        vm.stopPrank();
    }

    function test_RevertWhen_PaymentFails() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice makes bid
        vm.startPrank(alice);
        tokenA.setApprovalForAll(address(escrowStatement), true);
        bytes32 buyAttestation = barterUtils.buyErc1155ForErc1155(
            address(tokenA),
            aliceTokenId,
            aliceTokenAmount,
            address(tokenB),
            bobTokenId,
            bobTokenAmount,
            expiration
        );
        vm.stopPrank();

        // Bob transfers his tokens to someone else
        address thirdParty = makeAddr("third-party");
        vm.startPrank(bob);
        tokenB.safeTransferFrom(bob, thirdParty, bobTokenId, bobTokenAmount, "");
        vm.stopPrank();

        // Bob tries to fulfill request with tokens he no longer owns
        vm.startPrank(bob);
        tokenB.setApprovalForAll(address(paymentStatement), true);
        vm.expectRevert(); // ERC1155: insufficient balance for transfer
        barterUtils.payErc1155ForErc1155(buyAttestation);
        vm.stopPrank();
    }

    function test_RevertWhen_BidExpired() public {
        // Create a bid with short expiration
        uint64 expiration = uint64(block.timestamp + 10 minutes);

        vm.startPrank(alice);
        tokenA.setApprovalForAll(address(escrowStatement), true);
        bytes32 buyAttestation = barterUtils.buyErc1155ForErc1155(
            address(tokenA),
            aliceTokenId,
            aliceTokenAmount,
            address(tokenB),
            bobTokenId,
            bobTokenAmount,
            expiration
        );
        vm.stopPrank();

        // Warp time past expiration
        vm.warp(block.timestamp + 20 minutes);

        // Bob tries to fulfill expired bid
        vm.startPrank(bob);
        tokenB.setApprovalForAll(address(paymentStatement), true);
        vm.expectRevert();
        barterUtils.payErc1155ForErc1155(buyAttestation);
        vm.stopPrank();
    }

    // Note: We removed the test_FullFulfillment function as it was duplicating
    // the functionality already covered by testPayErc1155ForErc1155
    // If partial fulfillment is implemented in the future, we can add a specific
    // test for that feature
}