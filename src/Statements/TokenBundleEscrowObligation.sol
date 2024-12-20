// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/token/ERC721/IERC721.sol";
import {IERC1155} from "@openzeppelin/token/ERC1155/IERC1155.sol";
import {BaseStatement} from "../BaseStatement.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract TokenBundleEscrowObligation is BaseStatement, IArbiter {
    using ArbiterUtils for Attestation;

    struct StatementData {
        // ERC20
        address[] erc20Tokens;
        uint256[] erc20Amounts;
        // ERC721
        address[] erc721Tokens;
        uint256[] erc721TokenIds;
        // ERC1155
        address[] erc1155Tokens;
        uint256[] erc1155TokenIds;
        uint256[] erc1155Amounts;
        address arbiter;
        bytes demand;
    }

    event PaymentMade(bytes32 indexed payment, address indexed buyer);
    event PaymentClaimed(
        bytes32 indexed payment,
        bytes32 indexed fulfillment,
        address indexed fulfiller
    );

    error InvalidPayment();
    error ArrayLengthMismatch();
    error InvalidPaymentAttestation();
    error InvalidFulfillment();
    error UnauthorizedCall();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseStatement(
            _eas,
            _schemaRegistry,
            "address[] erc20Tokens, uint256[] erc20Amounts, address[] erc721Tokens, uint256[] erc721TokenIds, address[] erc1155Tokens, uint256[] erc1155TokenIds, uint256[] erc1155Amounts, address arbiter, bytes demand",
            true
        )
    {}

    function makeStatementFor(
        StatementData calldata data,
        uint64 expirationTime,
        bytes32 refUID,
        address payer,
        address recipient
    ) public returns (bytes32 uid_) {
        if (
            data.erc20Tokens.length != data.erc20Amounts.length ||
            data.erc721Tokens.length != data.erc721TokenIds.length ||
            data.erc1155Tokens.length != data.erc1155TokenIds.length ||
            data.erc1155Tokens.length != data.erc1155Amounts.length
        ) revert ArrayLengthMismatch();

        // Transfer ERC20 tokens
        for (uint256 i = 0; i < data.erc20Tokens.length; i++) {
            if (
                !IERC20(data.erc20Tokens[i]).transferFrom(
                    payer,
                    address(this),
                    data.erc20Amounts[i]
                )
            ) revert InvalidPayment();
        }

        // Transfer ERC721 tokens
        for (uint256 i = 0; i < data.erc721Tokens.length; i++) {
            IERC721(data.erc721Tokens[i]).transferFrom(
                payer,
                address(this),
                data.erc721TokenIds[i]
            );
        }

        // Transfer ERC1155 tokens
        for (uint256 i = 0; i < data.erc1155Tokens.length; i++) {
            IERC1155(data.erc1155Tokens[i]).safeTransferFrom(
                payer,
                address(this),
                data.erc1155TokenIds[i],
                data.erc1155Amounts[i],
                ""
            );
        }

        uid_ = eas.attest(
            AttestationRequest({
                schema: ATTESTATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: recipient,
                    expirationTime: expirationTime,
                    revocable: true,
                    refUID: refUID,
                    data: abi.encode(data),
                    value: 0
                })
            })
        );
        emit PaymentMade(uid_, recipient);
    }

    function makeStatement(
        StatementData calldata data,
        uint64 expirationTime,
        bytes32 refUID
    ) public returns (bytes32 uid_) {
        return
            makeStatementFor(
                data,
                expirationTime,
                refUID,
                msg.sender,
                msg.sender
            );
    }

    function collectPayment(
        bytes32 _payment,
        bytes32 _fulfillment
    ) public returns (bool) {
        Attestation memory payment = eas.getAttestation(_payment);
        Attestation memory fulfillment = eas.getAttestation(_fulfillment);

        if (!payment._checkIntrinsic()) revert InvalidPaymentAttestation();

        StatementData memory paymentData = abi.decode(
            payment.data,
            (StatementData)
        );

        if (!_isValidFulfillment(payment, fulfillment, paymentData))
            revert InvalidFulfillment();

        eas.revoke(
            RevocationRequest({
                schema: ATTESTATION_SCHEMA,
                data: RevocationRequestData({uid: _payment, value: 0})
            })
        );

        // Transfer all tokens to the fulfiller
        for (uint256 i = 0; i < paymentData.erc20Tokens.length; i++) {
            IERC20(paymentData.erc20Tokens[i]).transfer(
                fulfillment.recipient,
                paymentData.erc20Amounts[i]
            );
        }

        for (uint256 i = 0; i < paymentData.erc721Tokens.length; i++) {
            IERC721(paymentData.erc721Tokens[i]).transferFrom(
                address(this),
                fulfillment.recipient,
                paymentData.erc721TokenIds[i]
            );
        }

        for (uint256 i = 0; i < paymentData.erc1155Tokens.length; i++) {
            IERC1155(paymentData.erc1155Tokens[i]).safeTransferFrom(
                address(this),
                fulfillment.recipient,
                paymentData.erc1155TokenIds[i],
                paymentData.erc1155Amounts[i],
                ""
            );
        }

        emit PaymentClaimed(_payment, _fulfillment, fulfillment.recipient);
        return true;
    }

    function collectExpired(bytes32 uid) public returns (bool) {
        Attestation memory attestation = eas.getAttestation(uid);

        if (block.timestamp < attestation.expirationTime)
            revert UnauthorizedCall();

        StatementData memory data = abi.decode(
            attestation.data,
            (StatementData)
        );

        // Return all tokens to the original recipient
        for (uint256 i = 0; i < data.erc20Tokens.length; i++) {
            IERC20(data.erc20Tokens[i]).transfer(
                attestation.recipient,
                data.erc20Amounts[i]
            );
        }

        for (uint256 i = 0; i < data.erc721Tokens.length; i++) {
            IERC721(data.erc721Tokens[i]).transferFrom(
                address(this),
                attestation.recipient,
                data.erc721TokenIds[i]
            );
        }

        for (uint256 i = 0; i < data.erc1155Tokens.length; i++) {
            IERC1155(data.erc1155Tokens[i]).safeTransferFrom(
                address(this),
                attestation.recipient,
                data.erc1155TokenIds[i],
                data.erc1155Amounts[i],
                ""
            );
        }

        return true;
    }

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 /* counteroffer */
    ) public view override returns (bool) {
        if (!statement._checkIntrinsic(ATTESTATION_SCHEMA)) return false;

        StatementData memory payment = abi.decode(
            statement.data,
            (StatementData)
        );
        StatementData memory demandData = abi.decode(demand, (StatementData));

        // Check arbiter and demand bytes
        if (
            payment.arbiter != demandData.arbiter ||
            keccak256(payment.demand) != keccak256(demandData.demand)
        ) {
            return false;
        }

        // Check ERC20 tokens
        if (payment.erc20Tokens.length < demandData.erc20Tokens.length)
            return false;
        for (uint256 i = 0; i < demandData.erc20Tokens.length; i++) {
            bool found = false;
            for (uint256 j = 0; j < payment.erc20Tokens.length; j++) {
                if (
                    payment.erc20Tokens[j] == demandData.erc20Tokens[i] &&
                    payment.erc20Amounts[j] >= demandData.erc20Amounts[i]
                ) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }

        // Check ERC721 tokens
        if (payment.erc721Tokens.length < demandData.erc721Tokens.length)
            return false;
        for (uint256 i = 0; i < demandData.erc721Tokens.length; i++) {
            bool found = false;
            for (uint256 j = 0; j < payment.erc721Tokens.length; j++) {
                if (
                    payment.erc721Tokens[j] == demandData.erc721Tokens[i] &&
                    payment.erc721TokenIds[j] == demandData.erc721TokenIds[i]
                ) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }

        // Check ERC1155 tokens
        if (payment.erc1155Tokens.length < demandData.erc1155Tokens.length)
            return false;
        for (uint256 i = 0; i < demandData.erc1155Tokens.length; i++) {
            bool found = false;
            for (uint256 j = 0; j < payment.erc1155Tokens.length; j++) {
                if (
                    payment.erc1155Tokens[j] == demandData.erc1155Tokens[i] &&
                    payment.erc1155TokenIds[j] ==
                    demandData.erc1155TokenIds[i] &&
                    payment.erc1155Amounts[j] >= demandData.erc1155Amounts[i]
                ) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }

        return true;
    }

    function _isValidFulfillment(
        Attestation memory payment,
        Attestation memory fulfillment,
        StatementData memory paymentData
    ) internal view returns (bool) {
        if (payment.refUID != 0) return payment.refUID == fulfillment.uid;

        return
            IArbiter(paymentData.arbiter).checkStatement(
                fulfillment,
                paymentData.demand,
                payment.uid
            );
    }
}
