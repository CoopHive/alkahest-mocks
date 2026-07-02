use alloy::{
    primitives::{Address, Bytes, FixedBytes, U256},
    rpc::types::TransactionReceipt,
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

/// Obligation data for a hook-based escrow with one hook.
type HookEscrowData =
    contracts::obligations::escrow::hook_based::HookEscrowObligation::ObligationData;
/// Obligation data for a hook-based escrow with multiple hooks.
type HooksEscrowData =
    contracts::obligations::escrow::hook_based::HooksEscrowObligation::ObligationData;
/// Hook data for ERC20 amount escrows.
pub type ERC20EscrowHookData =
    contracts::obligations::escrow::hook_based::hooks::ERC20EscrowHook::HookData;
/// Hook data for ERC721 token-ID escrows.
pub type ERC721EscrowHookData =
    contracts::obligations::escrow::hook_based::hooks::ERC721EscrowHook::HookData;
/// Hook data for ERC1155 token-ID amount escrows.
pub type ERC1155EscrowHookData =
    contracts::obligations::escrow::hook_based::hooks::ERC1155EscrowHook::HookData;
/// Hook data for native-token escrows.
pub type NativeTokenEscrowHookData =
    contracts::obligations::escrow::hook_based::hooks::NativeTokenEscrowHook::HookData;
/// Hook data for escrowing a newly created attestation.
pub type AttestationEscrowHookData =
    contracts::obligations::escrow::hook_based::hooks::AttestationEscrowHook::HookData;
/// Hook data for escrowing a reference attestation.
pub type AttestationReferenceEscrowHookData =
    contracts::obligations::escrow::hook_based::hooks::AttestationReferenceEscrowHook::HookData;

impl_abi_conversions!(HookEscrowData);
impl_abi_conversions!(HooksEscrowData);
impl_abi_conversions!(ERC20EscrowHookData);
impl_abi_conversions!(ERC721EscrowHookData);
impl_abi_conversions!(ERC1155EscrowHookData);
impl_abi_conversions!(NativeTokenEscrowHookData);
impl_abi_conversions!(AttestationEscrowHookData);
impl_abi_conversions!(AttestationReferenceEscrowHookData);

/// Contract addresses used by the hook-based escrow module.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HookBasedAddresses {
    /// EAS contract address.
    pub eas: Address,
    /// HookEscrowObligation contract address.
    pub hook_escrow_obligation: Address,
    /// HooksEscrowObligation contract address.
    pub hooks_escrow_obligation: Address,
    /// ERC20EscrowHook contract address.
    pub erc20_escrow_hook: Address,
    /// ERC721EscrowHook contract address.
    pub erc721_escrow_hook: Address,
    /// ERC1155EscrowHook contract address.
    pub erc1155_escrow_hook: Address,
    /// NativeTokenEscrowHook contract address.
    pub native_token_escrow_hook: Address,
    /// AttestationEscrowHook contract address.
    pub attestation_escrow_hook: Address,
    /// AttestationReferenceEscrowHook contract address.
    pub attestation_reference_escrow_hook: Address,
}

impl Default for HookBasedAddresses {
    /// Returns Base Sepolia hook-based escrow addresses.
    fn default() -> Self {
        BASE_SEPOLIA_ADDRESSES.hook_based_addresses
    }
}

/// Contracts addressable through the hook-based escrow module.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HookBasedContract {
    /// EAS contract.
    Eas,
    /// HookEscrowObligation contract.
    HookEscrowObligation,
    /// HooksEscrowObligation contract.
    HooksEscrowObligation,
    /// ERC20EscrowHook contract.
    Erc20EscrowHook,
    /// ERC721EscrowHook contract.
    Erc721EscrowHook,
    /// ERC1155EscrowHook contract.
    Erc1155EscrowHook,
    /// NativeTokenEscrowHook contract.
    NativeTokenEscrowHook,
    /// AttestationEscrowHook contract.
    AttestationEscrowHook,
    /// AttestationReferenceEscrowHook contract.
    AttestationReferenceEscrowHook,
}

/// Rust client module for hook-based escrow helpers.
///
/// Security note: the underlying hook-based escrow contracts and hooks have not
/// been included in professional manual audits and have only been reviewed by
/// automated audit tooling so far.
#[derive(Clone)]
pub struct HookBasedModule {
    _signer: PrivateKeySigner,
    _wallet_provider: SharedWalletProvider,
    pub addresses: HookBasedAddresses,
}

impl ContractModule for HookBasedModule {
    type Contract = HookBasedContract;

    fn address(&self, contract: Self::Contract) -> Address {
        match contract {
            HookBasedContract::Eas => self.addresses.eas,
            HookBasedContract::HookEscrowObligation => self.addresses.hook_escrow_obligation,
            HookBasedContract::HooksEscrowObligation => self.addresses.hooks_escrow_obligation,
            HookBasedContract::Erc20EscrowHook => self.addresses.erc20_escrow_hook,
            HookBasedContract::Erc721EscrowHook => self.addresses.erc721_escrow_hook,
            HookBasedContract::Erc1155EscrowHook => self.addresses.erc1155_escrow_hook,
            HookBasedContract::NativeTokenEscrowHook => self.addresses.native_token_escrow_hook,
            HookBasedContract::AttestationEscrowHook => self.addresses.attestation_escrow_hook,
            HookBasedContract::AttestationReferenceEscrowHook => {
                self.addresses.attestation_reference_escrow_hook
            }
        }
    }
}

impl HookBasedModule {
    /// Creates a hook-based escrow module with optional custom addresses.
    pub fn new(
        signer: PrivateKeySigner,
        wallet_provider: SharedWalletProvider,
        addresses: Option<HookBasedAddresses>,
    ) -> eyre::Result<Self> {
        Ok(Self {
            _signer: signer,
            _wallet_provider: wallet_provider,
            addresses: addresses.unwrap_or_default(),
        })
    }

    /// Encodes single-hook escrow obligation data.
    pub fn encode_hook_escrow(data: &HookEscrowData) -> Bytes {
        data.abi_encode().into()
    }

    /// Decodes ABI-encoded single-hook escrow obligation data.
    pub fn decode_hook_escrow(data: &Bytes) -> eyre::Result<HookEscrowData> {
        Ok(HookEscrowData::abi_decode(data.as_ref())?)
    }

    /// Encodes multi-hook escrow obligation data.
    pub fn encode_hooks_escrow(data: &HooksEscrowData) -> Bytes {
        data.abi_encode().into()
    }

    /// Decodes ABI-encoded multi-hook escrow obligation data.
    pub fn decode_hooks_escrow(data: &Bytes) -> eyre::Result<HooksEscrowData> {
        Ok(HooksEscrowData::abi_decode(data.as_ref())?)
    }

    /// Encodes ERC20 hook data.
    pub fn encode_erc20_hook_data(data: &ERC20EscrowHookData) -> Bytes {
        data.abi_encode().into()
    }

    /// Decodes ERC20 hook data.
    pub fn decode_erc20_hook_data(data: &Bytes) -> eyre::Result<ERC20EscrowHookData> {
        Ok(ERC20EscrowHookData::abi_decode(data.as_ref())?)
    }

    /// Encodes ERC721 hook data.
    pub fn encode_erc721_hook_data(data: &ERC721EscrowHookData) -> Bytes {
        data.abi_encode().into()
    }

    /// Decodes ERC721 hook data.
    pub fn decode_erc721_hook_data(data: &Bytes) -> eyre::Result<ERC721EscrowHookData> {
        Ok(ERC721EscrowHookData::abi_decode(data.as_ref())?)
    }

    /// Encodes ERC1155 hook data.
    pub fn encode_erc1155_hook_data(data: &ERC1155EscrowHookData) -> Bytes {
        data.abi_encode().into()
    }

    /// Decodes ERC1155 hook data.
    pub fn decode_erc1155_hook_data(data: &Bytes) -> eyre::Result<ERC1155EscrowHookData> {
        Ok(ERC1155EscrowHookData::abi_decode(data.as_ref())?)
    }

    /// Encodes native-token hook data.
    pub fn encode_native_token_hook_data(data: &NativeTokenEscrowHookData) -> Bytes {
        data.abi_encode().into()
    }

    /// Decodes native-token hook data.
    pub fn decode_native_token_hook_data(data: &Bytes) -> eyre::Result<NativeTokenEscrowHookData> {
        Ok(NativeTokenEscrowHookData::abi_decode(data.as_ref())?)
    }

    /// Encodes attestation hook data.
    pub fn encode_attestation_hook_data(data: &AttestationEscrowHookData) -> Bytes {
        data.abi_encode().into()
    }

    /// Decodes attestation hook data.
    pub fn decode_attestation_hook_data(data: &Bytes) -> eyre::Result<AttestationEscrowHookData> {
        Ok(AttestationEscrowHookData::abi_decode(data.as_ref())?)
    }

    /// Encodes attestation-reference hook data.
    pub fn encode_attestation_reference_hook_data(
        data: &AttestationReferenceEscrowHookData,
    ) -> Bytes {
        data.abi_encode().into()
    }

    /// Decodes attestation-reference hook data.
    pub fn decode_attestation_reference_hook_data(
        data: &Bytes,
    ) -> eyre::Result<AttestationReferenceEscrowHookData> {
        Ok(AttestationReferenceEscrowHookData::abi_decode(
            data.as_ref(),
        )?)
    }

    /// Reads the ERC20 amount deposited by `caller` for `token`.
    pub async fn erc20_deposit(&self, caller: Address, token: Address) -> eyre::Result<U256> {
        Ok(
            contracts::obligations::escrow::hook_based::hooks::ERC20EscrowHook::new(
                self.addresses.erc20_escrow_hook,
                &self._wallet_provider,
            )
            .deposits(caller, token)
            .call()
            .await?,
        )
    }

    /// Reads whether `caller` deposited an ERC721 `token_id` for `token`.
    pub async fn erc721_deposit(
        &self,
        caller: Address,
        token: Address,
        token_id: U256,
    ) -> eyre::Result<bool> {
        Ok(
            contracts::obligations::escrow::hook_based::hooks::ERC721EscrowHook::new(
                self.addresses.erc721_escrow_hook,
                &self._wallet_provider,
            )
            .deposits(caller, token, token_id)
            .call()
            .await?,
        )
    }

    /// Reads the ERC1155 amount deposited by `caller` for `token_id`.
    pub async fn erc1155_deposit(
        &self,
        caller: Address,
        token: Address,
        token_id: U256,
    ) -> eyre::Result<U256> {
        Ok(
            contracts::obligations::escrow::hook_based::hooks::ERC1155EscrowHook::new(
                self.addresses.erc1155_escrow_hook,
                &self._wallet_provider,
            )
            .deposits(caller, token, token_id)
            .call()
            .await?,
        )
    }

    /// Reads the native-token amount deposited by `caller`.
    pub async fn native_token_deposit(&self, caller: Address) -> eyre::Result<U256> {
        Ok(
            contracts::obligations::escrow::hook_based::hooks::NativeTokenEscrowHook::new(
                self.addresses.native_token_escrow_hook,
                &self._wallet_provider,
            )
            .deposits(caller)
            .call()
            .await?,
        )
    }

    /// Reads pending attestation hook count for `caller` and encoded hook data hash.
    pub async fn attestation_pending(
        &self,
        caller: Address,
        hook_data_hash: FixedBytes<32>,
    ) -> eyre::Result<U256> {
        Ok(
            contracts::obligations::escrow::hook_based::hooks::AttestationEscrowHook::new(
                self.addresses.attestation_escrow_hook,
                &self._wallet_provider,
            )
            .pending(caller, hook_data_hash)
            .call()
            .await?,
        )
    }

    /// Reads pending attestation-reference hook count for `caller` and encoded hook data hash.
    pub async fn attestation_reference_pending(
        &self,
        caller: Address,
        hook_data_hash: FixedBytes<32>,
    ) -> eyre::Result<U256> {
        Ok(
            contracts::obligations::escrow::hook_based::hooks::AttestationReferenceEscrowHook::new(
                self.addresses.attestation_reference_escrow_hook,
                &self._wallet_provider,
            )
            .pending(caller, hook_data_hash)
            .call()
            .await?,
        )
    }

    /// Approves a packaged hook to be used by an escrow obligation contract for this signer.
    pub async fn approve_escrow(
        &self,
        hook: HookBasedContract,
        escrow: Address,
    ) -> eyre::Result<TransactionReceipt> {
        let receipt = match hook {
            HookBasedContract::Erc20EscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::ERC20EscrowHook::new(
                    self.addresses.erc20_escrow_hook,
                    &self._wallet_provider,
                )
                .approveEscrow(escrow)
                .send()
                .await?
                .get_receipt()
                .await?
            }
            HookBasedContract::Erc721EscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::ERC721EscrowHook::new(
                    self.addresses.erc721_escrow_hook,
                    &self._wallet_provider,
                )
                .approveEscrow(escrow)
                .send()
                .await?
                .get_receipt()
                .await?
            }
            HookBasedContract::Erc1155EscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::ERC1155EscrowHook::new(
                    self.addresses.erc1155_escrow_hook,
                    &self._wallet_provider,
                )
                .approveEscrow(escrow)
                .send()
                .await?
                .get_receipt()
                .await?
            }
            HookBasedContract::NativeTokenEscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::NativeTokenEscrowHook::new(
                    self.addresses.native_token_escrow_hook,
                    &self._wallet_provider,
                )
                .approveEscrow(escrow)
                .send()
                .await?
                .get_receipt()
                .await?
            }
            HookBasedContract::AttestationEscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::AttestationEscrowHook::new(
                    self.addresses.attestation_escrow_hook,
                    &self._wallet_provider,
                )
                .approveEscrow(escrow)
                .send()
                .await?
                .get_receipt()
                .await?
            }
            HookBasedContract::AttestationReferenceEscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::AttestationReferenceEscrowHook::new(
                    self.addresses.attestation_reference_escrow_hook,
                    &self._wallet_provider,
                )
                .approveEscrow(escrow)
                .send()
                .await?
                .get_receipt()
                .await?
            }
            HookBasedContract::Eas
            | HookBasedContract::HookEscrowObligation
            | HookBasedContract::HooksEscrowObligation => {
                eyre::bail!("contract is not an escrow hook")
            }
        };

        Ok(receipt)
    }

    /// Revokes this signer's hook approval for an escrow obligation contract.
    pub async fn unapprove_escrow(
        &self,
        hook: HookBasedContract,
        escrow: Address,
    ) -> eyre::Result<TransactionReceipt> {
        let receipt = match hook {
            HookBasedContract::Erc20EscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::ERC20EscrowHook::new(
                    self.addresses.erc20_escrow_hook,
                    &self._wallet_provider,
                )
                .unapproveEscrow(escrow)
                .send()
                .await?
                .get_receipt()
                .await?
            }
            HookBasedContract::Erc721EscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::ERC721EscrowHook::new(
                    self.addresses.erc721_escrow_hook,
                    &self._wallet_provider,
                )
                .unapproveEscrow(escrow)
                .send()
                .await?
                .get_receipt()
                .await?
            }
            HookBasedContract::Erc1155EscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::ERC1155EscrowHook::new(
                    self.addresses.erc1155_escrow_hook,
                    &self._wallet_provider,
                )
                .unapproveEscrow(escrow)
                .send()
                .await?
                .get_receipt()
                .await?
            }
            HookBasedContract::NativeTokenEscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::NativeTokenEscrowHook::new(
                    self.addresses.native_token_escrow_hook,
                    &self._wallet_provider,
                )
                .unapproveEscrow(escrow)
                .send()
                .await?
                .get_receipt()
                .await?
            }
            HookBasedContract::AttestationEscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::AttestationEscrowHook::new(
                    self.addresses.attestation_escrow_hook,
                    &self._wallet_provider,
                )
                .unapproveEscrow(escrow)
                .send()
                .await?
                .get_receipt()
                .await?
            }
            HookBasedContract::AttestationReferenceEscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::AttestationReferenceEscrowHook::new(
                    self.addresses.attestation_reference_escrow_hook,
                    &self._wallet_provider,
                )
                .unapproveEscrow(escrow)
                .send()
                .await?
                .get_receipt()
                .await?
            }
            HookBasedContract::Eas
            | HookBasedContract::HookEscrowObligation
            | HookBasedContract::HooksEscrowObligation => {
                eyre::bail!("contract is not an escrow hook")
            }
        };

        Ok(receipt)
    }

    /// Returns whether `owner` has approved `escrow` to use the selected packaged hook.
    pub async fn is_escrow_approved(
        &self,
        hook: HookBasedContract,
        owner: Address,
        escrow: Address,
    ) -> eyre::Result<bool> {
        let approved = match hook {
            HookBasedContract::Erc20EscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::ERC20EscrowHook::new(
                    self.addresses.erc20_escrow_hook,
                    &self._wallet_provider,
                )
                .isEscrowApproved(owner, escrow)
                .call()
                .await?
            }
            HookBasedContract::Erc721EscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::ERC721EscrowHook::new(
                    self.addresses.erc721_escrow_hook,
                    &self._wallet_provider,
                )
                .isEscrowApproved(owner, escrow)
                .call()
                .await?
            }
            HookBasedContract::Erc1155EscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::ERC1155EscrowHook::new(
                    self.addresses.erc1155_escrow_hook,
                    &self._wallet_provider,
                )
                .isEscrowApproved(owner, escrow)
                .call()
                .await?
            }
            HookBasedContract::NativeTokenEscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::NativeTokenEscrowHook::new(
                    self.addresses.native_token_escrow_hook,
                    &self._wallet_provider,
                )
                .isEscrowApproved(owner, escrow)
                .call()
                .await?
            }
            HookBasedContract::AttestationEscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::AttestationEscrowHook::new(
                    self.addresses.attestation_escrow_hook,
                    &self._wallet_provider,
                )
                .isEscrowApproved(owner, escrow)
                .call()
                .await?
            }
            HookBasedContract::AttestationReferenceEscrowHook => {
                contracts::obligations::escrow::hook_based::hooks::AttestationReferenceEscrowHook::new(
                    self.addresses.attestation_reference_escrow_hook,
                    &self._wallet_provider,
                )
                .isEscrowApproved(owner, escrow)
                .call()
                .await?
            }
            HookBasedContract::Eas
            | HookBasedContract::HookEscrowObligation
            | HookBasedContract::HooksEscrowObligation => {
                eyre::bail!("contract is not an escrow hook")
            }
        };

        Ok(approved)
    }
}

impl AlkahestExtension for HookBasedModule {
    type Config = HookBasedAddresses;

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
    use alloy::primitives::{Address, Bytes};

    use super::*;

    #[test]
    fn hook_escrow_encode_decode_roundtrip() {
        let data = HookEscrowData {
            arbiter: Address::repeat_byte(0x11),
            demand: Bytes::from_static(&[0x12, 0x34]),
            hook: Address::repeat_byte(0x22),
            hookData: Bytes::from_static(&[0xab, 0xcd]),
        };

        let encoded = HookBasedModule::encode_hook_escrow(&data);
        let decoded = HookBasedModule::decode_hook_escrow(&encoded).unwrap();

        assert_eq!(decoded.arbiter, data.arbiter);
        assert_eq!(decoded.demand, data.demand);
        assert_eq!(decoded.hook, data.hook);
        assert_eq!(decoded.hookData, data.hookData);
    }
}
