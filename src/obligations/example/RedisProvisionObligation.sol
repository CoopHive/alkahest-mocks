// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseObligation} from "../../BaseObligation.sol";
import {IArbiter} from "../../IArbiter.sol";
import {ArbiterUtils} from "../../ArbiterUtils.sol";

contract RedisProvisionObligation is BaseObligation, IArbiter {
    using ArbiterUtils for Attestation;

    struct ObligationData {
        address user;
        uint256 capacity; // bytes
        uint256 egress; // bytes
        uint256 cpus; // cores
        string serverName;
        string url;
    }

    struct DemandData {
        bytes32 replaces;
        address user;
        uint256 capacity;
        uint256 egress;
        uint256 cpus;
        uint64 expiration;
        string serverName;
    }

    struct ChangeData {
        uint256 addedCapacity;
        uint256 addedEgress;
        uint256 addedCpus;
        uint64 addedDuration;
        string newServerName;
        string newUrl;
    }

    error UnauthorizedCall();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseObligation(
            _eas,
            _schemaRegistry,
            "address user, uint256 capacity, uint256 egress, uint256 cpus, string memory serverName, string memory url",
            true
        )
    {}

    function doObligation(
        ObligationData calldata data,
        uint64 expirationTime
    ) public returns (bytes32) {
        bytes memory encodedData = abi.encode(data);
        return
            this.doObligationForRaw(
                encodedData,
                expirationTime,
                msg.sender,
                msg.sender,
                bytes32(0)
            );
    }

    function reviseStatement(
        bytes32 obligationUID,
        ChangeData calldata changeData
    ) public returns (bytes32) {
        Attestation memory obligation = _getAttestation(obligationUID);
        ObligationData memory obligationData = abi.decode(
            obligation.data,
            (ObligationData)
        );

        if (obligation.recipient != msg.sender) revert UnauthorizedCall();

        obligation.expirationTime += changeData.addedDuration;
        obligationData.capacity += changeData.addedCapacity;
        obligationData.egress += changeData.addedEgress;
        obligationData.cpus += changeData.addedCpus;

        if (bytes(changeData.newUrl).length != 0) {
            obligationData.url = changeData.newUrl;
        }

        if (bytes(changeData.newServerName).length != 0) {
            obligationData.serverName = changeData.newServerName;
        }

        eas.revoke(
            RevocationRequest({
                schema: ATTESTATION_SCHEMA,
                data: RevocationRequestData({uid: obligationUID, value: 0})
            })
        );

        return
            _attest(
                abi.encode(obligationData),
                msg.sender,
                obligation.expirationTime,
                obligationUID
            );
    }

    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 /* counteroffer */
    ) public view override returns (bool) {
        if (!obligation._checkIntrinsic(ATTESTATION_SCHEMA)) return false;

        DemandData memory demandData = abi.decode(demand, (DemandData));
        ObligationData memory obligationData = abi.decode(
            obligation.data,
            (ObligationData)
        );

        return
            demandData.replaces == obligation.refUID &&
            demandData.expiration <= obligation.expirationTime &&
            demandData.user == obligationData.user &&
            demandData.capacity <= obligationData.capacity &&
            demandData.egress <= obligationData.egress &&
            demandData.cpus <= obligationData.cpus &&
            keccak256(bytes(demandData.serverName)) ==
            keccak256(bytes(obligationData.serverName));
    }
}
