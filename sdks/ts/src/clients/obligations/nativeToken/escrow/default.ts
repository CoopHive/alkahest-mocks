import { type Address, decodeAbiParameters, encodeAbiParameters, getAbiItem } from "viem";
import { abi as nativeTokenEscrowAbi } from "../../../../contracts/obligations/escrow/default/NativeTokenEscrowObligation";
import type { Demand } from "../../../../types";
import {
  assertDeployedContract,
  getAttestation,
  getAttestedEventFromTxHash,
  type ViemClient,
  writeContract,
} from "../../../../utils";
import type { NativeTokenAddresses } from "../index";

const nativeEscrowDoObligationFunction = getAbiItem({
  abi: nativeTokenEscrowAbi.abi,
  name: "doObligation",
});

const nativeEscrowObligationDataType = nativeEscrowDoObligationFunction.inputs[0];

/**
 * NativeToken Default Escrow ObligationData type
 */
export type NativeTokenDefaultEscrowObligationData = {
  arbiter: Address;
  demand: `0x${string}`;
  amount: bigint;
};

/**
 * Encodes NativeTokenDefaultEscrowObligation.ObligationData to bytes.
 * @param data - struct ObligationData {address arbiter, bytes demand, uint256 amount}
 * @returns abi encoded bytes
 */
export const encodeObligation = (data: NativeTokenDefaultEscrowObligationData): `0x${string}` => {
  return encodeAbiParameters([nativeEscrowObligationDataType], [data]);
};

/**
 * Decodes NativeTokenDefaultEscrowObligation.ObligationData from bytes.
 * @param obligationData - ObligationData as abi encoded bytes
 * @returns the decoded ObligationData object
 */
export const decodeObligation = (obligationData: `0x${string}`): NativeTokenDefaultEscrowObligationData => {
  return decodeAbiParameters(
    [nativeEscrowObligationDataType],
    obligationData,
  )[0] as NativeTokenDefaultEscrowObligationData;
};

export type NativeTokenDefaultEscrowClient = ReturnType<typeof makeNativeTokenDefaultEscrowClient>;

export const makeNativeTokenDefaultEscrowClient = (viemClient: ViemClient, addresses: NativeTokenAddresses) => {
  const getSchema = async () =>
    await viemClient.readContract({
      address: addresses.escrowObligation,
      abi: nativeTokenEscrowAbi.abi,
      functionName: "ATTESTATION_SCHEMA",
      authorizationList: undefined,
    });

  return {
    address: addresses.escrowObligation,
    getSchema,

    encodeObligationRaw: (data: { arbiter: `0x${string}`; demand: `0x${string}`; amount: bigint }) => {
      return encodeAbiParameters([nativeEscrowObligationDataType], [data]);
    },

    encodeObligation: (amount: bigint, demand: Demand) => {
      return encodeAbiParameters(
        [nativeEscrowObligationDataType],
        [
          {
            arbiter: demand.arbiter,
            demand: demand.demand,
            amount,
          },
        ],
      );
    },

    decodeObligation: (obligationData: `0x${string}`): NativeTokenDefaultEscrowObligationData => {
      return decodeAbiParameters(
        [nativeEscrowObligationDataType],
        obligationData,
      )[0] as NativeTokenDefaultEscrowObligationData;
    },

    getObligation: async (uid: `0x${string}`) => {
      const [attestation, schema] = await Promise.all([getAttestation(viemClient, uid, addresses), getSchema()]);

      if (attestation.schema !== schema) {
        throw new Error(`Unsupported schema: ${attestation.schema}`);
      }
      const data = decodeAbiParameters(
        [nativeEscrowObligationDataType],
        attestation.data,
      )[0] as NativeTokenDefaultEscrowObligationData;

      return {
        ...attestation,
        data,
      };
    },

    create: async (amount: bigint, item: Demand, expiration: bigint = 0n) => {
      assertDeployedContract(addresses.escrowObligation, "NativeTokenEscrowObligation");
      const { request } = await viemClient.simulateContract({
        address: addresses.escrowObligation,
        abi: nativeTokenEscrowAbi.abi,
        functionName: "doObligation",
        args: [{ arbiter: item.arbiter, demand: item.demand, amount }, expiration],
        value: amount,
      });

      const hash = await viemClient.writeContract(request);
      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },

    createFor: async (amount: bigint, item: Demand, recipient: `0x${string}`, expiration: bigint = 0n) => {
      assertDeployedContract(addresses.escrowObligation, "NativeTokenEscrowObligation");
      const { request } = await viemClient.simulateContract({
        address: addresses.escrowObligation,
        abi: nativeTokenEscrowAbi.abi,
        functionName: "doObligationFor",
        args: [{ arbiter: item.arbiter, demand: item.demand, amount }, expiration, recipient],
        value: amount,
      });

      const hash = await viemClient.writeContract(request);
      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },

    collect: async (buyAttestation: `0x${string}`, fulfillment: `0x${string}`) => {
      const hash = await writeContract(viemClient, {
        address: addresses.escrowObligation,
        abi: nativeTokenEscrowAbi.abi,
        functionName: "collect",
        args: [buyAttestation, fulfillment],
      });
      return hash;
    },

    reclaim: async (buyAttestation: `0x${string}`) => {
      const hash = await writeContract(viemClient, {
        address: addresses.escrowObligation,
        abi: nativeTokenEscrowAbi.abi,
        functionName: "reclaim",
        args: [buyAttestation],
      });
      return hash;
    },
  };
};
