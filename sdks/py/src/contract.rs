use pyo3::{pyclass, pymethods, IntoPyObject};

// Python bindings for IEAS (Ethereum Attestation Service) types

/// Python representation of IEAS::Attestation
#[pyclass]
#[derive(Clone, Debug)]
pub struct PyAttestation {
    /// Unique identifier for the attestation
    #[pyo3(get)]
    pub uid: String,
    /// Schema identifier
    #[pyo3(get)]
    pub schema: String,
    /// Timestamp when the attestation was created
    #[pyo3(get)]
    pub time: u64,
    /// Timestamp when the attestation expires (0 = never expires)
    #[pyo3(get)]
    pub expiration_time: u64,
    /// Timestamp when the attestation was revoked (0 = not revoked)
    #[pyo3(get)]
    pub revocation_time: u64,
    /// Reference to another attestation UID
    #[pyo3(get)]
    pub ref_uid: String,
    /// Address of the recipient
    #[pyo3(get)]
    pub recipient: String,
    /// Address of the attester
    #[pyo3(get)]
    pub attester: String,
    /// Whether this attestation can be revoked
    #[pyo3(get)]
    pub revocable: bool,
    /// The attestation data
    #[pyo3(get)]
    pub data: Vec<u8>,
}

#[pymethods]
impl PyAttestation {
    #[new]
    pub fn new(
        uid: String,
        schema: String,
        time: u64,
        expiration_time: u64,
        revocation_time: u64,
        ref_uid: String,
        recipient: String,
        attester: String,
        revocable: bool,
        data: Vec<u8>,
    ) -> Self {
        Self {
            uid,
            schema,
            time,
            expiration_time,
            revocation_time,
            ref_uid,
            recipient,
            attester,
            revocable,
            data,
        }
    }

    fn __repr__(&self) -> String {
        format!(
            "PyAttestation(uid='{}', schema='{}', attester='{}', recipient='{}', time={}, revocable={})",
            self.uid, self.schema, self.attester, self.recipient, self.time, self.revocable
        )
    }

    /// Check if the attestation is expired
    pub fn is_expired(&self) -> bool {
        if self.expiration_time == 0 {
            false // Never expires
        } else {
            use std::time::{SystemTime, UNIX_EPOCH};
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs();
            now > self.expiration_time
        }
    }

    /// Check if the attestation is revoked
    pub fn is_revoked(&self) -> bool {
        self.revocation_time != 0
    }

    /// Check if the attestation is valid (not expired and not revoked)
    pub fn is_valid(&self) -> bool {
        !self.is_expired() && !self.is_revoked()
    }
}

/// Conversion from Rust IEAS::Attestation to Python
impl From<alkahest_rs::contracts::IEAS::Attestation> for PyAttestation {
    fn from(attestation: alkahest_rs::contracts::IEAS::Attestation) -> Self {
        Self {
            uid: attestation.uid.to_string(),
            schema: attestation.schema.to_string(),
            time: attestation.time,
            expiration_time: attestation.expirationTime,
            revocation_time: attestation.revocationTime,
            ref_uid: attestation.refUID.to_string(),
            recipient: format!("{:?}", attestation.recipient),
            attester: format!("{:?}", attestation.attester),
            revocable: attestation.revocable,
            data: attestation.data.to_vec(),
        }
    }
}

impl TryFrom<PyAttestation> for alkahest_rs::contracts::IEAS::Attestation {
    type Error = eyre::Error;

    fn try_from(value: PyAttestation) -> eyre::Result<Self> {
        Ok(Self {
            uid: value.uid.parse()?,
            schema: value.schema.parse()?,
            time: value.time,
            expirationTime: value.expiration_time,
            revocationTime: value.revocation_time,
            refUID: value.ref_uid.parse()?,
            recipient: value.recipient.parse()?,
            attester: value.attester.parse()?,
            revocable: value.revocable,
            data: value.data.into(),
        })
    }
}

/// Python representation of IEAS::AttestationRequestData
#[pyclass]
#[derive(Clone, Debug)]
pub struct PyAttestationRequestData {
    /// Address of the recipient
    #[pyo3(get)]
    pub recipient: String,
    /// Timestamp when the attestation expires (0 = never expires)
    #[pyo3(get)]
    pub expiration_time: u64,
    /// Whether this attestation can be revoked
    #[pyo3(get)]
    pub revocable: bool,
    /// Reference to another attestation UID
    #[pyo3(get)]
    pub ref_uid: String,
    /// The attestation data
    #[pyo3(get)]
    pub data: Vec<u8>,
    /// ETH value sent with the attestation
    #[pyo3(get)]
    pub value: u128,
}

#[pymethods]
impl PyAttestationRequestData {
    #[new]
    pub fn new(
        recipient: String,
        expiration_time: u64,
        revocable: bool,
        ref_uid: String,
        data: Vec<u8>,
        value: u128,
    ) -> Self {
        Self {
            recipient,
            expiration_time,
            revocable,
            ref_uid,
            data,
            value,
        }
    }

    fn __repr__(&self) -> String {
        format!(
            "PyAttestationRequestData(recipient='{}', expiration_time={}, revocable={}, data_len={})",
            self.recipient, self.expiration_time, self.revocable, self.data.len()
        )
    }
}

/// Conversion from Python to Rust IEAS::AttestationRequestData
impl TryFrom<PyAttestationRequestData> for alkahest_rs::contracts::IEAS::AttestationRequestData {
    type Error = eyre::Error;

    fn try_from(value: PyAttestationRequestData) -> eyre::Result<Self> {
        Ok(Self {
            recipient: value.recipient.parse()?,
            expirationTime: value.expiration_time,
            revocable: value.revocable,
            refUID: value.ref_uid.parse()?,
            data: value.data.into(),
            value: value.value.try_into()?,
        })
    }
}

/// Python representation of IEAS::AttestationRequest
#[pyclass]
#[derive(Clone, Debug)]
pub struct PyAttestationRequest {
    /// Schema identifier
    #[pyo3(get)]
    pub schema: String,
    /// The attestation request data
    #[pyo3(get)]
    pub data: PyAttestationRequestData,
}

#[pymethods]
impl PyAttestationRequest {
    #[new]
    pub fn new(schema: String, data: PyAttestationRequestData) -> Self {
        Self { schema, data }
    }

    fn __repr__(&self) -> String {
        format!(
            "PyAttestationRequest(schema='{}', data={:?})",
            self.schema, self.data
        )
    }
}

/// Conversion from Python to Rust IEAS::AttestationRequest
impl TryFrom<PyAttestationRequest> for alkahest_rs::contracts::IEAS::AttestationRequest {
    type Error = eyre::Error;

    fn try_from(value: PyAttestationRequest) -> eyre::Result<Self> {
        let schema: alloy::primitives::FixedBytes<32> = value.schema.parse()?;
        Ok(Self {
            schema,
            data: value.data.try_into()?,
        })
    }
}

/// Python representation of IEAS::RevocationRequestData
#[pyclass]
#[derive(Clone, Debug)]
pub struct PyRevocationRequestData {
    /// UID of the attestation to revoke
    #[pyo3(get)]
    pub uid: String,
    /// ETH value sent with the revocation
    #[pyo3(get)]
    pub value: u128,
}

#[pymethods]
impl PyRevocationRequestData {
    #[new]
    pub fn new(uid: String, value: u128) -> Self {
        Self { uid, value }
    }

    fn __repr__(&self) -> String {
        format!(
            "PyRevocationRequestData(uid='{}', value={})",
            self.uid, self.value
        )
    }
}

/// Conversion from Python to Rust IEAS::RevocationRequestData
impl TryFrom<PyRevocationRequestData> for alkahest_rs::contracts::IEAS::RevocationRequestData {
    type Error = eyre::Error;

    fn try_from(value: PyRevocationRequestData) -> eyre::Result<Self> {
        Ok(Self {
            uid: value.uid.parse()?,
            value: value.value.try_into()?,
        })
    }
}

/// Python representation of IEAS::RevocationRequest
#[pyclass]
#[derive(Clone, Debug)]
pub struct PyRevocationRequest {
    /// Schema identifier
    #[pyo3(get)]
    pub schema: String,
    /// The revocation request data
    #[pyo3(get)]
    pub data: PyRevocationRequestData,
}

#[pymethods]
impl PyRevocationRequest {
    #[new]
    pub fn new(schema: String, data: PyRevocationRequestData) -> Self {
        Self { schema, data }
    }

    fn __repr__(&self) -> String {
        format!(
            "PyRevocationRequest(schema='{}', data={:?})",
            self.schema, self.data
        )
    }
}

/// Conversion from Python to Rust IEAS::RevocationRequest
impl TryFrom<PyRevocationRequest> for alkahest_rs::contracts::IEAS::RevocationRequest {
    type Error = eyre::Error;

    fn try_from(value: PyRevocationRequest) -> eyre::Result<Self> {
        let schema: alloy::primitives::FixedBytes<32> = value.schema.parse()?;
        Ok(Self {
            schema,
            data: value.data.try_into()?,
        })
    }
}

/// Python representation of IEAS::Attested event
#[pyclass]
#[derive(Clone, Debug)]
pub struct PyAttested {
    /// Address of the recipient
    #[pyo3(get)]
    pub recipient: String,
    /// Address of the attester
    #[pyo3(get)]
    pub attester: String,
    /// UID of the attestation
    #[pyo3(get)]
    pub uid: String,
    /// Schema UID
    #[pyo3(get)]
    pub schema_uid: String,
}

#[pymethods]
impl PyAttested {
    #[new]
    pub fn new(recipient: String, attester: String, uid: String, schema_uid: String) -> Self {
        Self {
            recipient,
            attester,
            uid,
            schema_uid,
        }
    }

    fn __repr__(&self) -> String {
        format!(
            "PyAttested(recipient='{}', attester='{}', uid='{}', schema_uid='{}')",
            self.recipient, self.attester, self.uid, self.schema_uid
        )
    }
}

/// Conversion from Rust IEAS::Attested to Python
impl From<alkahest_rs::contracts::IEAS::Attested> for PyAttested {
    fn from(attested: alkahest_rs::contracts::IEAS::Attested) -> Self {
        Self {
            recipient: format!("{:?}", attested.recipient),
            attester: format!("{:?}", attested.attester),
            uid: attested.uid.to_string(),
            schema_uid: attested.schemaUID.to_string(),
        }
    }
}

/// Python representation of IEAS::Revoked event
#[pyclass]
#[derive(Clone, Debug)]
pub struct PyRevoked {
    /// Address of the recipient
    #[pyo3(get)]
    pub recipient: String,
    /// Address of the attester
    #[pyo3(get)]
    pub attester: String,
    /// UID of the revoked attestation
    #[pyo3(get)]
    pub uid: String,
    /// Schema UID
    #[pyo3(get)]
    pub schema_uid: String,
}

#[pymethods]
impl PyRevoked {
    #[new]
    pub fn new(recipient: String, attester: String, uid: String, schema_uid: String) -> Self {
        Self {
            recipient,
            attester,
            uid,
            schema_uid,
        }
    }

    fn __repr__(&self) -> String {
        format!(
            "PyRevoked(recipient='{}', attester='{}', uid='{}', schema_uid='{}')",
            self.recipient, self.attester, self.uid, self.schema_uid
        )
    }
}

/// Conversion from Rust IEAS::Revoked to Python
impl From<alkahest_rs::contracts::IEAS::Revoked> for PyRevoked {
    fn from(revoked: alkahest_rs::contracts::IEAS::Revoked) -> Self {
        Self {
            recipient: format!("{:?}", revoked.recipient),
            attester: format!("{:?}", revoked.attester),
            uid: revoked.uid.to_string(),
            schema_uid: revoked.schemaUID.to_string(),
        }
    }
}

/// Python representation of IEAS::Timestamped event
#[pyclass]
#[derive(Clone, Debug)]
pub struct PyTimestamped {
    /// The data that was timestamped
    #[pyo3(get)]
    pub data: Vec<u8>,
    /// The timestamp
    #[pyo3(get)]
    pub timestamp: u64,
}

#[pymethods]
impl PyTimestamped {
    #[new]
    pub fn new(data: Vec<u8>, timestamp: u64) -> Self {
        Self { data, timestamp }
    }

    fn __repr__(&self) -> String {
        format!(
            "PyTimestamped(data_len={}, timestamp={})",
            self.data.len(),
            self.timestamp
        )
    }
}

/// Conversion from Rust IEAS::Timestamped to Python
impl From<alkahest_rs::contracts::IEAS::Timestamped> for PyTimestamped {
    fn from(timestamped: alkahest_rs::contracts::IEAS::Timestamped) -> Self {
        Self {
            data: timestamped.data.to_vec(),
            timestamp: timestamped.timestamp,
        }
    }
}

#[derive(IntoPyObject)]
pub struct PyDecodedAttestation<T> {
    pub attestation: PyAttestation,
    pub data: T,
}

impl
    From<
        alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::StringObligation::ObligationData,
        >,
    > for PyDecodedAttestation<crate::clients::obligations::string::PyStringObligationData>
{
    fn from(
        decoded: alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::StringObligation::ObligationData,
        >,
    ) -> Self {
        Self {
            attestation: PyAttestation::from(decoded.attestation),
            data: crate::clients::obligations::string::PyStringObligationData {
                item: decoded.data.item,
                schema: format!("0x{}", alloy::hex::encode(decoded.data.schema.as_slice())),
            },
        }
    }
}

impl
    From<
        alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::CommitRevealObligation::ObligationData,
        >,
    >
    for PyDecodedAttestation<
        crate::clients::obligations::commit_reveal::PyCommitRevealObligationData,
    >
{
    fn from(
        decoded: alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::CommitRevealObligation::ObligationData,
        >,
    ) -> Self {
        Self {
            attestation: PyAttestation::from(decoded.attestation),
            data: decoded.data.into(),
        }
    }
}

// --- ERC20 escrow ---

impl
    From<
        alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::default_escrow::ERC20EscrowObligation::ObligationData,
        >,
    > for PyDecodedAttestation<crate::clients::obligations::erc20::PyERC20EscrowObligationData>
{
    fn from(
        decoded: alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::default_escrow::ERC20EscrowObligation::ObligationData,
        >,
    ) -> Self {
        Self {
            attestation: PyAttestation::from(decoded.attestation),
            data: decoded.data.into(),
        }
    }
}

impl
    From<
        alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalERC20EscrowObligation::ObligationData,
        >,
    > for PyDecodedAttestation<crate::clients::obligations::erc20::PyERC20EscrowObligationData>
{
    fn from(
        decoded: alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalERC20EscrowObligation::ObligationData,
        >,
    ) -> Self {
        Self {
            attestation: PyAttestation::from(decoded.attestation),
            data: decoded.data.into(),
        }
    }
}

// --- ERC721 escrow ---

impl
    From<
        alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::default_escrow::ERC721EscrowObligation::ObligationData,
        >,
    > for PyDecodedAttestation<crate::clients::obligations::erc721::PyERC721EscrowObligationData>
{
    fn from(
        decoded: alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::default_escrow::ERC721EscrowObligation::ObligationData,
        >,
    ) -> Self {
        Self {
            attestation: PyAttestation::from(decoded.attestation),
            data: decoded.data.into(),
        }
    }
}

impl
    From<
        alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalERC721EscrowObligation::ObligationData,
        >,
    > for PyDecodedAttestation<crate::clients::obligations::erc721::PyERC721EscrowObligationData>
{
    fn from(
        decoded: alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalERC721EscrowObligation::ObligationData,
        >,
    ) -> Self {
        Self {
            attestation: PyAttestation::from(decoded.attestation),
            data: decoded.data.into(),
        }
    }
}

// --- ERC1155 escrow ---

impl
    From<
        alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::default_escrow::ERC1155EscrowObligation::ObligationData,
        >,
    > for PyDecodedAttestation<crate::clients::obligations::erc1155::PyERC1155EscrowObligationData>
{
    fn from(
        decoded: alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::default_escrow::ERC1155EscrowObligation::ObligationData,
        >,
    ) -> Self {
        Self {
            attestation: PyAttestation::from(decoded.attestation),
            data: decoded.data.into(),
        }
    }
}

impl
    From<
        alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalERC1155EscrowObligation::ObligationData,
        >,
    > for PyDecodedAttestation<crate::clients::obligations::erc1155::PyERC1155EscrowObligationData>
{
    fn from(
        decoded: alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalERC1155EscrowObligation::ObligationData,
        >,
    ) -> Self {
        Self {
            attestation: PyAttestation::from(decoded.attestation),
            data: decoded.data.into(),
        }
    }
}

// --- NativeToken escrow ---

impl
    From<
        alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::default_escrow::NativeTokenEscrowObligation::ObligationData,
        >,
    >
    for PyDecodedAttestation<
        crate::clients::obligations::native_token::PyNativeTokenEscrowObligationData,
    >
{
    fn from(
        decoded: alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::default_escrow::NativeTokenEscrowObligation::ObligationData,
        >,
    ) -> Self {
        Self {
            attestation: PyAttestation::from(decoded.attestation),
            data: decoded.data.into(),
        }
    }
}

impl
    From<
        alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalNativeTokenEscrowObligation::ObligationData,
        >,
    >
    for PyDecodedAttestation<
        crate::clients::obligations::native_token::PyNativeTokenEscrowObligationData,
    >
{
    fn from(
        decoded: alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalNativeTokenEscrowObligation::ObligationData,
        >,
    ) -> Self {
        Self {
            attestation: PyAttestation::from(decoded.attestation),
            data: decoded.data.into(),
        }
    }
}

// --- TokenBundle escrow ---

impl
    From<
        alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::default_escrow::TokenBundleEscrowObligation::ObligationData,
        >,
    >
    for PyDecodedAttestation<
        crate::clients::obligations::token_bundle::PyTokenBundleEscrowObligationData,
    >
{
    fn from(
        decoded: alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::default_escrow::TokenBundleEscrowObligation::ObligationData,
        >,
    ) -> Self {
        Self {
            attestation: PyAttestation::from(decoded.attestation),
            data: decoded.data.into(),
        }
    }
}

impl
    From<
        alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalTokenBundleEscrowObligation::ObligationData,
        >,
    >
    for PyDecodedAttestation<
        crate::clients::obligations::token_bundle::PyTokenBundleEscrowObligationData,
    >
{
    fn from(
        decoded: alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalTokenBundleEscrowObligation::ObligationData,
        >,
    ) -> Self {
        Self {
            attestation: PyAttestation::from(decoded.attestation),
            data: decoded.data.into(),
        }
    }
}

// --- AttestationEscrowObligation ---

impl
    From<
        alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::default_escrow::AttestationEscrowObligation::ObligationData,
        >,
    >
    for PyDecodedAttestation<
        crate::clients::obligations::attestation::PyAttestationEscrowObligationData,
    >
{
    fn from(
        decoded: alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::default_escrow::AttestationEscrowObligation::ObligationData,
        >,
    ) -> Self {
        Self {
            attestation: PyAttestation::from(decoded.attestation),
            data: decoded.data.into(),
        }
    }
}

impl
    From<
        alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalAttestationEscrowObligation::ObligationData,
        >,
    >
    for PyDecodedAttestation<
        crate::clients::obligations::attestation::PyAttestationEscrowObligationData,
    >
{
    fn from(
        decoded: alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalAttestationEscrowObligation::ObligationData,
        >,
    ) -> Self {
        Self {
            attestation: PyAttestation::from(decoded.attestation),
            data: decoded.data.into(),
        }
    }
}

// --- AttestationReferenceEscrowObligation ---

impl
    From<
        alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::default_escrow::AttestationReferenceEscrowObligation::ObligationData,
        >,
    >
    for PyDecodedAttestation<
        crate::clients::obligations::attestation::PyAttestationReferenceEscrowObligationData,
    >
{
    fn from(
        decoded: alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::default_escrow::AttestationReferenceEscrowObligation::ObligationData,
        >,
    ) -> Self {
        Self {
            attestation: PyAttestation::from(decoded.attestation),
            data: decoded.data.into(),
        }
    }
}

impl
    From<
        alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalAttestationReferenceEscrowObligation::ObligationData,
        >,
    >
    for PyDecodedAttestation<
        crate::clients::obligations::attestation::PyAttestationReferenceEscrowObligationData,
    >
{
    fn from(
        decoded: alkahest_rs::types::DecodedAttestation<
            alkahest_rs::contracts::obligations::escrow::unconditional::UnconditionalAttestationReferenceEscrowObligation::ObligationData,
        >,
    ) -> Self {
        Self {
            attestation: PyAttestation::from(decoded.attestation),
            data: decoded.data.into(),
        }
    }
}
