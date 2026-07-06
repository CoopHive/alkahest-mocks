import { afterEach, beforeEach, expect, test } from "bun:test";
import { parseAbiParameters, recoverMessageAddress } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { setupTestEnvironment, type TestContext } from "../utils/setup";
import { teardownTestEnvironment } from "../utils/teardownTestEnvironment";

const stringObligationAbi = parseAbiParameters("(string item, bytes32 schema)");

let testContext: TestContext;

const identityRegistry = new Map<`0x${string}`, number>();
const identityChallenge = "proof-of-identity";

type IdentityFulfillment = {
  pubkey: `0x${string}`;
  nonce: number;
  data: string;
  signature: `0x${string}`;
};

beforeEach(async () => {
  testContext = await setupTestEnvironment();
});

afterEach(async () => {
  identityRegistry.clear();
  await teardownTestEnvironment(testContext);
});

function createIdentityPayloadFactory(address: `0x${string}`, signer: ReturnType<typeof privateKeyToAccount>) {
  return async (nonce: number) => {
    const message = `${identityChallenge}:${nonce}`;
    const signature = await signer.signMessage({ message });

    const payload: IdentityFulfillment = {
      pubkey: address,
      nonce,
      data: identityChallenge,
      signature,
    };

    return JSON.stringify(payload);
  };
}

test("contextless offchain identity oracle flow", async () => {
  const identityAccount = privateKeyToAccount(generatePrivateKey());
  identityRegistry.set(identityAccount.address, 0);

  // Empty inner demand for contextless identity oracle
  const demand = testContext.charlie.client.arbiters.general.trustedOracle.encodeDemand({
    oracle: testContext.charlie.address,
    data: "0x",
  });

  const listener = await testContext.charlie.client.arbiters.general.trustedOracle.arbitrateMany(
    async ({ attestation }) => {
      // Extract obligation data
      const obligation = testContext.charlie.client.extractObligationData(stringObligationAbi, attestation);

      const payload = obligation[0]?.item;
      if (!payload) return false;

      let parsed: IdentityFulfillment;
      try {
        parsed = JSON.parse(payload) as IdentityFulfillment;
      } catch {
        return false;
      }

      const currentNonce = identityRegistry.get(parsed.pubkey);
      if (currentNonce === undefined) return false;
      if (parsed.nonce <= currentNonce) return false;

      if (typeof parsed.signature !== "string" || parsed.signature.length !== 132) {
        return false;
      }

      const message = `${parsed.data}:${parsed.nonce}`;
      let recovered: `0x${string}`;
      try {
        recovered = await recoverMessageAddress({ message, signature: parsed.signature });
      } catch {
        return false;
      }

      if (recovered.toLowerCase() !== parsed.pubkey.toLowerCase()) {
        return false;
      }

      identityRegistry.set(parsed.pubkey, parsed.nonce);
      return true;
    },
    { mode: "allUnarbitrated" },
  );

  const createPayload = createIdentityPayloadFactory(identityAccount.address, identityAccount);

  const goodPayload = await createPayload(1);
  const { attested: goodFulfillment } = await testContext.bob.client.stringObligation.doObligation(goodPayload);

  await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    goodFulfillment.uid,
    testContext.charlie.address,
    demand,
  );

  const goodDecision = await testContext.charlie.client.arbiters.general.trustedOracle.waitForArbitration(
    goodFulfillment.uid,
    testContext.charlie.address,
    demand,
  );

  expect(goodDecision?.decision).toBe(true);
  expect(identityRegistry.get(identityAccount.address)).toBe(1);

  const badPayload = await createPayload(1);
  const { attested: badFulfillment } = await testContext.bob.client.stringObligation.doObligation(badPayload);

  await testContext.bob.client.arbiters.general.trustedOracle.requestArbitration(
    badFulfillment.uid,
    testContext.charlie.address,
    demand,
  );

  const badDecision = await testContext.charlie.client.arbiters.general.trustedOracle.waitForArbitration(
    badFulfillment.uid,
    testContext.charlie.address,
    demand,
  );

  expect(badDecision?.decision).toBe(false);

  listener.unwatch();
  identityRegistry.clear();
});
