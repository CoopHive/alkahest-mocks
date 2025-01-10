// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {ERC721BarterUtils} from "./ERC721BarterUtils.sol";
import {IEAS} from "@eas/IEAS.sol";
import {Attestation} from "@eas/Common.sol";
import {ERC721EscrowObligation} from "../Statements/ERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "../Statements/ERC721PaymentObligation.sol";
import {ERC20PaymentObligation} from "../Statements/ERC20PaymentObligation.sol";
import {ERC1155PaymentObligation} from "../Statements/ERC1155PaymentObligation.sol";
import {TokenBundlePaymentObligation} from "../Statements/TokenBundlePaymentObligation.sol";

contract ERC721BarterCrossToken is ERC721BarterUtils {
    ERC20PaymentObligation internal erc20Payment;
    ERC1155PaymentObligation internal erc1155Payment;
    TokenBundlePaymentObligation internal bundlePayment;

    constructor(
        IEAS _eas,
        ERC721EscrowObligation _erc721Escrow,
        ERC721PaymentObligation _erc721Payment,
        ERC20PaymentObligation _erc20Payment,
        ERC1155PaymentObligation _erc1155Payment,
        TokenBundlePaymentObligation _bundlePayment
    ) ERC721BarterUtils(_eas, _erc721Escrow, _erc721Payment) {
        erc20Payment = _erc20Payment;
        erc1155Payment = _erc1155Payment;
        bundlePayment = _bundlePayment;
    }

    function buyErc20WithErc721(
        address bidToken,
        uint256 bidTokenId,
        address askToken,
        uint256 askAmount,
        uint64 expiration
    ) external returns (bytes32) {
        return
            erc721Escrow.makeStatementFor(
                ERC721EscrowObligation.StatementData({
                    token: bidToken,
                    tokenId: bidTokenId,
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

    function buyErc1155WithErc721(
        address bidToken,
        uint256 bidTokenId,
        address askToken,
        uint256 askTokenId,
        uint256 askAmount,
        uint64 expiration
    ) external returns (bytes32) {
        return
            erc721Escrow.makeStatementFor(
                ERC721EscrowObligation.StatementData({
                    token: bidToken,
                    tokenId: bidTokenId,
                    arbiter: address(erc1155Payment),
                    demand: abi.encode(
                        ERC1155PaymentObligation.StatementData({
                            token: askToken,
                            tokenId: askTokenId,
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

    function buyBundleWithErc721(
        address bidToken,
        uint256 bidTokenId,
        TokenBundlePaymentObligation.StatementData calldata askData,
        uint64 expiration
    ) external returns (bytes32) {
        return
            erc721Escrow.makeStatementFor(
                ERC721EscrowObligation.StatementData({
                    token: bidToken,
                    tokenId: bidTokenId,
                    arbiter: address(bundlePayment),
                    demand: abi.encode(askData)
                }),
                expiration,
                msg.sender,
                msg.sender
            );
    }
}
