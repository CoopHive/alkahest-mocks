// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../../IArbiter.sol";
import {ArbiterUtils} from "../../ArbiterUtils.sol";

contract NotArbiter is IArbiter {
    // inverts the result of a base arbiter
    struct DemandData {
        address baseArbiter;
        bytes baseDemand;
    }

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 counteroffer
    ) public view override returns (bool) {
        DemandData memory demand_ = decodeDemandData(demand);
        
        try
            // can throw, since some arbiters throw with failure case instead of returning false
            IArbiter(demand_.baseArbiter).checkStatement(
                statement,
                demand_.baseDemand,
                counteroffer
            )
        returns (bool result) {
            // Invert the result of the base arbiter
            return !result;
        } catch {
            // If the base arbiter reverts, we consider it a failure (returning true)
            return true;
        }
    }

    function decodeDemandData(
        bytes memory data
    ) public pure returns (DemandData memory) {
        return abi.decode(data, (DemandData));
    }
}