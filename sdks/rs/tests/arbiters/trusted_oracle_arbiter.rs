use crate::arbiters::common::create_test_attestation;
use alkahest_rs::{
    contracts::arbiters::TrustedOracleArbiter, extensions::HasArbiters,
    utils::setup_test_environment,
};
use alloy::{
    primitives::{Address, Bytes, FixedBytes, bytes},
    providers::Provider as _,
};

#[tokio::test]
async fn test_trusted_oracle_arbiter_constructor() -> eyre::Result<()> {
    // Setup test environment
    let test = setup_test_environment().await?;

    let obligation_uid = FixedBytes::<32>::from_slice(&[1u8; 32]);

    // Create an attestation with the obligation UID
    let attestation = create_test_attestation(Some(obligation_uid), None);

    // Create demand data with oracle as bob
    let demand_data = TrustedOracleArbiter::DemandData {
        oracle: test.bob.address(),
        data: bytes!(""),
    };

    // Encode demand data
    let demand: alloy::primitives::Bytes = demand_data.into();
    let counteroffer = FixedBytes::<32>::default();

    // Check obligation - should be false initially since no decision has been made
    let trusted_oracle_arbiter = TrustedOracleArbiter::new(
        test.addresses.arbiters_addresses.trusted_oracle_arbiter,
        &test.alice_client.wallet_provider,
    );

    let result = trusted_oracle_arbiter
        .check(attestation.into(), demand, counteroffer)
        .call()
        .await?;

    // Should be false initially
    assert!(
        !result,
        "TrustedOracleArbiter should initially return false"
    );

    Ok(())
}

#[tokio::test]
async fn test_trusted_oracle_arbiter_arbitrate() -> eyre::Result<()> {
    // Setup test environment
    let test = setup_test_environment().await?;

    let obligation_uid = FixedBytes::<32>::from_slice(&[1u8; 32]);

    // Create an attestation with the obligation UID
    let attestation = create_test_attestation(Some(obligation_uid), None);

    // Create demand data with oracle as bob
    let demand_data = TrustedOracleArbiter::DemandData {
        oracle: test.bob.address(),
        data: Bytes::default(),
    };

    // Encode demand data
    let demand: Bytes = demand_data.into();
    let counteroffer = FixedBytes::<32>::default();

    // Check contract interface
    let trusted_oracle_arbiter = TrustedOracleArbiter::new(
        test.addresses.arbiters_addresses.trusted_oracle_arbiter,
        &test.alice_client.wallet_provider,
    );

    // Initially the decision should be false (default value)
    let initial_result = trusted_oracle_arbiter
        .check(attestation.clone().into(), demand.clone(), counteroffer)
        .call()
        .await?;

    assert!(!initial_result, "Decision should initially be false");

    // Make a positive arbitration decision using our client
    let arbitrate_hash = test
        .bob_client
        .arbiters()
        .trusted_oracle()
        .arbitrate_raw(obligation_uid, Bytes::default(), true)
        .await?
        .transaction_hash;

    // Wait for transaction receipt
    let _receipt = test
        .alice_client
        .public_provider
        .get_transaction_receipt(arbitrate_hash)
        .await?;

    // Now the decision should be true
    let final_result = trusted_oracle_arbiter
        .check(attestation.into(), demand, counteroffer)
        .call()
        .await?;

    assert!(
        final_result,
        "Decision should now be true after arbitration"
    );

    Ok(())
}

#[tokio::test]
async fn test_trusted_oracle_arbiter_with_different_oracles() -> eyre::Result<()> {
    // Setup test environment
    let test = setup_test_environment().await?;

    let obligation_uid = FixedBytes::<32>::from_slice(&[1u8; 32]);

    // Set up two different oracles
    let oracle1 = test.bob.address();
    let oracle2 = test.alice.address();

    // Oracle 1 (Bob) makes a positive decision
    let arbitrate_hash1 = test
        .bob_client
        .arbiters()
        .trusted_oracle()
        .arbitrate_raw(obligation_uid, Bytes::default(), true)
        .await?
        .transaction_hash;

    // Wait for transaction receipt
    let _receipt1 = test
        .alice_client
        .public_provider
        .get_transaction_receipt(arbitrate_hash1)
        .await?;

    // Oracle 2 (Alice) makes a negative decision
    let arbitrate_hash2 = test
        .alice_client
        .arbiters()
        .trusted_oracle()
        .arbitrate_raw(obligation_uid, Bytes::default(), false)
        .await?
        .transaction_hash;

    // Wait for transaction receipt
    let _receipt2 = test
        .alice_client
        .public_provider
        .get_transaction_receipt(arbitrate_hash2)
        .await?;

    // Create the attestation
    let attestation = create_test_attestation(Some(obligation_uid), None);
    let trusted_oracle_arbiter = TrustedOracleArbiter::new(
        test.addresses.arbiters_addresses.trusted_oracle_arbiter,
        &test.alice_client.wallet_provider,
    );

    // Check with oracle1 (Bob) - should be true
    let demand_data1 = TrustedOracleArbiter::DemandData {
        oracle: oracle1,
        data: Bytes::default(),
    };
    let demand1 = demand_data1.into();
    let counteroffer = FixedBytes::<32>::default();

    let result1 = trusted_oracle_arbiter
        .check(attestation.clone().into(), demand1, counteroffer)
        .call()
        .await?;

    assert!(result1, "Decision for Oracle 1 (Bob) should be true");

    // Check with oracle2 (Alice) - should be false
    let demand_data2 = TrustedOracleArbiter::DemandData {
        oracle: oracle2,
        data: bytes!(""),
    };
    let demand2 = demand_data2.into();

    let result2 = trusted_oracle_arbiter
        .check(attestation.into(), demand2, counteroffer)
        .call()
        .await?;

    assert!(!result2, "Decision for Oracle 2 (Alice) should be false");

    Ok(())
}

#[tokio::test]
async fn test_trusted_oracle_arbiter_with_no_decision() -> eyre::Result<()> {
    // Setup test environment
    let test = setup_test_environment().await?;

    // Create a new oracle address that hasn't made a decision
    let new_oracle = Address::from_slice(&[0x42; 20]);
    let obligation_uid = FixedBytes::<32>::from_slice(&[1u8; 32]);

    // Create the attestation
    let attestation = create_test_attestation(Some(obligation_uid), None);

    // Create demand data with the new oracle
    let demand_data = TrustedOracleArbiter::DemandData {
        oracle: new_oracle,
        data: bytes!(""),
    };

    // Encode demand data
    let demand = demand_data.into();
    let counteroffer = FixedBytes::<32>::default();

    // Check with the new oracle - should be false (default value)
    let trusted_oracle_arbiter = TrustedOracleArbiter::new(
        test.addresses.arbiters_addresses.trusted_oracle_arbiter,
        &test.alice_client.wallet_provider,
    );

    let result = trusted_oracle_arbiter
        .check(attestation.into(), demand, counteroffer)
        .call()
        .await?;

    assert!(
        !result,
        "Decision for an oracle that hasn't made a decision should be false"
    );

    Ok(())
}

#[tokio::test]
#[serial_test::serial]
async fn test_wait_for_trusted_oracle_arbitration() -> eyre::Result<()> {
    // Setup test environment
    let test = setup_test_environment().await?;

    let obligation_uid = FixedBytes::<32>::from_slice(&[42u8; 32]);
    let oracle = test.bob.address();

    // Start listening for arbitration events in the background
    let listener_task = tokio::spawn({
        let alice_client = test.alice_client.clone();
        let obligation_uid = obligation_uid.clone();
        async move {
            alice_client
                .arbiters()
                .trusted_oracle()
                .wait_for_arbitration(oracle, obligation_uid, None)
                .await
        }
    });

    // Ensure the listener is running
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Make an arbitration decision
    let arbitrate_hash = test
        .bob_client
        .arbiters()
        .trusted_oracle()
        .arbitrate_raw(obligation_uid, Bytes::default(), true)
        .await?
        .transaction_hash;

    // Wait for transaction receipt
    let _receipt = test
        .alice_client
        .public_provider
        .get_transaction_receipt(arbitrate_hash)
        .await?;

    // Wait for the listener to pick up the event
    let log_result =
        tokio::time::timeout(tokio::time::Duration::from_secs(5), listener_task).await???;

    // Verify the event data
    assert_eq!(log_result.oracle, oracle, "Oracle in event should match");
    assert_eq!(
        log_result.fulfillmentUid, obligation_uid,
        "Obligation UID in event should match"
    );
    assert!(log_result.decision, "Decision in event should be true");

    Ok(())
}

#[tokio::test]
async fn test_trusted_oracle_arbiter_trait_based_encoding() -> eyre::Result<()> {
    // Set up test environment
    let test = setup_test_environment().await?;

    let test_data = TrustedOracleArbiter::DemandData {
        oracle: test.alice.address(),
        data: bytes!(""),
    };

    // Test From trait: DemandData -> Bytes
    let encoded_bytes: alloy::primitives::Bytes = test_data.clone().into();

    // Test TryFrom trait: &Bytes -> DemandData
    let decoded_from_ref: TrustedOracleArbiter::DemandData = (&encoded_bytes).try_into()?;

    // Test TryFrom trait: Bytes -> DemandData
    let decoded_from_owned: TrustedOracleArbiter::DemandData = encoded_bytes.clone().try_into()?;

    // Verify both decoded versions match original
    assert_eq!(
        decoded_from_ref.oracle, test_data.oracle,
        "Oracle should match (from ref)"
    );
    assert_eq!(
        decoded_from_ref.data, test_data.data,
        "Data should match (from ref)"
    );

    assert_eq!(
        decoded_from_owned.oracle, test_data.oracle,
        "Oracle should match (from owned)"
    );
    assert_eq!(
        decoded_from_owned.data, test_data.data,
        "Data should match (from owned)"
    );

    println!("Original -> Bytes -> DemandData conversions successful for TrustedOracleArbiter");
    println!("Encoded bytes length: {}", encoded_bytes.len());

    Ok(())
}
