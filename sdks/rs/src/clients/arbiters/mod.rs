use crate::{
    addresses::BASE_SEPOLIA_ADDRESSES,
    contracts,
    extensions::{AlkahestExtension, ContractModule},
    impl_abi_conversions, impl_from_attestation,
    types::{SharedPublicProvider, SharedWalletProvider},
};

// Implement ABI conversions for core arbiter DemandData types
impl_abi_conversions!(contracts::arbiters::TrustedOracleArbiter::DemandData);
impl_abi_conversions!(contracts::arbiters::CommitmentTrustedOracleArbiter::DemandData);
impl_abi_conversions!(contracts::arbiters::ERC8004Arbiter::DemandData);

// Implement From<IEAS::Attestation> for core arbiter Attestation types
impl_from_attestation!(contracts::arbiters::TrivialArbiter::Attestation);
impl_from_attestation!(contracts::arbiters::ReferencesEscrowArbiter::Attestation);
impl_from_attestation!(contracts::arbiters::TrustedOracleArbiter::Attestation);
impl_from_attestation!(contracts::arbiters::CommitmentTrustedOracleArbiter::Attestation);
impl_from_attestation!(contracts::arbiters::IntrinsicsArbiter::Attestation);
use alloy::{
    primitives::{Address, Bytes, FixedBytes, keccak256},
    signers::local::PrivateKeySigner,
    sol_types::SolValue as _,
};
use serde::{Deserialize, Serialize};

mod attestation_properties;
mod codec;
mod confirmation;
mod logical;
mod trusted_oracle;

pub use codec::{ArbiterDemandCodec, ArbiterDemandCodecRegistry, DecodedExtensionDemand};

// Re-export confirmation types
pub use confirmation::ConfirmationArbiterType;

// Re-export logical APIs
pub use logical::{
    AllArbiter, AnyArbiter, DecodedAllArbiterDemandData, DecodedAnyArbiterDemandData, Logical,
};

// Re-export trusted oracle module (with backwards-compatible aliases)
pub use trusted_oracle::{
    ArbitrateManyResult, ArbitrationMode, AttestationWithDemand, Decision, OracleAddresses,
    OracleModule, TrustedOracle, TrustedOracleAddresses, TrustedOracleModule,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArbitersAddresses {
    pub eas: Address,
    pub trivial_arbiter: Address,
    pub trusted_oracle_arbiter: Address,
    pub commitment_trusted_oracle_arbiter: Address,
    pub intrinsics_arbiter: Address,
    pub erc8004_arbiter: Address,
    pub references_escrow_arbiter: Address,
    // Logical arbiters
    pub any_arbiter: Address,
    pub all_arbiter: Address,
    // Attestation property arbiters (non-composing only - composing arbiters removed)
    pub attester_arbiter: Address,
    pub expiration_time_after_arbiter: Address,
    pub expiration_time_before_arbiter: Address,
    pub expiration_time_equal_arbiter: Address,
    pub recipient_arbiter: Address,
    pub ref_uid_arbiter: Address,
    pub revocable_arbiter: Address,
    pub schema_arbiter: Address,
    pub time_after_arbiter: Address,
    pub time_before_arbiter: Address,
    pub time_equal_arbiter: Address,
    pub uid_arbiter: Address,
    // Confirmation arbiters (new naming convention)
    pub exclusive_revocable_confirmation_arbiter: Address,
    pub exclusive_unrevocable_confirmation_arbiter: Address,
    pub nonexclusive_revocable_confirmation_arbiter: Address,
    pub nonexclusive_unrevocable_confirmation_arbiter: Address,
}

#[derive(Clone)]
pub struct ArbitersModule {
    signer: PrivateKeySigner,
    pub(crate) public_provider: SharedPublicProvider,
    pub(crate) wallet_provider: SharedWalletProvider,
    /// Inherited from the parent ``AlkahestClient``. Threaded through to
    /// confirmation arbiter ``wait_for_*`` methods so HTTP polling honors
    /// the client's configured interval.
    pub(crate) poll_interval: std::time::Duration,

    pub addresses: ArbitersAddresses,
    pub demand_codecs: ArbiterDemandCodecRegistry,
}

impl Default for ArbitersAddresses {
    fn default() -> Self {
        BASE_SEPOLIA_ADDRESSES.arbiters_addresses
    }
}

pub fn default_demand_codecs(addresses: &ArbitersAddresses) -> ArbiterDemandCodecRegistry {
    let mut registry = ArbiterDemandCodecRegistry::new();

    registry.register_fn(addresses.trivial_arbiter, |_, _, _: Bytes| {
        Ok(DecodedDemand::TrivialArbiter)
    });
    registry.register_fn(addresses.intrinsics_arbiter, |_, _, _: Bytes| {
        Ok(DecodedDemand::IntrinsicsArbiter)
    });
    registry.register_fn(addresses.references_escrow_arbiter, |_, _, _: Bytes| {
        Ok(DecodedDemand::ReferencesEscrowArbiter)
    });
    registry.register_fn(addresses.trusted_oracle_arbiter, |_, _, demand: Bytes| {
        let demand: contracts::arbiters::TrustedOracleArbiter::DemandData = demand.try_into()?;
        Ok(DecodedDemand::TrustedOracle(demand))
    });
    registry.register_fn(
        addresses.commitment_trusted_oracle_arbiter,
        |_, _, demand: Bytes| {
            let demand: contracts::arbiters::CommitmentTrustedOracleArbiter::DemandData =
                demand.try_into()?;
            Ok(DecodedDemand::CommitmentTrustedOracle(demand))
        },
    );
    registry.register_fn(addresses.erc8004_arbiter, |_, _, demand: Bytes| {
        let demand: contracts::arbiters::ERC8004Arbiter::DemandData = demand.try_into()?;
        Ok(DecodedDemand::ERC8004Arbiter(demand))
    });
    registry.register_fn(
        addresses.any_arbiter,
        |registry: &ArbiterDemandCodecRegistry, _, demand: Bytes| {
            let demand: contracts::arbiters::logical::AnyArbiter::DemandData = demand.try_into()?;
            Ok(DecodedDemand::AnyArbiter(
                logical::decode_any_arbiter_demands_with_registry(registry, demand)?,
            ))
        },
    );
    registry.register_fn(
        addresses.all_arbiter,
        |registry: &ArbiterDemandCodecRegistry, _, demand: Bytes| {
            let demand: contracts::arbiters::logical::AllArbiter::DemandData = demand.try_into()?;
            Ok(DecodedDemand::AllArbiter(
                logical::decode_all_arbiter_demands_with_registry(registry, demand)?,
            ))
        },
    );
    registry.register_fn(addresses.attester_arbiter, |_, _, demand: Bytes| {
        let demand: contracts::arbiters::attestation_properties::AttesterArbiter::DemandData =
            demand.try_into()?;
        Ok(DecodedDemand::AttesterArbiter(demand))
    });
    registry.register_fn(
        addresses.expiration_time_after_arbiter,
        |_, _, demand: Bytes| {
            let demand: contracts::arbiters::attestation_properties::ExpirationTimeAfterArbiter::DemandData = demand.try_into()?;
            Ok(DecodedDemand::ExpirationTimeAfterArbiter(demand))
        },
    );
    registry.register_fn(
        addresses.expiration_time_before_arbiter,
        |_, _, demand: Bytes| {
            let demand: contracts::arbiters::attestation_properties::ExpirationTimeBeforeArbiter::DemandData = demand.try_into()?;
            Ok(DecodedDemand::ExpirationTimeBeforeArbiter(demand))
        },
    );
    registry.register_fn(
        addresses.expiration_time_equal_arbiter,
        |_, _, demand: Bytes| {
            let demand: contracts::arbiters::attestation_properties::ExpirationTimeEqualArbiter::DemandData = demand.try_into()?;
            Ok(DecodedDemand::ExpirationTimeEqualArbiter(demand))
        },
    );
    registry.register_fn(addresses.recipient_arbiter, |_, _, demand: Bytes| {
        let demand: contracts::arbiters::attestation_properties::RecipientArbiter::DemandData =
            demand.try_into()?;
        Ok(DecodedDemand::RecipientArbiter(demand))
    });
    registry.register_fn(addresses.ref_uid_arbiter, |_, _, demand: Bytes| {
        let demand: contracts::arbiters::attestation_properties::RefUidArbiter::DemandData =
            demand.try_into()?;
        Ok(DecodedDemand::RefUidArbiter(demand))
    });
    registry.register_fn(addresses.revocable_arbiter, |_, _, demand: Bytes| {
        let demand: contracts::arbiters::attestation_properties::RevocableArbiter::DemandData =
            demand.try_into()?;
        Ok(DecodedDemand::RevocableArbiter(demand))
    });
    registry.register_fn(addresses.schema_arbiter, |_, _, demand: Bytes| {
        let demand: contracts::arbiters::attestation_properties::SchemaArbiter::DemandData =
            demand.try_into()?;
        Ok(DecodedDemand::SchemaArbiter(demand))
    });
    registry.register_fn(addresses.time_after_arbiter, |_, _, demand: Bytes| {
        let demand: contracts::arbiters::attestation_properties::TimeAfterArbiter::DemandData =
            demand.try_into()?;
        Ok(DecodedDemand::TimeAfterArbiter(demand))
    });
    registry.register_fn(addresses.time_before_arbiter, |_, _, demand: Bytes| {
        let demand: contracts::arbiters::attestation_properties::TimeBeforeArbiter::DemandData =
            demand.try_into()?;
        Ok(DecodedDemand::TimeBeforeArbiter(demand))
    });
    registry.register_fn(addresses.time_equal_arbiter, |_, _, demand: Bytes| {
        let demand: contracts::arbiters::attestation_properties::TimeEqualArbiter::DemandData =
            demand.try_into()?;
        Ok(DecodedDemand::TimeEqualArbiter(demand))
    });
    registry.register_fn(addresses.uid_arbiter, |_, _, demand: Bytes| {
        let demand: contracts::arbiters::attestation_properties::UidArbiter::DemandData =
            demand.try_into()?;
        Ok(DecodedDemand::UidArbiter(demand))
    });

    registry
}

/// Available contracts in the Arbiters module
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ArbitersContract {
    /// EAS (Ethereum Attestation Service) contract
    Eas,
    /// Trivial arbiter (always accepts)
    TrivialArbiter,
    /// Trusted oracle arbiter
    TrustedOracleArbiter,
    /// Trusted oracle arbiter for pre-attestation intent approvals.
    ///
    /// Security note: the underlying contract has not been included in
    /// professional manual audits and has only been reviewed by automated audit
    /// tooling so far.
    CommitmentTrustedOracleArbiter,
    /// Intrinsics arbiter
    IntrinsicsArbiter,
    /// ERC8004 arbiter
    ERC8004Arbiter,
    /// References escrow arbiter.
    ///
    /// Security note: the underlying contract has not been included in
    /// professional manual audits and has only been reviewed by automated audit
    /// tooling so far.
    ReferencesEscrowArbiter,
    /// Any arbiter (logical OR)
    AnyArbiter,
    /// All arbiter (logical AND)
    AllArbiter,
    /// Recipient arbiter (checks recipient address)
    RecipientArbiter,
    /// Attester arbiter
    AttesterArbiter,
    /// Schema arbiter
    SchemaArbiter,
    /// UID arbiter (checks specific attestation UID)
    UidArbiter,
    /// Reference UID arbiter
    RefUidArbiter,
    /// Revocable arbiter
    RevocableArbiter,
    /// Time after arbiter
    TimeAfterArbiter,
    /// Time before arbiter
    TimeBeforeArbiter,
    /// Time equal arbiter
    TimeEqualArbiter,
    /// Expiration time after arbiter
    ExpirationTimeAfterArbiter,
    /// Expiration time before arbiter
    ExpirationTimeBeforeArbiter,
    /// Expiration time equal arbiter
    ExpirationTimeEqualArbiter,
    /// Exclusive revocable confirmation arbiter
    ExclusiveRevocableConfirmationArbiter,
    /// Exclusive unrevocable confirmation arbiter
    ExclusiveUnrevocableConfirmationArbiter,
    /// Nonexclusive revocable confirmation arbiter
    NonexclusiveRevocableConfirmationArbiter,
    /// Nonexclusive unrevocable confirmation arbiter
    NonexclusiveUnrevocableConfirmationArbiter,
}

impl ContractModule for ArbitersModule {
    type Contract = ArbitersContract;

    fn address(&self, contract: Self::Contract) -> Address {
        match contract {
            ArbitersContract::Eas => self.addresses.eas,
            ArbitersContract::TrivialArbiter => self.addresses.trivial_arbiter,
            ArbitersContract::TrustedOracleArbiter => self.addresses.trusted_oracle_arbiter,
            ArbitersContract::CommitmentTrustedOracleArbiter => {
                self.addresses.commitment_trusted_oracle_arbiter
            }
            ArbitersContract::IntrinsicsArbiter => self.addresses.intrinsics_arbiter,
            ArbitersContract::ERC8004Arbiter => self.addresses.erc8004_arbiter,
            ArbitersContract::ReferencesEscrowArbiter => self.addresses.references_escrow_arbiter,
            ArbitersContract::AnyArbiter => self.addresses.any_arbiter,
            ArbitersContract::AllArbiter => self.addresses.all_arbiter,
            ArbitersContract::RecipientArbiter => self.addresses.recipient_arbiter,
            ArbitersContract::AttesterArbiter => self.addresses.attester_arbiter,
            ArbitersContract::SchemaArbiter => self.addresses.schema_arbiter,
            ArbitersContract::UidArbiter => self.addresses.uid_arbiter,
            ArbitersContract::RefUidArbiter => self.addresses.ref_uid_arbiter,
            ArbitersContract::RevocableArbiter => self.addresses.revocable_arbiter,
            ArbitersContract::TimeAfterArbiter => self.addresses.time_after_arbiter,
            ArbitersContract::TimeBeforeArbiter => self.addresses.time_before_arbiter,
            ArbitersContract::TimeEqualArbiter => self.addresses.time_equal_arbiter,
            ArbitersContract::ExpirationTimeAfterArbiter => {
                self.addresses.expiration_time_after_arbiter
            }
            ArbitersContract::ExpirationTimeBeforeArbiter => {
                self.addresses.expiration_time_before_arbiter
            }
            ArbitersContract::ExpirationTimeEqualArbiter => {
                self.addresses.expiration_time_equal_arbiter
            }
            ArbitersContract::ExclusiveRevocableConfirmationArbiter => {
                self.addresses.exclusive_revocable_confirmation_arbiter
            }
            ArbitersContract::ExclusiveUnrevocableConfirmationArbiter => {
                self.addresses.exclusive_unrevocable_confirmation_arbiter
            }
            ArbitersContract::NonexclusiveRevocableConfirmationArbiter => {
                self.addresses.nonexclusive_revocable_confirmation_arbiter
            }
            ArbitersContract::NonexclusiveUnrevocableConfirmationArbiter => {
                self.addresses.nonexclusive_unrevocable_confirmation_arbiter
            }
        }
    }
}

impl AlkahestExtension for ArbitersModule {
    type Config = ArbitersAddresses;

    async fn init(
        _signer: alloy::signers::local::PrivateKeySigner,
        providers: crate::types::ProviderContext,
        config: Option<Self::Config>,
    ) -> eyre::Result<Self> {
        Self::new(
            _signer,
            providers.public.clone(),
            providers.wallet.clone(),
            providers.poll_interval,
            config,
        )
    }
}

impl ArbitersModule {
    pub fn new(
        signer: PrivateKeySigner,
        public_provider: SharedPublicProvider,
        wallet_provider: SharedWalletProvider,
        poll_interval: std::time::Duration,
        addresses: Option<ArbitersAddresses>,
    ) -> eyre::Result<Self> {
        let addresses = addresses.unwrap_or_default();
        let demand_codecs = default_demand_codecs(&addresses);

        Ok(ArbitersModule {
            signer,
            public_provider,
            wallet_provider,
            poll_interval,
            addresses,
            demand_codecs,
        })
    }

    pub fn demand_codecs(&self) -> &ArbiterDemandCodecRegistry {
        &self.demand_codecs
    }

    pub fn demand_codecs_mut(&mut self) -> &mut ArbiterDemandCodecRegistry {
        &mut self.demand_codecs
    }

    pub fn register_demand_codec<C>(&mut self, arbiter: Address, codec: C) -> &mut Self
    where
        C: ArbiterDemandCodec + 'static,
    {
        self.demand_codecs.register(arbiter, codec);
        self
    }

    /// Access trusted oracle arbiter API for arbitration functionality
    ///
    /// # Example
    /// ```rust,ignore
    /// let receipt = arbiters_module.trusted_oracle().arbitrate_for_demand(obligation, demand, true).await?;
    /// let event = arbiters_module.trusted_oracle().wait_for_arbitration(oracle, obligation, None).await?;
    /// ```
    pub fn trusted_oracle(&self) -> trusted_oracle::TrustedOracle<'_> {
        trusted_oracle::TrustedOracle::new(self)
    }

    pub fn encode_erc8004_demand(
        demand: &contracts::arbiters::ERC8004Arbiter::DemandData,
    ) -> Bytes {
        demand.abi_encode().into()
    }

    pub fn decode_erc8004_demand(
        demand: &Bytes,
    ) -> eyre::Result<contracts::arbiters::ERC8004Arbiter::DemandData> {
        Ok(contracts::arbiters::ERC8004Arbiter::DemandData::abi_decode(
            demand,
        )?)
    }

    pub fn erc8004_request_hash_for(uid: FixedBytes<32>, data: &Bytes) -> FixedBytes<32> {
        let encoded = (uid, data.clone()).abi_encode();
        keccak256(encoded)
    }
}

/// Decoded demand data from AllArbiter sub-demands
#[derive(Debug, Clone)]
pub enum DecodedDemand {
    // Core arbiters (no demand data)
    TrivialArbiter,
    IntrinsicsArbiter,
    ReferencesEscrowArbiter,

    // Core arbiters (with demand data)
    TrustedOracle(contracts::arbiters::TrustedOracleArbiter::DemandData),
    CommitmentTrustedOracle(contracts::arbiters::CommitmentTrustedOracleArbiter::DemandData),
    ERC8004Arbiter(contracts::arbiters::ERC8004Arbiter::DemandData),

    // Logical arbiters
    AnyArbiter(DecodedAnyArbiterDemandData),
    AllArbiter(DecodedAllArbiterDemandData),

    // Attestation property arbiters (non-composing only)
    AttesterArbiter(contracts::arbiters::attestation_properties::AttesterArbiter::DemandData),
    ExpirationTimeAfterArbiter(
        contracts::arbiters::attestation_properties::ExpirationTimeAfterArbiter::DemandData,
    ),
    ExpirationTimeBeforeArbiter(
        contracts::arbiters::attestation_properties::ExpirationTimeBeforeArbiter::DemandData,
    ),
    ExpirationTimeEqualArbiter(
        contracts::arbiters::attestation_properties::ExpirationTimeEqualArbiter::DemandData,
    ),
    RecipientArbiter(contracts::arbiters::attestation_properties::RecipientArbiter::DemandData),
    RefUidArbiter(contracts::arbiters::attestation_properties::RefUidArbiter::DemandData),
    RevocableArbiter(contracts::arbiters::attestation_properties::RevocableArbiter::DemandData),
    SchemaArbiter(contracts::arbiters::attestation_properties::SchemaArbiter::DemandData),
    TimeAfterArbiter(contracts::arbiters::attestation_properties::TimeAfterArbiter::DemandData),
    TimeBeforeArbiter(contracts::arbiters::attestation_properties::TimeBeforeArbiter::DemandData),
    TimeEqualArbiter(contracts::arbiters::attestation_properties::TimeEqualArbiter::DemandData),
    UidArbiter(contracts::arbiters::attestation_properties::UidArbiter::DemandData),

    // Unknown arbiter
    Unknown {
        arbiter: Address,
        raw_data: alloy::primitives::Bytes,
    },

    // Extension arbiter decoded by a caller-provided registry entry.
    Extension(DecodedExtensionDemand),
}

impl DecodedDemand {
    pub fn extension<T>(arbiter: Address, raw_data: Bytes, data: T) -> Self
    where
        T: std::any::Any + Send + Sync,
    {
        Self::Extension(DecodedExtensionDemand::new(arbiter, raw_data, data))
    }
}

impl ArbitersModule {
    /// Generic function to decode a single arbiter demand based on its address
    pub fn decode_arbiter_demand(
        &self,
        arbiter_addr: Address,
        demand_bytes: &alloy::primitives::Bytes,
    ) -> eyre::Result<DecodedDemand> {
        self.demand_codecs.decode(arbiter_addr, demand_bytes)
    }

    /// Access logical arbiters API for structured decode functionality
    ///
    /// # Example
    /// ```rust,ignore
    /// let decoded_all = arbiters_module.logical().all().decode(all_demand_data)?;
    /// let decoded_any = arbiters_module.logical().any().decode(any_demand_data)?;
    /// ```
    pub fn logical(&self) -> logical::Logical<'_> {
        logical::Logical::new(self)
    }

    /// Access attestation properties arbiters API for structured decode functionality
    ///
    /// # Example
    /// ```rust,ignore
    /// let decoded_attester = arbiters_module.attestation_properties().attester().decode(attester_demand_data)?;
    /// let decoded_recipient = arbiters_module.attestation_properties().recipient().decode(recipient_demand_data)?;
    /// let decoded_schema = arbiters_module.attestation_properties().schema().decode(schema_demand_data)?;
    /// ```
    pub fn attestation_properties(&self) -> attestation_properties::AttestationProperties<'_> {
        attestation_properties::AttestationProperties::new(self)
    }
}

#[cfg(test)]
mod tests {
    use alloy::primitives::{Bytes, FixedBytes, address};
    use alloy::sol_types::SolValue as _;

    use super::*;

    #[derive(Debug, PartialEq, Eq)]
    struct TestExtensionDemand {
        payload: Vec<u8>,
    }

    struct TestExtensionCodec;

    impl ArbiterDemandCodec for TestExtensionCodec {
        fn decode(
            &self,
            _registry: &ArbiterDemandCodecRegistry,
            arbiter: Address,
            demand: Bytes,
        ) -> eyre::Result<DecodedDemand> {
            Ok(DecodedDemand::extension(
                arbiter,
                demand.clone(),
                TestExtensionDemand {
                    payload: demand.to_vec(),
                },
            ))
        }
    }

    #[test]
    fn erc8004_demand_encode_decode_roundtrip() {
        let demand = contracts::arbiters::ERC8004Arbiter::DemandData {
            validationRegistry: address!("0x1111111111111111111111111111111111111111"),
            validatorAddress: address!("0x2222222222222222222222222222222222222222"),
            minResponse: 80,
            data: Bytes::from_static(&[0x12, 0x34]),
        };

        let encoded = ArbitersModule::encode_erc8004_demand(&demand);
        let decoded = ArbitersModule::decode_erc8004_demand(&encoded).unwrap();

        assert_eq!(decoded.validationRegistry, demand.validationRegistry);
        assert_eq!(decoded.validatorAddress, demand.validatorAddress);
        assert_eq!(decoded.minResponse, demand.minResponse);
        assert_eq!(decoded.data, demand.data);
    }

    #[test]
    fn erc8004_request_hash_is_nonzero() {
        let hash = ArbitersModule::erc8004_request_hash_for(
            FixedBytes::<32>::repeat_byte(0x11),
            &Bytes::from_static(&[0x12, 0x34]),
        );

        assert_ne!(hash, FixedBytes::<32>::default());
    }

    #[test]
    fn demand_codec_registry_decodes_extensions_inside_logical_arbiters() {
        let addresses = ArbitersAddresses::default();
        let extension_arbiter = address!("0x3333333333333333333333333333333333333333");
        let extension_payload = Bytes::from_static(&[0xab, 0xcd]);
        let all_demand = contracts::arbiters::logical::AllArbiter::DemandData {
            arbiters: vec![addresses.trivial_arbiter, extension_arbiter],
            demands: vec![Bytes::new(), extension_payload.clone()],
        };
        let encoded = all_demand.abi_encode().into();

        let mut registry = default_demand_codecs(&addresses);
        registry.register(extension_arbiter, TestExtensionCodec);

        let decoded = registry.decode(addresses.all_arbiter, &encoded).unwrap();
        let DecodedDemand::AllArbiter(decoded_all) = decoded else {
            panic!("expected AllArbiter demand");
        };

        assert!(matches!(
            decoded_all.demands.first(),
            Some(DecodedDemand::TrivialArbiter)
        ));

        let Some(DecodedDemand::Extension(extension)) = decoded_all.demands.get(1) else {
            panic!("expected extension demand");
        };

        assert_eq!(extension.arbiter, extension_arbiter);
        assert_eq!(extension.raw_data, extension_payload);
        assert_eq!(
            extension.downcast_ref::<TestExtensionDemand>(),
            Some(&TestExtensionDemand {
                payload: vec![0xab, 0xcd],
            })
        );
    }

    #[test]
    fn demand_codec_registry_does_not_register_zero_address() {
        let mut registry = ArbiterDemandCodecRegistry::new();
        registry.register(Address::ZERO, TestExtensionCodec);

        let decoded = registry
            .decode(Address::ZERO, &Bytes::from_static(&[0xab, 0xcd]))
            .unwrap();

        let DecodedDemand::Unknown { arbiter, raw_data } = decoded else {
            panic!("expected zero address arbiter to decode as unknown");
        };

        assert_eq!(arbiter, Address::ZERO);
        assert_eq!(raw_data, Bytes::from_static(&[0xab, 0xcd]));
    }
}
