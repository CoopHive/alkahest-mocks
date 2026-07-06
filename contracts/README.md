<div align="center">
  <img src="https://github.com/arkhai-io/decentralized-rag-database/blob/main/assets/logo.jpg" alt="Arkhai Logo" width="200"/>

# Alkahest

**Contract library and SDKs for conditional peer-to-peer escrow**

![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

</div>

Alkahest is a library and ecosystem of contracts for conditional peer-to-peer escrow. It contains three main types of contracts:

- **Escrow contracts** conditionally guarantee an on-chain action (usually a token transfer)
- **Arbiter contracts** represent the conditions on which escrows are released, and can be composed via AllArbiter and AnyArbiter
- **Obligation contracts** produce [EAS](https://attest.org/) attestations that represent the fulfillments to escrows, and which are checked by arbiter contracts. Escrow contracts are also obligation contracts.

Learn more at [Alkahest Docs](https://www.arkhai.io/docs).

## Security

Alkahest has been audited by [Zellic](https://www.zellic.io/). The full audit report is available [here](https://github.com/Zellic/publications/blob/master/Arkhai%20Alkahest%20-%20Zellic%20Audit%20Report.pdf).

## Contract Architecture

### Base Contracts

- [IArbiter](src/IArbiter.sol) - Interface for arbiter validation logic
- [ArbiterUtils](src/libraries/ArbiterUtils.sol) - Shared utilities for arbiter implementations
- [BaseObligation](src/obligations/BaseObligation.sol) - Base contract for all obligation types
- [BaseEscrowObligation](src/obligations/escrow/BaseEscrowObligation.sol) - Base contract for default escrow obligations
- [BaseEscrowObligationUnconditional](src/obligations/escrow/BaseEscrowObligationUnconditional.sol) - Base contract for unconditional escrow obligations
- [BaseAttester](src/BaseAttester.sol) - Base contract for EAS attestation integration

### Obligations

**Escrow Obligations** - Lock assets until arbiter conditions are met:

Default (one escrow per fulfillment, with default fulfillment checks):
- [ERC20EscrowObligation](src/obligations/escrow/default/ERC20EscrowObligation.sol)
- [ERC721EscrowObligation](src/obligations/escrow/default/ERC721EscrowObligation.sol)
- [ERC1155EscrowObligation](src/obligations/escrow/default/ERC1155EscrowObligation.sol)
- [NativeTokenEscrowObligation](src/obligations/escrow/default/NativeTokenEscrowObligation.sol)
- [TokenBundleEscrowObligation](src/obligations/escrow/default/TokenBundleEscrowObligation.sol)
- [AttestationEscrowObligation](src/obligations/escrow/default/AttestationEscrowObligation.sol)
- [AttestationReferenceEscrowObligation](src/obligations/escrow/default/AttestationReferenceEscrowObligation.sol)

Unconditional (no default fulfillment checks):
- [UnconditionalERC20EscrowObligation](src/obligations/escrow/unconditional/UnconditionalERC20EscrowObligation.sol)
- [UnconditionalERC721EscrowObligation](src/obligations/escrow/unconditional/UnconditionalERC721EscrowObligation.sol)
- [UnconditionalERC1155EscrowObligation](src/obligations/escrow/unconditional/UnconditionalERC1155EscrowObligation.sol)
- [UnconditionalNativeTokenEscrowObligation](src/obligations/escrow/unconditional/UnconditionalNativeTokenEscrowObligation.sol)
- [UnconditionalTokenBundleEscrowObligation](src/obligations/escrow/unconditional/UnconditionalTokenBundleEscrowObligation.sol)
- [UnconditionalAttestationEscrowObligation](src/obligations/escrow/unconditional/UnconditionalAttestationEscrowObligation.sol)
- [UnconditionalAttestationReferenceEscrowObligation](src/obligations/escrow/unconditional/UnconditionalAttestationReferenceEscrowObligation.sol)

**Payment Obligations** - Transfer assets and produce attestations, used as fulfillments for escrows:
- [ERC20PaymentObligation](src/obligations/payment/ERC20PaymentObligation.sol)
- [ERC721PaymentObligation](src/obligations/payment/ERC721PaymentObligation.sol)
- [ERC1155PaymentObligation](src/obligations/payment/ERC1155PaymentObligation.sol)
- [NativeTokenPaymentObligation](src/obligations/payment/NativeTokenPaymentObligation.sol)
- [TokenBundlePaymentObligation](src/obligations/payment/TokenBundlePaymentObligation.sol)

**Other Obligations** - Non-token obligations for flexible fulfillments:
- [StringObligation](src/obligations/StringObligation.sol) - Attests arbitrary string data
- [CommitRevealObligation](src/obligations/CommitRevealObligation.sol) - Commit-reveal scheme with anti-front-running

**Example Obligations**:
- [StringResultObligation](src/obligations/example/StringResultObligation.sol) - String result with schema field
- [ApiResultObligation](src/obligations/example/ApiResultObligation.sol) - API call results
- [VoteEscrowObligation](src/obligations/example/VoteEscrowObligation.sol) - Escrow that casts a governance vote on fulfillment
- [RedisProvisionObligation](src/obligations/example/RedisProvisionObligation.sol) - Redis instance provisioning

### Arbiters

**General-Purpose Arbiters**:
- [TrustedOracleArbiter](src/arbiters/TrustedOracleArbiter.sol) - Delegates decisions to a trusted off-chain oracle
- [ERC8004Arbiter](src/arbiters/ERC8004Arbiter.sol) - ERC-8004 standard arbiter
- [TrivialArbiter](src/arbiters/TrivialArbiter.sol) - Always approves (useful as a base arbiter)
- [IntrinsicsArbiter](src/arbiters/IntrinsicsArbiter.sol) - Validates attestation intrinsic properties (not expired, not revoked)

**Confirmation Arbiters** - Arbiter conditions based on explicit confirmation from a designated party:
- [ExclusiveRevocableConfirmationArbiter](src/arbiters/confirmation/ExclusiveRevocableConfirmationArbiter.sol)
- [ExclusiveUnrevocableConfirmationArbiter](src/arbiters/confirmation/ExclusiveUnrevocableConfirmationArbiter.sol)
- [NonexclusiveRevocableConfirmationArbiter](src/arbiters/confirmation/NonexclusiveRevocableConfirmationArbiter.sol)
- [NonexclusiveUnrevocableConfirmationArbiter](src/arbiters/confirmation/NonexclusiveUnrevocableConfirmationArbiter.sol)

**Logical Combinators**:
- [AllArbiter](src/arbiters/logical/AllArbiter.sol) - Requires all child conditions to be met
- [AnyArbiter](src/arbiters/logical/AnyArbiter.sol) - Requires any child condition to be met

**Attestation Property Arbiters** - Validate individual properties of EAS attestations:
- Located in [src/arbiters/attestation-properties/](src/arbiters/attestation-properties/) (attester, recipient, schema, time, expiration, refUID, revocable, uid)

**Example Arbiters**:
- [StringCapitalizer](src/arbiters/example/StringCapitalizer.sol) - Validates that a string is correctly capitalized
- [OptimisticStringValidator](src/arbiters/example/OptimisticStringValidator.sol) - Optimistic validation with challenge period
- [CryptoSignatureObligation](src/arbiters/example/CryptoSignatureObligation.sol) - Validates cryptographic signatures
- [MajorityVoteArbiter](src/arbiters/example/MajorityVoteArbiter.sol) - Requires majority agreement among voters
- [GameWinner](src/arbiters/example/GameWinner.sol) - Validates game winner attestations from a trusted game contract

### Atomic Utilities

Helper contracts that combine escrow creation and fulfillment collection into single transactions:
- [AtomicPaymentUtils](src/utils/atomic/AtomicPaymentUtils.sol)
- [AtomicAttestationUtils](src/utils/atomic/AtomicAttestationUtils.sol)

## Tests

Tests cover real-world usage patterns and core utility flows:

- [AtomicPaymentUtils](test/unit/utils/atomic/AtomicPaymentUtils.t.sol) - Atomic payment and escrow collection flows
- [AtomicAttestationUtils](test/unit/utils/atomic/AtomicAttestationUtils.t.sol) - Atomically attesting and creating reference escrows
- [AttestationEscrowObligation](test/integration/AttestationEscrowObligation.t.sol) - Escrowing attestations
- [StringCapitalizer](test/integration/StringCapitalizer.t.sol) - Synchronous on-chain arbiter validating string capitalization
- [CryptoSignatureObligation](test/integration/CryptoSignatureObligation.t.sol) - Arbiter validating cryptographic signatures to release escrow
- [MajorityVoteArbiter](test/integration/MajorityVoteArbiter.t.sol) - Multi-party arbiter requiring majority agreement
- [GameWinner](test/integration/GameWinner.t.sol) - Game winner attestations releasing escrowed rewards
- [ERC8004](test/integration/ERC8004.t.sol) - ERC-8004 standard arbiter flow
- [VoteEscrowObligation](test/integration/VoteEscrowObligation.t.sol) - Escrow that triggers a governance vote on fulfillment

## Running Tests

```bash
# Run all tests
forge test

# Run with verbose output
forge test -vvv

# Run specific test file
forge test --match-path test/unit/utils/atomic/AtomicPaymentUtils.t.sol

# Run with gas reporting
forge test --gas-report
```

## Building

```bash
forge build
```

## Deployment

Deployment scripts are located in [script/](script/). See [script/Deploy.s.sol](script/Deploy.s.sol) for the main deployment script.

### Current Deployments

Deployed contract addresses and transaction hashes are available for the following networks:

- [Monad Mainnet](deployments/deployment_monad.json)
- [Base Sepolia Testnet](deployments/deployment_base_sepolia.json)
- [Ethereum Sepolia Testnet](deployments/deployment_sepolia.json)
