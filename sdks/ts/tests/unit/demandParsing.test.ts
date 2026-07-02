import { describe, expect, test } from "bun:test";
import { createWalletClient, custom, encodeAbiParameters, parseAbiParameters, zeroAddress } from "viem";
import {
  AllArbiter,
  AnyArbiter,
  createDecodersFromAddresses,
  decodeDemand,
  decodeDemandWithAddresses,
  makeClient,
} from "../../src";
import { encodeDemand as encodeTrustedOracleDemand } from "../../src/clients/arbiters/general/trustedOracle";
import type { ChainAddresses, Demand } from "../../src/types";

describe("Demand Parsing and Static Codecs", () => {
  // Mock addresses for testing
  const mockAddresses: ChainAddresses = {
    eas: "0x1234567890123456789012345678901234567890",
    easSchemaRegistry: "0x1234567890123456789012345678901234567891",

    erc20AtomicPaymentUtils: "0x123456789012345678901234567890123456789C",
    erc20EscrowObligation: "0x123456789012345678901234567890123456789A",
    erc20UnconditionalEscrowObligation: "0x12345678901234567890123456789012345678E0",
    erc20PaymentObligation: "0x123456789012345678901234567890123456789B",

    erc721AtomicPaymentUtils: "0x12345678901234567890123456789012345678A2",
    erc721EscrowObligation: "0x12345678901234567890123456789012345678A0",
    erc721UnconditionalEscrowObligation: "0x12345678901234567890123456789012345678E1",
    erc721PaymentObligation: "0x12345678901234567890123456789012345678A1",

    erc1155AtomicPaymentUtils: "0x12345678901234567890123456789012345678A5",
    erc1155EscrowObligation: "0x12345678901234567890123456789012345678A3",
    erc1155UnconditionalEscrowObligation: "0x12345678901234567890123456789012345678E2",
    erc1155PaymentObligation: "0x12345678901234567890123456789012345678A4",

    tokenBundleAtomicPaymentUtils: "0x12345678901234567890123456789012345678A8",
    tokenBundleEscrowObligation: "0x12345678901234567890123456789012345678A6",
    tokenBundleUnconditionalEscrowObligation: "0x12345678901234567890123456789012345678E3",
    tokenBundlePaymentObligation: "0x12345678901234567890123456789012345678A7",

    atomicAttestationUtils: "0x12345678901234567890123456789012345678AB",
    attestationEscrowObligation: "0x12345678901234567890123456789012345678A9",
    attestationUnconditionalEscrowObligation: "0x12345678901234567890123456789012345678E4",
    attestationReferenceEscrowObligation: "0x12345678901234567890123456789012345678AA",
    attestationReferenceUnconditionalEscrowObligation: "0x12345678901234567890123456789012345678E5",

    hookEscrowObligation: "0x12345678901234567890123456789012345678D0",
    hooksEscrowObligation: "0x12345678901234567890123456789012345678D1",
    erc20EscrowHook: "0x12345678901234567890123456789012345678D2",
    erc721EscrowHook: "0x12345678901234567890123456789012345678D3",
    erc1155EscrowHook: "0x12345678901234567890123456789012345678D4",
    nativeTokenEscrowHook: "0x12345678901234567890123456789012345678D5",
    attestationEscrowHook: "0x12345678901234567890123456789012345678D6",
    attestationReferenceEscrowHook: "0x12345678901234567890123456789012345678D7",

    erc20Splitter: "0x12345678901234567890123456789012345678D8",
    erc1155Splitter: "0x12345678901234567890123456789012345678D9",
    nativeTokenSplitter: "0x12345678901234567890123456789012345678DA",
    tokenBundleSplitter: "0x12345678901234567890123456789012345678DB",
    tokenBundleSplitterUnvalidated: "0x12345678901234567890123456789012345678DC",
    commitmentERC20Splitter: "0x12345678901234567890123456789012345678DD",
    commitmentERC1155Splitter: "0x12345678901234567890123456789012345678DE",
    commitmentNativeTokenSplitter: "0x12345678901234567890123456789012345678DF",
    commitmentTokenBundleSplitter: "0x12345678901234567890123456789012345678E7",
    commitmentTokenBundleSplitterUnvalidated: "0x12345678901234567890123456789012345678E8",

    stringObligation: "0x12345678901234567890123456789012345678AC",
    commitRevealObligation: "0x12345678901234567890123456789012345678AD",

    trivialArbiter: "0x1234567890123456789012345678901234567894",
    trustedOracleArbiter: "0x1234567890123456789012345678901234567892",
    commitmentTrustedOracleArbiter: "0x12345678901234567890123456789012345678D0",
    anyArbiter: "0x1234567890123456789012345678901234567896",
    allArbiter: "0x1234567890123456789012345678901234567897",
    intrinsicsArbiter: "0x1234567890123456789012345678901234567898",
    erc8004Arbiter: "0x12345678901234567890123456789012345678AE",
    referencesEscrowArbiter: "0x12345678901234567890123456789012345678AF",

    nativeTokenAtomicPaymentUtils: "0x123456789012345678901234567890123456789F",
    nativeTokenEscrowObligation: "0x123456789012345678901234567890123456789E",
    nativeTokenUnconditionalEscrowObligation: "0x12345678901234567890123456789012345678E6",
    nativeTokenPaymentObligation: "0x123456789012345678901234567890123456789D",

    // Confirmation arbiters
    exclusiveRevocableConfirmationArbiter: "0x12345678901234567890123456789012345678B0",
    exclusiveUnrevocableConfirmationArbiter: "0x12345678901234567890123456789012345678B1",
    nonexclusiveRevocableConfirmationArbiter: "0x12345678901234567890123456789012345678B2",
    nonexclusiveUnrevocableConfirmationArbiter: "0x12345678901234567890123456789012345678B3",

    // Attestation Properties Arbiters
    recipientArbiter: "0x12345678901234567890123456789012345678C0",
    attesterArbiter: "0x12345678901234567890123456789012345678C1",
    schemaArbiter: "0x12345678901234567890123456789012345678C2",
    uidArbiter: "0x12345678901234567890123456789012345678C3",
    refUidArbiter: "0x12345678901234567890123456789012345678C4",
    revocableArbiter: "0x12345678901234567890123456789012345678C5",
    timeAfterArbiter: "0x12345678901234567890123456789012345678C6",
    timeBeforeArbiter: "0x12345678901234567890123456789012345678C7",
    timeEqualArbiter: "0x12345678901234567890123456789012345678C8",
    expirationTimeAfterArbiter: "0x12345678901234567890123456789012345678C9",
    expirationTimeBeforeArbiter: "0x12345678901234567890123456789012345678CA",
    expirationTimeEqualArbiter: "0x12345678901234567890123456789012345678CB",
  };

  describe("Static Codec Functions", () => {
    test("should encode and decode AnyArbiter demands using static codec", () => {
      const demand = {
        arbiters: [
          "0x1111111111111111111111111111111111111111",
          "0x2222222222222222222222222222222222222222",
        ] as `0x${string}`[],
        demands: ["0x", "0x"] as `0x${string}`[],
      };

      const encoded = AnyArbiter.encodeDemand(demand);
      const decoded = AnyArbiter.decodeDemand(encoded);

      expect(decoded.arbiters).toEqual(demand.arbiters);
      expect(decoded.demands).toEqual(demand.demands);
    });

    test("should encode and decode AllArbiter demands using static codec", () => {
      const demand = {
        arbiters: [
          "0x1111111111111111111111111111111111111111",
          "0x2222222222222222222222222222222222222222",
        ] as `0x${string}`[],
        demands: ["0x", "0x"] as `0x${string}`[],
      };

      const encoded = AllArbiter.encodeDemand(demand);
      const decoded = AllArbiter.decodeDemand(encoded);

      expect(decoded.arbiters).toEqual(demand.arbiters);
      expect(decoded.demands).toEqual(demand.demands);
    });

    test("AnyArbiter decoded result should include children array", () => {
      const demand = {
        arbiters: [
          "0x1111111111111111111111111111111111111111",
          "0x2222222222222222222222222222222222222222",
        ] as `0x${string}`[],
        demands: ["0xabcd", "0x1234"] as `0x${string}`[],
      };

      const encoded = AnyArbiter.encodeDemand(demand);
      const decoded = AnyArbiter.decodeDemand(encoded);

      expect(decoded.children).toBeDefined();
      expect(decoded.children).toHaveLength(2);
      expect(decoded.children![0]!.arbiter).toBe(demand.arbiters[0]!);
      expect(decoded.children![0]!.demand).toBe(demand.demands[0]!);
      expect(decoded.children![1]!.arbiter).toBe(demand.arbiters[1]!);
      expect(decoded.children![1]!.demand).toBe(demand.demands[1]!);
    });
  });

  describe("Escrow condition decoding", () => {
    test("decodes escrow condition through generic arbiter codecs without hiding TrustedOracle authority", () => {
      const wallet = createWalletClient({
        account: mockAddresses.recipientArbiter,
        chain: {
          id: 31337,
          name: "anvil",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
        },
        transport: custom({ request: async () => undefined }),
      });
      const client = makeClient(wallet, mockAddresses);
      const paymentDemandAbi = parseAbiParameters("(address token, uint256 amount, address payee)");
      const paymentDemand = encodeAbiParameters(paymentDemandAbi, [
        {
          token: mockAddresses.erc20PaymentObligation.toLowerCase() as `0x${string}`,
          amount: 123n,
          payee: mockAddresses.erc20EscrowObligation.toLowerCase() as `0x${string}`,
        },
      ]);
      const demand = encodeTrustedOracleDemand({
        oracle: mockAddresses.recipientArbiter.toLowerCase() as `0x${string}`,
        data: paymentDemand,
      });
      const escrowData = encodeAbiParameters(parseAbiParameters("(address arbiter, bytes demand)"), [
        {
          arbiter: mockAddresses.trustedOracleArbiter,
          demand,
        },
      ]);

      const condition = client.decodeEscrowCondition({ data: escrowData });

      expect(condition.arbiter).toBe(mockAddresses.trustedOracleArbiter);
      expect(condition.demand).toBe(demand);
      expect(condition.decoded.arbiter).toBe(mockAddresses.trustedOracleArbiter);
      expect(condition.decoded.decoded.oracle).toBe(mockAddresses.recipientArbiter.toLowerCase());
      expect(condition.decoded.decoded.data).toBe(paymentDemand);
    });

    test("does not decode TrustedOracle-shaped bytes when the arbiter address is unknown", () => {
      const wallet = createWalletClient({
        account: mockAddresses.recipientArbiter,
        chain: {
          id: 31337,
          name: "anvil",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
        },
        transport: custom({ request: async () => undefined }),
      });
      const client = makeClient(wallet, mockAddresses);
      const lookalikeArbiter = "0x9999999999999999999999999999999999999999" as `0x${string}`;
      const paymentDemand = encodeAbiParameters(parseAbiParameters("(address token, uint256 amount, address payee)"), [
        {
          token: mockAddresses.erc20PaymentObligation.toLowerCase() as `0x${string}`,
          amount: 123n,
          payee: mockAddresses.erc20EscrowObligation.toLowerCase() as `0x${string}`,
        },
      ]);
      const trustedOracleShapedDemand = encodeTrustedOracleDemand({
        oracle: mockAddresses.recipientArbiter.toLowerCase() as `0x${string}`,
        data: paymentDemand,
      });
      const escrowData = encodeAbiParameters(parseAbiParameters("(address arbiter, bytes demand)"), [
        {
          arbiter: lookalikeArbiter,
          demand: trustedOracleShapedDemand,
        },
      ]);

      const condition = client.decodeEscrowCondition({ data: escrowData });

      expect(condition.arbiter).toBe(lookalikeArbiter);
      expect(condition.demand).toBe(trustedOracleShapedDemand);
      expect(condition.decoded.arbiter).toBe(lookalikeArbiter);
      expect(condition.decoded.isUnknown).toBe(true);
      expect(condition.decoded.decoded).toEqual({ raw: trustedOracleShapedDemand });
    });
  });

  describe("Decoders Record Creation", () => {
    test("should create decoders record from addresses", () => {
      const decoders = createDecodersFromAddresses(mockAddresses);

      // Logical arbiters should be registered
      expect(decoders[mockAddresses.anyArbiter.toLowerCase() as `0x${string}`]).toBeDefined();
      expect(decoders[mockAddresses.allArbiter.toLowerCase() as `0x${string}`]).toBeDefined();

      // TrustedOracleArbiter should be registered
      expect(decoders[mockAddresses.trustedOracleArbiter.toLowerCase() as `0x${string}`]).toBeDefined();
    });

    test("should return empty result for unknown arbiter", () => {
      const decoders = createDecodersFromAddresses(mockAddresses);

      const unknownDemand: Demand = {
        arbiter: "0x9999999999999999999999999999999999999999",
        demand: "0x",
      };

      const result = decodeDemand(unknownDemand, decoders);

      expect(result.isUnknown).toBe(true);
      expect(result.arbiter).toBe(unknownDemand.arbiter);
      expect(result.decoded).toEqual({ raw: "0x" });
    });

    test("does not register zero addresses as known arbiters", () => {
      const decoders = createDecodersFromAddresses({
        ...mockAddresses,
        referencesEscrowArbiter: zeroAddress,
      });
      const result = decodeDemand(
        {
          arbiter: zeroAddress,
          demand: "0x",
        },
        decoders,
      );

      expect(decoders[zeroAddress]).toBeUndefined();
      expect(result.isUnknown).toBe(true);
      expect(result.arbiter).toBe(zeroAddress);
      expect(result.decoded).toEqual({ raw: "0x" });
    });

    test("should merge extension decoders by address", () => {
      const extensionArbiter = "0x9999999999999999999999999999999999999999" as `0x${string}`;
      const decoders = createDecodersFromAddresses(mockAddresses, {
        [extensionArbiter]: (data) => ({ extension: true, data }),
      });

      const result = decodeDemand(
        {
          arbiter: extensionArbiter,
          demand: "0x1234",
        },
        decoders,
      );

      expect(result.isUnknown).toBeUndefined();
      expect(result.decoded).toEqual({ extension: true, data: "0x1234" });
    });
  });

  describe("Demand Decoding", () => {
    test("should decode simple TrustedOracleArbiter demand", () => {
      const trustedOracleDemandData = {
        oracle: "0x1111111111111111111111111111111111111111" as `0x${string}`,
        data: "0x1234" as `0x${string}`,
      };

      const encodedDemand = encodeTrustedOracleDemand(trustedOracleDemandData);

      const demand: Demand = {
        arbiter: mockAddresses.trustedOracleArbiter,
        demand: encodedDemand,
      };

      const result = decodeDemandWithAddresses(demand, mockAddresses);

      expect(result.arbiter).toBe(mockAddresses.trustedOracleArbiter);
      expect(result.isUnknown).toBeUndefined();
      expect((result.decoded as any).oracle.toLowerCase()).toBe(trustedOracleDemandData.oracle.toLowerCase());
      expect(result.decoded).toHaveProperty("data");
    });

    test("should decode composed demand with nested arbiters", () => {
      // Create TrustedOracle demand for nested arbiter
      const trustedOracleDemand = encodeTrustedOracleDemand({
        oracle: "0x1111111111111111111111111111111111111111",
        data: "0x1234",
      });

      // Create a nested demand structure with AnyArbiter
      const nestedDemandData = {
        arbiters: [mockAddresses.trustedOracleArbiter, mockAddresses.trivialArbiter] as `0x${string}`[],
        demands: [trustedOracleDemand, "0x"] as `0x${string}`[],
      };

      const composedDemand: Demand = {
        arbiter: mockAddresses.anyArbiter,
        demand: AnyArbiter.encodeDemand(nestedDemandData),
      };

      const result = decodeDemandWithAddresses(composedDemand, mockAddresses);

      expect(result.arbiter).toBe(mockAddresses.anyArbiter);
      expect(result.children).toBeDefined();
      expect(result.children).toHaveLength(2);
      expect(result.children![0]!.arbiter).toBe(mockAddresses.trustedOracleArbiter);
      expect(result.children![1]!.arbiter).toBe(mockAddresses.trivialArbiter);
    });

    test("should handle deeply nested demands with AllArbiter", () => {
      // Create TrustedOracle demand
      const trustedOracleDemand = encodeTrustedOracleDemand({
        oracle: "0x3333333333333333333333333333333333333333",
        data: "0x9abc",
      });

      // Create inner AnyArbiter demand
      const innerAnyDemand = AnyArbiter.encodeDemand({
        arbiters: [mockAddresses.trustedOracleArbiter] as `0x${string}`[],
        demands: [trustedOracleDemand] as `0x${string}`[],
      });

      // Create outer AllArbiter demand containing the AnyArbiter
      const outerDemand: Demand = {
        arbiter: mockAddresses.allArbiter,
        demand: AllArbiter.encodeDemand({
          arbiters: [mockAddresses.anyArbiter, mockAddresses.trivialArbiter] as `0x${string}`[],
          demands: [innerAnyDemand, "0x"] as `0x${string}`[],
        }),
      };

      const result = decodeDemandWithAddresses(outerDemand, mockAddresses);

      expect(result.arbiter).toBe(mockAddresses.allArbiter);
      expect(result.children).toHaveLength(2);
      expect(result.children![0]!.arbiter).toBe(mockAddresses.anyArbiter);
      // The nested AnyArbiter should have its own children
      expect(result.children![0]!.children).toBeDefined();
    });

    test("should decode extension arbiters inside composing demands", () => {
      const extensionArbiter = "0x9999999999999999999999999999999999999999" as `0x${string}`;
      const composedDemand: Demand = {
        arbiter: mockAddresses.anyArbiter,
        demand: AnyArbiter.encodeDemand({
          arbiters: [extensionArbiter] as `0x${string}`[],
          demands: ["0xdeadbeef"] as `0x${string}`[],
        }),
      };

      const result = decodeDemandWithAddresses(composedDemand, mockAddresses, {
        [extensionArbiter]: (data) => ({ type: "ExtensionDemand", data }),
      });

      expect(result.arbiter).toBe(mockAddresses.anyArbiter);
      expect(result.children).toHaveLength(1);
      expect(result.children![0]!.arbiter).toBe(extensionArbiter);
      expect(result.children![0]!.isUnknown).toBeUndefined();
      expect(result.children![0]!.decoded).toEqual({
        type: "ExtensionDemand",
        data: "0xdeadbeef",
      });
    });
  });

  describe("Helper Functions", () => {
    test("should collect all arbiters from a decoded demand tree", () => {
      const trustedOracleDemand = encodeTrustedOracleDemand({
        oracle: "0x4444444444444444444444444444444444444444",
        data: "0xdef0",
      });

      const nestedDemandData = {
        arbiters: [mockAddresses.trustedOracleArbiter, mockAddresses.trivialArbiter] as `0x${string}`[],
        demands: [trustedOracleDemand, "0x"] as `0x${string}`[],
      };

      const composedDemand: Demand = {
        arbiter: mockAddresses.anyArbiter,
        demand: AnyArbiter.encodeDemand(nestedDemandData),
      };

      const result = decodeDemandWithAddresses(composedDemand, mockAddresses);

      // Helper function to collect all arbiters recursively
      const collectArbiters = (decoded: typeof result): `0x${string}`[] => {
        const arbiters: `0x${string}`[] = [decoded.arbiter];
        if (decoded.children) {
          for (const child of decoded.children) {
            arbiters.push(...collectArbiters(child));
          }
        }
        return arbiters;
      };

      const allArbiters = collectArbiters(result);

      expect(allArbiters).toHaveLength(3);
      expect(allArbiters).toContain(mockAddresses.anyArbiter);
      expect(allArbiters).toContain(mockAddresses.trustedOracleArbiter);
      expect(allArbiters).toContain(mockAddresses.trivialArbiter);
    });

    test("should identify unknown arbiters in the tree", () => {
      const unknownArbiter = "0x9999999999999999999999999999999999999999" as `0x${string}`;

      const nestedDemandData = {
        arbiters: [unknownArbiter, mockAddresses.trivialArbiter] as `0x${string}`[],
        demands: ["0xdeadbeef", "0x"] as `0x${string}`[],
      };

      const composedDemand: Demand = {
        arbiter: mockAddresses.anyArbiter,
        demand: AnyArbiter.encodeDemand(nestedDemandData),
      };

      const result = decodeDemandWithAddresses(composedDemand, mockAddresses);

      // The AnyArbiter itself should be decoded
      expect(result.isUnknown).toBeUndefined();

      // Check children - one should be unknown
      expect(result.children).toHaveLength(2);
      expect(result.children![0]!.isUnknown).toBe(true);
      expect(result.children![0]!.decoded).toEqual({ raw: "0xdeadbeef" });
    });

    test("should check if entire demand tree is fully parseable", () => {
      // All known arbiters
      const trustedOracleDemand = encodeTrustedOracleDemand({
        oracle: "0x5555555555555555555555555555555555555555",
        data: "0x",
      });

      const fullyParseableDemand: Demand = {
        arbiter: mockAddresses.anyArbiter,
        demand: AnyArbiter.encodeDemand({
          arbiters: [mockAddresses.trustedOracleArbiter] as `0x${string}`[],
          demands: [trustedOracleDemand] as `0x${string}`[],
        }),
      };

      const result = decodeDemandWithAddresses(fullyParseableDemand, mockAddresses);

      // Helper to check if fully parseable
      const isFullyParseable = (decoded: typeof result): boolean => {
        if (decoded.isUnknown) return false;
        if (decoded.children) {
          return decoded.children.every((child) => isFullyParseable(child));
        }
        return true;
      };

      expect(isFullyParseable(result)).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty demands array in composing arbiter", () => {
      const emptyDemand: Demand = {
        arbiter: mockAddresses.anyArbiter,
        demand: AnyArbiter.encodeDemand({
          arbiters: [] as `0x${string}`[],
          demands: [] as `0x${string}`[],
        }),
      };

      const result = decodeDemandWithAddresses(emptyDemand, mockAddresses);

      expect(result.arbiter).toBe(mockAddresses.anyArbiter);
      expect(result.children).toBeDefined();
      expect(result.children).toHaveLength(0);
    });

    test("should handle single arbiter in composing demand", () => {
      const singleDemand: Demand = {
        arbiter: mockAddresses.allArbiter,
        demand: AllArbiter.encodeDemand({
          arbiters: [mockAddresses.trivialArbiter] as `0x${string}`[],
          demands: ["0x"] as `0x${string}`[],
        }),
      };

      const result = decodeDemandWithAddresses(singleDemand, mockAddresses);

      expect(result.children).toHaveLength(1);
      expect(result.children![0]!.arbiter).toBe(mockAddresses.trivialArbiter);
    });
  });
});
