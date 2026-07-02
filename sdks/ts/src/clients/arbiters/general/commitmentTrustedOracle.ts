import {
  type Address,
  decodeAbiParameters,
  encodeAbiParameters,
  getAbiItem,
  keccak256,
  parseAbiItem,
} from "viem";
import { abi as commitmentTrustedOracleArbiterAbi } from "../../../contracts/arbiters/trusted-oracle/CommitmentTrustedOracleArbiter";
import type { Attestation, ChainAddresses } from "../../../types";
import type { ViemClient } from "../../../utils";

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

  const arbitrate = async (intentHash: `0x${string}`, demand: `0x${string}`, decision: boolean) =>
    await viemClient.writeContract({
      address: addresses.commitmentTrustedOracleArbiter,
      abi: commitmentTrustedOracleArbiterAbi.abi,
      functionName: "arbitrate",
      args: [intentHash, demand, decision],
      account: viemClient.account,
      chain: viemClient.chain,
    });

  const requestArbitration = async (intentHash: `0x${string}`, oracle: Address, demand: `0x${string}`) =>
    await viemClient.writeContract({
      address: addresses.commitmentTrustedOracleArbiter,
      abi: commitmentTrustedOracleArbiterAbi.abi,
      functionName: "requestArbitration",
      args: [intentHash, oracle, demand],
      account: viemClient.account,
      chain: viemClient.chain,
    });

  const getArbitrationRequests = async (options: { fromBlock?: bigint | "earliest"; toBlock?: bigint | "latest" } = {}) =>
    await viemClient.getLogs({
      address: addresses.commitmentTrustedOracleArbiter,
      event: arbitrationRequestedEvent,
      args: { oracle: viemClient.account.address },
      fromBlock: options.fromBlock ?? "earliest",
      toBlock: options.toBlock ?? "latest",
    });

  const getArbitrationDecisions = async (options: { fromBlock?: bigint | "earliest"; toBlock?: bigint | "latest" } = {}) =>
    await viemClient.getLogs({
      address: addresses.commitmentTrustedOracleArbiter,
      event: arbitrationMadeEvent,
      args: { oracle: viemClient.account.address },
      fromBlock: options.fromBlock ?? "earliest",
      toBlock: options.toBlock ?? "latest",
    });

  return {
    address: addresses.commitmentTrustedOracleArbiter,
    arbitrate,
    requestArbitration,
    getArbitrationRequests,
    getArbitrationDecisions,
    encodeDemand,
    decodeDemand,
    attestationIntentHash,
    decisionKeyFor,
  };
};
