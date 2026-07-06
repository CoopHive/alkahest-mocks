# Alkahest CLI

Command-line interface for the Alkahest escrow protocol, wrapping the TypeScript SDK. Designed for LLM agents and shell scripting with JSON output by default.

## Installation

```bash
npm install -g alkahest-cli
```

Or for local development:
```bash
cd cli && bun install && bun run build
bun link
```

Run commands with:
```bash
alkahest [global-flags] <command> <subcommand> [options]
```

## Authentication

Provide a wallet via one of (in priority order):

| Method | Flag / Env Var |
|--------|---------------|
| Private key flag | `--private-key 0x...` |
| Mnemonic flag | `--mnemonic "word1 word2 ..."` |
| Ledger USB | `--ledger [--ledger-path <path>]` |
| Private key env | `ALKAHEST_PRIVATE_KEY=0x...` |
| Compat env | `PRIVATE_KEY=0x...` |
| Mnemonic env | `ALKAHEST_MNEMONIC="word1 word2 ..."` |

Ledger support requires optional packages: `bun add @ledgerhq/hw-transport-node-hid @ledgerhq/hw-app-eth`

## Global Flags

```
--chain <name>            base-sepolia (default) | sepolia | ethereum | anvil
--private-key <key>       0x-prefixed private key
--mnemonic <phrase>       BIP39 mnemonic
--ledger                  Use Ledger hardware wallet
--ledger-path <path>      Custom HD derivation path (default: m/44'/60'/0'/0/0)
--rpc-url <url>           Custom RPC URL (overrides chain default)
--addresses-file <path>   JSON file with custom contract addresses (for local/custom deployments)
--human                   Human-readable output (default: JSON)
```

## Output Format

JSON by default. All BigInts serialized as strings.

```json
{ "success": true, "data": { "hash": "0x...", "uid": "0x..." } }
{ "success": false, "error": { "code": "ESCROW_CREATE_FAILED", "message": "..." } }
```

Use `--human` for labeled, indented output.

## Commands

### escrow

| Subcommand | Description | Key Options |
|------------|-------------|-------------|
| `create` | Create an escrow | `--erc20\|--erc721\|--erc1155\|--native` `--token` `--amount` `--arbiter` `--demand` `--expiration` `[--approve]` `[--token-id]` |
| `collect` | Collect after fulfillment | `--erc20\|...` `--escrow-uid` `--fulfillment-uid` |
| `reclaim` | Reclaim expired escrow | `--erc20\|...` `--uid` |
| `get` | Get escrow details | `--erc20\|...` `--uid` |
| `wait` | Wait for fulfillment | `--erc20\|...` `--uid` |

### payment

| Subcommand | Description | Key Options |
|------------|-------------|-------------|
| `pay` | Make a payment | `--erc20\|--native` `--token` `--amount` `--payee` `[--ref-uid]` `[--approve\|--permit]` |
| `get` | Get payment details | `--erc20\|--native` `--uid` |

### barter

| Subcommand | Description | Key Options |
|------------|-------------|-------------|
| `create` | Create barter offer | `--bid-type` `--ask-type` `--bid-token` `--bid-amount` `--ask-token` `--ask-amount` `--expiration` `[--approve]` |
| `fulfill` | Fulfill barter offer | `--uid` `--bid-type` `--ask-type` `[--approve\|--permit]` |

Supported pairs: erc20/erc20, erc20/erc721, erc20/erc1155. `--permit` is only supported when fulfilling an ERC20 ask.

### string

| Subcommand | Description | Key Options |
|------------|-------------|-------------|
| `create` | Create string attestation | `--item` `[--schema]` `[--ref-uid]` |
| `get` | Get string obligation | `--uid` |

### commit-reveal

| Subcommand | Description | Key Options |
|------------|-------------|-------------|
| `commit` | Submit commitment hash | `--commitment` `--bond-amount` |
| `reveal` | Reveal committed value | `--payload` `--salt` `--schema` `[--ref-uid]` |
| `compute-commitment` | Compute commitment hash | `--ref-uid` `--claimer` `--payload` `--salt` `--schema` |
| `slash-bond` | Slash unrevealed bond | `--commitment` |
| `info` | Show deadline and slashed bond recipient | (no options) |

### arbiter

| Subcommand | Description | Key Options |
|------------|-------------|-------------|
| `arbitrate` | Arbitrate (trusted oracle) | `--obligation` `--demand` `--decision` |
| `confirm` | Confirm fulfillment | `--fulfillment` `--escrow` `--type` |
| `revoke` | Revoke confirmation | `--fulfillment` `--escrow` `--type` |
| `encode-demand` | Encode demand data | `--type` + type-specific flags |
| `decode-demand` | Decode demand data | `--arbiter` `--demand` |

Encode demand types: `trusted-oracle`, `intrinsics`, `all`, `any`, `recipient`, `attester`, `schema`, `uid`, `ref-uid`, `revocable`, `time-after`, `time-before`, `time-equal`, `expiration-time-after`, `expiration-time-before`, `expiration-time-equal`.

### attestation

| Subcommand | Description | Key Options |
|------------|-------------|-------------|
| `get` | Get raw attestation | `--uid` |
| `decode` | Decode attestation data | `--uid` `--type` |

### deploy

```bash
alkahest --private-key 0x... deploy [scope] [--eas] [--eas-address] [--eas-sr-address]
```

Scopes: `all` (default), `arbiters`, `obligations`, `utils`. Outputs deployed addresses as JSON.

### config

| Subcommand | Description |
|------------|-------------|
| `show` | Show contract addresses for current chain |
| `chains` | List supported chains |

## Examples

### Create and collect an ERC20 escrow

```bash
# 1. Encode demand (trusted oracle)
DEMAND=$(alkahest arbiter encode-demand \
  --type trusted-oracle --oracle 0xORACLE --data 0x)

# 2. Create escrow with auto-approve
alkahest --private-key 0xBUYER escrow create \
  --erc20 --token 0xTOKEN --amount 1000000000000000000 \
  --arbiter 0xTRUSTED_ORACLE_ARBITER --demand 0xENCODED_DEMAND \
  --expiration 1735689600 --approve

# 3. Seller fulfills with a string obligation
alkahest --private-key 0xSELLER string create \
  --item "deliverable" --ref-uid 0xESCROW_UID

# 4. Oracle approves
alkahest --private-key 0xORACLE arbiter arbitrate \
  --obligation 0xFULFILLMENT_UID --demand 0xDEMAND --decision true

# 5. Seller collects
alkahest --private-key 0xSELLER escrow collect \
  --erc20 --escrow-uid 0xESCROW_UID --fulfillment-uid 0xFULFILLMENT_UID
```

### ERC20 barter (token swap)

```bash
# Alice offers 100 TokenA for 200 TokenB
alkahest --private-key 0xALICE barter create \
  --bid-type erc20 --ask-type erc20 \
  --bid-token 0xTOKEN_A --bid-amount 100000000000000000000 \
  --ask-token 0xTOKEN_B --ask-amount 200000000000000000000 \
  --expiration 1735689600 --approve

# Bob fulfills (auto-reads ask from the escrow)
alkahest --private-key 0xBOB barter fulfill \
  --uid 0xBARTER_UID --bid-type erc20 --ask-type erc20 --approve
```

### Deploy to local anvil

```bash
# Start anvil
anvil --port 8546 &

# Deploy all contracts (including EAS)
alkahest --chain anvil --rpc-url http://127.0.0.1:8546 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  deploy --eas | jq '.data' > addresses.json

# Use deployed addresses for subsequent commands
alkahest --chain anvil --rpc-url http://127.0.0.1:8546 \
  --addresses-file addresses.json --private-key 0x... \
  escrow create --native --token 0x0 --amount 1000000000000000000 \
  --arbiter 0xTRIVIAL_ARBITER --demand 0x --expiration 9999999999
```
