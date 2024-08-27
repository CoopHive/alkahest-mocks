// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IValidator} from "./IValidator.sol";
import {ERC20PaymentStatement} from "./ERC20PaymentStatement.sol";

contract ERC20PaymentFulfillmentValidator is IValidator {
    struct ValidationData {
        address token;
        uint256 amount;
        bytes32 fulfilling;
    }

    struct DemandData {
        address token;
        uint256 amount;
    }

    event ValidationCreated(bytes32 indexed validationUID, bytes32 indexed paymentUID);

    error InvalidPaymentAttestation();
    error InvalidValidation();

    string public constant SCHEMA_ABI = "address token, uint256 amount, bytes32 fulfilling";
    string public constant DEMAND_ABI = "address token, uint256 amount";
    bool public constant IS_REVOCABLE = true;

    ERC20PaymentStatement public immutable paymentStatement;

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry, ERC20PaymentStatement _baseStatement)
        IValidator(_eas, _schemaRegistry, SCHEMA_ABI, IS_REVOCABLE)
    {
        paymentStatement = _baseStatement;
    }

    function createValidation(bytes32 paymentUID, ValidationData calldata validationData)
        external
        returns (bytes32 validationUID)
    {
        Attestation memory paymentAttestation = eas.getAttestation(paymentUID);
        if (paymentAttestation.schema != paymentStatement.ATTESTATION_SCHEMA()) revert InvalidPaymentAttestation();
        if (paymentAttestation.refUID != validationData.fulfilling) revert InvalidValidation();
        if (
            !paymentStatement.checkStatement(
                paymentAttestation,
                abi.encode(
                    ERC20PaymentStatement.StatementData({
                        token: validationData.token,
                        amount: validationData.amount,
                        arbiter: address(0),
                        demand: ""
                    })
                ),
                0
            )
        ) revert InvalidPaymentAttestation();

        validationUID = eas.attest(
            AttestationRequest({
                schema: ATTESTATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: msg.sender,
                    expirationTime: paymentAttestation.expirationTime,
                    revocable: paymentAttestation.revocable,
                    refUID: paymentUID,
                    data: abi.encode(validationData),
                    value: 0
                })
            })
        );

        emit ValidationCreated(validationUID, paymentUID);
    }

    function checkStatement(Attestation memory statement, bytes memory demand, bytes32 counteroffer)
        public
        view
        override
        returns (bool)
    {
        if (!_checkIntrinsic(statement)) return false;

        ValidationData memory validationData = abi.decode(statement.data, (ValidationData));
        DemandData memory demandData = abi.decode(demand, (DemandData));

        return validationData.fulfilling == counteroffer && validationData.token == demandData.token
            && validationData.amount >= demandData.amount;
    }

    function getSchemaAbi() public pure override returns (string memory) {
        return SCHEMA_ABI;
    }

    function getDemandAbi() public pure override returns (string memory) {
        return DEMAND_ABI;
    }
}
