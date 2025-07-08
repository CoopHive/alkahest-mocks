// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {BaseObligation} from "../BaseObligation.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract ERC721EscrowObligation is BaseObligation, IArbiter {
    using ArbiterUtils for Attestation;

    struct ObligationData {
        address arbiter;
        bytes demand;
        address token;
        uint256 tokenId;
    }

    event EscrowMade(bytes32 indexed payment, address indexed buyer);
    event EscrowClaimed(
        bytes32 indexed payment,
        bytes32 indexed fulfillment,
        address indexed fulfiller
    );

    error InvalidEscrow();
    error InvalidEscrowAttestation();
    error InvalidFulfillment();
    error UnauthorizedCall();
    error ERC721TransferFailed(
        address token,
        address from,
        address to,
        uint256 tokenId
    );
    error AttestationNotFound(bytes32 attestationId);
    error AttestationCreateFailed();
    error RevocationFailed(bytes32 attestationId);

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseObligation(
            _eas,
            _schemaRegistry,
            "address arbiter, bytes demand, address token, uint256 tokenId",
            true
        )
    {}

    function doObligationFor(
        ObligationData calldata data,
        uint64 expirationTime,
        address payer,
        address recipient
    ) public returns (bytes32 uid_) {
        // Try token transfer with error handling
        try
            IERC721(data.token).transferFrom(payer, address(this), data.tokenId)
        {
            // Transfer succeeded
        } catch {
            revert ERC721TransferFailed(
                data.token,
                payer,
                address(this),
                data.tokenId
            );
        }

        // Create attestation with try/catch for potential EAS failures
        try
            eas.attest(
                AttestationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: AttestationRequestData({
                        recipient: recipient,
                        expirationTime: expirationTime,
                        revocable: true,
                        refUID: bytes32(0),
                        data: abi.encode(data),
                        value: 0
                    })
                })
            )
        returns (bytes32 uid) {
            uid_ = uid;
            emit EscrowMade(uid_, recipient);
        } catch {
            // The revert will automatically revert all state changes including token transfers
            revert AttestationCreateFailed();
        }
    }

    function doObligation(
        ObligationData calldata data,
        uint64 expirationTime
    ) public returns (bytes32 uid_) {
        return doObligationFor(data, expirationTime, msg.sender, msg.sender);
    }

    function collectEscrow(
        bytes32 _payment,
        bytes32 _fulfillment
    ) public returns (bool) {
        Attestation memory payment;
        Attestation memory fulfillment;

        // Get payment attestation with error handling
        try eas.getAttestation(_payment) returns (Attestation memory result) {
            payment = result;
        } catch {
            revert AttestationNotFound(_payment);
        }

        // Get fulfillment attestation with error handling
        try eas.getAttestation(_fulfillment) returns (
            Attestation memory result
        ) {
            fulfillment = result;
        } catch {
            revert AttestationNotFound(_fulfillment);
        }

        if (!payment._checkIntrinsic()) revert InvalidEscrowAttestation();

        ObligationData memory paymentData = abi.decode(
            payment.data,
            (ObligationData)
        );

        if (
            !IArbiter(paymentData.arbiter).checkObligation(
                fulfillment,
                paymentData.demand,
                payment.uid
            )
        ) revert InvalidFulfillment();

        // Revoke attestation with error handling
        try
            eas.revoke(
                RevocationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: RevocationRequestData({uid: _payment, value: 0})
                })
            )
        {} catch {
            revert RevocationFailed(_payment);
        }

        // Transfer ERC721 token with error handling
        try
            IERC721(paymentData.token).transferFrom(
                address(this),
                fulfillment.recipient,
                paymentData.tokenId
            )
        {} catch {
            revert ERC721TransferFailed(
                paymentData.token,
                address(this),
                fulfillment.recipient,
                paymentData.tokenId
            );
        }

        emit EscrowClaimed(_payment, _fulfillment, fulfillment.recipient);
        return true;
    }

    function reclaimExpired(bytes32 uid) public returns (bool) {
        Attestation memory attestation;

        // Get attestation with error handling
        try eas.getAttestation(uid) returns (Attestation memory result) {
            attestation = result;
        } catch {
            revert AttestationNotFound(uid);
        }

        if (block.timestamp < attestation.expirationTime)
            revert UnauthorizedCall();

        ObligationData memory data = abi.decode(
            attestation.data,
            (ObligationData)
        );

        // Transfer ERC721 token with error handling
        try
            IERC721(data.token).transferFrom(
                address(this),
                attestation.recipient,
                data.tokenId
            )
        {} catch {
            revert ERC721TransferFailed(
                data.token,
                address(this),
                attestation.recipient,
                data.tokenId
            );
        }

        return true;
    }

    function checkObligation(
        Attestation memory statement,
        bytes memory demand,
        bytes32 /* counteroffer */
    ) public view override returns (bool) {
        if (!statement._checkIntrinsic(ATTESTATION_SCHEMA)) return false;

        ObligationData memory payment = abi.decode(
            statement.data,
            (ObligationData)
        );
        ObligationData memory demandData = abi.decode(demand, (ObligationData));

        return
            payment.token == demandData.token &&
            payment.tokenId == demandData.tokenId &&
            payment.arbiter == demandData.arbiter &&
            keccak256(payment.demand) == keccak256(demandData.demand);
    }

    function getObligationData(
        bytes32 uid
    ) public view returns (ObligationData memory) {
        Attestation memory attestation = eas.getAttestation(uid);
        if (attestation.schema != ATTESTATION_SCHEMA)
            revert InvalidEscrowAttestation();
        return abi.decode(attestation.data, (ObligationData));
    }

    function decodeObligationData(
        bytes calldata data
    ) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
