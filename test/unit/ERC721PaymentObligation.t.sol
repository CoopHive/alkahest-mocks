// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC721PaymentObligation} from "../../src/obligations/ERC721PaymentObligation.sol";
import {IArbiter} from "../../src/IArbiter.sol";
import {IEAS, Attestation, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Mock ERC721 token for testing
contract MockERC721 is ERC721 {
    uint256 private _nextTokenId;

    constructor() ERC721("Mock ERC721", "MERC721") {}

    function mint(address to) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        return tokenId;
    }
}

contract ERC721PaymentObligationTest is Test {
    ERC721PaymentObligation public paymentObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    MockERC721 public token;

    address public constant EAS_ADDRESS =
        0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS =
        0xA7b39296258348C78294F95B872b282326A97BDF;

    address internal payer;
    address internal payee;
    uint256 internal tokenId;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        paymentObligation = new ERC721PaymentObligation(eas, schemaRegistry);
        token = new MockERC721();

        payer = makeAddr("payer");
        payee = makeAddr("payee");

        // Mint a token for the payer
        vm.prank(address(this));
        tokenId = token.mint(payer);
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
            "address token, uint256 tokenId, address payee",
            "Schema string should match"
        );
    }

    function testMakeStatement() public {
        // Approve token transfer first
        vm.startPrank(payer);
        token.approve(address(paymentObligation), tokenId);

        // Make payment
        ERC721PaymentObligation.StatementData memory data = ERC721PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
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
            token.ownerOf(tokenId),
            payee,
            "Payee should have received the token"
        );
    }

    function testMakeStatementFor() public {
        // Approve token transfer first
        vm.startPrank(payer);
        token.approve(address(paymentObligation), tokenId);
        vm.stopPrank();

        // Make payment on behalf of payer
        ERC721PaymentObligation.StatementData memory data = ERC721PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
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
            token.ownerOf(tokenId),
            payee,
            "Payee should have received the token"
        );
    }

    function testCheckStatement() public {
        // Create a payment first
        vm.startPrank(payer);
        token.approve(address(paymentObligation), tokenId);

        ERC721PaymentObligation.StatementData memory data = ERC721PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            payee: payee
        });

        bytes32 attestationId = paymentObligation.makeStatement(data);
        vm.stopPrank();

        // Get the attestation
        Attestation memory attestation = paymentObligation.getStatement(attestationId);

        // Test exact match demand
        ERC721PaymentObligation.StatementData memory exactDemand = ERC721PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            payee: payee
        });

        bool exactMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(exactDemand),
            bytes32(0)
        );
        assertTrue(exactMatch, "Should match exact demand");

        // Test different token ID demand (should fail)
        uint256 differentTokenId = 999;
        ERC721PaymentObligation.StatementData memory differentTokenIdDemand = ERC721PaymentObligation.StatementData({
            token: address(token),
            tokenId: differentTokenId,
            payee: payee
        });

        bool differentTokenIdMatch = paymentObligation.checkStatement(
            attestation,
            abi.encode(differentTokenIdDemand),
            bytes32(0)
        );
        assertFalse(differentTokenIdMatch, "Should not match different token ID demand");

        // Test different token contract demand (should fail)
        MockERC721 differentToken = new MockERC721();
        ERC721PaymentObligation.StatementData memory differentTokenDemand = ERC721PaymentObligation.StatementData({
            token: address(differentToken),
            tokenId: tokenId,
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
        ERC721PaymentObligation.StatementData memory differentPayeeDemand = ERC721PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
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
        ERC721PaymentObligation.StatementData memory demand = ERC721PaymentObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
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
        uint256 otherTokenId = token.mint(otherOwner);

        // Try to create payment with a token that hasn't been approved for transfer
        ERC721PaymentObligation.StatementData memory data = ERC721PaymentObligation.StatementData({
            token: address(token),
            tokenId: otherTokenId,
            payee: payee
        });

        // Should revert because the token transfer will fail
        vm.expectRevert();
        paymentObligation.makeStatementFor(data, otherOwner, otherOwner);
    }
}