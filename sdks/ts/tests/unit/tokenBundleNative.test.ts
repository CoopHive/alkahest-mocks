import { describe, expect, test } from "bun:test";
import {
  encodeObligation as encodeTokenBundleDefaultEscrow,
  type TokenBundleDefaultEscrowObligationData,
} from "../../src/clients/obligations/tokenBundle/escrow/default";
import { makeTokenBundlePaymentClient } from "../../src/clients/obligations/tokenBundle/payment";
import { flattenTokenBundle, type ViemClient } from "../../src/utils";
import type { TokenBundle } from "../../src/types";
import type { TokenBundleAddresses } from "../../src/clients/obligations/tokenBundle";

const zeroUid = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;
const mockEscrowUid = "0x1111111111111111111111111111111111111111111111111111111111111111" as const;
const mockAddress = "0x1111111111111111111111111111111111111111" as const;
const mockAddress2 = "0x2222222222222222222222222222222222222222" as const;
const mockEscrow = "0x3333333333333333333333333333333333333333" as const;
const mockPayment = "0x4444444444444444444444444444444444444444" as const;
const mockAtomicUtils = "0x5555555555555555555555555555555555555555" as const;

const addresses: TokenBundleAddresses = {
  eas: "0x6666666666666666666666666666666666666666",
  atomicPaymentUtils: mockAtomicUtils,
  nativeTokenAtomicPaymentUtils: "0x7777777777777777777777777777777777777777",
  escrowObligation: mockEscrow,
  escrowObligationUnconditional: "0x8888888888888888888888888888888888888888",
  paymentObligation: mockPayment,
  packagedEscrowObligations: [mockEscrow],
};

describe("TokenBundle native value helpers", () => {
  test("flattenTokenBundle preserves nativeAmount and defaults it to zero", () => {
    const tokenOnly: TokenBundle = {
      erc20s: [],
      erc721s: [],
      erc1155s: [],
    };
    expect(flattenTokenBundle(tokenOnly).nativeAmount).toBe(0n);

    const mixed: TokenBundle = {
      nativeAmount: 123n,
      erc20s: [{ address: mockAddress, value: 456n }],
      erc721s: [],
      erc1155s: [],
    };
    const flat = flattenTokenBundle(mixed);
    expect(flat.nativeAmount).toBe(123n);
    expect(flat.erc20Amounts).toEqual([456n]);
  });

  test("high-level token bundle payment encoding preserves nativeAmount", () => {
    const client = makeTokenBundlePaymentClient({} as any, addresses);
    const encoded = client.encodeObligation(
      {
        nativeAmount: 123n,
        erc20s: [{ address: mockAddress, value: 456n }],
        erc721s: [],
        erc1155s: [],
      },
      mockAddress2,
    );

    const decoded = client.decodeObligation(encoded);
    expect(decoded.nativeAmount).toBe(123n);
    expect(decoded.erc20Amounts).toEqual([456n]);
    expect(decoded.payee.toLowerCase()).toBe(mockAddress2.toLowerCase());
  });

  test("atomic bundle collection forwards nativeAmount decoded from escrow demand", async () => {
    const client = makeTokenBundlePaymentClient(makeMockClient(789n), addresses);

    await expect(client.payBundleAndCollect(mockEscrowUid)).rejects.toThrow("stop after write");
    expect(capturedWrite?.functionName).toBe("payBundleAndCollect");
    expect(capturedWrite?.value).toBe(789n);
  });
});

let capturedWrite: any;

const makeMockClient = (nativeAmount: bigint) => {
  capturedWrite = undefined;
  const paymentDemand = makeTokenBundlePaymentClient({} as any, addresses).encodeObligation(
    {
      nativeAmount,
      erc20s: [{ address: mockAddress, value: 1n }],
      erc721s: [],
      erc1155s: [],
    },
    mockAddress2,
  );
  const escrowData = encodeDefaultEscrowData(paymentDemand);

  return {
    chain: { id: 31337, name: "anvil" },
    readContract: async ({ functionName }: { functionName: string }) => {
      if (functionName === "getAttestation") {
        return {
          uid: mockEscrowUid,
          schema: zeroUid,
          time: 0n,
          expirationTime: 0n,
          revocationTime: 0n,
          refUID: zeroUid,
          recipient: mockAddress,
          attester: mockEscrow,
          revocable: true,
          data: escrowData,
        };
      }
      if (functionName === "decodeCondition") {
        return [mockPayment, paymentDemand];
      }
      throw new Error(`unexpected readContract ${functionName}`);
    },
    writeContract: async (params: any) => {
      capturedWrite = params;
      return "0x9999999999999999999999999999999999999999999999999999999999999999";
    },
    waitForTransactionReceipt: async () => {
      throw new Error("stop after write");
    },
  } as unknown as ViemClient;
};

const encodeDefaultEscrowData = (demand: `0x${string}`) => {
  const data: TokenBundleDefaultEscrowObligationData = {
    nativeAmount: 0n,
    erc20Tokens: [],
    erc20Amounts: [],
    erc721Tokens: [],
    erc721TokenIds: [],
    erc1155Tokens: [],
    erc1155TokenIds: [],
    erc1155Amounts: [],
    arbiter: mockPayment,
    demand,
  };
  return encodeTokenBundleDefaultEscrow(data);
};
