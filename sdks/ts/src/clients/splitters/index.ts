import { decodeAbiParameters, encodeAbiParameters, encodePacked, getAbiItem, keccak256 } from "viem";
import { abi as erc20SplitterAbi } from "../../contracts/utils/splitters/default/ERC20Splitter";
import { abi as erc1155SplitterAbi } from "../../contracts/utils/splitters/default/ERC1155Splitter";
import { abi as nativeTokenSplitterAbi } from "../../contracts/utils/splitters/default/NativeTokenSplitter";
import { abi as tokenBundleSplitterAbi } from "../../contracts/utils/splitters/default/TokenBundleSplitter";
import { abi as tokenBundleSplitterUnvalidatedAbi } from "../../contracts/utils/splitters/default/TokenBundleSplitterUnvalidated";
import type { Attestation, ChainAddresses } from "../../types";
import { readContract, type ViemClient, writeContract } from "../../utils";

/**
 * Security note: the underlying splitter contracts were not included in the
 * professional manual audits and have only been reviewed by automated audit
 * tooling so far.
 */

/** Deployed splitter contract addresses. */
export type SplitterAddresses = {
  erc20Splitter: `0x${string}`;
  erc1155Splitter: `0x${string}`;
  nativeTokenSplitter: `0x${string}`;
  tokenBundleSplitter: `0x${string}`;
  tokenBundleSplitterUnvalidated: `0x${string}`;
};

/** Pick splitter addresses from a full chain address map. */
export const pickSplitterAddresses = (addresses: ChainAddresses): SplitterAddresses => ({
  erc20Splitter: addresses.erc20Splitter,
  erc1155Splitter: addresses.erc1155Splitter,
  nativeTokenSplitter: addresses.nativeTokenSplitter,
  tokenBundleSplitter: addresses.tokenBundleSplitter,
  tokenBundleSplitterUnvalidated: addresses.tokenBundleSplitterUnvalidated,
});

/** Common splitter arbiter demand data. */
export type SplitterDemandData = {
  /** Oracle address whose split decision is trusted. */
  oracle: `0x${string}`;
  /** Opaque context bytes for the oracle. */
  data: `0x${string}`;
};

/** Split item for native/ERC20/ERC1155 amount-based splitters. */
export type AmountSplit = {
  /** Recipient address, or the splitter executor sentinel. */
  recipient: `0x${string}`;
  /** Amount assigned to this recipient. */
  amount: bigint;
};

/** Split item for token-bundle splitters. */
export type BundleSplit = {
  /** Recipient address, or the splitter executor sentinel. */
  recipient: `0x${string}`;
  /** Native-token amount assigned to this recipient. */
  nativeAmount: bigint;
  /** ERC20 amounts by token index in the escrow bundle. */
  erc20Amounts: bigint[];
  /** ERC721 token indices assigned to this recipient. */
  erc721Indices: bigint[];
  /** ERC1155 amounts by token index in the escrow bundle. */
  erc1155Amounts: bigint[];
};

const demandDataType = getAbiItem({ abi: erc20SplitterAbi.abi, name: "decodeDemandData" }).outputs[0];
const amountSplitType = getAbiItem({ abi: erc20SplitterAbi.abi, name: "arbitrate" }).inputs[2];
const bundleSplitType = getAbiItem({ abi: tokenBundleSplitterAbi.abi, name: "arbitrate" }).inputs[2];

/** ABI-encode splitter demand data. */
export const encodeSplitterDemand = (data: SplitterDemandData): `0x${string}` =>
  encodeAbiParameters([demandDataType], [data]);

/** Decode ABI-encoded splitter demand data. */
export const decodeSplitterDemand = (data: `0x${string}`): SplitterDemandData =>
  decodeAbiParameters([demandDataType], data)[0] as SplitterDemandData;

/** ABI-encode amount split arrays. */
export const encodeAmountSplits = (splits: AmountSplit[]): `0x${string}` =>
  encodeAbiParameters([amountSplitType], [splits]);

/** Decode ABI-encoded amount split arrays. */
export const decodeAmountSplits = (data: `0x${string}`): AmountSplit[] =>
  decodeAbiParameters([amountSplitType], data)[0] as AmountSplit[];

/** ABI-encode token-bundle split arrays. */
export const encodeBundleSplits = (splits: BundleSplit[]): `0x${string}` =>
  encodeAbiParameters([bundleSplitType], [splits]);

/** Decode ABI-encoded token-bundle split arrays. */
export const decodeBundleSplits = (data: `0x${string}`): BundleSplit[] =>
  decodeAbiParameters([bundleSplitType], data)[0] as BundleSplit[];

/** Compute the splitter decision key for a fulfillment and escrow UID. */
export const splitterDecisionKey = (fulfillment: `0x${string}`, escrow: `0x${string}`): `0x${string}` =>
  keccak256(encodePacked(["bytes32", "bytes32"], [fulfillment, escrow]));

const makeAmountSplitterClient = (
  viemClient: ViemClient,
  address: `0x${string}`,
  abi: any,
) => ({
  address,
  encodeDemand: encodeSplitterDemand,
  decodeDemand: decodeSplitterDemand,
  decisionKey: splitterDecisionKey,
  arbitrate: async (fulfillment: `0x${string}`, escrow: `0x${string}`, splits: AmountSplit[]) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "arbitrate",
      args: [fulfillment, escrow, splits],
    }),
  requestArbitration: async (
    fulfillment: `0x${string}`,
    escrow: `0x${string}`,
    oracle: `0x${string}`,
    demand: `0x${string}`,
  ) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "requestArbitration",
      args: [fulfillment, escrow, oracle, demand],
    }),
  createFulfillment: async (
    obligationContract: `0x${string}`,
    data: `0x${string}`,
    expirationTime: bigint,
    refUID: `0x${string}`,
    value = 0n,
  ) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "createFulfillment",
      args: [obligationContract, data, expirationTime, refUID],
      value,
    } as unknown as Parameters<typeof writeContract>[1]),
  collectAndDistribute: async (escrowContract: `0x${string}`, escrow: `0x${string}`, fulfillment: `0x${string}`) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "collectAndDistribute",
      args: [escrowContract, escrow, fulfillment],
    }),
  unsafePartiallyCollectAndDistribute: async (
    escrowContract: `0x${string}`,
    escrow: `0x${string}`,
    fulfillment: `0x${string}`,
  ) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "unsafePartiallyCollectAndDistribute",
      args: [escrowContract, escrow, fulfillment],
    }),
  getSplits: async (oracle: `0x${string}`, fulfillment: `0x${string}`, escrow: `0x${string}`) =>
    await readContract<AmountSplit[]>(viemClient, {
      address,
      abi,
      functionName: "getSplits",
      args: [oracle, fulfillment, escrow],
    }),
  hasDecision: async (oracle: `0x${string}`, fulfillment: `0x${string}`, escrow: `0x${string}`) =>
    await readContract<boolean>(viemClient, {
      address,
      abi,
      functionName: "hasDecision",
      args: [oracle, splitterDecisionKey(fulfillment, escrow)],
    }),
  check: async (fulfillment: Attestation, demand: `0x${string}`, escrow: `0x${string}`) =>
    await readContract<boolean>(viemClient, {
      address,
      abi,
      functionName: "check",
      args: [fulfillment, demand, escrow],
    }),
});

const makeBundleSplitterClient = (
  viemClient: ViemClient,
  address: `0x${string}`,
  abi: any,
) => ({
  address,
  encodeDemand: encodeSplitterDemand,
  decodeDemand: decodeSplitterDemand,
  decisionKey: splitterDecisionKey,
  arbitrate: async (fulfillment: `0x${string}`, escrow: `0x${string}`, splits: BundleSplit[]) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "arbitrate",
      args: [fulfillment, escrow, splits],
    }),
  requestArbitration: async (
    fulfillment: `0x${string}`,
    escrow: `0x${string}`,
    oracle: `0x${string}`,
    demand: `0x${string}`,
  ) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "requestArbitration",
      args: [fulfillment, escrow, oracle, demand],
    }),
  createFulfillment: async (
    obligationContract: `0x${string}`,
    data: `0x${string}`,
    expirationTime: bigint,
    refUID: `0x${string}`,
    value = 0n,
  ) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "createFulfillment",
      args: [obligationContract, data, expirationTime, refUID],
      value,
    } as unknown as Parameters<typeof writeContract>[1]),
  collectAndDistribute: async (escrowContract: `0x${string}`, escrow: `0x${string}`, fulfillment: `0x${string}`) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "collectAndDistribute",
      args: [escrowContract, escrow, fulfillment],
    }),
  unsafePartiallyCollectAndDistribute: async (
    escrowContract: `0x${string}`,
    escrow: `0x${string}`,
    fulfillment: `0x${string}`,
  ) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "unsafePartiallyCollectAndDistribute",
      args: [escrowContract, escrow, fulfillment],
    }),
  getSplits: async (oracle: `0x${string}`, fulfillment: `0x${string}`, escrow: `0x${string}`) =>
    await readContract<BundleSplit[]>(viemClient, {
      address,
      abi,
      functionName: "getSplits",
      args: [oracle, fulfillment, escrow],
    }),
  hasDecision: async (oracle: `0x${string}`, fulfillment: `0x${string}`, escrow: `0x${string}`) =>
    await readContract<boolean>(viemClient, {
      address,
      abi,
      functionName: "hasDecision",
      args: [oracle, splitterDecisionKey(fulfillment, escrow)],
    }),
  check: async (fulfillment: Attestation, demand: `0x${string}`, escrow: `0x${string}`) =>
    await readContract<boolean>(viemClient, {
      address,
      abi,
      functionName: "check",
      args: [fulfillment, demand, escrow],
    }),
});

/** Create clients for all splitter contracts. */
export const makeSplittersClient = (viemClient: ViemClient, addresses: SplitterAddresses) => ({
  encodeDemand: encodeSplitterDemand,
  decodeDemand: decodeSplitterDemand,
  decisionKey: splitterDecisionKey,
  erc20: makeAmountSplitterClient(viemClient, addresses.erc20Splitter, erc20SplitterAbi.abi),
  erc1155: makeAmountSplitterClient(viemClient, addresses.erc1155Splitter, erc1155SplitterAbi.abi),
  nativeToken: makeAmountSplitterClient(viemClient, addresses.nativeTokenSplitter, nativeTokenSplitterAbi.abi),
  tokenBundle: makeBundleSplitterClient(viemClient, addresses.tokenBundleSplitter, tokenBundleSplitterAbi.abi),
  tokenBundleUnvalidated: makeBundleSplitterClient(
    viemClient,
    addresses.tokenBundleSplitterUnvalidated,
    tokenBundleSplitterUnvalidatedAbi.abi,
  ),
});

/** Ergonomic client for splitter contracts. */
export type SplittersClient = ReturnType<typeof makeSplittersClient>;
