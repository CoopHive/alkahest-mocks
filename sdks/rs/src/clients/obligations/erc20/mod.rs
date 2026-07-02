//! ERC20 obligations module
//!
//! This module provides functionality for ERC20 token operations including:
//! - Escrow obligations (unconditional and default)
//! - Payment obligations
//! - Utility functions for permits and approvals

pub mod escrow;
pub mod payment;
pub mod util;

use alloy::primitives::Address;
use alloy::signers::local::PrivateKeySigner;
use serde::{Deserialize, Serialize};

use crate::addresses::BASE_SEPOLIA_ADDRESSES;
use crate::contracts;
use crate::extensions::{AlkahestExtension, ContractModule};
use crate::impl_abi_conversions;
use crate::types::{ApprovalPurpose, Erc20Data, ProviderContext, SharedWalletProvider};

// --- ABI conversions for ERC20 obligation types ---
impl_abi_conversions!(contracts::obligations::ERC20PaymentObligation::ObligationData);
impl_abi_conversions!(
    contracts::obligations::escrow::default_escrow::ERC20EscrowObligation::ObligationData
);
impl_abi_conversions!(contracts::obligations::escrow::unconditional::UnconditionalERC20EscrowObligation::ObligationData);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Erc20Addresses {
    pub eas: Address,
    pub atomic_payment_utils: Address,
    pub escrow_obligation_default: Address,
    pub escrow_obligation_unconditional: Address,
    pub payment_obligation: Address,
}

impl Default for Erc20Addresses {
    fn default() -> Self {
        BASE_SEPOLIA_ADDRESSES.erc20_addresses
    }
}

/// Available contracts in the ERC20 module
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Erc20Contract {
    /// EAS (Ethereum Attestation Service) contract
    Eas,
    /// Atomic payment utilities contract for ERC20 tokens
    AtomicPaymentUtils,
    /// Escrow obligation contract for ERC20 tokens
    EscrowObligation,
    /// Payment obligation contract for ERC20 tokens
    PaymentObligation,
}

/// Client for interacting with ERC20 token trading and escrow functionality.
///
/// This client provides methods for:
/// - Trading ERC20 tokens for other ERC20, ERC721, and ERC1155 tokens
/// - Creating escrow arrangements with custom demands
/// - Managing token approvals and permits
/// - Collecting payments from fulfilled trades
#[derive(Clone)]
pub struct Erc20Module {
    pub(crate) signer: PrivateKeySigner,
    pub(crate) wallet_provider: SharedWalletProvider,
    pub(crate) packaged_escrow_obligations: Vec<Address>,
    pub addresses: Erc20Addresses,
}

impl ContractModule for Erc20Module {
    type Contract = Erc20Contract;

    fn address(&self, contract: Self::Contract) -> Address {
        match contract {
            Erc20Contract::Eas => self.addresses.eas,
            Erc20Contract::AtomicPaymentUtils => self.addresses.atomic_payment_utils,
            Erc20Contract::EscrowObligation => self.addresses.escrow_obligation_default,
            Erc20Contract::PaymentObligation => self.addresses.payment_obligation,
        }
    }
}

impl Erc20Module {
    /// Creates a new Erc20Module instance.
    pub fn new(
        signer: PrivateKeySigner,
        wallet_provider: SharedWalletProvider,
        addresses: Option<Erc20Addresses>,
    ) -> eyre::Result<Self> {
        let addresses = addresses.unwrap_or_default();
        let packaged_escrow_obligations = vec![
            addresses.escrow_obligation_default,
            addresses.escrow_obligation_unconditional,
        ];
        Ok(Erc20Module {
            signer,
            wallet_provider,
            packaged_escrow_obligations,
            addresses,
        })
    }

    pub(crate) fn set_packaged_escrow_obligations(&mut self, addresses: Vec<Address>) {
        self.packaged_escrow_obligations = addresses;
    }

    /// Access escrow API
    ///
    /// # Example
    /// ```rust,ignore
    /// // Non-unconditional escrow (1:1 escrow:fulfillment)
    /// client.erc20().escrow().default().create(&price, &item, expiration).await?;
    ///
    /// // Unconditional escrow (1:many escrow:fulfillment)
    /// client.erc20().escrow().unconditional().create(&price, &item, expiration).await?;
    /// ```
    pub fn escrow(&self) -> escrow::Escrow<'_> {
        escrow::Escrow::new(self)
    }

    /// Access payment API
    ///
    /// # Example
    /// ```rust,ignore
    /// client.erc20().payment().pay(&price, payee).await?;
    /// client.erc20().payment().permit_and_pay(&price, payee).await?;
    /// ```
    pub fn payment(&self) -> payment::Payment<'_> {
        payment::Payment::new(self)
    }

    /// Access utility API (permits and approvals)
    ///
    /// # Example
    /// ```rust,ignore
    /// client.erc20().util().approve(&token, ApprovalPurpose::Payment).await?;
    /// client.erc20().util().get_permit_signature(spender, &token, deadline).await?;
    /// ```
    pub fn util(&self) -> util::Util<'_> {
        util::Util::new(self)
    }

    /// Approves token spending for payment or escrow purposes.
    pub async fn approve(
        &self,
        token: &Erc20Data,
        purpose: ApprovalPurpose,
    ) -> eyre::Result<alloy::rpc::types::TransactionReceipt> {
        self.util().approve(token, purpose).await
    }

    /// Approves token spending if current allowance is less than required amount.
    pub async fn approve_if_less(
        &self,
        token: &Erc20Data,
        purpose: ApprovalPurpose,
    ) -> eyre::Result<Option<alloy::rpc::types::TransactionReceipt>> {
        self.util().approve_if_less(token, purpose).await
    }
}

impl AlkahestExtension for Erc20Module {
    type Config = Erc20Addresses;

    async fn init(
        signer: PrivateKeySigner,
        providers: ProviderContext,
        config: Option<Self::Config>,
    ) -> eyre::Result<Self> {
        Self::new(signer, providers.wallet.clone(), config)
    }
}

#[cfg(test)]
mod tests {
    use std::time::{SystemTime, UNIX_EPOCH};

    use alloy::{
        primitives::{Address, Bytes, FixedBytes, U256},
        providers::ext::AnvilApi as _,
        sol_types::SolValue,
    };

    use super::Erc20Module;
    use crate::{
        DefaultAlkahestClient,
        contracts::obligations::{
            ERC20PaymentObligation, ERC721PaymentObligation, ERC1155PaymentObligation,
            TokenBundlePaymentObligation, escrow::default_escrow::ERC20EscrowObligation,
        },
        extensions::{AlkahestExtension, HasErc20, HasErc721, HasErc1155, HasTokenBundle},
        fixtures::{MockERC20Permit, MockERC721, MockERC1155},
        types::{
            ApprovalPurpose, ArbiterData, Erc20Data, Erc721Data, Erc1155Data, TokenBundleData,
        },
        utils::setup_test_environment,
    };

    fn erc20_payment_demand(payment: &Erc20Data, payee: Address, arbiter: Address) -> ArbiterData {
        ArbiterData {
            arbiter,
            demand: ERC20PaymentObligation::ObligationData {
                token: payment.address,
                amount: payment.value,
                payee,
            }
            .into(),
        }
    }

    fn erc721_payment_demand(
        payment: &Erc721Data,
        payee: Address,
        arbiter: Address,
    ) -> ArbiterData {
        ArbiterData {
            arbiter,
            demand: ERC721PaymentObligation::ObligationData {
                token: payment.address,
                tokenId: payment.id,
                payee,
            }
            .into(),
        }
    }

    fn erc1155_payment_demand(
        payment: &Erc1155Data,
        payee: Address,
        arbiter: Address,
    ) -> ArbiterData {
        ArbiterData {
            arbiter,
            demand: ERC1155PaymentObligation::ObligationData {
                token: payment.address,
                tokenId: payment.id,
                amount: payment.value,
                payee,
            }
            .into(),
        }
    }

    fn bundle_payment_demand(
        payment: &TokenBundleData,
        payee: Address,
        arbiter: Address,
    ) -> ArbiterData {
        let demand: TokenBundlePaymentObligation::ObligationData = (payment, payee).into();

        ArbiterData {
            arbiter,
            demand: demand.into(),
        }
    }

    #[tokio::test]
    async fn test_decode_escrow_obligation() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // Create sample obligation data
        let token_address = test.mock_addresses.erc20_a;
        let amount: U256 = U256::from(100);
        let arbiter = test.addresses.erc20_addresses.payment_obligation;
        let demand = Bytes::from(vec![1, 2, 3, 4]); // sample demand data

        let escrow_data = ERC20EscrowObligation::ObligationData {
            token: token_address,
            amount,
            arbiter,
            demand: demand.clone(),
        };

        // Encode the data
        let encoded = escrow_data.abi_encode();

        // Decode the data using TryFrom<Bytes>
        let decoded: ERC20EscrowObligation::ObligationData =
            alloy::primitives::Bytes::from(encoded).try_into()?;

        // Verify decoded data
        assert_eq!(decoded.token, token_address, "Token address should match");
        assert_eq!(decoded.amount, amount, "Amount should match");
        assert_eq!(decoded.arbiter, arbiter, "Arbiter should match");
        assert_eq!(decoded.demand, demand, "Demand should match");

        Ok(())
    }

    #[tokio::test]
    async fn test_decode_payment_obligation() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // Create sample obligation data
        let token_address = test.mock_addresses.erc20_a;
        let amount: U256 = U256::from(100);
        let payee = test.alice.address();

        let payment_data = ERC20PaymentObligation::ObligationData {
            token: token_address,
            amount,
            payee,
        };

        // Encode the data
        let encoded = payment_data.abi_encode();

        // Decode the data using TryFrom<Bytes>
        let decoded: ERC20PaymentObligation::ObligationData =
            alloy::primitives::Bytes::from(encoded).try_into()?;

        // Verify decoded data
        assert_eq!(decoded.token, token_address, "Token address should match");
        assert_eq!(decoded.amount, amount, "Amount should match");
        assert_eq!(decoded.payee, payee, "Payee should match");

        Ok(())
    }

    #[tokio::test]
    async fn test_approve() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // give alice some erc20 tokens
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        let token = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(100),
        };

        // Test approve for payment
        let _receipt = test
            .alice_client
            .extensions
            .get_client::<Erc20Module>()
            .approve(&token, ApprovalPurpose::Payment)
            .await?;

        // Verify approval for payment obligation
        let payment_allowance = mock_erc20_a
            .allowance(
                test.alice.address(),
                test.addresses.erc20_addresses.clone().payment_obligation,
            )
            .call()
            .await?;

        assert_eq!(
            payment_allowance,
            U256::from(100),
            "Payment allowance should be set correctly"
        );

        // Test approve for escrow
        let _receipt = test
            .alice_client
            .erc20()
            .approve(&token, ApprovalPurpose::Escrow)
            .await?;

        // Verify approval for escrow obligation
        let escrow_allowance = mock_erc20_a
            .allowance(
                test.alice.address(),
                test.addresses.erc20_addresses.escrow_obligation_default,
            )
            .call()
            .await?;

        assert_eq!(
            escrow_allowance,
            U256::from(100),
            "Escrow allowance should be set correctly"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_approve_if_less() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // give alice some erc20 tokens
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(200))
            .send()
            .await?
            .get_receipt()
            .await?;

        let token = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(100),
        };

        // First time should approve (no existing allowance)
        let receipt_opt = test
            .alice_client
            .erc20()
            .approve_if_less(&token, ApprovalPurpose::Payment)
            .await?;

        assert!(
            receipt_opt.is_some(),
            "First approval should return receipt"
        );

        // Verify approval happened
        let payment_allowance = mock_erc20_a
            .allowance(
                test.alice.address(),
                test.addresses.erc20_addresses.clone().payment_obligation,
            )
            .call()
            .await?;

        assert_eq!(
            payment_allowance,
            U256::from(100),
            "Payment allowance should be set correctly"
        );

        // Second time should not approve (existing allowance is sufficient)
        let receipt_opt = test
            .alice_client
            .erc20()
            .approve_if_less(&token, ApprovalPurpose::Payment)
            .await?;

        assert!(receipt_opt.is_none(), "Second approval should not happen");

        // Now test with a larger amount
        let larger_token = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(150),
        };

        // This should approve again because we need a higher allowance
        let receipt_opt = test
            .alice_client
            .erc20()
            .approve_if_less(&larger_token, ApprovalPurpose::Payment)
            .await?;

        assert!(
            receipt_opt.is_some(),
            "Third approval with larger amount should return receipt"
        );

        // Verify new approval amount
        let new_payment_allowance = mock_erc20_a
            .allowance(
                test.alice.address(),
                test.addresses.erc20_addresses.payment_obligation,
            )
            .call()
            .await?;

        assert_eq!(
            new_payment_allowance,
            U256::from(150),
            "New payment allowance should be set correctly"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_buy_with_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // give alice some erc20 tokens
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        let price = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(100),
        };

        // Create custom arbiter data
        let arbiter = test.addresses.erc20_addresses.clone().payment_obligation;
        let demand = Bytes::from(b"custom demand data");
        let item = ArbiterData { arbiter, demand };

        // approve tokens for escrow
        test.alice_client
            .erc20()
            .approve(&price, ApprovalPurpose::Escrow)
            .await?;

        // alice creates escrow with custom demand
        let receipt = test
            .alice_client
            .erc20()
            .escrow()
            .default()
            .create(&price, &item, 0)
            .await?;

        // Verify escrow happened
        let alice_balance = mock_erc20_a.balanceOf(test.alice.address()).call().await?;

        let escrow_balance = mock_erc20_a
            .balanceOf(test.addresses.erc20_addresses.escrow_obligation_default)
            .call()
            .await?;

        // all tokens in escrow
        assert_eq!(alice_balance, U256::from(0));
        assert_eq!(escrow_balance, U256::from(100));

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_permit_and_buy_with_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // give alice some erc20 tokens
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        let price = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(100),
        };

        // Create custom arbiter data
        let arbiter = test.addresses.erc20_addresses.clone().payment_obligation;
        let demand = Bytes::from(b"custom demand data");
        let item = ArbiterData { arbiter, demand };

        let expiration = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 3600; // 1 hour

        // alice deposits tokens to escrow,
        let receipt = test
            .alice_client
            .erc20()
            .escrow()
            .default()
            .permit_and_create(&price, &item, expiration)
            .await?;

        // Verify escrow happened
        let alice_balance = mock_erc20_a.balanceOf(test.alice.address()).call().await?;

        let escrow_balance = mock_erc20_a
            .balanceOf(test.addresses.erc20_addresses.escrow_obligation_default)
            .call()
            .await?;

        // all tokens in escrow
        assert_eq!(alice_balance, U256::from(0));
        assert_eq!(escrow_balance, U256::from(100));

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_pay_with_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // give alice some erc20 tokens
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        let price = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(100),
        };

        // approve tokens for payment
        test.alice_client
            .erc20()
            .approve(&price, ApprovalPurpose::Payment)
            .await?;

        // alice makes direct payment to bob
        let receipt = test
            .alice_client
            .erc20()
            .payment()
            .pay(&price, test.bob.address())
            .await?;

        // Verify payment happened
        let alice_balance = mock_erc20_a.balanceOf(test.alice.address()).call().await?;

        let bob_balance = mock_erc20_a.balanceOf(test.bob.address()).call().await?;

        // all tokens paid to bob
        assert_eq!(alice_balance, U256::from(0));
        assert_eq!(bob_balance, U256::from(100));

        // payment obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_permit_and_pay_with_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // give alice some erc20 tokens
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        let price = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(100),
        };

        // alice makes direct payment to bob using permit (no pre-approval needed)
        let receipt = test
            .alice_client
            .erc20()
            .payment()
            .permit_and_pay(&price, test.bob.address())
            .await?;

        // Verify payment happened
        let alice_balance = mock_erc20_a.balanceOf(test.alice.address()).call().await?;

        let bob_balance = mock_erc20_a.balanceOf(test.bob.address()).call().await?;

        // all tokens paid to bob
        assert_eq!(alice_balance, U256::from(0));
        assert_eq!(bob_balance, U256::from(100));

        // payment obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    // Erc20AtomicPaymentUtils
    #[tokio::test]
    async fn test_buy_erc20_for_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // give alice some erc20 tokens
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // begin test
        let bid = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(100),
        };
        let ask = Erc20Data {
            address: test.mock_addresses.erc20_b,
            value: U256::from(200),
        };

        // alice approves tokens for atomic payment
        test.alice_client
            .erc20()
            .approve(&bid, ApprovalPurpose::Escrow)
            .await?;

        // alice makes escrow
        let receipt = test
            .alice_client
            .erc20()
            .escrow()
            .default()
            .create(
                &bid,
                &erc20_payment_demand(
                    &ask,
                    test.alice.address(),
                    test.addresses.erc20_addresses.payment_obligation,
                ),
                0,
            )
            .await?;

        let alice_balance = mock_erc20_a.balanceOf(test.alice.address()).call().await?;
        let escrow_balance = mock_erc20_a
            .balanceOf(test.addresses.erc20_addresses.escrow_obligation_default)
            .call()
            .await?;

        // all tokens in escrow
        assert_eq!(alice_balance, U256::from(0));
        assert_eq!(escrow_balance, U256::from(100));

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_permit_and_buy_erc20_for_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // give alice some erc20 tokens
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // begin test
        let bid = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(100),
        };
        let ask = Erc20Data {
            address: test.mock_addresses.erc20_b,
            value: U256::from(200),
        };

        // alice creates an escrow using permit signature (no pre-approval needed)
        let receipt = test
            .alice_client
            .erc20()
            .escrow()
            .default()
            .permit_and_create(
                &bid,
                &erc20_payment_demand(
                    &ask,
                    test.alice.address(),
                    test.addresses.erc20_addresses.payment_obligation,
                ),
                0,
            )
            .await?;

        let alice_balance = mock_erc20_a.balanceOf(test.alice.address()).call().await?;
        let escrow_balance = mock_erc20_a
            .balanceOf(test.addresses.erc20_addresses.escrow_obligation_default)
            .call()
            .await?;

        // all tokens in escrow
        assert_eq!(alice_balance, U256::from(0));
        assert_eq!(escrow_balance, U256::from(100));

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_pay_erc20_and_collect_for_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // give alice some erc20 tokens for bidding
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // give bob some erc20 tokens for fulfillment
        let mock_erc20_b = MockERC20Permit::new(test.mock_addresses.erc20_b, &test.god_provider);
        mock_erc20_b
            .transfer(test.bob.address(), U256::from(200))
            .send()
            .await?
            .get_receipt()
            .await?;

        // begin test
        let bid = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(100),
        };
        let ask = Erc20Data {
            address: test.mock_addresses.erc20_b,
            value: U256::from(200),
        };

        // alice approves tokens for atomic payment and creates buy attestation
        test.alice_client
            .erc20()
            .approve(&bid, ApprovalPurpose::Escrow)
            .await?;

        let buy_receipt = test
            .alice_client
            .erc20()
            .escrow()
            .default()
            .create(
                &bid,
                &erc20_payment_demand(
                    &ask,
                    test.alice.address(),
                    test.addresses.erc20_addresses.payment_obligation,
                ),
                0,
            )
            .await?;

        let buy_attestation = DefaultAlkahestClient::get_attested_event(buy_receipt)?.uid;

        // bob approves tokens for atomic payment
        test.bob_client
            .erc20()
            .approve(&ask, ApprovalPurpose::AtomicPayment)
            .await?;

        // bob fulfills the buy attestation
        let _sell_receipt = test
            .bob_client
            .erc20()
            .payment()
            .pay_erc20_and_collect(buy_attestation)
            .await?;

        // verify token transfers
        let alice_token_b_balance = mock_erc20_b.balanceOf(test.alice.address()).call().await?;

        let bob_token_a_balance = mock_erc20_a.balanceOf(test.bob.address()).call().await?;

        // both sides received the tokens
        assert_eq!(
            alice_token_b_balance,
            U256::from(200),
            "Alice should have received token B"
        );
        assert_eq!(
            bob_token_a_balance,
            U256::from(100),
            "Bob should have received token A"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_permit_and_pay_erc20_and_collect_for_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // give alice some erc20 tokens for bidding
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // give bob some erc20 tokens for fulfillment
        let mock_erc20_b = MockERC20Permit::new(test.mock_addresses.erc20_b, &test.god_provider);
        mock_erc20_b
            .transfer(test.bob.address(), U256::from(200))
            .send()
            .await?
            .get_receipt()
            .await?;

        // begin test
        let bid = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(100),
        };
        let ask = Erc20Data {
            address: test.mock_addresses.erc20_b,
            value: U256::from(200),
        };

        // alice approves tokens for atomic payment and creates buy attestation
        test.alice_client
            .erc20()
            .approve(&bid, ApprovalPurpose::Escrow)
            .await?;

        let buy_receipt = test
            .alice_client
            .erc20()
            .escrow()
            .default()
            .create(
                &bid,
                &erc20_payment_demand(
                    &ask,
                    test.alice.address(),
                    test.addresses.erc20_addresses.payment_obligation,
                ),
                0,
            )
            .await?;

        let buy_attestation = DefaultAlkahestClient::get_attested_event(buy_receipt)?.uid;

        // bob fulfills the buy attestation with permit
        let _sell_receipt = test
            .bob_client
            .erc20()
            .payment()
            .permit_and_pay_erc20_and_collect(buy_attestation)
            .await?;

        // verify token transfers
        let alice_token_b_balance = mock_erc20_b.balanceOf(test.alice.address()).call().await?;

        let bob_token_a_balance = mock_erc20_a.balanceOf(test.bob.address()).call().await?;

        // both sides received the tokens
        assert_eq!(
            alice_token_b_balance,
            U256::from(200),
            "Alice should have received token B"
        );
        assert_eq!(
            bob_token_a_balance,
            U256::from(100),
            "Bob should have received token A"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_collect_expired() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // give alice some erc20 tokens
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // begin test
        let bid = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(100),
        };
        let ask = Erc20Data {
            address: test.mock_addresses.erc20_b,
            value: U256::from(200),
        };

        // alice approves tokens for atomic payment
        test.alice_client
            .erc20()
            .approve(&bid, ApprovalPurpose::Escrow)
            .await?;

        // alice makes escrow with a short expiration
        let expiration = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 10;
        let receipt = test
            .alice_client
            .erc20()
            .escrow()
            .default()
            .create(
                &bid,
                &erc20_payment_demand(
                    &ask,
                    test.alice.address(),
                    test.addresses.erc20_addresses.payment_obligation,
                ),
                expiration as u64 + 1,
            )
            .await?;

        let buy_attestation = DefaultAlkahestClient::get_attested_event(receipt)?.uid;
        println!("buy attestation: {:?}", buy_attestation);

        // Wait for expiration
        test.god_provider.anvil_increase_time(20).await?;

        // alice collects expired funds
        let _collect_receipt = test
            .alice_client
            .erc20()
            .escrow()
            .default()
            .reclaim_expired(buy_attestation)
            .await?;

        // verify tokens returned to alice
        let alice_balance = mock_erc20_a.balanceOf(test.alice.address()).call().await?;

        assert_eq!(
            alice_balance,
            U256::from(100),
            "Tokens should be returned to Alice"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_buy_erc721_for_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // Set up tokens - alice gets ERC20, bob gets ERC721
        let mock_erc20 = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // Create a purchase offer
        let bid = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(50),
        };

        let ask = Erc721Data {
            address: test.mock_addresses.erc721_a,
            id: U256::from(1),
        };

        // alice approves tokens for atomic payment
        test.alice_client
            .erc20()
            .approve(&bid, ApprovalPurpose::Escrow)
            .await?;

        // alice creates purchase offer
        let receipt = test
            .alice_client
            .erc20()
            .escrow()
            .default()
            .create(
                &bid,
                &erc721_payment_demand(
                    &ask,
                    test.alice.address(),
                    test.addresses.erc721_addresses.payment_obligation,
                ),
                0,
            )
            .await?;

        // Verify escrow happened
        let alice_balance = mock_erc20.balanceOf(test.alice.address()).call().await?;

        let escrow_balance = mock_erc20
            .balanceOf(test.addresses.erc20_addresses.escrow_obligation_default)
            .call()
            .await?;

        // tokens in escrow
        assert_eq!(alice_balance, U256::from(50));
        assert_eq!(escrow_balance, U256::from(50));

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_buy_erc1155_for_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // Set up tokens - alice gets ERC20
        let mock_erc20 = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // Create a purchase offer
        let bid = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(50),
        };

        let ask = Erc1155Data {
            address: test.mock_addresses.erc1155_a,
            id: U256::from(1),
            value: U256::from(10),
        };

        // alice approves tokens for atomic payment
        test.alice_client
            .erc20()
            .approve(&bid, ApprovalPurpose::Escrow)
            .await?;

        // alice creates purchase offer
        let receipt = test
            .alice_client
            .erc20()
            .escrow()
            .default()
            .create(
                &bid,
                &erc1155_payment_demand(
                    &ask,
                    test.alice.address(),
                    test.addresses.erc1155_addresses.payment_obligation,
                ),
                0,
            )
            .await?;

        // Verify escrow happened
        let alice_balance = mock_erc20.balanceOf(test.alice.address()).call().await?;

        let escrow_balance = mock_erc20
            .balanceOf(test.addresses.erc20_addresses.escrow_obligation_default)
            .call()
            .await?;

        // tokens in escrow
        assert_eq!(alice_balance, U256::from(50));
        assert_eq!(escrow_balance, U256::from(50));

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_buy_bundle_for_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // Set up tokens - alice gets ERC20
        let mock_erc20 = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // Create a purchase offer
        let bid = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(50),
        };

        // Create bundle data
        let bundle = TokenBundleData {
            erc20s: vec![Erc20Data {
                address: test.mock_addresses.erc20_b,
                value: U256::from(20),
            }],
            erc721s: vec![Erc721Data {
                address: test.mock_addresses.erc721_a,
                id: U256::from(1),
            }],
            erc1155s: vec![Erc1155Data {
                address: test.mock_addresses.erc1155_a,
                id: U256::from(1),
                value: U256::from(5),
            }],
            native_amount: U256::ZERO,
        };
        // alice approves tokens for atomic payment
        test.alice_client
            .erc20()
            .approve(&bid, ApprovalPurpose::Escrow)
            .await?;

        // alice creates purchase offer
        let receipt = test
            .alice_client
            .erc20()
            .escrow()
            .default()
            .create(
                &bid,
                &bundle_payment_demand(
                    &bundle,
                    test.alice.address(),
                    test.addresses.token_bundle_addresses.payment_obligation,
                ),
                0,
            )
            .await?;

        // Verify escrow happened
        let alice_balance = mock_erc20.balanceOf(test.alice.address()).call().await?;

        let escrow_balance = mock_erc20
            .balanceOf(test.addresses.erc20_addresses.escrow_obligation_default)
            .call()
            .await?;

        // tokens in escrow
        assert_eq!(alice_balance, U256::from(50));
        assert_eq!(escrow_balance, U256::from(50));

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_permit_and_buy_erc721_for_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // Set up tokens - alice gets ERC20, bob gets ERC721
        let mock_erc20 = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // Create a purchase offer
        let bid = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(50),
        };

        let ask = Erc721Data {
            address: test.mock_addresses.erc721_a,
            id: U256::from(1),
        };

        // alice creates purchase offer with permit (no pre-approval needed)
        let receipt = test
            .alice_client
            .erc20()
            .escrow()
            .default()
            .permit_and_create(
                &bid,
                &erc721_payment_demand(
                    &ask,
                    test.alice.address(),
                    test.addresses.erc721_addresses.payment_obligation,
                ),
                0,
            )
            .await?;

        // Verify escrow happened
        let alice_balance = mock_erc20.balanceOf(test.alice.address()).call().await?;

        let escrow_balance = mock_erc20
            .balanceOf(test.addresses.erc20_addresses.escrow_obligation_default)
            .call()
            .await?;

        // tokens in escrow
        assert_eq!(alice_balance, U256::from(50));
        assert_eq!(escrow_balance, U256::from(50));

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_permit_and_buy_erc1155_for_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // Set up tokens - alice gets ERC20
        let mock_erc20 = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // Create a purchase offer
        let bid = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(50),
        };

        let ask = Erc1155Data {
            address: test.mock_addresses.erc1155_a,
            id: U256::from(1),
            value: U256::from(10),
        };

        // alice creates purchase offer with permit (no pre-approval needed)
        let receipt = test
            .alice_client
            .erc20()
            .escrow()
            .default()
            .permit_and_create(
                &bid,
                &erc1155_payment_demand(
                    &ask,
                    test.alice.address(),
                    test.addresses.erc1155_addresses.payment_obligation,
                ),
                0,
            )
            .await?;

        // Verify escrow happened
        let alice_balance = mock_erc20.balanceOf(test.alice.address()).call().await?;

        let escrow_balance = mock_erc20
            .balanceOf(test.addresses.erc20_addresses.escrow_obligation_default)
            .call()
            .await?;

        // tokens in escrow
        assert_eq!(alice_balance, U256::from(50));
        assert_eq!(escrow_balance, U256::from(50));

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_permit_and_buy_bundle_for_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // Set up tokens - alice gets ERC20
        let mock_erc20 = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // Create a purchase offer
        let bid = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(50),
        };

        // Create bundle data
        let bundle = TokenBundleData {
            erc20s: vec![Erc20Data {
                address: test.mock_addresses.erc20_b,
                value: U256::from(20),
            }],
            erc721s: vec![Erc721Data {
                address: test.mock_addresses.erc721_a,
                id: U256::from(1),
            }],
            erc1155s: vec![Erc1155Data {
                address: test.mock_addresses.erc1155_a,
                id: U256::from(1),
                value: U256::from(5),
            }],
            native_amount: U256::ZERO,
        };

        // alice creates purchase offer with permit (no pre-approval needed)
        let receipt = test
            .alice_client
            .erc20()
            .escrow()
            .default()
            .permit_and_create(
                &bid,
                &bundle_payment_demand(
                    &bundle,
                    test.alice.address(),
                    test.addresses.token_bundle_addresses.payment_obligation,
                ),
                0,
            )
            .await?;

        // Verify escrow happened
        let alice_balance = mock_erc20.balanceOf(test.alice.address()).call().await?;

        let escrow_balance = mock_erc20
            .balanceOf(test.addresses.erc20_addresses.escrow_obligation_default)
            .call()
            .await?;

        // tokens in escrow
        assert_eq!(alice_balance, U256::from(50));
        assert_eq!(escrow_balance, U256::from(50));

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_pay_erc20_and_collect_for_erc721() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // Set up tokens - alice gets ERC20, bob gets ERC721
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        let mock_erc721_a = MockERC721::new(test.mock_addresses.erc721_a, &test.god_provider);

        // Give Alice ERC20 tokens
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // Mint an ERC721 token to Bob
        mock_erc721_a
            .mint(test.bob.address())
            .send()
            .await?
            .get_receipt()
            .await?;

        // Create test data
        let erc20_amount: U256 = U256::from(50);
        let erc721_token_id: U256 = U256::from(1);
        let expiration = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 3600; // 1 hour

        // First create a buy attestation with Bob escrowing ERC721
        // Bob approves his ERC721 for atomic payment
        test.bob_client
            .erc721()
            .approve(
                &Erc721Data {
                    address: test.mock_addresses.erc721_a,
                    id: erc721_token_id,
                },
                ApprovalPurpose::Escrow,
            )
            .await?;

        // Bob creates ERC721 escrow requesting ERC20
        let buy_receipt = test
            .bob_client
            .erc721()
            .escrow()
            .default()
            .create(
                &Erc721Data {
                    address: test.mock_addresses.erc721_a,
                    id: erc721_token_id,
                },
                &erc20_payment_demand(
                    &Erc20Data {
                        address: test.mock_addresses.erc20_a,
                        value: erc20_amount,
                    },
                    test.bob.address(),
                    test.addresses.erc20_addresses.payment_obligation,
                ),
                expiration as u64,
            )
            .await?;

        let buy_attestation = DefaultAlkahestClient::get_attested_event(buy_receipt)?.uid;

        // Check ownership before the exchange
        let initial_erc721_owner = mock_erc721_a.ownerOf(erc721_token_id).call().await?;
        assert_eq!(
            initial_erc721_owner, test.addresses.erc721_addresses.escrow_obligation_default,
            "ERC721 should be in escrow"
        );

        let initial_alice_erc20_balance =
            mock_erc20_a.balanceOf(test.alice.address()).call().await?;

        // Alice approves her ERC20 tokens for payment
        test.alice_client
            .erc20()
            .approve(
                &Erc20Data {
                    address: test.mock_addresses.erc20_a,
                    value: erc20_amount,
                },
                ApprovalPurpose::AtomicPayment,
            )
            .await?;

        // Alice fulfills Bob's escrow
        let pay_receipt = test
            .alice_client
            .erc20()
            .payment()
            .pay_erc20_and_collect(buy_attestation)
            .await?;

        // Verify the payment attestation was created
        let pay_attestation = DefaultAlkahestClient::get_attested_event(pay_receipt)?;
        assert_ne!(pay_attestation.uid, FixedBytes::<32>::default());

        // Verify token transfers
        let final_erc721_owner = mock_erc721_a.ownerOf(erc721_token_id).call().await?;
        assert_eq!(
            final_erc721_owner,
            test.alice.address(),
            "Alice should now own the ERC721 token"
        );

        let final_alice_erc20_balance = mock_erc20_a.balanceOf(test.alice.address()).call().await?;
        let bob_erc20_balance = mock_erc20_a.balanceOf(test.bob.address()).call().await?;

        // Alice spent erc20_amount tokens
        assert_eq!(
            initial_alice_erc20_balance - final_alice_erc20_balance,
            erc20_amount,
            "Alice should have spent the correct amount of ERC20 tokens"
        );

        // Bob received erc20_amount tokens
        assert_eq!(
            bob_erc20_balance, erc20_amount,
            "Bob should have received the correct amount of ERC20 tokens"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_permit_and_pay_erc20_and_collect_for_erc721() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // Set up tokens - alice gets ERC20, bob gets ERC721
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        let mock_erc721_a = MockERC721::new(test.mock_addresses.erc721_a, &test.god_provider);

        // Give Alice ERC20 tokens
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // Mint an ERC721 token to Bob
        mock_erc721_a
            .mint(test.bob.address())
            .send()
            .await?
            .get_receipt()
            .await?;

        // Create test data
        let erc20_amount: U256 = U256::from(50);
        let erc721_token_id: U256 = U256::from(1);
        let expiration = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 3600; // 1 hour

        // First create a buy attestation with Bob escrowing ERC721
        // Bob approves his ERC721 for escrow

        test.bob_client
            .erc721()
            .approve(
                &Erc721Data {
                    address: test.mock_addresses.erc721_a,
                    id: erc721_token_id,
                },
                ApprovalPurpose::Escrow,
            )
            .await?;

        // Bob creates ERC721 escrow requesting ERC20
        let buy_receipt = test
            .bob_client
            .erc721()
            .escrow()
            .default()
            .create(
                &Erc721Data {
                    address: test.mock_addresses.erc721_a,
                    id: erc721_token_id,
                },
                &erc20_payment_demand(
                    &Erc20Data {
                        address: test.mock_addresses.erc20_a,
                        value: erc20_amount,
                    },
                    test.bob.address(),
                    test.addresses.erc20_addresses.payment_obligation,
                ),
                expiration as u64,
            )
            .await?;

        let buy_attestation = DefaultAlkahestClient::get_attested_event(buy_receipt)?.uid;

        // Check ownership before the exchange
        let initial_erc721_owner = mock_erc721_a.ownerOf(erc721_token_id).call().await?;
        assert_eq!(
            initial_erc721_owner, test.addresses.erc721_addresses.escrow_obligation_default,
            "ERC721 should be in escrow"
        );

        let initial_alice_erc20_balance =
            mock_erc20_a.balanceOf(test.alice.address()).call().await?;

        // Alice fulfills Bob's escrow using permit
        let pay_receipt = test
            .alice_client
            .erc20()
            .payment()
            .permit_and_pay_erc20_and_collect(buy_attestation)
            .await?;

        // Verify the payment attestation was created
        let pay_attestation = DefaultAlkahestClient::get_attested_event(pay_receipt)?;
        assert_ne!(pay_attestation.uid, FixedBytes::<32>::default());

        // Verify token transfers
        let final_erc721_owner = mock_erc721_a.ownerOf(erc721_token_id).call().await?;
        assert_eq!(
            final_erc721_owner,
            test.alice.address(),
            "Alice should now own the ERC721 token"
        );

        let final_alice_erc20_balance = mock_erc20_a.balanceOf(test.alice.address()).call().await?;
        let bob_erc20_balance = mock_erc20_a.balanceOf(test.bob.address()).call().await?;

        // Alice spent erc20_amount tokens
        assert_eq!(
            initial_alice_erc20_balance - final_alice_erc20_balance,
            erc20_amount,
            "Alice should have spent the correct amount of ERC20 tokens"
        );

        // Bob received erc20_amount tokens
        assert_eq!(
            bob_erc20_balance, erc20_amount,
            "Bob should have received the correct amount of ERC20 tokens"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_pay_erc20_and_collect_for_erc1155() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // Set up tokens - alice gets ERC20, bob gets ERC1155
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);

        // Give Alice ERC20 tokens
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // Mint ERC1155 tokens to Bob
        let token_id = U256::from(1);
        let token_amount = U256::from(50);
        mock_erc1155_a
            .mint(test.bob.address(), token_id, token_amount)
            .send()
            .await?
            .get_receipt()
            .await?;

        // Create test data
        let erc20_amount: U256 = U256::from(50);
        let expiration = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 3600; // 1 hour

        // First create a buy attestation with Bob escrowing ERC1155
        // Bob approves his ERC1155 for atomic payment
        test.bob_client
            .erc1155()
            .approve_all(test.mock_addresses.erc1155_a, ApprovalPurpose::Escrow)
            .await?;

        // Bob creates ERC1155 escrow requesting ERC20
        let buy_receipt = test
            .bob_client
            .erc1155()
            .escrow()
            .default()
            .create(
                &Erc1155Data {
                    address: test.mock_addresses.erc1155_a,
                    id: token_id,
                    value: token_amount,
                },
                &erc20_payment_demand(
                    &Erc20Data {
                        address: test.mock_addresses.erc20_a,
                        value: erc20_amount,
                    },
                    test.bob.address(),
                    test.addresses.erc20_addresses.payment_obligation,
                ),
                expiration as u64,
            )
            .await?;

        let buy_attestation = DefaultAlkahestClient::get_attested_event(buy_receipt)?.uid;

        // Check balances before the exchange
        let initial_alice_erc1155_balance = mock_erc1155_a
            .balanceOf(test.alice.address(), token_id)
            .call()
            .await?;
        assert_eq!(
            initial_alice_erc1155_balance,
            U256::from(0),
            "Alice should start with 0 ERC1155 tokens"
        );

        let initial_alice_erc20_balance =
            mock_erc20_a.balanceOf(test.alice.address()).call().await?;

        // Alice approves her ERC20 tokens for atomic payment
        test.alice_client
            .erc20()
            .approve(
                &Erc20Data {
                    address: test.mock_addresses.erc20_a,
                    value: erc20_amount,
                },
                ApprovalPurpose::AtomicPayment,
            )
            .await?;

        // Alice fulfills Bob's escrow
        let pay_receipt = test
            .alice_client
            .erc20()
            .payment()
            .pay_erc20_and_collect(buy_attestation)
            .await?;

        // Verify the payment attestation was created
        let pay_attestation = DefaultAlkahestClient::get_attested_event(pay_receipt)?;
        assert_ne!(pay_attestation.uid, FixedBytes::<32>::default());

        // Verify token transfers
        let final_alice_erc1155_balance = mock_erc1155_a
            .balanceOf(test.alice.address(), token_id)
            .call()
            .await?;
        assert_eq!(
            final_alice_erc1155_balance, token_amount,
            "Alice should have received the ERC1155 tokens"
        );

        let final_alice_erc20_balance = mock_erc20_a.balanceOf(test.alice.address()).call().await?;
        let bob_erc20_balance = mock_erc20_a.balanceOf(test.bob.address()).call().await?;

        // Alice spent erc20_amount tokens
        assert_eq!(
            initial_alice_erc20_balance - final_alice_erc20_balance,
            erc20_amount,
            "Alice should have spent the correct amount of ERC20 tokens"
        );

        // Bob received erc20_amount tokens
        assert_eq!(
            bob_erc20_balance, erc20_amount,
            "Bob should have received the correct amount of ERC20 tokens"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_permit_and_pay_erc20_and_collect_for_erc1155() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // Set up tokens - alice gets ERC20, bob gets ERC1155
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);

        // Give Alice ERC20 tokens
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // Mint ERC1155 tokens to Bob
        let token_id = U256::from(1);
        let token_amount = U256::from(50);
        mock_erc1155_a
            .mint(test.bob.address(), token_id, token_amount)
            .send()
            .await?
            .get_receipt()
            .await?;

        // Create test data
        let erc20_amount: U256 = U256::from(50);
        let expiration = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 3600; // 1 hour

        // First create a buy attestation with Bob escrowing ERC1155
        // Bob approves his ERC1155 for atomic payment
        test.bob_client
            .erc1155()
            .approve_all(test.mock_addresses.erc1155_a, ApprovalPurpose::Escrow)
            .await?;

        // Bob creates ERC1155 escrow requesting ERC20
        let buy_receipt = test
            .bob_client
            .erc1155()
            .escrow()
            .default()
            .create(
                &Erc1155Data {
                    address: test.mock_addresses.erc1155_a,
                    id: token_id,
                    value: token_amount,
                },
                &erc20_payment_demand(
                    &Erc20Data {
                        address: test.mock_addresses.erc20_a,
                        value: erc20_amount,
                    },
                    test.bob.address(),
                    test.addresses.erc20_addresses.payment_obligation,
                ),
                expiration as u64,
            )
            .await?;

        let buy_attestation = DefaultAlkahestClient::get_attested_event(buy_receipt)?.uid;

        // Check balances before the exchange
        let initial_alice_erc1155_balance = mock_erc1155_a
            .balanceOf(test.alice.address(), token_id)
            .call()
            .await?;
        assert_eq!(
            initial_alice_erc1155_balance,
            U256::from(0),
            "Alice should start with 0 ERC1155 tokens"
        );

        let initial_alice_erc20_balance =
            mock_erc20_a.balanceOf(test.alice.address()).call().await?;

        // Alice fulfills Bob's escrow using permit
        let pay_receipt = test
            .alice_client
            .erc20()
            .payment()
            .permit_and_pay_erc20_and_collect(buy_attestation)
            .await?;

        // Verify the payment attestation was created
        let pay_attestation = DefaultAlkahestClient::get_attested_event(pay_receipt)?;
        assert_ne!(pay_attestation.uid, FixedBytes::<32>::default());

        // Verify token transfers
        let final_alice_erc1155_balance = mock_erc1155_a
            .balanceOf(test.alice.address(), token_id)
            .call()
            .await?;
        assert_eq!(
            final_alice_erc1155_balance, token_amount,
            "Alice should have received the ERC1155 tokens"
        );

        let final_alice_erc20_balance = mock_erc20_a.balanceOf(test.alice.address()).call().await?;
        let bob_erc20_balance = mock_erc20_a.balanceOf(test.bob.address()).call().await?;

        // Alice spent erc20_amount tokens
        assert_eq!(
            initial_alice_erc20_balance - final_alice_erc20_balance,
            erc20_amount,
            "Alice should have spent the correct amount of ERC20 tokens"
        );

        // Bob received erc20_amount tokens
        assert_eq!(
            bob_erc20_balance, erc20_amount,
            "Bob should have received the correct amount of ERC20 tokens"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_pay_erc20_and_collect_for_bundle() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // Set up tokens - alice gets ERC20, bob gets bundle tokens
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        let mock_erc20_b = MockERC20Permit::new(test.mock_addresses.erc20_b, &test.god_provider);
        let mock_erc721_a = MockERC721::new(test.mock_addresses.erc721_a, &test.god_provider);
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);

        // Give Alice ERC20 tokens
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // Give Bob bundle tokens
        mock_erc20_b
            .transfer(test.bob.address(), U256::from(50))
            .send()
            .await?
            .get_receipt()
            .await?;

        mock_erc721_a
            .mint(test.bob.address())
            .send()
            .await?
            .get_receipt()
            .await?;

        let erc1155_token_id = U256::from(1);
        let erc1155_amount = U256::from(20);
        mock_erc1155_a
            .mint(test.bob.address(), erc1155_token_id, erc1155_amount)
            .send()
            .await?
            .get_receipt()
            .await?;

        // Create test data
        let erc20_amount: U256 = U256::from(50);
        let bob_erc20_amount: U256 = U256::from(25); // Half of Bob's tokens
        let erc721_token_id: U256 = U256::from(1);
        let erc1155_bundle_amount = U256::from(10); // Half of Bob's tokens
        let expiration = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 3600; // 1 hour

        // Create token bundle
        let bundle = TokenBundleData {
            erc20s: vec![Erc20Data {
                address: test.mock_addresses.erc20_b,
                value: bob_erc20_amount,
            }],
            erc721s: vec![Erc721Data {
                address: test.mock_addresses.erc721_a,
                id: erc721_token_id,
            }],
            erc1155s: vec![Erc1155Data {
                address: test.mock_addresses.erc1155_a,
                id: erc1155_token_id,
                value: erc1155_bundle_amount,
            }],
            native_amount: U256::ZERO,
        };

        // Bob approves his tokens for the bundle escrow
        test.bob_client
            .token_bundle()
            .approve(&bundle, ApprovalPurpose::Escrow)
            .await?;

        // Bob creates bundle escrow demanding ERC20 from Alice
        // First encode the payment obligation data as the demand
        let payment_obligation_data = ERC20PaymentObligation::ObligationData {
            token: test.mock_addresses.erc20_a,
            amount: erc20_amount,
            payee: test.bob.address(),
        };

        // Create the bundle escrow with demand for ERC20 payment
        let buy_receipt = test
            .bob_client
            .token_bundle()
            .escrow()
            .default()
            .create(
                &bundle,
                &ArbiterData {
                    arbiter: test.addresses.erc20_addresses.payment_obligation,
                    demand: payment_obligation_data.into(),
                },
                expiration as u64,
            )
            .await?;

        let buy_attestation = DefaultAlkahestClient::get_attested_event(buy_receipt)?.uid;

        // Check balances before the exchange
        let initial_alice_erc20_balance =
            mock_erc20_a.balanceOf(test.alice.address()).call().await?;
        let initial_alice_bob_erc20_balance =
            mock_erc20_b.balanceOf(test.alice.address()).call().await?;
        let initial_alice_erc1155_balance = mock_erc1155_a
            .balanceOf(test.alice.address(), erc1155_token_id)
            .call()
            .await?;

        // Alice approves her ERC20 tokens for atomic payment
        test.alice_client
            .erc20()
            .approve(
                &Erc20Data {
                    address: test.mock_addresses.erc20_a,
                    value: erc20_amount,
                },
                ApprovalPurpose::AtomicPayment,
            )
            .await?;

        // Alice fulfills Bob's bundle escrow
        let pay_receipt = test
            .alice_client
            .erc20()
            .payment()
            .pay_erc20_and_collect(buy_attestation)
            .await?;

        // Verify the payment attestation was created
        let pay_attestation = DefaultAlkahestClient::get_attested_event(pay_receipt)?;
        assert_ne!(pay_attestation.uid, FixedBytes::<32>::default());

        // Verify token transfers
        // 1. Alice should now own ERC721
        let final_erc721_owner = mock_erc721_a.ownerOf(erc721_token_id).call().await?;
        assert_eq!(
            final_erc721_owner,
            test.alice.address(),
            "Alice should now own the ERC721 token"
        );

        // 2. Alice should have received Bob's ERC20
        let final_alice_bob_erc20_balance =
            mock_erc20_b.balanceOf(test.alice.address()).call().await?;
        assert_eq!(
            final_alice_bob_erc20_balance - initial_alice_bob_erc20_balance,
            bob_erc20_amount,
            "Alice should have received Bob's ERC20 tokens"
        );

        // 3. Alice should have received Bob's ERC1155
        let final_alice_erc1155_balance = mock_erc1155_a
            .balanceOf(test.alice.address(), erc1155_token_id)
            .call()
            .await?;
        assert_eq!(
            final_alice_erc1155_balance - initial_alice_erc1155_balance,
            erc1155_bundle_amount,
            "Alice should have received Bob's ERC1155 tokens"
        );

        // 4. Alice should have spent her ERC20
        let final_alice_erc20_balance = mock_erc20_a.balanceOf(test.alice.address()).call().await?;
        assert_eq!(
            initial_alice_erc20_balance - final_alice_erc20_balance,
            erc20_amount,
            "Alice should have spent the correct amount of ERC20 tokens"
        );

        // 5. Bob should have received Alice's ERC20
        let bob_erc20_balance = mock_erc20_a.balanceOf(test.bob.address()).call().await?;
        assert_eq!(
            bob_erc20_balance, erc20_amount,
            "Bob should have received Alice's ERC20 tokens"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_permit_and_pay_erc20_and_collect_for_bundle() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // Set up tokens - alice gets ERC20, bob gets bundle tokens
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        let mock_erc20_b = MockERC20Permit::new(test.mock_addresses.erc20_b, &test.god_provider);
        let mock_erc721_a = MockERC721::new(test.mock_addresses.erc721_a, &test.god_provider);
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);

        // Give Alice ERC20 tokens
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // Give Bob bundle tokens
        mock_erc20_b
            .transfer(test.bob.address(), U256::from(50))
            .send()
            .await?
            .get_receipt()
            .await?;

        mock_erc721_a
            .mint(test.bob.address())
            .send()
            .await?
            .get_receipt()
            .await?;

        let erc1155_token_id = U256::from(1);
        let erc1155_amount = U256::from(20);
        mock_erc1155_a
            .mint(test.bob.address(), erc1155_token_id, erc1155_amount)
            .send()
            .await?
            .get_receipt()
            .await?;

        // Create test data
        let erc20_amount: U256 = U256::from(50);
        let bob_erc20_amount: U256 = U256::from(25); // Half of Bob's tokens
        let erc721_token_id: U256 = U256::from(1);
        let erc1155_bundle_amount = U256::from(10); // Half of Bob's tokens
        let expiration = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 3600; // 1 hour

        // Create token bundle
        let bundle = TokenBundleData {
            erc20s: vec![Erc20Data {
                address: test.mock_addresses.erc20_b,
                value: bob_erc20_amount,
            }],
            erc721s: vec![Erc721Data {
                address: test.mock_addresses.erc721_a,
                id: erc721_token_id,
            }],
            erc1155s: vec![Erc1155Data {
                address: test.mock_addresses.erc1155_a,
                id: erc1155_token_id,
                value: erc1155_bundle_amount,
            }],
            native_amount: U256::ZERO,
        };

        // Bob approves his tokens for the bundle escrow
        test.bob_client
            .token_bundle()
            .approve(&bundle, ApprovalPurpose::Escrow)
            .await?;

        // Bob creates bundle escrow demanding ERC20 from Alice
        // First encode the payment obligation data as the demand
        let payment_obligation_data = ERC20PaymentObligation::ObligationData {
            token: test.mock_addresses.erc20_a,
            amount: erc20_amount,
            payee: test.bob.address(),
        };

        // Create the bundle escrow with demand for ERC20 payment
        let buy_receipt = test
            .bob_client
            .token_bundle()
            .escrow()
            .default()
            .create(
                &bundle,
                &ArbiterData {
                    arbiter: test.addresses.erc20_addresses.payment_obligation,
                    demand: payment_obligation_data.into(),
                },
                expiration as u64,
            )
            .await?;

        let buy_attestation = DefaultAlkahestClient::get_attested_event(buy_receipt)?.uid;

        // Check balances before the exchange
        let initial_alice_erc20_balance =
            mock_erc20_a.balanceOf(test.alice.address()).call().await?;
        let initial_alice_bob_erc20_balance =
            mock_erc20_b.balanceOf(test.alice.address()).call().await?;
        let initial_alice_erc1155_balance = mock_erc1155_a
            .balanceOf(test.alice.address(), erc1155_token_id)
            .call()
            .await?;

        // Alice fulfills Bob's bundle escrow using permit
        let pay_receipt = test
            .alice_client
            .erc20()
            .payment()
            .permit_and_pay_erc20_and_collect(buy_attestation)
            .await?;

        // Verify the payment attestation was created
        let pay_attestation = DefaultAlkahestClient::get_attested_event(pay_receipt)?;
        assert_ne!(pay_attestation.uid, FixedBytes::<32>::default());

        // Verify token transfers
        // 1. Alice should now own ERC721
        let final_erc721_owner = mock_erc721_a.ownerOf(erc721_token_id).call().await?;
        assert_eq!(
            final_erc721_owner,
            test.alice.address(),
            "Alice should now own the ERC721 token"
        );

        // 2. Alice should have received Bob's ERC20
        let final_alice_bob_erc20_balance =
            mock_erc20_b.balanceOf(test.alice.address()).call().await?;
        assert_eq!(
            final_alice_bob_erc20_balance - initial_alice_bob_erc20_balance,
            bob_erc20_amount,
            "Alice should have received Bob's ERC20 tokens"
        );

        // 3. Alice should have received Bob's ERC1155
        let final_alice_erc1155_balance = mock_erc1155_a
            .balanceOf(test.alice.address(), erc1155_token_id)
            .call()
            .await?;
        assert_eq!(
            final_alice_erc1155_balance - initial_alice_erc1155_balance,
            erc1155_bundle_amount,
            "Alice should have received Bob's ERC1155 tokens"
        );

        // 4. Alice should have spent her ERC20
        let final_alice_erc20_balance = mock_erc20_a.balanceOf(test.alice.address()).call().await?;
        assert_eq!(
            initial_alice_erc20_balance - final_alice_erc20_balance,
            erc20_amount,
            "Alice should have spent the correct amount of ERC20 tokens"
        );

        // 5. Bob should have received Alice's ERC20
        let bob_erc20_balance = mock_erc20_a.balanceOf(test.bob.address()).call().await?;
        assert_eq!(
            bob_erc20_balance, erc20_amount,
            "Bob should have received Alice's ERC20 tokens"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_approve_and_pay_with_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // give alice some erc20 tokens
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        let price = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(100),
        };

        // alice makes direct payment to bob using approve_and_pay (no pre-approval needed)
        let (approval_receipt, payment_receipt) = test
            .alice_client
            .erc20()
            .payment()
            .approve_and_pay(&price, test.bob.address())
            .await?;

        // Verify both receipts are valid
        assert!(approval_receipt.status(), "Approval should succeed");
        assert!(payment_receipt.status(), "Payment should succeed");

        // Verify payment happened
        let alice_balance = mock_erc20_a.balanceOf(test.alice.address()).call().await?;
        let bob_balance = mock_erc20_a.balanceOf(test.bob.address()).call().await?;

        // all tokens paid to bob
        assert_eq!(alice_balance, U256::from(0));
        assert_eq!(bob_balance, U256::from(100));

        // payment obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(payment_receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_approve_and_create_escrow_with_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // give alice some erc20 tokens
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20_a
            .transfer(test.alice.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        let price = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(100),
        };

        // Create custom arbiter data
        let arbiter = test.addresses.erc20_addresses.clone().payment_obligation;
        let demand = Bytes::from(b"custom demand data");
        let item = ArbiterData { arbiter, demand };

        // alice creates escrow using approve_and_create (no pre-approval needed)
        let (approval_receipt, escrow_receipt) = test
            .alice_client
            .erc20()
            .escrow()
            .default()
            .approve_and_create(&price, &item, 0)
            .await?;

        // Verify both receipts are valid
        assert!(approval_receipt.status(), "Approval should succeed");
        assert!(escrow_receipt.status(), "Escrow creation should succeed");

        // Verify escrow happened
        let alice_balance = mock_erc20_a.balanceOf(test.alice.address()).call().await?;
        let escrow_balance = mock_erc20_a
            .balanceOf(test.addresses.erc20_addresses.escrow_obligation_default)
            .call()
            .await?;

        // all tokens in escrow
        assert_eq!(alice_balance, U256::from(0));
        assert_eq!(escrow_balance, U256::from(100));

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(escrow_receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }
}
