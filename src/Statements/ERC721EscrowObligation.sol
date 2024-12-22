// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC721} from "@openzeppelin/token/ERC721/IERC721.sol";
import {BaseStatement} from "../BaseStatement.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract ERC721EscrowObligation is BaseStatement, IArbiter {
    using ArbiterUtils for Attestation;

    struct StatementData {
        address token;
        uint256 tokenId;
        address arbiter;
        bytes demand;
    }

    event PaymentMade(bytes32 indexed payment, address indexed buyer);
    event PaymentClaimed(
        bytes32 indexed payment,
        bytes32 indexed fulfillment,
        address indexed fulfiller
    );

    error InvalidPayment();
    error InvalidPaymentAttestation();
    error InvalidFulfillment();
    error UnauthorizedCall();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseStatement(
            _eas,
            _schemaRegistry,
            "address token, uint256 tokenId, address arbiter, bytes demand",
            true
        )
    {}

    function makeStatementFor(
        StatementData calldata data,
        uint64 expirationTime,
        address payer,
        address recipient
    ) public returns (bytes32 uid_) {
        IERC721(data.token).transferFrom(payer, address(this), data.tokenId);

        uid_ = eas.attest(
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
        );
        emit PaymentMade(uid_, recipient);
    }

    function makeStatement(
        StatementData calldata data,
        uint64 expirationTime
    ) public returns (bytes32 uid_) {
        return makeStatementFor(data, expirationTime, msg.sender, msg.sender);
    }

    function collectPayment(
        bytes32 _payment,
        bytes32 _fulfillment
    ) public returns (bool) {
        Attestation memory payment = eas.getAttestation(_payment);
        Attestation memory fulfillment = eas.getAttestation(_fulfillment);

        if (!payment._checkIntrinsic()) revert InvalidPaymentAttestation();

        StatementData memory paymentData = abi.decode(
            payment.data,
            (StatementData)
        );

        if (
            !IArbiter(paymentData.arbiter).checkStatement(
                fulfillment,
                paymentData.demand,
                payment.uid
            )
        ) revert InvalidFulfillment();

        eas.revoke(
            RevocationRequest({
                schema: ATTESTATION_SCHEMA,
                data: RevocationRequestData({uid: _payment, value: 0})
            })
        );

        IERC721(paymentData.token).transferFrom(
            address(this),
            fulfillment.recipient,
            paymentData.tokenId
        );
        return true;
    }

    function collectExpired(bytes32 uid) public returns (bool) {
        Attestation memory attestation = eas.getAttestation(uid);

        if (block.timestamp < attestation.expirationTime)
            revert UnauthorizedCall();

        StatementData memory data = abi.decode(
            attestation.data,
            (StatementData)
        );

        IERC721(data.token).transferFrom(
            address(this),
            attestation.recipient,
            data.tokenId
        );
        return true;
    }

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 /* counteroffer */
    ) public view override returns (bool) {
        if (!statement._checkIntrinsic(ATTESTATION_SCHEMA)) return false;

        StatementData memory payment = abi.decode(
            statement.data,
            (StatementData)
        );
        StatementData memory demandData = abi.decode(demand, (StatementData));

        return
            payment.token == demandData.token &&
            payment.tokenId == demandData.tokenId &&
            payment.arbiter == demandData.arbiter &&
            keccak256(payment.demand) == keccak256(demandData.demand);
    }
}
