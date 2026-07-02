// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {BaseAttester} from "../BaseAttester.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title BaseObligation
/// @notice Base implementation for contracts that create EAS attestations representing fulfilled obligations.
/// @dev Child contracts customize behavior by overriding `_beforeAttest` and `_afterAttest`.
abstract contract BaseObligation is BaseAttester, ReentrancyGuard {
    /// @param _eas EAS contract used to create and read attestations.
    /// @param _schemaRegistry EAS schema registry used to register or reuse `schema`.
    /// @param schema Human-readable EAS schema string for this obligation.
    /// @param revocable Whether attestations created under `schema` are revocable.
    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry, string memory schema, bool revocable)
        BaseAttester(_eas, _schemaRegistry, schema, revocable)
    {}

    /// @notice Creates an obligation attestation from pre-encoded data.
    /// @param data ABI-encoded obligation data.
    /// @param expirationTime EAS expiration timestamp, or zero for no expiration.
    /// @param refUID Reference UID stored on the EAS attestation.
    function doObligationRaw(bytes calldata data, uint64 expirationTime, bytes32 refUID)
        public
        payable
        virtual
        returns (bytes32 uid_)
    {
        uid_ = _doObligationForRaw(data, expirationTime, msg.sender, refUID);
    }

    /// @notice Creates an obligation attestation for an explicit recipient.
    /// @param data ABI-encoded obligation data.
    /// @param expirationTime EAS expiration timestamp, or zero for no expiration.
    /// @param recipient Recipient stored on the EAS attestation.
    /// @param refUID Reference UID stored on the EAS attestation.
    function _doObligationForRaw(bytes memory data, uint64 expirationTime, address recipient, bytes32 refUID)
        internal
        virtual
        nonReentrant
        returns (bytes32 uid_)
    {
        _beforeAttest(data, msg.sender, recipient);
        uid_ = _attest(data, recipient, expirationTime, refUID);
        _afterAttest(
            Attestation({
                uid: uid_,
                schema: ATTESTATION_SCHEMA,
                time: uint64(block.timestamp),
                expirationTime: expirationTime,
                revocationTime: 0,
                refUID: refUID,
                recipient: recipient,
                attester: address(this),
                revocable: ATTESTATION_SCHEMA_REVOCABLE,
                data: data
            })
        );
    }

    /// @notice Hook called before the EAS attestation is created.
    /// @param data ABI-encoded obligation data.
    /// @param payer Address paying for or supplying value to the obligation.
    /// @param recipient Recipient that will be stored on the attestation.
    function _beforeAttest(bytes memory data, address payer, address recipient) internal virtual {}

    /// @notice Hook called after the EAS attestation has been created.
    /// @param attestation Full attestation context reconstructed from the creation call.
    function _afterAttest(Attestation memory attestation) internal virtual {}
}
