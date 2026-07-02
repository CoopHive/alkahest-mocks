import type { ViemClient } from "../../../../utils";
import type { Erc1155Addresses } from "../index";
import { type Erc1155DefaultEscrowClient, makeErc1155DefaultEscrowClient } from "./default";
import { type Erc1155UnconditionalEscrowClient, makeErc1155UnconditionalEscrowClient } from "./unconditional";

export { type Erc1155DefaultEscrowClient, makeErc1155DefaultEscrowClient } from "./default";
export { type Erc1155UnconditionalEscrowClient, makeErc1155UnconditionalEscrowClient } from "./unconditional";

/** Default-checking or unconditional ERC1155 escrow variant. */
export type Erc1155EscrowChecks = "default" | "unconditional";

/** ERC1155 escrow client namespace. */
export type Erc1155EscrowClient = {
  default: Erc1155DefaultEscrowClient;
  unconditional: Erc1155UnconditionalEscrowClient;
  byChecks: {
    (checks: "default"): Erc1155DefaultEscrowClient;
    (checks: "unconditional"): Erc1155UnconditionalEscrowClient;
    (checks?: Erc1155EscrowChecks): Erc1155DefaultEscrowClient | Erc1155UnconditionalEscrowClient;
  };
};

/** Create default and unconditional ERC1155 escrow clients. */
export const makeErc1155EscrowClient = (viemClient: ViemClient, addresses: Erc1155Addresses): Erc1155EscrowClient => {
  const defaultEscrow = makeErc1155DefaultEscrowClient(viemClient, addresses);
  const unconditional = makeErc1155UnconditionalEscrowClient(viemClient, addresses);
  const byChecks = (checks: Erc1155EscrowChecks = "default") => (checks === "default" ? defaultEscrow : unconditional);

  return {
    default: defaultEscrow,
    unconditional,
    byChecks,
  };
};
