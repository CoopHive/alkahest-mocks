import { decodeAbiParameters, encodeAbiParameters, getAbiItem } from "viem";
import { abi as attestationEscrow2Abi } from "../../../../contracts/obligations/escrow/default/AttestationReferenceEscrowObligation";
import type { Demand } from "../../../../types";
import { getAttestation, getAttestedEventFromTxHash, type ViemClient, writeContract } from "../../../../utils";
import type { AttestationAddresses } from "../index";

const escrow2ObligationDecodeFunction = getAbiItem({
  abi: attestationEscrow2Abi.abi,
  name: "decodeObligationData",
});

const escrow2ObligationDataType = escrow2ObligationDecodeFunction.outputs[0];

/**
 * AttestationReferenceEscrowObligation ObligationData type
 */
export type AttestationReferenceEscrowObligationData = {
  referencedAttestationUid: `0x${string}`;
  arbiter: `0x${string}`;
  demand: `0x${string}`;
  expirationTime: bigint;
};

/**
 * Encodes AttestationReferenceEscrowObligation.ObligationData to bytes.
 * @param data - ObligationData struct
 * @returns abi encoded bytes
 */
export const encodeObligation = (data: AttestationReferenceEscrowObligationData): `0x${string}` => {
  return encodeAbiParameters([escrow2ObligationDataType], [data]);
};

/**
 * Decodes AttestationReferenceEscrowObligation.ObligationData from bytes.
 * @param obligationData - ObligationData as abi encoded bytes
 * @returns the decoded ObligationData object
 */
export const decodeObligation = (obligationData: `0x${string}`): AttestationReferenceEscrowObligationData => {
  return decodeAbiParameters([escrow2ObligationDataType], obligationData)[0] as AttestationReferenceEscrowObligationData;
};

export type AttestationReferenceEscrowClient = ReturnType<typeof makeAttestationReferenceEscrowClient>;

export const makeAttestationReferenceEscrowClient = (viemClient: ViemClient, addresses: AttestationAddresses) => {
  const getSchema = async () =>
    await viemClient.readContract({
      address: addresses.attestationReferenceEscrowObligation,
      abi: attestationEscrow2Abi.abi,
      functionName: "ATTESTATION_SCHEMA",
      authorizationList: undefined,
    });

  return {
    address: addresses.attestationReferenceEscrowObligation,
    getSchema,

    /**
     * Encodes AttestationReferenceEscrowObligation.ObligationData to bytes.
     * @param data - ObligationData object to encode
     * @returns the abi encoded ObligationData as bytes
     */
    encodeObligation: (data: AttestationReferenceEscrowObligationData) => {
      return encodeAbiParameters([escrow2ObligationDataType], [data]);
    },

    /**
     * Decodes AttestationReferenceEscrowObligation.ObligationData from bytes.
     * @param obligationData - ObligationData as abi encoded bytes
     * @returns the decoded ObligationData object
     */
    decodeObligation: (obligationData: `0x${string}`) => {
      return decodeAbiParameters([escrow2ObligationDataType], obligationData)[0];
    },

    /**
     * Gets a complete obligation from its attestation UID, combining attestation metadata with decoded obligation data
     * @param uid - UID of the attestation
     * @returns The complete obligation including attestation metadata and decoded obligation data
     */
    getObligation: async (uid: `0x${string}`) => {
      const [attestation, schema] = await Promise.all([getAttestation(viemClient, uid, addresses), getSchema()]);

      if (attestation.schema !== schema) {
        throw new Error(`Unsupported schema: ${attestation.schema}`);
      }
      const data = decodeAbiParameters([escrow2ObligationDataType], attestation.data)[0];

      return {
        ...attestation,
        data,
      };
    },

    /**
     * Creates an escrow using an attestation UID as reference.
     * This function uses AttestationReferenceEscrowObligation which references the attestation by UID
     * instead of storing the full attestation data, making it more gas efficient. When collecting
     * payment, this contract creates an attestation that references the original attestation,
     * allowing it to work with any schema implementation without requiring attestation rights.
     *
     * @param referencedAttestationUid - The UID of the attestation to be referenced
     * @param item - The arbiter and demand data for the escrow
     * @param expiration - Optional expiration time for the escrow (default: 0 = no expiration)
     * @returns The transaction hash and attested escrow data
     */
    create: async (
      referencedAttestationUid: `0x${string}`,
      item: Demand,
      expiration: bigint = 0n,
      referenceExpirationTime: bigint = 0n,
    ) => {
      const hash = await writeContract(viemClient, {
        address: addresses.attestationReferenceEscrowObligation,
        abi: attestationEscrow2Abi.abi,
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

    /**
     * Collects payment from an attestation escrow by providing a fulfillment attestation.
     * This function is used with AttestationReferenceEscrowObligation and creates an
     * attestation referencing the original attestation.
     *
     * @param escrowAttestation - The UID of the escrow attestation
     * @param fulfillmentAttestation - The UID of the fulfillment attestation
     * @returns The transaction hash and reference attestation data
     */
    collect: async (escrowAttestation: `0x${string}`, fulfillmentAttestation: `0x${string}`) => {
      const hash = await writeContract(viemClient, {
        address: addresses.attestationReferenceEscrowObligation,
        abi: attestationEscrow2Abi.abi,
        functionName: "collect",
        args: [escrowAttestation, fulfillmentAttestation],
      });

      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },

    /**
     * Reclaims an expired escrow obligation.
     *
     * @param escrowAttestation - The UID of the escrow attestation
     * @returns The transaction hash
     */
    reclaim: async (escrowAttestation: `0x${string}`) => {
      const hash = await writeContract(viemClient, {
        address: addresses.attestationReferenceEscrowObligation,
        abi: attestationEscrow2Abi.abi,
        functionName: "reclaim",
        args: [escrowAttestation],
      });
      return hash;
    },
  };
};
