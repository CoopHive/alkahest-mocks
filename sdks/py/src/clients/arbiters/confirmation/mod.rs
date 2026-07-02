//! Confirmation arbiters module
//!
//! This module contains arbiters that handle confirmation-based logic
//! for attestation validation.
//!
//! - ExclusiveRevocableConfirmationArbiter: Single fulfillment per escrow, can revoke
//! - ExclusiveUnrevocableConfirmationArbiter: Single fulfillment per escrow, cannot revoke
//! - NonexclusiveRevocableConfirmationArbiter: Multiple fulfillments per escrow, can revoke
//! - NonexclusiveUnrevocableConfirmationArbiter: Multiple fulfillments per escrow, cannot revoke

pub mod exclusive_revocable;
pub mod exclusive_unrevocable;
pub mod nonexclusive_revocable;
pub mod nonexclusive_unrevocable;

use alkahest_rs::{clients::arbiters::ConfirmationOptions, extensions::ArbitersModule};
use pyo3::{pyclass, pymethods};

/// Confirmation arbiter type enum
#[pyclass]
#[derive(Clone, Debug)]
pub enum PyConfirmationArbiterType {
    /// Only one fulfillment can be confirmed per escrow, confirmation can be revoked
    ExclusiveRevocable,
    /// Only one fulfillment can be confirmed per escrow, confirmation cannot be revoked
    ExclusiveUnrevocable,
    /// Multiple fulfillments can be confirmed per escrow, confirmations can be revoked
    NonexclusiveRevocable,
    /// Multiple fulfillments can be confirmed per escrow, confirmations cannot be revoked
    NonexclusiveUnrevocable,
}

/// Confirmation arbiters API accessor
#[pyclass]
#[derive(Clone)]
pub struct Confirmation {
    inner: ArbitersModule,
}

impl Confirmation {
    pub fn new(inner: ArbitersModule) -> Self {
        Self { inner }
    }
}

#[pymethods]
impl Confirmation {
    /// Access ExclusiveRevocableConfirmationArbiter
    #[getter]
    pub fn exclusive_revocable(&self) -> exclusive_revocable::ExclusiveRevocable {
        exclusive_revocable::ExclusiveRevocable::new(self.inner.clone())
    }

    /// Access ExclusiveUnrevocableConfirmationArbiter
    #[getter]
    pub fn exclusive_unrevocable(&self) -> exclusive_unrevocable::ExclusiveUnrevocable {
        exclusive_unrevocable::ExclusiveUnrevocable::new(self.inner.clone())
    }

    /// Access NonexclusiveRevocableConfirmationArbiter
    #[getter]
    pub fn nonexclusive_revocable(&self) -> nonexclusive_revocable::NonexclusiveRevocable {
        nonexclusive_revocable::NonexclusiveRevocable::new(self.inner.clone())
    }

    /// Access NonexclusiveUnrevocableConfirmationArbiter
    #[getter]
    pub fn nonexclusive_unrevocable(&self) -> nonexclusive_unrevocable::NonexclusiveUnrevocable {
        nonexclusive_unrevocable::NonexclusiveUnrevocable::new(self.inner.clone())
    }

    /// Get the address of a confirmation arbiter by type
    pub fn address(&self, arbiter_type: PyConfirmationArbiterType) -> String {
        let addr = match arbiter_type {
            PyConfirmationArbiterType::ExclusiveRevocable => {
                self.inner
                    .addresses
                    .exclusive_revocable_confirmation_arbiter
            }
            PyConfirmationArbiterType::ExclusiveUnrevocable => {
                self.inner
                    .addresses
                    .exclusive_unrevocable_confirmation_arbiter
            }
            PyConfirmationArbiterType::NonexclusiveRevocable => {
                self.inner
                    .addresses
                    .nonexclusive_revocable_confirmation_arbiter
            }
            PyConfirmationArbiterType::NonexclusiveUnrevocable => {
                self.inner
                    .addresses
                    .nonexclusive_unrevocable_confirmation_arbiter
            }
        };
        format!("{:?}", addr)
    }

    /// Get the address of a confirmation arbiter by semantic options.
    pub fn address_for(&self, exclusive: bool, revocable: bool) -> String {
        self.inner
            .confirmation_arbiter_address_by_options(ConfirmationOptions {
                exclusive,
                revocable,
            })
            .to_string()
    }
}
