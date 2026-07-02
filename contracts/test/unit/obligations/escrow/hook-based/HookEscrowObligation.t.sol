// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {HookEscrowObligation} from "@src/obligations/escrow/hook-based/HookEscrowObligation.sol";
import {HooksEscrowObligation} from "@src/obligations/escrow/hook-based/HooksEscrowObligation.sol";
import {IEscrowHook} from "@src/obligations/escrow/hook-based/IEscrowHook.sol";
import {ERC20EscrowHook} from "@src/obligations/escrow/hook-based/hooks/ERC20EscrowHook.sol";
import {ApprovedEscrowHook} from "@src/obligations/escrow/hook-based/hooks/ApprovedEscrowHook.sol";
import {ERC721EscrowHook} from "@src/obligations/escrow/hook-based/hooks/ERC721EscrowHook.sol";
import {ERC1155EscrowHook} from "@src/obligations/escrow/hook-based/hooks/ERC1155EscrowHook.sol";
import {NativeTokenEscrowHook} from "@src/obligations/escrow/hook-based/hooks/NativeTokenEscrowHook.sol";
import {BaseEscrowObligation} from "@src/obligations/escrow/BaseEscrowObligation.sol";
import {StringObligation} from "@src/obligations/StringObligation.sol";
import {IArbiter} from "@src/IArbiter.sol";
import {MockArbiter} from "../../../../unit/obligations/fixtures/MockArbiter.sol";
import {IEAS, Attestation} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

import {EASDeployer} from "@test/utils/EASDeployer.sol";

// ──────────────────────────────────────────────
// Test helpers
// ──────────────────────────────────────────────

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MCK") {
        _mint(msg.sender, 10000 * 10 ** 18);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract MockERC721HookAsset is ERC721 {
    constructor() ERC721("Mock NFT", "MNFT") {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }
}

contract MockERC1155HookAsset is ERC1155 {
    constructor() ERC1155("") {}

    function mint(address to, uint256 tokenId, uint256 amount) external {
        _mint(to, tokenId, amount, "");
    }
}

contract ForwardingERC1155HookReceiver is IERC1155Receiver {
    address public immutable target;

    constructor(address _target) {
        target = _target;
    }

    function onERC1155Received(address, address, uint256 id, uint256 value, bytes calldata)
        external
        override
        returns (bytes4)
    {
        IERC1155(msg.sender).safeTransferFrom(address(this), target, id, value, "");
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] calldata ids, uint256[] calldata values, bytes calldata)
        external
        override
        returns (bytes4)
    {
        for (uint256 i; i < ids.length; ++i) {
            IERC1155(msg.sender).safeTransferFrom(address(this), target, ids[i], values[i], "");
        }
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId || interfaceId == 0x01ffc9a7;
    }
}

/// @dev A contract that tries to call hooks directly to steal funds.
contract HookThief {
    function stealViaLock(ERC20EscrowHook hook, bytes memory hookData, address victim) external {
        hook.onLock(hookData, victim, address(this));
    }

    function stealViaRelease(ERC20EscrowHook hook, address token, uint256 amount) external {
        bytes memory hookData = abi.encode(ERC20EscrowHook.HookData({token: token, amount: amount}));
        hook.onRelease(hookData, msg.sender, _dummyEscrow(), bytes32(0));
    }

    function stealViaReturn(ERC20EscrowHook hook, address token, uint256 amount) external {
        bytes memory hookData = abi.encode(ERC20EscrowHook.HookData({token: token, amount: amount}));
        hook.onReturn(hookData, msg.sender, _dummyEscrow());
    }

    function _dummyEscrow() internal view returns (Attestation memory) {
        return _dummyEscrow(address(this));
    }

    function _dummyEscrow(address attester) internal pure returns (Attestation memory) {
        return Attestation({
            uid: keccak256("escrow"),
            schema: bytes32(0),
            time: 0,
            expirationTime: 0,
            revocationTime: 0,
            refUID: bytes32(0),
            recipient: address(0),
            attester: attester,
            revocable: true,
            data: ""
        });
    }
}

/// @dev A contract that deposits then tries to withdraw more than deposited.
contract OverdrawAttacker {
    function depositAndOverdraw(
        ERC20EscrowHook hook,
        address token,
        uint256 depositAmount,
        uint256 withdrawAmount,
        address recipient
    ) external {
        // Lock some tokens
        bytes memory lockData = abi.encode(ERC20EscrowHook.HookData({token: token, amount: depositAmount}));
        hook.onLock(lockData, address(this), address(this));

        // Try to release more than deposited
        bytes memory releaseData = abi.encode(ERC20EscrowHook.HookData({token: token, amount: withdrawAmount}));
        hook.onRelease(releaseData, recipient, _dummyEscrow(), bytes32(0));
    }

    function _dummyEscrow() internal view returns (Attestation memory) {
        return _dummyEscrow(address(this));
    }

    function _dummyEscrow(address attester) internal pure returns (Attestation memory) {
        return Attestation({
            uid: keccak256("escrow"),
            schema: bytes32(0),
            time: 0,
            expirationTime: 0,
            revocationTime: 0,
            refUID: bytes32(0),
            recipient: address(0),
            attester: attester,
            revocable: true,
            data: ""
        });
    }
}

// ──────────────────────────────────────────────
// Core escrow tests
// ──────────────────────────────────────────────

contract HookEscrowObligationTest is Test {
    HookEscrowObligation public escrow;
    ERC20EscrowHook public erc20Hook;
    MockArbiter public acceptArbiter;
    MockArbiter public rejectArbiter;
    StringObligation public stringObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    MockERC20 public token;

    address internal buyer;
    address internal seller;
    uint256 constant AMOUNT = 100 * 10 ** 18;
    uint64 constant EXPIRATION = 365 days;

    function _dummyEscrow() internal view returns (Attestation memory) {
        return _dummyEscrow(address(this));
    }

    function _dummyEscrow(address attester) internal pure returns (Attestation memory) {
        return Attestation({
            uid: keccak256("escrow"),
            schema: bytes32(0),
            time: 0,
            expirationTime: 0,
            revocationTime: 0,
            refUID: bytes32(0),
            recipient: address(0),
            attester: attester,
            revocable: true,
            data: ""
        });
    }

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        escrow = new HookEscrowObligation(eas, schemaRegistry);
        erc20Hook = new ERC20EscrowHook();
        acceptArbiter = new MockArbiter(true);
        rejectArbiter = new MockArbiter(false);
        stringObligation = new StringObligation(eas, schemaRegistry);
        token = new MockERC20();

        buyer = makeAddr("buyer");
        seller = makeAddr("seller");

        token.transfer(buyer, 1000 * 10 ** 18);
    }

    // ──────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────

    function _hookData(uint256 amount) internal view returns (bytes memory) {
        return abi.encode(ERC20EscrowHook.HookData({token: address(token), amount: amount}));
    }

    function _obligationData(uint256 amount, address arbiter)
        internal
        view
        returns (HookEscrowObligation.ObligationData memory)
    {
        return HookEscrowObligation.ObligationData({
            arbiter: arbiter, demand: abi.encode("test"), hook: address(erc20Hook), hookData: _hookData(amount)
        });
    }

    function _createEscrow(uint256 amount, address arbiter, uint64 expiration) internal returns (bytes32) {
        vm.startPrank(buyer);
        token.approve(address(erc20Hook), amount);
        erc20Hook.approveEscrow(address(escrow));
        bytes32 uid = escrow.doObligation(_obligationData(amount, arbiter), uint64(block.timestamp + expiration));
        vm.stopPrank();
        return uid;
    }

    function _createFulfillment(bytes32 escrowUid) internal returns (bytes32) {
        vm.prank(seller);
        return stringObligation.doObligation(
            StringObligation.ObligationData({item: "fulfilled", schema: bytes32(0)}), escrowUid
        );
    }

    // ──────────────────────────────────────────────
    // Basic lifecycle
    // ──────────────────────────────────────────────

    function testConstructor() public view {
        bytes32 schemaId = escrow.ATTESTATION_SCHEMA();
        assertNotEq(schemaId, bytes32(0));

        SchemaRecord memory schema = escrow.getSchema();
        assertEq(schema.uid, schemaId);
        assertEq(schema.schema, "address arbiter, bytes demand, address hook, bytes hookData");
    }

    function testDoObligation() public {
        bytes32 uid = _createEscrow(AMOUNT, address(acceptArbiter), EXPIRATION);

        assertNotEq(uid, bytes32(0));

        // Tokens held by the hook, not the obligation
        assertEq(token.balanceOf(address(erc20Hook)), AMOUNT);
        assertEq(token.balanceOf(address(escrow)), 0);
        assertEq(token.balanceOf(buyer), 900 * 10 ** 18);

        // Hook tracks deposits keyed by the obligation contract
        assertEq(erc20Hook.deposits(address(escrow), address(token)), AMOUNT);

        // Attestation recipient is the buyer
        Attestation memory att = eas.getAttestation(uid);
        assertEq(att.recipient, buyer);
    }

    function testDirectNativeTransferToEscrowReverts() public {
        vm.deal(buyer, 1 ether);

        vm.prank(buyer);
        (bool success,) = address(escrow).call{value: 1 ether}("");

        assertFalse(success);
        assertEq(address(escrow).balance, 0);
    }

    function testDirectNativeTransferToNativeHookReverts() public {
        NativeTokenEscrowHook nativeHook = new NativeTokenEscrowHook();
        vm.deal(buyer, 1 ether);

        vm.prank(buyer);
        (bool success,) = address(nativeHook).call{value: 1 ether}("");

        assertFalse(success);
        assertEq(address(nativeHook).balance, 0);
    }

    function testNativeHookLockStillAcceptsValueThroughEscrow() public {
        NativeTokenEscrowHook nativeHook = new NativeTokenEscrowHook();
        bytes memory hookData = abi.encode(NativeTokenEscrowHook.HookData({amount: 1 ether}));
        HookEscrowObligation.ObligationData memory data = HookEscrowObligation.ObligationData({
            arbiter: address(acceptArbiter), demand: abi.encode("test"), hook: address(nativeHook), hookData: hookData
        });
        vm.deal(buyer, 1 ether);

        vm.startPrank(buyer);
        nativeHook.approveEscrow(address(escrow));
        bytes32 uid = escrow.doObligation{value: 1 ether}(data, uint64(block.timestamp + EXPIRATION));
        vm.stopPrank();

        assertNotEq(uid, bytes32(0));
        assertEq(nativeHook.deposits(address(escrow)), 1 ether);
        assertEq(address(nativeHook).balance, 1 ether);
    }

    function testDoObligationFor() public {
        address recipient = makeAddr("recipient");

        vm.startPrank(buyer);
        token.approve(address(erc20Hook), AMOUNT);
        erc20Hook.approveEscrow(address(escrow));
        bytes32 uid = escrow.doObligationFor(
            _obligationData(AMOUNT, address(acceptArbiter)), uint64(block.timestamp + EXPIRATION), recipient
        );
        vm.stopPrank();

        Attestation memory att = eas.getAttestation(uid);
        assertEq(att.recipient, recipient);
        assertEq(token.balanceOf(address(erc20Hook)), AMOUNT);
    }

    function testNonNativeHooksRejectNativeValueOnLock() public {
        ERC721EscrowHook erc721Hook = new ERC721EscrowHook();
        ERC1155EscrowHook erc1155Hook = new ERC1155EscrowHook();
        MockERC721HookAsset erc721 = new MockERC721HookAsset();
        MockERC1155HookAsset erc1155 = new MockERC1155HookAsset();

        erc721.mint(buyer, 1);
        erc1155.mint(buyer, 1, 10);

        vm.deal(address(escrow), 1 ether);
        vm.startPrank(buyer);
        erc20Hook.approveEscrow(address(escrow));
        erc721Hook.approveEscrow(address(escrow));
        erc1155Hook.approveEscrow(address(escrow));
        vm.stopPrank();

        vm.expectRevert(IEscrowHook.UnexpectedNativeValue.selector);
        vm.prank(address(escrow));
        erc20Hook.onLock{value: 1 wei}(_hookData(AMOUNT), buyer, address(escrow));

        vm.expectRevert(IEscrowHook.UnexpectedNativeValue.selector);
        vm.prank(address(escrow));
        erc721Hook.onLock{value: 1 wei}(
            abi.encode(ERC721EscrowHook.HookData({token: address(erc721), tokenId: 1})), buyer, address(escrow)
        );

        vm.expectRevert(IEscrowHook.UnexpectedNativeValue.selector);
        vm.prank(address(escrow));
        erc1155Hook.onLock{value: 1 wei}(
            abi.encode(ERC1155EscrowHook.HookData({token: address(erc1155), tokenId: 1, amount: 10})),
            buyer,
            address(escrow)
        );

        assertEq(address(erc20Hook).balance, 0);
        assertEq(address(erc721Hook).balance, 0);
        assertEq(address(erc1155Hook).balance, 0);
    }

    function testERC1155HookReleaseAllowsReceiverToForwardInCallback() public {
        ERC1155EscrowHook hook = new ERC1155EscrowHook();
        MockERC1155HookAsset erc1155 = new MockERC1155HookAsset();
        address target = makeAddr("forwardTarget");
        ForwardingERC1155HookReceiver receiver = new ForwardingERC1155HookReceiver(target);

        erc1155.mint(buyer, 1, 10);
        bytes memory data = abi.encode(ERC1155EscrowHook.HookData({token: address(erc1155), tokenId: 1, amount: 10}));

        vm.prank(buyer);
        erc1155.setApprovalForAll(address(hook), true);
        vm.prank(buyer);
        hook.approveEscrow(address(escrow));

        vm.prank(address(escrow));
        hook.onLock(data, buyer, address(escrow));

        vm.prank(address(escrow));
        hook.onRelease(data, address(receiver), _dummyEscrow(address(escrow)), bytes32(0));

        assertEq(erc1155.balanceOf(target, 1), 10);
        assertEq(erc1155.balanceOf(address(receiver), 1), 0);
        assertEq(hook.deposits(address(escrow), address(erc1155), 1), 0);
    }

    function testHookEscrowDoesNotStrandNativeValueInERC20Hook() public {
        vm.deal(buyer, 1 ether);

        vm.startPrank(buyer);
        token.approve(address(erc20Hook), AMOUNT);
        erc20Hook.approveEscrow(address(escrow));
        vm.expectRevert(IEscrowHook.UnexpectedNativeValue.selector);
        escrow.doObligation{value: 1 wei}(
            _obligationData(AMOUNT, address(acceptArbiter)), uint64(block.timestamp + EXPIRATION)
        );
        vm.stopPrank();

        assertEq(address(erc20Hook).balance, 0);
        assertEq(erc20Hook.deposits(address(escrow), address(token)), 0);
        assertEq(token.balanceOf(address(erc20Hook)), 0);
    }

    function testCollectEscrow() public {
        bytes32 escrowUid = _createEscrow(AMOUNT, address(acceptArbiter), EXPIRATION);
        bytes32 fulfillmentUid = _createFulfillment(escrowUid);

        vm.prank(seller);
        escrow.collect(escrowUid, fulfillmentUid);

        // Tokens released to seller
        assertEq(token.balanceOf(seller), AMOUNT);
        assertEq(token.balanceOf(address(erc20Hook)), 0);
        assertEq(erc20Hook.deposits(address(escrow), address(token)), 0);
    }

    function testCollectEscrowRejected() public {
        bytes32 escrowUid = _createEscrow(AMOUNT, address(rejectArbiter), EXPIRATION);
        bytes32 fulfillmentUid = _createFulfillment(escrowUid);

        vm.prank(seller);
        vm.expectRevert(BaseEscrowObligation.InvalidFulfillment.selector);
        escrow.collect(escrowUid, fulfillmentUid);

        // Tokens still in hook
        assertEq(token.balanceOf(address(erc20Hook)), AMOUNT);
    }

    function testReclaimExpired() public {
        uint64 shortExpiry = 100;
        bytes32 escrowUid = _createEscrow(AMOUNT, address(acceptArbiter), shortExpiry);

        // Can't reclaim before expiry
        vm.expectRevert(BaseEscrowObligation.UnauthorizedCall.selector);
        escrow.reclaim(escrowUid);

        // Warp past expiry
        vm.warp(block.timestamp + shortExpiry + 1);

        bool ok = escrow.reclaim(escrowUid);
        assertTrue(ok);

        // Tokens returned to buyer (the attestation recipient)
        assertEq(token.balanceOf(buyer), 1000 * 10 ** 18);
        assertEq(token.balanceOf(address(erc20Hook)), 0);
    }

    function testMultipleEscrowsIndependent() public {
        // Two independent escrows from the same buyer
        bytes32 uid1 = _createEscrow(AMOUNT, address(acceptArbiter), EXPIRATION);
        bytes32 uid2 = _createEscrow(AMOUNT, address(acceptArbiter), EXPIRATION);

        assertEq(token.balanceOf(address(erc20Hook)), 2 * AMOUNT);
        assertEq(erc20Hook.deposits(address(escrow), address(token)), 2 * AMOUNT);

        // Collect only the first
        bytes32 ful1 = _createFulfillment(uid1);
        vm.prank(seller);
        escrow.collect(uid1, ful1);

        assertEq(token.balanceOf(seller), AMOUNT);
        assertEq(token.balanceOf(address(erc20Hook)), AMOUNT);
        assertEq(erc20Hook.deposits(address(escrow), address(token)), AMOUNT);

        // Collect the second
        bytes32 ful2 = _createFulfillment(uid2);
        vm.prank(seller);
        escrow.collect(uid2, ful2);

        assertEq(token.balanceOf(seller), 2 * AMOUNT);
        assertEq(token.balanceOf(address(erc20Hook)), 0);
    }

    // ──────────────────────────────────────────────
    // IArbiter (check)
    // ──────────────────────────────────────────────

    function testCheckObligationExactMatch() public {
        bytes32 uid = _createEscrow(AMOUNT, address(acceptArbiter), EXPIRATION);
        Attestation memory att = eas.getAttestation(uid);

        bool ok = escrow.check(att, abi.encode(_obligationData(AMOUNT, address(acceptArbiter))), bytes32(0));
        assertTrue(ok);
    }

    function testCheckObligationDifferentHookData() public {
        bytes32 uid = _createEscrow(AMOUNT, address(acceptArbiter), EXPIRATION);
        Attestation memory att = eas.getAttestation(uid);

        // Different amount in hookData → should fail
        HookEscrowObligation.ObligationData memory demand = HookEscrowObligation.ObligationData({
            arbiter: address(acceptArbiter),
            demand: abi.encode("test"),
            hook: address(erc20Hook),
            hookData: _hookData(AMOUNT + 1)
        });

        bool ok = escrow.check(att, abi.encode(demand), bytes32(0));
        assertFalse(ok);
    }

    function testCheckObligationDifferentHook() public {
        bytes32 uid = _createEscrow(AMOUNT, address(acceptArbiter), EXPIRATION);
        Attestation memory att = eas.getAttestation(uid);

        ERC20EscrowHook otherHook = new ERC20EscrowHook();
        HookEscrowObligation.ObligationData memory demand = HookEscrowObligation.ObligationData({
            arbiter: address(acceptArbiter),
            demand: abi.encode("test"),
            hook: address(otherHook),
            hookData: _hookData(AMOUNT)
        });

        bool ok = escrow.check(att, abi.encode(demand), bytes32(0));
        assertFalse(ok);
    }

    // ──────────────────────────────────────────────
    // Insufficient balance / approval
    // ──────────────────────────────────────────────

    function testLockFailsWithoutApproval() public {
        vm.prank(buyer);
        // No approval given to the hook
        vm.expectRevert();
        escrow.doObligation(_obligationData(AMOUNT, address(acceptArbiter)), uint64(block.timestamp + EXPIRATION));
    }

    function testLockFailsInsufficientBalance() public {
        address poorUser = makeAddr("poor");
        token.mint(poorUser, 10 * 10 ** 18);

        vm.startPrank(poorUser);
        token.approve(address(erc20Hook), AMOUNT);
        erc20Hook.approveEscrow(address(escrow));
        vm.expectRevert();
        escrow.doObligation(_obligationData(AMOUNT, address(acceptArbiter)), uint64(block.timestamp + EXPIRATION));
        vm.stopPrank();
    }
}

// ──────────────────────────────────────────────
// HooksEscrowObligation composition tests
// ──────────────────────────────────────────────

contract HooksEscrowObligationTest is Test {
    HooksEscrowObligation public escrow;
    ERC20EscrowHook public erc20Hook;
    MockArbiter public acceptArbiter;
    StringObligation public stringObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    MockERC20 public tokenA;
    MockERC20 public tokenB;

    address internal buyer;
    address internal seller;
    uint256 constant AMOUNT_A = 100 * 10 ** 18;
    uint256 constant AMOUNT_B = 50 * 10 ** 18;
    uint64 constant EXPIRATION = 365 days;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        escrow = new HooksEscrowObligation(eas, schemaRegistry);
        erc20Hook = new ERC20EscrowHook();
        acceptArbiter = new MockArbiter(true);
        stringObligation = new StringObligation(eas, schemaRegistry);
        tokenA = new MockERC20();
        tokenB = new MockERC20();

        buyer = makeAddr("buyer");
        seller = makeAddr("seller");

        tokenA.transfer(buyer, 1000 * 10 ** 18);
        tokenB.transfer(buyer, 1000 * 10 ** 18);
    }

    function _bundleData() internal view returns (HooksEscrowObligation.ObligationData memory) {
        address[] memory hooks = new address[](2);
        hooks[0] = address(erc20Hook);
        hooks[1] = address(erc20Hook);

        bytes[] memory hookDatas = new bytes[](2);
        hookDatas[0] = abi.encode(ERC20EscrowHook.HookData({token: address(tokenA), amount: AMOUNT_A}));
        hookDatas[1] = abi.encode(ERC20EscrowHook.HookData({token: address(tokenB), amount: AMOUNT_B}));

        uint256[] memory values = new uint256[](2);
        values[0] = 0;
        values[1] = 0;

        return HooksEscrowObligation.ObligationData({
            arbiter: address(acceptArbiter),
            demand: abi.encode("bundle test"),
            hooks: hooks,
            hookDatas: hookDatas,
            values: values
        });
    }

    function testBundleLockAndCollect() public {
        HooksEscrowObligation.ObligationData memory data = _bundleData();

        vm.startPrank(buyer);
        tokenA.approve(address(erc20Hook), AMOUNT_A);
        tokenB.approve(address(erc20Hook), AMOUNT_B);
        erc20Hook.approveEscrow(address(escrow));
        bytes32 escrowUid = escrow.doObligation(data, uint64(block.timestamp + EXPIRATION));
        vm.stopPrank();

        // Both tokens held by the leaf hook
        assertEq(tokenA.balanceOf(address(erc20Hook)), AMOUNT_A);
        assertEq(tokenB.balanceOf(address(erc20Hook)), AMOUNT_B);

        // Deposits are keyed by the escrow obligation, not a public intermediary.
        assertEq(erc20Hook.deposits(address(escrow), address(tokenA)), AMOUNT_A);
        assertEq(erc20Hook.deposits(address(escrow), address(tokenB)), AMOUNT_B);

        // Collect
        vm.prank(seller);
        bytes32 fulUid = stringObligation.doObligation(
            StringObligation.ObligationData({item: "done", schema: bytes32(0)}), escrowUid
        );

        vm.prank(seller);
        escrow.collect(escrowUid, fulUid);

        assertEq(tokenA.balanceOf(seller), AMOUNT_A);
        assertEq(tokenB.balanceOf(seller), AMOUNT_B);
        assertEq(tokenA.balanceOf(address(erc20Hook)), 0);
        assertEq(tokenB.balanceOf(address(erc20Hook)), 0);
    }

    function testDirectNativeTransferToMultiHookEscrowReverts() public {
        vm.deal(buyer, 1 ether);

        vm.prank(buyer);
        (bool success,) = address(escrow).call{value: 1 ether}("");

        assertFalse(success);
        assertEq(address(escrow).balance, 0);
    }

    function testNativeHookBundleLockStillAcceptsValueThroughEscrow() public {
        NativeTokenEscrowHook nativeHook = new NativeTokenEscrowHook();

        address[] memory hooks = new address[](1);
        hooks[0] = address(nativeHook);

        bytes[] memory hookDatas = new bytes[](1);
        hookDatas[0] = abi.encode(NativeTokenEscrowHook.HookData({amount: 1 ether}));

        uint256[] memory values = new uint256[](1);
        values[0] = 1 ether;

        HooksEscrowObligation.ObligationData memory data = HooksEscrowObligation.ObligationData({
            arbiter: address(acceptArbiter),
            demand: abi.encode("native bundle"),
            hooks: hooks,
            hookDatas: hookDatas,
            values: values
        });
        vm.deal(buyer, 1 ether);

        vm.startPrank(buyer);
        nativeHook.approveEscrow(address(escrow));
        bytes32 uid = escrow.doObligation{value: 1 ether}(data, uint64(block.timestamp + EXPIRATION));
        vm.stopPrank();

        assertNotEq(uid, bytes32(0));
        assertEq(nativeHook.deposits(address(escrow)), 1 ether);
        assertEq(address(nativeHook).balance, 1 ether);
    }

    function testBundleReclaimExpired() public {
        HooksEscrowObligation.ObligationData memory data = _bundleData();

        vm.startPrank(buyer);
        tokenA.approve(address(erc20Hook), AMOUNT_A);
        tokenB.approve(address(erc20Hook), AMOUNT_B);
        erc20Hook.approveEscrow(address(escrow));
        bytes32 escrowUid = escrow.doObligation(data, uint64(block.timestamp + 100));
        vm.stopPrank();

        vm.warp(block.timestamp + 101);
        escrow.reclaim(escrowUid);

        assertEq(tokenA.balanceOf(buyer), 1000 * 10 ** 18);
        assertEq(tokenB.balanceOf(buyer), 1000 * 10 ** 18);
    }

    function testBundleMismatchedArraysRevert() public {
        address[] memory hooks = new address[](2);
        hooks[0] = address(erc20Hook);
        hooks[1] = address(erc20Hook);

        bytes[] memory hookDatas = new bytes[](1); // mismatched!
        hookDatas[0] = abi.encode(ERC20EscrowHook.HookData({token: address(tokenA), amount: AMOUNT_A}));

        uint256[] memory values = new uint256[](2);
        values[0] = 0;
        values[1] = 0;

        HooksEscrowObligation.ObligationData memory data = HooksEscrowObligation.ObligationData({
            arbiter: address(acceptArbiter),
            demand: abi.encode("test"),
            hooks: hooks,
            hookDatas: hookDatas,
            values: values
        });

        vm.startPrank(buyer);
        tokenA.approve(address(erc20Hook), AMOUNT_A);
        vm.expectRevert(HooksEscrowObligation.ArrayLengthMismatch.selector);
        escrow.doObligation(data, uint64(block.timestamp + EXPIRATION));
        vm.stopPrank();
    }

    function testBundleTooManyHooksReverts() public {
        uint256 provided = escrow.MAX_HOOKS() + 1;
        address[] memory hooks = new address[](provided);
        bytes[] memory hookDatas = new bytes[](provided);
        uint256[] memory values = new uint256[](provided);
        for (uint256 i; i < provided; ++i) {
            hooks[i] = address(erc20Hook);
            hookDatas[i] = abi.encode(ERC20EscrowHook.HookData({token: address(tokenA), amount: 0}));
        }

        HooksEscrowObligation.ObligationData memory data = HooksEscrowObligation.ObligationData({
            arbiter: address(acceptArbiter),
            demand: abi.encode("test"),
            hooks: hooks,
            hookDatas: hookDatas,
            values: values
        });

        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(HooksEscrowObligation.TooManyHooks.selector, provided, escrow.MAX_HOOKS())
        );
        escrow.doObligation(data, uint64(block.timestamp + EXPIRATION));
    }
}

// ──────────────────────────────────────────────
// Attack POCs
// ──────────────────────────────────────────────

contract HookEscrowAttackTest is Test {
    HookEscrowObligation public escrow;
    ERC20EscrowHook public erc20Hook;
    MockArbiter public acceptArbiter;
    StringObligation public stringObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    MockERC20 public token;

    address internal buyer;
    address internal attacker;
    uint256 constant AMOUNT = 100 * 10 ** 18;
    uint64 constant EXPIRATION = 365 days;

    function _dummyEscrow() internal view returns (Attestation memory) {
        return _dummyEscrow(address(this));
    }

    function _dummyEscrow(address attester) internal pure returns (Attestation memory) {
        return Attestation({
            uid: keccak256("escrow"),
            schema: bytes32(0),
            time: 0,
            expirationTime: 0,
            revocationTime: 0,
            refUID: bytes32(0),
            recipient: address(0),
            attester: attester,
            revocable: true,
            data: ""
        });
    }

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        escrow = new HookEscrowObligation(eas, schemaRegistry);
        erc20Hook = new ERC20EscrowHook();
        acceptArbiter = new MockArbiter(true);
        stringObligation = new StringObligation(eas, schemaRegistry);
        token = new MockERC20();

        buyer = makeAddr("buyer");
        attacker = makeAddr("attacker");

        token.transfer(buyer, 1000 * 10 ** 18);
    }

    function _createLegitEscrow() internal returns (bytes32) {
        bytes memory hookData = abi.encode(ERC20EscrowHook.HookData({token: address(token), amount: AMOUNT}));
        HookEscrowObligation.ObligationData memory data = HookEscrowObligation.ObligationData({
            arbiter: address(acceptArbiter), demand: abi.encode("test"), hook: address(erc20Hook), hookData: hookData
        });

        vm.startPrank(buyer);
        token.approve(address(erc20Hook), AMOUNT);
        erc20Hook.approveEscrow(address(escrow));
        bytes32 uid = escrow.doObligation(data, uint64(block.timestamp + EXPIRATION));
        vm.stopPrank();
        return uid;
    }

    function testAttackCannotDrainVictimAllowanceViaDirectLock() public {
        bytes memory hookData = abi.encode(ERC20EscrowHook.HookData({token: address(token), amount: AMOUNT}));
        HookThief thief = new HookThief();

        vm.prank(buyer);
        token.approve(address(erc20Hook), AMOUNT);

        vm.expectRevert(
            abi.encodeWithSelector(ApprovedEscrowHook.UnauthorizedEscrowCaller.selector, buyer, address(thief))
        );
        thief.stealViaLock(erc20Hook, hookData, buyer);

        assertEq(token.balanceOf(buyer), 1000 * 10 ** 18);
        assertEq(token.balanceOf(address(erc20Hook)), 0);
        assertEq(erc20Hook.deposits(address(thief), address(token)), 0);
    }

    /// @notice POC: Direct call to hook.onRelease by attacker with no deposit.
    ///         Should revert with NoDeposit.
    function testAttackDirectReleaseNoDeposit() public {
        // Legitimate escrow deposits tokens into hook
        _createLegitEscrow();
        assertEq(token.balanceOf(address(erc20Hook)), AMOUNT);

        // Attacker tries to call onRelease directly
        HookThief thief = new HookThief();

        vm.expectRevert(abi.encodeWithSelector(ERC20EscrowHook.NoDeposit.selector, address(thief), address(token)));
        thief.stealViaRelease(erc20Hook, address(token), AMOUNT);

        // Tokens still safe
        assertEq(token.balanceOf(address(erc20Hook)), AMOUNT);
        assertEq(token.balanceOf(attacker), 0);
    }

    /// @notice POC: Direct call to hook.onReturn by attacker with no deposit.
    ///         Should revert with NoDeposit.
    function testAttackDirectReturnNoDeposit() public {
        _createLegitEscrow();

        HookThief thief = new HookThief();

        vm.expectRevert(abi.encodeWithSelector(ERC20EscrowHook.NoDeposit.selector, address(thief), address(token)));
        thief.stealViaReturn(erc20Hook, address(token), AMOUNT);

        assertEq(token.balanceOf(address(erc20Hook)), AMOUNT);
    }

    /// @notice POC: Attacker deposits a small amount, then tries to release more.
    ///         Should revert with InsufficientDeposit.
    function testAttackOverdraw() public {
        // Legitimate escrow
        _createLegitEscrow();

        uint256 smallAmount = 1 * 10 ** 18;
        token.mint(address(0xBEEF), smallAmount);

        OverdrawAttacker overdrawer = new OverdrawAttacker();

        // Give the attacker contract some tokens and approve the hook
        vm.prank(address(0xBEEF));
        token.transfer(address(overdrawer), smallAmount);
        vm.prank(address(overdrawer));
        token.approve(address(erc20Hook), smallAmount);
        vm.prank(address(overdrawer));
        erc20Hook.approveEscrow(address(overdrawer));

        // Attacker deposits 1 token, tries to withdraw 100
        vm.expectRevert(
            abi.encodeWithSelector(
                ERC20EscrowHook.InsufficientDeposit.selector, address(overdrawer), address(token), AMOUNT, smallAmount
            )
        );
        overdrawer.depositAndOverdraw(erc20Hook, address(token), smallAmount, AMOUNT, attacker);
    }

    /// @notice POC: Multi-hook deposits are keyed to HooksEscrowObligation,
    ///         so direct external hook calls cannot release them.
    function testAttackCannotDirectlyReleaseMultiHookDeposit() public {
        HooksEscrowObligation hooksEscrow = new HooksEscrowObligation(eas, schemaRegistry);

        address[] memory hooks = new address[](1);
        hooks[0] = address(erc20Hook);
        bytes[] memory hookDatas = new bytes[](1);
        hookDatas[0] = abi.encode(ERC20EscrowHook.HookData({token: address(token), amount: AMOUNT}));
        uint256[] memory values = new uint256[](1);
        values[0] = 0;

        HooksEscrowObligation.ObligationData memory data = HooksEscrowObligation.ObligationData({
            arbiter: address(acceptArbiter),
            demand: abi.encode("test"),
            hooks: hooks,
            hookDatas: hookDatas,
            values: values
        });

        vm.startPrank(buyer);
        token.approve(address(erc20Hook), AMOUNT);
        erc20Hook.approveEscrow(address(hooksEscrow));
        hooksEscrow.doObligation(data, uint64(block.timestamp + EXPIRATION));
        vm.stopPrank();

        assertEq(erc20Hook.deposits(address(hooksEscrow), address(token)), AMOUNT);

        vm.prank(attacker);
        vm.expectRevert(
            abi.encodeWithSelector(ApprovedEscrowHook.EscrowCallerMismatch.selector, attacker, address(this))
        );
        erc20Hook.onRelease(hookDatas[0], attacker, _dummyEscrow(), bytes32(0));

        assertEq(token.balanceOf(address(erc20Hook)), AMOUNT);
    }

    /// @notice POC: EOA attacker calls onRelease directly on the hook.
    ///         Fails because the EOA has no deposits.
    function testAttackEOADirectCall() public {
        _createLegitEscrow();

        bytes memory hookData = abi.encode(ERC20EscrowHook.HookData({token: address(token), amount: AMOUNT}));

        vm.prank(attacker);
        vm.expectRevert(
            abi.encodeWithSelector(ApprovedEscrowHook.EscrowCallerMismatch.selector, attacker, address(this))
        );
        erc20Hook.onRelease(hookData, attacker, _dummyEscrow(), bytes32(0));
    }

    /// @notice POC: Attacker creates a second HookEscrowObligation instance
    ///         and tries to release deposits belonging to the first.
    ///         Fails because deposits are keyed per-caller.
    function testAttackFromDifferentObligation() public {
        _createLegitEscrow();

        // Deploy a second obligation contract
        HookEscrowObligation escrow2 = new HookEscrowObligation(eas, schemaRegistry);

        // escrow2 has zero deposits in erc20Hook
        assertEq(erc20Hook.deposits(address(escrow2), address(token)), 0);

        // Even if attacker could somehow get escrow2 to call onRelease,
        // the deposit check would fail. Simulate the internal call:
        vm.prank(address(escrow2));
        vm.expectRevert(abi.encodeWithSelector(ERC20EscrowHook.NoDeposit.selector, address(escrow2), address(token)));
        erc20Hook.onRelease(
            abi.encode(ERC20EscrowHook.HookData({token: address(token), amount: AMOUNT})),
            attacker,
            _dummyEscrow(address(escrow2)),
            bytes32(0)
        );

        // Original deposits untouched
        assertEq(token.balanceOf(address(erc20Hook)), AMOUNT);
    }

    /// @notice Verify that a legitimate collect after attack attempts still works.
    function testLegitCollectAfterFailedAttacks() public {
        bytes32 escrowUid = _createLegitEscrow();

        // Run some failed attacks
        HookThief thief = new HookThief();
        vm.expectRevert();
        thief.stealViaRelease(erc20Hook, address(token), AMOUNT);

        vm.prank(attacker);
        vm.expectRevert();
        erc20Hook.onRelease(
            abi.encode(ERC20EscrowHook.HookData({token: address(token), amount: AMOUNT})),
            attacker,
            _dummyEscrow(),
            bytes32(0)
        );

        // Legitimate collection still works
        address seller_ = makeAddr("seller");
        vm.prank(seller_);
        bytes32 fulUid = stringObligation.doObligation(
            StringObligation.ObligationData({item: "done", schema: bytes32(0)}), escrowUid
        );

        vm.prank(seller_);
        escrow.collect(escrowUid, fulUid);

        assertEq(token.balanceOf(seller_), AMOUNT);
        assertEq(token.balanceOf(address(erc20Hook)), 0);
    }
}
