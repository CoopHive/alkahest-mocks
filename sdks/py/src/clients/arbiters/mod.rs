//! Arbiters module
//!
//! This module contains clients for interacting with arbiter contracts:
//! - `trusted_oracle`: Trusted oracle arbiter for oracle-based arbitration
//! - `confirmation`: Confirmation-based arbiters (exclusive/nonexclusive, revocable/unrevocable)
//! - `logical`: Logical arbiters (AllArbiter, AnyArbiter)
//! - `attestation_properties`: Attestation property arbiters (AttesterArbiter, RecipientArbiter, etc.)

pub mod attestation_properties;
pub mod confirmation;
pub mod logical;
pub mod trusted_oracle;

use alkahest_rs::{
    contracts::arbiters::ERC8004Arbiter as ERC8004ArbiterContract, extensions::ArbitersModule,
};
use alloy::primitives::FixedBytes;
use alloy::sol_types::SolValue;
use pyo3::{pyclass, pymethods, PyAny, PyResult, Python};
use pyo3_async_runtimes::tokio::future_into_py;

use crate::{
    contract::PyAttestation,
    error_handling::{map_eyre_to_pyerr, map_parse_to_pyerr},
};

// Re-export main types for backwards compatibility
pub use trusted_oracle::{
    OracleClient, PyArbitrationMode, PyAttestationWithDemand, PyCommitmentArbitrationMadeLog,
    PyCommitmentArbitrationRequestedLog, PyCommitmentTrustedOracleArbiterDemandData, PyDecision,
    PyOracleAddresses, PyOracleAttestation, PyTrustedOracleArbiterDemandData, TrustedOracle,
};

// Re-export confirmation types
pub use confirmation::{
    exclusive_revocable::{ExclusiveRevocable, PyConfirmationMadeLog, PyConfirmationRequestedLog},
    exclusive_unrevocable::ExclusiveUnrevocable,
    nonexclusive_revocable::NonexclusiveRevocable,
    nonexclusive_unrevocable::NonexclusiveUnrevocable,
    Confirmation, PyConfirmationArbiterType,
};

// Re-export logical types
pub use logical::{
    AllArbiter, AllArbiterDemandData, AnyArbiter, AnyArbiterDemandData, Logical,
    PyDecodedAllArbiterDemandData, PyDecodedAnyArbiterDemandData, PyDecodedDemand,
};

// Re-export attestation properties types
pub use attestation_properties::{
    AttestationProperties,
    AttesterArbiter,
    // DemandData types
    AttesterArbiterDemandData,
    ExpirationTimeAfterArbiter,
    ExpirationTimeAfterArbiterDemandData,
    ExpirationTimeBeforeArbiter,
    ExpirationTimeBeforeArbiterDemandData,
    ExpirationTimeEqualArbiter,
    ExpirationTimeEqualArbiterDemandData,
    RecipientArbiter,
    RecipientArbiterDemandData,
    RefUidArbiter,
    RefUidArbiterDemandData,
    RevocableArbiter,
    RevocableArbiterDemandData,
    SchemaArbiter,
    SchemaArbiterDemandData,
    TimeAfterArbiter,
    TimeAfterArbiterDemandData,
    TimeBeforeArbiter,
    TimeBeforeArbiterDemandData,
    TimeEqualArbiter,
    TimeEqualArbiterDemandData,
    UidArbiter,
    UidArbiterDemandData,
};

/// Python representation of ArbitrationMade event
#[pyclass]
#[derive(Clone, Debug)]
pub struct PyArbitrationMadeLog {
    #[pyo3(get)]
    pub decision_key: String,
    #[pyo3(get)]
    pub obligation: String,
    #[pyo3(get)]
    pub oracle: String,
    #[pyo3(get)]
    pub decision: bool,
}

#[pymethods]
impl PyArbitrationMadeLog {
    fn __repr__(&self) -> String {
        format!(
            "PyArbitrationMadeLog(obligation='{}', oracle='{}', decision={})",
            self.obligation, self.oracle, self.decision
        )
    }
}

/// Client for interacting with Alkahest arbiters
///
/// This client provides access to all arbiter functionality including:
/// - Confirmation arbiters (exclusive/nonexclusive, revocable/unrevocable)
/// - Logical arbiters (AllArbiter, AnyArbiter)
/// - Trusted oracle arbitration
///
/// Security note: the ReferencesEscrowArbiter surface exposed by this client
/// has not been included in professional manual audits and has only been
/// reviewed by automated audit tooling so far.
#[pyclass]
#[derive(Clone)]
pub struct ArbitersClient {
    inner: ArbitersModule,
}

impl ArbitersClient {
    pub fn new(inner: ArbitersModule) -> Self {
        Self { inner }
    }
}

#[pymethods]
impl ArbitersClient {
    /// Access confirmation arbiters API
    #[getter]
    pub fn confirmation(&self) -> Confirmation {
        Confirmation::new(self.inner.clone())
    }

    /// Access logical arbiters API
    #[getter]
    pub fn logical(&self) -> Logical {
        Logical::new(self.inner.clone())
    }

    /// Access trusted oracle arbiter API
    #[getter]
    pub fn trusted_oracle(&self) -> TrustedOracle {
        TrustedOracle::new(self.inner.clone())
    }

    /// Access attestation properties arbiters API
    #[getter]
    pub fn attestation_properties(&self) -> AttestationProperties {
        AttestationProperties::new(self.inner.clone())
    }

    // ===== Address getters =====

    /// Get the EAS address
    pub fn eas_address(&self) -> String {
        format!("{:?}", self.inner.addresses.eas)
    }

    /// Get the TrivialArbiter address
    pub fn trivial_arbiter_address(&self) -> String {
        format!("{:?}", self.inner.addresses.trivial_arbiter)
    }

    /// Get the TrustedOracleArbiter address
    pub fn trusted_oracle_arbiter_address(&self) -> String {
        format!("{:?}", self.inner.addresses.trusted_oracle_arbiter)
    }

    /// Get the IntrinsicsArbiter address
    pub fn intrinsics_arbiter_address(&self) -> String {
        format!("{:?}", self.inner.addresses.intrinsics_arbiter)
    }

    /// Get the ERC8004Arbiter address
    pub fn erc8004_arbiter_address(&self) -> String {
        format!("{:?}", self.inner.addresses.erc8004_arbiter)
    }

    /// Get the AnyArbiter address
    pub fn any_arbiter_address(&self) -> String {
        format!("{:?}", self.inner.addresses.any_arbiter)
    }

    /// Get the AllArbiter address
    pub fn all_arbiter_address(&self) -> String {
        format!("{:?}", self.inner.addresses.all_arbiter)
    }

    /// Get the address of a confirmation arbiter by type
    pub fn confirmation_arbiter_address(&self, arbiter_type: PyConfirmationArbiterType) -> String {
        self.confirmation().address(arbiter_type)
    }

    /// Check whether a fulfillment satisfies an arbiter demand.
    pub fn check<'py>(
        &self,
        py: Python<'py>,
        arbiter: String,
        fulfillment: PyAttestation,
        demand: Vec<u8>,
        escrow_uid: String,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let result = inner
                .check(
                    arbiter.parse().map_err(map_parse_to_pyerr)?,
                    fulfillment.try_into().map_err(map_eyre_to_pyerr)?,
                    demand.into(),
                    escrow_uid
                        .parse::<FixedBytes<32>>()
                        .map_err(map_parse_to_pyerr)?,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(result)
        })
    }
}

// =============================================================================
// Core Arbiter DemandData Types
// =============================================================================

// ===== ERC8004ArbiterDemandData =====

/// Python representation of ERC8004Arbiter DemandData
///
/// ERC8004Arbiter wraps ERC-8004's ValidationRegistry to check validation responses.
#[pyclass]
#[derive(Clone)]
pub struct ERC8004ArbiterDemandData {
    /// The address of the ValidationRegistry contract
    #[pyo3(get)]
    pub validation_registry: String,
    /// The address of the validator
    #[pyo3(get)]
    pub validator_address: String,
    /// Minimum response value (0-100)
    #[pyo3(get)]
    pub min_response: u8,
    /// Additional validation context bytes.
    #[pyo3(get)]
    pub data: Vec<u8>,
}

#[pymethods]
impl ERC8004ArbiterDemandData {
    #[new]
    #[pyo3(signature = (validation_registry, validator_address, min_response, data = Vec::new()))]
    pub fn new(
        validation_registry: String,
        validator_address: String,
        min_response: u8,
        data: Vec<u8>,
    ) -> Self {
        Self {
            validation_registry,
            validator_address,
            min_response,
            data,
        }
    }

    fn __repr__(&self) -> String {
        format!(
            "ERC8004ArbiterDemandData(validation_registry='{}', validator_address='{}', min_response={}, data_len={})",
            self.validation_registry,
            self.validator_address,
            self.min_response,
            self.data.len()
        )
    }

    #[staticmethod]
    pub fn decode(demand_bytes: Vec<u8>) -> PyResult<ERC8004ArbiterDemandData> {
        let decoded = ERC8004ArbiterContract::DemandData::abi_decode(&demand_bytes)
            .map_err(|e| map_eyre_to_pyerr(eyre::eyre!("Failed to decode: {}", e)))?;
        Ok(ERC8004ArbiterDemandData {
            validation_registry: format!("{:?}", decoded.validationRegistry),
            validator_address: format!("{:?}", decoded.validatorAddress),
            min_response: decoded.minResponse,
            data: decoded.data.to_vec(),
        })
    }

    #[staticmethod]
    pub fn encode(demand_data: &ERC8004ArbiterDemandData) -> PyResult<Vec<u8>> {
        let validation_registry: alloy::primitives::Address = demand_data
            .validation_registry
            .parse()
            .map_err(|e| map_eyre_to_pyerr(eyre::eyre!("Invalid address: {}", e)))?;
        let validator_address: alloy::primitives::Address =
            demand_data
                .validator_address
                .parse()
                .map_err(|e| map_eyre_to_pyerr(eyre::eyre!("Invalid address: {}", e)))?;
        let rust_data = ERC8004ArbiterContract::DemandData {
            validationRegistry: validation_registry,
            validatorAddress: validator_address,
            minResponse: demand_data.min_response,
            data: demand_data.data.clone().into(),
        };
        Ok(rust_data.abi_encode())
    }

    pub fn encode_self(&self) -> PyResult<Vec<u8>> {
        ERC8004ArbiterDemandData::encode(self)
    }
}
