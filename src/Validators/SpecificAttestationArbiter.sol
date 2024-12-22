// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../IArbiter.sol";

contract SpecificAttestationArbiter is IArbiter {
    struct DemandData {
        bytes32 uid;
    }

    error NotDemandedAttestation();

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 /* counteroffer */
    ) public pure override returns (bool) {
        DemandData memory demand_ = abi.decode(demand, (DemandData));
        if (statement.uid != demand_.uid) revert NotDemandedAttestation();
        return true;
    }
}