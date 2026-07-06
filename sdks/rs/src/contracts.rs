use alloy::sol;

// Core interfaces
sol!(
    #[allow(missing_docs)]
    #[sol(rpc)]
    #[derive(Debug)]
    IEAS,
    "src/contracts/IEAS.json"
);

sol!(
    #[allow(missing_docs)]
    #[sol(rpc)]
    #[derive(Debug)]
    ISchemaRegistry,
    "src/contracts/ISchemaRegistry.json"
);

sol!(
    #[allow(missing_docs)]
    #[sol(rpc)]
    #[derive(Debug)]
    IEscrow,
    "src/contracts/IEscrow.json"
);

sol!(
    #[allow(missing_docs)]
    #[sol(rpc)]
    #[derive(Debug)]
    IERC20,
    "src/contracts/IERC20.json"
);

sol!(
    #[allow(missing_docs)]
    #[sol(rpc)]
    #[derive(Debug)]
    IERC721,
    "src/contracts/IERC721.json"
);

sol!(
    #[allow(missing_docs)]
    #[sol(rpc)]
    #[derive(Debug)]
    IERC1155,
    "src/contracts/IERC1155.json"
);

sol!(
    #[allow(missing_docs)]
    #[sol(rpc)]
    #[derive(Debug)]
    ERC20Permit,
    "src/contracts/ERC20Permit.json"
);

// Arbiters module - mirrors contracts/src/arbiters/
pub mod arbiters {
    use alloy::sol;

    // Root-level arbiters
    sol!(
        #[allow(missing_docs)]
        #[sol(rpc)]
        #[derive(Debug)]
        TrivialArbiter,
        "src/contracts/arbiters/TrivialArbiter.json"
    );

    sol!(
        #[allow(missing_docs)]
        #[sol(rpc)]
        #[derive(Debug)]
        IntrinsicsArbiter,
        "src/contracts/arbiters/IntrinsicsArbiter.json"
    );

    sol!(
        #[allow(missing_docs)]
        #[sol(rpc)]
        #[derive(Debug)]
        ReferencesEscrowArbiter,
        "src/contracts/arbiters/ReferencesEscrowArbiter.json"
    );

    sol!(
        #[allow(missing_docs)]
        #[sol(rpc)]
        #[derive(Debug)]
        ERC8004Arbiter,
        "src/contracts/arbiters/ERC8004Arbiter.json"
    );

    // trusted-oracle submodule
    pub mod trusted_oracle {
        use alloy::sol;

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            TrustedOracleArbiter,
            "src/contracts/arbiters/trusted-oracle/TrustedOracleArbiter.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            CommitmentTrustedOracleArbiter,
            "src/contracts/arbiters/trusted-oracle/CommitmentTrustedOracleArbiter.json"
        );
    }

    pub use trusted_oracle::{CommitmentTrustedOracleArbiter, TrustedOracleArbiter};

    // attestation-properties submodule
    pub mod attestation_properties {
        use alloy::sol;

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            AttesterArbiter,
            "src/contracts/arbiters/attestation-properties/AttesterArbiter.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            ExpirationTimeAfterArbiter,
            "src/contracts/arbiters/attestation-properties/ExpirationTimeAfterArbiter.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            ExpirationTimeBeforeArbiter,
            "src/contracts/arbiters/attestation-properties/ExpirationTimeBeforeArbiter.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            ExpirationTimeEqualArbiter,
            "src/contracts/arbiters/attestation-properties/ExpirationTimeEqualArbiter.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            RecipientArbiter,
            "src/contracts/arbiters/attestation-properties/RecipientArbiter.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            RefUidArbiter,
            "src/contracts/arbiters/attestation-properties/RefUidArbiter.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            RevocableArbiter,
            "src/contracts/arbiters/attestation-properties/RevocableArbiter.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            SchemaArbiter,
            "src/contracts/arbiters/attestation-properties/SchemaArbiter.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            TimeAfterArbiter,
            "src/contracts/arbiters/attestation-properties/TimeAfterArbiter.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            TimeBeforeArbiter,
            "src/contracts/arbiters/attestation-properties/TimeBeforeArbiter.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            TimeEqualArbiter,
            "src/contracts/arbiters/attestation-properties/TimeEqualArbiter.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            UidArbiter,
            "src/contracts/arbiters/attestation-properties/UidArbiter.json"
        );
    }

    // confirmation submodule
    pub mod confirmation {
        use alloy::sol;

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            ExclusiveRevocableConfirmationArbiter,
            "src/contracts/arbiters/confirmation/ExclusiveRevocableConfirmationArbiter.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            ExclusiveUnrevocableConfirmationArbiter,
            "src/contracts/arbiters/confirmation/ExclusiveUnrevocableConfirmationArbiter.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            NonexclusiveRevocableConfirmationArbiter,
            "src/contracts/arbiters/confirmation/NonexclusiveRevocableConfirmationArbiter.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            NonexclusiveUnrevocableConfirmationArbiter,
            "src/contracts/arbiters/confirmation/NonexclusiveUnrevocableConfirmationArbiter.json"
        );
    }

    // logical submodule
    pub mod logical {
        use alloy::sol;

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            AllArbiter,
            "src/contracts/arbiters/logical/AllArbiter.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            AnyArbiter,
            "src/contracts/arbiters/logical/AnyArbiter.json"
        );
    }
}

// Obligations module - mirrors contracts/src/obligations/
pub mod obligations {
    // Payment obligations submodule
    pub mod payment {
        use alloy::sol;

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            ERC20PaymentObligation,
            "src/contracts/obligations/payment/ERC20PaymentObligation.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            ERC721PaymentObligation,
            "src/contracts/obligations/payment/ERC721PaymentObligation.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            ERC1155PaymentObligation,
            "src/contracts/obligations/payment/ERC1155PaymentObligation.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            TokenBundlePaymentObligation,
            "src/contracts/obligations/payment/TokenBundlePaymentObligation.json"
        );

        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            NativeTokenPaymentObligation,
            "src/contracts/obligations/payment/NativeTokenPaymentObligation.json"
        );
    }

    // Re-export payment obligations for convenience
    pub use payment::ERC20PaymentObligation;
    pub use payment::ERC721PaymentObligation;
    pub use payment::ERC1155PaymentObligation;
    pub use payment::NativeTokenPaymentObligation;
    pub use payment::TokenBundlePaymentObligation;

    use alloy::sol;
    sol!(
        #[allow(missing_docs)]
        #[sol(rpc)]
        #[derive(Debug)]
        StringObligation,
        "src/contracts/obligations/StringObligation.json"
    );

    sol!(
        #[allow(missing_docs)]
        #[sol(rpc)]
        #[derive(Debug)]
        CommitRevealObligation,
        "src/contracts/obligations/CommitRevealObligation.json"
    );

    // Escrow obligations submodule
    pub mod escrow {
        pub mod default_escrow {
            use alloy::sol;

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                ERC20EscrowObligation,
                "src/contracts/obligations/escrow/default/ERC20EscrowObligation.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                ERC721EscrowObligation,
                "src/contracts/obligations/escrow/default/ERC721EscrowObligation.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                ERC1155EscrowObligation,
                "src/contracts/obligations/escrow/default/ERC1155EscrowObligation.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                TokenBundleEscrowObligation,
                "src/contracts/obligations/escrow/default/TokenBundleEscrowObligation.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                NativeTokenEscrowObligation,
                "src/contracts/obligations/escrow/default/NativeTokenEscrowObligation.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                AttestationEscrowObligation,
                "src/contracts/obligations/escrow/default/AttestationEscrowObligation.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                AttestationReferenceEscrowObligation,
                "src/contracts/obligations/escrow/default/AttestationReferenceEscrowObligation.json"
            );
        }

        pub mod unconditional {
            use alloy::sol;

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                UnconditionalERC20EscrowObligation,
                "src/contracts/obligations/escrow/unconditional/UnconditionalERC20EscrowObligation.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                UnconditionalERC721EscrowObligation,
                "src/contracts/obligations/escrow/unconditional/UnconditionalERC721EscrowObligation.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                UnconditionalERC1155EscrowObligation,
                "src/contracts/obligations/escrow/unconditional/UnconditionalERC1155EscrowObligation.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                UnconditionalTokenBundleEscrowObligation,
                "src/contracts/obligations/escrow/unconditional/UnconditionalTokenBundleEscrowObligation.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                UnconditionalNativeTokenEscrowObligation,
                "src/contracts/obligations/escrow/unconditional/UnconditionalNativeTokenEscrowObligation.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                UnconditionalAttestationEscrowObligation,
                "src/contracts/obligations/escrow/unconditional/UnconditionalAttestationEscrowObligation.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                UnconditionalAttestationReferenceEscrowObligation,
                "src/contracts/obligations/escrow/unconditional/UnconditionalAttestationReferenceEscrowObligation.json"
            );
        }

        pub mod hook_based {
            use alloy::sol;

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                HookEscrowObligation,
                "src/contracts/obligations/escrow/hook-based/HookEscrowObligation.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                HooksEscrowObligation,
                "src/contracts/obligations/escrow/hook-based/HooksEscrowObligation.json"
            );

            pub mod hooks {
                use alloy::sol;

                sol!(
                    #[allow(missing_docs)]
                    #[sol(rpc)]
                    #[derive(Debug)]
                    ERC20EscrowHook,
                    "src/contracts/obligations/escrow/hook-based/hooks/ERC20EscrowHook.json"
                );

                sol!(
                    #[allow(missing_docs)]
                    #[sol(rpc)]
                    #[derive(Debug)]
                    ERC721EscrowHook,
                    "src/contracts/obligations/escrow/hook-based/hooks/ERC721EscrowHook.json"
                );

                sol!(
                    #[allow(missing_docs)]
                    #[sol(rpc)]
                    #[derive(Debug)]
                    ERC1155EscrowHook,
                    "src/contracts/obligations/escrow/hook-based/hooks/ERC1155EscrowHook.json"
                );

                sol!(
                    #[allow(missing_docs)]
                    #[sol(rpc)]
                    #[derive(Debug)]
                    NativeTokenEscrowHook,
                    "src/contracts/obligations/escrow/hook-based/hooks/NativeTokenEscrowHook.json"
                );

                sol!(
                    #[allow(missing_docs)]
                    #[sol(rpc)]
                    #[derive(Debug)]
                    AttestationEscrowHook,
                    "src/contracts/obligations/escrow/hook-based/hooks/AttestationEscrowHook.json"
                );

                sol!(
                    #[allow(missing_docs)]
                    #[sol(rpc)]
                    #[derive(Debug)]
                    AttestationReferenceEscrowHook,
                    "src/contracts/obligations/escrow/hook-based/hooks/AttestationReferenceEscrowHook.json"
                );
            }
        }
    }
}

// Utils module - mirrors contracts/src/utils/
pub mod utils {
    pub mod atomic_payment {
        use alloy::sol;
        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            AtomicPaymentUtils,
            "src/contracts/utils/AtomicPaymentUtils.json"
        );
    }

    pub mod attestation {
        use alloy::sol;
        sol!(
            #[allow(missing_docs)]
            #[sol(rpc)]
            #[derive(Debug)]
            AtomicAttestationUtils,
            "src/contracts/utils/AtomicAttestationUtils.json"
        );
    }

    pub mod splitters {
        pub mod default {
            use alloy::sol;

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                ERC20Splitter,
                "src/contracts/utils/splitters/default/ERC20Splitter.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                ERC1155Splitter,
                "src/contracts/utils/splitters/default/ERC1155Splitter.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                NativeTokenSplitter,
                "src/contracts/utils/splitters/default/NativeTokenSplitter.json"
            );

            pub mod token_bundle {
                use alloy::sol;

                sol!(
                    #[allow(missing_docs)]
                    #[sol(rpc)]
                    #[derive(Debug)]
                    TokenBundleSplitter,
                    "src/contracts/utils/splitters/default/TokenBundleSplitter.json"
                );
            }

            pub mod token_bundle_unvalidated {
                use alloy::sol;

                sol!(
                    #[allow(missing_docs)]
                    #[sol(rpc)]
                    #[derive(Debug)]
                    TokenBundleSplitterUnvalidated,
                    "src/contracts/utils/splitters/default/TokenBundleSplitterUnvalidated.json"
                );
            }
        }

        pub mod commitment {
            use alloy::sol;

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                CommitmentERC20Splitter,
                "src/contracts/utils/splitters/commitment/CommitmentERC20Splitter.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                CommitmentERC1155Splitter,
                "src/contracts/utils/splitters/commitment/CommitmentERC1155Splitter.json"
            );

            sol!(
                #[allow(missing_docs)]
                #[sol(rpc)]
                #[derive(Debug)]
                CommitmentNativeTokenSplitter,
                "src/contracts/utils/splitters/commitment/CommitmentNativeTokenSplitter.json"
            );

            pub mod token_bundle {
                use alloy::sol;

                sol!(
                    #[allow(missing_docs)]
                    #[sol(rpc)]
                    #[derive(Debug)]
                    CommitmentTokenBundleSplitter,
                    "src/contracts/utils/splitters/commitment/CommitmentTokenBundleSplitter.json"
                );
            }

            pub mod token_bundle_unvalidated {
                use alloy::sol;

                sol!(
                    #[allow(missing_docs)]
                    #[sol(rpc)]
                    #[derive(Debug)]
                    CommitmentTokenBundleSplitterUnvalidated,
                    "src/contracts/utils/splitters/commitment/CommitmentTokenBundleSplitterUnvalidated.json"
                );
            }
        }

        pub use default::{
            ERC20Splitter, ERC1155Splitter, NativeTokenSplitter, token_bundle,
            token_bundle_unvalidated,
        };
    }

    // Re-export the main contract types for convenience
    pub use atomic_payment::AtomicPaymentUtils;
    pub use attestation::AtomicAttestationUtils;
}
