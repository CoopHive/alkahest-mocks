//! ExclusiveRevocableConfirmationArbiter client
//!
//! Single fulfillment per escrow, confirmation can be revoked.

use alloy::{
    primitives::{Address, FixedBytes, Log},
    rpc::types::{Filter, TransactionReceipt},
    sol_types::SolEvent as _,
};

use crate::{clients::arbiters::ArbitersModule, contracts};

/// ExclusiveRevocableConfirmationArbiter API
pub struct ExclusiveRevocable<'a> {
    module: &'a ArbitersModule,
}

impl<'a> ExclusiveRevocable<'a> {
    pub fn new(module: &'a ArbitersModule) -> Self {
        Self { module }
    }

    /// Get the contract address
    pub fn address(&self) -> Address {
        self.module
            .addresses
            .exclusive_revocable_confirmation_arbiter
    }

    /// Confirm a fulfillment for an escrow
    ///
    /// Only the escrow recipient can confirm.
    pub async fn confirm(
        &self,
        fulfillment: FixedBytes<32>,
        escrow: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let arbiter = contracts::arbiters::confirmation::ExclusiveRevocableConfirmationArbiter::new(
            self.module
                .addresses
                .exclusive_revocable_confirmation_arbiter,
            &*self.module.wallet_provider,
        );

        let receipt = arbiter
            .confirm(fulfillment, escrow)
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Revoke a confirmation
    ///
    /// Only the escrow recipient can revoke.
    pub async fn revoke(
        &self,
        fulfillment: FixedBytes<32>,
        escrow: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let arbiter = contracts::arbiters::confirmation::ExclusiveRevocableConfirmationArbiter::new(
            self.module
                .addresses
                .exclusive_revocable_confirmation_arbiter,
            &*self.module.wallet_provider,
        );

        let receipt = arbiter
            .revoke(fulfillment, escrow)
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Request confirmation for a fulfillment
    ///
    /// The fulfillment attester or recipient can request confirmation.
    pub async fn request_confirmation(
        &self,
        fulfillment: FixedBytes<32>,
        escrow: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let arbiter = contracts::arbiters::confirmation::ExclusiveRevocableConfirmationArbiter::new(
            self.module
                .addresses
                .exclusive_revocable_confirmation_arbiter,
            &*self.module.wallet_provider,
        );

        let receipt = arbiter
            .requestConfirmation(fulfillment, escrow)
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Wait for a confirmation event
    pub async fn wait_for_confirmation(
        &self,
        fulfillment: FixedBytes<32>,
        escrow: FixedBytes<32>,
        from_block: Option<u64>,
    ) -> eyre::Result<
        Log<contracts::arbiters::confirmation::ExclusiveRevocableConfirmationArbiter::ConfirmationMade>,
    >{
        let filter = Filter::new()
            .from_block(from_block.unwrap_or(0))
            .address(self.module.addresses.exclusive_revocable_confirmation_arbiter)
            .event_signature(
                contracts::arbiters::confirmation::ExclusiveRevocableConfirmationArbiter::ConfirmationMade::SIGNATURE_HASH,
            )
            .topic1(fulfillment)
            .topic2(escrow);

        let log = crate::utils::wait_for_first_log(
            &*self.module.public_provider,
            &filter,
            self.module.poll_interval,
        )
        .await?;
        let decoded = log.log_decode::<contracts::arbiters::confirmation::ExclusiveRevocableConfirmationArbiter::ConfirmationMade>()?;
        Ok(decoded.inner)
    }

    /// Wait for a confirmation request event
    pub async fn wait_for_confirmation_request(
        &self,
        fulfillment: FixedBytes<32>,
        confirmer: Address,
        escrow: FixedBytes<32>,
        from_block: Option<u64>,
    ) -> eyre::Result<
        Log<contracts::arbiters::confirmation::ExclusiveRevocableConfirmationArbiter::ConfirmationRequested>,
    >{
        let filter = Filter::new()
            .from_block(from_block.unwrap_or(0))
            .address(self.module.addresses.exclusive_revocable_confirmation_arbiter)
            .event_signature(
                contracts::arbiters::confirmation::ExclusiveRevocableConfirmationArbiter::ConfirmationRequested::SIGNATURE_HASH,
            )
            .topic1(fulfillment)
            .topic2(confirmer.into_word())
            .topic3(escrow);

        let log = crate::utils::wait_for_first_log(
            &*self.module.public_provider,
            &filter,
            self.module.poll_interval,
        )
        .await?;
        let decoded = log.log_decode::<contracts::arbiters::confirmation::ExclusiveRevocableConfirmationArbiter::ConfirmationRequested>()?;
        Ok(decoded.inner)
    }

    /// Check if a fulfillment is confirmed for an escrow
    pub async fn is_confirmed(
        &self,
        fulfillment: FixedBytes<32>,
        escrow: FixedBytes<32>,
    ) -> eyre::Result<bool> {
        let arbiter = contracts::arbiters::confirmation::ExclusiveRevocableConfirmationArbiter::new(
            self.module
                .addresses
                .exclusive_revocable_confirmation_arbiter,
            &*self.module.public_provider,
        );

        let confirmed = arbiter.confirmations(fulfillment, escrow).call().await?;
        Ok(confirmed)
    }
}
