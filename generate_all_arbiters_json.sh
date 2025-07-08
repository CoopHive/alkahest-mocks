#!/bin/bash

# Script to generate all arbiters contract JSON files
set -e

# Create output directory for arbiters JSON files
ARBITERS_JSON_DIR="arbiters_json"
rm -rf "$ARBITERS_JSON_DIR"
mkdir -p "$ARBITERS_JSON_DIR"

echo "Generating JSON files for all arbiters contracts..."

# Core arbiters
core_arbiters=(
    "TrivialArbiter"
    "IntrinsicsArbiter"
    "IntrinsicsArbiter2"
    "TrustedOracleArbiter"
    "TrustedPartyArbiter"
)

# Logical arbiters
logical_arbiters=(
    "AllArbiter"
    "AnyArbiter"
    "NotArbiter"
)

# Confirmation arbiters
confirmation_arbiters=(
    "ConfirmationArbiter"
    "ConfirmationArbiterComposing"
    "RevocableConfirmationArbiter"
    "RevocableConfirmationArbiterComposing"
    "UnrevocableConfirmationArbiter"
    "UnrevocableConfirmationArbiterComposing"
)

# Example arbiters
example_arbiters=(
    "OptimisticStringValidator"
)

# Payment fulfillment arbiters
payment_arbiters=(
    "ERC1155PaymentFulfillmentArbiter"
    "ERC20PaymentFulfillmentArbiter"
    "ERC721PaymentFulfillmentArbiter"
    "TokenBundlePaymentFulfillmentArbiter"
)

# Attestation property arbiters (composing)
composing_arbiters=(
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

# Non-composing attestation property arbiters
non_composing_arbiters=(
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

copy_arbiter() {
    local arbiter_name="$1"
    local source_path="$2"
    local target_name="$3"
    
    if [ -f "$source_path" ]; then
        cp "$source_path" "$ARBITERS_JSON_DIR/${target_name}.json"
        echo "✓ Generated: ${target_name}.json"
        return 0
    else
        echo "✗ Not found: $source_path"
        return 1
    fi
}

count=0

echo "Processing core arbiters..."
for arbiter in "${core_arbiters[@]}"; do
    if copy_arbiter "$arbiter" "out/${arbiter}.sol/${arbiter}.json" "$arbiter"; then
        ((count++))
    fi
done

echo "Processing logical arbiters..."
for arbiter in "${logical_arbiters[@]}"; do
    if copy_arbiter "$arbiter" "out/${arbiter}.sol/${arbiter}.json" "$arbiter"; then
        ((count++))
    fi
done

echo "Processing confirmation arbiters..."
for arbiter in "${confirmation_arbiters[@]}"; do
    if copy_arbiter "$arbiter" "out/${arbiter}.sol/${arbiter}.json" "$arbiter"; then
        ((count++))
    fi
done

echo "Processing example arbiters..."
for arbiter in "${example_arbiters[@]}"; do
    if copy_arbiter "$arbiter" "out/${arbiter}.sol/${arbiter}.json" "$arbiter"; then
        ((count++))
    fi
done

echo "Processing payment fulfillment arbiters..."
for arbiter in "${payment_arbiters[@]}"; do
    if copy_arbiter "$arbiter" "out/${arbiter}.sol/${arbiter}.json" "$arbiter"; then
        ((count++))
    fi
done

echo "Processing composing attestation property arbiters..."
for arbiter in "${composing_arbiters[@]}"; do
    if copy_arbiter "$arbiter" "out/${arbiter}.sol/${arbiter}.json" "${arbiter}_Composing"; then
        ((count++))
    fi
done

echo "Processing non-composing attestation property arbiters..."
for arbiter in "${non_composing_arbiters[@]}"; do
    if copy_arbiter "$arbiter" "out/non-composing/${arbiter}.sol/${arbiter}.json" "${arbiter}_NonComposing"; then
        ((count++))
    fi
done

echo ""
echo "Summary:"
echo "- Total arbiters found: $count"
echo "- JSON files saved to: $ARBITERS_JSON_DIR/"
echo ""
echo "Generated arbiters JSON files:"
ls -la "$ARBITERS_JSON_DIR/" | wc -l | xargs echo "Total files:"
echo ""
echo "File listing:"
ls -1 "$ARBITERS_JSON_DIR/" | sort
