// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {ERC1155BarterUtils} from "./ERC1155BarterUtils.sol";
import {IEAS} from "@eas/IEAS.sol";
import {Attestation} from "@eas/Common.sol";
import {ERC1155EscrowObligation} from "../Statements/ERC1155EscrowObligation.sol";
import {ERC1155PaymentObligation} from "../Statements/ERC1155PaymentObligation.sol";
import {ERC20PaymentObligation} from "../Statements/ERC20PaymentObligation.sol";
import {ERC721PaymentObligation} from "../Statements/ERC721PaymentObligation.sol";
import {TokenBundlePaymentObligation} from "../Statements/TokenBundlePaymentObligation.sol";

contract ERC1155BarterCrossToken is ERC1155BarterUtils {
    ERC20PaymentObligation internal erc20Payment;
    ERC721PaymentObligation internal erc721Payment;
    TokenBundlePaymentObligation internal bundlePayment;

    constructor(
        IEAS _eas,
        ERC1155EscrowObligation _erc1155Escrow,
        ERC1155PaymentObligation _erc1155Payment,
        ERC20PaymentObligation _erc20Payment,
        ERC721PaymentObligation _erc721Payment,
        TokenBundlePaymentObligation _bundlePayment
    ) ERC1155BarterUtils(_eas, _erc1155Escrow, _erc1155Payment) {
        erc20Payment = _erc20Payment;
        erc721Payment = _erc721Payment;
        bundlePayment = _bundlePayment;
    }

    function buyErc20WithErc1155(
        address bidToken,
        uint256 bidTokenId,
        uint256 bidAmount,
        address askToken,
        uint256 askAmount,
        uint64 expiration
    ) external returns (bytes32) {
        return
            erc1155Escrow.makeStatementFor(
                ERC1155EscrowObligation.StatementData({
                    token: bidToken,
                    tokenId: bidTokenId,
                    amount: bidAmount,
                    arbiter: address(erc20Payment),
                    demand: abi.encode(
                        ERC20PaymentObligation.StatementData({
                            token: askToken,
                            amount: askAmount,
                            payee: msg.sender
                        })
                    )
                }),
                expiration,
                msg.sender,
                msg.sender
            );
    }

    function buyErc721WithErc1155(
        address bidToken,
        uint256 bidTokenId,
        uint256 bidAmount,
        address askToken,
        uint256 askTokenId,
        uint64 expiration
    ) external returns (bytes32) {
        return
            erc1155Escrow.makeStatementFor(
                ERC1155EscrowObligation.StatementData({
                    token: bidToken,
                    tokenId: bidTokenId,
                    amount: bidAmount,
                    arbiter: address(erc721Payment),
                    demand: abi.encode(
                        ERC721PaymentObligation.StatementData({
                            token: askToken,
                            tokenId: askTokenId,
                            payee: msg.sender
                        })
                    )
                }),
                expiration,
                msg.sender,
                msg.sender
            );
    }

    function buyBundleWithErc1155(
        address bidToken,
        uint256 bidTokenId,
        uint256 bidAmount,
        TokenBundlePaymentObligation.StatementData calldata askData,
        uint64 expiration
    ) external returns (bytes32) {
        return
            erc1155Escrow.makeStatementFor(
                ERC1155EscrowObligation.StatementData({
                    token: bidToken,
                    tokenId: bidTokenId,
                    amount: bidAmount,
                    arbiter: address(bundlePayment),
                    demand: abi.encode(askData)
                }),
                expiration,
                msg.sender,
                msg.sender
            );
    }
}
