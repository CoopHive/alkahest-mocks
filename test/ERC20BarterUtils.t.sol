// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC20EscrowObligation} from "../src/Statements/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "../src/Statements/ERC20PaymentObligation.sol";
import {ERC20BarterUtils} from "../src/Utils/ERC20BarterUtils.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import "@openzeppelin/token/ERC20/extensions/ERC20Permit.sol";

contract MockERC20Permit is ERC20Permit {
    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) ERC20Permit(name) {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract ERC20BarterUtilsTest is Test {
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

    function testPayErc20ForErc20() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 askAmount = 200 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice creates buy order
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

        // Bob fulfills the order
        vm.startPrank(bob);
        tokenB.approve(address(paymentStatement), askAmount);
        bytes32 sellAttestation = barterUtils.payErc20ForErc20(buyAttestation);
        vm.stopPrank();

        // Verify attestations
        assertNotEq(
            buyAttestation,
            bytes32(0),
            "Buy attestation should be created"
        );
        assertNotEq(
            sellAttestation,
            bytes32(0),
            "Sell attestation should be created"
        );

        // Check final balances
        assertEq(
            tokenA.balanceOf(alice),
            900 * 10 ** 18,
            "Alice should have 900 Token A"
        );
        assertEq(
            tokenA.balanceOf(bob),
            100 * 10 ** 18,
            "Bob should have 100 Token A"
        );
        assertEq(
            tokenB.balanceOf(alice),
            200 * 10 ** 18,
            "Alice should have 200 Token B"
        );
        assertEq(
            tokenB.balanceOf(bob),
            800 * 10 ** 18,
            "Bob should have 800 Token B"
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

    function testFullTradeWithPermits() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 askAmount = 200 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1;

        // Alice creates buy order with permit
        (uint8 v1, bytes32 r1, bytes32 s1) = _getPermitSignature(
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
            v1,
            r1,
            s1
        );

        // Bob fulfills with permit
        (uint8 v2, bytes32 r2, bytes32 s2) = _getPermitSignature(
            tokenB,
            BOB_PRIVATE_KEY,
            address(paymentStatement),
            askAmount,
            deadline
        );

        vm.prank(bob);
        bytes32 sellAttestation = barterUtils.permitAndPayErc20ForErc20(
            buyAttestation,
            v2,
            r2,
            s2
        );

        assertNotEq(
            sellAttestation,
            bytes32(0),
            "Sell attestation should be created"
        );

        // Check final balances
        assertEq(tokenA.balanceOf(alice), 900 * 10 ** 18);
        assertEq(tokenA.balanceOf(bob), 100 * 10 ** 18);
        assertEq(tokenB.balanceOf(alice), 200 * 10 ** 18);
        assertEq(tokenB.balanceOf(bob), 800 * 10 ** 18);
    }

    function testFailExpiredPermit() public {
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
        barterUtils.permitAndBuyErc20ForErc20(
            address(tokenA),
            bidAmount,
            address(tokenB),
            askAmount,
            expiration,
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
}
