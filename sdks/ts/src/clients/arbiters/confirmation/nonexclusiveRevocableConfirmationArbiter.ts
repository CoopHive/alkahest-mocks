import { parseAbiItem } from "viem";
import { abi as NonexclusiveRevocableConfirmationArbiterAbi } from "../../../contracts/arbiters/confirmation/NonexclusiveRevocableConfirmationArbiter";
import type { ChainAddresses } from "../../../types";
import { getOptimalPollingInterval, type ViemClient } from "../../../utils";

/**
 * NonexclusiveRevocableConfirmationArbiter Client
 *
 * Multiple fulfillments can be confirmed per escrow, confirmations can be revoked.
 * This arbiter allows multiple fulfillments to be confirmed for the same escrow,
 * and any confirmation can be revoked by the escrow recipient.
 */
export const makeNonexclusiveRevocableConfirmationArbiterClient = (
  viemClient: ViemClient,
  addresses: ChainAddresses,
) => {
  const confirmationMadeEvent = parseAbiItem(
    "event ConfirmationMade(bytes32 indexed fulfillment, bytes32 indexed escrow)",
  );
  const confirmationRequestedEvent = parseAbiItem(
    "event ConfirmationRequested(bytes32 indexed fulfillment, address indexed confirmer, bytes32 indexed escrow)",
  );
  const confirmationRevokedEvent = parseAbiItem(
    "event ConfirmationRevoked(bytes32 indexed fulfillment, bytes32 indexed escrow)",
  );

  return {
    /**
     * Get the arbiter address
     */
    address: addresses.nonexclusiveRevocableConfirmationArbiter,

    /**
     * Confirm a fulfillment for an escrow
     * Only the escrow recipient can confirm.
     */
    confirm: async (fulfillment: `0x${string}`, escrow: `0x${string}`) => {
      return await viemClient.writeContract({
        address: addresses.nonexclusiveRevocableConfirmationArbiter,
        abi: NonexclusiveRevocableConfirmationArbiterAbi.abi,
        functionName: "confirm",
        args: [fulfillment, escrow],
        account: viemClient.account,
        chain: viemClient.chain,
      });
    },

    /**
     * Revoke a confirmation
     * Only the escrow recipient can revoke.
     */
    revoke: async (fulfillment: `0x${string}`, escrow: `0x${string}`) => {
      return await viemClient.writeContract({
        address: addresses.nonexclusiveRevocableConfirmationArbiter,
        abi: NonexclusiveRevocableConfirmationArbiterAbi.abi,
        functionName: "revoke",
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
        address: addresses.nonexclusiveRevocableConfirmationArbiter,
        abi: NonexclusiveRevocableConfirmationArbiterAbi.abi,
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
        address: addresses.nonexclusiveRevocableConfirmationArbiter,
        abi: NonexclusiveRevocableConfirmationArbiterAbi.abi,
        functionName: "confirmations",
        args: [fulfillment, escrow],
      });
    },

    /**
     * Wait for a confirmation event
     */
    waitForConfirmation: async (fulfillment: `0x${string}`, escrow: `0x${string}`, pollingInterval?: number) => {
      const logs = await viemClient.getLogs({
        address: addresses.nonexclusiveRevocableConfirmationArbiter,
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
          address: addresses.nonexclusiveRevocableConfirmationArbiter,
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
        address: addresses.nonexclusiveRevocableConfirmationArbiter,
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
          address: addresses.nonexclusiveRevocableConfirmationArbiter,
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
