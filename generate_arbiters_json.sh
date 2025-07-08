#!/bin/bash

# Script to generate all arbiters contract JSON files
set -e

# Create output directory for arbiters JSON files
ARBITERS_JSON_DIR="arbiters_json"
mkdir -p "$ARBITERS_JSON_DIR"

echo "Generating JSON files for all arbiters contracts..."

# List of all arbiters contract names (based on the source files we found)
arbiters=(
    "TrivialArbiter"
    "IntrinsicsArbiter"
    "IntrinsicsArbiter2"
    "TrustedOracleArbiter"
    "TrustedPartyArbiter"
    "AllArbiter"
    "AnyArbiter"
    "NotArbiter"
    "ConfirmationArbiter"
    "ConfirmationArbiterComposing"
    "RevocableConfirmationArbiter"
    "RevocableConfirmationArbiterComposing"
    "UnrevocableConfirmationArbiter"
    "UnrevocableConfirmationArbiterComposing"
    "OptimisticStringValidator"
    "ERC1155PaymentFulfillmentArbiter"
    "ERC20PaymentFulfillmentArbiter"
    "ERC721PaymentFulfillmentArbiter"
    "TokenBundlePaymentFulfillmentArbiter"
    "AttesterArbiter"
    "ExpirationTimeAfterArbiter"
    "ExpirationTimeBeforeArbiter"
    "ExpirationTimeEqualArbiter"
    "RecipientArbiter"
    "RefUidArbiter"
    "RevocableArbiter"
    "SchemaArbiter"
    "TimeAfterArbiter"
    "TimeBeforeArbiter"
    "TimeEqualArbiter"
    "UidArbiter"
)

# Copy JSON files for each arbiter
count=0
for arbiter in "${arbiters[@]}"; do
    json_file="out/${arbiter}.sol/${arbiter}.json"
    
    if [ -f "$json_file" ]; then
        cp "$json_file" "$ARBITERS_JSON_DIR/${arbiter}.json"
        echo "✓ Generated: ${arbiter}.json"
        ((count++))
    else
        echo "✗ Not found: $json_file"
    fi
done

echo ""
echo "Summary:"
echo "- Total arbiters found: $count"
echo "- JSON files saved to: $ARBITERS_JSON_DIR/"
echo ""
echo "Generated arbiters JSON files:"
ls -la "$ARBITERS_JSON_DIR/"
