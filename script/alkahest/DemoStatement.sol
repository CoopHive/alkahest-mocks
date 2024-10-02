// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IStatement} from "../IStatement.sol";
import {IArbiter} from "../IArbiter.sol";

contract DemoStatement is IStatement, IArbiter {
  struct StatementData {
    address token;
    uint256 amount;
  }

  constructor(IEAS _eas, ISchemaRegistry _schemaRegistry) IStatement(_eas, _schemaRegistry, "address token, uint256 amount", true) {}

  function makeStatement(StatementData calldata data, uint64 expirationTime, bytes32 fulfilling) public returns (bytes32) {
    // implement custom statement logic here
    //...
    return eas.attest(AttestationRequest({
      schema: ATTESTATION_SCHEMA,
      data: AttestationRequestData({
        recipient: msg.sender,
        expirationTime: expirationTime,
        revocable: true,
        refUID: fulfilling,
        data: abi.encode(data),
        value: 0
      })
    }));
  }

  function finalize_0(bytes32 statement /*, bytes32 fulfillment, ...*/) public returns (bool) {
    // implement custom finalization term (e.g. cancellation or completion) pre-conditions here
    //...
    eas.revoke(RevocationRequest({schema: ATTESTATION_SCHEMA, data: RevocationRequestData({uid: statement, value: 0})}));
    // implement custom finalization term (e.g. cancellation or completion) post-conditions here
    //...
    return true;
  }

  function finalize_1(bytes32 statement /*, bytes32 fulfillment, ...*/) public returns (bool) {
    // implement custom finalization term (e.g. cancellation or completion) pre-conditions here
    //...
    eas.revoke(RevocationRequest({schema: ATTESTATION_SCHEMA, data: RevocationRequestData({uid: statement, value: 0})}));
    // implement custom finalization term (e.g. cancellation or completion) post-conditions here
    //...
    return true;
  }

  function checkStatement(Attestation memory statement, bytes memory demand, bytes32 counteroffer) public view returns (bool) {
    // implement custom statement verification logic here
    // we recommend early revert on invalid conditions
    //...
    return true;
  }

}