// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../../IArbiter.sol";

contract SpecificAttestationArbiter is IArbiter {
    struct DemandData {
        bytes32 uid;
    }

    error NotDemandedAttestation();

    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 /*counteroffer*/
    ) public pure override returns (bool) {
        DemandData memory demand_ = abi.decode(demand, (DemandData));
        if (obligation.uid != demand_.uid) revert NotDemandedAttestation();
        return true;
    }

    function decodeDemandData(
        bytes calldata data
    ) public pure returns (DemandData memory) {
        return abi.decode(data, (DemandData));
    }
}
