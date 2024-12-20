// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC721} from "@openzeppelin/token/ERC721/IERC721.sol";
import {BaseStatement} from "../BaseStatement.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract ERC721PaymentObligation is BaseStatement, IArbiter {
    using ArbiterUtils for Attestation;

    struct StatementData {
        address token;
        uint256 tokenId;
        address arbiter;
        bytes demand;
    }

    error InvalidPayment();
    error InvalidPaymentAttestation();
    error InvalidFulfillment();
    error UnauthorizedCall();

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        BaseStatement(_eas, _schemaRegistry, "address token, uint256 tokenId, address arbiter, bytes demand", true)
    {}

    function makeStatement(StatementData calldata data, uint64 expirationTime, bytes32 refUID)
        public
        returns (bytes32)
    {
        IERC721(data.token).transferFrom(msg.sender, address(this), data.tokenId);

        return eas.attest(
            AttestationRequest({
                schema: ATTESTATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: msg.sender,
                    expirationTime: expirationTime,
                    revocable: true,
                    refUID: refUID,
                    data: abi.encode(data),
                    value: 0
                })
            })
        );
    }

    function collectPayment(bytes32 _payment, bytes32 _fulfillment) public returns (bool) {
        Attestation memory payment = eas.getAttestation(_payment);
        Attestation memory fulfillment = eas.getAttestation(_fulfillment);

        if (!payment._checkIntrinsic()) revert InvalidPaymentAttestation();

        StatementData memory paymentData = abi.decode(payment.data, (StatementData));

        // Check if the fulfillment is valid
        if (!_isValidFulfillment(payment, fulfillment, paymentData)) {
            revert InvalidFulfillment();
        }

        eas.revoke(
            RevocationRequest({schema: ATTESTATION_SCHEMA, data: RevocationRequestData({uid: _payment, value: 0})})
        );
        IERC721(paymentData.token).transferFrom(address(this), fulfillment.recipient, paymentData.tokenId);
        return true;
    }

    function cancelStatement(bytes32 uid) public returns (bool) {
        Attestation memory attestation = eas.getAttestation(uid);
        if (msg.sender != attestation.recipient) revert UnauthorizedCall();

        eas.revoke(
            RevocationRequest({schema: ATTESTATION_SCHEMA, data: RevocationRequestData({uid: uid, value: 0})})
        );

        StatementData memory data = abi.decode(attestation.data, (StatementData));
        IERC721(data.token).transferFrom(address(this), msg.sender, data.tokenId);
        return true;
    }


    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 /* counteroffer */
    ) public view override returns (bool) {
        if (!statement._checkIntrinsic()) return false;

        StatementData memory payment = abi.decode(statement.data, (StatementData));
        StatementData memory demandData = abi.decode(demand, (StatementData));

        return
            payment.token == demandData.token &&
            payment.tokenId == demandData.tokenId &&
            payment.arbiter == demandData.arbiter &&
            keccak256(payment.demand) == keccak256(demandData.demand);
    }

    function _isValidFulfillment(
        Attestation memory payment,
        Attestation memory fulfillment,
        StatementData memory paymentData
    ) internal view returns (bool) {
        // Special case: If the payment references this fulfillment, consider it valid
        if (payment.refUID != 0) return payment.refUID == fulfillment.uid;

        // Regular case: check using the arbiter
        return IArbiter(paymentData.arbiter).checkStatement(fulfillment, paymentData.demand, payment.uid);
    }
}
