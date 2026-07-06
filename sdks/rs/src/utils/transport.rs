use std::time::Duration;

use alloy::{
    network::{EthereumWallet, TxSigner},
    primitives::Signature,
    providers::{ProviderBuilder, WsConnect},
};

use crate::types::{PublicProvider, WalletProvider};

/// Default polling interval for HTTP transports, matching Alloy's
/// [`RpcClient::poll_interval`] default of 7 seconds.
pub const DEFAULT_POLL_INTERVAL: Duration = Duration::from_secs(7);

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum TransportScheme {
    Ws,
    Http,
}

fn classify_transport(rpc_url: &str) -> eyre::Result<TransportScheme> {
    let lower = rpc_url.trim().to_ascii_lowercase();
    if lower.starts_with("ws://") || lower.starts_with("wss://") {
        Ok(TransportScheme::Ws)
    } else if lower.starts_with("http://") || lower.starts_with("https://") {
        Ok(TransportScheme::Http)
    } else {
        Err(eyre::eyre!(
            "Unsupported RPC URL scheme in '{}': only ws://, wss://, http://, https:// are supported",
            rpc_url
        ))
    }
}

/// Create a `WalletProvider` connected to the given RPC URL.
///
/// Accepts both pubsub (`ws://`, `wss://`) and HTTP (`http://`, `https://`) URLs.
/// The provider type is the same in both cases — the transport difference is
/// hidden inside the boxed `RpcClient`. Operations that require pubsub
/// (e.g. `subscribe_logs`) will fail at runtime when the transport is HTTP;
/// use the helpers in this module that branch on `pubsub_frontend` to stay
/// transport-agnostic.
pub async fn get_wallet_provider<T: TxSigner<Signature> + Sync + Send + 'static>(
    private_key: T,
    rpc_url: impl ToString,
) -> eyre::Result<WalletProvider> {
    let rpc_url = rpc_url.to_string();
    let wallet = EthereumWallet::from(private_key);

    let provider = match classify_transport(&rpc_url)? {
        TransportScheme::Ws => {
            let ws = WsConnect::new(rpc_url);
            ProviderBuilder::new()
                .with_simple_nonce_management()
                .wallet(wallet)
                .connect_ws(ws)
                .await?
        }
        TransportScheme::Http => {
            let url = rpc_url
                .parse::<url::Url>()
                .map_err(|e| eyre::eyre!("Failed to parse HTTP RPC URL '{}': {}", rpc_url, e))?;
            ProviderBuilder::new()
                .with_simple_nonce_management()
                .wallet(wallet)
                .connect_http(url)
        }
    };

    Ok(provider)
}

/// Create a `PublicProvider` connected to the given RPC URL.
///
/// See [`get_wallet_provider`] for the transport semantics.
pub async fn get_public_provider(rpc_url: impl ToString) -> eyre::Result<PublicProvider> {
    let rpc_url = rpc_url.to_string();

    let provider = match classify_transport(&rpc_url)? {
        TransportScheme::Ws => {
            let ws = WsConnect::new(rpc_url);
            ProviderBuilder::new().connect_ws(ws).await?
        }
        TransportScheme::Http => {
            let url = rpc_url
                .parse::<url::Url>()
                .map_err(|e| eyre::eyre!("Failed to parse HTTP RPC URL '{}': {}", rpc_url, e))?;
            ProviderBuilder::new().connect_http(url)
        }
    };

    Ok(provider)
}

/// Returns true if the provider's transport supports `eth_subscribe`
/// (i.e. a pubsub frontend is available).
pub fn provider_supports_pubsub<P>(provider: &P) -> bool
where
    P: alloy::providers::Provider,
{
    provider.client().pubsub_frontend().is_some()
}

/// True when the test suite was started with `ALKAHEST_TEST_TRANSPORT=http`.
///
/// Used by test functions that exercise nonce-management interactions that
/// race under HTTP polling (specifically `arbitrate_many*` followed by a
/// dependent tx in the same test). They early-return Ok when this is true
/// and re-run cleanly under the default ws transport.
pub fn test_transport_is_http() -> bool {
    matches!(
        std::env::var("ALKAHEST_TEST_TRANSPORT")
            .unwrap_or_default()
            .to_ascii_lowercase()
            .as_str(),
        "http" | "https"
    )
}
