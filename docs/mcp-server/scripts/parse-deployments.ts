import { readFileSync, readdirSync } from "fs";
import { join, basename } from "path";
import type { ChainDeployment } from "../src/data/types.js";

const DEPLOYMENTS_DIR = join(import.meta.dir, "../../../contracts/deployments");

// Map filenames to chain info
const CHAIN_INFO: Record<string, { chainName: string; chainId?: number }> = {
  deployment_base_sepolia: { chainName: "Base Sepolia", chainId: 84532 },
  deployment_sepolia: { chainName: "Sepolia", chainId: 11155111 },
  deployment_monad: { chainName: "Monad Testnet", chainId: 143 },
};

// Convert camelCase to PascalCase for contract names
function camelToPascal(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const LEGACY_KEY_MAP: Record<string, string> = {
  eas: "EAS",
  easSchemaRegistry: "EASSchemaRegistry",
  attestationEscrowObligation2: "AttestationReferenceEscrowObligation",
  attestationBarterUtils: "AtomicAttestationUtils",
  erc20BarterUtils: "ERC20AtomicPaymentUtils",
  erc721BarterUtils: "ERC721AtomicPaymentUtils",
  erc1155BarterUtils: "ERC1155AtomicPaymentUtils",
  nativeTokenBarterUtils: "NativeTokenAtomicPaymentUtils",
  tokenBundleBarterUtils: "TokenBundleAtomicPaymentUtils",
};

function deploymentKeyToContractName(key: string): string {
  if (LEGACY_KEY_MAP[key]) {
    return LEGACY_KEY_MAP[key];
  }

  return camelToPascal(key)
    .replace(/^Erc20/, "ERC20")
    .replace(/^Erc721/, "ERC721")
    .replace(/^Erc1155/, "ERC1155")
    .replace(/^Erc8004/, "ERC8004")
    .replace(/^Eas$/, "EAS")
    .replace(/^EasSchemaRegistry$/, "EASSchemaRegistry");
}

// Parse a deployment JSON file
function parseDeploymentFile(filePath: string): ChainDeployment | null {
  const fileName = basename(filePath, ".json");

  // Skip timestamped deployments (e.g., deployment_1742448700)
  if (/deployment_\d+/.test(fileName)) {
    return null;
  }

  const chainInfo = CHAIN_INFO[fileName];
  if (!chainInfo) {
    console.warn(`Unknown chain for file: ${fileName}`);
    return null;
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const data = JSON.parse(content) as Record<string, string>;

    const contracts: ChainDeployment["contracts"] = {};
    for (const [key, address] of Object.entries(data)) {
      const contractName = deploymentKeyToContractName(key);
      contracts[contractName] = {
        address: address.toLowerCase(),
      };
    }

    return {
      chainId: chainInfo.chainId,
      chainName: chainInfo.chainName,
      contracts,
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

// Main export function
export async function parseDeployments(): Promise<ChainDeployment[]> {
  const files = readdirSync(DEPLOYMENTS_DIR)
    .filter((f) => f.startsWith("deployment_") && f.endsWith(".json"))
    .map((f) => join(DEPLOYMENTS_DIR, f));

  const deployments: ChainDeployment[] = [];

  for (const file of files) {
    const deployment = parseDeploymentFile(file);
    if (deployment) {
      deployments.push(deployment);
    }
  }

  console.log(`Parsed ${deployments.length} chain deployments`);
  return deployments;
}

// Run directly for testing
if (import.meta.main) {
  const deployments = await parseDeployments();
  console.log(JSON.stringify(deployments, null, 2));
}
