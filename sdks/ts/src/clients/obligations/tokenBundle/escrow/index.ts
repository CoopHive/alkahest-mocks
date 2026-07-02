import type { ViemClient } from "../../../../utils";
import type { TokenBundleAddresses } from "../index";
import { makeTokenBundleDefaultEscrowClient, type TokenBundleDefaultEscrowClient } from "./default";
import { makeTokenBundleUnconditionalEscrowClient, type TokenBundleUnconditionalEscrowClient } from "./unconditional";

export { makeTokenBundleDefaultEscrowClient, type TokenBundleDefaultEscrowClient } from "./default";
export { makeTokenBundleUnconditionalEscrowClient, type TokenBundleUnconditionalEscrowClient } from "./unconditional";

/** Default-checking or unconditional token-bundle escrow variant. */
export type TokenBundleEscrowChecks = "default" | "unconditional";

/** Token-bundle escrow client namespace. */
export type TokenBundleEscrowClient = {
  default: TokenBundleDefaultEscrowClient;
  unconditional: TokenBundleUnconditionalEscrowClient;
  byChecks: {
    (checks: "default"): TokenBundleDefaultEscrowClient;
    (checks: "unconditional"): TokenBundleUnconditionalEscrowClient;
    (checks?: TokenBundleEscrowChecks): TokenBundleDefaultEscrowClient | TokenBundleUnconditionalEscrowClient;
  };
};

/** Create default and unconditional token-bundle escrow clients. */
export const makeTokenBundleEscrowClient = (
  viemClient: ViemClient,
  addresses: TokenBundleAddresses,
): TokenBundleEscrowClient => {
  const defaultEscrow = makeTokenBundleDefaultEscrowClient(viemClient, addresses);
  const unconditional = makeTokenBundleUnconditionalEscrowClient(viemClient, addresses);
  const byChecks = (checks: TokenBundleEscrowChecks = "default") =>
    checks === "default" ? defaultEscrow : unconditional;

  return {
    default: defaultEscrow,
    unconditional,
    byChecks,
  };
};
