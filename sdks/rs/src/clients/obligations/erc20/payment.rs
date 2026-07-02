//! ERC20 payment obligation client
//!
//! Provides functionality for making direct ERC20 token payments.

use alloy::primitives::{Address, Bytes, FixedBytes, U256};
use alloy::rpc::types::TransactionReceipt;
use alloy::sol;
use alloy::sol_types::SolValue;

use crate::contracts;
use crate::types::{ApprovalPurpose, DecodedAttestation, Erc20Data};
use crate::utils::contract_safety::ensure_packaged_escrow_attester;

use super::Erc20Module;

sol! {
    #[sol(rpc)]
    contract EscrowConditionDecoder {
        function decodeCondition(bytes data) external view returns (address arbiter, bytes demand);
    }
}

/// Payment API for ERC20 tokens
pub struct Payment<'a> {
    module: &'a Erc20Module,
}

impl<'a> Payment<'a> {
    pub fn new(module: &'a Erc20Module) -> Self {
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
        DecodedAttestation<contracts::obligations::ERC20PaymentObligation::ObligationData>,
    > {
        let eas_contract =
            contracts::IEAS::new(self.module.addresses.eas, &self.module.wallet_provider);

        let attestation = eas_contract.getAttestation(uid).call().await?;
        let obligation_data =
            contracts::obligations::ERC20PaymentObligation::ObligationData::abi_decode(
                &attestation.data,
            )?;

        Ok(DecodedAttestation {
            attestation,
            data: obligation_data,
        })
    }

    /// Makes a direct payment with ERC20 tokens.
    ///
    /// # Arguments
    /// * `price` - The ERC20 token data for payment
    /// * `payee` - The address of the payment recipient
    ///
    /// # Returns
    /// * `Result<TransactionReceipt>` - The transaction receipt
    pub async fn pay(&self, price: &Erc20Data, payee: Address) -> eyre::Result<TransactionReceipt> {
        let payment_obligation_contract = contracts::obligations::ERC20PaymentObligation::new(
            self.module.addresses.payment_obligation,
            &self.module.wallet_provider,
        );

        let receipt = payment_obligation_contract
            .doObligation(
                contracts::obligations::ERC20PaymentObligation::ObligationData {
                    token: price.address,
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

    /// Makes a direct payment with ERC20 tokens after approving the token transfer.
    ///
    /// # Arguments
    /// * `price` - The ERC20 token data for payment
    /// * `payee` - The address of the payment recipient
    ///
    /// # Returns
    /// * `Result<(TransactionReceipt, TransactionReceipt)>` - The approval and payment receipts
    pub async fn approve_and_pay(
        &self,
        price: &Erc20Data,
        payee: Address,
    ) -> eyre::Result<(TransactionReceipt, TransactionReceipt)> {
        let util = self.module.util();
        let approval_receipt = util.approve(price, ApprovalPurpose::Payment).await?;
        let payment_receipt = self.pay(price, payee).await?;
        Ok((approval_receipt, payment_receipt))
    }

    /// Makes a direct payment with ERC20 tokens using permit signature.
    ///
    /// # Arguments
    /// * `price` - The ERC20 token data for payment
    /// * `payee` - The address of the payment recipient
    ///
    /// # Returns
    /// * `Result<TransactionReceipt>` - The transaction receipt
    pub async fn permit_and_pay(
        &self,
        price: &Erc20Data,
        payee: Address,
    ) -> eyre::Result<TransactionReceipt> {
        let util = self.module.util();
        let deadline = super::util::Util::get_permit_deadline()?;
        let permit = util
            .get_permit_signature(
                self.module.addresses.atomic_payment_utils,
                price,
                U256::from(deadline),
            )
            .await?;

        let atomic_payment_utils_contract = contracts::utils::AtomicPaymentUtils::new(
            self.module.addresses.atomic_payment_utils,
            &self.module.wallet_provider,
        );

        let receipt = atomic_payment_utils_contract
            .permitAndPayWithErc20(
                price.address,
                price.value,
                payee,
                FixedBytes::<32>::ZERO, // refUID - no reference for standalone payments
                U256::from(deadline),
                27 + permit.v() as u8,
                FixedBytes::<32>::from(permit.r()),
                FixedBytes::<32>::from(permit.s()),
            )
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Pays an ERC20 payment obligation and collects the matching escrow atomically.
    ///
    /// Security note: uses AtomicPaymentUtils, which has not been included in
    /// professional manual audits and has only been reviewed by automated audit
    /// tooling so far.
    pub async fn pay_erc20_and_collect(
        &self,
        escrow_uid: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        self.ensure_supported_atomic_payment_escrow(escrow_uid)
            .await?;
        self.pay_erc20_and_collect_unchecked(escrow_uid).await
    }

    /// Pays an ERC20 payment obligation and collects without SDK escrow-attester validation.
    ///
    /// Use only after independently validating that `escrow_uid` was authored by
    /// the escrow contract you intend to settle.
    pub async fn pay_erc20_and_collect_unchecked(
        &self,
        escrow_uid: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let utility = contracts::utils::AtomicPaymentUtils::new(
            self.module.addresses.atomic_payment_utils,
            &self.module.wallet_provider,
        );

        Ok(utility
            .payErc20AndCollect(escrow_uid)
            .send()
            .await?
            .get_receipt()
            .await?)
    }

    /// Pays with an ERC20 permit and collects the matching escrow atomically.
    ///
    /// Security note: uses AtomicPaymentUtils, which has not been included in
    /// professional manual audits and has only been reviewed by automated audit
    /// tooling so far.
    pub async fn permit_and_pay_erc20_and_collect(
        &self,
        escrow_uid: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let demand = self.erc20_payment_demand(escrow_uid).await?;
        self.permit_and_pay_erc20_and_collect_unchecked_with_demand(escrow_uid, demand)
            .await
    }

    /// Pays with an ERC20 permit and collects without SDK escrow-attester validation.
    ///
    /// Use only after independently validating that `escrow_uid` was authored by
    /// the escrow contract you intend to settle.
    pub async fn permit_and_pay_erc20_and_collect_unchecked(
        &self,
        escrow_uid: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let demand = self.erc20_payment_demand_unchecked(escrow_uid).await?;
        self.permit_and_pay_erc20_and_collect_unchecked_with_demand(escrow_uid, demand)
            .await
    }

    async fn permit_and_pay_erc20_and_collect_unchecked_with_demand(
        &self,
        escrow_uid: FixedBytes<32>,
        demand: Erc20Data,
    ) -> eyre::Result<TransactionReceipt> {
        let permit = self.get_payment_permit(&demand).await?;
        let utility = contracts::utils::AtomicPaymentUtils::new(
            self.module.addresses.atomic_payment_utils,
            &self.module.wallet_provider,
        );

        Ok(utility
            .permitAndPayErc20AndCollect(escrow_uid, permit.deadline, permit.v, permit.r, permit.s)
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

    async fn erc20_payment_demand(&self, escrow_uid: FixedBytes<32>) -> eyre::Result<Erc20Data> {
        let eas = contracts::IEAS::new(self.module.addresses.eas, &self.module.wallet_provider);
        let escrow = eas.getAttestation(escrow_uid).call().await?;
        ensure_packaged_escrow_attester(escrow.attester, &self.module.packaged_escrow_obligations)?;
        let decoder = EscrowConditionDecoder::new(escrow.attester, &self.module.wallet_provider);
        let decoded = decoder.decodeCondition(escrow.data).call().await?;
        self.erc20_payment_demand_from_demand_bytes(&decoded.demand)
    }

    async fn erc20_payment_demand_unchecked(
        &self,
        escrow_uid: FixedBytes<32>,
    ) -> eyre::Result<Erc20Data> {
        let eas = contracts::IEAS::new(self.module.addresses.eas, &self.module.wallet_provider);
        let escrow = eas.getAttestation(escrow_uid).call().await?;
        let decoder = EscrowConditionDecoder::new(escrow.attester, &self.module.wallet_provider);
        let decoded = decoder.decodeCondition(escrow.data).call().await?;
        self.erc20_payment_demand_from_demand_bytes(&decoded.demand)
    }

    fn erc20_payment_demand_from_demand_bytes(&self, demand: &Bytes) -> eyre::Result<Erc20Data> {
        let demand_data =
            contracts::obligations::ERC20PaymentObligation::ObligationData::abi_decode(demand)?;

        Ok(Erc20Data {
            address: demand_data.token,
            value: demand_data.amount,
        })
    }

    async fn get_payment_permit(&self, payment: &Erc20Data) -> eyre::Result<PaymentPermit> {
        let util = self.module.util();
        let deadline = super::util::Util::get_permit_deadline()?;
        let permit = util
            .get_permit_signature(
                self.module.addresses.atomic_payment_utils,
                payment,
                U256::from(deadline),
            )
            .await?;

        Ok(PaymentPermit {
            deadline: U256::from(deadline),
            v: 27 + permit.v() as u8,
            r: permit.r().into(),
            s: permit.s().into(),
        })
    }
}

struct PaymentPermit {
    deadline: U256,
    v: u8,
    r: FixedBytes<32>,
    s: FixedBytes<32>,
}
