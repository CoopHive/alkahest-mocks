import { decodeAbiParameters, encodeAbiParameters, getAbiItem } from "viem";
import { abi as tokenBundleEscrowAbi } from "../../../../contracts/obligations/escrow/unconditional/UnconditionalTokenBundleEscrowObligation";
import type { Demand, TokenBundle } from "../../../../types";
import {
  flattenTokenBundle,
  getAttestation,
  getAttestedEventFromTxHash,
  type ViemClient,
  writeContract,
} from "../../../../utils";
import type { TokenBundleAddresses } from "../index";
import { makeTokenBundleUtilClient } from "../util";

const tokenBundleEscrowDecodeFunction = getAbiItem({
  abi: tokenBundleEscrowAbi.abi,
  name: "decodeObligationData",
});

const tokenBundleEscrowObligationDataType = tokenBundleEscrowDecodeFunction.outputs[0];

/**
 * TokenBundle Unconditional Escrow ObligationData type
 */
export type TokenBundleUnconditionalEscrowObligationData = {
  nativeAmount: bigint;
  erc20Tokens: readonly `0x${string}`[];
  erc20Amounts: readonly bigint[];
  erc721Tokens: readonly `0x${string}`[];
  erc721TokenIds: readonly bigint[];
  erc1155Tokens: readonly `0x${string}`[];
  erc1155TokenIds: readonly bigint[];
  erc1155Amounts: readonly bigint[];
  arbiter: `0x${string}`;
  demand: `0x${string}`;
};

/**
 * Encodes TokenBundleUnconditionalEscrowObligation.ObligationData to bytes.
 * @param data - ObligationData struct
 * @returns abi encoded bytes
 */
export const encodeObligation = (data: TokenBundleUnconditionalEscrowObligationData): `0x${string}` => {
  return encodeAbiParameters([tokenBundleEscrowObligationDataType], [data]);
};

/**
 * Decodes TokenBundleUnconditionalEscrowObligation.ObligationData from bytes.
 * @param obligationData - ObligationData as abi encoded bytes
 * @returns the decoded ObligationData object
 */
export const decodeObligation = (obligationData: `0x${string}`): TokenBundleUnconditionalEscrowObligationData => {
  return decodeAbiParameters(
    [tokenBundleEscrowObligationDataType],
    obligationData,
  )[0] as TokenBundleUnconditionalEscrowObligationData;
};

export type TokenBundleUnconditionalEscrowClient = ReturnType<typeof makeTokenBundleUnconditionalEscrowClient>;

export const makeTokenBundleUnconditionalEscrowClient = (viemClient: ViemClient, addresses: TokenBundleAddresses) => {
  const util = makeTokenBundleUtilClient(viemClient, addresses);

  const getSchema = async () =>
    await viemClient.readContract({
      address: addresses.escrowObligationUnconditional,
      abi: tokenBundleEscrowAbi.abi,
      functionName: "ATTESTATION_SCHEMA",
      authorizationList: undefined,
    });

  return {
    address: addresses.escrowObligationUnconditional,
    getSchema,

    encodeObligationRaw: (data: {
      nativeAmount: bigint;
      erc20Tokens: `0x${string}`[];
      erc20Amounts: bigint[];
      erc721Tokens: `0x${string}`[];
      erc721TokenIds: bigint[];
      erc1155Tokens: `0x${string}`[];
      erc1155TokenIds: bigint[];
      erc1155Amounts: bigint[];
      arbiter: `0x${string}`;
      demand: `0x${string}`;
    }) => {
      return encodeAbiParameters([tokenBundleEscrowObligationDataType], [data]);
    },

    encodeObligation: (bundle: TokenBundle, demand: Demand) => {
      const flatBundle = flattenTokenBundle(bundle);
      return encodeAbiParameters(
        [tokenBundleEscrowObligationDataType],
        [
          {
            ...flatBundle,
            arbiter: demand.arbiter,
            demand: demand.demand,
          },
        ],
      );
    },

    decodeObligation: (obligationData: `0x${string}`) => {
      return decodeAbiParameters([tokenBundleEscrowObligationDataType], obligationData)[0];
    },

    getObligation: async (uid: `0x${string}`) => {
      const [attestation, schema] = await Promise.all([getAttestation(viemClient, uid, addresses), getSchema()]);

      if (attestation.schema !== schema) {
        throw new Error(`Unsupported schema: ${attestation.schema}`);
      }
      const data = decodeAbiParameters([tokenBundleEscrowObligationDataType], attestation.data)[0];

      return {
        ...attestation,
        data,
      };
    },

    create: async (price: TokenBundle, item: Demand, expiration: bigint) => {
      const flatBundle = flattenTokenBundle(price);
      const hash = await writeContract(viemClient, {
        address: addresses.escrowObligationUnconditional,
        abi: tokenBundleEscrowAbi.abi,
        functionName: "doObligation",
        args: [
          {
            ...flatBundle,
            ...item,
          },
          expiration,
        ],
        value: flatBundle.nativeAmount,
      });

      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },

    approveAndCreate: async (price: TokenBundle, item: Demand, expiration: bigint) => {
      await util.approve(price, "escrow");
      const flatBundle = flattenTokenBundle(price);
      const hash = await writeContract(viemClient, {
        address: addresses.escrowObligationUnconditional,
        abi: tokenBundleEscrowAbi.abi,
        functionName: "doObligation",
        args: [
          {
            ...flatBundle,
            ...item,
          },
          expiration,
        ],
        value: flatBundle.nativeAmount,
      });

      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },

    collect: async (buyAttestation: `0x${string}`, fulfillment: `0x${string}`) => {
      const hash = await writeContract(viemClient, {
        address: addresses.escrowObligationUnconditional,
        abi: tokenBundleEscrowAbi.abi,
        functionName: "collect",
        args: [buyAttestation, fulfillment],
      });
      return hash;
    },

    reclaim: async (buyAttestation: `0x${string}`) => {
      const hash = await writeContract(viemClient, {
        address: addresses.escrowObligationUnconditional,
        abi: tokenBundleEscrowAbi.abi,
        functionName: "reclaim",
        args: [buyAttestation],
      });
      return hash;
    },
  };
};
