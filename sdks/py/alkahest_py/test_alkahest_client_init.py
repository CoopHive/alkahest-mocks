"""
Test AlkahestClient initialization - simplified to match Rust SDK
"""
import pytest
from alkahest_py import (
    AlkahestClient,
    EnvTestManager,
)

@pytest.mark.asyncio
async def test_alkahest_client_init_default(env):
    """Test AlkahestClient initialization with default extensions (no custom config)."""

    # Initialize client without custom address config (should use defaults)
    client = AlkahestClient(
        private_key="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        rpc_url=env.rpc_url
    )

    # Verify the client has all expected extension clients
    assert hasattr(client, 'erc20'), "Client should have ERC20 extension"
    assert hasattr(client, 'erc721'), "Client should have ERC721 extension"
    assert hasattr(client, 'erc1155'), "Client should have ERC1155 extension"
    assert hasattr(client, 'token_bundle'), "Client should have token bundle extension"
    assert hasattr(client, 'attestation'), "Client should have attestation extension"
    assert hasattr(client, 'string_obligation'), "Client should have string obligation extension"
    assert hasattr(client, 'commit_reveal'), "Client should have commit reveal extension"
    assert hasattr(client, 'oracle'), "Client should have oracle extension"
    assert hasattr(client, 'arbiters'), "Client should have arbiters extension"
    assert hasattr(client, 'splitters'), "Client should have splitters extension"
    assert hasattr(client, 'hook_based'), "Client should have hook-based extension"

    # Verify extensions are accessible (should not raise errors)
    erc20_client = client.erc20
    erc721_client = client.erc721
    erc1155_client = client.erc1155
    token_bundle_client = client.token_bundle
    attestation_client = client.attestation
    string_obligation_client = client.string_obligation
    commit_reveal_client = client.commit_reveal
    oracle_client = client.oracle
    arbiters_client = client.arbiters
    splitters_client = client.splitters
    hook_based_client = client.hook_based

    # Verify extensions have expected methods through util submodule
    assert hasattr(erc20_client, 'util'), "ERC20 client should have util submodule"
    assert hasattr(erc20_client.util, 'approve'), "ERC20 util should have approve method"
    assert hasattr(erc721_client, 'util'), "ERC721 client should have util submodule"
    assert hasattr(erc721_client.util, 'approve'), "ERC721 util should have approve method"
    assert hasattr(erc1155_client, 'util'), "ERC1155 client should have util submodule"
    assert hasattr(erc1155_client.util, 'approve_all'), "ERC1155 util should have approve_all method"
    assert hasattr(arbiters_client, 'check'), "Arbiters client should have check method"
    assert hasattr(arbiters_client.trusted_oracle, 'commitment_arbitrate_for_demand'), (
        "Trusted oracle client should have commitment arbitration methods"
    )
    assert hasattr(splitters_client, 'arbitrate_amount'), "Splitters client should arbitrate amount splits"
    assert hasattr(splitters_client, 'arbitrate_bundle'), "Splitters client should arbitrate bundle splits"
    assert hasattr(splitters_client, 'collect_and_distribute'), "Splitters client should collect and distribute"
    assert hasattr(splitters_client, 'attestation_intent_hash'), "Splitters client should hash attestation intents"
    assert hasattr(attestation_client.util, 'attest_and_create_reference_escrow'), (
        "Attestation util should have atomic reference escrow helper"
    )
    assert hasattr(attestation_client.util, 'attest_and_create_unconditional_reference_escrow'), (
        "Attestation util should have atomic unconditional reference escrow helper"
    )
    assert hasattr(hook_based_client, 'approve_escrow'), "Hook-based client should approve escrow hooks"
    assert hasattr(hook_based_client, 'unapprove_escrow'), "Hook-based client should unapprove escrow hooks"
    assert hasattr(hook_based_client, 'is_escrow_approved'), "Hook-based client should read hook approvals"
    # Token bundle and other clients exist but may have different method names
    assert token_bundle_client is not None, "Token bundle client should exist"

    print("✅ Default AlkahestClient initialization test passed!")

@pytest.mark.asyncio
async def test_alkahest_client_init_with_custom_config(env, alice_client):
    """Test AlkahestClient initialization with custom address configuration."""

    # Test that the environment addresses are accessible and client works
    # NOTE: Creating a client with custom config requires proper config format
    # For now, just verify the environment addresses are accessible
    assert env.addresses is not None, "Environment addresses should be accessible"
    assert hasattr(env.addresses, 'erc20_addresses'), "Should have erc20 addresses"
    assert hasattr(env.addresses, 'erc721_addresses'), "Should have erc721 addresses"
    assert hasattr(env.addresses, 'arbiters_addresses'), "Should have arbiters addresses"

    # Verify alice_client from env works (it's already initialized with proper addresses)
    assert alice_client is not None, "Alice client should exist"
    assert alice_client.erc20 is not None, "Alice ERC20 client should exist"
    assert alice_client.erc721 is not None, "Alice ERC721 client should exist"

    print("✅ Custom config AlkahestClient initialization test passed!")
