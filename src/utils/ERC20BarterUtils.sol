// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ERC20EscrowObligation} from "../obligations/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "../obligations/ERC20PaymentObligation.sol";
import {ERC721EscrowObligation} from "../obligations/ERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "../obligations/ERC721PaymentObligation.sol";
import {ERC1155EscrowObligation} from "../obligations/ERC1155EscrowObligation.sol";
import {ERC1155PaymentObligation} from "../obligations/ERC1155PaymentObligation.sol";
import {TokenBundleEscrowObligation2} from "../obligations/TokenBundleEscrowObligation2.sol";
import {TokenBundlePaymentObligation2} from "../obligations/TokenBundlePaymentObligation2.sol";
import {NativeTokenEscrowObligation} from "../obligations/NativeTokenEscrowObligation.sol";
import {NativeTokenPaymentObligation} from "../obligations/NativeTokenPaymentObligation.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

contract ERC20BarterUtils {
    IEAS internal eas;
    ERC20EscrowObligation internal erc20Escrow;
    ERC20PaymentObligation internal erc20Payment;
    ERC721EscrowObligation internal erc721Escrow;
    ERC721PaymentObligation internal erc721Payment;
    ERC1155EscrowObligation internal erc1155Escrow;
    ERC1155PaymentObligation internal erc1155Payment;
    TokenBundleEscrowObligation2 internal bundleEscrow;
    TokenBundlePaymentObligation2 internal bundlePayment;
    NativeTokenEscrowObligation internal nativeEscrow;
    NativeTokenPaymentObligation internal nativePayment;

    error CouldntCollectEscrow();
    error PermitFailed(address token, string reason);
    error AttestationNotFound(bytes32 attestationId);

    constructor(
        IEAS _eas,
        ERC20EscrowObligation _erc20Escrow,
        ERC20PaymentObligation _erc20Payment,
        ERC721EscrowObligation _erc721Escrow,
        ERC721PaymentObligation _erc721Payment,
        ERC1155EscrowObligation _erc1155Escrow,
        ERC1155PaymentObligation _erc1155Payment,
        TokenBundleEscrowObligation2 _bundleEscrow,
        TokenBundlePaymentObligation2 _bundlePayment,
        NativeTokenEscrowObligation _nativeEscrow,
        NativeTokenPaymentObligation _nativePayment
    ) {
        eas = _eas;
        erc20Escrow = _erc20Escrow;
        erc20Payment = _erc20Payment;
        erc721Escrow = _erc721Escrow;
        erc721Payment = _erc721Payment;
        erc1155Escrow = _erc1155Escrow;
        erc1155Payment = _erc1155Payment;
        bundleEscrow = _bundleEscrow;
        bundlePayment = _bundlePayment;
        nativeEscrow = _nativeEscrow;
        nativePayment = _nativePayment;
    }

    // ============ ERC20 to ERC20 Functions ============

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

    // ============ Cross-Token Functions ============

    // Internal helper for permit
    function _permitPayment(
        ERC20PaymentObligation.ObligationData memory demand,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal {
        IERC20Permit askTokenC = IERC20Permit(demand.token);

        try
            askTokenC.permit(
                msg.sender,
                address(erc20Payment),
                demand.amount,
                deadline,
                v,
                r,
                s
            )
        {} catch Error(string memory reason) {
            revert PermitFailed(demand.token, reason);
        } catch {
            revert PermitFailed(demand.token, "Unknown error");
        }
    }

    // ============ ERC20 to ERC721 Functions ============

    function _buyErc721WithErc20(
        address bidToken,
        uint256 bidAmount,
        address askToken,
        uint256 askId,
        uint64 expiration
    ) internal returns (bytes32) {
        return
            erc20Escrow.doObligationFor(
                ERC20EscrowObligation.ObligationData({
                    token: bidToken,
                    amount: bidAmount,
                    arbiter: address(erc721Payment),
                    demand: abi.encode(
                        ERC721PaymentObligation.ObligationData({
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

    function _payErc20ForErc721(
        bytes32 buyAttestation,
        ERC20PaymentObligation.ObligationData memory demand
    ) internal returns (bytes32) {
        bytes32 sellAttestation = erc20Payment.doObligationFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!erc721Escrow.collectEscrow(buyAttestation, sellAttestation)) {
            revert CouldntCollectEscrow();
        }

        return sellAttestation;
    }

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
        try
            bidTokenC.permit(
                msg.sender,
                address(erc20Escrow),
                bidAmount,
                deadline,
                v,
                r,
                s
            )
        {} catch Error(string memory reason) {
            revert PermitFailed(bidToken, reason);
        } catch {
            revert PermitFailed(bidToken, "Unknown error");
        }

        return
            _buyErc721WithErc20(
                bidToken,
                bidAmount,
                askToken,
                askId,
                expiration
            );
    }

    function payErc20ForErc721(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        if (bid.uid == bytes32(0)) {
            revert AttestationNotFound(buyAttestation);
        }

        ERC721EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC721EscrowObligation.ObligationData)
        );
        ERC20PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.ObligationData)
        );

        return _payErc20ForErc721(buyAttestation, demand);
    }

    function permitAndPayErc20ForErc721(
        bytes32 buyAttestation,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC721EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC721EscrowObligation.ObligationData)
        );
        ERC20PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.ObligationData)
        );

        _permitPayment(demand, deadline, v, r, s);
        return _payErc20ForErc721(buyAttestation, demand);
    }

    // ============ ERC20 to ERC1155 Functions ============

    function _buyErc1155WithErc20(
        address bidToken,
        uint256 bidAmount,
        address askToken,
        uint256 askId,
        uint256 askAmount,
        uint64 expiration
    ) internal returns (bytes32) {
        return
            erc20Escrow.doObligationFor(
                ERC20EscrowObligation.ObligationData({
                    token: bidToken,
                    amount: bidAmount,
                    arbiter: address(erc1155Payment),
                    demand: abi.encode(
                        ERC1155PaymentObligation.ObligationData({
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

    function _payErc20ForErc1155(
        bytes32 buyAttestation,
        ERC20PaymentObligation.ObligationData memory demand
    ) internal returns (bytes32) {
        bytes32 sellAttestation = erc20Payment.doObligationFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!erc1155Escrow.collectEscrow(buyAttestation, sellAttestation)) {
            revert CouldntCollectEscrow();
        }

        return sellAttestation;
    }

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
        try
            bidTokenC.permit(
                msg.sender,
                address(erc20Escrow),
                bidAmount,
                deadline,
                v,
                r,
                s
            )
        {} catch Error(string memory reason) {
            revert PermitFailed(bidToken, reason);
        } catch {
            revert PermitFailed(bidToken, "Unknown error");
        }

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

    function payErc20ForErc1155(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid;
        try eas.getAttestation(buyAttestation) returns (
            Attestation memory _bid
        ) {
            bid = _bid;
        } catch {
            revert AttestationNotFound(buyAttestation);
        }

        ERC1155EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC1155EscrowObligation.ObligationData)
        );
        ERC20PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.ObligationData)
        );

        return _payErc20ForErc1155(buyAttestation, demand);
    }

    function permitAndPayErc20ForErc1155(
        bytes32 buyAttestation,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC1155EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC1155EscrowObligation.ObligationData)
        );
        ERC20PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.ObligationData)
        );

        _permitPayment(demand, deadline, v, r, s);
        return _payErc20ForErc1155(buyAttestation, demand);
    }

    // ============ ERC20 to Token Bundle Functions ============

    function _buyBundleWithErc20(
        address bidToken,
        uint256 bidAmount,
        TokenBundlePaymentObligation2.ObligationData memory askData,
        uint64 expiration
    ) internal returns (bytes32) {
        return
            erc20Escrow.doObligationFor(
                ERC20EscrowObligation.ObligationData({
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

    function _payErc20ForBundle(
        bytes32 buyAttestation,
        ERC20PaymentObligation.ObligationData memory demand
    ) internal returns (bytes32) {
        bytes32 sellAttestation = erc20Payment.doObligationFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!bundleEscrow.collectEscrow(buyAttestation, sellAttestation)) {
            revert CouldntCollectEscrow();
        }

        return sellAttestation;
    }

    function buyBundleWithErc20(
        address bidToken,
        uint256 bidAmount,
        TokenBundlePaymentObligation2.ObligationData calldata askData,
        uint64 expiration
    ) external returns (bytes32) {
        return _buyBundleWithErc20(bidToken, bidAmount, askData, expiration);
    }

    function permitAndBuyBundleWithErc20(
        address bidToken,
        uint256 bidAmount,
        TokenBundlePaymentObligation2.ObligationData calldata askData,
        uint64 expiration,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        IERC20Permit bidTokenC = IERC20Permit(bidToken);
        try
            bidTokenC.permit(
                msg.sender,
                address(erc20Escrow),
                bidAmount,
                deadline,
                v,
                r,
                s
            )
        {} catch Error(string memory reason) {
            revert PermitFailed(bidToken, reason);
        } catch {
            revert PermitFailed(bidToken, "Unknown error");
        }

        return _buyBundleWithErc20(bidToken, bidAmount, askData, expiration);
    }

    function payErc20ForBundle(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid;
        try eas.getAttestation(buyAttestation) returns (
            Attestation memory _bid
        ) {
            bid = _bid;
        } catch {
            revert AttestationNotFound(buyAttestation);
        }

        TokenBundleEscrowObligation2.ObligationData memory escrowData = abi
            .decode(bid.data, (TokenBundleEscrowObligation2.ObligationData));
        ERC20PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.ObligationData)
        );

        return _payErc20ForBundle(buyAttestation, demand);
    }

    function permitAndPayErc20ForBundle(
        bytes32 buyAttestation,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        TokenBundleEscrowObligation2.ObligationData memory escrowData = abi
            .decode(bid.data, (TokenBundleEscrowObligation2.ObligationData));
        ERC20PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.ObligationData)
        );

        _permitPayment(demand, deadline, v, r, s);
        return _payErc20ForBundle(buyAttestation, demand);
    }

    // ============ ERC20 to Native Token Functions ============

    function _buyEthWithErc20(
        address bidToken,
        uint256 bidAmount,
        uint256 askAmount,
        uint64 expiration
    ) internal returns (bytes32) {
        return
            erc20Escrow.doObligationFor(
                ERC20EscrowObligation.ObligationData({
                    token: bidToken,
                    amount: bidAmount,
                    arbiter: address(nativePayment),
                    demand: abi.encode(
                        NativeTokenPaymentObligation.ObligationData({
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

    function _payErc20ForEth(
        bytes32 buyAttestation,
        ERC20PaymentObligation.ObligationData memory demand
    ) internal returns (bytes32) {
        bytes32 sellAttestation = erc20Payment.doObligationFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!nativeEscrow.collectEscrow(buyAttestation, sellAttestation)) {
            revert CouldntCollectEscrow();
        }

        return sellAttestation;
    }

    function buyEthWithErc20(
        address bidToken,
        uint256 bidAmount,
        uint256 askAmount,
        uint64 expiration
    ) external returns (bytes32) {
        return _buyEthWithErc20(bidToken, bidAmount, askAmount, expiration);
    }

    function permitAndBuyEthWithErc20(
        address bidToken,
        uint256 bidAmount,
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
        return _buyEthWithErc20(bidToken, bidAmount, askAmount, expiration);
    }

    function payErc20ForEth(bytes32 buyAttestation) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        if (bid.uid == bytes32(0)) {
            revert AttestationNotFound(buyAttestation);
        }
        NativeTokenEscrowObligation.ObligationData memory escrowData = abi
            .decode(bid.data, (NativeTokenEscrowObligation.ObligationData));
        ERC20PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.ObligationData)
        );

        return _payErc20ForEth(buyAttestation, demand);
    }

    function permitAndPayErc20ForEth(
        bytes32 buyAttestation,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        NativeTokenEscrowObligation.ObligationData memory escrowData = abi
            .decode(bid.data, (NativeTokenEscrowObligation.ObligationData));
        ERC20PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC20PaymentObligation.ObligationData)
        );

        _permitPayment(demand, deadline, v, r, s);
        return _payErc20ForEth(buyAttestation, demand);
    }
}
