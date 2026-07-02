//! Attestation reference escrow obligation clients
//!
//! Reference escrows reference the attestation by UID instead of storing the full data.

pub mod default_escrow;
pub mod unconditional;

pub use default_escrow::Default;
pub use unconditional::Unconditional;

use super::super::AttestationModule;

/// Default-checking or unconditional attestation-reference escrow variant.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EscrowChecks {
    Default,
    Unconditional,
}

/// Attestation-reference escrow client selected by [`EscrowChecks`].
pub enum EscrowVariant<'a> {
    Default(Default<'a>),
    Unconditional(Unconditional<'a>),
}

/// Attestation-reference escrow API accessor.
pub struct ReferenceEscrow<'a> {
    module: &'a AttestationModule,
}

impl<'a> ReferenceEscrow<'a> {
    pub fn new(module: &'a AttestationModule) -> Self {
        Self { module }
    }

    /// Access default escrow operations (1:1 escrow:fulfillment)
    pub fn default(&self) -> Default<'a> {
        Default::new(self.module)
    }

    /// Access unconditional escrow operations (no default fulfillment checks)
    pub fn unconditional(&self) -> Unconditional<'a> {
        Unconditional::new(self.module)
    }

    /// Select an escrow API by default-checking behavior.
    pub fn by_checks(&self, checks: EscrowChecks) -> EscrowVariant<'a> {
        match checks {
            EscrowChecks::Default => EscrowVariant::Default(self.default()),
            EscrowChecks::Unconditional => EscrowVariant::Unconditional(self.unconditional()),
        }
    }
}
