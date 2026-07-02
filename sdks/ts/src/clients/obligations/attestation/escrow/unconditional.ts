import { decodeAbiParameters, encodeAbiParameters, getAbiItem } from "viem";
import { abi as attestationEscrowAbi } from "../../../../contracts/obligations/escrow/unconditional/UnconditionalAttestationEscrowObligation";
import type { Demand } from "../../../../types";
import { getAttestation, getAttestedEventFromTxHash, type ViemClient, writeContract } from "../../../../utils";
import type { AttestationAddresses } from "../index";
import type { AttestationEscrowObligationData } from "./default";

const escrowObligationDecodeFunction = getAbiItem({
  abi: attestationEscrowAbi.abi,
  name: "decodeObligationData",
});

const escrowObligationDataType = escrowObligationDecodeFunction.outputs[0];

export type AttestationEscrowUnconditionalClient = ReturnType<typeof makeAttestationEscrowUnconditionalClient>;

export const makeAttestationEscrowUnconditionalClient = (
  viemClient: ViemClient,
  addresses: AttestationAddresses,
) => {
  const getSchema = async () =>
    await viemClient.readContract({
      address: addresses.escrowObligationUnconditional,
      abi: attestationEscrowAbi.abi,
      functionName: "ATTESTATION_SCHEMA",
      authorizationList: undefined,
    });

  return {
    address: addresses.escrowObligationUnconditional,
    getSchema,

    encodeObligation: (data: AttestationEscrowObligationData) => {
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
      attestation: AttestationEscrowObligationData["attestation"],
      item: Demand,
      expiration: bigint = 0n,
    ) => {
      const hash = await writeContract(viemClient, {
        address: addresses.escrowObligationUnconditional,
        abi: attestationEscrowAbi.abi,
        functionName: "doObligation",
        args: [
          {
            attestation,
            arbiter: item.arbiter,
            demand: item.demand,
          },
          expiration,
        ],
      });

      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },

    collect: async (escrowAttestation: `0x${string}`, fulfillmentAttestation: `0x${string}`) => {
      const hash = await writeContract(viemClient, {
        address: addresses.escrowObligationUnconditional,
        abi: attestationEscrowAbi.abi,
        functionName: "collect",
        args: [escrowAttestation, fulfillmentAttestation],
      });

      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },

    reclaim: async (escrowAttestation: `0x${string}`) => {
      const hash = await writeContract(viemClient, {
        address: addresses.escrowObligationUnconditional,
        abi: attestationEscrowAbi.abi,
        functionName: "reclaim",
        args: [escrowAttestation],
      });
      return hash;
    },
  };
};
