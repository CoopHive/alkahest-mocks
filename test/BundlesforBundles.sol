// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {BundlePaymentObligation} from "../src/Statements/BundlePaymentObligation.sol";
import {BundlePaymentFulfillmentArbiter} from "../src/Validators/BundlePaymentFulfillmentArbiter.sol";
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

contract BundleObligationTest is Test {
    BundlePaymentObligation public bundlepaymentobligation;
    BundlePaymentFulfillmentArbiter public bundlepaymentfulfillmentarbiter;
    MockERC20 public tokenA;
    MockERC721 public nftA;
    MockERC20 public tokenB;
    MockERC721 public nftB;
    MockERC20 public tokenA2;
    MockERC721 public nftA2;
    MockERC20 public tokenB2;
    MockERC721 public nftB2;

    // Replace with actual addresses or mock addresses if needed
    address public constant EAS_ADDRESS = 0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS = 0xA7b39296258348C78294F95B872b282326A97BDF;

    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        // Fork the mainnet (ensure that RPC_URL_MAINNET is set in your environment)
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));
        IEAS eas = IEAS(EAS_ADDRESS);
        ISchemaRegistry schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        tokenA = new MockERC20("Token A", "TKA");
        nftA = new MockERC721("NFT A", "NFTA");

        tokenB = new MockERC20("Token B", "TKB");
        nftB = new MockERC721("NFT B", "NFTB");

        tokenA2 = new MockERC20("Token A2", "TKA2");
        nftA2 = new MockERC721("NFT A2", "NFTA2");

        tokenB2 = new MockERC20("Token B2", "TKB2");
        nftB2 = new MockERC721("NFT B2", "NFTB2");

        bundlepaymentobligation = new BundlePaymentObligation(eas, schemaRegistry);
        bundlepaymentfulfillmentarbiter = new BundlePaymentFulfillmentArbiter(bundlepaymentobligation);

        // Fund Alice
        tokenA.transfer(alice, 1000 * 10 ** tokenA.decimals()); // Alice gets 10000 Token A
        nftA.mint(alice); // Alice gets NFT tokenId=1
        tokenA2.transfer(alice, 1000 * 10 ** tokenA.decimals()); // Alice gets 10000 Token A2
        nftA2.mint(alice); // Alice gets NFT tokenId=1

        // Fund Bob
        tokenB.transfer(bob, 1000 * 10 ** tokenB.decimals()); // Bob gets 10000 Token B
        nftB.mint(bob); // Bob gets NFT tokenId=1
        tokenB2.transfer(bob, 1000 * 10 ** tokenB.decimals()); // Bob gets 10000 Token B2
        nftB2.mint(bob); // Bob gets NFT tokenId=1
    }

    function _setupSingleERC20ForSingleERC20Trade() internal returns (bytes32 alicePaymentUID, bytes32 bobPaymentUID) {
        vm.startPrank(alice);
        tokenA.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenA.decimals());

        address[] memory aliceERC20Addresses = new address[](1);
        aliceERC20Addresses[0] = address(tokenA);

        uint256[] memory aliceERC20Amounts = new uint256[](1);
        aliceERC20Amounts[0] = 1000 * 10 ** 18;

        address[] memory aliceERC721Addresses;

        uint256[] memory aliceERC20Ids;

        address[] memory aliceDemandERC20Addresses = new address[](1);
        aliceDemandERC20Addresses[0] = address(tokenB);

        uint256[] memory aliceDemandERC20Amounts = new uint256[](1);
        aliceDemandERC20Amounts[0] = 1000 * 10 ** 18;

        address[] memory aliceDemandERC721Addresses;

        uint256[] memory aliceDemandERC20Ids;

        BundlePaymentObligation.StatementData memory alicePaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: aliceERC20Addresses,
            erc20Amounts: aliceERC20Amounts,
            erc721Addresses: aliceERC721Addresses,
            erc721Ids: aliceERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: aliceDemandERC20Addresses,
                    erc20Amounts: aliceDemandERC20Amounts,
                    erc721Addresses: aliceDemandERC721Addresses,
                    erc721Ids: aliceDemandERC20Ids
                })
            )
        });

        alicePaymentUID =
            bundlepaymentobligation.makeStatement(alicePaymentData, uint64(block.timestamp + 1 days), bytes32(0));
        vm.stopPrank();

        vm.startPrank(bob);
        tokenB.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenB.decimals());

        address[] memory bobERC20Addresses = new address[](1);
        bobERC20Addresses[0] = address(tokenB);

        uint256[] memory bobERC20Amounts = new uint256[](1);
        bobERC20Amounts[0] = 1000 * 10 ** 18;

        address[] memory bobERC721Addresses;

        uint256[] memory bobERC20Ids;

        address[] memory bobDemandERC20Addresses = new address[](1);
        bobDemandERC20Addresses[0] = address(tokenA);

        uint256[] memory bobDemandERC20Amounts = new uint256[](1);
        bobDemandERC20Amounts[0] = 1000 * 10 ** 18;

        address[] memory bobDemandERC721Addresses;

        uint256[] memory bobDemandERC20Ids;

        BundlePaymentObligation.StatementData memory bobPaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: bobERC20Addresses,
            erc20Amounts: bobERC20Amounts,
            erc721Addresses: bobERC721Addresses,
            erc721Ids: bobERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: bobDemandERC20Addresses,
                    erc20Amounts: bobDemandERC20Amounts,
                    erc721Addresses: bobDemandERC721Addresses,
                    erc721Ids: bobDemandERC20Ids
                })
            )
        });

        bobPaymentUID =
            bundlepaymentobligation.makeStatement(bobPaymentData, uint64(block.timestamp + 1 days), alicePaymentUID);
        vm.stopPrank();
    }

    function testSingleERC20ForERC20Trade() public {
        // Setup trade where Alice offers ERC20 and Bob offers ERC20
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupSingleERC20ForSingleERC20Trade();

        // Bob collects Alice's bundle payment
        vm.prank(bob);
        bool successBob = bundlepaymentobligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's bundle payment
        vm.prank(alice);
        bool successAlice = bundlepaymentobligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Assert final ownership
        assertEq(tokenA.balanceOf(bob), 1000 * 10 ** tokenA.decimals(), "Bob should own 1000 Token A after the trade");
        assertEq(
            tokenB.balanceOf(alice), 1000 * 10 ** tokenB.decimals(), "Alice should own 1000 Token B after the trade"
        );
    }

    function _setupSingleERC721ForSingleERC721Trade()
        internal
        returns (bytes32 alicePaymentUID, bytes32 bobPaymentUID)
    {
        vm.startPrank(alice);
        nftA.mint(alice);
        nftA.approve(address(bundlepaymentobligation), 1);

        address[] memory aliceERC20Addresses;

        uint256[] memory aliceERC20Amounts;

        address[] memory aliceERC721Addresses = new address[](1);
        aliceERC721Addresses[0] = address(nftA);

        uint256[] memory aliceERC20Ids = new uint256[](1);
        aliceERC20Ids[0] = 1;

        address[] memory aliceDemandERC20Addresses;

        uint256[] memory aliceDemandERC20Amounts;

        address[] memory aliceDemandERC721Addresses = new address[](1);
        aliceDemandERC721Addresses[0] = address(nftB);

        uint256[] memory aliceDemandERC20Ids = new uint256[](1);
        aliceDemandERC20Ids[0] = 1;

        BundlePaymentObligation.StatementData memory alicePaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: aliceERC20Addresses,
            erc20Amounts: aliceERC20Amounts,
            erc721Addresses: aliceERC721Addresses,
            erc721Ids: aliceERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: aliceDemandERC20Addresses,
                    erc20Amounts: aliceDemandERC20Amounts,
                    erc721Addresses: aliceDemandERC721Addresses,
                    erc721Ids: aliceDemandERC20Ids
                })
            )
        });

        alicePaymentUID =
            bundlepaymentobligation.makeStatement(alicePaymentData, uint64(block.timestamp + 1 days), bytes32(0));
        vm.stopPrank();

        vm.startPrank(bob);
        nftB.mint(bob);
        nftB.approve(address(bundlepaymentobligation), 1);

        address[] memory bobERC20Addresses;

        uint256[] memory bobERC20Amounts;

        address[] memory bobERC721Addresses = new address[](1);
        bobERC721Addresses[0] = address(nftB);

        uint256[] memory bobERC20Ids = new uint256[](1);
        bobERC20Ids[0] = 1;

        address[] memory bobDemandERC20Addresses;

        uint256[] memory bobDemandERC20Amounts;

        address[] memory bobDemandERC721Addresses = new address[](1);
        bobDemandERC721Addresses[0] = address(nftA);

        uint256[] memory bobDemandERC20Ids = new uint256[](1);
        bobDemandERC20Ids[0] = 1;

        BundlePaymentObligation.StatementData memory bobPaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: bobERC20Addresses,
            erc20Amounts: bobERC20Amounts,
            erc721Addresses: bobERC721Addresses,
            erc721Ids: bobERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: bobDemandERC20Addresses,
                    erc20Amounts: bobDemandERC20Amounts,
                    erc721Addresses: bobDemandERC721Addresses,
                    erc721Ids: bobDemandERC20Ids
                })
            )
        });

        bobPaymentUID =
            bundlepaymentobligation.makeStatement(bobPaymentData, uint64(block.timestamp + 1 days), alicePaymentUID);
        vm.stopPrank();
    }

    function testSingleERC721ForERC721Trade() public {
        // Setup trade where Alice offers ERC20 and Bob offers ERC20
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupSingleERC721ForSingleERC721Trade();

        // Bob collects Alice's bundle payment
        vm.prank(bob);
        bool successBob = bundlepaymentobligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's bundle payment
        vm.prank(alice);
        bool successAlice = bundlepaymentobligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Assert final ownership
        assertEq(nftA.ownerOf(1), bob, "Bob should own NFT A");
        assertEq(nftB.ownerOf(1), alice, "Alice should own NFT B");
    }

    function _setupSingleERC20ForSingleERC721Trade()
        internal
        returns (bytes32 alicePaymentUID, bytes32 bobPaymentUID)
    {
        vm.startPrank(alice);
        tokenA.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenA.decimals());

        address[] memory aliceERC20Addresses = new address[](1);
        aliceERC20Addresses[0] = address(tokenA);

        uint256[] memory aliceERC20Amounts = new uint256[](1);
        aliceERC20Amounts[0] = 1000 * 10 ** 18;

        address[] memory aliceERC721Addresses;

        uint256[] memory aliceERC20Ids;

        address[] memory aliceDemandERC20Addresses;

        uint256[] memory aliceDemandERC20Amounts;

        address[] memory aliceDemandERC721Addresses = new address[](1);
        aliceDemandERC721Addresses[0] = address(nftB);

        uint256[] memory aliceDemandERC20Ids = new uint256[](1);
        aliceDemandERC20Ids[0] = 1;

        BundlePaymentObligation.StatementData memory alicePaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: aliceERC20Addresses,
            erc20Amounts: aliceERC20Amounts,
            erc721Addresses: aliceERC721Addresses,
            erc721Ids: aliceERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: aliceDemandERC20Addresses,
                    erc20Amounts: aliceDemandERC20Amounts,
                    erc721Addresses: aliceDemandERC721Addresses,
                    erc721Ids: aliceDemandERC20Ids
                })
            )
        });

        alicePaymentUID =
            bundlepaymentobligation.makeStatement(alicePaymentData, uint64(block.timestamp + 1 days), bytes32(0));
        vm.stopPrank();

        vm.startPrank(bob);
        nftB.mint(bob);
        nftB.approve(address(bundlepaymentobligation), 1);

        address[] memory bobERC20Addresses;

        uint256[] memory bobERC20Amounts;

        address[] memory bobERC721Addresses = new address[](1);
        bobERC721Addresses[0] = address(nftB);

        uint256[] memory bobERC20Ids = new uint256[](1);
        bobERC20Ids[0] = 1;

        address[] memory bobDemandERC20Addresses = new address[](1);
        bobDemandERC20Addresses[0] = address(tokenA);

        uint256[] memory bobDemandERC20Amounts = new uint256[](1);
        bobDemandERC20Amounts[0] = 1000 * 10 ** 18;

        address[] memory bobDemandERC721Addresses;

        uint256[] memory bobDemandERC20Ids;

        BundlePaymentObligation.StatementData memory bobPaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: bobERC20Addresses,
            erc20Amounts: bobERC20Amounts,
            erc721Addresses: bobERC721Addresses,
            erc721Ids: bobERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: bobDemandERC20Addresses,
                    erc20Amounts: bobDemandERC20Amounts,
                    erc721Addresses: bobDemandERC721Addresses,
                    erc721Ids: bobDemandERC20Ids
                })
            )
        });

        bobPaymentUID =
            bundlepaymentobligation.makeStatement(bobPaymentData, uint64(block.timestamp + 1 days), alicePaymentUID);
        vm.stopPrank();
    }

    function testSingleERC20ForERC721Trade() public {
        // Setup trade where Alice offers ERC20 and Bob offers ERC20
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupSingleERC20ForSingleERC721Trade();

        // Bob collects Alice's bundle payment
        vm.prank(bob);
        bool successBob = bundlepaymentobligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's bundle payment
        vm.prank(alice);
        bool successAlice = bundlepaymentobligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Assert final ownership
        assertEq(tokenA.balanceOf(bob), 1000 * 10 ** tokenA.decimals(), "Bob should own 1000 Token A after the trade");
        assertEq(nftB.ownerOf(1), alice, "Alice should own NFT B");
    }

    function _setupSingleERC721ForSingleERC20Trade()
        internal
        returns (bytes32 alicePaymentUID, bytes32 bobPaymentUID)
    {
        vm.startPrank(alice);
        nftA.mint(alice);
        nftA.approve(address(bundlepaymentobligation), 1);

        address[] memory aliceERC20Addresses;

        uint256[] memory aliceERC20Amounts;

        address[] memory aliceERC721Addresses = new address[](1);
        aliceERC721Addresses[0] = address(nftA);

        uint256[] memory aliceERC20Ids = new uint256[](1);
        aliceERC20Ids[0] = 1;

        address[] memory aliceDemandERC20Addresses = new address[](1);
        aliceDemandERC20Addresses[0] = address(tokenB);

        uint256[] memory aliceDemandERC20Amounts = new uint256[](1);
        aliceDemandERC20Amounts[0] = 1000 * 10 ** 18;

        address[] memory aliceDemandERC721Addresses;

        uint256[] memory aliceDemandERC20Ids;

        BundlePaymentObligation.StatementData memory alicePaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: aliceERC20Addresses,
            erc20Amounts: aliceERC20Amounts,
            erc721Addresses: aliceERC721Addresses,
            erc721Ids: aliceERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: aliceDemandERC20Addresses,
                    erc20Amounts: aliceDemandERC20Amounts,
                    erc721Addresses: aliceDemandERC721Addresses,
                    erc721Ids: aliceDemandERC20Ids
                })
            )
        });

        alicePaymentUID =
            bundlepaymentobligation.makeStatement(alicePaymentData, uint64(block.timestamp + 1 days), bytes32(0));
        vm.stopPrank();

        vm.startPrank(bob);
        tokenB.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenB.decimals());

        address[] memory bobERC20Addresses = new address[](1);
        bobERC20Addresses[0] = address(tokenB);

        uint256[] memory bobERC20Amounts = new uint256[](1);
        bobERC20Amounts[0] = 1000 * 10 ** 18;

        address[] memory bobERC721Addresses;

        uint256[] memory bobERC20Ids;

        address[] memory bobDemandERC20Addresses;

        uint256[] memory bobDemandERC20Amounts;

        address[] memory bobDemandERC721Addresses = new address[](1);
        bobDemandERC721Addresses[0] = address(nftA);

        uint256[] memory bobDemandERC20Ids = new uint256[](1);
        bobDemandERC20Ids[0] = 1;

        BundlePaymentObligation.StatementData memory bobPaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: bobERC20Addresses,
            erc20Amounts: bobERC20Amounts,
            erc721Addresses: bobERC721Addresses,
            erc721Ids: bobERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: bobDemandERC20Addresses,
                    erc20Amounts: bobDemandERC20Amounts,
                    erc721Addresses: bobDemandERC721Addresses,
                    erc721Ids: bobDemandERC20Ids
                })
            )
        });

        bobPaymentUID =
            bundlepaymentobligation.makeStatement(bobPaymentData, uint64(block.timestamp + 1 days), alicePaymentUID);
        vm.stopPrank();
    }

    function testSingleERC721ForERC20Trade() public {
        // Setup trade where Alice offers ERC20 and Bob offers ERC20
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupSingleERC721ForSingleERC20Trade();

        // Bob collects Alice's bundle payment
        vm.prank(bob);
        bool successBob = bundlepaymentobligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's bundle payment
        vm.prank(alice);
        bool successAlice = bundlepaymentobligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Assert final ownership
        assertEq(nftA.ownerOf(1), bob, "Bob should own NFT A");
        assertEq(
            tokenB.balanceOf(alice), 1000 * 10 ** tokenB.decimals(), "Alice should own 1000 Token B after the trade"
        );
    }

    function _setupMultipleERC20ForMultipleERC20Trade()
        internal
        returns (bytes32 alicePaymentUID, bytes32 bobPaymentUID)
    {
        vm.startPrank(alice);
        tokenA.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenA.decimals());
        tokenA2.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenA.decimals());

        address[] memory aliceERC20Addresses = new address[](2);
        aliceERC20Addresses[0] = address(tokenA);
        aliceERC20Addresses[1] = address(tokenA2);

        uint256[] memory aliceERC20Amounts = new uint256[](2);
        aliceERC20Amounts[0] = 1000 * 10 ** 18;
        aliceERC20Amounts[1] = 1000 * 10 ** 18;

        address[] memory aliceERC721Addresses;

        uint256[] memory aliceERC20Ids;

        address[] memory aliceDemandERC20Addresses = new address[](2);
        aliceDemandERC20Addresses[0] = address(tokenB);
        aliceDemandERC20Addresses[1] = address(tokenB2);

        uint256[] memory aliceDemandERC20Amounts = new uint256[](2);
        aliceDemandERC20Amounts[0] = 1000 * 10 ** 18;
        aliceDemandERC20Amounts[1] = 1000 * 10 ** 18;

        address[] memory aliceDemandERC721Addresses;

        uint256[] memory aliceDemandERC20Ids;

        BundlePaymentObligation.StatementData memory alicePaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: aliceERC20Addresses,
            erc20Amounts: aliceERC20Amounts,
            erc721Addresses: aliceERC721Addresses,
            erc721Ids: aliceERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: aliceDemandERC20Addresses,
                    erc20Amounts: aliceDemandERC20Amounts,
                    erc721Addresses: aliceDemandERC721Addresses,
                    erc721Ids: aliceDemandERC20Ids
                })
            )
        });

        alicePaymentUID =
            bundlepaymentobligation.makeStatement(alicePaymentData, uint64(block.timestamp + 1 days), bytes32(0));
        vm.stopPrank();

        vm.startPrank(bob);
        tokenB.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenB.decimals());
        tokenB2.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenB.decimals());

        address[] memory bobERC20Addresses = new address[](2);
        bobERC20Addresses[0] = address(tokenB);
        bobERC20Addresses[1] = address(tokenB2);

        uint256[] memory bobERC20Amounts = new uint256[](2);
        bobERC20Amounts[0] = 1000 * 10 ** 18;
        bobERC20Amounts[1] = 1000 * 10 ** 18;

        address[] memory bobERC721Addresses;

        uint256[] memory bobERC20Ids;

        address[] memory bobDemandERC20Addresses = new address[](2);
        bobDemandERC20Addresses[0] = address(tokenA);
        bobDemandERC20Addresses[1] = address(tokenA2);

        uint256[] memory bobDemandERC20Amounts = new uint256[](2);
        bobDemandERC20Amounts[0] = 1000 * 10 ** 18;
        bobDemandERC20Amounts[1] = 1000 * 10 ** 18;

        address[] memory bobDemandERC721Addresses;

        uint256[] memory bobDemandERC20Ids;

        BundlePaymentObligation.StatementData memory bobPaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: bobERC20Addresses,
            erc20Amounts: bobERC20Amounts,
            erc721Addresses: bobERC721Addresses,
            erc721Ids: bobERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: bobDemandERC20Addresses,
                    erc20Amounts: bobDemandERC20Amounts,
                    erc721Addresses: bobDemandERC721Addresses,
                    erc721Ids: bobDemandERC20Ids
                })
            )
        });

        bobPaymentUID =
            bundlepaymentobligation.makeStatement(bobPaymentData, uint64(block.timestamp + 1 days), alicePaymentUID);
        vm.stopPrank();
    }

    function testMultipleERC20ForMultipleERC20Trade() public {
        // Setup trade where Alice offers ERC20 and Bob offers ERC20
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupMultipleERC20ForMultipleERC20Trade();

        // Bob collects Alice's bundle payment
        vm.prank(bob);
        bool successBob = bundlepaymentobligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's bundle payment
        vm.prank(alice);
        bool successAlice = bundlepaymentobligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Assert final ownership
        assertEq(tokenA.balanceOf(bob), 1000 * 10 ** tokenA.decimals(), "Bob should own 1000 Token A after the trade");
        assertEq(tokenA.balanceOf(bob), 1000 * 10 ** tokenA2.decimals(), "Bob should own 1000 Token A2 after the trade");
        assertEq(
            tokenB.balanceOf(alice), 1000 * 10 ** tokenB.decimals(), "Alice should own 1000 Token B after the trade"
        );
        assertEq(
            tokenB2.balanceOf(alice), 1000 * 10 ** tokenB.decimals(), "Alice should own 1000 Token B2 after the trade"
        );
    }

    function _setupMultipleERC721ForMultipleERC721Trade()
        internal
        returns (bytes32 alicePaymentUID, bytes32 bobPaymentUID)
    {
        vm.startPrank(alice);
        nftA.mint(alice);
        nftA.approve(address(bundlepaymentobligation), 1);
        nftA2.mint(alice);
        nftA2.approve(address(bundlepaymentobligation), 1);

        address[] memory aliceERC20Addresses;

        uint256[] memory aliceERC20Amounts;

        address[] memory aliceERC721Addresses = new address[](2);
        aliceERC721Addresses[0] = address(nftA);
        aliceERC721Addresses[1] = address(nftA2);

        uint256[] memory aliceERC20Ids = new uint256[](2);
        aliceERC20Ids[0] = 1;
        aliceERC20Ids[1] = 1;

        address[] memory aliceDemandERC20Addresses;

        uint256[] memory aliceDemandERC20Amounts;

        address[] memory aliceDemandERC721Addresses = new address[](2);
        aliceDemandERC721Addresses[0] = address(nftB);
        aliceDemandERC721Addresses[1] = address(nftB2);

        uint256[] memory aliceDemandERC20Ids = new uint256[](2);
        aliceDemandERC20Ids[0] = 1;
        aliceDemandERC20Ids[1] = 1;

        BundlePaymentObligation.StatementData memory alicePaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: aliceERC20Addresses,
            erc20Amounts: aliceERC20Amounts,
            erc721Addresses: aliceERC721Addresses,
            erc721Ids: aliceERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: aliceDemandERC20Addresses,
                    erc20Amounts: aliceDemandERC20Amounts,
                    erc721Addresses: aliceDemandERC721Addresses,
                    erc721Ids: aliceDemandERC20Ids
                })
            )
        });

        alicePaymentUID =
            bundlepaymentobligation.makeStatement(alicePaymentData, uint64(block.timestamp + 1 days), bytes32(0));
        vm.stopPrank();

        vm.startPrank(bob);
        nftB.mint(bob);
        nftB.approve(address(bundlepaymentobligation), 1);
        nftB2.mint(bob);
        nftB2.approve(address(bundlepaymentobligation), 1);

        address[] memory bobERC20Addresses;

        uint256[] memory bobERC20Amounts;

        address[] memory bobERC721Addresses = new address[](2);
        bobERC721Addresses[0] = address(nftB);
        bobERC721Addresses[1] = address(nftB2);

        uint256[] memory bobERC20Ids = new uint256[](2);
        bobERC20Ids[0] = 1;
        bobERC20Ids[1] = 1;

        address[] memory bobDemandERC20Addresses;

        uint256[] memory bobDemandERC20Amounts;

        address[] memory bobDemandERC721Addresses = new address[](2);
        bobDemandERC721Addresses[0] = address(nftA);
        bobDemandERC721Addresses[1] = address(nftA2);

        uint256[] memory bobDemandERC20Ids = new uint256[](2);
        bobDemandERC20Ids[0] = 1;
        bobDemandERC20Ids[1] = 1;

        BundlePaymentObligation.StatementData memory bobPaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: bobERC20Addresses,
            erc20Amounts: bobERC20Amounts,
            erc721Addresses: bobERC721Addresses,
            erc721Ids: bobERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: bobDemandERC20Addresses,
                    erc20Amounts: bobDemandERC20Amounts,
                    erc721Addresses: bobDemandERC721Addresses,
                    erc721Ids: bobDemandERC20Ids
                })
            )
        });

        bobPaymentUID =
            bundlepaymentobligation.makeStatement(bobPaymentData, uint64(block.timestamp + 1 days), alicePaymentUID);
        vm.stopPrank();
    }

    function testMultipleERC721ForMultipleERC721Trade() public {
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupMultipleERC721ForMultipleERC721Trade();

        // Bob collects Alice's bundle payment
        vm.prank(bob);
        bool successBob = bundlepaymentobligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's bundle payment
        vm.prank(alice);
        bool successAlice = bundlepaymentobligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Assert final ownership
        assertEq(nftA.ownerOf(1), bob, "Bob should own NFT A");
        assertEq(nftA2.ownerOf(1), bob, "Bob should own NFT A2");
        assertEq(nftB.ownerOf(1), alice, "Alice should own NFT B");
        assertEq(nftB2.ownerOf(1), alice, "Alice should own NFT B2");
    }

    function _setupMultipleERC20ForMultipleERC721Trade()
        internal
        returns (bytes32 alicePaymentUID, bytes32 bobPaymentUID)
    {
        vm.startPrank(alice);
        tokenA.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenA.decimals());
        tokenA2.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenA2.decimals());

        address[] memory aliceERC20Addresses = new address[](2);
        aliceERC20Addresses[0] = address(tokenA);
        aliceERC20Addresses[1] = address(tokenA2);

        uint256[] memory aliceERC20Amounts = new uint256[](2);
        aliceERC20Amounts[0] = 1000 * 10 ** 18;
        aliceERC20Amounts[1] = 1000 * 10 ** 18;

        address[] memory aliceERC721Addresses;

        uint256[] memory aliceERC20Ids;

        address[] memory aliceDemandERC20Addresses;

        uint256[] memory aliceDemandERC20Amounts;

        address[] memory aliceDemandERC721Addresses = new address[](2);
        aliceDemandERC721Addresses[0] = address(nftB);
        aliceDemandERC721Addresses[1] = address(nftB2);

        uint256[] memory aliceDemandERC20Ids = new uint256[](2);
        aliceDemandERC20Ids[0] = 1;
        aliceDemandERC20Ids[1] = 1;

        BundlePaymentObligation.StatementData memory alicePaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: aliceERC20Addresses,
            erc20Amounts: aliceERC20Amounts,
            erc721Addresses: aliceERC721Addresses,
            erc721Ids: aliceERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: aliceDemandERC20Addresses,
                    erc20Amounts: aliceDemandERC20Amounts,
                    erc721Addresses: aliceDemandERC721Addresses,
                    erc721Ids: aliceDemandERC20Ids
                })
            )
        });

        alicePaymentUID =
            bundlepaymentobligation.makeStatement(alicePaymentData, uint64(block.timestamp + 1 days), bytes32(0));
        vm.stopPrank();

        vm.startPrank(bob);
        nftB.mint(bob);
        nftB.approve(address(bundlepaymentobligation), 1);
        nftB2.mint(bob);
        nftB2.approve(address(bundlepaymentobligation), 1);

        address[] memory bobERC20Addresses;

        uint256[] memory bobERC20Amounts;

        address[] memory bobERC721Addresses = new address[](2);
        bobERC721Addresses[0] = address(nftB);
        bobERC721Addresses[1] = address(nftB2);

        uint256[] memory bobERC20Ids = new uint256[](2);
        bobERC20Ids[0] = 1;
        bobERC20Ids[1] = 1;

        address[] memory bobDemandERC20Addresses = new address[](2);
        bobDemandERC20Addresses[0] = address(tokenA);
        bobDemandERC20Addresses[1] = address(tokenA2);

        uint256[] memory bobDemandERC20Amounts = new uint256[](2);
        bobDemandERC20Amounts[0] = 1000 * 10 ** 18;
        bobDemandERC20Amounts[1] = 1000 * 10 ** 18;

        address[] memory bobDemandERC721Addresses;

        uint256[] memory bobDemandERC20Ids;

        BundlePaymentObligation.StatementData memory bobPaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: bobERC20Addresses,
            erc20Amounts: bobERC20Amounts,
            erc721Addresses: bobERC721Addresses,
            erc721Ids: bobERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: bobDemandERC20Addresses,
                    erc20Amounts: bobDemandERC20Amounts,
                    erc721Addresses: bobDemandERC721Addresses,
                    erc721Ids: bobDemandERC20Ids
                })
            )
        });

        bobPaymentUID =
            bundlepaymentobligation.makeStatement(bobPaymentData, uint64(block.timestamp + 1 days), alicePaymentUID);
        vm.stopPrank();
    }

    function testMultipleERC20ForMultipleERC721Trade() public {
        // Setup trade where Alice offers ERC20 and Bob offers ERC20
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupMultipleERC20ForMultipleERC721Trade();

        // Bob collects Alice's bundle payment
        vm.prank(bob);
        bool successBob = bundlepaymentobligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's bundle payment
        vm.prank(alice);
        bool successAlice = bundlepaymentobligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Assert final ownership
        assertEq(tokenA.balanceOf(bob), 1000 * 10 ** tokenA.decimals(), "Bob should own 1000 Token A after the trade");
        assertEq(tokenA.balanceOf(bob), 1000 * 10 ** tokenA2.decimals(), "Bob should own 1000 Token A2 after the trade");
        assertEq(nftB.ownerOf(1), alice, "Alice should own NFT B");
        assertEq(nftB2.ownerOf(1), alice, "Alice should own NFT B2");
    }

    function _setupMultipleERC721ForMultipleERC20Trade()
        internal
        returns (bytes32 alicePaymentUID, bytes32 bobPaymentUID)
    {
        vm.startPrank(alice);
        nftA.mint(alice);
        nftA.approve(address(bundlepaymentobligation), 1);
        nftA2.mint(alice);
        nftA2.approve(address(bundlepaymentobligation), 1);

        address[] memory aliceERC20Addresses;

        uint256[] memory aliceERC20Amounts;

        address[] memory aliceERC721Addresses = new address[](2);
        aliceERC721Addresses[0] = address(nftA);
        aliceERC721Addresses[1] = address(nftA2);

        uint256[] memory aliceERC20Ids = new uint256[](2);
        aliceERC20Ids[0] = 1;
        aliceERC20Ids[1] = 1;

        address[] memory aliceDemandERC20Addresses = new address[](2);
        aliceDemandERC20Addresses[0] = address(tokenB);
        aliceDemandERC20Addresses[1] = address(tokenB2);

        uint256[] memory aliceDemandERC20Amounts = new uint256[](2);
        aliceDemandERC20Amounts[0] = 1000 * 10 ** 18;
        aliceDemandERC20Amounts[1] = 1000 * 10 ** 18;

        address[] memory aliceDemandERC721Addresses;

        uint256[] memory aliceDemandERC20Ids;

        BundlePaymentObligation.StatementData memory alicePaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: aliceERC20Addresses,
            erc20Amounts: aliceERC20Amounts,
            erc721Addresses: aliceERC721Addresses,
            erc721Ids: aliceERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: aliceDemandERC20Addresses,
                    erc20Amounts: aliceDemandERC20Amounts,
                    erc721Addresses: aliceDemandERC721Addresses,
                    erc721Ids: aliceDemandERC20Ids
                })
            )
        });

        alicePaymentUID =
            bundlepaymentobligation.makeStatement(alicePaymentData, uint64(block.timestamp + 1 days), bytes32(0));
        vm.stopPrank();

        vm.startPrank(bob);
        tokenB.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenB.decimals());
        tokenB2.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenB.decimals());

        address[] memory bobERC20Addresses = new address[](2);
        bobERC20Addresses[0] = address(tokenB);
        bobERC20Addresses[1] = address(tokenB2);

        uint256[] memory bobERC20Amounts = new uint256[](2);
        bobERC20Amounts[0] = 1000 * 10 ** 18;
        bobERC20Amounts[1] = 1000 * 10 ** 18;

        address[] memory bobERC721Addresses;

        uint256[] memory bobERC20Ids;

        address[] memory bobDemandERC20Addresses;

        uint256[] memory bobDemandERC20Amounts;

        address[] memory bobDemandERC721Addresses = new address[](2);
        bobDemandERC721Addresses[0] = address(nftA);
        bobDemandERC721Addresses[1] = address(nftA2);

        uint256[] memory bobDemandERC20Ids = new uint256[](2);
        bobDemandERC20Ids[0] = 1;
        bobDemandERC20Ids[1] = 1;

        BundlePaymentObligation.StatementData memory bobPaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: bobERC20Addresses,
            erc20Amounts: bobERC20Amounts,
            erc721Addresses: bobERC721Addresses,
            erc721Ids: bobERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: bobDemandERC20Addresses,
                    erc20Amounts: bobDemandERC20Amounts,
                    erc721Addresses: bobDemandERC721Addresses,
                    erc721Ids: bobDemandERC20Ids
                })
            )
        });

        bobPaymentUID =
            bundlepaymentobligation.makeStatement(bobPaymentData, uint64(block.timestamp + 1 days), alicePaymentUID);
        vm.stopPrank();
    }

    function testMultipleERC721ForMultipleERC20Trade() public {
        // Setup trade where Alice offers ERC20 and Bob offers ERC20
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupMultipleERC721ForMultipleERC20Trade();

        // Bob collects Alice's bundle payment
        vm.prank(bob);
        bool successBob = bundlepaymentobligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's bundle payment
        vm.prank(alice);
        bool successAlice = bundlepaymentobligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Assert final ownership
        assertEq(nftA.ownerOf(1), bob, "Bob should own NFT A");
        assertEq(nftA2.ownerOf(1), bob, "Bob should own NFT A2");
        assertEq(
            tokenB.balanceOf(alice), 1000 * 10 ** tokenB.decimals(), "Alice should own 1000 Token B after the trade"
        );
        assertEq(
            tokenB2.balanceOf(alice), 1000 * 10 ** tokenB2.decimals(), "Alice should own 1000 Token B after the trade"
        );
    }

    function _setupSingleERC721andERC20ForSingleERC721andERC20Trade()
        internal
        returns (bytes32 alicePaymentUID, bytes32 bobPaymentUID)
    {
        vm.startPrank(alice);
        nftA.mint(alice);
        nftA.approve(address(bundlepaymentobligation), 1);
        tokenA.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenA.decimals());

        address[] memory aliceERC20Addresses = new address[](1);
        aliceERC20Addresses[0] = address(tokenA);

        uint256[] memory aliceERC20Amounts = new uint256[](1);
        aliceERC20Amounts[0] = 1000 * 10 ** 18;

        address[] memory aliceERC721Addresses = new address[](1);
        aliceERC721Addresses[0] = address(nftA);

        uint256[] memory aliceERC20Ids = new uint256[](1);
        aliceERC20Ids[0] = 1;

        address[] memory aliceDemandERC20Addresses = new address[](1);
        aliceDemandERC20Addresses[0] = address(tokenB);

        uint256[] memory aliceDemandERC20Amounts = new uint256[](1);
        aliceDemandERC20Amounts[0] = 1000 * 10 ** 18;

        address[] memory aliceDemandERC721Addresses = new address[](1);
        aliceDemandERC721Addresses[0] = address(nftB);

        uint256[] memory aliceDemandERC20Ids = new uint256[](1);
        aliceDemandERC20Ids[0] = 1;

        BundlePaymentObligation.StatementData memory alicePaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: aliceERC20Addresses,
            erc20Amounts: aliceERC20Amounts,
            erc721Addresses: aliceERC721Addresses,
            erc721Ids: aliceERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: aliceDemandERC20Addresses,
                    erc20Amounts: aliceDemandERC20Amounts,
                    erc721Addresses: aliceDemandERC721Addresses,
                    erc721Ids: aliceDemandERC20Ids
                })
            )
        });

        alicePaymentUID =
            bundlepaymentobligation.makeStatement(alicePaymentData, uint64(block.timestamp + 1 days), bytes32(0));
        vm.stopPrank();

        vm.startPrank(bob);
        nftB.mint(bob);
        nftB.approve(address(bundlepaymentobligation), 1);
        tokenB.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenB.decimals());

        address[] memory bobERC20Addresses = new address[](1);
        bobERC20Addresses[0] = address(tokenB);

        uint256[] memory bobERC20Amounts = new uint256[](1);
        bobERC20Amounts[0] = 1000 * 10 ** 18;

        address[] memory bobERC721Addresses = new address[](1);
        bobERC721Addresses[0] = address(nftB);

        uint256[] memory bobERC20Ids = new uint256[](1);
        bobERC20Ids[0] = 1;

        address[] memory bobDemandERC20Addresses = new address[](1);
        bobDemandERC20Addresses[0] = address(tokenA);

        uint256[] memory bobDemandERC20Amounts = new uint256[](1);
        bobDemandERC20Amounts[0] = 1000 * 10 ** 18;

        address[] memory bobDemandERC721Addresses = new address[](1);
        bobDemandERC721Addresses[0] = address(nftA);

        uint256[] memory bobDemandERC20Ids = new uint256[](1);
        bobDemandERC20Ids[0] = 1;

        BundlePaymentObligation.StatementData memory bobPaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: bobERC20Addresses,
            erc20Amounts: bobERC20Amounts,
            erc721Addresses: bobERC721Addresses,
            erc721Ids: bobERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: bobDemandERC20Addresses,
                    erc20Amounts: bobDemandERC20Amounts,
                    erc721Addresses: bobDemandERC721Addresses,
                    erc721Ids: bobDemandERC20Ids
                })
            )
        });

        bobPaymentUID =
            bundlepaymentobligation.makeStatement(bobPaymentData, uint64(block.timestamp + 1 days), alicePaymentUID);
        vm.stopPrank();
    }

    function testSingleERC20andERC721ForSingleERC20andERC721Trade() public {
        // Setup trade where Alice offers ERC20 and Bob offers ERC20
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupSingleERC721andERC20ForSingleERC721andERC20Trade();

        // Bob collects Alice's bundle payment
        vm.prank(bob);
        bool successBob = bundlepaymentobligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's bundle payment
        vm.prank(alice);
        bool successAlice = bundlepaymentobligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Assert final ownership
        assertEq(nftA.ownerOf(1), bob, "Bob should own NFT A");
        assertEq(tokenA.balanceOf(bob), 1000 * 10 ** tokenA.decimals(), "Bob should own 1000 Token A after the trade");
        assertEq(nftB.ownerOf(1), alice, "Alice should own NFT b");
        assertEq(
            tokenB.balanceOf(alice), 1000 * 10 ** tokenB.decimals(), "Alice should own 1000 Token B after the trade"
        );
    }

    function _setupMultipleERC721andERC20ForMultipleERC721andERC20Trade()
        internal
        returns (bytes32 alicePaymentUID, bytes32 bobPaymentUID)
    {
        vm.startPrank(alice);
        nftA.mint(alice);
        nftA.approve(address(bundlepaymentobligation), 1);
        nftA2.mint(alice);
        nftA2.approve(address(bundlepaymentobligation), 1);
        tokenA.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenA.decimals());
        tokenA2.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenA2.decimals());

        address[] memory aliceERC20Addresses = new address[](2);
        aliceERC20Addresses[0] = address(tokenA);
        aliceERC20Addresses[1] = address(tokenA2);

        uint256[] memory aliceERC20Amounts = new uint256[](2);
        aliceERC20Amounts[0] = 1000 * 10 ** 18;
        aliceERC20Amounts[1] = 1000 * 10 ** 18;

        address[] memory aliceERC721Addresses = new address[](2);
        aliceERC721Addresses[0] = address(nftA);
        aliceERC721Addresses[1] = address(nftA2);

        uint256[] memory aliceERC20Ids = new uint256[](2);
        aliceERC20Ids[0] = 1;
        aliceERC20Ids[1] = 1;

        address[] memory aliceDemandERC20Addresses = new address[](2);
        aliceDemandERC20Addresses[0] = address(tokenB);
        aliceDemandERC20Addresses[1] = address(tokenB2);

        uint256[] memory aliceDemandERC20Amounts = new uint256[](2);
        aliceDemandERC20Amounts[0] = 1000 * 10 ** 18;
        aliceDemandERC20Amounts[1] = 1000 * 10 ** 18;

        address[] memory aliceDemandERC721Addresses = new address[](2);
        aliceDemandERC721Addresses[0] = address(nftB);
        aliceDemandERC721Addresses[1] = address(nftB2);

        uint256[] memory aliceDemandERC20Ids = new uint256[](2);
        aliceDemandERC20Ids[0] = 1;
        aliceDemandERC20Ids[1] = 1;

        BundlePaymentObligation.StatementData memory alicePaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: aliceERC20Addresses,
            erc20Amounts: aliceERC20Amounts,
            erc721Addresses: aliceERC721Addresses,
            erc721Ids: aliceERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: aliceDemandERC20Addresses,
                    erc20Amounts: aliceDemandERC20Amounts,
                    erc721Addresses: aliceDemandERC721Addresses,
                    erc721Ids: aliceDemandERC20Ids
                })
            )
        });

        alicePaymentUID =
            bundlepaymentobligation.makeStatement(alicePaymentData, uint64(block.timestamp + 1 days), bytes32(0));
        vm.stopPrank();

        vm.startPrank(bob);
        nftB.mint(bob);
        nftB.approve(address(bundlepaymentobligation), 1);
        nftB2.mint(bob);
        nftB2.approve(address(bundlepaymentobligation), 1);
        tokenB.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenB.decimals());
        tokenB2.approve(address(bundlepaymentobligation), 1000 * 10 ** tokenB2.decimals());

        address[] memory bobERC20Addresses = new address[](2);
        bobERC20Addresses[0] = address(tokenB);
        bobERC20Addresses[1] = address(tokenB2);

        uint256[] memory bobERC20Amounts = new uint256[](2);
        bobERC20Amounts[0] = 1000 * 10 ** 18;
        bobERC20Amounts[1] = 1000 * 10 ** 18;

        address[] memory bobERC721Addresses = new address[](2);
        bobERC721Addresses[0] = address(nftB);
        bobERC721Addresses[1] = address(nftB2);

        uint256[] memory bobERC20Ids = new uint256[](2);
        bobERC20Ids[0] = 1;
        bobERC20Ids[1] = 1;

        address[] memory bobDemandERC20Addresses = new address[](2);
        bobDemandERC20Addresses[0] = address(tokenA);
        bobDemandERC20Addresses[1] = address(tokenA2);

        uint256[] memory bobDemandERC20Amounts = new uint256[](2);
        bobDemandERC20Amounts[0] = 1000 * 10 ** 18;
        bobDemandERC20Amounts[1] = 1000 * 10 ** 18;

        address[] memory bobDemandERC721Addresses = new address[](2);
        bobDemandERC721Addresses[0] = address(nftA);
        bobDemandERC721Addresses[1] = address(nftA2);

        uint256[] memory bobDemandERC20Ids = new uint256[](2);
        bobDemandERC20Ids[0] = 1;
        bobDemandERC20Ids[1] = 1;

        BundlePaymentObligation.StatementData memory bobPaymentData = BundlePaymentObligation.StatementData({
            erc20Addresses: bobERC20Addresses,
            erc20Amounts: bobERC20Amounts,
            erc721Addresses: bobERC721Addresses,
            erc721Ids: bobERC20Ids,
            arbiter: address(bundlepaymentfulfillmentarbiter),
            demand: abi.encode(
                BundlePaymentFulfillmentArbiter.DemandData({
                    erc20Addresses: bobDemandERC20Addresses,
                    erc20Amounts: bobDemandERC20Amounts,
                    erc721Addresses: bobDemandERC721Addresses,
                    erc721Ids: bobDemandERC20Ids
                })
            )
        });

        bobPaymentUID =
            bundlepaymentobligation.makeStatement(bobPaymentData, uint64(block.timestamp + 1 days), alicePaymentUID);
        vm.stopPrank();
    }

    function testMultipleERC20andERC721ForMultipleERC20andERC721Trade() public {
        // Setup trade where Alice offers ERC20 and Bob offers ERC20
        (bytes32 alicePaymentUID, bytes32 bobPaymentUID) = _setupMultipleERC721andERC20ForMultipleERC721andERC20Trade();

        // Bob collects Alice's bundle payment
        vm.prank(bob);
        bool successBob = bundlepaymentobligation.collectPayment(alicePaymentUID, bobPaymentUID);
        assertTrue(successBob, "Bob's payment collection should succeed");

        // Alice collects Bob's bundle payment
        vm.prank(alice);
        bool successAlice = bundlepaymentobligation.collectPayment(bobPaymentUID, alicePaymentUID);
        assertTrue(successAlice, "Alice's payment collection should succeed");

        // Assert final ownership
        assertEq(nftA.ownerOf(1), bob, "Bob should own NFT A");
        assertEq(nftA2.ownerOf(1), bob, "Bob should own NFT A2");
        assertEq(tokenA.balanceOf(bob), 1000 * 10 ** tokenA.decimals(), "Bob should own 1000 Token A after the trade");
        assertEq(
            tokenA2.balanceOf(bob), 1000 * 10 ** tokenA2.decimals(), "Bob should own 1000 Token A2 after the trade"
        );
        assertEq(nftB.ownerOf(1), alice, "Alice should own NFT B");
        assertEq(nftB2.ownerOf(1), alice, "Alice should own NFT B2");
        assertEq(
            tokenB.balanceOf(alice), 1000 * 10 ** tokenB.decimals(), "Alice should own 1000 Token B after the trade"
        );
        assertEq(
            tokenB.balanceOf(alice), 1000 * 10 ** tokenB2.decimals(), "Alice should own 1000 Token B2 after the trade"
        );
    }
}
