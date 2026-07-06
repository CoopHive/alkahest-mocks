use std::{
    convert::TryInto,
    process::Command,
    sync::Arc,
    thread::sleep,
    time::{Duration as StdDuration, SystemTime, UNIX_EPOCH},
};

use alkahest_rs::{
    DefaultAlkahestClient,
    clients::oracle::ArbitrationMode,
    contracts::{self, obligations::StringObligation},
    extensions::{HasErc20, HasOracle, HasStringObligation},
    fixtures::MockERC20Permit,
    types::{ArbiterData, Erc20Data},
    utils::{TestContext, setup_test_environment},
};
use alloy::{primitives::Bytes, sol_types::SolType};
use eyre::{Result, WrapErr, eyre};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct ShellTestCase {
    input: String,
    output: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct ShellOracleDemand {
    description: String,
    test_cases: Vec<ShellTestCase>,
}

async fn run_synchronous_oracle_capitalization_example(test: &TestContext) -> eyre::Result<()> {
    // Charlie is the off-chain oracle Alice requests in her escrow demand.
    let charlie_client = &test.charlie_client;
    let charlie_oracle = charlie_client.oracle().clone();
    println!("step1: charlie oracle client set up");
    // Step 1. Alice escrows ERC20 collateral guarded by Charlie's oracle suite.
    let mock_erc20 = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
    mock_erc20
        .transfer(test.alice.address(), 100u64.try_into()?)
        .send()
        .await?
        .get_receipt()
        .await?;

    let demand_payload = ShellOracleDemand {
        description: "Capitalize stdin".to_owned(),
        test_cases: vec![
            ShellTestCase {
                input: "alice".to_owned(),
                output: "ALICE".to_owned(),
            },
            ShellTestCase {
                input: "bob builder".to_owned(),
                output: "BOB BUILDER".to_owned(),
            },
        ],
    };

    // The inner data field (JSON payload) - this is what gets passed to arbitrate()
    let inner_demand_data: Bytes = Bytes::from(
        serde_json::to_vec(&demand_payload).wrap_err("failed to encode oracle demand payload")?,
    );

    // The full encoded DemandData - this is what gets stored in the escrow
    let encoded_demand: Bytes = contracts::arbiters::TrustedOracleArbiter::DemandData {
        oracle: charlie_client.address,
        data: inner_demand_data.clone(),
    }
    .into();

    let arbiter_item = ArbiterData {
        arbiter: test.addresses.arbiters_addresses.trusted_oracle_arbiter,
        demand: encoded_demand.clone(),
    };

    let price = Erc20Data {
        address: test.mock_addresses.erc20_a,
        value: 100u64.try_into()?,
    };

    let expiration = SystemTime::now()
        .duration_since(UNIX_EPOCH)?
        .checked_add(StdDuration::from_secs(3600))
        .ok_or_else(|| eyre!("expiration overflow"))?
        .as_secs();

    let escrow_receipt = test
        .alice_client
        .erc20()
        .escrow()
        .default()
        .permit_and_create(&price, &arbiter_item, expiration)
        .await?;
    let escrow_uid = DefaultAlkahestClient::get_attested_event(escrow_receipt)?.uid;

    println!("step2: alice escrowed with uid {}", escrow_uid);
    // Step 2. Bob submits a bash pipeline fulfillment.
    let fulfillment_receipt = test
        .bob_client
        .string_obligation()
        .do_obligation(
            "tr '[:lower:]' '[:upper:]'".to_owned(),
            None,
            Some(escrow_uid),
        )
        .await?;
    let fulfillment_uid = DefaultAlkahestClient::get_attested_event(fulfillment_receipt)?.uid;

    println!("step3: bob fulfilled with uid {}", fulfillment_uid);
    // Step 3. Bob asks Charlie to arbitrate his fulfillment.
    test.bob_client
        .oracle()
        .request_arbitration(fulfillment_uid, charlie_client.address, encoded_demand)
        .await?;

    println!("step4: bob requested arbitration from charlie");
    // Step 4. Charlie evaluates the backlog and watches for new fulfillments.
    let charlie_client_for_closure = Arc::new(charlie_client.clone());
    let listen_result = charlie_oracle
        .arbitrate_many_async(
            move |awd| {
                let charlie_client_for_closure = charlie_client_for_closure.clone();
                let attestation = awd.attestation.clone();
                let demand = awd.demand.clone();
                async move {
                    // Extract the obligation data from the fulfillment attestation
                    let Ok(statement) = charlie_client_for_closure
                        .extract_obligation_data::<StringObligation::ObligationData>(&attestation)
                    else {
                        return Some(false);
                    };

                    let Ok(decoded_demand) =
                        <contracts::arbiters::TrustedOracleArbiter::DemandData as SolType>::abi_decode(
                            demand.as_ref(),
                        )
                    else {
                        return Some(false);
                    };
                    let Ok(payload) = serde_json::from_slice::<ShellOracleDemand>(decoded_demand.data.as_ref())
                    else {
                        return Some(false);
                    };

                    // Run the test cases
                    for case in payload.test_cases {
                        let command = format!("echo \"$INPUT\" | {}", statement.item);
                        let output = match Command::new("bash")
                            .arg("-lc")
                            .arg(&command)
                            .env("INPUT", &case.input)
                            .output()
                        {
                            Ok(output) if output.status.success() => {
                                String::from_utf8_lossy(&output.stdout)
                                    .trim_end()
                                    .to_owned()
                            }
                            _ => return Some(false),
                        };

                        if output != case.output {
                            return Some(false);
                        }
                    }

                    Some(true)
                }
            },
            |_| async {},
            ArbitrationMode::AllUnarbitrated,
        )
        .await?;

    eyre::ensure!(
        listen_result
            .past_decisions
            .iter()
            .all(|decision| decision.decision),
        "oracle rejected fulfillment",
    );

    listen_result
        .subscription
        .unwrap()
        .unsubscribe(&charlie_client.public_provider)
        .await?;
    println!("step5: charlie arbitrate completed");
    sleep(std::time::Duration::from_secs(1));
    // Step 5. The successful arbitration lets Bob claim the escrowed payment.
    test.bob_client
        .erc20()
        .escrow()
        .default()
        .collect(escrow_uid, fulfillment_uid)
        .await?;

    Ok(())
}

#[tokio::test]
async fn test_synchronous_offchain_oracle_capitalization_flow() -> Result<()> {
    let test = setup_test_environment().await?;
    run_synchronous_oracle_capitalization_example(&test).await
}
