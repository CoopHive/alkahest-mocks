// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {BaseEscrowObligation} from "../BaseEscrowObligation.sol";
import {IArbiter} from "../../../IArbiter.sol";
import {BaseArbiter} from "../../../BaseArbiter.sol";
import {ArbiterUtils} from "../../../libraries/ArbiterUtils.sol";
import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";

/// @title NativeTokenEscrowObligation
/// @notice Escrows native tokens behind an arbiter-defined fulfillment condition.
/// @dev Uses the default escrow checks: fulfillment must reference the escrow UID and pass intrinsic attestation validation.
contract NativeTokenEscrowObligation is BaseEscrowObligation, BaseArbiter {
    using ArbiterUtils for Attestation;

    /// @notice Native-token escrow terms encoded in each escrow attestation.
    struct ObligationData {
        address arbiter;
        bytes demand;
        uint256 amount;
    }

    error IncorrectPayment(uint256 expected, uint256 received);
    error NativeTokenTransferFailed(address to, uint256 amount);

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        BaseEscrowObligation(_eas, _schemaRegistry, "address arbiter, bytes demand, uint256 amount", true)
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

    // Extract arbiter and demand from encoded data
    /// @inheritdoc BaseEscrowObligation
    function decodeCondition(bytes memory data) public pure override returns (address arbiter, bytes memory demand) {
        ObligationData memory decoded = abi.decode(data, (ObligationData));
        return (decoded.arbiter, decoded.demand);
    }

    // Lock native tokens into escrow
    function _lockEscrow(
        bytes memory data,
        address /* from */
    )
        internal
        override
    {
        ObligationData memory decoded = abi.decode(data, (ObligationData));

        if (msg.value != decoded.amount) {
            revert IncorrectPayment(decoded.amount, msg.value);
        }
    }

    // Release native tokens to fulfiller
    function _releaseEscrow(
        Attestation memory escrow,
        address to,
        bytes32 /* fulfillmentUid */
    )
        internal
        override
        returns (bytes memory)
    {
        ObligationData memory decoded = abi.decode(escrow.data, (ObligationData));

        (bool success,) = payable(to).call{value: decoded.amount}("");
        if (!success) {
            revert NativeTokenTransferFailed(to, decoded.amount);
        }

        return ""; // Native token escrows don't return anything
    }

    // Return native tokens to original owner on expiry
    function _returnEscrow(Attestation memory escrow, address to) internal override {
        _releaseEscrow(escrow, to, bytes32(0));
    }

    // Implement IArbiter
    /// @inheritdoc IArbiter
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

        return payment.amount >= demandData.amount && payment.arbiter == demandData.arbiter
            && keccak256(payment.demand) == keccak256(demandData.demand);
    }

    // Typed convenience methods
    /// @notice Locks native token and creates an escrow attestation for the caller.
    function doObligation(ObligationData calldata data, uint64 expirationTime) external payable returns (bytes32) {
        return _doObligationForRaw(abi.encode(data), expirationTime, msg.sender, bytes32(0));
    }

    /// @notice Locks native token and creates an escrow attestation for an explicit recipient.
    function doObligationFor(ObligationData calldata data, uint64 expirationTime, address recipient)
        external
        payable
        returns (bytes32)
    {
        return _doObligationForRaw(abi.encode(data), expirationTime, recipient, bytes32(0));
    }

    /// @notice Loads and decodes native-token escrow data from this contract's attestation.
    function getObligationData(bytes32 uid) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    /// @notice Decodes ABI-encoded native-token escrow data.
    function decodeObligationData(bytes calldata data) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }
}
