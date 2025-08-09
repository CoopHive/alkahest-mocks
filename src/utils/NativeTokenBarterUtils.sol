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

contract NativeTokenBarterUtils {
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

    // ============ Native Token to Native Token Functions ============

    function _buyEthForEth(
        uint256 bidAmount,
        uint256 askAmount,
        uint64 expiration
    ) internal returns (bytes32) {
        return
            nativeEscrow.doObligationFor{value: bidAmount}(
                NativeTokenEscrowObligation.ObligationData({
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

    function _payEthForEth(
        bytes32 buyAttestation,
        NativeTokenPaymentObligation.ObligationData memory demand
    ) internal returns (bytes32) {
        bytes32 sellAttestation = nativePayment.doObligationFor{
            value: demand.amount
        }(demand, msg.sender, msg.sender);

        if (!nativeEscrow.collectEscrow(buyAttestation, sellAttestation)) {
            revert CouldntCollectEscrow();
        }

        return sellAttestation;
    }

    function buyEthForEth(
        uint256 bidAmount,
        uint256 askAmount,
        uint64 expiration
    ) external payable returns (bytes32) {
        return _buyEthForEth(bidAmount, askAmount, expiration);
    }

    function payEthForEth(
        bytes32 buyAttestation
    ) external payable returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        NativeTokenEscrowObligation.ObligationData memory escrowData = abi
            .decode(bid.data, (NativeTokenEscrowObligation.ObligationData));
        NativeTokenPaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (NativeTokenPaymentObligation.ObligationData)
        );

        return _payEthForEth(buyAttestation, demand);
    }

    // ============ Cross-Token Functions ============

    // ============ Native Token to ERC20 Functions ============

    function buyErc20WithEth(
        uint256 bidAmount,
        address askToken,
        uint256 askAmount,
        uint64 expiration
    ) external payable returns (bytes32) {
        return
            nativeEscrow.doObligationFor{value: bidAmount}(
                NativeTokenEscrowObligation.ObligationData({
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

    function payEthForErc20(
        bytes32 buyAttestation
    ) external payable returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        if (bid.uid == bytes32(0)) {
            revert AttestationNotFound(buyAttestation);
        }
        ERC20EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC20EscrowObligation.ObligationData)
        );
        NativeTokenPaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (NativeTokenPaymentObligation.ObligationData)
        );

        bytes32 sellAttestation = nativePayment.doObligationFor{
            value: demand.amount
        }(demand, msg.sender, msg.sender);

        if (!erc20Escrow.collectEscrow(buyAttestation, sellAttestation)) {
            revert CouldntCollectEscrow();
        }

        return sellAttestation;
    }

    // ============ Native Token to ERC721 Functions ============

    function buyErc721WithEth(
        uint256 bidAmount,
        address askToken,
        uint256 askTokenId,
        uint64 expiration
    ) external payable returns (bytes32) {
        return
            nativeEscrow.doObligationFor{value: bidAmount}(
                NativeTokenEscrowObligation.ObligationData({
                    amount: bidAmount,
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

    // ============ Native Token to ERC1155 Functions ============

    function buyErc1155WithEth(
        uint256 bidAmount,
        address askToken,
        uint256 askTokenId,
        uint256 askAmount,
        uint64 expiration
    ) external payable returns (bytes32) {
        return
            nativeEscrow.doObligationFor{value: bidAmount}(
                NativeTokenEscrowObligation.ObligationData({
                    amount: bidAmount,
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

    function payEthForErc1155(
        bytes32 buyAttestation
    ) external payable returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        if (bid.uid == bytes32(0)) {
            revert AttestationNotFound(buyAttestation);
        }
        ERC1155EscrowObligation.ObligationData memory escrowData = abi.decode(
            bid.data,
            (ERC1155EscrowObligation.ObligationData)
        );
        NativeTokenPaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (NativeTokenPaymentObligation.ObligationData)
        );

        bytes32 sellAttestation = nativePayment.doObligationFor{
            value: demand.amount
        }(demand, msg.sender, msg.sender);

        if (!erc1155Escrow.collectEscrow(buyAttestation, sellAttestation)) {
            revert CouldntCollectEscrow();
        }

        return sellAttestation;
    }

    // ============ Native Token to Token Bundle Functions ============

    function buyBundleWithEth(
        uint256 bidAmount,
        TokenBundlePaymentObligation2.ObligationData calldata askData,
        uint64 expiration
    ) external payable returns (bytes32) {
        return
            nativeEscrow.doObligationFor{value: bidAmount}(
                NativeTokenEscrowObligation.ObligationData({
                    amount: bidAmount,
                    arbiter: address(bundlePayment),
                    demand: abi.encode(askData)
                }),
                expiration,
                msg.sender,
                msg.sender
            );
    }

    function payEthForBundle(
        bytes32 buyAttestation
    ) external payable returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        TokenBundleEscrowObligation2.ObligationData memory escrowData = abi
            .decode(bid.data, (TokenBundleEscrowObligation2.ObligationData));
        NativeTokenPaymentObligation.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (NativeTokenPaymentObligation.ObligationData)
        );

        bytes32 sellAttestation = nativePayment.doObligationFor{
            value: demand.amount
        }(demand, msg.sender, msg.sender);

        if (!bundleEscrow.collectEscrow(buyAttestation, sellAttestation)) {
            revert CouldntCollectEscrow();
        }

        return sellAttestation;
    }

    // Allow contract to receive ETH (for potential refunds or other operations)
    receive() external payable {}
}
