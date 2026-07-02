import { type Address, isAddressEqual, zeroAddress } from "viem";
import type { ChainAddresses } from "../types";
import { getAttestation } from "./attestations";
import type { ViemClient } from "./contract";

/** Throw when a configured SDK contract address is not deployed for this chain. */
export const assertDeployedContract = (address: Address, label: string = "contract") => {
  if (isAddressEqual(address, zeroAddress)) {
    throw new Error(`${label} is not deployed for this chain`);
  }
};

export type AtomicPaymentOptions = {
  /**
   * Allow AtomicPaymentUtils to settle an escrow attestation whose attester is
   * not one of the configured Alkahest escrow obligation contracts.
   */
  allowUntrustedEscrow?: boolean;
};

type AtomicPaymentEscrowAddresses = Pick<ChainAddresses, "eas"> & {
  packagedEscrowObligations: readonly `0x${string}`[];
};

export const pickPackagedEscrowObligations = (addresses: ChainAddresses): readonly `0x${string}`[] => [
  addresses.erc20EscrowObligation,
  addresses.erc20UnconditionalEscrowObligation,
  addresses.erc721EscrowObligation,
  addresses.erc721UnconditionalEscrowObligation,
  addresses.erc1155EscrowObligation,
  addresses.erc1155UnconditionalEscrowObligation,
  addresses.nativeTokenEscrowObligation,
  addresses.nativeTokenUnconditionalEscrowObligation,
  addresses.tokenBundleEscrowObligation,
  addresses.tokenBundleUnconditionalEscrowObligation,
  addresses.attestationEscrowObligation,
  addresses.attestationUnconditionalEscrowObligation,
  addresses.attestationReferenceEscrowObligation,
  addresses.attestationReferenceUnconditionalEscrowObligation,
  addresses.hookEscrowObligation,
  addresses.hooksEscrowObligation,
];

export const getAtomicPaymentEscrowAttestation = async (
  viemClient: ViemClient,
  addresses: AtomicPaymentEscrowAddresses,
  escrowUid: `0x${string}`,
  options?: AtomicPaymentOptions,
) => {
  const escrow = await getAttestation(viemClient, escrowUid, addresses);

  if (options?.allowUntrustedEscrow) return escrow;

  const supportedEscrows = addresses.packagedEscrowObligations.filter(
    (address) => !isAddressEqual(address, zeroAddress),
  );

  if (!supportedEscrows.some((address) => isAddressEqual(address, escrow.attester))) {
    throw new Error(
      [
        `Unsupported escrow attester for AtomicPaymentUtils: ${escrow.attester}.`,
        "The SDK only settles configured Alkahest escrow contracts by default.",
        "Pass { allowUntrustedEscrow: true } only after independently validating the escrow contract and attestation.",
      ].join(" "),
    );
  }

  return escrow;
};
