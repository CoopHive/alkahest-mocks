// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;
import {Attestation} from "@eas/Common.sol";

interface IArbiter {
    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 counteroffer
    ) external view returns (bool);
}
