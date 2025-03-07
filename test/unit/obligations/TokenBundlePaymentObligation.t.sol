// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {TokenBundlePaymentObligation} from "@src/obligations/TokenBundlePaymentObligation.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {IEAS, Attestation, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

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

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

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

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts) public {
        _mintBatch(to, ids, amounts, "");
    }
}

contract TokenBundlePaymentObligationTest is Test {
    TokenBundlePaymentObligation public paymentObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    
    MockERC20 public erc20Token1;
    MockERC20 public erc20Token2;
    MockERC721 public erc721Token1;
    MockERC721 public erc721Token2;
    MockERC1155 public erc1155Token1;
    MockERC1155 public erc1155Token2;

    address public constant EAS_ADDRESS = 0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS = 0xA7b39296258348C78294F95B872b282326A97BDF;

    address internal payer;
    address internal payee;

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

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        paymentObligation = new TokenBundlePaymentObligation(eas, schemaRegistry);
        
        // Create tokens
        erc20Token1 = new MockERC20("Token1", "TKN1");
        erc20Token2 = new MockERC20("Token2", "TKN2");
        erc721Token1 = new MockERC721("MERC721_1", "MERC721_1");
        erc721Token2 = new MockERC721("MERC721_2", "MERC721_2");
        erc1155Token1 = new MockERC1155();
        erc1155Token2 = new MockERC1155();

        payer = makeAddr("payer");
        payee = makeAddr("payee");

        // Fund the payer with tokens
        erc20Token1.transfer(payer, ERC20_AMOUNT_1);
        erc20Token2.transfer(payer, ERC20_AMOUNT_2);
        
        vm.startPrank(address(this));
        erc721TokenId1 = erc721Token1.mint(payer);
        erc721TokenId2 = erc721Token2.mint(payer);
        
        erc1155Token1.mint(payer, ERC1155_TOKEN_ID_1, ERC1155_AMOUNT_1);
        erc1155Token2.mint(payer, ERC1155_TOKEN_ID_2, ERC1155_AMOUNT_2);
        vm.stopPrank();
    }

    function testConstructor() public view {
        // Verify contract was initialized correctly
        bytes32 schemaId = paymentObligation.ATTESTATION_SCHEMA();
        assertNotEq(schemaId, bytes32(0), "Schema should be registered");

        // Verify schema details
        SchemaRecord memory schema = paymentObligation.getSchema();
        assertEq(schema.uid, schemaId, "Schema UID should match");
        assertEq(
            schema.schema,
            "address[] erc20Tokens, uint256[] erc20Amounts, address[] erc721Tokens, uint256[] erc721TokenIds, address[] erc1155Tokens, uint256[] erc1155TokenIds, uint256[] erc1155Amounts, address payee",
            "Schema string should match"
        );
    }

    function testMakeStatement() public {
        // Approve tokens first
        vm.startPrank(payer);
        erc20Token1.approve(address(paymentObligation), ERC20_AMOUNT_1);
        erc20Token2.approve(address(paymentObligation), ERC20_AMOUNT_2);
        erc721Token1.approve(address(paymentObligation), erc721TokenId1);
        erc721Token2.approve(address(paymentObligation), erc721TokenId2);
        erc1155Token1.setApprovalForAll(address(paymentObligation), true);
        erc1155Token2.setApprovalForAll(address(paymentObligation), true);

        // Create the bundle data
        TokenBundlePaymentObligation.StatementData memory data = createFullBundleData();

        bytes32 uid = paymentObligation.makeStatement(data);
        vm.stopPrank();

        // Verify attestation exists
        assertNotEq(uid, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = paymentObligation.getStatement(uid);
        assertEq(
            attestation.schema,
            paymentObligation.ATTESTATION_SCHEMA(),
            "Schema should match"
        );
        assertEq(attestation.recipient, payer, "Recipient should be the payer");

        // Verify token transfers to payee
        verifyTokensTransferredToPayee();
    }

    function testMakeStatementFor() public {
        // Approve tokens first
        vm.startPrank(payer);
        erc20Token1.approve(address(paymentObligation), ERC20_AMOUNT_1);
        erc20Token2.approve(address(paymentObligation), ERC20_AMOUNT_2);
        erc721Token1.approve(address(paymentObligation), erc721TokenId1);
        erc721Token2.approve(address(paymentObligation), erc721TokenId2);
        erc1155Token1.setApprovalForAll(address(paymentObligation), true);
        erc1155Token2.setApprovalForAll(address(paymentObligation), true);
        vm.stopPrank();

        // Create the bundle data
        TokenBundlePaymentObligation.StatementData memory data = createFullBundleData();

        address recipient = makeAddr("recipient");
        
        vm.prank(address(this));
        bytes32 uid = paymentObligation.makeStatementFor(data, payer, recipient);

        // Verify attestation exists
        assertNotEq(uid, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = paymentObligation.getStatement(uid);
        assertEq(
            attestation.schema,
            paymentObligation.ATTESTATION_SCHEMA(),
            "Schema should match"
        );
        assertEq(attestation.recipient, recipient, "Recipient should be the specified recipient");

        // Verify token transfers to payee
        verifyTokensTransferredToPayee();
    }

    function testERC20OnlyPayment() public {
        // Approve ERC20 tokens only
        vm.startPrank(payer);
        erc20Token1.approve(address(paymentObligation), ERC20_AMOUNT_1);
        erc20Token2.approve(address(paymentObligation), ERC20_AMOUNT_2);

        // Create bundle with only ERC20 tokens
        TokenBundlePaymentObligation.StatementData memory data = createERC20OnlyBundleData();

        bytes32 uid = paymentObligation.makeStatement(data);
        vm.stopPrank();

        // Verify attestation exists
        assertNotEq(uid, bytes32(0), "Attestation should be created");

        // Verify ERC20 token transfers to payee
        assertEq(
            erc20Token1.balanceOf(payee),
            ERC20_AMOUNT_1,
            "Payee should have received ERC20 token 1"
        );
        assertEq(
            erc20Token2.balanceOf(payee),
            ERC20_AMOUNT_2,
            "Payee should have received ERC20 token 2"
        );
        assertEq(
            erc20Token1.balanceOf(payer),
            0,
            "Payer should have sent all ERC20 token 1"
        );
        assertEq(
            erc20Token2.balanceOf(payer),
            0,
            "Payer should have sent all ERC20 token 2"
        );
    }

    function testERC721OnlyPayment() public {
        // Approve ERC721 tokens only
        vm.startPrank(payer);
        erc721Token1.approve(address(paymentObligation), erc721TokenId1);
        erc721Token2.approve(address(paymentObligation), erc721TokenId2);

        // Create bundle with only ERC721 tokens
        TokenBundlePaymentObligation.StatementData memory data = createERC721OnlyBundleData();

        bytes32 uid = paymentObligation.makeStatement(data);
        vm.stopPrank();

        // Verify attestation exists
        assertNotEq(uid, bytes32(0), "Attestation should be created");

        // Verify ERC721 token transfers to payee
        assertEq(
            erc721Token1.ownerOf(erc721TokenId1),
            payee,
            "Payee should have received ERC721 token 1"
        );
        assertEq(
            erc721Token2.ownerOf(erc721TokenId2),
            payee,
            "Payee should have received ERC721 token 2"
        );
    }

    function testERC1155OnlyPayment() public {
        // Approve ERC1155 tokens only
        vm.startPrank(payer);
        erc1155Token1.setApprovalForAll(address(paymentObligation), true);
        erc1155Token2.setApprovalForAll(address(paymentObligation), true);

        // Create bundle with only ERC1155 tokens
        TokenBundlePaymentObligation.StatementData memory data = createERC1155OnlyBundleData();

        bytes32 uid = paymentObligation.makeStatement(data);
        vm.stopPrank();

        // Verify attestation exists
        assertNotEq(uid, bytes32(0), "Attestation should be created");

        // Verify ERC1155 token transfers to payee
        assertEq(
            erc1155Token1.balanceOf(payee, ERC1155_TOKEN_ID_1),
            ERC1155_AMOUNT_1,
            "Payee should have received ERC1155 token 1"
        );
        assertEq(
            erc1155Token2.balanceOf(payee, ERC1155_TOKEN_ID_2),
            ERC1155_AMOUNT_2,
            "Payee should have received ERC1155 token 2"
        );
        assertEq(
            erc1155Token1.balanceOf(payer, ERC1155_TOKEN_ID_1),
            0,
            "Payer should have sent all ERC1155 token 1"
        );
        assertEq(
            erc1155Token2.balanceOf(payer, ERC1155_TOKEN_ID_2),
            0,
            "Payer should have sent all ERC1155 token 2"
        );
    }

    function testArrayLengthMismatchReverts() public {
        // Set up token approvals
        vm.startPrank(payer);
        erc20Token1.approve(address(paymentObligation), ERC20_AMOUNT_1);
        
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
        
        TokenBundlePaymentObligation.StatementData memory data = TokenBundlePaymentObligation.StatementData({
            erc20Tokens: erc20Tokens,
            erc20Amounts: erc20Amounts,
            erc721Tokens: erc721Tokens,
            erc721TokenIds: erc721TokenIds,
            erc1155Tokens: erc1155Tokens,
            erc1155TokenIds: erc1155TokenIds,
            erc1155Amounts: erc1155Amounts,
            payee: payee
        });
        
        // Should revert with ArrayLengthMismatch
        vm.expectRevert(TokenBundlePaymentObligation.ArrayLengthMismatch.selector);
        paymentObligation.makeStatement(data);
        vm.stopPrank();
    }

    function testInvalidTransferReverts() public {
        // Set up with insufficient balance
        vm.startPrank(payer);
        erc20Token1.approve(address(paymentObligation), ERC20_AMOUNT_1 * 10); // More than payer has

        // Create bundle data with more tokens than payer has
        address[] memory erc20Tokens = new address[](1);
        erc20Tokens[0] = address(erc20Token1);
        
        uint256[] memory erc20Amounts = new uint256[](1);
        erc20Amounts[0] = ERC20_AMOUNT_1 * 10; // More than available balance
        
        // Empty arrays for other token types
        address[] memory erc721Tokens = new address[](0);
        uint256[] memory erc721TokenIds = new uint256[](0);
        address[] memory erc1155Tokens = new address[](0);
        uint256[] memory erc1155TokenIds = new uint256[](0);
        uint256[] memory erc1155Amounts = new uint256[](0);
        
        TokenBundlePaymentObligation.StatementData memory data = TokenBundlePaymentObligation.StatementData({
            erc20Tokens: erc20Tokens,
            erc20Amounts: erc20Amounts,
            erc721Tokens: erc721Tokens,
            erc721TokenIds: erc721TokenIds,
            erc1155Tokens: erc1155Tokens,
            erc1155TokenIds: erc1155TokenIds,
            erc1155Amounts: erc1155Amounts,
            payee: payee
        });
        
        // Should revert with InvalidTransfer
        vm.expectRevert(TokenBundlePaymentObligation.InvalidTransfer.selector);
        paymentObligation.makeStatement(data);
        vm.stopPrank();
    }

    function testCheckStatement() public {
        // First create an attestation to use for testing
        vm.startPrank(payer);
        erc20Token1.approve(address(paymentObligation), ERC20_AMOUNT_1);
        erc20Token2.approve(address(paymentObligation), ERC20_AMOUNT_2);
        erc721Token1.approve(address(paymentObligation), erc721TokenId1);
        erc721Token2.approve(address(paymentObligation), erc721TokenId2);
        erc1155Token1.setApprovalForAll(address(paymentObligation), true);
        erc1155Token2.setApprovalForAll(address(paymentObligation), true);

        TokenBundlePaymentObligation.StatementData memory data = createFullBundleData();
        bytes32 attestationId = paymentObligation.makeStatement(data);
        vm.stopPrank();

        Attestation memory attestation = paymentObligation.getStatement(attestationId);

        // Test exact match
        TokenBundlePaymentObligation.StatementData memory exactDemand = createFullBundleData();
        bool exactMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(exactDemand),
            bytes32(0)
        );
        assertTrue(exactMatch, "Should match exact demand");

        // Test subset of ERC20 tokens (should succeed)
        TokenBundlePaymentObligation.StatementData memory erc20SubsetDemand = createSubsetERC20Demand();
        bool erc20SubsetMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(erc20SubsetDemand),
            bytes32(0)
        );
        assertTrue(erc20SubsetMatch, "Should match subset of ERC20 tokens");

        // Test lower ERC20 amount (should succeed)
        TokenBundlePaymentObligation.StatementData memory lowerERC20AmountDemand = createLowerERC20AmountDemand();
        bool lowerERC20AmountMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(lowerERC20AmountDemand),
            bytes32(0)
        );
        assertTrue(lowerERC20AmountMatch, "Should match lower ERC20 amount demand");

        // Test subset of ERC721 tokens (should succeed)
        TokenBundlePaymentObligation.StatementData memory erc721SubsetDemand = createSubsetERC721Demand();
        bool erc721SubsetMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(erc721SubsetDemand),
            bytes32(0)
        );
        assertTrue(erc721SubsetMatch, "Should match subset of ERC721 tokens");

        // Test subset of ERC1155 tokens (should succeed)
        TokenBundlePaymentObligation.StatementData memory erc1155SubsetDemand = createSubsetERC1155Demand();
        bool erc1155SubsetMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(erc1155SubsetDemand),
            bytes32(0)
        );
        assertTrue(erc1155SubsetMatch, "Should match subset of ERC1155 tokens");

        // Test more ERC20 tokens than in the payment (should fail)
        TokenBundlePaymentObligation.StatementData memory moreERC20Demand = createMoreERC20Demand();
        bool moreERC20Match = paymentObligation.checkStatement(
            attestation,
            abi.encode(moreERC20Demand),
            bytes32(0)
        );
        assertFalse(moreERC20Match, "Should not match when demanding more ERC20 tokens");

        // Test higher ERC20 amount than in the payment (should fail)
        TokenBundlePaymentObligation.StatementData memory higherERC20AmountDemand = createHigherERC20AmountDemand();
        bool higherERC20AmountMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(higherERC20AmountDemand),
            bytes32(0)
        );
        assertFalse(higherERC20AmountMatch, "Should not match when demanding higher ERC20 amount");

        // Test different payee (should fail)
        TokenBundlePaymentObligation.StatementData memory differentPayeeDemand = createDifferentPayeeDemand();
        bool differentPayeeMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(differentPayeeDemand),
            bytes32(0)
        );
        assertFalse(differentPayeeMatch, "Should not match different payee demand");

        // Test with different schema (should fail)
        vm.prank(payer);
        bytes32 differentSchemaId = eas.attest(
            AttestationRequest({
                schema: bytes32(uint256(1)), // Different schema
                data: AttestationRequestData({
                    recipient: payer,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode("random data"),
                    value: 0
                })
            })
        );

        Attestation memory differentSchemaAttestation = eas.getAttestation(differentSchemaId);
        bool differentSchemaMatch = paymentObligation.checkStatement(
            differentSchemaAttestation,
            abi.encode(exactDemand),
            bytes32(0)
        );
        assertFalse(differentSchemaMatch, "Should not match attestation with different schema");
    }

    // Helper function to create a complete bundle data
    function createFullBundleData() internal view returns (TokenBundlePaymentObligation.StatementData memory) {
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
        
        return TokenBundlePaymentObligation.StatementData({
            erc20Tokens: erc20Tokens,
            erc20Amounts: erc20Amounts,
            erc721Tokens: erc721Tokens,
            erc721TokenIds: erc721TokenIds,
            erc1155Tokens: erc1155Tokens,
            erc1155TokenIds: erc1155TokenIds,
            erc1155Amounts: erc1155Amounts,
            payee: payee
        });
    }

    // Helper function to create an ERC20-only bundle
    function createERC20OnlyBundleData() internal view returns (TokenBundlePaymentObligation.StatementData memory) {
        address[] memory erc20Tokens = new address[](2);
        erc20Tokens[0] = address(erc20Token1);
        erc20Tokens[1] = address(erc20Token2);
        
        uint256[] memory erc20Amounts = new uint256[](2);
        erc20Amounts[0] = ERC20_AMOUNT_1;
        erc20Amounts[1] = ERC20_AMOUNT_2;
        
        // Empty arrays for other token types
        address[] memory erc721Tokens = new address[](0);
        uint256[] memory erc721TokenIds = new uint256[](0);
        address[] memory erc1155Tokens = new address[](0);
        uint256[] memory erc1155TokenIds = new uint256[](0);
        uint256[] memory erc1155Amounts = new uint256[](0);
        
        return TokenBundlePaymentObligation.StatementData({
            erc20Tokens: erc20Tokens,
            erc20Amounts: erc20Amounts,
            erc721Tokens: erc721Tokens,
            erc721TokenIds: erc721TokenIds,
            erc1155Tokens: erc1155Tokens,
            erc1155TokenIds: erc1155TokenIds,
            erc1155Amounts: erc1155Amounts,
            payee: payee
        });
    }

    // Helper function to create an ERC721-only bundle
    function createERC721OnlyBundleData() internal view returns (TokenBundlePaymentObligation.StatementData memory) {
        // Empty arrays for ERC20
        address[] memory erc20Tokens = new address[](0);
        uint256[] memory erc20Amounts = new uint256[](0);
        
        address[] memory erc721Tokens = new address[](2);
        erc721Tokens[0] = address(erc721Token1);
        erc721Tokens[1] = address(erc721Token2);
        
        uint256[] memory erc721TokenIds = new uint256[](2);
        erc721TokenIds[0] = erc721TokenId1;
        erc721TokenIds[1] = erc721TokenId2;
        
        // Empty arrays for ERC1155
        address[] memory erc1155Tokens = new address[](0);
        uint256[] memory erc1155TokenIds = new uint256[](0);
        uint256[] memory erc1155Amounts = new uint256[](0);
        
        return TokenBundlePaymentObligation.StatementData({
            erc20Tokens: erc20Tokens,
            erc20Amounts: erc20Amounts,
            erc721Tokens: erc721Tokens,
            erc721TokenIds: erc721TokenIds,
            erc1155Tokens: erc1155Tokens,
            erc1155TokenIds: erc1155TokenIds,
            erc1155Amounts: erc1155Amounts,
            payee: payee
        });
    }

    // Helper function to create an ERC1155-only bundle
    function createERC1155OnlyBundleData() internal view returns (TokenBundlePaymentObligation.StatementData memory) {
        // Empty arrays for ERC20
        address[] memory erc20Tokens = new address[](0);
        uint256[] memory erc20Amounts = new uint256[](0);
        
        // Empty arrays for ERC721
        address[] memory erc721Tokens = new address[](0);
        uint256[] memory erc721TokenIds = new uint256[](0);
        
        address[] memory erc1155Tokens = new address[](2);
        erc1155Tokens[0] = address(erc1155Token1);
        erc1155Tokens[1] = address(erc1155Token2);
        
        uint256[] memory erc1155TokenIds = new uint256[](2);
        erc1155TokenIds[0] = ERC1155_TOKEN_ID_1;
        erc1155TokenIds[1] = ERC1155_TOKEN_ID_2;
        
        uint256[] memory erc1155Amounts = new uint256[](2);
        erc1155Amounts[0] = ERC1155_AMOUNT_1;
        erc1155Amounts[1] = ERC1155_AMOUNT_2;
        
        return TokenBundlePaymentObligation.StatementData({
            erc20Tokens: erc20Tokens,
            erc20Amounts: erc20Amounts,
            erc721Tokens: erc721Tokens,
            erc721TokenIds: erc721TokenIds,
            erc1155Tokens: erc1155Tokens,
            erc1155TokenIds: erc1155TokenIds,
            erc1155Amounts: erc1155Amounts,
            payee: payee
        });
    }

    // Helper function to create a subset ERC20 demand
    function createSubsetERC20Demand() internal view returns (TokenBundlePaymentObligation.StatementData memory) {
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
        
        return TokenBundlePaymentObligation.StatementData({
            erc20Tokens: erc20Tokens,
            erc20Amounts: erc20Amounts,
            erc721Tokens: erc721Tokens,
            erc721TokenIds: erc721TokenIds,
            erc1155Tokens: erc1155Tokens,
            erc1155TokenIds: erc1155TokenIds,
            erc1155Amounts: erc1155Amounts,
            payee: payee
        });
    }

    // Helper function to create a lower ERC20 amount demand
    function createLowerERC20AmountDemand() internal view returns (TokenBundlePaymentObligation.StatementData memory) {
        address[] memory erc20Tokens = new address[](2);
        erc20Tokens[0] = address(erc20Token1);
        erc20Tokens[1] = address(erc20Token2);
        
        uint256[] memory erc20Amounts = new uint256[](2);
        erc20Amounts[0] = ERC20_AMOUNT_1 / 2; // Lower amount
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
        
        return TokenBundlePaymentObligation.StatementData({
            erc20Tokens: erc20Tokens,
            erc20Amounts: erc20Amounts,
            erc721Tokens: erc721Tokens,
            erc721TokenIds: erc721TokenIds,
            erc1155Tokens: erc1155Tokens,
            erc1155TokenIds: erc1155TokenIds,
            erc1155Amounts: erc1155Amounts,
            payee: payee
        });
    }

    // Helper function to create a subset ERC721 demand
    function createSubsetERC721Demand() internal view returns (TokenBundlePaymentObligation.StatementData memory) {
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
        
        return TokenBundlePaymentObligation.StatementData({
            erc20Tokens: erc20Tokens,
            erc20Amounts: erc20Amounts,
            erc721Tokens: erc721Tokens,
            erc721TokenIds: erc721TokenIds,
            erc1155Tokens: erc1155Tokens,
            erc1155TokenIds: erc1155TokenIds,
            erc1155Amounts: erc1155Amounts,
            payee: payee
        });
    }

    // Helper function to create a subset ERC1155 demand
    function createSubsetERC1155Demand() internal view returns (TokenBundlePaymentObligation.StatementData memory) {
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
        
        return TokenBundlePaymentObligation.StatementData({
            erc20Tokens: erc20Tokens,
            erc20Amounts: erc20Amounts,
            erc721Tokens: erc721Tokens,
            erc721TokenIds: erc721TokenIds,
            erc1155Tokens: erc1155Tokens,
            erc1155TokenIds: erc1155TokenIds,
            erc1155Amounts: erc1155Amounts,
            payee: payee
        });
    }

    // Helper function to create a demand with more ERC20 tokens
    function createMoreERC20Demand() internal view returns (TokenBundlePaymentObligation.StatementData memory) {
        address[] memory erc20Tokens = new address[](3); // More tokens
        erc20Tokens[0] = address(1); // Placeholder
        erc20Tokens[1] = address(2); // Placeholder
        erc20Tokens[2] = address(3); // Placeholder
        
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
        
        return TokenBundlePaymentObligation.StatementData({
            erc20Tokens: erc20Tokens,
            erc20Amounts: erc20Amounts,
            erc721Tokens: erc721Tokens,
            erc721TokenIds: erc721TokenIds,
            erc1155Tokens: erc1155Tokens,
            erc1155TokenIds: erc1155TokenIds,
            erc1155Amounts: erc1155Amounts,
            payee: payee
        });
    }

    // Helper function to create a demand with higher ERC20 amount
    function createHigherERC20AmountDemand() internal view returns (TokenBundlePaymentObligation.StatementData memory) {
        address[] memory erc20Tokens = new address[](2);
        erc20Tokens[0] = address(erc20Token1);
        erc20Tokens[1] = address(erc20Token2);
        
        uint256[] memory erc20Amounts = new uint256[](2);
        erc20Amounts[0] = ERC20_AMOUNT_1 * 2; // Higher amount
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
        
        return TokenBundlePaymentObligation.StatementData({
            erc20Tokens: erc20Tokens,
            erc20Amounts: erc20Amounts,
            erc721Tokens: erc721Tokens,
            erc721TokenIds: erc721TokenIds,
            erc1155Tokens: erc1155Tokens,
            erc1155TokenIds: erc1155TokenIds,
            erc1155Amounts: erc1155Amounts,
            payee: payee
        });
    }

    // Helper function to create a demand with different payee
    function createDifferentPayeeDemand() internal returns (TokenBundlePaymentObligation.StatementData memory) {
        address differentPayee = makeAddr("differentPayee");
        
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
        
        return TokenBundlePaymentObligation.StatementData({
            erc20Tokens: erc20Tokens,
            erc20Amounts: erc20Amounts,
            erc721Tokens: erc721Tokens,
            erc721TokenIds: erc721TokenIds,
            erc1155Tokens: erc1155Tokens,
            erc1155TokenIds: erc1155TokenIds,
            erc1155Amounts: erc1155Amounts,
            payee: differentPayee // Different payee
        });
    }

    // Helper function to verify token transfers to payee
    function verifyTokensTransferredToPayee() internal view {
        // Verify ERC20 tokens transferred to payee
        assertEq(
            erc20Token1.balanceOf(payee),
            ERC20_AMOUNT_1,
            "Payee should have received ERC20 token 1"
        );
        assertEq(
            erc20Token2.balanceOf(payee),
            ERC20_AMOUNT_2,
            "Payee should have received ERC20 token 2"
        );
        
        // Verify ERC721 tokens transferred to payee
        assertEq(
            erc721Token1.ownerOf(erc721TokenId1),
            payee,
            "Payee should have received ERC721 token 1"
        );
        assertEq(
            erc721Token2.ownerOf(erc721TokenId2),
            payee,
            "Payee should have received ERC721 token 2"
        );
        
        // Verify ERC1155 tokens transferred to payee
        assertEq(
            erc1155Token1.balanceOf(payee, ERC1155_TOKEN_ID_1),
            ERC1155_AMOUNT_1,
            "Payee should have received ERC1155 token 1"
        );
        assertEq(
            erc1155Token2.balanceOf(payee, ERC1155_TOKEN_ID_2),
            ERC1155_AMOUNT_2,
            "Payee should have received ERC1155 token 2"
        );
        
        // Verify payer no longer has tokens
        assertEq(
            erc20Token1.balanceOf(payer),
            0,
            "Payer should have sent all ERC20 token 1"
        );
        assertEq(
            erc20Token2.balanceOf(payer),
            0,
            "Payer should have sent all ERC20 token 2"
        );
        assertEq(
            erc1155Token1.balanceOf(payer, ERC1155_TOKEN_ID_1),
            0,
            "Payer should have sent all ERC1155 token 1"
        );
        assertEq(
            erc1155Token2.balanceOf(payer, ERC1155_TOKEN_ID_2),
            0,
            "Payer should have sent all ERC1155 token 2"
        );
    }
}