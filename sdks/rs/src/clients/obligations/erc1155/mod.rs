//! ERC1155 obligations module
//!
//! This module provides functionality for ERC1155 token operations including:
//! - Escrow obligations (unconditional and default)
//! - Payment obligations
//! - Utility functions for approvals

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
use crate::types::{ApprovalPurpose, ProviderContext, SharedWalletProvider};

// --- ABI conversions for ERC1155 obligation types ---
impl_abi_conversions!(contracts::obligations::ERC1155PaymentObligation::ObligationData);
impl_abi_conversions!(
    contracts::obligations::escrow::default_escrow::ERC1155EscrowObligation::ObligationData
);
impl_abi_conversions!(contracts::obligations::escrow::unconditional::UnconditionalERC1155EscrowObligation::ObligationData);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Erc1155Addresses {
    pub eas: Address,
    pub atomic_payment_utils: Address,
    pub escrow_obligation_default: Address,
    pub escrow_obligation_unconditional: Address,
    pub payment_obligation: Address,
}

impl Default for Erc1155Addresses {
    fn default() -> Self {
        BASE_SEPOLIA_ADDRESSES.erc1155_addresses
    }
}

/// Available contracts in the ERC1155 module
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Erc1155Contract {
    /// EAS (Ethereum Attestation Service) contract
    Eas,
    /// Atomic payment utilities contract for ERC1155 tokens
    AtomicPaymentUtils,
    /// Escrow obligation contract for ERC1155 tokens
    EscrowObligation,
    /// Payment obligation contract for ERC1155 tokens
    PaymentObligation,
}

/// Client for interacting with ERC1155 token trading and escrow functionality.
///
/// This client provides methods for:
/// - Trading ERC1155 tokens for other ERC1155, ERC20, and ERC721 tokens
/// - Creating escrow arrangements with custom demands
/// - Managing token approvals
/// - Collecting payments from fulfilled trades
#[derive(Clone)]
pub struct Erc1155Module {
    pub(crate) signer: PrivateKeySigner,
    pub(crate) wallet_provider: SharedWalletProvider,
    pub(crate) packaged_escrow_obligations: Vec<Address>,
    pub addresses: Erc1155Addresses,
}

impl ContractModule for Erc1155Module {
    type Contract = Erc1155Contract;

    fn address(&self, contract: Self::Contract) -> Address {
        match contract {
            Erc1155Contract::Eas => self.addresses.eas,
            Erc1155Contract::AtomicPaymentUtils => self.addresses.atomic_payment_utils,
            Erc1155Contract::EscrowObligation => self.addresses.escrow_obligation_default,
            Erc1155Contract::PaymentObligation => self.addresses.payment_obligation,
        }
    }
}

impl Erc1155Module {
    /// Creates a new Erc1155Module instance.
    pub fn new(
        signer: PrivateKeySigner,
        wallet_provider: SharedWalletProvider,
        addresses: Option<Erc1155Addresses>,
    ) -> eyre::Result<Self> {
        let addresses = addresses.unwrap_or_default();
        let packaged_escrow_obligations = vec![
            addresses.escrow_obligation_default,
            addresses.escrow_obligation_unconditional,
        ];
        Ok(Erc1155Module {
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
    /// client.erc1155().escrow().default().create(&price, &item, expiration).await?;
    ///
    /// // Unconditional escrow (1:many escrow:fulfillment)
    /// client.erc1155().escrow().unconditional().create(&price, &item, expiration).await?;
    /// ```
    pub fn escrow(&self) -> escrow::Escrow<'_> {
        escrow::Escrow::new(self)
    }

    /// Access payment API
    ///
    /// # Example
    /// ```rust,ignore
    /// client.erc1155().payment().pay(&price, payee).await?;
    /// ```
    pub fn payment(&self) -> payment::Payment<'_> {
        payment::Payment::new(self)
    }

    /// Access utility API (approvals)
    ///
    /// # Example
    /// ```rust,ignore
    /// client.erc1155().util().approve_all(token_contract, ApprovalPurpose::Payment).await?;
    /// client.erc1155().util().revoke_all(token_contract, ApprovalPurpose::Escrow).await?;
    /// ```
    pub fn util(&self) -> util::Util<'_> {
        util::Util::new(self)
    }

    /// Approves all tokens from a contract for trading.
    pub async fn approve_all(
        &self,
        token_contract: Address,
        purpose: ApprovalPurpose,
    ) -> eyre::Result<alloy::rpc::types::TransactionReceipt> {
        self.util().approve_all(token_contract, purpose).await
    }

    /// Revokes approval for all tokens from a contract.
    pub async fn revoke_all(
        &self,
        token_contract: Address,
        purpose: ApprovalPurpose,
    ) -> eyre::Result<alloy::rpc::types::TransactionReceipt> {
        self.util().revoke_all(token_contract, purpose).await
    }
}

impl AlkahestExtension for Erc1155Module {
    type Config = Erc1155Addresses;

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
        sol_types::SolValue as _,
    };

    use crate::{
        DefaultAlkahestClient,
        contracts::obligations::{
            ERC20PaymentObligation, ERC721PaymentObligation, ERC1155PaymentObligation,
            TokenBundlePaymentObligation,
        },
        extensions::{HasErc20, HasErc721, HasErc1155, HasTokenBundle},
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
        let token_address = test.mock_addresses.erc1155_a;
        let id: U256 = U256::from(1);
        let amount: U256 = U256::from(10);
        let arbiter = test.addresses.erc1155_addresses.payment_obligation;
        let demand = Bytes::from(vec![1, 2, 3, 4]); // sample demand data

        let escrow_data = crate::contracts::obligations::escrow::default_escrow::ERC1155EscrowObligation::ObligationData {
            token: token_address,
            tokenId: id,
            amount,
            arbiter,
            demand: demand.clone(),
        };

        // Encode the data
        let encoded = escrow_data.abi_encode();

        // Decode the data using TryFrom<Bytes>
        let decoded: crate::contracts::obligations::escrow::default_escrow::ERC1155EscrowObligation::ObligationData =
            alloy::primitives::Bytes::from(encoded).try_into()?;

        // Verify decoded data
        assert_eq!(decoded.token, token_address, "Token address should match");
        assert_eq!(decoded.tokenId, id, "ID should match");
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
        let token_address = test.mock_addresses.erc1155_a;
        let id: U256 = U256::from(1);
        let amount: U256 = U256::from(10);
        let payee = test.alice.address();

        let payment_data =
            crate::contracts::obligations::ERC1155PaymentObligation::ObligationData {
                token: token_address,
                tokenId: id,
                amount,
                payee,
            };

        // Encode the data
        let encoded = payment_data.abi_encode();

        // Decode the data using TryFrom<Bytes>
        let decoded: crate::contracts::obligations::ERC1155PaymentObligation::ObligationData =
            alloy::primitives::Bytes::from(encoded).try_into()?;

        // Verify decoded data
        assert_eq!(decoded.token, token_address, "Token address should match");
        assert_eq!(decoded.tokenId, id, "ID should match");
        assert_eq!(decoded.amount, amount, "Amount should match");
        assert_eq!(decoded.payee, payee, "Payee should match");

        Ok(())
    }

    #[tokio::test]
    async fn test_approve_all() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // mint ERC1155 tokens to alice
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);
        mock_erc1155_a
            .mint(test.alice.address(), U256::from(1), U256::from(10))
            .send()
            .await?
            .get_receipt()
            .await?;

        // Test approve_all for payment
        let _receipt = test
            .alice_client
            .erc1155()
            .approve_all(test.mock_addresses.erc1155_a, ApprovalPurpose::Payment)
            .await?;

        // Verify approval for payment obligation
        let payment_approved = mock_erc1155_a
            .isApprovedForAll(
                test.alice.address(),
                test.addresses.erc1155_addresses.clone().payment_obligation,
            )
            .call()
            .await?;

        assert!(
            payment_approved,
            "Payment approval for all should be set correctly"
        );

        // Test approve_all for escrow
        let _receipt = test
            .alice_client
            .erc1155()
            .approve_all(test.mock_addresses.erc1155_a, ApprovalPurpose::Escrow)
            .await?;

        // Verify approval for escrow obligation
        let escrow_approved = mock_erc1155_a
            .isApprovedForAll(
                test.alice.address(),
                test.addresses.erc1155_addresses.escrow_obligation_default,
            )
            .call()
            .await?;

        assert!(
            escrow_approved,
            "Escrow approval for all should be set correctly"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_revoke_all() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // mint ERC1155 tokens to alice
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);
        mock_erc1155_a
            .mint(test.alice.address(), U256::from(1), U256::from(10))
            .send()
            .await?
            .get_receipt()
            .await?;

        // First approve all
        test.alice_client
            .erc1155()
            .approve_all(test.mock_addresses.erc1155_a, ApprovalPurpose::Payment)
            .await?;

        // Then revoke all
        let _receipt = test
            .alice_client
            .erc1155()
            .revoke_all(test.mock_addresses.erc1155_a, ApprovalPurpose::Payment)
            .await?;

        // Verify revocation
        let payment_approved = mock_erc1155_a
            .isApprovedForAll(
                test.alice.address(),
                test.addresses.erc1155_addresses.clone().payment_obligation,
            )
            .call()
            .await?;

        assert!(!payment_approved, "Payment approval should be revoked");

        Ok(())
    }

    #[tokio::test]
    async fn test_buy_with_erc1155() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // mint ERC1155 tokens to alice
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);
        mock_erc1155_a
            .mint(test.alice.address(), U256::from(1), U256::from(10))
            .send()
            .await?
            .get_receipt()
            .await?;

        let price = Erc1155Data {
            address: test.mock_addresses.erc1155_a,
            id: U256::from(1),
            value: U256::from(5),
        };

        // Create custom arbiter data
        let arbiter = test.addresses.erc1155_addresses.clone().payment_obligation;
        let demand = Bytes::from(b"custom demand data");
        let item = ArbiterData { arbiter, demand };

        // approve tokens for escrow
        test.alice_client
            .erc1155()
            .approve_all(test.mock_addresses.erc1155_a, ApprovalPurpose::Escrow)
            .await?;

        // alice creates escrow with custom demand
        let receipt = test
            .alice_client
            .erc1155()
            .escrow()
            .default()
            .create(&price, &item, 0)
            .await?;

        // Verify escrow happened - check alice's balance decreased
        let alice_balance = mock_erc1155_a
            .balanceOf(test.alice.address(), U256::from(1))
            .call()
            .await?;

        // Check escrow contract's balance increased
        let escrow_balance = mock_erc1155_a
            .balanceOf(
                test.addresses.erc1155_addresses.escrow_obligation_default,
                U256::from(1),
            )
            .call()
            .await?;

        // token in escrow
        assert_eq!(
            alice_balance,
            U256::from(5),
            "Alice should have 5 tokens remaining"
        );
        assert_eq!(escrow_balance, U256::from(5), "Escrow should have 5 tokens");

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_pay_with_erc1155() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // mint ERC1155 tokens to alice
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);
        mock_erc1155_a
            .mint(test.alice.address(), U256::from(1), U256::from(10))
            .send()
            .await?
            .get_receipt()
            .await?;

        let price = Erc1155Data {
            address: test.mock_addresses.erc1155_a,
            id: U256::from(1),
            value: U256::from(5),
        };

        // approve tokens for payment
        test.alice_client
            .erc1155()
            .approve_all(test.mock_addresses.erc1155_a, ApprovalPurpose::Payment)
            .await?;

        // Check initial balances
        let initial_bob_balance = mock_erc1155_a
            .balanceOf(test.bob.address(), U256::from(1))
            .call()
            .await?;

        // alice makes direct payment to bob
        let receipt = test
            .alice_client
            .erc1155()
            .payment()
            .pay(&price, test.bob.address())
            .await?;

        // Verify payment happened
        let final_bob_balance = mock_erc1155_a
            .balanceOf(test.bob.address(), U256::from(1))
            .call()
            .await?;

        // tokens paid to bob
        assert_eq!(
            final_bob_balance - initial_bob_balance,
            U256::from(5),
            "Bob should have received 5 tokens"
        );

        // payment obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_buy_erc1155_for_erc1155() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // mint ERC1155 tokens to alice
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);
        mock_erc1155_a
            .mint(test.alice.address(), U256::from(1), U256::from(10))
            .send()
            .await?
            .get_receipt()
            .await?;

        // begin test
        let bid = Erc1155Data {
            address: test.mock_addresses.erc1155_a,
            id: U256::from(1),
            value: U256::from(5),
        };
        let ask = Erc1155Data {
            address: test.mock_addresses.erc1155_b,
            id: U256::from(2),
            value: U256::from(3),
        };

        // alice approves token for escrow
        test.alice_client
            .erc1155()
            .approve_all(test.mock_addresses.erc1155_a, ApprovalPurpose::Escrow)
            .await?;

        // alice makes escrow
        let receipt = test
            .alice_client
            .erc1155()
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

        // verify escrow
        let escrow_balance = mock_erc1155_a
            .balanceOf(
                test.addresses.erc1155_addresses.escrow_obligation_default,
                U256::from(1),
            )
            .call()
            .await?;

        assert_eq!(
            escrow_balance,
            U256::from(5),
            "5 tokens should be in escrow"
        );

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_pay_erc1155_and_collect_for_erc1155() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // mint ERC1155 tokens to alice and bob
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);
        mock_erc1155_a
            .mint(test.alice.address(), U256::from(1), U256::from(10))
            .send()
            .await?
            .get_receipt()
            .await?;

        let mock_erc1155_b = MockERC1155::new(test.mock_addresses.erc1155_b, &test.god_provider);
        mock_erc1155_b
            .mint(test.bob.address(), U256::from(2), U256::from(10))
            .send()
            .await?
            .get_receipt()
            .await?;

        // begin test
        let bid = Erc1155Data {
            address: test.mock_addresses.erc1155_a,
            id: U256::from(1),
            value: U256::from(5),
        };
        let ask = Erc1155Data {
            address: test.mock_addresses.erc1155_b,
            id: U256::from(2),
            value: U256::from(3),
        };

        // alice approves token for escrow and creates buy attestation
        test.alice_client
            .erc1155()
            .approve_all(test.mock_addresses.erc1155_a, ApprovalPurpose::Escrow)
            .await?;

        let buy_receipt = test
            .alice_client
            .erc1155()
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

        let buy_attestation = DefaultAlkahestClient::get_attested_event(buy_receipt)?.uid;

        // bob approves token for atomic payment
        test.bob_client
            .erc1155()
            .approve_all(
                test.mock_addresses.erc1155_b,
                ApprovalPurpose::AtomicPayment,
            )
            .await?;

        // Check initial balances
        let initial_alice_balance_b = mock_erc1155_b
            .balanceOf(test.alice.address(), U256::from(2))
            .call()
            .await?;
        let initial_bob_balance_a = mock_erc1155_a
            .balanceOf(test.bob.address(), U256::from(1))
            .call()
            .await?;

        // bob fulfills the buy attestation
        let _sell_receipt = test
            .bob_client
            .erc1155()
            .payment()
            .pay_erc1155_and_collect(buy_attestation)
            .await?;

        // verify token transfers
        let final_alice_balance_b = mock_erc1155_b
            .balanceOf(test.alice.address(), U256::from(2))
            .call()
            .await?;
        let final_bob_balance_a = mock_erc1155_a
            .balanceOf(test.bob.address(), U256::from(1))
            .call()
            .await?;

        // both sides received the tokens
        assert_eq!(
            final_alice_balance_b - initial_alice_balance_b,
            U256::from(3),
            "Alice should have received 3 tokens B"
        );
        assert_eq!(
            final_bob_balance_a - initial_bob_balance_a,
            U256::from(5),
            "Bob should have received 5 tokens A"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_collect_expired() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // mint ERC1155 tokens to alice
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);
        mock_erc1155_a
            .mint(test.alice.address(), U256::from(1), U256::from(10))
            .send()
            .await?
            .get_receipt()
            .await?;

        // begin test
        let bid = Erc1155Data {
            address: test.mock_addresses.erc1155_a,
            id: U256::from(1),
            value: U256::from(5),
        };
        let ask = Erc1155Data {
            address: test.mock_addresses.erc1155_b,
            id: U256::from(2),
            value: U256::from(3),
        };

        // alice approves token for escrow
        test.alice_client
            .erc1155()
            .approve_all(test.mock_addresses.erc1155_a, ApprovalPurpose::Escrow)
            .await?;

        // Check initial balance
        let initial_alice_balance = mock_erc1155_a
            .balanceOf(test.alice.address(), U256::from(1))
            .call()
            .await?;

        // alice makes escrow with a short expiration
        let expiration = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 10;
        let receipt = test
            .alice_client
            .erc1155()
            .escrow()
            .default()
            .create(
                &bid,
                &erc1155_payment_demand(
                    &ask,
                    test.alice.address(),
                    test.addresses.erc1155_addresses.payment_obligation,
                ),
                expiration as u64 + 1,
            )
            .await?;

        let buy_attestation = DefaultAlkahestClient::get_attested_event(receipt)?.uid;

        // Wait for expiration
        test.god_provider.anvil_increase_time(20).await?;

        // alice collects expired funds
        let _collect_receipt = test
            .alice_client
            .erc1155()
            .escrow()
            .default()
            .reclaim_expired(buy_attestation)
            .await?;

        // verify tokens returned to alice
        let final_alice_balance = mock_erc1155_a
            .balanceOf(test.alice.address(), U256::from(1))
            .call()
            .await?;

        assert_eq!(
            final_alice_balance, initial_alice_balance,
            "All tokens should be returned to Alice"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_buy_erc20_with_erc1155() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // mint ERC1155 tokens to alice
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);
        mock_erc1155_a
            .mint(test.alice.address(), U256::from(1), U256::from(10))
            .send()
            .await?
            .get_receipt()
            .await?;

        // Create exchange information
        let bid = Erc1155Data {
            address: test.mock_addresses.erc1155_a,
            id: U256::from(1),
            value: U256::from(5),
        };
        let ask = Erc20Data {
            address: test.mock_addresses.erc20_a,
            value: U256::from(100),
        };

        // alice approves token for escrow
        test.alice_client
            .erc1155()
            .approve_all(test.mock_addresses.erc1155_a, ApprovalPurpose::Escrow)
            .await?;

        // alice creates purchase offer
        let receipt = test
            .alice_client
            .erc1155()
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

        // Verify escrow happened
        let escrow_balance = mock_erc1155_a
            .balanceOf(
                test.addresses.erc1155_addresses.escrow_obligation_default,
                U256::from(1),
            )
            .call()
            .await?;

        assert_eq!(
            escrow_balance,
            U256::from(5),
            "5 tokens should be in escrow"
        );

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_buy_erc721_with_erc1155() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // mint ERC1155 tokens to alice
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);
        mock_erc1155_a
            .mint(test.alice.address(), U256::from(1), U256::from(10))
            .send()
            .await?
            .get_receipt()
            .await?;

        // Create exchange information
        let bid = Erc1155Data {
            address: test.mock_addresses.erc1155_a,
            id: U256::from(1),
            value: U256::from(5),
        };
        let ask = Erc721Data {
            address: test.mock_addresses.erc721_a,
            id: U256::from(1),
        };

        // alice approves token for escrow
        test.alice_client
            .erc1155()
            .approve_all(test.mock_addresses.erc1155_a, ApprovalPurpose::Escrow)
            .await?;

        // alice creates purchase offer
        let receipt = test
            .alice_client
            .erc1155()
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
        let escrow_balance = mock_erc1155_a
            .balanceOf(
                test.addresses.erc1155_addresses.escrow_obligation_default,
                U256::from(1),
            )
            .call()
            .await?;

        assert_eq!(
            escrow_balance,
            U256::from(5),
            "5 tokens should be in escrow"
        );

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_buy_bundle_with_erc1155() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // mint ERC1155 tokens to alice
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);
        mock_erc1155_a
            .mint(test.alice.address(), U256::from(1), U256::from(10))
            .send()
            .await?
            .get_receipt()
            .await?;

        // Create exchange information
        let bid = Erc1155Data {
            address: test.mock_addresses.erc1155_a,
            id: U256::from(1),
            value: U256::from(5),
        };

        // Create bundle data
        let bundle = TokenBundleData {
            erc20s: vec![Erc20Data {
                address: test.mock_addresses.erc20_b,
                value: U256::from(20),
            }],
            erc721s: vec![Erc721Data {
                address: test.mock_addresses.erc721_b,
                id: U256::from(2),
            }],
            erc1155s: vec![Erc1155Data {
                address: test.mock_addresses.erc1155_b,
                id: U256::from(3),
                value: U256::from(4),
            }],
            native_amount: U256::ZERO,
        };

        // alice approves token for atomic payment
        test.alice_client
            .erc1155()
            .approve_all(test.mock_addresses.erc1155_a, ApprovalPurpose::Escrow)
            .await?;

        // alice creates purchase offer
        let receipt = test
            .alice_client
            .erc1155()
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
        let escrow_balance = mock_erc1155_a
            .balanceOf(
                test.addresses.erc1155_addresses.escrow_obligation_default,
                U256::from(1),
            )
            .call()
            .await?;

        assert_eq!(
            escrow_balance,
            U256::from(5),
            "5 tokens should be in escrow"
        );

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_pay_erc1155_and_collect_for_erc20() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // mint ERC1155 tokens to alice
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);
        mock_erc1155_a
            .mint(test.alice.address(), U256::from(1), U256::from(10))
            .send()
            .await?
            .get_receipt()
            .await?;

        // give bob some ERC20 tokens for escrow
        let mock_erc20_a = MockERC20Permit::new(test.mock_addresses.erc20_a, &test.god_provider);
        mock_erc20_a
            .transfer(test.bob.address(), U256::from(100))
            .send()
            .await?
            .get_receipt()
            .await?;

        // begin test
        let bid = Erc20Data {
            // bob's bid
            address: test.mock_addresses.erc20_a,
            value: U256::from(100),
        };
        let ask = Erc1155Data {
            // bob asks for alice's ERC1155
            address: test.mock_addresses.erc1155_a,
            id: U256::from(1),
            value: U256::from(5),
        };

        // bob approves tokens for atomic payment and creates buy attestation
        test.bob_client
            .erc20()
            .approve(&bid, ApprovalPurpose::Escrow)
            .await?;

        let buy_receipt = test
            .bob_client
            .erc20()
            .escrow()
            .default()
            .create(
                &bid,
                &erc1155_payment_demand(
                    &ask,
                    test.bob.address(),
                    test.addresses.erc1155_addresses.payment_obligation,
                ),
                0,
            )
            .await?;

        let buy_attestation = DefaultAlkahestClient::get_attested_event(buy_receipt)?.uid;

        // alice approves her ERC1155 tokens for atomic payment
        test.alice_client
            .erc1155()
            .approve_all(
                test.mock_addresses.erc1155_a,
                ApprovalPurpose::AtomicPayment,
            )
            .await?;

        // Check initial balances
        let initial_alice_erc20_balance =
            mock_erc20_a.balanceOf(test.alice.address()).call().await?;

        let initial_bob_erc1155_balance = mock_erc1155_a
            .balanceOf(test.bob.address(), U256::from(1))
            .call()
            .await?;

        // alice fulfills bob's buy attestation with her ERC1155
        let _sell_receipt = test
            .alice_client
            .erc1155()
            .payment()
            .pay_erc1155_and_collect(buy_attestation)
            .await?;

        // verify token transfers
        let final_alice_erc20_balance = mock_erc20_a.balanceOf(test.alice.address()).call().await?;

        let final_bob_erc1155_balance = mock_erc1155_a
            .balanceOf(test.bob.address(), U256::from(1))
            .call()
            .await?;

        // both sides received the tokens
        assert_eq!(
            final_alice_erc20_balance - initial_alice_erc20_balance,
            U256::from(100),
            "Alice should have received ERC20 tokens"
        );
        assert_eq!(
            final_bob_erc1155_balance - initial_bob_erc1155_balance,
            U256::from(5),
            "Bob should have received the ERC1155 tokens"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_pay_erc1155_and_collect_for_erc721() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // mint ERC1155 tokens to alice
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);
        mock_erc1155_a
            .mint(test.alice.address(), U256::from(1), U256::from(10))
            .send()
            .await?
            .get_receipt()
            .await?;

        // mint an ERC721 token to bob
        let mock_erc721_a = MockERC721::new(test.mock_addresses.erc721_a, &test.god_provider);
        mock_erc721_a
            .mint(test.bob.address())
            .send()
            .await?
            .get_receipt()
            .await?;

        // begin test
        let bid = Erc721Data {
            // bob's bid
            address: test.mock_addresses.erc721_a,
            id: U256::from(1),
        };
        let ask = Erc1155Data {
            // bob asks for alice's ERC1155
            address: test.mock_addresses.erc1155_a,
            id: U256::from(1),
            value: U256::from(5),
        };

        // bob approves tokens for atomic payment and creates buy attestation
        test.bob_client
            .erc721()
            .approve(&bid, ApprovalPurpose::Escrow)
            .await?;

        let buy_receipt = test
            .bob_client
            .erc721()
            .escrow()
            .default()
            .create(
                &bid,
                &erc1155_payment_demand(
                    &ask,
                    test.bob.address(),
                    test.addresses.erc1155_addresses.payment_obligation,
                ),
                0,
            )
            .await?;

        let buy_attestation = DefaultAlkahestClient::get_attested_event(buy_receipt)?.uid;

        // alice approves her ERC1155 tokens for atomic payment
        test.alice_client
            .erc1155()
            .approve_all(
                test.mock_addresses.erc1155_a,
                ApprovalPurpose::AtomicPayment,
            )
            .await?;

        // Check initial ERC1155 balance for bob
        let initial_bob_erc1155_balance = mock_erc1155_a
            .balanceOf(test.bob.address(), U256::from(1))
            .call()
            .await?;

        // alice fulfills bob's buy attestation with her ERC1155
        let _sell_receipt = test
            .alice_client
            .erc1155()
            .payment()
            .pay_erc1155_and_collect(buy_attestation)
            .await?;

        // verify token transfers
        let alice_now_owns_erc721 = mock_erc721_a.ownerOf(U256::from(1)).call().await?;
        let final_bob_erc1155_balance = mock_erc1155_a
            .balanceOf(test.bob.address(), U256::from(1))
            .call()
            .await?;

        // both sides received the tokens
        assert_eq!(
            alice_now_owns_erc721,
            test.alice.address(),
            "Alice should have received the ERC721 token"
        );
        assert_eq!(
            final_bob_erc1155_balance - initial_bob_erc1155_balance,
            U256::from(5),
            "Bob should have received the ERC1155 tokens"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_pay_erc1155_and_collect_for_bundle() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // mint ERC1155 tokens to alice (she will fulfill with these)
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);
        mock_erc1155_a
            .mint(test.alice.address(), U256::from(1), U256::from(10))
            .send()
            .await?
            .get_receipt()
            .await?;

        // give bob tokens for the bundle (he will escrow these)
        // ERC20
        let mock_erc20_b = MockERC20Permit::new(test.mock_addresses.erc20_b, &test.god_provider);
        mock_erc20_b
            .transfer(test.bob.address(), U256::from(20))
            .send()
            .await?
            .get_receipt()
            .await?;

        // ERC721
        let mock_erc721_b = MockERC721::new(test.mock_addresses.erc721_b, &test.god_provider);
        mock_erc721_b
            .mint(test.bob.address())
            .send()
            .await?
            .get_receipt()
            .await?;

        // ERC1155
        let mock_erc1155_b = MockERC1155::new(test.mock_addresses.erc1155_b, &test.god_provider);
        mock_erc1155_b
            .mint(test.bob.address(), U256::from(3), U256::from(4))
            .send()
            .await?
            .get_receipt()
            .await?;

        // begin test
        // Check balances before the exchange
        let initial_alice_erc20_balance =
            mock_erc20_b.balanceOf(test.alice.address()).call().await?;
        let initial_alice_erc1155b_balance = mock_erc1155_b
            .balanceOf(test.alice.address(), U256::from(3))
            .call()
            .await?;
        let initial_bob_erc1155a_balance = mock_erc1155_a
            .balanceOf(test.bob.address(), U256::from(1))
            .call()
            .await?;

        // Bob's bundle that he'll escrow
        let bundle = TokenBundleData {
            erc20s: vec![Erc20Data {
                address: test.mock_addresses.erc20_b,
                value: U256::from(20),
            }],
            erc721s: vec![Erc721Data {
                address: test.mock_addresses.erc721_b,
                id: U256::from(1),
            }],
            erc1155s: vec![Erc1155Data {
                address: test.mock_addresses.erc1155_b,
                id: U256::from(3),
                value: U256::from(4),
            }],
            native_amount: U256::ZERO,
        };

        // Create the ERC1155 payment obligation data as the demand
        let payment_obligation_data =
            crate::contracts::obligations::ERC1155PaymentObligation::ObligationData {
                token: test.mock_addresses.erc1155_a,
                tokenId: U256::from(1),
                amount: U256::from(5),
                payee: test.bob.address(),
            };

        // bob approves all tokens for the bundle escrow
        test.bob_client
            .token_bundle()
            .approve(&bundle, ApprovalPurpose::Escrow)
            .await?;

        // bob creates bundle escrow demanding ERC1155 from Alice
        let buy_receipt = test
            .bob_client
            .token_bundle()
            .escrow()
            .default()
            .create(
                &bundle,
                &ArbiterData {
                    arbiter: test.addresses.erc1155_addresses.payment_obligation,
                    demand: payment_obligation_data.into(),
                },
                0,
            )
            .await?;

        let buy_attestation = DefaultAlkahestClient::get_attested_event(buy_receipt)?.uid;

        // alice approves her ERC1155 for atomic payment
        test.alice_client
            .erc1155()
            .approve_all(
                test.mock_addresses.erc1155_a,
                ApprovalPurpose::AtomicPayment,
            )
            .await?;

        // alice fulfills bob's buy attestation with her ERC1155
        let pay_receipt = test
            .alice_client
            .erc1155()
            .payment()
            .pay_erc1155_and_collect(buy_attestation)
            .await?;

        // Verify the payment attestation was created
        let pay_attestation = DefaultAlkahestClient::get_attested_event(pay_receipt)?;
        assert_ne!(pay_attestation.uid, FixedBytes::<32>::default());

        // verify token transfers
        // Check alice received all tokens from the bundle
        let final_alice_erc20_balance = mock_erc20_b.balanceOf(test.alice.address()).call().await?;

        let alice_erc721_owner = mock_erc721_b.ownerOf(U256::from(1)).call().await?;

        let final_alice_erc1155b_balance = mock_erc1155_b
            .balanceOf(test.alice.address(), U256::from(3))
            .call()
            .await?;

        // Check bob received the ERC1155 tokens
        let final_bob_erc1155a_balance = mock_erc1155_a
            .balanceOf(test.bob.address(), U256::from(1))
            .call()
            .await?;

        // Verify alice received the bundle
        assert_eq!(
            final_alice_erc20_balance - initial_alice_erc20_balance,
            U256::from(20),
            "Alice should have received ERC20 tokens"
        );
        assert_eq!(
            alice_erc721_owner,
            test.alice.address(),
            "Alice should have received the ERC721 token from bundle"
        );
        assert_eq!(
            final_alice_erc1155b_balance - initial_alice_erc1155b_balance,
            U256::from(4),
            "Alice should have received ERC1155 tokens"
        );

        // Verify bob received the ERC1155
        assert_eq!(
            final_bob_erc1155a_balance - initial_bob_erc1155a_balance,
            U256::from(5),
            "Bob should have received the ERC1155 tokens"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_approve_and_pay_with_erc1155() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // mint ERC1155 tokens to alice
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);
        mock_erc1155_a
            .mint(test.alice.address(), U256::from(1), U256::from(10))
            .send()
            .await?
            .get_receipt()
            .await?;

        let price = Erc1155Data {
            address: test.mock_addresses.erc1155_a,
            id: U256::from(1),
            value: U256::from(5),
        };

        // Check initial approval state
        let initial_approval = mock_erc1155_a
            .isApprovedForAll(
                test.alice.address(),
                test.addresses.erc1155_addresses.clone().payment_obligation,
            )
            .call()
            .await?;

        assert!(!initial_approval, "Should not be approved initially");

        // Check initial balances
        let initial_bob_balance = mock_erc1155_a
            .balanceOf(test.bob.address(), U256::from(1))
            .call()
            .await?;

        // alice makes direct payment to bob using approve_and_pay (no pre-approval needed)
        let (approval_receipt, payment_receipt, revoke_receipt) = test
            .alice_client
            .erc1155()
            .payment()
            .approve_and_pay(&price, test.bob.address())
            .await?;

        // Verify all receipts are valid
        assert!(approval_receipt.status(), "Approval should succeed");
        assert!(payment_receipt.status(), "Payment should succeed");
        assert!(revoke_receipt.status(), "Revoke should succeed");

        // Verify payment happened
        let final_bob_balance = mock_erc1155_a
            .balanceOf(test.bob.address(), U256::from(1))
            .call()
            .await?;

        assert_eq!(
            final_bob_balance - initial_bob_balance,
            U256::from(5),
            "Bob should have received 5 tokens"
        );

        // Verify approval was revoked after payment
        let final_approval = mock_erc1155_a
            .isApprovedForAll(
                test.alice.address(),
                test.addresses.erc1155_addresses.clone().payment_obligation,
            )
            .call()
            .await?;

        assert!(!final_approval, "Approval should be revoked after payment");

        // payment obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(payment_receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }

    #[tokio::test]
    async fn test_approve_and_create_escrow_with_erc1155() -> eyre::Result<()> {
        // test setup
        let test = setup_test_environment().await?;

        // mint ERC1155 tokens to alice
        let mock_erc1155_a = MockERC1155::new(test.mock_addresses.erc1155_a, &test.god_provider);
        mock_erc1155_a
            .mint(test.alice.address(), U256::from(1), U256::from(10))
            .send()
            .await?
            .get_receipt()
            .await?;

        let price = Erc1155Data {
            address: test.mock_addresses.erc1155_a,
            id: U256::from(1),
            value: U256::from(5),
        };

        // Create custom arbiter data
        let arbiter = test.addresses.erc1155_addresses.clone().payment_obligation;
        let demand = Bytes::from(b"custom demand data");
        let item = ArbiterData { arbiter, demand };

        // Check initial approval state
        let initial_approval = mock_erc1155_a
            .isApprovedForAll(
                test.alice.address(),
                test.addresses
                    .erc1155_addresses
                    .clone()
                    .escrow_obligation_default,
            )
            .call()
            .await?;

        assert!(!initial_approval, "Should not be approved initially");

        // alice creates escrow using approve_and_create (no pre-approval needed)
        let (approval_receipt, escrow_receipt, revoke_receipt) = test
            .alice_client
            .erc1155()
            .escrow()
            .default()
            .approve_and_create(&price, &item, 0)
            .await?;

        // Verify all receipts are valid
        assert!(approval_receipt.status(), "Approval should succeed");
        assert!(escrow_receipt.status(), "Escrow creation should succeed");
        assert!(revoke_receipt.status(), "Revoke should succeed");

        // Verify escrow happened - check alice's balance decreased
        let alice_balance = mock_erc1155_a
            .balanceOf(test.alice.address(), U256::from(1))
            .call()
            .await?;

        // Check escrow contract's balance increased
        let escrow_balance = mock_erc1155_a
            .balanceOf(
                test.addresses.erc1155_addresses.escrow_obligation_default,
                U256::from(1),
            )
            .call()
            .await?;

        assert_eq!(
            alice_balance,
            U256::from(5),
            "Alice should have 5 tokens remaining"
        );
        assert_eq!(escrow_balance, U256::from(5), "Escrow should have 5 tokens");

        // Verify approval was revoked after escrow creation
        let final_approval = mock_erc1155_a
            .isApprovedForAll(
                test.alice.address(),
                test.addresses.erc1155_addresses.escrow_obligation_default,
            )
            .call()
            .await?;

        assert!(
            !final_approval,
            "Approval should be revoked after escrow creation"
        );

        // escrow obligation made
        let attested_event = DefaultAlkahestClient::get_attested_event(escrow_receipt)?;
        assert_ne!(attested_event.uid, FixedBytes::<32>::default());

        Ok(())
    }
}
