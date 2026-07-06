import type { ChainAddresses } from "../../../types";
import type { ViemClient } from "../../../utils";
import { pickPackagedEscrowObligations } from "../../../utils/contractSafety";
import { type Erc20EscrowClient, makeErc20EscrowClient } from "./escrow";
import { type Erc20PaymentClient, makeErc20PaymentClient } from "./payment";
import { type Erc20UtilClient, makeErc20UtilClient } from "./util";

export { type Erc20EscrowClient, makeErc20EscrowClient } from "./escrow";
export { type Erc20DefaultEscrowClient, makeErc20DefaultEscrowClient } from "./escrow/default";
export { type Erc20UnconditionalEscrowClient, makeErc20UnconditionalEscrowClient } from "./escrow/unconditional";
export { type Erc20PaymentClient, makeErc20PaymentClient } from "./payment";
export { type Erc20UtilClient, makeErc20UtilClient } from "./util";

/** Addresses required by the ERC20 obligation clients. */
export type Erc20Addresses = {
  eas: `0x${string}`;
  atomicPaymentUtils: `0x${string}`;
  escrowObligation: `0x${string}`;
  escrowObligationUnconditional: `0x${string}`;
  paymentObligation: `0x${string}`;
  packagedEscrowObligations: readonly `0x${string}`[];
};

/** Pick ERC20 obligation addresses from a full chain address map. */
export const pickErc20Addresses = (addresses: ChainAddresses): Erc20Addresses => ({
  eas: addresses.eas,
  atomicPaymentUtils: addresses.erc20AtomicPaymentUtils,
  escrowObligation: addresses.erc20EscrowObligation,
  escrowObligationUnconditional: addresses.erc20UnconditionalEscrowObligation,
  paymentObligation: addresses.erc20PaymentObligation,
  packagedEscrowObligations: pickPackagedEscrowObligations(addresses),
});

/** ERC20 obligation namespace client. */
export type Erc20Client = {
  util: Erc20UtilClient;
  escrow: Erc20EscrowClient;
  payment: Erc20PaymentClient;
};

/** Create the ERC20 utility, escrow, and payment clients. */
export const makeErc20Client = (viemClient: ViemClient, addresses: Erc20Addresses): Erc20Client => {
  return {
    util: makeErc20UtilClient(viemClient, addresses),
    escrow: makeErc20EscrowClient(viemClient, addresses),
    payment: makeErc20PaymentClient(viemClient, addresses),
  };
};
