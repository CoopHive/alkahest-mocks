// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {ERC20BarterUtils} from "./ERC20BarterUtils.sol";
import {IEAS} from "@eas/IEAS.sol";
import {Attestation} from "@eas/Common.sol";
import {ERC20EscrowObligation} from "../Statements/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "../Statements/ERC20PaymentObligation.sol";
import {ERC721PaymentObligation} from "../Statements/ERC721PaymentObligation.sol";
import {ERC1155PaymentObligation} from "../Statements/ERC1155PaymentObligation.sol";
import {TokenBundlePaymentObligation} from "../Statements/TokenBundlePaymentObligation.sol";
import {IERC20Permit} from "@openzeppelin/token/ERC20/extensions/IERC20Permit.sol";

contract ERC20BarterCrossToken is ERC20BarterUtils {
    ERC721PaymentObligation internal erc721Payment;
    ERC1155PaymentObligation internal erc1155Payment;
    TokenBundlePaymentObligation internal bundlePayment;

    constructor(
        IEAS _eas,
        ERC20EscrowObligation _erc20Escrow,
        ERC20PaymentObligation _erc20Payment,
        ERC721PaymentObligation _erc721Payment,
        ERC1155PaymentObligation _erc1155Payment,
        TokenBundlePaymentObligation _bundlePayment
    ) ERC20BarterUtils(_eas, _erc20Escrow, _erc20Payment) {
        erc721Payment = _erc721Payment;
        erc1155Payment = _erc1155Payment;
        bundlePayment = _bundlePayment;
    }

    // Internal functions
    function _buyErc721WithErc20(
        address bidToken,
        uint256 bidAmount,
        address nftToken,
        uint256 tokenId,
        uint64 expiration
    ) internal returns (bytes32) {
        return
            erc20Escrow.makeStatementFor(
                ERC20EscrowObligation.StatementData({
                    token: bidToken,
                    amount: bidAmount,
                    arbiter: address(erc721Payment),
                    demand: abi.encode(
                        ERC721PaymentObligation.StatementData({
                            token: nftToken,
                            tokenId: tokenId,
                            payee: msg.sender
                        })
                    )
                }),
                expiration,
                msg.sender,
                msg.sender
            );
    }

    function _buyErc1155WithErc20(
        address bidToken,
        uint256 bidAmount,
        address nftToken,
        uint256 tokenId,
        uint256 amount,
        uint64 expiration
    ) internal returns (bytes32) {
        return
            erc20Escrow.makeStatementFor(
                ERC20EscrowObligation.StatementData({
                    token: bidToken,
                    amount: bidAmount,
                    arbiter: address(erc1155Payment),
                    demand: abi.encode(
                        ERC1155PaymentObligation.StatementData({
                            token: nftToken,
                            tokenId: tokenId,
                            amount: amount,
                            payee: msg.sender
                        })
                    )
                }),
                expiration,
                msg.sender,
                msg.sender
            );
    }

    function _buyBundleWithErc20(
        address bidToken,
        uint256 bidAmount,
        TokenBundlePaymentObligation.StatementData memory bundleData,
        uint64 expiration
    ) internal returns (bytes32) {
        return
            erc20Escrow.makeStatementFor(
                ERC20EscrowObligation.StatementData({
                    token: bidToken,
                    amount: bidAmount,
                    arbiter: address(bundlePayment),
                    demand: abi.encode(bundleData)
                }),
                expiration,
                msg.sender,
                msg.sender
            );
    }

    // External functions for ERC721
    function buyErc721WithErc20(
        address bidToken,
        uint256 bidAmount,
        address nftToken,
        uint256 tokenId,
        uint64 expiration
    ) external returns (bytes32) {
        return
            _buyErc721WithErc20(
                bidToken,
                bidAmount,
                nftToken,
                tokenId,
                expiration
            );
    }

    function permitAndBuyErc721WithErc20(
        address bidToken,
        uint256 bidAmount,
        address nftToken,
        uint256 tokenId,
        uint64 expiration,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        IERC20Permit bidTokenC = IERC20Permit(bidToken);
        bidTokenC.permit(
            msg.sender,
            address(erc20Escrow),
            bidAmount,
            block.timestamp + 1,
            v,
            r,
            s
        );
        return
            _buyErc721WithErc20(
                bidToken,
                bidAmount,
                nftToken,
                tokenId,
                expiration
            );
    }

    // External functions for ERC1155
    function buyErc1155WithErc20(
        address bidToken,
        uint256 bidAmount,
        address nftToken,
        uint256 tokenId,
        uint256 amount,
        uint64 expiration
    ) external returns (bytes32) {
        return
            _buyErc1155WithErc20(
                bidToken,
                bidAmount,
                nftToken,
                tokenId,
                amount,
                expiration
            );
    }

    function permitAndBuyErc1155WithErc20(
        address bidToken,
        uint256 bidAmount,
        address nftToken,
        uint256 tokenId,
        uint256 amount,
        uint64 expiration,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        IERC20Permit bidTokenC = IERC20Permit(bidToken);
        bidTokenC.permit(
            msg.sender,
            address(erc20Escrow),
            bidAmount,
            block.timestamp + 1,
            v,
            r,
            s
        );
        return
            _buyErc1155WithErc20(
                bidToken,
                bidAmount,
                nftToken,
                tokenId,
                amount,
                expiration
            );
    }

    // External functions for Token Bundle
    function buyBundleWithErc20(
        address bidToken,
        uint256 bidAmount,
        TokenBundlePaymentObligation.StatementData calldata bundleData,
        uint64 expiration
    ) external returns (bytes32) {
        return _buyBundleWithErc20(bidToken, bidAmount, bundleData, expiration);
    }

    function permitAndBuyBundleWithErc20(
        address bidToken,
        uint256 bidAmount,
        TokenBundlePaymentObligation.StatementData calldata bundleData,
        uint64 expiration,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        IERC20Permit bidTokenC = IERC20Permit(bidToken);
        bidTokenC.permit(
            msg.sender,
            address(erc20Escrow),
            bidAmount,
            block.timestamp + 1,
            v,
            r,
            s
        );
        return _buyBundleWithErc20(bidToken, bidAmount, bundleData, expiration);
    }
}
