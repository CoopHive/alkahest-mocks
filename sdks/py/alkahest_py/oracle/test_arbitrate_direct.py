#!/usr/bin/env python3
"""
Test the Oracle direct arbitration methods: arbitrate, wait_for_arbitration,
get_escrow_attestation, get_escrow_and_demand
"""

import pytest
import time
from alkahest_py import (
    EnvTestManager,
    MockERC20,
    TrustedOracleArbiterDemandData,
)

@pytest.mark.asyncio
async def test_arbitrate_direct(env, alice_client, bob_client, charlie_client):
    """Test direct arbitration using oracle_client.arbitrate_raw()"""

    # Setup escrow
    mock_erc20 = MockERC20(env.mock_addresses.erc20_a, env.god_wallet_provider)
    mock_erc20.transfer(env.alice, 100)

    price = {"address": env.mock_addresses.erc20_a, "value": 100}
    trusted_oracle_arbiter = env.addresses.arbiters_addresses.trusted_oracle_arbiter

    # The inner data field
    inner_demand_data = b""

    # Full encoded DemandData
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

    # Charlie (oracle) arbitrates directly
    oracle_client = charlie_client.oracle
    tx_hash = await oracle_client.arbitrate_raw(fulfillment_uid, inner_demand_data, True)
    assert tx_hash is not None, "Arbitration should return a transaction hash"
    assert tx_hash.startswith("0x"), f"Transaction hash should start with 0x, got {tx_hash}"

    print(f"Direct arbitration succeeded with tx: {tx_hash}")

@pytest.mark.asyncio
async def test_wait_for_arbitration(env, alice_client, bob_client, charlie_client):
    """Test waiting for arbitration event using oracle_client.wait_for_arbitration()"""

    # Setup escrow
    mock_erc20 = MockERC20(env.mock_addresses.erc20_a, env.god_wallet_provider)
    mock_erc20.transfer(env.alice, 100)

    price = {"address": env.mock_addresses.erc20_a, "value": 100}
    trusted_oracle_arbiter = env.addresses.arbiters_addresses.trusted_oracle_arbiter

    inner_demand_data = b""
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

    # Charlie (oracle) arbitrates
    oracle_client = charlie_client.oracle
    await oracle_client.arbitrate_raw(fulfillment_uid, inner_demand_data, True)

    # Wait for arbitration event (should find it immediately since it's already done)
    event = await oracle_client.wait_for_arbitration(
        fulfillment_uid,
        inner_demand_data,
        env.charlie,
        0  # from_block
    )

    assert event is not None, "Should find arbitration event"
    assert event.decision == True, f"Expected decision=True, got {event.decision}"
    assert event.oracle.lower() == env.charlie.lower(), "Oracle address should match"

    print(f"Found arbitration event: decision={event.decision}")

@pytest.mark.asyncio
async def test_get_escrow_attestation(env, alice_client, bob_client, charlie_client):
    """Test getting escrow attestation from a fulfillment attestation"""

    # Setup escrow
    mock_erc20 = MockERC20(env.mock_addresses.erc20_a, env.god_wallet_provider)
    mock_erc20.transfer(env.alice, 100)

    price = {"address": env.mock_addresses.erc20_a, "value": 100}
    trusted_oracle_arbiter = env.addresses.arbiters_addresses.trusted_oracle_arbiter

    inner_demand_data = b""
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
    fulfillment_uid = await string_client.do_obligation("test_data", escrow_uid)

    # Bob (fulfiller) requests Charlie (oracle) to arbitrate
    await bob_client.oracle.request_arbitration(fulfillment_uid, env.charlie, demand_bytes)

    oracle_client = charlie_client.oracle

    # Get a fulfillment attestation (we need to construct one with the ref_uid)
    from alkahest_py import OracleAttestation
    fulfillment_attestation = OracleAttestation(
        uid=fulfillment_uid,
        schema="0x" + "00" * 32,
        ref_uid=escrow_uid,
        time=0,
        expiration_time=0,
        revocation_time=0,
        recipient="0x" + "00" * 20,
        attester="0x" + "00" * 20,
        revocable=True,
        data="0x"
    )

    # Get escrow attestation
    escrow_attestation = await oracle_client.get_escrow_attestation(fulfillment_attestation)

    assert escrow_attestation is not None, "Should get escrow attestation"
    assert escrow_attestation.uid == escrow_uid, f"Escrow UID should match: {escrow_attestation.uid} vs {escrow_uid}"

    print(f"Got escrow attestation: {escrow_attestation.uid}")

@pytest.mark.asyncio
async def test_get_escrow_and_demand(env, alice_client, bob_client, charlie_client):
    """Test getting escrow attestation and demand data in one call"""

    # Setup escrow
    mock_erc20 = MockERC20(env.mock_addresses.erc20_a, env.god_wallet_provider)
    mock_erc20.transfer(env.alice, 100)

    price = {"address": env.mock_addresses.erc20_a, "value": 100}
    trusted_oracle_arbiter = env.addresses.arbiters_addresses.trusted_oracle_arbiter

    inner_demand_data = b"test_demand"
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
    fulfillment_uid = await string_client.do_obligation("test_data", escrow_uid)

    # Construct fulfillment attestation
    from alkahest_py import OracleAttestation
    fulfillment_attestation = OracleAttestation(
        uid=fulfillment_uid,
        schema="0x" + "00" * 32,
        ref_uid=escrow_uid,
        time=0,
        expiration_time=0,
        revocation_time=0,
        recipient="0x" + "00" * 20,
        attester="0x" + "00" * 20,
        revocable=True,
        data="0x"
    )

    # Get escrow and demand in one call
    oracle_client = charlie_client.oracle
    escrow_attestation, extracted_demand = await oracle_client.get_escrow_and_demand(fulfillment_attestation)

    assert escrow_attestation is not None, "Should get escrow attestation"
    assert escrow_attestation.uid == escrow_uid, f"Escrow UID should match"
    assert extracted_demand is not None, "Should get demand data"
    assert extracted_demand.oracle.lower() == env.charlie.lower(), f"Oracle should match: {extracted_demand.oracle} vs {env.charlie}"
    assert bytes(extracted_demand.data) == inner_demand_data, f"Demand data should match: {bytes(extracted_demand.data)} vs {inner_demand_data}"

    print(f"Got escrow and demand: oracle={extracted_demand.oracle}, data={bytes(extracted_demand.data)}")
