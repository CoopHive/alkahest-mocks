// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {IArbiter} from "../../IArbiter.sol";
import {ArbiterUtils} from "../../ArbiterUtils.sol";

contract ConfirmationArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    event ConfirmationMade(bytes32 indexed obligation);
    event ConfirmationRequested(
        bytes32 indexed obligation,
        address indexed confirmer
    );

    error UnauthorizedConfirmationRequest();
    error UnauthorizedConfirmation();

    IEAS eas;
    mapping(bytes32 => bool) confirmations;

    constructor(IEAS _eas) {
        eas = _eas;
    }

    function confirm(bytes32 _obligation) public {
        Attestation memory obligation = eas.getAttestation(_obligation);
        Attestation memory counteroffer = eas.getAttestation(obligation.refUID);
        if (counteroffer.recipient != msg.sender)
            revert UnauthorizedConfirmation();

        confirmations[obligation.uid] = true;
        emit ConfirmationMade(_obligation);
    }

    function requestConfirmation(bytes32 _obligation) public {
        Attestation memory obligation = eas.getAttestation(_obligation);
        if (
            obligation.attester != msg.sender &&
            obligation.recipient != msg.sender
        ) revert UnauthorizedConfirmationRequest();

        Attestation memory counteroffer = eas.getAttestation(obligation.refUID);

        emit ConfirmationRequested(_obligation, counteroffer.recipient);
    }

    function checkObligation(
        Attestation memory obligation,
        bytes memory /*demand*/,
        bytes32 /*counteroffer*/
    ) public view override returns (bool) {
        return confirmations[obligation.uid];
    }
}
