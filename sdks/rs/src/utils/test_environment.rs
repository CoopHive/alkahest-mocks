use std::sync::Arc;
use std::time::Duration;
use tokio::sync::{Mutex, OnceCell};

use alloy::{
    network::TransactionBuilder,
    node_bindings::AnvilInstance,
    primitives::{Address, U256},
    providers::Provider,
    rpc::types::TransactionRequest,
    signers::local::PrivateKeySigner,
};

use crate::{
    AlkahestClient, DefaultExtensionConfig,
    clients::{
        arbiters::ArbitersAddresses, attestation::AttestationAddresses,
        commit_reveal_obligation::CommitRevealObligationAddresses, erc20::Erc20Addresses,
        erc721::Erc721Addresses, erc1155::Erc1155Addresses, hook_based::HookBasedAddresses,
        native_token::NativeTokenAddresses, splitters::SplittersAddresses,
        string_obligation::StringObligationAddresses, token_bundle::TokenBundleAddresses,
    },
    contracts::{
        arbiters::{
            CommitmentTrustedOracleArbiter, ERC8004Arbiter, IntrinsicsArbiter,
            ReferencesEscrowArbiter, TrivialArbiter, TrustedOracleArbiter,
            attestation_properties::{
                AttesterArbiter, ExpirationTimeAfterArbiter, ExpirationTimeBeforeArbiter,
                ExpirationTimeEqualArbiter, RecipientArbiter, RefUidArbiter, RevocableArbiter,
                SchemaArbiter, TimeAfterArbiter, TimeBeforeArbiter, TimeEqualArbiter, UidArbiter,
            },
            confirmation::{
                ExclusiveRevocableConfirmationArbiter, ExclusiveUnrevocableConfirmationArbiter,
                NonexclusiveRevocableConfirmationArbiter,
                NonexclusiveUnrevocableConfirmationArbiter,
            },
            logical::{AllArbiter, AnyArbiter},
        },
        obligations::{
            CommitRevealObligation,
            // Payment obligations are at root of obligations module
            ERC20PaymentObligation,
            ERC721PaymentObligation,
            ERC1155PaymentObligation,
            NativeTokenPaymentObligation,
            StringObligation,
            TokenBundlePaymentObligation,
            escrow::default_escrow::{
                AttestationEscrowObligation, AttestationReferenceEscrowObligation,
                ERC20EscrowObligation, ERC721EscrowObligation, ERC1155EscrowObligation,
                NativeTokenEscrowObligation, TokenBundleEscrowObligation,
            },
            escrow::hook_based::{
                HookEscrowObligation, HooksEscrowObligation,
                hooks::{
                    AttestationEscrowHook, AttestationReferenceEscrowHook, ERC20EscrowHook,
                    ERC721EscrowHook, ERC1155EscrowHook, NativeTokenEscrowHook,
                },
            },
            escrow::unconditional::{
                UnconditionalAttestationEscrowObligation,
                UnconditionalAttestationReferenceEscrowObligation,
                UnconditionalERC20EscrowObligation, UnconditionalERC721EscrowObligation,
                UnconditionalERC1155EscrowObligation, UnconditionalNativeTokenEscrowObligation,
                UnconditionalTokenBundleEscrowObligation,
            },
        },
        utils::{
            AtomicAttestationUtils, AtomicPaymentUtils,
            splitters::{
                ERC20Splitter, ERC1155Splitter, NativeTokenSplitter,
                commitment::{
                    CommitmentERC20Splitter, CommitmentERC1155Splitter,
                    CommitmentNativeTokenSplitter, token_bundle::CommitmentTokenBundleSplitter,
                    token_bundle_unvalidated::CommitmentTokenBundleSplitterUnvalidated,
                },
                token_bundle::TokenBundleSplitter,
                token_bundle_unvalidated::TokenBundleSplitterUnvalidated,
            },
        },
    },
    fixtures::{EAS, MockERC20Permit, MockERC721, MockERC1155, SchemaRegistry},
    types::WalletProvider,
    utils::transport::get_wallet_provider,
};

/// Pick the anvil RPC URL based on the `ALKAHEST_TEST_TRANSPORT` env var.
///
/// `"http"` → uses `anvil.endpoint_url()` so the whole shared test suite
/// runs against the HTTP / polling code path. Anything else (or unset) →
/// `anvil.ws_endpoint_url()`, the long-standing default.
///
/// CI should run `cargo test` twice — once with the env var unset (ws),
/// once with `ALKAHEST_TEST_TRANSPORT=http` — to confirm transport
/// parity for every test that flows through `setup_test_environment`.
fn anvil_test_endpoint(anvil: &alloy::node_bindings::AnvilInstance) -> String {
    match std::env::var("ALKAHEST_TEST_TRANSPORT")
        .unwrap_or_default()
        .to_ascii_lowercase()
        .as_str()
    {
        "http" | "https" => anvil.endpoint_url().to_string(),
        _ => anvil.ws_endpoint_url().to_string(),
    }
}

/// Shared singleton holding the once-per-process anvil + deployed contracts.
/// Tests acquire `setup_lock` for the duration of their run, revert anvil
/// to the post-deploy snapshot, and operate on fresh signers funded from
/// `god` — eliminating the per-test anvil spawn that was exhausting macOS
/// ephemeral ports under sequential test runs.
struct SharedTestEnv {
    anvil: Arc<AnvilInstance>,
    god: PrivateKeySigner,
    addresses: DefaultExtensionConfig,
    mock_addresses: MockAddresses,
    rpc_url: String,
    /// Snapshot taken immediately after deploy. Tests revert here and
    /// re-snapshot on entry so each test starts from a clean post-deploy
    /// chain state. Held in a Mutex so we can update it atomically.
    snapshot_id: Mutex<U256>,
    /// Serializes test access to the shared chain state. Held for the
    /// lifetime of `TestContext`. Compatible with `cargo test --test-threads=1`
    /// (which is already what dev/CI use against macOS to avoid the previous
    /// port exhaustion); also makes accidental parallel runs safe.
    setup_lock: Arc<Mutex<()>>,
}

static SHARED_ENV: OnceCell<Arc<SharedTestEnv>> = OnceCell::const_new();

async fn shared_env() -> eyre::Result<Arc<SharedTestEnv>> {
    SHARED_ENV
        .get_or_try_init(|| async {
            let env = build_shared_env().await?;
            Ok::<_, eyre::Report>(Arc::new(env))
        })
        .await
        .cloned()
}

pub async fn setup_test_environment() -> eyre::Result<TestContext> {
    let env = shared_env().await?;
    // Acquire the cross-test serialization mutex for the duration of
    // this test. Stored in TestContext via the _test_guard field so
    // dropping the context releases it.
    let test_guard = env.setup_lock.clone().lock_owned().await;

    // Build a fresh god_provider per test rather than sharing across the
    // suite — alloy's persistent backend task can die between test
    // invocations, and reusing it surfaces as
    // "backend connection task has stopped" on the next test.
    let god_provider = get_wallet_provider(env.god.clone(), env.rpc_url.clone()).await?;

    // Revert chain to the post-deploy snapshot, then re-snapshot.
    // evm_revert consumes the snapshot id, so we always pair it with
    // a fresh evm_snapshot.
    {
        let mut snapshot = env.snapshot_id.lock().await;
        let _: bool = god_provider
            .raw_request("evm_revert".into(), [*snapshot])
            .await?;
        let new_snapshot: U256 = god_provider.raw_request("evm_snapshot".into(), ()).await?;
        *snapshot = new_snapshot;
    }

    // Fresh signers per test — evm_revert wipes per-test funding,
    // so we re-fund alice/bob/charlie from god each time.
    let alice = PrivateKeySigner::random();
    let bob = PrivateKeySigner::random();
    let charlie = PrivateKeySigner::random();

    let funding = U256::from(10_u128).pow(U256::from(20)); // 100 ETH
    for (_label, to) in [
        ("alice", alice.address()),
        ("bob", bob.address()),
        ("charlie", charlie.address()),
    ] {
        let tx = TransactionRequest::default()
            .with_to(to)
            .with_value(funding);
        god_provider
            .send_transaction(tx)
            .await?
            .get_receipt()
            .await?;
    }

    // Tight poll interval for tests so HTTP-transport runs don't burn
    // through the 5s test deadlines that ws subscriptions hit instantly.
    // Production clients keep the 7s default.
    let test_poll_interval = Some(Duration::from_millis(250));
    let alice_client = AlkahestClient::with_base_extensions_with_poll_interval(
        alice.clone(),
        env.rpc_url.clone(),
        Some(env.addresses.clone()),
        test_poll_interval,
    )
    .await?;
    let bob_client = AlkahestClient::with_base_extensions_with_poll_interval(
        bob.clone(),
        env.rpc_url.clone(),
        Some(env.addresses.clone()),
        test_poll_interval,
    )
    .await?;
    let charlie_client = AlkahestClient::with_base_extensions_with_poll_interval(
        charlie.clone(),
        env.rpc_url.clone(),
        Some(env.addresses.clone()),
        test_poll_interval,
    )
    .await?;

    Ok(TestContext {
        anvil: env.anvil.clone(),
        alice,
        bob,
        charlie,
        god: env.god.clone(),
        god_provider,
        alice_client,
        bob_client,
        charlie_client,
        addresses: env.addresses.clone(),
        mock_addresses: env.mock_addresses.clone(),
        _test_guard: test_guard,
    })
}

async fn build_shared_env() -> eyre::Result<SharedTestEnv> {
    let anvil = alloy::node_bindings::Anvil::new().try_spawn()?;
    eprintln!(
        "[shared_env] anvil spawned (ws={}, http={})",
        anvil.ws_endpoint_url(),
        anvil.endpoint_url()
    );

    let god: PrivateKeySigner = anvil.keys()[0].clone().into();
    let rpc_url = anvil_test_endpoint(&anvil);
    let god_provider = get_wallet_provider(god.clone(), rpc_url.clone()).await?;
    let god_provider_ = god_provider.clone();

    let schema_registry = SchemaRegistry::deploy(&god_provider).await?;
    let eas = EAS::deploy(&god_provider, schema_registry.address().clone()).await?;

    let mock_erc20_a =
        MockERC20Permit::deploy(&god_provider, "Mock Erc20".into(), "TK1".into()).await?;
    let mock_erc20_b =
        MockERC20Permit::deploy(&god_provider, "Mock Erc20".into(), "TK2".into()).await?;
    let mock_erc721_a = MockERC721::deploy(&god_provider).await?;
    let mock_erc721_b = MockERC721::deploy(&god_provider).await?;
    let mock_erc1155_a = MockERC1155::deploy(&god_provider).await?;
    let mock_erc1155_b = MockERC1155::deploy(&god_provider).await?;

    // Deploy core arbiters
    let trivial_arbiter = TrivialArbiter::deploy(&god_provider).await?;
    let trusted_oracle_arbiter =
        TrustedOracleArbiter::deploy(&god_provider, eas.address().clone()).await?;
    let commitment_trusted_oracle_arbiter =
        CommitmentTrustedOracleArbiter::deploy(&god_provider).await?;
    let intrinsics_arbiter = IntrinsicsArbiter::deploy(&god_provider).await?;
    let erc8004_arbiter = ERC8004Arbiter::deploy(&god_provider).await?;
    let references_escrow_arbiter = ReferencesEscrowArbiter::deploy(&god_provider).await?;
    let any_arbiter = AnyArbiter::deploy(&god_provider).await?;
    let all_arbiter = AllArbiter::deploy(&god_provider).await?;

    // Deploy attestation property arbiters (non-composing only - composing arbiters removed)
    let attester_arbiter = AttesterArbiter::deploy(&god_provider).await?;
    let expiration_time_after_arbiter = ExpirationTimeAfterArbiter::deploy(&god_provider).await?;
    let expiration_time_before_arbiter = ExpirationTimeBeforeArbiter::deploy(&god_provider).await?;
    let expiration_time_equal_arbiter = ExpirationTimeEqualArbiter::deploy(&god_provider).await?;
    let recipient_arbiter = RecipientArbiter::deploy(&god_provider).await?;
    let ref_uid_arbiter = RefUidArbiter::deploy(&god_provider).await?;
    let revocable_arbiter = RevocableArbiter::deploy(&god_provider).await?;
    let schema_arbiter = SchemaArbiter::deploy(&god_provider).await?;
    let time_after_arbiter = TimeAfterArbiter::deploy(&god_provider).await?;
    let time_before_arbiter = TimeBeforeArbiter::deploy(&god_provider).await?;
    let time_equal_arbiter = TimeEqualArbiter::deploy(&god_provider).await?;
    let uid_arbiter = UidArbiter::deploy(&god_provider).await?;

    // Deploy confirmation arbiters (new naming convention)
    let exclusive_revocable_confirmation_arbiter =
        ExclusiveRevocableConfirmationArbiter::deploy(&god_provider, eas.address().clone()).await?;
    let exclusive_unrevocable_confirmation_arbiter =
        ExclusiveUnrevocableConfirmationArbiter::deploy(&god_provider, eas.address().clone())
            .await?;
    let nonexclusive_revocable_confirmation_arbiter =
        NonexclusiveRevocableConfirmationArbiter::deploy(&god_provider, eas.address().clone())
            .await?;
    let nonexclusive_unrevocable_confirmation_arbiter =
        NonexclusiveUnrevocableConfirmationArbiter::deploy(&god_provider, eas.address().clone())
            .await?;

    macro_rules! deploy_obligation {
        ($name:ident) => {
            $name::deploy(
                &god_provider,
                eas.address().clone(),
                schema_registry.address().clone(),
            )
            .await?
        };
    }

    // Deploy default obligations
    let attestation_escrow_obligation = deploy_obligation!(AttestationEscrowObligation);
    let attestation_reference_escrow_obligation =
        deploy_obligation!(AttestationReferenceEscrowObligation);
    let bundle_escrow_obligation = deploy_obligation!(TokenBundleEscrowObligation);
    let bundle_payment_obligation = deploy_obligation!(TokenBundlePaymentObligation);
    let erc20_escrow_obligation = deploy_obligation!(ERC20EscrowObligation);
    let erc20_payment_obligation = deploy_obligation!(ERC20PaymentObligation);
    let erc721_escrow_obligation = deploy_obligation!(ERC721EscrowObligation);
    let erc721_payment_obligation = deploy_obligation!(ERC721PaymentObligation);
    let erc1155_escrow_obligation = deploy_obligation!(ERC1155EscrowObligation);
    let erc1155_payment_obligation = deploy_obligation!(ERC1155PaymentObligation);
    let native_token_escrow_obligation = deploy_obligation!(NativeTokenEscrowObligation);
    let native_token_payment_obligation = deploy_obligation!(NativeTokenPaymentObligation);

    // Deploy unconditional obligations
    let unconditional_attestation_escrow_obligation =
        deploy_obligation!(UnconditionalAttestationEscrowObligation);
    let unconditional_attestation_reference_escrow_obligation =
        deploy_obligation!(UnconditionalAttestationReferenceEscrowObligation);
    let unconditional_bundle_escrow_obligation =
        deploy_obligation!(UnconditionalTokenBundleEscrowObligation);
    let unconditional_erc20_escrow_obligation =
        deploy_obligation!(UnconditionalERC20EscrowObligation);
    let unconditional_erc721_escrow_obligation =
        deploy_obligation!(UnconditionalERC721EscrowObligation);
    let unconditional_erc1155_escrow_obligation =
        deploy_obligation!(UnconditionalERC1155EscrowObligation);
    let unconditional_native_token_escrow_obligation =
        deploy_obligation!(UnconditionalNativeTokenEscrowObligation);

    let string_obligation = StringObligation::deploy(
        &god_provider,
        eas.address().clone(),
        schema_registry.address().clone(),
    )
    .await?;

    let commit_reveal_obligation = CommitRevealObligation::deploy(
        &god_provider,
        eas.address().clone(),
        schema_registry.address().clone(),
        Address::ZERO, // burn slashed bonds
    )
    .await?;

    // Deploy atomic utils
    let atomic_attestation_utils =
        AtomicAttestationUtils::deploy(&god_provider, eas.address().clone()).await?;
    let atomic_payment_utils = AtomicPaymentUtils::deploy(
        &god_provider,
        eas.address().clone(),
        erc20_payment_obligation.address().clone(),
        erc721_payment_obligation.address().clone(),
        erc1155_payment_obligation.address().clone(),
        native_token_payment_obligation.address().clone(),
        bundle_payment_obligation.address().clone(),
    )
    .await?;
    let hook_escrow_obligation = HookEscrowObligation::deploy(
        &god_provider,
        eas.address().clone(),
        schema_registry.address().clone(),
    )
    .await?;
    let hooks_escrow_obligation = HooksEscrowObligation::deploy(
        &god_provider,
        eas.address().clone(),
        schema_registry.address().clone(),
    )
    .await?;
    let erc20_escrow_hook = ERC20EscrowHook::deploy(&god_provider).await?;
    let erc721_escrow_hook = ERC721EscrowHook::deploy(&god_provider).await?;
    let erc1155_escrow_hook = ERC1155EscrowHook::deploy(&god_provider).await?;
    let native_token_escrow_hook = NativeTokenEscrowHook::deploy(&god_provider).await?;
    let attestation_escrow_hook =
        AttestationEscrowHook::deploy(&god_provider, eas.address().clone()).await?;
    let attestation_reference_escrow_hook = AttestationReferenceEscrowHook::deploy(
        &god_provider,
        eas.address().clone(),
        schema_registry.address().clone(),
    )
    .await?;
    let erc20_splitter = ERC20Splitter::deploy(
        &god_provider,
        eas.address().clone(),
        erc20_escrow_obligation.address().clone(),
    )
    .await?;
    let erc1155_splitter = ERC1155Splitter::deploy(
        &god_provider,
        eas.address().clone(),
        erc1155_escrow_obligation.address().clone(),
    )
    .await?;
    let native_token_splitter = NativeTokenSplitter::deploy(
        &god_provider,
        eas.address().clone(),
        native_token_escrow_obligation.address().clone(),
    )
    .await?;
    let token_bundle_splitter = TokenBundleSplitter::deploy(
        &god_provider,
        eas.address().clone(),
        bundle_escrow_obligation.address().clone(),
    )
    .await?;
    let token_bundle_splitter_unvalidated = TokenBundleSplitterUnvalidated::deploy(
        &god_provider,
        eas.address().clone(),
        bundle_escrow_obligation.address().clone(),
    )
    .await?;
    let commitment_erc20_splitter = CommitmentERC20Splitter::deploy(
        &god_provider,
        eas.address().clone(),
        erc20_escrow_obligation.address().clone(),
    )
    .await?;
    let commitment_erc1155_splitter = CommitmentERC1155Splitter::deploy(
        &god_provider,
        eas.address().clone(),
        erc1155_escrow_obligation.address().clone(),
    )
    .await?;
    let commitment_native_token_splitter = CommitmentNativeTokenSplitter::deploy(
        &god_provider,
        eas.address().clone(),
        native_token_escrow_obligation.address().clone(),
    )
    .await?;
    let commitment_token_bundle_splitter = CommitmentTokenBundleSplitter::deploy(
        &god_provider,
        eas.address().clone(),
        bundle_escrow_obligation.address().clone(),
    )
    .await?;
    let commitment_token_bundle_splitter_unvalidated =
        CommitmentTokenBundleSplitterUnvalidated::deploy(
            &god_provider,
            eas.address().clone(),
            bundle_escrow_obligation.address().clone(),
        )
        .await?;

    // Per-test wallets are created in setup_test_environment(); the
    // shared singleton only needs the deployer-derived state.
    let addresses = DefaultExtensionConfig {
        arbiters_addresses: ArbitersAddresses {
            eas: eas.address().clone(),
            trivial_arbiter: trivial_arbiter.address().clone(),
            trusted_oracle_arbiter: trusted_oracle_arbiter.address().clone(),
            commitment_trusted_oracle_arbiter: commitment_trusted_oracle_arbiter.address().clone(),
            intrinsics_arbiter: intrinsics_arbiter.address().clone(),
            erc8004_arbiter: erc8004_arbiter.address().clone(),
            references_escrow_arbiter: references_escrow_arbiter.address().clone(),
            any_arbiter: any_arbiter.address().clone(),
            all_arbiter: all_arbiter.address().clone(),
            // Attestation property arbiters
            attester_arbiter: attester_arbiter.address().clone(),
            expiration_time_after_arbiter: expiration_time_after_arbiter.address().clone(),
            expiration_time_before_arbiter: expiration_time_before_arbiter.address().clone(),
            expiration_time_equal_arbiter: expiration_time_equal_arbiter.address().clone(),
            recipient_arbiter: recipient_arbiter.address().clone(),
            ref_uid_arbiter: ref_uid_arbiter.address().clone(),
            revocable_arbiter: revocable_arbiter.address().clone(),
            schema_arbiter: schema_arbiter.address().clone(),
            time_after_arbiter: time_after_arbiter.address().clone(),
            time_before_arbiter: time_before_arbiter.address().clone(),
            time_equal_arbiter: time_equal_arbiter.address().clone(),
            uid_arbiter: uid_arbiter.address().clone(),
            // Confirmation arbiters
            exclusive_revocable_confirmation_arbiter: exclusive_revocable_confirmation_arbiter
                .address()
                .clone(),
            exclusive_unrevocable_confirmation_arbiter: exclusive_unrevocable_confirmation_arbiter
                .address()
                .clone(),
            nonexclusive_revocable_confirmation_arbiter:
                nonexclusive_revocable_confirmation_arbiter
                    .address()
                    .clone(),
            nonexclusive_unrevocable_confirmation_arbiter:
                nonexclusive_unrevocable_confirmation_arbiter
                    .address()
                    .clone(),
        },
        string_obligation_addresses: StringObligationAddresses {
            eas: eas.address().clone(),
            obligation: string_obligation.address().clone(),
        },
        commit_reveal_obligation_addresses: CommitRevealObligationAddresses {
            eas: eas.address().clone(),
            obligation: commit_reveal_obligation.address().clone(),
        },
        erc20_addresses: Erc20Addresses {
            eas: eas.address().clone(),
            atomic_payment_utils: atomic_payment_utils.address().clone(),
            escrow_obligation_default: erc20_escrow_obligation.address().clone(),
            escrow_obligation_unconditional: unconditional_erc20_escrow_obligation
                .address()
                .clone(),
            payment_obligation: erc20_payment_obligation.address().clone(),
        },
        erc721_addresses: Erc721Addresses {
            eas: eas.address().clone(),
            atomic_payment_utils: atomic_payment_utils.address().clone(),
            escrow_obligation_default: erc721_escrow_obligation.address().clone(),
            escrow_obligation_unconditional: unconditional_erc721_escrow_obligation
                .address()
                .clone(),
            payment_obligation: erc721_payment_obligation.address().clone(),
        },
        erc1155_addresses: Erc1155Addresses {
            eas: eas.address().clone(),
            atomic_payment_utils: atomic_payment_utils.address().clone(),
            escrow_obligation_default: erc1155_escrow_obligation.address().clone(),
            escrow_obligation_unconditional: unconditional_erc1155_escrow_obligation
                .address()
                .clone(),
            payment_obligation: erc1155_payment_obligation.address().clone(),
        },
        native_token_addresses: NativeTokenAddresses {
            eas: eas.address().clone(),
            atomic_payment_utils: atomic_payment_utils.address().clone(),
            escrow_obligation_default: native_token_escrow_obligation.address().clone(),
            escrow_obligation_unconditional: unconditional_native_token_escrow_obligation
                .address()
                .clone(),
            payment_obligation: native_token_payment_obligation.address().clone(),
        },
        token_bundle_addresses: TokenBundleAddresses {
            eas: eas.address().clone(),
            atomic_payment_utils: atomic_payment_utils.address().clone(),
            escrow_obligation_default: bundle_escrow_obligation.address().clone(),
            escrow_obligation_unconditional: unconditional_bundle_escrow_obligation
                .address()
                .clone(),
            payment_obligation: bundle_payment_obligation.address().clone(),
        },
        hook_based_addresses: HookBasedAddresses {
            eas: eas.address().clone(),
            hook_escrow_obligation: hook_escrow_obligation.address().clone(),
            hooks_escrow_obligation: hooks_escrow_obligation.address().clone(),
            erc20_escrow_hook: erc20_escrow_hook.address().clone(),
            erc721_escrow_hook: erc721_escrow_hook.address().clone(),
            erc1155_escrow_hook: erc1155_escrow_hook.address().clone(),
            native_token_escrow_hook: native_token_escrow_hook.address().clone(),
            attestation_escrow_hook: attestation_escrow_hook.address().clone(),
            attestation_reference_escrow_hook: attestation_reference_escrow_hook.address().clone(),
        },
        splitters_addresses: SplittersAddresses {
            erc20_splitter: erc20_splitter.address().clone(),
            erc1155_splitter: erc1155_splitter.address().clone(),
            native_token_splitter: native_token_splitter.address().clone(),
            token_bundle_splitter: token_bundle_splitter.address().clone(),
            token_bundle_splitter_unvalidated: token_bundle_splitter_unvalidated.address().clone(),
            commitment_erc20_splitter: commitment_erc20_splitter.address().clone(),
            commitment_erc1155_splitter: commitment_erc1155_splitter.address().clone(),
            commitment_native_token_splitter: commitment_native_token_splitter.address().clone(),
            commitment_token_bundle_splitter: commitment_token_bundle_splitter.address().clone(),
            commitment_token_bundle_splitter_unvalidated:
                commitment_token_bundle_splitter_unvalidated
                    .address()
                    .clone(),
        },
        attestation_addresses: AttestationAddresses {
            eas: eas.address().clone(),
            eas_schema_registry: schema_registry.address().clone(),
            atomic_attestation_utils: atomic_attestation_utils.address().clone(),
            escrow_obligation_default: attestation_escrow_obligation.address().clone(),
            escrow_obligation_unconditional: unconditional_attestation_escrow_obligation
                .address()
                .clone(),
            attestation_reference_escrow_obligation_default:
                attestation_reference_escrow_obligation.address().clone(),
            attestation_reference_escrow_obligation_unconditional:
                unconditional_attestation_reference_escrow_obligation
                    .address()
                    .clone(),
        },
    };

    let mock_addresses = MockAddresses {
        erc20_a: mock_erc20_a.address().clone(),
        erc20_b: mock_erc20_b.address().clone(),
        erc721_a: mock_erc721_a.address().clone(),
        erc721_b: mock_erc721_b.address().clone(),
        erc1155_a: mock_erc1155_a.address().clone(),
        erc1155_b: mock_erc1155_b.address().clone(),
    };

    // Capture the post-deploy state so per-test reverts can return here.
    // Use the local god_provider for this single call; it will be dropped
    // when this function returns. Per-test code creates fresh providers
    // because long-lived alloy ws backend tasks can die between tests.
    let snapshot_id: U256 = god_provider.raw_request("evm_snapshot".into(), ()).await?;
    drop(god_provider);
    drop(god_provider_);

    Ok(SharedTestEnv {
        anvil: Arc::new(anvil),
        god,
        addresses,
        mock_addresses,
        rpc_url,
        snapshot_id: Mutex::new(snapshot_id),
        setup_lock: Arc::new(Mutex::new(())),
    })
}

pub struct TestContext {
    pub anvil: Arc<AnvilInstance>,
    pub alice: PrivateKeySigner,
    pub bob: PrivateKeySigner,
    pub charlie: PrivateKeySigner,
    pub god: PrivateKeySigner,
    pub god_provider: WalletProvider,
    pub alice_client: AlkahestClient<crate::extensions::BaseExtensions>,
    pub bob_client: AlkahestClient<crate::extensions::BaseExtensions>,
    pub charlie_client: AlkahestClient<crate::extensions::BaseExtensions>,
    pub addresses: DefaultExtensionConfig,
    pub mock_addresses: MockAddresses,
    /// Holds the cross-test serialization lock for the lifetime of this
    /// context. Dropping it releases the next test waiting on
    /// ``shared_env().setup_lock``. Underscore-prefixed because consumers
    /// shouldn't access it directly.
    _test_guard: tokio::sync::OwnedMutexGuard<()>,
}

#[derive(Clone)]
pub struct MockAddresses {
    pub erc20_a: Address,
    pub erc20_b: Address,
    pub erc721_a: Address,
    pub erc721_b: Address,
    pub erc1155_a: Address,
    pub erc1155_b: Address,
}
