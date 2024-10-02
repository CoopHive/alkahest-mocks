// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IStatement} from "./IStatement.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";

abstract contract IObligation is IStatement {
    error CantCancel();
    error UnauthorizedCall();
    error MakeFailed();

    bool public immutable CAN_CANCEL;

    function make(
        bytes calldata data,
        uint64 expirationTime,
        bytes32 fulfilling
    ) external returns (bytes32) {
        if (!_make(data, expirationTime, fulfilling)) revert MakeFailed();
        return
            eas.attest(
                AttestationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: AttestationRequestData({
                        recipient: msg.sender,
                        expirationTime: expirationTime,
                        revocable: true,
                        refUID: fulfilling,
                        data: data,
                        value: 0
                    })
                })
            );
    }

    function cancel(bytes32 uid) external returns (bool) {
        if (!CAN_CANCEL) revert CantCancel();
        Attestation memory attestation = eas.getAttestation(uid);
        if (msg.sender != attestation.recipient) revert UnauthorizedCall();
        eas.revoke(
            RevocationRequest({
                schema: ATTESTATION_SCHEMA,
                data: RevocationRequestData({uid: uid, value: 0})
            })
        );
        return _cancel(attestation);
    }

    function _make(
        bytes calldata data,
        uint64 expirationTime,
        bytes32 fulfilling
    ) internal virtual returns (bool);

    function _cancel(
        Attestation memory attestation
    ) internal virtual returns (bool);
}
