// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IValidator} from "../IValidator.sol";
import {ERC20PaymentStatement} from "../Statements/ERC20PaymentStatement.sol";

contract ERC20PaymentFulfillmentValidator is IValidator {
    struct ValidationData {
        address statement;
        address creator;
    }

    event ValidationCreated(bytes32 indexed validationUID, bytes32 indexed statementUID);

    error InvalidStatement();
    error InvalidValidation();

    string public constant SCHEMA_ABI = "address statement, address creator";
    string public constant DEMAND_ABI = "address statement, address creator";
    bool public constant IS_REVOCABLE = false;

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry, ERC20PaymentStatement _baseStatement)
        IValidator(_eas, _schemaRegistry, SCHEMA_ABI, IS_REVOCABLE)
    {}

    function createValidation(bytes32 statementUID, ValidationData calldata validationData)
        external
        returns (bytes32 validationUID)
    {
        Attestation memory statement = eas.getAttestation(statementUID);

        if (statement.revocationTime != 0) revert InvalidStatement();
        if (statement.recipient != msg.sender) revert InvalidStatement();

        if (statement.attester != validationData.statement) revert InvalidValidation();
        if (statement.recipient != validationData.creator) revert InvalidValidation();

        validationUID = eas.attest(
            AttestationRequest({
                schema: ATTESTATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: msg.sender,
                    expirationTime: statement.expirationTime,
                    revocable: false,
                    refUID: statementUID,
                    data: abi.encode(validationData),
                    value: 0
                })
            })
        );
        emit ValidationCreated(validationUID, statementUID);
    }

    function checkStatement(Attestation memory statement, bytes memory demand, bytes32 /* counteroffer */ )
        public
        view
        override
        returns (bool)
    {
        if (!_checkIntrinsic(statement)) return false;

        ValidationData memory statement_ = abi.decode(statement.data, (ValidationData));
        ValidationData memory demand_ = abi.decode(demand, (ValidationData));

        return statement_.statement == demand_.statement && statement_.creator == demand_.creator;
    }

    function getSchemaAbi() public pure override returns (string memory) {
        return SCHEMA_ABI;
    }

    function getDemandAbi() public pure override returns (string memory) {
        return DEMAND_ABI;
    }
}
