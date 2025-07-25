// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import {TokenBundlePaymentObligation2} from "../../../src/obligations/TokenBundlePaymentObligation2.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

// Mock tokens for testing
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MockERC721 is ERC721 {
    uint256 private _tokenIdCounter;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function mint(address to) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        return tokenId;
    }

    function mintSpecificId(address to, uint256 tokenId) external {
        _safeMint(to, tokenId);
    }
}

contract MockERC1155 is ERC1155 {
    constructor() ERC1155("") {}

    function mint(address to, uint256 id, uint256 amount) external {
        _mint(to, id, amount, "");
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) external {
        _mintBatch(to, ids, amounts, "");
    }
}

contract TokenBundlePaymentObligation2Test is Test {
    TokenBundlePaymentObligation2 public obligation;

    // Mock tokens
    MockERC20 public token1;
    MockERC20 public token2;
    MockERC721 public nft1;
    MockERC721 public nft2;
    MockERC1155 public multiToken;

    // Test addresses
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);
    address public payee = address(0x4);

    // Test values
    uint256 public constant NATIVE_AMOUNT = 1 ether;
    uint256 public constant TOKEN1_AMOUNT = 1000e18;
    uint256 public constant TOKEN2_AMOUNT = 500e18;
    uint256 public constant NFT1_ID = 1;
    uint256 public constant NFT2_ID = 2;
    uint256 public constant MULTI_TOKEN_ID_1 = 100;
    uint256 public constant MULTI_TOKEN_ID_2 = 200;
    uint256 public constant MULTI_TOKEN_AMOUNT_1 = 10;
    uint256 public constant MULTI_TOKEN_AMOUNT_2 = 20;

    // EAS and Schema Registry
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    function setUp() public {
        // Deploy EAS
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        // Deploy mock tokens
        token1 = new MockERC20("Token1", "TK1");
        token2 = new MockERC20("Token2", "TK2");
        nft1 = new MockERC721("NFT1", "NFT1");
        nft2 = new MockERC721("NFT2", "NFT2");
        multiToken = new MockERC1155();

        // Deploy obligation contract
        obligation = new TokenBundlePaymentObligation2(eas, schemaRegistry);

        // Setup test accounts
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(charlie, 10 ether);

        // Mint tokens to test accounts
        token1.mint(alice, TOKEN1_AMOUNT * 10);
        token1.mint(bob, TOKEN1_AMOUNT * 10);
        token2.mint(alice, TOKEN2_AMOUNT * 10);
        token2.mint(bob, TOKEN2_AMOUNT * 10);

        nft1.mintSpecificId(alice, NFT1_ID);
        nft1.mintSpecificId(bob, NFT1_ID + 10);
        nft2.mintSpecificId(alice, NFT2_ID);
        nft2.mintSpecificId(bob, NFT2_ID + 10);

        multiToken.mint(alice, MULTI_TOKEN_ID_1, MULTI_TOKEN_AMOUNT_1 * 10);
        multiToken.mint(alice, MULTI_TOKEN_ID_2, MULTI_TOKEN_AMOUNT_2 * 10);
        multiToken.mint(bob, MULTI_TOKEN_ID_1, MULTI_TOKEN_AMOUNT_1 * 10);
        multiToken.mint(bob, MULTI_TOKEN_ID_2, MULTI_TOKEN_AMOUNT_2 * 10);
    }

    function testConstructor() public {
        // We can't directly access eas and schemaRegistry as they are internal
        // but we can verify the contract was deployed successfully
        assertTrue(address(obligation) != address(0));

        // Verify the schema was registered by checking ATTESTATION_SCHEMA is set
        assertTrue(obligation.ATTESTATION_SCHEMA() != bytes32(0));
    }

    function testDoObligationWithNativeTokens() public {
        TokenBundlePaymentObligation2.ObligationData
            memory data = createNativeOnlyBundleData();

        uint256 payeeBalanceBefore = payee.balance;

        vm.startPrank(alice);

        obligation.doObligation{value: NATIVE_AMOUNT}(data);

        vm.stopPrank();

        // Verify native tokens were transferred
        assertEq(payee.balance, payeeBalanceBefore + NATIVE_AMOUNT);
    }

    function testDoObligationWithFullBundle() public {
        TokenBundlePaymentObligation2.ObligationData
            memory data = createFullBundleData();

        uint256 payeeBalanceBefore = payee.balance;

        vm.startPrank(alice);

        // Approve tokens
        token1.approve(address(obligation), TOKEN1_AMOUNT);
        token2.approve(address(obligation), TOKEN2_AMOUNT);
        nft1.approve(address(obligation), NFT1_ID);
        nft2.approve(address(obligation), NFT2_ID);
        multiToken.setApprovalForAll(address(obligation), true);

        obligation.doObligation{value: NATIVE_AMOUNT}(data);

        vm.stopPrank();

        // Verify all transfers
        assertEq(payee.balance, payeeBalanceBefore + NATIVE_AMOUNT);
        verifyTokensTransferredToPayee();
    }

    function testDoObligationForWithFullBundle() public {
        TokenBundlePaymentObligation2.ObligationData
            memory data = createFullBundleData();

        uint256 payeeBalanceBefore = payee.balance;

        // Alice approves tokens
        vm.startPrank(alice);
        token1.approve(address(obligation), TOKEN1_AMOUNT);
        token2.approve(address(obligation), TOKEN2_AMOUNT);
        nft1.approve(address(obligation), NFT1_ID);
        nft2.approve(address(obligation), NFT2_ID);
        multiToken.setApprovalForAll(address(obligation), true);
        vm.stopPrank();

        // Bob calls doObligationFor on behalf of Alice
        vm.startPrank(bob);

        obligation.doObligationFor{value: NATIVE_AMOUNT}(data, alice, charlie);

        vm.stopPrank();

        // Verify all transfers
        assertEq(payee.balance, payeeBalanceBefore + NATIVE_AMOUNT);
        verifyTokensTransferredToPayee();
    }

    function testExcessNativeTokenRefund() public {
        TokenBundlePaymentObligation2.ObligationData
            memory data = createNativeOnlyBundleData();

        uint256 excessAmount = 0.5 ether;
        uint256 totalSent = NATIVE_AMOUNT + excessAmount;

        uint256 aliceBalanceBefore = alice.balance;
        uint256 payeeBalanceBefore = payee.balance;

        vm.startPrank(alice);

        obligation.doObligation{value: totalSent}(data);

        vm.stopPrank();

        // Verify payee received exact amount and alice got refund
        assertEq(payee.balance, payeeBalanceBefore + NATIVE_AMOUNT);
        assertEq(alice.balance, aliceBalanceBefore - NATIVE_AMOUNT);
    }

    function testInsufficientNativeTokenPayment() public {
        TokenBundlePaymentObligation2.ObligationData
            memory data = createNativeOnlyBundleData();

        vm.startPrank(alice);

        vm.expectRevert(
            abi.encodeWithSelector(
                TokenBundlePaymentObligation2.InsufficientPayment.selector,
                NATIVE_AMOUNT,
                NATIVE_AMOUNT - 0.1 ether
            )
        );

        obligation.doObligation{value: NATIVE_AMOUNT - 0.1 ether}(data);

        vm.stopPrank();
    }

    function testNativeTokenTransferFailure() public {
        // Create a contract that rejects native token transfers
        RevertingReceiver revertingPayee = new RevertingReceiver();

        TokenBundlePaymentObligation2.ObligationData
            memory data = TokenBundlePaymentObligation2.ObligationData({
                nativeAmount: NATIVE_AMOUNT,
                erc20Tokens: new address[](0),
                erc20Amounts: new uint256[](0),
                erc721Tokens: new address[](0),
                erc721TokenIds: new uint256[](0),
                erc1155Tokens: new address[](0),
                erc1155TokenIds: new uint256[](0),
                erc1155Amounts: new uint256[](0),
                payee: address(revertingPayee)
            });

        vm.startPrank(alice);

        vm.expectRevert(
            abi.encodeWithSelector(
                TokenBundlePaymentObligation2
                    .NativeTokenTransferFailed
                    .selector,
                address(revertingPayee),
                NATIVE_AMOUNT
            )
        );

        obligation.doObligation{value: NATIVE_AMOUNT}(data);

        vm.stopPrank();
    }

    function testArrayLengthMismatchReverts() public {
        // ERC20 mismatch
        TokenBundlePaymentObligation2.ObligationData memory data1;
        data1.erc20Tokens = new address[](2);
        data1.erc20Amounts = new uint256[](1);
        data1.payee = payee;

        vm.startPrank(alice);
        vm.expectRevert(
            TokenBundlePaymentObligation2.ArrayLengthMismatch.selector
        );
        obligation.doObligation(data1);

        // ERC721 mismatch
        TokenBundlePaymentObligation2.ObligationData memory data2;
        data2.erc721Tokens = new address[](2);
        data2.erc721TokenIds = new uint256[](1);
        data2.payee = payee;

        vm.expectRevert(
            TokenBundlePaymentObligation2.ArrayLengthMismatch.selector
        );
        obligation.doObligation(data2);

        // ERC1155 mismatch
        TokenBundlePaymentObligation2.ObligationData memory data3;
        data3.erc1155Tokens = new address[](2);
        data3.erc1155TokenIds = new uint256[](2);
        data3.erc1155Amounts = new uint256[](1);
        data3.payee = payee;

        vm.expectRevert(
            TokenBundlePaymentObligation2.ArrayLengthMismatch.selector
        );
        obligation.doObligation(data3);

        vm.stopPrank();
    }

    function testCheckObligation() public {
        // Create payment data
        TokenBundlePaymentObligation2.ObligationData
            memory paymentData = createFullBundleData();

        // Create mock attestation
        Attestation memory attestation = Attestation({
            uid: bytes32(uint256(1)),
            schema: obligation.ATTESTATION_SCHEMA(),
            time: uint64(block.timestamp),
            expirationTime: 0,
            revocationTime: 0,
            refUID: bytes32(0),
            recipient: alice,
            attester: address(obligation),
            revocable: true,
            data: abi.encode(paymentData)
        });

        // Test exact match
        bytes memory demandBytes = abi.encode(paymentData);
        assertTrue(
            obligation.checkObligation(attestation, demandBytes, bytes32(0))
        );

        // Test with subset demands
        bytes memory subsetERC20 = abi.encode(createSubsetERC20Demand());
        assertTrue(
            obligation.checkObligation(attestation, subsetERC20, bytes32(0))
        );

        bytes memory subsetERC721 = abi.encode(createSubsetERC721Demand());
        assertTrue(
            obligation.checkObligation(attestation, subsetERC721, bytes32(0))
        );

        bytes memory subsetERC1155 = abi.encode(createSubsetERC1155Demand());
        assertTrue(
            obligation.checkObligation(attestation, subsetERC1155, bytes32(0))
        );

        // Test with lower native amount demand
        bytes memory lowerNative = abi.encode(createLowerNativeAmountDemand());
        assertTrue(
            obligation.checkObligation(attestation, lowerNative, bytes32(0))
        );

        // Test failures
        bytes memory higherNative = abi.encode(
            createHigherNativeAmountDemand()
        );
        assertFalse(
            obligation.checkObligation(attestation, higherNative, bytes32(0))
        );

        bytes memory moreERC20 = abi.encode(createMoreERC20Demand());
        assertFalse(
            obligation.checkObligation(attestation, moreERC20, bytes32(0))
        );

        bytes memory differentPayee = abi.encode(createDifferentPayeeDemand());
        assertFalse(
            obligation.checkObligation(attestation, differentPayee, bytes32(0))
        );
    }

    function testReceiveFunction() public {
        uint256 balanceBefore = address(obligation).balance;

        // Send native tokens directly to the contract
        vm.deal(alice, 10 ether);
        vm.prank(alice);
        (bool success, ) = address(obligation).call{value: 1 ether}("");

        assertTrue(success);
        assertEq(address(obligation).balance, balanceBefore + 1 ether);
    }

    // Helper functions to create test data
    function createFullBundleData()
        internal
        view
        returns (TokenBundlePaymentObligation2.ObligationData memory)
    {
        address[] memory erc20Tokens = new address[](2);
        erc20Tokens[0] = address(token1);
        erc20Tokens[1] = address(token2);

        uint256[] memory erc20Amounts = new uint256[](2);
        erc20Amounts[0] = TOKEN1_AMOUNT;
        erc20Amounts[1] = TOKEN2_AMOUNT;

        address[] memory erc721Tokens = new address[](2);
        erc721Tokens[0] = address(nft1);
        erc721Tokens[1] = address(nft2);

        uint256[] memory erc721TokenIds = new uint256[](2);
        erc721TokenIds[0] = NFT1_ID;
        erc721TokenIds[1] = NFT2_ID;

        address[] memory erc1155Tokens = new address[](2);
        erc1155Tokens[0] = address(multiToken);
        erc1155Tokens[1] = address(multiToken);

        uint256[] memory erc1155TokenIds = new uint256[](2);
        erc1155TokenIds[0] = MULTI_TOKEN_ID_1;
        erc1155TokenIds[1] = MULTI_TOKEN_ID_2;

        uint256[] memory erc1155Amounts = new uint256[](2);
        erc1155Amounts[0] = MULTI_TOKEN_AMOUNT_1;
        erc1155Amounts[1] = MULTI_TOKEN_AMOUNT_2;

        return
            TokenBundlePaymentObligation2.ObligationData({
                nativeAmount: NATIVE_AMOUNT,
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts,
                payee: payee
            });
    }

    function createNativeOnlyBundleData()
        internal
        view
        returns (TokenBundlePaymentObligation2.ObligationData memory)
    {
        return
            TokenBundlePaymentObligation2.ObligationData({
                nativeAmount: NATIVE_AMOUNT,
                erc20Tokens: new address[](0),
                erc20Amounts: new uint256[](0),
                erc721Tokens: new address[](0),
                erc721TokenIds: new uint256[](0),
                erc1155Tokens: new address[](0),
                erc1155TokenIds: new uint256[](0),
                erc1155Amounts: new uint256[](0),
                payee: payee
            });
    }

    function createSubsetERC20Demand()
        internal
        view
        returns (TokenBundlePaymentObligation2.ObligationData memory)
    {
        address[] memory erc20Tokens = new address[](1);
        erc20Tokens[0] = address(token1);

        uint256[] memory erc20Amounts = new uint256[](1);
        erc20Amounts[0] = TOKEN1_AMOUNT;

        return
            TokenBundlePaymentObligation2.ObligationData({
                nativeAmount: NATIVE_AMOUNT,
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: new address[](0),
                erc721TokenIds: new uint256[](0),
                erc1155Tokens: new address[](0),
                erc1155TokenIds: new uint256[](0),
                erc1155Amounts: new uint256[](0),
                payee: payee
            });
    }

    function createSubsetERC721Demand()
        internal
        view
        returns (TokenBundlePaymentObligation2.ObligationData memory)
    {
        address[] memory erc721Tokens = new address[](1);
        erc721Tokens[0] = address(nft1);

        uint256[] memory erc721TokenIds = new uint256[](1);
        erc721TokenIds[0] = NFT1_ID;

        return
            TokenBundlePaymentObligation2.ObligationData({
                nativeAmount: 0,
                erc20Tokens: new address[](0),
                erc20Amounts: new uint256[](0),
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: new address[](0),
                erc1155TokenIds: new uint256[](0),
                erc1155Amounts: new uint256[](0),
                payee: payee
            });
    }

    function createSubsetERC1155Demand()
        internal
        view
        returns (TokenBundlePaymentObligation2.ObligationData memory)
    {
        address[] memory erc1155Tokens = new address[](1);
        erc1155Tokens[0] = address(multiToken);

        uint256[] memory erc1155TokenIds = new uint256[](1);
        erc1155TokenIds[0] = MULTI_TOKEN_ID_1;

        uint256[] memory erc1155Amounts = new uint256[](1);
        erc1155Amounts[0] = MULTI_TOKEN_AMOUNT_1;

        return
            TokenBundlePaymentObligation2.ObligationData({
                nativeAmount: 0,
                erc20Tokens: new address[](0),
                erc20Amounts: new uint256[](0),
                erc721Tokens: new address[](0),
                erc721TokenIds: new uint256[](0),
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts,
                payee: payee
            });
    }

    function createLowerNativeAmountDemand()
        internal
        view
        returns (TokenBundlePaymentObligation2.ObligationData memory)
    {
        TokenBundlePaymentObligation2.ObligationData
            memory data = createFullBundleData();
        data.nativeAmount = NATIVE_AMOUNT / 2;
        return data;
    }

    function createHigherNativeAmountDemand()
        internal
        view
        returns (TokenBundlePaymentObligation2.ObligationData memory)
    {
        TokenBundlePaymentObligation2.ObligationData
            memory data = createFullBundleData();
        data.nativeAmount = NATIVE_AMOUNT * 2;
        return data;
    }

    function createMoreERC20Demand()
        internal
        view
        returns (TokenBundlePaymentObligation2.ObligationData memory)
    {
        address[] memory erc20Tokens = new address[](3);
        erc20Tokens[0] = address(token1);
        erc20Tokens[1] = address(token2);
        erc20Tokens[2] = address(token1); // Extra token

        uint256[] memory erc20Amounts = new uint256[](3);
        erc20Amounts[0] = TOKEN1_AMOUNT;
        erc20Amounts[1] = TOKEN2_AMOUNT;
        erc20Amounts[2] = TOKEN1_AMOUNT;

        return
            TokenBundlePaymentObligation2.ObligationData({
                nativeAmount: NATIVE_AMOUNT,
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: new address[](0),
                erc721TokenIds: new uint256[](0),
                erc1155Tokens: new address[](0),
                erc1155TokenIds: new uint256[](0),
                erc1155Amounts: new uint256[](0),
                payee: payee
            });
    }

    function createDifferentPayeeDemand()
        internal
        view
        returns (TokenBundlePaymentObligation2.ObligationData memory)
    {
        TokenBundlePaymentObligation2.ObligationData
            memory data = createFullBundleData();
        data.payee = charlie;
        return data;
    }

    function verifyTokensTransferredToPayee() internal {
        // Verify ERC20 transfers
        assertEq(token1.balanceOf(payee), TOKEN1_AMOUNT);
        assertEq(token2.balanceOf(payee), TOKEN2_AMOUNT);

        // Verify ERC721 transfers
        assertEq(nft1.ownerOf(NFT1_ID), payee);
        assertEq(nft2.ownerOf(NFT2_ID), payee);

        // Verify ERC1155 transfers
        assertEq(
            multiToken.balanceOf(payee, MULTI_TOKEN_ID_1),
            MULTI_TOKEN_AMOUNT_1
        );
        assertEq(
            multiToken.balanceOf(payee, MULTI_TOKEN_ID_2),
            MULTI_TOKEN_AMOUNT_2
        );
    }
}

// Helper contract that rejects native token transfers
contract RevertingReceiver {
    receive() external payable {
        revert("No native tokens accepted");
    }
}
