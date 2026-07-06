//! ERC721 payment obligation client

use alloy::primitives::{Address, FixedBytes};
use alloy::rpc::types::TransactionReceipt;
use alloy::sol_types::SolValue;

use crate::contracts;
use crate::types::{ApprovalPurpose, DecodedAttestation, Erc721Data};
use crate::utils::contract_safety::ensure_packaged_escrow_attester;

use super::Erc721Module;

/// Payment API for ERC721 tokens
pub struct Payment<'a> {
    module: &'a Erc721Module,
}

impl<'a> Payment<'a> {
    pub fn new(module: &'a Erc721Module) -> Self {
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
        DecodedAttestation<contracts::obligations::ERC721PaymentObligation::ObligationData>,
    > {
        let eas_contract =
            contracts::IEAS::new(self.module.addresses.eas, &self.module.wallet_provider);

        let attestation = eas_contract.getAttestation(uid).call().await?;
        let obligation_data =
            contracts::obligations::ERC721PaymentObligation::ObligationData::abi_decode(
                &attestation.data,
            )?;

        Ok(DecodedAttestation {
            attestation,
            data: obligation_data,
        })
    }

    /// Makes a direct payment with ERC721 tokens.
    pub async fn pay(
        &self,
        price: &Erc721Data,
        payee: Address,
    ) -> eyre::Result<TransactionReceipt> {
        let payment_obligation_contract = contracts::obligations::ERC721PaymentObligation::new(
            self.module.addresses.payment_obligation,
            &self.module.wallet_provider,
        );

        let receipt = payment_obligation_contract
            .doObligation(
                contracts::obligations::ERC721PaymentObligation::ObligationData {
                    token: price.address,
                    tokenId: price.id,
                    payee,
                },
                FixedBytes::<32>::ZERO,
            )
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Makes a direct payment with ERC721 tokens after approving the token transfer.
    pub async fn approve_and_pay(
        &self,
        price: &Erc721Data,
        payee: Address,
    ) -> eyre::Result<(TransactionReceipt, TransactionReceipt)> {
        let util = self.module.util();
        let approval_receipt = util.approve(price, ApprovalPurpose::Payment).await?;
        let payment_receipt = self.pay(price, payee).await?;
        Ok((approval_receipt, payment_receipt))
    }

    /// Pays an ERC721 payment obligation and collects the matching escrow atomically.
    ///
    /// Security note: uses AtomicPaymentUtils, which has not been included in
    /// professional manual audits and has only been reviewed by automated audit
    /// tooling so far.
    pub async fn pay_erc721_and_collect(
        &self,
        escrow_uid: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        self.ensure_supported_atomic_payment_escrow(escrow_uid)
            .await?;
        self.pay_erc721_and_collect_unchecked(escrow_uid).await
    }

    /// Pays an ERC721 payment obligation and collects without SDK escrow-attester validation.
    ///
    /// Use only after independently validating that `escrow_uid` was authored by
    /// the escrow contract you intend to settle.
    pub async fn pay_erc721_and_collect_unchecked(
        &self,
        escrow_uid: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let utility = contracts::utils::AtomicPaymentUtils::new(
            self.module.addresses.atomic_payment_utils,
            &self.module.wallet_provider,
        );

        Ok(utility
            .payErc721AndCollect(escrow_uid)
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
