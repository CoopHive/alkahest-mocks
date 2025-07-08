// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";

library ArbiterUtils {
    error DeadlineExpired();
    error AttestationRevoked();
    error InvalidSchema();

    function _checkExpired(
        Attestation memory obligation
    ) internal view returns (bool) {
        return
            obligation.expirationTime != 0 &&
            obligation.expirationTime < block.timestamp;
    }

    function _checkRevoked(
        Attestation memory obligation
    ) internal pure returns (bool) {
        return obligation.revocationTime != 0;
    }

    function _checkIntrinsic(
        Attestation memory obligation
    ) internal view returns (bool) {
        if (_checkExpired(obligation)) revert DeadlineExpired();
        if (_checkRevoked(obligation)) revert AttestationRevoked();

        return true;
    }

    function _checkIntrinsic(
        Attestation memory obligation,
        bytes32 schema
    ) internal view returns (bool) {
        if (obligation.schema != schema) revert InvalidSchema();
        return _checkIntrinsic(obligation);
    }
}
