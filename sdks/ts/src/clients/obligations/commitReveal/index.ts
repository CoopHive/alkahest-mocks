import { decodeAbiParameters, encodeAbiParameters, getAbiItem } from "viem";

import { abi as commitRevealObligationAbi } from "../../../contracts/obligations/CommitRevealObligation";
import type { ChainAddresses } from "../../../types";
import type { ViemClient } from "../../../utils";
import { assertDeployedContract, getAttestation, getAttestedEventFromTxHash } from "../../../utils";

const commitRevealDecodeFunction = getAbiItem({
  abi: commitRevealObligationAbi.abi,
  name: "decodeObligationData",
});

const commitRevealDataType = commitRevealDecodeFunction.outputs[0];

const commitRevealDemandDecodeFunction = getAbiItem({
  abi: commitRevealObligationAbi.abi,
  name: "decodeDemandData",
});

const commitRevealDemandType = commitRevealDemandDecodeFunction.outputs[0];

/**
 * Security note: the underlying CommitRevealObligation contract was not
 * included in professional manual audits and has only been reviewed by
 * automated audit tooling so far.
 */

/** Data revealed in a commit-reveal fulfillment attestation. */
export type CommitRevealObligationData = {
  /** Arbitrary self-contained payload being revealed. */
  payload: `0x${string}`;
  /** Fulfiller-chosen salt included in the commitment. */
  salt: `0x${string}`;
  /** Application-level schema or tag describing the payload format. */
  schema: `0x${string}`;
};

/** Arbiter demand data for commit-reveal fulfillment checks. */
export type CommitRevealDemandData = {
  /** Exact native-token bond amount the prior commit must have locked. */
  bondAmount: bigint;
  /** Relative reveal deadline, in seconds after the commit timestamp. */
  commitDeadline: bigint;
};

/** Contract addresses needed by the commit-reveal client. */
export type CommitRevealAddresses = {
  /** EAS contract address. */
  eas: `0x${string}`;
  /** CommitRevealObligation contract address. */
  commitRevealObligation: `0x${string}`;
};

/** Picks commit-reveal addresses out of a complete chain address table. */
export const pickCommitRevealAddresses = (addresses: ChainAddresses): CommitRevealAddresses => ({
  eas: addresses.eas,
  commitRevealObligation: addresses.commitRevealObligation,
});

/** Client returned by {@link makeCommitRevealObligationClient}. */
export type CommitRevealObligationClient = ReturnType<typeof makeCommitRevealObligationClient>;

/**
 * Builds a client for `CommitRevealObligation`.
 *
 * The client covers both phases: submitting a commitment with a native-token
 * bond, then revealing matching payload data to create a fulfillment
 * attestation and reclaim the bond.
 */
export const makeCommitRevealObligationClient = (viemClient: ViemClient, addresses: CommitRevealAddresses) => {
  const contractAddress = addresses.commitRevealObligation;
  const abi = commitRevealObligationAbi.abi;

  const decode = (obligationData: `0x${string}`) => {
    return decodeAbiParameters([commitRevealDataType], obligationData)[0];
  };

  const decodeDemand = (demandData: `0x${string}`) => {
    return decodeAbiParameters([commitRevealDemandType], demandData)[0];
  };

  const getSchema = async () =>
    await viemClient.readContract({
      address: contractAddress,
      abi,
      functionName: "ATTESTATION_SCHEMA",
    });

  return {
    /** CommitRevealObligation contract address. */
    address: contractAddress,

    /** Encodes reveal data for use as obligation attestation bytes. */
    encode: (data: CommitRevealObligationData) => {
      return encodeAbiParameters([commitRevealDataType], [data]);
    },
    /** Decodes obligation attestation bytes into reveal data. */
    decode,

    /** Encodes arbiter demand data requiring an exact committed bond amount and reveal deadline. */
    encodeDemand: (data: CommitRevealDemandData) => {
      return encodeAbiParameters([commitRevealDemandType], [data]);
    },
    /** Decodes arbiter demand bytes. */
    decodeDemand,

    /** Reveals committed data and creates a fulfillment attestation for `refUID`. */
    doObligation: async (
      data: CommitRevealObligationData,
      refUID: `0x${string}` = "0x0000000000000000000000000000000000000000000000000000000000000000",
    ) => {
      const { request } = await viemClient.simulateContract({
        address: contractAddress,
        abi,
        functionName: "doObligation",
        args: [data, refUID],
      });

      const hash = await viemClient.writeContract(request);
      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },

    /** Reveals committed data and creates the fulfillment attestation for an explicit recipient. */
    doObligationFor: async (
      data: CommitRevealObligationData,
      recipient: `0x${string}`,
      refUID: `0x${string}` = "0x0000000000000000000000000000000000000000000000000000000000000000",
    ) => {
      const { request } = await viemClient.simulateContract({
        address: contractAddress,
        abi,
        functionName: "doObligationFor",
        args: [data, recipient, refUID],
      });

      const hash = await viemClient.writeContract(request);
      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },

    /** Creates a raw obligation attestation using pre-encoded data. */
    doObligationRaw: async (
      data: `0x${string}`,
      expirationTime: bigint = 0n,
      refUID: `0x${string}` = "0x0000000000000000000000000000000000000000000000000000000000000000",
      value: bigint = 0n,
    ) => {
      assertDeployedContract(contractAddress, "CommitRevealObligation");
      const { request } = await viemClient.simulateContract({
        address: contractAddress,
        abi,
        functionName: "doObligationRaw",
        args: [data, expirationTime, refUID],
        value,
      });

      const hash = await viemClient.writeContract(request);
      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },

    /** Reveals committed data and collects the referenced escrow in the same transaction. */
    revealAndCollect: async (
      data: CommitRevealObligationData,
      recipient: `0x${string}`,
      escrowContract: `0x${string}`,
      escrowUid: `0x${string}`,
    ) => {
      const { request, result } = await viemClient.simulateContract({
        address: contractAddress,
        abi,
        functionName: "revealAndCollect",
        args: [data, recipient, escrowContract, escrowUid],
      });

      const hash = await viemClient.writeContract(request);
      return { hash, result };
    },

    /** Submits a commitment hash, locks `bondAmount`, and records the demand reveal deadline. */
    commit: async (commitment: `0x${string}`, bondAmount: bigint, commitDeadline: bigint) => {
      assertDeployedContract(contractAddress, "CommitRevealObligation");
      const { request } = await viemClient.simulateContract({
        address: contractAddress,
        abi,
        functionName: "commit",
        args: [commitment, commitDeadline],
        value: bondAmount,
      });

      const hash = await viemClient.writeContract(request);
      return { hash };
    },

    /** Computes the commitment hash expected by the Solidity contract. */
    computeCommitment: async (
      refUID: `0x${string}`,
      claimer: `0x${string}`,
      data: CommitRevealObligationData,
    ) => {
      return await viemClient.readContract({
        address: contractAddress,
        abi,
        functionName: "computeCommitment",
        args: [claimer, refUID, data],
      });
    },

    /** Slashes an unrevealed commitment after its reveal deadline has passed. */
    slashBond: async (commitment: `0x${string}`) => {
      const { request } = await viemClient.simulateContract({
        address: contractAddress,
        abi,
        functionName: "slashBond",
        args: [commitment],
      });

      const hash = await viemClient.writeContract(request);
      return { hash };
    },

    /** Reads the configured recipient of slashed commitment bonds. */
    getSlashedBondRecipient: async () =>
      await viemClient.readContract({
        address: contractAddress,
        abi,
        functionName: "slashedBondRecipient",
      }),

    /** Reads raw commitment metadata for a commitment hash. */
    getCommitment: async (commitment: `0x${string}`) =>
      await viemClient.readContract({
        address: contractAddress,
        abi,
        functionName: "commitments",
        args: [commitment],
      }),

    /** Returns whether a commitment bond has already been returned or slashed. */
    isCommitmentClaimed: async (commitment: `0x${string}`) =>
      await viemClient.readContract({
        address: contractAddress,
        abi,
        functionName: "commitmentClaimed",
        args: [commitment],
      }),

    /** Reads this obligation contract's EAS schema UID. */
    getSchema,

    /** Loads a fulfillment attestation and decodes its commit-reveal data. */
    getObligation: async (uid: `0x${string}`) => {
      const [attestation, schema] = await Promise.all([getAttestation(viemClient, uid, addresses), getSchema()]);

      if (attestation.schema !== schema) {
        throw new Error(`Unsupported schema: ${attestation.schema}`);
      }
      const data = decodeAbiParameters([commitRevealDataType], attestation.data)[0];

      return {
        ...attestation,
        data,
      };
    },
  };
};
