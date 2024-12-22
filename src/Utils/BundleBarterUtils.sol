// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {BundleEscrowObligation} from "../Statements/BundleEscrowObligation.sol";
import {BundlePaymentObligation} from "../Statements/BundlePaymentObligation.sol";
import {IERC20Permit} from "@openzeppelin/token/ERC20/extensions/IERC20Permit.sol";
import {IERC721} from "@openzeppelin/token/ERC721/IERC721.sol";
import {IERC1155} from "@openzeppelin/token/ERC1155/IERC1155.sol";

contract BundleBarterUtils {
    IEAS internal eas;
    BundleEscrowObligation internal bundleEscrow;
    BundlePaymentObligation internal bundlePayment;

    error CouldntCollectPayment();
    error InvalidSignatureLength();

    struct ERC20PermitSignature {
        uint8 v;
        bytes32 r;
        bytes32 s;
        uint256 deadline;
    }

    constructor(
        IEAS _eas,
        BundleEscrowObligation _bundleEscrow,
        BundlePaymentObligation _bundlePayment
    ) {
        eas = _eas;
        bundleEscrow = _bundleEscrow;
        bundlePayment = _bundlePayment;
    }

    function permitAndEscrowBundle(
        BundleEscrowObligation.StatementData calldata data,
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
            bundleEscrow.makeStatementFor(
                data,
                expiration,
                msg.sender,
                msg.sender
            );
    }

    function permitAndPayBundle(
        BundlePaymentObligation.StatementData calldata data,
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

        return bundlePayment.makeStatementFor(data, msg.sender, msg.sender);
    }

    function _buyBundleForBundle(
        BundleEscrowObligation.StatementData memory bidBundle,
        BundlePaymentObligation.StatementData memory askBundle,
        uint64 expiration
    ) internal returns (bytes32) {
        return
            bundleEscrow.makeStatementFor(
                BundleEscrowObligation.StatementData({
                    erc20Tokens: bidBundle.erc20Tokens,
                    erc20Amounts: bidBundle.erc20Amounts,
                    erc721Tokens: bidBundle.erc721Tokens,
                    erc721TokenIds: bidBundle.erc721TokenIds,
                    erc1155Tokens: bidBundle.erc1155Tokens,
                    erc1155TokenIds: bidBundle.erc1155TokenIds,
                    erc1155Amounts: bidBundle.erc1155Amounts,
                    arbiter: address(bundlePayment),
                    demand: abi.encode(askBundle)
                }),
                expiration,
                msg.sender,
                msg.sender
            );
    }

    function _payBundleForBundle(
        bytes32 buyAttestation,
        BundlePaymentObligation.StatementData memory demand
    ) internal returns (bytes32) {
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

    function permitAndEscrowBundleForBundle(
        BundleEscrowObligation.StatementData calldata bidBundle,
        BundlePaymentObligation.StatementData calldata askBundle,
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
        BundleEscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (BundleEscrowObligation.StatementData)
        );
        BundlePaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (BundlePaymentObligation.StatementData)
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
        BundleEscrowObligation.StatementData calldata bidBundle,
        BundlePaymentObligation.StatementData calldata askBundle,
        uint64 expiration
    ) external returns (bytes32) {
        return _buyBundleForBundle(bidBundle, askBundle, expiration);
    }

    function payBundleForBundle(
        bytes32 buyAttestation
    ) external returns (bytes32) {
        Attestation memory bid = eas.getAttestation(buyAttestation);
        BundleEscrowObligation.StatementData memory escrowData = abi.decode(
            bid.data,
            (BundleEscrowObligation.StatementData)
        );
        BundlePaymentObligation.StatementData memory demand = abi.decode(
            escrowData.demand,
            (BundlePaymentObligation.StatementData)
        );

        return _payBundleForBundle(buyAttestation, demand);
    }
}
