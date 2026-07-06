use alloy::primitives::Address;

pub(crate) fn ensure_deployed_contract(address: Address, label: &str) -> eyre::Result<()> {
    if address == Address::ZERO {
        eyre::bail!("{label} is not deployed for this chain");
    }
    Ok(())
}

pub(crate) fn ensure_packaged_escrow_attester(
    attester: Address,
    packaged_escrow_obligations: &[Address],
) -> eyre::Result<()> {
    if packaged_escrow_obligations
        .iter()
        .filter(|address| **address != Address::ZERO)
        .any(|address| *address == attester)
    {
        return Ok(());
    }

    eyre::bail!(
        "unsupported escrow attester for AtomicPaymentUtils: {attester}. \
         The SDK only settles configured Alkahest escrow contracts by default; \
         use the unchecked method only after independently validating the escrow contract and attestation."
    );
}
