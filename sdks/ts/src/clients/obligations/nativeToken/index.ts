import type { ChainAddresses } from "../../../types";
import type { ViemClient } from "../../../utils";
import { pickPackagedEscrowObligations } from "../../../utils/contractSafety";
import { makeNativeTokenEscrowClient, type NativeTokenEscrowClient } from "./escrow";
import {
  makeNativeTokenPaymentClient,
  type NativeTokenPaymentClient,
  type NativeTokenPaymentObligationData,
} from "./payment";

export { makeNativeTokenEscrowClient, type NativeTokenEscrowClient } from "./escrow";
export {
  decodeObligation as decodeDefaultEscrowObligation,
  encodeObligation as encodeDefaultEscrowObligation,
  makeNativeTokenDefaultEscrowClient,
  type NativeTokenDefaultEscrowClient,
  type NativeTokenDefaultEscrowObligationData,
} from "./escrow/default";
export {
  decodeObligation as decodeUnconditionalEscrowObligation,
  encodeObligation as encodeUnconditionalEscrowObligation,
  makeNativeTokenUnconditionalEscrowClient,
  type NativeTokenUnconditionalEscrowClient,
  type NativeTokenUnconditionalEscrowObligationData,
} from "./escrow/unconditional";
export {
  decodeObligation as decodePaymentObligation,
  encodeObligation as encodePaymentObligation,
  makeNativeTokenPaymentClient,
  type NativeTokenPaymentClient,
  type NativeTokenPaymentObligationData,
} from "./payment";

/** Addresses required by the native-token obligation clients. */
export type NativeTokenAddresses = {
  eas: `0x${string}`;
  atomicPaymentUtils: `0x${string}`;
  escrowObligation: `0x${string}`;
  escrowObligationUnconditional: `0x${string}`;
  paymentObligation: `0x${string}`;
  packagedEscrowObligations: readonly `0x${string}`[];
};

/** Pick native-token obligation addresses from a full chain address map. */
export const pickNativeTokenAddresses = (addresses: ChainAddresses): NativeTokenAddresses => ({
  eas: addresses.eas,
  atomicPaymentUtils: addresses.nativeTokenAtomicPaymentUtils,
  escrowObligation: addresses.nativeTokenEscrowObligation,
  escrowObligationUnconditional: addresses.nativeTokenUnconditionalEscrowObligation,
  paymentObligation: addresses.nativeTokenPaymentObligation,
  packagedEscrowObligations: pickPackagedEscrowObligations(addresses),
});

/** Native-token obligation namespace client. */
export type NativeTokenClient = {
  escrow: NativeTokenEscrowClient;
  payment: NativeTokenPaymentClient;
};

/** Create the native-token escrow and payment clients. */
export const makeNativeTokenClient = (viemClient: ViemClient, addresses: NativeTokenAddresses): NativeTokenClient => {
  return {
    escrow: makeNativeTokenEscrowClient(viemClient, addresses),
    payment: makeNativeTokenPaymentClient(viemClient, addresses),
  };
};
