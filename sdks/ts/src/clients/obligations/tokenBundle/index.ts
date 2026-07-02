import type { ChainAddresses } from "../../../types";
import type { ViemClient } from "../../../utils";
import { pickPackagedEscrowObligations } from "../../../utils/contractSafety";
import { makeTokenBundleEscrowClient, type TokenBundleEscrowClient } from "./escrow";
import { makeTokenBundlePaymentClient, type TokenBundlePaymentClient } from "./payment";
import { makeTokenBundleUtilClient, type TokenBundleUtilClient } from "./util";

export { makeTokenBundleEscrowClient, type TokenBundleEscrowClient } from "./escrow";
export { makeTokenBundleDefaultEscrowClient, type TokenBundleDefaultEscrowClient } from "./escrow/default";
export { makeTokenBundleUnconditionalEscrowClient, type TokenBundleUnconditionalEscrowClient } from "./escrow/unconditional";
export { makeTokenBundlePaymentClient, type TokenBundlePaymentClient } from "./payment";
export { makeTokenBundleUtilClient, type TokenBundleUtilClient } from "./util";

/** Addresses required by the token-bundle obligation clients. */
export type TokenBundleAddresses = {
  eas: `0x${string}`;
  atomicPaymentUtils: `0x${string}`;
  nativeTokenAtomicPaymentUtils: `0x${string}`;
  escrowObligation: `0x${string}`;
  escrowObligationUnconditional: `0x${string}`;
  paymentObligation: `0x${string}`;
  packagedEscrowObligations: readonly `0x${string}`[];
};

/** Pick token-bundle obligation addresses from a full chain address map. */
export const pickTokenBundleAddresses = (addresses: ChainAddresses): TokenBundleAddresses => ({
  eas: addresses.eas,
  atomicPaymentUtils: addresses.tokenBundleAtomicPaymentUtils,
  nativeTokenAtomicPaymentUtils: addresses.nativeTokenAtomicPaymentUtils,
  escrowObligation: addresses.tokenBundleEscrowObligation,
  escrowObligationUnconditional: addresses.tokenBundleUnconditionalEscrowObligation,
  paymentObligation: addresses.tokenBundlePaymentObligation,
  packagedEscrowObligations: pickPackagedEscrowObligations(addresses),
});

/** Token-bundle obligation namespace client. */
export type TokenBundleClient = {
  util: TokenBundleUtilClient;
  escrow: TokenBundleEscrowClient;
  payment: TokenBundlePaymentClient;
};

/** Create the token-bundle utility, escrow, and payment clients. */
export const makeTokenBundleClient = (viemClient: ViemClient, addresses: TokenBundleAddresses): TokenBundleClient => {
  return {
    util: makeTokenBundleUtilClient(viemClient, addresses),
    escrow: makeTokenBundleEscrowClient(viemClient, addresses),
    payment: makeTokenBundlePaymentClient(viemClient, addresses),
  };
};
