# Test Structure

This directory contains tests for the Alkahest protocol, organized into the following structure:

## Directory Organization

- `unit/`: Contains unit tests that test single functions in a contract
  - Tests where each test function calls only one function in the contract being tested
  - Examples: `testRegisterSchema()`, `testAttest()`, `testBuyErc20ForErc20()`
  
- `integration/`: Contains integration tests that test multi-step flows
  - Tests that verify multiple functions working together in a workflow
  - Examples: `testPayErc20ForErc20()`, `testFullTradeWithPermits()`, `testAttestAndCreateEscrow()`
  
- `deprecated/`: Contains older tests that are kept for reference but no longer actively maintained

## Test Naming Convention

Tests are named after the contract they primarily test, with the `.t.sol` extension.

## Running Tests

To run all tests:
```bash
forge test
```

To run only unit tests:
```bash
forge test --match-path "test/unit/**"
```

To run only integration tests:
```bash
forge test --match-path "test/integration/**"
```

## Writing New Tests

When adding new features:

1. Start with unit tests for individual functions
2. Follow with integration tests for multi-step workflows
3. Place the tests in the appropriate directory:
   - If the test calls a single function and verifies its results, it belongs in `unit/`
   - If the test calls multiple functions or verifies multi-step flows, it belongs in `integration/`