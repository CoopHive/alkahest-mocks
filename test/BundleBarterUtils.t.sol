// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {BundleEscrowObligation} from "../src/Statements/BundleEscrowObligation.sol";
import {BundlePaymentObligation} from "../src/Statements/BundlePaymentObligation.sol";
import {BundleBarterUtils} from "../src/Utils/BundleBarterUtils.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import "@openzeppelin/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/token/ERC721/ERC721.sol";
import "@openzeppelin/token/ERC1155/ERC1155.sol";
import "@openzeppelin/token/ERC1155/IERC1155Receiver.sol";

contract MockERC20Permit is ERC20Permit {
    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) ERC20Permit(name) {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract MockERC721 is ERC721 {
    constructor() ERC721("Mock NFT", "MNFT") {
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

contract BundleBarterUtilsTest is Test, IERC1155Receiver {
    BundleEscrowObligation public escrowStatement;
    BundlePaymentObligation public paymentStatement;
    BundleBarterUtils public barterUtils;

    MockERC20Permit public tokenA;
    MockERC20Permit public tokenB;
    MockERC721 public nftA;
    MockERC721 public nftB;
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

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        _setupContracts();
        _setupTestAccounts();
        _distributeTokens();
    }

    function _setupContracts() internal {
        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        tokenA = new MockERC20Permit("Token A", "TKA");
        tokenB = new MockERC20Permit("Token B", "TKB");
        nftA = new MockERC721();
        nftB = new MockERC721();
        multiTokenA = new MockERC1155();
        multiTokenB = new MockERC1155();

        escrowStatement = new BundleEscrowObligation(eas, schemaRegistry);
        paymentStatement = new BundlePaymentObligation(eas, schemaRegistry);
        barterUtils = new BundleBarterUtils(
            eas,
            escrowStatement,
            paymentStatement
        );
    }

    function _setupTestAccounts() internal {
        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);
    }

    function _distributeTokens() internal {
        // ERC20s
        tokenA.transfer(alice, 1000 * 10 ** 18);
        tokenB.transfer(bob, 1000 * 10 ** 18);

        // ERC721s
        for (uint i = 1; i <= 5; i++) {
            nftA.transferFrom(address(this), alice, i);
            nftB.transferFrom(address(this), bob, i);
        }

        // ERC1155s
        multiTokenA.safeTransferFrom(address(this), alice, 1, 50, "");
        multiTokenB.safeTransferFrom(address(this), bob, 1, 50, "");
    }

    function _createBidBundle()
        internal
        pure
        returns (BundleEscrowObligation.StatementData memory)
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
            BundleEscrowObligation.StatementData({
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts,
                arbiter: address(0), // Will be set in test
                demand: "" // Will be set in test
            });
    }

    function _createAskBundle()
        internal
        pure
        returns (BundlePaymentObligation.StatementData memory)
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
            BundlePaymentObligation.StatementData({
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
    ) internal view returns (BundleBarterUtils.ERC20PermitSignature memory) {
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
            BundleBarterUtils.ERC20PermitSignature({
                v: v,
                r: r,
                s: s,
                deadline: deadline
            });
    }

    function testBundleTradeWithManualApprovals() public {
        // Setup bundles
        BundleEscrowObligation.StatementData
            memory bidBundle = _createBidBundle();
        bidBundle.erc20Tokens[0] = address(tokenA);
        bidBundle.erc721Tokens[0] = address(nftA);
        bidBundle.erc1155Tokens[0] = address(multiTokenA);

        BundlePaymentObligation.StatementData
            memory askBundle = _createAskBundle();
        askBundle.erc20Tokens[0] = address(tokenB);
        askBundle.erc721Tokens[0] = address(nftB);
        askBundle.erc1155Tokens[0] = address(multiTokenB);
        askBundle.payee = alice;

        bidBundle.arbiter = address(paymentStatement);
        bidBundle.demand = abi.encode(askBundle);

        // Record initial balances
        uint256 aliceInitialTokenA = tokenA.balanceOf(alice);
        uint256 bobInitialTokenB = tokenB.balanceOf(bob);

        // Alice creates buy order with manual approvals
        vm.startPrank(alice);
        tokenA.approve(address(escrowStatement), bidBundle.erc20Amounts[0]);
        nftA.approve(address(escrowStatement), bidBundle.erc721TokenIds[0]);
        multiTokenA.setApprovalForAll(address(escrowStatement), true);

        bytes32 buyAttestation = barterUtils.buyBundleForBundle(
            bidBundle,
            askBundle,
            uint64(block.timestamp + 1 days)
        );
        vm.stopPrank();

        // Verify escrow state after Alice's deposit
        assertEq(
            tokenA.balanceOf(alice),
            aliceInitialTokenA - bidBundle.erc20Amounts[0],
            "Alice's Token A not correctly escrowed"
        );
        assertEq(
            tokenA.balanceOf(address(escrowStatement)),
            bidBundle.erc20Amounts[0],
            "Escrow contract Token A balance incorrect"
        );
        assertEq(
            nftA.ownerOf(bidBundle.erc721TokenIds[0]),
            address(escrowStatement),
            "NFT A not correctly escrowed"
        );
        assertEq(
            multiTokenA.balanceOf(
                address(escrowStatement),
                bidBundle.erc1155TokenIds[0]
            ),
            bidBundle.erc1155Amounts[0],
            "MultiToken A not correctly escrowed"
        );

        // Bob fulfills the order with manual approvals
        vm.startPrank(bob);
        tokenB.approve(address(paymentStatement), askBundle.erc20Amounts[0]);
        nftB.approve(address(paymentStatement), askBundle.erc721TokenIds[0]);
        multiTokenB.setApprovalForAll(address(paymentStatement), true);

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
            tokenA.balanceOf(bob),
            bidBundle.erc20Amounts[0],
            "Bob didn't receive correct Token A amount"
        );
        assertEq(
            tokenB.balanceOf(alice),
            askBundle.erc20Amounts[0],
            "Alice didn't receive correct Token B amount"
        );
        assertEq(
            tokenB.balanceOf(bob),
            bobInitialTokenB - askBundle.erc20Amounts[0],
            "Bob's Token B balance not correctly decreased"
        );

        // ERC721
        assertEq(
            nftA.ownerOf(bidBundle.erc721TokenIds[0]),
            bob,
            "NFT A not transferred to Bob"
        );
        assertEq(
            nftB.ownerOf(askBundle.erc721TokenIds[0]),
            alice,
            "NFT B not transferred to Alice"
        );

        // ERC1155
        assertEq(
            multiTokenA.balanceOf(bob, bidBundle.erc1155TokenIds[0]),
            bidBundle.erc1155Amounts[0],
            "Bob didn't receive correct MultiToken A amount"
        );
        assertEq(
            multiTokenA.balanceOf(alice, bidBundle.erc1155TokenIds[0]),
            50 - bidBundle.erc1155Amounts[0],
            "Alice's MultiToken A balance not correctly decreased"
        );
        assertEq(
            multiTokenB.balanceOf(alice, askBundle.erc1155TokenIds[0]),
            askBundle.erc1155Amounts[0],
            "Alice didn't receive correct MultiToken B amount"
        );
        assertEq(
            multiTokenB.balanceOf(bob, askBundle.erc1155TokenIds[0]),
            50 - askBundle.erc1155Amounts[0],
            "Bob's MultiToken B balance not correctly decreased"
        );

        // Verify escrow contract has no remaining balance
        assertEq(
            tokenA.balanceOf(address(escrowStatement)),
            0,
            "Escrow contract should have no remaining Token A"
        );
        assertEq(
            multiTokenA.balanceOf(
                address(escrowStatement),
                bidBundle.erc1155TokenIds[0]
            ),
            0,
            "Escrow contract should have no remaining MultiToken A"
        );
    }

    function testFailBundleTradeWithoutApprovals() public {
        BundleEscrowObligation.StatementData
            memory bidBundle = _createBidBundle();
        bidBundle.erc20Tokens[0] = address(tokenA);
        bidBundle.erc721Tokens[0] = address(nftA);
        bidBundle.erc1155Tokens[0] = address(multiTokenA);

        BundlePaymentObligation.StatementData
            memory askBundle = _createAskBundle();
        askBundle.erc20Tokens[0] = address(tokenB);
        askBundle.erc721Tokens[0] = address(nftB);
        askBundle.erc1155Tokens[0] = address(multiTokenB);
        askBundle.payee = alice;

        bidBundle.arbiter = address(paymentStatement);
        bidBundle.demand = abi.encode(askBundle);

        // Attempt to create buy order without approvals
        vm.prank(alice);
        barterUtils.buyBundleForBundle(
            bidBundle,
            askBundle,
            uint64(block.timestamp + 1 days)
        );
    }

    function testFailBundleTradeWithInsufficientBalance() public {
        BundleEscrowObligation.StatementData
            memory bidBundle = _createBidBundle();
        bidBundle.erc20Tokens[0] = address(tokenA);
        bidBundle.erc721Tokens[0] = address(nftA);
        bidBundle.erc1155Tokens[0] = address(multiTokenA);
        bidBundle.erc20Amounts[0] = 1000000 * 10 ** 18; // Amount larger than balance

        BundlePaymentObligation.StatementData
            memory askBundle = _createAskBundle();
        askBundle.erc20Tokens[0] = address(tokenB);
        askBundle.erc721Tokens[0] = address(nftB);
        askBundle.erc1155Tokens[0] = address(multiTokenB);
        askBundle.payee = alice;

        bidBundle.arbiter = address(paymentStatement);
        bidBundle.demand = abi.encode(askBundle);

        vm.startPrank(alice);
        tokenA.approve(address(escrowStatement), bidBundle.erc20Amounts[0]);
        nftA.approve(address(escrowStatement), bidBundle.erc721TokenIds[0]);
        multiTokenA.setApprovalForAll(address(escrowStatement), true);

        barterUtils.buyBundleForBundle(
            bidBundle,
            askBundle,
            uint64(block.timestamp + 1 days)
        );
        vm.stopPrank();
    }

    function testBundleTradeWithPermits() public {
        // Setup bundles
        BundleEscrowObligation.StatementData
            memory bidBundle = _createBidBundle();
        bidBundle.erc20Tokens[0] = address(tokenA);
        bidBundle.erc721Tokens[0] = address(nftA);
        bidBundle.erc1155Tokens[0] = address(multiTokenA);

        BundlePaymentObligation.StatementData
            memory askBundle = _createAskBundle();
        askBundle.erc20Tokens[0] = address(tokenB);
        askBundle.erc721Tokens[0] = address(nftB);
        askBundle.erc1155Tokens[0] = address(multiTokenB);
        askBundle.payee = alice;

        bidBundle.arbiter = address(paymentStatement);
        bidBundle.demand = abi.encode(askBundle);

        // Setup permits
        BundleBarterUtils.ERC20PermitSignature[]
            memory alicePermits = new BundleBarterUtils.ERC20PermitSignature[](
                1
            );
        alicePermits[0] = _getERC20PermitSignature(
            tokenA,
            ALICE_PRIVATE_KEY,
            address(escrowStatement),
            bidBundle.erc20Amounts[0],
            block.timestamp + 1
        );

        // Alice creates buy order
        vm.startPrank(alice);
        tokenA.approve(address(escrowStatement), bidBundle.erc20Amounts[0]);
        nftA.approve(address(escrowStatement), bidBundle.erc721TokenIds[0]);
        multiTokenA.setApprovalForAll(address(escrowStatement), true);

        bytes32 buyAttestation = barterUtils.permitAndEscrowBundleForBundle(
            bidBundle,
            askBundle,
            uint64(block.timestamp + 1 days),
            alicePermits
        );
        vm.stopPrank();

        // Setup Bob's permits
        BundleBarterUtils.ERC20PermitSignature[]
            memory bobPermits = new BundleBarterUtils.ERC20PermitSignature[](1);
        bobPermits[0] = _getERC20PermitSignature(
            tokenB,
            BOB_PRIVATE_KEY,
            address(paymentStatement),
            askBundle.erc20Amounts[0],
            block.timestamp + 1
        );

        // Bob fulfills the order
        vm.startPrank(bob);
        tokenB.approve(address(paymentStatement), askBundle.erc20Amounts[0]);
        nftB.approve(address(paymentStatement), askBundle.erc721TokenIds[0]);
        multiTokenB.setApprovalForAll(address(paymentStatement), true);

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
            tokenA.balanceOf(alice),
            900 * 10 ** 18,
            "Alice's Token A balance incorrect"
        );
        assertEq(
            tokenA.balanceOf(bob),
            100 * 10 ** 18,
            "Bob's Token A balance incorrect"
        );
        assertEq(
            tokenB.balanceOf(alice),
            200 * 10 ** 18,
            "Alice's Token B balance incorrect"
        );
        assertEq(
            tokenB.balanceOf(bob),
            800 * 10 ** 18,
            "Bob's Token B balance incorrect"
        );

        // Check ERC721 ownership
        assertEq(nftA.ownerOf(1), bob, "NFT A #1 ownership incorrect");
        assertEq(nftB.ownerOf(1), alice, "NFT B #1 ownership incorrect");

        // Check ERC1155 balances
        assertEq(
            multiTokenA.balanceOf(bob, 1),
            10,
            "Bob's MultiToken A balance incorrect"
        );
        assertEq(
            multiTokenB.balanceOf(alice, 1),
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
