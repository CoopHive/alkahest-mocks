#!/usr/bin/env bun run

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type ContractAddresses = {
	[key: string]: string;
};

function parseContractAddresses(input: string): ContractAddresses {
	// Initialize the result object
	const result: ContractAddresses = {
		erc20EscrowObligation: "",
		erc20PaymentObligation: "",
		erc20BarterUtils: "",
		erc721EscrowObligation: "",
		erc721PaymentObligation: "",
		erc721BarterUtils: "",
		erc1155EscrowObligation: "",
		erc1155PaymentObligation: "",
		erc1155BarterUtils: "",
		tokenBundleEscrowObligation: "",
		tokenBundlePaymentObligation: "",
		tokenBundleBarterUtils: "",
		attestationEscrowObligation: "",
		attestationEscrowObligation2: "",
		attestationBarterUtils: "",
	};

	// Split the input into lines and process each line
	const lines = input.split("\n");

	lines.forEach((line) => {
		// Skip empty lines and category headers
		if (!line.trim() || line.endsWith(":")) {
			return;
		}

		// Extract contract name and address
		const match = line.match(/\s+([A-Za-z0-9]+):\s*(0x[a-fA-F0-9]+)/);
		if (match) {
			const [, contractName, address] = match;
			// Convert contract name to camelCase, handling numbers correctly
			const camelCaseName = contractName.replace(/^[A-Z]+/, (str) =>
				str.toLowerCase(),
			);

			// Update the result object if the key exists
			if (camelCaseName in result) {
				result[camelCaseName] = address;
			}
		}
	});

	return result;
}

// CLI handling
function main() {
	// Check if a file path was provided
	if (process.argv.length < 3) {
		console.error("Usage: ts-node script.ts <input-file-path>");
		process.exit(1);
	}

	const inputPath = process.argv[2];
	const outputPath = join(process.cwd(), "contract-addresses.json");

	try {
		// Read input file
		const input = readFileSync(inputPath, "utf8");

		// Parse contracts
		const result = parseContractAddresses(input);

		// Write to output file
		writeFileSync(outputPath, JSON.stringify(result, null, 2));

		console.log(`Successfully wrote contract addresses to ${outputPath}`);
	} catch (error) {
		console.error("Error:", error.message);
		process.exit(1);
	}
}

main();
