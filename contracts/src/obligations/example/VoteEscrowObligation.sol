// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {BaseEscrowObligation} from "../escrow/BaseEscrowObligation.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {Attestation} from "@eas/Common.sol";

/// @notice Interface for a voting contract with delegation capabilities
interface IVotingContract {
    function delegate(address delegatee) external;

    function delegates(address account) external view returns (address);

    function getVotes(address account) external view returns (uint256);

    function castVote(uint256 proposalId, uint8 support) external;

    function castVoteWithReason(uint256 proposalId, uint8 support, string calldata reason) external;

    function hasVoted(uint256 proposalId, address account) external view returns (bool);
}

/// @title VoteEscrowObligation
/// @notice Escrow contract for delegating voting power and casting votes on behalf of users
/// @dev Inherits from BaseEscrowObligation to handle vote delegation escrows
contract VoteEscrowObligation is BaseEscrowObligation {
    // Struct for vote escrow data
    struct ObligationData {
        address votingContract; // The governance/voting contract
        uint256 proposalId; // The proposal to vote on
        uint8 support; // 0 = Against, 1 = For, 2 = Abstain (following OpenZeppelin Governor)
        address arbiter; // Who verifies the vote should be cast
        bytes demand; // Additional arbiter-specific data
    }

    // Track escrowed votes by data hash
    mapping(bytes32 => address) public escrowedVoter;
    mapping(bytes32 => ObligationData) public escrowedData;
    mapping(bytes32 => address) public previousDelegate;

    // Track active escrows per voter to prevent double delegation
    mapping(address => bytes32) public activeEscrow;

    // Track attestation UID to data hash mapping
    mapping(bytes32 => bytes32) public attestationToDataHash;

    // Events
    event VoteDelegated(bytes32 indexed escrowId, address indexed voter, address indexed votingContract);
    event VoteCast(bytes32 indexed escrowId, uint256 proposalId, uint8 support);
    event VoteReturned(bytes32 indexed escrowId, address indexed voter);

    // Errors
    error VoterHasActiveEscrow(address voter, bytes32 existingEscrow);
    error NoActiveEscrow(bytes32 escrowId);
    error VoteAlreadyCast(uint256 proposalId);

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        BaseEscrowObligation(
            _eas,
            _schemaRegistry,
            "address votingContract,uint256 proposalId,uint8 support,address arbiter,bytes demand",
            true // Revocable
        )
    {}

    /// @notice Encode obligation data for creating an escrow
    /// @param data The obligation data to encode
    /// @return The ABI-encoded obligation data
    function encodeObligationData(ObligationData memory data) public pure returns (bytes memory) {
        return abi.encode(data.votingContract, data.proposalId, data.support, data.arbiter, data.demand);
    }

    /// @notice Decode obligation data from bytes
    /// @param data The encoded obligation data
    /// @return The decoded obligation data struct
    function decodeObligationData(bytes memory data) public pure returns (ObligationData memory) {
        (address votingContract, uint256 proposalId, uint8 support, address arbiter, bytes memory demand) =
            abi.decode(data, (address, uint256, uint8, address, bytes));

        return ObligationData({
            votingContract: votingContract, proposalId: proposalId, support: support, arbiter: arbiter, demand: demand
        });
    }

    /// @notice Extract arbiter and demand from encoded data
    /// @param data The encoded obligation data
    /// @return arbiter The arbiter address
    /// @return demand The demand bytes
    function decodeCondition(bytes memory data) public pure override returns (address arbiter, bytes memory demand) {
        ObligationData memory obligation = decodeObligationData(data);
        return (obligation.arbiter, obligation.demand);
    }

    /// @notice Lock voting power by verifying delegation to this contract
    /// @param data The encoded obligation data
    /// @param from The address creating the escrow (voter)
    function _lockEscrow(bytes memory data, address from) internal override {
        ObligationData memory obligation = decodeObligationData(data);

        // Check if voter already has an active escrow
        if (activeEscrow[from] != bytes32(0)) {
            revert VoterHasActiveEscrow(from, activeEscrow[from]);
        }

        // Generate deterministic data hash for this escrow
        bytes32 dataHash = keccak256(data);

        // Get the voting contract
        IVotingContract votingContract = IVotingContract(obligation.votingContract);

        // Get current delegate
        address currentDelegate = votingContract.delegates(from);

        // Check that the user has delegated to this contract
        if (currentDelegate != address(this)) {
            revert("Must delegate voting power to escrow contract before creating escrow");
        }

        // Store who they delegated to BEFORE delegating to us
        // Since they've already delegated to us, we can't know their previous delegate
        // So we store themselves as the default to return to
        previousDelegate[dataHash] = from;

        // Store escrow data
        escrowedVoter[dataHash] = from;
        escrowedData[dataHash] = obligation;
        activeEscrow[from] = dataHash;

        emit VoteDelegated(dataHash, from, obligation.votingContract);
    }

    /// @notice Release escrowed vote by casting it according to the obligation
    /// @param escrow The escrow attestation
    /// @param to The address receiving the benefit (fulfiller)
    /// @param fulfillmentUid The UID of the fulfillment attestation
    /// @return result Encoded result data
    function _releaseEscrow(Attestation memory escrow, address to, bytes32 fulfillmentUid)
        internal
        override
        returns (bytes memory result)
    {
        ObligationData memory obligation = decodeObligationData(escrow.data);

        // Get the data hash for this escrow
        bytes32 dataHash = keccak256(escrow.data);

        if (escrowedVoter[dataHash] == address(0)) {
            revert NoActiveEscrow(dataHash);
        }

        address voter = escrowedVoter[dataHash];

        // Cast the vote using the delegated voting power
        IVotingContract votingContract = IVotingContract(obligation.votingContract);

        // Check if already voted (safety check)
        if (votingContract.hasVoted(obligation.proposalId, address(this))) {
            revert VoteAlreadyCast(obligation.proposalId);
        }

        // Cast the vote with a reason indicating it's on behalf of the original voter
        string memory reason = string(
            abi.encodePacked(
                "Vote cast on behalf of ", _toHexString(voter), " via escrow ", _bytes32ToHexString(dataHash)
            )
        );

        votingContract.castVoteWithReason(obligation.proposalId, obligation.support, reason);

        emit VoteCast(dataHash, obligation.proposalId, obligation.support);

        // Clean up the escrow data but don't return delegation yet
        // (it will be returned when the attestation is revoked or expires)
        activeEscrow[voter] = bytes32(0);

        // Return confirmation data
        return abi.encode(obligation.proposalId, obligation.support, to, voter);
    }

    /// @notice Return voting power to original owner
    /// @param escrow The escrow attestation
    /// @param to The address to return voting power to (original voter)
    function _returnEscrow(Attestation memory escrow, address to) internal override {
        ObligationData memory obligation = decodeObligationData(escrow.data);

        // Get the data hash for this escrow
        bytes32 dataHash = keccak256(escrow.data);

        if (escrowedVoter[dataHash] != address(0)) {
            // Note: We cannot automatically return delegation because only the user
            // can call delegate() on the voting contract (msg.sender check).
            // The user must manually re-delegate after reclaiming their escrow.

            // Clean up storage
            delete escrowedVoter[dataHash];
            delete escrowedData[dataHash];
            delete previousDelegate[dataHash];
            delete activeEscrow[to];

            emit VoteReturned(dataHash, to);
        }
    }

    /// @notice Helper to convert address to hex string
    function _toHexString(address addr) private pure returns (string memory) {
        bytes memory buffer = new bytes(42);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            uint8 b = uint8(uint160(addr) >> (8 * (19 - i)));
            buffer[2 * i + 2] = _toHexChar(b >> 4);
            buffer[2 * i + 3] = _toHexChar(b & 0x0f);
        }
        return string(buffer);
    }

    /// @notice Helper to convert bytes32 to hex string
    function _bytes32ToHexString(bytes32 value) private pure returns (string memory) {
        bytes memory buffer = new bytes(66);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 0; i < 32; i++) {
            uint8 b = uint8(value[i]);
            buffer[2 * i + 2] = _toHexChar(b >> 4);
            buffer[2 * i + 3] = _toHexChar(b & 0x0f);
        }
        return string(buffer);
    }

    /// @notice Helper to convert uint8 to hex character
    function _toHexChar(uint8 value) private pure returns (bytes1) {
        if (value < 10) {
            return bytes1(uint8(bytes1("0")) + value);
        } else {
            return bytes1(uint8(bytes1("a")) + value - 10);
        }
    }

    /// @notice Create a vote escrow with the given obligation data
    /// @param data The encoded obligation data
    /// @param expirationTime The expiration timestamp (0 for no expiration)
    /// @return uid The attestation UID
    function doObligation(bytes calldata data, uint64 expirationTime) external returns (bytes32 uid) {
        uid = doObligationRaw(data, expirationTime, bytes32(0));
        // Store mapping from attestation UID to data hash
        bytes32 dataHash = keccak256(data);
        attestationToDataHash[uid] = dataHash;
        return uid;
    }

    /// @notice Create a vote escrow with typed obligation data
    /// @param obligationData The typed obligation data
    /// @param expirationTime The expiration timestamp (0 for no expiration)
    /// @return uid The attestation UID
    function doObligation(ObligationData memory obligationData, uint64 expirationTime) external returns (bytes32 uid) {
        bytes memory encodedData = encodeObligationData(obligationData);
        // Call this contract's doObligation(bytes, uint64) externally to convert memory to calldata
        uid = this.doObligation(encodedData, expirationTime);
        return uid;
    }

    /// @notice Get escrow details by data hash
    function getEscrowDetails(bytes32 dataHash)
        external
        view
        returns (address voter, ObligationData memory data, address prevDelegate)
    {
        return (escrowedVoter[dataHash], escrowedData[dataHash], previousDelegate[dataHash]);
    }

    /// @notice Get escrow details by attestation UID
    function getEscrowDetailsByUID(bytes32 uid)
        external
        view
        returns (address voter, ObligationData memory data, address prevDelegate)
    {
        bytes32 dataHash = attestationToDataHash[uid];
        return (escrowedVoter[dataHash], escrowedData[dataHash], previousDelegate[dataHash]);
    }

    /// @notice Check if a voter has an active escrow
    function hasActiveEscrow(address voter) external view returns (bool, bytes32) {
        bytes32 dataHash = activeEscrow[voter];
        return (dataHash != bytes32(0), dataHash);
    }
}
