mod codegen;

fn main() {
    println!(
        "{}",
        codegen::gen_obligation(codegen::GenObligationOpts {
            name: "PaymentObligation".to_string(),
            is_arbiter: true,
            is_revocable: true,
            finalization_terms: 2,
            obligation_data: "address token, uint256 amount".to_string(),
            demand_data: "".to_string(),
        })
    );
}
