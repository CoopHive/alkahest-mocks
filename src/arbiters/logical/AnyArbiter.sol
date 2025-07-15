// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../../IArbiter.sol";
import {ArbiterUtils} from "../../ArbiterUtils.sol";

contract AnyArbiter is IArbiter {
    // validates any base arbiter arbitrates true
    struct DemandData {
        address[] arbiters;
        bytes[] demands;
    }

    error MismatchedArrayLengths();

    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 counteroffer
    ) public view override returns (bool) {
        DemandData memory demand_ = abi.decode(demand, (DemandData));
        if (demand_.arbiters.length != demand_.demands.length)
            revert MismatchedArrayLengths();

        for (uint256 i = 0; i < demand_.arbiters.length; i++) {
            try
                // can throw, since some arbiters throw with failure case instead of returning false
                IArbiter(demand_.arbiters[i]).checkObligation(
                    obligation,
                    demand_.demands[i],
                    counteroffer
                )
            returns (bool result) {
                if (result) {
                    return true;
                }
            } catch {
                // ignore base errors, since future arbiter might pass
                continue;
            }
        }
        return false;
    }

    function decodeDemandData(
        bytes calldata data
    ) public pure returns (DemandData memory) {
        return abi.decode(data, (DemandData));
    }
}
