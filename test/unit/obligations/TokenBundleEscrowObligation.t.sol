// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {TokenBundleEscrowObligation} from "@src/obligations/TokenBundleEscrowObligation.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {MockArbiter} from "./MockArbiter.sol";
import {IEAS, Attestation, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

// Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 10000 * 10 ** 18);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

// Mock ERC721 token for testing
contract MockERC721 is ERC721 {
    uint256 private _nextTokenId;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function mint(address to) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        return tokenId;
    }

    function mintSpecificId(address to, uint256 id) public {
        _mint(to, id);
    }
}

// Mock ERC1155 token for testing
contract MockERC1155 is ERC1155 {
    constructor() ERC1155("https://example.com/token/{id}.json") {}

    function mint(address to, uint256 id, uint256 amount) public {
        _mint(to, id, amount, "");
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public {
        _mintBatch(to, ids, amounts, "");
    }
}

contract TokenBundleEscrowObligationTest is Test {
    TokenBundleEscrowObligation public escrowObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    MockERC20 public erc20Token1;
    MockERC20 public erc20Token2;
    MockERC721 public erc721Token1;
    MockERC721 public erc721Token2;
    MockERC1155 public erc1155Token1;
    MockERC1155 public erc1155Token2;

    MockArbiter public mockArbiter;
    MockArbiter public rejectingArbiter;

    address internal buyer;
    address internal seller;

    // ERC20 values
    uint256 constant ERC20_AMOUNT_1 = 100 * 10 ** 18;
    uint256 constant ERC20_AMOUNT_2 = 200 * 10 ** 18;

    // ERC721 token IDs
    uint256 internal erc721TokenId1;
    uint256 internal erc721TokenId2;

    // ERC1155 values
    uint256 constant ERC1155_TOKEN_ID_1 = 1;
    uint256 constant ERC1155_TOKEN_ID_2 = 2;
    uint256 constant ERC1155_AMOUNT_1 = 10;
    uint256 constant ERC1155_AMOUNT_2 = 20;

    uint64 constant EXPIRATION_TIME = 365 days;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        escrowObligation = new TokenBundleEscrowObligation(eas, schemaRegistry);

        // Create tokens
        erc20Token1 = new MockERC20("Token1", "TKN1");
        erc20Token2 = new MockERC20("Token2", "TKN2");
        erc721Token1 = new MockERC721("MERC721_1", "MERC721_1");
        erc721Token2 = new MockERC721("MERC721_2", "MERC721_2");
        erc1155Token1 = new MockERC1155();
        erc1155Token2 = new MockERC1155();

        mockArbiter = new MockArbiter(true);
        rejectingArbiter = new MockArbiter(false);

        buyer = makeAddr("buyer");
        seller = makeAddr("seller");

        // Fund the buyer with tokens
        erc20Token1.transfer(buyer, ERC20_AMOUNT_1);
        erc20Token2.transfer(buyer, ERC20_AMOUNT_2);

        vm.startPrank(address(this));
        erc721TokenId1 = erc721Token1.mint(buyer);
        erc721TokenId2 = erc721Token2.mint(buyer);

        erc1155Token1.mint(buyer, ERC1155_TOKEN_ID_1, ERC1155_AMOUNT_1);
        erc1155Token2.mint(buyer, ERC1155_TOKEN_ID_2, ERC1155_AMOUNT_2);
        vm.stopPrank();
    }

    function testConstructor() public view {
        // Verify contract was initialized correctly
        bytes32 schemaId = escrowObligation.ATTESTATION_SCHEMA();
        assertNotEq(schemaId, bytes32(0), "Schema should be registered");

        // Verify schema details
        SchemaRecord memory schema = escrowObligation.getSchema();
        assertEq(schema.uid, schemaId, "Schema UID should match");
        assertEq(
            schema.schema,
            "address arbiter, bytes demand, address[] erc20Tokens, uint256[] erc20Amounts, address[] erc721Tokens, uint256[] erc721TokenIds, address[] erc1155Tokens, uint256[] erc1155TokenIds, uint256[] erc1155Amounts",
            "Schema string should match"
        );
    }

    function testMakeStatement() public {
        // Approve tokens first
        vm.startPrank(buyer);
        erc20Token1.approve(address(escrowObligation), ERC20_AMOUNT_1);
        erc20Token2.approve(address(escrowObligation), ERC20_AMOUNT_2);
        erc721Token1.approve(address(escrowObligation), erc721TokenId1);
        erc721Token2.approve(address(escrowObligation), erc721TokenId2);
        erc1155Token1.setApprovalForAll(address(escrowObligation), true);
        erc1155Token2.setApprovalForAll(address(escrowObligation), true);

        // Create the bundle data
        TokenBundleEscrowObligation.StatementData
            memory data = createBundleData();

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 uid = escrowObligation.makeStatement(data, expiration);
        vm.stopPrank();

        // Verify attestation exists
        assertNotEq(uid, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = escrowObligation.getStatement(uid);
        assertEq(
            attestation.schema,
            escrowObligation.ATTESTATION_SCHEMA(),
            "Schema should match"
        );
        assertEq(attestation.recipient, buyer, "Recipient should be the buyer");

        // Verify token transfers to escrow
        verifyTokensInEscrow();
    }

    function testMakeStatementFor() public {
        // Approve tokens first
        vm.startPrank(buyer);
        erc20Token1.approve(address(escrowObligation), ERC20_AMOUNT_1);
        erc20Token2.approve(address(escrowObligation), ERC20_AMOUNT_2);
        erc721Token1.approve(address(escrowObligation), erc721TokenId1);
        erc721Token2.approve(address(escrowObligation), erc721TokenId2);
        erc1155Token1.setApprovalForAll(address(escrowObligation), true);
        erc1155Token2.setApprovalForAll(address(escrowObligation), true);
        vm.stopPrank();

        // Create the bundle data
        TokenBundleEscrowObligation.StatementData
            memory data = createBundleData();

        address recipient = makeAddr("recipient");
        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);

        vm.prank(address(this));
        bytes32 uid = escrowObligation.makeStatementFor(
            data,
            expiration,
            buyer,
            recipient
        );

        // Verify attestation exists
        assertNotEq(uid, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = escrowObligation.getStatement(uid);
        assertEq(
            attestation.schema,
            escrowObligation.ATTESTATION_SCHEMA(),
            "Schema should match"
        );
        assertEq(
            attestation.recipient,
            recipient,
            "Recipient should be the specified recipient"
        );

        // Verify token transfers to escrow
        verifyTokensInEscrow();
    }

    function testArrayLengthMismatchReverts() public {
        // Set up token approvals
        vm.startPrank(buyer);
        erc20Token1.approve(address(escrowObligation), ERC20_AMOUNT_1);

        // Create mismatched length arrays for ERC20
        address[] memory erc20Tokens = new address[](2);
        erc20Tokens[0] = address(erc20Token1);
        erc20Tokens[1] = address(erc20Token2);

        uint256[] memory erc20Amounts = new uint256[](1); // Mismatched length!
        erc20Amounts[0] = ERC20_AMOUNT_1;

        // Empty arrays for other token types
        address[] memory erc721Tokens = new address[](0);
        uint256[] memory erc721TokenIds = new uint256[](0);
        address[] memory erc1155Tokens = new address[](0);
        uint256[] memory erc1155TokenIds = new uint256[](0);
        uint256[] memory erc1155Amounts = new uint256[](0);

        TokenBundleEscrowObligation.StatementData
            memory data = TokenBundleEscrowObligation.StatementData({
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts,
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand")
            });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);

        // Should revert with ArrayLengthMismatch
        vm.expectRevert(
            TokenBundleEscrowObligation.ArrayLengthMismatch.selector
        );
        escrowObligation.makeStatement(data, expiration);
        vm.stopPrank();
    }

    function testCollectPayment() public {
        // Setup: create an escrow
        vm.startPrank(buyer);
        erc20Token1.approve(address(escrowObligation), ERC20_AMOUNT_1);
        erc20Token2.approve(address(escrowObligation), ERC20_AMOUNT_2);
        erc721Token1.approve(address(escrowObligation), erc721TokenId1);
        erc721Token2.approve(address(escrowObligation), erc721TokenId2);
        erc1155Token1.setApprovalForAll(address(escrowObligation), true);
        erc1155Token2.setApprovalForAll(address(escrowObligation), true);

        TokenBundleEscrowObligation.StatementData
            memory data = createBundleData();

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 paymentUid = escrowObligation.makeStatement(data, expiration);
        vm.stopPrank();

        // Create a fulfillment attestation using StringObligation
        StringObligation stringObligation = new StringObligation(
            eas,
            schemaRegistry
        );
        vm.prank(seller);
        bytes32 fulfillmentUid = stringObligation.makeStatement(
            StringObligation.StatementData({item: "fulfillment data"}),
            bytes32(0)
        );

        // Collect payment
        vm.prank(seller);
        bool success = escrowObligation.collectPayment(
            paymentUid,
            fulfillmentUid
        );

        assertTrue(success, "Payment collection should succeed");

        // Verify tokens transfer to seller
        assertEq(
            erc20Token1.balanceOf(seller),
            ERC20_AMOUNT_1,
            "Seller should have received ERC20 token 1"
        );
        assertEq(
            erc20Token2.balanceOf(seller),
            ERC20_AMOUNT_2,
            "Seller should have received ERC20 token 2"
        );
        assertEq(
            erc721Token1.ownerOf(erc721TokenId1),
            seller,
            "Seller should have received ERC721 token 1"
        );
        assertEq(
            erc721Token2.ownerOf(erc721TokenId2),
            seller,
            "Seller should have received ERC721 token 2"
        );
        assertEq(
            erc1155Token1.balanceOf(seller, ERC1155_TOKEN_ID_1),
            ERC1155_AMOUNT_1,
            "Seller should have received ERC1155 token 1"
        );
        assertEq(
            erc1155Token2.balanceOf(seller, ERC1155_TOKEN_ID_2),
            ERC1155_AMOUNT_2,
            "Seller should have received ERC1155 token 2"
        );
    }

    function testCollectPaymentWithRejectedFulfillment() public {
        // Setup: create an escrow with rejecting arbiter
        vm.startPrank(buyer);
        erc20Token1.approve(address(escrowObligation), ERC20_AMOUNT_1);
        erc20Token2.approve(address(escrowObligation), ERC20_AMOUNT_2);
        erc721Token1.approve(address(escrowObligation), erc721TokenId1);
        erc721Token2.approve(address(escrowObligation), erc721TokenId2);
        erc1155Token1.setApprovalForAll(address(escrowObligation), true);
        erc1155Token2.setApprovalForAll(address(escrowObligation), true);

        // Create bundle with rejecting arbiter
        TokenBundleEscrowObligation.StatementData
            memory data = createBundleData();
        // Replace arbiter with rejecting one
        address[] memory erc20Tokens = new address[](2);
        erc20Tokens[0] = address(erc20Token1);
        erc20Tokens[1] = address(erc20Token2);

        uint256[] memory erc20Amounts = new uint256[](2);
        erc20Amounts[0] = ERC20_AMOUNT_1;
        erc20Amounts[1] = ERC20_AMOUNT_2;

        address[] memory erc721Tokens = new address[](2);
        erc721Tokens[0] = address(erc721Token1);
        erc721Tokens[1] = address(erc721Token2);

        uint256[] memory erc721TokenIds = new uint256[](2);
        erc721TokenIds[0] = erc721TokenId1;
        erc721TokenIds[1] = erc721TokenId2;

        address[] memory erc1155Tokens = new address[](2);
        erc1155Tokens[0] = address(erc1155Token1);
        erc1155Tokens[1] = address(erc1155Token2);

        uint256[] memory erc1155TokenIds = new uint256[](2);
        erc1155TokenIds[0] = ERC1155_TOKEN_ID_1;
        erc1155TokenIds[1] = ERC1155_TOKEN_ID_2;

        uint256[] memory erc1155Amounts = new uint256[](2);
        erc1155Amounts[0] = ERC1155_AMOUNT_1;
        erc1155Amounts[1] = ERC1155_AMOUNT_2;

        data = TokenBundleEscrowObligation.StatementData({
            erc20Tokens: erc20Tokens,
            erc20Amounts: erc20Amounts,
            erc721Tokens: erc721Tokens,
            erc721TokenIds: erc721TokenIds,
            erc1155Tokens: erc1155Tokens,
            erc1155TokenIds: erc1155TokenIds,
            erc1155Amounts: erc1155Amounts,
            arbiter: address(rejectingArbiter),
            demand: abi.encode("test demand")
        });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 paymentUid = escrowObligation.makeStatement(data, expiration);
        vm.stopPrank();

        // Create a fulfillment attestation using StringObligation
        StringObligation stringObligation = new StringObligation(
            eas,
            schemaRegistry
        );
        vm.prank(seller);
        bytes32 fulfillmentUid = stringObligation.makeStatement(
            StringObligation.StatementData({item: "fulfillment data"}),
            bytes32(0)
        );

        // Try to collect payment, should revert with InvalidFulfillment
        vm.prank(seller);
        vm.expectRevert(
            TokenBundleEscrowObligation.InvalidFulfillment.selector
        );
        escrowObligation.collectPayment(paymentUid, fulfillmentUid);
    }

    function testCollectExpired() public {
        // Setup: create an escrow
        vm.startPrank(buyer);
        erc20Token1.approve(address(escrowObligation), ERC20_AMOUNT_1);
        erc20Token2.approve(address(escrowObligation), ERC20_AMOUNT_2);
        erc721Token1.approve(address(escrowObligation), erc721TokenId1);
        erc721Token2.approve(address(escrowObligation), erc721TokenId2);
        erc1155Token1.setApprovalForAll(address(escrowObligation), true);
        erc1155Token2.setApprovalForAll(address(escrowObligation), true);

        TokenBundleEscrowObligation.StatementData
            memory data = createBundleData();

        uint64 expiration = uint64(block.timestamp + 100); // Short expiration
        bytes32 paymentUid = escrowObligation.makeStatement(data, expiration);
        vm.stopPrank();

        // Attempt to collect before expiration (should fail)
        vm.prank(buyer);
        vm.expectRevert(TokenBundleEscrowObligation.UnauthorizedCall.selector);
        escrowObligation.collectExpired(paymentUid);

        // Fast forward past expiration time
        vm.warp(block.timestamp + 200);

        // Collect expired funds
        vm.prank(buyer);
        bool success = escrowObligation.collectExpired(paymentUid);

        assertTrue(success, "Expired token collection should succeed");

        // Verify tokens returned to buyer
        assertEq(
            erc20Token1.balanceOf(buyer),
            ERC20_AMOUNT_1,
            "Buyer should have received ERC20 token 1 back"
        );
        assertEq(
            erc20Token2.balanceOf(buyer),
            ERC20_AMOUNT_2,
            "Buyer should have received ERC20 token 2 back"
        );
        assertEq(
            erc721Token1.ownerOf(erc721TokenId1),
            buyer,
            "Buyer should have received ERC721 token 1 back"
        );
        assertEq(
            erc721Token2.ownerOf(erc721TokenId2),
            buyer,
            "Buyer should have received ERC721 token 2 back"
        );
        assertEq(
            erc1155Token1.balanceOf(buyer, ERC1155_TOKEN_ID_1),
            ERC1155_AMOUNT_1,
            "Buyer should have received ERC1155 token 1 back"
        );
        assertEq(
            erc1155Token2.balanceOf(buyer, ERC1155_TOKEN_ID_2),
            ERC1155_AMOUNT_2,
            "Buyer should have received ERC1155 token 2 back"
        );
    }

    function testCheckStatement() public {
        // Create statement data
        TokenBundleEscrowObligation.StatementData
            memory paymentData = createBundleData();

        // Create an attestation using the bundle data
        vm.startPrank(buyer);
        erc20Token1.approve(address(escrowObligation), ERC20_AMOUNT_1);
        erc20Token2.approve(address(escrowObligation), ERC20_AMOUNT_2);
        erc721Token1.approve(address(escrowObligation), erc721TokenId1);
        erc721Token2.approve(address(escrowObligation), erc721TokenId2);
        erc1155Token1.setApprovalForAll(address(escrowObligation), true);
        erc1155Token2.setApprovalForAll(address(escrowObligation), true);

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 attestationId = escrowObligation.makeStatement(
            paymentData,
            expiration
        );
        vm.stopPrank();

        Attestation memory attestation = escrowObligation.getStatement(
            attestationId
        );

        // Test exact match
        TokenBundleEscrowObligation.StatementData
            memory exactDemand = createBundleData();
        bool exactMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(exactDemand),
            bytes32(0)
        );
        assertTrue(exactMatch, "Should match exact demand");

        // Test subset of ERC20 tokens (should succeed)
        TokenBundleEscrowObligation.StatementData
            memory erc20SubsetDemand = createSubsetERC20Demand();
        bool erc20SubsetMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(erc20SubsetDemand),
            bytes32(0)
        );
        assertTrue(erc20SubsetMatch, "Should match subset of ERC20 tokens");

        // Test subset of ERC721 tokens (should succeed)
        TokenBundleEscrowObligation.StatementData
            memory erc721SubsetDemand = createSubsetERC721Demand();
        bool erc721SubsetMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(erc721SubsetDemand),
            bytes32(0)
        );
        assertTrue(erc721SubsetMatch, "Should match subset of ERC721 tokens");

        // Test subset of ERC1155 tokens (should succeed)
        TokenBundleEscrowObligation.StatementData
            memory erc1155SubsetDemand = createSubsetERC1155Demand();
        bool erc1155SubsetMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(erc1155SubsetDemand),
            bytes32(0)
        );
        assertTrue(erc1155SubsetMatch, "Should match subset of ERC1155 tokens");

        // Test different arbiter (should fail)
        TokenBundleEscrowObligation.StatementData
            memory differentArbiterDemand = createDifferentArbiterDemand();
        bool differentArbiterMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(differentArbiterDemand),
            bytes32(0)
        );
        assertFalse(
            differentArbiterMatch,
            "Should not match different arbiter demand"
        );

        // Test different demand data (should fail)
        TokenBundleEscrowObligation.StatementData
            memory differentDemandData = createDifferentDemandData();
        bool differentDemandMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(differentDemandData),
            bytes32(0)
        );
        assertFalse(
            differentDemandMatch,
            "Should not match different demand data"
        );

        // Test more ERC20 tokens than in the escrow (should fail)
        TokenBundleEscrowObligation.StatementData
            memory moreERC20Demand = createMoreERC20Demand();
        bool moreERC20Match = escrowObligation.checkStatement(
            attestation,
            abi.encode(moreERC20Demand),
            bytes32(0)
        );
        assertFalse(
            moreERC20Match,
            "Should not match when demanding more ERC20 tokens"
        );

        // Test higher ERC20 amount than in the escrow (should fail)
        TokenBundleEscrowObligation.StatementData
            memory higherERC20AmountDemand = createHigherERC20AmountDemand();
        bool higherERC20AmountMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(higherERC20AmountDemand),
            bytes32(0)
        );
        assertFalse(
            higherERC20AmountMatch,
            "Should not match when demanding higher ERC20 amount"
        );
    }

    // Helper function to create a complete bundle data
    function createBundleData()
        internal
        view
        returns (TokenBundleEscrowObligation.StatementData memory)
    {
        address[] memory erc20Tokens = new address[](2);
        erc20Tokens[0] = address(erc20Token1);
        erc20Tokens[1] = address(erc20Token2);

        uint256[] memory erc20Amounts = new uint256[](2);
        erc20Amounts[0] = ERC20_AMOUNT_1;
        erc20Amounts[1] = ERC20_AMOUNT_2;

        address[] memory erc721Tokens = new address[](2);
        erc721Tokens[0] = address(erc721Token1);
        erc721Tokens[1] = address(erc721Token2);

        uint256[] memory erc721TokenIds = new uint256[](2);
        erc721TokenIds[0] = erc721TokenId1;
        erc721TokenIds[1] = erc721TokenId2;

        address[] memory erc1155Tokens = new address[](2);
        erc1155Tokens[0] = address(erc1155Token1);
        erc1155Tokens[1] = address(erc1155Token2);

        uint256[] memory erc1155TokenIds = new uint256[](2);
        erc1155TokenIds[0] = ERC1155_TOKEN_ID_1;
        erc1155TokenIds[1] = ERC1155_TOKEN_ID_2;

        uint256[] memory erc1155Amounts = new uint256[](2);
        erc1155Amounts[0] = ERC1155_AMOUNT_1;
        erc1155Amounts[1] = ERC1155_AMOUNT_2;

        return
            TokenBundleEscrowObligation.StatementData({
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts,
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand")
            });
    }

    // Helper function to create a subset ERC20 demand
    function createSubsetERC20Demand()
        internal
        view
        returns (TokenBundleEscrowObligation.StatementData memory)
    {
        address[] memory erc20Tokens = new address[](1);
        erc20Tokens[0] = address(erc20Token1);

        uint256[] memory erc20Amounts = new uint256[](1);
        erc20Amounts[0] = ERC20_AMOUNT_1;

        address[] memory erc721Tokens = new address[](2);
        erc721Tokens[0] = address(erc721Token1);
        erc721Tokens[1] = address(erc721Token2);

        uint256[] memory erc721TokenIds = new uint256[](2);
        erc721TokenIds[0] = erc721TokenId1;
        erc721TokenIds[1] = erc721TokenId2;

        address[] memory erc1155Tokens = new address[](2);
        erc1155Tokens[0] = address(erc1155Token1);
        erc1155Tokens[1] = address(erc1155Token2);

        uint256[] memory erc1155TokenIds = new uint256[](2);
        erc1155TokenIds[0] = ERC1155_TOKEN_ID_1;
        erc1155TokenIds[1] = ERC1155_TOKEN_ID_2;

        uint256[] memory erc1155Amounts = new uint256[](2);
        erc1155Amounts[0] = ERC1155_AMOUNT_1;
        erc1155Amounts[1] = ERC1155_AMOUNT_2;

        return
            TokenBundleEscrowObligation.StatementData({
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts,
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand")
            });
    }

    // Helper function to create a subset ERC721 demand
    function createSubsetERC721Demand()
        internal
        view
        returns (TokenBundleEscrowObligation.StatementData memory)
    {
        address[] memory erc20Tokens = new address[](2);
        erc20Tokens[0] = address(erc20Token1);
        erc20Tokens[1] = address(erc20Token2);

        uint256[] memory erc20Amounts = new uint256[](2);
        erc20Amounts[0] = ERC20_AMOUNT_1;
        erc20Amounts[1] = ERC20_AMOUNT_2;

        address[] memory erc721Tokens = new address[](1);
        erc721Tokens[0] = address(erc721Token1);

        uint256[] memory erc721TokenIds = new uint256[](1);
        erc721TokenIds[0] = erc721TokenId1;

        address[] memory erc1155Tokens = new address[](2);
        erc1155Tokens[0] = address(erc1155Token1);
        erc1155Tokens[1] = address(erc1155Token2);

        uint256[] memory erc1155TokenIds = new uint256[](2);
        erc1155TokenIds[0] = ERC1155_TOKEN_ID_1;
        erc1155TokenIds[1] = ERC1155_TOKEN_ID_2;

        uint256[] memory erc1155Amounts = new uint256[](2);
        erc1155Amounts[0] = ERC1155_AMOUNT_1;
        erc1155Amounts[1] = ERC1155_AMOUNT_2;

        return
            TokenBundleEscrowObligation.StatementData({
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts,
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand")
            });
    }

    // Helper function to create a subset ERC1155 demand
    function createSubsetERC1155Demand()
        internal
        view
        returns (TokenBundleEscrowObligation.StatementData memory)
    {
        address[] memory erc20Tokens = new address[](2);
        erc20Tokens[0] = address(erc20Token1);
        erc20Tokens[1] = address(erc20Token2);

        uint256[] memory erc20Amounts = new uint256[](2);
        erc20Amounts[0] = ERC20_AMOUNT_1;
        erc20Amounts[1] = ERC20_AMOUNT_2;

        address[] memory erc721Tokens = new address[](2);
        erc721Tokens[0] = address(erc721Token1);
        erc721Tokens[1] = address(erc721Token2);

        uint256[] memory erc721TokenIds = new uint256[](2);
        erc721TokenIds[0] = erc721TokenId1;
        erc721TokenIds[1] = erc721TokenId2;

        address[] memory erc1155Tokens = new address[](1);
        erc1155Tokens[0] = address(erc1155Token1);

        uint256[] memory erc1155TokenIds = new uint256[](1);
        erc1155TokenIds[0] = ERC1155_TOKEN_ID_1;

        uint256[] memory erc1155Amounts = new uint256[](1);
        erc1155Amounts[0] = ERC1155_AMOUNT_1;

        return
            TokenBundleEscrowObligation.StatementData({
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts,
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand")
            });
    }

    // Helper function to create a demand with a different arbiter
    function createDifferentArbiterDemand()
        internal
        view
        returns (TokenBundleEscrowObligation.StatementData memory)
    {
        address[] memory erc20Tokens = new address[](2);
        erc20Tokens[0] = address(erc20Token1);
        erc20Tokens[1] = address(erc20Token2);

        uint256[] memory erc20Amounts = new uint256[](2);
        erc20Amounts[0] = ERC20_AMOUNT_1;
        erc20Amounts[1] = ERC20_AMOUNT_2;

        address[] memory erc721Tokens = new address[](2);
        erc721Tokens[0] = address(erc721Token1);
        erc721Tokens[1] = address(erc721Token2);

        uint256[] memory erc721TokenIds = new uint256[](2);
        erc721TokenIds[0] = erc721TokenId1;
        erc721TokenIds[1] = erc721TokenId2;

        address[] memory erc1155Tokens = new address[](2);
        erc1155Tokens[0] = address(erc1155Token1);
        erc1155Tokens[1] = address(erc1155Token2);

        uint256[] memory erc1155TokenIds = new uint256[](2);
        erc1155TokenIds[0] = ERC1155_TOKEN_ID_1;
        erc1155TokenIds[1] = ERC1155_TOKEN_ID_2;

        uint256[] memory erc1155Amounts = new uint256[](2);
        erc1155Amounts[0] = ERC1155_AMOUNT_1;
        erc1155Amounts[1] = ERC1155_AMOUNT_2;

        return
            TokenBundleEscrowObligation.StatementData({
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts,
                arbiter: address(rejectingArbiter), // Different arbiter
                demand: abi.encode("test demand")
            });
    }

    // Helper function to create a demand with different demand data
    function createDifferentDemandData()
        internal
        view
        returns (TokenBundleEscrowObligation.StatementData memory)
    {
        address[] memory erc20Tokens = new address[](2);
        erc20Tokens[0] = address(erc20Token1);
        erc20Tokens[1] = address(erc20Token2);

        uint256[] memory erc20Amounts = new uint256[](2);
        erc20Amounts[0] = ERC20_AMOUNT_1;
        erc20Amounts[1] = ERC20_AMOUNT_2;

        address[] memory erc721Tokens = new address[](2);
        erc721Tokens[0] = address(erc721Token1);
        erc721Tokens[1] = address(erc721Token2);

        uint256[] memory erc721TokenIds = new uint256[](2);
        erc721TokenIds[0] = erc721TokenId1;
        erc721TokenIds[1] = erc721TokenId2;

        address[] memory erc1155Tokens = new address[](2);
        erc1155Tokens[0] = address(erc1155Token1);
        erc1155Tokens[1] = address(erc1155Token2);

        uint256[] memory erc1155TokenIds = new uint256[](2);
        erc1155TokenIds[0] = ERC1155_TOKEN_ID_1;
        erc1155TokenIds[1] = ERC1155_TOKEN_ID_2;

        uint256[] memory erc1155Amounts = new uint256[](2);
        erc1155Amounts[0] = ERC1155_AMOUNT_1;
        erc1155Amounts[1] = ERC1155_AMOUNT_2;

        return
            TokenBundleEscrowObligation.StatementData({
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts,
                arbiter: address(mockArbiter),
                demand: abi.encode("different demand") // Different demand data
            });
    }

    // Helper function to create a demand with more ERC20 tokens
    function createMoreERC20Demand()
        internal
        returns (TokenBundleEscrowObligation.StatementData memory)
    {
        address[] memory erc20Tokens = new address[](3); // More tokens
        erc20Tokens[0] = address(erc20Token1);
        erc20Tokens[1] = address(erc20Token2);
        erc20Tokens[2] = makeAddr("extraToken");

        uint256[] memory erc20Amounts = new uint256[](3);
        erc20Amounts[0] = ERC20_AMOUNT_1;
        erc20Amounts[1] = ERC20_AMOUNT_2;
        erc20Amounts[2] = 10 * 10 ** 18;

        address[] memory erc721Tokens = new address[](2);
        erc721Tokens[0] = address(erc721Token1);
        erc721Tokens[1] = address(erc721Token2);

        uint256[] memory erc721TokenIds = new uint256[](2);
        erc721TokenIds[0] = erc721TokenId1;
        erc721TokenIds[1] = erc721TokenId2;

        address[] memory erc1155Tokens = new address[](2);
        erc1155Tokens[0] = address(erc1155Token1);
        erc1155Tokens[1] = address(erc1155Token2);

        uint256[] memory erc1155TokenIds = new uint256[](2);
        erc1155TokenIds[0] = ERC1155_TOKEN_ID_1;
        erc1155TokenIds[1] = ERC1155_TOKEN_ID_2;

        uint256[] memory erc1155Amounts = new uint256[](2);
        erc1155Amounts[0] = ERC1155_AMOUNT_1;
        erc1155Amounts[1] = ERC1155_AMOUNT_2;

        return
            TokenBundleEscrowObligation.StatementData({
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts,
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand")
            });
    }

    // Helper function to create a demand with higher ERC20 amount
    function createHigherERC20AmountDemand()
        internal
        view
        returns (TokenBundleEscrowObligation.StatementData memory)
    {
        address[] memory erc20Tokens = new address[](2);
        erc20Tokens[0] = address(erc20Token1);
        erc20Tokens[1] = address(erc20Token2);

        uint256[] memory erc20Amounts = new uint256[](2);
        erc20Amounts[0] = ERC20_AMOUNT_1 + 100 * 10 ** 18; // Higher amount
        erc20Amounts[1] = ERC20_AMOUNT_2;

        address[] memory erc721Tokens = new address[](2);
        erc721Tokens[0] = address(erc721Token1);
        erc721Tokens[1] = address(erc721Token2);

        uint256[] memory erc721TokenIds = new uint256[](2);
        erc721TokenIds[0] = erc721TokenId1;
        erc721TokenIds[1] = erc721TokenId2;

        address[] memory erc1155Tokens = new address[](2);
        erc1155Tokens[0] = address(erc1155Token1);
        erc1155Tokens[1] = address(erc1155Token2);

        uint256[] memory erc1155TokenIds = new uint256[](2);
        erc1155TokenIds[0] = ERC1155_TOKEN_ID_1;
        erc1155TokenIds[1] = ERC1155_TOKEN_ID_2;

        uint256[] memory erc1155Amounts = new uint256[](2);
        erc1155Amounts[0] = ERC1155_AMOUNT_1;
        erc1155Amounts[1] = ERC1155_AMOUNT_2;

        return
            TokenBundleEscrowObligation.StatementData({
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts,
                arbiter: address(mockArbiter),
                demand: abi.encode("test demand")
            });
    }

    // Helper function to verify token transfers to escrow
    function verifyTokensInEscrow() internal view {
        // Verify ERC20 tokens in escrow
        assertEq(
            erc20Token1.balanceOf(address(escrowObligation)),
            ERC20_AMOUNT_1,
            "Escrow should hold ERC20 token 1"
        );
        assertEq(
            erc20Token2.balanceOf(address(escrowObligation)),
            ERC20_AMOUNT_2,
            "Escrow should hold ERC20 token 2"
        );

        // Verify ERC721 tokens in escrow
        assertEq(
            erc721Token1.ownerOf(erc721TokenId1),
            address(escrowObligation),
            "Escrow should hold ERC721 token 1"
        );
        assertEq(
            erc721Token2.ownerOf(erc721TokenId2),
            address(escrowObligation),
            "Escrow should hold ERC721 token 2"
        );

        // Verify ERC1155 tokens in escrow
        assertEq(
            erc1155Token1.balanceOf(
                address(escrowObligation),
                ERC1155_TOKEN_ID_1
            ),
            ERC1155_AMOUNT_1,
            "Escrow should hold ERC1155 token 1"
        );
        assertEq(
            erc1155Token2.balanceOf(
                address(escrowObligation),
                ERC1155_TOKEN_ID_2
            ),
            ERC1155_AMOUNT_2,
            "Escrow should hold ERC1155 token 2"
        );

        // Verify buyer no longer has tokens
        assertEq(
            erc20Token1.balanceOf(buyer),
            0,
            "Buyer should have sent all ERC20 token 1"
        );
        assertEq(
            erc20Token2.balanceOf(buyer),
            0,
            "Buyer should have sent all ERC20 token 2"
        );
        assertEq(
            erc1155Token1.balanceOf(buyer, ERC1155_TOKEN_ID_1),
            0,
            "Buyer should have sent all ERC1155 token 1"
        );
        assertEq(
            erc1155Token2.balanceOf(buyer, ERC1155_TOKEN_ID_2),
            0,
            "Buyer should have sent all ERC1155 token 2"
        );
    }
}
