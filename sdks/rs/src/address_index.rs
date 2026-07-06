use std::collections::HashMap;

use alloy::primitives::Address;
use serde::{Deserialize, Serialize};

use crate::DefaultExtensionConfig;

macro_rules! add_payment_section {
    ($self:ident, $index:ident, $member:ident, $section:literal, $default_kind:literal, $unconditional_kind:literal) => {
        add_info(&mut $index, $self.$member.eas, $section, "eas", None);
        add_info(
            &mut $index,
            $self.$member.atomic_payment_utils,
            $section,
            "atomic_payment_utils",
            None,
        );
        add_info(
            &mut $index,
            $self.$member.escrow_obligation_default,
            $section,
            "escrow_obligation_default",
            Some($default_kind),
        );
        add_info(
            &mut $index,
            $self.$member.escrow_obligation_unconditional,
            $section,
            "escrow_obligation_unconditional",
            Some($unconditional_kind),
        );
        add_info(
            &mut $index,
            $self.$member.payment_obligation,
            $section,
            "payment_obligation",
            None,
        );
    };
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ContractAddressInfo {
    pub address: Address,
    pub section: String,
    pub field: String,
    pub escrow_kind: Option<String>,
}

impl DefaultExtensionConfig {
    pub fn address_index(&self) -> HashMap<Address, Vec<ContractAddressInfo>> {
        let mut index = HashMap::new();

        macro_rules! add {
            ($section:literal, $field:literal, $address:expr) => {
                add_info(&mut index, $address, $section, $field, None);
            };
            ($section:literal, $field:literal, $address:expr, $escrow_kind:literal) => {
                add_info(&mut index, $address, $section, $field, Some($escrow_kind));
            };
        }

        add!("arbiters_addresses", "eas", self.arbiters_addresses.eas);
        add!(
            "arbiters_addresses",
            "trivial_arbiter",
            self.arbiters_addresses.trivial_arbiter
        );
        add!(
            "arbiters_addresses",
            "trusted_oracle_arbiter",
            self.arbiters_addresses.trusted_oracle_arbiter
        );
        add!(
            "arbiters_addresses",
            "intrinsics_arbiter",
            self.arbiters_addresses.intrinsics_arbiter
        );
        add!(
            "arbiters_addresses",
            "erc8004_arbiter",
            self.arbiters_addresses.erc8004_arbiter
        );
        add!(
            "arbiters_addresses",
            "references_escrow_arbiter",
            self.arbiters_addresses.references_escrow_arbiter
        );
        add!(
            "arbiters_addresses",
            "any_arbiter",
            self.arbiters_addresses.any_arbiter
        );
        add!(
            "arbiters_addresses",
            "all_arbiter",
            self.arbiters_addresses.all_arbiter
        );
        add!(
            "arbiters_addresses",
            "attester_arbiter",
            self.arbiters_addresses.attester_arbiter
        );
        add!(
            "arbiters_addresses",
            "expiration_time_after_arbiter",
            self.arbiters_addresses.expiration_time_after_arbiter
        );
        add!(
            "arbiters_addresses",
            "expiration_time_before_arbiter",
            self.arbiters_addresses.expiration_time_before_arbiter
        );
        add!(
            "arbiters_addresses",
            "expiration_time_equal_arbiter",
            self.arbiters_addresses.expiration_time_equal_arbiter
        );
        add!(
            "arbiters_addresses",
            "recipient_arbiter",
            self.arbiters_addresses.recipient_arbiter
        );
        add!(
            "arbiters_addresses",
            "ref_uid_arbiter",
            self.arbiters_addresses.ref_uid_arbiter
        );
        add!(
            "arbiters_addresses",
            "revocable_arbiter",
            self.arbiters_addresses.revocable_arbiter
        );
        add!(
            "arbiters_addresses",
            "schema_arbiter",
            self.arbiters_addresses.schema_arbiter
        );
        add!(
            "arbiters_addresses",
            "time_after_arbiter",
            self.arbiters_addresses.time_after_arbiter
        );
        add!(
            "arbiters_addresses",
            "time_before_arbiter",
            self.arbiters_addresses.time_before_arbiter
        );
        add!(
            "arbiters_addresses",
            "time_equal_arbiter",
            self.arbiters_addresses.time_equal_arbiter
        );
        add!(
            "arbiters_addresses",
            "uid_arbiter",
            self.arbiters_addresses.uid_arbiter
        );
        add!(
            "arbiters_addresses",
            "exclusive_revocable_confirmation_arbiter",
            self.arbiters_addresses
                .exclusive_revocable_confirmation_arbiter
        );
        add!(
            "arbiters_addresses",
            "exclusive_unrevocable_confirmation_arbiter",
            self.arbiters_addresses
                .exclusive_unrevocable_confirmation_arbiter
        );
        add!(
            "arbiters_addresses",
            "nonexclusive_revocable_confirmation_arbiter",
            self.arbiters_addresses
                .nonexclusive_revocable_confirmation_arbiter
        );
        add!(
            "arbiters_addresses",
            "nonexclusive_unrevocable_confirmation_arbiter",
            self.arbiters_addresses
                .nonexclusive_unrevocable_confirmation_arbiter
        );

        add_payment_section!(
            self,
            index,
            erc20_addresses,
            "erc20_addresses",
            "erc20_escrow_obligation_default",
            "erc20_escrow_obligation_unconditional"
        );
        add_payment_section!(
            self,
            index,
            erc721_addresses,
            "erc721_addresses",
            "erc721_escrow_obligation_default",
            "erc721_escrow_obligation_unconditional"
        );
        add_payment_section!(
            self,
            index,
            erc1155_addresses,
            "erc1155_addresses",
            "erc1155_escrow_obligation_default",
            "erc1155_escrow_obligation_unconditional"
        );
        add_payment_section!(
            self,
            index,
            native_token_addresses,
            "native_token_addresses",
            "native_token_escrow_obligation_default",
            "native_token_escrow_obligation_unconditional"
        );
        add_payment_section!(
            self,
            index,
            token_bundle_addresses,
            "token_bundle_addresses",
            "token_bundle_escrow_obligation_default",
            "token_bundle_escrow_obligation_unconditional"
        );

        add!("hook_based_addresses", "eas", self.hook_based_addresses.eas);
        add!(
            "hook_based_addresses",
            "hook_escrow_obligation",
            self.hook_based_addresses.hook_escrow_obligation
        );
        add!(
            "hook_based_addresses",
            "hooks_escrow_obligation",
            self.hook_based_addresses.hooks_escrow_obligation
        );
        add!(
            "hook_based_addresses",
            "erc20_escrow_hook",
            self.hook_based_addresses.erc20_escrow_hook
        );
        add!(
            "hook_based_addresses",
            "erc721_escrow_hook",
            self.hook_based_addresses.erc721_escrow_hook
        );
        add!(
            "hook_based_addresses",
            "erc1155_escrow_hook",
            self.hook_based_addresses.erc1155_escrow_hook
        );
        add!(
            "hook_based_addresses",
            "native_token_escrow_hook",
            self.hook_based_addresses.native_token_escrow_hook
        );
        add!(
            "hook_based_addresses",
            "attestation_escrow_hook",
            self.hook_based_addresses.attestation_escrow_hook
        );
        add!(
            "hook_based_addresses",
            "attestation_reference_escrow_hook",
            self.hook_based_addresses.attestation_reference_escrow_hook
        );

        add!(
            "splitters_addresses",
            "erc20_splitter",
            self.splitters_addresses.erc20_splitter
        );
        add!(
            "splitters_addresses",
            "erc1155_splitter",
            self.splitters_addresses.erc1155_splitter
        );
        add!(
            "splitters_addresses",
            "native_token_splitter",
            self.splitters_addresses.native_token_splitter
        );
        add!(
            "splitters_addresses",
            "token_bundle_splitter",
            self.splitters_addresses.token_bundle_splitter
        );
        add!(
            "splitters_addresses",
            "token_bundle_splitter_unvalidated",
            self.splitters_addresses.token_bundle_splitter_unvalidated
        );
        add!(
            "splitters_addresses",
            "commitment_erc20_splitter",
            self.splitters_addresses.commitment_erc20_splitter
        );
        add!(
            "splitters_addresses",
            "commitment_erc1155_splitter",
            self.splitters_addresses.commitment_erc1155_splitter
        );
        add!(
            "splitters_addresses",
            "commitment_native_token_splitter",
            self.splitters_addresses.commitment_native_token_splitter
        );
        add!(
            "splitters_addresses",
            "commitment_token_bundle_splitter",
            self.splitters_addresses.commitment_token_bundle_splitter
        );
        add!(
            "splitters_addresses",
            "commitment_token_bundle_splitter_unvalidated",
            self.splitters_addresses
                .commitment_token_bundle_splitter_unvalidated
        );

        add!(
            "attestation_addresses",
            "eas",
            self.attestation_addresses.eas
        );
        add!(
            "attestation_addresses",
            "eas_schema_registry",
            self.attestation_addresses.eas_schema_registry
        );
        add!(
            "attestation_addresses",
            "atomic_attestation_utils",
            self.attestation_addresses.atomic_attestation_utils
        );
        add!(
            "attestation_addresses",
            "escrow_obligation_default",
            self.attestation_addresses.escrow_obligation_default,
            "attestation_escrow_obligation_default"
        );
        add!(
            "attestation_addresses",
            "escrow_obligation_unconditional",
            self.attestation_addresses.escrow_obligation_unconditional,
            "attestation_escrow_obligation_unconditional"
        );
        add!(
            "attestation_addresses",
            "attestation_reference_escrow_obligation_default",
            self.attestation_addresses
                .attestation_reference_escrow_obligation_default,
            "attestation_reference_escrow_obligation_default"
        );
        add!(
            "attestation_addresses",
            "attestation_reference_escrow_obligation_unconditional",
            self.attestation_addresses
                .attestation_reference_escrow_obligation_unconditional,
            "attestation_reference_escrow_obligation_unconditional"
        );

        add!(
            "string_obligation_addresses",
            "eas",
            self.string_obligation_addresses.eas
        );
        add!(
            "string_obligation_addresses",
            "obligation",
            self.string_obligation_addresses.obligation
        );
        add!(
            "commit_reveal_obligation_addresses",
            "eas",
            self.commit_reveal_obligation_addresses.eas
        );
        add!(
            "commit_reveal_obligation_addresses",
            "obligation",
            self.commit_reveal_obligation_addresses.obligation
        );

        index
    }

    pub fn lookup_address(&self, address: Address) -> Vec<ContractAddressInfo> {
        self.address_index().remove(&address).unwrap_or_default()
    }
}

fn add_info(
    index: &mut HashMap<Address, Vec<ContractAddressInfo>>,
    address: Address,
    section: &'static str,
    field: &'static str,
    escrow_kind: Option<&'static str>,
) {
    index.entry(address).or_default().push(ContractAddressInfo {
        address,
        section: section.to_string(),
        field: field.to_string(),
        escrow_kind: escrow_kind.map(str::to_string),
    });
}
