# Audit Follow-Ups

Tracking larger compatibility-aware follow-ups from audit triage. Keep completed
items in this document, marked as done, until the whole follow-up set is
finished.

## Remaining

### [ ] Filecoin Calibration Deployment Compatibility

Filecoin Calibration should be treated as a chain-specific deployment
compatibility target, not as a reason to change default resolver inheritance or
schema registration semantics. Default contracts should keep upstream EAS
`SchemaResolver` behavior and normal `SchemaRegistryUtils.registerOrReuse(...)`.

If Calibration deployment continues to fail on constructor-time schema lookups,
use an explicit compatibility deploy path that opts into
`CompatibilitySchemaRegistryUtils` or an equivalent direct-registration flow.
This path should be selected by deploy tooling for the affected chain/version,
not by default protocol contracts.

### [ ] SDK Deployment Utilities

Promote the current SDK test setup utilities into reusable deployment helpers.
They should distinguish between deploying to an already-running Anvil endpoint
and spawning/managing their own Anvil instance. The managed-Anvil mode remains
the default test harness path, while the running-Anvil mode should behave like
any other explicit RPC target.

The helpers should accept target chain/RPC settings, deploy EAS or consume
existing EAS + Schema Registry addresses, deploy Alkahest contracts, and
optionally deploy or seed mock state. Chain-specific compatibility choices,
such as schema-registration behavior needed for Filecoin Calibration, should
live in these deploy helpers or deploy scripts rather than changing default
protocol contract architecture.

### [ ] Python SDK API and Docs Alignment

The Python SDK reference still describes the legacy `barter_utils` /
`barter` surface and attestation `v1` / `v2` naming. Keep the page marked as
legacy until the Python SDK is aligned with the current TypeScript/Rust
surface: `default` / `unconditional` escrows, `default` / `reference`
attestation escrows, and `AtomicPaymentUtils` helpers exposed from payment
clients.

## Done

### [x] SDK Contract Coverage

Generated raw bindings cover the deployable non-example contract surface, but
the ergonomic SDK clients and address maps still need explicit coverage for
newer hook-based escrow and splitter contracts.

Added TypeScript and Rust SDK coverage for hook-based escrow obligations,
bundled escrow hooks, and splitter contracts. Address maps and local deploy
helpers now include these contracts, with published network maps using explicit
zero-address placeholders until deployed.

`SchemaRegistryUtils` is not part of that missing external surface. It is an
internal Solidity library used by escrow contracts to register or reuse schemas.
The SDKs do not need a deployed-address entry or contract client for it. If
useful, its pure UID derivation can be mirrored later as an SDK helper rather
than as a contract binding.

### [x] SDK Atomic Payment Namespaces

Completed by `e134a166fb2c1ce6cc6b1ad2d18628ded7f214fe`.

The ergonomic SDK APIs no longer expose a separate `barter`/`barterUtils`
namespace for atomic payment settlement. Atomic payment helpers now live under
each token payment client, e.g. `erc20.payment.payErc20AndCollect(...)`, while
raw generated contract bindings continue to mirror the Solidity contract
organization.

Address/config fields were renamed from `*BarterUtils` / `barter_utils` to
`*AtomicPaymentUtils` / `atomic_payment_utils`. Attestation atomic helpers use
`atomic_attestation_utils` on the Rust side to avoid conflating them with
payment routing.

### [x] BarterUtils Surface Area

Completed by `0f13fd47bc9761b188d61adb187211aa7564b4fa`.

BarterUtils contracts are now EOA atomic settlement routers. Their retained
`pay*` methods create the payment fulfillment and collect the matching escrow
in the same transaction, which a plain client cannot replicate without a smart
account or router.

The typed `buy*` escrow-creation conveniences were removed from the Solidity
utilities and from the production SDK APIs. Escrows are created through the
core escrow clients/contracts, while BarterUtils handle only the optional
atomic settlement path. Deploy/config surfaces, generated bindings, docs, and
tests were updated together.

### [x] ERC Conditional Escrow Alignment

Completed across:

- `59f8f628d9099c1dbbef67c3de21fdb17032fa1f`
- `9d32a984e7988e37909f7a478e14ebea8de741f8`
- `660455edde29e5124920cab0222dffa724968581`
- `b83b0c9cc0b17fd3abfb6ae00a4cc1118ffd8ef0`

The Solidity contracts, generated ABI artifacts, SDK typed clients, docs,
deploy/config surfaces, and event/argument naming were aligned with
`erc-conditional-escrow.md` as the major-version API target. The
`erc-conditional-escrow-core.md` split was treated as experimental and did not
drive the repository refactor.

The cleanup aligned contract names and public interfaces with the ERC draft
terminology:

- `IArbiter.checkObligation(...)` -> `IArbiter.check(...)`.
- `collectEscrow(...)` / `collectEscrowRaw(...)` -> `collect(...)`.
- `reclaimExpired(...)` -> `reclaim(...)`.
- `extractArbiterAndDemand(...)` -> `decodeCondition(...)`.
- `escrowUid`, `fulfillmentUid`, `escrower`, and `fulfiller` are used
  consistently in core events, arguments, docs, and SDKs.
- Fulfillment attestations are not described as obligations except where naming
  refers to the concrete contract family.

### [x] Splitter Arbitration Requests

Triaged as no contract change in `docs/audits/triage/audit-agent-octane-2026-04-13-2026-06-23-triage.md`.

Splitter arbitration request events are hints. The on-chain authorization path
uses the escrow's local demand to select the oracle and requires that oracle to
have recorded a decision for the fulfillment and escrow pair.

### [x] Default Escrow Checks

Completed by `b78de3a569dc4f37f5de0936af415281c84ed08ef`.

The escrow APIs now use the safe default/unconditional split rather than the old
non-tierable/tierable naming. The default escrow contracts perform the default
checks, while the unconditional variants are the explicit escape hatch for
callers that want to compose those checks manually.

Manual composition remains available through arbiters such as
`IntrinsicsArbiter`, `ReferencesEscrowArbiter`, and `AllArbiter`.

### [x] UID-Aware Hook Lifecycle

Completed across:

- `26226a81e6ffb50898269200f89016e6ef476291`
- `fe48ff942e5608813fbd546c498cc7bd63f1d2e6`
- `8f1cd403cd82f29b550cd53348d4c3e7df21a012`
- `69b9048091d3ac2ef571620877a30cc66c2d8432`

Hook-based escrows now have post-attest hook context built around the EAS
attestation, including the created UID. The native hook lifecycle was updated so
conceptual lock work and post-attest binding can be separated cleanly.

### [x] Per-Demand Commit-Reveal Bonds

Completed by `fd47376f37cf367e3ee1fd0fa82b31ac8f28dbf6`.

`CommitRevealObligation` is now the per-demand/per-commit bond variant. The
committer supplies the bond value with the commit, and `check`
validates the revealed commitment against the bond demanded by the escrow. The
previous global contract-level bond behavior was retained as the example
contract `contracts/src/obligations/example/GlobalBondCommitRevealObligation.sol`,
not as part of the canonical deploy/SDK surface. Maintaining a sensible global
bond per chain is operationally expensive and not worth making a default
contract variant.

### [x] Base Splitter Refactor

Completed by `173d34c8b87f237d4f0ac4770f5ee37c244473a3`.

The splitter contracts now share base orchestration for common fulfillment
creation, created-fulfillment validation, executor-sentinel resolution,
arbitration request helpers, decision-key helpers, and native refund proxying.
Asset-specific arbitration, escrow collection, receipt verification, and
distribution remain local to each splitter type.

### [x] Remove IntrinsicsArbiter2

Completed by `395a6ade1482f0e5c0d598fa504a43cc2d0c4ea1`.

`IntrinsicsArbiter2` was removed in favor of composing `IntrinsicsArbiter` and
`SchemaArbiter` through logical arbiters when both checks are needed. Contract
deployment outputs, SDK address maps, generated bindings, dist artifacts, tests,
and docs were updated accordingly.
