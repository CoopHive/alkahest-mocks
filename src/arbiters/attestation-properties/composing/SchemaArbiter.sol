// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IArbiter} from "../../../IArbiter.sol";
import {ArbiterUtils} from "../../../ArbiterUtils.sol";

contract SchemaArbiter is IArbiter {
    using ArbiterUtils for Attestation;

    struct DemandData {
        address baseArbiter;
        bytes baseDemand;
        bytes32 schema;
    }

    error SchemaMismatched();

    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 counteroffer
    ) public view override returns (bool) {
        DemandData memory demand_ = abi.decode(demand, (DemandData));
        if (obligation.schema != demand_.schema) revert SchemaMismatched();

        return
            IArbiter(demand_.baseArbiter).checkObligation(
                obligation,
                demand_.baseDemand,
                counteroffer
            );
    }

    function decodeDemandData(
        bytes calldata data
    ) public pure returns (DemandData memory) {
        return abi.decode(data, (DemandData));
    }
}
