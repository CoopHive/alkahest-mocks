// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC20EscrowObligation} from "@src/obligations/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "@src/obligations/ERC20PaymentObligation.sol";
import {ERC721EscrowObligation} from "@src/obligations/ERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "@src/obligations/ERC721PaymentObligation.sol";
import {ERC1155EscrowObligation} from "@src/obligations/ERC1155EscrowObligation.sol";
import {ERC1155PaymentObligation} from "@src/obligations/ERC1155PaymentObligation.sol";
import {TokenBundleEscrowObligation} from "@src/obligations/TokenBundleEscrowObligation.sol";
import {TokenBundlePaymentObligation} from "@src/obligations/TokenBundlePaymentObligation.sol";
import {ERC1155BarterCrossToken} from "@src/utils/ERC1155BarterCrossToken.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract MockERC721 is ERC721 {
    uint256 private _currentTokenId = 0;

    constructor() ERC721("Mock ERC721", "MERC721") {}

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
    MockERC721 public erc721Token;
    MockERC1155 public erc1155TokenA;
    MockERC1155 public erc1155TokenB;

    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    uint256 internal constant ALICE_PRIVATE_KEY = 0xa11ce;
    uint256 internal constant BOB_PRIVATE_KEY = 0xb0b;

    address public alice;
    address public bob;

    uint256 public erc1155TokenAId = 1;
    uint256 public erc1155TokenAAmount = 100;
    uint256 public erc1155TokenBId = 2;
    uint256 public erc1155TokenBAmount = 50;
    uint256 public erc20Amount = 500 * 10 ** 18;
    uint256 public erc721TokenId;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        // Deploy mock tokens
        erc20Token = new MockERC20("Test Token", "TEST");
        erc721Token = new MockERC721();
        erc1155TokenA = new MockERC1155();
        erc1155TokenB = new MockERC1155();

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
        erc721TokenId = erc721Token.mint(bob); // Bob has an ERC721 token

        erc1155TokenA.mint(alice, erc1155TokenAId, erc1155TokenAAmount); // Alice has erc1155TokenA
        erc1155TokenB.mint(bob, erc1155TokenBId, erc1155TokenBAmount); // Bob has erc1155TokenB
    }

    // ERC1155 for ERC20 tests
    function testBuyErc20WithErc1155() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc1155TokenA.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = barterCross.buyErc20WithErc1155(
            address(erc1155TokenA),
            erc1155TokenAId,
            erc1155TokenAAmount,
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

        assertEq(
            escrowData.token,
            address(erc1155TokenA),
            "Token should match"
        );
        assertEq(escrowData.tokenId, erc1155TokenAId, "TokenId should match");
        assertEq(escrowData.amount, erc1155TokenAAmount, "Amount should match");
        assertEq(
            escrowData.arbiter,
            address(erc20Payment),
            "Arbiter should be erc20Payment"
        );

        // Extract the demand data
        ERC20PaymentObligation.StatementData memory demandData = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.StatementData)
        );

        assertEq(
            demandData.token,
            address(erc20Token),
            "ERC20 token should match"
        );
        assertEq(demandData.amount, erc20Amount, "ERC20 amount should match");
        assertEq(demandData.payee, alice, "Payee should be Alice");

        // Verify that Alice's tokens are now escrowed
        assertEq(
            erc1155TokenA.balanceOf(address(erc1155Escrow), erc1155TokenAId),
            erc1155TokenAAmount,
            "Tokens should be in escrow"
        );
        assertEq(
            erc1155TokenA.balanceOf(alice, erc1155TokenAId),
            0,
            "Alice should have no tokens left"
        );
    }

    function testPayErc1155ForErc20() public {
        // First create a bid from Alice
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc1155TokenA.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = barterCross.buyErc20WithErc1155(
            address(erc1155TokenA),
            erc1155TokenAId,
            erc1155TokenAAmount,
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
            erc1155TokenA.balanceOf(bob, erc1155TokenAId),
            erc1155TokenAAmount,
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
            erc1155TokenA.balanceOf(address(erc1155Escrow), erc1155TokenAId),
            0,
            "Escrow should have released tokens"
        );
    }

    // ERC1155 for ERC721 tests
    function testBuyErc721WithErc1155() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc1155TokenA.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = barterCross.buyErc721WithErc1155(
            address(erc1155TokenA),
            erc1155TokenAId,
            erc1155TokenAAmount,
            address(erc721Token),
            erc721TokenId,
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

        assertEq(
            escrowData.token,
            address(erc1155TokenA),
            "Token should match"
        );
        assertEq(escrowData.tokenId, erc1155TokenAId, "TokenId should match");
        assertEq(escrowData.amount, erc1155TokenAAmount, "Amount should match");
        assertEq(
            escrowData.arbiter,
            address(erc721Payment),
            "Arbiter should be erc721Payment"
        );

        // Extract the demand data
        ERC721PaymentObligation.StatementData memory demandData = abi.decode(
            escrowData.demand,
            (ERC721PaymentObligation.StatementData)
        );

        assertEq(
            demandData.token,
            address(erc721Token),
            "ERC721 token should match"
        );
        assertEq(demandData.tokenId, erc721TokenId, "ERC721 ID should match");
        assertEq(demandData.payee, alice, "Payee should be Alice");

        // Verify that Alice's tokens are now escrowed
        assertEq(
            erc1155TokenA.balanceOf(address(erc1155Escrow), erc1155TokenAId),
            erc1155TokenAAmount,
            "Tokens should be in escrow"
        );
        assertEq(
            erc1155TokenA.balanceOf(alice, erc1155TokenAId),
            0,
            "Alice should have no tokens left"
        );
    }

    function testPayErc1155ForErc721() public {
        // First create a bid from Alice
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc1155TokenA.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = barterCross.buyErc721WithErc1155(
            address(erc1155TokenA),
            erc1155TokenAId,
            erc1155TokenAAmount,
            address(erc721Token),
            erc721TokenId,
            expiration
        );
        vm.stopPrank();

        // Bob fulfills Alice's bid
        vm.startPrank(bob);
        erc721Token.approve(address(erc721Payment), erc721TokenId);
        bytes32 payAttestation = barterCross.payErc1155ForErc721(
            buyAttestation
        );
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(
            erc1155TokenA.balanceOf(bob, erc1155TokenAId),
            erc1155TokenAAmount,
            "Bob should now have Alice's tokens"
        );
        assertEq(
            erc721Token.ownerOf(erc721TokenId),
            alice,
            "Alice should now own the ERC721"
        );
        assertEq(
            erc1155TokenA.balanceOf(address(erc1155Escrow), erc1155TokenAId),
            0,
            "Escrow should have released tokens"
        );
    }

    // ERC1155 for Bundle tests
    function testBuyBundleWithErc1155() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Create bundle data
        TokenBundlePaymentObligation.StatementData
            memory bundleData = TokenBundlePaymentObligation.StatementData({
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
        bundleData.erc721Tokens[0] = address(erc721Token);
        bundleData.erc721TokenIds[0] = erc721TokenId;
        bundleData.erc1155Tokens[0] = address(erc1155TokenB);
        bundleData.erc1155TokenIds[0] = erc1155TokenBId;
        bundleData.erc1155Amounts[0] = erc1155TokenBAmount / 2;

        vm.startPrank(alice);
        erc1155TokenA.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = barterCross.buyBundleWithErc1155(
            address(erc1155TokenA),
            erc1155TokenAId,
            erc1155TokenAAmount,
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

        assertEq(
            escrowData.token,
            address(erc1155TokenA),
            "Token should match"
        );
        assertEq(escrowData.tokenId, erc1155TokenAId, "TokenId should match");
        assertEq(escrowData.amount, erc1155TokenAAmount, "Amount should match");
        assertEq(
            escrowData.arbiter,
            address(bundlePayment),
            "Arbiter should be bundlePayment"
        );

        // Extract the demand data - we'll just verify it's correctly decodable
        TokenBundlePaymentObligation.StatementData memory demandData = abi
            .decode(
                escrowData.demand,
                (TokenBundlePaymentObligation.StatementData)
            );

        assertEq(demandData.payee, alice, "Payee should be Alice");
        assertEq(
            demandData.erc20Tokens[0],
            address(erc20Token),
            "ERC20 token should match"
        );
        assertEq(
            demandData.erc721Tokens[0],
            address(erc721Token),
            "ERC721 token should match"
        );
        assertEq(
            demandData.erc1155Tokens[0],
            address(erc1155TokenB),
            "ERC1155 token should match"
        );

        // Verify that Alice's tokens are now escrowed
        assertEq(
            erc1155TokenA.balanceOf(address(erc1155Escrow), erc1155TokenAId),
            erc1155TokenAAmount,
            "Tokens should be in escrow"
        );
        assertEq(
            erc1155TokenA.balanceOf(alice, erc1155TokenAId),
            0,
            "Alice should have no tokens left"
        );
    }

    function testPayErc1155ForBundle() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Create bundle data
        TokenBundlePaymentObligation.StatementData
            memory bundleData = TokenBundlePaymentObligation.StatementData({
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
        bundleData.erc721Tokens[0] = address(erc721Token);
        bundleData.erc721TokenIds[0] = erc721TokenId;
        bundleData.erc1155Tokens[0] = address(erc1155TokenB);
        bundleData.erc1155TokenIds[0] = erc1155TokenBId;
        bundleData.erc1155Amounts[0] = erc1155TokenBAmount / 2;

        vm.startPrank(alice);
        erc1155TokenA.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = barterCross.buyBundleWithErc1155(
            address(erc1155TokenA),
            erc1155TokenAId,
            erc1155TokenAAmount,
            bundleData,
            expiration
        );
        vm.stopPrank();

        // Bob approves and fulfills
        vm.startPrank(bob);
        erc20Token.approve(address(bundlePayment), erc20Amount / 2);
        erc721Token.approve(address(bundlePayment), erc721TokenId);
        erc1155TokenB.setApprovalForAll(address(bundlePayment), true);
        bytes32 payAttestation = barterCross.payErc1155ForBundle(
            buyAttestation
        );
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(
            erc1155TokenA.balanceOf(bob, erc1155TokenAId),
            erc1155TokenAAmount,
            "Bob should now have Alice's tokens"
        );
        assertEq(
            erc20Token.balanceOf(alice),
            erc20Amount / 2,
            "Alice should receive ERC20 tokens"
        );
        assertEq(
            erc721Token.ownerOf(erc721TokenId),
            alice,
            "Alice should receive Bob's ERC721 token"
        );
        assertEq(
            erc1155TokenB.balanceOf(alice, erc1155TokenBId),
            erc1155TokenBAmount / 2,
            "Alice should receive ERC1155 tokens"
        );
        assertEq(
            erc1155TokenA.balanceOf(address(erc1155Escrow), erc1155TokenAId),
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
            address(erc1155TokenA),
            erc1155TokenAId,
            erc1155TokenAAmount,
            address(erc20Token),
            erc20Amount,
            expiration
        );
        vm.stopPrank();
    }

    function test_RevertWhen_InsufficientBalance() public {
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 tooManyTokens = erc1155TokenAAmount * 2; // More than Alice has

        vm.startPrank(alice);
        erc1155TokenA.setApprovalForAll(address(erc1155Escrow), true);
        vm.expectRevert(); // ERC1155: insufficient balance for transfer
        barterCross.buyErc20WithErc1155(
            address(erc1155TokenA),
            erc1155TokenAId,
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
        erc1155TokenA.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = barterCross.buyErc20WithErc1155(
            address(erc1155TokenA),
            erc1155TokenAId,
            erc1155TokenAAmount,
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
        erc1155TokenA.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = barterCross.buyErc20WithErc1155(
            address(erc1155TokenA),
            erc1155TokenAId,
            erc1155TokenAAmount,
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
