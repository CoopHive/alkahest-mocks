//! Attestation reference unconditional escrow obligation client
//!
//! Unconditional escrows support multiple fulfillments per escrow (1:many relationship).
//! The reference attestation escrow references the attestation by UID instead of storing the full data.

use alloy::primitives::{Address, FixedBytes};
use alloy::rpc::types::TransactionReceipt;
use alloy::sol_types::SolValue;

use crate::contracts;
use crate::types::{ArbiterData, DecodedAttestation};

use super::super::super::AttestationModule;

/// Unconditional reference escrow API for attestations
pub struct Unconditional<'a> {
    module: &'a AttestationModule,
}

impl<'a> Unconditional<'a> {
    pub fn new(module: &'a AttestationModule) -> Self {
        Self { module }
    }

    /// Get the contract address
    pub fn address(&self) -> Address {
        self.module
            .addresses
            .attestation_reference_escrow_obligation_unconditional
    }

    /// Gets an escrow obligation by its attestation UID.
    pub async fn get_obligation(
        &self,
        uid: FixedBytes<32>,
    ) -> eyre::Result<
        DecodedAttestation<
            contracts::obligations::escrow::unconditional::UnconditionalAttestationReferenceEscrowObligation::ObligationData,
        >,
    >{
        let eas_contract =
            contracts::IEAS::new(self.module.addresses.eas, &self.module.wallet_provider);

        let attestation = eas_contract.getAttestation(uid).call().await?;
        let obligation_data =
            contracts::obligations::escrow::unconditional::UnconditionalAttestationReferenceEscrowObligation::ObligationData::abi_decode(
                &attestation.data,
            )?;

        Ok(DecodedAttestation {
            attestation,
            data: obligation_data,
        })
    }

    /// Creates a unconditional escrow using an attestation UID as reference.
    pub async fn create(
        &self,
        referenced_attestation_uid: FixedBytes<32>,
        demand: &ArbiterData,
        expiration: u64,
        reference_expiration: u64,
    ) -> eyre::Result<TransactionReceipt> {
        let escrow_contract =
            contracts::obligations::escrow::unconditional::UnconditionalAttestationReferenceEscrowObligation::new(
                self.module.addresses.attestation_reference_escrow_obligation_unconditional,
                &self.module.wallet_provider,
            );

        let receipt = escrow_contract
            .doObligation(
                contracts::obligations::escrow::unconditional::UnconditionalAttestationReferenceEscrowObligation::ObligationData {
                    referencedAttestationUid: referenced_attestation_uid,
                    arbiter: demand.arbiter,
                    demand: demand.demand.clone(),
                    expirationTime: reference_expiration,
                },
                expiration,
            )
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Collects payment from a unconditional attestation escrow.
    pub async fn collect(
        &self,
        buy_attestation: FixedBytes<32>,
        fulfillment: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let escrow_contract =
            contracts::obligations::escrow::unconditional::UnconditionalAttestationReferenceEscrowObligation::new(
                self.module.addresses.attestation_reference_escrow_obligation_unconditional,
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
}
