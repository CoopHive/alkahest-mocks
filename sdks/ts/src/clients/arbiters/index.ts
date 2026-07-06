import type { ChainAddresses } from "../../types";
import type { ViemClient } from "../../utils";
import { makeAttestationPropertiesArbitersClient } from "./attestationProperties";
import { makeConfirmationArbitersClient } from "./confirmation";
import { makeGeneralArbitersClient } from "./general";
import { AllArbiter, AnyArbiter, makeLogicalArbitersClient } from "./logical";

/**
 * Hierarchical Arbiters Client
 *
 * Provides a structured, object-oriented interface for all arbiter functionality.
 *
 * API structure:
 * - client.arbiters.general.intrinsics (no DemandData)
 * - client.arbiters.general.trustedOracle.arbitrateForDemand(...)
 * - client.arbiters.logical.any.encodeDemand(...)
 * - client.arbiters.logical.all.decodeDemand(...)
 * - client.arbiters.attestationProperties.recipient.encodeDemand(...)
 * - client.arbiters.attestationProperties.schema.decodeDemand(...)
 * - client.arbiters.confirmation.exclusiveRevocable.confirm(...)
 */
export const makeArbitersClient = (viemClient: ViemClient, addresses: ChainAddresses) => {
  const generalArbiters = makeGeneralArbitersClient(viemClient, addresses);
  const logicalArbiters = makeLogicalArbitersClient(viemClient, addresses);
  const attestationPropertiesArbiters = makeAttestationPropertiesArbitersClient(viemClient, addresses);
  const confirmationArbiters = makeConfirmationArbitersClient(viemClient, addresses);

  return {
    general: generalArbiters,
    logical: logicalArbiters,
    attestationProperties: attestationPropertiesArbiters,
    confirmation: confirmationArbiters,
  };
};

// Export static arbiter objects for use without client instantiation
export { AllArbiter, AnyArbiter };

// Re-export types from attestation properties arbiters
export type { AttesterArbiterDemandData } from "./attestationProperties/attesterArbiter";
// Re-export static encode/decode functions from attestation properties
export {
  decodeDemand as decodeAttesterDemand,
  encodeDemand as encodeAttesterDemand,
} from "./attestationProperties/attesterArbiter";
export type { ExpirationTimeAfterArbiterDemandData } from "./attestationProperties/expirationTimeAfterArbiter";
export {
  decodeDemand as decodeExpirationTimeAfterDemand,
  encodeDemand as encodeExpirationTimeAfterDemand,
} from "./attestationProperties/expirationTimeAfterArbiter";
export type { ExpirationTimeBeforeArbiterDemandData } from "./attestationProperties/expirationTimeBeforeArbiter";
export {
  decodeDemand as decodeExpirationTimeBeforeDemand,
  encodeDemand as encodeExpirationTimeBeforeDemand,
} from "./attestationProperties/expirationTimeBeforeArbiter";
export type { ExpirationTimeEqualArbiterDemandData } from "./attestationProperties/expirationTimeEqualArbiter";
export {
  decodeDemand as decodeExpirationTimeEqualDemand,
  encodeDemand as encodeExpirationTimeEqualDemand,
} from "./attestationProperties/expirationTimeEqualArbiter";
export type { RecipientArbiterDemandData } from "./attestationProperties/recipientArbiter";
export {
  decodeDemand as decodeRecipientDemand,
  encodeDemand as encodeRecipientDemand,
} from "./attestationProperties/recipientArbiter";
export type { RefUidArbiterDemandData } from "./attestationProperties/refUidArbiter";
export {
  decodeDemand as decodeRefUidDemand,
  encodeDemand as encodeRefUidDemand,
} from "./attestationProperties/refUidArbiter";
export type { RevocableArbiterDemandData } from "./attestationProperties/revocableArbiter";
export {
  decodeDemand as decodeRevocableDemand,
  encodeDemand as encodeRevocableDemand,
} from "./attestationProperties/revocableArbiter";
export type { SchemaArbiterDemandData } from "./attestationProperties/schemaArbiter";
export {
  decodeDemand as decodeSchemaDemand,
  encodeDemand as encodeSchemaDemand,
} from "./attestationProperties/schemaArbiter";
export type { TimeAfterArbiterDemandData } from "./attestationProperties/timeAfterArbiter";
export {
  decodeDemand as decodeTimeAfterDemand,
  encodeDemand as encodeTimeAfterDemand,
} from "./attestationProperties/timeAfterArbiter";
export type { TimeBeforeArbiterDemandData } from "./attestationProperties/timeBeforeArbiter";
export {
  decodeDemand as decodeTimeBeforeDemand,
  encodeDemand as encodeTimeBeforeDemand,
} from "./attestationProperties/timeBeforeArbiter";
export type { TimeEqualArbiterDemandData } from "./attestationProperties/timeEqualArbiter";
export {
  decodeDemand as decodeTimeEqualDemand,
  encodeDemand as encodeTimeEqualDemand,
} from "./attestationProperties/timeEqualArbiter";
export type { UidArbiterDemandData } from "./attestationProperties/uidArbiter";
export { decodeDemand as decodeUidDemand, encodeDemand as encodeUidDemand } from "./attestationProperties/uidArbiter";
// Re-export static functions and types from general arbiters
export {
  type ArbitrationMode,
  type AttestationWithDemand,
  decodeERC8004Demand,
  decodeReferencesEscrowDemand,
  decodeTrustedOracleDemand,
  encodeERC8004Demand,
  encodeReferencesEscrowDemand,
  encodeTrustedOracleDemand,
  erc8004RequestHashFor,
  type ERC8004ArbiterDemandData,
  type TrustedOracleArbiterDemandData,
} from "./general";
// Re-export types and static functions from logical arbiters
export type {
  AllArbiterDemandData,
  AnyArbiterDemandData,
  DecodedDemandWithChildren,
  DecodersRecord,
  DemandDecoder,
  RecursivelyDecodedDemand,
} from "./logical";
