// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {BaseStatement} from "../BaseStatement.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract TokenBundleEscrowObligation is BaseStatement, IArbiter, ERC1155Holder {
    using ArbiterUtils for Attestation;

    struct StatementData {
        address arbiter;
        bytes demand;
        // ERC20
        address[] erc20Tokens;
        uint256[] erc20Amounts;
        // ERC721
        address[] erc721Tokens;
        uint256[] erc721TokenIds;
        // ERC1155
        address[] erc1155Tokens;
        uint256[] erc1155TokenIds;
        uint256[] erc1155Amounts;
    }

    event EscrowMade(bytes32 indexed payment, address indexed buyer);
    event EscrowClaimed(
        bytes32 indexed payment,
        bytes32 indexed fulfillment,
        address indexed fulfiller
    );

    error InvalidTransfer();
    error InvalidEscrowAttestation();
    error InvalidFulfillment();
    error UnauthorizedCall();
    error ArrayLengthMismatch();
    error ERC20TransferFailed(
        address token,
        address from,
        address to,
        uint256 amount
    );
    error ERC721TransferFailed(
        address token,
        address from,
        address to,
        uint256 tokenId
    );
    error ERC1155TransferFailed(
        address token,
        address from,
        address to,
        uint256 tokenId,
        uint256 amount
    );
    error AttestationNotFound(bytes32 attestationId);
    error AttestationCreateFailed();
    error RevocationFailed(bytes32 attestationId);

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseStatement(
            _eas,
            _schemaRegistry,
            "address arbiter, bytes demand, address[] erc20Tokens, uint256[] erc20Amounts, address[] erc721Tokens, uint256[] erc721TokenIds, address[] erc1155Tokens, uint256[] erc1155TokenIds, uint256[] erc1155Amounts",
            true
        )
    {}

    function validateArrayLengths(StatementData calldata data) internal pure {
        if (data.erc20Tokens.length != data.erc20Amounts.length)
            revert ArrayLengthMismatch();
        if (data.erc721Tokens.length != data.erc721TokenIds.length)
            revert ArrayLengthMismatch();
        if (
            data.erc1155Tokens.length != data.erc1155TokenIds.length ||
            data.erc1155Tokens.length != data.erc1155Amounts.length
        ) revert ArrayLengthMismatch();
    }

    function transferInTokenBundle(
        StatementData calldata data,
        address from
    ) internal {
        // Transfer ERC20s
        for (uint i = 0; i < data.erc20Tokens.length; i++) {
            bool success;
            try
                IERC20(data.erc20Tokens[i]).transferFrom(
                    from,
                    address(this),
                    data.erc20Amounts[i]
                )
            returns (bool result) {
                success = result;
            } catch {
                success = false;
            }

            if (!success) {
                revert ERC20TransferFailed(
                    data.erc20Tokens[i],
                    from,
                    address(this),
                    data.erc20Amounts[i]
                );
            }
        }

        // Transfer ERC721s
        for (uint i = 0; i < data.erc721Tokens.length; i++) {
            try
                IERC721(data.erc721Tokens[i]).transferFrom(
                    from,
                    address(this),
                    data.erc721TokenIds[i]
                )
            {
                // Transfer succeeded
            } catch {
                revert ERC721TransferFailed(
                    data.erc721Tokens[i],
                    from,
                    address(this),
                    data.erc721TokenIds[i]
                );
            }
        }

        // Transfer ERC1155s
        for (uint i = 0; i < data.erc1155Tokens.length; i++) {
            try
                IERC1155(data.erc1155Tokens[i]).safeTransferFrom(
                    from,
                    address(this),
                    data.erc1155TokenIds[i],
                    data.erc1155Amounts[i],
                    ""
                )
            {
                // Transfer succeeded
            } catch {
                revert ERC1155TransferFailed(
                    data.erc1155Tokens[i],
                    from,
                    address(this),
                    data.erc1155TokenIds[i],
                    data.erc1155Amounts[i]
                );
            }
        }
    }

    function transferOutTokenBundle(
        StatementData memory data,
        address to
    ) internal {
        // Transfer ERC20s
        for (uint i = 0; i < data.erc20Tokens.length; i++) {
            bool success;
            try
                IERC20(data.erc20Tokens[i]).transfer(to, data.erc20Amounts[i])
            returns (bool result) {
                success = result;
            } catch {
                success = false;
            }

            if (!success) {
                revert ERC20TransferFailed(
                    data.erc20Tokens[i],
                    address(this),
                    to,
                    data.erc20Amounts[i]
                );
            }
        }

        // Transfer ERC721s
        for (uint i = 0; i < data.erc721Tokens.length; i++) {
            try
                IERC721(data.erc721Tokens[i]).transferFrom(
                    address(this),
                    to,
                    data.erc721TokenIds[i]
                )
            {
                // Transfer succeeded
            } catch {
                revert ERC721TransferFailed(
                    data.erc721Tokens[i],
                    address(this),
                    to,
                    data.erc721TokenIds[i]
                );
            }
        }

        // Transfer ERC1155s
        for (uint i = 0; i < data.erc1155Tokens.length; i++) {
            try
                IERC1155(data.erc1155Tokens[i]).safeTransferFrom(
                    address(this),
                    to,
                    data.erc1155TokenIds[i],
                    data.erc1155Amounts[i],
                    ""
                )
            {
                // Transfer succeeded
            } catch {
                revert ERC1155TransferFailed(
                    data.erc1155Tokens[i],
                    address(this),
                    to,
                    data.erc1155TokenIds[i],
                    data.erc1155Amounts[i]
                );
            }
        }
    }

    function makeStatementFor(
        StatementData calldata data,
        uint64 expirationTime,
        address payer,
        address recipient
    ) public returns (bytes32 uid_) {
        validateArrayLengths(data);
        transferInTokenBundle(data, payer);

        // Create attestation with try/catch for potential EAS failures
        try
            eas.attest(
                AttestationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: AttestationRequestData({
                        recipient: recipient,
                        expirationTime: expirationTime,
                        revocable: true,
                        refUID: bytes32(0),
                        data: abi.encode(data),
                        value: 0
                    })
                })
            )
        returns (bytes32 uid) {
            uid_ = uid;
            emit EscrowMade(uid_, recipient);
        } catch {
            // The revert will automatically revert all state changes including token transfers
            revert AttestationCreateFailed();
        }
    }

    function makeStatement(
        StatementData calldata data,
        uint64 expirationTime
    ) public returns (bytes32 uid_) {
        return makeStatementFor(data, expirationTime, msg.sender, msg.sender);
    }

    function collectPayment(
        bytes32 _payment,
        bytes32 _fulfillment
    ) public returns (bool) {
        Attestation memory payment;
        Attestation memory fulfillment;

        // Get payment attestation with error handling
        try eas.getAttestation(_payment) returns (Attestation memory result) {
            payment = result;
        } catch {
            revert AttestationNotFound(_payment);
        }

        // Get fulfillment attestation with error handling
        try eas.getAttestation(_fulfillment) returns (
            Attestation memory result
        ) {
            fulfillment = result;
        } catch {
            revert AttestationNotFound(_fulfillment);
        }

        if (!payment._checkIntrinsic()) revert InvalidEscrowAttestation();

        StatementData memory paymentData = abi.decode(
            payment.data,
            (StatementData)
        );

        if (
            !IArbiter(paymentData.arbiter).checkStatement(
                fulfillment,
                paymentData.demand,
                payment.uid
            )
        ) revert InvalidFulfillment();

        // Revoke attestation with error handling
        try
            eas.revoke(
                RevocationRequest({
                    schema: ATTESTATION_SCHEMA,
                    data: RevocationRequestData({uid: _payment, value: 0})
                })
            )
        {} catch {
            revert RevocationFailed(_payment);
        }

        // Transfer tokens with proper error handling
        transferOutTokenBundle(paymentData, fulfillment.recipient);

        emit EscrowClaimed(_payment, _fulfillment, fulfillment.recipient);
        return true;
    }

    function collectExpired(bytes32 uid) public returns (bool) {
        Attestation memory attestation;

        // Get attestation with error handling
        try eas.getAttestation(uid) returns (Attestation memory result) {
            attestation = result;
        } catch {
            revert AttestationNotFound(uid);
        }

        if (block.timestamp < attestation.expirationTime)
            revert UnauthorizedCall();

        StatementData memory data = abi.decode(
            attestation.data,
            (StatementData)
        );

        // Transfer tokens with error handling (already handled in transferOutTokenBundle)
        transferOutTokenBundle(data, attestation.recipient);
        return true;
    }

    function checkStatement(
        Attestation memory statement,
        bytes memory demand,
        bytes32 /* counteroffer */
    ) public view override returns (bool) {
        if (!statement._checkIntrinsic(ATTESTATION_SCHEMA)) return false;

        StatementData memory payment = abi.decode(
            statement.data,
            (StatementData)
        );
        StatementData memory demandData = abi.decode(demand, (StatementData));

        return
            _checkTokenArrays(payment, demandData) &&
            payment.arbiter == demandData.arbiter &&
            keccak256(payment.demand) == keccak256(demandData.demand);
    }

    function _checkTokenArrays(
        StatementData memory payment,
        StatementData memory demand
    ) internal pure returns (bool) {
        // Check ERC20s
        if (payment.erc20Tokens.length < demand.erc20Tokens.length)
            return false;
        for (uint i = 0; i < demand.erc20Tokens.length; i++) {
            if (
                payment.erc20Tokens[i] != demand.erc20Tokens[i] ||
                payment.erc20Amounts[i] < demand.erc20Amounts[i]
            ) return false;
        }

        // Check ERC721s
        if (payment.erc721Tokens.length < demand.erc721Tokens.length)
            return false;
        for (uint i = 0; i < demand.erc721Tokens.length; i++) {
            if (
                payment.erc721Tokens[i] != demand.erc721Tokens[i] ||
                payment.erc721TokenIds[i] != demand.erc721TokenIds[i]
            ) return false;
        }

        // Check ERC1155s
        if (payment.erc1155Tokens.length < demand.erc1155Tokens.length)
            return false;
        for (uint i = 0; i < demand.erc1155Tokens.length; i++) {
            if (
                payment.erc1155Tokens[i] != demand.erc1155Tokens[i] ||
                payment.erc1155TokenIds[i] != demand.erc1155TokenIds[i] ||
                payment.erc1155Amounts[i] < demand.erc1155Amounts[i]
            ) return false;
        }

        return true;
    }

    function getStatementData(
        bytes32 uid
    ) public view returns (StatementData memory) {
        Attestation memory attestation = eas.getAttestation(uid);
        if (attestation.schema != ATTESTATION_SCHEMA)
            revert InvalidEscrowAttestation();
        return abi.decode(attestation.data, (StatementData));
    }

    function decodeStatementData(
        bytes calldata data
    ) public pure returns (StatementData memory) {
        return abi.decode(data, (StatementData));
    }
}
