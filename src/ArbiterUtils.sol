// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";

library ArbiterUtils {
    error DeadlineExpired();
    error AttestationRevoked();
    error InvalidSchema();

    function _checkExpired(
        Attestation memory statement
    ) internal view returns (bool) {
        return
            statement.expirationTime != 0 &&
            statement.expirationTime < block.timestamp;
    }

    function _checkRevoked(
        Attestation memory statement
    ) internal pure returns (bool) {
        return statement.revocationTime != 0;
    }

    function _checkIntrinsic(
        Attestation memory statement
    ) internal view returns (bool) {
        if (_checkExpired(statement)) revert DeadlineExpired();
        if (_checkRevoked(statement)) revert AttestationRevoked();

        return true;
    }

    function _checkIntrinsic(
        Attestation memory statement,
        bytes32 schema
    ) internal view returns (bool) {
        if (statement.schema != schema) revert InvalidSchema();
        return _checkIntrinsic(statement);
    }
}
