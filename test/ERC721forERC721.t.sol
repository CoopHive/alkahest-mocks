// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC721PaymentObligation} from "../src/Statements/ERC721PaymentObligation.sol";
import {ERC721PaymentFulfillmentArbiter} from "../src/Validators/ERC721PaymentFulfillmentArbiter.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import "@openzeppelin/token/ERC721/ERC721.sol";

// Mock ERC721 token contract
contract MockERC721 is ERC721 {
    uint256 public nextTokenId = 1;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function mint(address to) external {
        _mint(to, nextTokenId++);
    }
}

contract ERC721PaymentObligationTest is Test {
    ERC721PaymentObligation public paymentObligation;
    ERC721PaymentFulfillmentArbiter public validator;
    MockERC721 public nftA;
    MockERC721 public nftB;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    address public constant EAS_ADDRESS = 0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS = 0xA7b39296258348C78294F95B872b282326A97BDF;

    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));
        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        nftA = new MockERC721("NFT A", "NFTA");
        nftB = new MockERC721("NFT B", "NFTB");

        paymentObligation = new ERC721PaymentObligation(eas, schemaRegistry);
        validator = new ERC721PaymentFulfillmentArbiter(paymentObligation);

        // Mint NFTs for Alice and Bob
        nftA.mint(alice); // Mint Token ID 1
        nftB.mint(bob);   // Mint Token ID 2
    }

    function testERC721PaymentObligationSelfReferential() public {
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupTrade();

        // Bob collects Alice's payment
        vm.prank(bob);
        bool successBob = paymentObligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's payment
        vm.prank(alice);
        bool successAlice = paymentObligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        _assertFinalOwnership();
    }

    function testCollectionOrderReversed() public {
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupTrade();

        // Alice collects Bob's payment first
        vm.prank(alice);
        bool successAlice = paymentObligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Bob collects Alice's payment
        vm.prank(bob);
        bool successBob = paymentObligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        _assertFinalOwnership();
    }

    function testDoubleSpendingAlice() public {
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupTrade();

        // Bob collects Alice's payment
        vm.prank(bob);
        bool successBob = paymentObligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's payment
        vm.prank(alice);
        bool successAlice = paymentObligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Alice attempts to double spend
        vm.prank(alice);
        vm.expectRevert();
        paymentObligation.collectPayment(bobPaymentUID, alicePaymentUID);
    }

    function testDoubleSpendingBob() public {
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupTrade();

        // Alice collects Bob's payment
        vm.prank(alice);
        bool successAlice = paymentObligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Bob collects Alice's payment
        vm.prank(bob);
        bool successBob = paymentObligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Bob attempts to double spend
        vm.prank(bob);
        vm.expectRevert();
        paymentObligation.collectPayment(alicePaymentUID, bobPaymentUID);
    }

    function _setupTrade() internal returns (bytes32 alicePaymentUID, bytes32 bobPaymentUID) {
        vm.startPrank(alice);

        // Minting and approving NFT A (Token ID 1) for Alice
        nftA.mint(alice);
        nftA.approve(address(paymentObligation), 1);

        ERC721PaymentObligation.StatementData memory alicePaymentData = ERC721PaymentObligation.StatementData({
            token: address(nftA),
            tokenId: 1,
            arbiter: address(validator),
            demand: abi.encode(
                ERC721PaymentFulfillmentArbiter.DemandData({
                    token: address(nftB),
                    tokenId: 2
                })
            )
        });
        alicePaymentUID = paymentObligation.makeStatement(alicePaymentData, 0, bytes32(0));
        vm.stopPrank();

        vm.startPrank(bob);

        // Minting and approving NFT B (Token ID 2) for Bob
        nftB.mint(bob);
        nftB.approve(address(paymentObligation), 2);

        ERC721PaymentObligation.StatementData memory bobPaymentData = ERC721PaymentObligation.StatementData({
            token: address(nftB),
            tokenId: 2,
            arbiter: address(0),
            demand: ""
        });
        bobPaymentUID = paymentObligation.makeStatement(bobPaymentData, 0, alicePaymentUID);

        vm.stopPrank();
    }

    function _assertFinalOwnership() internal view {
        assertEq(nftA.ownerOf(1), bob, "Bob should own NFT A");
        assertEq(nftB.ownerOf(2), alice, "Alice should own NFT B");
    }
}