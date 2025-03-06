// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";
import {IEAS} from "@eas/IEAS.sol";

contract TrustedOracleArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    struct DemandData {
        address oracle;
    }

    event ArbitrationMade(
        address indexed oracle,
        bytes32 indexed statement,
        bool decision
    );

    IEAS eas;
    mapping(address => mapping(bytes32 => bool)) decisions;

    constructor(IEAS _eas) {
        eas = _eas;
    }

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
}
