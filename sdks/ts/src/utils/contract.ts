import {
  type Account,
  type Chain,
  type PublicActions,
  type Transport,
  type WalletClient,
} from "viem";
import { assertDeployedContract } from "./contractSafety";

export type ViemClient = WalletClient<Transport, Chain, Account> & PublicActions;
type WriteContractParams = Omit<Parameters<ViemClient["writeContract"]>[0], "value"> & {
  value?: bigint;
};

/**
 * Wrapper for viemClient.writeContract that adds required chain parameter.
 */
export const writeContract = async (viemClient: ViemClient, params: WriteContractParams) => {
  assertDeployedContract(params.address, String(params.functionName ?? "contract"));
  return viemClient.writeContract({
    ...params,
    chain: viemClient.chain,
  } as Parameters<ViemClient["writeContract"]>[0]);
};

/**
 * Wrapper for viemClient.readContract that adds required authorizationList parameter.
 */
export const readContract = async <T>(
  viemClient: ViemClient,
  params: Parameters<ViemClient["readContract"]>[0],
): Promise<T> => {
  return viemClient.readContract({
    ...params,
    authorizationList: undefined,
  }) as Promise<T>;
};
