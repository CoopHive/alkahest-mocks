// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC1155EscrowObligation} from "@src/obligations/ERC1155EscrowObligation.sol";
import {BaseEscrowObligation} from "@src/BaseEscrowObligation.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {MockArbiter} from "./MockArbiter.sol";
import {IEAS, Attestation, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

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

contract ERC1155EscrowObligationTest is Test {
    ERC1155EscrowObligation public escrowObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    MockERC1155 public token;
    MockArbiter public mockArbiter;
    MockArbiter public rejectingArbiter;

    address internal buyer;
    address internal seller;
    uint256 internal tokenId = 1;
    uint256 internal erc1155TokenAmount = 100;
    uint64 constant EXPIRATION_TIME = 365 days;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        escrowObligation = new ERC1155EscrowObligation(eas, schemaRegistry);
        token = new MockERC1155();
        mockArbiter = new MockArbiter(true);
        rejectingArbiter = new MockArbiter(false);

        buyer = makeAddr("buyer");
        seller = makeAddr("seller");

        // Mint tokens for the buyer
        token.mint(buyer, tokenId, erc1155TokenAmount);
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
            "address arbiter, bytes demand, address token, uint256 tokenId, uint256 amount",
            "Schema string should match"
        );
    }

    function testDoObligation() public {
        // Approve tokens first
        vm.startPrank(buyer);
        token.setApprovalForAll(address(escrowObligation), true);

        bytes memory demand = abi.encode("test demand");
        ERC1155EscrowObligation.ObligationData
            memory data = ERC1155EscrowObligation.ObligationData({
                token: address(token),
                tokenId: tokenId,
                amount: erc1155TokenAmount,
                arbiter: address(mockArbiter),
                demand: demand
            });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 uid = escrowObligation.doObligation(data, expiration);
        vm.stopPrank();

        // Verify attestation exists
        assertNotEq(uid, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = eas.getAttestation(uid);
        assertEq(
            attestation.schema,
            escrowObligation.ATTESTATION_SCHEMA(),
            "Schema should match"
        );
        assertEq(attestation.recipient, buyer, "Recipient should be the buyer");

        // Verify token transfer to escrow
        assertEq(
            token.balanceOf(address(escrowObligation), tokenId),
            erc1155TokenAmount,
            "Escrow should hold tokens"
        );
        assertEq(
            token.balanceOf(buyer, tokenId),
            0,
            "Buyer should have sent tokens"
        );
    }

    function testDoObligationFor() public {
        // Approve tokens first
        vm.startPrank(buyer);
        token.setApprovalForAll(address(escrowObligation), true);
        vm.stopPrank();

        bytes memory demand = abi.encode("test demand");
        ERC1155EscrowObligation.ObligationData
            memory data = ERC1155EscrowObligation.ObligationData({
                token: address(token),
                tokenId: tokenId,
                amount: erc1155TokenAmount,
                arbiter: address(mockArbiter),
                demand: demand
            });

        address recipient = makeAddr("recipient");
        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);

        vm.prank(address(this));
        bytes32 uid = escrowObligation.doObligationFor(
            data,
            expiration,
            buyer,
            recipient
        );

        // Verify attestation exists
        assertNotEq(uid, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = eas.getAttestation(uid);
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

        // Verify token transfer to escrow
        assertEq(
            token.balanceOf(address(escrowObligation), tokenId),
            erc1155TokenAmount,
            "Escrow should hold tokens"
        );
        assertEq(
            token.balanceOf(buyer, tokenId),
            0,
            "Buyer should have sent tokens"
        );
    }

    function testCollectEscrow() public {
        // Setup: create an escrow
        vm.startPrank(buyer);
        token.setApprovalForAll(address(escrowObligation), true);

        bytes memory demand = abi.encode("test demand");
        ERC1155EscrowObligation.ObligationData
            memory data = ERC1155EscrowObligation.ObligationData({
                token: address(token),
                tokenId: tokenId,
                amount: erc1155TokenAmount,
                arbiter: address(mockArbiter),
                demand: demand
            });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 paymentUid = escrowObligation.doObligation(data, expiration);
        vm.stopPrank();

        // Create a fulfillment attestation using a StringObligation
        StringObligation stringObligation = new StringObligation(
            eas,
            schemaRegistry
        );

        vm.prank(seller);
        bytes32 fulfillmentUid = stringObligation.doObligation(
            StringObligation.ObligationData({item: "fulfillment data"}),
            bytes32(0)
        );

        // Collect payment
        vm.prank(seller);
        bool success = escrowObligation.collectEscrow(
            paymentUid,
            fulfillmentUid
        );

        assertTrue(success, "Payment collection should succeed");

        // Verify token transfer to seller
        assertEq(
            token.balanceOf(seller, tokenId),
            erc1155TokenAmount,
            "Seller should have received tokens"
        );
        assertEq(
            token.balanceOf(address(escrowObligation), tokenId),
            0,
            "Escrow should have zero tokens left"
        );
    }

    function testCollectEscrowWithRejectedFulfillment() public {
        // Setup: create an escrow with rejecting arbiter
        vm.startPrank(buyer);
        token.setApprovalForAll(address(escrowObligation), true);

        bytes memory demand = abi.encode("test demand");
        ERC1155EscrowObligation.ObligationData
            memory data = ERC1155EscrowObligation.ObligationData({
                token: address(token),
                tokenId: tokenId,
                amount: erc1155TokenAmount,
                arbiter: address(rejectingArbiter),
                demand: demand
            });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 paymentUid = escrowObligation.doObligation(data, expiration);
        vm.stopPrank();

        // Create a fulfillment attestation using a StringObligation
        StringObligation stringObligation = new StringObligation(
            eas,
            schemaRegistry
        );

        vm.prank(seller);
        bytes32 fulfillmentUid = stringObligation.doObligation(
            StringObligation.ObligationData({item: "fulfillment data"}),
            bytes32(0)
        );

        // Try to collect payment, should revert with InvalidFulfillment
        vm.prank(seller);
        vm.expectRevert(BaseEscrowObligation.InvalidFulfillment.selector);
        escrowObligation.collectEscrow(paymentUid, fulfillmentUid);
    }

    function testReclaimExpired() public {
        // Setup: create an escrow
        vm.startPrank(buyer);
        token.setApprovalForAll(address(escrowObligation), true);

        bytes memory demand = abi.encode("test demand");
        ERC1155EscrowObligation.ObligationData
            memory data = ERC1155EscrowObligation.ObligationData({
                token: address(token),
                tokenId: tokenId,
                amount: erc1155TokenAmount,
                arbiter: address(mockArbiter),
                demand: demand
            });

        uint64 expiration = uint64(block.timestamp + 100);
        bytes32 paymentUid = escrowObligation.doObligation(data, expiration);
        vm.stopPrank();

        // Attempt to collect before expiration (should fail)
        vm.prank(buyer);
        vm.expectRevert(BaseEscrowObligation.UnauthorizedCall.selector);
        escrowObligation.reclaimExpired(paymentUid);

        // Fast forward past expiration time
        vm.warp(block.timestamp + 200);

        // Collect expired funds
        vm.prank(buyer);
        bool success = escrowObligation.reclaimExpired(paymentUid);

        assertTrue(success, "Expired token collection should succeed");

        // Verify token transfer back to buyer
        assertEq(
            token.balanceOf(buyer, tokenId),
            erc1155TokenAmount,
            "Buyer should have received tokens back"
        );
        assertEq(
            token.balanceOf(address(escrowObligation), tokenId),
            0,
            "Escrow should have zero tokens left"
        );
    }

    function testCheckObligation() public {
        // Create obligation data
        ERC1155EscrowObligation.ObligationData
            memory paymentData = ERC1155EscrowObligation.ObligationData({
                token: address(token),
                tokenId: tokenId,
                amount: erc1155TokenAmount,
                arbiter: address(mockArbiter),
                demand: abi.encode("specific demand")
            });

        // Use the obligation contract to create a valid attestation
        vm.startPrank(buyer);
        token.setApprovalForAll(address(escrowObligation), true);
        bytes32 attestationId = escrowObligation.doObligation(
            paymentData,
            uint64(block.timestamp + EXPIRATION_TIME)
        );
        vm.stopPrank();

        Attestation memory attestation = eas.getAttestation(attestationId);

        // Test exact match
        ERC1155EscrowObligation.ObligationData
            memory exactDemand = ERC1155EscrowObligation.ObligationData({
                token: address(token),
                tokenId: tokenId,
                amount: erc1155TokenAmount,
                arbiter: address(mockArbiter),
                demand: abi.encode("specific demand")
            });

        bool exactMatch = escrowObligation.checkObligation(
            attestation,
            abi.encode(exactDemand),
            bytes32(0)
        );
        assertTrue(exactMatch, "Should match exact demand");

        // Test lower amount demand (should succeed)
        ERC1155EscrowObligation.ObligationData
            memory lowerDemand = ERC1155EscrowObligation.ObligationData({
                token: address(token),
                tokenId: tokenId,
                amount: erc1155TokenAmount - 50,
                arbiter: address(mockArbiter),
                demand: abi.encode("specific demand")
            });

        bool lowerMatch = escrowObligation.checkObligation(
            attestation,
            abi.encode(lowerDemand),
            bytes32(0)
        );
        assertTrue(lowerMatch, "Should match lower amount demand");

        // Test higher amount demand (should fail)
        ERC1155EscrowObligation.ObligationData
            memory higherDemand = ERC1155EscrowObligation.ObligationData({
                token: address(token),
                tokenId: tokenId,
                amount: erc1155TokenAmount + 50,
                arbiter: address(mockArbiter),
                demand: abi.encode("specific demand")
            });

        bool higherMatch = escrowObligation.checkObligation(
            attestation,
            abi.encode(higherDemand),
            bytes32(0)
        );
        assertFalse(higherMatch, "Should not match higher amount demand");

        // Test different token ID (should fail)
        ERC1155EscrowObligation.ObligationData
            memory differentIdDemand = ERC1155EscrowObligation.ObligationData({
                token: address(token),
                tokenId: tokenId + 1,
                amount: erc1155TokenAmount,
                arbiter: address(mockArbiter),
                demand: abi.encode("specific demand")
            });

        bool differentIdMatch = escrowObligation.checkObligation(
            attestation,
            abi.encode(differentIdDemand),
            bytes32(0)
        );
        assertFalse(
            differentIdMatch,
            "Should not match different token ID demand"
        );

        // Test different token (should fail)
        MockERC1155 differentToken = new MockERC1155();
        ERC1155EscrowObligation.ObligationData
            memory differentTokenDemand = ERC1155EscrowObligation
                .ObligationData({
                    token: address(differentToken),
                    tokenId: tokenId,
                    amount: erc1155TokenAmount,
                    arbiter: address(mockArbiter),
                    demand: abi.encode("specific demand")
                });

        bool differentTokenMatch = escrowObligation.checkObligation(
            attestation,
            abi.encode(differentTokenDemand),
            bytes32(0)
        );
        assertFalse(
            differentTokenMatch,
            "Should not match different token demand"
        );

        // Test different arbiter (should fail)
        ERC1155EscrowObligation.ObligationData
            memory differentArbiterDemand = ERC1155EscrowObligation
                .ObligationData({
                    token: address(token),
                    tokenId: tokenId,
                    amount: erc1155TokenAmount,
                    arbiter: address(rejectingArbiter),
                    demand: abi.encode("specific demand")
                });

        bool differentArbiterMatch = escrowObligation.checkObligation(
            attestation,
            abi.encode(differentArbiterDemand),
            bytes32(0)
        );
        assertFalse(
            differentArbiterMatch,
            "Should not match different arbiter demand"
        );

        // Test different demand (should fail)
        ERC1155EscrowObligation.ObligationData
            memory differentDemandData = ERC1155EscrowObligation
                .ObligationData({
                    token: address(token),
                    tokenId: tokenId,
                    amount: erc1155TokenAmount,
                    arbiter: address(mockArbiter),
                    demand: abi.encode("different demand")
                });

        bool differentDemandMatch = escrowObligation.checkObligation(
            attestation,
            abi.encode(differentDemandData),
            bytes32(0)
        );
        assertFalse(differentDemandMatch, "Should not match different demand");
    }

    function testInvalidEscrowReverts() public {
        // Attempt to create escrow with more tokens than the buyer has
        uint256 excessAmount = erc1155TokenAmount + 100;

        vm.startPrank(buyer);
        token.setApprovalForAll(address(escrowObligation), true);

        bytes memory demand = abi.encode("test demand");
        ERC1155EscrowObligation.ObligationData
            memory data = ERC1155EscrowObligation.ObligationData({
                token: address(token),
                tokenId: tokenId,
                amount: excessAmount,
                arbiter: address(mockArbiter),
                demand: demand
            });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);

        // Should revert with our custom ERC1155TransferFailed error
        vm.expectRevert(
            abi.encodeWithSelector(
                ERC1155EscrowObligation.ERC1155TransferFailed.selector,
                address(token),
                buyer,
                address(escrowObligation),
                tokenId,
                excessAmount
            )
        );
        escrowObligation.doObligation(data, expiration);
        vm.stopPrank();
    }
}
