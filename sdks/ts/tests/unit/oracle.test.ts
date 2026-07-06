import { afterAll, beforeAll, beforeEach, expect, test } from "bun:test";
import { decodeAbiParameters, encodeAbiParameters, parseAbiParameters } from "viem";
import { setupTestEnvironment, type TestContext } from "../utils/setup";
import { teardownTestEnvironment } from "../utils/teardownTestEnvironment";

let testContext: TestContext;

beforeAll(async () => {
  testContext = await setupTestEnvironment();
});

beforeEach(async () => {
  // Reset to initial state before each test
  if (testContext.anvilInitState) {
    await testContext.testClient.loadState({
      state: testContext.anvilInitState,
    });
  }
});

afterAll(async () => {
  // Clean up
  await teardownTestEnvironment(testContext);
});

test("trivial arbitrateMany with mode past", async () => {
  const arbiter = testContext.addresses.trustedOracleArbiter;
  const demand = testContext.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle: testContext.bob.address,
    data: encodeAbiParameters(parseAbiParameters("(string mockDemand)"), [{ mockDemand: "foo" }]),
  });

  const { attested: escrow } = await testContext.alice.client.erc20.escrow.default.permitAndCreate(
    {
      address: testContext.mockAddresses.erc20A,
      value: 10n,
    },
    { arbiter, demand },
    0n,
  );

  const { attested: fulfillment } = await testContext.bob.client.stringObligation.doObligation("foo", undefined, escrow.uid);

  // Request arbitration
  const requestHash = await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    fulfillment.uid,
    testContext.bob.address,
    demand,
  );

  // Wait for arbitration request to be confirmed
  await testContext.testClient.waitForTransactionReceipt({
    hash: requestHash,
  });

  const obligationAbi = parseAbiParameters("(string item, bytes32 schema)");
  const { decisions } = await testContext.bob.client.arbiters.general.trustedOracle.arbitrateMany(async ({ attestation }) => {
    const obligation = testContext.bob.client.extractObligationData(obligationAbi, attestation);
    return true;
  }, { mode: "past" });

  decisions.forEach(($) => expect($.decision).toBe(true));

  const collectionHash = await testContext.bob.client.erc20.escrow.default.collect(escrow.uid, fulfillment.uid);

  expect(collectionHash).toBeTruthy();
});

test("conditional arbitrateMany", async () => {
  const arbiter = testContext.addresses.trustedOracleArbiter;
  const demand = testContext.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle: testContext.bob.address,
    data: encodeAbiParameters(parseAbiParameters("(string mockDemand)"), [{ mockDemand: "foo" }]),
  });

  const { attested: escrow } = await testContext.alice.client.erc20.escrow.default.permitAndCreate(
    {
      address: testContext.mockAddresses.erc20A,
      value: 10n,
    },
    { arbiter, demand },
    0n,
  );

  const { attested: fulfillment1 } = await testContext.bob.client.stringObligation.doObligation("good", undefined, escrow.uid);

  const { attested: fulfillment2 } = await testContext.bob.client.stringObligation.doObligation("bad", undefined, escrow.uid);

  // Request arbitration for both
  const requestHash1 = await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    fulfillment1.uid,
    testContext.bob.address,
    demand,
  );
  const requestHash2 = await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    fulfillment2.uid,
    testContext.bob.address,
    demand,
  );

  // Wait for arbitration requests to be confirmed
  await testContext.testClient.waitForTransactionReceipt({
    hash: requestHash1,
  });
  await testContext.testClient.waitForTransactionReceipt({
    hash: requestHash2,
  });

  const obligationAbi = parseAbiParameters("(string item, bytes32 schema)");
  const { decisions } = await testContext.bob.client.arbiters.general.trustedOracle.arbitrateMany(async ({ attestation }) => {
    const obligation = testContext.bob.client.extractObligationData(obligationAbi, attestation);
    return obligation[0].item === "good";
  }, { mode: "past" });

  expect(decisions.length).toBe(2);
  expect(decisions.filter((d) => d.decision).length).toBe(1);

  const failedCollection = testContext.bob.client.erc20.escrow.default.collect(escrow.uid, fulfillment2.uid);
  expect(async () => await failedCollection).toThrow();

  const collectionHash = await testContext.bob.client.erc20.escrow.default.collect(escrow.uid, fulfillment1.uid);

  expect(collectionHash).toBeTruthy();
});

test("arbitrateMany with pastUnarbitrated skips already arbitrated", async () => {
  const arbiter = testContext.addresses.trustedOracleArbiter;
  const demand = testContext.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle: testContext.bob.address,
    data: encodeAbiParameters(parseAbiParameters("(string mockDemand)"), [{ mockDemand: "foo" }]),
  });

  const { attested: escrow } = await testContext.alice.client.erc20.escrow.default.permitAndCreate(
    {
      address: testContext.mockAddresses.erc20A,
      value: 10n,
    },
    { arbiter, demand },
    0n,
  );

  const { attested: fulfillment } = await testContext.bob.client.stringObligation.doObligation("foo", undefined, escrow.uid);

  // Request arbitration
  const requestHash = await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    fulfillment.uid,
    testContext.bob.address,
    demand,
  );

  // Wait for arbitration request to be confirmed
  await testContext.testClient.waitForTransactionReceipt({
    hash: requestHash,
  });

  const obligationAbi = parseAbiParameters("(string item, bytes32 schema)");

  // First arbitration
  const { decisions: firstDecisions } = await testContext.bob.client.arbiters.general.trustedOracle.arbitrateMany(
    async ({ attestation }) => {
      const obligation = testContext.bob.client.extractObligationData(obligationAbi, attestation);
      return obligation[0].item === "foo";
    },
    { mode: "past" },
  );

  expect(firstDecisions.length).toBe(1);

  // Wait for transaction confirmation
  const firstDecision = firstDecisions[0];
  if (!firstDecision) throw new Error("No first decision found");
  await testContext.testClient.waitForTransactionReceipt({
    hash: firstDecision.hash,
  });

  // Second arbitration with pastUnarbitrated should find nothing
  const { decisions: secondDecisions } = await testContext.bob.client.arbiters.general.trustedOracle.arbitrateMany(
    async ({ attestation }) => {
      const obligation = testContext.bob.client.extractObligationData(obligationAbi, attestation);
      return obligation[0].item === "foo";
    },
    { mode: "pastUnarbitrated" },
  );

  expect(secondDecisions.length).toBe(0);
});

test("TrustedOracle status helpers ignore wrong decision context", async () => {
  const arbiter = testContext.addresses.trustedOracleArbiter;
  const demand = testContext.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle: testContext.bob.address,
    data: encodeAbiParameters(parseAbiParameters("(string mockDemand)"), [{ mockDemand: "foo" }]),
  });

  const { attested: escrow } = await testContext.alice.client.erc20.escrow.default.permitAndCreate(
    {
      address: testContext.mockAddresses.erc20A,
      value: 10n,
    },
    { arbiter, demand },
    0n,
  );

  const { attested: fulfillment } = await testContext.bob.client.stringObligation.doObligation("foo", undefined, escrow.uid);

  const requestHash = await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    fulfillment.uid,
    testContext.bob.address,
    demand,
  );
  await testContext.testClient.waitForTransactionReceipt({ hash: requestHash });

  const wrongDecisionHash = await testContext.bob.client.arbiters.general.trustedOracle.arbitrateRaw(
    fulfillment.uid,
    demand,
    true,
  );
  await testContext.testClient.waitForTransactionReceipt({ hash: wrongDecisionHash });

  const existingWrong = await testContext.bob.client.arbiters.general.trustedOracle.checkExistingArbitration(
    fulfillment.uid,
    testContext.bob.address,
    demand,
  );
  expect(existingWrong).toBeUndefined();

  const pendingWait = testContext.bob.client.arbiters.general.trustedOracle
    .waitForArbitration(fulfillment.uid, testContext.bob.address, demand, 50)
    .then(() => "resolved");
  const waitRace = await Promise.race([pendingWait, Bun.sleep(150).then(() => "timeout")]);
  expect(waitRace).toBe("timeout");

  const obligationAbi = parseAbiParameters("(string item, bytes32 schema)");
  const { decisions } = await testContext.bob.client.arbiters.general.trustedOracle.arbitrateMany(
    async ({ attestation }) => {
      const obligation = testContext.bob.client.extractObligationData(obligationAbi, attestation);
      return obligation[0].item === "foo";
    },
    { mode: "pastUnarbitrated" },
  );

  expect(decisions.length).toBe(1);
  const firstDecision = decisions[0];
  if (!firstDecision) throw new Error("No decision found");
  await testContext.testClient.waitForTransactionReceipt({ hash: firstDecision.hash });

  const waited = await pendingWait;
  expect(waited).toBe("resolved");

  const collectionHash = await testContext.bob.client.erc20.escrow.default.collect(escrow.uid, fulfillment.uid);
  expect(collectionHash).toBeTruthy();
});

test("arbitrateMany with mode all (past + future)", async () => {
  const arbiter = testContext.addresses.trustedOracleArbiter;
  const demand = testContext.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle: testContext.bob.address,
    data: encodeAbiParameters(parseAbiParameters("(string mockDemand)"), [{ mockDemand: "foo" }]),
  });

  const { attested: escrow } = await testContext.alice.client.erc20.escrow.default.permitAndCreate(
    {
      address: testContext.mockAddresses.erc20A,
      value: 10n,
    },
    { arbiter, demand },
    0n,
  );

  const obligationAbi = parseAbiParameters("(string item, bytes32 schema)");
  const { decisions, unwatch } = await testContext.bob.client.arbiters.general.trustedOracle.arbitrateMany(
    async ({ attestation }) => {
      const obligation = testContext.bob.client.extractObligationData(obligationAbi, attestation);
      return true;
    },
    {
      mode: "all",
      onAfterArbitrate: async (decision) => {
        const obligation = testContext.bob.client.extractObligationData(obligationAbi, decision.attestation);
        expect(decision.attestation.uid).toEqual(fulfillment.uid);
        expect(obligation[0].item).toEqual("foo");
        expect(decision.decision).toBe(true);
      },
      pollingInterval: 50,
    },
  );

  const { attested: fulfillment } = await testContext.bob.client.stringObligation.doObligation("foo", undefined, escrow.uid);

  // Request arbitration
  await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    fulfillment.uid,
    testContext.bob.address,
    demand,
  );

  await Bun.sleep(150);

  const collectionHash = await testContext.bob.client.erc20.escrow.default.collect(escrow.uid, fulfillment.uid);

  expect(collectionHash).toBeTruthy();

  unwatch();
});

test("arbitrateMany with mode future (only new events)", async () => {
  const arbiter = testContext.addresses.trustedOracleArbiter;
  const demand = testContext.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle: testContext.bob.address,
    data: encodeAbiParameters(parseAbiParameters("(string mockDemand)"), [{ mockDemand: "foo" }]),
  });

  const { attested: escrow } = await testContext.alice.client.erc20.escrow.default.permitAndCreate(
    {
      address: testContext.mockAddresses.erc20A,
      value: 10n,
    },
    { arbiter, demand },
    0n,
  );

  const obligationAbi = parseAbiParameters("(string item, bytes32 schema)");

  // Start listening with mode: "future" - only new events
  const { decisions, unwatch } = await testContext.bob.client.arbiters.general.trustedOracle.arbitrateMany(
    async ({ attestation }) => {
      const obligation = testContext.bob.client.extractObligationData(obligationAbi, attestation);
      return obligation[0].item === "good";
    },
    {
      mode: "future",
      pollingInterval: 50,
    },
  );

  expect(decisions.length).toBe(0); // Should not arbitrate past

  // Create new fulfillment
  const { attested: fulfillment } = await testContext.bob.client.stringObligation.doObligation("good", undefined, escrow.uid);

  // Request arbitration
  await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    fulfillment.uid,
    testContext.bob.address,
    demand,
  );

  await Bun.sleep(150);

  const collectionHash = await testContext.bob.client.erc20.escrow.default.collect(escrow.uid, fulfillment.uid);

  expect(collectionHash).toBeTruthy();

  unwatch();
});

test("arbitrateMany with escrow demand extraction", async () => {
  const arbiter = testContext.addresses.trustedOracleArbiter;
  const demand = testContext.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle: testContext.bob.address,
    data: encodeAbiParameters(parseAbiParameters("(string mockDemand)"), [{ mockDemand: "foo" }]),
  });

  const { attested: escrow } = await testContext.alice.client.erc20.escrow.default.permitAndCreate(
    {
      address: testContext.mockAddresses.erc20A,
      value: 10n,
    },
    { arbiter, demand },
    0n,
  );

  const { attested: fulfillment1 } = await testContext.bob.client.stringObligation.doObligation("foo", undefined, escrow.uid);

  const { attested: fulfillment2 } = await testContext.bob.client.stringObligation.doObligation("bar", undefined, escrow.uid);

  // Request arbitration for both
  const requestHash1 = await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    fulfillment1.uid,
    testContext.bob.address,
    demand,
  );
  const requestHash2 = await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    fulfillment2.uid,
    testContext.bob.address,
    demand,
  );

  // Wait for arbitration requests to be confirmed
  await testContext.testClient.waitForTransactionReceipt({
    hash: requestHash1,
  });
  await testContext.testClient.waitForTransactionReceipt({
    hash: requestHash2,
  });

  const obligationAbi = parseAbiParameters("(string item, bytes32 schema)");
  const demandAbi = parseAbiParameters("(string mockDemand)");

  const { decisions } = await testContext.bob.client.arbiters.general.trustedOracle.arbitrateMany(async ({ attestation, demand }) => {
    const obligation = testContext.bob.client.extractObligationData(obligationAbi, attestation);
    // Use demand directly from callback instead of fetching from escrow
    // First decode the outer TrustedOracleArbiter DemandData struct, then decode the inner data
    const outerDemand = testContext.bob.client.arbiters.general.trustedOracle.decodeDemand(demand);
    const demandData = decodeAbiParameters(demandAbi, outerDemand.data);
    return obligation[0].item === demandData[0].mockDemand;
  }, { mode: "past" });

  expect(decisions.length).toBe(2);
  expect(decisions.filter((d) => d.decision).length).toBe(1);

  const failedCollection = testContext.bob.client.erc20.escrow.default.collect(escrow.uid, fulfillment2.uid);
  expect(async () => await failedCollection).toThrow();

  const collectionHash = await testContext.bob.client.erc20.escrow.default.collect(escrow.uid, fulfillment1.uid);

  expect(collectionHash).toBeTruthy();
});

test("waitForArbitration with existing decision", async () => {
  const arbiter = testContext.addresses.trustedOracleArbiter;
  const demand = testContext.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle: testContext.bob.address,
    data: encodeAbiParameters(parseAbiParameters("(string mockDemand)"), [{ mockDemand: "foo" }]),
  });

  const { attested: escrow } = await testContext.alice.client.erc20.escrow.default.permitAndCreate(
    {
      address: testContext.mockAddresses.erc20A,
      value: 10n,
    },
    { arbiter, demand },
    0n,
  );

  const { attested: fulfillment } = await testContext.bob.client.stringObligation.doObligation("foo", undefined, escrow.uid);

  // Request arbitration
  const requestHash = await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    fulfillment.uid,
    testContext.bob.address,
    demand,
  );
  await testContext.testClient.waitForTransactionReceipt({
    hash: requestHash,
  });

  // Make arbitration decision
  const obligationAbi = parseAbiParameters("(string item, bytes32 schema)");
  const { decisions } = await testContext.bob.client.arbiters.general.trustedOracle.arbitrateMany(async ({ attestation }) => {
    const obligation = testContext.bob.client.extractObligationData(obligationAbi, attestation);
    return obligation[0].item === "foo";
  }, { mode: "past" });

  // Wait for arbitration transaction to be confirmed
  if (decisions[0]) {
    await testContext.testClient.waitForTransactionReceipt({
      hash: decisions[0].hash,
    });
  }

  // waitForArbitration should immediately return the existing decision
  const result = await testContext.bob.client.arbiters.general.trustedOracle.waitForArbitration(
    fulfillment.uid,
    testContext.bob.address,
    demand,
  );

  expect(result.fulfillmentUid).toBe(fulfillment.uid);
  expect(result.oracle).toBe(testContext.bob.address);
  expect(result.decision).toBe(true);
});

test("waitForArbitration with new decision", async () => {
  const arbiter = testContext.addresses.trustedOracleArbiter;
  const demand = testContext.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle: testContext.bob.address,
    data: encodeAbiParameters(parseAbiParameters("(string mockDemand)"), [{ mockDemand: "foo" }]),
  });

  const { attested: escrow } = await testContext.alice.client.erc20.escrow.default.permitAndCreate(
    {
      address: testContext.mockAddresses.erc20A,
      value: 10n,
    },
    { arbiter, demand },
    0n,
  );

  const { attested: fulfillment } = await testContext.bob.client.stringObligation.doObligation("foo", undefined, escrow.uid);

  // Request arbitration
  const requestHash = await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    fulfillment.uid,
    testContext.bob.address,
    demand,
  );
  await testContext.testClient.waitForTransactionReceipt({
    hash: requestHash,
  });

  // Start waiting for arbitration (this should wait for a new decision)
  const waitPromise = testContext.bob.client.arbiters.general.trustedOracle.waitForArbitration(
    fulfillment.uid,
    testContext.bob.address,
    demand,
  );

  // Make arbitration decision after a short delay
  setTimeout(async () => {
    const obligationAbi = parseAbiParameters("(string item, bytes32 schema)");
    await testContext.bob.client.arbiters.general.trustedOracle.arbitrateMany(async ({ attestation }) => {
      const obligation = testContext.bob.client.extractObligationData(obligationAbi, attestation);
      return obligation[0].item === "foo";
    }, { mode: "past" });
  }, 100);

  // Wait for the arbitration result
  const result = await waitPromise;

  expect(result.fulfillmentUid).toBe(fulfillment.uid);
  expect(result.oracle).toBe(testContext.bob.address);
  expect(result.decision).toBe(true);
});

test("waitForArbitration with false decision", async () => {
  const arbiter = testContext.addresses.trustedOracleArbiter;
  const demand = testContext.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle: testContext.bob.address,
    data: encodeAbiParameters(parseAbiParameters("(string mockDemand)"), [{ mockDemand: "foo" }]),
  });

  const { attested: escrow } = await testContext.alice.client.erc20.escrow.default.permitAndCreate(
    {
      address: testContext.mockAddresses.erc20A,
      value: 10n,
    },
    { arbiter, demand },
    0n,
  );

  const { attested: fulfillment } = await testContext.bob.client.stringObligation.doObligation("bad", undefined, escrow.uid);

  // Request arbitration
  const requestHash = await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    fulfillment.uid,
    testContext.bob.address,
    demand,
  );
  await testContext.testClient.waitForTransactionReceipt({
    hash: requestHash,
  });

  // Start waiting for arbitration
  const waitPromise = testContext.bob.client.arbiters.general.trustedOracle.waitForArbitration(
    fulfillment.uid,
    testContext.bob.address,
    demand,
  );

  // Make arbitration decision with false result
  setTimeout(async () => {
    const obligationAbi = parseAbiParameters("(string item, bytes32 schema)");
    await testContext.bob.client.arbiters.general.trustedOracle.arbitrateMany(async ({ attestation }) => {
      const obligation = testContext.bob.client.extractObligationData(obligationAbi, attestation);
      return obligation[0].item === "foo"; // This will be false for "bad"
    }, { mode: "past" });
  }, 100);

  // Wait for the arbitration result
  const result = await waitPromise;

  expect(result.fulfillmentUid).toBe(fulfillment.uid);
  expect(result.oracle).toBe(testContext.bob.address);
  expect(result.decision).toBe(false);
});

test("waitForArbitration integration with escrow collection", async () => {
  const arbiter = testContext.addresses.trustedOracleArbiter;
  const demand = testContext.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle: testContext.bob.address,
    data: encodeAbiParameters(parseAbiParameters("(string mockDemand)"), [{ mockDemand: "foo" }]),
  });

  const { attested: escrow } = await testContext.alice.client.erc20.escrow.default.permitAndCreate(
    {
      address: testContext.mockAddresses.erc20A,
      value: 10n,
    },
    { arbiter, demand },
    0n,
  );

  const { attested: fulfillment } = await testContext.bob.client.stringObligation.doObligation("foo", undefined, escrow.uid);

  // Request arbitration
  const requestHash = await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    fulfillment.uid,
    testContext.bob.address,
    demand,
  );
  await testContext.testClient.waitForTransactionReceipt({
    hash: requestHash,
  });

  // Wait for arbitration and then collect escrow
  const waitPromise = testContext.bob.client.arbiters.general.trustedOracle.waitForArbitration(
    fulfillment.uid,
    testContext.bob.address,
    demand,
  );

  // Make arbitration decision
  setTimeout(async () => {
    const obligationAbi = parseAbiParameters("(string item, bytes32 schema)");
    await testContext.bob.client.arbiters.general.trustedOracle.arbitrateMany(async ({ attestation }) => {
      const obligation = testContext.bob.client.extractObligationData(obligationAbi, attestation);
      return obligation[0].item === "foo";
    }, { mode: "past" });
  }, 100);

  // Wait for the arbitration result
  const result = await waitPromise;

  expect(result.decision).toBe(true);

  // Now collect escrow using the arbitration result
  const collectionHash = await testContext.bob.client.erc20.escrow.default.collect(escrow.uid, fulfillment.uid);

  expect(collectionHash).toBeTruthy();
});
