// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ERC20EscrowObligation} from "../Statements/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "../Statements/ERC20PaymentObligation.sol";
import {IERC20Permit} from "@openzeppelin/token/ERC20/extensions/IERC20Permit.sol";

contract ERC20BarterUtils {
    IEAS internal eas;
    ERC20EscrowObligation internal erc20Escrow;
    ERC20PaymentObligation internal erc20Payment;

    error CouldntCollectPayment();

    constructor(
        address _eas,
        address payable _erc20Escrow,
        address payable _erc20Payment
    ) {
        eas = IEAS(_eas);
        erc20Escrow = ERC20EscrowObligation(_erc20Escrow);
        erc20Payment = ERC20PaymentObligation(_erc20Payment);
    }

    function permitAndBuyWithErc20(
        address token,
        uint256 amount,
        address arbiter,
        bytes memory demand,
        uint64 expiration,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        IERC20Permit tokenC = IERC20Permit(token);
        tokenC.permit(
            msg.sender,
            address(erc20Escrow),
            amount,
            block.timestamp + 1,
            v,
            r,
            s
        );
        return
            erc20Escrow.makeStatementFor(
                ERC20EscrowObligation.StatementData({
                    token: token,
                    amount: amount,
                    arbiter: arbiter,
                    demand: demand
                }),
                expiration,
                bytes32(0),
                msg.sender,
                msg.sender
            );
    }

    function permitAndPayWithErc20(
        address token,
        uint256 amount,
        address payee,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        IERC20Permit tokenC = IERC20Permit(token);
        tokenC.permit(
            msg.sender,
            address(erc20Payment),
            amount,
            block.timestamp + 1,
            v,
            r,
            s
        );
        return
            erc20Payment.makeStatementFor(
                ERC20PaymentObligation.StatementData({
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
            erc20Escrow.makeStatementFor(
                ERC20EscrowObligation.StatementData({
                    token: bidToken,
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
                bytes32(0),
                msg.sender,
                msg.sender
            );
    }

    function _payErc20ForErc20(
        bytes32 buyAttestation,
        ERC20PaymentObligation.StatementData memory demand
    ) internal returns (bytes32) {
        bytes32 sellAttestation = erc20Payment.makeStatementFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!erc20Escrow.collectPayment(buyAttestation, sellAttestation)) {
            revert CouldntCollectPayment();
        }

        return sellAttestation;
    }

    function permitAndBuyErc20ForErc20(
        address bidToken,
        uint256 bidAmount,
        address askToken,
        uint256 askAmount,
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
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC20EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC20EscrowObligation.StatementData)
        );
        ERC20PaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.StatementData)
        );

        IERC20Permit askTokenC = IERC20Permit(demand.token);
        askTokenC.permit(
            msg.sender,
            address(erc20Payment),
            demand.amount,
            block.timestamp + 1,
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
        ERC20EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC20EscrowObligation.StatementData)
        );
        ERC20PaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.StatementData)
        );

        return _payErc20ForErc20(buyAttestation, demand);
    }
}
