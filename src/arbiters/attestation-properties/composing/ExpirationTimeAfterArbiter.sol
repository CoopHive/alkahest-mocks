// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../../../IArbiter.sol";
import {ArbiterUtils} from "../../../ArbiterUtils.sol";

contract ExpirationTimeAfterArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    struct DemandData {
        address baseArbiter;
        bytes baseDemand;
        uint64 expirationTime;
    }

    error ExpirationTimeNotAfter();

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 counteroffer
    ) public view override returns (bool) {
        DemandData memory demand_ = abi.decode(demand, (DemandData));
        if (statement.expirationTime < demand_.expirationTime)
            revert ExpirationTimeNotAfter();

        return
            IArbiter(demand_.baseArbiter).checkStatement(
                statement,
                demand_.baseDemand,
                counteroffer
            );
    }

    function decodeDemandData(
        bytes calldata data
    ) public pure returns (DemandData memory) {
        return abi.decode(data, (DemandData));
    }
}
