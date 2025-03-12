// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ERC721EscrowObligation} from "../obligations/ERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "../obligations/ERC721PaymentObligation.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ERC721BarterUtils {
    IEAS internal eas;
    ERC721EscrowObligation internal erc721Escrow;
    ERC721PaymentObligation internal erc721Payment;

    error CouldntCollectPayment();

    constructor(
        IEAS _eas,
        ERC721EscrowObligation _erc721Escrow,
        ERC721PaymentObligation _erc721Payment
    ) {
        eas = _eas;
        erc721Escrow = _erc721Escrow;
        erc721Payment = _erc721Payment;
    }

    function _buyErc721ForErc721(
        address bidToken,
        uint256 bidTokenId,
        address askToken,
        uint256 askTokenId,
        uint64 expiration
    ) internal returns (bytes32) {
        return
            erc721Escrow.makeStatementFor(
                ERC721EscrowObligation.StatementData({
                    token: bidToken,
                    tokenId: bidTokenId,
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

    function _payErc721ForErc721(
        bytes32 buyAttestation,
        ERC721PaymentObligation.StatementData memory demand
    ) internal returns (bytes32) {
        bytes32 sellAttestation = erc721Payment.makeStatementFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!erc721Escrow.collectPayment(buyAttestation, sellAttestation)) {
            revert CouldntCollectPayment();
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
        ERC721EscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (ERC721EscrowObligation.StatementData)
        );
        ERC721PaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (ERC721PaymentObligation.StatementData)
        );

        return _payErc721ForErc721(buyAttestation, demand);
    }
}
