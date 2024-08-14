// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Attestation, NO_EXPIRATION_TIME, EMPTY_UID} from "lib/eas-contracts/contracts/Common.sol";
import {
    IEAS,
    AttestationRequest,
    AttestationRequestData,
    RevocationRequest,
    RevocationRequestData
} from "lib/eas-contracts/contracts/IEAS.sol";
import {ISchemaRegistry} from "lib/eas-contracts/contracts/ISchemaRegistry.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {IStatement} from "./IStatement.sol";
import {IArbiter} from "./IArbiter.sol";

contract ERC20PaymentStatement is IStatement {
    error InvalidPayment();
    error InvalidFulfillment();
    error UnauthorizedCall();

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry) IStatement(_eas) {
        eas = _eas;
        schemaRegistry = _schemaRegistry;

        attestationSchema =
            schemaRegistry.register("address token, uint256 amount, address arbiter, bytes demand", this, true);
    }

    function makeStatement(address token, uint256 amount, address arbiter, bytes calldata demand)
        public
        returns (bytes32)
    {
        return eas.attest(
            AttestationRequest({
                schema: attestationSchema,
                data: AttestationRequestData({
                    recipient: address(0),
                    expirationTime: NO_EXPIRATION_TIME,
                    revocable: true,
                    refUID: EMPTY_UID,
                    data: abi.encodePacked(token, amount, arbiter, demand),
                    value: 0
                })
            })
        );
    }

    function onAttest(Attestation calldata attestation, uint256 /* value */ ) internal override returns (bool) {
        (address token, uint256 amount,,) = abi.decode(attestation.data, (address, uint256, address, bytes));
        return IERC20(token).transferFrom(msg.sender, address(this), amount);
    }

    function onRevoke(Attestation calldata attestation, uint256 /* value */ ) internal override returns (bool) {
        (address token, uint256 amount,,) = abi.decode(attestation.data, (address, uint256, address, bytes));
        return IERC20(token).transfer(msg.sender, amount);
    }

    // demand parameters: (address token, uint256 amount)
    function checkStatement(Attestation calldata statement, bytes calldata demand)
        public
        view
        override
        returns (bool)
    {
        if (!_checkIntrinsic(statement)) {
            return false;
        }
        (address token, uint256 amount,,) = abi.decode(statement.data, (address, uint256, address, bytes));
        (address tokenD, uint256 amountD) = abi.decode(demand, (address, uint256));
        return token == tokenD && amount > amountD;
    }

    function collectPayment(Attestation calldata payment, Attestation calldata fulfillment) public {
        // caller is attester
        if (msg.sender != fulfillment.attester) {
            revert UnauthorizedCall();
        }
        // payment statement valid
        if (!_checkIntrinsic(payment)) {
            revert InvalidPayment();
        }

        (address token, uint256 amount, address arbiter, bytes memory demand) =
            abi.decode(payment.data, (address, uint256, address, bytes));
        // fulfillment statement valid
        if (!IArbiter(arbiter).checkStatement(fulfillment, demand)) {
            revert InvalidFulfillment();
        }
        // revoke fulfillment
        eas.revoke(
            RevocationRequest({
                schema: fulfillment.schema,
                data: RevocationRequestData({uid: fulfillment.uid, value: 0})
            })
        );
        // transfer payment
        IERC20(token).transfer(msg.sender, amount);
    }
}
