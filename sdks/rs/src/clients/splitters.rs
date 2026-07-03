use std::{pin::Pin, time::Duration};

use alloy::{
    eips::BlockNumberOrTag,
    primitives::{Address, Bytes, FixedBytes, U256, keccak256},
    providers::Provider,
    rpc::types::{Filter, TransactionReceipt},
    signers::local::PrivateKeySigner,
    sol_types::SolEvent,
    sol_types::SolValue as _,
};
use futures::{Stream, StreamExt as _, future::try_join_all};
use serde::{Deserialize, Serialize};
use tokio_util::sync::CancellationToken;

use crate::{
    addresses::BASE_SEPOLIA_ADDRESSES,
    contracts,
    extensions::{AlkahestExtension, ContractModule},
    impl_abi_conversions,
    types::{ProviderContext, SharedPublicProvider, SharedWalletProvider},
    utils::{contract_safety::ensure_deployed_contract, provider_supports_pubsub},
};

type BoxedLogStream = Pin<Box<dyn Stream<Item = alloy::rpc::types::Log> + Send>>;

pub struct SplitterSubscriptionHandle {
    inner: SplitterSubscriptionHandleInner,
}

enum SplitterSubscriptionHandleInner {
    Pubsub { local_id: FixedBytes<32> },
    Polling { cancel: CancellationToken },
}

impl SplitterSubscriptionHandle {
    pub async fn unsubscribe(self, provider: &SharedPublicProvider) -> eyre::Result<()> {
        match self.inner {
            SplitterSubscriptionHandleInner::Pubsub { local_id } => {
                provider.unsubscribe(local_id).await.map_err(Into::into)
            }
            SplitterSubscriptionHandleInner::Polling { cancel } => {
                cancel.cancel();
                Ok(())
            }
        }
    }
}

/// Common splitter arbiter demand data.
pub type SplitterDemandData = contracts::utils::splitters::ERC20Splitter::DemandData;
/// Split item for native/ERC20/ERC1155 amount-based splitters.
pub type AmountSplit = contracts::utils::splitters::ERC20Splitter::Split;
/// Split item for token-bundle splitters.
pub type BundleSplit =
    contracts::utils::splitters::token_bundle::TokenBundleSplitterBase::BundleSplit;

impl_abi_conversions!(SplitterDemandData);
impl_abi_conversions!(AmountSplit);
impl_abi_conversions!(BundleSplit);

/// Mode for splitter daemon helpers.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SplitterArbitrationMode {
    Past,
    PastUnarbitrated,
    AllUnarbitrated,
    All,
    Future,
}

/// Splitter arbitration request emitted by a fulfillment-based amount splitter.
#[derive(Debug, Clone)]
pub struct AmountSplitterArbitrationRequest {
    pub fulfillment: FixedBytes<32>,
    pub escrow: FixedBytes<32>,
    pub demand: Bytes,
}

/// Amount-splitter decision submitted by a daemon helper.
pub struct AmountSplitterDecision {
    pub fulfillment: FixedBytes<32>,
    pub escrow: FixedBytes<32>,
    pub splits: Vec<AmountSplit>,
    pub receipt: TransactionReceipt,
}

/// Result from amount-splitter daemon helpers.
pub struct AmountSplitterArbitrateManyResult {
    pub past_decisions: Vec<AmountSplitterDecision>,
    pub subscription: Option<SplitterSubscriptionHandle>,
}

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

/// Splitter asset family.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SplitterAsset {
    Erc20,
    Erc1155,
    NativeToken,
    TokenBundle,
    TokenBundleUnvalidated,
}

/// Whether a splitter decision targets an existing fulfillment UID or a future fulfillment commitment.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SplitterDecisionTarget {
    Fulfillment,
    Commitment,
}

/// Rust client module for splitter helpers.
///
/// Security note: the underlying splitter contracts have not been included in
/// professional manual audits and have only been reviewed by automated audit
/// tooling so far.
#[derive(Clone)]
pub struct SplittersModule {
    signer: PrivateKeySigner,
    public_provider: SharedPublicProvider,
    _wallet_provider: SharedWalletProvider,
    poll_interval: Duration,
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
        public_provider: SharedPublicProvider,
        wallet_provider: SharedWalletProvider,
        poll_interval: Duration,
        addresses: Option<SplittersAddresses>,
    ) -> eyre::Result<Self> {
        Ok(Self {
            signer,
            public_provider,
            _wallet_provider: wallet_provider,
            poll_interval,
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

    /// Hashes the attestation fields that commitment splitters approve before a UID exists.
    pub fn attestation_intent_hash(attestation: &contracts::IEAS::Attestation) -> FixedBytes<32> {
        Self::attestation_intent_hash_raw(
            attestation.schema,
            attestation.attester,
            attestation.recipient,
            attestation.expirationTime,
            attestation.revocable,
            attestation.refUID,
            keccak256(&attestation.data),
        )
    }

    /// Hashes an attestation intent from a precomputed data hash.
    pub fn attestation_intent_hash_raw(
        schema: FixedBytes<32>,
        attester: Address,
        recipient: Address,
        expiration_time: u64,
        revocable: bool,
        ref_uid: FixedBytes<32>,
        data_hash: FixedBytes<32>,
    ) -> FixedBytes<32> {
        keccak256(
            (
                schema,
                attester,
                recipient,
                expiration_time,
                revocable,
                ref_uid,
                data_hash,
            )
                .abi_encode(),
        )
    }

    /// Hashes a splitter fulfillment intent, binding the attestation fields to the recorded fulfiller.
    pub fn fulfillment_intent_hash(
        attestation: &contracts::IEAS::Attestation,
        fulfiller: Address,
    ) -> FixedBytes<32> {
        keccak256((Self::attestation_intent_hash(attestation), fulfiller).abi_encode())
    }

    /// Get the splitter contract for an asset and decision target.
    pub fn contract_for(asset: SplitterAsset, target: SplitterDecisionTarget) -> SplitterContract {
        match (asset, target) {
            (SplitterAsset::Erc20, SplitterDecisionTarget::Fulfillment) => {
                SplitterContract::Erc20Splitter
            }
            (SplitterAsset::Erc20, SplitterDecisionTarget::Commitment) => {
                SplitterContract::CommitmentErc20Splitter
            }
            (SplitterAsset::Erc1155, SplitterDecisionTarget::Fulfillment) => {
                SplitterContract::Erc1155Splitter
            }
            (SplitterAsset::Erc1155, SplitterDecisionTarget::Commitment) => {
                SplitterContract::CommitmentErc1155Splitter
            }
            (SplitterAsset::NativeToken, SplitterDecisionTarget::Fulfillment) => {
                SplitterContract::NativeTokenSplitter
            }
            (SplitterAsset::NativeToken, SplitterDecisionTarget::Commitment) => {
                SplitterContract::CommitmentNativeTokenSplitter
            }
            (SplitterAsset::TokenBundle, SplitterDecisionTarget::Fulfillment) => {
                SplitterContract::TokenBundleSplitter
            }
            (SplitterAsset::TokenBundle, SplitterDecisionTarget::Commitment) => {
                SplitterContract::CommitmentTokenBundleSplitter
            }
            (SplitterAsset::TokenBundleUnvalidated, SplitterDecisionTarget::Fulfillment) => {
                SplitterContract::TokenBundleSplitterUnvalidated
            }
            (SplitterAsset::TokenBundleUnvalidated, SplitterDecisionTarget::Commitment) => {
                SplitterContract::CommitmentTokenBundleSplitterUnvalidated
            }
        }
    }

    /// Get the splitter address for an asset and decision target.
    pub fn address_for(&self, asset: SplitterAsset, target: SplitterDecisionTarget) -> Address {
        self.address(Self::contract_for(asset, target))
    }

    /// Whether a splitter contract uses bundle split data.
    pub fn is_bundle_contract(contract: SplitterContract) -> bool {
        matches!(
            contract,
            SplitterContract::TokenBundleSplitter
                | SplitterContract::TokenBundleSplitterUnvalidated
                | SplitterContract::CommitmentTokenBundleSplitter
                | SplitterContract::CommitmentTokenBundleSplitterUnvalidated
        )
    }

    /// Whether a splitter contract validates pre-attestation commitments.
    pub fn is_commitment_contract(contract: SplitterContract) -> bool {
        matches!(
            contract,
            SplitterContract::CommitmentErc20Splitter
                | SplitterContract::CommitmentErc1155Splitter
                | SplitterContract::CommitmentNativeTokenSplitter
                | SplitterContract::CommitmentTokenBundleSplitter
                | SplitterContract::CommitmentTokenBundleSplitterUnvalidated
        )
    }

    fn ensure_contract(&self, contract: SplitterContract) -> eyre::Result<Address> {
        let address = self.address(contract);
        ensure_deployed_contract(address, "splitter")?;
        Ok(address)
    }

    /// Records amount-based splits for a fulfillment UID or commitment intent hash.
    pub async fn arbitrate_amount(
        &self,
        contract: SplitterContract,
        fulfillment_or_intent: FixedBytes<32>,
        escrow: FixedBytes<32>,
        splits: Vec<AmountSplit>,
    ) -> eyre::Result<TransactionReceipt> {
        let address = self.ensure_contract(contract)?;
        let splitter =
            contracts::utils::splitters::ERC20Splitter::new(address, &*self._wallet_provider);
        Ok(splitter
            .arbitrate(fulfillment_or_intent, escrow, splits)
            .send()
            .await?
            .get_receipt()
            .await?)
    }

    /// Records token-bundle splits for a fulfillment UID or commitment intent hash.
    pub async fn arbitrate_bundle(
        &self,
        contract: SplitterContract,
        fulfillment_or_intent: FixedBytes<32>,
        escrow: FixedBytes<32>,
        splits: Vec<BundleSplit>,
    ) -> eyre::Result<TransactionReceipt> {
        let address = self.ensure_contract(contract)?;
        let splitter = contracts::utils::splitters::token_bundle::TokenBundleSplitter::new(
            address,
            &*self._wallet_provider,
        );
        Ok(splitter
            .arbitrate(fulfillment_or_intent, escrow, splits)
            .send()
            .await?
            .get_receipt()
            .await?)
    }

    /// Emits an arbitration request for a fulfillment UID or commitment intent hash.
    pub async fn request_arbitration(
        &self,
        contract: SplitterContract,
        fulfillment_or_intent: FixedBytes<32>,
        escrow: FixedBytes<32>,
        oracle: Address,
        demand: Bytes,
    ) -> eyre::Result<TransactionReceipt> {
        let address = self.ensure_contract(contract)?;
        let splitter =
            contracts::utils::splitters::ERC20Splitter::new(address, &*self._wallet_provider);
        Ok(splitter
            .requestArbitration(fulfillment_or_intent, escrow, oracle, demand)
            .send()
            .await?
            .get_receipt()
            .await?)
    }

    /// Creates a splitter-owned fulfillment attestation.
    pub async fn create_fulfillment(
        &self,
        contract: SplitterContract,
        obligation_contract: Address,
        data: Bytes,
        expiration_time: u64,
        ref_uid: FixedBytes<32>,
        value: U256,
    ) -> eyre::Result<TransactionReceipt> {
        let address = self.ensure_contract(contract)?;
        let splitter =
            contracts::utils::splitters::ERC20Splitter::new(address, &*self._wallet_provider);
        Ok(splitter
            .createFulfillment(obligation_contract, data, expiration_time, ref_uid)
            .value(value)
            .send()
            .await?
            .get_receipt()
            .await?)
    }

    /// Creates a splitter-owned fulfillment and atomically collects/distributes an escrow.
    pub async fn create_fulfillment_and_collect_and_distribute(
        &self,
        contract: SplitterContract,
        escrow: FixedBytes<32>,
        obligation_contract: Address,
        data: Bytes,
        expiration_time: u64,
        ref_uid: FixedBytes<32>,
        value: U256,
    ) -> eyre::Result<TransactionReceipt> {
        let address = self.ensure_contract(contract)?;
        let splitter = contracts::utils::splitters::commitment::CommitmentERC20Splitter::new(
            address,
            &*self._wallet_provider,
        );
        Ok(splitter
            .createFulfillmentAndCollectAndDistribute(
                escrow,
                obligation_contract,
                data,
                expiration_time,
                ref_uid,
            )
            .value(value)
            .send()
            .await?
            .get_receipt()
            .await?)
    }

    /// Collects an escrow and distributes according to recorded splits.
    pub async fn collect_and_distribute(
        &self,
        contract: SplitterContract,
        escrow: FixedBytes<32>,
        fulfillment: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let address = self.ensure_contract(contract)?;
        let splitter =
            contracts::utils::splitters::ERC20Splitter::new(address, &*self._wallet_provider);
        Ok(splitter
            .collectAndDistribute(escrow, fulfillment)
            .send()
            .await?
            .get_receipt()
            .await?)
    }

    /// Collects an escrow and continues if individual transfers fail.
    pub async fn unsafe_partially_collect_and_distribute(
        &self,
        contract: SplitterContract,
        escrow: FixedBytes<32>,
        fulfillment: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let address = self.ensure_contract(contract)?;
        let splitter =
            contracts::utils::splitters::ERC20Splitter::new(address, &*self._wallet_provider);
        Ok(splitter
            .unsafePartiallyCollectAndDistribute(escrow, fulfillment)
            .send()
            .await?
            .get_receipt()
            .await?)
    }

    /// Reads amount-based splits recorded by an oracle.
    pub async fn get_amount_splits(
        &self,
        contract: SplitterContract,
        oracle: Address,
        fulfillment_or_intent: FixedBytes<32>,
        escrow: FixedBytes<32>,
    ) -> eyre::Result<Vec<AmountSplit>> {
        let address = self.ensure_contract(contract)?;
        let splitter =
            contracts::utils::splitters::ERC20Splitter::new(address, &*self._wallet_provider);
        Ok(splitter
            .getSplits(oracle, fulfillment_or_intent, escrow)
            .call()
            .await?)
    }

    /// Reads token-bundle splits recorded by an oracle.
    pub async fn get_bundle_splits(
        &self,
        contract: SplitterContract,
        oracle: Address,
        fulfillment_or_intent: FixedBytes<32>,
        escrow: FixedBytes<32>,
    ) -> eyre::Result<Vec<BundleSplit>> {
        let address = self.ensure_contract(contract)?;
        let splitter = contracts::utils::splitters::token_bundle::TokenBundleSplitter::new(
            address,
            &*self._wallet_provider,
        );
        Ok(splitter
            .getSplits(oracle, fulfillment_or_intent, escrow)
            .call()
            .await?)
    }

    /// Whether an oracle has recorded a decision for a decision key.
    pub async fn has_decision(
        &self,
        contract: SplitterContract,
        oracle: Address,
        decision_key: FixedBytes<32>,
    ) -> eyre::Result<bool> {
        let address = self.ensure_contract(contract)?;
        let splitter =
            contracts::utils::splitters::ERC20Splitter::new(address, &*self._wallet_provider);
        Ok(splitter.hasDecision(oracle, decision_key).call().await?)
    }

    async fn open_log_stream(
        &self,
        filter: &Filter,
    ) -> eyre::Result<(BoxedLogStream, SplitterSubscriptionHandle)> {
        if provider_supports_pubsub(&*self.public_provider) {
            let sub = self.public_provider.subscribe_logs(filter).await?;
            let local_id = *sub.local_id();
            Ok((
                Box::pin(sub.into_stream()),
                SplitterSubscriptionHandle {
                    inner: SplitterSubscriptionHandleInner::Pubsub { local_id },
                },
            ))
        } else {
            let cancel = CancellationToken::new();
            let poller = self
                .public_provider
                .watch_logs(filter)
                .await?
                .with_poll_interval(self.poll_interval);
            let stream = poller.into_stream().flat_map(futures::stream::iter);
            let cancel_clone = cancel.clone();
            Ok((
                Box::pin(stream.take_until(async move {
                    cancel_clone.cancelled().await;
                })),
                SplitterSubscriptionHandle {
                    inner: SplitterSubscriptionHandleInner::Polling { cancel },
                },
            ))
        }
    }

    fn amount_request_filter(&self, contract: SplitterContract) -> eyre::Result<Filter> {
        Ok(Filter::new()
            .address(self.ensure_contract(contract)?)
            .event_signature(
                contracts::utils::splitters::ERC20Splitter::ArbitrationRequested::SIGNATURE_HASH,
            )
            .topic3(self.signer.address())
            .from_block(BlockNumberOrTag::Earliest))
    }

    async fn amount_request_is_arbitrated(
        &self,
        contract: SplitterContract,
        request: &AmountSplitterArbitrationRequest,
    ) -> eyre::Result<bool> {
        self.has_decision(
            contract,
            self.signer.address(),
            Self::decision_key(request.fulfillment, request.escrow),
        )
        .await
    }

    /// Read amount-splitter arbitration requests for this oracle.
    pub async fn amount_arbitration_requests(
        &self,
        contract: SplitterContract,
        skip_arbitrated: bool,
    ) -> eyre::Result<Vec<AmountSplitterArbitrationRequest>> {
        if Self::is_bundle_contract(contract) {
            eyre::bail!("amount splitter daemon helpers do not support bundle splitter contracts");
        }

        let filter = self.amount_request_filter(contract)?;
        let logs = self.public_provider.get_logs(&filter).await?;
        let requests = logs
            .into_iter()
            .map(|log| {
                log.log_decode::<contracts::utils::splitters::ERC20Splitter::ArbitrationRequested>()
                    .map(|decoded| AmountSplitterArbitrationRequest {
                        fulfillment: decoded.inner.data.fulfillment,
                        escrow: decoded.inner.data.escrow,
                        demand: decoded.inner.data.demand,
                    })
                    .map_err(Into::into)
            })
            .collect::<eyre::Result<Vec<_>>>()?;

        if !skip_arbitrated {
            return Ok(requests);
        }

        let mut filtered = Vec::new();
        for request in requests {
            if !self
                .amount_request_is_arbitrated(contract, &request)
                .await?
            {
                filtered.push(request);
            }
        }
        Ok(filtered)
    }

    async fn submit_amount_splitter_decisions(
        &self,
        contract: SplitterContract,
        requests: Vec<AmountSplitterArbitrationRequest>,
        decisions: Vec<Option<Vec<AmountSplit>>>,
    ) -> eyre::Result<Vec<AmountSplitterDecision>> {
        let mut results = Vec::new();

        for (request, decision) in requests.into_iter().zip(decisions.into_iter()) {
            let Some(splits) = decision else {
                continue;
            };

            let receipt = self
                .arbitrate_amount(
                    contract,
                    request.fulfillment,
                    request.escrow,
                    splits.clone(),
                )
                .await?;
            results.push(AmountSplitterDecision {
                fulfillment: request.fulfillment,
                escrow: request.escrow,
                splits,
                receipt,
            });
        }

        Ok(results)
    }

    /// Arbitrate amount-splitter requests in blocking mode with a sync callback.
    pub async fn arbitrate_many_amount_blocking_sync<
        Decide: Fn(&AmountSplitterArbitrationRequest) -> Option<Vec<AmountSplit>>,
        OnDecisionFut: std::future::Future<Output = ()>,
        OnDecision: Fn(&AmountSplitterDecision) -> OnDecisionFut,
    >(
        &self,
        contract: SplitterContract,
        decide: Decide,
        on_decision: OnDecision,
        mode: SplitterArbitrationMode,
        timeout: Option<Duration>,
    ) -> eyre::Result<AmountSplitterArbitrateManyResult> {
        let skip_arbitrated = matches!(
            mode,
            SplitterArbitrationMode::PastUnarbitrated | SplitterArbitrationMode::AllUnarbitrated
        );
        let include_past = matches!(
            mode,
            SplitterArbitrationMode::Past
                | SplitterArbitrationMode::PastUnarbitrated
                | SplitterArbitrationMode::All
                | SplitterArbitrationMode::AllUnarbitrated
        );
        let include_future = matches!(
            mode,
            SplitterArbitrationMode::Future
                | SplitterArbitrationMode::All
                | SplitterArbitrationMode::AllUnarbitrated
        );

        let past_decisions = if include_past {
            let requests = self
                .amount_arbitration_requests(contract, skip_arbitrated)
                .await?;
            let decisions = requests.iter().map(&decide).collect();
            self.submit_amount_splitter_decisions(contract, requests, decisions)
                .await?
        } else {
            Vec::new()
        };

        let subscription = if include_future {
            let filter = self.amount_request_filter(contract)?;
            let (stream, handle) = self.open_log_stream(&filter).await?;
            self.handle_amount_stream_blocking_sync(
                contract,
                stream,
                &decide,
                &on_decision,
                skip_arbitrated,
                timeout,
            )
            .await;
            Some(handle)
        } else {
            None
        };

        Ok(AmountSplitterArbitrateManyResult {
            past_decisions,
            subscription,
        })
    }

    /// Arbitrate amount-splitter requests in blocking mode with an async callback.
    pub async fn arbitrate_many_amount_blocking_async<
        DecideFut: std::future::Future<Output = Option<Vec<AmountSplit>>>,
        Decide: Fn(&AmountSplitterArbitrationRequest) -> DecideFut,
        OnDecisionFut: std::future::Future<Output = ()>,
        OnDecision: Fn(&AmountSplitterDecision) -> OnDecisionFut,
    >(
        &self,
        contract: SplitterContract,
        decide: Decide,
        on_decision: OnDecision,
        mode: SplitterArbitrationMode,
        timeout: Option<Duration>,
    ) -> eyre::Result<AmountSplitterArbitrateManyResult> {
        let skip_arbitrated = matches!(
            mode,
            SplitterArbitrationMode::PastUnarbitrated | SplitterArbitrationMode::AllUnarbitrated
        );
        let include_past = matches!(
            mode,
            SplitterArbitrationMode::Past
                | SplitterArbitrationMode::PastUnarbitrated
                | SplitterArbitrationMode::All
                | SplitterArbitrationMode::AllUnarbitrated
        );
        let include_future = matches!(
            mode,
            SplitterArbitrationMode::Future
                | SplitterArbitrationMode::All
                | SplitterArbitrationMode::AllUnarbitrated
        );

        let past_decisions = if include_past {
            let requests = self
                .amount_arbitration_requests(contract, skip_arbitrated)
                .await?;
            let decisions = try_join_all(
                requests
                    .iter()
                    .map(|request| async { Ok::<_, eyre::Report>(decide(request).await) }),
            )
            .await?;
            self.submit_amount_splitter_decisions(contract, requests, decisions)
                .await?
        } else {
            Vec::new()
        };

        let subscription = if include_future {
            let filter = self.amount_request_filter(contract)?;
            let (stream, handle) = self.open_log_stream(&filter).await?;
            self.handle_amount_stream_blocking_async(
                contract,
                stream,
                &decide,
                &on_decision,
                skip_arbitrated,
                timeout,
            )
            .await;
            Some(handle)
        } else {
            None
        };

        Ok(AmountSplitterArbitrateManyResult {
            past_decisions,
            subscription,
        })
    }

    async fn handle_amount_stream_blocking_sync<
        Decide: Fn(&AmountSplitterArbitrationRequest) -> Option<Vec<AmountSplit>>,
        OnDecisionFut: std::future::Future<Output = ()>,
        OnDecision: Fn(&AmountSplitterDecision) -> OnDecisionFut,
    >(
        &self,
        contract: SplitterContract,
        mut stream: BoxedLogStream,
        decide: &Decide,
        on_decision: &OnDecision,
        skip_arbitrated: bool,
        timeout: Option<Duration>,
    ) {
        loop {
            let next = if let Some(timeout_duration) = timeout {
                match tokio::time::timeout(timeout_duration, stream.next()).await {
                    Ok(Some(log)) => Some(log),
                    Ok(None) => None,
                    Err(_) => break,
                }
            } else {
                stream.next().await
            };
            let Some(log) = next else { break };
            let Ok(decoded) = log
                .log_decode::<contracts::utils::splitters::ERC20Splitter::ArbitrationRequested>()
            else {
                continue;
            };
            let request = AmountSplitterArbitrationRequest {
                fulfillment: decoded.inner.data.fulfillment,
                escrow: decoded.inner.data.escrow,
                demand: decoded.inner.data.demand,
            };
            if skip_arbitrated
                && self
                    .amount_request_is_arbitrated(contract, &request)
                    .await
                    .unwrap_or(true)
            {
                continue;
            }
            let Some(splits) = decide(&request) else {
                continue;
            };
            if let Ok(receipt) = self
                .arbitrate_amount(
                    contract,
                    request.fulfillment,
                    request.escrow,
                    splits.clone(),
                )
                .await
            {
                let decision = AmountSplitterDecision {
                    fulfillment: request.fulfillment,
                    escrow: request.escrow,
                    splits,
                    receipt,
                };
                on_decision(&decision).await;
            }
        }
    }

    async fn handle_amount_stream_blocking_async<
        DecideFut: std::future::Future<Output = Option<Vec<AmountSplit>>>,
        Decide: Fn(&AmountSplitterArbitrationRequest) -> DecideFut,
        OnDecisionFut: std::future::Future<Output = ()>,
        OnDecision: Fn(&AmountSplitterDecision) -> OnDecisionFut,
    >(
        &self,
        contract: SplitterContract,
        mut stream: BoxedLogStream,
        decide: &Decide,
        on_decision: &OnDecision,
        skip_arbitrated: bool,
        timeout: Option<Duration>,
    ) {
        loop {
            let next = if let Some(timeout_duration) = timeout {
                match tokio::time::timeout(timeout_duration, stream.next()).await {
                    Ok(Some(log)) => Some(log),
                    Ok(None) => None,
                    Err(_) => break,
                }
            } else {
                stream.next().await
            };
            let Some(log) = next else { break };
            let Ok(decoded) = log
                .log_decode::<contracts::utils::splitters::ERC20Splitter::ArbitrationRequested>()
            else {
                continue;
            };
            let request = AmountSplitterArbitrationRequest {
                fulfillment: decoded.inner.data.fulfillment,
                escrow: decoded.inner.data.escrow,
                demand: decoded.inner.data.demand,
            };
            if skip_arbitrated
                && self
                    .amount_request_is_arbitrated(contract, &request)
                    .await
                    .unwrap_or(true)
            {
                continue;
            }
            let Some(splits) = decide(&request).await else {
                continue;
            };
            if let Ok(receipt) = self
                .arbitrate_amount(
                    contract,
                    request.fulfillment,
                    request.escrow,
                    splits.clone(),
                )
                .await
            {
                let decision = AmountSplitterDecision {
                    fulfillment: request.fulfillment,
                    escrow: request.escrow,
                    splits,
                    receipt,
                };
                on_decision(&decision).await;
            }
        }
    }
}

impl AlkahestExtension for SplittersModule {
    type Config = SplittersAddresses;

    async fn init(
        signer: PrivateKeySigner,
        providers: ProviderContext,
        config: Option<Self::Config>,
    ) -> eyre::Result<Self> {
        Self::new(
            signer,
            providers.public.clone(),
            providers.wallet.clone(),
            providers.poll_interval,
            config,
        )
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

    #[test]
    fn splitter_contract_selector_maps_asset_and_target() {
        assert_eq!(
            SplittersModule::contract_for(
                SplitterAsset::Erc20,
                SplitterDecisionTarget::Fulfillment
            ),
            SplitterContract::Erc20Splitter
        );
        assert_eq!(
            SplittersModule::contract_for(SplitterAsset::Erc20, SplitterDecisionTarget::Commitment),
            SplitterContract::CommitmentErc20Splitter
        );
        assert_eq!(
            SplittersModule::contract_for(
                SplitterAsset::TokenBundleUnvalidated,
                SplitterDecisionTarget::Commitment
            ),
            SplitterContract::CommitmentTokenBundleSplitterUnvalidated
        );
    }

    #[test]
    fn splitter_contract_classifiers_work() {
        assert!(!SplittersModule::is_bundle_contract(
            SplitterContract::Erc20Splitter
        ));
        assert!(SplittersModule::is_bundle_contract(
            SplitterContract::TokenBundleSplitter
        ));
        assert!(!SplittersModule::is_commitment_contract(
            SplitterContract::TokenBundleSplitter
        ));
        assert!(SplittersModule::is_commitment_contract(
            SplitterContract::CommitmentTokenBundleSplitter
        ));
    }

    #[test]
    fn splitter_intent_hashes_are_nonzero() {
        let attestation = contracts::IEAS::Attestation {
            uid: FixedBytes::<32>::repeat_byte(0x01),
            schema: FixedBytes::<32>::repeat_byte(0x02),
            time: 0,
            expirationTime: 0,
            revocationTime: 0,
            refUID: FixedBytes::<32>::repeat_byte(0x03),
            recipient: Address::repeat_byte(0x04),
            attester: Address::repeat_byte(0x05),
            revocable: false,
            data: Bytes::from_static(&[0x12, 0x34]),
        };

        let intent_hash = SplittersModule::attestation_intent_hash(&attestation);
        let fulfillment_hash =
            SplittersModule::fulfillment_intent_hash(&attestation, Address::repeat_byte(0x06));

        assert_ne!(intent_hash, FixedBytes::<32>::ZERO);
        assert_ne!(fulfillment_hash, FixedBytes::<32>::ZERO);
        assert_ne!(intent_hash, fulfillment_hash);
    }
}
