#!/usr/bin/env python3
"""
Test the Oracle arbitrate_many functionality with simplified API
"""

import pytest
import time
from alkahest_py import (
    EnvTestManager,
    StringObligationData,
    ArbitrationMode,
    MockERC20,
    TrustedOracleArbiterDemandData,
)

@pytest.mark.asyncio
async def test_arbitrate_past_sync(env, alice_client, bob_client, charlie_client):
    """Test trivial arbitrate_many: escrow -> fulfillment -> arbitration -> collection"""

    # Setup escrow with proper oracle demand data
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

    # Make fulfillment obligation
    string_client = bob_client.string_obligation
    fulfillment_uid = await string_client.do_obligation("good", escrow_uid)

    # Bob (fulfiller) requests Charlie (oracle) to arbitrate
    await bob_client.oracle.request_arbitration(fulfillment_uid, env.charlie, demand_bytes)

    # Decision function that approves "good" obligations
    def decision_function(attestation, demand):
        """Decision function receives attestation and demand as separate arguments"""
        obligation_str = charlie_client.extract_obligation_data(attestation)
        print(f"Decision function called with obligation: {obligation_str}, demand: {len(demand)} bytes")
        return obligation_str == "good"

    # Charlie (oracle) arbitrates
    oracle_client = charlie_client.oracle
    decisions = await oracle_client.arbitrate_many(decision_function, None, ArbitrationMode.Past)

    # Verify arbitration found decisions
    assert len(decisions) == 1, f"Expected 1 decision, got {len(decisions)}"
    assert decisions[0].decision == True, f"Expected decision=True, got {decisions[0].decision}"

    # Collect payment
    collection_receipt = await bob_client.erc20.escrow.default.collect(
        escrow_uid, fulfillment_uid
    )

    # Verify collection receipt
    assert collection_receipt is not None, "Collection receipt should not be None"
    print(f"Arbitrate decision passed. Tx: {collection_receipt}")

@pytest.mark.asyncio
async def test_conditional_arbitrate_past(env, alice_client, bob_client, charlie_client):
    """Test conditional arbitrate_many: approve only 'good' obligations"""

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

    # Make two fulfillments: one good, one bad
    string_client = bob_client.string_obligation
    good_fulfillment = await string_client.do_obligation("good", escrow_uid)
    bad_fulfillment = await string_client.do_obligation("bad", escrow_uid)

    # Bob (fulfiller) requests Charlie (oracle) to arbitrate both
    await bob_client.oracle.request_arbitration(good_fulfillment, env.charlie, demand_bytes)
    await bob_client.oracle.request_arbitration(bad_fulfillment, env.charlie, demand_bytes)

    # Decision function that approves only "good" obligations
    def decision_function(attestation, demand):
        obligation_str = charlie_client.extract_obligation_data(attestation)
        return obligation_str == "good"

    # Charlie (oracle) arbitrates both
    oracle_client = charlie_client.oracle
    decisions = await oracle_client.arbitrate_many(decision_function, None, ArbitrationMode.Past)

    # Verify we got 2 decisions, only 1 approved
    assert len(decisions) == 2, f"Expected 2 decisions, got {len(decisions)}"
    approved = [d for d in decisions if d.decision]
    assert len(approved) == 1, f"Expected 1 approved decision, got {len(approved)}"

    print(f"Conditional arbitration passed: {len(approved)}/2 approved")

@pytest.mark.asyncio
async def test_skip_arbitrated(env, alice_client, bob_client, charlie_client):
    """Test PastUnarbitrated mode prevents re-arbitrating"""

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

    # Decision function
    def decision_function(attestation, demand):
        obligation_str = charlie_client.extract_obligation_data(attestation)
        return obligation_str == "good"

    # Charlie (oracle) arbitrates
    oracle_client = charlie_client.oracle
    decisions = await oracle_client.arbitrate_many(decision_function, None, ArbitrationMode.Past)
    assert len(decisions) == 1, "First arbitration should find 1 decision"

    # Second arbitration with PastUnarbitrated mode should find nothing (already arbitrated)
    decisions2 = await oracle_client.arbitrate_many(decision_function, None, ArbitrationMode.PastUnarbitrated)
    assert len(decisions2) == 0, "Second arbitration with PastUnarbitrated should find 0 decisions"

    print("Skip arbitrated option works correctly")
