// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {BaseEscrowObligation} from "../BaseEscrowObligation.sol";
import {IArbiter} from "../../../IArbiter.sol";
import {BaseArbiter} from "../../../BaseArbiter.sol";
import {ArbiterUtils} from "../../../libraries/ArbiterUtils.sol";
import {IEscrowHook} from "./IEscrowHook.sol";
import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";

/// @title HooksEscrowObligation
/// @notice A multi-hook escrow obligation that calls each IEscrowHook directly
///         during lock, release, and return.
/// @dev Security note: This contract has not been included in professional manual audits and
///      has only been reviewed by automated audit tooling so far.
contract HooksEscrowObligation is BaseEscrowObligation, BaseArbiter {
    using ArbiterUtils for Attestation;

    struct ObligationData {
        address arbiter;
        bytes demand;
        address[] hooks;
        bytes[] hookDatas;
        uint256[] values;
    }

    error ArrayLengthMismatch();
    error ValueMismatch(uint256 expected, uint256 received);
    error TooManyHooks(uint256 provided, uint256 max);

    uint256 public constant MAX_HOOKS = 50;

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        BaseEscrowObligation(
            _eas,
            _schemaRegistry,
            "address arbiter, bytes demand, address[] hooks, bytes[] hookDatas, uint256[] values",
            true
        )
    {}

    /// @inheritdoc BaseEscrowObligation
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(BaseEscrowObligation, BaseArbiter)
        returns (bool)
    {
        return interfaceId == type(IArbiter).interfaceId || super.supportsInterface(interfaceId);
    }

    function decodeCondition(bytes memory data) public pure override returns (address arbiter, bytes memory demand) {
        ObligationData memory decoded = abi.decode(data, (ObligationData));
        return (decoded.arbiter, decoded.demand);
    }

    function _lockEscrow(bytes memory data, address from) internal override {
        ObligationData memory decoded = abi.decode(data, (ObligationData));
        _validateLengths(decoded);

        uint256 totalValue;
        for (uint256 i; i < decoded.values.length; ++i) {
            totalValue += decoded.values[i];
        }
        if (msg.value != totalValue) revert ValueMismatch(totalValue, msg.value);

        for (uint256 i; i < decoded.hooks.length; ++i) {
            IEscrowHook(decoded.hooks[i]).onLock{value: decoded.values[i]}(decoded.hookDatas[i], from, address(this));
        }
    }

    function _afterEscrowAttest(Attestation memory escrow) internal override {
        ObligationData memory decoded = abi.decode(escrow.data, (ObligationData));
        _validateLengths(decoded);

        for (uint256 i; i < decoded.hooks.length; ++i) {
            IEscrowHook(decoded.hooks[i]).onAttest(decoded.hookDatas[i], escrow);
        }
    }

    function _releaseEscrow(Attestation memory escrow, address to, bytes32 fulfillmentUid)
        internal
        override
        returns (bytes memory)
    {
        ObligationData memory decoded = abi.decode(escrow.data, (ObligationData));
        _validateLengths(decoded);

        for (uint256 i; i < decoded.hooks.length; ++i) {
            IEscrowHook(decoded.hooks[i]).onRelease(decoded.hookDatas[i], to, escrow, fulfillmentUid);
        }
        return "";
    }

    function _returnEscrow(Attestation memory escrow, address to) internal override {
        ObligationData memory decoded = abi.decode(escrow.data, (ObligationData));
        _validateLengths(decoded);

        for (uint256 i; i < decoded.hooks.length; ++i) {
            IEscrowHook(decoded.hooks[i]).onReturn(decoded.hookDatas[i], to, escrow);
        }
    }

    function check(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 /* fulfilling */
    )
        public
        view
        override
        returns (bool)
    {
        if (obligation.schema != ATTESTATION_SCHEMA) return false;

        ObligationData memory payment = abi.decode(obligation.data, (ObligationData));
        ObligationData memory demandData = abi.decode(demand, (ObligationData));

        return payment.arbiter == demandData.arbiter && keccak256(payment.demand) == keccak256(demandData.demand)
            && keccak256(abi.encode(payment.hooks)) == keccak256(abi.encode(demandData.hooks))
            && keccak256(abi.encode(payment.hookDatas)) == keccak256(abi.encode(demandData.hookDatas))
            && keccak256(abi.encode(payment.values)) == keccak256(abi.encode(demandData.values));
    }

    function doObligation(ObligationData calldata data, uint64 expirationTime) external payable returns (bytes32) {
        return _doObligationForRaw(abi.encode(data), expirationTime, msg.sender, bytes32(0));
    }

    function doObligationFor(ObligationData calldata data, uint64 expirationTime, address recipient)
        external
        payable
        returns (bytes32)
    {
        return _doObligationForRaw(abi.encode(data), expirationTime, recipient, bytes32(0));
    }

    function getObligationData(bytes32 uid) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    function decodeObligationData(bytes calldata data) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }

    function _validateLengths(ObligationData memory decoded) internal pure {
        if (decoded.hooks.length != decoded.hookDatas.length || decoded.hooks.length != decoded.values.length) {
            revert ArrayLengthMismatch();
        }
        if (decoded.hooks.length > MAX_HOOKS) revert TooManyHooks(decoded.hooks.length, MAX_HOOKS);
    }
}
