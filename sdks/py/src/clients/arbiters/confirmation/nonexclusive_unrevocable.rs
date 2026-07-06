//! NonexclusiveUnrevocableConfirmationArbiter client
//!
//! Multiple fulfillments can be confirmed per escrow, confirmations cannot be revoked.

use alkahest_rs::extensions::ArbitersModule;
use pyo3::{pyclass, pymethods, PyResult};

use crate::error_handling::{map_eyre_to_pyerr, map_parse_to_pyerr};

use super::exclusive_revocable::{PyConfirmationMadeLog, PyConfirmationRequestedLog};

/// NonexclusiveUnrevocableConfirmationArbiter API
#[pyclass]
#[derive(Clone)]
pub struct NonexclusiveUnrevocable {
    inner: ArbitersModule,
}

impl NonexclusiveUnrevocable {
    pub fn new(inner: ArbitersModule) -> Self {
        Self { inner }
    }
}

#[pymethods]
impl NonexclusiveUnrevocable {
    /// Get the contract address
    pub fn address(&self) -> String {
        format!(
            "{:?}",
            self.inner
                .addresses
                .nonexclusive_unrevocable_confirmation_arbiter
        )
    }

    /// Confirm a fulfillment for an escrow
    ///
    /// Only the escrow recipient can confirm. Multiple fulfillments can be confirmed.
    /// Once confirmed, cannot be revoked.
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
                .nonexclusive_unrevocable()
                .confirm(
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
                .nonexclusive_unrevocable()
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
                .nonexclusive_unrevocable()
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
                .nonexclusive_unrevocable()
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
                .nonexclusive_unrevocable()
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
