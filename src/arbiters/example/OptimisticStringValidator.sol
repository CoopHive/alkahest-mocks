// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IArbiter} from "../../IArbiter.sol";
import {BaseObligation} from "../../BaseObligation.sol";
import {StringResultObligation} from "../../obligations/example/StringResultObligation.sol";
import {ArbiterUtils} from "../../ArbiterUtils.sol";

contract OptimisticStringValidator is BaseObligation, IArbiter {
    using ArbiterUtils for Attestation;

    struct ValidationData {
        string query;
        uint64 mediationPeriod;
    }

    event ValidationStarted(
        bytes32 indexed validationUID,
        bytes32 indexed resultUID,
        string query
    );
    event MediationRequested(bytes32 indexed validationUID, bool success_);

    error InvalidObligation();
    error InvalidValidation();
    error MediationPeriodExpired();

    StringResultObligation public immutable resultObligation;

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry,
        StringResultObligation _baseObligation
    )
        BaseObligation(
            _eas,
            _schemaRegistry,
            "string query, uint64 mediationPeriod",
            true
        )
    {
        resultObligation = _baseObligation;
    }

    function startValidation(
        bytes32 resultUID,
        ValidationData calldata validationData
    ) external returns (bytes32 validationUID_) {
        Attestation memory resultAttestation = eas.getAttestation(resultUID);
        if (resultAttestation.schema != resultObligation.ATTESTATION_SCHEMA())
            revert InvalidObligation();
        if (resultAttestation.revocationTime != 0) revert InvalidObligation();
        if (resultAttestation.recipient != msg.sender)
            revert InvalidObligation();

        validationUID_ = _attest(
            abi.encode(validationData),
            msg.sender,
            0, // no expiration
            resultUID
        );
        emit ValidationStarted(validationUID_, resultUID, validationData.query);
    }

    function mediate(bytes32 validationUID) external returns (bool success_) {
        Attestation memory validation = _getAttestation(validationUID);

        ValidationData memory data = abi.decode(
            validation.data,
            (ValidationData)
        );
        if (block.timestamp > validation.time + data.mediationPeriod)
            revert MediationPeriodExpired();

        Attestation memory resultAttestation = eas.getAttestation(
            validation.refUID
        );
        StringResultObligation.ObligationData memory resultData = abi.decode(
            resultAttestation.data,
            (StringResultObligation.ObligationData)
        );
        success_ = _isCapitalized(data.query, resultData.result);

        if (!success_) {
            eas.revoke(
                RevocationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: RevocationRequestData({uid: validationUID, value: 0})
                })
            );
        }

        emit MediationRequested(validationUID, success_);
    }

    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 counteroffer
    ) public view override returns (bool) {
        if (!obligation._checkIntrinsic()) return false;

        ValidationData memory demandData = abi.decode(demand, (ValidationData));
        ValidationData memory obligationData = abi.decode(
            obligation.data,
            (ValidationData)
        );

        if (
            keccak256(bytes(obligationData.query)) !=
            keccak256(bytes(demandData.query))
        ) return false;
        if (obligationData.mediationPeriod != demandData.mediationPeriod)
            return false;
        if (block.timestamp <= obligation.time + obligationData.mediationPeriod)
            return false;

        return
            resultObligation.checkObligation(
                eas.getAttestation(obligation.refUID),
                abi.encode(
                    StringResultObligation.DemandData({
                        query: obligationData.query
                    })
                ),
                counteroffer
            );
    }

    function _isCapitalized(
        string memory query,
        string memory result
    ) internal pure returns (bool) {
        bytes memory queryBytes = bytes(query);
        bytes memory resultBytes = bytes(result);

        if (queryBytes.length != resultBytes.length) return false;

        for (uint256 i = 0; i < queryBytes.length; i++) {
            if (queryBytes[i] >= 0x61 && queryBytes[i] <= 0x7A) {
                // If lowercase, it should be capitalized in the result
                if (uint8(resultBytes[i]) != uint8(queryBytes[i]) - 32)
                    return false;
            } else {
                // If not lowercase, it should remain the same
                if (resultBytes[i] != queryBytes[i]) return false;
            }
        }

        return true;
    }
}
