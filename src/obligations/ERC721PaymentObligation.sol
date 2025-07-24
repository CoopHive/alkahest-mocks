// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {BaseObligation} from "../BaseObligation.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract ERC721PaymentObligation is BaseObligation, IArbiter {
    using ArbiterUtils for Attestation;

    struct ObligationData {
        address token;
        uint256 tokenId;
        address payee;
    }

    event PaymentMade(bytes32 indexed payment, address indexed buyer);

    error ERC721TransferFailed(
        address token,
        address from,
        address to,
        uint256 tokenId
    );

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseObligation(
            _eas,
            _schemaRegistry,
            "address token, uint256 tokenId, address payee",
            true
        )
    {}

    function doObligation(
        ObligationData calldata data
    ) public returns (bytes32 uid_) {
        bytes memory encodedData = abi.encode(data);
        uid_ = this.doObligationForRaw(
            encodedData,
            0,
            msg.sender,
            msg.sender,
            bytes32(0)
        );
    }

    function doObligationFor(
        ObligationData calldata data,
        address payer,
        address recipient
    ) public returns (bytes32 uid_) {
        bytes memory encodedData = abi.encode(data);
        uid_ = this.doObligationForRaw(
            encodedData,
            0,
            payer,
            recipient,
            bytes32(0)
        );
    }

    function _beforeAttest(
        bytes calldata data,
        address payer,
        address /* recipient */
    ) internal override {
        ObligationData memory obligationData = abi.decode(
            data,
            (ObligationData)
        );

        // Try token transfer with error handling
        try
            IERC721(obligationData.token).transferFrom(
                payer,
                obligationData.payee,
                obligationData.tokenId
            )
        {
            // Transfer succeeded
        } catch {
            revert ERC721TransferFailed(
                obligationData.token,
                payer,
                obligationData.payee,
                obligationData.tokenId
            );
        }
    }

    function _afterAttest(
        bytes32 uid,
        bytes calldata /* data */,
        address /* payer */,
        address recipient
    ) internal override {
        emit PaymentMade(uid, recipient);
    }

    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 /* counteroffer */
    ) public view override returns (bool) {
        if (!obligation._checkIntrinsic(ATTESTATION_SCHEMA)) return false;

        ObligationData memory payment = abi.decode(
            obligation.data,
            (ObligationData)
        );
        ObligationData memory demandData = abi.decode(demand, (ObligationData));

        return
            payment.token == demandData.token &&
            payment.tokenId == demandData.tokenId &&
            payment.payee == demandData.payee;
    }

    function getObligationData(
        bytes32 uid
    ) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    function decodeObligationData(
        bytes calldata data
    ) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
