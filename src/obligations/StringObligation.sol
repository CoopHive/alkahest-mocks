// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseObligation} from "../BaseObligation.sol";

contract StringObligation is BaseObligation {
    struct ObligationData {
        string item;
    }

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    ) BaseObligation(_eas, _schemaRegistry, "string item", true) {}

    function doObligation(
        ObligationData calldata data,
        bytes32 refUID
    ) public returns (bytes32 uid_) {
        bytes memory encodedData = abi.encode(data);
        uid_ = this.doObligationForRaw(
            encodedData,
            0,
            msg.sender,
            msg.sender,
            refUID
        );
    }

    function getObligationData(
        bytes32 uid
    ) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    function decodeObligationData(
        bytes calldata data
    ) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
