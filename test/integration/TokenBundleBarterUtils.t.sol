// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {TokenBundleEscrowObligation2} from "@src/obligations/TokenBundleEscrowObligation2.sol";
import {TokenBundlePaymentObligation2} from "@src/obligations/TokenBundlePaymentObligation2.sol";
import {TokenBundleBarterUtils} from "@src/utils/TokenBundleBarterUtils.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
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
    constructor() ERC721("Mock ERC721", "MERC721") {
        for (uint i = 1; i <= 10; i++) {
            _mint(msg.sender, i);
        }
    }
}

contract MockERC1155 is ERC1155 {
    constructor() ERC1155("") {
        for (uint i = 1; i <= 5; i++) {
            _mint(msg.sender, i, 100, "");
        }
    }
}

contract TokenBundleBarterUtilsTest is Test, IERC1155Receiver {
    TokenBundleEscrowObligation2 public escrowObligation;
    TokenBundlePaymentObligation2 public paymentObligation;
    TokenBundleBarterUtils public barterUtils;

    MockERC20Permit public erc20TokenA;
    MockERC20Permit public erc20TokenB;
    MockERC721 public askErc721TokenA;
    MockERC721 public askErc721TokenB;
    MockERC1155 public askErc1155TokenA;
    MockERC1155 public askErc1155TokenB;

    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    uint256 internal constant ALICE_PRIVATE_KEY = 0xa11ce;
    uint256 internal constant BOB_PRIVATE_KEY = 0xb0b;
    address public alice;
    address public bob;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        _setupContracts();
        _setupTestAccounts();
        _distributeTokens();
    }

    function _setupContracts() internal {
        erc20TokenA = new MockERC20Permit("Token A", "TKA");
        erc20TokenB = new MockERC20Permit("Token B", "TKB");
        askErc721TokenA = new MockERC721();
        askErc721TokenB = new MockERC721();
        askErc1155TokenA = new MockERC1155();
        askErc1155TokenB = new MockERC1155();

        escrowObligation = new TokenBundleEscrowObligation2(
            eas,
            schemaRegistry
        );
        paymentObligation = new TokenBundlePaymentObligation2(
            eas,
            schemaRegistry
        );
        barterUtils = new TokenBundleBarterUtils(
            eas,
            escrowObligation,
            paymentObligation
        );
    }

    function _setupTestAccounts() internal {
        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);
    }

    function _distributeTokens() internal {
        // ERC20s
        erc20TokenA.transfer(alice, 1000 * 10 ** 18);
        erc20TokenB.transfer(bob, 1000 * 10 ** 18);

        // ERC721s
        for (uint i = 1; i <= 5; i++) {
            askErc721TokenA.transferFrom(address(this), alice, i);
            askErc721TokenB.transferFrom(address(this), bob, i);
        }

        // ERC1155s
        askErc1155TokenA.safeTransferFrom(address(this), alice, 1, 50, "");
        askErc1155TokenB.safeTransferFrom(address(this), bob, 1, 50, "");
    }

    function _createBidBundle()
        internal
        pure
        returns (TokenBundleEscrowObligation2.ObligationData memory)
    {
        address[] memory erc20Tokens = new address[](1);
        uint256[] memory erc20Amounts = new uint256[](1);
        address[] memory erc721Tokens = new address[](1);
        uint256[] memory erc721TokenIds = new uint256[](1);
        address[] memory erc1155Tokens = new address[](1);
        uint256[] memory erc1155TokenIds = new uint256[](1);
        uint256[] memory erc1155Amounts = new uint256[](1);

        erc20Tokens[0] = address(0); // Will be set in test
        erc20Amounts[0] = 100 * 10 ** 18;
        erc721Tokens[0] = address(0); // Will be set in test
        erc721TokenIds[0] = 1;
        erc1155Tokens[0] = address(0); // Will be set in test
        erc1155TokenIds[0] = 1;
        erc1155Amounts[0] = 10;

        return
            TokenBundleEscrowObligation2.ObligationData({
                arbiter: address(0), // Will be set in test
                demand: "", // Will be set in test
                nativeAmount: 0,
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts
            });
    }

    function _createAskBundle()
        internal
        pure
        returns (TokenBundlePaymentObligation2.ObligationData memory)
    {
        address[] memory erc20Tokens = new address[](1);
        uint256[] memory erc20Amounts = new uint256[](1);
        address[] memory erc721Tokens = new address[](1);
        uint256[] memory erc721TokenIds = new uint256[](1);
        address[] memory erc1155Tokens = new address[](1);
        uint256[] memory erc1155TokenIds = new uint256[](1);
        uint256[] memory erc1155Amounts = new uint256[](1);

        erc20Tokens[0] = address(0); // Will be set in test
        erc20Amounts[0] = 200 * 10 ** 18;
        erc721Tokens[0] = address(0); // Will be set in test
        erc721TokenIds[0] = 1;
        erc1155Tokens[0] = address(0); // Will be set in test
        erc1155TokenIds[0] = 1;
        erc1155Amounts[0] = 20;

        return
            TokenBundlePaymentObligation2.ObligationData({
                nativeAmount: 0,
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts,
                payee: address(0) // Will be set in test
            });
    }

    function _getERC20PermitSignature(
        MockERC20Permit token,
        uint256 ownerPrivateKey,
        address spender,
        uint256 value,
        uint256 deadline
    )
        internal
        view
        returns (TokenBundleBarterUtils.ERC20PermitSignature memory)
    {
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

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, digest);

        return
            TokenBundleBarterUtils.ERC20PermitSignature({
                v: v,
                r: r,
                s: s,
                deadline: deadline
            });
    }

    function testBundleTradeWithManualApprovals() public {
        // Setup bundles
        TokenBundleEscrowObligation2.ObligationData
            memory bidBundle = _createBidBundle();
        bidBundle.erc20Tokens[0] = address(erc20TokenA);
        bidBundle.erc721Tokens[0] = address(askErc721TokenA);
        bidBundle.erc1155Tokens[0] = address(askErc1155TokenA);

        TokenBundlePaymentObligation2.ObligationData
            memory askBundle = _createAskBundle();
        askBundle.erc20Tokens[0] = address(erc20TokenB);
        askBundle.erc721Tokens[0] = address(askErc721TokenB);
        askBundle.erc1155Tokens[0] = address(askErc1155TokenB);
        askBundle.payee = alice;

        bidBundle.arbiter = address(paymentObligation);
        bidBundle.demand = abi.encode(askBundle);

        // Record initial balances
        uint256 aliceInitialTokenA = erc20TokenA.balanceOf(alice);
        uint256 bobInitialTokenB = erc20TokenB.balanceOf(bob);

        // Alice creates buy order with manual approvals
        vm.startPrank(alice);
        erc20TokenA.approve(
            address(escrowObligation),
            bidBundle.erc20Amounts[0]
        );
        askErc721TokenA.approve(
            address(escrowObligation),
            bidBundle.erc721TokenIds[0]
        );
        askErc1155TokenA.setApprovalForAll(address(escrowObligation), true);

        bytes32 buyAttestation = barterUtils.buyBundleForBundle(
            bidBundle,
            askBundle,
            uint64(block.timestamp + 1 days)
        );
        vm.stopPrank();

        // Verify escrow state after Alice's deposit
        assertEq(
            erc20TokenA.balanceOf(alice),
            aliceInitialTokenA - bidBundle.erc20Amounts[0],
            "Alice's Token A not correctly escrowed"
        );
        assertEq(
            erc20TokenA.balanceOf(address(escrowObligation)),
            bidBundle.erc20Amounts[0],
            "Escrow contract Token A balance incorrect"
        );
        assertEq(
            askErc721TokenA.ownerOf(bidBundle.erc721TokenIds[0]),
            address(escrowObligation),
            "ERC721 A not correctly escrowed"
        );
        assertEq(
            askErc1155TokenA.balanceOf(
                address(escrowObligation),
                bidBundle.erc1155TokenIds[0]
            ),
            bidBundle.erc1155Amounts[0],
            "MultiToken A not correctly escrowed"
        );

        // Bob fulfills the order with manual approvals
        vm.startPrank(bob);
        erc20TokenB.approve(
            address(paymentObligation),
            askBundle.erc20Amounts[0]
        );
        askErc721TokenB.approve(
            address(paymentObligation),
            askBundle.erc721TokenIds[0]
        );
        askErc1155TokenB.setApprovalForAll(address(paymentObligation), true);

        bytes32 sellAttestation = barterUtils.payBundleForBundle(
            buyAttestation
        );
        vm.stopPrank();

        // Verify attestations
        assertNotEq(
            buyAttestation,
            bytes32(0),
            "Buy attestation should be created"
        );
        assertNotEq(
            sellAttestation,
            bytes32(0),
            "Sell attestation should be created"
        );

        // Verify token transfers completed correctly
        // ERC20
        assertEq(
            erc20TokenA.balanceOf(bob),
            bidBundle.erc20Amounts[0],
            "Bob didn't receive correct Token A amount"
        );
        assertEq(
            erc20TokenB.balanceOf(alice),
            askBundle.erc20Amounts[0],
            "Alice didn't receive correct Token B amount"
        );
        assertEq(
            erc20TokenB.balanceOf(bob),
            bobInitialTokenB - askBundle.erc20Amounts[0],
            "Bob's Token B balance not correctly decreased"
        );

        // ERC721
        assertEq(
            askErc721TokenA.ownerOf(bidBundle.erc721TokenIds[0]),
            bob,
            "ERC721 A not transferred to Bob"
        );
        assertEq(
            askErc721TokenB.ownerOf(askBundle.erc721TokenIds[0]),
            alice,
            "ERC721 B not transferred to Alice"
        );

        // ERC1155
        assertEq(
            askErc1155TokenA.balanceOf(bob, bidBundle.erc1155TokenIds[0]),
            bidBundle.erc1155Amounts[0],
            "Bob didn't receive correct MultiToken A amount"
        );
        assertEq(
            askErc1155TokenA.balanceOf(alice, bidBundle.erc1155TokenIds[0]),
            50 - bidBundle.erc1155Amounts[0],
            "Alice's MultiToken A balance not correctly decreased"
        );
        assertEq(
            askErc1155TokenB.balanceOf(alice, askBundle.erc1155TokenIds[0]),
            askBundle.erc1155Amounts[0],
            "Alice didn't receive correct MultiToken B amount"
        );
        assertEq(
            askErc1155TokenB.balanceOf(bob, askBundle.erc1155TokenIds[0]),
            50 - askBundle.erc1155Amounts[0],
            "Bob's MultiToken B balance not correctly decreased"
        );

        // Verify escrow contract has no remaining balance
        assertEq(
            erc20TokenA.balanceOf(address(escrowObligation)),
            0,
            "Escrow contract should have no remaining Token A"
        );
        assertEq(
            askErc1155TokenA.balanceOf(
                address(escrowObligation),
                bidBundle.erc1155TokenIds[0]
            ),
            0,
            "Escrow contract should have no remaining MultiToken A"
        );
    }

    function test_RevertWhen_BundleTradeHasNoApprovals() public {
        TokenBundleEscrowObligation2.ObligationData
            memory bidBundle = _createBidBundle();
        bidBundle.erc20Tokens[0] = address(erc20TokenA);
        bidBundle.erc721Tokens[0] = address(askErc721TokenA);
        bidBundle.erc1155Tokens[0] = address(askErc1155TokenA);

        TokenBundlePaymentObligation2.ObligationData
            memory askBundle = _createAskBundle();
        askBundle.erc20Tokens[0] = address(erc20TokenB);
        askBundle.erc721Tokens[0] = address(askErc721TokenB);
        askBundle.erc1155Tokens[0] = address(askErc1155TokenB);
        askBundle.payee = alice;

        bidBundle.arbiter = address(paymentObligation);
        bidBundle.demand = abi.encode(askBundle);

        // Attempt to create buy order without approvals
        vm.prank(alice);
        vm.expectRevert();
        barterUtils.buyBundleForBundle(
            bidBundle,
            askBundle,
            uint64(block.timestamp + 1 days)
        );
    }

    function test_RevertWhen_BundleTradeHasInsufficientBalance() public {
        TokenBundleEscrowObligation2.ObligationData
            memory bidBundle = _createBidBundle();
        bidBundle.erc20Tokens[0] = address(erc20TokenA);
        bidBundle.erc721Tokens[0] = address(askErc721TokenA);
        bidBundle.erc1155Tokens[0] = address(askErc1155TokenA);
        bidBundle.erc20Amounts[0] = 1000000 * 10 ** 18; // Amount larger than balance

        TokenBundlePaymentObligation2.ObligationData
            memory askBundle = _createAskBundle();
        askBundle.erc20Tokens[0] = address(erc20TokenB);
        askBundle.erc721Tokens[0] = address(askErc721TokenB);
        askBundle.erc1155Tokens[0] = address(askErc1155TokenB);
        askBundle.payee = alice;

        bidBundle.arbiter = address(paymentObligation);
        bidBundle.demand = abi.encode(askBundle);

        vm.startPrank(alice);
        erc20TokenA.approve(
            address(escrowObligation),
            bidBundle.erc20Amounts[0]
        );
        askErc721TokenA.approve(
            address(escrowObligation),
            bidBundle.erc721TokenIds[0]
        );
        askErc1155TokenA.setApprovalForAll(address(escrowObligation), true);

        vm.expectRevert();
        barterUtils.buyBundleForBundle(
            bidBundle,
            askBundle,
            uint64(block.timestamp + 1 days)
        );
        vm.stopPrank();
    }

    function testBundleTradeWithPermits() public {
        // Setup bundles
        TokenBundleEscrowObligation2.ObligationData
            memory bidBundle = _createBidBundle();
        bidBundle.erc20Tokens[0] = address(erc20TokenA);
        bidBundle.erc721Tokens[0] = address(askErc721TokenA);
        bidBundle.erc1155Tokens[0] = address(askErc1155TokenA);

        TokenBundlePaymentObligation2.ObligationData
            memory askBundle = _createAskBundle();
        askBundle.erc20Tokens[0] = address(erc20TokenB);
        askBundle.erc721Tokens[0] = address(askErc721TokenB);
        askBundle.erc1155Tokens[0] = address(askErc1155TokenB);
        askBundle.payee = alice;

        bidBundle.arbiter = address(paymentObligation);
        bidBundle.demand = abi.encode(askBundle);

        // Setup permits
        TokenBundleBarterUtils.ERC20PermitSignature[]
            memory alicePermits = new TokenBundleBarterUtils.ERC20PermitSignature[](
                1
            );
        alicePermits[0] = _getERC20PermitSignature(
            erc20TokenA,
            ALICE_PRIVATE_KEY,
            address(escrowObligation),
            bidBundle.erc20Amounts[0],
            block.timestamp + 1
        );

        // Alice creates buy order
        vm.startPrank(alice);
        erc20TokenA.approve(
            address(escrowObligation),
            bidBundle.erc20Amounts[0]
        );
        askErc721TokenA.approve(
            address(escrowObligation),
            bidBundle.erc721TokenIds[0]
        );
        askErc1155TokenA.setApprovalForAll(address(escrowObligation), true);

        bytes32 buyAttestation = barterUtils.permitAndEscrowBundleForBundle(
            bidBundle,
            askBundle,
            uint64(block.timestamp + 1 days),
            alicePermits
        );
        vm.stopPrank();

        // Setup Bob's permits
        TokenBundleBarterUtils.ERC20PermitSignature[]
            memory bobPermits = new TokenBundleBarterUtils.ERC20PermitSignature[](
                1
            );
        bobPermits[0] = _getERC20PermitSignature(
            erc20TokenB,
            BOB_PRIVATE_KEY,
            address(paymentObligation),
            askBundle.erc20Amounts[0],
            block.timestamp + 1
        );

        // Bob fulfills the order
        vm.startPrank(bob);
        erc20TokenB.approve(
            address(paymentObligation),
            askBundle.erc20Amounts[0]
        );
        askErc721TokenB.approve(
            address(paymentObligation),
            askBundle.erc721TokenIds[0]
        );
        askErc1155TokenB.setApprovalForAll(address(paymentObligation), true);

        bytes32 sellAttestation = barterUtils.permitAndPayBundleForBundle(
            buyAttestation,
            bobPermits
        );
        vm.stopPrank();

        // Verify attestations
        assertNotEq(
            buyAttestation,
            bytes32(0),
            "Buy attestation should be created"
        );
        assertNotEq(
            sellAttestation,
            bytes32(0),
            "Sell attestation should be created"
        );

        // Verify final token states
        _verifyFinalState();
    }

    function _verifyFinalState() internal view {
        // Check ERC20 balances
        assertEq(
            erc20TokenA.balanceOf(alice),
            900 * 10 ** 18,
            "Alice's Token A balance incorrect"
        );
        assertEq(
            erc20TokenA.balanceOf(bob),
            100 * 10 ** 18,
            "Bob's Token A balance incorrect"
        );
        assertEq(
            erc20TokenB.balanceOf(alice),
            200 * 10 ** 18,
            "Alice's Token B balance incorrect"
        );
        assertEq(
            erc20TokenB.balanceOf(bob),
            800 * 10 ** 18,
            "Bob's Token B balance incorrect"
        );

        // Check ERC721 ownership
        assertEq(
            askErc721TokenA.ownerOf(1),
            bob,
            "ERC721 A #1 ownership incorrect"
        );
        assertEq(
            askErc721TokenB.ownerOf(1),
            alice,
            "ERC721 B #1 ownership incorrect"
        );

        // Check ERC1155 balances
        assertEq(
            askErc1155TokenA.balanceOf(bob, 1),
            10,
            "Bob's MultiToken A balance incorrect"
        );
        assertEq(
            askErc1155TokenB.balanceOf(alice, 1),
            20,
            "Alice's MultiToken B balance incorrect"
        );
    }

    // Additional tests for error cases, expired permits, etc. would go here

    // Implementation of IERC1155Receiver
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) external pure override returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId;
    }
}
