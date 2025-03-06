// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {TokenBundleEscrowObligation} from "../../src/Statements/TokenBundleEscrowObligation.sol";
import {TokenBundlePaymentObligation} from "../../src/Statements/TokenBundlePaymentObligation.sol";
import {TokenBundleBarterUtils} from "../../src/Utils/TokenBundleBarterUtils.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

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

contract TokenBundleBarterUtilsUnitTest is Test {
    TokenBundleEscrowObligation public bundleEscrow;
    TokenBundlePaymentObligation public bundlePayment;
    TokenBundleBarterUtils public barterUtils;

    MockERC20Permit public erc20TokenA;
    MockERC20Permit public erc20TokenB;
    MockERC721 public nftTokenA;
    MockERC721 public nftTokenB;
    MockERC1155 public multiTokenA;
    MockERC1155 public multiTokenB;

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
    uint256 public aliceNftId;
    uint256 public bobNftId;
    uint256 public multiTokenIdA = 1;
    uint256 public multiTokenAmountA = 100;
    uint256 public multiTokenIdB = 2;
    uint256 public multiTokenAmountB = 50;
    uint256 public erc20AmountA = 500 * 10**18;
    uint256 public erc20AmountB = 250 * 10**18;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        // Deploy mock tokens
        erc20TokenA = new MockERC20Permit("Token A", "TKNA");
        erc20TokenB = new MockERC20Permit("Token B", "TKNB");
        nftTokenA = new MockERC721();
        nftTokenB = new MockERC721();
        multiTokenA = new MockERC1155();
        multiTokenB = new MockERC1155();

        // Deploy statements
        bundleEscrow = new TokenBundleEscrowObligation(eas, schemaRegistry);
        bundlePayment = new TokenBundlePaymentObligation(eas, schemaRegistry);

        // Deploy barter utils contract
        barterUtils = new TokenBundleBarterUtils(
            eas,
            bundleEscrow,
            bundlePayment
        );

        // Setup initial token balances
        // Alice's tokens
        erc20TokenA.transfer(alice, erc20AmountA);
        vm.prank(alice);
        aliceNftId = nftTokenA.mint(alice);
        multiTokenA.mint(alice, multiTokenIdA, multiTokenAmountA);
        
        // Bob's tokens
        erc20TokenB.transfer(bob, erc20AmountB);
        vm.prank(bob);
        bobNftId = nftTokenB.mint(bob);
        multiTokenB.mint(bob, multiTokenIdB, multiTokenAmountB);
    }

    // Helper function to create a bundle for Alice
    function createAliceBundle() internal view returns (TokenBundleEscrowObligation.StatementData memory) {
        TokenBundleEscrowObligation.StatementData memory bundle = TokenBundleEscrowObligation.StatementData({
            erc20Tokens: new address[](1),
            erc20Amounts: new uint256[](1),
            erc721Tokens: new address[](1),
            erc721TokenIds: new uint256[](1),
            erc1155Tokens: new address[](1),
            erc1155TokenIds: new uint256[](1),
            erc1155Amounts: new uint256[](1),
            arbiter: address(0), // Will be set by the barter functions
            demand: bytes("") // Will be set by the barter functions
        });
        
        bundle.erc20Tokens[0] = address(erc20TokenA);
        bundle.erc20Amounts[0] = erc20AmountA;
        bundle.erc721Tokens[0] = address(nftTokenA);
        bundle.erc721TokenIds[0] = aliceNftId;
        bundle.erc1155Tokens[0] = address(multiTokenA);
        bundle.erc1155TokenIds[0] = multiTokenIdA;
        bundle.erc1155Amounts[0] = multiTokenAmountA;
        
        return bundle;
    }
    
    // Helper function to create a bundle for Bob as payment
    function createBobBundle() internal view returns (TokenBundlePaymentObligation.StatementData memory) {
        TokenBundlePaymentObligation.StatementData memory bundle = TokenBundlePaymentObligation.StatementData({
            erc20Tokens: new address[](1),
            erc20Amounts: new uint256[](1),
            erc721Tokens: new address[](1),
            erc721TokenIds: new uint256[](1),
            erc1155Tokens: new address[](1),
            erc1155TokenIds: new uint256[](1),
            erc1155Amounts: new uint256[](1),
            payee: alice
        });
        
        bundle.erc20Tokens[0] = address(erc20TokenB);
        bundle.erc20Amounts[0] = erc20AmountB;
        bundle.erc721Tokens[0] = address(nftTokenB);
        bundle.erc721TokenIds[0] = bobNftId;
        bundle.erc1155Tokens[0] = address(multiTokenB);
        bundle.erc1155TokenIds[0] = multiTokenIdB;
        bundle.erc1155Amounts[0] = multiTokenAmountB;
        
        return bundle;
    }

    // Helper function to get permit signature
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

    function testBuyBundleForBundle() public {
        uint64 expiration = uint64(block.timestamp + 1 days);
        
        TokenBundleEscrowObligation.StatementData memory aliceBundle = createAliceBundle();
        TokenBundlePaymentObligation.StatementData memory bobBundle = createBobBundle();

        // Approve tokens
        vm.startPrank(alice);
        erc20TokenA.approve(address(bundleEscrow), erc20AmountA);
        nftTokenA.approve(address(bundleEscrow), aliceNftId);
        multiTokenA.setApprovalForAll(address(bundleEscrow), true);
        
        bytes32 buyAttestation = barterUtils.buyBundleForBundle(
            aliceBundle,
            bobBundle,
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
        TokenBundleEscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (TokenBundleEscrowObligation.StatementData)
        );
        
        assertEq(escrowData.erc20Tokens[0], address(erc20TokenA), "ERC20 token should match");
        assertEq(escrowData.erc20Amounts[0], erc20AmountA, "ERC20 amount should match");
        assertEq(escrowData.erc721Tokens[0], address(nftTokenA), "ERC721 token should match");
        assertEq(escrowData.erc721TokenIds[0], aliceNftId, "ERC721 tokenId should match");
        assertEq(escrowData.erc1155Tokens[0], address(multiTokenA), "ERC1155 token should match");
        assertEq(escrowData.arbiter, address(bundlePayment), "Arbiter should be bundlePayment");
        
        // Extract the demand data
        TokenBundlePaymentObligation.StatementData memory demandData = abi.decode(
            escrowData.demand,
            (TokenBundlePaymentObligation.StatementData)
        );
        
        assertEq(demandData.erc20Tokens[0], address(erc20TokenB), "Demand ERC20 token should match");
        assertEq(demandData.erc721Tokens[0], address(nftTokenB), "Demand ERC721 token should match");
        assertEq(demandData.erc1155Tokens[0], address(multiTokenB), "Demand ERC1155 token should match");
        assertEq(demandData.payee, alice, "Payee should be Alice");

        // Verify that Alice's tokens are now in escrow
        assertEq(erc20TokenA.balanceOf(address(bundleEscrow)), erc20AmountA, "ERC20 tokens should be in escrow");
        assertEq(nftTokenA.ownerOf(aliceNftId), address(bundleEscrow), "NFT should be in escrow");
        assertEq(
            multiTokenA.balanceOf(address(bundleEscrow), multiTokenIdA),
            multiTokenAmountA,
            "ERC1155 tokens should be in escrow"
        );
    }

    function testPayBundleForBundle() public {
        uint64 expiration = uint64(block.timestamp + 1 days);
        
        TokenBundleEscrowObligation.StatementData memory aliceBundle = createAliceBundle();
        TokenBundlePaymentObligation.StatementData memory bobBundle = createBobBundle();

        // Alice creates bid
        vm.startPrank(alice);
        erc20TokenA.approve(address(bundleEscrow), erc20AmountA);
        nftTokenA.approve(address(bundleEscrow), aliceNftId);
        multiTokenA.setApprovalForAll(address(bundleEscrow), true);
        bytes32 buyAttestation = barterUtils.buyBundleForBundle(
            aliceBundle,
            bobBundle,
            expiration
        );
        vm.stopPrank();

        // Verify initial escrow state
        assertEq(erc20TokenA.balanceOf(address(bundleEscrow)), erc20AmountA, "ERC20 tokens should be in escrow");
        assertEq(nftTokenA.ownerOf(aliceNftId), address(bundleEscrow), "NFT should be in escrow");
        assertEq(
            multiTokenA.balanceOf(address(bundleEscrow), multiTokenIdA),
            multiTokenAmountA,
            "ERC1155 tokens should be in escrow"
        );

        // Bob fulfills Alice's bid
        vm.startPrank(bob);
        erc20TokenB.approve(address(bundlePayment), erc20AmountB);
        nftTokenB.approve(address(bundlePayment), bobNftId);
        multiTokenB.setApprovalForAll(address(bundlePayment), true);
        bytes32 payAttestation = barterUtils.payBundleForBundle(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        // Alice should have Bob's tokens
        assertEq(erc20TokenB.balanceOf(alice), erc20AmountB, "Alice should have Bob's ERC20 tokens");
        assertEq(nftTokenB.ownerOf(bobNftId), alice, "Alice should have Bob's NFT");
        assertEq(
            multiTokenB.balanceOf(alice, multiTokenIdB),
            multiTokenAmountB,
            "Alice should have Bob's ERC1155 tokens"
        );
        
        // Bob should have Alice's tokens
        assertEq(erc20TokenA.balanceOf(bob), erc20AmountA, "Bob should have Alice's ERC20 tokens");
        assertEq(nftTokenA.ownerOf(aliceNftId), bob, "Bob should have Alice's NFT");
        assertEq(
            multiTokenA.balanceOf(bob, multiTokenIdA),
            multiTokenAmountA,
            "Bob should have Alice's ERC1155 tokens"
        );
        
        // Escrow should be empty
        assertEq(erc20TokenA.balanceOf(address(bundleEscrow)), 0, "Escrow should have no ERC20 tokens left");
        assertEq(
            multiTokenA.balanceOf(address(bundleEscrow), multiTokenIdA),
            0,
            "Escrow should have no ERC1155 tokens left"
        );
    }

    function testPermitAndEscrowBundle() public {
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1 days;
        
        TokenBundleEscrowObligation.StatementData memory aliceBundle = createAliceBundle();
        
        // Create permit signature for Alice's ERC20 token
        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            erc20TokenA,
            ALICE_PRIVATE_KEY,
            address(bundleEscrow),
            erc20AmountA,
            deadline
        );
        
        TokenBundleBarterUtils.ERC20PermitSignature[] memory permits = new TokenBundleBarterUtils.ERC20PermitSignature[](1);
        permits[0] = TokenBundleBarterUtils.ERC20PermitSignature({
            v: v,
            r: r,
            s: s,
            deadline: deadline
        });

        // Alice creates escrow with permit
        vm.startPrank(alice);
        // Still need to approve NFT and ERC1155
        nftTokenA.approve(address(bundleEscrow), aliceNftId);
        multiTokenA.setApprovalForAll(address(bundleEscrow), true);
        
        bytes32 escrowAttestation = barterUtils.permitAndEscrowBundle(
            aliceBundle,
            expiration,
            permits
        );
        vm.stopPrank();

        assertNotEq(
            escrowAttestation,
            bytes32(0),
            "Escrow attestation should be created"
        );

        // Verify that Alice's tokens are now in escrow
        assertEq(erc20TokenA.balanceOf(address(bundleEscrow)), erc20AmountA, "ERC20 tokens should be in escrow");
        assertEq(nftTokenA.ownerOf(aliceNftId), address(bundleEscrow), "NFT should be in escrow");
        assertEq(
            multiTokenA.balanceOf(address(bundleEscrow), multiTokenIdA),
            multiTokenAmountA,
            "ERC1155 tokens should be in escrow"
        );
    }

    function testPermitAndPayBundle() public {
        // No expiration needed for this test
        uint256 deadline = block.timestamp + 1 days;
        
        TokenBundlePaymentObligation.StatementData memory bobBundle = createBobBundle();
        
        // Create permit signature for Bob's ERC20 token
        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            erc20TokenB,
            BOB_PRIVATE_KEY,
            address(bundlePayment),
            erc20AmountB,
            deadline
        );
        
        TokenBundleBarterUtils.ERC20PermitSignature[] memory permits = new TokenBundleBarterUtils.ERC20PermitSignature[](1);
        permits[0] = TokenBundleBarterUtils.ERC20PermitSignature({
            v: v,
            r: r,
            s: s,
            deadline: deadline
        });

        // Bob creates payment with permit
        vm.startPrank(bob);
        // Still need to approve NFT and ERC1155
        nftTokenB.approve(address(bundlePayment), bobNftId);
        multiTokenB.setApprovalForAll(address(bundlePayment), true);
        
        bytes32 payAttestation = barterUtils.permitAndPayBundle(
            bobBundle,
            permits
        );
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Payment attestation should be created"
        );

        // Verify the attestation
        Attestation memory payment = eas.getAttestation(payAttestation);
        TokenBundlePaymentObligation.StatementData memory paymentData = abi.decode(
            payment.data,
            (TokenBundlePaymentObligation.StatementData)
        );
        
        assertEq(paymentData.erc20Tokens[0], address(erc20TokenB), "ERC20 token should match");
        assertEq(paymentData.erc20Amounts[0], erc20AmountB, "ERC20 amount should match");
        assertEq(paymentData.erc721Tokens[0], address(nftTokenB), "ERC721 token should match");
        assertEq(paymentData.payee, alice, "Payee should match");
    }

    function testPermitAndBuyBundleForBundle() public {
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1 days;
        
        TokenBundleEscrowObligation.StatementData memory aliceBundle = createAliceBundle();
        TokenBundlePaymentObligation.StatementData memory bobBundle = createBobBundle();
        
        // Create permit signature for Alice's ERC20 token
        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            erc20TokenA,
            ALICE_PRIVATE_KEY,
            address(bundleEscrow),
            erc20AmountA,
            deadline
        );
        
        TokenBundleBarterUtils.ERC20PermitSignature[] memory permits = new TokenBundleBarterUtils.ERC20PermitSignature[](1);
        permits[0] = TokenBundleBarterUtils.ERC20PermitSignature({
            v: v,
            r: r,
            s: s,
            deadline: deadline
        });

        // Alice creates bid with permit
        vm.startPrank(alice);
        // Still need to approve NFT and ERC1155
        nftTokenA.approve(address(bundleEscrow), aliceNftId);
        multiTokenA.setApprovalForAll(address(bundleEscrow), true);
        
        bytes32 buyAttestation = barterUtils.permitAndEscrowBundleForBundle(
            aliceBundle,
            bobBundle,
            expiration,
            permits
        );
        vm.stopPrank();

        assertNotEq(
            buyAttestation,
            bytes32(0),
            "Buy attestation should be created"
        );

        // Verify that Alice's tokens are now in escrow
        assertEq(erc20TokenA.balanceOf(address(bundleEscrow)), erc20AmountA, "ERC20 tokens should be in escrow");
        assertEq(nftTokenA.ownerOf(aliceNftId), address(bundleEscrow), "NFT should be in escrow");
        assertEq(
            multiTokenA.balanceOf(address(bundleEscrow), multiTokenIdA),
            multiTokenAmountA,
            "ERC1155 tokens should be in escrow"
        );
    }

    function testPermitAndPayBundleForBundle() public {
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1 days;
        
        TokenBundleEscrowObligation.StatementData memory aliceBundle = createAliceBundle();
        TokenBundlePaymentObligation.StatementData memory bobBundle = createBobBundle();

        // Alice creates bid
        vm.startPrank(alice);
        erc20TokenA.approve(address(bundleEscrow), erc20AmountA);
        nftTokenA.approve(address(bundleEscrow), aliceNftId);
        multiTokenA.setApprovalForAll(address(bundleEscrow), true);
        bytes32 buyAttestation = barterUtils.buyBundleForBundle(
            aliceBundle,
            bobBundle,
            expiration
        );
        vm.stopPrank();
        
        // Create permit signature for Bob's ERC20 token
        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            erc20TokenB,
            BOB_PRIVATE_KEY,
            address(bundlePayment),
            erc20AmountB,
            deadline
        );
        
        TokenBundleBarterUtils.ERC20PermitSignature[] memory permits = new TokenBundleBarterUtils.ERC20PermitSignature[](1);
        permits[0] = TokenBundleBarterUtils.ERC20PermitSignature({
            v: v,
            r: r,
            s: s,
            deadline: deadline
        });

        // Bob fulfills Alice's bid with permit
        vm.startPrank(bob);
        // Still need to approve NFT and ERC1155
        nftTokenB.approve(address(bundlePayment), bobNftId);
        multiTokenB.setApprovalForAll(address(bundlePayment), true);
        
        bytes32 payAttestation = barterUtils.permitAndPayBundleForBundle(
            buyAttestation,
            permits
        );
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        // Alice should have Bob's tokens
        assertEq(erc20TokenB.balanceOf(alice), erc20AmountB, "Alice should have Bob's ERC20 tokens");
        assertEq(nftTokenB.ownerOf(bobNftId), alice, "Alice should have Bob's NFT");
        assertEq(
            multiTokenB.balanceOf(alice, multiTokenIdB),
            multiTokenAmountB,
            "Alice should have Bob's ERC1155 tokens"
        );
        
        // Bob should have Alice's tokens
        assertEq(erc20TokenA.balanceOf(bob), erc20AmountA, "Bob should have Alice's ERC20 tokens");
        assertEq(nftTokenA.ownerOf(aliceNftId), bob, "Bob should have Alice's NFT");
        assertEq(
            multiTokenA.balanceOf(bob, multiTokenIdA),
            multiTokenAmountA,
            "Bob should have Alice's ERC1155 tokens"
        );
    }

    // Error test cases
    function test_RevertWhen_TokenNotApproved() public {
        uint64 expiration = uint64(block.timestamp + 1 days);
        
        TokenBundleEscrowObligation.StatementData memory aliceBundle = createAliceBundle();
        TokenBundlePaymentObligation.StatementData memory bobBundle = createBobBundle();

        // Alice tries to make bid without approving tokens
        vm.startPrank(alice);
        vm.expectRevert(); // ERC20: insufficient allowance
        barterUtils.buyBundleForBundle(
            aliceBundle,
            bobBundle,
            expiration
        );
        vm.stopPrank();
    }

    function test_RevertWhen_PaymentFails() public {
        uint64 expiration = uint64(block.timestamp + 1 days);
        
        TokenBundleEscrowObligation.StatementData memory aliceBundle = createAliceBundle();
        TokenBundlePaymentObligation.StatementData memory bobBundle = createBobBundle();

        // Alice creates bid
        vm.startPrank(alice);
        erc20TokenA.approve(address(bundleEscrow), erc20AmountA);
        nftTokenA.approve(address(bundleEscrow), aliceNftId);
        multiTokenA.setApprovalForAll(address(bundleEscrow), true);
        bytes32 buyAttestation = barterUtils.buyBundleForBundle(
            aliceBundle,
            bobBundle,
            expiration
        );
        vm.stopPrank();

        // Bob tries to fulfill without approving tokens
        vm.startPrank(bob);
        vm.expectRevert(); // Expected to revert due to missing approvals
        barterUtils.payBundleForBundle(buyAttestation);
        vm.stopPrank();
    }

    function test_RevertWhen_InvalidPermitSignatureLength() public {
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1 days;
        
        TokenBundleEscrowObligation.StatementData memory aliceBundle = createAliceBundle();
        
        // We don't need the result of the permit signature for this test
        // Just need to call the function to avoid compiler warnings
        _getPermitSignature(
            erc20TokenA,
            ALICE_PRIVATE_KEY,
            address(bundleEscrow),
            erc20AmountA,
            deadline
        );
        
        // No need to create valid permits, we're testing the error case
        TokenBundleBarterUtils.ERC20PermitSignature[] memory permits = new TokenBundleBarterUtils.ERC20PermitSignature[](0);

        // Alice tries to create escrow with invalid permit length
        vm.startPrank(alice);
        vm.expectRevert(TokenBundleBarterUtils.InvalidSignatureLength.selector);
        barterUtils.permitAndEscrowBundle(
            aliceBundle,
            expiration,
            permits
        );
        vm.stopPrank();
    }

    function test_RevertWhen_BidExpired() public {
        // Create a bid with short expiration
        uint64 expiration = uint64(block.timestamp + 10 minutes);
        
        TokenBundleEscrowObligation.StatementData memory aliceBundle = createAliceBundle();
        TokenBundlePaymentObligation.StatementData memory bobBundle = createBobBundle();

        // Alice creates bid
        vm.startPrank(alice);
        erc20TokenA.approve(address(bundleEscrow), erc20AmountA);
        nftTokenA.approve(address(bundleEscrow), aliceNftId);
        multiTokenA.setApprovalForAll(address(bundleEscrow), true);
        bytes32 buyAttestation = barterUtils.buyBundleForBundle(
            aliceBundle,
            bobBundle,
            expiration
        );
        vm.stopPrank();

        // Warp time past expiration
        vm.warp(block.timestamp + 20 minutes);

        // Bob tries to fulfill expired bid
        vm.startPrank(bob);
        erc20TokenB.approve(address(bundlePayment), erc20AmountB);
        nftTokenB.approve(address(bundlePayment), bobNftId);
        multiTokenB.setApprovalForAll(address(bundlePayment), true);
        vm.expectRevert();
        barterUtils.payBundleForBundle(buyAttestation);
        vm.stopPrank();
    }
}