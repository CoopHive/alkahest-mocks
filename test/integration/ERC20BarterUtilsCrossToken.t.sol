// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC20EscrowObligation} from "@src/obligations/ERC20EscrowObligation.sol";
import {ERC20PaymentObligation} from "@src/obligations/ERC20PaymentObligation.sol";
import {ERC721EscrowObligation} from "@src/obligations/ERC721EscrowObligation.sol";
import {ERC721PaymentObligation} from "@src/obligations/ERC721PaymentObligation.sol";
import {ERC1155EscrowObligation} from "@src/obligations/ERC1155EscrowObligation.sol";
import {ERC1155PaymentObligation} from "@src/obligations/ERC1155PaymentObligation.sol";
import {TokenBundleEscrowObligation2} from "@src/obligations/TokenBundleEscrowObligation2.sol";
import {TokenBundlePaymentObligation2} from "@src/obligations/TokenBundlePaymentObligation2.sol";
import {NativeTokenEscrowObligation} from "@src/obligations/NativeTokenEscrowObligation.sol";
import {NativeTokenPaymentObligation} from "@src/obligations/NativeTokenPaymentObligation.sol";
import {ERC20BarterUtils} from "@src/utils/ERC20BarterUtils.sol";
import {IEAS} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract MockERC20Permit is ERC20Permit {
    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) ERC20Permit(name) {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract MockERC721 is ERC721 {
    uint256 private _currentTokenId = 0;

    constructor() ERC721("Mock ERC721", "MERC721") {}

    function mint(address to) public returns (uint256) {
        _currentTokenId++;
        _mint(to, _currentTokenId);
        return _currentTokenId;
    }
}

contract MockERC1155 is ERC1155 {
    constructor() ERC1155("") {}

    function mint(address to, uint256 id, uint256 amount) public {
        _mint(to, id, amount, "");
    }
}

contract ERC20BarterUtilsCrossTokenTest is Test {
    ERC20EscrowObligation public escrowObligation;
    ERC20PaymentObligation public paymentObligation;
    ERC721EscrowObligation public erc721Escrow;
    ERC721PaymentObligation public erc721Payment;
    ERC1155EscrowObligation public erc1155Escrow;
    ERC1155PaymentObligation public erc1155Payment;
    TokenBundleEscrowObligation2 public bundleEscrow;
    TokenBundlePaymentObligation2 public bundlePayment;
    NativeTokenEscrowObligation public nativeEscrow;
    NativeTokenPaymentObligation public nativePayment;
    ERC20BarterUtils public barterUtils;

    MockERC20Permit public bidToken;
    MockERC721 public erc721Token;
    MockERC1155 public erc1155Token;

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

        // Deploy mock tokens
        bidToken = new MockERC20Permit("Bid Token", "BID");
        erc721Token = new MockERC721();
        erc1155Token = new MockERC1155();

        // Deploy obligations
        escrowObligation = new ERC20EscrowObligation(eas, schemaRegistry);
        paymentObligation = new ERC20PaymentObligation(eas, schemaRegistry);
        erc721Escrow = new ERC721EscrowObligation(eas, schemaRegistry);
        erc721Payment = new ERC721PaymentObligation(eas, schemaRegistry);
        erc1155Escrow = new ERC1155EscrowObligation(eas, schemaRegistry);
        erc1155Payment = new ERC1155PaymentObligation(eas, schemaRegistry);
        bundleEscrow = new TokenBundleEscrowObligation2(eas, schemaRegistry);
        bundlePayment = new TokenBundlePaymentObligation2(eas, schemaRegistry);
        nativeEscrow = new NativeTokenEscrowObligation(eas, schemaRegistry);
        nativePayment = new NativeTokenPaymentObligation(eas, schemaRegistry);

        // Deploy barter utils contract
        barterUtils = new ERC20BarterUtils(
            eas,
            escrowObligation,
            paymentObligation,
            erc721Escrow,
            erc721Payment,
            erc1155Escrow,
            erc1155Payment,
            bundleEscrow,
            bundlePayment,
            nativeEscrow,
            nativePayment
        );

        // Setup initial token balances
        bidToken.transfer(alice, 1000 * 10 ** 18);
        /* uint256 nftId = */ erc721Token.mint(bob);
        erc1155Token.mint(bob, 1, 100);
    }

    function testBuyERC721WithERC20() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 nftId = 1;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice makes bid
        vm.startPrank(alice);
        bidToken.approve(address(escrowObligation), bidAmount);
        bytes32 buyAttestation = barterUtils.buyErc721WithErc20(
            address(bidToken),
            bidAmount,
            address(erc721Token),
            nftId,
            expiration
        );
        vm.stopPrank();

        // Bob accepts by transferring NFT
        vm.startPrank(bob);
        erc721Token.approve(address(erc721Payment), nftId);
        bytes32 sellAttestation = erc721Payment.doObligation(
            ERC721PaymentObligation.ObligationData({
                token: address(erc721Token),
                tokenId: nftId,
                payee: alice
            })
        );

        // Collect payment
        bool success = escrowObligation.collectEscrow(
            buyAttestation,
            sellAttestation
        );
        vm.stopPrank();

        assertTrue(success, "Payment collection should succeed");
        assertEq(
            erc721Token.ownerOf(nftId),
            alice,
            "Alice should own the ERC721"
        );
        assertEq(
            bidToken.balanceOf(bob),
            bidAmount,
            "Bob should receive bid amount"
        );
    }

    function testBuyERC1155WithERC20() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 tokenId = 1;
        uint256 amount = 50;
        uint64 expiration = uint64(block.timestamp + 1 days);

        // Alice makes bid
        vm.startPrank(alice);
        bidToken.approve(address(escrowObligation), bidAmount);
        bytes32 buyAttestation = barterUtils.buyErc1155WithErc20(
            address(bidToken),
            bidAmount,
            address(erc1155Token),
            tokenId,
            amount,
            expiration
        );
        vm.stopPrank();

        // Bob accepts by transferring tokens
        vm.startPrank(bob);
        erc1155Token.setApprovalForAll(address(erc1155Payment), true);
        bytes32 sellAttestation = erc1155Payment.doObligation(
            ERC1155PaymentObligation.ObligationData({
                token: address(erc1155Token),
                tokenId: tokenId,
                amount: amount,
                payee: alice
            })
        );

        // Collect payment
        bool success = escrowObligation.collectEscrow(
            buyAttestation,
            sellAttestation
        );
        vm.stopPrank();

        assertTrue(success, "Payment collection should succeed");
        assertEq(
            erc1155Token.balanceOf(alice, tokenId),
            amount,
            "Alice should receive tokens"
        );
        assertEq(
            bidToken.balanceOf(bob),
            bidAmount,
            "Bob should receive bid amount"
        );
    }

    function testPermitAndBuyERC721() public {
        uint256 bidAmount = 100 * 10 ** 18;
        uint256 nftId = 1;
        uint64 expiration = uint64(block.timestamp + 1 days);
        uint256 deadline = block.timestamp + 1;

        // Get permit signature
        (uint8 v, bytes32 r, bytes32 s) = _getPermitSignature(
            bidToken,
            ALICE_PRIVATE_KEY,
            address(escrowObligation),
            bidAmount,
            deadline
        );

        // Alice makes bid with permit
        vm.prank(alice);
        bytes32 buyAttestation = barterUtils.permitAndBuyErc721WithErc20(
            address(bidToken),
            bidAmount,
            address(erc721Token),
            nftId,
            expiration,
            deadline,
            v,
            r,
            s
        );

        // Bob accepts
        vm.startPrank(bob);
        erc721Token.approve(address(erc721Payment), nftId);
        bytes32 sellAttestation = erc721Payment.doObligation(
            ERC721PaymentObligation.ObligationData({
                token: address(erc721Token),
                tokenId: nftId,
                payee: alice
            })
        );

        bool success = escrowObligation.collectEscrow(
            buyAttestation,
            sellAttestation
        );
        vm.stopPrank();

        assertTrue(success, "Payment collection should succeed");
        assertEq(
            erc721Token.ownerOf(nftId),
            alice,
            "Alice should own the ERC721"
        );
        assertEq(
            bidToken.balanceOf(bob),
            bidAmount,
            "Bob should receive bid amount"
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
