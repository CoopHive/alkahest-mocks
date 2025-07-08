// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract TrustedOracleArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    struct DemandData {
        address oracle;
        bytes data;
    }

    event ArbitrationMade(
        bytes32 indexed statement,
        address indexed oracle,
        bool decision
    );
    event ArbitrationRequested(
        bytes32 indexed statement,
        address indexed oracle
    );

    error UnauthorizedArbitrationRequest();

    IEAS eas;
    mapping(address => mapping(bytes32 => bool)) decisions;

    constructor(IEAS _eas) {
        eas = _eas;
    }

    function arbitrate(bytes32 statement, bool decision) public {
        decisions[msg.sender][statement] = decision;
        emit ArbitrationMade(statement, msg.sender, decision);
    }

    function requestArbitration(bytes32 _statement, address oracle) public {
        Attestation memory statement = eas.getAttestation(_statement);
        if (
            statement.attester != msg.sender &&
            statement.recipient != msg.sender
        ) revert UnauthorizedArbitrationRequest();

        emit ArbitrationRequested(_statement, oracle);
    }

    function checkObligation(
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
