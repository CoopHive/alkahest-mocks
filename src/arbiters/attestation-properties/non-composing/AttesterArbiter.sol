// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../../../IArbiter.sol";
import {ArbiterUtils} from "../../../ArbiterUtils.sol";

contract AttesterArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    struct DemandData {
        address attester;
    }

    error AttesterMismatched();

    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 /*counteroffer*/
    ) public pure override returns (bool) {
        DemandData memory demand_ = abi.decode(demand, (DemandData));
        if (obligation.attester != demand_.attester) revert AttesterMismatched();

        return true;
    }

    function decodeDemandData(
        bytes calldata data
    ) public pure returns (DemandData memory) {
        return abi.decode(data, (DemandData));
    }
}
