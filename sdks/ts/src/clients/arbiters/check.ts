import type { Address } from "viem";
import { abi as baseArbiterAbi } from "../../contracts/BaseArbiter";
import type { Attestation, ChainAddresses } from "../../types";
import { readContract, type ViemClient } from "../../utils";

export type ArbiterContractKey =
  | "trivialArbiter"
  | "trustedOracleArbiter"
  | "commitmentTrustedOracleArbiter"
  | "anyArbiter"
  | "allArbiter"
  | "intrinsicsArbiter"
  | "erc8004Arbiter"
  | "referencesEscrowArbiter"
  | "exclusiveRevocableConfirmationArbiter"
  | "exclusiveUnrevocableConfirmationArbiter"
  | "nonexclusiveRevocableConfirmationArbiter"
  | "nonexclusiveUnrevocableConfirmationArbiter"
  | "recipientArbiter"
  | "attesterArbiter"
  | "schemaArbiter"
  | "uidArbiter"
  | "refUidArbiter"
  | "revocableArbiter"
  | "timeAfterArbiter"
  | "timeBeforeArbiter"
  | "timeEqualArbiter"
  | "expirationTimeAfterArbiter"
  | "expirationTimeBeforeArbiter"
  | "expirationTimeEqualArbiter";

export type ArbiterTarget = ArbiterContractKey | Address;

export const arbiterAddress = (addresses: ChainAddresses, arbiter: ArbiterTarget): Address =>
  arbiter.startsWith("0x") ? (arbiter as Address) : addresses[arbiter as ArbiterContractKey];

/** Check whether a fulfillment satisfies an arbiter demand. */
export const checkArbiter = async (
  viemClient: ViemClient,
  addresses: ChainAddresses,
  arbiter: ArbiterTarget,
  fulfillment: Attestation,
  demand: `0x${string}`,
  escrowUid: `0x${string}`,
): Promise<boolean> =>
  await readContract<boolean>(viemClient, {
    address: arbiterAddress(addresses, arbiter),
    abi: baseArbiterAbi.abi,
    functionName: "check",
    args: [fulfillment, demand, escrowUid],
  });
