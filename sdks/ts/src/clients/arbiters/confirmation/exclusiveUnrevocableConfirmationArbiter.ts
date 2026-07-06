import { parseAbiItem } from "viem";
import { abi as ExclusiveUnrevocableConfirmationArbiterAbi } from "../../../contracts/arbiters/confirmation/ExclusiveUnrevocableConfirmationArbiter";
import type { ChainAddresses } from "../../../types";
import { getOptimalPollingInterval, type ViemClient } from "../../../utils";

/**
 * ExclusiveUnrevocableConfirmationArbiter Client
 *
 * Single fulfillment per escrow, confirmation cannot be revoked.
 * Only one fulfillment can be confirmed per escrow, and once confirmed
 * it cannot be revoked.
 */
export const makeExclusiveUnrevocableConfirmationArbiterClient = (
  viemClient: ViemClient,
  addresses: ChainAddresses,
) => {
  const confirmationMadeEvent = parseAbiItem(
    "event ConfirmationMade(bytes32 indexed fulfillment, bytes32 indexed escrow)",
  );
  const confirmationRequestedEvent = parseAbiItem(
    "event ConfirmationRequested(bytes32 indexed fulfillment, address indexed confirmer, bytes32 indexed escrow)",
  );

  return {
    /**
     * Get the arbiter address
     */
    address: addresses.exclusiveUnrevocableConfirmationArbiter,

    /**
     * Confirm a fulfillment for an escrow
     * Only the escrow recipient can confirm.
     */
    confirm: async (fulfillment: `0x${string}`, escrow: `0x${string}`) => {
      return await viemClient.writeContract({
        address: addresses.exclusiveUnrevocableConfirmationArbiter,
        abi: ExclusiveUnrevocableConfirmationArbiterAbi.abi,
        functionName: "confirm",
        args: [fulfillment, escrow],
        account: viemClient.account,
        chain: viemClient.chain,
      });
    },

    /**
     * Request confirmation for a fulfillment
     * The fulfillment attester or recipient can request confirmation.
     */
    requestConfirmation: async (fulfillment: `0x${string}`, escrow: `0x${string}`) => {
      return await viemClient.writeContract({
        address: addresses.exclusiveUnrevocableConfirmationArbiter,
        abi: ExclusiveUnrevocableConfirmationArbiterAbi.abi,
        functionName: "requestConfirmation",
        args: [fulfillment, escrow],
        account: viemClient.account,
        chain: viemClient.chain,
      });
    },

    /**
     * Check if a fulfillment is confirmed for an escrow
     */
    isConfirmed: async (fulfillment: `0x${string}`, escrow: `0x${string}`) => {
      return await viemClient.readContract({
        address: addresses.exclusiveUnrevocableConfirmationArbiter,
        abi: ExclusiveUnrevocableConfirmationArbiterAbi.abi,
        functionName: "confirmations",
        args: [fulfillment, escrow],
      });
    },

    /**
     * Check if any fulfillment has been confirmed for an escrow
     */
    isEscrowConfirmed: async (escrow: `0x${string}`) => {
      return await viemClient.readContract({
        address: addresses.exclusiveUnrevocableConfirmationArbiter,
        abi: ExclusiveUnrevocableConfirmationArbiterAbi.abi,
        functionName: "escrowConfirmed",
        args: [escrow],
      });
    },

    /**
     * Wait for a confirmation event
     */
    waitForConfirmation: async (fulfillment: `0x${string}`, escrow: `0x${string}`, pollingInterval?: number) => {
      const logs = await viemClient.getLogs({
        address: addresses.exclusiveUnrevocableConfirmationArbiter,
        event: confirmationMadeEvent,
        args: { fulfillment, escrow },
        fromBlock: "earliest",
        toBlock: "latest",
      });

      if (logs.length > 0 && logs[0]) {
        return logs[0].args;
      }

      const optimalInterval = getOptimalPollingInterval(viemClient, pollingInterval ?? 1000);

      return new Promise<{ fulfillment?: `0x${string}`; escrow?: `0x${string}` }>((resolve) => {
        const unwatch = viemClient.watchEvent({
          address: addresses.exclusiveUnrevocableConfirmationArbiter,
          event: confirmationMadeEvent,
          args: { fulfillment, escrow },
          pollingInterval: optimalInterval,
          onLogs: (logs) => {
            if (logs[0]) {
              resolve(logs[0].args);
              unwatch();
            }
          },
        });
      });
    },

    /**
     * Wait for a confirmation request event
     */
    waitForConfirmationRequest: async (
      fulfillment: `0x${string}`,
      confirmer: `0x${string}`,
      escrow: `0x${string}`,
      pollingInterval?: number,
    ) => {
      const logs = await viemClient.getLogs({
        address: addresses.exclusiveUnrevocableConfirmationArbiter,
        event: confirmationRequestedEvent,
        args: { fulfillment, confirmer, escrow },
        fromBlock: "earliest",
        toBlock: "latest",
      });

      if (logs.length > 0 && logs[0]) {
        return logs[0].args;
      }

      const optimalInterval = getOptimalPollingInterval(viemClient, pollingInterval ?? 1000);

      return new Promise<{
        fulfillment?: `0x${string}`;
        confirmer?: `0x${string}`;
        escrow?: `0x${string}`;
      }>((resolve) => {
        const unwatch = viemClient.watchEvent({
          address: addresses.exclusiveUnrevocableConfirmationArbiter,
          event: confirmationRequestedEvent,
          args: { fulfillment, confirmer, escrow },
          pollingInterval: optimalInterval,
          onLogs: (logs) => {
            if (logs[0]) {
              resolve(logs[0].args);
              unwatch();
            }
          },
        });
      });
    },
  };
};
