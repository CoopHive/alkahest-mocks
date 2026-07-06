//! Native Token default escrow obligation client
//!
//! Non-unconditional escrows have a 1:1 relationship between escrow and fulfillment.

use alloy::primitives::{Address, FixedBytes};
use alloy::rpc::types::TransactionReceipt;
use alloy::sol_types::SolValue as _;

use crate::types::{ArbiterData, DecodedAttestation, NativeTokenData};
use crate::{contracts, utils::contract_safety::ensure_deployed_contract};

use super::super::NativeTokenModule;

/// Non-unconditional escrow API for native tokens
pub struct Default<'a> {
    module: &'a NativeTokenModule,
}

impl<'a> Default<'a> {
    pub fn new(module: &'a NativeTokenModule) -> Self {
        Self { module }
    }

    /// Get the contract address
    pub fn address(&self) -> Address {
        self.module.addresses.escrow_obligation_default
    }

    /// Gets an escrow obligation by its attestation UID.
    pub async fn get_obligation(
        &self,
        uid: FixedBytes<32>,
    ) -> eyre::Result<
        DecodedAttestation<
            contracts::obligations::escrow::default_escrow::NativeTokenEscrowObligation::ObligationData,
        >,
    >{
        let eas_contract =
            contracts::IEAS::new(self.module.addresses.eas, &self.module.wallet_provider);

        let attestation = eas_contract.getAttestation(uid).call().await?;
        let obligation_data =
            contracts::obligations::escrow::default_escrow::NativeTokenEscrowObligation::ObligationData::abi_decode(
                &attestation.data,
            )?;

        Ok(DecodedAttestation {
            attestation,
            data: obligation_data,
        })
    }

    /// Creates an escrow arrangement with native tokens for a custom demand.
    pub async fn create(
        &self,
        price: &NativeTokenData,
        item: &ArbiterData,
        expiration: u64,
    ) -> eyre::Result<TransactionReceipt> {
        ensure_deployed_contract(
            self.module.addresses.escrow_obligation_default,
            "NativeTokenEscrowObligation",
        )?;
        let escrow_obligation_contract =
            contracts::obligations::escrow::default_escrow::NativeTokenEscrowObligation::new(
                self.module.addresses.escrow_obligation_default,
                &self.module.wallet_provider,
            );

        let receipt = escrow_obligation_contract
            .doObligation(
                contracts::obligations::escrow::default_escrow::NativeTokenEscrowObligation::ObligationData {
                    arbiter: item.arbiter,
                    demand: item.demand.clone(),
                    amount: price.value,
                },
                expiration,
            )
            .value(price.value)
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Collects payment from a fulfilled trade.
    pub async fn collect(
        &self,
        buy_attestation: FixedBytes<32>,
        fulfillment: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let escrow_contract =
            contracts::obligations::escrow::default_escrow::NativeTokenEscrowObligation::new(
                self.module.addresses.escrow_obligation_default,
                &self.module.wallet_provider,
            );

        let receipt = escrow_contract
            .collect(buy_attestation, fulfillment)
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Collects expired escrow funds after expiration time has passed.
    pub async fn reclaim_expired(
        &self,
        buy_attestation: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let escrow_contract =
            contracts::obligations::escrow::default_escrow::NativeTokenEscrowObligation::new(
                self.module.addresses.escrow_obligation_default,
                &self.module.wallet_provider,
            );

        let receipt = escrow_contract
            .reclaim(buy_attestation)
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }
}
