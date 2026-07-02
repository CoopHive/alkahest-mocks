import type { ChainAddresses } from "../../../types";
import type { ViemClient } from "../../../utils";
import { type AttestationEscrowClient, makeAttestationEscrowClient } from "./escrow";
import { type AttestationUtilClient, makeAttestationUtilClient } from "./util";

export { type AttestationEscrowClient, makeAttestationEscrowClient } from "./escrow";
export { type AttestationEscrowDefaultClient, makeAttestationEscrowDefaultClient } from "./escrow/default";
export { type AttestationReferenceEscrowClient, makeAttestationReferenceEscrowClient } from "./escrow/reference";
export {
  type AttestationReferenceEscrowUnconditionalClient,
  makeAttestationReferenceEscrowUnconditionalClient,
} from "./escrow/referenceUnconditional";
export {
  type AttestationEscrowUnconditionalClient,
  makeAttestationEscrowUnconditionalClient,
} from "./escrow/unconditional";
export { type AttestationUtilClient, makeAttestationUtilClient } from "./util";

/** Addresses required by the attestation escrow clients. */
export type AttestationAddresses = {
  eas: `0x${string}`;
  atomicUtils: `0x${string}`;
  escrowObligation: `0x${string}`;
  escrowObligationUnconditional: `0x${string}`;
  attestationReferenceEscrowObligation: `0x${string}`;
  attestationReferenceEscrowObligationUnconditional: `0x${string}`;
};

/** Pick attestation escrow addresses from a full chain address map. */
export const pickAttestationAddresses = (addresses: ChainAddresses): AttestationAddresses => ({
  eas: addresses.eas,
  atomicUtils: addresses.atomicAttestationUtils,
  escrowObligation: addresses.attestationEscrowObligation,
  escrowObligationUnconditional: addresses.attestationUnconditionalEscrowObligation,
  attestationReferenceEscrowObligation: addresses.attestationReferenceEscrowObligation,
  attestationReferenceEscrowObligationUnconditional: addresses.attestationReferenceUnconditionalEscrowObligation,
});

/** Attestation escrow namespace client. */
export type AttestationClient = {
  util: AttestationUtilClient;
  escrow: AttestationEscrowClient;
};

/** Create the attestation utility and escrow clients. */
export const makeAttestationClient = (viemClient: ViemClient, addresses: AttestationAddresses): AttestationClient => {
  return {
    util: makeAttestationUtilClient(viemClient, addresses),
    escrow: makeAttestationEscrowClient(viemClient, addresses),
  };
};
