// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract TrustedOracleArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    struct DemandData {
        address oracle;
        bytes data;
    }

    event ArbitrationMade(
        address indexed oracle,
        bytes32 indexed statement,
        bool decision
    );

    mapping(address => mapping(bytes32 => bool)) decisions;

    function arbitrate(bytes32 statement, bool decision) public {
        decisions[msg.sender][statement] = decision;
        emit ArbitrationMade(msg.sender, statement, decision);
    }

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 /*counteroffer*/
    ) public view override returns (bool) {
        DemandData memory demand_ = abi.decode(demand, (DemandData));
        return decisions[demand_.oracle][statement.uid];
    }

    function decodeDemandData(
        bytes calldata data
    ) public pure returns (DemandData memory) {
        return abi.decode(data, (DemandData));
    }
}
