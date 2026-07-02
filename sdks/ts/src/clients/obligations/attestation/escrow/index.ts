import type { ViemClient } from "../../../../utils";
import type { AttestationAddresses } from "../index";
import { type AttestationEscrowDefaultClient, makeAttestationEscrowDefaultClient } from "./default";
import { type AttestationReferenceEscrowClient, makeAttestationReferenceEscrowClient } from "./reference";
import {
  type AttestationReferenceEscrowUnconditionalClient,
  makeAttestationReferenceEscrowUnconditionalClient,
} from "./referenceUnconditional";
import {
  type AttestationEscrowUnconditionalClient,
  makeAttestationEscrowUnconditionalClient,
} from "./unconditional";

export { type AttestationEscrowDefaultClient, makeAttestationEscrowDefaultClient } from "./default";
export { type AttestationReferenceEscrowClient, makeAttestationReferenceEscrowClient } from "./reference";
export {
  type AttestationReferenceEscrowUnconditionalClient,
  makeAttestationReferenceEscrowUnconditionalClient,
} from "./referenceUnconditional";
export {
  type AttestationEscrowUnconditionalClient,
  makeAttestationEscrowUnconditionalClient,
} from "./unconditional";

/** Default-checking or unconditional attestation escrow variant. */
export type AttestationEscrowChecks = "default" | "unconditional";

/** Whether the escrow stores attestation data or references an existing attestation UID. */
export type AttestationEscrowStorage = "value" | "reference";

/** Attestation escrow client namespace. */
export type AttestationEscrowClient = {
  default: AttestationEscrowDefaultClient;
  unconditional: AttestationEscrowUnconditionalClient;
  reference: AttestationReferenceEscrowClient;
  referenceUnconditional: AttestationReferenceEscrowUnconditionalClient;
  byChecks: {
    (checks: "default"): AttestationEscrowDefaultClient;
    (checks: "unconditional"): AttestationEscrowUnconditionalClient;
    (checks?: AttestationEscrowChecks): AttestationEscrowDefaultClient | AttestationEscrowUnconditionalClient;
  };
  byStorageAndChecks: {
    (storage: "value", checks: "default"): AttestationEscrowDefaultClient;
    (storage: "value", checks: "unconditional"): AttestationEscrowUnconditionalClient;
    (storage: "reference", checks: "default"): AttestationReferenceEscrowClient;
    (storage: "reference", checks: "unconditional"): AttestationReferenceEscrowUnconditionalClient;
    (
      storage: AttestationEscrowStorage,
      checks?: AttestationEscrowChecks,
    ):
      | AttestationEscrowDefaultClient
      | AttestationEscrowUnconditionalClient
      | AttestationReferenceEscrowClient
      | AttestationReferenceEscrowUnconditionalClient;
  };
};

/** Create attestation-value and attestation-reference escrow clients. */
export const makeAttestationEscrowClient = (
  viemClient: ViemClient,
  addresses: AttestationAddresses,
): AttestationEscrowClient => {
  const defaultEscrow = makeAttestationEscrowDefaultClient(viemClient, addresses);
  const unconditional = makeAttestationEscrowUnconditionalClient(viemClient, addresses);
  const referenceEscrow = makeAttestationReferenceEscrowClient(viemClient, addresses);
  const referenceUnconditional = makeAttestationReferenceEscrowUnconditionalClient(viemClient, addresses);
  const byChecks = (checks: AttestationEscrowChecks = "default") =>
    checks === "default" ? defaultEscrow : unconditional;
  const byStorageAndChecks = (
    storage: AttestationEscrowStorage,
    checks: AttestationEscrowChecks = "default",
  ) => {
    if (storage === "value") return checks === "default" ? defaultEscrow : unconditional;
    return checks === "default" ? referenceEscrow : referenceUnconditional;
  };

  return {
    default: defaultEscrow,
    unconditional,
    reference: referenceEscrow,
    referenceUnconditional,
    byChecks,
    byStorageAndChecks: byStorageAndChecks as AttestationEscrowClient["byStorageAndChecks"],
  };
};
