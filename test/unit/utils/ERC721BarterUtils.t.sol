// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC721EscrowObligation} from "@src/obligations/ERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "@src/obligations/ERC721PaymentObligation.sol";
import {ERC20EscrowObligation} from "@src/obligations/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "@src/obligations/ERC20PaymentObligation.sol";
import {ERC1155EscrowObligation} from "@src/obligations/ERC1155EscrowObligation.sol";
import {ERC1155PaymentObligation} from "@src/obligations/ERC1155PaymentObligation.sol";
import {TokenBundleEscrowObligation2} from "@src/obligations/TokenBundleEscrowObligation2.sol";
import {TokenBundlePaymentObligation2} from "@src/obligations/TokenBundlePaymentObligation2.sol";
import {NativeTokenEscrowObligation} from "@src/obligations/NativeTokenEscrowObligation.sol";
import {NativeTokenPaymentObligation} from "@src/obligations/NativeTokenPaymentObligation.sol";
import {ERC721BarterUtils} from "@src/utils/ERC721BarterUtils.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract MockERC721 is ERC721 {
    uint256 private _currentTokenId = 0;

    constructor() ERC721("Mock ERC721", "MERC721") {}

    function mint(address to) public returns (uint256) {
        _currentTokenId++;
        _mint(to, _currentTokenId);
        return _currentTokenId;
    }
}

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract MockERC1155 is ERC1155 {
    constructor() ERC1155("") {}

    function mint(address to, uint256 id, uint256 amount) public {
        _mint(to, id, amount, "");
    }
}

contract ERC721BarterUtilsUnitTest is Test {
    ERC721EscrowObligation public escrowObligation;
    ERC721PaymentObligation public paymentObligation;
    ERC20EscrowObligation public erc20Escrow;
    ERC20PaymentObligation public erc20Payment;
    ERC1155EscrowObligation public erc1155Escrow;
    ERC1155PaymentObligation public erc1155Payment;
    TokenBundleEscrowObligation2 public bundleEscrow;
    TokenBundlePaymentObligation2 public bundlePayment;
    NativeTokenEscrowObligation public nativeEscrow;
    NativeTokenPaymentObligation public nativePayment;
    ERC721BarterUtils public barterUtils;
    MockERC721 public erc721TokenA;
    MockERC721 public erc721TokenB;
    MockERC20 public erc20Token;
    MockERC1155 public erc1155Token;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    uint256 internal constant ALICE_PRIVATE_KEY = 0xa11ce;
    uint256 internal constant BOB_PRIVATE_KEY = 0xb0b;

    address public alice;
    address public bob;

    uint256 public aliceErc721Id;
    uint256 public bobErc721Id;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        // Deploy mock ERC721 tokens
        erc721TokenA = new MockERC721();
        erc721TokenB = new MockERC721();
        erc20Token = new MockERC20("Mock ERC20", "MERC20");
        erc1155Token = new MockERC1155();

        // Deploy obligations
        escrowObligation = new ERC721EscrowObligation(eas, schemaRegistry);
        paymentObligation = new ERC721PaymentObligation(eas, schemaRegistry);
        erc20Escrow = new ERC20EscrowObligation(eas, schemaRegistry);
        erc20Payment = new ERC20PaymentObligation(eas, schemaRegistry);
        erc1155Escrow = new ERC1155EscrowObligation(eas, schemaRegistry);
        erc1155Payment = new ERC1155PaymentObligation(eas, schemaRegistry);
        bundleEscrow = new TokenBundleEscrowObligation2(eas, schemaRegistry);
        bundlePayment = new TokenBundlePaymentObligation2(eas, schemaRegistry);
        nativeEscrow = new NativeTokenEscrowObligation(eas, schemaRegistry);
        nativePayment = new NativeTokenPaymentObligation(eas, schemaRegistry);

        // Deploy barter utils contract
        barterUtils = new ERC721BarterUtils(
            eas,
            erc20Escrow,
            erc20Payment,
            escrowObligation,
            paymentObligation,
            erc1155Escrow,
            erc1155Payment,
            bundleEscrow,
            bundlePayment,
            nativeEscrow,
            nativePayment
        );

        // Setup initial token balances
        vm.prank(alice);
        aliceErc721Id = erc721TokenA.mint(alice); // Alice has erc1155TokenA

        vm.prank(bob);
        bobErc721Id = erc721TokenB.mint(bob); // Bob has erc1155TokenB

        // Setup cross-token balances
        erc20Token.transfer(bob, 100 * 10 ** 18);
        erc1155Token.mint(bob, 1, 100);
    }

    function testBuyErc721ForErc721() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc721TokenA.approve(address(escrowObligation), aliceErc721Id);
        bytes32 buyAttestation = barterUtils.buyErc721ForErc721(
            address(erc721TokenA),
            aliceErc721Id,
            address(erc721TokenB),
            bobErc721Id,
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
        ERC721EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC721EscrowObligation.ObligationData)
        );

        assertEq(escrowData.token, address(erc721TokenA), "Token should match");
        assertEq(escrowData.tokenId, aliceErc721Id, "TokenId should match");
        assertEq(
            escrowData.arbiter,
            address(paymentObligation),
            "Arbiter should be payment statement"
        );

        // Extract the demand data
        ERC721PaymentObligation.ObligationData memory demandData = abi.decode(
            escrowData.demand,
            (ERC721PaymentObligation.ObligationData)
        );

        assertEq(
            demandData.token,
            address(erc721TokenB),
            "Demand token should match"
        );
        assertEq(
            demandData.tokenId,
            bobErc721Id,
            "Demand tokenId should match"
        );
        assertEq(demandData.payee, alice, "Payee should be Alice");

        // Verify that Alice's ERC721 token is now escrowed
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            address(escrowObligation),
            "ERC721 should be in escrow"
        );
    }

    function testPayErc721ForErc721() public {
        // First create a buy attestation
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc721TokenA.approve(address(escrowObligation), aliceErc721Id);
        bytes32 buyAttestation = barterUtils.buyErc721ForErc721(
            address(erc721TokenA),
            aliceErc721Id,
            address(erc721TokenB),
            bobErc721Id,
            expiration
        );
        vm.stopPrank();

        // Now Bob fulfills the request
        vm.startPrank(bob);
        erc721TokenB.approve(address(paymentObligation), bobErc721Id);
        bytes32 payAttestation = barterUtils.payErc721ForErc721(buyAttestation);
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
            erc721TokenB.ownerOf(bobErc721Id),
            alice,
            "Alice should now own Bob's ERC721 token"
        );
    }

    // Test that we can extract the demand data correctly
    function testDemandDataExtraction() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc721TokenA.approve(address(escrowObligation), aliceErc721Id);
        bytes32 buyAttestation = barterUtils.buyErc721ForErc721(
            address(erc721TokenA),
            aliceErc721Id,
            address(erc721TokenB),
            bobErc721Id,
            expiration
        );
        vm.stopPrank();

        // Extract the attestation and manually decode it
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC721EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC721EscrowObligation.ObligationData)
        );

        ERC721PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC721PaymentObligation.ObligationData)
        );

        // Verify the demand data matches what we expect
        assertEq(demand.token, address(erc721TokenB), "Token should match");
        assertEq(demand.tokenId, bobErc721Id, "TokenId should match");
        assertEq(demand.payee, alice, "Payee should be alice");
    }

    function test_RevertWhen_TokenNotApproved() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice tries to make bid without approving ERC721 token
        vm.startPrank(alice);
        vm.expectRevert(); // ERC721: caller is not token owner or approved
        barterUtils.buyErc721ForErc721(
            address(erc721TokenA),
            aliceErc721Id,
            address(erc721TokenB),
            bobErc721Id,
            expiration
        );
        vm.stopPrank();
    }

    function test_RevertWhen_PaymentFails() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice makes bid
        vm.startPrank(alice);
        erc721TokenA.approve(address(escrowObligation), aliceErc721Id);
        bytes32 buyAttestation = barterUtils.buyErc721ForErc721(
            address(erc721TokenA),
            aliceErc721Id,
            address(erc721TokenB),
            bobErc721Id,
            expiration
        );
        vm.stopPrank();

        // Transfer Bob's ERC721 token to someone else
        address thirdParty = makeAddr("third-party");
        vm.prank(bob);
        erc721TokenB.transferFrom(bob, thirdParty, bobErc721Id);

        // Bob tries to fulfill request with ERC721 he no longer owns
        vm.startPrank(bob);
        vm.expectRevert(); // ERC721: caller is not token owner or approved
        barterUtils.payErc721ForErc721(buyAttestation);
        vm.stopPrank();
    }

    function test_RevertWhen_BidDoesNotExist() public {
        bytes32 nonExistentBid = bytes32(uint256(1234));

        vm.startPrank(bob);
        vm.expectRevert(); // Custom error or EAS revert for non-existent attestation
        barterUtils.payErc721ForErc721(nonExistentBid);
        vm.stopPrank();
    }

    function test_RevertWhen_BidExpired() public {
        // Create a bid with short expiration
        uint64 expiration = uint64(block.timestamp + 10 minutes);

        vm.startPrank(alice);
        erc721TokenA.approve(address(escrowObligation), aliceErc721Id);
        bytes32 buyAttestation = barterUtils.buyErc721ForErc721(
            address(erc721TokenA),
            aliceErc721Id,
            address(erc721TokenB),
            bobErc721Id,
            expiration
        );
        vm.stopPrank();

        // Warp time past expiration
        vm.warp(block.timestamp + 20 minutes);

        // Bob tries to fulfill expired bid
        vm.startPrank(bob);
        erc721TokenB.approve(address(paymentObligation), bobErc721Id);
        vm.expectRevert();
        barterUtils.payErc721ForErc721(buyAttestation);
        vm.stopPrank();
    }

    // Cross-token tests

    function testBuyErc20WithErc721() public {
        uint256 askAmount = 100 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc721TokenA.approve(address(escrowObligation), aliceErc721Id);
        bytes32 buyAttestation = barterUtils.buyErc20WithErc721(
            address(erc721TokenA),
            aliceErc721Id,
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

        // Validate the attestation data
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC721EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC721EscrowObligation.ObligationData)
        );

        assertEq(escrowData.token, address(erc721TokenA), "Token should match");
        assertEq(escrowData.tokenId, aliceErc721Id, "TokenId should match");
        assertEq(
            escrowData.arbiter,
            address(erc20Payment),
            "Arbiter should be ERC20 payment"
        );
    }

    function testPayErc721ForErc20() public {
        uint256 askAmount = 100 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Bob creates a sell order for his ERC20
        vm.startPrank(bob);
        erc20Token.approve(address(erc20Escrow), askAmount);
        bytes32 bobSellOrder = erc20Escrow.doObligationFor(
            ERC20EscrowObligation.ObligationData({
                token: address(erc20Token),
                amount: askAmount,
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC721PaymentObligation.ObligationData({
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

        // Alice fulfills the order
        vm.startPrank(alice);
        erc721TokenA.approve(address(paymentObligation), aliceErc721Id);
        bytes32 payAttestation = barterUtils.payErc721ForErc20(bobSellOrder);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify token transfers
        assertEq(
            erc20Token.balanceOf(alice),
            askAmount,
            "Alice should receive ERC20 tokens"
        );
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            bob,
            "Bob should receive ERC721 token"
        );
    }

    function testBuyErc1155WithErc721() public {
        uint256 erc1155TokenId = 1;
        uint256 erc1155Amount = 50;
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc721TokenA.approve(address(escrowObligation), aliceErc721Id);
        bytes32 buyAttestation = barterUtils.buyErc1155WithErc721(
            address(erc721TokenA),
            aliceErc721Id,
            address(erc1155Token),
            erc1155TokenId,
            erc1155Amount,
            expiration
        );
        vm.stopPrank();

        assertNotEq(
            buyAttestation,
            bytes32(0),
            "Buy attestation should be created"
        );
    }

    function testPayErc721ForErc1155() public {
        uint256 erc1155TokenId = 1;
        uint256 erc1155Amount = 50;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Bob creates a sell order for his ERC1155
        vm.startPrank(bob);
        erc1155Token.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 bobSellOrder = erc1155Escrow.doObligationFor(
            ERC1155EscrowObligation.ObligationData({
                token: address(erc1155Token),
                tokenId: erc1155TokenId,
                amount: erc1155Amount,
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC721PaymentObligation.ObligationData({
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

        // Alice fulfills the order
        vm.startPrank(alice);
        erc721TokenA.approve(address(paymentObligation), aliceErc721Id);
        bytes32 payAttestation = barterUtils.payErc721ForErc1155(bobSellOrder);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify token transfers
        assertEq(
            erc1155Token.balanceOf(alice, erc1155TokenId),
            erc1155Amount,
            "Alice should receive ERC1155 tokens"
        );
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            bob,
            "Bob should receive ERC721 token"
        );
    }

    function testBuyBundleWithErc721() public {
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
        bundleData.erc721Tokens[0] = address(erc721TokenB);
        bundleData.erc721TokenIds[0] = bobErc721Id;

        bundleData.arbiter = address(bundlePayment);
        bundleData.demand = abi.encode(
            TokenBundlePaymentObligation2.ObligationData({
                nativeAmount: 0,
                erc20Tokens: new address[](0),
                erc20Amounts: new uint256[](0),
                erc721Tokens: new address[](1),
                erc721TokenIds: new uint256[](1),
                erc1155Tokens: new address[](0),
                erc1155TokenIds: new uint256[](0),
                erc1155Amounts: new uint256[](0),
                payee: alice
            })
        );

        // Set up the demand data properly
        TokenBundlePaymentObligation2.ObligationData memory demandData = abi
            .decode(
                bundleData.demand,
                (TokenBundlePaymentObligation2.ObligationData)
            );
        demandData.erc721Tokens[0] = address(erc721TokenA);
        demandData.erc721TokenIds[0] = aliceErc721Id;
        bundleData.demand = abi.encode(demandData);

        vm.startPrank(alice);
        erc721TokenA.approve(address(escrowObligation), aliceErc721Id);
        bytes32 buyAttestation = barterUtils.buyBundleWithErc721(
            address(erc721TokenA),
            aliceErc721Id,
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

    function testPayErc721ForBundle() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Create bundle data for Bob's escrow
        TokenBundleEscrowObligation2.ObligationData memory bundleData;
        bundleData.nativeAmount = 0;
        bundleData.erc20Tokens = new address[](1);
        bundleData.erc20Amounts = new uint256[](1);
        bundleData.erc721Tokens = new address[](0);
        bundleData.erc721TokenIds = new uint256[](0);
        bundleData.erc1155Tokens = new address[](1);
        bundleData.erc1155TokenIds = new uint256[](1);
        bundleData.erc1155Amounts = new uint256[](1);

        bundleData.erc20Tokens[0] = address(erc20Token);
        bundleData.erc20Amounts[0] = 50 * 10 ** 18;
        bundleData.erc1155Tokens[0] = address(erc1155Token);
        bundleData.erc1155TokenIds[0] = 1;
        bundleData.erc1155Amounts[0] = 50;

        bundleData.arbiter = address(paymentObligation);
        bundleData.demand = abi.encode(
            ERC721PaymentObligation.ObligationData({
                token: address(erc721TokenA),
                tokenId: aliceErc721Id,
                payee: bob
            })
        );

        // Bob creates bundle escrow
        vm.startPrank(bob);
        erc20Token.approve(address(bundleEscrow), 50 * 10 ** 18);
        erc1155Token.setApprovalForAll(address(bundleEscrow), true);
        bytes32 bobBundleEscrow = bundleEscrow.doObligationFor(
            bundleData,
            expiration,
            bob,
            bob
        );
        vm.stopPrank();

        // Alice fulfills with her ERC721
        vm.startPrank(alice);
        erc721TokenA.approve(address(paymentObligation), aliceErc721Id);
        bytes32 payAttestation = barterUtils.payErc721ForBundle(
            bobBundleEscrow
        );
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify token transfers
        assertEq(
            erc20Token.balanceOf(alice),
            50 * 10 ** 18,
            "Alice should receive ERC20 tokens"
        );
        assertEq(
            erc1155Token.balanceOf(alice, 1),
            50,
            "Alice should receive ERC1155 tokens"
        );
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            bob,
            "Bob should receive ERC721 token"
        );
    }

    function test_RevertWhen_AttestationNotFound() public {
        bytes32 fakeAttestation = keccak256("fake");

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                ERC721BarterUtils.AttestationNotFound.selector,
                fakeAttestation
            )
        );
        barterUtils.payErc721ForErc20(fakeAttestation);
    }

    function test_RevertWhen_TransferFails() public {
        uint256 askAmount = 100 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Bob creates a sell order for his ERC20
        vm.startPrank(bob);
        erc20Token.approve(address(erc20Escrow), askAmount);
        bytes32 bobSellOrder = erc20Escrow.doObligationFor(
            ERC20EscrowObligation.ObligationData({
                token: address(erc20Token),
                amount: askAmount,
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC721PaymentObligation.ObligationData({
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

        // Alice tries to fulfill without approval
        vm.prank(alice);
        vm.expectRevert();
        barterUtils.payErc721ForErc20(bobSellOrder);
    }

    function test_RevertWhen_MismatchedDemand() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Bob creates a sell order for his ERC20, demanding ERC721 token B
        vm.startPrank(bob);
        erc20Token.approve(address(erc20Escrow), 100 * 10 ** 18);
        bytes32 bobSellOrder = erc20Escrow.doObligationFor(
            ERC20EscrowObligation.ObligationData({
                token: address(erc20Token),
                amount: 100 * 10 ** 18,
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC721PaymentObligation.ObligationData({
                        token: address(erc721TokenB), // Bob wants token B
                        tokenId: bobErc721Id,
                        payee: bob
                    })
                )
            }),
            expiration,
            bob,
            bob
        );
        vm.stopPrank();

        // Alice tries to fulfill with token A instead of token B
        vm.startPrank(alice);
        erc721TokenA.approve(address(paymentObligation), aliceErc721Id);

        // Create a payment attestation with the wrong token
        bytes32 wrongPayment = paymentObligation.doObligationFor(
            ERC721PaymentObligation.ObligationData({
                token: address(erc721TokenA), // Alice offers token A
                tokenId: aliceErc721Id,
                payee: bob
            }),
            alice,
            alice
        );

        // This should revert because the payment doesn't match the demand
        vm.expectRevert();
        erc20Escrow.collectEscrow(bobSellOrder, wrongPayment);
        vm.stopPrank();
    }

    // ============ Native Token (ETH) Tests ============

    function testBuyEthWithErc721() public {
        uint256 askAmount = 1 ether;
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        uint256 erc721Id = erc721TokenA.mint(alice);
        erc721TokenA.approve(address(escrowObligation), erc721Id);

        // Alice creates buy order: offering ERC721 for ETH
        bytes32 buyAttestation = barterUtils.buyEthWithErc721(
            address(erc721TokenA),
            erc721Id,
            askAmount,
            expiration
        );
        vm.stopPrank();

        // Check that the ERC721 token is now held in escrow
        assertEq(erc721TokenA.ownerOf(erc721Id), address(escrowObligation));

        // Verify attestation data
        Attestation memory attestation = eas.getAttestation(buyAttestation);
        assertEq(attestation.recipient, alice);

        ERC721EscrowObligation.ObligationData memory escrowData = abi.decode(
            attestation.data,
            (ERC721EscrowObligation.ObligationData)
        );
        assertEq(escrowData.token, address(erc721TokenA));
        assertEq(escrowData.tokenId, erc721Id);
        assertEq(escrowData.arbiter, address(nativePayment));
    }

    function testPayEthForErc721() public {
        uint256 askAmount = 1 ether;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice creates buy order: offering ERC721 for ETH
        vm.startPrank(alice);
        uint256 erc721Id = erc721TokenA.mint(alice);
        erc721TokenA.approve(address(escrowObligation), erc721Id);

        bytes32 buyAttestation = barterUtils.buyEthWithErc721(
            address(erc721TokenA),
            erc721Id,
            askAmount,
            expiration
        );
        vm.stopPrank();

        // Bob fulfills the order by paying ETH
        vm.deal(bob, 2 ether);
        vm.startPrank(bob);

        uint256 bobBalanceBefore = bob.balance;
        uint256 aliceBalanceBefore = alice.balance;

        bytes32 sellAttestation = barterUtils.payEthForErc721{value: askAmount}(
            buyAttestation
        );
        vm.stopPrank();

        // Verify the ERC721 token was transferred to Bob
        assertEq(erc721TokenA.ownerOf(erc721Id), bob);

        // Verify ETH was transferred
        assertEq(bob.balance, bobBalanceBefore - askAmount);
        assertEq(alice.balance, aliceBalanceBefore + askAmount);

        // Verify sell attestation exists
        Attestation memory sellAtt = eas.getAttestation(sellAttestation);
        assertEq(sellAtt.recipient, bob);
    }

    function testPayErc721ForEth() public {
        uint256 askAmount = 1 ether;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Bob creates escrow: offering ETH for ERC721
        vm.deal(bob, 2 ether);
        vm.startPrank(bob);

        bytes32 buyAttestation = nativeEscrow.doObligationFor{value: askAmount}(
            NativeTokenEscrowObligation.ObligationData({
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC721PaymentObligation.ObligationData({
                        token: address(erc721TokenA),
                        tokenId: 1,
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

        // Alice fulfills the order by paying ERC721
        vm.startPrank(alice);
        uint256 erc721Id = erc721TokenA.mint(alice);

        // Update the demand to use the correct tokenId
        vm.stopPrank();
        vm.startPrank(bob);
        buyAttestation = nativeEscrow.doObligationFor{value: askAmount}(
            NativeTokenEscrowObligation.ObligationData({
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC721PaymentObligation.ObligationData({
                        token: address(erc721TokenA),
                        tokenId: erc721Id,
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

        vm.startPrank(alice);
        erc721TokenA.approve(address(paymentObligation), erc721Id);

        uint256 aliceBalanceBefore = alice.balance;

        bytes32 sellAttestation = barterUtils.payErc721ForEth(buyAttestation);
        vm.stopPrank();

        // Verify the ERC721 token was transferred to Bob
        assertEq(erc721TokenA.ownerOf(erc721Id), bob);

        // Verify ETH was transferred to Alice
        assertEq(alice.balance, aliceBalanceBefore + askAmount);

        // Verify sell attestation exists
        Attestation memory sellAtt = eas.getAttestation(sellAttestation);
        assertEq(sellAtt.recipient, alice);
    }

    function test_RevertWhen_InsufficientEthPayment() public {
        uint256 askAmount = 1 ether;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice creates buy order: offering ERC721 for ETH
        vm.startPrank(alice);
        uint256 erc721Id = erc721TokenA.mint(alice);
        erc721TokenA.approve(address(escrowObligation), erc721Id);

        bytes32 buyAttestation = barterUtils.buyEthWithErc721(
            address(erc721TokenA),
            erc721Id,
            askAmount,
            expiration
        );
        vm.stopPrank();

        // Bob tries to fulfill with insufficient ETH
        vm.deal(bob, 0.5 ether);
        vm.startPrank(bob);

        vm.expectRevert();
        barterUtils.payEthForErc721{value: 0.5 ether}(buyAttestation);
        vm.stopPrank();
    }
}
