// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {BaseObligation} from "../BaseObligation.sol";
import {IArbiter} from "../../IArbiter.sol";
import {IEscrow} from "../../IEscrow.sol";
import {ArbiterUtils} from "../../libraries/ArbiterUtils.sol";
import {Attestation} from "@eas/Common.sol";
import {IEAS, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title BaseEscrowObligationUnconditional
/// @notice Base escrow implementation that delegates fulfillment policy entirely to the configured arbiter.
/// @dev Does not require fulfillment `refUID == escrow.uid` and does not check fulfillment intrinsics by default.
///      Concrete escrow contracts still decide how their own attestations arbitrate by implementing `IArbiter`.
abstract contract BaseEscrowObligationUnconditional is BaseObligation, IEscrow, ERC165 {
    using ArbiterUtils for Attestation;

    /// @notice Raised when the escrow attestation is missing, invalid, expired, revoked, or has the wrong schema.
    error InvalidEscrowAttestation();
    /// @notice Raised when the fulfillment does not satisfy the escrow's configured arbiter.
    error InvalidFulfillment();
    /// @notice Raised when a caller attempts an action that is not currently permitted.
    error UnauthorizedCall();
    /// @notice Raised when EAS has no attestation for the requested UID.
    error AttestationNotFound(bytes32 attestationId);
    /// @notice Raised when revoking the escrow attestation fails during collect or reclaim.
    error RevocationFailed(bytes32 attestationId);

    /// @param _eas EAS contract used to create, read, and revoke escrow attestations.
    /// @param _schemaRegistry EAS schema registry used to register or reuse `schema`.
    /// @param schema Human-readable EAS schema string for the concrete escrow.
    /// @param revocable Whether escrow attestations are revocable.
    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry, string memory schema, bool revocable)
        BaseObligation(_eas, _schemaRegistry, schema, revocable)
    {}

    /// @inheritdoc ERC165
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IEscrow).interfaceId || super.supportsInterface(interfaceId);
    }

    /// @notice Locks escrowed assets before the escrow attestation is created.
    /// @param data ABI-encoded escrow obligation data.
    /// @param from Address supplying escrowed assets.
    function _lockEscrow(bytes memory data, address from) internal virtual;

    /// @notice Releases escrowed assets after arbiter validation succeeds.
    /// @param escrow The escrow attestation being collected.
    /// @param to Recipient of released escrow assets.
    /// @param fulfillmentUid UID of the fulfillment attestation used to collect.
    function _releaseEscrow(Attestation memory escrow, address to, bytes32 fulfillmentUid)
        internal
        virtual
        returns (bytes memory result);

    /// @notice Returns escrowed assets to the escrower during reclaim.
    /// @param escrow The expired escrow attestation being reclaimed.
    /// @param to Recipient of returned escrow assets.
    function _returnEscrow(Attestation memory escrow, address to) internal virtual;

    /// @notice Hook called after EAS creates the escrow attestation and before `EscrowMade` is emitted.
    function _afterEscrowAttest(Attestation memory attestation) internal virtual {}

    /// @inheritdoc IEscrow
    function decodeCondition(bytes memory data)
        public
        pure
        virtual
        override
        returns (address arbiter, bytes memory demand);

    /// @inheritdoc IEscrow
    function collect(bytes32 _escrow, bytes32 _fulfillment)
        public
        virtual
        override
        nonReentrant
        returns (bytes memory)
    {
        Attestation memory escrow = _getExistingAttestation(_escrow);
        Attestation memory fulfillment = _getExistingAttestation(_fulfillment);

        // Validate escrow uses correct schema
        if (escrow.schema != ATTESTATION_SCHEMA) {
            revert InvalidEscrowAttestation();
        }

        if (!escrow._checkIntrinsic()) revert InvalidEscrowAttestation();

        // Extract arbiter and demand from escrow data
        (address arbiter, bytes memory demand) = decodeCondition(escrow.data);

        // UNCONDITIONAL: No fulfillment intrinsic or refUID check
        // Use this when fulfillment policy is fully delegated to arbiters

        // Check fulfillment via the specified arbiter
        if (!IArbiter(arbiter).check(fulfillment, demand, escrow.uid)) {
            revert InvalidFulfillment();
        }

        // Revoke attestation
        try eas.revoke(
            RevocationRequest({schema: ATTESTATION_SCHEMA, data: RevocationRequestData({uid: _escrow, value: 0})})
        ) {}
        catch {
            revert RevocationFailed(_escrow);
        }

        // Execute the escrow release
        bytes memory result = _releaseEscrow(escrow, fulfillment.recipient, _fulfillment);

        emit EscrowCollected(_escrow, _fulfillment, fulfillment.recipient);
        return result;
    }

    /// @inheritdoc IEscrow
    function reclaim(bytes32 uid) public virtual override nonReentrant returns (bool) {
        Attestation memory attestation = _getExistingAttestation(uid);

        // Validate attestation uses correct schema
        if (attestation.schema != ATTESTATION_SCHEMA) {
            revert InvalidEscrowAttestation();
        }

        // Prevent reclaiming non-expiring attestations (expirationTime 0 means never expires)
        if (attestation.expirationTime == 0) revert UnauthorizedCall();

        if (block.timestamp < attestation.expirationTime) {
            revert UnauthorizedCall();
        }

        // Revoke attestation to prevent re-entry
        try eas.revoke(
            RevocationRequest({schema: ATTESTATION_SCHEMA, data: RevocationRequestData({uid: uid, value: 0})})
        ) {}
        catch {
            revert RevocationFailed(uid);
        }

        // Return escrowed value to original recipient
        _returnEscrow(attestation, attestation.recipient);

        emit EscrowReclaimed(uid, attestation.recipient);
        return true;
    }

    /// @notice Loads an attestation from EAS and verifies that the returned UID matches the requested UID.
    /// @param uid UID to load from EAS.
    function _getExistingAttestation(bytes32 uid) internal view returns (Attestation memory attestation) {
        attestation = eas.getAttestation(uid);
        if (attestation.uid == bytes32(0) || attestation.uid != uid) revert AttestationNotFound(uid);
    }

    /// @inheritdoc BaseObligation
    function _beforeAttest(
        bytes memory data,
        address payer,
        address /*recipient*/
    )
        internal
        virtual
        override
    {
        _lockEscrow(data, payer);
    }

    /// @inheritdoc BaseObligation
    function _afterAttest(Attestation memory attestation) internal override {
        _afterEscrowAttest(attestation);
        emit EscrowMade(attestation.uid, attestation.recipient);
    }
}
