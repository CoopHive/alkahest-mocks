// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {BaseEscrowObligation} from "@src/BaseEscrowObligation.sol";
import {CommitmentERC20Splitter} from "@src/utils/splitters/commitment/CommitmentERC20Splitter.sol";
import {ERC20EscrowObligation} from "@src/obligations/escrow/default/ERC20EscrowObligation.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract CommitmentMockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MCK") {
        _mint(msg.sender, 10000 * 10 ** 18);
    }
}

contract CommitmentERC20SplitterTest is Test {
    CommitmentERC20Splitter public splitter;
    ERC20EscrowObligation public escrowObligation;
    StringObligation public stringObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    CommitmentMockERC20 public token;

    address buyer = makeAddr("buyer");
    address oracle = makeAddr("oracle");
    address executor = makeAddr("executor");
    address attacker = makeAddr("attacker");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    uint256 constant AMOUNT = 100 * 10 ** 18;
    uint64 constant EXPIRATION = 365 days;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        escrowObligation = new ERC20EscrowObligation(eas, schemaRegistry);
        splitter = new CommitmentERC20Splitter(eas, escrowObligation);
        stringObligation = new StringObligation(eas, schemaRegistry);
        token = new CommitmentMockERC20();

        assertTrue(token.transfer(buyer, 1000 * 10 ** 18));
    }

    function _obligationData() internal pure returns (bytes memory) {
        return abi.encode(StringObligation.ObligationData({item: "fulfillment", schema: bytes32(0)}));
    }

    function _createEscrow() internal returns (bytes32) {
        bytes memory demand = abi.encode(CommitmentERC20Splitter.DemandData({oracle: oracle, data: bytes("")}));

        ERC20EscrowObligation.ObligationData memory data = ERC20EscrowObligation.ObligationData({
            token: address(token), amount: AMOUNT, arbiter: address(splitter), demand: demand
        });

        vm.startPrank(buyer);
        token.approve(address(escrowObligation), AMOUNT);
        bytes32 uid = escrowObligation.doObligation(data, uint64(block.timestamp + EXPIRATION));
        vm.stopPrank();

        return uid;
    }

    function _intentHash(bytes32 escrowUid, address fulfiller) internal view returns (bytes32) {
        return splitter.fulfillmentIntentHash(
            stringObligation.ATTESTATION_SCHEMA(),
            address(stringObligation),
            address(splitter),
            0,
            stringObligation.ATTESTATION_SCHEMA_REVOCABLE(),
            escrowUid,
            _obligationData(),
            fulfiller
        );
    }

    function testOracleCanApproveIntentBeforeFulfillmentExistsAndExecutorCollectsAtomically() public {
        bytes32 escrowUid = _createEscrow();
        bytes32 intentHash = _intentHash(escrowUid, executor);

        CommitmentERC20Splitter.Split[] memory splits = new CommitmentERC20Splitter.Split[](2);
        splits[0] = CommitmentERC20Splitter.Split({recipient: alice, amount: 60 * 10 ** 18});
        splits[1] = CommitmentERC20Splitter.Split({recipient: bob, amount: 40 * 10 ** 18});

        vm.prank(oracle);
        splitter.arbitrate(intentHash, escrowUid, splits);

        vm.prank(executor);
        splitter.createFulfillmentAndCollectAndDistribute(
            escrowUid, address(stringObligation), _obligationData(), 0, escrowUid
        );

        assertEq(token.balanceOf(alice), 60 * 10 ** 18);
        assertEq(token.balanceOf(bob), 40 * 10 ** 18);
        assertEq(token.balanceOf(address(splitter)), 0);
    }

    function testCopiedPayloadWithDifferentExecutorDoesNotUseOriginalApproval() public {
        bytes32 escrowUid = _createEscrow();
        bytes32 intentHash = _intentHash(escrowUid, executor);

        CommitmentERC20Splitter.Split[] memory splits = new CommitmentERC20Splitter.Split[](1);
        splits[0] = CommitmentERC20Splitter.Split({recipient: splitter.EXECUTOR_SENTINEL(), amount: AMOUNT});

        vm.prank(oracle);
        splitter.arbitrate(intentHash, escrowUid, splits);

        vm.prank(attacker);
        vm.expectRevert(BaseEscrowObligation.InvalidFulfillment.selector);
        splitter.createFulfillmentAndCollectAndDistribute(
            escrowUid, address(stringObligation), _obligationData(), 0, escrowUid
        );
    }
}
