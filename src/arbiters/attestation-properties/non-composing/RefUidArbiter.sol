// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../../../IArbiter.sol";
import {ArbiterUtils} from "../../../ArbiterUtils.sol";

contract RefUidArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    struct DemandData {
        bytes32 refUID;
    }

    error RefUidMismatched();

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 /*counteroffer*/
    ) public pure override returns (bool) {
        DemandData memory demand_ = abi.decode(demand, (DemandData));
        if (statement.refUID != demand_.refUID) revert RefUidMismatched();

        return true;
    }

    function decodeDemandData(
        bytes calldata data
    ) public pure returns (DemandData memory) {
        return abi.decode(data, (DemandData));
    }
}
