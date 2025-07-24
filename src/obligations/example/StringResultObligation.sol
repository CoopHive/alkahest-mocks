// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseObligation} from "../../BaseObligation.sol";
import {IArbiter} from "../../IArbiter.sol";
import {ArbiterUtils} from "../../ArbiterUtils.sol";

contract StringResultObligation is BaseObligation, IArbiter {
    using ArbiterUtils for Attestation;

    struct ObligationData {
        string result;
    }

    struct DemandData {
        string query;
    }

    error InvalidResultAttestation();
    error InvalidDemand();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    ) BaseObligation(_eas, _schemaRegistry, "string result", true) {}

    function doObligation(
        ObligationData calldata data,
        bytes32 refUID
    ) public returns (bytes32) {
        bytes memory encodedData = abi.encode(data);
        return
            this.doObligationForRaw(
                encodedData,
                0,
                msg.sender,
                msg.sender,
                refUID
            );
    }

    function checkObligation(
        Attestation memory obligation,
        bytes memory demand /* (string query) */,
        bytes32 counteroffer
    ) public view override returns (bool) {
        if (!obligation._checkIntrinsic()) return false;

        // Check if the obligation is intended to fulfill the specific counteroffer
        if (
            obligation.refUID != bytes32(0) && obligation.refUID != counteroffer
        ) return false;

        ObligationData memory result = abi.decode(
            obligation.data,
            (ObligationData)
        );
        DemandData memory demandData = abi.decode(demand, (DemandData));

        // Only compare the length of the query and result
        return bytes(demandData.query).length == bytes(result.result).length;
    }
}
