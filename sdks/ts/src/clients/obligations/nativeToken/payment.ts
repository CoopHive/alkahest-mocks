import { type Address, decodeAbiParameters, encodeAbiParameters, getAbiItem } from "viem";
import { abi as nativeTokenPaymentAbi } from "../../../contracts/obligations/payment/NativeTokenPaymentObligation";
import { abi as atomicPaymentUtilsAbi } from "../../../contracts/utils/AtomicPaymentUtils";
import type { Demand } from "../../../types";
import { assertDeployedContract, getAttestation, getAttestedEventFromTxHash, type ViemClient } from "../../../utils";
import { getAtomicPaymentEscrowAttestation, type AtomicPaymentOptions } from "../../../utils/contractSafety";
import type { NativeTokenAddresses } from "./index";

const nativePaymentDoObligationFunction = getAbiItem({
  abi: nativeTokenPaymentAbi.abi,
  name: "doObligation",
});

const nativePaymentObligationDataType = nativePaymentDoObligationFunction.inputs[0];

/**
 * NativeToken Payment ObligationData type
 */
export type NativeTokenPaymentObligationData = {
  amount: bigint;
  payee: Address;
};

/**
 * Encodes NativeTokenPaymentObligation.ObligationData to bytes.
 * @param data - struct ObligationData {uint256 amount, address payee}
 * @returns abi encoded bytes
 */
export const encodeObligation = (data: NativeTokenPaymentObligationData): `0x${string}` => {
  return encodeAbiParameters(
    [
      { name: "amount", type: "uint256" },
      { name: "payee", type: "address" },
    ],
    [data.amount, data.payee],
  );
};

/**
 * Decodes NativeTokenPaymentObligation.ObligationData from bytes.
 * @param obligationData - ObligationData as abi encoded bytes
 * @returns the decoded ObligationData object
 */
export const decodeObligation = (obligationData: `0x${string}`): NativeTokenPaymentObligationData => {
  const decoded = decodeAbiParameters(
    [
      { name: "amount", type: "uint256" },
      { name: "payee", type: "address" },
    ],
    obligationData,
  );
  return {
    amount: decoded[0],
    payee: decoded[1],
  };
};

export type NativeTokenPaymentClient = ReturnType<typeof makeNativeTokenPaymentClient>;

export const makeNativeTokenPaymentClient = (viemClient: ViemClient, addresses: NativeTokenAddresses) => {
  const getSchema = async () =>
    await viemClient.readContract({
      address: addresses.paymentObligation,
      abi: nativeTokenPaymentAbi.abi,
      functionName: "ATTESTATION_SCHEMA",
      authorizationList: undefined,
    });

  const getPaymentDemand = async (escrowUid: `0x${string}`, options?: AtomicPaymentOptions) => {
    const escrow = await getAtomicPaymentEscrowAttestation(viemClient, addresses, escrowUid, options);

    const [, demand] = await viemClient.readContract({
      address: escrow.attester,
      abi: [
        {
          type: "function",
          name: "decodeCondition",
          inputs: [{ name: "data", type: "bytes" }],
          outputs: [
            { name: "arbiter", type: "address" },
            { name: "demand", type: "bytes" },
          ],
          stateMutability: "pure",
        },
      ],
      functionName: "decodeCondition",
      args: [escrow.data],
      authorizationList: undefined,
    });

    return decodeAbiParameters([nativePaymentObligationDataType], demand)[0];
  };

  return {
    address: addresses.paymentObligation,
    atomicPaymentUtilsAddress: addresses.atomicPaymentUtils,
    getSchema,

    encodeObligationRaw: (data: { amount: bigint; payee: `0x${string}` }) => {
      return encodeAbiParameters(
        [
          { name: "amount", type: "uint256" },
          { name: "payee", type: "address" },
        ],
        [data.amount, data.payee],
      );
    },

    encodeObligation: (amount: bigint, payee: `0x${string}`) => {
      return encodeAbiParameters(
        [
          { name: "amount", type: "uint256" },
          { name: "payee", type: "address" },
        ],
        [amount, payee],
      );
    },

    decodeObligation: (obligationData: `0x${string}`): NativeTokenPaymentObligationData => {
      const decoded = decodeAbiParameters(
        [
          { name: "amount", type: "uint256" },
          { name: "payee", type: "address" },
        ],
        obligationData,
      );
      return {
        amount: decoded[0],
        payee: decoded[1],
      };
    },

    getObligation: async (uid: `0x${string}`) => {
      const [attestation, schema] = await Promise.all([getAttestation(viemClient, uid, addresses), getSchema()]);

      if (attestation.schema !== schema) {
        throw new Error(`Unsupported schema: ${attestation.schema}`);
      }
      const decoded = decodeAbiParameters(
        [
          { name: "amount", type: "uint256" },
          { name: "payee", type: "address" },
        ],
        attestation.data,
      );
      const data: NativeTokenPaymentObligationData = {
        amount: decoded[0],
        payee: decoded[1],
      };

      return {
        ...attestation,
        data,
      };
    },

    createDemand: (amount: bigint, payee: `0x${string}`): Demand => {
      return {
        arbiter: addresses.paymentObligation,
        demand: encodeAbiParameters(
          [
            { name: "amount", type: "uint256" },
            { name: "payee", type: "address" },
          ],
          [amount, payee],
        ),
      };
    },

    pay: async (
      data: NativeTokenPaymentObligationData,
      refUID: `0x${string}` = "0x0000000000000000000000000000000000000000000000000000000000000000",
    ) => {
      assertDeployedContract(addresses.paymentObligation, "NativeTokenPaymentObligation");
      const { request } = await viemClient.simulateContract({
        address: addresses.paymentObligation,
        abi: nativeTokenPaymentAbi.abi,
        functionName: "doObligation",
        args: [{ amount: data.amount, payee: data.payee }, refUID],
        value: data.amount,
      });

      const hash = await viemClient.writeContract(request);
      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },

    payFor: async (
      data: NativeTokenPaymentObligationData,
      recipient: `0x${string}`,
      refUID: `0x${string}` = "0x0000000000000000000000000000000000000000000000000000000000000000",
    ) => {
      assertDeployedContract(addresses.paymentObligation, "NativeTokenPaymentObligation");
      const { request } = await viemClient.simulateContract({
        address: addresses.paymentObligation,
        abi: nativeTokenPaymentAbi.abi,
        functionName: "doObligationFor",
        args: [{ amount: data.amount, payee: data.payee }, recipient, refUID],
        value: data.amount,
      });

      const hash = await viemClient.writeContract(request);
      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },

    /**
     * Security note: uses AtomicPaymentUtils, which was not included in the
     * professional manual audits and has only been reviewed by automated audit
     * tooling so far.
     */
    payNativeAndCollect: async (escrowUid: `0x${string}`, options?: AtomicPaymentOptions) => {
      const demand = await getPaymentDemand(escrowUid, options);
      assertDeployedContract(addresses.atomicPaymentUtils, "AtomicPaymentUtils");
      const hash = await viemClient.writeContract({
        address: addresses.atomicPaymentUtils,
        abi: atomicPaymentUtilsAbi.abi,
        functionName: "payNativeAndCollect",
        args: [escrowUid],
        value: demand.amount,
        chain: viemClient.chain,
      });

      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },
  };
};
