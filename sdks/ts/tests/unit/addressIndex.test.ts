import { describe, expect, test } from "bun:test";
import { createAddressIndex, lookupAddress } from "../../src/addressIndex";
import type { ChainAddresses } from "../../src/types";
import { zeroAddress } from "viem";

const addr = (value: number) =>
  `0x${value.toString(16).padStart(40, "0")}` as `0x${string}`;

describe("address index", () => {
  test("returns all matching slots for shared addresses", () => {
    const addresses: Partial<ChainAddresses> = {
      eas: addr(1),
      erc20EscrowObligation: addr(2),
      erc20UnconditionalEscrowObligation: addr(3),
      erc20PaymentObligation: addr(4),
      erc20AtomicPaymentUtils: addr(5),
    };

    const matches = lookupAddress(addresses, addr(1));

    expect(matches.map((info) => `${info.section}.${info.field}`)).toContain(
      "arbiters_addresses.eas",
    );
    expect(matches.map((info) => `${info.section}.${info.field}`)).toContain(
      "erc20_addresses.eas",
    );
  });

  test("includes escrow kind metadata for escrow obligations", () => {
    const addresses: Partial<ChainAddresses> = {
      erc20EscrowObligation: addr(2),
    };

    expect(lookupAddress(addresses, addr(2))).toEqual([
      {
        address: addr(2),
        section: "erc20_addresses",
        field: "escrow_obligation_default",
        contract: "erc20EscrowObligation",
        escrowKind: "erc20_escrow_obligation_default",
      },
    ]);
  });

  test("keys the index by lower-case address", () => {
    const addresses: Partial<ChainAddresses> = {
      stringObligation: "0x00000000000000000000000000000000000000aA",
    };

    expect(Object.keys(createAddressIndex(addresses))).toEqual([
      "0x00000000000000000000000000000000000000aa",
    ]);
  });

  test("does not index zero-address placeholders as known contracts", () => {
    const addresses: Partial<ChainAddresses> = {
      referencesEscrowArbiter: zeroAddress,
      erc20UnconditionalEscrowObligation: zeroAddress,
    };

    expect(createAddressIndex(addresses)).toEqual({});
    expect(lookupAddress(addresses, zeroAddress)).toEqual([]);
  });
});
