// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {TokenBundleEscrowObligation2} from "@src/obligations/TokenBundleEscrowObligation2.sol";
import {TokenBundlePaymentObligation2} from "@src/obligations/TokenBundlePaymentObligation2.sol";
import {TokenBundleBarterUtils} from "@src/utils/TokenBundleBarterUtils.sol";
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

contract TokenBundleBarterUtilsUnitTest is Test {
    TokenBundleEscrowObligation2 public bundleEscrow;
    TokenBundlePaymentObligation2 public bundlePayment;
    TokenBundleBarterUtils public barterUtils;

    MockERC20Permit public erc20TokenA;
    MockERC20Permit public erc20TokenB;
    MockERC721 public erc721TokenA;
    MockERC721 public erc721TokenB;
    MockERC1155 public erc1155TokenA;
    MockERC1155 public erc1155TokenB;

    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    uint256 internal constant ALICE_PRIVATE_KEY = 0xa11ce;
    uint256 internal constant BOB_PRIVATE_KEY = 0xb0b;

    address public alice;
    address public bob;

    // Token parameters
    uint256 public aliceErc721Id;
    uint256 public bobErc721Id;
    uint256 public erc1155TokenIdA = 1;
    uint256 public erc1155TokenAmountA = 100;
    uint256 public erc1155TokenIdB = 2;
    uint256 public erc1155TokenAmountB = 50;
    uint256 public erc20AmountA = 500 * 10 ** 18;
    uint256 public erc20AmountB = 250 * 10 ** 18;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        // Deploy mock tokens
        erc20TokenA = new MockERC20Permit("Token A", "TKNA");
        erc20TokenB = new MockERC20Permit("Token B", "TKNB");
        erc721TokenA = new MockERC721();
        erc721TokenB = new MockERC721();
        erc1155TokenA = new MockERC1155();
        erc1155TokenB = new MockERC1155();

        // Deploy obligations
        bundleEscrow = new TokenBundleEscrowObligation2(eas, schemaRegistry);
        bundlePayment = new TokenBundlePaymentObligation2(eas, schemaRegistry);

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
        aliceErc721Id = erc721TokenA.mint(alice);
        erc1155TokenA.mint(alice, erc1155TokenIdA, erc1155TokenAmountA);

        // Bob's tokens
        erc20TokenB.transfer(bob, erc20AmountB);
        vm.prank(bob);
        bobErc721Id = erc721TokenB.mint(bob);
        erc1155TokenB.mint(bob, erc1155TokenIdB, erc1155TokenAmountB);
    }

    // Helper function to create a bundle for Alice
    function createAliceBundle()
        internal
        view
        returns (TokenBundleEscrowObligation2.ObligationData memory)
    {
        TokenBundleEscrowObligation2.ObligationData memory bundle = TokenBundleEscrowObligation2
            .ObligationData({
                arbiter: address(0), // Will be set by the barter functions
                demand: "", // Will be set by the barter functions
                nativeAmount: 0,
                erc20Tokens: new address[](1),
                erc20Amounts: new uint256[](1),
                erc721Tokens: new address[](1),
                erc721TokenIds: new uint256[](1),
                erc1155Tokens: new address[](1),
                erc1155TokenIds: new uint256[](1),
                erc1155Amounts: new uint256[](1)
            });

        bundle.erc20Tokens[0] = address(erc20TokenA);
        bundle.erc20Amounts[0] = erc20AmountA;
        bundle.erc721Tokens[0] = address(erc721TokenA);
        bundle.erc721TokenIds[0] = aliceErc721Id;
        bundle.erc1155Tokens[0] = address(erc1155TokenA);
        bundle.erc1155TokenIds[0] = erc1155TokenIdA;
        bundle.erc1155Amounts[0] = erc1155TokenAmountA;

        return bundle;
    }

    // Helper function to create a bundle for Bob as payment
    function createBobBundle()
        internal
        view
        returns (TokenBundlePaymentObligation2.ObligationData memory)
    {
        TokenBundlePaymentObligation2.ObligationData
            memory bundle = TokenBundlePaymentObligation2.ObligationData({
                nativeAmount: 0,
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
        bundle.erc721Tokens[0] = address(erc721TokenB);
        bundle.erc721TokenIds[0] = bobErc721Id;
        bundle.erc1155Tokens[0] = address(erc1155TokenB);
        bundle.erc1155TokenIds[0] = erc1155TokenIdB;
        bundle.erc1155Amounts[0] = erc1155TokenAmountB;

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

        TokenBundleEscrowObligation2.ObligationData
            memory aliceBundle = createAliceBundle();
        TokenBundlePaymentObligation2.ObligationData
            memory bobBundle = createBobBundle();

        // Approve tokens
        vm.startPrank(alice);
        erc20TokenA.approve(address(bundleEscrow), erc20AmountA);
        erc721TokenA.approve(address(bundleEscrow), aliceErc721Id);
        erc1155TokenA.setApprovalForAll(address(bundleEscrow), true);

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
        TokenBundleEscrowObligation2.ObligationData memory escrowData = abi
            .decode(bid.data, (TokenBundleEscrowObligation2.ObligationData));

        assertEq(
            escrowData.erc20Tokens[0],
            address(erc20TokenA),
            "ERC20 token should match"
        );
        assertEq(
            escrowData.erc20Amounts[0],
            erc20AmountA,
            "ERC20 amount should match"
        );
        assertEq(
            escrowData.erc721Tokens[0],
            address(erc721TokenA),
            "ERC721 token should match"
        );
        assertEq(
            escrowData.erc721TokenIds[0],
            aliceErc721Id,
            "ERC721 tokenId should match"
        );
        assertEq(
            escrowData.erc1155Tokens[0],
            address(erc1155TokenA),
            "ERC1155 token should match"
        );
        assertEq(
            escrowData.arbiter,
            address(bundlePayment),
            "Arbiter should be bundlePayment"
        );

        // Extract the demand data
        TokenBundlePaymentObligation2.ObligationData memory demandData = abi
            .decode(
                escrowData.demand,
                (TokenBundlePaymentObligation2.ObligationData)
            );

        assertEq(
            demandData.erc20Tokens[0],
            address(erc20TokenB),
            "Demand ERC20 token should match"
        );
        assertEq(
            demandData.erc721Tokens[0],
            address(erc721TokenB),
            "Demand ERC721 token should match"
        );
        assertEq(
            demandData.erc1155Tokens[0],
            address(erc1155TokenB),
            "Demand ERC1155 token should match"
        );
        assertEq(demandData.payee, alice, "Payee should be Alice");

        // Verify that Alice's tokens are now in escrow
        assertEq(
            erc20TokenA.balanceOf(address(bundleEscrow)),
            erc20AmountA,
            "ERC20 tokens should be in escrow"
        );
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            address(bundleEscrow),
            "ERC721 should be in escrow"
        );
        assertEq(
            erc1155TokenA.balanceOf(address(bundleEscrow), erc1155TokenIdA),
            erc1155TokenAmountA,
            "ERC1155 tokens should be in escrow"
        );
    }

    function testPayBundleForBundle() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        TokenBundleEscrowObligation2.ObligationData
            memory aliceBundle = createAliceBundle();
        TokenBundlePaymentObligation2.ObligationData
            memory bobBundle = createBobBundle();

        // Alice creates bid
        vm.startPrank(alice);
        erc20TokenA.approve(address(bundleEscrow), erc20AmountA);
        erc721TokenA.approve(address(bundleEscrow), aliceErc721Id);
        erc1155TokenA.setApprovalForAll(address(bundleEscrow), true);
        bytes32 buyAttestation = barterUtils.buyBundleForBundle(
            aliceBundle,
            bobBundle,
            expiration
        );
        vm.stopPrank();

        // Verify initial escrow state
        assertEq(
            erc20TokenA.balanceOf(address(bundleEscrow)),
            erc20AmountA,
            "ERC20 tokens should be in escrow"
        );
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            address(bundleEscrow),
            "ERC721 should be in escrow"
        );
        assertEq(
            erc1155TokenA.balanceOf(address(bundleEscrow), erc1155TokenIdA),
            erc1155TokenAmountA,
            "ERC1155 tokens should be in escrow"
        );

        // Bob fulfills Alice's bid
        vm.startPrank(bob);
        erc20TokenB.approve(address(bundlePayment), erc20AmountB);
        erc721TokenB.approve(address(bundlePayment), bobErc721Id);
        erc1155TokenB.setApprovalForAll(address(bundlePayment), true);
        bytes32 payAttestation = barterUtils.payBundleForBundle(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        // Alice should have Bob's tokens
        assertEq(
            erc20TokenB.balanceOf(alice),
            erc20AmountB,
            "Alice should have Bob's ERC20 tokens"
        );
        assertEq(
            erc721TokenB.ownerOf(bobErc721Id),
            alice,
            "Alice should have Bob's ERC721 token"
        );
        assertEq(
            erc1155TokenB.balanceOf(alice, erc1155TokenIdB),
            erc1155TokenAmountB,
            "Alice should have Bob's ERC1155 tokens"
        );

        // Bob should have Alice's tokens
        assertEq(
            erc20TokenA.balanceOf(bob),
            erc20AmountA,
            "Bob should have Alice's ERC20 tokens"
        );
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            bob,
            "Bob should have Alice's ERC721 token"
        );
        assertEq(
            erc1155TokenA.balanceOf(bob, erc1155TokenIdA),
            erc1155TokenAmountA,
            "Bob should have Alice's ERC1155 tokens"
        );

        // Escrow should be empty
        assertEq(
            erc20TokenA.balanceOf(address(bundleEscrow)),
            0,
            "Escrow should have no ERC20 tokens left"
        );
        assertEq(
            erc1155TokenA.balanceOf(address(bundleEscrow), erc1155TokenIdA),
            0,
            "Escrow should have no ERC1155 tokens left"
        );
    }

    function testPermitAndEscrowBundle() public {
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1 days;

        TokenBundleEscrowObligation2.ObligationData
            memory aliceBundle = createAliceBundle();

        // Create permit signature for Alice's ERC20 token
        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            erc20TokenA,
            ALICE_PRIVATE_KEY,
            address(bundleEscrow),
            erc20AmountA,
            deadline
        );

        TokenBundleBarterUtils.ERC20PermitSignature[]
            memory permits = new TokenBundleBarterUtils.ERC20PermitSignature[](
                1
            );
        permits[0] = TokenBundleBarterUtils.ERC20PermitSignature({
            v: v,
            r: r,
            s: s,
            deadline: deadline
        });

        // Alice creates escrow with permit
        vm.startPrank(alice);
        // Still need to approve ERC721 and ERC1155
        erc721TokenA.approve(address(bundleEscrow), aliceErc721Id);
        erc1155TokenA.setApprovalForAll(address(bundleEscrow), true);

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
        assertEq(
            erc20TokenA.balanceOf(address(bundleEscrow)),
            erc20AmountA,
            "ERC20 tokens should be in escrow"
        );
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            address(bundleEscrow),
            "ERC721 should be in escrow"
        );
        assertEq(
            erc1155TokenA.balanceOf(address(bundleEscrow), erc1155TokenIdA),
            erc1155TokenAmountA,
            "ERC1155 tokens should be in escrow"
        );
    }

    function testPermitAndPayBundle() public {
        // No expiration needed for this test
        uint256 deadline = block.timestamp + 1 days;

        TokenBundlePaymentObligation2.ObligationData
            memory bobBundle = createBobBundle();

        // Create permit signature for Bob's ERC20 token
        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            erc20TokenB,
            BOB_PRIVATE_KEY,
            address(bundlePayment),
            erc20AmountB,
            deadline
        );

        TokenBundleBarterUtils.ERC20PermitSignature[]
            memory permits = new TokenBundleBarterUtils.ERC20PermitSignature[](
                1
            );
        permits[0] = TokenBundleBarterUtils.ERC20PermitSignature({
            v: v,
            r: r,
            s: s,
            deadline: deadline
        });

        // Bob creates payment with permit
        vm.startPrank(bob);
        // Still need to approve ERC721 and ERC1155
        erc721TokenB.approve(address(bundlePayment), bobErc721Id);
        erc1155TokenB.setApprovalForAll(address(bundlePayment), true);

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
        TokenBundlePaymentObligation2.ObligationData memory paymentData = abi
            .decode(
                payment.data,
                (TokenBundlePaymentObligation2.ObligationData)
            );

        assertEq(
            paymentData.erc20Tokens[0],
            address(erc20TokenB),
            "ERC20 token should match"
        );
        assertEq(
            paymentData.erc20Amounts[0],
            erc20AmountB,
            "ERC20 amount should match"
        );
        assertEq(
            paymentData.erc721Tokens[0],
            address(erc721TokenB),
            "ERC721 token should match"
        );
        assertEq(paymentData.payee, alice, "Payee should match");
    }

    function testPermitAndBuyBundleForBundle() public {
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1 days;

        TokenBundleEscrowObligation2.ObligationData
            memory aliceBundle = createAliceBundle();
        TokenBundlePaymentObligation2.ObligationData
            memory bobBundle = createBobBundle();

        // Create permit signature for Alice's ERC20 token
        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            erc20TokenA,
            ALICE_PRIVATE_KEY,
            address(bundleEscrow),
            erc20AmountA,
            deadline
        );

        TokenBundleBarterUtils.ERC20PermitSignature[]
            memory permits = new TokenBundleBarterUtils.ERC20PermitSignature[](
                1
            );
        permits[0] = TokenBundleBarterUtils.ERC20PermitSignature({
            v: v,
            r: r,
            s: s,
            deadline: deadline
        });

        // Alice creates bid with permit
        vm.startPrank(alice);
        // Still need to approve ERC721 and ERC1155
        erc721TokenA.approve(address(bundleEscrow), aliceErc721Id);
        erc1155TokenA.setApprovalForAll(address(bundleEscrow), true);

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
        assertEq(
            erc20TokenA.balanceOf(address(bundleEscrow)),
            erc20AmountA,
            "ERC20 tokens should be in escrow"
        );
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            address(bundleEscrow),
            "ERC721 should be in escrow"
        );
        assertEq(
            erc1155TokenA.balanceOf(address(bundleEscrow), erc1155TokenIdA),
            erc1155TokenAmountA,
            "ERC1155 tokens should be in escrow"
        );
    }

    function testPermitAndPayBundleForBundle() public {
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1 days;

        TokenBundleEscrowObligation2.ObligationData
            memory aliceBundle = createAliceBundle();
        TokenBundlePaymentObligation2.ObligationData
            memory bobBundle = createBobBundle();

        // Alice creates bid
        vm.startPrank(alice);
        erc20TokenA.approve(address(bundleEscrow), erc20AmountA);
        erc721TokenA.approve(address(bundleEscrow), aliceErc721Id);
        erc1155TokenA.setApprovalForAll(address(bundleEscrow), true);
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

        TokenBundleBarterUtils.ERC20PermitSignature[]
            memory permits = new TokenBundleBarterUtils.ERC20PermitSignature[](
                1
            );
        permits[0] = TokenBundleBarterUtils.ERC20PermitSignature({
            v: v,
            r: r,
            s: s,
            deadline: deadline
        });

        // Bob fulfills Alice's bid with permit
        vm.startPrank(bob);
        // Still need to approve ERC721 and ERC1155
        erc721TokenB.approve(address(bundlePayment), bobErc721Id);
        erc1155TokenB.setApprovalForAll(address(bundlePayment), true);

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
        assertEq(
            erc20TokenB.balanceOf(alice),
            erc20AmountB,
            "Alice should have Bob's ERC20 tokens"
        );
        assertEq(
            erc721TokenB.ownerOf(bobErc721Id),
            alice,
            "Alice should have Bob's ERC721 token"
        );
        assertEq(
            erc1155TokenB.balanceOf(alice, erc1155TokenIdB),
            erc1155TokenAmountB,
            "Alice should have Bob's ERC1155 tokens"
        );

        // Bob should have Alice's tokens
        assertEq(
            erc20TokenA.balanceOf(bob),
            erc20AmountA,
            "Bob should have Alice's ERC20 tokens"
        );
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            bob,
            "Bob should have Alice's ERC721 token"
        );
        assertEq(
            erc1155TokenA.balanceOf(bob, erc1155TokenIdA),
            erc1155TokenAmountA,
            "Bob should have Alice's ERC1155 tokens"
        );
    }

    // Error test cases
    function test_RevertWhen_TokenNotApproved() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        TokenBundleEscrowObligation2.ObligationData
            memory aliceBundle = createAliceBundle();
        TokenBundlePaymentObligation2.ObligationData
            memory bobBundle = createBobBundle();

        // Alice tries to make bid without approving tokens
        vm.startPrank(alice);
        vm.expectRevert(); // ERC20: insufficient allowance
        barterUtils.buyBundleForBundle(aliceBundle, bobBundle, expiration);
        vm.stopPrank();
    }

    function test_RevertWhen_PaymentFails() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        TokenBundleEscrowObligation2.ObligationData
            memory aliceBundle = createAliceBundle();
        TokenBundlePaymentObligation2.ObligationData
            memory bobBundle = createBobBundle();

        // Alice creates bid
        vm.startPrank(alice);
        erc20TokenA.approve(address(bundleEscrow), erc20AmountA);
        erc721TokenA.approve(address(bundleEscrow), aliceErc721Id);
        erc1155TokenA.setApprovalForAll(address(bundleEscrow), true);
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

        TokenBundleEscrowObligation2.ObligationData
            memory aliceBundle = createAliceBundle();

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
        TokenBundleBarterUtils.ERC20PermitSignature[]
            memory permits = new TokenBundleBarterUtils.ERC20PermitSignature[](
                0
            );

        // Alice tries to create escrow with invalid permit length
        vm.startPrank(alice);
        vm.expectRevert(TokenBundleBarterUtils.InvalidSignatureLength.selector);
        barterUtils.permitAndEscrowBundle(aliceBundle, expiration, permits);
        vm.stopPrank();
    }

    function test_RevertWhen_BidExpired() public {
        // Create a bid with short expiration
        uint64 expiration = uint64(block.timestamp + 10 minutes);

        TokenBundleEscrowObligation2.ObligationData
            memory aliceBundle = createAliceBundle();
        TokenBundlePaymentObligation2.ObligationData
            memory bobBundle = createBobBundle();

        // Alice creates bid
        vm.startPrank(alice);
        erc20TokenA.approve(address(bundleEscrow), erc20AmountA);
        erc721TokenA.approve(address(bundleEscrow), aliceErc721Id);
        erc1155TokenA.setApprovalForAll(address(bundleEscrow), true);
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
        erc721TokenB.approve(address(bundlePayment), bobErc721Id);
        erc1155TokenB.setApprovalForAll(address(bundlePayment), true);
        vm.expectRevert();
        barterUtils.payBundleForBundle(buyAttestation);
        vm.stopPrank();
    }
}
