// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract TrustedPartyArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    struct DemandData {
        address creator;
        address baseArbiter;
        bytes baseDemand;
    }

    error NotTrustedParty();

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 counteroffer
    ) public view override returns (bool) {
        DemandData memory demand_ = abi.decode(demand, (DemandData));
        if (statement.recipient != demand_.creator) revert NotTrustedParty();

        return
            IArbiter(demand_.baseArbiter).checkStatement(
                statement,
                demand_.baseDemand,
                counteroffer
            );
    }
}
