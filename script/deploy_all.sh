#!/bin/bash

source .env
# Set variables
CHAIN_ID=84532

# Create deployment output directory
TIMESTAMP=$(date +%s)
mkdir -p deployments
OUTPUT_FILE="deployments/deployment_${TIMESTAMP}.txt"

# Perform deployment
echo "Deploying to Base Sepolia..."
echo "Deployment output will be saved to: $OUTPUT_FILE"

forge script script/Deploy.s.sol:Deploy \
    --rpc-url $RPC_URL \
    --private-key $DEPLOYMENT_KEY \
    --broadcast \
    --verify \
    -vvvv \
    --with-gas-price 10000000 \
    --slow \
    --legacy > "$OUTPUT_FILE" 2>&1

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo "Deployment completed successfully"

    # Extract the contract addresses from the deployment output
    grep -E '(^[A-Z][a-zA-Z0-9]+:)|(^[a-z][a-zA-Z0-9]+:)' "$OUTPUT_FILE" > "deployments/addresses_${TIMESTAMP}.txt"

    # Update the config file
    echo "Updating config file..."
    node script/update_config.js "deployments/addresses_${TIMESTAMP}.txt" "Base Sepolia" "alkahest-ts/src/config.ts"

    echo "Deployment and config update complete"
else
    echo "Deployment failed. Check the log file: $OUTPUT_FILE"
    exit 1
fi
