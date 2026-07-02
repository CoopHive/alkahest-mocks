import { parseEventLogs } from "viem";
import { contractAddresses } from "../config";
import { abi as easAbi, abi as iEasAbi } from "../contracts/IEAS";
import type { ChainAddresses } from "../types";
import type { ViemClient } from "./contract";

export const getAttestation = async (
  viemClient: ViemClient,
  uid: `0x${string}`,
  addresses?: Pick<ChainAddresses, "eas">,
) => {
  const easAddress = addresses?.eas ?? contractAddresses[viemClient.chain.name]?.eas;
  if (!easAddress) {
    throw new Error(`No EAS address found for chain ${viemClient.chain.name}`);
  }

  const attestation = await viemClient.readContract({
    address: easAddress,
    abi: easAbi.abi,
    functionName: "getAttestation",
    args: [uid],
    authorizationList: undefined,
  });
  return attestation;
};

export const getAttestedEventFromTxHash = async (client: ViemClient, hash: `0x${string}`): Promise<any> => {
  const events = await getAttestedEventsFromTxHash(client, hash);

  if (!events[0]) {
    throw new Error(`No Attested event found in transaction ${hash}`);
  }

  return events[0].args;
};

export const getAttestedEventsFromTxHash = async (client: ViemClient, hash: `0x${string}`): Promise<any[]> => {
  let tx;
  try {
    tx = await client.waitForTransactionReceipt({ hash });
  } catch (error) {
    throw new Error(`Failed to get transaction receipt for ${hash}: ${error}`);
  }
  const events = parseEventLogs({
    abi: iEasAbi.abi,
    eventName: "Attested",
    logs: tx.logs,
  });

  return events;
};
