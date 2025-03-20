#!/usr/bin/env tsx
import {
  createWalletClient,
  http,
  createPublicClient,
  formatEther,
  publicActions,
  nonceManager,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia, filecoinCalibration, mainnet } from "viem/chains";
import { parseArgs } from "node:util";

// Import contract artifacts
import EAS from "../../out/EAS.sol/EAS.json";
import SchemaRegistry from "../../out/SchemaRegistry.sol/SchemaRegistry.json";

// ERC20 Contracts
import ERC20EscrowObligation from "../../out/ERC20EscrowObligation.sol/ERC20EscrowObligation.json";
import ERC20PaymentObligation from "../../out/ERC20PaymentObligation.sol/ERC20PaymentObligation.json";
import ERC20BarterCrossToken from "../../out/ERC20BarterCrossToken.sol/ERC20BarterCrossToken.json";

// ERC721 Contracts
import ERC721EscrowObligation from "../../out/ERC721EscrowObligation.sol/ERC721EscrowObligation.json";
import ERC721PaymentObligation from "../../out/ERC721PaymentObligation.sol/ERC721PaymentObligation.json";
import ERC721BarterCrossToken from "../../out/ERC721BarterCrossToken.sol/ERC721BarterCrossToken.json";

// ERC1155 Contracts
import ERC1155EscrowObligation from "../../out/ERC1155EscrowObligation.sol/ERC1155EscrowObligation.json";
import ERC1155PaymentObligation from "../../out/ERC1155PaymentObligation.sol/ERC1155PaymentObligation.json";
import ERC1155BarterCrossToken from "../../out/ERC1155BarterCrossToken.sol/ERC1155BarterCrossToken.json";

// TokenBundle Contracts
import TokenBundleEscrowObligation from "../../out/TokenBundleEscrowObligation.sol/TokenBundleEscrowObligation.json";
import TokenBundlePaymentObligation from "../../out/TokenBundlePaymentObligation.sol/TokenBundlePaymentObligation.json";
import TokenBundleBarterUtils from "../../out/TokenBundleBarterUtils.sol/TokenBundleBarterUtils.json";

// Attestation Contracts
import AttestationEscrowObligation from "../../out/AttestationEscrowObligation.sol/AttestationEscrowObligation.json";
import AttestationEscrowObligation2 from "../../out/AttestationEscrowObligation2.sol/AttestationEscrowObligation2.json";
import AttestationBarterUtils from "../../out/AttestationBarterUtils.sol/AttestationBarterUtils.json";

// Arbiter Contracts
import SpecificAttestationArbiter from "../../out/SpecificAttestationArbiter.sol/SpecificAttestationArbiter.json";
import TrustedPartyArbiter from "../../out/TrustedPartyArbiter.sol/TrustedPartyArbiter.json";
import TrivialArbiter from "../../out/TrivialArbiter.sol/TrivialArbiter.json";
import TrustedOracleArbiter from "../../out/TrustedOracleArbiter.sol/TrustedOracleArbiter.json";

// String Obligation
import StringObligation from "../../out/StringObligation.sol/StringObligation.json";

interface Addresses {
  eas: `0x${string}`;
  schemaRegistry: `0x${string}`;
  specificAttestationArbiter: `0x${string}`;
  trustedPartyArbiter: `0x${string}`;
  trivialArbiter: `0x${string}`;
  trustedOracleArbiter: `0x${string}`;
  stringObligation: `0x${string}`;
  erc20EscrowObligation: `0x${string}`;
  erc20PaymentObligation: `0x${string}`;
  erc721EscrowObligation: `0x${string}`;
  erc721PaymentObligation: `0x${string}`;
  erc1155EscrowObligation: `0x${string}`;
  erc1155PaymentObligation: `0x${string}`;
  tokenBundleEscrowObligation: `0x${string}`;
  tokenBundlePaymentObligation: `0x${string}`;
  tokenBundleBarterUtils: `0x${string}`;
  erc20BarterUtils: `0x${string}`;
  erc721BarterUtils: `0x${string}`;
  erc1155BarterUtils: `0x${string}`;
  attestationEscrowObligation: `0x${string}`;
  attestationEscrowObligation2: `0x${string}`;
  attestationBarterUtils: `0x${string}`;
}

async function main() {
  console.log("Starting deployment...");

  // Parse command line arguments
  const { values } = parseArgs({
    options: {
      eas: { type: "boolean", default: false },
    },
  });

  // Load environment variables
  const deploymentKey = process.env.DEPLOYMENT_KEY;
  if (!deploymentKey) {
    throw new Error("DEPLOYMENT_KEY environment variable is required");
  }

  // Create wallet client
  const account = privateKeyToAccount(deploymentKey as `0x${string}`, {
    nonceManager,
  });
  console.log(`Deploying with account: ${account.address}`);

  const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  }).extend(publicActions);

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  // Check account balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Account balance: ${formatEther(balance)} ETH`);

  // Initialize addresses object
  const addresses: Addresses = {
    eas: "0x" as `0x${string}`,
    schemaRegistry: "0x" as `0x${string}`,
    specificAttestationArbiter: "0x" as `0x${string}`,
    trustedPartyArbiter: "0x" as `0x${string}`,
    trivialArbiter: "0x" as `0x${string}`,
    trustedOracleArbiter: "0x" as `0x${string}`,
    stringObligation: "0x" as `0x${string}`,
    erc20EscrowObligation: "0x" as `0x${string}`,
    erc20PaymentObligation: "0x" as `0x${string}`,
    erc721EscrowObligation: "0x" as `0x${string}`,
    erc721PaymentObligation: "0x" as `0x${string}`,
    erc1155EscrowObligation: "0x" as `0x${string}`,
    erc1155PaymentObligation: "0x" as `0x${string}`,
    tokenBundleEscrowObligation: "0x" as `0x${string}`,
    tokenBundlePaymentObligation: "0x" as `0x${string}`,
    tokenBundleBarterUtils: "0x" as `0x${string}`,
    erc20BarterUtils: "0x" as `0x${string}`,
    erc721BarterUtils: "0x" as `0x${string}`,
    erc1155BarterUtils: "0x" as `0x${string}`,
    attestationEscrowObligation: "0x" as `0x${string}`,
    attestationEscrowObligation2: "0x" as `0x${string}`,
    attestationBarterUtils: "0x" as `0x${string}`,
  };

  // Deploy or use existing EAS and schema registry
  if (values.eas) {
    console.log("Deploying EAS and schema registry...");

    // Deploy SchemaRegistry
    const schemaRegistryHash = await client.deployContract({
      abi: SchemaRegistry.abi,
      bytecode: SchemaRegistry.bytecode.object as `0x${string}`,
      args: [],
    });

    console.log(`SchemaRegistry deployment transaction: ${schemaRegistryHash}`);
    const schemaRegistryReceipt = await publicClient.waitForTransactionReceipt({
      hash: schemaRegistryHash,
    });
    addresses.schemaRegistry =
      schemaRegistryReceipt.contractAddress as `0x${string}`;
    console.log(`SchemaRegistry deployed at: ${addresses.schemaRegistry}`);

    // Deploy EAS with SchemaRegistry address
    const easHash = await client.deployContract({
      abi: EAS.abi,
      bytecode: EAS.bytecode.object as `0x${string}`,
      args: [addresses.schemaRegistry],
    });

    console.log(`EAS deployment transaction: ${easHash}`);
    const easReceipt = await publicClient.waitForTransactionReceipt({
      hash: easHash,
    });
    addresses.eas = easReceipt.contractAddress as `0x${string}`;
    console.log(`EAS deployed at: ${addresses.eas}`);
  } else {
    // Use existing EAS and schema registry addresses from environment variables
    const easAddress = process.env.EAS_ADDRESS;
    const schemaRegistryAddress = process.env.EAS_SR_ADDRESS;

    if (!easAddress || !schemaRegistryAddress) {
      throw new Error(
        "EAS_ADDRESS and EAS_SR_ADDRESS environment variables must be provided when not deploying EAS",
      );
    }

    addresses.eas = easAddress as `0x${string}`;
    addresses.schemaRegistry = schemaRegistryAddress as `0x${string}`;
    console.log(`Using existing EAS at: ${addresses.eas}`);
    console.log(
      `Using existing SchemaRegistry at: ${addresses.schemaRegistry}`,
    );
  }

  // Deploy arbiters
  console.log("\nDeploying arbiters...");

  // Deploy SpecificAttestationArbiter
  const specificArbiterHash = await client.deployContract({
    abi: SpecificAttestationArbiter.abi,
    bytecode: SpecificAttestationArbiter.bytecode.object as `0x${string}`,
    args: [],
  });
  console.log(
    `SpecificAttestationArbiter deployment transaction: ${specificArbiterHash}`,
  );
  const specificArbiterReceipt = await publicClient.waitForTransactionReceipt({
    hash: specificArbiterHash,
  });
  addresses.specificAttestationArbiter =
    specificArbiterReceipt.contractAddress as `0x${string}`;

  // Deploy TrustedPartyArbiter
  const trustedPartyArbiterHash = await client.deployContract({
    abi: TrustedPartyArbiter.abi,
    bytecode: TrustedPartyArbiter.bytecode.object as `0x${string}`,
    args: [],
  });
  console.log(
    `TrustedPartyArbiter deployment transaction: ${trustedPartyArbiterHash}`,
  );
  const trustedPartyArbiterReceipt =
    await publicClient.waitForTransactionReceipt({
      hash: trustedPartyArbiterHash,
    });
  addresses.trustedPartyArbiter =
    trustedPartyArbiterReceipt.contractAddress as `0x${string}`;

  // Deploy TrivialArbiter
  const trivialArbiterHash = await client.deployContract({
    abi: TrivialArbiter.abi,
    bytecode: TrivialArbiter.bytecode.object as `0x${string}`,
    args: [],
  });
  console.log(`TrivialArbiter deployment transaction: ${trivialArbiterHash}`);
  const trivialArbiterReceipt = await publicClient.waitForTransactionReceipt({
    hash: trivialArbiterHash,
  });
  addresses.trivialArbiter =
    trivialArbiterReceipt.contractAddress as `0x${string}`;

  // Deploy TrustedOracleArbiter
  const trustedOracleArbiterHash = await client.deployContract({
    abi: TrustedOracleArbiter.abi,
    bytecode: TrustedOracleArbiter.bytecode.object as `0x${string}`,
    args: [],
  });
  console.log(
    `TrustedOracleArbiter deployment transaction: ${trustedOracleArbiterHash}`,
  );
  const trustedOracleArbiterReceipt =
    await publicClient.waitForTransactionReceipt({
      hash: trustedOracleArbiterHash,
    });
  addresses.trustedOracleArbiter =
    trustedOracleArbiterReceipt.contractAddress as `0x${string}`;

  // Deploy StringObligation
  console.log("\nDeploying StringObligation...");
  const stringObligationHash = await client.deployContract({
    abi: StringObligation.abi,
    bytecode: StringObligation.bytecode.object as `0x${string}`,
    args: [addresses.eas, addresses.schemaRegistry],
  });
  console.log(
    `StringObligation deployment transaction: ${stringObligationHash}`,
  );
  const stringObligationReceipt = await publicClient.waitForTransactionReceipt({
    hash: stringObligationHash,
  });
  addresses.stringObligation =
    stringObligationReceipt.contractAddress as `0x${string}`;

  // Deploy ERC20 contracts
  console.log("\nDeploying ERC20 contracts...");
  const erc20EscrowHash = await client.deployContract({
    abi: ERC20EscrowObligation.abi,
    bytecode: ERC20EscrowObligation.bytecode.object as `0x${string}`,
    args: [addresses.eas, addresses.schemaRegistry],
  });
  console.log(
    `ERC20EscrowObligation deployment transaction: ${erc20EscrowHash}`,
  );
  const erc20EscrowReceipt = await publicClient.waitForTransactionReceipt({
    hash: erc20EscrowHash,
  });
  addresses.erc20EscrowObligation =
    erc20EscrowReceipt.contractAddress as `0x${string}`;

  const erc20PaymentHash = await client.deployContract({
    abi: ERC20PaymentObligation.abi,
    bytecode: ERC20PaymentObligation.bytecode.object as `0x${string}`,
    args: [addresses.eas, addresses.schemaRegistry],
  });
  console.log(
    `ERC20PaymentObligation deployment transaction: ${erc20PaymentHash}`,
  );
  const erc20PaymentReceipt = await publicClient.waitForTransactionReceipt({
    hash: erc20PaymentHash,
  });
  addresses.erc20PaymentObligation =
    erc20PaymentReceipt.contractAddress as `0x${string}`;

  // Deploy ERC721 contracts
  console.log("\nDeploying ERC721 contracts...");
  const erc721EscrowHash = await client.deployContract({
    abi: ERC721EscrowObligation.abi,
    bytecode: ERC721EscrowObligation.bytecode.object as `0x${string}`,
    args: [addresses.eas, addresses.schemaRegistry],
  });
  console.log(
    `ERC721EscrowObligation deployment transaction: ${erc721EscrowHash}`,
  );
  const erc721EscrowReceipt = await publicClient.waitForTransactionReceipt({
    hash: erc721EscrowHash,
  });
  addresses.erc721EscrowObligation =
    erc721EscrowReceipt.contractAddress as `0x${string}`;

  const erc721PaymentHash = await client.deployContract({
    abi: ERC721PaymentObligation.abi,
    bytecode: ERC721PaymentObligation.bytecode.object as `0x${string}`,
    args: [addresses.eas, addresses.schemaRegistry],
  });
  console.log(
    `ERC721PaymentObligation deployment transaction: ${erc721PaymentHash}`,
  );
  const erc721PaymentReceipt = await publicClient.waitForTransactionReceipt({
    hash: erc721PaymentHash,
  });
  addresses.erc721PaymentObligation =
    erc721PaymentReceipt.contractAddress as `0x${string}`;

  // Deploy ERC1155 contracts
  console.log("\nDeploying ERC1155 contracts...");
  const erc1155EscrowHash = await client.deployContract({
    abi: ERC1155EscrowObligation.abi,
    bytecode: ERC1155EscrowObligation.bytecode.object as `0x${string}`,
    args: [addresses.eas, addresses.schemaRegistry],
  });
  console.log(
    `ERC1155EscrowObligation deployment transaction: ${erc1155EscrowHash}`,
  );
  const erc1155EscrowReceipt = await publicClient.waitForTransactionReceipt({
    hash: erc1155EscrowHash,
  });
  addresses.erc1155EscrowObligation =
    erc1155EscrowReceipt.contractAddress as `0x${string}`;

  const erc1155PaymentHash = await client.deployContract({
    abi: ERC1155PaymentObligation.abi,
    bytecode: ERC1155PaymentObligation.bytecode.object as `0x${string}`,
    args: [addresses.eas, addresses.schemaRegistry],
  });
  console.log(
    `ERC1155PaymentObligation deployment transaction: ${erc1155PaymentHash}`,
  );
  const erc1155PaymentReceipt = await publicClient.waitForTransactionReceipt({
    hash: erc1155PaymentHash,
  });
  addresses.erc1155PaymentObligation =
    erc1155PaymentReceipt.contractAddress as `0x${string}`;

  // Deploy TokenBundle contracts
  console.log("\nDeploying TokenBundle contracts...");
  const bundleEscrowHash = await client.deployContract({
    abi: TokenBundleEscrowObligation.abi,
    bytecode: TokenBundleEscrowObligation.bytecode.object as `0x${string}`,
    args: [addresses.eas, addresses.schemaRegistry],
  });
  console.log(
    `TokenBundleEscrowObligation deployment transaction: ${bundleEscrowHash}`,
  );
  const bundleEscrowReceipt = await publicClient.waitForTransactionReceipt({
    hash: bundleEscrowHash,
  });
  addresses.tokenBundleEscrowObligation =
    bundleEscrowReceipt.contractAddress as `0x${string}`;

  const bundlePaymentHash = await client.deployContract({
    abi: TokenBundlePaymentObligation.abi,
    bytecode: TokenBundlePaymentObligation.bytecode.object as `0x${string}`,
    args: [addresses.eas, addresses.schemaRegistry],
  });
  console.log(
    `TokenBundlePaymentObligation deployment transaction: ${bundlePaymentHash}`,
  );
  const bundlePaymentReceipt = await publicClient.waitForTransactionReceipt({
    hash: bundlePaymentHash,
  });
  addresses.tokenBundlePaymentObligation =
    bundlePaymentReceipt.contractAddress as `0x${string}`;

  const bundleBarterUtilsHash = await client.deployContract({
    abi: TokenBundleBarterUtils.abi,
    bytecode: TokenBundleBarterUtils.bytecode.object as `0x${string}`,
    args: [
      addresses.eas,
      addresses.tokenBundleEscrowObligation,
      addresses.tokenBundlePaymentObligation,
    ],
  });
  console.log(
    `TokenBundleBarterUtils deployment transaction: ${bundleBarterUtilsHash}`,
  );
  const bundleBarterUtilsReceipt = await publicClient.waitForTransactionReceipt(
    {
      hash: bundleBarterUtilsHash,
    },
  );
  addresses.tokenBundleBarterUtils =
    bundleBarterUtilsReceipt.contractAddress as `0x${string}`;

  // Deploy cross token barter contracts
  console.log("\nDeploying cross token barter contracts...");
  const erc20BarterCrossTokenHash = await client.deployContract({
    abi: ERC20BarterCrossToken.abi,
    bytecode: ERC20BarterCrossToken.bytecode.object as `0x${string}`,
    args: [
      addresses.eas,
      addresses.erc20EscrowObligation,
      addresses.erc20PaymentObligation,
      addresses.erc721EscrowObligation,
      addresses.erc721PaymentObligation,
      addresses.erc1155EscrowObligation,
      addresses.erc1155PaymentObligation,
      addresses.tokenBundleEscrowObligation,
      addresses.tokenBundlePaymentObligation,
    ],
  });
  console.log(
    `ERC20BarterCrossToken deployment transaction: ${erc20BarterCrossTokenHash}`,
  );
  const erc20BarterCrossTokenReceipt =
    await publicClient.waitForTransactionReceipt({
      hash: erc20BarterCrossTokenHash,
    });
  addresses.erc20BarterUtils =
    erc20BarterCrossTokenReceipt.contractAddress as `0x${string}`;

  const erc721BarterCrossTokenHash = await client.deployContract({
    abi: ERC721BarterCrossToken.abi,
    bytecode: ERC721BarterCrossToken.bytecode.object as `0x${string}`,
    args: [
      addresses.eas,
      addresses.erc20EscrowObligation,
      addresses.erc20PaymentObligation,
      addresses.erc721EscrowObligation,
      addresses.erc721PaymentObligation,
      addresses.erc1155EscrowObligation,
      addresses.erc1155PaymentObligation,
      addresses.tokenBundleEscrowObligation,
      addresses.tokenBundlePaymentObligation,
    ],
  });
  console.log(
    `ERC721BarterCrossToken deployment transaction: ${erc721BarterCrossTokenHash}`,
  );
  const erc721BarterCrossTokenReceipt =
    await publicClient.waitForTransactionReceipt({
      hash: erc721BarterCrossTokenHash,
    });
  addresses.erc721BarterUtils =
    erc721BarterCrossTokenReceipt.contractAddress as `0x${string}`;

  const erc1155BarterCrossTokenHash = await client.deployContract({
    abi: ERC1155BarterCrossToken.abi,
    bytecode: ERC1155BarterCrossToken.bytecode.object as `0x${string}`,
    args: [
      addresses.eas,
      addresses.erc20EscrowObligation,
      addresses.erc20PaymentObligation,
      addresses.erc721EscrowObligation,
      addresses.erc721PaymentObligation,
      addresses.erc1155EscrowObligation,
      addresses.erc1155PaymentObligation,
      addresses.tokenBundleEscrowObligation,
      addresses.tokenBundlePaymentObligation,
    ],
  });
  console.log(
    `ERC1155BarterCrossToken deployment transaction: ${erc1155BarterCrossTokenHash}`,
  );
  const erc1155BarterCrossTokenReceipt =
    await publicClient.waitForTransactionReceipt({
      hash: erc1155BarterCrossTokenHash,
    });
  addresses.erc1155BarterUtils =
    erc1155BarterCrossTokenReceipt.contractAddress as `0x${string}`;

  // Deploy attestation barter contracts
  console.log("\nDeploying attestation barter contracts...");
  const attestationEscrowHash = await client.deployContract({
    abi: AttestationEscrowObligation.abi,
    bytecode: AttestationEscrowObligation.bytecode.object as `0x${string}`,
    args: [addresses.eas, addresses.schemaRegistry],
  });
  console.log(
    `AttestationEscrowObligation deployment transaction: ${attestationEscrowHash}`,
  );
  const attestationEscrowReceipt = await publicClient.waitForTransactionReceipt(
    {
      hash: attestationEscrowHash,
    },
  );
  addresses.attestationEscrowObligation =
    attestationEscrowReceipt.contractAddress as `0x${string}`;

  const attestationEscrow2Hash = await client.deployContract({
    abi: AttestationEscrowObligation2.abi,
    bytecode: AttestationEscrowObligation2.bytecode.object as `0x${string}`,
    args: [addresses.eas, addresses.schemaRegistry],
  });
  console.log(
    `AttestationEscrowObligation2 deployment transaction: ${attestationEscrow2Hash}`,
  );
  const attestationEscrow2Receipt =
    await publicClient.waitForTransactionReceipt({
      hash: attestationEscrow2Hash,
    });
  addresses.attestationEscrowObligation2 =
    attestationEscrow2Receipt.contractAddress as `0x${string}`;

  const attestationBarterUtilsHash = await client.deployContract({
    abi: AttestationBarterUtils.abi,
    bytecode: AttestationBarterUtils.bytecode.object as `0x${string}`,
    args: [
      addresses.eas,
      addresses.schemaRegistry,
      addresses.attestationEscrowObligation2,
    ],
  });
  console.log(
    `AttestationBarterUtils deployment transaction: ${attestationBarterUtilsHash}`,
  );
  const attestationBarterUtilsReceipt =
    await publicClient.waitForTransactionReceipt({
      hash: attestationBarterUtilsHash,
    });
  addresses.attestationBarterUtils =
    attestationBarterUtilsReceipt.contractAddress as `0x${string}`;

  // Print all deployed addresses
  console.log("\n======== DEPLOYED ADDRESSES ========");
  console.log("\nEAS:");
  console.log(`EAS: ${addresses.eas}`);
  console.log(`Schema Registry: ${addresses.schemaRegistry}`);

  console.log("\nArbiters:");
  console.log(
    `SpecificAttestationArbiter: ${addresses.specificAttestationArbiter}`,
  );
  console.log(`TrustedPartyArbiter: ${addresses.trustedPartyArbiter}`);
  console.log(`TrivialArbiter: ${addresses.trivialArbiter}`);
  console.log(`TrustedOracleArbiter: ${addresses.trustedOracleArbiter}`);

  console.log("\nString Obligation:");
  console.log(`StringObligation: ${addresses.stringObligation}`);

  console.log("\nERC20 Contracts:");
  console.log(`ERC20EscrowObligation: ${addresses.erc20EscrowObligation}`);
  console.log(`ERC20PaymentObligation: ${addresses.erc20PaymentObligation}`);
  console.log(`ERC20BarterCrossToken: ${addresses.erc20BarterUtils}`);

  console.log("\nERC721 Contracts:");
  console.log(`ERC721EscrowObligation: ${addresses.erc721EscrowObligation}`);
  console.log(`ERC721PaymentObligation: ${addresses.erc721PaymentObligation}`);
  console.log(`ERC721BarterCrossToken: ${addresses.erc721BarterUtils}`);

  console.log("\nERC1155 Contracts:");
  console.log(`ERC1155EscrowObligation: ${addresses.erc1155EscrowObligation}`);
  console.log(
    `ERC1155PaymentObligation: ${addresses.erc1155PaymentObligation}`,
  );
  console.log(`ERC1155BarterCrossToken: ${addresses.erc1155BarterUtils}`);

  console.log("\nTokenBundle Contracts:");
  console.log(
    `TokenBundleEscrowObligation: ${addresses.tokenBundleEscrowObligation}`,
  );
  console.log(
    `TokenBundlePaymentObligation: ${addresses.tokenBundlePaymentObligation}`,
  );
  console.log(`TokenBundleBarterUtils: ${addresses.tokenBundleBarterUtils}`);

  console.log("\nAttestation Barter Contracts:");
  console.log(
    `AttestationEscrowObligation: ${addresses.attestationEscrowObligation}`,
  );
  console.log(
    `AttestationEscrowObligation2: ${addresses.attestationEscrowObligation2}`,
  );
  console.log(`AttestationBarterUtils: ${addresses.attestationBarterUtils}`);

  // Save addresses to a file with timestamp
  const timestamp = Math.floor(Date.now() / 1000);
  console.log(`\nSaving addresses to deployment_${timestamp}.json`);

  // Create JSON output
  const output = JSON.stringify(addresses, null, 2);

  // Using console.log because we're in a script
  console.log("\nDeployment complete!");
  console.log("\nAddresses JSON:");
  console.log(output);
}

main().catch((error) => {
  console.error("Error in deployment:", error);
  process.exit(1);
});
