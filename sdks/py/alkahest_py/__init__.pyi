from __future__ import annotations

from collections.abc import Awaitable, Callable, Mapping, Sequence
from typing import Any, ClassVar, Literal, TypeAlias, overload

Address: TypeAlias = str
HexStr: TypeAlias = str
Uid: TypeAlias = str
BytesLike: TypeAlias = bytes | bytearray | Sequence[int]
JsonValue: TypeAlias = None | bool | int | float | str | Sequence["JsonValue"] | Mapping[str, "JsonValue"]
ApprovalPurpose: TypeAlias = Literal["escrow", "payment", "atomic_payment"]

class _Encodable:
    @staticmethod
    def encode(value: Any) -> bytes: ...
    def encode_self(self) -> bytes: ...

class Erc20Data:
    address: Address
    value: int
    def __init__(self, address: Address, value: int) -> None: ...

class Attestation:
    uid: Uid
    schema: HexStr
    time: int
    expiration_time: int
    revocation_time: int
    ref_uid: Uid
    recipient: Address
    attester: Address
    revocable: bool
    data: bytes
    def __init__(
        self,
        uid: Uid,
        schema: HexStr,
        time: int,
        expiration_time: int,
        revocation_time: int,
        ref_uid: Uid,
        recipient: Address,
        attester: Address,
        revocable: bool,
        data: BytesLike,
    ) -> None: ...
    def is_expired(self) -> bool: ...
    def is_revoked(self) -> bool: ...
    def is_valid(self) -> bool: ...

class AttestationRequestData:
    recipient: Address
    expiration_time: int
    revocable: bool
    ref_uid: Uid
    data: bytes
    value: int
    def __init__(self, recipient: Address, expiration_time: int, revocable: bool, ref_uid: Uid, data: BytesLike, value: int) -> None: ...

class AttestationRequest:
    schema: HexStr
    data: AttestationRequestData
    def __init__(self, schema: HexStr, data: AttestationRequestData) -> None: ...

class RevocationRequestData:
    uid: Uid
    value: int
    def __init__(self, uid: Uid, value: int) -> None: ...

class RevocationRequest:
    schema: HexStr
    data: RevocationRequestData
    def __init__(self, schema: HexStr, data: RevocationRequestData) -> None: ...

class Attested:
    recipient: Address
    attester: Address
    uid: Uid
    schema_uid: HexStr
    def __init__(self, recipient: Address, attester: Address, uid: Uid, schema_uid: HexStr) -> None: ...

class Revoked:
    recipient: Address
    attester: Address
    uid: Uid
    schema_uid: HexStr
    def __init__(self, recipient: Address, attester: Address, uid: Uid, schema_uid: HexStr) -> None: ...

class Timestamped:
    data: bytes
    timestamp: int
    def __init__(self, data: BytesLike, timestamp: int) -> None: ...

class OracleAttestation:
    uid: Uid
    schema: HexStr
    ref_uid: Uid
    time: int
    expiration_time: int
    revocation_time: int
    recipient: Address
    attester: Address
    revocable: bool
    data: bytes
    def __init__(
        self,
        uid: Uid,
        schema: HexStr,
        ref_uid: Uid,
        time: int,
        expiration_time: int,
        revocation_time: int,
        recipient: Address,
        attester: Address,
        revocable: bool,
        data: BytesLike,
    ) -> None: ...

class Decision:
    attestation: OracleAttestation
    decision: bool
    transaction_hash: HexStr
    def __init__(self, attestation: OracleAttestation, decision: bool, transaction_hash: HexStr) -> None: ...

class ArbitrationMode:
    All: ClassVar["ArbitrationMode"]
    AllUnarbitrated: ClassVar["ArbitrationMode"]
    Future: ClassVar["ArbitrationMode"]
    Past: ClassVar["ArbitrationMode"]
    PastUnarbitrated: ClassVar["ArbitrationMode"]
    @staticmethod
    def all() -> "ArbitrationMode": ...
    @staticmethod
    def all_unarbitrated() -> "ArbitrationMode": ...
    @staticmethod
    def future() -> "ArbitrationMode": ...
    @staticmethod
    def past() -> "ArbitrationMode": ...
    @staticmethod
    def past_unarbitrated() -> "ArbitrationMode": ...

class _SimpleCodec(_Encodable):
    @staticmethod
    def decode(data: BytesLike) -> Any: ...

class ERC20EscrowObligationData(_Encodable):
    token: Address
    amount: int
    arbiter: Address
    demand: bytes
    def __init__(self, token: Address, amount: int, arbiter: Address, demand: BytesLike) -> None: ...
    @staticmethod
    def decode(obligation_data: BytesLike) -> "ERC20EscrowObligationData": ...

class ERC20PaymentObligationData(_Encodable):
    token: Address
    amount: int
    payee: Address
    def __init__(self, token: Address, amount: int, payee: Address) -> None: ...
    @staticmethod
    def decode(obligation_data: BytesLike) -> "ERC20PaymentObligationData": ...

class ERC721EscrowObligationData(_Encodable):
    token: Address
    token_id: int
    arbiter: Address
    demand: bytes
    def __init__(self, token: Address, token_id: int, arbiter: Address, demand: BytesLike) -> None: ...
    @staticmethod
    def decode(obligation_data: BytesLike) -> "ERC721EscrowObligationData": ...

class ERC721PaymentObligationData(_Encodable):
    token: Address
    token_id: int
    payee: Address
    def __init__(self, token: Address, token_id: int, payee: Address) -> None: ...
    @staticmethod
    def decode(obligation_data: BytesLike) -> "ERC721PaymentObligationData": ...

class ERC1155EscrowObligationData(_Encodable):
    token: Address
    token_id: int
    amount: int
    arbiter: Address
    demand: bytes
    def __init__(self, token: Address, token_id: int, amount: int, arbiter: Address, demand: BytesLike) -> None: ...
    @staticmethod
    def decode(obligation_data: BytesLike) -> "ERC1155EscrowObligationData": ...

class ERC1155PaymentObligationData(_Encodable):
    token: Address
    token_id: int
    amount: int
    payee: Address
    def __init__(self, token: Address, token_id: int, amount: int, payee: Address) -> None: ...
    @staticmethod
    def decode(obligation_data: BytesLike) -> "ERC1155PaymentObligationData": ...

class NativeTokenEscrowObligationData(_Encodable):
    arbiter: Address
    demand: bytes
    amount: int
    def __init__(self, arbiter: Address, demand: BytesLike, amount: int) -> None: ...
    @staticmethod
    def decode(obligation_data: BytesLike) -> "NativeTokenEscrowObligationData": ...

class NativeTokenPaymentObligationData(_Encodable):
    amount: int
    payee: Address
    def __init__(self, amount: int, payee: Address) -> None: ...

class TokenBundleEscrowObligationData(_Encodable):
    arbiter: Address
    demand: bytes
    native_amount: int
    erc20_tokens: list[Address]
    erc20_amounts: list[int]
    erc721_tokens: list[Address]
    erc721_token_ids: list[int]
    erc1155_tokens: list[Address]
    erc1155_token_ids: list[int]
    erc1155_amounts: list[int]
    def __init__(
        self,
        arbiter: Address,
        demand: BytesLike,
        native_amount: int,
        erc20_tokens: Sequence[Address],
        erc20_amounts: Sequence[int],
        erc721_tokens: Sequence[Address],
        erc721_token_ids: Sequence[int],
        erc1155_tokens: Sequence[Address],
        erc1155_token_ids: Sequence[int],
        erc1155_amounts: Sequence[int],
    ) -> None: ...
    @staticmethod
    def decode(obligation_data: BytesLike) -> "TokenBundleEscrowObligationData": ...

class TokenBundlePaymentObligationData(_Encodable):
    native_amount: int
    erc20_tokens: list[Address]
    erc20_amounts: list[int]
    erc721_tokens: list[Address]
    erc721_token_ids: list[int]
    erc1155_tokens: list[Address]
    erc1155_token_ids: list[int]
    erc1155_amounts: list[int]
    payee: Address
    def __init__(
        self,
        native_amount: int,
        erc20_tokens: Sequence[Address],
        erc20_amounts: Sequence[int],
        erc721_tokens: Sequence[Address],
        erc721_token_ids: Sequence[int],
        erc1155_tokens: Sequence[Address],
        erc1155_token_ids: Sequence[int],
        erc1155_amounts: Sequence[int],
        payee: Address,
    ) -> None: ...

class AttestationEscrowObligationData(_Encodable):
    arbiter: Address
    demand: bytes
    attestation: AttestationRequest
    def __init__(self, arbiter: Address, demand: BytesLike, attestation: AttestationRequest) -> None: ...
    @staticmethod
    def decode(obligation_data: BytesLike) -> "AttestationEscrowObligationData": ...

class AttestationReferenceEscrowObligationData(_Encodable):
    arbiter: Address
    demand: bytes
    referenced_attestation_uid: Uid
    expiration_time: int
    def __init__(self, arbiter: Address, demand: BytesLike, referenced_attestation_uid: Uid, expiration_time: int = 0) -> None: ...
    @staticmethod
    def decode(obligation_data: BytesLike) -> "AttestationReferenceEscrowObligationData": ...

class StringObligationData(_Encodable):
    item: str
    schema: HexStr | None
    def __init__(self, item: str, schema: HexStr | None = None) -> None: ...
    @staticmethod
    def decode(obligation_data: BytesLike) -> "StringObligationData": ...
    @staticmethod
    def decode_json(obligation_data: BytesLike) -> JsonValue: ...
    @staticmethod
    def encode_json(json_data: JsonValue, schema: HexStr | None = None) -> bytes: ...
    @staticmethod
    def encode_json_object(json_data: Mapping[str, JsonValue], schema: HexStr | None = None) -> bytes: ...

class CommitRevealObligationData(_Encodable):
    payload: bytes
    salt: HexStr
    schema: HexStr
    def __init__(self, payload: BytesLike, salt: HexStr, schema: HexStr) -> None: ...
    @staticmethod
    def decode(obligation_data: BytesLike) -> "CommitRevealObligationData": ...

class CommitRevealDemandData(_Encodable):
    bond_amount: int
    commit_deadline: int
    def __init__(self, bond_amount: int, commit_deadline: int) -> None: ...
    @staticmethod
    def decode(demand_data: BytesLike) -> "CommitRevealDemandData": ...

class TrustedOracleArbiterDemandData(_Encodable):
    oracle: Address
    data: bytes
    def __init__(self, oracle: Address, data: BytesLike) -> None: ...
    @staticmethod
    def decode(demand_bytes: BytesLike) -> "TrustedOracleArbiterDemandData": ...

class CommitmentTrustedOracleArbiterDemandData(_Encodable):
    oracle: Address
    data: bytes
    def __init__(self, oracle: Address, data: BytesLike) -> None: ...
    @staticmethod
    def decode(demand_bytes: BytesLike) -> "CommitmentTrustedOracleArbiterDemandData": ...

class ERC8004ArbiterDemandData(_Encodable):
    validation_registry: Address
    validator_address: Address
    min_response: int
    data: bytes
    def __init__(self, validation_registry: Address, validator_address: Address, min_response: int, data: BytesLike = ...) -> None: ...
    @staticmethod
    def decode(demand_bytes: BytesLike) -> "ERC8004ArbiterDemandData": ...

class AttesterArbiterDemandData(_Encodable):
    attester: Address
    def __init__(self, attester: Address) -> None: ...
    @staticmethod
    def decode(demand_bytes: BytesLike) -> "AttesterArbiterDemandData": ...

class RecipientArbiterDemandData(_Encodable):
    recipient: Address
    def __init__(self, recipient: Address) -> None: ...
    @staticmethod
    def decode(demand_bytes: BytesLike) -> "RecipientArbiterDemandData": ...

class SchemaArbiterDemandData(_Encodable):
    schema: HexStr
    def __init__(self, schema: HexStr) -> None: ...
    @staticmethod
    def decode(demand_bytes: BytesLike) -> "SchemaArbiterDemandData": ...

class UidArbiterDemandData(_Encodable):
    uid: Uid
    def __init__(self, uid: Uid) -> None: ...
    @staticmethod
    def decode(demand_bytes: BytesLike) -> "UidArbiterDemandData": ...

class RefUidArbiterDemandData(_Encodable):
    ref_uid: Uid
    def __init__(self, ref_uid: Uid) -> None: ...
    @staticmethod
    def decode(demand_bytes: BytesLike) -> "RefUidArbiterDemandData": ...

class RevocableArbiterDemandData(_Encodable):
    revocable: bool
    def __init__(self, revocable: bool) -> None: ...
    @staticmethod
    def decode(demand_bytes: BytesLike) -> "RevocableArbiterDemandData": ...

class TimeAfterArbiterDemandData(_Encodable):
    time: int
    def __init__(self, time: int) -> None: ...
    @staticmethod
    def decode(demand_bytes: BytesLike) -> "TimeAfterArbiterDemandData": ...

class TimeBeforeArbiterDemandData(TimeAfterArbiterDemandData): ...
class TimeEqualArbiterDemandData(TimeAfterArbiterDemandData): ...

class ExpirationTimeAfterArbiterDemandData(_Encodable):
    expiration_time: int
    def __init__(self, expiration_time: int) -> None: ...
    @staticmethod
    def decode(demand_bytes: BytesLike) -> "ExpirationTimeAfterArbiterDemandData": ...

class ExpirationTimeBeforeArbiterDemandData(ExpirationTimeAfterArbiterDemandData): ...
class ExpirationTimeEqualArbiterDemandData(ExpirationTimeAfterArbiterDemandData): ...

class AllArbiterDemandData(_Encodable):
    arbiters: list[Address]
    demands: list[bytes]
    def __init__(self, arbiters: Sequence[Address], demands: Sequence[BytesLike]) -> None: ...
    @staticmethod
    def decode(demand_bytes: BytesLike) -> "AllArbiterDemandData": ...

class AnyArbiterDemandData(AllArbiterDemandData): ...

class DecodedAllArbiterDemandData:
    arbiters: list[Address]
    demands: list[bytes]

class DecodedAnyArbiterDemandData:
    arbiters: list[Address]
    demands: list[bytes]

class DecodedDemand:
    demand_type: str
    raw_data: bytes

class AmountHookData:
    token: Address
    amount: str
    def __init__(self, token: Address, amount: str) -> None: ...
    @staticmethod
    def encode_erc20(data: "AmountHookData") -> bytes: ...
    @staticmethod
    def decode_erc20(data: BytesLike) -> "AmountHookData": ...

class TokenIdHookData:
    token: Address
    token_id: str
    def __init__(self, token: Address, token_id: str) -> None: ...
    @staticmethod
    def encode_erc721(data: "TokenIdHookData") -> bytes: ...
    @staticmethod
    def decode_erc721(data: BytesLike) -> "TokenIdHookData": ...

class Erc1155HookData:
    token: Address
    token_id: str
    amount: str
    def __init__(self, token: Address, token_id: str, amount: str) -> None: ...
    @staticmethod
    def encode(data: "Erc1155HookData") -> bytes: ...
    @staticmethod
    def decode(data: BytesLike) -> "Erc1155HookData": ...

class NativeTokenHookData:
    amount: str
    def __init__(self, amount: str) -> None: ...
    @staticmethod
    def encode(data: "NativeTokenHookData") -> bytes: ...
    @staticmethod
    def decode(data: BytesLike) -> "NativeTokenHookData": ...

class AttestationHookData:
    def __init__(self, attestation: AttestationRequest) -> None: ...
    @staticmethod
    def encode(data: "AttestationHookData") -> bytes: ...
    @staticmethod
    def decode(data: BytesLike) -> "AttestationHookData": ...

class AttestationReferenceHookData:
    referenced_attestation_uid: Uid
    recipient: Address
    expiration_time: int
    def __init__(self, referenced_attestation_uid: Uid, recipient: Address, expiration_time: int) -> None: ...
    @staticmethod
    def encode(data: "AttestationReferenceHookData") -> bytes: ...
    @staticmethod
    def decode(data: BytesLike) -> "AttestationReferenceHookData": ...

class HookEscrowObligationData(_Encodable):
    arbiter: Address
    demand: bytes
    hook: Address
    hook_data: bytes
    def __init__(self, arbiter: Address, demand: BytesLike, hook: Address, hook_data: BytesLike) -> None: ...
    @staticmethod
    def decode(data: BytesLike) -> "HookEscrowObligationData": ...

class HooksEscrowObligationData(_Encodable):
    arbiter: Address
    demand: bytes
    hooks: list[Address]
    hook_datas: list[bytes]
    values: list[str]
    def __init__(self, arbiter: Address, demand: BytesLike, hooks: Sequence[Address], hook_datas: Sequence[BytesLike], values: Sequence[str]) -> None: ...
    @staticmethod
    def decode(data: BytesLike) -> "HooksEscrowObligationData": ...

class AmountSplit(_Encodable):
    recipient: Address
    amount: str
    def __init__(self, recipient: Address, amount: str) -> None: ...
    @staticmethod
    def decode(data: BytesLike) -> "AmountSplit": ...

class BundleSplit(_Encodable):
    recipient: Address
    native_amount: str
    erc20_amounts: list[str]
    erc721_indices: list[str]
    erc1155_amounts: list[str]
    def __init__(self, recipient: Address, native_amount: str, erc20_amounts: Sequence[str], erc721_indices: Sequence[str], erc1155_amounts: Sequence[str]) -> None: ...
    @staticmethod
    def decode(data: BytesLike) -> "BundleSplit": ...

class SplitterDemandData(_Encodable):
    oracle: Address
    data: bytes
    def __init__(self, oracle: Address, data: BytesLike) -> None: ...
    @staticmethod
    def decode(data: BytesLike) -> "SplitterDemandData": ...

class Erc20Addresses:
    eas: Address
    atomic_payment_utils: Address
    escrow_obligation_default: Address
    escrow_obligation_unconditional: Address
    payment_obligation: Address
    def __init__(self, eas: Address, atomic_payment_utils: Address, escrow_obligation_default: Address, escrow_obligation_unconditional: Address, payment_obligation: Address) -> None: ...

class Erc721Addresses(Erc20Addresses): ...
class Erc1155Addresses(Erc20Addresses): ...
class NativeTokenAddresses(Erc20Addresses): ...
class TokenBundleAddresses(Erc20Addresses): ...

class AttestationAddresses:
    eas: Address
    eas_schema_registry: Address
    atomic_attestation_utils: Address
    escrow_obligation_default: Address
    escrow_obligation_unconditional: Address
    attestation_reference_escrow_obligation_default: Address
    attestation_reference_escrow_obligation_unconditional: Address
    def __init__(
        self,
        eas: Address,
        eas_schema_registry: Address,
        atomic_attestation_utils: Address,
        escrow_obligation_default: Address,
        escrow_obligation_unconditional: Address,
        attestation_reference_escrow_obligation_default: Address,
        attestation_reference_escrow_obligation_unconditional: Address,
    ) -> None: ...

class HookBasedAddresses:
    eas: Address
    hook_escrow_obligation: Address
    hooks_escrow_obligation: Address
    erc20_escrow_hook: Address
    erc721_escrow_hook: Address
    erc1155_escrow_hook: Address
    native_token_escrow_hook: Address
    attestation_escrow_hook: Address
    attestation_reference_escrow_hook: Address
    def __init__(
        self,
        eas: Address,
        hook_escrow_obligation: Address,
        hooks_escrow_obligation: Address,
        erc20_escrow_hook: Address,
        erc721_escrow_hook: Address,
        erc1155_escrow_hook: Address,
        native_token_escrow_hook: Address,
        attestation_escrow_hook: Address,
        attestation_reference_escrow_hook: Address,
    ) -> None: ...

class SplittersAddresses:
    erc20_splitter: Address
    erc1155_splitter: Address
    native_token_splitter: Address
    token_bundle_splitter: Address
    token_bundle_splitter_unvalidated: Address
    commitment_erc20_splitter: Address
    commitment_erc1155_splitter: Address
    commitment_native_token_splitter: Address
    commitment_token_bundle_splitter: Address
    commitment_token_bundle_splitter_unvalidated: Address
    def __init__(
        self,
        erc20_splitter: Address,
        erc1155_splitter: Address,
        native_token_splitter: Address,
        token_bundle_splitter: Address,
        token_bundle_splitter_unvalidated: Address,
        commitment_erc20_splitter: Address,
        commitment_erc1155_splitter: Address,
        commitment_native_token_splitter: Address,
        commitment_token_bundle_splitter: Address,
        commitment_token_bundle_splitter_unvalidated: Address,
    ) -> None: ...

class StringObligationAddresses:
    eas: Address
    obligation: Address
    def __init__(self, eas: Address, obligation: Address) -> None: ...

class CommitRevealObligationAddresses(StringObligationAddresses): ...

class OracleAddresses:
    eas: Address
    trusted_oracle_arbiter: Address
    commitment_trusted_oracle_arbiter: Address
    def __init__(self, eas: Address, trusted_oracle_arbiter: Address, commitment_trusted_oracle_arbiter: Address) -> None: ...

class ArbitersAddresses:
    eas: Address
    trivial_arbiter: Address
    trusted_oracle_arbiter: Address
    commitment_trusted_oracle_arbiter: Address
    intrinsics_arbiter: Address
    erc8004_arbiter: Address
    any_arbiter: Address
    all_arbiter: Address
    references_escrow_arbiter: Address
    attester_arbiter: Address
    expiration_time_after_arbiter: Address
    expiration_time_before_arbiter: Address
    expiration_time_equal_arbiter: Address
    recipient_arbiter: Address
    ref_uid_arbiter: Address
    revocable_arbiter: Address
    schema_arbiter: Address
    time_after_arbiter: Address
    time_before_arbiter: Address
    time_equal_arbiter: Address
    uid_arbiter: Address
    exclusive_revocable_confirmation_arbiter: Address
    exclusive_unrevocable_confirmation_arbiter: Address
    nonexclusive_revocable_confirmation_arbiter: Address
    nonexclusive_unrevocable_confirmation_arbiter: Address

class DefaultExtensionConfig:
    erc20_addresses: Erc20Addresses
    erc721_addresses: Erc721Addresses
    erc1155_addresses: Erc1155Addresses
    native_token_addresses: NativeTokenAddresses
    token_bundle_addresses: TokenBundleAddresses
    attestation_addresses: AttestationAddresses
    hook_based_addresses: HookBasedAddresses
    splitters_addresses: SplittersAddresses
    string_obligation_addresses: StringObligationAddresses
    commit_reveal_obligation_addresses: CommitRevealObligationAddresses
    arbiters_addresses: ArbitersAddresses
    @classmethod
    def default_config(cls) -> "DefaultExtensionConfig": ...
    @classmethod
    def for_chain(cls, name: str) -> "DefaultExtensionConfig": ...
    @classmethod
    def supported_chains(cls) -> list[str]: ...
    def address_index(self) -> dict[Address, Any]: ...
    def lookup_address(self, address: Address) -> Any | None: ...

class WalletProvider:
    def anvil_increase_time(self, seconds: int) -> Awaitable[Any]: ...
    def anvil_mine(self, blocks: int) -> Awaitable[Any]: ...

class EnvTestManager:
    addresses: DefaultExtensionConfig
    alice: Address
    alice_private_key: str
    bob: Address
    bob_private_key: str
    charlie: Address
    charlie_private_key: str
    god: Address
    god_wallet_provider: WalletProvider
    mock_addresses: Any
    rpc_url: str
    def __init__(self) -> None: ...

class MockERC20:
    address: Address
    def __init__(self, address: Address, provider: WalletProvider) -> None: ...
    def allowance(self, owner: Address, spender: Address) -> Awaitable[int]: ...
    def balance_of(self, address: Address) -> Awaitable[int]: ...
    def transfer(self, to: Address, value: int) -> Awaitable[HexStr]: ...

class MockERC721:
    address: Address
    def __init__(self, address: Address, provider: WalletProvider) -> None: ...
    def approve(self, approved: Address, token_id: int) -> Awaitable[HexStr]: ...
    def balance_of(self, owner: Address) -> Awaitable[int]: ...
    def get_approved(self, token_id: int) -> Awaitable[Address]: ...
    def is_approved_for_all(self, account: Address, operator: Address) -> Awaitable[bool]: ...
    def mint(self, to: Address) -> Awaitable[HexStr]: ...
    def owner_of(self, token_id: int) -> Awaitable[Address]: ...
    def transfer_from(self, from_: Address, to: Address, token_id: int) -> Awaitable[HexStr]: ...

class MockERC1155:
    address: Address
    def __init__(self, address: Address, provider: WalletProvider) -> None: ...
    def balance_of(self, account: Address, token_id: int) -> Awaitable[int]: ...
    def balance_of_batch(self, accounts: Sequence[Address], token_ids: Sequence[int]) -> Awaitable[list[int]]: ...
    def is_approved_for_all(self, account: Address, operator: Address) -> Awaitable[bool]: ...
    def mint(self, to: Address, token_id: int, amount: int) -> Awaitable[HexStr]: ...
    def safe_batch_transfer_from(self, from_: Address, to: Address, token_ids: Sequence[int], amounts: Sequence[int], data: BytesLike) -> Awaitable[HexStr]: ...
    def safe_transfer_from(self, from_: Address, to: Address, token_id: int, amount: int, data: BytesLike) -> Awaitable[HexStr]: ...
    def set_approval_for_all(self, operator: Address, approved: bool) -> Awaitable[HexStr]: ...

class StringObligationClient:
    def do_obligation(self, item: str, ref_uid: Uid | None = None, schema: HexStr | None = None) -> Awaitable[Uid]: ...
    def do_obligation_json(self, json_data: JsonValue, ref_uid: Uid | None = None, schema: HexStr | None = None) -> Awaitable[Uid]: ...
    def get_obligation(self, uid: Uid) -> Awaitable[Any]: ...

class CommitRevealObligationClient:
    def commit(self, commitment: HexStr, bond_amount: int, commit_deadline: int) -> Awaitable[HexStr]: ...
    def compute_commitment(self, ref_uid: Uid, claimer: Address, payload: BytesLike, salt: HexStr, schema: HexStr) -> Awaitable[HexStr]: ...
    def do_obligation(self, payload: BytesLike, salt: HexStr, schema: HexStr, ref_uid: Uid | None = None) -> Awaitable[Uid]: ...
    def get_commitment(self, commitment: HexStr) -> Awaitable[Any]: ...
    def get_obligation(self, uid: Uid) -> Awaitable[Any]: ...
    def is_commitment_claimed(self, commitment: HexStr) -> Awaitable[bool]: ...
    def slash_bond(self, commitment: HexStr) -> Awaitable[HexStr]: ...
    def slashed_bond_recipient(self) -> Awaitable[Address]: ...

class _PaymentClient:
    def pay(self, price: Any, payee: Address) -> Awaitable[Any]: ...
    def approve_and_pay(self, price: Any, payee: Address) -> Awaitable[Any]: ...
    def permit_and_pay(self, price: Any, payee: Address) -> Awaitable[Any]: ...
    def pay_erc20_and_collect(self, escrow_uid: Uid) -> Awaitable[Any]: ...
    def pay_erc20_and_collect_unchecked(self, escrow_uid: Uid) -> Awaitable[Any]: ...
    def permit_and_pay_erc20_and_collect(self, escrow_uid: Uid) -> Awaitable[Any]: ...
    def permit_and_pay_erc20_and_collect_unchecked(self, escrow_uid: Uid) -> Awaitable[Any]: ...
    def pay_erc721_and_collect(self, escrow_uid: Uid) -> Awaitable[Any]: ...
    def pay_erc721_and_collect_unchecked(self, escrow_uid: Uid) -> Awaitable[Any]: ...
    def pay_erc1155_and_collect(self, escrow_uid: Uid) -> Awaitable[Any]: ...
    def pay_erc1155_and_collect_unchecked(self, escrow_uid: Uid) -> Awaitable[Any]: ...
    def pay_native_and_collect(self, escrow_uid: Uid) -> Awaitable[Any]: ...
    def pay_native_and_collect_unchecked(self, escrow_uid: Uid) -> Awaitable[Any]: ...
    def pay_bundle_and_collect(self, escrow_uid: Uid) -> Awaitable[Any]: ...
    def pay_bundle_and_collect_unchecked(self, escrow_uid: Uid) -> Awaitable[Any]: ...

class _EscrowVariantClient:
    def create(self, bid: Any, demand: Any, expiration: int = 0) -> Awaitable[Any]: ...
    def collect(self, escrow_uid: Uid, fulfillment_uid: Uid) -> Awaitable[Any]: ...
    def reclaim_expired(self, escrow_uid: Uid) -> Awaitable[Any]: ...
    def get(self, uid: Uid) -> Awaitable[Any]: ...
    def check(self, fulfillment_uid: Uid, demand: BytesLike, escrow_uid: Uid) -> Awaitable[bool]: ...

class _EscrowNamespace:
    default: _EscrowVariantClient
    unconditional: _EscrowVariantClient

class _TokenUtilClient:
    def approve(self, token_or_data: Any, amount_or_purpose: Any = ..., purpose: ApprovalPurpose | None = None) -> Awaitable[HexStr]: ...
    def approve_all(self, token: Address, purpose: ApprovalPurpose) -> Awaitable[HexStr]: ...
    def approve_if_less(self, token_or_data: Any, amount_or_purpose: Any = ..., purpose: ApprovalPurpose | None = None) -> Awaitable[HexStr | None]: ...
    def permit_signature(self, token_or_data: Any, amount: int | None = None, purpose: ApprovalPurpose | None = None) -> Awaitable[Any]: ...

class _TokenClient:
    escrow: _EscrowNamespace
    payment: _PaymentClient
    util: _TokenUtilClient

class _NativeTokenClient:
    escrow: _EscrowNamespace
    payment: _PaymentClient

class _AttestationEscrowNamespace:
    default: _EscrowNamespace
    reference: _EscrowNamespace

class _AttestationUtilClient:
    def get_attestation(self, uid: Uid) -> Awaitable[Attestation]: ...
    def register_schema(self, schema: str, resolver: Address, revocable: bool) -> Awaitable[HexStr]: ...
    def attest(self, schema: HexStr, data: AttestationRequestData) -> Awaitable[Uid]: ...

class _AttestationClient:
    escrow: _AttestationEscrowNamespace
    util: _AttestationUtilClient

class HookBasedClient:
    def address(self, contract: str) -> Address: ...
    def approve_escrow(self, hook: Address, escrow: Address) -> Awaitable[HexStr]: ...
    def unapprove_escrow(self, hook: Address, escrow: Address) -> Awaitable[HexStr]: ...
    def is_escrow_approved(self, hook: Address, owner: Address, escrow: Address) -> Awaitable[bool]: ...
    def encode_erc20_hook_data(self, data: AmountHookData) -> bytes: ...
    def decode_erc20_hook_data(self, data: BytesLike) -> AmountHookData: ...
    def encode_erc721_hook_data(self, data: TokenIdHookData) -> bytes: ...
    def decode_erc721_hook_data(self, data: BytesLike) -> TokenIdHookData: ...
    def encode_erc1155_hook_data(self, data: Erc1155HookData) -> bytes: ...
    def decode_erc1155_hook_data(self, data: BytesLike) -> Erc1155HookData: ...
    def encode_native_token_hook_data(self, data: NativeTokenHookData) -> bytes: ...
    def decode_native_token_hook_data(self, data: BytesLike) -> NativeTokenHookData: ...
    def encode_hook_escrow(self, data: HookEscrowObligationData) -> bytes: ...
    def decode_hook_escrow(self, data: BytesLike) -> HookEscrowObligationData: ...
    def encode_hooks_escrow(self, data: HooksEscrowObligationData) -> bytes: ...
    def decode_hooks_escrow(self, data: BytesLike) -> HooksEscrowObligationData: ...

class _SplitterVariantClient:
    def address(self) -> Address: ...
    def arbitrate(self, fulfillment_or_intent: Uid | HexStr, escrow: Uid, splits: Sequence[Any]) -> Awaitable[HexStr]: ...
    def arbitrate_many(self, decision_func: Callable[..., Any], callback_func: Callable[..., Any] | None = None, mode: ArbitrationMode | None = None, timeout_seconds: float | None = None) -> Awaitable[list[Any]]: ...
    def collect_and_distribute(self, escrow: Uid, fulfillment: Uid) -> Awaitable[HexStr]: ...
    def create_fulfillment(self, obligation_contract: Address, data: BytesLike, expiration_time: int, ref_uid: Uid, value: int = ...) -> Awaitable[Any]: ...
    def get_splits(self, oracle: Address, fulfillment_or_intent: Uid | HexStr, escrow: Uid) -> Awaitable[list[Any]]: ...
    def has_decision(self, oracle: Address, decision_key: HexStr) -> Awaitable[bool]: ...
    def request_arbitration(self, fulfillment_or_intent: Uid | HexStr, escrow: Uid, oracle: Address, demand: BytesLike) -> Awaitable[HexStr]: ...
    def unsafe_partially_collect_and_distribute(self, escrow: Uid, fulfillment: Uid) -> Awaitable[HexStr]: ...

class _CommitmentSplitterVariantClient(_SplitterVariantClient):
    def create_fulfillment_and_collect_and_distribute(self, escrow: Uid, obligation_contract: Address, data: BytesLike, expiration_time: int, ref_uid: Uid, value: int = ...) -> Awaitable[Any]: ...

class _SplitterNamespace(_SplitterVariantClient):
    fulfillment: _SplitterVariantClient
    commitment: _CommitmentSplitterVariantClient
    def for_target(self, target: Literal["fulfillment", "commitment"]) -> _SplitterVariantClient: ...

class SplittersClient:
    erc20: _SplitterNamespace
    erc1155: _SplitterNamespace
    native_token: _SplitterNamespace
    token_bundle: _SplitterNamespace
    token_bundle_unvalidated: _SplitterNamespace
    def address(self, contract: str) -> Address: ...
    def encode_demand(self, data: SplitterDemandData) -> bytes: ...
    def decode_demand(self, data: BytesLike) -> SplitterDemandData: ...
    def decision_key(self, fulfillment: Uid, escrow: Uid) -> Awaitable[HexStr]: ...
    def attestation_intent_hash(self, attestation: AttestationRequest) -> Awaitable[HexStr]: ...

class OracleClient:
    def get_eas_address(self) -> Address: ...
    def get_trusted_oracle_arbiter_address(self) -> Address: ...
    def get_commitment_trusted_oracle_arbiter_address(self) -> Address: ...
    def request_arbitration(self, obligation_uid: Uid, oracle: Address, demand: BytesLike) -> Awaitable[HexStr]: ...
    def commitment_request_arbitration(self, intent_hash: HexStr, oracle: Address, demand: BytesLike) -> Awaitable[HexStr]: ...
    def arbitrate_raw(self, obligation: Uid, decision_context: BytesLike, decision: bool) -> Awaitable[HexStr]: ...
    def arbitrate_for_demand(self, obligation: Uid, demand: TrustedOracleArbiterDemandData, decision: bool) -> Awaitable[HexStr]: ...
    def commitment_arbitrate_raw(self, intent_hash: HexStr, decision_context: BytesLike, decision: bool) -> Awaitable[HexStr]: ...
    def commitment_arbitrate_for_demand(self, intent_hash: HexStr, demand: CommitmentTrustedOracleArbiterDemandData, decision: bool) -> Awaitable[HexStr]: ...
    def arbitrate_many(self, decision_func: Callable[..., Any], callback_func: Callable[..., Any] | None = None, mode: ArbitrationMode | None = None, timeout_seconds: float | None = None) -> Awaitable[list[Decision]]: ...
    def commitment_arbitrate_many(self, decision_func: Callable[..., Any], callback_func: Callable[..., Any] | None = None, mode: ArbitrationMode | None = None, timeout_seconds: float | None = None) -> Awaitable[list[Decision]]: ...
    def wait_for_arbitration(self, obligation: Uid, demand: BytesLike, oracle: Address, from_block: int) -> Awaitable[Any]: ...
    def commitment_wait_for_arbitration(self, intent_hash: HexStr, oracle: Address, demand: BytesLike, from_block: int) -> Awaitable[Any]: ...
    def extract_obligation_data(self, attestation: Attestation | OracleAttestation) -> str: ...
    def extract_demand_data(self, escrow_attestation: Attestation | OracleAttestation) -> TrustedOracleArbiterDemandData: ...
    def get_escrow_attestation(self, fulfillment: Attestation | OracleAttestation) -> Awaitable[OracleAttestation]: ...
    def get_escrow_and_demand(self, fulfillment: Attestation | OracleAttestation) -> Awaitable[tuple[OracleAttestation, TrustedOracleArbiterDemandData]]: ...

class _PropertyArbiter:
    def address(self) -> Address: ...
    def decode(self, demand_bytes: BytesLike) -> Any: ...

class AllArbiter:
    def address(self) -> Address: ...
    @staticmethod
    def encode(arbiters: Sequence[Address], demands: Sequence[BytesLike]) -> bytes: ...
    def decode(self, demand_bytes: BytesLike) -> DecodedAllArbiterDemandData: ...

class AnyArbiter:
    def address(self) -> Address: ...
    @staticmethod
    def encode(arbiters: Sequence[Address], demands: Sequence[BytesLike]) -> bytes: ...
    def decode(self, demand_bytes: BytesLike) -> DecodedAnyArbiterDemandData: ...

class _ConfirmationArbiter:
    def address(self) -> Address: ...
    def confirm(self, fulfillment: Uid, escrow: Uid) -> Awaitable[HexStr]: ...
    def request_confirmation(self, fulfillment: Uid, escrow: Uid) -> Awaitable[HexStr]: ...
    def is_confirmed(self, fulfillment: Uid, escrow: Uid) -> Awaitable[bool]: ...
    def wait_for_confirmation(self, fulfillment: Uid, escrow: Uid, from_block: int) -> Awaitable[Any]: ...
    def wait_for_confirmation_request(self, fulfillment: Uid, confirmer: Address, escrow: Uid, from_block: int) -> Awaitable[Any]: ...

class _RevocableConfirmationArbiter(_ConfirmationArbiter):
    def revoke(self, fulfillment: Uid, escrow: Uid) -> Awaitable[HexStr]: ...

class _Logical:
    all: AllArbiter
    any: AnyArbiter
    def all_address(self) -> Address: ...
    def any_address(self) -> Address: ...

class _AttestationProperties:
    attester: _PropertyArbiter
    expiration_time_after: _PropertyArbiter
    expiration_time_before: _PropertyArbiter
    expiration_time_equal: _PropertyArbiter
    recipient: _PropertyArbiter
    ref_uid: _PropertyArbiter
    revocable: _PropertyArbiter
    schema: _PropertyArbiter
    time_after: _PropertyArbiter
    time_before: _PropertyArbiter
    time_equal: _PropertyArbiter
    uid: _PropertyArbiter

class _Confirmation:
    exclusive_revocable: _RevocableConfirmationArbiter
    exclusive_unrevocable: _ConfirmationArbiter
    nonexclusive_revocable: _RevocableConfirmationArbiter
    nonexclusive_unrevocable: _ConfirmationArbiter
    def address(self, arbiter_type: Any) -> Address: ...
    def address_for(self, exclusive: bool, revocable: bool) -> Address: ...

class ArbitersClient:
    trusted_oracle: OracleClient
    logical: _Logical
    confirmation: _Confirmation
    attestation_properties: _AttestationProperties
    def check(self, arbiter: Address, fulfillment: Uid, demand: BytesLike, escrow_uid: Uid) -> Awaitable[bool]: ...
    def eas_address(self) -> Address: ...
    def trivial_arbiter_address(self) -> Address: ...
    def trusted_oracle_arbiter_address(self) -> Address: ...
    def intrinsics_arbiter_address(self) -> Address: ...
    def erc8004_arbiter_address(self) -> Address: ...
    def any_arbiter_address(self) -> Address: ...
    def all_arbiter_address(self) -> Address: ...
    def confirmation_arbiter_address(self, arbiter_type: Any) -> Address: ...

class AlkahestClient:
    erc20: _TokenClient
    erc721: _TokenClient
    erc1155: _TokenClient
    native_token: _NativeTokenClient
    token_bundle: _TokenClient
    hook_based: HookBasedClient
    splitters: SplittersClient
    attestation: _AttestationClient
    string_obligation: StringObligationClient
    commit_reveal: CommitRevealObligationClient
    oracle: OracleClient
    arbiters: ArbitersClient
    def __init__(self, private_key: str, rpc_url: str, address_config: DefaultExtensionConfig | None = None, poll_interval_seconds: float | None = None) -> None: ...
    def list_extensions(self) -> list[str]: ...
    def has_extension(self, extension_type: str) -> bool: ...
    def extract_obligation_data(self, attestation: Attestation | OracleAttestation) -> str: ...
    def extract_demand_data(self, escrow_attestation: Attestation | OracleAttestation) -> TrustedOracleArbiterDemandData: ...
    def get_escrow_attestation(self, fulfillment: Attestation | OracleAttestation) -> Awaitable[OracleAttestation]: ...
    def get_escrow_and_demand(self, fulfillment: Attestation | OracleAttestation) -> Awaitable[tuple[OracleAttestation, TrustedOracleArbiterDemandData]]: ...
    def wait_for_fulfillment(self, contract_address: Address, buy_attestation: Uid, from_block: int | None = None) -> Awaitable[Any]: ...

DecodedAttestation: TypeAlias = Any

def create_decoders_from_addresses(addresses_or_config: ArbitersAddresses | DefaultExtensionConfig, extra_decoders: Mapping[Address, Callable[[bytes], Any]] | None = None) -> dict[Address, Callable[[bytes], Any]]: ...
def decode_demand_tree(arbiter: Address, demand: BytesLike, decoders: Mapping[Address, Callable[[bytes], Any]]) -> Any: ...
