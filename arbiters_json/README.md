# Alkahest Arbiters Contracts - JSON Artifacts

This directory contains the compiled JSON artifacts for all arbiters contracts in the Alkahest project.

## Overview

A total of **42 arbiters contracts** have been successfully compiled and their JSON artifacts generated. These contracts implement various types of arbitration logic for the Alkahest protocol.

## Generated Files

### Core Arbiters (5 contracts)
- `TrivialArbiter.json` - Always returns true, used for testing and simple scenarios
- `IntrinsicsArbiter.json` - Validates intrinsic properties of attestations
- `IntrinsicsArbiter2.json` - Enhanced version of intrinsics validation
- `TrustedOracleArbiter.json` - Validates attestations from trusted oracle sources
- `TrustedPartyArbiter.json` - Validates attestations from trusted parties

### Logical Arbiters (3 contracts)
- `AllArbiter.json` - Requires all sub-arbiters to validate (AND logic)
- `AnyArbiter.json` - Requires any sub-arbiter to validate (OR logic)
- `NotArbiter.json` - Negates the result of another arbiter (NOT logic)

### Confirmation Arbiters (5 contracts)
- `ConfirmationArbiter.json` - Basic confirmation logic
- `ConfirmationArbiterComposing.json` - Composable confirmation logic
- `RevocableConfirmationArbiter.json` - Confirmation with revocation support
- `RevocableConfirmationArbiterComposing.json` - Composable revocable confirmation
- `UnrevocableConfirmationArbiter.json` - Non-revocable confirmation logic

### Example Arbiters (1 contract)
- `OptimisticStringValidator.json` - Example optimistic validation for string data

### Payment Fulfillment Arbiters (4 contracts)
- `ERC1155PaymentFulfillmentArbiter.json` - Validates ERC1155 token payments
- `ERC20PaymentFulfillmentArbiter.json` - Validates ERC20 token payments
- `ERC721PaymentFulfillmentArbiter.json` - Validates ERC721 token payments
- `TokenBundlePaymentFulfillmentArbiter.json` - Validates bundled token payments

### Attestation Property Arbiters

#### Composing Versions (12 contracts)
These arbiters can be composed with other arbiters:
- `AttesterArbiter_Composing.json` - Validates attestation attester
- `ExpirationTimeAfterArbiter_Composing.json` - Validates expiration time is after a threshold
- `ExpirationTimeBeforeArbiter_Composing.json` - Validates expiration time is before a threshold
- `ExpirationTimeEqualArbiter_Composing.json` - Validates exact expiration time
- `RecipientArbiter_Composing.json` - Validates attestation recipient
- `RefUidArbiter_Composing.json` - Validates reference UID
- `RevocableArbiter_Composing.json` - Validates revocability status
- `SchemaArbiter_Composing.json` - Validates attestation schema
- `TimeAfterArbiter_Composing.json` - Validates time is after a threshold
- `TimeBeforeArbiter_Composing.json` - Validates time is before a threshold
- `TimeEqualArbiter_Composing.json` - Validates exact time
- `UidArbiter_Composing.json` - Validates attestation UID

#### Non-Composing Versions (12 contracts)
These are standalone versions of the same arbiters:
- `AttesterArbiter_NonComposing.json`
- `ExpirationTimeAfterArbiter_NonComposing.json`
- `ExpirationTimeBeforeArbiter_NonComposing.json`
- `ExpirationTimeEqualArbiter_NonComposing.json`
- `RecipientArbiter_NonComposing.json`
- `RefUidArbiter_NonComposing.json`
- `RevocableArbiter_NonComposing.json`
- `SchemaArbiter_NonComposing.json`
- `TimeAfterArbiter_NonComposing.json`
- `TimeBeforeArbiter_NonComposing.json`
- `TimeEqualArbiter_NonComposing.json`
- `UidArbiter_NonComposing.json`

## JSON Structure

Each JSON file contains:
- `abi`: Contract Application Binary Interface
- `bytecode`: Compiled contract bytecode for deployment
- `deployedBytecode`: Runtime bytecode
- `methodIdentifiers`: Function signature mappings
- `metadata`: Compilation metadata including source mappings

## Compilation Details

- **Solidity Version**: 0.8.28
- **Optimizer**: Enabled (200 runs)
- **EVM Version**: Cancun
- **Via IR**: Enabled

## Usage

These JSON artifacts can be used to:
1. Deploy the contracts to any EVM-compatible blockchain
2. Interact with deployed contracts using web3 libraries
3. Generate TypeScript/JavaScript interfaces
4. Integrate with frontend applications
5. Perform contract verification on block explorers

## Dependencies

The contracts utilize:
- OpenZeppelin contracts for standard implementations
- EAS (Ethereum Attestation Service) contracts for attestation structures
- Custom Alkahest interfaces and utilities

## Generated On

Generated on: June 20, 2025
Total contracts compiled: 42/43 (97.7% success rate)

*Note: One contract (UnrevocableConfirmationArbiterComposing) was not found during compilation.*
