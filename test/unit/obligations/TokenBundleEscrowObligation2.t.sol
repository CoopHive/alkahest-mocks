// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import {TokenBundleEscrowObligation2} from "../../../src/obligations/TokenBundleEscrowObligation2.sol";
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

// Mock Arbiter contract
contract MockArbiter {
    mapping(bytes32 => bool) public approvedFulfillments;

    function approveFulfillment(bytes32 fulfillmentUid) external {
        approvedFulfillments[fulfillmentUid] = true;
    }

    function checkObligation(
        Attestation memory /* obligation */,
        bytes memory /* demand */,
        bytes32 /* counteroffer */
    ) external view returns (bool) {
        return true;
    }
}

contract TokenBundleEscrowObligation2Test is Test {
    TokenBundleEscrowObligation2 public escrow;
    MockArbiter public arbiter;

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

    // Test expiration times
    uint64 public constant EXPIRATION_TIME = 1 days;

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
        arbiter = new MockArbiter();

        // Deploy escrow contract
        escrow = new TokenBundleEscrowObligation2(eas, schemaRegistry);

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
        assertTrue(address(escrow) != address(0));

        // Verify the schema was registered by checking ATTESTATION_SCHEMA is set
        assertTrue(escrow.ATTESTATION_SCHEMA() != bytes32(0));
    }

    function testDoObligationWithNativeTokens() public {
        TokenBundleEscrowObligation2.ObligationData
            memory data = createNativeOnlyBundleData();

        uint256 escrowBalanceBefore = address(escrow).balance;

        vm.startPrank(alice);

        bytes32 escrowId = escrow.doObligation{value: NATIVE_AMOUNT}(
            data,
            uint64(block.timestamp + EXPIRATION_TIME)
        );

        vm.stopPrank();

        // Verify native tokens are in escrow
        assertEq(address(escrow).balance, escrowBalanceBefore + NATIVE_AMOUNT);
        assertTrue(escrowId != bytes32(0));
    }

    function testDoObligationWithFullBundle() public {
        TokenBundleEscrowObligation2.ObligationData
            memory data = createFullBundleData();

        uint256 escrowBalanceBefore = address(escrow).balance;

        vm.startPrank(alice);

        // Approve tokens
        token1.approve(address(escrow), TOKEN1_AMOUNT);
        token2.approve(address(escrow), TOKEN2_AMOUNT);
        nft1.approve(address(escrow), NFT1_ID);
        nft2.approve(address(escrow), NFT2_ID);
        multiToken.setApprovalForAll(address(escrow), true);

        bytes32 escrowId = escrow.doObligation{value: NATIVE_AMOUNT}(
            data,
            uint64(block.timestamp + EXPIRATION_TIME)
        );

        vm.stopPrank();

        // Verify all assets are in escrow
        assertEq(address(escrow).balance, escrowBalanceBefore + NATIVE_AMOUNT);
        verifyTokensInEscrow();
        assertTrue(escrowId != bytes32(0));
    }

    function testDoObligationForWithFullBundle() public {
        TokenBundleEscrowObligation2.ObligationData
            memory data = createFullBundleData();

        // Alice approves tokens
        vm.startPrank(alice);
        token1.approve(address(escrow), TOKEN1_AMOUNT);
        token2.approve(address(escrow), TOKEN2_AMOUNT);
        nft1.approve(address(escrow), NFT1_ID);
        nft2.approve(address(escrow), NFT2_ID);
        multiToken.setApprovalForAll(address(escrow), true);
        vm.stopPrank();

        // Bob creates escrow on behalf of Alice
        vm.startPrank(bob);

        bytes32 escrowId = escrow.doObligationFor{value: NATIVE_AMOUNT}(
            data,
            uint64(block.timestamp + EXPIRATION_TIME),
            alice,
            charlie
        );

        vm.stopPrank();

        // Verify all assets are in escrow
        verifyTokensInEscrow();
        assertTrue(escrowId != bytes32(0));
    }

    function testInsufficientNativeTokenPayment() public {
        TokenBundleEscrowObligation2.ObligationData
            memory data = createNativeOnlyBundleData();

        vm.startPrank(alice);

        vm.expectRevert(
            abi.encodeWithSelector(
                TokenBundleEscrowObligation2.InsufficientPayment.selector,
                NATIVE_AMOUNT,
                NATIVE_AMOUNT - 0.1 ether
            )
        );

        escrow.doObligation{value: NATIVE_AMOUNT - 0.1 ether}(
            data,
            uint64(block.timestamp + EXPIRATION_TIME)
        );

        vm.stopPrank();
    }

    function testArrayLengthMismatchReverts() public {
        // ERC20 mismatch
        TokenBundleEscrowObligation2.ObligationData memory data1;
        data1.arbiter = address(arbiter);
        data1.demand = "";
        data1.erc20Tokens = new address[](2);
        data1.erc20Amounts = new uint256[](1);

        vm.startPrank(alice);
        vm.expectRevert(
            TokenBundleEscrowObligation2.ArrayLengthMismatch.selector
        );
        escrow.doObligation(data1, uint64(block.timestamp + EXPIRATION_TIME));

        // ERC721 mismatch
        TokenBundleEscrowObligation2.ObligationData memory data2;
        data2.arbiter = address(arbiter);
        data2.demand = "";
        data2.erc721Tokens = new address[](2);
        data2.erc721TokenIds = new uint256[](1);

        vm.expectRevert(
            TokenBundleEscrowObligation2.ArrayLengthMismatch.selector
        );
        escrow.doObligation(data2, uint64(block.timestamp + EXPIRATION_TIME));

        // ERC1155 mismatch
        TokenBundleEscrowObligation2.ObligationData memory data3;
        data3.arbiter = address(arbiter);
        data3.demand = "";
        data3.erc1155Tokens = new address[](2);
        data3.erc1155TokenIds = new uint256[](2);
        data3.erc1155Amounts = new uint256[](1);

        vm.expectRevert(
            TokenBundleEscrowObligation2.ArrayLengthMismatch.selector
        );
        escrow.doObligation(data3, uint64(block.timestamp + EXPIRATION_TIME));

        vm.stopPrank();
    }

    function testCollectEscrow() public {
        // Create escrow
        TokenBundleEscrowObligation2.ObligationData
            memory data = createFullBundleData();

        vm.startPrank(alice);
        token1.approve(address(escrow), TOKEN1_AMOUNT);
        token2.approve(address(escrow), TOKEN2_AMOUNT);
        nft1.approve(address(escrow), NFT1_ID);
        nft2.approve(address(escrow), NFT2_ID);
        multiToken.setApprovalForAll(address(escrow), true);

        bytes32 escrowId = escrow.doObligation{value: NATIVE_AMOUNT}(
            data,
            uint64(block.timestamp + EXPIRATION_TIME)
        );
        vm.stopPrank();

        // Create and approve fulfillment
        bytes32 fulfillmentId = bytes32(uint256(2));
        arbiter.approveFulfillment(fulfillmentId);

        // Mock the fulfillment attestation
        Attestation memory fulfillmentAttestation = Attestation({
            uid: fulfillmentId,
            schema: bytes32(0),
            time: uint64(block.timestamp),
            expirationTime: 0,
            revocationTime: 0,
            refUID: escrowId,
            recipient: bob,
            attester: bob,
            revocable: true,
            data: ""
        });

        // Mock arbiter check
        vm.mockCall(
            address(arbiter),
            abi.encodeWithSelector(MockArbiter.checkObligation.selector),
            abi.encode(true)
        );

        // Mock EAS getAttestation for fulfillment
        vm.mockCall(
            address(eas),
            abi.encodeWithSelector(IEAS.getAttestation.selector, fulfillmentId),
            abi.encode(fulfillmentAttestation)
        );

        // Mock EAS getAttestation for escrow
        Attestation memory escrowAttestation = Attestation({
            uid: escrowId,
            schema: escrow.ATTESTATION_SCHEMA(),
            time: uint64(block.timestamp),
            expirationTime: uint64(block.timestamp + EXPIRATION_TIME),
            revocationTime: 0,
            refUID: bytes32(0),
            recipient: alice,
            attester: address(escrow),
            revocable: true,
            data: abi.encode(data)
        });

        vm.mockCall(
            address(eas),
            abi.encodeWithSelector(IEAS.getAttestation.selector, escrowId),
            abi.encode(escrowAttestation)
        );

        // Bob collects escrow
        uint256 bobBalanceBefore = bob.balance;
        vm.prank(bob);
        bool success = escrow.collectEscrow(escrowId, fulfillmentId);

        assertTrue(success);
        // Verify Bob received all assets
        assertEq(bob.balance, bobBalanceBefore + NATIVE_AMOUNT);
        assertEq(token1.balanceOf(bob), TOKEN1_AMOUNT * 10 + TOKEN1_AMOUNT);
        assertEq(token2.balanceOf(bob), TOKEN2_AMOUNT * 10 + TOKEN2_AMOUNT);
        assertEq(nft1.ownerOf(NFT1_ID), bob);
        assertEq(nft2.ownerOf(NFT2_ID), bob);
        assertEq(
            multiToken.balanceOf(bob, MULTI_TOKEN_ID_1),
            MULTI_TOKEN_AMOUNT_1 * 10 + MULTI_TOKEN_AMOUNT_1
        );
        assertEq(
            multiToken.balanceOf(bob, MULTI_TOKEN_ID_2),
            MULTI_TOKEN_AMOUNT_2 * 10 + MULTI_TOKEN_AMOUNT_2
        );
    }

    function testReclaimExpired() public {
        // Create escrow
        TokenBundleEscrowObligation2.ObligationData
            memory data = createFullBundleData();

        vm.startPrank(alice);
        token1.approve(address(escrow), TOKEN1_AMOUNT);
        token2.approve(address(escrow), TOKEN2_AMOUNT);
        nft1.approve(address(escrow), NFT1_ID);
        nft2.approve(address(escrow), NFT2_ID);
        multiToken.setApprovalForAll(address(escrow), true);

        bytes32 escrowId = escrow.doObligation{value: NATIVE_AMOUNT}(
            data,
            uint64(block.timestamp + EXPIRATION_TIME)
        );
        vm.stopPrank();

        // Mock EAS getAttestation for escrow
        Attestation memory escrowAttestation = Attestation({
            uid: escrowId,
            schema: escrow.ATTESTATION_SCHEMA(),
            time: uint64(block.timestamp),
            expirationTime: uint64(block.timestamp + EXPIRATION_TIME),
            revocationTime: 0,
            refUID: bytes32(0),
            recipient: alice,
            attester: address(escrow),
            revocable: true,
            data: abi.encode(data)
        });

        vm.mockCall(
            address(eas),
            abi.encodeWithSelector(IEAS.getAttestation.selector, escrowId),
            abi.encode(escrowAttestation)
        );

        // Move time past expiration
        vm.warp(block.timestamp + EXPIRATION_TIME + 1);

        // Alice reclaims expired escrow
        uint256 aliceBalanceBefore = alice.balance;
        uint256 aliceToken1Before = token1.balanceOf(alice);
        uint256 aliceToken2Before = token2.balanceOf(alice);

        vm.prank(alice);
        escrow.reclaimExpired(escrowId);

        // Verify Alice got everything back
        assertEq(alice.balance, aliceBalanceBefore + NATIVE_AMOUNT);
        assertEq(token1.balanceOf(alice), aliceToken1Before + TOKEN1_AMOUNT);
        assertEq(token2.balanceOf(alice), aliceToken2Before + TOKEN2_AMOUNT);
        assertEq(nft1.ownerOf(NFT1_ID), alice);
        assertEq(nft2.ownerOf(NFT2_ID), alice);
        assertEq(
            multiToken.balanceOf(alice, MULTI_TOKEN_ID_1),
            MULTI_TOKEN_AMOUNT_1 * 10
        );
        assertEq(
            multiToken.balanceOf(alice, MULTI_TOKEN_ID_2),
            MULTI_TOKEN_AMOUNT_2 * 10
        );
    }

    function testCheckObligation() public {
        // Create payment data
        TokenBundleEscrowObligation2.ObligationData
            memory paymentData = createFullBundleData();

        // Create mock attestation
        Attestation memory attestation = Attestation({
            uid: bytes32(uint256(1)),
            schema: escrow.ATTESTATION_SCHEMA(),
            time: uint64(block.timestamp),
            expirationTime: 0,
            revocationTime: 0,
            refUID: bytes32(0),
            recipient: alice,
            attester: address(escrow),
            revocable: true,
            data: abi.encode(paymentData)
        });

        // Test exact match
        bytes memory demandBytes = abi.encode(paymentData);
        assertTrue(
            escrow.checkObligation(attestation, demandBytes, bytes32(0))
        );

        // Test with subset demands
        bytes memory subsetERC20 = abi.encode(createSubsetERC20Demand());
        assertTrue(
            escrow.checkObligation(attestation, subsetERC20, bytes32(0))
        );

        bytes memory subsetERC721 = abi.encode(createSubsetERC721Demand());
        assertTrue(
            escrow.checkObligation(attestation, subsetERC721, bytes32(0))
        );

        bytes memory subsetERC1155 = abi.encode(createSubsetERC1155Demand());
        assertTrue(
            escrow.checkObligation(attestation, subsetERC1155, bytes32(0))
        );

        // Test with lower native amount demand
        bytes memory lowerNative = abi.encode(createLowerNativeAmountDemand());
        assertTrue(
            escrow.checkObligation(attestation, lowerNative, bytes32(0))
        );

        // Test failures
        bytes memory higherNative = abi.encode(
            createHigherNativeAmountDemand()
        );
        assertFalse(
            escrow.checkObligation(attestation, higherNative, bytes32(0))
        );

        bytes memory differentArbiter = abi.encode(
            createDifferentArbiterDemand()
        );
        assertFalse(
            escrow.checkObligation(attestation, differentArbiter, bytes32(0))
        );

        bytes memory differentDemandData = abi.encode(
            createDifferentDemandData()
        );
        assertFalse(
            escrow.checkObligation(attestation, differentDemandData, bytes32(0))
        );
    }

    function testReceiveFunction() public {
        uint256 balanceBefore = address(escrow).balance;

        // Send native tokens directly to the contract
        vm.deal(alice, 10 ether);
        vm.prank(alice);
        (bool success, ) = address(escrow).call{value: 1 ether}("");

        assertTrue(success);
        assertEq(address(escrow).balance, balanceBefore + 1 ether);
    }

    // Helper functions to create test data
    function createFullBundleData()
        internal
        view
        returns (TokenBundleEscrowObligation2.ObligationData memory)
    {
        bytes memory demandData = abi.encode("test demand");

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
            TokenBundleEscrowObligation2.ObligationData({
                arbiter: address(arbiter),
                demand: demandData,
                nativeAmount: NATIVE_AMOUNT,
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts
            });
    }

    function createNativeOnlyBundleData()
        internal
        view
        returns (TokenBundleEscrowObligation2.ObligationData memory)
    {
        bytes memory demandData = abi.encode("test demand");

        return
            TokenBundleEscrowObligation2.ObligationData({
                arbiter: address(arbiter),
                demand: demandData,
                nativeAmount: NATIVE_AMOUNT,
                erc20Tokens: new address[](0),
                erc20Amounts: new uint256[](0),
                erc721Tokens: new address[](0),
                erc721TokenIds: new uint256[](0),
                erc1155Tokens: new address[](0),
                erc1155TokenIds: new uint256[](0),
                erc1155Amounts: new uint256[](0)
            });
    }

    function createSubsetERC20Demand()
        internal
        view
        returns (TokenBundleEscrowObligation2.ObligationData memory)
    {
        bytes memory demandData = abi.encode("test demand");

        address[] memory erc20Tokens = new address[](1);
        erc20Tokens[0] = address(token1);

        uint256[] memory erc20Amounts = new uint256[](1);
        erc20Amounts[0] = TOKEN1_AMOUNT;

        return
            TokenBundleEscrowObligation2.ObligationData({
                arbiter: address(arbiter),
                demand: demandData,
                nativeAmount: NATIVE_AMOUNT,
                erc20Tokens: erc20Tokens,
                erc20Amounts: erc20Amounts,
                erc721Tokens: new address[](0),
                erc721TokenIds: new uint256[](0),
                erc1155Tokens: new address[](0),
                erc1155TokenIds: new uint256[](0),
                erc1155Amounts: new uint256[](0)
            });
    }

    function createSubsetERC721Demand()
        internal
        view
        returns (TokenBundleEscrowObligation2.ObligationData memory)
    {
        bytes memory demandData = abi.encode("test demand");

        address[] memory erc721Tokens = new address[](1);
        erc721Tokens[0] = address(nft1);

        uint256[] memory erc721TokenIds = new uint256[](1);
        erc721TokenIds[0] = NFT1_ID;

        return
            TokenBundleEscrowObligation2.ObligationData({
                arbiter: address(arbiter),
                demand: demandData,
                nativeAmount: 0,
                erc20Tokens: new address[](0),
                erc20Amounts: new uint256[](0),
                erc721Tokens: erc721Tokens,
                erc721TokenIds: erc721TokenIds,
                erc1155Tokens: new address[](0),
                erc1155TokenIds: new uint256[](0),
                erc1155Amounts: new uint256[](0)
            });
    }

    function createSubsetERC1155Demand()
        internal
        view
        returns (TokenBundleEscrowObligation2.ObligationData memory)
    {
        bytes memory demandData = abi.encode("test demand");

        address[] memory erc1155Tokens = new address[](1);
        erc1155Tokens[0] = address(multiToken);

        uint256[] memory erc1155TokenIds = new uint256[](1);
        erc1155TokenIds[0] = MULTI_TOKEN_ID_1;

        uint256[] memory erc1155Amounts = new uint256[](1);
        erc1155Amounts[0] = MULTI_TOKEN_AMOUNT_1;

        return
            TokenBundleEscrowObligation2.ObligationData({
                arbiter: address(arbiter),
                demand: demandData,
                nativeAmount: 0,
                erc20Tokens: new address[](0),
                erc20Amounts: new uint256[](0),
                erc721Tokens: new address[](0),
                erc721TokenIds: new uint256[](0),
                erc1155Tokens: erc1155Tokens,
                erc1155TokenIds: erc1155TokenIds,
                erc1155Amounts: erc1155Amounts
            });
    }

    function createLowerNativeAmountDemand()
        internal
        view
        returns (TokenBundleEscrowObligation2.ObligationData memory)
    {
        TokenBundleEscrowObligation2.ObligationData
            memory data = createFullBundleData();
        data.nativeAmount = NATIVE_AMOUNT / 2;
        return data;
    }

    function createHigherNativeAmountDemand()
        internal
        view
        returns (TokenBundleEscrowObligation2.ObligationData memory)
    {
        TokenBundleEscrowObligation2.ObligationData
            memory data = createFullBundleData();
        data.nativeAmount = NATIVE_AMOUNT * 2;
        return data;
    }

    function createDifferentArbiterDemand()
        internal
        view
        returns (TokenBundleEscrowObligation2.ObligationData memory)
    {
        TokenBundleEscrowObligation2.ObligationData
            memory data = createFullBundleData();
        data.arbiter = address(0x9999); // Different arbiter
        return data;
    }

    function createDifferentDemandData()
        internal
        view
        returns (TokenBundleEscrowObligation2.ObligationData memory)
    {
        TokenBundleEscrowObligation2.ObligationData
            memory data = createFullBundleData();
        data.demand = abi.encode("different demand data");
        return data;
    }

    function verifyTokensInEscrow() internal {
        // Verify ERC20 transfers
        assertEq(token1.balanceOf(address(escrow)), TOKEN1_AMOUNT);
        assertEq(token2.balanceOf(address(escrow)), TOKEN2_AMOUNT);

        // Verify ERC721 transfers
        assertEq(nft1.ownerOf(NFT1_ID), address(escrow));
        assertEq(nft2.ownerOf(NFT2_ID), address(escrow));

        // Verify ERC1155 transfers
        assertEq(
            multiToken.balanceOf(address(escrow), MULTI_TOKEN_ID_1),
            MULTI_TOKEN_AMOUNT_1
        );
        assertEq(
            multiToken.balanceOf(address(escrow), MULTI_TOKEN_ID_2),
            MULTI_TOKEN_AMOUNT_2
        );
    }
}
