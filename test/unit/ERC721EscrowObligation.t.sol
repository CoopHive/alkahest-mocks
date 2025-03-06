// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC721EscrowObligation} from "../../src/Statements/ERC721EscrowObligation.sol";
import {IArbiter} from "../../src/IArbiter.sol";
import {IEAS, Attestation, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
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

// Mock Arbiter for testing
contract MockArbiter is IArbiter {
    bool private shouldAccept;
    
    constructor(bool _shouldAccept) {
        shouldAccept = _shouldAccept;
    }
    
    function setShouldAccept(bool _shouldAccept) public {
        shouldAccept = _shouldAccept;
    }
    
    function checkStatement(
        Attestation memory, 
        bytes memory, 
        bytes32
    ) public view override returns (bool) {
        return shouldAccept;
    }
}

contract ERC721EscrowObligationTest is Test {
    ERC721EscrowObligation public escrowObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    MockERC721 public token;
    MockArbiter public mockArbiter;
    MockArbiter public rejectingArbiter;

    address public constant EAS_ADDRESS =
        0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS =
        0xA7b39296258348C78294F95B872b282326A97BDF;

    address internal buyer;
    address internal seller;
    uint256 internal tokenId;
    uint64 constant EXPIRATION_TIME = 365 days;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        escrowObligation = new ERC721EscrowObligation(eas, schemaRegistry);
        token = new MockERC721();
        mockArbiter = new MockArbiter(true);
        rejectingArbiter = new MockArbiter(false);

        buyer = makeAddr("buyer");
        seller = makeAddr("seller");

        // Mint a token for the buyer
        vm.prank(address(this));
        tokenId = token.mint(buyer);
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
            "address token, uint256 tokenId, address arbiter, bytes demand",
            "Schema string should match"
        );
    }

    function testMakeStatement() public {
        // Approve ERC721 transfer first
        vm.startPrank(buyer);
        token.approve(address(escrowObligation), tokenId);

        bytes memory demand = abi.encode("test demand");
        ERC721EscrowObligation.StatementData memory data = ERC721EscrowObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            arbiter: address(mockArbiter),
            demand: demand
        });

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

        // Verify token transfer to escrow
        assertEq(
            token.ownerOf(tokenId),
            address(escrowObligation),
            "Escrow should hold the token"
        );
    }

    function testMakeStatementFor() public {
        // Approve ERC721 transfer first
        vm.startPrank(buyer);
        token.approve(address(escrowObligation), tokenId);
        vm.stopPrank();

        bytes memory demand = abi.encode("test demand");
        ERC721EscrowObligation.StatementData memory data = ERC721EscrowObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            arbiter: address(mockArbiter),
            demand: demand
        });

        address recipient = makeAddr("recipient");
        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        
        vm.prank(address(this));
        bytes32 uid = escrowObligation.makeStatementFor(data, expiration, buyer, recipient);

        // Verify attestation exists
        assertNotEq(uid, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = escrowObligation.getStatement(uid);
        assertEq(
            attestation.schema,
            escrowObligation.ATTESTATION_SCHEMA(),
            "Schema should match"
        );
        assertEq(attestation.recipient, recipient, "Recipient should be the specified recipient");

        // Verify token transfer to escrow
        assertEq(
            token.ownerOf(tokenId),
            address(escrowObligation),
            "Escrow should hold the token"
        );
    }

    function testCollectPayment() public {
        // Setup: create an escrow
        vm.startPrank(buyer);
        token.approve(address(escrowObligation), tokenId);

        bytes memory demand = abi.encode("test demand");
        ERC721EscrowObligation.StatementData memory data = ERC721EscrowObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            arbiter: address(mockArbiter),
            demand: demand
        });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 paymentUid = escrowObligation.makeStatement(data, expiration);
        vm.stopPrank();

        // Create a fulfillment attestation from the seller
        vm.prank(seller);
        bytes32 fulfillmentUid = eas.attest(
            AttestationRequest({
                schema: escrowObligation.ATTESTATION_SCHEMA(),
                data: AttestationRequestData({
                    recipient: seller,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode("fulfillment data"),
                    value: 0
                })
            })
        );

        // Collect payment
        vm.prank(seller);
        bool success = escrowObligation.collectPayment(paymentUid, fulfillmentUid);
        
        assertTrue(success, "Payment collection should succeed");
        
        // Verify token transfer to seller
        assertEq(
            token.ownerOf(tokenId),
            seller,
            "Seller should have received the token"
        );
    }

    function testCollectPaymentWithRejectedFulfillment() public {
        // Setup: create an escrow with rejecting arbiter
        vm.startPrank(buyer);
        token.approve(address(escrowObligation), tokenId);

        bytes memory demand = abi.encode("test demand");
        ERC721EscrowObligation.StatementData memory data = ERC721EscrowObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            arbiter: address(rejectingArbiter),
            demand: demand
        });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 paymentUid = escrowObligation.makeStatement(data, expiration);
        vm.stopPrank();

        // Create a fulfillment attestation from the seller
        vm.prank(seller);
        bytes32 fulfillmentUid = eas.attest(
            AttestationRequest({
                schema: escrowObligation.ATTESTATION_SCHEMA(),
                data: AttestationRequestData({
                    recipient: seller,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode("fulfillment data"),
                    value: 0
                })
            })
        );

        // Try to collect payment, should revert with InvalidFulfillment
        vm.prank(seller);
        vm.expectRevert(ERC721EscrowObligation.InvalidFulfillment.selector);
        escrowObligation.collectPayment(paymentUid, fulfillmentUid);
    }

    function testCollectExpired() public {
        // Setup: create an escrow
        vm.startPrank(buyer);
        token.approve(address(escrowObligation), tokenId);

        bytes memory demand = abi.encode("test demand");
        ERC721EscrowObligation.StatementData memory data = ERC721EscrowObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            arbiter: address(mockArbiter),
            demand: demand
        });

        uint64 expiration = uint64(block.timestamp + 100);
        bytes32 paymentUid = escrowObligation.makeStatement(data, expiration);
        vm.stopPrank();

        // Attempt to collect before expiration (should fail)
        vm.prank(buyer);
        vm.expectRevert(ERC721EscrowObligation.UnauthorizedCall.selector);
        escrowObligation.collectExpired(paymentUid);

        // Fast forward past expiration time
        vm.warp(block.timestamp + 200);

        // Collect expired funds
        vm.prank(buyer);
        bool success = escrowObligation.collectExpired(paymentUid);
        
        assertTrue(success, "Expired token collection should succeed");
        
        // Verify token transfer back to buyer
        assertEq(
            token.ownerOf(tokenId),
            buyer,
            "Buyer should have received the token back"
        );
    }

    function testCheckStatement() public {
        // Create statement data
        ERC721EscrowObligation.StatementData memory paymentData = ERC721EscrowObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            arbiter: address(mockArbiter),
            demand: abi.encode("specific demand")
        });

        // Create an attestation from the buyer
        vm.prank(buyer);
        bytes32 attestationId = eas.attest(
            AttestationRequest({
                schema: escrowObligation.ATTESTATION_SCHEMA(),
                data: AttestationRequestData({
                    recipient: buyer,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode(paymentData),
                    value: 0
                })
            })
        );

        Attestation memory attestation = eas.getAttestation(attestationId);

        // Test exact match
        ERC721EscrowObligation.StatementData memory exactDemand = ERC721EscrowObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            arbiter: address(mockArbiter),
            demand: abi.encode("specific demand")
        });

        bool exactMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(exactDemand),
            bytes32(0)
        );
        assertTrue(exactMatch, "Should match exact demand");

        // Test different token ID (should fail)
        uint256 differentTokenId = 999;
        ERC721EscrowObligation.StatementData memory differentTokenIdDemand = ERC721EscrowObligation.StatementData({
            token: address(token),
            tokenId: differentTokenId,
            arbiter: address(mockArbiter),
            demand: abi.encode("specific demand")
        });

        bool differentTokenIdMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(differentTokenIdDemand),
            bytes32(0)
        );
        assertFalse(differentTokenIdMatch, "Should not match different token ID demand");

        // Test different token (should fail)
        MockERC721 differentToken = new MockERC721();
        ERC721EscrowObligation.StatementData memory differentTokenDemand = ERC721EscrowObligation.StatementData({
            token: address(differentToken),
            tokenId: tokenId,
            arbiter: address(mockArbiter),
            demand: abi.encode("specific demand")
        });

        bool differentTokenMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(differentTokenDemand),
            bytes32(0)
        );
        assertFalse(differentTokenMatch, "Should not match different token demand");

        // Test different arbiter (should fail)
        ERC721EscrowObligation.StatementData memory differentArbiterDemand = ERC721EscrowObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            arbiter: address(rejectingArbiter),
            demand: abi.encode("specific demand")
        });

        bool differentArbiterMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(differentArbiterDemand),
            bytes32(0)
        );
        assertFalse(differentArbiterMatch, "Should not match different arbiter demand");

        // Test different demand (should fail)
        ERC721EscrowObligation.StatementData memory differentDemandData = ERC721EscrowObligation.StatementData({
            token: address(token),
            tokenId: tokenId,
            arbiter: address(mockArbiter),
            demand: abi.encode("different demand")
        });

        bool differentDemandMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(differentDemandData),
            bytes32(0)
        );
        assertFalse(differentDemandMatch, "Should not match different demand");
    }

    function testTransferFailureReverts() public {
        // Mint a token for a different address that won't approve the transfer
        address otherOwner = makeAddr("otherOwner");
        uint256 otherTokenId = token.mint(otherOwner);

        // Try to create escrow with a token that hasn't been approved for transfer
        bytes memory demand = abi.encode("test demand");
        ERC721EscrowObligation.StatementData memory data = ERC721EscrowObligation.StatementData({
            token: address(token),
            tokenId: otherTokenId,
            arbiter: address(mockArbiter),
            demand: demand
        });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        
        // Should revert because the token transfer will fail
        vm.expectRevert();
        escrowObligation.makeStatementFor(data, expiration, otherOwner, otherOwner);
    }
}