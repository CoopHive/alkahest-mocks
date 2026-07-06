<div align="center">
  <img src="https://github.com/arkhai-io/decentralized-rag-database/blob/main/assets/logo.jpg" alt="Arkhai Logo" width="200"/>

# Alkahest

**Contract library and SDKs for conditional peer-to-peer escrow**

![Solidity](https://img.shields.io/badge/solidity-0.8.27-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)
![Rust](https://img.shields.io/badge/rust-1.70+-orange.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

</div>

Alkahest is a library and ecosystem of contracts for conditional peer-to-peer escrow. It contains three main types of contracts:

- **Escrow contracts** conditionally guarantee an on-chain action (usually a token transfer)
- **Arbiter contracts** represent the conditions on which escrows are released, and can be composed via AllArbiter and AnyArbiter
- **Obligation contracts** produce [EAS](https://attest.org/) attestations that represent the fulfillments to escrows, and which are checked by arbiter contracts. Escrow contracts are also obligation contracts.

Learn more at [Alkahest Docs](https://www.arkhai.io/docs).

## Security

Alkahest has been audited by [Zellic](https://www.zellic.io/). The full audit report is available in [docs/audits/reports/zellic-2026-06-30.pdf](docs/audits/reports/zellic-2026-06-30.pdf).

## Repository Structure

This is a monorepo containing the Alkahest smart contracts and SDKs for multiple languages:

```
alkahest/
├── contracts/          # Solidity smart contracts and Foundry tooling
│   ├── src/           # Contract source code
│   ├── test/          # Contract tests
│   ├── script/        # Deployment scripts
│   └── lib/           # Dependencies (forge-std, EAS, OpenZeppelin)
├── sdks/              # Language-specific SDKs
│   ├── py/           # Python SDK
│   ├── rs/           # Rust SDK
│   └── ts/           # TypeScript SDK
└── docs/              # Documentation
```

## Quick Start

### Smart Contracts

The contracts are built with [Foundry](https://book.getfoundry.sh/).

```bash
cd contracts
forge build
forge test
```

See [contracts/README.md](contracts/README.md) for more details.

### SDKs

Each SDK has its own setup and usage instructions:

- **Python**: See [sdks/py/README.md](sdks/py/README.md)
- **Rust**: See [sdks/rs/README.md](sdks/rs/README.md)
- **TypeScript**: See [sdks/ts/README.md](sdks/ts/README.md)

## Documentation

Comprehensive guides and tutorials are available in the [docs/](docs/) directory:

- **[Escrow Flow (pt 1 - Token Trading)](<docs/Escrow%20Flow%20(pt%201%20-%20Token%20Trading).md>)** - Trade tokens for tokens using escrow and payment obligations
- **[Escrow Flow (pt 2 - Job Trading)](<docs/Escrow%20Flow%20(pt%202%20-%20Job%20Trading).md>)** - Escrow with off-chain validation via TrustedOracleArbiter
- **[Escrow Flow (pt 3 - Composing Demands)](<docs/Escrow%20Flow%20(pt%203%20-%20Composing%20Demands).md>)** - Composing arbiter conditions with AllArbiter and AnyArbiter
- **[Writing Arbiters (pt 1 - On-chain Arbiters)](<docs/Writing%20Arbiters%20(pt%201%20-%20On-chain%20Arbiters).md>)** - Create custom on-chain validation logic
- **[Writing Arbiters (pt 2 - Off-chain Oracles)](<docs/Writing%20Arbiters%20(pt%202%20-%20Off-chain%20Oracles)%20(Python).md>)** - Build off-chain oracle validators ([Python](<docs/Writing%20Arbiters%20(pt%202%20-%20Off-chain%20Oracles)%20(Python).md>), [Rust](<docs/Writing%20Arbiters%20(pt%202%20-%20Off-chain%20Oracles)%20(Rust).md>), [TypeScript](<docs/Writing%20Arbiters%20(pt%202%20-%20Off-chain%20Oracles)%20(TypeScript).md>))
- **[Writing Escrow Contracts](docs/Writing%20Escrow%20Contracts.md)** - Create custom escrow obligations
- **[Writing Fulfillment Contracts](docs/Writing%20Fulfillment%20Contracts.md)** - Create custom fulfillment obligations

## Development

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Node.js](https://nodejs.org/) (for TypeScript SDK and scripts)
- [Python 3.10+](https://www.python.org/) (for Python SDK)
- [Rust](https://www.rust-lang.org/) (for Rust SDK)

### Building Everything

```bash
# Build contracts
cd contracts && forge build

# Build TypeScript SDK
cd sdks/ts && npm install && npm run build

# Build Python SDK
cd sdks/py && pip install -e .

# Build Rust SDK
cd sdks/rs && cargo build
```

## Agent Skills

The `docs/skills/` directory contains agent skills for AI coding assistants ([Claude Code](https://docs.anthropic.com/en/docs/claude-code), [OpenClaw](https://github.com/AidenYuanDev/OpenClaw), etc.) that help developers and users interact with Alkahest conversationally.

| Skill | Description |
|-------|-------------|
| `alkahest-developer` | Write code using the TypeScript, Rust, or Python SDK |
| `alkahest-user` | Create escrows, fulfill obligations, arbitrate, and settle token trades via the CLI |

### Installation

#### Claude Code (via plugin marketplace)

```
/plugin marketplace add arkhai-io/claude-plugins
/plugin install alkahest-plugin@arkhai-plugins
```

See the [arkhai-plugins marketplace](https://github.com/arkhai-io/claude-plugins) for all available plugins.

#### OpenClaw (via ClawHub)

```bash
clawhub install alkahest-developer
clawhub install alkahest-user
```

#### Manual

Each skill is a directory under `docs/skills/` containing a `SKILL.md` file. Any agent that supports SKILL.md-based skill definitions can use them directly.

## Contributing

Contributions are welcome! Please check the individual README files in each directory for specific contribution guidelines.

## License

MIT
