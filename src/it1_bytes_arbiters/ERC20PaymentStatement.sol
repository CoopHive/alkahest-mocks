// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Attestation, DeadlineExpired} from "@eas/contracts/Common.sol";

abstract contract IArbiter {
    function _commonChecks(
        Attestation memory statement
    ) internal returns (bool) {
        if (
            statement.expirationTime != 0 &&
            statement.expirationTime < block.timestamp
        ) {
            revert DeadlineExpired();
        }

        if (statement.attester != address(this)) {
            return false;
        }

        return true;
    }

    function checkStatement(
        Attestation calldata statement,
        bytes calldata demand
    ) public view virtual returns (bool) {}
}

contract ERC20PaymentStatement is IArbiter {
    function makeStatement(
        address token,
        uint amount,
        address arbiter,
        bytes calldata demand
    ) public returns (Attestation memory) {}

    function collectPayment(
        Attestation calldata payment,
        Attestation calldata fulfillment
    ) public {}
}
