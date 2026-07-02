//! Attestation obligation module
//!
//! Provides escrow and utility operations for attestation-based obligations.

pub mod escrow;
pub mod util;

use alkahest_rs::extensions::AttestationModule;
use pyo3::{pyclass, pymethods, PyResult};

use crate::{
    contract::{PyAttestationRequest, PyAttestationRequestData},
    error_handling::map_parse_to_pyerr,
};

#[pyclass]
#[derive(Clone)]
pub struct AttestationClient {
    pub(crate) inner: AttestationModule,
}

impl AttestationClient {
    pub fn new(inner: AttestationModule) -> Self {
        Self { inner }
    }
}

#[pymethods]
impl AttestationClient {
    /// Access attestation escrow operations.
    #[getter]
    pub fn escrow(&self) -> escrow::Escrow {
        escrow::Escrow::new(self.inner.clone())
    }

    /// Access utility operations (get_attestation, register_schema, attest)
    #[getter]
    pub fn util(&self) -> util::Util {
        util::Util::new(self.inner.clone())
    }
}

// --- Obligation Data Types ---

/// AttestationEscrowObligation: stores the full attestation request inline.
#[pyclass]
#[derive(Clone)]
pub struct PyAttestationEscrowObligationData {
    #[pyo3(get)]
    pub arbiter: String,
    #[pyo3(get)]
    pub demand: Vec<u8>,
    #[pyo3(get)]
    pub attestation: PyAttestationRequest,
}

#[pymethods]
impl PyAttestationEscrowObligationData {
    #[new]
    pub fn new(arbiter: String, demand: Vec<u8>, attestation: PyAttestationRequest) -> Self {
        Self {
            arbiter,
            demand,
            attestation,
        }
    }

    fn __repr__(&self) -> String {
        format!(
            "PyAttestationEscrowObligationData(arbiter='{}', demand_len={}, attestation={:?})",
            self.arbiter,
            self.demand.len(),
            self.attestation
        )
    }

    #[staticmethod]
    pub fn decode(obligation_data: Vec<u8>) -> PyResult<PyAttestationEscrowObligationData> {
        use alkahest_rs::contracts::obligations::escrow::default_escrow::AttestationEscrowObligation;
        use alloy::sol_types::SolValue;
        let decoded = AttestationEscrowObligation::ObligationData::abi_decode(&obligation_data)
            .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
        Ok(decoded.into())
    }

    #[staticmethod]
    pub fn encode(obligation: &PyAttestationEscrowObligationData) -> PyResult<Vec<u8>> {
        use alkahest_rs::contracts::obligations::escrow::default_escrow::AttestationEscrowObligation;
        use alloy::{
            primitives::{Address, Bytes, FixedBytes},
            sol_types::SolValue,
        };

        let arbiter: Address = obligation.arbiter.parse().map_err(map_parse_to_pyerr)?;
        let demand = Bytes::from(obligation.demand.clone());

        // The sol! macro emits a per-contract `AttestationRequest` struct that
        // is structurally identical to `IEAS::AttestationRequest` but a distinct
        // type, so we construct it directly using the escrow contract's namespace.
        let schema: FixedBytes<32> = obligation
            .attestation
            .schema
            .parse()
            .map_err(map_parse_to_pyerr)?;
        let recipient: Address = obligation
            .attestation
            .data
            .recipient
            .parse()
            .map_err(map_parse_to_pyerr)?;
        let ref_uid: FixedBytes<32> = obligation
            .attestation
            .data
            .ref_uid
            .parse()
            .map_err(map_parse_to_pyerr)?;
        let value = alloy::primitives::U256::from(obligation.attestation.data.value);
        let attestation = AttestationEscrowObligation::AttestationRequest {
            schema,
            data: AttestationEscrowObligation::AttestationRequestData {
                recipient,
                expirationTime: obligation.attestation.data.expiration_time,
                revocable: obligation.attestation.data.revocable,
                refUID: ref_uid,
                data: Bytes::from(obligation.attestation.data.data.clone()),
                value,
            },
        };

        let obligation_data = AttestationEscrowObligation::ObligationData {
            arbiter,
            demand,
            attestation,
        };

        Ok(obligation_data.abi_encode())
    }

    pub fn encode_self(&self) -> PyResult<Vec<u8>> {
        PyAttestationEscrowObligationData::encode(self)
    }
}

impl From<alkahest_rs::contracts::obligations::escrow::default_escrow::AttestationEscrowObligation::ObligationData>
    for PyAttestationEscrowObligationData
{
    fn from(
        data: alkahest_rs::contracts::obligations::escrow::default_escrow::AttestationEscrowObligation::ObligationData,
    ) -> Self {
        Self {
            arbiter: format!("{:?}", data.arbiter),
            demand: data.demand.to_vec(),
            attestation: PyAttestationRequest {
                schema: data.attestation.schema.to_string(),
                data: PyAttestationRequestData {
                    recipient: format!("{:?}", data.attestation.data.recipient),
                    expiration_time: data.attestation.data.expirationTime,
                    revocable: data.attestation.data.revocable,
                    ref_uid: data.attestation.data.refUID.to_string(),
                    data: data.attestation.data.data.to_vec(),
                    value: data.attestation.data.value.try_into().unwrap_or(0),
                },
            },
        }
    }
}

impl From<alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalAttestationEscrowObligation::ObligationData>
    for PyAttestationEscrowObligationData
{
    fn from(
        data: alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalAttestationEscrowObligation::ObligationData,
    ) -> Self {
        Self {
            arbiter: format!("{:?}", data.arbiter),
            demand: data.demand.to_vec(),
            attestation: PyAttestationRequest {
                schema: data.attestation.schema.to_string(),
                data: PyAttestationRequestData {
                    recipient: format!("{:?}", data.attestation.data.recipient),
                    expiration_time: data.attestation.data.expirationTime,
                    revocable: data.attestation.data.revocable,
                    ref_uid: data.attestation.data.refUID.to_string(),
                    data: data.attestation.data.data.to_vec(),
                    value: data.attestation.data.value.try_into().unwrap_or(0),
                },
            },
        }
    }
}

/// AttestationReferenceEscrowObligation: references an attestation by UID instead of inlining.
///
/// `referenced_attestation_uid` is a 0x-prefixed hex string for a bytes32 (matches the
/// `schema`/`uid` convention used elsewhere in the SDK).
#[pyclass]
#[derive(Clone)]
pub struct PyAttestationReferenceEscrowObligationData {
    #[pyo3(get)]
    pub arbiter: String,
    #[pyo3(get)]
    pub demand: Vec<u8>,
    #[pyo3(get)]
    pub referenced_attestation_uid: String,
    #[pyo3(get)]
    pub expiration_time: u64,
}

#[pymethods]
impl PyAttestationReferenceEscrowObligationData {
    #[new]
    #[pyo3(signature = (arbiter, demand, referenced_attestation_uid, expiration_time = 0))]
    pub fn new(
        arbiter: String,
        demand: Vec<u8>,
        referenced_attestation_uid: String,
        expiration_time: u64,
    ) -> Self {
        Self {
            arbiter,
            demand,
            referenced_attestation_uid,
            expiration_time,
        }
    }

    fn __repr__(&self) -> String {
        format!(
            "PyAttestationReferenceEscrowObligationData(arbiter='{}', referenced_attestation_uid='{}', demand_len={}, expiration_time={})",
            self.arbiter,
            self.referenced_attestation_uid,
            self.demand.len(),
            self.expiration_time
        )
    }

    #[staticmethod]
    pub fn decode(
        obligation_data: Vec<u8>,
    ) -> PyResult<PyAttestationReferenceEscrowObligationData> {
        use alkahest_rs::contracts::obligations::escrow::default_escrow::AttestationReferenceEscrowObligation;
        use alloy::sol_types::SolValue;
        let decoded =
            AttestationReferenceEscrowObligation::ObligationData::abi_decode(&obligation_data)
                .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
        Ok(decoded.into())
    }

    #[staticmethod]
    pub fn encode(obligation: &PyAttestationReferenceEscrowObligationData) -> PyResult<Vec<u8>> {
        use alkahest_rs::contracts::obligations::escrow::default_escrow::AttestationReferenceEscrowObligation;
        use alloy::{
            primitives::{Address, Bytes, FixedBytes},
            sol_types::SolValue,
        };

        let arbiter: Address = obligation.arbiter.parse().map_err(map_parse_to_pyerr)?;
        let demand = Bytes::from(obligation.demand.clone());
        let referenced_attestation_uid: FixedBytes<32> = obligation
            .referenced_attestation_uid
            .parse()
            .map_err(map_parse_to_pyerr)?;

        let obligation_data = AttestationReferenceEscrowObligation::ObligationData {
            arbiter,
            demand,
            referencedAttestationUid: referenced_attestation_uid,
            expirationTime: obligation.expiration_time,
        };

        Ok(obligation_data.abi_encode())
    }

    pub fn encode_self(&self) -> PyResult<Vec<u8>> {
        PyAttestationReferenceEscrowObligationData::encode(self)
    }
}

impl From<alkahest_rs::contracts::obligations::escrow::default_escrow::AttestationReferenceEscrowObligation::ObligationData>
    for PyAttestationReferenceEscrowObligationData
{
    fn from(
        data: alkahest_rs::contracts::obligations::escrow::default_escrow::AttestationReferenceEscrowObligation::ObligationData,
    ) -> Self {
        Self {
            arbiter: format!("{:?}", data.arbiter),
            demand: data.demand.to_vec(),
            referenced_attestation_uid: data.referencedAttestationUid.to_string(),
            expiration_time: data.expirationTime,
        }
    }
}

impl From<alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalAttestationReferenceEscrowObligation::ObligationData>
    for PyAttestationReferenceEscrowObligationData
{
    fn from(
        data: alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalAttestationReferenceEscrowObligation::ObligationData,
    ) -> Self {
        Self {
            arbiter: format!("{:?}", data.arbiter),
            demand: data.demand.to_vec(),
            referenced_attestation_uid: data.referencedAttestationUid.to_string(),
            expiration_time: data.expirationTime,
        }
    }
}
