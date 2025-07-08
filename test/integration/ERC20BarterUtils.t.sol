// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC20EscrowObligation} from "@src/obligations/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "@src/obligations/ERC20PaymentObligation.sol";
import {ERC20BarterUtils} from "@src/utils/ERC20BarterUtils.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract MockERC20Permit is ERC20Permit {
    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) ERC20Permit(name) {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract ERC20BarterUtilsIntegrationTest is Test {
    ERC20EscrowObligation public escrowStatement;
    ERC20PaymentObligation public paymentStatement;
    ERC20BarterUtils public barterUtils;
    MockERC20Permit public erc1155TokenA;
    MockERC20Permit public erc1155TokenB;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    uint256 internal constant ALICE_PRIVATE_KEY = 0xa11ce;
    uint256 internal constant BOB_PRIVATE_KEY = 0xb0b;

    address public alice;
    address public bob;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        erc1155TokenA = new MockERC20Permit("Token A", "TKA");
        erc1155TokenB = new MockERC20Permit("Token B", "TKB");

        escrowStatement = new ERC20EscrowObligation(eas, schemaRegistry);
        paymentStatement = new ERC20PaymentObligation(eas, schemaRegistry);
        barterUtils = new ERC20BarterUtils(
            eas,
            escrowStatement,
            paymentStatement
        );

        erc1155TokenA.transfer(alice, 1000 * 10 ** 18);
        erc1155TokenB.transfer(bob, 1000 * 10 ** 18);
    }

    function testPayErc20ForErc20() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 askAmount = 200 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice creates buy order
        vm.startPrank(alice);
        erc1155TokenA.approve(address(escrowStatement), bidAmount);
        bytes32 buyAttestation = barterUtils.buyErc20ForErc20(
            address(erc1155TokenA),
            bidAmount,
            address(erc1155TokenB),
            askAmount,
            expiration
        );
        vm.stopPrank();

        // Bob fulfills the order
        vm.startPrank(bob);
        erc1155TokenB.approve(address(paymentStatement), askAmount);
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
            erc1155TokenA.balanceOf(alice),
            900 * 10 ** 18,
            "Alice should have 900 Token A"
        );
        assertEq(
            erc1155TokenA.balanceOf(bob),
            100 * 10 ** 18,
            "Bob should have 100 Token A"
        );
        assertEq(
            erc1155TokenB.balanceOf(alice),
            200 * 10 ** 18,
            "Alice should have 200 Token B"
        );
        assertEq(
            erc1155TokenB.balanceOf(bob),
            800 * 10 ** 18,
            "Bob should have 800 Token B"
        );
    }

    function testFullTradeWithPermits() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 askAmount = 200 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1;

        // Alice creates buy order with permit
        (uint8 v1, bytes32 r1, bytes32 s1) = _getPermitSignature(
            erc1155TokenA,
            ALICE_PRIVATE_KEY,
            address(escrowStatement),
            bidAmount,
            deadline
        );

        vm.prank(alice);
        bytes32 buyAttestation = barterUtils.permitAndBuyErc20ForErc20(
            address(erc1155TokenA),
            bidAmount,
            address(erc1155TokenB),
            askAmount,
            expiration,
            deadline,
            v1,
            r1,
            s1
        );

        // Bob fulfills with permit
        (uint8 v2, bytes32 r2, bytes32 s2) = _getPermitSignature(
            erc1155TokenB,
            BOB_PRIVATE_KEY,
            address(paymentStatement),
            askAmount,
            deadline
        );

        vm.prank(bob);
        bytes32 sellAttestation = barterUtils.permitAndPayErc20ForErc20(
            buyAttestation,
            deadline,
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
        assertEq(erc1155TokenA.balanceOf(alice), 900 * 10 ** 18);
        assertEq(erc1155TokenA.balanceOf(bob), 100 * 10 ** 18);
        assertEq(erc1155TokenB.balanceOf(alice), 200 * 10 ** 18);
        assertEq(erc1155TokenB.balanceOf(bob), 800 * 10 ** 18);
    }

    function testGenericPermitAndPay() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 askAmount = 200 * 10 ** 18;
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1;

        // First create the buy order with proper permit signature
        (uint8 v1, bytes32 r1, bytes32 s1) = _getPermitSignature(
            erc1155TokenA,
            ALICE_PRIVATE_KEY,
            address(escrowStatement),
            bidAmount,
            deadline
        );

        ERC20PaymentObligation.ObligationData
            memory demand = ERC20PaymentObligation.ObligationData({
                token: address(erc1155TokenB),
                amount: askAmount,
                payee: alice
            });

        vm.prank(alice);
        bytes32 buyAttestation = barterUtils.permitAndBuyWithErc20(
            address(erc1155TokenA),
            bidAmount,
            address(paymentStatement),
            abi.encode(demand),
            expiration,
            deadline,
            v1,
            r1,
            s1
        );

        // Bob fulfills with permit
        (uint8 v2, bytes32 r2, bytes32 s2) = _getPermitSignature(
            erc1155TokenB,
            BOB_PRIVATE_KEY,
            address(paymentStatement),
            askAmount,
            deadline
        );

        vm.prank(bob);
        bytes32 sellAttestation = barterUtils.permitAndPayWithErc20(
            address(erc1155TokenB),
            askAmount,
            alice, // payee
            deadline,
            v2,
            r2,
            s2
        );

        // Make the payment collection
        vm.prank(bob);
        bool success = escrowStatement.collectEscrow(
            buyAttestation,
            sellAttestation
        );
        assertTrue(success, "Payment collection should succeed");

        // Verify final balances
        assertEq(
            erc1155TokenA.balanceOf(alice),
            900 * 10 ** 18,
            "Alice should have 900 Token A"
        );
        assertEq(
            erc1155TokenA.balanceOf(bob),
            100 * 10 ** 18,
            "Bob should have 100 Token A"
        );
        assertEq(
            erc1155TokenB.balanceOf(alice),
            200 * 10 ** 18,
            "Alice should have 200 Token B"
        );
        assertEq(
            erc1155TokenB.balanceOf(bob),
            800 * 10 ** 18,
            "Bob should have 800 Token B"
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
