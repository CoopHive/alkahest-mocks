// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";
import {IStatement} from "../IStatement.sol";
import {IArbiter} from "../IArbiter.sol";

contract ERC20PaymentStatement is IStatement {
    struct StatementData {
        address token;
        uint256 amount;
        address arbiter;
        bytes demand;
    }

    error InvalidPayment();
    error InvalidPaymentAttestation();
    error InvalidFulfillment();
    error UnauthorizedCall();

    string public constant override SCHEMA_ABI =
        "address token, uint256 amount, address arbiter, bytes demand";
    string public constant override DEMAND_ABI =
        "address token, uint256 amount, address arbiter, bytes demand";

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    ) IStatement(_eas, _schemaRegistry, SCHEMA_ABI, true) {}

    function makeStatement(
        StatementData calldata data,
        uint64 expirationTime,
        bytes32 refUID
    ) public returns (bytes32) {
        if (
            !IERC20(data.token).transferFrom(
                msg.sender,
                address(this),
                data.amount
            )
        ) revert InvalidPayment();

        return
            eas.attest(
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

    function collectPayment(
        bytes32 _payment,
        bytes32 _fulfillment
    ) public returns (bool) {
        Attestation memory payment = eas.getAttestation(_payment);
        Attestation memory fulfillment = eas.getAttestation(_fulfillment);

        if (!_checkIntrinsic(payment)) revert InvalidPaymentAttestation();

        StatementData memory paymentData = abi.decode(
            payment.data,
            (StatementData)
        );

        // Check if the fulfillment is valid
        if (!_isValidFulfillment(payment, fulfillment, paymentData))
            revert InvalidFulfillment();

        eas.revoke(
            RevocationRequest({
                schema: ATTESTATION_SCHEMA,
                data: RevocationRequestData({uid: _payment, value: 0})
            })
        );
        return
            IERC20(paymentData.token).transfer(
                fulfillment.recipient,
                paymentData.amount
            );
    }

    function cancelStatement(bytes32 uid) public returns (bool) {
        Attestation memory attestation = eas.getAttestation(uid);
        if (msg.sender != attestation.recipient) revert UnauthorizedCall();

        eas.revoke(
            RevocationRequest({
                schema: ATTESTATION_SCHEMA,
                data: RevocationRequestData({uid: uid, value: 0})
            })
        );

        StatementData memory data = abi.decode(
            attestation.data,
            (StatementData)
        );
        return IERC20(data.token).transfer(msg.sender, data.amount);
    }

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 /* counteroffer */
    ) public view override returns (bool) {
        if (!_checkIntrinsic(statement)) return false;

        StatementData memory payment = abi.decode(
            statement.data,
            (StatementData)
        );
        StatementData memory demandData = abi.decode(demand, (StatementData));

        return
            payment.token == demandData.token &&
            payment.amount >= demandData.amount &&
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
        return
            IArbiter(paymentData.arbiter).checkStatement(
                fulfillment,
                paymentData.demand,
                payment.uid
            );
    }
}
