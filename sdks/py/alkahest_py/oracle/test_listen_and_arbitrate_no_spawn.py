#!/usr/bin/env python3
"""
Test the Oracle arbitrate_many functionality with All mode (past + future)
"""

import pytest
import time
from alkahest_py import (
    EnvTestManager,
    ArbitrationMode,
    MockERC20,
    TrustedOracleArbiterDemandData,
)

@pytest.mark.asyncio
async def test_arbitrate_many_all(env, alice_client, bob_client, charlie_client):
    """Test arbitrate_many with All mode: processes past arbitrations and waits for new ones"""

    # Setup escrow
    mock_erc20 = MockERC20(env.mock_addresses.erc20_a, env.god_wallet_provider)
    mock_erc20.transfer(env.alice, 100)

    price = {"address": env.mock_addresses.erc20_a, "value": 100}
    trusted_oracle_arbiter = env.addresses.arbiters_addresses.trusted_oracle_arbiter

    # The inner data field - this is what gets passed to arbitrate() and used for decisionKey
    inner_demand_data = b""  # Empty bytes for this simple test

    # The full encoded DemandData - this is what gets stored in the escrow
    demand_data = TrustedOracleArbiterDemandData(env.charlie, inner_demand_data)
    demand_bytes = demand_data.encode_self()

    arbiter = {
        "arbiter": trusted_oracle_arbiter,
        "demand": demand_bytes
    }

    expiration = int(time.time()) + 3600
    escrow_receipt = await alice_client.erc20.escrow.default.permit_and_create(
        price, arbiter, expiration
    )
    escrow_uid = escrow_receipt['log']['uid']

    # Make fulfillment
    string_client = bob_client.string_obligation
    fulfillment_uid = await string_client.do_obligation("good", escrow_uid)

    # Bob (fulfiller) requests Charlie (oracle) to arbitrate
    await bob_client.oracle.request_arbitration(fulfillment_uid, env.charlie, demand_bytes)

    oracle_client = charlie_client.oracle

    # Decision function
    def decision_function(attestation, demand):
        obligation_str = charlie_client.extract_obligation_data(attestation)
        print(f"Arbitrating obligation: {obligation_str}")
        return obligation_str == "good"

    # Callback function - NOTE: only called for NEW arbitrations while listening, not past ones
    decision_count = {"count": 0}
    def callback(decision):
        decision_count["count"] += 1
        print(f"Callback: Decision made: {decision.decision}")

    # Arbitrate with All mode and short timeout (processes past, then times out)
    decisions = await oracle_client.arbitrate_many(
        decision_function,
        callback,
        ArbitrationMode.All,
        timeout_seconds=1.0  # Short timeout since we're not expecting new events
    )

    # Verify result - past arbitrations are in the decisions list
    assert len(decisions) == 1, f"Expected 1 decision, got {len(decisions)}"
    assert decisions[0].decision == True, "Expected decision to be True"

    # The callback is NOT called for past arbitrations, only for new ones while listening
    # Since we timeout immediately, no new arbitrations come in, so callback count is 0
    print(f"Past decisions processed: {len(decisions)}")
    print(f"New arbitrations (callback called): {decision_count['count']}")
    print("Arbitrate many with All mode passed")
