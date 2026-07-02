//! Confirmation arbiters module
//!
//! This module contains arbiters that handle confirmation-based logic
//! for attestation validation.
//!
//! The confirmation arbiters have been restructured with new naming:
//! - ExclusiveRevocableConfirmationArbiter: Single fulfillment per escrow, can revoke
//! - ExclusiveUnrevocableConfirmationArbiter: Single fulfillment per escrow, cannot revoke
//! - NonexclusiveRevocableConfirmationArbiter: Multiple fulfillments per escrow, can revoke
//! - NonexclusiveUnrevocableConfirmationArbiter: Multiple fulfillments per escrow, cannot revoke
//!
//! Note: These arbiters do not use DemandData - they use confirmations mapping.

pub mod exclusive_revocable;
pub mod exclusive_unrevocable;
pub mod nonexclusive_revocable;
pub mod nonexclusive_unrevocable;

use alloy::primitives::Address;

use crate::clients::arbiters::ArbitersModule;

/// Confirmation arbiter type
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConfirmationArbiterType {
    /// Only one fulfillment can be confirmed per escrow, confirmation can be revoked
    ExclusiveRevocable,
    /// Only one fulfillment can be confirmed per escrow, confirmation cannot be revoked
    ExclusiveUnrevocable,
    /// Multiple fulfillments can be confirmed per escrow, confirmations can be revoked
    NonexclusiveRevocable,
    /// Multiple fulfillments can be confirmed per escrow, confirmations cannot be revoked
    NonexclusiveUnrevocable,
}

/// Semantic selector for the confirmation arbiter matrix.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ConfirmationOptions {
    /// Whether only one fulfillment can be confirmed for an escrow.
    pub exclusive: bool,
    /// Whether confirmations can be revoked.
    pub revocable: bool,
}

impl From<ConfirmationOptions> for ConfirmationArbiterType {
    fn from(options: ConfirmationOptions) -> Self {
        match (options.exclusive, options.revocable) {
            (true, true) => ConfirmationArbiterType::ExclusiveRevocable,
            (true, false) => ConfirmationArbiterType::ExclusiveUnrevocable,
            (false, true) => ConfirmationArbiterType::NonexclusiveRevocable,
            (false, false) => ConfirmationArbiterType::NonexclusiveUnrevocable,
        }
    }
}

/// Confirmation arbiter client selected by [`ConfirmationOptions`].
pub enum ConfirmationVariant<'a> {
    ExclusiveRevocable(exclusive_revocable::ExclusiveRevocable<'a>),
    ExclusiveUnrevocable(exclusive_unrevocable::ExclusiveUnrevocable<'a>),
    NonexclusiveRevocable(nonexclusive_revocable::NonexclusiveRevocable<'a>),
    NonexclusiveUnrevocable(nonexclusive_unrevocable::NonexclusiveUnrevocable<'a>),
}

/// Confirmation arbiters API
pub struct Confirmation<'a> {
    module: &'a ArbitersModule,
}

impl<'a> Confirmation<'a> {
    pub fn new(module: &'a ArbitersModule) -> Self {
        Self { module }
    }

    /// Access ExclusiveRevocableConfirmationArbiter
    pub fn exclusive_revocable(&self) -> exclusive_revocable::ExclusiveRevocable<'_> {
        exclusive_revocable::ExclusiveRevocable::new(self.module)
    }

    /// Access ExclusiveUnrevocableConfirmationArbiter
    pub fn exclusive_unrevocable(&self) -> exclusive_unrevocable::ExclusiveUnrevocable<'_> {
        exclusive_unrevocable::ExclusiveUnrevocable::new(self.module)
    }

    /// Access NonexclusiveRevocableConfirmationArbiter
    pub fn nonexclusive_revocable(&self) -> nonexclusive_revocable::NonexclusiveRevocable<'_> {
        nonexclusive_revocable::NonexclusiveRevocable::new(self.module)
    }

    /// Access NonexclusiveUnrevocableConfirmationArbiter
    pub fn nonexclusive_unrevocable(
        &self,
    ) -> nonexclusive_unrevocable::NonexclusiveUnrevocable<'_> {
        nonexclusive_unrevocable::NonexclusiveUnrevocable::new(self.module)
    }

    /// Select a confirmation arbiter API by exclusivity and revocability.
    pub fn by_options(&self, options: ConfirmationOptions) -> ConfirmationVariant<'_> {
        match options.into() {
            ConfirmationArbiterType::ExclusiveRevocable => {
                ConfirmationVariant::ExclusiveRevocable(self.exclusive_revocable())
            }
            ConfirmationArbiterType::ExclusiveUnrevocable => {
                ConfirmationVariant::ExclusiveUnrevocable(self.exclusive_unrevocable())
            }
            ConfirmationArbiterType::NonexclusiveRevocable => {
                ConfirmationVariant::NonexclusiveRevocable(self.nonexclusive_revocable())
            }
            ConfirmationArbiterType::NonexclusiveUnrevocable => {
                ConfirmationVariant::NonexclusiveUnrevocable(self.nonexclusive_unrevocable())
            }
        }
    }
}

impl ArbitersModule {
    /// Get the address of a confirmation arbiter by type
    pub fn confirmation_arbiter_address(&self, arbiter_type: ConfirmationArbiterType) -> Address {
        match arbiter_type {
            ConfirmationArbiterType::ExclusiveRevocable => {
                self.addresses.exclusive_revocable_confirmation_arbiter
            }
            ConfirmationArbiterType::ExclusiveUnrevocable => {
                self.addresses.exclusive_unrevocable_confirmation_arbiter
            }
            ConfirmationArbiterType::NonexclusiveRevocable => {
                self.addresses.nonexclusive_revocable_confirmation_arbiter
            }
            ConfirmationArbiterType::NonexclusiveUnrevocable => {
                self.addresses.nonexclusive_unrevocable_confirmation_arbiter
            }
        }
    }

    /// Get the address of a confirmation arbiter by semantic options.
    pub fn confirmation_arbiter_address_by_options(&self, options: ConfirmationOptions) -> Address {
        self.confirmation_arbiter_address(options.into())
    }

    /// Access confirmation arbiters API
    ///
    /// # Example
    /// ```rust,ignore
    /// arbiters.confirmation().exclusive_revocable().confirm(fulfillment, escrow).await?;
    /// arbiters.confirmation().nonexclusive_revocable().revoke(fulfillment, escrow).await?;
    /// ```
    pub fn confirmation(&self) -> Confirmation<'_> {
        Confirmation::new(self)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn confirmation_options_map_to_contract_type() {
        assert_eq!(
            ConfirmationArbiterType::from(ConfirmationOptions {
                exclusive: true,
                revocable: true,
            }),
            ConfirmationArbiterType::ExclusiveRevocable
        );
        assert_eq!(
            ConfirmationArbiterType::from(ConfirmationOptions {
                exclusive: true,
                revocable: false,
            }),
            ConfirmationArbiterType::ExclusiveUnrevocable
        );
        assert_eq!(
            ConfirmationArbiterType::from(ConfirmationOptions {
                exclusive: false,
                revocable: true,
            }),
            ConfirmationArbiterType::NonexclusiveRevocable
        );
        assert_eq!(
            ConfirmationArbiterType::from(ConfirmationOptions {
                exclusive: false,
                revocable: false,
            }),
            ConfirmationArbiterType::NonexclusiveUnrevocable
        );
    }
}
