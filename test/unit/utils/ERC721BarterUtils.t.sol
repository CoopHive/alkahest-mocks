// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC721EscrowObligation} from "@src/obligations/ERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "@src/obligations/ERC721PaymentObligation.sol";
import {ERC721BarterUtils} from "@src/utils/ERC721BarterUtils.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract MockERC721 is ERC721 {
    uint256 private _currentTokenId = 0;

    constructor() ERC721("Mock ERC721", "MERC721") {}

    function mint(address to) public returns (uint256) {
        _currentTokenId++;
        _mint(to, _currentTokenId);
        return _currentTokenId;
    }
}

contract ERC721BarterUtilsUnitTest is Test {
    ERC721EscrowObligation public escrowStatement;
    ERC721PaymentObligation public paymentStatement;
    ERC721BarterUtils public barterUtils;

    MockERC721 public erc721TokenA;
    MockERC721 public erc721TokenB;

    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    uint256 internal constant ALICE_PRIVATE_KEY = 0xa11ce;
    uint256 internal constant BOB_PRIVATE_KEY = 0xb0b;

    address public alice;
    address public bob;

    uint256 public aliceErc721Id;
    uint256 public bobErc721Id;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        // Deploy mock ERC721 tokens
        erc721TokenA = new MockERC721();
        erc721TokenB = new MockERC721();

        // Deploy statements
        escrowStatement = new ERC721EscrowObligation(eas, schemaRegistry);
        paymentStatement = new ERC721PaymentObligation(eas, schemaRegistry);

        // Deploy barter utils contract
        barterUtils = new ERC721BarterUtils(
            eas,
            escrowStatement,
            paymentStatement
        );

        // Setup initial token balances
        vm.prank(alice);
        aliceErc721Id = erc721TokenA.mint(alice); // Alice has erc1155TokenA

        vm.prank(bob);
        bobErc721Id = erc721TokenB.mint(bob); // Bob has erc1155TokenB
    }

    function testBuyErc721ForErc721() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc721TokenA.approve(address(escrowStatement), aliceErc721Id);
        bytes32 buyAttestation = barterUtils.buyErc721ForErc721(
            address(erc721TokenA),
            aliceErc721Id,
            address(erc721TokenB),
            bobErc721Id,
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
        ERC721EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC721EscrowObligation.StatementData)
        );

        assertEq(escrowData.token, address(erc721TokenA), "Token should match");
        assertEq(escrowData.tokenId, aliceErc721Id, "TokenId should match");
        assertEq(
            escrowData.arbiter,
            address(paymentStatement),
            "Arbiter should be payment statement"
        );

        // Extract the demand data
        ERC721PaymentObligation.StatementData memory demandData = abi.decode(
            escrowData.demand,
            (ERC721PaymentObligation.StatementData)
        );

        assertEq(
            demandData.token,
            address(erc721TokenB),
            "Demand token should match"
        );
        assertEq(
            demandData.tokenId,
            bobErc721Id,
            "Demand tokenId should match"
        );
        assertEq(demandData.payee, alice, "Payee should be Alice");

        // Verify that Alice's ERC721 token is now escrowed
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            address(escrowStatement),
            "ERC721 should be in escrow"
        );
    }

    function testPayErc721ForErc721() public {
        // First create a buy attestation
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc721TokenA.approve(address(escrowStatement), aliceErc721Id);
        bytes32 buyAttestation = barterUtils.buyErc721ForErc721(
            address(erc721TokenA),
            aliceErc721Id,
            address(erc721TokenB),
            bobErc721Id,
            expiration
        );
        vm.stopPrank();

        // Now Bob fulfills the request
        vm.startPrank(bob);
        erc721TokenB.approve(address(paymentStatement), bobErc721Id);
        bytes32 payAttestation = barterUtils.payErc721ForErc721(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(
            erc721TokenA.ownerOf(aliceErc721Id),
            bob,
            "Bob should now own Alice's ERC721 token"
        );
        assertEq(
            erc721TokenB.ownerOf(bobErc721Id),
            alice,
            "Alice should now own Bob's ERC721 token"
        );
    }

    // Test that we can extract the demand data correctly
    function testDemandDataExtraction() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        erc721TokenA.approve(address(escrowStatement), aliceErc721Id);
        bytes32 buyAttestation = barterUtils.buyErc721ForErc721(
            address(erc721TokenA),
            aliceErc721Id,
            address(erc721TokenB),
            bobErc721Id,
            expiration
        );
        vm.stopPrank();

        // Extract the attestation and manually decode it
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC721EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC721EscrowObligation.StatementData)
        );

        ERC721PaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (ERC721PaymentObligation.StatementData)
        );

        // Verify the demand data matches what we expect
        assertEq(demand.token, address(erc721TokenB), "Token should match");
        assertEq(demand.tokenId, bobErc721Id, "TokenId should match");
        assertEq(demand.payee, alice, "Payee should be alice");
    }

    function test_RevertWhen_TokenNotApproved() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice tries to make bid without approving ERC721 token
        vm.startPrank(alice);
        vm.expectRevert(); // ERC721: caller is not token owner or approved
        barterUtils.buyErc721ForErc721(
            address(erc721TokenA),
            aliceErc721Id,
            address(erc721TokenB),
            bobErc721Id,
            expiration
        );
        vm.stopPrank();
    }

    function test_RevertWhen_PaymentFails() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice makes bid
        vm.startPrank(alice);
        erc721TokenA.approve(address(escrowStatement), aliceErc721Id);
        bytes32 buyAttestation = barterUtils.buyErc721ForErc721(
            address(erc721TokenA),
            aliceErc721Id,
            address(erc721TokenB),
            bobErc721Id,
            expiration
        );
        vm.stopPrank();

        // Transfer Bob's ERC721 token to someone else
        address thirdParty = makeAddr("third-party");
        vm.prank(bob);
        erc721TokenB.transferFrom(bob, thirdParty, bobErc721Id);

        // Bob tries to fulfill request with ERC721 he no longer owns
        vm.startPrank(bob);
        vm.expectRevert(); // ERC721: caller is not token owner or approved
        barterUtils.payErc721ForErc721(buyAttestation);
        vm.stopPrank();
    }

    function test_RevertWhen_BidDoesNotExist() public {
        bytes32 nonExistentBid = bytes32(uint256(1234));

        vm.startPrank(bob);
        vm.expectRevert(); // Custom error or EAS revert for non-existent attestation
        barterUtils.payErc721ForErc721(nonExistentBid);
        vm.stopPrank();
    }

    function test_RevertWhen_BidExpired() public {
        // Create a bid with short expiration
        uint64 expiration = uint64(block.timestamp + 10 minutes);

        vm.startPrank(alice);
        erc721TokenA.approve(address(escrowStatement), aliceErc721Id);
        bytes32 buyAttestation = barterUtils.buyErc721ForErc721(
            address(erc721TokenA),
            aliceErc721Id,
            address(erc721TokenB),
            bobErc721Id,
            expiration
        );
        vm.stopPrank();

        // Warp time past expiration
        vm.warp(block.timestamp + 20 minutes);

        // Bob tries to fulfill expired bid
        vm.startPrank(bob);
        erc721TokenB.approve(address(paymentStatement), bobErc721Id);
        vm.expectRevert();
        barterUtils.payErc721ForErc721(buyAttestation);
        vm.stopPrank();
    }
}
