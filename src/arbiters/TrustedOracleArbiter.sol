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
        bytes32 indexed obligation,
        address indexed oracle,
        bool decision
    );
    event ArbitrationRequested(
        bytes32 indexed obligation,
        address indexed oracle
    );

    error UnauthorizedArbitrationRequest();

    IEAS eas;
    mapping(address => mapping(bytes32 => bool)) internal decisions;

    constructor(IEAS _eas) {
        eas = _eas;
    }

    function arbitrate(bytes32 obligation, bool decision) public {
        decisions[msg.sender][obligation] = decision;
        emit ArbitrationMade(obligation, msg.sender, decision);
    }

    function requestArbitration(bytes32 _obligation, address oracle) public {
        Attestation memory obligation = eas.getAttestation(_obligation);
        if (
            obligation.attester != msg.sender &&
            obligation.recipient != msg.sender
        ) revert UnauthorizedArbitrationRequest();

        emit ArbitrationRequested(_obligation, oracle);
    }

    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 /*counteroffer*/
    ) public view virtual override returns (bool) {
        DemandData memory demand_ = abi.decode(demand, (DemandData));
        return decisions[demand_.oracle][obligation.uid];
    }

    function decodeDemandData(
        bytes calldata data
    ) public pure returns (DemandData memory) {
        return abi.decode(data, (DemandData));
    }
}
