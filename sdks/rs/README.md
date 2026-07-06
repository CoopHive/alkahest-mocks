# alkahest-rs

Rust SDK for [Alkahest](https://github.com/arkhai-io/alkahest), a library and ecosystem of contracts for conditional peer-to-peer escrow. Built on [alloy](https://github.com/alloy-rs/alloy).

## Installation

```bash
cargo add alkahest-rs
```

## Usage

Initialize a client with a private key and RPC URL. Defaults to Base Sepolia addresses. Pass a `DefaultExtensionConfig` for other supported deployments or custom addresses.

```rust
use alkahest_rs::DefaultAlkahestClient;
use alloy::signers::local::PrivateKeySigner;
use std::env;

#[tokio::main]
async fn main() -> eyre::Result<()> {
    let signer: PrivateKeySigner = env::var("PRIVKEY")?.parse()?;
    let client = DefaultAlkahestClient::with_base_extensions(
        signer,
        env::var("RPC_URL")?,
        None, // uses Base Sepolia addresses by default
    )
    .await?;

    Ok(())
}
```

## Examples

### Trade ERC20 for ERC20

Uses escrow clients to create escrows, and atomic payment utilities to settle compatible escrows atomically.

```rust
use alkahest_rs::{DefaultAlkahestClient, types::Erc20Data, extensions::HasErc20};
use alloy::primitives::{address, U256};

#[tokio::main]
async fn main() -> eyre::Result<()> {
    // ... initialize alice_client and bob_client as above

    let usdc = address!("036CbD53842c5426634e7929541eC2318f3dCF7e");
    let eurc = address!("808456652fdb597867f38412077A9182bf77359F");

    // Alice: approve the escrow contract and deposit 10 USDC, demanding 10 EURC
    alice_client.erc20().util().approve(
        &Erc20Data { address: usdc, value: U256::from(10) },
        alkahest_rs::types::ApprovalPurpose::Escrow,
    ).await?;

    let eurc_payment_demand = /* encode ERC20 payment demand for 10 EURC */;
    let receipt = alice_client.erc20().escrow().default().create(
        &Erc20Data { address: usdc, value: U256::from(10) },
        &eurc_payment_demand,
        0, // no expiration
    ).await?;
    let escrow = DefaultAlkahestClient::get_attested_event(receipt)?;

    // Bob: approve atomic payment utilities and atomically pay 10 EURC + collect the escrow
    bob_client.erc20().util().approve(
        &Erc20Data { address: eurc, value: U256::from(10) },
        alkahest_rs::types::ApprovalPurpose::AtomicPayment,
    ).await?;

    bob_client.erc20().payment().pay_erc20_and_collect(escrow.uid).await?;

    Ok(())
}
```

### Trade ERC20 for custom demand

Uses TrustedOracleArbiter to delegate fulfillment validation to an off-chain oracle, and StringObligation for the fulfillment.

```rust
use alkahest_rs::{
    DefaultAlkahestClient,
    types::{Erc20Data, ArbiterData, ApprovalPurpose},
    extensions::{HasErc20, HasStringObligation, HasArbiters},
};
use alloy::primitives::{address, U256, FixedBytes, Bytes};
use alloy::sol_types::SolValue;

#[tokio::main]
async fn main() -> eyre::Result<()> {
    // ... initialize alice_client, bob_client, charlie_client

    let usdc = address!("036CbD53842c5426634e7929541eC2318f3dCF7e");

    // Encode the inner demand (application-specific; agreed upon by buyer and seller)
    alloy::sol! {
        struct QueryDemand {
            string query;
        }
    }
    let inner_demand = QueryDemand { query: "capitalize hello world".into() }.abi_encode();

    // Encode the TrustedOracleArbiter demand, naming Charlie as the oracle
    let demand = alkahest_rs::contracts::arbiters::TrustedOracleArbiter::DemandData {
        oracle: charlie_address,
        data: inner_demand.into(),
    }.abi_encode();

    // Alice: deposit USDC into escrow with the custom demand
    let (_, escrow_receipt) = alice_client.erc20().escrow().default()
        .approve_and_create(
            &Erc20Data { address: usdc, value: U256::from(100) },
            &ArbiterData {
                arbiter: alice_client.arbiters().addresses.trusted_oracle_arbiter,
                demand: demand.into(),
            },
            (std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)?
                .as_secs() + 86400) as u64,
        ).await?;
    let escrow = DefaultAlkahestClient::get_attested_event(escrow_receipt)?;

    // Bob: fulfill the demand with a StringObligation attestation
    let fulfillment_receipt = bob_client.string_obligation()
        .do_obligation(
            "HELLO WORLD".into(), // the computed result
            None,                 // schema (optional)
            Some(escrow.uid),     // reference to the escrow being fulfilled
        ).await?;
    let fulfillment = DefaultAlkahestClient::get_attested_event(fulfillment_receipt)?;

    // Charlie: arbitrate (or use arbitrate_many_sync / arbitrate_many_blocking_sync for event-driven arbitration)
    // ... Charlie validates and submits decision via TrustedOracleArbiter

    // Bob: collect the escrow
    bob_client.erc20().escrow().default()
        .collect(escrow.uid, fulfillment.uid).await?;

    // Alice: wait for fulfillment (useful if running concurrently)
    let result = alice_client.wait_for_fulfillment(
        alice_client.erc20().addresses.escrow_obligation_default,
        escrow.uid,
        None,
    ).await?;

    Ok(())
}
```

See the [docs](../../docs/) for more detailed guides, including composing arbiters and building off-chain oracle validators.

## Development

### Running Tests

Tests run against an Anvil fork:

```bash
cargo test
```
