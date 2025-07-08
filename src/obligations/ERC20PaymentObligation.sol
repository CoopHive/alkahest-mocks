// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {BaseStatement} from "../BaseStatement.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract ERC20PaymentObligation is BaseStatement, IArbiter {
    using ArbiterUtils for Attestation;

    struct ObligationData {
        address token;
        uint256 amount;
        address payee;
    }

    event PaymentMade(bytes32 indexed payment, address indexed buyer);

    error InvalidPayment();
    error ERC20TransferFailed(
        address token,
        address from,
        address to,
        uint256 amount
    );
    error AttestationCreateFailed();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseStatement(
            _eas,
            _schemaRegistry,
            "address token, uint256 amount, address payee",
            true
        )
    {}

    function doObligationFor(
        ObligationData calldata data,
        address payer,
        address recipient
    ) public returns (bytes32 uid_) {
        // Try token transfer with error handling
        bool success;
        try
            IERC20(data.token).transferFrom(payer, data.payee, data.amount)
        returns (bool result) {
            success = result;
        } catch {
            success = false;
        }

        if (!success) {
            revert ERC20TransferFailed(
                data.token,
                payer,
                data.payee,
                data.amount
            );
        }

        // Create attestation with try/catch for potential EAS failures
        try
            eas.attest(
                AttestationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: AttestationRequestData({
                        recipient: recipient,
                        expirationTime: 0,
                        revocable: true,
                        refUID: bytes32(0),
                        data: abi.encode(data),
                        value: 0
                    })
                })
            )
        returns (bytes32 uid) {
            uid_ = uid;
            emit PaymentMade(uid_, recipient);
        } catch {
            // Note: We can't refund the tokens here as they're already sent to payee
            revert AttestationCreateFailed();
        }
    }

    function doObligation(
        ObligationData calldata data
    ) public returns (bytes32 uid_) {
        return doObligationFor(data, msg.sender, msg.sender);
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
            payment.amount >= demandData.amount &&
            payment.payee == demandData.payee;
    }

    function getObligationData(
        bytes32 uid
    ) public view returns (ObligationData memory) {
        Attestation memory attestation = eas.getAttestation(uid);
        if (attestation.schema != ATTESTATION_SCHEMA) revert InvalidPayment();
        return abi.decode(attestation.data, (ObligationData));
    }

    function decodeObligationData(
        bytes calldata data
    ) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
