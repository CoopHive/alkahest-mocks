import {
  type Address,
  type BlockNumber,
  type BlockTag,
  decodeAbiParameters,
  encodeAbiParameters,
  encodePacked,
  getAbiItem,
  keccak256,
  parseAbiItem,
} from "viem";
import { abi as commitmentERC20SplitterAbi } from "../../contracts/utils/splitters/commitment/CommitmentERC20Splitter";
import { abi as commitmentERC1155SplitterAbi } from "../../contracts/utils/splitters/commitment/CommitmentERC1155Splitter";
import { abi as commitmentNativeTokenSplitterAbi } from "../../contracts/utils/splitters/commitment/CommitmentNativeTokenSplitter";
import { abi as commitmentTokenBundleSplitterAbi } from "../../contracts/utils/splitters/commitment/CommitmentTokenBundleSplitter";
import { abi as commitmentTokenBundleSplitterUnvalidatedAbi } from "../../contracts/utils/splitters/commitment/CommitmentTokenBundleSplitterUnvalidated";
import { abi as erc20SplitterAbi } from "../../contracts/utils/splitters/default/ERC20Splitter";
import { abi as erc1155SplitterAbi } from "../../contracts/utils/splitters/default/ERC1155Splitter";
import { abi as nativeTokenSplitterAbi } from "../../contracts/utils/splitters/default/NativeTokenSplitter";
import { abi as tokenBundleSplitterAbi } from "../../contracts/utils/splitters/default/TokenBundleSplitter";
import { abi as tokenBundleSplitterUnvalidatedAbi } from "../../contracts/utils/splitters/default/TokenBundleSplitterUnvalidated";
import type { Attestation, ChainAddresses } from "../../types";
import { getOptimalPollingInterval, readContract, type ViemClient, writeContract } from "../../utils";

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
  commitmentERC20Splitter: `0x${string}`;
  commitmentERC1155Splitter: `0x${string}`;
  commitmentNativeTokenSplitter: `0x${string}`;
  commitmentTokenBundleSplitter: `0x${string}`;
  commitmentTokenBundleSplitterUnvalidated: `0x${string}`;
};

/** Pick splitter addresses from a full chain address map. */
export const pickSplitterAddresses = (addresses: ChainAddresses): SplitterAddresses => ({
  erc20Splitter: addresses.erc20Splitter,
  erc1155Splitter: addresses.erc1155Splitter,
  nativeTokenSplitter: addresses.nativeTokenSplitter,
  tokenBundleSplitter: addresses.tokenBundleSplitter,
  tokenBundleSplitterUnvalidated: addresses.tokenBundleSplitterUnvalidated,
  commitmentERC20Splitter: addresses.commitmentERC20Splitter,
  commitmentERC1155Splitter: addresses.commitmentERC1155Splitter,
  commitmentNativeTokenSplitter: addresses.commitmentNativeTokenSplitter,
  commitmentTokenBundleSplitter: addresses.commitmentTokenBundleSplitter,
  commitmentTokenBundleSplitterUnvalidated: addresses.commitmentTokenBundleSplitterUnvalidated,
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

export type SplitterArbitrationMode = "past" | "pastUnarbitrated" | "allUnarbitrated" | "all" | "future";

export type AmountSplitterArbitrationRequest = {
  fulfillmentOrIntent: `0x${string}`;
  escrow: `0x${string}`;
  demand: `0x${string}`;
};

export type AmountSplitterDecision = {
  hash: `0x${string}`;
  fulfillmentOrIntent: `0x${string}`;
  escrow: `0x${string}`;
  splits: AmountSplit[];
};

export type AmountSplitterArbitrateManyOptions = {
  mode?: SplitterArbitrationMode;
  fromBlock?: BlockNumber | BlockTag;
  toBlock?: BlockNumber | BlockTag;
  onAfterArbitrate?: (decision: AmountSplitterDecision) => Promise<void>;
  pollingInterval?: number;
};

export type AmountSplitterArbitrateManyResult = {
  decisions: AmountSplitterDecision[];
  unwatch: () => void;
};

export type BundleSplitterArbitrationRequest = {
  fulfillmentOrIntent: `0x${string}`;
  escrow: `0x${string}`;
  demand: `0x${string}`;
};

export type BundleSplitterDecision = {
  hash: `0x${string}`;
  fulfillmentOrIntent: `0x${string}`;
  escrow: `0x${string}`;
  splits: BundleSplit[];
};

export type BundleSplitterArbitrateManyOptions = {
  mode?: SplitterArbitrationMode;
  fromBlock?: BlockNumber | BlockTag;
  toBlock?: BlockNumber | BlockTag;
  onAfterArbitrate?: (decision: BundleSplitterDecision) => Promise<void>;
  pollingInterval?: number;
};

export type BundleSplitterArbitrateManyResult = {
  decisions: BundleSplitterDecision[];
  unwatch: () => void;
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

/** Splitter arbiter decision target. */
export type SplitterDecisionTarget = "fulfillment" | "commitment";

export type SplitterAttestationIntent = {
  schema: `0x${string}`;
  attester: Address;
  recipient: Address;
  expirationTime: bigint;
  revocable: boolean;
  refUID: `0x${string}`;
  data: `0x${string}`;
};

/** Hashes the attestation fields that commitment splitters approve before a UID exists. */
export const splitterAttestationIntentHash = (intent: SplitterAttestationIntent | Attestation): `0x${string}` =>
  keccak256(
    encodeAbiParameters(
      [
        { type: "bytes32" },
        { type: "address" },
        { type: "address" },
        { type: "uint64" },
        { type: "bool" },
        { type: "bytes32" },
        { type: "bytes32" },
      ],
      [
        intent.schema,
        intent.attester,
        intent.recipient,
        intent.expirationTime,
        intent.revocable,
        intent.refUID,
        keccak256(intent.data),
      ],
    ),
  );

/** Hashes a splitter fulfillment intent, binding the attestation fields to the recorded fulfiller. */
export const splitterFulfillmentIntentHash = (
  intent: SplitterAttestationIntent | Attestation,
  fulfiller: Address,
): `0x${string}` =>
  keccak256(encodeAbiParameters([{ type: "bytes32" }, { type: "address" }], [splitterAttestationIntentHash(intent), fulfiller]));

const splitterArbitrationRequestedEvent = parseAbiItem(
  "event ArbitrationRequested(bytes32 indexed fulfillment, bytes32 indexed escrow, address indexed oracle, bytes demand)",
);

const makeAmountSplitterClient = (
  viemClient: ViemClient,
  address: `0x${string}`,
  abi: any,
) => {
  const arbitrate = async (fulfillment: `0x${string}`, escrow: `0x${string}`, splits: AmountSplit[]) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "arbitrate",
      args: [fulfillment, escrow, splits],
    });

  const hasDecisionFor = async (oracle: `0x${string}`, fulfillmentOrIntent: `0x${string}`, escrow: `0x${string}`) =>
    await readContract<boolean>(viemClient, {
      address,
      abi,
      functionName: "hasDecision",
      args: [oracle, splitterDecisionKey(fulfillmentOrIntent, escrow)],
    });

  const getArbitrationRequests = async (
    options: AmountSplitterArbitrateManyOptions = {},
  ): Promise<AmountSplitterArbitrationRequest[]> => {
    const logs = await viemClient.getLogs({
      address,
      event: splitterArbitrationRequestedEvent,
      args: { oracle: viemClient.account.address },
      fromBlock: options.fromBlock ?? "earliest",
      toBlock: options.toBlock ?? "latest",
    });

    const requests = logs.map((log) => ({
      fulfillmentOrIntent: log.args.fulfillment as `0x${string}`,
      escrow: log.args.escrow as `0x${string}`,
      demand: log.args.demand as `0x${string}`,
    }));

    if (options.mode === "pastUnarbitrated" || options.mode === "allUnarbitrated") {
      const filtered = await Promise.all(
        requests.map(async (request) =>
          (await hasDecisionFor(viemClient.account.address, request.fulfillmentOrIntent, request.escrow))
            ? null
            : request,
        ),
      );
      return filtered.filter((request) => request !== null) as AmountSplitterArbitrationRequest[];
    }

    return requests;
  };

  const arbitrateMany = async (
    decide: (request: AmountSplitterArbitrationRequest) => Promise<AmountSplit[] | null>,
    options: AmountSplitterArbitrateManyOptions = {},
  ): Promise<AmountSplitterArbitrateManyResult> => {
    const mode = options.mode ?? "allUnarbitrated";
    const shouldProcessPast = mode !== "future";
    const shouldListen = mode === "all" || mode === "allUnarbitrated" || mode === "future";

    let decisions: AmountSplitterDecision[] = [];
    if (shouldProcessPast) {
      const requests = await getArbitrationRequests(options);
      const decisionResults: (AmountSplitterDecision | null)[] = [];

      for (const request of requests) {
        const splits = await decide(request);
        if (splits === null) {
          decisionResults.push(null);
          continue;
        }

        const hash = await arbitrate(request.fulfillmentOrIntent, request.escrow, splits);
        decisionResults.push({
          hash,
          fulfillmentOrIntent: request.fulfillmentOrIntent,
          escrow: request.escrow,
          splits,
        });
      }

      decisions = decisionResults.filter((decision) => decision !== null) as AmountSplitterDecision[];
      await Promise.all(decisions.map((decision) => viemClient.waitForTransactionReceipt({ hash: decision.hash })));
    }

    if (!shouldListen) {
      return { decisions, unwatch: () => {} };
    }

    const optimalInterval = getOptimalPollingInterval(viemClient, options.pollingInterval);
    const unwatch = viemClient.watchEvent({
      address,
      event: splitterArbitrationRequestedEvent,
      args: { oracle: viemClient.account.address },
      pollingInterval: optimalInterval,
      onLogs: async (logs) => {
        await Promise.all(
          logs.map(async (log) => {
            const request = {
              fulfillmentOrIntent: log.args.fulfillment as `0x${string}`,
              escrow: log.args.escrow as `0x${string}`,
              demand: log.args.demand as `0x${string}`,
            };
            const splits = await decide(request);
            if (splits === null) return;

            const hash = await arbitrate(request.fulfillmentOrIntent, request.escrow, splits);
            const decision = {
              hash,
              fulfillmentOrIntent: request.fulfillmentOrIntent,
              escrow: request.escrow,
              splits,
            };

            if (options.onAfterArbitrate) {
              await options.onAfterArbitrate(decision);
            }
          }),
        );
      },
    });

    return { decisions, unwatch };
  };

  return {
    address,
    encodeDemand: encodeSplitterDemand,
    decodeDemand: decodeSplitterDemand,
    decisionKey: splitterDecisionKey,
    arbitrate,
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
  collectAndDistribute: async (escrow: `0x${string}`, fulfillment: `0x${string}`) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "collectAndDistribute",
      args: [escrow, fulfillment],
    }),
  unsafePartiallyCollectAndDistribute: async (escrow: `0x${string}`, fulfillment: `0x${string}`) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "unsafePartiallyCollectAndDistribute",
      args: [escrow, fulfillment],
    }),
  getSplits: async (oracle: `0x${string}`, fulfillment: `0x${string}`, escrow: `0x${string}`) =>
    await readContract<AmountSplit[]>(viemClient, {
      address,
      abi,
      functionName: "getSplits",
      args: [oracle, fulfillment, escrow],
    }),
    hasDecision: hasDecisionFor,
    getArbitrationRequests,
    arbitrateMany,
  check: async (fulfillment: Attestation, demand: `0x${string}`, escrow: `0x${string}`) =>
    await readContract<boolean>(viemClient, {
      address,
      abi,
      functionName: "check",
      args: [fulfillment, demand, escrow],
    }),
  };
};

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
  collectAndDistribute: async (escrow: `0x${string}`, fulfillment: `0x${string}`) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "collectAndDistribute",
      args: [escrow, fulfillment],
    }),
  unsafePartiallyCollectAndDistribute: async (escrow: `0x${string}`, fulfillment: `0x${string}`) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "unsafePartiallyCollectAndDistribute",
      args: [escrow, fulfillment],
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
  getArbitrationRequests: async (
    options: BundleSplitterArbitrateManyOptions = {},
  ): Promise<BundleSplitterArbitrationRequest[]> => {
    const logs = await viemClient.getLogs({
      address,
      event: splitterArbitrationRequestedEvent,
      args: { oracle: viemClient.account.address },
      fromBlock: options.fromBlock ?? "earliest",
      toBlock: options.toBlock ?? "latest",
    });

    const requests = logs.map((log) => ({
      fulfillmentOrIntent: log.args.fulfillment as `0x${string}`,
      escrow: log.args.escrow as `0x${string}`,
      demand: log.args.demand as `0x${string}`,
    }));

    if (options.mode === "pastUnarbitrated" || options.mode === "allUnarbitrated") {
      const filtered = await Promise.all(
        requests.map(async (request) =>
          (await readContract<boolean>(viemClient, {
            address,
            abi,
            functionName: "hasDecision",
            args: [viemClient.account.address, splitterDecisionKey(request.fulfillmentOrIntent, request.escrow)],
          }))
            ? null
            : request,
        ),
      );
      return filtered.filter((request) => request !== null) as BundleSplitterArbitrationRequest[];
    }

    return requests;
  },
  arbitrateMany: async (
    decide: (request: BundleSplitterArbitrationRequest) => Promise<BundleSplit[] | null>,
    options: BundleSplitterArbitrateManyOptions = {},
  ): Promise<BundleSplitterArbitrateManyResult> => {
    const mode = options.mode ?? "allUnarbitrated";
    const shouldProcessPast = mode !== "future";
    const shouldListen = mode === "all" || mode === "allUnarbitrated" || mode === "future";

    let decisions: BundleSplitterDecision[] = [];
    if (shouldProcessPast) {
      const logs = await viemClient.getLogs({
        address,
        event: splitterArbitrationRequestedEvent,
        args: { oracle: viemClient.account.address },
        fromBlock: options.fromBlock ?? "earliest",
        toBlock: options.toBlock ?? "latest",
      });
      let requests = logs.map((log) => ({
        fulfillmentOrIntent: log.args.fulfillment as `0x${string}`,
        escrow: log.args.escrow as `0x${string}`,
        demand: log.args.demand as `0x${string}`,
      }));

      if (mode === "pastUnarbitrated" || mode === "allUnarbitrated") {
        const filtered = await Promise.all(
          requests.map(async (request) =>
            (await readContract<boolean>(viemClient, {
              address,
              abi,
              functionName: "hasDecision",
              args: [viemClient.account.address, splitterDecisionKey(request.fulfillmentOrIntent, request.escrow)],
            }))
              ? null
              : request,
          ),
        );
        requests = filtered.filter((request) => request !== null) as BundleSplitterArbitrationRequest[];
      }

      const decisionResults: (BundleSplitterDecision | null)[] = [];
      for (const request of requests) {
        const splits = await decide(request);
        if (splits === null) {
          decisionResults.push(null);
          continue;
        }

        const hash = await writeContract(viemClient, {
          address,
          abi,
          functionName: "arbitrate",
          args: [request.fulfillmentOrIntent, request.escrow, splits],
        });
        decisionResults.push({
          hash,
          fulfillmentOrIntent: request.fulfillmentOrIntent,
          escrow: request.escrow,
          splits,
        });
      }

      decisions = decisionResults.filter((decision) => decision !== null) as BundleSplitterDecision[];
      await Promise.all(decisions.map((decision) => viemClient.waitForTransactionReceipt({ hash: decision.hash })));
    }

    if (!shouldListen) {
      return { decisions, unwatch: () => {} };
    }

    const optimalInterval = getOptimalPollingInterval(viemClient, options.pollingInterval);
    const unwatch = viemClient.watchEvent({
      address,
      event: splitterArbitrationRequestedEvent,
      args: { oracle: viemClient.account.address },
      pollingInterval: optimalInterval,
      onLogs: async (logs) => {
        await Promise.all(
          logs.map(async (log) => {
            const request = {
              fulfillmentOrIntent: log.args.fulfillment as `0x${string}`,
              escrow: log.args.escrow as `0x${string}`,
              demand: log.args.demand as `0x${string}`,
            };
            const splits = await decide(request);
            if (splits === null) return;

            const hash = await writeContract(viemClient, {
              address,
              abi,
              functionName: "arbitrate",
              args: [request.fulfillmentOrIntent, request.escrow, splits],
            });
            const decision = {
              hash,
              fulfillmentOrIntent: request.fulfillmentOrIntent,
              escrow: request.escrow,
              splits,
            };

            if (options.onAfterArbitrate) {
              await options.onAfterArbitrate(decision);
            }
          }),
        );
      },
    });

    return { decisions, unwatch };
  },
  check: async (fulfillment: Attestation, demand: `0x${string}`, escrow: `0x${string}`) =>
    await readContract<boolean>(viemClient, {
      address,
      abi,
      functionName: "check",
      args: [fulfillment, demand, escrow],
    }),
});

const makeCommitmentAmountSplitterClient = (
  viemClient: ViemClient,
  address: `0x${string}`,
  abi: any,
) => ({
  ...makeAmountSplitterClient(viemClient, address, abi),
  attestationIntentHash: splitterAttestationIntentHash,
  fulfillmentIntentHash: splitterFulfillmentIntentHash,
  createFulfillmentAndCollectAndDistribute: async (
    escrow: `0x${string}`,
    obligationContract: `0x${string}`,
    data: `0x${string}`,
    expirationTime: bigint,
    refUID: `0x${string}`,
    value = 0n,
  ) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "createFulfillmentAndCollectAndDistribute",
      args: [escrow, obligationContract, data, expirationTime, refUID],
      value,
    } as unknown as Parameters<typeof writeContract>[1]),
});

const makeCommitmentBundleSplitterClient = (
  viemClient: ViemClient,
  address: `0x${string}`,
  abi: any,
) => ({
  ...makeBundleSplitterClient(viemClient, address, abi),
  attestationIntentHash: splitterAttestationIntentHash,
  fulfillmentIntentHash: splitterFulfillmentIntentHash,
  createFulfillmentAndCollectAndDistribute: async (
    escrow: `0x${string}`,
    obligationContract: `0x${string}`,
    data: `0x${string}`,
    expirationTime: bigint,
    refUID: `0x${string}`,
    value = 0n,
  ) =>
    await writeContract(viemClient, {
      address,
      abi,
      functionName: "createFulfillmentAndCollectAndDistribute",
      args: [escrow, obligationContract, data, expirationTime, refUID],
      value,
    } as unknown as Parameters<typeof writeContract>[1]),
});

const makeSplitterVariantNamespace = <FulfillmentClient, CommitmentClient>(
  fulfillment: FulfillmentClient,
  commitment: CommitmentClient,
) =>
  Object.assign(fulfillment as object, {
    fulfillment,
    commitment,
    forTarget: (target: SplitterDecisionTarget = "fulfillment") =>
      target === "fulfillment" ? fulfillment : commitment,
  }) as FulfillmentClient & {
    fulfillment: FulfillmentClient;
    commitment: CommitmentClient;
    forTarget: {
      (target: "fulfillment"): FulfillmentClient;
      (target: "commitment"): CommitmentClient;
      (target?: SplitterDecisionTarget): FulfillmentClient | CommitmentClient;
    };
  };

/** Create clients for all splitter contracts. */
export const makeSplittersClient = (viemClient: ViemClient, addresses: SplitterAddresses) => {
  const erc20 = makeAmountSplitterClient(viemClient, addresses.erc20Splitter, erc20SplitterAbi.abi);
  const commitmentERC20 = makeCommitmentAmountSplitterClient(
    viemClient,
    addresses.commitmentERC20Splitter,
    commitmentERC20SplitterAbi.abi,
  );
  const erc1155 = makeAmountSplitterClient(viemClient, addresses.erc1155Splitter, erc1155SplitterAbi.abi);
  const commitmentERC1155 = makeCommitmentAmountSplitterClient(
    viemClient,
    addresses.commitmentERC1155Splitter,
    commitmentERC1155SplitterAbi.abi,
  );
  const nativeToken = makeAmountSplitterClient(viemClient, addresses.nativeTokenSplitter, nativeTokenSplitterAbi.abi);
  const commitmentNativeToken = makeCommitmentAmountSplitterClient(
    viemClient,
    addresses.commitmentNativeTokenSplitter,
    commitmentNativeTokenSplitterAbi.abi,
  );
  const tokenBundle = makeBundleSplitterClient(viemClient, addresses.tokenBundleSplitter, tokenBundleSplitterAbi.abi);
  const commitmentTokenBundle = makeCommitmentBundleSplitterClient(
    viemClient,
    addresses.commitmentTokenBundleSplitter,
    commitmentTokenBundleSplitterAbi.abi,
  );
  const tokenBundleUnvalidated = makeBundleSplitterClient(
    viemClient,
    addresses.tokenBundleSplitterUnvalidated,
    tokenBundleSplitterUnvalidatedAbi.abi,
  );
  const commitmentTokenBundleUnvalidated = makeCommitmentBundleSplitterClient(
    viemClient,
    addresses.commitmentTokenBundleSplitterUnvalidated,
    commitmentTokenBundleSplitterUnvalidatedAbi.abi,
  );

  return {
    encodeDemand: encodeSplitterDemand,
    decodeDemand: decodeSplitterDemand,
    decisionKey: splitterDecisionKey,
    attestationIntentHash: splitterAttestationIntentHash,
    fulfillmentIntentHash: splitterFulfillmentIntentHash,
    erc20: makeSplitterVariantNamespace(erc20, commitmentERC20),
    erc1155: makeSplitterVariantNamespace(erc1155, commitmentERC1155),
    nativeToken: makeSplitterVariantNamespace(nativeToken, commitmentNativeToken),
    tokenBundle: makeSplitterVariantNamespace(tokenBundle, commitmentTokenBundle),
    tokenBundleUnvalidated: makeSplitterVariantNamespace(tokenBundleUnvalidated, commitmentTokenBundleUnvalidated),
  };
};

/** Ergonomic client for splitter contracts. */
export type SplittersClient = ReturnType<typeof makeSplittersClient>;
