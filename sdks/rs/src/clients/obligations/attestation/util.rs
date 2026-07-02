//! Attestation utility functions
//!
//! Core EAS operations: getting attestations, registering schemas, creating attestations.

use alloy::primitives::{Address, FixedBytes};
use alloy::rpc::types::TransactionReceipt;

use crate::contracts;
use crate::contracts::IEAS::{Attestation, AttestationRequest};
use crate::contracts::utils::AtomicAttestationUtils;

use super::AttestationModule;

/// Utility API for attestation operations
pub struct Util<'a> {
    module: &'a AttestationModule,
}

impl<'a> Util<'a> {
    pub fn new(module: &'a AttestationModule) -> Self {
        Self { module }
    }

    /// Retrieves an attestation by its UID.
    pub async fn get_attestation(&self, uid: FixedBytes<32>) -> eyre::Result<Attestation> {
        let eas_contract =
            contracts::IEAS::new(self.module.addresses.eas, &self.module.wallet_provider);

        let attestation = eas_contract.getAttestation(uid).call().await?;
        Ok(attestation)
    }

    /// Registers a new schema in the EAS Schema Registry.
    ///
    /// # Arguments
    /// * `schema` - The schema string defining the attestation structure
    /// * `resolver` - The address of the resolver contract
    /// * `revocable` - Whether attestations using this schema can be revoked
    pub async fn register_schema(
        &self,
        schema: String,
        resolver: Address,
        revocable: bool,
    ) -> eyre::Result<TransactionReceipt> {
        let schema_registry_contract = contracts::ISchemaRegistry::new(
            self.module.addresses.eas_schema_registry,
            &self.module.wallet_provider,
        );

        let receipt = schema_registry_contract
            .register(schema, resolver, revocable)
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Creates a new attestation using the EAS contract.
    pub async fn attest(
        &self,
        attestation: AttestationRequest,
    ) -> eyre::Result<TransactionReceipt> {
        let eas_contract =
            contracts::IEAS::new(self.module.addresses.eas, &self.module.wallet_provider);

        let receipt = eas_contract
            .attest(attestation)
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Creates an EAS attestation and a default attestation-reference escrow in one transaction.
    pub async fn attest_and_create_reference_escrow(
        &self,
        request: AttestationRequest,
        escrow_data: AtomicAttestationUtils::ReferenceEscrowData,
        escrow_expiration_time: u64,
    ) -> eyre::Result<TransactionReceipt> {
        let value = request.data.value;
        let atomic_utils = AtomicAttestationUtils::new(
            self.module.addresses.atomic_attestation_utils,
            &self.module.wallet_provider,
        );

        let receipt = atomic_utils
            .attestAndCreateReferenceEscrow(
                self.module
                    .addresses
                    .attestation_reference_escrow_obligation_default,
                request.into(),
                escrow_data,
                escrow_expiration_time,
            )
            .value(value)
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Creates an EAS attestation and an unconditional attestation-reference escrow in one transaction.
    pub async fn attest_and_create_unconditional_reference_escrow(
        &self,
        request: AttestationRequest,
        escrow_data: AtomicAttestationUtils::ReferenceEscrowData,
        escrow_expiration_time: u64,
    ) -> eyre::Result<TransactionReceipt> {
        let value = request.data.value;
        let atomic_utils = AtomicAttestationUtils::new(
            self.module.addresses.atomic_attestation_utils,
            &self.module.wallet_provider,
        );

        let receipt = atomic_utils
            .attestAndCreateUnconditionalReferenceEscrow(
                self.module
                    .addresses
                    .attestation_reference_escrow_obligation_unconditional,
                request.into(),
                escrow_data,
                escrow_expiration_time,
            )
            .value(value)
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }
}
