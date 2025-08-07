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
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ERC721BarterUtils {
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

    // ============ ERC721 to ERC721 Functions ============

    function _buyErc721ForErc721(
        address bidToken,
        uint256 bidTokenId,
        address askToken,
        uint256 askTokenId,
        uint64 expiration
    ) internal returns (bytes32) {
        return
            erc721Escrow.doObligationFor(
                ERC721EscrowObligation.ObligationData({
                    token: bidToken,
                    tokenId: bidTokenId,
                    arbiter: address(erc721Payment),
                    demand: abi.encode(
                        ERC721PaymentObligation.ObligationData({
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

    function _payErc721ForErc721(
        bytes32 buyAttestation,
        ERC721PaymentObligation.ObligationData memory demand
    ) internal returns (bytes32) {
        bytes32 sellAttestation = erc721Payment.doObligationFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!erc721Escrow.collectEscrow(buyAttestation, sellAttestation)) {
            revert CouldntCollectEscrow();
        }

        return sellAttestation;
    }

    function buyErc721ForErc721(
        address bidToken,
        uint256 bidTokenId,
        address askToken,
        uint256 askTokenId,
        uint64 expiration
    ) external returns (bytes32) {
        return
            _buyErc721ForErc721(
                bidToken,
                bidTokenId,
                askToken,
                askTokenId,
                expiration
            );
    }

    function payErc721ForErc721(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        ERC721EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC721EscrowObligation.ObligationData)
        );
        ERC721PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC721PaymentObligation.ObligationData)
        );

        return _payErc721ForErc721(buyAttestation, demand);
    }

    // ============ Cross-Token Functions ============

    // ============ ERC721 to ERC20 Functions ============

    function buyErc20WithErc721(
        address bidToken,
        uint256 bidTokenId,
        address askToken,
        uint256 askAmount,
        uint64 expiration
    ) external returns (bytes32) {
        return
            erc721Escrow.doObligationFor(
                ERC721EscrowObligation.ObligationData({
                    token: bidToken,
                    tokenId: bidTokenId,
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

    function payErc721ForErc20(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        if (bid.uid == bytes32(0)) {
            revert AttestationNotFound(buyAttestation);
        }
        ERC20EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC20EscrowObligation.ObligationData)
        );
        ERC721PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC721PaymentObligation.ObligationData)
        );

        bytes32 sellAttestation = erc721Payment.doObligationFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!erc20Escrow.collectEscrow(buyAttestation, sellAttestation)) {
            revert CouldntCollectEscrow();
        }

        return sellAttestation;
    }

    // ============ ERC721 to ERC1155 Functions ============

    function buyErc1155WithErc721(
        address bidToken,
        uint256 bidTokenId,
        address askToken,
        uint256 askTokenId,
        uint256 askAmount,
        uint64 expiration
    ) external returns (bytes32) {
        return
            erc721Escrow.doObligationFor(
                ERC721EscrowObligation.ObligationData({
                    token: bidToken,
                    tokenId: bidTokenId,
                    arbiter: address(erc1155Payment),
                    demand: abi.encode(
                        ERC1155PaymentObligation.ObligationData({
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

    function payErc721ForErc1155(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        if (bid.uid == bytes32(0)) {
            revert AttestationNotFound(buyAttestation);
        }
        ERC1155EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC1155EscrowObligation.ObligationData)
        );
        ERC721PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC721PaymentObligation.ObligationData)
        );

        bytes32 sellAttestation = erc721Payment.doObligationFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!erc1155Escrow.collectEscrow(buyAttestation, sellAttestation)) {
            revert CouldntCollectEscrow();
        }

        return sellAttestation;
    }

    // ============ ERC721 to Token Bundle Functions ============

    function buyBundleWithErc721(
        address bidToken,
        uint256 bidTokenId,
        TokenBundlePaymentObligation2.ObligationData calldata askData,
        uint64 expiration
    ) external returns (bytes32) {
        return
            erc721Escrow.doObligationFor(
                ERC721EscrowObligation.ObligationData({
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

    function payErc721ForBundle(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        TokenBundleEscrowObligation2.ObligationData memory escrowData = abi
            .decode(bid.data, (TokenBundleEscrowObligation2.ObligationData));
        ERC721PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC721PaymentObligation.ObligationData)
        );

        bytes32 sellAttestation = erc721Payment.doObligationFor(
            demand,
            msg.sender,
            msg.sender
        );

        // Fix: Use bundleEscrow instead of erc721Escrow
        // The original escrow was made with TokenBundleEscrowObligation
        if (!bundleEscrow.collectEscrow(buyAttestation, sellAttestation)) {
            revert CouldntCollectEscrow();
        }

        return sellAttestation;
    }

    // ============ ERC721 to Native Token (ETH) Functions ============

    function buyEthWithErc721(
        address bidToken,
        uint256 bidTokenId,
        uint256 askAmount,
        uint64 expiration
    ) external returns (bytes32) {
        return
            erc721Escrow.doObligationFor(
                ERC721EscrowObligation.ObligationData({
                    token: bidToken,
                    tokenId: bidTokenId,
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

    function payErc721ForEth(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        if (bid.uid == bytes32(0)) {
            revert AttestationNotFound(buyAttestation);
        }
        NativeTokenEscrowObligation.ObligationData memory escrowData = abi
            .decode(bid.data, (NativeTokenEscrowObligation.ObligationData));
        ERC721PaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (ERC721PaymentObligation.ObligationData)
        );

        bytes32 sellAttestation = erc721Payment.doObligationFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!nativeEscrow.collectEscrow(buyAttestation, sellAttestation)) {
            revert CouldntCollectEscrow();
        }

        return sellAttestation;
    }

    function payEthForErc721(
        bytes32 buyAttestation
    ) external payable returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        if (bid.uid == bytes32(0)) {
            revert AttestationNotFound(buyAttestation);
        }
        ERC721EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC721EscrowObligation.ObligationData)
        );
        NativeTokenPaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (NativeTokenPaymentObligation.ObligationData)
        );

        bytes32 sellAttestation = nativePayment.doObligationFor{
            value: demand.amount
        }(demand, msg.sender, msg.sender);

        if (!erc721Escrow.collectEscrow(buyAttestation, sellAttestation)) {
            revert CouldntCollectEscrow();
        }

        return sellAttestation;
    }
}
