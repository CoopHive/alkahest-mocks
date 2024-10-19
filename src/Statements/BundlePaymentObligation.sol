// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {
    IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData
} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/token/ERC721/IERC721.sol";
import {BaseStatement} from "../BaseStatement.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract BundlePaymentObligation is BaseStatement, IArbiter {
    using ArbiterUtils for Attestation;

    struct StatementData {
        address[] erc20Addresses;
        uint256[] erc20Amounts;
        address[] erc721Addresses;
        uint256[] erc721Ids;
        address arbiter;
        bytes demand;
    }

    error InvalidPayment();
    error InvalidPaymentAttestation();
    error InvalidFulfillment();
    error UnauthorizedCall();
    error AlreadyRevoked();

    constructor(IEAS _eas, ISchemaRegistry _schemaRegistry)
        BaseStatement(
            _eas,
            _schemaRegistry,
            "address[] erc20Addresses, uint256[] erc20Amounts, address[] erc721Addresses, uint256[] erc721Ids, address arbiter, bytes demand",
            true
        )
    {}

    function makeStatement(StatementData calldata data, uint64 expirationTime, bytes32 refUID)
        public
        returns (bytes32)
    {
        // Transfer ERC20 tokens to the contract
        require(data.erc20Addresses.length == data.erc20Amounts.length, "Mismatched ERC20 arrays");
        for (uint256 i = 0; i < data.erc20Addresses.length; i++) {
            address tokenAddress = data.erc20Addresses[i];
            uint256 amount = data.erc20Amounts[i];
            if (!IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount)) {
                revert InvalidPayment();
            }
        }

        // Transfer ERC721 tokens to the contract
        require(data.erc721Addresses.length == data.erc721Ids.length, "Mismatched ERC721 arrays");
        for (uint256 i = 0; i < data.erc721Addresses.length; i++) {
            address tokenAddress = data.erc721Addresses[i];
            uint256 tokenId = data.erc721Ids[i];
            IERC721(tokenAddress).transferFrom(msg.sender, address(this), tokenId);
        }

        return eas.attest(
            AttestationRequest({
                schema: ATTESTATION_SCHEMA,
                data: AttestationRequestData({
                    recipient: msg.sender,
                    expirationTime: expirationTime,
                    revocable: true,
                    refUID: refUID,
                    data: abi.encode(data),
                    value: 0
                })
            })
        );
    }

    function collectPayment(bytes32 _payment, bytes32 _fulfillment) public returns (bool) {
        Attestation memory payment = eas.getAttestation(_payment);
        Attestation memory fulfillment = eas.getAttestation(_fulfillment);

        if (!payment._checkIntrinsic()) revert InvalidPaymentAttestation();
        if (payment.revocationTime != 0) revert AlreadyRevoked();

        StatementData memory paymentData = abi.decode(payment.data, (StatementData));

        // Check if the fulfillment is valid
        if (!_isValidFulfillment(payment, fulfillment, paymentData)) {
            revert InvalidFulfillment();
        }

        // Revoke the payment attestation
        eas.revoke(
            RevocationRequest({schema: ATTESTATION_SCHEMA, data: RevocationRequestData({uid: _payment, value: 0})})
        );

        // Transfer ERC20 tokens to the recipient
        for (uint256 i = 0; i < paymentData.erc20Addresses.length; i++) {
            address tokenAddress = paymentData.erc20Addresses[i];
            uint256 amount = paymentData.erc20Amounts[i];
            IERC20(tokenAddress).transfer(fulfillment.recipient, amount);
        }

        // Transfer ERC721 tokens to the recipient
        for (uint256 i = 0; i < paymentData.erc721Addresses.length; i++) {
            address tokenAddress = paymentData.erc721Addresses[i];
            uint256 tokenId = paymentData.erc721Ids[i];
            IERC721(tokenAddress).transferFrom(address(this), fulfillment.recipient, tokenId);
        }

        return true;
    }

    function cancelStatement(bytes32 uid) public returns (bool) {
        Attestation memory attestation = eas.getAttestation(uid);
        if (msg.sender != attestation.recipient) revert UnauthorizedCall();
        if (attestation.revocationTime != 0) revert AlreadyRevoked();

        eas.revoke(RevocationRequest({schema: ATTESTATION_SCHEMA, data: RevocationRequestData({uid: uid, value: 0})}));

        StatementData memory data = abi.decode(attestation.data, (StatementData));

        // Return ERC20 tokens to the sender
        for (uint256 i = 0; i < data.erc20Addresses.length; i++) {
            address tokenAddress = data.erc20Addresses[i];
            uint256 amount = data.erc20Amounts[i];
            IERC20(tokenAddress).transfer(msg.sender, amount);
        }

        // Return ERC721 tokens to the sender
        for (uint256 i = 0; i < data.erc721Addresses.length; i++) {
            address tokenAddress = data.erc721Addresses[i];
            uint256 tokenId = data.erc721Ids[i];
            IERC721(tokenAddress).transferFrom(address(this), msg.sender, tokenId);
        }

        return true;
    }

    function checkStatement(Attestation memory statement, bytes memory demand, bytes32 /* counteroffer */ )
        public
        view
        override
        returns (bool)
    {
        if (!statement._checkIntrinsic()) return false;

        StatementData memory payment = abi.decode(statement.data, (StatementData));
        StatementData memory demandData = abi.decode(demand, (StatementData));

        // Compare bundles
        return _isMatchingBundle(payment, demandData) && payment.arbiter == demandData.arbiter
            && keccak256(payment.demand) == keccak256(demandData.demand);
    }

    function _isValidFulfillment(
        Attestation memory payment,
        Attestation memory fulfillment,
        StatementData memory paymentData
    ) internal view returns (bool) {
        // Special case: If the payment references this fulfillment, consider it valid
        if (payment.refUID != 0) return payment.refUID == fulfillment.uid;

        // Regular case: check using the arbiter
        return IArbiter(paymentData.arbiter).checkStatement(fulfillment, paymentData.demand, payment.uid);
    }

    function _isMatchingBundle(StatementData memory a, StatementData memory b) internal pure returns (bool) {
        if (a.erc20Addresses.length != b.erc20Addresses.length) return false;
        if (a.erc20Amounts.length != b.erc20Amounts.length) return false;
        if (a.erc721Addresses.length != b.erc721Addresses.length) return false;
        if (a.erc721Ids.length != b.erc721Ids.length) return false;

        // Compare ERC20 tokens
        for (uint256 i = 0; i < a.erc20Addresses.length; i++) {
            if (a.erc20Addresses[i] != b.erc20Addresses[i]) return false;
            if (a.erc20Amounts[i] < b.erc20Amounts[i]) return false; // Allow more but not less
        }

        // Compare ERC721 tokens
        for (uint256 i = 0; i < a.erc721Addresses.length; i++) {
            if (a.erc721Addresses[i] != b.erc721Addresses[i]) return false;
            if (a.erc721Ids[i] != b.erc721Ids[i]) return false;
        }

        return true;
    }
}
