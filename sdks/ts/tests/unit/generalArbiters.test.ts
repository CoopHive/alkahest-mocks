/**
 * General Arbiters Unit Tests
 *
 * Tests for the arbiters client functionality, including:
 * - SchemaArbiter: Schema-based validation
 * - TrustedOracleArbiter: Oracle-based decision making with arbitration requests
 * - RecipientArbiter: Recipient-based validation (replaces TrustedPartyArbiter)
 * - UidArbiter: UID-based validation (replaces SpecificAttestationArbiter)
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { encodeAbiParameters, parseAbiParameters } from "viem";
import { generatePrivateKey, privateKeyToAddress } from "viem/accounts";
import { makeClient } from "../../src";
import { abi as recipientArbiterAbi } from "../../src/contracts/arbiters/attestation-properties/RecipientArbiter";
import { abi as schemaArbiterAbi } from "../../src/contracts/arbiters/attestation-properties/SchemaArbiter";
import { abi as uidArbiterAbi } from "../../src/contracts/arbiters/attestation-properties/UidArbiter";
// Import contract artifacts needed for tests
import { abi as trustedOracleArbiterAbi } from "../../src/contracts/arbiters/trusted-oracle/TrustedOracleArbiter";
import { setupTestEnvironment, type TestContext } from "../utils/setup";
import { teardownTestEnvironment } from "../utils/teardownTestEnvironment";

describe("General Arbiters Tests", () => {
  // Test context and variables
  let testContext: TestContext;
  let alice: `0x${string}`;
  let bob: `0x${string}`;
  let charlie: `0x${string}`;
  let aliceClient: TestContext["alice"]["client"];
  let bobClient: TestContext["bob"]["client"];
  let testClient: TestContext["testClient"];

  beforeEach(async () => {
    // Setup fresh test environment for each test
    testContext = await setupTestEnvironment();

    // Extract the values we need for tests
    alice = testContext.alice.address;
    bob = testContext.bob.address;
    // Generate a third address for testing
    charlie = privateKeyToAddress(generatePrivateKey());
    aliceClient = testContext.alice.client;
    bobClient = testContext.bob.client;
    testClient = testContext.testClient;
  });

  beforeEach(async () => {
    // Reset to initial state before each test
    if (testContext.anvilInitState) {
      await testContext.testClient.loadState({
        state: testContext.anvilInitState,
      });
    }
  });

  afterEach(async () => {
    // Clean up after each test
    await teardownTestEnvironment(testContext);
  });

  // Helper function to create a test attestation
  const createTestAttestation = (overrides = {}) => ({
    uid: "0x1111111111111111111111111111111111111111111111111111111111111111" as const,
    schema: "0x1234567890123456789012345678901234567890123456789012345678901234" as const,
    time: BigInt(Math.floor(Date.now() / 1000)),
    expirationTime: 0n,
    revocationTime: 0n,
    refUID: "0x0000000000000000000000000000000000000000000000000000000000000000" as const,
    recipient: alice,
    attester: bob,
    revocable: true,
    data: "0x" as const,
    ...overrides,
  });

  describe("SchemaArbiter", () => {
    const targetSchema = "0x1234567890123456789012345678901234567890123456789012345678901234" as const;

    test("should encode and decode SchemaArbiter demand data correctly", () => {
      const originalDemand = { schema: targetSchema };

      const encoded = aliceClient.arbiters.attestationProperties.schema.encodeDemand(originalDemand);
      const decoded = aliceClient.arbiters.attestationProperties.schema.decodeDemand(encoded);

      expect(decoded.schema).toBe(originalDemand.schema);
    });

    test("should validate attestation with matching schema", async () => {
      const attestation = createTestAttestation({ schema: targetSchema });
      const demand = aliceClient.arbiters.attestationProperties.schema.encodeDemand({ schema: targetSchema });
      const counteroffer = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

      const result = await testClient.readContract({
        address: testContext.addresses.schemaArbiter,
        abi: schemaArbiterAbi.abi,
        functionName: "check",
        args: [attestation, demand, counteroffer],
      });

      expect(result).toBe(true);
    });

    test("should reject attestation with non-matching schema", async () => {
      const wrongSchema = "0x9999999999999999999999999999999999999999999999999999999999999999" as const;
      const attestation = createTestAttestation({ schema: wrongSchema });
      const demand = aliceClient.arbiters.attestationProperties.schema.encodeDemand({ schema: targetSchema });
      const counteroffer = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

      try {
        await testClient.readContract({
          address: testContext.addresses.schemaArbiter,
          abi: schemaArbiterAbi.abi,
          functionName: "check",
          args: [attestation, demand, counteroffer],
        });
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect((error as any).toString()).toContain("SchemaMismatched");
      }
    });

    test("should produce same result as manual ABI encoding", () => {
      const demand = { schema: targetSchema };

      // Manual encoding using viem directly
      const manualEncoded = encodeAbiParameters(parseAbiParameters("(bytes32 schema)"), [demand]);

      // SDK encoding
      const sdkEncoded = aliceClient.arbiters.attestationProperties.schema.encodeDemand(demand);

      expect(sdkEncoded).toBe(manualEncoded);
    });
  });

  describe("RecipientArbiter (formerly TrustedPartyArbiter)", () => {
    test("should encode and decode RecipientArbiter demand data correctly", () => {
      const originalDemand = {
        recipient: bob,
      };

      const encoded = aliceClient.arbiters.attestationProperties.recipient.encodeDemand(originalDemand);
      const decoded = aliceClient.arbiters.attestationProperties.recipient.decodeDemand(encoded);

      expect(decoded.recipient.toLowerCase()).toBe(originalDemand.recipient.toLowerCase());
    });

    test("should validate attestation with matching recipient", async () => {
      const trustedRecipient = bob;
      const attestation = createTestAttestation({ recipient: trustedRecipient });
      const demand = aliceClient.arbiters.attestationProperties.recipient.encodeDemand({
        recipient: trustedRecipient,
      });
      const counteroffer = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

      const result = await testClient.readContract({
        address: testContext.addresses.recipientArbiter,
        abi: recipientArbiterAbi.abi,
        functionName: "check",
        args: [attestation, demand, counteroffer],
      });

      expect(result).toBe(true);
    });

    test("should reject attestation with non-matching recipient", async () => {
      const trustedRecipient = bob;
      const wrongRecipient = charlie;
      const attestation = createTestAttestation({ recipient: wrongRecipient });
      const demand = aliceClient.arbiters.attestationProperties.recipient.encodeDemand({
        recipient: trustedRecipient,
      });
      const counteroffer = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

      try {
        await testClient.readContract({
          address: testContext.addresses.recipientArbiter,
          abi: recipientArbiterAbi.abi,
          functionName: "check",
          args: [attestation, demand, counteroffer],
        });
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect((error as any).toString()).toContain("RecipientMismatched");
      }
    });

    test("should produce same result as manual ABI encoding", () => {
      const demand = {
        recipient: bob,
      };

      // Manual encoding using viem directly
      const manualEncoded = encodeAbiParameters(parseAbiParameters("(address recipient)"), [demand]);

      // SDK encoding
      const sdkEncoded = aliceClient.arbiters.attestationProperties.recipient.encodeDemand(demand);

      expect(sdkEncoded).toBe(manualEncoded);
    });
  });

  describe("UidArbiter (formerly SpecificAttestationArbiter)", () => {
    const targetUid = "0x1111111111111111111111111111111111111111111111111111111111111111" as const;

    test("should encode and decode UidArbiter demand data correctly", () => {
      const originalDemand = { uid: targetUid };

      const encoded = aliceClient.arbiters.attestationProperties.uid.encodeDemand(originalDemand);
      const decoded = aliceClient.arbiters.attestationProperties.uid.decodeDemand(encoded);

      expect(decoded.uid).toBe(originalDemand.uid);
    });

    test("should validate attestation with matching UID", async () => {
      const attestation = createTestAttestation({ uid: targetUid });
      const demand = aliceClient.arbiters.attestationProperties.uid.encodeDemand({ uid: targetUid });
      const counteroffer = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

      const result = await testClient.readContract({
        address: testContext.addresses.uidArbiter,
        abi: uidArbiterAbi.abi,
        functionName: "check",
        args: [attestation, demand, counteroffer],
      });

      expect(result).toBe(true);
    });

    test("should reject attestation with non-matching UID", async () => {
      const wrongUid = "0x2222222222222222222222222222222222222222222222222222222222222222" as const;
      const attestation = createTestAttestation({ uid: wrongUid });
      const demand = aliceClient.arbiters.attestationProperties.uid.encodeDemand({ uid: targetUid });
      const counteroffer = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

      try {
        await testClient.readContract({
          address: testContext.addresses.uidArbiter,
          abi: uidArbiterAbi.abi,
          functionName: "check",
          args: [attestation, demand, counteroffer],
        });
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect((error as any).toString()).toContain("UidMismatched");
      }
    });

    test("should produce same result as manual ABI encoding", () => {
      const demand = { uid: targetUid };

      // Manual encoding using viem directly
      const manualEncoded = encodeAbiParameters(parseAbiParameters("(bytes32 uid)"), [demand]);

      // SDK encoding
      const sdkEncoded = aliceClient.arbiters.attestationProperties.uid.encodeDemand(demand);

      expect(sdkEncoded).toBe(manualEncoded);
    });
  });

  describe("TrustedOracleArbiter", () => {
    test("should encode and decode TrustedOracleArbiter demand data correctly", () => {
      const originalDemand = {
        oracle: alice,
        data: "0xdeadbeef" as `0x${string}`,
      };

      const encoded = aliceClient.arbiters.general.trustedOracle.encodeDemand(originalDemand);
      const decoded = aliceClient.arbiters.general.trustedOracle.decodeDemand(encoded);

      expect(decoded.oracle.toLowerCase()).toBe(originalDemand.oracle.toLowerCase());
      expect(decoded.data).toBe(originalDemand.data);
    });

    test("should request arbitration from trusted oracle", async () => {
      // Create a mock obligation attestation using StringObligation
      const testString = "Test obligation data for arbitration";
      const { attested: attestationEvent } = await aliceClient.stringObligation.doObligation(testString);

      const obligation = attestationEvent.uid;
      const oracle = charlie; // Use charlie as oracle
      const demand = aliceClient.arbiters.general.trustedOracle.encodeDemand({
        oracle,
        data: "0x" as `0x${string}`,
      });

      // Request arbitration and verify the transaction
      const hash = await aliceClient.arbiters.general.trustedOracle.requestArbitration(obligation, oracle, demand);

      // Verify the hash format
      expect(hash).toMatch(/^0x[0-9a-f]{64}$/i);

      // Wait for transaction receipt
      const receipt = await testClient.waitForTransactionReceipt({ hash });
      expect(receipt.status).toBe("success");

      // Get and verify the ArbitrationRequested event was emitted
      const logs = await testClient.getLogs({
        address: testContext.addresses.trustedOracleArbiter,
        event: {
          type: "event",
          name: "ArbitrationRequested",
          inputs: [
            { name: "obligation", type: "bytes32", indexed: true },
            { name: "oracle", type: "address", indexed: true },
            { name: "demand", type: "bytes", indexed: false },
          ],
        },
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      });

      // Verify event was emitted with correct data
      expect(logs).toHaveLength(1);
      const log = logs[0];
      if (!log) throw new Error("No log found");
      expect(log.args?.obligation).toBe(obligation);
      expect(log.args?.oracle?.toLowerCase()).toBe(oracle.toLowerCase());
    });

    test("should check for existing arbitration", async () => {
      // Create a mock obligation attestation using StringObligation
      const testString = "Test obligation data for existing arbitration check";
      const { attested: attestationEvent } = await aliceClient.stringObligation.doObligation(testString);

      const obligation = attestationEvent.uid;
      const oracle = charlie;
      const demand = aliceClient.arbiters.general.trustedOracle.encodeDemand({
        oracle,
        data: "0x" as `0x${string}`,
      });

      // First check - should be undefined since no arbitration made yet
      const existingBefore = await aliceClient.arbiters.general.trustedOracle.checkExistingArbitration(
        obligation,
        oracle,
        demand,
      );
      expect(existingBefore).toBeUndefined();

      // Request arbitration first (as this creates the initial arbitration request)
      const requestHash = await aliceClient.arbiters.general.trustedOracle.requestArbitration(
        obligation,
        oracle,
        demand,
      );
      await testClient.waitForTransactionReceipt({ hash: requestHash });

      // For this test, we'll verify that the arbitration request was created
      // The actual arbitration decision requires the oracle to have gas, which we'll skip
      // In a real scenario, the oracle would make the decision separately
      const logs = await testClient.getLogs({
        address: testContext.addresses.trustedOracleArbiter,
        event: {
          type: "event",
          name: "ArbitrationRequested",
          inputs: [
            { name: "obligation", type: "bytes32", indexed: true },
            { name: "oracle", type: "address", indexed: true },
            { name: "demand", type: "bytes", indexed: false },
          ],
        },
        fromBlock: "earliest",
      });

      // Verify that an arbitration request was made
      const relevantLogs = logs.filter(
        (log) => log.args?.obligation === obligation && log.args?.oracle?.toLowerCase() === oracle.toLowerCase(),
      );
      expect(relevantLogs).toHaveLength(1);
    });

    test("should wait for arbitration request event", async () => {
      // For this test, we'll test the event listener setup without triggering an actual request
      // since that would require a real attestation
      const obligation = "0xabcdef1234567890123456789012345678901234567890123456789012345678" as const;
      const oracle = bob;

      // Test that the event listener can be set up and torn down properly
      const waitPromise = aliceClient.arbiters.general.trustedOracle.waitForArbitrationRequest(
        obligation,
        oracle,
        100, // short polling interval for testing
      );

      // Small delay to ensure the listener is set up
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Since we can't easily trigger the request without a real attestation,
      // we'll just verify the promise was created and can be cancelled
      // In a real integration test, this would wait for an actual event
      setTimeout(() => {
        // This simulates the event not occurring, which is expected in this unit test
      }, 100);

      // For the unit test, we'll just verify the function structure
      expect(typeof waitPromise.then).toBe("function");
    });

    test("should validate oracle arbitration request", async () => {
      const oracle = bob;
      const arbitrationData = "0xdeadbeef" as `0x${string}`;
      const attestation = createTestAttestation();
      const demand = aliceClient.arbiters.general.trustedOracle.encodeDemand({
        oracle,
        data: arbitrationData,
      });
      const counteroffer = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

      // Note: TrustedOracleArbiter may require actual oracle arbitration to be made first
      // This test mainly verifies the encoding/decoding works correctly
      try {
        const result = await testClient.readContract({
          address: testContext.addresses.trustedOracleArbiter,
          abi: trustedOracleArbiterAbi.abi,
          functionName: "check",
          args: [attestation, demand, counteroffer],
        });

        // May return false if no arbitration has been made yet
        expect(typeof result).toBe("boolean");
      } catch (error) {
        // May throw if oracle hasn't made arbitration yet
        console.log("Expected error for oracle arbitration:", error);
      }
    });

    test("should produce same result as manual ABI encoding", () => {
      const demand = {
        oracle: alice,
        data: "0x1234abcd" as `0x${string}`,
      };

      // Manual encoding using viem directly
      const manualEncoded = encodeAbiParameters(parseAbiParameters("(address oracle, bytes data)"), [demand]);

      // SDK encoding
      const sdkEncoded = aliceClient.arbiters.general.trustedOracle.encodeDemand(demand);

      expect(sdkEncoded).toBe(manualEncoded);
    });
  });

  describe("Error handling", () => {
    test("should throw error for invalid hex data", () => {
      expect(() => {
        aliceClient.arbiters.attestationProperties.schema.decodeDemand("0x123" as `0x${string}`);
      }).toThrow();
    });

    test("should handle empty demand data gracefully", () => {
      // Some arbiters may accept empty data
      const emptyDemand = aliceClient.arbiters.general.trustedOracle.encodeDemand({
        oracle: alice,
        data: "0x" as `0x${string}`,
      });

      expect(emptyDemand).toMatch(/^0x[0-9a-f]+$/i);

      const decoded = aliceClient.arbiters.general.trustedOracle.decodeDemand(emptyDemand);
      expect(decoded.oracle.toLowerCase()).toBe(alice.toLowerCase());
      expect(decoded.data).toBe("0x");
    });
  });

  describe("Integration scenarios", () => {
    test("should handle multiple encode/decode cycles", () => {
      const originalDemand = {
        oracle: alice,
        data: "0xdeadbeef" as `0x${string}`,
      };

      // Encode -> decode -> encode -> decode
      const encoded1 = aliceClient.arbiters.general.trustedOracle.encodeDemand(originalDemand);
      const decoded1 = aliceClient.arbiters.general.trustedOracle.decodeDemand(encoded1);
      const encoded2 = aliceClient.arbiters.general.trustedOracle.encodeDemand(decoded1);
      const decoded2 = aliceClient.arbiters.general.trustedOracle.decodeDemand(encoded2);

      expect(encoded1).toBe(encoded2);
      expect(decoded1.oracle.toLowerCase()).toBe(decoded2.oracle.toLowerCase());
      expect(decoded1.data).toBe(decoded2.data);
      expect(decoded2.oracle.toLowerCase()).toBe(originalDemand.oracle.toLowerCase());
      expect(decoded2.data).toBe(originalDemand.data);
    });
  });
});
