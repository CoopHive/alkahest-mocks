// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {IArbiter} from "../../IArbiter.sol";
import {BaseArbiter} from "../../BaseArbiter.sol";
import {ArbiterUtils} from "../../libraries/ArbiterUtils.sol";

/// @title TrustedOracleArbiter
/// @notice Defers fulfillment acceptance to a trusted oracle address selected in demand data.
/// @dev Oracle decisions are keyed by `(fulfillment.uid, demand.data)`, allowing the same decision to be reused wherever that demand context is valid.
contract TrustedOracleArbiter is BaseArbiter {
    using ArbiterUtils for Attestation;

    /// @notice Demand specifying which oracle must have approved which opaque context.
    struct DemandData {
        /// @notice Oracle address whose decision is trusted.
        address oracle;
        /// @notice Opaque context bytes included in the decision key.
        bytes data;
    }

    /// @notice Emitted when an oracle records a decision for a fulfillment and context.
    event ArbitrationMade(
        bytes32 indexed decisionKey, bytes32 indexed fulfillmentUid, address indexed oracle, bool decision
    );
    /// @notice Emitted by an attestation participant to request oracle review.
    event ArbitrationRequested(bytes32 indexed fulfillmentUid, address indexed oracle, bytes demand);

    /// @notice Raised when a caller that is neither attester nor recipient requests arbitration.
    error UnauthorizedArbitrationRequest();

    /// @notice EAS contract used to verify arbitration request authorization.
    IEAS eas;
    /// @notice Recorded oracle decisions keyed by oracle and `keccak256(fulfillmentUid, demand)`.
    mapping(address => mapping(bytes32 => bool)) decisions;

    /// @param _eas EAS contract used to load fulfillment attestations.
    constructor(IEAS _eas) {
        eas = _eas;
    }

    /// @notice Records the caller's oracle decision for a fulfillment and demand context.
    function arbitrate(bytes32 fulfillmentUid, bytes memory demand, bool decision) public {
        bytes32 decisionKey = keccak256(abi.encodePacked(fulfillmentUid, demand));
        decisions[msg.sender][decisionKey] = decision;
        emit ArbitrationMade(decisionKey, fulfillmentUid, msg.sender, decision);
    }

    /// @notice Emits an arbitration request if the caller is the fulfillment attester or recipient.
    function requestArbitration(bytes32 fulfillmentUid, address oracle, bytes memory demand) public {
        Attestation memory fulfillment = eas.getAttestation(fulfillmentUid);
        if (fulfillment.attester != msg.sender && fulfillment.recipient != msg.sender) {
            revert UnauthorizedArbitrationRequest();
        }

        emit ArbitrationRequested(fulfillmentUid, oracle, demand);
    }

    /// @inheritdoc IArbiter
    function check(
        Attestation memory fulfillment,
        bytes memory demand,
        bytes32 /*fulfilling*/
    )
        public
        view
        override
        returns (bool)
    {
        DemandData memory demand_ = abi.decode(demand, (DemandData));
        bytes32 decisionKey = keccak256(abi.encodePacked(fulfillment.uid, demand_.data));
        return decisions[demand_.oracle][decisionKey];
    }

    /// @notice Decodes ABI-encoded trusted-oracle demand data.
    function decodeDemandData(bytes calldata data) public pure returns (DemandData memory) {
        return abi.decode(data, (DemandData));
    }
}
