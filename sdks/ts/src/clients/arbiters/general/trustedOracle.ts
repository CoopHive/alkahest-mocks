import {
  type Address,
  type BlockNumber,
  type BlockTag,
  concat,
  decodeAbiParameters,
  encodeAbiParameters,
  getAbiItem,
  isAddressEqual,
  keccak256,
  parseAbiItem,
} from "viem";
import { abi as trustedOracleArbiterAbi } from "../../../contracts/arbiters/trusted-oracle/TrustedOracleArbiter";
import type { Attestation, ChainAddresses } from "../../../types";
import { getAttestation, getOptimalPollingInterval, type ViemClient } from "../../../utils";

// Extract DemandData struct ABI from contract ABI at module initialization
const trustedOracleArbiterDecodeDemandFunction = getAbiItem({
  abi: trustedOracleArbiterAbi.abi,
  name: "decodeDemandData",
});

// Extract the DemandData struct type from the function output
const trustedOracleArbiterDemandDataType = trustedOracleArbiterDecodeDemandFunction.outputs[0];

/**
 * TrustedOracleArbiter DemandData type
 */
export type TrustedOracleArbiterDemandData = {
  oracle: `0x${string}`;
  data: `0x${string}`;
};

/**
 * Encodes TrustedOracleArbiter.DemandData to bytes.
 * @param demand - struct DemandData {address oracle, bytes data}
 * @returns abi encoded bytes
 */
export const encodeDemand = (demand: TrustedOracleArbiterDemandData): `0x${string}` => {
  return encodeAbiParameters([trustedOracleArbiterDemandDataType], [demand]);
};

/**
 * Decodes TrustedOracleArbiter.DemandData from bytes.
 * @param demandData - DemandData as abi encoded bytes
 * @returns the decoded DemandData object
 */
export const decodeDemand = (demandData: `0x${string}`): TrustedOracleArbiterDemandData => {
  return decodeAbiParameters([trustedOracleArbiterDemandDataType], demandData)[0] as TrustedOracleArbiterDemandData;
};

/**
 * Mode for arbitration processing (matching Rust SDK naming)
 * - "past": Process all past events only, no listening
 * - "pastUnarbitrated": Process only unarbitrated past events, no listening
 * - "allUnarbitrated": Process unarbitrated past + listen for new events (default)
 * - "all": Process all past + listen for new events
 * - "future": Only listen for new events, skip past event processing
 */
export type ArbitrationMode = "past" | "pastUnarbitrated" | "allUnarbitrated" | "all" | "future";

/**
 * Options for arbitrateMany
 */
export type ArbitrateManyOptions = {
  /**
   * Mode for arbitration processing (default: "allUnarbitrated")
   */
  mode?: ArbitrationMode;
  /**
   * Block range for past arbitration
   */
  fromBlock?: BlockNumber | BlockTag;
  toBlock?: BlockNumber | BlockTag;
  /**
   * Callback called after each arbitration decision (for listening modes)
   */
  onAfterArbitrate?: (decision: Decision) => Promise<void>;
  /**
   * Polling interval in milliseconds for listening modes
   */
  pollingInterval?: number;
};


/**
 * An attestation paired with its associated demand data from ArbitrationRequested event
 */
export type AttestationWithDemand = {
  attestation: Attestation;
  demand: `0x${string}`;
};

export type Decision = {
  hash: `0x${string}`;
  attestation: Attestation;
  decision: boolean;
};

export type ArbitrateManyResult = {
  decisions: Decision[];
  unwatch: () => void;
};

/**
 * TrustedOracleArbiter Client
 *
 * Handles oracle-based decision making with arbitration requests.
 * This arbiter allows for external oracles to make decisions on attestation validity.
 *
 * Features:
 * - Request arbitration from specific oracles
 * - Listen for arbitration requests
 * - Submit arbitration decisions
 * - Wait for arbitration results
 * - Automated arbitration workflows
 */
export const makeTrustedOracleArbiterClient = (viemClient: ViemClient, addresses: ChainAddresses) => {
  // Cache the parsed event ABIs to avoid re-parsing on each call
  const arbitrationMadeEvent = parseAbiItem(
    "event ArbitrationMade(bytes32 indexed decisionKey, bytes32 indexed fulfillmentUid, address indexed oracle, bool decision)",
  );

  const arbitrationRequestedEvent = parseAbiItem(
    "event ArbitrationRequested(bytes32 indexed fulfillmentUid, address indexed oracle, bytes demand)",
  );

  const arbitrateOnchain = async (fulfillmentUid: `0x${string}`, demand: `0x${string}`, decision: boolean) =>
    await viemClient.writeContract({
      address: addresses.trustedOracleArbiter,
      abi: trustedOracleArbiterAbi.abi,
      functionName: "arbitrate",
      args: [fulfillmentUid, demand, decision],
      account: viemClient.account,
      chain: viemClient.chain,
    });

  const decisionContextFromDemand = (demand: `0x${string}`): `0x${string}` => {
    const decoded = decodeDemand(demand);
    if (!isAddressEqual(decoded.oracle, viemClient.account.address)) {
      throw new Error(
        `TrustedOracle demand is for oracle ${decoded.oracle}, not this client ${viemClient.account.address}`,
      );
    }
    return decoded.data;
  };

  const decisionKeyFor = (fulfillmentUid: `0x${string}`, decisionContext: `0x${string}`): `0x${string}` =>
    keccak256(concat([fulfillmentUid, decisionContext]));

  const decisionKeyFromDemand = (fulfillmentUid: `0x${string}`, demand: `0x${string}`): `0x${string}` =>
    decisionKeyFor(fulfillmentUid, decodeDemand(demand).data);

  /**
   * Request arbitration for a fulfillment
   */
  const requestArbitration = async (fulfillmentUid: `0x${string}`, oracle: Address, demand: `0x${string}`) => {
    return await viemClient.writeContract({
      address: addresses.trustedOracleArbiter,
      abi: trustedOracleArbiterAbi.abi,
      functionName: "requestArbitration",
      args: [fulfillmentUid, oracle, demand],
      account: viemClient.account,
      chain: viemClient.chain,
    });
  };

  /**
   * Get arbitration requests for the current oracle
   * Returns attestations paired with their demand data from the ArbitrationRequested event
   */
  const getArbitrationRequests = async (options: ArbitrateManyOptions = {}): Promise<AttestationWithDemand[]> => {
    const logs = await viemClient.getLogs({
      address: addresses.trustedOracleArbiter,
      event: arbitrationRequestedEvent,
      args: {
        oracle: viemClient.account.address,
      },
      fromBlock: options.fromBlock || "earliest",
      toBlock: options.toBlock || "latest",
    });

    // Fetch attestations and pair with their demand data from the event
    const attestationsWithDemand = await Promise.all(
      logs.map(async (log) => {
        const attestation = await getAttestation(viemClient, log.args.fulfillmentUid!, addresses);
        return {
          attestation,
          demand: log.args.demand as `0x${string}`,
        };
      }),
    );

    // Filter out expired or revoked attestations
    const now = BigInt(Math.floor(Date.now() / 1000));
    const validAttestationsWithDemand = attestationsWithDemand.filter(
      (awd) =>
        (awd.attestation.expirationTime === BigInt(0) || awd.attestation.expirationTime >= now) &&
        (awd.attestation.revocationTime === BigInt(0) || awd.attestation.revocationTime >= now),
    );

    // If mode includes unarbitrated filtering, filter out already arbitrated attestations
    if (options.mode === "pastUnarbitrated" || options.mode === "allUnarbitrated") {
      const filteredAttestationsWithDemand = await Promise.all(
        validAttestationsWithDemand.map(async (awd) => {
          const decisionKey = decisionKeyFromDemand(awd.attestation.uid, awd.demand);
          const existingLogs = await viemClient.getLogs({
            address: addresses.trustedOracleArbiter,
            event: arbitrationMadeEvent,
            args: {
              decisionKey,
              fulfillmentUid: awd.attestation.uid,
              oracle: viemClient.account.address,
            },
            fromBlock: "earliest",
            toBlock: "latest",
          });

          return existingLogs.length === 0 ? awd : null;
        }),
      );

      return filteredAttestationsWithDemand.filter((awd) => awd !== null) as AttestationWithDemand[];
    }

    return validAttestationsWithDemand;
  };

  /**
   * Unified arbitration function that combines past processing and future listening
   * @param arbitrate - Callback that returns decision (boolean) for each attestation with demand, or null to skip
   * @param options - Arbitration options including mode
   * @returns ArbitrateManyResult with decisions array and unwatch function
   */
  const arbitrateMany = async (
    arbitrate: (awd: AttestationWithDemand) => Promise<boolean | null>,
    options: ArbitrateManyOptions = {},
  ): Promise<ArbitrateManyResult> => {
    const mode = options.mode ?? "allUnarbitrated";

    // Determine if we should process past attestations
    const shouldProcessPast = mode !== "future";

    // Determine if we should listen for new events
    const shouldListen = mode === "all" || mode === "allUnarbitrated" || mode === "future";

    // Process past attestations if needed
    let decisions: Decision[] = [];
    if (shouldProcessPast) {
      const attestationsWithDemand = await getArbitrationRequests(options);

      // Process arbitration sequentially to avoid nonce conflicts
      const decisionResults: (Decision | null)[] = [];
      for (const awd of attestationsWithDemand) {
        const decision = await arbitrate(awd);
        if (decision === null) {
          decisionResults.push(null);
          continue;
        }

        // Decode the full demand to get the inner data
        // check computes: keccak256(obligation.uid, demand_.data)
        // so arbitrate must use the same inner data
        // Handle empty demand case (contextless arbitration)
        const innerData = decisionContextFromDemand(awd.demand);
        const hash = await arbitrateOnchain(awd.attestation.uid, innerData, decision);
        decisionResults.push({ hash, attestation: awd.attestation, decision });
      }

      // Wait for all transactions to be mined in parallel
      decisions = decisionResults.filter((d) => d !== null) as Decision[];
      await Promise.all(decisions.map((d) => viemClient.waitForTransactionReceipt({ hash: d.hash })));
    }

    // If not listening, return just the decisions with a no-op unwatch
    if (!shouldListen) {
      return { decisions, unwatch: () => {} };
    }

    // Use optimal polling interval based on transport type
    const optimalInterval = getOptimalPollingInterval(viemClient, options.pollingInterval);

    // Listen for new arbitration requests
    // Note: New events cannot be already arbitrated, so no skip logic needed here
    const unwatch = viemClient.watchEvent({
      address: addresses.trustedOracleArbiter,
      event: arbitrationRequestedEvent,
      args: {
        oracle: viemClient.account.address,
      },
      onLogs: async (logs) => {
        await Promise.all(
          logs.map(async (log) => {
            const attestation = await getAttestation(viemClient, log.args.fulfillmentUid!, addresses);
            // Extract demand from ArbitrationRequested event
            const demand = log.args.demand as `0x${string}`;

            const decisionResult = await arbitrate({ attestation, demand });
            if (decisionResult === null) return;

            // Decode the full demand to get the inner data
            // check computes: keccak256(obligation.uid, demand_.data)
            // so arbitrate must use the same inner data
            // Handle empty demand case (contextless arbitration)
            const innerData = decisionContextFromDemand(demand);
            const hash = await arbitrateOnchain(attestation.uid, innerData, decisionResult);

            const decision = {
              hash,
              attestation,
              decision: decisionResult,
            };

            if (options.onAfterArbitrate) {
              await options.onAfterArbitrate(decision);
            }
          }),
        );
      },
      pollingInterval: optimalInterval,
    });

    return { decisions, unwatch };
  };

  return {
    encodeDemand,
    decodeDemand,

    /**
     * Arbitrate on the validity of a fulfillment satisfying an encoded TrustedOracleArbiter demand.
     * @param fulfillmentUid - bytes32 fulfillment UID
     * @param demand - encoded TrustedOracleArbiter.DemandData bytes
     * @param decision - bool decision
     * @returns transaction hash
     */
    arbitrateForDemand: async (fulfillmentUid: `0x${string}`, demand: `0x${string}`, decision: boolean) => {
      return await arbitrateOnchain(fulfillmentUid, decisionContextFromDemand(demand), decision);
    },

    /**
     * Arbitrate with the raw inner decision context used in the on-chain decision key.
     * @param fulfillmentUid - bytes32 fulfillment UID
     * @param decisionContext - TrustedOracleArbiter.DemandData.data bytes
     * @param decision - bool decision
     * @returns transaction hash
     */
    arbitrateRaw: async (fulfillmentUid: `0x${string}`, decisionContext: `0x${string}`, decision: boolean) => {
      return await arbitrateOnchain(fulfillmentUid, decisionContext, decision);
    },

    /**
     * Request arbitration on a fulfillment from TrustedOracleArbiter
     * @param fulfillmentUid - bytes32 fulfillment UID
     * @param oracle - address of the oracle to request arbitration from
     * @returns transaction hash
     */
    requestArbitration,

    /**
     * Check if an arbitration has already been made for a specific fulfillment by a specific oracle
     * @param fulfillmentUid - bytes32 fulfillment UID
     * @param oracle - address of the oracle
     * @param demand - encoded TrustedOracleArbiter.DemandData bytes for the checked decision context
     * @returns the arbitration result if exists, undefined if not
     */
    checkExistingArbitration: async (
      fulfillmentUid: `0x${string}`,
      oracle: `0x${string}`,
      demand: `0x${string}`,
    ): Promise<
      | {
          decisionKey: `0x${string}`;
          fulfillmentUid: `0x${string}`;
          oracle: `0x${string}`;
          decision: boolean;
        }
      | undefined
    > => {
      const logs = await viemClient.getLogs({
        address: addresses.trustedOracleArbiter,
        event: arbitrationMadeEvent,
        args: { decisionKey: decisionKeyFromDemand(fulfillmentUid, demand), fulfillmentUid, oracle },
        fromBlock: "earliest",
        toBlock: "latest",
      });

      if (logs.length > 0 && logs[0]) {
        return logs[0].args as {
          decisionKey: `0x${string}`;
          fulfillmentUid: `0x${string}`;
          oracle: `0x${string}`;
          decision: boolean;
        };
      }

      return undefined;
    },

    /**
     * Wait for an arbitration to be made on a TrustedOracleArbiter
     * @param fulfillmentUid - bytes32 fulfillment UID
     * @param oracle - address of the oracle
     * @param demand - encoded TrustedOracleArbiter.DemandData bytes for the expected decision context
     * @param pollingInterval - polling interval in milliseconds (default: 1000)
     * @returns the event args
     */
    waitForArbitration: async (
      fulfillmentUid: `0x${string}`,
      oracle: `0x${string}`,
      demand: `0x${string}`,
      pollingInterval?: number,
    ): Promise<{
      decisionKey?: `0x${string}` | undefined;
      fulfillmentUid?: `0x${string}` | undefined;
      oracle?: `0x${string}` | undefined;
      decision?: boolean | undefined;
    }> => {
      const decisionKey = decisionKeyFromDemand(fulfillmentUid, demand);
      const logs = await viemClient.getLogs({
        address: addresses.trustedOracleArbiter,
        event: arbitrationMadeEvent,
        args: { decisionKey, fulfillmentUid, oracle },
        fromBlock: "earliest",
        toBlock: "latest",
      });

      if (logs.length && logs[0]) return logs[0].args;

      // Use optimal polling interval based on transport type
      const optimalInterval = getOptimalPollingInterval(viemClient, pollingInterval ?? 1000);

      return new Promise((resolve) => {
        const unwatch = viemClient.watchEvent({
          address: addresses.trustedOracleArbiter,
          event: arbitrationMadeEvent,
          args: { decisionKey, fulfillmentUid, oracle },
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

    /**
     * Wait for an arbitration request to be made on a TrustedOracleArbiter
     * @param fulfillmentUid - bytes32 fulfillment UID
     * @param oracle - address of the oracle
     * @param pollingInterval - polling interval in milliseconds (default: 1000)
     * @returns the event args
     */
    waitForArbitrationRequest: async (
      fulfillmentUid: `0x${string}`,
      oracle: `0x${string}`,
      pollingInterval?: number,
    ): Promise<{
      fulfillmentUid?: `0x${string}` | undefined;
      oracle?: `0x${string}` | undefined;
    }> => {
      const logs = await viemClient.getLogs({
        address: addresses.trustedOracleArbiter,
        event: arbitrationRequestedEvent,
        args: { fulfillmentUid, oracle },
        fromBlock: "earliest",
        toBlock: "latest",
      });

      if (logs.length && logs[0]) return logs[0].args;

      // Use optimal polling interval based on transport type
      const optimalInterval = getOptimalPollingInterval(viemClient, pollingInterval ?? 1000);

      return new Promise((resolve) => {
        const unwatch = viemClient.watchEvent({
          address: addresses.trustedOracleArbiter,
          event: arbitrationRequestedEvent,
          args: { fulfillmentUid, oracle },
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

    /**
     * Listen for arbitration requests and only arbitrate on request
     * This function continuously listens for ArbitrationRequested events
     * and calls the provided arbitration handler for each request
     * @param oracle - address of the oracle (filter for requests to this oracle)
     * @param arbitrationHandler - function to handle arbitration requests, returns decision (boolean)
     * @param pollingInterval - polling interval in milliseconds (default: 1000)
     * @returns unwatch function to stop listening
     */
    listenForArbitrationRequestsOnly: (
      oracle: `0x${string}`,
      arbitrationHandler: (
        fulfillmentUid: `0x${string}`,
        oracle: `0x${string}`,
        demand: `0x${string}`,
      ) => Promise<boolean>,
      pollingInterval?: number,
    ) => {
      // Use optimal polling interval based on transport type
      const optimalInterval = getOptimalPollingInterval(viemClient, pollingInterval ?? 1000);

      return viemClient.watchEvent({
        address: addresses.trustedOracleArbiter,
        event: arbitrationRequestedEvent,
        args: { oracle },
        pollingInterval: optimalInterval,
        onLogs: async (logs) => {
          for (const log of logs) {
            const { fulfillmentUid: requestedFulfillmentUid, oracle: requestedOracle, demand } = log.args;
            if (requestedFulfillmentUid && requestedOracle && demand) {
              try {
                // Call the arbitration handler to get the decision
                const decision = await arbitrationHandler(
                  requestedFulfillmentUid,
                  requestedOracle,
                  demand as `0x${string}`,
                );

                // Decode the full demand to get the inner data
                // check computes: keccak256(obligation.uid, demand_.data)
                // so arbitrate must use the same inner data
                // Handle empty demand case (contextless arbitration)
                const innerData = demand && demand !== "0x" ? decodeDemand(demand as `0x${string}`).data : "0x";

                // Submit the arbitration using the inner data
                await viemClient.writeContract({
                  address: addresses.trustedOracleArbiter,
                  abi: trustedOracleArbiterAbi.abi,
                  functionName: "arbitrate",
                  args: [requestedFulfillmentUid, innerData, decision],
                });
              } catch (error) {
                console.error(`Failed to arbitrate for fulfillment ${requestedFulfillmentUid}:`, error);
              }
            }
          }
        },
        fromBlock: 1n,
      });
    },

    // Oracle-specific functions
    getArbitrationRequests,
    arbitrateMany,
  };
};
