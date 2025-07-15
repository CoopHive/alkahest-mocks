// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {IArbiter} from "../../IArbiter.sol";
import {ArbiterUtils} from "../../ArbiterUtils.sol";

contract RevocableConfirmationArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    event ConfirmationMade(bytes32 indexed obligation, bytes32 indexed counteroffer);
    event ConfirmationRequested(
        bytes32 indexed obligation,
        address indexed confirmer,
        bytes32 indexed counteroffer
    );
    event ConfirmationRevoked(bytes32 indexed obligation, bytes32 indexed counteroffer);

    error UnauthorizedConfirmationRequest();
    error UnauthorizedConfirmation();
    error UnauthorizedRevocation();
    error NoConfirmationToRevoke();
    error AnotherObligationAlreadyConfirmed();

    IEAS public immutable eas;
    mapping(bytes32 => bool) public confirmations;
    mapping(bytes32 => bytes32) public counterofferToObligation;

    constructor(IEAS _eas) {
        eas = _eas;
    }

    function confirm(bytes32 _obligation) public {
        Attestation memory obligation = eas.getAttestation(_obligation);
        bytes32 counterofferId = obligation.refUID;
        Attestation memory counteroffer = eas.getAttestation(counterofferId);
        
        if (counteroffer.recipient != msg.sender) {
            revert UnauthorizedConfirmation();
        }
        
        // If another Obligation is already confirmed for this counteroffer, revert
        if (counterofferToObligation[counterofferId] != bytes32(0) && 
            counterofferToObligation[counterofferId] != _obligation) {
            revert AnotherObligationAlreadyConfirmed();
        }

        confirmations[obligation.uid] = true;
        counterofferToObligation[counterofferId] = _obligation;
        
        emit ConfirmationMade(_obligation, counteroffer.uid);
    }

    function revoke(bytes32 _obligation) public {
        Attestation memory obligation = eas.getAttestation(_obligation);
        bytes32 counterofferId = obligation.refUID;
        Attestation memory counteroffer = eas.getAttestation(counterofferId);
        
        if (counteroffer.recipient != msg.sender) {
            revert UnauthorizedRevocation();
        }
        
        if (!confirmations[_obligation] || counterofferToObligation[counterofferId] != _obligation) {
            revert NoConfirmationToRevoke();
        }

        confirmations[_obligation] = false;
        counterofferToObligation[counterofferId] = bytes32(0);
        
        emit ConfirmationRevoked(_obligation, counteroffer.uid);
    }

    function requestConfirmation(bytes32 _obligation) public {
        Attestation memory obligation = eas.getAttestation(_obligation);
        if (
            obligation.attester != msg.sender &&
            obligation.recipient != msg.sender
        ) revert UnauthorizedConfirmationRequest();

        Attestation memory counteroffer = eas.getAttestation(obligation.refUID);

        emit ConfirmationRequested(_obligation, counteroffer.recipient, counteroffer.uid);
    }

    function checkObligation(
        Attestation memory obligation,
        bytes memory /*demand*/,
        bytes32 /*counteroffer*/
    ) public view override returns (bool) {
        return confirmations[obligation.uid];
    }
}