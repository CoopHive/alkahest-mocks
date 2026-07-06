// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {GlobalBondCommitRevealObligation} from "@src/obligations/example/GlobalBondCommitRevealObligation.sol";
import {TrustedOracleArbiter} from "@src/arbiters/trusted-oracle/TrustedOracleArbiter.sol";
import {ERC20EscrowObligation} from "@src/obligations/escrow/default/ERC20EscrowObligation.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract MockToken is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {
        _mint(msg.sender, 1_000_000e18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract EscrowCommitRevealOracleGasTest is Test {
    IEAS internal eas;
    ISchemaRegistry internal schemaRegistry;
    GlobalBondCommitRevealObligation internal commitReveal;
    TrustedOracleArbiter internal trustedOracleArbiter;
    ERC20EscrowObligation internal erc20Escrow;
    MockToken internal paymentToken;

    address internal alice;
    address internal bob;
    address internal charlie;

    uint256 internal constant PAYMENT_AMOUNT = 100e18;
    uint256 internal constant BOND = 0.1 ether;
    uint256 internal constant PAYLOAD_SIZE = 64;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        commitReveal = new GlobalBondCommitRevealObligation(eas, schemaRegistry, BOND, 1 hours, address(0));
        trustedOracleArbiter = new TrustedOracleArbiter(eas);
        erc20Escrow = new ERC20EscrowObligation(eas, schemaRegistry);

        paymentToken = new MockToken();

        alice = makeAddr("alice");
        bob = makeAddr("bob");
        charlie = makeAddr("charlie");

        paymentToken.mint(alice, PAYMENT_AMOUNT * 10);
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(charlie, 10 ether);
    }

    function _innerDemand() internal pure returns (bytes memory) {
        return abi.encode("QUERY");
    }

    function _escrowData(bytes memory demand) internal view returns (ERC20EscrowObligation.ObligationData memory) {
        return ERC20EscrowObligation.ObligationData({
            token: address(paymentToken), amount: PAYMENT_AMOUNT, arbiter: address(trustedOracleArbiter), demand: demand
        });
    }

    function _commitData() internal pure returns (GlobalBondCommitRevealObligation.ObligationData memory) {
        bytes memory payload = new bytes(PAYLOAD_SIZE);
        return GlobalBondCommitRevealObligation.ObligationData({
            payload: payload, salt: bytes32("salt"), schema: bytes32("schema")
        });
    }

    function _commitDataWithSize(uint256 payloadSize)
        internal
        pure
        returns (GlobalBondCommitRevealObligation.ObligationData memory)
    {
        bytes memory payload = new bytes(payloadSize);
        return GlobalBondCommitRevealObligation.ObligationData({
            payload: payload, salt: bytes32("salt"), schema: bytes32("schema")
        });
    }

    function _createEscrow() internal returns (bytes32 escrowUid, bytes memory innerDemand) {
        innerDemand = _innerDemand();
        bytes memory demand = abi.encode(TrustedOracleArbiter.DemandData({oracle: charlie, data: innerDemand}));
        ERC20EscrowObligation.ObligationData memory escrowData = _escrowData(demand);

        vm.startPrank(alice);
        paymentToken.approve(address(erc20Escrow), PAYMENT_AMOUNT);
        escrowUid = erc20Escrow.doObligation(escrowData, uint64(block.timestamp + 1 days));
        vm.stopPrank();
    }

    function _setupEscrowAndCommit()
        internal
        returns (
            bytes32 escrowUid,
            bytes memory innerDemand,
            GlobalBondCommitRevealObligation.ObligationData memory data
        )
    {
        (escrowUid, innerDemand) = _createEscrow();
        data = _commitData();

        bytes32 commitment = commitReveal.computeCommitment(escrowUid, bob, data);
        vm.deal(bob, BOND);
        vm.prank(bob);
        commitReveal.commit{value: BOND}(commitment);
    }

    function _setupEscrowCommitReveal()
        internal
        returns (bytes32 escrowUid, bytes32 fulfillmentUid, bytes memory innerDemand)
    {
        GlobalBondCommitRevealObligation.ObligationData memory data;
        (escrowUid, innerDemand, data) = _setupEscrowAndCommit();

        vm.roll(block.number + 1);
        vm.prank(bob);
        fulfillmentUid = commitReveal.doObligation(data, escrowUid);
    }

    // ---------------------------------------------------------------------
    // Gas measurements (one measured call per test)
    // ---------------------------------------------------------------------

    function testGas_Escrower_Approve() public {
        vm.prank(alice);
        paymentToken.approve(address(erc20Escrow), PAYMENT_AMOUNT);
    }

    function testGas_Escrower_CreateEscrow() public {
        bytes memory innerDemand = _innerDemand();
        bytes memory demand = abi.encode(TrustedOracleArbiter.DemandData({oracle: charlie, data: innerDemand}));
        ERC20EscrowObligation.ObligationData memory escrowData = _escrowData(demand);

        vm.pauseGasMetering();
        vm.prank(alice);
        paymentToken.approve(address(erc20Escrow), PAYMENT_AMOUNT);
        vm.resumeGasMetering();

        vm.prank(alice);
        erc20Escrow.doObligation(escrowData, uint64(block.timestamp + 1 days));
    }

    function testGas_Fulfiller_Commit() public {
        vm.pauseGasMetering();
        (bytes32 escrowUid,) = _createEscrow();
        GlobalBondCommitRevealObligation.ObligationData memory data = _commitData();
        bytes32 commitment = commitReveal.computeCommitment(escrowUid, bob, data);
        vm.deal(bob, BOND);
        vm.resumeGasMetering();

        vm.prank(bob);
        commitReveal.commit{value: BOND}(commitment);
    }

    function testGas_Fulfiller_Reveal() public {
        vm.pauseGasMetering();
        (bytes32 escrowUid,, GlobalBondCommitRevealObligation.ObligationData memory data) = _setupEscrowAndCommit();
        vm.roll(block.number + 1);
        vm.resumeGasMetering();

        vm.prank(bob);
        commitReveal.doObligation(data, escrowUid);
    }

    function testGas_Fulfiller_RequestArbitration() public {
        vm.pauseGasMetering();
        (bytes32 escrowUid, bytes32 fulfillmentUid, bytes memory innerDemand) = _setupEscrowCommitReveal();
        escrowUid;
        vm.resumeGasMetering();

        vm.prank(bob);
        trustedOracleArbiter.requestArbitration(fulfillmentUid, charlie, innerDemand);
    }

    function testGas_Oracle_Arbitrate() public {
        vm.pauseGasMetering();
        (, bytes32 fulfillmentUid, bytes memory innerDemand) = _setupEscrowCommitReveal();
        vm.resumeGasMetering();

        vm.prank(charlie);
        trustedOracleArbiter.arbitrate(fulfillmentUid, innerDemand, true);
    }

    function testGas_Fulfiller_CollectEscrow() public {
        vm.pauseGasMetering();
        (bytes32 escrowUid, bytes32 fulfillmentUid, bytes memory innerDemand) = _setupEscrowCommitReveal();
        vm.prank(charlie);
        trustedOracleArbiter.arbitrate(fulfillmentUid, innerDemand, true);
        vm.resumeGasMetering();

        vm.prank(bob);
        erc20Escrow.collect(escrowUid, fulfillmentUid);
    }

    function testGas_Fulfiller_RevealWithBondReclaim() public {
        // Bond reclaim is now atomic with reveal in doObligation.
        // This measures the combined cost (commit already done).
        vm.pauseGasMetering();
        (bytes32 escrowUid,, GlobalBondCommitRevealObligation.ObligationData memory data) = _setupEscrowAndCommit();
        vm.roll(block.number + 1);
        vm.resumeGasMetering();

        vm.prank(bob);
        commitReveal.doObligation(data, escrowUid);
    }

    function _measureRevealWithPayload(uint256 payloadSize) internal {
        vm.pauseGasMetering();
        (bytes32 escrowUid,) = _createEscrow();
        GlobalBondCommitRevealObligation.ObligationData memory data = _commitDataWithSize(payloadSize);
        bytes32 commitment = commitReveal.computeCommitment(escrowUid, bob, data);
        vm.deal(bob, BOND);
        vm.prank(bob);
        commitReveal.commit{value: BOND}(commitment);
        vm.roll(block.number + 1);
        vm.resumeGasMetering();

        vm.prank(bob);
        commitReveal.doObligation(data, escrowUid);
    }

    function testGas_Payload_0() public {
        _measureRevealWithPayload(0);
    }

    function testGas_Payload_32() public {
        _measureRevealWithPayload(32);
    }

    function testGas_Payload_128() public {
        _measureRevealWithPayload(128);
    }

    function testGas_Payload_512() public {
        _measureRevealWithPayload(512);
    }

    function testGas_Payload_2048() public {
        _measureRevealWithPayload(2048);
    }

    function testGas_Payload_4096() public {
        _measureRevealWithPayload(4096);
    }
}
