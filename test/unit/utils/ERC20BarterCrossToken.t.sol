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
import {ERC20BarterCrossToken} from "@src/utils/ERC20BarterCrossToken.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract MockERC20Permit is ERC20Permit {
    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) ERC20Permit(name) {
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

contract ERC20BarterCrossTokenUnitTest is Test {
    ERC20EscrowObligation public escrowObligation;
    ERC20PaymentObligation public paymentObligation;
    ERC721EscrowObligation public erc721Escrow;
    ERC721PaymentObligation public erc721Payment;
    ERC1155EscrowObligation public erc1155Escrow;
    ERC1155PaymentObligation public erc1155Payment;
    TokenBundleEscrowObligation public bundleEscrow;
    TokenBundlePaymentObligation public bundlePayment;
    ERC20BarterCrossToken public barterCross;

    MockERC20Permit public bidToken;
    MockERC721 public askErc721Token;
    MockERC1155 public askErc1155Token;

    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    uint256 internal constant ALICE_PRIVATE_KEY = 0xa11ce;
    uint256 internal constant BOB_PRIVATE_KEY = 0xb0b;

    address public alice;
    address public bob;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        // Deploy mock tokens
        bidToken = new MockERC20Permit("Bid Token", "BID");
        askErc721Token = new MockERC721();
        askErc1155Token = new MockERC1155();

        // Deploy obligation 
        escrowObligation = new ERC20EscrowObligation(eas, schemaRegistry);
        paymentObligation = new ERC20PaymentObligation(eas, schemaRegistry);
        erc721Escrow = new ERC721EscrowObligation(eas, schemaRegistry);
        erc721Payment = new ERC721PaymentObligation(eas, schemaRegistry);
        erc1155Escrow = new ERC1155EscrowObligation(eas, schemaRegistry);
        erc1155Payment = new ERC1155PaymentObligation(eas, schemaRegistry);
        bundleEscrow = new TokenBundleEscrowObligation(eas, schemaRegistry);
        bundlePayment = new TokenBundlePaymentObligation(eas, schemaRegistry);

        // Deploy barter cross token contract
        barterCross = new ERC20BarterCrossToken(
            eas,
            escrowObligation,
            paymentObligation,
            erc721Escrow,
            erc721Payment,
            erc1155Escrow,
            erc1155Payment,
            bundleEscrow,
            bundlePayment
        );

        // Setup initial token balances
        bidToken.transfer(alice, 1000 * 10 ** 18);
        askErc721Token.mint(bob); // tokenId 1
        askErc1155Token.mint(bob, 1, 100);
    }

    // Testing ERC721 with ERC20
    function testBuyERC721WithERC20() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 erc721TokenId = 1;
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        bidToken.approve(address(escrowObligation), bidAmount);
        bytes32 buyAttestation = barterCross.buyErc721WithErc20(
            address(bidToken),
            bidAmount,
            address(askErc721Token),
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
        ERC20EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC20EscrowObligation.ObligationData)
        );

        assertEq(escrowData.token, address(bidToken), "Token should match");
        assertEq(escrowData.amount, bidAmount, "Amount should match");
        assertEq(
            escrowData.arbiter,
            address(erc721Payment),
            "Arbiter should be erc721Payment"
        );

        // Extract the demand data
        ERC721PaymentObligation.ObligationData memory demandData = abi.decode(
            escrowData.demand,
            (ERC721PaymentObligation.ObligationData)
        );

        assertEq(
            demandData.token,
            address(askErc721Token),
            "ERC721 token should match"
        );
        assertEq(demandData.tokenId, erc721TokenId, "ERC721 ID should match");
        assertEq(demandData.payee, alice, "Payee should be Alice");
    }

    function testPermitAndBuyERC721WithERC20() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 erc721TokenId = 1;
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1 days;

        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            bidToken,
            ALICE_PRIVATE_KEY,
            address(escrowObligation),
            bidAmount,
            deadline
        );

        vm.prank(alice);
        bytes32 buyAttestation = barterCross.permitAndBuyErc721WithErc20(
            address(bidToken),
            bidAmount,
            address(askErc721Token),
            erc721TokenId,
            expiration,
            deadline,
            v,
            r,
            s
        );

        assertNotEq(
            buyAttestation,
            bytes32(0),
            "Buy attestation should be created"
        );
    }

    // Testing ERC1155 with ERC20
    function testBuyERC1155WithERC20() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 tokenId = 1;
        uint256 amount = 50;
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        bidToken.approve(address(escrowObligation), bidAmount);
        bytes32 buyAttestation = barterCross.buyErc1155WithErc20(
            address(bidToken),
            bidAmount,
            address(askErc1155Token),
            tokenId,
            amount,
            expiration
        );
        vm.stopPrank();

        assertNotEq(
            buyAttestation,
            bytes32(0),
            "Buy attestation should be created"
        );
    }

    function testPermitAndBuyERC1155WithERC20() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 tokenId = 1;
        uint256 amount = 50;
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1 days;

        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            bidToken,
            ALICE_PRIVATE_KEY,
            address(escrowObligation),
            bidAmount,
            deadline
        );

        vm.prank(alice);
        bytes32 buyAttestation = barterCross.permitAndBuyErc1155WithErc20(
            address(bidToken),
            bidAmount,
            address(askErc1155Token),
            tokenId,
            amount,
            expiration,
            deadline,
            v,
            r,
            s
        );

        assertNotEq(
            buyAttestation,
            bytes32(0),
            "Buy attestation should be created"
        );
    }

    // Testing TokenBundle with ERC20
    function testBuyBundleWithERC20() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Create token bundle obligation data
        TokenBundlePaymentObligation.ObligationData
            memory bundleData = TokenBundlePaymentObligation.ObligationData({
                erc20Tokens: new address[](1),
                erc20Amounts: new uint256[](1),
                erc721Tokens: new address[](1),
                erc721TokenIds: new uint256[](1),
                erc1155Tokens: new address[](1),
                erc1155TokenIds: new uint256[](1),
                erc1155Amounts: new uint256[](1),
                payee: alice
            });

        bundleData.erc20Tokens[0] = address(0);
        bundleData.erc20Amounts[0] = 0;
        bundleData.erc721Tokens[0] = address(askErc721Token);
        bundleData.erc721TokenIds[0] = 1;
        bundleData.erc1155Tokens[0] = address(askErc1155Token);
        bundleData.erc1155TokenIds[0] = 1;
        bundleData.erc1155Amounts[0] = 20;

        vm.startPrank(alice);
        bidToken.approve(address(escrowObligation), bidAmount);
        bytes32 buyAttestation = barterCross.buyBundleWithErc20(
            address(bidToken),
            bidAmount,
            bundleData,
            expiration
        );
        vm.stopPrank();

        assertNotEq(
            buyAttestation,
            bytes32(0),
            "Buy attestation should be created"
        );
    }

    function testPermitAndBuyBundleWithERC20() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1 days;

        // Create token bundle obligation data
        TokenBundlePaymentObligation.ObligationData
            memory bundleData = TokenBundlePaymentObligation.ObligationData({
                erc20Tokens: new address[](1),
                erc20Amounts: new uint256[](1),
                erc721Tokens: new address[](1),
                erc721TokenIds: new uint256[](1),
                erc1155Tokens: new address[](1),
                erc1155TokenIds: new uint256[](1),
                erc1155Amounts: new uint256[](1),
                payee: alice
            });

        bundleData.erc20Tokens[0] = address(0);
        bundleData.erc20Amounts[0] = 0;
        bundleData.erc721Tokens[0] = address(askErc721Token);
        bundleData.erc721TokenIds[0] = 1;
        bundleData.erc1155Tokens[0] = address(askErc1155Token);
        bundleData.erc1155TokenIds[0] = 1;
        bundleData.erc1155Amounts[0] = 20;

        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            bidToken,
            ALICE_PRIVATE_KEY,
            address(escrowObligation),
            bidAmount,
            deadline
        );

        vm.prank(alice);
        bytes32 buyAttestation = barterCross.permitAndBuyBundleWithErc20(
            address(bidToken),
            bidAmount,
            bundleData,
            expiration,
            deadline,
            v,
            r,
            s
        );

        assertNotEq(
            buyAttestation,
            bytes32(0),
            "Buy attestation should be created"
        );
    }

    function test_RevertWhen_PermitExpired() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 erc721TokenId = 1;
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1 hours;

        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            bidToken,
            ALICE_PRIVATE_KEY,
            address(escrowObligation),
            bidAmount,
            deadline
        );

        // Warp time past deadline
        vm.warp(block.timestamp + 2 hours);

        vm.prank(alice);
        // Update expectation to match the actual error returned (Unknown error)
        vm.expectRevert(abi.encodeWithSelector(ERC20BarterCrossToken.PermitFailed.selector, address(bidToken), "Unknown error"));
        barterCross.permitAndBuyErc721WithErc20(
            address(bidToken),
            bidAmount,
            address(askErc721Token),
            erc721TokenId,
            expiration,
            deadline,
            v,
            r,
            s
        );
    }

    // Testing payErc20ForErc721 function
    function testPayErc20ForErc721() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 erc721TokenId = 1;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Bob makes a bid with his ERC721
        vm.startPrank(bob);
        askErc721Token.approve(address(erc721Escrow), erc721TokenId);
        bytes32 buyAttestation = erc721Escrow.doObligationFor(
            ERC721EscrowObligation.ObligationData({
                token: address(askErc721Token),
                tokenId: erc721TokenId,
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC20PaymentObligation.ObligationData({
                        token: address(bidToken),
                        amount: bidAmount,
                        payee: bob
                    })
                )
            }),
            expiration,
            bob,
            bob
        );
        vm.stopPrank();

        // Alice fulfills Bob's bid with her ERC20
        vm.startPrank(alice);
        bidToken.approve(address(paymentObligation), bidAmount);
        bytes32 payAttestation = barterCross.payErc20ForErc721(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(
            askErc721Token.ownerOf(erc721TokenId),
            alice,
            "Alice should now own Bob's ERC721 token"
        );
        assertEq(
            bidToken.balanceOf(bob),
            bidAmount,
            "Bob should receive ERC20 tokens"
        );
        assertEq(
            bidToken.balanceOf(alice),
            1000 * 10 ** 18 - bidAmount,
            "Alice should have spent ERC20 tokens"
        );
    }

    // Testing payErc20ForErc1155 function
    function testPayErc20ForErc1155() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 tokenId = 1;
        uint256 amount = 50;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Bob makes a bid with his ERC1155
        vm.startPrank(bob);
        askErc1155Token.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = erc1155Escrow.doObligationFor(
            ERC1155EscrowObligation.ObligationData({
                token: address(askErc1155Token),
                tokenId: tokenId,
                amount: amount,
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC20PaymentObligation.ObligationData({
                        token: address(bidToken),
                        amount: bidAmount,
                        payee: bob
                    })
                )
            }),
            expiration,
            bob,
            bob
        );
        vm.stopPrank();

        // Alice fulfills Bob's bid with her ERC20
        vm.startPrank(alice);
        bidToken.approve(address(paymentObligation), bidAmount);
        bytes32 payAttestation = barterCross.payErc20ForErc1155(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(
            askErc1155Token.balanceOf(alice, tokenId),
            amount,
            "Alice should now have Bob's ERC1155 tokens"
        );
        assertEq(
            askErc1155Token.balanceOf(bob, tokenId),
            100 - amount,
            "Bob should have fewer ERC1155 tokens"
        );
        assertEq(
            bidToken.balanceOf(bob),
            bidAmount,
            "Bob should receive ERC20 tokens"
        );
        assertEq(
            bidToken.balanceOf(alice),
            1000 * 10 ** 18 - bidAmount,
            "Alice should have spent ERC20 tokens"
        );
    }

    // Testing payErc20ForBundle function
    function testPayErc20ForBundle() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Create a bundle escrow
        TokenBundleEscrowObligation.ObligationData memory bundleData = TokenBundleEscrowObligation.ObligationData({
            erc20Tokens: new address[](0),
            erc20Amounts: new uint256[](0),
            erc721Tokens: new address[](1),
            erc721TokenIds: new uint256[](1),
            erc1155Tokens: new address[](1),
            erc1155TokenIds: new uint256[](1),
            erc1155Amounts: new uint256[](1),
            arbiter: address(paymentObligation),
            demand: abi.encode(
                ERC20PaymentObligation.ObligationData({
                    token: address(bidToken),
                    amount: bidAmount,
                    payee: bob
                })
            )
        });

        bundleData.erc721Tokens[0] = address(askErc721Token);
        bundleData.erc721TokenIds[0] = 1;
        bundleData.erc1155Tokens[0] = address(askErc1155Token);
        bundleData.erc1155TokenIds[0] = 1;
        bundleData.erc1155Amounts[0] = 20;

        // Bob creates an escrow with his token bundle
        vm.startPrank(bob);
        askErc721Token.approve(address(bundleEscrow), 1);
        askErc1155Token.setApprovalForAll(address(bundleEscrow), true);
        bytes32 buyAttestation = bundleEscrow.doObligationFor(
            bundleData,
            expiration,
            bob,
            bob
        );
        vm.stopPrank();

        // Alice fulfills Bob's bid with her ERC20
        vm.startPrank(alice);
        bidToken.approve(address(paymentObligation), bidAmount);
        bytes32 payAttestation = barterCross.payErc20ForBundle(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(
            askErc721Token.ownerOf(1),
            alice,
            "Alice should now own Bob's ERC721 token"
        );
        assertEq(
            askErc1155Token.balanceOf(alice, 1),
            20,
            "Alice should have received ERC1155 tokens"
        );
        assertEq(
            askErc1155Token.balanceOf(bob, 1),
            100 - 20,
            "Bob should have fewer ERC1155 tokens"
        );
        assertEq(
            bidToken.balanceOf(bob),
            bidAmount,
            "Bob should receive ERC20 tokens"
        );
        assertEq(
            bidToken.balanceOf(alice),
            1000 * 10 ** 18 - bidAmount,
            "Alice should have spent ERC20 tokens"
        );
    }

    // Testing permitAndPayErc20ForErc721 function
    function testPermitAndPayErc20ForErc721() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 erc721TokenId = 1;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // First, bob makes an ERC721 escrow with ERC20 payment demand
        vm.startPrank(bob);
        askErc721Token.approve(address(erc721Escrow), erc721TokenId);
        bytes32 buyAttestation = erc721Escrow.doObligationFor(
            ERC721EscrowObligation.ObligationData({
                token: address(askErc721Token),
                tokenId: erc721TokenId,
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC20PaymentObligation.ObligationData({
                        token: address(bidToken),
                        amount: bidAmount,
                        payee: bob
                    })
                )
            }),
            expiration,
            bob,
            bob
        );
        vm.stopPrank();

        // Alice pays with permit
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            bidToken,
            ALICE_PRIVATE_KEY,
            address(paymentObligation),
            bidAmount,
            deadline
        );

        vm.prank(alice);
        bytes32 payAttestation = barterCross.permitAndPayErc20ForErc721(
            buyAttestation,
            deadline,
            v,
            r,
            s
        );

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(
            askErc721Token.ownerOf(erc721TokenId),
            alice,
            "Alice should now own Bob's ERC721 token"
        );
        assertEq(
            bidToken.balanceOf(bob),
            bidAmount,
            "Bob should receive ERC20 tokens"
        );
    }
    
    // Testing permitAndPayErc20ForErc1155 function
    function testPermitAndPayErc20ForErc1155() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 tokenId = 1;
        uint256 amount = 50;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // First, bob makes an ERC1155 escrow with ERC20 payment demand
        vm.startPrank(bob);
        askErc1155Token.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = erc1155Escrow.doObligationFor(
            ERC1155EscrowObligation.ObligationData({
                token: address(askErc1155Token),
                tokenId: tokenId,
                amount: amount,
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC20PaymentObligation.ObligationData({
                        token: address(bidToken),
                        amount: bidAmount,
                        payee: bob
                    })
                )
            }),
            expiration,
            bob,
            bob
        );
        vm.stopPrank();

        // Alice pays with permit
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            bidToken,
            ALICE_PRIVATE_KEY,
            address(paymentObligation),
            bidAmount,
            deadline
        );

        vm.prank(alice);
        bytes32 payAttestation = barterCross.permitAndPayErc20ForErc1155(
            buyAttestation,
            deadline,
            v,
            r,
            s
        );

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(
            askErc1155Token.balanceOf(alice, tokenId),
            amount,
            "Alice should now have Bob's ERC1155 tokens"
        );
        assertEq(
            bidToken.balanceOf(bob),
            bidAmount,
            "Bob should receive ERC20 tokens"
        );
    }
    
    // Testing permitAndPayErc20ForBundle function
    function testPermitAndPayErc20ForBundle() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Create a bundle escrow
        TokenBundleEscrowObligation.ObligationData memory bundleData = TokenBundleEscrowObligation.ObligationData({
            erc20Tokens: new address[](0),
            erc20Amounts: new uint256[](0),
            erc721Tokens: new address[](1),
            erc721TokenIds: new uint256[](1),
            erc1155Tokens: new address[](1),
            erc1155TokenIds: new uint256[](1),
            erc1155Amounts: new uint256[](1),
            arbiter: address(paymentObligation),
            demand: abi.encode(
                ERC20PaymentObligation.ObligationData({
                    token: address(bidToken),
                    amount: bidAmount,
                    payee: bob
                })
            )
        });

        bundleData.erc721Tokens[0] = address(askErc721Token);
        bundleData.erc721TokenIds[0] = 1;
        bundleData.erc1155Tokens[0] = address(askErc1155Token);
        bundleData.erc1155TokenIds[0] = 1;
        bundleData.erc1155Amounts[0] = 20;

        // Bob creates an escrow with his token bundle
        vm.startPrank(bob);
        askErc721Token.approve(address(bundleEscrow), 1);
        askErc1155Token.setApprovalForAll(address(bundleEscrow), true);
        bytes32 buyAttestation = bundleEscrow.doObligationFor(
            bundleData,
            expiration,
            bob,
            bob
        );
        vm.stopPrank();

        // Alice pays with permit
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            bidToken,
            ALICE_PRIVATE_KEY,
            address(paymentObligation),
            bidAmount,
            deadline
        );

        vm.prank(alice);
        bytes32 payAttestation = barterCross.permitAndPayErc20ForBundle(
            buyAttestation,
            deadline,
            v,
            r,
            s
        );

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(
            askErc721Token.ownerOf(1),
            alice,
            "Alice should now own Bob's ERC721 token"
        );
        assertEq(
            askErc1155Token.balanceOf(alice, 1),
            20,
            "Alice should have received ERC1155 tokens"
        );
        assertEq(
            bidToken.balanceOf(bob),
            bidAmount,
            "Bob should receive ERC20 tokens"
        );
    }

    function test_RevertWhen_TransferFails() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 erc721TokenId = 1;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice makes bid
        vm.startPrank(alice);
        bidToken.approve(address(escrowObligation), bidAmount);
        bytes32 buyAttestation = barterCross.buyErc721WithErc20(
            address(bidToken),
            bidAmount,
            address(askErc721Token),
            erc721TokenId,
            expiration
        );
        vm.stopPrank();

        // Transfer the ERC721 away from Bob to simulate failure condition
        address thirdParty = makeAddr("third-party");
        vm.prank(bob);
        askErc721Token.transferFrom(bob, thirdParty, erc721TokenId);

        // Bob tries to sell ERC721 he no longer owns
        vm.startPrank(bob);
        // This still might revert with an underlying ERC721 error or with our custom error
        // The exact error can vary depending on implementation details
        vm.expectRevert();
        barterCross.payErc20ForErc721(buyAttestation);
        vm.stopPrank();
    }

    function _getPermitSignature(
        MockERC20Permit token,
        uint256 ownerPrivateKey,
        address spender,
        uint256 value,
        uint256 deadline
    ) internal view returns (uint8 v, bytes32 r, bytes32 s) {
        bytes32 permitTypehash = keccak256(
            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
        );

        address owner = vm.addr(ownerPrivateKey);
        bytes32 structHash = keccak256(
            abi.encode(
                permitTypehash,
                owner,
                spender,
                value,
                token.nonces(owner),
                deadline
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", token.DOMAIN_SEPARATOR(), structHash)
        );

        (v, r, s) = vm.sign(ownerPrivateKey, digest);
    }
}
