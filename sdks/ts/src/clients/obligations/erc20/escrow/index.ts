import type { ViemClient } from "../../../../utils";
import type { Erc20Addresses } from "../index";
import { type Erc20DefaultEscrowClient, makeErc20DefaultEscrowClient } from "./default";
import { type Erc20UnconditionalEscrowClient, makeErc20UnconditionalEscrowClient } from "./unconditional";

export { type Erc20DefaultEscrowClient, makeErc20DefaultEscrowClient } from "./default";
export { type Erc20UnconditionalEscrowClient, makeErc20UnconditionalEscrowClient } from "./unconditional";

/** Default-checking or unconditional ERC20 escrow variant. */
export type Erc20EscrowChecks = "default" | "unconditional";

/** ERC20 escrow client namespace. */
export type Erc20EscrowClient = {
  default: Erc20DefaultEscrowClient;
  unconditional: Erc20UnconditionalEscrowClient;
  byChecks: {
    (checks: "default"): Erc20DefaultEscrowClient;
    (checks: "unconditional"): Erc20UnconditionalEscrowClient;
    (checks?: Erc20EscrowChecks): Erc20DefaultEscrowClient | Erc20UnconditionalEscrowClient;
  };
};

/** Create default and unconditional ERC20 escrow clients. */
export const makeErc20EscrowClient = (viemClient: ViemClient, addresses: Erc20Addresses): Erc20EscrowClient => {
  const defaultEscrow = makeErc20DefaultEscrowClient(viemClient, addresses);
  const unconditional = makeErc20UnconditionalEscrowClient(viemClient, addresses);
  const byChecks = (checks: Erc20EscrowChecks = "default") => (checks === "default" ? defaultEscrow : unconditional);

  return {
    default: defaultEscrow,
    unconditional,
    byChecks,
  };
};
