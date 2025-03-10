#!/usr/bin/env node

// This script parses the deployment output and updates the TypeScript config file
// Usage: node update_config.js <deployment_log_file> <network> <config_file>
// Example: node update_config.js deploy_output.txt "Base Sepolia" ../alkahest-ts/src/config.ts

const fs = require('fs');

// Parse command line arguments
const deployOutputFile = process.argv[2];
if (!deployOutputFile) {
  console.error('Error: Deployment output file is required.');
  console.error('Usage: node update_config.js <deployment_log_file> <network> <config_file>');
  process.exit(1);
}

const network = process.argv[3] || 'Base Sepolia';
const configFile = process.argv[4] || '../alkahest-ts/src/config.ts';

// Read deployment output
let deployOutput;
try {
  deployOutput = fs.readFileSync(deployOutputFile, 'utf8');
} catch (error) {
  console.error(`Error reading deployment output file: ${error.message}`);
  process.exit(1);
}

// Read config file
let configContent;
try {
  configContent = fs.readFileSync(configFile, 'utf8');
} catch (error) {
  console.error(`Error reading config file: ${error.message}`);
  process.exit(1);
}

// Parse contract addresses from deployment output
const addressMap = {};
const lines = deployOutput.split('\n');

let currentCategory = '';
for (const line of lines) {
  if (line.trim() === '') continue;
  
  // Check if this is a category line
  if (line.startsWith('\n')) {
    const categoryMatch = line.match(/\n([^:]+):/);
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim();
      continue;
    }
  }
  
  // Parse contract address
  const addressMatch = line.match(/([^:]+):\s+(0x[a-fA-F0-9]{40})/);
  if (addressMatch) {
    const contractName = addressMatch[1].trim();
    const address = addressMatch[2].trim();
    
    // Convert contract name to camelCase for config file
    let configKey = contractName;
    
    // If it's an ERC contract, make sure to preserve the case for ERC part
    if (configKey.startsWith('ERC')) {
      const ercPart = configKey.match(/^(ERC\d+)/)[1];
      const restPart = configKey.substring(ercPart.length);
      configKey = ercPart.toLowerCase() + restPart.charAt(0).toLowerCase() + restPart.slice(1);
    } else {
      configKey = configKey.charAt(0).toLowerCase() + configKey.slice(1);
    }
    
    addressMap[configKey] = address;
  }
}

// Update config file
let updatedConfig = configContent;

// Replace contract addresses
for (const [key, address] of Object.entries(addressMap)) {
  const regex = new RegExp(`(${key}):\\s*"0x[a-fA-F0-9]{40}"`, 'g');
  if (updatedConfig.match(regex)) {
    updatedConfig = updatedConfig.replace(regex, `${key}: "${address}"`);
    console.log(`Updated ${key} address to ${address}`);
  } else {
    console.warn(`Warning: Could not find entry for ${key} in config file.`);
  }
}

// Write updated config back to file
try {
  fs.writeFileSync(configFile, updatedConfig, 'utf8');
  console.log(`Updated config file: ${configFile}`);
} catch (error) {
  console.error(`Error writing to config file: ${error.message}`);
  process.exit(1);
}