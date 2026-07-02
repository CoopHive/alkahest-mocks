//! Token Bundle payment obligation client
//!
//! Provides functionality for making direct token bundle payments.

use alloy::primitives::{Address, FixedBytes};
use alloy::rpc::types::TransactionReceipt;
use alloy::sol_types::SolValue;

use crate::contracts;
use crate::types::{ApprovalPurpose, DecodedAttestation, TokenBundleData};
use crate::utils::contract_safety::ensure_packaged_escrow_attester;

use super::TokenBundleModule;

/// Payment API for token bundles
pub struct Payment<'a> {
    module: &'a TokenBundleModule,
}

impl<'a> Payment<'a> {
    pub fn new(module: &'a TokenBundleModule) -> Self {
        Self { module }
    }

    /// Get the contract address
    pub fn address(&self) -> Address {
        self.module.addresses.payment_obligation
    }

    /// Gets a payment obligation by its attestation UID.
    pub async fn get_obligation(
        &self,
        uid: FixedBytes<32>,
    ) -> eyre::Result<
        DecodedAttestation<contracts::obligations::TokenBundlePaymentObligation::ObligationData>,
    > {
        let eas_contract =
            contracts::IEAS::new(self.module.addresses.eas, &self.module.wallet_provider);

        let attestation = eas_contract.getAttestation(uid).call().await?;
        let obligation_data =
            contracts::obligations::TokenBundlePaymentObligation::ObligationData::abi_decode(
                &attestation.data,
            )?;

        Ok(DecodedAttestation {
            attestation,
            data: obligation_data,
        })
    }

    /// Makes a direct payment with token bundles.
    ///
    /// # Arguments
    /// * `price` - The token bundle data for payment
    /// * `payee` - The address of the payment recipient
    ///
    /// # Returns
    /// * `Result<TransactionReceipt>` - The transaction receipt
    pub async fn pay(
        &self,
        price: &TokenBundleData,
        payee: Address,
    ) -> eyre::Result<TransactionReceipt> {
        let payment_obligation_contract = contracts::obligations::TokenBundlePaymentObligation::new(
            self.module.addresses.payment_obligation,
            &self.module.wallet_provider,
        );

        let receipt = payment_obligation_contract
            .doObligation(
                (price, payee).into(),
                FixedBytes::<32>::ZERO, // refUID - no reference for standalone payments
            )
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Makes a direct payment with token bundles after approving all tokens in the bundle,
    /// then revokes ERC1155 approvals.
    ///
    /// # Arguments
    /// * `price` - The token bundle data for payment
    /// * `payee` - The address of the payment recipient
    ///
    /// # Returns
    /// * `Result<(Vec<TransactionReceipt>, TransactionReceipt, Vec<TransactionReceipt>)>` - The approval, payment, and revoke receipts
    pub async fn approve_and_pay(
        &self,
        price: &TokenBundleData,
        payee: Address,
    ) -> eyre::Result<(
        Vec<TransactionReceipt>,
        TransactionReceipt,
        Vec<TransactionReceipt>,
    )> {
        let util = self.module.util();
        let approval_receipts = util.approve(price, ApprovalPurpose::Payment).await?;
        let payment_receipt = self.pay(price, payee).await?;
        let revoke_receipts = util
            .revoke_erc1155s(price, ApprovalPurpose::Payment)
            .await?;
        Ok((approval_receipts, payment_receipt, revoke_receipts))
    }

    /// Pays a token-bundle payment obligation and collects the matching escrow atomically.
    ///
    /// Security note: uses AtomicPaymentUtils, which has not been included in
    /// professional manual audits and has only been reviewed by automated audit
    /// tooling so far.
    pub async fn pay_bundle_and_collect(
        &self,
        escrow_uid: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        self.ensure_supported_atomic_payment_escrow(escrow_uid)
            .await?;
        self.pay_bundle_and_collect_unchecked(escrow_uid).await
    }

    /// Pays a token-bundle payment obligation and collects without SDK escrow-attester validation.
    ///
    /// Use only after independently validating that `escrow_uid` was authored by
    /// the escrow contract you intend to settle.
    pub async fn pay_bundle_and_collect_unchecked(
        &self,
        escrow_uid: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let utility = contracts::utils::AtomicPaymentUtils::new(
            self.module.addresses.atomic_payment_utils,
            &self.module.wallet_provider,
        );

        Ok(utility
            .payBundleAndCollect(escrow_uid)
            .send()
            .await?
            .get_receipt()
            .await?)
    }

    async fn ensure_supported_atomic_payment_escrow(
        &self,
        escrow_uid: FixedBytes<32>,
    ) -> eyre::Result<()> {
        let eas = contracts::IEAS::new(self.module.addresses.eas, &self.module.wallet_provider);
        let escrow = eas.getAttestation(escrow_uid).call().await?;
        ensure_packaged_escrow_attester(escrow.attester, &self.module.packaged_escrow_obligations)
    }
}
