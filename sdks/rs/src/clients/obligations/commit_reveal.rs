use crate::{
    addresses::BASE_SEPOLIA_ADDRESSES,
    contracts,
    extensions::{AlkahestExtension, ContractModule},
    impl_abi_conversions,
    types::{DecodedAttestation, ProviderContext, SharedWalletProvider},
    utils::contract_safety::ensure_deployed_contract,
};

impl_abi_conversions!(contracts::obligations::CommitRevealObligation::ObligationData);
impl_abi_conversions!(contracts::obligations::CommitRevealObligation::DemandData);

use alloy::{
    primitives::{Address, Bytes, FixedBytes, U256},
    rpc::types::TransactionReceipt,
    signers::local::PrivateKeySigner,
    sol_types::SolValue as _,
};
use serde::{Deserialize, Serialize};

/// Contract addresses needed by the commit-reveal module.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommitRevealObligationAddresses {
    /// EAS contract address.
    pub eas: Address,
    /// CommitRevealObligation contract address.
    pub obligation: Address,
}

/// Rust client module for `CommitRevealObligation`.
///
/// Security note: the underlying contract has not been included in professional
/// manual audits and has only been reviewed by automated audit tooling so far.
#[derive(Clone)]
pub struct CommitRevealObligationModule {
    _signer: PrivateKeySigner,
    wallet_provider: SharedWalletProvider,

    pub addresses: CommitRevealObligationAddresses,
}

impl Default for CommitRevealObligationAddresses {
    /// Returns Base Sepolia commit-reveal addresses.
    fn default() -> Self {
        BASE_SEPOLIA_ADDRESSES.commit_reveal_obligation_addresses
    }
}

/// Contracts addressable through the commit-reveal module.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CommitRevealObligationContract {
    /// EAS contract.
    Eas,
    /// CommitRevealObligation contract.
    Obligation,
}

impl ContractModule for CommitRevealObligationModule {
    type Contract = CommitRevealObligationContract;

    fn address(&self, contract: Self::Contract) -> Address {
        match contract {
            CommitRevealObligationContract::Eas => self.addresses.eas,
            CommitRevealObligationContract::Obligation => self.addresses.obligation,
        }
    }
}

impl CommitRevealObligationModule {
    /// Creates a commit-reveal module with optional custom addresses.
    pub fn new(
        signer: PrivateKeySigner,
        wallet_provider: SharedWalletProvider,
        addresses: Option<CommitRevealObligationAddresses>,
    ) -> eyre::Result<Self> {
        Ok(CommitRevealObligationModule {
            _signer: signer,
            wallet_provider,
            addresses: addresses.unwrap_or_default(),
        })
    }

    /// Loads a fulfillment attestation and decodes its commit-reveal obligation data.
    pub async fn get_obligation(
        &self,
        uid: FixedBytes<32>,
    ) -> eyre::Result<
        DecodedAttestation<contracts::obligations::CommitRevealObligation::ObligationData>,
    > {
        let eas_contract = contracts::IEAS::new(self.addresses.eas, &*self.wallet_provider);

        let attestation = eas_contract.getAttestation(uid).call().await?;
        let obligation_data =
            contracts::obligations::CommitRevealObligation::ObligationData::abi_decode(
                &attestation.data,
            )?;

        Ok(DecodedAttestation {
            attestation,
            data: obligation_data,
        })
    }

    /// Decodes ABI-encoded commit-reveal obligation data.
    pub fn decode(
        obligation_data: &Bytes,
    ) -> eyre::Result<contracts::obligations::CommitRevealObligation::ObligationData> {
        let data = contracts::obligations::CommitRevealObligation::ObligationData::abi_decode(
            obligation_data.as_ref(),
        )?;
        Ok(data)
    }

    /// Encodes commit-reveal obligation data.
    pub fn encode(
        obligation_data: &contracts::obligations::CommitRevealObligation::ObligationData,
    ) -> Bytes {
        contracts::obligations::CommitRevealObligation::ObligationData::abi_encode(obligation_data)
            .into()
    }

    /// Decodes ABI-encoded commit-reveal demand data.
    pub fn decode_demand(
        demand_data: &Bytes,
    ) -> eyre::Result<contracts::obligations::CommitRevealObligation::DemandData> {
        let data = contracts::obligations::CommitRevealObligation::DemandData::abi_decode(
            demand_data.as_ref(),
        )?;
        Ok(data)
    }

    /// Encodes commit-reveal demand data.
    pub fn encode_demand(
        demand_data: &contracts::obligations::CommitRevealObligation::DemandData,
    ) -> Bytes {
        contracts::obligations::CommitRevealObligation::DemandData::abi_encode(demand_data).into()
    }

    /// Reveals committed data and creates a fulfillment attestation.
    pub async fn do_obligation(
        &self,
        data: contracts::obligations::CommitRevealObligation::ObligationData,
        ref_uid: Option<FixedBytes<32>>,
    ) -> eyre::Result<TransactionReceipt> {
        let contract = contracts::obligations::CommitRevealObligation::new(
            self.addresses.obligation,
            &*self.wallet_provider,
        );

        let receipt = contract
            .doObligation_0(data, ref_uid.unwrap_or(FixedBytes::<32>::default()))
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Reveals committed data and creates a fulfillment attestation for an explicit recipient.
    pub async fn do_obligation_for(
        &self,
        data: contracts::obligations::CommitRevealObligation::ObligationData,
        recipient: Address,
        ref_uid: Option<FixedBytes<32>>,
    ) -> eyre::Result<TransactionReceipt> {
        let contract = contracts::obligations::CommitRevealObligation::new(
            self.addresses.obligation,
            &*self.wallet_provider,
        );

        let receipt = contract
            .doObligationFor_0(
                data,
                recipient,
                ref_uid.unwrap_or(FixedBytes::<32>::default()),
            )
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Creates an obligation attestation using pre-encoded bytes.
    pub async fn do_obligation_raw(
        &self,
        data: Bytes,
        expiration_time: u64,
        ref_uid: Option<FixedBytes<32>>,
        value: U256,
    ) -> eyre::Result<TransactionReceipt> {
        ensure_deployed_contract(self.addresses.obligation, "CommitRevealObligation")?;
        let contract = contracts::obligations::CommitRevealObligation::new(
            self.addresses.obligation,
            &*self.wallet_provider,
        );

        let receipt = contract
            .doObligationRaw(
                data,
                expiration_time,
                ref_uid.unwrap_or(FixedBytes::<32>::default()),
            )
            .value(value)
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Reveals committed data and collects the referenced escrow in one transaction.
    pub async fn reveal_and_collect(
        &self,
        data: contracts::obligations::CommitRevealObligation::ObligationData,
        recipient: Address,
        escrow_contract: Address,
        escrow_uid: FixedBytes<32>,
    ) -> eyre::Result<TransactionReceipt> {
        let contract = contracts::obligations::CommitRevealObligation::new(
            self.addresses.obligation,
            &*self.wallet_provider,
        );

        let receipt = contract
            .revealAndCollect_0(data, recipient, escrow_contract, escrow_uid)
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Submits a commitment, locks `bond_amount`, and records the demand reveal deadline.
    pub async fn commit(
        &self,
        commitment: FixedBytes<32>,
        bond_amount: U256,
        commit_deadline: U256,
    ) -> eyre::Result<TransactionReceipt> {
        ensure_deployed_contract(self.addresses.obligation, "CommitRevealObligation")?;
        let contract = contracts::obligations::CommitRevealObligation::new(
            self.addresses.obligation,
            &*self.wallet_provider,
        );

        let receipt = contract
            .commit(commitment, commit_deadline)
            .value(bond_amount)
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Computes the commitment hash expected by the Solidity contract.
    pub async fn compute_commitment(
        &self,
        ref_uid: FixedBytes<32>,
        claimer: Address,
        data: contracts::obligations::CommitRevealObligation::ObligationData,
    ) -> eyre::Result<FixedBytes<32>> {
        let contract = contracts::obligations::CommitRevealObligation::new(
            self.addresses.obligation,
            &*self.wallet_provider,
        );

        let result = contract
            .computeCommitment_1(claimer, ref_uid, data)
            .call()
            .await?;

        Ok(result)
    }

    /// Slashes an unrevealed commitment after its reveal deadline has passed.
    pub async fn slash_bond(&self, commitment: FixedBytes<32>) -> eyre::Result<TransactionReceipt> {
        let contract = contracts::obligations::CommitRevealObligation::new(
            self.addresses.obligation,
            &*self.wallet_provider,
        );

        let receipt = contract
            .slashBond(commitment)
            .send()
            .await?
            .get_receipt()
            .await?;

        Ok(receipt)
    }

    /// Reads the configured recipient of slashed commitment bonds.
    pub async fn slashed_bond_recipient(&self) -> eyre::Result<Address> {
        let contract = contracts::obligations::CommitRevealObligation::new(
            self.addresses.obligation,
            &*self.wallet_provider,
        );

        let result = contract.slashedBondRecipient().call().await?;
        Ok(result)
    }

    /// Reads raw commitment metadata for a commitment hash.
    pub async fn get_commitment(
        &self,
        commitment: FixedBytes<32>,
    ) -> eyre::Result<(u64, u64, Address, U256, U256)> {
        let contract = contracts::obligations::CommitRevealObligation::new(
            self.addresses.obligation,
            &*self.wallet_provider,
        );

        let result = contract.commitments(commitment).call().await?;
        Ok((
            result.commitBlock,
            result.commitTimestamp,
            result.committer,
            result.bondAmount,
            result.commitDeadline,
        ))
    }

    /// Returns whether a commitment bond has already been returned or slashed.
    pub async fn is_commitment_claimed(&self, commitment: FixedBytes<32>) -> eyre::Result<bool> {
        let contract = contracts::obligations::CommitRevealObligation::new(
            self.addresses.obligation,
            &*self.wallet_provider,
        );

        let result = contract.commitmentClaimed(commitment).call().await?;
        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use alloy::primitives::{Bytes, FixedBytes};

    #[test]
    fn test_encode_decode_roundtrip() {
        let data = contracts::obligations::CommitRevealObligation::ObligationData {
            payload: Bytes::from(vec![0xde, 0xad, 0xbe, 0xef]),
            salt: FixedBytes::<32>::from([0x11; 32]),
            schema: FixedBytes::<32>::from([0x44; 32]),
        };

        let encoded = CommitRevealObligationModule::encode(&data);
        let decoded = CommitRevealObligationModule::decode(&encoded).unwrap();

        assert_eq!(decoded.payload, data.payload);
        assert_eq!(decoded.salt, data.salt);
        assert_eq!(decoded.schema, data.schema);
    }

    #[test]
    fn test_encode_decode_empty_payload() {
        let data = contracts::obligations::CommitRevealObligation::ObligationData {
            payload: Bytes::new(),
            salt: FixedBytes::<32>::from([0x11; 32]),
            schema: FixedBytes::<32>::default(),
        };

        let encoded = CommitRevealObligationModule::encode(&data);
        let decoded = CommitRevealObligationModule::decode(&encoded).unwrap();

        assert_eq!(decoded.payload, data.payload);
        assert_eq!(decoded.salt, data.salt);
        assert_eq!(decoded.schema, data.schema);
    }

    #[test]
    fn test_encode_decode_large_payload() {
        let large_payload = vec![0xab; 1000];
        let data = contracts::obligations::CommitRevealObligation::ObligationData {
            payload: Bytes::from(large_payload.clone()),
            salt: FixedBytes::<32>::from([0x11; 32]),
            schema: FixedBytes::<32>::from([0x44; 32]),
        };

        let encoded = CommitRevealObligationModule::encode(&data);
        let decoded = CommitRevealObligationModule::decode(&encoded).unwrap();

        assert_eq!(decoded.payload.as_ref(), large_payload.as_slice());
    }

    #[test]
    fn test_deterministic_encoding() {
        let data = contracts::obligations::CommitRevealObligation::ObligationData {
            payload: Bytes::from(vec![0xde, 0xad, 0xbe, 0xef]),
            salt: FixedBytes::<32>::from([0x11; 32]),
            schema: FixedBytes::<32>::from([0x44; 32]),
        };

        let encoded1 = CommitRevealObligationModule::encode(&data);
        let encoded2 = CommitRevealObligationModule::encode(&data);
        assert_eq!(encoded1, encoded2);
    }

    #[test]
    fn test_roundtrip_encode_decode_encode() {
        let data = contracts::obligations::CommitRevealObligation::ObligationData {
            payload: Bytes::from(vec![0xde, 0xad, 0xbe, 0xef]),
            salt: FixedBytes::<32>::from([0x11; 32]),
            schema: FixedBytes::<32>::from([0x44; 32]),
        };

        let encoded1 = CommitRevealObligationModule::encode(&data);
        let decoded = CommitRevealObligationModule::decode(&encoded1).unwrap();
        let encoded2 = CommitRevealObligationModule::encode(&decoded);
        assert_eq!(encoded1, encoded2);
    }

    #[test]
    fn test_encode_decode_demand_roundtrip() {
        let data = contracts::obligations::CommitRevealObligation::DemandData {
            bondAmount: U256::from(10_000_000_000_000_000u64),
            commitDeadline: U256::from(3600u64),
        };

        let encoded = CommitRevealObligationModule::encode_demand(&data);
        let decoded = CommitRevealObligationModule::decode_demand(&encoded).unwrap();

        assert_eq!(decoded.bondAmount, data.bondAmount);
        assert_eq!(decoded.commitDeadline, data.commitDeadline);
    }

    #[test]
    fn test_default_addresses() {
        let addresses = CommitRevealObligationAddresses::default();
        assert_ne!(addresses.eas, Address::ZERO);
        assert_ne!(addresses.obligation, Address::ZERO);
    }

    #[test]
    fn test_contract_module_addresses() {
        let _signer = PrivateKeySigner::random();
        // We can't easily create a SharedWalletProvider in unit tests,
        // so just verify the addresses struct and contract enum
        let addresses = CommitRevealObligationAddresses::default();
        assert_ne!(
            addresses.eas, addresses.obligation,
            "EAS and obligation addresses should differ"
        );
    }
}

impl AlkahestExtension for CommitRevealObligationModule {
    type Config = CommitRevealObligationAddresses;

    async fn init(
        signer: PrivateKeySigner,
        providers: ProviderContext,
        config: Option<Self::Config>,
    ) -> eyre::Result<Self> {
        Self::new(signer, providers.wallet.clone(), config)
    }
}
