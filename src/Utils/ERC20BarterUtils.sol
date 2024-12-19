// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ERC20PaymentFulfillmentArbiter} from "../Validators/ERC20PaymentFulfillmentArbiter.sol";
import {ERC20EscrowObligation} from "../Statements/ERC20EscrowObligation.sol";
import {IERC20Permit} from "@openzeppelin/token/ERC20/extensions/IERC20Permit.sol";

contract ERC20BarterUtils {
    IEAS internal eas;
    ERC20EscrowObligation internal erc20Payment;
    ERC20PaymentFulfillmentArbiter internal erc20Fulfillment;

    error CouldntCollectPayment();

    constructor(
        address _eas,
        address payable _erc20Payment,
        address _erc20Fulfillment
    ) {
        eas = IEAS(_eas);
        erc20Payment = ERC20EscrowObligation(_erc20Payment);
        erc20Fulfillment = ERC20PaymentFulfillmentArbiter(_erc20Fulfillment);
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
            address(this),
            amount,
            block.timestamp + 1,
            v,
            r,
            s
        );
        return
            erc20Payment.makeStatementFor(
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
        bytes32 item,
        uint64 expiration,
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
                ERC20EscrowObligation.StatementData({
                    token: token,
                    amount: amount,
                    arbiter: address(0),
                    demand: ""
                }),
                expiration,
                item,
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
            erc20Payment.makeStatementFor(
                ERC20EscrowObligation.StatementData({
                    token: bidToken,
                    amount: bidAmount,
                    arbiter: address(erc20Fulfillment),
                    demand: abi.encode(
                        ERC20PaymentFulfillmentArbiter.DemandData({
                            token: askToken,
                            amount: askAmount
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
        bytes32 buyAttestation
    ) internal returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC20EscrowObligation.StatementData memory paymentData = abi.decode(
            bid.data,
            (ERC20EscrowObligation.StatementData)
        );
        ERC20PaymentFulfillmentArbiter.DemandData memory demand = abi.decode(
            paymentData.demand,
            (ERC20PaymentFulfillmentArbiter.DemandData)
        );

        bytes32 sellAttestation = erc20Payment.makeStatementFor(
            ERC20EscrowObligation.StatementData({
                token: demand.token,
                amount: demand.amount,
                arbiter: address(0),
                demand: ""
            }),
            0,
            buyAttestation,
            msg.sender,
            msg.sender
        );

        if (!erc20Payment.collectPayment(buyAttestation, sellAttestation)) {
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
            address(erc20Payment),
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
        address askToken,
        uint256 askAmount,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        IERC20Permit askTokenC = IERC20Permit(askToken);
        askTokenC.permit(
            msg.sender,
            address(erc20Payment),
            askAmount,
            block.timestamp + 1,
            v,
            r,
            s
        );
        return _payErc20ForErc20(buyAttestation);
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
        return _payErc20ForErc20(buyAttestation);
    }
}
