import {
  type AbiParameter,
  type Account,
  type Chain,
  type DecodeAbiParametersReturnType,
  decodeAbiParameters,
  type PublicActions,
  parseAbiItem,
  parseAbiParameters,
  parseEventLogs,
  publicActions,
  type Transport,
  type WalletClient,
} from "viem";
import { makeArbitersClient } from "./clients/arbiters";
import { contractAddresses as defaultContractAddresses, supportedChains } from "./config";
import { abi as easAbi } from "./contracts/IEAS";
import { makeDefaultExtension } from "./extensions";
import type { ChainAddresses, Demand } from "./types";
import {
  type DecodedDemandResult,
  type DecodersRecord,
  decodeDemandWithAddresses,
  getAttestation,
  getOptimalPollingInterval,
} from "./utils";

// Utility type to flatten intersection types for better readability and inference
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// Base client properties that cannot be overridden by extensions
type ClientBase<T extends object> = T;

// Extended type that disallows redefining base properties (following viem's pattern)
type Extended<T extends object = object> = Prettify<
  { [K in keyof T]?: undefined } & {
    [key: string]: unknown;
  }
>;

// ExtendableClient type with proper type inference across multiple .extend() calls
// Uses `const` modifier and `Prettify` to preserve literal types (following viem's pattern)
type ExtendableClient<
  T extends object,
  TExtended extends Extended<T> | undefined = undefined,
> = ClientBase<T> &
  (TExtended extends Extended<T> ? TExtended : unknown) & {
    extend: <const U extends Extended<T>>(
      extender: (client: ExtendableClient<T, TExtended>) => U,
    ) => ExtendableClient<T, Prettify<U> & (TExtended extends Extended<T> ? TExtended : unknown)>;
  };

// Base client type (without extensions)
export type MinimalClient = ExtendableClient<{
  viemClient: WalletClient<Transport, Chain, Account> & PublicActions<Transport, Chain, Account>;
  makeExtendableClient: typeof makeExtendableClient;
  address: `0x${string}`;
  contractAddresses: ChainAddresses;
  getAttestation: (uid: `0x${string}`) => ReturnType<typeof getAttestation>;
  getAttestedEventFromTxHash: (hash: `0x${string}`) => Promise<{
    recipient: `0x${string}`;
    attester: `0x${string}`;
    uid: `0x${string}`;
    schemaUID: `0x${string}`;
  }>;
  waitForFulfillment: (
    contractAddress: `0x${string}`,
    buyAttestation: `0x${string}`,
    pollingInterval?: number,
  ) => Promise<{
    payment?: `0x${string}` | undefined;
    fulfillment?: `0x${string}` | undefined;
    fulfiller?: `0x${string}` | undefined;
  }>;
  extractObligationData: <ObligationData extends readonly AbiParameter[]>(
    obligationAbi: ObligationData,
    attestation: { data: `0x${string}` },
  ) => DecodeAbiParametersReturnType<ObligationData>;
  getEscrowAttestation: (fulfillment: { refUID: `0x${string}` }) => ReturnType<typeof getAttestation>;
  decodeEscrowCondition: (
    escrowAttestation: { data: `0x${string}` },
    extraDecoders?: Partial<DecodersRecord>,
  ) => Demand & { decoded: DecodedDemandResult };
  decodeDemand: (demand: Demand, extraDecoders?: Partial<DecodersRecord>) => DecodedDemandResult;
}>;

// Type for the default extensions
type DefaultExtensions = ReturnType<typeof makeDefaultExtension>;

// Helper to get the base type from MinimalClient
type MinimalClientBase = MinimalClient extends ExtendableClient<infer T extends object, any> ? T : never;

// Full client type with default extensions - properly typed to preserve extensions across .extend() calls
export type AlkahestClient = ExtendableClient<MinimalClientBase, Prettify<DefaultExtensions>>;

// Helper function to create extendable clients (following viem's pattern)
function makeExtendableClient<T extends object, TExtended extends Extended<T> | undefined = undefined>(
  base: T,
): ExtendableClient<T, TExtended> {
  type ExtendFn = (base: typeof client) => Extended<T>;

  const client = base as ExtendableClient<T, TExtended>;

  function extend(current: typeof client) {
    return (extendFn: ExtendFn) => {
      const extensions = extendFn(current) as Extended<T>;
      // Remove any base keys from extensions to avoid conflicts
      for (const key in base) delete extensions[key];
      const combined = { ...current, ...extensions };
      return Object.assign(combined, { extend: extend(combined as any) });
    };
  }

  return Object.assign(client, { extend: extend(client) as any }) as ExtendableClient<T, TExtended>;
}

/**
 * Creates an Alkahest client for interacting with the protocol
 * @param walletClient - Viem wallet client object
 * @param contractAddresses - Optional custom contract addresses (useful for local testing)
 * @returns Client object with methods for interacting with different token standards and attestations
 *
 * @example
 * ```ts
 * const client = makeClient(
 *   privateKeyToAccount(process.env.PRIVKEY as `0x${string}`, {
 *     nonceManager, // automatic nonce management
 *   })
 * );
 * ```
 */
export const makeClient = (
  walletClient: WalletClient<Transport, Chain, Account>,
  contractAddresses?: Partial<ChainAddresses>,
): AlkahestClient => {
  const client = makeMinimalClient(walletClient, contractAddresses);
  return client.extend(makeDefaultExtension) as AlkahestClient;
};

/**
 * Creates a minimal Alkahest client with only core functionality
 * @param walletClient - Viem wallet client object
 * @param contractAddresses - Optional custom contract addresses (useful for local testing)
 * @returns Minimal client object that can be extended with additional functionality
 *
 * @example
 * ```ts
 * // Create minimal client
 * const baseClient = makeMinimalClient(walletClient);
 *
 * // Extend with default functionality
 * const fullClient = baseClient.extend(makeDefaultExtension);
 *
 * // Or extend with custom functionality
 * const customClient = baseClient.extend((client) => ({
 *   erc20: makeErc20Client(client.viemClient, client.contractAddresses),
 *   customMethod: () => "custom functionality"
 * }));
 * ```
 */

export const makeMinimalClient = (
  walletClient: WalletClient<Transport, Chain, Account>,
  contractAddresses?: Partial<ChainAddresses>,
): MinimalClient => {
  const viemClient = walletClient.extend(publicActions);

  // Determine base addresses to use
  let baseAddresses: ChainAddresses | undefined;
  if (supportedChains.includes(viemClient.chain.name)) {
    baseAddresses = defaultContractAddresses[viemClient.chain.name as keyof typeof defaultContractAddresses];
  }

  if (!baseAddresses && !contractAddresses) {
    throw new Error(
      `Chain "${viemClient.chain.name}" is not supported and no custom contract addresses were provided.`,
    );
  }

  // Create a full ChainAddresses object with zero address fallbacks
  const zeroAddress = "0x0000000000000000000000000000000000000000" as const;
  const addresses: ChainAddresses = {
    eas: contractAddresses?.eas || baseAddresses?.eas || zeroAddress,
    easSchemaRegistry: contractAddresses?.easSchemaRegistry || baseAddresses?.easSchemaRegistry || zeroAddress,

    erc20EscrowObligation:
      contractAddresses?.erc20EscrowObligation || baseAddresses?.erc20EscrowObligation || zeroAddress,
    erc20UnconditionalEscrowObligation:
      contractAddresses?.erc20UnconditionalEscrowObligation ||
      baseAddresses?.erc20UnconditionalEscrowObligation ||
      zeroAddress,
    erc20PaymentObligation:
      contractAddresses?.erc20PaymentObligation || baseAddresses?.erc20PaymentObligation || zeroAddress,
    erc20AtomicPaymentUtils: contractAddresses?.erc20AtomicPaymentUtils || baseAddresses?.erc20AtomicPaymentUtils || zeroAddress,

    erc721EscrowObligation:
      contractAddresses?.erc721EscrowObligation || baseAddresses?.erc721EscrowObligation || zeroAddress,
    erc721UnconditionalEscrowObligation:
      contractAddresses?.erc721UnconditionalEscrowObligation ||
      baseAddresses?.erc721UnconditionalEscrowObligation ||
      zeroAddress,
    erc721PaymentObligation:
      contractAddresses?.erc721PaymentObligation || baseAddresses?.erc721PaymentObligation || zeroAddress,
    erc721AtomicPaymentUtils: contractAddresses?.erc721AtomicPaymentUtils || baseAddresses?.erc721AtomicPaymentUtils || zeroAddress,

    erc1155EscrowObligation:
      contractAddresses?.erc1155EscrowObligation || baseAddresses?.erc1155EscrowObligation || zeroAddress,
    erc1155UnconditionalEscrowObligation:
      contractAddresses?.erc1155UnconditionalEscrowObligation ||
      baseAddresses?.erc1155UnconditionalEscrowObligation ||
      zeroAddress,
    erc1155PaymentObligation:
      contractAddresses?.erc1155PaymentObligation || baseAddresses?.erc1155PaymentObligation || zeroAddress,
    erc1155AtomicPaymentUtils: contractAddresses?.erc1155AtomicPaymentUtils || baseAddresses?.erc1155AtomicPaymentUtils || zeroAddress,

    tokenBundleEscrowObligation:
      contractAddresses?.tokenBundleEscrowObligation || baseAddresses?.tokenBundleEscrowObligation || zeroAddress,
    tokenBundleUnconditionalEscrowObligation:
      contractAddresses?.tokenBundleUnconditionalEscrowObligation ||
      baseAddresses?.tokenBundleUnconditionalEscrowObligation ||
      zeroAddress,
    tokenBundlePaymentObligation:
      contractAddresses?.tokenBundlePaymentObligation || baseAddresses?.tokenBundlePaymentObligation || zeroAddress,
    tokenBundleAtomicPaymentUtils:
      contractAddresses?.tokenBundleAtomicPaymentUtils || baseAddresses?.tokenBundleAtomicPaymentUtils || zeroAddress,

    attestationEscrowObligation:
      contractAddresses?.attestationEscrowObligation || baseAddresses?.attestationEscrowObligation || zeroAddress,
    attestationUnconditionalEscrowObligation:
      contractAddresses?.attestationUnconditionalEscrowObligation ||
      baseAddresses?.attestationUnconditionalEscrowObligation ||
      zeroAddress,
    attestationReferenceEscrowObligation:
      contractAddresses?.attestationReferenceEscrowObligation || baseAddresses?.attestationReferenceEscrowObligation || zeroAddress,
    attestationReferenceUnconditionalEscrowObligation:
      contractAddresses?.attestationReferenceUnconditionalEscrowObligation ||
      baseAddresses?.attestationReferenceUnconditionalEscrowObligation ||
      zeroAddress,
    atomicAttestationUtils:
      contractAddresses?.atomicAttestationUtils || baseAddresses?.atomicAttestationUtils || zeroAddress,

    hookEscrowObligation:
      contractAddresses?.hookEscrowObligation || baseAddresses?.hookEscrowObligation || zeroAddress,
    hooksEscrowObligation:
      contractAddresses?.hooksEscrowObligation || baseAddresses?.hooksEscrowObligation || zeroAddress,
    erc20EscrowHook: contractAddresses?.erc20EscrowHook || baseAddresses?.erc20EscrowHook || zeroAddress,
    erc721EscrowHook: contractAddresses?.erc721EscrowHook || baseAddresses?.erc721EscrowHook || zeroAddress,
    erc1155EscrowHook: contractAddresses?.erc1155EscrowHook || baseAddresses?.erc1155EscrowHook || zeroAddress,
    nativeTokenEscrowHook:
      contractAddresses?.nativeTokenEscrowHook || baseAddresses?.nativeTokenEscrowHook || zeroAddress,
    attestationEscrowHook:
      contractAddresses?.attestationEscrowHook || baseAddresses?.attestationEscrowHook || zeroAddress,
    attestationReferenceEscrowHook:
      contractAddresses?.attestationReferenceEscrowHook ||
      baseAddresses?.attestationReferenceEscrowHook ||
      zeroAddress,

    erc20Splitter: contractAddresses?.erc20Splitter || baseAddresses?.erc20Splitter || zeroAddress,
    erc1155Splitter: contractAddresses?.erc1155Splitter || baseAddresses?.erc1155Splitter || zeroAddress,
    nativeTokenSplitter: contractAddresses?.nativeTokenSplitter || baseAddresses?.nativeTokenSplitter || zeroAddress,
    tokenBundleSplitter: contractAddresses?.tokenBundleSplitter || baseAddresses?.tokenBundleSplitter || zeroAddress,
    tokenBundleSplitterUnvalidated:
      contractAddresses?.tokenBundleSplitterUnvalidated ||
      baseAddresses?.tokenBundleSplitterUnvalidated ||
      zeroAddress,
    commitmentERC20Splitter:
      contractAddresses?.commitmentERC20Splitter || baseAddresses?.commitmentERC20Splitter || zeroAddress,
    commitmentERC1155Splitter:
      contractAddresses?.commitmentERC1155Splitter ||
      baseAddresses?.commitmentERC1155Splitter ||
      zeroAddress,
    commitmentNativeTokenSplitter:
      contractAddresses?.commitmentNativeTokenSplitter ||
      baseAddresses?.commitmentNativeTokenSplitter ||
      zeroAddress,
    commitmentTokenBundleSplitter:
      contractAddresses?.commitmentTokenBundleSplitter ||
      baseAddresses?.commitmentTokenBundleSplitter ||
      zeroAddress,
    commitmentTokenBundleSplitterUnvalidated:
      contractAddresses?.commitmentTokenBundleSplitterUnvalidated ||
      baseAddresses?.commitmentTokenBundleSplitterUnvalidated ||
      zeroAddress,

    stringObligation: contractAddresses?.stringObligation || baseAddresses?.stringObligation || zeroAddress,
    commitRevealObligation:
      contractAddresses?.commitRevealObligation || baseAddresses?.commitRevealObligation || zeroAddress,

    nativeTokenPaymentObligation:
      contractAddresses?.nativeTokenPaymentObligation || baseAddresses?.nativeTokenPaymentObligation || zeroAddress,
    nativeTokenEscrowObligation:
      contractAddresses?.nativeTokenEscrowObligation || baseAddresses?.nativeTokenEscrowObligation || zeroAddress,
    nativeTokenUnconditionalEscrowObligation:
      contractAddresses?.nativeTokenUnconditionalEscrowObligation ||
      baseAddresses?.nativeTokenUnconditionalEscrowObligation ||
      zeroAddress,

    trivialArbiter: contractAddresses?.trivialArbiter || baseAddresses?.trivialArbiter || zeroAddress,
    trustedOracleArbiter: contractAddresses?.trustedOracleArbiter || baseAddresses?.trustedOracleArbiter || zeroAddress,
    commitmentTrustedOracleArbiter:
      contractAddresses?.commitmentTrustedOracleArbiter ||
      baseAddresses?.commitmentTrustedOracleArbiter ||
      zeroAddress,
    intrinsicsArbiter: contractAddresses?.intrinsicsArbiter || baseAddresses?.intrinsicsArbiter || zeroAddress,
    anyArbiter: contractAddresses?.anyArbiter || baseAddresses?.anyArbiter || zeroAddress,
    allArbiter: contractAddresses?.allArbiter || baseAddresses?.allArbiter || zeroAddress,
    erc8004Arbiter: contractAddresses?.erc8004Arbiter || baseAddresses?.erc8004Arbiter || zeroAddress,
    referencesEscrowArbiter:
      contractAddresses?.referencesEscrowArbiter || baseAddresses?.referencesEscrowArbiter || zeroAddress,
    nativeTokenAtomicPaymentUtils:
      contractAddresses?.nativeTokenAtomicPaymentUtils || baseAddresses?.nativeTokenAtomicPaymentUtils || zeroAddress,

    // Confirmation arbiters (new naming convention)
    exclusiveRevocableConfirmationArbiter:
      contractAddresses?.exclusiveRevocableConfirmationArbiter ||
      baseAddresses?.exclusiveRevocableConfirmationArbiter ||
      zeroAddress,
    exclusiveUnrevocableConfirmationArbiter:
      contractAddresses?.exclusiveUnrevocableConfirmationArbiter ||
      baseAddresses?.exclusiveUnrevocableConfirmationArbiter ||
      zeroAddress,
    nonexclusiveRevocableConfirmationArbiter:
      contractAddresses?.nonexclusiveRevocableConfirmationArbiter ||
      baseAddresses?.nonexclusiveRevocableConfirmationArbiter ||
      zeroAddress,
    nonexclusiveUnrevocableConfirmationArbiter:
      contractAddresses?.nonexclusiveUnrevocableConfirmationArbiter ||
      baseAddresses?.nonexclusiveUnrevocableConfirmationArbiter ||
      zeroAddress,

    // Attestation Properties Arbiters
    recipientArbiter: contractAddresses?.recipientArbiter || baseAddresses?.recipientArbiter || zeroAddress,
    attesterArbiter: contractAddresses?.attesterArbiter || baseAddresses?.attesterArbiter || zeroAddress,
    schemaArbiter: contractAddresses?.schemaArbiter || baseAddresses?.schemaArbiter || zeroAddress,
    uidArbiter: contractAddresses?.uidArbiter || baseAddresses?.uidArbiter || zeroAddress,
    refUidArbiter: contractAddresses?.refUidArbiter || baseAddresses?.refUidArbiter || zeroAddress,
    revocableArbiter: contractAddresses?.revocableArbiter || baseAddresses?.revocableArbiter || zeroAddress,
    timeAfterArbiter: contractAddresses?.timeAfterArbiter || baseAddresses?.timeAfterArbiter || zeroAddress,
    timeBeforeArbiter: contractAddresses?.timeBeforeArbiter || baseAddresses?.timeBeforeArbiter || zeroAddress,
    timeEqualArbiter: contractAddresses?.timeEqualArbiter || baseAddresses?.timeEqualArbiter || zeroAddress,
    expirationTimeAfterArbiter:
      contractAddresses?.expirationTimeAfterArbiter || baseAddresses?.expirationTimeAfterArbiter || zeroAddress,
    expirationTimeBeforeArbiter:
      contractAddresses?.expirationTimeBeforeArbiter || baseAddresses?.expirationTimeBeforeArbiter || zeroAddress,
    expirationTimeEqualArbiter:
      contractAddresses?.expirationTimeEqualArbiter || baseAddresses?.expirationTimeEqualArbiter || zeroAddress,
  };

  const client = {
    /** The underlying Viem client */
    viemClient,

    makeExtendableClient,

    /** Address of the account used to create this client */
    address: viemClient.account.address,

    /** Contract addresses being used */
    contractAddresses: addresses,

    /**
     * Retrieves an attestation by its UID
     * @param uid - The unique identifier of the attestation
     * @returns The attestation data
     */
    getAttestation: async (uid: `0x${string}`) => {
      return await getAttestation(viemClient, uid, addresses);
    },

    /**
     * Gets an attestation from a transaction hash
     * @param hash - The transaction hash
     * @returns The attestation event args
     */
    getAttestedEventFromTxHash: async (hash: `0x${string}`) => {
      const tx = await viemClient.waitForTransactionReceipt({ hash });
      const events = parseEventLogs({
        abi: easAbi.abi,
        eventName: "Attested",
        logs: tx.logs,
      });
      if (!events[0]) throw new Error("No Attested event found in transaction");
      return events[0].args;
    },

    /**
     * Waits for an escrow to be fulfilled
     * @param contractAddress - The address of the escrow contract
     * @param buyAttestation - The UID of the buy attestation
     * @returns Object containing payment, fulfillment and fulfiller details
     *
     * @example
     * ```ts
     * // Wait for fulfillment of an escrow
     * const fulfillment = await client.waitForFulfillment(
     *   contractAddresses.erc20EscrowObligation,
     *   escrow.attested.uid,
     * );
     * ```
     */
    waitForFulfillment: async (
      contractAddress: `0x${string}`,
      buyAttestation: `0x${string}`,
      pollingInterval?: number,
    ): Promise<{
      payment?: `0x${string}` | undefined;
      fulfillment?: `0x${string}` | undefined;
      fulfiller?: `0x${string}` | undefined;
    }> => {
      const fulfillmentEvent = parseAbiItem(
        "event EscrowCollected(bytes32 indexed escrow, bytes32 indexed fulfillment, address indexed fulfiller)",
      );
      const logs = await viemClient.getLogs({
        address: contractAddress,
        event: fulfillmentEvent,
        args: { escrow: buyAttestation },
        fromBlock: "earliest",
        toBlock: "latest",
      });

      if (logs.length && logs[0])
        return {
          payment: logs[0].args.escrow,
          fulfillment: logs[0].args.fulfillment,
          fulfiller: logs[0].args.fulfiller,
        };

      // Use optimal polling interval based on transport type
      const optimalInterval = getOptimalPollingInterval(viemClient, pollingInterval);

      return new Promise((resolve) => {
        const unwatch = viemClient.watchEvent({
          address: contractAddress,
          event: fulfillmentEvent,
          args: { escrow: buyAttestation },
          onLogs: (logs) => {
            if (!logs[0]) return;
            resolve({
              payment: logs[0].args.escrow,
              fulfillment: logs[0].args.fulfillment,
              fulfiller: logs[0].args.fulfiller,
            });
            unwatch();
          },
          pollingInterval: optimalInterval,
        });
      });
    },

    /**
     * Extract obligation data from a fulfillment attestation
     * @param obligationAbi - ABI parameters for the obligation data
     * @param attestation - The attestation containing the obligation data
     * @returns Decoded obligation data
     *
     * @example
     * ```ts
     * import { parseAbiParameters } from "viem";
     *
     * const obligationAbi = parseAbiParameters("(string item)");
     * const obligation = client.extractObligationData(obligationAbi, attestation);
     * ```
     */
    extractObligationData: <ObligationData extends readonly AbiParameter[]>(
      obligationAbi: ObligationData,
      attestation: { data: `0x${string}` },
    ): DecodeAbiParametersReturnType<ObligationData> => {
      return decodeAbiParameters(obligationAbi, attestation.data);
    },

    /**
     * Get the escrow attestation that this fulfillment references via refUID
     * @param fulfillment - The fulfillment attestation
     * @returns The escrow attestation
     *
     * @example
     * ```ts
     * const escrowAttestation = await client.getEscrowAttestation(fulfillmentAttestation);
     * ```
     */
    getEscrowAttestation: async (fulfillment: { refUID: `0x${string}` }) => {
      return await getAttestation(viemClient, fulfillment.refUID, addresses);
    },

    /**
     * Decode an escrow attestation's condition using the generic arbiter-demand codec registry.
     * @param escrowAttestation - escrow attestation whose data encodes IEscrow condition fields
     * @param extraDecoders - optional extension arbiter decoders keyed by arbiter address
     * @returns raw { arbiter, demand } plus decoded arbiter-specific demand data
     */
    decodeEscrowCondition: (
      escrowAttestation: { data: `0x${string}` },
      extraDecoders: Partial<DecodersRecord> = {},
    ): Demand & { decoded: DecodedDemandResult } => {
      const conditionAbi = parseAbiParameters("(address arbiter, bytes demand)");
      const condition = decodeAbiParameters(conditionAbi, escrowAttestation.data)[0];
      const demand = {
        arbiter: condition.arbiter,
        demand: condition.demand,
      };

      return {
        ...demand,
        decoded: decodeDemandWithAddresses(demand, addresses, extraDecoders),
      };
    },

    /**
     * Decode an arbiter demand using the client's ChainAddresses
     * Recursively decodes nested demands for composing arbiters (All/Any)
     *
     * @param demand - The demand to decode {arbiter: Address, demand: Bytes}
     * @returns Decoded demand with optional children for composing arbiters
     *
     * @example
     * ```ts
     * const decoded = client.decodeDemand({
     *   arbiter: contractAddresses.allArbiter,
     *   demand: "0x..."
     * });
     * console.log(decoded.arbiter); // the arbiter address
     * console.log(decoded.decoded); // the decoded demand data
     * console.log(decoded.children); // nested demands if composing arbiter
     * ```
     */
    decodeDemand: (demand: Demand, extraDecoders: Partial<DecodersRecord> = {}): DecodedDemandResult => {
      return decodeDemandWithAddresses(demand, addresses, extraDecoders);
    },
  };

  return makeExtendableClient(client);
};

// Export test fixtures
export * as fixtures from "../tests/fixtures";
// Export test utilities
export { setupTestEnvironment, type TestContext } from "../tests/utils/setup";
// Main arbiters client - provides both hierarchical and flat APIs
export * from "./clients/arbiters";
export * from "./clients/obligations";
export * from "./clients/splitters";
export * from "./addressIndex";
export * from "./config";
// Export contract ABIs
export * as contracts from "./contracts";
export { deployAlkahest, type DeployFn, type DeployOptions } from "./deploy";
export * from "./extensions";
export * from "./types";
export * from "./utils";
