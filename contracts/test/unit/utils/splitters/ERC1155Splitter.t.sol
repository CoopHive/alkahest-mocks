// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {BaseSplitter} from "@src/utils/splitters/default/BaseSplitter.sol";
import {ERC1155Splitter} from "@src/utils/splitters/default/ERC1155Splitter.sol";
import {ERC1155EscrowObligation} from "@src/obligations/escrow/default/ERC1155EscrowObligation.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {IEAS, Attestation} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract MockERC1155 is ERC1155 {
    constructor() ERC1155("https://example.com/token/{id}.json") {}

    function mint(address to, uint256 id, uint256 amount) public {
        _mint(to, id, amount, "");
    }
}

contract ERC1155SplitterTest is Test {
    ERC1155Splitter public splitter;
    ERC1155EscrowObligation public escrowObligation;
    StringObligation public stringObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    MockERC1155 public token;

    address buyer = makeAddr("buyer");
    address oracle = makeAddr("oracle");
    address executor = makeAddr("executor");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address carol = makeAddr("carol");

    uint256 constant TOKEN_ID = 1;
    uint256 constant AMOUNT = 100;
    uint64 constant EXPIRATION = 365 days;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();
        escrowObligation = new ERC1155EscrowObligation(eas, schemaRegistry);
        splitter = new ERC1155Splitter(eas, escrowObligation);
        stringObligation = new StringObligation(eas, schemaRegistry);
        token = new MockERC1155();
        token.mint(buyer, TOKEN_ID, 1000);
        vm.deal(executor, 1 ether);
        vm.prank(buyer);
        token.setApprovalForAll(address(escrowObligation), true);
    }

    function _createEscrow(address _buyer, uint256 tokenId, uint256 amount, uint64 expiration)
        internal
        returns (bytes32)
    {
        bytes memory demand = abi.encode(ERC1155Splitter.DemandData({oracle: oracle, data: bytes("")}));
        ERC1155EscrowObligation.ObligationData memory data = ERC1155EscrowObligation.ObligationData({
            token: address(token), tokenId: tokenId, amount: amount, arbiter: address(splitter), demand: demand
        });
        vm.prank(_buyer);
        return escrowObligation.doObligation(data, expiration);
    }

    function _createFulfillmentViaSplitter(address _executor, bytes32 escrowUid) internal returns (bytes32) {
        bytes memory obligationData =
            abi.encode(StringObligation.ObligationData({item: "fulfillment", schema: bytes32(0)}));
        vm.prank(_executor);
        return splitter.createFulfillment(address(stringObligation), obligationData, 0, escrowUid);
    }

    function testCreateFulfillmentRecordsFulfiller() public {
        bytes32 escrowUid = _createEscrow(buyer, TOKEN_ID, AMOUNT, uint64(block.timestamp + EXPIRATION));
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);
        assertEq(splitter.fulfillers(fulfillmentUid), executor);
        Attestation memory f = eas.getAttestation(fulfillmentUid);
        assertEq(f.recipient, address(splitter));
    }

    function testCollectAndDistribute() public {
        bytes32 escrowUid = _createEscrow(buyer, TOKEN_ID, AMOUNT, uint64(block.timestamp + EXPIRATION));
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);

        ERC1155Splitter.Split[] memory splits = new ERC1155Splitter.Split[](2);
        splits[0] = ERC1155Splitter.Split({recipient: alice, amount: 60});
        splits[1] = ERC1155Splitter.Split({recipient: bob, amount: 40});

        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, splits);

        vm.prank(carol);
        splitter.collectAndDistribute(escrowUid, fulfillmentUid);

        assertEq(token.balanceOf(alice, TOKEN_ID), 60);
        assertEq(token.balanceOf(bob, TOKEN_ID), 40);
        assertEq(token.balanceOf(address(splitter), TOKEN_ID), 0);
    }

    function testCollectAndDistributeWithSentinel() public {
        bytes32 escrowUid = _createEscrow(buyer, TOKEN_ID, AMOUNT, uint64(block.timestamp + EXPIRATION));
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);

        ERC1155Splitter.Split[] memory splits = new ERC1155Splitter.Split[](2);
        splits[0] = ERC1155Splitter.Split({recipient: splitter.EXECUTOR_SENTINEL(), amount: 60});
        splits[1] = ERC1155Splitter.Split({recipient: bob, amount: 40});

        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, splits);

        // Different caller — sentinel still resolves to executor
        vm.prank(carol);
        splitter.collectAndDistribute(escrowUid, fulfillmentUid);

        assertEq(token.balanceOf(executor, TOKEN_ID), 60, "Executor gets sentinel share");
        assertEq(token.balanceOf(carol, TOKEN_ID), 0, "Caller does NOT get sentinel share");
        assertEq(token.balanceOf(bob, TOKEN_ID), 40);
    }

    function testCheckObligationRejectsDifferentFulfillment() public {
        bytes32 escrowUid = _createEscrow(buyer, TOKEN_ID, AMOUNT, uint64(block.timestamp + EXPIRATION));
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);

        ERC1155Splitter.Split[] memory splits = new ERC1155Splitter.Split[](1);
        splits[0] = ERC1155Splitter.Split({recipient: alice, amount: AMOUNT});
        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, splits);

        bytes32 attackerFulfillmentUid = _createFulfillmentViaSplitter(alice, escrowUid);
        bytes memory demand = abi.encode(ERC1155Splitter.DemandData({oracle: oracle, data: bytes("")}));

        Attestation memory attackerF = eas.getAttestation(attackerFulfillmentUid);
        assertFalse(splitter.check(attackerF, demand, escrowUid));

        Attestation memory f = eas.getAttestation(fulfillmentUid);
        assertFalse(splitter.check(f, demand, escrowUid));
    }

    function testArbitrateRejectsZeroFulfillment() public {
        bytes32 escrowUid = _createEscrow(buyer, TOKEN_ID, AMOUNT, uint64(block.timestamp + EXPIRATION));

        ERC1155Splitter.Split[] memory splits = new ERC1155Splitter.Split[](1);
        splits[0] = ERC1155Splitter.Split({recipient: alice, amount: AMOUNT});

        vm.prank(oracle);
        vm.expectRevert(BaseSplitter.InvalidFulfillmentUid.selector);
        splitter.arbitrate(bytes32(0), escrowUid, splits);
    }

    function testRequestArbitrationAsRecipient() public {
        bytes32 escrowUid = _createEscrow(buyer, TOKEN_ID, AMOUNT, uint64(block.timestamp + EXPIRATION));
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);

        vm.prank(buyer);
        vm.expectEmit(true, true, true, true);
        emit BaseSplitter.ArbitrationRequested(fulfillmentUid, escrowUid, oracle, bytes("demand"));
        splitter.requestArbitration(fulfillmentUid, escrowUid, oracle, bytes("demand"));
    }

    function testRequestArbitrationUnauthorized() public {
        bytes32 escrowUid = _createEscrow(buyer, TOKEN_ID, AMOUNT, uint64(block.timestamp + EXPIRATION));
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);

        vm.prank(carol);
        vm.expectRevert(BaseSplitter.UnauthorizedArbitrationRequest.selector);
        splitter.requestArbitration(fulfillmentUid, escrowUid, oracle, bytes("demand"));
    }

    function testGetSplits() public {
        bytes32 escrowUid = _createEscrow(buyer, TOKEN_ID, AMOUNT, uint64(block.timestamp + EXPIRATION));
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(executor, escrowUid);

        ERC1155Splitter.Split[] memory splits = new ERC1155Splitter.Split[](2);
        splits[0] = ERC1155Splitter.Split({recipient: alice, amount: 60});
        splits[1] = ERC1155Splitter.Split({recipient: bob, amount: 40});
        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, splits);

        ERC1155Splitter.Split[] memory stored = splitter.getSplits(oracle, fulfillmentUid, escrowUid);
        assertEq(stored.length, 2);
        assertEq(stored[0].recipient, alice);
        assertEq(stored[0].amount, 60);
    }
}
