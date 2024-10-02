const license = "// SPDX-License-Identifier: UNLICENSED";
const pragma = "pragma solidity 0.8.26;";

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
    out += `import {${easISchemaRegistry.join(", ")}} from "@eas/ISchemaRegistry.sol";\n`;
  if (imports_.has("IStatement"))
    out += `import {IStatement} from "../IStatement.sol";\n`;
  if (imports_.has("IArbiter"))
    out += `import {IArbiter} from "../IArbiter.sol";\n`;
  return out;
};

const genCheckStatement = () =>
  ` function checkStatement(Attestation memory statement, bytes memory demand, bytes32 counteroffer) public view returns (bool) {
    // implement custom statement verification logic here
    // we recommend early revert on invalid conditions
    // ...
    return true;
  }\n\n`;

const genObligation = (
  name: string,
  opts: {
    isArbiter: boolean;
    isRevocable: boolean;
    finalizationTerms: number;
    statementData: string;
    demandData?: string;
  },
) => {
  const imports = [
    "IStatement",
    "IEAS",
    "ISchemaRegistry",
    "Attestation",
    "AttestationRequest",
    "AttestationRequestData",
  ];
  if (opts.isArbiter) imports.push("IArbiter");
  if (opts.isRevocable)
    imports.push("RevocationRequest", "RevocationRequestData");

  // header
  let out = `${license}\n${pragma}\n\n${genImports(imports)}\n`;
  // contract
  out += `contract ${name} is IStatement${opts.isArbiter ? ", IArbiter" : ""} {\n`;
  out += `  struct StatementData {\n    ${opts.statementData.split(",").join(";\n   ")};\n  }\n\n`;
  out += `  constructor(IEAS _eas, ISchemaRegistry _schemaRegistry) IStatement(_eas, _schemaRegistry, "${opts.statementData}", ${opts.isRevocable}) {}\n\n`;

  // makeStatement
  out +=
    "  function makeStatement(StatementData calldata data, uint64 expirationTime, bytes32 fulfilling) public returns (bytes32) {\n";
  out += "    // implement custom statement logic here\n    //...\n";
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
      "    eas.revoke(RevocationRequest({schema: ATTESTATION_SCHEMA, data: RevocationRequestData({uid: statement, value: 0})}));\n";
    out +=
      "    // implement custom finalization term (e.g. cancellation or completion) post-conditions here\n    //...\n";
    out += "    return true;\n";
    out += "  }\n\n"; // end finalizationTerm
  }
  if (opts.isArbiter) out += genCheckStatement();
  out += "}"; // end contract
  return out;
};

Bun.write(
  "DemoStatement.sol",
  genObligation("DemoObligation", {
    isArbiter: true,
    isRevocable: true,
    finalizationTerms: 2,
    statementData: "address token, uint256 amount",
  }),
);
