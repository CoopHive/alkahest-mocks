use alloy::{
    primitives::{Address, Bytes, FixedBytes, keccak256},
    signers::local::PrivateKeySigner,
    sol_types::SolValue as _,
};
use serde::{Deserialize, Serialize};

use crate::{
    addresses::BASE_SEPOLIA_ADDRESSES,
    contracts,
    extensions::{AlkahestExtension, ContractModule},
    impl_abi_conversions,
    types::{ProviderContext, SharedWalletProvider},
};

/// Common splitter arbiter demand data.
type SplitterDemandData = contracts::utils::splitters::ERC20Splitter::DemandData;
/// Split item for native/ERC20/ERC1155 amount-based splitters.
type AmountSplit = contracts::utils::splitters::ERC20Splitter::Split;
/// Split item for token-bundle splitters.
type BundleSplit = contracts::utils::splitters::token_bundle::TokenBundleSplitterBase::BundleSplit;

impl_abi_conversions!(SplitterDemandData);
impl_abi_conversions!(AmountSplit);
impl_abi_conversions!(BundleSplit);

/// Contract addresses used by the splitter module.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SplittersAddresses {
    /// ERC20Splitter contract address.
    pub erc20_splitter: Address,
    /// ERC1155Splitter contract address.
    pub erc1155_splitter: Address,
    /// NativeTokenSplitter contract address.
    pub native_token_splitter: Address,
    /// TokenBundleSplitter contract address.
    pub token_bundle_splitter: Address,
    /// TokenBundleSplitterUnvalidated contract address.
    pub token_bundle_splitter_unvalidated: Address,
    /// CommitmentERC20Splitter contract address.
    pub commitment_erc20_splitter: Address,
    /// CommitmentERC1155Splitter contract address.
    pub commitment_erc1155_splitter: Address,
    /// CommitmentNativeTokenSplitter contract address.
    pub commitment_native_token_splitter: Address,
    /// CommitmentTokenBundleSplitter contract address.
    pub commitment_token_bundle_splitter: Address,
    /// CommitmentTokenBundleSplitterUnvalidated contract address.
    pub commitment_token_bundle_splitter_unvalidated: Address,
}

impl Default for SplittersAddresses {
    /// Returns Base Sepolia splitter addresses.
    fn default() -> Self {
        BASE_SEPOLIA_ADDRESSES.splitters_addresses
    }
}

/// Contracts addressable through the splitter module.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SplitterContract {
    /// ERC20Splitter contract.
    Erc20Splitter,
    /// ERC1155Splitter contract.
    Erc1155Splitter,
    /// NativeTokenSplitter contract.
    NativeTokenSplitter,
    /// TokenBundleSplitter contract.
    TokenBundleSplitter,
    /// TokenBundleSplitterUnvalidated contract.
    TokenBundleSplitterUnvalidated,
    /// CommitmentERC20Splitter contract.
    CommitmentErc20Splitter,
    /// CommitmentERC1155Splitter contract.
    CommitmentErc1155Splitter,
    /// CommitmentNativeTokenSplitter contract.
    CommitmentNativeTokenSplitter,
    /// CommitmentTokenBundleSplitter contract.
    CommitmentTokenBundleSplitter,
    /// CommitmentTokenBundleSplitterUnvalidated contract.
    CommitmentTokenBundleSplitterUnvalidated,
}

/// Rust client module for splitter helpers.
///
/// Security note: the underlying splitter contracts have not been included in
/// professional manual audits and have only been reviewed by automated audit
/// tooling so far.
#[derive(Clone)]
pub struct SplittersModule {
    _signer: PrivateKeySigner,
    _wallet_provider: SharedWalletProvider,
    pub addresses: SplittersAddresses,
}

impl ContractModule for SplittersModule {
    type Contract = SplitterContract;

    fn address(&self, contract: Self::Contract) -> Address {
        match contract {
            SplitterContract::Erc20Splitter => self.addresses.erc20_splitter,
            SplitterContract::Erc1155Splitter => self.addresses.erc1155_splitter,
            SplitterContract::NativeTokenSplitter => self.addresses.native_token_splitter,
            SplitterContract::TokenBundleSplitter => self.addresses.token_bundle_splitter,
            SplitterContract::TokenBundleSplitterUnvalidated => {
                self.addresses.token_bundle_splitter_unvalidated
            }
            SplitterContract::CommitmentErc20Splitter => self.addresses.commitment_erc20_splitter,
            SplitterContract::CommitmentErc1155Splitter => {
                self.addresses.commitment_erc1155_splitter
            }
            SplitterContract::CommitmentNativeTokenSplitter => {
                self.addresses.commitment_native_token_splitter
            }
            SplitterContract::CommitmentTokenBundleSplitter => {
                self.addresses.commitment_token_bundle_splitter
            }
            SplitterContract::CommitmentTokenBundleSplitterUnvalidated => {
                self.addresses.commitment_token_bundle_splitter_unvalidated
            }
        }
    }
}

impl SplittersModule {
    /// Creates a splitter module with optional custom addresses.
    pub fn new(
        signer: PrivateKeySigner,
        wallet_provider: SharedWalletProvider,
        addresses: Option<SplittersAddresses>,
    ) -> eyre::Result<Self> {
        Ok(Self {
            _signer: signer,
            _wallet_provider: wallet_provider,
            addresses: addresses.unwrap_or_default(),
        })
    }

    /// Encodes splitter demand data.
    pub fn encode_demand(data: &SplitterDemandData) -> Bytes {
        data.abi_encode().into()
    }

    /// Decodes ABI-encoded splitter demand data.
    pub fn decode_demand(data: &Bytes) -> eyre::Result<SplitterDemandData> {
        Ok(SplitterDemandData::abi_decode(data.as_ref())?)
    }

    /// Computes the splitter decision key for a fulfillment and escrow UID.
    pub fn decision_key(fulfillment: FixedBytes<32>, escrow: FixedBytes<32>) -> FixedBytes<32> {
        let mut packed = Vec::with_capacity(64);
        packed.extend_from_slice(fulfillment.as_slice());
        packed.extend_from_slice(escrow.as_slice());
        keccak256(packed)
    }
}

impl AlkahestExtension for SplittersModule {
    type Config = SplittersAddresses;

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
    use alloy::primitives::{Address, Bytes, FixedBytes};

    use super::*;

    #[test]
    fn splitter_demand_encode_decode_roundtrip() {
        let data = SplitterDemandData {
            oracle: Address::repeat_byte(0x11),
            data: Bytes::from_static(&[0x12, 0x34]),
        };

        let encoded = SplittersModule::encode_demand(&data);
        let decoded = SplittersModule::decode_demand(&encoded).unwrap();

        assert_eq!(decoded.oracle, data.oracle);
        assert_eq!(decoded.data, data.data);
    }

    #[test]
    fn decision_key_hashes_fulfillment_and_escrow() {
        let key = SplittersModule::decision_key(
            FixedBytes::<32>::repeat_byte(0x11),
            FixedBytes::<32>::repeat_byte(0x22),
        );

        assert_ne!(key, FixedBytes::<32>::default());
    }
}
