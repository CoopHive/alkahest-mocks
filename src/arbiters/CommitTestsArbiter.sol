// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {TrustedOracleArbiter} from "./TrustedOracleArbiter.sol";
import {IEAS} from "@eas/IEAS.sol";

contract CommitTestsArbiter is TrustedOracleArbiter {
    enum CommitAlgo {
        Sha1,
        Sha256
    }

    struct CommitTestsDemandData {
        address oracle;
        string testsCommitHash;
        string testsCommand;
        CommitAlgo testsCommitAlgo;
        string[] hosts;
    }

    constructor(IEAS _eas) TrustedOracleArbiter(_eas) {}

    /// @notice Checks if the obligation was approved by the oracle for this demand.
    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 /* counteroffer */
    ) public view override returns (bool) {
        CommitTestsArbiter.CommitTestsDemandData memory demand_ = abi.decode(
            demand,
            (CommitTestsDemandData)
        );
        return decisions[demand_.oracle][obligation.uid];
    }
}
