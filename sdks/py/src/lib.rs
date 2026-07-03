use std::str::FromStr;

use alkahest_rs::{
    clients::{
        attestation::AttestationAddresses, erc1155::Erc1155Addresses, erc20::Erc20Addresses,
        erc721::Erc721Addresses, native_token::NativeTokenAddresses, oracle::OracleAddresses,
        splitters::SplittersAddresses, string_obligation::StringObligationAddresses,
        token_bundle::TokenBundleAddresses,
    },
    contracts::IEAS::Attested,
    extensions::{
        AlkahestExtension, ArbitersModule, AttestationModule, CommitRevealObligationModule,
        Erc1155Module, Erc20Module, Erc721Module, HasArbiters, HasAttestation, HasCommitReveal,
        HasErc1155, HasErc20, HasErc721, HasHookBased, HasNativeToken, HasOracle, HasSplitters,
        HasStringObligation, HasTokenBundle, HookBasedModule, NativeTokenModule, NoExtension,
        OracleModule, SplittersModule, StringObligationModule, TokenBundleModule,
    },
    AlkahestClient,
};
use alloy::{
    primitives::{Address, FixedBytes, Log},
    rpc::types::TransactionReceipt,
    signers::local::PrivateKeySigner,
    sol_types::SolEvent,
};
use clients::{
    arbiters::{trusted_oracle::OracleClient, ArbitersClient},
    obligations::{
        attestation::AttestationClient, commit_reveal::CommitRevealObligationClient,
        erc1155::Erc1155Client, erc20::Erc20Client, erc721::Erc721Client,
        hook_based::HookBasedClient, native_token::NativeTokenClient,
        string::StringObligationClient, token_bundle::TokenBundleClient,
    },
    splitters::SplittersClient,
};
use pyo3::{
    pyclass, pymethods, pymodule,
    types::{PyAnyMethods, PyModule, PyModuleMethods},
    Bound, FromPyObject, PyAny, PyResult, Python,
};
use tokio::runtime::Runtime;
use types::{DefaultExtensionConfig, EscowClaimedLog};

use crate::{
    clients::splitters::{
        PyAmountSplit, PyAmountSplitterClient, PyAmountSplitterNamespace, PyBundleSplit,
        PyBundleSplitterClient, PyBundleSplitterNamespace, PyCommitmentAmountSplitterClient,
        PyCommitmentBundleSplitterClient, PySplitterDemandData,
    },
    clients::{
        arbiters::trusted_oracle::{
            PyArbitrationMode, PyAttestationWithDemand, PyCommitmentArbitrationMadeLog,
            PyCommitmentArbitrationRequestedLog, PyCommitmentTrustedOracleArbiterDemandData,
            PyDecision, PyOracleAddresses, PyOracleAttestation, PyTrustedOracleArbiterDemandData,
        },
        obligations::{
            attestation::{
                PyAttestationEscrowObligationData, PyAttestationReferenceEscrowObligationData,
            },
            commit_reveal::{PyCommitRevealDemandData, PyCommitRevealObligationData},
            erc1155::{PyERC1155EscrowObligationData, PyERC1155PaymentObligationData},
            erc20::{PyERC20EscrowObligationData, PyERC20PaymentObligationData},
            erc721::{PyERC721EscrowObligationData, PyERC721PaymentObligationData},
            hook_based::{
                PyAmountHookData, PyAttestationHookData, PyAttestationReferenceHookData,
                PyErc1155HookData, PyHookEscrowObligationData, PyHooksEscrowObligationData,
                PyNativeTokenHookData, PyTokenIdHookData,
            },
            native_token::{PyNativeTokenEscrowObligationData, PyNativeTokenPaymentObligationData},
            string::PyStringObligationData,
            token_bundle::{PyTokenBundleEscrowObligationData, PyTokenBundlePaymentObligationData},
        },
    },
    contract::{
        PyAttestation, PyAttestationRequest, PyAttestationRequestData, PyAttested,
        PyRevocationRequest, PyRevocationRequestData, PyRevoked, PyTimestamped,
    },
    fixtures::{PyMockERC1155, PyMockERC20, PyMockERC721},
    types::PyErc20Data,
    utils::{EnvTestManager, PyWalletProvider},
};

pub mod clients;
pub mod contract;
pub mod error_handling;
pub mod fixtures;
pub mod types;
pub mod utils;

#[pyclass]
#[derive(Clone)]
pub struct PyAlkahestClient {
    inner: std::sync::Arc<dyn std::any::Any + Send + Sync>,
    // Keep the runtime alive for clients we construct ourselves so background
    // websocket tasks spawned during client creation don't get dropped.
    runtime: Option<std::sync::Arc<Runtime>>,
    // Store connection info to create new extension clients
    private_key: Option<String>,
    rpc_url: Option<String>,
    erc20: Option<Erc20Client>,
    erc721: Option<Erc721Client>,
    erc1155: Option<Erc1155Client>,
    native_token: Option<NativeTokenClient>,
    token_bundle: Option<TokenBundleClient>,
    hook_based: Option<HookBasedClient>,
    splitters: Option<SplittersClient>,
    attestation: Option<AttestationClient>,
    string_obligation: Option<StringObligationClient>,
    commit_reveal: Option<CommitRevealObligationClient>,
    oracle: Option<OracleClient>,
    arbiters: Option<ArbitersClient>,
}

impl PyAlkahestClient {
    pub fn from_client(client: alkahest_rs::DefaultAlkahestClient) -> Self {
        Self {
            inner: std::sync::Arc::new(client.clone()),
            runtime: None,
            private_key: None, // Not available when creating from existing client
            rpc_url: None,     // Not available when creating from existing client
            erc20: Some(Erc20Client::new(client.extensions.erc20().clone())),
            erc721: Some(Erc721Client::new(client.extensions.erc721().clone())),
            erc1155: Some(Erc1155Client::new(client.extensions.erc1155().clone())),
            native_token: Some(NativeTokenClient::new(
                client.extensions.native_token().clone(),
            )),
            token_bundle: Some(TokenBundleClient::new(
                client.extensions.token_bundle().clone(),
            )),
            hook_based: Some(HookBasedClient::new(client.extensions.hook_based().clone())),
            splitters: Some(SplittersClient::new(client.extensions.splitters().clone())),
            attestation: Some(AttestationClient::new(
                client.extensions.attestation().clone(),
            )),
            string_obligation: Some(StringObligationClient::new(
                client.extensions.string_obligation().clone(),
            )),
            commit_reveal: Some(CommitRevealObligationClient::new(
                client.extensions.commit_reveal().clone(),
            )),
            oracle: Some(OracleClient::new(client.extensions.oracle().clone())),
            arbiters: Some(ArbitersClient::new(client.extensions.arbiters().clone())),
        }
    }

    /// Create a PyAlkahestClient from a client with a single extension
    pub fn from_client_with_single_extension<T>(
        client: alkahest_rs::AlkahestClient<T>,
        extension_type: &str,
    ) -> Self
    where
        T: AlkahestExtension + Clone + Send + Sync + 'static,
    {
        // For now, we'll leave all extensions as None since extracting the specific
        // extension from the generic client type is complex. In a full implementation,
        // we would need to match on the extension type and extract the appropriate
        // extension to create the wrapper client.

        // The client still has the extension functionality in the inner client,
        // but the Python wrapper doesn't expose it through the .erc20, .erc721, etc. properties
        Self {
            inner: std::sync::Arc::new(client),
            runtime: None,     // Runtime is managed externally in this constructor path
            private_key: None, // Connection info not available when creating from existing client
            rpc_url: None,     // Connection info not available when creating from existing client
            erc20: None,       // TODO: Extract if extension_type == "erc20"
            erc721: None,      // TODO: Extract if extension_type == "erc721"
            erc1155: None,     // TODO: Extract if extension_type == "erc1155"
            native_token: None, // TODO: Extract if extension_type == "native_token"
            token_bundle: None, // TODO: Extract if extension_type == "token_bundle"
            hook_based: None,  // TODO: Extract if extension_type == "hook_based"
            splitters: None,   // TODO: Extract if extension_type == "splitters"
            attestation: None, // TODO: Extract if extension_type == "attestation"
            string_obligation: None, // TODO: Extract if extension_type == "string_obligation"
            commit_reveal: None, // TODO: Extract if extension_type == "commit_reveal"
            oracle: None,      // TODO: Extract if extension_type == "oracle"
            arbiters: None,    // TODO: Extract if extension_type == "arbiters"
        }
    }
}

#[pymethods]
impl PyAlkahestClient {
    #[new]
    #[pyo3(signature = (private_key, rpc_url, address_config=None, poll_interval_seconds=None))]
    pub fn __new__(
        private_key: String,
        rpc_url: String,
        address_config: Option<DefaultExtensionConfig>,
        poll_interval_seconds: Option<f64>,
    ) -> PyResult<Self> {
        let address_config = address_config.map(|x| x.try_into()).transpose()?;

        // Convert private_key String to LocalSigner
        let signer = PrivateKeySigner::from_str(&private_key)
            .map_err(|e| eyre::eyre!("Failed to parse private key: {}", e))?;

        // Create a shared runtime
        let runtime = std::sync::Arc::new(Runtime::new()?);

        // Optional poll interval (only meaningful for HTTP transports).
        let poll_interval = poll_interval_seconds.map(std::time::Duration::from_secs_f64);

        // Since new is async, we must block_on it
        let client: alkahest_rs::DefaultAlkahestClient = runtime.clone().block_on(async {
            alkahest_rs::AlkahestClient::with_base_extensions_with_poll_interval(
                signer.clone(),
                rpc_url.clone(),
                address_config,
                poll_interval,
            )
            .await
        })?;

        let client = Self {
            inner: std::sync::Arc::new(client.clone()),
            runtime: Some(runtime.clone()),
            private_key: Some(private_key.clone()),
            rpc_url: Some(rpc_url.clone()),
            erc20: Some(Erc20Client::new(client.extensions.erc20().clone())),
            erc721: Some(Erc721Client::new(client.extensions.erc721().clone())),
            erc1155: Some(Erc1155Client::new(client.extensions.erc1155().clone())),
            native_token: Some(NativeTokenClient::new(
                client.extensions.native_token().clone(),
            )),
            token_bundle: Some(TokenBundleClient::new(
                client.extensions.token_bundle().clone(),
            )),
            hook_based: Some(HookBasedClient::new(client.extensions.hook_based().clone())),
            splitters: Some(SplittersClient::new(client.extensions.splitters().clone())),
            attestation: Some(AttestationClient::new(
                client.extensions.attestation().clone(),
            )),
            string_obligation: Some(StringObligationClient::new(
                client.extensions.string_obligation().clone(),
            )),
            commit_reveal: Some(CommitRevealObligationClient::new(
                client.extensions.commit_reveal().clone(),
            )),
            oracle: Some(OracleClient::new(client.extensions.oracle().clone())),
            arbiters: Some(ArbitersClient::new(client.extensions.arbiters().clone())),
        };

        Ok(client)
    }

    /// List available extensions
    pub fn list_extensions(&self) -> Vec<String> {
        vec![
            "erc20".to_string(),
            "erc721".to_string(),
            "erc1155".to_string(),
            "native_token".to_string(),
            "token_bundle".to_string(),
            "hook_based".to_string(),
            "splitters".to_string(),
            "attestation".to_string(),
            "string_obligation".to_string(),
            "commit_reveal".to_string(),
            "oracle".to_string(),
            "arbiters".to_string(),
        ]
    }

    /// Check if a specific extension is available
    pub fn has_extension(&self, extension_type: String) -> bool {
        match extension_type.as_str() {
            "erc20" => self.erc20.is_some(),
            "erc721" => self.erc721.is_some(),
            "erc1155" => self.erc1155.is_some(),
            "native_token" => self.native_token.is_some(),
            "token_bundle" => self.token_bundle.is_some(),
            "hook_based" => self.hook_based.is_some(),
            "splitters" => self.splitters.is_some(),
            "attestation" => self.attestation.is_some(),
            "string_obligation" => self.string_obligation.is_some(),
            "commit_reveal" => self.commit_reveal.is_some(),
            "oracle" => self.oracle.is_some(),
            "arbiters" => self.arbiters.is_some(),
            _ => false,
        }
    }

    #[getter]
    pub fn erc20(&self) -> PyResult<Erc20Client> {
        self.erc20.clone().ok_or_else(|| {
            pyo3::PyErr::new::<pyo3::exceptions::PyAttributeError, _>(
                "ERC20 extension is not available in this client",
            )
        })
    }

    #[getter]
    pub fn erc721(&self) -> PyResult<Erc721Client> {
        self.erc721.clone().ok_or_else(|| {
            pyo3::PyErr::new::<pyo3::exceptions::PyAttributeError, _>(
                "ERC721 extension is not available in this client",
            )
        })
    }

    #[getter]
    pub fn erc1155(&self) -> PyResult<Erc1155Client> {
        self.erc1155.clone().ok_or_else(|| {
            pyo3::PyErr::new::<pyo3::exceptions::PyAttributeError, _>(
                "ERC1155 extension is not available in this client",
            )
        })
    }

    #[getter]
    pub fn native_token(&self) -> PyResult<NativeTokenClient> {
        self.native_token.clone().ok_or_else(|| {
            pyo3::PyErr::new::<pyo3::exceptions::PyAttributeError, _>(
                "NativeToken extension is not available in this client",
            )
        })
    }

    #[getter]
    pub fn token_bundle(&self) -> PyResult<TokenBundleClient> {
        self.token_bundle.clone().ok_or_else(|| {
            pyo3::PyErr::new::<pyo3::exceptions::PyAttributeError, _>(
                "TokenBundle extension is not available in this client",
            )
        })
    }

    #[getter]
    pub fn hook_based(&self) -> PyResult<HookBasedClient> {
        self.hook_based.clone().ok_or_else(|| {
            pyo3::PyErr::new::<pyo3::exceptions::PyAttributeError, _>(
                "HookBased extension is not available in this client",
            )
        })
    }

    #[getter]
    pub fn splitters(&self) -> PyResult<SplittersClient> {
        self.splitters.clone().ok_or_else(|| {
            pyo3::PyErr::new::<pyo3::exceptions::PyAttributeError, _>(
                "Splitters extension is not available in this client",
            )
        })
    }

    #[getter]
    pub fn attestation(&self) -> PyResult<AttestationClient> {
        self.attestation.clone().ok_or_else(|| {
            pyo3::PyErr::new::<pyo3::exceptions::PyAttributeError, _>(
                "Attestation extension is not available in this client",
            )
        })
    }

    #[getter]
    pub fn string_obligation(&self) -> PyResult<StringObligationClient> {
        self.string_obligation.clone().ok_or_else(|| {
            pyo3::PyErr::new::<pyo3::exceptions::PyAttributeError, _>(
                "StringObligation extension is not available in this client",
            )
        })
    }

    #[getter]
    pub fn commit_reveal(&self) -> PyResult<CommitRevealObligationClient> {
        self.commit_reveal.clone().ok_or_else(|| {
            pyo3::PyErr::new::<pyo3::exceptions::PyAttributeError, _>(
                "CommitRevealObligation extension is not available in this client",
            )
        })
    }

    #[getter]
    pub fn oracle(&self) -> PyResult<OracleClient> {
        self.oracle.clone().ok_or_else(|| {
            pyo3::PyErr::new::<pyo3::exceptions::PyAttributeError, _>(
                "Oracle extension is not available in this client",
            )
        })
    }

    #[getter]
    pub fn arbiters(&self) -> PyResult<ArbitersClient> {
        self.arbiters.clone().ok_or_else(|| {
            pyo3::PyErr::new::<pyo3::exceptions::PyAttributeError, _>(
                "Arbiters extension is not available in this client",
            )
        })
    }

    /// Extract obligation data from a fulfillment attestation
    ///
    /// Returns the string obligation data from the attestation
    pub fn extract_obligation_data(
        &self,
        attestation: &crate::clients::arbiters::trusted_oracle::PyOracleAttestation,
    ) -> PyResult<String> {
        use alkahest_rs::contracts::obligations::StringObligation;
        use alloy::hex;
        use alloy::sol_types::SolType;

        let data_bytes = hex::decode(
            attestation
                .data
                .strip_prefix("0x")
                .unwrap_or(&attestation.data),
        )
        .map_err(|e| {
            pyo3::PyErr::new::<pyo3::exceptions::PyValueError, _>(format!(
                "Failed to decode data hex: {}",
                e
            ))
        })?;

        let obligation_data =
            StringObligation::ObligationData::abi_decode(&data_bytes).map_err(|e| {
                pyo3::PyErr::new::<pyo3::exceptions::PyValueError, _>(format!(
                    "Failed to decode obligation data: {}",
                    e
                ))
            })?;

        Ok(obligation_data.item)
    }

    /// Get the escrow attestation that this fulfillment references via refUID
    pub fn get_escrow_attestation<'py>(
        &self,
        py: Python<'py>,
        fulfillment: &crate::clients::arbiters::trusted_oracle::PyOracleAttestation,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let attestation_client = self.attestation.clone().ok_or_else(|| {
            pyo3::PyErr::new::<pyo3::exceptions::PyAttributeError, _>(
                "Attestation extension is not available in this client",
            )
        })?;

        let ref_uid: FixedBytes<32> = fulfillment.ref_uid.parse().map_err(|e| {
            pyo3::PyErr::new::<pyo3::exceptions::PyValueError, _>(format!("Parse error: {}", e))
        })?;

        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let escrow: alkahest_rs::contracts::IEAS::Attestation = attestation_client
                .inner
                .util()
                .get_attestation(ref_uid)
                .await
                .map_err(|e| {
                    pyo3::PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{}", e))
                })?;
            Ok(crate::clients::arbiters::trusted_oracle::PyOracleAttestation::from(&escrow))
        })
    }

    /// Extract demand data from an escrow attestation
    pub fn extract_demand_data(
        &self,
        escrow_attestation: &crate::clients::arbiters::trusted_oracle::PyOracleAttestation,
    ) -> PyResult<crate::clients::arbiters::trusted_oracle::PyTrustedOracleArbiterDemandData> {
        use alkahest_rs::contracts::arbiters::TrustedOracleArbiter;
        use alloy::{hex, sol, sol_types::SolType};

        sol! {
            struct ArbiterDemand {
                address oracle;
                bytes demand;
            }
        }

        let data_bytes = hex::decode(
            escrow_attestation
                .data
                .strip_prefix("0x")
                .unwrap_or(&escrow_attestation.data),
        )
        .map_err(|e| {
            pyo3::PyErr::new::<pyo3::exceptions::PyValueError, _>(format!(
                "Failed to decode data hex: {}",
                e
            ))
        })?;

        let arbiter_demand = ArbiterDemand::abi_decode(&data_bytes).map_err(|e| {
            pyo3::PyErr::new::<pyo3::exceptions::PyValueError, _>(format!(
                "Failed to decode arbiter demand: {}",
                e
            ))
        })?;

        let demand_data = TrustedOracleArbiter::DemandData::abi_decode(&arbiter_demand.demand)
            .map_err(|e| {
                pyo3::PyErr::new::<pyo3::exceptions::PyValueError, _>(format!(
                    "Failed to decode demand data: {}",
                    e
                ))
            })?;

        Ok(
            crate::clients::arbiters::trusted_oracle::PyTrustedOracleArbiterDemandData::from(
                demand_data,
            ),
        )
    }

    /// Get escrow attestation and extract demand data in one call
    pub fn get_escrow_and_demand<'py>(
        &self,
        py: Python<'py>,
        fulfillment: &crate::clients::arbiters::trusted_oracle::PyOracleAttestation,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let attestation_client = self.attestation.clone().ok_or_else(|| {
            pyo3::PyErr::new::<pyo3::exceptions::PyAttributeError, _>(
                "Attestation extension is not available in this client",
            )
        })?;

        let ref_uid: FixedBytes<32> = fulfillment.ref_uid.parse().map_err(|e| {
            pyo3::PyErr::new::<pyo3::exceptions::PyValueError, _>(format!("Parse error: {}", e))
        })?;

        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            use alkahest_rs::contracts::arbiters::TrustedOracleArbiter;
            use alloy::{hex, sol, sol_types::SolType};

            sol! {
                struct ArbiterDemand {
                    address oracle;
                    bytes demand;
                }
            }

            let escrow: alkahest_rs::contracts::IEAS::Attestation = attestation_client
                .inner
                .util()
                .get_attestation(ref_uid)
                .await
                .map_err(|e| {
                    pyo3::PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{}", e))
                })?;

            let data_bytes = hex::decode(
                format!("0x{}", hex::encode(&escrow.data))
                    .strip_prefix("0x")
                    .unwrap(),
            )
            .unwrap_or(escrow.data.to_vec());

            let arbiter_demand = ArbiterDemand::abi_decode(&data_bytes).map_err(|e| {
                pyo3::PyErr::new::<pyo3::exceptions::PyValueError, _>(format!(
                    "Failed to decode arbiter demand: {}",
                    e
                ))
            })?;

            let demand_data = TrustedOracleArbiter::DemandData::abi_decode(&arbiter_demand.demand)
                .map_err(|e| {
                    pyo3::PyErr::new::<pyo3::exceptions::PyValueError, _>(format!(
                        "Failed to decode demand data: {}",
                        e
                    ))
                })?;

            let py_escrow =
                crate::clients::arbiters::trusted_oracle::PyOracleAttestation::from(&escrow);
            let py_demand =
                crate::clients::arbiters::trusted_oracle::PyTrustedOracleArbiterDemandData::from(
                    demand_data,
                );

            Ok((py_escrow, py_demand))
        })
    }

    #[pyo3(signature = (contract_address, buy_attestation, from_block=None))]
    pub fn wait_for_fulfillment<'py>(
        &self,
        py: Python<'py>,
        contract_address: String,
        buy_attestation: String,
        from_block: Option<u64>,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let contract_address: Address = contract_address.parse().map_err(|e| {
                pyo3::PyErr::new::<pyo3::exceptions::PyValueError, _>(format!("Parse error: {}", e))
            })?;
            let buy_attestation: FixedBytes<32> = buy_attestation.parse().map_err(|e| {
                pyo3::PyErr::new::<pyo3::exceptions::PyValueError, _>(format!("Parse error: {}", e))
            })?;

            // Try to downcast to the appropriate client type
            let res = if let Some(client) = inner.downcast_ref::<AlkahestClient>() {
                client
                    .wait_for_fulfillment(contract_address, buy_attestation, from_block)
                    .await
                    .map_err(|e| {
                        pyo3::PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{}", e))
                    })?
            } else if let Some(client) =
                inner.downcast_ref::<alkahest_rs::AlkahestClient<NoExtension>>()
            {
                client
                    .wait_for_fulfillment(contract_address, buy_attestation, from_block)
                    .await
                    .map_err(|e| {
                        pyo3::PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("{}", e))
                    })?
            } else {
                return Err(pyo3::PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(
                    "Unknown client type",
                ));
            };

            let result: EscowClaimedLog = res.data.into();
            Ok(result)
        })
    }
}

pub fn get_attested_event(receipt: TransactionReceipt) -> eyre::Result<Log<Attested>> {
    let attested_event = receipt
        .inner
        .logs()
        .iter()
        .filter(|log| log.topic0() == Some(&Attested::SIGNATURE_HASH))
        .collect::<Vec<_>>()
        .first()
        .map(|log| log.log_decode::<Attested>())
        .ok_or_else(|| eyre::eyre!("No Attested event found"))??;

    Ok(attested_event.inner)
}

#[pymodule]
fn alkahest_py(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_class::<PyAlkahestClient>()?;
    m.add_class::<StringObligationClient>()?;
    m.add_class::<OracleClient>()?;
    m.add_class::<PyOracleAddresses>()?;
    m.add_class::<PyOracleAttestation>()?;
    m.add_class::<PyAttestationWithDemand>()?;
    m.add_class::<PyDecision>()?;
    m.add_class::<PyArbitrationMode>()?;
    m.add_class::<PyTrustedOracleArbiterDemandData>()?;
    m.add_class::<PyCommitmentTrustedOracleArbiterDemandData>()?;
    m.add_class::<PyCommitmentArbitrationRequestedLog>()?;
    m.add_class::<PyCommitmentArbitrationMadeLog>()?;
    m.add_class::<EnvTestManager>()?;
    m.add_class::<PyWalletProvider>()?;
    m.add_class::<PyMockERC20>()?;
    m.add_class::<PyMockERC721>()?;
    m.add_class::<PyMockERC1155>()?;
    m.add_class::<PyERC20EscrowObligationData>()?;
    m.add_class::<PyERC20PaymentObligationData>()?;
    m.add_class::<PyERC721EscrowObligationData>()?;
    m.add_class::<PyERC721PaymentObligationData>()?;
    m.add_class::<PyERC1155EscrowObligationData>()?;
    m.add_class::<PyERC1155PaymentObligationData>()?;
    m.add_class::<PyNativeTokenEscrowObligationData>()?;
    m.add_class::<PyNativeTokenPaymentObligationData>()?;
    m.add_class::<PyTokenBundleEscrowObligationData>()?;
    m.add_class::<PyTokenBundlePaymentObligationData>()?;
    m.add_class::<HookBasedClient>()?;
    m.add_class::<PyHookEscrowObligationData>()?;
    m.add_class::<PyHooksEscrowObligationData>()?;
    m.add_class::<PyAmountHookData>()?;
    m.add_class::<PyTokenIdHookData>()?;
    m.add_class::<PyErc1155HookData>()?;
    m.add_class::<PyNativeTokenHookData>()?;
    m.add_class::<PyAttestationHookData>()?;
    m.add_class::<PyAttestationReferenceHookData>()?;
    m.add_class::<SplittersClient>()?;
    m.add_class::<PyAmountSplitterNamespace>()?;
    m.add_class::<PyAmountSplitterClient>()?;
    m.add_class::<PyCommitmentAmountSplitterClient>()?;
    m.add_class::<PyBundleSplitterNamespace>()?;
    m.add_class::<PyBundleSplitterClient>()?;
    m.add_class::<PyCommitmentBundleSplitterClient>()?;
    m.add_class::<PySplitterDemandData>()?;
    m.add_class::<PyAmountSplit>()?;
    m.add_class::<PyBundleSplit>()?;
    m.add_class::<PyAttestationEscrowObligationData>()?;
    m.add_class::<PyAttestationReferenceEscrowObligationData>()?;
    m.add_class::<PyStringObligationData>()?;
    m.add_class::<CommitRevealObligationClient>()?;
    m.add_class::<PyCommitRevealObligationData>()?;
    m.add_class::<PyCommitRevealDemandData>()?;
    m.add_class::<PyErc20Data>()?;
    m.add_class::<crate::types::PyContractAddressInfo>()?;
    m.add_class::<crate::types::PyDefaultExtensionConfig>()?;

    // Arbiters Client and related types
    m.add_class::<ArbitersClient>()?;
    m.add_class::<crate::clients::arbiters::PyArbitrationMadeLog>()?;
    m.add_class::<crate::clients::arbiters::PyConfirmationArbiterType>()?;

    // Confirmation arbiters
    m.add_class::<crate::clients::arbiters::Confirmation>()?;
    m.add_class::<crate::clients::arbiters::ExclusiveRevocable>()?;
    m.add_class::<crate::clients::arbiters::ExclusiveUnrevocable>()?;
    m.add_class::<crate::clients::arbiters::NonexclusiveRevocable>()?;
    m.add_class::<crate::clients::arbiters::NonexclusiveUnrevocable>()?;
    m.add_class::<crate::clients::arbiters::PyConfirmationMadeLog>()?;
    m.add_class::<crate::clients::arbiters::PyConfirmationRequestedLog>()?;

    // Logical arbiters
    m.add_class::<crate::clients::arbiters::Logical>()?;
    m.add_class::<crate::clients::arbiters::AllArbiter>()?;
    m.add_class::<crate::clients::arbiters::AnyArbiter>()?;
    m.add_class::<crate::clients::arbiters::AllArbiterDemandData>()?;
    m.add_class::<crate::clients::arbiters::AnyArbiterDemandData>()?;
    m.add_class::<crate::clients::arbiters::PyDecodedAllArbiterDemandData>()?;
    m.add_class::<crate::clients::arbiters::PyDecodedAnyArbiterDemandData>()?;
    m.add_class::<crate::clients::arbiters::PyDecodedDemand>()?;

    // Attestation properties arbiters
    m.add_class::<crate::clients::arbiters::AttestationProperties>()?;
    m.add_class::<crate::clients::arbiters::AttesterArbiter>()?;
    m.add_class::<crate::clients::arbiters::ExpirationTimeAfterArbiter>()?;
    m.add_class::<crate::clients::arbiters::ExpirationTimeBeforeArbiter>()?;
    m.add_class::<crate::clients::arbiters::ExpirationTimeEqualArbiter>()?;
    m.add_class::<crate::clients::arbiters::RecipientArbiter>()?;
    m.add_class::<crate::clients::arbiters::RefUidArbiter>()?;
    m.add_class::<crate::clients::arbiters::RevocableArbiter>()?;
    m.add_class::<crate::clients::arbiters::SchemaArbiter>()?;
    m.add_class::<crate::clients::arbiters::TimeAfterArbiter>()?;
    m.add_class::<crate::clients::arbiters::TimeBeforeArbiter>()?;
    m.add_class::<crate::clients::arbiters::TimeEqualArbiter>()?;
    m.add_class::<crate::clients::arbiters::UidArbiter>()?;

    // Attestation properties arbiter DemandData types
    m.add_class::<crate::clients::arbiters::AttesterArbiterDemandData>()?;
    m.add_class::<crate::clients::arbiters::ExpirationTimeAfterArbiterDemandData>()?;
    m.add_class::<crate::clients::arbiters::ExpirationTimeBeforeArbiterDemandData>()?;
    m.add_class::<crate::clients::arbiters::ExpirationTimeEqualArbiterDemandData>()?;
    m.add_class::<crate::clients::arbiters::RecipientArbiterDemandData>()?;
    m.add_class::<crate::clients::arbiters::RefUidArbiterDemandData>()?;
    m.add_class::<crate::clients::arbiters::RevocableArbiterDemandData>()?;
    m.add_class::<crate::clients::arbiters::SchemaArbiterDemandData>()?;
    m.add_class::<crate::clients::arbiters::TimeAfterArbiterDemandData>()?;
    m.add_class::<crate::clients::arbiters::TimeBeforeArbiterDemandData>()?;
    m.add_class::<crate::clients::arbiters::TimeEqualArbiterDemandData>()?;
    m.add_class::<crate::clients::arbiters::UidArbiterDemandData>()?;
    // Core arbiter DemandData types
    m.add_class::<crate::clients::arbiters::ERC8004ArbiterDemandData>()?;

    // Address Configuration Classes
    m.add_class::<crate::types::PyErc20Addresses>()?;
    m.add_class::<crate::types::PyErc721Addresses>()?;
    m.add_class::<crate::types::PyErc1155Addresses>()?;
    m.add_class::<crate::types::PyNativeTokenAddresses>()?;
    m.add_class::<crate::types::PyTokenBundleAddresses>()?;
    m.add_class::<crate::types::PyAttestationAddresses>()?;
    m.add_class::<crate::types::PyHookBasedAddresses>()?;
    m.add_class::<crate::types::PySplittersAddresses>()?;
    m.add_class::<crate::types::PyStringObligationAddresses>()?;
    m.add_class::<crate::types::PyCommitRevealObligationAddresses>()?;
    m.add_class::<crate::types::PyArbitersAddresses>()?;

    // IEAS (Ethereum Attestation Service) Types from contract.rs
    m.add_class::<PyAttestation>()?;
    m.add_class::<PyAttestationRequest>()?;
    m.add_class::<PyAttestationRequestData>()?;
    m.add_class::<PyAttested>()?;
    m.add_class::<PyRevocationRequest>()?;
    m.add_class::<PyRevocationRequestData>()?;
    m.add_class::<PyRevoked>()?;
    m.add_class::<PyTimestamped>()?;
    Ok(())
}
