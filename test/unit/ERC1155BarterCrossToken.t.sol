// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC20EscrowObligation} from "../../src/Statements/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "../../src/Statements/ERC20PaymentObligation.sol";
import {ERC721EscrowObligation} from "../../src/Statements/ERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "../../src/Statements/ERC721PaymentObligation.sol";
import {ERC1155EscrowObligation} from "../../src/Statements/ERC1155EscrowObligation.sol";
import {ERC1155PaymentObligation} from "../../src/Statements/ERC1155PaymentObligation.sol";
import {TokenBundleEscrowObligation} from "../../src/Statements/TokenBundleEscrowObligation.sol";
import {TokenBundlePaymentObligation} from "../../src/Statements/TokenBundlePaymentObligation.sol";
import {ERC1155BarterCrossToken} from "../../src/Utils/ERC1155BarterCrossToken.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract MockERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract MockERC721 is ERC721 {
    uint256 private _currentTokenId = 0;

    constructor() ERC721("Mock NFT", "MNFT") {}

    function mint(address to) public returns (uint256) {
        _currentTokenId++;
        _mint(to, _currentTokenId);
        return _currentTokenId;
    }
}

contract MockERC1155 is ERC1155 {
    constructor() ERC1155("") {}

    function mint(address to, uint256 id, uint256 amount) public {
        _mint(to, id, amount, "");
    }
}

contract ERC1155BarterCrossTokenUnitTest is Test {
    ERC20EscrowObligation public erc20Escrow;
    ERC20PaymentObligation public erc20Payment;
    ERC721EscrowObligation public erc721Escrow;
    ERC721PaymentObligation public erc721Payment;
    ERC1155EscrowObligation public erc1155Escrow;
    ERC1155PaymentObligation public erc1155Payment;
    TokenBundleEscrowObligation public bundleEscrow;
    TokenBundlePaymentObligation public bundlePayment;
    ERC1155BarterCrossToken public barterCross;

    MockERC20 public erc20Token;
    MockERC721 public nftToken;
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

    uint256 public tokenAId = 1;
    uint256 public tokenAAmount = 100;
    uint256 public tokenBId = 2;
    uint256 public tokenBAmount = 50;
    uint256 public erc20Amount = 500 * 10**18;
    uint256 public nftTokenId;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        // Deploy mock tokens
        erc20Token = new MockERC20("Test Token", "TEST");
        nftToken = new MockERC721();
        tokenA = new MockERC1155();
        tokenB = new MockERC1155();

        // Deploy statements
        erc20Escrow = new ERC20EscrowObligation(eas, schemaRegistry);
        erc20Payment = new ERC20PaymentObligation(eas, schemaRegistry);
        erc721Escrow = new ERC721EscrowObligation(eas, schemaRegistry);
        erc721Payment = new ERC721PaymentObligation(eas, schemaRegistry);
        erc1155Escrow = new ERC1155EscrowObligation(eas, schemaRegistry);
        erc1155Payment = new ERC1155PaymentObligation(eas, schemaRegistry);
        bundleEscrow = new TokenBundleEscrowObligation(eas, schemaRegistry);
        bundlePayment = new TokenBundlePaymentObligation(eas, schemaRegistry);

        // Deploy barter cross token contract
        barterCross = new ERC1155BarterCrossToken(
            eas,
            erc20Escrow,
            erc20Payment,
            erc721Escrow,
            erc721Payment,
            erc1155Escrow,
            erc1155Payment,
            bundleEscrow,
            bundlePayment
        );

        // Setup initial token balances
        erc20Token.transfer(bob, erc20Amount);
        
        vm.prank(bob);
        nftTokenId = nftToken.mint(bob); // Bob has a NFT
        
        tokenA.mint(alice, tokenAId, tokenAAmount); // Alice has tokenA
        tokenB.mint(bob, tokenBId, tokenBAmount); // Bob has tokenB
    }

    // ERC1155 for ERC20 tests
    function testBuyErc20WithErc1155() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        tokenA.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = barterCross.buyErc20WithErc1155(
            address(tokenA),
            tokenAId,
            tokenAAmount,
            address(erc20Token),
            erc20Amount,
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
        assertEq(escrowData.tokenId, tokenAId, "TokenId should match");
        assertEq(escrowData.amount, tokenAAmount, "Amount should match");
        assertEq(escrowData.arbiter, address(erc20Payment), "Arbiter should be erc20Payment");
        
        // Extract the demand data
        ERC20PaymentObligation.StatementData memory demandData = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.StatementData)
        );
        
        assertEq(demandData.token, address(erc20Token), "ERC20 token should match");
        assertEq(demandData.amount, erc20Amount, "ERC20 amount should match");
        assertEq(demandData.payee, alice, "Payee should be Alice");

        // Verify that Alice's tokens are now escrowed
        assertEq(
            tokenA.balanceOf(address(erc1155Escrow), tokenAId),
            tokenAAmount,
            "Tokens should be in escrow"
        );
        assertEq(
            tokenA.balanceOf(alice, tokenAId),
            0,
            "Alice should have no tokens left"
        );
    }

    function testPayErc1155ForErc20() public {
        // First create a bid from Alice
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        tokenA.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = barterCross.buyErc20WithErc1155(
            address(tokenA),
            tokenAId,
            tokenAAmount,
            address(erc20Token),
            erc20Amount,
            expiration
        );
        vm.stopPrank();

        // Bob fulfills Alice's bid
        vm.startPrank(bob);
        erc20Token.approve(address(erc20Payment), erc20Amount);
        bytes32 payAttestation = barterCross.payErc1155ForErc20(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(
            tokenA.balanceOf(bob, tokenAId),
            tokenAAmount,
            "Bob should now have Alice's tokens"
        );
        assertEq(
            erc20Token.balanceOf(alice),
            erc20Amount,
            "Alice should receive ERC20 tokens"
        );
        assertEq(
            erc20Token.balanceOf(bob),
            0,
            "Bob should have no ERC20 tokens left"
        );
        assertEq(
            tokenA.balanceOf(address(erc1155Escrow), tokenAId),
            0,
            "Escrow should have released tokens"
        );
    }

    // ERC1155 for ERC721 tests
    function testBuyErc721WithErc1155() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        tokenA.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = barterCross.buyErc721WithErc1155(
            address(tokenA),
            tokenAId,
            tokenAAmount,
            address(nftToken),
            nftTokenId,
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
        assertEq(escrowData.tokenId, tokenAId, "TokenId should match");
        assertEq(escrowData.amount, tokenAAmount, "Amount should match");
        assertEq(escrowData.arbiter, address(erc721Payment), "Arbiter should be erc721Payment");
        
        // Extract the demand data
        ERC721PaymentObligation.StatementData memory demandData = abi.decode(
            escrowData.demand,
            (ERC721PaymentObligation.StatementData)
        );
        
        assertEq(demandData.token, address(nftToken), "NFT token should match");
        assertEq(demandData.tokenId, nftTokenId, "NFT ID should match");
        assertEq(demandData.payee, alice, "Payee should be Alice");

        // Verify that Alice's tokens are now escrowed
        assertEq(
            tokenA.balanceOf(address(erc1155Escrow), tokenAId),
            tokenAAmount,
            "Tokens should be in escrow"
        );
        assertEq(
            tokenA.balanceOf(alice, tokenAId),
            0,
            "Alice should have no tokens left"
        );
    }

    function testPayErc1155ForErc721() public {
        // First create a bid from Alice
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        tokenA.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = barterCross.buyErc721WithErc1155(
            address(tokenA),
            tokenAId,
            tokenAAmount,
            address(nftToken),
            nftTokenId,
            expiration
        );
        vm.stopPrank();

        // Bob fulfills Alice's bid
        vm.startPrank(bob);
        nftToken.approve(address(erc721Payment), nftTokenId);
        bytes32 payAttestation = barterCross.payErc1155ForErc721(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(
            tokenA.balanceOf(bob, tokenAId),
            tokenAAmount,
            "Bob should now have Alice's tokens"
        );
        assertEq(
            nftToken.ownerOf(nftTokenId),
            alice,
            "Alice should now own the NFT"
        );
        assertEq(
            tokenA.balanceOf(address(erc1155Escrow), tokenAId),
            0,
            "Escrow should have released tokens"
        );
    }

    // ERC1155 for Bundle tests
    function testBuyBundleWithErc1155() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Create bundle data
        TokenBundlePaymentObligation.StatementData memory bundleData = TokenBundlePaymentObligation.StatementData({
            erc20Tokens: new address[](1),
            erc20Amounts: new uint256[](1),
            erc721Tokens: new address[](1),
            erc721TokenIds: new uint256[](1),
            erc1155Tokens: new address[](1),
            erc1155TokenIds: new uint256[](1),
            erc1155Amounts: new uint256[](1),
            payee: alice
        });

        bundleData.erc20Tokens[0] = address(erc20Token);
        bundleData.erc20Amounts[0] = erc20Amount / 2;
        bundleData.erc721Tokens[0] = address(nftToken);
        bundleData.erc721TokenIds[0] = nftTokenId;
        bundleData.erc1155Tokens[0] = address(tokenB);
        bundleData.erc1155TokenIds[0] = tokenBId;
        bundleData.erc1155Amounts[0] = tokenBAmount / 2;

        vm.startPrank(alice);
        tokenA.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = barterCross.buyBundleWithErc1155(
            address(tokenA),
            tokenAId,
            tokenAAmount,
            bundleData,
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
        assertEq(escrowData.tokenId, tokenAId, "TokenId should match");
        assertEq(escrowData.amount, tokenAAmount, "Amount should match");
        assertEq(escrowData.arbiter, address(bundlePayment), "Arbiter should be bundlePayment");
        
        // Extract the demand data - we'll just verify it's correctly decodable
        TokenBundlePaymentObligation.StatementData memory demandData = abi.decode(
            escrowData.demand,
            (TokenBundlePaymentObligation.StatementData)
        );
        
        assertEq(demandData.payee, alice, "Payee should be Alice");
        assertEq(demandData.erc20Tokens[0], address(erc20Token), "ERC20 token should match");
        assertEq(demandData.erc721Tokens[0], address(nftToken), "ERC721 token should match");
        assertEq(demandData.erc1155Tokens[0], address(tokenB), "ERC1155 token should match");

        // Verify that Alice's tokens are now escrowed
        assertEq(
            tokenA.balanceOf(address(erc1155Escrow), tokenAId),
            tokenAAmount,
            "Tokens should be in escrow"
        );
        assertEq(
            tokenA.balanceOf(alice, tokenAId),
            0,
            "Alice should have no tokens left"
        );
    }

    function testPayErc1155ForBundle() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Create bundle data
        TokenBundlePaymentObligation.StatementData memory bundleData = TokenBundlePaymentObligation.StatementData({
            erc20Tokens: new address[](1),
            erc20Amounts: new uint256[](1),
            erc721Tokens: new address[](1),
            erc721TokenIds: new uint256[](1),
            erc1155Tokens: new address[](1),
            erc1155TokenIds: new uint256[](1),
            erc1155Amounts: new uint256[](1),
            payee: alice
        });

        bundleData.erc20Tokens[0] = address(erc20Token);
        bundleData.erc20Amounts[0] = erc20Amount / 2;
        bundleData.erc721Tokens[0] = address(nftToken);
        bundleData.erc721TokenIds[0] = nftTokenId;
        bundleData.erc1155Tokens[0] = address(tokenB);
        bundleData.erc1155TokenIds[0] = tokenBId;
        bundleData.erc1155Amounts[0] = tokenBAmount / 2;

        vm.startPrank(alice);
        tokenA.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = barterCross.buyBundleWithErc1155(
            address(tokenA),
            tokenAId,
            tokenAAmount,
            bundleData,
            expiration
        );
        vm.stopPrank();

        // Bob approves and fulfills
        vm.startPrank(bob);
        erc20Token.approve(address(bundlePayment), erc20Amount / 2);
        nftToken.approve(address(bundlePayment), nftTokenId);
        tokenB.setApprovalForAll(address(bundlePayment), true);
        bytes32 payAttestation = barterCross.payErc1155ForBundle(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(
            tokenA.balanceOf(bob, tokenAId),
            tokenAAmount,
            "Bob should now have Alice's tokens"
        );
        assertEq(
            erc20Token.balanceOf(alice),
            erc20Amount / 2,
            "Alice should receive ERC20 tokens"
        );
        assertEq(
            nftToken.ownerOf(nftTokenId),
            alice,
            "Alice should receive Bob's NFT"
        );
        assertEq(
            tokenB.balanceOf(alice, tokenBId),
            tokenBAmount / 2,
            "Alice should receive ERC1155 tokens"
        );
        assertEq(
            tokenA.balanceOf(address(erc1155Escrow), tokenAId),
            0,
            "Escrow should have released tokens"
        );
    }

    // Error test cases
    function test_RevertWhen_TokenNotApproved() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice tries to make bid without approving tokens
        vm.startPrank(alice);
        vm.expectRevert(); // ERC1155: caller is not owner nor approved
        barterCross.buyErc20WithErc1155(
            address(tokenA),
            tokenAId,
            tokenAAmount,
            address(erc20Token),
            erc20Amount,
            expiration
        );
        vm.stopPrank();
    }

    function test_RevertWhen_InsufficientBalance() public {
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 tooManyTokens = tokenAAmount * 2; // More than Alice has

        vm.startPrank(alice);
        tokenA.setApprovalForAll(address(erc1155Escrow), true);
        vm.expectRevert(); // ERC1155: insufficient balance for transfer
        barterCross.buyErc20WithErc1155(
            address(tokenA),
            tokenAId,
            tooManyTokens,
            address(erc20Token),
            erc20Amount,
            expiration
        );
        vm.stopPrank();
    }

    function test_RevertWhen_PaymentFails() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice makes bid
        vm.startPrank(alice);
        tokenA.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = barterCross.buyErc20WithErc1155(
            address(tokenA),
            tokenAId,
            tokenAAmount,
            address(erc20Token),
            erc20Amount,
            expiration
        );
        vm.stopPrank();

        // Bob tries to fulfill without approving tokens
        vm.startPrank(bob);
        vm.expectRevert(); // ERC20: insufficient allowance
        barterCross.payErc1155ForErc20(buyAttestation);
        vm.stopPrank();
    }

    function test_RevertWhen_BidExpired() public {
        // Create a bid with short expiration
        uint64 expiration = uint64(block.timestamp + 10 minutes);

        vm.startPrank(alice);
        tokenA.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = barterCross.buyErc20WithErc1155(
            address(tokenA),
            tokenAId,
            tokenAAmount,
            address(erc20Token),
            erc20Amount,
            expiration
        );
        vm.stopPrank();

        // Warp time past expiration
        vm.warp(block.timestamp + 20 minutes);

        // Bob tries to fulfill expired bid
        vm.startPrank(bob);
        erc20Token.approve(address(erc20Payment), erc20Amount);
        vm.expectRevert();
        barterCross.payErc1155ForErc20(buyAttestation);
        vm.stopPrank();
    }
}