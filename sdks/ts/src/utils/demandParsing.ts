import { isAddressEqual, type Address, zeroAddress } from "viem";
// Import static decode functions from attestation properties arbiters
import { decodeDemand as decodeAttesterDemand } from "../clients/arbiters/attestationProperties/attesterArbiter";
import { decodeDemand as decodeExpirationTimeAfterDemand } from "../clients/arbiters/attestationProperties/expirationTimeAfterArbiter";
import { decodeDemand as decodeExpirationTimeBeforeDemand } from "../clients/arbiters/attestationProperties/expirationTimeBeforeArbiter";
import { decodeDemand as decodeExpirationTimeEqualDemand } from "../clients/arbiters/attestationProperties/expirationTimeEqualArbiter";
import { decodeDemand as decodeRecipientDemand } from "../clients/arbiters/attestationProperties/recipientArbiter";
import { decodeDemand as decodeRefUidDemand } from "../clients/arbiters/attestationProperties/refUidArbiter";
import { decodeDemand as decodeRevocableDemand } from "../clients/arbiters/attestationProperties/revocableArbiter";
import { decodeDemand as decodeSchemaDemand } from "../clients/arbiters/attestationProperties/schemaArbiter";
import { decodeDemand as decodeTimeAfterDemand } from "../clients/arbiters/attestationProperties/timeAfterArbiter";
import { decodeDemand as decodeTimeBeforeDemand } from "../clients/arbiters/attestationProperties/timeBeforeArbiter";
import { decodeDemand as decodeTimeEqualDemand } from "../clients/arbiters/attestationProperties/timeEqualArbiter";
import { decodeDemand as decodeUidDemand } from "../clients/arbiters/attestationProperties/uidArbiter";
// Import static decode functions from general arbiters
import { decodeDemand as decodeERC8004Demand } from "../clients/arbiters/general/erc8004Arbiter";
import { decodeDemand as decodeCommitmentTrustedOracleDemand } from "../clients/arbiters/general/commitmentTrustedOracle";
import { decodeDemand as decodeReferencesEscrowDemand } from "../clients/arbiters/general/referencesEscrowArbiter";
import { decodeDemand as decodeTrustedOracleDemand } from "../clients/arbiters/general/trustedOracle";
import type { DecodersRecord, DemandDecoder, RecursivelyDecodedDemand } from "../clients/arbiters/logical";
import { AllArbiter, AnyArbiter } from "../clients/arbiters/logical";
import type { ChainAddresses, Demand } from "../types";

/**
 * Result of decoding an unknown demand
 */
export type DecodedDemandResult = {
  arbiter: Address;
  decoded: Record<string, unknown>;
  children?: DecodedDemandResult[];
  isUnknown?: boolean;
};

/**
 * Creates a decoders record from ChainAddresses
 * This maps arbiter addresses to their decode functions for recursive demand parsing
 *
 * @param addresses - ChainAddresses containing all arbiter addresses
 * @param extraDecoders - Optional extension arbiter decoders keyed by arbiter address
 * @returns DecodersRecord mapping addresses to decoder functions
 */
export const createDecodersFromAddresses = (
  addresses: ChainAddresses,
  extraDecoders: Partial<DecodersRecord> = {},
): DecodersRecord => {
  const decoders: DecodersRecord = {};
  const registerDecoder = (arbiter: Address, decoder: DemandDecoder) => {
    if (!isAddressEqual(arbiter, zeroAddress)) {
      decoders[arbiter.toLowerCase() as Address] = decoder;
    }
  };

  // Logical arbiters (composing - return children)
  if (addresses.allArbiter) {
    registerDecoder(addresses.allArbiter, AllArbiter.decodeDemand as DemandDecoder);
  }
  if (addresses.anyArbiter) {
    registerDecoder(addresses.anyArbiter, AnyArbiter.decodeDemand as DemandDecoder);
  }

  // Attestation properties arbiters (non-composing)
  if (addresses.attesterArbiter) {
    registerDecoder(addresses.attesterArbiter, decodeAttesterDemand as DemandDecoder);
  }
  if (addresses.recipientArbiter) {
    registerDecoder(addresses.recipientArbiter, decodeRecipientDemand as DemandDecoder);
  }
  if (addresses.refUidArbiter) {
    registerDecoder(addresses.refUidArbiter, decodeRefUidDemand as DemandDecoder);
  }
  if (addresses.revocableArbiter) {
    registerDecoder(addresses.revocableArbiter, decodeRevocableDemand as DemandDecoder);
  }
  if (addresses.schemaArbiter) {
    registerDecoder(addresses.schemaArbiter, decodeSchemaDemand as DemandDecoder);
  }
  if (addresses.uidArbiter) {
    registerDecoder(addresses.uidArbiter, decodeUidDemand as DemandDecoder);
  }
  if (addresses.timeAfterArbiter) {
    registerDecoder(addresses.timeAfterArbiter, decodeTimeAfterDemand as DemandDecoder);
  }
  if (addresses.timeBeforeArbiter) {
    registerDecoder(addresses.timeBeforeArbiter, decodeTimeBeforeDemand as DemandDecoder);
  }
  if (addresses.timeEqualArbiter) {
    registerDecoder(addresses.timeEqualArbiter, decodeTimeEqualDemand as DemandDecoder);
  }
  if (addresses.expirationTimeAfterArbiter) {
    registerDecoder(addresses.expirationTimeAfterArbiter, decodeExpirationTimeAfterDemand as DemandDecoder);
  }
  if (addresses.expirationTimeBeforeArbiter) {
    registerDecoder(addresses.expirationTimeBeforeArbiter, decodeExpirationTimeBeforeDemand as DemandDecoder);
  }
  if (addresses.expirationTimeEqualArbiter) {
    registerDecoder(addresses.expirationTimeEqualArbiter, decodeExpirationTimeEqualDemand as DemandDecoder);
  }

  // General arbiters
  if (addresses.trustedOracleArbiter) {
    registerDecoder(addresses.trustedOracleArbiter, decodeTrustedOracleDemand as DemandDecoder);
  }
  if (addresses.commitmentTrustedOracleArbiter) {
    registerDecoder(addresses.commitmentTrustedOracleArbiter, decodeCommitmentTrustedOracleDemand as DemandDecoder);
  }
  if (addresses.erc8004Arbiter) {
    registerDecoder(addresses.erc8004Arbiter, decodeERC8004Demand as DemandDecoder);
  }
  if (addresses.referencesEscrowArbiter) {
    registerDecoder(addresses.referencesEscrowArbiter, decodeReferencesEscrowDemand as DemandDecoder);
  }

  // Note: Confirmation arbiters don't have DemandData - they are action-based (confirm/revoke)
  // TrivialArbiter and IntrinsicsArbiter don't have DemandData either

  for (const [arbiter, decoder] of Object.entries(extraDecoders)) {
    if (decoder) {
      registerDecoder(arbiter as Address, decoder);
    }
  }

  return decoders;
};

/**
 * Decodes a demand of unknown type using the provided decoders record
 * If the arbiter is a composing arbiter (All/Any), recursively decodes children
 *
 * @param demand - The demand to decode {arbiter: Address, demand: Bytes}
 * @param decoders - DecodersRecord mapping addresses to decoder functions
 * @returns Decoded demand with optional children for composing arbiters
 */
export const decodeDemand = (demand: Demand, decoders: DecodersRecord): DecodedDemandResult => {
  const decoder = decoders[demand.arbiter.toLowerCase() as Address];

  if (!decoder) {
    return {
      arbiter: demand.arbiter,
      decoded: { raw: demand.demand },
      isUnknown: true,
    };
  }

  const decoded = decoder(demand.demand);

  // Check if this is a composing arbiter (has children)
  if ("children" in decoded && Array.isArray(decoded.children)) {
    const children = decoded.children.map((child) => decodeDemand(child, decoders));

    return {
      arbiter: demand.arbiter,
      decoded: decoded as Record<string, unknown>,
      children,
    };
  }

  return {
    arbiter: demand.arbiter,
    decoded: decoded as Record<string, unknown>,
  };
};

/**
 * Decodes a demand of unknown type using ChainAddresses
 * Convenience function that creates decoders from addresses and decodes the demand
 *
 * @param demand - The demand to decode {arbiter: Address, demand: Bytes}
 * @param addresses - ChainAddresses containing all arbiter addresses
 * @param extraDecoders - Optional extension arbiter decoders keyed by arbiter address
 * @returns Decoded demand with optional children for composing arbiters
 */
export const decodeDemandWithAddresses = (
  demand: Demand,
  addresses: ChainAddresses,
  extraDecoders: Partial<DecodersRecord> = {},
): DecodedDemandResult => {
  const decoders = createDecodersFromAddresses(addresses, extraDecoders);
  return decodeDemand(demand, decoders);
};

// Re-export types
export type { DecodersRecord, RecursivelyDecodedDemand, DemandDecoder };
