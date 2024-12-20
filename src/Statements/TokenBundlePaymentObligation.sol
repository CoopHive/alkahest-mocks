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

contract TokenBundlePaymentObligation is BaseStatement, IArbiter {
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
        address payee;
    }

    event PaymentMade(bytes32 indexed payment, address indexed buyer);

    error InvalidPayment();
    error ArrayLengthMismatch();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseStatement(
            _eas,
            _schemaRegistry,
            "address[] erc20Tokens, uint256[] erc20Amounts, address[] erc721Tokens, uint256[] erc721TokenIds, address[] erc1155Tokens, uint256[] erc1155TokenIds, uint256[] erc1155Amounts, address payee",
            true
        )
    {}

    function makeStatementFor(
        StatementData calldata data,
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
                    data.payee,
                    data.erc20Amounts[i]
                )
            ) revert InvalidPayment();
        }

        // Transfer ERC721 tokens
        for (uint256 i = 0; i < data.erc721Tokens.length; i++) {
            IERC721(data.erc721Tokens[i]).transferFrom(
                payer,
                data.payee,
                data.erc721TokenIds[i]
            );
        }

        // Transfer ERC1155 tokens
        for (uint256 i = 0; i < data.erc1155Tokens.length; i++) {
            IERC1155(data.erc1155Tokens[i]).safeTransferFrom(
                payer,
                data.payee,
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
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode(data),
                    value: 0
                })
            })
        );
        emit PaymentMade(uid_, recipient);
    }

    function makeStatement(
        StatementData calldata data
    ) public returns (bytes32 uid_) {
        return makeStatementFor(data, msg.sender, msg.sender);
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

        if (payment.payee != demandData.payee) return false;

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
}
