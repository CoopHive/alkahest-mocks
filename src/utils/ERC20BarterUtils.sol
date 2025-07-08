// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ERC20EscrowObligation} from "../obligations/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "../obligations/ERC20PaymentObligation.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

contract ERC20BarterUtils {
    IEAS internal eas;
    ERC20EscrowObligation internal erc20Escrow;
    ERC20PaymentObligation internal erc20Payment;

    error CouldntCollectEscrow();

    constructor(
        IEAS _eas,
        ERC20EscrowObligation _erc20Escrow,
        ERC20PaymentObligation _erc20Payment
    ) {
        eas = _eas;
        erc20Escrow = _erc20Escrow;
        erc20Payment = _erc20Payment;
    }

    function permitAndBuyWithErc20(
        address token,
        uint256 amount,
        address arbiter,
        bytes memory demand,
        uint64 expiration,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        IERC20Permit tokenC = IERC20Permit(token);
        tokenC.permit(
            msg.sender,
            address(erc20Escrow),
            amount,
            deadline,
            v,
            r,
            s
        );
        return
            erc20Escrow.doObligationFor(
                ERC20EscrowObligation.ObligationData({
                    token: token,
                    amount: amount,
                    arbiter: arbiter,
                    demand: demand
                }),
                expiration,
                msg.sender,
                msg.sender
            );
    }

    function permitAndPayWithErc20(
        address token,
        uint256 amount,
        address payee,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        IERC20Permit tokenC = IERC20Permit(token);
        tokenC.permit(
            msg.sender,
            address(erc20Payment),
            amount,
            deadline,
            v,
            r,
            s
        );
        return
            erc20Payment.doObligationFor(
                ERC20PaymentObligation.ObligationData({
                    token: token,
                    amount: amount,
                    payee: payee
                }),
                msg.sender,
                msg.sender
            );
    }

    function _buyErc20ForErc20(
        address bidToken,
        uint256 bidAmount,
        address askToken,
        uint256 askAmount,
        uint64 expiration
    ) internal returns (bytes32) {
        return
            erc20Escrow.doObligationFor(
                ERC20EscrowObligation.ObligationData({
                    token: bidToken,
                    amount: bidAmount,
                    arbiter: address(erc20Payment),
                    demand: abi.encode(
                        ERC20PaymentObligation.ObligationData({
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

    function _payErc20ForErc20(
        bytes32 buyAttestation,
        ERC20PaymentObligation.ObligationData memory demand
    ) internal returns (bytes32) {
        bytes32 sellAttestation = erc20Payment.doObligationFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!erc20Escrow.collectEscrow(buyAttestation, sellAttestation)) {
            revert CouldntCollectEscrow();
        }

        return sellAttestation;
    }

    function permitAndBuyErc20ForErc20(
        address bidToken,
        uint256 bidAmount,
        address askToken,
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
            _buyErc20ForErc20(
                bidToken,
                bidAmount,
                askToken,
                askAmount,
                expiration
            );
    }

    function permitAndPayErc20ForErc20(
        bytes32 buyAttestation,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC20EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC20EscrowObligation.ObligationData)
        );
        ERC20PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.ObligationData)
        );

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

        return _payErc20ForErc20(buyAttestation, demand);
    }

    function buyErc20ForErc20(
        address bidToken,
        uint256 bidAmount,
        address askToken,
        uint256 askAmount,
        uint64 expiration
    ) external returns (bytes32) {
        return
            _buyErc20ForErc20(
                bidToken,
                bidAmount,
                askToken,
                askAmount,
                expiration
            );
    }

    function payErc20ForErc20(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC20EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC20EscrowObligation.ObligationData)
        );
        ERC20PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.ObligationData)
        );

        return _payErc20ForErc20(buyAttestation, demand);
    }
}
