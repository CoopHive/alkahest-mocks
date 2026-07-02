import type { ViemClient } from "./contract";

/**
 * Detect if the viem client is using WebSocket transport.
 * @param viemClient - The viem client
 * @returns true if using WebSocket transport, false otherwise
 */
export const isWebSocketTransport = (viemClient: ViemClient): boolean => {
  const transport = viemClient.transport;
  return transport.type === "webSocket" || (typeof transport === "object" && transport !== null && "subscribe" in transport);
};

/**
 * Get optimal polling interval based on transport type.
 * @param viemClient - The viem client
 * @param defaultInterval - Default polling interval for HTTP
 * @returns optimal polling interval or undefined for WebSocket
 */
export const getOptimalPollingInterval = (
  viemClient: ViemClient,
  defaultInterval: number = 1000,
): number | undefined => {
  return isWebSocketTransport(viemClient) ? undefined : defaultInterval;
};
