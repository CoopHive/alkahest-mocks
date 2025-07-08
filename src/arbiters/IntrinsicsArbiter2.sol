// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract IntrinsicsArbiter2 is IArbiter {
    // validates attestation is not expired, not revoked, and has correct schema
    using ArbiterUtils for Attestation;

    struct DemandData {
        bytes32 schema;
    }

    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 /*counteroffer*/
    ) public view override returns (bool) {
        DemandData memory demand_ = abi.decode(demand, (DemandData));
        return obligation._checkIntrinsic(demand_.schema);
    }

    function decodeDemandData(
        bytes calldata data
    ) public pure returns (DemandData memory) {
        return abi.decode(data, (DemandData));
    }
}
