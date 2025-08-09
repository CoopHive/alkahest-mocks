// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {BaseEscrowObligation} from "../BaseEscrowObligation.sol";
import {IArbiter} from "../IArbiter.sol";
import {ArbiterUtils} from "../ArbiterUtils.sol";
import {Attestation} from "@eas/Common.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract TokenBundleEscrowObligation2 is
    BaseEscrowObligation,
    IArbiter,
    ERC1155Holder
{
    using ArbiterUtils for Attestation;

    struct ObligationData {
        address arbiter;
        bytes demand;
        // Native tokens
        uint256 nativeAmount;
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

    error ArrayLengthMismatch();
    error InsufficientPayment(uint256 expected, uint256 received);
    error NativeTokenTransferFailed(address to, uint256 amount);
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

    constructor(
        IEAS _eas,
        ISchemaRegistry _schemaRegistry
    )
        BaseEscrowObligation(
            _eas,
            _schemaRegistry,
            "address arbiter, bytes demand, uint256 nativeAmount, address[] erc20Tokens, uint256[] erc20Amounts, address[] erc721Tokens, uint256[] erc721TokenIds, address[] erc1155Tokens, uint256[] erc1155TokenIds, uint256[] erc1155Amounts",
            true
        )
    {}

    function validateArrayLengths(ObligationData memory data) internal pure {
        if (data.erc20Tokens.length != data.erc20Amounts.length)
            revert ArrayLengthMismatch();
        if (data.erc721Tokens.length != data.erc721TokenIds.length)
            revert ArrayLengthMismatch();
        if (
            data.erc1155Tokens.length != data.erc1155TokenIds.length ||
            data.erc1155Tokens.length != data.erc1155Amounts.length
        ) revert ArrayLengthMismatch();
    }

    // Extract arbiter and demand from encoded data
    function extractArbiterAndDemand(
        bytes memory data
    ) public pure override returns (address arbiter, bytes memory demand) {
        ObligationData memory decoded = abi.decode(data, (ObligationData));
        return (decoded.arbiter, decoded.demand);
    }

    // Transfer tokens into escrow
    function _lockEscrow(bytes memory data, address from) internal override {
        ObligationData memory decoded = abi.decode(data, (ObligationData));
        validateArrayLengths(decoded);

        // Handle native tokens
        if (decoded.nativeAmount > 0) {
            if (msg.value < decoded.nativeAmount) {
                revert InsufficientPayment(decoded.nativeAmount, msg.value);
            }
        }

        // Handle token bundle
        transferInTokenBundle(decoded, from);
    }

    // Transfer tokens to fulfiller
    function _releaseEscrow(
        bytes memory escrowData,
        address to,
        bytes32 /* fulfillmentUid */
    ) internal override returns (bytes memory) {
        ObligationData memory decoded = abi.decode(
            escrowData,
            (ObligationData)
        );

        // Transfer native tokens
        if (decoded.nativeAmount > 0) {
            (bool success, ) = payable(to).call{value: decoded.nativeAmount}(
                ""
            );
            if (!success) {
                revert NativeTokenTransferFailed(to, decoded.nativeAmount);
            }
        }

        // Transfer token bundle
        transferOutTokenBundle(decoded, to);
        return ""; // Token escrows don't return anything
    }

    // Return tokens to original owner on expiry
    function _returnEscrow(bytes memory data, address to) internal override {
        _releaseEscrow(data, to, bytes32(0));
    }

    function transferInTokenBundle(
        ObligationData memory data,
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
        ObligationData memory data,
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

    // Implement IArbiter
    function checkObligation(
        Attestation memory obligation,
        bytes memory demand,
        bytes32 /* counteroffer */
    ) public view override returns (bool) {
        if (!obligation._checkIntrinsic(ATTESTATION_SCHEMA)) return false;

        ObligationData memory payment = abi.decode(
            obligation.data,
            (ObligationData)
        );
        ObligationData memory demandData = abi.decode(demand, (ObligationData));

        return
            payment.nativeAmount >= demandData.nativeAmount &&
            _checkTokenArrays(payment, demandData) &&
            payment.arbiter == demandData.arbiter &&
            keccak256(payment.demand) == keccak256(demandData.demand);
    }

    function _checkTokenArrays(
        ObligationData memory payment,
        ObligationData memory demand
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

    // Typed convenience methods
    function doObligation(
        ObligationData calldata data,
        uint64 expirationTime
    ) external payable returns (bytes32) {
        return
            this.doObligationForRaw{value: msg.value}(
                abi.encode(data),
                expirationTime,
                msg.sender,
                msg.sender,
                bytes32(0)
            );
    }

    function doObligationFor(
        ObligationData calldata data,
        uint64 expirationTime,
        address payer,
        address recipient
    ) external payable returns (bytes32) {
        return
            this.doObligationForRaw{value: msg.value}(
                abi.encode(data),
                expirationTime,
                payer,
                recipient,
                bytes32(0)
            );
    }

    function collectEscrow(
        bytes32 escrow,
        bytes32 fulfillment
    ) external returns (bool) {
        collectEscrowRaw(escrow, fulfillment);
        return true;
    }

    function getObligationData(
        bytes32 uid
    ) public view returns (ObligationData memory) {
        Attestation memory attestation = _getAttestation(uid);
        return abi.decode(attestation.data, (ObligationData));
    }

    function decodeObligationData(
        bytes calldata data
    ) public pure returns (ObligationData memory) {
        return abi.decode(data, (ObligationData));
    }

    // Allow contract to receive native tokens
    receive() external payable override {}
}
