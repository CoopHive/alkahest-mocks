// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {ERC1155BarterUtils} from "./ERC1155BarterUtils.sol";
import {IEAS} from "@eas/IEAS.sol";
import {Attestation} from "@eas/Common.sol";
import {ERC20EscrowObligation} from "../Statements/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "../Statements/ERC20PaymentObligation.sol";
import {ERC721EscrowObligation} from "../Statements/ERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "../Statements/ERC721PaymentObligation.sol";
import {ERC1155EscrowObligation} from "../Statements/ERC1155EscrowObligation.sol";
import {ERC1155PaymentObligation} from "../Statements/ERC1155PaymentObligation.sol";
import {TokenBundleEscrowObligation} from "../Statements/TokenBundleEscrowObligation.sol";
import {TokenBundlePaymentObligation} from "../Statements/TokenBundlePaymentObligation.sol";

contract ERC1155BarterCrossToken is ERC1155BarterUtils {
    ERC20PaymentObligation internal erc20Payment;
    ERC20EscrowObligation internal erc20Escrow;
    ERC721EscrowObligation internal erc721Escrow;
    ERC721PaymentObligation internal erc721Payment;
    TokenBundleEscrowObligation internal bundleEscrow;
    TokenBundlePaymentObligation internal bundlePayment;

    constructor(
        IEAS _eas,
        ERC20EscrowObligation _erc20Escrow,
        ERC20PaymentObligation _erc20Payment,
        ERC721EscrowObligation _erc721Escrow,
        ERC721PaymentObligation _erc721Payment,
        ERC1155EscrowObligation _erc1155Escrow,
        ERC1155PaymentObligation _erc1155Payment,
        TokenBundleEscrowObligation _bundleEscrow,
        TokenBundlePaymentObligation _bundlePayment
    ) ERC1155BarterUtils(_eas, _erc1155Escrow, _erc1155Payment) {
        erc20Escrow = _erc20Escrow;
        erc20Payment = _erc20Payment;
        erc721Escrow = _erc721Escrow;
        erc721Payment = _erc721Payment;
        bundleEscrow = _bundleEscrow;
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

    function payErc1155ForErc20(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        // Note: There's a type error in the original code
        // The decoding should match the type in buyErc20WithErc1155
        ERC1155EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC1155EscrowObligation.StatementData)
        );
        ERC20PaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.StatementData)
        );

        bytes32 sellAttestation = erc20Payment.makeStatementFor(
            demand,
            msg.sender,
            msg.sender
        );

        // Fix: Use escrowStatement (erc1155Escrow) instead of erc20Escrow
        // The original escrow was made with ERC1155EscrowObligation
        if (!erc1155Escrow.collectPayment(buyAttestation, sellAttestation)) {
            revert CouldntCollectPayment();
        }

        return sellAttestation;
    }

    function payErc1155ForErc721(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        // Note: There's a type error in the original code
        // The decoding should match the type in buyErc721WithErc1155
        ERC1155EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC1155EscrowObligation.StatementData)
        );
        ERC721PaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (ERC721PaymentObligation.StatementData)
        );

        bytes32 sellAttestation = erc721Payment.makeStatementFor(
            demand,
            msg.sender,
            msg.sender
        );

        // Fix: Use escrowStatement (erc1155Escrow) instead of erc721Escrow
        // The original escrow was made with ERC1155EscrowObligation
        if (!erc1155Escrow.collectPayment(buyAttestation, sellAttestation)) {
            revert CouldntCollectPayment();
        }

        return sellAttestation;
    }

    function payErc1155ForBundle(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        // Note: There's a type error in the original code
        // The decoding should match the type in buyBundleWithErc1155
        ERC1155EscrowObligation.StatementData memory escrowData = abi
            .decode(bid.data, (ERC1155EscrowObligation.StatementData));
        TokenBundlePaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (TokenBundlePaymentObligation.StatementData)
        );

        bytes32 sellAttestation = bundlePayment.makeStatementFor(
            demand,
            msg.sender,
            msg.sender
        );

        // Fix: Use escrowStatement (erc1155Escrow) instead of bundleEscrow
        // The original escrow was made with ERC1155EscrowObligation
        if (!erc1155Escrow.collectPayment(buyAttestation, sellAttestation)) {
            revert CouldntCollectPayment();
        }

        return sellAttestation;
    }
}
