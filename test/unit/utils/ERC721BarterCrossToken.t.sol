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
import {ERC721BarterCrossToken} from "@src/utils/ERC721BarterCrossToken.sol";
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
    MockERC721 public erc721TokenA;
    MockERC721 public erc721TokenB;
    MockERC1155 public erc1155Token;

    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    uint256 internal constant ALICE_PRIVATE_KEY = 0xa11ce;
    uint256 internal constant BOB_PRIVATE_KEY = 0xb0b;

    address public alice;
    address public bob;

    uint256 public aliceErc721Id;
    uint256 public bobErc721Id;
    uint256 public erc1155TokenId = 1;
    uint256 public erc1155TokenAmount = 100;
    uint256 public erc20Amount = 500 * 10 ** 18;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        // Deploy mock tokens
        erc20Token = new MockERC20("Test Token", "TEST");
        erc721TokenA = new MockERC721();
        erc721TokenB = new MockERC721();
        erc1155Token = new MockERC1155();

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
        aliceErc721Id = erc721TokenA.mint(alice); // Alice has erc721TokenA

        vm.prank(bob);
        bobErc721Id = erc721TokenB.mint(bob); // Bob has erc721TokenB

        erc1155Token.mint(bob, erc1155TokenId, erc1155TokenAmount); // Bob has erc1155Token
    }

    // ERC721 for ERC20 tests
    function testBuyErc20WithErc721() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc721TokenA.approve(address(erc721Escrow), aliceErc721Id);
        bytes32 buyAttestation = barterCross.buyErc20WithErc721(
            address(erc721TokenA),
            aliceErc721Id,
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

        assertEq(escrowData.token, address(erc721TokenA), "Token should match");
        assertEq(escrowData.tokenId, aliceErc721Id, "TokenId should match");
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

        // Verify that Alice's ERC721 token is now escrowed
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            address(erc721Escrow),
            "ERC721 should be in escrow"
        );
    }

    function testPayErc721ForErc20() public {
        // First create a bid from Bob for ERC721 tokens, offering ERC20
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(bob);
        erc20Token.approve(address(erc20Escrow), erc20Amount);
        bytes32 buyAttestation = erc20Escrow.doObligationFor(
            ERC20EscrowObligation.StatementData({
                token: address(erc20Token),
                amount: erc20Amount,
                arbiter: address(erc721Payment),
                demand: abi.encode(
                    ERC721PaymentObligation.StatementData({
                        token: address(erc721TokenA),
                        tokenId: aliceErc721Id,
                        payee: bob
                    })
                )
            }),
            expiration,
            bob,
            bob
        );
        vm.stopPrank();

        // Alice fulfills Bob's bid
        vm.startPrank(alice);
        erc721TokenA.approve(address(erc721Payment), aliceErc721Id);
        bytes32 payAttestation = barterCross.payErc721ForErc20(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            bob,
            "Bob should now own Alice's ERC721 token"
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
    }

    // ERC721 for ERC1155 tests
    function testBuyErc1155WithErc721() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc721TokenA.approve(address(erc721Escrow), aliceErc721Id);
        bytes32 buyAttestation = barterCross.buyErc1155WithErc721(
            address(erc721TokenA),
            aliceErc721Id,
            address(erc1155Token),
            erc1155TokenId,
            erc1155TokenAmount,
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

        assertEq(escrowData.token, address(erc721TokenA), "Token should match");
        assertEq(escrowData.tokenId, aliceErc721Id, "TokenId should match");
        assertEq(
            escrowData.arbiter,
            address(erc1155Payment),
            "Arbiter should be erc1155Payment"
        );

        // Extract the demand data
        ERC1155PaymentObligation.StatementData memory demandData = abi.decode(
            escrowData.demand,
            (ERC1155PaymentObligation.StatementData)
        );

        assertEq(
            demandData.token,
            address(erc1155Token),
            "ERC1155 token should match"
        );
        assertEq(
            demandData.tokenId,
            erc1155TokenId,
            "ERC1155 tokenId should match"
        );
        assertEq(
            demandData.amount,
            erc1155TokenAmount,
            "ERC1155 amount should match"
        );
        assertEq(demandData.payee, alice, "Payee should be Alice");

        // Verify that Alice's ERC721 token is now escrowed
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            address(erc721Escrow),
            "ERC721 should be in escrow"
        );
    }

    function testPayErc721ForErc1155() public {
        // First create a bid from Bob, offering ERC1155 for ERC721
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(bob);
        erc1155Token.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = erc1155Escrow.doObligationFor(
            ERC1155EscrowObligation.StatementData({
                token: address(erc1155Token),
                tokenId: erc1155TokenId,
                amount: erc1155TokenAmount,
                arbiter: address(erc721Payment),
                demand: abi.encode(
                    ERC721PaymentObligation.StatementData({
                        token: address(erc721TokenA),
                        tokenId: aliceErc721Id,
                        payee: bob
                    })
                )
            }),
            expiration,
            bob,
            bob
        );
        vm.stopPrank();

        // Alice fulfills Bob's bid
        vm.startPrank(alice);
        erc721TokenA.approve(address(erc721Payment), aliceErc721Id);
        bytes32 payAttestation = barterCross.payErc721ForErc1155(
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
            erc721TokenA.ownerOf(aliceErc721Id),
            bob,
            "Bob should now own Alice's ERC721 token"
        );
        assertEq(
            erc1155Token.balanceOf(alice, erc1155TokenId),
            erc1155TokenAmount,
            "Alice should receive ERC1155 tokens"
        );
        assertEq(
            erc1155Token.balanceOf(bob, erc1155TokenId),
            0,
            "Bob should have no ERC1155 tokens left"
        );
    }

    // ERC721 for Token Bundle tests
    function testBuyBundleWithErc721() public {
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
        bundleData.erc721Tokens[0] = address(erc721TokenB);
        bundleData.erc721TokenIds[0] = bobErc721Id;
        bundleData.erc1155Tokens[0] = address(erc1155Token);
        bundleData.erc1155TokenIds[0] = erc1155TokenId;
        bundleData.erc1155Amounts[0] = erc1155TokenAmount / 2;

        vm.startPrank(alice);
        erc721TokenA.approve(address(erc721Escrow), aliceErc721Id);
        bytes32 buyAttestation = barterCross.buyBundleWithErc721(
            address(erc721TokenA),
            aliceErc721Id,
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

        assertEq(escrowData.token, address(erc721TokenA), "Token should match");
        assertEq(escrowData.tokenId, aliceErc721Id, "TokenId should match");
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
            address(erc721TokenB),
            "ERC721 token should match"
        );
        assertEq(
            demandData.erc1155Tokens[0],
            address(erc1155Token),
            "ERC1155 token should match"
        );

        // Verify that Alice's ERC721 token is now escrowed
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            address(erc721Escrow),
            "ERC721 should be in escrow"
        );
    }

    function testPayErc721ForBundle() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Create bundle data for Bob to escrow
        TokenBundleEscrowObligation.StatementData
            memory bundleData = TokenBundleEscrowObligation.StatementData({
                erc20Tokens: new address[](1),
                erc20Amounts: new uint256[](1),
                erc721Tokens: new address[](1),
                erc721TokenIds: new uint256[](1),
                erc1155Tokens: new address[](1),
                erc1155TokenIds: new uint256[](1),
                erc1155Amounts: new uint256[](1),
                arbiter: address(erc721Payment),
                demand: abi.encode(
                    ERC721PaymentObligation.StatementData({
                        token: address(erc721TokenA),
                        tokenId: aliceErc721Id,
                        payee: bob
                    })
                )
            });

        bundleData.erc20Tokens[0] = address(erc20Token);
        bundleData.erc20Amounts[0] = erc20Amount / 2;
        bundleData.erc721Tokens[0] = address(erc721TokenB);
        bundleData.erc721TokenIds[0] = bobErc721Id;
        bundleData.erc1155Tokens[0] = address(erc1155Token);
        bundleData.erc1155TokenIds[0] = erc1155TokenId;
        bundleData.erc1155Amounts[0] = erc1155TokenAmount / 2;

        vm.startPrank(bob);
        erc20Token.approve(address(bundleEscrow), erc20Amount / 2);
        erc721TokenB.approve(address(bundleEscrow), bobErc721Id);
        erc1155Token.setApprovalForAll(address(bundleEscrow), true);
        bytes32 buyAttestation = bundleEscrow.doObligationFor(
            bundleData,
            expiration,
            bob,
            bob
        );
        vm.stopPrank();

        // Alice fulfills with her ERC721
        vm.startPrank(alice);
        erc721TokenA.approve(address(erc721Payment), aliceErc721Id);
        bytes32 payAttestation = barterCross.payErc721ForBundle(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            bob,
            "Bob should now own Alice's ERC721 token"
        );
        assertEq(
            erc20Token.balanceOf(alice),
            erc20Amount / 2,
            "Alice should receive ERC20 tokens"
        );
        assertEq(
            erc721TokenB.ownerOf(bobErc721Id),
            alice,
            "Alice should receive Bob's ERC721 token"
        );
        assertEq(
            erc1155Token.balanceOf(alice, erc1155TokenId),
            erc1155TokenAmount / 2,
            "Alice should receive ERC1155 tokens"
        );
    }

    // Error test cases
    function test_RevertWhen_TokenNotApproved() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice tries to make bid without approving ERC721 token
        vm.startPrank(alice);
        vm.expectRevert(); // ERC721: caller is not token owner or approved
        barterCross.buyErc20WithErc721(
            address(erc721TokenA),
            aliceErc721Id,
            address(erc20Token),
            erc20Amount,
            expiration
        );
        vm.stopPrank();
    }

    function test_RevertWhen_PaymentFails() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Bob makes bid with ERC20
        vm.startPrank(bob);
        erc20Token.approve(address(erc20Escrow), erc20Amount);
        bytes32 buyAttestation = erc20Escrow.doObligationFor(
            ERC20EscrowObligation.StatementData({
                token: address(erc20Token),
                amount: erc20Amount,
                arbiter: address(erc721Payment),
                demand: abi.encode(
                    ERC721PaymentObligation.StatementData({
                        token: address(erc721TokenA),
                        tokenId: aliceErc721Id,
                        payee: bob
                    })
                )
            }),
            expiration,
            bob,
            bob
        );
        vm.stopPrank();

        // Alice tries to fulfill without approving her ERC721 token
        vm.startPrank(alice);
        vm.expectRevert(); // ERC721: caller is not token owner or approved
        barterCross.payErc721ForErc20(buyAttestation);
        vm.stopPrank();
    }

    function test_RevertWhen_BidExpired() public {
        // Create a bid with short expiration
        uint64 expiration = uint64(block.timestamp + 10 minutes);

        // Bob makes bid with ERC20
        vm.startPrank(bob);
        erc20Token.approve(address(erc20Escrow), erc20Amount);
        bytes32 buyAttestation = erc20Escrow.doObligationFor(
            ERC20EscrowObligation.StatementData({
                token: address(erc20Token),
                amount: erc20Amount,
                arbiter: address(erc721Payment),
                demand: abi.encode(
                    ERC721PaymentObligation.StatementData({
                        token: address(erc721TokenA),
                        tokenId: aliceErc721Id,
                        payee: bob
                    })
                )
            }),
            expiration,
            bob,
            bob
        );
        vm.stopPrank();

        // Warp time past expiration
        vm.warp(block.timestamp + 20 minutes);

        // Alice tries to fulfill expired bid
        vm.startPrank(alice);
        erc721TokenA.approve(address(erc721Payment), aliceErc721Id);
        vm.expectRevert();
        barterCross.payErc721ForErc20(buyAttestation);
        vm.stopPrank();
    }
}
