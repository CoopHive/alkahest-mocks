// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {IArbiter} from "@src/IArbiter.sol";
import {Attestation} from "@eas/Common.sol";

contract MockArbiter is IArbiter {
    bool private shouldAccept;
    
    constructor(bool _shouldAccept) {
        shouldAccept = _shouldAccept;
    }
    
    function setShouldAccept(bool _shouldAccept) public {
        shouldAccept = _shouldAccept;
    }
    
    function checkStatement(
        Attestation memory, 
        bytes memory, 
        bytes32
    ) public view override returns (bool) {
        return shouldAccept;
    }
}