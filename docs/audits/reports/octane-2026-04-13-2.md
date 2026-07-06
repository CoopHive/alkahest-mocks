# alkahest (main CI/CD - One Month Arb Grant) analysis report

- Repository: `arkhai-io/alkahest`
- Analysis date: 2026-04-13
- Vulnerabilities: 36
- Warnings: 19

## Summary

This analysis reviewed the alkahest (main CI/CD - One Month Arb Grant) smart contracts using Octane's automated analysis and included team feedback on findings.

The analysis identified a total of 55 issues (36 vulnerabilities, 19 warnings), including 3 critical vulnerabilities.

## Vulnerabilities

### 1. [Critical] Cross-function reentrancy via public execute() in TokenBundleSplitterBase collectAndDistribute causes theft of unrelated escrow bundles

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

During collectAndDistribute, TokenBundleSplitterBase performs external recipient calls (ETH fallback, ERC1155 hooks) while temporarily holding collected assets and exposes an unguarded execute() proxy. A malicious recipient can reenter via these callbacks, call execute() to collect other escrows into the splitter using attacker-crafted fulfillments, and immediately transfer those assets out, stealing unrelated users’ bundles.

TokenBundleSplitterBase.collectAndDistribute first collects the entire escrowed bundle into the splitter contract, then distributes assets to recipients. Distribution uses payable(recipient).call for ETH and IERC1155.safeTransferFrom for ERC1155, both of which invoke recipient callbacks. The contract also exposes a public, nonReentrant-unprotected execute() that issues arbitrary calls as the splitter. This creates a cross-function reentrancy window: a malicious recipient’s fallback/onERC1155Received can call execute() mid-distribution while the splitter holds all collected assets. The attacker can use execute() to call an escrow’s collectEscrow for an unrelated victim escrow whose oracle decision has already been posted; TokenBundleSplitterBase.checkObligation ignores fulfillment contents and only checks hasDecision keyed by (escrow UID, demand). For non-tierable escrows, the attacker can mint a fulfillment with refUID equal to the escrow UID and recipient set to the splitter; tierable escrows require no refUID linkage. The escrow then releases the victim bundle to the splitter, after which the attacker immediately transfers those tokens from the splitter to themselves via further execute() calls. The outer distribution can still succeed if the stolen assets are disjoint from the outer escrow’s assets, resulting in complete theft of unrelated escrow bundles.

#### Severity

**Impact Explanation:** [High] Complete theft of principal escrowed assets from unrelated users by diverting their bundles to the attacker mid-distribution.

**Likelihood Explanation:** [High] No rare conditions required: victims normally have oracle decisions posted before distribution; attackers can reliably trigger callbacks by creating their own outer escrow and can mint suitable fulfillments; clear financial incentive exists.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Non-tierable victim drained via ETH fallback: An attacker sets up an outer bundle escrow (E_outer) that pays them some ETH via the splitter. When collectAndDistribute processes the attacker’s ETH payment, their fallback reenters execute() to collect a victim non-tierable bundle escrow (E_victim) into the splitter using an attacker-minted fulfillment with refUID = E_victim and recipient = splitter, then immediately transfers E_victim assets from the splitter to the attacker. The outer distribution completes successfully if assets are disjoint.
#### Preconditions / Assumptions
- (a). A non-tierable TokenBundleEscrowObligation escrow E_victim uses the TokenBundleSplitter as arbiter and its trusted oracle has already posted a decision for (E_victim UID, demand).
- (b). The attacker minted a fulfillment F_victim with refUID = E_victim UID and recipient = the splitter address.
- (c). An outer bundle escrow E_outer is processed via collectAndDistribute and includes an ETH split to the attacker (recipient is the attacker’s contract to trigger fallback).
- (d). The fulfillment used for E_outer is crafted so the escrow releases to the splitter (recipient = splitter) to allow distribution.

### Scenario 2.
Tierable victim drained via ERC1155 hook: An attacker sets up an outer bundle escrow (E_outer) that pays them some ERC1155 amount. During IERC1155.safeTransferFrom, onERC1155Received reenters execute() to collect a tierable victim escrow (E_victim) into the splitter using any attacker-minted fulfillment with recipient = splitter (no refUID required), then transfers those assets out to the attacker. The outer distribution completes if assets are disjoint.
#### Preconditions / Assumptions
- (a). A tierable TokenBundleEscrowObligation escrow E_victim uses the TokenBundleSplitter as arbiter and its trusted oracle has already posted a decision for (E_victim UID, demand).
- (b). The attacker minted a fulfillment F_victim with recipient = the splitter address (no refUID linkage required for tierable).
- (c). An outer bundle escrow E_outer is processed via collectAndDistribute and includes an ERC1155 split to the attacker, invoking onERC1155Received on the attacker’s contract.
- (d). The fulfillment used for E_outer is crafted so the escrow releases to the splitter (recipient = splitter) to allow distribution.

### Scenario 3.
Batch drain multiple victims in one callback: In the same fallback or onERC1155Received during E_outer’s distribution, the attacker repeatedly calls execute() to collect multiple victim escrows (each with a posted oracle decision) into the splitter and immediately transfers each collected bundle out to attacker-controlled addresses before returning to complete the outer distribution.
#### Preconditions / Assumptions
- (a). Multiple victim escrows E_victimi (tierable or non-tierable as applicable) each use the TokenBundleSplitter as arbiter and each has a posted oracle decision.
- (b). The attacker has minted corresponding fulfillments with recipient = splitter (and refUID linkage for non-tierable) for each victim.
- (c). An outer escrow E_outer processed via collectAndDistribute triggers either ETH fallback or ERC1155 hook on the attacker’s contract.
- (d). The attacker ensures victim asset sets are disjoint from E_outer’s assets so the outer distribution can complete after theft.

#### Proposed fix

##### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 90 unchanged lines ...
     /// @notice Transient storage for the current executor during execute/collectAndDistribute.
     address private _currentExecutor;
+    /// @notice Transient storage to gate valid obligations during atomic collection.
+    bytes32 private _processingEscrow;
 
     constructor(IEAS _eas) {
 ... 63 unchanged lines ...
     /// @inheritdoc IArbiter
     function checkObligation(
-        Attestation memory,
+        Attestation memory fulfillment,
         bytes memory demand,
         bytes32 fulfilling
     ) public view override returns (bool) {
+        if (fulfillment.recipient != address(this)) return false;
+        if (_processingEscrow != fulfilling) return false;
         DemandData memory demandData = abi.decode(demand, (DemandData));
         bytes32 decisionKey = keccak256(
             abi.encodePacked(fulfilling, demand)
         );
         return hasDecision[demandData.oracle][decisionKey];
     }
 
     // -----------------------------------------------------------------
     // Execute (proxy calls through the splitter)
     // -----------------------------------------------------------------
 
     /// @notice Execute an arbitrary call as the splitter contract.
     ///         Payable to allow forwarding ETH for native token operations.
     function execute(
         address target,
         bytes calldata data
-    ) external payable returns (bytes memory) {
+    ) external payable nonReentrant returns (bytes memory) {
         _currentExecutor = msg.sender;
         (bool success, bytes memory result) = target.call{value: msg.value}(
             data
         );
         if (!success) revert ExecuteFailed(target, data);
         _currentExecutor = address(0);
         return result;
     }
 
     // -----------------------------------------------------------------
     // Atomic collect + distribute
     // -----------------------------------------------------------------
 
     /// @notice Collects a token bundle escrow and distributes assets per oracle splits.
     function collectAndDistribute(
         address escrowContract,
         bytes32 escrow,
         bytes32 fulfillment
     ) external nonReentrant {
         _currentExecutor = msg.sender;
+        _processingEscrow = escrow;
 
         Attestation memory escrowAttestation = eas.getAttestation(escrow);
 ... 75 unchanged lines ...
 
         _currentExecutor = address(0);
+        _processingEscrow = bytes32(0);
     }
 
 ... 28 unchanged lines ...
```

### 2. [Critical] Missing commit-before-reveal enforcement and committer binding in CommitRevealObligation.checkObligation causes theft of escrowed funds

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

CommitRevealObligation accepts a reveal if a matching commitment exists in any prior block relative to collection, without ensuring the commitment predates the reveal or that the committer is the recipient. This allows post-hoc commitments and copycat reveals to steal escrowed funds.

The CommitRevealObligation arbiter only checks that a commitment matching (refUID, recipient, keccak256(data)) exists and that its commitBlock is less than the current block at the time of verification. It does not ensure the commitment predates the reveal attestation’s creation time, nor that the committer address equals the attestation’s recipient. As a result: (1) a fulfiller can reveal first and later backfill a commitment just before collection, defeating the intended commit-then-reveal binding, and (2) in open-fulfiller escrows, a third party can copy a public reveal, submit their own commitment for themselves after seeing it, issue their own reveal, and then collect the escrow one block later. The escrow contracts pay the escrowed value to the fulfillment recipient after the arbiter passes, and the bond is refunded to the fulfillment recipient, enabling profitable theft with only temporary bond lock-up.

#### Severity

**Impact Explanation:** [High] In open-fulfiller deployments, buyer funds can be directly and materially stolen by a third party who races to collect after a post-hoc commitment. Even when recipient is fixed, the core commit–reveal security property is broken, enabling strategic exploitation by the recipient.

**Likelihood Explanation:** [High] Scenario 1 requires no special constraints beyond common open-fulfiller usage and standard mempool monitoring; the bond is refunded, making capital needs minimal. Scenario 2 is timing-sensitive (medium), but the presence of Scenario 1 supports an overall high likelihood.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Scenario 1 (open-fulfiller theft): Buyer creates a non-tierable escrow selecting CommitRevealObligation as arbiter without constraining the recipient. Honest fulfiller reveals payload+salt without pre-commit. Attacker observes the reveal, posts a matching commitment keyed to themselves, mints their own reveal, waits one block, and collects the escrow as the recipient. The attacker then reclaims the bond; buyer’s funds are stolen and the honest fulfiller gets nothing.
#### Preconditions / Assumptions
- (a). Non-tierable escrow is used (fulfillment.refUID must equal escrow.uid).
- (b). Buyer selects CommitRevealObligation as arbiter and does not also restrict the recipient (open-fulfiller).
- (c). Honest fulfiller reveals without committing first.
- (d). Attacker can observe mempool/chain data and submit transactions within 1–2 blocks.
- (e). Bond amount is refundable on valid reveal (temporary capital lock only).

### Scenario 2.
Scenario 2 (theft despite honest commit-first): Buyer uses CommitRevealObligation without recipient constraints. Honest fulfiller commits first, then reveals. Attacker, after seeing the reveal, posts their own commitment and reveal and races to collect in the next block. Since the arbiter doesn’t bind commit-before-reveal or committer==recipient, the attacker can still collect first, misdirecting funds from the buyer and depriving the honest fulfiller.
#### Preconditions / Assumptions
- (a). Non-tierable escrow with CommitRevealObligation as arbiter and no recipient constraint (open-fulfiller).
- (b). Honest fulfiller commits first and then reveals.
- (c). Attacker can observe the reveal, quickly post their own commitment and reveal, and win the timing race to collect one block later.
- (d). Bond amount is refundable on valid reveal.

### Scenario 3.
Scenario 3 (recipient-bound weakening): Buyer composes arbiters to fix the recipient (e.g., via RecipientArbiter), preventing third-party theft. The intended recipient reveals first and only posts the commitment just before collection. Because the arbiter checks only commit-before-collection, not commit-before-reveal, the recipient avoids being economically bound pre-reveal, weakening the intended anti-front-running/commit–reveal guarantee.
#### Preconditions / Assumptions
- (a). Non-tierable escrow with CommitRevealObligation composed with an arbiter that fixes the recipient address.
- (b). Intended recipient reveals before committing.
- (c). Recipient later posts the matching commitment and collects after one block.
- (d). Bond amount is refundable on valid reveal.

#### Proposed fix

##### CommitRevealObligation.sol

File: `contracts/src/obligations/CommitRevealObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/CommitRevealObligation.sol)

```diff
 ... 152 unchanged lines ...
         if (info.committer == address(0)) {
             revert CommitmentMissing(revealedCommitment, obligation.recipient);
+        }        
+        if (info.committer != obligation.recipient) return false;
         }
 
         // Enforce commitment age to block same-block frontruns
         if (info.commitBlock >= block.number) {
             revert CommitmentTooRecent(revealedCommitment, obligation.recipient);
         }
 
+        if (info.commitTimestamp >= obligation.time) revert CommitmentTooRecent(revealedCommitment, obligation.recipient);
+
         return true;
     }
 
     // ---------------------------------------------------------------------
     // Bond reclaim
     // ---------------------------------------------------------------------
 
     /// @notice Returns the bond associated with a fulfilled attestation to its claimer.
     /// @param obligationUid UID of the fulfillment attestation (reveal).
     function reclaimBond(bytes32 obligationUid) external nonReentrant returns (uint256 amount) {
         Attestation memory obligation = _getAttestation(obligationUid);
 
         address claimer = obligation.recipient;
         bytes32 revealedCommitment = keccak256(
             abi.encode(obligation.refUID, claimer, keccak256(obligation.data))
         );
         CommitInfo memory info = commitments[revealedCommitment];
         if (info.committer == address(0)) revert CommitmentMissing(revealedCommitment, claimer);
-        if (info.commitBlock >= block.number) {
+        if (info.committer != claimer || info.commitTimestamp >= obligation.time) {
             revert CommitmentTooRecent(revealedCommitment, claimer);
         }
 ... 48 unchanged lines ...
```

#### Related findings

##### [Medium] Lack of minimum commit age (earlier-block-only check) in CommitRevealObligation causes cross-block copycat reveals and theft of escrowed assets

###### Description

CommitRevealObligation enforces only that a commitment’s block is strictly less than the reveal’s block, which blocks same-block copying but allows an attacker with transaction ordering power to insert a new commit in block N after learning the victim’s reveal, then reveal in block N+1 and collect the escrow first.

CommitRevealObligation records commitBlock = uint64(block.number) during commit() and, at reveal time in checkObligation(), only requires info.commitBlock < block.number. The commitment is keyed to the recipient, so an attacker can compute their own commitment for their address after observing the victim’s reveal inputs (payload+salt). If the attacker can cause the victim’s reveal to miss the current block while getting their own commit included in that block (e.g., via malicious/colluding sequencer or builder, or due to congestion/fee ordering), they can reveal in the next block and pass the earlier-block check. BaseEscrowObligation will then accept the attacker’s fulfillment and release escrowed assets to the attacker’s address, revoking the escrow. There is no minimum age (in blocks or time) requirement beyond not being the same block. The bond mechanism does not prevent this; the victim can still later reveal and reclaim their bond unless censored beyond commitDeadline, but the escrowed principal is already lost.

###### Severity

**Impact Explanation:** [High] Direct, material loss of escrowed principal funds to the attacker due to acceptance of a copycat reveal and subsequent escrow release to the attacker’s address.

**Likelihood Explanation:** [Low] Requires a malicious/compromised sequencer or builder/miner to reorder across blocks, or multiple independent external conditions (congestion and fee dynamics) to align so the victim’s reveal misses the block while the attacker’s commit lands first.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Malicious L2 sequencer theft: A buyer creates an escrow that uses CommitRevealObligation as the arbiter. The victim posts a valid commit (locking the bond) and then broadcasts their reveal. The malicious sequencer (with private mempool visibility) computes a new commitment for the attacker’s address using the victim’s payload+salt, includes the attacker’s commit in block N, withholds the victim’s reveal, and includes the attacker’s reveal in block N+1. The arbiter’s earlier-block check passes, BaseEscrowObligation revokes the escrow, and _releaseEscrow transfers assets to the attacker.
#### Preconditions / Assumptions
- (a). Escrow uses CommitRevealObligation as arbiter (encoded in escrow data).
- (b). Victim has posted a valid commitment for their own address and is about to reveal.
- (c). L2 sequencer has private mempool visibility and is malicious or compromised, able to delay/exclude the victim across a block boundary and include the attacker’s transactions.

### Scenario 2.
L1 builder/miner collusion: On a public-mempool chain, the attacker sees the victim’s reveal in the mempool, crafts a commitment for their own address, and a colluding builder/miner excludes the victim’s reveal from block N while including the attacker’s commit. In block N+1, the attacker’s reveal is included, passing the earlier-block check, and the escrow is collected by the attacker.
#### Preconditions / Assumptions
- (a). Escrow uses CommitRevealObligation as arbiter (encoded in escrow data).
- (b). Public mempool; attacker can observe victim’s reveal before inclusion.
- (c). Colluding or malicious block builder/miner can delay/exclude the victim’s reveal from block N and include the attacker’s commit in N, then attacker’s reveal in N+1.

### Scenario 3.
Opportunistic congestion-based theft: With a public mempool and near-full blocks, the attacker observes the victim’s reveal, submits a high-fee commit to land in block N while the victim’s lower-fee reveal spills to N+1 due to capacity. The attacker then submits a high-fee reveal in N+1. The arbiter’s earlier-block check succeeds, enabling the attacker to collect the escrow before the victim.
#### Preconditions / Assumptions
- (a). Escrow uses CommitRevealObligation as arbiter (encoded in escrow data).
- (b). Public mempool; attacker can observe victim’s reveal before inclusion.
- (c). Near-full blocks or fee-based ordering cause the victim’s reveal to miss block N while the attacker pays higher fees to include their commit in N and reveal in N+1.

###### Proposed fix

####### CommitRevealObligation.sol

File: `contracts/src/obligations/CommitRevealObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/CommitRevealObligation.sol)

```diff
 ... 53 unchanged lines ...
     /// @notice Seconds after commit within which the reveal must occur to avoid slashing.
     uint256 public commitDeadline;
+    uint256 private constant MIN_REVEAL_DELAY_SEC = 12;
     /// @notice Recipient of slashed bonds (address(0) = burn).
     address public slashedBondRecipient;
 ... 101 unchanged lines ...
             revert CommitmentTooRecent(revealedCommitment, obligation.recipient);
         }
+        if (uint256(info.commitTimestamp) + MIN_REVEAL_DELAY_SEC > obligation.time) revert CommitmentTooRecent(revealedCommitment, obligation.recipient);
 
         return true;
     }
 
     // ---------------------------------------------------------------------
     // Bond reclaim
     // ---------------------------------------------------------------------
 
     /// @notice Returns the bond associated with a fulfilled attestation to its claimer.
     /// @param obligationUid UID of the fulfillment attestation (reveal).
     function reclaimBond(bytes32 obligationUid) external nonReentrant returns (uint256 amount) {
         Attestation memory obligation = _getAttestation(obligationUid);
 
         address claimer = obligation.recipient;
         bytes32 revealedCommitment = keccak256(
             abi.encode(obligation.refUID, claimer, keccak256(obligation.data))
         );
         CommitInfo memory info = commitments[revealedCommitment];
         if (info.committer == address(0)) revert CommitmentMissing(revealedCommitment, claimer);
         if (info.commitBlock >= block.number) {
             revert CommitmentTooRecent(revealedCommitment, claimer);
         }
+        if (uint256(info.commitTimestamp) + MIN_REVEAL_DELAY_SEC > obligation.time) revert CommitmentTooRecent(revealedCommitment, claimer);
         if (commitmentClaimed[revealedCommitment]) revert BondAlreadyClaimed(revealedCommitment);
 
 ... 46 unchanged lines ...
```

##### [Critical] Ignoring demand/fulfilling UID and weak commit-age check in CommitRevealObligation enables theft of escrows

###### Description

CommitRevealObligation.checkObligation ignores demand and the fulfilling escrow UID, and only requires a prior commit relative to collection time. Because doObligation lets any caller mint a fulfillment with themselves as recipient, an attacker can forge a commit+reveal and collect another user’s escrow, both in non-tierable and tierable flows.

CommitRevealObligation.doObligation allows any caller to mint a fulfillment attestation under this arbiter’s schema with recipient = msg.sender. In checkObligation, the arbiter only verifies (1) the fulfillment’s schema/expiry/revocation via _checkIntrinsic and (2) that a prior commit exists for keccak256(abi.encode(obligation.refUID, obligation.recipient, keccak256(obligation.data))) with commitBlock < current block at collection time. It ignores both the demand bytes and the fulfilling escrow UID parameter. In non-tierable escrows, BaseEscrowObligation enforces fulfillment.refUID == escrow.uid, but the attacker controls refUID when minting the fulfillment and can set it to the target escrow. In tierable escrows, BaseEscrowObligationTierable intentionally does not enforce refUID equality, and CommitRevealObligation still ignores the fulfilling parameter, so a single attacker fulfillment can be reused to collect many escrows. In all cases, the collect flow pays to fulfillment.recipient, enabling theft because the attacker is the recipient of their own forged fulfillment. The commit-age check is also evaluated relative to the collection block, allowing even reveal-first, commit-later sequences to pass.

###### Severity

**Impact Explanation:** [High] Direct, material loss of principal escrowed assets (ERC20/ETH) from victims to the attacker.

**Likelihood Explanation:** [High] Public functions, minimal constraints, reclaimable bond, and strong attacker profit incentive; no rare states or external integrations required.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Non-tierable ERC20 escrow theft: A buyer creates a non-tierable ERC20 escrow selecting CommitRevealObligation as the arbiter. The attacker posts a commit for (refUID = escrow.uid, recipient = attacker, data = chosen payload/salt/schema), then mints a fulfillment via doObligation with refUID = escrow.uid (recipient = attacker), waits one block, and calls collectEscrow. BaseEscrowObligation enforces refUID equality (satisfied), CommitRevealObligation sees the prior commit and passes, and the escrow pays the ERC20 to the attacker.
#### Preconditions / Assumptions
- (a). A non-tierable ERC20 escrow exists that selects CommitRevealObligation as the sole arbiter (or only with non-binding arbiters).
- (b). The escrow is funded and uncollected.
- (c). Attacker can call commit, doObligation, and collectEscrow publicly.
- (d). BondAmount is posted by the attacker but is reclaimable after collection.

### Scenario 2.
Tierable ETH escrow sweep: Multiple buyers create tierable native token escrows that select CommitRevealObligation. The attacker posts one commit and mints one fulfillment (recipient = attacker). For each open escrow, the attacker calls collectEscrow with the same fulfillment. The tierable wrapper does not enforce refUID equality and CommitRevealObligation ignores fulfilling and demand, so each escrow pays its ETH to the attacker.
#### Preconditions / Assumptions
- (a). Multiple tierable native token escrows exist that select CommitRevealObligation as the sole arbiter (or only with non-binding arbiters).
- (b). Each escrow is funded and uncollected.
- (c). Attacker can call commit, doObligation, and collectEscrow publicly.
- (d). A single commitment and fulfillment can be reused across multiple tierable escrows.

### Scenario 3.
Commit-after-reveal theft (non-tierable): A buyer creates a non-tierable native token escrow selecting CommitRevealObligation. The attacker first mints a fulfillment to themselves with refUID = escrow.uid, then later posts the matching commit, and finally collects. Because CommitRevealObligation only checks commitBlock < current block at collection time (not commit-before-reveal), the check passes and the escrowed ETH is paid to the attacker.
#### Preconditions / Assumptions
- (a). A non-tierable native token escrow exists that selects CommitRevealObligation as the sole arbiter (or only with non-binding arbiters).
- (b). The escrow is funded and uncollected.
- (c). Attacker can mint a fulfillment before committing, then commit, then collect, exploiting the commit-age check relative to collection time.

###### Proposed fix

####### CommitRevealObligation.sol

File: `contracts/src/obligations/CommitRevealObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/CommitRevealObligation.sol)

```diff
 ... 91 unchanged lines ...
     // ---------------------------------------------------------------------
 
+    // SECURITY NOTE:
+    // As implemented, doObligation allows any caller to mint a fulfillment to themselves.
+    // Safe usage requires recipient/escrow binding to be enforced in checkObligation (see below).
     /// @notice Creates a fulfillment attestation containing the payload and salt.
     /// @param data Revealed data (must match a prior commit) and salt.
 ... 41 unchanged lines ...
     // ---------------------------------------------------------------------
 
+    // SECURITY NOTE:
+    // This arbiter currently ignores 'demand' and 'fulfilling' and only checks for a prior commit.
+    // To make this safe as a standalone arbiter, implement:
+    //  - recipient/escrow binding from 'demand' (e.g., authorized recipient, optional bind to 'fulfilling'),
+    //  - commit-before-reveal: require(info.commitTimestamp < obligation.time),
+    //  - or enforce composition with a binding arbiter if not performing recipient binding here.
     /// @inheritdoc IArbiter
     function checkObligation(
         Attestation memory obligation,
         bytes memory /* demand (unused) */,
         bytes32 /* fulfilling (unused) */
     ) public view override returns (bool) {
         // Basic attestation sanity checks (schema + expiry + revocation)
         obligation._checkIntrinsic(ATTESTATION_SCHEMA);
 
         // Lookup the prior commitment for the fulfiller
         bytes32 revealedCommitment = keccak256(
             abi.encode(obligation.refUID, obligation.recipient, keccak256(obligation.data))
         );
         CommitInfo memory info = commitments[revealedCommitment];
         if (info.committer == address(0)) {
             revert CommitmentMissing(revealedCommitment, obligation.recipient);
         }
 
+        // TODO: Enforce commit-before-reveal: require(info.commitTimestamp < obligation.time);
         // Enforce commitment age to block same-block frontruns
         if (info.commitBlock >= block.number) {
 ... 72 unchanged lines ...
```

### 3. [Critical] Unvalidated fulfillment and escrow binding in splitter arbiters and NativeTokenSplitter.collectAndDistribute causes theft of escrowed assets and ETH drain

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Splitter arbiters only check a stored decision flag and ignore fulfillment details; escrows then release to fulfillment.recipient. NativeTokenSplitter.collectAndDistribute also trusts any attestation and arbitrary escrowContract, enabling direct theft of escrowed funds and draining of any ETH held by the splitter.

The splitter arbiters (NativeTokenSplitter, ERC20Splitter, ERC1155Splitter, TokenBundleSplitterBase and derivatives) implement checkObligation by returning a stored yes/no decision keyed by (escrow UID, demand, oracle), ignoring the fulfillment attestation entirely (including recipient, schema, attester, refUID). All escrow contracts rely on the arbiter and then send funds/tokens to fulfillment.recipient upon success (BaseEscrowObligation[+Tierable] -> _releaseEscrow). Therefore, once the oracle posts a decision, anyone can fabricate a fulfillment attestation (for non-tierable escrows, refUID = escrow.uid) and call the real escrow contract to release the escrow directly to themselves, bypassing the split logic. Separately, NativeTokenSplitter.collectAndDistribute does not validate that the provided escrow attestation uses the correct schema/attester or that the escrowContract is genuine, and it does not verify any ETH receipt prior to distribution; it will distribute from its own balance based on stored splits. This enables draining any stray ETH held by the splitter by pairing a fake attestation with a malicious escrow contract whose collectEscrow returns true without sending ETH.

#### Severity

**Impact Explanation:** [High] Direct, material loss of principal escrowed funds/tokens by releasing value to an attacker instead of via intended splits; additionally, any ETH held by the splitter can be drained.

**Likelihood Explanation:** [High] For escrow-drain scenarios, once an oracle decision exists, exploitation needs no special constraints and is publicly callable with clear incentive. The ETH-drain variant requires a less common precondition (splitter holding ETH), but overall the highest-likelihood scenarios are common under intended usage.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
NativeTokenEscrowObligation (non-tierable) used with NativeTokenSplitter as arbiter: after the trusted oracle posts a decision for an escrow, an attacker creates a fulfillment attestation with refUID = escrow.uid and recipient = attacker, then calls the real escrow contract's collectEscrow. NativeTokenSplitter.checkObligation returns true (ignores fulfillment recipient), and the escrow releases ETH to the attacker instead of via the splitter and intended splits.
#### Preconditions / Assumptions
- (a). Buyer uses NativeTokenSplitter as the arbiter for a NativeTokenEscrowObligation (non-tierable).
- (b). Trusted oracle posts a decision for that (escrow UID, demand).
- (c). EAS standard behavior: anyone can create a fulfillment attestation; non-tierable refUID must equal the escrow UID and can be set by anyone.

### Scenario 2.
ERC20/1155/TokenBundle escrows used with their corresponding splitter arbiters: after the trusted oracle posts a decision, an attacker crafts a fulfillment attestation (non-tierable: refUID = escrow.uid; tierable: no refUID needed) with recipient = attacker and calls the real escrow contract's collectEscrow. The splitter arbiter returns true and the escrow transfers the escrowed tokens/assets directly to the attacker, bypassing splits.
#### Preconditions / Assumptions
- (a). Buyer uses the corresponding splitter arbiter (ERC20Splitter, ERC1155Splitter, TokenBundleSplitter/Unvalidated) for the matching escrow type.
- (b). Trusted oracle posts a decision for that (escrow UID, demand).
- (c). EAS standard behavior: attacker can create a fulfillment attestation; for non-tierable escrows, refUID must equal escrow UID; tierable escrows do not require refUID linkage.

### Scenario 3.
NativeTokenSplitter (or TokenBundleSplitterBase) holds non-zero ETH. An attacker creates a fake EAS attestation shaped like an escrow (demand.oracle = attacker, amount = X <= splitter balance), posts splits via arbitrate, and calls collectAndDistribute with a malicious escrow contract whose collectEscrow does nothing but return true. The splitter then distributes X ETH from its own balance to the attacker-controlled recipients.
#### Preconditions / Assumptions
- (a). NativeTokenSplitter or TokenBundleSplitterBase currently has a non-zero ETH balance not sourced from the attacker (e.g., accidental transfer or forced ETH).
- (b). Attacker can create arbitrary EAS attestations and deploy a malicious escrow-like contract that implements collectEscrow and returns true without sending ETH.

#### Proposed fix

##### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 139 unchanged lines ...
     /// @inheritdoc IArbiter
     function checkObligation(
-        Attestation memory,
+        Attestation memory fulfillment,
         bytes memory demand,
         bytes32 fulfilling
     ) public view override returns (bool) {
+        if (fulfillment.recipient != address(this)) return false;
         DemandData memory demandData = abi.decode(demand, (DemandData));
         bytes32 decisionKey = keccak256(
 ... 114 unchanged lines ...
```

##### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 144 unchanged lines ...
     /// @inheritdoc IArbiter
     function checkObligation(
-        Attestation memory,
+        Attestation memory fulfillment,
         bytes memory demand,
         bytes32 fulfilling
     ) public view override returns (bool) {
+        if (fulfillment.recipient != address(this)) return false;
         DemandData memory demandData = abi.decode(demand, (DemandData));
         bytes32 decisionKey = keccak256(
 ... 109 unchanged lines ...
```

##### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 144 unchanged lines ...
     /// @inheritdoc IArbiter
     function checkObligation(
-        Attestation memory,
+        Attestation memory fulfillment,
         bytes memory demand,
         bytes32 fulfilling
     ) public view override returns (bool) {
+        if (fulfillment.recipient != address(this)) return false;
         DemandData memory demandData = abi.decode(demand, (DemandData));
         bytes32 decisionKey = keccak256(
 ... 112 unchanged lines ...
```

##### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 157 unchanged lines ...
     /// @inheritdoc IArbiter
     function checkObligation(
-        Attestation memory,
+        Attestation memory fulfillment,
         bytes memory demand,
         bytes32 fulfilling
     ) public view override returns (bool) {
+        if (fulfillment.recipient != address(this)) return false;
         DemandData memory demandData = abi.decode(demand, (DemandData));
         bytes32 decisionKey = keccak256(
 ... 144 unchanged lines ...
```

#### Related findings

##### [Critical] Weak arbiter fulfillment validation in Splitter arbiters with EscrowObligations causes theft of escrowed assets

###### Description

Splitter arbiters (TokenBundleSplitterBase/TokenBundleSplitter, ERC20Splitter, ERC1155Splitter, NativeTokenSplitter) authorize escrow collection solely via a stored decision flag and ignore the fulfillment attestation’s schema/attester/contents. Escrow obligations then pay directly to fulfillment.recipient, allowing any caller to craft a fulfillment and drain the escrow to themselves after the oracle arbitrates.

Escrow contracts (both BaseEscrowObligation and BaseEscrowObligationTierable variants) call IArbiter.checkObligation(fulfillment, demand, escrow.uid) and, on success, transfer all escrowed assets to fulfillment.recipient in _releaseEscrow. The Splitter arbiters’ checkObligation implementations (TokenBundleSplitterBase, ERC20Splitter, ERC1155Splitter, NativeTokenSplitter) only verify that hasDecision[oracle][keccak256(fulfilling, demand)] is true and do not validate the fulfillment attestation’s schema, attester, contents, or recipient. After an oracle posts a decision for an escrow (normal operation), any third party can create an arbitrary fulfillment attestation and call the public collectEscrow function to have the escrowed assets transferred directly to their chosen recipient. For non-tierable escrows, the attacker sets fulfillment.refUID = escrow.uid; for tierable escrows, no refUID linkage is required. This bypasses the intended collect-and-distribute flow and results in direct theft of the escrowed assets.

###### Severity

**Impact Explanation:** [High] Direct, material loss of principal funds: the entire escrowed assets can be transferred to an attacker by bypassing distribution.

**Likelihood Explanation:** [High] No special constraints beyond normal operation: once the oracle arbitrates, any party can create a fulfillment attestation and call a public function to steal funds.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Non-tierable TokenBundleEscrowObligation with TokenBundleSplitter: After the trusted oracle arbitrates, an attacker creates any EAS attestation with refUID = escrow.uid and recipient = attacker, then calls collectEscrow; checkObligation returns true based on the decision flag, and the escrow contract transfers the entire bundle to the attacker.
#### Preconditions / Assumptions
- (a). An escrow is created using TokenBundleEscrowObligation (non-tierable) with arbiter set to TokenBundleSplitter and a trusted oracle encoded in demand
- (b). The oracle has arbitrated and set a decision for (escrow.uid, demand)
- (c). The attacker can create an EAS attestation with refUID = escrow.uid and recipient = attacker
- (d). The attacker can call the public collectEscrow function on the escrow contract

### Scenario 2.
Tierable TokenBundleEscrowObligation with TokenBundleSplitter: After arbitration, an attacker creates any EAS attestation (no refUID linkage required) with recipient = attacker and calls collectEscrow; checkObligation returns true, and the escrow contract transfers the entire bundle to the attacker.
#### Preconditions / Assumptions
- (a). An escrow is created using TokenBundleEscrowObligation (tierable) with arbiter set to TokenBundleSplitter and a trusted oracle encoded in demand
- (b). The oracle has arbitrated and set a decision for (escrow.uid, demand)
- (c). The attacker can create any EAS attestation (no refUID linkage required) with recipient = attacker
- (d). The attacker can call the public collectEscrow function on the escrow contract

### Scenario 3.
ERC20EscrowObligation with ERC20Splitter (similarly ERC1155/Native): After arbitration, an attacker creates an EAS attestation (for non-tierable: refUID = escrow.uid) with recipient = attacker and calls collectEscrow; checkObligation returns true, and the ERC20 (or ERC1155/ETH) is transferred to the attacker.
#### Preconditions / Assumptions
- (a). An escrow is created using ERC20EscrowObligation (or ERC1155/Native) with arbiter set to the corresponding Splitter and a trusted oracle encoded in demand
- (b). The oracle has arbitrated and set a decision for (escrow.uid, demand)
- (c). For non-tierable: the attacker can create an EAS attestation with refUID = escrow.uid and recipient = attacker (tierable variants require no refUID linkage)
- (d). The attacker can call the public collectEscrow function on the escrow contract

###### Proposed fix

####### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 157 unchanged lines ...
     /// @inheritdoc IArbiter
     function checkObligation(
-        Attestation memory,
+        Attestation memory fulfillment,
         bytes memory demand,
         bytes32 fulfilling
     ) public view override returns (bool) {
         DemandData memory demandData = abi.decode(demand, (DemandData));
+        if (fulfillment.attester != demandData.oracle || fulfillment.recipient != address(this)) return false;
         bytes32 decisionKey = keccak256(
             abi.encodePacked(fulfilling, demand)
 ... 143 unchanged lines ...
```

####### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 144 unchanged lines ...
     /// @inheritdoc IArbiter
     function checkObligation(
-        Attestation memory,
+        Attestation memory fulfillment,
         bytes memory demand,
         bytes32 fulfilling
     ) public view override returns (bool) {
         DemandData memory demandData = abi.decode(demand, (DemandData));
+        if (fulfillment.attester != demandData.oracle || fulfillment.recipient != address(this)) return false;
         bytes32 decisionKey = keccak256(
             abi.encodePacked(fulfilling, demand)
 ... 108 unchanged lines ...
```

####### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 144 unchanged lines ...
     /// @inheritdoc IArbiter
     function checkObligation(
-        Attestation memory,
+        Attestation memory fulfillment,
         bytes memory demand,
         bytes32 fulfilling
     ) public view override returns (bool) {
         DemandData memory demandData = abi.decode(demand, (DemandData));
+        if (fulfillment.attester != demandData.oracle || fulfillment.recipient != address(this)) return false;
         bytes32 decisionKey = keccak256(
             abi.encodePacked(fulfilling, demand)
 ... 111 unchanged lines ...
```

####### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 139 unchanged lines ...
     /// @inheritdoc IArbiter
     function checkObligation(
-        Attestation memory,
+        Attestation memory fulfillment,
         bytes memory demand,
         bytes32 fulfilling
     ) public view override returns (bool) {
         DemandData memory demandData = abi.decode(demand, (DemandData));
+        if (fulfillment.attester != demandData.oracle || fulfillment.recipient != address(this)) return false;
         bytes32 decisionKey = keccak256(
             abi.encodePacked(fulfilling, demand)
 ... 113 unchanged lines ...
```

####### TrustedOracleArbiter.sol

File: `contracts/src/arbiters/TrustedOracleArbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/TrustedOracleArbiter.sol)

```diff
 ... 57 unchanged lines ...
     ) public view override returns (bool) {
         DemandData memory demand_ = abi.decode(demand, (DemandData));
+        if (obligation.attester != demand_.oracle) return false;
         bytes32 decisionKey = keccak256(abi.encodePacked(obligation.uid, demand_.data));
         return decisions[demand_.oracle][decisionKey];
     }
 
     function decodeDemandData(
         bytes calldata data
     ) public pure returns (DemandData memory) {
         return abi.decode(data, (DemandData));
     }
 }
```

### 4. [High] Lack of non-empty validation in AllArbiter DemandData causes unconditional escrow release and asset theft

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

AllArbiter returns true when given empty child arbiter and demand arrays. Since escrow obligations accept arbitrary (arbiter, demand) at creation and rely solely on the arbiter’s verdict to release funds, a malicious or compromised UI/integration can configure AllArbiter with empty arrays, enabling anyone to craft a fulfillment attestation and steal escrowed assets.

The AllArbiter contract decodes DemandData and reverts only on array length mismatch. If arbiters.length == demands.length == 0, the iteration is skipped and checkObligation returns true. Escrow obligations (tierable and non-tierable variants) extract the arbiter and demand from user-supplied data and then call arbiter.checkObligation to authorize release. Non-tierable escrows also require fulfillment.refUID == escrow.uid; tierable escrows intentionally omit this linkage. EAS permits any account to create attestations under arbitrary schemas and to reference any existing UID as refUID. Therefore, when a malicious or compromised UI/integration configures AllArbiter with empty arrays, the arbiter check is vacuously true, allowing any attacker to submit a fulfillment attestation and receive the escrowed assets as the fulfillment.recipient.

#### Severity

**Impact Explanation:** [High] Direct, material loss of principal funds: escrowed assets are released to the attacker’s address as fulfillment.recipient.

**Likelihood Explanation:** [Medium] Exploitation requires a malicious or compromised UI/integration (or misconfiguration) at escrow creation to encode AllArbiter with empty arrays; once present, anyone can cheaply and reliably exploit by submitting a trivial fulfillment attestation.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Tierable ERC20 escrow: A malicious UI creates an escrow with arbiter = AllArbiter and demand encoding empty arrays. An attacker then creates any fulfillment attestation (no refUID linkage required) and calls collectEscrow, causing the escrowed ERC20 to be transferred to the attacker.
#### Preconditions / Assumptions
- (a). Tierable ERC20EscrowObligation is deployed and operational
- (b). AllArbiter is deployed and callable
- (c). A malicious or compromised UI/integration configures the escrow with arbiter = AllArbiter and demand encoding empty arrays
- (d). Buyer creates the escrow and funds are locked
- (e). EAS allows open schema registration and attestations by any account

### Scenario 2.
Non-tierable ERC20 escrow: A malicious UI creates an escrow with arbiter = AllArbiter and demand encoding empty arrays. An attacker creates a fulfillment attestation with refUID set to the escrow UID (EAS allows referencing any existing UID) and calls collectEscrow, receiving the escrowed ERC20.
#### Preconditions / Assumptions
- (a). Non-tierable ERC20EscrowObligation is deployed and operational
- (b). AllArbiter is deployed and callable
- (c). A malicious or compromised UI/integration configures the escrow with arbiter = AllArbiter and demand encoding empty arrays
- (d). Buyer creates the escrow and funds are locked
- (e). EAS allows open schema registration and attestations by any account, and permits refUID to reference any existing UID

### Scenario 3.
Non-tierable TokenBundle escrow: A malicious UI creates a bundle escrow (ETH, ERC20, ERC721, ERC1155) with arbiter = AllArbiter and empty arrays in demand. The attacker creates a fulfillment attestation with refUID = escrow UID and calls collectEscrow, receiving all escrowed assets in the bundle.
#### Preconditions / Assumptions
- (a). Non-tierable TokenBundleEscrowObligation is deployed and operational
- (b). AllArbiter is deployed and callable
- (c). A malicious or compromised UI/integration configures the escrow with arbiter = AllArbiter and demand encoding empty arrays
- (d). Buyer creates the escrow and assets are locked (ETH, ERC20, ERC721, ERC1155 as applicable)
- (e). EAS allows open schema registration and attestations by any account, and permits refUID to reference any existing UID

#### Proposed fix

##### AllArbiter.sol

File: `contracts/src/arbiters/logical/AllArbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/logical/AllArbiter.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {Attestation} from "@eas/Common.sol";
 import {IArbiter} from "../../IArbiter.sol";
 import {ArbiterUtils} from "../../ArbiterUtils.sol";
 
 contract AllArbiter is IArbiter {
     // validates all base arbiters arbitrate true
     struct DemandData {
         address[] arbiters;
         bytes[] demands;
     }
 
     error MismatchedArrayLengths();
+    error EmptyArbitersList();
 
     function checkObligation(
         Attestation memory obligation,
         bytes memory demand,
         bytes32 fulfilling
     ) public view override returns (bool) {
         DemandData memory demand_ = abi.decode(demand, (DemandData));
         if (demand_.arbiters.length != demand_.demands.length)
             revert MismatchedArrayLengths();
+        if (demand_.arbiters.length == 0)
+            revert EmptyArbitersList();
 
         for (uint256 i = 0; i < demand_.arbiters.length; i++) {
 ... 21 unchanged lines ...
```

### 5. [High] Unconstrained external validationRegistry in ERC8004Arbiter causes unauthorized escrow release

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

ERC8004Arbiter decodes a validationRegistry address from untrusted demand bytes and fully trusts its getValidationStatus response without on-chain allowlisting, code checks, or failure handling. A malicious or misconfigured UI can set an attacker-controlled registry that always returns a passing result, enabling unauthorized escrow release to the attacker. A bad registry can also revert and block collection (indefinitely if the escrow never expires).

In BaseEscrowObligation.collectEscrowRaw, the escrow’s arbiter and demand are extracted from buyer-supplied escrow data and IArbiter(arbiter).checkObligation is called to authorize release. ERC8004Arbiter.checkObligation ABI-decodes DemandData(validationRegistry, validatorAddress, minResponse) from untrusted demand and enforces that fulfillment.refUID matches the escrow. It then calls IValidationRegistry(demand.validationRegistry).getValidationStatus(obligation.uid) and accepts the result if validatorAddress equals demand.validatorAddress and response >= minResponse. There is no on-chain allowlist, code-size/interface check, signature verification of validator output, or try/catch. Thus, a malicious or misconfigured UI can encode an attacker-controlled registry in demand to always return a passing validatorAddress/response, causing checkObligation to return true and BaseEscrowObligation to release escrowed assets to fulfillment.recipient (chosen by the attacker). If the registry is invalid or reverts, collection reverts with no fallback, creating a DoS (temporary if the escrow expires; indefinite if it never expires).

#### Severity

**Impact Explanation:** [High] Unauthorized release of escrowed ETH/tokens constitutes direct, material loss of principal; a never-expiring escrow with an invalid registry can cause indefinite freezing of funds.

**Likelihood Explanation:** [Medium] Exploitation depends on a malicious or misconfigured UI/integration steering the buyer to use a bad registry; this is plausible and in scope but not guaranteed in all deployments.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
ETH theft: A buyer uses a malicious/misconfigured UI to create a NativeTokenEscrowObligation escrow where arbiter=ERC8004Arbiter and demand.validationRegistry=attackerRegistry; attackerRegistry always returns a passing validatorAddress/response. The attacker creates a fulfillment attestation referencing the escrow and sets recipient=attacker. collectEscrow succeeds and transfers the escrowed ETH to the attacker.
#### Preconditions / Assumptions
- (a). Buyer uses a UI/integration that sets arbiter=ERC8004Arbiter and encodes an attacker-controlled validationRegistry and permissive minResponse in demand
- (b). Attacker deploys a registry contract that always returns validatorAddress matching demand and response >= minResponse
- (c). Attacker can submit an EAS attestation (any permissive schema) with refUID set to the escrow uid and recipient set to the attacker
- (d). NativeTokenEscrowObligation holds the buyer’s ETH in escrow

### Scenario 2.
ERC20 theft: A buyer uses a malicious/misconfigured UI to create an ERC20EscrowObligation escrow (tierable or non-tierable) with arbiter=ERC8004Arbiter and an attacker-controlled registry in demand. The attacker mints a fulfillment attestation referencing the escrow and calls collectEscrow; the escrowed tokens are transferred to the attacker.
#### Preconditions / Assumptions
- (a). Buyer uses a UI/integration that sets arbiter=ERC8004Arbiter and encodes an attacker-controlled validationRegistry and permissive minResponse in demand
- (b). Attacker deploys a registry contract that always returns validatorAddress matching demand and response >= minResponse
- (c). Attacker can submit an EAS attestation (any permissive schema) with refUID set to the escrow uid and recipient set to the attacker
- (d). ERC20EscrowObligation holds the buyer’s tokens in escrow; token follows standard ERC20 behavior

### Scenario 3.
Collection DoS: A buyer creates an escrow using ERC8004Arbiter with a bad validationRegistry (EOA/zero address/reverting contract). Any subsequent collectEscrow reverts due to the external call failing. If expirationTime=0, funds are indefinitely frozen; if expirationTime>0, funds are frozen until expiry, after which the buyer can reclaim.
#### Preconditions / Assumptions
- (a). Buyer (via UI/integration) sets arbiter=ERC8004Arbiter with demand.validationRegistry as an invalid or reverting address
- (b). A legitimate fulfill attempt is made by submitting a fulfillment attestation referencing the escrow
- (c). For indefinite freeze: escrow is created with expirationTime=0
- (d). For temporary freeze: escrow has a finite expiration

#### Proposed fix

##### ERC8004Arbiter.sol

File: `contracts/src/arbiters/ERC8004Arbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/ERC8004Arbiter.sol)

```diff
 ... 42 unchanged lines ...
     error ValidatorMismatch();
     error FulfillmentMustReferenceEscrow();
+    error InvalidRegistry();
 
+    address public immutable VALIDATION_REGISTRY;
+
+    constructor(address validationRegistry_) {
+        if (validationRegistry_.code.length == 0) revert InvalidRegistry();
+        VALIDATION_REGISTRY = validationRegistry_;
+    }
+
     /**
      * @notice Check if the validation response meets the minimum requirement
 ... 22 unchanged lines ...
         // Query the ValidationRegistry
         IValidationRegistry registry = IValidationRegistry(
-            demand_.validationRegistry
+            VALIDATION_REGISTRY
         );
         (
 ... 33 unchanged lines ...
```

#### Related findings

##### [Medium] Unchecked external call to user-supplied registry in ERC8004Arbiter causes escrow settlement DoS and potential permanent fund lock

###### Description

ERC8004Arbiter calls a registry address supplied in demand without validating code existence or handling errors. If this address is an EOA or incompatible/malicious contract, checkObligation reverts and bubbles up through collectEscrow, blocking settlement. With expirationTime = 0, funds can be locked permanently; with nonzero expiry, funds are frozen until expiry. This primarily stems from user misconfiguration or UI/social engineering that leads the buyer to select a bad registry.

In ERC8004Arbiter.checkObligation, the demand-encoded validationRegistry address is used to call getValidationStatus without verifying that the address has code and without try/catch. If the address is an EOA or a contract that reverts or returns malformed data, the call reverts. BaseEscrowObligation.collectEscrowRaw (and the tierable variant) invokes the arbiter’s checkObligation without try/catch and reverts on failure, so the revert from ERC8004Arbiter blocks settlement. If the escrow was created with expirationTime = 0, reclaimExpired is unavailable and the funds are permanently locked; with a finite expiration, funds remain frozen until expiry when reclaimExpired returns them to the buyer. Using AllArbiter preserves the revert and blocks collection; using AnyArbiter can mitigate only if chosen and at least one other arbiter returns true. The issue is mainly a user misconfiguration/UI-manipulation risk because the buyer chooses the registry and expiry.

###### Severity

**Impact Explanation:** [High] In scenarios with expirationTime = 0, funds can be permanently locked with no reclaim path, satisfying the high-impact condition of funds blocked for longer than a week with no workaround.

**Likelihood Explanation:** [Low] Exploitation requires user misconfiguration or UI/social engineering to select a bad registry address in demand and (for permanent lock) choosing no expiry; users are assumed competent and these are buyer-controlled parameters.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Permanent lock of ERC20 escrow: Buyer configures ERC8004Arbiter demand with an EOA or incompatible registry address and sets expirationTime = 0. Upon collection, ERC8004Arbiter’s external call reverts, bubbling up to collectEscrow and making funds permanently uncollectable with no reclaim path.
#### Preconditions / Assumptions
- (a). Buyer selects ERC8004Arbiter as the escrow arbiter
- (b). DemandData.validationRegistry is an EOA or an incompatible/reverting contract
- (c). Escrow created with expirationTime = 0 (no expiry)
- (d). A fulfillment attestation referencing the escrow is provided
- (e). collectEscrowRaw is called to settle

### Scenario 2.
Temporary freeze of native-token escrow: Buyer configures ERC8004Arbiter demand with a bad registry address and sets a nonzero expiration. Collection reverts due to the failed external call; funds remain frozen until expiration, after which reclaimExpired returns funds to the buyer.
#### Preconditions / Assumptions
- (a). Buyer selects ERC8004Arbiter as the escrow arbiter
- (b). DemandData.validationRegistry is an EOA or an incompatible/reverting contract
- (c). Escrow created with expirationTime > 0 (finite expiry)
- (d). A fulfillment attestation referencing the escrow is provided
- (e). collectEscrowRaw is called to settle

### Scenario 3.
Permanent lock via AllArbiter composition: Buyer uses AllArbiter including a misconfigured ERC8004Arbiter leg and sets expirationTime = 0. The failing ERC8004Arbiter call reverts; AllArbiter does not catch it, so collectEscrow reverts and funds are permanently locked.
#### Preconditions / Assumptions
- (a). Buyer selects AllArbiter as the escrow arbiter with multiple base arbiters including ERC8004Arbiter
- (b). ERC8004Arbiter’s demand includes an EOA or incompatible/reverting registry address
- (c). Escrow created with expirationTime = 0 (no expiry)
- (d). A fulfillment attestation is provided
- (e). collectEscrowRaw is called to settle

###### Proposed fix

####### BaseEscrowObligation.sol

File: `contracts/src/BaseEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligation.sol)

```diff
 ... 33 unchanged lines ...
         bool revocable
     ) BaseObligation(_eas, _schemaRegistry, schema, revocable) {}
+    function onAttest(Attestation calldata attestation, uint256) internal view override returns (bool) {
+        return super.onAttest(attestation, 0) && attestation.expirationTime != 0;
+    }
 
     // Abstract methods that escrow types must implement
 ... 143 unchanged lines ...
```

####### BaseEscrowObligationTierable.sol

File: `contracts/src/BaseEscrowObligationTierable.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligationTierable.sol)

```diff
 ... 33 unchanged lines ...
         bool revocable
     ) BaseObligation(_eas, _schemaRegistry, schema, revocable) {}
+    function onAttest(Attestation calldata attestation, uint256) internal view override returns (bool) {
+        return super.onAttest(attestation, 0) && attestation.expirationTime != 0;
+    }
 
     // Abstract methods that escrow types must implement
 ... 143 unchanged lines ...
```

### 6. [High] Missing fulfillment liveness checks in confirmation arbiters and escrow collection causes unauthorized escrow release via stale confirmations

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Confirmation arbiters only record a (fulfillmentUID, escrowUID) confirmation and never re-validate that the fulfillment attestation remains live (not expired/revoked). Base escrow collection validates only the escrow attestation and relies on the arbiter for fulfillment validity. As a result, a once-confirmed fulfillment can later be expired/revoked yet still be accepted to collect the buyer’s escrow, enabling loss of principal, especially with unrevocable confirmation variants.

The four confirmation arbiters (Exclusive/Nonexclusive × Revocable/Unrevocable) store a boolean confirmation keyed by (fulfillment UID, escrow UID) and their checkObligation() returns that mapping entry without checking fulfillment liveness (no expiration/revocation validation via ArbiterUtils._checkIntrinsic). BaseEscrowObligation and BaseEscrowObligationTierable only validate the escrow attestation’s schema and intrinsic liveness, then fully defer fulfillment validation to the specified arbiter. EAS.getAttestation returns attestations regardless of revocation/expiration, so without an explicit liveness check, stale fulfillments remain acceptable if previously confirmed. In deployments that use a confirmation arbiter by itself, this allows a seller to obtain a one-time confirmation, then let the fulfillment attestation expire or be revoked (e.g., by reclaiming a short-expiring seller-side escrow) and still collect the buyer’s escrow. Unrevocable confirmation variants prevent the buyer from clearing stale confirmations after the fact. While the architecture supports mitigation by composing arbiters (e.g., AllArbiter + IntrinsicsArbiter, or property arbiters enforcing non-expiring/irrevocable fulfillments), the absence of such composition leaves a clear path to principal loss.

#### Severity

**Impact Explanation:** [High] Direct, material loss of principal funds: a stale, once-confirmed fulfillment can still release the buyer’s escrow to the attacker.

**Likelihood Explanation:** [Medium] Exploitation depends on integrators choosing a confirmation-only arbiter and users issuing a one-time confirmation, which are plausible integration choices but not attacker-controlled; no rare states or user negligence are required beyond those choices.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Unrevocable confirmation, non-tierable ERC20 escrow: A buyer escrows ERC20 via ERC20EscrowObligation using ExclusiveUnrevocableConfirmationArbiter as the only arbiter. The attacker creates a fulfillment attestation referencing the buyer’s escrow with a short expiration and gets the buyer to confirm it once. After it expires, the attacker reclaims their temporarily locked asset and then calls collectEscrowRaw with the stale fulfillment. The arbiter returns true based on stored confirmation without checking liveness, and the buyer’s escrow is released to the attacker.
#### Preconditions / Assumptions
- (a). Deployment uses a confirmation-only unrevocable arbiter (e.g., ExclusiveUnrevocableConfirmationArbiter) for the escrow.
- (b). No IntrinsicsArbiter or equivalent liveness enforcement is composed via AllArbiter.
- (c). Buyer creates a non-tierable escrow attestation and later confirms a specific fulfillment once.
- (d). Attacker can create a fulfillment attestation referencing the escrow with a short expiration and later reclaim it (causing revocation/invalidity).
- (e). CollectEscrowRaw is public and will rely on arbiter.checkObligation for fulfillment validity.

### Scenario 2.
Unrevocable confirmation, tierable escrow with reuse: Multiple buyers use a tierable escrow with NonexclusiveUnrevocableConfirmationArbiter as the only arbiter. The attacker creates one fulfillment attestation (short expiration), obtains a separate confirmation for (F, Ei) from each buyer’s escrow, then lets the fulfillment expire or be revoked and calls collectEscrowRaw(Ei, F) for each. Tierable collection does not enforce refUID linking and the arbiter accepts the stored confirmations without liveness checks, releasing each buyer’s escrow to the attacker.
#### Preconditions / Assumptions
- (a). Deployment uses a confirmation-only unrevocable arbiter (e.g., NonexclusiveUnrevocableConfirmationArbiter) with a tierable escrow.
- (b). No IntrinsicsArbiter or equivalent liveness enforcement is composed via AllArbiter.
- (c). Multiple buyers independently confirm the same fulfillment F for their escrows (each (F, Ei) is confirmed).
- (d). Attacker can let F become invalid (expire/revoke) before calling collectEscrowRaw on each escrow.
- (e). Tierable collection does not require fulfillment.refUID == escrow.uid.

### Scenario 3.
Revocable confirmation, race before buyer revokes: A buyer uses a revocable confirmation arbiter alone. The attacker creates and gets a one-time confirmation for a fulfillment that later becomes invalid (expired/revoked), and immediately calls collectEscrowRaw before the buyer revokes the confirmation. The arbiter accepts the stored confirmation without liveness checks, releasing the buyer’s escrow to the attacker if the attacker wins the race.
#### Preconditions / Assumptions
- (a). Deployment uses a confirmation-only revocable arbiter (ExclusiveRevocableConfirmationArbiter or NonexclusiveRevocableConfirmationArbiter).
- (b). No IntrinsicsArbiter or equivalent liveness enforcement is composed via AllArbiter.
- (c). Buyer confirms the fulfillment once.
- (d). Attacker invalidates the fulfillment (expired/revoked) and quickly calls collectEscrowRaw before the buyer revokes the confirmation.
- (e). No guaranteed monitoring infrastructure is assumed for automatic buyer revocation.

#### Proposed fix

##### ExclusiveUnrevocableConfirmationArbiter.sol

File: `contracts/src/arbiters/confirmation/ExclusiveUnrevocableConfirmationArbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/confirmation/ExclusiveUnrevocableConfirmationArbiter.sol)

```diff
 ... 71 unchanged lines ...
         bytes32 fulfilling
     ) public view override returns (bool) {
+        fulfillment._checkIntrinsic();
         return confirmations[fulfillment.uid][fulfilling];
     }
 }
```

##### ExclusiveRevocableConfirmationArbiter.sol

File: `contracts/src/arbiters/confirmation/ExclusiveRevocableConfirmationArbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/confirmation/ExclusiveRevocableConfirmationArbiter.sol)

```diff
 ... 97 unchanged lines ...
         bytes32 fulfilling
     ) public view override returns (bool) {
+        fulfillment._checkIntrinsic();
         return confirmations[fulfillment.uid][fulfilling];
     }
 }
```

##### NonexclusiveUnrevocableConfirmationArbiter.sol

File: `contracts/src/arbiters/confirmation/NonexclusiveUnrevocableConfirmationArbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/confirmation/NonexclusiveUnrevocableConfirmationArbiter.sol)

```diff
 ... 63 unchanged lines ...
         bytes32 fulfilling
     ) public view override returns (bool) {
+        fulfillment._checkIntrinsic();
         return confirmations[fulfillment.uid][fulfilling];
     }
 }
```

##### NonexclusiveRevocableConfirmationArbiter.sol

File: `contracts/src/arbiters/confirmation/NonexclusiveRevocableConfirmationArbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/confirmation/NonexclusiveRevocableConfirmationArbiter.sol)

```diff
 ... 85 unchanged lines ...
         bytes32 fulfilling
     ) public view override returns (bool) {
+        fulfillment._checkIntrinsic();
         return confirmations[fulfillment.uid][fulfilling];
     }
 }
```

#### Related findings

##### [Medium] Unvalidated fulfillment UID confirmation in confirmation arbiters causes unauthorized fund release and ETH burn

###### Description

Confirmation arbiters allow buyers to irreversibly confirm arbitrary fulfillment UIDs without validating existence or suitability. Base escrow collection then authorizes purely from this flag, enabling attacker-crafted fulfillments to steal funds, zero-UID confirmations to burn ETH in tierable native escrows, and permanent locks for non-expiring escrows in exclusive-unrevocable flows.

The confirmation arbiters (e.g., ExclusiveUnrevocableConfirmationArbiter) accept any bytes32 fulfillment UID in confirm() and only verify that msg.sender is the escrow attestation recipient. They do not verify that the fulfillment exists in EAS, is intrinsically valid, or is linked appropriately to the escrow. They set confirmations[_fulfillment][_escrow] and (for exclusive-unrevocable) escrowConfirmed[_escrow], irreversibly authorizing that UID. Later, checkObligation() returns confirmations[fulfillment.uid][escrowUID] and ignores fulfillment contents. In BaseEscrowObligationTierable.collectEscrowRaw(), there is no refUID check, and in BaseEscrowObligation.collectEscrowRaw() the only linkage check is fulfillment.refUID == escrow.uid (attackers can mint such fulfillments). EAS.getAttestation for unknown UIDs returns a zeroed Attestation with recipient == address(0). As a result: (1) in non-tierable flows, an attacker-crafted attestation referencing the escrow steals funds if the buyer confirms it; (2) in tierable native-token escrows, confirming bytes32(0) and collecting with it burns ETH to address(0); (3) in exclusive-unrevocable flows, confirming a wrong UID permanently prevents correcting the mistake, locking non-expiring escrows indefinitely.

###### Severity

**Impact Explanation:** [High] Direct, material loss of principal (theft or ETH burn) and indefinite fund freezing for non-expiring escrows in exclusive-unrevocable flows.

**Likelihood Explanation:** [Low] Exploitation relies on the buyer confirming an incorrect fulfillment UID (attacker-crafted, zero, or wrong non-zero), which is a user error or UI/integration manipulation.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Non-tierable theft: Attacker creates an EAS attestation A with recipient=attacker and refUID=escrowUID. Buyer is prompted to confirm A.uid for the escrow via the confirmation arbiter. On collectEscrowRaw(escrowUID, A.uid), the non-tierable base checks refUID match (true) and the arbiter’s confirmation, then releases funds to A.recipient (attacker).
#### Preconditions / Assumptions
- (a). A non-tierable escrow (e.g., ERC20/721/1155 non-tierable) is used and holds funds
- (b). The escrow’s arbiter is a confirmation arbiter (e.g., ExclusiveUnrevocableConfirmationArbiter)
- (c). The attacker can create an EAS attestation referencing the escrow UID (EAS allows arbitrary refUID to existing attestations)
- (d). The buyer (escrow attestation recipient) confirms the attacker’s fulfillment UID via the arbiter

### Scenario 2.
Tierable native ETH burn: Buyer mistakenly confirms bytes32(0) for a tierable NativeTokenEscrowObligation. On collectEscrowRaw(escrowUID, 0), EAS returns a zeroed fulfillment (recipient=address(0)); the arbiter mapping authorizes it; _releaseEscrow sends ETH to address(0), irreversibly burning the funds.
#### Preconditions / Assumptions
- (a). A tierable NativeTokenEscrowObligation is used and holds ETH
- (b). The escrow’s arbiter is a confirmation arbiter (e.g., ExclusiveUnrevocableConfirmationArbiter)
- (c). The buyer (escrow attestation recipient) confirms bytes32(0) for the escrow
- (d). EAS.getAttestation(0) returns a zeroed attestation with recipient=address(0)

### Scenario 3.
Permanent lock (exclusive-unrevocable, non-expiring): Buyer mistakenly confirms a non-existent non-zero UID R. Because EAS.getAttestation(R) returns a zeroed attestation at collection, the stored confirmation is ineffective, collect fails, and due to exclusivity/unrevocability the buyer cannot correct the confirmation. With expirationTime==0, funds are locked indefinitely.
#### Preconditions / Assumptions
- (a). Any escrow type with expirationTime == 0 (never expires)
- (b). The escrow’s arbiter is ExclusiveUnrevocableConfirmationArbiter
- (c). The buyer (escrow attestation recipient) mistakenly confirms a non-existent non-zero UID
- (d). Subsequent collection attempts use that UID and fail; re-confirmation is blocked by exclusivity/unrevocability

###### Proposed fix

####### BaseEscrowObligationTierable.sol

File: `contracts/src/BaseEscrowObligationTierable.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligationTierable.sol)

```diff
 ... 78 unchanged lines ...
             revert AttestationNotFound(_fulfillment);
         }
+        // SAFETY: Validate fulfillment before use:
+        // - require fulfillment.uid != bytes32(0)
+        // - fulfillment._checkIntrinsic() and require fulfillment.recipient != address(0)
 
         // Validate escrow uses correct schema
 ... 98 unchanged lines ...
```

####### BaseEscrowObligation.sol

File: `contracts/src/BaseEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligation.sol)

```diff
 ... 78 unchanged lines ...
             revert AttestationNotFound(_fulfillment);
         }
+        // SAFETY: Validate fulfillment before use:
+        // - require fulfillment.uid != bytes32(0)
+        // - fulfillment._checkIntrinsic() and require fulfillment.recipient != address(0)
 
         // Validate escrow uses correct schema
 ... 98 unchanged lines ...
```

####### ExclusiveUnrevocableConfirmationArbiter.sol

File: `contracts/src/arbiters/confirmation/ExclusiveUnrevocableConfirmationArbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/confirmation/ExclusiveUnrevocableConfirmationArbiter.sol)

```diff
 ... 43 unchanged lines ...
             revert EscrowAlreadyConfirmed();
         }
+        // SAFETY: Validate the fulfillment here:
+        // - require _fulfillment != bytes32(0), fulfillment exists (eas.getAttestation), _checkIntrinsic(), and recipient != address(0)
+        // - reject invalid/missing UIDs to avoid irreversible bad confirmations
 
         confirmations[_fulfillment][_escrow] = true;
 ... 24 unchanged lines ...
         bytes32 fulfilling
     ) public view override returns (bool) {
+        // SAFETY: Consider re-validating 'fulfillment' (non-zero uid, intrinsic validity) and enforcing optional demand-based constraints
+        // (e.g., expected schema, required attester, and/or refUID linkage for non-tierable usages) before consulting confirmations.
         return confirmations[fulfillment.uid][fulfilling];
     }
 }
```

### 7. [High] Permissionless unsafe partial settlement in TokenBundleEscrowObligation (tierable and non-tierable) causes irreversible partial payout and permanent asset stranding

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

TokenBundle escrows expose permissionless unsafe partial functions that revoke the escrow first and then perform best-effort transfers that ignore per-asset failures. If any transfer (notably ERC1155 to a rejecting contract) fails, the escrow is still finalized, fungibles may be paid out, and remaining assets are permanently stranded in the contract with no rescue path.

Both tierable and non-tierable TokenBundleEscrowObligation expose external, permissionless unsafePartiallyCollectEscrow and unsafePartiallyReclaimExpired functions that revoke the escrow attestation before attempting best-effort transfers. In the partial path, individual transfer failures are swallowed and only emit events, so the transaction succeeds and the escrow is irreversibly finalized even if some assets fail to transfer (e.g., ERC1155 safeTransferFrom to a rejecting recipient). There is no rescue/sweep mechanism, and revoked attestations fail intrinsic checks preventing later retries, which strands failed assets permanently. The atomic collect path reverts on any failure and would preserve all assets, but the unsafe path allows any caller to unilaterally force partial finalization once the arbiter condition (or expiry) is satisfied. Exploitability depends on arbiter/demand configuration: without recipient constraints (e.g., IntrinsicsArbiter), an attacker can select a rejecting recipient and force partial payout and stranding; with recipient pinned to a safe EOA or ERC1155Receiver via an arbiter composition, the described vector is blocked.

#### Severity

**Impact Explanation:** [High] Direct, material loss of principal (fungibles paid to attacker’s recipient) and permanent freezing of ERC1155 assets in the escrow contract with no rescue path.

**Likelihood Explanation:** [Medium] Exploitation depends on integrator configuration (arbiter choice that does not constrain the recipient and existence of a valid fulfillment) which are significant constraints outside attacker control, yet plausible in practice.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Tierable, lax arbiter: A buyer creates a tierable TokenBundle escrow including ERC1155 and ERC20, using a permissive arbiter (e.g., IntrinsicsArbiter) that does not constrain the recipient. The attacker deploys a contract that rejects ERC1155, mints a passing fulfillment attestation with recipient set to this contract, and calls unsafePartiallyCollectEscrow. The escrow is revoked, ERC20 transfers succeed to the attacker’s recipient, ERC1155 transfer fails and is ignored, and the escrow is marked collected, leaving ERC1155 stranded permanently.
#### Preconditions / Assumptions
- (a). Buyer creates a tierable TokenBundle escrow with at least one ERC1155 and some fungible assets
- (b). Buyer selects a permissive arbiter (e.g., IntrinsicsArbiter) that does not constrain the recipient
- (c). Attacker deploys an ERC1155-rejecting recipient contract
- (d). Attacker can mint a fulfillment attestation that passes the chosen arbiter

### Scenario 2.
Non-tierable, lax arbiter: A buyer creates a non-tierable TokenBundle escrow with ERC1155 and ERC20 and a permissive arbiter. The attacker mints a fulfillment attestation with refUID set to the escrow uid and recipient set to an ERC1155-rejecting contract, then calls unsafePartiallyCollectEscrow. The escrow is revoked, fungibles are transferred, ERC1155 transfer fails and is ignored, and the escrow is finalized with the ERC1155 stuck forever.
#### Preconditions / Assumptions
- (a). Buyer creates a non-tierable TokenBundle escrow with ERC1155 and fungible assets
- (b). Buyer selects a permissive arbiter (e.g., IntrinsicsArbiter) that does not constrain the recipient
- (c). Attacker can mint a fulfillment attestation with refUID equal to the escrow uid
- (d). Attacker deploys an ERC1155-rejecting recipient contract

### Scenario 3.
Tierable with TrustedOracleArbiter: A buyer uses TrustedOracleArbiter for a tierable TokenBundle escrow. After the trusted oracle honestly approves a specific fulfillment uid, a third party calls unsafePartiallyCollectEscrow where the fulfillment’s recipient is an ERC1155-rejecting contract (e.g., due to integration oversight). The escrow is revoked, fungibles transfer to the recipient, the ERC1155 transfer fails and is ignored, and the escrow is finalized leaving ERC1155 assets permanently stranded.
#### Preconditions / Assumptions
- (a). Buyer creates a tierable TokenBundle escrow using TrustedOracleArbiter
- (b). Trusted oracle has approved a specific fulfillment uid for the escrow’s demand data
- (c). The approved fulfillment attestation’s recipient is an ERC1155-rejecting contract
- (d). Any caller can invoke the unsafe partial collect function once the arbiter check passes

#### Proposed fix

##### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 606 unchanged lines ...
 
         if (!escrow._checkIntrinsic()) revert InvalidEscrowAttestation();
+        if (msg.sender != escrow.recipient) revert UnauthorizedCall();
 
         // Extract arbiter and demand from escrow data
 ... 52 unchanged lines ...
             revert UnauthorizedCall();
 
+        if (msg.sender != attestation.recipient) revert UnauthorizedCall();
         // Revoke attestation to prevent re-entry
         try
 ... 32 unchanged lines ...
```

##### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 606 unchanged lines ...
 
         if (!escrow._checkIntrinsic()) revert InvalidEscrowAttestation();
+        if (msg.sender != escrow.recipient) revert UnauthorizedCall();
 
         // Extract arbiter and demand from escrow data
 ... 52 unchanged lines ...
             revert UnauthorizedCall();
 
+        if (msg.sender != attestation.recipient) revert UnauthorizedCall();
         // Revoke attestation to prevent re-entry
         try
 ... 32 unchanged lines ...
```

#### Related findings

##### [High] Atomic push-based release and revoke-before-transfer partial paths in tierable TokenBundleEscrowObligation cause irreversible loss of ERC1155 legs and potential ERC721 stranding

###### Description

The tierable TokenBundleEscrowObligation releases entire bundles to a single recipient using ERC721.transferFrom and ERC1155.safeTransferFrom. Atomic collection/reclaim reverts if any ERC1155 leg is rejected; the unsafe partial flows revoke first and then continue on failures, permanently stranding failing ERC1155 legs in the escrow contract. ERC721 legs can be sent to unsuitable contracts via transferFrom and become stuck at the recipient. This can be exploited to convert a reversible DoS into irreversible principal loss.

In the tierable TokenBundleEscrowObligation, _releaseEscrow forwards to transferOutTokenBundleAtomic, which pushes all assets to a single recipient address. ERC721 legs are sent via transferFrom (no receiver checks), and ERC1155 legs via safeTransferFrom (reverting on receiver rejection). _returnEscrow uses the same logic, so expiry reclaim shares these behaviors. The unsafe partial flows (unsafePartiallyCollectEscrow and unsafePartiallyReclaimExpired) revoke the escrow attestation first, then attempt best-effort transfers, continuing on individual failures (ERC1155 failures are caught and only emit events). As a result, if the recipient rejects ERC1155 transfers, atomic collect/reclaim is DoS’d, and using the unsafe partial flows will irrevocably close the escrow while leaving the ERC1155 legs stuck in the escrow contract with no recovery path. Separately, ERC721 legs can be transferred to a recipient contract that cannot move them, potentially stranding them at the recipient. There is no per-asset receiver validation or pull-claim alternative. While documented as unsafe, the revoke-before-transfer partial flows and push-based single-recipient design can be exploited to harvest fungibles and strand ERC1155 legs, causing principal loss to the buyer.

###### Severity

**Impact Explanation:** [High] ERC1155 legs can be irreversibly stranded in the escrow contract after revocation when unsafe partial paths are used, causing direct, material loss of principal to the buyer; ERC721 can be stranded at the recipient via transferFrom.

**Likelihood Explanation:** [Medium] Exploitation requires the buyer’s arbiter configuration to allow the attacker’s fulfillment and not constrain the recipient, and the attacker to choose a recipient contract rejecting ERC1155. These constraints are realistic but not universal.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Malicious fulfiller sets the fulfillment recipient to a contract that rejects ERC1155 transfers. Atomic collect reverts due to ERC1155.safeTransferFrom. The fulfiller then calls unsafePartiallyCollectEscrow, which revokes the escrow first and proceeds: ERC20/native (and ERC721 via transferFrom) are transferred to the attacker’s recipient, while each ERC1155 leg fails and remains permanently stuck in the escrow contract. The buyer loses the ERC1155 principal.
#### Preconditions / Assumptions
- (a). The bundle escrow includes ERC1155 assets (and optionally ERC20/native/ERC721).
- (b). The buyer selected an arbiter condition that the attacker can satisfy and that does not constrain the fulfillment recipient.
- (c). The attacker (fulfiller) can produce a valid fulfillment attestation for the chosen arbiter.
- (d). The attacker sets the fulfillment recipient to a contract that rejects ERC1155 transfers (no IERC1155Receiver or reverts).
- (e). The attacker invokes unsafePartiallyCollectEscrow after the atomic path reverts.

### Scenario 2.
After escrow expiry, any third party calls unsafePartiallyReclaimExpired when the escrow’s reclaim recipient is a contract that rejects ERC1155. The function revokes the escrow, returns ERC20/native (and ERC721 via transferFrom), and continues past ERC1155 failures, leaving ERC1155 legs permanently in the escrow contract. The buyer (reclaim recipient) loses ERC1155 principal.
#### Preconditions / Assumptions
- (a). The escrow has expired.
- (b). The escrow attestation’s recipient (reclaim target) is a contract that rejects ERC1155 transfers.
- (c). A third party invokes unsafePartiallyReclaimExpired.

### Scenario 3.
The fulfiller sets the fulfillment recipient to a contract that cannot move ERC721. Atomic collection succeeds for ERC721 via transferFrom, but the NFT is now owned by a contract that has no way to transfer it out, effectively stranding the NFT at the recipient.
#### Preconditions / Assumptions
- (a). The bundle includes an ERC721 asset.
- (b). The fulfiller sets the fulfillment recipient to a contract that cannot move ERC721 tokens out.
- (c). Atomic collection uses ERC721.transferFrom, which succeeds without receiver checks.

###### Proposed fix

####### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 340 unchanged lines ...
         for (uint i = 0; i < data.erc721Tokens.length; i++) {
             try
-                IERC721(data.erc721Tokens[i]).transferFrom(
+                IERC721(data.erc721Tokens[i]).safeTransferFrom(
                     address(this),
                     to,
 ... 236 unchanged lines ...
         bytes32 _fulfillment
     ) external nonReentrant returns (bool) {
+        revert UnauthorizedCall();
         Attestation memory escrow;
         Attestation memory fulfillment;
 ... 58 unchanged lines ...
     /// even if some tokens remain stuck. This can result in permanent loss of stuck tokens.
     function unsafePartiallyReclaimExpired(bytes32 uid) external nonReentrant returns (bool) {
+        revert UnauthorizedCall();
         Attestation memory attestation;
 
 ... 51 unchanged lines ...
```

####### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 340 unchanged lines ...
         for (uint i = 0; i < data.erc721Tokens.length; i++) {
             try
-                IERC721(data.erc721Tokens[i]).transferFrom(
+                IERC721(data.erc721Tokens[i]).safeTransferFrom(
                     address(this),
                     to,
 ... 236 unchanged lines ...
         bytes32 _fulfillment
     ) external nonReentrant returns (bool) {
+        revert UnauthorizedCall();
         Attestation memory escrow;
         Attestation memory fulfillment;
 ... 58 unchanged lines ...
     /// even if some tokens remain stuck. This can result in permanent loss of stuck tokens.
     function unsafePartiallyReclaimExpired(bytes32 uid) external nonReentrant returns (bool) {
+        revert UnauthorizedCall();
         Attestation memory attestation;
 
 ... 51 unchanged lines ...
```

### 8. [High] Pending ERC-8004 validation requests treated as valid in ERC8004Arbiter when minResponse==0 cause unauthorized escrow release

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

ERC8004Arbiter accepts response >= minResponse from ValidationRegistryUpgradeable.getValidationStatus but cannot see hasResponse. Since validationRequest initializes response=0 with hasResponse=false and getValidationStatus does not expose hasResponse, any pending request passes when minResponse==0. Anyone who owns an ERC-8004 agent can open a request for the fulfillment UID with the expected validatorAddress and collect escrows without a validator response.

ERC8004Arbiter.checkObligation allows minResponse in 0..100 and verifies only that the fulfillment attestation references the escrow UID, the registry’s validatorAddress matches the expected one, and the reported response >= minResponse. ValidationRegistryUpgradeable.validationRequest creates a record with response=0 and hasResponse=false for an arbitrary requestHash (here, the fulfillment UID) and caller-supplied validatorAddress, as long as the caller owns or is approved for any agentId in IdentityRegistryUpgradeable. Because getValidationStatus does not expose hasResponse, ERC8004Arbiter treats a pending request as a valid 0 score when minResponse==0. Attackers can register an agent, create a fulfillment attestation referencing the escrow UID under a resolverless EAS schema, open a validation request with the expected validatorAddress, and call collectEscrow to release assets without any validator response. This affects ETH, ERC20, and ERC721 escrows (and similarly structured escrows), and only requires the insecure configuration minResponse==0.

#### Severity

**Impact Explanation:** [High] Escrowed principal assets (ETH, ERC20, ERC721) can be released to an attacker without a validator response, causing direct, material loss of user funds.

**Likelihood Explanation:** [Medium] Exploitation depends on a specific configuration (minResponse == 0), which is plausible but not universal; once present, the attack is straightforward with no special constraints.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
An attacker drains ETH from a NativeTokenEscrowObligation configured with ERC8004Arbiter and minResponse == 0 by creating a fulfillment attestation referencing the escrow UID, opening a validation request for that fulfillment UID with the expected validatorAddress (yielding response=0, hasResponse=false), and calling collectEscrow to release the escrowed ETH to themselves without any validator having responded.
#### Preconditions / Assumptions
- (a). Buyer configures a NativeTokenEscrowObligation to use ERC8004Arbiter with DemandData {validationRegistry = ValidationRegistryUpgradeable, validatorAddress = trusted validator, minResponse = 0}.
- (b). The escrow has locked X ETH as specified.
- (c). IdentityRegistryUpgradeable used by the validation registry allows permissionless agent registration; the attacker can own an agent.
- (d). EAS and SchemaRegistry are as vendored; the attacker can create a fulfillment attestation with refUID equal to the escrow UID under a resolverless schema.
- (e). The attacker observes the escrow UID on-chain.
- (f). ValidationRegistryUpgradeable.validationRequest accepts the attacker’s agentId and the expected validatorAddress, recording response=0 and hasResponse=false for requestHash = fulfillment UID.
- (g). No validator response occurs before collectEscrow is called.

### Scenario 2.
An attacker drains ERC20 tokens from an ERC20EscrowObligation configured with ERC8004Arbiter and minResponse == 0 by creating a fulfillment attestation referencing the escrow UID, opening a validation request for that fulfillment UID with the expected validatorAddress (response=0, hasResponse=false), and calling collectEscrow to transfer the escrowed tokens to themselves without any validator response.
#### Preconditions / Assumptions
- (a). Buyer configures an ERC20EscrowObligation to use ERC8004Arbiter with DemandData {validationRegistry = ValidationRegistryUpgradeable, validatorAddress = trusted validator, minResponse = 0}.
- (b). The escrow has locked N ERC20 tokens as specified.
- (c). IdentityRegistryUpgradeable used by the validation registry allows permissionless agent registration; the attacker can own an agent.
- (d). EAS and SchemaRegistry are as vendored; the attacker can create a fulfillment attestation with refUID equal to the escrow UID under a resolverless schema.
- (e). The attacker observes the escrow UID on-chain.
- (f). ValidationRegistryUpgradeable.validationRequest accepts the attacker’s agentId and the expected validatorAddress, recording response=0 and hasResponse=false for requestHash = fulfillment UID.
- (g). No validator response occurs before collectEscrow is called.

### Scenario 3.
An attacker steals an ERC721 NFT from an ERC721EscrowObligation configured with ERC8004Arbiter and minResponse == 0 by creating a fulfillment attestation referencing the escrow UID, opening a validation request for that fulfillment UID with the expected validatorAddress (response=0, hasResponse=false), and calling collectEscrow to transfer the NFT to themselves without any validator response.
#### Preconditions / Assumptions
- (a). Buyer configures an ERC721EscrowObligation to use ERC8004Arbiter with DemandData {validationRegistry = ValidationRegistryUpgradeable, validatorAddress = trusted validator, minResponse = 0}.
- (b). The escrow has custody of the specified NFT tokenId T.
- (c). IdentityRegistryUpgradeable used by the validation registry allows permissionless agent registration; the attacker can own an agent.
- (d). EAS and SchemaRegistry are as vendored; the attacker can create a fulfillment attestation with refUID equal to the escrow UID under a resolverless schema.
- (e). The attacker observes the escrow UID on-chain.
- (f). ValidationRegistryUpgradeable.validationRequest accepts the attacker’s agentId and the expected validatorAddress, recording response=0 and hasResponse=false for requestHash = fulfillment UID.
- (g). No validator response occurs before collectEscrow is called.

#### Proposed fix

##### ERC8004Arbiter.sol

File: `contracts/src/arbiters/ERC8004Arbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/ERC8004Arbiter.sol)

```diff
 ... 24 unchanged lines ...
  * @title ValidationRegistryArbiter
  * @notice Arbiter that wraps ERC-8004's ValidationRegistry
- * @dev The DemandData specifies a minimum response uint8 (0-100)
+ * @dev The DemandData specifies a minimum response uint8 (1-100)
  *      The fulfillment attestation's UID is used as the requestHash
  *      in the ValidationRegistry's getValidationStatus call
 ... 33 unchanged lines ...
 
         // Validate minResponse is in valid range
-        if (demand_.minResponse > 100) revert InvalidMinResponse();
+        if (demand_.minResponse == 0 || demand_.minResponse > 100) revert InvalidMinResponse();
 
         // Use the obligation UID as the requestHash
 ... 40 unchanged lines ...
```

### 9. [High] Missing context binding in ERC8004Arbiter.checkObligation with ERC-8004 ValidationRegistry causes unauthorized escrow release

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

ERC8004Arbiter unlocks escrows based only on a validator address match and a numeric response threshold from the ERC-8004 ValidationRegistry, ignoring agentId, requestURI, tag, and responseHash. Since any agent owner can create the single validation request for a fulfillment UID, a seller can choose an easy-to-score context and an honest, generic validator may return a high score for that different context, allowing funds to be released.

ERC8004Arbiter uses the fulfillment attestation UID as the requestHash to query an ERC-8004 ValidationRegistry and accepts a validation if (validatorAddress == expected) and (response >= minResponse). It ignores contextual fields (agentId, requestURI, tag, responseHash). The registry allows any owner/approved operator of an ERC-8004 agent to create the one-and-only validationRequest for a given requestHash (the fulfillment UID), setting the request context. Many ERC-8004 validators, while honest and non-malicious, evaluate based on requestURI/tag/agent policy rather than binding their evaluation to the on-chain EAS fulfillment content. A seller can thus submit the first (and only) validationRequest for the fulfillment UID with an easy-to-score context, receive a high score from the trusted validator for that different context, and pass ERC8004Arbiter’s checks, causing the escrow to release funds to the fulfillment recipient. Additionally, a griefer can preempt a request with a mismatching validatorAddress to cause long-lived DoS until expiration.

#### Severity

**Impact Explanation:** [High] In Scenarios 1 and 2, the buyer’s escrowed principal is directly and materially released to the attacker. In Scenario 3, funds are frozen until expiration, potentially longer than a week with no workaround.

**Likelihood Explanation:** [Medium] Exploitation depends on validator policy (generic/permissive behavior and acceptance of public agent requests) and timing to submit the one allowed request per fulfillment UID. These constraints are outside the attacker’s control but plausible in many real deployments.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Unauthorized ERC20 escrow release: Buyer escrows tokens using ERC20EscrowObligation with arbiter=ERC8004Arbiter and a trusted generic validator. The seller creates the fulfillment attestation, then creates the only ValidationRegistry request for that fulfillment UID with a benign/easy requestURI. The validator returns a high score for that context, ERC8004Arbiter passes, and the escrow releases tokens to the seller.
#### Preconditions / Assumptions
- (a). Buyer selects ERC8004Arbiter with demand {validationRegistry R, validatorAddress V, minResponse > 0} and creates an ERC20 escrow with locked funds.
- (b). Seller creates a fulfillment EAS attestation with refUID = escrow UID and recipient = seller.
- (c). Seller owns an ERC-8004 agent and can submit ValidationRegistry.validationRequest for the fulfillment UID before others (uniqueness per UID).
- (d). Validator V is honest but generic/permissive and evaluates based on requestURI/tag (not bound to EAS UID content) and responds to public agent requests.
- (e). Validator returns a score >= minResponse for the attacker-chosen context.

### Scenario 2.
Unauthorized release via tag/policy selection: With a multi-task validator that uses tag/policy to select a model, the seller submits the one allowed request for the fulfillment UID choosing a tag/policy known to yield high scores. The validator responds with a high score, ERC8004Arbiter accepts, and funds are released.
#### Preconditions / Assumptions
- (a). Buyer selects ERC8004Arbiter with demand {validationRegistry R, validatorAddress V, minResponse} and creates an escrow.
- (b). Seller creates a fulfillment attestation referencing the escrow with recipient = seller.
- (c). Seller owns an ERC-8004 agent and can submit the first ValidationRegistry request for the fulfillment UID.
- (d). Validator V supports multiple tasks/models via tag/policy and responds to public agent requests.
- (e). Seller chooses a tag/policy likely to yield a high score; validator returns response >= minResponse.

### Scenario 3.
DoS via preemptive mismatched validatorAddress: A third party or the seller first submits a ValidationRegistry request for the fulfillment UID but sets a different validatorAddress than the buyer’s demand. ERC8004Arbiter later detects the mismatch and refuses to release, freezing funds until escrow expiration.
#### Preconditions / Assumptions
- (a). Buyer selects ERC8004Arbiter with demand {validationRegistry R, validatorAddress V} and creates an escrow with a fulfillment expected later.
- (b). Attacker learns the fulfillment UID (e.g., after fulfillment is created) and owns an ERC-8004 agent.
- (c). Attacker submits ValidationRegistry.validationRequest first for the fulfillment UID with validatorAddress W != V, preventing V from responding.
- (d). Escrow expiration is long (e.g., > 1 week) or nonzero; funds are needed before expiration.
- (e). Collect attempt fails due to validator mismatch; funds remain locked until expiration and reclaim.

#### Proposed fix

##### ERC8004Arbiter.sol

File: `contracts/src/arbiters/ERC8004Arbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/ERC8004Arbiter.sol)

```diff
 ... 41 unchanged lines ...
     error ResponseBelowMinimum();
     error ValidatorMismatch();
+    error ResponseHashBindingMismatch();
     error FulfillmentMustReferenceEscrow();
 
     /**
      * @notice Check if the validation response meets the minimum requirement
      * @param obligation The attestation representing the obligation
      * @param demand ABI-encoded DemandData containing registry address and min response
      * @param fulfilling The escrow UID that this obligation must reference
      * @return bool True if the validation response >= minResponse
      */
     function checkObligation(
         Attestation memory obligation,
         bytes memory demand,
         bytes32 fulfilling
     ) public view override returns (bool) {
         DemandData memory demand_ = abi.decode(demand, (DemandData));
 
         // Ensure obligation references what it's fulfilling
         if (obligation.refUID != fulfilling)
             revert FulfillmentMustReferenceEscrow();
 
         // Validate minResponse is in valid range
-        if (demand_.minResponse > 100) revert InvalidMinResponse();
+        if (demand_.minResponse == 0 || demand_.minResponse > 100) revert InvalidMinResponse();
 
         // Use the obligation UID as the requestHash
         bytes32 requestHash = obligation.uid;
 
         // Query the ValidationRegistry
         IValidationRegistry registry = IValidationRegistry(
             demand_.validationRegistry
         );
         (
             address validatorAddress,
             , // agentId (unused)
             uint8 response,
-            , // responseHash (unused)
+            bytes32 responseHash,
             , // tag (unused)
 
         ) = // lastUpdate (unused)
             registry.getValidationStatus(requestHash);
 
+        // Require validator response to be bound to this fulfillment and escrow
+        if (responseHash != keccak256(abi.encodePacked("ERC8004_EAS_BINDING", requestHash, fulfilling)))
+            revert ResponseHashBindingMismatch();
+
         // Check if validation exists (validatorAddress != address(0))
         if (validatorAddress == address(0)) revert ValidationNotFound();
 ... 22 unchanged lines ...
```

### 10. [High] Missing escrow-attester binding and source-of-funds verification in NativeTokenSplitter.collectAndDistribute causes cross-escrow fund misallocation and double payout

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

NativeTokenSplitter.collectAndDistribute trusts a caller-supplied escrow contract and distributes based on whatever ETH arrives during that call, without verifying the escrow contract is the attester of the referenced escrow, that the escrow was actually consumed/revoked, or that an exact balance delta was collected. A malicious wrapper can inject ETH or collect a different escrow and route funds to the splitter, causing misallocation of victim escrow funds and enabling later double payout when the original escrow is legitimately collected. Analogous issues exist in ERC20Splitter, ERC1155Splitter, and TokenBundleSplitterBase.

The splitter reads an escrow attestation to decode demand and split totals, then calls a caller-supplied escrowContract.collectEscrow(escrow, fulfillment). It assumes assets will be transferred to the splitter during this call and immediately distributes them according to stored oracle splits. It never checks that the provided escrowContract is the actual attester of the escrow (or shares its ATTESTATION_SCHEMA), never verifies that the escrow attestation was revoked/consumed after the call, and does not verify an exact asset balance delta corresponding to that escrow. As a result, a malicious wrapper can: (1) inject arbitrary ETH (or tokens) into the splitter during collectEscrow and trigger a distribution for the referenced escrow while leaving it unconsumed; or (2) legitimately collect a different escrow B (using the real escrow contract) with a fulfillment whose recipient is the splitter, thereby routing B’s funds into the splitter while distributing according to A’s splits. This causes misallocation/theft of B’s funds and enables later double payout when A is actually collected. The same unvalidated pattern exists in ERC20Splitter, ERC1155Splitter, and TokenBundleSplitterBase.

#### Severity

**Impact Explanation:** [High] Victim escrows’ principal funds can be misdirected to unintended recipients by collecting a different escrow and routing its funds into the splitter, resulting in direct, material loss of user funds. Additionally, double payout is enabled for the same escrow.

**Likelihood Explanation:** [Medium] Exploitation requires realistic but nontrivial conditions: oracle decisions must be posted for the involved escrows and amounts/splits must align (or be topped up). These are common states in intended deployments where splitters serve as arbiters, but not entirely under the attacker’s control.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Cross-escrow misdirection (native ETH): Attacker deploys a malicious INativeTokenEscrowObligation wrapper. Victim escrow B (using NativeTokenSplitter as arbiter) is funded and has an oracle decision posted. Attacker also has escrow A (same amount) with its own oracle decision. Attacker calls NativeTokenSplitter.collectAndDistribute with the malicious wrapper, escrow=A, and any fulfillment. The wrapper internally calls the real NativeTokenEscrowObligation.collectEscrow for B using a fulfillment whose recipient is the splitter. B is legitimately revoked and pays X ETH to the splitter. The splitter then distributes according to A’s splits, misdirecting B’s funds to A’s recipients while A remains unconsumed.
#### Preconditions / Assumptions
- (a). Victim escrow B exists on the legitimate NativeTokenEscrowObligation with amount X and uses NativeTokenSplitter as arbiter
- (b). Oracle has posted a decision for B (normal operation)
- (c). Attacker escrow A exists with amount X and has an oracle decision posted (normal operation)
- (d). Attacker can craft a fulfillment attestation for B with refUID=B.uid and recipient=NativeTokenSplitter
- (e). Public collectAndDistribute can be called by anyone with an arbitrary escrowContract address

### Scenario 2.
Cross-escrow misdirection (token bundle): Attacker deploys a malicious ITokenBundleEscrowObligation wrapper. Victim escrow B (TokenBundleEscrowObligation, arbiter=TokenBundleSplitter) is funded and has an oracle decision posted. Attacker configures escrow A and oracle splits to match B’s bundle totals. Attacker calls TokenBundleSplitter.collectAndDistribute with the wrapper, escrow=A, and any fulfillment. The wrapper collects B legitimately with a fulfillment whose recipient is the splitter, routing B’s bundle to the splitter, which then distributes assets per A’s splits. B’s funds are stolen/misdirected; A is still unconsumed.
#### Preconditions / Assumptions
- (a). Victim escrow B exists on the legitimate TokenBundleEscrowObligation with a funded bundle and uses TokenBundleSplitter as arbiter
- (b). Oracle has posted a decision for B (normal operation)
- (c). Attacker escrow A exists with oracle splits that match B’s bundle totals (as required by TokenBundleSplitter validation)
- (d). Attacker can craft a fulfillment attestation for B with refUID=B.uid and recipient=TokenBundleSplitter
- (e). Public collectAndDistribute can be called by anyone with an arbitrary escrowContract address

### Scenario 3.
Double payout via ETH injection: Escrow A (using NativeTokenSplitter as arbiter) exists with oracle splits. Attacker deploys a malicious wrapper whose collectEscrow just sends X ETH to the splitter and returns. Attacker calls NativeTokenSplitter.collectAndDistribute with the wrapper and escrow=A, causing immediate distribution without consuming A. Later, a legitimate collect for A occurs using the real escrow contract, paying out A’s splits again from A’s actual funds.
#### Preconditions / Assumptions
- (a). Escrow A exists on the legitimate NativeTokenEscrowObligation with amount X and uses NativeTokenSplitter as arbiter
- (b). Oracle has posted a decision for A (to enable distribution)
- (c). Attacker can deploy a wrapper whose collectEscrow sends X ETH to the splitter and returns without revoking A
- (d). Later, someone can call collectAndDistribute with the real escrow contract for A and a valid fulfillment to collect A

#### Proposed fix

##### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 215 unchanged lines ...
         BundleSplit[] memory splits = decisions[demandData.oracle][decisionKey];
 
+        // SECURITY TODO: Bind escrowContract to escrowAttestation.attester, require EAS.getAttestation(fulfillment).recipient == address(this), and verify escrow revocation post-call before distributing (optionally assert per-asset balance/ownership deltas).
         // Collect escrow — all assets transfer to this contract
         ITokenBundleEscrowObligation(escrowContract).collectEscrow(
 ... 90 unchanged lines ...
```

##### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 204 unchanged lines ...
         Split[] memory splits = decisions[demandData.oracle][decisionKey];
 
+        // SECURITY TODO: Bind escrowContract to escrowAttestation.attester, require EAS.getAttestation(fulfillment).recipient == address(this), and verify escrow revocation post-call before distributing.
         // Collect escrow — tokens transfer to this contract
         IERC1155EscrowObligation(escrowContract).collectEscrow(
 ... 56 unchanged lines ...
```

##### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 205 unchanged lines ...
         Split[] memory splits = decisions[demandData.oracle][decisionKey];
 
+        // SECURITY TODO: Bind escrowContract to escrowAttestation.attester, require EAS.getAttestation(fulfillment).recipient == address(this), and verify escrow revocation post-call before distributing.
         // Collect escrow — tokens transfer to this contract
         IERC20EscrowObligation(escrowContract).collectEscrow(
 ... 52 unchanged lines ...
```

##### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 202 unchanged lines ...
         Split[] memory splits = decisions[demandData.oracle][decisionKey];
 
+        // SECURITY TODO: Bind escrowContract to escrowAttestation.attester, require EAS.getAttestation(fulfillment).recipient == address(this), and verify escrow revocation post-call before distributing.
         // Collect escrow — ETH transfers to this contract
         INativeTokenEscrowObligation(escrowContract).collectEscrow(
 ... 55 unchanged lines ...
```

### 11. [High] Missing fulfillment existence check in BaseEscrowObligationTierable.collectEscrowRaw causes theft or burn of escrowed assets

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Tierable escrow collection never verifies that the provided fulfillment attestation exists. With permissive arbiters (e.g., IntrinsicsArbiter), a non-existent or attacker-minted fulfillment is accepted, and payout uses the fulfillment.recipient. This enables theft to an attacker-chosen address or burns ETH to address(0) for non-existent fulfillments.

In the tierable escrow collection path, the contract retrieves the fulfillment attestation from EAS but does not require it to exist (no isAttestationValid or uid equality check). The EAS implementation returns a zero-initialized attestation for unknown UIDs. Several arbiters in the system (e.g., IntrinsicsArbiter, TrivialArbiter) will accept such fulfillments because they only check for non-expiry and non-revocation, or always return true. The escrow release then pays to fulfillment.recipient. For a non-existent fulfillment, recipient is address(0), burning ETH in native escrows. More generally, an attacker can mint a valid, non-expired attestation with recipient set to themselves and, under a permissive arbiter, collect the escrowed assets. The non-tierable base enforces fulfillment.refUID == escrow.uid, blocking the exact non-existent-UID variant, but it remains vulnerable to attacker-minted fulfillments that set refUID = escrow.uid when a permissive arbiter is used.

#### Severity

**Impact Explanation:** [High] In all scenarios, users can lose principal funds: either directly stolen by an attacker or burned to the zero address.

**Likelihood Explanation:** [Medium] Exploitation requires the victim to have selected a permissive arbiter; once this precondition holds, attacks are trivial and inexpensive. The burn scenario is grief-only, but the theft scenarios provide clear attacker profit.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Tierable theft: A victim creates a tierable escrow (ETH/ERC20/ERC721/ERC1155/Bundle) selecting IntrinsicsArbiter. An attacker mints any valid, non-expired EAS attestation with recipient = attacker and calls collectEscrow with that UID. Since the base does not verify existence/schema and IntrinsicsArbiter only checks intrinsic fields, the fulfillment passes and escrowed assets are transferred to the attacker.
#### Preconditions / Assumptions
- (a). A tierable escrow is created with a permissive arbiter (e.g., IntrinsicsArbiter).
- (b). The attacker can mint a valid, non-expired EAS attestation under any schema.
- (c). No base-level requirement that the fulfillment attestation must exist or match a schema.

### Scenario 2.
Non-tierable theft: A victim uses a non-tierable escrow with IntrinsicsArbiter. The attacker mints a valid EAS attestation with recipient = attacker and refUID = the escrow UID (permitted by EAS as long as the referenced UID exists). The non-tierable base verifies refUID equality, IntrinsicsArbiter accepts the fulfillment, and the escrowed assets are released to the attacker.
#### Preconditions / Assumptions
- (a). A non-tierable escrow is created with a permissive arbiter (e.g., IntrinsicsArbiter).
- (b). The attacker can mint a valid, non-expired EAS attestation with refUID set to the escrow UID.
- (c). No base-level requirement that the fulfillment attestation must be under a particular schema; only refUID equality is enforced.

### Scenario 3.
Tierable ETH burn: A victim creates a tierable native-token escrow with IntrinsicsArbiter. An attacker calls collectEscrow with a non-existent fulfillment UID, which EAS returns as a zero attestation (recipient = address(0)). IntrinsicsArbiter accepts it, the escrow is revoked, and ETH is sent to address(0), irreversibly burning funds.
#### Preconditions / Assumptions
- (a). A tierable native-token escrow is created with a permissive arbiter (e.g., IntrinsicsArbiter).
- (b). EAS returns a zero-initialized attestation for non-existent UIDs (recipient = address(0)).
- (c). No base-level requirement that the fulfillment attestation must exist; payout uses fulfillment.recipient; ETH sends to address(0) succeed.

#### Proposed fix

##### BaseEscrowObligationTierable.sol

File: `contracts/src/BaseEscrowObligationTierable.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligationTierable.sol)

```diff
 ... 85 unchanged lines ...
         if (!escrow._checkIntrinsic()) revert InvalidEscrowAttestation();
 
+        // Ensure fulfillment exists and is intrinsically valid
+        if (!eas.isAttestationValid(_fulfillment)) revert InvalidFulfillment();
+        if (!fulfillment._checkIntrinsic()) revert InvalidFulfillment();
+
         // Extract arbiter and demand from escrow data
         (address arbiter, bytes memory demand) = extractArbiterAndDemand(
 ... 91 unchanged lines ...
```

##### BaseEscrowObligation.sol

File: `contracts/src/BaseEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligation.sol)

```diff
 ... 85 unchanged lines ...
         if (!escrow._checkIntrinsic()) revert InvalidEscrowAttestation();
 
+        // Ensure fulfillment exists and is intrinsically valid
+        if (!eas.isAttestationValid(_fulfillment)) revert InvalidFulfillment();
+        if (!fulfillment._checkIntrinsic()) revert InvalidFulfillment();
+
         // Extract arbiter and demand from escrow data
         (address arbiter, bytes memory demand) = extractArbiterAndDemand(
 ... 91 unchanged lines ...
```

##### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 607 unchanged lines ...
         if (!escrow._checkIntrinsic()) revert InvalidEscrowAttestation();
 
+        // Ensure fulfillment exists and is intrinsically valid
+        if (!eas.isAttestationValid(_fulfillment)) revert InvalidFulfillment();
+        if (!fulfillment._checkIntrinsic()) revert InvalidFulfillment();
+
         // Extract arbiter and demand from escrow data
         (address arbiter, bytes memory demand) = extractArbiterAndDemand(
 ... 87 unchanged lines ...
```

##### NativeTokenEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/NativeTokenEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/NativeTokenEscrowObligation.sol)

```diff
 ... 63 unchanged lines ...
         );
 
+        if (to == address(0)) revert NativeTokenTransferFailed(to, decoded.amount);
         (bool success, ) = payable(to).call{value: decoded.amount}("");
         if (!success) {
 ... 83 unchanged lines ...
```

##### NativeTokenEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/NativeTokenEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/NativeTokenEscrowObligation.sol)

```diff
 ... 63 unchanged lines ...
         );
 
+        if (to == address(0)) revert NativeTokenTransferFailed(to, decoded.amount);
         (bool success, ) = payable(to).call{value: decoded.amount}("");
         if (!success) {
 ... 83 unchanged lines ...
```

### 12. [High] Missing minimum-lifetime enforcement for fulfillment attestations in escrow-as-arbiter checkObligation causes attacker to drain victim escrow and reclaim counter-escrow

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Escrow contracts used as arbiters validate only that a fulfillment attestation is not expired at validation time and matches demanded fields, without enforcing any minimum remaining lifetime. An attacker can present a very short-lived counter-escrow to collect the victim’s escrow immediately, then reclaim their own counter-escrow after it expires, resulting in loss of the victim’s principal.

In the escrow flow, BaseEscrowObligation.collectEscrowRaw (and the tierable variant) releases the victim’s escrow to fulfillment.recipient once IArbiter(arbiter).checkObligation returns true. The escrow-as-arbiter implementations (ERC20/721/1155/Native/TokenBundle, both non-tierable and tierable) rely on obligation._checkIntrinsic(ATTESTATION_SCHEMA) and equality of encoded ObligationData but do not enforce any minimum remaining lifetime for the fulfillment attestation. This means a fulfillment attestation that expires moments later still passes validation. After collection, the victim’s escrow attestation is revoked, and the attacker can later call reclaimExpired on their short-lived fulfillment to recover their locked assets. Tierable variants additionally allow a single short-lived fulfillment to be reused to collect multiple escrows during its brief validity window. The result is a fairness failure where the victim’s escrowed assets are transferred to the attacker without receiving durable reciprocal value.

#### Severity

**Impact Explanation:** [High] Victims’ escrowed principal is transferred to the attacker upon collection and cannot be reclaimed; this is a direct, material loss of funds.

**Likelihood Explanation:** [Medium] Exploitation depends on integrators configuring escrow-as-arbiter without time-property arbiters; this is uncommon but plausible. The attacker needs temporary capital for the counter-escrow and timely execution, both manageable constraints with clear profit incentive.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Non-tierable ERC20 escrow: Attacker creates a short-lived ERC20 counter-escrow referencing the victim’s ERC20 escrow, immediately collects the victim’s escrowed tokens to themselves, then after a brief expiration reclaims their own ERC20 from the counter-escrow.
#### Preconditions / Assumptions
- (a). Victim creates an ERC20 escrow using the non-tierable ERC20EscrowObligation with arbiter set to an escrow-as-arbiter (e.g., ERC20EscrowObligation) without time-property arbiters
- (b). The escrow’s demand specifies the counter-escrow’s token/amount/arbiter/demand fields
- (c). Attacker can create a fulfillment attestation with a very short expiration and set refUID to the victim escrow’s UID
- (d). Tokens behave standardly; EAS and SchemaRegistry function per assumptions

### Scenario 2.
Non-tierable Native token escrow: Victim escrows ETH; attacker presents a short-lived ERC20 counter-escrow matching demand, collects the ETH to themselves, and later reclaims the ERC20 after the counter-escrow expires.
#### Preconditions / Assumptions
- (a). Victim creates a non-tierable NativeToken escrow (ETH) with arbiter set to an escrow-as-arbiter (e.g., ERC20EscrowObligation) without time-property arbiters
- (b). The escrow’s demand requires a specific ERC20 token and amount
- (c). Attacker can create a matching short-lived ERC20 fulfillment attestation with refUID set to the victim escrow’s UID
- (d). Tokens behave standardly; EAS and SchemaRegistry function per assumptions

### Scenario 3.
Tierable ERC20 escrow: Multiple escrows share identical demand and arbiter configuration; attacker creates a single short-lived ERC20 fulfillment and reuses it to collect multiple victim escrows before it expires, then reclaims the ERC20 after expiration.
#### Preconditions / Assumptions
- (a). Multiple victims (or multiple escrows) use the tierable ERC20EscrowObligation with identical demand bytes and arbiter set to the escrow-as-arbiter without time-property arbiters
- (b). Tierable design allows fulfillment reuse and does not require refUID equality
- (c). Attacker can create one short-lived fulfillment matching the common demand and call collect on multiple escrows before it expires
- (d). Tokens behave standardly; EAS and SchemaRegistry function per assumptions

#### Proposed fix

##### BaseEscrowObligation.sol

File: `contracts/src/BaseEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligation.sol)

```diff
 ... 93 unchanged lines ...
         if (fulfillment.refUID != escrow.uid) revert InvalidFulfillment();
 
+        // SECURITY NOTE:
+        // If the selected arbiter does not enforce a minimum remaining lifetime for `fulfillment`,
+        // a very short-lived counter-escrow can pass this check and then be reclaimed after expiry.
+        // Mitigate by composing with a time-property arbiter (e.g., AllArbiter + ExpirationTimeAfterArbiter)
+        // or by extending escrow data to include and enforce a minimum fulfillment expiration.
+
         // Check fulfillment via the specified arbiter
         if (!IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid))
 ... 83 unchanged lines ...
```

##### BaseEscrowObligationTierable.sol

File: `contracts/src/BaseEscrowObligationTierable.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligationTierable.sol)

```diff
 ... 93 unchanged lines ...
         // This allows multiple escrows to be associated with one fulfillment
 
+        // SECURITY NOTE:
+        // If the selected arbiter does not enforce a minimum remaining lifetime for `fulfillment`,
+        // a short-lived fulfillment can be reused to collect multiple escrows and then be reclaimed after expiry.
+        // Mitigate by composing with a time-property arbiter (e.g., AllArbiter + ExpirationTimeAfterArbiter)
+        // or by extending escrow data to include and enforce a minimum fulfillment expiration.
+
         // Check fulfillment via the specified arbiter
         if (!IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid))
 ... 83 unchanged lines ...
```

### 13. [High] Missing recipient/finality checks in escrow arbiters and release-to-fulfillment.recipient in BaseEscrowObligation cause theft of escrowed assets

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Escrow contracts used as arbiters accept fulfillments without constraining recipient or finality; shared release logic pays the outer escrow to fulfillment.recipient, allowing attackers to claim the outer escrow to themselves and later reclaim their inner escrow deposit.

All EscrowObligation contracts (ERC20/ERC721/ERC1155/NativeToken/TokenBundle; tierable and non-tierable) implement IArbiter.checkObligation by comparing only token fields and arbiter/demand bytes and do not constrain the fulfillment attestation’s recipient or require finality (non-expiring/non-revocable). BaseEscrowObligation and BaseEscrowObligationTierable release escrowed assets to fulfillment.recipient after arbiter approval. Because BaseObligation.doObligationRaw is public, an attacker can mint a fulfillment attestation (an inner escrow) with recipient = attacker (doObligationRaw uses msg.sender) and, for non-tierable, set refUID = the outer escrow UID. The arbiter accepts this as valid; the outer escrow is released to the attacker. After the inner escrow expires, reclaimExpired returns the inner deposit to its recipient (the attacker). Tierable escrows further allow reusing a single inner escrow across multiple outer escrows with identical demand bytes. PaymentObligation arbiters avoid this by effecting immediate, final payment to the intended payee, but escrow arbiters do not.

#### Severity

**Impact Explanation:** [High] Direct, material loss of users’ escrowed principal: outer escrowed assets are released to the attacker.

**Likelihood Explanation:** [Medium] Exploitation requires integrators/buyers to select escrow arbiters instead of payment arbiters or omit recipient/finality constraints; this is a plausible, supported configuration. Once present, the attack is straightforward and economically rational.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Tierable mass-drain: Multiple buyers create tierable outer escrows (e.g., NativeTokenEscrowObligation-tierable) with identical demand bytes pointing to an ERC20 EscrowObligation arbiter. The attacker creates one inner escrow matching the demand with recipient=attacker and short expiration, then collects each outer escrow; all outer assets are sent to the attacker. After expiration, the attacker reclaims the inner deposit.
#### Preconditions / Assumptions
- (a). Outer contract is a tierable escrow; arbiter is an EscrowObligation (not a PaymentObligation).
- (b). Multiple buyers use identical demand bytes and the same arbiter address; each outer escrow has expirationTime > now.
- (c). Attacker controls enough of the demanded asset to temporarily lock in the inner escrow.

### Scenario 2.
Non-tierable single-drain: A buyer creates a non-tierable ERC20 outer escrow with arbiter set to an ERC20 EscrowObligation and demand for token B. The attacker calls doObligationRaw on the arbiter to create a matching inner escrow with recipient=attacker and refUID=outerEscrowUid, collects the outer escrow (token A) to themselves, and later reclaims the inner token B deposit after expiration.
#### Preconditions / Assumptions
- (a). Outer contract is a non-tierable escrow; arbiter is an EscrowObligation (not a PaymentObligation).
- (b). Attacker can call doObligationRaw on the arbiter to set refUID = outer escrow UID and recipient = attacker.
- (c). Attacker holds the demanded token amount to temporarily lock in the inner escrow.

### Scenario 3.
Cross-asset drain (ETH outer, ERC20 inner): A buyer escrows ETH in NativeTokenEscrowObligation (tierable or non-tierable) with arbiter set to ERC20 EscrowObligation demanding X of token T. The attacker creates a matching inner escrow (recipient=attacker; non-tierable sets refUID), collects the outer ETH to themselves, and reclaims the ERC20 deposit after expiration.
#### Preconditions / Assumptions
- (a). Outer contract is NativeTokenEscrowObligation (tierable or non-tierable); arbiter is an ERC20 EscrowObligation.
- (b). Buyer locks ETH in the outer escrow; demand requires locking X of ERC20 T in the inner escrow.
- (c). Attacker has X of ERC20 T to temporarily lock; for non-tierable, attacker can set refUID = outer escrow UID.

#### Proposed fix

##### BaseEscrowObligation.sol

File: `contracts/src/BaseEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligation.sol)

```diff
 ... 84 unchanged lines ...
 
         if (!escrow._checkIntrinsic()) revert InvalidEscrowAttestation();
+        if (fulfillment.expirationTime != 0) revert InvalidFulfillment();
 
         // Extract arbiter and demand from escrow data
 ... 92 unchanged lines ...
```

##### BaseEscrowObligationTierable.sol

File: `contracts/src/BaseEscrowObligationTierable.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligationTierable.sol)

```diff
 ... 84 unchanged lines ...
 
         if (!escrow._checkIntrinsic()) revert InvalidEscrowAttestation();
+        if (fulfillment.expirationTime != 0) revert InvalidFulfillment();
 
         // Extract arbiter and demand from escrow data
 ... 92 unchanged lines ...
```

##### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 606 unchanged lines ...
 
         if (!escrow._checkIntrinsic()) revert InvalidEscrowAttestation();
+        if (fulfillment.expirationTime != 0) revert InvalidFulfillment();
 
         // Extract arbiter and demand from escrow data
 ... 88 unchanged lines ...
```

##### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 606 unchanged lines ...
 
         if (!escrow._checkIntrinsic()) revert InvalidEscrowAttestation();
+        if (fulfillment.expirationTime != 0) revert InvalidFulfillment();
 
         // Extract arbiter and demand from escrow data
 ... 88 unchanged lines ...
```

### 14. [High] Unbounded iteration in AnyArbiter.checkObligation causes escrow collection DoS

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

AnyArbiter iterates over an unbounded, buyer-supplied list of arbiters and makes external calls to each. A malicious buyer can front-load gas-heavy/reverting arbiters or use very large arrays to exhaust gas during collection, causing collectEscrowRaw to revert and preventing payout; funds can later be reclaimed by the buyer on expiry.

The AnyArbiter contract decodes demand into two dynamic arrays (addresses and bytes) and iterates over them, calling each IArbiter.checkObligation in a try/catch. There is no on-chain cap on array length or per-iteration gas, and reverts are ignored to continue looping. BaseEscrowObligation and BaseEscrowObligationTierable both invoke IArbiter.checkObligation during collectEscrowRaw and revert if it fails; an out-of-gas in AnyArbiter.checkObligation reverts the entire collection. A malicious buyer can 1) front-load a few custom 'gas-bomb' arbiters that consume most forwarded gas (then revert/return false) so execution never reaches a passing arbiter, or 2) encode very large arrays to make decode/iteration/calls prohibitively expensive. No on-chain mitigations (caps or allowlists) exist. As a result, the fulfiller cannot collect escrow; upon expiry, reclaimExpired returns the escrowed funds to the buyer (attestation recipient), denying payout despite fulfillment.

#### Severity

**Impact Explanation:** [Medium] This causes significant but temporary availability loss/DoS of a core function (escrow collection) for affected escrows until expiry; it does not directly steal victim principal funds.

**Likelihood Explanation:** [High] A malicious buyer can readily select and order arbiters or deploy gas-heavy arbiters to induce out-of-gas; there are no special constraints and clear incentive exists to avoid paying after receiving service.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Buyer deploys 2–3 custom heavy arbiters whose checkObligation consume near-all forwarded gas and then revert/return false; constructs AnyArbiter demand with these arbiters ordered before a passing arbiter; creates an escrow using this demand and a short expiration. When the fulfiller calls collectEscrowRaw, AnyArbiter drains gas on the early heavy calls and reverts before reaching the passing arbiter, preventing collection; after expiry the buyer calls reclaimExpired to recover funds.
#### Preconditions / Assumptions
- (a). Buyer controls arbiter address and demand contents/order
- (b). Buyer can deploy custom IArbiter contracts with gas-heavy STATICCALL logic
- (c). Escrow expirationTime can be set short by the buyer
- (d). Fulfiller completes work and attempts collectEscrowRaw on the escrow contract

### Scenario 2.
Buyer creates an AnyArbiter demand with a very large arbiters/demands array (most entries false/reverting) and embeds it in an escrow. During collectEscrowRaw, AnyArbiter must decode large dynamic arrays and iterate through many entries and external calls, exhausting gas and reverting; the fulfiller cannot collect, and the buyer later reclaims on expiry.
#### Preconditions / Assumptions
- (a). Buyer willing to pay higher storage cost to embed very large demand arrays
- (b). AnyArbiter demand contains many entries that return false or revert
- (c). Fulfiller attempts collectEscrowRaw on the escrow contract

### Scenario 3.
A compromised or misconfigured UI suggests AnyArbiter configurations that front-load attacker-controlled heavy arbiters. Honest buyers use these templates to create escrows. Fulfillers attempt to collect and encounter out-of-gas reverts in AnyArbiter, leading to systemic denial of payout across affected deals until expiries, after which buyers reclaim funds.
#### Preconditions / Assumptions
- (a). UI/marketplace misconfiguration or compromise injects heavy arbiters into suggested AnyArbiter configurations
- (b). Honest buyers use these templates to create escrows
- (c). Fulfillers attempt collectEscrowRaw on affected escrows

#### Proposed fix

##### AnyArbiter.sol

File: `contracts/src/arbiters/logical/AnyArbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/logical/AnyArbiter.sol)

```diff
 ... 22 unchanged lines ...
         if (demand_.arbiters.length != demand_.demands.length)
             revert MismatchedArrayLengths();
+        // FIXME: Bound demand size and number of arbiters to prevent gas DoS.
+        // e.g., require(demand.length <= MAX_DEMAND_BYTES) and require(demand_.arbiters.length <= MAX_ARBITERS).
+        // Also consider per-subdemand length caps.
 
         for (uint256 i = 0; i < demand_.arbiters.length; i++) {
-            try
-                // can throw, since some arbiters throw with failure case instead of returning false
-                IArbiter(demand_.arbiters[i]).checkObligation(
-                    obligation,
-                    demand_.demands[i],
-                    fulfilling
-                )
-            returns (bool result) {
-                if (result) {
-                    return true;
-                }
-            } catch {
-                // ignore base errors, since future arbiter might pass
-                continue;
-            }
+            // FIXME: Replace with low-level staticcall using a per-subcall gas stipend to bound gas and prevent OOG DoS:
+            // (bool ok, bytes memory ret) = demand_.arbiters[i].staticcall{gas: SUBCALL_GAS_STIPEND}(
+            //     abi.encodeWithSelector(IArbiter.checkObligation.selector, obligation, demand_.demands[i], fulfilling)
+            // );
+            // if (ok && ret.length >= 32 && abi.decode(ret, (bool))) return true;
         }
         return false;
     }
 
     function decodeDemandData(
         bytes calldata data
     ) public pure returns (DemandData memory) {
         return abi.decode(data, (DemandData));
     }
 }
```

##### AllArbiter.sol

File: `contracts/src/arbiters/logical/AllArbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/logical/AllArbiter.sol)

```diff
 ... 22 unchanged lines ...
         if (demand_.arbiters.length != demand_.demands.length)
             revert MismatchedArrayLengths();
+        // FIXME: Bound demand size and number of arbiters to prevent gas DoS.
+        // e.g., require(demand.length <= MAX_DEMAND_BYTES) and require(demand_.arbiters.length <= MAX_ARBITERS).
+        // Also consider per-subdemand length caps.
 
         for (uint256 i = 0; i < demand_.arbiters.length; i++) {
             if (
                 // can throw, since some arbiters throw with failure case instead of returning false
                 // error must be checked against all base arbiters
                 !IArbiter(demand_.arbiters[i]).checkObligation(
                     obligation,
                     demand_.demands[i],
                     fulfilling
                 )
             ) {
                 return false;
             }
+            // FIXME: Instead of interface call above, use low-level staticcall with per-subcall gas stipend:
+            // (bool ok, bytes memory ret) = demand_.arbiters[i].staticcall{gas: SUBCALL_GAS_STIPEND}(...);
+            // Recommend: treat failure/malformed return as 'false' to keep bounded behavior and avoid revert-based DoS.
+            // If preserving revert semantics is required, document the tradeoff explicitly.
         }
         return true;
     }
 
     function decodeDemandData(
         bytes calldata data
     ) public pure returns (DemandData memory) {
         return abi.decode(data, (DemandData));
     }
 }
```

##### BaseEscrowObligation.sol

File: `contracts/src/BaseEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligation.sol)

```diff
 ... 94 unchanged lines ...
 
         // Check fulfillment via the specified arbiter
+        // NOTE (defense-in-depth): Consider invoking the arbiter via low-level staticcall with an overall gas cap and
+        // treating failure/malformed return as false to prevent full-tx OOG from arbiter logic from bubbling up.
+        // Prefer fixing logical arbiters (Any/All) to bound gas per subcall.
         if (!IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid))
             revert InvalidFulfillment();
 ... 82 unchanged lines ...
```

##### BaseEscrowObligationTierable.sol

File: `contracts/src/BaseEscrowObligationTierable.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligationTierable.sol)

```diff
 ... 94 unchanged lines ...
 
         // Check fulfillment via the specified arbiter
+        // NOTE (defense-in-depth): Consider invoking the arbiter via low-level staticcall with an overall gas cap and
+        // treating failure/malformed return as false to prevent full-tx OOG from arbiter logic from bubbling up.
+        // Prefer fixing logical arbiters (Any/All) to bound gas per subcall.
         if (!IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid))
             revert InvalidFulfillment();
 ... 82 unchanged lines ...
```

### 15. [High] Validation/release mismatch in AttestationEscrowObligation and AttestationEscrowObligation2 causes arbitrary attestation delivery differing from arbiter-validated demand

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

The escrow contracts validate a fulfillment against demand.attestation (or demand.attestationUid) but mint on release using a separate, unchecked attestation field from the escrow’s stored data, allowing the escrow creator to deliver a different attestation than the one validated.

In AttestationEscrowObligation (both non-tierable and tierable), collectEscrowRaw extracts arbiter and demand from escrow.data and calls checkObligation, which compares the fulfillment’s embedded AttestationRequest to demand.attestation and ancillary fields. However, on release, _releaseEscrow decodes escrow.data and calls eas.attest(decoded.attestation), minting based on the escrow’s embedded attestation rather than the one validated by the arbiter. The ‘to’ parameter (fulfillment.recipient) is ignored; the minted recipient is taken from decoded.attestation. This enables the escrow creator to set demand.attestation = X (to satisfy arbitration) but escrow.attestation = Y (what actually gets minted), changing recipient, schema, revocability, etc. In AttestationEscrowObligation2, checkObligation compares fulfillment.data.attestationUid to demand.attestationUid, but _releaseEscrow creates a validation attestation that references the escrow’s attestationUid (not the validated one). Thus, the deliverable attestation or validation can differ from what was validated, breaking the escrow’s functional guarantee.

#### Severity

**Impact Explanation:** [Medium] This breaks important functional guarantees of the attestation escrow contracts by allowing a different attestation or validation to be delivered than the one validated, but it does not directly cause loss of principal funds or break system-wide core mechanics.

**Likelihood Explanation:** [High] Exploitation requires no special constraints: the buyer unilaterally crafts escrow.data, no validation occurs at creation, and the arbiter check does not bind the released attestation to the validated demand.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Wrong recipient minted: The buyer creates an escrow where demand.attestation requires minting to the fulfiller, but escrow.attestation encodes a different recipient (the buyer). The fulfiller submits a matching fulfillment; checkObligation passes. On release, the contract mints the attestation to the buyer (from escrow.attestation), and the fulfiller receives nothing.
#### Preconditions / Assumptions
- (a). Contracts deployed as-is (AttestationEscrowObligation non-tierable or tierable).
- (b). Buyer controls escrow creation inputs; _lockEscrow is a no-op for attestation escrows.
- (c). EAS/schema selection permits minting the escrow.attestation Y (no restrictive resolver blocking Y).
- (d). For non-tierable: the fulfillment’s refUID is set to escrow.uid; for tierable: no refUID linkage is required.

### Scenario 2.
Wrong revocability/schema minted: The buyer sets demand.attestation with specific semantics (e.g., non-revocable under schema S1) but encodes escrow.attestation with different semantics (e.g., revocable or different schema S2). After a valid fulfillment, release mints the altered attestation (from escrow.attestation), breaking the expected deliverable’s semantics.
#### Preconditions / Assumptions
- (a). Contracts deployed as-is (AttestationEscrowObligation non-tierable or tierable).
- (b). Buyer controls escrow creation inputs; _lockEscrow is a no-op for attestation escrows.
- (c). EAS/schema selection permits minting the altered escrow.attestation Y (e.g., schema S2 or different revocability).
- (d). For non-tierable: the fulfillment’s refUID is set to escrow.uid; for tierable: no refUID linkage is required.

### Scenario 3.
V2 wrong UID validated: Using AttestationEscrowObligation2, the buyer sets demand.attestationUid = X but escrow.attestationUid = Y. A valid fulfillment referencing X passes checkObligation. On release, the contract mints a validation attestation referencing Y (from escrow.attestationUid), not X, undermining the promised validation.
#### Preconditions / Assumptions
- (a). Contract deployed as-is (AttestationEscrowObligation2).
- (b). Buyer controls escrow creation inputs; sets demand.attestationUid = X and escrow.attestationUid = Y.
- (c). Fulfiller creates a fulfillment referencing X; EAS and VALIDATION_SCHEMA allow minting the validation attestation.

#### Proposed fix

##### AttestationEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation.sol)

```diff
 ... 56 unchanged lines ...
 
         bytes32 attestationUid;
-        try eas.attest(decoded.attestation) returns (bytes32 uid) {
+        try eas.attest(abi.decode(decoded.demand, (ObligationData)).attestation) returns (bytes32 uid) {
             attestationUid = uid;
         } catch {
 ... 83 unchanged lines ...
```

##### AttestationEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/AttestationEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/AttestationEscrowObligation.sol)

```diff
 ... 56 unchanged lines ...
 
         bytes32 attestationUid;
-        try eas.attest(decoded.attestation) returns (bytes32 uid) {
+        try eas.attest(abi.decode(decoded.demand, (ObligationData)).attestation) returns (bytes32 uid) {
             attestationUid = uid;
         } catch {
 ... 83 unchanged lines ...
```

##### AttestationEscrowObligation2.sol

File: `contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation2.sol)

```diff
 ... 70 unchanged lines ...
                     expirationTime: 0, // Permanent
                     revocable: false,
-                    refUID: decoded.attestationUid,
-                    data: abi.encode(decoded.attestationUid),
+                    refUID: abi.decode(decoded.demand, (ObligationData)).attestationUid,
+                    data: abi.encode(abi.decode(decoded.demand, (ObligationData)).attestationUid),
                     value: 0
                 })
 ... 82 unchanged lines ...
```

##### AttestationEscrowObligation2.sol

File: `contracts/src/obligations/escrow/tierable/AttestationEscrowObligation2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/AttestationEscrowObligation2.sol)

```diff
 ... 70 unchanged lines ...
                     expirationTime: 0, // Permanent
                     revocable: false,
-                    refUID: decoded.attestationUid,
-                    data: abi.encode(decoded.attestationUid),
+                    refUID: abi.decode(decoded.demand, (ObligationData)).attestationUid,
+                    data: abi.encode(abi.decode(decoded.demand, (ObligationData)).attestationUid),
                     value: 0
                 })
 ... 82 unchanged lines ...
```

### 16. [High] Zero-expiration sentinel mishandled in ExpirationTimeBefore/After arbiters causes unauthorized escrow release

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

The expirationTime == 0 sentinel (“never expires”) is treated as a literal 0 by ExpirationTimeBeforeArbiter and ExpirationTimeAfterArbiter, causing non-expiring fulfillments to bypass “before T” constraints or be incorrectly rejected for “after T” constraints. This can release escrowed funds under weaker-than-intended conditions or block intended durable fulfillments.

EAS defines expirationTime == 0 as a non-expiring attestation. The system elsewhere honors this (e.g., intrinsic checks and reclaimExpired treat 0 as “never expires”). However, ExpirationTimeBeforeArbiter and ExpirationTimeAfterArbiter compare expirationTime numerically and ignore the 0 sentinel. As a result: (1) ExpirationTimeBeforeArbiter will accept a never-expiring (0) fulfillment for any positive cutoff T, undermining a buyer’s intent to require a short-lived fulfillment; (2) ExpirationTimeAfterArbiter will reject a never-expiring fulfillment for any positive cutoff T, over-constraining cases where durable fulfillments should be accepted. Base escrow contracts validate only the escrow attestation intrinsically and defer fulfillment validity entirely to the chosen arbiter, so this mishandling directly controls release behavior. In tierable escrows, a single never-expiring fulfillment can be reused to collect multiple escrows, amplifying impact.

#### Severity

**Impact Explanation:** [High] Scenarios 1 and 2 enable direct, material loss of principal funds from one or multiple escrows to the attacker due to weakened constraints; Scenario 3 causes availability loss but does not reduce the overall impact categorization.

**Likelihood Explanation:** [Medium] Exploitation depends on buyers choosing these arbiters with a positive cutoff and not adding mitigating arbiters or resolvers. This is a notable but realistic configuration dependency; once present, exploitation is straightforward and profitable.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Non-tierable ERC20 escrow with ExpirationTimeBeforeArbiter(T>0): Attacker crafts a fulfillment attestation with expirationTime=0 and refUID=escrow.uid; the arbiter accepts it as “before T” and collectEscrow releases the buyer’s escrowed tokens to the attacker.
#### Preconditions / Assumptions
- (a). Buyer selects ExpirationTimeBeforeArbiter with demand.expirationTime=T>0 for a non-tierable escrow.
- (b). Buyer does not include additional arbiters/resolvers that would forbid or reinterpret 0-expiration.
- (c). EAS allows creating fulfillments with expirationTime=0.
- (d). Attacker can create an EAS fulfillment referencing the escrow via refUID=escrow.uid.

### Scenario 2.
Tierable ERC20 escrows with ExpirationTimeBeforeArbiter(T>0): Attacker creates one fulfillment with expirationTime=0 and reuses it across many escrows (no refUID match required in tierable), draining multiple buyers’ escrows as the arbiter accepts 0 as “before T.”
#### Preconditions / Assumptions
- (a). Multiple buyers use tierable escrows and select ExpirationTimeBeforeArbiter with demand.expirationTime=T>0.
- (b). No additional arbiters/resolvers are used that would forbid or reinterpret 0-expiration.
- (c). EAS allows creating fulfillments with expirationTime=0.
- (d). Tierable escrows allow fulfillment reuse without requiring refUID==escrow.uid.

### Scenario 3.
Any escrow with ExpirationTimeAfterArbiter(T>0): A legitimate never-expiring fulfillment (expirationTime=0) is incorrectly rejected as not “after T,” causing the deal to fail and funds to remain locked until the escrow expires.
#### Preconditions / Assumptions
- (a). Buyer selects ExpirationTimeAfterArbiter with demand.expirationTime=T>0.
- (b). A legitimate fulfiller provides a never-expiring (expirationTime=0) fulfillment.
- (c). No additional arbiters/resolvers alter 0-expiration interpretation.

#### Proposed fix

##### ExpirationTimeAfterArbiter.sol

File: `contracts/src/arbiters/attestation-properties/ExpirationTimeAfterArbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/attestation-properties/ExpirationTimeAfterArbiter.sol)

```diff
 ... 20 unchanged lines ...
     ) public pure override returns (bool) {
         DemandData memory demand_ = abi.decode(demand, (DemandData));
-        if (obligation.expirationTime < demand_.expirationTime)
+        if (demand_.expirationTime != 0 && obligation.expirationTime != 0 && obligation.expirationTime < demand_.expirationTime)
             revert ExpirationTimeNotAfter();
 
         return true;
     }
 
     function decodeDemandData(
         bytes calldata data
     ) public pure returns (DemandData memory) {
         return abi.decode(data, (DemandData));
     }
 }
```

##### ExpirationTimeBeforeArbiter.sol

File: `contracts/src/arbiters/attestation-properties/ExpirationTimeBeforeArbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/attestation-properties/ExpirationTimeBeforeArbiter.sol)

```diff
 ... 20 unchanged lines ...
     ) public pure override returns (bool) {
         DemandData memory demand_ = abi.decode(demand, (DemandData));
-        if (obligation.expirationTime > demand_.expirationTime)
+        if (demand_.expirationTime != 0 && (obligation.expirationTime == 0 || obligation.expirationTime > demand_.expirationTime))
             revert ExpirationTimeNotBefore();
 
         return true;
     }
 
     function decodeDemandData(
         bytes calldata data
     ) public pure returns (DemandData memory) {
         return abi.decode(data, (DemandData));
     }
 }
```

### 17. [Medium] Empty-demand handling in AnyArbiter causes uncollectable and potentially permanent escrow lock

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

AnyArbiter returns false when given empty arbiters/demands arrays, making escrows that reference it uncollectable. If the escrow has no expiry, funds are permanently locked; with long expiries, funds are frozen until expiry.

AnyArbiter decodes DemandData and verifies only that arbiters.length == demands.length. If both arrays are empty, the loop does not run and checkObligation returns false. BaseEscrowObligation(_Tierable).collectEscrowRaw reverts with InvalidFulfillment() when the arbiter returns false, making the escrow uncollectable. reclaimExpired() requires a non-zero expirationTime; if expirationTime == 0, reclaiming is impossible and funds remain permanently locked. This affects all escrow obligations that embed (arbiter, demand) into their attestation data and delegate collection checks to IArbiter.checkObligation (e.g., NativeToken/ERC20/ERC721/ERC1155/TokenBundle/Attestation escrows). The behavior can be triggered by a compromised/misconfigured UI/SDK that encodes an empty AnyArbiter demand and by users selecting non-expiring or long-expiry escrows.

#### Severity

**Impact Explanation:** [High] Escrowed funds can be frozen for longer than a week and, with zero expiry, permanently, with no on-chain workaround to release funds.

**Likelihood Explanation:** [Low] Exploitation depends on a misconfigured or compromised UI/SDK and user adoption of those parameters; it is primarily a griefing vector without direct attacker profit.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Permanent lock: A compromised or buggy UI/SDK encodes AnyArbiter with empty arrays for an escrow and sets expirationTime = 0. Collection always fails (AnyArbiter returns false), and reclaimExpired reverts due to zero expiry, permanently locking funds.
#### Preconditions / Assumptions
- (a). Escrow obligation uses AnyArbiter as its arbiter
- (b). Demand is encoded with DemandData where arbiters=[] and demands=[]
- (c). Escrow expirationTime == 0 (never expires)
- (d). UI/SDK/front-end encodes the empty demand due to manipulation or bug

### Scenario 2.
Long-duration lock: A UI/SDK encodes AnyArbiter with empty arrays and sets a long expirationTime (e.g., weeks). Collection always fails until expiry, freezing funds until reclaimExpired can be called after the long duration.
#### Preconditions / Assumptions
- (a). Escrow obligation uses AnyArbiter as its arbiter
- (b). Demand is encoded with DemandData where arbiters=[] and demands=[]
- (c). Escrow expirationTime is long (greater than one week)
- (d). UI/SDK/front-end encodes the empty demand due to manipulation or bug

### Scenario 3.
Bulk DoS via marketplace: A widely used marketplace front-end is compromised or ships a bug that encodes empty AnyArbiter demands (and long or zero expiries) for many users' escrows, causing widespread uncollectable escrows and large-scale fund freezing.
#### Preconditions / Assumptions
- (a). A widely used marketplace/aggregator front-end integrates the escrows and builds AnyArbiter demands
- (b). Front-end is compromised or ships a bug that encodes arbiters=[] and demands=[]
- (c). Escrows created via this front-end use long or zero expiries

#### Proposed fix

##### AnyArbiter.sol

File: `contracts/src/arbiters/logical/AnyArbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/logical/AnyArbiter.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {Attestation} from "@eas/Common.sol";
 import {IArbiter} from "../../IArbiter.sol";
 import {ArbiterUtils} from "../../ArbiterUtils.sol";
 
 contract AnyArbiter is IArbiter {
     // validates any base arbiter arbitrates true
     struct DemandData {
         address[] arbiters;
         bytes[] demands;
     }
 
     error MismatchedArrayLengths();
+    error EmptyDemand();
 
     function checkObligation(
         Attestation memory obligation,
         bytes memory demand,
         bytes32 fulfilling
     ) public view override returns (bool) {
         DemandData memory demand_ = abi.decode(demand, (DemandData));
         if (demand_.arbiters.length != demand_.demands.length)
             revert MismatchedArrayLengths();
+        // Revert on empty input to prevent creating impossible/uncollectable escrows
+        if (demand_.arbiters.length == 0) revert EmptyDemand();
 
         for (uint256 i = 0; i < demand_.arbiters.length; i++) {
 ... 25 unchanged lines ...
```

##### BaseEscrowObligation.sol

File: `contracts/src/BaseEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligation.sol)

```diff
 ... 158 unchanged lines ...
     }
 
+    // SECURITY-TODO: Consider adding a buyer-only cancelIfAnyArbiterEmpty(uid) that revokes and returns escrow
+    // when arbiter == canonical AnyArbiter and its DemandData arrays are empty; alternatively enforce non-zero expiry
+    // at creation to ensure reclaim path and avoid permanent locks from misconfigured arbiters.
     // Hook implementations
     function _beforeAttest(
         bytes memory data,
         address payer,
         address /*recipient*/
     ) internal virtual override {
         _lockEscrow(data, payer);
     }
 
     // Hook implementations
 
     function _afterAttest(
         bytes32 uid,
         bytes memory /*data*/,
         address /*payer*/,
         address recipient
     ) internal override {
         emit EscrowMade(uid, recipient);
     }
 }
```

##### BaseEscrowObligationTierable.sol

File: `contracts/src/BaseEscrowObligationTierable.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligationTierable.sol)

```diff
 ... 158 unchanged lines ...
     }
 
+    // SECURITY-TODO: Consider adding a buyer-only cancelIfAnyArbiterEmpty(uid) that revokes and returns escrow
+    // when arbiter == canonical AnyArbiter and its DemandData arrays are empty; alternatively enforce non-zero expiry
+    // at creation to ensure reclaim path and avoid permanent locks from misconfigured arbiters.
     // Hook implementations
     function _beforeAttest(
         bytes memory data,
         address payer,
         address /*recipient*/
     ) internal virtual override {
         _lockEscrow(data, payer);
     }
 
     // Hook implementations
 
     function _afterAttest(
         bytes32 uid,
         bytes memory /*data*/,
         address /*payer*/,
         address recipient
     ) internal override {
         emit EscrowMade(uid, recipient);
     }
 }
```

#### Related findings

##### [Medium] Order-sensitive short-circuit and uncaught child reverts in AllArbiter cause permanent escrow lock for zero-expiry escrows

###### Description

AllArbiter short-circuits on false and propagates reverts from later children. With a false-returning pending arbiter placed first and a permanently reverting arbiter later, early collections appear pending; once the pending condition turns true, the later revert surfaces, making the escrow uncollectable. If the escrow has no expiry, funds are permanently locked.

AllArbiter evaluates child arbiters in order, returning false on the first false and not catching reverts from later children. Several arbiters in the repository intentionally return false to represent a pending state (e.g., TrustedOracleArbiter and all Splitter arbiters before a decision exists), while many others revert on failure (e.g., Attester/Recipient/Schema/Time/Expiration arbiters and those using ArbiterUtils._checkIntrinsic). BaseEscrowObligation.collectEscrowRaw treats a false result as a standard InvalidFulfillment but allows underlying child reverts to bubble up. When a composition places a false-returning pending arbiter first and an always-reverting arbiter later, attempts to collect before the decision simply look pending. After the decision flips true, evaluation reaches the later child and reverts permanently. If the escrow was created with expirationTime == 0, reclaimExpired is disallowed and there is no fallback, resulting in a permanent lock of escrowed assets.

###### Severity

**Impact Explanation:** [High] Escrowed funds can be permanently frozen with no reclaim path due to zero-expiry escrows and a composition that becomes uncollectable once the pending child turns true.

**Likelihood Explanation:** [Low] Exploitation requires several user/UI-driven preconditions: constructing an impossible arbiter composition, ordering a pending false-returning child before a reverting child, and setting zero expiry. While plausible under a malicious or buggy UI, this combined misconfiguration is uncommon.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
ERC20 escrow with AllArbiter: first child TrustedOracleArbiter (false until decision), second child TimeBeforeArbiter with a past timestamp. Before oracle decision, collections fail as InvalidFulfillment (pending). After decision, TimeBeforeArbiter reverts, and since expirationTime == 0, the buyer cannot reclaim—ERC20 tokens are locked permanently.
#### Preconditions / Assumptions
- (a). Buyer creates ERC20 escrow with expirationTime == 0 (non-reclaimable).
- (b). AllArbiter demand lists TrustedOracleArbiter first (pending false until decision).
- (c). AllArbiter demand lists TimeBeforeArbiter second with a past timestamp, making any new fulfillment fail and revert.
- (d). Oracle eventually provides a positive decision (oracle is trusted and behaves as expected).
- (e). Fulfiller submits a fulfillment attestation referencing the escrow.

### Scenario 2.
ETH escrow with AllArbiter: first child NativeTokenSplitter (false until decision), second child AttesterArbiter requiring an unattainable attester for the fulfillment. After oracle decision, AttesterArbiter reverts. With zero expiry, reclaim is impossible and ETH remains locked.
#### Preconditions / Assumptions
- (a). Buyer creates native token (ETH) escrow with expirationTime == 0 (non-reclaimable).
- (b). AllArbiter demand lists NativeTokenSplitter (or TrustedOracleArbiter) first (pending false until decision).
- (c). AllArbiter demand lists AttesterArbiter second with a demanded attester that the fulfillment cannot satisfy.
- (d). Oracle eventually provides a positive decision.
- (e). Fulfiller submits a fulfillment attestation referencing the escrow.

### Scenario 3.
Token bundle escrow with AllArbiter: first child TokenBundleSplitter (false until decision), second child ExpirationTimeBeforeArbiter with a past timestamp. After decision, the expiration constraint reverts for any practical fulfillment. Zero expiry prevents reclaim, permanently locking the bundle.
#### Preconditions / Assumptions
- (a). Buyer creates token bundle escrow with expirationTime == 0 (non-reclaimable).
- (b). AllArbiter demand lists TokenBundleSplitter (or SplitterBase) first (pending false until decision).
- (c). AllArbiter demand lists ExpirationTimeBeforeArbiter second with a past timestamp the fulfillment cannot satisfy.
- (d). Oracle eventually provides a positive decision.
- (e). Fulfiller submits a fulfillment attestation referencing the escrow.

###### Proposed fix

####### BaseEscrowObligation.sol

File: `contracts/src/BaseEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligation.sol)

```diff
 ... 26 unchanged lines ...
     error AttestationNotFound(bytes32 attestationId);
     error RevocationFailed(bytes32 attestationId);
+    error NonZeroExpiryRequired();
 
     constructor(
 ... 24 unchanged lines ...
     ) public pure virtual returns (address arbiter, bytes memory demand);
 
+    function _doObligationForRaw(bytes memory data, uint64 expirationTime, address recipient, bytes32 refUID) internal virtual override returns (bytes32 uid_) {
+        if (expirationTime == 0) revert NonZeroExpiryRequired();
+        return super._doObligationForRaw(data, expirationTime, recipient, refUID);
+    }
+
     // Common escrow collection implementation
     function collectEscrowRaw(
 ... 122 unchanged lines ...
```

####### BaseEscrowObligationTierable.sol

File: `contracts/src/BaseEscrowObligationTierable.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligationTierable.sol)

```diff
 ... 26 unchanged lines ...
     error AttestationNotFound(bytes32 attestationId);
     error RevocationFailed(bytes32 attestationId);
+    error NonZeroExpiryRequired();
 
     constructor(
 ... 24 unchanged lines ...
     ) public pure virtual returns (address arbiter, bytes memory demand);
 
+    function _doObligationForRaw(bytes memory data, uint64 expirationTime, address recipient, bytes32 refUID) internal virtual override returns (bytes32 uid_) {
+        if (expirationTime == 0) revert NonZeroExpiryRequired();
+        return super._doObligationForRaw(data, expirationTime, recipient, refUID);
+    }
+
     // Common escrow collection implementation (tierable version - no refUID check)
     function collectEscrowRaw(
 ... 122 unchanged lines ...
```

### 18. [Medium] Missing recipient validation (zero/self) in NativeTokenEscrowObligation (tierable and non-tierable) causes ETH burn or permanent lock

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Both NativeTokenEscrowObligation variants send ETH to the fulfillment recipient without guarding against address(0) or address(this). An attacker can, under permissive arbiters, craft a fulfillment with these recipients to irreversibly burn funds or lock them in the contract after the escrow attestation is revoked.

In both tierable and non-tierable NativeTokenEscrowObligation, _releaseEscrow decodes the amount and sends ETH to `to` via a low-level call, only checking the call success and not validating the recipient address. The payout address in collectEscrow flows is `fulfillment.recipient`, and on reclaimExpired it is the escrow's attestation recipient. Because the contracts define a payable receive() function, sending to address(this) succeeds but results in no net outflow, leaving funds stuck after the attestation is revoked. Sending to address(0) succeeds and irreversibly burns ETH. There is no withdrawal or rescue function to recover funds. With permissive arbiters (e.g., TrivialArbiter always-true or IntrinsicsArbiter checking only intrinsic properties), an attacker can create a fulfillment attestation that sets the recipient to address(0) or address(this), pass the arbiter check, trigger escrow revocation, and then cause a successful call that either burns or locks funds.

#### Severity

**Impact Explanation:** [High] Funds can be irreversibly burned or permanently frozen with no workaround, constituting direct, material loss of principal or indefinite lock.

**Likelihood Explanation:** [Low] Exploitation relies on the victim selecting a permissive arbiter and yields no profit to the attacker (pure griefing), reducing practical likelihood.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Burn via zero-address recipient (tierable or non-tierable): A buyer creates a native-token escrow using a permissive arbiter and funds X ETH. The attacker creates a fulfillment attestation with recipient = address(0) (and sets refUID = escrow UID for non-tierable). The attacker calls collectEscrowRaw; the arbiter passes; the escrow attestation is revoked; _releaseEscrow sends X ETH to address(0) successfully, permanently burning the funds with no recovery path.
#### Preconditions / Assumptions
- (a). NativeTokenEscrowObligation (tierable or non-tierable) is deployed
- (b). Buyer creates an escrow with a permissive arbiter that does not restrict the fulfillment recipient (e.g., TrivialArbiter or IntrinsicsArbiter)
- (c). Escrow is funded with X ETH
- (d). Attacker can create a fulfillment attestation on EAS and set its recipient to address(0)
- (e). For non-tierable escrows, the fulfillment.refUID equals the escrow UID; for tierable, refUID link is not required
- (f). No rescue/withdrawal function exists in the escrow contract

### Scenario 2.
Permanent lock via self-send recipient (tierable or non-tierable): A buyer creates a native-token escrow using a permissive arbiter and funds X ETH. The attacker creates a fulfillment attestation with recipient = the escrow contract address (and sets refUID = escrow UID for non-tierable). The attacker calls collectEscrowRaw; the arbiter passes; the escrow attestation is revoked; _releaseEscrow sends X ETH to address(this), which succeeds due to the contract’s payable receive(), leaving the ETH stuck in the contract with no withdrawal mechanism. In tierable mode, a single fulfillment can be reused to lock multiple escrows.
#### Preconditions / Assumptions
- (a). NativeTokenEscrowObligation (tierable or non-tierable) is deployed
- (b). Buyer creates an escrow with a permissive arbiter that does not restrict the fulfillment recipient (e.g., TrivialArbiter or IntrinsicsArbiter)
- (c). Escrow is funded with X ETH
- (d). Attacker can create a fulfillment attestation on EAS and set its recipient to the escrow contract address
- (e). For non-tierable escrows, the fulfillment.refUID equals the escrow UID; for tierable, refUID link is not required
- (f). The escrow contract implements a payable receive() so self-sends succeed
- (g). No rescue/withdrawal function exists in the escrow contract

#### Proposed fix

##### NativeTokenEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/NativeTokenEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/NativeTokenEscrowObligation.sol)

```diff
 ... 62 unchanged lines ...
             (ObligationData)
         );
+        if (to == address(0) || to == address(this)) {
+            revert NativeTokenTransferFailed(to, decoded.amount);
+        }
 
         (bool success, ) = payable(to).call{value: decoded.amount}("");
 ... 84 unchanged lines ...
```

##### NativeTokenEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/NativeTokenEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/NativeTokenEscrowObligation.sol)

```diff
 ... 62 unchanged lines ...
             (ObligationData)
         );
+        if (to == address(0) || to == address(this)) {
+            revert NativeTokenTransferFailed(to, decoded.amount);
+        }
 
         (bool success, ) = payable(to).call{value: decoded.amount}("");
 ... 84 unchanged lines ...
```

#### Related findings

##### [Medium] Missing nonzero recipient validation in escrow settlement causes ETH burn and token freeze

###### Description

Escrow settlement functions use EAS attestation recipients as payout destinations without checking for address(0), allowing ETH burns on native transfers and preventing expiry reclaim for token escrows.

In BaseEscrowObligation and BaseEscrowObligationTierable, collectEscrowRaw transfers escrowed assets to fulfillment.recipient and reclaimExpired returns assets to attestation.recipient without enforcing recipient != address(0). Child native-token escrows release value via payable(to).call{value: amount} to the provided address, which succeeds even when to is address(0), irreversibly burning ETH. Token escrows (ERC20/721/1155) attempt transfers to the provided address; transfers to address(0) revert, making reclaimExpired permanently unusable for zero-recipient escrows (funds remain stuck after expiry). The typed doObligationFor entrypoints also allow creating zero-recipient attestations. TokenBundleEscrowObligation’s unsafe partial collection/reclaim further enables burning the native portion to address(0) while leaving token components stuck after the escrow attestation is revoked.

###### Severity

**Impact Explanation:** [High] Direct material loss of principal funds (ETH burned to the zero address) and indefinite freezing of escrowed tokens post-expiry with no workaround.

**Likelihood Explanation:** [Low] Exploitation typically requires either a lax arbiter and a griefing attacker (no direct profit) or a victim/integration creating an escrow with a zero recipient; both are uncommon and rely on misconfiguration or unprofitable behavior.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Burn escrowed ETH by collecting a NativeTokenEscrowObligation with a fulfillment attestation whose recipient is address(0) under a lax arbiter; the settlement pays ETH to the zero address and burns it.
#### Preconditions / Assumptions
- (a). Victim creates a native-token escrow using the escrow contract and selects a lax arbiter (e.g., TrivialArbiter or IntrinsicsArbiter) that does not constrain the fulfillment recipient.
- (b). Escrow is unexpired and unrevoked at collection time.
- (c). Attacker crafts a fulfillment attestation with recipient = address(0) and, for non-tierable escrows, refUID = escrow.uid; fulfillment is valid (not expired/revoked).

### Scenario 2.
Permanently freeze ERC20/ERC721/ERC1155 escrowed tokens post-expiry by creating the escrow attestation with recipient = address(0) and allowing it to expire; reclaimExpired reverts on zero-address token transfers and collection after expiry is impossible.
#### Preconditions / Assumptions
- (a). Victim or integration creates a token escrow (ERC20/ERC721/ERC1155) using doObligationFor with recipient = address(0).
- (b). Escrow was created with a nonzero expirationTime and later becomes expired.
- (c). No valid collection occurred before expiry.

### Scenario 3.
With TokenBundleEscrowObligation, use unsafePartiallyCollectEscrow with a zero-recipient fulfillment: the nativeAmount is sent to address(0) (burned) and token transfers fail without reverting, leaving tokens stranded after escrow attestation revocation.
#### Preconditions / Assumptions
- (a). Victim creates a TokenBundleEscrowObligation with nativeAmount > 0 (and possibly token components).
- (b). A lax arbiter is used that does not constrain fulfillment recipient.
- (c). Attacker (or caller) invokes unsafePartiallyCollectEscrow with a fulfillment whose recipient = address(0); for non-tierable escrows, refUID = escrow.uid.

###### Proposed fix

####### BaseEscrowObligation.sol

File: `contracts/src/BaseEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligation.sol)

```diff
 ... 110 unchanged lines ...
 
         // Execute the escrow release
+        if (fulfillment.recipient == address(0)) revert InvalidFulfillment();
         bytes memory result = _releaseEscrow(
             escrow.data,
 ... 26 unchanged lines ...
             revert UnauthorizedCall();
 
+        if (attestation.recipient == address(0)) revert InvalidEscrowAttestation();
         // Revoke attestation to prevent re-entry
         try
             eas.revoke(
                 RevocationRequest({
                     schema: ATTESTATION_SCHEMA,
                     data: RevocationRequestData({uid: uid, value: 0})
                 })
             )
         {} catch {
             revert RevocationFailed(uid);
         }
 
         // Return escrowed value to original recipient
         _returnEscrow(attestation.data, attestation.recipient);
 
         return true;
     }
 
     // Hook implementations
     function _beforeAttest(
         bytes memory data,
         address payer,
-        address /*recipient*/
+        address recipient
     ) internal virtual override {
+        if (recipient == address(0)) revert InvalidEscrowAttestation();
         _lockEscrow(data, payer);
     }
 
     // Hook implementations
 
     function _afterAttest(
         bytes32 uid,
         bytes memory /*data*/,
         address /*payer*/,
         address recipient
     ) internal override {
         emit EscrowMade(uid, recipient);
     }
 }
```

####### BaseEscrowObligationTierable.sol

File: `contracts/src/BaseEscrowObligationTierable.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligationTierable.sol)

```diff
 ... 110 unchanged lines ...
 
         // Execute the escrow release
+        if (fulfillment.recipient == address(0)) revert InvalidFulfillment();
         bytes memory result = _releaseEscrow(
             escrow.data,
 ... 26 unchanged lines ...
             revert UnauthorizedCall();
 
+        if (attestation.recipient == address(0)) revert InvalidEscrowAttestation();
         // Revoke attestation to prevent re-entry
         try
             eas.revoke(
                 RevocationRequest({
                     schema: ATTESTATION_SCHEMA,
                     data: RevocationRequestData({uid: uid, value: 0})
                 })
             )
         {} catch {
             revert RevocationFailed(uid);
         }
 
         // Return escrowed value to original recipient
         _returnEscrow(attestation.data, attestation.recipient);
 
         return true;
     }
 
     // Hook implementations
     function _beforeAttest(
         bytes memory data,
         address payer,
-        address /*recipient*/
+        address recipient
     ) internal virtual override {
+        if (recipient == address(0)) revert InvalidEscrowAttestation();
         _lockEscrow(data, payer);
     }
 
     // Hook implementations
 
     function _afterAttest(
         bytes32 uid,
         bytes memory /*data*/,
         address /*payer*/,
         address recipient
     ) internal override {
         emit EscrowMade(uid, recipient);
     }
 }
```

####### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 619 unchanged lines ...
             revert InvalidFulfillment();
 
+        if (fulfillment.recipient == address(0)) revert InvalidFulfillment();
         // Revoke attestation
         try
 ... 39 unchanged lines ...
             revert UnauthorizedCall();
 
+        if (attestation.recipient == address(0)) revert InvalidEscrowAttestation();
         // Revoke attestation to prevent re-entry
         try
 ... 32 unchanged lines ...
```

### 19. [Medium] Unvalidated raw ObligationData decoding in AttestationEscrowObligation causes collection-time revert and funds freeze when used as arbiter

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

AttestationEscrowObligation (tierable and non-tierable) accepts arbitrary bytes for ObligationData that nests an EAS AttestationRequest with a uint64 expirationTime without validation at creation. abi.decode later truncates oversized values or reverts on malformed inputs, which can silently change attestation semantics or cause collection-time reverts. When this contract is used as an arbiter by value-bearing escrows, malformed demand bytes can permanently block collection and freeze funds until expiry (or indefinitely if expiry is 0).

Both AttestationEscrowObligation contracts take arbitrary bytes for ObligationData, which includes a nested EAS AttestationRequest containing a uint64 expirationTime. Creation via doObligationRaw stores these bytes without validation because _lockEscrow is a no-op. On collection, the contracts decode the stored bytes and (1) as arbiters decode the demand bytes, and (2) in _releaseEscrow decode the nested AttestationRequest and call eas.attest. Solidity abi.decode truncates to uint64, so oversized expirationTime values (e.g., 2^64) are canonicalized to 0, which EAS treats as non-expiring, silently changing semantics. If the bytes are malformed and cannot be decoded as ObligationData, abi.decode reverts at collection time, bricking the flow. When these contracts are selected as arbiters by value-bearing escrows, a malformed demand (set by the buyer at escrow creation) causes checkObligation to revert on abi.decode, preventing collection. Funds remain locked until reclaimExpired; if the escrow expiration is 0 (non-expiring), reclaim is impossible and funds are frozen indefinitely. While typed wrappers reduce risk by canonicalizing inputs, doObligationRaw remains public, and there is no early validation of arbiter demand shape at outer escrow creation.

#### Severity

**Impact Explanation:** [High] When used as an arbiter for value-bearing escrows, malformed demand causes collection to revert, freezing funds until expiry with no workaround; if the escrow expires at 0 (non-expiring), funds can be frozen indefinitely, matching the rule for funds frozen for longer than a week with no workaround.

**Likelihood Explanation:** [Low] Exploitation requires specific arbiter selection and malformed demand setup (often via UI manipulation/misconfiguration) and, for permanent freezes, non-expiring or very long expirations. These are uncommon and depend on integrator/user behavior rather than an easy, profitable attack path.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
A value-bearing escrow (e.g., ERC20EscrowObligation) is created with AttestationEscrowObligation as arbiter and a malformed demand; at collection, the arbiter’s checkObligation abi.decode(demand) reverts, preventing payout and freezing funds until expiry (or indefinitely if expiry is 0).
#### Preconditions / Assumptions
- (a). A value-bearing escrow (e.g., ERC20EscrowObligation) is created and holds user funds
- (b). Buyer selects AttestationEscrowObligation (tierable or non-tierable) as arbiter via UI/manipulation/misconfiguration
- (c). Buyer provides malformed demand bytes not decodable as ObligationData for that arbiter
- (d). Seller mints a fulfillment attestation under the arbiter’s schema (public doObligationRaw), with correct refUID for non-tierable outer escrows
- (e). Outer collectEscrow calls IArbiter.checkObligation, which abi.decodes the malformed demand and reverts
- (f). Outer escrow has a long or non-expiring (0) expiration time

### Scenario 2.
AttestationEscrowObligation is used directly; the integration encodes the nested AttestationRequestData.expirationTime with an oversized integer via doObligationRaw; on release, decoding truncates to 0 and eas.attest mints a never-expiring attestation instead of a time-limited one.
#### Preconditions / Assumptions
- (a). Buyer uses AttestationEscrowObligation (tierable or non-tierable) to produce a final attestation on release
- (b). Integration uses doObligationRaw and encodes AttestationRequestData.expirationTime as an oversized 256-bit integer exceeding uint64 (e.g., 2^64)
- (c). Fulfillment condition is met and collection proceeds to _releaseEscrow where the nested request is decoded and passed to eas.attest

### Scenario 3.
AttestationEscrowObligation is used directly; the integration supplies malformed bytes for the nested AttestationRequest via doObligationRaw; at collection, abi.decode of ObligationData or the subsequent eas.attest fails, reverting the release and bricking the escrowed attestation output.
#### Preconditions / Assumptions
- (a). Buyer uses AttestationEscrowObligation (tierable or non-tierable)
- (b). Integration uses doObligationRaw with malformed bytes for the nested AttestationRequest/ObligationData that are not decodable
- (c). Fulfillment condition is met and collection proceeds to _releaseEscrow or checkObligation where abi.decode is attempted

#### Proposed fix

##### BaseEscrowObligation.sol

File: `contracts/src/BaseEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligation.sol)

```diff
 ... 164 unchanged lines ...
         address /*recipient*/
     ) internal virtual override {
+        // SECURITY: Pre-validate the arbiter 'demand' format at creation time (e.g., via a standardized
+        // IArbiterValidation interface on the 'arbiter') to reject malformed demand early and avoid
+        // collection-time decode reverts that can freeze funds until expiry.
         _lockEscrow(data, payer);
     }
 
     // Hook implementations
 
     function _afterAttest(
         bytes32 uid,
         bytes memory /*data*/,
         address /*payer*/,
         address recipient
     ) internal override {
+        // SECURITY: For value-bearing escrows, enforce a finite (non-zero) expirationTime here by fetching
+        // the attestation via _getAttestation(uid) and reverting if expirationTime == 0 to guarantee reclaimability.
         emit EscrowMade(uid, recipient);
     }
 }
```

##### AttestationEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation.sol)

```diff
 ... 92 unchanged lines ...
 
     // Typed convenience methods
+    // SECURITY: Also override doObligationRaw to decode ObligationData and re-encode (abi.encode(decoded))
+    // before calling _doObligationForRaw, to canonicalize nested AttestationRequest and reject bad encodings early.
+    // This prevents silent uint64 truncation (e.g., expirationTime) and late decode-time reverts.
     function doObligation(
         ObligationData calldata data,
 ... 48 unchanged lines ...
```

##### AttestationEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/AttestationEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/AttestationEscrowObligation.sol)

```diff
 ... 92 unchanged lines ...
 
     // Typed convenience methods
+    // SECURITY: Also override doObligationRaw to decode ObligationData and re-encode (abi.encode(decoded))
+    // before calling _doObligationForRaw, to canonicalize nested AttestationRequest and reject bad encodings early.
+    // This prevents silent uint64 truncation (e.g., expirationTime) and late decode-time reverts.
     function doObligation(
         ObligationData calldata data,
 ... 48 unchanged lines ...
```

### 20. [Medium] Helper attests and sets escrow recipient as itself in AttestationBarterUtils causes practical loss of user revocation rights

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

AttestationBarterUtils calls EAS.attest and AttestationEscrowObligation2.doObligation directly, making the helper the EAS attester and the escrow recipient. This prevents end users from revoking revocable attestations and breaks arbiters/integrations that rely on the user being attester or escrow recipient. No direct fund loss occurs for AttestationEscrowObligation2, but identity/authorization semantics are impacted.

AttestationBarterUtils performs EAS attestations and creates attestation escrows under its own contract identity instead of the caller’s. Specifically, attest() and attestAndCreateEscrow() invoke IEAS.attest(), which records attester = AttestationBarterUtils. Then attestAndCreateEscrow() calls AttestationEscrowObligation2.doObligation(...), which sets the escrow attestation’s recipient to msg.sender = AttestationBarterUtils. In EAS, only the attester can revoke; the helper does not expose a revoke passthrough or implement EIP-1271, making revocable attestations practically irrevocable for end users. Confirmation-style arbiters (e.g., ExclusiveUnrevocableConfirmationArbiter, NonexclusiveRevocableConfirmationArbiter) require escrow.recipient == msg.sender to confirm/revoke confirmations; since the recipient is the helper, users cannot perform these actions, causing collection to fail. Arbiters that check attester or recipient identities (e.g., AttesterArbiter, RecipientArbiter) also fail if they expect the end-user’s address. While AttestationEscrowObligation2 holds no assets and releases based on fulfillment.recipient (so funds are not misdirected), these identity/authorization mismatches materially affect revocation control and compatibility of arbiter-driven flows.

#### Severity

**Impact Explanation:** [Medium] Revocation control (an important EAS feature) becomes unusable for attestations created via the helper, and confirmation- or identity-dependent arbiter flows are DoS’d. No principal funds are lost and core protocol functions remain intact.

**Likelihood Explanation:** [Medium] Exploitation requires users to use this specific helper and later need revocation or choose confirmation/identity-dependent arbiters. These are plausible but not universal paths.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
A user creates a revocable EAS attestation via AttestationBarterUtils.attest; EAS records the helper as attester. Later, when the user attempts to revoke, EAS only allows the original attester to revoke, and because the helper exposes no revoke/EIP-1271 path, the user cannot revoke the attestation.
#### Preconditions / Assumptions
- (a). User uses AttestationBarterUtils.attest or attestAndCreateEscrow to create a revocable attestation
- (b). User later needs to revoke the attestation
- (c). AttestationBarterUtils does not expose a revoke passthrough and does not implement EIP-1271

### Scenario 2.
A buyer creates an attestation escrow using AttestationBarterUtils.attestAndCreateEscrow with a confirmation arbiter. The escrow attestation’s recipient is the helper, so the buyer cannot call the arbiter’s confirm function (which requires escrow.recipient == msg.sender). Collection fails due to failed arbiter checks.
#### Preconditions / Assumptions
- (a). User uses AttestationBarterUtils.attestAndCreateEscrow to create an escrow
- (b). A confirmation-style arbiter is selected for the escrow
- (c). User or fulfiller later attempts to collect and requires buyer confirmation
- (d). AttestationBarterUtils does not perform confirmation on behalf of the user

### Scenario 3.
A buyer creates an attestation escrow via the helper and uses an arbiter that requires the end-user as attester or recipient (e.g., AttesterArbiter, RecipientArbiter). Because the helper is recorded as the attester/recipient, the arbiter check reverts and the escrow cannot be collected.
#### Preconditions / Assumptions
- (a). User creates an attestation escrow via AttestationBarterUtils
- (b). An arbiter that validates attester or recipient identity (e.g., AttesterArbiter, RecipientArbiter) is chosen and demand expects the end-user’s address
- (c). A counterparty attempts collection which triggers the arbiter check

#### Proposed fix

##### AttestationBarterUtils.sol

File: `contracts/src/utils/barter/AttestationBarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/AttestationBarterUtils.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {Attestation} from "@eas/Common.sol";
-import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
+import {IEAS, AttestationRequest, AttestationRequestData, DelegatedAttestationRequest} from "@eas/IEAS.sol";
 import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
 import {SchemaResolver} from "@eas/resolver/SchemaResolver.sol";
 ... 78 unchanged lines ...
             });
 
-        escrowUid = escrowContract.doObligation(escrowData, expiration);
+        escrowUid = escrowContract.doObligationFor(escrowData, expiration, msg.sender);
     }
 
     function onAttest(
         Attestation calldata /* attestation */,
         uint256
     ) internal pure override returns (bool) {
         return true; // Allow all attestations
     }
 
     function onRevoke(
         Attestation calldata /* attestation */,
         uint256
     ) internal pure override returns (bool) {
         return true; // Allow all revocations
     }
 
     function getSchema(
         bytes32 schemaId
     ) external view returns (SchemaRecord memory) {
         return schemaRegistry.getSchema(schemaId);
     }
+
+    // Delegated flow that preserves the end-user as the EAS attester and sets the escrow recipient to the caller.
+    function attestByDelegationAndCreateEscrow(
+        DelegatedAttestationRequest calldata delegated,
+        address arbiter,
+        bytes calldata demand,
+        uint64 expiration
+    ) external payable returns (bytes32 attestationUid, bytes32 escrowUid) {
+        require(delegated.attester == msg.sender, "attester");
+        attestationUid = eas.attestByDelegation{value: msg.value}(delegated);
+        AttestationEscrowObligation2.ObligationData memory escrowData = AttestationEscrowObligation2.ObligationData({
+            attestationUid: attestationUid, arbiter: arbiter, demand: demand
+        });
+        escrowUid = escrowContract.doObligationFor(escrowData, expiration, msg.sender);
+    }
 }
```

#### Related findings

##### [Medium] Public attestation proxy in AttestationBarterUtils combined with AttesterArbiter whitelisting causes unauthorized escrow collection and asset theft

###### Description

AttestationBarterUtils lets anyone mint EAS attestations that appear to be issued by the contract itself. If a buyer configures an escrow with AttesterArbiter demanding attester == AttestationBarterUtils, an attacker can mint a fulfillment referencing the escrow and collect the escrowed assets.

AttestationBarterUtils exposes public attest methods that call EAS.attest from within the contract. Under EAS semantics, the recorded attester becomes the caller of EAS.attest, i.e., AttestationBarterUtils itself. Its resolver hooks are permissive (onAttest/onRevoke return true). BaseEscrowObligation.collectEscrowRaw requires only that the fulfillment attestation refUID equals the escrow uid and then defers remaining checks to the configured arbiter. AttesterArbiter.checkObligation verifies only that fulfillment.attester equals the demanded attester and does not validate schema or other properties. Therefore, if an integration configures an escrow with AttesterArbiter and demand.attester = AttestationBarterUtils, an attacker can create a fulfillment via AttestationBarterUtils.attest with refUID set to the escrow uid and recipient set to themselves, pass the arbiter check, and collect the escrowed ERC20/ERC721/ETH assets.

###### Severity

**Impact Explanation:** [High] Once the unsafe configuration is present, the attacker can collect escrowed assets (ERC20/ERC721/ETH), resulting in direct, material loss of principal funds.

**Likelihood Explanation:** [Low] Exploitation requires multiple compounded integration/UI/user misconfigurations (using a property-only arbiter for value-bearing escrows and whitelisting AttestationBarterUtils as a trusted attester), which is unlikely under the assumption of competent operators.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
ERC20: A buyer creates an ERC20 escrow using ERC20EscrowObligation with arbiter = AttesterArbiter and demand.attester = AttestationBarterUtils. The attacker observes the escrow uid, calls AttestationBarterUtils.attest to mint a fulfillment with refUID = escrow uid and recipient = attacker, then calls collectEscrow to receive the escrowed ERC20 tokens.
#### Preconditions / Assumptions
- (a). AttestationBarterUtils is deployed and callable by anyone
- (b). AttesterArbiter is deployed and selectable as arbiter
- (c). Buyer configures ERC20EscrowObligation with arbiter = AttesterArbiter and demand.attester = AttestationBarterUtils
- (d). Escrow is created and its uid is publicly observable
- (e). Attacker can register or use any EAS schema (resolver may be zero)
- (f). Attacker can call AttestationBarterUtils.attest to mint a fulfillment with refUID = escrow uid

### Scenario 2.
ERC721: A buyer escrows an NFT using ERC721EscrowObligation with arbiter = AttesterArbiter and demand.attester = AttestationBarterUtils. The attacker mints a fulfillment via AttestationBarterUtils.attest referencing the escrow uid and collects the NFT via collectEscrow.
#### Preconditions / Assumptions
- (a). AttestationBarterUtils is deployed and callable by anyone
- (b). AttesterArbiter is deployed and selectable as arbiter
- (c). Buyer configures ERC721EscrowObligation with arbiter = AttesterArbiter and demand.attester = AttestationBarterUtils
- (d). Escrow is created and its uid is publicly observable
- (e). Attacker can register or use any EAS schema (resolver may be zero)
- (f). Attacker can call AttestationBarterUtils.attest to mint a fulfillment with refUID = escrow uid

### Scenario 3.
ETH: A buyer escrows ETH using NativeTokenEscrowObligation with arbiter = AttesterArbiter and demand.attester = AttestationBarterUtils. The attacker creates a fulfillment via AttestationBarterUtils.attest referencing the escrow uid and calls collectEscrow to receive the ETH.
#### Preconditions / Assumptions
- (a). AttestationBarterUtils is deployed and callable by anyone
- (b). AttesterArbiter is deployed and selectable as arbiter
- (c). Buyer configures NativeTokenEscrowObligation with arbiter = AttesterArbiter and demand.attester = AttestationBarterUtils
- (d). Escrow is created and its uid is publicly observable
- (e). Attacker can register or use any EAS schema (resolver may be zero)
- (f). Attacker can call AttestationBarterUtils.attest to mint a fulfillment with refUID = escrow uid

###### Proposed fix

####### AttestationBarterUtils.sol

File: `contracts/src/utils/barter/AttestationBarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/AttestationBarterUtils.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {Attestation} from "@eas/Common.sol";
 import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
 import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
 import {SchemaResolver} from "@eas/resolver/SchemaResolver.sol";
 import {AttestationEscrowObligation2} from "../../obligations/escrow/non-tierable/AttestationEscrowObligation2.sol";
+import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
 
-contract AttestationBarterUtils is SchemaResolver {
+contract AttestationBarterUtils is SchemaResolver, Ownable {
     IEAS public immutable eas;
     ISchemaRegistry public immutable schemaRegistry;
 ... 39 unchanged lines ...
         bytes32 refUID,
         bytes calldata data
-    ) external returns (bytes32) {
+    ) external onlyOwner returns (bytes32) {
         return
             eas.attest(
                 AttestationRequest({
                     schema: schema,
                     data: AttestationRequestData({
                         recipient: recipient,
                         expirationTime: expirationTime,
                         revocable: revocable,
                         refUID: refUID,
                         data: data,
                         value: 0
                     })
                 })
             );
     }
 
     function attestAndCreateEscrow(
         AttestationRequest calldata attestationRequest,
         address arbiter,
         bytes calldata demand,
         uint64 expiration
-    ) external returns (bytes32 attestationUid, bytes32 escrowUid) {
+    ) external onlyOwner returns (bytes32 attestationUid, bytes32 escrowUid) {
         // First create the attestation
         attestationUid = eas.attest(attestationRequest);
 ... 32 unchanged lines ...
```

### 21. [Medium] Missing ETH forwarding in AttestationEscrowObligation settlement causes uncollectable paid attestations

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Both tierable and non-tierable AttestationEscrowObligation settle by calling EAS.attest without forwarding ETH, while the embedded AttestationRequest may specify a nonzero value. EAS requires msg.value to match the request’s value, so collectEscrow always reverts for nonzero-value requests, making such escrows permanently uncollectable.

The AttestationEscrowObligation contracts (tierable and non-tierable) embed a full EAS AttestationRequest in their ObligationData, including the AttestationRequestData.value field. At settlement, _releaseEscrow decodes this request and calls eas.attest(decoded.attestation) without forwarding ETH, and collectEscrowRaw is nonpayable, so callers cannot supply ETH. In the vendored EAS implementation, a nonzero request.data.value must be covered by msg.value; otherwise EAS reverts (InsufficientValue when resolver is payable, NotPayable when resolver is nonpayable or absent). Since the contracts do not validate that the embedded value is zero at creation, escrows embedding nonzero values are created successfully but become permanently uncollectable at settlement. The revoke call before settlement is rolled back atomically on revert, so there is no partial state, but the settlement path is unusable for nonzero-value requests. No funds are locked by these escrows (lock/return are no-ops), so the impact is a liveness/availability failure rather than monetary loss.

#### Severity

**Impact Explanation:** [Medium] Settlement of a core component (attestation escrow) is broken for any escrow embedding a nonzero-value request, causing significant availability loss of intended functionality without fund loss.

**Likelihood Explanation:** [Medium] Nonzero-value attestations are a plausible configuration (some resolvers require payment), though not universal; no special constraints or rare states beyond embedding a nonzero value.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Payable resolver with nonzero value: A buyer creates an escrow with ObligationData whose embedded AttestationRequest.data.value is 0.1 ETH for a schema with a payable resolver. A fulfiller submits a valid fulfillment and calls collectEscrow. _releaseEscrow calls eas.attest without forwarding ETH; EAS sees value > 0 and msg.value == 0 and reverts with InsufficientValue. Settlement fails every time; the attestation is never minted.
#### Preconditions / Assumptions
- (a). EAS and SchemaRegistry behave per the vendored implementations
- (b). Target schema has a payable resolver (resolver.isPayable() == true)
- (c). ObligationData.attestation.data.value > 0 (e.g., 0.1 ETH)
- (d). Fulfiller provides a fulfillment attestation that passes the arbiter check
- (e). collectEscrowRaw is nonpayable; _releaseEscrow calls eas.attest without {value: ...}

### Scenario 2.
Nonpayable or no-resolver with nonzero value: A buyer creates an escrow embedding AttestationRequest.data.value > 0 for a schema with a nonpayable or no resolver. On collectEscrow, _releaseEscrow calls eas.attest without ETH; EAS reverts with NotPayable because value > 0 cannot be forwarded. Settlement fails permanently.
#### Preconditions / Assumptions
- (a). EAS and SchemaRegistry behave per the vendored implementations
- (b). Target schema’s resolver is nonpayable or absent (resolver == address(0) or isPayable() == false)
- (c). ObligationData.attestation.data.value > 0
- (d). Fulfiller provides a fulfillment attestation that passes the arbiter check
- (e). collectEscrowRaw is nonpayable; _releaseEscrow calls eas.attest without {value: ...}

### Scenario 3.
Tierable mass failure: Multiple buyers create tierable escrows embedding the same AttestationRequest with nonzero value. A fulfiller attempts to settle many escrows using a single fulfillment attestation. Each collectEscrow attempt reaches _releaseEscrow, which calls eas.attest without ETH and reverts (InsufficientValue or NotPayable). None of the escrows settle; repeated attempts continue to fail.
#### Preconditions / Assumptions
- (a). EAS and SchemaRegistry behave per the vendored implementations
- (b). Multiple tierable escrows embed the same AttestationRequest with data.value > 0
- (c). A single fulfillment attestation satisfies the arbiter check for all targeted escrows
- (d). collectEscrowRaw is nonpayable; _releaseEscrow calls eas.attest without {value: ...} for each escrow

#### Proposed fix

##### AttestationEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {BaseEscrowObligation} from "../../../BaseEscrowObligation.sol";
 import {IArbiter} from "../../../IArbiter.sol";
 import {ArbiterUtils} from "../../../ArbiterUtils.sol";
 import {Attestation} from "@eas/Common.sol";
 import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
 import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
 
 contract AttestationEscrowObligation is BaseEscrowObligation, IArbiter {
     using ArbiterUtils for Attestation;
 
     struct ObligationData {
         address arbiter;
         bytes demand;
         AttestationRequest attestation;
     }
 
     error AttestationCreationFailed();
+    error NonZeroAttestationValueUnsupported();
 
     constructor(
         IEAS _eas,
         ISchemaRegistry _schemaRegistry
     )
         BaseEscrowObligation(
             _eas,
             _schemaRegistry,
             "address arbiter, bytes demand, tuple(bytes32 schema, tuple(address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data) attestation",
             true
         )
     {}
 
     // Extract arbiter and demand from encoded data
     function extractArbiterAndDemand(
         bytes memory data
     ) public pure override returns (address arbiter, bytes memory demand) {
         ObligationData memory decoded = abi.decode(data, (ObligationData));
         return (decoded.arbiter, decoded.demand);
     }
 
     // No assets to lock for attestation escrows
-    function _lockEscrow(bytes memory, address) internal override {
-        // No-op: attestations don't require locking assets
+    function _lockEscrow(bytes memory data, address) internal override {
+        ObligationData memory decoded = abi.decode(data, (ObligationData));
+        if (decoded.attestation.data.value != 0 || msg.value != 0) {
+            revert NonZeroAttestationValueUnsupported();
+        }
     }
 
 ... 98 unchanged lines ...
```

##### AttestationEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/AttestationEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/AttestationEscrowObligation.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {BaseEscrowObligationTierable} from "../../../BaseEscrowObligationTierable.sol";
 import {IArbiter} from "../../../IArbiter.sol";
 import {ArbiterUtils} from "../../../ArbiterUtils.sol";
 import {Attestation} from "@eas/Common.sol";
 import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
 import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
 
 contract AttestationEscrowObligation is BaseEscrowObligationTierable, IArbiter {
     using ArbiterUtils for Attestation;
 
     struct ObligationData {
         address arbiter;
         bytes demand;
         AttestationRequest attestation;
     }
 
     error AttestationCreationFailed();
+    error NonZeroAttestationValueUnsupported();
 
     constructor(
         IEAS _eas,
         ISchemaRegistry _schemaRegistry
     )
         BaseEscrowObligationTierable(
             _eas,
             _schemaRegistry,
             "address arbiter, bytes demand, tuple(bytes32 schema, tuple(address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data) attestation",
             true
         )
     {}
 
     // Extract arbiter and demand from encoded data
     function extractArbiterAndDemand(
         bytes memory data
     ) public pure override returns (address arbiter, bytes memory demand) {
         ObligationData memory decoded = abi.decode(data, (ObligationData));
         return (decoded.arbiter, decoded.demand);
     }
 
     // No assets to lock for attestation escrows
-    function _lockEscrow(bytes memory, address) internal override {
-        // No-op: attestations don't require locking assets
+    function _lockEscrow(bytes memory data, address) internal override {
+        ObligationData memory decoded = abi.decode(data, (ObligationData));
+        if (decoded.attestation.data.value != 0 || msg.value != 0) {
+            revert NonZeroAttestationValueUnsupported();
+        }
     }
 
 ... 98 unchanged lines ...
```

#### Related findings

##### [Informational] Unvalidated deferred EAS AttestationRequest in AttestationEscrowObligation (tierable and non-tierable) causes uncollectable escrows and liveness griefing

###### Description

The escrow stores an EAS AttestationRequest without validation and later calls EAS.attest() during collection without forwarding ETH. Requests that require ETH or fail EAS-time checks will revert at settlement, enabling denial-of-settlement/griefing but not fund loss.

AttestationEscrowObligation (both tierable and non-tierable variants) embeds a full EAS AttestationRequest in escrow data but performs no validation during escrow creation. At collection, _releaseEscrow decodes and passes this request to EAS.attest() without forwarding ETH, while collectEscrowRaw is nonpayable. The vendored EAS enforces request.value funding, refUID existence, expirationTime > now, and schema/revocable constraints only at attest() time. Therefore, escrows can be created that are guaranteed or likely to fail only at collection (e.g., nonzero request.value, nonexistent refUID, or past expirationTime). Failures revert atomically (no partial state changes) and no funds are held by this escrow, making the issue a liveness/UX risk rather than a fund-loss vulnerability.

###### Severity

**Impact Explanation:** [Low] No funds are locked or lost; failures cause only per-escrow settlement reverts and wasted off-chain effort. Protocol-wide functionality remains intact.

**Likelihood Explanation:** [Low] Exploitation relies on integrator/user negligence (not pre-validating visible embedded request fields) and yields no direct profit to the attacker (griefing).

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Nonzero AttestationRequest.value: A buyer creates an escrow embedding AttestationRequest.data.value > 0. At collection, _releaseEscrow calls EAS.attest() without ETH; EAS reverts (InsufficientValue or NotPayable), so the escrow is uncollectable and the victim’s off-chain work is wasted.
#### Preconditions / Assumptions
- (a). AttestationEscrowObligation (tierable or non-tierable) is deployed and used
- (b). Buyer embeds AttestationRequest.data.value > 0 in the escrow
- (c). Fulfiller/integrator does not pre-validate that value == 0 before relying on the escrow
- (d). collectEscrow is nonpayable and _releaseEscrow does not forward ETH
- (e). EAS behaves per vendored implementation, enforcing value funding at attest() time

### Scenario 2.
Expiration-time griefing: A buyer creates an escrow embedding an AttestationRequest.data.expirationTime that is near-term. By the time the fulfiller collects, EAS.attest() reverts with InvalidExpirationTime, denying settlement after off-chain work.
#### Preconditions / Assumptions
- (a). AttestationEscrowObligation (tierable or non-tierable) is deployed and used
- (b). Buyer embeds an AttestationRequest with a near-term expirationTime
- (c). Fulfiller collects after that expirationTime has passed
- (d). Fulfiller/integrator did not validate the embedded expirationTime viability in advance
- (e). EAS enforces expirationTime > now at attest() time

### Scenario 3.
Nonexistent refUID: A buyer sets AttestationRequest.data.refUID to a non-existent UID. At collection, EAS.attest() reverts with NotFound, preventing settlement despite the fulfiller’s work.
#### Preconditions / Assumptions
- (a). AttestationEscrowObligation (tierable or non-tierable) is deployed and used
- (b). Buyer embeds AttestationRequest.data.refUID that does not exist
- (c). Fulfiller/integrator does not pre-check EAS.isAttestationValid(refUID)
- (d). EAS enforces refUID existence at attest() time

###### Proposed fix

####### AttestationEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation.sol)

```diff
 ... 40 unchanged lines ...
 
     // No assets to lock for attestation escrows
+    // SECURITY: To prevent uncollectable escrows, validate the embedded AttestationRequest here:
+    // - require decoded.attestation.data.value == 0 (this escrow never forwards ETH during collection)
+    // - ensure the embedded schema exists and is compatible with embedded.data.revocable
+    // - if embedded.data.refUID != 0, ensure EAS.isAttestationValid(refUID) == true
+    // Implement by decoding ObligationData and enforcing the above; revert on violations.
+    // This eliminates the most deterministic EAS-time failures before escrows are created.
     function _lockEscrow(bytes memory, address) internal override {
         // No-op: attestations don't require locking assets
     }
 
     // Create the escrowed attestation
     function _releaseEscrow(
         bytes memory escrowData,
         address,
         bytes32
     ) internal override returns (bytes memory) {
+        // SECURITY: Also override _afterAttest in this contract to enforce:
+        // embeddedRequest.expirationTime == 0 OR >= escrow.expirationTime (from _getAttestation(uid)),
+        // then call super._afterAttest. This prevents EAS InvalidExpirationTime at collection.
+
         ObligationData memory decoded = abi.decode(
             escrowData,
 ... 90 unchanged lines ...
```

####### AttestationEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/AttestationEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/AttestationEscrowObligation.sol)

```diff
 ... 40 unchanged lines ...
 
     // No assets to lock for attestation escrows
+    // SECURITY: To prevent uncollectable escrows, validate the embedded AttestationRequest here:
+    // - require decoded.attestation.data.value == 0 (this escrow never forwards ETH during collection)
+    // - ensure the embedded schema exists and is compatible with embedded.data.revocable
+    // - if embedded.data.refUID != 0, ensure EAS.isAttestationValid(refUID) == true
+    // Implement by decoding ObligationData and enforcing the above; revert on violations.
+    // This eliminates the most deterministic EAS-time failures before escrows are created.
     function _lockEscrow(bytes memory, address) internal override {
         // No-op: attestations don't require locking assets
     }
 
     // Create the escrowed attestation
     function _releaseEscrow(
         bytes memory escrowData,
         address,
         bytes32
     ) internal override returns (bytes memory) {
+        // SECURITY: Also override _afterAttest in this contract to enforce:
+        // embeddedRequest.expirationTime == 0 OR >= escrow.expirationTime (from _getAttestation(uid)),
+        // then call super._afterAttest. This prevents EAS InvalidExpirationTime at collection.
+
         ObligationData memory decoded = abi.decode(
             escrowData,
 ... 90 unchanged lines ...
```

### 22. [Medium] Missing validation of demand parallel-array lengths in bundle arbiters’ checkObligation causes uncollectable escrows and potential permanent fund lock

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Bundle arbiters decode opaque demand bytes with parallel arrays and compare them without validating demand-side array lengths, allowing mismatched arrays to cause out-of-bounds panics or perpetual comparison failure, making escrows uncollectable and potentially permanently locking funds when no expiration is set.

In the non-tierable and tierable TokenBundleEscrowObligation contracts, as well as in TokenBundlePaymentObligation when used as an arbiter, checkObligation decodes arbitrary demand bytes into an ObligationData struct with parallel arrays (ERC20/721/1155 tokens and amounts/IDs) and calls _checkTokenArrays without validating that demand-side arrays have equal lengths. If the embedded demand bytes contain mismatched internal array lengths (e.g., erc20Tokens length > erc20Amounts length), the loop in _checkTokenArrays indexes based on demand.*.length and can read out-of-bounds on the demand arrays, reverting with a panic; in other cases short-circuiting avoids a panic but still returns false. BaseEscrowObligation.collectEscrowRaw requires arbiter.checkObligation to succeed; thus escrows with malformed demand are uncollectable. If expirationTime = 0 (never expires), reclaimExpired cannot be used and assets can be permanently locked. While fulfillers can mitigate payment loss by atomically bundling the payment attestation and collect call, or by pre-simulating checkObligation, the contract-level lack of demand validation still enables permanent or time-locked DoS of escrow collection depending on expiration.

#### Severity

**Impact Explanation:** [High] Escrows can become uncollectable; with expirationTime = 0 they are permanently locked with no workaround, representing a direct material loss and broken core functionality. With finite expiration, a significant availability loss persists until expiry.

**Likelihood Explanation:** [Low] Exploitation requires the escrow creator to select an affected arbiter and embed malformed demand bytes, and for permanent lock also to set no expiration. Fulfillers can avoid payment loss by atomic pay+collect or by pre-simulating checkObligation off-chain. These multiplicative preconditions reduce practical incidence.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Permanent lock via TokenBundlePaymentObligation as arbiter with no expiration: A buyer creates a TokenBundleEscrowObligation escrow, sets arbiter = TokenBundlePaymentObligation, and embeds malformed demand bytes with mismatched parallel arrays; the escrow’s own arrays are validated and tokens are locked. Any attempt to collect calls the arbiter’s checkObligation, which decodes the malformed demand and either panics in _checkTokenArrays or returns false; collection always fails. With expirationTime = 0, there is no reclaim path, so escrowed assets are permanently locked. If a fulfiller pre-pays by minting a payment attestation without atomicizing or pre-checking, they can also lose funds while the escrow remains locked.
#### Preconditions / Assumptions
- (a). TokenBundleEscrowObligation (non-tierable) and TokenBundlePaymentObligation are deployed with compatible EAS and SchemaRegistry.
- (b). Buyer creates an escrow with valid escrow-side arrays; arbiter is set to TokenBundlePaymentObligation.
- (c). Demand bytes embedded in the escrow are encoded with mismatched parallel arrays (e.g., ERC20 tokens length > amounts length).
- (d). Escrow expirationTime is set to 0 (never expires).
- (e). Any collection attempt must pass arbiter.checkObligation; decoding malformed demand causes a revert or perpetual failure.

### Scenario 2.
Time-locked DoS with finite expiration: Same setup as above but the buyer sets a finite expiration. Collection attempts revert due to malformed demand; no valid fulfillment can succeed. After expiration, the buyer can reclaim via reclaimExpired, so funds are not permanently lost but core functionality is unavailable until expiry.
#### Preconditions / Assumptions
- (a). TokenBundleEscrowObligation (non-tierable) and TokenBundlePaymentObligation are deployed with compatible EAS and SchemaRegistry.
- (b). Buyer creates an escrow with valid escrow-side arrays; arbiter is set to TokenBundlePaymentObligation.
- (c). Demand bytes embedded in the escrow are encoded with mismatched parallel arrays.
- (d). Escrow expirationTime is set to a finite value > 0.
- (e). Any collection attempt fails due to malformed demand until expiration; after expiration, the buyer can reclaim.

### Scenario 3.
Using TokenBundleEscrowObligation itself as arbiter: The buyer configures the escrow contract (non-tierable or tierable variant) as the arbiter and embeds malformed demand bytes with mismatched arrays. Any fulfillment minted under that arbiter’s schema cannot satisfy checkObligation; attempts to collect revert (panic or false). With expirationTime = 0, funds are permanently locked; with a finite expiration, the DoS persists until reclaim.
#### Preconditions / Assumptions
- (a). TokenBundleEscrowObligation (non-tierable or tierable) is deployed and used as the arbiter for its own escrow.
- (b). Buyer creates an escrow with valid escrow-side arrays and embeds malformed demand bytes with mismatched parallel arrays.
- (c). Fulfillment attestations are minted under the arbiter’s schema but cannot satisfy checkObligation due to malformed demand.
- (d). If expirationTime = 0, funds are permanently locked; if finite, DoS persists until expiration and reclaim.

#### Proposed fix

##### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 489 unchanged lines ...
         );
         ObligationData memory demandData = abi.decode(demand, (ObligationData));
+        if (demandData.erc20Tokens.length != demandData.erc20Amounts.length) return false;
+        if (demandData.erc721Tokens.length != demandData.erc721TokenIds.length) return false;
+        if (demandData.erc1155Tokens.length != demandData.erc1155TokenIds.length || demandData.erc1155Tokens.length != demandData.erc1155Amounts.length) return false;
 
         return
 ... 205 unchanged lines ...
```

##### TokenBundlePaymentObligation.sol

File: `contracts/src/obligations/payment/TokenBundlePaymentObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/payment/TokenBundlePaymentObligation.sol)

```diff
 ... 225 unchanged lines ...
         );
         ObligationData memory demandData = abi.decode(demand, (ObligationData));
+        if (demandData.erc20Tokens.length != demandData.erc20Amounts.length) return false;
+        if (demandData.erc721Tokens.length != demandData.erc721TokenIds.length) return false;
+        if (demandData.erc1155Tokens.length != demandData.erc1155TokenIds.length || demandData.erc1155Tokens.length != demandData.erc1155Amounts.length) return false;
 
         return
 ... 59 unchanged lines ...
```

##### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 489 unchanged lines ...
         );
         ObligationData memory demandData = abi.decode(demand, (ObligationData));
+        if (demandData.erc20Tokens.length != demandData.erc20Amounts.length) return false;
+        if (demandData.erc721Tokens.length != demandData.erc721TokenIds.length) return false;
+        if (demandData.erc1155Tokens.length != demandData.erc1155TokenIds.length || demandData.erc1155Tokens.length != demandData.erc1155Amounts.length) return false;
 
         return
 ... 205 unchanged lines ...
```

#### Related findings

##### [Medium] Missing array length validation in TokenBundleBarterUtils and TokenBundlePaymentObligation.checkObligation causes uncollectible escrows and potential seller fund loss

###### Description

TokenBundleBarterUtils and TokenBundlePaymentObligation.checkObligation assume parallel array lengths (tokens vs amounts/IDs) without validation. A buyer can embed malformed demand data in an escrow, causing out-of-bounds reads that revert. This makes the escrow unfulfillable and, in manual/asynchronous flows, can cause a seller to transfer assets to the buyer while collection later reverts, leading to seller loss.

Multiple functions in TokenBundleBarterUtils iterate over tokens arrays (ERC20/721/1155) and index into corresponding amounts/IDs arrays without verifying equal lengths. TokenBundleEscrowObligation validates only the escrow’s own arrays at creation and treats demand bytes opaquely. TokenBundlePaymentObligation.checkObligation also assumes demand’s parallel arrays are consistent and iterates by demand.*Tokens.length, indexing demand.*Amounts/TokenIds. If a buyer crafts an escrow whose embedded demand has mismatched array lengths, then: (1) TokenBundleBarterUtils fulfillment paths revert when accessing out-of-bounds indices, causing gas loss and preventing filling; and (2) in a manual/asynchronous flow, a seller can successfully execute the payment transfer to the buyer (payee) first, but collectEscrow later reverts during the arbiter check due to out-of-bounds access, leaving the seller uncompensated while the buyer retains the payment (and can later reclaim escrow if any assets were locked).

###### Severity

**Impact Explanation:** [High] In manual/asynchronous flows, a seller can transfer assets to the buyer (payee) successfully, but collectEscrow then reverts due to malformed demand during the arbiter check, resulting in direct, material loss of the seller’s funds.

**Likelihood Explanation:** [Low] Exploitation of principal loss requires a non-atomic/manual flow and lack of basic off-chain validation or simulation by a competent integrator or user; while plausible, this is not the default path when using provided atomic utilities.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Manual two-step fulfillment: Attacker posts an escrow with malformed demand arrays and payee set to attacker; seller directly calls TokenBundlePaymentObligation.doObligationFor referencing the escrow and transfers assets to attacker; later, collectEscrow reverts during arbiter check due to out-of-bounds array access, leaving seller’s payment unrecoverable while attacker retains funds (and may reclaim escrow later if any assets were locked).
#### Preconditions / Assumptions
- (a). Buyer (attacker) creates a TokenBundleEscrowObligation escrow with arbiter = TokenBundlePaymentObligation and demand containing mismatched parallel array lengths (e.g., erc20Tokens.length > erc20Amounts.length).
- (b). Escrow’s own token arrays are valid so escrow creation succeeds.
- (c). Demand.payee is set to the attacker.
- (d). Seller uses a manual/asynchronous flow (executes payment first via TokenBundlePaymentObligation.doObligationFor, then attempts collectEscrow later).
- (e). Seller/integrator does not pre-validate demand array lengths off-chain or simulate collection before paying.
- (f). Tokens behave standardly per assumptions.

### Scenario 2.
Non-permit BarterUtils fulfillment: Attacker’s malformed escrow is decoded by TokenBundleBarterUtils.payBundleForBundle; _pullPaymentBundleTokens loops by tokens.length but indexes amounts[i], causing out-of-bounds and revert; the transaction fails and the order is unfulfillable (gas lost only).
#### Preconditions / Assumptions
- (a). Buyer (attacker) creates a TokenBundleEscrowObligation escrow with malformed demand arrays as above.
- (b). A taker attempts fulfillment via TokenBundleBarterUtils.payBundleForBundle (non-permit path).
- (c). No off-chain validation of demand array lengths is performed.
- (d). Tokens behave standardly per assumptions.

### Scenario 3.
Permit BarterUtils fulfillment: Attacker’s malformed escrow is decoded by TokenBundleBarterUtils.permitAndPayBundleForBundle; the permit loop iterates by tokens.length but reads amounts[i], causing out-of-bounds and revert; the transaction fails and the order is unfulfillable (gas lost only).
#### Preconditions / Assumptions
- (a). Buyer (attacker) creates a TokenBundleEscrowObligation escrow with malformed demand arrays as above.
- (b). A taker attempts fulfillment via TokenBundleBarterUtils.permitAndPayBundleForBundle with permits.length == demand.erc20Tokens.length.
- (c). No off-chain validation of demand array lengths is performed.
- (d). Tokens behave standardly per assumptions.

###### Proposed fix

####### TokenBundlePaymentObligation.sol

File: `contracts/src/obligations/payment/TokenBundlePaymentObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/payment/TokenBundlePaymentObligation.sol)

```diff
 ... 59 unchanged lines ...
         )
     {}
+    function _validateRef(bytes32 r) internal view { if (r==0) return; Attestation memory a = eas.getAttestation(r); (address arb, bytes memory dem, , , , , , , , ) = abi.decode(a.data, (address, bytes, uint256, address[], uint256[], address[], uint256[], address[], uint256[], uint256[])); if (arb != address(this)) return; try this.decodeObligationData(dem) returns (ObligationData memory d) { if (d.erc20Tokens.length != d.erc20Amounts.length || d.erc721Tokens.length != d.erc721TokenIds.length || d.erc1155Tokens.length != d.erc1155TokenIds.length || d.erc1155Tokens.length != d.erc1155Amounts.length) revert ArrayLengthMismatch(); } catch { revert ArrayLengthMismatch(); } }
 
     function doObligation(
         ObligationData calldata data,
         bytes32 refUID
     ) public payable returns (bytes32 uid_) {
+        _validateRef(refUID);
         bytes memory encodedData = abi.encode(data);
         uid_ = _doObligationForRaw(
             encodedData,
             0,
             msg.sender,
             refUID
         );
     }
 
     function doObligationFor(
         ObligationData calldata data,
         address recipient,
         bytes32 refUID
     ) public payable returns (bytes32 uid_) {
+        _validateRef(refUID);
         bytes memory encodedData = abi.encode(data);
         uid_ = _doObligationForRaw(
 ... 206 unchanged lines ...
```

### 23. [Medium] Payable doObligationRaw without msg.value handling in BaseObligation and non-native descendants causes permanent ETH loss and mis-accounting

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Non-native obligations inherit a payable raw entrypoint that accepts ETH but never validates, uses, or refunds it, resulting in stranded funds; in CommitRevealObligation, stray ETH also subsidizes bond payouts.

BaseObligation.doObligationRaw is public and payable but ignores msg.value and forwards to _doObligationForRaw. In non-native descendants (e.g., ERC20/721/1155 Payment/Escrow, AttestationEscrowObligation, StringObligation), _beforeAttest/_afterAttest never touch ETH, and BaseAttester._attest always passes value 0 to EAS, so any ETH sent via doObligationRaw becomes stuck in the contract with no sweep or refund path. SchemaResolver.receive() guards only naked ETH sends and does not apply to payable function calls. Typed doObligation wrappers are nonpayable and safe, but the raw entrypoint remains publicly accessible. In CommitRevealObligation, stray ETH is co-mingled with the balance used for fixed bond payouts, creating a mis-accounting subsidy for valid reclaim/slash flows (not direct theft).

#### Severity

**Impact Explanation:** [High] Users’ ETH attached to non-native obligations via the raw entrypoint is permanently lost with no on-chain recovery; in CommitRevealObligation, stray ETH is irreversibly co-mingled and used to fund fixed bond payouts.

**Likelihood Explanation:** [Low] Exploitation requires an integration or tooling error that attaches ETH to non-native obligations via doObligationRaw; typed wrappers are nonpayable and common, reducing normal-path risk.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
An integration calls ERC20PaymentObligation.doObligationRaw with a non-zero msg.value by mistake; the function accepts ETH and processes only ERC20 transfers, leaving the attached ETH permanently stuck in the contract.
#### Preconditions / Assumptions
- (a). ERC20PaymentObligation is deployed and used via the raw bytes entrypoint instead of the typed nonpayable wrapper
- (b). The integration erroneously attaches a non-zero msg.value when calling doObligationRaw
- (c). No admin sweep/refund function exists in the contract
- (d). EAS attestation path forwards value 0, so no ETH is forwarded or consumed

### Scenario 2.
An integration calls AttestationEscrowObligation.doObligationRaw with a non-zero msg.value; the escrow logic does not use ETH and no refund path exists, so the ETH remains stranded.
#### Preconditions / Assumptions
- (a). AttestationEscrowObligation is deployed and used via the raw bytes entrypoint
- (b). The integration erroneously attaches a non-zero msg.value when calling doObligationRaw
- (c). No admin sweep/refund function exists in the contract
- (d). EAS attestation path forwards value 0, so no ETH is forwarded or consumed

### Scenario 3.
A user (via a faulty integration) sends ETH to CommitRevealObligation.doObligationRaw; the ETH increases the contract balance and later subsidizes fixed bond payouts to valid claimers or the slashedBondRecipient, permanently depriving the sender of their ETH (no theft beyond normal payout rules).
#### Preconditions / Assumptions
- (a). CommitRevealObligation is deployed with a positive bondAmount and valid commitDeadline
- (b). A faulty integration or script sends a non-zero msg.value to doObligationRaw (not used by the obligation)
- (c). Other users perform valid commit() and later reclaimBond() or slashBond() flows
- (d). No admin sweep/refund function exists in the contract; payouts are funded from the undifferentiated contract balance

#### Proposed fix

##### BaseObligation.sol

File: `contracts/src/BaseObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseObligation.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {BaseAttester} from "./BaseAttester.sol";
 import {IEAS} from "@eas/IEAS.sol";
 import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
 import {Attestation} from "@eas/Common.sol";
 import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
 
 abstract contract BaseObligation is BaseAttester, ReentrancyGuard {
+    error UnexpectedEth(uint256 received);
+
     constructor(
         IEAS _eas,
         ISchemaRegistry _schemaRegistry,
         string memory schema,
         bool revocable
     ) BaseAttester(_eas, _schemaRegistry, schema, revocable) {}
 
     // Base implementation with raw bytes
     function doObligationRaw(
         bytes calldata data,
         uint64 expirationTime,
         bytes32 refUID
     ) public payable virtual returns (bytes32 uid_) {
+        if (msg.value != 0) revert UnexpectedEth(msg.value);
         uid_ = _doObligationForRaw(
             data,
 ... 31 unchanged lines ...
```

#### Related findings

##### [Medium] Ignoring msg.value and lack of refunds in ETH-paying BarterUtils functions causes drainable trapped ETH and underpayment from contract balance

###### Description

Several payable BarterUtils functions forward exactly the demanded ETH to payment obligations while ignoring and not refunding msg.value, allowing any ETH resident in the utils contract to subsidize underpayments and enabling attackers to drain trapped ETH created by integration mistakes.

Across multiple BarterUtils functions that accept ETH (e.g., payEthForErc721, payEthForErc1155, payEthForEth, payEthForErc20, payEthForErc1155, payEthForBundle, permitAndPayBundle, payBundleForBundle), the code always forwards value equal to the demanded amount to the underlying payment obligation and never validates or refunds the caller’s msg.value. The underlying payment obligations enforce msg.value >= demanded amount and refund any overage to the payer of doObligationFor, which is the utils contract, not the end user. Because the utils always forward only the demanded amount, any extra msg.value sent by callers remains trapped as contract balance rather than being refunded. Later callers can underpay (even with msg.value == 0) and still fulfill, since the utils fund the demanded amount from their own balance. As a result, ETH that accumulates in the utils (commonly via integration/operator overpayments or misrouted transfers to contracts with receive()) can be drained by attackers through self-fulfilling escrows or empty-bundle flows, resulting in direct loss of principal funds to prior legitimate users or integrators whose excess ETH was trapped.

###### Severity

**Impact Explanation:** [High] Attackers can steal principal funds (ETH) that were trapped in the utils contracts due to integration/operator mistakes, resulting in direct, material loss to victims.

**Likelihood Explanation:** [Low] Exploitation requires a prior nonzero utils balance created by integration/operator mistakes (e.g., overpayment or misrouting), a state outside attacker control and not expected under correct integrations.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
NativeTokenBarterUtils drain via ETH-for-ETH: (1) An integration mistakenly overpays msg.value to payEthForEth or misroutes ETH to NativeTokenBarterUtils (it has receive()), leaving surplus trapped in the contract. (2) The attacker creates a zero-bid ETH-for-ETH escrow asking for E and then calls payEthForEth with msg.value == 0. (3) The utils forward E from their balance to the payment obligation, which pays the attacker; escrow is collected, draining the trapped ETH.
#### Preconditions / Assumptions
- (a). NativeTokenBarterUtils holds a nonzero ETH balance due to an integration/operator mistake (e.g., overpaying msg.value to a payable utils function or misrouting ETH to its receive()).
- (b). Attacker can freely call NativeTokenBarterUtils functions.
- (c). Underlying obligations and EAS behave per in-scope assumptions; recipients accept ETH.

### Scenario 2.
TokenBundleBarterUtils drain via empty-bundle: (1) An integration overpays msg.value to permitAndPayBundle or payBundleForBundle, or misroutes ETH to TokenBundleBarterUtils (it has receive()), creating a trapped balance. (2) The attacker escrows an empty bid bundle that demands nativeAmount E to attacker. (3) The attacker calls payBundleForBundle with msg.value == 0; the utils fund E from their balance to the payment obligation, which pays the attacker; escrow collects, draining trapped ETH.
#### Preconditions / Assumptions
- (a). TokenBundleBarterUtils holds a nonzero ETH balance due to an integration/operator mistake (e.g., overpaying msg.value to permitAndPayBundle or payBundleForBundle, or misrouting ETH to its receive()).
- (b). Attacker can freely call TokenBundleBarterUtils functions.
- (c). Underlying obligations and EAS behave per in-scope assumptions; recipients accept ETH.

### Scenario 3.
ERC721BarterUtils drain using a worthless NFT: (1) An integration overpays msg.value to payEthForErc721, leaving surplus trapped in ERC721BarterUtils. (2) The attacker escrows their own NFT asking for E. (3) The attacker calls payEthForErc721 with msg.value == 0; the utils fund E from their balance to the payment obligation, which pays the attacker, and the escrowed NFT is released back to the attacker.
#### Preconditions / Assumptions
- (a). ERC721BarterUtils holds a nonzero ETH balance due to an integration/operator mistake (e.g., overpaying msg.value to payEthForErc721).
- (b). Attacker controls an ERC721 token (can be low-value) and can call ERC721BarterUtils functions.
- (c). Underlying obligations and EAS behave per in-scope assumptions; recipients accept ETH.

###### Proposed fix

####### ERC721BarterUtils.sol

File: `contracts/src/utils/barter/ERC721BarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/ERC721BarterUtils.sol)

```diff
 ... 449 unchanged lines ...
         );
 
+        // SECURITY: Add require(msg.value == demand.amount) and forward {value: msg.value} to prevent using contract balance and trapping overpayments.
         bytes32 sellAttestation = nativePayment.doObligationFor{
             value: demand.amount
         }(demand,
                 msg.sender,
                 buyAttestation // Reference the escrow this payment is for
             );
 
         if (!erc721Escrow.collectEscrow(buyAttestation, sellAttestation)) {
             revert CouldntCollectEscrow();
         }
 
         return sellAttestation;
     }
 }
```

####### ERC1155BarterUtils.sol

File: `contracts/src/utils/barter/ERC1155BarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/ERC1155BarterUtils.sol)

```diff
 ... 502 unchanged lines ...
         );
 
+        // SECURITY: Add require(msg.value == demand.amount) and forward {value: msg.value} to avoid subsidizing from contract balance and trapping overpayments.
         bytes32 sellAttestation = nativePayment.doObligationFor{
             value: demand.amount
 ... 39 unchanged lines ...
```

####### NativeTokenBarterUtils.sol

File: `contracts/src/utils/barter/NativeTokenBarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/NativeTokenBarterUtils.sol)

```diff
 ... 122 unchanged lines ...
     }
 
+    // SECURITY: For all payEthFor* functions below, require exact msg.value == demanded native amount
+    // and forward {value: msg.value} to avoid using contract balance or trapping overpayments.
     // ============ Cross-Token Functions ============
 
 ... 221 unchanged lines ...
```

####### TokenBundleBarterUtils.sol

File: `contracts/src/utils/barter/TokenBundleBarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/TokenBundleBarterUtils.sol)

```diff
 ... 36 unchanged lines ...
     }
 
+    // SECURITY: In all payable functions here (permitAndEscrowBundle, permitAndPayBundle, payBundleForBundle,
+    // permitAndPayBundleForBundle, buyBundleForBundle), require exact msg.value == nativeAmount and forward {value: msg.value}.
     function permitAndEscrowBundle(
         TokenBundleEscrowObligation.ObligationData calldata data,
 ... 348 unchanged lines ...
```

### 24. [Medium] Push-only ERC1155 transfers without receiver validation in ERC1155 escrow collection/reclaim cause permanent fund lock

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

ERC1155 escrow obligations push tokens via safeTransferFrom to the collection recipient and the escrow attestation recipient on reclaim, without preflight receiver validation or a pull-based fallback. If either destination rejects ERC1155 transfers, tokens can become permanently locked.

Both tierable and non-tierable ERC1155 escrow obligations transfer escrowed tokens using IERC1155.safeTransferFrom in two places: (1) on collection, to the fulfillment’s recipient; and (2) on expiry reclaim, to the escrow attestation’s recipient. The code reverts on transfer failure and provides no alternative withdrawal path. If the arbiter/demand constrains the collection recipient (e.g., RecipientArbiter) to a contract that is not an ERC1155 receiver, every collection attempt reverts. If the escrow attestation’s recipient is a non-receiver contract, reclaimExpired will always revert after expiry. Because there is no preflight capability check or address update/pull fallback, these configurations can lead to permanent fund lock (or long-lived DoS until expiry when reclaim to a valid EOA is possible). Atomicity and non-reentrancy prevent partial state changes but do not resolve the liveness failure.

#### Severity

**Impact Explanation:** [High] In Scenarios 1 and 2, escrowed principal can be permanently locked with no workaround; in Scenario 3, funds can be frozen for an extended period until expiry.

**Likelihood Explanation:** [Low] Requires integrator/user configuration choices that are uncommon for competent deployments (e.g., fixing recipients to non-ERC1155Receiver contracts, and in the worst case, setting non-expiring escrows). These are plausible but not default or broadly prevalent.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Non-expiring escrow with RecipientArbiter fixing payout recipient to a non-ERC1155Receiver contract: collection always reverts and reclaim is disabled due to no expiry, permanently locking the buyer’s ERC1155 tokens.
#### Preconditions / Assumptions
- (a). Use of RecipientArbiter (or equivalent) that fixes the collection recipient
- (b). Fixed recipient is a contract that does not implement IERC1155Receiver or reverts on ERC1155 receipt
- (c). Escrow configured as non-expiring (expirationTime = 0)
- (d). Standard-compliant ERC1155 token

### Scenario 2.
Expiring escrow where the escrow attestation recipient (set via doObligationFor) is a non-ERC1155Receiver contract: after expiry, collection is disallowed and reclaimExpired always reverts, permanently locking the buyer’s ERC1155 tokens.
#### Preconditions / Assumptions
- (a). Escrow created with doObligationFor such that the escrow attestation recipient is a contract that does not implement IERC1155Receiver
- (b). Escrow has a finite expirationTime and expires before any successful collection
- (c). Standard-compliant ERC1155 token

### Scenario 3.
Escrow with RecipientArbiter fixing payout recipient to a non-ERC1155Receiver contract and a finite expiry, while the escrow attestation recipient is an EOA: collection is impossible (reverts) until expiry, causing a time-bounded DoS to the seller; buyer can reclaim at expiry.
#### Preconditions / Assumptions
- (a). Use of RecipientArbiter (or equivalent) that fixes the collection recipient
- (b). Fixed recipient is a contract that does not implement IERC1155Receiver or reverts on ERC1155 receipt
- (c). Escrow has a finite expirationTime
- (d). Escrow attestation recipient is an EOA (can receive ERC1155)
- (e). Standard-compliant ERC1155 token

#### Proposed fix

##### ERC1155EscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/ERC1155EscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/ERC1155EscrowObligation.sol)

```diff
 ... 190 unchanged lines ...
         uint64 expirationTime
     ) external returns (bytes32) {
+        // Enforce finite expirations to ensure reclaim path exists for ERC1155 escrows.
+        require(expirationTime > 0, "NoZeroExpiryForERC1155");
         return
             _doObligationForRaw(
                 abi.encode(data),
                 expirationTime,
 
                 msg.sender,
                 bytes32(0)
             );
     }
 
     function doObligationFor(
         ObligationData calldata data,
         uint64 expirationTime,
         address recipient
     ) external returns (bytes32) {
+        // Enforce finite expirations to ensure reclaim path exists for ERC1155 escrows.
+        require(expirationTime > 0, "NoZeroExpiryForERC1155");
+        // TODO: Also validate recipient is ERC1155-capable (EOA or IERC1155Receiver) at creation to guarantee reclaim liveness.
         return
             _doObligationForRaw(
 ... 29 unchanged lines ...
```

##### ERC1155EscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/ERC1155EscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/ERC1155EscrowObligation.sol)

```diff
 ... 190 unchanged lines ...
         uint64 expirationTime
     ) external returns (bytes32) {
+        // Enforce finite expirations to ensure reclaim path exists for ERC1155 escrows.
+        require(expirationTime > 0, "NoZeroExpiryForERC1155");
         return
             _doObligationForRaw(
                 abi.encode(data),
                 expirationTime,
 
                 msg.sender,
                 bytes32(0)
             );
     }
 
     function doObligationFor(
         ObligationData calldata data,
         uint64 expirationTime,
         address recipient
     ) external returns (bytes32) {
+        // Enforce finite expirations to ensure reclaim path exists for ERC1155 escrows.
+        require(expirationTime > 0, "NoZeroExpiryForERC1155");
+        // TODO: Also validate recipient is ERC1155-capable (EOA or IERC1155Receiver) at creation to guarantee reclaim liveness.
         return
             _doObligationForRaw(
 ... 29 unchanged lines ...
```

#### Related findings

##### [Medium] Push-based bundle release with missing ERC721 receiver checks and single-recipient ERC1155 transfers in TokenBundleEscrowObligation causes permanent asset loss/stranding

###### Description

The non-tierable TokenBundleEscrowObligation releases all escrowed assets by pushing every leg to a single recipient. ERC721 legs use transferFrom without ERC721Receiver checks, enabling delivery to contracts that cannot manage NFTs (silent stranding). ERC1155 legs use safeTransferFrom and will revert atomically for non-receiving recipients; on expiry reclaim, the same push path to the fixed escrow recipient can be permanently blocked. The provided unsafe partial flows revoke first and can strand failing legs permanently.

In TokenBundleEscrowObligation (non-tierable), both collection (_releaseEscrow) and expiry reclaim (_returnEscrow) push all legs via transferOutTokenBundleAtomic to a single recipient. ERC721 legs are sent using IERC721.transferFrom without onERC721Received validation; only a post-transfer ownerOf check is performed, allowing transfers into contracts that cannot move NFTs out. ERC1155 legs are sent using safeTransferFrom, which reverts if the recipient is not an IERC1155Receiver. Because reclaim uses the same push-based path to the escrow’s fixed recipient, a non-receiving recipient blocks reclaim indefinitely. The unsafe partial functions (unsafePartiallyCollectEscrow, unsafePartiallyReclaimExpired) revoke first and continue on per-leg failures, which can finalize the escrow while leaving some assets (e.g., ERC1155) permanently stranded in the escrow contract address.

###### Severity

**Impact Explanation:** [High] Direct, permanent loss or stranding of principal user assets (ERC721 delivered to unmanageable contracts, ERC1155 permanently stuck due to unsafe partial reclaim or blocked reclaim).

**Likelihood Explanation:** [Low] Exploitation relies on user-side configuration or unsafe API usage: selecting permissive arbiters (Scenario 1), setting a non-ERC1155Receiver escrow recipient and invoking unsafe partial reclaim (Scenario 2), or recipient-side integration misconfiguration (Scenario 3). These are uncommon but plausible user mistakes.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Attacker crafts a fulfillment against a permissively-arbited escrow and sets fulfillment.recipient to an attacker-controlled contract that accepts ETH/ERC1155 but lacks ERC721Receiver or exposes no withdrawal methods. collectEscrow succeeds and pushes the entire bundle to the attacker’s contract; ERC721 transfers succeed without receiver checks and become irrecoverable for the victim.
#### Preconditions / Assumptions
- (a). A non-tierable TokenBundle escrow exists with at least one ERC721 leg (and optionally ERC20/ETH/ERC1155).
- (b). The buyer selected an arbiter that does not constrain the rightful recipient (e.g., permissive arbiter).
- (c). The escrow is not expired.
- (d). The attacker can create a fulfillment attestation referencing the escrow (refUID matches).
- (e). The attacker controls a recipient contract that accepts ETH and (if present) ERC1155, and either cannot or will not transfer tokens out (e.g., lacks ERC721Receiver and/or any withdrawal logic).

### Scenario 2.
An escrow with ERC1155 legs expires where the escrow’s recipient was set to a contract without IERC1155Receiver. reclaimExpired consistently reverts due to ERC1155 safeTransferFrom. The user then invokes unsafePartiallyReclaimExpired, which revokes first and continues on failures, resulting in ERC1155 legs remaining stuck permanently in the escrow contract while other legs may be returned.
#### Preconditions / Assumptions
- (a). A non-tierable TokenBundle escrow includes one or more ERC1155 legs.
- (b). At creation, the escrow recipient (attestation.recipient) was set to a contract without IERC1155Receiver.
- (c). The escrow has expired (collection disallowed).
- (d). The user attempts reclaimExpired (which reverts) and then opts to call unsafePartiallyReclaimExpired.

### Scenario 3.
A legitimate fulfillment sets the recipient to a smart account/contract that cannot perform external token calls or manage NFT approvals. collectEscrow succeeds; ERC721 is transferred via transferFrom without receiver checks, and the recipient cannot move the NFT thereafter, effectively stranding it.
#### Preconditions / Assumptions
- (a). A non-tierable TokenBundle escrow includes one or more ERC721 legs.
- (b). The fulfillment’s recipient is a smart account/contract that cannot perform external token calls or set approvals to move received NFTs.
- (c). The arbiter approves the fulfillment and collectEscrow is called.

###### Proposed fix

####### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 340 unchanged lines ...
         for (uint i = 0; i < data.erc721Tokens.length; i++) {
             try
-                IERC721(data.erc721Tokens[i]).transferFrom(
+                IERC721(data.erc721Tokens[i]).safeTransferFrom(
                     address(this),
                     to,
 ... 353 unchanged lines ...
```

####### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 340 unchanged lines ...
         for (uint i = 0; i < data.erc721Tokens.length; i++) {
             try
-                IERC721(data.erc721Tokens[i]).transferFrom(
+                IERC721(data.erc721Tokens[i]).safeTransferFrom(
                     address(this),
                     to,
 ... 353 unchanged lines ...
```

####### ERC721EscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/ERC721EscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/ERC721EscrowObligation.sol)

```diff
 ... 113 unchanged lines ...
 
         try
-            IERC721(decoded.token).transferFrom(
+            IERC721(decoded.token).safeTransferFrom(
                 address(this),
                 to,
 ... 104 unchanged lines ...
```

####### TokenBundlePaymentObligation.sol

File: `contracts/src/obligations/payment/TokenBundlePaymentObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/payment/TokenBundlePaymentObligation.sol)

```diff
 ... 191 unchanged lines ...
         // Transfer ERC721s
         for (uint i = 0; i < data.erc721Tokens.length; i++) {
-            IERC721(data.erc721Tokens[i]).transferFrom(
+            IERC721(data.erc721Tokens[i]).safeTransferFrom(
                 from,
                 data.payee,
 ... 92 unchanged lines ...
```

####### ERC721PaymentObligation.sol

File: `contracts/src/obligations/payment/ERC721PaymentObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/payment/ERC721PaymentObligation.sol)

```diff
 ... 78 unchanged lines ...
         // Try token transfer with error handling
         try
-            IERC721(obligationData.token).transferFrom(
+            IERC721(obligationData.token).safeTransferFrom(
                 payer,
                 obligationData.payee,
 ... 58 unchanged lines ...
```

### 25. [Medium] Recipient-side balance delta check in ERC1155 escrow release causes DoS and potential permanent funds lock

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

ERC1155 escrow release verifies the recipient’s post-transfer balance increased by the escrowed amount. ERC1155 receivers can forward tokens within onERC1155Received, leaving the final recipient balance unchanged and causing the release to revert. With a fixed recipient and a non-expiring escrow, funds can be permanently stuck; otherwise they are locked until expiry. Affects both non-tierable and tierable ERC1155 escrows.

In both non-tierable and tierable ERC1155 escrows, _releaseEscrow measures the recipient’s balance before and after calling IERC1155.safeTransferFrom(this, recipient, tokenId, amount). It reverts unless the recipient’s balance increases by at least the amount. However, ERC1155 receivers can legally execute arbitrary logic in onERC1155Received; an auto-forwarding recipient can immediately transfer the received tokens elsewhere during the hook. As a result, the recipient’s final balance may not reflect the transfer, and the escrow release reverts even though the token transfer and accounting were correct. collectEscrowRaw uses the fulfillment attestation’s recipient as the release address, and arbiters like RecipientArbiter can enforce a fixed recipient, so failed releases cannot be worked around by choosing a different recipient if the demand requires a specific address. If the escrow was created with expirationTime = 0 (non-expiring), reclaimExpired is unavailable, leading to a permanent lock. Reentrancy guards do not mitigate this because the issue arises from recipient-side hook behavior. The same recipient-balance delta check exists in the tierable ERC1155 escrow, leading to the same failure mode.

#### Severity

**Impact Explanation:** [High] In the non-expiring, fixed-recipient configuration, funds are permanently frozen with no on-chain workaround, which fits high impact. In expiring escrows, the issue causes a significant availability loss until expiry.

**Likelihood Explanation:** [Low] Permanent lock requires the uncommon combination of a fixed auto-forwarding recipient and a non-expiring escrow. While each element is plausible, their conjunction is not typical. (Timed lock scenarios without non-expiring escrow are more common but have lower impact.)

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Permanent lock: A buyer creates a non-expiring ERC1155 escrow with RecipientArbiter demanding a specific recipient R. R is an ERC1155 receiver contract that auto-forwards tokens inside onERC1155Received. During collection, the escrow calls safeTransferFrom to R; R forwards tokens within the hook; after returning, the recipient’s final balance has not increased by the full amount, so _releaseEscrow reverts. Because the recipient is fixed and the escrow cannot be reclaimed (non-expiring), funds are permanently stuck.
#### Preconditions / Assumptions
- (a). Standard-compliant ERC1155 token
- (b). Recipient can run hook logic in onERC1155Received (standard behavior)
- (c). RecipientArbiter (or equivalent) enforces a fixed recipient address
- (d). The fixed recipient is an auto-forwarding ERC1155 receiver that forwards tokens within its onERC1155Received hook
- (e). Escrow is created with expirationTime = 0 (non-expiring), disabling reclaimExpired
- (f). A valid fulfillment attestation is created with recipient matching the enforced recipient

### Scenario 2.
Timed lock until expiry: Same as above, but the escrow has a finite expirationTime. Each collection attempt to the required auto-forwarding recipient reverts due to the recipient balance check. Funds remain locked until expiration, after which reclaimExpired returns tokens to the attestation recipient (which typically succeeds if it is an EOA).
#### Preconditions / Assumptions
- (a). Standard-compliant ERC1155 token
- (b). Recipient can run hook logic in onERC1155Received
- (c). RecipientArbiter (or equivalent) enforces a fixed recipient address
- (d). The fixed recipient is an auto-forwarding ERC1155 receiver
- (e). Escrow has a finite expirationTime (> 0)
- (f). A valid fulfillment attestation is created with recipient matching the enforced recipient

### Scenario 3.
Tierable escrow blocked: Using the tierable ERC1155 escrow with an auto-forwarding recipient (optionally enforced by an arbiter) leads to the same post-transfer balance check failure and reverts. Depending on whether the escrow is non-expiring and whether the recipient is fixed, this can cause either a permanent lock or a lock until expiry.
#### Preconditions / Assumptions
- (a). Standard-compliant ERC1155 token
- (b). Recipient can run hook logic in onERC1155Received
- (c). Tierable ERC1155 escrow contract is used
- (d). Recipient is an auto-forwarding ERC1155 receiver (optionally enforced by an arbiter/demand)
- (e). A valid fulfillment attestation is provided for collection

#### Proposed fix

##### ERC1155EscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/ERC1155EscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/ERC1155EscrowObligation.sol)

```diff
 ... 114 unchanged lines ...
         // Check balance before transfer
         uint256 balanceBefore = IERC1155(decoded.token).balanceOf(
-            to,
+            address(this),
             decoded.tokenId
         );
 ... 21 unchanged lines ...
         // Check balance after transfer
         uint256 balanceAfter = IERC1155(decoded.token).balanceOf(
-            to,
+            address(this),
             decoded.tokenId
         );
 
         // Verify the actual amount transferred
-        if (balanceAfter < balanceBefore + decoded.amount) {
+        if (balanceBefore < balanceAfter + decoded.amount) {
             revert ERC1155TransferFailed(
                 decoded.token,
 ... 88 unchanged lines ...
```

##### ERC1155EscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/ERC1155EscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/ERC1155EscrowObligation.sol)

```diff
 ... 114 unchanged lines ...
         // Check balance before transfer
         uint256 balanceBefore = IERC1155(decoded.token).balanceOf(
-            to,
+            address(this),
             decoded.tokenId
         );
 ... 21 unchanged lines ...
         // Check balance after transfer
         uint256 balanceAfter = IERC1155(decoded.token).balanceOf(
-            to,
+            address(this),
             decoded.tokenId
         );
 
         // Verify the actual amount transferred
-        if (balanceAfter < balanceBefore + decoded.amount) {
+        if (balanceBefore < balanceAfter + decoded.amount) {
             revert ERC1155TransferFailed(
                 decoded.token,
 ... 88 unchanged lines ...
```

### 26. [Medium] Unbound fulfillment recipient in StringObligation with identity-agnostic arbiters enables front-running to capture escrow payouts

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

StringObligation allows any caller to create a fulfillment attestation for any refUID and sets the fulfillment recipient to msg.sender. Non-tierable escrows pay to fulfillment.recipient if the chosen arbiter approves. With identity-agnostic arbiters, a mempool observer can front-run or mint arbitrary fulfillments to capture escrow payouts, causing solver losses and, under weak arbiter choices, potential buyer losses.

StringObligation.doObligation encodes calldata and calls _doObligationForRaw with recipient=msg.sender and the provided refUID. BaseObligation._doObligationForRaw then calls BaseAttester._attest to mint an EAS attestation with those exact fields. In BaseEscrowObligation.collectEscrowRaw (non-tierable), if fulfillment.refUID == escrow.uid and IArbiter.checkObligation returns true, escrow value is released to fulfillment.recipient. Multiple arbiters in-scope do not bind identity (e.g., IntrinsicsArbiter validates only expiry/revocation; StringCapitalizer checks content but not recipient; TrustedOracleArbiter defers to the oracle decision keyed by (fulfillmentUid, demand.data) without identity binding). As a result, a mempool observer can copy a pending StringObligation fulfillment and front-run it to become the recipient, or in the most permissive case (IntrinsicsArbiter), publish any valid, unexpired fulfillment referencing the escrow to capture the payout. The repository provides mitigations (RecipientArbiter for identity binding, confirmation arbiters, CommitRevealObligation, or composing arbiters with AllArbiter), but if not used, the pattern is exploitable.

#### Severity

**Impact Explanation:** [Medium] In common identity-agnostic configurations, the harmed party is the solver who loses expected payment (loss of fees/yield). Direct buyer principal loss occurs mainly under weak arbiter choices (e.g., IntrinsicsArbiter), which is a misconfiguration and not the typical case.

**Likelihood Explanation:** [Medium] Exploitation requires integrators to use identity-agnostic arbiters and public mempools. While plausible, in-repo mitigations (RecipientArbiter, confirmation arbiters, CommitRevealObligation, arbiter composition) can be adopted, moderating likelihood.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
ERC20EscrowObligation + StringCapitalizer: Buyer creates an ERC20 escrow demanding a capitalized string using StringCapitalizer. Solver computes the correct capitalization and submits StringObligation.doObligation referencing the escrow. An attacker copies the calldata and front-runs to submit first, making themselves the fulfillment.recipient. collectEscrow pays the attacker. The solver loses expected payment; the buyer still pays for a valid result.
#### Preconditions / Assumptions
- (a). Buyer selects ERC20EscrowObligation with an identity-agnostic content arbiter (e.g., StringCapitalizer) and funds the escrow
- (b). Public mempool or observable pending transactions
- (c). Attacker can front-run the solver's submission
- (d). Arbiter checks content/refUID but not recipient identity

### Scenario 2.
NativeTokenEscrowObligation + IntrinsicsArbiter: Buyer escrows ETH with IntrinsicsArbiter (validity-only). An attacker submits any StringObligation fulfillment referencing the escrow (no identity or schema checks). collectEscrow succeeds and pays ETH to the attacker. The buyer suffers direct loss of principal.
#### Preconditions / Assumptions
- (a). Buyer selects NativeTokenEscrowObligation with IntrinsicsArbiter (validity-only) and escrows ETH
- (b). Arbiter does not enforce schema or recipient identity
- (c). Attacker can submit any valid, unexpired fulfillment referencing the escrow

### Scenario 3.
ERC20EscrowObligation + TrustedOracleArbiter: Buyer uses a trusted oracle arbiter without identity binding. Solver submits a valid StringObligation fulfillment. An attacker front-runs with the same data and gets validated first by the oracle. collectEscrow pays the attacker. The solver loses expected payment; the buyer still pays for a validated result.
#### Preconditions / Assumptions
- (a). Buyer selects ERC20EscrowObligation with TrustedOracleArbiter and a trusted oracle
- (b). Oracle policy does not bind identity and may approve the first valid fulfillment
- (c). Public mempool allows front-running
- (d). Integrator does not compose identity-binding/confirmation arbiters

#### Proposed fix

##### BaseEscrowObligation.sol

File: `contracts/src/BaseEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligation.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {BaseObligation} from "./BaseObligation.sol";
 import {IArbiter} from "./IArbiter.sol";
 import {ArbiterUtils} from "./ArbiterUtils.sol";
 import {Attestation} from "@eas/Common.sol";
 import {IEAS, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
 import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
 
 // Note: Does NOT implement IArbiter - that's left to specific implementations
 abstract contract BaseEscrowObligation is BaseObligation {
     using ArbiterUtils for Attestation;
 
+    interface IRecipientResolver {
+        function resolveRecipient(
+            Attestation calldata fulfillment, bytes calldata demand, bytes32 fulfilling
+        ) external view returns (address);
+    }
+
     // Common events for all escrow types
     event EscrowMade(bytes32 indexed escrow, address indexed buyer);
 ... 94 unchanged lines ...
 
         // Execute the escrow release
+        address payee = fulfillment.recipient;
+        // If arbiter can resolve a recipient, prefer that; otherwise fallback to fulfillment.recipient
+        try IRecipientResolver(arbiter).resolveRecipient(
+            fulfillment, demand, escrow.uid
+        ) returns (address resolved) {
+            if (resolved != address(0)) payee = resolved;
+        } catch {}
         bytes memory result = _releaseEscrow(
             escrow.data,
-            fulfillment.recipient,
+            payee,
             _fulfillment
         );
 
-        emit EscrowCollected(_escrow, _fulfillment, fulfillment.recipient);
+        emit EscrowCollected(_escrow, _fulfillment, payee);
         return result;
     }
 ... 59 unchanged lines ...
```

#### Related findings

##### [Informational] Length-only string comparison in StringResultObligation arbiter causes unauthorized escrow release

###### Description

StringResultObligation.checkObligation validates fulfillments by comparing only the byte lengths of the demanded query and submitted result, allowing any equal-length string to pass and release escrowed funds when this example arbiter is used.

StringResultObligation.checkObligation returns true if the length of demandData.query equals the length of result.result, without verifying full content equality or enforcing a schema match on the fulfillment attestation. When this contract is configured as an arbiter for escrow obligations, an attacker can submit any string of equal length to the demanded query and pass validation. BaseEscrowObligation then releases escrowed assets to the attacker’s fulfillment recipient. In tierable flows using OptimisticStringValidator (which delegates to StringResultObligation after a mediation period), if no one mediates, the same length-only check ultimately authorizes release. This contract resides under example/, so while the flaw is real and exploitable if used, it is informational for this repository’s intended usage.

###### Severity

**Impact Explanation:** [High] If this example arbiter is used to authorize escrow payouts, attackers can cause direct, material loss of users’ principal by submitting any equal-length string, triggering fund release.

**Likelihood Explanation:** [Low] Exploitation relies on users/integrators selecting and using this example arbiter/validator in production (and in the optimistic case, on no one mediating), which constitutes a user/operator misconfiguration; once misconfigured, exploitation is straightforward.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Non-tierable ERC20 escrow uses StringResultObligation as arbiter: The buyer creates an ERC20 escrow with arbiter set to StringResultObligation and a query (e.g., "HELLO WORLD"). The attacker submits a fulfillment via StringResultObligation with any 11-byte string and refUID set to the escrow UID, then calls collectEscrow. Because the arbiter checks only string length, funds are released to the attacker despite incorrect content.
#### Preconditions / Assumptions
- (a). EAS and SchemaRegistry are deployed and functional per assumptions.
- (b). ERC20EscrowObligation (non-tierable) and StringResultObligation are deployed.
- (c). Buyer/integrator configures arbiter = address(StringResultObligation) for the escrow.
- (d). The demanded query string is known/public via the escrow attestation.
- (e). The ERC20 token behaves standard per assumptions.
- (f). Attacker can observe the escrow UID and set refUID on their fulfillment.
- (g). No expiration/revocation prevents fulfillment prior to collection.

### Scenario 2.
Tierable ERC20 escrow with OptimisticStringValidator: The buyer configures OptimisticStringValidator (which ultimately calls StringResultObligation) as arbiter. The attacker submits a result of equal length but incorrect content, starts validation, waits out the mediation period without anyone mediating, and then calls collectEscrow. OptimisticStringValidator delegates to StringResultObligation’s length-only check, releasing funds to the attacker.
#### Preconditions / Assumptions
- (a). EAS and SchemaRegistry are deployed and functional per assumptions.
- (b). Tierable ERC20EscrowObligation, OptimisticStringValidator, and StringResultObligation are deployed.
- (c). Buyer configures arbiter = address(OptimisticStringValidator) with demand encoding ValidationData {query, mediationPeriod}.
- (d). Attacker is the result recipient and can call startValidation.
- (e). No one calls mediate() during the mediationPeriod.
- (f). The demanded query string is known/public from the escrow attestation.

### Scenario 3.
Non-tierable native token escrow (ETH) uses StringResultObligation: The buyer escrows ETH with arbiter set to StringResultObligation and a short query (e.g., "42"). The attacker submits a fulfillment using any equal-length string (e.g., "zz") with refUID set to the escrow UID and calls collectEscrow. The length-only comparator approves the fulfillment, releasing ETH to the attacker.
#### Preconditions / Assumptions
- (a). EAS and SchemaRegistry are deployed and functional per assumptions.
- (b). NativeTokenEscrowObligation (non-tierable) and StringResultObligation are deployed.
- (c). Buyer configures arbiter = address(StringResultObligation) and escrows ETH with a known/public query.
- (d). Attacker can observe the escrow UID and set refUID on their fulfillment.
- (e). No expiration/revocation prevents fulfillment prior to collection.

###### Proposed fix

####### StringResultObligation.sol

File: `contracts/src/obligations/example/StringResultObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/example/StringResultObligation.sol)

```diff
 ... 46 unchanged lines ...
         bytes32 fulfilling
     ) public view override returns (bool) {
-        if (!obligation._checkIntrinsic()) return false;
+        if (!obligation._checkIntrinsic(ATTESTATION_SCHEMA)) return false;
 
         // Check if the obligation is intended to fulfill the specific escrow
         if (
             obligation.refUID != bytes32(0) && obligation.refUID != fulfilling
         ) return false;
 
         ObligationData memory result = abi.decode(
             obligation.data,
             (ObligationData)
         );
         DemandData memory demandData = abi.decode(demand, (DemandData));
 
-        // Only compare the length of the query and result
-        return bytes(demandData.query).length == bytes(result.result).length;
+        // Compare full content equality of the query and result
+        return keccak256(bytes(demandData.query)) == keccak256(bytes(result.result));
     }
 }
```

### 27. [Medium] Unbounded per-item loops in TokenBundleEscrowObligation release/reclaim cause permanent fund lock

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Unbounded iteration over escrowed token bundle arrays during release and reclaim can exceed block gas limits, making escrows uncollectible or unreclaimable and permanently locking user funds.

Both tierable and non-tierable TokenBundleEscrowObligation contracts iterate over all entries in the escrowed token bundle (ERC20, ERC721, ERC1155 arrays) when releasing to the fulfiller or reclaiming on expiry. There are no caps on array lengths and no chunked/multi-transaction processing. Functions such as _releaseEscrow, _returnEscrow, and transferOutTokenBundleAtomic perform per-item external calls (balanceOf, transfer/transferFrom/safeTransferFrom) and verification checks. If the arrays are large, these loops can exceed the block gas limit and revert. Because revocation (eas.revoke) occurs in the same transaction prior to release, an out-of-gas reverts the entire transaction, leaving the escrow live and the funds locked. The unsafe partial variants still loop over the entire arrays and also revert if out of gas, providing no effective mitigation. This creates a self-DoS/loss-of-funds risk: users can create escrows that later cannot be collected or reclaimed, permanently stranding the escrowed value.

#### Severity

**Impact Explanation:** [High] Funds can be permanently frozen/blocked with no in-protocol workaround once the escrow is live and the release/reclaim loops exceed block gas.

**Likelihood Explanation:** [Low] Requires unusually large bundles or flawed integration behavior; typical UIs and users are unlikely to create pathologically large arrays.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Expired escrow is unreclaimable due to oversized arrays: A buyer creates an escrow with very large ERC20/ERC1155/ERC721 arrays (including potentially many zero-amount ERC20 entries). Creation and locking succeed within gas limits. After expiry, the buyer calls reclaimExpired, which revokes and then attempts to return the bundle via a full-array loop. The transaction exceeds gas and reverts, undoing the revoke and leaving funds permanently locked. Unsafe partial reclaim also reverts due to out-of-gas.
#### Preconditions / Assumptions
- (a). Buyer prepares ObligationData with extremely large token arrays that still allow the creation/lock transaction to fit within block gas limits
- (b). Standard token behavior; transfers of zero amounts succeed
- (c). Escrow eventually expires
- (d). Contract has no array length caps and no chunked/multi-transaction release path

### Scenario 2.
Collection attempt reverts out of gas: A buyer configures an escrow with very large token arrays and selects a permissive arbiter (e.g., one that returns true). A fulfiller calls collectEscrowRaw; the contract revokes and then attempts to release via full-array loops. The transaction runs out of gas and reverts, undoing the revoke and leaving the escrow and funds locked. Subsequent attempts (including unsafe partial collect) also fail the same way.
#### Preconditions / Assumptions
- (a). Buyer configures a permissive arbiter and large token arrays in the escrow
- (b). Escrow is active and eligible for collection
- (c). Fulfiller (or caller) triggers collectEscrowRaw
- (d). Large arrays make release loops exceed gas limits

### Scenario 3.
Integration/UI creates large zero-amount entries causing lock: An integration/UI constructs ObligationData with many zero-amount ERC20 lines (and/or many ERC1155/721 IDs). The buyer submits the escrow successfully. Later, either collection or reclaim attempts run the full-array release loops, exceed the gas limit, revert, and leave funds permanently stuck. No chunked mechanism exists to recover the funds.
#### Preconditions / Assumptions
- (a). Integration/UI populates many token entries (e.g., numerous zero-amount ERC20 lines) and buyer submits escrow
- (b). Later collection or reclaim is attempted
- (c). Full-array release loops exceed block gas limits
- (d). No chunked or incremental release/reclaim mechanism exists

#### Proposed fix

##### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 60 unchanged lines ...
     );
     error NativeTokenTransferFailed(address to, uint256 amount);
+    error BundleTooLarge();
 
     // Events emitted during partial release phase - continue on error
+    uint256 internal constant MAX_BUNDLE_ITEMS = 32;
     event NativeTokenTransferFailedOnRelease(address indexed to, uint256 amount);
     event ERC20TransferFailedOnRelease(
 ... 35 unchanged lines ...
             data.erc1155Tokens.length != data.erc1155Amounts.length
         ) revert ArrayLengthMismatch();
+        uint256 totalItems = data.erc20Tokens.length + data.erc721Tokens.length + data.erc1155Tokens.length;
+        if (totalItems > MAX_BUNDLE_ITEMS) revert BundleTooLarge();
     }
 
 ... 593 unchanged lines ...
```

##### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 60 unchanged lines ...
     );
     error NativeTokenTransferFailed(address to, uint256 amount);
+    error BundleTooLarge();
 
     // Events emitted during partial release phase - continue on error
+    uint256 internal constant MAX_BUNDLE_ITEMS = 32;
     event NativeTokenTransferFailedOnRelease(address indexed to, uint256 amount);
     event ERC20TransferFailedOnRelease(
 ... 35 unchanged lines ...
             data.erc1155Tokens.length != data.erc1155Amounts.length
         ) revert ArrayLengthMismatch();
+        uint256 totalItems = data.erc20Tokens.length + data.erc721Tokens.length + data.erc1155Tokens.length;
+        if (totalItems > MAX_BUNDLE_ITEMS) revert BundleTooLarge();
     }
 
 ... 593 unchanged lines ...
```

#### Related findings

##### [Low] Unbounded iteration over user-supplied arrays in TokenBundlePaymentObligation causes per-escrow gas-DoS on collection/payment

###### Description

TokenBundlePaymentObligation iterates over unbounded, user-supplied arrays in checkObligation and transferBundle without maximum length checks. A buyer can embed oversized demand/payment bundles that make later collection or payment attempts run out of gas, causing a per-escrow denial-of-service. This is primarily a griefing risk with attacker cost, not a system-wide DoS.

TokenBundlePaymentObligation decodes ObligationData from bytes and iterates over erc20/erc721/erc1155 arrays in two critical paths: (1) checkObligation -> _checkTokenArrays (used by escrow collection via IArbiter.checkObligation), and (2) _beforeAttest -> transferBundle (used during payment creation). No maximum lengths are enforced; validateArrayLengths only checks for matching lengths. In typical integrations, the escrow creator (buyer) chooses the arbiter and embeds the demand bytes in the escrow attestation. When a seller later attempts to collect the escrow or fulfill via TokenBundleBarterUtils, the code must iterate these arrays, which can exhaust gas and revert. This yields a per-escrow denial-of-service for collection/payment. The attacker (buyer) bears cost/risk (e.g., locking their escrowed assets until expiry), making this primarily a griefing vector rather than a profitable exploit.

###### Severity

**Impact Explanation:** [Medium] Per-escrow denial-of-service of core actions (escrow collection or barter payment) for affected escrows; protocol-wide functionality remains intact and no victim funds are directly frozen or stolen.

**Likelihood Explanation:** [Low] Primarily a griefing vector: attacker must first create escrows with oversized data (and potentially lock their own funds until expiry) without direct profit. Diligent users can avoid engaging with suspicious escrows; attacker bears non-trivial costs.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Escrow collection DoS via arbiter validation: Buyer creates a TokenBundleEscrowObligation escrow with arbiter = TokenBundlePaymentObligation and demand = abi.encode(ObligationData) containing very large arrays. When the seller later calls collectEscrow, BaseEscrowObligation.collectEscrowRaw calls IArbiter(arbiter).checkObligation, which reaches TokenBundlePaymentObligation._checkTokenArrays and iterates over the large arrays, causing out-of-gas and reverting collection for that escrow.
#### Preconditions / Assumptions
- (a). Buyer (attacker) can create an escrow via TokenBundleEscrowObligation with arbiter set to TokenBundlePaymentObligation
- (b). Buyer embeds demand = abi.encode(TokenBundlePaymentObligation.ObligationData) with very large erc20/erc721/erc1155 arrays
- (c). Seller later attempts to collect escrow using collectEscrow with a valid fulfillment
- (d). Gas limits allow escrow creation with the large demand bytes

### Scenario 2.
Barter payment DoS against seller: Buyer first creates an escrow as above. The seller uses TokenBundleBarterUtils.payBundleForBundle (or permit variant), which decodes the buyer’s large demand and then pulls/approves tokens and calls TokenBundlePaymentObligation.doObligationFor. In _beforeAttest, transferBundle iterates over the large arrays to transfer tokens, causing out-of-gas/revert and preventing the seller from completing payment for that escrow.
#### Preconditions / Assumptions
- (a). Buyer (attacker) has already created an escrow with arbiter = TokenBundlePaymentObligation and oversized demand arrays
- (b). Seller uses TokenBundleBarterUtils to fulfill/pay for the escrow (payBundleForBundle or permitAndPayBundleForBundle)
- (c). Gas limits allow decoding of the large demand bytes before iteration
- (d). Seller interacts through the standard BarterUtils flow

###### Proposed fix

####### TokenBundlePaymentObligation.sol

File: `contracts/src/obligations/payment/TokenBundlePaymentObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/payment/TokenBundlePaymentObligation.sol)

```diff
 ... 47 unchanged lines ...
         uint256 amount
     );
+    error BundleTooLarge();
+    uint256 internal constant MAX_BUNDLE_ITEMS = 64;
 
     constructor(
 ... 106 unchanged lines ...
             data.erc1155Tokens.length != data.erc1155Amounts.length
         ) revert ArrayLengthMismatch();
+        if (data.erc20Tokens.length + data.erc721Tokens.length + data.erc1155Tokens.length > MAX_BUNDLE_ITEMS) revert BundleTooLarge();
     }
 
 ... 75 unchanged lines ...
         ObligationData memory demand
     ) internal pure returns (bool) {
+        if (payment.erc20Tokens.length + payment.erc721Tokens.length + payment.erc1155Tokens.length > MAX_BUNDLE_ITEMS) return false;
+        if (demand.erc20Tokens.length + demand.erc721Tokens.length + demand.erc1155Tokens.length > MAX_BUNDLE_ITEMS) return false;
         // Check ERC20s
         if (payment.erc20Tokens.length < demand.erc20Tokens.length)
 ... 48 unchanged lines ...
```

### 28. [Medium] Unchecked ERC20 return values in ERC20BarterUtils/TokenBundleBarterUtils cause unauthorized spending of contract-held tokens

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

ERC20BarterUtils and TokenBundleBarterUtils call IERC20.transferFrom and IERC20.approve without checking return values. If a token returns false on failed transferFrom, the utils continue execution; the obligation contracts then (correctly) pull tokens from the payer = the utils contract using SafeERC20 and balance-delta checks. Any pre-existing ERC20 balances held by the utils can be spent to fund escrows/payments, enabling attackers to drain those balances.

Multiple functions in ERC20BarterUtils and TokenBundleBarterUtils use raw IERC20.transferFrom and IERC20.approve without verifying the returned boolean. For ERC20s that return false on failed transferFrom, user→utils pulls can silently fail while the code proceeds. The obligation contracts (ERC20EscrowObligation and ERC20PaymentObligation) treat msg.sender (the utils) as the payer and use SafeERC20.trySafeTransferFrom with recipient balance-delta checks to perform real transfers. If the utils already hold any balance of the targeted ERC20 and allowance to the obligation is set or already sufficient, the obligations will successfully transfer tokens from the utils to escrow/payees. This allows attackers to (a) create escrows funded by the utils’ tokens and immediately collect via zero-demand payments or later reclaim on expiry, or (b) fulfill other users’ escrows using the utils’ tokens and receive the escrowed asset. Without a pre-existing utils balance in the chosen token, the obligation’s balance-delta checks cause a revert, so loss only occurs when stranded balances exist. The issue stems from unchecked ERC20 returns in the utils, while the obligations correctly enforce actual transfers from the payer.

#### Severity

**Impact Explanation:** [High] Enables direct, unauthorized transfer of ERC20 tokens held by the protocol utility contracts (ERC20BarterUtils/TokenBundleBarterUtils), resulting in material loss of principal funds.

**Likelihood Explanation:** [Low] Exploitation requires uncommon but plausible conditions: existence of stranded ERC20 balances at the utils and use of an ERC20 that returns false on failed transferFrom, plus allowance conditions. These rely on user/operator mistakes or accidental deposits and are not generally present.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Immediate drain via ERC20BarterUtils: attacker selects an ERC20 T that returns false on failed transferFrom and for which ERC20BarterUtils holds balance B > 0. Attacker calls buyErc20ForErc20 with bidToken=T and askAmount=0; the user→utils transferFrom silently fails, approve sets allowance, and ERC20EscrowObligation pulls X from the utils into escrow. Attacker then calls payErc20ForErc20 with demand amount 0, and collectEscrow releases X T to the attacker.
#### Preconditions / Assumptions
- (a). An ERC20 token T that returns false on failed transferFrom (no revert)
- (b). ERC20BarterUtils holds a positive balance B of T (stranded funds)
- (c). Allowance from ERC20BarterUtils to ERC20EscrowObligation for T is set or can be set from 0 to X
- (d). Zero-amount payments are permitted and handled as valid by the obligations
- (e). Attacker can choose token/address parameters in the utils call

### Scenario 2.
Fulfill someone else’s ERC20 escrow using the utils’ tokens: a victim has an ERC20 escrow demanding token T, amount A, payee=victim. ERC20BarterUtils holds at least A of T. The attacker calls payErc20ForErc20(buyAttestation); the user→utils transferFrom fails silently, approve provides allowance, ERC20PaymentObligation pulls A T from the utils to the victim, and the escrow releases the escrowed asset to the attacker.
#### Preconditions / Assumptions
- (a). A public ERC20 escrow attestation exists demanding token T amount A payable to the victim
- (b). ERC20 token T returns false on failed transferFrom
- (c). ERC20BarterUtils holds at least A of T (stranded funds)
- (d). Allowance from ERC20BarterUtils to ERC20PaymentObligation for T is set or can be set from 0 to A
- (e). Attacker can obtain the escrow UID and call the utils pay function

### Scenario 3.
Drain via TokenBundleBarterUtils: attacker crafts a bundle escrow where the bid bundle has ERC20 T amount X and the ask bundle demands zero of everything. The user→utils ERC20 transferFrom in _pullBundleTokens fails silently, approve sets allowance, and TokenBundleEscrowObligation pulls X T from TokenBundleBarterUtils. The attacker then pays a zero-amount bundle and collects, receiving X T.
#### Preconditions / Assumptions
- (a). An ERC20 token T that returns false on failed transferFrom
- (b). TokenBundleBarterUtils holds a positive balance of T (stranded funds)
- (c). Allowance from TokenBundleBarterUtils to TokenBundleEscrowObligation for T is set or can be set from 0 to X
- (d). Zero-amount bundle demands are permitted and pass obligation checks
- (e). Attacker can call bundle utils functions with chosen parameters

#### Proposed fix

##### ERC20BarterUtils.sol

File: `contracts/src/utils/barter/ERC20BarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/ERC20BarterUtils.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {Attestation} from "@eas/Common.sol";
 import {IEAS} from "@eas/IEAS.sol";
 import {ERC20EscrowObligation} from "../../obligations/escrow/non-tierable/ERC20EscrowObligation.sol";
 import {ERC20PaymentObligation} from "../../obligations/payment/ERC20PaymentObligation.sol";
 import {ERC721EscrowObligation} from "../../obligations/escrow/non-tierable/ERC721EscrowObligation.sol";
 import {ERC721PaymentObligation} from "../../obligations/payment/ERC721PaymentObligation.sol";
 import {ERC1155EscrowObligation} from "../../obligations/escrow/non-tierable/ERC1155EscrowObligation.sol";
 import {ERC1155PaymentObligation} from "../../obligations/payment/ERC1155PaymentObligation.sol";
 import {TokenBundleEscrowObligation} from "../../obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol";
 import {TokenBundlePaymentObligation} from "../../obligations/payment/TokenBundlePaymentObligation.sol";
 import {NativeTokenEscrowObligation} from "../../obligations/escrow/non-tierable/NativeTokenEscrowObligation.sol";
 import {NativeTokenPaymentObligation} from "../../obligations/payment/NativeTokenPaymentObligation.sol";
 import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
 import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
 
+// SECURITY: Replace all raw ERC20 transferFrom/approve with SafeERC20 equivalents.
+// Use IERC20(token).safeTransferFrom(...) and SafeERC20.forceApprove(...) to ensure failures revert
+// and to prevent spending any pre-existing ERC20 balances held by this utils contract.
+// Apply consistently to all IERC20(...).transferFrom/approve call sites in this file.
 contract ERC20BarterUtils {
     IEAS internal eas;
 ... 869 unchanged lines ...
```

##### TokenBundleBarterUtils.sol

File: `contracts/src/utils/barter/TokenBundleBarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/TokenBundleBarterUtils.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {Attestation} from "@eas/Common.sol";
 import {IEAS} from "@eas/IEAS.sol";
 import {TokenBundleEscrowObligation} from "../../obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol";
 import {TokenBundlePaymentObligation} from "../../obligations/payment/TokenBundlePaymentObligation.sol";
 import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
 import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
 import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
 import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
 import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
 
 contract TokenBundleBarterUtils is IERC1155Receiver {
     IEAS internal eas;
     TokenBundleEscrowObligation internal bundleEscrow;
     TokenBundlePaymentObligation internal bundlePayment;
 
+    // SECURITY: Replace all raw ERC20 transferFrom/approve with SafeERC20:
+    // use safeTransferFrom(...) in _pullBundleTokens/_pullPaymentBundleTokens and forceApprove(...) in
+    // _approveBundleTokens/_approvePaymentBundleTokens to ensure failures revert and avoid draining pre-existing balances.
+
     error CouldntCollectEscrow();
     error InvalidSignatureLength();
 ... 368 unchanged lines ...
```

### 29. [Low] Type-mismatched decoding and wrong escrow contract call in ERC1155BarterUtils.payErc1155ForErc20 causes settlement DoS of helper path

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

ERC1155BarterUtils.payErc1155ForErc20 attempts to settle an ERC1155-for-ERC20 trade but decodes the buy attestation and its demand with incompatible types, invokes the wrong payment contract, and calls collectEscrow on the wrong escrow contract, causing guaranteed reverts. Other settlement paths remain available, so funds are not permanently locked.

The ERC1155BarterUtils.buyErc20WithErc1155 function creates an ERC1155 escrow attestation using ERC1155EscrowObligation.ObligationData and encodes its demand as ERC20PaymentObligation.ObligationData with arbiter set to the ERC20PaymentObligation contract. The corresponding settlement function, ERC1155BarterUtils.payErc1155ForErc20, incorrectly decodes the buy attestation as ERC20EscrowObligation.ObligationData and then decodes the nested demand as ERC1155PaymentObligation.ObligationData. It also uses erc1155Payment.doObligationFor (while the escrow's arbiter expects ERC20PaymentObligation) and finally calls erc20Escrow.collectEscrow even though the escrow was created with erc1155Escrow. These independent mismatches ensure the function always reverts (due to type/length decode errors, schema mismatches, and wrong escrow contract usage). Despite this, settlement can still be performed permissionlessly by using ERC20BarterUtils.payErc20ForErc1155 or by calling erc20Payment.doObligationFor with the correct data followed by erc1155Escrow.collectEscrow, and expiring escrows can be reclaimed via reclaimExpired.

#### Severity

**Impact Explanation:** [Low] This is a correctness/logic failure confined to a helper function; no funds are lost, protocol invariants remain intact, and settlement is still achievable via alternative permissionless paths or by reclaiming on expiry.

**Likelihood Explanation:** [Medium] Exploitation requires integrators or users to specifically use this broken helper path despite the existence of correct alternatives; this is plausible but not universal.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
A buyer creates an ERC1155 escrow via ERC1155BarterUtils.buyErc20WithErc1155; the seller then calls ERC1155BarterUtils.payErc1155ForErc20 with the buy attestation. The function decodes the attestation and demand with incompatible types, attempts to use the ERC1155 payment contract instead of ERC20 payment, and calls the wrong escrow contract for collection, causing the transaction to revert and preventing settlement via this helper.
#### Preconditions / Assumptions
- (a). ERC1155BarterUtils is deployed and initialized with IEAS, ERC1155EscrowObligation, ERC20PaymentObligation, and ERC20EscrowObligation instances
- (b). Standard-compliant ERC1155 and ERC20 tokens per scope assumptions
- (c). Buyer creates an escrow via buyErc20WithErc1155, obtaining a buy attestation
- (d). Seller attempts to settle via ERC1155BarterUtils.payErc1155ForErc20 using that attestation

### Scenario 2.
Even if decode errors were hypothetically bypassed, ERC1155BarterUtils.payErc1155ForErc20 calls erc20Escrow.collectEscrow using an ERC1155 escrow attestation. BaseEscrowObligation enforces schema matching and reverts with InvalidEscrowAttestation, independently preventing settlement via this helper.
#### Preconditions / Assumptions
- (a). An ERC1155 escrow attestation was created via buyErc20WithErc1155
- (b). Seller uses ERC1155BarterUtils.payErc1155ForErc20 to settle
- (c). Function proceeds to call collectEscrow on erc20Escrow while the escrow was created by erc1155Escrow

### Scenario 3.
A dApp integrates only ERC1155BarterUtils for ERC1155-for-ERC20 trades. Buyers create escrows with buyErc20WithErc1155, but sellers attempting to settle via payErc1155ForErc20 always revert. Funds appear stuck to users of that dApp until someone uses ERC20BarterUtils or the underlying contracts to settle, or the buyer reclaims on expiry if set.
#### Preconditions / Assumptions
- (a). A third-party dApp exposes only ERC1155BarterUtils for ERC1155-for-ERC20 trades (no ERC20BarterUtils or direct obligation calls exposed)
- (b). Users create escrows via buyErc20WithErc1155 and rely solely on payErc1155ForErc20 for settlement
- (c). Optionally, escrows have expiration set to 0, increasing the apparent lock duration if users do not use alternative settlement paths

#### Proposed fix

##### ERC1155BarterUtils.sol

File: `contracts/src/utils/barter/ERC1155BarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/ERC1155BarterUtils.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {Attestation} from "@eas/Common.sol";
 import {IEAS} from "@eas/IEAS.sol";
 import {ERC20EscrowObligation} from "../../obligations/escrow/non-tierable/ERC20EscrowObligation.sol";
 import {ERC20PaymentObligation} from "../../obligations/payment/ERC20PaymentObligation.sol";
 import {ERC721EscrowObligation} from "../../obligations/escrow/non-tierable/ERC721EscrowObligation.sol";
 import {ERC721PaymentObligation} from "../../obligations/payment/ERC721PaymentObligation.sol";
 import {ERC1155EscrowObligation} from "../../obligations/escrow/non-tierable/ERC1155EscrowObligation.sol";
 import {ERC1155PaymentObligation} from "../../obligations/payment/ERC1155PaymentObligation.sol";
 import {TokenBundleEscrowObligation} from "../../obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol";
 import {TokenBundlePaymentObligation} from "../../obligations/payment/TokenBundlePaymentObligation.sol";
 import {NativeTokenEscrowObligation} from "../../obligations/escrow/non-tierable/NativeTokenEscrowObligation.sol";
 import {NativeTokenPaymentObligation} from "../../obligations/payment/NativeTokenPaymentObligation.sol";
 import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
+import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
 import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
 
 ... 201 unchanged lines ...
             revert AttestationNotFound(buyAttestation);
         }
-        ERC20EscrowObligation.ObligationData memory escrowData = abi.decode(
+        ERC1155EscrowObligation.ObligationData memory escrowData = abi.decode(
             bid.data,
-            (ERC20EscrowObligation.ObligationData)
+            (ERC1155EscrowObligation.ObligationData)
         );
-        ERC1155PaymentObligation.ObligationData memory demand = abi.decode(
+        ERC20PaymentObligation.ObligationData memory demand = abi.decode(
             escrowData.demand,
-            (ERC1155PaymentObligation.ObligationData)
+            (ERC20PaymentObligation.ObligationData)
         );
 
-        // Pull ERC1155 tokens from user to BarterUtils
-        IERC1155(demand.token).safeTransferFrom(
+        // Pull ERC20 tokens from user to BarterUtils
+        IERC20(demand.token).transferFrom(
             msg.sender,
             address(this),
-            demand.tokenId,
-            demand.amount,
-            ""
+            demand.amount
         );
 
-        // Approve obligation contract to spend BarterUtils' ERC1155 tokens
-        IERC1155(demand.token).setApprovalForAll(address(erc1155Payment), true);
+        // Approve obligation contract to spend BarterUtils' ERC20 tokens
+        IERC20(demand.token).approve(address(erc20Payment), demand.amount);
 
-        bytes32 sellAttestation = erc1155Payment.doObligationFor(
+        bytes32 sellAttestation = erc20Payment.doObligationFor(
             demand,
             msg.sender,
             buyAttestation // Reference the escrow this payment is for
         );
 
-        if (!erc20Escrow.collectEscrow(buyAttestation, sellAttestation)) {
+        if (!erc1155Escrow.collectEscrow(buyAttestation, sellAttestation)) {
             revert CouldntCollectEscrow();
         }
 ... 294 unchanged lines ...
```

### 30. [Low] Unconditional EIP-2612 permit usage in ERC20BarterUtils causes front-run griefing and DoS of permit-and-action flows

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

ERC20BarterUtils’ permit-based entrypoints call token.permit() and revert on failure without tolerating pre-existing allowance. A mempool observer can front-run by submitting the same signed permit directly to the token, consuming the nonce and causing the victim’s permitAnd* call to revert, resulting in a DoS of the atomic permit+action UX. No theft is possible because all token pulls use msg.sender as the owner.

All permit-and-action functions in ERC20BarterUtils (e.g., permitAndBuyWithErc20, permitAndPayWithErc20, permitAndBuyErc20ForErc20, permitAndPayErc20ForErc20, and cross-asset variants using _permitPayment) unconditionally invoke IERC20Permit(token).permit(...) and revert on any error. Because EIP-2612 permits are permissionless, an attacker can replay the user’s signature directly against the token contract first, consuming the nonce and setting the intended allowance for ERC20BarterUtils. When the victim’s transaction executes, its internal permit call fails due to the used nonce, reverting the entire function despite the allowance being already set. The contract does not check allowance before/after permit or continue when allowance is sufficient. This enables DoS/grief of the atomic UX, potentially causing missed time-sensitive fills/settlements and gas loss. Theft is not possible because all transferFrom calls in ERC20BarterUtils use msg.sender as the owner, and downstream obligations move funds from ERC20BarterUtils’ balance, not directly from users.

#### Severity

**Impact Explanation:** [Low] The issue causes DoS of optional permit-and-action convenience functions with gas loss and potential brief timing disadvantages. Core protocol functionality remains available via non-permit flows or private submission, and no principal funds are at risk.

**Likelihood Explanation:** [Low] Exploitation typically requires an attacker to spend gas for limited advantage (often pure grief). It also depends on public mempool submission and timing competition; users can mitigate by using non-permit flows or private relays.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Front-run DoS of permitAndBuyErc20ForErc20: Attacker copies the victim’s permit signature from the public mempool and calls bidToken.permit(...) first. The victim’s subsequent permit call in ERC20BarterUtils reverts due to a consumed nonce, aborting escrow creation and causing the victim to miss a time-sensitive trade.
#### Preconditions / Assumptions
- (a). Token is a standard EIP-2612 implementation (reverts on used/invalid nonce).
- (b). Victim submits a permitAndBuyErc20ForErc20 transaction to the public mempool with a valid signature (spender = ERC20BarterUtils, value = bidAmount).
- (c). Attacker can observe mempool and front-run with a direct token.permit(...) call.
- (d). Competitive/timing-sensitive context where missing the immediate escrow creation presents a disadvantage.

### Scenario 2.
Front-run DoS of permitAndPayErc20ForErc721: Attacker front-runs the victim’s permit by calling demand.token.permit(...) first. ERC20BarterUtils’ _permitPayment then reverts, preventing settlement of an existing NFT escrow and causing the victim to lose the opportunity to acquire the NFT.
#### Preconditions / Assumptions
- (a). Token is a standard EIP-2612 implementation (reverts on used/invalid nonce).
- (b). An ERC721 escrow exists requiring an ERC20 payment to settle.
- (c). Victim submits permitAndPayErc20ForErc721 to the public mempool with a valid signature.
- (d). Attacker can observe mempool and front-run with token.permit(...) to consume the nonce before the victim’s transaction.

### Scenario 3.
Repeated griefing across permitAnd* flows: An attacker repeatedly front-runs permits for various permit-based functions, forcing consistent reverts, causing the victim to waste gas and suffer delays until they switch to non-permit flows or private submission.
#### Preconditions / Assumptions
- (a). Token is a standard EIP-2612 implementation.
- (b). Victim repeatedly uses permit-based entrypoints and submits via public mempool.
- (c). Attacker consistently front-runs permits, accepting gas costs purely to cause reverts (griefing).

#### Proposed fix

##### ERC20BarterUtils.sol

File: `contracts/src/utils/barter/ERC20BarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/ERC20BarterUtils.sol)

```diff
 ... 60 unchanged lines ...
 
     // ============ ERC20 to ERC20 Functions ============
+    // NOTE(security): All permit-and-* entrypoints below should implement a tolerant EIP-2612 pattern:
+    // - If IERC20(token).allowance(msg.sender, address(this)) >= amount: skip calling permit.
+    // - Else try IERC20Permit(token).permit(...); on catch, re-check allowance and proceed if sufficient; otherwise revert.
+    // This prevents DoS when a third party front-runs the same permit signature and consumes the nonce.
 
     function permitAndBuyWithErc20(
         address token,
         uint256 amount,
         address arbiter,
         bytes memory demand,
         uint64 expiration,
         uint256 deadline,
         uint8 v,
         bytes32 r,
         bytes32 s
     ) external returns (bytes32) {
+        // TODO(security): Wrap permit in try/catch and tolerate already-sufficient allowance per note above.
+        // Repeat for all permitAnd* functions in this file that call permit directly.
         IERC20Permit tokenC = IERC20Permit(token);
         tokenC.permit(
 ... 217 unchanged lines ...
     // ============ Cross-Token Functions ============
 
+    // NOTE(security): Implement tolerant permit here:
+    // 1) If IERC20(demand.token).allowance(msg.sender, address(this)) >= demand.amount: return (skip permit).
+    // 2) Else try IERC20Permit(demand.token).permit(...); on catch, re-check allowance and proceed if sufficient; otherwise revert.
+    // Ensures front-run reuse of the same signature cannot DoS the atomic flow.
+
     // Internal helper for permit
     function _permitPayment(
 ... 592 unchanged lines ...
```

##### TokenBundleBarterUtils.sol

File: `contracts/src/utils/barter/TokenBundleBarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/TokenBundleBarterUtils.sol)

```diff
 ... 36 unchanged lines ...
     }
 
+    // NOTE(security): For all permitAnd* bundle functions:
+    // For each ERC20 in the bundle, apply the tolerant permit pattern:
+    // check allowance first, try permit if needed, then re-check and proceed if sufficient; otherwise revert.
+
     function permitAndEscrowBundle(
         TokenBundleEscrowObligation.ObligationData calldata data,
 ... 348 unchanged lines ...
```

#### Related findings

##### [Low] Unconditional ERC20 permit loops in TokenBundleBarterUtils cause DoS via front-run nonce consumption

###### Description

TokenBundleBarterUtils’ permitAnd* functions unconditionally call IERC20Permit.permit for each ERC20 in a bundle and revert on any failure. Because permits are permissionless, an attacker can front-run by submitting the same signatures directly to the token(s), consuming nonces and setting allowances. The helper’s subsequent permit calls then revert, causing the entire atomic bundle action to fail despite allowances being set to the intended spender.

All four TokenBundleBarterUtils entrypoints that use permits (permitAndEscrowBundle, permitAndPayBundle, permitAndEscrowBundleForBundle, permitAndPayBundleForBundle) first loop over ERC20s to call IERC20Permit.permit and only then pull tokens and proceed. If any permit reverts (e.g., because a third party already used the same signature and consumed the nonce), the transaction reverts before any transfers or escrows occur. Since EIP-2612 permits are permissionless, a front-runner can copy the victim’s signatures from a public mempool transaction and submit them first to the relevant token(s), causing the helper’s permit calls to fail. This does not enable theft because the allowance is set to TokenBundleBarterUtils and transferFrom operations use msg.sender; however, it reliably DoS’s the user’s atomic action, potentially causing missed fills in race-sensitive scenarios. For the “forBundle” flows, non-permit alternatives (buyBundleForBundle/payBundleForBundle) exist and can be used after the attacker has set allowances, but the original atomic call still fails and can lose a race.

###### Severity

**Impact Explanation:** [Low] The issue affects helper-level availability (permitAnd* entrypoints) without loss of principal or core protocol breakage; users can use non-permit paths or underlying obligations, though they may lose opportunities in time-sensitive contexts.

**Likelihood Explanation:** [Medium] In competitive fills there is a rational incentive to front-run permits; with public mempool visibility and EIP-2612 tokens, attackers can feasibly execute this DoS, though it depends on realistic but not universal preconditions.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
DoS when posting a bundle escrow: A user calls permitAndEscrowBundle with valid EIP-2612 permits in a public mempool. An attacker front-runs by submitting one of the same permits directly to the token, consuming the nonce and setting the allowance. When the user’s transaction executes, the helper’s permit call reverts due to invalid nonce/signature, and the whole escrow creation reverts.
#### Preconditions / Assumptions
- (a). At least one ERC20 in the bundle supports EIP-2612 and reverts on invalid/used signatures
- (b). Victim submits the permit-bearing transaction to a public mempool
- (c). Permit signatures are valid and not expired
- (d). Attacker can observe and gain priority inclusion to submit the same permit first

### Scenario 2.
DoS when making a bundle payment: A user calls permitAndPayBundle with valid ERC20 permits in a public mempool. An attacker front-runs at least one permit to the respective token contract. The user’s subsequent permit call inside the helper reverts, and the payment fails, potentially missing a deadline.
#### Preconditions / Assumptions
- (a). At least one ERC20 in the payment bundle supports EIP-2612 and reverts on invalid/used signatures
- (b). Victim submits the permit-bearing transaction to a public mempool
- (c). Permit signatures are valid and not expired
- (d). Attacker can observe and gain priority inclusion to submit the same permit first

### Scenario 3.
Race to fulfill a posted buy escrow: A seller tries to fulfill via permitAndPayBundleForBundle (public mempool). An attacker front-runs a permit to consume the nonce and then immediately submits payBundleForBundle (non-permit) with pre-approvals to fulfill first. The victim’s permit-based call reverts; the attacker captures the escrowed assets.
#### Preconditions / Assumptions
- (a). A buy bundle escrow exists and is open to fulfillment
- (b). At least one demanded ERC20 supports EIP-2612
- (c). Victim submits a permit-bearing transaction to a public mempool
- (d). Attacker can observe and front-run the permit, and can also quickly submit a non-permit fulfillment (e.g., with pre-approvals) to win the race

###### Proposed fix

####### TokenBundleBarterUtils.sol

File: `contracts/src/utils/barter/TokenBundleBarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/TokenBundleBarterUtils.sol)

```diff
 ... 46 unchanged lines ...
         // Handle ERC20 permits - approve BarterUtils
         for (uint i = 0; i < data.erc20Tokens.length; i++) {
+            if (IERC20(data.erc20Tokens[i]).allowance(msg.sender, address(this)) < data.erc20Amounts[i]) {
             IERC20Permit(data.erc20Tokens[i]).permit(
+            if (IERC20(data.erc20Tokens[i]).allowance(msg.sender, address(this)) < data.erc20Amounts[i]) {
                 msg.sender,
                 address(this),
                 data.erc20Amounts[i],
                 permits[i].deadline,
                 permits[i].v,
                 permits[i].r,
                 permits[i].s
             );
+            }
+            }
         }
 
 ... 108 unchanged lines ...
         // Handle ERC20 permits - approve BarterUtils
         for (uint i = 0; i < bidBundle.erc20Tokens.length; i++) {
+            if (IERC20(bidBundle.erc20Tokens[i]).allowance(msg.sender, address(this)) < bidBundle.erc20Amounts[i]) {
             IERC20Permit(bidBundle.erc20Tokens[i]).permit(
                 msg.sender,
                 address(this),
                 bidBundle.erc20Amounts[i],
                 permits[i].deadline,
                 permits[i].v,
                 permits[i].r,
                 permits[i].s
             );
+            }
         }
 
         return _buyBundleForBundle(bidBundle, askBundle, expiration);
     }
 
     function permitAndPayBundleForBundle(
         bytes32 buyAttestation,
         ERC20PermitSignature[] calldata permits
     ) external payable returns (bytes32) {
         Attestation memory bid = eas.getAttestation(buyAttestation);
         TokenBundleEscrowObligation.ObligationData memory escrowData = abi
             .decode(bid.data, (TokenBundleEscrowObligation.ObligationData));
         TokenBundlePaymentObligation.ObligationData memory demand = abi.decode(
             escrowData.demand,
             (TokenBundlePaymentObligation.ObligationData)
         );
 
         if (permits.length != demand.erc20Tokens.length)
             revert InvalidSignatureLength();
 
         // Handle ERC20 permits - approve BarterUtils
         for (uint i = 0; i < demand.erc20Tokens.length; i++) {
+            if (IERC20(demand.erc20Tokens[i]).allowance(msg.sender, address(this)) < demand.erc20Amounts[i]) {
             IERC20Permit(demand.erc20Tokens[i]).permit(
                 msg.sender,
                 address(this),
                 demand.erc20Amounts[i],
                 permits[i].deadline,
                 permits[i].v,
                 permits[i].r,
                 permits[i].s
             );
+            }
         }
 
 ... 177 unchanged lines ...
```

### 31. [Informational] Constructor-registered EAS schema in AttestationEscrowObligation2 binds resolver to contract address causing schema UID changes on upgrade and off-chain data fragmentation

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

AttestationEscrowObligation2 (tierable and non-tierable) registers a validation schema in the constructor with `this` as resolver. Because EAS schema UIDs include the resolver address, redeploying or upgrading to a new contract address produces a different schema UID, fragmenting off-chain indexing and analytics across multiple UIDs.

Both AttestationEscrowObligation2 variants set an immutable VALIDATION_SCHEMA by calling SchemaRegistry.register in their constructors with `this` as the resolver. EAS computes schema UIDs as keccak256(schema, resolver, revocable), so the resolver address is part of the UID. On redeploy/upgrade (new contract address), re-registering the same logical schema yields a new UID. Subsequent validation attestations will be minted under the new UID, while existing ones remain under the old UID. This causes read-path/integration fragmentation (e.g., indexers/dashboards must aggregate multiple UIDs). There is no on-chain funds or state safety impact.

#### Severity

**Impact Explanation:** [Informational] The effect is limited to off-chain read-path/integration fragmentation (multiple schema UIDs for the same logical data) with no on-chain state or fund safety impact.

**Likelihood Explanation:** [Medium] Redeploys/upgrades are plausible and not rare; without explicit planning for UID stability, off-chain consumers may miss data until updated.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Admin redeploys or upgrades AttestationEscrowObligation2 to a new contract address. In the constructor, it registers the same validation schema again with the new address as resolver, producing a new schema UID. After the change, collection mints validation attestations under the new UID, while older attestations remain under the old UID. Off-chain systems that assume a single schema UID miss part of the data unless updated to track both, causing read-path discrepancies.
#### Preconditions / Assumptions
- (a). Admin performs a redeploy or upgrade resulting in a new contract address
- (b). AttestationEscrowObligation2 registers VALIDATION_SCHEMA in its constructor with `this` as resolver
- (c). EAS SchemaRegistry computes UID as keccak256(schema, resolver, revocable)
- (d). Off-chain consumers (indexers/analytics/integrations) rely on a single schema UID unless updated

#### Proposed fix

##### AttestationEscrowObligation2.sol

File: `contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation2.sol)

```diff
 ... 30 unchanged lines ...
         )
     {
+        // WARNING: Constructor-time schema registration binds VALIDATION_SCHEMA to this contract's address.
+        // To keep the validation schema UID stable across redeploys/upgrades, accept a pre-registered UID
+        // via constructor args and remove registration here (e.g., use a dedicated persistent resolver).
         // Register the validation schema
         VALIDATION_SCHEMA = _schemaRegistry.register(
 ... 124 unchanged lines ...
```

##### AttestationEscrowObligation2.sol

File: `contracts/src/obligations/escrow/tierable/AttestationEscrowObligation2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/AttestationEscrowObligation2.sol)

```diff
 ... 30 unchanged lines ...
         )
     {
+        // WARNING: Constructor-time schema registration binds VALIDATION_SCHEMA to this contract's address.
+        // To keep the validation schema UID stable across redeploys/upgrades, accept a pre-registered UID
+        // via constructor args and remove registration here (e.g., use a dedicated persistent resolver).
         // Register the validation schema
         VALIDATION_SCHEMA = _schemaRegistry.register(
 ... 124 unchanged lines ...
```

### 32. [Informational] Non-payable helper and zero resolver value in AttestationBarterUtils causes reverts for payable EAS resolvers

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

AttestationBarterUtils does not forward ETH to EAS resolvers: attest() hardcodes value=0 and attestAndCreateEscrow() is non-payable, so schemas with payable resolvers that require non-zero value revert, breaking these helper flows.

AttestationBarterUtils provides convenience methods for creating EAS attestations and a combined attest+escrow flow but does not support funding EAS resolvers. The attest() function constructs an AttestationRequest with AttestationRequestData.value = 0 and sends no ETH, and attestAndCreateEscrow() is non-payable and calls eas.attest(attestationRequest) without forwarding ETH. In the vendored EAS, request.data.value must be covered by msg.value and is forwarded to the schema resolver. Payable resolvers (e.g., ones that require a non-zero amount) will cause EAS to revert (InsufficientValue or InvalidAttestation) when used via these helpers. This results in a functional DoS of these utility flows for payable resolvers. Core project flows, which use zero-value, non-payable resolvers, are unaffected; users who need payable resolvers can call IEAS directly as a workaround.

#### Severity

**Impact Explanation:** [Low] This is a functional limitation/DoS of helper utilities for payable resolvers; no funds are at risk, no core protocol functions are broken, and a simple workaround exists by calling IEAS directly.

**Likelihood Explanation:** [Medium] Encountered when integrators use schemas with payable resolvers; plausible but not universal given the project’s core design favors zero-value resolvers.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Direct attestation via AttestationBarterUtils.attest() to a schema with a payable resolver (e.g., ValueResolver requiring a non-zero target value) reverts because the helper sets value=0 and sends no ETH; EAS forwards 0 and the resolver rejects, causing InvalidAttestation.
#### Preconditions / Assumptions
- (a). A schema is registered with a payable resolver that requires a non-zero ETH amount at attestation time
- (b). User invokes AttestationBarterUtils.attest() to create the attestation
- (c). EAS behavior is as in the vendored implementation enforcing request.data.value against msg.value

### Scenario 2.
One-shot AttestationBarterUtils.attestAndCreateEscrow() with an AttestationRequest that has data.value > 0 reverts because the function is non-payable and does not forward ETH; EAS enforces data.value <= msg.value and reverts with InsufficientValue.
#### Preconditions / Assumptions
- (a). A schema is registered with a payable resolver requiring a non-zero ETH value
- (b). User calls AttestationBarterUtils.attestAndCreateEscrow() with AttestationRequest.data.value > 0
- (c). The helper is non-payable and forwards no ETH to EAS

### Scenario 3.
Using either helper with any resolver that expects a positive value (not necessarily fixed) fails: attest() always sends 0 so the resolver rejects; attestAndCreateEscrow() with data.value > 0 still sends 0 ETH, so EAS reverts due to insufficient msg.value.
#### Preconditions / Assumptions
- (a). Resolver is payable and expects a positive (non-zero) ETH value for attestations
- (b). User attempts to use AttestationBarterUtils.attest() or attestAndCreateEscrow() for such a schema
- (c). EAS enforces request.data.value <= msg.value and forwards that amount to the resolver

#### Proposed fix

##### AttestationBarterUtils.sol

File: `contracts/src/utils/barter/AttestationBarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/AttestationBarterUtils.sol)

```diff
 ... 51 unchanged lines ...
         bytes32 refUID,
         bytes calldata data
-    ) external returns (bytes32) {
+    ) external payable returns (bytes32) {
         return
-            eas.attest(
+            eas.attest{value: msg.value}(
                 AttestationRequest({
                     schema: schema,
                     data: AttestationRequestData({
                         recipient: recipient,
                         expirationTime: expirationTime,
                         revocable: revocable,
                         refUID: refUID,
                         data: data,
-                        value: 0
+                        value: msg.value
                     })
                 })
             );
     }
 
     function attestAndCreateEscrow(
         AttestationRequest calldata attestationRequest,
         address arbiter,
         bytes calldata demand,
         uint64 expiration
-    ) external returns (bytes32 attestationUid, bytes32 escrowUid) {
+    ) external payable returns (bytes32 attestationUid, bytes32 escrowUid) {
+        require(
+            msg.value == attestationRequest.data.value,
+            "resolver value mismatch"
+        );
         // First create the attestation
-        attestationUid = eas.attest(attestationRequest);
+        attestationUid = eas.attest{value: msg.value}(attestationRequest);
 
         // Then create the escrow obligation
 ... 30 unchanged lines ...
```

### 33. [Informational] Plaintext, permissionless result submission with public/content-only oracle in ApiCallExample1 enables front-running to misdirect escrow payout

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

ApiCallExample1 allows anyone to submit a plaintext API result for any escrow, setting the fulfillment recipient to the caller. If the selected oracle validates by content and exposes public arbitration triggers, a front-runner can copy the legitimate result, get their own fulfillment validated, and receive the ERC20 escrow payment.

In ApiCallExample1, submitApiResult is permissionless and passes through StringObligation.doObligation, which sets the fulfillment recipient to msg.sender via BaseObligation._doObligationForRaw. Multiple fulfillments can reference the same escrow (refUID). Payout is gated by TrustedOracleArbiter, which stores decisions per fulfillment UID and pays the fulfillment.recipient when checkObligation passes in collectEscrow. With a public, content-only oracle (e.g., the example ApiOracleValidator.autoValidate), anyone can trigger validation for any fulfillment UID that matches the content rules. Thus, an attacker can front-run a provider’s plaintext result, get the attacker’s fulfillment validated, and claim the escrowed tokens. If the oracle is an EOA or a restricted contract that enforces provider identity or private triggers, the attack is blocked. Because this is example code, final severity is informational by scope.

#### Severity

**Impact Explanation:** [Medium] Escrowed funds can be paid to an unintended recipient due to plaintext, permissionless submissions combined with content-only validation. While the buyer generally receives a validated result, the payout can be misdirected from the intended provider to a front-runner.

**Likelihood Explanation:** [Low] Exploitation depends on the buyer’s integration choice: using a public, content-only oracle or an oracle operator policy that ignores provider identity. These are configuration/operational conditions outside the attacker’s direct control.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Public, content-only oracle (ApiOracleValidator): Attacker front-runs a provider’s submitApiResult with identical (apiResult, escrowUid), becoming the fulfillment recipient. The attacker then calls the public autoValidate on the oracle contract to arbitrate their fulfillment UID as valid, and finally calls claimPayment to receive the ERC20 escrow.
#### Preconditions / Assumptions
- (a). Buyer selects TrustedOracleArbiter with a public, content-only oracle contract (e.g., ApiOracleValidator)
- (b). Escrow funded via ERC20EscrowObligation
- (c). Provider prepares and broadcasts submitApiResult with plaintext apiResult and escrowUid
- (d). Attacker can monitor mempool and front-run transactions

### Scenario 2.
EOA oracle with 'first-valid' policy: Attacker front-runs to create an earlier fulfillment. The oracle EOA validates the attacker’s UID (e.g., by policy or mistake), enabling the attacker to claim the escrowed tokens.
#### Preconditions / Assumptions
- (a). Buyer selects an EOA as oracle address
- (b). Oracle operator policy validates any correct content irrespective of provider identity (first valid wins)
- (c). Provider submits plaintext apiResult; attacker front-runs with identical data

### Scenario 3.
Both fulfillments validated; race to claim: Attacker front-runs and later both attacker and provider fulfillments are validated. Whoever calls claimPayment first (typically the attacker with better transaction priority) receives the escrow; the other cannot collect because the escrow attestation is revoked on first collection.
#### Preconditions / Assumptions
- (a). Buyer selects a public, content-only oracle
- (b). Both attacker and provider fulfillments are validated by the oracle
- (c). Either party can call claimPayment; first to claim is paid

#### Proposed fix

##### ApiCallExample1.sol

File: `contracts/src/obligations/example/ApiCallExample1.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/example/ApiCallExample1.sol)

```diff
 ... 97 unchanged lines ...
     }
 
+    // SECURITY: Example-only. For production, avoid plaintext StringObligation + TrustedOracleArbiter alone.
+    // Use CommitRevealObligation with AllArbiter (CommitReveal + TrustedOracleArbiter) to prevent front-running,
+    // or bind payout to a preselected provider via AllArbiter + RecipientArbiter + TrustedOracleArbiter.
+    // Also ensure the designated oracle contract does not expose public arbitration triggers.
     /**
      * @notice Step 2: Submit an API result using StringObligation
 ... 20 unchanged lines ...
     }
 
+    // NOTE: This helper reverts in TrustedOracleArbiter unless called by the escrow attester or recipient.
     /**
      * @notice Step 3: Request arbitration from the oracle
 ... 224 unchanged lines ...
```

##### ApiCallExample1.sol

File: `contracts/src/obligations/example/ApiCallExample1.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/example/ApiCallExample1.sol)

```diff
 ... 238 unchanged lines ...
     }
 
+    // SECURITY: Example-only. In production, restrict or remove public autoValidate; arbitrary callers
+    // must not be able to arbitrate fulfillments on behalf of the oracle.
     /**
      * @notice Automated validation based on simple rules
 ... 107 unchanged lines ...
```

#### Related findings

##### [Informational] Missing non-zero oracle validation in ApiCallExample1/2 causes uncollectable escrows and potential permanent fund lock

###### Description

ApiCallExample1 and ApiCallExample2 accept an oracle address without enforcing it is non-zero. With TrustedOracleArbiter decisions keyed to the designated oracle, using address(0) makes collectEscrow() permanently fail. If expirationTime is 0, funds are permanently locked; if > 0, funds are locked until expiry and only refundable to the buyer.

Both ApiCallExample1.createApiRequest and ApiCallExample2.createStructuredApiRequest encode the provided oracle into TrustedOracleArbiter.DemandData without requiring oracle != address(0). TrustedOracleArbiter.arbitrate() writes decisions to decisions[msg.sender], but checkObligation() reads decisions[demand_.oracle]; if oracle == address(0), no caller can ever write to decisions[address(0)], so checkObligation() always returns false. The example validation helpers also require msg.sender == demandData.oracle, which is impossible when oracle == address(0). As a result, ERC20EscrowObligation.collectEscrow() always reverts with InvalidFulfillment. If expirationTime == 0, reclaimExpired() is unavailable, causing a permanent funds lock; if expirationTime > 0, funds are locked until expiry and only then refundable to the buyer.

###### Severity

**Impact Explanation:** [High] With oracle = address(0) and expirationTime = 0, funds are frozen indefinitely with no workaround; with finite expiration, there is a significant temporary availability loss until expiry.

**Likelihood Explanation:** [Low] All scenarios rely on buyer/UI misconfiguration (oracle set to 0x0) and provide no attacker profit; the permanent lock case also requires expirationTime = 0, further reducing likelihood.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Permanent ERC-20 lock in ApiCallExample1: Buyer approves tokens and calls createApiRequest with oracle = 0x0 and expirationTime = 0. Tokens are escrowed. Provider submits fulfillment, but validation cannot occur and arbitrate() cannot set the decision under address(0). collectEscrow() always fails. reclaimExpired() is disallowed for non-expiring escrows, resulting in a permanent lock.
#### Preconditions / Assumptions
- (a). ApiCallExample1, ERC20EscrowObligation, and TrustedOracleArbiter are deployed and wired correctly
- (b). ERC-20 token behaves per standard assumptions
- (c). Buyer (victim) sets oracle = address(0) (directly or via a misconfigured/malicious UI)
- (d). Buyer sets expirationTime = 0 (never expires)

### Scenario 2.
Temporary lock until expiry in ApiCallExample1: Buyer uses oracle = 0x0 and a finite expirationTime. Fulfillment is submitted but cannot be validated; collectEscrow() fails. After expiration, buyer can call reclaimExpired() to recover funds, causing a denial-of-service to the payout until expiry.
#### Preconditions / Assumptions
- (a). ApiCallExample1, ERC20EscrowObligation, and TrustedOracleArbiter are deployed and wired correctly
- (b). ERC-20 token behaves per standard assumptions
- (c). Buyer (victim) sets oracle = address(0) (directly or via a misconfigured/malicious UI)
- (d). Buyer sets expirationTime > current time

### Scenario 3.
ApiCallExample2 structured flow variant: Buyer uses createStructuredApiRequest with oracle = 0x0 (expirationTime 0 or > 0). The same arbitration failure occurs; collectEscrow() fails. If expirationTime = 0, funds are permanently locked; otherwise, funds are locked until expiry and refundable to the buyer afterward.
#### Preconditions / Assumptions
- (a). ApiCallExample2, ERC20EscrowObligation, and TrustedOracleArbiter are deployed and wired correctly
- (b). ERC-20 token behaves per standard assumptions
- (c). Buyer (victim) sets oracle = address(0) (directly or via a misconfigured/malicious UI)
- (d). Buyer sets expirationTime = 0 for permanent lock, or > 0 for temporary lock

###### Proposed fix

####### ApiCallExample1.sol

File: `contracts/src/obligations/example/ApiCallExample1.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/example/ApiCallExample1.sol)

```diff
 ... 69 unchanged lines ...
         uint64 expirationTime
     ) external returns (bytes32 escrowUid) {
+        require(oracle != address(0), "oracle required");
         // Encode the API query as the inner demand data
         bytes memory innerDemand = abi.encode(apiQuery);
 ... 276 unchanged lines ...
```

####### ApiCallExample2.sol

File: `contracts/src/obligations/example/ApiCallExample2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/example/ApiCallExample2.sol)

```diff
 ... 100 unchanged lines ...
         require(bytes(query.method).length > 0, "Method required");
         require(query.timeout > 0, "Timeout required");
+        require(oracle != address(0), "oracle required");
 
         // Encode the structured query
 ... 250 unchanged lines ...
```

### 34. [Informational] External self-call in typed wrapper changes msg.sender in VoteEscrowObligation causes permanent DoS of typed helper

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

The typed helper doObligation(ObligationData,uint64) performs an external self-call, making msg.sender = address(this) in the callee. Since _lockEscrow keys activeEscrow by msg.sender, a malicious votingContract can fake delegation for address(this), create a non-expiring escrow, and ensure release always reverts. This permanently sets activeEscrow[address(this)], bricking the typed helper for all users. The bytes-based entrypoint remains functional.

VoteEscrowObligation’s typed helper doObligation(ObligationData,uint64) calls this.doObligation(encodedData, expirationTime). This external self-call changes msg.sender to the contract address for the downstream call path, so in _lockEscrow the payer "from" equals address(this). The code first checks if activeEscrow[from] is already set, then calls votingContract.delegates(from) and requires the returned delegate to equal address(this). A malicious votingContract can always return address(this), causing escrow creation for from = address(this). The contract then sets activeEscrow[address(this)] and mints a non-expiring attestation if expirationTime == 0. During collection, _releaseEscrow calls votingContract.hasVoted and castVoteWithReason. If the malicious votingContract makes castVoteWithReason revert, collectEscrowRaw reverts entirely, undoing the prior revoke and leaving the escrow and activeEscrow[address(this)] intact. Because reclaimExpired forbids reclaim when expirationTime == 0, activeEscrow[address(this)] cannot be cleared, permanently bricking the typed helper. The bytes-based doObligation(bytes,uint64) path is unaffected since it keys activeEscrow by the true external caller, not address(this).

#### Severity

**Impact Explanation:** [Low] Availability loss is limited to the typed helper interface; the bytes-based method remains fully functional, and no funds or core invariants are at risk.

**Likelihood Explanation:** [Low] The attack is pure griefing with no profit motive; although trivial to execute, per the rules griefing maps to low likelihood and takes precedence.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Permanent global DoS: An attacker deploys a malicious IVotingContract that returns the escrow contract address from delegates(address) and reverts in castVoteWithReason. They call the typed helper with expirationTime = 0, creating a non-expiring escrow for address(this). This sets activeEscrow[address(this)] permanently. All future typed-helper calls by any user revert with VoterHasActiveEscrow, while the bytes-based method still works.
#### Preconditions / Assumptions
- (a). VoteEscrowObligation is deployed and activeEscrow[address(this)] == 0
- (b). The typed helper doObligation(ObligationData,uint64) is exposed and used
- (c). Attacker deploys a malicious IVotingContract where delegates(address) returns address(VoteEscrowObligation), hasVoted returns false, and castVoteWithReason reverts
- (d). Attacker calls the typed helper with votingContract set to the malicious contract and expirationTime = 0

### Scenario 2.
Time-bounded global DoS: Same setup as above but with a finite expirationTime. The typed helper is bricked for the duration until expiration, after which reclaimExpired clears activeEscrow[address(this)] and restores availability.
#### Preconditions / Assumptions
- (a). VoteEscrowObligation is deployed and activeEscrow[address(this)] == 0
- (b). The typed helper doObligation(ObligationData,uint64) is exposed and used
- (c). Attacker deploys a malicious IVotingContract where delegates(address) returns address(VoteEscrowObligation), hasVoted returns false, and castVoteWithReason reverts
- (d). Attacker calls the typed helper with votingContract set to the malicious contract and a finite expirationTime > 0

#### Proposed fix

##### VoteEscrowObligation.sol

File: `contracts/src/obligations/example/VoteEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/example/VoteEscrowObligation.sol)

```diff
 ... 313 unchanged lines ...
     ) external returns (bytes32 uid) {
         bytes memory encodedData = encodeObligationData(obligationData);
-        // Call this contract's doObligation(bytes, uint64) externally to convert memory to calldata
-        uid = this.doObligation(encodedData, expirationTime);
+        uid = _doObligationForRaw(
+            encodedData, expirationTime, msg.sender, bytes32(0)
+        );
+        attestationToDataHash[uid] = keccak256(encodedData);
         return uid;
     }
 ... 48 unchanged lines ...
```

#### Related findings

##### [Informational] Missing support range-check in VoteEscrowObligation with non-expiring escrows causes permanent inability to collect and create new escrows

###### Description

VoteEscrowObligation forwards an unvalidated support value to castVoteWithReason. On OZ Governor-like voting contracts, invalid values revert, causing collectEscrowRaw to revert atomically after attempting revocation. With expirationTime == 0, the escrow remains active and activeEscrow[voter] stays set indefinitely, preventing the user from creating another vote escrow via this contract. Voting power itself is not locked; users can redelegate directly on the voting contract.

In VoteEscrowObligation._releaseEscrow, obligation.support is passed to votingContract.castVoteWithReason without checking that it is in {0,1,2}. On OZ Governor-like contracts, invalid support values revert. BaseEscrowObligation.collectEscrowRaw first revokes the EAS attestation and then calls _releaseEscrow. If castVoteWithReason reverts, the transaction reverts in full, undoing the revoke. Because activeEscrow[voter] is only cleared after a successful vote cast or via reclaimExpired (which is disallowed when expirationTime == 0), a non-expiring escrow with invalid support becomes uncollectable and leaves activeEscrow[voter] permanently set. This blocks the user from creating another vote escrow via this contract. No funds are lost, and the user’s voting power can still be redelegated directly on the voting contract.

###### Severity

**Impact Explanation:** [Medium] For affected users, the escrow module’s functionality (collecting and opening new escrows) is unavailable indefinitely when non-expiring escrows are created with invalid support. No funds are lost, but the availability loss is significant within this module.

**Likelihood Explanation:** [Medium] OZ Governor-like voting contracts are common. The issue requires an integration/frontend to encode invalid support (and often non-expiring escrows), which is plausible via bugs or malicious UIs.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
A user creates a non-expiring vote escrow with support=3 (invalid) on an OZ Governor-like voting contract. When anyone calls collectEscrowRaw after the arbiter approves, castVoteWithReason reverts. The transaction reverts atomically, leaving the attestation and activeEscrow set. The user cannot create another vote escrow via this contract.
#### Preconditions / Assumptions
- (a). Voting contract is OZ Governor-like and reverts for support values outside {0,1,2}
- (b). User has delegated voting power to the VoteEscrowObligation contract
- (c). Integration/frontend encodes an invalid support value (e.g., 3)
- (d). Escrow attestation is created with expirationTime == 0 (non-expiring)
- (e). Arbiter provides a fulfillment indicating the obligation is satisfied
- (f). Someone calls collectEscrowRaw to collect the escrow

### Scenario 2.
A malicious or buggy frontend encodes support=3 and expirationTime=0 for many users. Each user creates a vote escrow. Later, collection attempts revert due to invalid support, leaving every affected user with an activeEscrow set and unable to create new vote escrows via this contract.
#### Preconditions / Assumptions
- (a). Voting contract is OZ Governor-like and reverts for invalid support
- (b). Multiple users delegate to the VoteEscrowObligation contract
- (c). A malicious or buggy frontend encodes invalid support and expirationTime == 0 for all users
- (d). Collection attempts are made for each escrow

### Scenario 3.
A user’s non-expiring escrow with invalid support repeatedly receives arbiter approvals. Each collectEscrowRaw attempt reverts on castVoteWithReason, so the attestation remains and activeEscrow is never cleared, keeping the escrow uncollectable and blocking further escrows for that user.
#### Preconditions / Assumptions
- (a). Voting contract is OZ Governor-like and reverts for invalid support
- (b). User has delegated to the VoteEscrowObligation contract
- (c). Escrow attestation is created with invalid support and expirationTime == 0
- (d). Arbiter repeatedly approves fulfillment and multiple collectEscrowRaw attempts are made

###### Proposed fix

####### VoteEscrowObligation.sol

File: `contracts/src/obligations/example/VoteEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/example/VoteEscrowObligation.sol)

```diff
 ... 134 unchanged lines ...
     function _lockEscrow(bytes memory data, address from) internal override {
         ObligationData memory obligation = decodeObligationData(data);
+        require(obligation.support <= 2, "Invalid support");
 
         // Check if voter already has an active escrow
 ... 44 unchanged lines ...
     ) internal override returns (bytes memory result) {
         ObligationData memory obligation = decodeObligationData(escrowData);
+        require(obligation.support <= 2, "Invalid support");
 
         // Get the data hash for this escrow
 ... 181 unchanged lines ...
```

##### [Informational] Unchecked external calls in VoteEscrowObligation._releaseEscrow cause indefinite activeEscrow lock on non-expiring escrows

###### Description

VoteEscrowObligation._releaseEscrow calls hasVoted and castVoteWithReason on a user-specified votingContract without try/catch; if either call reverts, collection reverts and activeEscrow is not cleared. With expirationTime = 0, reclaimExpired cannot clear the state, preventing creation of another escrow via this contract, though voting power remains unaffected.

In VoteEscrowObligation._releaseEscrow, the contract makes two external calls to a user-specified votingContract: hasVoted and castVoteWithReason. These calls are not wrapped in try/catch. BaseEscrowObligation.collectEscrowRaw first attempts to revoke the attestation, then calls _releaseEscrow; if _releaseEscrow reverts due to either external call, the entire transaction reverts, rolling back the revoke and leaving the attestation active. Because activeEscrow is only cleared upon successful castVoteWithReason or in _returnEscrow (reachable via reclaimExpired), any escrow created with expirationTime = 0 cannot be reclaimed and thus leaves activeEscrow set indefinitely. This blocks creating a new escrow in this example contract for that voter. The user’s voting power is not locked, as they can re-delegate directly at the voting contract; the impact is a contract-specific availability/UX DoS.

###### Severity

**Impact Explanation:** [Low] No user funds or voting power are locked; the effect is a contract-local availability/UX DoS preventing creation of another escrow via this example contract for the same address.

**Likelihood Explanation:** [Low] The scenarios primarily rely on operator timing or precondition mistakes (attempting collection outside the active window or after proposal state changes), which competent operators can mitigate by checking state before collecting.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Collection attempted when the Governor proposal is not in the Active state (e.g., before voting starts or after it ends) causes castVoteWithReason to revert; the transaction rolls back, the attestation stays active, and activeEscrow remains set indefinitely for non-expiring escrows, preventing new escrows via this contract.
#### Preconditions / Assumptions
- (a). The escrow attestation was created with expirationTime = 0 (non-expiring).
- (b). The votingContract is a correct Governor that reverts castVoteWithReason outside the Active voting window.
- (c). Arbiter validation passes and collectEscrowRaw reaches _releaseEscrow.
- (d). Collection is attempted when the proposal is not Active.

### Scenario 2.
Collection attempted after the Governor proposal is canceled or executed causes castVoteWithReason to revert; the transaction rolls back, the attestation remains active, and activeEscrow stays set indefinitely for non-expiring escrows, blocking creation of another escrow via this contract.
#### Preconditions / Assumptions
- (a). The escrow attestation was created with expirationTime = 0 (non-expiring).
- (b). The votingContract is a correct Governor that reverts castVoteWithReason after cancellation or execution.
- (c). Arbiter validation passes and collectEscrowRaw reaches _releaseEscrow.
- (d). The proposal is canceled or executed before collection is attempted.

###### Proposed fix

####### VoteEscrowObligation.sol

File: `contracts/src/obligations/example/VoteEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/example/VoteEscrowObligation.sol)

```diff
 ... 135 unchanged lines ...
         ObligationData memory obligation = decodeObligationData(data);
 
+        require(obligation.votingContract.code.length > 0, "votingContract has no code");
+
         // Check if voter already has an active escrow
         if (activeEscrow[from] != bytes32(0)) {
 ... 158 unchanged lines ...
         uint64 expirationTime
     ) external returns (bytes32 uid) {
+        require(expirationTime > uint64(block.timestamp), "expiration must be in the future");
         uid = doObligationRaw(data, expirationTime, bytes32(0));
         // Store mapping from attestation UID to data hash
 ... 66 unchanged lines ...
```

##### [Informational] Global dataHash without voter in VoteEscrowObligation causes cross-user state collision and permanent DoS

###### Description

VoteEscrowObligation indexes escrow state by keccak256(data) that omits the voter, so different users with identical data share the same storage slot. A malicious user can overwrite and later delete this shared slot, leaving victims’ activeEscrow set to a now-orphaned dataHash, preventing collection, reclaim, or creation of new escrows.

VoteEscrowObligation computes dataHash = keccak256(data) where data = abi.encode(votingContract, proposalId, support, arbiter, demand), which excludes the voter address. In _lockEscrow, it writes escrowedVoter[dataHash] = from, escrowedData[dataHash] = obligation, and activeEscrow[from] = dataHash. Because dataHash is global across all users who use the same data, a second user can overwrite escrowedVoter[dataHash]. On collection, _releaseEscrow uses escrowedVoter[dataHash] to derive the voter and clears activeEscrow[voter], potentially clearing the wrong user. On expiration reclaim, _returnEscrow deletes escrowedVoter[dataHash], escrowedData[dataHash], previousDelegate[dataHash], and activeEscrow[to] only if escrowedVoter[dataHash] != 0; if another user has already deleted or overwritten the slot, the victim’s activeEscrow[to] is never cleared. This leads to cross-user overwrites and deletions that can permanently strand victims with activeEscrow != 0 but no corresponding escrowedVoter/escrowedData, blocking collection, reclaim, and new escrows.

###### Severity

**Impact Explanation:** [Medium] No funds are at risk, but affected users suffer persistent denial-of-service of escrow lifecycle operations (collect, reclaim, and new escrow creation) due to stranded activeEscrow and deleted shared state.

**Likelihood Explanation:** [Medium] Requires identical data across users (plausible with templated UI or simple/empty demand) and simple attacker actions (delegation, creating a short-expiry escrow, or collecting with a permissive arbiter).

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Attacker observes a victim’s escrow data D, creates an identical escrow to overwrite escrowedVoter[H(D)], then after a short expiration calls reclaimExpired to delete the shared slot. The victim’s activeEscrow remains set to H(D) while escrowedVoter/escrowedData are gone, causing NoActiveEscrow on collection and preventing reclaim from clearing activeEscrow, permanently blocking new escrows.
#### Preconditions / Assumptions
- (a). A victim has an active escrow with data D = (votingContract, proposalId, support, arbiter, demand) and expirationTime > 0
- (b). The victim’s attestation data is publicly retrievable via EAS and exactly reproducible
- (c). The attacker can delegate to the same votingContract (delegates(attacker) == address(this))
- (d). The attacker can create an identical escrow with a short expiration and later call reclaimExpired as per BaseEscrowObligation and EAS behavior

### Scenario 2.
Victim uses an arbiter the attacker can satisfy (e.g., TrivialArbiter). Attacker overwrites escrowedVoter[H(D)] and then collects the victim’s escrow by submitting a fulfillment. _releaseEscrow uses the overwritten escrowedVoter, clears activeEscrow for the attacker instead of the victim, leaving the victim stuck with activeEscrow != 0 and unable to create new escrows.
#### Preconditions / Assumptions
- (a). The victim intentionally chooses an arbiter whose checkObligation can be satisfied by the attacker (e.g., TrivialArbiter or similarly permissive conditions)
- (b). The attacker can retrieve and reproduce the victim’s data D
- (c). The attacker can overwrite escrowedVoter[H(D)] by creating an identical escrow
- (d). The attacker can submit a fulfillment referencing the victim’s escrow UID and call collectEscrowRaw successfully

### Scenario 3.
Many users independently create escrows with identical data D (e.g., templated UI). Attacker creates an identical escrow with a short expiration and calls reclaimExpired, deleting the shared slot. All users with activeEscrow[user] = H(D) are now stranded: collections revert NoActiveEscrow and reclaims won’t clear activeEscrow, blocking future escrows.
#### Preconditions / Assumptions
- (a). Many users independently create escrows with identical data D (e.g., same votingContract, proposalId, support, arbiter, and demand from a common template)
- (b). The attacker can create an identical escrow with a short expiration and later call reclaimExpired to delete the shared slot

### 35. [Informational] Caller-controlled vote authorization in MajorityVoteArbiter enables arbitrary vote inflation causing unauthorized escrow release

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

MajorityVoteArbiter authorizes votes using demand data supplied by the voter in castVote instead of the escrow-defined demand, while checkObligation compares accumulated yesVotes to the escrow’s quorum without verifying that the voters are those sanctioned by the escrow. Anyone can inflate yesVotes for a fulfillment UID using unlimited EOAs and pass checkObligation, causing escrowed assets to be released.

In MajorityVoteArbiter, castVote decodes DemandData from the caller-provided demandData and treats any msg.sender included in that user-supplied voters[] as authorized, incrementing yesVotes in voteStatuses[obligationUID]. There is no on-chain binding between an obligation UID and its voters/quorum. Later, checkObligation decodes quorum from the escrow’s demand but only checks whether status.yesVotes >= quorum, without ensuring that the yes votes came from the escrow’s specified voters. requestArbitration merely emits an event and does not persist voters/quorum. As a result, an attacker can create a fulfillment attestation and fabricate yesVotes for its UID via arbitrary EOAs, then when BaseEscrowObligation/BaseEscrowObligationTierable calls checkObligation during collectEscrowRaw, the check passes and escrowed assets are released to the fulfillment.recipient controlled by the attacker. Tierable escrows exacerbate the impact by allowing a single fulfillment to claim multiple escrows.

#### Severity

**Impact Explanation:** [High] Exploitation results in direct, material loss of principal funds (ERC20 or ETH) by unauthorized release of escrows; in tierable setups, a single fulfillment can drain multiple escrows.

**Likelihood Explanation:** [High] No special constraints are required: the attacker can create a fulfillment, generate unlimited EOAs, call castVote with self-authored demandData to inflate yesVotes, and call collectEscrow. The incentives are clear and profitable.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Non-tierable ERC20 escrow theft: A buyer creates an ERC20EscrowObligation with arbiter=MajorityVoteArbiter and a voters/quorum in demand, funding tokens. The attacker creates a fulfillment attestation with recipient=attacker and refUID=the escrow UID. The attacker then calls castVote for that fulfillment UID from many fresh EOAs, each supplying demandData that includes only its own address in voters[], inflating yesVotes. When yesVotes >= the escrow’s quorum, the attacker calls collectEscrow; checkObligation returns true and tokens are released to the attacker.
#### Preconditions / Assumptions
- (a). A non-tierable ERC20EscrowObligation is used with arbiter set to MajorityVoteArbiter and a voters/quorum encoded in the escrow’s demand.
- (b). The escrow is funded with ERC20 tokens.
- (c). The attacker can create a fulfillment attestation referencing the escrow UID (refUID=escrow UID), not expired or revoked.
- (d). The attacker can create unlimited EOAs and call castVote with arbitrary demandData.

### Scenario 2.
Tierable ERC20 mass-drain with one fulfillment: Multiple buyers create tierable ERC20EscrowObligation escrows, each with arbiter=MajorityVoteArbiter and various voters/quorums, and fund them. The attacker creates a single fulfillment attestation (no refUID needed) and inflates yesVotes for its UID via many EOAs using self-authored demandData. For each escrow, the attacker calls collectEscrow; checkObligation compares the high yesVotes to that escrow’s quorum and passes, releasing each escrow’s tokens to the attacker.
#### Preconditions / Assumptions
- (a). Multiple tierable ERC20EscrowObligation escrows exist with arbiter set to MajorityVoteArbiter and voters/quorums in their demands.
- (b). Each escrow is funded with ERC20 tokens.
- (c). Tierable behavior allows a single fulfillment to claim multiple escrows (no refUID match required).
- (d). The attacker can create a single fulfillment attestation (not expired or revoked) and inflate yesVotes for its UID using many EOAs and arbitrary demandData.

### Scenario 3.
Non-tierable native ETH escrow theft: A buyer creates a NativeTokenEscrowObligation with arbiter=MajorityVoteArbiter and a voters/quorum in demand, and funds ETH. The attacker creates a fulfillment attestation with recipient=attacker and refUID=the escrow UID, inflates yesVotes via many EOAs with self-authored demandData, then calls collectEscrow; checkObligation passes and ETH is transferred to the attacker.
#### Preconditions / Assumptions
- (a). A non-tierable NativeTokenEscrowObligation is used with arbiter set to MajorityVoteArbiter and a voters/quorum encoded in the escrow’s demand.
- (b). The escrow is funded with ETH.
- (c). The attacker can create a fulfillment attestation with refUID equal to the escrow UID (not expired or revoked).
- (d). The attacker can create unlimited EOAs and call castVote with arbitrary demandData.

#### Proposed fix

##### MajorityVoteArbiter.sol

File: `contracts/src/arbiters/example/MajorityVoteArbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/example/MajorityVoteArbiter.sol)

```diff
 ... 61 unchanged lines ...
 
     IEAS public immutable eas;
-    mapping(bytes32 => VoteStatus) public voteStatuses;
+    mapping(bytes32 => mapping(bytes32 => VoteStatus)) public voteStatuses;
 
     constructor(IEAS _eas) {
 ... 24 unchanged lines ...
         if (!isAuthorized) revert UnauthorizedVoter();
 
-        VoteStatus storage status = voteStatuses[obligation];
+        VoteStatus storage status = voteStatuses[obligation][keccak256(demandData)];
 
         // Check if voter has already voted
 ... 87 unchanged lines ...
         }
 
-        VoteStatus storage status = voteStatuses[obligation.uid];
+        VoteStatus storage status = voteStatuses[obligation.uid][keccak256(demand)];
 
         // Check if quorum has been reached with yes votes
         return status.yesVotes >= demandData.quorum;
     }
 
     /**
      * @notice Get the current vote count for an obligation
      * @param obligation The UID of the obligation
      * @return yesVotes Number of yes votes
      * @return noVotes Number of no votes
      */
     function getVoteCount(
-        bytes32 obligation
+        bytes32 obligation,
+        bytes calldata demandData
     ) external view returns (uint256 yesVotes, uint256 noVotes) {
-        VoteStatus storage status = voteStatuses[obligation];
+        VoteStatus storage status = voteStatuses[obligation][keccak256(demandData)];
         return (status.yesVotes, status.noVotes);
     }
 
     /**
      * @notice Check if a voter has voted for an obligation
      * @param obligation The UID of the obligation
      * @param voter The address to check
      * @return hasVoted True if the voter has cast a vote
      * @return vote The vote value (only valid if hasVoted is true)
      */
     function getVoterStatus(
         bytes32 obligation,
+        bytes calldata demandData,
         address voter
     ) external view returns (bool hasVoted, bool vote) {
-        VoteStatus storage status = voteStatuses[obligation];
+        VoteStatus storage status = voteStatuses[obligation][keccak256(demandData)];
         return (status.hasVoted[voter], status.vote[voter]);
     }
 ... 22 unchanged lines ...
     ) external view returns (bool complete, bool approved) {
         DemandData memory demand = abi.decode(demandData, (DemandData));
-        VoteStatus storage status = voteStatuses[obligation];
+        VoteStatus storage status = voteStatuses[obligation][keccak256(demandData)];
 
         if (status.yesVotes >= demand.quorum) {
             return (true, true);
         }
 
         if (status.noVotes > demand.voters.length - demand.quorum) {
             return (true, false);
         }
 
         return (false, false);
     }
 }
```

#### Related findings

##### [Informational] Unchecked subtraction in MajorityVoteArbiter.castVote/isVotingComplete causes reverts and integration/UI DoS

###### Description

MajorityVoteArbiter computes demand.voters.length - demand.quorum without validating quorum ≤ voters.length, causing underflow and revert on malformed demandData in castVote and isVotingComplete.

In contracts/src/arbiters/example/MajorityVoteArbiter.sol, both castVote and isVotingComplete evaluate demand.voters.length - demand.quorum without ensuring quorum ≤ voters.length. With Solidity ≥0.8, quorum > voters.length underflows and reverts. requestArbitration validates inputs but stores nothing; castVote/isVotingComplete rely on caller-supplied demandData and can still receive malformed input. IArbiter.checkObligation in this arbiter validates quorum and voters length and safely returns false on invalid input (no underflow). The revert in castVote rolls back all state/logs, so there is no persistent protocol-wide DoS; however, integrations that forward unvalidated demandData can suffer gas loss on reverts, and UIs calling isVotingComplete may encounter read-path failures. This contract is an example component; overall severity is informational.

###### Severity

**Impact Explanation:** [Medium] Relayers/automation operators can incur direct, material fee loss (gas) on reverting transactions; UIs can experience read-path disruption. No protocol/user funds are at risk and no persistent state is corrupted.

**Likelihood Explanation:** [Low] Exploitation requires external integrations (relayers/UIs/automation) to forward malformed, attacker-supplied demandData without validation; there are no special on-chain prerequisites.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Relayer/subsidy gas griefing: an attacker supplies demandData with quorum > voters.length (including their EOA in voters) to a relayer that forwards castVote; the call reverts post-increment due to underflow, consuming relayer gas; repeated attempts drain budget and degrade service.
#### Preconditions / Assumptions
- (a). A relayer or gas-subsidy service forwards user-supplied demandData to MajorityVoteArbiter.castVote without validating quorum ≤ voters.length
- (b). Attacker crafts demandData with voters containing their EOA and quorum > voters.length
- (c). Relayer submits transactions on behalf of users

### Scenario 2.
UI/indexer read-path DoS: a UI or indexer calls isVotingComplete with attacker-supplied demandData where quorum > voters.length; the view call reverts due to underflow, causing status fetch failures or crashes until input is corrected.
#### Preconditions / Assumptions
- (a). A UI or indexer invokes isVotingComplete using demandData sourced from untrusted user input or shareable links
- (b). The UI does not sanitize or bound-check quorum relative to voters.length

### Scenario 3.
Automation retry griefing: an automation bot forwards user-supplied demandData to castVote and retries on revert; attacker provides quorum > voters.length; repeated reverts waste operator gas/time and delay legitimate automation.
#### Preconditions / Assumptions
- (a). An automation bot forwards user-supplied demandData to castVote and retries on revert without validation
- (b). Attacker provides demandData with quorum > voters.length including the requester EOA in voters

###### Proposed fix

####### MajorityVoteArbiter.sol

File: `contracts/src/arbiters/example/MajorityVoteArbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/example/MajorityVoteArbiter.sol)

```diff
 ... 79 unchanged lines ...
     ) external {
         DemandData memory demand = abi.decode(demandData, (DemandData));
+        if (demand.voters.length == 0) revert NoVoters();
+        if (demand.quorum == 0 || demand.quorum > demand.voters.length) revert InvalidQuorum();
 
         // Check if sender is an authorized voter
 ... 38 unchanged lines ...
                 status.noVotes
             );
-        } else if (status.noVotes > demand.voters.length - demand.quorum) {
+        } else if (status.noVotes + demand.quorum > demand.voters.length) {
             // If no votes exceed the number that would prevent reaching quorum
             emit ArbitrationComplete(
 ... 114 unchanged lines ...
         DemandData memory demand = abi.decode(demandData, (DemandData));
         VoteStatus storage status = voteStatuses[obligation];
+        if (demand.voters.length == 0 || demand.quorum == 0 || demand.quorum > demand.voters.length) return (false, false);
 
         if (status.yesVotes >= demand.quorum) {
             return (true, true);
         }
 
-        if (status.noVotes > demand.voters.length - demand.quorum) {
+        if (status.noVotes + demand.quorum > demand.voters.length) {
             return (true, false);
         }
 
         return (false, false);
     }
 }
```

### 36. [Informational] Per-slot ERC20 permit/approve overwrites in TokenBundleBarterUtils with duplicate tokens causes helper-call revert (DoS)

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

TokenBundleBarterUtils applies permit and approve per array slot, so for duplicate ERC20 addresses the final allowance equals only the last entry’s amount. Subsequent transferFrom calls run out of allowance mid-bundle and revert, preventing helper-based flows from working with duplicate ERC20s.

In TokenBundleBarterUtils, both EIP-2612 permits (owner->TokenBundleBarterUtils) and ERC20 approvals (TokenBundleBarterUtils->obligation) are applied per-slot for each entry in erc20Tokens/erc20Amounts. Since ERC-20 approve/permit overwrite, when the same token address appears multiple times with non-zero amounts, only the last duplicate’s amount remains as the final allowance for that token. The utility then processes transfers sequentially for each slot; earlier transfers consume or exceed the single remaining allowance, and a later duplicate transfer fails due to insufficient allowance. Obligations use SafeERC20 and balance delta checks, so insufficient allowances cause a full revert. No uniqueness constraint or aggregation of per-token amounts exists in the helper or data validation, so helper-based calls that include duplicate ERC20 addresses revert. Underlying obligation contracts remain functional if called directly with sufficient allowances.

#### Severity

**Impact Explanation:** [Low] Revert-only helper failure with immediate workarounds (avoid duplicates or interact directly with obligations); no funds lost or frozen and core obligation functionality remains intact.

**Likelihood Explanation:** [Low] Primarily a griefing vector (no attacker profit) or user-facing UX failure; requires either an attacker to craft duplicate-token demands or a user/integration to pass duplicates; straightforward to avoid by bypassing the helper.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Attacker crafts a bundle-for-bundle escrow whose demand repeats the same ERC20 token address with non-zero amounts (e.g., [T, T] with [10, 1]). The seller calls TokenBundleBarterUtils.permitAndPayBundleForBundle with one permit per slot as required. The later permit overwrites allowance to 1; _pullPaymentBundleTokens then attempts to transfer 10 first and reverts due to insufficient allowance, causing the seller’s transaction to revert (DoS).
#### Preconditions / Assumptions
- (a). Demand bundle includes duplicate ERC20 token addresses with non-zero amounts
- (b). Seller uses TokenBundleBarterUtils.permitAndPayBundleForBundle
- (c). Tokens follow standard ERC-20 and EIP-2612 semantics (permit sets allowance; approve overwrites)
- (d). No weird/rebasing/fee-on-transfer behavior

### Scenario 2.
Attacker crafts a bundle-for-bundle escrow with duplicate ERC20 entries. The seller uses TokenBundleBarterUtils.payBundleForBundle (non-permit). Pulling from the seller to the utility succeeds (seller pre-approved sufficiently), but _approvePaymentBundleTokens overwrites the allowance to the obligation to only the last duplicate’s amount. During doObligationFor, TokenBundlePaymentObligation.transferBundle tries to transfer the earlier duplicate amount and reverts on insufficient allowance, causing the transaction to revert.
#### Preconditions / Assumptions
- (a). Demand bundle includes duplicate ERC20 token addresses with non-zero amounts
- (b). Seller uses TokenBundleBarterUtils.payBundleForBundle (non-permit path)
- (c). Seller has granted sufficient allowance to TokenBundleBarterUtils to pull the total amounts
- (d). Tokens follow standard ERC-20 semantics; approve overwrites

### Scenario 3.
A user mistakenly includes duplicate ERC20 addresses with non-zero amounts when calling TokenBundleBarterUtils.permitAndEscrowBundle or permitAndPayBundle. The per-slot permit overwrites the allowance to the last duplicate’s amount; the first duplicate transferFrom exceeds this allowance, causing the helper call to revert and waste gas.
#### Preconditions / Assumptions
- (a). Caller uses TokenBundleBarterUtils.permitAndEscrowBundle or permitAndPayBundle
- (b). Input bundle includes duplicate ERC20 token addresses with non-zero amounts
- (c). Tokens follow standard ERC-20 and EIP-2612 semantics; permit sets allowance (not additive)

#### Proposed fix

##### TokenBundleBarterUtils.sol

File: `contracts/src/utils/barter/TokenBundleBarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/TokenBundleBarterUtils.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {Attestation} from "@eas/Common.sol";
 import {IEAS} from "@eas/IEAS.sol";
 import {TokenBundleEscrowObligation} from "../../obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol";
 import {TokenBundlePaymentObligation} from "../../obligations/payment/TokenBundlePaymentObligation.sol";
 import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
 import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
 import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
 import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
 import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
 
 contract TokenBundleBarterUtils is IERC1155Receiver {
     IEAS internal eas;
     TokenBundleEscrowObligation internal bundleEscrow;
     TokenBundlePaymentObligation internal bundlePayment;
 
     error CouldntCollectEscrow();
     error InvalidSignatureLength();
+    error DuplicateERC20Token();
 
     struct ERC20PermitSignature {
 ... 216 unchanged lines ...
         TokenBundleEscrowObligation.ObligationData memory data
     ) internal {
+        for (uint i = 0; i < data.erc20Tokens.length; i++) for (uint j = i + 1; j < data.erc20Tokens.length; j++) if (data.erc20Tokens[i] == data.erc20Tokens[j]) revert DuplicateERC20Token();
         // Pull ERC20 tokens
         for (uint i = 0; i < data.erc20Tokens.length; i++) {
 ... 30 unchanged lines ...
         TokenBundlePaymentObligation.ObligationData memory data
     ) internal {
+        for (uint i = 0; i < data.erc20Tokens.length; i++) for (uint j = i + 1; j < data.erc20Tokens.length; j++) if (data.erc20Tokens[i] == data.erc20Tokens[j]) revert DuplicateERC20Token();
         // Pull ERC20 tokens
         for (uint i = 0; i < data.erc20Tokens.length; i++) {
 ... 112 unchanged lines ...
```

## Warnings

### 1. [Medium] Using mutable global bondAmount at payout time in CommitRevealObligation causes under/overpayment and refund/slash DoS

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

CommitRevealObligation refunds and slashes using the current global bondAmount instead of the per-commit deposited amount. If the owner changes bondAmount after users commit, existing commitments can be underpaid, overpaid, or face refund/slash failures.

In CommitRevealObligation, commit() enforces msg.value == bondAmount at the time of commit but does not store the deposited amount in CommitInfo. The owner can later change bondAmount via setBondAmount(). Both reclaimBond() and slashBond() compute the payout as the current bondAmount at the time of the call, not the amount originally deposited for that commitment. As a result, decreasing bondAmount after users have committed leads to underpayment on refund/slash with the remainder trapped in the contract; increasing bondAmount can overpay early claimers/recipients and deplete funds, causing later refunds or slashes to fail. There is no per-commit accounting or guard to restrict bondAmount changes to times with no outstanding commitments, and no owner withdrawal/rescue path for stranded surplus. The documentation implying a fixed, reclaimable bond per commit is inconsistent with this behavior.

#### Severity

**Impact Explanation:** [High] Scenarios include direct, material loss of principal funds for users (receiving less than deposited on refund, or being unable to reclaim due to earlier overpayments/insolvency).

**Likelihood Explanation:** [Low] All harmful scenarios require a trusted owner/admin to change bondAmount while outstanding commitments exist; under the trust assumptions, such mis-sequencing is unlikely though plausible.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Underpayment on refund: Users commit with a higher bondAmount (e.g., 1 ETH), the owner later decreases bondAmount (e.g., to 0.5 ETH), and when users reveal and call reclaimBond(), they receive only the new, smaller bondAmount, losing part of their original deposit with no recovery path.
#### Preconditions / Assumptions
- (a). There are outstanding commitments created with a higher bondAmount X.
- (b). The owner decreases bondAmount to a lower value Y < X before those commitments are revealed.
- (c). A committer successfully reveals and calls reclaimBond() after the decrease.

### Scenario 2.
Overpayment on refund leading to later principal loss: Users commit at bondAmount X, the owner increases bondAmount to Y > X, and early reclaimers receive Y (overpayment) funded by the contract balance, depleting shared funds so that later reclaimers cannot recover their original deposits.
#### Preconditions / Assumptions
- (a). There are outstanding commitments created with bondAmount X.
- (b). The owner increases bondAmount to Y > X before those commitments are revealed.
- (c). The contract balance at some reclaim times is sufficient to pay Y to early reclaimers, causing overpayment and depletion.
- (d). Later reclaimers attempt to reclaim after depletion when the contract balance is insufficient to cover even their original deposits.

### Scenario 3.
Overpayment on slashing leading to later principal loss: A user commits at bondAmount X, the owner increases bondAmount to Y > X, the user misses the deadline, and slashBond() pays Y to the recipient, depleting shared funds and causing later reclaimers or slashes to fail, resulting in principal loss for other users.
#### Preconditions / Assumptions
- (a). A user commits at bondAmount X and misses the commitDeadline (slashable).
- (b). The owner increases bondAmount to Y > X after the commit and before slashing.
- (c). The contract balance is sufficient to pay Y to the slashedBondRecipient, causing overpayment and depletion.
- (d). Later reclaimers or slashes occur when the contract balance is insufficient to honor original deposits, causing principal loss.

#### Proposed fix

##### CommitRevealObligation.sol

File: `contracts/src/obligations/CommitRevealObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/CommitRevealObligation.sol)

```diff
 ... 28 unchanged lines ...
         uint64 commitTimestamp;
         address committer;
+        uint256 amount; // bond amount deposited at commit time
     }
 
 ... 85 unchanged lines ...
             commitBlock: uint64(block.number),
             commitTimestamp: uint64(block.timestamp),
-            committer: msg.sender
+            committer: msg.sender,
+            amount: msg.value
         });
 
 ... 60 unchanged lines ...
         if (commitmentClaimed[revealedCommitment]) revert BondAlreadyClaimed(revealedCommitment);
 
-        amount = bondAmount;
+        amount = info.amount;
 
         commitmentClaimed[revealedCommitment] = true;
 ... 19 unchanged lines ...
         if (commitmentClaimed[commitment]) revert BondAlreadyClaimed(commitment);
 
-        amount = bondAmount;
+        amount = info.amount;
         commitmentClaimed[commitment] = true;
 
 ... 19 unchanged lines ...
```

#### Related findings

##### [Medium] Missing deadline enforcement in CommitRevealObligation causes slashing of timely reveals and acceptance of late reveals

###### Description

commitDeadline is only enforced in slashBond(), while checkObligation() and reclaimBond() ignore both the deadline and Attestation.time. This allows a timely reveal to be slashed after the deadline if not yet reclaimed, and allows late reveals to still collect escrow; late revealers can sometimes also reclaim their bond if no one has slashed yet.

In CommitRevealObligation, slashBond() enforces block.timestamp > commitTimestamp + commitDeadline and that the bond was not yet claimed, but does not check whether a reveal exists or when it occurred. checkObligation() validates schema/expiry/revocation and that a matching commitment exists from a prior block, but it does not compare the reveal’s attestation time to the commitment timestamp or deadline. reclaimBond() checks only for commitment existence, not-same-block, and not-already-claimed, and ignores the deadline. As a result, (1) a fulfiller who reveals before the deadline can still have their bond slashed by anyone after the deadline if they have not reclaimed, and (2) a late reveal remains valid for escrow collection since timeliness is not enforced by the arbiter; if no one has slashed yet, the fulfiller can also reclaim their bond despite lateness.

###### Severity

**Impact Explanation:** [High] Timely revealers can suffer direct, material loss of their bond (principal/penalty) due to permissionless slashing that ignores reveal existence/time; buyers can pay out for stale results when relying on the arbiter for timeliness.

**Likelihood Explanation:** [Low] Scenario 1 is griefing (no direct profit to the slasher) and can be mitigated by prompt reclaim; Scenario 2 depends on integrators omitting or misconfiguring escrow expirationTime. Both are uncommon under competent operation and rational incentives.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
A fulfiller commits and reveals before the deadline but delays reclaiming the bond. After the deadline passes, any third party calls slashBond(commitment). Because slashBond() ignores whether a reveal occurred and when, and the bond has not yet been reclaimed, the bond is transferred to slashedBondRecipient, causing loss despite a timely reveal.
#### Preconditions / Assumptions
- (a). CommitRevealObligation deployed with bondAmount > 0 and commitDeadline > 0
- (b). slashedBondRecipient is set
- (c). The fulfiller has a valid commitment and reveals before the deadline
- (d). The fulfiller has not called reclaimBond() before the deadline passes
- (e). slashBond() is permissionless and can be called by any third party after the deadline

### Scenario 2.
A buyer creates an escrow using CommitRevealObligation as arbiter without a short escrow expiration. A fulfiller commits at T0 but reveals after T0 + commitDeadline. checkObligation() accepts the late reveal (no deadline checks) and BaseEscrowObligation releases the escrowed asset to the fulfiller. If no one has called slashBond() yet, the fulfiller can also reclaim the bond due to reclaimBond() lacking a deadline check.
#### Preconditions / Assumptions
- (a). A BaseEscrowObligation-based escrow uses CommitRevealObligation as arbiter
- (b). The escrow attestation’s expirationTime is unset or set later than the late reveal time
- (c). The fulfiller commits at time T0 and reveals after T0 + commitDeadline
- (d). collectEscrowRaw() invokes checkObligation() which has no deadline enforcement
- (e). Optionally, no slasher has acted before the fulfiller calls reclaimBond() (to also recover the bond)

###### Proposed fix

####### CommitRevealObligation.sol

File: `contracts/src/obligations/CommitRevealObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/CommitRevealObligation.sol)

```diff
 ... 34 unchanged lines ...
     /// @notice commitmentClaimed[commitment] => bond already returned.
     mapping(bytes32 => bool) public commitmentClaimed;
+    // TODO(security): Track earliest reveal time to protect timely reveals from slashing and validate reclaim.
+    // Store EAS attestation.time of the first valid reveal for a commitment.
+    // mapping(bytes32 => uint64) internal revealedAt;
 
     event Committed(bytes32 indexed commitment, address indexed claimer);
 ... 52 unchanged lines ...
     // Attestation (reveal) path
     // ---------------------------------------------------------------------
+    // TODO(security): Override _afterAttest to fetch the new attestation, compute its commitment,
+    // and set revealedAt[commitment] = att.time (once) when a prior commit exists.
 
     /// @notice Creates a fulfillment attestation containing the payload and salt.
 ... 65 unchanged lines ...
         }
 
+        // TODO(security): Enforce commit-before-reveal (and optionally deadline-bound acceptance):
+        // require(obligation.time > info.commitTimestamp && obligation.time <= info.commitTimestamp + commitDeadline);
         return true;
     }
 
     // ---------------------------------------------------------------------
     // Bond reclaim
     // ---------------------------------------------------------------------
 
     /// @notice Returns the bond associated with a fulfilled attestation to its claimer.
     /// @param obligationUid UID of the fulfillment attestation (reveal).
     function reclaimBond(bytes32 obligationUid) external nonReentrant returns (uint256 amount) {
         Attestation memory obligation = _getAttestation(obligationUid);
 
         address claimer = obligation.recipient;
         bytes32 revealedCommitment = keccak256(
             abi.encode(obligation.refUID, claimer, keccak256(obligation.data))
         );
         CommitInfo memory info = commitments[revealedCommitment];
         if (info.committer == address(0)) revert CommitmentMissing(revealedCommitment, claimer);
         if (info.commitBlock >= block.number) {
             revert CommitmentTooRecent(revealedCommitment, claimer);
         }
+        // TODO(security): Require a timely reveal to reclaim:
+        // require(revealedAt[revealedCommitment] != 0 && revealedAt[revealedCommitment] <= info.commitTimestamp + commitDeadline, "Late or missing reveal");
         if (commitmentClaimed[revealedCommitment]) revert BondAlreadyClaimed(revealedCommitment);
 
         amount = bondAmount;
 
         commitmentClaimed[revealedCommitment] = true;
 
         (bool success, ) = claimer.call{value: amount}("");
         if (!success) revert BondTransferFailed(claimer, amount);
 
         emit BondReclaimed(obligationUid, claimer, amount);
     }
 
     // ---------------------------------------------------------------------
     // Bond slashing
     // ---------------------------------------------------------------------
 
     /// @notice Slashes the bond for a commitment whose deadline has passed without a valid reveal.
     /// @param commitment The commitment hash whose bond is being slashed.
     function slashBond(bytes32 commitment) external nonReentrant returns (uint256 amount) {
         CommitInfo memory info = commitments[commitment];
+        // TODO(security): Prevent slashing if a timely reveal exists:
+        // if (revealedAt[commitment] != 0 && revealedAt[commitment] <= info.commitTimestamp + commitDeadline) revert CommitDeadlineNotReached(commitment);
         if (info.committer == address(0)) revert CommitmentMissing(commitment, address(0));
         if (block.timestamp <= info.commitTimestamp + commitDeadline) {
 ... 26 unchanged lines ...
```

### 2. [Medium] Blanket ERC1155 operator approvals and token allowances in TokenBundleBarterUtils to external spender cause immediate user asset theft

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

TokenBundleBarterUtils grants ERC1155 collection-wide operator approvals and ERC20/ERC721 allowances/approvals to externally supplied spender contracts (bundlePayment/bundleEscrow). If those spender addresses are attacker-controlled via UI/integration misdirection, they can steal the user’s freshly pulled ERC20/721/1155 assets in the same transaction.

TokenBundleBarterUtils pulls a user’s ERC20/721/1155 tokens into itself and then unconditionally approves an external spender: ERC20 approve(spender, amount), ERC721 approve(spender, tokenId), and ERC1155 setApprovalForAll(spender, true) per collection in the bundle. Immediately after granting these approvals/operator rights, it calls the spender contract (bundlePayment.doObligationFor or bundleEscrow.doObligationFor). If that spender is attacker-controlled (e.g., via UI/integration misdirection), it can use the granted approvals/operator permissions to transfer all freshly pulled tokens from TokenBundleBarterUtils to the attacker during the same call. For ERC1155, setApprovalForAll is collection-wide, so any ERC1155 tokens of those collections held by the utility at that moment are also at risk. Canonical spender contracts would not abuse these rights, but the attack is enabled when a malicious spender/arbiter is configured, which is explicitly in scope.

#### Severity

**Impact Explanation:** [High] Direct, material loss of principal funds: ERC20/721/1155 assets can be stolen in the same transaction after approvals/operator rights are granted.

**Likelihood Explanation:** [Low] Exploitation requires off-chain UI/integration misdirection to a non-canonical TokenBundleBarterUtils configured with attacker-controlled spender/arbiter addresses, plus user approvals to that instance. These integration/user routing preconditions reduce the probability despite being in-scope.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Malicious payment during permitAndPayBundle: Victim uses a TokenBundleBarterUtils configured with an attacker-controlled bundlePayment. The utility pulls the victim’s ERC20/721/1155 into itself, approves bundlePayment (including ERC1155 setApprovalForAll), and calls doObligationFor. The malicious bundlePayment then transfers all approved assets from TokenBundleBarterUtils to the attacker and returns success.
#### Preconditions / Assumptions
- (a). Victim is routed to a TokenBundleBarterUtils instance configured with an attacker-controlled bundlePayment via UI/integration misdirection
- (b). Victim has granted ERC721/1155 approvals to TokenBundleBarterUtils (so it can pull tokens)
- (c). Victim supplies ERC20 permits requested by the function
- (d). Attacker’s bundlePayment implements the expected ABI and transfers tokens to the attacker after approvals/operator rights are granted

### Scenario 2.
Malicious escrow during permitAndEscrowBundle: Victim uses a TokenBundleBarterUtils configured with an attacker-controlled bundleEscrow. After pulling the victim’s ERC20/721/1155 and granting approvals/operator rights (including ERC1155 setApprovalForAll) to bundleEscrow, the utility calls doObligationFor. The malicious bundleEscrow immediately transfers the assets to the attacker and returns success.
#### Preconditions / Assumptions
- (a). Victim is routed to a TokenBundleBarterUtils instance configured with an attacker-controlled bundleEscrow via UI/integration misdirection
- (b). Victim has granted ERC721/1155 approvals to TokenBundleBarterUtils (so it can pull tokens)
- (c). Victim supplies ERC20 permits requested by the function
- (d). Attacker’s bundleEscrow implements the expected ABI and transfers tokens to the attacker after approvals/operator rights are granted

### Scenario 3.
Barter double theft with malicious arbiter/payment: In a bundle-for-bundle flow, TokenBundleBarterUtils sets the escrow’s arbiter to its configured bundlePayment address. If bundlePayment is attacker-controlled, it first drains the seller-side assets pulled into the utility during the pay step using the newly granted approvals/operator rights. Then, during collectEscrow, the escrow reads the arbiter from its data and calls checkObligation on the malicious arbiter, which returns true, causing the earlier buyer-side escrowed bundle to be released to the attacker.
#### Preconditions / Assumptions
- (a). Victim is routed to a TokenBundleBarterUtils instance configured with an attacker-controlled bundlePayment (IArbiter) via UI/integration misdirection
- (b). Victim completes an escrow creation step where the arbiter in the escrow data is set to the attacker-controlled bundlePayment
- (c). Victim or counterparty later triggers the pay step; TokenBundleBarterUtils pulls those assets and grants approvals/operator rights to the malicious bundlePayment
- (d). Malicious bundlePayment drains the freshly pulled seller-side assets and returns a fulfillment that its own checkObligation will accept, causing the escrow to release the buyer-side bundle to the attacker

#### Proposed fix

##### TokenBundleBarterUtils.sol

File: `contracts/src/utils/barter/TokenBundleBarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/TokenBundleBarterUtils.sol)

```diff
 ... 303 unchanged lines ...
 
     // Helper function to approve obligation contract to spend all tokens in a bundle
+    // SECURITY: Avoid granting external approvals/operator rights. Refactor to transfer tokens directly
+    // from this router to escrow/payee and call router-only 'prelocked/prepaid' obligation entrypoints.
     function _approveBundleTokens(
         TokenBundleEscrowObligation.ObligationData memory data,
 ... 23 unchanged lines ...
 
     // Helper function to approve obligation contract to spend all tokens in a payment bundle
+    // SECURITY: Same as above—remove external approvals (including ERC1155 setApprovalForAll) and use
+    // direct transfers from this router plus router-only obligation entrypoints.
     function _approvePaymentBundleTokens(
         TokenBundlePaymentObligation.ObligationData memory data,
 ... 54 unchanged lines ...
```

##### ERC1155BarterUtils.sol

File: `contracts/src/utils/barter/ERC1155BarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/ERC1155BarterUtils.sol)

```diff
 ... 78 unchanged lines ...
         );
 
+        // SECURITY: Replace all setApprovalForAll/approvals in this file with direct transfers from this router
+        // to escrow/payee and use router-only 'prelocked/prepaid' obligation entrypoints (applies to all below).
         // Approve obligation contract to spend BarterUtils' ERC1155 tokens
         IERC1155(bidToken).setApprovalForAll(address(erc1155Escrow), true);
 ... 463 unchanged lines ...
```

### 3. [Medium] Inaccurate NatSpec and demand parameter docs in ERC8004Arbiter.checkObligation cause escrow collection reverts and funds freeze

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

ERC8004Arbiter.checkObligation’s documentation understates required conditions and omits the validatorAddress field, while the implementation enforces additional checks and reverts on failure. Integrators relying on the docs may mis-encode demand or expect a boolean false, causing collectEscrow to revert and escrows to remain uncollectable until expiry (or indefinitely if non-expiring).

The function’s NatSpec claims it returns true when response >= minResponse and documents demand as containing only a registry address and min response. In reality, the function also requires: (1) fulfillment.refUID matches the provided escrow UID, (2) a nonzero validation record from the registry, and (3) the validatorAddress equals the one encoded in demand. It reverts on any failure instead of returning false. Integrations that follow the incomplete docs may omit validatorAddress or mishandle revert semantics, leading to persistent InvalidFulfillment on collectEscrow, leaving funds locked in escrow until reclaimExpired or indefinitely if expirationTime == 0.

#### Severity

**Impact Explanation:** [Medium] Collection fails and funds are frozen until expiry in typical deployments, causing significant but temporary availability loss of core escrow functionality. An indefinite freeze is possible only if integrators set non-expiring escrows, which is a less common configuration.

**Likelihood Explanation:** [Low] The scenarios depend on integrator/operator mis-encoding demand and/or misinterpreting revert semantics due to misleading documentation, which is categorized as low likelihood.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Buyer creates an escrow using ERC8004Arbiter with demand encoded per the misleading docs (omits validatorAddress). A fulfillment attestation correctly references the escrow and the registry returns a positive response with a nonzero validator. During collectEscrow, ERC8004Arbiter.checkObligation reverts with ValidatorMismatch, preventing release. Funds remain locked until the escrow’s expiration, after which the buyer can call reclaimExpired; the seller remains unpaid until expiry.
#### Preconditions / Assumptions
- (a). Integration/UI relies on the function’s NatSpec and omits validatorAddress when ABI-encoding DemandData
- (b). Escrow is created with ERC8004Arbiter as arbiter
- (c). Fulfillment attestation references the escrow UID (non-tierable) and the registry returns a positive response with a specific nonzero validatorAddress
- (d). Escrow has a finite expirationTime > 0

### Scenario 2.
Buyer creates a non-expiring escrow (expirationTime == 0) using ERC8004Arbiter with demand missing validatorAddress. A valid fulfillment and positive registry response exist. collectEscrow reverts with ValidatorMismatch each time, and reclaimExpired is unavailable for non-expiring escrows, resulting in funds being locked indefinitely and the seller remaining unpaid.
#### Preconditions / Assumptions
- (a). Integration/UI omits validatorAddress when ABI-encoding DemandData due to misleading docs
- (b). Escrow is created with ERC8004Arbiter as arbiter
- (c). Fulfillment attestation references the escrow UID and the registry returns a positive response with a specific nonzero validatorAddress
- (d). Escrow has expirationTime == 0 (non-expiring)

#### Proposed fix

##### ERC8004Arbiter.sol

File: `contracts/src/arbiters/ERC8004Arbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/ERC8004Arbiter.sol)

```diff
 ... 42 unchanged lines ...
     error ValidatorMismatch();
     error FulfillmentMustReferenceEscrow();
+    error InvalidValidationRegistry();
+    error InvalidValidatorAddress();
 
     /**
      * @notice Check if the validation response meets the minimum requirement
      * @param obligation The attestation representing the obligation
-     * @param demand ABI-encoded DemandData containing registry address and min response
+     * @param demand ABI-encoded DemandData containing registry address, validator address, and min response
      * @param fulfilling The escrow UID that this obligation must reference
-     * @return bool True if the validation response >= minResponse
+     * @return bool Returns true if all checks pass; reverts on any failure
      */
     function checkObligation(
         Attestation memory obligation,
         bytes memory demand,
         bytes32 fulfilling
     ) public view override returns (bool) {
         DemandData memory demand_ = abi.decode(demand, (DemandData));
 
         // Ensure obligation references what it's fulfilling
         if (obligation.refUID != fulfilling)
             revert FulfillmentMustReferenceEscrow();
 
+        if (demand_.validationRegistry == address(0)) revert InvalidValidationRegistry();
+        if (demand_.validatorAddress == address(0)) revert InvalidValidatorAddress();
         // Validate minResponse is in valid range
         if (demand_.minResponse > 100) revert InvalidMinResponse();
 ... 42 unchanged lines ...
```

#### Related findings

##### [Medium] Integer truncation during demand decoding in ERC8004Arbiter causes unauthorized escrow release or permanent lock

###### Description

ERC8004Arbiter decodes a uint8 minResponse from arbitrary bytes; abi.decode truncates wider integers, allowing non-canonical encodings to bypass intended range checks, weakening thresholds or causing collection reverts that can permanently lock non-expiring escrows.

ERC8004Arbiter expects demand as (address validationRegistry, address validatorAddress, uint8 minResponse). The contract ABI-decodes the raw bytes into this struct and then only checks if minResponse > 100 to revert. In Solidity 0.8.x, decoding into a smaller integer type truncates higher bits rather than reverting. Therefore, if an integration encodes the third field as a wider integer (e.g., uint256) with a non-canonical value, the decoded uint8 keeps only the low 8 bits. Values of the form 256k + r (r ≤ 100) are silently accepted as r, weakening the intended minimum validation threshold and enabling unauthorized collection if other checks pass. Values truncating to r > 100 cause InvalidMinResponse during collection, and since demand is only validated at collection time and non-expiring escrows (expirationTime == 0) cannot be reclaimed, funds can be permanently locked. BaseEscrowObligation forwards the demand bytes verbatim to the arbiter and does not canonicalize or validate at creation, magnifying the impact of integration mis-encoding.

###### Severity

**Impact Explanation:** [High] Unauthorized release results in direct loss of principal; mis-encoding that reverts at collection with non-expiring escrows causes permanent fund lock with no workaround; temporary DoS under AllArbiter blocks collection until expiry.

**Likelihood Explanation:** [Low] Exploitation relies on UI/integration mis-encoding of demand bytes and, for unauthorized release, attacker influence over registry/validator selection; these are user/integration mistakes or manipulations not guaranteed to occur.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Silent threshold weakening enables unauthorized release: An integration encodes minResponse as a wide integer (e.g., 256), which truncates to 0 when decoded as uint8. An attacker-controlled or misconfigured ERC-8004 registry/validator returns any non-zero validation for the fulfillment UID. The arbiter accepts response >= 0, collection succeeds, and escrowed funds are released to the attacker.
#### Preconditions / Assumptions
- (a). Buyer creates an escrow selecting ERC8004Arbiter and provides demand with minResponse mis-encoded as a wider integer (e.g., 256 or 256k + r where r ≤ 100).
- (b). UI/integration manipulation or misconfiguration causes use of an attacker-controlled or misconfigured ERC-8004 ValidationRegistry and validatorAddress.
- (c). Attacker submits a fulfillment attestation referencing the escrow UID and ensures the registry returns a matching validatorAddress and any response ≥ 0.

### Scenario 2.
Permanent funds lock due to basis-points-style mis-encoding on a non-expiring escrow: The integration encodes minResponse as a wider integer (e.g., 700 intending 70.0%), which truncates to 188. At collection, ERC8004Arbiter detects minResponse > 100 and reverts. Since expirationTime == 0 disallows reclaim, the escrow is permanently stuck.
#### Preconditions / Assumptions
- (a). Buyer creates an escrow selecting ERC8004Arbiter with expirationTime == 0 (never expires).
- (b). Integration encodes minResponse as a wider integer (e.g., 700 basis points) that truncates to a value > 100 when decoded as uint8.
- (c). A collection attempt is made at any time after creation.

### Scenario 3.
DoS of collection in AllArbiter composition: AllArbiter includes ERC8004Arbiter as a child with mis-encoded minResponse that truncates to a value > 100. ERC8004Arbiter reverts on InvalidMinResponse; AllArbiter does not catch reverts, causing collection to fail until escrow expiration.
#### Preconditions / Assumptions
- (a). Buyer uses AllArbiter with multiple child arbiters including ERC8004Arbiter.
- (b). Integration mis-encodes ERC8004Arbiter’s minResponse so that truncation yields a value > 100.
- (c). A collection attempt is made before escrow expiration.

###### Proposed fix

####### ERC8004Arbiter.sol

File: `contracts/src/arbiters/ERC8004Arbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/ERC8004Arbiter.sol)

```diff
 ... 55 unchanged lines ...
         bytes32 fulfilling
     ) public view override returns (bool) {
-        DemandData memory demand_ = abi.decode(demand, (DemandData));
+        (address validationRegistry, address expectedValidator, uint256 minRaw) =
+            abi.decode(demand, (address, address, uint256));
+        if (minRaw > 100) revert InvalidMinResponse();
 
         // Ensure obligation references what it's fulfilling
         if (obligation.refUID != fulfilling)
             revert FulfillmentMustReferenceEscrow();
 
-        // Validate minResponse is in valid range
-        if (demand_.minResponse > 100) revert InvalidMinResponse();
+        uint8 minResponse = uint8(minRaw);
 
         // Use the obligation UID as the requestHash
         bytes32 requestHash = obligation.uid;
 
         // Query the ValidationRegistry
-        IValidationRegistry registry = IValidationRegistry(
-            demand_.validationRegistry
-        );
+        IValidationRegistry registry = IValidationRegistry(validationRegistry);
         (
             address validatorAddress,
             , // agentId (unused)
             uint8 response,
             , // responseHash (unused)
             , // tag (unused)
 
         ) = // lastUpdate (unused)
             registry.getValidationStatus(requestHash);
 
         // Check if validation exists (validatorAddress != address(0))
         if (validatorAddress == address(0)) revert ValidationNotFound();
 
         // Check if validator matches expected validator
-        if (validatorAddress != demand_.validatorAddress)
+        if (validatorAddress != expectedValidator)
             revert ValidatorMismatch();
 
         // Check if response meets minimum requirement
-        if (response < demand_.minResponse) revert ResponseBelowMinimum();
+        if (response < minResponse) revert ResponseBelowMinimum();
 
         return true;
     }
 
     /**
      * @notice Helper function to decode DemandData
      * @param data ABI-encoded DemandData
      * @return DemandData struct
      */
     function decodeDemandData(
         bytes calldata data
     ) public pure returns (DemandData memory) {
-        return abi.decode(data, (DemandData));
+        (address validationRegistry, address validatorAddress, uint256 minRaw) =
+            abi.decode(data, (address, address, uint256));
+        if (minRaw > 100) revert InvalidMinResponse();
+        return DemandData({
+            validationRegistry: validationRegistry, validatorAddress: validatorAddress, minResponse: uint8(minRaw)
+        });
     }
 }
```

##### [Low] Un-namespaced requestHash=fulfillment UID in ERC8004Arbiter causes DoS of escrow collection

###### Description

ERC8004Arbiter uses the fulfillment attestation UID as a global requestHash in ERC-8004’s ValidationRegistry. Because the registry is first-writer-wins and agent registration is permissionless, any third party can seize the request slot with a mismatching validator, causing collection to revert. The issue is a liveness/race DoS that is avoidable by atomically bundling attest+request or re-attesting and bundling.

ERC8004Arbiter.checkObligation() derives requestHash directly from the fulfillment attestation UID and queries ERC-8004’s ValidationRegistry by that key. ValidationRegistryUpgradeable.validationRequest() is first-writer-wins per requestHash and authorizes any agent owner (agentId is permissionless to mint via IdentityRegistryUpgradeable.register()). A third party can therefore create a validationRequest for the same fulfillment UID but with a different validatorAddress. ERC8004Arbiter then enforces that the recorded validatorAddress equals the expected validator in DemandData, causing ValidatorMismatch and reverting collection. If no entry exists, getValidationStatus reverts "unknown," which also halts collection. Although not strictly permanent (the fulfiller can re-attest to get a new UID and atomically create the corresponding request in the same transaction), this design enables a practical DoS whenever integrators use a two-step flow (attest first, request later) that can be front-run.

###### Severity

**Impact Explanation:** [Medium] The attack causes significant but temporary availability loss of core functionality (escrow collection). Funds are not stolen and a straightforward workaround exists (re-attest and atomically create the request).

**Likelihood Explanation:** [Low] Exploitation is pure griefing with no direct profit and requires the integration to use a two-step flow and not adopt the straightforward mitigation (atomic bundling).

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Scenario 1: Two-step integration DoS with mismatching validator. Steps: (1) Buyer creates an escrow using ERC8004Arbiter with DemandData specifying validationRegistry, expected validatorAddress, and minResponse. (2) Fulfiller submits a fulfillment attestation to EAS, producing a public fulfillment UID; plans to create the ValidationRegistry request in a later transaction. (3) Attacker registers an agentId and calls validationRequest first for that UID with a different validatorAddress. (4) On collectEscrowRaw, ERC8004Arbiter.getValidationStatus returns the attacker’s validatorAddress, fails the equality check, and reverts; the legitimate request for that UID cannot be created thereafter.
#### Preconditions / Assumptions
- (a). Escrow uses ERC8004Arbiter with DemandData including validationRegistry, expected validatorAddress, and minResponse
- (b). Fulfiller uses an unbundled two-step flow (attest first, request later)
- (c). ValidationRegistryUpgradeable and IdentityRegistryUpgradeable are deployed and used
- (d). Attacker can mint an agentId permissionlessly
- (e). No atomic bundling of attest + validationRequest in a single transaction

### Scenario 2.
Scenario 2: Indefinite griefing across re-fulfillments without bundling. Steps: (1) After the first DoS, the fulfiller creates a new fulfillment attestation referencing the same escrow, still planning a separate validationRequest transaction. (2) Attacker monitors and repeats validationRequest first for each new UID with a mismatching validatorAddress. (3) Each collection attempt reverts due to ValidatorMismatch until the fulfiller switches to atomic bundling (attest + request in one transaction) or escrow expires.
#### Preconditions / Assumptions
- (a). All preconditions of Scenario 1
- (b). Fulfiller re-attests to produce new fulfillment UIDs but continues to use a two-step flow
- (c). Attacker continues to monitor and front-run each new UID’s validationRequest

### Scenario 3.
Scenario 3: Stall using the expected validatorAddress. Steps: (1) Fulfiller creates a fulfillment attestation and plans a later request. (2) Attacker creates validationRequest first for that UID but sets validatorAddress = expected validatorAddress. (3) Until the validator posts a response >= minResponse, collection reverts with ResponseBelowMinimum. This delays collection (stall), but once the validator responds, collection proceeds.
#### Preconditions / Assumptions
- (a). All preconditions of Scenario 1
- (b). Attacker sets validatorAddress in validationRequest equal to the expected validatorAddress
- (c). Validator responsiveness may be delayed (no malicious validator behavior assumed)

###### Proposed fix

####### ERC8004Arbiter.sol

File: `contracts/src/arbiters/ERC8004Arbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/ERC8004Arbiter.sol)

```diff
 ... 64 unchanged lines ...
         if (demand_.minResponse > 100) revert InvalidMinResponse();
 
-        // Use the obligation UID as the requestHash
-        bytes32 requestHash = obligation.uid;
+        // Derive a domain-separated requestHash using this arbiter, fulfillment UID, and expected validator
+        bytes32 requestHash = keccak256(abi.encodePacked("ERC8004Arbiter", address(this), obligation.uid, demand_.validatorAddress));
 
         // Query the ValidationRegistry
 ... 37 unchanged lines ...
```

### 4. [Medium] Lack of recipient capability checks and unsafe ERC721 transfers in TokenBundleSplitterBase.collectAndDistribute causes oracle-driven ERC1155 DoS and ERC721 stranding

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

TokenBundleSplitterBase.collectAndDistribute, inherited by the validated TokenBundleSplitter, distributes ERC1155 and ERC721 assets to oracle-selected recipients without validating recipient capability. ERC1155 safeTransferFrom reverts for non-receiver recipients (DoS), and ERC721 uses unsafe transferFrom, which can permanently strand NFTs at contracts unable to transfer them out.

The validated TokenBundleSplitter relies on TokenBundleSplitterBase.collectAndDistribute to atomically collect an escrow and push assets to recipients provided by an oracle decision. The base implementation does not validate recipient capability. For ERC1155, safeTransferFrom is used and will revert if a recipient contract lacks the ERC1155 receiver interface or reverts in its hook, causing the entire collectAndDistribute call to revert and leaving the escrow uncollected (DoS). For ERC721, transferFrom (unsafe) is used, which succeeds even when the recipient is a contract that cannot initiate outgoing transfers, permanently stranding the NFT. TokenBundleSplitter.arbitrate validates only split totals, array lengths, and unique ERC721 assignment but does not validate recipients. While atomicity prevents partial custody in the splitter, it does not prevent oracle-driven DoS or stranding, which the validated splitter is expected to avoid per the stated expectations.

#### Severity

**Impact Explanation:** [High] ERC721 stranding leads to direct, material loss of principal (NFTs). ERC1155 DoS blocks escrow finalization, degrading core settlement functionality.

**Likelihood Explanation:** [Low] Exploitation relies on integration/UI manipulation to use an attacker-controlled oracle or on a trusted oracle’s mistake. These are plausible but not routine; attacks can also be griefing-driven without direct profit.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Attacker-controlled oracle via UI manipulation assigns an escrowed ERC721 to a sink contract with no ability to initiate outgoing transfers. The attacker mints a fulfillment to the splitter and triggers collectAndDistribute. ERC721.transferFrom succeeds to the sink contract, and the NFT becomes permanently stranded, causing direct loss to the intended recipient or the buyer.
#### Preconditions / Assumptions
- (a). A TokenBundleEscrowObligation escrow holds at least one ERC721
- (b). The escrow arbiter is the validated TokenBundleSplitter
- (c). The buyer/UI encodes an attacker-controlled oracle address in DemandData (UI/social engineering in-scope)
- (d). The attacker deploys a sink contract with no ability to initiate ERC721 transfers
- (e). The attacker-oracle submits a valid split assigning the ERC721 to the sink
- (f). A fulfillment attestation is minted with recipient = TokenBundleSplitter and refUID = escrow UID

### Scenario 2.
Attacker-controlled or misconfigured oracle assigns an ERC1155 portion to a non-receiver contract. A fulfillment is minted to the splitter and collectAndDistribute is called. ERC1155.safeTransferFrom reverts on the recipient hook, causing the entire transaction to revert and the escrow to remain uncollected, resulting in ongoing DoS until the decision is changed.
#### Preconditions / Assumptions
- (a). A TokenBundleEscrowObligation escrow holds ERC1155 assets
- (b). The escrow arbiter is the validated TokenBundleSplitter
- (c). The oracle address in DemandData is attacker-controlled or misconfigured
- (d). A non-receiver ERC1155 contract exists and is selected as recipient in the splits
- (e). A fulfillment attestation is minted with recipient = TokenBundleSplitter and refUID = escrow UID

### Scenario 3.
Trusted oracle mistakenly assigns an ERC721 to a contract that cannot transfer tokens out. Distribution succeeds via unsafe transferFrom, permanently stranding the NFT and causing direct, irreversible loss.
#### Preconditions / Assumptions
- (a). A TokenBundleEscrowObligation escrow holds at least one ERC721
- (b). The escrow arbiter is the validated TokenBundleSplitter
- (c). A trusted oracle (non-malicious) submits a decision assigning the ERC721 to a contract that cannot initiate outgoing transfers
- (d). A fulfillment attestation is minted with recipient = TokenBundleSplitter and refUID = escrow UID

#### Proposed fix

##### TokenBundleSplitter.sol

File: `contracts/src/utils/splitters/TokenBundleSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitter.sol)

```diff
 ... 49 unchanged lines ...
         );
 
+        // SECURITY TODO: After validating totals/assignments, enforce recipient capability checks:
+        // - If a contract receives ERC721, require IERC721Receiver via ERC165; if ERC1155, require ERC1155Receiver.
+        // - Disallow EXECUTOR_SENTINEL for ERC721/1155 recipients.
+        // - Optionally, precheck fulfillment.recipient == address(this) in collectAndDistribute before collecting.
         _validateSplits(splits, escrowData);
 
 ... 94 unchanged lines ...
```

##### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 251 unchanged lines ...
 
             // ERC721s
+            // SECURITY TODO: For the validated splitter, pre-validate ERC721 recipients (ERC165 IERC721Receiver) and prefer safeTransferFrom to avoid stranding.
             for (uint256 i; i < splits[s].erc721Indices.length; ++i) {
                 uint256 idx = splits[s].erc721Indices[i];
                 IERC721(escrowData.erc721Tokens[idx]).transferFrom(
                     address(this),
                     recipient,
                     escrowData.erc721TokenIds[idx]
                 );
             }
 
             // ERC1155s
+            // SECURITY TODO: For the validated splitter, enforce ERC1155 recipients implement ERC1155Receiver via ERC165 at arbitrate(), and disallow EXECUTOR_SENTINEL for ERC721/1155.
             for (uint256 i; i < splits[s].erc1155Amounts.length; ++i) {
                 if (splits[s].erc1155Amounts[i] > 0) {
 ... 44 unchanged lines ...
```

#### Related findings

##### [Low] Unchecked ERC1155 recipient acceptance in TokenBundleSplitter/ERC1155Splitter causes distribution-wide DoS

###### Description

Both TokenBundleSplitter (via TokenBundleSplitterBase) and ERC1155Splitter distribute ERC-1155 using safeTransferFrom to arbitrary recipients without verifying ERC1155Receiver support. If any recipient rejects the transfer, the atomic collectAndDistribute reverts, blocking payout to all recipients until the oracle overwrites the decision.

The splitters distribute ERC-1155 assets by calling IERC1155.safeTransferFrom to each split recipient inside a single atomic, nonReentrant collectAndDistribute. If any recipient is a contract that reverts or returns an invalid onERC1155Received selector, safeTransferFrom reverts and the entire transaction aborts. Due to atomicity, earlier steps (including escrow collection) roll back and no one is paid; tokens remain in the escrow. There is no fallback (no try/catch, no skip-on-failure, no partial distribution). Resolution requires the trusted oracle to overwrite the decision and assign ERC-1155 shares to acceptant recipients. Additionally, if a split uses EXECUTOR_SENTINEL for an ERC-1155 share and the executor is a non-receiver contract, the call reverts. This is a liveness DoS (no theft or loss) until oracle intervention.

###### Severity

**Impact Explanation:** [Medium] The issue causes significant but temporary availability loss of a core function (distribution) for affected escrows; no funds are lost and tokens remain in escrow until oracle intervention.

**Likelihood Explanation:** [Low] Exploitation relies on a trusted oracle/operator including a non-accepting ERC-1155 recipient (operator mistake/integration error) or on irrational attacker griefing via EXECUTOR_SENTINEL; both are low-likelihood conditions per the rules.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
TokenBundleSplitter: Oracle posts a split that assigns a non-zero ERC-1155 share to an attacker-controlled contract whose onERC1155Received rejects. Any call to collectAndDistribute reverts at the ERC-1155 transfer step, blocking all recipients; funds remain in escrow until the oracle updates the decision.
#### Preconditions / Assumptions
- (a). An escrow exists using TokenBundleEscrowObligation with at least one ERC-1155 asset.
- (b). TokenBundleSplitter is the arbiter set in the escrow data.
- (c). The trusted oracle posts a decision that assigns a non-zero ERC-1155 amount to a non-accepting recipient contract (reverts or returns invalid selector in onERC1155Received).
- (d). collectAndDistribute is invoked by any executor.

### Scenario 2.
ERC1155Splitter: Oracle posts splits for an ERC-1155 escrow that include a rejecting recipient contract for a non-zero amount. collectAndDistribute calls escrow collection, then reverts on the ERC-1155 transfer to the rejecting recipient; no recipients are paid until the oracle revises splits.
#### Preconditions / Assumptions
- (a). An escrow exists using ERC1155EscrowObligation with a defined token and amount.
- (b). ERC1155Splitter is the arbiter set in the escrow data.
- (c). The trusted oracle posts splits including a non-accepting recipient contract for a non-zero amount.
- (d). collectAndDistribute is invoked by any executor.

### Scenario 3.
EXECUTOR_SENTINEL griefing: Oracle uses EXECUTOR_SENTINEL for an ERC-1155 share. An attacker repeatedly calls collectAndDistribute from a non-receiver contract so the resolved recipient is the attacker’s contract, causing safeTransferFrom to revert and disrupting liveness until an honest executor gets mined first or the oracle changes the split.
#### Preconditions / Assumptions
- (a). A split includes EXECUTOR_SENTINEL for an ERC-1155 share in TokenBundleSplitter or ERC1155Splitter.
- (b). An attacker can call collectAndDistribute from a contract that does not implement ERC1155Receiver.
- (c). The attacker repeatedly submits transactions to front-run or collide with honest executors.

###### Proposed fix

####### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 260 unchanged lines ...
             }
 
+            // TODO: Mitigation: before distribution, validate ERC1155 recipients:
+            // - If recipient is a contract, require IERC165(recipient).supportsInterface(0x4e2312e0) (IERC1155Receiver).
+            // - If recipient == EXECUTOR_SENTINEL for any ERC1155, require the executor is an EOA or disallow sentinel for ERC1155.
             // ERC1155s
             for (uint256 i; i < splits[s].erc1155Amounts.length; ++i) {
 ... 45 unchanged lines ...
```

####### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 117 unchanged lines ...
         for (uint256 i; i < splits.length; ++i) {
             decisions[msg.sender][decisionKey].push(splits[i]);
+        // TODO: Mitigation: validate splits' ERC1155 recipients here:
+        // - For non-zero ERC1155 amounts, if recipient is a contract, require IERC1155Receiver via ERC165; flag sentinel usage.
         }
         hasDecision[msg.sender][decisionKey] = true;
 ... 92 unchanged lines ...
         for (uint256 i; i < splits.length; ++i) {
             address recipient = splits[i].recipient;
+            // TODO: Mitigation: enforce ERC1155 recipient acceptability:
+            // - If recipient is a contract, require IERC165 support for IERC1155Receiver.
+            // - If recipient == EXECUTOR_SENTINEL, require EOA executor for ERC1155 amounts.
             if (recipient == EXECUTOR_SENTINEL) {
                 recipient = msg.sender;
 ... 47 unchanged lines ...
```

####### TokenBundleSplitter.sol

File: `contracts/src/utils/splitters/TokenBundleSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitter.sol)

```diff
 ... 55 unchanged lines ...
         );
 
+        // TODO: Mitigation: validate ERC1155 recipients for non-zero amounts (ERC165 for IERC1155Receiver) and flag EXECUTOR_SENTINEL usage for ERC1155.
+        // At execution, optionally re-check and enforce EOA-only executor when ERC1155 sentinel is used.
         _storeDecision(msg.sender, decisionKey, splits);
 
 ... 88 unchanged lines ...
```

### 5. [Medium] Missing msg.value validation/refund in TokenBundleEscrowObligation escrow creation causes permanent loss of attached ETH

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Bundle escrow creation functions are payable but only enforce msg.value when nativeAmount > 0. If nativeAmount == 0 and ETH is attached, the call succeeds without refund or accounting, and later release/reclaim sends only the recorded nativeAmount (0), orphaning the extra ETH. No sweep or recovery path exists. The same footgun exists via the public payable doObligationRaw on non-native escrows.

In both non-tierable and tierable TokenBundleEscrowObligation contracts, _lockEscrow enforces msg.value equality only if the decoded nativeAmount is greater than zero. When nativeAmount equals zero, any attached ETH is silently accepted, not recorded in the escrow data, and not refunded. Subsequent _releaseEscrow and _returnEscrow transfer only decoded.nativeAmount, leaving the extra ETH stranded in the contract indefinitely. There is no admin or public sweep/refund function, and BaseAttester forwards zero ETH to EAS, so no external component absorbs or returns the funds. This behavior is inconsistent with NativeTokenEscrowObligation (which enforces exact native value) and TokenBundlePaymentObligation (which refunds excess ETH), indicating an unintended ETH-accounting gap. Additionally, BaseObligation.doObligationRaw is public payable and inherited by non-native escrows (ERC20/721/1155); calling it with a non-zero value similarly strands ETH because those escrows ignore msg.value and never transfer ETH on release.

#### Severity

**Impact Explanation:** [High] Direct, material loss of principal ETH that becomes frozen indefinitely with no available workaround or recovery path.

**Likelihood Explanation:** [Low] Exploitation relies on integrator misbehavior (buggy or malicious) or incorrect use of a raw payable method; typical wallets default to zero value, reducing frequency.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
A dApp integrator constructs a TokenBundleEscrowObligation.doObligation transaction with ObligationData.nativeAmount = 0 but sets msg.value = 0.5 ETH (buggy or malicious). The call succeeds, tokens (if any) are escrowed, and the contract balance increases by 0.5 ETH. On collectEscrow or reclaimExpired, only decoded.nativeAmount (0) is transferred; the 0.5 ETH remains stuck in the contract permanently.
#### Preconditions / Assumptions
- (a). Integrator/dApp crafts a transaction to TokenBundleEscrowObligation.doObligation or doObligationFor
- (b). ObligationData.nativeAmount == 0
- (c). msg.value > 0
- (d). Users sign and send the transaction via the integrator
- (e). No refund or sweep logic exists in the escrow contract
- (f). Later release/reclaim transfers only decoded.nativeAmount

### Scenario 2.
An SDK integration mistakenly uses BaseObligation.doObligationRaw on ERC20EscrowObligation with msg.value = 1 ETH due to shared code expecting refund semantics. The ERC20 is escrowed, but _lockEscrow ignores msg.value and no refund occurs. Later, _releaseEscrow transfers only the ERC20 tokens; the 1 ETH stays trapped indefinitely.
#### Preconditions / Assumptions
- (a). SDK/integration invokes BaseObligation.doObligationRaw on a non-native escrow (e.g., ERC20EscrowObligation)
- (b). msg.value > 0
- (c). Escrow _lockEscrow ignores msg.value
- (d). No refund or sweep logic exists in the escrow contract
- (e). Later release transfers only the specified token, not ETH

### Scenario 3.
A shared integration reuses TokenBundlePaymentObligation logic for escrow flows and attaches a buffer of ETH (e.g., 2 ETH) expecting refunds. It calls TokenBundleEscrowObligation.doObligation with nativeAmount = 0 and msg.value = 2 ETH. The escrow is created, no refund is issued, and later release/reclaim sends only 0 native tokens; the 2 ETH is permanently stranded.
#### Preconditions / Assumptions
- (a). Integration assumes payment-style refund semantics for escrows
- (b). Calls TokenBundleEscrowObligation.doObligation with nativeAmount == 0
- (c). Attaches msg.value as a buffer (msg.value > 0)
- (d). No refund or sweep logic exists in the escrow contract
- (e). Later release/reclaim transfers only decoded.nativeAmount (0)

#### Proposed fix

##### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 117 unchanged lines ...
 
         // Handle native tokens
-        if (decoded.nativeAmount > 0) {
-            if (msg.value != decoded.nativeAmount) {
-                revert IncorrectPayment(decoded.nativeAmount, msg.value);
-            }
+        if (msg.value != decoded.nativeAmount) {
+            revert IncorrectPayment(decoded.nativeAmount, msg.value);
         }
 
 ... 573 unchanged lines ...
```

##### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 117 unchanged lines ...
 
         // Handle native tokens
-        if (decoded.nativeAmount > 0) {
-            if (msg.value != decoded.nativeAmount) {
-                revert IncorrectPayment(decoded.nativeAmount, msg.value);
-            }
+        if (msg.value != decoded.nativeAmount) {
+            revert IncorrectPayment(decoded.nativeAmount, msg.value);
         }
 
 ... 573 unchanged lines ...
```

### 6. [Medium] Public execute() plus under-allocation in TokenBundleSplitterUnvalidated causes theft of stranded ERC20/721/1155 assets

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

TokenBundleSplitterBase exposes a public arbitrary-call execute() while TokenBundleSplitterUnvalidated allows under-allocation that strands assets in the splitter. Anyone can use execute() to transfer or approve and drain stranded ERC20/721/1155 tokens from the splitter, resulting in direct theft.

In TokenBundleSplitterUnvalidated, oracle decisions are accepted without validating that split totals match the escrow bundle. During collectAndDistribute in TokenBundleSplitterBase, the full escrowed bundle is first transferred to the splitter contract, then only the provided split amounts are sent to recipients. If under-allocated, leftovers remain in the splitter. Because execute(address,bytes) is public and performs arbitrary calls as the splitter, an attacker can call token transfer functions (or set approvals) as the splitter to move any stranded ERC20/721/1155 tokens to themselves. ERC1155/native recipient callbacks also allow mid-call reentrancy to plant approvals, but this is not required; post-call execution suffices. ETH leftovers are not drainable via execute(), but ERC20/721/1155 are. Validated splitter variants that enforce totals do not strand value and are not affected.

#### Severity

**Impact Explanation:** [High] Stranded ERC20/721/1155 tokens can be transferred to the attacker, causing direct and material loss of principal.

**Likelihood Explanation:** [Low] Exploitation requires an integration (trusted oracle) to publish under-allocated splits at the time of collection, creating leftovers; this is outside attacker control and classified as integration error.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
After collectAndDistribute with under-allocated ERC20 splits, the splitter holds leftover ERC20 tokens. An attacker calls execute() to invoke IERC20.transfer(attacker, leftover), directly moving the stranded tokens to themselves.
#### Preconditions / Assumptions
- (a). TokenBundleSplitterUnvalidated is deployed and used for a bundle escrow.
- (b). The escrow bundle includes an ERC20 token with a total amount transferred into escrow.
- (c). The trusted oracle publishes under-allocated splits such that the ERC20 split totals are less than the escrowed amount at the time of collection.
- (d). collectAndDistribute is called while the under-allocated decision is active, moving the full escrow amount to the splitter and distributing only the split amounts.
- (e). Leftover ERC20 balance remains in the splitter.
- (f). execute() is publicly callable and performs arbitrary calls as the splitter.
- (g). Tokens behave per standard assumptions (no hooks for ERC20; ERC1155 recipients may be adversarial).

### Scenario 2.
After collectAndDistribute with unassigned ERC721 or under-allocated ERC1155, the splitter still owns those tokens. The attacker calls execute() to invoke IERC721.safeTransferFrom(splitter, attacker, tokenId) or IERC1155.safeTransferFrom(splitter, attacker, id, amount, ""), stealing the stranded assets.
#### Preconditions / Assumptions
- (a). TokenBundleSplitterUnvalidated is deployed and used for a bundle escrow.
- (b). The escrow bundle includes ERC721 and/or ERC1155 assets.
- (c). The trusted oracle publishes under-allocated/missing assignments such that some ERC721 indices are unassigned and/or ERC1155 amounts under-allocated.
- (d). collectAndDistribute is called, transferring the full bundle to the splitter and only distributing the split portions.
- (e). Unassigned ERC721 and/or under-allocated ERC1155 remain in the splitter.
- (f). execute() is publicly callable and performs arbitrary calls as the splitter.
- (g). Tokens behave per standard assumptions (ERC721/1155 standard transfer semantics).

### Scenario 3.
During ERC1155 distribution to an attacker-controlled contract, onERC1155Received reenters and calls execute() to set ERC20 approvals or setApprovalForAll for ERC721/1155 in favor of the attacker. After collectAndDistribute completes, the attacker calls transferFrom/safeTransferFrom to drain the stranded tokens.
#### Preconditions / Assumptions
- (a). TokenBundleSplitterUnvalidated is deployed and used for a bundle escrow.
- (b). The escrow bundle includes assets that will remain under-allocated (ERC20/721/1155).
- (c). The attacker’s contract is assigned some ERC1155 amount in the splits so that onERC1155Received is invoked during distribution.
- (d). collectAndDistribute is called; during ERC1155 safeTransferFrom, the attacker’s onERC1155Received executes.
- (e). execute() is publicly callable and not guarded by nonReentrant, allowing reentrant approval-setting calls.
- (f). After call completion, leftover tokens remain in the splitter and tokens behave per standard assumptions.

#### Proposed fix

##### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 177 unchanged lines ...
         address target,
         bytes calldata data
-    ) external payable returns (bytes memory) {
+    ) external payable virtual returns (bytes memory) {
         _currentExecutor = msg.sender;
         (bool success, bytes memory result) = target.call{value: msg.value}(
 ... 127 unchanged lines ...
```

##### TokenBundleSplitterUnvalidated.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterUnvalidated.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitterUnvalidated.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {Attestation} from "@eas/Common.sol";
 import {IEAS} from "@eas/IEAS.sol";
 import {TokenBundleSplitterBase} from "./TokenBundleSplitterBase.sol";
 
 /// @notice Token bundle splitter without validation of split totals.
 ///         Cheaper oracle calls, but incorrect splits will only surface
 ///         as reverts during collectAndDistribute (over-allocation) or
 ///         stranded tokens in the splitter (under-allocation).
 contract TokenBundleSplitterUnvalidated is TokenBundleSplitterBase {
     constructor(IEAS _eas) TokenBundleSplitterBase(_eas) {}
 
+    error ExecuteDisabledForUnvalidated();
+
+    function execute(address, bytes calldata) external payable override returns (bytes memory) {
+        revert ExecuteDisabledForUnvalidated();
+    }
+
     /// @notice Oracle submits a split decision without validation.
     ///         Only checks for empty splits and zero-address recipients.
 ... 19 unchanged lines ...
```

#### Related findings

##### [Medium] Missing decision check in splitters' collectAndDistribute causes funds stranded on splitter after escrow collection

###### Description

The splitters’ collectAndDistribute functions call the escrow’s collectEscrow without verifying that a split decision exists, allowing anyone to collect escrowed assets into the splitter when no splits are recorded and distribute nothing. Because the escrow attestation is revoked during collection, the payout cannot be retried later, resulting in stranded funds on the splitter.

In ERC20Splitter (and analogously in ERC1155Splitter, NativeTokenSplitter, and TokenBundleSplitterBase), collectAndDistribute reads the oracle splits from decisions[oracle][decisionKey] but never requires hasDecision to be true or splits.length > 0 before calling escrowContract.collectEscrow(escrow, fulfillment). The escrow contracts’ collectEscrowRaw (tierable and non-tierable variants) revoke the escrow attestation and transfer funds to fulfillment.recipient if the configured arbiter approves; they do not require the arbiter to be the splitter. In deployments where arbitration (approval) is decoupled from splitting (e.g., using TrustedOracleArbiter or a confirmation arbiter), an attacker can call collectAndDistribute after the arbiter has approved but before splits are posted to the splitter. If the fulfillment recipient is the splitter contract (a common router-style configuration), collectEscrow transfers funds into the splitter. Since splits are empty, the distribution loop makes zero transfers and returns. The escrow is already revoked, preventing any later collect-and-distribute retry once splits are posted. While a practical workaround exists via the splitter’s permissionless execute() to move funds out after-the-fact, the intended atomic payout flow is broken and funds can be stranded until someone intervenes.

###### Severity

**Impact Explanation:** [Medium] The main effect is a significant DoS/availability loss of the intended atomic payout: assets are collected and escrow is revoked, but recipients do not receive funds until a manual workaround (e.g., using the splitter’s permissionless execute()) is executed. This is not a direct theft or permanent loss and a practical workaround exists.

**Likelihood Explanation:** [Medium] Exploitation depends on realistic integration choices (arbiter separate from splitter, fulfillment recipient routed to splitter) and timing/order (arbiter approval before splits publication). These conditions are common in decoupled pipelines but not universal, yielding medium likelihood.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
TrustedOracleArbiter approves a fulfillment before splits are posted; an attacker calls ERC20Splitter.collectAndDistribute, which collects the ERC20 escrow into the splitter (fulfillment.recipient = splitter) and performs zero distributions, stranding funds.
#### Preconditions / Assumptions
- (a). Escrow uses an arbiter other than the splitter (e.g., TrustedOracleArbiter) and that arbiter has approved the fulfillment
- (b). Fulfillment recipient is the splitter contract address
- (c). Splitter has no recorded decision for the escrow (hasDecision false / splits empty)
- (d). Escrow demand bytes are ABI-compatible with (address oracle, bytes data) so the splitter’s decode succeeds
- (e). Attacker (anyone) can call collectAndDistribute

### Scenario 2.
A buyer uses a confirmation arbiter and confirms the fulfillment; before splits are posted, an attacker calls collectAndDistribute, which collects tokens into the splitter and distributes nothing, irrevocably ending the escrow and stranding funds.
#### Preconditions / Assumptions
- (a). Escrow uses a confirmation arbiter; buyer has confirmed the (fulfillment, escrow) tuple
- (b). Fulfillment recipient is the splitter contract
- (c). No splits recorded yet in the splitter for this escrow
- (d). Attacker (anyone) can call collectAndDistribute

### Scenario 3.
Tierable escrows reuse one fulfillment across many escrows; after arbiter approval but before splits are posted, an attacker loops collectAndDistribute over multiple escrows to aggregate funds into the splitter without distribution, causing multi-escrow stranding.
#### Preconditions / Assumptions
- (a). Multiple tierable ERC20 escrows share a fulfillment that an external arbiter has approved
- (b). Fulfillment recipient is the splitter contract
- (c). No splits recorded yet in the splitter for these escrows
- (d). Attacker (anyone) can call collectAndDistribute repeatedly across escrows

###### Proposed fix

####### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 206 unchanged lines ...
 
         // Collect escrow — tokens transfer to this contract
+        require(hasDecision[demandData.oracle][decisionKey], "NoDecision");
         IERC20EscrowObligation(escrowContract).collectEscrow(
             escrow,
 ... 51 unchanged lines ...
```

####### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 205 unchanged lines ...
 
         // Collect escrow — tokens transfer to this contract
+        require(hasDecision[demandData.oracle][decisionKey], "NoDecision");
         IERC1155EscrowObligation(escrowContract).collectEscrow(
             escrow,
 ... 55 unchanged lines ...
```

####### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 203 unchanged lines ...
 
         // Collect escrow — ETH transfers to this contract
+        require(hasDecision[demandData.oracle][decisionKey], "NoDecision");
         INativeTokenEscrowObligation(escrowContract).collectEscrow(
             escrow,
 ... 54 unchanged lines ...
```

####### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 216 unchanged lines ...
 
         // Collect escrow — all assets transfer to this contract
+        require(hasDecision[demandData.oracle][decisionKey], "NoDecision");
         ITokenBundleEscrowObligation(escrowContract).collectEscrow(
             escrow,
 ... 89 unchanged lines ...
```

##### [Low] Missing ERC721 split validation in TokenBundleSplitter when escrow has zero ERC721s causes DoS of collectAndDistribute

###### Description

TokenBundleSplitter skips validating erc721Indices when the escrow bundle contains zero ERC721s, allowing malformed splits to be stored and later causing collectAndDistribute to revert due to out-of-bounds ERC721 indexing, temporarily DoSing atomic payout until the oracle overwrites the decision.

In TokenBundleSplitter._validateSplits, the ERC721 validation block is guarded by `if (numErc721 > 0)`. When an escrow bundle has zero ERC721 assets, no checks are performed on `erc721Indices`. As a result, `arbitrate()` accepts and stores decisions where splits contain non-empty `erc721Indices` despite there being no ERC721s in the escrow. During `collectAndDistribute`, the contract iterates these stored indices and attempts to access `escrowData.erc721Tokens[idx]` and `escrowData.erc721TokenIds[idx]`, which are zero-length arrays, causing an out-of-bounds revert. This atomically reverts the entire transaction (including escrow collection) and DoSes the validated, atomic payout flow until the oracle corrects the decision. Per the project’s expectations, only the unvalidated splitter may tolerate oracle-caused DoS or stranding; the validated splitter should have rejected such malformed splits at submission time.

###### Severity

**Impact Explanation:** [Medium] The bug causes a significant but temporary DoS of the validated, atomic collect-and-distribute flow for affected escrows until the oracle resubmits corrected splits.

**Likelihood Explanation:** [Low] Exploitation depends on a trusted oracle submitting malformed splits (non-empty erc721Indices for zero-ERC721 bundles), which fits a trusted-operator/integration error.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Non-tierable escrow without ERC721s: A valid fulfillment (refUID == escrow.uid) targets the splitter. The oracle submits splits with correct native/ERC20 totals but with a non-empty erc721Indices array. arbitrate() accepts the decision because ERC721 checks are skipped for zero-ERC721 bundles. When collectAndDistribute is called, distribution attempts to index into zero-length ERC721 arrays and reverts, DoSing atomic payout until the oracle overwrites the decision with empty erc721Indices.
#### Preconditions / Assumptions
- (a). Escrow created via TokenBundleEscrowObligation (non-tierable) with arbiter set to TokenBundleSplitter
- (b). Escrow bundle contains zero ERC721 assets
- (c). Demand encodes a trusted oracle address
- (d). A valid fulfillment exists (refUID == escrow.uid) with recipient = TokenBundleSplitter
- (e). Oracle submits splits with at least one non-empty erc721Indices array
- (f). Someone calls collectAndDistribute for this escrow

### Scenario 2.
Tierable escrow without ERC721s: A single fulfillment (reusable across escrows) targets the splitter. The oracle submits a malformed decision with non-empty erc721Indices. collectAndDistribute reverts on ERC721 distribution due to out-of-bounds indexing, blocking atomic payout for the affected escrow(s) until corrected splits are submitted.
#### Preconditions / Assumptions
- (a). Escrow created via TokenBundleEscrowObligation (tierable) with arbiter set to TokenBundleSplitter
- (b). Escrow bundle contains zero ERC721 assets
- (c). Demand encodes a trusted oracle address
- (d). A valid fulfillment exists (tierable semantics; recipient = TokenBundleSplitter)
- (e). Oracle submits splits with at least one non-empty erc721Indices array
- (f). Someone calls collectAndDistribute for this escrow

### Scenario 3.
Operational fallback risk: If someone bypasses collectAndDistribute and calls the escrow’s collectEscrow directly (decision exists), assets transfer to the splitter. ERC20/1155 can be moved via execute()-based calls, but native ETH held by the splitter cannot be forwarded without a successful collectAndDistribute call. This can leave ETH stuck at the splitter until the oracle corrects the decision, highlighting the importance of the validated, atomic flow.
#### Preconditions / Assumptions
- (a). A decision exists for an escrow with zero ERC721 assets that includes non-empty erc721Indices
- (b). An actor bypasses collectAndDistribute and calls the escrow’s collectEscrow directly, transferring assets to the splitter
- (c). Attempted manual distribution via execute() for ERC20/1155; native ETH cannot be forwarded without a successful collectAndDistribute

###### Proposed fix

####### TokenBundleSplitter.sol

File: `contracts/src/utils/splitters/TokenBundleSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitter.sol)

```diff
 ... 104 unchanged lines ...
         // --- ERC721 assignments (each must appear exactly once) ---
         uint256 numErc721 = escrowData.erc721Tokens.length;
-        if (numErc721 > 0) {
-            bool[] memory assigned = new bool[](numErc721);
-            for (uint256 s; s < numSplits; ++s) {
-                for (uint256 i; i < splits[s].erc721Indices.length; ++i) {
-                    uint256 idx = splits[s].erc721Indices[i];
-                    if (idx >= numErc721)
-                        revert InvalidERC721Index(idx, numErc721);
-                    if (assigned[idx])
-                        revert DuplicateERC721Assignment(idx);
-                    assigned[idx] = true;
-                }
+        bool[] memory assigned = new bool[](numErc721);
+        for (uint256 s; s < numSplits; ++s) {
+            for (uint256 i; i < splits[s].erc721Indices.length; ++i) {
+                uint256 idx = splits[s].erc721Indices[i];
+                if (idx >= numErc721)
+                    revert InvalidERC721Index(idx, numErc721);
+                if (assigned[idx])
+                    revert DuplicateERC721Assignment(idx);
+                assigned[idx] = true;
             }
-            for (uint256 t; t < numErc721; ++t) {
-                if (!assigned[t]) revert MissingERC721Assignment(t);
-            }
         }
+        for (uint256 t; t < numErc721; ++t) {
+            if (!assigned[t]) revert MissingERC721Assignment(t);
+        }
 
         // --- ERC1155 totals ---
 ... 23 unchanged lines ...
```

##### [Medium] msg.sender-based oracle authorization + public self-call in splitters with oracle==splitter causes theft of escrowed assets

###### Description

All splitter arbiters authorize oracle decisions by msg.sender and expose a public execute() that can self-call, letting anyone store decisions as if from the splitter. If an escrow’s demand encodes oracle equal to the splitter address, the forged decision is trusted in checkObligation(), allowing permissionless collection and direct theft of escrowed assets.

In the splitter contracts (ERC20Splitter, ERC1155Splitter, NativeTokenSplitter, TokenBundleSplitter and TokenBundleSplitterUnvalidated), arbitrate() stores decisions under decisions[msg.sender][decisionKey] and sets hasDecision[msg.sender][decisionKey] = true. The contracts also expose a public execute(target, data) function that allows arbitrary calls; when target == address(this), arbitrate() runs with msg.sender == address(this). At validation time, checkObligation() decodes demand to obtain DemandData.oracle and returns hasDecision[demandData.oracle][decisionKey]. If an escrow is configured with DemandData.oracle equal to the splitter address, the forged decision made via self-call will be accepted. Collection functions on the escrow obligations are permissionless and, once checkObligation() passes, will release escrowed assets directly to fulfillment.recipient (for ERC20/ETH/1155/token bundles). The fulfillment attestation schema is not verified by these arbiters/escrows; non-tierable escrows only require fulfillment.refUID == escrow.uid, while tierable escrows do not even require refUID linkage. Decisions are mutable (last write wins), enabling attackers to overwrite legitimate oracle decisions just before collection. This combination enables end-to-end theft of user escrowed assets whenever the oracle address is misconfigured to the splitter address.

###### Severity

**Impact Explanation:** [High] Exploitation enables direct, material loss of principal escrowed funds (ERC20, ETH, ERC1155, and bundles) by releasing assets to the attacker.

**Likelihood Explanation:** [Low] The exploit relies on an integration/UI misconfiguration where demand.oracle is set to the splitter contract address. This is plausible but not the default configuration; once present, exploitation is trivial.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
ERC20: A buyer creates an ERC20 escrow with arbiter set to ERC20Splitter and demand.oracle set to the same splitter address. The attacker self-calls arbitrate() via execute(address(this), ...) to store a forged decision under the splitter’s address, then creates a fulfillment attestation with refUID=escrowUid and recipient=attacker. Calling collectEscrow releases the full ERC20 amount directly to the attacker.
#### Preconditions / Assumptions
- (a). Escrow is created with arbiter = ERC20Splitter contract address
- (b). Escrow demand encodes DemandData.oracle = ERC20Splitter contract address (misconfiguration in UI/integration)
- (c). Escrow is funded with the intended ERC20 and amount
- (d). Attacker can read escrow attestation to learn token and amount
- (e). Attacker can call ERC20Splitter.execute(address(this), abi.encodeCall(arbitrate,...)) to store a forged decision under the splitter’s address
- (f). For non-tierable escrow: attacker’s fulfillment attestation sets refUID = escrowUid; for tierable, refUID linkage not required
- (g). Fulfillment attestation recipient is the attacker’s address

### Scenario 2.
Native ETH: A buyer creates a NativeToken escrow with arbiter set to NativeTokenSplitter and demand.oracle set to the same splitter address. The attacker self-calls arbitrate() to forge a decision, then creates a fulfillment attestation with refUID=escrowUid and recipient=attacker. Calling collectEscrow releases the full ETH amount directly to the attacker.
#### Preconditions / Assumptions
- (a). Escrow is created with arbiter = NativeTokenSplitter contract address
- (b). Escrow demand encodes DemandData.oracle = NativeTokenSplitter contract address (misconfiguration in UI/integration)
- (c). Escrow is funded with ETH amount
- (d). Attacker can read escrow attestation to learn amount
- (e). Attacker can call NativeTokenSplitter.execute(address(this), abi.encodeCall(arbitrate,...)) to store a forged decision under the splitter’s address
- (f). For non-tierable escrow: attacker’s fulfillment attestation sets refUID = escrowUid; for tierable, refUID linkage not required
- (g). Fulfillment attestation recipient is the attacker’s address

### Scenario 3.
Token bundle: A buyer creates a TokenBundle escrow with arbiter set to TokenBundleSplitter (or Unvalidated) and demand.oracle set to that splitter address. The attacker self-calls arbitrate() to forge valid splits (or any non-empty splits for Unvalidated), then creates a fulfillment attestation with refUID=escrowUid and recipient=attacker. Calling collectEscrow releases all bundle assets directly to the attacker.
#### Preconditions / Assumptions
- (a). Escrow is created with arbiter = TokenBundleSplitter (or Unvalidated) contract address
- (b). Escrow demand encodes DemandData.oracle = the same TokenBundleSplitter contract address (misconfiguration in UI/integration)
- (c). Escrow is funded with the specified bundle (ETH/ERC20/721/1155)
- (d). Attacker can read escrow attestation to learn bundle contents
- (e). Attacker can call TokenBundleSplitter.execute(address(this), abi.encodeCall(arbitrate,...)) to store a forged decision under the splitter’s address; for validated splitter, totals/assignments must match; for Unvalidated, any non-empty zero-free splits
- (f). For non-tierable escrow: attacker’s fulfillment attestation sets refUID = escrowUid; for tierable, refUID linkage not required
- (g). Fulfillment attestation recipient is the attacker’s address

###### Proposed fix

####### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 93 unchanged lines ...
         Split[] calldata splits
     ) external {
+        require(msg.sender != address(this), "OracleCannotBeSplitter");
         // Read escrow attestation to get token and total amount
         Attestation memory escrow = eas.getAttestation(obligation);
 ... 69 unchanged lines ...
         bytes calldata data
     ) external returns (bytes memory) {
+        require(target != address(this), "SelfCallBlocked");
         _currentExecutor = msg.sender;
         (bool success, bytes memory result) = target.call(data);
 ... 91 unchanged lines ...
```

####### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 94 unchanged lines ...
         Split[] calldata splits
     ) external {
+        require(msg.sender != address(this), "OracleCannotBeSplitter");
         Attestation memory escrow = eas.getAttestation(obligation);
         EscrowObligationData memory escrowData = abi.decode(
 ... 68 unchanged lines ...
         bytes calldata data
     ) external returns (bytes memory) {
+        require(target != address(this), "SelfCallBlocked");
         _currentExecutor = msg.sender;
         (bool success, bytes memory result) = target.call(data);
 ... 94 unchanged lines ...
```

####### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 89 unchanged lines ...
         Split[] calldata splits
     ) external {
+        require(msg.sender != address(this), "OracleCannotBeSplitter");
         Attestation memory escrow = eas.getAttestation(obligation);
         EscrowObligationData memory escrowData = abi.decode(
 ... 69 unchanged lines ...
         bytes calldata data
     ) external payable returns (bytes memory) {
+        require(target != address(this), "SelfCallBlocked");
         _currentExecutor = msg.sender;
         (bool success, bytes memory result) = target.call{value: msg.value}(
 ... 95 unchanged lines ...
```

####### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 178 unchanged lines ...
         bytes calldata data
     ) external payable returns (bytes memory) {
+        require(target != address(this), "SelfCallBlocked");
         _currentExecutor = msg.sender;
         (bool success, bytes memory result) = target.call{value: msg.value}(
 ... 127 unchanged lines ...
```

####### TokenBundleSplitter.sol

File: `contracts/src/utils/splitters/TokenBundleSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitter.sol)

```diff
 ... 43 unchanged lines ...
         BundleSplit[] calldata splits
     ) external override {
+        require(msg.sender != address(this), "OracleCannotBeSplitter");
         Attestation memory escrow = eas.getAttestation(obligation);
         EscrowObligationData memory escrowData = abi.decode(
 ... 100 unchanged lines ...
```

####### TokenBundleSplitterUnvalidated.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterUnvalidated.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitterUnvalidated.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {Attestation} from "@eas/Common.sol";
 import {IEAS} from "@eas/IEAS.sol";
 import {TokenBundleSplitterBase} from "./TokenBundleSplitterBase.sol";
 
 /// @notice Token bundle splitter without validation of split totals.
 ///         Cheaper oracle calls, but incorrect splits will only surface
 ///         as reverts during collectAndDistribute (over-allocation) or
 ///         stranded tokens in the splitter (under-allocation).
 contract TokenBundleSplitterUnvalidated is TokenBundleSplitterBase {
     constructor(IEAS _eas) TokenBundleSplitterBase(_eas) {}
 
     /// @notice Oracle submits a split decision without validation.
     ///         Only checks for empty splits and zero-address recipients.
     function arbitrate(
         bytes32 obligation,
         BundleSplit[] calldata splits
     ) external override {
+        require(msg.sender != address(this), "OracleCannotBeSplitter");
         Attestation memory escrow = eas.getAttestation(obligation);
         EscrowObligationData memory escrowData = abi.decode(
             escrow.data,
             (EscrowObligationData)
         );
 
         bytes32 decisionKey = keccak256(
             abi.encodePacked(obligation, escrowData.demand)
         );
 
         _storeDecision(msg.sender, decisionKey, splits);
 
         emit ArbitrationMade(decisionKey, obligation, msg.sender);
     }
 }
```

##### [Medium] Decision-key mismatch in splitter arbiters under logical composition causes escrow DoS and misrouted payouts

###### Description

Splitter arbiters store oracle decisions keyed by (escrowUID, top-level demand) in arbitrate(), but check using (escrowUID, child sub-demand) in checkObligation(). Under AllArbiter/AnyArbiter composition, the demand bytes differ, so the splitter branch never observes its own decision. This bricks AllArbiter escrows and disables the splitter branch under AnyArbiter. Additionally, splitters’ collectAndDistribute() reverts when the top-level arbiter is logical due to decoding the top-level demand as the splitter’s own DemandData.

All splitter arbiters (ERC20Splitter, ERC1155Splitter, NativeTokenSplitter, TokenBundleSplitter, TokenBundleSplitterUnvalidated) derive a storage key for oracle decisions in arbitrate() as keccak256(escrowUID, escrowData.demand), where escrowData.demand is the escrow’s full top-level demand bytes. Later, checkObligation() looks up decisions using keccak256(fulfilling, demandPassedToChild), where demandPassedToChild is the sub-demand forwarded by a logical arbiter (AllArbiter/AnyArbiter). Because the child sub-demand differs from the top-level demand, keys never match under composition: the splitter branch always returns false. In AllArbiter this causes collection to revert (DoS); in AnyArbiter it silently disables the splitter branch and allows other branches to pass. Separately, splitters’ collectAndDistribute() decode the escrow’s top-level demand as the splitter’s DemandData, which reverts if the top-level arbiter is logical, preventing the atomic split path in composed setups.

###### Severity

**Impact Explanation:** [High] In the worst case (non-expiring escrow under AllArbiter), principal funds are frozen indefinitely; in other cases, there is significant availability loss or misrouted payouts versus intended splitting.

**Likelihood Explanation:** [Medium] Exploitation requires specific but plausible configurations (using logical arbiters with a splitter child). No attacker, special timing, or capital is needed, but these compositions are not universal defaults.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
AllArbiter + ERC20Splitter with non-expiring escrow: buyer configures AllArbiter with a splitter child and another condition; the splitter oracle submits splits. On collection, AllArbiter calls the splitter with the child sub-demand; the splitter’s lookup key (escrowUID, sub-demand) does not match the stored key (escrowUID, top-level demand), so the splitter returns false, AllArbiter fails, and collection reverts permanently. Splitter collectAndDistribute also reverts due to decoding the top-level demand as splitter.DemandData.
#### Preconditions / Assumptions
- (a). Escrow configured with AllArbiter as top-level arbiter and a splitter as one child
- (b). Escrow expirationTime = 0 (non-expiring)
- (c). Splitter DemandData encodes a trusted oracle that posts a decision via arbitrate()
- (d). A valid fulfillment attestation exists
- (e). Standard token behavior and trusted admin/oracle per assumptions

### Scenario 2.
AllArbiter + ERC20Splitter with expiring escrow: same configuration as above but with a finite expirationTime. Collection reverts until expiry; only after expiration can the buyer reclaim funds via reclaimExpired().
#### Preconditions / Assumptions
- (a). Escrow configured with AllArbiter as top-level arbiter and a splitter as one child
- (b). Escrow has a finite expirationTime > 0
- (c). Splitter DemandData encodes a trusted oracle that posts a decision via arbitrate()
- (d). A valid fulfillment attestation exists
- (e). Standard token behavior and trusted admin/oracle per assumptions

### Scenario 3.
AnyArbiter + ERC20Splitter with a permissive child (e.g., a trivially-true arbiter): splitter branch always fails the check due to the key mismatch, but AnyArbiter still returns true via the permissive child. Direct collectEscrow transfers the full amount to fulfillment.recipient (no splitting). Splitter collectAndDistribute reverts due to demand decoding.
#### Preconditions / Assumptions
- (a). Escrow configured with AnyArbiter as top-level arbiter with a splitter child and a permissive child that returns true
- (b). Splitter DemandData encodes a trusted oracle that posts a decision via arbitrate()
- (c). A valid fulfillment attestation exists
- (d). Standard token behavior and trusted admin/oracle per assumptions

###### Proposed fix

####### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 149 unchanged lines ...
     ) public view override returns (bool) {
         DemandData memory demandData = abi.decode(demand, (DemandData));
-        bytes32 decisionKey = keccak256(
-            abi.encodePacked(fulfilling, demand)
-        );
+        bytes32 decisionKey = keccak256(abi.encodePacked(
+            fulfilling,
+            abi.decode(eas.getAttestation(fulfilling).data, (EscrowObligationData)).demand
+        ));
         return hasDecision[demandData.oracle][decisionKey];
     }
 ... 38 unchanged lines ...
             (EscrowObligationData)
         );
+        // NOTE: For composed escrows under logical arbiters, prefer a WithDemand variant that accepts the child sub-demand to select the oracle.
         DemandData memory demandData = abi.decode(
             escrowData.demand,
 ... 63 unchanged lines ...
```

####### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 149 unchanged lines ...
     ) public view override returns (bool) {
         DemandData memory demandData = abi.decode(demand, (DemandData));
-        bytes32 decisionKey = keccak256(
-            abi.encodePacked(fulfilling, demand)
-        );
+        bytes32 decisionKey = keccak256(abi.encodePacked(
+            fulfilling,
+            abi.decode(eas.getAttestation(fulfilling).data, (EscrowObligationData)).demand
+        ));
         return hasDecision[demandData.oracle][decisionKey];
     }
 ... 37 unchanged lines ...
             (EscrowObligationData)
         );
+        // NOTE: For composed escrows under logical arbiters, prefer a WithDemand variant that accepts the child sub-demand to select the oracle.
         DemandData memory demandData = abi.decode(
             escrowData.demand,
 ... 67 unchanged lines ...
```

####### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 144 unchanged lines ...
     ) public view override returns (bool) {
         DemandData memory demandData = abi.decode(demand, (DemandData));
-        bytes32 decisionKey = keccak256(
-            abi.encodePacked(fulfilling, demand)
-        );
+        bytes32 decisionKey = keccak256(abi.encodePacked(
+            fulfilling,
+            abi.decode(eas.getAttestation(fulfilling).data, (EscrowObligationData)).demand
+        ));
         return hasDecision[demandData.oracle][decisionKey];
     }
 ... 40 unchanged lines ...
             (EscrowObligationData)
         );
+        // NOTE: For composed escrows under logical arbiters, prefer a WithDemand variant that accepts the child sub-demand to select the oracle.
         DemandData memory demandData = abi.decode(
             escrowData.demand,
 ... 66 unchanged lines ...
```

####### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 162 unchanged lines ...
     ) public view override returns (bool) {
         DemandData memory demandData = abi.decode(demand, (DemandData));
-        bytes32 decisionKey = keccak256(
-            abi.encodePacked(fulfilling, demand)
-        );
+        bytes32 decisionKey = keccak256(abi.encodePacked(
+            fulfilling,
+            abi.decode(eas.getAttestation(fulfilling).data, (EscrowObligationData)).demand
+        ));
         return hasDecision[demandData.oracle][decisionKey];
     }
 ... 35 unchanged lines ...
             (EscrowObligationData)
         );
+        // NOTE: For composed escrows under logical arbiters, prefer a WithDemand variant that accepts the child sub-demand to select the oracle.
         DemandData memory demandData = abi.decode(
             escrowData.demand,
 ... 101 unchanged lines ...
```

##### [Medium] Missing self-recipient guard in splitter arbitration/storage causes theft or lock of escrowed assets

###### Description

Splitters accept splits where recipient == address(this); distribution then performs self-transfers that leave assets on the splitter. Because execute() is permissionless, anyone can later drain ERC20/721/1155 left on the splitter, while ETH becomes permanently stuck.

All splitter variants (ERC20Splitter, ERC1155Splitter, NativeTokenSplitter, and TokenBundleSplitter via TokenBundleSplitterBase) only reject zero-address recipients when storing oracle-provided splits and do not forbid recipient == address(this). During collectAndDistribute(), escrows are collected so assets are transferred into the splitter, then the splitter distributes per the stored splits. For self-recipient entries, standard ERC20/721/1155 self-transfers succeed but are no-ops, leaving balances on the splitter; ETH sent to the splitter also remains there. The splitters expose a permissionless execute() that allows arbitrary external calls from the splitter’s address, enabling anyone to transfer out ERC20/721/1155 stranded on the splitter. ETH cannot be drained this way and remains stuck. Only the configured oracle’s decisions are used (decisions are keyed by oracle), so exploitation requires an oracle/integration mistake or misconfiguration that includes the splitter’s address in a split entry. This violates the intended invariant that splitters should not custody value outside atomic flows and leads to theft (ERC20/721/1155) or permanent lock (ETH).

###### Severity

**Impact Explanation:** [High] Direct theft of principal ERC20/721/1155 funds or permanent freezing of ETH, and violation of the invariant that splitters must not custody value outside atomic flows.

**Likelihood Explanation:** [Low] Exploitation requires an oracle/integration mistake or UI misconfiguration to include the splitter’s address as a recipient; only that oracle’s decisions are used, and there is no attacker-only path to inject decisions.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
ERC20 theft: A valid ERC20 escrow is created. The trusted oracle mistakenly arbitrates splits summing to the escrow amount with one split recipient set to the ERC20Splitter address. CollectAndDistribute collects tokens into the splitter and executes distribution; the self-recipient safeTransfer is a no-op, leaving X tokens on the splitter. A third party later calls execute() to invoke token.transfer(attacker, X) and steals the tokens.
#### Preconditions / Assumptions
- (a). Only the configured oracle’s decisions are honored; decisions are keyed by oracle address
- (b). Trusted oracle/integration makes a mistake or UI misconfiguration leads to including address(this) in a split
- (c). Splits sum exactly to the escrowed ERC20 amount so arbitrate passes
- (d). Fulfillment recipient is the splitter, so collectEscrow transfers tokens into the splitter
- (e). ERC20 behaves per standard semantics; transfer to self succeeds and leaves balance unchanged
- (f). ERC20Splitter.execute() is permissionless and can call token.transfer as the splitter

### Scenario 2.
ERC721 theft in validated TokenBundleSplitter: A bundle escrow includes an ERC721. The oracle submits validated splits assigning that NFT to recipient == address(TokenBundleSplitter). After collection, the distribution calls transferFrom(address(this), address(this), tokenId), a no-op. Anyone then calls execute() to transferFrom the NFT from the splitter to themselves, stealing it.
#### Preconditions / Assumptions
- (a). Only the configured oracle’s decisions are honored; decisions are keyed by oracle address
- (b). Trusted oracle/integration makes a mistake or UI misconfiguration leads to including address(this) in a split
- (c). TokenBundleSplitter validations pass (totals and ERC721 assignment) despite the self-recipient
- (d). Fulfillment recipient is the splitter, so the NFT is transferred into the splitter
- (e). ERC721 standard allows transferFrom to self (no-op), leaving the NFT owned by the splitter
- (f). TokenBundleSplitter.execute() is permissionless and can call transferFrom as the splitter

### Scenario 3.
ETH permanently stuck in NativeTokenSplitter: A native token escrow exists. The oracle submits splits summing to the escrowed ETH amount with one self-recipient entry. After collection, distribution calls payable(address(this)).call{value:X}(""); ETH remains on the splitter. There is no function to withdraw existing ETH; execute() only forwards msg.value, so the ETH is stuck indefinitely.
#### Preconditions / Assumptions
- (a). Only the configured oracle’s decisions are honored; decisions are keyed by oracle address
- (b). Trusted oracle/integration makes a mistake or UI misconfiguration leads to including address(this) in a split
- (c). Splits sum exactly to the escrowed ETH amount so arbitrate passes
- (d). Fulfillment recipient is the splitter, so ETH is transferred into the splitter
- (e). NativeTokenSplitter has a receive() function; sending ETH to self succeeds and retains ETH
- (f). No withdrawal path exists for existing ETH; execute() cannot drain the contract’s ETH balance

###### Proposed fix

####### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 66 unchanged lines ...
     error EmptySplits();
     error ZeroRecipient();
+    error SelfRecipientNotAllowed();
     error ExecuteFailed(address target, bytes data);
 
 ... 147 unchanged lines ...
                 recipient = msg.sender;
             }
+            if (recipient == address(this)) revert SelfRecipientNotAllowed();
             IERC20(escrowData.token).safeTransfer(
                 recipient,
 ... 40 unchanged lines ...
```

####### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 67 unchanged lines ...
     error EmptySplits();
     error ZeroRecipient();
+    error SelfRecipientNotAllowed();
     error ExecuteFailed(address target, bytes data);
 
 ... 145 unchanged lines ...
                 recipient = msg.sender;
             }
+            if (recipient == address(this)) revert SelfRecipientNotAllowed();
             IERC1155(escrowData.token).safeTransferFrom(
                 address(this),
 ... 44 unchanged lines ...
```

####### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 61 unchanged lines ...
     error EmptySplits();
     error ZeroRecipient();
+    error SelfRecipientNotAllowed();
     error ExecuteFailed(address target, bytes data);
     error NativeTokenTransferFailed(address to, uint256 amount);
 ... 149 unchanged lines ...
                 recipient = msg.sender;
             }
+            if (recipient == address(this)) revert SelfRecipientNotAllowed();
             (bool success, ) = payable(recipient).call{
                 value: splits[i].amount
 ... 43 unchanged lines ...
```

####### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 79 unchanged lines ...
     error ZeroRecipient();
     error ExecuteFailed(address target, bytes data);
+    error SelfRecipientNotAllowed();
     error NativeTokenTransferFailed(address to, uint256 amount);
 
 ... 144 unchanged lines ...
                 recipient = msg.sender;
             }
+            if (recipient == address(this)) revert SelfRecipientNotAllowed();
 
             // Native tokens
 ... 78 unchanged lines ...
```

### 7. [Medium] Unconditional payable receive() in NativeTokenEscrowObligation causes permanent loss of unsolicited ETH

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Both tierable and non-tierable NativeTokenEscrowObligation contracts accept plain ETH transfers via an empty receive() and lack any sweep/withdraw mechanism, so ETH sent outside escrow flows becomes permanently stuck.

The NativeTokenEscrowObligation contracts (tierable and non-tierable) implement receive() external payable override that unconditionally accepts ETH. Escrow creation strictly enforces msg.value == amount in _lockEscrow, and _releaseEscrow returns exactly that amount to the fulfiller or back to the buyer on expiry. There is no per-escrow accounting and no sweep/withdraw/recover function. Therefore, any ETH sent directly to the contract address (not through the escrow functions) is not associated with any escrow and is never released, resulting in permanent loss for the sender.

#### Severity

**Impact Explanation:** [High] Affected users’ principal funds sent via plain transfer are frozen indefinitely with no recovery path, constituting a direct material loss of funds.

**Likelihood Explanation:** [Low] Exploitation requires an integration to behave incorrectly (construct a raw ETH transfer without calldata) rather than normal user behavior.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
A dApp integration mistakenly sends ETH via plain transfer to the NativeTokenEscrowObligation contract address instead of calling doObligation()/doObligationFor(), causing the ETH to be accepted by receive() and permanently stranded since no escrow is created and no sweep function exists.
#### Preconditions / Assumptions
- (a). An application integrates with the escrow contract and is intended to call doObligation()/doObligationFor().
- (b). Due to an integration bug or misconfiguration, the app constructs a raw ETH transfer (empty calldata) to the contract address.
- (c). The contract has an empty receive() external payable override that accepts ETH.
- (d). The contract has no sweep/withdraw/recover method.
- (e). Users rely on the integration’s transaction construction.

#### Proposed fix

##### NativeTokenEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/NativeTokenEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/NativeTokenEscrowObligation.sol)

```diff
 ... 145 unchanged lines ...
     }
 
-    // Allow contract to receive native tokens
-    receive() external payable override {}
 }
```

##### NativeTokenEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/NativeTokenEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/NativeTokenEscrowObligation.sol)

```diff
 ... 145 unchanged lines ...
     }
 
-    // Allow contract to receive native tokens
-    receive() external payable override {}
 }
```

#### Related findings

##### [Medium] Payable receive without withdrawal in TokenBundlePaymentObligation causes permanent freezing of ETH sent directly

###### Description

TokenBundlePaymentObligation accepts ETH via a payable receive() but provides no withdrawal or utilization path for ETH held at the contract address, causing any directly sent ETH to be permanently stuck.

The TokenBundlePaymentObligation contract implements a payable receive() that accepts plain ETH transfers. The contract and its base classes provide no sweep/withdraw/recovery function and never reference address(this).balance. All native token handling in _beforeAttest is sourced exclusively from the current call’s msg.value (forwarding obligationData.nativeAmount to the payee and refunding any excess back to the payer), which ignores any previously accumulated balance. Therefore, ETH sent directly to the contract (e.g., by an integration misrouting value) becomes permanently frozen with no workaround. EAS-related flows pass value 0 and do not affect this behavior.

###### Severity

**Impact Explanation:** [High] ETH sent directly to the contract is permanently frozen with no workaround, meeting the criterion for high impact due to funds being blocked indefinitely.

**Likelihood Explanation:** [Low] Exploitation requires an integration or aggregator misconfiguration/bug that misroutes ETH, which is unlikely under competent operator assumptions.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
An external integration/router/aggregator misroutes ETH to TokenBundlePaymentObligation via a plain transfer (no calldata), the transfer succeeds due to receive(), and the ETH becomes permanently stuck since the contract does not use or withdraw address-held balances.
#### Preconditions / Assumptions
- (a). TokenBundlePaymentObligation is deployed with a payable receive() and no withdrawal/sweep function
- (b). The integration/router/aggregator has a bug or misconfiguration that sends ETH directly to the contract address (no calldata)
- (c). The contract’s logic only uses msg.value per call and does not access address(this).balance

### Scenario 2.
A multicall batch is composed incorrectly by an aggregator so that a value-bearing step targets TokenBundlePaymentObligation without invoking doObligation; the ETH is accepted by receive() and remains unrecoverable because subsequent calls only use msg.value and no withdrawal function exists.
#### Preconditions / Assumptions
- (a). TokenBundlePaymentObligation is deployed with a payable receive() and no withdrawal/sweep function
- (b). An aggregator composes a multicall where a value-bearing step targets the contract address without calling doObligation
- (c). Subsequent calls do not retrieve previously sent ETH and the contract does not expose any recovery function

###### Proposed fix

####### TokenBundlePaymentObligation.sol

File: `contracts/src/obligations/payment/TokenBundlePaymentObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/payment/TokenBundlePaymentObligation.sol)

```diff
 ... 283 unchanged lines ...
     }
 
-    // Allow contract to receive native tokens (for refunds)
-    receive() external payable override {}
 }
```

### 8. [Medium] Unguarded validation attestation minting in AttestationEscrowObligation2 (non-tierable and tierable) causes forgeable validation signals and potential unauthorized access

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Both AttestationEscrowObligation2 variants let any user drive an escrow/fulfillment flow that unconditionally mints a permanent, non-revocable VALIDATION_SCHEMA attestation referencing an arbitrary UID. Minimal arbiter checks (or TrivialArbiter) and no asset lock or authorization allow public minting of “validation” attestations that integrators may misinterpret as trusted approvals.

AttestationEscrowObligation2 (non-tierable and tierable) exposes public doObligation/doObligationRaw to mint escrow and fulfillment attestations under the contract’s ATTESTATION_SCHEMA without asset locking. The arbiter and demand are chosen by the escrow creator. Using this contract itself as arbiter (which only checks schema/intrinsics and equality of data) or TrivialArbiter (always true), an attacker can self-mint a matching fulfillment that passes collectEscrow. On collection, _releaseEscrow always mints a permanent, non-revocable VALIDATION_SCHEMA attestation with refUID set to the attacker-chosen attestationUid and data encoding that UID, without verifying existence or provenance. The non-tierable variant requires fulfillment.refUID == escrow.uid (satisfiable via doObligationRaw); the tierable variant removes this linkage, enabling reuse of a single fulfillment across many escrows. If downstream systems treat these VALIDATION_SCHEMA attestations as authoritative validations, attackers can forge trust signals and potentially obtain unauthorized access or benefits.

#### Severity

**Impact Explanation:** [High] If integrators rely on these validation attestations for authorization or asset release, attackers can obtain direct, material fund or privilege access.

**Likelihood Explanation:** [Low] Exploitation depends on external integrators adopting an unsafe pattern (trusting this contract’s VALIDATION_SCHEMA without verifying provenance or context), a nontrivial external precondition.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Unauthorized on-chain access: Attacker creates an escrow (arbiter = AttestationEscrowObligation2, attestationUid = target T), self-mints a matching fulfillment with refUID = escrow UID via doObligationRaw, then calls collectEscrow to mint a permanent, non-revocable VALIDATION_SCHEMA attestation (recipient = attacker, refUID = T). An on-chain integrator that authorizes based on this validation grants access or releases funds to the attacker.
#### Preconditions / Assumptions
- (a). An on-chain integrator trusts VALIDATION_SCHEMA attestations from this contract as sufficient authorization or fund-release signals.
- (b). The integrator does not additionally verify provenance of refUID (e.g., trusted attester registry, existence checks, or end-to-end authorization linkage).
- (c). Attacker has public access to AttestationEscrowObligation2 functions and EAS.

### Scenario 2.
Off-chain KYC/eligibility forgery: Attacker targets a UID U (e.g., a KYC/eligibility attestation) and repeats the above flow to mint a permanent VALIDATION_SCHEMA attestation referencing U and recipient = attacker. An off-chain integrator relying on this signal incorrectly grants access/eligibility.
#### Preconditions / Assumptions
- (a). An off-chain integrator accepts VALIDATION_SCHEMA attestations from this contract as authoritative validation of the referenced UID.
- (b). The integrator does not verify the refUID’s attester/provenance or execution context beyond the presence of the validation attestation.
- (c). Attacker has public access to AttestationEscrowObligation2 functions and EAS.

### Scenario 3.
Mass validation spam (tierable + TrivialArbiter): Attacker reuses a single arbitrary fulfillment across many escrows (arbiter = TrivialArbiter, various attestationUid values Ti) to mass-mint permanent VALIDATION_SCHEMA attestations referencing Ti. Observers relying on these signals experience trust dilution or widespread unauthorized access if used for gating.
#### Preconditions / Assumptions
- (a). Tierable AttestationEscrowObligation2 is deployed and accessible.
- (b). An integrator or observer treats the VALIDATION_SCHEMA attestation as a meaningful trust signal without deeper verification.
- (c). Attacker can select TrivialArbiter or similarly permissive arbiter to bypass substantive checks.

#### Proposed fix

##### AttestationEscrowObligation2.sol

File: `contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation2.sol)

```diff
 ... 62 unchanged lines ...
         );
 
+        // SECURITY: Before minting a validation attestation, enforce trusted-arbiter gating:
+        // - Require decoded.arbiter is whitelisted and not address(this).
+        // - Fetch fulfillment via eas.getAttestation(fulfillmentUid) and require fulfillment.attester == decoded.arbiter.
+        // - Require eas.getAttestation(decoded.attestationUid) exists (non-zero / not missing).
+        // - Consider making validation revocable and encoding context (validatedAttestationUid, arbiter, fulfillmentUid, keccak256(demand)) in data
+        //   so integrators can verify provenance and demand binding.
+
         // Create validation attestation
         bytes32 validationUid = eas.attest(
 ... 92 unchanged lines ...
```

##### AttestationEscrowObligation2.sol

File: `contracts/src/obligations/escrow/tierable/AttestationEscrowObligation2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/AttestationEscrowObligation2.sol)

```diff
 ... 62 unchanged lines ...
         );
 
+        // SECURITY: Before minting a validation attestation, enforce trusted-arbiter gating:
+        // - Require decoded.arbiter is whitelisted and not address(this).
+        // - Fetch fulfillment via eas.getAttestation(fulfillmentUid) and require fulfillment.attester == decoded.arbiter.
+        // - Require eas.getAttestation(decoded.attestationUid) exists (non-zero / not missing).
+        // - Consider making validation revocable and encoding context (validatedAttestationUid, arbiter, fulfillmentUid, keccak256(demand)) in data
+        //   so integrators can verify provenance and demand binding.
+
         // Create validation attestation
         bytes32 validationUid = eas.attest(
 ... 92 unchanged lines ...
```

#### Related findings

##### [Medium] Permissionless arbitrary attestation release in AttestationEscrowObligation contracts causes unauthorized attestations from contract address

###### Description

Both AttestationEscrowObligation variants allow anyone to create an escrow with no locked assets and, via an easily satisfiable arbiter, force the contract to call EAS.attest with fully user-specified parameters. The attester of the new attestation is this contract. If an external schema resolver or consumer treats this contract as a trusted attester, attackers can mint attestations “from” this contract to bypass allowlists or access controls.

AttestationEscrowObligation (tierable and non-tierable) implements _lockEscrow as a no-op, so escrows are publicly creatable without locking assets. During collectEscrow, the contract only verifies intrinsic escrow validity and arbiter approval. With a trivial arbiter, any fulfillment passes (non-tierable additionally requires refUID == escrow.uid; tierable omits this link). In _releaseEscrow, the contract decodes the escrow’s ObligationData and directly calls eas.attest using the fully user-supplied AttestationRequest, ignoring the fulfiller and fulfillment. Since EAS uses msg.sender as attester, the resulting attestation’s attester is this contract. If an EAS schema’s resolver accepts this contract as attester (and allows zero-value requests), or if consumers rely on attester == this contract, an attacker can mint arbitrary attestations from this contract to themselves and bypass allowlists, claims, or other gates. Even when the arbiter is set to this same contract, an attacker can use the public doObligationRaw (with no lock) to mint matching fulfillments under the contract’s own schema and satisfy the arbiter’s checks.

###### Severity

**Impact Explanation:** [High] If a trusted schema or consumer relies on attestations from this contract, attackers can mint such attestations to themselves and bypass allowlists or claim tokens, causing direct, material loss of principal assets.

**Likelihood Explanation:** [Low] Exploitation requires external misconfiguration: a schema resolver or consumer must whitelist or trust this contract as attester and accept zero-value attestations; these admin/integration choices are outside the attacker’s control and multiplicative.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
An attacker uses TrivialArbiter and a crafted escrow in AttestationEscrowObligation to mint an EAS attestation under a schema S that trusts this contract as attester, then uses it to bypass an on-chain allowlist and claim tokens.
#### Preconditions / Assumptions
- (a). An EAS schema S’s resolver whitelists this contract as an allowed attester or imposes no restrictions on this contract’s attestations.
- (b). The consumer (e.g., claim/airdrop contract) grants privileges based on attester == this contract for schema S.
- (c). Schema S’s resolver accepts zero-value attestations (AttestationRequest.data.value == 0).
- (d). A trivial arbiter (e.g., TrivialArbiter) is available or deployed by the attacker.
- (e). Attacker can create a fulfillment that satisfies the collector checks (non-tierable: refUID == escrow uid; tierable: no link required).

### Scenario 2.
An attacker mints a “KYC/compliance” attestation from this contract address (under a trusted schema S) and leverages it to access restricted monetary actions (e.g., sales, airdrops).
#### Preconditions / Assumptions
- (a). An EAS schema S for KYC/compliance allows attestations from this contract (resolver whitelists or is permissive).
- (b). Downstream consumers rely on attester == this contract for KYC/compliance on schema S and grant monetary privileges.
- (c). Schema S’s resolver accepts zero-value attestations.
- (d). A trivial arbiter is available to pass collectEscrow checks.
- (e). Attacker can create a suitable fulfillment (non-tierable: refUID link; tierable: no link).

### Scenario 3.
Even when the arbiter is set to the same AttestationEscrowObligation contract, an attacker uses doObligationRaw to produce a matching fulfillment and trigger arbitrary attestations from the contract to a trusted schema, bypassing distribution gates.
#### Preconditions / Assumptions
- (a). Escrows are configured with arbiter == the same AttestationEscrowObligation contract.
- (b). The attacker can call doObligationRaw to mint a fulfillment under this contract’s ATTESTATION_SCHEMA (no lock) with data matching the demand.
- (c). A trusted schema S accepts attestations from this contract and zero-value requests.
- (d). Downstream consumers rely on attester == this contract on schema S to grant access or distribution.

###### Proposed fix

####### AttestationEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {BaseEscrowObligation} from "../../../BaseEscrowObligation.sol";
 import {IArbiter} from "../../../IArbiter.sol";
 import {ArbiterUtils} from "../../../ArbiterUtils.sol";
 import {Attestation} from "@eas/Common.sol";
 import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
-import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
+import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
 
 contract AttestationEscrowObligation is BaseEscrowObligation, IArbiter {
 ... 43 unchanged lines ...
             (ObligationData)
         );
+        if (decoded.attestation.data.value != 0) revert AttestationCreationFailed();
+        SchemaRecord memory _rec = schemaRegistry.getSchema(decoded.attestation.schema);
+        if (address(_rec.resolver) != address(this)) revert AttestationCreationFailed();
 
         bytes32 attestationUid;
 ... 86 unchanged lines ...
```

####### AttestationEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/AttestationEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/AttestationEscrowObligation.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {BaseEscrowObligationTierable} from "../../../BaseEscrowObligationTierable.sol";
 import {IArbiter} from "../../../IArbiter.sol";
 import {ArbiterUtils} from "../../../ArbiterUtils.sol";
 import {Attestation} from "@eas/Common.sol";
 import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
-import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
+import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
 
 contract AttestationEscrowObligation is BaseEscrowObligationTierable, IArbiter {
 ... 43 unchanged lines ...
             (ObligationData)
         );
+        if (decoded.attestation.data.value != 0) revert AttestationCreationFailed();
+        SchemaRecord memory _rec = schemaRegistry.getSchema(decoded.attestation.schema);
+        if (address(_rec.resolver) != address(this)) revert AttestationCreationFailed();
 
         bytes32 attestationUid;
 ... 86 unchanged lines ...
```

### 9. [Medium] Dead executor-tracking causes EXECUTOR_SENTINEL to resolve to msg.sender in splitters’ collectAndDistribute, misrouting executor rewards and enabling drain or lock

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

In all splitter contracts, _currentExecutor is written in execute() but never read. collectAndDistribute() resolves EXECUTOR_SENTINEL to msg.sender, not the stored executor. When self-called via execute(address(this), ...), sentinel-designated shares are sent to the splitter itself. ERC20/721/1155 rewards then remain on the splitter and can be publicly drained via the permissionless execute(); native ETH becomes stuck in the splitter.

The splitter contracts (ERC20Splitter, ERC1155Splitter, NativeTokenSplitter, and TokenBundleSplitter via TokenBundleSplitterBase) define an EXECUTOR_SENTINEL to pay the executor who triggers distribution. Their execute() functions set _currentExecutor = msg.sender, but collectAndDistribute() never uses it; instead, it sets _currentExecutor = msg.sender again and resolves EXECUTOR_SENTINEL to msg.sender. If collectAndDistribute() is invoked via a self-call (execute(address(this), abi.encodeCall(collectAndDistribute,...))), msg.sender inside collectAndDistribute is the splitter itself, so sentinel-designated payouts are transferred to the splitter. For ERC20/721/1155, these assets remain owned by the splitter and can be moved by anyone using the public execute() function. For native ETH, the ETH remains stuck in the splitter since execute() only forwards msg.value and cannot sweep existing balance. This contradicts the intended semantics (comments indicate execute() should preserve the original executor for sentinel resolution) and violates the expectation that splitters do not custody value outside atomic flows.

#### Severity

**Impact Explanation:** [Medium] Only the executor reward/tip portion is affected; principal allocations to explicit recipients are not misrouted. Loss or freezing pertains to fees/rewards rather than principal.

**Likelihood Explanation:** [Medium] While not the default path, self-calling via execute(self, collectAndDistribute) is a plausible integration pattern given the comments about preserving the executor. Oracle use of EXECUTOR_SENTINEL is also plausible by design.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
ERC20: An escrow and fulfillment are valid with fulfillment.recipient set to the ERC20Splitter. The oracle’s decision includes a split paying amount A to EXECUTOR_SENTINEL. A user self-calls via ERC20Splitter.execute(address(this), abi.encodeCall(collectAndDistribute,...)). Inside collectAndDistribute, EXECUTOR_SENTINEL resolves to the splitter, so A ERC20 tokens remain on the splitter. Any third party then calls execute() to transfer those tokens from the splitter to themselves, causing the would-be executor to lose the reward.
#### Preconditions / Assumptions
- (a). ERC20 escrow exists with valid fulfillment; fulfillment.recipient is the ERC20Splitter address so collectEscrow transfers tokens to the splitter
- (b). Oracle decision includes a split with recipient = EXECUTOR_SENTINEL and amount A > 0
- (c). User calls execute(address(this), abi.encodeCall(collectAndDistribute, (escrowContract, escrowUid, fulfillmentUid))) on the ERC20Splitter
- (d). Tokens behave per standard (no hooks, no rebasing); execute() is permissionless as designed

### Scenario 2.
Token bundle (ERC721/1155): A bundle escrow and fulfillment are valid with fulfillment.recipient set to the TokenBundleSplitter. The oracle’s decision assigns some ERC721 indices and/or ERC1155 amounts to EXECUTOR_SENTINEL. The user self-calls via TokenBundleSplitter.execute(address(this), abi.encodeCall(collectAndDistribute,...)). Sentinel resolves to the splitter; the NFT(s)/ERC1155 amounts remain on the splitter and can be publicly drained using execute() to transfer them out.
#### Preconditions / Assumptions
- (a). Token bundle escrow exists with valid fulfillment; fulfillment.recipient is the TokenBundleSplitter address
- (b). Oracle decision includes EXECUTOR_SENTINEL with at least one ERC721 index and/or positive ERC1155 amounts
- (c). User calls execute(address(this), abi.encodeCall(collectAndDistribute, (escrowContract, escrowUid, fulfillmentUid))) on the TokenBundleSplitter
- (d). ERC721/1155 behave per standards; execute() is permissionless

### Scenario 3.
Native ETH: A native token escrow and fulfillment are valid with fulfillment.recipient set to the NativeTokenSplitter. The oracle assigns E wei to EXECUTOR_SENTINEL. The user self-calls via NativeTokenSplitter.execute(address(this), abi.encodeCall(collectAndDistribute,...)). The sentinel resolves to the splitter; E wei is sent to and stuck on the splitter since there is no mechanism to sweep its held ETH via execute(). The would-be executor permanently loses the ETH reward.
#### Preconditions / Assumptions
- (a). Native token escrow exists with valid fulfillment; fulfillment.recipient is the NativeTokenSplitter address
- (b). Oracle decision includes EXECUTOR_SENTINEL with amount E > 0
- (c). User calls execute(address(this), abi.encodeCall(collectAndDistribute, (escrowContract, escrowUid, fulfillmentUid))) on the NativeTokenSplitter
- (d). execute() cannot sweep existing ETH balance; it only forwards msg.value

#### Proposed fix

##### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 186 unchanged lines ...
         bytes32 fulfillment
     ) external nonReentrant {
-        _currentExecutor = msg.sender;
 
         // Read escrow attestation to get demand, token, and amount
 ... 24 unchanged lines ...
             address recipient = splits[i].recipient;
             if (recipient == EXECUTOR_SENTINEL) {
-                recipient = msg.sender;
+                recipient = _currentExecutor == address(0) ? msg.sender : _currentExecutor;
             }
             IERC20(escrowData.token).safeTransfer(
 ... 41 unchanged lines ...
```

##### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 197 unchanged lines ...
         bytes32 fulfillment
     ) external nonReentrant {
-        _currentExecutor = msg.sender;
 
         Attestation memory escrowAttestation = eas.getAttestation(escrow);
 ... 23 unchanged lines ...
             address recipient = splits[s].recipient;
             if (recipient == EXECUTOR_SENTINEL) {
-                recipient = msg.sender;
+                recipient = _currentExecutor == address(0) ? msg.sender : _currentExecutor;
             }
 
 ... 79 unchanged lines ...
```

##### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 184 unchanged lines ...
         bytes32 fulfillment
     ) external nonReentrant {
-        _currentExecutor = msg.sender;
 
         Attestation memory escrowAttestation = eas.getAttestation(escrow);
 ... 23 unchanged lines ...
             address recipient = splits[i].recipient;
             if (recipient == EXECUTOR_SENTINEL) {
-                recipient = msg.sender;
+                recipient = _currentExecutor == address(0) ? msg.sender : _currentExecutor;
             }
             (bool success, ) = payable(recipient).call{
 ... 44 unchanged lines ...
```

##### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 186 unchanged lines ...
         bytes32 fulfillment
     ) external nonReentrant {
-        _currentExecutor = msg.sender;
 
         Attestation memory escrowAttestation = eas.getAttestation(escrow);
 ... 23 unchanged lines ...
             address recipient = splits[i].recipient;
             if (recipient == EXECUTOR_SENTINEL) {
-                recipient = msg.sender;
+                recipient = _currentExecutor == address(0) ? msg.sender : _currentExecutor;
             }
             IERC1155(escrowData.token).safeTransferFrom(
 ... 45 unchanged lines ...
```

### 10. [Medium] Missing ERC721 transfer state validation in ERC721PaymentObligation allows fake payment attestations to release escrowed assets

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

ERC721PaymentObligation treats a non-reverting transferFrom as proof of NFT transfer and mints a payment attestation without verifying ownership state. Calls to EOAs or non-ERC721 contracts can succeed without moving any NFT. Escrows that use this arbiter accept such attestations if fields match, enabling release of real escrowed assets when the demand.token is a non-ERC721 address.

In ERC721PaymentObligation, _beforeAttest calls IERC721(token).transferFrom(payer, payee, tokenId) inside a try/catch and interprets any non-revert as success. Because ERC721 transferFrom has no return value, a CALL to an EOA or to a non-ERC721 contract that does not revert returns success with empty returndata. The contract performs no ownerOf checks before or after the call and does not validate that the token address is an ERC721. It then mints an EAS attestation via _attest; BaseAttester.onAttest allows this because the attester is the contract itself. The arbiter’s checkObligation only validates schema/intrinsics, refUID equality, and equality of token/tokenId/payee against the escrow’s demand, with no on-chain transfer or ownership verification. BaseEscrowObligation (and its tierable variant) rely on arbiter.checkObligation and, upon success, release escrowed assets to fulfillment.recipient. Therefore, if an escrow’s demand.token is a non-ERC721 address (e.g., an EOA or a permissive fallback contract), an attacker can mint a “payment” attestation without moving any NFT and collect escrowed ETH/NFTs/bundles. If demand.token is a valid ERC721, transferFrom would revert without ownership/approval and block the attestation, so exploitability hinges on the misconfigured token address.

#### Severity

**Impact Explanation:** [High] Successful exploitation causes direct, material loss of principal escrowed assets (ETH, NFTs, or token bundles) without receiving the intended NFT payment.

**Likelihood Explanation:** [Low] Exploitation requires the escrow creator to misconfigure demand.token to a non-ERC721 address; this reliance on user-side parameter error fits the low-likelihood rule for user/operator mistakes.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
NativeTokenEscrow drained: Victim creates a NativeTokenEscrowObligation escrow with arbiter = ERC721PaymentObligation and demand.token set to an EOA/non-ERC721. Attacker observes the escrow UID, then calls ERC721PaymentObligation.doObligation with matching fields and refUID = escrow UID. The transferFrom to the EOA does not revert, the attestation is minted, and collectEscrow releases the escrowed ETH to the attacker.
#### Preconditions / Assumptions
- (a). Escrow creator configures NativeTokenEscrowObligation with arbiter = ERC721PaymentObligation and demand = { token: EOA or permissive non-ERC721 contract, tokenId: X, payee: victim }
- (b). Escrow ETH amount is correctly locked (msg.value equals the amount)
- (c). EAS/SchemaRegistry behave as assumed; attestations and UIDs are publicly observable
- (d). Attacker can set refUID to the escrow UID and choose fulfillment.recipient (themselves)

### Scenario 2.
ERC721Escrow NFT stolen: Victim locks NFT B in an ERC721EscrowObligation escrow with arbiter = ERC721PaymentObligation and demand.token set to an EOA/non-ERC721. Attacker mints a matching payment attestation as above and calls collectEscrow. The arbiter check passes and the escrow transfers NFT B to the attacker.
#### Preconditions / Assumptions
- (a). Escrow creator configures ERC721EscrowObligation with arbiter = ERC721PaymentObligation and demand = { token: EOA or permissive non-ERC721 contract, tokenId: A, payee: victim }
- (b). Victim’s NFT B is successfully locked in escrow (ownerOf pre/post checks in escrow contract pass)
- (c). EAS/SchemaRegistry behave as assumed; escrow UID is observable
- (d). Attacker can set refUID to the escrow UID and choose fulfillment.recipient (themselves)

### Scenario 3.
TokenBundleEscrow drained: Victim locks a bundle (ETH/ERC20/ERC721/ERC1155) in a TokenBundleEscrowObligation escrow with arbiter = ERC721PaymentObligation and demand.token set to an EOA/non-ERC721. Attacker mints a matching payment attestation and calls collectEscrow. The arbiter check passes and the escrow releases the entire bundle to the attacker.
#### Preconditions / Assumptions
- (a). Escrow creator configures TokenBundleEscrowObligation with arbiter = ERC721PaymentObligation and demand = { token: EOA or permissive non-ERC721 contract, tokenId: X, payee: victim }
- (b). Bundle assets are successfully locked in escrow (escrow contract’s robust transfer checks pass)
- (c). EAS/SchemaRegistry behave as assumed; escrow UID is observable
- (d). Attacker can set refUID to the escrow UID and choose fulfillment.recipient (themselves)

#### Proposed fix

##### ERC721PaymentObligation.sol

File: `contracts/src/obligations/payment/ERC721PaymentObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/payment/ERC721PaymentObligation.sol)

```diff
 ... 93 unchanged lines ...
             );
         }
+
+        // Verify ownership after transfer to ensure actual state change
+        if (
+            IERC721(obligationData.token).ownerOf(obligationData.tokenId) !=
+            obligationData.payee
+        ) {
+            revert ERC721TransferFailed(
+                obligationData.token, payer, obligationData.payee, obligationData.tokenId
+            );
+        }
     }
 
 ... 44 unchanged lines ...
```

### 11. [Medium] Missing fulfillment liveness checks in BaseEscrowObligation and BaseEscrowObligationTierable collectEscrowRaw causes unintended release of escrowed funds

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

The escrow collection bases validate only the escrow attestation’s liveness and delegate fulfillment validation to arbiters. Many built-in arbiters do not enforce liveness, so a revoked or expired fulfillment attestation can still collect escrow if the chosen arbiter or composition does not require liveness.

Both BaseEscrowObligation.collectEscrowRaw and BaseEscrowObligationTierable.collectEscrowRaw validate the escrow attestation’s schema and liveness (escrow._checkIntrinsic()) but never validate the fulfillment attestation’s liveness at settlement time. They delegate validity to the configured arbiter via IArbiter.checkObligation and then release funds to fulfillment.recipient on success. Multiple built-in arbiters (e.g., AttesterArbiter, SchemaArbiter, RecipientArbiter, UidArbiter, RefUidArbiter, RevocableArbiter, Time*/ExpirationTime* arbiters, TrustedOracleArbiter, ERC8004Arbiter) do not call _checkIntrinsic(), so they can accept fulfillments that are revoked or expired. Logical combinators matter: AllArbiter can enforce liveness if IntrinsicsArbiter/IntrinsicsArbiter2 is included, but AnyArbiter can bypass liveness if any branch lacks it. This creates a configuration hazard where misconfigured arbiters or compositions allow stale fulfillments to release escrowed assets. The impact is high (loss of principal funds), but likelihood is low because it relies on integrator configuration choices; liveness-enforcing arbiters (IntrinsicsArbiter/2) and value-moving arbiters (e.g., PaymentObligation variants) that already enforce liveness are available.

#### Severity

**Impact Explanation:** [High] Direct, material loss of principal funds is possible because escrowed assets can be released to an attacker using a revoked or expired fulfillment.

**Likelihood Explanation:** [Low] Exploitation relies on integrator configuration choices (using non-liveness arbiters or AnyArbiter compositions that permit bypass) and the existence of stale fulfillments; liveness-enforcing arbiters are readily available.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Non-tierable ERC20 escrow with SchemaArbiter only: a fulfillment attestation referencing the escrow (refUID == escrow.uid) is issued to the attacker and later revoked or expired; SchemaArbiter’s static schema check passes and the base releases tokens to the attacker despite the stale fulfillment.
#### Preconditions / Assumptions
- (a). Escrow uses the non-tierable escrow contract path and is live/valid
- (b). Arbiter is SchemaArbiter without any liveness-enforcing arbiter in the chain
- (c). A fulfillment attestation with the demanded schema exists, references escrow.uid, names the attacker as recipient, and is revoked or expired at settlement time
- (d). Base does not enforce fulfillment._checkIntrinsic()

### Scenario 2.
AnyArbiter composition with [IntrinsicsArbiter, AttesterArbiter]: a revoked/expired fulfillment attestation by the demanded attester references the escrow; IntrinsicsArbiter fails but AttesterArbiter passes, so AnyArbiter returns true and the base releases funds to the attacker.
#### Preconditions / Assumptions
- (a). Escrow uses the non-tierable escrow contract path and is live/valid
- (b). Arbiter is AnyArbiter composed of [IntrinsicsArbiter, AttesterArbiter] (or any branch that lacks liveness checks)
- (c). A revoked or expired fulfillment attestation by the demanded attester exists, references escrow.uid, and names the attacker as recipient
- (d). AnyArbiter semantics allow success if any sub-arbiter passes

### Scenario 3.
Non-tierable ERC20 escrow with ExpirationTime* arbiter: a fulfillment attestation referencing the escrow is created with expirationTime satisfying the static demand at issuance, then it expires; the ExpirationTime* arbiter compares only fields and passes, allowing the base to release funds on an expired fulfillment.
#### Preconditions / Assumptions
- (a). Escrow uses the non-tierable escrow contract path and is live/valid
- (b). Arbiter is an ExpirationTime* arbiter (After/Before/Equal) without any liveness-enforcing arbiter in the chain
- (c). A fulfillment attestation referencing escrow.uid exists with expirationTime satisfying the static demand at issuance but is expired at settlement
- (d). ExpirationTime* arbiter compares static fields only and does not check current time or revocation

#### Proposed fix

##### BaseEscrowObligation.sol

File: `contracts/src/BaseEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligation.sol)

```diff
 ... 93 unchanged lines ...
         if (fulfillment.refUID != escrow.uid) revert InvalidFulfillment();
 
+        if (!fulfillment._checkIntrinsic()) revert InvalidFulfillment();
         // Check fulfillment via the specified arbiter
         if (!IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid))
 ... 83 unchanged lines ...
```

##### BaseEscrowObligationTierable.sol

File: `contracts/src/BaseEscrowObligationTierable.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligationTierable.sol)

```diff
 ... 92 unchanged lines ...
         // TIERABLE: No check that fulfillment.refUID == escrow.uid
         // This allows multiple escrows to be associated with one fulfillment
+        if (!fulfillment._checkIntrinsic()) revert InvalidFulfillment();
 
         // Check fulfillment via the specified arbiter
 ... 84 unchanged lines ...
```

### 12. [Medium] Unchecked user-supplied arbiter in BaseEscrowObligation/BaseEscrowObligationTierable causes theft or permanent escrow lock

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Escrow collection trusts a user-supplied arbiter address without validation or error isolation. Assets are locked before arbiter evaluation, allowing permanent lock if the arbiter is invalid and expiration is 0, or theft if the arbiter always returns true.

Both BaseEscrowObligation and BaseEscrowObligationTierable decode an arbiter address from escrow data and call IArbiter(arbiter).checkObligation without verifying that the arbiter is a contract or catching reverts. Funds are locked in _lockEscrow before this check. If the arbiter is an EOA/zero address or a reverting contract, collection always reverts. For non-expiring escrows (expirationTime == 0), reclaimExpired is intentionally disallowed, causing a permanent lock. Conversely, if a permissive arbiter (e.g., always-true) is selected, any party can mint a fulfillment attestation (non-tierable requires refUID == escrow uid) and withdraw escrowed assets to themselves. The tierable variant omits the refUID check by design, but the same arbiter-trust issue applies. While arbiters are intentionally user-selected policy modules, UI/integration manipulation or misconfiguration can lead users to unsafe arbiters or expirations, producing high-impact outcomes.

#### Severity

**Impact Explanation:** [High] Theft of escrowed principal (direct, material loss) or a permanent freeze with no workaround for non-expiring escrows; significant temporary DoS in the long-expiry case.

**Likelihood Explanation:** [Low] All scenarios rely on user-side misconfiguration or UI/integration manipulation of arbiter/expiry choices. Users are assumed competent; multiple preconditions are multiplicative, reducing overall likelihood.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Theft via permissive arbiter: A malicious UI steers the buyer to use a permissive arbiter (e.g., always-true). The buyer creates an escrow; assets are locked. The attacker then creates a fulfillment attestation referencing the escrow uid (non-tierable) with recipient set to themselves and calls collectEscrow. Because the arbiter returns true, the contract releases the escrowed assets to the attacker.
#### Preconditions / Assumptions
- (a). Attacker influences the buyer’s arbiter choice via malicious/compromised UI or social engineering
- (b). Buyer creates an escrow with a permissive arbiter (always-true behavior)
- (c). Non-tierable flow is used (requires fulfillment.refUID == escrow uid); tierable is even looser
- (d). EAS allows anyone to mint a fulfillment attestation

### Scenario 2.
Permanent lock via invalid arbiter and no expiry: A UI or misconfiguration sets the arbiter to an EOA/zero address while the buyer sets expirationTime == 0. The escrow is created and assets are locked. Any collectEscrow attempt reverts on the arbiter call (no return data/decoding failure), and reclaimExpired is blocked for non-expiring escrows, permanently locking funds.
#### Preconditions / Assumptions
- (a). Buyer (misled by UI or misconfiguration) sets arbiter to an EOA/zero address or a reverting contract
- (b). Buyer sets expirationTime == 0 (never expires)
- (c). Escrow is created and assets are successfully locked in _lockEscrow

### Scenario 3.
Long-term DoS via invalid arbiter and long expiry: The arbiter is set to an EOA/zero address and expirationTime is far in the future. Collection reverts until expiry due to the invalid arbiter, causing an extended availability loss. After expiry, reclaimExpired succeeds and returns funds to the buyer.
#### Preconditions / Assumptions
- (a). Buyer sets arbiter to an EOA/zero address or a reverting contract (misconfiguration/UI influence)
- (b). Buyer sets a far-future expirationTime
- (c). Escrow is created and assets are locked; no collection possible until expiry

#### Proposed fix

##### BaseEscrowObligationTierable.sol

File: `contracts/src/BaseEscrowObligationTierable.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligationTierable.sol)

```diff
 ... 94 unchanged lines ...
 
         // Check fulfillment via the specified arbiter
-        if (!IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid))
-            revert InvalidFulfillment();
+        try IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid) returns (bool result) { if (!result) revert InvalidFulfillment(); } catch { revert InvalidFulfillment(); }
 
         // Revoke attestation
 ... 64 unchanged lines ...
         address /*recipient*/
     ) internal virtual override {
+        (address arbiter, ) = extractArbiterAndDemand(data);
+        if (arbiter.code.length == 0) revert InvalidEscrowAttestation();
         _lockEscrow(data, payer);
     }
 
     // Hook implementations
 
     function _afterAttest(
         bytes32 uid,
         bytes memory /*data*/,
         address /*payer*/,
         address recipient
     ) internal override {
         emit EscrowMade(uid, recipient);
     }
 }
```

##### BaseEscrowObligation.sol

File: `contracts/src/BaseEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligation.sol)

```diff
 ... 92 unchanged lines ...
         // Check that fulfillment references the escrow (non-tierable)
         if (fulfillment.refUID != escrow.uid) revert InvalidFulfillment();
-
         // Check fulfillment via the specified arbiter
-        if (!IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid))
-            revert InvalidFulfillment();
+        try IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid) returns (bool result) { if (!result) revert InvalidFulfillment(); } catch { revert InvalidFulfillment(); }
 
         // Revoke attestation
 ... 64 unchanged lines ...
         address /*recipient*/
     ) internal virtual override {
+        (address arbiter, ) = extractArbiterAndDemand(data);
+        if (arbiter.code.length == 0) revert InvalidEscrowAttestation();
         _lockEscrow(data, payer);
     }
 
     // Hook implementations
 
     function _afterAttest(
         bytes32 uid,
         bytes memory /*data*/,
         address /*payer*/,
         address recipient
     ) internal override {
         emit EscrowMade(uid, recipient);
     }
 }
```

#### Related findings

##### [Medium] Permissive arbiters in escrow collection allow zero-value fulfillments to steal escrowed assets

###### Description

Escrow contracts release assets to the fulfillment attestation’s recipient solely based on the selected arbiter’s checkObligation result. If a buyer configures a permissive arbiter (e.g., TrivialArbiter, IntrinsicsArbiter, IntrinsicsArbiter2 with a permissive schema, or AnyArbiter including a permissive member), an attacker can mint a trivial attestation and collect the escrowed assets without providing compensating value.

In BaseEscrowObligation.collectEscrowRaw (non-tierable) and BaseEscrowObligationTierable.collectEscrowRaw (tierable), the only gate to releasing escrowed assets is IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid). On success, the escrow attestation is revoked and _releaseEscrow sends the full escrowed value to fulfillment.recipient. Several arbiters provided are permissive and do not enforce economic settlement (TrivialArbiter returns true; IntrinsicsArbiter checks only not expired/revoked; IntrinsicsArbiter2 only enforces a provided schema; AnyArbiter returns true if any sub-arbiter is true, ignoring reverts). If a buyer or integrating UI misconfigures an escrow to use such an arbiter, an attacker can mint a trivial EAS attestation (with refUID matching the escrow for non-tierable; any refUID for tierable) and immediately collect the escrowed funds. Asset locking at creation (_lockEscrow) is correct; the flaw is the reliance on potentially permissive arbiters for release.

###### Severity

**Impact Explanation:** [High] Direct theft of user principal funds: escrowed assets are released to an attacker without compensating value when permissive arbiters are used.

**Likelihood Explanation:** [Low] Exploitation requires buyer/integration misconfiguration (selecting a permissive arbiter or unsafe composition). Once misconfigured, exploitation is trivial, but the overall likelihood is dominated by the configuration error.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Non-tierable ERC20 escrow with arbiter set to TrivialArbiter: the buyer creates an escrow that locks tokens; the attacker mints any attestation with recipient=attacker and refUID=escrow UID; TrivialArbiter returns true; collectEscrow transfers the escrowed tokens to the attacker.
#### Preconditions / Assumptions
- (a). Buyer configures a non-tierable ERC20 escrow with arbiter=TrivialArbiter and arbitrary demand
- (b). Buyer has approved and escrowed the tokens via _lockEscrow
- (c). EAS/Schemas allow attacker to mint attestations
- (d). Non-tierable requires fulfillment.refUID=escrow UID, which attacker can set
- (e). UI/integration permits selecting a permissive arbiter

### Scenario 2.
Tierable TokenBundle escrow with arbiter set to IntrinsicsArbiter: the buyer escrows a token bundle; the attacker mints any non-expired attestation with recipient=attacker (no refUID linkage required by tierable); IntrinsicsArbiter returns true; collectEscrow transfers the entire bundle to the attacker.
#### Preconditions / Assumptions
- (a). Buyer configures a tierable TokenBundle escrow with arbiter=IntrinsicsArbiter
- (b). Assets are successfully locked in escrow via _lockEscrow
- (c). EAS/Schemas allow attacker to mint attestations
- (d). Tierable flow does not require fulfillment.refUID linkage at the base layer
- (e). UI/integration permits selecting a permissive arbiter

### Scenario 3.
Non-tierable ERC721 escrow using AnyArbiter composed of a strict payment arbiter and a permissive arbiter (e.g., IntrinsicsArbiter): the attacker mints a trivial attestation with recipient=attacker and refUID=escrow UID; the strict arbiter fails but AnyArbiter ignores the revert and accepts the permissive arbiter’s true result; collectEscrow transfers the NFT to the attacker.
#### Preconditions / Assumptions
- (a). Buyer configures a non-tierable ERC721 escrow with arbiter=AnyArbiter including a permissive sub-arbiter
- (b). NFT is successfully locked in escrow via _lockEscrow
- (c). EAS/Schemas allow attacker to mint attestations
- (d). AnyArbiter returns true if any sub-arbiter is true and ignores reverts from stricter arbiters
- (e). Non-tierable requires fulfillment.refUID=escrow UID, which attacker can set
- (f). UI/integration permits unsafe arbiter composition

###### Proposed fix

####### BaseEscrowObligation.sol

File: `contracts/src/BaseEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligation.sol)

```diff
 ... 96 unchanged lines ...
         if (!IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid))
             revert InvalidFulfillment();
+        if (fulfillment.attester != arbiter && msg.sender != escrow.recipient) revert UnauthorizedCall();
 
         // Revoke attestation
 ... 80 unchanged lines ...
```

####### BaseEscrowObligationTierable.sol

File: `contracts/src/BaseEscrowObligationTierable.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/BaseEscrowObligationTierable.sol)

```diff
 ... 96 unchanged lines ...
         if (!IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid))
             revert InvalidFulfillment();
+        if (fulfillment.attester != arbiter && msg.sender != escrow.recipient) revert UnauthorizedCall();
 
         // Revoke attestation
 ... 80 unchanged lines ...
```

####### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 618 unchanged lines ...
         if (!IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid))
             revert InvalidFulfillment();
+        if (fulfillment.attester != arbiter && msg.sender != escrow.recipient) revert UnauthorizedCall();
 
         // Revoke attestation
 ... 76 unchanged lines ...
```

####### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 618 unchanged lines ...
         if (!IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid))
             revert InvalidFulfillment();
+        if (fulfillment.attester != arbiter && msg.sender != escrow.recipient) revert UnauthorizedCall();
 
         // Revoke attestation
 ... 76 unchanged lines ...
```

### 13. [Medium] Unfunded deferred EAS attestation with no asset lock in AttestationEscrowObligation v1 causes counterparty asset loss in non-atomic flows

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

AttestationEscrowObligation v1 escrows only a future eas.attest call without locking value and attempts it at collection without ETH or feasibility checks. Combined with PaymentObligations that transfer value in _beforeAttest, non-atomic integrations can cause sellers to transfer assets and then fail to collect the attestation.

In AttestationEscrowObligation v1 (both non-tierable and tierable), _lockEscrow is a no-op, so no value is locked at escrow creation. On collection, _releaseEscrow decodes a buyer-supplied AttestationRequest and calls eas.attest without forwarding ETH and without prior feasibility checks. If the request requires value (AttestationRequestData.value > 0), uses a resolver that rejects this contract as attester, or references an invalid refUID, collectEscrow reverts. Meanwhile, PaymentObligations (ERC20/721/1155/Native/Bundle) transfer assets in their _beforeAttest hooks before attempting to collect. In non-atomic flows (separate transactions), a seller can transfer assets first and later be unable to collect the promised attestation, resulting in loss. The repository’s helpers use atomic flows for token trades and use AttestationEscrowObligation2 for attestation barter, reducing real-world exposure. Sellers can also mitigate by checking value == 0, resolver acceptance, and refUID validity before paying.

#### Severity

**Impact Explanation:** [High] Victims can suffer direct, material loss of principal assets (ERC20, ETH, ERC721) transferred in PaymentObligation._beforeAttest without receiving the promised attestation.

**Likelihood Explanation:** [Low] Exploitation requires non-atomic integrations and operators skipping straightforward feasibility checks (value==0, resolver acceptance, valid refUID). The repository provides atomic helpers and uses AttestationEscrowObligation2 for attestation barter, further reducing typical exposure.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Seller pays ERC20 first, then collectEscrow fails because the escrowed AttestationRequest has a nonzero value: the buyer creates a v1 attestation escrow whose AttestationRequestData.value > 0 and demands ERC20 payment to themselves. The seller uses ERC20PaymentObligation.doObligationFor and transfers tokens in _beforeAttest. Later collectEscrow calls eas.attest without ETH and reverts (InsufficientValue/NotPayable), leaving the seller without the attestation and with tokens already transferred.
#### Preconditions / Assumptions
- (a). AttestationEscrowObligation v1 is used (non-tierable variant), not AttestationEscrowObligation2
- (b). Seller uses a non-atomic flow (payment and collection in separate transactions)
- (c). Buyer crafts AttestationRequest with AttestationRequestData.value > 0
- (d). Seller does not check that value == 0 before paying

### Scenario 2.
Seller pays ETH first, then collectEscrow fails because the schema resolver rejects the escrow contract as attester: the buyer creates a v1 attestation escrow pointing to a schema whose resolver denies this contract. The seller uses NativeTokenPaymentObligation.doObligationFor, transferring ETH in _beforeAttest. collectEscrow then calls eas.attest, the resolver returns false (InvalidAttestation), and the seller cannot collect while the ETH is already sent.
#### Preconditions / Assumptions
- (a). AttestationEscrowObligation v1 is used
- (b). Seller uses a non-atomic flow
- (c). Target schema has a resolver that rejects this escrow contract as attester
- (d). Seller does not restrict to no-resolver or vetted resolver allowlist

### Scenario 3.
Seller transfers an ERC721 first, then collectEscrow fails due to an invalid refUID: the buyer creates a v1 attestation escrow with a non-existent refUID and demands an ERC721 to their address. The seller executes ERC721PaymentObligation.doObligationFor, transferring the NFT in _beforeAttest. collectEscrow then calls eas.attest, which reverts NotFound due to the invalid refUID, so the seller loses the NFT without receiving the attestation.
#### Preconditions / Assumptions
- (a). AttestationEscrowObligation v1 is used
- (b). Seller uses a non-atomic flow
- (c). Buyer sets AttestationRequest.refUID to a non-existent value
- (d). Seller does not verify refUID existence before paying

#### Proposed fix

##### AttestationEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {BaseEscrowObligation} from "../../../BaseEscrowObligation.sol";
 import {IArbiter} from "../../../IArbiter.sol";
 import {ArbiterUtils} from "../../../ArbiterUtils.sol";
 import {Attestation} from "@eas/Common.sol";
 import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
 import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
 
 contract AttestationEscrowObligation is BaseEscrowObligation, IArbiter {
     using ArbiterUtils for Attestation;
 
     struct ObligationData {
         address arbiter;
         bytes demand;
         AttestationRequest attestation;
     }
 
     error AttestationCreationFailed();
+    error DeprecatedContract();
 
     constructor(
 ... 19 unchanged lines ...
     // No assets to lock for attestation escrows
     function _lockEscrow(bytes memory, address) internal override {
-        // No-op: attestations don't require locking assets
+        // Deprecated: prevent creating new escrows with v1. Use AttestationEscrowObligation2 instead.
+        revert DeprecatedContract();
     }
 
 ... 98 unchanged lines ...
```

##### AttestationEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/AttestationEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/AttestationEscrowObligation.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {BaseEscrowObligationTierable} from "../../../BaseEscrowObligationTierable.sol";
 import {IArbiter} from "../../../IArbiter.sol";
 import {ArbiterUtils} from "../../../ArbiterUtils.sol";
 import {Attestation} from "@eas/Common.sol";
 import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
 import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
 
 contract AttestationEscrowObligation is BaseEscrowObligationTierable, IArbiter {
     using ArbiterUtils for Attestation;
 
     struct ObligationData {
         address arbiter;
         bytes demand;
         AttestationRequest attestation;
     }
 
     error AttestationCreationFailed();
+    error DeprecatedContract();
 
     constructor(
 ... 19 unchanged lines ...
     // No assets to lock for attestation escrows
     function _lockEscrow(bytes memory, address) internal override {
-        // No-op: attestations don't require locking assets
+        // Deprecated: prevent creating new escrows with v1. Use AttestationEscrowObligation2 instead.
+        revert DeprecatedContract();
     }
 
 ... 98 unchanged lines ...
```

#### Related findings

##### [Medium] Promise-only arbiter validation in AttestationEscrowObligation causes release of escrowed assets without actual attestation delivery

###### Description

When AttestationEscrowObligation is used as an arbiter for other escrows, it only validates a promissory AttestationRequest and does not require proof that the underlying EAS attestation exists or is executable. Outer escrows release real assets solely on this check, enabling attackers to unlock funds with a zero-collateral "fulfillment" attestation.

AttestationEscrowObligation implements IArbiter and can be selected as the arbiter for token/NFT/native escrows. Its checkObligation only verifies the fulfillment attestation is under its schema, not expired/revoked, and that its embedded AttestationRequest/arbiter/demand exactly match the buyer’s demand. Its _lockEscrow is a no-op, so minting a fulfillment under it requires no collateral. BaseEscrowObligation{,Tierable}.collectEscrowRaw release escrowed assets if the arbiter returns true, without invoking any further action on the arbiter. Therefore, an attacker can mint a matching "promise" fulfillment attestation (referencing the escrow UID in the non-tierable case), pass the arbiter check, and collect the escrowed assets, even though the promised EAS attestation is never created. The tierable variant allows reuse of a single promise fulfillment across many escrows by design, compounding impact under misconfiguration.

###### Severity

**Impact Explanation:** [High] Direct, material loss of principal assets (tokens/NFTs/native) due to unauthorized release to the attacker based on a zero-collateral promise attestation.

**Likelihood Explanation:** [Low] Exploitation depends on the buyer/integrator configuring AttestationEscrowObligation as the sole arbiter condition for valuable escrows, which is a user-side configuration responsibility; while in scope, this maps to low likelihood per the rules.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Non-tierable ERC20 escrow: Buyer escrows ERC20 tokens using ERC20EscrowObligation, selecting AttestationEscrowObligation as arbiter and demanding a specific AttestationRequest R. Attacker reads the escrow’s demand, mints a matching AttestationEscrowObligation fulfillment referencing the escrow UID, then calls collectEscrow to receive the tokens; no underlying EAS attestation R is created.
#### Preconditions / Assumptions
- (a). Buyer/integrator selects AttestationEscrowObligation as the arbiter for ERC20EscrowObligation.
- (b). Buyer encodes demand with AttestationEscrowObligation.ObligationData including the targeted AttestationRequest R (and matching arbiter/demand bytes).
- (c). Buyer escrows ERC20 tokens successfully (standard token behavior).
- (d). Attacker can read escrow attestation and demand via EAS.getAttestation.
- (e). Non-tierable outer escrow requires fulfillment.refUID == escrow.uid (attacker sets refUID accordingly).
- (f). EAS and tokens behave canonically per repository assumptions.

### Scenario 2.
Non-tierable ERC721 escrow: Buyer escrows an NFT using ERC721EscrowObligation with AttestationEscrowObligation as arbiter and a demanded AttestationRequest R. Attacker mints a matching fulfillment referencing the escrow UID and collects the NFT; no underlying attestation is delivered.
#### Preconditions / Assumptions
- (a). Buyer/integrator selects AttestationEscrowObligation as the arbiter for ERC721EscrowObligation.
- (b). Buyer encodes demand with AttestationEscrowObligation.ObligationData including the targeted AttestationRequest R (and matching arbiter/demand bytes).
- (c). Buyer escrows the NFT successfully (standard ERC721 behavior).
- (d). Attacker can read escrow attestation and demand via EAS.getAttestation.
- (e). Non-tierable outer escrow requires fulfillment.refUID == escrow.uid (attacker sets refUID accordingly).
- (f). EAS and ERC721 behave canonically per repository assumptions.

### Scenario 3.
Tierable ERC20 mass-drain: Multiple buyers create tierable ERC20 escrows with AttestationEscrowObligation as arbiter and compatible demands. Attacker mints one matching fulfillment (no escrow UID linkage required) and reuses it to collect multiple escrows, receiving all tokens while no underlying attestations are created.
#### Preconditions / Assumptions
- (a). Multiple buyers/integrators use tierable ERC20EscrowObligation with AttestationEscrowObligation as arbiter.
- (b). Demands across escrows are compatible with the same AttestationRequest R (and matching arbiter/demand bytes).
- (c). Tierable base intentionally allows reuse of a single fulfillment across multiple escrows.
- (d). Attacker can read each escrow's demand via EAS.getAttestation.
- (e). EAS and ERC20 behave canonically per repository assumptions.

###### Proposed fix

####### AttestationEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation.sol)

```diff
 ... 85 unchanged lines ...
 
         return
-            keccak256(abi.encode(escrow.attestation)) ==
+            false && keccak256(abi.encode(escrow.attestation)) ==
             keccak256(abi.encode(demandData.attestation)) &&
             escrow.arbiter == demandData.arbiter &&
 ... 54 unchanged lines ...
```

####### AttestationEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/AttestationEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/AttestationEscrowObligation.sol)

```diff
 ... 85 unchanged lines ...
 
         return
-            keccak256(abi.encode(escrow.attestation)) ==
+            false && keccak256(abi.encode(escrow.attestation)) ==
             keccak256(abi.encode(demandData.attestation)) &&
             escrow.arbiter == demandData.arbiter &&
 ... 54 unchanged lines ...
```

### 14. [Medium] ERC1155 recipient hook gas-griefing via per-item safeTransferFrom in TokenBundleEscrowObligation (tierable) causes frozen escrowed funds

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

The tierable TokenBundleEscrowObligation releases ERC1155 items using per-item safeTransferFrom to fulfillment.recipient. A malicious recipient contract can burn gas/revert in onERC1155Received, causing atomic release to revert and the partial-release fallback to still run out of gas with no progress tracking, resulting in funds frozen until expiry or permanently if non-expiring.

In the tierable TokenBundleEscrowObligation, collectEscrowRaw releases escrowed assets to the fulfillment.recipient. For ERC1155 items, transferOutTokenBundleAtomic/Partial use IERC1155.safeTransferFrom, which invokes the recipient’s onERC1155Received with nearly all remaining gas. A malicious recipient can deliberately burn gas and revert each call. This reliably reverts atomic release and, due to the lack of batching or on-chain progress tracking, also causes the partial-release path to run out of gas mid-loop, reverting the whole transaction. If the arbiter/demand pins the escrow to a single malicious fulfillment and the escrow never expires, funds are permanently stuck; with a long expiry, funds are time-locked until expiry. This is a griefing DoS requiring attacker-controlled fulfillment.recipient and user/integration selection of an arbiter/demand that allows or pins that fulfillment.

#### Severity

**Impact Explanation:** [High] Funds can be frozen indefinitely for non-expiring escrows or for longer than a week for long-expiring escrows, with no effective workaround in the current design.

**Likelihood Explanation:** [Low] Exploitation depends on user/integration selecting or being manipulated into an arbiter/demand that pins to an attacker-controlled fulfillment and on the attacker deploying a malicious ERC1155 receiver. The attack is griefing with no direct profit.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Permanent stuck funds: Buyer creates a non-expiring tierable TokenBundle escrow with ERC1155 items and selects an arbiter/demand that pins to an attacker-controlled fulfillment (e.g., UidArbiter with demand.uid = attacker UID). The attacker’s fulfillment sets recipient to a malicious ERC1155 receiver contract that burns gas and reverts in onERC1155Received. All collection attempts revert, and because the escrow never expires, funds are permanently frozen.
#### Preconditions / Assumptions
- (a). Tierable TokenBundleEscrowObligation is used with at least one ERC1155 item in the bundle
- (b). Escrow expirationTime is set to 0 (never expires)
- (c). Arbiter and demand selected by the buyer pin the escrow to a single attacker-controlled fulfillment (e.g., UidArbiter with demand.uid = attacker’s fulfillment UID) via UI manipulation/misconfiguration
- (d). Attacker deploys a malicious ERC1155 receiver contract whose onERC1155Received burns gas and reverts
- (e). ERC1155 token is standard-compliant; adversarial receivers are allowed per scope
- (f). collectEscrowRaw is invoked with the pinned malicious fulfillment

### Scenario 2.
Time-locked DoS until expiry: Buyer creates a tierable TokenBundle escrow with ERC1155 items and a long expiration (e.g., >1 week), using an arbiter/demand pinned to a single attacker-controlled fulfillment whose recipient is a malicious ERC1155 receiver. Atomic collection reverts and partial collection runs out of gas; funds remain locked until expiry.
#### Preconditions / Assumptions
- (a). Tierable TokenBundleEscrowObligation is used with at least one ERC1155 item in the bundle
- (b). Escrow expirationTime is set to a long duration (e.g., > 1 week)
- (c). Arbiter and demand selected by the buyer pin the escrow to a single attacker-controlled fulfillment (e.g., UidArbiter) or otherwise do not allow an alternative safe fulfillment
- (d). Attacker’s fulfillment specifies a malicious ERC1155 receiver as recipient
- (e). ERC1155 token is standard-compliant; adversarial receivers are allowed per scope
- (f). collectEscrowRaw and unsafePartiallyCollectEscrow are attempted and fail due to gas griefing

### Scenario 3.
Partial-release fallback ineffective: After atomic release reverts against the malicious recipient, the victim attempts unsafePartiallyCollectEscrow. Each ERC1155 safeTransferFrom still calls the malicious onERC1155Received, which consumes significant gas and reverts. Without batching or progress-tracking, the transaction runs out of gas before completing, reverting entirely and leaving funds stuck until expiry or permanently if non-expiring.
#### Preconditions / Assumptions
- (a). Same setup as Scenario 1 or 2 (tierable, ERC1155 present, malicious recipient via pinned fulfillment)
- (b). Atomic release attempts have already failed due to revert from onERC1155Received
- (c). The victim invokes unsafePartiallyCollectEscrow
- (d). There are multiple ERC1155 items or sufficient per-call gas burn to cause out-of-gas before loop completion
- (e). No on-chain batching or progress tracking exists to allow incremental completion across transactions

#### Proposed fix

##### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 368 unchanged lines ...
 
         // Transfer ERC1155s - revert on failure
+        if (data.erc1155Tokens.length != 0) require(to.code.length == 0);
         for (uint i = 0; i < data.erc1155Tokens.length; i++) {
             // Check balance before transfer
 ... 81 unchanged lines ...
         }
 
+        if (data.erc1155Tokens.length != 0) require(to.code.length == 0);
         // Transfer ERC1155s - continue on failure
         for (uint i = 0; i < data.erc1155Tokens.length; i++) {
 ... 241 unchanged lines ...
```

##### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 368 unchanged lines ...
 
         // Transfer ERC1155s - revert on failure
+        if (data.erc1155Tokens.length != 0) require(to.code.length == 0);
         for (uint i = 0; i < data.erc1155Tokens.length; i++) {
             // Check balance before transfer
 ... 81 unchanged lines ...
         }
 
+        if (data.erc1155Tokens.length != 0) require(to.code.length == 0);
         // Transfer ERC1155s - continue on failure
         for (uint i = 0; i < data.erc1155Tokens.length; i++) {
 ... 241 unchanged lines ...
```

##### ERC1155EscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/ERC1155EscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/ERC1155EscrowObligation.sol)

```diff
 ... 111 unchanged lines ...
             (ObligationData)
         );
+        require(to.code.length == 0);
 
         // Check balance before transfer
 ... 123 unchanged lines ...
```

##### ERC1155EscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/ERC1155EscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/ERC1155EscrowObligation.sol)

```diff
 ... 111 unchanged lines ...
             (ObligationData)
         );
+        require(to.code.length == 0);
 
         // Check balance before transfer
 ... 123 unchanged lines ...
```

### 15. [Low] Constructor-only initialization of critical addresses in BarterUtils behind proxy/clone causes instance-level DoS

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

BarterUtils contracts store EAS and obligation contract addresses in storage set only via constructor. If deployed via a proxy or minimal clone, the proxy/clone storage remains zero-initialized, causing calls to address(0) and reverting all buy/pay flows, effectively bricking that instance.

All BarterUtils contracts (ERC20BarterUtils, ERC721BarterUtils, ERC1155BarterUtils, NativeTokenBarterUtils, TokenBundleBarterUtils) keep critical dependencies (IEAS and various escrow/payment obligation contracts) as internal storage variables and assign them only in the constructor. There are no initializer or admin setter functions. When such a helper is deployed behind an ERC1967/UUPS/Beacon proxy or an ERC1167 minimal clone, the constructor executes on the implementation but not on the proxy/clone, leaving the proxy/clone’s storage uninitialized (zero). Subsequent calls that rely on these addresses (e.g., eas.getAttestation, doObligationFor, collectEscrow) dereference address(0) and revert, rendering the helper instance unusable (DoS). Reverts unwind all in-transaction effects (token transfers/approvals/permits and ETH), so there is no funds loss; the impact is operational unavailability of that helper instance until redeploy/upgrade with proper initialization.

#### Severity

**Impact Explanation:** [Medium] Causes a significant availability loss of an important non-core helper component (instance-level DoS) but does not cause principal funds loss or protocol-wide breakage.

**Likelihood Explanation:** [Low] Requires operator/deployer misdeployment (proxy/clone without initializer), which is categorized as a trusted role mistake and thus low likelihood; official deployments typically use direct instantiation.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
A deployer uses a TransparentUpgradeableProxy to deploy ERC20BarterUtils without any initializer. Users calling payErc20ForErc20(buyAttestation) trigger eas.getAttestation on address(0), causing ABI decode revert and bricking the helper instance.
#### Preconditions / Assumptions
- (a). ERC20BarterUtils deployed behind a TransparentUpgradeableProxy (or ERC1967 proxy) without an initializer
- (b). Proxy storage for eas and obligations remains zero
- (c). A valid buy attestation exists from a correct escrow flow
- (d). User invokes payErc20ForErc20 on the proxy address

### Scenario 2.
A factory creates an ERC1167 minimal clone of ERC721BarterUtils (no initializer). A user calls buyErc20WithErc721(...); the function attempts erc721Escrow.doObligationFor on address(0), reverting and leaving the clone unusable.
#### Preconditions / Assumptions
- (a). An ERC1167 minimal clone of ERC721BarterUtils is created without initialization
- (b). Clone storage for erc721Escrow and other dependencies remains zero
- (c). User invokes buyErc20WithErc721 on the clone

### Scenario 3.
A UUPS proxy is used for NativeTokenBarterUtils without initialization. A user calls payEthForErc20(buyAttestation) with ETH; either eas.getAttestation(buyAttestation) or nativePayment.doObligationFor targets address(0), reverting and making the helper instance unavailable.
#### Preconditions / Assumptions
- (a). NativeTokenBarterUtils deployed behind a UUPS proxy without initialization
- (b). Proxy storage for eas/nativePayment (and others) remains zero
- (c). A valid buy attestation exists
- (d). User invokes payEthForErc20 on the proxy, sending required ETH

#### Proposed fix

##### ERC20BarterUtils.sol

File: `contracts/src/utils/barter/ERC20BarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/ERC20BarterUtils.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {Attestation} from "@eas/Common.sol";
 import {IEAS} from "@eas/IEAS.sol";
 import {ERC20EscrowObligation} from "../../obligations/escrow/non-tierable/ERC20EscrowObligation.sol";
 import {ERC20PaymentObligation} from "../../obligations/payment/ERC20PaymentObligation.sol";
 import {ERC721EscrowObligation} from "../../obligations/escrow/non-tierable/ERC721EscrowObligation.sol";
 import {ERC721PaymentObligation} from "../../obligations/payment/ERC721PaymentObligation.sol";
 import {ERC1155EscrowObligation} from "../../obligations/escrow/non-tierable/ERC1155EscrowObligation.sol";
 import {ERC1155PaymentObligation} from "../../obligations/payment/ERC1155PaymentObligation.sol";
 import {TokenBundleEscrowObligation} from "../../obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol";
 import {TokenBundlePaymentObligation} from "../../obligations/payment/TokenBundlePaymentObligation.sol";
 import {NativeTokenEscrowObligation} from "../../obligations/escrow/non-tierable/NativeTokenEscrowObligation.sol";
 import {NativeTokenPaymentObligation} from "../../obligations/payment/NativeTokenPaymentObligation.sol";
 import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
 import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
 
 contract ERC20BarterUtils {
+    // NOTE: Deployment safety: consider making these dependency addresses immutable with non-zero/code checks; avoid proxy/clone deployment or provide an initializer-based variant.
     IEAS internal eas;
     ERC20EscrowObligation internal erc20Escrow;
 ... 868 unchanged lines ...
```

##### ERC721BarterUtils.sol

File: `contracts/src/utils/barter/ERC721BarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/ERC721BarterUtils.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {Attestation} from "@eas/Common.sol";
 import {IEAS} from "@eas/IEAS.sol";
 import {ERC20EscrowObligation} from "../../obligations/escrow/non-tierable/ERC20EscrowObligation.sol";
 import {ERC20PaymentObligation} from "../../obligations/payment/ERC20PaymentObligation.sol";
 import {ERC721EscrowObligation} from "../../obligations/escrow/non-tierable/ERC721EscrowObligation.sol";
 import {ERC721PaymentObligation} from "../../obligations/payment/ERC721PaymentObligation.sol";
 import {ERC1155EscrowObligation} from "../../obligations/escrow/non-tierable/ERC1155EscrowObligation.sol";
 import {ERC1155PaymentObligation} from "../../obligations/payment/ERC1155PaymentObligation.sol";
 import {TokenBundleEscrowObligation} from "../../obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol";
 import {TokenBundlePaymentObligation} from "../../obligations/payment/TokenBundlePaymentObligation.sol";
 import {NativeTokenEscrowObligation} from "../../obligations/escrow/non-tierable/NativeTokenEscrowObligation.sol";
 import {NativeTokenPaymentObligation} from "../../obligations/payment/NativeTokenPaymentObligation.sol";
 import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
 
 contract ERC721BarterUtils {
+    // NOTE: Deployment safety: consider making these dependency addresses immutable with non-zero/code checks; avoid proxy/clone deployment or provide an initializer-based variant.
     IEAS internal eas;
     ERC20EscrowObligation internal erc20Escrow;
 ... 445 unchanged lines ...
```

##### ERC1155BarterUtils.sol

File: `contracts/src/utils/barter/ERC1155BarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/ERC1155BarterUtils.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {Attestation} from "@eas/Common.sol";
 import {IEAS} from "@eas/IEAS.sol";
 import {ERC20EscrowObligation} from "../../obligations/escrow/non-tierable/ERC20EscrowObligation.sol";
 import {ERC20PaymentObligation} from "../../obligations/payment/ERC20PaymentObligation.sol";
 import {ERC721EscrowObligation} from "../../obligations/escrow/non-tierable/ERC721EscrowObligation.sol";
 import {ERC721PaymentObligation} from "../../obligations/payment/ERC721PaymentObligation.sol";
 import {ERC1155EscrowObligation} from "../../obligations/escrow/non-tierable/ERC1155EscrowObligation.sol";
 import {ERC1155PaymentObligation} from "../../obligations/payment/ERC1155PaymentObligation.sol";
 import {TokenBundleEscrowObligation} from "../../obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol";
 import {TokenBundlePaymentObligation} from "../../obligations/payment/TokenBundlePaymentObligation.sol";
 import {NativeTokenEscrowObligation} from "../../obligations/escrow/non-tierable/NativeTokenEscrowObligation.sol";
 import {NativeTokenPaymentObligation} from "../../obligations/payment/NativeTokenPaymentObligation.sol";
 import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
 import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
 
 contract ERC1155BarterUtils is IERC1155Receiver {
+    // NOTE: Deployment safety: consider making these dependency addresses immutable with non-zero/code checks; avoid proxy/clone deployment or provide an initializer-based variant.
     IEAS internal eas;
     ERC20EscrowObligation internal erc20Escrow;
 ... 524 unchanged lines ...
```

##### NativeTokenBarterUtils.sol

File: `contracts/src/utils/barter/NativeTokenBarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/NativeTokenBarterUtils.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {Attestation} from "@eas/Common.sol";
 import {IEAS} from "@eas/IEAS.sol";
 import {ERC20EscrowObligation} from "../../obligations/escrow/non-tierable/ERC20EscrowObligation.sol";
 import {ERC20PaymentObligation} from "../../obligations/payment/ERC20PaymentObligation.sol";
 import {ERC721EscrowObligation} from "../../obligations/escrow/non-tierable/ERC721EscrowObligation.sol";
 import {ERC721PaymentObligation} from "../../obligations/payment/ERC721PaymentObligation.sol";
 import {ERC1155EscrowObligation} from "../../obligations/escrow/non-tierable/ERC1155EscrowObligation.sol";
 import {ERC1155PaymentObligation} from "../../obligations/payment/ERC1155PaymentObligation.sol";
 import {TokenBundleEscrowObligation} from "../../obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol";
 import {TokenBundlePaymentObligation} from "../../obligations/payment/TokenBundlePaymentObligation.sol";
 import {NativeTokenEscrowObligation} from "../../obligations/escrow/non-tierable/NativeTokenEscrowObligation.sol";
 import {NativeTokenPaymentObligation} from "../../obligations/payment/NativeTokenPaymentObligation.sol";
 
 contract NativeTokenBarterUtils {
+    // NOTE: Deployment safety: consider making these dependency addresses immutable with non-zero/code checks; avoid proxy/clone deployment or provide an initializer-based variant.
     IEAS internal eas;
     ERC20EscrowObligation internal erc20Escrow;
 ... 328 unchanged lines ...
```

##### TokenBundleBarterUtils.sol

File: `contracts/src/utils/barter/TokenBundleBarterUtils.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/utils/barter/TokenBundleBarterUtils.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {Attestation} from "@eas/Common.sol";
 import {IEAS} from "@eas/IEAS.sol";
 import {TokenBundleEscrowObligation} from "../../obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol";
 import {TokenBundlePaymentObligation} from "../../obligations/payment/TokenBundlePaymentObligation.sol";
 import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
 import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
 import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
 import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
 import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
 
 contract TokenBundleBarterUtils is IERC1155Receiver {
+    // NOTE: Deployment safety: consider making these dependency addresses immutable with non-zero/code checks; avoid proxy/clone deployment or provide an initializer-based variant.
     IEAS internal eas;
     TokenBundleEscrowObligation internal bundleEscrow;
 ... 372 unchanged lines ...
```

### 16. [Low] Inconsistent demand encoding and unchecked oracle event parameter in TrustedOracleArbiter causes denial of escrow collection

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

TrustedOracleArbiter stores arbitration decisions using raw caller-supplied demand bytes and msg.sender, but later validates using the inner demand bytes and the oracle encoded in the outer demand struct; requestArbitration also emits an unchecked oracle parameter. Naive oracle integrations that echo the event’s demand or rely on the indexed oracle topic can publish decisions that are never recognized on-chain, causing collection to fail until corrected.

TrustedOracleArbiter.arbitrate stores decisions under decisions[msg.sender][keccak256(fulfillmentUid, demand)], where demand is exactly the bytes passed by the caller. TrustedOracleArbiter.checkObligation decodes the escrow’s demand as DemandData{oracle, data} and then looks up decisions[demand.oracle][keccak256(fulfillmentUid, demand.data)]. If an oracle submits arbitrate with the full outer demand bytes (instead of the inner data), the stored key will not match the lookup key used by checkObligation, causing the decision to be ignored. Additionally, requestArbitration emits an ArbitrationRequested event with an indexed oracle address that is not verified against the oracle encoded in demand. Off-chain services that route by topic or echo demand bytes may mis-publish or misroute decisions. The effect is a denial of collection (collectEscrow reverts) until the oracle corrects by re-submitting arbitrate with the inner demand bytes from the correct oracle address. No unauthorized fund release occurs; this is an integration/availability risk.

#### Severity

**Impact Explanation:** [Medium] This causes significant but temporary availability loss/DoS of the core collection flow until the oracle corrects arbitration submissions. No unauthorized fund release occurs; funds may be reclaimed by buyers on escrow expiry if uncorrected.

**Likelihood Explanation:** [Low] Exploitation relies on operator/integration mistakes by a trusted oracle (echoing event demand, routing by topic only). Additional timing (e.g., escrow expiry before correction) may be needed for economic harm, further lowering likelihood.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Naive oracle echoes event demand into arbitrate: An escrow encodes DemandData{oracle: O, data: D}; a fulfillment is submitted; requestArbitration is emitted with the full outer demand; the oracle service naively calls arbitrate(fulfillmentUid, fullOuterDemandBytes, decision). The decision is stored under keccak(fulfillmentUid, fullOuterDemandBytes), but checkObligation looks up keccak(fulfillmentUid, D). Collection fails until the oracle corrects by re-submitting using inner D.
#### Preconditions / Assumptions
- (a). Escrow demand is abi.encode(DemandData{oracle: O, data: D}) using TrustedOracleArbiter
- (b). A valid fulfillment is submitted (non-tierable: fulfillment.refUID == escrow.uid)
- (c). requestArbitration is emitted and off-chain oracle service listens
- (d). Oracle service naively echoes the event’s full outer demand bytes into arbitrate
- (e). Oracle is trusted and can correct decisions (mutable)

### Scenario 2.
Spoofed oracle topic misroutes off-chain processing: An authorized party emits requestArbitration with oracle topic O1 while the outer demand encodes oracle O2. Off-chain services filtering by the indexed topic route work to O1, who submits a decision (either with full outer bytes or inner D). checkObligation reads from decisions[O2], so O1’s decision is ignored; if O2 never processes the request, collection fails until corrected.
#### Preconditions / Assumptions
- (a). Authorized caller (attester or recipient) can emit requestArbitration
- (b). Event’s indexed oracle topic differs from the oracle encoded in the outer demand
- (c). Off-chain routing relies on the indexed topic without decoding demand
- (d). The designated oracle (encoded in demand) does not process or correct in time

### Scenario 3.
Tierable reuse blocked across many escrows: In a tierable setup where one fulfillment should claim multiple escrows, the oracle submits arbitrate using the full outer demand bytes. All escrows that rely on decisions keyed to keccak(fulfillmentUid, D) fail lookup, causing multiple collection attempts to revert until the oracle re-submits with inner D.
#### Preconditions / Assumptions
- (a). Tierable escrow usage where a single fulfillment is intended to claim multiple escrows
- (b). All escrows share the same inner demand D and oracle O
- (c). Oracle submits arbitrate using full outer demand bytes instead of inner D
- (d). Multiple collections rely on the same fulfillment and decision keying

#### Proposed fix

##### TrustedOracleArbiter.sol

File: `contracts/src/arbiters/TrustedOracleArbiter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/TrustedOracleArbiter.sol)

```diff
 ... 30 unchanged lines ...
     IEAS eas;
     mapping(address => mapping(bytes32 => bool)) decisions;
+    mapping(address => mapping(bytes32 => bool)) decisionSet;
 
     constructor(IEAS _eas) {
         eas = _eas;
     }
 
     function arbitrate(bytes32 obligation, bytes memory demand, bool decision) public {
         bytes32 decisionKey = keccak256(abi.encodePacked(obligation, demand));
         decisions[msg.sender][decisionKey] = decision;
+        decisionSet[msg.sender][decisionKey] = true;
         emit ArbitrationMade(decisionKey, obligation, msg.sender, decision);
     }
 
     function requestArbitration(bytes32 _obligation, address oracle, bytes memory demand) public {
         Attestation memory obligation = eas.getAttestation(_obligation);
         if (
             obligation.attester != msg.sender &&
             obligation.recipient != msg.sender
         ) revert UnauthorizedArbitrationRequest();
 
         emit ArbitrationRequested(_obligation, oracle, demand);
     }
 
     function checkObligation(
         Attestation memory obligation,
         bytes memory demand,
         bytes32 /*fulfilling*/
     ) public view override returns (bool) {
         DemandData memory demand_ = abi.decode(demand, (DemandData));
-        bytes32 decisionKey = keccak256(abi.encodePacked(obligation.uid, demand_.data));
-        return decisions[demand_.oracle][decisionKey];
+        bytes32 innerKey = keccak256(abi.encodePacked(obligation.uid, demand_.data));
+        if (decisionSet[demand_.oracle][innerKey]) {
+            return decisions[demand_.oracle][innerKey];
+        }
+        bytes32 outerKey = keccak256(abi.encodePacked(obligation.uid, demand));
+        return decisions[demand_.oracle][outerKey];
     }
 
     function decodeDemandData(
         bytes calldata data
     ) public pure returns (DemandData memory) {
         return abi.decode(data, (DemandData));
     }
 }
```

### 17. [Informational] Unbound user-to-recipient identity in RedisProvisionObligation for tierable escrows causes unauthorized payout redirection

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

RedisProvisionObligation does not bind ObligationData.user to the attestation recipient and its checkObligation only compares demand.user to obligationData.user. Tierable escrows pay to fulfillment.recipient and do not require refUID linkage, enabling attackers to satisfy demand.user while redirecting payout to themselves.

RedisProvisionObligation.doObligation sets recipient = msg.sender and refUID = 0 without enforcing data.user == msg.sender. Its checkObligation validates demand.user == obligationData.user and other fields (capacity/egress/cpus/serverName/expiration), but never ensures the attestation recipient matches the demanded identity. Tierable escrows use the arbiter’s check and then transfer funds to fulfillment.recipient, and they do not require fulfillment.refUID == escrow.uid. Consequently, an attacker can mint a RedisProvisionObligation attestation that sets obligationData.user to the demanded user while keeping themselves as the attestation recipient, pass the arbiter check, and receive the escrowed assets. Non-tierable escrows are protected by refUID linkage and are not affected. Mitigations include enforcing user == recipient in RedisProvisionObligation (in doObligation or checkObligation), or composing with RecipientArbiter (e.g., via AllArbiter) so payout is restricted to the intended identity.

#### Severity

**Impact Explanation:** [High] Direct, material loss of escrowed principal (ERC20/ETH/token bundles) due to unauthorized payout to attacker.

**Likelihood Explanation:** [Low] Exploitation requires integrator/buyer misconfiguration: using a tierable escrow with the example RedisProvisionObligation as the sole arbiter and relying on demand.user for identity without enforcing recipient equality; these preconditions are outside attacker control.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Steal ERC20 escrow: Buyer uses tierable ERC20EscrowObligation with RedisProvisionObligation as arbiter and demand.user = VictimFulfiller. Attacker creates a RedisProvisionObligation attestation with obligationData.user = VictimFulfiller, matching required capacities and serverName, expiration adequate, refUID = 0, recipient = attacker. Collecting the escrow passes the arbiter check and transfers the ERC20 to the attacker.
#### Preconditions / Assumptions
- (a). Tierable ERC20EscrowObligation is used (no refUID linkage enforced)
- (b). Arbiter set to RedisProvisionObligation
- (c). Demand bytes encode RedisProvisionObligation.DemandData with replaces = 0, user = VictimFulfiller, required capacity/egress/cpus, serverName match, and expiration set such that demand.expiration <= attestation.expirationTime
- (d). No additional arbiter enforcing recipient equality (e.g., not composed with RecipientArbiter/AllArbiter)
- (e). Attacker can submit a RedisProvisionObligation attestation with recipient = attacker and obligationData.user = VictimFulfiller

### Scenario 2.
Steal native ETH escrow: Buyer uses tierable NativeTokenEscrowObligation with RedisProvisionObligation as arbiter and demand.user = VictimFulfiller. Attacker crafts a matching RedisProvisionObligation fulfillment as above. Collection pays ETH to the attacker as fulfillment.recipient.
#### Preconditions / Assumptions
- (a). Tierable NativeTokenEscrowObligation is used (no refUID linkage enforced)
- (b). Arbiter set to RedisProvisionObligation
- (c). Demand bytes encode RedisProvisionObligation.DemandData with replaces = 0, user = VictimFulfiller, required capacity/egress/cpus, serverName match, and expiration set such that demand.expiration <= attestation.expirationTime
- (d). No additional arbiter enforcing recipient equality (e.g., not composed with RecipientArbiter/AllArbiter)
- (e). Attacker can submit a RedisProvisionObligation attestation with recipient = attacker and obligationData.user = VictimFulfiller

### Scenario 3.
Steal mixed token bundle: Buyer uses tierable TokenBundleEscrowObligation with RedisProvisionObligation as arbiter and demand.user = VictimFulfiller. Attacker crafts a matching RedisProvisionObligation fulfillment. Collection transfers the entire token bundle to the attacker.
#### Preconditions / Assumptions
- (a). Tierable TokenBundleEscrowObligation is used (no refUID linkage enforced)
- (b). Arbiter set to RedisProvisionObligation
- (c). Demand bytes encode RedisProvisionObligation.DemandData with replaces = 0, user = VictimFulfiller, required capacity/egress/cpus, serverName match, and expiration set such that demand.expiration <= attestation.expirationTime
- (d). No additional arbiter enforcing recipient equality (e.g., not composed with RecipientArbiter/AllArbiter)
- (e). Attacker can submit a RedisProvisionObligation attestation with recipient = attacker and obligationData.user = VictimFulfiller

#### Proposed fix

##### RedisProvisionObligation.sol

File: `contracts/src/obligations/example/RedisProvisionObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/example/RedisProvisionObligation.sol)

```diff
 ... 40 unchanged lines ...
 
     error UnauthorizedCall();
+    error UserRecipientMismatch();
 
     constructor(
         IEAS _eas,
         ISchemaRegistry _schemaRegistry
     )
         BaseObligation(
             _eas,
             _schemaRegistry,
             "address user, uint256 capacity, uint256 egress, uint256 cpus, string memory serverName, string memory url",
             true
         )
     {}
 
+    // Enforce identity binding at attest-time: the declared user must be the attestation recipient
+    function _beforeAttest(
+        bytes memory data,
+        address /* payer */,
+        address recipient
+    ) internal override {
+        if (abi.decode(data, (ObligationData)).user != recipient) revert UserRecipientMismatch();
+    }
+
     function doObligation(
         ObligationData calldata data,
 ... 67 unchanged lines ...
         return
             demandData.replaces == obligation.refUID &&
+            demandData.user == obligation.recipient &&
             demandData.expiration <= obligation.expirationTime &&
             demandData.user == obligationData.user &&
             demandData.capacity <= obligationData.capacity &&
             demandData.egress <= obligationData.egress &&
             demandData.cpus <= obligationData.cpus &&
             keccak256(bytes(demandData.serverName)) ==
             keccak256(bytes(obligationData.serverName));
     }
 }
```

### 18. [Informational] Missing freshness/schema checks for referenced attestation in AttestationEscrowObligation2 _releaseEscrow causes permanent stale validation attestations to be accepted by integrators

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

AttestationEscrowObligation2 (non-tierable and tierable) mints a permanent, irrevocable validation attestation referencing a pre-made attestation without verifying the referenced attestation’s current validity (revocation/expiration) or schema. EAS enforces only existence for nonzero refUIDs. Integrators that treat these validations as proofs of current validity can be misled.

In both non-tierable and tierable AttestationEscrowObligation2 contracts, _releaseEscrow mints a validation attestation under VALIDATION_SCHEMA with expirationTime = 0 and revocable = false, setting refUID to the provided attestationUid and encoding it in data. The contract never checks that the referenced attestation is unrevoked, unexpired, or of an expected schema. Canonical EAS enforces refUID existence only (for nonzero refs) and does not check freshness, so a permanent validation can reference an already-stale attestation or one that becomes stale later. No on-chain mechanism exists to invalidate or reflect changes to the referenced attestation’s status. On-chain components in this repo do not consume these validations for value flows, but external integrators that interpret them as current validity may grant unauthorized or indefinite access.

#### Severity

**Impact Explanation:** [Low] No direct on-chain loss or core functionality failure within this repo; the issue is a logic/design hazard that can mislead external integrators, not directly causing protocol fund loss.

**Likelihood Explanation:** [Low] Exploitation relies on integrator/operator mistakes—trusting permanent validations as ongoing proof or failing to verify refUID and underlying attestation freshness.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
An attacker references an attestationUid that still exists in EAS but is revoked or expired. They create an escrow and a matching fulfillment so AttestationEscrowObligation2.checkObligation passes, then collect to mint a permanent, irrevocable validation attestation with refUID = the stale UID. An off-chain integrator that accepts such validations as current proof grants access or benefits indefinitely despite the underlying attestation being stale.
#### Preconditions / Assumptions
- (a). AttestationEscrowObligation2 (non-tierable or tierable) is deployed and used
- (b). Canonical EAS behavior: nonzero refUID must exist, freshness not enforced
- (c). Only the contract can mint to VALIDATION_SCHEMA (resolver gating)
- (d). The referenced attestationUid exists but is already revoked or expired
- (e). The integrator accepts VALIDATION_SCHEMA as proof of current validity without re-checking the referenced attestation’s revocation/expiration

### Scenario 2.
An attacker uses attestationUid = 0 when creating the escrow and matching fulfillment. Upon collection, the contract mints a permanent validation attestation with refUID = 0. A naive integrator that fails to enforce nonzero refUID and only checks for the presence of a validation attestation mistakenly grants access or benefits without any actual underlying attestation.
#### Preconditions / Assumptions
- (a). AttestationEscrowObligation2 is deployed and used
- (b). Canonical EAS allows refUID = 0
- (c). Only the contract can mint to VALIDATION_SCHEMA
- (d). The integrator does not enforce refUID != 0 and treats presence of validation as sufficient

### Scenario 3.
An attacker references a currently valid attestationUid, creates escrow and fulfillment, and collects to mint a permanent validation. Later, the referenced attestation is revoked or expires. The integrator, relying solely on the permanent validation and not re-checking the referenced attestation’s status, continues granting access or benefits despite the underlying attestation no longer being valid.
#### Preconditions / Assumptions
- (a). AttestationEscrowObligation2 is deployed and used
- (b). Canonical EAS behavior as above
- (c). Only the contract can mint to VALIDATION_SCHEMA
- (d). The referenced attestationUid is valid at the time of collection but later becomes revoked or expired
- (e). The integrator treats the permanent validation as ongoing proof and does not re-check the referenced attestation’s status after issuance

#### Proposed fix

##### AttestationEscrowObligation2.sol

File: `contracts/src/obligations/escrow/tierable/AttestationEscrowObligation2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/tierable/AttestationEscrowObligation2.sol)

```diff
 ... 61 unchanged lines ...
             (ObligationData)
         );
+        Attestation memory ref_ = eas.getAttestation(decoded.attestationUid);
+        require(decoded.attestationUid != bytes32(0), "InvalidRefUID");
+        require(ref_.revocationTime == 0 && (ref_.expirationTime == 0 || ref_.expirationTime > block.timestamp) && !ref_.revocable, "InvalidRef");
 
         // Create validation attestation
         bytes32 validationUid = eas.attest(
             AttestationRequest({
                 schema: VALIDATION_SCHEMA,
                 data: AttestationRequestData({
                     recipient: to,
-                    expirationTime: 0, // Permanent
+                    expirationTime: ref_.expirationTime,
                     revocable: false,
                     refUID: decoded.attestationUid,
 ... 85 unchanged lines ...
```

##### AttestationEscrowObligation2.sol

File: `contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/obligations/escrow/non-tierable/AttestationEscrowObligation2.sol)

```diff
 ... 61 unchanged lines ...
             (ObligationData)
         );
+        Attestation memory ref_ = eas.getAttestation(decoded.attestationUid);
+        require(decoded.attestationUid != bytes32(0), "InvalidRefUID");
+        require(ref_.revocationTime == 0 && (ref_.expirationTime == 0 || ref_.expirationTime > block.timestamp) && !ref_.revocable, "InvalidRef");
 
         // Create validation attestation
         bytes32 validationUid = eas.attest(
             AttestationRequest({
                 schema: VALIDATION_SCHEMA,
                 data: AttestationRequestData({
                     recipient: to,
-                    expirationTime: 0, // Permanent
+                    expirationTime: ref_.expirationTime,
                     revocable: false,
                     refUID: decoded.attestationUid,
 ... 85 unchanged lines ...
```

### 19. [Informational] Weak EIP-712-style domain separation in CryptoSignatureObligation._verifySignature causes cross-context signature replay and theft of escrowed funds

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

CryptoSignatureObligation verifies signatures using a non-standard EIP-712-style digest that does not bind chainId or verifying contract, allowing a single signature over a reused (domain, challenge) to be replayed across contracts or chains, releasing escrowed funds to the attacker who mints the fulfillment attestation.

In CryptoSignatureObligation, the EIP-712-style branch computes the digest as keccak256("\x19\x01" || keccak256(bytes(domain)) || challenge), omitting chainId and verifying contract. If two contexts reuse the same (domain, challenge) pair, the resulting digest is identical and a single valid 65-byte ECDSA signature from the expected signer will verify in both. BaseEscrowObligation pays the escrowed funds to the fulfillment attestation's recipient (the caller who minted it), not necessarily the signer. Therefore, if an attacker obtains a valid signature over a reused (domain, challenge), they can mint a fulfillment attestation referencing the escrow and collect the funds. The issue is integrator-dependent (requires reused/predictable (domain, challenge)) and this contract is an example; nevertheless, the end-to-end exploit is real if adopted as-is.

#### Severity

**Impact Explanation:** [High] Escrowed ETH/tokens can be released to the attacker instead of the intended seller or returned to the buyer, constituting direct, material loss of principal funds.

**Likelihood Explanation:** [Low] Exploitation depends on operator/integrator misconfiguration by reusing or poorly constructing (domain, challenge) and on the attacker obtaining a valid signature for that exact digest; these are constraints outside the attacker’s full control.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Scenario 1 (cross-chain, personal_sign): A buyer funds a non-tierable escrow with arbiter=CryptoSignatureObligation and demand={publicKey=seller, domain="", challenge=X}. A valid personal_sign signature S over keccak256("\x19Ethereum Signed Message:\n32"||X) from the seller exists on another chain (or earlier). The attacker mints a fulfillment attestation on the buyer’s chain using S and refUID=escrowUID, making themselves the recipient. collectEscrow verifies the signature and pays the attacker.
#### Preconditions / Assumptions
- (a). Buyer selects CryptoSignatureObligation as arbiter and funds a non-tierable escrow.
- (b). Demand uses domain="" (personal_sign branch) and a reused/predictable challenge X.
- (c). A valid 65-byte personal_sign signature S over keccak256("\x19Ethereum Signed Message:\n32"||X) by the seller is available to the attacker.
- (d). Attacker can mint a fulfillment attestation with refUID=the escrow UID.

### Scenario 2.
Scenario 2 (cross-contract, EIP-712-style): Two deployments on the same chain use CryptoSignatureObligation with a constant domain string (e.g., "MyDapp") and challenge X. A valid signature S over keccak256("\x19\x01"||keccak256("MyDapp")||X) is public from Dapp A. In Dapp B, a buyer escrows tokens with demand={seller, X, "MyDapp"}. The attacker reuses S to mint a fulfillment referencing Dapp B’s escrow and collects the funds.
#### Preconditions / Assumptions
- (a). Two deployments on the same chain both use CryptoSignatureObligation.
- (b). Both choose a constant domain string (e.g., "MyDapp") and reuse the same challenge X.
- (c). A valid signature S over keccak256("\x19\x01"||keccak256("MyDapp")||X) by the seller is available to the attacker from Dapp A.
- (d). A buyer in Dapp B funds a non-tierable escrow with demand={seller, X, "MyDapp"} and arbiter=CryptoSignatureObligation.

### Scenario 3.
Scenario 3 (tierable mass-drain): Multiple buyers create tierable escrows all using arbiter=CryptoSignatureObligation and the same (domain, challenge). A single valid signature S over that digest becomes known. The attacker mints one fulfillment attestation (no refUID requirement in tierable flow) and uses it to collect multiple escrows’ funds, since checkObligation validates the same signature for each.
#### Preconditions / Assumptions
- (a). Multiple buyers create tierable escrows using CryptoSignatureObligation with identical (domain, challenge).
- (b). A valid signature S over the shared digest is known to the attacker.
- (c). Tierable flow does not require fulfillment.refUID to match a specific escrow; a single fulfillment can be reused.

#### Proposed fix

##### CryptoSignatureObligation.sol

File: `contracts/src/arbiters/example/CryptoSignatureObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a8bdbef3088cbb520320d2455e9a29879467d9e5/contracts/src/arbiters/example/CryptoSignatureObligation.sol)

```diff
 ... 183 unchanged lines ...
         address expectedSigner,
         string memory domain
-    ) internal pure returns (bool) {
+    ) internal view returns (bool) {
         if (signature.length != 65) {
             return false;
         }
 
         bytes32 r;
         bytes32 s;
         uint8 v;
 
         assembly {
             r := mload(add(signature, 32))
             s := mload(add(signature, 64))
             v := byte(0, mload(add(signature, 96)))
         }
 
         // Handle both v = 27/28 and v = 0/1 formats
         if (v < 27) {
             v += 27;
         }
 
         // Create the message hash based on whether we have a domain
         bytes32 messageHash;
         if (bytes(domain).length > 0) {
-            // EIP-712 style with domain
-            messageHash = keccak256(
-                abi.encodePacked(
-                    "\x19\x01",
-                    keccak256(bytes(domain)),
-                    challenge
-                )
-            );
+            // EIP-712 style with domain (bind chainId and verifying contract)
+            bytes32 domainSep = keccak256(abi.encode(block.chainid, address(this), domain));
+            messageHash = keccak256(abi.encodePacked("\x19\x01", domainSep, challenge));
         } else {
-            // Simple Ethereum signed message
-            messageHash = keccak256(
-                abi.encodePacked("\x19Ethereum Signed Message:\n32", challenge)
-            );
+            // Simple Ethereum signed message (bind chainId and verifying contract)
+            bytes32 bound = keccak256(abi.encode(block.chainid, address(this), challenge));
+            messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", bound));
         }
 
 ... 92 unchanged lines ...
         bytes32 challenge,
         bytes calldata signature
-    ) external pure returns (bool valid) {
+    ) external view returns (bool valid) {
         return _verifySignature(challenge, signature, publicKey, "");
     }
 ... 24 unchanged lines ...
```
