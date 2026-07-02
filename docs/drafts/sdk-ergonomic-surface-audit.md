# SDK Ergonomic Surface Audit

Status: draft

Scope: production-facing Alkahest contracts compared against TypeScript, Rust, and Python SDK ergonomic clients. Generated raw contract bindings are not counted as ergonomic coverage. Examples, abstract/base contracts, interfaces, third-party EAS/token interfaces, and ordinary inherited methods such as `supportsInterface`, `version`, raw EAS resolver hooks, and raw `attest`/`revoke` helpers are out of scope unless they represent an intended user workflow.

## Findings

### 1. Arbiter `check` Methods Are Not Ergonomically Exposed

Arbiter `check` methods are useful outside the on-chain escrow lifecycle. They let clients ask whether a fulfillment would satisfy a demand before submitting a transaction, and they also let off-chain or hybrid systems reuse the same packaged arbiters for validation. For example, an off-chain fiat escrow service could use the same arbiter contracts to validate EAS attestations without routing through an Alkahest escrow contract.

Status: addressed. The SDKs now expose generic arbiter `check` helpers:

- TypeScript: `client.arbiters.check(arbiter, fulfillment, demand, escrowUid)`, where `arbiter` may be a packaged arbiter key or raw address.
- Rust: `client.arbiters().check(arbiter, fulfillment, demand, escrow_uid)`.
- Python: `client.arbiters.check(arbiter, fulfillment, demand, escrow_uid)`.

Affected contracts:

- `AllArbiter`
- `AnyArbiter`
- `AttesterArbiter`
- `CommitmentTrustedOracleArbiter`
- `ERC8004Arbiter`
- `IntrinsicsArbiter`
- `RecipientArbiter`
- `ReferencesEscrowArbiter`
- `RefUidArbiter`
- `RevocableArbiter`
- `SchemaArbiter`
- `TimeArbiter` variants
- `TrivialArbiter`
- `TrustedOracleArbiter`
- confirmation arbiters

Note: splitter clients also implement `IArbiter.check`. TypeScript exposes splitter `check` helpers, but Rust/Python splitter clients are covered separately below because their broader operational surface is missing.

### 2. Rust/Python Splitter Clients Are Codec/Address Only

TypeScript exposes operational splitter clients for default and commitment splitter variants, including:

- `arbitrate`
- `requestArbitration`
- `createFulfillment`
- `collectAndDistribute`
- `unsafePartiallyCollectAndDistribute`
- `getSplits`
- `hasDecision`
- commitment attestation/fulfillment intent hash helpers
- commitment `createFulfillmentAndCollectAndDistribute`

Rust and Python currently expose splitter addresses, asset/target address selection, demand codecs, split codecs, and decision key helpers, but not the operational transaction/read methods above.

Status: addressed. Rust and Python now expose operational splitter helpers matching the TypeScript surface, including amount and bundle arbitration, arbitration requests, fulfillment creation, collection/distribution, split reads, decision reads, and commitment intent hash helpers. The SDKs keep the variant selection explicit by accepting the packaged splitter contract key.

Affected contracts:

- `ERC20Splitter`
- `ERC1155Splitter`
- `NativeTokenSplitter`
- `TokenBundleSplitter`
- `TokenBundleSplitterUnvalidated`
- `CommitmentERC20Splitter`
- `CommitmentERC1155Splitter`
- `CommitmentNativeTokenSplitter`
- `CommitmentTokenBundleSplitter`
- `CommitmentTokenBundleSplitterUnvalidated`

### 3. Rust/Python Commitment Trusted Oracle Surface Is Incomplete

TypeScript exposes a distinct `CommitmentTrustedOracleArbiter` ergonomic client with:

- `encodeDemand`
- `decodeDemand`
- `attestationIntentHash`
- `decisionKeyFor`
- `arbitrate`
- `requestArbitration`
- `getArbitrationRequests`
- `getArbitrationDecisions`

Rust and Python expose trusted-oracle address selection for fulfillment vs commitment variants, but their ergonomic trusted-oracle methods still target the fulfillment-based `TrustedOracleArbiter` workflow.

Status: addressed. Rust and Python now expose commitment trusted-oracle helpers for demand encoding/decoding, attestation intent hashes, decision keys, arbitration requests, arbitration writes, and request/decision log reads. The legacy `oracle` module and the `arbiters.trusted_oracle` accessor both carry the commitment arbiter address.

Affected contract:

- `CommitmentTrustedOracleArbiter`

### 4. TypeScript Attestation Escrow Namespace Does Not Expose Unconditional Variants

Rust and Python expose the full attestation escrow variant set:

- attestation-value default escrow
- attestation-value unconditional escrow
- attestation-reference default escrow
- attestation-reference unconditional escrow

TypeScript currently exposes only:

- `attestation.escrow.default`
- `attestation.escrow.reference`

The TypeScript namespace has deployed addresses and generated bindings for the unconditional contracts, but no ergonomic wrapper endpoints matching the other SDKs.

Status: addressed. TypeScript now exposes `attestation.escrow.unconditional` and `attestation.escrow.referenceUnconditional`, plus `byChecks(...)` and `byStorageAndChecks(...)` selectors for the attestation-value and attestation-reference variants.

Affected contracts:

- `UnconditionalAttestationEscrowObligation`
- `UnconditionalAttestationReferenceEscrowObligation`

### 5. AtomicAttestationUtils Is Only Ergonomically Surfaced In TypeScript

TypeScript exposes ergonomic helpers for:

- `attestAndCreateReferenceEscrow`
- `attestAndCreateUnconditionalReferenceEscrow`

Rust and Python include generated contract bindings and deployed addresses, but do not currently expose ergonomic client methods for the atomic attestation-reference escrow flows.

Status: addressed. Rust now exposes atomic attestation-reference escrow helpers on `attestation().util()`, including default and unconditional reference escrow variants. Python exposes matching `client.attestation.util.attest_and_create_reference_escrow(...)` and `attest_and_create_unconditional_reference_escrow(...)` helpers.

Affected contract:

- `AtomicAttestationUtils`

### 6. Hook Approval And Hook Operation Surfaces Are Uneven

TypeScript has higher-level hook-based helpers, including hook data codecs, token approvals, hook approvals, and deposit reads.

Rust and Python primarily expose hook-based escrow data codecs and addresses. They do not appear to expose ergonomic hook helpers for the user-facing approval and inspection workflow:

- `approveEscrow`
- `unapproveEscrow`
- `isEscrowApproved`
- `approvedEscrows`
- hook-specific `encodeHookData` / `decodeHookData`
- hook-specific deposit reads where applicable

The approval methods are the most important part of this gap because users must approve packaged escrow contracts before using packaged hooks.

Status: addressed. TypeScript now exposes hook-local `approveEscrow`, `unapproveEscrow`, `isEscrowApproved`, and `approvedEscrows` helpers on each packaged hook client. Rust exposes packaged hook approval helpers, typed hook data codecs, and deposit/pending reads on `HookBasedModule`. Python exposes matching approval helpers, hook data encode/decode helpers, and deposit/pending reads on `client.hook_based`.

Affected contracts:

- `ApprovedEscrowHook`
- `AttestationEscrowHook`
- `AttestationReferenceEscrowHook`
- `ERC20EscrowHook`
- `ERC721EscrowHook`
- `ERC1155EscrowHook`
- `NativeTokenEscrowHook`
- `TokenBundleEscrowHook`

## Covered Or Intentionally Out Of Scope

The core escrow and payment obligation workflows are broadly covered across all SDKs:

- create / pay
- approve-and-create / approve-and-pay
- permit paths where applicable
- collect
- reclaim expired escrow
- atomic payment and collect
- obligation and demand codecs
- default vs unconditional escrow variant selectors for non-attestation token families

The following are not treated as missing ergonomic surfaces in this audit:

- generated raw contract bindings
- example contracts
- abstract/base contracts and interfaces
- third-party EAS, schema registry, ERC20, ERC721, and ERC1155 interfaces
- inherited `supportsInterface`, `version`, schema constant, and owner/admin methods unless part of a specific intended workflow
