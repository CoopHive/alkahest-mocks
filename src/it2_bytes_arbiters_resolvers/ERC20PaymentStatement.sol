// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation, Signature} from "@eas/Common.sol";
import {
    IEAS,
    DelegatedAttestationRequest,
    AttestationRequestData,
    DelegatedRevocationRequest,
    RevocationRequestData
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
    string public constant DEMAND_ABI = "address token, uint256 amount";
    bool public constant IS_REVOCABLE = true;

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        IStatement(_eas, _schemaRegistry, SCHEMA_ABI, IS_REVOCABLE)
    {}

    function collectPayment(Attestation calldata payment, Attestation calldata fulfillment) public {
        // caller is fullfillment attester
        if (msg.sender != fulfillment.attester) {
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

        // transfer token
        IERC20(payment_.token).transfer(msg.sender, payment_.amount);
    }

    // ISchemaResolver implementations

    function onAttest(Attestation calldata attestation, uint256 /* value */ ) internal override returns (bool) {
        (address token, uint256 amount) = abi.decode(attestation.data, (address, uint256));
        return IERC20(token).transferFrom(attestation.recipient, address(this), amount);
    }

    function onRevoke(Attestation calldata attestation, uint256 /* value */ ) internal override returns (bool) {
        (address token, uint256 amount) = abi.decode(attestation.data, (address, uint256));
        return IERC20(token).transfer(msg.sender, amount);
    }

    // IArbiter implementations

    function checkStatement(
        Attestation calldata statement,
        bytes calldata demand /* (address token, uint256 amount) */
    ) public view override returns (bool) {
        if (!_checkIntrinsic(statement)) {
            return false;
        }
        // payment is more than demanded amount of demanded token
        (address token, uint256 amount) = abi.decode(statement.data, (address, uint256));
        (address tokenD, uint256 amountD) = abi.decode(demand, (address, uint256));

        return token == tokenD && amount > amountD;
    }

    function getSchemaAbi() public pure override returns (string memory) {
        return SCHEMA_ABI;
    }

    function getDemandAbi() public pure override returns (string memory) {
        return DEMAND_ABI;
    }
}
