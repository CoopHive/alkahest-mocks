// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../IArbiter.sol";

import {DemoObligation} from "./path/to/DemoObligation.sol";

contract DemoArbiter is IArbiter {
  struct DemandData {
    address token;
    uint256 amount;
  }

  error IncompatibleStatement();
  DemoObligation public immutable baseStatement;

  constructor(DemoObligation _baseStatement) {
    baseStatement = _baseStatement;
  }

  function checkStatement(Attestation memory statement, bytes memory demand, bytes32 counteroffer) public view override returns (bool) {
    if (statement.schema != baseStatement.ATTESTATION_SCHEMA()) revert IncompatibleStatement();
    DemandData memory demand_ = abi.decode(demand, (DemandData));
    // implement custom checks here.
    // early revert with custom errors is recommended on failure.
    // remember that utility checks are available in IArbiter,
    // and you can also use baseStatement.checkStatement() if appropriate.
    // ...
    return true;
  }

}
