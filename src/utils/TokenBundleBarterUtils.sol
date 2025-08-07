// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {TokenBundleEscrowObligation2} from "../obligations/TokenBundleEscrowObligation2.sol";
import {TokenBundlePaymentObligation2} from "../obligations/TokenBundlePaymentObligation2.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

contract TokenBundleBarterUtils {
    IEAS internal eas;
    TokenBundleEscrowObligation2 internal bundleEscrow;
    TokenBundlePaymentObligation2 internal bundlePayment;

    error CouldntCollectEscrow();
    error InvalidSignatureLength();

    struct ERC20PermitSignature {
        uint8 v;
        bytes32 r;
        bytes32 s;
        uint256 deadline;
    }

    constructor(
        IEAS _eas,
        TokenBundleEscrowObligation2 _bundleEscrow,
        TokenBundlePaymentObligation2 _bundlePayment
    ) {
        eas = _eas;
        bundleEscrow = _bundleEscrow;
        bundlePayment = _bundlePayment;
    }

    function permitAndEscrowBundle(
        TokenBundleEscrowObligation2.ObligationData calldata data,
        uint64 expiration,
        ERC20PermitSignature[] calldata permits
    ) external returns (bytes32) {
        if (permits.length != data.erc20Tokens.length)
            revert InvalidSignatureLength();

        // Handle ERC20 permits
        for (uint i = 0; i < data.erc20Tokens.length; i++) {
            IERC20Permit(data.erc20Tokens[i]).permit(
                msg.sender,
                address(bundleEscrow),
                data.erc20Amounts[i],
                permits[i].deadline,
                permits[i].v,
                permits[i].r,
                permits[i].s
            );
        }

        return
            bundleEscrow.doObligationFor(
                data,
                expiration,
                msg.sender,
                msg.sender
            );
    }

    function permitAndPayBundle(
        TokenBundlePaymentObligation2.ObligationData calldata data,
        ERC20PermitSignature[] calldata permits
    ) external returns (bytes32) {
        if (permits.length != data.erc20Tokens.length)
            revert InvalidSignatureLength();

        // Handle ERC20 permits
        for (uint i = 0; i < data.erc20Tokens.length; i++) {
            IERC20Permit(data.erc20Tokens[i]).permit(
                msg.sender,
                address(bundlePayment),
                data.erc20Amounts[i],
                permits[i].deadline,
                permits[i].v,
                permits[i].r,
                permits[i].s
            );
        }

        return bundlePayment.doObligationFor(data, msg.sender, msg.sender);
    }

    function _buyBundleForBundle(
        TokenBundleEscrowObligation2.ObligationData memory bidBundle,
        TokenBundlePaymentObligation2.ObligationData memory askBundle,
        uint64 expiration
    ) internal returns (bytes32) {
        return
            bundleEscrow.doObligationFor(
                TokenBundleEscrowObligation2.ObligationData({
                    arbiter: address(bundlePayment),
                    demand: abi.encode(askBundle),
                    nativeAmount: bidBundle.nativeAmount,
                    erc20Tokens: bidBundle.erc20Tokens,
                    erc20Amounts: bidBundle.erc20Amounts,
                    erc721Tokens: bidBundle.erc721Tokens,
                    erc721TokenIds: bidBundle.erc721TokenIds,
                    erc1155Tokens: bidBundle.erc1155Tokens,
                    erc1155TokenIds: bidBundle.erc1155TokenIds,
                    erc1155Amounts: bidBundle.erc1155Amounts
                }),
                expiration,
                msg.sender,
                msg.sender
            );
    }

    function _payBundleForBundle(
        bytes32 buyAttestation,
        TokenBundlePaymentObligation2.ObligationData memory demand
    ) internal returns (bytes32) {
        bytes32 sellAttestation = bundlePayment.doObligationFor(
            demand,
            msg.sender,
            msg.sender
        );

        if (!bundleEscrow.collectEscrow(buyAttestation, sellAttestation)) {
            revert CouldntCollectEscrow();
        }

        return sellAttestation;
    }

    function permitAndEscrowBundleForBundle(
        TokenBundleEscrowObligation2.ObligationData calldata bidBundle,
        TokenBundlePaymentObligation2.ObligationData calldata askBundle,
        uint64 expiration,
        ERC20PermitSignature[] calldata permits
    ) external returns (bytes32) {
        if (permits.length != bidBundle.erc20Tokens.length)
            revert InvalidSignatureLength();

        // Handle ERC20 permits
        for (uint i = 0; i < bidBundle.erc20Tokens.length; i++) {
            IERC20Permit(bidBundle.erc20Tokens[i]).permit(
                msg.sender,
                address(bundleEscrow),
                bidBundle.erc20Amounts[i],
                permits[i].deadline,
                permits[i].v,
                permits[i].r,
                permits[i].s
            );
        }

        return _buyBundleForBundle(bidBundle, askBundle, expiration);
    }

    function permitAndPayBundleForBundle(
        bytes32 buyAttestation,
        ERC20PermitSignature[] calldata permits
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        TokenBundleEscrowObligation2.ObligationData memory escrowData = abi
            .decode(bid.data, (TokenBundleEscrowObligation2.ObligationData));
        TokenBundlePaymentObligation2.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (TokenBundlePaymentObligation2.ObligationData)
        );

        if (permits.length != demand.erc20Tokens.length)
            revert InvalidSignatureLength();

        // Handle ERC20 permits
        for (uint i = 0; i < demand.erc20Tokens.length; i++) {
            IERC20Permit(demand.erc20Tokens[i]).permit(
                msg.sender,
                address(bundlePayment),
                demand.erc20Amounts[i],
                permits[i].deadline,
                permits[i].v,
                permits[i].r,
                permits[i].s
            );
        }

        return _payBundleForBundle(buyAttestation, demand);
    }

    function buyBundleForBundle(
        TokenBundleEscrowObligation2.ObligationData calldata bidBundle,
        TokenBundlePaymentObligation2.ObligationData calldata askBundle,
        uint64 expiration
    ) external returns (bytes32) {
        return _buyBundleForBundle(bidBundle, askBundle, expiration);
    }

    function payBundleForBundle(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        TokenBundleEscrowObligation2.ObligationData memory escrowData = abi
            .decode(bid.data, (TokenBundleEscrowObligation2.ObligationData));
        TokenBundlePaymentObligation2.ObligationData memory demand = abi.decode(
            escrowData.demand,
            (TokenBundlePaymentObligation2.ObligationData)
        );

        return _payBundleForBundle(buyAttestation, demand);
    }
}
