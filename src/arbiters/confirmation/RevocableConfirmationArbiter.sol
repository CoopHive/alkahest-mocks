// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {IArbiter} from "../../IArbiter.sol";
import {ArbiterUtils} from "../../ArbiterUtils.sol";

contract RevocableConfirmationArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    event ConfirmationMade(bytes32 indexed statement, bytes32 indexed counteroffer);
    event ConfirmationRequested(
        bytes32 indexed statement,
        address indexed confirmer,
        bytes32 indexed counteroffer
    );
    event ConfirmationRevoked(bytes32 indexed statement, bytes32 indexed counteroffer);

    error UnauthorizedConfirmationRequest();
    error UnauthorizedConfirmation();
    error UnauthorizedRevocation();
    error NoConfirmationToRevoke();
    error AnotherStatementAlreadyConfirmed();

    IEAS public immutable eas;
    mapping(bytes32 => bool) public confirmations;
    mapping(bytes32 => bytes32) public counterofferToStatement;

    constructor(IEAS _eas) {
        eas = _eas;
    }

    function confirm(bytes32 _statement) public {
        Attestation memory statement = eas.getAttestation(_statement);
        bytes32 counterofferId = statement.refUID;
        Attestation memory counteroffer = eas.getAttestation(counterofferId);
        
        if (counteroffer.recipient != msg.sender) {
            revert UnauthorizedConfirmation();
        }
        
        // If another statement is already confirmed for this counteroffer, revert
        if (counterofferToStatement[counterofferId] != bytes32(0) && 
            counterofferToStatement[counterofferId] != _statement) {
            revert AnotherStatementAlreadyConfirmed();
        }

        confirmations[statement.uid] = true;
        counterofferToStatement[counterofferId] = _statement;
        
        emit ConfirmationMade(_statement, counteroffer.uid);
    }

    function revoke(bytes32 _statement) public {
        Attestation memory statement = eas.getAttestation(_statement);
        bytes32 counterofferId = statement.refUID;
        Attestation memory counteroffer = eas.getAttestation(counterofferId);
        
        if (counteroffer.recipient != msg.sender) {
            revert UnauthorizedRevocation();
        }
        
        if (!confirmations[_statement] || counterofferToStatement[counterofferId] != _statement) {
            revert NoConfirmationToRevoke();
        }

        confirmations[_statement] = false;
        counterofferToStatement[counterofferId] = bytes32(0);
        
        emit ConfirmationRevoked(_statement, counteroffer.uid);
    }

    function requestConfirmation(bytes32 _statement) public {
        Attestation memory statement = eas.getAttestation(_statement);
        if (
            statement.attester != msg.sender &&
            statement.recipient != msg.sender
        ) revert UnauthorizedConfirmationRequest();

        Attestation memory counteroffer = eas.getAttestation(statement.refUID);

        emit ConfirmationRequested(_statement, counteroffer.recipient, counteroffer.uid);
    }

    function checkStatement(
        Attestation memory statement,
        bytes memory /*demand*/,
        bytes32 /*counteroffer*/
    ) public view override returns (bool) {
        return confirmations[statement.uid];
    }
}