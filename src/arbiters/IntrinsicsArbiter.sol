// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract IntrinsicsArbiter is IArbiter {
    // validates attestation is not expired and not revoked
    using ArbiterUtils for Attestation;

    function checkStatement(
        Attestation memory statement,
        bytes memory /*demand*/,
        bytes32 /*counteroffer*/
    ) public view override returns (bool) {
        return statement._checkIntrinsic();
    }
}
