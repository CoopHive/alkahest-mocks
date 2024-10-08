// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract TrustedPartyArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    struct DemandData {
        address recipient;
        address baseArbiter;
        bytes baseDemand;
    }

    error IncompatibleStatement();
    error NotTrustedParty();

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 counteroffer
    ) public view override returns (bool) {
        DemandData memory demand_ = abi.decode(demand, (DemandData));
        // implement custom checks here.
        // early revert with custom errors is recommended on failure.
        // remember that utility checks are available in IArbiter
        // ...
        if (statement.recipient != demand_.recipient) revert NotTrustedParty();

        return
            IArbiter(demand_.baseArbiter).checkStatement(
                statement,
                demand_.baseDemand,
                counteroffer
            );
    }
}
