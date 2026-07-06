//! Native Token payment obligation client
//!
//! Provides functionality for making direct native token payments.

use alloy::primitives::{Address, Bytes, FixedBytes, U256};
use alloy::rpc::types::TransactionReceipt;
use alloy::sol;
use alloy::sol_types::SolValue;

use crate::contracts;
use crate::types::{DecodedAttestation, NativeTokenData};
use crate::utils::contract_safety::{ensure_deployed_contract, ensure_packaged_escrow_attester};

use super::NativeTokenModule;

sol! {
    #[sol(rpc)]
    contract EscrowConditionDecoder {
        function decodeCondition(bytes data) external view returns (address arbiter, bytes demand);
    }
}

/// Payment API for native tokens
pub struct Payment<'a> {
    module: &'a NativeTokenModule,
}

impl<'a> Payment<'a> {
    pub fn new(module: &'a NativeTokenModule) -> Self {
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
        DecodedAttestation<contracts::obligations::NativeTokenPaymentObligation::ObligationData>,
    > {
        let eas_contract =
            contracts::IEAS::new(self.module.addresses.eas, &self.module.wallet_provider);

        let attestation = eas_contract.getAttestation(uid).call().await?;
        let obligation_data =
            contracts::obligations::NativeTokenPaymentObligation::ObligationData::abi_decode(
                &attestation.data,
            )?;

        Ok(DecodedAttestation {
            attestation,
            data: obligation_data,
        })
    }

    /// Makes a direct payment with native tokens.
    ///
    /// # Arguments
    /// * `price` - The native token data for payment
    /// * `payee` - The address of the payment recipient
    ///
    /// # Returns
    /// * `Result<TransactionReceipt>` - The transaction receipt
    pub async fn pay(
        &self,
        price: &NativeTokenData,
        payee: Address,
    ) -> eyre::Result<TransactionReceipt> {
        ensure_deployed_contract(
            self.module.addresses.payment_obligation,
            "NativeTokenPaymentObligation",
        )?;
        let payment_obligation_contract = contracts::obligations::NativeTokenPaymentObligation::new(
            self.module.addresses.payment_obligation,
            &self.module.wallet_provider,
        );

        let receipt = payment_obligation_contract
            .doObligation(
                contracts::obligations::NativeTokenPaymentObligation::ObligationData {
                    amount: price.value,
                    payee,
                },
                FixedBytes::<32>::ZERO, // refUID - no reference for standalone payments
            )
            .value(price.value)
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Pays a native-token payment obligation and collects the matching escrow atomically.
    ///
    /// Security note: uses AtomicPaymentUtils, which has not been included in
    /// professional manual audits and has only been reviewed by automated audit
    /// tooling so far.
    pub async fn pay_native_and_collect(
        &self,
        escrow_uid: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let amount = self.native_payment_amount(escrow_uid).await?;
        self.pay_native_and_collect_unchecked_with_amount(escrow_uid, amount)
            .await
    }

    /// Pays a native-token payment obligation and collects without SDK escrow-attester validation.
    ///
    /// Use only after independently validating that `escrow_uid` was authored by
    /// the escrow contract you intend to settle.
    pub async fn pay_native_and_collect_unchecked(
        &self,
        escrow_uid: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let amount = self.native_payment_amount_unchecked(escrow_uid).await?;
        self.pay_native_and_collect_unchecked_with_amount(escrow_uid, amount)
            .await
    }

    async fn pay_native_and_collect_unchecked_with_amount(
        &self,
        escrow_uid: FixedBytes<32>,
        amount: U256,
    ) -> eyre::Result<TransactionReceipt> {
        ensure_deployed_contract(
            self.module.addresses.atomic_payment_utils,
            "AtomicPaymentUtils",
        )?;
        let utility = contracts::utils::AtomicPaymentUtils::new(
            self.module.addresses.atomic_payment_utils,
            &self.module.wallet_provider,
        );

        Ok(utility
            .payNativeAndCollect(escrow_uid)
            .value(amount)
            .send()
            .await?
            .get_receipt()
            .await?)
    }

    async fn native_payment_amount(&self, escrow_uid: FixedBytes<32>) -> eyre::Result<U256> {
        let eas = contracts::IEAS::new(self.module.addresses.eas, &self.module.wallet_provider);
        let escrow = eas.getAttestation(escrow_uid).call().await?;
        ensure_packaged_escrow_attester(escrow.attester, &self.module.packaged_escrow_obligations)?;
        let decoder = EscrowConditionDecoder::new(escrow.attester, &self.module.wallet_provider);
        let decoded = decoder.decodeCondition(escrow.data).call().await?;
        self.native_payment_amount_from_demand_bytes(&decoded.demand)
    }

    async fn native_payment_amount_unchecked(
        &self,
        escrow_uid: FixedBytes<32>,
    ) -> eyre::Result<U256> {
        let eas = contracts::IEAS::new(self.module.addresses.eas, &self.module.wallet_provider);
        let escrow = eas.getAttestation(escrow_uid).call().await?;
        let decoder = EscrowConditionDecoder::new(escrow.attester, &self.module.wallet_provider);
        let decoded = decoder.decodeCondition(escrow.data).call().await?;
        self.native_payment_amount_from_demand_bytes(&decoded.demand)
    }

    fn native_payment_amount_from_demand_bytes(&self, demand: &Bytes) -> eyre::Result<U256> {
        let demand_data =
            contracts::obligations::NativeTokenPaymentObligation::ObligationData::abi_decode(
                demand,
            )?;
        Ok(demand_data.amount)
    }
}
