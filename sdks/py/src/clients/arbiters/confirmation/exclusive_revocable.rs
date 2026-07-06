//! ExclusiveRevocableConfirmationArbiter client
//!
//! Single fulfillment per escrow, confirmation can be revoked.

use alkahest_rs::{contracts, extensions::ArbitersModule};
use pyo3::{pyclass, pymethods, PyResult};

use crate::error_handling::{map_eyre_to_pyerr, map_parse_to_pyerr};

/// ExclusiveRevocableConfirmationArbiter API
#[pyclass]
#[derive(Clone)]
pub struct ExclusiveRevocable {
    inner: ArbitersModule,
}

impl ExclusiveRevocable {
    pub fn new(inner: ArbitersModule) -> Self {
        Self { inner }
    }
}

#[pymethods]
impl ExclusiveRevocable {
    /// Get the contract address
    pub fn address(&self) -> String {
        format!(
            "{:?}",
            self.inner
                .addresses
                .exclusive_revocable_confirmation_arbiter
        )
    }

    /// Confirm a fulfillment for an escrow
    ///
    /// Only the escrow recipient can confirm.
    pub fn confirm<'py>(
        &self,
        py: pyo3::Python<'py>,
        fulfillment: String,
        escrow: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let receipt = inner
                .confirmation()
                .exclusive_revocable()
                .confirm(
                    fulfillment.parse().map_err(map_parse_to_pyerr)?,
                    escrow.parse().map_err(map_parse_to_pyerr)?,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(receipt.transaction_hash.to_string())
        })
    }

    /// Revoke a confirmation
    ///
    /// Only the escrow recipient can revoke.
    pub fn revoke<'py>(
        &self,
        py: pyo3::Python<'py>,
        fulfillment: String,
        escrow: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let receipt = inner
                .confirmation()
                .exclusive_revocable()
                .revoke(
                    fulfillment.parse().map_err(map_parse_to_pyerr)?,
                    escrow.parse().map_err(map_parse_to_pyerr)?,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(receipt.transaction_hash.to_string())
        })
    }

    /// Request confirmation for a fulfillment
    ///
    /// The fulfillment attester or recipient can request confirmation.
    pub fn request_confirmation<'py>(
        &self,
        py: pyo3::Python<'py>,
        fulfillment: String,
        escrow: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let receipt = inner
                .confirmation()
                .exclusive_revocable()
                .request_confirmation(
                    fulfillment.parse().map_err(map_parse_to_pyerr)?,
                    escrow.parse().map_err(map_parse_to_pyerr)?,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(receipt.transaction_hash.to_string())
        })
    }

    /// Wait for a confirmation event
    pub fn wait_for_confirmation<'py>(
        &self,
        py: pyo3::Python<'py>,
        fulfillment: String,
        escrow: String,
        from_block: Option<u64>,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let log = inner
                .confirmation()
                .exclusive_revocable()
                .wait_for_confirmation(
                    fulfillment.parse().map_err(map_parse_to_pyerr)?,
                    escrow.parse().map_err(map_parse_to_pyerr)?,
                    from_block,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(PyConfirmationMadeLog {
                fulfillment: log.data.fulfillment.to_string(),
                escrow: log.data.escrow.to_string(),
            })
        })
    }

    /// Wait for a confirmation request event
    pub fn wait_for_confirmation_request<'py>(
        &self,
        py: pyo3::Python<'py>,
        fulfillment: String,
        confirmer: String,
        escrow: String,
        from_block: Option<u64>,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let log = inner
                .confirmation()
                .exclusive_revocable()
                .wait_for_confirmation_request(
                    fulfillment.parse().map_err(map_parse_to_pyerr)?,
                    confirmer.parse().map_err(map_parse_to_pyerr)?,
                    escrow.parse().map_err(map_parse_to_pyerr)?,
                    from_block,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(PyConfirmationRequestedLog {
                fulfillment: log.data.fulfillment.to_string(),
                confirmer: format!("{:?}", log.data.confirmer),
                escrow: log.data.escrow.to_string(),
            })
        })
    }

    /// Check if a fulfillment is confirmed for an escrow
    pub fn is_confirmed<'py>(
        &self,
        py: pyo3::Python<'py>,
        fulfillment: String,
        escrow: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let confirmed = inner
                .confirmation()
                .exclusive_revocable()
                .is_confirmed(
                    fulfillment.parse().map_err(map_parse_to_pyerr)?,
                    escrow.parse().map_err(map_parse_to_pyerr)?,
                )
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(confirmed)
        })
    }
}

/// Python representation of ConfirmationMade event
#[pyclass]
#[derive(Clone, Debug)]
pub struct PyConfirmationMadeLog {
    #[pyo3(get)]
    pub fulfillment: String,
    #[pyo3(get)]
    pub escrow: String,
}

#[pymethods]
impl PyConfirmationMadeLog {
    fn __repr__(&self) -> String {
        format!(
            "PyConfirmationMadeLog(fulfillment='{}', escrow='{}')",
            self.fulfillment, self.escrow
        )
    }
}

/// Python representation of ConfirmationRequested event
#[pyclass]
#[derive(Clone, Debug)]
pub struct PyConfirmationRequestedLog {
    #[pyo3(get)]
    pub fulfillment: String,
    #[pyo3(get)]
    pub confirmer: String,
    #[pyo3(get)]
    pub escrow: String,
}

#[pymethods]
impl PyConfirmationRequestedLog {
    fn __repr__(&self) -> String {
        format!(
            "PyConfirmationRequestedLog(fulfillment='{}', confirmer='{}', escrow='{}')",
            self.fulfillment, self.confirmer, self.escrow
        )
    }
}
