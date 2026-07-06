# alkahest-ts

TypeScript SDK for [Alkahest](https://github.com/arkhai-io/alkahest), a library and ecosystem of contracts for conditional peer-to-peer escrow. Built on [viem](https://viem.sh/).

## Installation

```bash
npm install alkahest-ts viem
```

## Usage

Initialize a client with a viem wallet. The client auto-detects contract addresses for supported chains.

```ts
import { makeClient } from "alkahest-ts";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount, nonceManager } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const client = makeClient(
  createWalletClient({
    account: privateKeyToAccount(process.env.PRIVKEY as `0x${string}`, {
      nonceManager,
    }),
    chain: baseSepolia,
    transport: http(process.env.RPC_URL as string),
  }),
);
```

## Examples

### Trade ERC20 for ERC20

Uses escrow clients to create escrows, and atomic payment utilities to settle compatible escrows atomically.

```ts
import { parseUnits } from "viem";

const usdc = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
const eurc = "0x808456652fdb597867f38412077A9182bf77359F" as const;

// Alice: approve escrow and deposit 10 USDC, demanding 10 EURC
const escrow = await clientAlice.erc20.escrow.default.approveAndCreate(
  { address: usdc, value: parseUnits("10", 6) },
  { arbiter: erc20PaymentAddress, demand: encodedErc20PaymentDemand },
  0n, // no expiration
);

// Bob: approve atomic payment utilities and fulfill the escrow by paying 10 EURC
await clientBob.erc20.util.approve(
  { address: eurc, value: parseUnits("10", 6) },
  "atomicPayment",
);
const payment = await clientBob.erc20.payment.payErc20AndCollect(
  escrow.attested.uid,
);
```

### Trade ERC20 for custom demand

Uses TrustedOracleArbiter to delegate fulfillment validation to an off-chain oracle, and StringObligation for the fulfillment.

```ts
import { encodeAbiParameters, parseAbiParameters, parseUnits } from "viem";

const usdc = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;

// Encode the inner demand data (application-specific; agreed upon by buyer and seller)
const innerDemand = encodeAbiParameters(
  parseAbiParameters("(string query)"),
  [{ query: "capitalize hello world" }],
);

// Encode the TrustedOracleArbiter demand, naming Charlie as the oracle
const demand = clientAlice.arbiters.general.trustedOracle.encodeDemand({
  oracle: charlieAddress,
  data: innerDemand,
});

// Alice: deposit USDC into escrow with the custom demand
const escrow = await clientAlice.erc20.escrow.default.approveAndCreate(
  { address: usdc, value: parseUnits("100", 6) },
  {
    arbiter: clientAlice.contractAddresses.trustedOracleArbiter,
    demand,
  },
  BigInt(Math.floor(Date.now() / 1000) + 86400), // 24h expiration
);

// Bob: fulfill the demand with a StringObligation attestation
const fulfillment = await clientBob.stringObligation.doObligation(
  "HELLO WORLD", // the computed result
  undefined,     // schema (optional)
  escrow.attested.uid, // reference to the escrow being fulfilled
);

// Charlie: arbitrate the result (or use arbitrateMany for event-driven arbitration)
await clientCharlie.arbiters.general.trustedOracle.arbitrate(
  fulfillment.attested.uid,
  demand,
  true, // decision: valid
);

// Bob: collect the escrow
await clientBob.erc20.escrow.default.collect(
  escrow.attested.uid,
  fulfillment.attested.uid,
);

// Alice: wait for fulfillment (useful if running concurrently)
const result = await clientAlice.waitForFulfillment(
  clientAlice.contractAddresses.erc20EscrowObligation,
  escrow.attested.uid,
);
```

See the [docs](../../docs/) for more detailed guides, including composing arbiters and building off-chain oracle validators.

## Development

### Running Tests with Anvil

Tests run against an Anvil fork of Base Sepolia.

1. Set up your environment:
   ```
   export RPC_URL=<your-base-sepolia-rpc-url>
   ```

2. Run tests using Anvil fork:
   ```
   bun run test:anvil
   ```

3. Run a specific test file:
   ```
   bun run test:anvil:single tests/tradeErc20.test.ts
   ```

4. Start Anvil fork in a separate terminal (for debugging):
   ```
   bun run anvil
   ```

### Local Development Client

```ts
import { createWalletClient, http } from "viem";
import { privateKeyToAccount, nonceManager } from "viem/accounts";
import { makeClient } from "alkahest-ts";
import { anvilChain, ANVIL_ACCOUNTS } from "./path/to/anvil";

const client = makeClient(
  createWalletClient({
    account: privateKeyToAccount(ANVIL_ACCOUNTS.ALICE.privateKey, {
      nonceManager,
    }),
    chain: anvilChain,
    transport: http("http://localhost:8545"),
  }),
);
```
