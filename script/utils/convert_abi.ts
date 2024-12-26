// convert-abi.ts

import { readdir, mkdir } from "fs/promises";
import { join } from "path";
import { parseArgs } from "util";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    in: {
      type: "string",
      short: "i",
      default: process.cwd(),
    },
    out: {
      type: "string",
      short: "o",
    },
    help: {
      type: "boolean",
      short: "h",
    },
  },
  strict: true,
  allowPositionals: true,
});

if (values.help) {
  console.log(`
Usage: bun run convert-abi.ts [options]

Options:
  -i, --in <dir>     Input directory (default: current directory)
  -o, --out <dir>    Output directory (default: same as input directory)
  -h, --help         Show this help message

Example:
  bun run convert-abi.ts --in ./abis --out ./generated
`);
  process.exit(0);
}

const inputDir = join(process.cwd(), values.in ?? "");
const outputDir = values.out ? join(process.cwd(), values.out) : inputDir;

async function convertAbiFiles() {
  try {
    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Read all files in the input directory
    const files = await readdir(inputDir);

    // Filter for .json files
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    if (jsonFiles.length === 0) {
      console.log("No JSON files found in the input directory.");
      return;
    }

    console.log(`Converting ABI files from ${inputDir} to ${outputDir}\n`);

    for (const file of jsonFiles) {
      const inputPath = join(inputDir, file);
      const outputPath = join(outputDir, file.replace(".json", ".ts"));

      try {
        // Read and parse JSON file
        const inputFile = Bun.file(inputPath);
        const jsonContent = await inputFile.text();
        const abi = JSON.parse(jsonContent);

        // Create TypeScript content
        const tsContent = `export const abi = ${JSON.stringify(abi, null, 2)} as const;`;

        // Write TypeScript file
        const outputFile = Bun.file(outputPath);
        await Bun.write(outputFile, tsContent);

        console.log(`✓ Converted ${file} -> ${file.replace(".json", ".ts")}`);
      } catch (error) {
        console.error(`✗ Error converting ${file}:`, error);
      }
    }

    console.log("\nConversion completed!");
  } catch (error) {
    console.error("Error during conversion:", error);
    process.exit(1);
  }
}

// Run the conversion
convertAbiFiles();
