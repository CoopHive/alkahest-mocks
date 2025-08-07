// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC1155EscrowObligation} from "@src/obligations/ERC1155EscrowObligation.sol";
import {ERC1155PaymentObligation} from "@src/obligations/ERC1155PaymentObligation.sol";
import {ERC1155BarterUtils} from "@src/utils/ERC1155BarterUtils.sol";
import {ERC20EscrowObligation} from "@src/obligations/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "@src/obligations/ERC20PaymentObligation.sol";
import {ERC721EscrowObligation} from "@src/obligations/ERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "@src/obligations/ERC721PaymentObligation.sol";
import {TokenBundleEscrowObligation2} from "@src/obligations/TokenBundleEscrowObligation2.sol";
import {TokenBundlePaymentObligation2} from "@src/obligations/TokenBundlePaymentObligation2.sol";
import {NativeTokenEscrowObligation} from "@src/obligations/NativeTokenEscrowObligation.sol";
import {NativeTokenPaymentObligation} from "@src/obligations/NativeTokenPaymentObligation.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract MockERC1155 is ERC1155 {
    constructor() ERC1155("") {}

    function mint(address to, uint256 id, uint256 amount) public {
        _mint(to, id, amount, "");
    }
}

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

contract ERC1155BarterUtilsUnitTest is Test {
    ERC1155EscrowObligation public escrowObligation;
    ERC1155PaymentObligation public paymentObligation;
    ERC20EscrowObligation public erc20Escrow;
    ERC20PaymentObligation public erc20Payment;
    ERC721EscrowObligation public erc721Escrow;
    ERC721PaymentObligation public erc721Payment;
    TokenBundleEscrowObligation2 public bundleEscrow;
    TokenBundlePaymentObligation2 public bundlePayment;
    NativeTokenEscrowObligation public nativeEscrow;
    NativeTokenPaymentObligation public nativePayment;
    ERC1155BarterUtils public barterUtils;

    MockERC1155 public erc1155TokenA;
    MockERC1155 public erc1155TokenB;
    MockERC20 public erc20Token;
    MockERC721 public erc721Token;

    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

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
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        // Deploy mock ERC1155 tokens
        erc1155TokenA = new MockERC1155();
        erc1155TokenB = new MockERC1155();
        erc20Token = new MockERC20("Mock ERC20", "MERC20");
        erc721Token = new MockERC721();

        // Deploy obligations
        escrowObligation = new ERC1155EscrowObligation(eas, schemaRegistry);
        paymentObligation = new ERC1155PaymentObligation(eas, schemaRegistry);
        erc20Escrow = new ERC20EscrowObligation(eas, schemaRegistry);
        erc20Payment = new ERC20PaymentObligation(eas, schemaRegistry);
        erc721Escrow = new ERC721EscrowObligation(eas, schemaRegistry);
        erc721Payment = new ERC721PaymentObligation(eas, schemaRegistry);
        bundleEscrow = new TokenBundleEscrowObligation2(eas, schemaRegistry);
        bundlePayment = new TokenBundlePaymentObligation2(eas, schemaRegistry);
        nativeEscrow = new NativeTokenEscrowObligation(eas, schemaRegistry);
        nativePayment = new NativeTokenPaymentObligation(eas, schemaRegistry);

        // Deploy barter utils contract
        barterUtils = new ERC1155BarterUtils(
            eas,
            erc20Escrow,
            erc20Payment,
            erc721Escrow,
            erc721Payment,
            escrowObligation,
            paymentObligation,
            bundleEscrow,
            bundlePayment,
            nativeEscrow,
            nativePayment
        );

        // Setup initial token balances
        erc1155TokenA.mint(alice, aliceTokenId, aliceTokenAmount); // Alice has erc1155TokenA
        erc1155TokenB.mint(bob, bobTokenId, bobTokenAmount); // Bob has erc1155TokenB

        // Setup cross-token balances
        erc20Token.transfer(alice, 500 * 10 ** 18);
        erc20Token.transfer(bob, 500 * 10 ** 18);
        erc721Token.mint(alice); // tokenId 1
        erc721Token.mint(bob); // tokenId 2
    }

    function testBuyErc1155ForErc1155() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc1155TokenA.setApprovalForAll(address(escrowObligation), true);
        bytes32 buyAttestation = barterUtils.buyErc1155ForErc1155(
            address(erc1155TokenA),
            aliceTokenId,
            aliceTokenAmount,
            address(erc1155TokenB),
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
        ERC1155EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC1155EscrowObligation.ObligationData)
        );

        assertEq(
            escrowData.token,
            address(erc1155TokenA),
            "Token should match"
        );
        assertEq(escrowData.tokenId, aliceTokenId, "TokenId should match");
        assertEq(
            escrowData.amount,
            aliceTokenAmount,
            "Token amount should match"
        );
        assertEq(
            escrowData.arbiter,
            address(paymentObligation),
            "Arbiter should be payment statement"
        );

        // Extract the demand data
        ERC1155PaymentObligation.ObligationData memory demandData = abi.decode(
            escrowData.demand,
            (ERC1155PaymentObligation.ObligationData)
        );

        assertEq(
            demandData.token,
            address(erc1155TokenB),
            "Demand token should match"
        );
        assertEq(demandData.tokenId, bobTokenId, "Demand tokenId should match");
        assertEq(
            demandData.amount,
            bobTokenAmount,
            "Demand token amount should match"
        );
        assertEq(demandData.payee, alice, "Payee should be Alice");

        // Verify that Alice's tokens are now escrowed
        assertEq(
            erc1155TokenA.balanceOf(address(escrowObligation), aliceTokenId),
            aliceTokenAmount,
            "Tokens should be in escrow"
        );
        assertEq(
            erc1155TokenA.balanceOf(alice, aliceTokenId),
            0,
            "Alice should have no tokens left"
        );
    }

    function testPayErc1155ForErc1155() public {
        // First create a buy attestation
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc1155TokenA.setApprovalForAll(address(escrowObligation), true);
        bytes32 buyAttestation = barterUtils.buyErc1155ForErc1155(
            address(erc1155TokenA),
            aliceTokenId,
            aliceTokenAmount,
            address(erc1155TokenB),
            bobTokenId,
            bobTokenAmount,
            expiration
        );
        vm.stopPrank();

        // Initial token balances (after escrow)
        assertEq(erc1155TokenA.balanceOf(alice, aliceTokenId), 0);
        assertEq(
            erc1155TokenA.balanceOf(address(escrowObligation), aliceTokenId),
            aliceTokenAmount
        );
        assertEq(erc1155TokenB.balanceOf(bob, bobTokenId), bobTokenAmount);
        assertEq(erc1155TokenB.balanceOf(alice, bobTokenId), 0);

        // Now Bob fulfills the request
        vm.startPrank(bob);
        erc1155TokenB.setApprovalForAll(address(paymentObligation), true);
        bytes32 payAttestation = barterUtils.payErc1155ForErc1155(
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
            erc1155TokenA.balanceOf(bob, aliceTokenId),
            aliceTokenAmount,
            "Bob should now have Alice's tokens"
        );
        assertEq(
            erc1155TokenB.balanceOf(alice, bobTokenId),
            bobTokenAmount,
            "Alice should now have Bob's tokens"
        );
        assertEq(
            erc1155TokenA.balanceOf(address(escrowObligation), aliceTokenId),
            0,
            "Escrow should have released tokens"
        );
        assertEq(
            erc1155TokenB.balanceOf(bob, bobTokenId),
            0,
            "Bob should have no tokens left"
        );
    }

    function testDemandDataExtraction() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc1155TokenA.setApprovalForAll(address(escrowObligation), true);
        bytes32 buyAttestation = barterUtils.buyErc1155ForErc1155(
            address(erc1155TokenA),
            aliceTokenId,
            aliceTokenAmount,
            address(erc1155TokenB),
            bobTokenId,
            bobTokenAmount,
            expiration
        );
        vm.stopPrank();

        // Extract the attestation and manually decode it
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC1155EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC1155EscrowObligation.ObligationData)
        );

        ERC1155PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC1155PaymentObligation.ObligationData)
        );

        // Verify the demand data matches what we expect
        assertEq(demand.token, address(erc1155TokenB), "Token should match");
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
            address(erc1155TokenA),
            aliceTokenId,
            aliceTokenAmount,
            address(erc1155TokenB),
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
        erc1155TokenA.setApprovalForAll(address(escrowObligation), true);
        vm.expectRevert(); // ERC1155: insufficient balance for transfer
        barterUtils.buyErc1155ForErc1155(
            address(erc1155TokenA),
            aliceTokenId,
            tooManyTokens,
            address(erc1155TokenB),
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
        erc1155TokenA.setApprovalForAll(address(escrowObligation), true);
        bytes32 buyAttestation = barterUtils.buyErc1155ForErc1155(
            address(erc1155TokenA),
            aliceTokenId,
            aliceTokenAmount,
            address(erc1155TokenB),
            bobTokenId,
            bobTokenAmount,
            expiration
        );
        vm.stopPrank();

        // Bob transfers his tokens to someone else
        address thirdParty = makeAddr("third-party");
        vm.startPrank(bob);
        erc1155TokenB.safeTransferFrom(
            bob,
            thirdParty,
            bobTokenId,
            bobTokenAmount,
            ""
        );
        vm.stopPrank();

        // Bob tries to fulfill request with tokens he no longer owns
        vm.startPrank(bob);
        erc1155TokenB.setApprovalForAll(address(paymentObligation), true);
        vm.expectRevert(); // ERC1155: insufficient balance for transfer
        barterUtils.payErc1155ForErc1155(buyAttestation);
        vm.stopPrank();
    }

    function test_RevertWhen_BidExpired() public {
        // Create a bid with short expiration
        uint64 expiration = uint64(block.timestamp + 10 minutes);

        vm.startPrank(alice);
        erc1155TokenA.setApprovalForAll(address(escrowObligation), true);
        bytes32 buyAttestation = barterUtils.buyErc1155ForErc1155(
            address(erc1155TokenA),
            aliceTokenId,
            aliceTokenAmount,
            address(erc1155TokenB),
            bobTokenId,
            bobTokenAmount,
            expiration
        );
        vm.stopPrank();

        // Warp time past expiration
        vm.warp(block.timestamp + 20 minutes);

        // Bob tries to fulfill expired bid
        vm.startPrank(bob);
        erc1155TokenB.setApprovalForAll(address(paymentObligation), true);
        vm.expectRevert();
        barterUtils.payErc1155ForErc1155(buyAttestation);
        vm.stopPrank();
    }

    // Note: We removed the test_FullFulfillment function as it was duplicating
    // the functionality already covered by testPayErc1155ForErc1155
    // If partial fulfillment is implemented in the future, we can add a specific
    // test for that feature

    // Cross-token tests

    function testBuyErc20WithErc1155() public {
        uint256 askAmount = 100 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc1155TokenA.setApprovalForAll(address(escrowObligation), true);
        bytes32 buyAttestation = barterUtils.buyErc20WithErc1155(
            address(erc1155TokenA),
            aliceTokenId,
            aliceTokenAmount / 2,
            address(erc20Token),
            askAmount,
            expiration
        );
        vm.stopPrank();

        assertNotEq(
            buyAttestation,
            bytes32(0),
            "Buy attestation should be created"
        );
    }

    function testPayErc1155ForErc20() public {
        uint256 askAmount = 100 * 10 ** 18;
        uint256 erc1155TokenId = 1;
        uint256 erc1155Amount = 25;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice creates a sell order for her ERC20
        vm.startPrank(alice);
        erc20Token.approve(address(erc20Escrow), askAmount);
        bytes32 aliceSellOrder = erc20Escrow.doObligationFor(
            ERC20EscrowObligation.ObligationData({
                token: address(erc20Token),
                amount: askAmount,
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC1155PaymentObligation.ObligationData({
                        token: address(erc1155TokenB),
                        tokenId: bobTokenId,
                        amount: erc1155Amount,
                        payee: alice
                    })
                )
            }),
            expiration,
            alice,
            alice
        );
        vm.stopPrank();

        // Bob fulfills the order
        vm.startPrank(bob);
        erc1155TokenB.setApprovalForAll(address(paymentObligation), true);
        bytes32 payAttestation = barterUtils.payErc1155ForErc20(aliceSellOrder);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify token transfers
        assertEq(
            erc20Token.balanceOf(bob),
            500 * 10 ** 18 + askAmount,
            "Bob should receive ERC20 tokens"
        );
        assertEq(
            erc1155TokenB.balanceOf(alice, bobTokenId),
            erc1155Amount,
            "Alice should receive ERC1155 tokens"
        );
    }

    function testBuyErc721WithErc1155() public {
        uint256 erc721TokenId = 1;
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc1155TokenA.setApprovalForAll(address(escrowObligation), true);
        bytes32 buyAttestation = barterUtils.buyErc721WithErc1155(
            address(erc1155TokenA),
            aliceTokenId,
            aliceTokenAmount / 2,
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
    }

    function testPayErc1155ForErc721() public {
        uint256 erc721TokenId = 1;
        uint256 erc1155Amount = 25;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice creates a sell order for her ERC721
        vm.startPrank(alice);
        erc721Token.approve(address(erc721Escrow), erc721TokenId);
        bytes32 aliceSellOrder = erc721Escrow.doObligationFor(
            ERC721EscrowObligation.ObligationData({
                token: address(erc721Token),
                tokenId: erc721TokenId,
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC1155PaymentObligation.ObligationData({
                        token: address(erc1155TokenB),
                        tokenId: bobTokenId,
                        amount: erc1155Amount,
                        payee: alice
                    })
                )
            }),
            expiration,
            alice,
            alice
        );
        vm.stopPrank();

        // Bob fulfills the order
        vm.startPrank(bob);
        erc1155TokenB.setApprovalForAll(address(paymentObligation), true);
        bytes32 payAttestation = barterUtils.payErc1155ForErc721(
            aliceSellOrder
        );
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify token transfers
        assertEq(
            erc721Token.ownerOf(erc721TokenId),
            bob,
            "Bob should receive ERC721 token"
        );
        assertEq(
            erc1155TokenB.balanceOf(alice, bobTokenId),
            erc1155Amount,
            "Alice should receive ERC1155 tokens"
        );
    }

    function testBuyBundleWithErc1155() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Create bundle data
        TokenBundleEscrowObligation2.ObligationData memory bundleData;
        bundleData.nativeAmount = 0;
        bundleData.erc20Tokens = new address[](1);
        bundleData.erc20Amounts = new uint256[](1);
        bundleData.erc721Tokens = new address[](1);
        bundleData.erc721TokenIds = new uint256[](1);
        bundleData.erc1155Tokens = new address[](0);
        bundleData.erc1155TokenIds = new uint256[](0);
        bundleData.erc1155Amounts = new uint256[](0);

        bundleData.erc20Tokens[0] = address(erc20Token);
        bundleData.erc20Amounts[0] = 50 * 10 ** 18;
        bundleData.erc721Tokens[0] = address(erc721Token);
        bundleData.erc721TokenIds[0] = 2; // Bob's ERC721

        bundleData.arbiter = address(bundlePayment);
        bundleData.demand = abi.encode(
            TokenBundlePaymentObligation2.ObligationData({
                nativeAmount: 0,
                erc20Tokens: new address[](0),
                erc20Amounts: new uint256[](0),
                erc721Tokens: new address[](0),
                erc721TokenIds: new uint256[](0),
                erc1155Tokens: new address[](1),
                erc1155TokenIds: new uint256[](1),
                erc1155Amounts: new uint256[](1),
                payee: alice
            })
        );

        // Set up the demand data properly
        TokenBundlePaymentObligation2.ObligationData memory demandData = abi
            .decode(
                bundleData.demand,
                (TokenBundlePaymentObligation2.ObligationData)
            );
        demandData.erc1155Tokens[0] = address(erc1155TokenA);
        demandData.erc1155TokenIds[0] = aliceTokenId;
        demandData.erc1155Amounts[0] = aliceTokenAmount / 2;
        bundleData.demand = abi.encode(demandData);

        vm.startPrank(alice);
        erc1155TokenA.setApprovalForAll(address(escrowObligation), true);
        bytes32 buyAttestation = barterUtils.buyBundleWithErc1155(
            address(erc1155TokenA),
            aliceTokenId,
            aliceTokenAmount / 2,
            demandData,
            expiration
        );
        vm.stopPrank();

        assertNotEq(
            buyAttestation,
            bytes32(0),
            "Buy attestation should be created"
        );
    }

    function testPayErc1155ForBundle() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Create bundle data for Alice's escrow
        TokenBundleEscrowObligation2.ObligationData memory bundleData;
        bundleData.nativeAmount = 0;
        bundleData.erc20Tokens = new address[](1);
        bundleData.erc20Amounts = new uint256[](1);
        bundleData.erc721Tokens = new address[](1);
        bundleData.erc721TokenIds = new uint256[](1);
        bundleData.erc1155Tokens = new address[](0);
        bundleData.erc1155TokenIds = new uint256[](0);
        bundleData.erc1155Amounts = new uint256[](0);

        bundleData.erc20Tokens[0] = address(erc20Token);
        bundleData.erc20Amounts[0] = 50 * 10 ** 18;
        bundleData.erc721Tokens[0] = address(erc721Token);
        bundleData.erc721TokenIds[0] = 1; // Alice's ERC721

        bundleData.arbiter = address(paymentObligation);
        bundleData.demand = abi.encode(
            ERC1155PaymentObligation.ObligationData({
                token: address(erc1155TokenB),
                tokenId: bobTokenId,
                amount: bobTokenAmount / 2,
                payee: alice
            })
        );

        // Alice creates bundle escrow
        vm.startPrank(alice);
        erc20Token.approve(address(bundleEscrow), 50 * 10 ** 18);
        erc721Token.approve(address(bundleEscrow), 1);
        bytes32 aliceBundleEscrow = bundleEscrow.doObligationFor(
            bundleData,
            expiration,
            alice,
            alice
        );
        vm.stopPrank();

        // Bob fulfills with his ERC1155
        vm.startPrank(bob);
        erc1155TokenB.setApprovalForAll(address(paymentObligation), true);
        bytes32 payAttestation = barterUtils.payErc1155ForBundle(
            aliceBundleEscrow
        );
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify token transfers
        assertEq(
            erc20Token.balanceOf(bob),
            500 * 10 ** 18 + 50 * 10 ** 18,
            "Bob should receive ERC20 tokens"
        );
        assertEq(
            erc721Token.ownerOf(1),
            bob,
            "Bob should receive ERC721 token"
        );
        assertEq(
            erc1155TokenB.balanceOf(alice, bobTokenId),
            bobTokenAmount / 2,
            "Alice should receive ERC1155 tokens"
        );
    }

    function test_RevertWhen_AttestationNotFoundCrossToken() public {
        bytes32 fakeAttestation = keccak256("fake");

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                ERC1155BarterUtils.AttestationNotFound.selector,
                fakeAttestation
            )
        );
        barterUtils.payErc1155ForErc20(fakeAttestation);
    }

    function test_RevertWhen_InsufficientERC1155BalanceCrossToken() public {
        uint256 askAmount = 100 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice creates a sell order demanding more ERC1155 than Bob has
        vm.startPrank(alice);
        erc20Token.approve(address(erc20Escrow), askAmount);
        bytes32 aliceSellOrder = erc20Escrow.doObligationFor(
            ERC20EscrowObligation.ObligationData({
                token: address(erc20Token),
                amount: askAmount,
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC1155PaymentObligation.ObligationData({
                        token: address(erc1155TokenB),
                        tokenId: bobTokenId,
                        amount: bobTokenAmount * 2, // More than Bob has
                        payee: alice
                    })
                )
            }),
            expiration,
            alice,
            alice
        );
        vm.stopPrank();

        // Bob tries to fulfill but doesn't have enough
        vm.startPrank(bob);
        erc1155TokenB.setApprovalForAll(address(paymentObligation), true);
        vm.expectRevert();
        barterUtils.payErc1155ForErc20(aliceSellOrder);
        vm.stopPrank();
    }

    function test_RevertWhen_TransferFailsCrossToken() public {
        uint256 askAmount = 100 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice creates a sell order
        vm.startPrank(alice);
        erc20Token.approve(address(erc20Escrow), askAmount);
        bytes32 aliceSellOrder = erc20Escrow.doObligationFor(
            ERC20EscrowObligation.ObligationData({
                token: address(erc20Token),
                amount: askAmount,
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC1155PaymentObligation.ObligationData({
                        token: address(erc1155TokenB),
                        tokenId: bobTokenId,
                        amount: 25,
                        payee: alice
                    })
                )
            }),
            expiration,
            alice,
            alice
        );
        vm.stopPrank();

        // Bob tries to fulfill without approval
        vm.prank(bob);
        vm.expectRevert();
        barterUtils.payErc1155ForErc20(aliceSellOrder);
    }

    function test_RevertWhen_WrongERC1155EscrowedCrossToken() public {
        uint256 askAmount = 100 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice creates a sell order demanding specific ERC1155 (tokenA)
        vm.startPrank(alice);
        erc20Token.approve(address(erc20Escrow), askAmount);
        bytes32 aliceSellOrder = erc20Escrow.doObligationFor(
            ERC20EscrowObligation.ObligationData({
                token: address(erc20Token),
                amount: askAmount,
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC1155PaymentObligation.ObligationData({
                        token: address(erc1155TokenA), // Alice wants tokenA
                        tokenId: aliceTokenId,
                        amount: 25,
                        payee: alice
                    })
                )
            }),
            expiration,
            alice,
            alice
        );
        vm.stopPrank();

        // Bob tries to pay with different ERC1155 token (tokenB instead of tokenA)
        vm.startPrank(bob);

        // Create wrong payment with different token contract
        erc1155TokenB.setApprovalForAll(address(paymentObligation), true);
        bytes32 wrongPayment = paymentObligation.doObligationFor(
            ERC1155PaymentObligation.ObligationData({
                token: address(erc1155TokenB), // Bob offers tokenB
                tokenId: bobTokenId,
                amount: 25,
                payee: alice
            }),
            bob,
            bob
        );

        // This should revert because the payment doesn't match the demand
        vm.expectRevert();
        erc20Escrow.collectEscrow(aliceSellOrder, wrongPayment);
        vm.stopPrank();
    }

    // ============ Native Token (ETH) Tests ============

    function testBuyEthWithErc1155() public {
        uint256 erc1155TokenId = 1;
        uint256 erc1155Amount = 10;
        uint256 askAmount = 1 ether;
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc1155TokenA.mint(alice, erc1155TokenId, erc1155Amount);
        erc1155TokenA.setApprovalForAll(address(escrowObligation), true);

        // Alice creates buy order: offering ERC1155 for ETH
        bytes32 buyAttestation = barterUtils.buyEthWithErc1155(
            address(erc1155TokenA),
            erc1155TokenId,
            erc1155Amount,
            askAmount,
            expiration
        );
        vm.stopPrank();

        // Check that the ERC1155 tokens are now held in escrow
        assertEq(
            erc1155TokenA.balanceOf(address(escrowObligation), erc1155TokenId),
            erc1155Amount
        );

        // Verify attestation data
        Attestation memory attestation = eas.getAttestation(buyAttestation);
        assertEq(attestation.recipient, alice);

        ERC1155EscrowObligation.ObligationData memory escrowData = abi.decode(
            attestation.data,
            (ERC1155EscrowObligation.ObligationData)
        );
        assertEq(escrowData.token, address(erc1155TokenA));
        assertEq(escrowData.tokenId, erc1155TokenId);
        assertEq(escrowData.amount, erc1155Amount);
        assertEq(escrowData.arbiter, address(nativePayment));
    }

    function testPayEthForErc1155() public {
        uint256 erc1155TokenId = 1;
        uint256 erc1155Amount = 10;
        uint256 askAmount = 1 ether;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice creates buy order: offering ERC1155 for ETH
        vm.startPrank(alice);
        erc1155TokenA.mint(alice, erc1155TokenId, erc1155Amount);
        erc1155TokenA.setApprovalForAll(address(escrowObligation), true);

        bytes32 buyAttestation = barterUtils.buyEthWithErc1155(
            address(erc1155TokenA),
            erc1155TokenId,
            erc1155Amount,
            askAmount,
            expiration
        );
        vm.stopPrank();

        // Bob fulfills the order by paying ETH
        vm.deal(bob, 2 ether);
        vm.startPrank(bob);

        uint256 bobBalanceBefore = bob.balance;
        uint256 aliceBalanceBefore = alice.balance;

        bytes32 sellAttestation = barterUtils.payEthForErc1155{
            value: askAmount
        }(buyAttestation);
        vm.stopPrank();

        // Verify the ERC1155 tokens were transferred to Bob
        assertEq(erc1155TokenA.balanceOf(bob, erc1155TokenId), erc1155Amount);
        assertEq(erc1155TokenA.balanceOf(alice, erc1155TokenId), 50);

        // Verify ETH was transferred
        assertEq(bob.balance, bobBalanceBefore - askAmount);
        assertEq(alice.balance, aliceBalanceBefore + askAmount);

        // Verify sell attestation exists
        Attestation memory sellAtt = eas.getAttestation(sellAttestation);
        assertEq(sellAtt.recipient, bob);
    }

    function testPayErc1155ForEth() public {
        uint256 erc1155TokenId = 1;
        uint256 erc1155Amount = 10;
        uint256 askAmount = 1 ether;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Bob creates escrow: offering ETH for ERC1155
        vm.deal(bob, 2 ether);
        vm.startPrank(bob);

        bytes32 buyAttestation = nativeEscrow.doObligationFor{value: askAmount}(
            NativeTokenEscrowObligation.ObligationData({
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC1155PaymentObligation.ObligationData({
                        token: address(erc1155TokenA),
                        tokenId: erc1155TokenId,
                        amount: erc1155Amount,
                        payee: bob
                    })
                ),
                amount: askAmount
            }),
            expiration,
            bob,
            bob
        );
        vm.stopPrank();

        // Alice fulfills the order by paying ERC1155
        vm.startPrank(alice);
        erc1155TokenA.mint(alice, erc1155TokenId, erc1155Amount);
        erc1155TokenA.setApprovalForAll(address(paymentObligation), true);

        uint256 aliceBalanceBefore = alice.balance;

        bytes32 sellAttestation = barterUtils.payErc1155ForEth(buyAttestation);
        vm.stopPrank();

        // Verify the ERC1155 tokens were transferred to Bob
        assertEq(erc1155TokenA.balanceOf(bob, erc1155TokenId), erc1155Amount);
        assertEq(erc1155TokenA.balanceOf(alice, erc1155TokenId), 50);

        // Verify ETH was transferred to Alice
        assertEq(alice.balance, aliceBalanceBefore + askAmount);

        // Verify sell attestation exists
        Attestation memory sellAtt = eas.getAttestation(sellAttestation);
        assertEq(sellAtt.recipient, alice);
    }

    function test_RevertWhen_InsufficientEthPayment() public {
        uint256 erc1155TokenId = 1;
        uint256 erc1155Amount = 10;
        uint256 askAmount = 1 ether;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice creates buy order: offering ERC1155 for ETH
        vm.startPrank(alice);
        erc1155TokenA.mint(alice, erc1155TokenId, erc1155Amount);
        erc1155TokenA.setApprovalForAll(address(escrowObligation), true);

        bytes32 buyAttestation = barterUtils.buyEthWithErc1155(
            address(erc1155TokenA),
            erc1155TokenId,
            erc1155Amount,
            askAmount,
            expiration
        );
        vm.stopPrank();

        // Bob tries to fulfill with insufficient ETH
        vm.deal(bob, 0.5 ether);
        vm.startPrank(bob);

        vm.expectRevert();
        barterUtils.payEthForErc1155{value: 0.5 ether}(buyAttestation);
        vm.stopPrank();
    }
}
