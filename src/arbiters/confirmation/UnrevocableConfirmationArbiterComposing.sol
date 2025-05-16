// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {IArbiter} from "../../IArbiter.sol";
import {ArbiterUtils} from "../../ArbiterUtils.sol";

contract UnrevocableArbiterComposing is IArbiter {
    using ArbiterUtils for Attestation;

    struct DemandData {
        address baseArbiter;
        bytes baseDemand;
    }

    event ConfirmationMade(
        bytes32 indexed statement,
        bytes32 indexed counteroffer
    );
    event ConfirmationRequested(
        bytes32 indexed statement,
        address indexed confirmer,
        bytes32 indexed counteroffer
    );

    error UnauthorizedConfirmationRequest();
    error UnauthorizedConfirmation();
    error CounterOfferAlreadyConfirmed();

    IEAS public immutable eas;
    mapping(bytes32 => bool) public confirmations;
    mapping(bytes32 => bool) public counterofferConfirmed;

    constructor(IEAS _eas) {
        eas = _eas;
    }

    function confirm(bytes32 _statement) public {
        Attestation memory statement = eas.getAttestation(_statement);
        Attestation memory counteroffer = eas.getAttestation(statement.refUID);

        if (counteroffer.recipient != msg.sender) {
            revert UnauthorizedConfirmation();
        }

        if (counterofferConfirmed[counteroffer.uid]) {
            revert CounterOfferAlreadyConfirmed();
        }

        confirmations[statement.uid] = true;
        counterofferConfirmed[counteroffer.uid] = true;

        emit ConfirmationMade(_statement, counteroffer.uid);
    }

    function requestConfirmation(bytes32 _statement) public {
        Attestation memory statement = eas.getAttestation(_statement);
        if (
            statement.attester != msg.sender &&
            statement.recipient != msg.sender
        ) revert UnauthorizedConfirmationRequest();

        Attestation memory counteroffer = eas.getAttestation(statement.refUID);

        emit ConfirmationRequested(
            _statement,
            counteroffer.recipient,
            counteroffer.uid
        );
    }

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 counteroffer
    ) public view override returns (bool) {
        DemandData memory demand_ = abi.decode(demand, (DemandData));

        // First check if the statement is confirmed
        if (!confirmations[statement.uid]) {
            return false;
        }

        // Then delegate to the base arbiter with the base demand
        return
            IArbiter(demand_.baseArbiter).checkStatement(
                statement,
                demand_.baseDemand,
                counteroffer
            );
    }

    function decodeDemandData(
        bytes calldata data
    ) public pure returns (DemandData memory) {
        return abi.decode(data, (DemandData));
    }
}
