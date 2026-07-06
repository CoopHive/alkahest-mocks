use alkahest_rs::{contracts::IEAS::Attested, types::EscrowClaimed};
use alloy::primitives::{FixedBytes, U256};
use pyo3::{exceptions::PyValueError, pyclass, FromPyObject, IntoPyObject, PyErr, PyResult};

macro_rules! client_address_config {
    ($name:ident) => {
        #[derive(FromPyObject)]
        pub struct $name {
            pub eas: String,
            pub atomic_payment_utils: String,
            pub escrow_obligation_default: String,
            pub escrow_obligation_unconditional: String,
            pub payment_obligation: String,
        }
    };
}

client_address_config!(Erc20Addresses);
client_address_config!(Erc721Addresses);
client_address_config!(Erc1155Addresses);
client_address_config!(TokenBundleAddresses);
client_address_config!(NativeTokenAddresses);

#[derive(FromPyObject)]
pub struct OracleAddresses {
    pub eas: String,
    pub trusted_oracle_arbiter: String,
}

#[derive(FromPyObject)]
pub struct AttestationAddresses {
    pub eas: String,
    pub eas_schema_registry: String,
    pub atomic_attestation_utils: String,
    pub escrow_obligation_default: String,
    pub escrow_obligation_unconditional: String,
    pub attestation_reference_escrow_obligation_default: String,
    pub attestation_reference_escrow_obligation_unconditional: String,
}

#[derive(FromPyObject)]
pub struct HookBasedAddresses {
    pub eas: String,
    pub hook_escrow_obligation: String,
    pub hooks_escrow_obligation: String,
    pub erc20_escrow_hook: String,
    pub erc721_escrow_hook: String,
    pub erc1155_escrow_hook: String,
    pub native_token_escrow_hook: String,
    pub attestation_escrow_hook: String,
    pub attestation_reference_escrow_hook: String,
}

#[derive(FromPyObject)]
pub struct SplittersAddresses {
    pub erc20_splitter: String,
    pub erc1155_splitter: String,
    pub native_token_splitter: String,
    pub token_bundle_splitter: String,
    pub token_bundle_splitter_unvalidated: String,
    pub commitment_erc20_splitter: String,
    pub commitment_erc1155_splitter: String,
    pub commitment_native_token_splitter: String,
    pub commitment_token_bundle_splitter: String,
    pub commitment_token_bundle_splitter_unvalidated: String,
}

#[derive(FromPyObject)]
pub struct ArbitersAddresses {
    pub eas: String,
    pub trivial_arbiter: String,
    pub trusted_oracle_arbiter: String,
    pub commitment_trusted_oracle_arbiter: String,
    pub intrinsics_arbiter: String,
    pub erc8004_arbiter: String,
    pub references_escrow_arbiter: String,
    pub any_arbiter: String,
    pub all_arbiter: String,
    pub attester_arbiter: String,
    pub expiration_time_after_arbiter: String,
    pub expiration_time_before_arbiter: String,
    pub expiration_time_equal_arbiter: String,
    pub recipient_arbiter: String,
    pub ref_uid_arbiter: String,
    pub revocable_arbiter: String,
    pub schema_arbiter: String,
    pub time_after_arbiter: String,
    pub time_before_arbiter: String,
    pub time_equal_arbiter: String,
    pub uid_arbiter: String,
    pub exclusive_revocable_confirmation_arbiter: String,
    pub exclusive_unrevocable_confirmation_arbiter: String,
    pub nonexclusive_revocable_confirmation_arbiter: String,
    pub nonexclusive_unrevocable_confirmation_arbiter: String,
}

#[derive(FromPyObject)]
pub struct StringObligationAddresses {
    pub eas: String,
    pub obligation: String,
}

// Implement TryFrom for StringObligationAddresses
impl TryFrom<StringObligationAddresses>
    for alkahest_rs::clients::string_obligation::StringObligationAddresses
{
    type Error = PyErr;

    fn try_from(value: StringObligationAddresses) -> PyResult<Self> {
        Ok(Self {
            eas: value
                .eas
                .parse()
                .map_err(|_| PyValueError::new_err("invalid address"))?,
            obligation: value
                .obligation
                .parse()
                .map_err(|_| PyValueError::new_err("invalid address"))?,
        })
    }
}

#[derive(FromPyObject)]
pub struct CommitRevealObligationAddresses {
    pub eas: String,
    pub obligation: String,
}

impl TryFrom<CommitRevealObligationAddresses>
    for alkahest_rs::clients::commit_reveal_obligation::CommitRevealObligationAddresses
{
    type Error = PyErr;

    fn try_from(value: CommitRevealObligationAddresses) -> PyResult<Self> {
        Ok(Self {
            eas: value
                .eas
                .parse()
                .map_err(|_| PyValueError::new_err("invalid address"))?,
            obligation: value
                .obligation
                .parse()
                .map_err(|_| PyValueError::new_err("invalid address"))?,
        })
    }
}

#[derive(FromPyObject)]
pub struct DefaultExtensionConfig {
    pub erc20_addresses: Option<Erc20Addresses>,
    pub erc721_addresses: Option<Erc721Addresses>,
    pub erc1155_addresses: Option<Erc1155Addresses>,
    pub native_token_addresses: Option<NativeTokenAddresses>,
    pub token_bundle_addresses: Option<TokenBundleAddresses>,
    pub hook_based_addresses: Option<HookBasedAddresses>,
    pub splitters_addresses: Option<SplittersAddresses>,
    pub attestation_addresses: Option<AttestationAddresses>,
    pub arbiters_addresses: Option<ArbitersAddresses>,
    pub string_obligation_addresses: Option<StringObligationAddresses>,
    pub commit_reveal_obligation_addresses: Option<CommitRevealObligationAddresses>,
}

macro_rules! try_from_address_config {
    ( $from:path, $to:path) => {
        impl TryFrom<$from> for $to {
            type Error = PyErr;

            fn try_from(value: $from) -> PyResult<Self> {
                macro_rules! parse_address {
                    ($name:ident) => {
                        value
                            .$name
                            .parse()
                            .map_err(|_| PyValueError::new_err("invalid address"))?
                    };
                }

                Ok(Self {
                    eas: parse_address!(eas),
                    atomic_payment_utils: parse_address!(atomic_payment_utils),
                    escrow_obligation_default: parse_address!(escrow_obligation_default),
                    escrow_obligation_unconditional: parse_address!(
                        escrow_obligation_unconditional
                    ),
                    payment_obligation: parse_address!(payment_obligation),
                })
            }
        }
    };
}

try_from_address_config!(Erc20Addresses, alkahest_rs::clients::erc20::Erc20Addresses);
try_from_address_config!(
    Erc721Addresses,
    alkahest_rs::clients::erc721::Erc721Addresses
);
try_from_address_config!(
    Erc1155Addresses,
    alkahest_rs::clients::erc1155::Erc1155Addresses
);
try_from_address_config!(
    TokenBundleAddresses,
    alkahest_rs::clients::token_bundle::TokenBundleAddresses
);
try_from_address_config!(
    NativeTokenAddresses,
    alkahest_rs::clients::native_token::NativeTokenAddresses
);

impl TryFrom<AttestationAddresses> for alkahest_rs::clients::attestation::AttestationAddresses {
    type Error = PyErr;

    fn try_from(value: AttestationAddresses) -> PyResult<Self> {
        macro_rules! parse_address {
            ($name:ident) => {
                value
                    .$name
                    .parse()
                    .map_err(|_| PyValueError::new_err("invalid address"))?
            };
        }

        Ok(Self {
            eas: parse_address!(eas),
            eas_schema_registry: parse_address!(eas_schema_registry),
            atomic_attestation_utils: parse_address!(atomic_attestation_utils),
            escrow_obligation_default: parse_address!(escrow_obligation_default),
            escrow_obligation_unconditional: parse_address!(escrow_obligation_unconditional),
            attestation_reference_escrow_obligation_default: parse_address!(
                attestation_reference_escrow_obligation_default
            ),
            attestation_reference_escrow_obligation_unconditional: parse_address!(
                attestation_reference_escrow_obligation_unconditional
            ),
        })
    }
}

impl TryFrom<HookBasedAddresses>
    for alkahest_rs::clients::obligations::hook_based::HookBasedAddresses
{
    type Error = PyErr;

    fn try_from(value: HookBasedAddresses) -> PyResult<Self> {
        macro_rules! parse_address {
            ($name:ident) => {
                value
                    .$name
                    .parse()
                    .map_err(|_| PyValueError::new_err("invalid address"))?
            };
        }

        Ok(Self {
            eas: parse_address!(eas),
            hook_escrow_obligation: parse_address!(hook_escrow_obligation),
            hooks_escrow_obligation: parse_address!(hooks_escrow_obligation),
            erc20_escrow_hook: parse_address!(erc20_escrow_hook),
            erc721_escrow_hook: parse_address!(erc721_escrow_hook),
            erc1155_escrow_hook: parse_address!(erc1155_escrow_hook),
            native_token_escrow_hook: parse_address!(native_token_escrow_hook),
            attestation_escrow_hook: parse_address!(attestation_escrow_hook),
            attestation_reference_escrow_hook: parse_address!(attestation_reference_escrow_hook),
        })
    }
}

impl TryFrom<SplittersAddresses> for alkahest_rs::clients::splitters::SplittersAddresses {
    type Error = PyErr;

    fn try_from(value: SplittersAddresses) -> PyResult<Self> {
        macro_rules! parse_address {
            ($name:ident) => {
                value
                    .$name
                    .parse()
                    .map_err(|_| PyValueError::new_err("invalid address"))?
            };
        }

        Ok(Self {
            erc20_splitter: parse_address!(erc20_splitter),
            erc1155_splitter: parse_address!(erc1155_splitter),
            native_token_splitter: parse_address!(native_token_splitter),
            token_bundle_splitter: parse_address!(token_bundle_splitter),
            token_bundle_splitter_unvalidated: parse_address!(token_bundle_splitter_unvalidated),
            commitment_erc20_splitter: parse_address!(commitment_erc20_splitter),
            commitment_erc1155_splitter: parse_address!(commitment_erc1155_splitter),
            commitment_native_token_splitter: parse_address!(commitment_native_token_splitter),
            commitment_token_bundle_splitter: parse_address!(commitment_token_bundle_splitter),
            commitment_token_bundle_splitter_unvalidated: parse_address!(
                commitment_token_bundle_splitter_unvalidated
            ),
        })
    }
}

impl TryFrom<OracleAddresses> for alkahest_rs::clients::oracle::OracleAddresses {
    type Error = PyErr;

    fn try_from(value: OracleAddresses) -> PyResult<Self> {
        macro_rules! parse_address {
            ($name:ident) => {
                value
                    .$name
                    .parse()
                    .map_err(|_| PyValueError::new_err("invalid address"))?
            };
        }

        Ok(Self {
            eas: parse_address!(eas),
            trusted_oracle_arbiter: parse_address!(trusted_oracle_arbiter),
        })
    }
}

impl TryFrom<DefaultExtensionConfig> for alkahest_rs::DefaultExtensionConfig {
    type Error = PyErr;

    fn try_from(value: DefaultExtensionConfig) -> PyResult<Self> {
        Ok(Self {
            erc20_addresses: value
                .erc20_addresses
                .and_then(|x| x.try_into().ok())
                .unwrap_or_default(),
            erc721_addresses: value
                .erc721_addresses
                .and_then(|x| x.try_into().ok())
                .unwrap_or_default(),
            erc1155_addresses: value
                .erc1155_addresses
                .and_then(|x| x.try_into().ok())
                .unwrap_or_default(),
            native_token_addresses: value
                .native_token_addresses
                .and_then(|x| x.try_into().ok())
                .unwrap_or_default(),
            token_bundle_addresses: value
                .token_bundle_addresses
                .and_then(|x| x.try_into().ok())
                .unwrap_or_default(),
            hook_based_addresses: value
                .hook_based_addresses
                .and_then(|x| x.try_into().ok())
                .unwrap_or_default(),
            splitters_addresses: value
                .splitters_addresses
                .and_then(|x| x.try_into().ok())
                .unwrap_or_default(),
            attestation_addresses: value
                .attestation_addresses
                .and_then(|x| x.try_into().ok())
                .unwrap_or_default(),
            arbiters_addresses: value
                .arbiters_addresses
                .and_then(|x| x.try_into().ok())
                .unwrap_or_default(),
            string_obligation_addresses: value
                .string_obligation_addresses
                .and_then(|x| x.try_into().ok())
                .unwrap_or_default(),
            commit_reveal_obligation_addresses: value
                .commit_reveal_obligation_addresses
                .and_then(|x| x.try_into().ok())
                .unwrap_or_default(),
        })
    }
}

// Implement TryFrom for ArbitersAddresses
impl TryFrom<ArbitersAddresses> for alkahest_rs::clients::arbiters::ArbitersAddresses {
    type Error = PyErr;

    fn try_from(value: ArbitersAddresses) -> PyResult<Self> {
        macro_rules! parse_address {
            ($name:ident) => {
                value
                    .$name
                    .parse()
                    .map_err(|_| PyValueError::new_err("invalid address"))?
            };
        }

        Ok(Self {
            eas: parse_address!(eas),
            trivial_arbiter: parse_address!(trivial_arbiter),
            trusted_oracle_arbiter: parse_address!(trusted_oracle_arbiter),
            commitment_trusted_oracle_arbiter: parse_address!(commitment_trusted_oracle_arbiter),
            intrinsics_arbiter: parse_address!(intrinsics_arbiter),
            erc8004_arbiter: parse_address!(erc8004_arbiter),
            references_escrow_arbiter: parse_address!(references_escrow_arbiter),
            any_arbiter: parse_address!(any_arbiter),
            all_arbiter: parse_address!(all_arbiter),
            attester_arbiter: parse_address!(attester_arbiter),
            expiration_time_after_arbiter: parse_address!(expiration_time_after_arbiter),
            expiration_time_before_arbiter: parse_address!(expiration_time_before_arbiter),
            expiration_time_equal_arbiter: parse_address!(expiration_time_equal_arbiter),
            recipient_arbiter: parse_address!(recipient_arbiter),
            ref_uid_arbiter: parse_address!(ref_uid_arbiter),
            revocable_arbiter: parse_address!(revocable_arbiter),
            schema_arbiter: parse_address!(schema_arbiter),
            time_after_arbiter: parse_address!(time_after_arbiter),
            time_before_arbiter: parse_address!(time_before_arbiter),
            time_equal_arbiter: parse_address!(time_equal_arbiter),
            uid_arbiter: parse_address!(uid_arbiter),
            exclusive_revocable_confirmation_arbiter: parse_address!(
                exclusive_revocable_confirmation_arbiter
            ),
            exclusive_unrevocable_confirmation_arbiter: parse_address!(
                exclusive_unrevocable_confirmation_arbiter
            ),
            nonexclusive_revocable_confirmation_arbiter: parse_address!(
                nonexclusive_revocable_confirmation_arbiter
            ),
            nonexclusive_unrevocable_confirmation_arbiter: parse_address!(
                nonexclusive_unrevocable_confirmation_arbiter
            ),
        })
    }
}

#[derive(FromPyObject)]
#[pyo3(from_item_all)]
pub struct ArbiterData {
    pub arbiter: String,
    pub demand: Vec<u8>,
}

impl TryFrom<ArbiterData> for alkahest_rs::types::ArbiterData {
    type Error = eyre::Error;

    fn try_from(value: ArbiterData) -> eyre::Result<Self> {
        Ok(Self {
            arbiter: value.arbiter.parse()?,
            demand: value.demand.into(),
        })
    }
}

#[derive(FromPyObject)]
#[pyo3(from_item_all)]
pub struct Erc20Data {
    pub address: String,
    pub value: u64,
}

impl TryFrom<Erc20Data> for alkahest_rs::types::Erc20Data {
    type Error = eyre::Error;

    fn try_from(value: Erc20Data) -> eyre::Result<Self> {
        Ok(Self {
            address: value.address.parse()?,
            value: U256::from(value.value),
        })
    }
}

use pyo3::prelude::*;
use pyo3::types::PyType;

#[pyclass]
#[derive(Clone)]
pub struct PyErc20Data {
    #[pyo3(get)]
    pub address: String,

    #[pyo3(get)]
    pub value: u64,
}

#[pymethods]
impl PyErc20Data {
    #[new]
    pub fn new(address: String, value: u64) -> Self {
        Self { address, value }
    }
}

impl TryFrom<PyErc20Data> for alkahest_rs::types::Erc20Data {
    type Error = eyre::Error;

    fn try_from(value: PyErc20Data) -> eyre::Result<Self> {
        Ok(Self {
            address: value.address.parse()?,
            value: U256::from(value.value),
        })
    }
}

#[derive(FromPyObject)]
#[pyo3(from_item_all)]
pub struct Erc721Data {
    pub address: String,
    pub id: u128,
}

impl TryFrom<Erc721Data> for alkahest_rs::types::Erc721Data {
    type Error = eyre::Error;

    fn try_from(value: Erc721Data) -> eyre::Result<Self> {
        Ok(Self {
            address: value.address.parse()?,
            id: value.id.try_into()?,
        })
    }
}

#[derive(FromPyObject)]
#[pyo3(from_item_all)]
pub struct Erc1155Data {
    address: String,
    id: u128,
    value: u128,
}

impl TryFrom<Erc1155Data> for alkahest_rs::types::Erc1155Data {
    type Error = eyre::Error;

    fn try_from(value: Erc1155Data) -> eyre::Result<Self> {
        Ok(Self {
            address: value.address.parse()?,
            id: value.id.try_into()?,
            value: value.value.try_into()?,
        })
    }
}

#[derive(FromPyObject)]
#[pyo3(from_item_all)]
pub struct NativeTokenData {
    pub value: u128,
}

impl TryFrom<NativeTokenData> for alkahest_rs::types::NativeTokenData {
    type Error = eyre::Error;

    fn try_from(value: NativeTokenData) -> eyre::Result<Self> {
        Ok(Self {
            value: U256::from(value.value),
        })
    }
}

#[derive(FromPyObject)]
#[pyo3(from_item_all)]
pub struct TokenBundleData {
    native_amount: Option<u128>,
    erc20s: Vec<Erc20Data>,
    erc721s: Vec<Erc721Data>,
    erc1155s: Vec<Erc1155Data>,
}

impl TryFrom<TokenBundleData> for alkahest_rs::types::TokenBundleData {
    type Error = eyre::Error;

    fn try_from(value: TokenBundleData) -> eyre::Result<Self> {
        let erc20s = value
            .erc20s
            .into_iter()
            .map(|x| x.try_into())
            .collect::<eyre::Result<Vec<_>>>()?;
        let erc721s = value
            .erc721s
            .into_iter()
            .map(|x| x.try_into())
            .collect::<eyre::Result<Vec<_>>>()?;
        let erc1155s = value
            .erc1155s
            .into_iter()
            .map(|x| x.try_into())
            .collect::<eyre::Result<Vec<_>>>()?;

        Ok(Self {
            native_amount: U256::from(value.native_amount.unwrap_or(0)),
            erc20s,
            erc721s,
            erc1155s,
        })
    }
}

#[derive(IntoPyObject)]
pub struct EscowClaimedLog {
    pub payment: String,
    pub fulfillment: String,
    pub fulfiller: String,
}

impl From<EscrowClaimed> for EscowClaimedLog {
    fn from(value: EscrowClaimed) -> Self {
        Self {
            payment: value.payment.to_string(),
            fulfillment: value.fulfillment.to_string(),
            fulfiller: value.fulfiller.to_string(),
        }
    }
}

#[derive(IntoPyObject)]
pub struct AttestedLog {
    pub recipient: String,
    pub attester: String,
    pub uid: String,
    pub schema_uid: String,
}

impl From<Attested> for AttestedLog {
    fn from(value: Attested) -> Self {
        Self {
            recipient: value.recipient.to_string(),
            attester: value.attester.to_string(),
            uid: value.uid.to_string(),
            schema_uid: value.schemaUID.to_string(),
        }
    }
}

#[derive(FromPyObject)]
pub struct AttestationRequestData {
    pub recipient: String,
    pub expiration_time: u64,
    pub revocable: bool,
    pub ref_uid: String,
    pub data: Vec<u8>,
    pub value: u128,
}

#[derive(FromPyObject)]
pub struct AttestationRequest {
    pub schema: String,
    pub data: AttestationRequestData,
}

impl TryFrom<AttestationRequestData> for alkahest_rs::contracts::IEAS::AttestationRequestData {
    type Error = eyre::Error;

    fn try_from(value: AttestationRequestData) -> eyre::Result<Self> {
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

impl TryFrom<AttestationRequest> for alkahest_rs::contracts::IEAS::AttestationRequest {
    type Error = eyre::Error;

    fn try_from(value: AttestationRequest) -> eyre::Result<Self> {
        let schema: FixedBytes<32> = value.schema.parse()?;
        Ok(Self {
            schema,
            data: value.data.try_into()?,
        })
    }
}

#[derive(IntoPyObject)]
pub struct LogWithHash<T> {
    pub log: T,
    pub transaction_hash: String,
}

#[pyclass]
#[derive(Clone)]
pub struct PyContractAddressInfo {
    #[pyo3(get)]
    pub address: String,
    #[pyo3(get)]
    pub section: String,
    #[pyo3(get)]
    pub field: String,
    #[pyo3(get)]
    pub escrow_kind: Option<String>,
}

#[pymethods]
impl PyContractAddressInfo {
    #[new]
    pub fn new(
        address: String,
        section: String,
        field: String,
        escrow_kind: Option<String>,
    ) -> Self {
        Self {
            address,
            section,
            field,
            escrow_kind,
        }
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyDefaultExtensionConfig {
    #[pyo3(get)]
    pub erc20_addresses: Option<PyErc20Addresses>,
    #[pyo3(get)]
    pub erc721_addresses: Option<PyErc721Addresses>,
    #[pyo3(get)]
    pub erc1155_addresses: Option<PyErc1155Addresses>,
    #[pyo3(get)]
    pub native_token_addresses: Option<PyNativeTokenAddresses>,
    #[pyo3(get)]
    pub token_bundle_addresses: Option<PyTokenBundleAddresses>,
    #[pyo3(get)]
    pub hook_based_addresses: Option<PyHookBasedAddresses>,
    #[pyo3(get)]
    pub splitters_addresses: Option<PySplittersAddresses>,
    #[pyo3(get)]
    pub attestation_addresses: Option<PyAttestationAddresses>,
    #[pyo3(get)]
    pub arbiters_addresses: Option<PyArbitersAddresses>,
    #[pyo3(get)]
    pub string_obligation_addresses: Option<PyStringObligationAddresses>,
    #[pyo3(get)]
    pub commit_reveal_obligation_addresses: Option<PyCommitRevealObligationAddresses>,
}

impl From<&alkahest_rs::DefaultExtensionConfig> for PyDefaultExtensionConfig {
    fn from(data: &alkahest_rs::DefaultExtensionConfig) -> Self {
        Self {
            erc20_addresses: Some(PyErc20Addresses::from(&data.erc20_addresses)),
            erc721_addresses: Some(PyErc721Addresses::from(&data.erc721_addresses)),
            erc1155_addresses: Some(PyErc1155Addresses::from(&data.erc1155_addresses)),
            native_token_addresses: Some(PyNativeTokenAddresses::from(
                &data.native_token_addresses,
            )),
            token_bundle_addresses: Some(PyTokenBundleAddresses::from(
                &data.token_bundle_addresses,
            )),
            hook_based_addresses: Some(PyHookBasedAddresses::from(&data.hook_based_addresses)),
            splitters_addresses: Some(PySplittersAddresses::from(&data.splitters_addresses)),
            attestation_addresses: Some(PyAttestationAddresses::from(&data.attestation_addresses)),
            arbiters_addresses: Some(PyArbitersAddresses::from(&data.arbiters_addresses)),
            string_obligation_addresses: Some(PyStringObligationAddresses::from(
                &data.string_obligation_addresses,
            )),
            commit_reveal_obligation_addresses: Some(PyCommitRevealObligationAddresses::from(
                &data.commit_reveal_obligation_addresses,
            )),
        }
    }
}

#[pymethods]
impl PyDefaultExtensionConfig {
    /// Return the address config for one of the SDK's known chains.
    ///
    /// Mirrors the TS SDK's chain-name-keyed lookup. Accepted names:
    ///   "base_sepolia"        — default; matches the Rust `Default` impl
    ///   "ethereum_sepolia"
    ///   "ethereum_mainnet"
    ///   "genlayer_bradbury"
    ///
    /// For local anvil or any chain not in this list, construct a
    /// `DefaultExtensionConfig` manually from the address sub-types.
    #[classmethod]
    fn for_chain(_cls: &Bound<'_, PyType>, name: &str) -> PyResult<Self> {
        let normalized = name.trim().to_ascii_lowercase();
        let cfg: &alkahest_rs::DefaultExtensionConfig = match normalized.as_str() {
            "base_sepolia" => &alkahest_rs::addresses::BASE_SEPOLIA_ADDRESSES,
            "ethereum_sepolia" => &alkahest_rs::addresses::ETHEREUM_SEPOLIA_ADDRESSES,
            "ethereum_mainnet" | "ethereum" | "mainnet" => {
                &alkahest_rs::addresses::ETHEREUM_ADDRESSES
            }
            "genlayer_bradbury" => &alkahest_rs::addresses::GENLAYER_BRADBURY_ADDRESSES,
            other => {
                return Err(PyValueError::new_err(format!(
                    "Unknown chain '{}'. Supported: {:?}",
                    other,
                    Self::supported_chains_inner(),
                )));
            }
        };
        Ok(Self::from(cfg))
    }

    /// Return the list of chain names accepted by `for_chain`.
    #[classmethod]
    fn supported_chains(_cls: &Bound<'_, PyType>) -> Vec<String> {
        Self::supported_chains_inner()
    }

    /// Return the SDK default config (Base Sepolia). Equivalent to passing
    /// `None` as `address_config` to `AlkahestClient`, but explicit.
    #[classmethod]
    fn default_config(_cls: &Bound<'_, PyType>) -> Self {
        Self::from(&alkahest_rs::addresses::BASE_SEPOLIA_ADDRESSES)
    }

    /// Return all config slots that match `address`.
    fn lookup_address(&self, address: &str) -> Vec<PyContractAddressInfo> {
        let needle = normalize_address(address);
        self.address_infos_inner()
            .into_iter()
            .filter(|info| normalize_address(&info.address) == needle)
            .collect()
    }

    /// Return a reverse index from lower-case address to matching config slots.
    fn address_index(&self) -> std::collections::HashMap<String, Vec<PyContractAddressInfo>> {
        let mut index = std::collections::HashMap::new();
        for info in self.address_infos_inner() {
            index
                .entry(normalize_address(&info.address))
                .or_insert_with(Vec::new)
                .push(info);
        }
        index
    }
}

impl PyDefaultExtensionConfig {
    fn supported_chains_inner() -> Vec<String> {
        vec![
            "base_sepolia".to_string(),
            "ethereum_sepolia".to_string(),
            "ethereum_mainnet".to_string(),
            "genlayer_bradbury".to_string(),
        ]
    }

    fn address_infos_inner(&self) -> Vec<PyContractAddressInfo> {
        let mut out = Vec::new();

        if let Some(section) = &self.arbiters_addresses {
            add_py_info(&mut out, &section.eas, "arbiters_addresses", "eas", None);
            add_py_info(
                &mut out,
                &section.trivial_arbiter,
                "arbiters_addresses",
                "trivial_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.trusted_oracle_arbiter,
                "arbiters_addresses",
                "trusted_oracle_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.commitment_trusted_oracle_arbiter,
                "arbiters_addresses",
                "commitment_trusted_oracle_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.intrinsics_arbiter,
                "arbiters_addresses",
                "intrinsics_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.erc8004_arbiter,
                "arbiters_addresses",
                "erc8004_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.references_escrow_arbiter,
                "arbiters_addresses",
                "references_escrow_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.any_arbiter,
                "arbiters_addresses",
                "any_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.all_arbiter,
                "arbiters_addresses",
                "all_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.attester_arbiter,
                "arbiters_addresses",
                "attester_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.expiration_time_after_arbiter,
                "arbiters_addresses",
                "expiration_time_after_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.expiration_time_before_arbiter,
                "arbiters_addresses",
                "expiration_time_before_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.expiration_time_equal_arbiter,
                "arbiters_addresses",
                "expiration_time_equal_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.recipient_arbiter,
                "arbiters_addresses",
                "recipient_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.ref_uid_arbiter,
                "arbiters_addresses",
                "ref_uid_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.revocable_arbiter,
                "arbiters_addresses",
                "revocable_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.schema_arbiter,
                "arbiters_addresses",
                "schema_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.time_after_arbiter,
                "arbiters_addresses",
                "time_after_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.time_before_arbiter,
                "arbiters_addresses",
                "time_before_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.time_equal_arbiter,
                "arbiters_addresses",
                "time_equal_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.uid_arbiter,
                "arbiters_addresses",
                "uid_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.exclusive_revocable_confirmation_arbiter,
                "arbiters_addresses",
                "exclusive_revocable_confirmation_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.exclusive_unrevocable_confirmation_arbiter,
                "arbiters_addresses",
                "exclusive_unrevocable_confirmation_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.nonexclusive_revocable_confirmation_arbiter,
                "arbiters_addresses",
                "nonexclusive_revocable_confirmation_arbiter",
                None,
            );
            add_py_info(
                &mut out,
                &section.nonexclusive_unrevocable_confirmation_arbiter,
                "arbiters_addresses",
                "nonexclusive_unrevocable_confirmation_arbiter",
                None,
            );
        }

        add_py_payment_infos(
            &mut out,
            self.erc20_addresses.as_ref(),
            "erc20_addresses",
            "erc20",
        );
        add_py_payment_infos(
            &mut out,
            self.erc721_addresses.as_ref(),
            "erc721_addresses",
            "erc721",
        );
        add_py_payment_infos(
            &mut out,
            self.erc1155_addresses.as_ref(),
            "erc1155_addresses",
            "erc1155",
        );
        add_py_payment_infos(
            &mut out,
            self.native_token_addresses.as_ref(),
            "native_token_addresses",
            "native_token",
        );
        add_py_payment_infos(
            &mut out,
            self.token_bundle_addresses.as_ref(),
            "token_bundle_addresses",
            "token_bundle",
        );

        if let Some(section) = &self.hook_based_addresses {
            add_py_info(&mut out, &section.eas, "hook_based_addresses", "eas", None);
            add_py_info(
                &mut out,
                &section.hook_escrow_obligation,
                "hook_based_addresses",
                "hook_escrow_obligation",
                None,
            );
            add_py_info(
                &mut out,
                &section.hooks_escrow_obligation,
                "hook_based_addresses",
                "hooks_escrow_obligation",
                None,
            );
            add_py_info(
                &mut out,
                &section.erc20_escrow_hook,
                "hook_based_addresses",
                "erc20_escrow_hook",
                None,
            );
            add_py_info(
                &mut out,
                &section.erc721_escrow_hook,
                "hook_based_addresses",
                "erc721_escrow_hook",
                None,
            );
            add_py_info(
                &mut out,
                &section.erc1155_escrow_hook,
                "hook_based_addresses",
                "erc1155_escrow_hook",
                None,
            );
            add_py_info(
                &mut out,
                &section.native_token_escrow_hook,
                "hook_based_addresses",
                "native_token_escrow_hook",
                None,
            );
            add_py_info(
                &mut out,
                &section.attestation_escrow_hook,
                "hook_based_addresses",
                "attestation_escrow_hook",
                None,
            );
            add_py_info(
                &mut out,
                &section.attestation_reference_escrow_hook,
                "hook_based_addresses",
                "attestation_reference_escrow_hook",
                None,
            );
        }

        if let Some(section) = &self.splitters_addresses {
            add_py_info(
                &mut out,
                &section.erc20_splitter,
                "splitters_addresses",
                "erc20_splitter",
                None,
            );
            add_py_info(
                &mut out,
                &section.erc1155_splitter,
                "splitters_addresses",
                "erc1155_splitter",
                None,
            );
            add_py_info(
                &mut out,
                &section.native_token_splitter,
                "splitters_addresses",
                "native_token_splitter",
                None,
            );
            add_py_info(
                &mut out,
                &section.token_bundle_splitter,
                "splitters_addresses",
                "token_bundle_splitter",
                None,
            );
            add_py_info(
                &mut out,
                &section.token_bundle_splitter_unvalidated,
                "splitters_addresses",
                "token_bundle_splitter_unvalidated",
                None,
            );
            add_py_info(
                &mut out,
                &section.commitment_erc20_splitter,
                "splitters_addresses",
                "commitment_erc20_splitter",
                None,
            );
            add_py_info(
                &mut out,
                &section.commitment_erc1155_splitter,
                "splitters_addresses",
                "commitment_erc1155_splitter",
                None,
            );
            add_py_info(
                &mut out,
                &section.commitment_native_token_splitter,
                "splitters_addresses",
                "commitment_native_token_splitter",
                None,
            );
            add_py_info(
                &mut out,
                &section.commitment_token_bundle_splitter,
                "splitters_addresses",
                "commitment_token_bundle_splitter",
                None,
            );
            add_py_info(
                &mut out,
                &section.commitment_token_bundle_splitter_unvalidated,
                "splitters_addresses",
                "commitment_token_bundle_splitter_unvalidated",
                None,
            );
        }

        if let Some(section) = &self.attestation_addresses {
            add_py_info(&mut out, &section.eas, "attestation_addresses", "eas", None);
            add_py_info(
                &mut out,
                &section.eas_schema_registry,
                "attestation_addresses",
                "eas_schema_registry",
                None,
            );
            add_py_info(
                &mut out,
                &section.atomic_attestation_utils,
                "attestation_addresses",
                "atomic_attestation_utils",
                None,
            );
            add_py_info(
                &mut out,
                &section.escrow_obligation_default,
                "attestation_addresses",
                "escrow_obligation_default",
                Some("attestation_escrow_obligation_default"),
            );
            add_py_info(
                &mut out,
                &section.escrow_obligation_unconditional,
                "attestation_addresses",
                "escrow_obligation_unconditional",
                Some("attestation_escrow_obligation_unconditional"),
            );
            add_py_info(
                &mut out,
                &section.attestation_reference_escrow_obligation_default,
                "attestation_addresses",
                "attestation_reference_escrow_obligation_default",
                Some("attestation_reference_escrow_obligation_default"),
            );
            add_py_info(
                &mut out,
                &section.attestation_reference_escrow_obligation_unconditional,
                "attestation_addresses",
                "attestation_reference_escrow_obligation_unconditional",
                Some("attestation_reference_escrow_obligation_unconditional"),
            );
        }

        if let Some(section) = &self.string_obligation_addresses {
            add_py_info(
                &mut out,
                &section.eas,
                "string_obligation_addresses",
                "eas",
                None,
            );
            add_py_info(
                &mut out,
                &section.obligation,
                "string_obligation_addresses",
                "obligation",
                None,
            );
        }
        if let Some(section) = &self.commit_reveal_obligation_addresses {
            add_py_info(
                &mut out,
                &section.eas,
                "commit_reveal_obligation_addresses",
                "eas",
                None,
            );
            add_py_info(
                &mut out,
                &section.obligation,
                "commit_reveal_obligation_addresses",
                "obligation",
                None,
            );
        }

        out
    }
}

fn normalize_address(address: &str) -> String {
    address.trim().to_ascii_lowercase()
}

fn add_py_payment_infos(
    out: &mut Vec<PyContractAddressInfo>,
    section: Option<&impl PyPaymentAddresses>,
    section_name: &str,
    escrow_prefix: &str,
) {
    if let Some(section) = section {
        add_py_info(out, section.eas(), section_name, "eas", None);
        add_py_info(
            out,
            section.atomic_payment_utils(),
            section_name,
            "atomic_payment_utils",
            None,
        );
        add_py_info(
            out,
            section.escrow_obligation_default(),
            section_name,
            "escrow_obligation_default",
            Some(&format!("{escrow_prefix}_escrow_obligation_default")),
        );
        add_py_info(
            out,
            section.escrow_obligation_unconditional(),
            section_name,
            "escrow_obligation_unconditional",
            Some(&format!("{escrow_prefix}_escrow_obligation_unconditional")),
        );
        add_py_info(
            out,
            section.payment_obligation(),
            section_name,
            "payment_obligation",
            None,
        );
    }
}

fn add_py_info(
    out: &mut Vec<PyContractAddressInfo>,
    address: &str,
    section: &str,
    field: &str,
    escrow_kind: Option<&str>,
) {
    out.push(PyContractAddressInfo {
        address: address.to_string(),
        section: section.to_string(),
        field: field.to_string(),
        escrow_kind: escrow_kind.map(str::to_string),
    });
}

trait PyPaymentAddresses {
    fn eas(&self) -> &str;
    fn atomic_payment_utils(&self) -> &str;
    fn escrow_obligation_default(&self) -> &str;
    fn escrow_obligation_unconditional(&self) -> &str;
    fn payment_obligation(&self) -> &str;
}

macro_rules! impl_py_payment_addresses {
    ($name:ident) => {
        impl PyPaymentAddresses for $name {
            fn eas(&self) -> &str {
                &self.eas
            }

            fn atomic_payment_utils(&self) -> &str {
                &self.atomic_payment_utils
            }

            fn escrow_obligation_default(&self) -> &str {
                &self.escrow_obligation_default
            }

            fn escrow_obligation_unconditional(&self) -> &str {
                &self.escrow_obligation_unconditional
            }

            fn payment_obligation(&self) -> &str {
                &self.payment_obligation
            }
        }
    };
}

macro_rules! py_address_struct {
    ($name:ident, $src:path) => {
        #[pyclass]
        #[derive(Clone)]
        pub struct $name {
            #[pyo3(get)]
            pub eas: String,
            #[pyo3(get)]
            pub atomic_payment_utils: String,
            #[pyo3(get)]
            pub escrow_obligation_default: String,
            #[pyo3(get)]
            pub escrow_obligation_unconditional: String,
            #[pyo3(get)]
            pub payment_obligation: String,
        }

        #[pymethods]
        impl $name {
            #[new]
            pub fn new(
                eas: String,
                atomic_payment_utils: String,
                escrow_obligation_default: String,
                escrow_obligation_unconditional: String,
                payment_obligation: String,
            ) -> Self {
                Self {
                    eas,
                    atomic_payment_utils,
                    escrow_obligation_default,
                    escrow_obligation_unconditional,
                    payment_obligation,
                }
            }
        }

        impl From<&$src> for $name {
            fn from(data: &$src) -> Self {
                Self {
                    eas: format!("{:?}", data.eas),
                    atomic_payment_utils: format!("{:?}", data.atomic_payment_utils),
                    escrow_obligation_default: format!("{:?}", data.escrow_obligation_default),
                    escrow_obligation_unconditional: format!(
                        "{:?}",
                        data.escrow_obligation_unconditional
                    ),
                    payment_obligation: format!("{:?}", data.payment_obligation),
                }
            }
        }
    };
}

py_address_struct!(
    PyErc20Addresses,
    alkahest_rs::clients::erc20::Erc20Addresses
);
py_address_struct!(
    PyErc721Addresses,
    alkahest_rs::clients::erc721::Erc721Addresses
);
py_address_struct!(
    PyErc1155Addresses,
    alkahest_rs::clients::erc1155::Erc1155Addresses
);
py_address_struct!(
    PyTokenBundleAddresses,
    alkahest_rs::clients::token_bundle::TokenBundleAddresses
);
py_address_struct!(
    PyNativeTokenAddresses,
    alkahest_rs::clients::native_token::NativeTokenAddresses
);

impl_py_payment_addresses!(PyErc20Addresses);
impl_py_payment_addresses!(PyErc721Addresses);
impl_py_payment_addresses!(PyErc1155Addresses);
impl_py_payment_addresses!(PyTokenBundleAddresses);
impl_py_payment_addresses!(PyNativeTokenAddresses);

#[pyclass]
#[derive(Clone)]
pub struct PyHookBasedAddresses {
    #[pyo3(get)]
    pub eas: String,
    #[pyo3(get)]
    pub hook_escrow_obligation: String,
    #[pyo3(get)]
    pub hooks_escrow_obligation: String,
    #[pyo3(get)]
    pub erc20_escrow_hook: String,
    #[pyo3(get)]
    pub erc721_escrow_hook: String,
    #[pyo3(get)]
    pub erc1155_escrow_hook: String,
    #[pyo3(get)]
    pub native_token_escrow_hook: String,
    #[pyo3(get)]
    pub attestation_escrow_hook: String,
    #[pyo3(get)]
    pub attestation_reference_escrow_hook: String,
}

#[pymethods]
impl PyHookBasedAddresses {
    #[new]
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        eas: String,
        hook_escrow_obligation: String,
        hooks_escrow_obligation: String,
        erc20_escrow_hook: String,
        erc721_escrow_hook: String,
        erc1155_escrow_hook: String,
        native_token_escrow_hook: String,
        attestation_escrow_hook: String,
        attestation_reference_escrow_hook: String,
    ) -> Self {
        Self {
            eas,
            hook_escrow_obligation,
            hooks_escrow_obligation,
            erc20_escrow_hook,
            erc721_escrow_hook,
            erc1155_escrow_hook,
            native_token_escrow_hook,
            attestation_escrow_hook,
            attestation_reference_escrow_hook,
        }
    }
}

impl From<&alkahest_rs::clients::hook_based::HookBasedAddresses> for PyHookBasedAddresses {
    fn from(data: &alkahest_rs::clients::hook_based::HookBasedAddresses) -> Self {
        Self {
            eas: format!("{:?}", data.eas),
            hook_escrow_obligation: format!("{:?}", data.hook_escrow_obligation),
            hooks_escrow_obligation: format!("{:?}", data.hooks_escrow_obligation),
            erc20_escrow_hook: format!("{:?}", data.erc20_escrow_hook),
            erc721_escrow_hook: format!("{:?}", data.erc721_escrow_hook),
            erc1155_escrow_hook: format!("{:?}", data.erc1155_escrow_hook),
            native_token_escrow_hook: format!("{:?}", data.native_token_escrow_hook),
            attestation_escrow_hook: format!("{:?}", data.attestation_escrow_hook),
            attestation_reference_escrow_hook: format!(
                "{:?}",
                data.attestation_reference_escrow_hook
            ),
        }
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PySplittersAddresses {
    #[pyo3(get)]
    pub erc20_splitter: String,
    #[pyo3(get)]
    pub erc1155_splitter: String,
    #[pyo3(get)]
    pub native_token_splitter: String,
    #[pyo3(get)]
    pub token_bundle_splitter: String,
    #[pyo3(get)]
    pub token_bundle_splitter_unvalidated: String,
    #[pyo3(get)]
    pub commitment_erc20_splitter: String,
    #[pyo3(get)]
    pub commitment_erc1155_splitter: String,
    #[pyo3(get)]
    pub commitment_native_token_splitter: String,
    #[pyo3(get)]
    pub commitment_token_bundle_splitter: String,
    #[pyo3(get)]
    pub commitment_token_bundle_splitter_unvalidated: String,
}

#[pymethods]
impl PySplittersAddresses {
    #[new]
    pub fn new(
        erc20_splitter: String,
        erc1155_splitter: String,
        native_token_splitter: String,
        token_bundle_splitter: String,
        token_bundle_splitter_unvalidated: String,
        commitment_erc20_splitter: String,
        commitment_erc1155_splitter: String,
        commitment_native_token_splitter: String,
        commitment_token_bundle_splitter: String,
        commitment_token_bundle_splitter_unvalidated: String,
    ) -> Self {
        Self {
            erc20_splitter,
            erc1155_splitter,
            native_token_splitter,
            token_bundle_splitter,
            token_bundle_splitter_unvalidated,
            commitment_erc20_splitter,
            commitment_erc1155_splitter,
            commitment_native_token_splitter,
            commitment_token_bundle_splitter,
            commitment_token_bundle_splitter_unvalidated,
        }
    }
}

impl From<&alkahest_rs::clients::splitters::SplittersAddresses> for PySplittersAddresses {
    fn from(data: &alkahest_rs::clients::splitters::SplittersAddresses) -> Self {
        Self {
            erc20_splitter: format!("{:?}", data.erc20_splitter),
            erc1155_splitter: format!("{:?}", data.erc1155_splitter),
            native_token_splitter: format!("{:?}", data.native_token_splitter),
            token_bundle_splitter: format!("{:?}", data.token_bundle_splitter),
            token_bundle_splitter_unvalidated: format!(
                "{:?}",
                data.token_bundle_splitter_unvalidated
            ),
            commitment_erc20_splitter: format!("{:?}", data.commitment_erc20_splitter),
            commitment_erc1155_splitter: format!("{:?}", data.commitment_erc1155_splitter),
            commitment_native_token_splitter: format!(
                "{:?}",
                data.commitment_native_token_splitter
            ),
            commitment_token_bundle_splitter: format!(
                "{:?}",
                data.commitment_token_bundle_splitter
            ),
            commitment_token_bundle_splitter_unvalidated: format!(
                "{:?}",
                data.commitment_token_bundle_splitter_unvalidated
            ),
        }
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyAttestationAddresses {
    #[pyo3(get)]
    pub eas: String,
    #[pyo3(get)]
    pub eas_schema_registry: String,
    #[pyo3(get)]
    pub atomic_attestation_utils: String,
    #[pyo3(get)]
    pub escrow_obligation_default: String,
    #[pyo3(get)]
    pub escrow_obligation_unconditional: String,
    #[pyo3(get)]
    pub attestation_reference_escrow_obligation_default: String,
    #[pyo3(get)]
    pub attestation_reference_escrow_obligation_unconditional: String,
}

#[pymethods]
impl PyAttestationAddresses {
    #[new]
    pub fn new(
        eas: String,
        eas_schema_registry: String,
        atomic_attestation_utils: String,
        escrow_obligation_default: String,
        escrow_obligation_unconditional: String,
        attestation_reference_escrow_obligation_default: String,
        attestation_reference_escrow_obligation_unconditional: String,
    ) -> Self {
        Self {
            eas,
            eas_schema_registry,
            atomic_attestation_utils,
            escrow_obligation_default,
            escrow_obligation_unconditional,
            attestation_reference_escrow_obligation_default,
            attestation_reference_escrow_obligation_unconditional,
        }
    }
}

impl From<&alkahest_rs::clients::attestation::AttestationAddresses> for PyAttestationAddresses {
    fn from(data: &alkahest_rs::clients::attestation::AttestationAddresses) -> Self {
        Self {
            eas: format!("{:?}", data.eas),
            eas_schema_registry: format!("{:?}", data.eas_schema_registry),
            atomic_attestation_utils: format!("{:?}", data.atomic_attestation_utils),
            escrow_obligation_default: format!("{:?}", data.escrow_obligation_default),
            escrow_obligation_unconditional: format!("{:?}", data.escrow_obligation_unconditional),
            attestation_reference_escrow_obligation_default: format!(
                "{:?}",
                data.attestation_reference_escrow_obligation_default
            ),
            attestation_reference_escrow_obligation_unconditional: format!(
                "{:?}",
                data.attestation_reference_escrow_obligation_unconditional
            ),
        }
    }
}
#[pyclass]
#[derive(Clone)]
pub struct PyArbitersAddresses {
    #[pyo3(get)]
    pub eas: String,
    #[pyo3(get)]
    pub trivial_arbiter: String,
    #[pyo3(get)]
    pub trusted_oracle_arbiter: String,
    #[pyo3(get)]
    pub commitment_trusted_oracle_arbiter: String,
    #[pyo3(get)]
    pub intrinsics_arbiter: String,
    #[pyo3(get)]
    pub erc8004_arbiter: String,
    #[pyo3(get)]
    pub references_escrow_arbiter: String,
    #[pyo3(get)]
    pub any_arbiter: String,
    #[pyo3(get)]
    pub all_arbiter: String,
    #[pyo3(get)]
    pub attester_arbiter: String,
    #[pyo3(get)]
    pub expiration_time_after_arbiter: String,
    #[pyo3(get)]
    pub expiration_time_before_arbiter: String,
    #[pyo3(get)]
    pub expiration_time_equal_arbiter: String,
    #[pyo3(get)]
    pub recipient_arbiter: String,
    #[pyo3(get)]
    pub ref_uid_arbiter: String,
    #[pyo3(get)]
    pub revocable_arbiter: String,
    #[pyo3(get)]
    pub schema_arbiter: String,
    #[pyo3(get)]
    pub time_after_arbiter: String,
    #[pyo3(get)]
    pub time_before_arbiter: String,
    #[pyo3(get)]
    pub time_equal_arbiter: String,
    #[pyo3(get)]
    pub uid_arbiter: String,
    #[pyo3(get)]
    pub exclusive_revocable_confirmation_arbiter: String,
    #[pyo3(get)]
    pub exclusive_unrevocable_confirmation_arbiter: String,
    #[pyo3(get)]
    pub nonexclusive_revocable_confirmation_arbiter: String,
    #[pyo3(get)]
    pub nonexclusive_unrevocable_confirmation_arbiter: String,
}

impl From<&alkahest_rs::clients::arbiters::ArbitersAddresses> for PyArbitersAddresses {
    fn from(data: &alkahest_rs::clients::arbiters::ArbitersAddresses) -> Self {
        Self {
            eas: format!("{:?}", data.eas),
            trivial_arbiter: format!("{:?}", data.trivial_arbiter),
            trusted_oracle_arbiter: format!("{:?}", data.trusted_oracle_arbiter),
            commitment_trusted_oracle_arbiter: format!(
                "{:?}",
                data.commitment_trusted_oracle_arbiter
            ),
            intrinsics_arbiter: format!("{:?}", data.intrinsics_arbiter),
            erc8004_arbiter: format!("{:?}", data.erc8004_arbiter),
            references_escrow_arbiter: format!("{:?}", data.references_escrow_arbiter),
            any_arbiter: format!("{:?}", data.any_arbiter),
            all_arbiter: format!("{:?}", data.all_arbiter),
            attester_arbiter: format!("{:?}", data.attester_arbiter),
            expiration_time_after_arbiter: format!("{:?}", data.expiration_time_after_arbiter),
            expiration_time_before_arbiter: format!("{:?}", data.expiration_time_before_arbiter),
            expiration_time_equal_arbiter: format!("{:?}", data.expiration_time_equal_arbiter),
            recipient_arbiter: format!("{:?}", data.recipient_arbiter),
            ref_uid_arbiter: format!("{:?}", data.ref_uid_arbiter),
            revocable_arbiter: format!("{:?}", data.revocable_arbiter),
            schema_arbiter: format!("{:?}", data.schema_arbiter),
            time_after_arbiter: format!("{:?}", data.time_after_arbiter),
            time_before_arbiter: format!("{:?}", data.time_before_arbiter),
            time_equal_arbiter: format!("{:?}", data.time_equal_arbiter),
            uid_arbiter: format!("{:?}", data.uid_arbiter),
            exclusive_revocable_confirmation_arbiter: format!(
                "{:?}",
                data.exclusive_revocable_confirmation_arbiter
            ),
            exclusive_unrevocable_confirmation_arbiter: format!(
                "{:?}",
                data.exclusive_unrevocable_confirmation_arbiter
            ),
            nonexclusive_revocable_confirmation_arbiter: format!(
                "{:?}",
                data.nonexclusive_revocable_confirmation_arbiter
            ),
            nonexclusive_unrevocable_confirmation_arbiter: format!(
                "{:?}",
                data.nonexclusive_unrevocable_confirmation_arbiter
            ),
        }
    }
}
#[pyclass]
#[derive(Clone)]
pub struct PyStringObligationAddresses {
    #[pyo3(get)]
    pub eas: String,
    #[pyo3(get)]
    pub obligation: String,
}

#[pymethods]
impl PyStringObligationAddresses {
    #[new]
    pub fn new(eas: String, obligation: String) -> Self {
        Self { eas, obligation }
    }
}

impl From<&alkahest_rs::clients::string_obligation::StringObligationAddresses>
    for PyStringObligationAddresses
{
    fn from(data: &alkahest_rs::clients::string_obligation::StringObligationAddresses) -> Self {
        Self {
            eas: format!("{:?}", data.eas),
            obligation: format!("{:?}", data.obligation),
        }
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyCommitRevealObligationAddresses {
    #[pyo3(get)]
    pub eas: String,
    #[pyo3(get)]
    pub obligation: String,
}

#[pymethods]
impl PyCommitRevealObligationAddresses {
    #[new]
    pub fn new(eas: String, obligation: String) -> Self {
        Self { eas, obligation }
    }
}

impl From<&alkahest_rs::clients::commit_reveal_obligation::CommitRevealObligationAddresses>
    for PyCommitRevealObligationAddresses
{
    fn from(
        data: &alkahest_rs::clients::commit_reveal_obligation::CommitRevealObligationAddresses,
    ) -> Self {
        Self {
            eas: format!("{:?}", data.eas),
            obligation: format!("{:?}", data.obligation),
        }
    }
}
