// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseObligation} from "../BaseObligation.sol";
import {BaseArbiter} from "../../BaseArbiter.sol";
import {IArbiter} from "../../IArbiter.sol";
import {ArbiterUtils} from "../../libraries/ArbiterUtils.sol";

contract StringResultObligation is BaseObligation, BaseArbiter {
    using ArbiterUtils for Attestation;

    struct ObligationData {
        string result;
    }

    struct DemandData {
        string query;
    }

    error InvalidResultAttestation();
    error InvalidDemand();

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        BaseObligation(_eas, _schemaRegistry, "string result", true)
    {}

    function doObligation(ObligationData calldata data, bytes32 refUID) public returns (bytes32) {
        bytes memory encodedData = abi.encode(data);
        return _doObligationForRaw(encodedData, 0, msg.sender, refUID);
    }

    function check(
        Attestation memory fulfillment,
        bytes memory demand,
        /* (string query) */
        bytes32 escrowUid
    )
        public
        view
        override
        returns (bool)
    {
        // Check if the obligation is intended to fulfill the specific escrow
        if (fulfillment.refUID != bytes32(0) && fulfillment.refUID != escrowUid) return false;

        ObligationData memory result = abi.decode(fulfillment.data, (ObligationData));
        DemandData memory demandData = abi.decode(demand, (DemandData));

        // Only compare the length of the query and result
        return bytes(demandData.query).length == bytes(result.result).length;
    }
}
