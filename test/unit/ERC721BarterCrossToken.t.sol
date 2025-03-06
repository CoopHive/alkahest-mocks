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
import {ERC721BarterCrossToken} from "../../src/Utils/ERC721BarterCrossToken.sol";
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

contract ERC721BarterCrossTokenUnitTest is Test {
    ERC20EscrowObligation public erc20Escrow;
    ERC20PaymentObligation public erc20Payment;
    ERC721EscrowObligation public erc721Escrow;
    ERC721PaymentObligation public erc721Payment;
    ERC1155EscrowObligation public erc1155Escrow;
    ERC1155PaymentObligation public erc1155Payment;
    TokenBundleEscrowObligation public bundleEscrow;
    TokenBundlePaymentObligation public bundlePayment;
    ERC721BarterCrossToken public barterCross;

    MockERC20 public erc20Token;
    MockERC721 public nftTokenA;
    MockERC721 public nftTokenB;
    MockERC1155 public multiToken;

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

    uint256 public aliceNftId;
    uint256 public bobNftId;
    uint256 public multiTokenId = 1;
    uint256 public multiTokenAmount = 100;
    uint256 public erc20Amount = 500 * 10**18;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        // Deploy mock tokens
        erc20Token = new MockERC20("Test Token", "TEST");
        nftTokenA = new MockERC721();
        nftTokenB = new MockERC721();
        multiToken = new MockERC1155();

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
        barterCross = new ERC721BarterCrossToken(
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
        
        vm.prank(alice);
        aliceNftId = nftTokenA.mint(alice); // Alice has nftTokenA
        
        vm.prank(bob);
        bobNftId = nftTokenB.mint(bob); // Bob has nftTokenB
        
        multiToken.mint(bob, multiTokenId, multiTokenAmount); // Bob has multiToken
    }

    // ERC721 for ERC20 tests
    function testBuyErc20WithErc721() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        nftTokenA.approve(address(erc721Escrow), aliceNftId);
        bytes32 buyAttestation = barterCross.buyErc20WithErc721(
            address(nftTokenA),
            aliceNftId,
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
        ERC721EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC721EscrowObligation.StatementData)
        );
        
        assertEq(escrowData.token, address(nftTokenA), "Token should match");
        assertEq(escrowData.tokenId, aliceNftId, "TokenId should match");
        assertEq(escrowData.arbiter, address(erc20Payment), "Arbiter should be erc20Payment");
        
        // Extract the demand data
        ERC20PaymentObligation.StatementData memory demandData = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.StatementData)
        );
        
        assertEq(demandData.token, address(erc20Token), "ERC20 token should match");
        assertEq(demandData.amount, erc20Amount, "ERC20 amount should match");
        assertEq(demandData.payee, alice, "Payee should be Alice");

        // Verify that Alice's NFT is now escrowed
        assertEq(nftTokenA.ownerOf(aliceNftId), address(erc721Escrow), "NFT should be in escrow");
    }

    function testPayErc721ForErc20() public {
        // First create a bid from Alice
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        nftTokenA.approve(address(erc721Escrow), aliceNftId);
        bytes32 buyAttestation = barterCross.buyErc20WithErc721(
            address(nftTokenA),
            aliceNftId,
            address(erc20Token),
            erc20Amount,
            expiration
        );
        vm.stopPrank();

        // Bob fulfills Alice's bid
        vm.startPrank(bob);
        erc20Token.approve(address(erc20Payment), erc20Amount);
        bytes32 payAttestation = barterCross.payErc721ForErc20(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(nftTokenA.ownerOf(aliceNftId), bob, "Bob should now own Alice's NFT");
        assertEq(erc20Token.balanceOf(alice), erc20Amount, "Alice should receive ERC20 tokens");
        assertEq(erc20Token.balanceOf(bob), 0, "Bob should have no ERC20 tokens left");
    }

    // ERC721 for ERC1155 tests
    function testBuyErc1155WithErc721() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        nftTokenA.approve(address(erc721Escrow), aliceNftId);
        bytes32 buyAttestation = barterCross.buyErc1155WithErc721(
            address(nftTokenA),
            aliceNftId,
            address(multiToken),
            multiTokenId,
            multiTokenAmount,
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
        ERC721EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC721EscrowObligation.StatementData)
        );
        
        assertEq(escrowData.token, address(nftTokenA), "Token should match");
        assertEq(escrowData.tokenId, aliceNftId, "TokenId should match");
        assertEq(escrowData.arbiter, address(erc1155Payment), "Arbiter should be erc1155Payment");
        
        // Extract the demand data
        ERC1155PaymentObligation.StatementData memory demandData = abi.decode(
            escrowData.demand,
            (ERC1155PaymentObligation.StatementData)
        );
        
        assertEq(demandData.token, address(multiToken), "ERC1155 token should match");
        assertEq(demandData.tokenId, multiTokenId, "ERC1155 tokenId should match");
        assertEq(demandData.amount, multiTokenAmount, "ERC1155 amount should match");
        assertEq(demandData.payee, alice, "Payee should be Alice");

        // Verify that Alice's NFT is now escrowed
        assertEq(nftTokenA.ownerOf(aliceNftId), address(erc721Escrow), "NFT should be in escrow");
    }

    function testPayErc721ForErc1155() public {
        // First create a bid from Alice
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        nftTokenA.approve(address(erc721Escrow), aliceNftId);
        bytes32 buyAttestation = barterCross.buyErc1155WithErc721(
            address(nftTokenA),
            aliceNftId,
            address(multiToken),
            multiTokenId,
            multiTokenAmount,
            expiration
        );
        vm.stopPrank();

        // Bob fulfills Alice's bid
        vm.startPrank(bob);
        multiToken.setApprovalForAll(address(erc1155Payment), true);
        bytes32 payAttestation = barterCross.payErc721ForErc1155(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(nftTokenA.ownerOf(aliceNftId), bob, "Bob should now own Alice's NFT");
        assertEq(
            multiToken.balanceOf(alice, multiTokenId),
            multiTokenAmount,
            "Alice should receive ERC1155 tokens"
        );
        assertEq(
            multiToken.balanceOf(bob, multiTokenId),
            0,
            "Bob should have no ERC1155 tokens left"
        );
    }

    // ERC721 for Token Bundle tests
    function testBuyBundleWithErc721() public {
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
        bundleData.erc721Tokens[0] = address(nftTokenB);
        bundleData.erc721TokenIds[0] = bobNftId;
        bundleData.erc1155Tokens[0] = address(multiToken);
        bundleData.erc1155TokenIds[0] = multiTokenId;
        bundleData.erc1155Amounts[0] = multiTokenAmount / 2;

        vm.startPrank(alice);
        nftTokenA.approve(address(erc721Escrow), aliceNftId);
        bytes32 buyAttestation = barterCross.buyBundleWithErc721(
            address(nftTokenA),
            aliceNftId,
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
        ERC721EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC721EscrowObligation.StatementData)
        );
        
        assertEq(escrowData.token, address(nftTokenA), "Token should match");
        assertEq(escrowData.tokenId, aliceNftId, "TokenId should match");
        assertEq(escrowData.arbiter, address(bundlePayment), "Arbiter should be bundlePayment");
        
        // Extract the demand data - we'll just verify it's correctly decodable
        TokenBundlePaymentObligation.StatementData memory demandData = abi.decode(
            escrowData.demand,
            (TokenBundlePaymentObligation.StatementData)
        );
        
        assertEq(demandData.payee, alice, "Payee should be Alice");
        assertEq(demandData.erc20Tokens[0], address(erc20Token), "ERC20 token should match");
        assertEq(demandData.erc721Tokens[0], address(nftTokenB), "ERC721 token should match");
        assertEq(demandData.erc1155Tokens[0], address(multiToken), "ERC1155 token should match");

        // Verify that Alice's NFT is now escrowed
        assertEq(nftTokenA.ownerOf(aliceNftId), address(erc721Escrow), "NFT should be in escrow");
    }

    function testPayErc721ForBundle() public {
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
        bundleData.erc721Tokens[0] = address(nftTokenB);
        bundleData.erc721TokenIds[0] = bobNftId;
        bundleData.erc1155Tokens[0] = address(multiToken);
        bundleData.erc1155TokenIds[0] = multiTokenId;
        bundleData.erc1155Amounts[0] = multiTokenAmount / 2;

        vm.startPrank(alice);
        nftTokenA.approve(address(erc721Escrow), aliceNftId);
        bytes32 buyAttestation = barterCross.buyBundleWithErc721(
            address(nftTokenA),
            aliceNftId,
            bundleData,
            expiration
        );
        vm.stopPrank();

        // Bob approves and fulfills
        vm.startPrank(bob);
        erc20Token.approve(address(bundlePayment), erc20Amount / 2);
        nftTokenB.approve(address(bundlePayment), bobNftId);
        multiToken.setApprovalForAll(address(bundlePayment), true);
        bytes32 payAttestation = barterCross.payErc721ForBundle(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(nftTokenA.ownerOf(aliceNftId), bob, "Bob should now own Alice's NFT");
        assertEq(
            erc20Token.balanceOf(alice),
            erc20Amount / 2,
            "Alice should receive ERC20 tokens"
        );
        assertEq(
            nftTokenB.ownerOf(bobNftId),
            alice,
            "Alice should receive Bob's NFT"
        );
        assertEq(
            multiToken.balanceOf(alice, multiTokenId),
            multiTokenAmount / 2,
            "Alice should receive ERC1155 tokens"
        );
    }

    // Error test cases
    function test_RevertWhen_TokenNotApproved() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice tries to make bid without approving NFT
        vm.startPrank(alice);
        vm.expectRevert(); // ERC721: caller is not token owner or approved
        barterCross.buyErc20WithErc721(
            address(nftTokenA),
            aliceNftId,
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
        nftTokenA.approve(address(erc721Escrow), aliceNftId);
        bytes32 buyAttestation = barterCross.buyErc20WithErc721(
            address(nftTokenA),
            aliceNftId,
            address(erc20Token),
            erc20Amount,
            expiration
        );
        vm.stopPrank();

        // Bob tries to fulfill without approving tokens
        vm.startPrank(bob);
        vm.expectRevert(); // ERC20: insufficient allowance
        barterCross.payErc721ForErc20(buyAttestation);
        vm.stopPrank();
    }

    function test_RevertWhen_BidExpired() public {
        // Create a bid with short expiration
        uint64 expiration = uint64(block.timestamp + 10 minutes);

        vm.startPrank(alice);
        nftTokenA.approve(address(erc721Escrow), aliceNftId);
        bytes32 buyAttestation = barterCross.buyErc20WithErc721(
            address(nftTokenA),
            aliceNftId,
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
        barterCross.payErc721ForErc20(buyAttestation);
        vm.stopPrank();
    }
}