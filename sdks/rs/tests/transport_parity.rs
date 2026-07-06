//! Cross-transport tests: each happy-path is exercised against both the
//! anvil ws endpoint and the anvil http endpoint, asserting the public API
//! is identical regardless of transport.
//!
//! These tests deliberately avoid timing assertions — http polling has higher
//! latency than ws pubsub, but eventually-consistent assertions should pass
//! on both.

#[cfg(test)]
mod transport_parity {
    use std::time::Duration;

    use alkahest_rs::{
        AlkahestClient, DefaultAlkahestClient,
        clients::oracle::ArbitrationMode,
        contracts,
        extensions::{HasErc20, HasOracle, HasStringObligation},
        fixtures::MockERC20Permit,
        types::{ArbiterData, Erc20Data},
        utils::{TestContext, setup_test_environment},
    };
    use alloy::primitives::{Bytes, FixedBytes, bytes};

    /// Build a fresh client against a specific RPC URL using the same on-chain
    /// addresses as the existing TestContext (which was set up via ws).
    async fn rebuild_client(
        test: &TestContext,
        signer: alloy::signers::local::PrivateKeySigner,
        rpc_url: String,
    ) -> eyre::Result<DefaultAlkahestClient> {
        // Use a short poll interval so http subscription tests don't hang
        // unnecessarily in CI.
        AlkahestClient::with_base_extensions_with_poll_interval(
            signer,
            rpc_url,
            Some(test.addresses.clone()),
            Some(Duration::from_millis(250)),
        )
        .await
    }

    async fn fund_alice_with_erc20(test: &TestContext, value: u64) -> eyre::Result<Erc20Data> {
        let mock_erc20 = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20
            .transfer(test.alice.address(), value.try_into()?)
            .send()
            .await?
            .get_receipt()
            .await?;
        Ok(Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: value.try_into()?,
        })
    }

    /// Choose which transport endpoint to talk to.
    #[derive(Debug, Clone, Copy)]
    enum Transport {
        Ws,
        Http,
    }

    impl Transport {
        fn url(&self, anvil: &alloy::node_bindings::AnvilInstance) -> String {
            match self {
                Self::Ws => anvil.ws_endpoint_url().to_string(),
                Self::Http => anvil.endpoint_url().to_string(),
            }
        }
    }

    /// One end-to-end exercise covering the requested matrix:
    /// 1. Eth_call (read attestation via the EAS contract through the SDK)
    /// 2. Escrow create (write tx)
    /// 3. wait_for_* (uses `wait_for_first_log` helper internally)
    ///
    /// The contracts are deployed once via `setup_test_environment`, then we
    /// rebuild the alice/bob clients to talk to the same anvil over the
    /// requested transport.
    async fn run_happy_path(transport: Transport) -> eyre::Result<()> {
        let test = setup_test_environment().await?;
        let rpc_url = transport.url(&test.anvil);

        let alice_client = rebuild_client(&test, test.alice.clone(), rpc_url.clone()).await?;
        let bob_client = rebuild_client(&test, test.bob.clone(), rpc_url.clone()).await?;

        let price = fund_alice_with_erc20(&test, 100).await?;

        // --- Write: escrow create ---
        let arbiter = test.addresses.arbiters_addresses.trusted_oracle_arbiter;
        let demand_data = contracts::arbiters::TrustedOracleArbiter::DemandData {
            oracle: test.bob.address(),
            data: bytes!(""),
        };
        let item = ArbiterData {
            arbiter,
            demand: demand_data.into(),
        };
        let expiration = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)?
            .as_secs()
            + 3600;

        let escrow_receipt = alice_client
            .erc20()
            .escrow()
            .default()
            .permit_and_create(&price, &item, expiration)
            .await?;
        let escrow_event = DefaultAlkahestClient::get_attested_event(escrow_receipt)?;

        // --- Read (eth_call): fetch the attestation back through the SDK. ---
        // get_escrow_attestation reads the attestation referenced by `refUID`
        // on the input attestation. We fabricate the smallest input that
        // makes that lookup point at our just-created escrow.
        let lookup_input = contracts::IEAS::Attestation {
            uid: FixedBytes::default(),
            schema: FixedBytes::default(),
            time: 0,
            expirationTime: 0,
            revocationTime: 0,
            refUID: escrow_event.uid,
            recipient: alloy::primitives::Address::ZERO,
            attester: alloy::primitives::Address::ZERO,
            revocable: false,
            data: Default::default(),
        };
        let escrow_attestation = alice_client.get_escrow_attestation(&lookup_input).await?;
        assert_eq!(escrow_attestation.uid, escrow_event.uid);

        // --- wait_for_*: bob fulfills, then waits for the ArbitrationMade event.
        let fulfillment_receipt = bob_client
            .string_obligation()
            .do_obligation("ok".to_string(), None, Some(escrow_event.uid))
            .await?;
        let fulfillment_event = DefaultAlkahestClient::get_attested_event(fulfillment_receipt)?;

        // Spawn the wait-for in parallel with the arbitrate so the helper
        // exercises its live-stream path (not just historical get_logs).
        let bob_wait = bob_client.clone();
        let fulfillment_uid = fulfillment_event.uid;
        let waiter = tokio::spawn(async move {
            tokio::time::timeout(
                Duration::from_secs(60),
                bob_wait
                    .oracle()
                    .wait_for_arbitration(fulfillment_uid, None, None, None),
            )
            .await
        });

        // Small delay so the waiter is established before the event fires.
        tokio::time::sleep(Duration::from_millis(100)).await;

        bob_client
            .oracle()
            .request_arbitration(fulfillment_event.uid, test.bob.address(), Bytes::default())
            .await?;
        bob_client
            .oracle()
            .arbitrate_raw(fulfillment_event.uid, Bytes::default(), true)
            .await?;

        let made = waiter
            .await
            .map_err(|e| eyre::eyre!("waiter task panicked: {e}"))?
            .map_err(|e| eyre::eyre!("wait_for_arbitration timed out: {e}"))??;
        assert!(made.data().decision);

        Ok(())
    }

    #[tokio::test]
    async fn happy_path_over_ws() -> eyre::Result<()> {
        run_happy_path(Transport::Ws).await
    }

    #[tokio::test]
    async fn happy_path_over_http() -> eyre::Result<()> {
        run_happy_path(Transport::Http).await
    }

    /// Smoke-test the SubscriptionHandle path on both transports.
    async fn run_subscription_handle(transport: Transport) -> eyre::Result<()> {
        let test = setup_test_environment().await?;
        let rpc_url = transport.url(&test.anvil);
        let bob_client = rebuild_client(&test, test.bob.clone(), rpc_url).await?;

        // Future-only mode — we just want to confirm the subscription opens
        // and unsubscribe() returns Ok regardless of transport.
        let result = bob_client
            .oracle()
            .arbitrate_many_sync(|_awd| None, |_decision| async {}, ArbitrationMode::Future)
            .await?;

        assert_eq!(result.past_decisions.len(), 0);
        let handle = result
            .subscription
            .ok_or_else(|| eyre::eyre!("expected a subscription handle in Future mode"))?;
        handle.unsubscribe(&bob_client.public_provider).await?;

        Ok(())
    }

    #[tokio::test]
    async fn subscription_handle_over_ws() -> eyre::Result<()> {
        run_subscription_handle(Transport::Ws).await
    }

    #[tokio::test]
    async fn subscription_handle_over_http() -> eyre::Result<()> {
        run_subscription_handle(Transport::Http).await
    }

    #[test]
    fn invalid_url_scheme_is_rejected() {
        // ftp:// is not supported.
        let rt = tokio::runtime::Runtime::new().unwrap();
        let err = rt
            .block_on(async { alkahest_rs::utils::get_public_provider("ftp://example.com").await })
            .expect_err("expected unsupported scheme to fail");
        let s = format!("{err:#}");
        assert!(
            s.contains("Unsupported RPC URL scheme"),
            "unexpected error: {s}"
        );
    }
}
