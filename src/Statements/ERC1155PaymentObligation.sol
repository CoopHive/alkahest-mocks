// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC1155} from "@openzeppelin/token/ERC1155/IERC1155.sol";
import {BaseStatement} from "../BaseStatement.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract ERC1155PaymentObligation is BaseStatement, IArbiter {
    using ArbiterUtils for Attestation;

    struct StatementData {
        address token;
        uint256 tokenId;
        uint256 amount;
        address payee;
    }

    event PaymentMade(bytes32 indexed payment, address indexed buyer);

    error InvalidPayment();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseStatement(
            _eas,
            _schemaRegistry,
            "address token, uint256 tokenId, uint256 amount, address payee",
            true
        )
    {}

    function makeStatementFor(
        StatementData calldata data,
        address payer,
        address recipient
    ) public returns (bytes32 uid_) {
        IERC1155(data.token).safeTransferFrom(
            payer,
            data.payee,
            data.tokenId,
            data.amount,
            ""
        );

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

        return
            payment.token == demandData.token &&
            payment.tokenId == demandData.tokenId &&
            payment.amount >= demandData.amount &&
            payment.payee == demandData.payee;
    }
}