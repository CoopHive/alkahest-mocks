// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";
import {NativeTokenBarterUtils} from "../../../src/utils/NativeTokenBarterUtils.sol";
import {NativeTokenEscrowObligation} from "../../../src/obligations/NativeTokenEscrowObligation.sol";
import {NativeTokenPaymentObligation} from "../../../src/obligations/NativeTokenPaymentObligation.sol";
import {ERC20EscrowObligation} from "../../../src/obligations/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "../../../src/obligations/ERC20PaymentObligation.sol";
import {ERC721EscrowObligation} from "../../../src/obligations/ERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "../../../src/obligations/ERC721PaymentObligation.sol";
import {ERC1155EscrowObligation} from "../../../src/obligations/ERC1155EscrowObligation.sol";
import {ERC1155PaymentObligation} from "../../../src/obligations/ERC1155PaymentObligation.sol";
import {TokenBundleEscrowObligation2} from "../../../src/obligations/TokenBundleEscrowObligation2.sol";
import {TokenBundlePaymentObligation2} from "../../../src/obligations/TokenBundlePaymentObligation2.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {EASDeployer} from "../../utils/EASDeployer.sol";

// Mock token contracts
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract MockERC721 is ERC721 {
    uint256 private _currentTokenId = 0;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function mint(address to) public returns (uint256) {
        _currentTokenId++;
        _mint(to, _currentTokenId);
        return _currentTokenId;
    }
}

contract MockERC1155 is ERC1155 {
    constructor(string memory uri) ERC1155(uri) {}

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public {
        _mint(to, id, amount, data);
    }
}

contract NativeTokenBarterUtilsTest is Test {
    NativeTokenBarterUtils public barterUtils;

    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    NativeTokenEscrowObligation public nativeEscrow;
    NativeTokenPaymentObligation public nativePayment;
    ERC20EscrowObligation public erc20Escrow;
    ERC20PaymentObligation public erc20Payment;
    ERC721EscrowObligation public erc721Escrow;
    ERC721PaymentObligation public erc721Payment;
    ERC1155EscrowObligation public erc1155Escrow;
    ERC1155PaymentObligation public erc1155Payment;
    TokenBundleEscrowObligation2 public bundleEscrow;
    TokenBundlePaymentObligation2 public bundlePayment;

    MockERC20 public testERC20;
    MockERC721 public testERC721;
    MockERC1155 public testERC1155;

    address public alice = address(0x1);
    address public bob = address(0x2);

    uint256 constant BID_AMOUNT = 1 ether;
    uint256 constant ASK_AMOUNT = 0.5 ether;
    uint64 constant EXPIRATION = 3600;

    function setUp() public {
        // Deploy EAS and SchemaRegistry
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        // Deploy obligation contracts
        nativeEscrow = new NativeTokenEscrowObligation(eas, schemaRegistry);
        nativePayment = new NativeTokenPaymentObligation(eas, schemaRegistry);
        erc20Escrow = new ERC20EscrowObligation(eas, schemaRegistry);
        erc20Payment = new ERC20PaymentObligation(eas, schemaRegistry);
        erc721Escrow = new ERC721EscrowObligation(eas, schemaRegistry);
        erc721Payment = new ERC721PaymentObligation(eas, schemaRegistry);
        erc1155Escrow = new ERC1155EscrowObligation(eas, schemaRegistry);
        erc1155Payment = new ERC1155PaymentObligation(eas, schemaRegistry);
        bundleEscrow = new TokenBundleEscrowObligation2(eas, schemaRegistry);
        bundlePayment = new TokenBundlePaymentObligation2(eas, schemaRegistry);

        // Deploy barter utils
        barterUtils = new NativeTokenBarterUtils(
            eas,
            erc20Escrow,
            erc20Payment,
            erc721Escrow,
            erc721Payment,
            erc1155Escrow,
            erc1155Payment,
            bundleEscrow,
            bundlePayment,
            nativeEscrow,
            nativePayment
        );

        // Deploy test tokens
        testERC20 = new MockERC20("Test Token", "TEST");
        testERC721 = new MockERC721("Test NFT", "NFT");
        testERC1155 = new MockERC1155("https://test.uri/");

        // Fund test accounts
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);

        // Mint test tokens
        testERC20.mint(alice, 1000 * 10 ** 18);
        testERC20.mint(bob, 1000 * 10 ** 18);
        testERC721.mint(alice);
        testERC721.mint(bob);
        testERC1155.mint(alice, 1, 100, "");
        testERC1155.mint(bob, 2, 100, "");
    }

    // ============ Native Token to Native Token Tests ============

    function testBuyEthForEth() public {
        vm.startPrank(alice);

        bytes32 buyAttestation = barterUtils.buyEthForEth{value: BID_AMOUNT}(
            BID_AMOUNT,
            ASK_AMOUNT,
            EXPIRATION
        );

        assertEq(address(nativeEscrow).balance, BID_AMOUNT);
        assertTrue(buyAttestation != bytes32(0));

        vm.stopPrank();
    }

    function testPayEthForEth() public {
        // Alice creates buy order
        vm.startPrank(alice);
        bytes32 buyAttestation = barterUtils.buyEthForEth{value: BID_AMOUNT}(
            BID_AMOUNT,
            ASK_AMOUNT,
            EXPIRATION
        );
        vm.stopPrank();

        uint256 aliceBalanceBefore = alice.balance;
        uint256 bobBalanceBefore = bob.balance;

        // Bob fulfills the order
        vm.startPrank(bob);
        bytes32 sellAttestation = barterUtils.payEthForEth{value: ASK_AMOUNT}(
            buyAttestation
        );
        vm.stopPrank();

        assertTrue(sellAttestation != bytes32(0));
        assertEq(alice.balance, aliceBalanceBefore + ASK_AMOUNT);
        assertEq(bob.balance, bobBalanceBefore - ASK_AMOUNT + BID_AMOUNT);
    }

    // ============ Native Token to ERC20 Tests ============

    function testBuyErc20WithEth() public {
        vm.startPrank(alice);

        bytes32 buyAttestation = barterUtils.buyErc20WithEth{value: BID_AMOUNT}(
            BID_AMOUNT,
            address(testERC20),
            100 * 10 ** 18,
            EXPIRATION
        );

        assertEq(address(nativeEscrow).balance, BID_AMOUNT);
        assertTrue(buyAttestation != bytes32(0));

        vm.stopPrank();
    }

    function testPayEthForErc20() public {
        // Bob creates buy order for ERC20, offering ERC20 and asking for ETH
        vm.startPrank(bob);
        testERC20.approve(address(erc20Escrow), 100 * 10 ** 18);
        bytes32 buyAttestation = erc20Escrow.doObligationFor(
            ERC20EscrowObligation.ObligationData({
                token: address(testERC20),
                amount: 100 * 10 ** 18,
                arbiter: address(nativePayment),
                demand: abi.encode(
                    NativeTokenPaymentObligation.ObligationData({
                        amount: BID_AMOUNT,
                        payee: bob
                    })
                )
            }),
            EXPIRATION,
            bob,
            bob
        );
        vm.stopPrank();

        uint256 aliceBalanceBefore = alice.balance;
        uint256 bobBalanceBefore = bob.balance;
        uint256 aliceTokensBefore = testERC20.balanceOf(alice);

        // Alice fulfills the order with ETH
        vm.startPrank(alice);
        bytes32 sellAttestation = barterUtils.payEthForErc20{value: BID_AMOUNT}(
            buyAttestation
        );
        vm.stopPrank();

        assertTrue(sellAttestation != bytes32(0));
        assertEq(alice.balance, aliceBalanceBefore - BID_AMOUNT);
        assertEq(bob.balance, bobBalanceBefore + BID_AMOUNT);
        assertEq(
            testERC20.balanceOf(alice),
            aliceTokensBefore + 100 * 10 ** 18
        );
    }

    // ============ Native Token to ERC721 Tests ============

    function testBuyErc721WithEth() public {
        vm.startPrank(alice);

        bytes32 buyAttestation = barterUtils.buyErc721WithEth{
            value: BID_AMOUNT
        }(
            BID_AMOUNT,
            address(testERC721),
            2, // Bob's NFT
            EXPIRATION
        );

        assertEq(address(nativeEscrow).balance, BID_AMOUNT);
        assertTrue(buyAttestation != bytes32(0));

        vm.stopPrank();
    }

    function testPayEthForErc721() public {
        // Bob creates buy order for ERC721, offering ERC721 and asking for ETH
        vm.startPrank(bob);
        testERC721.approve(address(erc721Escrow), 2);
        bytes32 buyAttestation = erc721Escrow.doObligationFor(
            ERC721EscrowObligation.ObligationData({
                token: address(testERC721),
                tokenId: 2,
                arbiter: address(nativePayment),
                demand: abi.encode(
                    NativeTokenPaymentObligation.ObligationData({
                        amount: BID_AMOUNT,
                        payee: bob
                    })
                )
            }),
            EXPIRATION,
            bob,
            bob
        );
        vm.stopPrank();

        uint256 aliceBalanceBefore = alice.balance;
        uint256 bobBalanceBefore = bob.balance;

        // Alice fulfills the order with ETH
        vm.startPrank(alice);
        bytes32 sellAttestation = barterUtils.payEthForErc721{
            value: BID_AMOUNT
        }(buyAttestation);
        vm.stopPrank();

        assertTrue(sellAttestation != bytes32(0));
        assertEq(alice.balance, aliceBalanceBefore - BID_AMOUNT);
        assertEq(bob.balance, bobBalanceBefore + BID_AMOUNT);
        assertEq(testERC721.ownerOf(2), alice);
    }

    // ============ Native Token to ERC1155 Tests ============

    function testBuyErc1155WithEth() public {
        vm.startPrank(alice);

        bytes32 buyAttestation = barterUtils.buyErc1155WithEth{
            value: BID_AMOUNT
        }(
            BID_AMOUNT,
            address(testERC1155),
            2, // Bob's token ID
            50, // amount
            EXPIRATION
        );

        assertEq(address(nativeEscrow).balance, BID_AMOUNT);
        assertTrue(buyAttestation != bytes32(0));

        vm.stopPrank();
    }

    function testPayEthForErc1155() public {
        // Bob creates buy order for ERC1155, offering ERC1155 and asking for ETH
        vm.startPrank(bob);
        testERC1155.setApprovalForAll(address(erc1155Escrow), true);
        bytes32 buyAttestation = erc1155Escrow.doObligationFor(
            ERC1155EscrowObligation.ObligationData({
                token: address(testERC1155),
                tokenId: 2,
                amount: 50,
                arbiter: address(nativePayment),
                demand: abi.encode(
                    NativeTokenPaymentObligation.ObligationData({
                        amount: BID_AMOUNT,
                        payee: bob
                    })
                )
            }),
            EXPIRATION,
            bob,
            bob
        );
        vm.stopPrank();

        uint256 aliceBalanceBefore = alice.balance;
        uint256 bobBalanceBefore = bob.balance;
        uint256 aliceTokensBefore = testERC1155.balanceOf(alice, 2);

        // Alice fulfills the order with ETH
        vm.startPrank(alice);
        bytes32 sellAttestation = barterUtils.payEthForErc1155{
            value: BID_AMOUNT
        }(buyAttestation);
        vm.stopPrank();

        assertTrue(sellAttestation != bytes32(0));
        assertEq(alice.balance, aliceBalanceBefore - BID_AMOUNT);
        assertEq(bob.balance, bobBalanceBefore + BID_AMOUNT);
        assertEq(testERC1155.balanceOf(alice, 2), aliceTokensBefore + 50);
    }

    // ============ Native Token to Token Bundle Tests ============

    function testBuyBundleWithEth() public {
        vm.startPrank(alice);

        // Create bundle data
        address[] memory erc20Tokens = new address[](0);
        uint256[] memory erc20Amounts = new uint256[](0);
        address[] memory erc721Tokens = new address[](1);
        uint256[] memory erc721TokenIds = new uint256[](1);
        address[] memory erc1155Tokens = new address[](0);
        uint256[] memory erc1155TokenIds = new uint256[](0);
        uint256[] memory erc1155Amounts = new uint256[](0);

        erc721Tokens[0] = address(testERC721);
        erc721TokenIds[0] = 2;

        TokenBundlePaymentObligation2.ObligationData
            memory bundleData = TokenBundlePaymentObligation2.ObligationData({
                nativeAmount: 0,
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts,
                payee: alice
            });

        bytes32 buyAttestation = barterUtils.buyBundleWithEth{
            value: BID_AMOUNT
        }(BID_AMOUNT, bundleData, EXPIRATION);

        assertEq(address(nativeEscrow).balance, BID_AMOUNT);
        assertTrue(buyAttestation != bytes32(0));

        vm.stopPrank();
    }

    function testPayEthForBundle() public {
        // Bob creates buy order for bundle, offering bundle and asking for ETH
        vm.startPrank(bob);

        // Approve tokens for bundle
        testERC721.approve(address(bundleEscrow), 2);

        // Create bundle data
        address[] memory erc20Tokens = new address[](0);
        uint256[] memory erc20Amounts = new uint256[](0);
        address[] memory erc721Tokens = new address[](1);
        uint256[] memory erc721TokenIds = new uint256[](1);
        address[] memory erc1155Tokens = new address[](0);
        uint256[] memory erc1155TokenIds = new uint256[](0);
        uint256[] memory erc1155Amounts = new uint256[](0);

        erc721Tokens[0] = address(testERC721);
        erc721TokenIds[0] = 2;

        TokenBundleEscrowObligation2.ObligationData
            memory bundleData = TokenBundleEscrowObligation2.ObligationData({
                nativeAmount: 0,
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts,
                arbiter: address(nativePayment),
                demand: abi.encode(
                    NativeTokenPaymentObligation.ObligationData({
                        amount: BID_AMOUNT,
                        payee: bob
                    })
                )
            });

        bytes32 buyAttestation = bundleEscrow.doObligationFor(
            bundleData,
            EXPIRATION,
            bob,
            bob
        );
        vm.stopPrank();

        uint256 aliceBalanceBefore = alice.balance;
        uint256 bobBalanceBefore = bob.balance;

        // Alice fulfills the order with ETH
        vm.startPrank(alice);
        bytes32 sellAttestation = barterUtils.payEthForBundle{
            value: BID_AMOUNT
        }(buyAttestation);
        vm.stopPrank();

        assertTrue(sellAttestation != bytes32(0));
        assertEq(alice.balance, aliceBalanceBefore - BID_AMOUNT);
        assertEq(bob.balance, bobBalanceBefore + BID_AMOUNT);
        assertEq(testERC721.ownerOf(2), alice);
    }

    // ============ Utility Tests ============

    function testReceiveFunction() public {
        uint256 balanceBefore = address(barterUtils).balance;

        vm.prank(alice);
        (bool success, ) = address(barterUtils).call{value: 1 ether}("");

        assertTrue(success);
        assertEq(address(barterUtils).balance, balanceBefore + 1 ether);
    }
}
