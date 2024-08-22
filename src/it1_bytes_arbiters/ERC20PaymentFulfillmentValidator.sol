// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IStatement} from "./IStatement.sol";
import {ERC20PaymentStatement} from "./ERC20PaymentStatement.sol";

contract ERC20PaymentFulfillmentValidator is IStatement {
    struct ValidationData {
        bytes demand;
    }

    event ValidationCreated(bytes32 indexed validationUID, bytes32 indexed paymentUID);

    error InvalidPaymentAttestation();
    error InvalidValidation();

    string public constant SCHEMA_ABI = "bytes demand";
    string public constant DEMAND_ABI = "bytes demand";
    bool public constant IS_REVOCABLE = false;

    ERC20PaymentStatement public immutable paymentStatement;

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry, ERC20PaymentStatement _paymentStatement)
        IStatement(_eas, _schemaRegistry, SCHEMA_ABI, IS_REVOCABLE)
    {
        paymentStatement = _paymentStatement;
    }

    function createValidation(bytes32 paymentUID, ValidationData calldata validationData)
        external
        returns (bytes32 validationUID)
    {
        Attestation memory paymentAttestation = eas.getAttestation(paymentUID);
        if (paymentAttestation.schema != paymentStatement.ATTESTATION_SCHEMA()) revert InvalidPaymentAttestation();

        // Use the base payment statement's check
        if (!paymentStatement.checkStatement(paymentAttestation, validationData.demand, bytes32(0))) {
            revert InvalidValidation();
        }

        validationUID = eas.attest(
            AttestationRequest({
                schema: ATTESTATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: msg.sender,
                    expirationTime: 0,
                    revocable: false,
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
        if (!_checkIntrinsic(statement)) revert InvalidValidation();

        ValidationData memory validationData = abi.decode(statement.data, (ValidationData));
        ValidationData memory demandData = abi.decode(demand, (ValidationData));

        if (keccak256(validationData.demand) != keccak256(demandData.demand)) {
            return false;
        }

        Attestation memory paymentAttestation = eas.getAttestation(statement.refUID);

        // Use the base payment statement's check
        return paymentStatement.checkStatement(paymentAttestation, validationData.demand, bytes32(0));
    }

    function getSchemaAbi() public pure override returns (string memory) {
        return SCHEMA_ABI;
    }

    function getDemandAbi() public pure override returns (string memory) {
        return DEMAND_ABI;
    }
}
