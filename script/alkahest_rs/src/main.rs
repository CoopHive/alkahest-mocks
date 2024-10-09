fn main() {
    println!(
        "{}",
        gen_obligation(GenObligationOpts {
            name: "PaymentObligation".to_string(),
            is_arbiter: false,
            is_revocable: false,
            finalization_terms: 0,
            statement_data: "address token, uint256 amount".to_string(),
            demand_data: "".to_string(),
        })
    );
}

const LICENSE: &str = "// SPDX-License-Identifier: UNLICENSED";
const PRAGMA: &str = "pragma solidity 0.8.26;";

fn gen_imports(imports: impl IntoIterator<Item = impl ToString>) -> String {
    let imports = imports
        .into_iter()
        .map(|x| x.to_string())
        .collect::<Vec<_>>();

    let mut out = "".to_string();

    macro_rules! add_imports {
        ($items:expr, $b:expr) => {
            let to_import = $items
                .iter()
                .filter(|x| imports.contains(&x.to_string()))
                .map(|x| *x)
                .collect::<Vec<_>>();
            if !to_import.is_empty() {
                out += &format!("import {{{}}} from \"{}\";\n", to_import.join(", "), $b);
            }
        };
    }

    add_imports!(["Attestation"], "@eas/Common.sol");
    add_imports!(
        [
            "IEAS",
            "AttestationRequest",
            "AttestationRequestData",
            "RevocationRequest",
            "RevocationRequestData",
        ],
        "@eas/IEAS.sol"
    );
    add_imports!(["ISchemaRegistry"], "@eas/ISchemaRegistry.sol");
    add_imports!(["BaseStatement"], "../BaseStatement.sol");
    add_imports!(["IArbiter"], "../IArbiter.sol");
    add_imports!(["ArbiterUtils"], "../ArbiterUtils.sol");

    out
}

struct GenObligationOpts {
    name: String,
    is_arbiter: bool,
    is_revocable: bool,
    finalization_terms: usize,
    statement_data: String,
    demand_data: String,
}

fn gen_obligation(opts: GenObligationOpts) -> String {
    let mut imports = vec![
        "BaseStatement",
        "IEAS",
        "ISchemaRegistry",
        "Attestation",
        "AttestationRequest",
        "AttestationRequestData",
    ];
    if opts.is_arbiter {
        imports.push("IArbiter");
        imports.push("ArbiterUtils");
    }
    if opts.is_revocable {
        imports.push("RevocationRequest");
        imports.push("RevocationRequestData");
    }

    let mut out = format!("{}\n{}\n\n{}\n", LICENSE, PRAGMA, gen_imports(imports));
    out += &format!(
        "contract {} is BaseStatement{} {{\n",
        opts.name,
        if opts.is_arbiter { ", IArbiter" } else { "" }
    );
    if opts.is_arbiter {
        out += "  using ArbiterUtils for Attestation;\n\n";
    }
    out += &format!(
        "  struct StatementData {{\n    {};\n  }}\n\n",
        opts.statement_data
            .split(",")
            .collect::<Vec<_>>()
            .join(";\n   ")
    );
    if !opts.demand_data.is_empty() {
        out += &format!(
            "  struct DemandData {{\n    {};\n  }}\n\n",
            opts.demand_data
                .split(",")
                .collect::<Vec<_>>()
                .join(";\n   ")
        );
    }
    out += &format!(
        "  constructor(IEAS _eas, ISchemaRegistry _schemaRegistry) BaseStatement(_eas, _schemaRegistry, \"{}\", {}) {{}}\n\n",
        opts.statement_data,
        if opts.is_revocable { "true" } else { "false" },
    );

    // makeStatement
    out += concat!(
            "  function makeStatement(StatementData calldata data, uint64 expirationTime, bytes32 fulfilling) public returns (bytes32) {\n",
            "    // implement custom statement logic here\n    //...\n",
            "    return eas.attest(AttestationRequest({\n",
            "      schema: ATTESTATION_SCHEMA,\n",
            "      data: AttestationRequestData({\n",
            "        recipient: msg.sender,\n",
            "        expirationTime: expirationTime,\n",
    );
    out += &format!(
        "        revocable: {},\n",
        if opts.is_revocable { "true" } else { "false" }
    );
    out += concat!(
        "        refUID: fulfilling,\n",
        "        data: abi.encode(data),\n",
        "        value: 0\n",
        "      })\n",
        "    }));\n",
        "  }\n\n"
    );
    for i in 0..opts.finalization_terms {
        // finalizationTerm
        out += &format!("  function finalize_{}(bytes32 statement /*, bytes32 fulfillment, ...*/) public returns (bool) {{\n", i);
        out += concat!(
                "    // implement custom finalization term (e.g. cancellation or completion) pre-conditions here\n",
                "    //...\n",
                "    eas.revoke(RevocationRequest({\n",
                "      schema: ATTESTATION_SCHEMA,\n",
                "      data: RevocationRequestData({\n",
                "        uid: statement,\n",
                "        value: 0\n",
                "      })\n",
                "    }));\n",
                "    // implement custom finalization term (e.g. cancellation or completion) post-conditions here\n",
                "    //...\n",
                "    return true;\n",
                "  }\n\n"
            );
    }

    out += "}";
    out
}
