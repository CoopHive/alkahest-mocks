import type { ChainAddresses } from "./types";
import { isAddressEqual, zeroAddress } from "viem";

export type ContractAddressInfo = {
  address: `0x${string}`;
  section: string;
  field: string;
  contract: keyof ChainAddresses;
  escrowKind?: string;
};

type AddressSlot = {
  contract: keyof ChainAddresses;
  section: string;
  field: string;
  escrowKind?: string;
};

const ADDRESS_SLOTS: AddressSlot[] = [
  { contract: "eas", section: "arbiters_addresses", field: "eas" },
  { contract: "easSchemaRegistry", section: "attestation_addresses", field: "eas_schema_registry" },
  { contract: "trivialArbiter", section: "arbiters_addresses", field: "trivial_arbiter" },
  { contract: "trustedOracleArbiter", section: "arbiters_addresses", field: "trusted_oracle_arbiter" },
  {
    contract: "commitmentTrustedOracleArbiter",
    section: "arbiters_addresses",
    field: "commitment_trusted_oracle_arbiter",
  },
  { contract: "intrinsicsArbiter", section: "arbiters_addresses", field: "intrinsics_arbiter" },
  { contract: "erc8004Arbiter", section: "arbiters_addresses", field: "erc8004_arbiter" },
  { contract: "referencesEscrowArbiter", section: "arbiters_addresses", field: "references_escrow_arbiter" },
  { contract: "anyArbiter", section: "arbiters_addresses", field: "any_arbiter" },
  { contract: "allArbiter", section: "arbiters_addresses", field: "all_arbiter" },
  { contract: "attesterArbiter", section: "arbiters_addresses", field: "attester_arbiter" },
  { contract: "expirationTimeAfterArbiter", section: "arbiters_addresses", field: "expiration_time_after_arbiter" },
  { contract: "expirationTimeBeforeArbiter", section: "arbiters_addresses", field: "expiration_time_before_arbiter" },
  { contract: "expirationTimeEqualArbiter", section: "arbiters_addresses", field: "expiration_time_equal_arbiter" },
  { contract: "recipientArbiter", section: "arbiters_addresses", field: "recipient_arbiter" },
  { contract: "refUidArbiter", section: "arbiters_addresses", field: "ref_uid_arbiter" },
  { contract: "revocableArbiter", section: "arbiters_addresses", field: "revocable_arbiter" },
  { contract: "schemaArbiter", section: "arbiters_addresses", field: "schema_arbiter" },
  { contract: "timeAfterArbiter", section: "arbiters_addresses", field: "time_after_arbiter" },
  { contract: "timeBeforeArbiter", section: "arbiters_addresses", field: "time_before_arbiter" },
  { contract: "timeEqualArbiter", section: "arbiters_addresses", field: "time_equal_arbiter" },
  { contract: "uidArbiter", section: "arbiters_addresses", field: "uid_arbiter" },
  {
    contract: "exclusiveRevocableConfirmationArbiter",
    section: "arbiters_addresses",
    field: "exclusive_revocable_confirmation_arbiter",
  },
  {
    contract: "exclusiveUnrevocableConfirmationArbiter",
    section: "arbiters_addresses",
    field: "exclusive_unrevocable_confirmation_arbiter",
  },
  {
    contract: "nonexclusiveRevocableConfirmationArbiter",
    section: "arbiters_addresses",
    field: "nonexclusive_revocable_confirmation_arbiter",
  },
  {
    contract: "nonexclusiveUnrevocableConfirmationArbiter",
    section: "arbiters_addresses",
    field: "nonexclusive_unrevocable_confirmation_arbiter",
  },
  ...paymentSlots("erc20", "erc20"),
  ...paymentSlots("erc721", "erc721"),
  ...paymentSlots("erc1155", "erc1155"),
  ...paymentSlots("nativeToken", "native_token"),
  ...paymentSlots("tokenBundle", "token_bundle"),
  { contract: "hookEscrowObligation", section: "hook_based_addresses", field: "hook_escrow_obligation" },
  { contract: "hooksEscrowObligation", section: "hook_based_addresses", field: "hooks_escrow_obligation" },
  { contract: "erc20EscrowHook", section: "hook_based_addresses", field: "erc20_escrow_hook" },
  { contract: "erc721EscrowHook", section: "hook_based_addresses", field: "erc721_escrow_hook" },
  { contract: "erc1155EscrowHook", section: "hook_based_addresses", field: "erc1155_escrow_hook" },
  { contract: "nativeTokenEscrowHook", section: "hook_based_addresses", field: "native_token_escrow_hook" },
  { contract: "attestationEscrowHook", section: "hook_based_addresses", field: "attestation_escrow_hook" },
  {
    contract: "attestationReferenceEscrowHook",
    section: "hook_based_addresses",
    field: "attestation_reference_escrow_hook",
  },
  { contract: "eas", section: "hook_based_addresses", field: "eas" },
  { contract: "erc20Splitter", section: "splitters_addresses", field: "erc20_splitter" },
  { contract: "erc1155Splitter", section: "splitters_addresses", field: "erc1155_splitter" },
  { contract: "nativeTokenSplitter", section: "splitters_addresses", field: "native_token_splitter" },
  { contract: "tokenBundleSplitter", section: "splitters_addresses", field: "token_bundle_splitter" },
  {
    contract: "tokenBundleSplitterUnvalidated",
    section: "splitters_addresses",
    field: "token_bundle_splitter_unvalidated",
  },
  { contract: "commitmentERC20Splitter", section: "splitters_addresses", field: "commitment_erc20_splitter" },
  {
    contract: "commitmentERC1155Splitter",
    section: "splitters_addresses",
    field: "commitment_erc1155_splitter",
  },
  {
    contract: "commitmentNativeTokenSplitter",
    section: "splitters_addresses",
    field: "commitment_native_token_splitter",
  },
  {
    contract: "commitmentTokenBundleSplitter",
    section: "splitters_addresses",
    field: "commitment_token_bundle_splitter",
  },
  {
    contract: "commitmentTokenBundleSplitterUnvalidated",
    section: "splitters_addresses",
    field: "commitment_token_bundle_splitter_unvalidated",
  },
  { contract: "atomicAttestationUtils", section: "attestation_addresses", field: "atomic_attestation_utils" },
  { contract: "eas", section: "attestation_addresses", field: "eas" },
  {
    contract: "attestationEscrowObligation",
    section: "attestation_addresses",
    field: "escrow_obligation_default",
    escrowKind: "attestation_escrow_obligation_default",
  },
  {
    contract: "attestationUnconditionalEscrowObligation",
    section: "attestation_addresses",
    field: "escrow_obligation_unconditional",
    escrowKind: "attestation_escrow_obligation_unconditional",
  },
  {
    contract: "attestationReferenceEscrowObligation",
    section: "attestation_addresses",
    field: "attestation_reference_escrow_obligation_default",
    escrowKind: "attestation_reference_escrow_obligation_default",
  },
  {
    contract: "attestationReferenceUnconditionalEscrowObligation",
    section: "attestation_addresses",
    field: "attestation_reference_escrow_obligation_unconditional",
    escrowKind: "attestation_reference_escrow_obligation_unconditional",
  },
  { contract: "eas", section: "string_obligation_addresses", field: "eas" },
  { contract: "stringObligation", section: "string_obligation_addresses", field: "obligation" },
  { contract: "eas", section: "commit_reveal_obligation_addresses", field: "eas" },
  { contract: "commitRevealObligation", section: "commit_reveal_obligation_addresses", field: "obligation" },
];

function paymentSlots(prefix: string, sectionPrefix: string): AddressSlot[] {
  const defaultContract = `${prefix}EscrowObligation` as keyof ChainAddresses;
  const unconditionalContract = `${prefix}UnconditionalEscrowObligation` as keyof ChainAddresses;
  const paymentContract = `${prefix}PaymentObligation` as keyof ChainAddresses;
  const atomicContract = `${prefix}AtomicPaymentUtils` as keyof ChainAddresses;
  const section = `${sectionPrefix}_addresses`;

  return [
    { contract: "eas", section, field: "eas" },
    { contract: atomicContract, section, field: "atomic_payment_utils" },
    {
      contract: defaultContract,
      section,
      field: "escrow_obligation_default",
      escrowKind: `${sectionPrefix}_escrow_obligation_default`,
    },
    {
      contract: unconditionalContract,
      section,
      field: "escrow_obligation_unconditional",
      escrowKind: `${sectionPrefix}_escrow_obligation_unconditional`,
    },
    { contract: paymentContract, section, field: "payment_obligation" },
  ];
}

export function createAddressIndex(
  addresses: Partial<ChainAddresses>,
): Record<string, ContractAddressInfo[]> {
  const index: Record<string, ContractAddressInfo[]> = {};

  for (const slot of ADDRESS_SLOTS) {
    const address = addresses[slot.contract];
    if (!address) continue;
    if (isAddressEqual(address, zeroAddress)) continue;

    const key = address.toLowerCase();
    index[key] ??= [];
    index[key].push({
      address,
      section: slot.section,
      field: slot.field,
      contract: slot.contract,
      ...(slot.escrowKind ? { escrowKind: slot.escrowKind } : {}),
    });
  }

  return index;
}

export function lookupAddress(
  addresses: Partial<ChainAddresses>,
  address: `0x${string}`,
): ContractAddressInfo[] {
  return createAddressIndex(addresses)[address.toLowerCase()] ?? [];
}
