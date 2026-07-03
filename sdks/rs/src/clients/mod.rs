pub mod arbiters;
pub mod obligations;
pub mod splitters;

// Re-export oracle module from arbiters for backwards compatibility
pub mod oracle {
    pub use super::arbiters::{
        ArbitrateManyResult, ArbitrationMode, AttestationWithDemand, CommitmentArbitrateManyResult,
        CommitmentArbitrationRequest, CommitmentDecision, Decision, OracleAddresses, OracleModule,
        TrustedOracleAddresses, TrustedOracleModule,
    };
}

// Re-export obligation modules for backwards compatibility
pub use obligations::attestation;
pub use obligations::commit_reveal;
pub use obligations::commit_reveal as commit_reveal_obligation;
pub use obligations::erc20;
pub use obligations::erc721;
pub use obligations::erc1155;
pub use obligations::hook_based;
pub use obligations::native_token;
pub use obligations::string;
pub use obligations::string as string_obligation;
pub use obligations::token_bundle;
