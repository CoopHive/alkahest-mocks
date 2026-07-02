// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseObligation} from "../BaseObligation.sol";

/// @title StringObligation
/// @notice Records an arbitrary string payload and schema tag as an EAS obligation attestation.
contract StringObligation is BaseObligation {
    /// @notice String payload and application-level schema tag.
    struct ObligationData {
        string item;
        bytes32 schema;
    }

    /// @param _eas EAS contract used to create and read obligation attestations.
    /// @param _schemaRegistry EAS schema registry used to register or reuse the string schema.
    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        BaseObligation(_eas, _schemaRegistry, "string item, bytes32 schema", false)
    {}

    /// @notice Creates a string obligation attestation for the caller.
    function doObligation(ObligationData calldata data, bytes32 refUID) public returns (bytes32 uid_) {
        bytes memory encodedData = abi.encode(data);
        uid_ = _doObligationForRaw(encodedData, 0, msg.sender, refUID);
    }

    /// @notice Loads and decodes string obligation data from this contract's attestation.
    function getObligationData(bytes32 uid) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    /// @notice Decodes ABI-encoded string obligation data.
    function decodeObligationData(bytes calldata data) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
