"""
Test contextless offchain identity oracle flow
"""
import pytest
import json
from dataclasses import dataclass
from typing import Dict
from eth_account import Account
from eth_account.messages import encode_defunct
from alkahest_py import (
    EnvTestManager,
    ArbitrationMode,
    AlkahestClient,
    TrustedOracleArbiterDemandData,
)

@dataclass
class IdentityFulfillment:
    pubkey: str
    nonce: int
    data: str
    signature: str

# Global identity registry for tracking nonces
identity_registry: Dict[str, int] = {}

def verify_identity_decision(attestation, client) -> bool:
    """
    Verify an identity fulfillment by checking:
    1. The signature is valid
    2. The nonce is greater than the last seen nonce
    3. The recovered address matches the claimed pubkey
    """
    try:
        # Extract obligation data
        obligation_str = client.oracle.extract_obligation_data(attestation)
        payload = json.loads(obligation_str)

        parsed = IdentityFulfillment(
            pubkey=payload['pubkey'],
            nonce=payload['nonce'],
            data=payload['data'],
            signature=payload['signature']
        )

        # Check if address is registered
        pubkey_lower = parsed.pubkey.lower()
        if pubkey_lower not in identity_registry:
            return False

        # Check nonce is greater than current
        current_nonce = identity_registry[pubkey_lower]
        if parsed.nonce <= current_nonce:
            return False

        # Verify signature length (130 hex chars without 0x, or 132 with 0x)
        sig_len = len(parsed.signature) if parsed.signature else 0
        if not parsed.signature or sig_len not in [130, 132]:
            return False

        # Verify signature
        message = f"{parsed.data}:{parsed.nonce}"
        encoded_message = encode_defunct(text=message)

        try:
            recovered = Account.recover_message(encoded_message, signature=parsed.signature)
        except Exception:
            return False

        # Check recovered address matches claimed pubkey
        if recovered.lower() != pubkey_lower:
            return False

        # Update nonce
        identity_registry[pubkey_lower] = parsed.nonce
        return True

    except Exception:
        return False

async def create_identity_payload(account: Account, nonce: int, data: str = "proof-of-identity") -> str:
    """Create a signed identity payload"""
    message = f"{data}:{nonce}"
    encoded_message = encode_defunct(text=message)
    signed = account.sign_message(encoded_message)

    payload = IdentityFulfillment(
        pubkey=account.address,
        nonce=nonce,
        data=data,
        signature=signed.signature.hex()
    )

    return json.dumps({
        "pubkey": payload.pubkey,
        "nonce": payload.nonce,
        "data": payload.data,
        "signature": payload.signature
    })

@pytest.mark.asyncio
async def test_contextless_offchain_identity_oracle_flow(env, bob_client, charlie_client):
    """
    Test a contextless identity verification oracle
    Uses signature verification and nonce tracking without requiring escrow.
    Bob submits identity proofs. Charlie (the oracle) verifies them.
    Tests both successful verification and replay attack prevention.
    """

    oracle_address = env.charlie
    oracle_client = charlie_client

    # Clear and setup identity registry
    identity_registry.clear()

    # Create a random identity account
    identity_account = Account.create()
    identity_address = identity_account.address.lower()

    # Register the identity with nonce 0
    identity_registry[identity_address] = 0

    # Define decision function using closure to access registry
    def decision_function(attestation, demand):
        return verify_identity_decision(attestation, oracle_client)

    def callback(decision):
        pass

    demand_bytes = TrustedOracleArbiterDemandData(oracle_address, b"").encode_self()

    # Test 1: Valid identity proof with nonce 1 (should succeed)
    good_payload = await create_identity_payload(identity_account, 1)
    good_uid = await bob_client.string_obligation.do_obligation(
        good_payload,
        None  # No escrow reference (contextless)
    )

    await bob_client.oracle.request_arbitration(good_uid, oracle_address, demand_bytes)

    # Process the arbitration (skip already arbitrated items)
    decisions1 = await oracle_client.oracle.arbitrate_many(
        decision_function,
        callback,
        ArbitrationMode.AllUnarbitrated,
        timeout_seconds=2.0
    )

    # Verify the first decision was approval
    assert len(decisions1) >= 1, "Expected at least 1 decision"
    first_decision = decisions1[0].decision
    assert first_decision is True, "Expected first decision to be True"

    # Verify nonce was updated
    assert identity_registry[identity_address] == 1, "Nonce should be updated to 1"

    # Test 2: Replay attack with same nonce (should fail)
    bad_payload = await create_identity_payload(identity_account, 1)  # Same nonce
    bad_uid = await bob_client.string_obligation.do_obligation(
        bad_payload,
        None
    )

    await bob_client.oracle.request_arbitration(bad_uid, oracle_address, demand_bytes)

    # Process the arbitration (skip already arbitrated, so only process the new one)
    decisions2 = await oracle_client.oracle.arbitrate_many(
        decision_function,
        callback,
        ArbitrationMode.AllUnarbitrated,
        timeout_seconds=2.0
    )

    # Verify the second decision was rejection
    # Should only have one decision (the new bad one)
    assert len(decisions2) >= 1, "Expected at least 1 decision"
    second_decision = decisions2[0].decision
    assert second_decision is False, "Expected second decision to be False (replay attack)"

    # Cleanup
    identity_registry.clear()

    print("Contextless offchain identity oracle test passed")
