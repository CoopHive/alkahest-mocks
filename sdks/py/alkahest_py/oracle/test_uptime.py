"""
Test asynchronous offchain oracle uptime monitoring flow

Uses the full async worker pattern: the listener callback defers decisions
by returning None, and a background worker processes jobs and manually
submits arbitration decisions on-chain.
"""
import pytest
import asyncio
import json
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from alkahest_py import (
    EnvTestManager,
    MockERC20,
    TrustedOracleArbiterDemandData,
    ArbitrationMode,
)


@dataclass
class UptimeDemand:
    service_url: str
    min_uptime: float
    start: int
    end: int
    check_interval_secs: int


@dataclass
class PingEvent:
    delay_secs: float
    success: bool


@dataclass
class UptimeJob:
    min_uptime: float
    schedule: List[PingEvent]
    demand: bytes


@dataclass
class SchedulerContext:
    job_db: Dict[str, UptimeJob] = field(default_factory=dict)
    url_index: Dict[str, str] = field(default_factory=dict)
    notify: Optional[asyncio.Event] = field(default_factory=asyncio.Event)


async def run_worker(ctx: SchedulerContext, oracle_client) -> None:
    """Background worker that processes scheduled uptime jobs and submits decisions."""
    while True:
        # Get next job from queue
        uid = None
        job = None
        for k, v in list(ctx.job_db.items()):
            uid = k
            job = v
            del ctx.job_db[k]
            break

        if uid is not None and job is not None:
            # Execute the monitoring schedule
            successes = 0
            total_checks = max(len(job.schedule), 1)

            for ping in job.schedule:
                await asyncio.sleep(ping.delay_secs)
                # In production: actually ping the service
                if ping.success:
                    successes += 1

            # Calculate result and make decision
            uptime = successes / total_checks
            decision = uptime >= job.min_uptime

            # Submit decision on-chain manually
            # This is the key difference from sync oracles: we call arbitrate()
            # directly instead of returning True/False from the callback
            await oracle_client.oracle.arbitrate_raw(uid, list(job.demand), decision)
        else:
            # Wait for new work or timeout
            ctx.notify.clear()
            try:
                await asyncio.wait_for(ctx.notify.wait(), timeout=2.0)
            except asyncio.TimeoutError:
                if not ctx.job_db:
                    break  # No work and no notifications - exit


@pytest.mark.asyncio
async def test_asynchronous_offchain_oracle_uptime_flow(env, alice_client, bob_client, charlie_client):
    """
    Test an asynchronous offchain oracle that monitors service uptime.

    Uses the full async worker pattern matching the TypeScript and Rust SDKs:
    1. Listener receives arbitration requests and defers decisions (returns None)
    2. Jobs are queued for background processing
    3. Worker processes jobs over time and submits decisions manually

    Alice escrows payment for uptime monitoring service.
    Bob claims to provide the service at a URL.
    Charlie (the oracle) monitors the service asynchronously and arbitrates.
    Bob collects payment if uptime meets the threshold.
    """

    oracle_address = env.charlie
    oracle_client = charlie_client

    # Step 1: Alice escrows ERC20 with uptime demand
    mock_erc20 = MockERC20(env.mock_addresses.erc20_a, env.god_wallet_provider)
    mock_erc20.transfer(env.alice, 100)

    now = int(time.time())
    demand_payload = UptimeDemand(
        service_url="https://uptime.hyperspace",
        min_uptime=0.75,
        start=now,
        end=now + 10,
        check_interval_secs=2,
    )

    inner_demand_data = json.dumps({
        "service_url": demand_payload.service_url,
        "min_uptime": demand_payload.min_uptime,
        "start": demand_payload.start,
        "end": demand_payload.end,
        "check_interval_secs": demand_payload.check_interval_secs,
    }).encode("utf-8")

    demand_data = TrustedOracleArbiterDemandData(oracle_address, inner_demand_data)
    demand_bytes = demand_data.encode_self()

    arbiter = {
        "arbiter": env.addresses.arbiters_addresses.trusted_oracle_arbiter,
        "demand": demand_bytes,
    }

    price = {"address": env.mock_addresses.erc20_a, "value": 100}
    expiration = now + 3600

    escrow_receipt = await alice_client.erc20.escrow.default.permit_and_create(
        price, arbiter, expiration
    )
    escrow_uid = escrow_receipt["log"]["uid"]

    # Step 2: Bob submits the service URL as fulfillment
    service_url = demand_payload.service_url
    fulfillment_uid = await bob_client.string_obligation.do_obligation(
        service_url, escrow_uid
    )

    # Step 3: Request arbitration
    await bob_client.oracle.request_arbitration(
        fulfillment_uid, oracle_address, demand_bytes
    )

    # Step 4: Set up scheduler context (shared state between listener and worker)
    ctx = SchedulerContext()
    ctx.url_index[service_url] = fulfillment_uid

    # Step 5: Start background worker
    worker_task = asyncio.create_task(run_worker(ctx, oracle_client))

    # Step 6: Define scheduling callback that defers decisions
    async def schedule_decision(attestation, demand):
        """
        Schedule uptime monitoring but DON'T make a decision yet.
        Returns None to defer the decision to the background worker.
        """
        try:
            # Extract service URL from fulfillment
            statement = oracle_client.oracle.extract_obligation_data(attestation)

            # Look up the fulfillment UID from our URL index
            uid = ctx.url_index.get(statement)
            if uid is None or uid in ctx.job_db:
                return None

            decoded_demand = TrustedOracleArbiterDemandData.decode(demand)
            inner_demand = bytes(decoded_demand.data)
            demand_json = json.loads(inner_demand.decode("utf-8"))

            # Verify URL matches
            if statement != demand_json["service_url"]:
                return None

            # Create monitoring schedule
            total_span = max(demand_json["end"] - demand_json["start"], 1)
            interval = max(demand_json["check_interval_secs"], 1)
            checks = max(total_span // interval, 1)

            schedule = []
            for i in range(checks):
                schedule.append(PingEvent(
                    delay_secs=0.1 + i * 0.025,
                    # Simulate: one check fails (index 1)
                    success=(i != 1),
                ))

            # Store job for background worker
            ctx.job_db[uid] = UptimeJob(
                min_uptime=demand_json["min_uptime"],
                schedule=schedule,
                demand=inner_demand,
            )
            ctx.notify.set()  # Wake up worker

            # Return None to defer decision to the worker
            return None

        except Exception:
            return None

    def callback(decision):
        pass

    # Step 7: Run listener (processes existing arbitration requests)
    decisions = await oracle_client.oracle.arbitrate_many(
        schedule_decision,
        callback,
        ArbitrationMode.AllUnarbitrated,
        timeout_seconds=2.0,
    )

    # The listener should NOT have produced any decisions (all deferred)
    assert len(decisions) == 0, (
        f"Expected 0 decisions from listener (all deferred), got {len(decisions)}"
    )

    # Step 8: Wait for the worker to finish processing
    await asyncio.wait_for(worker_task, timeout=10.0)

    # Step 9: Verify the arbitration was submitted by the worker
    # Wait for the arbitration event on-chain
    arbitration = await oracle_client.oracle.wait_for_arbitration(
        fulfillment_uid,
        list(inner_demand_data),
        oracle_address,
        None,  # from_block
    )
    assert arbitration.decision is True, "Expected uptime check to pass"

    # Step 10: Bob collects the escrowed payment
    await bob_client.erc20.escrow.default.collect(escrow_uid, fulfillment_uid)

    print("Asynchronous offchain oracle uptime test passed")
