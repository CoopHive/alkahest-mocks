//! ERC1155 payment obligation client
//!
//! Provides functionality for making direct ERC1155 token payments.

use alloy::primitives::{Address, FixedBytes};
use alloy::rpc::types::TransactionReceipt;
use alloy::sol_types::SolValue;

use crate::contracts;
use crate::types::{ApprovalPurpose, DecodedAttestation, Erc1155Data};
use crate::utils::contract_safety::ensure_packaged_escrow_attester;

use super::Erc1155Module;

/// Payment API for ERC1155 tokens
pub struct Payment<'a> {
    module: &'a Erc1155Module,
}

impl<'a> Payment<'a> {
    pub fn new(module: &'a Erc1155Module) -> Self {
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
        DecodedAttestation<contracts::obligations::ERC1155PaymentObligation::ObligationData>,
    > {
        let eas_contract =
            contracts::IEAS::new(self.module.addresses.eas, &self.module.wallet_provider);

        let attestation = eas_contract.getAttestation(uid).call().await?;
        let obligation_data =
            contracts::obligations::ERC1155PaymentObligation::ObligationData::abi_decode(
                &attestation.data,
            )?;

        Ok(DecodedAttestation {
            attestation,
            data: obligation_data,
        })
    }

    /// Makes a direct payment with ERC1155 tokens.
    ///
    /// # Arguments
    /// * `price` - The ERC1155 token data for payment
    /// * `payee` - The address of the payment recipient
    ///
    /// # Returns
    /// * `Result<TransactionReceipt>` - The transaction receipt
    pub async fn pay(
        &self,
        price: &Erc1155Data,
        payee: Address,
    ) -> eyre::Result<TransactionReceipt> {
        let payment_obligation_contract = contracts::obligations::ERC1155PaymentObligation::new(
            self.module.addresses.payment_obligation,
            &self.module.wallet_provider,
        );

        let receipt = payment_obligation_contract
            .doObligation(
                contracts::obligations::ERC1155PaymentObligation::ObligationData {
                    token: price.address,
                    tokenId: price.id,
                    amount: price.value,
                    payee,
                },
                FixedBytes::<32>::ZERO, // refUID - no reference for standalone payments
            )
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Makes a direct payment with ERC1155 tokens after approving, then revokes approval.
    ///
    /// # Arguments
    /// * `price` - The ERC1155 token data for payment
    /// * `payee` - The address of the payment recipient
    ///
    /// # Returns
    /// * `Result<(TransactionReceipt, TransactionReceipt, TransactionReceipt)>` - The approval, payment, and revoke receipts
    pub async fn approve_and_pay(
        &self,
        price: &Erc1155Data,
        payee: Address,
    ) -> eyre::Result<(TransactionReceipt, TransactionReceipt, TransactionReceipt)> {
        let util = self.module.util();
        let approval_receipt = util
            .approve_all(price.address, ApprovalPurpose::Payment)
            .await?;
        let payment_receipt = self.pay(price, payee).await?;
        let revoke_receipt = util
            .revoke_all(price.address, ApprovalPurpose::Payment)
            .await?;
        Ok((approval_receipt, payment_receipt, revoke_receipt))
    }

    /// Pays an ERC1155 payment obligation and collects the matching escrow atomically.
    ///
    /// Security note: uses AtomicPaymentUtils, which has not been included in
    /// professional manual audits and has only been reviewed by automated audit
    /// tooling so far.
    pub async fn pay_erc1155_and_collect(
        &self,
        escrow_uid: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        self.ensure_supported_atomic_payment_escrow(escrow_uid)
            .await?;
        self.pay_erc1155_and_collect_unchecked(escrow_uid).await
    }

    /// Pays an ERC1155 payment obligation and collects without SDK escrow-attester validation.
    ///
    /// Use only after independently validating that `escrow_uid` was authored by
    /// the escrow contract you intend to settle.
    pub async fn pay_erc1155_and_collect_unchecked(
        &self,
        escrow_uid: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let utility = contracts::utils::AtomicPaymentUtils::new(
            self.module.addresses.atomic_payment_utils,
            &self.module.wallet_provider,
        );

        Ok(utility
            .payErc1155AndCollect(escrow_uid)
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
