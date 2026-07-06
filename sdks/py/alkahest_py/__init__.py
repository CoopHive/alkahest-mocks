"""
Alkahest Python bindings for ERC20, ERC721, ERC1155, and token bundle operations.
"""

from .alkahest_py import (
    PyAlkahestClient as AlkahestClient,
    EnvTestManager as EnvTestManager,
    PyMockERC20 as MockERC20,
    PyMockERC721 as MockERC721,
    PyMockERC1155 as MockERC1155,
    PyWalletProvider as WalletProvider,
    PyERC20EscrowObligationData as ERC20EscrowObligationData,
    PyERC20PaymentObligationData as ERC20PaymentObligationData,
    PyERC721EscrowObligationData as ERC721EscrowObligationData,
    PyERC721PaymentObligationData as ERC721PaymentObligationData,
    PyERC1155EscrowObligationData as ERC1155EscrowObligationData,
    PyERC1155PaymentObligationData as ERC1155PaymentObligationData,
    PyNativeTokenEscrowObligationData as NativeTokenEscrowObligationData,
    PyNativeTokenPaymentObligationData as NativeTokenPaymentObligationData,
    PyTokenBundleEscrowObligationData as TokenBundleEscrowObligationData,
    PyTokenBundlePaymentObligationData as TokenBundlePaymentObligationData,
    PyAttestationEscrowObligationData as AttestationEscrowObligationData,
    PyAttestationReferenceEscrowObligationData as AttestationReferenceEscrowObligationData,
    HookBasedClient,
    PyAmountHookData as AmountHookData,
    PyTokenIdHookData as TokenIdHookData,
    PyErc1155HookData as Erc1155HookData,
    PyNativeTokenHookData as NativeTokenHookData,
    PyAttestationHookData as AttestationHookData,
    PyAttestationReferenceHookData as AttestationReferenceHookData,
    PyHookEscrowObligationData as HookEscrowObligationData,
    PyHooksEscrowObligationData as HooksEscrowObligationData,
    SplittersClient,
    PySplitterDemandData as SplitterDemandData,
    PyAmountSplit as AmountSplit,
    PyBundleSplit as BundleSplit,
    StringObligationClient,
    PyStringObligationData as StringObligationData,
    CommitRevealObligationClient,
    PyCommitRevealObligationData as CommitRevealObligationData,
    PyCommitRevealDemandData as CommitRevealDemandData,
    OracleClient,
    PyOracleAddresses as OracleAddresses,
    PyOracleAttestation as OracleAttestation,
    PyDecision as Decision,
    PyArbitrationMode as ArbitrationMode,
    ArbitersClient,
    AllArbiter,
    AnyArbiter,
    AllArbiterDemandData,
    AnyArbiterDemandData,
    # Arbiter DemandData types
    PyTrustedOracleArbiterDemandData as TrustedOracleArbiterDemandData,
    PyCommitmentTrustedOracleArbiterDemandData as CommitmentTrustedOracleArbiterDemandData,
    ERC8004ArbiterDemandData as ERC8004ArbiterDemandData,
    AttesterArbiterDemandData as AttesterArbiterDemandData,
    RecipientArbiterDemandData as RecipientArbiterDemandData,
    SchemaArbiterDemandData as SchemaArbiterDemandData,
    UidArbiterDemandData as UidArbiterDemandData,
    RefUidArbiterDemandData as RefUidArbiterDemandData,
    RevocableArbiterDemandData as RevocableArbiterDemandData,
    TimeAfterArbiterDemandData as TimeAfterArbiterDemandData,
    TimeBeforeArbiterDemandData as TimeBeforeArbiterDemandData,
    TimeEqualArbiterDemandData as TimeEqualArbiterDemandData,
    ExpirationTimeAfterArbiterDemandData as ExpirationTimeAfterArbiterDemandData,
    ExpirationTimeBeforeArbiterDemandData as ExpirationTimeBeforeArbiterDemandData,
    ExpirationTimeEqualArbiterDemandData as ExpirationTimeEqualArbiterDemandData,
    PyDecodedAllArbiterDemandData as DecodedAllArbiterDemandData,
    PyDecodedAnyArbiterDemandData as DecodedAnyArbiterDemandData,
    PyDecodedDemand as DecodedDemand,
    PyErc20Data as Erc20Data,
    # Address Configuration Classes
    PyErc20Addresses as Erc20Addresses,
    PyErc721Addresses as Erc721Addresses,
    PyErc1155Addresses as Erc1155Addresses,
    PyNativeTokenAddresses as NativeTokenAddresses,
    PyTokenBundleAddresses as TokenBundleAddresses,
    PyHookBasedAddresses as HookBasedAddresses,
    PySplittersAddresses as SplittersAddresses,
    PyAttestationAddresses as AttestationAddresses,
    PyStringObligationAddresses as StringObligationAddresses,
    PyCommitRevealObligationAddresses as CommitRevealObligationAddresses,
    PyArbitersAddresses as ArbitersAddresses,
    PyDefaultExtensionConfig as DefaultExtensionConfig,
    # IEAS Types
    PyAttestation as Attestation,
    PyAttestationRequest as AttestationRequest,
    PyAttestationRequestData as AttestationRequestData,
    PyAttested as Attested,
    PyRevocationRequest as RevocationRequest,
    PyRevocationRequestData as RevocationRequestData,
    PyRevoked as Revoked,
    PyTimestamped as Timestamped,
)

__all__ = [
    "AlkahestClient",
    "EnvTestManager", 
    "MockERC20",
    "MockERC721",
    "MockERC1155",
    "WalletProvider",
    "ERC20EscrowObligationData",
    "ERC20PaymentObligationData",
    "ERC721EscrowObligationData",
    "ERC721PaymentObligationData",
    "ERC1155EscrowObligationData",
    "ERC1155PaymentObligationData",
    "NativeTokenEscrowObligationData",
    "NativeTokenPaymentObligationData",
    "TokenBundleEscrowObligationData",
    "TokenBundlePaymentObligationData",
    "AttestationEscrowObligationData",
    "AttestationReferenceEscrowObligationData",
    "HookBasedClient",
    "AmountHookData",
    "TokenIdHookData",
    "Erc1155HookData",
    "NativeTokenHookData",
    "AttestationHookData",
    "AttestationReferenceHookData",
    "HookEscrowObligationData",
    "HooksEscrowObligationData",
    "SplittersClient",
    "SplitterDemandData",
    "AmountSplit",
    "BundleSplit",
    "StringObligationClient",
    "StringObligationData",
    "CommitRevealObligationClient",
    "CommitRevealObligationData",
    "CommitRevealDemandData",
    "DecodedAttestation",
    "OracleClient",
    "OracleAddresses",
    "OracleAttestation",
    "Decision",
    "ArbitrationMode",
    "ArbitersClient",
    "AllArbiter",
    "AnyArbiter",
    "AllArbiterDemandData",
    "AnyArbiterDemandData",
    # Arbiter DemandData types
    "TrustedOracleArbiterDemandData",
    "CommitmentTrustedOracleArbiterDemandData",
    "ERC8004ArbiterDemandData",
    "AttesterArbiterDemandData",
    "RecipientArbiterDemandData",
    "SchemaArbiterDemandData",
    "UidArbiterDemandData",
    "RefUidArbiterDemandData",
    "RevocableArbiterDemandData",
    "TimeAfterArbiterDemandData",
    "TimeBeforeArbiterDemandData",
    "TimeEqualArbiterDemandData",
    "ExpirationTimeAfterArbiterDemandData",
    "ExpirationTimeBeforeArbiterDemandData",
    "ExpirationTimeEqualArbiterDemandData",
    "DecodedAllArbiterDemandData",
    "DecodedAnyArbiterDemandData",
    "DecodedDemand",
    "Erc20Data",
    # Address Configuration Classes
    "Erc20Addresses",
    "Erc721Addresses", 
    "Erc1155Addresses",
    "NativeTokenAddresses",
    "TokenBundleAddresses",
    "HookBasedAddresses",
    "SplittersAddresses",
    "AttestationAddresses",
    "StringObligationAddresses",
    "CommitRevealObligationAddresses",
    "ArbitersAddresses",
    "DefaultExtensionConfig",
    # IEAS Types
    "Attestation",
    "AttestationRequest",
    "AttestationRequestData",
    "Attested",
    "RevocationRequest",
    "RevocationRequestData",
    "Revoked",
    "Timestamped",
]


def _normalize_address(address):
    if not isinstance(address, str):
        raise TypeError(f"address must be a string, got {type(address).__name__}")
    return address.lower()


def _object_to_dict(value):
    if isinstance(value, dict):
        return value
    result = {}
    for name in dir(value):
        if name.startswith("_"):
            continue
        attr = getattr(value, name)
        if callable(attr):
            continue
        result[name] = attr
    return result


def _decode_logical_demand(demand_data_cls, demand):
    decoded = demand_data_cls.decode(demand)
    return {
        "arbiters": list(decoded.arbiters),
        "demands": [bytes(d) for d in decoded.demands],
        "children": [
            {"arbiter": arbiter, "demand": bytes(child_demand)}
            for arbiter, child_demand in zip(decoded.arbiters, decoded.demands)
        ],
    }


def _decode_with_class(demand_data_cls):
    def _decoder(demand):
        return _object_to_dict(demand_data_cls.decode(demand))

    return _decoder


def _address_section(addresses_or_config):
    return getattr(addresses_or_config, "arbiters_addresses", None) or addresses_or_config


def create_decoders_from_addresses(addresses_or_config, extra_decoders=None):
    """Create a recursive demand-decoder registry from deployed addresses.

    ``addresses_or_config`` may be an ``ArbitersAddresses`` instance or a
    ``DefaultExtensionConfig`` with ``arbiters_addresses`` set. ``extra_decoders``
    is an optional ``{address: callable}`` mapping for extension arbiters. Each
    decoder receives raw demand bytes and returns either a decoded object/dict or
    a dict containing ``children`` entries shaped as ``{"arbiter": ..., "demand": ...}``.
    """

    addresses = _address_section(addresses_or_config)
    decoders = {}

    def add(field, decoder):
        address = getattr(addresses, field, None)
        if address:
            decoders[_normalize_address(address)] = decoder

    add("all_arbiter", lambda demand: _decode_logical_demand(AllArbiterDemandData, demand))
    add("any_arbiter", lambda demand: _decode_logical_demand(AnyArbiterDemandData, demand))
    add("trusted_oracle_arbiter", _decode_with_class(TrustedOracleArbiterDemandData))
    add("erc8004_arbiter", _decode_with_class(ERC8004ArbiterDemandData))
    add("attester_arbiter", _decode_with_class(AttesterArbiterDemandData))
    add("expiration_time_after_arbiter", _decode_with_class(ExpirationTimeAfterArbiterDemandData))
    add("expiration_time_before_arbiter", _decode_with_class(ExpirationTimeBeforeArbiterDemandData))
    add("expiration_time_equal_arbiter", _decode_with_class(ExpirationTimeEqualArbiterDemandData))
    add("recipient_arbiter", _decode_with_class(RecipientArbiterDemandData))
    add("ref_uid_arbiter", _decode_with_class(RefUidArbiterDemandData))
    add("revocable_arbiter", _decode_with_class(RevocableArbiterDemandData))
    add("schema_arbiter", _decode_with_class(SchemaArbiterDemandData))
    add("time_after_arbiter", _decode_with_class(TimeAfterArbiterDemandData))
    add("time_before_arbiter", _decode_with_class(TimeBeforeArbiterDemandData))
    add("time_equal_arbiter", _decode_with_class(TimeEqualArbiterDemandData))
    add("uid_arbiter", _decode_with_class(UidArbiterDemandData))

    for address, decoder in (extra_decoders or {}).items():
        decoders[_normalize_address(address)] = decoder

    return decoders


def decode_demand_tree(arbiter, demand, decoders):
    """Decode one demand recursively using an address-keyed decoder registry."""

    decoder = decoders.get(_normalize_address(arbiter))
    if decoder is None:
        return {
            "arbiter": arbiter,
            "decoded": {"raw": bytes(demand)},
            "is_unknown": True,
        }

    decoded = decoder(demand)
    decoded_dict = _object_to_dict(decoded)
    children = decoded_dict.get("children")
    result = {"arbiter": arbiter, "decoded": decoded_dict}

    if isinstance(children, list):
        result["children"] = [
            decode_demand_tree(child["arbiter"], child["demand"], decoders)
            for child in children
        ]

    return result


__all__.extend([
    "create_decoders_from_addresses",
    "decode_demand_tree",
])
