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

    error InvalidPayment();
    error ERC1155TransferFailed(
        address token,
        address from,
        address to,
        uint256 tokenId,
        uint256 amount
    );
    error AttestationCreateFailed();

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

    function doObligationFor(
        ObligationData calldata data,
        address payer,
        address recipient
    ) public returns (bytes32 uid_) {
        // Try token transfer with error handling
        try
            IERC1155(data.token).safeTransferFrom(
                payer,
                data.payee,
                data.tokenId,
                data.amount,
                ""
            )
        {
            // Transfer succeeded
        } catch {
            revert ERC1155TransferFailed(
                data.token,
                payer,
                data.payee,
                data.tokenId,
                data.amount
            );
        }

        // Create attestation with try/catch for potential EAS failures
        try
            eas.attest(
                AttestationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: AttestationRequestData({
                        recipient: recipient,
                        expirationTime: 0,
                        revocable: true,
                        refUID: bytes32(0),
                        data: abi.encode(data),
                        value: 0
                    })
                })
            )
        returns (bytes32 uid) {
            uid_ = uid;
            emit PaymentMade(uid_, recipient);
        } catch {
            // Note: We can't refund the tokens here as they're already sent to payee
            revert AttestationCreateFailed();
        }
    }

    function doObligation(
        ObligationData calldata data
    ) public returns (bytes32 uid_) {
        return doObligationFor(data, msg.sender, msg.sender);
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
        Attestation memory attestation = eas.getAttestation(uid);
        if (attestation.schema != ATTESTATION_SCHEMA) revert InvalidPayment();
        return abi.decode(attestation.data, (ObligationData));
    }

    function decodeObligationData(
        bytes calldata data
    ) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
