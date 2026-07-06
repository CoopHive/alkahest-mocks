// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {BaseSplitter} from "@src/utils/splitters/default/BaseSplitter.sol";
import {TokenBundleSplitter} from "@src/utils/splitters/default/TokenBundleSplitter.sol";
import {TokenBundleSplitterBase} from "@src/utils/splitters/default/TokenBundleSplitterBase.sol";
import {TokenBundleEscrowObligation} from "@src/obligations/escrow/default/TokenBundleEscrowObligation.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {IEAS, Attestation} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract MockERC20T is ERC20 {
    constructor() ERC20("Mock Token", "MCK") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract MockERC721T is ERC721 {
    constructor() ERC721("Mock NFT", "MNFT") {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }
}

contract MockERC1155T is ERC1155 {
    constructor() ERC1155("https://example.com/{id}.json") {}

    function mint(address to, uint256 id, uint256 amount) public {
        _mint(to, id, amount, "");
    }
}

contract TokenBundleSplitterTest is Test {
    TokenBundleSplitter public splitter;
    TokenBundleEscrowObligation public escrowObligation;
    StringObligation public stringObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    MockERC20T public token1;
    MockERC20T public token2;
    MockERC721T public nft;
    MockERC1155T public multiToken;

    address buyer = makeAddr("buyer");
    address oracle = makeAddr("oracle");
    address executor = makeAddr("executor");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address carol = makeAddr("carol");

    uint256 constant NATIVE_AMOUNT = 1 ether;
    uint256 constant TOKEN1_AMOUNT = 100e18;
    uint256 constant TOKEN2_AMOUNT = 50e18;
    uint256 constant NFT_ID_1 = 1;
    uint256 constant NFT_ID_2 = 2;
    uint256 constant MULTI_ID = 10;
    uint256 constant MULTI_AMOUNT = 100;
    uint64 constant EXPIRATION = 365 days;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();
        escrowObligation = new TokenBundleEscrowObligation(eas, schemaRegistry);
        splitter = new TokenBundleSplitter(eas, escrowObligation);
        stringObligation = new StringObligation(eas, schemaRegistry);
        token1 = new MockERC20T();
        token2 = new MockERC20T();
        nft = new MockERC721T();
        multiToken = new MockERC1155T();
        token1.mint(buyer, TOKEN1_AMOUNT * 10);
        token2.mint(buyer, TOKEN2_AMOUNT * 10);
        nft.mint(buyer, NFT_ID_1);
        nft.mint(buyer, NFT_ID_2);
        multiToken.mint(buyer, MULTI_ID, MULTI_AMOUNT * 10);
        vm.deal(buyer, 10 ether);
        vm.deal(executor, 1 ether);
        vm.startPrank(buyer);
        token1.approve(address(escrowObligation), type(uint256).max);
        token2.approve(address(escrowObligation), type(uint256).max);
        nft.setApprovalForAll(address(escrowObligation), true);
        multiToken.setApprovalForAll(address(escrowObligation), true);
        vm.stopPrank();
    }

    function _bundleData() internal view returns (TokenBundleEscrowObligation.ObligationData memory) {
        bytes memory demand = abi.encode(TokenBundleSplitterBase.DemandData({oracle: oracle, data: bytes("")}));
        address[] memory erc20Tokens = new address[](2);
        erc20Tokens[0] = address(token1);
        erc20Tokens[1] = address(token2);
        uint256[] memory erc20Amounts = new uint256[](2);
        erc20Amounts[0] = TOKEN1_AMOUNT;
        erc20Amounts[1] = TOKEN2_AMOUNT;
        address[] memory erc721Tokens = new address[](2);
        erc721Tokens[0] = address(nft);
        erc721Tokens[1] = address(nft);
        uint256[] memory erc721TokenIds = new uint256[](2);
        erc721TokenIds[0] = NFT_ID_1;
        erc721TokenIds[1] = NFT_ID_2;
        address[] memory erc1155Tokens = new address[](1);
        erc1155Tokens[0] = address(multiToken);
        uint256[] memory erc1155TokenIds = new uint256[](1);
        erc1155TokenIds[0] = MULTI_ID;
        uint256[] memory erc1155Amounts = new uint256[](1);
        erc1155Amounts[0] = MULTI_AMOUNT;
        return TokenBundleEscrowObligation.ObligationData({
            arbiter: address(splitter),
            demand: demand,
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

    function _bundleDataWithoutERC721() internal view returns (TokenBundleEscrowObligation.ObligationData memory) {
        TokenBundleEscrowObligation.ObligationData memory data = _bundleData();
        data.erc721Tokens = new address[](0);
        data.erc721TokenIds = new uint256[](0);
        return data;
    }

    function _bundleDataWithDuplicateERC20() internal view returns (TokenBundleEscrowObligation.ObligationData memory) {
        TokenBundleEscrowObligation.ObligationData memory data = _bundleDataWithoutERC721();
        data.nativeAmount = 0;

        address[] memory erc20Tokens = new address[](2);
        erc20Tokens[0] = address(token1);
        erc20Tokens[1] = address(token1);
        uint256[] memory erc20Amounts = new uint256[](2);
        erc20Amounts[0] = 60e18;
        erc20Amounts[1] = 40e18;

        data.erc20Tokens = erc20Tokens;
        data.erc20Amounts = erc20Amounts;
        data.erc1155Tokens = new address[](0);
        data.erc1155TokenIds = new uint256[](0);
        data.erc1155Amounts = new uint256[](0);
        return data;
    }

    function _bundleDataWithDuplicateERC1155()
        internal
        view
        returns (TokenBundleEscrowObligation.ObligationData memory)
    {
        TokenBundleEscrowObligation.ObligationData memory data = _bundleDataWithoutERC721();
        data.nativeAmount = 0;

        data.erc20Tokens = new address[](0);
        data.erc20Amounts = new uint256[](0);
        address[] memory erc1155Tokens = new address[](2);
        erc1155Tokens[0] = address(multiToken);
        erc1155Tokens[1] = address(multiToken);
        uint256[] memory erc1155TokenIds = new uint256[](2);
        erc1155TokenIds[0] = MULTI_ID;
        erc1155TokenIds[1] = MULTI_ID;
        uint256[] memory erc1155Amounts = new uint256[](2);
        erc1155Amounts[0] = 60;
        erc1155Amounts[1] = 40;

        data.erc1155Tokens = erc1155Tokens;
        data.erc1155TokenIds = erc1155TokenIds;
        data.erc1155Amounts = erc1155Amounts;
        return data;
    }

    function _createEscrow() internal returns (bytes32) {
        vm.prank(buyer);
        return escrowObligation.doObligation{value: NATIVE_AMOUNT}(_bundleData(), uint64(block.timestamp + EXPIRATION));
    }

    function _createEscrowWithoutERC721() internal returns (bytes32) {
        vm.prank(buyer);
        return escrowObligation.doObligation{value: NATIVE_AMOUNT}(
            _bundleDataWithoutERC721(), uint64(block.timestamp + EXPIRATION)
        );
    }

    function _createDuplicateERC20Escrow() internal returns (bytes32) {
        vm.prank(buyer);
        return escrowObligation.doObligation(_bundleDataWithDuplicateERC20(), uint64(block.timestamp + EXPIRATION));
    }

    function _createDuplicateERC1155Escrow() internal returns (bytes32) {
        vm.prank(buyer);
        return escrowObligation.doObligation(_bundleDataWithDuplicateERC1155(), uint64(block.timestamp + EXPIRATION));
    }

    function _createFulfillmentViaSplitter(address _executor, bytes32 escrowUid) internal returns (bytes32) {
        bytes memory obligationData =
            abi.encode(StringObligation.ObligationData({item: "fulfillment", schema: bytes32(0)}));
        vm.prank(_executor);
        return splitter.createFulfillment(address(stringObligation), obligationData, 0, escrowUid);
    }

    function _twoWaySplit() internal view returns (TokenBundleSplitterBase.BundleSplit[] memory) {
        TokenBundleSplitterBase.BundleSplit[] memory splits = new TokenBundleSplitterBase.BundleSplit[](2);
        uint256[] memory aliceErc20 = new uint256[](2);
        aliceErc20[0] = 60e18;
        aliceErc20[1] = 20e18;
        uint256[] memory aliceErc721 = new uint256[](1);
        aliceErc721[0] = 0;
        uint256[] memory aliceErc1155 = new uint256[](1);
        aliceErc1155[0] = 60;
        splits[0] = TokenBundleSplitterBase.BundleSplit({
            recipient: alice,
            nativeAmount: 0.6 ether,
            erc20Amounts: aliceErc20,
            erc721Indices: aliceErc721,
            erc1155Amounts: aliceErc1155
        });
        uint256[] memory bobErc20 = new uint256[](2);
        bobErc20[0] = 40e18;
        bobErc20[1] = 30e18;
        uint256[] memory bobErc721 = new uint256[](1);
        bobErc721[0] = 1;
        uint256[] memory bobErc1155 = new uint256[](1);
        bobErc1155[0] = 40;
        splits[1] = TokenBundleSplitterBase.BundleSplit({
            recipient: bob,
            nativeAmount: 0.4 ether,
            erc20Amounts: bobErc20,
            erc721Indices: bobErc721,
            erc1155Amounts: bobErc1155
        });
        return splits;
    }

    function _oneWaySplit() internal view returns (TokenBundleSplitterBase.BundleSplit[] memory) {
        TokenBundleSplitterBase.BundleSplit[] memory splits = new TokenBundleSplitterBase.BundleSplit[](1);
        uint256[] memory erc20Amounts = new uint256[](2);
        erc20Amounts[0] = TOKEN1_AMOUNT;
        erc20Amounts[1] = TOKEN2_AMOUNT;
        uint256[] memory erc721Indices = new uint256[](2);
        erc721Indices[0] = 0;
        erc721Indices[1] = 1;
        uint256[] memory erc1155Amounts = new uint256[](1);
        erc1155Amounts[0] = MULTI_AMOUNT;
        splits[0] = TokenBundleSplitterBase.BundleSplit({
            recipient: carol,
            nativeAmount: NATIVE_AMOUNT,
            erc20Amounts: erc20Amounts,
            erc721Indices: erc721Indices,
            erc1155Amounts: erc1155Amounts
        });
        return splits;
    }

    function _oneWayDuplicateERC20Split() internal view returns (TokenBundleSplitterBase.BundleSplit[] memory) {
        TokenBundleSplitterBase.BundleSplit[] memory splits = new TokenBundleSplitterBase.BundleSplit[](1);
        uint256[] memory erc20Amounts = new uint256[](2);
        erc20Amounts[0] = 60e18;
        erc20Amounts[1] = 40e18;
        splits[0] = TokenBundleSplitterBase.BundleSplit({
            recipient: carol,
            nativeAmount: 0,
            erc20Amounts: erc20Amounts,
            erc721Indices: new uint256[](0),
            erc1155Amounts: new uint256[](0)
        });
        return splits;
    }

    function _oneWayDuplicateERC1155Split() internal view returns (TokenBundleSplitterBase.BundleSplit[] memory) {
        TokenBundleSplitterBase.BundleSplit[] memory splits = new TokenBundleSplitterBase.BundleSplit[](1);
        uint256[] memory erc1155Amounts = new uint256[](2);
        erc1155Amounts[0] = 60;
        erc1155Amounts[1] = 40;
        splits[0] = TokenBundleSplitterBase.BundleSplit({
            recipient: carol,
            nativeAmount: 0,
            erc20Amounts: new uint256[](0),
            erc721Indices: new uint256[](0),
            erc1155Amounts: erc1155Amounts
        });
        return splits;
    }

    function testArbitrateValid() public {
        bytes32 escrowUid = _createEscrow();
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);
        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, _twoWaySplit());
        bytes32 key = keccak256(abi.encodePacked(fulfillmentUid, escrowUid));
        assertTrue(splitter.hasDecision(oracle, key));
    }

    function testArbitrateRejectsZeroFulfillment() public {
        bytes32 escrowUid = _createEscrow();

        vm.prank(oracle);
        vm.expectRevert(BaseSplitter.InvalidFulfillmentUid.selector);
        splitter.arbitrate(bytes32(0), escrowUid, _twoWaySplit());
    }

    function testArbitrateRejectsERC721IndexWhenEscrowHasNoERC721s() public {
        bytes32 escrowUid = _createEscrowWithoutERC721();
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);

        TokenBundleSplitterBase.BundleSplit[] memory splits = _twoWaySplit();
        splits[0].erc721Indices = new uint256[](1);
        splits[0].erc721Indices[0] = 0;
        splits[1].erc721Indices = new uint256[](0);

        vm.prank(oracle);
        vm.expectRevert(abi.encodeWithSelector(TokenBundleSplitter.InvalidERC721Index.selector, 0, 0));
        splitter.arbitrate(fulfillmentUid, escrowUid, splits);
    }

    function testCollectAndDistribute() public {
        bytes32 escrowUid = _createEscrow();
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);
        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, _twoWaySplit());

        vm.prank(carol);
        splitter.collectAndDistribute(escrowUid, fulfillmentUid);

        assertEq(alice.balance, 0.6 ether);
        assertEq(bob.balance, 0.4 ether);
        assertEq(token1.balanceOf(alice), 60e18);
        assertEq(token1.balanceOf(bob), 40e18);
        assertEq(nft.ownerOf(NFT_ID_1), alice);
        assertEq(nft.ownerOf(NFT_ID_2), bob);
        assertEq(multiToken.balanceOf(alice, MULTI_ID), 60);
        assertEq(multiToken.balanceOf(bob, MULTI_ID), 40);
        assertEq(address(splitter).balance, 0);
    }

    function testCollectAndDistributeWithDuplicateERC20Entries() public {
        bytes32 escrowUid = _createDuplicateERC20Escrow();
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);
        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, _oneWayDuplicateERC20Split());

        vm.prank(alice);
        splitter.collectAndDistribute(escrowUid, fulfillmentUid);

        assertEq(token1.balanceOf(carol), TOKEN1_AMOUNT);
        assertEq(token1.balanceOf(address(splitter)), 0);
    }

    function testCollectAndDistributeWithDuplicateERC1155Entries() public {
        bytes32 escrowUid = _createDuplicateERC1155Escrow();
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);
        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, _oneWayDuplicateERC1155Split());

        vm.prank(alice);
        splitter.collectAndDistribute(escrowUid, fulfillmentUid);

        assertEq(multiToken.balanceOf(carol, MULTI_ID), MULTI_AMOUNT);
        assertEq(multiToken.balanceOf(address(splitter), MULTI_ID), 0);
    }

    function testCollectAndDistributeWithSentinel() public {
        bytes32 escrowUid = _createEscrow();
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);

        TokenBundleSplitterBase.BundleSplit[] memory splits = _twoWaySplit();
        splits[0].recipient = splitter.EXECUTOR_SENTINEL();
        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, splits);

        uint256 executorBalBefore = executor.balance;
        // Different caller — sentinel resolves to executor
        vm.prank(carol);
        splitter.collectAndDistribute(escrowUid, fulfillmentUid);

        assertEq(executor.balance, executorBalBefore + 0.6 ether, "Executor gets sentinel share");
        assertEq(token1.balanceOf(executor), 60e18);
        assertEq(nft.ownerOf(NFT_ID_1), executor);
    }

    function testCheckObligationRejectsDifferentFulfillment() public {
        bytes32 escrowUid = _createEscrow();
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);
        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, _twoWaySplit());

        bytes32 attackerFulfillmentUid = _createFulfillmentViaSplitter(alice, escrowUid);
        bytes memory demand = abi.encode(TokenBundleSplitterBase.DemandData({oracle: oracle, data: bytes("")}));

        Attestation memory attackerF = eas.getAttestation(attackerFulfillmentUid);
        assertFalse(splitter.check(attackerF, demand, escrowUid));

        Attestation memory f = eas.getAttestation(fulfillmentUid);
        assertFalse(splitter.check(f, demand, escrowUid));
    }

    function testRequestArbitrationAsRecipient() public {
        bytes32 escrowUid = _createEscrow();
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);
        vm.prank(buyer);
        vm.expectEmit(true, true, true, true);
        emit BaseSplitter.ArbitrationRequested(fulfillmentUid, escrowUid, oracle, bytes("demand"));
        splitter.requestArbitration(fulfillmentUid, escrowUid, oracle, bytes("demand"));
    }

    function testRequestArbitrationUnauthorized() public {
        bytes32 escrowUid = _createEscrow();
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);
        vm.prank(carol);
        vm.expectRevert(BaseSplitter.UnauthorizedArbitrationRequest.selector);
        splitter.requestArbitration(fulfillmentUid, escrowUid, oracle, bytes("demand"));
    }

    function testGetSplits() public {
        bytes32 escrowUid = _createEscrow();
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);
        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, _twoWaySplit());

        TokenBundleSplitterBase.BundleSplit[] memory stored = splitter.getSplits(oracle, fulfillmentUid, escrowUid);
        assertEq(stored.length, 2);
        assertEq(stored[0].recipient, alice);
        assertEq(stored[0].nativeAmount, 0.6 ether);
    }

    function testRearbitrateClearsNestedSplitArrays() public {
        bytes32 escrowUid = _createEscrow();
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);

        vm.startPrank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, _twoWaySplit());
        splitter.arbitrate(fulfillmentUid, escrowUid, _oneWaySplit());
        vm.stopPrank();

        TokenBundleSplitterBase.BundleSplit[] memory stored = splitter.getSplits(oracle, fulfillmentUid, escrowUid);
        assertEq(stored.length, 1);
        assertEq(stored[0].recipient, carol);
        assertEq(stored[0].nativeAmount, NATIVE_AMOUNT);
        assertEq(stored[0].erc20Amounts.length, 2);
        assertEq(stored[0].erc20Amounts[0], TOKEN1_AMOUNT);
        assertEq(stored[0].erc20Amounts[1], TOKEN2_AMOUNT);
        assertEq(stored[0].erc721Indices.length, 2);
        assertEq(stored[0].erc721Indices[0], 0);
        assertEq(stored[0].erc721Indices[1], 1);
        assertEq(stored[0].erc1155Amounts.length, 1);
        assertEq(stored[0].erc1155Amounts[0], MULTI_AMOUNT);
    }
}
