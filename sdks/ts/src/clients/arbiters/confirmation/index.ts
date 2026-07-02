import type { ChainAddresses } from "../../../types";
import type { ViemClient } from "../../../utils";
import { makeExclusiveRevocableConfirmationArbiterClient } from "./exclusiveRevocableConfirmationArbiter";
import { makeExclusiveUnrevocableConfirmationArbiterClient } from "./exclusiveUnrevocableConfirmationArbiter";
import { makeNonexclusiveRevocableConfirmationArbiterClient } from "./nonexclusiveRevocableConfirmationArbiter";
import { makeNonexclusiveUnrevocableConfirmationArbiterClient } from "./nonexclusiveUnrevocableConfirmationArbiter";

/** Semantic selector for the confirmation arbiter matrix. */
export type ConfirmationArbiterOptions = {
  /** Whether only one fulfillment can be confirmed for an escrow. */
  exclusive: boolean;
  /** Whether a confirmation can later be revoked. */
  revocable: boolean;
};

/**
 * Confirmation Arbiters Client
 *
 * Provides access to confirmation-based arbiters for escrow validation.
 * These arbiters use a confirmation mapping instead of DemandData.
 *
 * The confirmation arbiters are organized by two dimensions:
 * - Exclusive vs Nonexclusive: Whether only one or multiple fulfillments can be confirmed per escrow
 * - Revocable vs Unrevocable: Whether confirmations can be revoked after being made
 *
 * Available arbiters:
 * - exclusiveRevocable: Single fulfillment per escrow, confirmation can be revoked
 * - exclusiveUnrevocable: Single fulfillment per escrow, confirmation cannot be revoked
 * - nonexclusiveRevocable: Multiple fulfillments per escrow, confirmations can be revoked
 * - nonexclusiveUnrevocable: Multiple fulfillments per escrow, confirmations cannot be revoked
 */
export const makeConfirmationArbitersClient = (viemClient: ViemClient, addresses: ChainAddresses) => {
  const exclusiveRevocable = makeExclusiveRevocableConfirmationArbiterClient(viemClient, addresses);
  const exclusiveUnrevocable = makeExclusiveUnrevocableConfirmationArbiterClient(viemClient, addresses);
  const nonexclusiveRevocable = makeNonexclusiveRevocableConfirmationArbiterClient(viemClient, addresses);
  const nonexclusiveUnrevocable = makeNonexclusiveUnrevocableConfirmationArbiterClient(viemClient, addresses);
  const byOptions = ({ exclusive, revocable }: ConfirmationArbiterOptions) => {
    if (exclusive && revocable) return exclusiveRevocable;
    if (exclusive) return exclusiveUnrevocable;
    if (revocable) return nonexclusiveRevocable;
    return nonexclusiveUnrevocable;
  };

  return {
    exclusiveRevocable,
    exclusiveUnrevocable,
    nonexclusiveRevocable,
    nonexclusiveUnrevocable,
    byOptions,
  };
};
