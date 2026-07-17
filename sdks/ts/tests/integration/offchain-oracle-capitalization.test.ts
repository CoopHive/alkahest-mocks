import { afterEach, beforeEach, expect, test } from "bun:test";
import { exec as execCallback } from "node:child_process";
import { promisify } from "node:util";
import { decodeAbiParameters, encodeAbiParameters, hexToBytes, parseAbiParameters, parseEther, stringToHex } from "viem";
import { setupTestEnvironment, type TestContext } from "../utils/setup";
import { teardownTestEnvironment } from "../utils/teardownTestEnvironment";

const execAsync = promisify(execCallback);

let testContext: TestContext;

type ShellTestCase = {
  input: string;
  output: string;
};

type ShellOracleDemand = {
  description: string;
  test_cases: ShellTestCase[];
};

const stringObligationAbi = parseAbiParameters("(string item, bytes32 schema)");
const shellDemandAbi = parseAbiParameters("(bytes payload)");

beforeEach(async () => {
  testContext = await setupTestEnvironment();
});

afterEach(async () => {
  await teardownTestEnvironment(testContext);
});

test("synchronous offchain oracle capitalization flow", async () => {
  const demandPayload: ShellOracleDemand = {
    description: "Capitalize stdin",
    test_cases: [
      { input: "alice", output: "ALICE" },
      { input: "bob builder", output: "BOB BUILDER" },
    ],
  };

  const demandBytes = encodeAbiParameters(shellDemandAbi, [{ payload: stringToHex(JSON.stringify(demandPayload)) }]);

  const demand = testContext.alice.client.arbiters.general.trustedOracle.encodeDemand({
    oracle: testContext.charlie.address,
    data: demandBytes,
  });

  const { attested: escrow } = await testContext.alice.client.erc20.escrow.default.permitAndCreate(
    {
      address: testContext.mockAddresses.erc20A,
      value: parseEther("100"),
    },
    {
      arbiter: testContext.addresses.trustedOracleArbiter,
      demand,
    },
    BigInt(Math.floor(Date.now() / 1000) + 3600),
  );

  const { attested: fulfillment } = await testContext.bob.client.stringObligation.doObligation(
    "tr '[:lower:]' '[:upper:]'",
    undefined,
    escrow.uid,
  );

  // Request arbitration and wait for it to be mined before setting up listener
  const requestHash = await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    fulfillment.uid,
    testContext.charlie.address,
    testContext.bob.client.arbiters.general.trustedOracle.decodeDemand(demand).data,
  );
  await testContext.bob.client.viemClient.waitForTransactionReceipt({ hash: requestHash });

  const { decisions, unwatch } = await testContext.charlie.client.arbiters.general.trustedOracle.arbitrateMany(
    async ({ attestation, demand }) => {
      // Extract obligation data
      const obligation = testContext.charlie.client.extractObligationData(stringObligationAbi, attestation);

      const statement = obligation[0]?.item;
      if (!statement) return false;

      // Extract demand data from callback argument (no need to fetch from escrow!)
      const demandData = decodeAbiParameters(shellDemandAbi, demand);

      const payloadHex = demandData[0]?.payload;
      if (!payloadHex) return false;

      const payloadJson = new TextDecoder().decode(hexToBytes(payloadHex));

      let payload: ShellOracleDemand;
      try {
        payload = JSON.parse(payloadJson) as ShellOracleDemand;
      } catch {
        return false;
      }

      for (const testCase of payload.test_cases) {
        const command = `echo "$INPUT" | ${statement}`;
        try {
          const { stdout } = await execAsync(command, {
            env: {
              ...process.env,
              INPUT: testCase.input,
            },
            shell: "/bin/bash",
          });

          if (stdout.trimEnd() !== testCase.output) {
            return false;
          }
        } catch {
          return false;
        }
      }

      return true;
    },
    { mode: "allUnarbitrated" },
  );

  // Wait for all arbitration transactions to be mined
  await Promise.all(
    decisions.map((decision) =>
      testContext.charlie.client.viemClient.waitForTransactionReceipt({ hash: decision.hash }),
    ),
  );

  unwatch();

  decisions.forEach((decision) => {
    expect(decision?.decision).toBe(true);
  });

  const collectionHash = await testContext.bob.client.erc20.escrow.default.collect(escrow.uid, fulfillment.uid);

  expect(collectionHash).toBeTruthy();
});
