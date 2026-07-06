use alkahest_rs::{
    contracts::arbiters::TrustedOracleArbiter, contracts::obligations::StringObligation,
    extensions::ArbitersModule, extensions::OracleModule as InnerOracleClient,
};
use alloy::primitives::FixedBytes;
use alloy::sol_types::SolValue;
use pyo3::{pyclass, pymethods, types::PyAnyMethods, PyAny, PyObject, PyResult, Python};
use pyo3_async_runtimes::tokio::{future_into_py, into_future};
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;

use crate::error_handling::{map_eyre_to_pyerr, map_parse_to_pyerr};

use super::PyArbitrationMadeLog;

#[pyclass]
#[derive(Clone)]
pub struct OracleClient {
    inner: InnerOracleClient,
}

impl OracleClient {
    pub fn new(inner: InnerOracleClient) -> Self {
        Self { inner }
    }
}

#[pymethods]
impl OracleClient {
    pub fn get_eas_address(&self) -> String {
        format!("{:?}", self.inner.addresses.eas)
    }

    pub fn get_trusted_oracle_arbiter_address(&self) -> String {
        format!("{:?}", self.inner.addresses.trusted_oracle_arbiter)
    }

    pub fn request_arbitration<'py>(
        &self,
        py: Python<'py>,
        obligation_uid: String,
        oracle: String,
        demand: Vec<u8>,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let uid: FixedBytes<32> = obligation_uid.parse().map_err(map_parse_to_pyerr)?;
            let oracle_addr = oracle.parse().map_err(map_parse_to_pyerr)?;
            let demand_bytes = alloy::primitives::Bytes::from(demand);

            let receipt = inner
                .request_arbitration(uid, oracle_addr, demand_bytes)
                .await
                .map_err(map_eyre_to_pyerr)?;

            Ok(format!(
                "0x{}",
                alloy::hex::encode(receipt.transaction_hash.as_slice())
            ))
        })
    }

    pub fn extract_obligation_data(&self, attestation: &PyOracleAttestation) -> PyResult<String> {
        use alloy::hex;
        use alloy::sol_types::SolType;

        let data_bytes = hex::decode(
            attestation
                .data
                .strip_prefix("0x")
                .unwrap_or(&attestation.data),
        )
        .map_err(|e| map_eyre_to_pyerr(eyre::eyre!("Failed to decode data hex: {}", e)))?;

        let obligation_data = <StringObligation::ObligationData as SolType>::abi_decode(
            &data_bytes,
        )
        .map_err(|e| map_eyre_to_pyerr(eyre::eyre!("Failed to decode obligation data: {}", e)))?;

        Ok(obligation_data.item)
    }

    pub fn extract_demand_data(
        &self,
        escrow_attestation: &PyOracleAttestation,
    ) -> PyResult<PyTrustedOracleArbiterDemandData> {
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
        .map_err(|e| map_eyre_to_pyerr(eyre::eyre!("Failed to decode data hex: {}", e)))?;

        let arbiter_demand = <ArbiterDemand as SolType>::abi_decode(&data_bytes).map_err(|e| {
            map_eyre_to_pyerr(eyre::eyre!("Failed to decode arbiter demand: {}", e))
        })?;

        let demand_data =
            <TrustedOracleArbiter::DemandData as SolType>::abi_decode(&arbiter_demand.demand)
                .map_err(|e| {
                    map_eyre_to_pyerr(eyre::eyre!("Failed to decode demand data: {}", e))
                })?;

        Ok(PyTrustedOracleArbiterDemandData::from(demand_data))
    }

    /// Arbitrate as a trusted oracle
    ///
    /// Args:
    ///     obligation: The obligation attestation UID
    ///     demand: The demand data bytes
    ///     decision: The oracle's decision (true/false)
    ///
    /// Returns:
    ///     Transaction hash as string
    pub fn arbitrate_for_demand<'py>(
        &self,
        py: Python<'py>,
        obligation: String,
        demand: Vec<u8>,
        decision: bool,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let receipt = inner
                .arbitrate_for_demand(
                    obligation.parse().map_err(map_parse_to_pyerr)?,
                    demand.into(),
                    decision,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(receipt.transaction_hash.to_string())
        })
    }

    pub fn arbitrate_raw<'py>(
        &self,
        py: Python<'py>,
        obligation: String,
        decision_context: Vec<u8>,
        decision: bool,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let receipt = inner
                .arbitrate_raw(
                    obligation.parse().map_err(map_parse_to_pyerr)?,
                    decision_context.into(),
                    decision,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(receipt.transaction_hash.to_string())
        })
    }

    /// Wait for an arbitration event
    ///
    /// Args:
    ///     obligation: The obligation attestation UID
    ///     demand: Optional demand data bytes
    ///     oracle: Optional oracle address
    ///     from_block: Optional starting block number
    ///
    /// Returns:
    ///     ArbitrationMade event data
    pub fn wait_for_arbitration<'py>(
        &self,
        py: Python<'py>,
        obligation: String,
        demand: Option<Vec<u8>>,
        oracle: Option<String>,
        from_block: Option<u64>,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let event = inner
                .wait_for_arbitration(
                    obligation.parse().map_err(map_parse_to_pyerr)?,
                    demand.map(|d| d.into()),
                    oracle
                        .map(|o| o.parse())
                        .transpose()
                        .map_err(map_parse_to_pyerr)?,
                    from_block,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(PyArbitrationMadeLog {
                decision_key: event.inner.data.decisionKey.to_string(),
                obligation: event.inner.data.fulfillmentUid.to_string(),
                oracle: format!("{:?}", event.inner.data.oracle),
                decision: event.inner.data.decision,
            })
        })
    }

    /// Get the escrow attestation that a fulfillment references
    ///
    /// Args:
    ///     fulfillment: The fulfillment attestation
    ///
    /// Returns:
    ///     The escrow attestation
    pub fn get_escrow_attestation<'py>(
        &self,
        py: Python<'py>,
        fulfillment: PyOracleAttestation,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            use alloy::hex;

            // Convert PyOracleAttestation to Rust Attestation
            let ref_uid_bytes = hex::decode(
                fulfillment
                    .ref_uid
                    .strip_prefix("0x")
                    .unwrap_or(&fulfillment.ref_uid),
            )
            .map_err(|e| map_eyre_to_pyerr(eyre::eyre!("Failed to decode ref_uid: {}", e)))?;
            let ref_uid: FixedBytes<32> = ref_uid_bytes
                .as_slice()
                .try_into()
                .map_err(|_| map_eyre_to_pyerr(eyre::eyre!("Invalid ref_uid length")))?;

            // Create a minimal attestation struct with just the refUID we need
            let fulfillment_attestation = alkahest_rs::contracts::IEAS::Attestation {
                uid: FixedBytes::default(),
                schema: FixedBytes::default(),
                refUID: ref_uid,
                time: 0,
                expirationTime: 0,
                revocationTime: 0,
                recipient: alloy::primitives::Address::default(),
                attester: alloy::primitives::Address::default(),
                revocable: false,
                data: alloy::primitives::Bytes::default(),
            };

            let escrow = inner
                .get_escrow_attestation(&fulfillment_attestation)
                .await
                .map_err(map_eyre_to_pyerr)?;

            Ok(PyOracleAttestation::from(&escrow))
        })
    }

    /// Get escrow attestation and extract demand data in one call
    ///
    /// Args:
    ///     fulfillment: The fulfillment attestation
    ///
    /// Returns:
    ///     Tuple of (escrow attestation, demand data)
    pub fn get_escrow_and_demand<'py>(
        &self,
        py: Python<'py>,
        fulfillment: PyOracleAttestation,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            use alloy::{hex, sol, sol_types::SolType};

            // Convert PyOracleAttestation to Rust Attestation
            let ref_uid_bytes = hex::decode(
                fulfillment
                    .ref_uid
                    .strip_prefix("0x")
                    .unwrap_or(&fulfillment.ref_uid),
            )
            .map_err(|e| map_eyre_to_pyerr(eyre::eyre!("Failed to decode ref_uid: {}", e)))?;
            let ref_uid: FixedBytes<32> = ref_uid_bytes
                .as_slice()
                .try_into()
                .map_err(|_| map_eyre_to_pyerr(eyre::eyre!("Invalid ref_uid length")))?;

            // Create a minimal attestation struct with just the refUID we need
            let fulfillment_attestation = alkahest_rs::contracts::IEAS::Attestation {
                uid: FixedBytes::default(),
                schema: FixedBytes::default(),
                refUID: ref_uid,
                time: 0,
                expirationTime: 0,
                revocationTime: 0,
                recipient: alloy::primitives::Address::default(),
                attester: alloy::primitives::Address::default(),
                revocable: false,
                data: alloy::primitives::Bytes::default(),
            };

            // Get escrow attestation
            let escrow = inner
                .get_escrow_attestation(&fulfillment_attestation)
                .await
                .map_err(map_eyre_to_pyerr)?;

            // Extract demand data
            sol! {
                struct ArbiterDemand {
                    address oracle;
                    bytes demand;
                }
            }

            let arbiter_demand =
                <ArbiterDemand as SolType>::abi_decode(&escrow.data).map_err(|e| {
                    map_eyre_to_pyerr(eyre::eyre!("Failed to decode arbiter demand: {}", e))
                })?;

            let demand_data =
                <TrustedOracleArbiter::DemandData as SolType>::abi_decode(&arbiter_demand.demand)
                    .map_err(|e| {
                    map_eyre_to_pyerr(eyre::eyre!("Failed to decode demand data: {}", e))
                })?;

            Ok((
                PyOracleAttestation::from(&escrow),
                PyTrustedOracleArbiterDemandData::from(demand_data),
            ))
        })
    }

    /// Manually release a pubsub subscription by its local id.
    ///
    /// Note: This is only meaningful for ws/wss transports. HTTP transports
    /// emulate subscriptions via polling and ignore this call (no-op).
    pub fn unsubscribe<'py>(
        &self,
        py: Python<'py>,
        local_id: String,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let local_id: FixedBytes<32> = local_id.parse().map_err(map_parse_to_pyerr)?;
            inner
                .unsubscribe(local_id)
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(())
        })
    }

    /// Arbitrate attestations based on the specified mode.
    ///
    /// Args:
    ///     decision_func: A function that takes (attestation, demand) and returns bool or None.
    ///                    Can be sync or async - will be auto-detected.
    ///     callback_func: Optional callback called after each arbitration decision.
    ///     mode: ArbitrationMode specifying which attestations to process.
    ///     timeout_seconds: Optional timeout for modes that listen to future events.
    ///
    /// Returns:
    ///     List of Decision objects for processed attestations.
    #[pyo3(signature = (decision_func, callback_func=None, mode=None, timeout_seconds=None))]
    pub fn arbitrate_many<'py>(
        &self,
        py: Python<'py>,
        decision_func: PyObject,
        callback_func: Option<PyObject>,
        mode: Option<PyArbitrationMode>,
        timeout_seconds: Option<f64>,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        // Check if decision_func is async
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
            return self.arbitrate_many_async_impl(
                py,
                decision_func,
                callback_func,
                mode,
                timeout_seconds,
            );
        }

        // Sync implementation
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let rust_mode = mode.unwrap_or_default().into();
            let timeout = timeout_seconds.map(|secs| std::time::Duration::from_secs_f64(secs));

            let arbitrate_func =
                |awd: &alkahest_rs::clients::oracle::AttestationWithDemand| -> Option<bool> {
                    Python::with_gil(|py| {
                        let py_attestation = PyOracleAttestation::from(&awd.attestation);
                        let py_demand: Vec<u8> = awd.demand.to_vec();
                        let result = decision_func.call1(py, (py_attestation, py_demand)).ok()?;
                        // If Python returned None, defer the decision (return Rust None)
                        if result.is_none(py) {
                            return None;
                        }
                        result
                            .extract::<bool>(py)
                            .or_else(|_| result.is_truthy(py))
                            .ok()
                    })
                };

            let callback = |decision: &alkahest_rs::clients::oracle::Decision| {
                if let Some(ref py_callback) = callback_func {
                    Python::with_gil(|py| {
                        let py_attestation = PyOracleAttestation::from(&decision.attestation);
                        let py_decision = PyDecision::__new__(
                            py_attestation,
                            decision.decision,
                            format!(
                                "0x{}",
                                alloy::hex::encode(decision.receipt.transaction_hash.as_slice())
                            ),
                        );

                        if let Err(e) = py_callback.call1(py, (py_decision,)) {
                            eprintln!("Python callback failed: {}", e);
                        }
                    });
                }

                Box::pin(async {})
            };

            let result = inner
                .arbitrate_many_blocking_sync(arbitrate_func, callback, rust_mode, timeout)
                .await
                .map_err(map_eyre_to_pyerr)?;

            let py_decisions: Vec<PyDecision> = result
                .past_decisions
                .into_iter()
                .map(|decision| {
                    let attestation = PyOracleAttestation::from(&decision.attestation);
                    PyDecision::__new__(
                        attestation,
                        decision.decision,
                        format!(
                            "0x{}",
                            alloy::hex::encode(decision.receipt.transaction_hash.as_slice())
                        ),
                    )
                })
                .collect();

            Ok(py_decisions)
        })
    }

    fn arbitrate_many_async_impl<'py>(
        &self,
        py: Python<'py>,
        decision_func: PyObject,
        callback_func: Option<PyObject>,
        mode: Option<PyArbitrationMode>,
        timeout_seconds: Option<f64>,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();

        future_into_py(py, async move {
            let rust_mode = mode.unwrap_or_default().into();
            let timeout = timeout_seconds.map(|secs| std::time::Duration::from_secs_f64(secs));

            // Wrap PyObjects in Arc so they can be cloned in Fn closure
            let decision_func = Arc::new(decision_func);
            let callback_func = Arc::new(callback_func);

            // Create async arbitration function that converts Python coroutines to Rust futures
            let arbitrate = move |awd: &alkahest_rs::clients::oracle::AttestationWithDemand| -> Pin<
                Box<dyn Future<Output = Option<bool>> + Send + 'static>,
            > {
                let awd = awd.clone();
                let decision_func = Arc::clone(&decision_func);

                Box::pin(async move {
                    // Call Python function and get coroutine
                    let coro_result = Python::with_gil(|py| {
                        let py_attestation = PyOracleAttestation::from(&awd.attestation);
                        let py_demand: Vec<u8> = awd.demand.to_vec();
                        decision_func
                            .clone_ref(py)
                            .call1(py, (py_attestation, py_demand))
                    });

                    let coro = match coro_result {
                        Ok(c) => c,
                        Err(_) => return None,
                    };

                    // Convert Python coroutine to Rust future
                    let future_result = Python::with_gil(|py| into_future(coro.into_bound(py)));

                    let future = match future_result {
                        Ok(f) => f,
                        Err(_) => return None,
                    };

                    // Await the future
                    let result = match future.await {
                        Ok(r) => r,
                        Err(_) => return None,
                    };

                    // Extract boolean, treating Python None as Rust None (defer)
                    Python::with_gil(|py| {
                        if result.is_none(py) {
                            return None;
                        }
                        result
                            .extract::<bool>(py)
                            .or_else(|_| result.is_truthy(py))
                            .ok()
                    })
                })
            };

            // Create callback
            let callback = move |decision: &alkahest_rs::clients::oracle::Decision| {
                let decision_attestation = decision.attestation.clone();
                let decision_bool = decision.decision;
                let tx_hash = decision.receipt.transaction_hash.clone();
                let callback_func = Arc::clone(&callback_func);

                Box::pin(async move {
                    if let Some(ref py_callback) = callback_func.as_ref() {
                        Python::with_gil(|py| {
                            let py_attestation = PyOracleAttestation::from(&decision_attestation);
                            let py_decision = PyDecision::__new__(
                                py_attestation,
                                decision_bool,
                                format!("0x{}", alloy::hex::encode(tx_hash.as_slice())),
                            );

                            let _ = py_callback.clone_ref(py).call1(py, (py_decision,));
                        });
                    }
                }) as Pin<Box<dyn Future<Output = ()> + Send + 'static>>
            };

            // Call the blocking async version
            let result = inner
                .arbitrate_many_blocking_async(arbitrate, callback, rust_mode, timeout)
                .await
                .map_err(map_eyre_to_pyerr)?;

            let py_decisions: Vec<PyDecision> = result
                .past_decisions
                .into_iter()
                .map(|decision| {
                    let attestation = PyOracleAttestation::from(&decision.attestation);
                    PyDecision::__new__(
                        attestation,
                        decision.decision,
                        format!(
                            "0x{}",
                            alloy::hex::encode(decision.receipt.transaction_hash.as_slice())
                        ),
                    )
                })
                .collect();

            Ok(py_decisions)
        })
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyOracleAddresses {
    #[pyo3(get)]
    pub eas: String,
    #[pyo3(get)]
    pub trusted_oracle_arbiter: String,
}

#[pymethods]
impl PyOracleAddresses {
    #[new]
    pub fn __new__(eas: String, trusted_oracle_arbiter: String) -> Self {
        Self {
            eas,
            trusted_oracle_arbiter,
        }
    }

    pub fn __str__(&self) -> String {
        format!(
            "PyOracleAddresses(eas={}, trusted_oracle_arbiter={})",
            self.eas, self.trusted_oracle_arbiter
        )
    }

    pub fn __repr__(&self) -> String {
        self.__str__()
    }
}

impl TryFrom<PyOracleAddresses> for alkahest_rs::clients::oracle::OracleAddresses {
    type Error = eyre::Error;

    fn try_from(value: PyOracleAddresses) -> eyre::Result<Self> {
        Ok(Self {
            eas: value.eas.parse()?,
            trusted_oracle_arbiter: value.trusted_oracle_arbiter.parse()?,
        })
    }
}

/// Mode for arbitration processing
/// - "past": Process all past events (including already arbitrated), no subscription
/// - "past_unarbitrated": Process only unarbitrated past events, no subscription
/// - "all_unarbitrated": Process unarbitrated past events, plus listen for new events
/// - "all": Process all past events (including already arbitrated), plus listen for new events
/// - "future": Only listen for new events, skip past event processing
#[pyclass(eq, eq_int)]
#[derive(Clone, PartialEq, Default)]
pub enum PyArbitrationMode {
    Past,
    PastUnarbitrated,
    AllUnarbitrated,
    #[default]
    All,
    Future,
}

#[pymethods]
impl PyArbitrationMode {
    #[staticmethod]
    pub fn past() -> Self {
        Self::Past
    }

    #[staticmethod]
    pub fn past_unarbitrated() -> Self {
        Self::PastUnarbitrated
    }

    #[staticmethod]
    pub fn all_unarbitrated() -> Self {
        Self::AllUnarbitrated
    }

    #[staticmethod]
    pub fn all() -> Self {
        Self::All
    }

    #[staticmethod]
    pub fn future() -> Self {
        Self::Future
    }

    pub fn __str__(&self) -> String {
        match self {
            Self::Past => "past".to_string(),
            Self::PastUnarbitrated => "past_unarbitrated".to_string(),
            Self::AllUnarbitrated => "all_unarbitrated".to_string(),
            Self::All => "all".to_string(),
            Self::Future => "future".to_string(),
        }
    }

    pub fn __repr__(&self) -> String {
        format!(
            "ArbitrationMode.{}",
            match self {
                Self::Past => "Past",
                Self::PastUnarbitrated => "PastUnarbitrated",
                Self::AllUnarbitrated => "AllUnarbitrated",
                Self::All => "All",
                Self::Future => "Future",
            }
        )
    }
}

impl From<PyArbitrationMode> for alkahest_rs::clients::oracle::ArbitrationMode {
    fn from(mode: PyArbitrationMode) -> Self {
        match mode {
            PyArbitrationMode::Past => alkahest_rs::clients::oracle::ArbitrationMode::Past,
            PyArbitrationMode::PastUnarbitrated => {
                alkahest_rs::clients::oracle::ArbitrationMode::PastUnarbitrated
            }
            PyArbitrationMode::AllUnarbitrated => {
                alkahest_rs::clients::oracle::ArbitrationMode::AllUnarbitrated
            }
            PyArbitrationMode::All => alkahest_rs::clients::oracle::ArbitrationMode::All,
            PyArbitrationMode::Future => alkahest_rs::clients::oracle::ArbitrationMode::Future,
        }
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyOracleAttestation {
    #[pyo3(get)]
    pub uid: String,
    #[pyo3(get)]
    pub schema: String,
    #[pyo3(get)]
    pub ref_uid: String,
    #[pyo3(get)]
    pub time: u64,
    #[pyo3(get)]
    pub expiration_time: u64,
    #[pyo3(get)]
    pub revocation_time: u64,
    #[pyo3(get)]
    pub recipient: String,
    #[pyo3(get)]
    pub attester: String,
    #[pyo3(get)]
    pub revocable: bool,
    #[pyo3(get)]
    pub data: String,
}

#[pymethods]
impl PyOracleAttestation {
    #[new]
    pub fn __new__(
        uid: String,
        schema: String,
        ref_uid: String,
        time: u64,
        expiration_time: u64,
        revocation_time: u64,
        recipient: String,
        attester: String,
        revocable: bool,
        data: String,
    ) -> Self {
        Self {
            uid,
            schema,
            ref_uid,
            time,
            expiration_time,
            revocation_time,
            recipient,
            attester,
            revocable,
            data,
        }
    }

    pub fn __str__(&self) -> String {
        format!(
            "PyOracleAttestation(uid={}, schema={}, attester={}, recipient={})",
            self.uid, self.schema, self.attester, self.recipient
        )
    }

    pub fn __repr__(&self) -> String {
        self.__str__()
    }
}

impl From<&alkahest_rs::contracts::IEAS::Attestation> for PyOracleAttestation {
    fn from(att: &alkahest_rs::contracts::IEAS::Attestation) -> Self {
        Self::__new__(
            format!("0x{}", alloy::hex::encode(att.uid.as_slice())),
            format!("0x{}", alloy::hex::encode(att.schema.as_slice())),
            format!("0x{}", alloy::hex::encode(att.refUID.as_slice())),
            att.time,
            att.expirationTime,
            att.revocationTime,
            format!("0x{:x}", att.recipient),
            format!("0x{:x}", att.attester),
            att.revocable,
            format!("0x{}", alloy::hex::encode(&att.data)),
        )
    }
}

impl From<alkahest_rs::contracts::IEAS::Attestation> for PyOracleAttestation {
    fn from(att: alkahest_rs::contracts::IEAS::Attestation) -> Self {
        Self::from(&att)
    }
}

/// An attestation paired with its demand data from the ArbitrationRequested event
#[pyclass]
#[derive(Clone)]
pub struct PyAttestationWithDemand {
    #[pyo3(get)]
    pub attestation: PyOracleAttestation,
    #[pyo3(get)]
    pub demand: Vec<u8>,
}

#[pymethods]
impl PyAttestationWithDemand {
    #[new]
    pub fn __new__(attestation: PyOracleAttestation, demand: Vec<u8>) -> Self {
        Self {
            attestation,
            demand,
        }
    }

    pub fn __str__(&self) -> String {
        format!(
            "PyAttestationWithDemand(attestation={}, demand={} bytes)",
            self.attestation.__str__(),
            self.demand.len()
        )
    }

    pub fn __repr__(&self) -> String {
        self.__str__()
    }
}

impl From<&alkahest_rs::clients::oracle::AttestationWithDemand> for PyAttestationWithDemand {
    fn from(awd: &alkahest_rs::clients::oracle::AttestationWithDemand) -> Self {
        Self {
            attestation: PyOracleAttestation::from(&awd.attestation),
            demand: awd.demand.to_vec(),
        }
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyDecision {
    #[pyo3(get)]
    pub attestation: PyOracleAttestation,
    #[pyo3(get)]
    pub decision: bool,
    #[pyo3(get)]
    pub transaction_hash: String,
}

#[pymethods]
impl PyDecision {
    #[new]
    pub fn __new__(
        attestation: PyOracleAttestation,
        decision: bool,
        transaction_hash: String,
    ) -> Self {
        Self {
            attestation,
            decision,
            transaction_hash,
        }
    }

    pub fn __str__(&self) -> String {
        format!(
            "PyDecision(decision={}, tx_hash={})",
            self.decision, self.transaction_hash
        )
    }

    pub fn __repr__(&self) -> String {
        self.__str__()
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyTrustedOracleArbiterDemandData {
    #[pyo3(get)]
    pub oracle: String,
    #[pyo3(get)]
    pub data: Vec<u8>,
}

#[pymethods]
impl PyTrustedOracleArbiterDemandData {
    #[new]
    pub fn new(oracle: String, data: Vec<u8>) -> Self {
        Self { oracle, data }
    }

    fn __repr__(&self) -> String {
        format!(
            "PyTrustedOracleArbiterDemandData(oracle='{}', data={} bytes)",
            self.oracle,
            self.data.len()
        )
    }

    #[staticmethod]
    pub fn decode(demand_bytes: Vec<u8>) -> eyre::Result<PyTrustedOracleArbiterDemandData> {
        use alloy::primitives::Bytes;
        use alloy::sol_types::SolValue;

        let bytes = Bytes::from(demand_bytes);
        let decoded = TrustedOracleArbiter::DemandData::abi_decode(&bytes)?;
        Ok(decoded.into())
    }

    #[staticmethod]
    pub fn encode(demand_data: &PyTrustedOracleArbiterDemandData) -> eyre::Result<Vec<u8>> {
        use alloy::primitives::{Address, Bytes};
        use alloy::sol_types::SolValue;

        let oracle: Address = demand_data.oracle.parse()?;
        let data = Bytes::from(demand_data.data.clone());
        let rust_demand_data = TrustedOracleArbiter::DemandData { oracle, data };
        let encoded = rust_demand_data.abi_encode();
        Ok(encoded)
    }

    pub fn encode_self(&self) -> eyre::Result<Vec<u8>> {
        PyTrustedOracleArbiterDemandData::encode(self)
    }
}

impl From<TrustedOracleArbiter::DemandData> for PyTrustedOracleArbiterDemandData {
    fn from(data: TrustedOracleArbiter::DemandData) -> Self {
        Self {
            oracle: format!("{:?}", data.oracle),
            data: data.data.to_vec(),
        }
    }
}

impl TryFrom<PyTrustedOracleArbiterDemandData> for TrustedOracleArbiter::DemandData {
    type Error = eyre::Error;

    fn try_from(py_data: PyTrustedOracleArbiterDemandData) -> eyre::Result<Self> {
        use alloy::primitives::{Address, Bytes};

        let oracle: Address = py_data.oracle.parse()?;
        let data = Bytes::from(py_data.data);

        Ok(Self { oracle, data })
    }
}

/// TrustedOracleArbiter-specific API (accessed via arbiters.trusted_oracle)
///
/// This provides access to trusted oracle arbitration methods through the ArbitersModule.
#[pyclass]
#[derive(Clone)]
pub struct TrustedOracle {
    inner: ArbitersModule,
}

impl TrustedOracle {
    pub fn new(inner: ArbitersModule) -> Self {
        Self { inner }
    }
}

#[pymethods]
impl TrustedOracle {
    /// Get the TrustedOracleArbiter contract address
    pub fn address(&self) -> String {
        format!("{:?}", self.inner.addresses.trusted_oracle_arbiter)
    }

    /// Arbitrate as a trusted oracle
    ///
    /// # Arguments
    /// * `obligation` - The obligation attestation UID
    /// * `demand` - The demand data bytes
    /// * `decision` - The oracle's decision (true/false)
    pub fn arbitrate_for_demand<'py>(
        &self,
        py: Python<'py>,
        obligation: String,
        demand: Vec<u8>,
        decision: bool,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let receipt = inner
                .trusted_oracle()
                .arbitrate_for_demand(
                    obligation.parse().map_err(map_parse_to_pyerr)?,
                    demand.into(),
                    decision,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(receipt.transaction_hash.to_string())
        })
    }

    pub fn arbitrate_raw<'py>(
        &self,
        py: Python<'py>,
        obligation: String,
        decision_context: Vec<u8>,
        decision: bool,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let receipt = inner
                .trusted_oracle()
                .arbitrate_raw(
                    obligation.parse().map_err(map_parse_to_pyerr)?,
                    decision_context.into(),
                    decision,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(receipt.transaction_hash.to_string())
        })
    }

    /// Wait for a trusted oracle arbitration event
    ///
    /// # Arguments
    /// * `oracle` - The oracle address
    /// * `obligation` - The obligation attestation UID
    /// * `from_block` - Optional starting block number
    pub fn wait_for_arbitration<'py>(
        &self,
        py: Python<'py>,
        oracle: String,
        obligation: String,
        from_block: Option<u64>,
    ) -> PyResult<pyo3::Bound<'py, PyAny>> {
        let inner = self.inner.clone();
        future_into_py(py, async move {
            let event = inner
                .trusted_oracle()
                .wait_for_arbitration(
                    oracle.parse().map_err(map_parse_to_pyerr)?,
                    obligation.parse().map_err(map_parse_to_pyerr)?,
                    from_block,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(PyArbitrationMadeLog {
                decision_key: event.decisionKey.to_string(),
                obligation: event.fulfillmentUid.to_string(),
                oracle: format!("{:?}", event.oracle),
                decision: event.decision,
            })
        })
    }

    /// Decode TrustedOracleArbiter demand data from raw bytes
    pub fn decode(&self, demand_bytes: Vec<u8>) -> PyResult<PyTrustedOracleArbiterDemandData> {
        let demand: TrustedOracleArbiter::DemandData =
            TrustedOracleArbiter::DemandData::abi_decode(&demand_bytes).map_err(|e| {
                map_eyre_to_pyerr(eyre::eyre!(
                    "Failed to decode TrustedOracleArbiter demand: {}",
                    e
                ))
            })?;
        Ok(PyTrustedOracleArbiterDemandData::from(demand))
    }

    /// Encode TrustedOracleArbiter demand data to raw bytes
    #[staticmethod]
    pub fn encode(oracle: String, data: Vec<u8>) -> PyResult<Vec<u8>> {
        let oracle_address: alloy::primitives::Address = oracle.parse().map_err(|e| {
            pyo3::PyErr::new::<pyo3::exceptions::PyValueError, _>(format!("Invalid address: {}", e))
        })?;

        let demand_data = TrustedOracleArbiter::DemandData {
            oracle: oracle_address,
            data: data.into(),
        };

        Ok(demand_data.abi_encode())
    }
}
