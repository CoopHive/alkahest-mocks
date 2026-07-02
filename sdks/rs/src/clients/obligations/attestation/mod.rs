//! Attestation obligation module
//!
//! Provides escrow and utility operations for attestation-based obligations.

pub mod escrow;
pub mod util;

pub use escrow::Escrow;
pub use util::Util;

use alloy::primitives::Address;
use alloy::signers::local::PrivateKeySigner;
use serde::{Deserialize, Serialize};

use crate::addresses::BASE_SEPOLIA_ADDRESSES;
use crate::contracts::{
    self, IEAS, obligations::escrow::default_escrow::AttestationEscrowObligation,
    obligations::escrow::unconditional::UnconditionalAttestationEscrowObligation,
};
use crate::extensions::{AlkahestExtension, ContractModule};
use crate::impl_abi_conversions;
use crate::types::SharedWalletProvider;

// --- Attestation request conversion implementations ---

macro_rules! impl_attestation_request {
    ($target:ident) => {
        impl From<IEAS::AttestationRequestData> for $target::AttestationRequestData {
            fn from(data: IEAS::AttestationRequestData) -> Self {
                Self {
                    recipient: data.recipient,
                    expirationTime: data.expirationTime,
                    revocable: data.revocable,
                    refUID: data.refUID,
                    data: data.data,
                    value: data.value,
                }
            }
        }

        impl From<IEAS::AttestationRequest> for $target::AttestationRequest {
            fn from(request: IEAS::AttestationRequest) -> Self {
                Self {
                    schema: request.schema,
                    data: request.data.into(),
                }
            }
        }
    };
}

impl_attestation_request!(AttestationEscrowObligation);
impl_attestation_request!(UnconditionalAttestationEscrowObligation);

// --- ABI conversions for Attestation obligation types ---
impl_abi_conversions!(
    contracts::obligations::escrow::default_escrow::AttestationEscrowObligation::ObligationData
);
impl_abi_conversions!(contracts::obligations::escrow::default_escrow::AttestationReferenceEscrowObligation::ObligationData);
impl_abi_conversions!(contracts::obligations::escrow::unconditional::UnconditionalAttestationEscrowObligation::ObligationData);
impl_abi_conversions!(contracts::obligations::escrow::unconditional::UnconditionalAttestationReferenceEscrowObligation::ObligationData);

/// Macro to implement From<IEAS::Attestation> for arbiter-specific Attestation types.
/// These types have the same structure but are defined separately in each arbiter contract.
/// Use this in arbiter modules that have an Attestation type.
/// Pass the Attestation type directly, e.g., `impl_from_attestation!(TrivialArbiter::Attestation);`
#[macro_export]
macro_rules! impl_from_attestation {
    ($target:ty) => {
        impl From<$crate::contracts::IEAS::Attestation> for $target {
            fn from(attestation: $crate::contracts::IEAS::Attestation) -> Self {
                Self {
                    uid: attestation.uid,
                    schema: attestation.schema,
                    time: attestation.time,
                    expirationTime: attestation.expirationTime,
                    revocationTime: attestation.revocationTime,
                    refUID: attestation.refUID,
                    recipient: attestation.recipient,
                    attester: attestation.attester,
                    revocable: attestation.revocable,
                    data: attestation.data,
                }
            }
        }
    };
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttestationAddresses {
    pub eas: Address,
    pub eas_schema_registry: Address,
    pub atomic_attestation_utils: Address,
    pub escrow_obligation_default: Address,
    pub escrow_obligation_unconditional: Address,
    pub attestation_reference_escrow_obligation_default: Address,
    pub attestation_reference_escrow_obligation_unconditional: Address,
}

#[derive(Clone)]
pub struct AttestationModule {
    _signer: PrivateKeySigner,
    pub(crate) wallet_provider: SharedWalletProvider,
    pub addresses: AttestationAddresses,
}

impl Default for AttestationAddresses {
    fn default() -> Self {
        BASE_SEPOLIA_ADDRESSES.attestation_addresses
    }
}

/// Available contracts in the Attestation module
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AttestationContract {
    /// EAS (Ethereum Attestation Service) contract
    Eas,
    /// EAS Schema Registry contract
    EasSchemaRegistry,
    /// Atomic attestation utilities contract for attestations.
    ///
    /// Security note: the underlying contract has not been included in
    /// professional manual audits and has only been reviewed by automated audit
    /// tooling so far.
    AtomicAttestationUtils,
    /// Default escrow obligation contract for attestations
    DefaultEscrowObligation,
    /// Attestation-reference escrow obligation contract
    ReferenceEscrowObligation,
}

impl ContractModule for AttestationModule {
    type Contract = AttestationContract;

    fn address(&self, contract: Self::Contract) -> Address {
        match contract {
            AttestationContract::Eas => self.addresses.eas,
            AttestationContract::EasSchemaRegistry => self.addresses.eas_schema_registry,
            AttestationContract::AtomicAttestationUtils => self.addresses.atomic_attestation_utils,
            AttestationContract::DefaultEscrowObligation => {
                self.addresses.escrow_obligation_default
            }
            AttestationContract::ReferenceEscrowObligation => {
                self.addresses
                    .attestation_reference_escrow_obligation_default
            }
        }
    }
}

impl AttestationModule {
    /// Creates a new AttestationModule instance.
    pub fn new(
        signer: PrivateKeySigner,
        wallet_provider: SharedWalletProvider,
        addresses: Option<AttestationAddresses>,
    ) -> eyre::Result<Self> {
        Ok(AttestationModule {
            _signer: signer,
            wallet_provider,
            addresses: addresses.unwrap_or_default(),
        })
    }

    /// Access escrow operations.
    pub fn escrow(&self) -> Escrow<'_> {
        Escrow::new(self)
    }

    /// Access utility operations (get_attestation, register_schema, attest)
    pub fn util(&self) -> Util<'_> {
        Util::new(self)
    }
}

impl AlkahestExtension for AttestationModule {
    type Config = AttestationAddresses;
    async fn init(
        signer: PrivateKeySigner,
        providers: crate::types::ProviderContext,
        config: Option<Self::Config>,
    ) -> eyre::Result<Self> {
        Self::new(signer, providers.wallet.clone(), config)
    }
}

#[cfg(test)]
mod tests {
    use alloy::{
        primitives::{Address, Bytes, FixedBytes, U256},
        rpc::types::TransactionReceipt,
        sol,
        sol_types::{SolEvent as _, SolValue as _},
    };
    use std::time::{SystemTime, UNIX_EPOCH};

    use crate::{DefaultAlkahestClient, contracts::obligations::StringObligation};
    use crate::{
        contracts::{self, IEAS},
        extensions::{HasAttestation, HasStringObligation},
        types::ArbiterData,
        utils::{TestContext, setup_test_environment},
    };

    // Helper function to register a schema for testing
    async fn register_test_schema(
        test: &TestContext,
        schema: String,
    ) -> eyre::Result<FixedBytes<32>> {
        let schema_registry = contracts::ISchemaRegistry::new(
            test.addresses
                .clone()
                .attestation_addresses
                .eas_schema_registry,
            test.alice_client.wallet_provider.clone(),
        );

        // Register schema
        let receipt = schema_registry
            .register(schema, Address::ZERO, true)
            .send()
            .await?
            .get_receipt()
            .await?;

        // Extract schema ID from logs
        let schema_id = receipt
            .logs()
            .first()
            .ok_or(eyre::eyre!("No logs found in schema registration receipt"))?
            .topics()
            .get(1)
            .ok_or(eyre::eyre!("No schema ID in log topics"))?
            .clone();

        Ok(schema_id)
    }

    // Helper to create an attestation
    async fn create_attestation(
        test: &TestContext,
        schema_id: FixedBytes<32>,
        recipient: Address,
        data: Bytes,
    ) -> eyre::Result<(TransactionReceipt, FixedBytes<32>)> {
        let expiration = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 86400; // 1 day

        // Create attestation request
        let attestation_request = IEAS::AttestationRequest {
            schema: schema_id,
            data: IEAS::AttestationRequestData {
                recipient,
                expirationTime: expiration.into(),
                revocable: true,
                refUID: FixedBytes::<32>::default(),
                data,
                value: U256::ZERO,
            },
        };

        // Attest
        let eas_contract = contracts::IEAS::new(
            test.addresses.clone().attestation_addresses.eas,
            &test.alice_client.wallet_provider,
        );

        let receipt = eas_contract
            .attest(attestation_request.clone())
            .send()
            .await?
            .get_receipt()
            .await?;

        // Extract attestation UID from receipt
        let uid = DefaultAlkahestClient::get_attested_event(receipt.clone())?.uid;

        Ok((receipt, uid))
    }

    #[tokio::test]
    async fn test_decode_default_escrow_obligation() -> eyre::Result<()> {
        // Test setup
        let test = setup_test_environment().await?;

        // Create sample obligation data
        let attestation_request = IEAS::AttestationRequest {
            schema: FixedBytes::<32>::default(),
            data: IEAS::AttestationRequestData {
                recipient: test.bob.address(),
                expirationTime: 123456789,
                revocable: true,
                refUID: FixedBytes::<32>::default(),
                data: Bytes::from(vec![1, 2, 3]),
                value: U256::ZERO,
            },
        };

        let arbiter = test
            .addresses
            .attestation_addresses
            .atomic_attestation_utils;
        let demand = Bytes::from(vec![4, 5, 6]);

        let escrow_data = contracts::obligations::escrow::default_escrow::AttestationEscrowObligation::ObligationData {
            attestation: attestation_request.clone().into(),
            arbiter,
            demand: demand.clone(),
        };

        // Encode the data
        let encoded = escrow_data.abi_encode();

        // Decode the data using TryFrom<Bytes>
        let decoded: contracts::obligations::escrow::default_escrow::AttestationEscrowObligation::ObligationData =
            alloy::primitives::Bytes::from(encoded).try_into()?;

        // Verify decoded data
        assert_eq!(decoded.arbiter, arbiter, "Arbiter should match");
        assert_eq!(decoded.demand, demand, "Demand should match");
        assert_eq!(
            decoded.attestation.schema, attestation_request.schema,
            "Schema should match"
        );
        assert_eq!(
            decoded.attestation.data.recipient, attestation_request.data.recipient,
            "Recipient should match"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_decode_reference_escrow_obligation() -> eyre::Result<()> {
        // Test setup
        let test = setup_test_environment().await?;

        // Create sample obligation data
        let attestation_uid = FixedBytes::<32>::from_slice(&[1u8; 32]);
        let arbiter = test
            .addresses
            .attestation_addresses
            .atomic_attestation_utils;
        let demand = Bytes::from(vec![4, 5, 6]);

        let escrow_data = contracts::obligations::escrow::default_escrow::AttestationReferenceEscrowObligation::ObligationData {
            referencedAttestationUid: attestation_uid,
            arbiter,
            demand: demand.clone(),
            expirationTime: 0,
        };

        // Encode the data
        let encoded = escrow_data.abi_encode();

        // Decode the data using TryFrom<Bytes>
        let decoded: contracts::obligations::escrow::default_escrow::AttestationReferenceEscrowObligation::ObligationData =
            alloy::primitives::Bytes::from(encoded).try_into()?;

        // Verify decoded data
        assert_eq!(
            decoded.referencedAttestationUid, attestation_uid,
            "Attestation UID should match"
        );
        assert_eq!(decoded.arbiter, arbiter, "Arbiter should match");
        assert_eq!(decoded.demand, demand, "Demand should match");
        assert_eq!(decoded.expirationTime, 0);

        Ok(())
    }

    #[tokio::test]
    async fn test_get_attestation() -> eyre::Result<()> {
        // Setup test environment
        let test = setup_test_environment().await?;

        // Register a schema
        let schema_id = register_test_schema(
            &test,
            format!(
                "string testData{}",
                SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs()
            ),
        )
        .await?;

        // Create an attestation
        let (_, attestation_uid) = create_attestation(
            &test,
            schema_id,
            test.bob.address(),
            Bytes::from("test attestation data".as_bytes()),
        )
        .await?;

        // Get attestation using the new API
        let attestation = test
            .alice_client
            .attestation()
            .util()
            .get_attestation(attestation_uid)
            .await?;

        // Verify attestation data
        assert_eq!(attestation.uid, attestation_uid, "UID should match");
        assert_eq!(attestation.schema, schema_id, "Schema should match");
        assert_eq!(
            attestation.recipient,
            test.bob.address(),
            "Recipient should match"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_register_schema() -> eyre::Result<()> {
        // Setup test environment
        let test = setup_test_environment().await?;

        // Generate a unique schema name
        let schema = format!(
            "uint256 value{}",
            SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs()
        );

        // Register schema using the new API
        let receipt = test
            .alice_client
            .attestation()
            .util()
            .register_schema(schema.clone(), Address::ZERO, true)
            .await?;

        // Extract schema ID
        let schema_id = receipt
            .logs()
            .first()
            .ok_or(eyre::eyre!("No logs found in schema registration receipt"))?
            .topics()
            .get(1)
            .ok_or(eyre::eyre!("No schema ID in log topics"))?
            .clone();

        // Verify schema ID is not empty
        assert_ne!(
            schema_id,
            FixedBytes::<32>::default(),
            "Schema ID should not be empty"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_attest() -> eyre::Result<()> {
        // Setup test environment
        let test = setup_test_environment().await?;

        sol! {
            struct TestStruct {
                bool value;
            }
        }

        // Register a schema
        let schema_id = register_test_schema(
            &test,
            format!(
                "bool value{}",
                SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs()
            ),
        )
        .await?;

        // Create attestation request
        let expiration = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 86400; // 1 day
        let attestation_request = IEAS::AttestationRequest {
            schema: schema_id,
            data: IEAS::AttestationRequestData {
                recipient: test.bob.address(),
                expirationTime: expiration.into(),
                revocable: true,
                refUID: FixedBytes::<32>::default(),
                data: TestStruct { value: true }.abi_encode().into(),
                value: U256::ZERO,
            },
        };

        // Attest using the new API
        let receipt = test
            .alice_client
            .attestation()
            .util()
            .attest(attestation_request)
            .await?;

        // Extract attestation UID
        let attested_event = DefaultAlkahestClient::get_attested_event(receipt)?;

        // Verify attestation was created
        assert_ne!(
            attested_event.uid,
            FixedBytes::<32>::default(),
            "Attestation UID should not be empty",
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_create_escrow_v1() -> eyre::Result<()> {
        // Setup test environment
        let test = setup_test_environment().await?;

        sol! {
            struct TestStruct {
                string value;
            }
        }

        // Register a schema
        let schema_id = register_test_schema(
            &test,
            format!(
                "string testData{}",
                SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs()
            ),
        )
        .await?;

        // Create attestation request
        let expiration = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 86400; // 1 day
        let attestation_request = IEAS::AttestationRequest {
            schema: schema_id,
            data: IEAS::AttestationRequestData {
                recipient: test.bob.address(),
                expirationTime: expiration.into(),
                revocable: false,
                refUID: FixedBytes::<32>::default(),
                data: TestStruct {
                    value: "test attestation data".to_string(),
                }
                .abi_encode()
                .into(),
                value: U256::ZERO,
            },
        };

        // Create demand data
        let arbiter = test
            .addresses
            .attestation_addresses
            .atomic_attestation_utils;

        let demand = TestStruct {
            value: "test demand".to_string(),
        }
        .abi_encode()
        .into();

        let demand_data = ArbiterData { arbiter, demand };

        // Create escrow expiration
        let escrow_expiration = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 2 * 86400; // 2 days

        // Create escrow using the new API
        let receipt = test
            .alice_client
            .attestation()
            .escrow()
            .default()
            .default()
            .create(attestation_request, &demand_data, escrow_expiration)
            .await?;

        // Extract escrow attestation UID
        let escrow_event = DefaultAlkahestClient::get_attested_event(receipt)?;

        // Verify escrow was created
        assert_ne!(
            escrow_event.uid,
            FixedBytes::<32>::default(),
            "Escrow UID should not be empty"
        );

        // Get the attestation to verify details
        let escrow_attestation = test
            .alice_client
            .attestation()
            .util()
            .get_attestation(escrow_event.uid)
            .await?;

        // Verify escrow attestation details
        assert_eq!(
            escrow_attestation.recipient,
            test.alice.address(),
            "Escrow recipient should be Alice (the creator)"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_create_escrow_v2() -> eyre::Result<()> {
        // Setup test environment
        let test = setup_test_environment().await?;

        sol! {
            struct TestStruct {
                string value;
            }
        }

        // Register a schema
        let schema_id = register_test_schema(
            &test,
            format!(
                "string testData{}",
                SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs()
            ),
        )
        .await?;

        // Create a pre-existing attestation
        let (_, attestation_uid) = create_attestation(
            &test,
            schema_id,
            test.bob.address(),
            TestStruct {
                value: "pre-existing attestation data".to_string(),
            }
            .abi_encode()
            .into(),
        )
        .await?;

        // Create demand data
        let arbiter = test.addresses.arbiters_addresses.trivial_arbiter;

        let demand = TestStruct {
            value: "test demand".to_string(),
        }
        .abi_encode()
        .into();

        let demand_data = ArbiterData { arbiter, demand };

        // Create escrow expiration
        let escrow_expiration = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 86400; // 1 day

        // Create escrow using the reference escrow API
        let receipt = test
            .alice_client
            .attestation()
            .escrow()
            .reference()
            .default()
            .create(attestation_uid, &demand_data, escrow_expiration, 0)
            .await?;

        // Extract escrow attestation UID
        let escrow_event = DefaultAlkahestClient::get_attested_event(receipt)?;

        // Verify escrow was created
        assert_ne!(
            escrow_event.uid,
            FixedBytes::<32>::default(),
            "Escrow UID should not be empty"
        );

        // Get the attestation to verify details
        let escrow_attestation = test
            .alice_client
            .attestation()
            .util()
            .get_attestation(escrow_event.uid)
            .await?;

        // Get the expected schema ID from the contract
        let escrow_contract = contracts::obligations::escrow::default_escrow::AttestationReferenceEscrowObligation::new(
            test.addresses.attestation_addresses.attestation_reference_escrow_obligation_default,
            &test.god_provider,
        );

        let attestation_schema = escrow_contract.ATTESTATION_SCHEMA().call().await?;

        // Verify escrow attestation details
        assert_eq!(
            escrow_attestation.schema, attestation_schema,
            "Schema should match the contract's ATTESTATION_SCHEMA"
        );
        assert_eq!(
            escrow_attestation.recipient,
            test.alice.address(),
            "Escrow recipient should be Alice (the creator)"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_collect_payment_v1() -> eyre::Result<()> {
        // Setup test environment
        let test = setup_test_environment().await?;

        sol! {
            struct TestStruct {
                string value;
            }
        }

        // Register a schema
        let schema_id = register_test_schema(
            &test,
            format!(
                "string testData{}",
                SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs()
            ),
        )
        .await?;

        // Create attestation request for escrow
        let expiration = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 86400; // 1 day
        let attestation_request = IEAS::AttestationRequest {
            schema: schema_id,
            data: IEAS::AttestationRequestData {
                recipient: test.bob.address(),
                expirationTime: expiration.into(),
                revocable: false,
                refUID: FixedBytes::<32>::default(),
                data: TestStruct {
                    value: "test attestation data".to_string(),
                }
                .abi_encode()
                .into(),
                value: U256::ZERO,
            },
        };

        // Create demand data with trivial arbiter (which approves all fulfillments)
        let arbiter = test.addresses.arbiters_addresses.trivial_arbiter;
        let demand = TestStruct {
            value: "test demand".to_string(),
        }
        .abi_encode()
        .into();

        let demand_data = ArbiterData { arbiter, demand };

        // Create escrow using the new API
        let escrow_receipt = test
            .alice_client
            .attestation()
            .escrow()
            .default()
            .default()
            .create(
                attestation_request,
                &demand_data,
                0, // no expiration
            )
            .await?;

        // Extract escrow attestation UID
        let escrow_event = DefaultAlkahestClient::get_attested_event(escrow_receipt)?;
        let escrow_uid = escrow_event.uid;

        // Bob creates a fulfillment using StringObligation (must reference the escrow)
        let fulfillment_receipt = test
            .bob_client
            .string_obligation()
            .do_obligation("fulfillment data".to_string(), None, Some(escrow_uid))
            .await?;

        let fulfillment_event = DefaultAlkahestClient::get_attested_event(fulfillment_receipt)?;
        let fulfillment_uid = fulfillment_event.uid;

        // Bob collects payment using the new API
        let collection_receipt = test
            .bob_client
            .attestation()
            .escrow()
            .default()
            .default()
            .collect(escrow_uid, fulfillment_uid)
            .await?;

        // Extract payment attestation UID
        let payment_event = DefaultAlkahestClient::get_attested_event(collection_receipt)?;
        let payment_uid = payment_event.uid;

        // Verify payment was collected
        assert_ne!(
            payment_uid,
            FixedBytes::<32>::default(),
            "Payment UID should not be empty"
        );

        // Verify escrow attestation was revoked
        let escrow_attestation = test
            .bob_client
            .attestation()
            .util()
            .get_attestation(escrow_uid)
            .await?;
        assert_ne!(
            escrow_attestation.revocationTime, 0,
            "Escrow attestation should be revoked"
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_collect_payment_v2() -> eyre::Result<()> {
        // Setup test environment
        let test = setup_test_environment().await?;

        sol! {
            struct TestStruct {
                string value;
            }
        }

        // Register a schema
        let schema_id = register_test_schema(
            &test,
            format!(
                "string testData{}",
                SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs()
            ),
        )
        .await?;

        // Create a pre-existing attestation
        let (_, attestation_uid) = create_attestation(
            &test,
            schema_id,
            test.bob.address(),
            TestStruct {
                value: "pre-existing attestation data".to_string(),
            }
            .abi_encode()
            .into(),
        )
        .await?;

        // Create demand data
        let arbiter = test.addresses.arbiters_addresses.trivial_arbiter;
        let demand = TestStruct {
            value: "test demand".to_string(),
        }
        .abi_encode()
        .into();
        let demand_data = ArbiterData { arbiter, demand };

        // Create escrow expiration
        let escrow_expiration = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 86400; // 1 day

        // Create escrow using the reference escrow API
        let escrow_receipt = test
            .alice_client
            .attestation()
            .escrow()
            .reference()
            .default()
            .create(attestation_uid, &demand_data, escrow_expiration, 0)
            .await?;

        // Extract escrow attestation UID
        let escrow_event = DefaultAlkahestClient::get_attested_event(escrow_receipt)?;
        let escrow_uid = escrow_event.uid;

        // Bob creates a fulfillment using StringObligation (must reference the escrow)
        let string_obligation = StringObligation::new(
            test.addresses.string_obligation_addresses.obligation,
            &test.bob_client.wallet_provider,
        );

        let fulfillment_receipt = string_obligation
            .doObligation(
                contracts::obligations::StringObligation::ObligationData {
                    item: "fulfillment data".to_string(),
                    schema: alloy::primitives::FixedBytes::default(),
                },
                escrow_uid, // Reference the escrow for default pattern
            )
            .send()
            .await?
            .get_receipt()
            .await?;

        let fulfillment_event = DefaultAlkahestClient::get_attested_event(fulfillment_receipt)?;
        let fulfillment_uid = fulfillment_event.uid;

        // Bob collects payment using the new API
        let collection_receipt = test
            .bob_client
            .attestation()
            .escrow()
            .reference()
            .default()
            .collect(escrow_uid, fulfillment_uid)
            .await?;

        // Extract reference attestation UID
        let validation_event = DefaultAlkahestClient::get_attested_event(collection_receipt)?;
        let validation_uid = validation_event.uid;

        // Verify validation was created
        assert_ne!(
            validation_uid,
            FixedBytes::<32>::default(),
            "Reference attestation UID should not be empty"
        );

        // Get the reference attestation
        let validation_attestation = test
            .bob_client
            .attestation()
            .util()
            .get_attestation(validation_uid)
            .await?;

        // Get the expected reference attestation schema ID from the contract
        let escrow_contract = contracts::obligations::escrow::default_escrow::AttestationReferenceEscrowObligation::new(
            test.addresses.attestation_addresses.attestation_reference_escrow_obligation_default,
            &test.god_provider,
        );

        let reference_schema = escrow_contract
            .REFERENCE_ATTESTATION_SCHEMA()
            .call()
            .await?;

        // Verify reference attestation details
        assert_eq!(
            validation_attestation.schema, reference_schema,
            "Schema should match the contract's REFERENCE_ATTESTATION_SCHEMA"
        );
        assert_eq!(
            validation_attestation.recipient,
            test.bob.address(),
            "Reference attestation recipient should be Bob (who collected payment)"
        );
        assert_eq!(
            validation_attestation.refUID, attestation_uid,
            "Reference UID should be the original attestation"
        );

        // Verify escrow attestation was revoked
        let escrow_attestation = test
            .bob_client
            .attestation()
            .util()
            .get_attestation(escrow_uid)
            .await?;
        assert!(
            escrow_attestation.revocationTime > 0u64.into(),
            "Escrow attestation should be revoked"
        );

        Ok(())
    }
}
