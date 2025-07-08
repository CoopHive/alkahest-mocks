const license = "// SPDX-License-Identifier: UNLICENSED";
const pragma = "pragma solidity ^0.8.26;";

const genImports = (imports: string[]) => {
  const imports_ = new Set(imports);
  const easCommon = ["Attestation"].filter((x) => imports_.has(x));
  const easIEAS = [
    "IEAS",
    "AttestationRequest",
    "AttestationRequestData",
    "RevocationRequest",
    "RevocationRequestData",
  ].filter((x) => imports_.has(x));
  const easISchemaRegistry = ["ISchemaRegistry"].filter((x) => imports_.has(x));

  let out = "";
  if (easCommon.length > 0)
    out += `import {${easCommon.join(", ")}} from "@eas/Common.sol";\n`;
  if (easIEAS.length > 0)
    out += `import {${easIEAS.join(", ")}} from "@eas/IEAS.sol";\n`;
  if (easISchemaRegistry.length > 0)
    out += `import {${easISchemaRegistry.join(
      ", "
    )}} from "@eas/ISchemaRegistry.sol";\n`;
  if (imports_.has("BaseObligation"))
    out += `import {BaseObligation} from "../BaseObligation.sol";\n`;
  if (imports_.has("IArbiter"))
    out += `import {IArbiter} from "../IArbiter.sol";\n`;
  if (imports_.has("ArbiterUtils"))
    out += `import {ArbiterUtils} from "../ArbiterUtils.sol";\n`;

  return out;
};

const genObligation = (
  name: string,
  opts: {
    isArbiter: boolean;
    isRevocable: boolean;
    finalizationTerms: number;
    obligationData: string;
    demandData?: string;
  }
) => {
  const imports = [
    "BaseObligation",
    "IEAS",
    "ISchemaRegistry",
    "Attestation",
    "AttestationRequest",
    "AttestationRequestData",
  ];
  if (opts.isArbiter) imports.push("IArbiter", "ArbiterUtils");

  if (opts.isRevocable)
    imports.push("RevocationRequest", "RevocationRequestData");

  // header
  let out = `${license}\n${pragma}\n\n${genImports(imports)}\n`;
  // contract
  out += `contract ${name} is BaseObligation${
    opts.isArbiter ? ", IArbiter" : ""
  } {\n`;
  if (opts.isArbiter) out += "  using ArbiterUtils for Attestation;\n\n";
  out += `  struct ObligationData {\n    ${opts.obligationData
    .split(",")
    .join(";\n   ")};\n  }\n\n`;
  if (opts.demandData)
    out += `  struct DemandData {\n    ${opts.demandData
      .split(",")
      .join(";\n   ")};\n  }\n\n`;
  out += `  constructor(IEAS _eas, ISchemaRegistry _schemaRegistry) BaseObligation(_eas, _schemaRegistry, "${opts.obligationData}", ${opts.isRevocable}) {}\n\n`;

  // makeStatement
  out +=
    "  function makeStatement(ObligationData calldata data, uint64 expirationTime, bytes32 fulfilling) public returns (bytes32) {\n";
  out += "    // implement custom obligation logic here\n    //...\n";
  out += `    return eas.attest(AttestationRequest({
      schema: ATTESTATION_SCHEMA,
      data: AttestationRequestData({
        recipient: msg.sender,
        expirationTime: expirationTime,
        revocable: ${opts.isRevocable},
        refUID: fulfilling,
        data: abi.encode(data),
        value: 0
      })
    }));\n`;
  out += "  }\n\n"; // end makeStatement
  for (let i = 0; i < opts.finalizationTerms; i++) {
    // finalizationTerm
    out += `  function finalize_${i}(bytes32 statement /*, bytes32 fulfillment, ...*/) public returns (bool) {\n`;
    out +=
      "    // implement custom finalization term (e.g. cancellation or completion) pre-conditions here\n    //...\n";
    out +=
      "    eas.revoke(RevocationRequest({schema: ATTESTATION_SCHEMA, data: RevocationRequestData({uid: obligation, value: 0})}));\n";
    out +=
      "    // implement custom finalization term (e.g. cancellation or completion) post-conditions here\n    //...\n";
    out += "    return true;\n";
    out += "  }\n\n"; // end finalizationTerm
  }
  if (opts.isArbiter)
    out += `  function checkObligation(Attestation memory obligation, bytes memory demand, bytes32 counteroffer) public view override returns (bool) {
    if (!obligation._checkIntrinsic()) return false;

    ObligationData memory data_ = abi.decode(obligation.data, (ObligationData));
    DemandData memory demand_ = abi.decode(demand, (DemandData));

    // implement custom obligation verification logic here
    // we recommend early revert on invalid conditions
    // ...
    return true;
  }\n\n`;
  out += "}"; // end contract
  return out;
};

const genArbiter = (
  name: string,
  opts: {
    baseObligation?: string;
    demandData: string;
  }
) => {
  const imports = ["Attestation", "IArbiter", "ArbiterUtils"];
  // header
  let out = `${license}\n${pragma}\n\n${genImports(imports)}\n`;
  if (opts.baseObligation)
    out += `import {${opts.baseObligation}} from "./path/to/${opts.baseObligation}.sol";\n\n`;
  // contract
  out += `contract ${name} is IArbiter {\n`;
  out += "  using ArbiterUtils for Attestation;\n\n";
  out += `  struct DemandData {\n    ${opts.demandData
    .split(",")
    .join(";\n   ")};\n  }\n\n`;
  out += "  error IncompatibleStatement();\n";

  if (opts.baseObligation) {
    out += `  ${opts.baseObligation} public immutable baseObligation;\n\n`;
    out += `  constructor(${opts.baseObligation} _baseObligation) {\n    baseObligation = _baseObligation;\n  }\n\n`;
  } else {
    out += "  constructor() {}\n\n";
  }

  out += `  function checkObligation(Attestation memory obligation, bytes memory demand, bytes32 counteroffer) public view override returns (bool) {\n`;
  if (opts.baseObligation)
    out +=
      "    if (obligation.schema != baseObligation.ATTESTATION_SCHEMA()) revert IncompatibleStatement();\n";
  out += `    DemandData memory demand_ = abi.decode(demand, (DemandData));
    // implement custom checks here.
    // early revert with custom errors is recommended on failure.
    // remember that utility checks are available in IArbiter${
      opts.baseObligation
        ? ",\n    // and you can also use baseObligation.checkObligation() if appropriate."
        : ""
    }
    // ...
    return true;
  }\n\n`;

  out += "}"; // end contract
  return out;
};

export const gen = {
  obligation: genObligation,
  arbiter: genArbiter,
};
