// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {ERC721BarterUtils} from "./ERC721BarterUtils.sol";
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

contract ERC721BarterCrossToken is ERC721BarterUtils {
    ERC20PaymentObligation internal erc20Payment;
    ERC20EscrowObligation internal erc20Escrow;
    ERC1155EscrowObligation internal erc1155Escrow;
    ERC1155PaymentObligation internal erc1155Payment;
    TokenBundleEscrowObligation internal bundleEscrow;
    TokenBundlePaymentObligation internal bundlePayment;

    constructor(
        IEAS _eas,
        ERC721EscrowObligation _erc721Escrow,
        ERC721PaymentObligation _erc721Payment,
        ERC20EscrowObligation _erc20Escrow,
        ERC20PaymentObligation _erc20Payment,
        ERC1155EscrowObligation _erc1155Escrow,
        ERC1155PaymentObligation _erc1155Payment,
        TokenBundleEscrowObligation _bundleEscrow,
        TokenBundlePaymentObligation _bundlePayment
    ) ERC721BarterUtils(_eas, _erc721Escrow, _erc721Payment) {
        erc20Escrow = _erc20Escrow;
        erc20Payment = _erc20Payment;
        erc1155Escrow = _erc1155Escrow;
        erc1155Payment = _erc1155Payment;
        bundleEscrow = _bundleEscrow;
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

    function payErc721ForErc20(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC20EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC20EscrowObligation.StatementData)
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

        if (!erc20Escrow.collectPayment(buyAttestation, sellAttestation)) {
            revert CouldntCollectPayment();
        }

        return sellAttestation;
    }

    function payErc721ForErc1155(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC20EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC20EscrowObligation.StatementData)
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

        if (!erc1155Escrow.collectPayment(buyAttestation, sellAttestation)) {
            revert CouldntCollectPayment();
        }

        return sellAttestation;
    }

    function payErc721ForBundle(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        TokenBundleEscrowObligation.StatementData memory escrowData = abi
            .decode(bid.data, (TokenBundleEscrowObligation.StatementData));
        TokenBundlePaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (TokenBundlePaymentObligation.StatementData)
        );

        bytes32 sellAttestation = bundlePayment.makeStatementFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!bundleEscrow.collectPayment(buyAttestation, sellAttestation)) {
            revert CouldntCollectPayment();
        }

        return sellAttestation;
    }
}
