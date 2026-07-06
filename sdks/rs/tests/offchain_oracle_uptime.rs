use std::{
    collections::HashMap,
    convert::TryInto,
    future::Future,
    pin::Pin,
    sync::{Arc, OnceLock},
    time::{Duration as StdDuration, SystemTime, UNIX_EPOCH},
};

use alkahest_rs::{
    DefaultAlkahestClient,
    clients::oracle::ArbitrationMode,
    contracts::{self, obligations::StringObligation},
    extensions::{HasArbiters, HasErc20, HasOracle, HasStringObligation},
    fixtures::MockERC20Permit,
    types::{ArbiterData, Erc20Data},
    utils::{TestContext, setup_test_environment},
};
use alloy::{
    primitives::{Bytes, FixedBytes},
    sol_types::SolType,
};
use eyre::{Result, WrapErr, eyre};
use serde::{Deserialize, Serialize};
use tokio::sync::{Mutex, Notify};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct UptimeDemand {
    service_url: String,
    min_uptime: f64,
    start: u64,
    end: u64,
    check_interval_secs: u64,
}

#[derive(Debug, Clone)]
struct PingEvent {
    delay: StdDuration,
    success: bool,
}

#[derive(Debug, Clone)]
struct UptimeJob {
    min_uptime: f64,
    schedule: Vec<PingEvent>,
    demand: Bytes,
}

type JobDb = Arc<Mutex<HashMap<FixedBytes<32>, UptimeJob>>>;
type UrlIndex = Arc<Mutex<HashMap<String, FixedBytes<32>>>>;

#[derive(Clone)]
struct SchedulerContext {
    job_db: JobDb,
    notify: Arc<Notify>,
    url_index: UrlIndex,
    client: Arc<alkahest_rs::AlkahestClient<alkahest_rs::extensions::BaseExtensions>>,
}

static SCHEDULER_STATE: OnceLock<Mutex<Option<SchedulerContext>>> = OnceLock::new();

fn scheduler_state() -> &'static Mutex<Option<SchedulerContext>> {
    SCHEDULER_STATE.get_or_init(|| Mutex::new(None))
}

fn schedule_pings(
    awd: &alkahest_rs::clients::oracle::AttestationWithDemand,
) -> Pin<Box<dyn Future<Output = Option<bool>> + Send>> {
    let attestation = awd.attestation.clone();
    let demand_bytes = awd.demand.clone();

    Box::pin(async move {
        let ctx_opt = scheduler_state().lock().await.clone();
        let Some(ctx) = ctx_opt else {
            return None;
        };

        // Extract obligation data
        let Ok(statement) = ctx
            .client
            .extract_obligation_data::<StringObligation::ObligationData>(&attestation)
        else {
            return None;
        };

        let url = statement.item.clone();
        let Some(uid) = ctx.url_index.lock().await.get(&url).cloned() else {
            return None;
        };

        let Ok(decoded_demand) =
            <contracts::arbiters::TrustedOracleArbiter::DemandData as SolType>::abi_decode(
                demand_bytes.as_ref(),
            )
        else {
            return None;
        };

        let inner_demand_data = decoded_demand.data;
        let Ok(parsed_demand) = serde_json::from_slice::<UptimeDemand>(inner_demand_data.as_ref())
        else {
            return None;
        };

        let total_span = parsed_demand.end.saturating_sub(parsed_demand.start).max(1);
        let interval = parsed_demand.check_interval_secs.max(1);
        let checks = (total_span / interval).max(1) as usize;

        let mut schedule = Vec::with_capacity(checks);
        for i in 0..checks {
            let delay_ms = 100 + (i * 25) as u64;
            let success = i != 1;
            schedule.push(PingEvent {
                delay: StdDuration::from_millis(delay_ms),
                success,
            });
        }

        ctx.job_db.lock().await.entry(uid).or_insert(UptimeJob {
            min_uptime: parsed_demand.min_uptime,
            schedule,
            demand: inner_demand_data,
        });
        ctx.notify.notify_one();
        None
    })
}

async fn setup_escrow_with_uptime_demand(
    test: &TestContext,
    demand: &UptimeDemand,
    oracle: alloy::primitives::Address,
) -> eyre::Result<(FixedBytes<32>, FixedBytes<32>, String, Bytes)> {
    let mock_erc20 = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
    mock_erc20
        .transfer(test.alice.address(), 100u64.try_into()?)
        .send()
        .await?
        .get_receipt()
        .await?;

    // The inner data field (JSON payload) - this is what gets used for arbitration
    let inner_demand_data: Bytes = Bytes::from(serde_json::to_vec(demand)?);

    // The full encoded DemandData - this is what gets stored in the escrow
    let encoded_demand: Bytes = contracts::arbiters::TrustedOracleArbiter::DemandData {
        oracle,
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

    let service_url = demand.service_url.clone();
    let fulfillment_receipt = test
        .bob_client
        .string_obligation()
        .do_obligation(service_url.clone(), None, Some(escrow_uid))
        .await?;
    let fulfillment_uid = DefaultAlkahestClient::get_attested_event(fulfillment_receipt)?.uid;

    Ok((escrow_uid, fulfillment_uid, service_url, encoded_demand))
}

async fn run_async_uptime_oracle_example(test: &TestContext) -> eyre::Result<()> {
    let charlie_client = &test.charlie_client;

    let charlie_oracle = charlie_client.oracle().clone();
    let charlie_arbiters = charlie_client.arbiters().clone();

    let now = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();
    let demand = UptimeDemand {
        service_url: "https://uptime.hyperspace".to_owned(),
        min_uptime: 0.75,
        start: now,
        end: now + 10,
        check_interval_secs: 2,
    };

    let (escrow_uid, fulfillment_uid, service_url, encoded_demand) =
        setup_escrow_with_uptime_demand(test, &demand, charlie_client.address).await?;

    let url_index: UrlIndex = Arc::new(Mutex::new(HashMap::new()));
    url_index
        .lock()
        .await
        .insert(service_url.clone(), fulfillment_uid);

    let job_db: JobDb = Arc::new(Mutex::new(HashMap::new()));
    let scheduler_notify = Arc::new(Notify::new());

    let worker_db = Arc::clone(&job_db);
    let worker_notify = Arc::clone(&scheduler_notify);
    let worker_arbiters = charlie_arbiters.clone();

    let worker = tokio::spawn(async move {
        loop {
            let maybe_job = {
                let mut db = worker_db.lock().await;
                if let Some((&uid, job)) = db.iter().next() {
                    let job = job.clone();
                    db.remove(&uid);
                    Some((uid, job))
                } else {
                    None
                }
            };

            if let Some((uid, job)) = maybe_job {
                let mut successes = 0usize;
                let total_checks = job.schedule.len().max(1);
                for ping in job.schedule {
                    tokio::time::sleep(ping.delay).await;
                    if ping.success {
                        successes += 1;
                    }
                }
                let uptime = successes as f64 / total_checks as f64;
                let decision = uptime >= job.min_uptime;
                worker_arbiters
                    .trusted_oracle()
                    .arbitrate_raw(uid, job.demand.clone(), decision)
                    .await
                    .expect("oracle arbitration tx should succeed");
            } else {
                match tokio::time::timeout(StdDuration::from_secs(2), worker_notify.notified())
                    .await
                {
                    Ok(_) => continue,
                    Err(_) => {
                        if worker_db.lock().await.is_empty() {
                            break;
                        }
                    }
                }
            }
        }
    });

    // Setup scheduler context
    {
        let mut slot = scheduler_state().lock().await;
        *slot = Some(SchedulerContext {
            job_db: Arc::clone(&job_db),
            notify: Arc::clone(&scheduler_notify),
            url_index: Arc::clone(&url_index),
            client: Arc::new(charlie_client.clone()),
        });
    }

    test.bob_client
        .oracle()
        .request_arbitration(fulfillment_uid, charlie_client.address, encoded_demand)
        .await?;

    // Listen for arbitration requests
    let listen_result = charlie_oracle
        .arbitrate_many_async(
            schedule_pings,
            |_| async {},
            ArbitrationMode::AllUnarbitrated,
        )
        .await?;

    // Wait for the oracle to make a decision
    tokio::time::timeout(
        StdDuration::from_secs(10),
        charlie_arbiters.trusted_oracle().wait_for_arbitration(
            charlie_client.address,
            fulfillment_uid,
            None,
        ),
    )
    .await
    .wrap_err("timed out waiting for oracle decision")??;

    let _collection_receipt = tokio::time::timeout(StdDuration::from_secs(10), async {
        loop {
            match test
                .bob_client
                .erc20()
                .escrow()
                .default()
                .collect(escrow_uid, fulfillment_uid)
                .await
            {
                Ok(receipt) => break receipt,
                Err(_) => tokio::time::sleep(StdDuration::from_millis(100)).await,
            }
        }
    })
    .await
    .wrap_err("timed out waiting to collect escrow")?;

    listen_result
        .subscription
        .unwrap()
        .unsubscribe(&test.charlie_client.public_provider)
        .await?;

    worker.await.unwrap();

    {
        let mut slot = scheduler_state().lock().await;
        *slot = None;
    }

    Ok(())
}

#[tokio::test]
async fn test_asynchronous_offchain_oracle_uptime_flow() -> Result<()> {
    let test = setup_test_environment().await?;
    run_async_uptime_oracle_example(&test).await
}
