// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC20EscrowObligation} from "../../src/Statements/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "../../src/Statements/ERC20PaymentObligation.sol";
import {ERC20BarterUtils} from "../../src/Utils/ERC20BarterUtils.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract MockERC20Permit is ERC20Permit {
    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) ERC20Permit(name) {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract ERC20BarterUtilsUnitTest is Test {
    ERC20EscrowObligation public escrowStatement;
    ERC20PaymentObligation public paymentStatement;
    ERC20BarterUtils public barterUtils;
    MockERC20Permit public tokenA;
    MockERC20Permit public tokenB;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    address public constant EAS_ADDRESS =
        0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS =
        0xA7b39296258348C78294F95B872b282326A97BDF;

    uint256 internal constant ALICE_PRIVATE_KEY = 0xa11ce;
    uint256 internal constant BOB_PRIVATE_KEY = 0xb0b;

    address public alice;
    address public bob;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));
        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        tokenA = new MockERC20Permit("Token A", "TKA");
        tokenB = new MockERC20Permit("Token B", "TKB");

        escrowStatement = new ERC20EscrowObligation(eas, schemaRegistry);
        paymentStatement = new ERC20PaymentObligation(eas, schemaRegistry);
        barterUtils = new ERC20BarterUtils(
            eas,
            escrowStatement,
            paymentStatement
        );

        tokenA.transfer(alice, 1000 * 10 ** 18);
        tokenB.transfer(bob, 1000 * 10 ** 18);
    }

    function testBuyErc20ForErc20() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 askAmount = 200 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);

        vm.startPrank(alice);
        tokenA.approve(address(escrowStatement), bidAmount);
        bytes32 buyAttestation = barterUtils.buyErc20ForErc20(
            address(tokenA),
            bidAmount,
            address(tokenB),
            askAmount,
            expiration
        );
        vm.stopPrank();

        assertNotEq(
            buyAttestation,
            bytes32(0),
            "Buy attestation should be created"
        );
    }

    function testPermitAndBuyErc20ForErc20() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 askAmount = 200 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1;

        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            tokenA,
            ALICE_PRIVATE_KEY,
            address(escrowStatement),
            bidAmount,
            deadline
        );

        vm.prank(alice);
        bytes32 buyAttestation = barterUtils.permitAndBuyErc20ForErc20(
            address(tokenA),
            bidAmount,
            address(tokenB),
            askAmount,
            expiration,
            deadline,
            v,
            r,
            s
        );

        assertNotEq(
            buyAttestation,
            bytes32(0),
            "Buy attestation should be created"
        );
    }

    function testPermitSignatureValidation() public {
        uint256 amount = 100 * 10 ** 18;
        uint256 deadline = block.timestamp + 1;

        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            tokenA,
            ALICE_PRIVATE_KEY,
            address(escrowStatement),
            amount,
            deadline
        );

        tokenA.permit(
            alice,
            address(escrowStatement),
            amount,
            deadline,
            v,
            r,
            s
        );

        assertEq(
            tokenA.allowance(alice, address(escrowStatement)),
            amount,
            "Permit should have set allowance"
        );
    }

    function test_RevertWhen_PermitExpired() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 askAmount = 200 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1;

        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            tokenA,
            ALICE_PRIVATE_KEY,
            address(escrowStatement),
            bidAmount,
            deadline
        );

        vm.warp(block.timestamp + 2);

        vm.prank(alice);
        vm.expectRevert();
        barterUtils.permitAndBuyErc20ForErc20(
            address(tokenA),
            bidAmount,
            address(tokenB),
            askAmount,
            expiration,
            deadline,
            v,
            r,
            s
        );
    }

    function _getPermitSignature(
        MockERC20Permit token,
        uint256 ownerPrivateKey,
        address spender,
        uint256 value,
        uint256 deadline
    ) internal view returns (uint8 v, bytes32 r, bytes32 s) {
        bytes32 permitTypehash = keccak256(
            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
        );

        address owner = vm.addr(ownerPrivateKey);
        bytes32 structHash = keccak256(
            abi.encode(
                permitTypehash,
                owner,
                spender,
                value,
                token.nonces(owner),
                deadline
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", token.DOMAIN_SEPARATOR(), structHash)
        );

        (v, r, s) = vm.sign(ownerPrivateKey, digest);
    }
}
