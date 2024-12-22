// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Attestation} from "@eas/Common.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/token/ERC721/IERC721.sol";
import {IERC1155} from "@openzeppelin/token/ERC1155/IERC1155.sol";
import {IERC1155Receiver} from "@openzeppelin/token/ERC1155/IERC1155Receiver.sol";
import {BaseStatement} from "../BaseStatement.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";

contract TokenBundleEscrowObligation is
    BaseStatement,
    IArbiter,
    IERC1155Receiver
{
    using ArbiterUtils for Attestation;

    struct StatementData {
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
        address arbiter;
        bytes demand;
    }

    event BundleEscrowed(bytes32 indexed escrow, address indexed buyer);
    event BundleClaimed(
        bytes32 indexed escrow,
        bytes32 indexed fulfillment,
        address indexed fulfiller
    );

    error InvalidTransfer();
    error InvalidEscrowAttestation();
    error InvalidFulfillment();
    error UnauthorizedCall();
    error ArrayLengthMismatch();

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseStatement(
            _eas,
            _schemaRegistry,
            "address[] erc20Tokens, uint256[] erc20Amounts, address[] erc721Tokens, uint256[] erc721TokenIds, address[] erc1155Tokens, uint256[] erc1155TokenIds, uint256[] erc1155Amounts, address arbiter, bytes demand",
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
            if (
                !IERC20(data.erc20Tokens[i]).transferFrom(
                    from,
                    address(this),
                    data.erc20Amounts[i]
                )
            ) revert InvalidTransfer();
        }

        // Transfer ERC721s
        for (uint i = 0; i < data.erc721Tokens.length; i++) {
            IERC721(data.erc721Tokens[i]).transferFrom(
                from,
                address(this),
                data.erc721TokenIds[i]
            );
        }

        // Transfer ERC1155s
        for (uint i = 0; i < data.erc1155Tokens.length; i++) {
            IERC1155(data.erc1155Tokens[i]).safeTransferFrom(
                from,
                address(this),
                data.erc1155TokenIds[i],
                data.erc1155Amounts[i],
                ""
            );
        }
    }

    function transferOutTokenBundle(
        StatementData memory data,
        address to
    ) internal {
        // Transfer ERC20s
        for (uint i = 0; i < data.erc20Tokens.length; i++) {
            if (!IERC20(data.erc20Tokens[i]).transfer(to, data.erc20Amounts[i]))
                revert InvalidTransfer();
        }

        // Transfer ERC721s
        for (uint i = 0; i < data.erc721Tokens.length; i++) {
            IERC721(data.erc721Tokens[i]).transferFrom(
                address(this),
                to,
                data.erc721TokenIds[i]
            );
        }

        // Transfer ERC1155s
        for (uint i = 0; i < data.erc1155Tokens.length; i++) {
            IERC1155(data.erc1155Tokens[i]).safeTransferFrom(
                address(this),
                to,
                data.erc1155TokenIds[i],
                data.erc1155Amounts[i],
                ""
            );
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

        uid_ = eas.attest(
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
        );
        emit BundleEscrowed(uid_, recipient);
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
        Attestation memory payment = eas.getAttestation(_payment);
        Attestation memory fulfillment = eas.getAttestation(_fulfillment);

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

        eas.revoke(
            RevocationRequest({
                schema: ATTESTATION_SCHEMA,
                data: RevocationRequestData({uid: _payment, value: 0})
            })
        );

        transferOutTokenBundle(paymentData, fulfillment.recipient);
        return true;
    }

    function collectExpired(bytes32 uid) public returns (bool) {
        Attestation memory attestation = eas.getAttestation(uid);

        if (block.timestamp < attestation.expirationTime)
            revert UnauthorizedCall();

        StatementData memory data = abi.decode(
            attestation.data,
            (StatementData)
        );

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

    // ERC1155 Receiver Implementation
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) external pure override returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId;
    }
}
