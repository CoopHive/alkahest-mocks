// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {TrustedOracleArbiter} from "./TrustedOracleArbiter.sol";
import {IEAS} from "@eas/IEAS.sol";
contract CommitTestsArbiter {
    enum CommitAlgo {
        Sha1,
        Sha256
    }

    struct DemandData {
        string testsCommitHash;
        string testsCommand;
        CommitAlgo testsCommitAlgo;
        string[] hosts;
    }
 
}
