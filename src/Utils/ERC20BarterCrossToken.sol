// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {ERC20BarterUtils} from "./ERC20BarterUtils.sol";
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
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

contract ERC20BarterCrossToken is ERC20BarterUtils {
    ERC721EscrowObligation internal erc721Escrow;
    ERC721PaymentObligation internal erc721Payment;
    ERC1155EscrowObligation internal erc1155Escrow;
    ERC1155PaymentObligation internal erc1155Payment;
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
    ) ERC20BarterUtils(_eas, _erc20Escrow, _erc20Payment) {
        erc721Escrow = _erc721Escrow;
        erc721Payment = _erc721Payment;
        erc1155Escrow = _erc1155Escrow;
        erc1155Payment = _erc1155Payment;
        bundleEscrow = _bundleEscrow;
        bundlePayment = _bundlePayment;
    }

    // Internal functions
    function _permitPayment(
        ERC20PaymentObligation.StatementData memory demand,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal {
        IERC20Permit askTokenC = IERC20Permit(demand.token);

        askTokenC.permit(
            msg.sender,
            address(erc20Payment),
            demand.amount,
            deadline,
            v,
            r,
            s
        );
    }

    function _buyErc721WithErc20(
        address bidToken,
        uint256 bidAmount,
        address askToken,
        uint256 askId,
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
                            token: askToken,
                            tokenId: askId,
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
        address askToken,
        uint256 askId,
        uint256 askAmount,
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
                            token: askToken,
                            tokenId: askId,
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

    function _buyBundleWithErc20(
        address bidToken,
        uint256 bidAmount,
        TokenBundlePaymentObligation.StatementData memory askData,
        uint64 expiration
    ) internal returns (bytes32) {
        return
            erc20Escrow.makeStatementFor(
                ERC20EscrowObligation.StatementData({
                    token: bidToken,
                    amount: bidAmount,
                    arbiter: address(bundlePayment),
                    demand: abi.encode(askData)
                }),
                expiration,
                msg.sender,
                msg.sender
            );
    }

    function _payErc20ForErc721(
        bytes32 buyAttestation,
        ERC20PaymentObligation.StatementData memory demand
    ) internal returns (bytes32) {
        bytes32 sellAttestation = erc20Payment.makeStatementFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!erc721Escrow.collectPayment(buyAttestation, sellAttestation)) {
            revert CouldntCollectPayment();
        }

        return sellAttestation;
    }

    function _payErc20ForErc1155(
        bytes32 buyAttestation,
        ERC20PaymentObligation.StatementData memory demand
    ) internal returns (bytes32) {
        bytes32 sellAttestation = erc20Payment.makeStatementFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!erc1155Escrow.collectPayment(buyAttestation, sellAttestation)) {
            revert CouldntCollectPayment();
        }

        return sellAttestation;
    }

    function _payErc20ForBundle(
        bytes32 buyAttestation,
        ERC20PaymentObligation.StatementData memory demand
    ) internal returns (bytes32) {
        bytes32 sellAttestation = erc20Payment.makeStatementFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!bundleEscrow.collectPayment(buyAttestation, sellAttestation)) {
            revert CouldntCollectPayment();
        }

        return sellAttestation;
    }

    // External functions for ERC721
    function buyErc721WithErc20(
        address bidToken,
        uint256 bidAmount,
        address askToken,
        uint256 askId,
        uint64 expiration
    ) external returns (bytes32) {
        return
            _buyErc721WithErc20(
                bidToken,
                bidAmount,
                askToken,
                askId,
                expiration
            );
    }

    function permitAndBuyErc721WithErc20(
        address bidToken,
        uint256 bidAmount,
        address askToken,
        uint256 askId,
        uint64 expiration,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        IERC20Permit bidTokenC = IERC20Permit(bidToken);
        bidTokenC.permit(
            msg.sender,
            address(erc20Escrow),
            bidAmount,
            deadline,
            v,
            r,
            s
        );
        return
            _buyErc721WithErc20(
                bidToken,
                bidAmount,
                askToken,
                askId,
                expiration
            );
    }

    // External functions for ERC1155
    function buyErc1155WithErc20(
        address bidToken,
        uint256 bidAmount,
        address askToken,
        uint256 askId,
        uint256 askAmount,
        uint64 expiration
    ) external returns (bytes32) {
        return
            _buyErc1155WithErc20(
                bidToken,
                bidAmount,
                askToken,
                askId,
                askAmount,
                expiration
            );
    }

    function permitAndBuyErc1155WithErc20(
        address bidToken,
        uint256 bidAmount,
        address askToken,
        uint256 askId,
        uint256 askAmount,
        uint64 expiration,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        IERC20Permit bidTokenC = IERC20Permit(bidToken);
        bidTokenC.permit(
            msg.sender,
            address(erc20Escrow),
            bidAmount,
            deadline,
            v,
            r,
            s
        );
        return
            _buyErc1155WithErc20(
                bidToken,
                bidAmount,
                askToken,
                askId,
                askAmount,
                expiration
            );
    }

    // External functions for Token Bundle
    function buyBundleWithErc20(
        address bidToken,
        uint256 bidAmount,
        TokenBundlePaymentObligation.StatementData calldata askData,
        uint64 expiration
    ) external returns (bytes32) {
        return _buyBundleWithErc20(bidToken, bidAmount, askData, expiration);
    }

    function permitAndBuyBundleWithErc20(
        address bidToken,
        uint256 bidAmount,
        TokenBundlePaymentObligation.StatementData calldata askData,
        uint64 expiration,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        IERC20Permit bidTokenC = IERC20Permit(bidToken);
        bidTokenC.permit(
            msg.sender,
            address(erc20Escrow),
            bidAmount,
            deadline,
            v,
            r,
            s
        );
        return _buyBundleWithErc20(bidToken, bidAmount, askData, expiration);
    }

    function payErc20ForErc721(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC721EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC721EscrowObligation.StatementData)
        );
        ERC20PaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.StatementData)
        );

        return _payErc20ForErc721(buyAttestation, demand);
    }

    function payErc20ForErc1155(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC1155EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC1155EscrowObligation.StatementData)
        );
        ERC20PaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.StatementData)
        );

        return _payErc20ForErc1155(buyAttestation, demand);
    }

    function payErc20ForBundle(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        TokenBundleEscrowObligation.StatementData memory escrowData = abi
            .decode(bid.data, (TokenBundleEscrowObligation.StatementData));
        ERC20PaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.StatementData)
        );

        return _payErc20ForBundle(buyAttestation, demand);
    }

    function permitAndPayErc20ForErc721(
        bytes32 buyAttestation,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC721EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC721EscrowObligation.StatementData)
        );
        ERC20PaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.StatementData)
        );

        _permitPayment(demand, deadline, v, r, s);
        return _payErc20ForErc721(buyAttestation, demand);
    }

    function permitAndPayErc20ForErc1155(
        bytes32 buyAttestation,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC1155EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC1155EscrowObligation.StatementData)
        );
        ERC20PaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.StatementData)
        );

        _permitPayment(demand, deadline, v, r, s);
        return _payErc20ForErc1155(buyAttestation, demand);
    }

    function permitAndPayErc20ForBundle(
        bytes32 buyAttestation,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        TokenBundleEscrowObligation.StatementData memory escrowData = abi
            .decode(bid.data, (TokenBundleEscrowObligation.StatementData));
        ERC20PaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.StatementData)
        );

        _permitPayment(demand, deadline, v, r, s);
        return _payErc20ForBundle(buyAttestation, demand);
    }
}
