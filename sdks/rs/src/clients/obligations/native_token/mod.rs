//! Native Token obligations module
//!
//! This module provides functionality for native token (ETH) operations including:
//! - Escrow obligations (unconditional and default)
//! - Payment obligations

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
use crate::types::{ProviderContext, SharedWalletProvider};

// --- ABI conversions for NativeToken obligation types ---
impl_abi_conversions!(contracts::obligations::NativeTokenPaymentObligation::ObligationData);
impl_abi_conversions!(
    contracts::obligations::escrow::default_escrow::NativeTokenEscrowObligation::ObligationData
);
impl_abi_conversions!(contracts::obligations::escrow::unconditional::UnconditionalNativeTokenEscrowObligation::ObligationData);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NativeTokenAddresses {
    pub eas: Address,
    pub atomic_payment_utils: Address,
    pub escrow_obligation_default: Address,
    pub escrow_obligation_unconditional: Address,
    pub payment_obligation: Address,
}

impl Default for NativeTokenAddresses {
    fn default() -> Self {
        BASE_SEPOLIA_ADDRESSES.native_token_addresses
    }
}

/// Available contracts in the Native Token module
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NativeTokenContract {
    /// EAS (Ethereum Attestation Service) contract
    Eas,
    /// Atomic payment utilities contract for native tokens
    AtomicPaymentUtils,
    /// Escrow obligation contract for native tokens
    EscrowObligation,
    /// Payment obligation contract for native tokens
    PaymentObligation,
}

/// Client for interacting with native token (ETH) trading and escrow functionality.
///
/// This client provides methods for:
/// - Trading native tokens for other tokens (ERC20, ERC721, ERC1155)
/// - Creating escrow arrangements with custom demands
/// - Managing direct native token payments
/// - Collecting payments from fulfilled trades
#[derive(Clone)]
pub struct NativeTokenModule {
    pub(crate) signer: PrivateKeySigner,
    pub(crate) wallet_provider: SharedWalletProvider,
    pub(crate) packaged_escrow_obligations: Vec<Address>,
    pub addresses: NativeTokenAddresses,
}

impl ContractModule for NativeTokenModule {
    type Contract = NativeTokenContract;

    fn address(&self, contract: Self::Contract) -> Address {
        match contract {
            NativeTokenContract::Eas => self.addresses.eas,
            NativeTokenContract::AtomicPaymentUtils => self.addresses.atomic_payment_utils,
            NativeTokenContract::EscrowObligation => self.addresses.escrow_obligation_default,
            NativeTokenContract::PaymentObligation => self.addresses.payment_obligation,
        }
    }
}

impl NativeTokenModule {
    /// Creates a new NativeTokenModule instance.
    pub fn new(
        signer: PrivateKeySigner,
        wallet_provider: SharedWalletProvider,
        addresses: Option<NativeTokenAddresses>,
    ) -> eyre::Result<Self> {
        let addresses = addresses.unwrap_or_default();
        let packaged_escrow_obligations = vec![
            addresses.escrow_obligation_default,
            addresses.escrow_obligation_unconditional,
        ];
        Ok(NativeTokenModule {
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
    /// client.native_token().escrow().default().create(&price, &item, expiration).await?;
    ///
    /// // Unconditional escrow (1:many escrow:fulfillment)
    /// client.native_token().escrow().unconditional().create(&price, &item, expiration).await?;
    /// ```
    pub fn escrow(&self) -> escrow::Escrow<'_> {
        escrow::Escrow::new(self)
    }

    /// Access payment API
    ///
    /// # Example
    /// ```rust,ignore
    /// client.native_token().payment().pay(&price, payee).await?;
    /// ```
    pub fn payment(&self) -> payment::Payment<'_> {
        payment::Payment::new(self)
    }
}

impl AlkahestExtension for NativeTokenModule {
    type Config = NativeTokenAddresses;

    async fn init(
        signer: PrivateKeySigner,
        providers: ProviderContext,
        config: Option<Self::Config>,
    ) -> eyre::Result<Self> {
        Self::new(signer, providers.wallet.clone(), config)
    }
}
