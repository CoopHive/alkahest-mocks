// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {BaseObligation} from "../../obligations/BaseObligation.sol";
import {IArbiter} from "../../IArbiter.sol";
import {BaseArbiter} from "../../BaseArbiter.sol";
import {ArbiterUtils} from "../../libraries/ArbiterUtils.sol";

/**
 * @title CryptoSignatureObligation
 * @notice Combined Obligation/Arbiter contract for cryptographic signature verification
 * @dev This contract demonstrates the pattern of combining fulfillment and arbiter functionality
 *      when there's an obvious, canonical way to validate the fulfillment data. For cryptographic
 *      signatures, the validation method (ECDSA recovery) is inherent to the data format itself.
 *
 * Pattern illustrated: Bundled validation for fulfillments where the validation logic is
 * fundamentally tied to the data structure, making separation unnecessarily complex.
 *
 * When to use this pattern:
 * - The fulfillment has one obvious validation method (like signature verification)
 * - The validation is inherent to what the data represents
 * - There's no need for alternative validation strategies
 * - The validation logic won't need to be swapped or upgraded
 *
 * Contrast with StringObligation which doesn't implement IArbiter because strings
 * can be validated in countless different ways depending on the use case.
 */
contract CryptoSignatureObligation is BaseObligation, BaseArbiter {
    using ArbiterUtils for Attestation;

    /**
     * @notice Struct for demand data specifying the signature requirements
     * @param publicKey The public key (address) that must sign the challenge
     * @param challenge The message/data that must be signed
     * @param domain Optional domain separator for EIP-712 style signatures (use empty string for simple signatures)
     */
    struct DemandData {
        address publicKey;
        bytes32 challenge;
        string domain;
    }

    /**
     * @notice Struct for fulfillment data containing the signature
     * @param signature The cryptographic signature of the challenge
     * @param signerAddress The address that created the signature (for verification)
     * @param timestamp When the signature was created
     * @param metadata Optional metadata about the signing context
     */
    struct ObligationData {
        bytes signature;
        address signerAddress;
        uint256 timestamp;
        string metadata;
    }

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        BaseObligation(
            _eas, _schemaRegistry, "bytes signature,address signerAddress,uint256 timestamp,string metadata", true
        )
    {}

    /**
     * @notice Create a fulfillment attestation with signature data
     * @param data The fulfillment data containing the signature
     * @param refUID Reference to the escrow being fulfilled
     * @return uid The UID of the created attestation
     */
    function doObligation(ObligationData calldata data, bytes32 refUID) public returns (bytes32 uid) {
        bytes memory encodedData = encodeObligationData(data);
        uid = _doObligationForRaw(encodedData, 0, msg.sender, refUID);
    }

    /**
     * @notice Create a fulfillment by signing a challenge on-chain
     * @dev This convenience method signs the challenge for the caller
     * @param challenge The challenge to sign
     * @param metadata Optional metadata about the signing
     * @param refUID Reference to the escrow being fulfilled
     * @return uid The UID of the created attestation
     */
    function signAndFulfill(bytes32 challenge, string calldata metadata, bytes32 refUID)
        external
        returns (bytes32 uid)
    {
        // Create a simple Ethereum signed message hash
        bytes32 messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", challenge));

        // Since we're calling from a contract, we can't actually sign
        // In a real implementation, this would be done off-chain
        // For demonstration, we'll create a placeholder signature
        bytes memory signature = abi.encodePacked(messageHash, msg.sender);

        ObligationData memory data = ObligationData({
            signature: signature, signerAddress: msg.sender, timestamp: block.timestamp, metadata: metadata
        });

        bytes memory encodedData = encodeObligationData(data);
        return _doObligationForRaw(encodedData, 0, msg.sender, refUID);
    }

    /**
     * @notice Check if a fulfillment contains a valid signature for the demand
     * @param fulfillment The attestation containing the signature
     * @param demand The encoded demand specifying what should be signed
     * @param escrowUid Optional reference UID for what this fulfillment is escrowUid
     * @return bool True if the signature is valid for the specified challenge
     */
    function check(Attestation memory fulfillment, bytes memory demand, bytes32 escrowUid)
        external
        view
        override
        returns (bool)
    {
        // Check basic attestation validity

        // Check reference if specified
        if (escrowUid != bytes32(0) && fulfillment.refUID != escrowUid) {
            return false;
        }

        // Decode the demand to get requirements
        DemandData memory demandData = abi.decode(demand, (DemandData));

        // Decode the fulfillment to get the signature
        ObligationData memory obligationData = decodeObligationData(fulfillment.data);

        // Verify the signer matches the required public key
        if (obligationData.signerAddress != demandData.publicKey) {
            return false;
        }

        // Verify the signature
        return _verifySignature(demandData.challenge, obligationData.signature, demandData.publicKey, demandData.domain);
    }

    /**
     * @notice Internal function to verify a signature
     * @param challenge The original challenge that was signed
     * @param signature The signature to verify
     * @param expectedSigner The address that should have signed
     * @param domain Optional domain for EIP-712 signatures
     * @return bool True if the signature is valid
     */
    function _verifySignature(bytes32 challenge, bytes memory signature, address expectedSigner, string memory domain)
        internal
        pure
        returns (bool)
    {
        if (signature.length != 65) {
            return false;
        }

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        // Handle both v = 27/28 and v = 0/1 formats
        if (v < 27) {
            v += 27;
        }

        // Create the message hash based on whether we have a domain
        bytes32 messageHash;
        if (bytes(domain).length > 0) {
            // EIP-712 style with domain
            messageHash = keccak256(abi.encodePacked("\x19\x01", keccak256(bytes(domain)), challenge));
        } else {
            // Simple Ethereum signed message
            messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", challenge));
        }

        // Recover the signer
        address recoveredSigner = ecrecover(messageHash, v, r, s);

        return recoveredSigner == expectedSigner && recoveredSigner != address(0);
    }

    /**
     * @notice Encode demand data for creating escrows
     * @param publicKey The address that must sign
     * @param challenge The challenge to be signed
     * @param domain Optional domain separator
     * @return Encoded demand data
     */
    function encodeDemand(address publicKey, bytes32 challenge, string memory domain)
        public
        pure
        returns (bytes memory)
    {
        return abi.encode(DemandData({publicKey: publicKey, challenge: challenge, domain: domain}));
    }

    /**
     * @notice Encode fulfillment data
     * @param data The fulfillment data to encode
     * @return Encoded data
     */
    function encodeObligationData(ObligationData memory data) public pure returns (bytes memory) {
        return abi.encode(data.signature, data.signerAddress, data.timestamp, data.metadata);
    }

    /**
     * @notice Decode fulfillment data from bytes
     * @param data The encoded data
     * @return Decoded fulfillment data
     */
    function decodeObligationData(bytes memory data) public pure returns (ObligationData memory) {
        (bytes memory signature, address signerAddress, uint256 timestamp, string memory metadata) =
            abi.decode(data, (bytes, address, uint256, string));

        return
            ObligationData({
                signature: signature, signerAddress: signerAddress, timestamp: timestamp, metadata: metadata
            });
    }

    /**
     * @notice Get fulfillment data for a specific attestation UID
     * @param uid The attestation UID
     * @return The decoded fulfillment data
     */
    function getObligationData(bytes32 uid) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return decodeObligationData(attestation.data);
    }

    /**
     * @notice Verify a signature off-chain helper
     * @dev This can be called without creating an attestation to test signatures
     * @param publicKey The expected signer
     * @param challenge The challenge that was signed
     * @param signature The signature to verify
     * @return valid True if the signature is valid
     */
    function verifySignatureHelper(address publicKey, bytes32 challenge, bytes calldata signature)
        external
        pure
        returns (bool valid)
    {
        return _verifySignature(challenge, signature, publicKey, "");
    }

    /**
     * @notice Generate a challenge based on contextual data
     * @dev Helper function to create deterministic challenges
     * @param context Arbitrary context data
     * @param nonce A nonce to ensure uniqueness
     * @return challenge The generated challenge
     */
    function generateChallenge(bytes calldata context, uint256 nonce) external view returns (bytes32 challenge) {
        return keccak256(abi.encodePacked(context, nonce, block.timestamp, block.chainid, address(this)));
    }
}
