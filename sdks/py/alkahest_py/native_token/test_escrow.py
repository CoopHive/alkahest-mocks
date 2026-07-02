import pytest
import time
from alkahest_py import EnvTestManager, TrustedOracleArbiterDemandData

@pytest.mark.asyncio
async def test_native_token_escrow_default(env, alice_client, bob_client):
    """
    Test native token non-unconditional escrow: create, fulfill, collect.
    """

    # Use small amounts for testing
    escrow_amount = 1000  # wei

    trusted_oracle_arbiter = env.addresses.arbiters_addresses.trusted_oracle_arbiter

    inner_demand_data = b""
    demand_data = TrustedOracleArbiterDemandData(env.bob, inner_demand_data)
    demand_bytes = demand_data.encode_self()

    arbiter = {
        "arbiter": trusted_oracle_arbiter,
        "demand": demand_bytes
    }

    expiration = int(time.time()) + 3600

    # Alice creates native token escrow
    native_data = {"value": escrow_amount}
    escrow_result = await alice_client.native_token.escrow.default.create(
        native_data, arbiter, expiration
    )

    assert escrow_result is not None, "Escrow creation should return a result"
    assert 'log' in escrow_result, "Escrow result should contain log"
    escrow_uid = escrow_result['log']['uid']
    assert escrow_uid != "0x" + "00" * 32, "Should have valid escrow UID"

    print(f"Native token escrow created: {escrow_uid}")

    # Bob makes fulfillment
    string_client = bob_client.string_obligation
    fulfillment_uid = await string_client.do_obligation("fulfilled", escrow_uid)

    # Request and perform arbitration
    oracle_client = bob_client.oracle
    await oracle_client.request_arbitration(fulfillment_uid, env.bob, inner_demand_data)
    await oracle_client.arbitrate_raw(fulfillment_uid, inner_demand_data, True)

    # Bob collects
    collect_result = await bob_client.native_token.escrow.default.collect(
        escrow_uid, fulfillment_uid
    )

    assert collect_result is not None, "Collection should succeed"
    print(f"Native token collected: {collect_result}")

@pytest.mark.asyncio
async def test_native_token_escrow_unconditional(env, alice_client, bob_client):
    """
    Test native token unconditional escrow: create, fulfill, collect.
    """

    escrow_amount = 1000  # wei

    trusted_oracle_arbiter = env.addresses.arbiters_addresses.trusted_oracle_arbiter

    inner_demand_data = b""
    demand_data = TrustedOracleArbiterDemandData(env.bob, inner_demand_data)
    demand_bytes = demand_data.encode_self()

    arbiter = {
        "arbiter": trusted_oracle_arbiter,
        "demand": demand_bytes
    }

    expiration = int(time.time()) + 3600

    # Alice creates unconditional native token escrow
    native_data = {"value": escrow_amount}
    escrow_result = await alice_client.native_token.escrow.unconditional.create(
        native_data, arbiter, expiration
    )

    assert escrow_result is not None, "Unconditional escrow creation should return a result"
    escrow_uid = escrow_result['log']['uid']
    assert escrow_uid != "0x" + "00" * 32, "Should have valid escrow UID"

    print(f"Native token unconditional escrow created: {escrow_uid}")

    # Bob makes fulfillment
    string_client = bob_client.string_obligation
    fulfillment_uid = await string_client.do_obligation("fulfilled", escrow_uid)

    # Request and perform arbitration
    oracle_client = bob_client.oracle
    await oracle_client.request_arbitration(fulfillment_uid, env.bob, inner_demand_data)
    await oracle_client.arbitrate_raw(fulfillment_uid, inner_demand_data, True)

    # Bob collects from unconditional escrow
    collect_result = await bob_client.native_token.escrow.unconditional.collect(
        escrow_uid, fulfillment_uid
    )

    assert collect_result is not None, "Unconditional collection should succeed"
    print(f"Native token unconditional collected: {collect_result}")

@pytest.mark.asyncio
async def test_native_token_escrow_reclaim_expired(env, alice_client):
    """
    Test native token escrow reclaim when expired.
    Creates an escrow with short expiration, advances time, then reclaims.
    """

    escrow_amount = 1000  # wei

    trusted_oracle_arbiter = env.addresses.arbiters_addresses.trusted_oracle_arbiter

    inner_demand_data = b""
    demand_data = TrustedOracleArbiterDemandData(env.bob, inner_demand_data)
    demand_bytes = demand_data.encode_self()

    arbiter = {
        "arbiter": trusted_oracle_arbiter,
        "demand": demand_bytes
    }

    # Create with expiration in the near future (15 seconds)
    expiration = int(time.time()) + 15

    native_data = {"value": escrow_amount}
    escrow_result = await alice_client.native_token.escrow.default.create(
        native_data, arbiter, expiration
    )

    escrow_uid = escrow_result['log']['uid']
    print(f"Native token escrow created: {escrow_uid}")

    # Advance time past expiration
    await env.god_wallet_provider.anvil_increase_time(20)

    # Alice reclaims expired escrow
    reclaim_result = await alice_client.native_token.escrow.default.reclaim_expired(
        escrow_uid
    )

    assert reclaim_result is not None, "Reclaim should succeed"
    print(f"Native token expired escrow reclaimed: {reclaim_result}")
