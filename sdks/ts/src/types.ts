import type { BlockNumber, BlockTag, Hex } from "viem";

/** Addresses for all deployed Alkahest contracts on a chain. */
export type ChainAddresses = {
  eas: `0x${string}`;
  easSchemaRegistry: `0x${string}`;

  erc20EscrowObligation: `0x${string}`;
  erc20UnconditionalEscrowObligation: `0x${string}`;
  erc20PaymentObligation: `0x${string}`;
  erc20AtomicPaymentUtils: `0x${string}`;

  erc721EscrowObligation: `0x${string}`;
  erc721UnconditionalEscrowObligation: `0x${string}`;
  erc721PaymentObligation: `0x${string}`;
  erc721AtomicPaymentUtils: `0x${string}`;

  erc1155EscrowObligation: `0x${string}`;
  erc1155UnconditionalEscrowObligation: `0x${string}`;
  erc1155AtomicPaymentUtils: `0x${string}`;
  erc1155PaymentObligation: `0x${string}`;

  tokenBundleEscrowObligation: `0x${string}`;
  tokenBundleUnconditionalEscrowObligation: `0x${string}`;
  tokenBundlePaymentObligation: `0x${string}`;
  tokenBundleAtomicPaymentUtils: `0x${string}`;

  attestationEscrowObligation: `0x${string}`;
  attestationUnconditionalEscrowObligation: `0x${string}`;
  attestationReferenceEscrowObligation: `0x${string}`;
  attestationReferenceUnconditionalEscrowObligation: `0x${string}`;
  atomicAttestationUtils: `0x${string}`;

  hookEscrowObligation: `0x${string}`;
  hooksEscrowObligation: `0x${string}`;
  erc20EscrowHook: `0x${string}`;
  erc721EscrowHook: `0x${string}`;
  erc1155EscrowHook: `0x${string}`;
  nativeTokenEscrowHook: `0x${string}`;
  attestationEscrowHook: `0x${string}`;
  attestationReferenceEscrowHook: `0x${string}`;

  erc20Splitter: `0x${string}`;
  erc1155Splitter: `0x${string}`;
  nativeTokenSplitter: `0x${string}`;
  tokenBundleSplitter: `0x${string}`;
  tokenBundleSplitterUnvalidated: `0x${string}`;
  commitmentERC20Splitter: `0x${string}`;
  commitmentERC1155Splitter: `0x${string}`;
  commitmentNativeTokenSplitter: `0x${string}`;
  commitmentTokenBundleSplitter: `0x${string}`;
  commitmentTokenBundleSplitterUnvalidated: `0x${string}`;

  stringObligation: `0x${string}`;
  commitRevealObligation: `0x${string}`;

  trivialArbiter: `0x${string}`;
  trustedOracleArbiter: `0x${string}`;
  commitmentTrustedOracleArbiter: `0x${string}`;
  anyArbiter: `0x${string}`;
  allArbiter: `0x${string}`;
  intrinsicsArbiter: `0x${string}`;
  erc8004Arbiter: `0x${string}`;
  referencesEscrowArbiter: `0x${string}`;

  // Confirmation arbiters (new naming convention)
  exclusiveRevocableConfirmationArbiter: `0x${string}`;
  exclusiveUnrevocableConfirmationArbiter: `0x${string}`;
  nonexclusiveRevocableConfirmationArbiter: `0x${string}`;
  nonexclusiveUnrevocableConfirmationArbiter: `0x${string}`;
  nativeTokenEscrowObligation: `0x${string}`;
  nativeTokenUnconditionalEscrowObligation: `0x${string}`;
  nativeTokenPaymentObligation: `0x${string}`;
  nativeTokenAtomicPaymentUtils: `0x${string}`;

  // Attestation Properties Arbiters
  recipientArbiter: `0x${string}`;
  attesterArbiter: `0x${string}`;
  schemaArbiter: `0x${string}`;
  uidArbiter: `0x${string}`;
  refUidArbiter: `0x${string}`;
  revocableArbiter: `0x${string}`;
  timeAfterArbiter: `0x${string}`;
  timeBeforeArbiter: `0x${string}`;
  timeEqualArbiter: `0x${string}`;
  expirationTimeAfterArbiter: `0x${string}`;
  expirationTimeBeforeArbiter: `0x${string}`;
  expirationTimeEqualArbiter: `0x${string}`;
};

/** EIP-2612 permit signature used by ERC20 helper flows. */
export type PermitSignature = {
  deadline: bigint;
  v: number;
  r: `0x${string}`;
  s: `0x${string}`;
};

/** Parameters needed to sign an ERC20 permit. */
export type SignPermitProps = {
  /** Address of the token to approve */
  contractAddress: Hex;
  /** Name of the token to approve.
   * Corresponds to the `name` method on the ERC-20 contract. Please note this must match exactly byte-for-byte */
  erc20Name: string;
  /** Owner of the tokens. Usually the currently connected address. */
  ownerAddress: Hex;
  /** Address to grant allowance to */
  spenderAddress: Hex;
  /** Expiration of this approval, in SECONDS */
  deadline: bigint;
  /** Numerical chainId of the token contract */
  chainId: number;
  /** Defaults to 1. Some tokens need a different version, check the [PERMIT INFORMATION](https://github.com/vacekj/wagmi-permit/blob/main/PERMIT.md) for more information */
  permitVersion?: string;
  /** Permit nonce for the specific address and token contract. You can get the nonce from the `nonces` method on the token contract. */
  nonce: bigint;
};

/** ERC20 permit parameters including the approved value. */
export type Eip2612Props = SignPermitProps & {
  /** Amount to approve */
  value: bigint;
};

/** ERC20 token amount used by payment and escrow helpers. */
export type Erc20 = {
  /** ERC20 token contract address. */
  address: `0x${string}`;
  /** Token amount in the ERC20's smallest unit. */
  value: bigint;
};

/** ERC721 token used by payment and escrow helpers. */
export type Erc721 = {
  /** ERC721 token contract address. */
  address: `0x${string}`;
  /** ERC721 token ID. */
  id: bigint;
};

/** ERC1155 token amount used by payment and escrow helpers. */
export type Erc1155 = {
  /** ERC1155 token contract address. */
  address: `0x${string}`;
  /** ERC1155 token ID. */
  id: bigint;
  /** Token amount. */
  value: bigint;
};

/** Arbiter address plus arbiter-specific demand bytes. */
export type Demand = {
  /** Arbiter contract address. */
  arbiter: `0x${string}`;
  /** Arbiter-specific ABI-encoded demand data. */
  demand: `0x${string}`;
};

/** Mixed token bundle used by payment and escrow helpers. */
export type TokenBundle = {
  /** Native token amount, or zero/omitted for no native token leg. */
  nativeAmount?: bigint;
  erc20s: Erc20[];
  erc721s: Erc721[];
  erc1155s: Erc1155[];
};

/** Flattened token bundle shape matching Solidity bundle obligation structs. */
export type TokenBundleFlat = {
  nativeAmount: bigint;
  erc20Tokens: `0x${string}`[];
  erc20Amounts: bigint[];

  erc721Tokens: `0x${string}`[];
  erc721TokenIds: bigint[];

  erc1155Tokens: `0x${string}`[];
  erc1155TokenIds: bigint[];
  erc1155Amounts: bigint[];
};

/** Approval target category understood by SDK token utility clients. */
export type ApprovalPurpose = "escrow" | "payment" | "atomicPayment";

/** EAS attestation shape returned by SDK helpers. */
export type Attestation = {
  /** Attestation UID. */
  uid: `0x${string}`;
  /** Schema UID. */
  schema: `0x${string}`;
  /** Creation timestamp in seconds. */
  time: bigint;
  /** Expiration timestamp in seconds, or zero for no expiration. */
  expirationTime: bigint;
  /** Revocation timestamp in seconds, or zero if not revoked. */
  revocationTime: bigint;
  /** Referenced attestation UID. */
  refUID: `0x${string}`;
  /** EAS recipient address. */
  recipient: `0x${string}`;
  /** EAS attester address. */
  attester: `0x${string}`;
  /** Whether the attestation can be revoked. */
  revocable: boolean;
  /** ABI-encoded attestation data. */
  data: `0x${string}`;
};

/** Time-related filters for trusted-oracle batch arbitration. */
export interface TimeFilters {
  /** Only process attestations after this timestamp (Unix timestamp in seconds) */
  minTime?: bigint;
  /** Only process attestations before this timestamp (Unix timestamp in seconds) */
  maxTime?: bigint;
  /** Skip attestations past their expiration time */
  excludeExpired?: boolean;
  /** Only process attestations older than this duration (seconds) */
  minAge?: bigint;
  /** Only process attestations newer than this duration (seconds) */
  maxAge?: bigint;
}

/** Attestation-property filters for trusted-oracle batch arbitration. */
export interface AttestationFilters {
  /** Only process attestations from specific attester */
  specificAttester?: string;
  /** Skip attestations from these attesters */
  excludeAttesters?: string[];
  /** Only process attestations for specific recipient */
  specificRecipient?: string;
  /** Skip revoked attestations */
  excludeRevoked?: boolean;
  /** Only process attestations with reference UID */
  requireRefUID?: boolean;
  /** Only process attestations with specific schema */
  specificSchema?: string;
}

/** Block-range filters for trusted-oracle batch arbitration. */
export interface BlockFilters {
  /** Start from specific block number or block tag */
  fromBlock?: BlockNumber | BlockTag;
  /** End at specific block number or block tag */
  toBlock?: BlockNumber | BlockTag;
  /** Limit the block range to prevent timeouts */
  maxBlockRange?: bigint;
}

/** Batch sizing and ordering options for trusted-oracle batch arbitration. */
export interface BatchFilters {
  /** Limit number of obligations to process */
  maxObligations?: number;
  /** Process recent attestations first */
  prioritizeRecent?: boolean;
  /** Process in batches of this size */
  batchSize?: number;
}

/** Execution and validation options for trusted-oracle batch arbitration. */
export interface PerformanceFilters {
  /** Skip if estimated gas exceeds limit */
  maxGasPerTx?: bigint;
  /** Only simulate, don't execute transactions */
  dryRun?: boolean;
  /** Skip validation for faster processing */
  skipValidation?: boolean;
}

/** Combined filters accepted by enhanced trusted-oracle arbitration helpers. */
export interface EnhancedArbitrateFilters
  extends TimeFilters,
    AttestationFilters,
    BlockFilters,
    BatchFilters,
    PerformanceFilters {
  /** Only arbitrate if escrow demands current oracle */
  onlyIfEscrowDemandsCurrentOracle?: boolean;
  /** Skip obligations that have already been arbitrated */
  skipAlreadyArbitrated?: boolean;
}

// =====================================
// Native Token Arbitration Types
// =====================================

/**
 * Basic native token transfer arbitration request
 * Oracles can verify if a native token transfer occurred with specific criteria
 */
export interface NativeTokenTransferArbitrationRequest {
  type: "native_token_transfer";
  /** Minimum native token amount that must be transferred (in wei) */
  minAmount: bigint;
  /** Address that should receive the native token */
  recipient: `0x${string}`;
  /** Address that should send the native token (optional) */
  sender?: `0x${string}`;
  /** Block number after which the transfer should occur (optional) */
  afterBlock?: bigint;
  /** Block number before which the transfer should occur (optional) */
  beforeBlock?: bigint;
  /** Specific transaction hash to verify (optional) */
  txHash?: `0x${string}`;
}

/**
 * Native token balance arbitration request
 * Oracles can verify if an address has a minimum native token balance
 */
export interface NativeTokenBalanceArbitrationRequest {
  type: "native_token_balance";
  /** Address to check balance for */
  address: `0x${string}`;
  /** Minimum balance required (in wei) */
  minBalance: bigint;
  /** Block number at which to check balance (optional, defaults to latest) */
  atBlock?: bigint;
}

/**
 * Native token payment arbitration request
 * Oracles can verify if a payment was made from payer to payee
 */
export interface NativeTokenPaymentArbitrationRequest {
  type: "native_token_payment";
  /** Amount to be paid (in wei) */
  amount: bigint;
  /** Address that should make the payment */
  payer: `0x${string}`;
  /** Address that should receive the payment */
  payee: `0x${string}`;
  /** Time window for the payment (optional) */
  timeWindow?: {
    afterBlock?: bigint;
    beforeBlock?: bigint;
  };
  /** Specific transaction hash to verify (optional) */
  txHash?: `0x${string}`;
}

/**
 * Native token escrow arbitration request
 * Oracles can verify escrow conditions are met
 */
export interface NativeTokenEscrowArbitrationRequest {
  type: "native_token_escrow";
  /** Total amount in escrow (in wei) */
  totalAmount: bigint;
  /** Parties involved in the escrow */
  parties: Array<{
    address: `0x${string}`;
    amount: bigint;
    role: "depositor" | "beneficiary" | "arbiter";
  }>;
  /** Escrow conditions */
  conditions: {
    /** Whether all deposits are required */
    requireAllDeposits: boolean;
    /** Minimum number of depositors */
    minDepositors: number;
    /** Release conditions */
    releaseConditions?: string[];
  };
  /** Time window for escrow (optional) */
  timeWindow?: {
    afterBlock?: bigint;
    beforeBlock?: bigint;
  };
}

/**
 * Union type for all native token arbitration request types
 */
export type NativeTokenArbitrationRequest =
  | NativeTokenTransferArbitrationRequest
  | NativeTokenBalanceArbitrationRequest
  | NativeTokenPaymentArbitrationRequest
  | NativeTokenEscrowArbitrationRequest;

/**
 * Result of native token arbitration processing
 */
export interface NativeTokenArbitrationResult {
  /** The original request that was processed */
  request: NativeTokenArbitrationRequest;
  /** Whether the arbitration conditions are satisfied */
  decision: boolean;
  /** Oracle that made the decision */
  oracle: `0x${string}`;
  /** Block number when decision was made */
  blockNumber: bigint;
  /** Timestamp when decision was made */
  timestamp: bigint;
  /** Additional evidence or reasoning */
  evidence?: {
    /** Transaction hashes related to the decision */
    transactionHashes?: `0x${string}`[];
    /** Balances checked during arbitration */
    balances?: Record<`0x${string}`, bigint>;
    /** Block numbers relevant to the decision */
    relevantBlocks?: bigint[];
    /** Human-readable reasoning */
    reasoning?: string;
    /** Any additional metadata */
    metadata?: Record<string, any>;
  };
}

/**
 * Context for tracking native token arbitration requests
 */
export interface NativeTokenArbitrationContext {
  /** The arbitration request */
  request: NativeTokenArbitrationRequest;
  /** Address that submitted the request */
  requester: `0x${string}`;
  /** Timestamp when request was created */
  createdAt: bigint;
  /** Oracle assigned to handle the request (optional) */
  assignedOracle?: `0x${string}`;
  /** Status of the request */
  status: "pending" | "in_progress" | "completed" | "rejected";
  /** Unique identifier for the request */
  requestId: `0x${string}`;
}

// Type aliases for backward compatibility with ETH naming
export type EthTransferArbitrationRequest = NativeTokenTransferArbitrationRequest;
export type EthBalanceArbitrationRequest = NativeTokenBalanceArbitrationRequest;
export type EthArbitrationRequest = NativeTokenArbitrationRequest;
export type EthArbitrationResult = NativeTokenArbitrationResult;
export type EthArbitrationContext = NativeTokenArbitrationContext;
