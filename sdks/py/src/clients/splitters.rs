//! Splitter helper client.
//!
//! Mirrors the Rust SDK splitter helpers: address access, demand/split codecs,
//! and decision-key computation.
//!
//! Security note: the underlying splitter contracts have not been included in
//! professional manual audits and have only been reviewed by automated audit
//! tooling so far.

use alkahest_rs::{
    clients::splitters::{
        AmountSplitterArbitrationRequest, AmountSplitterDecision, SplitterArbitrationMode,
        SplitterAsset, SplitterContract, SplitterDecisionTarget,
    },
    contracts,
    extensions::SplittersModule,
};
use alloy::{
    primitives::{keccak256, Address, Bytes, FixedBytes, U256},
    sol_types::SolValue,
};
use pyo3::{pyclass, pymethods, types::PyAnyMethods, PyAny, PyObject, PyResult, Python};
use pyo3_async_runtimes::tokio::{future_into_py, into_future};
use std::{future::Future, pin::Pin, sync::Arc};

use crate::{
    contract::PyAttestation,
    error_handling::{map_eyre_to_pyerr, map_parse_to_pyerr, map_sol_decode_to_pyerr},
};

type BundleSplit = contracts::utils::splitters::token_bundle::TokenBundleSplitterBase::BundleSplit;

#[pyclass]
#[derive(Clone)]
pub struct SplittersClient {
    inner: SplittersModule,
}

impl SplittersClient {
    pub fn new(inner: SplittersModule) -> Self {
        Self { inner }
    }
}

#[pymethods]
impl SplittersClient {
    /// Return a splitter contract address by name.
    pub fn address(&self, contract: String) -> PyResult<String> {
        let address = match contract.as_str() {
            "erc20_splitter" => self.inner.addresses.erc20_splitter,
            "erc1155_splitter" => self.inner.addresses.erc1155_splitter,
            "native_token_splitter" => self.inner.addresses.native_token_splitter,
            "token_bundle_splitter" => self.inner.addresses.token_bundle_splitter,
            "token_bundle_splitter_unvalidated" => {
                self.inner.addresses.token_bundle_splitter_unvalidated
            }
            "commitment_erc20_splitter" => self.inner.addresses.commitment_erc20_splitter,
            "commitment_erc1155_splitter" => self.inner.addresses.commitment_erc1155_splitter,
            "commitment_native_token_splitter" => {
                self.inner.addresses.commitment_native_token_splitter
            }
            "commitment_token_bundle_splitter" => {
                self.inner.addresses.commitment_token_bundle_splitter
            }
            "commitment_token_bundle_splitter_unvalidated" => {
                self.inner
                    .addresses
                    .commitment_token_bundle_splitter_unvalidated
            }
            _ => {
                return Err(pyo3::exceptions::PyValueError::new_err(
                    "unknown splitter contract",
                ))
            }
        };
        Ok(address.to_string())
    }

    /// Return a splitter address selected by asset and decision target.
    ///
    /// `asset` must be one of: "erc20", "erc1155", "native_token",
    /// "token_bundle", "token_bundle_unvalidated".
    /// `target` must be "fulfillment" or "commitment".
    pub fn address_for(&self, asset: String, target: String) -> PyResult<String> {
        let asset = parse_splitter_asset(&asset)?;
        let target = parse_splitter_decision_target(&target)?;
        Ok(self.inner.address_for(asset, target).to_string())
    }

    /// Encode splitter arbiter demand data.
    pub fn encode_demand(&self, data: &PySplitterDemandData) -> PyResult<Vec<u8>> {
        PySplitterDemandData::encode(data)
    }

    /// Decode splitter arbiter demand data.
    pub fn decode_demand(&self, data: Vec<u8>) -> PyResult<PySplitterDemandData> {
        PySplitterDemandData::decode(data)
    }

    /// Compute the splitter decision key for `(fulfillment, escrow)`.
    pub fn decision_key(&self, fulfillment: String, escrow: String) -> PyResult<String> {
        let fulfillment: FixedBytes<32> = fulfillment.parse().map_err(map_parse_to_pyerr)?;
        let escrow: FixedBytes<32> = escrow.parse().map_err(map_parse_to_pyerr)?;

        let mut packed = Vec::with_capacity(64);
        packed.extend_from_slice(fulfillment.as_slice());
        packed.extend_from_slice(escrow.as_slice());
        Ok(keccak256(packed).to_string())
    }

    /// Hash the attestation fields that commitment splitters approve before a UID exists.
    pub fn attestation_intent_hash(&self, attestation: PyAttestation) -> PyResult<String> {
        let attestation = attestation.try_into().map_err(map_eyre_to_pyerr)?;
        Ok(SplittersModule::attestation_intent_hash(&attestation).to_string())
    }

    /// Hash a splitter fulfillment intent, binding attestation fields to a recorded fulfiller.
    pub fn fulfillment_intent_hash(
        &self,
        attestation: PyAttestation,
        fulfiller: String,
    ) -> PyResult<String> {
        let attestation = attestation.try_into().map_err(map_eyre_to_pyerr)?;
        let fulfiller = fulfiller.parse().map_err(map_parse_to_pyerr)?;
        Ok(SplittersModule::fulfillment_intent_hash(&attestation, fulfiller).to_string())
    }

    pub fn arbitrate_amount<'py>(
        &self,
        py: Python<'py>,
        contract: String,
        fulfillment_or_intent: String,
        escrow: String,
        splits: Vec<PyAmountSplit>,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let receipt = inner
                .arbitrate_amount(
                    parse_splitter_contract(&contract)?,
                    fulfillment_or_intent.parse().map_err(map_parse_to_pyerr)?,
                    escrow.parse().map_err(map_parse_to_pyerr)?,
                    parse_amount_splits(&splits)?,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(receipt.transaction_hash.to_string())
        })
    }

    pub fn arbitrate_bundle<'py>(
        &self,
        py: Python<'py>,
        contract: String,
        fulfillment_or_intent: String,
        escrow: String,
        splits: Vec<PyBundleSplit>,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let receipt = inner
                .arbitrate_bundle(
                    parse_splitter_contract(&contract)?,
                    fulfillment_or_intent.parse().map_err(map_parse_to_pyerr)?,
                    escrow.parse().map_err(map_parse_to_pyerr)?,
                    parse_bundle_splits(&splits)?,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(receipt.transaction_hash.to_string())
        })
    }

    pub fn request_arbitration<'py>(
        &self,
        py: Python<'py>,
        contract: String,
        fulfillment_or_intent: String,
        escrow: String,
        oracle: String,
        demand: Vec<u8>,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let receipt = inner
                .request_arbitration(
                    parse_splitter_contract(&contract)?,
                    fulfillment_or_intent.parse().map_err(map_parse_to_pyerr)?,
                    escrow.parse().map_err(map_parse_to_pyerr)?,
                    oracle.parse().map_err(map_parse_to_pyerr)?,
                    demand.into(),
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(receipt.transaction_hash.to_string())
        })
    }

    #[pyo3(signature = (contract, obligation_contract, data, expiration_time, ref_uid, value = "0".to_string()))]
    pub fn create_fulfillment<'py>(
        &self,
        py: Python<'py>,
        contract: String,
        obligation_contract: String,
        data: Vec<u8>,
        expiration_time: u64,
        ref_uid: String,
        value: String,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let receipt = inner
                .create_fulfillment(
                    parse_splitter_contract(&contract)?,
                    obligation_contract.parse().map_err(map_parse_to_pyerr)?,
                    data.into(),
                    expiration_time,
                    ref_uid.parse().map_err(map_parse_to_pyerr)?,
                    value.parse().map_err(map_parse_to_pyerr)?,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(receipt.transaction_hash.to_string())
        })
    }

    #[pyo3(signature = (contract, escrow, obligation_contract, data, expiration_time, ref_uid, value = "0".to_string()))]
    pub fn create_fulfillment_and_collect_and_distribute<'py>(
        &self,
        py: Python<'py>,
        contract: String,
        escrow: String,
        obligation_contract: String,
        data: Vec<u8>,
        expiration_time: u64,
        ref_uid: String,
        value: String,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let receipt = inner
                .create_fulfillment_and_collect_and_distribute(
                    parse_splitter_contract(&contract)?,
                    escrow.parse().map_err(map_parse_to_pyerr)?,
                    obligation_contract.parse().map_err(map_parse_to_pyerr)?,
                    data.into(),
                    expiration_time,
                    ref_uid.parse().map_err(map_parse_to_pyerr)?,
                    value.parse().map_err(map_parse_to_pyerr)?,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(receipt.transaction_hash.to_string())
        })
    }

    pub fn collect_and_distribute<'py>(
        &self,
        py: Python<'py>,
        contract: String,
        escrow: String,
        fulfillment: String,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let receipt = inner
                .collect_and_distribute(
                    parse_splitter_contract(&contract)?,
                    escrow.parse().map_err(map_parse_to_pyerr)?,
                    fulfillment.parse().map_err(map_parse_to_pyerr)?,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(receipt.transaction_hash.to_string())
        })
    }

    pub fn unsafe_partially_collect_and_distribute<'py>(
        &self,
        py: Python<'py>,
        contract: String,
        escrow: String,
        fulfillment: String,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let receipt = inner
                .unsafe_partially_collect_and_distribute(
                    parse_splitter_contract(&contract)?,
                    escrow.parse().map_err(map_parse_to_pyerr)?,
                    fulfillment.parse().map_err(map_parse_to_pyerr)?,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(receipt.transaction_hash.to_string())
        })
    }

    pub fn get_amount_splits<'py>(
        &self,
        py: Python<'py>,
        contract: String,
        oracle: String,
        fulfillment_or_intent: String,
        escrow: String,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let splits = inner
                .get_amount_splits(
                    parse_splitter_contract(&contract)?,
                    oracle.parse().map_err(map_parse_to_pyerr)?,
                    fulfillment_or_intent.parse().map_err(map_parse_to_pyerr)?,
                    escrow.parse().map_err(map_parse_to_pyerr)?,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(splits
                .into_iter()
                .map(PyAmountSplit::from)
                .collect::<Vec<_>>())
        })
    }

    pub fn get_bundle_splits<'py>(
        &self,
        py: Python<'py>,
        contract: String,
        oracle: String,
        fulfillment_or_intent: String,
        escrow: String,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let splits = inner
                .get_bundle_splits(
                    parse_splitter_contract(&contract)?,
                    oracle.parse().map_err(map_parse_to_pyerr)?,
                    fulfillment_or_intent.parse().map_err(map_parse_to_pyerr)?,
                    escrow.parse().map_err(map_parse_to_pyerr)?,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(splits
                .into_iter()
                .map(PyBundleSplit::from)
                .collect::<Vec<_>>())
        })
    }

    pub fn has_decision<'py>(
        &self,
        py: Python<'py>,
        contract: String,
        oracle: String,
        decision_key: String,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let has_decision = inner
                .has_decision(
                    parse_splitter_contract(&contract)?,
                    oracle.parse().map_err(map_parse_to_pyerr)?,
                    decision_key.parse().map_err(map_parse_to_pyerr)?,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(has_decision)
        })
    }

    #[pyo3(signature = (contract, decision_func, callback_func=None, mode=None, timeout_seconds=None))]
    pub fn arbitrate_many_amount<'py>(
        &self,
        py: Python<'py>,
        contract: String,
        decision_func: PyObject,
        callback_func: Option<PyObject>,
        mode: Option<String>,
        timeout_seconds: Option<f64>,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let is_async = Python::with_gil(|py| {
            let inspect = py.import("inspect").ok()?;
            inspect
                .getattr("iscoroutinefunction")
                .ok()?
                .call1((decision_func.clone_ref(py),))
                .ok()?
                .extract::<bool>()
                .ok()
        })
        .unwrap_or(false);

        if is_async {
            return self.arbitrate_many_amount_async_impl(
                py,
                contract,
                decision_func,
                callback_func,
                mode,
                timeout_seconds,
            );
        }

        let inner = self.inner.clone();
        future_into_py(py, async move {
            let contract = parse_splitter_contract(&contract)?;
            let mode = parse_splitter_arbitration_mode(mode.as_deref().unwrap_or("all_unarbitrated"))?;
            let timeout = timeout_seconds.map(std::time::Duration::from_secs_f64);

            let decide = |request: &AmountSplitterArbitrationRequest| -> Option<Vec<contracts::utils::splitters::ERC20Splitter::Split>> {
                Python::with_gil(|py| {
                    let result = decision_func
                        .call1(py, (request.fulfillment.to_string(), request.escrow.to_string(), request.demand.to_vec()))
                        .ok()?;
                    if result.is_none(py) {
                        return None;
                    }
                    let py_splits = result.extract::<Vec<PyAmountSplit>>(py).ok()?;
                    parse_amount_splits(&py_splits).ok()
                })
            };

            let callback = |decision: &AmountSplitterDecision| {
                if let Some(ref py_callback) = callback_func {
                    Python::with_gil(|py| {
                        let py_decision = PyAmountSplitterDecision::from(decision);
                        if let Err(e) = py_callback.call1(py, (py_decision,)) {
                            eprintln!("Python callback failed: {}", e);
                        }
                    });
                }
                Box::pin(async {})
            };

            let result = inner
                .arbitrate_many_amount_blocking_sync(contract, decide, callback, mode, timeout)
                .await
                .map_err(map_eyre_to_pyerr)?;

            Ok(result
                .past_decisions
                .iter()
                .map(PyAmountSplitterDecision::from)
                .collect::<Vec<_>>())
        })
    }

    fn arbitrate_many_amount_async_impl<'py>(
        &self,
        py: Python<'py>,
        contract: String,
        decision_func: PyObject,
        callback_func: Option<PyObject>,
        mode: Option<String>,
        timeout_seconds: Option<f64>,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let contract = parse_splitter_contract(&contract)?;
            let mode = parse_splitter_arbitration_mode(mode.as_deref().unwrap_or("all_unarbitrated"))?;
            let timeout = timeout_seconds.map(std::time::Duration::from_secs_f64);
            let decision_func = Arc::new(decision_func);
            let callback_func = Arc::new(callback_func);

            let decide = move |request: &AmountSplitterArbitrationRequest| -> Pin<
                Box<dyn Future<Output = Option<Vec<contracts::utils::splitters::ERC20Splitter::Split>>> + Send + 'static>,
            > {
                let request = request.clone();
                let decision_func = Arc::clone(&decision_func);
                Box::pin(async move {
                    let coro_result = Python::with_gil(|py| {
                        decision_func
                            .clone_ref(py)
                            .call1(py, (request.fulfillment.to_string(), request.escrow.to_string(), request.demand.to_vec()))
                    });
                    let coro = match coro_result {
                        Ok(coro) => coro,
                        Err(e) => {
                            eprintln!("Python async splitter decision function failed: {}", e);
                            return None;
                        }
                    };
                    if Python::with_gil(|py| coro.is_none(py)) {
                        return None;
                    }
                    let future = match Python::with_gil(|py| into_future(coro.into_bound(py))) {
                        Ok(future) => future,
                        Err(e) => {
                            eprintln!("Failed to convert coroutine to future: {}", e);
                            return None;
                        }
                    };
                    match future.await {
                        Ok(result) => Python::with_gil(|py| {
                            if result.is_none(py) {
                                return None;
                            }
                            let py_splits = result.extract::<Vec<PyAmountSplit>>(py).ok()?;
                            parse_amount_splits(&py_splits).ok()
                        }),
                        Err(e) => {
                            eprintln!("Python async splitter decision function failed: {}", e);
                            None
                        }
                    }
                })
            };

            let callback = move |decision: &AmountSplitterDecision| {
                let callback_func = Arc::clone(&callback_func);
                let py_decision = PyAmountSplitterDecision::from(decision);
                Box::pin(async move {
                    if let Some(ref py_callback) = callback_func.as_ref() {
                        Python::with_gil(|py| {
                            let _ = py_callback.clone_ref(py).call1(py, (py_decision,));
                        });
                    }
                })
            };

            let result = inner
                .arbitrate_many_amount_blocking_async(contract, decide, callback, mode, timeout)
                .await
                .map_err(map_eyre_to_pyerr)?;

            Ok(result
                .past_decisions
                .iter()
                .map(PyAmountSplitterDecision::from)
                .collect::<Vec<_>>())
        })
    }
}

fn parse_splitter_contract(contract: &str) -> PyResult<SplitterContract> {
    match contract {
        "erc20_splitter" => Ok(SplitterContract::Erc20Splitter),
        "erc1155_splitter" => Ok(SplitterContract::Erc1155Splitter),
        "native_token_splitter" => Ok(SplitterContract::NativeTokenSplitter),
        "token_bundle_splitter" => Ok(SplitterContract::TokenBundleSplitter),
        "token_bundle_splitter_unvalidated" => Ok(SplitterContract::TokenBundleSplitterUnvalidated),
        "commitment_erc20_splitter" => Ok(SplitterContract::CommitmentErc20Splitter),
        "commitment_erc1155_splitter" => Ok(SplitterContract::CommitmentErc1155Splitter),
        "commitment_native_token_splitter" => Ok(SplitterContract::CommitmentNativeTokenSplitter),
        "commitment_token_bundle_splitter" => Ok(SplitterContract::CommitmentTokenBundleSplitter),
        "commitment_token_bundle_splitter_unvalidated" => {
            Ok(SplitterContract::CommitmentTokenBundleSplitterUnvalidated)
        }
        _ => Err(pyo3::exceptions::PyValueError::new_err(
            "unknown splitter contract",
        )),
    }
}

fn parse_splitter_asset(asset: &str) -> PyResult<SplitterAsset> {
    match asset {
        "erc20" => Ok(SplitterAsset::Erc20),
        "erc1155" => Ok(SplitterAsset::Erc1155),
        "native_token" => Ok(SplitterAsset::NativeToken),
        "token_bundle" => Ok(SplitterAsset::TokenBundle),
        "token_bundle_unvalidated" => Ok(SplitterAsset::TokenBundleUnvalidated),
        _ => Err(pyo3::exceptions::PyValueError::new_err(
            "unknown splitter asset",
        )),
    }
}

fn parse_splitter_decision_target(target: &str) -> PyResult<SplitterDecisionTarget> {
    match target {
        "fulfillment" => Ok(SplitterDecisionTarget::Fulfillment),
        "commitment" => Ok(SplitterDecisionTarget::Commitment),
        _ => Err(pyo3::exceptions::PyValueError::new_err(
            "unknown splitter decision target",
        )),
    }
}

fn parse_splitter_arbitration_mode(mode: &str) -> PyResult<SplitterArbitrationMode> {
    match mode {
        "past" => Ok(SplitterArbitrationMode::Past),
        "past_unarbitrated" | "pastUnarbitrated" => Ok(SplitterArbitrationMode::PastUnarbitrated),
        "all_unarbitrated" | "allUnarbitrated" => Ok(SplitterArbitrationMode::AllUnarbitrated),
        "all" => Ok(SplitterArbitrationMode::All),
        "future" => Ok(SplitterArbitrationMode::Future),
        _ => Err(pyo3::exceptions::PyValueError::new_err(
            "unknown splitter arbitration mode",
        )),
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PySplitterDemandData {
    #[pyo3(get)]
    pub oracle: String,
    #[pyo3(get)]
    pub data: Vec<u8>,
}

#[pymethods]
impl PySplitterDemandData {
    #[new]
    pub fn new(oracle: String, data: Vec<u8>) -> Self {
        Self { oracle, data }
    }

    #[staticmethod]
    pub fn encode(demand: &PySplitterDemandData) -> PyResult<Vec<u8>> {
        let oracle: Address = demand.oracle.parse().map_err(map_parse_to_pyerr)?;
        Ok(contracts::utils::splitters::ERC20Splitter::DemandData {
            oracle,
            data: Bytes::from(demand.data.clone()),
        }
        .abi_encode())
    }

    #[staticmethod]
    pub fn decode(data: Vec<u8>) -> PyResult<PySplitterDemandData> {
        let decoded = contracts::utils::splitters::ERC20Splitter::DemandData::abi_decode(&data)
            .map_err(map_sol_decode_to_pyerr)?;
        Ok(decoded.into())
    }

    pub fn encode_self(&self) -> PyResult<Vec<u8>> {
        PySplitterDemandData::encode(self)
    }
}

impl From<contracts::utils::splitters::ERC20Splitter::DemandData> for PySplitterDemandData {
    fn from(data: contracts::utils::splitters::ERC20Splitter::DemandData) -> Self {
        Self {
            oracle: data.oracle.to_string(),
            data: data.data.to_vec(),
        }
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyAmountSplit {
    #[pyo3(get)]
    pub recipient: String,
    #[pyo3(get)]
    pub amount: String,
}

#[pymethods]
impl PyAmountSplit {
    #[new]
    pub fn new(recipient: String, amount: String) -> Self {
        Self { recipient, amount }
    }

    #[staticmethod]
    pub fn encode(split: &PyAmountSplit) -> PyResult<Vec<u8>> {
        let recipient: Address = split.recipient.parse().map_err(map_parse_to_pyerr)?;
        let amount: U256 = split.amount.parse().map_err(map_parse_to_pyerr)?;
        Ok(contracts::utils::splitters::ERC20Splitter::Split { recipient, amount }.abi_encode())
    }

    #[staticmethod]
    pub fn decode(data: Vec<u8>) -> PyResult<PyAmountSplit> {
        let decoded = contracts::utils::splitters::ERC20Splitter::Split::abi_decode(&data)
            .map_err(map_sol_decode_to_pyerr)?;
        Ok(decoded.into())
    }

    pub fn encode_self(&self) -> PyResult<Vec<u8>> {
        PyAmountSplit::encode(self)
    }
}

impl From<contracts::utils::splitters::ERC20Splitter::Split> for PyAmountSplit {
    fn from(data: contracts::utils::splitters::ERC20Splitter::Split) -> Self {
        Self {
            recipient: data.recipient.to_string(),
            amount: data.amount.to_string(),
        }
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyAmountSplitterDecision {
    #[pyo3(get)]
    pub fulfillment: String,
    #[pyo3(get)]
    pub escrow: String,
    #[pyo3(get)]
    pub splits: Vec<PyAmountSplit>,
    #[pyo3(get)]
    pub transaction_hash: String,
}

#[pymethods]
impl PyAmountSplitterDecision {
    #[new]
    pub fn new(
        fulfillment: String,
        escrow: String,
        splits: Vec<PyAmountSplit>,
        transaction_hash: String,
    ) -> Self {
        Self {
            fulfillment,
            escrow,
            splits,
            transaction_hash,
        }
    }
}

impl From<&AmountSplitterDecision> for PyAmountSplitterDecision {
    fn from(decision: &AmountSplitterDecision) -> Self {
        Self {
            fulfillment: decision.fulfillment.to_string(),
            escrow: decision.escrow.to_string(),
            splits: decision.splits.iter().cloned().map(PyAmountSplit::from).collect(),
            transaction_hash: decision.receipt.transaction_hash.to_string(),
        }
    }
}

fn parse_amount_splits(
    splits: &[PyAmountSplit],
) -> PyResult<Vec<contracts::utils::splitters::ERC20Splitter::Split>> {
    splits
        .iter()
        .map(|split| {
            Ok(contracts::utils::splitters::ERC20Splitter::Split {
                recipient: split.recipient.parse().map_err(map_parse_to_pyerr)?,
                amount: split.amount.parse().map_err(map_parse_to_pyerr)?,
            })
        })
        .collect()
}

#[pyclass]
#[derive(Clone)]
pub struct PyBundleSplit {
    #[pyo3(get)]
    pub recipient: String,
    #[pyo3(get)]
    pub native_amount: String,
    #[pyo3(get)]
    pub erc20_amounts: Vec<String>,
    #[pyo3(get)]
    pub erc721_indices: Vec<String>,
    #[pyo3(get)]
    pub erc1155_amounts: Vec<String>,
}

#[pymethods]
impl PyBundleSplit {
    #[new]
    pub fn new(
        recipient: String,
        native_amount: String,
        erc20_amounts: Vec<String>,
        erc721_indices: Vec<String>,
        erc1155_amounts: Vec<String>,
    ) -> Self {
        Self {
            recipient,
            native_amount,
            erc20_amounts,
            erc721_indices,
            erc1155_amounts,
        }
    }

    #[staticmethod]
    pub fn encode(split: &PyBundleSplit) -> PyResult<Vec<u8>> {
        let recipient: Address = split.recipient.parse().map_err(map_parse_to_pyerr)?;
        let native_amount: U256 = split.native_amount.parse().map_err(map_parse_to_pyerr)?;
        let erc20_amounts = parse_u256_vec(&split.erc20_amounts)?;
        let erc721_indices = parse_u256_vec(&split.erc721_indices)?;
        let erc1155_amounts = parse_u256_vec(&split.erc1155_amounts)?;

        Ok(BundleSplit {
            recipient,
            nativeAmount: native_amount,
            erc20Amounts: erc20_amounts,
            erc721Indices: erc721_indices,
            erc1155Amounts: erc1155_amounts,
        }
        .abi_encode())
    }

    #[staticmethod]
    pub fn decode(data: Vec<u8>) -> PyResult<PyBundleSplit> {
        let decoded = BundleSplit::abi_decode(&data).map_err(map_sol_decode_to_pyerr)?;
        Ok(decoded.into())
    }

    pub fn encode_self(&self) -> PyResult<Vec<u8>> {
        PyBundleSplit::encode(self)
    }
}

impl From<BundleSplit> for PyBundleSplit {
    fn from(data: BundleSplit) -> Self {
        Self {
            recipient: data.recipient.to_string(),
            native_amount: data.nativeAmount.to_string(),
            erc20_amounts: stringify_u256_vec(data.erc20Amounts),
            erc721_indices: stringify_u256_vec(data.erc721Indices),
            erc1155_amounts: stringify_u256_vec(data.erc1155Amounts),
        }
    }
}

fn parse_bundle_splits(splits: &[PyBundleSplit]) -> PyResult<Vec<BundleSplit>> {
    splits
        .iter()
        .map(|split| {
            Ok(BundleSplit {
                recipient: split.recipient.parse().map_err(map_parse_to_pyerr)?,
                nativeAmount: split.native_amount.parse().map_err(map_parse_to_pyerr)?,
                erc20Amounts: parse_u256_vec(&split.erc20_amounts)?,
                erc721Indices: parse_u256_vec(&split.erc721_indices)?,
                erc1155Amounts: parse_u256_vec(&split.erc1155_amounts)?,
            })
        })
        .collect()
}

fn parse_u256_vec(values: &[String]) -> PyResult<Vec<U256>> {
    values
        .iter()
        .map(|value| value.parse().map_err(map_parse_to_pyerr))
        .collect()
}

fn stringify_u256_vec(values: Vec<U256>) -> Vec<String> {
    values.into_iter().map(|value| value.to_string()).collect()
}
