// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {SchemaResolver} from "@eas/resolver/SchemaResolver.sol";
import {IEAS, Attestation} from "@eas/IEAS.sol";

contract MockResolver is SchemaResolver {
    constructor(IEAS _eas) SchemaResolver(_eas) {}
    
    function onAttest(
        Attestation calldata /* attestation */,
        uint256 /* value */
    ) internal pure override returns (bool) {
        return true; // Always return true
    }
    
    function onRevoke(
        Attestation calldata /* attestation */,
        uint256 /* value */
    ) internal pure override returns (bool) {
        return true; // Always return true
    }
}