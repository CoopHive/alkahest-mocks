# Attestation Properties Arbiters Tests

This directory contains unit tests for the attestation properties arbiters. These arbiters verify specific properties of attestations.

## Directory Structure

- `composing/`: Tests for arbiters that compose with other arbiters
  - These arbiters delegate some of the attestation validation to a base arbiter
  - Example: `RecipientArbiter.t.sol` - Tests for an arbiter that validates attestation recipient

- `non-composing/`: Tests for arbiters that check properties directly without composition
  - These arbiters don't delegate to other arbiters
  - Example: `UidArbiter.t.sol` - Tests for an arbiter that validates attestation UID

## Test Coverage

Each test file ensures that the corresponding arbiter:
1. Correctly validates attestations that match the required property
2. Rejects attestations that don't match the required property 
3. Properly handles the composing behavior with base arbiters (for composing arbiters)
4. Correctly decodes demand data

## Adding New Tests

When adding tests for new attestation property arbiters, follow the established patterns:
- For composing arbiters, use `RecipientArbiter.t.sol` as a template
- For non-composing arbiters, use `UidArbiter.t.sol` as a template