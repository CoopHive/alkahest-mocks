import type { ViemClient } from "../../../../utils";
import type { NativeTokenAddresses } from "../index";
import { makeNativeTokenDefaultEscrowClient, type NativeTokenDefaultEscrowClient } from "./default";
import { makeNativeTokenUnconditionalEscrowClient, type NativeTokenUnconditionalEscrowClient } from "./unconditional";

export {
  decodeObligation as decodeDefaultObligation,
  encodeObligation as encodeDefaultObligation,
  makeNativeTokenDefaultEscrowClient,
  type NativeTokenDefaultEscrowClient,
  type NativeTokenDefaultEscrowObligationData,
} from "./default";
export {
  decodeObligation as decodeUnconditionalObligation,
  encodeObligation as encodeUnconditionalObligation,
  makeNativeTokenUnconditionalEscrowClient,
  type NativeTokenUnconditionalEscrowClient,
  type NativeTokenUnconditionalEscrowObligationData,
} from "./unconditional";

/** Default-checking or unconditional native-token escrow variant. */
export type NativeTokenEscrowChecks = "default" | "unconditional";

/** Native-token escrow client namespace. */
export type NativeTokenEscrowClient = {
  default: NativeTokenDefaultEscrowClient;
  unconditional: NativeTokenUnconditionalEscrowClient;
  byChecks: {
    (checks: "default"): NativeTokenDefaultEscrowClient;
    (checks: "unconditional"): NativeTokenUnconditionalEscrowClient;
    (checks?: NativeTokenEscrowChecks): NativeTokenDefaultEscrowClient | NativeTokenUnconditionalEscrowClient;
  };
};

/** Create default and unconditional native-token escrow clients. */
export const makeNativeTokenEscrowClient = (
  viemClient: ViemClient,
  addresses: NativeTokenAddresses,
): NativeTokenEscrowClient => {
  const defaultEscrow = makeNativeTokenDefaultEscrowClient(viemClient, addresses);
  const unconditional = makeNativeTokenUnconditionalEscrowClient(viemClient, addresses);
  const byChecks = (checks: NativeTokenEscrowChecks = "default") =>
    checks === "default" ? defaultEscrow : unconditional;

  return {
    default: defaultEscrow,
    unconditional,
    byChecks,
  };
};
