#!/usr/bin/env bun

import { gen } from "./codegen";

async function main(args: string[]) {
  let [command, ...rest] = args;
  switch (command) {
    case "help":
      console.error("Usage: alkahest <command> [args]");
      console.error("Commands:");
      console.error("  help: Show this help message");
      console.error("  new: Create a new contract");
      break;
    case "new":
      [command, ...rest] = rest;
      switch (command) {
        case "obligation":
          return await createObligation(rest);
        case "arbiter":
          return await createArbiter(rest);
        default: {
          console.error("What kind of contract do you want to create?");
          console.error("[O]bligation or [A]rbiter");
          process.stderr.write("> ");
          let choice = "";
          for await (const line of console) {
            if (line.startsWith("o") || line.startsWith("O")) {
              choice = "obligation";
              break;
            }
            if (line.startsWith("a") || line.startsWith("A")) {
              choice = "arbiter";
              break;
            }
            console.error("Please choose [O]bligation or [A]rbiter");
            process.stderr.write("> ");
          }
          switch (choice) {
            case "obligation":
              return await createObligation(rest);
            case "arbiter":
              return await createArbiter(rest);
          }
        }
      }
      break;
    default:
      console.error("Unknown command:", command);
      console.error("Use 'alkahest help' for usage information.");
  }
}

async function createObligation(args: string[]) {
  let name = "";
  const opts = {
    isArbiter: false,
    isRevocable: false,
    finalizationTerms: 0,
    obligationData: "",
    demandData: "",
  };

  console.error("Creating new obligation contract");
  console.error(
    "What's the contract name? We recommend it ends with 'Obligation', [PaymentObligation]",
  );
  process.stderr.write("> ");
  for await (const line of console) {
    name = line ? line : "PaymentObligation";
    break;
  }
  console.error(
    "What's the statement schema? Enter a solidity ABI without parentheses. [address token, uint256 amount]",
  );
  process.stderr.write("> ");
  for await (const line of console) {
    opts.obligationData = line ? line : "address token, uint256 amount";
    break;
  }
  console.error(
    "Will it have a default implementation of `checkObligation`? [y/N]",
  );
  process.stderr.write("> ");
  for await (const line of console) {
    opts.isArbiter = line.startsWith("y") || line.startsWith("Y");
    break;
  }
  if (opts.isArbiter) {
    console.error(
      `What's the demand schema for \`checkObligation\`? [${opts.obligationData}]`,
    );
    process.stderr.write("> ");
    for await (const line of console) {
      opts.demandData = line ? line : opts.obligationData;
      break;
    }
  }
  console.error(
    "Will it be revocable? This includes normal finalization, like collecting a payment. [y/N]",
  );
  process.stderr.write("> ");
  for await (const line of console) {
    opts.isRevocable = line.startsWith("y") || line.startsWith("Y");
    break;
  }
  if (opts.isRevocable) {
    console.error(
      "How many finalization terms will it have? This includes cancellation or completion. [1]",
    );
    process.stderr.write("> ");
    for await (const line of console) {
      opts.finalizationTerms = Number.parseInt(line) ?? 1;
      break;
    }
  }
  console.error("Generating contract...");
  console.log(gen.obligation(name, opts));

  return 0;
}

async function createArbiter(args: string[]) {
  let name = "";
  const opts = {
    baseObligation: "",
    demandData: "",
  };

  console.error("Creating new arbiter contract");
  console.error(
    "What's the contract name? We recommend it ends with 'Arbiter', [PaymentArbiter]",
  );
  process.stderr.write("> ");
  for await (const line of console) {
    name = line ? line : "PaymentArbiter";
    break;
  }
  console.error(
    "What base statement is it for? Leave blank for a statement-generic arbiter.",
  );
  process.stderr.write("> ");
  for await (const line of console) {
    opts.baseObligation = line;
    break;
  }
  console.error(
    "What's the demand schema? Enter a solidity ABI without parentheses. [address token, uint256 amount]",
  );
  process.stderr.write("> ");
  for await (const line of console) {
    opts.demandData = line ? line : "address token, uint256 amount";
    break;
  }

  console.error("Generating contract...");
  console.log(gen.arbiter(name, opts));

  return 0;
}

await main(process.argv.slice(2));
