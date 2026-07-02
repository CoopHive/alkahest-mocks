# Audit Agent And Octane 2026-04 Triage

Tracking audit items that were reviewed and classified as fixed, accepted,
deferred, or not issues. Use absolute commit hashes for completed changes so the
record remains stable over time.

Report files:

- `../reports/audit-agent-2026-06-23.pdf`
- `../reports/octane-2026-04-13-1.md`
- `../reports/octane-2026-04-13-2.md`

## Fixed

### audit_agent_report_7: Commit-Reveal Reveal Caller Binding

Status: fixed.

Report item: `../reports/audit-agent-2026-06-23.pdf`,
finding 6.

Completed by `20e8b29a87f645bf34562e50c54cca1c779a9004`.

`CommitRevealObligation` and the example `GlobalBondCommitRevealObligation`
now require the stored committer, reveal caller, and fulfillment attestation
recipient to be the same address. This prevents a third party from copying a
pending reveal and consuming the commitment, including the splitter-specific
case where an attacker could previously create a splitter-addressed fulfillment
without going through splitter fulfillment recording.

### audit_agent_report_7: EAS Expiration Sentinel In Comparison Arbiters

Status: fixed.

Report item: `../reports/audit-agent-2026-06-23.pdf`,
finding 7.

Completed by `2a570e16c3dc7cab990d87c47fd2cca5e01ede8d`.

`ExpirationTimeAfterArbiter` and `ExpirationTimeBeforeArbiter` now treat
`expirationTime == 0` as the EAS non-expiring sentinel rather than as numeric
zero. Non-expiring attestations satisfy "after any finite threshold" checks and
fail "before a finite threshold" checks. `ExpirationTimeEqualArbiter` remains
unchanged because exact equality to zero has fixed EAS semantics: requiring a
non-expiring attestation.

### audit_agent_report_7: Duplicate Token Bundle Splitter Entries

Status: fixed.

Report item: `../reports/audit-agent-2026-06-23.pdf`,
finding 9.

Completed by `564d996378686ab8cf8e02fa4410259831f67dac`.

`TokenBundleSplitterBase` now verifies collection deltas once per unique ERC20
token and once per unique ERC1155 `(token, tokenId)` pair, comparing each
observed balance delta against the summed expected amount for matching bundle
entries. Duplicate bundle entries remain valid and position-based distribution
semantics are preserved.

### audit_agent_report_7: Zero-Native Token Bundle Stray ETH

Status: fixed.

Report item: `../reports/audit-agent-2026-06-23.pdf`,
findings 10 and 11.

Completed by `31954b34988727e28123869def7d4b9008c45251`.

Default and unconditional token-bundle escrow obligations now enforce
`msg.value == nativeAmount` for every bundle, including token-only bundles with
`nativeAmount == 0`. This prevents accidental native token value from being
accepted without being represented in the escrow attestation and later
released or reclaimed.

### audit_agent_report_7: Duplicate ERC20 Atomic Bundle Permits And Approvals

Status: fixed.

Report item: `../reports/audit-agent-2026-06-23.pdf`,
finding 13.

Completed by `7f2f42477b929ba669ffebec1b5181b0fb946437`.

`AtomicPaymentUtils` now treats duplicate ERC20 entries in bundle payments as
valid position-based transfers while aggregating permit and approval allowances
once per unique ERC20 token in first-occurrence order. This preserves
per-transfer payment semantics and avoids final duplicate entries overwriting
the allowance required for the full bundle amount.

### audit_agent_report_7: ERC20 Permit Front-Run DoS In Atomic Payments

Status: fixed.

Report item: `../reports/audit-agent-2026-06-23.pdf`,
finding 14.

Completed by `9ec044fdb19924e0f1859f4a1bef4e146c381137`.

`AtomicPaymentUtils` now tolerates an already-consumed ERC20 permit when the
permit has established sufficient allowance for the utility contract. This
prevents a copied permit transaction from griefing the atomic payment flow while
still reverting if the required allowance is not present.

### audit_agent_report_7: Token Bundle Unsafe Partial Collection Authorization

Status: fixed for authorization; superset matching remains intended behavior.

Report item: `../reports/audit-agent-2026-06-23.pdf`,
finding 17.

Completed by:

- `0d5a750fdd2c41a682e9f7a3ced6f1b5bc9e3283`
- `117f069cff180dd5e3885b80b4a596e1862a6eaa`

Unsafe partial token-bundle collection can no longer be triggered
permissionlessly by third parties or blocked by checking the escrow creator
instead of the fulfillment recipient. The fulfiller whose fulfillment satisfies
the escrow is the party authorized to use the destructive partial collection
escape hatch.

The remaining premise that bundle escrow arbiters can accept fulfillments with
additional bundle items is intentional. Escrow demands define the required
prefix/minimum consideration; extra fulfillment data can represent additional
assets, policy metadata, or composition with broader flows. Applications that
need exact bundle equality should encode that as stricter arbiter policy.

### audit_agent_report_7: Commit-Reveal Deadline Mutation

Status: fixed.

Report item: `../reports/audit-agent-2026-06-23.pdf`,
finding 18.

Completed by `91328e5aaaa83ad0061d6255064ba5d931064bed`.

`CommitRevealObligation` no longer has an owner-controlled global reveal
deadline. The relative reveal deadline is part of `DemandData`, and commitments
record the demand deadline supplied by the committer. `check` requires the
stored deadline to match the escrow demand and enforces reveal time against that
stored value; `slashBond` also uses the stored deadline. The slashed-bond
recipient remains contract-level treasury/burn policy.

### analysis(1): Splitter Public Execute Reentrancy

Status: fixed.

Report item: `../reports/octane-2026-04-13-2.md`, issue 1.

Completed by `ed826e02d8a9b65403b2b052d0ceade8fc6ba229` and
`173d34cc14104d8f77a8325fb1799f80ccf9655e`.

The old public splitter `execute()` path was removed and replaced with
`createFulfillment()`. Shared splitter orchestration now validates created
fulfillments and records the fulfiller without exposing cross-function executor
state.

### analysis(1): Commit-Reveal Enforcement and Bond Accounting

Status: fixed.

Report items:

- `../reports/octane-2026-04-13-2.md`, issue 2.
- `../reports/octane-2026-04-13-2.md`, warning 1.

Completed across:

- `e73871ed463221978b964e3296c0d31bdfda2858`
- `a11f8b568b48bfa80d0aae5da99aa514d7e47c87`
- `b38ac88a97ec3f68a5f506175100fec6aba10978`
- `fd47376bf09f917af30c0a9f70a283a654993908`

Commit-reveal now enforces the reveal path, supports atomic reveal-and-collect
for escrow settlement, snapshots or stores the relevant bond amount, and offers
the per-demand/per-commit bond variant as the default
`CommitRevealObligation`.

### analysis(1): Splitter Fulfillment and Escrow Binding

Status: fixed.

Report items:

- `../reports/octane-2026-04-13-2.md`, issue 3.
- `../reports/octane-2026-04-13-2.md`, issue 10.
- `../reports/octane-2026-04-13-2.md`, warning 6.

Completed across:

- `7b49e0cac36dc1383f6bf67da5fcf2e23e20d479`
- `e8527db30850b95b5f9b9a62f11b30b4e1bdbfe8`
- `ef5c192410a134c2315251e838da1035df3fa5d1`
- `4263e23155a59acd58dae497f7a982b6e5d89fa1`
- `b7c4aac06bdeb240cbb3b287753306b79381945c`
- `173d34cc14104d8f77a8325fb1799f80ccf9655e`

Splitter decisions are keyed to `(fulfillment, escrow)`, created fulfillments
are validated and bound to the splitter, escrow collection receipts are checked,
and native-token refunds from fulfillment creation are proxied back to the
fulfiller rather than becoming splitter-held surplus.

### analysis(1): Splitter Array and Loop Bounds

Status: fixed.

Report items:

- `../reports/octane-2026-04-13-2.md`, issue 14.
- `../reports/octane-2026-04-13-2.md`, issue 22.
- `../reports/octane-2026-04-13-2.md`, issue 27.
- `../reports/octane-2026-04-13-2.md`, warning 4.

Completed across:

- `b723c646a9baa88c7131d88f3d62b06eab100de4`
- `09e498aebe056151b3dd690ec0cb8dfd13de0b6d`
- `eae63e650bf424fd2b98b2876959a2e57b992bfb`

Stored settlement arrays and logical arbiter arrays are bounded, bundle splitter
decision arrays are cleared correctly before replacement, and empty ERC721
assignment edge cases are validated.

### analysis(1): Attestation Hook Pending State and Binding

Status: fixed.

Report items:

- `../reports/octane-2026-04-13-2.md`, issue 8.
- `../reports/octane-2026-04-13-2.md`, warning 8.

Completed across:

- `2a1d31233104839760a8501232e9479f3daad678`
- `ced931cd74d3a5fd35d82a1b40cd75c6f3ef3e28`
- `26226a81e6ffb50898269200f89016e6ef476291`
- `8f1cd403cd82f29b550cd53348d4c3e7df21a012`
- `69b9048091d3ac2ef571620877a30cc66c2d8432`

Attestation hook pending state now avoids single-bit collisions, validation
attestations are bound to escrow lifecycle context, and hook-based escrows have
post-attest context including the created EAS UID.

### analysis(1): Paid Attestation Escrow Settlement

Status: fixed.

Report item: `../reports/octane-2026-04-13-2.md`, issue 21.

Completed by `a8439519c5a4b6083776e3b1e8cc73e44c5434ec`.

Attestation escrow settlement supports paid EAS attestations so escrowed
attestation delivery remains compatible with payable resolvers.

### analysis(1): ERC1155 Escrow Receiver Forwarding

Status: fixed.

Report item: `../reports/octane-2026-04-13-2.md`, issue 25.

Completed by `5c03d3a3f00fe9dbcd06175806de80bf726c3b3e`.

ERC1155 escrow release no longer relies on an invalid recipient post-transfer
balance invariant that could fail when receivers forward tokens in their
callback.

### analysis(1): ERC721 Payment Transfer Proof

Status: fixed.

Report item: `../reports/octane-2026-04-13-2.md`, issue 10.

Completed by `1b5738b11f509374c9f9c4ef82e4210a84214b3c`.

`ERC721PaymentObligation` now rejects non-contract token addresses and verifies
`ownerOf(tokenId) == payee` after `transferFrom`, so a non-reverting call alone
cannot mint a payment attestation. The same post-transfer ownership proof was
added to `TokenBundlePaymentObligation` for ERC721 items in mixed payment
bundles.

The default and unconditional ERC721 escrow obligations were already covered:
their lock and release paths check ERC721 ownership before and after transfer,
and the ERC721 escrow hook follows the same pattern.

### analysis(1): Raw Native Receivers

Status: fixed.

Report item: `../reports/octane-2026-04-13-2.md`, warning 7.

Completed across:

- `6348408ead79fd85ea9a73eb295f1394061c51f2`
- `d9ffc71094db7eefd49ae38f8d4be349196161a2`

Unnecessary raw `receive()` entrypoints were removed or guarded so direct native
token transfers do not create silent out-of-system balances.

### analysis(1): Schema Reuse for Attestation Escrows

Status: fixed.

Report item: `../reports/octane-2026-04-13-2.md`, issue 31.

Completed by `ebe3abcf1b7ada0910ca61da8b641fd939d8757f`.

Escrow contracts now reuse existing EAS schemas where possible rather than
registering unnecessary duplicate schemas during construction.

### analysis(1): Attestation Reference Certification Properties

Status: fixed for hardcoded certification lifetime; referenced-attestation
freshness remains integration policy.

Report item: `../reports/octane-2026-04-13-2.md`, issue 18.

Completed by `53ef8ee11b4da1c63cb6a5873b205432356bc079`.

`AttestationEscrowObligation2` was renamed to
`AttestationReferenceEscrowObligation`, with the matching unconditional and hook
variants renamed as well. The reference escrow data now configures the produced
validation attestation's `expirationTime` and `revocable` flag, so the contract
no longer forces all certification attestations to be permanent and
irrevocable.

The contract still does not check freshness, schema, or provenance of the
referenced attestation. That remains an integration-level interpretation:
downstream consumers that require current validity must check the referenced EAS
attestation directly or compose explicit arbiters/policy.

### ERC-8004 Validation Binding

Status: fixed.

Completed by `49825afc14c68869934f24f74acfbccaf749e158`.

Report items:

- `../reports/octane-2026-04-13-2.md`, issue 9.
- `../reports/octane-2026-04-13-2.md`, warning 3 request-hash variant.

`ERC8004Arbiter.DemandData` now includes caller-supplied `bytes data`, and the
ERC-8004 validation request hash is derived from the fulfillment UID and that
data with `keccak256(abi.encode(uid, data))`.

### analysis(1): Fulfillment Liveness Defaults and Confirmation Existence

Status: fixed for default escrows; explicit escape hatch retained.

Report items:

- `../reports/octane-2026-04-13-2.md`, issue 6.
- `../reports/octane-2026-04-13-2.md`, confirmation invalid-UID
  variant.
- `../reports/octane-2026-04-13-2.md`, warning 11.

Completed across:

- `b78de3accd9ef8655ad978bc31266c30b4530785`
- `28c5d078b08ff5396936e84951a5fac208ebc662`

Default escrow contracts require the fulfillment attestation to exist, reference
the escrow, and pass intrinsic liveness checks before calling the configured
arbiter. The unconditional escrow contracts intentionally omit those default
checks as the explicit escape hatch for custom arbiter policy.

Confirmation arbiters now reject confirmations for missing fulfillment UIDs at
confirmation time, preventing irreversible confirmation slots from being
consumed by nonexistent attestations.

### analysis(1): Token Bundle Unsafe Partial Settlement Authorization

Status: fixed.

Report items:

- `../reports/octane-2026-04-13-2.md`, issue 7.
- `../reports/octane-2026-04-13-2.md`, atomic push / unsafe
  partial related variant.

Completed by `0d5a750fdd2c41a682e9f7a3ced6f1b5bc9e3283`.

Token bundle unsafe partial collection and unsafe partial reclaim remain
available as explicit last-resort escape hatches, but can no longer be triggered
permissionlessly by third parties. The escrow recipient must opt into the
destructive partial path.

### analysis(1): ERC-8004 Pending Request Threshold

Status: fixed.

Report item: `../reports/octane-2026-04-13-2.md`, issue 8.

Completed by `ced4c99c2439567d0a2424846df3f89192283538`.

`ERC8004Arbiter` now requires `minResponse` to be in `1..100`. The vendored
ERC-8004 validation registry does not expose `hasResponse` from
`getValidationStatus`, so a response value of `0` cannot be safely distinguished
from a pending validation request.

## Not Issues

### audit_agent_report_7: Attestation Hook Direct Calls

Status: intended responsibility split.

Report item: `../reports/audit-agent-2026-06-23.pdf`,
finding 12.

Attestation hooks do not have intrinsic protocol authority or reputation merely
because they can issue EAS attestations. The content of the attestation and the
consumer's chosen trust policy determine whether it matters. A downstream
consumer that treats a hook contract's attester identity as authoritative
without checking the relevant escrow provenance has selected an insufficient
policy. Escrow provenance can be encoded and checked by the integration when it
is required, but the hook contract should not constrain all schemas or
attestation contents to enforce that policy globally.

### audit_agent_report_7: ERC1155 Transfer Semantics

Status: intended token-defined semantics.

Report item: `../reports/audit-agent-2026-06-23.pdf`,
findings 15 and 16.

Escrow ERC1155 lock paths already verify that the escrow or hook receives the
amount it later promises to release. Release, return, and splitter distribution
paths intentionally do not enforce recipient balance deltas: once a valid claim
or reclaim happens, the contract should attempt delivery and should not keep
assets locked forever because a token has non-standard outbound semantics.

Payment obligation attestations are likewise not normalized claims that a
payee's ERC1155 balance increased by exactly `amount`. They attest that the
payment obligation contract executed the encoded token transfer action
atomically with attestation creation, and the token address is part of that
attested fact. Consumers that require stricter ERC1155 balance semantics should
restrict accepted token contracts or compose additional policy.

### analysis(1): Example Contracts

Status: out of production security scope.

Report items:

- `../reports/octane-2026-04-13-2.md`, issue 26.
- `../reports/octane-2026-04-13-2.md`, issue 33.
- `../reports/octane-2026-04-13-2.md`, issue 34.
- `../reports/octane-2026-04-13-2.md`, issue 35.
- `../reports/octane-2026-04-13-2.md`, issue 17.
- `../reports/octane-2026-04-13-2.md`, issue 19.
- `../reports/octane-2026-04-13-2.md`, issue 17 in warnings.
- `../reports/octane-2026-04-13-2.md`, issue 19 in warnings.
- `../reports/octane-2026-04-13-2.md`, `StringResultObligation`
  length-only variant.
- `../reports/octane-2026-04-13-2.md`, `ApiCallExample1/2`
  nonzero-oracle variant.
- `../reports/octane-2026-04-13-2.md`, `VoteEscrowObligation`
  support-range, external-call, and data-hash variants.
- `../reports/octane-2026-04-13-2.md`, `MajorityVoteArbiter`
  unchecked-subtraction variant.

Example contracts are not production protocol components and are not intended to
be secure building blocks. We are not patching example-only issues as part of
the production audit work.

### analysis(1): Logical Arbiter Empty Semantics

Status: intended behavior.

Report items:

- `../reports/octane-2026-04-13-2.md`, issue 4.
- `../reports/octane-2026-04-13-2.md`, issue 17.
- `../reports/octane-2026-04-13-2.md`, order-sensitive
  `AllArbiter` variant.

`AllArbiter([])` returning true and `AnyArbiter([])` returning false are
intentional logical semantics, matching common precedent such as Python's
`all([])` and `any([])`. Reverts from child arbiters are part of the configured
composition behavior rather than an arbiter-level vulnerability.

### analysis(1): Recipient Policy

Status: intended responsibility split.

Report items:

- `../reports/octane-2026-04-13-2.md`, issue 18.
- `../reports/octane-2026-04-13-2.md`, issue 13 recipient-binding
  variant.
- `../reports/octane-2026-04-13-2.md`, issue 14.
- `../reports/octane-2026-04-13-2.md`, warning 4 recipient
  capability variants.
- `../reports/octane-2026-04-13-2.md`, warning 6 self-recipient
  variant.

Recipient selection is intentionally controlled by the escrow creator, fulfiller,
or splitter oracle depending on the flow. The core contracts should not
blacklist `address(0)`, `address(this)`, repository contracts, or contracts that
may reject or gas-grief token callbacks. When a flow needs recipient binding or
recipient capability guarantees, it should use explicit arbiters such as
`RecipientArbiter`, SDK/application checks, or oracle-side policy.

### analysis(1): Attestation Escrow as Arbiter

Status: intended responsibility split.

Report items:

- `../reports/octane-2026-04-13-2.md`, issue 13.
- `../reports/octane-2026-04-13-2.md`, promise-only arbiter
  variant.

The `IArbiter` implementation bundled with escrow obligations answers whether
an attestation represents an escrow with the demanded parameters. It does not
mean the escrow has already been collected or that the escrowed action has
already been delivered. This is consistent across escrow contracts.

For attestation escrows specifically, v1 remains the deferred EAS attestation
path and supports paid EAS attestations by locking the required native value at
escrow creation. Non-atomic integrations that transfer value before collecting
the attestation escrow are responsible for feasibility checks or should use an
atomic utility path. The arbiter method should not be changed to encode delivery
semantics that differ from the rest of the escrow family.

### analysis(1): BarterUtils Proxy/Clone Deployment

Status: deployment-mode constraint.

Report item: `../reports/octane-2026-04-13-2.md`, issue 15.

The BarterUtils contracts are ordinary constructor-initialized helper contracts,
and the repository deployment paths instantiate them directly. Deploying these
contracts behind a proxy or ERC-1167 clone without an initializer leaves proxy
or clone storage uninitialized, which is expected deployer misuse rather than a
protocol vulnerability.

Adding initializer or setter variants would increase the API and introduce
administrative mutation surface for helper contracts that do not otherwise need
upgradeability. A separate follow-up tracks a narrower BarterUtils cleanup:
preserve EOA atomic settlement helpers where useful, but consider removing the
large matrix of typed listing helpers that can be handled by SDK calls to the
core escrow contracts.

### analysis(1): User-Selected Arbiter and Registry Policy

Status: intended responsibility split.

Report items:

- `../reports/octane-2026-04-13-2.md`, issue 5.
- `../reports/octane-2026-04-13-2.md`, registry-call variant.
- `../reports/octane-2026-04-13-2.md`, issue 12.
- `../reports/octane-2026-04-13-2.md`, permissive-arbiter variant.

Escrow creators choose their arbiter, arbiter demand, and external registry
configuration. The protocol supports arbitrary arbiters and registries; a bad or
malicious configured arbiter is a configuration failure, not a protocol bug.
SDKs and applications may provide safer defaults or warnings, but the contracts
should not centralize allowlists for user-selected policy components.

### Oracle Arbitration Request Payloads

Status: no contract change.

Report item: `../reports/octane-2026-04-13-2.md`, issue 16.

Splitter `requestArbitration` events are non-authoritative hints, matching the
general oracle-request pattern used by `TrustedOracleArbiter`. A caller-chosen
event payload does not authorize settlement.

`TrustedOracleArbiter` intentionally separates the outer escrow demand
`DemandData { oracle, data }` from the inner oracle demand bytes. The outer
`oracle` selects the trusted decision maker, while `data` is the payload the
oracle signs off on by calling `arbitrate(obligationUid, data, decision)`.
Oracle integrations must decode the escrow demand and submit the inner demand
bytes; echoing the outer demand bytes is an integration error. The
`requestArbitration` event's indexed oracle parameter is likewise a routing hint,
not an authorization source, and off-chain services should verify it against the
decoded demand before acting on it.

The splitter decision model intentionally differs from `TrustedOracleArbiter`.
`TrustedOracleArbiter` keys decisions by `(obligation uid, demand data)` because
the arbiter has no escrow-specific asset context. Splitters key decisions by
`(fulfillment uid, escrow uid)` because each split decision is a distribution of
one specific escrow's locked assets. The escrow's local demand selects the
expected oracle during `checkObligation`, so spoofed request events cannot make a
splitter check pass.
