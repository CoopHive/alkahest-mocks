// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
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

    event BundleTransferred(
        bytes32 indexed payment,
        address indexed from,
        address indexed to
    );

    error InvalidTransfer();
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

    function validateArrayLengths(StatementData calldata data) internal pure {
        if (data.erc20Tokens.length != data.erc20Amounts.length)
            revert ArrayLengthMismatch();
        if (data.erc721Tokens.length != data.erc721TokenIds.length)
            revert ArrayLengthMismatch();
        if (
            data.erc1155Tokens.length != data.erc1155TokenIds.length ||
            data.erc1155Tokens.length != data.erc1155Amounts.length
        ) revert ArrayLengthMismatch();
    }

    function transferBundle(
        StatementData calldata data,
        address from
    ) internal {
        // Transfer ERC20s
        for (uint i = 0; i < data.erc20Tokens.length; i++) {
            if (
                !IERC20(data.erc20Tokens[i]).transferFrom(
                    from,
                    data.payee,
                    data.erc20Amounts[i]
                )
            ) revert InvalidTransfer();
        }

        // Transfer ERC721s
        for (uint i = 0; i < data.erc721Tokens.length; i++) {
            IERC721(data.erc721Tokens[i]).transferFrom(
                from,
                data.payee,
                data.erc721TokenIds[i]
            );
        }

        // Transfer ERC1155s
        for (uint i = 0; i < data.erc1155Tokens.length; i++) {
            IERC1155(data.erc1155Tokens[i]).safeTransferFrom(
                from,
                data.payee,
                data.erc1155TokenIds[i],
                data.erc1155Amounts[i],
                ""
            );
        }
    }

    function makeStatementFor(
        StatementData calldata data,
        address payer,
        address recipient
    ) public returns (bytes32 uid_) {
        validateArrayLengths(data);
        transferBundle(data, payer);

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
        emit BundleTransferred(uid_, payer, data.payee);
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
            _checkTokenArrays(payment, demandData) &&
            payment.payee == demandData.payee;
    }

    function _checkTokenArrays(
        StatementData memory payment,
        StatementData memory demand
    ) internal pure returns (bool) {
        // Check ERC20s
        if (payment.erc20Tokens.length < demand.erc20Tokens.length)
            return false;
        for (uint i = 0; i < demand.erc20Tokens.length; i++) {
            if (
                payment.erc20Tokens[i] != demand.erc20Tokens[i] ||
                payment.erc20Amounts[i] < demand.erc20Amounts[i]
            ) return false;
        }

        // Check ERC721s
        if (payment.erc721Tokens.length < demand.erc721Tokens.length)
            return false;
        for (uint i = 0; i < demand.erc721Tokens.length; i++) {
            if (
                payment.erc721Tokens[i] != demand.erc721Tokens[i] ||
                payment.erc721TokenIds[i] != demand.erc721TokenIds[i]
            ) return false;
        }

        // Check ERC1155s
        if (payment.erc1155Tokens.length < demand.erc1155Tokens.length)
            return false;
        for (uint i = 0; i < demand.erc1155Tokens.length; i++) {
            if (
                payment.erc1155Tokens[i] != demand.erc1155Tokens[i] ||
                payment.erc1155TokenIds[i] != demand.erc1155TokenIds[i] ||
                payment.erc1155Amounts[i] < demand.erc1155Amounts[i]
            ) return false;
        }

        return true;
    }

    function getStatementData(
        bytes32 uid
    ) public view returns (StatementData memory) {
        Attestation memory attestation = eas.getAttestation(uid);
        if (attestation.schema != ATTESTATION_SCHEMA) revert InvalidTransfer();
        return abi.decode(attestation.data, (StatementData));
    }

    function decodeStatementData(
        bytes calldata data
    ) public pure returns (StatementData memory) {
        return abi.decode(data, (StatementData));
    }
}
