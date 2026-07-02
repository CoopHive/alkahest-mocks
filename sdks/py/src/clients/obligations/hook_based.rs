//! Hook-based escrow helper client.
//!
//! Mirrors the Rust SDK hook-based escrow helpers for address access and
//! ABI codecs.
//!
//! Security note: the underlying hook-based escrow contracts and hooks have not
//! been included in professional manual audits and have only been reviewed by
//! automated audit tooling so far.

use alkahest_rs::{
    clients::obligations::hook_based::HookBasedContract, contracts, extensions::HookBasedModule,
};
use alloy::{
    primitives::{Address, Bytes, FixedBytes, U256},
    sol_types::SolValue,
};
use pyo3::{pyclass, pymethods, PyResult};

use crate::{
    error_handling::{map_eyre_to_pyerr, map_parse_to_pyerr, map_sol_decode_to_pyerr},
    types::{AttestationRequest, AttestationRequestData},
};

#[pyclass]
#[derive(Clone)]
pub struct HookBasedClient {
    inner: HookBasedModule,
}

impl HookBasedClient {
    pub fn new(inner: HookBasedModule) -> Self {
        Self { inner }
    }
}

#[pymethods]
impl HookBasedClient {
    /// Return a hook-based escrow contract or hook address by name.
    pub fn address(&self, contract: String) -> PyResult<String> {
        let address = match contract.as_str() {
            "hook_escrow_obligation" => self.inner.addresses.hook_escrow_obligation,
            "hooks_escrow_obligation" => self.inner.addresses.hooks_escrow_obligation,
            "erc20_escrow_hook" => self.inner.addresses.erc20_escrow_hook,
            "erc721_escrow_hook" => self.inner.addresses.erc721_escrow_hook,
            "erc1155_escrow_hook" => self.inner.addresses.erc1155_escrow_hook,
            "native_token_escrow_hook" => self.inner.addresses.native_token_escrow_hook,
            "attestation_escrow_hook" => self.inner.addresses.attestation_escrow_hook,
            "attestation_reference_escrow_hook" => {
                self.inner.addresses.attestation_reference_escrow_hook
            }
            _ => {
                return Err(pyo3::exceptions::PyValueError::new_err(
                    "unknown hook-based contract",
                ))
            }
        };
        Ok(address.to_string())
    }

    pub fn encode_hook_escrow(&self, data: &PyHookEscrowObligationData) -> PyResult<Vec<u8>> {
        PyHookEscrowObligationData::encode(data)
    }

    pub fn decode_hook_escrow(&self, data: Vec<u8>) -> PyResult<PyHookEscrowObligationData> {
        PyHookEscrowObligationData::decode(data)
    }

    pub fn encode_hooks_escrow(&self, data: &PyHooksEscrowObligationData) -> PyResult<Vec<u8>> {
        PyHooksEscrowObligationData::encode(data)
    }

    pub fn decode_hooks_escrow(&self, data: Vec<u8>) -> PyResult<PyHooksEscrowObligationData> {
        PyHooksEscrowObligationData::decode(data)
    }

    pub fn encode_erc20_hook_data(&self, data: &PyAmountHookData) -> PyResult<Vec<u8>> {
        PyAmountHookData::encode_erc20(data)
    }

    pub fn decode_erc20_hook_data(&self, data: Vec<u8>) -> PyResult<PyAmountHookData> {
        PyAmountHookData::decode_erc20(data)
    }

    pub fn encode_erc721_hook_data(&self, data: &PyTokenIdHookData) -> PyResult<Vec<u8>> {
        PyTokenIdHookData::encode_erc721(data)
    }

    pub fn decode_erc721_hook_data(&self, data: Vec<u8>) -> PyResult<PyTokenIdHookData> {
        PyTokenIdHookData::decode_erc721(data)
    }

    pub fn encode_erc1155_hook_data(&self, data: &PyErc1155HookData) -> PyResult<Vec<u8>> {
        PyErc1155HookData::encode(data)
    }

    pub fn decode_erc1155_hook_data(&self, data: Vec<u8>) -> PyResult<PyErc1155HookData> {
        PyErc1155HookData::decode(data)
    }

    pub fn encode_native_token_hook_data(&self, data: &PyNativeTokenHookData) -> PyResult<Vec<u8>> {
        PyNativeTokenHookData::encode(data)
    }

    pub fn decode_native_token_hook_data(&self, data: Vec<u8>) -> PyResult<PyNativeTokenHookData> {
        PyNativeTokenHookData::decode(data)
    }

    pub fn encode_attestation_hook_data(&self, data: &PyAttestationHookData) -> PyResult<Vec<u8>> {
        PyAttestationHookData::encode(data)
    }

    pub fn decode_attestation_hook_data(&self, data: Vec<u8>) -> PyResult<PyAttestationHookData> {
        PyAttestationHookData::decode(data)
    }

    pub fn encode_attestation_reference_hook_data(
        &self,
        data: &PyAttestationReferenceHookData,
    ) -> PyResult<Vec<u8>> {
        PyAttestationReferenceHookData::encode(data)
    }

    pub fn decode_attestation_reference_hook_data(
        &self,
        data: Vec<u8>,
    ) -> PyResult<PyAttestationReferenceHookData> {
        PyAttestationReferenceHookData::decode(data)
    }

    pub fn approve_escrow<'py>(
        &self,
        py: pyo3::Python<'py>,
        hook: String,
        escrow: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let hook = parse_hook_contract(&hook)?;
            let escrow: Address = escrow.parse().map_err(map_parse_to_pyerr)?;
            let receipt = inner
                .approve_escrow(hook, escrow)
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(receipt.transaction_hash.to_string())
        })
    }

    pub fn unapprove_escrow<'py>(
        &self,
        py: pyo3::Python<'py>,
        hook: String,
        escrow: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let hook = parse_hook_contract(&hook)?;
            let escrow: Address = escrow.parse().map_err(map_parse_to_pyerr)?;
            let receipt = inner
                .unapprove_escrow(hook, escrow)
                .await
                .map_err(map_eyre_to_pyerr)?;
            Ok(receipt.transaction_hash.to_string())
        })
    }

    pub fn is_escrow_approved<'py>(
        &self,
        py: pyo3::Python<'py>,
        hook: String,
        owner: String,
        escrow: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let hook = parse_hook_contract(&hook)?;
            let owner: Address = owner.parse().map_err(map_parse_to_pyerr)?;
            let escrow: Address = escrow.parse().map_err(map_parse_to_pyerr)?;
            inner
                .is_escrow_approved(hook, owner, escrow)
                .await
                .map_err(map_eyre_to_pyerr)
        })
    }

    pub fn erc20_deposit<'py>(
        &self,
        py: pyo3::Python<'py>,
        caller: String,
        token: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let caller: Address = caller.parse().map_err(map_parse_to_pyerr)?;
            let token: Address = token.parse().map_err(map_parse_to_pyerr)?;
            Ok(inner
                .erc20_deposit(caller, token)
                .await
                .map_err(map_eyre_to_pyerr)?
                .to_string())
        })
    }

    pub fn erc721_deposit<'py>(
        &self,
        py: pyo3::Python<'py>,
        caller: String,
        token: String,
        token_id: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let caller: Address = caller.parse().map_err(map_parse_to_pyerr)?;
            let token: Address = token.parse().map_err(map_parse_to_pyerr)?;
            let token_id: U256 = token_id.parse().map_err(map_parse_to_pyerr)?;
            inner
                .erc721_deposit(caller, token, token_id)
                .await
                .map_err(map_eyre_to_pyerr)
        })
    }

    pub fn erc1155_deposit<'py>(
        &self,
        py: pyo3::Python<'py>,
        caller: String,
        token: String,
        token_id: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let caller: Address = caller.parse().map_err(map_parse_to_pyerr)?;
            let token: Address = token.parse().map_err(map_parse_to_pyerr)?;
            let token_id: U256 = token_id.parse().map_err(map_parse_to_pyerr)?;
            Ok(inner
                .erc1155_deposit(caller, token, token_id)
                .await
                .map_err(map_eyre_to_pyerr)?
                .to_string())
        })
    }

    pub fn native_token_deposit<'py>(
        &self,
        py: pyo3::Python<'py>,
        caller: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let caller: Address = caller.parse().map_err(map_parse_to_pyerr)?;
            Ok(inner
                .native_token_deposit(caller)
                .await
                .map_err(map_eyre_to_pyerr)?
                .to_string())
        })
    }

    pub fn attestation_pending<'py>(
        &self,
        py: pyo3::Python<'py>,
        caller: String,
        hook_data_hash: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let caller: Address = caller.parse().map_err(map_parse_to_pyerr)?;
            let hook_data_hash: FixedBytes<32> =
                hook_data_hash.parse().map_err(map_parse_to_pyerr)?;
            Ok(inner
                .attestation_pending(caller, hook_data_hash)
                .await
                .map_err(map_eyre_to_pyerr)?
                .to_string())
        })
    }

    pub fn attestation_reference_pending<'py>(
        &self,
        py: pyo3::Python<'py>,
        caller: String,
        hook_data_hash: String,
    ) -> PyResult<pyo3::Bound<'py, pyo3::PyAny>> {
        let inner = self.inner.clone();
        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let caller: Address = caller.parse().map_err(map_parse_to_pyerr)?;
            let hook_data_hash: FixedBytes<32> =
                hook_data_hash.parse().map_err(map_parse_to_pyerr)?;
            Ok(inner
                .attestation_reference_pending(caller, hook_data_hash)
                .await
                .map_err(map_eyre_to_pyerr)?
                .to_string())
        })
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyAmountHookData {
    #[pyo3(get)]
    pub token: String,
    #[pyo3(get)]
    pub amount: String,
}

#[pymethods]
impl PyAmountHookData {
    #[new]
    pub fn new(token: String, amount: String) -> Self {
        Self { token, amount }
    }

    #[staticmethod]
    pub fn encode_erc20(data: &PyAmountHookData) -> PyResult<Vec<u8>> {
        let token: Address = data.token.parse().map_err(map_parse_to_pyerr)?;
        let amount: U256 = data.amount.parse().map_err(map_parse_to_pyerr)?;
        Ok(
            contracts::obligations::escrow::hook_based::hooks::ERC20EscrowHook::HookData {
                token,
                amount,
            }
            .abi_encode(),
        )
    }

    #[staticmethod]
    pub fn decode_erc20(data: Vec<u8>) -> PyResult<PyAmountHookData> {
        let decoded =
            contracts::obligations::escrow::hook_based::hooks::ERC20EscrowHook::HookData::abi_decode(&data)
                .map_err(map_sol_decode_to_pyerr)?;
        Ok(Self {
            token: decoded.token.to_string(),
            amount: decoded.amount.to_string(),
        })
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyTokenIdHookData {
    #[pyo3(get)]
    pub token: String,
    #[pyo3(get)]
    pub token_id: String,
}

#[pymethods]
impl PyTokenIdHookData {
    #[new]
    pub fn new(token: String, token_id: String) -> Self {
        Self { token, token_id }
    }

    #[staticmethod]
    pub fn encode_erc721(data: &PyTokenIdHookData) -> PyResult<Vec<u8>> {
        let token: Address = data.token.parse().map_err(map_parse_to_pyerr)?;
        let token_id: U256 = data.token_id.parse().map_err(map_parse_to_pyerr)?;
        Ok(
            contracts::obligations::escrow::hook_based::hooks::ERC721EscrowHook::HookData {
                token,
                tokenId: token_id,
            }
            .abi_encode(),
        )
    }

    #[staticmethod]
    pub fn decode_erc721(data: Vec<u8>) -> PyResult<PyTokenIdHookData> {
        let decoded =
            contracts::obligations::escrow::hook_based::hooks::ERC721EscrowHook::HookData::abi_decode(&data)
                .map_err(map_sol_decode_to_pyerr)?;
        Ok(Self {
            token: decoded.token.to_string(),
            token_id: decoded.tokenId.to_string(),
        })
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyErc1155HookData {
    #[pyo3(get)]
    pub token: String,
    #[pyo3(get)]
    pub token_id: String,
    #[pyo3(get)]
    pub amount: String,
}

#[pymethods]
impl PyErc1155HookData {
    #[new]
    pub fn new(token: String, token_id: String, amount: String) -> Self {
        Self {
            token,
            token_id,
            amount,
        }
    }

    #[staticmethod]
    pub fn encode(data: &PyErc1155HookData) -> PyResult<Vec<u8>> {
        let token: Address = data.token.parse().map_err(map_parse_to_pyerr)?;
        let token_id: U256 = data.token_id.parse().map_err(map_parse_to_pyerr)?;
        let amount: U256 = data.amount.parse().map_err(map_parse_to_pyerr)?;
        Ok(
            contracts::obligations::escrow::hook_based::hooks::ERC1155EscrowHook::HookData {
                token,
                tokenId: token_id,
                amount,
            }
            .abi_encode(),
        )
    }

    #[staticmethod]
    pub fn decode(data: Vec<u8>) -> PyResult<PyErc1155HookData> {
        let decoded =
            contracts::obligations::escrow::hook_based::hooks::ERC1155EscrowHook::HookData::abi_decode(&data)
                .map_err(map_sol_decode_to_pyerr)?;
        Ok(Self {
            token: decoded.token.to_string(),
            token_id: decoded.tokenId.to_string(),
            amount: decoded.amount.to_string(),
        })
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyNativeTokenHookData {
    #[pyo3(get)]
    pub amount: String,
}

#[pymethods]
impl PyNativeTokenHookData {
    #[new]
    pub fn new(amount: String) -> Self {
        Self { amount }
    }

    #[staticmethod]
    pub fn encode(data: &PyNativeTokenHookData) -> PyResult<Vec<u8>> {
        let amount: U256 = data.amount.parse().map_err(map_parse_to_pyerr)?;
        Ok(
            contracts::obligations::escrow::hook_based::hooks::NativeTokenEscrowHook::HookData {
                amount,
            }
            .abi_encode(),
        )
    }

    #[staticmethod]
    pub fn decode(data: Vec<u8>) -> PyResult<PyNativeTokenHookData> {
        let decoded =
            contracts::obligations::escrow::hook_based::hooks::NativeTokenEscrowHook::HookData::abi_decode(&data)
                .map_err(map_sol_decode_to_pyerr)?;
        Ok(Self {
            amount: decoded.amount.to_string(),
        })
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyAttestationHookData {
    pub attestation: AttestationRequest,
}

#[pymethods]
impl PyAttestationHookData {
    #[new]
    pub fn new(attestation: AttestationRequest) -> Self {
        Self { attestation }
    }

    #[staticmethod]
    pub fn encode(data: &PyAttestationHookData) -> PyResult<Vec<u8>> {
        let request = &data.attestation;
        Ok(
            contracts::obligations::escrow::hook_based::hooks::AttestationEscrowHook::HookData {
                attestation: contracts::obligations::escrow::hook_based::hooks::AttestationEscrowHook::AttestationRequest {
                    schema: request.schema.parse().map_err(map_parse_to_pyerr)?,
                    data: contracts::obligations::escrow::hook_based::hooks::AttestationEscrowHook::AttestationRequestData {
                        recipient: request.data.recipient.parse().map_err(map_parse_to_pyerr)?,
                        expirationTime: request.data.expiration_time,
                        revocable: request.data.revocable,
                        refUID: request.data.ref_uid.parse().map_err(map_parse_to_pyerr)?,
                        data: Bytes::from(request.data.data.clone()),
                        value: request.data.value.try_into().map_err(map_parse_to_pyerr)?,
                    },
                },
            }
            .abi_encode(),
        )
    }

    #[staticmethod]
    pub fn decode(data: Vec<u8>) -> PyResult<PyAttestationHookData> {
        let decoded =
            contracts::obligations::escrow::hook_based::hooks::AttestationEscrowHook::HookData::abi_decode(&data)
                .map_err(map_sol_decode_to_pyerr)?;
        Ok(Self {
            attestation: AttestationRequest {
                schema: decoded.attestation.schema.to_string(),
                data: AttestationRequestData {
                    recipient: decoded.attestation.data.recipient.to_string(),
                    expiration_time: decoded.attestation.data.expirationTime,
                    revocable: decoded.attestation.data.revocable,
                    ref_uid: decoded.attestation.data.refUID.to_string(),
                    data: decoded.attestation.data.data.to_vec(),
                    value: decoded
                        .attestation
                        .data
                        .value
                        .try_into()
                        .map_err(map_parse_to_pyerr)?,
                },
            },
        })
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyAttestationReferenceHookData {
    #[pyo3(get)]
    pub referenced_attestation_uid: String,
    #[pyo3(get)]
    pub recipient: String,
    #[pyo3(get)]
    pub expiration_time: u64,
}

#[pymethods]
impl PyAttestationReferenceHookData {
    #[new]
    pub fn new(
        referenced_attestation_uid: String,
        recipient: String,
        expiration_time: u64,
    ) -> Self {
        Self {
            referenced_attestation_uid,
            recipient,
            expiration_time,
        }
    }

    #[staticmethod]
    pub fn encode(data: &PyAttestationReferenceHookData) -> PyResult<Vec<u8>> {
        let referenced_attestation_uid: FixedBytes<32> = data
            .referenced_attestation_uid
            .parse()
            .map_err(map_parse_to_pyerr)?;
        let recipient: Address = data.recipient.parse().map_err(map_parse_to_pyerr)?;
        Ok(contracts::obligations::escrow::hook_based::hooks::AttestationReferenceEscrowHook::HookData {
            referencedAttestationUid: referenced_attestation_uid,
            recipient,
            expirationTime: data.expiration_time,
        }
        .abi_encode())
    }

    #[staticmethod]
    pub fn decode(data: Vec<u8>) -> PyResult<PyAttestationReferenceHookData> {
        let decoded =
            contracts::obligations::escrow::hook_based::hooks::AttestationReferenceEscrowHook::HookData::abi_decode(&data)
                .map_err(map_sol_decode_to_pyerr)?;
        Ok(Self {
            referenced_attestation_uid: decoded.referencedAttestationUid.to_string(),
            recipient: decoded.recipient.to_string(),
            expiration_time: decoded.expirationTime,
        })
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyHookEscrowObligationData {
    #[pyo3(get)]
    pub arbiter: String,
    #[pyo3(get)]
    pub demand: Vec<u8>,
    #[pyo3(get)]
    pub hook: String,
    #[pyo3(get)]
    pub hook_data: Vec<u8>,
}

#[pymethods]
impl PyHookEscrowObligationData {
    #[new]
    pub fn new(arbiter: String, demand: Vec<u8>, hook: String, hook_data: Vec<u8>) -> Self {
        Self {
            arbiter,
            demand,
            hook,
            hook_data,
        }
    }

    #[staticmethod]
    pub fn encode(data: &PyHookEscrowObligationData) -> PyResult<Vec<u8>> {
        let arbiter: Address = data.arbiter.parse().map_err(map_parse_to_pyerr)?;
        let hook: Address = data.hook.parse().map_err(map_parse_to_pyerr)?;
        Ok(
            contracts::obligations::escrow::hook_based::HookEscrowObligation::ObligationData {
                arbiter,
                demand: Bytes::from(data.demand.clone()),
                hook,
                hookData: Bytes::from(data.hook_data.clone()),
            }
            .abi_encode(),
        )
    }

    #[staticmethod]
    pub fn decode(data: Vec<u8>) -> PyResult<PyHookEscrowObligationData> {
        let decoded =
            contracts::obligations::escrow::hook_based::HookEscrowObligation::ObligationData::abi_decode(
                &data,
            )
            .map_err(map_sol_decode_to_pyerr)?;
        Ok(decoded.into())
    }

    pub fn encode_self(&self) -> PyResult<Vec<u8>> {
        PyHookEscrowObligationData::encode(self)
    }
}

impl From<contracts::obligations::escrow::hook_based::HookEscrowObligation::ObligationData>
    for PyHookEscrowObligationData
{
    fn from(
        data: contracts::obligations::escrow::hook_based::HookEscrowObligation::ObligationData,
    ) -> Self {
        Self {
            arbiter: data.arbiter.to_string(),
            demand: data.demand.to_vec(),
            hook: data.hook.to_string(),
            hook_data: data.hookData.to_vec(),
        }
    }
}

#[pyclass]
#[derive(Clone)]
pub struct PyHooksEscrowObligationData {
    #[pyo3(get)]
    pub arbiter: String,
    #[pyo3(get)]
    pub demand: Vec<u8>,
    #[pyo3(get)]
    pub hooks: Vec<String>,
    #[pyo3(get)]
    pub hook_datas: Vec<Vec<u8>>,
    #[pyo3(get)]
    pub values: Vec<String>,
}

#[pymethods]
impl PyHooksEscrowObligationData {
    #[new]
    pub fn new(
        arbiter: String,
        demand: Vec<u8>,
        hooks: Vec<String>,
        hook_datas: Vec<Vec<u8>>,
        values: Vec<String>,
    ) -> Self {
        Self {
            arbiter,
            demand,
            hooks,
            hook_datas,
            values,
        }
    }

    #[staticmethod]
    pub fn encode(data: &PyHooksEscrowObligationData) -> PyResult<Vec<u8>> {
        let arbiter: Address = data.arbiter.parse().map_err(map_parse_to_pyerr)?;
        let hooks = parse_address_vec(&data.hooks)?;
        let hook_datas = data
            .hook_datas
            .iter()
            .cloned()
            .map(Bytes::from)
            .collect::<Vec<_>>();
        let values = parse_u256_vec(&data.values)?;

        Ok(
            contracts::obligations::escrow::hook_based::HooksEscrowObligation::ObligationData {
                arbiter,
                demand: Bytes::from(data.demand.clone()),
                hooks,
                hookDatas: hook_datas,
                values,
            }
            .abi_encode(),
        )
    }

    #[staticmethod]
    pub fn decode(data: Vec<u8>) -> PyResult<PyHooksEscrowObligationData> {
        let decoded =
            contracts::obligations::escrow::hook_based::HooksEscrowObligation::ObligationData::abi_decode(
                &data,
            )
            .map_err(map_sol_decode_to_pyerr)?;
        Ok(decoded.into())
    }

    pub fn encode_self(&self) -> PyResult<Vec<u8>> {
        PyHooksEscrowObligationData::encode(self)
    }
}

impl From<contracts::obligations::escrow::hook_based::HooksEscrowObligation::ObligationData>
    for PyHooksEscrowObligationData
{
    fn from(
        data: contracts::obligations::escrow::hook_based::HooksEscrowObligation::ObligationData,
    ) -> Self {
        Self {
            arbiter: data.arbiter.to_string(),
            demand: data.demand.to_vec(),
            hooks: data
                .hooks
                .into_iter()
                .map(|address| address.to_string())
                .collect(),
            hook_datas: data
                .hookDatas
                .into_iter()
                .map(|hook_data| hook_data.to_vec())
                .collect(),
            values: data
                .values
                .into_iter()
                .map(|value| value.to_string())
                .collect(),
        }
    }
}

fn parse_address_vec(values: &[String]) -> PyResult<Vec<Address>> {
    values
        .iter()
        .map(|value| value.parse().map_err(map_parse_to_pyerr))
        .collect()
}

fn parse_u256_vec(values: &[String]) -> PyResult<Vec<U256>> {
    values
        .iter()
        .map(|value| value.parse().map_err(map_parse_to_pyerr))
        .collect()
}

fn parse_hook_contract(value: &str) -> PyResult<HookBasedContract> {
    match value {
        "erc20" | "erc20_escrow_hook" => Ok(HookBasedContract::Erc20EscrowHook),
        "erc721" | "erc721_escrow_hook" => Ok(HookBasedContract::Erc721EscrowHook),
        "erc1155" | "erc1155_escrow_hook" => Ok(HookBasedContract::Erc1155EscrowHook),
        "native_token" | "native_token_escrow_hook" => Ok(HookBasedContract::NativeTokenEscrowHook),
        "attestation" | "attestation_escrow_hook" => Ok(HookBasedContract::AttestationEscrowHook),
        "attestation_reference" | "attestation_reference_escrow_hook" => {
            Ok(HookBasedContract::AttestationReferenceEscrowHook)
        }
        _ => Err(pyo3::exceptions::PyValueError::new_err(
            "unknown escrow hook contract",
        )),
    }
}
