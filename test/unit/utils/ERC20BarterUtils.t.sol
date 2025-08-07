// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC20EscrowObligation} from "@src/obligations/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "@src/obligations/ERC20PaymentObligation.sol";
import {ERC20BarterUtils} from "@src/utils/ERC20BarterUtils.sol";
import {ERC721EscrowObligation} from "@src/obligations/ERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "@src/obligations/ERC721PaymentObligation.sol";
import {ERC1155EscrowObligation} from "@src/obligations/ERC1155EscrowObligation.sol";
import {ERC1155PaymentObligation} from "@src/obligations/ERC1155PaymentObligation.sol";
import {TokenBundleEscrowObligation2} from "@src/obligations/TokenBundleEscrowObligation2.sol";
import {TokenBundlePaymentObligation2} from "@src/obligations/TokenBundlePaymentObligation2.sol";
import {NativeTokenEscrowObligation} from "@src/obligations/NativeTokenEscrowObligation.sol";
import {NativeTokenPaymentObligation} from "@src/obligations/NativeTokenPaymentObligation.sol";
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

contract ERC20BarterUtilsUnitTest is Test {
    ERC20EscrowObligation public escrowObligation;
    ERC20PaymentObligation public paymentObligation;
    ERC721EscrowObligation public erc721Escrow;
    ERC721PaymentObligation public erc721Payment;
    ERC1155EscrowObligation public erc1155Escrow;
    ERC1155PaymentObligation erc1155Payment;
    TokenBundleEscrowObligation2 bundleEscrow;
    TokenBundlePaymentObligation2 bundlePayment;
    NativeTokenEscrowObligation nativeEscrow;
    NativeTokenPaymentObligation nativePayment;
    ERC20BarterUtils public barterUtils;
    MockERC20Permit public erc20TokenA;
    MockERC20Permit public erc20TokenB;
    MockERC721 public askErc721Token;
    MockERC1155 public askErc1155Token;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    uint256 internal constant ALICE_PRIVATE_KEY = 0xa11ce;
    uint256 internal constant BOB_PRIVATE_KEY = 0xb0b;

    address public alice;
    address public bob;

    function setUp() public {
        // Set up test addresses from private keys
        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        erc20TokenA = new MockERC20Permit("Token A", "TKA");
        erc20TokenB = new MockERC20Permit("Token B", "TKB");
        askErc721Token = new MockERC721();
        askErc1155Token = new MockERC1155();

        escrowObligation = new ERC20EscrowObligation(eas, schemaRegistry);
        paymentObligation = new ERC20PaymentObligation(eas, schemaRegistry);
        erc721Escrow = new ERC721EscrowObligation(eas, schemaRegistry);
        erc721Payment = new ERC721PaymentObligation(eas, schemaRegistry);
        erc1155Escrow = new ERC1155EscrowObligation(eas, schemaRegistry);
        erc1155Payment = new ERC1155PaymentObligation(eas, schemaRegistry);
        bundleEscrow = new TokenBundleEscrowObligation2(eas, schemaRegistry);
        bundlePayment = new TokenBundlePaymentObligation2(eas, schemaRegistry);
        nativeEscrow = new NativeTokenEscrowObligation(eas, schemaRegistry);
        nativePayment = new NativeTokenPaymentObligation(eas, schemaRegistry);

        barterUtils = new ERC20BarterUtils(
            eas,
            escrowObligation,
            paymentObligation,
            erc721Escrow,
            erc721Payment,
            erc1155Escrow,
            erc1155Payment,
            bundleEscrow,
            bundlePayment,
            nativeEscrow,
            nativePayment
        );

        erc20TokenA.transfer(alice, 1000 * 10 ** 18);
        erc20TokenB.transfer(bob, 1000 * 10 ** 18);
        askErc721Token.mint(bob); // tokenId 1
        askErc1155Token.mint(bob, 1, 100);

        // Setup for native token tests
        vm.deal(bob, 100 ether);
    }

    function testBuyErc20ForErc20() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 askAmount = 200 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc20TokenA.approve(address(escrowObligation), bidAmount);
        bytes32 buyAttestation = barterUtils.buyErc20ForErc20(
            address(erc20TokenA),
            bidAmount,
            address(erc20TokenB),
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

    function testPermitAndBuyErc20ForErc20() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 askAmount = 200 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1;

        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            erc20TokenA,
            ALICE_PRIVATE_KEY,
            address(escrowObligation),
            bidAmount,
            deadline
        );

        vm.prank(alice);
        bytes32 buyAttestation = barterUtils.permitAndBuyErc20ForErc20(
            address(erc20TokenA),
            bidAmount,
            address(erc20TokenB),
            askAmount,
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

    function testPermitSignatureValidation() public {
        uint256 amount = 100 * 10 ** 18;
        uint256 deadline = block.timestamp + 1;

        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            erc20TokenA,
            ALICE_PRIVATE_KEY,
            address(escrowObligation),
            amount,
            deadline
        );

        erc20TokenA.permit(
            alice,
            address(escrowObligation),
            amount,
            deadline,
            v,
            r,
            s
        );

        assertEq(
            erc20TokenA.allowance(alice, address(escrowObligation)),
            amount,
            "Permit should have set allowance"
        );
    }

    function test_RevertWhen_PermitExpired() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 askAmount = 200 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1;

        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            erc20TokenA,
            ALICE_PRIVATE_KEY,
            address(escrowObligation),
            bidAmount,
            deadline
        );

        vm.warp(block.timestamp + 2);

        vm.prank(alice);
        vm.expectRevert();
        barterUtils.permitAndBuyErc20ForErc20(
            address(erc20TokenA),
            bidAmount,
            address(erc20TokenB),
            askAmount,
            expiration,
            deadline,
            v,
            r,
            s
        );
    }

    function testPermitAndBuyWithErc20() public {
        uint256 amount = 100 * 10 ** 18;
        address arbiter = address(this);
        bytes memory demand = abi.encode("test demand");
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1;

        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            erc20TokenA,
            ALICE_PRIVATE_KEY,
            address(escrowObligation),
            amount,
            deadline
        );

        vm.prank(alice);
        bytes32 escrowId = barterUtils.permitAndBuyWithErc20(
            address(erc20TokenA),
            amount,
            arbiter,
            demand,
            expiration,
            deadline,
            v,
            r,
            s
        );

        assertNotEq(
            escrowId,
            bytes32(0),
            "Escrow attestation should be created"
        );
    }

    function testPermitAndPayWithErc20() public {
        uint256 amount = 100 * 10 ** 18;
        uint256 deadline = block.timestamp + 1;

        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            erc20TokenA,
            ALICE_PRIVATE_KEY,
            address(paymentObligation),
            amount,
            deadline
        );

        vm.prank(alice);
        bytes32 paymentId = barterUtils.permitAndPayWithErc20(
            address(erc20TokenA),
            amount,
            bob,
            deadline,
            v,
            r,
            s
        );

        assertNotEq(
            paymentId,
            bytes32(0),
            "Payment attestation should be created"
        );
    }

    function testPayErc20ForErc20() public {
        // First create a buy attestation
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 askAmount = 200 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc20TokenA.approve(address(escrowObligation), bidAmount);
        bytes32 buyAttestation = barterUtils.buyErc20ForErc20(
            address(erc20TokenA),
            bidAmount,
            address(erc20TokenB),
            askAmount,
            expiration
        );
        vm.stopPrank();

        // Now pay for it
        vm.startPrank(bob);
        erc20TokenB.approve(address(paymentObligation), askAmount);
        bytes32 sellAttestation = barterUtils.payErc20ForErc20(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            sellAttestation,
            bytes32(0),
            "Sell attestation should be created"
        );

        // Verify the payment went through
        assertEq(
            erc20TokenA.balanceOf(bob),
            bidAmount,
            "Bob should have received Token A"
        );
        assertEq(
            erc20TokenB.balanceOf(alice),
            askAmount,
            "Alice should have received Token B"
        );
    }

    function testPermitAndPayErc20ForErc20() public {
        // First create a buy attestation
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 askAmount = 200 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc20TokenA.approve(address(escrowObligation), bidAmount);
        bytes32 buyAttestation = barterUtils.buyErc20ForErc20(
            address(erc20TokenA),
            bidAmount,
            address(erc20TokenB),
            askAmount,
            expiration
        );
        vm.stopPrank();

        // Now pay for it using permit
        uint256 deadline = block.timestamp + 1;

        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            erc20TokenB,
            BOB_PRIVATE_KEY,
            address(paymentObligation),
            askAmount,
            deadline
        );

        vm.prank(bob);
        bytes32 sellAttestation = barterUtils.permitAndPayErc20ForErc20(
            buyAttestation,
            deadline,
            v,
            r,
            s
        );

        assertNotEq(
            sellAttestation,
            bytes32(0),
            "Sell attestation should be created"
        );

        // Verify the payment went through
        assertEq(
            erc20TokenA.balanceOf(bob),
            bidAmount,
            "Bob should have received Token A"
        );
        assertEq(
            erc20TokenB.balanceOf(alice),
            askAmount,
            "Alice should have received Token B"
        );
    }

    function test_RevertWhen_PaymentCollectionFails() public {
        // First create a buy attestation with a large amount
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 askAmount = 2000 * 10 ** 18; // More than Bob has
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc20TokenA.approve(address(escrowObligation), bidAmount);
        bytes32 buyAttestation = barterUtils.buyErc20ForErc20(
            address(erc20TokenA),
            bidAmount,
            address(erc20TokenB),
            askAmount,
            expiration
        );
        vm.stopPrank();

        // Now try to pay for it, but Bob doesn't have enough tokens
        vm.startPrank(bob);
        erc20TokenB.approve(address(paymentObligation), askAmount);
        vm.expectRevert(); // Should revert as the payment collection will fail
        barterUtils.payErc20ForErc20(buyAttestation);
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

    // Cross-token tests (ERC20 with ERC721/ERC1155)

    // Testing ERC721 with ERC20
    function testBuyERC721WithERC20() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 erc721TokenId = 1;
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc20TokenA.approve(address(escrowObligation), bidAmount);
        bytes32 buyAttestation = barterUtils.buyErc721WithErc20(
            address(erc20TokenA),
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

        assertEq(escrowData.token, address(erc20TokenA), "Token should match");
        assertEq(escrowData.amount, bidAmount, "Amount should match");
        assertEq(
            escrowData.arbiter,
            address(erc721Payment),
            "Arbiter should be ERC721 payment"
        );

        // Validate the demand data
        ERC721PaymentObligation.ObligationData memory demandData = abi.decode(
            escrowData.demand,
            (ERC721PaymentObligation.ObligationData)
        );

        assertEq(
            demandData.token,
            address(askErc721Token),
            "ERC721 token should match"
        );
        assertEq(
            demandData.tokenId,
            erc721TokenId,
            "ERC721 tokenId should match"
        );
    }

    function testPayERC20ForERC721() public {
        uint256 askAmount = 100 * 10 ** 18;
        uint256 erc721TokenId = 2; // Use a new token ID
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Mint ERC721 to Alice so she can sell it
        askErc721Token.mint(alice);

        // Alice creates sell order (escrows ERC721, wants ERC20)
        vm.startPrank(alice);
        askErc721Token.approve(address(erc721Escrow), erc721TokenId);

        // Create ERC721 escrow that demands ERC20 payment
        bytes32 sellAttestation = erc721Escrow.doObligationFor(
            ERC721EscrowObligation.ObligationData({
                token: address(askErc721Token),
                tokenId: erc721TokenId,
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC20PaymentObligation.ObligationData({
                        token: address(erc20TokenA),
                        amount: askAmount,
                        payee: alice
                    })
                )
            }),
            expiration,
            alice,
            alice
        );
        vm.stopPrank();

        // Transfer some tokens to Bob so he can pay
        erc20TokenA.transfer(bob, askAmount);

        // Bob fulfills the order by paying ERC20
        vm.startPrank(bob);
        erc20TokenA.approve(address(paymentObligation), askAmount);
        bytes32 payAttestation = barterUtils.payErc20ForErc721(sellAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify token transfers
        assertEq(
            erc20TokenA.balanceOf(alice),
            1000 * 10 ** 18 + askAmount,
            "Alice should receive ERC20 tokens"
        );
        assertEq(
            askErc721Token.ownerOf(erc721TokenId),
            bob,
            "Bob should receive ERC721 token"
        );
    }

    function testPermitAndBuyERC721WithERC20() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 erc721TokenId = 1;
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1 hours;

        // Create permit signature
        bytes32 permitHash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                erc20TokenA.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        keccak256(
                            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                        ),
                        alice,
                        address(escrowObligation),
                        bidAmount,
                        erc20TokenA.nonces(alice),
                        deadline
                    )
                )
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            ALICE_PRIVATE_KEY,
            permitHash
        );

        vm.prank(alice);
        bytes32 buyAttestation = barterUtils.permitAndBuyErc721WithErc20(
            address(erc20TokenA),
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

    function testPermitAndPayERC20ForERC721() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1 hours;

        // Mint ERC721 to Carol so she can sell it
        address carol = address(0xca201);
        uint256 erc721TokenIdForSale = askErc721Token.mint(carol);

        // Carol creates sell order (escrows ERC721, wants ERC20)
        vm.startPrank(carol);
        askErc721Token.approve(address(erc721Escrow), erc721TokenIdForSale);

        bytes32 sellAttestation = erc721Escrow.doObligationFor(
            ERC721EscrowObligation.ObligationData({
                token: address(askErc721Token),
                tokenId: erc721TokenIdForSale,
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC20PaymentObligation.ObligationData({
                        token: address(erc20TokenA),
                        amount: bidAmount,
                        payee: carol
                    })
                )
            }),
            expiration,
            carol,
            carol
        );
        vm.stopPrank();

        // Transfer tokens to Bob for payment
        erc20TokenA.transfer(bob, bidAmount);

        // Create permit signature for Bob's ERC20 payment
        bytes32 permitHash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                erc20TokenA.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        keccak256(
                            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                        ),
                        bob,
                        address(paymentObligation),
                        bidAmount,
                        erc20TokenA.nonces(bob),
                        deadline
                    )
                )
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(BOB_PRIVATE_KEY, permitHash);

        vm.prank(bob);
        bytes32 payAttestation = barterUtils.permitAndPayErc20ForErc721(
            sellAttestation,
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

        // Verify token transfers
        assertEq(
            erc20TokenA.balanceOf(carol),
            bidAmount,
            "Carol should receive ERC20 tokens"
        );
        assertEq(
            askErc721Token.ownerOf(erc721TokenIdForSale),
            bob,
            "Bob should receive ERC721 token"
        );
    }

    // Testing ERC1155 with ERC20
    function testBuyERC1155WithERC20() public {
        uint256 bidAmount = 50 * 10 ** 18;
        uint256 erc1155TokenId = 1;
        uint256 erc1155Amount = 10;
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc20TokenA.approve(address(escrowObligation), bidAmount);
        bytes32 buyAttestation = barterUtils.buyErc1155WithErc20(
            address(erc20TokenA),
            bidAmount,
            address(askErc1155Token),
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

    function testPayERC20ForERC1155() public {
        uint256 askAmount = 100 * 10 ** 18;
        uint256 erc1155TokenId = 1;
        uint256 erc1155Amount = 10;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Mint ERC1155 to Alice so she can sell it
        askErc1155Token.mint(alice, erc1155TokenId, erc1155Amount);

        // Alice creates sell order (escrows ERC1155, wants ERC20)
        vm.startPrank(alice);
        askErc1155Token.setApprovalForAll(address(erc1155Escrow), true);

        bytes32 sellAttestation = erc1155Escrow.doObligationFor(
            ERC1155EscrowObligation.ObligationData({
                token: address(askErc1155Token),
                tokenId: erc1155TokenId,
                amount: erc1155Amount,
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC20PaymentObligation.ObligationData({
                        token: address(erc20TokenA),
                        amount: askAmount,
                        payee: alice
                    })
                )
            }),
            expiration,
            alice,
            alice
        );
        vm.stopPrank();

        // Transfer some tokens to Bob so he can pay
        erc20TokenA.transfer(bob, askAmount);

        // Bob fulfills the order by paying ERC20
        vm.startPrank(bob);
        erc20TokenA.approve(address(paymentObligation), askAmount);
        bytes32 payAttestation = barterUtils.payErc20ForErc1155(
            sellAttestation
        );
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify token transfers
        assertEq(
            erc20TokenA.balanceOf(alice),
            1000 * 10 ** 18 + askAmount,
            "Alice should receive ERC20 tokens"
        );
        assertEq(
            askErc1155Token.balanceOf(bob, erc1155TokenId),
            100 + erc1155Amount,
            "Bob should receive ERC1155 tokens"
        );
    }

    // ============ Native Token Exchange Tests ============

    function testBuyEthWithErc20() public {
        uint256 erc20Amount = 100 * 10 ** 18;
        uint256 ethAmount = 1 ether;
        uint64 expiration = uint64(block.timestamp + 1 hours);

        vm.startPrank(alice);

        // Approve the escrow contract
        erc20TokenA.approve(address(escrowObligation), erc20Amount);

        // Create buy order (offering ERC20 for ETH)
        bytes32 escrowId = barterUtils.buyEthWithErc20(
            address(erc20TokenA),
            erc20Amount,
            ethAmount,
            expiration
        );

        vm.stopPrank();

        // Verify the escrow was created
        assertTrue(escrowId != bytes32(0));

        // Bob fulfills the order by sending ETH
        vm.startPrank(bob);

        // Bob needs to create a native token payment obligation
        bytes32 paymentId = nativePayment.doObligation{value: ethAmount}(
            NativeTokenPaymentObligation.ObligationData({
                amount: ethAmount,
                payee: alice
            })
        );

        // Collect the escrow through the ERC20 escrow contract
        assertTrue(escrowObligation.collectEscrow(escrowId, paymentId));

        vm.stopPrank();

        // Verify the swap completed
        assertEq(alice.balance, ethAmount);
        assertEq(erc20TokenA.balanceOf(bob), erc20Amount);
    }

    function testPayErc20ForEth() public {
        uint256 erc20Amount = 100 * 10 ** 18;
        uint256 ethAmount = 1 ether;
        uint64 expiration = uint64(block.timestamp + 1 hours);

        // Bob creates an escrow offering ETH for ERC20
        vm.startPrank(bob);

        bytes32 escrowId = nativeEscrow.doObligation{value: ethAmount}(
            NativeTokenEscrowObligation.ObligationData({
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC20PaymentObligation.ObligationData({
                        token: address(erc20TokenA),
                        amount: erc20Amount,
                        payee: bob
                    })
                ),
                amount: ethAmount
            }),
            expiration
        );

        vm.stopPrank();

        // Alice fulfills by paying ERC20
        vm.startPrank(alice);

        erc20TokenA.approve(address(paymentObligation), erc20Amount);

        bytes32 paymentId = barterUtils.payErc20ForEth(escrowId);

        vm.stopPrank();

        // Verify the swap completed
        assertEq(alice.balance, ethAmount);
        assertEq(erc20TokenA.balanceOf(bob), erc20Amount);
        assertTrue(paymentId != bytes32(0));
    }

    function testPermitAndBuyEthWithErc20() public {
        uint256 erc20Amount = 100 * 10 ** 18;
        uint256 ethAmount = 1 ether;
        uint64 expiration = uint64(block.timestamp + 1 hours);
        uint256 deadline = block.timestamp + 1 hours;

        // Create permit signature
        bytes32 permitHash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                erc20TokenA.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        keccak256(
                            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                        ),
                        alice,
                        address(escrowObligation),
                        erc20Amount,
                        erc20TokenA.nonces(alice),
                        deadline
                    )
                )
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            ALICE_PRIVATE_KEY,
            permitHash
        );

        vm.prank(alice);

        // Create buy order with permit
        bytes32 escrowId = barterUtils.permitAndBuyEthWithErc20(
            address(erc20TokenA),
            erc20Amount,
            ethAmount,
            expiration,
            deadline,
            v,
            r,
            s
        );

        // Verify the escrow was created
        assertTrue(escrowId != bytes32(0));
        assertEq(erc20TokenA.allowance(alice, address(escrowObligation)), 0); // Permit was used
    }

    function testPermitAndPayErc20ForEth() public {
        uint256 erc20Amount = 100 * 10 ** 18;
        uint256 ethAmount = 1 ether;
        uint64 expiration = uint64(block.timestamp + 1 hours);
        uint256 deadline = block.timestamp + 1 hours;

        // Bob creates an escrow offering ETH for ERC20
        vm.startPrank(bob);

        bytes32 escrowId = nativeEscrow.doObligation{value: ethAmount}(
            NativeTokenEscrowObligation.ObligationData({
                arbiter: address(paymentObligation),
                demand: abi.encode(
                    ERC20PaymentObligation.ObligationData({
                        token: address(erc20TokenA),
                        amount: erc20Amount,
                        payee: bob
                    })
                ),
                amount: ethAmount
            }),
            expiration
        );

        vm.stopPrank();

        // Create permit signature for Alice
        bytes32 permitHash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                erc20TokenA.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        keccak256(
                            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                        ),
                        alice,
                        address(paymentObligation),
                        erc20Amount,
                        erc20TokenA.nonces(alice),
                        deadline
                    )
                )
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            ALICE_PRIVATE_KEY,
            permitHash
        );

        vm.prank(alice);

        // Fulfill with permit
        bytes32 paymentId = barterUtils.permitAndPayErc20ForEth(
            escrowId,
            deadline,
            v,
            r,
            s
        );

        // Verify the swap completed
        assertEq(alice.balance, ethAmount);
        assertEq(erc20TokenA.balanceOf(bob), erc20Amount);
        assertTrue(paymentId != bytes32(0));
        assertEq(erc20TokenA.allowance(alice, address(paymentObligation)), 0); // Permit was used
    }
}
