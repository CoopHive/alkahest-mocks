// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Attestation} from "lib/eas-contracts/contracts/Common.sol";
import {IArbiter} from "./IArbiter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ERC20PaymentStatement is IArbiter {
    function makeStatement(address token, uint256 amount, address arbiter, bytes calldata demand)
        public
        returns (Attestation memory)
    {}

    function checkStatement(Attestation calldata statement, bytes calldata demand)
        public
        view
        override
        returns (bool)
    {
        if (!_checkIntrinsic(statement)) {
            return false;
        }
        (address token, uint256 amount) = abi.decode(statement.data, (address, uint256));
        (address tokenD, uint256 amountD) = abi.decode(demand, (address, uint256));
        return token == tokenD && amount > amountD;
    }

    function collectPayment(Attestation calldata payment, Attestation calldata fulfillment) public {
        (,, address arbiter, bytes memory demand) = abi.decode(payment.data, (address, uint256, address, bytes));
        require(IArbiter(arbiter).checkStatement(fulfillment, demand), "Invalid fulfillment");
        // transfer payment
    }
}
