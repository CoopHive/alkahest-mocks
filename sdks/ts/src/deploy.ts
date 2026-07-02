import type { ChainAddresses } from "./types";

// EAS
import EAS from "./contracts/eas/EAS.json";
import SchemaRegistry from "./contracts/eas/SchemaRegistry.json";

// Arbiters - General
import TrivialArbiter from "./contracts/arbiters/TrivialArbiter.json";
import TrustedOracleArbiter from "./contracts/arbiters/trusted-oracle/TrustedOracleArbiter.json";
import CommitmentTrustedOracleArbiter from "./contracts/arbiters/trusted-oracle/CommitmentTrustedOracleArbiter.json";
import IntrinsicsArbiter from "./contracts/arbiters/IntrinsicsArbiter.json";
import ERC8004Arbiter from "./contracts/arbiters/ERC8004Arbiter.json";
import ReferencesEscrowArbiter from "./contracts/arbiters/ReferencesEscrowArbiter.json";

// Arbiters - Logical
import AllArbiter from "./contracts/arbiters/logical/AllArbiter.json";
import AnyArbiter from "./contracts/arbiters/logical/AnyArbiter.json";

// Arbiters - Attestation Properties
import AttesterArbiter from "./contracts/arbiters/attestation-properties/AttesterArbiter.json";
import ExpirationTimeAfterArbiter from "./contracts/arbiters/attestation-properties/ExpirationTimeAfterArbiter.json";
import ExpirationTimeBeforeArbiter from "./contracts/arbiters/attestation-properties/ExpirationTimeBeforeArbiter.json";
import ExpirationTimeEqualArbiter from "./contracts/arbiters/attestation-properties/ExpirationTimeEqualArbiter.json";
import RecipientArbiter from "./contracts/arbiters/attestation-properties/RecipientArbiter.json";
import RefUidArbiter from "./contracts/arbiters/attestation-properties/RefUidArbiter.json";
import RevocableArbiter from "./contracts/arbiters/attestation-properties/RevocableArbiter.json";
import SchemaArbiter from "./contracts/arbiters/attestation-properties/SchemaArbiter.json";
import TimeAfterArbiter from "./contracts/arbiters/attestation-properties/TimeAfterArbiter.json";
import TimeBeforeArbiter from "./contracts/arbiters/attestation-properties/TimeBeforeArbiter.json";
import TimeEqualArbiter from "./contracts/arbiters/attestation-properties/TimeEqualArbiter.json";
import UidArbiter from "./contracts/arbiters/attestation-properties/UidArbiter.json";

// Arbiters - Confirmation
import ExclusiveRevocableConfirmationArbiter from "./contracts/arbiters/confirmation/ExclusiveRevocableConfirmationArbiter.json";
import ExclusiveUnrevocableConfirmationArbiter from "./contracts/arbiters/confirmation/ExclusiveUnrevocableConfirmationArbiter.json";
import NonexclusiveRevocableConfirmationArbiter from "./contracts/arbiters/confirmation/NonexclusiveRevocableConfirmationArbiter.json";
import NonexclusiveUnrevocableConfirmationArbiter from "./contracts/arbiters/confirmation/NonexclusiveUnrevocableConfirmationArbiter.json";

// Obligations - Escrow
import AttestationEscrowObligation from "./contracts/obligations/escrow/default/AttestationEscrowObligation.json";
import AttestationReferenceEscrowObligation from "./contracts/obligations/escrow/default/AttestationReferenceEscrowObligation.json";
import ERC20EscrowObligation from "./contracts/obligations/escrow/default/ERC20EscrowObligation.json";
import ERC721EscrowObligation from "./contracts/obligations/escrow/default/ERC721EscrowObligation.json";
import ERC1155EscrowObligation from "./contracts/obligations/escrow/default/ERC1155EscrowObligation.json";
import NativeTokenEscrowObligation from "./contracts/obligations/escrow/default/NativeTokenEscrowObligation.json";
import TokenBundleEscrowObligation from "./contracts/obligations/escrow/default/TokenBundleEscrowObligation.json";
import UnconditionalAttestationEscrowObligation from "./contracts/obligations/escrow/unconditional/UnconditionalAttestationEscrowObligation.json";
import UnconditionalAttestationReferenceEscrowObligation from "./contracts/obligations/escrow/unconditional/UnconditionalAttestationReferenceEscrowObligation.json";
import UnconditionalERC1155EscrowObligation from "./contracts/obligations/escrow/unconditional/UnconditionalERC1155EscrowObligation.json";
import UnconditionalERC20EscrowObligation from "./contracts/obligations/escrow/unconditional/UnconditionalERC20EscrowObligation.json";
import UnconditionalERC721EscrowObligation from "./contracts/obligations/escrow/unconditional/UnconditionalERC721EscrowObligation.json";
import UnconditionalNativeTokenEscrowObligation from "./contracts/obligations/escrow/unconditional/UnconditionalNativeTokenEscrowObligation.json";
import UnconditionalTokenBundleEscrowObligation from "./contracts/obligations/escrow/unconditional/UnconditionalTokenBundleEscrowObligation.json";
import HookEscrowObligation from "./contracts/obligations/escrow/hook-based/HookEscrowObligation.json";
import HooksEscrowObligation from "./contracts/obligations/escrow/hook-based/HooksEscrowObligation.json";
import AttestationEscrowHook from "./contracts/obligations/escrow/hook-based/hooks/AttestationEscrowHook.json";
import AttestationReferenceEscrowHook from "./contracts/obligations/escrow/hook-based/hooks/AttestationReferenceEscrowHook.json";
import ERC20EscrowHook from "./contracts/obligations/escrow/hook-based/hooks/ERC20EscrowHook.json";
import ERC721EscrowHook from "./contracts/obligations/escrow/hook-based/hooks/ERC721EscrowHook.json";
import ERC1155EscrowHook from "./contracts/obligations/escrow/hook-based/hooks/ERC1155EscrowHook.json";
import NativeTokenEscrowHook from "./contracts/obligations/escrow/hook-based/hooks/NativeTokenEscrowHook.json";

// Obligations - Payment
import ERC20PaymentObligation from "./contracts/obligations/payment/ERC20PaymentObligation.json";
import ERC721PaymentObligation from "./contracts/obligations/payment/ERC721PaymentObligation.json";
import ERC1155PaymentObligation from "./contracts/obligations/payment/ERC1155PaymentObligation.json";
import NativeTokenPaymentObligation from "./contracts/obligations/payment/NativeTokenPaymentObligation.json";
import TokenBundlePaymentObligation from "./contracts/obligations/payment/TokenBundlePaymentObligation.json";

// Obligations - Other
import StringObligation from "./contracts/obligations/StringObligation.json";
import CommitRevealObligation from "./contracts/obligations/CommitRevealObligation.json";

// Utils
import AtomicAttestationUtils from "./contracts/utils/AtomicAttestationUtils.json";
import AtomicPaymentUtils from "./contracts/utils/AtomicPaymentUtils.json";
import CommitmentERC20Splitter from "./contracts/utils/splitters/commitment/CommitmentERC20Splitter.json";
import CommitmentERC1155Splitter from "./contracts/utils/splitters/commitment/CommitmentERC1155Splitter.json";
import CommitmentNativeTokenSplitter from "./contracts/utils/splitters/commitment/CommitmentNativeTokenSplitter.json";
import CommitmentTokenBundleSplitter from "./contracts/utils/splitters/commitment/CommitmentTokenBundleSplitter.json";
import CommitmentTokenBundleSplitterUnvalidated from "./contracts/utils/splitters/commitment/CommitmentTokenBundleSplitterUnvalidated.json";
import ERC20Splitter from "./contracts/utils/splitters/default/ERC20Splitter.json";
import ERC1155Splitter from "./contracts/utils/splitters/default/ERC1155Splitter.json";
import NativeTokenSplitter from "./contracts/utils/splitters/default/NativeTokenSplitter.json";
import TokenBundleSplitter from "./contracts/utils/splitters/default/TokenBundleSplitter.json";
import TokenBundleSplitterUnvalidated from "./contracts/utils/splitters/default/TokenBundleSplitterUnvalidated.json";

export type DeployFn = (
  abi: any[],
  bytecode: `0x${string}`,
  args: any[],
) => Promise<`0x${string}`>;

export type DeployOptions = {
  scope?: "all" | "arbiters" | "obligations" | "utils";
  eas?: boolean;
  easAddress?: `0x${string}`;
  easSrAddress?: `0x${string}`;
};

type Artifact = { abi: any[]; bytecode: { object: string } };

function bytecodeOf(artifact: Artifact): `0x${string}` {
  return artifact.bytecode.object as `0x${string}`;
}

async function deploy(fn: DeployFn, artifact: Artifact, args: any[] = []): Promise<`0x${string}`> {
  return fn(artifact.abi, bytecodeOf(artifact), args);
}

export async function deployAlkahest(
  deployFn: DeployFn,
  options?: DeployOptions,
): Promise<Partial<ChainAddresses>> {
  const scope = options?.scope ?? "all";
  const result: Partial<ChainAddresses> = {};

  let easAddress = options?.easAddress;
  let easSrAddress = options?.easSrAddress;

  // 1. EAS + SchemaRegistry
  if (options?.eas) {
    easSrAddress = await deploy(deployFn, SchemaRegistry as Artifact);
    easAddress = await deploy(deployFn, EAS as Artifact, [easSrAddress]);
  }

  if (!easAddress || !easSrAddress) {
    throw new Error(
      "EAS and SchemaRegistry addresses are required. Either use eas: true to deploy, " +
        "or provide easAddress and easSrAddress.",
    );
  }

  result.eas = easAddress;
  result.easSchemaRegistry = easSrAddress;

  // 2. Arbiters
  if (scope === "all" || scope === "arbiters") {
    // Core arbiters
    result.trivialArbiter = await deploy(deployFn, TrivialArbiter as Artifact);
    result.trustedOracleArbiter = await deploy(deployFn, TrustedOracleArbiter as Artifact, [easAddress]);
    result.commitmentTrustedOracleArbiter = await deploy(deployFn, CommitmentTrustedOracleArbiter as Artifact);
    result.intrinsicsArbiter = await deploy(deployFn, IntrinsicsArbiter as Artifact);
    result.erc8004Arbiter = await deploy(deployFn, ERC8004Arbiter as Artifact);
    result.referencesEscrowArbiter = await deploy(deployFn, ReferencesEscrowArbiter as Artifact);
    result.allArbiter = await deploy(deployFn, AllArbiter as Artifact);
    result.anyArbiter = await deploy(deployFn, AnyArbiter as Artifact);

    // Attestation property arbiters (no constructor args)
    result.attesterArbiter = await deploy(deployFn, AttesterArbiter as Artifact);
    result.recipientArbiter = await deploy(deployFn, RecipientArbiter as Artifact);
    result.refUidArbiter = await deploy(deployFn, RefUidArbiter as Artifact);
    result.revocableArbiter = await deploy(deployFn, RevocableArbiter as Artifact);
    result.schemaArbiter = await deploy(deployFn, SchemaArbiter as Artifact);
    result.uidArbiter = await deploy(deployFn, UidArbiter as Artifact);
    result.timeAfterArbiter = await deploy(deployFn, TimeAfterArbiter as Artifact);
    result.timeBeforeArbiter = await deploy(deployFn, TimeBeforeArbiter as Artifact);
    result.timeEqualArbiter = await deploy(deployFn, TimeEqualArbiter as Artifact);
    result.expirationTimeAfterArbiter = await deploy(deployFn, ExpirationTimeAfterArbiter as Artifact);
    result.expirationTimeBeforeArbiter = await deploy(deployFn, ExpirationTimeBeforeArbiter as Artifact);
    result.expirationTimeEqualArbiter = await deploy(deployFn, ExpirationTimeEqualArbiter as Artifact);

    // Confirmation arbiters (each takes [eas])
    result.exclusiveRevocableConfirmationArbiter = await deploy(
      deployFn,
      ExclusiveRevocableConfirmationArbiter as Artifact,
      [easAddress],
    );
    result.exclusiveUnrevocableConfirmationArbiter = await deploy(
      deployFn,
      ExclusiveUnrevocableConfirmationArbiter as Artifact,
      [easAddress],
    );
    result.nonexclusiveRevocableConfirmationArbiter = await deploy(
      deployFn,
      NonexclusiveRevocableConfirmationArbiter as Artifact,
      [easAddress],
    );
    result.nonexclusiveUnrevocableConfirmationArbiter = await deploy(
      deployFn,
      NonexclusiveUnrevocableConfirmationArbiter as Artifact,
      [easAddress],
    );
  }

  // 3. Obligations
  if (scope === "all" || scope === "obligations") {
    const easArgs = [easAddress, easSrAddress];

    result.erc20EscrowObligation = await deploy(deployFn, ERC20EscrowObligation as Artifact, easArgs);
    result.erc20UnconditionalEscrowObligation = await deploy(
      deployFn,
      UnconditionalERC20EscrowObligation as Artifact,
      easArgs,
    );
    result.erc20PaymentObligation = await deploy(deployFn, ERC20PaymentObligation as Artifact, easArgs);
    result.erc721EscrowObligation = await deploy(deployFn, ERC721EscrowObligation as Artifact, easArgs);
    result.erc721UnconditionalEscrowObligation = await deploy(
      deployFn,
      UnconditionalERC721EscrowObligation as Artifact,
      easArgs,
    );
    result.erc721PaymentObligation = await deploy(deployFn, ERC721PaymentObligation as Artifact, easArgs);
    result.erc1155EscrowObligation = await deploy(deployFn, ERC1155EscrowObligation as Artifact, easArgs);
    result.erc1155UnconditionalEscrowObligation = await deploy(
      deployFn,
      UnconditionalERC1155EscrowObligation as Artifact,
      easArgs,
    );
    result.erc1155PaymentObligation = await deploy(deployFn, ERC1155PaymentObligation as Artifact, easArgs);
    result.tokenBundleEscrowObligation = await deploy(deployFn, TokenBundleEscrowObligation as Artifact, easArgs);
    result.tokenBundleUnconditionalEscrowObligation = await deploy(
      deployFn,
      UnconditionalTokenBundleEscrowObligation as Artifact,
      easArgs,
    );
    result.tokenBundlePaymentObligation = await deploy(deployFn, TokenBundlePaymentObligation as Artifact, easArgs);
    result.nativeTokenEscrowObligation = await deploy(deployFn, NativeTokenEscrowObligation as Artifact, easArgs);
    result.nativeTokenUnconditionalEscrowObligation = await deploy(
      deployFn,
      UnconditionalNativeTokenEscrowObligation as Artifact,
      easArgs,
    );
    result.nativeTokenPaymentObligation = await deploy(deployFn, NativeTokenPaymentObligation as Artifact, easArgs);
    result.attestationEscrowObligation = await deploy(deployFn, AttestationEscrowObligation as Artifact, easArgs);
    result.attestationUnconditionalEscrowObligation = await deploy(
      deployFn,
      UnconditionalAttestationEscrowObligation as Artifact,
      easArgs,
    );
    result.attestationReferenceEscrowObligation = await deploy(deployFn, AttestationReferenceEscrowObligation as Artifact, easArgs);
    result.attestationReferenceUnconditionalEscrowObligation = await deploy(
      deployFn,
      UnconditionalAttestationReferenceEscrowObligation as Artifact,
      easArgs,
    );
    result.hookEscrowObligation = await deploy(deployFn, HookEscrowObligation as Artifact, easArgs);
    result.hooksEscrowObligation = await deploy(deployFn, HooksEscrowObligation as Artifact, easArgs);
    result.erc20EscrowHook = await deploy(deployFn, ERC20EscrowHook as Artifact);
    result.erc721EscrowHook = await deploy(deployFn, ERC721EscrowHook as Artifact);
    result.erc1155EscrowHook = await deploy(deployFn, ERC1155EscrowHook as Artifact);
    result.nativeTokenEscrowHook = await deploy(deployFn, NativeTokenEscrowHook as Artifact);
    result.attestationEscrowHook = await deploy(deployFn, AttestationEscrowHook as Artifact, [easAddress]);
    result.attestationReferenceEscrowHook = await deploy(deployFn, AttestationReferenceEscrowHook as Artifact, [
      easAddress,
      easSrAddress,
    ]);
    result.stringObligation = await deploy(deployFn, StringObligation as Artifact, easArgs);
    result.commitRevealObligation = await deploy(deployFn, CommitRevealObligation as Artifact, [
      easAddress,
      easSrAddress,
      "0x0000000000000000000000000000000000000000",
    ]);
  }

  // 4. Utils
  if (scope === "all" || scope === "utils") {
    const erc20Payment = result.erc20PaymentObligation;
    const erc721Payment = result.erc721PaymentObligation;
    const erc1155Payment = result.erc1155PaymentObligation;
    const bundlePayment = result.tokenBundlePaymentObligation;
    const nativePayment = result.nativeTokenPaymentObligation;
    const erc20Escrow = result.erc20EscrowObligation;
    const erc1155Escrow = result.erc1155EscrowObligation;
    const bundleEscrow = result.tokenBundleEscrowObligation;
    const nativeEscrow = result.nativeTokenEscrowObligation;

    if (!erc20Payment || !erc721Payment || !erc1155Payment || !nativePayment || !bundlePayment) {
      throw new Error(
        "Cannot deploy utils without obligation addresses. Deploy obligations first or use scope 'all'.",
      );
    }
    if (!erc20Escrow || !erc1155Escrow || !nativeEscrow || !bundleEscrow) {
      throw new Error(
        "Cannot deploy splitters without escrow obligation addresses. Deploy obligations first or use scope 'all'.",
      );
    }

    const atomicPaymentArgs = [
      easAddress,
      erc20Payment,
      erc721Payment,
      erc1155Payment,
      nativePayment,
      bundlePayment,
    ];

    const atomicPaymentUtils = await deploy(deployFn, AtomicPaymentUtils as Artifact, atomicPaymentArgs);
    result.erc20AtomicPaymentUtils = atomicPaymentUtils;
    result.erc721AtomicPaymentUtils = atomicPaymentUtils;
    result.erc1155AtomicPaymentUtils = atomicPaymentUtils;
    result.nativeTokenAtomicPaymentUtils = atomicPaymentUtils;
    result.tokenBundleAtomicPaymentUtils = atomicPaymentUtils;
    result.atomicAttestationUtils = await deploy(deployFn, AtomicAttestationUtils as Artifact, [easAddress]);

    result.erc20Splitter = await deploy(deployFn, ERC20Splitter as Artifact, [easAddress, erc20Escrow]);
    result.erc1155Splitter = await deploy(deployFn, ERC1155Splitter as Artifact, [easAddress, erc1155Escrow]);
    result.nativeTokenSplitter = await deploy(deployFn, NativeTokenSplitter as Artifact, [
      easAddress,
      nativeEscrow,
    ]);
    result.tokenBundleSplitter = await deploy(deployFn, TokenBundleSplitter as Artifact, [easAddress, bundleEscrow]);
    result.tokenBundleSplitterUnvalidated = await deploy(deployFn, TokenBundleSplitterUnvalidated as Artifact, [
      easAddress,
      bundleEscrow,
    ]);
    result.commitmentERC20Splitter = await deploy(deployFn, CommitmentERC20Splitter as Artifact, [
      easAddress,
      erc20Escrow,
    ]);
    result.commitmentERC1155Splitter = await deploy(deployFn, CommitmentERC1155Splitter as Artifact, [
      easAddress,
      erc1155Escrow,
    ]);
    result.commitmentNativeTokenSplitter = await deploy(deployFn, CommitmentNativeTokenSplitter as Artifact, [
      easAddress,
      nativeEscrow,
    ]);
    result.commitmentTokenBundleSplitter = await deploy(deployFn, CommitmentTokenBundleSplitter as Artifact, [
      easAddress,
      bundleEscrow,
    ]);
    result.commitmentTokenBundleSplitterUnvalidated = await deploy(
      deployFn,
      CommitmentTokenBundleSplitterUnvalidated as Artifact,
      [easAddress, bundleEscrow],
    );
  }

  return result;
}
