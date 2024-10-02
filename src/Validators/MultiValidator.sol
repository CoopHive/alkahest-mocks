// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IStatement} from "../IStatement.sol";
import {IArbiter} from "../IArbiter.sol";
import {ERC20PaymentStatement} from "../Statements/ERC20PaymentStatement.sol";

contract ERC20PaymentFulfillmentValidator is IStatement, IArbiter {
    struct ValidationData {
        bytes32 fulfilling;
        address[] arbiters;
        bytes[] demands;
    }

    struct DemandData {
        address[] arbiters;
        bytes[] demands;
    }

    event ValidationCreated(
        bytes32 indexed validationUID,
        bytes32 indexed statementUID
    );

    error InvalidStatement();
    error InvalidValidation();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry,
        ERC20PaymentStatement _baseStatement
    )
        IStatement(
            _eas,
            _schemaRegistry,
            "bytes32 fulfilling, address[] arbiters, bytes[] demands",
            true
        )
    {}

    function createValidation(
        bytes32 statementUID,
        ValidationData calldata validationData
    ) external returns (bytes32 validationUID) {
        Attestation memory statement = eas.getAttestation(statementUID);

        for (uint256 i = 0; i < validationData.arbiters.length; i++) {
            if (
                !IArbiter(validationData.arbiters[i]).checkStatement(
                    statement,
                    validationData.demands[i],
                    validationData.fulfilling
                )
            ) revert InvalidStatement();
        }

        validationUID = eas.attest(
            AttestationRequest({
                schema: ATTESTATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: msg.sender,
                    expirationTime: uint64(block.timestamp) + 1 days,
                    revocable: false,
                    refUID: statementUID,
                    data: abi.encode(validationData),
                    value: 0
                })
            })
        );
        emit ValidationCreated(validationUID, statementUID);
    }

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 counteroffer
    ) public view override returns (bool) {
        if (!_checkIntrinsic(statement)) return false;
        ValidationData memory statement_ = abi.decode(
            statement.data,
            (ValidationData)
        );
        ValidationData memory demand_ = abi.decode(demand, (ValidationData));

        return
            statement_.fulfilling == counteroffer &&
            keccak256(abi.encode(statement_.arbiters)) ==
            keccak256(abi.encode(demand_.arbiters)) &&
            keccak256(abi.encode(statement_.demands)) ==
            keccak256(abi.encode(demand_.demands));
    }
}
