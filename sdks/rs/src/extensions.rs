use alloy::primitives::Address;
use alloy::signers::local::PrivateKeySigner;
use std::any::Any;

// Re-export modules from clients
pub use crate::clients::{
    arbiters::ArbitersModule, attestation::AttestationModule,
    commit_reveal_obligation::CommitRevealObligationModule, erc20::Erc20Module,
    erc721::Erc721Module, erc1155::Erc1155Module, hook_based::HookBasedModule,
    native_token::NativeTokenModule, oracle::OracleModule, splitters::SplittersModule,
    string_obligation::StringObligationModule, token_bundle::TokenBundleModule,
};

// Re-export address types for convenience
pub use crate::clients::{
    arbiters::ArbitersAddresses, attestation::AttestationAddresses,
    commit_reveal_obligation::CommitRevealObligationAddresses, erc20::Erc20Addresses,
    erc721::Erc721Addresses, erc1155::Erc1155Addresses, hook_based::HookBasedAddresses,
    native_token::NativeTokenAddresses, oracle::OracleAddresses, splitters::SplittersAddresses,
    string_obligation::StringObligationAddresses, token_bundle::TokenBundleAddresses,
};

use crate::{AlkahestClient, DefaultExtensionConfig};

/// Trait that modules implement to expose their contract addresses
pub trait ContractModule {
    /// The enum type representing available contracts for this module
    type Contract: Copy;

    /// Get the address of a specific contract
    fn address(&self, contract: Self::Contract) -> Address;
}

pub trait AlkahestExtension: Clone + Send + Sync + 'static {
    /// The configuration type for this extension
    type Config: Clone + Send + Sync + 'static;

    /// Initialize the extension with its specific configuration
    fn init(
        signer: PrivateKeySigner,
        providers: crate::types::ProviderContext,
        config: Option<Self::Config>,
    ) -> impl std::future::Future<Output = eyre::Result<Self>> + Send;

    /// Initialize with default configuration (when Config implements Default)
    fn init_default(
        signer: PrivateKeySigner,
        providers: crate::types::ProviderContext,
    ) -> impl std::future::Future<Output = eyre::Result<Self>> + Send
    where
        Self::Config: Default,
    {
        Self::init(signer, providers, Some(Self::Config::default()))
    }

    /// Recursively search for a client by type - this is the main method
    fn find_client<T: Clone + Send + Sync + 'static>(&self) -> Option<&T> {
        // Default implementation - try to downcast self
        let self_any: &dyn Any = self;
        self_any.downcast_ref::<T>()
    }

    /// Get a reference to a client by type, panicking if not found
    fn get_client<T: Clone + Send + Sync + 'static>(&self) -> &T {
        self.find_client::<T>()
            .unwrap_or_else(|| panic!("Client {} not found", std::any::type_name::<T>()))
    }

    /// Check if a client of type T exists
    fn has_client<T: Clone + Send + Sync + 'static>(&self) -> bool {
        self.find_client::<T>().is_some()
    }
}

#[derive(Clone)]
pub struct NoExtension;

impl AlkahestExtension for NoExtension {
    type Config = ();

    async fn init(
        _signer: PrivateKeySigner,
        _providers: crate::types::ProviderContext,
        _config: Option<Self::Config>,
    ) -> eyre::Result<Self> {
        Ok(NoExtension)
    }

    // Uses default implementation for find_client
}

/// Joins two extensions together into a single extension type
#[derive(Clone)]
pub struct JoinExtension<A: AlkahestExtension, B: AlkahestExtension> {
    pub left: A,
    pub right: B,
}

impl<A: AlkahestExtension, B: AlkahestExtension> JoinExtension<A, B> {
    /// Create a new JoinExtension from two already-initialized extensions
    pub fn new(left: A, right: B) -> Self {
        JoinExtension { left, right }
    }
}

impl<A: AlkahestExtension, B: AlkahestExtension> AlkahestExtension for JoinExtension<A, B> {
    // JoinExtension doesn't have its own config - it's created from already-initialized extensions
    type Config = ();

    async fn init(
        _private_key: PrivateKeySigner,
        _providers: crate::types::ProviderContext,
        _config: Option<Self::Config>,
    ) -> eyre::Result<Self> {
        // This method is not meant to be called directly.
        // JoinExtension is created internally by AlkahestClient::with_extension()
        // from already-initialized extensions.
        unreachable!(
            "JoinExtension::init should never be called. Use AlkahestClient::with_extension() instead."
        )
    }

    fn find_client<T: Clone + Send + Sync + 'static>(&self) -> Option<&T> {
        // First try to find in left
        if let Some(client) = self.left.find_client::<T>() {
            return Some(client);
        }
        // Then try to find in right
        self.right.find_client::<T>()
    }
}

/// Base configuration combining all default module configurations
#[derive(Clone)]
pub struct BaseExtensions {
    pub erc20: Erc20Module,
    pub erc721: Erc721Module,
    pub erc1155: Erc1155Module,
    pub native_token: NativeTokenModule,
    pub token_bundle: TokenBundleModule,
    pub hook_based: HookBasedModule,
    pub splitters: SplittersModule,
    pub attestation: AttestationModule,
    pub string_obligation: StringObligationModule,
    pub commit_reveal: CommitRevealObligationModule,
    pub arbiters: ArbitersModule,
    pub oracle: OracleModule,
}

impl AlkahestExtension for BaseExtensions {
    type Config = DefaultExtensionConfig;

    async fn init(
        private_key: PrivateKeySigner,
        providers: crate::types::ProviderContext,
        config: Option<DefaultExtensionConfig>,
    ) -> eyre::Result<Self> {
        // Extract individual configs from the combined config
        let full_config = config.unwrap_or_default();
        let packaged_escrow_obligations = full_config.packaged_escrow_obligations();
        let erc20_config = Some(full_config.erc20_addresses.clone());
        let erc721_config = Some(full_config.erc721_addresses.clone());
        let erc1155_config = Some(full_config.erc1155_addresses.clone());
        let native_token_config = Some(full_config.native_token_addresses.clone());
        let token_bundle_config = Some(full_config.token_bundle_addresses.clone());
        let hook_based_config = Some(full_config.hook_based_addresses.clone());
        let splitters_config = Some(full_config.splitters_addresses.clone());
        let attestation_config = Some(full_config.attestation_addresses.clone());
        let string_obligation_config = Some(full_config.string_obligation_addresses.clone());
        let commit_reveal_config = Some(full_config.commit_reveal_obligation_addresses.clone());
        let arbiters_config = Some(full_config.arbiters_addresses.clone());
        let oracle_config = Some(OracleAddresses {
            eas: full_config.arbiters_addresses.eas.clone(),
            trusted_oracle_arbiter: full_config
                .arbiters_addresses
                .trusted_oracle_arbiter
                .clone(),
        });

        // Initialize each module with its specific configuration
        let mut erc20 =
            Erc20Module::init(private_key.clone(), providers.clone(), erc20_config).await?;
        erc20.set_packaged_escrow_obligations(packaged_escrow_obligations.clone());
        let mut erc721 =
            Erc721Module::init(private_key.clone(), providers.clone(), erc721_config).await?;
        erc721.set_packaged_escrow_obligations(packaged_escrow_obligations.clone());
        let mut erc1155 =
            Erc1155Module::init(private_key.clone(), providers.clone(), erc1155_config).await?;
        erc1155.set_packaged_escrow_obligations(packaged_escrow_obligations.clone());
        let mut native_token =
            NativeTokenModule::init(private_key.clone(), providers.clone(), native_token_config)
                .await?;
        native_token.set_packaged_escrow_obligations(packaged_escrow_obligations.clone());
        let mut token_bundle =
            TokenBundleModule::init(private_key.clone(), providers.clone(), token_bundle_config)
                .await?;
        token_bundle.set_packaged_escrow_obligations(packaged_escrow_obligations);
        let hook_based =
            HookBasedModule::init(private_key.clone(), providers.clone(), hook_based_config)
                .await?;
        let splitters =
            SplittersModule::init(private_key.clone(), providers.clone(), splitters_config).await?;
        let attestation =
            AttestationModule::init(private_key.clone(), providers.clone(), attestation_config)
                .await?;
        let string_obligation = StringObligationModule::init(
            private_key.clone(),
            providers.clone(),
            string_obligation_config,
        )
        .await?;
        let commit_reveal = CommitRevealObligationModule::init(
            private_key.clone(),
            providers.clone(),
            commit_reveal_config,
        )
        .await?;
        let arbiters =
            ArbitersModule::init(private_key.clone(), providers.clone(), arbiters_config).await?;
        let oracle =
            OracleModule::init(private_key.clone(), providers.clone(), oracle_config).await?;

        Ok(BaseExtensions {
            erc20,
            erc721,
            erc1155,
            native_token,
            token_bundle,
            hook_based,
            splitters,
            attestation,
            string_obligation,
            commit_reveal,
            arbiters,
            oracle,
        })
    }

    fn find_client<T: Clone + Send + Sync + 'static>(&self) -> Option<&T> {
        // Try each module in turn
        if let Some(client) = self.erc20.find_client::<T>() {
            return Some(client);
        }
        if let Some(client) = self.erc721.find_client::<T>() {
            return Some(client);
        }
        if let Some(client) = self.erc1155.find_client::<T>() {
            return Some(client);
        }
        if let Some(client) = self.native_token.find_client::<T>() {
            return Some(client);
        }
        if let Some(client) = self.token_bundle.find_client::<T>() {
            return Some(client);
        }
        if let Some(client) = self.hook_based.find_client::<T>() {
            return Some(client);
        }
        if let Some(client) = self.splitters.find_client::<T>() {
            return Some(client);
        }
        if let Some(client) = self.attestation.find_client::<T>() {
            return Some(client);
        }
        if let Some(client) = self.string_obligation.find_client::<T>() {
            return Some(client);
        }
        if let Some(client) = self.commit_reveal.find_client::<T>() {
            return Some(client);
        }
        if let Some(client) = self.arbiters.find_client::<T>() {
            return Some(client);
        }
        self.oracle.find_client::<T>()
    }
}

// Has* traits for accessing specific modules

pub trait HasErc20 {
    fn erc20(&self) -> &Erc20Module;
}

pub trait HasErc721 {
    fn erc721(&self) -> &Erc721Module;
}

pub trait HasErc1155 {
    fn erc1155(&self) -> &Erc1155Module;
}

pub trait HasNativeToken {
    fn native_token(&self) -> &NativeTokenModule;
}

pub trait HasTokenBundle {
    fn token_bundle(&self) -> &TokenBundleModule;
}

pub trait HasHookBased {
    fn hook_based(&self) -> &HookBasedModule;
}

pub trait HasSplitters {
    fn splitters(&self) -> &SplittersModule;
}

pub trait HasAttestation {
    fn attestation(&self) -> &AttestationModule;
}

pub trait HasStringObligation {
    fn string_obligation(&self) -> &StringObligationModule;
}

pub trait HasCommitReveal {
    fn commit_reveal(&self) -> &CommitRevealObligationModule;
}

pub trait HasArbiters {
    fn arbiters(&self) -> &ArbitersModule;
}

pub trait HasOracle {
    fn oracle(&self) -> &OracleModule;
}

// Implementations for BaseExtensions
impl HasErc20 for BaseExtensions {
    fn erc20(&self) -> &Erc20Module {
        &self.erc20
    }
}

impl HasErc721 for BaseExtensions {
    fn erc721(&self) -> &Erc721Module {
        &self.erc721
    }
}

impl HasErc1155 for BaseExtensions {
    fn erc1155(&self) -> &Erc1155Module {
        &self.erc1155
    }
}

impl HasNativeToken for BaseExtensions {
    fn native_token(&self) -> &NativeTokenModule {
        &self.native_token
    }
}

impl HasTokenBundle for BaseExtensions {
    fn token_bundle(&self) -> &TokenBundleModule {
        &self.token_bundle
    }
}

impl HasHookBased for BaseExtensions {
    fn hook_based(&self) -> &HookBasedModule {
        &self.hook_based
    }
}

impl HasSplitters for BaseExtensions {
    fn splitters(&self) -> &SplittersModule {
        &self.splitters
    }
}

impl HasAttestation for BaseExtensions {
    fn attestation(&self) -> &AttestationModule {
        &self.attestation
    }
}

impl HasStringObligation for BaseExtensions {
    fn string_obligation(&self) -> &StringObligationModule {
        &self.string_obligation
    }
}

impl HasCommitReveal for BaseExtensions {
    fn commit_reveal(&self) -> &CommitRevealObligationModule {
        &self.commit_reveal
    }
}

impl HasArbiters for BaseExtensions {
    fn arbiters(&self) -> &ArbitersModule {
        &self.arbiters
    }
}

impl HasOracle for BaseExtensions {
    fn oracle(&self) -> &OracleModule {
        &self.oracle
    }
}

// Implementations for individual modules
impl HasErc20 for Erc20Module {
    fn erc20(&self) -> &Erc20Module {
        self
    }
}

impl HasErc721 for Erc721Module {
    fn erc721(&self) -> &Erc721Module {
        self
    }
}

impl HasErc1155 for Erc1155Module {
    fn erc1155(&self) -> &Erc1155Module {
        self
    }
}

impl HasTokenBundle for TokenBundleModule {
    fn token_bundle(&self) -> &TokenBundleModule {
        self
    }
}

impl HasHookBased for HookBasedModule {
    fn hook_based(&self) -> &HookBasedModule {
        self
    }
}

impl HasSplitters for SplittersModule {
    fn splitters(&self) -> &SplittersModule {
        self
    }
}

impl HasAttestation for AttestationModule {
    fn attestation(&self) -> &AttestationModule {
        self
    }
}

impl HasStringObligation for StringObligationModule {
    fn string_obligation(&self) -> &StringObligationModule {
        self
    }
}

impl HasCommitReveal for CommitRevealObligationModule {
    fn commit_reveal(&self) -> &CommitRevealObligationModule {
        self
    }
}

impl HasArbiters for ArbitersModule {
    fn arbiters(&self) -> &ArbitersModule {
        self
    }
}

impl HasOracle for OracleModule {
    fn oracle(&self) -> &OracleModule {
        self
    }
}

// Implementations for JoinExtension - delegate to find_client
impl<A: AlkahestExtension, B: AlkahestExtension> HasErc20 for JoinExtension<A, B>
where
    Self: AlkahestExtension,
{
    fn erc20(&self) -> &Erc20Module {
        self.find_client::<Erc20Module>()
            .expect("ERC20 module not found in JoinExtension")
    }
}

impl<A: AlkahestExtension, B: AlkahestExtension> HasErc721 for JoinExtension<A, B>
where
    Self: AlkahestExtension,
{
    fn erc721(&self) -> &Erc721Module {
        self.find_client::<Erc721Module>()
            .expect("ERC721 module not found in JoinExtension")
    }
}

impl<A: AlkahestExtension, B: AlkahestExtension> HasErc1155 for JoinExtension<A, B>
where
    Self: AlkahestExtension,
{
    fn erc1155(&self) -> &Erc1155Module {
        self.find_client::<Erc1155Module>()
            .expect("ERC1155 module not found in JoinExtension")
    }
}

impl<A: AlkahestExtension, B: AlkahestExtension> HasNativeToken for JoinExtension<A, B>
where
    Self: AlkahestExtension,
{
    fn native_token(&self) -> &NativeTokenModule {
        self.find_client::<NativeTokenModule>()
            .expect("NativeToken module not found in JoinExtension")
    }
}

impl<A: AlkahestExtension, B: AlkahestExtension> HasTokenBundle for JoinExtension<A, B>
where
    Self: AlkahestExtension,
{
    fn token_bundle(&self) -> &TokenBundleModule {
        self.find_client::<TokenBundleModule>()
            .expect("TokenBundle module not found in JoinExtension")
    }
}

impl<A: AlkahestExtension, B: AlkahestExtension> HasHookBased for JoinExtension<A, B>
where
    Self: AlkahestExtension,
{
    fn hook_based(&self) -> &HookBasedModule {
        self.find_client::<HookBasedModule>()
            .expect("HookBased module not found in JoinExtension")
    }
}

impl<A: AlkahestExtension, B: AlkahestExtension> HasSplitters for JoinExtension<A, B>
where
    Self: AlkahestExtension,
{
    fn splitters(&self) -> &SplittersModule {
        self.find_client::<SplittersModule>()
            .expect("Splitters module not found in JoinExtension")
    }
}

impl<A: AlkahestExtension, B: AlkahestExtension> HasAttestation for JoinExtension<A, B>
where
    Self: AlkahestExtension,
{
    fn attestation(&self) -> &AttestationModule {
        self.find_client::<AttestationModule>()
            .expect("Attestation module not found in JoinExtension")
    }
}

impl<A: AlkahestExtension, B: AlkahestExtension> HasStringObligation for JoinExtension<A, B>
where
    Self: AlkahestExtension,
{
    fn string_obligation(&self) -> &StringObligationModule {
        self.find_client::<StringObligationModule>()
            .expect("StringObligation module not found in JoinExtension")
    }
}

impl<A: AlkahestExtension, B: AlkahestExtension> HasCommitReveal for JoinExtension<A, B>
where
    Self: AlkahestExtension,
{
    fn commit_reveal(&self) -> &CommitRevealObligationModule {
        self.find_client::<CommitRevealObligationModule>()
            .expect("CommitRevealObligation module not found in JoinExtension")
    }
}

impl<A: AlkahestExtension, B: AlkahestExtension> HasArbiters for JoinExtension<A, B>
where
    Self: AlkahestExtension,
{
    fn arbiters(&self) -> &ArbitersModule {
        self.find_client::<ArbitersModule>()
            .expect("Arbiters module not found in JoinExtension")
    }
}

impl<A: AlkahestExtension, B: AlkahestExtension> HasOracle for JoinExtension<A, B>
where
    Self: AlkahestExtension,
{
    fn oracle(&self) -> &OracleModule {
        self.find_client::<OracleModule>()
            .expect("Oracle module not found in JoinExtension")
    }
}

// Implementations for AlkahestClient - delegate to extensions
impl<Ext: AlkahestExtension + HasErc20> HasErc20 for AlkahestClient<Ext> {
    fn erc20(&self) -> &Erc20Module {
        self.extensions.erc20()
    }
}

impl<Ext: AlkahestExtension + HasErc721> HasErc721 for AlkahestClient<Ext> {
    fn erc721(&self) -> &Erc721Module {
        self.extensions.erc721()
    }
}

impl<Ext: AlkahestExtension + HasErc1155> HasErc1155 for AlkahestClient<Ext> {
    fn erc1155(&self) -> &Erc1155Module {
        self.extensions.erc1155()
    }
}

impl<Ext: AlkahestExtension + HasNativeToken> HasNativeToken for AlkahestClient<Ext> {
    fn native_token(&self) -> &NativeTokenModule {
        self.extensions.native_token()
    }
}

impl<Ext: AlkahestExtension + HasTokenBundle> HasTokenBundle for AlkahestClient<Ext> {
    fn token_bundle(&self) -> &TokenBundleModule {
        self.extensions.token_bundle()
    }
}

impl<Ext: AlkahestExtension + HasHookBased> HasHookBased for AlkahestClient<Ext> {
    fn hook_based(&self) -> &HookBasedModule {
        self.extensions.hook_based()
    }
}

impl<Ext: AlkahestExtension + HasSplitters> HasSplitters for AlkahestClient<Ext> {
    fn splitters(&self) -> &SplittersModule {
        self.extensions.splitters()
    }
}

impl<Ext: AlkahestExtension + HasAttestation> HasAttestation for AlkahestClient<Ext> {
    fn attestation(&self) -> &AttestationModule {
        self.extensions.attestation()
    }
}

impl<Ext: AlkahestExtension + HasStringObligation> HasStringObligation for AlkahestClient<Ext> {
    fn string_obligation(&self) -> &StringObligationModule {
        self.extensions.string_obligation()
    }
}

impl<Ext: AlkahestExtension + HasCommitReveal> HasCommitReveal for AlkahestClient<Ext> {
    fn commit_reveal(&self) -> &CommitRevealObligationModule {
        self.extensions.commit_reveal()
    }
}

impl<Ext: AlkahestExtension + HasArbiters> HasArbiters for AlkahestClient<Ext> {
    fn arbiters(&self) -> &ArbitersModule {
        self.extensions.arbiters()
    }
}

impl<Ext: AlkahestExtension + HasOracle> HasOracle for AlkahestClient<Ext> {
    fn oracle(&self) -> &OracleModule {
        self.extensions.oracle()
    }
}
