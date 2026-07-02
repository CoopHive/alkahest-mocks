use std::time::Duration;

use crate::{types::PublicProvider, utils::transport::provider_supports_pubsub};

/// Wait for the first log matching `filter`, returning historical matches first
/// or otherwise tailing the live event stream.
///
/// This helper unifies the WS/HTTP code paths:
/// - On pubsub transports, it uses `eth_subscribe` (low-latency push).
/// - On HTTP transports, it uses `eth_getFilterChanges` polling with the
///   provided `poll_interval` (push semantics emulated via polling).
///
/// The resulting `Log` is the raw `alloy::rpc::types::Log` — callers should
/// `log_decode::<EventType>()` it.
pub async fn wait_for_first_log(
    provider: &PublicProvider,
    filter: &alloy::rpc::types::Filter,
    poll_interval: Duration,
) -> eyre::Result<alloy::rpc::types::Log> {
    use alloy::providers::Provider as _;
    use futures::StreamExt as _;

    // Historical: try get_logs first to short-circuit if the event already happened.
    let logs = provider.get_logs(filter).await?;
    if let Some(log) = logs.into_iter().next() {
        return Ok(log);
    }

    // Live: branch on transport capability.
    if provider_supports_pubsub(provider) {
        let sub = provider.subscribe_logs(filter).await?;
        let mut stream = sub.into_stream();
        if let Some(log) = stream.next().await {
            return Ok(log);
        }
    } else {
        let poller = provider
            .watch_logs(filter)
            .await?
            .with_poll_interval(poll_interval);
        // FilterPollerBuilder::into_stream yields Vec<Log> per poll cycle;
        // flatten into a single Log stream.
        let mut stream = poller.into_stream().flat_map(futures::stream::iter);
        if let Some(log) = stream.next().await {
            return Ok(log);
        }
    }

    Err(eyre::eyre!(
        "Stream ended before any matching log was received"
    ))
}
