//! ERC1155 escrow obligations module
//!
//! This module contains escrow obligation clients for ERC1155 tokens.
//!
//! - `default`: 1:1 escrow to fulfillment relationship
//! - `unconditional`: no default fulfillment checks

pub mod default_escrow;
pub mod unconditional;

use super::Erc1155Module;

/// Default-checking or unconditional ERC1155 escrow variant.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EscrowChecks {
    Default,
    Unconditional,
}

/// ERC1155 escrow client selected by [`EscrowChecks`].
pub enum EscrowVariant<'a> {
    Default(default_escrow::Default<'a>),
    Unconditional(unconditional::Unconditional<'a>),
}

/// Escrow API for ERC1155 tokens
pub struct Escrow<'a> {
    module: &'a Erc1155Module,
}

impl<'a> Escrow<'a> {
    pub fn new(module: &'a Erc1155Module) -> Self {
        Self { module }
    }

    /// Access default escrow API (1:1 escrow:fulfillment)
    pub fn default(&self) -> default_escrow::Default<'_> {
        default_escrow::Default::new(self.module)
    }

    /// Access unconditional escrow API (no default fulfillment checks)
    pub fn unconditional(&self) -> unconditional::Unconditional<'_> {
        unconditional::Unconditional::new(self.module)
    }

    /// Select an escrow API by default-checking behavior.
    pub fn by_checks(&self, checks: EscrowChecks) -> EscrowVariant<'_> {
        match checks {
            EscrowChecks::Default => EscrowVariant::Default(self.default()),
            EscrowChecks::Unconditional => EscrowVariant::Unconditional(self.unconditional()),
        }
    }
}
