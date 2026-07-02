use alkahest_rs::{
    ArbitersContract, ContractModule as _, extensions::HasArbiters, utils::setup_test_environment,
};
use alloy::primitives::{Bytes, FixedBytes};

use crate::arbiters::common::create_test_attestation;

#[tokio::test]
async fn test_generic_arbiter_check_helper() -> eyre::Result<()> {
    let test = setup_test_environment().await?;
    let attestation = create_test_attestation(None, Some(test.alice.address()));

    let result = test
        .alice_client
        .arbiters()
        .check(
            test.alice_client
                .arbiters()
                .address(ArbitersContract::TrivialArbiter),
            attestation,
            Bytes::from_static(&[0x12, 0x34]),
            FixedBytes::<32>::ZERO,
        )
        .await?;

    assert!(result);
    Ok(())
}
