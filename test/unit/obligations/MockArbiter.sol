// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {IArbiter} from "@src/IArbiter.sol";
import {Attestation} from "@eas/Common.sol";

/**
 * @title MockArbiter
 * @dev A simple mock implementation of the IArbiter interface for testing
 * Can be configured to either accept or reject all obligation validations
 * by setting the shouldAccept flag
 */
contract MockArbiter is IArbiter {
    bool private shouldAccept;
    
    constructor(bool _shouldAccept) {
        shouldAccept = _shouldAccept;
    }
    
    function setShouldAccept(bool _shouldAccept) public {
        shouldAccept = _shouldAccept;
    }
    
    function checkObligation(
        Attestation memory, 
        bytes memory, 
        bytes32
    ) public view override returns (bool) {
        return shouldAccept;
    }
}