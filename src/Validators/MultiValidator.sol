// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IValidator} from "../IValidator.sol";
import {IArbiter} from "../IArbiter.sol";
import {ERC20PaymentStatement} from "../Statements/ERC20PaymentStatement.sol";

contract ERC20PaymentFulfillmentValidator is IValidator {
    struct ValidationData {
        bytes32 fulfilling;
        address[] arbiters;
        bytes[] demands;
    }

    struct DemandData {
        address[] arbiters;
        bytes[] demands;
    }

    event ValidationCreated(bytes32 indexed validationUID, bytes32 indexed statementUID);

    error InvalidStatement();
    error InvalidValidation();

    string public constant SCHEMA_ABI = "bytes32 fulfilling, address[] arbiters, bytes[] demands";
    string public constant DEMAND_ABI = "address[] arbiters, bytes[] demands";
    bool public constant IS_REVOCABLE = true;

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry, ERC20PaymentStatement _baseStatement)
        IValidator(_eas, _schemaRegistry, SCHEMA_ABI, IS_REVOCABLE)
    {}

    function createValidation(bytes32 statementUID, ValidationData calldata validationData)
        external
        returns (bytes32 validationUID)
    {
        Attestation memory statement = eas.getAttestation(statementUID);

        for (uint256 i = 0; i < validationData.arbiters.length; i++) {
            if (
                !IArbiter(validationData.arbiters[i]).checkStatement(
                    statement, validationData.demands[i], validationData.fulfilling
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

    function checkStatement(Attestation memory statement, bytes memory demand, bytes32 counteroffer)
        public
        view
        override
        returns (bool)
    {
        if (!_checkIntrinsic(statement)) return false;
        ValidationData memory statement_ = abi.decode(statement.data, (ValidationData));
        ValidationData memory demand_ = abi.decode(demand, (ValidationData));

        return statement_.fulfilling == counteroffer
            && keccak256(abi.encode(statement_.arbiters)) == keccak256(abi.encode(demand_.arbiters))
            && keccak256(abi.encode(statement_.demands)) == keccak256(abi.encode(demand_.demands));
    }

    function getSchemaAbi() public pure override returns (string memory) {
        return SCHEMA_ABI;
    }

    function getDemandAbi() public pure override returns (string memory) {
        return DEMAND_ABI;
    }
}
