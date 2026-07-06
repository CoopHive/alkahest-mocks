//! ERC1155 payment obligation client

use alkahest_rs::extensions::Erc1155Module;
use alloy::primitives::Address;
use pyo3::{pyclass, pymethods, PyResult};

use crate::{
    error_handling::{map_eyre_to_pyerr, map_parse_to_pyerr},
    get_attested_event,
    types::{AttestedLog, Erc1155Data, LogWithHash},
};

/// Payment API for ERC1155 tokens
#[pyclass]
#[derive(Clone)]
pub struct Payment {
    inner: Erc1155Module,
}

impl Payment {
    pub fn new(inner: Erc1155Module) -> Self {
        Self { inner }
    }
}

#[pymethods]
impl Payment {
    /// Makes a direct payment with ERC1155 tokens.
    pub fn pay<'py>(
        &self,
        py: pyo3::Python<'py>,
        price: Erc1155Data,
        payee: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let payee: Address = payee.parse().map_err(map_parse_to_pyerr)?;
            let receipt = inner
                .payment()
                .pay(&price.try_into().map_err(map_eyre_to_pyerr)?, payee)
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(LogWithHash::<AttestedLog> {
                log: get_attested_event(receipt.clone())
                    .map_err(map_eyre_to_pyerr)?
                    .data
                    .into(),
                transaction_hash: receipt.transaction_hash.to_string(),
            })
        })
    }

    /// Makes a direct payment with ERC1155 tokens after approving, then revokes approval.
    ///
    /// Returns:
    ///     Tuple of (approval_tx_hash, LogWithHash, revoke_tx_hash)
    pub fn approve_and_pay<'py>(
        &self,
        py: pyo3::Python<'py>,
        price: Erc1155Data,
        payee: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let payee: Address = payee.parse().map_err(map_parse_to_pyerr)?;
            let (approval_receipt, payment_receipt, revoke_receipt) = inner
                .payment()
                .approve_and_pay(&price.try_into().map_err(map_eyre_to_pyerr)?, payee)
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok((
                approval_receipt.transaction_hash.to_string(),
                LogWithHash::<AttestedLog> {
                    log: get_attested_event(payment_receipt.clone())
                        .map_err(map_eyre_to_pyerr)?
                        .data
                        .into(),
                    transaction_hash: payment_receipt.transaction_hash.to_string(),
                },
                revoke_receipt.transaction_hash.to_string(),
            ))
        })
    }

    /// Pays the ERC1155 demand for an escrow and collects the escrow atomically.
    /// Pay an ERC1155 payment obligation and collect the matching escrow atomically.
    ///
    /// Security note: uses AtomicPaymentUtils, which has not been included in
    /// professional manual audits and has only been reviewed by automated audit
    /// tooling so far.
    pub fn pay_erc1155_and_collect<'py>(
        &self,
        py: pyo3::Python<'py>,
        escrow_uid: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let receipt = inner
                .payment()
                .pay_erc1155_and_collect(escrow_uid.parse().map_err(map_parse_to_pyerr)?)
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(LogWithHash::<AttestedLog> {
                log: get_attested_event(receipt.clone())
                    .map_err(map_eyre_to_pyerr)?
                    .data
                    .into(),
                transaction_hash: receipt.transaction_hash.to_string(),
            })
        })
    }

    /// Pays the ERC1155 demand for an escrow and collects without SDK escrow-attester validation.
    ///
    /// Use only after independently validating that `escrow_uid` was authored by
    /// the escrow contract you intend to settle.
    pub fn pay_erc1155_and_collect_unchecked<'py>(
        &self,
        py: pyo3::Python<'py>,
        escrow_uid: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let receipt = inner
                .payment()
                .pay_erc1155_and_collect_unchecked(escrow_uid.parse().map_err(map_parse_to_pyerr)?)
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(LogWithHash::<AttestedLog> {
                log: get_attested_event(receipt.clone())
                    .map_err(map_eyre_to_pyerr)?
                    .data
                    .into(),
                transaction_hash: receipt.transaction_hash.to_string(),
            })
        })
    }
}
