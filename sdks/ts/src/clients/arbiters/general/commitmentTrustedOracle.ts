import {
  type Address,
  type BlockNumber,
  type BlockTag,
  decodeAbiParameters,
  encodeAbiParameters,
  getAbiItem,
  isAddressEqual,
  keccak256,
  parseAbiItem,
} from "viem";
import { abi as commitmentTrustedOracleArbiterAbi } from "../../../contracts/arbiters/trusted-oracle/CommitmentTrustedOracleArbiter";
import type { Attestation, ChainAddresses } from "../../../types";
import { getOptimalPollingInterval, type ViemClient } from "../../../utils";

const decodeDemandFunction = getAbiItem({
  abi: commitmentTrustedOracleArbiterAbi.abi,
  name: "decodeDemandData",
});

const demandDataType = decodeDemandFunction.outputs[0];

export type CommitmentTrustedOracleArbiterDemandData = {
  oracle: `0x${string}`;
  data: `0x${string}`;
};

export type AttestationIntent = {
  schema: `0x${string}`;
  attester: Address;
  recipient: Address;
  expirationTime: bigint;
  revocable: boolean;
  refUID: `0x${string}`;
  data: `0x${string}`;
};

export type CommitmentArbitrationMode = "past" | "pastUnarbitrated" | "allUnarbitrated" | "all" | "future";

export type CommitmentArbitrateManyOptions = {
  mode?: CommitmentArbitrationMode;
  fromBlock?: BlockNumber | BlockTag;
  toBlock?: BlockNumber | BlockTag;
  onAfterArbitrate?: (decision: CommitmentDecision) => Promise<void>;
  pollingInterval?: number;
};

export type CommitmentArbitrationRequest = {
  intentHash: `0x${string}`;
  demand: `0x${string}`;
};

export type CommitmentDecision = {
  hash: `0x${string}`;
  intentHash: `0x${string}`;
  decision: boolean;
};

export type CommitmentArbitrateManyResult = {
  decisions: CommitmentDecision[];
  unwatch: () => void;
};

/** Encodes CommitmentTrustedOracleArbiter.DemandData to bytes. */
export const encodeDemand = (demand: CommitmentTrustedOracleArbiterDemandData): `0x${string}` => {
  return encodeAbiParameters([demandDataType], [demand]);
};

/** Decodes CommitmentTrustedOracleArbiter.DemandData from bytes. */
export const decodeDemand = (demandData: `0x${string}`): CommitmentTrustedOracleArbiterDemandData => {
  return decodeAbiParameters([demandDataType], demandData)[0] as CommitmentTrustedOracleArbiterDemandData;
};

/** Computes the pre-attestation intent hash approved by CommitmentTrustedOracleArbiter. */
export const attestationIntentHash = (intent: AttestationIntent | Attestation): `0x${string}` => {
  return keccak256(
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
};

/** Computes the recorded decision key for an attestation intent and oracle demand context. */
export const decisionKeyFor = (intentHash: `0x${string}`, demand: `0x${string}`): `0x${string}` => {
  return keccak256(encodeAbiParameters([{ type: "bytes32" }, { type: "bytes" }], [intentHash, demand]));
};

/**
 * CommitmentTrustedOracleArbiter client.
 *
 * Records oracle decisions over future attestation intents, allowing a
 * fulfillment attestation to be created after oracle approval.
 */
export const makeCommitmentTrustedOracleArbiterClient = (viemClient: ViemClient, addresses: ChainAddresses) => {
  const arbitrationMadeEvent = parseAbiItem(
    "event ArbitrationMade(bytes32 indexed decisionKey, bytes32 indexed intentHash, address indexed oracle, bool decision)",
  );

  const arbitrationRequestedEvent = parseAbiItem(
    "event ArbitrationRequested(bytes32 indexed intentHash, address indexed oracle, bytes demand)",
  );

  const arbitrateRaw = async (intentHash: `0x${string}`, decisionContext: `0x${string}`, decision: boolean) =>
    await viemClient.writeContract({
      address: addresses.commitmentTrustedOracleArbiter,
      abi: commitmentTrustedOracleArbiterAbi.abi,
      functionName: "arbitrate",
      args: [intentHash, decisionContext, decision],
      account: viemClient.account,
      chain: viemClient.chain,
    });

  const decisionContextFromDemand = (demand: `0x${string}`): `0x${string}` => {
    const decoded = decodeDemand(demand);
    if (!isAddressEqual(decoded.oracle, viemClient.account.address)) {
      throw new Error(
        `CommitmentTrustedOracle demand is for oracle ${decoded.oracle}, not this client ${viemClient.account.address}`,
      );
    }
    return decoded.data;
  };

  const requestArbitration = async (
    intentHash: `0x${string}`,
    oracle: Address,
    decisionContext: `0x${string}`,
  ) => await viemClient.writeContract({
      address: addresses.commitmentTrustedOracleArbiter,
      abi: commitmentTrustedOracleArbiterAbi.abi,
      functionName: "requestArbitration",
      args: [intentHash, oracle, decisionContext],
      account: viemClient.account,
      chain: viemClient.chain,
    });

  const getArbitrationRequests = async (
    options: CommitmentArbitrateManyOptions = {},
  ): Promise<CommitmentArbitrationRequest[]> => {
    const logs = await viemClient.getLogs({
      address: addresses.commitmentTrustedOracleArbiter,
      event: arbitrationRequestedEvent,
      args: { oracle: viemClient.account.address },
      fromBlock: options.fromBlock ?? "earliest",
      toBlock: options.toBlock ?? "latest",
    });

    const requests = logs.map((log) => ({
      intentHash: log.args.intentHash as `0x${string}`,
      demand: log.args.demand as `0x${string}`,
    }));

    if (options.mode === "pastUnarbitrated" || options.mode === "allUnarbitrated") {
      const filteredRequests = await Promise.all(
        requests.map(async (request) => {
          const decisionKey = decisionKeyFor(request.intentHash, request.demand);
          const existingLogs = await viemClient.getLogs({
            address: addresses.commitmentTrustedOracleArbiter,
            event: arbitrationMadeEvent,
            args: {
              decisionKey,
              intentHash: request.intentHash,
              oracle: viemClient.account.address,
            },
            fromBlock: "earliest",
            toBlock: "latest",
          });

          return existingLogs.length === 0 ? request : null;
        }),
      );

      return filteredRequests.filter((request) => request !== null) as CommitmentArbitrationRequest[];
    }

    return requests;
  };

  const getArbitrationRequestLogs = async (
    options: { fromBlock?: BlockNumber | BlockTag; toBlock?: BlockNumber | BlockTag } = {},
  ) =>
    await viemClient.getLogs({
      address: addresses.commitmentTrustedOracleArbiter,
      event: arbitrationRequestedEvent,
      args: { oracle: viemClient.account.address },
      fromBlock: options.fromBlock ?? "earliest",
      toBlock: options.toBlock ?? "latest",
    });

  const getArbitrationDecisions = async (
    options: { fromBlock?: BlockNumber | BlockTag; toBlock?: BlockNumber | BlockTag } = {},
  ) =>
    await viemClient.getLogs({
      address: addresses.commitmentTrustedOracleArbiter,
      event: arbitrationMadeEvent,
      args: { oracle: viemClient.account.address },
      fromBlock: options.fromBlock ?? "earliest",
      toBlock: options.toBlock ?? "latest",
    });

  const arbitrateMany = async (
    arbitrate: (request: CommitmentArbitrationRequest) => Promise<boolean | null>,
    options: CommitmentArbitrateManyOptions = {},
  ): Promise<CommitmentArbitrateManyResult> => {
    const mode = options.mode ?? "allUnarbitrated";
    const shouldProcessPast = mode !== "future";
    const shouldListen = mode === "all" || mode === "allUnarbitrated" || mode === "future";

    let decisions: CommitmentDecision[] = [];
    if (shouldProcessPast) {
      const requests = await getArbitrationRequests({ ...options, mode });
      const decisionResults: (CommitmentDecision | null)[] = [];

      for (const request of requests) {
        const decision = await arbitrate(request);
        if (decision === null) {
          decisionResults.push(null);
          continue;
        }

        const hash = await arbitrateRaw(request.intentHash, request.demand, decision);
        decisionResults.push({ hash, intentHash: request.intentHash, decision });
      }

      decisions = decisionResults.filter((decision) => decision !== null) as CommitmentDecision[];
      await Promise.all(decisions.map((decision) => viemClient.waitForTransactionReceipt({ hash: decision.hash })));
    }

    if (!shouldListen) {
      return { decisions, unwatch: () => {} };
    }

    const optimalInterval = getOptimalPollingInterval(viemClient, options.pollingInterval);
    const handledDecisionKeys = new Set<`0x${string}`>();
    const unwatch = viemClient.watchEvent({
      address: addresses.commitmentTrustedOracleArbiter,
      event: arbitrationRequestedEvent,
      args: { oracle: viemClient.account.address },
      pollingInterval: optimalInterval,
      onLogs: async (logs) => {
        await Promise.all(
          logs.map(async (log) => {
            const request = {
              intentHash: log.args.intentHash as `0x${string}`,
              demand: log.args.demand as `0x${string}`,
            };
            const decisionKey = decisionKeyFor(request.intentHash, request.demand);

            if (mode === "allUnarbitrated") {
              if (handledDecisionKeys.has(decisionKey)) return;
              handledDecisionKeys.add(decisionKey);
              const existing = await viemClient.getLogs({
                address: addresses.commitmentTrustedOracleArbiter,
                event: arbitrationMadeEvent,
                args: { decisionKey, intentHash: request.intentHash, oracle: viemClient.account.address },
                fromBlock: "earliest",
                toBlock: "latest",
              });
              if (existing.length > 0) return;
            }

            const decisionResult = await arbitrate(request);
            if (decisionResult === null) {
              handledDecisionKeys.delete(decisionKey);
              return;
            }

            const hash = await arbitrateRaw(request.intentHash, request.demand, decisionResult);
            const decision = { hash, intentHash: request.intentHash, decision: decisionResult };

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
    address: addresses.commitmentTrustedOracleArbiter,
    arbitrate: arbitrateRaw,
    arbitrateRaw,
    arbitrateForDemand: async (intentHash: `0x${string}`, demand: `0x${string}`, decision: boolean) => {
      return await arbitrateRaw(intentHash, decisionContextFromDemand(demand), decision);
    },
    requestArbitration,
    getArbitrationRequests,
    getArbitrationRequestLogs,
    getArbitrationDecisions,
    checkExistingArbitration: async (
      intentHash: `0x${string}`,
      oracle: `0x${string}`,
      decisionContext: `0x${string}`,
    ): Promise<
      | {
          decisionKey: `0x${string}`;
          intentHash: `0x${string}`;
          oracle: `0x${string}`;
          decision: boolean;
        }
      | undefined
    > => {
      const logs = await viemClient.getLogs({
        address: addresses.commitmentTrustedOracleArbiter,
        event: arbitrationMadeEvent,
        args: { decisionKey: decisionKeyFor(intentHash, decisionContext), intentHash, oracle },
        fromBlock: "earliest",
        toBlock: "latest",
      });

      if (logs.length > 0 && logs[0]) {
        return logs[0].args as {
          decisionKey: `0x${string}`;
          intentHash: `0x${string}`;
          oracle: `0x${string}`;
          decision: boolean;
        };
      }

      return undefined;
    },
    waitForArbitration: async (
      intentHash: `0x${string}`,
      oracle: `0x${string}`,
      decisionContext: `0x${string}`,
      pollingInterval?: number,
    ): Promise<{
      decisionKey?: `0x${string}` | undefined;
      intentHash?: `0x${string}` | undefined;
      oracle?: `0x${string}` | undefined;
      decision?: boolean | undefined;
    }> => {
      const decisionKey = decisionKeyFor(intentHash, decisionContext);
      const logs = await viemClient.getLogs({
        address: addresses.commitmentTrustedOracleArbiter,
        event: arbitrationMadeEvent,
        args: { decisionKey, intentHash, oracle },
        fromBlock: "earliest",
        toBlock: "latest",
      });

      if (logs.length && logs[0]) return logs[0].args;

      const optimalInterval = getOptimalPollingInterval(viemClient, pollingInterval ?? 1000);
      return new Promise((resolve) => {
        const unwatch = viemClient.watchEvent({
          address: addresses.commitmentTrustedOracleArbiter,
          event: arbitrationMadeEvent,
          args: { decisionKey, intentHash, oracle },
          pollingInterval: optimalInterval,
          onLogs: (logs) => {
            if (logs[0]) {
              resolve(logs[0].args);
              unwatch();
            }
          },
          fromBlock: 1n,
        });
      });
    },
    waitForArbitrationRequest: async (
      intentHash: `0x${string}`,
      oracle: `0x${string}`,
      pollingInterval?: number,
    ): Promise<{
      intentHash?: `0x${string}` | undefined;
      oracle?: `0x${string}` | undefined;
      demand?: `0x${string}` | undefined;
    }> => {
      const logs = await viemClient.getLogs({
        address: addresses.commitmentTrustedOracleArbiter,
        event: arbitrationRequestedEvent,
        args: { intentHash, oracle },
        fromBlock: "earliest",
        toBlock: "latest",
      });

      if (logs.length && logs[0]) return logs[0].args;

      const optimalInterval = getOptimalPollingInterval(viemClient, pollingInterval ?? 1000);
      return new Promise((resolve) => {
        const unwatch = viemClient.watchEvent({
          address: addresses.commitmentTrustedOracleArbiter,
          event: arbitrationRequestedEvent,
          args: { intentHash, oracle },
          pollingInterval: optimalInterval,
          onLogs: (logs) => {
            if (logs[0]) {
              resolve(logs[0].args);
              unwatch();
            }
          },
          fromBlock: 1n,
        });
      });
    },
    arbitrateMany,
    encodeDemand,
    decodeDemand,
    attestationIntentHash,
    decisionKeyFor,
  };
};
