import { abi as atomicAttestationUtilsAbi } from "../../../contracts/utils/AtomicAttestationUtils";
import { assertDeployedContract, getAttestedEventsFromTxHash, type ViemClient } from "../../../utils";
import type { AttestationAddresses } from "./index";
import { isAddressEqual, parseEventLogs } from "viem";

/**
 * Security note: the underlying AtomicAttestationUtils contract was not
 * included in professional manual audits and has only been reviewed by
 * automated audit tooling so far.
 */

/** Atomic attestation helper client. */
export type AttestationUtilClient = ReturnType<typeof makeAttestationUtilClient>;

/** EAS attestation request shape used by atomic attestation helpers. */
export type AttestationRequest = {
  schema: `0x${string}`;
  data: {
    recipient: `0x${string}`;
    expirationTime: bigint;
    revocable: boolean;
    refUID: `0x${string}`;
    data: `0x${string}`;
    value: bigint;
  };
};

/** Escrow data used when atomically creating an attestation-reference escrow. */
export type ReferenceEscrowData = {
  arbiter: `0x${string}`;
  demand: `0x${string}`;
  expirationTime: bigint;
};

/** Create atomic attestation helper methods. */
export const makeAttestationUtilClient = (viemClient: ViemClient, addresses: AttestationAddresses) => {
  return {
    address: addresses.atomicUtils,

    attestAndCreateReferenceEscrow: async (
      request: AttestationRequest,
      escrowData: ReferenceEscrowData,
      escrowExpirationTime: bigint,
    ) => {
      assertDeployedContract(addresses.atomicUtils, "AtomicAttestationUtils");
      assertDeployedContract(addresses.attestationReferenceEscrowObligation, "AttestationReferenceEscrowObligation");
      const hash = await viemClient.writeContract({
        address: addresses.atomicUtils,
        abi: atomicAttestationUtilsAbi.abi,
        functionName: "attestAndCreateReferenceEscrow",
        args: [addresses.attestationReferenceEscrowObligation, request, escrowData, escrowExpirationTime],
        value: request.data.value,
        chain: viemClient.chain,
      });

      const events = await getAttestedEventsFromTxHash(viemClient, hash);
      const receipt = await viemClient.waitForTransactionReceipt({ hash });
      const referenceEscrowEvents = parseEventLogs({
        abi: atomicAttestationUtilsAbi.abi,
        eventName: "ReferenceEscrowCreated",
        logs: receipt.logs,
      }).filter((event) => isAddressEqual(event.address, addresses.atomicUtils));
      const created = referenceEscrowEvents.at(-1);

      if (!created) {
        throw new Error(`No ReferenceEscrowCreated event found in transaction ${hash}`);
      }

      const attestation = events.find((event) => event.args.uid === created.args.attestationUid)?.args;
      const escrow = events.find((event) => event.args.uid === created.args.escrowUid)?.args;

      return {
        hash,
        attestation: attestation ?? { uid: created.args.attestationUid },
        escrow: escrow ?? { uid: created.args.escrowUid },
      };
    },
  };
};
