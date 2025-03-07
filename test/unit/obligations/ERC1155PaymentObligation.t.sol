// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC1155PaymentObligation} from "@src/obligations/ERC1155PaymentObligation.sol";
import {IEAS, Attestation, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

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

contract ERC1155PaymentObligationTest is Test {
    ERC1155PaymentObligation public paymentObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    MockERC1155 public token;

    address public constant EAS_ADDRESS =
        0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS =
        0xA7b39296258348C78294F95B872b282326A97BDF;

    address internal payer;
    address internal payee;
    uint256 internal tokenId = 1;
    uint256 internal erc1155TokenAmount = 100;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        paymentObligation = new ERC1155PaymentObligation(eas, schemaRegistry);
        token = new MockERC1155();

        payer = makeAddr("payer");
        payee = makeAddr("payee");

        // Mint tokens for the payer
        token.mint(payer, tokenId, erc1155TokenAmount);
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
            "address token, uint256 tokenId, uint256 amount, address payee",
            "Schema string should match"
        );
    }

    function testMakeStatement() public {
        // Approve tokens first
        vm.startPrank(payer);
        token.setApprovalForAll(address(paymentObligation), true);

        // Make payment
        ERC1155PaymentObligation.StatementData memory data = ERC1155PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            amount: erc1155TokenAmount,
            payee: payee
        });

        bytes32 attestationId = paymentObligation.makeStatement(data);
        vm.stopPrank();

        // Verify attestation exists
        assertNotEq(attestationId, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = paymentObligation.getStatement(attestationId);
        assertEq(
            attestation.schema,
            paymentObligation.ATTESTATION_SCHEMA(),
            "Schema should match"
        );
        assertEq(attestation.recipient, payer, "Recipient should be the payer");

        // Verify token transfer
        assertEq(
            token.balanceOf(payee, tokenId),
            erc1155TokenAmount,
            "Payee should have received tokens"
        );
        assertEq(
            token.balanceOf(payer, tokenId),
            0,
            "Payer should have sent tokens"
        );
    }

    function testMakeStatementFor() public {
        // Approve tokens first
        vm.startPrank(payer);
        token.setApprovalForAll(address(paymentObligation), true);
        vm.stopPrank();

        // Make payment on behalf of payer
        ERC1155PaymentObligation.StatementData memory data = ERC1155PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            amount: erc1155TokenAmount,
            payee: payee
        });

        address recipient = makeAddr("recipient");
        
        vm.prank(address(this));
        bytes32 attestationId = paymentObligation.makeStatementFor(
            data,
            payer,
            recipient
        );

        // Verify attestation exists
        assertNotEq(attestationId, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = paymentObligation.getStatement(attestationId);
        assertEq(
            attestation.schema,
            paymentObligation.ATTESTATION_SCHEMA(),
            "Schema should match"
        );
        assertEq(
            attestation.recipient,
            recipient,
            "Recipient should be the specified recipient"
        );

        // Verify token transfer
        assertEq(
            token.balanceOf(payee, tokenId),
            erc1155TokenAmount,
            "Payee should have received tokens"
        );
        assertEq(
            token.balanceOf(payer, tokenId),
            0,
            "Payer should have sent tokens"
        );
    }

    function testPartialAmount() public {
        uint256 partialAmount = erc1155TokenAmount / 2;
        
        // Approve tokens first
        vm.startPrank(payer);
        token.setApprovalForAll(address(paymentObligation), true);

        // Make payment with partial amount
        ERC1155PaymentObligation.StatementData memory data = ERC1155PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            amount: partialAmount,
            payee: payee
        });

        bytes32 attestationId = paymentObligation.makeStatement(data);
        vm.stopPrank();

        // Verify attestation exists
        assertNotEq(attestationId, bytes32(0), "Attestation should be created");

        // Verify token transfer
        assertEq(
            token.balanceOf(payee, tokenId),
            partialAmount,
            "Payee should have received partial tokens"
        );
        assertEq(
            token.balanceOf(payer, tokenId),
            erc1155TokenAmount - partialAmount,
            "Payer should still have remaining tokens"
        );
    }

    function testCheckStatement() public {
        // Create a payment first
        vm.startPrank(payer);
        token.setApprovalForAll(address(paymentObligation), true);

        ERC1155PaymentObligation.StatementData memory data = ERC1155PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            amount: erc1155TokenAmount,
            payee: payee
        });

        bytes32 attestationId = paymentObligation.makeStatement(data);
        vm.stopPrank();

        // Get the attestation
        Attestation memory attestation = paymentObligation.getStatement(attestationId);

        // Test exact match demand
        ERC1155PaymentObligation.StatementData memory exactDemand = ERC1155PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            amount: erc1155TokenAmount,
            payee: payee
        });

        bool exactMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(exactDemand),
            bytes32(0)
        );
        assertTrue(exactMatch, "Should match exact demand");

        // Test lower amount demand (should succeed)
        ERC1155PaymentObligation.StatementData memory lowerDemand = ERC1155PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            amount: erc1155TokenAmount - 50,
            payee: payee
        });

        bool lowerMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(lowerDemand),
            bytes32(0)
        );
        assertTrue(lowerMatch, "Should match lower amount demand");

        // Test higher amount demand (should fail)
        ERC1155PaymentObligation.StatementData memory higherDemand = ERC1155PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            amount: erc1155TokenAmount + 50,
            payee: payee
        });

        bool higherMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(higherDemand),
            bytes32(0)
        );
        assertFalse(higherMatch, "Should not match higher amount demand");

        // Test different token ID demand (should fail)
        ERC1155PaymentObligation.StatementData memory differentIdDemand = ERC1155PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId + 1,
            amount: erc1155TokenAmount,
            payee: payee
        });

        bool differentIdMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(differentIdDemand),
            bytes32(0)
        );
        assertFalse(differentIdMatch, "Should not match different token ID demand");

        // Test different token contract demand (should fail)
        MockERC1155 differentToken = new MockERC1155();
        ERC1155PaymentObligation.StatementData memory differentTokenDemand = ERC1155PaymentObligation.StatementData({
            token: address(differentToken),
            tokenId: tokenId,
            amount: erc1155TokenAmount,
            payee: payee
        });

        bool differentTokenMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(differentTokenDemand),
            bytes32(0)
        );
        assertFalse(differentTokenMatch, "Should not match different token demand");

        // Test different payee demand (should fail)
        address differentPayee = makeAddr("differentPayee");
        ERC1155PaymentObligation.StatementData memory differentPayeeDemand = ERC1155PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            amount: erc1155TokenAmount,
            payee: differentPayee
        });

        bool differentPayeeMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(differentPayeeDemand),
            bytes32(0)
        );
        assertFalse(differentPayeeMatch, "Should not match different payee demand");
    }

    function testInvalidAttestation() public {
        // Create an attestation with a different schema
        vm.prank(payer);
        bytes32 attestationId = eas.attest(
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

        Attestation memory attestation = eas.getAttestation(attestationId);

        // Test with any demand - should fail because of schema mismatch
        ERC1155PaymentObligation.StatementData memory demand = ERC1155PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            amount: erc1155TokenAmount,
            payee: payee
        });

        bool result = paymentObligation.checkStatement(
            attestation,
            abi.encode(demand),
            bytes32(0)
        );
        assertFalse(result, "Should not match attestation with different schema");
    }

    function testTransferFailureReverts() public {
        // Mint a token for a different address that won't approve the transfer
        address otherOwner = makeAddr("otherOwner");
        uint256 otherTokenId = 2;
        token.mint(otherOwner, otherTokenId, erc1155TokenAmount);

        // Try to create payment with a token that hasn't been approved for transfer
        ERC1155PaymentObligation.StatementData memory data = ERC1155PaymentObligation.StatementData({
            token: address(token),
            tokenId: otherTokenId,
            amount: erc1155TokenAmount,
            payee: payee
        });

        // Should revert because the token transfer will fail
        vm.expectRevert();
        paymentObligation.makeStatementFor(data, otherOwner, otherOwner);
    }

    function testMultipleTokens() public {
        // Mint different token IDs to payer
        uint256 tokenId2 = 2;
        uint256 erc1155TokenAmount2 = 200;
        token.mint(payer, tokenId2, erc1155TokenAmount2);
        
        // Approve tokens
        vm.startPrank(payer);
        token.setApprovalForAll(address(paymentObligation), true);

        // Make first payment
        ERC1155PaymentObligation.StatementData memory data1 = ERC1155PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            amount: erc1155TokenAmount,
            payee: payee
        });

        bytes32 attestationId1 = paymentObligation.makeStatement(data1);
        
        // Make second payment
        ERC1155PaymentObligation.StatementData memory data2 = ERC1155PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId2,
            amount: erc1155TokenAmount2,
            payee: payee
        });

        bytes32 attestationId2 = paymentObligation.makeStatement(data2);
        vm.stopPrank();

        // Verify both attestations exist
        assertNotEq(attestationId1, bytes32(0), "First attestation should be created");
        assertNotEq(attestationId2, bytes32(0), "Second attestation should be created");

        // Verify token transfers for both IDs
        assertEq(
            token.balanceOf(payee, tokenId),
            erc1155TokenAmount,
            "Payee should have received first token"
        );
        assertEq(
            token.balanceOf(payee, tokenId2),
            erc1155TokenAmount2,
            "Payee should have received second token"
        );
        assertEq(
            token.balanceOf(payer, tokenId),
            0,
            "Payer should have sent all of first token"
        );
        assertEq(
            token.balanceOf(payer, tokenId2),
            0,
            "Payer should have sent all of second token"
        );
    }
}