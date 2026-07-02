import { decodeAbiParameters, encodeAbiParameters, getAbiItem } from "viem";
import { abi as attestationReferenceEscrowAbi } from "../../../../contracts/obligations/escrow/unconditional/UnconditionalAttestationReferenceEscrowObligation";
import type { Demand } from "../../../../types";
import { getAttestation, getAttestedEventFromTxHash, type ViemClient, writeContract } from "../../../../utils";
import type { AttestationAddresses } from "../index";
import type { AttestationReferenceEscrowObligationData } from "./reference";

const escrowObligationDecodeFunction = getAbiItem({
  abi: attestationReferenceEscrowAbi.abi,
  name: "decodeObligationData",
});

const escrowObligationDataType = escrowObligationDecodeFunction.outputs[0];

export type AttestationReferenceEscrowUnconditionalClient = ReturnType<
  typeof makeAttestationReferenceEscrowUnconditionalClient
>;

export const makeAttestationReferenceEscrowUnconditionalClient = (
  viemClient: ViemClient,
  addresses: AttestationAddresses,
) => {
  const getSchema = async () =>
    await viemClient.readContract({
      address: addresses.attestationReferenceEscrowObligationUnconditional,
      abi: attestationReferenceEscrowAbi.abi,
      functionName: "ATTESTATION_SCHEMA",
      authorizationList: undefined,
    });

  return {
    address: addresses.attestationReferenceEscrowObligationUnconditional,
    getSchema,

    encodeObligation: (data: AttestationReferenceEscrowObligationData) => {
      return encodeAbiParameters([escrowObligationDataType], [data]);
    },

    decodeObligation: (obligationData: `0x${string}`) => {
      return decodeAbiParameters([escrowObligationDataType], obligationData)[0];
    },

    getObligation: async (uid: `0x${string}`) => {
      const [attestation, schema] = await Promise.all([getAttestation(viemClient, uid, addresses), getSchema()]);

      if (attestation.schema !== schema) {
        throw new Error(`Unsupported schema: ${attestation.schema}`);
      }
      const data = decodeAbiParameters([escrowObligationDataType], attestation.data)[0];

      return {
        ...attestation,
        data,
      };
    },

    create: async (
      referencedAttestationUid: `0x${string}`,
      item: Demand,
      expiration: bigint = 0n,
      referenceExpirationTime: bigint = 0n,
    ) => {
      const hash = await writeContract(viemClient, {
        address: addresses.attestationReferenceEscrowObligationUnconditional,
        abi: attestationReferenceEscrowAbi.abi,
        functionName: "doObligation",
        args: [
          {
            referencedAttestationUid,
            arbiter: item.arbiter,
            demand: item.demand,
            expirationTime: referenceExpirationTime,
          },
          expiration,
        ],
      });

      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },

    collect: async (escrowAttestation: `0x${string}`, fulfillmentAttestation: `0x${string}`) => {
      const hash = await writeContract(viemClient, {
        address: addresses.attestationReferenceEscrowObligationUnconditional,
        abi: attestationReferenceEscrowAbi.abi,
        functionName: "collect",
        args: [escrowAttestation, fulfillmentAttestation],
      });

      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },

    reclaim: async (escrowAttestation: `0x${string}`) => {
      const hash = await writeContract(viemClient, {
        address: addresses.attestationReferenceEscrowObligationUnconditional,
        abi: attestationReferenceEscrowAbi.abi,
        functionName: "reclaim",
        args: [escrowAttestation],
      });
      return hash;
    },
  };
};
