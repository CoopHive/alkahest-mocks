// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {
    IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData
} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";
import {IStatement} from "./IStatement.sol";
import {IArbiter} from "./IArbiter.sol";

contract ERC20PaymentStatement is IStatement {
    error InvalidPayment();
    error InvalidFulfillment();
    error UnauthorizedCall();

    struct StatementData {
        address token;
        uint256 amount;
        address arbiter;
        bytes demand;
    }

    string public constant SCHEMA_ABI = "address token, uint256 amount, address arbiter, bytes demand";
    string public constant DEMAND_ABI = "address token, uint256 amount, bytes32 fulfilling";
    bool public constant IS_REVOCABLE = true;

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        IStatement(_eas, _schemaRegistry, SCHEMA_ABI, IS_REVOCABLE)
    {}

    function makeStatement(StatementData calldata data, uint64 expirationTime, bytes32 refUID)
        public
        returns (bytes32)
    {
        // require token transfer from attestation recipient
        IERC20(data.token).transferFrom(msg.sender, address(this), data.amount);

        return eas.attest(
            AttestationRequest({
                schema: attestationSchema,
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

    function cancelStatement(bytes32 uid) public returns (bool) {
        Attestation memory attestation = eas.getAttestation(uid);
        if (msg.sender != attestation.recipient) {
            revert UnauthorizedCall();
        }
        eas.revoke(RevocationRequest({schema: attestationSchema, data: RevocationRequestData({uid: uid, value: 0})}));

        (address token, uint256 amount) = abi.decode(attestation.data, (address, uint256));
        return IERC20(token).transfer(msg.sender, amount);
    }

    function collectPayment(bytes32 _payment, bytes32 _fulfillment) public {
        Attestation memory payment = eas.getAttestation(_payment);
        Attestation memory fulfillment = eas.getAttestation(_fulfillment);

        // caller is attestation recipient
        if (msg.sender != fulfillment.recipient) {
            revert UnauthorizedCall();
        }
        // payment statement valid
        if (!_checkIntrinsic(payment)) {
            revert InvalidPayment();
        }

        StatementData memory payment_ = abi.decode(payment.data, (StatementData));
        // fulfillment statement valid
        if (!IArbiter(payment_.arbiter).checkStatement(fulfillment, payment_.demand)) {
            revert InvalidFulfillment();
        }
        // revoke payment statement
        eas.revoke(
            RevocationRequest({schema: attestationSchema, data: RevocationRequestData({uid: payment.uid, value: 0})})
        );
        // transfer token
        IERC20(payment_.token).transfer(msg.sender, payment_.amount);
    }

    // IArbiter implementations

    function checkStatement(
        Attestation memory statement,
        bytes memory demand /* (address token, uint256 amount, address fulfilling) */
    ) public view override returns (bool) {
        (address tokenD, uint256 amountD, bytes32 fulfilling) = abi.decode(demand, (address, uint256, bytes32));
        // as fulfillment, payment already collected
        if (statement.uid == fulfilling && statement.schema == attestationSchema) {
            return true;
        }

        // statement valid
        if (!_checkIntrinsic(statement)) {
            return false;
        }

        (address token, uint256 amount) = abi.decode(statement.data, (address, uint256));
        // payment is more than demanded amount of demanded token
        return token == tokenD && amount >= amountD;
    }

    function getSchemaAbi() public pure override returns (string memory) {
        return SCHEMA_ABI;
    }

    function getDemandAbi() public pure override returns (string memory) {
        return DEMAND_ABI;
    }
}
