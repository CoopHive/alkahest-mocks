import { describe, expect, test } from "bun:test";
import { makeExclusiveRevocableConfirmationArbiterClient } from "../../src/clients/arbiters/confirmation/exclusiveRevocableConfirmationArbiter";
import { makeExclusiveUnrevocableConfirmationArbiterClient } from "../../src/clients/arbiters/confirmation/exclusiveUnrevocableConfirmationArbiter";
import { makeNonexclusiveRevocableConfirmationArbiterClient } from "../../src/clients/arbiters/confirmation/nonexclusiveRevocableConfirmationArbiter";
import { makeNonexclusiveUnrevocableConfirmationArbiterClient } from "../../src/clients/arbiters/confirmation/nonexclusiveUnrevocableConfirmationArbiter";
import type { ChainAddresses } from "../../src/types";

const addr = (value: number) => `0x${value.toString(16).padStart(40, "0")}` as `0x${string}`;
const bytes32 = (value: number) => `0x${value.toString(16).padStart(64, "0")}` as `0x${string}`;

const addresses = {
  exclusiveRevocableConfirmationArbiter: addr(1),
  exclusiveUnrevocableConfirmationArbiter: addr(2),
  nonexclusiveRevocableConfirmationArbiter: addr(3),
  nonexclusiveUnrevocableConfirmationArbiter: addr(4),
} as ChainAddresses;

describe("confirmation request helpers", () => {
  test("filter request lookup by fulfillment, confirmer, and escrow", async () => {
    const fulfillment = bytes32(1);
    const confirmer = addr(10);
    const escrow = bytes32(2);

    const calls: unknown[] = [];
    const viemClient = {
      getLogs: async (args: unknown) => {
        calls.push(args);
        return [{ args: { fulfillment, confirmer, escrow } }];
      },
    } as any;

    const clients = [
      makeExclusiveRevocableConfirmationArbiterClient(viemClient, addresses),
      makeExclusiveUnrevocableConfirmationArbiterClient(viemClient, addresses),
      makeNonexclusiveRevocableConfirmationArbiterClient(viemClient, addresses),
      makeNonexclusiveUnrevocableConfirmationArbiterClient(viemClient, addresses),
    ];

    for (const client of clients) {
      const request = await client.waitForConfirmationRequest(fulfillment, confirmer, escrow);
      expect(request.escrow).toBe(escrow);
    }

    expect(calls).toHaveLength(4);
    for (const call of calls as Array<{ args?: Record<string, unknown> }>) {
      expect(call.args).toEqual({ fulfillment, confirmer, escrow });
    }
  });
});
