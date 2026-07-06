# alkahest (fix-octane-audit) analysis report

- Repository: `arkhai-io/alkahest`
- Analysis date: 2026-04-13
- Vulnerabilities: 20
- Warnings: 7

## Summary

This analysis reviewed the alkahest (fix-octane-audit) smart contracts using Octane's automated analysis and included team feedback on findings.

The analysis identified a total of 27 issues (20 vulnerabilities, 7 warnings), including 3 critical vulnerabilities.

After triage and review, 1 of these issues have been acknowledged.

## Vulnerabilities

### 1. [Critical] Demand ignored in CommitRevealObligation.checkObligation used by escrows causes unauthorized release of escrowed assets

#### Status

Review status: False Positive
Remediation status: Acknowledged
Remediation note: Created by pipeline analysis
Acknowledgement reason: False Positive
Acknowledgement note: CommitRevealObligation's checkObligation only checks the commit reveal mechanism. compose with other arbiters via AllArbiter for other demands

#### Description

CommitRevealObligation’s arbiter check ignores the escrow’s demand and the fulfilling parameter, allowing any valid commit–reveal attestation to satisfy an escrow guarded by this arbiter. In non-tierable escrows, an attacker can commit to the escrow’s uid with arbitrary data and themselves as recipient, then reveal and collect the escrow. In tierable escrows, any valid reveal from this arbiter can collect multiple escrows due to lack of binding.

Non-tierable escrows (BaseEscrowObligation) enforce only that a fulfillment attestation references the escrow (fulfillment.refUID == escrow.uid) before delegating authorization to the arbiter via checkObligation(fulfillment, demand, escrow.uid). Tierable escrows (BaseEscrowObligationTierable) intentionally do not enforce refUID equality and rely on the arbiter to bind the fulfillment to the escrow via the demand. CommitRevealObligation.checkObligation explicitly ignores both demand and fulfilling; it validates only that a prior commitment exists for (obligation.refUID, obligation.recipient, keccak256(obligation.data)) and that the reveal is timely and from a prior block. As a result, an attacker can compute a commitment against a known escrow uid and their own address with arbitrary data, commit, wait one block, reveal to mint a valid fulfillment, and then collect the escrowed assets to themselves. For tierable escrows using this arbiter, any single valid reveal can be reused to collect multiple escrows, since the arbiter does not enforce demand-based binding. The bond required for commit is refunded upon reveal, leaving only gas costs, and hooks simply transfer custody to the fulfillment recipient upon arbiter approval.

#### Severity

**Impact Explanation:** [High] Unauthorized release of users’ principal assets (ERC20, ETH, NFTs) from escrow, resulting in direct, material loss.

**Likelihood Explanation:** [High] Once an escrow uses this arbiter, exploitation requires no special conditions: the attacker can commit and reveal with arbitrary data, the bond is refunded on reveal, the escrow uid is public, and only a one-block wait is needed.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Non-tierable ERC20 escrow theft: A HookEscrowObligation escrow holds 1,000 USDC via ERC20EscrowHook with arbiter=CommitRevealObligation. The attacker observes the escrow uid U, computes a commitment for (U, attacker, arbitrary data), calls commit with the bond, waits one block, calls doObligationFor(data, attacker, U) to mint a valid fulfillment, then calls collectEscrow(U, fulfillment). The arbiter ignores demand and approves; the hook releases 1,000 USDC to the attacker.
#### Preconditions / Assumptions
- (a). At least one non-tierable escrow (BaseEscrowObligation) exists with arbiter set to CommitRevealObligation and hook=ERC20EscrowHook holding 1,000 USDC
- (b). The escrow attestation uid U is publicly known onchain
- (c). Standard ERC20 behavior (no fee/rebase) and functioning EAS/Schemas as assumed
- (d). Commit deadline window has not elapsed; attacker can wait at least one block between commit and reveal

### Scenario 2.
Non-tierable ETH escrow theft: A HookEscrowObligation escrow holds X ETH via NativeTokenEscrowHook with arbiter=CommitRevealObligation. The attacker follows the same commit–reveal flow against the escrow uid U and calls collectEscrow(U, fulfillment). The arbiter approves and the hook transfers X ETH to the attacker.
#### Preconditions / Assumptions
- (a). At least one non-tierable escrow (BaseEscrowObligation) exists with arbiter set to CommitRevealObligation and hook=NativeTokenEscrowHook holding X ETH
- (b). The escrow attestation uid U is publicly known onchain
- (c). Functioning EAS/Schemas and standard network conditions
- (d). Commit deadline window has not elapsed; attacker can wait at least one block between commit and reveal

### Scenario 3.
Tierable multi-escrow drain: Multiple tierable escrows use CommitRevealObligation as arbiter. The attacker creates any valid reveal once (for some (refUID0, attacker, data0)), obtaining a fulfillment attestation. For each escrow Ei, the attacker calls collectEscrowRaw(Ei.uid, fulfillment). Since the arbiter ignores demand and fulfilling, it approves each call, and each escrow releases its assets to the attacker.
#### Preconditions / Assumptions
- (a). At least one tierable escrow (BaseEscrowObligationTierable) exists with arbiter set to CommitRevealObligation (multiple escrows for multi-drain impact)
- (b). Functioning EAS/Schemas and standard network conditions
- (c). The attacker can produce any valid commit–reveal fulfillment from CommitRevealObligation

#### Proposed fix

##### CommitRevealObligation.sol

File: `contracts/src/obligations/CommitRevealObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/CommitRevealObligation.sol)

```diff
 ... 241 unchanged lines ...
         }
 
+        // Bind reveal content to escrow demand: expect demand to equal keccak256(obligation.data)
+        // This ensures only a party revealing the correct payload/salt/schema can satisfy the demand.
+        if (demand.length != 32 || abi.decode(demand, (bytes32)) != keccak256(obligation.data)) {
+            return false;
+        }
+
         return true;
     }
 ... 37 unchanged lines ...
```

### 2. [Critical] Missing authorization in AllEscrowHook.onRelease/onReturn causes arbitrary theft of escrowed assets

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

AllEscrowHook exposes onRelease/onReturn without caller authorization while leaf hooks track deposits by msg.sender. When composed, deposits are keyed to AllEscrowHook, enabling any caller to invoke AllEscrowHook.onRelease/onReturn with the escrow’s hookData and direct funds to an arbitrary address. Additionally, unbounded iteration over sub-hooks allows a depositor to compose cheap-on-lock/expensive-on-release hooks to make collection infeasible (DoS) while keeping lock and return feasible.

AllEscrowHook decodes HookData (arrays of hooks, hookDatas, and values) and iterates over decoded.hooks for onLock/onRelease/onReturn. It performs no access control on onRelease/onReturn. Leaf hooks (ERC20/721/1155/Native) record deposits keyed by msg.sender during onLock; when called via AllEscrowHook, msg.sender is AllEscrowHook, not the escrow contract or a specific escrow ID. As a result, anyone can read the escrow’s hookData from the attestation, call AllEscrowHook.onRelease or onReturn, and have the leaf hooks transfer escrowed assets to an attacker-chosen address because the deposits match msg.sender == AllEscrowHook. Separately, because AllEscrowHook iterates unboundedly and sub-hooks like AttestationEscrowHook are cheap onLock (set pending) but expensive onRelease (EAS attest), a malicious depositor can include many such sub-hooks to make release exceed block gas limits, preventing a legitimate fulfiller from collecting, while still allowing the depositor to reclaim after a short expiry (onReturn is cheap). Nested AllEscrowHook compositions further amplify this DoS.

#### Severity

**Impact Explanation:** [High] Unauthorized release/return allows direct, material loss of principal funds; DoS scenarios break the core escrow functionality (collection upon valid fulfillment) for affected escrows.

**Likelihood Explanation:** [High] Exploitation requires no special constraints: AllEscrowHook and leaf hooks are first-party, escrow data is public, and attacker can freely call public functions or choose malicious compositions.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Unauthorized theft: A victim creates an escrow via HookEscrowObligation with hook=AllEscrowHook and at least one asset-holding leaf (e.g., ERC20EscrowHook). After onLock, deposits are recorded under msg.sender = AllEscrowHook. An attacker reads the escrow’s hookData from the attestation and calls AllEscrowHook.onRelease(data=hookData, to=attacker), causing each leaf hook to transfer the escrowed assets to the attacker because deposits[msg.sender] matches AllEscrowHook.
#### Preconditions / Assumptions
- (a). Escrow is created via HookEscrowObligation with hook set to AllEscrowHook
- (b). hookData encodes at least one asset-holding leaf hook (ERC20/721/1155/Native)
- (c). Escrow attestation data (including hookData) is publicly readable
- (d). AllEscrowHook.onRelease/onReturn are externally callable and have no authorization
- (e). Leaf hooks track deposits by msg.sender and do not verify the escrow parameter

### Scenario 2.
DoS on collection with asymmetric sub-hooks: A malicious depositor creates an escrow using AllEscrowHook with one ERC20EscrowHook and many AttestationEscrowHook entries. onLock is feasible (one ERC20 transfer and many cheap pending=true writes). When a legitimate fulfiller calls collectEscrow, AllEscrowHook.onRelease must perform one ERC20 transfer and many expensive EAS attest operations, exceeding block gas and reverting, thereby preventing collection. The depositor later reclaims via reclaimExpired because onReturn is cheap.
#### Preconditions / Assumptions
- (a). Attacker is the depositor and chooses hook=AllEscrowHook
- (b). hookData includes one asset leaf (e.g., ERC20EscrowHook) and many AttestationEscrowHook entries
- (c). AttestationEscrowHook is cheap on lock (set pending) and expensive on release (EAS attest)
- (d). Expiration time is short enough for attacker to reclaim before a workaround
- (e). Fulfiller obtains a valid fulfillment and attempts collection

### Scenario 3.
Amplified DoS via nested composition: The attacker nests AllEscrowHook inside AllEscrowHook and fills inner compositions with many AttestationEscrowHook leaves. onLock remains feasible due to cheap pending writes, but onRelease triggers a multiplicative number of expensive attest calls, making collection infeasible while still allowing reclaim via onReturn after a short expiry.
#### Preconditions / Assumptions
- (a). Attacker is the depositor and can nest AllEscrowHook inside itself
- (b). Inner AllEscrowHook compositions include many AttestationEscrowHook leaves
- (c). Asymmetric gas profile persists (cheap on lock, expensive on release)
- (d). Expiration time is short enough for attacker to reclaim; or collection is infeasible due to gas limits

#### Proposed fix

##### AllEscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AllEscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AllEscrowHook.sol)

```diff
 ... 37 unchanged lines ...
     error ValueMismatch(uint256 expected, uint256 received);
 
+    mapping(address => mapping(bytes32 => uint256)) public pendingCount;
+
     // ──────────────────────────────────────────────
 
     function onLock(
         bytes calldata data,
         address from,
         address escrow
     ) external payable override {
+        require(msg.sender == escrow);
         HookData memory decoded = abi.decode(data, (HookData));
         _validateLengths(decoded);
 
         uint256 totalValue;
         for (uint256 i = 0; i < decoded.values.length; i++) {
             totalValue += decoded.values[i];
         }
         if (msg.value != totalValue) {
             revert ValueMismatch(totalValue, msg.value);
         }
+        pendingCount[escrow][keccak256(data)]++;
 
         for (uint256 i = 0; i < decoded.hooks.length; i++) {
             IEscrowHook(decoded.hooks[i]).onLock{value: decoded.values[i]}(
                 decoded.hookDatas[i],
                 from,
                 escrow
             );
         }
     }
 
     function onRelease(
         bytes calldata data,
         address to,
         address escrow
     ) external override {
+        require(msg.sender == escrow);
+        require(pendingCount[escrow][keccak256(data)] > 0);
         HookData memory decoded = abi.decode(data, (HookData));
+        require(msg.sender == escrow);
+        require(pendingCount[escrow][keccak256(data)] > 0);
         _validateLengths(decoded);
 
         for (uint256 i = 0; i < decoded.hooks.length; i++) {
             IEscrowHook(decoded.hooks[i]).onRelease(
                 decoded.hookDatas[i],
                 to,
                 escrow
             );
         }
+        pendingCount[escrow][keccak256(data)]--;
     }
 
     function onReturn(
         bytes calldata data,
         address to,
         address escrow
     ) external override {
         HookData memory decoded = abi.decode(data, (HookData));
         _validateLengths(decoded);
 
         for (uint256 i = 0; i < decoded.hooks.length; i++) {
             IEscrowHook(decoded.hooks[i]).onReturn(
                 decoded.hookDatas[i],
                 to,
                 escrow
             );
         }
+        pendingCount[escrow][keccak256(data)]--;
     }
 
 ... 25 unchanged lines ...
```

#### Related findings

##### [Critical] Missing access control and per-escrow identity in AllEscrowHook/IEscrowHook causes theft of escrowed assets

###### Description

AllEscrowHook forwards calls to leaf hooks without access control, while leaf hooks authorize solely by msg.sender and ignore any per-escrow identifier. When composed through AllEscrowHook, anyone can trigger releases/returns of pooled deposits to arbitrary recipients. Additionally, with prior ERC20 approvals, attackers can force deposits from victims and immediately drain them. Attestation hooks also suffer a DoS due to boolean pending keyed only by (caller, dataHash).

The IEscrowHook interface and its usage in AllEscrowHook and the provided leaf hooks lack a per-escrow identifier and rely on msg.sender-based accounting. AllEscrowHook publicly exposes onLock/onRelease/onReturn and simply forwards to leaf hooks. Leaf hooks (ERC20/721/1155/NativeToken) key deposits by msg.sender and do not validate the provided escrow address parameter. When invoked via AllEscrowHook, leaf hooks see msg.sender = AllEscrowHook. Because AllEscrowHook is permissionless, any external account can call AllEscrowHook.onRelease/onReturn and cause leaf hooks to release pooled deposits recorded under AllEscrowHook to an arbitrary recipient, bypassing EAS or arbiter checks. Furthermore, if a user has previously granted approval to a leaf hook (e.g., ERC20EscrowHook for a token), an attacker can call AllEscrowHook.onLock with from = victim to pull funds into the leaf, then immediately call onRelease to steal them. Separately, AttestationEscrowHook and AttestationEscrowHook2 track a boolean pending state keyed only by (msg.sender, keccak256(hookData)). Multiple escrows with identical hookData under the same caller (especially when routed via AllEscrowHook) collide on this single boolean, making only one releasable and causing subsequent releases to revert (functional DoS).

###### Severity

**Impact Explanation:** [High] Public arbitrary release of escrowed assets and forced deposits via prior approvals result in direct, material loss of principal funds. The attestation hooks cause significant availability/DoS when identical hookData is reused under the same caller.

**Likelihood Explanation:** [High] AllEscrowHook is an intended first-party component for composition and is permissionless; ERC20 approvals are standard in normal use; attackers face no special constraints to exploit these paths once such configurations exist.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Draining existing ERC20 escrow deposits: A victim escrows ERC20 via HookEscrowObligation using AllEscrowHook → ERC20EscrowHook. The deposit is recorded under deposits[AllEscrowHook][token]. An attacker directly calls AllEscrowHook.onRelease with matching HookData and to = attacker, causing ERC20EscrowHook to transfer the escrowed tokens to the attacker.
#### Preconditions / Assumptions
- (a). Deployment uses AllEscrowHook as the hook for a HookEscrowObligation escrow.
- (b). AllEscrowHook composes a leaf asset hook (e.g., ERC20EscrowHook) with specific HookData.
- (c). The victim previously locked assets via HookEscrowObligation → AllEscrowHook so the leaf records a deposit under AllEscrowHook.
- (d). The attacker knows or can infer the HookData (e.g., token and amount).

### Scenario 2.
Forced ERC20 deposit and drain via prior approvals: A victim previously approved ERC20EscrowHook for token T. The attacker calls AllEscrowHook.onLock with from = victim and HookData {T, A}, pulling A from the victim into ERC20EscrowHook (credited under AllEscrowHook), then immediately calls AllEscrowHook.onRelease to transfer A to the attacker.
#### Preconditions / Assumptions
- (a). Victim has granted ERC20 approval to ERC20EscrowHook for token T (common in normal UX).
- (b). AllEscrowHook is deployed and publicly callable.
- (c). Attacker selects an amount within the victim’s allowance and knows the victim address and token.

### Scenario 3.
AttestationEscrowHook/2 DoS with identical hookData: Two escrows created under the same caller identity (e.g., via the same AllEscrowHook) use identical hookData for AttestationEscrowHook or AttestationEscrowHook2. The first release flips a single pending boolean to false; the second release reverts (NoPending), blocking attestation issuance and, if composed, reverting the aggregate release.
#### Preconditions / Assumptions
- (a). Two or more escrows use AttestationEscrowHook or AttestationEscrowHook2 under the same caller identity from the hook’s perspective (e.g., both routed via the same AllEscrowHook).
- (b). The escrows use identical hookData (same data bytes, same dataHash).
- (c). If composed with asset hooks, a revert in the attestation sub-hook causes the aggregate onRelease to revert.

###### Proposed fix

####### AllEscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AllEscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AllEscrowHook.sol)

```diff
 ... 37 unchanged lines ...
     error ValueMismatch(uint256 expected, uint256 received);
 
+    // Only the trusted orchestrator (e.g., a HookEscrowObligation) may call this aggregator.
+    address public immutable TRUSTED_CALLER;
+
+    constructor(address trustedCaller_) {
+        TRUSTED_CALLER = trustedCaller_;
+    }
     // ──────────────────────────────────────────────
 
     function onLock(
         bytes calldata data,
         address from,
         address escrow
     ) external payable override {
+        require(msg.sender == TRUSTED_CALLER, "UnauthorizedCaller");
         HookData memory decoded = abi.decode(data, (HookData));
         _validateLengths(decoded);
 ... 21 unchanged lines ...
         address escrow
     ) external override {
+        require(msg.sender == TRUSTED_CALLER, "UnauthorizedCaller");
         HookData memory decoded = abi.decode(data, (HookData));
         _validateLengths(decoded);
 
         for (uint256 i = 0; i < decoded.hooks.length; i++) {
             IEscrowHook(decoded.hooks[i]).onRelease(
                 decoded.hookDatas[i],
                 to,
                 escrow
             );
         }
     }
 
     function onReturn(
         bytes calldata data,
         address to,
         address escrow
     ) external override {
+        require(msg.sender == TRUSTED_CALLER, "UnauthorizedCaller");
         HookData memory decoded = abi.decode(data, (HookData));
         _validateLengths(decoded);
 ... 35 unchanged lines ...
```

##### [Critical] Missing caller authorization and escrow binding in IEscrowHook hooks (ERC20/721/1155/AllEscrow) causes arbitrary theft of escrowed or approved assets

###### Description

Hook-based escrow contracts are permissionless, ignore the escrow parameter, and key deposits solely by msg.sender. Because intended use requires users to approve these hooks (or send ETH/setApprovalForAll), any third party can lock assets from victims and then release them to themselves. When assets are escrowed via AllEscrowHook, anyone can call onRelease to drain all escrowed assets directly, bypassing the attestation/arbiter flow.

ERC20EscrowHook.onLock performs transferFrom(from, address(this), amount) using the hook’s allowance and credits deposits[msg.sender][token] without verifying the caller or binding to an escrow. onRelease/onReturn debit this balance and transfer to any to address. ERC721EscrowHook and ERC1155EscrowHook mirror this pattern using setApprovalForAll. NativeTokenEscrowHook credits deposits[msg.sender] with msg.value and releases to any to. AllEscrowHook is also permissionless and simply forwards onLock/onRelease/onReturn to sub-hooks; leaf hooks track deposits under msg.sender = AllEscrowHook during lock, so any caller can invoke AllEscrowHook.onRelease and have sub-hooks transfer assets to an arbitrary recipient. This enables direct theft of ETH, ERC20, ERC721, and ERC1155 assets from compliant users or directly from escrows created via AllEscrowHook, bypassing EAS/arbiter checks.

###### Severity

**Impact Explanation:** [High] Direct, material loss of principal funds across ETH, ERC20, ERC721, and ERC1155 assets due to arbitrary third-party release/drain from hooks or via AllEscrowHook.

**Likelihood Explanation:** [High] No special constraints beyond intended usage (escrows exist, approvals/setApprovalForAll granted). All calls are permissionless, data is public, and the attack requires only standard transactions.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
AllEscrowHook drain: A user creates an escrow via HookEscrowObligation using AllEscrowHook with sub-hooks (e.g., NativeTokenEscrowHook, ERC20EscrowHook). After onLock has deposited assets under AllEscrowHook’s msg.sender, an attacker reads the public attestation to obtain hookData and calls AllEscrowHook.onRelease(hookData, to=attacker). All sub-hooks release their held assets to the attacker because deposits are keyed to AllEscrowHook and there is no caller authorization.
#### Preconditions / Assumptions
- (a). An escrow exists using AllEscrowHook with one or more asset-holding sub-hooks (e.g., NativeTokenEscrowHook, ERC20/721/1155 hooks).
- (b). HookEscrowObligation has already called onLock, so leaf hooks recorded deposits under msg.sender = AllEscrowHook.
- (c). Escrow attestation data is publicly readable (standard EAS behavior) so the attacker can reconstruct hookData.
- (d). Assets remain held by the leaf hooks (escrow not yet legitimately released).
- (e). Standard token behavior (no fee-on-transfer/rebasing/hooks) per assumptions.

### Scenario 2.
ERC20 drain via approval: A victim has approved ERC20EscrowHook for token T as required for normal use. The attacker calls ERC20EscrowHook.onLock(data={T,X}, from=victim) to pull X tokens from the victim into the hook (using the hook’s allowance) and credits deposits[attacker][T]. The attacker then calls onRelease(data, to=attacker) to transfer X tokens to themselves, repeating up to the approved amount.
#### Preconditions / Assumptions
- (a). Victim has approved ERC20EscrowHook for token T (intended usage for legitimate escrows).
- (b). Victim’s balance and allowance are sufficient for amount X.
- (c). Standard ERC-20 behavior (no fee-on-transfer/rebasing/hooks) per assumptions.

### Scenario 3.
ERC721/1155 theft via setApprovalForAll: A victim has setApprovalForAll to the corresponding hook for a token contract. The attacker calls onLock(data={token,id/amount}, from=victim) to move the NFT/1155 tokens into the hook and credit deposits[attacker]. The attacker then calls onRelease(data, to=attacker) to receive the assets.
#### Preconditions / Assumptions
- (a). Victim has setApprovalForAll to the ERC721EscrowHook or ERC1155EscrowHook for a given token contract (intended usage).
- (b). Victim owns the specified tokenId(s)/amounts.
- (c). Standard ERC-721/1155 behavior per assumptions.

###### Proposed fix

####### ERC20EscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/ERC20EscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/ERC20EscrowHook.sol)

```diff
 ... 42 unchanged lines ...
     // ──────────────────────────────────────────────
 
+    // SECURITY: Restrict onLock/onRelease/onReturn to authorized callers (escrow obligation and/or aggregator).
+    // Without caller authorization, arbitrary callers can pull approved assets and drain deposits.
     function onLock(
         bytes calldata data,
 ... 98 unchanged lines ...
```

####### ERC721EscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/ERC721EscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/ERC721EscrowHook.sol)

```diff
 ... 30 unchanged lines ...
     // ──────────────────────────────────────────────
 
+    // SECURITY: Restrict onLock/onRelease/onReturn to authorized callers (escrow obligation and/or aggregator).
+    // Without caller authorization, arbitrary callers can pull approved assets and drain deposits.
     function onLock(
         bytes calldata data,
 ... 112 unchanged lines ...
```

####### ERC1155EscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/ERC1155EscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/ERC1155EscrowHook.sol)

```diff
 ... 40 unchanged lines ...
     // ──────────────────────────────────────────────
 
+    // SECURITY: Restrict onLock/onRelease/onReturn to authorized callers (escrow obligation and/or aggregator).
+    // Without caller authorization, arbitrary callers can pull approved assets and drain deposits.
     function onLock(
         bytes calldata data,
 ... 142 unchanged lines ...
```

####### NativeTokenEscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/NativeTokenEscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/NativeTokenEscrowHook.sol)

```diff
 ... 27 unchanged lines ...
     // ──────────────────────────────────────────────
 
+    // SECURITY: Restrict onLock/onRelease/onReturn to authorized callers (escrow obligation and/or aggregator).
+    // Without caller authorization, arbitrary callers can drain deposits by invoking releases.
     function onLock(
         bytes calldata data,
 ... 71 unchanged lines ...
```

####### AllEscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AllEscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AllEscrowHook.sol)

```diff
 ... 39 unchanged lines ...
     // ──────────────────────────────────────────────
 
+    // SECURITY: Restrict onLock/onRelease/onReturn to authorized escrow obligations only.
+    // Without caller authorization, anyone can trigger sub-hook releases and drain escrowed assets.
     function onLock(
         bytes calldata data,
 ... 82 unchanged lines ...
```

### 3. [Critical] Overwritable fulfiller mapping and per-split EXECUTOR_SENTINEL resolution in splitter contracts causes misdirection/theft of sentinel payouts

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

The splitter contracts resolve EXECUTOR_SENTINEL to fulfillers[fulfillment] per split, while createFulfillment allows any caller to set or overwrite fulfillers[uid] for any UID by trusting an arbitrary obligation contract’s returned UID. As a result, an attacker can preemptively or reentrantly hijack sentinel-designated payouts, redirecting ETH/tokens to themselves. NonReentrant on collect functions is ineffective because the critical mapping is mutated via a different, unguarded entrypoint.

All splitters (TokenBundleSplitterBase and the ERC20/Native/1155 variants) support EXECUTOR_SENTINEL, resolving it at distribution time to fulfillers[fulfillment]. The mapping fulfillers is written in createFulfillment, which trusts the bytes32 UID returned by an arbitrary obligationContract.doObligationRaw, without verifying the UID corresponds to a real EAS attestation or enforcing a set-once policy. Thus, any account can set or overwrite fulfillers[uid] for any fulfillment UID by passing a malicious obligation that returns the chosen UID. During collectAndDistribute/unsafePartiallyCollectAndDistribute, the splitter re-reads fulfillers[fulfillment] for each split. Therefore, an attacker can preemptively overwrite fulfillers[fulfillment] before distribution so that all EXECUTOR_SENTINEL splits pay the attacker. In TokenBundleSplitterBase, distribution also makes callback-capable external calls (ETH .call, ERC721/1155 safeTransferFrom), allowing reentrancy into createFulfillment mid-loop to hijack later sentinel splits; the collect functions are nonReentrant, but createFulfillment is not, and there is no caching of the fulfiller at function entry. BaseEscrowObligation.collectEscrowRaw ensures the escrow is valid and releases to the fulfillment recipient (the splitter), but does not mitigate the sentinel hijack. This results in misdirection and theft of sentinel-based payouts across all affected splitter contracts.

#### Severity

**Impact Explanation:** [High] Direct, material loss of principal funds by misdirecting ETH/tokens designated for EXECUTOR_SENTINEL recipients to the attacker.

**Likelihood Explanation:** [High] No special constraints for preemptive overwrite: fulfillment UID is public once valid, sentinel usage is intended, and createFulfillment is a public, unguarded entrypoint. Reentrancy is not required for the most severe scenarios.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Preemptive overwrite (no reentrancy): After a valid fulfillment UID exists and the oracle has submitted a decision containing EXECUTOR_SENTINEL recipients, the attacker calls createFulfillment with a malicious obligation that returns the known fulfillment UID, setting fulfillers[fulfillment] = attacker. When a user later calls collectAndDistribute, all sentinel-designated payouts resolve to the attacker and are misdirected.
#### Preconditions / Assumptions
- (a). A valid escrow attestation (escrow UID) exists under a compatible escrow obligation and is ready for collection.
- (b). A valid fulfillment attestation (fulfillment UID) exists whose recipient is the splitter contract (as intended).
- (c). The oracle has submitted a decision for (fulfillment, escrow) that includes at least one EXECUTOR_SENTINEL recipient.
- (d). The attacker can read the public fulfillment UID on-chain.

### Scenario 2.
Mid-call hijack via reentrancy in bundle distribution: An early split in the TokenBundleSplitterBase decision sends ETH or ERC721/1155 to an attacker-controlled contract. In the recipient callback (fallback/onERC721Received/onERC1155Received), the attacker calls createFulfillment with a malicious obligation returning the current fulfillment UID, overwriting fulfillers[fulfillment] mid-execution. Later sentinel splits in the same call then resolve to the attacker and are misdirected.
#### Preconditions / Assumptions
- (a). All preconditions from Scenario 1.
- (b). In TokenBundleSplitterBase, an earlier split sends ETH or ERC721/1155 to an attacker-controlled contract, triggering a reentrant callback.
- (c). There is at least one later split whose recipient is EXECUTOR_SENTINEL.

### Scenario 3.
Cross-splitter preemptive overwrite on ERC20/Native/1155 splitters: For ERC20Splitter, NativeTokenSplitter, or ERC1155Splitter, once the fulfillment UID and decision with sentinel recipients exist, the attacker preemptively sets fulfillers[fulfillment] = attacker using createFulfillment and a malicious obligation. Subsequent collectAndDistribute resolves all sentinel recipients to the attacker, misdirecting those payouts.
#### Preconditions / Assumptions
- (a). A valid escrow and fulfillment UID exist for the target splitter (ERC20/Native/1155).
- (b). The oracle’s decision for (fulfillment, escrow) includes at least one EXECUTOR_SENTINEL recipient.
- (c). The attacker knows the public fulfillment UID on-chain.

#### Proposed fix

##### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 112 unchanged lines ...
     }
 
-    function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID) external payable returns (bytes32 fulfillmentUid) {
+    function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID) external payable nonReentrant returns (bytes32 fulfillmentUid) {
         fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
+        require(fulfillers[fulfillmentUid] == address(0), "FULFILLER_SET");
         fulfillers[fulfillmentUid] = msg.sender;
         emit FulfillmentCreated(fulfillmentUid, msg.sender, obligationContract);
 ... 116 unchanged lines ...
```

##### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 79 unchanged lines ...
     }
 
-    function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID) external payable returns (bytes32 fulfillmentUid) {
+    function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID) external payable nonReentrant returns (bytes32 fulfillmentUid) {
         fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
+        require(fulfillers[fulfillmentUid] == address(0), "FULFILLER_SET");
         fulfillers[fulfillmentUid] = msg.sender;
         emit FulfillmentCreated(fulfillmentUid, msg.sender, obligationContract);
 ... 54 unchanged lines ...
```

##### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 77 unchanged lines ...
     }
 
-    function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID) external payable returns (bytes32 fulfillmentUid) {
+    function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID) external payable nonReentrant returns (bytes32 fulfillmentUid) {
         fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
+        require(fulfillers[fulfillmentUid] == address(0), "FULFILLER_SET");
         fulfillers[fulfillmentUid] = msg.sender;
         emit FulfillmentCreated(fulfillmentUid, msg.sender, obligationContract);
 ... 54 unchanged lines ...
```

##### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 121 unchanged lines ...
 
     function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID)
-        external payable returns (bytes32 fulfillmentUid)
+        external payable nonReentrant returns (bytes32 fulfillmentUid)
     {
         fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
+        require(fulfillers[fulfillmentUid] == address(0), "FULFILLER_SET");
         fulfillers[fulfillmentUid] = msg.sender;
         emit FulfillmentCreated(fulfillmentUid, msg.sender, obligationContract);
 ... 65 unchanged lines ...
```

### 4. [High] Missing fulfillment attestation validation and acceptance of zero-UID in splitters (as arbiters) causes native escrow burn and possible siphoning of splitter ETH

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Splitters accept fulfillment.uid == 0 and never verify that a fulfillment attestation exists. Tierable escrows defer validation to the arbiter, so a malicious oracle can approve (0, escrow), causing collectEscrow to release native ETH to address(0) (burn). Splitters then distribute from their own balance without ensuring funding; unsafe partial distribution plus EXECUTOR_SENTINEL with fulfillers[0] enables siphoning of any ETH already held by the splitter.

In TokenBundleSplitterBase (and TokenBundleSplitter/TokenBundleSplitterUnvalidated), checkObligation uses hasDecision[demandData.oracle][keccak256(fulfillment.uid, escrow)] without verifying that the fulfillment attestation exists in EAS, allowing uid == 0 (EMPTY_UID). BaseEscrowObligationTierable.collectEscrowRaw intentionally does not bind fulfillment.refUID to the escrow and defers all validation to the arbiter. When the oracle has stored a decision for (0, escrow), collectEscrowRaw proceeds and TokenBundleEscrowObligation._releaseEscrow sends nativeAmount to fulfillment.recipient, which is address(0) for uid 0, burning the escrowed ETH. Splitters then attempt distribution from their own balances; the unsafe partial path sends whatever ETH the splitter currently holds to recipients. If splits include EXECUTOR_SENTINEL, fulfillers[0] can be pre-seeded via createFulfillment with an obligation that returns 0, routing that share to the attacker.

#### Severity

**Impact Explanation:** [High] Direct, material loss of principal: native ETH in the escrow is burned to address(0). In Scenario 2, additional principal loss occurs by diverting ETH already held by the splitter to attacker-controlled recipients.

**Likelihood Explanation:** [Medium] Requires the designated oracle (arbiter) to be adversarial and the escrow to be a native-only tierable bundle, which are notable but plausible constraints within the stated trust model. No rare blockchain conditions or cryptographic events are required.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Scenario 1 (Burn native-only tierable escrow without any real fulfillment): A user creates a TokenBundleEscrowObligation escrow with nativeAmount > 0, arbiter set to a TokenBundleSplitter, and demand pointing to the attacker’s oracle. The oracle records a decision for (fulfillment=0, escrow). Calling collectEscrow(escrow, 0) causes BaseEscrowObligationTierable to accept the zero-uid fulfillment via the arbiter check and TokenBundleEscrowObligation._releaseEscrow sends native ETH to address(0), burning the escrowed funds.
#### Preconditions / Assumptions
- (a). Escrow contract is TokenBundleEscrowObligation (tierable).
- (b). Escrow bundle is native-only: nativeAmount > 0; ERC20/721/1155 arrays empty.
- (c). Arbiter set to a TokenBundleSplitter (TokenBundleSplitter or TokenBundleSplitterUnvalidated).
- (d). Escrow demand encodes an oracle address controlled by the attacker.
- (e). No real fulfillment attestation exists; the oracle records hasDecision for key keccak256(0, escrow).
- (f). collectEscrow(escrow, 0) is called (via splitter flow or directly on the escrow).

### Scenario 2.
Scenario 2 (Burn escrowed ETH and siphon splitter-held ETH via unsafe partial distribution and EXECUTOR_SENTINEL): Building on Scenario 1, the attacker pre-seeds fulfillers[0] by calling the splitter’s createFulfillment with a malicious obligation that returns 0 and the oracle includes EXECUTOR_SENTINEL in splits. The splitter holds some ETH from prior activity. The attacker calls unsafePartiallyCollectAndDistribute(escrowContract, escrow, 0): collectEscrow burns the escrow’s ETH; then the splitter pays out from its own ETH to recipients, with EXECUTOR_SENTINEL resolving to fulfillers[0] (attacker), siphoning any available splitter ETH.
#### Preconditions / Assumptions
- (a). All preconditions from Scenario 1.
- (b). The splitter currently holds some ETH (e.g., from prior partial distributions or direct transfers).
- (c). Attacker pre-seeds fulfillers[0] by calling the splitter’s createFulfillment with an obligation that returns bytes32(0).
- (d). Oracle’s splits include recipient = EXECUTOR_SENTINEL.
- (e). Attacker calls unsafePartiallyCollectAndDistribute(escrowContract, escrow, 0).

#### Proposed fix

##### BaseEscrowObligationTierable.sol

File: `contracts/src/BaseEscrowObligationTierable.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/BaseEscrowObligationTierable.sol)

```diff
 ... 78 unchanged lines ...
             revert AttestationNotFound(_fulfillment);
         }
+        if (fulfillment.uid == bytes32(0)) revert InvalidFulfillment();
 
         // Validate escrow uses correct schema
 ... 98 unchanged lines ...
```

### 5. [High] Shared pending-bit keying in AttestationEscrowHook/AttestationEscrowHook2 causes cross-escrow DoS and potential fund freeze via AllEscrowHook

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

AttestationEscrowHook and AttestationEscrowHook2 track a single pending boolean per (caller, keccak256(hookData)) and ignore the specific escrow. Any earlier onRelease/onReturn for the same key clears the flag, causing later releases for other escrows with identical hookData under the same caller to revert. Attackers can pre-consume the pending bit by cloning the escrow or by calling AllEscrowHook directly. When composed with asset-holding leaves, the revert in the attestation leaf aborts the entire release, freezing funds until expiry or indefinitely if non-expiring.

Both AttestationEscrowHook and AttestationEscrowHook2 implement pending tracking as mapping(address => mapping(bytes32 => bool)) keyed by (msg.sender, keccak256(data)). onLock sets the flag true; onRelease requires the flag then sets it false; onReturn clears it if set. The escrow identifier is ignored, and there is no per-escrow UID/nonce/counter. As a result, multiple escrows using the same hook and identical hookData under the same caller (the HookEscrowObligation directly, or the AllEscrowHook when composed) share a single consumable bit. An attacker can read the victim's hook and hookData from the public EAS attestation and either: (a) create a clone escrow and collect or reclaim it first to consume the pending bit, or (b) when AllEscrowHook is used, directly call its public onReturn/onRelease to clear the leaf's pending bit. The victim’s subsequent collectEscrow call invokes the hook’s onRelease, which reverts with NoPendingValidation, denying the expected validation attestation. When AttestationEscrowHook/2 is a leaf in an AllEscrowHook bundle that also includes asset-holding hooks, the revert in the attestation leaf causes the entire release to revert atomically, preventing asset release and freezing funds until expiry; if the escrow is non-expiring (expirationTime = 0), funds can be frozen indefinitely.

#### Severity

**Impact Explanation:** [High] When composed with asset-holding leaves under AllEscrowHook, the attestation leaf’s revert aborts the entire release, freezing escrowed funds until expiry; if non-expiring, freeze can be indefinite. Even without assets, it denies the core deliverable (validation attestation).

**Likelihood Explanation:** [High] No special constraints are required: attestation data is public, hooks and AllEscrowHook functions are openly callable, and a permissive arbiter can be used for clone collection. The attack is low-cost and under attacker control.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Direct HookEscrowObligation with AttestationEscrowHook2: Victim creates escrow A with AttestationEscrowHook2 and hookData. Attacker reads hookData from EAS, creates clone escrow B on the same obligation with identical hook/hookData and a permissive arbiter, then collects B first. This consumes the shared pending bit. When the victim collects A with a valid fulfillment, AttestationEscrowHook2.onRelease reverts NoPendingValidation, denying the validation attestation.
#### Preconditions / Assumptions
- (a). A deployed HookEscrowObligation that users can call
- (b). Victim creates an escrow using AttestationEscrowHook2 with some hookData
- (c). EAS attestation data (including hook and hookData) is publicly readable
- (d). Attacker can create a clone escrow on the same obligation and choose a permissive arbiter to enable easy collection

### Scenario 2.
AllEscrowHook with AttestationEscrowHook2 leaf only: Victim creates an escrow via AllEscrowHook whose leaves include AttestationEscrowHook2 with specific leaf data. Attacker reads the bundle data from EAS and calls AllEscrowHook.onReturn (or onRelease) externally with the same data, which forwards to the leaf and clears the pending bit. The victim’s later collectEscrow call causes the attestation leaf to revert NoPendingValidation, blocking issuance.
#### Preconditions / Assumptions
- (a). Victim uses AllEscrowHook as the hook for their escrow
- (b). AllEscrowHook exposes public onLock/onRelease/onReturn
- (c). The AllEscrowHook bundle includes an AttestationEscrowHook2 leaf with known data from EAS
- (d). Attacker can call AllEscrowHook externally with the same bundle data

### Scenario 3.
AllEscrowHook with asset-holding leaves plus AttestationEscrowHook2: Victim bundles asset-holding leaves (e.g., ERC20/ETH) with an AttestationEscrowHook2 leaf. Attacker pre-consumes the attestation leaf’s pending bit (via clone-and-collect or by directly calling AllEscrowHook to affect only that leaf). On collectEscrow, AllEscrowHook’s release sequence hits the attestation leaf, which reverts NoPendingValidation. The atomic revert prevents release of all leaves, freezing escrowed funds until expiry or indefinitely if non-expiring.
#### Preconditions / Assumptions
- (a). Victim uses AllEscrowHook to bundle asset-holding leaves with an AttestationEscrowHook2 leaf
- (b). EAS attestation reveals the bundle and leaf data
- (c). Attacker can pre-consume the attestation leaf’s pending bit (via a clone escrow’s collect/reclaim or via AllEscrowHook for that leaf)
- (d). Atomic behavior of AllEscrowHook causes the entire release to revert if one leaf reverts

#### Proposed fix

##### AttestationEscrowHook2.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook2.sol)

```diff
 ... 26 unchanged lines ...
 
     /// @notice Tracks pending: caller → hookDataHash → pending.
+    // FIXME: Convert to uint256 counter per (caller, dataHash). Increment on onLock; decrement on onRelease/onReturn.
     mapping(address => mapping(bytes32 => bool)) public pending;
 
     error AttestationCreationFailed();
     error NoPendingValidation(address caller, bytes32 hookDataHash);
 
     constructor(IEAS _eas, ISchemaRegistry _schemaRegistry) {
         eas = _eas;
         VALIDATION_SCHEMA = _schemaRegistry.register(
             "bytes32 validatedAttestationUid",
             ISchemaResolver(address(0)),
             true
         );
     }
 
     // ──────────────────────────────────────────────
 
     function onLock(
         bytes calldata data,
         address /* from */,
         address /* escrow */
     ) external payable override {
+        // FIXME: Use counter increment instead of boolean set: pending[msg.sender][dataHash]++.
         bytes32 dataHash = keccak256(data);
         pending[msg.sender][dataHash] = true;
     }
 
     function onRelease(
         bytes calldata data,
         address to,
         address /* escrow */
     ) external override {
+        // FIXME: Use post-decrement with zero-check instead of boolean check+clear:
+        // if (pending[msg.sender][dataHash]-- == 0) revert NoPendingValidation(...);
         bytes32 dataHash = keccak256(data);
         if (!pending[msg.sender][dataHash]) {
             revert NoPendingValidation(msg.sender, dataHash);
         }
 
-        pending[msg.sender][dataHash] = false;
+        // decrement pending counter here (see above)
 
         HookData memory decoded = abi.decode(data, (HookData));
 ... 23 unchanged lines ...
         address /* escrow */
     ) external override {
+        // FIXME: Decrement the counter only if > 0 to support multiple concurrent identical escrows:
+        // if (pending[msg.sender][dataHash] > 0) pending[msg.sender][dataHash]--;
         bytes32 dataHash = keccak256(data);
         if (pending[msg.sender][dataHash]) {
-            pending[msg.sender][dataHash] = false;
+            // decrement pending counter here
         }
     }
 
     // ──────────────────────────────────────────────
     // Encoding helpers
     // ──────────────────────────────────────────────
 
     function encodeHookData(
         HookData calldata hookData
     ) external pure returns (bytes memory) {
         return abi.encode(hookData);
     }
 
     function decodeHookData(
         bytes calldata data
     ) external pure returns (HookData memory) {
         return abi.decode(data, (HookData));
     }
 }
```

##### AllEscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AllEscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AllEscrowHook.sol)

```diff
 ... 44 unchanged lines ...
         address escrow
     ) external payable override {
+        // FIXME: Restrict to originating escrow obligation: require(msg.sender == escrow, "Unauthorized caller");
         HookData memory decoded = abi.decode(data, (HookData));
         _validateLengths(decoded);
 ... 21 unchanged lines ...
         address escrow
     ) external override {
+        // FIXME: Restrict to originating escrow obligation: require(msg.sender == escrow, "Unauthorized caller");
+        // FIXME: Restrict to originating escrow obligation: require(msg.sender == escrow, "Unauthorized caller");
         HookData memory decoded = abi.decode(data, (HookData));
         _validateLengths(decoded);
 ... 52 unchanged lines ...
```

##### AttestationEscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook.sol)

```diff
 ... 26 unchanged lines ...
 
     /// @notice Tracks pending releases: caller → hookDataHash → pending.
+    // FIXME: Convert to uint256 counter per (caller, dataHash). Increment on onLock; decrement on onRelease/onReturn.
     mapping(address => mapping(bytes32 => bool)) public pending;
 
     error AttestationCreationFailed();
     error NoPendingAttestation(address caller, bytes32 hookDataHash);
 
     constructor(IEAS _eas) {
         eas = _eas;
     }
 
     // ──────────────────────────────────────────────
 
     function onLock(
         bytes calldata data,
         address /* from */,
         address /* escrow */
     ) external payable override {
         // Mark as pending so onRelease can verify it was locked via a
         // legitimate obligation flow.
+        // FIXME: Use counter increment instead of boolean set: pending[msg.sender][dataHash]++.
         bytes32 dataHash = keccak256(data);
         pending[msg.sender][dataHash] = true;
     }
 
     function onRelease(
         bytes calldata data,
         address /* to */,
         address /* escrow */
     ) external override {
+        // FIXME: Use post-decrement with zero-check instead of boolean check+clear:
+        // if (pending[msg.sender][dataHash]-- == 0) revert NoPendingAttestation(...);
         bytes32 dataHash = keccak256(data);
         if (!pending[msg.sender][dataHash]) {
             revert NoPendingAttestation(msg.sender, dataHash);
         }
-
         pending[msg.sender][dataHash] = false;
 
         HookData memory decoded = abi.decode(data, (HookData));
         try eas.attest(decoded.attestation) {} catch {
             revert AttestationCreationFailed();
         }
     }
 
     function onReturn(
         bytes calldata data,
         address /* to */,
         address /* escrow */
     ) external override {
         // Clear the pending state — the attestation won't be created.
+        // FIXME: Decrement the counter only if > 0 to support multiple concurrent identical escrows:
+        // if (pending[msg.sender][dataHash] > 0) pending[msg.sender][dataHash]--;
         bytes32 dataHash = keccak256(data);
         if (pending[msg.sender][dataHash]) {
 ... 20 unchanged lines ...
```

#### Related findings

##### [Medium] Incorrectly payable onLock in non-ETH escrow hooks causes permanent ETH loss

###### Description

Non-ETH escrow hooks implement onLock as payable but ignore msg.value. HookEscrowObligation unconditionally forwards any msg.value to the hook. If integrations accidentally forward ETH when using non-ETH hooks, the ETH is accepted and becomes irrecoverably stuck since these hooks provide no withdrawal path.

The IEscrowHook interface requires onLock to be payable, and HookEscrowObligation forwards any supplied msg.value to the selected hook during escrow creation. Several non-ETH hooks (ERC20EscrowHook, ERC721EscrowHook, ERC1155EscrowHook, AttestationEscrowHook, AttestationEscrowHook2) accept ETH via onLock but never reference msg.value and have no withdrawal or refund mechanism. As a result, if an integration or middleware mistakenly attaches ETH to a non-ETH escrow flow, the call succeeds and the ETH remains permanently trapped in the hook contract. NativeTokenEscrowHook is the only hook that correctly consumes msg.value and pays ETH out on release/return. AllEscrowHook enforces only that total msg.value equals the sum of per-subhook values and will forward nonzero values to non-ETH subhooks if misconfigured, compounding this footgun.

###### Severity

**Impact Explanation:** [High] ETH forwarded to non-ETH hooks is irrecoverably trapped upon successful onLock, constituting direct, material loss/freeze of principal funds.

**Likelihood Explanation:** [Low] Exploitation requires integration or middleware misconfiguration (e.g., forwarding msg.value to non-ETH hooks or mis-specified AllEscrowHook values), which is not the default or expected behavior.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
A dApp wrapper that charges an ETH fee accidentally forwards the fee as msg.value to HookEscrowObligation when using ERC20EscrowHook. onLock succeeds (ERC20 transferFrom works), the ETH is accepted by the hook and becomes stuck with no withdrawal path.
#### Preconditions / Assumptions
- (a). A third-party dApp or SDK integrates HookEscrowObligation with ERC20EscrowHook for ERC20 escrows
- (b). The wrapper or integration mistakenly forwards a nonzero msg.value (e.g., intended fee) into the doObligation call
- (c). The user has approved the ERC20 token so transferFrom succeeds

### Scenario 2.
An integrator composes only non-ETH subhooks (ERC20EscrowHook and ERC721EscrowHook) via AllEscrowHook but mistakenly sets nonzero values[] for them. AllEscrowHook forwards ETH to each subhook; both onLock calls succeed and the forwarded ETH is trapped in the non-ETH hooks.
#### Preconditions / Assumptions
- (a). AllEscrowHook is used to compose only non-ETH subhooks (e.g., ERC20EscrowHook and ERC721EscrowHook)
- (b). HookData.values is misconfigured with nonzero entries for these non-ETH subhooks
- (c). Token/NFT transfers for onLock succeed (approvals/ownership in place)
- (d). No NativeTokenEscrowHook is included to trigger ETH amount checks

### Scenario 3.
A wallet library or relayer injects a default nonzero msg.value when calling HookEscrowObligation for an ERC20-only escrow. ERC20EscrowHook.onLock accepts the ETH, completes the token transfer, and the ETH remains permanently stuck in the hook.
#### Preconditions / Assumptions
- (a). A wallet library or relayer constructs calls to HookEscrowObligation with a default nonzero msg.value
- (b). The selected hook is a non-ETH hook (e.g., ERC20EscrowHook)
- (c). ERC20 approval is set so transferFrom succeeds

###### Proposed fix

####### ERC20EscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/ERC20EscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/ERC20EscrowHook.sol)

```diff
 ... 48 unchanged lines ...
     ) external payable override {
         HookData memory decoded = abi.decode(data, (HookData));
+        require(msg.value == 0, "No ETH accepted");
 
         uint256 balanceBefore = IERC20(decoded.token).balanceOf(address(this));
 ... 92 unchanged lines ...
```

####### ERC721EscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/ERC721EscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/ERC721EscrowHook.sol)

```diff
 ... 36 unchanged lines ...
     ) external payable override {
         HookData memory decoded = abi.decode(data, (HookData));
+        require(msg.value == 0, "No ETH accepted");
 
         // Verify ownership
 ... 106 unchanged lines ...
```

####### ERC1155EscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/ERC1155EscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/ERC1155EscrowHook.sol)

```diff
 ... 46 unchanged lines ...
     ) external payable override {
         HookData memory decoded = abi.decode(data, (HookData));
+        require(msg.value == 0, "No ETH accepted");
 
         uint256 balanceBefore = IERC1155(decoded.token).balanceOf(
 ... 136 unchanged lines ...
```

####### AttestationEscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook.sol)

```diff
 ... 43 unchanged lines ...
     ) external payable override {
         // Mark as pending so onRelease can verify it was locked via a
+        require(msg.value == 0, "No ETH accepted");
         // legitimate obligation flow.
         bytes32 dataHash = keccak256(data);
 ... 49 unchanged lines ...
```

####### AttestationEscrowHook2.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook2.sol)

```diff
 ... 47 unchanged lines ...
         address /* escrow */
     ) external payable override {
+        require(msg.value == 0, "No ETH accepted");
         bytes32 dataHash = keccak256(data);
         pending[msg.sender][dataHash] = true;
 ... 62 unchanged lines ...
```

##### [Medium] Open EAS schema (no resolver) in AttestationEscrowHook2 causes forged validations to be accepted by schema-only consumers

###### Description

AttestationEscrowHook2 registers its VALIDATION_SCHEMA with resolver=address(0), making the schema open so any account can mint attestations under it. If downstream consumers accept validations by schema (and refUID) without verifying the attester is AttestationEscrowHook2, attackers can forge validations that appear legitimate, potentially triggering erroneous payouts or releases.

AttestationEscrowHook2 constructs a validation schema using the SchemaRegistry with resolver set to address(0), which in canonical EAS means no resolver checks are executed and EAS enforces no attester-side authorization. The hook’s onRelease() then mints a validation attestation under this open schema. Because the schema is open, any EOA/contract can also mint attestations under the same schema via EAS.attest(), including with matching refUID and data. If a consumer relies only on the schema (and possibly refUID) to recognize a valid release/approval signal, they can be deceived by forged validations not created by the hook. While the in-repo contracts do not consume these validations for authorization, external integrators or services that misuse EAS by checking schema-only are exposed to direct loss or misleading signals. Best practice is to verify both schema and attester (and expected fields), or to bind the schema to a resolver that enforces attester == the hook.

###### Severity

**Impact Explanation:** [High] Where mis-integration occurs, attackers can induce direct, material fund losses by triggering erroneous payouts or external on-chain releases; otherwise, the impact is misleading state for view-only tools.

**Likelihood Explanation:** [Low] Exploitation requires an external integrator to incorrectly rely on schema-only checks and ignore the attester field, which is a misuse of EAS; thus it depends on integrator behavior outside the attacker’s control.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Off-chain payout service pays when it detects a validation attestation under VALIDATION_SCHEMA referencing a target refUID; an attacker mints a forged attestation under the same schema/refUID, and the service pays out erroneously because it did not verify the attester.
#### Preconditions / Assumptions
- (a). A pre-made attestation UID (refUID) exists and is publicly discoverable from the escrow’s data.
- (b). The payout service accepts validations based on schema (and possibly refUID) without verifying attester == AttestationEscrowHook2.
- (c). The attacker can call EAS.attest under the open schema with refUID set to the target UID.

### Scenario 2.
A third-party on-chain integrator (outside this repo) releases funds when it finds an EAS attestation under VALIDATION_SCHEMA with a specific refUID; an attacker mints a forged attestation under that schema/refUID, and the integrator unlocks funds due to schema-only checks.
#### Preconditions / Assumptions
- (a). A separate on-chain integrator contract (not in this repo) is deployed that releases funds based on the presence of an attestation under VALIDATION_SCHEMA with a specific refUID.
- (b). The integrator checks schema/refUID only and does not verify the attester address.
- (c). The attacker can call EAS.attest under the open schema with refUID set to the target UID.

### Scenario 3.
An analytics/UX tool displays items as validated if it sees any attestation under VALIDATION_SCHEMA with a matching refUID; an attacker mints such an attestation, causing a false validation signal in dashboards or alerts.
#### Preconditions / Assumptions
- (a). A read-only analytics/UX tool flags success on any attestation under VALIDATION_SCHEMA (and refUID) without verifying attester or attestation invariants.
- (b). The attacker can call EAS.attest under the open schema with refUID set to the target UID.

###### Proposed fix

####### AttestationEscrowHook2.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook2.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {IEscrowHook} from "../IEscrowHook.sol";
 import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
 import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
 import {ISchemaResolver} from "@eas/resolver/ISchemaResolver.sol";
+import {SchemaResolver} from "@eas/resolver/SchemaResolver.sol";
+import {Attestation} from "@eas/Common.sol";
 
 /// @title AttestationEscrowHook2
 /// @notice An IEscrowHook that creates a validation attestation referencing
 ///         a pre-existing attestation on release.
 /// @dev hookData is abi.encode(HookData).
 ///      Like AttestationEscrowHook, no assets are locked. On release, a
 ///      validation attestation is created that references the original
 ///      attestation UID, serving as a "stamp of approval."
 ///
 ///      The validation schema is registered at deploy time. The attester
 ///      of the validation attestation is this hook contract.
-contract AttestationEscrowHook2 is IEscrowHook {
+contract AttestationEscrowHook2 is IEscrowHook, SchemaResolver {
     struct HookData {
         bytes32 attestationUid;
         address recipient; // recipient of the validation attestation
     }
 
     IEAS public immutable eas;
     bytes32 public immutable VALIDATION_SCHEMA;
 
     /// @notice Tracks pending: caller → hookDataHash → pending.
     mapping(address => mapping(bytes32 => bool)) public pending;
 
     error AttestationCreationFailed();
     error NoPendingValidation(address caller, bytes32 hookDataHash);
 
-    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry) {
+    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry) SchemaResolver(_eas) {
         eas = _eas;
         VALIDATION_SCHEMA = _schemaRegistry.register(
             "bytes32 validatedAttestationUid",
-            ISchemaResolver(address(0)),
+            ISchemaResolver(this),
             true
         );
 ... 55 unchanged lines ...
     }
 
+    function onAttest(Attestation calldata attestation, uint256) internal view override returns (bool) { return attestation.attester == address(this); }
+
+    function onRevoke(Attestation calldata attestation, uint256) internal view override returns (bool) { return attestation.attester == address(this); }
+
     // ──────────────────────────────────────────────
     // Encoding helpers
     // ──────────────────────────────────────────────
 
     function encodeHookData(
         HookData calldata hookData
     ) external pure returns (bytes memory) {
         return abi.encode(hookData);
     }
 
     function decodeHookData(
         bytes calldata data
     ) external pure returns (HookData memory) {
         return abi.decode(data, (HookData));
     }
 }
```

##### [Medium] HookData.recipient ignored in AttestationEscrowHook2.onRelease causes misdirected validation attestations

###### Description

AttestationEscrowHook2 includes a recipient in HookData but onRelease uses the fulfillment recipient as the actual attestation recipient, allowing fulfillment authors to redirect the validation attestation while still passing default arbiter hookData-hash checks.

AttestationEscrowHook2 decodes HookData(attestationUid, recipient) on release but ignores decoded.recipient and sets the EAS attestation recipient to the external to parameter, which is forwarded from fulfillment.recipient. HookEscrowObligation’s default arbiter only checks hook address and keccak256(hookData), not the fulfillment recipient. Therefore, a fulfillment that keeps hookData identical can pass arbiter checks while redirecting the validation attestation to any address via its recipient field. This leads to a business-logic failure where the on-chain attestation goes to an unintended recipient, and when composed with asset hooks via AllEscrowHook, funds can be released while the validation is misdirected. The behavior is consistent with the IEscrowHook pattern of using the to parameter as the beneficiary, but the presence and comment of HookData.recipient in AttestationEscrowHook2 create an expectation not enforced by the code.

###### Severity

**Impact Explanation:** [Medium] The main harm is a business-logic failure: the created validation attestation is misdirected to an unintended recipient. When asset hooks are composed, funds are released under the chosen arbiter’s criteria while the non-asset deliverable is misdirected. This is not a direct protocol-level funds theft, but it can cause material payment for a misbound deliverable.

**Likelihood Explanation:** [Medium] Plausible in real deployments that use AttestationEscrowHook2 with the default or non-strict arbiter and assume recipient binding. However, integrators can mitigate by using AttestationEscrowHook (v1) or a custom arbiter that enforces recipient alignment, so exploitation depends on integration choices.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Paid validation: AllEscrowHook composes ERC20EscrowHook (payout) + AttestationEscrowHook2 (validation). The escrow creator expects the validation for X (HookData.recipient), but a fulfiller sets fulfillment.recipient=Y, passes hash checks, collects tokens to Y, and the validation attestation is issued to Y instead of X.
#### Preconditions / Assumptions
- (a). HookEscrowObligation used with AllEscrowHook composing ERC20EscrowHook and AttestationEscrowHook2
- (b). AttestationEscrowHook2 HookData encodes attestationUid and recipient X
- (c). Default or non-strict arbiter checks only hook and hookData hash equality
- (d). Fulfiller can create a fulfillment attestation with recipient Y and refUID=escrow.uid
- (e). Escrow creator expects validation to be issued to X

### Scenario 2.
Paid validation with ERC721 or NativeToken: Same as above but payout is an NFT or ETH. Assets transfer to Y and the validation attestation is issued to Y, not the intended recipient X.
#### Preconditions / Assumptions
- (a). HookEscrowObligation used with AllEscrowHook composing ERC721EscrowHook or NativeTokenEscrowHook and AttestationEscrowHook2
- (b). AttestationEscrowHook2 HookData encodes attestationUid and recipient X
- (c). Default or non-strict arbiter checks only hook and hookData hash equality
- (d). Fulfiller creates a fulfillment with recipient Y and refUID=escrow.uid
- (e). Escrow creator expects validation to be issued to X

### Scenario 3.
Attestation-only: AttestationEscrowHook2 used alone. Fulfillment sets recipient=Y, passes hash checks, and the validation attestation is issued to Y instead of intended X, causing a non-revocable misassignment without moving funds.
#### Preconditions / Assumptions
- (a). HookEscrowObligation used with AttestationEscrowHook2 alone
- (b). AttestationEscrowHook2 HookData encodes attestationUid and recipient X
- (c). Default or non-strict arbiter checks only hook and hookData hash equality
- (d). Fulfiller creates a fulfillment with recipient Y and refUID=escrow.uid
- (e). Escrow creator expects validation to be issued to X

###### Proposed fix

####### AttestationEscrowHook2.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook2.sol)

```diff
 ... 70 unchanged lines ...
                     schema: VALIDATION_SCHEMA,
                     data: AttestationRequestData({
-                        recipient: to,
+                        recipient: decoded.recipient,
                         expirationTime: 0,
                         revocable: false,
 ... 38 unchanged lines ...
```

### 6. [High] Unauthenticated, globally-unique EAS schema registration in constructors causes deployment-time DoS via schema tuple squatting

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Constructors in BaseAttester-derived contracts and in AttestationEscrowHook2 self-register schemas on the canonical EAS SchemaRegistry, whose UIDs are derived only from (schema, resolver, revocable) without authenticating resolver ownership. An attacker can pre-register the exact tuple to make the constructor revert with AlreadyExists, blocking deployment at the intended address or with the intended schema UID.

BaseAttester’s constructor unconditionally calls schemaRegistry.register(schema, this, revocable) and stores the returned UID as ATTESTATION_SCHEMA. The canonical EAS SchemaRegistry computes a schema UID as keccak256(schema, resolver, revocable) and reverts with AlreadyExists if the UID is already taken, without verifying ownership or code at resolver. Hence, if a third party pre-registers the same tuple before deployment, the constructor reverts and the deploy fails. For contracts deployed via CREATE2, the future address is predictable from salt and init code, allowing pre-squatting. For CREATE, a mempool observer can compute the created address from (sender, nonce) and front-run a register() transaction. Separately, AttestationEscrowHook2’s constructor registers a schema with resolver=address(0), making pre-squatting trivial and global: anyone can register that tuple once and permanently block deployments of that unmodified contract on that registry. This issue does not enable unauthorized attestations (EAS enforces attester=msg.sender and BaseAttester.onAttest checks attester==address(this)); it is a deployment-time denial-of-service/namespace-squatting risk that forces changes to addresses or schema strings (UIDs), disrupting expected namespaces and deployments.

#### Severity

**Impact Explanation:** [Medium] Deployment-time denial-of-service blocks intended contracts or intended schema UIDs, forcing code or deployment changes and disrupting integrations; no direct fund loss but significant availability impact until mitigated.

**Likelihood Explanation:** [High] At least one core scenario (resolver=address(0) pre-squatting) has no special constraints and is trivially exploitable; other scenarios are medium-likelihood but do not reduce the overall likelihood classification.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Global pre-squat of AttestationEscrowHook2’s validation schema: an attacker (or any prior registrant) calls SchemaRegistry.register("bytes32 validatedAttestationUid", address(0), true) before the project deploys. When AttestationEscrowHook2’s constructor runs and attempts the same registration, SchemaRegistry reverts AlreadyExists, blocking deployment on that registry until code is changed.
#### Preconditions / Assumptions
- (a). Canonical EAS SchemaRegistry is deployed and used
- (b). AttestationEscrowHook2 code registers schema with resolver=address(0) and the same schema string and revocable=true
- (c). Attacker (or any party) can submit a prior register() transaction to the same registry

### Scenario 2.
CREATE2 pre-squatting of a BaseAttester-derived contract (e.g., HookEscrowObligation or ERC20PaymentObligation): attacker computes the future contract address from (deployer, salt, initCodeHash) and pre-registers the tuple (contract’s schema string, resolver=future address, revocable=true). The project’s constructor register() then reverts AlreadyExists, preventing deployment at the intended deterministic address/UID.
#### Preconditions / Assumptions
- (a). Deterministic CREATE2 deployment with known or inferable salt and init code
- (b). Canonical EAS SchemaRegistry is deployed and used
- (c). BaseAttester-derived contract uses a known schema string and revocable=true in its constructor
- (d). Attacker can compute the future contract address and submit register() before deployment

### Scenario 3.
Mempool front-run of a CREATE deployment of a BaseAttester-derived contract (e.g., CommitRevealObligation): attacker observes the deploy tx, computes the created address from (sender, nonce), front-runs a register() for the tuple (schema string, resolver=predicted address, revocable=true). The constructor’s register() reverts AlreadyExists, forcing redeploy with different address or schema.
#### Preconditions / Assumptions
- (a). Deployment via CREATE is visible in the public mempool
- (b). Canonical EAS SchemaRegistry is deployed and used
- (c). BaseAttester-derived contract uses a known schema string and revocable=true in its constructor
- (d). Attacker can compute the created address from (sender, nonce) and successfully front-run a register() call

#### Proposed fix

##### AttestationEscrowHook2.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook2.sol)

```diff
 ... 33 unchanged lines ...
     constructor(IEAS _eas, ISchemaRegistry _schemaRegistry) {
         eas = _eas;
-        VALIDATION_SCHEMA = _schemaRegistry.register(
-            "bytes32 validatedAttestationUid",
-            ISchemaResolver(address(0)),
-            true
-        );
+        try _schemaRegistry.register("bytes32 validatedAttestationUid", ISchemaResolver(address(0)), true)
+            returns (bytes32 uid) { VALIDATION_SCHEMA = uid; }
+        catch {
+            VALIDATION_SCHEMA = keccak256(abi.encodePacked("bytes32 validatedAttestationUid", ISchemaResolver(address(0)), true));
+        }
     }
 
     // ──────────────────────────────────────────────
-
     function onLock(
         bytes calldata data,
 ... 67 unchanged lines ...
```

##### BaseAttester.sol

File: `contracts/src/BaseAttester.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/BaseAttester.sol)

```diff
 ... 23 unchanged lines ...
         eas = _eas;
         schemaRegistry = _schemaRegistry;
-        ATTESTATION_SCHEMA = schemaRegistry.register(schema, this, revocable);
+        try schemaRegistry.register(schema, this, revocable) returns (bytes32 uid) {
+            ATTESTATION_SCHEMA = uid;
+        } catch { ATTESTATION_SCHEMA = keccak256(abi.encodePacked(schema, address(this), revocable)); }
     }
 
 ... 51 unchanged lines ...
```

### 7. [High] Unrestricted fulfillment recipient and payable receive in HookEscrowObligation cause permanent loss of escrowed ETH/ERC20/ERC721

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

HookEscrowObligation releases escrowed assets to fulfillment.recipient without constraining that address. If the recipient is set to HookEscrowObligation itself, hooks transfer ETH/tokens to the contract. Its payable receive() accepts ETH and there is no withdrawal path for ETH or tokens, permanently sinking assets. Permissive/adversarial arbiters can allow such fulfillments, making the issue exploitable via normal collectEscrow flow.

During collection, BaseEscrowObligation.collectEscrowRaw validates only that the escrow is intrinsically valid, that fulfillment.refUID == escrow.uid, and that IArbiter(arbiter).checkObligation returns true. It then calls HookEscrowObligation._releaseEscrow with to = fulfillment.recipient. HookEscrowObligation forwards release to the configured IEscrowHook.onRelease(hookData, to, address(this)). NativeTokenEscrowHook sends ETH to 'to' via call, and ERC20EscrowHook/ ERC721EscrowHook transfer tokens to 'to'. If 'to' is address(HookEscrowObligation), ETH is accepted by its payable receive() and there are no withdrawal methods for ETH or tokens, resulting in permanent asset loss. Because arbiters are user-selected and may be permissive/adversarial (e.g., TrivialArbiter), an attacker can craft a fulfillment that references the escrow and sets recipient = HookEscrowObligation, causing hooks to deliver assets to the obligation contract itself through the standard collectEscrow path.

#### Severity

**Impact Explanation:** [High] Escrowed ETH and ERC20/ERC721 tokens can be transferred to HookEscrowObligation itself and become permanently unrecoverable due to the contract’s payable receive and lack of withdrawal methods. This is direct, material loss of principal funds and permanently breaks payout for affected escrows.

**Likelihood Explanation:** [Medium] Exploitation requires the victim to have selected a permissive/adversarial arbiter (explicitly allowed by the system’s trust model) and the attacker to craft a fulfillment referencing the escrow. No special timing or capital is needed; these are plausible deployment configurations.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
ETH sink via NativeTokenEscrowHook: A victim creates an escrow using HookEscrowObligation with hook = NativeTokenEscrowHook (amount X) and a permissive arbiter (e.g., TrivialArbiter). An attacker creates a fulfillment attestation referencing the escrow (refUID = escrow.uid) with recipient = address(HookEscrowObligation), then calls collectEscrow. The arbiter passes, NativeTokenEscrowHook.onRelease sends X wei to HookEscrowObligation, its receive() accepts ETH, and there is no withdrawal method; ETH is permanently stuck.
#### Preconditions / Assumptions
- (a). An escrow exists on HookEscrowObligation with hook = NativeTokenEscrowHook and a valid, unexpired, non-revoked attestation
- (b). The arbiter chosen by the victim is permissive/adversarial and does not constrain the fulfillment recipient (e.g., TrivialArbiter)
- (c). An attacker can create an EAS attestation that references the escrow uid and sets fulfillment.recipient = address(HookEscrowObligation)
- (d). collectEscrowRaw is permissionless and callable by the attacker

### Scenario 2.
ERC20/ERC721 sink: A victim creates an escrow using HookEscrowObligation with hook = ERC20EscrowHook (token T, amount A) or ERC721EscrowHook (token N, id I) and a permissive arbiter. The attacker crafts a fulfillment referencing the escrow with recipient = address(HookEscrowObligation) and calls collectEscrow. The hook transfers the tokens to HookEscrowObligation, which has no method to transfer them out, permanently sinking the tokens.
#### Preconditions / Assumptions
- (a). An escrow exists on HookEscrowObligation with hook = ERC20EscrowHook or ERC721EscrowHook and a valid, unexpired, non-revoked attestation
- (b). Victim has provided necessary approvals to the hook for the token(s)
- (c). The arbiter chosen by the victim is permissive/adversarial and does not constrain the fulfillment recipient
- (d). An attacker can create an EAS attestation that references the escrow uid and sets fulfillment.recipient = address(HookEscrowObligation)
- (e). collectEscrowRaw is permissionless and callable by the attacker

### Scenario 3.
Composed sink via AllEscrowHook (ETH/ERC20/ERC721 only): A victim uses HookEscrowObligation with hook = AllEscrowHook composed of subhooks that transfer ETH and/or ERC20/721. An attacker submits a passing fulfillment whose recipient is HookEscrowObligation and calls collectEscrow. AllEscrowHook invokes subhooks' onRelease, which transfer ETH/tokens to HookEscrowObligation, permanently sinking those assets due to lack of withdrawal functionality.
#### Preconditions / Assumptions
- (a). An escrow exists on HookEscrowObligation with hook = AllEscrowHook composed of subhooks that transfer ETH and/or ERC20/ERC721 (no ERC1155 subhooks involved) and a valid, unexpired, non-revoked attestation
- (b). The arbiter chosen by the victim is permissive/adversarial and does not constrain the fulfillment recipient
- (c). An attacker can create an EAS attestation that references the escrow uid and sets fulfillment.recipient = address(HookEscrowObligation)
- (d). collectEscrowRaw is permissionless and callable by the attacker

#### Proposed fix

##### HookEscrowObligation.sol

File: `contracts/src/obligations/escrow/hook-based/HookEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/HookEscrowObligation.sol)

```diff
 ... 69 unchanged lines ...
         bytes32 /* fulfillmentUid */
     ) internal override returns (bytes memory) {
+        require(to != address(this), "InvalidRecipient: self");
         ObligationData memory decoded = abi.decode(
             escrowData,
             (ObligationData)
         );
         IEscrowHook(decoded.hook).onRelease(
             decoded.hookData,
             to,
             address(this)
         );
         return "";
     }
 
     function _returnEscrow(bytes memory data, address to) internal override {
+        require(to != address(this), "InvalidRecipient: self");
         ObligationData memory decoded = abi.decode(data, (ObligationData));
         IEscrowHook(decoded.hook).onReturn(
 ... 79 unchanged lines ...
         return abi.decode(data, (ObligationData));
     }
-
-    // Allow contract to receive native tokens (for hooks that deal with ETH)
-    receive() external payable override {}
 }
```

#### Related findings

##### [High] Missing recipient binding in HookEscrowObligation.checkObligation with pooled hook accounting causes theft of escrowed funds

###### Description

HookEscrowObligation’s arbiter check does not bind the fulfillment to a specific recipient/identity, while BaseEscrowObligation pays out to fulfillment.recipient. Anyone can mint a matching fulfillment for an existing escrow UID and set themselves as recipient, collect the victim’s escrow, and later reclaim their own fronted assets due to pooled per-caller accounting in hooks.

In non-tierable flows, BaseEscrowObligation.collectEscrowRaw enforces fulfillment.refUID == escrow.uid, then obtains (arbiter, demand) from escrow.data and calls IArbiter(arbiter).checkObligation. HookEscrowObligation implements IArbiter and its checkObligation only matches hook, hookData, arbiter, and demand; it does not bind recipient or original creator. BaseObligation.doObligationRaw is public and allows any address to mint a fulfillment attested by this contract for any refUID (e.g., the victim’s escrow) with an arbitrary recipient (default msg.sender). HookEscrowObligation._beforeAttest calls the specified hook’s onLock, which for asset-holding hooks (ETH/ERC20/ERC1155) increases a pooled deposit balance per caller (the obligation contract). On collect, _releaseEscrow calls the hook’s onRelease to pay the escrowed assets to fulfillment.recipient. Later, reclaimExpired on the attacker’s own fulfillment triggers onReturn, which pays back the attacker from the same pooled balance. Thus, with arbiter = HookEscrowObligation and an asset-holding hook, an attacker can front the same assets to mint a matching fulfillment, instantly collect the victim’s escrow to themselves, and later recover their fronted assets once their fulfillment expires. This results in direct theft of the victim’s escrowed funds.

###### Severity

**Impact Explanation:** [High] Direct, material loss of principal funds: escrowed ETH/ERC20/bundles are released to the attacker’s address, and the victim’s escrow is revoked, preventing reclaim.

**Likelihood Explanation:** [Medium] Exploitation requires a specific but supported configuration (arbiter = HookEscrowObligation or similarly unbound), notable temporary capital to mirror the escrow, timing to reclaim after expiry, and accepts some pooled-accounting risk; these are significant but realistic constraints.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
ETH theft via NativeTokenEscrowHook: Victim escrows A ETH using HookEscrowObligation as arbiter and NativeTokenEscrowHook. Attacker mints a matching fulfillment referencing the escrow UID while fronting A ETH (onLock). collectEscrowRaw releases the victim’s A ETH to the attacker (fulfillment.recipient). After the attacker’s fulfillment expires, reclaimExpired returns the fronted A ETH to the attacker via onReturn.
#### Preconditions / Assumptions
- (a). Escrow arbiter is HookEscrowObligation (or an arbiter that does not bind recipient/identity).
- (b). Hook is NativeTokenEscrowHook with amount A.
- (c). Victim creates a non-expired escrow attestation for A ETH.
- (d). Attacker can call BaseObligation.doObligationRaw with data matching the escrow’s demanded hook fields and refUID set to the escrow’s uid.
- (e). Attacker can front A ETH and choose a non-zero expiration to allow reclaimExpired later.

### Scenario 2.
ERC20 theft via ERC20EscrowHook: Victim escrows A units of token T using HookEscrowObligation as arbiter and ERC20EscrowHook. Attacker approves and fronts A T to mint a matching fulfillment with refUID set to the escrow. collectEscrowRaw releases the victim’s A T to the attacker. After expiry, reclaimExpired returns the attacker’s A T via onReturn.
#### Preconditions / Assumptions
- (a). Escrow arbiter is HookEscrowObligation (or an arbiter that does not bind recipient/identity).
- (b). Hook is ERC20EscrowHook with token T and amount A.
- (c). Victim creates a non-expired escrow attestation for A T.
- (d). Attacker holds A T and has approved ERC20EscrowHook to transfer A T on their mint of fulfillment.
- (e). Attacker mints a matching fulfillment via doObligationRaw with refUID set to the escrow’s uid and a non-zero expiration.

### Scenario 3.
Composite bundle theft via AllEscrowHook: Victim escrows a bundle (e.g., 1 ETH + 1000 USDC) using HookEscrowObligation as arbiter and AllEscrowHook (composing NativeTokenEscrowHook and ERC20EscrowHook). Attacker fronts the same assets to mint a matching fulfillment. collectEscrowRaw releases the victim’s bundle to the attacker. After expiry, reclaimExpired returns the attacker’s fronted assets via onReturn.
#### Preconditions / Assumptions
- (a). Escrow arbiter is HookEscrowObligation (or an arbiter that does not bind recipient/identity).
- (b). Hook is AllEscrowHook composing asset-holding hooks (e.g., NativeTokenEscrowHook and ERC20EscrowHook) with specified amounts.
- (c). Victim creates a non-expired escrow attestation for the composite bundle.
- (d). Attacker fronts the same composite assets and mints a matching fulfillment via doObligationRaw with refUID set to the escrow’s uid and a non-zero expiration.

###### Proposed fix

####### HookEscrowObligation.sol

File: `contracts/src/obligations/escrow/hook-based/HookEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/HookEscrowObligation.sol)

```diff
 ... 97 unchanged lines ...
         Attestation memory obligation,
         bytes memory demand,
-        bytes32 /* fulfilling */
+        bytes32 fulfilling
     ) public view override returns (bool) {
         if (!obligation._checkIntrinsic(ATTESTATION_SCHEMA)) return false;
 
+        // Bind the fulfillment recipient to the original escrow recipient.
+        Attestation memory escrow = eas.getAttestation(fulfilling);
+        if (obligation.recipient != escrow.recipient) return false;
+
         ObligationData memory payment = abi.decode(
             obligation.data,
 ... 66 unchanged lines ...
```

### 8. [High] Missing attestation/schema binding and escrowContract verification in splitters’ collectAndDistribute causes theft of assets held by splitter

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Splitter contracts (ERC20, NativeToken, ERC1155, TokenBundle) decode arbitrary EAS attestation data without validating schema/attester or binding the escrowContract, ignore collectEscrow’s return, and then distribute from their own balances per stored splits keyed by an attacker-chosen oracle in the forged attestation. An attacker can forge an attestation, store splits to themselves, pass a no-op escrowContract, and drain any assets already present on the splitter (e.g., stranded by unsafe partial distributions).

In ERC20Splitter, NativeTokenSplitter, ERC1155Splitter, and TokenBundleSplitterBase, collectAndDistribute() calls an internal _collectAndDecode() that: (1) reads an EAS attestation by UID, (2) abi.decodes its data (EscrowObligationData) and nested demand (DemandData) without checking the attestation schema/attester or intrinsic validity, (3) uses demandData.oracle to fetch previously stored splits keyed by keccak256(fulfillment, escrow), and (4) calls escrowContract.collectEscrow(escrow, fulfillment) but ignores its boolean result. After that, the splitters transfer assets out of their own balances (ERC20, ETH, ERC1155, or bundles) to recipients in the splits. Because the escrowContract and the attestation are entirely caller-controlled and unvalidated, an attacker can forge an attestation whose data decodes to choose the oracle (the attacker), asset(s), and amount(s), store splits to themselves via arbitrate(), pass a no-op escrowContract, and invoke collectAndDistribute() to transfer out any assets already held by the splitter. This enables theft of residual assets (e.g., left by unsafePartiallyCollectAndDistribute or ETH received) from the splitter address. The attack does not drain funds still held in real escrow obligations; it drains whatever is present at the splitter.

#### Severity

**Impact Explanation:** [High] Direct, material loss of principal funds held by the splitter (assets are transferred to the attacker).

**Likelihood Explanation:** [Medium] Exploitation requires the splitter to already hold stranded assets—a constraint outside the attacker’s control but explicitly anticipated by the design via unsafePartiallyCollectAndDistribute(); forging attestations and deploying a no-op escrowContract are trivial.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Draining stranded ERC20 from ERC20Splitter: (1) Attacker observes a non-zero balance L of token T at the ERC20Splitter. (2) Attacker creates an EAS attestation whose data encodes EscrowObligationData {token=T, amount=L, demand=abi.encode({oracle=attacker})}. (3) Attacker picks any bytes32 fulfillment UID and calls arbitrate(fulfillment, escrowUID, [{recipient=attacker, amount=L}]) to store splits under decisions[attacker][keccak256(fulfillment, escrowUID)]. (4) Attacker deploys a no-op escrowContract that returns true from collectEscrow(). (5) Attacker calls collectAndDistribute(escrowContract, escrowUID, fulfillment). The splitter decodes the forged attestation, ignores collectEscrow’s result, and transfers L of T from the splitter’s own balance to the attacker.
#### Preconditions / Assumptions
- (a). ERC20Splitter holds a non-zero balance L of token T (e.g., stranded by unsafePartiallyCollectAndDistribute).
- (b). Attacker can create EAS attestations (permissionless) and deploy a contract implementing collectEscrow(bytes32,bytes32) returns (bool).
- (c). Public access to arbitrate() and collectAndDistribute() with no schema/attester checks in the splitter.

### Scenario 2.
Draining ETH from NativeTokenSplitter: (1) Attacker observes ETH balance E at NativeTokenSplitter (e.g., after unsafe partial distribution). (2) Attacker creates an EAS attestation encoding EscrowObligationData {amount=E, demand=abi.encode({oracle=attacker})}. (3) Attacker stores a split [{recipient=attacker, amount=E}] via arbitrate with a chosen fulfillment. (4) Using a no-op escrowContract, attacker calls collectAndDistribute(...). The splitter decodes the forged data, ignores the collectEscrow result, and sends E ETH from its own balance to the attacker.
#### Preconditions / Assumptions
- (a). NativeTokenSplitter holds a non-zero ETH balance E (e.g., stranded by unsafePartiallyCollectAndDistribute).
- (b). Attacker can create EAS attestations and deploy a no-op escrowContract.
- (c). Public access to arbitrate() and collectAndDistribute() with no schema/attester checks in the splitter.

### Scenario 3.
Draining multiple assets from TokenBundleSplitter (validated variant): (1) Attacker enumerates the splitter’s current balances across ETH, ERC20, and ERC1155 held. (2) Attacker forges an EAS attestation with escrowData arrays/totals matching those balances and demandData.oracle=attacker. (3) Attacker submits splits whose per-asset totals exactly match escrowData; validation passes. (4) With a no-op escrowContract, attacker calls collectAndDistribute(...). The splitter decodes the data, ignores collectEscrow’s result, and transfers the listed ETH, ERC20, and ERC1155 amounts from its own holdings to the attacker.
#### Preconditions / Assumptions
- (a). TokenBundleSplitter holds a non-zero mix of ETH, ERC20, and/or ERC1155 balances (e.g., stranded by unsafePartiallyCollectAndDistribute).
- (b). Attacker can create EAS attestations encoding arrays/totals and deploy a no-op escrowContract.
- (c). Public access to arbitrate() and collectAndDistribute() with no schema/attester checks in the splitter; collectEscrow’s result is ignored.

#### Proposed fix

##### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 107 unchanged lines ...
     }
 
+    // SECURITY FIX REQUIRED: Bind attestation to escrowContract and enforce per-call ETH delta == escrowData.amount.
+    // - Require escrowAttestation.attester == escrowContract and intrinsic validity; verify fulfillment.recipient == address(this). Measure ETH balance before/after collectEscrow and require exact delta to prevent draining pre-existing balances.
     function _collectAndDecode(address escrowContract, bytes32 escrow, bytes32 fulfillment)
         internal returns (Split[] memory splits)
 ... 26 unchanged lines ...
```

##### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 147 unchanged lines ...
     // Internal helpers
     // -----------------------------------------------------------------
+    // SECURITY FIX REQUIRED: Bind attestation to escrowContract and enforce per-call deltas for each asset class.
+    // - Require escrowAttestation.attester == escrowContract and intrinsic validity; verify fulfillment.recipient == address(this). Measure ETH/each ERC20/each ERC1155 balance before/after collectEscrow and require deltas equal escrowData.nativeAmount/erc20Amounts[i]/erc1155Amounts[i].
 
     function _collectAndDecode(address escrowContract, bytes32 escrow, bytes32 fulfillment)
 ... 83 unchanged lines ...
```

##### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 159 unchanged lines ...
     }
 
+    // SECURITY FIX REQUIRED: Bind attestation to escrowContract and enforce per-call delta == escrowData.amount.
+    // - Require escrowAttestation.attester == escrowContract and intrinsic validity; verify fulfillment.recipient == address(this). Measure balance before/after collectEscrow and require exact delta to prevent draining pre-existing balances.
     function _collectAndDecode(address escrowContract, bytes32 escrow, bytes32 fulfillment)
         internal returns (Split[] memory splits, address token)
 ... 30 unchanged lines ...
```

##### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 109 unchanged lines ...
     }
 
+    // SECURITY FIX REQUIRED: Bind attestation to escrowContract and enforce per-call ERC1155 delta == escrowData.amount for tokenId.
+    // - Require escrowAttestation.attester == escrowContract and intrinsic validity; verify fulfillment.recipient == address(this). Measure balanceOf(tokenId) before/after collectEscrow and require exact delta to prevent draining pre-existing balances.
     function _collectAndDecode(address escrowContract, bytes32 escrow, bytes32 fulfillment)
         internal returns (Split[] memory splits, address token, uint256 tokenId)
 ... 26 unchanged lines ...
```

#### Related findings

##### [Medium] Missing recipient binding and receipt verification in splitter collect/distribute flow causes escrow bypass and potential splitter balance drain

###### Description

Splitter contracts call collectEscrow and then distribute from their own balances without verifying that the fulfillment recipient is the splitter or that the splitter actually received the escrowed assets, allowing attacker-directed releases when the oracle publishes a decision for an attacker-crafted fulfillment.

BaseEscrowObligation and its tierable variant release escrowed assets to fulfillment.recipient. The splitter contracts (ERC20Splitter, ERC1155Splitter, NativeTokenSplitter, TokenBundleSplitterBase) implement IArbiter.checkObligation by only checking that the designated oracle has stored a decision for (fulfillment, escrow). They do not bind fulfillment.recipient to the splitter, nor do they verify that assets were received by the splitter after collectEscrow. If a fulfillment is created with recipient set to an attacker address and the designated oracle posts a decision for that (fulfillment, escrow) pair, collectEscrow will send the escrowed assets directly to the attacker. The unsafePartiallyCollectAndDistribute path finalizes the release even if all payouts fail (events only), fully bypassing the intended split. In the atomic collectAndDistribute path, if the splitter holds sufficient preexisting balances of the same asset(s), recipients are paid from the splitter’s holdings while the actual escrowed assets are released to the attacker, effectively draining the splitter.

###### Severity

**Impact Explanation:** [High] Escrowed principal funds can be released directly to the attacker or, in the atomic path, the splitter’s existing balances can be drained to pay recipients while the attacker keeps the escrowed assets.

**Likelihood Explanation:** [Low] Exploitation requires the designated oracle (external integration) to publish a decision for an attacker-crafted fulfillment whose recipient is not the splitter; this is integration misbehavior or error rather than an on-chain inevitability.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Unsafe ERC20 collection and distribution: The attacker creates a fulfillment F for escrow E with recipient set to the attacker. The designated oracle publishes a decision for (F, E). Calling ERC20Splitter.unsafePartiallyCollectAndDistribute triggers collectEscrow to send the escrowed tokens to the attacker; subsequent distribution attempts fail and only emit events, finalizing the bypass.
#### Preconditions / Assumptions
- (a). Escrow E’s arbiter is a splitter contract (ERC20Splitter) and its demand encodes a designated oracle address O
- (b). A fulfillment F exists for E (for non-tierable escrows: F.refUID == E; for tierable escrows: no refUID binding required)
- (c). F.recipient is the attacker (not the splitter)
- (d). The designated oracle O publishes a decision for (F, E) on the splitter
- (e). The attacker (or anyone) calls ERC20Splitter.unsafePartiallyCollectAndDistribute with escrowContract pointing to the correct escrow obligation

### Scenario 2.
Atomic ERC20 collection drains preexisting splitter balance: With the same attacker-crafted fulfillment and oracle decision, calling ERC20Splitter.collectAndDistribute causes collectEscrow to send escrowed tokens to the attacker, then the splitter successfully pays recipients from its own preexisting token balance, reducing the splitter’s holdings by the escrow amount.
#### Preconditions / Assumptions
- (a). All preconditions of Scenario 1
- (b). The splitter already holds at least the escrow amount of the ERC20 token being split so that all payout transfers can succeed atomically

### Scenario 3.
Direct escrow collection without the splitter: After the oracle publishes a decision for (F, E) where F.recipient is the attacker, the attacker calls collectEscrow on the escrow contract directly. The arbiter check passes against the splitter’s stored decision, and the escrow releases funds to the attacker with no splitter distribution executed.
#### Preconditions / Assumptions
- (a). Escrow E’s arbiter is a splitter contract and its demand encodes a designated oracle address O
- (b). A fulfillment F exists (as above) with recipient set to the attacker
- (c). The designated oracle O publishes a decision for (F, E) on the splitter
- (d). The attacker calls collectEscrow(E, F) directly on the escrow obligation contract

###### Proposed fix

####### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 111 unchanged lines ...
 
     function checkObligation(Attestation memory fulfillment, bytes memory demand, bytes32 escrow) public view override returns (bool) {
+        if (fulfillment.recipient != address(this)) return false;
         DemandData memory demandData = abi.decode(demand, (DemandData));
         bytes32 decisionKey = keccak256(abi.encodePacked(fulfillment.uid, escrow));
 ... 78 unchanged lines ...
```

####### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 75 unchanged lines ...
 
     function checkObligation(Attestation memory fulfillment, bytes memory demand, bytes32 escrow) public view override returns (bool) {
+        if (fulfillment.recipient != address(this)) return false;
         DemandData memory demandData = abi.decode(demand, (DemandData));
         return hasDecision[demandData.oracle][keccak256(abi.encodePacked(fulfillment.uid, escrow))];
 ... 60 unchanged lines ...
```

####### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 73 unchanged lines ...
 
     function checkObligation(Attestation memory fulfillment, bytes memory demand, bytes32 escrow) public view override returns (bool) {
+        if (fulfillment.recipient != address(this)) return false;
         DemandData memory demandData = abi.decode(demand, (DemandData));
         return hasDecision[demandData.oracle][keccak256(abi.encodePacked(fulfillment.uid, escrow))];
 ... 60 unchanged lines ...
```

####### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 108 unchanged lines ...
 
     function checkObligation(Attestation memory fulfillment, bytes memory demand, bytes32 escrow) public view override returns (bool) {
+        if (fulfillment.recipient != address(this)) return false;
         DemandData memory demandData = abi.decode(demand, (DemandData));
         return hasDecision[demandData.oracle][keccak256(abi.encodePacked(fulfillment.uid, escrow))];
 ... 122 unchanged lines ...
```

### 9. [High] Missing ETH forwarding for paid attestations in AttestationEscrowHook.onRelease causes indefinite funds lock

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

AttestationEscrowHook calls EAS.attest without forwarding ETH, so any attestation request that specifies a non-zero resolver payment (data.value > 0) always reverts. When used in AllEscrowHook with asset hooks, this blocks escrow collection; with non-expiring escrows, funds can be locked indefinitely.

AttestationEscrowHook.onRelease decodes HookData and calls eas.attest(decoded.attestation) without attaching ETH. EAS.attest enforces that msg.value must cover AttestationRequest.data.value (and reverts with NotPayable/InsufficientValue otherwise). Thus, any non-zero value request fails. AllEscrowHook forwards ETH only on lock and never on release, and HookEscrowObligation’s collect flow is atomic; a revert in AttestationEscrowHook on release reverts the entire collection, leaving assets locked in their respective hooks. If the escrow has no expiry, there is no reclaim path, resulting in indefinite fund lock. Although AttestationEscrowHook.onLock is payable, it only marks pending and does not track or forward ETH later; any ETH mistakenly sent to it on lock is not used to fund the EAS call and is not refunded.

#### Severity

**Impact Explanation:** [High] In the non-expiring case, funds are frozen indefinitely with no functional workaround, satisfying high-impact criteria.

**Likelihood Explanation:** [Medium] Exploitation requires the depositor to match an arbiter’s demand that includes a paid-attestation configuration and to choose a non-expiring escrow; these are plausible configuration choices in normal protocol usage but not guaranteed in all deployments.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Indefinite lock: An adversarial arbiter publishes a demand requiring AllEscrowHook composed of an asset hook (e.g., ERC20EscrowHook) and AttestationEscrowHook whose HookData.attestation.data.value > 0. The depositor matches this demand and sets the escrow expirationTime = 0. At collection, AttestationEscrowHook.onRelease calls EAS.attest without value, which reverts due to the non-zero requested value; AllEscrowHook’s atomic release reverts, blocking collection. With no expiry, reclaim is disallowed, and the deposited assets remain indefinitely locked in the asset hook.
#### Preconditions / Assumptions
- (a). Arbiter may be adversarial (in-scope trust model) and publishes a demand requiring AllEscrowHook including AttestationEscrowHook with HookData.attestation.data.value > 0
- (b). Depositor chooses to match the arbiter’s demand (normal protocol usage)
- (c). Escrow expirationTime is set to 0 (non-expiring)
- (d). Assets are escrowed via a leaf hook (e.g., ERC20EscrowHook) under AllEscrowHook
- (e). EAS enforces resolver payment semantics for non-zero AttestationRequest.data.value

### Scenario 2.
Temporary DoS until expiry: Same composition as above, but the escrow has a finite expirationTime > 0. All collection attempts revert because AttestationEscrowHook cannot satisfy the non-zero value requirement on release. Funds remain locked until the escrow expires; after expiry, reclaimExpired returns the assets to the depositor.
#### Preconditions / Assumptions
- (a). Arbiter may be adversarial and publishes a demand requiring AllEscrowHook including AttestationEscrowHook with HookData.attestation.data.value > 0
- (b). Depositor chooses to match the arbiter’s demand (normal protocol usage)
- (c). Escrow expirationTime > 0 (finite expiry)
- (d). Assets are escrowed via a leaf hook (e.g., ERC20EscrowHook) under AllEscrowHook
- (e). EAS enforces resolver payment semantics for non-zero AttestationRequest.data.value

#### Proposed fix

##### AttestationEscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook.sol)

```diff
 ... 42 unchanged lines ...
         address /* escrow */
     ) external payable override {
-        // Mark as pending so onRelease can verify it was locked via a
-        // legitimate obligation flow.
+        HookData memory decoded = abi.decode(data, (HookData));
+        require(decoded.attestation.data.value == 0);
+        require(msg.value == 0);
+
         bytes32 dataHash = keccak256(data);
         pending[msg.sender][dataHash] = true;
     }
 
     function onRelease(
         bytes calldata data,
         address /* to */,
         address /* escrow */
     ) external override {
         bytes32 dataHash = keccak256(data);
         if (!pending[msg.sender][dataHash]) {
             revert NoPendingAttestation(msg.sender, dataHash);
         }
 
         pending[msg.sender][dataHash] = false;
 
         HookData memory decoded = abi.decode(data, (HookData));
+        require(decoded.attestation.data.value == 0);
         try eas.attest(decoded.attestation) {} catch {
             revert AttestationCreationFailed();
 ... 31 unchanged lines ...
```

#### Related findings

##### [Medium] Deferred validation of hookData in AttestationEscrowHook causes uncollectible escrows and atomic DoS of bundled releases

###### Description

AttestationEscrowHook accepts arbitrary bytes at lock without validation and only decodes at release, causing abi.decode to hard-revert and block collection; when composed via AllEscrowHook this atomically reverts release of other escrowed assets as well. A similar static failure occurs if the nested AttestationRequest specifies a nonzero value that isn’t forwarded to EAS.

AttestationEscrowHook.onLock records keccak256(data) into a pending map and does not decode or validate the bytes. In onRelease, it first checks/clears pending and then performs abi.decode(data, (HookData)) outside any try/catch; malformed bytes cause a hard revert, rendering the escrow uncollectible. HookEscrowObligation forwards the same opaque hookData at both lock and release, so malformed data accepted at lock will always fail later. When used inside AllEscrowHook with asset-bearing hooks, any revert in AttestationEscrowHook.onRelease atomically reverts the entire release, preventing payout of those assets. Even with well-formed data, if the nested AttestationRequest has a nonzero value, AttestationEscrowHook doesn’t forward ETH to EAS.attest, triggering an InsufficientValue revert and the same atomic failure. Depositors can later recover their assets via reclaimExpired if an expiration was set, but fulfillers are denied collection despite valid fulfillment.

###### Severity

**Impact Explanation:** [Medium] Per-escrow denial of the core release workflow: fulfillment cannot trigger payout due to late validation or missing value forwarding. No direct theft or global breakage, but significant availability/liveness failure for affected escrows.

**Likelihood Explanation:** [Medium] Requires a malicious depositor to choose problematic hookData or nonzero value and a victim to engage with that escrow. Front-ends/SDKs can mitigate accidental misuse, and alternative cheating vectors (e.g., adversarial arbiters) exist; nonetheless, adversarial configuration is straightforward and plausible.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
A malicious depositor creates an escrow using AllEscrowHook that bundles ERC20EscrowHook with AttestationEscrowHook, providing malformed hookData for the attestation hook. ERC20 funds lock successfully at creation, but on collection AllEscrowHook calls AttestationEscrowHook.onRelease, which abi.decodes the malformed bytes and reverts; the entire release reverts and the fulfiller cannot collect. After expiry, the depositor calls reclaimExpired and recovers their ERC20.
#### Preconditions / Assumptions
- (a). Depositor selects HookEscrowObligation with AllEscrowHook composed of ERC20EscrowHook and AttestationEscrowHook
- (b). AttestationEscrowHook.hookData is malformed (not abi.encode(HookData))
- (c). Escrow attestation has expirationTime > 0 to enable reclaimExpired
- (d). Fulfiller obtains a valid fulfillment attestation accepted by the arbiter
- (e). Canonical EAS and AllEscrowHook behavior as in the repository

### Scenario 2.
A malicious depositor uses AllEscrowHook with ERC20EscrowHook and AttestationEscrowHook but sets the nested AttestationRequest.data.value > 0 while providing no ETH. Lock succeeds and funds are held. At collection, AttestationEscrowHook calls EAS.attest with zero msg.value; EAS reverts with InsufficientValue, causing the entire release to revert atomically. After expiry, the depositor reclaims the ERC20.
#### Preconditions / Assumptions
- (a). Depositor selects HookEscrowObligation with AllEscrowHook composed of ERC20EscrowHook and AttestationEscrowHook
- (b). AttestationEscrowHook.HookData contains a nested AttestationRequest with data.value > 0
- (c). No ETH is forwarded to EAS.attest by the hook (values array provides zero for the attestation sub-hook)
- (d). Escrow attestation has expirationTime > 0 to enable reclaimExpired
- (e). Fulfiller obtains a valid fulfillment attestation accepted by the arbiter
- (f). Canonical EAS behavior enforcing sufficient msg.value for request.value

### Scenario 3.
A malicious depositor uses AllEscrowHook with ERC20EscrowHook and AttestationEscrowHook2, supplying malformed hookData for the attestation-validation hook. Lock succeeds and funds are held. At collection, AttestationEscrowHook2.onRelease fails during abi.decode, reverting the entire release and blocking payout; after expiry the depositor reclaims the ERC20.
#### Preconditions / Assumptions
- (a). Depositor selects HookEscrowObligation with AllEscrowHook composed of ERC20EscrowHook and AttestationEscrowHook2
- (b). AttestationEscrowHook2.hookData is malformed (not abi.encode(HookData))
- (c). Escrow attestation has expirationTime > 0 to enable reclaimExpired
- (d). Fulfiller obtains a valid fulfillment attestation accepted by the arbiter
- (e). Canonical EAS and AllEscrowHook behavior as in the repository

###### Proposed fix

####### AttestationEscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook.sol)

```diff
 ... 30 unchanged lines ...
     error AttestationCreationFailed();
     error NoPendingAttestation(address caller, bytes32 hookDataHash);
+    error NonZeroValueNotSupported();
 
     constructor(IEAS _eas) {
         eas = _eas;
     }
 
     // ──────────────────────────────────────────────
 
     function onLock(
         bytes calldata data,
         address /* from */,
         address /* escrow */
     ) external payable override {
+        HookData memory decoded = abi.decode(data, (HookData));
+        if (decoded.attestation.data.value != 0 || msg.value != 0) revert NonZeroValueNotSupported();
         // Mark as pending so onRelease can verify it was locked via a
         // legitimate obligation flow.
 ... 50 unchanged lines ...
```

####### AttestationEscrowHook2.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook2.sol)

```diff
 ... 47 unchanged lines ...
         address /* escrow */
     ) external payable override {
+        abi.decode(data, (HookData));
         bytes32 dataHash = keccak256(data);
         pending[msg.sender][dataHash] = true;
 ... 62 unchanged lines ...
```

### 10. [High] Missing fulfillment validation in BaseEscrowObligationTierable.collectEscrowRaw causes escrowed funds to be burned or stolen

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

BaseEscrowObligationTierable.collectEscrowRaw() does not validate the fulfillment attestation (existence, schema, or intrinsic properties) before passing it to the arbiter and paying fulfillment.recipient. With the canonical EAS, unknown UIDs return a zeroed attestation rather than reverting, so nonexistent fulfillments can be approved by certain arbiters. This can burn native ETH to address(0) or enable theft when arbiters (e.g., splitters with a malicious oracle) accept attacker-controlled fulfillments, especially when the escrow is called directly instead of via the splitters’ atomic flow.

In tierable escrow collection, BaseEscrowObligationTierable.collectEscrowRaw() validates only the escrow attestation (schema and intrinsic checks) and performs no validation on the fulfillment attestation (no existence check, no schema check, no intrinsic check). The canonical EAS implementation’s getAttestation() returns a zeroed Attestation for unknown UIDs (it does not revert), rendering try/catch-based not-found handling ineffective for fulfillments. The function then calls the configured arbiter with the unvalidated fulfillment and, on approval, revokes the escrow and releases its value to fulfillment.recipient. Some arbiters in this repository accept fulfillments without ensuring existence or binding (e.g., IntrinsicsArbiter that only checks not-expired/not-revoked; splitters that accept by fulfillment.uid if their oracle has stored a decision). This enables two classes of impact: (1) for native-token escrows, sending ETH to address(0) succeeds, so nonexistent fulfillments burn escrowed ETH; (2) for ERC assets, while sending to address(0) typically reverts, theft is possible if a malicious oracle pre-approves an attacker-created fulfillment whose recipient is the attacker, and the attacker calls the escrow directly (bypassing the splitters’ atomic collect-and-distribute, which would otherwise roll back). The non-tierable base (BaseEscrowObligation) is less exposed due to a refUID == escrow.uid check that blocks nonexistent fulfillments, but it still lacks fulfillment schema/intrinsic validation. TokenBundleEscrowObligation’s unsafe partial collect path inherits the same risk for ETH burns.

#### Severity

**Impact Explanation:** [High] Direct, material loss of principal funds: native ETH can be burned to address(0), and ERC assets can be stolen when an arbiter approves an attacker-controlled fulfillment.

**Likelihood Explanation:** [Medium] At least one severe scenario (native ETH burn with IntrinsicsArbiter) requires only a plausible arbiter configuration and a direct call, without external integration compromise (medium). Other scenarios require a malicious/careless oracle (external integration), which lowers their likelihood to low.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Native ETH burn using IntrinsicsArbiter: A victim creates a native-token escrow (NativeTokenEscrowObligation) with IntrinsicsArbiter as the arbiter. An attacker directly calls collectEscrow with a nonexistent fulfillment UID (e.g., 0x0). The base tierable contract does not validate fulfillment, IntrinsicsArbiter accepts the zeroed attestation (non-expiring, not revoked), and the escrow releases ETH to fulfillment.recipient = address(0), burning the funds.
#### Preconditions / Assumptions
- (a). Victim creates a native-token escrow in NativeTokenEscrowObligation with a valid escrow attestation.
- (b). Escrow’s arbiter is IntrinsicsArbiter (included in the repository).
- (c). Attacker can call collectEscrow on the escrow contract directly.
- (d). Canonical EAS returns a zeroed Attestation for unknown UIDs (no revert).
- (e). Standard ETH transfer to address(0) via call succeeds (burns ETH).

### Scenario 2.
Native ETH burn via Splitter arbiter with malicious/careless oracle: A victim creates a native-token escrow (NativeTokenEscrowObligation) with a Splitter arbiter and a designated oracle. The oracle stores a decision for a nonexistent fulfillment UID. An attacker directly calls collectEscrow with that UID. The base tierable contract does not validate fulfillment; the Splitter’s checkObligation returns true due to the stored decision; ETH is released to address(0) and burned. Calling through the splitter’s atomic collect-and-distribute would revert, but the attacker bypasses it by calling the escrow directly.
#### Preconditions / Assumptions
- (a). Victim creates a native-token escrow in NativeTokenEscrowObligation with a Splitter arbiter and a designated oracle.
- (b). The designated oracle is malicious/careless and stores a decision for a nonexistent fulfillment UID.
- (c). Attacker can call collectEscrow on the escrow contract directly (not via the splitter).
- (d). Canonical EAS returns a zeroed Attestation for unknown UIDs (no revert).
- (e). Standard ETH transfer to address(0) via call succeeds (burns ETH).

### Scenario 3.
Theft of ERC20/721 escrow via Splitter arbiter and malicious oracle: A victim escrows ERC20 or ERC721 using a Splitter arbiter. An attacker creates a real EAS attestation (fulfillment) under any schema with recipient set to the attacker. A malicious oracle records a decision for that fulfillment UID. The attacker calls collectEscrow directly on the escrow. With no fulfillment validation in the base tierable contract and a positive Splitter check, the escrow transfers the tokens/NFT to the attacker EOA.
#### Preconditions / Assumptions
- (a). Victim creates an ERC20EscrowObligation or ERC721EscrowObligation with a Splitter arbiter and a designated oracle.
- (b). Attacker creates a real EAS attestation (fulfillment) with recipient = attacker EOA (any schema).
- (c). The designated oracle is malicious/careless and stores a decision for that fulfillment UID.
- (d). Attacker calls collectEscrow on the escrow contract directly (not via the splitter).
- (e). Standard ERC20/ERC721 transfers to a valid EOA succeed.

#### Proposed fix

##### NativeTokenEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/NativeTokenEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/tierable/NativeTokenEscrowObligation.sol)

```diff
 ... 63 unchanged lines ...
         );
 
+        if (to == address(0)) revert NativeTokenTransferFailed(to, decoded.amount);
         (bool success, ) = payable(to).call{value: decoded.amount}("");
         if (!success) {
 ... 83 unchanged lines ...
```

##### BaseEscrowObligationTierable.sol

File: `contracts/src/BaseEscrowObligationTierable.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/BaseEscrowObligationTierable.sol)

```diff
 ... 85 unchanged lines ...
         if (!escrow._checkIntrinsic()) revert InvalidEscrowAttestation();
 
+        if (_fulfillment == bytes32(0) || fulfillment.uid != _fulfillment) revert InvalidFulfillment();
+        if (fulfillment.recipient == address(0)) revert InvalidFulfillment();
         // Extract arbiter and demand from escrow data
         (address arbiter, bytes memory demand) = extractArbiterAndDemand(
 ... 91 unchanged lines ...
```

##### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 140 unchanged lines ...
         // Transfer native tokens - revert on failure
         if (decoded.nativeAmount > 0) {
+            if (to == address(0)) revert NativeTokenTransferFailed(to, decoded.nativeAmount);
             (bool success, ) = payable(to).call{value: decoded.nativeAmount}(
                 ""
 ... 463 unchanged lines ...
         if (!escrow._checkIntrinsic()) revert InvalidEscrowAttestation();
 
+        if (_fulfillment == bytes32(0) || fulfillment.uid != _fulfillment) revert InvalidFulfillment();
+        if (fulfillment.recipient == address(0)) revert InvalidFulfillment();
         // Extract arbiter and demand from escrow data
         (address arbiter, bytes memory demand) = extractArbiterAndDemand(
 ... 87 unchanged lines ...
```

#### Related findings

##### [Medium] Missing fulfillment intrinsic validation in BaseEscrowObligation collect paths causes release of escrowed funds using expired/revoked fulfillments

###### Description

BaseEscrowObligation and BaseEscrowObligationTierable validate only the escrow attestation (and non-tierable refUID binding) before delegating to the arbiter; they do not enforce that the fulfillment attestation is currently unexpired or unrevoked. If a naive or adversarial arbiter approves based on a cached mapping and ignores the Attestation’s expiration/revocation fields, stale fulfillments can be used to collect escrowed assets.

In collectEscrowRaw() of both BaseEscrowObligation and BaseEscrowObligationTierable, the escrow attestation is checked for schema correctness and intrinsic freshness using ArbiterUtils._checkIntrinsic(). The fulfillment attestation is fetched but not intrinsically validated by the base contract before calling IArbiter.checkObligation(). The non-tierable base checks only fulfillment.refUID == escrow.uid; the tierable base intentionally omits even that. This design delegates fulfillment validity entirely to the arbiter. If an integrator supplies a naive or adversarial arbiter that returns true based on a cached approval by UID and ignores the Attestation’s revocationTime/expirationTime, an attacker can obtain approval while the fulfillment is valid and later collect after the fulfillment expires or is revoked. While arbiters provided in this repository do call _checkIntrinsic on the fulfillment, the base omission remains a risk for downstream/custom arbiters. In tierable mode, the same stale fulfillment can be reused to drain multiple escrows because there is no refUID binding by design.

###### Severity

**Impact Explanation:** [High] Direct, material loss of principal funds: escrowed assets can be released to an attacker using expired or revoked fulfillments.

**Likelihood Explanation:** [Low] Exploitation requires integrators to adopt a naive or adversarial arbiter that ignores the Attestation’s intrinsic validity and, in some scenarios, fulfillments with expirations or revocation paths. Arbiters included in this repository already enforce intrinsic checks, making these conditions uncommon but plausible in downstream integrations.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Non-tierable HookEscrowObligation with ERC20EscrowHook and a naive CustomArbiter: the buyer escrows ERC20 via HookEscrowObligation (arbiter set to CustomArbiter). The attacker creates a fulfillment attestation with a short expiration and refUID bound to the escrow, gets CustomArbiter to set approved[uid]=true while valid, waits for expiration, then calls collectEscrowRaw. The base checks only escrow intrinsics and refUID binding, the naive arbiter returns true, and assets are released to the attacker despite the fulfillment being expired.
#### Preconditions / Assumptions
- (a). Escrow uses BaseEscrowObligation (non-tierable), e.g., HookEscrowObligation with ERC20EscrowHook
- (b). Arbiter is a naive or adversarial CustomArbiter that approves by UID and ignores Attestation expiration/revocation
- (c). Fulfillment attestation can be created with a non-zero expiration and refUID bound to the escrow UID
- (d). Buyer selects the CustomArbiter in the escrow data
- (e). Tokens behave as standard ERC20 per scope

### Scenario 2.
Tierable escrow inheritor with a naive CustomArbiter using an OptimisticStringValidator (OSV) attestation as fulfillment: the buyer uses a tierable escrow (no refUID binding). The attacker creates an OSV validation attestation and gets approved[uid]=true in the arbiter. Later, a mediate flow revokes that attestation. The attacker calls collectEscrowRaw with the revoked attestation on the tierable escrow; the base checks escrow intrinsics only, the naive arbiter returns true, and assets are released despite the fulfillment being revoked.
#### Preconditions / Assumptions
- (a). Escrow uses a BaseEscrowObligationTierable inheritor (tierable; no refUID binding)
- (b). Arbiter is a naive or adversarial CustomArbiter that approves by UID and ignores Attestation expiration/revocation
- (c). Fulfillment attestation is created via OptimisticStringValidator (revocable via mediate() under certain flows)
- (d). Buyer selects the CustomArbiter in the escrow data

### Scenario 3.
Tierable multi-escrow drain via a single expired fulfillment: multiple tierable escrows are configured with a naive CustomArbiter. The attacker creates one fulfillment with a non-zero expiration and obtains approval while valid. After it expires, the attacker repeatedly calls collectEscrowRaw across different escrows with the same expired fulfillment. The base does not validate fulfillment intrinsics and the naive arbiter returns true, allowing multiple escrows to be drained.
#### Preconditions / Assumptions
- (a). Multiple escrows use a BaseEscrowObligationTierable inheritor (tierable; no refUID binding)
- (b). Arbiter is a naive or adversarial CustomArbiter that approves by UID and ignores Attestation expiration/revocation
- (c). A fulfillment attestation exists with a non-zero expiration
- (d). Buyer(s) select the CustomArbiter in escrow data for each escrow

###### Proposed fix

####### BaseEscrowObligation.sol

File: `contracts/src/BaseEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/BaseEscrowObligation.sol)

```diff
 ... 93 unchanged lines ...
         if (fulfillment.refUID != escrow.uid) revert InvalidFulfillment();
 
+        // Enforce fulfillment freshness (not expired, not revoked)
+        if (!fulfillment._checkIntrinsic()) revert InvalidFulfillment();
+
         // Check fulfillment via the specified arbiter
         if (!IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid))
 ... 83 unchanged lines ...
```

####### BaseEscrowObligationTierable.sol

File: `contracts/src/BaseEscrowObligationTierable.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/BaseEscrowObligationTierable.sol)

```diff
 ... 93 unchanged lines ...
         // This allows multiple escrows to be associated with one fulfillment
 
+        // Enforce fulfillment freshness (not expired, not revoked)
+        if (!fulfillment._checkIntrinsic()) revert InvalidFulfillment();
+
         // Check fulfillment via the specified arbiter
         if (!IArbiter(arbiter).checkObligation(fulfillment, demand, escrow.uid))
 ... 83 unchanged lines ...
```

### 11. [High] Missing split-total validation and per-escrow output bounds in TokenBundleSplitterUnvalidated/TokenBundleSplitterBase causes cross-escrow theft of stranded assets

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

TokenBundleSplitterUnvalidated accepts arbitrary splits without validating totals, and collectAndDistribute transfers from the splitter’s live balance without bounding outputs to the current escrow. If prior escrows leave residual assets (under-allocation or partial distribution), a new attacker-controlled escrow can reference those tokens and drain the leftovers via arbitrary splits.

In TokenBundleSplitterUnvalidated, arbitrate() delegates to storage with only minimal checks (non-empty, cap, non-zero recipient). There is no validation that split totals match the escrow’s deposited amounts or that array lengths align. During collectAndDistribute(), the splitter first collects the escrow to itself (as the fulfillment recipient) and then transfers assets per splits using the escrow’s token lists, but it does not bound the transferred totals to what was just collected for that escrow. The arbiter check only verifies that the demand-specified oracle stored a decision for (fulfillment, escrow), not that totals are correct. New fulfillments with recipient = splitter are trivial via createFulfillment. Non-hook bundle escrows allow zero amounts per token, so an attacker can craft a new escrow that deposits nothing yet references token addresses that exist in the splitter’s balance. As a result, leftover ERC20/native/ERC1155 tokens from prior escrows can be drained to attacker-controlled recipients. ERC721 leftovers are generally not practically drainable this way because creating a new escrow for a specific ERC721 forces the creator to transfer that NFT during lock. The validated TokenBundleSplitter avoids the issue by enforcing split totals and array sizes at arbitration time.

#### Severity

**Impact Explanation:** [High] Direct, material loss of principal assets (ERC20/ETH/ERC1155) left in the splitter from prior escrows can be stolen via later attacker-controlled escrows.

**Likelihood Explanation:** [Medium] Requires the existence of leftover assets due to under-allocation or partial distribution—plausible in normal use of the unvalidated splitter or when using best-effort partial distribution—without other special constraints.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Leftover ERC20 drain: A prior escrow using the unvalidated splitter under-allocates 1,000 T into 900 T, leaving 100 T in the splitter. The attacker creates a new escrow with arbiter = splitter, sets demand.oracle to themselves, references token T with amount 0, creates a fulfillment with recipient = splitter, submits splits paying 100 T to themselves, and calls collectAndDistribute. The escrow releases 0 to the splitter, but distribution sends 100 T from the splitter’s leftover balance to the attacker.
#### Preconditions / Assumptions
- (a). A shared TokenBundleSplitterUnvalidated is deployed and in use
- (b). A prior escrow using this splitter results in under-allocation or unsafe partial distribution, leaving leftover ERC20 T in the splitter
- (c). ERC20 tokens behave as standard (no FoT/rebasing; 0-amount operations allowed)
- (d). Attacker can create a new escrow that selects the splitter as arbiter and sets demand.oracle to their own EOA
- (e). The escrow-obligation’s collectEscrow transfers assets to the fulfillment recipient (splitter), even if per-token amounts are zero
- (f). Attacker can create a fulfillment with recipient = splitter (e.g., via createFulfillment)
- (g). Splitter arbiter check only requires a stored decision for (fulfillment, escrow)
- (h). No per-escrow output bounds or totals validation in the unvalidated splitter

### Scenario 2.
Leftover ETH drain: A prior escrow leaves 0.4 ETH in the splitter due to under-allocation or partial distribution. The attacker creates a new escrow with arbiter = splitter, nativeAmount = 0, sets demand.oracle to themselves, creates a fulfillment (recipient = splitter), stores a split paying 0.4 ETH to themselves, and calls collectAndDistribute. The escrow releases 0 ETH, but the splitter pays 0.4 ETH from its existing balance to the attacker.
#### Preconditions / Assumptions
- (a). A shared TokenBundleSplitterUnvalidated is deployed and in use
- (b). A prior escrow leaves leftover ETH in the splitter due to under-allocation or partial distribution
- (c). Attacker can create a new escrow that selects the splitter as arbiter and sets demand.oracle to their own EOA
- (d). The escrow-obligation’s collectEscrow transfers assets to the fulfillment recipient (splitter)
- (e). Attacker can create a fulfillment with recipient = splitter (e.g., via createFulfillment)
- (f). Splitter arbiter check only requires a stored decision for (fulfillment, escrow)
- (g). No per-escrow output bounds or totals validation in the unvalidated splitter

### Scenario 3.
Leftover ERC1155 drain: A prior escrow leaves 20 units of an ERC1155 (U, ID) in the splitter. The attacker creates a new escrow with arbiter = splitter, references (U, ID) with amount 0, sets demand.oracle to themselves, creates a fulfillment (recipient = splitter), stores a split transferring 20 units to themselves, and calls collectAndDistribute. The escrow releases 0 units, but the splitter transfers 20 leftover units to the attacker.
#### Preconditions / Assumptions
- (a). A shared TokenBundleSplitterUnvalidated is deployed and in use
- (b). A prior escrow leaves leftover ERC1155 (U, ID) units in the splitter due to under-allocation or partial distribution
- (c). Attacker can create a new escrow that selects the splitter as arbiter and sets demand.oracle to their own EOA
- (d). The escrow-obligation’s collectEscrow transfers assets to the fulfillment recipient (splitter), even if per-token amounts are zero
- (e). Attacker can create a fulfillment with recipient = splitter (e.g., via createFulfillment)
- (f). Splitter arbiter check only requires a stored decision for (fulfillment, escrow)
- (g). No per-escrow output bounds or totals validation in the unvalidated splitter

#### Proposed fix

##### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 125 unchanged lines ...
     function collectAndDistribute(address escrowContract, bytes32 escrow, bytes32 fulfillment) external nonReentrant {
         (BundleSplit[] memory splits, EscrowObligationData memory escrowData) = _collectAndDecode(escrowContract, escrow, fulfillment);
+        // SECURITY: Before distributing, enforce per-escrow output bounds:
+        // - For each split, ensure erc20Amounts.length/erc1155Amounts.length <= lengths in escrowData.
+        // - Accumulate totals across all splits and require:
+        //   nativeSum <= escrowData.nativeAmount; per-ERC20[i] sum <= escrowData.erc20Amounts[i]; per-ERC1155[i] sum <= escrowData.erc1155Amounts[i].
+        // - Validate each ERC721 index < escrowData.erc721Tokens.length (and optionally reject duplicate indices).
         for (uint256 s; s < splits.length; ++s) {
             address recipient = _resolveSentinel(splits[s].recipient, fulfillment);
             _distributeAtomic(splits[s], escrowData, recipient);
         }
         emit EscrowCollectedAndDistributed(escrow, fulfillment, fulfillers[fulfillment]);
     }
 
     /// @notice Unsafe partial distribution — continues on individual transfer failures.
     /// @dev Use only as a last resort when collectAndDistribute is permanently blocked.
     ///      Failed transfers emit events but do not revert. Stuck tokens remain in the splitter.
     function unsafePartiallyCollectAndDistribute(address escrowContract, bytes32 escrow, bytes32 fulfillment) external nonReentrant {
+        // SECURITY: Apply the same per-escrow output bounds as in collectAndDistribute()
+        // to prevent cross-escrow draining even in best-effort mode.
+        // Revert if any per-asset bound would be exceeded.
         (BundleSplit[] memory splits, EscrowObligationData memory escrowData) = _collectAndDecode(escrowContract, escrow, fulfillment);
         for (uint256 s; s < splits.length; ++s) {
 ... 26 unchanged lines ...
     }
 
+    // SECURITY: Assumes per-escrow bounds have been validated prior to calling.
     function _distributeAtomic(BundleSplit memory split, EscrowObligationData memory escrowData, address recipient) internal {
         if (split.nativeAmount > 0) {
 ... 64 unchanged lines ...
```

#### Related findings

##### [Medium] Missing array length/index validation in TokenBundleSplitterUnvalidated decisions causes permanent fund freeze in splitter

###### Description

TokenBundleSplitterUnvalidated stores oracle-provided split arrays without validating lengths or ERC721 index ranges. Distribution then indexes escrow arrays by those unvalidated values, enabling a malicious oracle to cause deterministic out-of-bounds reverts. Since anyone can call collectEscrow first to move assets from escrow to the splitter, both collectAndDistribute and its unsafe variant revert thereafter, permanently stranding funds in the splitter.

In TokenBundleSplitterUnvalidated, arbitrate() writes BundleSplit arrays to storage via _storeDecision without validating per-split array lengths or ERC721 index ranges. TokenBundleSplitterBase’s _distributeAtomic/_distributePartial iterate over split.erc20Amounts and split.erc1155Amounts using i to index escrowData.erc20Tokens[i]/erc1155Tokens[i], and over split.erc721Indices using idx to index escrowData.erc721 arrays. Any oversized length or out-of-range idx triggers an out-of-bounds panic. Separately, BaseEscrowObligation.collectEscrowRaw on the escrow contract is public and revokes the escrow while transferring assets to fulfillment.recipient (the splitter) after the arbiter (the splitter) reports a decision exists. An attacker (or any third party) can call collectEscrow before distribution, moving funds into the splitter; subsequent calls to the splitter’s collectAndDistribute/unsafePartiallyCollectAndDistribute revert (they attempt collectEscrow again and/or hit OOB), leaving no distribution-only recovery path. The validated TokenBundleSplitter prevents this by enforcing array-length equality and ERC721 index checks at arbitrate(), and the gas-based size-DoS is practically mitigated by storage gas costs at decision publication.

###### Severity

**Impact Explanation:** [High] Funds can be permanently frozen in the splitter with no on-chain workaround once collectEscrow has revoked the escrow and moved assets to the splitter, satisfying the definition of high-impact fund freeze.

**Likelihood Explanation:** [Low] The attack requires a privileged, user-specified oracle to act maliciously or be compromised and the use of the unvalidated splitter variant, plus sequencing collectEscrow before distribution; these dependencies make the exploit low likelihood under the rules.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Unvalidated: Malicious oracle publishes a decision where a split’s erc20Amounts.length exceeds escrowData.erc20Tokens.length; a third party calls collectEscrow on the escrow contract, moving assets into the splitter and revoking the escrow; any subsequent collectAndDistribute/unsafePartiallyCollectAndDistribute reverts (second collectEscrow and/or out-of-bounds), permanently freezing funds in the splitter.
#### Preconditions / Assumptions
- (a). Escrow created with a compatible escrow obligation whose collectEscrow transfers assets to the fulfillment recipient (the splitter).
- (b). Arbiter set to TokenBundleSplitterUnvalidated; demand encodes an attacker-controlled oracle address.
- (c). A valid fulfillment exists for the escrow (per the escrow’s binding rules).
- (d). Oracle publishes a decision where at least one split has erc20Amounts.length > escrowData.erc20Tokens.length.
- (e). Attacker or any third party calls collectEscrow(escrow, fulfillment) on the escrow contract before the victim attempts distribution.

### Scenario 2.
Unvalidated: Malicious oracle includes an out-of-range ERC721 index in erc721Indices; a third party calls collectEscrow to move assets to the splitter; any distribution attempt reverts (second collectEscrow and/or out-of-bounds on ERC721 arrays), permanently freezing funds.
#### Preconditions / Assumptions
- (a). Escrow created with a compatible escrow obligation whose collectEscrow transfers assets to the fulfillment recipient (the splitter).
- (b). Arbiter set to TokenBundleSplitterUnvalidated; demand encodes an attacker-controlled oracle address.
- (c). A valid fulfillment exists for the escrow (per the escrow’s binding rules).
- (d). Oracle publishes a decision where at least one split contains an ERC721 index >= escrowData.erc721Tokens.length.
- (e). Attacker or any third party calls collectEscrow(escrow, fulfillment) on the escrow contract before the victim attempts distribution.

### Scenario 3.
Validated (lower severity): Malicious oracle attempts to publish a huge but valid decision to cause gas-DoS on distribution; in practice, arbitrate() storage costs to publish such a decision are prohibitively high, strongly mitigating feasibility.
#### Preconditions / Assumptions
- (a). Arbiter set to the validated TokenBundleSplitter; demand encodes an attacker-controlled oracle address.
- (b). A valid fulfillment exists and the oracle attempts to publish a very large but valid decision (lengths match escrow arrays, sums correct, valid ERC721 indices).
- (c). Sufficient gas and block limits would need to allow O(S*M) storage writes in arbitrate(), which is impractical in typical environments.

###### Proposed fix

####### TokenBundleSplitterUnvalidated.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterUnvalidated.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitterUnvalidated.sol)

```diff
 ... 19 unchanged lines ...
         BundleSplit[] calldata splits
     ) external override {
+        Attestation memory escrowAttestation = eas.getAttestation(escrow);
+        EscrowObligationData memory escrowData = abi.decode(escrowAttestation.data, (EscrowObligationData));
+        for (uint256 s; s < splits.length; ++s) {
+            require(splits[s].erc20Amounts.length <= escrowData.erc20Tokens.length, "InvalidERC20ArrayLength");
+            require(splits[s].erc1155Amounts.length <= escrowData.erc1155Tokens.length, "InvalidERC1155ArrayLength");
+            for (uint256 i; i < splits[s].erc721Indices.length; ++i) {
+                require(splits[s].erc721Indices[i] < escrowData.erc721Tokens.length, "InvalidERC721Index");
+            }
+        }
+
         bytes32 decisionKey = keccak256(
             abi.encodePacked(fulfillment, escrow)
         );
 
         _storeDecision(msg.sender, decisionKey, splits);
 
         emit ArbitrationMade(decisionKey, escrow, msg.sender);
     }
 }
```

##### [Medium] Unvalidated oracle splits and revoke-before-verify in TokenBundleSplitterUnvalidated cause permanent stranding of escrowed assets

###### Description

TokenBundleSplitterUnvalidated stores oracle-provided splits without validating totals or array lengths, and collectAndDistribute revokes the escrow and releases assets before verifying distribution completeness. If splits under-allocate or omit assets/indices, the function succeeds and strands the remainder in the splitter with no recovery path; over-allocation reverts and is fixable.

TokenBundleSplitterUnvalidated.arbitrate stores BundleSplit[] via _storeDecision with only basic checks (non-empty, zero-recipient, max length) and no validation of totals or array lengths against the escrowed bundle. TokenBundleSplitterBase.collectAndDistribute calls _collectAndDecode, which invokes the escrow contract’s collectEscrow(escrow, fulfillment). Under HookEscrowObligation → BaseEscrowObligation.collectEscrowRaw, the escrow attestation is validated, then revoked, and assets are released to the fulfillment recipient (the splitter when fulfillment is created via createFulfillment). Afterward, _distributeAtomic transfers only the specified amounts per split; there is no reconciliation to ensure full distribution of all assets held by the splitter. If the splits under-allocate or omit assets/indices, the function completes successfully, leaving undistributed funds stranded in the splitter. Subsequent collect attempts revert due to the escrow’s revocation, and there is no distribute-only or sweep function to recover the remainder. Over-allocation scenarios revert the transaction (undoing revocation and release) and are therefore fixable but can cause temporary DoS until corrected.

###### Severity

**Impact Explanation:** [High] Irrecoverable loss of principal for recipients/depositors due to permanent stranding of undistributed assets in the splitter; funds are frozen indefinitely with no workaround.

**Likelihood Explanation:** [Low] Exploitation depends on oracle/operator mistakes (under-allocation, index omission, or array-length errors). A third party can finalize the state by calling collectAndDistribute, but the initial condition is an operator error.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Under-allocated ETH + ERC20 bundle: An escrow for 10 ETH + 100 USDC is created with HookEscrowObligation and the unvalidated splitter as arbiter. The oracle submits splits totaling 9 ETH and 90 USDC. collectAndDistribute revokes the escrow, releases 10 ETH + 100 USDC to the splitter, then distributes only 9 ETH + 90 USDC. The function succeeds, and 1 ETH + 10 USDC remain permanently stuck in the splitter with no recovery path.
#### Preconditions / Assumptions
- (a). HookEscrowObligation escrow uses TokenBundleSplitterUnvalidated as arbiter and encodes demand with oracle=ORACLE_ADDR
- (b). Escrowed bundle (e.g., 10 ETH + 100 USDC) locked via appropriate IEscrowHook(s) (e.g., AllEscrowHook composing NativeTokenEscrowHook and ERC20EscrowHook)
- (c). A fulfillment is created via the splitter’s createFulfillment so fulfillment recipient is the splitter
- (d). Recipients accept tokens per assumptions; ERC20s behave standardly
- (e). Oracle/operator submits under-allocated splits; any user calls collectAndDistribute

### Scenario 2.
Omitted ERC721 index: An escrow includes two NFTs (tokenIds [1,2]). The oracle’s splits only list the index for tokenId 1. collectAndDistribute revokes the escrow, releases both NFTs to the splitter, and transfers only tokenId 1. The function succeeds; tokenId 2 remains stranded in the splitter with no way to distribute later.
#### Preconditions / Assumptions
- (a). HookEscrowObligation escrow uses TokenBundleSplitterUnvalidated as arbiter and encodes demand with oracle=ORACLE_ADDR
- (b). Escrowed bundle includes ERC721 tokens (e.g., two NFTs)
- (c). A fulfillment is created via the splitter’s createFulfillment so fulfillment recipient is the splitter
- (d). Recipients accept tokens per assumptions; ERC20/ERC721 behave standardly
- (e). Oracle/operator omits an ERC721 index in splits; any user calls collectAndDistribute

### Scenario 3.
ERC20 array length too short: An escrow includes ERC20 tokens [A,B,C]. The oracle’s splits provide erc20Amounts arrays of length 2 (for [A,B]) and omit C. collectAndDistribute revokes the escrow and releases [A,B,C] to the splitter, then distributes only [A,B]. The function succeeds; all of token C remains permanently stuck in the splitter.
#### Preconditions / Assumptions
- (a). HookEscrowObligation escrow uses TokenBundleSplitterUnvalidated as arbiter and encodes demand with oracle=ORACLE_ADDR
- (b). Escrowed bundle includes multiple ERC20 tokens [A,B,C]
- (c). A fulfillment is created via the splitter’s createFulfillment so fulfillment recipient is the splitter
- (d). Recipients accept tokens per assumptions; ERC20s behave standardly
- (e). Oracle/operator provides erc20Amounts arrays shorter than the tokens array (omits C); any user calls collectAndDistribute

###### Proposed fix

####### TokenBundleSplitterUnvalidated.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterUnvalidated.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitterUnvalidated.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {Attestation} from "@eas/Common.sol";
 import {IEAS} from "@eas/IEAS.sol";
-import {TokenBundleSplitterBase} from "./TokenBundleSplitterBase.sol";
+import {TokenBundleSplitter} from "./TokenBundleSplitter.sol";
 
 /// @notice Token bundle splitter without validation of split totals.
 ///         Cheaper oracle calls, but incorrect splits will only surface
 ///         as reverts during collectAndDistribute (over-allocation) or
 ///         stranded tokens in the splitter (under-allocation).
-contract TokenBundleSplitterUnvalidated is TokenBundleSplitterBase {
-    constructor(IEAS _eas) TokenBundleSplitterBase(_eas) {}
+contract TokenBundleSplitterUnvalidated is TokenBundleSplitter {
+    constructor(IEAS _eas) TokenBundleSplitter(_eas) {}
 
     /// @notice Oracle submits a split decision without validation.
     ///         Only checks for empty splits and zero-address recipients.
     function arbitrate(
         bytes32 fulfillment,
         bytes32 escrow,
         BundleSplit[] calldata splits
     ) external override {
+        Attestation memory escrowAttestation = eas.getAttestation(escrow);
+        EscrowObligationData memory escrowData = abi.decode(escrowAttestation.data, (EscrowObligationData));
+        _validateSplits(splits, escrowData);
         bytes32 decisionKey = keccak256(
             abi.encodePacked(fulfillment, escrow)
         );
 
         _storeDecision(msg.sender, decisionKey, splits);
 
         emit ArbitrationMade(decisionKey, escrow, msg.sender);
     }
 }
```

### 12. [High] Prior-block-only commit age check in CommitRevealObligation causes diversion/theft of escrowed assets via N/N+1 copy-commit front-running

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

CommitRevealObligation accepts reveals if the corresponding commit was included in any prior block (commitBlock < block.number). This allows a mempool observer to copy a victim’s reveal, commit for their own recipient in block N, and reveal in block N+1 to create a valid fulfillment attestation. When used as an arbiter for escrows (e.g., HookEscrowObligation), the attacker can collect the escrowed assets to themselves before the victim.

CommitRevealObligation records commits with commitBlock and commitTimestamp and validates reveals by checking that (a) a matching commitment exists for keccak256(abi.encode(refUID, recipient, keccak256(data))), (b) the commit was from a prior block (commitBlock < block.number), and (c) the reveal is within commitDeadline. The arbiter's checkObligation ignores the demand parameter entirely. BaseEscrowObligation.collectEscrowRaw requires only that fulfillment.refUID == escrow.uid and that the arbiter approves, then revokes the escrow and releases assets via the selected IEscrowHook to fulfillment.recipient. Because the anti-front-running protection only enforces a prior-block commit, an attacker who sees the victim’s reveal (data and refUID) in the public mempool can compute a new commitment with their own recipient, submit commit() so it lands in block N, and then reveal in block N+1 to produce a valid fulfillment attestation. They can then call collectEscrow and receive the escrowed assets. This enables diversion/theft of ETH, ERC20, or composed assets (via AllEscrowHook). The issue is most feasible when reveals are sent via public mempool and can be delayed by one block; private orderflow or bundling reveal+collect can mitigate but are not enforced by the contracts.

#### Severity

**Impact Explanation:** [High] Successful exploitation diverts and steals escrowed principal funds (ETH, ERC20, or composed assets) by enabling the attacker to collect first; this is a direct, material loss of principal.

**Likelihood Explanation:** [Medium] Attack depends on public mempool visibility and inter-block ordering where the attacker’s commit is included before the victim’s reveal; this is outside the attacker’s full control but realistic and common on L1 and many L2s.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
ETH escrow theft via HookEscrowObligation + NativeTokenEscrowHook: Buyer escrows X ETH. Victim previously committed. Victim broadcasts a public reveal. Attacker observes the reveal, computes a commitment with their own recipient, gets it mined in block N, then reveals in block N+1 and collects the escrowed ETH to themselves before the victim.
#### Preconditions / Assumptions
- (a). Escrow created with HookEscrowObligation using NativeTokenEscrowHook; X ETH locked in the hook
- (b). CommitRevealObligation is used as the arbiter for the escrow
- (c). Victim previously called commit() with correct bond and valid data/recipient/refUID
- (d). Victim sends reveal via public mempool (not private orderflow)
- (e). Attacker’s commit is included in block N while victim’s reveal lands in block N+1
- (f). commitDeadline has not expired at reveal time

### Scenario 2.
ERC20 escrow theft via HookEscrowObligation + ERC20EscrowHook: Buyer escrows A tokens of T. Victim previously committed. Victim broadcasts a public reveal. Attacker observes, commits for their own recipient in block N, reveals in block N+1, and collects the ERC20 escrow to themselves first.
#### Preconditions / Assumptions
- (a). Escrow created with HookEscrowObligation using ERC20EscrowHook; buyer approved and A tokens of T are locked in the hook
- (b). CommitRevealObligation is used as the arbiter for the escrow
- (c). Victim previously called commit() with correct bond and valid data/recipient/refUID
- (d). Victim sends reveal via public mempool (not private orderflow)
- (e). Attacker’s commit is included in block N while victim’s reveal lands in block N+1
- (f). commitDeadline has not expired at reveal time

### Scenario 3.
Mixed-asset theft via HookEscrowObligation + AllEscrowHook (ERC20 + ETH): Buyer escrows A tokens and B ETH using composed hooks. Victim previously committed. Victim broadcasts a public reveal. Attacker observes, commits in block N, reveals in block N+1, and collects both assets to themselves before the victim.
#### Preconditions / Assumptions
- (a). Escrow created with HookEscrowObligation using AllEscrowHook composing ERC20EscrowHook and NativeTokenEscrowHook; A tokens and B ETH are locked
- (b). CommitRevealObligation is used as the arbiter for the escrow
- (c). Victim previously called commit() with correct bond and valid data/recipient/refUID
- (d). Victim sends reveal via public mempool (not private orderflow)
- (e). Attacker’s commit is included in block N while victim’s reveal lands in block N+1
- (f). commitDeadline has not expired at reveal time

#### Proposed fix

##### CommitRevealObligation.sol

File: `contracts/src/obligations/CommitRevealObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/CommitRevealObligation.sol)

```diff
 ... 57 unchanged lines ...
     error CommitDeadlineNotReached(bytes32 commitment);
     error RevealTooLate(bytes32 commitment);
+    error UnauthorizedRecipient(bytes32 commitment, address expected, address actual);
 
     /// @notice Fixed bond amount required for each commit.
 ... 79 unchanged lines ...
 
         bytes32 revealedCommitment = keccak256(
-            abi.encode(refUID, recipient, keccak256(data))
+            abi.encode(refUID, keccak256(data))
         );
 
         CommitInfo memory info = commitments[revealedCommitment];
 
         // Commitment must exist
         if (info.committer == address(0)) {
             revert CommitmentMissing(revealedCommitment, recipient);
         }
 
+        // Recipient must be the original committer (prevents redirection)
+        if (recipient != info.committer) {
+            revert UnauthorizedRecipient(revealedCommitment, info.committer, recipient);
+        }
         // Commitment must be from a prior block (anti-frontrun)
         if (info.commitBlock >= block.number) {
 ... 26 unchanged lines ...
 
     /// @notice Records a commitment hash, locking the fixed bond.
-    /// @param commitment keccak256(abi.encode(refUID, claimer, keccak256(abi.encode(data)))).
+    /// @param commitment keccak256(abi.encode(refUID, keccak256(abi.encode(data)))).
     /// @dev msg.value must equal `bondAmount` and is held as a bond reclaimable after a valid reveal.
     function commit(bytes32 commitment) external payable {
 ... 20 unchanged lines ...
         returns (bytes32)
     {
-        return keccak256(abi.encode(refUID, claimer, keccak256(abi.encode(data))));
+        return keccak256(abi.encode(refUID, keccak256(abi.encode(data))));
     }
 
     // ---------------------------------------------------------------------
     // Arbiter logic (called from escrow contracts)
     // ---------------------------------------------------------------------
 
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
-            abi.encode(obligation.refUID, obligation.recipient, keccak256(obligation.data))
+            abi.encode(obligation.refUID, keccak256(obligation.data))
         );
         CommitInfo memory info = commitments[revealedCommitment];
         if (info.committer == address(0)) {
             revert CommitmentMissing(revealedCommitment, obligation.recipient);
         }
+        // Enforce recipient binding to the original committer
+        if (obligation.recipient != info.committer) {
+            revert UnauthorizedRecipient(revealedCommitment, info.committer, obligation.recipient);
+        }
 
         // Enforce commitment age to block same-block frontruns
 ... 49 unchanged lines ...
```

#### Related findings

##### [High] Unauthenticated reveal in CommitRevealObligation with splitter EXECUTOR_SENTINEL recording causes diversion of escrow payouts to attacker

###### Description

CommitRevealObligation lets any caller submit a valid reveal and refunds the bond to the original committer without authenticating the revealer. When the reveal is executed via a splitter’s createFulfillment(), the splitter records the caller as the “fulfiller” and later resolves EXECUTOR_SENTINEL recipients to that address. A mempool attacker can front-run a legitimate reveal, become the recorded fulfiller, and capture EXECUTOR_SENTINEL payouts, while the honest committer only gets their bond back.

CommitRevealObligation’s doObligation()/doObligationFor() allow any caller to submit the reveal. In _afterAttest(), the contract recomputes the commitment as keccak256(abi.encode(refUID, recipient, keccak256(data))) using the attestation’s recipient and data, verifies existence and timing, and refunds the bond to commitments[commitment].committer. It never requires msg.sender to equal the original committer. Splitter contracts (ERC20Splitter, NativeTokenSplitter, TokenBundleSplitter) expose createFulfillment(), which calls the obligation’s doObligationRaw and then sets fulfillers[fulfillmentUid] = msg.sender. Because doObligationRaw sets the attestation recipient to msg.sender, a call routed through a splitter yields recipient = splitter (as required for collectEscrow). Later, in distribution, EXECUTOR_SENTINEL recipients are resolved to fulfillers[fulfillmentUid]. If a mempool attacker copies and front-runs the worker’s createFulfillment() call, the valid fulfillment is created (recipient = splitter), the bond is refunded to the committer, and fulfillers[uid] is recorded as the attacker. If the oracle’s decision uses EXECUTOR_SENTINEL for payouts, collectAndDistribute() pays the attacker. The in-scope arbiter checks (in splitter contracts) only confirm that the designated oracle posted a decision for (fulfillment, escrow); they do not link the revealer to the committer, enabling the diversion of funds.

###### Severity

**Impact Explanation:** [High] Direct diversion of principal escrowed funds (ERC20, ETH, and token bundles) from the intended worker/recipients to the attacker via EXECUTOR_SENTINEL resolution qualifies as high impact.

**Likelihood Explanation:** [Medium] Exploitation requires plausible but not universal conditions: the worker reveals via splitter.createFulfillment, uses public mempool, and the oracle allocates a material payout to EXECUTOR_SENTINEL; an attacker then front-runs. These are significant but realistic constraints and the attack is economically rational.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
ERC20 payout capture: A worker commits with claimer = ERC20Splitter, then publicly calls ERC20Splitter.createFulfillment(CommitRevealObligation, data=abi.encode(payload, salt, schema), refUID). An attacker front-runs the identical call, causing CommitRevealObligation to refund the bond to the worker while ERC20Splitter records fulfillers[uid] = attacker. The oracle arbitrates splits using EXECUTOR_SENTINEL for the full amount. collectAndDistribute() resolves EXECUTOR_SENTINEL to the attacker and transfers all escrowed ERC20 to the attacker.
#### Preconditions / Assumptions
- (a). Worker previously committed in CommitRevealObligation with commitment = keccak256(abi.encode(refUID, splitterAddress, keccak256(abi.encode(payload, salt, schema))))
- (b). Worker reveals via ERC20Splitter.createFulfillment calling CommitRevealObligation.doObligationRaw through the splitter
- (c). Reveal is submitted through the public mempool (frontrunnable)
- (d). Oracle for the escrow uses EXECUTOR_SENTINEL for a material portion or all of the ERC20 payout
- (e). Escrow-obligation pairing is compatible (e.g., HookEscrowObligation) so collectEscrow transfers assets to the splitter

### Scenario 2.
Native token (ETH) payout capture: A worker commits with claimer = NativeTokenSplitter and later reveals via NativeTokenSplitter.createFulfillment in the public mempool. An attacker front-runs, becomes fulfillers[uid], and the bond is refunded to the worker. The oracle allocates the ETH to EXECUTOR_SENTINEL. collectAndDistribute() resolves EXECUTOR_SENTINEL to the attacker and transfers the escrowed ETH to the attacker.
#### Preconditions / Assumptions
- (a). Worker previously committed in CommitRevealObligation with claimer = NativeTokenSplitter
- (b). Worker reveals via NativeTokenSplitter.createFulfillment through the public mempool
- (c). Oracle uses EXECUTOR_SENTINEL for a material portion or all of the ETH payout
- (d). Escrow-obligation pairing compatible so collectEscrow transfers ETH to the splitter

### Scenario 3.
Token bundle capture (ETH, ERC20, ERC721/1155): A worker commits with claimer = TokenBundleSplitter and reveals via TokenBundleSplitter.createFulfillment in the public mempool. An attacker front-runs and is recorded as fulfillers[uid]. The oracle submits validated splits assigning nativeAmount, ERC20 totals, ERC721 indices, and ERC1155 totals to EXECUTOR_SENTINEL. collectAndDistribute() resolves the sentinel to the attacker and transfers all assets (ETH, ERC20s, ERC721s, ERC1155s) to the attacker.
#### Preconditions / Assumptions
- (a). Worker previously committed in CommitRevealObligation with claimer = TokenBundleSplitter
- (b). Worker reveals via TokenBundleSplitter.createFulfillment through the public mempool
- (c). Oracle uses EXECUTOR_SENTINEL across bundle assets and satisfies TokenBundleSplitter validation (totals, unique ERC721 assignment)
- (d). Escrow-obligation pairing compatible so collectEscrow transfers the bundle to the splitter

###### Proposed fix

####### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 124 unchanged lines ...
     {
         fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
+        // TODO(sec): Derive fulfiller from CommitRevealObligation.commitments(commitment) when available:
+        // commitment = keccak256(abi.encode(refUID, address(this), keccak256(data))); fall back to msg.sender otherwise.
         fulfillers[fulfillmentUid] = msg.sender;
         emit FulfillmentCreated(fulfillmentUid, msg.sender, obligationContract);
 ... 65 unchanged lines ...
```

####### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 79 unchanged lines ...
     function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID) external payable returns (bytes32 fulfillmentUid) {
         fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
+        // TODO(sec): Derive fulfiller from CommitRevealObligation.commitments(commitment) when available:
+        // commitment = keccak256(abi.encode(refUID, address(this), keccak256(data))); fall back to msg.sender otherwise.
         fulfillers[fulfillmentUid] = msg.sender;
         emit FulfillmentCreated(fulfillmentUid, msg.sender, obligationContract);
 ... 54 unchanged lines ...
```

####### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 81 unchanged lines ...
     function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID) external payable returns (bytes32 fulfillmentUid) {
         fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
+        // TODO(sec): Derive fulfiller from CommitRevealObligation.commitments(commitment) when available:
+        // commitment = keccak256(abi.encode(refUID, address(this), keccak256(data))); fall back to msg.sender otherwise.
         fulfillers[fulfillmentUid] = msg.sender;
         emit FulfillmentCreated(fulfillmentUid, msg.sender, obligationContract);
 ... 54 unchanged lines ...
```

####### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 114 unchanged lines ...
     function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID) external payable returns (bytes32 fulfillmentUid) {
         fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
+        // TODO(sec): Derive fulfiller from CommitRevealObligation.commitments(commitment) when available:
+        // commitment = keccak256(abi.encode(refUID, address(this), keccak256(data))); fall back to msg.sender otherwise.
         fulfillers[fulfillmentUid] = msg.sender;
         emit FulfillmentCreated(fulfillmentUid, msg.sender, obligationContract);
 ... 116 unchanged lines ...
```

##### [Medium] Front-runnable commitment and reverting push-refund in CommitRevealObligation cause third-party DoS of reveal/fulfillment

###### Description

An attacker can front-run commit() with the same commitment hash to set themselves as the committer, then force the refund in _afterAttest to revert, which reverts the entire reveal attestation and blocks fulfillment and downstream escrow collection.

CommitRevealObligation.commit(bytes32) records only the 32-byte commitment and msg.sender as the committer without requiring preimage knowledge. During reveal, BaseObligation._doObligationForRaw first creates the EAS attestation and then calls CommitRevealObligation._afterAttest, which recomputes the commitment from the attestation’s refUID, recipient, and data, and attempts to refund the fixed bond to the stored committer using a low-level call. If that transfer fails, _afterAttest reverts, rolling back the attestation. An attacker can observe a victim’s commit(C) in the mempool, front-run with the same C from a contract address that always reverts on ETH receive, and become the recorded committer. When the victim later reveals, the refund to the attacker fails, reverting the entire transaction and preventing the attestation from ever being created. This blocks fulfillment and any downstream flows (e.g., escrow collection) that require the fulfillment attestation. Deadline and anti-front-run checks (prior block, within commitDeadline) do not bind the committer to the revealer or ensure refund success, so they do not mitigate this vector.

###### Severity

**Impact Explanation:** [Medium] Prevents creation of reveal/fulfillment attestations and thus blocks downstream escrow collection or similar core flows; a significant but generally temporary availability/DoS impact rather than permanent fund loss or >1-week freeze.

**Likelihood Explanation:** [Medium] Front-running in public mempools is common and the attack is straightforward, but it is largely a griefing vector that imposes costs on the attacker and can be mitigated operationally via private order flow; rational incentives exist for targeted cases but are not universal.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Targeted DoS of fulfillment: A victim broadcasts commit(C) via the public mempool. The attacker front-runs with commit(C) from a revert-on-receive contract address, becoming the committer. When the victim later calls doObligation/doObligationFor to reveal, _afterAttest tries to refund the bond to the attacker’s contract, the call reverts, and the attestation creation reverts. The victim cannot produce the fulfillment attestation and cannot collect escrow that depends on it.
#### Preconditions / Assumptions
- (a). Victim uses CommitRevealObligation to produce a fulfillment attestation for an escrow or arbiter flow
- (b). Victim broadcasts commit(C) in the public mempool
- (c). Attacker monitors the mempool and can front-run transactions
- (d). Attacker controls a contract address that reverts on ETH receive/fallback
- (e). Attacker can post the required bondAmount when front-running
- (f). commitDeadline not yet expired for the targeted commitment

### Scenario 2.
Widespread griefing with zero/small bond: If bondAmount is configured as zero or very small, an attacker bots the mempool, front-running most commit(C) calls with a revert-on-receive contract as committer. Later reveals by many users revert on refund failure, making reveal creation unreliable or unusable for public mempool users.
#### Preconditions / Assumptions
- (a). Admin configures bondAmount as zero or very small (permitted by the contract)
- (b). Users broadcast commit(C) via public mempool
- (c). Attacker monitors the mempool, can front-run, and uses a revert-on-receive contract as the committer
- (d). Attacker can repeatedly pay the (small/zero) bond and gas costs

### Scenario 3.
Deadline-window denial: A victim must reveal within a finite commitDeadline to claim benefits (e.g., escrow release). An attacker repeatedly front-runs every new commit attempt with a revert-on-receive contract. Each reveal attempt reverts on refund failure until time runs out, causing the victim to miss the window.
#### Preconditions / Assumptions
- (a). Finite commitDeadline is enforced
- (b). Victim intends to reveal within the window
- (c). Victim broadcasts commits in public mempool
- (d). Attacker persistently front-runs each commit with a revert-on-receive contract and can afford repeated bonds/gas within the window

### 13. [High] Unbounded distribution loops in TokenBundleSplitterBase and related splitters cause payout DoS and potential permanent fund lock

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Distribution iterates over unbounded per-token arrays across up to 50 splits. Large bundles can exceed block gas limits, making collectAndDistribute unexecutable (escrow remains uncollected). Separately, anyone can collect escrow directly to the splitter; since splitters always re-collect before distributing and lack a distribute-only path, assets can then be permanently stuck in the splitter.

In TokenBundleSplitterBase.collectAndDistribute (and in ERC20Splitter/ERC1155Splitter), _collectAndDecode first calls the escrow contract’s collectEscrow, then distribution proceeds via _distributeAtomic, which loops over per-split arrays: ERC20 amounts (length equals the escrow’s erc20Tokens array), ERC721 indices, and ERC1155 amounts (length equals erc1155Tokens). While MAX_SPLITS=50 bounds recipients, there is no bound on the number of tokens in the escrow bundle, yielding O(numSplits × numTokensPerType) transfers. For sufficiently large bundles, the distribution always exceeds block gas limits, causing the transaction to revert; because collect occurs in the same transaction, the revert unwinds escrow release, leaving assets locked in the escrow until expiry (payout DoS). Separately, after a valid fulfillment and an oracle decision exist, any third party can call the escrow's collectEscrow directly, transferring assets to the splitter (the fulfillment recipient) and revoking the attestation. Subsequent calls to the splitter's collectAndDistribute (or its unsafe variant) always re-call collectEscrow, which now reverts due to revocation; there is no distribute-only function, so assets remain permanently stuck in the splitter.

#### Severity

**Impact Explanation:** [High] Permanent asset lock in the splitter (Scenario 2/3) constitutes direct, material loss of principal. Even without that, the payout path can be indefinitely unavailable for affected escrows (Scenario 1), a core-function DoS.

**Likelihood Explanation:** [High] Attackers (escrowers) can deliberately craft large bundles that are cheap to deposit and arbitrate but impossible to distribute within block gas, providing a rational incentive to deny payout and reclaim on expiry with no special constraints.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
An escrower creates a HookEscrowObligation with a very large token bundle (many ERC20/1155 tokens and some ERC721s) and obtains an oracle decision splitting across up to 50 recipients. A user calls collectAndDistribute; _collectAndDecode collects escrow, then _distributeAtomic attempts thousands of transfers and exceeds block gas, reverting the whole tx. Escrow remains uncollected; recipients and the fulfiller cannot be paid until expiry, at which point the escrower can reclaim.
#### Preconditions / Assumptions
- (a). Escrow uses HookEscrowObligation with a large token bundle (unbounded token-array lengths) and a nonzero expirationTime.
- (b). A valid fulfillment attestation exists with recipient set to the splitter (created via the splitter’s createFulfillment).
- (c). The oracle decision for (fulfillment, escrow) has been submitted and stored.
- (d). User calls the splitter’s collectAndDistribute.

### Scenario 2.
After a valid fulfillment and oracle decision are in place, a third party calls HookEscrowObligation.collectEscrow(escrow, fulfillment), transferring the escrowed assets to the splitter and revoking the attestation. Any later call to the splitter’s collectAndDistribute (or unsafe variant) re-calls collectEscrow and reverts due to revocation, with no distribute-only path available; assets are permanently stuck in the splitter.
#### Preconditions / Assumptions
- (a). A valid fulfillment attestation and stored oracle decision exist for (fulfillment, escrow).
- (b). Anyone can call the escrow contract’s collectEscrow (no access control) and it will release assets to the fulfillment recipient (the splitter) and revoke the attestation.
- (c). Splitter has no distribute-only function; both collectAndDistribute and unsafePartiallyCollectAndDistribute always re-call collectEscrow.

### Scenario 3.
The same premature-collect griefing pattern applies to ERC20Splitter and ERC1155Splitter: a third party collects the escrow to the splitter first; subsequent collectAndDistribute calls always attempt to re-collect and revert due to revocation, permanently stranding funds in the splitter.
#### Preconditions / Assumptions
- (a). A valid (fulfillment, escrow) pair and stored oracle decision exist for ERC20Splitter or ERC1155Splitter.
- (b). A third party calls the escrow’s collectEscrow to transfer assets to the splitter and revoke the attestation.
- (c). Splitter functions always re-collect before distributing; there is no distribute-only function.

#### Proposed fix

##### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 167 unchanged lines ...
         bytes32 decisionKey = keccak256(abi.encodePacked(fulfillment, escrow));
         splits = decisions[demandData.oracle][decisionKey];
+        // FIXME: Implement collectEscrowIfNeeded to support distribute-only path:
+        // - If escrowAttestation.revocationTime == 0, try collectEscrow in a try/catch.
+        // - If already revoked, skip collect and proceed (assets already in splitter).
+        // This prevents permanent lock after premature collect by third parties.
         token = escrowData.token;
         IERC20EscrowObligation(escrowContract).collectEscrow(escrow, fulfillment);
 ... 22 unchanged lines ...
```

##### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 155 unchanged lines ...
         DemandData memory demandData = abi.decode(escrowData.demand, (DemandData));
         splits = decisions[demandData.oracle][keccak256(abi.encodePacked(fulfillment, escrow))];
+        // FIXME: Avoid permanent lock if a third party prematurely collected the escrow.
+        // Implement collectEscrowIfNeeded:
+        // - If escrowAttestation.revocationTime == 0, attempt collectEscrow in a try/catch.
+        // - If already revoked, skip collect and proceed (funds must already be in this splitter).
+        // This creates a distribute-only path and prevents re-collect reverts (AttestationRevoked).
+        // Also consider adding a pull-claim model (or batched distribution with progress tracking)
+        // to avoid gas DoS from large bundles.
         ITokenBundleEscrowObligation(escrowContract).collectEscrow(escrow, fulfillment);
     }
 
     function _resolveSentinel(address recipient, bytes32 fulfillment) internal view returns (address) {
         if (recipient == EXECUTOR_SENTINEL) {
             recipient = fulfillers[fulfillment];
             if (recipient == address(0)) revert NoFulfillerRecorded(fulfillment);
         }
         return recipient;
     }
 
     function _distributeAtomic(BundleSplit memory split, EscrowObligationData memory escrowData, address recipient) internal {
         if (split.nativeAmount > 0) {
             (bool success, ) = payable(recipient).call{value: split.nativeAmount}("");
             if (!success) revert NativeTokenTransferFailed(recipient, split.nativeAmount);
         }
         for (uint256 i; i < split.erc20Amounts.length; ++i) {
+            // FIXME: This unbounded loop can exceed block gas when bundles are large and splits ~50.
+            // Recommended: replace push distribution with recipient pull-claims (preferred) or
+            // add batched distribution + operation-count guard to prevent accidental OOG for big jobs.
+            // Keep atomic path only for small bundles.
             if (split.erc20Amounts[i] > 0) {
                 bool success = IERC20(escrowData.erc20Tokens[i]).trySafeTransfer(recipient, split.erc20Amounts[i]);
 ... 58 unchanged lines ...
```

##### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 118 unchanged lines ...
         token = escrowData.token;
         tokenId = escrowData.tokenId;
+        // FIXME: Implement collectEscrowIfNeeded (skip collect if attestation already revoked,
+        // otherwise try/catch collect) to enable distribute-only path and prevent permanent
+        // lock if a third party collects escrow first. Consider pull-claim or batched
+        // distribution for large split sets to avoid gas DoS.
         IERC1155EscrowObligation(escrowContract).collectEscrow(escrow, fulfillment);
     }
 
     function _resolveSentinel(address recipient, bytes32 fulfillment) internal view returns (address) {
         if (recipient == EXECUTOR_SENTINEL) {
             recipient = fulfillers[fulfillment];
             if (recipient == address(0)) revert NoFulfillerRecorded(fulfillment);
         }
         return recipient;
     }
 
     function getSplits(address oracle, bytes32 fulfillment, bytes32 escrow) external view returns (Split[] memory) {
         return decisions[oracle][keccak256(abi.encodePacked(fulfillment, escrow))];
     }
 
     function decodeDemandData(bytes calldata data) external pure returns (DemandData memory) {
         return abi.decode(data, (DemandData));
     }
 }
```

#### Related findings

##### [Medium] Unbounded inner arrays and no batching in TokenBundleSplitterBase cause escrow payout DoS and fund freeze

###### Description

TokenBundleSplitterBase caps only the number of splits but not the sizes of the underlying token bundle or per-split inner arrays. Arbitration stores every inner element in storage, and distribution iterates over all elements in a single transaction. This creates a gas-exhaustion DoS that can prevent arbitration or payout, freezing funds until escrow expiry.

TokenBundleSplitterBase enforces MAX_SPLITS only on the outer splits array. It does not cap the number of ERC20/1155/721 items in the escrowed bundle nor the per-split inner arrays (erc20Amounts, erc1155Amounts, erc721Indices). In the validated TokenBundleSplitter, each split’s ERC20/1155 arrays must match the escrow’s token counts and all ERC721s must be assigned exactly once, forcing full-length inner arrays. During arbitrate(), _storeDecision() deep-copies every inner element into storage (one SSTORE per element), causing costs that scale with splits × tokens. During collectAndDistribute()/unsafePartiallyCollectAndDistribute(), the contract first calls the escrow’s collectEscrow() and then loops across all splits and token indices to transfer assets, again scaling with splits × tokens and without batching/pagination or resumable state. If gas limits are exceeded at either stage, arbitration cannot be recorded or settlement cannot complete, and because collection and distribution are coupled in a single transaction, any out-of-gas during distribution reverts the entire transaction. This can leave assets locked until expiry, with no in-contract workaround.

###### Severity

**Impact Explanation:** [High] Funds can be frozen until escrow expiry (e.g., >= 1 week) with no in-contract workaround because arbitration or settlement cannot be completed within gas limits.

**Likelihood Explanation:** [Low] Exploitation requires griefing: the attacker must lock their own assets in escrow for the duration (no direct profit) and often pay significant gas costs to create large bundles.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Oracle arbitration DoS: An attacker creates a large-bundle TokenBundleEscrowObligation (many ERC20/1155/721 items) with the validated TokenBundleSplitter as arbiter. The oracle attempts arbitrate() with up to 50 recipients and full-length inner arrays (required for validation). _storeDecision() writes every inner element to storage (O(splits × tokens)), exceeding per-tx gas. Arbitrate fails, hasDecision is never set, and collectEscrow cannot pass the arbiter check; funds remain locked until expiry.
#### Preconditions / Assumptions
- (a). Deployment uses TokenBundleEscrowObligation with the validated TokenBundleSplitter as arbiter
- (b). Escrow attestation demand encodes the intended oracle address
- (c). Attacker (buyer) can choose arbitrarily large ERC20/1155/721 arrays when creating the escrow
- (d). Oracle behaves correctly and attempts to submit a valid decision
- (e). Escrow expiry is set by the attacker to a long duration (e.g., >= 1 week) to maximize impact

### Scenario 2.
Settlement DoS after decision: The attacker creates a sufficiently large bundle that still allows the oracle to store the decision. When anyone calls collectAndDistribute(), the function loads all splits and escrow data, calls collectEscrow(), and then performs O(splits × (ERC20+ERC1155)) transfers plus ERC721 transfers. The transaction runs out of gas and reverts, undoing collection. No batching or resumable state exists, so settlement cannot complete; funds remain locked until expiry.
#### Preconditions / Assumptions
- (a). Same as Scenario 1 except the bundle is sized so arbitrate() barely succeeds
- (b). A caller (seller/oracle/operator) triggers collectAndDistribute() or its unsafe variant
- (c). Escrow expiry is long (e.g., >= 1 week) to maximize freeze duration

### Scenario 3.
ERC721-heavy DoS: The attacker escrows a large number of ERC721s. The oracle records a decision assigning each NFT exactly once (validated requirement), pushing hundreds of indices to storage. During distribution, the splitter must transfer each NFT in a single transaction following collectEscrow, exceeding gas limits and reverting. Funds remain locked until expiry.
#### Preconditions / Assumptions
- (a). Deployment uses TokenBundleEscrowObligation with the validated TokenBundleSplitter as arbiter
- (b). Attacker includes a large number of ERC721 tokens in the escrow
- (c). Oracle assigns each ERC721 exactly once across splits (validated requirement)
- (d). A caller attempts to collect and distribute in a single transaction
- (e). Escrow expiry is long (e.g., >= 1 week)

###### Proposed fix

####### TokenBundleEscrowObligation.sol

File: `contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/non-tierable/TokenBundleEscrowObligation.sol)

```diff
 ... 61 unchanged lines ...
     error NativeTokenTransferFailed(address to, uint256 amount);
 
+    uint256 public constant MAX_ERC20_TOKENS = 4;
+    uint256 public constant MAX_ERC1155_TOKENS = 4;
+    uint256 public constant MAX_ERC721_TOKENS = 16;
     // Events emitted during partial release phase - continue on error
     event NativeTokenTransferFailedOnRelease(address indexed to, uint256 amount);
 ... 28 unchanged lines ...
 
     function validateArrayLengths(ObligationData memory data) internal pure {
+        if (data.erc20Tokens.length > MAX_ERC20_TOKENS) revert ArrayLengthMismatch();
+        if (data.erc721Tokens.length > MAX_ERC721_TOKENS) revert ArrayLengthMismatch();
+        if (data.erc1155Tokens.length > MAX_ERC1155_TOKENS) revert ArrayLengthMismatch();
         if (data.erc20Tokens.length != data.erc20Amounts.length)
             revert ArrayLengthMismatch();
 ... 601 unchanged lines ...
```

### 14. [High] Unbounded iteration with asymmetric release costs in AllEscrowHook.onRelease causes denial-of-service on escrow collection after valid fulfillment

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

AllEscrowHook iterates over an unbounded list of sub-hooks on release. When composed with built-in hooks whose onRelease is much more expensive than onLock/onReturn (e.g., AttestationEscrowHook/2 which call EAS.attest), release can consistently exceed block gas, preventing fulfillers from collecting funds even after valid fulfillment, while the depositor can later reclaim via reclaimExpired.

HookEscrowObligation delegates escrow actions to an IEscrowHook, passing the same hookData on lock/release/return. AllEscrowHook composes multiple hooks and, on release, loops through HookData.hooks without bounds, calling each sub-hook’s onRelease. AttestationEscrowHook and AttestationEscrowHook2 have cheap onLock (set pending) and cheap onReturn (clear pending) but expensive onRelease (each calls EAS.attest), creating strong gas asymmetry. A malicious escrow creator can configure AllEscrowHook with many such attestation hooks (optionally plus one real-asset hook like ERC20EscrowHook), making onLock succeed but causing onRelease to exceed block gas. BaseEscrowObligation.collectEscrowRaw then reverts on release despite a valid fulfillment. Later, reclaimExpired triggers AllEscrowHook.onReturn, which is comparatively cheap and succeeds, returning funds to the depositor. There are no in-code limits on the number of sub-hooks or any batching/paging, so the release must complete in a single transaction.

#### Severity

**Impact Explanation:** [Medium] Denial-of-service of the core release-upon-fulfillment functionality for affected escrows; not a protocol-wide outage and not direct theft or permanent freezing of user principal.

**Likelihood Explanation:** [High] The attacker fully controls hook composition and can empirically tune the number of attestation-creating sub-hooks so onLock fits but onRelease exceeds block gas. Securing a counterparty engagement is ordinary for escrow use; attacker incentives are clear (recover deposit and avoid payment), and no rare external conditions are needed.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Many AttestationEscrowHook leaves + one ERC20EscrowHook: The attacker creates an escrow via HookEscrowObligation using AllEscrowHook with M AttestationEscrowHook entries and one ERC20EscrowHook. onLock sets M pending flags and pulls ERC20 once, fitting within block gas. After a valid fulfillment, collectEscrow reverts because AllEscrowHook.onRelease must call EAS.attest M times, exceeding block gas. Upon expiry, reclaimExpired calls onReturn, which clears the M pending flags and returns the ERC20 to the depositor, leaving the fulfiller unpaid.
#### Preconditions / Assumptions
- (a). Deployed HookEscrowObligation, AllEscrowHook, AttestationEscrowHook, ERC20EscrowHook
- (b). Canonical EAS and SchemaRegistry per scope
- (c). Standard-behavior ERC20 per scope
- (d). Attacker controls the escrow creation (hook and hookData) and sets expirationTime > 0
- (e). A counterparty (victim) accepts the escrow; arbiter attests fulfillment (attacker can select arbiter per scope)

### Scenario 2.
Many AttestationEscrowHook2 leaves + one ERC20EscrowHook: Same as above but using AttestationEscrowHook2, which creates a 'validation' attestation on release. onLock remains cheap (pending=true), onRelease is costly (EAS.attest per sub-hook), and onReturn is cheap (pending=false). Release fails due to gas, while expiry-based return succeeds, refunding the depositor.
#### Preconditions / Assumptions
- (a). Deployed HookEscrowObligation, AllEscrowHook, AttestationEscrowHook2, ERC20EscrowHook
- (b). Canonical EAS and SchemaRegistry per scope
- (c). Standard-behavior ERC20 per scope
- (d). Attacker controls the escrow creation (hook and hookData) and sets expirationTime > 0
- (e). A counterparty (victim) accepts the escrow; arbiter attests fulfillment (attacker can select arbiter per scope)

### Scenario 3.
Nested AllEscrowHook composition: A top-level AllEscrowHook contains several mid-level AllEscrowHooks, each with many AttestationEscrowHook leaves, plus one ERC20EscrowHook. onLock (pending flags + one ERC20 transfer) fits within block gas due to relatively cheap operations. collectEscrow fails because release triggers a very large number of EAS.attest calls through nested loops, exceeding block gas. reclaimExpired later succeeds due to cheap onReturn operations, and funds are returned to the depositor.
#### Preconditions / Assumptions
- (a). Deployed HookEscrowObligation, AllEscrowHook (nested instances), AttestationEscrowHook, ERC20EscrowHook
- (b). Canonical EAS and SchemaRegistry per scope
- (c). Standard-behavior ERC20 per scope
- (d). Attacker controls the escrow creation (nested hook structure) and sets expirationTime > 0
- (e). A counterparty (victim) accepts the escrow; arbiter attests fulfillment (attacker can select arbiter per scope)

#### Proposed fix

##### AllEscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AllEscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AllEscrowHook.sol)

```diff
 ... 36 unchanged lines ...
     error ArrayLengthMismatch();
     error ValueMismatch(uint256 expected, uint256 received);
+    uint256 internal constant MAX_SUBHOOKS = 32;
+    error TooManySubhooks(uint256 count, uint256 max);
+    error NestedAllEscrowHookNotAllowed();
 
     // ──────────────────────────────────────────────
 
     function onLock(
         bytes calldata data,
         address from,
         address escrow
     ) external payable override {
         HookData memory decoded = abi.decode(data, (HookData));
         _validateLengths(decoded);
 
         uint256 totalValue;
         for (uint256 i = 0; i < decoded.values.length; i++) {
             totalValue += decoded.values[i];
         }
         if (msg.value != totalValue) {
             revert ValueMismatch(totalValue, msg.value);
         }
 
         for (uint256 i = 0; i < decoded.hooks.length; i++) {
+            if (decoded.hooks[i] == address(this)) revert NestedAllEscrowHookNotAllowed();
             IEscrowHook(decoded.hooks[i]).onLock{value: decoded.values[i]}(
                 decoded.hookDatas[i],
                 from,
                 escrow
             );
         }
     }
 
     function onRelease(
         bytes calldata data,
         address to,
         address escrow
     ) external override {
         HookData memory decoded = abi.decode(data, (HookData));
         _validateLengths(decoded);
 
         for (uint256 i = 0; i < decoded.hooks.length; i++) {
+            if (decoded.hooks[i] == address(this)) revert NestedAllEscrowHookNotAllowed();
             IEscrowHook(decoded.hooks[i]).onRelease(
                 decoded.hookDatas[i],
                 to,
                 escrow
             );
         }
     }
 
     function onReturn(
         bytes calldata data,
         address to,
         address escrow
     ) external override {
         HookData memory decoded = abi.decode(data, (HookData));
         _validateLengths(decoded);
 
         for (uint256 i = 0; i < decoded.hooks.length; i++) {
+            if (decoded.hooks[i] == address(this)) revert NestedAllEscrowHookNotAllowed();
             IEscrowHook(decoded.hooks[i]).onReturn(
                 decoded.hookDatas[i],
                 to,
                 escrow
             );
         }
     }
 
     // ──────────────────────────────────────────────
 
     function _validateLengths(HookData memory decoded) internal pure {
         if (
             decoded.hooks.length != decoded.hookDatas.length ||
             decoded.hooks.length != decoded.values.length
         ) revert ArrayLengthMismatch();
+        if (decoded.hooks.length > MAX_SUBHOOKS) revert TooManySubhooks(decoded.hooks.length, MAX_SUBHOOKS);
     }
 
     // ──────────────────────────────────────────────
     // Encoding helpers
     // ──────────────────────────────────────────────
 
     function encodeHookData(
         HookData calldata hookData
     ) external pure returns (bytes memory) {
         return abi.encode(hookData);
     }
 
     function decodeHookData(
         bytes calldata data
     ) external pure returns (HookData memory) {
         return abi.decode(data, (HookData));
     }
 }
```

### 15. [Medium] Unconditional collectEscrow in splitters (NativeTokenSplitter, ERC20Splitter, ERC1155Splitter, TokenBundleSplitterBase) causes stranded funds after third‑party pre‑collection

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

The splitter distribution functions unconditionally invoke collectEscrow before payouts. Once an oracle decision exists, any third party can preemptively call collectEscrow on the escrow obligation, which revokes the escrow and transfers assets to the splitter. Subsequent splitter distribution calls re-invoke collectEscrow and revert due to the revoked attestation, permanently preventing distribution and stranding funds in the splitter.

All splitter variants (NativeTokenSplitter, ERC20Splitter, ERC1155Splitter, TokenBundleSplitterBase) call escrowContract.collectEscrow(escrow, fulfillment) inside their _collectAndDecode step before attempting any transfers. BaseEscrowObligation.collectEscrowRaw, upon successful arbiter approval, revokes the escrow attestation and releases assets to fulfillment.recipient (the splitter). Because collectEscrowRaw is permissionless aside from arbiter gating, once the oracle decision is posted, any third party can call collectEscrow first. This moves assets into the splitter and revokes the attestation. When the operator later calls collectAndDistribute or unsafePartiallyCollectAndDistribute, the splitter unconditionally re-calls collectEscrow, which now reverts (due to AttestationRevoked via ArbiterUtils._checkIntrinsic). The function reverts before reaching any payout loop, leaving the assets stuck in the splitter with no distribute-only fallback.

#### Severity

**Impact Explanation:** [High] Funds are frozen/blocked indefinitely because both distribution functions revert prior to payouts once the escrow is pre-collected and revoked; no distribute-only workaround exists.

**Likelihood Explanation:** [Low] Exploitation is pure griefing without direct profit, requiring monitoring/front-running to pre-collect before the operator; feasible but unprofitable and timing-based.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Asynchronous pre-collection: After the oracle decision is posted for a given escrow and fulfillment, an attacker calls collectEscrow directly on the escrow obligation, transferring ETH/tokens to the splitter and revoking the escrow. Later, the operator calls the splitter’s collectAndDistribute, which reverts on the unconditional collectEscrow call, permanently preventing payouts and stranding funds in the splitter.
#### Preconditions / Assumptions
- (a). Escrow created via a compatible escrow obligation (e.g., HookEscrowObligation) with revocable schema.
- (b). The escrow’s arbiter is the corresponding splitter contract (e.g., NativeTokenSplitter) so its checkObligation gating applies.
- (c). A fulfillment attestation exists with recipient set to the splitter (created via the splitter’s createFulfillment).
- (d). The oracle has posted a decision for (fulfillment, escrow), enabling arbiter approval.
- (e). An attacker can call collectEscrow before the operator calls the splitter’s distribution function.

### Scenario 2.
Front-run pre-collection: The operator broadcasts a collectAndDistribute transaction. An attacker front-runs with a collectEscrow call to the escrow obligation, moving assets into the splitter and revoking the escrow. The operator’s transaction then executes and reverts on the splitter’s collectEscrow call, leaving funds stranded.
#### Preconditions / Assumptions
- (a). Same as Scenario 1 preconditions.
- (b). Operator’s distribution transaction is visible in the mempool.
- (c). Attacker can front-run with collectEscrow.

### Scenario 3.
Repeated griefing across escrows: For multiple escrows, the attacker repeatedly pre-collects after each oracle decision, causing each subsequent splitter distribution to revert on the redundant collectEscrow. A growing pool of assets accumulates in the splitter without a distribute-only path, creating persistent DoS and accounting confusion across escrows.
#### Preconditions / Assumptions
- (a). Same as Scenario 1 preconditions, repeated across many escrows.
- (b). Attacker repeatedly pre-collects after each oracle decision and before each operator distribution.

#### Proposed fix

##### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 114 unchanged lines ...
         DemandData memory demandData = abi.decode(escrowData.demand, (DemandData));
         splits = decisions[demandData.oracle][keccak256(abi.encodePacked(fulfillment, escrow))];
-        INativeTokenEscrowObligation(escrowContract).collectEscrow(escrow, fulfillment);
+        // If escrow already collected/revoked by third party, proceed but ensure funds are present.
+        try INativeTokenEscrowObligation(escrowContract).collectEscrow(escrow, fulfillment) {
+        } catch {
+            if (escrowAttestation.revocationTime == 0) revert;
+            require(
+                address(this).balance >= escrowData.amount,
+                "Already collected; insufficient ETH"
+            );
+        }
     }
 
     function _resolveSentinel(address recipient, bytes32 fulfillment) internal view returns (address) {
         if (recipient == EXECUTOR_SENTINEL) {
             recipient = fulfillers[fulfillment];
             if (recipient == address(0)) revert NoFulfillerRecorded(fulfillment);
         }
         return recipient;
     }
 
     function getSplits(address oracle, bytes32 fulfillment, bytes32 escrow) external view returns (Split[] memory) {
         return decisions[oracle][keccak256(abi.encodePacked(fulfillment, escrow))];
     }
 
     function decodeDemandData(bytes calldata data) external pure returns (DemandData memory) {
         return abi.decode(data, (DemandData));
     }
 
     receive() external payable {}
 }
```

#### Related findings

##### [Medium] Missing hasDecision/splits validation in Splitter collect paths with non-splitter arbiter causes permanent fund lock in splitter

###### Description

Splitter contracts call collectEscrow before verifying a posted decision (hasDecision true) or non-empty splits; with a permissive arbiter not equal to the splitter, escrows can release assets to the splitter while splits are empty, leading to a no-op distribution and permanently stranded funds.

All Splitter variants (ERC20Splitter, NativeTokenSplitter, ERC1155Splitter, and TokenBundleSplitter via TokenBundleSplitterBase) invoke escrowContract.collectEscrow(escrow, fulfillment) without ensuring that an oracle decision exists or that splits are non-empty. BaseEscrowObligation uses the arbiter encoded in the escrow’s data (not enforced to be the splitter). If that arbiter is permissive, collectEscrow succeeds even with no decision in the splitter and transfers the escrowed assets to fulfillment.recipient (the splitter, when the fulfillment is created via the splitter). Since splits are empty, the distribution loop performs no transfers and does not revert. The escrow attestation is revoked, so recollection is impossible, and the splitters have no withdrawal/rescue mechanism, leaving funds permanently stranded inside the splitter.

###### Severity

**Impact Explanation:** [High] Funds are frozen in the splitter with no recovery mechanism once the escrow is revoked, blocking distribution indefinitely.

**Likelihood Explanation:** [Low] Exploitation requires escrows configured with a permissive arbiter not equal to the splitter and yields only griefing (no direct profit), conditions outside the attacker’s full control.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Non-tierable ERC20 escrow: Victim creates an ERC20 escrow with a permissive arbiter (not the splitter) and no posted decision; attacker creates a fulfillment via the splitter (recipient = splitter, refUID = escrow uid) and calls collectAndDistribute; the escrow releases ERC20 tokens to the splitter; splits are empty; distribution no-ops; tokens become permanently stuck in ERC20Splitter.
#### Preconditions / Assumptions
- (a). Escrow created in ERC20EscrowObligation (non-tierable) with arbiter address not equal to the splitter and permissive (e.g., always approves).
- (b). Escrow demand bytes decode to the splitter’s DemandData so decoding succeeds.
- (c). No decision exists in the splitter for the (fulfillment, escrow) pair at time of attack (splits are empty).
- (d). Attacker can call the splitter’s createFulfillment with refUID set to the escrow uid (to satisfy non-tierable refUID binding), making the splitter the fulfillment recipient.
- (e). Attacker can call the splitter’s collectAndDistribute before any decision is posted.

### Scenario 2.
Tierable ERC20 escrow: Victim creates a tierable ERC20 escrow with a permissive arbiter (not the splitter) and no posted decision; attacker creates any fulfillment via the splitter (recipient = splitter) and calls collectAndDistribute; the escrow releases tokens to the splitter; empty splits cause a no-op distribution; tokens remain permanently stuck.
#### Preconditions / Assumptions
- (a). Escrow created in ERC20EscrowObligation (tierable) with arbiter address not equal to the splitter and permissive (e.g., always approves).
- (b). Escrow demand bytes decode to the splitter’s DemandData so decoding succeeds.
- (c). No decision exists in the splitter for the (fulfillment, escrow) pair at time of attack (splits are empty).
- (d). Attacker can call the splitter’s createFulfillment (refUID arbitrary for tierable), making the splitter the fulfillment recipient.
- (e). Attacker can call the splitter’s collectAndDistribute before any decision is posted.

### Scenario 3.
Native token escrow: Victim escrows ETH with a permissive arbiter (not the splitter) and no posted decision; attacker creates a fulfillment via the splitter (recipient = splitter, refUID as needed) and calls collectAndDistribute; the escrow releases ETH to the splitter; empty splits cause no transfers; ETH remains permanently stuck in NativeTokenSplitter.
#### Preconditions / Assumptions
- (a). Escrow created in NativeTokenEscrowObligation with arbiter address not equal to the splitter and permissive (e.g., always approves).
- (b). Escrow demand bytes decode to the splitter’s DemandData so decoding succeeds.
- (c). No decision exists in the splitter for the (fulfillment, escrow) pair at time of attack (splits are empty).
- (d). Attacker can call the splitter’s createFulfillment with appropriate refUID (non-tierable) or arbitrary (tierable), making the splitter the fulfillment recipient.
- (e). Attacker can call the splitter’s collectAndDistribute before any decision is posted.

###### Proposed fix

####### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 168 unchanged lines ...
         splits = decisions[demandData.oracle][decisionKey];
         token = escrowData.token;
+        require(escrowData.arbiter == address(this), "Wrong arbiter");
+        require(hasDecision[demandData.oracle][decisionKey], "No decision");
         IERC20EscrowObligation(escrowContract).collectEscrow(escrow, fulfillment);
     }
 ... 21 unchanged lines ...
```

####### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 114 unchanged lines ...
         DemandData memory demandData = abi.decode(escrowData.demand, (DemandData));
         splits = decisions[demandData.oracle][keccak256(abi.encodePacked(fulfillment, escrow))];
+        require(escrowData.arbiter == address(this), "Wrong arbiter");
+        require(hasDecision[demandData.oracle][keccak256(abi.encodePacked(fulfillment, escrow))], "No decision");
         INativeTokenEscrowObligation(escrowContract).collectEscrow(escrow, fulfillment);
     }
 ... 19 unchanged lines ...
```

####### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 118 unchanged lines ...
         token = escrowData.token;
         tokenId = escrowData.tokenId;
+        require(escrowData.arbiter == address(this), "Wrong arbiter");
+        require(hasDecision[demandData.oracle][keccak256(abi.encodePacked(fulfillment, escrow))], "No decision");
         IERC1155EscrowObligation(escrowContract).collectEscrow(escrow, fulfillment);
     }
 
     function _resolveSentinel(address recipient, bytes32 fulfillment) internal view returns (address) {
         if (recipient == EXECUTOR_SENTINEL) {
             recipient = fulfillers[fulfillment];
             if (recipient == address(0)) revert NoFulfillerRecorded(fulfillment);
         }
         return recipient;
     }
 
     function getSplits(address oracle, bytes32 fulfillment, bytes32 escrow) external view returns (Split[] memory) {
         return decisions[oracle][keccak256(abi.encodePacked(fulfillment, escrow))];
     }
 
     function decodeDemandData(bytes calldata data) external pure returns (DemandData memory) {
         return abi.decode(data, (DemandData));
     }
 }
```

####### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 155 unchanged lines ...
         DemandData memory demandData = abi.decode(escrowData.demand, (DemandData));
         splits = decisions[demandData.oracle][keccak256(abi.encodePacked(fulfillment, escrow))];
+        require(escrowData.arbiter == address(this), "Wrong arbiter");
+        require(hasDecision[demandData.oracle][keccak256(abi.encodePacked(fulfillment, escrow))], "No decision");
         ITokenBundleEscrowObligation(escrowContract).collectEscrow(escrow, fulfillment);
     }
 ... 75 unchanged lines ...
```

### 16. [Medium] Incorrect post-transfer recipient balance check in ERC1155EscrowHook causes release/return DoS and potential escrow freeze

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

ERC1155EscrowHook requires the recipient’s balance to increase by exactly the transferred amount immediately after safeTransferFrom returns. Under standard ERC-1155 semantics, recipients can move tokens during onERC1155Received before the call returns, causing false reverts and blocking releases/returns to such receivers. This creates a liveness/compatibility failure and can freeze funds on reclaim when the attestation recipient is an active receiver.

In ERC1155EscrowHook._transferOut, after calling IERC1155(token).safeTransferFrom(address(this), to, tokenId, amount, ""), the hook checks that the recipient’s balance is at least balanceBefore + amount and reverts otherwise. OpenZeppelin ERC1155 updates balances and then calls the recipient’s onERC1155Received before returning from safeTransferFrom, allowing the recipient to forward or move tokens immediately. This makes the post-transfer recipient-balance check incorrect: valid transfers can fail if the recipient moves the tokens during its callback. The revert unwinds all state, so funds are not lost, but releases/returns to such recipients are blocked. In bundled escrows using AllEscrowHook, one failing ERC-1155 sub-hook reverts the entire bundle release. On expiry reclaim, if the escrow attestation’s recipient is an active ERC-1155 receiver, reclaim repeatedly reverts with no per-escrow workaround, effectively freezing funds.

#### Severity

**Impact Explanation:** [High] Funds for a specific escrow can be frozen with no per-escrow workaround if the attestation recipient is an active ERC-1155 receiver that moves tokens during onERC1155Received, satisfying the ‘funds frozen’ high-impact criterion.

**Likelihood Explanation:** [Low] Freezing requires that the escrow attestation’s recipient be an active ERC-1155 receiver at creation time; while plausible, this is less common than using EOAs or passive receivers.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Release to an active ERC-1155 receiver reverts: HookEscrowObligation releases via ERC1155EscrowHook to a recipient contract that forwards tokens in onERC1155Received; the hook’s recipient-balance check fails and reverts, blocking fulfillment.
#### Preconditions / Assumptions
- (a). Standard ERC-1155 token implementation (e.g., OpenZeppelin) that updates balances then calls onERC1155Received before returning
- (b). HookEscrowObligation using ERC1155EscrowHook with deposited ERC-1155 tokens
- (c). Fulfillment recipient is a contract that forwards/moves received ERC-1155 tokens in onERC1155Received

### Scenario 2.
Bundled escrow (AllEscrowHook) fully blocked: A multi-asset escrow includes an ERC-1155 component; on release, the ERC-1155 sub-hook reverts due to the same check, reverting the entire bundle release atomically.
#### Preconditions / Assumptions
- (a). AllEscrowHook composes multiple hooks including ERC1155EscrowHook
- (b). Standard ERC-1155 token implementation (e.g., OpenZeppelin)
- (c). Fulfillment recipient is an active ERC-1155 receiver that moves tokens in onERC1155Received

### Scenario 3.
Expiry reclaim freeze: On reclaimExpired, ERC1155EscrowHook returns tokens to the escrow attestation’s recipient; if that recipient is an active ERC-1155 receiver, the post-transfer check reverts every time, freezing funds with no per-escrow workaround.
#### Preconditions / Assumptions
- (a). Escrow attestation has expiration and has expired
- (b). Standard ERC-1155 token implementation (e.g., OpenZeppelin)
- (c). Escrow attestation’s recipient is a contract that moves ERC-1155 tokens in onERC1155Received during return

#### Proposed fix

##### ERC1155EscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/ERC1155EscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/ERC1155EscrowHook.sol)

```diff
 ... 157 unchanged lines ...
         );
 
-        if (balanceAfter < balanceBefore + decoded.amount) {
+        if (balanceAfter < balanceBefore + decoded.amount && false) {
             revert ERC1155TransferFailed(
                 decoded.token,
 ... 24 unchanged lines ...
```

### 17. [Medium] Missing clearing of nested arrays in TokenBundleSplitterBase._storeDecision causes decision corruption and DoS of distribution

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Overwriting a stored decision deletes only the outer array but not the nested dynamic arrays (erc20Amounts, erc721Indices, erc1155Amounts). Subsequent writes append to stale data, causing stored splits to diverge from validated calldata and making collectAndDistribute revert for that (fulfillment, escrow) key. Workaround is to create a new fulfillment and re-arbitrate.

TokenBundleSplitterBase._storeDecision() performs `delete decisions[oracle][decisionKey]` (resetting only the outer dynamic array length) and then pushes new BundleSplit entries. Because nested dynamic arrays inside each BundleSplit (erc20Amounts, erc721Indices, erc1155Amounts) are not explicitly cleared, their storage head/length persists at the reused element index. Pushing new values appends on top of stale lengths. During distribution, the splitter reads the corrupted splits and iterates according to the inflated nested array lengths. For ERC20/1155, it indexes `escrowData.erc20Tokens[i]` / `escrowData.erc1155Tokens[i]` up to the extended length, causing out-of-bounds reverts. For ERC721, duplicate indices can trigger a revert in the atomic path. In both atomic and unsafe-partial distribution, these failures revert the entire call, which also undoes `collectEscrow` in the same transaction, preventing token loss but causing a persistent DoS for that (fulfillment, escrow) decisionKey. Both TokenBundleSplitter and TokenBundleSplitterUnvalidated are affected as they share _storeDecision(). A practical workaround is to create a new fulfillment (new decisionKey) and arbitrate once for that key.

#### Severity

**Impact Explanation:** [Medium] Causes significant but temporary availability loss (DoS) of distribution for a specific (fulfillment, escrow) decisionKey. No loss of principal occurs due to revert atomicity; a practical workaround exists by using a new fulfillment and re-arbitrating.

**Likelihood Explanation:** [Medium] Re-arbitration for the same key is an uncommon but realistic operational flow; it does not require exceptional states or user mistakes. Griefing-based escalation (repeated overwrites) is lower likelihood but not required for the primary DoS.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Scenario 1 (ERC20 DoS after re-arbitration): An escrow E contains exactly one ERC20. Oracle O first arbitrates for (F, E) with valid splitsA; then re-arbitrates for the same (F, E) with valid splitsB. _storeDecision appends onto stale erc20Amounts, making its stored length 2. A user calls collectAndDistribute; after collectEscrow, distribution loops to i=1 and reads escrowData.erc20Tokens[1], which is out-of-bounds, reverting the transaction. Assets remain in escrow; (F, E) is bricked until a new fulfillment is used.
#### Preconditions / Assumptions
- (a). Escrow obligation compatible with the splitter such that collectEscrow transfers assets to the splitter (fulfillment recipient).
- (b). Escrow E has erc20Tokens.length == 1 and a positive erc20Amounts[0].
- (c). DemandData.oracle in the escrow demand equals O (designated oracle).
- (d). Oracle O performs at least two arbitrations for the same (fulfillment F, escrow E) decisionKey.
- (e). A user calls collectAndDistribute or unsafePartiallyCollectAndDistribute for (F, E).

### Scenario 2.
Scenario 2 (ERC721-only duplicate index, atomic revert): An escrow E has only one ERC721 (index 0). Oracle O arbitrates for (F, E) assigning index [0], then re-arbitrates assigning index [0] again. The stored erc721Indices becomes [0, 0]. During collectAndDistribute (atomic path), the first transfer succeeds, the second attempts to transfer the same token again and reverts, undoing the whole transaction. In unsafe-partial mode with purely ERC721, the second transfer failure emits an event but continues, allowing distribution to complete.
#### Preconditions / Assumptions
- (a). Escrow obligation compatible with the splitter such that collectEscrow transfers assets to the splitter.
- (b). Escrow E contains only one ERC721 (erc721Tokens.length == 1).
- (c). DemandData.oracle equals O (designated oracle).
- (d). Oracle O arbitrates twice for the same (F, E) decisionKey, assigning index 0 both times.
- (e). A user calls collectAndDistribute (atomic) or unsafePartiallyCollectAndDistribute (partial) for (F, E).

### Scenario 3.
Scenario 3 (Griefing via repeated overwrites inflating lengths): Oracle O repeatedly overwrites the decision for the same (F, E), causing nested ERC20/1155 arrays to grow each time. Subsequent collectAndDistribute attempts either revert early due to out-of-bounds indexing or risk out-of-gas due to excessive loop sizes. Funds remain in escrow on revert; the key is effectively DoS’d until a new fulfillment is used.
#### Preconditions / Assumptions
- (a). Escrow obligation compatible with the splitter such that collectEscrow transfers assets to the splitter.
- (b). Escrow E includes at least one ERC20 and/or ERC1155 entry.
- (c). DemandData.oracle equals O (designated oracle).
- (d). Oracle O repeatedly overwrites the decision for the same (F, E) decisionKey.
- (e). A user calls collectAndDistribute or unsafePartiallyCollectAndDistribute for (F, E).

#### Proposed fix

##### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 93 unchanged lines ...
             stored.recipient = splits[i].recipient;
             stored.nativeAmount = splits[i].nativeAmount;
+            // Clear nested arrays to avoid appending onto stale storage from prior decisions
+            delete stored.erc20Amounts;
+            delete stored.erc721Indices;
+            delete stored.erc1155Amounts;
             for (uint256 j; j < splits[i].erc20Amounts.length; ++j) stored.erc20Amounts.push(splits[i].erc20Amounts[j]);
             for (uint256 j; j < splits[i].erc721Indices.length; ++j) stored.erc721Indices.push(splits[i].erc721Indices[j]);
 ... 137 unchanged lines ...
```

#### Related findings

##### [Low] Unchecked split array bounds in TokenBundleSplitterBase distribution cause distribution DoS

###### Description

TokenBundleSplitterBase uses oracle-provided split array lengths and ERC721 indices without bounds checks during distribution. In the unvalidated variant, malformed splits can trigger out-of-bounds panics before external token calls, causing both atomic and 'unsafe' distribution paths to revert and blocking distribution until the oracle resubmits valid splits.

TokenBundleSplitterBase._distributeAtomic() and _distributePartial() iterate using untrusted lengths and indices from stored splits to index escrowData arrays: for ERC20/1155, loops use split.erc20Amounts.length / split.erc1155Amounts.length to index escrowData.erc20Tokens[i] / escrowData.erc1155Tokens[i]; for ERC721, split.erc721Indices[i] is used directly to index escrowData.erc721Tokens[idx] / escrowData.erc721TokenIds[idx]. If any index is out of bounds, a local array out-of-bounds panic occurs before the external token transfer is attempted. Solidity try/catch cannot catch this, as it only handles external call reverts. TokenBundleSplitterUnvalidated stores arbitrary splits without validating lengths or ERC721 index ranges, making this reachable. Consequently, collectAndDistribute and unsafePartiallyCollectAndDistribute both fully revert on such splits, resulting in a liveness DoS of distribution until the oracle posts corrected splits. Due to EVM revert semantics, any collectEscrow call in the same transaction is rolled back on revert, so no mid-call fund stranding occurs from this issue. The validated splitter (TokenBundleSplitter) prevents this by enforcing array lengths and ERC721 index validity at arbitrate time.

###### Severity

**Impact Explanation:** [Medium] Malformed splits cause a significant availability loss: both atomic and 'unsafe' distribution paths fully revert, blocking the splitter’s core distribution function until the oracle resubmits valid splits. No principal loss occurs and mid-call effects are reverted.

**Likelihood Explanation:** [Low] Exploitation requires the designated oracle (an external integration) to behave maliciously or incorrectly by posting malformed splits; this is a privileged, unprofitable griefing action.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Adversarial oracle posts a split with an ERC721 index >= escrowData.erc721Tokens.length; calling collectAndDistribute or unsafePartiallyCollectAndDistribute triggers an out-of-bounds read before the ERC721 transfer call, causing a full revert and blocking distribution until corrected.
#### Preconditions / Assumptions
- (a). An escrow using a TokenBundle-style obligation exists with N ERC721 items encoded in escrowData
- (b). The escrow’s demand designates an oracle address recognized by the splitter
- (c). TokenBundleSplitterUnvalidated is used as the oracle/splitter for this escrow
- (d). The oracle stores a decision containing an ERC721 index >= N
- (e). A user calls collectAndDistribute or unsafePartiallyCollectAndDistribute on the splitter

### Scenario 2.
Adversarial oracle posts a split with erc20Amounts or erc1155Amounts longer than the escrow’s token arrays and with positive amounts in out-of-range positions; distribution attempts revert due to out-of-bounds reads before external token transfers, blocking distribution until corrected.
#### Preconditions / Assumptions
- (a). An escrow using a TokenBundle-style obligation exists with M ERC20 tokens and/or K ERC1155 tokens encoded in escrowData
- (b). The escrow’s demand designates an oracle address recognized by the splitter
- (c). TokenBundleSplitterUnvalidated is used as the oracle/splitter for this escrow
- (d). The oracle stores a decision where erc20Amounts.length > M and/or erc1155Amounts.length > K with at least one positive out-of-range amount
- (e). A user calls collectAndDistribute or unsafePartiallyCollectAndDistribute on the splitter

### Scenario 3.
Caller uses unsafePartiallyCollectAndDistribute expecting best-effort distribution, but malformed split indices/lengths still trigger out-of-bounds panics before external calls, causing a full revert and providing no partial progress.
#### Preconditions / Assumptions
- (a). Same preconditions as above (malformed ERC721 indices or overlong ERC20/1155 arrays with positive out-of-range entries stored via TokenBundleSplitterUnvalidated)
- (b). A user specifically calls unsafePartiallyCollectAndDistribute on the splitter expecting best-effort execution

###### Proposed fix

####### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 171 unchanged lines ...
             if (!success) revert NativeTokenTransferFailed(recipient, split.nativeAmount);
         }
+        require(split.erc20Amounts.length <= escrowData.erc20Tokens.length);
         for (uint256 i; i < split.erc20Amounts.length; ++i) {
             if (split.erc20Amounts[i] > 0) {
                 bool success = IERC20(escrowData.erc20Tokens[i]).trySafeTransfer(recipient, split.erc20Amounts[i]);
                 if (!success) revert ERC20TransferFailed(escrowData.erc20Tokens[i], recipient, split.erc20Amounts[i]);
             }
         }
         for (uint256 i; i < split.erc721Indices.length; ++i) {
             uint256 idx = split.erc721Indices[i];
+            require(idx < escrowData.erc721Tokens.length);
             try IERC721(escrowData.erc721Tokens[idx]).safeTransferFrom(address(this), recipient, escrowData.erc721TokenIds[idx]) {} catch {
                 revert ERC721TransferFailed(escrowData.erc721Tokens[idx], recipient, escrowData.erc721TokenIds[idx]);
             }
         }
+        require(split.erc1155Amounts.length <= escrowData.erc1155Tokens.length);
         for (uint256 i; i < split.erc1155Amounts.length; ++i) {
             if (split.erc1155Amounts[i] > 0) {
                 try IERC1155(escrowData.erc1155Tokens[i]).safeTransferFrom(address(this), recipient, escrowData.erc1155TokenIds[i], split.erc1155Amounts[i], "") {} catch {
                     revert ERC1155TransferFailed(escrowData.erc1155Tokens[i], recipient, escrowData.erc1155TokenIds[i], split.erc1155Amounts[i]);
                 }
             }
         }
     }
 
     function _distributePartial(BundleSplit memory split, EscrowObligationData memory escrowData, address recipient) internal {
         if (split.nativeAmount > 0) {
             (bool success, ) = payable(recipient).call{value: split.nativeAmount}("");
             if (!success) emit NativeTransferFailedOnDistribute(recipient, split.nativeAmount);
         }
-        for (uint256 i; i < split.erc20Amounts.length; ++i) {
+        for (uint256 i; i < split.erc20Amounts.length && i < escrowData.erc20Tokens.length; ++i) {
             if (split.erc20Amounts[i] > 0) {
                 bool success = IERC20(escrowData.erc20Tokens[i]).trySafeTransfer(recipient, split.erc20Amounts[i]);
                 if (!success) emit ERC20TransferFailedOnDistribute(recipient, escrowData.erc20Tokens[i], split.erc20Amounts[i]);
             }
         }
         for (uint256 i; i < split.erc721Indices.length; ++i) {
             uint256 idx = split.erc721Indices[i];
+            if (idx >= escrowData.erc721Tokens.length) continue;
             try IERC721(escrowData.erc721Tokens[idx]).safeTransferFrom(address(this), recipient, escrowData.erc721TokenIds[idx]) {} catch {
                 emit ERC721TransferFailedOnDistribute(recipient, escrowData.erc721Tokens[idx], escrowData.erc721TokenIds[idx]);
             }
         }
-        for (uint256 i; i < split.erc1155Amounts.length; ++i) {
+        for (uint256 i; i < split.erc1155Amounts.length && i < escrowData.erc1155Tokens.length; ++i) {
             if (split.erc1155Amounts[i] > 0) {
                 try IERC1155(escrowData.erc1155Tokens[i]).safeTransferFrom(address(this), recipient, escrowData.erc1155TokenIds[i], split.erc1155Amounts[i], "") {} catch {
 ... 20 unchanged lines ...
```

##### [Medium] Skipped ERC721 validation for zero-ERC721 escrows in TokenBundleSplitter causes permanent fund stranding

###### Description

TokenBundleSplitter’s _validateSplits() skips ERC721 checks when the escrow has zero ERC721s, allowing non-empty erc721Indices to be accepted as a “validated” decision. This sets hasDecision=true, so checkObligation() passes. Later, distribution in TokenBundleSplitterBase indexes zero-length ERC721 arrays and panics. The combined collect+distribute flow reverts (DoS). If collectEscrow is called directly on the escrow contract first, assets are sent to the splitter and then become permanently stranded because recollection fails and there is no distribute-only path.

In TokenBundleSplitter._validateSplits(), ERC721 validation (bounds checking and exactly-once assignment) is performed only if escrowData.erc721Tokens.length > 0. When it is zero, the function does not require that all BundleSplit.erc721Indices arrays are empty, so an oracle can submit non-empty indices for a zero-ERC721 escrow and the decision will be stored by _storeDecision() unchanged. TokenBundleSplitterBase.checkObligation() returns true solely based on hasDecision[...] for the (fulfillment, escrow) pair, without inspecting ERC721 structure. During distribution (_distributeAtomic/_distributePartial), the code iterates split.erc721Indices and indexes escrowData.erc721Tokens[idx] and escrowData.erc721TokenIds[idx]. With zero-length arrays, any idx access reverts with an out-of-bounds panic before the external IERC721 call and outside try/catch, causing the entire transaction to revert. In the combined collectAndDistribute/unsafePartiallyCollectAndDistribute path, this produces a DoS (the inner collectEscrow is reverted atomically). If someone calls collectEscrow directly on the escrow contract before distribution, the escrow attestation is revoked and assets are transferred to the splitter (fulfillment.recipient). Subsequent distribution attempts from the splitter always fail because they try to recollect (now impossible) and there is no distribute-only function; even if bypassed, ERC721 indexing would still panic. This results in permanent fund stranding in the splitter.

###### Severity

**Impact Explanation:** [High] Funds can be permanently frozen/blocked in the splitter with no workaround once a direct collect moves assets there under an invalid but accepted decision, meeting the definition of high impact. The combined collect+distribute flow can also be completely unusable for the affected escrow until corrected.

**Likelihood Explanation:** [Low] Exploitation depends on an oracle/operator submitting malformed ERC721 indices for a zero-ERC721 escrow. With competent operators this is uncommon. While direct collect is trivial once the bad decision exists, the main gating factor remains the oracle/operator error.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Permanent stranding via direct collect (non-tierable): An escrow with zero ERC721s uses TokenBundleSplitter as arbiter. The oracle submits a decision with non-empty erc721Indices that passes validation due to the zero-ERC721 gap. A third party calls collectEscrow on the escrow contract; checkObligation() returns true (hasDecision), escrow is revoked, and funds are sent to the splitter. Any subsequent collectAndDistribute/unsafePartiallyCollectAndDistribute from the splitter reverts (recollection fails), and there is no distribute-only function; funds remain stuck indefinitely.
#### Preconditions / Assumptions
- (a). Escrow created with zero ERC721s (erc721Tokens.length == 0, erc721TokenIds.length == 0).
- (b). Arbiter in the escrow is the TokenBundleSplitter contract.
- (c). A valid fulfillment attestation exists referencing the escrow (non-tierable).
- (d). The oracle recorded a decision for (fulfillment, escrow) with at least one non-empty erc721Indices entry despite zero ERC721s, which was accepted by _validateSplits().
- (e). A third party (or any user) calls collectEscrow on the escrow contract before distribution via the splitter.

### Scenario 2.
Permanent stranding via direct collect (tierable): Same as above but with the tierable TokenBundleEscrowObligation. The refUID match is not required, making direct collect even simpler once a bad decision exists. Assets are sent to the splitter and become stranded for the same reasons (recollection fails; ERC721 indexing panic if bypassed).
#### Preconditions / Assumptions
- (a). Escrow created with zero ERC721s (erc721Tokens.length == 0, erc721TokenIds.length == 0).
- (b). Arbiter in the escrow is the TokenBundleSplitter contract (tierable variant).
- (c). A fulfillment attestation exists (tierable does not require refUID == escrow.uid).
- (d). The oracle recorded a decision for (fulfillment, escrow) with at least one non-empty erc721Indices entry despite zero ERC721s, which was accepted by _validateSplits().
- (e). Any caller invokes collectEscrow on the tierable escrow contract.

### Scenario 3.
DoS of combined collect-and-distribute (non-tierable): With a bad decision accepted (non-empty erc721Indices; zero ERC721s), a user calls collectAndDistribute. The escrow is collected first, then distribution attempts to index zero-length ERC721 arrays and panics, reverting the entire transaction (including the collect). This blocks settlement until the oracle posts a corrected decision.
#### Preconditions / Assumptions
- (a). Escrow created with zero ERC721s (erc721Tokens.length == 0, erc721TokenIds.length == 0).
- (b). Arbiter in the escrow is the TokenBundleSplitter contract.
- (c). A valid fulfillment attestation exists referencing the escrow (non-tierable).
- (d). The oracle recorded a decision for (fulfillment, escrow) with at least one non-empty erc721Indices entry despite zero ERC721s, which was accepted by _validateSplits().
- (e). A user calls TokenBundleSplitter.collectAndDistribute or unsafePartiallyCollectAndDistribute.

###### Proposed fix

####### TokenBundleSplitter.sol

File: `contracts/src/utils/splitters/TokenBundleSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitter.sol)

```diff
 ... 32 unchanged lines ...
     error DuplicateERC721Assignment(uint256 tokenIndex);
     error MissingERC721Assignment(uint256 tokenIndex);
+    error UnexpectedERC721Assignment(uint256 splitIndex);
     error InvalidERC721Index(uint256 index, uint256 max);
 
 ... 84 unchanged lines ...
                 if (!assigned[t]) revert MissingERC721Assignment(t);
             }
+        } else {
+            // When there are no ERC721s in the escrow, all splits must have empty ERC721 indices.
+            for (uint256 s; s < numSplits; ++s) {
+                if (splits[s].erc721Indices.length != 0) revert UnexpectedERC721Assignment(s);
+            }
         }
 
 ... 24 unchanged lines ...
```

### 18. [Medium] Missing per-commit bond accounting in CommitRevealObligation causes over-/under-refunds and ETH loss

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

CommitRevealObligation refunds/slashes the current global bondAmount instead of the amount deposited at commit time, enabling profit from timing commits before a bond increase and causing under-refunds after decreases, which can drain pooled ETH and lead to refund/attestation failures.

In CommitRevealObligation, commit() enforces msg.value == bondAmount at commit time but does not store the deposited amount per commitment. Later, both _afterAttest (refund on reveal) and slashBond (slashing) pay out the current, mutable bondAmount, not the commit-time amount. The owner can change bondAmount at any time, and the contract lacks on-chain fencing (pause/epoching), while commit() is always callable. This mismatch allows attackers to commit just before a bond increase (e.g., via same-block ordering) and then reveal to receive more ETH than deposited. Conversely, honest users can be under-refunded if a decrease occurs before they reveal. Surplus or later deposits can then be siphoned by attackers, and once the contract balance is insufficient, honest reveals revert, causing operational DoS.

#### Severity

**Impact Explanation:** [High] Direct, material loss of principal ETH due to over-/under-refunds and potential denial-of-service when refunds fail and attestations revert.

**Likelihood Explanation:** [Low] Exploitation requires timing around infrequent admin bondAmount updates, favorable transaction ordering (often same-block), and sufficient contract liquidity; a diligent owner can reduce but not eliminate these windows.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Draining surplus after a prior bond decrease followed by an increase: The owner previously decreased bondAmount from X to Y while outstanding commitments existed; honest users revealed after the decrease and were under-refunded, leaving surplus in the contract. Later, when the owner increases bondAmount from Y to Z, an attacker front-runs with a commit at Y just before the increase and then reveals after, receiving Z per refund. The difference (Z - Y) is extracted from the pooled surplus, potentially leading to insufficient balance for subsequent honest refunds and causing refund/attestation failures.
#### Preconditions / Assumptions
- (a). The owner previously decreased bondAmount from X to Y while outstanding commitments existed; at least one honest reveal after the decrease created surplus (under-refund).
- (b). Later, the owner increases bondAmount from Y to Z.
- (c). The attacker observes setBondAmount(Z) in the mempool and succeeds in getting a commit with msg.value = Y included before the increase (e.g., same-block ordering).
- (d). The attacker reveals in a later block and within commitDeadline to satisfy anti-front-run and timing checks.
- (e). The contract has sufficient ETH at reveal time from earlier surplus or ongoing deposits to pay Z.

### Scenario 2.
Over-refund extraction funded by later depositors after a bond increase: The owner increases bondAmount from X to Y. An attacker places a commit with msg.value = X immediately before the increase (same-block ordering), then waits for honest users to commit at Y, adding liquidity. The attacker reveals later and is refunded Y, profiting (Y - X), funded by later depositors. If this depletes contract balance, honest reveals may revert, disrupting escrow fulfillment.
#### Preconditions / Assumptions
- (a). The owner increases bondAmount from X to Y.
- (b). The attacker gets a commit with msg.value = X included before the bond increase (e.g., same-block ordering or just-before inclusion).
- (c). Honest users later commit at Y, providing sufficient liquidity to the contract.
- (d). The attacker reveals in a later block and within commitDeadline to satisfy checks.

### Scenario 3.
Honest-user under-refund after a bond decrease (no attacker required): The owner decreases bondAmount from X to Y while at least one commitment is outstanding (or a same-block straggler occurs). An honest user who committed at X later reveals and is refunded only Y, losing (X - Y). This loss occurs solely due to the contract’s accounting mismatch and timing of the update.
#### Preconditions / Assumptions
- (a). The owner decreases bondAmount from X to Y while at least one commitment is outstanding or a same-block pre-update commit is included.
- (b). An honest user who committed at X reveals after the decrease and within commitDeadline.
- (c). No attacker action is required for the under-refund to occur.

#### Proposed fix

##### CommitRevealObligation.sol

File: `contracts/src/obligations/CommitRevealObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/CommitRevealObligation.sol)

```diff
 ... 36 unchanged lines ...
         uint64 commitTimestamp;
         address committer;
+        uint256 bondAtCommit;
     }
 
 ... 126 unchanged lines ...
 
         // Atomically reclaim bond
-        uint256 amount = bondAmount;
+        uint256 amount = info.bondAtCommit;
         commitmentClaimed[revealedCommitment] = true;
 
 ... 22 unchanged lines ...
             commitBlock: uint64(block.number),
             commitTimestamp: uint64(block.timestamp),
-            committer: msg.sender
+            committer: msg.sender,
+            bondAtCommit: msg.value
         });
 
 ... 60 unchanged lines ...
         if (commitmentClaimed[commitment]) revert BondAlreadyClaimed(commitment);
 
-        amount = bondAmount;
+        amount = info.bondAtCommit;
         commitmentClaimed[commitment] = true;
 
 ... 19 unchanged lines ...
```

### 19. [Medium] Payer misdirection during createFulfillment in NativeTokenSplitter causes stranded user ETH refunds

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

NativeTokenSplitter forwards msg.value to arbitrary obligations while making the splitter the payer (msg.sender). Obligations that refund native ETH to the payer send it to the splitter instead of the user. The splitter accepts ETH but has no accounting or withdrawal; later distributions only pay exact split totals, leaving refunds stranded. TokenBundleSplitterBase shares the same risk, and the unvalidated variant can enable draining of stranded ETH via over-allocation.

In NativeTokenSplitter.createFulfillment, the contract forwards msg.value to an arbitrary obligation via doObligationRaw, making the splitter the payer (msg.sender) in BaseObligation hooks. If the obligation returns native ETH to the payer (e.g., rebate, change refund), that ETH is sent to the splitter. NativeTokenSplitter has a payable receive() and no mechanism to refund or withdraw unsolicited inbound ETH, and collectAndDistribute only sends the exact escrow-specified split totals, so any returned ETH remains stranded. TokenBundleSplitterBase exhibits the same behavior. In TokenBundleSplitterUnvalidated, an adversarial oracle can over-allocate native splits to drain previously stranded ETH since totals are not validated.

#### Severity

**Impact Explanation:** [High] Direct, material loss of principal ETH owed to users (rebates/change refunds) is misdirected to the splitter and becomes unrecoverable via the contract interface; in the unvalidated bundle case, previously stranded funds can be drained to arbitrary recipients.

**Likelihood Explanation:** [Low] Exploitation depends on integrator choices: using NativeTokenSplitter.createFulfillment with a fulfillment obligation that sends native ETH to the payer, and (for draining) using the unvalidated bundle splitter and having prior stranded ETH. These are notable constraints outside an attacker’s full control.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
A fulfillment obligation is designed to rebate a small native-ETH bonus to the payer in its hooks. A user creates the fulfillment via NativeTokenSplitter.createFulfillment. The obligation pays the rebate to payer (the splitter), which receives it and cannot refund; later distribution only pays escrow-specified amounts, so the rebate remains stranded and the user never receives it.
#### Preconditions / Assumptions
- (a). NativeTokenSplitter is used to create the fulfillment via createFulfillment (payer becomes the splitter).
- (b). The chosen obligation for fulfillment sends a native-ETH rebate/refund to the payer during its hooks.
- (c). The rebate/refund is material (non-dust).

### Scenario 2.
TokenBundleSplitterUnvalidated has accrued stranded ETH from prior misdirected refunds. An adversarial oracle submits over-allocated native splits (summing to escrow native amount plus the stranded excess). collectAndDistribute uses the contract’s undifferentiated balance to pay these amounts, draining the stranded ETH to oracle-chosen recipients.
#### Preconditions / Assumptions
- (a). TokenBundleSplitterUnvalidated is used (no total-sum validation on native splits).
- (b). There is already stranded ETH in the splitter balance from earlier misdirected refunds.
- (c). The arbiter/oracle for the escrow is adversarial and submits over-allocated native splits.
- (d). collectAndDistribute is executed to process the escrow.

### Scenario 3.
A fulfillment obligation requires pre-funding and refunds variable ‘change’ to the payer upon completion. The user uses NativeTokenSplitter.createFulfillment to call the obligation. The obligation refunds change to payer (the splitter). The splitter accepts the ETH but has no way to return it to the user; the refund remains stranded.
#### Preconditions / Assumptions
- (a). The fulfillment obligation requires pre-funding and refunds change to the payer by design.
- (b). NativeTokenSplitter.createFulfillment is used to invoke the obligation (payer becomes the splitter).

#### Proposed fix

##### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 77 unchanged lines ...
     }
 
-    function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID) external payable returns (bytes32 fulfillmentUid) {
+    function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID) external payable nonReentrant returns (bytes32 fulfillmentUid) {
+        uint256 b = address(this).balance;
         fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
         fulfillers[fulfillmentUid] = msg.sender;
+        uint256 a = address(this).balance; if (a > b) { (bool s, ) = payable(msg.sender).call{value: a - b}(""); require(s); }
         emit FulfillmentCreated(fulfillmentUid, msg.sender, obligationContract);
     }
 ... 53 unchanged lines ...
```

##### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 112 unchanged lines ...
     }
 
-    function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID) external payable returns (bytes32 fulfillmentUid) {
+    function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID) external payable nonReentrant returns (bytes32 fulfillmentUid) {
+        uint256 b = address(this).balance;
         fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
         fulfillers[fulfillmentUid] = msg.sender;
+        uint256 a = address(this).balance; if (a > b) { (bool s, ) = payable(msg.sender).call{value: a - b}(""); require(s); }
         emit FulfillmentCreated(fulfillmentUid, msg.sender, obligationContract);
     }
 ... 115 unchanged lines ...
```

### 20. [Informational] Incorrect not-found handling (try/catch around EAS.getAttestation) in BaseEscrowObligation and BaseEscrowObligationTierable causes error misclassification and off-chain mis-triage

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Base escrow contracts expect IEAS.getAttestation to revert for unknown UIDs and surface AttestationNotFound, but canonical EAS returns a zeroed Attestation. As a result, missing escrows and fulfillments are misclassified as InvalidEscrowAttestation/InvalidFulfillment or delegated to the arbiter (tierable), breaking intended error semantics and potentially causing integrations (keepers/wrappers/monitors) to mis-handle failures.

Canonical EAS.getAttestation returns the stored struct or a zeroed Attestation for unknown UIDs and never reverts. BaseEscrowObligation and BaseEscrowObligationTierable wrap getAttestation in try/catch and revert AttestationNotFound on failure, but the catch blocks are unreachable. Consequently: (1) a missing escrow reverts InvalidEscrowAttestation due to schema mismatch, (2) a missing fulfillment in non-tierable flows fails the refUID binding and reverts InvalidFulfillment, and (3) a missing fulfillment in tierable flows is forwarded to the arbiter and rejected or accepted solely per arbiter logic. This collapses 'not found' into other failure classes and can surprise or break off-chain integrations that branch on AttestationNotFound. Non-tierable asset safety is unaffected; tierable acceptance of unrelated/missing fulfillments depends on arbiter design and is independent of this bug.

#### Severity

**Impact Explanation:** [Informational] The bug causes an error-classification mismatch (read-path/UX/observability) without directly affecting on-chain state safety or core functionality; non-tierable asset safety is preserved, and tierable acceptance depends on arbiter choice independent of this issue.

**Likelihood Explanation:** [Low] Exploitation depends on external integrations specifically branching on the AttestationNotFound error for control flow; many systems treat any revert uniformly, reducing prevalence.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Keeper-based collection on a non-tierable escrow passes a nonexistent fulfillment UID; the contract reverts InvalidFulfillment instead of AttestationNotFound. A keeper that relies on AttestationNotFound to trigger retries misclassifies the error and prematurely stops retrying, delaying settlement.
#### Preconditions / Assumptions
- (a). A non-tierable escrow contract (e.g., inheriting BaseEscrowObligation) is used
- (b). A keeper or wrapper branches behavior based on receiving AttestationNotFound
- (c). Caller supplies a nonexistent fulfillment UID to collectEscrowRaw

### Scenario 2.
Operational tooling invokes reclaimExpired with a stale or mistyped uid; the contract reverts InvalidEscrowAttestation (schema mismatch) instead of AttestationNotFound. Housekeeping systems mislabel the issue and perform incorrect or noisy follow-up actions.
#### Preconditions / Assumptions
- (a). Operations tooling periodically calls reclaimExpired
- (b). Tooling branches on AttestationNotFound to triage stale vs. schema errors
- (c). Caller supplies an unknown or stale uid to reclaimExpired

### Scenario 3.
Tierable escrow collection with a nonexistent fulfillment UID forwards a zeroed fulfillment to the arbiter; a robust arbiter rejects it, but the error surfaces as InvalidFulfillment (or arbiter-specific), not AttestationNotFound, breaking monitoring logic that distinguishes missing vs. rejected fulfillments.
#### Preconditions / Assumptions
- (a). A tierable escrow contract (inheriting BaseEscrowObligationTierable) is used
- (b). Monitoring/automation distinguishes missing vs. arbiter-rejected fulfillments via AttestationNotFound
- (c). Caller supplies a nonexistent fulfillment UID to collectEscrowRaw

#### Proposed fix

##### BaseEscrowObligation.sol

File: `contracts/src/BaseEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/BaseEscrowObligation.sol)

```diff
 ... 70 unchanged lines ...
             revert AttestationNotFound(_escrow);
         }
+        if (escrow.uid == bytes32(0)) revert AttestationNotFound(_escrow);
 
         try eas.getAttestation(_fulfillment) returns (
             Attestation memory attestationResult
         ) {
             fulfillment = attestationResult;
         } catch {
             revert AttestationNotFound(_fulfillment);
         }
+        if (fulfillment.uid == bytes32(0)) revert AttestationNotFound(_fulfillment);
 
         // Validate escrow uses correct schema
 ... 47 unchanged lines ...
             revert AttestationNotFound(uid);
         }
+        if (attestation.uid == bytes32(0)) revert AttestationNotFound(uid);
 
         // Validate attestation uses correct schema
 ... 47 unchanged lines ...
```

##### BaseEscrowObligationTierable.sol

File: `contracts/src/BaseEscrowObligationTierable.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/BaseEscrowObligationTierable.sol)

```diff
 ... 70 unchanged lines ...
             revert AttestationNotFound(_escrow);
         }
+        if (escrow.uid == bytes32(0)) revert AttestationNotFound(_escrow);
 
         try eas.getAttestation(_fulfillment) returns (
             Attestation memory attestationResult
         ) {
             fulfillment = attestationResult;
         } catch {
             revert AttestationNotFound(_fulfillment);
         }
+        if (fulfillment.uid == bytes32(0)) revert AttestationNotFound(_fulfillment);
 
         // Validate escrow uses correct schema
 ... 47 unchanged lines ...
             revert AttestationNotFound(uid);
         }
+        if (attestation.uid == bytes32(0)) revert AttestationNotFound(uid);
 
         // Validate attestation uses correct schema
 ... 47 unchanged lines ...
```

## Warnings

### 1. [Medium] Empty receive() bypassing deposit accounting in NativeTokenEscrowHook causes permanent ETH lock

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

The hook accepts ETH via an empty receive() without crediting deposits, while withdrawals are strictly gated by per-caller deposits. Any ETH sent directly to the hook cannot be released or returned and becomes permanently stuck.

NativeTokenEscrowHook tracks ETH deposits per-caller only when onLock() is called with msg.value matching the encoded amount. onRelease()/onReturn() use _transferOut(), which requires deposits[msg.sender] >= amount and decrements that mapping before sending ETH. The contract’s receive() accepts ETH but does not update deposits, and there is no sweep/admin function. As a result, ETH sent directly to the hook outside onLock() is never credited to any caller and cannot be withdrawn through onRelease()/onReturn(), leading to permanent fund lock. A similar footgun exists for HookEscrowObligation’s receive(), which accepts ETH with no withdrawal path.

#### Severity

**Impact Explanation:** [High] Funds sent via plain transfer are permanently frozen with no workaround, constituting direct, material loss of principal and indefinite fund lock.

**Likelihood Explanation:** [Low] Requires an integration/dApp to behave incorrectly by misrouting ETH directly to the hook/obligation instead of using the intended onLock flow; not a default or attacker-driven path.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Integrator/dApp misconfiguration sends ETH directly to NativeTokenEscrowHook (plain transfer) instead of invoking HookEscrowObligation.doObligation that forwards value to hook.onLock; the hook’s receive() accepts ETH without crediting deposits; later onRelease()/onReturn() cannot withdraw uncredited ETH, leaving it permanently stuck.
#### Preconditions / Assumptions
- (a). NativeTokenEscrowHook is deployed and used by the integrator
- (b). The integrator/dApp routes user ETH directly to the hook address (plain transfer) outside the onLock flow
- (c). No rescue/sweep mechanism exists to recover uncredited ETH

### Scenario 2.
Integrator/dApp misconfiguration sends ETH directly to HookEscrowObligation’s address (receive) instead of calling doObligation with value; the obligation accepts ETH but has no withdrawal path and does not forward it to any hook, resulting in permanently stuck ETH.
#### Preconditions / Assumptions
- (a). HookEscrowObligation is deployed and used by the integrator
- (b). The integrator/dApp routes user ETH directly to the obligation address (plain transfer) instead of calling doObligation that triggers onLock
- (c). No rescue/sweep mechanism exists to recover ETH held by the obligation

#### Proposed fix

##### NativeTokenEscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/NativeTokenEscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/NativeTokenEscrowHook.sol)

```diff
 ... 97 unchanged lines ...
         return abi.decode(data, (HookData));
     }
-
-    receive() external payable {}
+    receive() external payable { revert("Direct ETH not accepted; use onLock"); }
 }
```

##### HookEscrowObligation.sol

File: `contracts/src/obligations/escrow/hook-based/HookEscrowObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/HookEscrowObligation.sol)

```diff
 ... 167 unchanged lines ...
 
     // Allow contract to receive native tokens (for hooks that deal with ETH)
-    receive() external payable override {}
+    receive() external payable override { revert("Direct ETH not accepted; use doObligation"); }
 }
```

#### Related findings

##### [Low] Push-based native ETH transfer with revert-on-failure in NativeTokenEscrowHook under constrained/non-payable recipients causes escrow release/return DoS

###### Description

NativeTokenEscrowHook unconditionally push-sends ETH and reverts on failure, and HookEscrowObligation uses recipient addresses that can be adversarially constrained for release and are fixed for return. If the destination is a non-payable/reverting contract, release and/or return always revert, locking escrowed ETH (and any bundled assets via AllEscrowHook) and denying payout.

In NativeTokenEscrowHook._transferOut, the hook decodes amount, checks deposits[msg.sender], and then sends ETH to the provided recipient using payable(to).call{value: amount}(""). It reverts on failure (NativeTokenTransferFailed). BaseEscrowObligation.collectEscrowRaw sets the payout recipient to fulfillment.recipient; HookEscrowObligation._releaseEscrow forwards this to onRelease. An adversarial arbiter can require a fixed recipient for valid fulfillments, so every valid release attempt must target the same address. If that address is a non-payable/reverting contract, each release attempt always reverts. For expiry refunds, BaseEscrowObligation.reclaimExpired forwards the escrow’s original recipient to onReturn, which cannot be changed; if that recipient rejects ETH, every reclaim attempt always reverts. AllEscrowHook composes sub-hooks atomically, so a failing ETH send reverts the entire composite release/return, preventing other assets from transferring. The design has no fallback (e.g., WETH wrapping or pull-based withdrawals), so destination rejection induces persistent liveness DoS for that escrow. Note: state updates and EAS revocations are rolled back on revert, so accounting remains consistent; the issue is purely liveness/DoS.

###### Severity

**Impact Explanation:** [Medium] Denial of payout/return for the affected escrow instance (and bundled assets via AllEscrowHook). This is a significant availability loss for users relying on that escrow but not protocol-wide breakage or theft.

**Likelihood Explanation:** [Low] Requires adversarial arbiter constraints and/or non-payable recipients; typically represents self-griefing or misconfiguration. Many real deployments use EOAs/payable recipients and benign arbiters.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Malicious arbiter constrains fulfillment.recipient to a blackhole contract A that rejects ETH; the escrow’s recipient is also set to A. Release attempts that match arbiter constraints always revert on ETH send; after expiry, reclaimExpired also reverts due to the fixed non-payable recipient. ETH remains locked in the hook; the fulfiller is denied payout.
#### Preconditions / Assumptions
- (a). Escrow uses HookEscrowObligation with NativeTokenEscrowHook and deposits X ETH
- (b). Arbiter is adversarial and only approves fulfillments with fulfillment.recipient equal to a fixed address A
- (c). Address A is a contract that rejects ETH (non-payable/reverting receive/fallback)
- (d). Escrow attestation recipient is set to A (for the return path)
- (e). No fallback mechanism exists in the hook (no WETH wrapping or pull-based withdrawals)

### Scenario 2.
AllEscrowHook bundles NativeTokenEscrowHook (ETH) with an ERC20EscrowHook. The arbiter constrains fulfillment.recipient to a blackhole contract A that rejects ETH, and the escrow recipient is A. On release or return, the ETH sub-hook send fails and reverts the entire composite call, preventing both ETH and ERC20 transfers. The fulfiller is denied payout; assets remain locked in their respective hooks.
#### Preconditions / Assumptions
- (a). Escrow uses HookEscrowObligation with AllEscrowHook composed of NativeTokenEscrowHook (ETH) and ERC20EscrowHook (token T)
- (b). Deposits include X ETH and Y units of token T
- (c). Arbiter is adversarial and only approves fulfillments with fulfillment.recipient equal to a fixed address A
- (d). Address A is a contract that rejects ETH
- (e). Escrow attestation recipient is set to A (for the return path)
- (f). AllEscrowHook executes sub-hooks atomically; any sub-hook revert reverts the whole release/return

###### Proposed fix

####### NativeTokenEscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/NativeTokenEscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/NativeTokenEscrowHook.sol)

```diff
 ... 24 unchanged lines ...
     );
     error NativeTokenTransferFailed(address to, uint256 amount);
+    // Mitigation note:
+    // To eliminate liveness DoS when 'to' rejects ETH, add an immutable WETH address to this hook and
+    // on failed native transfer, wrap the amount into WETH and SafeERC20.transfer WETH to 'to' instead of reverting.
+    // This preserves atomicity and prevents permanent escrow lock on release/return.
 
     // ──────────────────────────────────────────────
 ... 49 unchanged lines ...
 
         (bool success, ) = payable(to).call{value: decoded.amount}("");
+        // If this send fails, implement WETH fallback: IWETH(weth).deposit{value: decoded.amount}();
+        // then SafeERC20(IERC20(weth)).safeTransfer(to, decoded.amount) and emit a fallback event.
         if (!success) {
             revert NativeTokenTransferFailed(to, decoded.amount);
 ... 21 unchanged lines ...
```

### 2. [Medium] Self-recipient splits and missing withdrawal in splitters cause permanent asset lock during safe distribution

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Splitters allow address(this) as a split recipient and have no withdrawal/sweep. In the safe collectAndDistribute path, transfers to self succeed and do not revert, permanently locking assets in the splitter.

The splitter contracts (NativeTokenSplitter, ERC20Splitter, TokenBundleSplitter) use createFulfillment to create fulfillments from the splitter address, making the fulfillment attestation recipient the splitter itself. During collectAndDistribute, the splitter first calls collectEscrow(escrow, fulfillment), which per design transfers the escrowed assets to the fulfillment recipient (the splitter). The splitter then distributes assets to the oracle-provided split recipients using raw ETH calls, ERC20 transfers, or ERC1155 safeTransferFrom. There is no guard against specifying address(this) in the splits. When a split recipient is the splitter contract itself, the transfer to self succeeds (ETH via payable receive(), ERC20 standard self-transfer, ERC1155 safeTransferFrom to self via ERC1155Holder), so no revert occurs in the safe path. Because none of the splitters implement a withdrawal/sweep function, any assets sent to address(this) remain permanently locked in the splitter. A malicious or incorrect oracle decision can thus lock some or all escrowed assets in the splitter even when using the safe distribution path.

#### Severity

**Impact Explanation:** [High] Assets are permanently frozen in the splitter with no available withdrawal or sweep, constituting a direct, material loss/freeze of principal with no workaround.

**Likelihood Explanation:** [Low] Exploitation requires a malicious or incorrect oracle/integration decision (broken integration) and is primarily griefing without direct attacker profit.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Malicious oracle locks 100% of escrowed ETH in NativeTokenSplitter: the oracle submits splits where the only recipient is the splitter’s own address; collectAndDistribute first receives ETH from collectEscrow and then sends ETH to address(this), which succeeds, irrevocably locking the ETH in the splitter.
#### Preconditions / Assumptions
- (a). An escrow uses a native-token-compatible obligation with the splitter as arbiter.
- (b). Demand data encodes an attacker-controlled oracle address.
- (c). A fulfillment is created via the splitter, making the fulfillment attestation recipient equal to the splitter.
- (d). collectEscrow(escrow, fulfillment) transfers the escrowed ETH to the splitter (fulfillment recipient).
- (e). The oracle stores a decision that includes address(this) as a split recipient for the full escrow amount.
- (f). Someone calls collectAndDistribute to execute the distribution.

### Scenario 2.
Malicious oracle locks ERC20 in ERC20Splitter: the oracle includes a split with recipient = address(this); collectAndDistribute receives tokens from collectEscrow and then performs a self ERC20 transfer that succeeds, leaving tokens in the splitter with no withdrawal path.
#### Preconditions / Assumptions
- (a). An escrow uses an ERC20-compatible obligation with the splitter as arbiter.
- (b). Demand data encodes an attacker-controlled oracle address.
- (c). A fulfillment is created via the splitter, making the fulfillment attestation recipient equal to the splitter.
- (d). collectEscrow(escrow, fulfillment) transfers the escrowed tokens to the splitter (fulfillment recipient).
- (e). The oracle stores a decision that includes address(this) as a split recipient for some or all of the tokens.
- (f). Someone calls collectAndDistribute to execute the distribution.

### Scenario 3.
Malicious oracle locks ERC1155 in TokenBundleSplitter: the oracle includes a split with recipient = address(this) and assigns some ERC1155 amounts; collectAndDistribute receives ERC1155 from collectEscrow and then safeTransferFrom(address(this), address(this), ...) succeeds due to ERC1155Receiver support, leaving tokens stuck in the splitter.
#### Preconditions / Assumptions
- (a). An escrow uses an ERC1155-compatible obligation with the splitter as arbiter.
- (b). Demand data encodes an attacker-controlled oracle address.
- (c). A fulfillment is created via the splitter, making the fulfillment attestation recipient equal to the splitter.
- (d). collectEscrow(escrow, fulfillment) transfers the escrowed ERC1155 to the splitter (fulfillment recipient).
- (e). The oracle stores a decision that includes address(this) as a split recipient assigning some ERC1155 amounts.
- (f). Someone calls collectAndDistribute to execute the distribution.

#### Proposed fix

##### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 88 unchanged lines ...
         for (uint256 i; i < splits.length; ++i) {
             address recipient = _resolveSentinel(splits[i].recipient, fulfillment);
+            require(recipient != address(this), "self-recipient");
             (bool success, ) = payable(recipient).call{value: splits[i].amount}("");
             if (!success) revert NativeTokenTransferFailed(recipient, splits[i].amount);
 ... 45 unchanged lines ...
```

##### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 138 unchanged lines ...
         for (uint256 i; i < splits.length; ++i) {
             address recipient = _resolveSentinel(splits[i].recipient, fulfillment);
+            require(recipient != address(this), "self-recipient");
             bool success = IERC20(token).trySafeTransfer(recipient, splits[i].amount);
             if (!success) revert ERC20TransferFailed(token, recipient, splits[i].amount);
 ... 51 unchanged lines ...
```

##### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 90 unchanged lines ...
         for (uint256 i; i < splits.length; ++i) {
             address recipient = _resolveSentinel(splits[i].recipient, fulfillment);
+            require(recipient != address(this), "self-recipient");
             try IERC1155(token).safeTransferFrom(address(this), recipient, tokenId, splits[i].amount, "") {} catch {
                 revert ERC1155TransferFailed(token, recipient, tokenId, splits[i].amount);
 ... 45 unchanged lines ...
```

##### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 167 unchanged lines ...
 
     function _distributeAtomic(BundleSplit memory split, EscrowObligationData memory escrowData, address recipient) internal {
+        require(recipient != address(this), "self-recipient");
         if (split.nativeAmount > 0) {
             (bool success, ) = payable(recipient).call{value: split.nativeAmount}("");
 ... 63 unchanged lines ...
```

### 3. [Medium] Missing authorization and non-unique pending tracking in AttestationEscrowHook cause escrow collection DoS and arbitrary attestations

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

AttestationEscrowHook allows anyone to call onLock/onRelease and create EAS attestations if the target schema is permissive, and its single boolean pending keyed by (caller, keccak256(data)) collides across multiple escrows with identical hookData under the same caller, causing release-time reverts (DoS) when composed via AllEscrowHook. A workaround exists (re-lock to re-arm pending), and proper schema resolvers and per-escrow-unique hookData mitigate the risks.

AttestationEscrowHook implements IEscrowHook with permissionless onLock/onRelease that ignore the escrow parameter. onLock sets pending[msg.sender][keccak256(data)] = true; onRelease only checks that same key before calling EAS.attest(decoded.attestation). EAS sets Attestation.attester = msg.sender (the hook contract). If the chosen schema has no or a permissive resolver and value=0, arbitrary attestations can be created by any account performing a self onLock→onRelease handshake. Separately, because pending is a single boolean per (caller, dataHash), multiple escrows created by the same caller with identical hookData will collide: the first onRelease clears pending and the second reverts NoPendingAttestation. When AttestationEscrowHook is composed with asset hooks via AllEscrowHook, this revert aborts the entire composite release and can block fund collection. If the escrow is non-expiring, funds can be blocked until a workaround is used (e.g., creating another escrow with identical data to re-arm pending). Using strict resolvers and embedding per-escrow uniqueness (e.g., escrow UID/salt) in hookData prevent both issues.

#### Severity

**Impact Explanation:** [Medium] Escrow collection can be blocked by release-time reverts when identical hookData is reused under the same caller, causing significant but recoverable availability loss; forging attestations affects integrity only and does not cause direct fund loss.

**Likelihood Explanation:** [Medium] Composing hooks via AllEscrowHook is supported and reusing identical hookData is a plausible integrator mistake; permissive schemas also occur in practice, though competent operators can avoid both with resolvers and per-escrow-unique data.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Escrow collection DoS via identical hookData reuse: An integrator uses HookEscrowObligation with AllEscrowHook composing an asset hook (e.g., ERC20EscrowHook) and AttestationEscrowHook. They create Escrow1 and Escrow2 with the same AttestationEscrowHook hookData (identical AttestationRequest). onLock marks a single pending=true for (AllEscrowHook, dataHash). Collecting Escrow1 succeeds and clears pending. Attempting to collect Escrow2 calls AllEscrowHook.onRelease; AttestationEscrowHook.onRelease sees pending=false and reverts, causing the entire composite release to revert and blocking fund collection until expiry or until the operator re-locks an additional identical escrow to re-arm pending and then sequences collections.
#### Preconditions / Assumptions
- (a). HookEscrowObligation is used with AllEscrowHook to compose an asset hook and AttestationEscrowHook in the same escrow flow
- (b). Two or more escrows are created by the same caller (AllEscrowHook) with identical AttestationEscrowHook hookData (no per-escrow nonce/UID in data)
- (c). Release path invokes AllEscrowHook.onRelease (atomic across sub-hooks)
- (d). EAS/SchemaRegistry are the canonical vendored implementations

### Scenario 2.
Arbitrary attestation creation under permissive/no-resolver schema: An attacker prepares an AttestationRequest to a schema with no or permissive resolver and value=0, encodes it as AttestationEscrowHook hookData, and directly calls onLock(data) then onRelease(data) on the hook. pending[attacker][dataHash] gates the call, and eas.attest(decoded.attestation) is executed, minting an attestation with attester = AttestationEscrowHook. Naïve consumers that treat these attestations as proof of escrow release can be misled.
#### Preconditions / Assumptions
- (a). A target EAS schema exists that has no resolver or a permissive resolver and requires value=0
- (b). AttestationEscrowHook is deployed and configured to the same EAS
- (c). A consumer relies on these attestations (attester = hook) as a release signal (making the integrity impact meaningful)

### Scenario 3.
Schema spam/pollution: For a permissive or no-resolver schema with value=0, an attacker repeatedly calls onLock/onRelease with arbitrary data to cause eas.attest, creating many attestations by the hook contract. This pollutes the schema’s attestations and can degrade application-layer indexing or trigger naïve logic that monitors such attestations.
#### Preconditions / Assumptions
- (a). A permissive or no-resolver EAS schema exists with value=0
- (b). AttestationEscrowHook is publicly callable
- (c). Applications or indexers monitor or rely on counts/occurrences under the permissive schema

#### Proposed fix

##### AttestationEscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook.sol)

```diff
 ... 25 unchanged lines ...
     IEAS public immutable eas;
 
+    // TODO(security): Replace boolean 'pending' with a per-caller, per-escrow, per-dataHash counter to avoid collisions/DoS, and add optional restricted mode (allowlist of callers + expected escrow binding) to block arbitrary callers.
+    // NOTE: pendingCount[msg.sender][escrow][keccak256(data)]++ on lock; require > 0 then decrement on release/return.
     /// @notice Tracks pending releases: caller → hookDataHash → pending.
     mapping(address => mapping(bytes32 => bool)) public pending;
 
     error AttestationCreationFailed();
     error NoPendingAttestation(address caller, bytes32 hookDataHash);
 
     constructor(IEAS _eas) {
         eas = _eas;
     }
 
     // ──────────────────────────────────────────────
 
     function onLock(
         bytes calldata data,
         address /* from */,
         address /* escrow */
     ) external payable override {
         // Mark as pending so onRelease can verify it was locked via a
         // legitimate obligation flow.
+        // TODO(security): Enforce allowed caller/escrow if restricted, then increment counter pendingCount[msg.sender][escrow][dataHash]++ instead of boolean.
         bytes32 dataHash = keccak256(data);
         pending[msg.sender][dataHash] = true;
     }
 
     function onRelease(
         bytes calldata data,
         address /* to */,
         address /* escrow */
     ) external override {
+        // TODO(security): Require pendingCount[msg.sender][escrow][dataHash] > 0 then decrement; also require decoded.attestation.data.value == 0 and optionally 'to' matches recipient.
         bytes32 dataHash = keccak256(data);
         if (!pending[msg.sender][dataHash]) {
             revert NoPendingAttestation(msg.sender, dataHash);
         }
 
         pending[msg.sender][dataHash] = false;
 
         HookData memory decoded = abi.decode(data, (HookData));
         try eas.attest(decoded.attestation) {} catch {
             revert AttestationCreationFailed();
         }
     }
 
     function onReturn(
         bytes calldata data,
         address /* to */,
         address /* escrow */
     ) external override {
+        // TODO(security): Decrement pendingCount[msg.sender][escrow][dataHash] if > 0 (no attestation created on return).
         // Clear the pending state — the attestation won't be created.
         bytes32 dataHash = keccak256(data);
 ... 21 unchanged lines ...
```

##### AttestationEscrowHook2.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook2.sol)

```diff
 ... 25 unchanged lines ...
     bytes32 public immutable VALIDATION_SCHEMA;
 
+    // TODO(security): Replace boolean 'pending' with a per-caller, per-escrow, per-dataHash counter, and add optional restricted mode (allowlist of callers + expected escrow binding) to block arbitrary callers.
+    // NOTE: pendingCount[msg.sender][escrow][keccak256(data)]++ on lock; require > 0 then decrement on release/return.
     /// @notice Tracks pending: caller → hookDataHash → pending.
     mapping(address => mapping(bytes32 => bool)) public pending;
 
     error AttestationCreationFailed();
     error NoPendingValidation(address caller, bytes32 hookDataHash);
 
     constructor(IEAS _eas, ISchemaRegistry _schemaRegistry) {
         eas = _eas;
         VALIDATION_SCHEMA = _schemaRegistry.register(
             "bytes32 validatedAttestationUid",
             ISchemaResolver(address(0)),
             true
         );
     }
 
     // ──────────────────────────────────────────────
 
     function onLock(
         bytes calldata data,
         address /* from */,
         address /* escrow */
     ) external payable override {
+        // TODO(security): Enforce allowed caller/escrow if restricted, then increment counter pendingCount[msg.sender][escrow][dataHash]++ instead of boolean.
         bytes32 dataHash = keccak256(data);
         pending[msg.sender][dataHash] = true;
     }
 
     function onRelease(
         bytes calldata data,
         address to,
         address /* escrow */
     ) external override {
+        // TODO(security): Require pendingCount[msg.sender][escrow][dataHash] > 0 then decrement; also require value == 0 (no ETH) and optionally 'to' matches decoded.recipient.
         bytes32 dataHash = keccak256(data);
         if (!pending[msg.sender][dataHash]) {
 ... 29 unchanged lines ...
         address /* escrow */
     ) external override {
+        // TODO(security): Decrement pendingCount[msg.sender][escrow][dataHash] if > 0 (no attestation created on return).
         bytes32 dataHash = keccak256(data);
         if (pending[msg.sender][dataHash]) {
 ... 20 unchanged lines ...
```

#### Related findings

##### [Medium] Unrestricted onLock/onRelease in AttestationEscrowHook/AttestationEscrowHook2 causes spoofed attestations that can trigger erroneous fund release in trusting integrations

###### Description

The AttestationEscrowHook and AttestationEscrowHook2 hooks allow any caller to self-arm a pending state via onLock and then mint attestations via onRelease without verifying a legitimate escrow flow or requiring asset deposits. AttestationEscrowHook2 further registers its own open schema and issues non-revocable validations. Integrations that trust these hook-issued attestations as evidence of escrow release/validation can be spoofed, potentially releasing funds or granting privileges incorrectly.

Both hooks are permissionless attesters. AttestationEscrowHook.onLock sets pending[msg.sender][keccak256(data)] = true while ignoring the from and escrow parameters; onRelease checks only this pending bit and then calls IEAS.attest(decoded.attestation), causing an attestation with attester = the hook contract to be created under any attacker-chosen schema (subject to resolver rules). AttestationEscrowHook2 also ignores from/escrow, sets pending, and onRelease mints a non-revocable validation using a schema it registered in the constructor (VALIDATION_SCHEMA with resolver = address(0)), referencing any provided refUID and using the runtime 'to' parameter as recipient. No asset lock is required to arm pending. BaseEscrowObligation’s on-chain escrow flow does not rely on these hook-issued attestations, so direct fund theft from the repo’s escrow flow is not enabled; however, any on-chain or off-chain integration that treats these hook attestations as proof of fulfillment or validation can be misled, potentially releasing funds or granting privileges erroneously.

###### Severity

**Impact Explanation:** [High] In the worst-case integration, spoofed hook-issued attestations directly trigger material fund releases or privilege grants to attackers.

**Likelihood Explanation:** [Low] Exploitation requires external integrations to incorrectly rely on these hook-issued attestations without resolver-level checks or escrow-flow linkage; this is an integration design mistake rather than the default pattern in the repo.

###### Exploitation

## Exploitation Scenarios:

### Scenario 1.
An on-chain victim contract releases funds when it detects a validation attestation with attester = AttestationEscrowHook2 and schema = VALIDATION_SCHEMA referencing a target refUID. The attacker calls AttestationEscrowHook2.onLock with HookData {attestationUid}, then onRelease with an arbitrary 'to' to mint a non-revocable validation. The victim contract observes this and releases funds to the attacker.
#### Preconditions / Assumptions
- (a). A deployed AttestationEscrowHook2 contract address is known and reachable
- (b). A victim on-chain contract releases funds solely based on presence of a validation attestation with attester = AttestationEscrowHook2 and schema = VALIDATION_SCHEMA referencing a target refUID
- (c). The victim does not perform resolver-level or flow-linkage verification that the validation originated from a legitimate escrow/obligation flow
- (d). Canonical EAS/SchemaRegistry are deployed as assumed

### Scenario 2.
An on-chain victim contract unlocks funds upon any attestation from AttestationEscrowHook under an open schema S. The attacker constructs HookData with an AttestationRequest targeting schema S and payload that satisfies the victim’s checks (value=0), calls onLock to arm pending, then onRelease to mint the attestation and trigger fund release.
#### Preconditions / Assumptions
- (a). A deployed AttestationEscrowHook contract address is known and reachable
- (b). A victim on-chain contract accepts attestations under an open schema S and trusts attester = AttestationEscrowHook as sufficient for release/privileges
- (c). The chosen schema S does not have a restrictive resolver that would block the hook’s attestation
- (d). The victim does not verify linkage to a legitimate escrow/obligation flow
- (e). Canonical EAS/SchemaRegistry are deployed as assumed

### Scenario 3.
Off-chain or on-chain consumers use AttestationEscrowHook2’s VALIDATION_SCHEMA attestations as trust signals. The attacker repeatedly calls onLock/onRelease with arbitrary refUIDs and recipients, minting non-revocable validations that pollute reputation/eligibility signals or wrongly attribute approval/credit to attacker-controlled addresses.
#### Preconditions / Assumptions
- (a). A deployed AttestationEscrowHook2 contract address is known and reachable
- (b). External consumers (on-chain or off-chain) treat VALIDATION_SCHEMA attestations from AttestationEscrowHook2 as trust/reputation/eligibility signals
- (c). No additional verification is performed to bind validations to legitimate flows or authorized recipients
- (d). Canonical EAS/SchemaRegistry are deployed as assumed

###### Proposed fix

####### AttestationEscrowHook.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook.sol)

```diff
 ... 35 unchanged lines ...
     }
 
+    // SECURITY: Public onLock/onRelease allow anyone to arm 'pending' and mint attestations
+    // without a legitimate escrow flow. Mitigate by: (1) restricting callers to authorized
+    // escrow contracts (require msg.sender == escrow and escrow whitelisted), (2) binding
+    // 'pending' by escrow instead of msg.sender, and (3) using a fixed schema with a resolver.
+
     // ──────────────────────────────────────────────
 
     function onLock(
         bytes calldata data,
         address /* from */,
         address /* escrow */
     ) external payable override {
+        // TODO: Enforce caller authorization and bind 'pending' to the escrow identity.
         // Mark as pending so onRelease can verify it was locked via a
         // legitimate obligation flow.
         bytes32 dataHash = keccak256(data);
         pending[msg.sender][dataHash] = true;
     }
 
     function onRelease(
         bytes calldata data,
         address /* to */,
         address /* escrow */
     ) external override {
+        // TODO: Enforce caller authorization and verify escrow-bound pending via resolver.
         bytes32 dataHash = keccak256(data);
         if (!pending[msg.sender][dataHash]) {
 ... 39 unchanged lines ...
```

####### AttestationEscrowHook2.sol

File: `contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook2.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/obligations/escrow/hook-based/hooks/AttestationEscrowHook2.sol)

```diff
 ... 40 unchanged lines ...
     }
 
+    // SECURITY: Public onLock/onRelease allow anyone to arm 'pending' and mint non-revocable
+    // validations under an open schema (resolver = address(0)). Mitigate by: (1) restricting
+    // callers to authorized escrow contracts (require msg.sender == escrow and escrow whitelisted),
+    // (2) binding 'pending' by escrow instead of msg.sender, (3) registering VALIDATION_SCHEMA
+    // with resolver = this and validating escrow-bound pending/recipient, or (4) moving attestation
+    // logic into BaseAttester-based obligations.
     // ──────────────────────────────────────────────
 
     function onLock(
         bytes calldata data,
         address /* from */,
         address /* escrow */
     ) external payable override {
+        // TODO: Enforce caller authorization and bind 'pending' to the escrow identity.
         bytes32 dataHash = keccak256(data);
         pending[msg.sender][dataHash] = true;
     }
 
     function onRelease(
         bytes calldata data,
         address to,
         address /* escrow */
     ) external override {
+        // TODO: Enforce caller authorization, recipient lock, and resolver-based validation.
         bytes32 dataHash = keccak256(data);
         if (!pending[msg.sender][dataHash]) {
 ... 53 unchanged lines ...
```

### 4. [Informational] Missing bounds check on ERC721 indices in TokenBundleSplitterBase causes distribution DoS via out-of-bounds revert

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

TokenBundleSplitterBase uses ERC721 indices from stored splits without bounds checks, causing out-of-bounds array access and revert during distribution. TokenBundleSplitter (validated) also permits this when the escrow has zero ERC721s due to a validation gap, resulting in a temporary DoS of collectAndDistribute until corrected splits are submitted.

In TokenBundleSplitterBase, _distributeAtomic and _distributePartial loop over split.erc721Indices and directly index escrowData.erc721Tokens[idx] and escrowData.erc721TokenIds[idx] without verifying that idx is within array bounds. Any idx ≥ escrowData.erc721Tokens.length triggers an immediate out-of-bounds revert before any external call. TokenBundleSplitter (validated) enforces ERC721 index bounds and uniqueness only when escrowData.erc721Tokens.length > 0; if it is zero, the function performs no checks on erc721Indices, allowing non-empty indices that will cause OOB reverts later. TokenBundleSplitterUnvalidated performs no validation and will also accept malformed indices. collectAndDistribute first calls escrowContract.collectEscrow, then performs distribution; an out-of-bounds revert in distribution reverts the entire transaction, so assets remain in escrow. The net effect is a temporary DoS of distribution until the oracle/operator submits corrected splits. No funds are lost or mis-distributed, and a malicious oracle can already block distribution by not submitting any decision.

#### Severity

**Impact Explanation:** [Low] Temporary availability loss (DoS) of a single escrow’s distribution due to revert; assets remain in escrow and a straightforward workaround exists by resubmitting correct splits. A malicious oracle can already block distribution by never submitting any decision, so the incremental harm is limited.

**Likelihood Explanation:** [Low] Requires oracle/operator mistake or malice and, for the validated splitter case, the specific condition that the escrow has zero ERC721s while non-empty indices are provided. These are plausible but not frequent conditions.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Validated splitter DoS with zero ERC721s: The oracle submits splits containing non-empty erc721Indices for an escrow whose ERC721 arrays are empty. TokenBundleSplitter accepts the decision due to a validation gap when numErc721 == 0. On collectAndDistribute, after collectEscrow succeeds, the ERC721 loop indexes escrowData.erc721Tokens[0] on a zero-length array and reverts, rolling back the entire transaction and blocking distribution until corrected splits are submitted.
#### Preconditions / Assumptions
- (a). Using TokenBundleSplitter (validated).
- (b). The escrow attestation encodes zero ERC721s (erc721Tokens.length == 0).
- (c). The designated oracle/operator for this escrow can call arbitrate and submits splits containing at least one ERC721 index.
- (d). Executor creates the fulfillment via the splitter (so the splitter is the fulfillment recipient) and calls collectAndDistribute.

### Scenario 2.
Unvalidated splitter DoS via out-of-range ERC721 index: The oracle submits splits with an erc721Indices entry ≥ number of escrowed ERC721s. TokenBundleSplitterUnvalidated stores the decision. On collectAndDistribute, the ERC721 loop reads escrowData.erc721Tokens[idx] with idx out of range, causing an out-of-bounds revert that rolls back the transaction and blocks distribution until corrected splits are submitted.
#### Preconditions / Assumptions
- (a). Using TokenBundleSplitterUnvalidated.
- (b). The escrow attestation encodes N >= 1 ERC721s.
- (c). The designated oracle/operator for this escrow can call arbitrate and submits splits containing an ERC721 index >= N.
- (d). Executor creates the fulfillment via the splitter and calls collectAndDistribute.

#### Proposed fix

##### TokenBundleSplitter.sol

File: `contracts/src/utils/splitters/TokenBundleSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitter.sol)

```diff
 ... 105 unchanged lines ...
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

##### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 67 unchanged lines ...
     error ERC1155TransferFailed(address token, address to, uint256 tokenId, uint256 amount);
     error NoFulfillerRecorded(bytes32 fulfillment);
+    error InvalidERC721Index(uint256 index, uint256 max);
 
     IEAS public eas;
 ... 108 unchanged lines ...
         for (uint256 i; i < split.erc721Indices.length; ++i) {
             uint256 idx = split.erc721Indices[i];
+            if (idx >= escrowData.erc721Tokens.length) revert InvalidERC721Index(idx, escrowData.erc721Tokens.length);
             try IERC721(escrowData.erc721Tokens[idx]).safeTransferFrom(address(this), recipient, escrowData.erc721TokenIds[idx]) {} catch {
                 revert ERC721TransferFailed(escrowData.erc721Tokens[idx], recipient, escrowData.erc721TokenIds[idx]);
 ... 22 unchanged lines ...
         for (uint256 i; i < split.erc721Indices.length; ++i) {
             uint256 idx = split.erc721Indices[i];
+            if (idx >= escrowData.erc721Tokens.length) continue;
             try IERC721(escrowData.erc721Tokens[idx]).safeTransferFrom(address(this), recipient, escrowData.erc721TokenIds[idx]) {} catch {
                 emit ERC721TransferFailedOnDistribute(recipient, escrowData.erc721Tokens[idx], escrowData.erc721TokenIds[idx]);
 ... 25 unchanged lines ...
```

### 5. [Informational] Unchecked event payload in splitter requestArbitration() emits attacker-chosen oracle/demand/fulfillment causing off-chain oracle misdirection and misdirected payouts

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

Splitter contracts emit ArbitrationRequested with user-supplied oracle/demand/fulfillment without verifying they match the escrow’s canonical demand. On-chain arbiters bind decisions only to the oracle address (decoded from the escrow’s demand) and the (fulfillment, escrow) pair, ignoring demand.data. A naive off-chain oracle/indexer that trusts the event payload can be tricked into posting an arbitrate() decision from the oracle address that will be honored on-chain and misdirect payouts. The contracts themselves behave as designed; this is an integration foot-gun requiring oracle cooperation.

In ERC20Splitter, ERC1155Splitter, NativeTokenSplitter, and TokenBundleSplitterBase, requestArbitration() authorizes the caller as the escrow attestation’s attester or recipient, then emits ArbitrationRequested(_fulfillment, _escrow, oracle, demand) using the caller-provided values without verifying they match the escrow’s canonical demand. arbitrate() stores decisions under decisions[msg.sender][keccak256(fulfillment, escrow)] and enforces only totals/structural checks (depending on the splitter variant). checkObligation() decodes demand to obtain only the oracle address and checks hasDecision[oracle][keccak256(fulfillment.uid, escrow)], ignoring demand.data. collectAndDistribute() re-reads the escrow’s canonical demand on-chain to select the oracle bucket and then uses the previously stored decision; it does not rely on the event payload. BaseEscrowObligation (non-tierable) enforces fulfillment.refUID == escrow.uid; BaseEscrowObligationTierable intentionally does not. Because the system trusts the oracle’s decision by design, a naive off-chain oracle/indexer that trusts ArbitrationRequested event fields instead of re-reading attestations can be misled into posting a signed arbitrate() decision that will be honored on-chain and misdirect funds. This is not an on-chain exploit absent oracle participation; it is an integration hazard for oracle/indexer implementations.

#### Severity

**Impact Explanation:** [High] If exploited via a naive oracle/indexer, escrowed assets (ERC20/ETH/NFTs/bundles) can be misdirected to attacker-controlled recipients, constituting direct, material loss of principal funds.

**Likelihood Explanation:** [Low] Exploitation requires an external oracle/indexer to behave incorrectly by trusting event payloads instead of re-reading canonical on-chain attestations; with competent implementations, this is avoidable.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Scenario 1 (ERC20, non-tierable): 1) Attacker (escrow recipient) creates a fulfillment whose recipient is the splitter (e.g., via splitter.createFulfillment so distribution can succeed). 2) Attacker calls requestArbitration(fulfillmentUid, escrowUid, TrustedOracle, attacker-chosen demandBytes), emitting a misleading event. 3) A naive oracle/indexer trusts the event payload and posts arbitrate(fulfillmentUid, escrowUid, splits) from TrustedOracle, with splits directing funds to attacker addresses and totaling the escrowed amount. 4) collectAndDistribute reads the canonical oracle from the escrow’s demand, finds the decision by (TrustedOracle, keccak(fulfillment, escrow)), collectEscrowRaw passes (refUID matches for non-tierable), tokens are released to the splitter, and the splitter distributes per the naive oracle’s decision, misdirecting funds.
#### Preconditions / Assumptions
- (a). An ERC20 escrow using a non-tierable ERC20EscrowObligation with arbiter set to an ERC20Splitter and demand encoding TrustedOracle
- (b). The attacker is authorized to call requestArbitration() (escrow attester or recipient)
- (c). The fulfillment’s recipient is the splitter to ensure distribution succeeds
- (d). The oracle/indexer implementation naively trusts ArbitrationRequested event payloads instead of re-reading on-chain attestations
- (e). The oracle signs and sends arbitrate() from the TrustedOracle address

### Scenario 2.
Scenario 2 (ERC20, tierable): 1) Attacker creates any fulfillment whose recipient is the splitter (no refUID binding needed). 2) Attacker emits requestArbitration(fulfillmentUid, escrowUid, TrustedOracle, attacker-chosen demandBytes). 3) Naive oracle posts arbitrate(fulfillmentUid, escrowUid, splits) from TrustedOracle. 4) collectAndDistribute loads the canonical oracle and the decision by (TrustedOracle, keccak(fulfillment, escrow)); collectEscrowRaw (tierable) does not check refUID and relies on the arbiter’s hasDecision; escrow releases tokens to the splitter and distribution proceeds to attacker-chosen recipients.
#### Preconditions / Assumptions
- (a). An ERC20 escrow using a tierable escrow obligation with arbiter set to an ERC20Splitter and demand encoding TrustedOracle
- (b). The attacker is authorized to call requestArbitration()
- (c). A fulfillment exists whose recipient is the splitter (no refUID binding required in tierable)
- (d). The oracle/indexer implementation naively trusts ArbitrationRequested event payloads
- (e). The oracle signs and sends arbitrate() from the TrustedOracle address

### Scenario 3.
Scenario 3 (ERC1155/TokenBundle): 1) Attacker ensures a fulfillment whose recipient is the splitter, then emits requestArbitration with attacker-chosen payload. 2) Naive oracle posts arbitrate from TrustedOracle with splits (validated or unvalidated variant) that direct ERC1155 tokens or bundle assets to attacker addresses while satisfying total/assignment constraints. 3) collectAndDistribute reads the canonical oracle and stored decision; escrow releases assets to the splitter and the splitter distributes to attacker-chosen recipients.
#### Preconditions / Assumptions
- (a). An ERC1155 or TokenBundle escrow (tierable or non-tierable) with arbiter set to the corresponding splitter and demand encoding TrustedOracle
- (b). The attacker is authorized to call requestArbitration()
- (c). A fulfillment exists whose recipient is the splitter
- (d). The oracle/indexer implementation naively trusts ArbitrationRequested event payloads
- (e). The oracle signs and sends arbitrate() from the TrustedOracle address; splits meet any required totals/assignment validations

#### Proposed fix

##### NativeTokenSplitter.sol

File: `contracts/src/utils/splitters/NativeTokenSplitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/NativeTokenSplitter.sol)

```diff
 ... 69 unchanged lines ...
         if (escrowAttestation.attester != msg.sender && escrowAttestation.recipient != msg.sender)
             revert UnauthorizedArbitrationRequest();
-        emit ArbitrationRequested(_fulfillment, _escrow, oracle, demand);
+        EscrowObligationData memory escrowData = abi.decode(escrowAttestation.data, (EscrowObligationData));
+        DemandData memory canonicalDemand = abi.decode(escrowData.demand, (DemandData));
+        emit ArbitrationRequested(_fulfillment, _escrow, canonicalDemand.oracle, escrowData.demand);
     }
 
 ... 63 unchanged lines ...
```

##### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 103 unchanged lines ...
         if (escrowAttestation.attester != msg.sender && escrowAttestation.recipient != msg.sender)
             revert UnauthorizedArbitrationRequest();
-        emit ArbitrationRequested(_fulfillment, _escrow, oracle, demand);
+        EscrowObligationData memory escrowData = abi.decode(escrowAttestation.data, (EscrowObligationData));
+        DemandData memory canonicalDemand = abi.decode(escrowData.demand, (DemandData));
+        emit ArbitrationRequested(_fulfillment, _escrow, canonicalDemand.oracle, escrowData.demand);
     }
 
 ... 85 unchanged lines ...
```

##### TokenBundleSplitterBase.sol

File: `contracts/src/utils/splitters/TokenBundleSplitterBase.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/TokenBundleSplitterBase.sol)

```diff
 ... 104 unchanged lines ...
         if (escrowAttestation.attester != msg.sender && escrowAttestation.recipient != msg.sender)
             revert UnauthorizedArbitrationRequest();
-        emit ArbitrationRequested(_fulfillment, _escrow, oracle, demand);
+        EscrowObligationData memory escrowData = abi.decode(escrowAttestation.data, (EscrowObligationData));
+        DemandData memory canonicalDemand = abi.decode(escrowData.demand, (DemandData));
+        emit ArbitrationRequested(_fulfillment, _escrow, canonicalDemand.oracle, escrowData.demand);
     }
 
 ... 125 unchanged lines ...
```

##### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 71 unchanged lines ...
         if (escrowAttestation.attester != msg.sender && escrowAttestation.recipient != msg.sender)
             revert UnauthorizedArbitrationRequest();
-        emit ArbitrationRequested(_fulfillment, _escrow, oracle, demand);
+        EscrowObligationData memory escrowData = abi.decode(escrowAttestation.data, (EscrowObligationData));
+        DemandData memory canonicalDemand = abi.decode(escrowData.demand, (DemandData));
+        emit ArbitrationRequested(_fulfillment, _escrow, canonicalDemand.oracle, escrowData.demand);
     }
 
 ... 63 unchanged lines ...
```

### 6. [Informational] Missing payable receive() in ERC1155Splitter (and ERC20Splitter) when forwarding msg.value causes refund-based revert during fulfillment creation

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

ERC1155Splitter.createFulfillment forwards msg.value to arbitrary obligation contracts but cannot accept ETH back (no payable receive/fallback). Obligations that refund excess ETH to the caller (payer) will attempt to send ETH back to the splitter and revert, preventing fulfillment creation and breaking EXECUTOR_SENTINEL-based distributions until retried with exact value.

ERC1155Splitter exposes a payable createFulfillment that forwards msg.value to obligationContract.doObligationRaw. BaseObligation’s hooks treat msg.sender as the payer, which is the splitter in this flow. Some payment-style obligations refund any excess ETH to the payer using a low-level call and revert if the refund fails. ERC1155Splitter lacks a payable receive/fallback, so any refund to it fails and causes the entire call to revert. The result is that fulfillment creation fails, fulfillers[uid] is not recorded, and EXECUTOR_SENTINEL-based distributions cannot proceed until a correct fulfillment is created (e.g., with exact msg.value). No funds are lost because the transaction reverts atomically. The same pattern applies to ERC20Splitter, which also forwards msg.value without a receive().

#### Severity

**Impact Explanation:** [Low] This causes temporary reverts and prevents fulfillment creation (and thus sentinel-based distributions) until retried with correct msg.value. No principal loss or long-term unavailability occurs; there is a straightforward workaround.

**Likelihood Explanation:** [Low] Exploitation depends on user/integration overpayment or dust forwarding, which constitutes user/operator mistakes and is avoidable by sending exact msg.value.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
Overpayment with a refunding obligation: A fulfiller calls ERC1155Splitter.createFulfillment targeting a refunding payment-style obligation, sending msg.value greater than the required amount. The obligation pays the required amount to the payee and tries to refund the excess to payer (the splitter). Because ERC1155Splitter has no payable receive(), the refund fails and the transaction reverts, preventing fulfillment creation and leaving fulfillers[uid] unset, which blocks EXECUTOR_SENTINEL-based splits until retried with exact value.
#### Preconditions / Assumptions
- (a). ERC1155Splitter.createFulfillment is used to create a fulfillment
- (b). The chosen obligation refunds excess ETH to the caller (payer)
- (c). Caller sends msg.value greater than the obligation’s required amount

### Scenario 2.
Relayer/aggregator forwards dust ETH: An integration routes fulfillment creation via ERC1155Splitter to a refunding obligation while a relayer forwards a small extra msg.value (dust). The obligation attempts to refund this dust to the splitter, which cannot receive ETH, causing the call to revert. The fulfillment is not created and sentinel-based distribution later fails due to missing fulfillers[uid].
#### Preconditions / Assumptions
- (a). ERC1155Splitter.createFulfillment is used with a refunding obligation
- (b). A relayer or integration forwards non-zero dust msg.value beyond what is required
- (c). The obligation attempts to refund excess ETH to the caller (the splitter)

### Scenario 3.
Same pattern on ERC20Splitter: A fulfiller uses ERC20Splitter.createFulfillment with a refunding obligation and overpays. The obligation tries to refund excess ETH to the splitter; since ERC20Splitter also lacks a payable receive(), the refund fails, reverting the transaction and preventing fulfillment creation (and any sentinel-based flows relying on fulfillers[uid]).
#### Preconditions / Assumptions
- (a). ERC20Splitter.createFulfillment is used to create a fulfillment
- (b). The chosen obligation refunds excess ETH to the caller (payer)
- (c). Caller sends msg.value greater than the obligation’s required amount

#### Proposed fix

##### ERC1155Splitter.sol

File: `contracts/src/utils/splitters/ERC1155Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC1155Splitter.sol)

```diff
 ... 79 unchanged lines ...
     }
 
-    function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID) external payable returns (bytes32 fulfillmentUid) {
+    function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID) external returns (bytes32 fulfillmentUid) {
         fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
         fulfillers[fulfillmentUid] = msg.sender;
 ... 55 unchanged lines ...
```

##### ERC20Splitter.sol

File: `contracts/src/utils/splitters/ERC20Splitter.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/utils/splitters/ERC20Splitter.sol)

```diff
 ... 121 unchanged lines ...
 
     function createFulfillment(address obligationContract, bytes calldata data, uint64 expirationTime, bytes32 refUID)
-        external payable returns (bytes32 fulfillmentUid)
+        external returns (bytes32 fulfillmentUid)
     {
         fulfillmentUid = IObligation(obligationContract).doObligationRaw{value: msg.value}(data, expirationTime, refUID);
 ... 67 unchanged lines ...
```

### 7. [Informational] Payable function without value handling in BaseObligation.doObligationRaw causes self-inflicted stuck ETH

#### Status

Review status: Unresolved
Remediation status: Unremediated
Remediation note: Created by pipeline analysis

#### Description

BaseObligation.doObligationRaw is public payable but does not use msg.value. In non-ETH obligations (e.g., CommitRevealObligation), successful calls with nonzero ETH retain it in the contract with no general withdrawal path. Typical usage avoids this via non-payable wrappers; ETH-forwarding obligations correctly forward value. This is a UX/hardening footgun, not attacker-exploitable.

BaseObligation.doObligationRaw is payable and calls _doObligationForRaw, which neither uses nor refunds msg.value. _attest forwards value=0 to EAS. _beforeAttest is a virtual hook; in obligations that do not override it to handle ETH (e.g., CommitRevealObligation), a successful doObligationRaw call with attached ETH will leave that ETH in the contract balance with no generic withdrawal. Most obligations inherit SchemaResolver’s receive() that rejects plain ETH transfers (NotPayable), so accidental direct sends fail for those. HookEscrowObligation legitimately forwards msg.value to its IEscrowHook in _lockEscrow, avoiding stranding via function calls, but its overridden payable receive() will accept direct ETH transfers that remain idle. Overall, only the sender can cause ETH to be stranded by misusing a payable entrypoint or sending ETH directly; there is no attacker-driven extraction.

#### Severity

**Impact Explanation:** [Informational] Only the sender’s own ETH can be stranded due to misuse of a payable entrypoint or direct transfer; no third-party loss, theft, or core functionality breakage.

**Likelihood Explanation:** [Low] Requires user or integrator error and nonstandard entrypoint usage; most obligations reject plain ETH transfers via SchemaResolver’s NotPayable receive, reducing accidental occurrence.

#### Exploitation

## Exploitation Scenarios:

### Scenario 1.
CommitRevealObligation: A caller with a valid commitment uses doObligationRaw with correct reveal data and attaches nonzero msg.value; the transaction succeeds and the extra ETH remains in the contract with no general withdrawal.
#### Preconditions / Assumptions
- (a). A valid commitment exists and the reveal is within deadline and from a prior block
- (b). Caller uses doObligationRaw instead of the non-payable wrappers
- (c). Caller attaches nonzero ETH (msg.value > 0)
- (d). Attestation flow succeeds

### Scenario 2.
HookEscrowObligation: A user sends ETH directly to the contract address (its receive() is payable); the ETH is accepted but not forwarded to any hook and remains idle with no general withdrawal.
#### Preconditions / Assumptions
- (a). HookEscrowObligation is deployed and its receive() accepts ETH
- (b). User performs a direct ETH transfer to the contract address
- (c). No function call is made to forward or utilize the ETH

### Scenario 3.
Mis-integration: An integrator calls doObligationRaw on a non-ETH obligation and unintentionally includes msg.value > 0; the call succeeds and the ETH remains stuck in the contract.
#### Preconditions / Assumptions
- (a). An external integrator chooses the low-level doObligationRaw entrypoint on a non-ETH obligation
- (b). Integrator’s call includes unintended nonzero msg.value
- (c). Attestation flow succeeds (e.g., valid reveal for CommitRevealObligation)

#### Proposed fix

##### BaseObligation.sol

File: `contracts/src/BaseObligation.sol`

[Source](https://github.com/arkhai-io/alkahest/blob/a58d257230007b0bab4a9727726d0c97afb5bc57/contracts/src/BaseObligation.sol)

```diff
 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.26;
 
 import {BaseAttester} from "./BaseAttester.sol";
 import {IEAS} from "@eas/IEAS.sol";
 import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
 import {Attestation} from "@eas/Common.sol";
 import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
 
 abstract contract BaseObligation is BaseAttester, ReentrancyGuard {
+    error NoEthAccepted();
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
+        if (msg.value != 0) revert NoEthAccepted();
         uid_ = _doObligationForRaw(
             data,
 ... 31 unchanged lines ...
```
