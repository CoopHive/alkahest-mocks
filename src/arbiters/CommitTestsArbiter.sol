// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

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
