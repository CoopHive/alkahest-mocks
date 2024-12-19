// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC20EscrowObligation} from "../src/Statements/ERC20EscrowObligation.sol";
import {ERC20PaymentFulfillmentArbiter} from "../src/Validators/ERC20PaymentFulfillmentArbiter.sol";
import {ERC721PaymentObligation} from "../src/Statements/ERC721PaymentObligation.sol";
import {ERC721PaymentFulfillmentArbiter} from "../src/Validators/ERC721PaymentFulfillmentArbiter.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import "@openzeppelin/token/ERC20/ERC20.sol";
import "@openzeppelin/token/ERC721/ERC721.sol";

// Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals()); // Mint 1,000,000 tokens to deployer
    }
}

// Mock ERC721 token for testing
contract MockERC721 is ERC721 {
    uint256 public nextTokenId = 1;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function mint(address to) external {
        _mint(to, nextTokenId++);
    }
}

contract PaymentObligationTest is Test {
    ERC20EscrowObligation public erc20PaymentObligation;
    ERC721PaymentObligation public erc721PaymentObligation;
    ERC20PaymentFulfillmentArbiter public erc20Arbiter;
    ERC721PaymentFulfillmentArbiter public erc721Arbiter;
    MockERC20 public tokenA;
    MockERC721 public nftA;
    MockERC20 public tokenB;
    MockERC721 public nftB;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    // Replace with actual addresses or mock addresses if needed
    address public constant EAS_ADDRESS = 0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS = 0xA7b39296258348C78294F95B872b282326A97BDF;

    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        // Fork the mainnet (ensure that RPC_URL_MAINNET is set in your environment)
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));
        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        //(used for ERC20 for ERC721)
        tokenA = new MockERC20("Token A", "TKA");
        nftA = new MockERC721("NFT A", "NFTA");

        //(used for ERC721 for ERC20)
        tokenB = new MockERC20("Token B", "TKB");
        nftB = new MockERC721("NFT B", "NFTB");

        // Deploy payment obligation contracts
        erc20PaymentObligation = new ERC20EscrowObligation(eas, schemaRegistry);
        erc721PaymentObligation = new ERC721PaymentObligation(eas, schemaRegistry);

        // Deploy arbiters
        erc20Arbiter = new ERC20PaymentFulfillmentArbiter(erc20PaymentObligation);
        erc721Arbiter = new ERC721PaymentFulfillmentArbiter(erc721PaymentObligation);

        // Fund Alice and Bob (ERC20 for ERC721)
        tokenA.transfer(alice, 1000 * 10 ** tokenA.decimals()); // Alice gets 10000 Token A
        nftA.mint(bob); // Bob gets NFT tokenId=1

        // Fund Alice and Bob (ERC721 for ERC20)
        tokenB.transfer(bob, 1000 * 10 ** tokenB.decimals()); // Bob gets 10000 Token B
        nftB.mint(alice); // Alice gets NFT tokenId=1
    }

    function _setupERC20ForERC721Trade() internal returns (bytes32 alicePaymentUID, bytes32 bobPaymentUID) {
        // Alice creates an ERC20 payment obligation
        vm.startPrank(alice);
        tokenA.approve(address(erc20PaymentObligation), 1000 * 10 ** tokenA.decimals());

        ERC20EscrowObligation.StatementData memory alicePaymentData = ERC20EscrowObligation.StatementData({
            token: address(tokenA),
            amount: 100 * 10 ** tokenA.decimals(),
            arbiter: address(erc721Arbiter),
            demand: abi.encode(ERC721PaymentFulfillmentArbiter.DemandData({token: address(nftA), tokenId: 1}))
        });

        alicePaymentUID = erc20PaymentObligation.makeStatement(alicePaymentData, uint64(block.timestamp + 1 days), bytes32(0));
        vm.stopPrank();

        // Bob creates an ERC721 payment obligation referencing Alice's statement
        vm.startPrank(bob);
        nftA.approve(address(erc721PaymentObligation), 1);

        ERC721PaymentObligation.StatementData memory bobPaymentData = ERC721PaymentObligation.StatementData({
            token: address(nftA),
            tokenId: 1,
            arbiter: address(erc20Arbiter),
            demand: abi.encode(
                ERC20PaymentFulfillmentArbiter.DemandData({token: address(tokenA), amount: 100 * 10 ** tokenA.decimals()})
            )
        });

        // Use Alice's payment UID as the refUID for Bob's statement
        bobPaymentUID = erc721PaymentObligation.makeStatement(bobPaymentData, uint64(block.timestamp + 1 days), alicePaymentUID);
        vm.stopPrank();
    }

    function testERC20ForERC721Trade() public {
        // Setup trade where Alice offers ERC20 and Bob offers ERC721
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupERC20ForERC721Trade();

        // Bob collects Alice's ERC20 payment
        vm.prank(bob);
        bool successBob = erc20PaymentObligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's ERC721 payment
        vm.prank(alice);
        bool successAlice = erc721PaymentObligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Assert final ownership
        assertEq(nftA.ownerOf(1), alice, "Alice should own NFT A");
        assertEq(tokenA.balanceOf(bob), 100 * 10 ** tokenA.decimals(), "Bob should own 100 Token A");
        assertEq(tokenA.balanceOf(alice), 900 * 10 ** tokenA.decimals(), "Alice should own 900 Token A");
    }

    function testERC20ForERC721TradeReversedOrder() public {
        // Setup trade where Alice offers ERC20 and Bob offers ERC721
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupERC20ForERC721Trade();

        // Alice collects Bob's ERC721 payment first
        vm.prank(alice);
        bool successAlice = erc721PaymentObligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Bob collects Alice's ERC20 payment
        vm.prank(bob);
        bool successBob = erc20PaymentObligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Assert final ownership
        assertEq(nftA.ownerOf(1), alice, "Alice should own NFT A");
        assertEq(tokenA.balanceOf(bob), 100 * 10 ** tokenA.decimals(), "Bob should own 100 Token A");
        assertEq(tokenA.balanceOf(alice), 900 * 10 ** tokenA.decimals(), "Alice should own 900 Token A");
    }

    function testERC20ForERC721TradeDoubleSpendAlice() public {
        // Setup trade where Alice offers ERC20 and Bob offers ERC721
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupERC20ForERC721Trade();

        // Alice collects Bob's ERC721 payment
        vm.prank(alice);
        bool successAlice = erc721PaymentObligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Bob collects Alice's ERC20 payment
        vm.prank(bob);
        bool successBob = erc20PaymentObligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        vm.prank(alice);
        vm.expectRevert();
        erc721PaymentObligation.collectPayment(bobPaymentUID, alicePaymentUID);
    }

    function testERC20ForERC721TradeDoubleSpendBob() public {
        // Setup trade where Alice offers ERC20 and Bob offers ERC721
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupERC20ForERC721Trade();

        // Alice collects Bob's ERC721 payment
        vm.prank(alice);
        bool successAlice = erc721PaymentObligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Bob collects Alice's ERC20 payment
        vm.prank(bob);
        bool successBob = erc20PaymentObligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        vm.prank(bob);
        vm.expectRevert();
        erc20PaymentObligation.collectPayment(alicePaymentUID, bobPaymentUID);
    }

    function _setupERC721ForERC20Trade() internal returns (bytes32 alicePaymentUID, bytes32 bobPaymentUID) {
        // Alice creates an ERC721 payment obligation
        vm.startPrank(alice);
        nftB.approve(address(erc721PaymentObligation), 1);

        ERC721PaymentObligation.StatementData memory alicePaymentData = ERC721PaymentObligation.StatementData({
            token: address(nftB),
            tokenId: 1,
            arbiter: address(erc20Arbiter),
            demand: abi.encode(
                ERC20PaymentFulfillmentArbiter.DemandData({token: address(tokenB), amount: 100 * 10 ** tokenB.decimals()})
            )
        });

        alicePaymentUID = erc721PaymentObligation.makeStatement(alicePaymentData, uint64(block.timestamp + 1 days), bytes32(0));
        vm.stopPrank();

        // Bob creates an ERC20 payment obligation referencing Alice's statement
        vm.startPrank(bob);
        tokenB.approve(address(erc20PaymentObligation), 1000 * 10 ** tokenB.decimals());

        ERC20EscrowObligation.StatementData memory bobPaymentData = ERC20EscrowObligation.StatementData({
            token: address(tokenB),
            amount: 100 * 10 ** tokenB.decimals(),
            arbiter: address(erc721Arbiter),
            demand: abi.encode(ERC721PaymentFulfillmentArbiter.DemandData({token: address(tokenB), tokenId: 1}))
        });

        // Use Alice's payment UID as the refUID for Bob's statement
        bobPaymentUID = erc20PaymentObligation.makeStatement(bobPaymentData, uint64(block.timestamp + 1 days), alicePaymentUID);
        vm.stopPrank();
    }

    function testERC721ForERC20Trade() public {
        // Setup trade where Alice offers ERC721 and Bob offers ERC20
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupERC721ForERC20Trade();

        // Bob collects Alice's ERC721 payment
        vm.prank(bob);
        bool successBob = erc721PaymentObligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's ERC20 payment
        vm.prank(alice);
        bool successAlice = erc20PaymentObligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Assert final ownership
        assertEq(nftB.ownerOf(1), bob, "Bob should own NFT B");
        assertEq(tokenB.balanceOf(alice), 100 * 10 ** tokenB.decimals(), "Alice should own 100 Token B");
        assertEq(tokenB.balanceOf(bob), 900 * 10 ** tokenB.decimals(), "Bob should own 900 Token B");
    }

    function testERC721ForERC20TradeReversedOrder() public {
        // Setup trade where Alice offers ERC721 and Bob offers ERC20
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupERC721ForERC20Trade();

        // Alice collects Bob's ERC20 payment first
        vm.prank(alice);
        bool successAlice = erc20PaymentObligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Bob collects Alice's ERC721 payment
        vm.prank(bob);
        bool successBob = erc721PaymentObligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Assert final ownership
        assertEq(nftB.ownerOf(1), bob, "Bob should own NFT B");
        assertEq(tokenB.balanceOf(alice), 100 * 10 ** tokenB.decimals(), "Alice should own 100 Token B");
        assertEq(tokenB.balanceOf(bob), 900 * 10 ** tokenB.decimals(), "Bob should own 900 Token B");
    }

    function testERC721ForERC20TradeDoubleSpendAlice() public {
        // Setup trade where Alice offers ERC721 and Bob offers ERC20
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupERC721ForERC20Trade();

        // Alice collects Bob's ERC20 payment
        vm.prank(alice);
        bool successAlice = erc20PaymentObligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Bob collects Alice's ERC721 payment
        vm.prank(bob);
        bool successBob = erc721PaymentObligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        vm.prank(alice);
        vm.expectRevert();
        erc721PaymentObligation.collectPayment(bobPaymentUID, alicePaymentUID);
    }

    function testERC721ForERC20TradeDoubleSpendBob() public {
        // Setup trade where Alice offers ERC721 and Bob offers ERC20
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupERC721ForERC20Trade();

        // Alice collects Bob's ERC20 payment
        vm.prank(alice);
        bool successAlice = erc20PaymentObligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Bob collects Alice's ERC721 payment
        vm.prank(bob);
        bool successBob = erc721PaymentObligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        vm.prank(bob);
        vm.expectRevert();
        erc20PaymentObligation.collectPayment(alicePaymentUID, bobPaymentUID);
    }
}