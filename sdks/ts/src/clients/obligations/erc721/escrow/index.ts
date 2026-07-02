import type { ViemClient } from "../../../../utils";
import type { Erc721Addresses } from "../index";
import { type Erc721DefaultEscrowClient, makeErc721DefaultEscrowClient } from "./default";
import { type Erc721UnconditionalEscrowClient, makeErc721UnconditionalEscrowClient } from "./unconditional";

export { type Erc721DefaultEscrowClient, makeErc721DefaultEscrowClient } from "./default";
export { type Erc721UnconditionalEscrowClient, makeErc721UnconditionalEscrowClient } from "./unconditional";

/** Default-checking or unconditional ERC721 escrow variant. */
export type Erc721EscrowChecks = "default" | "unconditional";

/** ERC721 escrow client namespace. */
export type Erc721EscrowClient = {
  default: Erc721DefaultEscrowClient;
  unconditional: Erc721UnconditionalEscrowClient;
  byChecks: {
    (checks: "default"): Erc721DefaultEscrowClient;
    (checks: "unconditional"): Erc721UnconditionalEscrowClient;
    (checks?: Erc721EscrowChecks): Erc721DefaultEscrowClient | Erc721UnconditionalEscrowClient;
  };
};

/** Create default and unconditional ERC721 escrow clients. */
export const makeErc721EscrowClient = (viemClient: ViemClient, addresses: Erc721Addresses): Erc721EscrowClient => {
  const defaultEscrow = makeErc721DefaultEscrowClient(viemClient, addresses);
  const unconditional = makeErc721UnconditionalEscrowClient(viemClient, addresses);
  const byChecks = (checks: Erc721EscrowChecks = "default") => (checks === "default" ? defaultEscrow : unconditional);

  return {
    default: defaultEscrow,
    unconditional,
    byChecks,
  };
};
