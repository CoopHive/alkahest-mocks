// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation, DeadlineExpired, InvalidEAS} from "@eas/Common.sol";

/**
 * @title IArbiter
 * @dev Abstract contract for arbitration in the EAS (Ethereum Attestation Service) ecosystem.
 * This contract provides base functionality for validating and checking attestations.
 */
abstract contract IArbiter {
    /// @notice The schema used for attestations in this arbiter
    bytes32 public immutable ATTESTATION_SCHEMA;

    /**
     * @dev Checks the intrinsic properties of an attestation.
     * @param statement The attestation to check.
     * @return bool Returns true if the attestation passes all intrinsic checks.
     */
    function _checkIntrinsic(Attestation memory statement) internal view returns (bool) {
        // check schema
        if (statement.schema != ATTESTATION_SCHEMA) return false;
        // check expired
        if (statement.expirationTime != 0 && statement.expirationTime < block.timestamp) revert DeadlineExpired();
        // check revoked
        if (statement.revocationTime != 0) revert InvalidEAS();

        return true;
    }

    /**
     * @dev Checks if the attestation data is identical to the demand data.
     * @param statement The attestation to check.
     * @param demand The demand data to compare against.
     * @return bool Returns true if the data is identical.
     */
    function _checkIdentical(Attestation memory statement, bytes memory demand) public pure returns (bool) {
        return keccak256(statement.data) == keccak256(demand);
    }

    /**
     * @dev Checks if an attestation meets the requirements of a demand.
     * @param statement The attestation to check.
     * @param demand The demand data to check against.
     * @param counteroffer An optional counteroffer to consider.
     * @return bool Returns true if the attestation meets the demand requirements.
     */
    function checkStatement(Attestation memory statement, bytes memory demand, bytes32 counteroffer)
        public
        view
        virtual
        returns (bool)
    {}

    /**
     * @dev Returns the ABI schema for the attestation.
     * @return string The ABI schema as a string.
     */
    function getSchemaAbi() public pure virtual returns (string memory) {}

    /**
     * @dev Returns the ABI schema for the demand.
     * @return string The demand ABI schema as a string.
     */
    function getDemandAbi() public pure virtual returns (string memory) {}
}
