use std::{any::Any, collections::HashMap, fmt, sync::Arc};

use alloy::primitives::{Address, Bytes};

use crate::clients::arbiters::DecodedDemand;

/// Codec for decoding an arbiter's demand bytes.
///
/// Implementations receive the active registry so composing arbiters can decode
/// nested child demands through the same address-keyed codec set.
pub trait ArbiterDemandCodec: Send + Sync {
    fn decode(
        &self,
        registry: &ArbiterDemandCodecRegistry,
        arbiter: Address,
        demand: Bytes,
    ) -> eyre::Result<DecodedDemand>;
}

pub type ArbiterDemandDecodeFn =
    fn(&ArbiterDemandCodecRegistry, Address, Bytes) -> eyre::Result<DecodedDemand>;

pub struct FnArbiterDemandCodec {
    decode_fn: ArbiterDemandDecodeFn,
}

impl FnArbiterDemandCodec {
    pub fn new(decode_fn: ArbiterDemandDecodeFn) -> Self {
        Self { decode_fn }
    }
}

impl ArbiterDemandCodec for FnArbiterDemandCodec {
    fn decode(
        &self,
        registry: &ArbiterDemandCodecRegistry,
        arbiter: Address,
        demand: Bytes,
    ) -> eyre::Result<DecodedDemand> {
        (self.decode_fn)(registry, arbiter, demand)
    }
}

/// Address-keyed registry of arbiter demand codecs.
#[derive(Clone, Default)]
pub struct ArbiterDemandCodecRegistry {
    decoders: HashMap<Address, Arc<dyn ArbiterDemandCodec>>,
}

impl fmt::Debug for ArbiterDemandCodecRegistry {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("ArbiterDemandCodecRegistry")
            .field("decoders", &self.decoders.keys().collect::<Vec<_>>())
            .finish()
    }
}

impl ArbiterDemandCodecRegistry {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn register<C>(&mut self, arbiter: Address, codec: C) -> &mut Self
    where
        C: ArbiterDemandCodec + 'static,
    {
        if arbiter != Address::ZERO {
            self.decoders.insert(arbiter, Arc::new(codec));
        }
        self
    }

    pub fn register_fn(&mut self, arbiter: Address, decode_fn: ArbiterDemandDecodeFn) -> &mut Self {
        self.register(arbiter, FnArbiterDemandCodec::new(decode_fn))
    }

    pub fn with_codec<C>(mut self, arbiter: Address, codec: C) -> Self
    where
        C: ArbiterDemandCodec + 'static,
    {
        self.register(arbiter, codec);
        self
    }

    pub fn get(&self, arbiter: &Address) -> Option<&Arc<dyn ArbiterDemandCodec>> {
        self.decoders.get(arbiter)
    }

    pub fn decode(&self, arbiter: Address, demand: &Bytes) -> eyre::Result<DecodedDemand> {
        match self.get(&arbiter) {
            Some(codec) => codec.decode(self, arbiter, demand.clone()),
            None => Ok(DecodedDemand::Unknown {
                arbiter,
                raw_data: demand.clone(),
            }),
        }
    }
}

#[derive(Clone)]
pub struct DecodedExtensionDemand {
    pub arbiter: Address,
    pub type_name: &'static str,
    pub raw_data: Bytes,
    data: Arc<dyn Any + Send + Sync>,
}

impl DecodedExtensionDemand {
    pub fn new<T>(arbiter: Address, raw_data: Bytes, data: T) -> Self
    where
        T: Any + Send + Sync,
    {
        Self {
            arbiter,
            type_name: std::any::type_name::<T>(),
            raw_data,
            data: Arc::new(data),
        }
    }

    pub fn downcast_ref<T>(&self) -> Option<&T>
    where
        T: Any,
    {
        self.data.downcast_ref::<T>()
    }
}

impl fmt::Debug for DecodedExtensionDemand {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("DecodedExtensionDemand")
            .field("arbiter", &self.arbiter)
            .field("type_name", &self.type_name)
            .field("raw_data", &self.raw_data)
            .finish_non_exhaustive()
    }
}
