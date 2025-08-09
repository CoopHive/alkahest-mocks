// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {BaseEscrowObligation} from "../BaseEscrowObligation.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";
import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ERC721EscrowObligation is BaseEscrowObligation, IArbiter {
    using ArbiterUtils for Attestation;

    struct ObligationData {
        address arbiter;
        bytes demand;
        address token;
        uint256 tokenId;
    }

    error ERC721TransferFailed(
        address token,
        address from,
        address to,
        uint256 tokenId
    );

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseEscrowObligation(
            _eas,
            _schemaRegistry,
            "address arbiter, bytes demand, address token, uint256 tokenId",
            true
        )
    {}

    // Extract arbiter and demand from encoded data
    function extractArbiterAndDemand(
        bytes memory data
    ) public pure override returns (address arbiter, bytes memory demand) {
        ObligationData memory decoded = abi.decode(data, (ObligationData));
        return (decoded.arbiter, decoded.demand);
    }

    // Transfer token into escrow
    function _lockEscrow(bytes memory data, address from) internal override {
        ObligationData memory decoded = abi.decode(data, (ObligationData));

        try
            IERC721(decoded.token).transferFrom(
                from,
                address(this),
                decoded.tokenId
            )
        {} catch {
            revert ERC721TransferFailed(
                decoded.token,
                from,
                address(this),
                decoded.tokenId
            );
        }
    }

    // Transfer token to fulfiller
    function _releaseEscrow(
        bytes memory escrowData,
        address to,
        bytes32 /* fulfillmentUid */
    ) internal override returns (bytes memory) {
        ObligationData memory decoded = abi.decode(
            escrowData,
            (ObligationData)
        );

        try
            IERC721(decoded.token).transferFrom(
                address(this),
                to,
                decoded.tokenId
            )
        {} catch {
            revert ERC721TransferFailed(
                decoded.token,
                address(this),
                to,
                decoded.tokenId
            );
        }

        return "";
    }

    // Return token to original owner on expiry
    function _returnEscrow(bytes memory data, address to) internal override {
        _releaseEscrow(data, to, bytes32(0));
    }

    // Implement IArbiter
    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 /* counteroffer */
    ) public view override returns (bool) {
        if (!obligation._checkIntrinsic(ATTESTATION_SCHEMA)) return false;

        ObligationData memory payment = abi.decode(
            obligation.data,
            (ObligationData)
        );
        ObligationData memory demandData = abi.decode(demand, (ObligationData));

        return
            payment.token == demandData.token &&
            payment.tokenId == demandData.tokenId &&
            payment.arbiter == demandData.arbiter &&
            keccak256(payment.demand) == keccak256(demandData.demand);
    }

    // Typed convenience methods
    function doObligation(
        ObligationData calldata data,
        uint64 expirationTime
    ) external returns (bytes32) {
        return
            this.doObligationForRaw(
                abi.encode(data),
                expirationTime,
                msg.sender,
                msg.sender,
                bytes32(0)
            );
    }

    function doObligationFor(
        ObligationData calldata data,
        uint64 expirationTime,
        address payer,
        address recipient
    ) external returns (bytes32) {
        return
            this.doObligationForRaw(
                abi.encode(data),
                expirationTime,
                payer,
                recipient,
                bytes32(0)
            );
    }

    function collectEscrow(
        bytes32 escrow,
        bytes32 fulfillment
    ) external returns (bool) {
        collectEscrowRaw(escrow, fulfillment);
        return true;
    }

    function getObligationData(
        bytes32 uid
    ) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    function decodeObligationData(
        bytes calldata data
    ) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
