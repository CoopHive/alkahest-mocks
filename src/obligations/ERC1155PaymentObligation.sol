// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {BaseObligation} from "../BaseObligation.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract ERC1155PaymentObligation is BaseObligation, IArbiter {
    using ArbiterUtils for Attestation;

    struct ObligationData {
        address token;
        uint256 tokenId;
        uint256 amount;
        address payee;
    }

    event PaymentMade(bytes32 indexed payment, address indexed buyer);

    error ERC1155TransferFailed(
        address token,
        address from,
        address to,
        uint256 tokenId,
        uint256 amount
    );

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseObligation(
            _eas,
            _schemaRegistry,
            "address token, uint256 tokenId, uint256 amount, address payee",
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
            IERC1155(obligationData.token).safeTransferFrom(
                payer,
                obligationData.payee,
                obligationData.tokenId,
                obligationData.amount,
                ""
            )
        {
            // Transfer succeeded
        } catch {
            revert ERC1155TransferFailed(
                obligationData.token,
                payer,
                obligationData.payee,
                obligationData.tokenId,
                obligationData.amount
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
            payment.amount >= demandData.amount &&
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
