// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Attestation, DeadlineExpired, InvalidEAS} from "lib/eas-contracts/contracts/Common.sol";

abstract contract IArbiter {
    bytes32 public attestationSchema;

    function _checkIntrinsic(Attestation memory statement) internal view returns (bool) {
        // check source
        if (statement.attester != address(this)) {
            return false;
        }
        // check schema
        if (statement.schema != attestationSchema) {
            return false;
        }
        // check expired
        if (statement.expirationTime != 0 && statement.expirationTime < block.timestamp) {
            revert DeadlineExpired();
        }
        // check revoked
        if (statement.revocationTime != 0) {
            revert InvalidEAS();
        }

        return true;
    }

    function checkStatement(Attestation calldata statement, bytes calldata demand) public view virtual returns (bool) {}
}
