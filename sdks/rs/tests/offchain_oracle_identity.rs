use std::{
    collections::HashMap, future::Future, pin::Pin, sync::OnceLock, time::Duration as StdDuration,
};

use alkahest_rs::{
    DefaultAlkahestClient,
    clients::oracle::ArbitrationMode,
    contracts::{self, obligations::StringObligation},
    extensions::{HasArbiters, HasOracle, HasStringObligation},
    utils::{TestContext, setup_test_environment},
};
use alloy::{
    dyn_abi::SolType,
    primitives::{Address, Bytes, Signature, keccak256},
    signers::{Signer, local::PrivateKeySigner},
};
use eyre::{Result, WrapErr};
use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct IdentityFulfillment {
    pubkey: Address,
    nonce: u64,
    data: String,
    signature: Vec<u8>,
}

static IDENTITY_REGISTRY: OnceLock<Mutex<HashMap<Address, u64>>> = OnceLock::new();

fn identity_registry() -> &'static Mutex<HashMap<Address, u64>> {
    IDENTITY_REGISTRY.get_or_init(|| Mutex::new(HashMap::new()))
}

fn verify_identity(
    awd: &alkahest_rs::clients::oracle::AttestationWithDemand,
) -> Pin<Box<dyn Future<Output = Option<bool>> + Send>> {
    let attestation = awd.attestation.clone();
    Box::pin(async move {
        // Extract obligation data
        let obligation: StringObligation::ObligationData =
            match StringObligation::ObligationData::abi_decode(&attestation.data) {
                Ok(o) => o,
                Err(_) => return Some(false),
            };

        let payload = obligation.item.clone();
        let parsed: IdentityFulfillment = match serde_json::from_str(&payload) {
            Ok(p) => p,
            Err(_) => return Some(false),
        };

        let mut registry = identity_registry().lock().await;
        let Some(current_nonce) = registry.get_mut(&parsed.pubkey) else {
            return Some(false);
        };

        if parsed.nonce <= *current_nonce {
            return Some(false);
        }

        if parsed.signature.len() != 65 {
            return Some(false);
        }

        let sig = match Signature::try_from(parsed.signature.as_slice()) {
            Ok(s) => s,
            Err(_) => return Some(false),
        };

        let message = format!("{}:{}", parsed.data, parsed.nonce);
        let hash = keccak256(message.as_bytes());

        let Ok(recovered) = sig.recover_address_from_prehash(&hash) else {
            return Some(false);
        };

        if recovered != parsed.pubkey {
            return Some(false);
        }

        *current_nonce = parsed.nonce;
        Some(true)
    })
}

async fn run_contextless_identity_example(test: &TestContext) -> eyre::Result<()> {
    let charlie_client = &test.charlie_client;

    let charlie_oracle = charlie_client.oracle().clone();
    let charlie_arbiters = charlie_client.arbiters().clone();

    {
        let mut registry = identity_registry().lock().await;
        registry.clear();
    }

    let identity_signer = PrivateKeySigner::random();
    let identity_address = identity_signer.address();

    {
        identity_registry().lock().await.insert(identity_address, 0);
    }

    let listen_result = charlie_oracle
        .arbitrate_many_async(verify_identity, |_| async {}, ArbitrationMode::Future)
        .await?;

    let demand: Bytes = contracts::arbiters::TrustedOracleArbiter::DemandData {
        oracle: charlie_client.address,
        data: Bytes::default(),
    }
    .into();

    async fn create_payload(
        signer: &PrivateKeySigner,
        address: Address,
        nonce: u64,
    ) -> Result<String> {
        let message = format!("{}:{}", "proof-of-identity", nonce);
        let hash = keccak256(message.as_bytes());
        let signature = signer.sign_hash(&hash).await?;
        let payload = IdentityFulfillment {
            pubkey: address,
            nonce,
            data: "proof-of-identity".to_owned(),
            signature: signature.as_bytes().to_vec(),
        };
        Ok(serde_json::to_string(&payload)?)
    }

    let good_payload = create_payload(&identity_signer, identity_address, 1).await?;
    let good_receipt = test
        .bob_client
        .string_obligation()
        .do_obligation(good_payload, None, None)
        .await?;
    let good_uid = DefaultAlkahestClient::get_attested_event(good_receipt)?.uid;

    test.bob_client
        .oracle()
        .request_arbitration(good_uid, charlie_client.address, demand.clone())
        .await?;

    let first_log = tokio::time::timeout(
        StdDuration::from_secs(10),
        charlie_arbiters.trusted_oracle().wait_for_arbitration(
            charlie_client.address,
            good_uid,
            None,
        ),
    )
    .await
    .wrap_err("timeout waiting for approval arbitration")??;

    let first_decision = first_log.decision;
    assert!(first_decision);

    let current_nonce = *identity_registry()
        .lock()
        .await
        .get(&identity_address)
        .unwrap();
    assert_eq!(current_nonce, 1);

    let bad_payload = create_payload(&identity_signer, identity_address, 1).await?;
    let bad_receipt = test
        .bob_client
        .string_obligation()
        .do_obligation(bad_payload, None, None)
        .await?;
    let bad_uid = DefaultAlkahestClient::get_attested_event(bad_receipt)?.uid;

    test.bob_client
        .oracle()
        .request_arbitration(bad_uid, charlie_client.address, demand)
        .await?;

    let second_log = tokio::time::timeout(
        StdDuration::from_secs(10),
        charlie_arbiters.trusted_oracle().wait_for_arbitration(
            charlie_client.address,
            bad_uid,
            None,
        ),
    )
    .await
    .wrap_err("timeout waiting for rejection arbitration")??;

    assert!(!second_log.decision);

    listen_result
        .subscription
        .unwrap()
        .unsubscribe(&test.charlie_client.public_provider)
        .await?;

    identity_registry().lock().await.clear();

    Ok(())
}

#[tokio::test]
async fn test_contextless_identity_oracle_flow() -> Result<()> {
    let test = setup_test_environment().await?;
    run_contextless_identity_example(&test).await
}
