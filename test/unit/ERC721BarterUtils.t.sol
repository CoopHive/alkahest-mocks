// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC721EscrowObligation} from "../../src/Statements/ERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "../../src/Statements/ERC721PaymentObligation.sol";
import {ERC721BarterUtils} from "../../src/Utils/ERC721BarterUtils.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockERC721 is ERC721 {
    uint256 private _currentTokenId = 0;

    constructor() ERC721("Mock NFT", "MNFT") {}

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

    MockERC721 public nftTokenA;
    MockERC721 public nftTokenB;

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

    uint256 public aliceNftId;
    uint256 public bobNftId;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        // Deploy mock NFT tokens
        nftTokenA = new MockERC721();
        nftTokenB = new MockERC721();

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
        aliceNftId = nftTokenA.mint(alice); // Alice has tokenA

        vm.prank(bob);
        bobNftId = nftTokenB.mint(bob); // Bob has tokenB
    }

    function testBuyErc721ForErc721() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        nftTokenA.approve(address(escrowStatement), aliceNftId);
        bytes32 buyAttestation = barterUtils.buyErc721ForErc721(
            address(nftTokenA),
            aliceNftId,
            address(nftTokenB),
            bobNftId,
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
        
        assertEq(escrowData.token, address(nftTokenA), "Token should match");
        assertEq(escrowData.tokenId, aliceNftId, "TokenId should match");
        assertEq(escrowData.arbiter, address(paymentStatement), "Arbiter should be payment statement");
        
        // Extract the demand data
        ERC721PaymentObligation.StatementData memory demandData = abi.decode(
            escrowData.demand,
            (ERC721PaymentObligation.StatementData)
        );
        
        assertEq(demandData.token, address(nftTokenB), "Demand token should match");
        assertEq(demandData.tokenId, bobNftId, "Demand tokenId should match");
        assertEq(demandData.payee, alice, "Payee should be Alice");

        // Verify that Alice's NFT is now escrowed
        assertEq(nftTokenA.ownerOf(aliceNftId), address(escrowStatement), "NFT should be in escrow");
    }

    function testPayErc721ForErc721() public {
        // First create a buy attestation
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        nftTokenA.approve(address(escrowStatement), aliceNftId);
        bytes32 buyAttestation = barterUtils.buyErc721ForErc721(
            address(nftTokenA),
            aliceNftId,
            address(nftTokenB),
            bobNftId,
            expiration
        );
        vm.stopPrank();

        // Now Bob fulfills the request
        vm.startPrank(bob);
        nftTokenB.approve(address(paymentStatement), bobNftId);
        bytes32 payAttestation = barterUtils.payErc721ForErc721(buyAttestation);
        vm.stopPrank();

        assertNotEq(
            payAttestation,
            bytes32(0),
            "Pay attestation should be created"
        );

        // Verify the exchange happened
        assertEq(nftTokenA.ownerOf(aliceNftId), bob, "Bob should now own Alice's NFT");
        assertEq(nftTokenB.ownerOf(bobNftId), alice, "Alice should now own Bob's NFT");
    }

    // Test that we can extract the demand data correctly
    function testDemandDataExtraction() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        nftTokenA.approve(address(escrowStatement), aliceNftId);
        bytes32 buyAttestation = barterUtils.buyErc721ForErc721(
            address(nftTokenA),
            aliceNftId,
            address(nftTokenB),
            bobNftId,
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
        assertEq(demand.token, address(nftTokenB), "Token should match");
        assertEq(demand.tokenId, bobNftId, "TokenId should match");
        assertEq(demand.payee, alice, "Payee should be alice");
    }

    function test_RevertWhen_TokenNotApproved() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice tries to make bid without approving NFT
        vm.startPrank(alice);
        vm.expectRevert(); // ERC721: caller is not token owner or approved
        barterUtils.buyErc721ForErc721(
            address(nftTokenA),
            aliceNftId,
            address(nftTokenB),
            bobNftId,
            expiration
        );
        vm.stopPrank();
    }

    function test_RevertWhen_PaymentFails() public {
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice makes bid
        vm.startPrank(alice);
        nftTokenA.approve(address(escrowStatement), aliceNftId);
        bytes32 buyAttestation = barterUtils.buyErc721ForErc721(
            address(nftTokenA),
            aliceNftId,
            address(nftTokenB),
            bobNftId,
            expiration
        );
        vm.stopPrank();

        // Transfer Bob's NFT to someone else
        address thirdParty = makeAddr("third-party");
        vm.prank(bob);
        nftTokenB.transferFrom(bob, thirdParty, bobNftId);

        // Bob tries to fulfill request with NFT he no longer owns
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
        nftTokenA.approve(address(escrowStatement), aliceNftId);
        bytes32 buyAttestation = barterUtils.buyErc721ForErc721(
            address(nftTokenA),
            aliceNftId,
            address(nftTokenB),
            bobNftId,
            expiration
        );
        vm.stopPrank();

        // Warp time past expiration
        vm.warp(block.timestamp + 20 minutes);

        // Bob tries to fulfill expired bid
        vm.startPrank(bob);
        nftTokenB.approve(address(paymentStatement), bobNftId);
        vm.expectRevert();
        barterUtils.payErc721ForErc721(buyAttestation);
        vm.stopPrank();
    }
}