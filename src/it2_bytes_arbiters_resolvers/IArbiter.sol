// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation, DeadlineExpired, InvalidEAS} from "@eas/Common.sol";

abstract contract IArbiter {
    bytes32 public attestationSchema;

    function _checkIntrinsic(Attestation calldata statement) internal view returns (bool) {
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

    function _checkIdentical(Attestation calldata statement, bytes calldata demand) public pure returns (bool) {
        return keccak256(statement.data) == keccak256(demand);
    }

    function checkStatement(Attestation calldata statement, bytes calldata demand) public view virtual returns (bool) {}

    function getSchemaAbi() public pure virtual returns (string memory) {}
    function getDemandAbi() public pure virtual returns (string memory) {}
}
