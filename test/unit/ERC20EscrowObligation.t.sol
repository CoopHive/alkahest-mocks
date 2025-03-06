// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {ERC20EscrowObligation} from "../../src/Statements/ERC20EscrowObligation.sol";
import {IArbiter} from "../../src/IArbiter.sol";
import {IEAS, Attestation, AttestationRequestData, AttestationRequest} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MCK") {
        _mint(msg.sender, 10000 * 10 ** 18);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

// Mock Arbiter for testing
contract MockArbiter is IArbiter {
    bool private shouldAccept;

    constructor(bool _shouldAccept) {
        shouldAccept = _shouldAccept;
    }

    function setShouldAccept(bool _shouldAccept) public {
        shouldAccept = _shouldAccept;
    }

    function checkStatement(
        Attestation memory,
        bytes memory,
        bytes32
    ) public view override returns (bool) {
        return shouldAccept;
    }
}

contract ERC20EscrowObligationTest is Test {
    ERC20EscrowObligation public escrowObligation;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    MockERC20 public token;
    MockArbiter public mockArbiter;
    MockArbiter public rejectingArbiter;

    address public constant EAS_ADDRESS =
        0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
    address public constant SCHEMA_REGISTRY_ADDRESS =
        0xA7b39296258348C78294F95B872b282326A97BDF;

    address internal buyer;
    address internal seller;
    uint256 constant AMOUNT = 100 * 10 ** 18;
    uint64 constant EXPIRATION_TIME = 365 days;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(vm.envString("RPC_URL_MAINNET")));

        eas = IEAS(EAS_ADDRESS);
        schemaRegistry = ISchemaRegistry(SCHEMA_REGISTRY_ADDRESS);

        escrowObligation = new ERC20EscrowObligation(eas, schemaRegistry);
        token = new MockERC20();
        mockArbiter = new MockArbiter(true);
        rejectingArbiter = new MockArbiter(false);

        buyer = makeAddr("buyer");
        seller = makeAddr("seller");

        // Fund the buyer account
        token.transfer(buyer, 1000 * 10 ** 18);
    }

    function testConstructor() public view {
        // Verify contract was initialized correctly
        bytes32 schemaId = escrowObligation.ATTESTATION_SCHEMA();
        assertNotEq(schemaId, bytes32(0), "Schema should be registered");

        // Verify schema details
        SchemaRecord memory schema = escrowObligation.getSchema();
        assertEq(schema.uid, schemaId, "Schema UID should match");
        assertEq(
            schema.schema,
            "address token, uint256 amount, address arbiter, bytes demand",
            "Schema string should match"
        );
    }

    function testMakeStatement() public {
        // Approve tokens first
        vm.startPrank(buyer);
        token.approve(address(escrowObligation), AMOUNT);

        bytes memory demand = abi.encode("test demand");
        ERC20EscrowObligation.StatementData memory data = ERC20EscrowObligation
            .StatementData({
                token: address(token),
                amount: AMOUNT,
                arbiter: address(mockArbiter),
                demand: demand
            });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 uid = escrowObligation.makeStatement(data, expiration);
        vm.stopPrank();

        // Verify attestation exists
        assertNotEq(uid, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = escrowObligation.getStatement(uid);
        assertEq(
            attestation.schema,
            escrowObligation.ATTESTATION_SCHEMA(),
            "Schema should match"
        );
        assertEq(attestation.recipient, buyer, "Recipient should be the buyer");

        // Verify token transfer to escrow
        assertEq(
            token.balanceOf(address(escrowObligation)),
            AMOUNT,
            "Escrow should hold tokens"
        );
        assertEq(
            token.balanceOf(buyer),
            900 * 10 ** 18,
            "Buyer should have sent tokens"
        );
    }

    function testMakeStatementFor() public {
        // Approve tokens first
        vm.startPrank(buyer);
        token.approve(address(escrowObligation), AMOUNT);
        vm.stopPrank();

        bytes memory demand = abi.encode("test demand");
        ERC20EscrowObligation.StatementData memory data = ERC20EscrowObligation
            .StatementData({
                token: address(token),
                amount: AMOUNT,
                arbiter: address(mockArbiter),
                demand: demand
            });

        address recipient = makeAddr("recipient");
        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);

        vm.prank(address(this));
        bytes32 uid = escrowObligation.makeStatementFor(
            data,
            expiration,
            buyer,
            recipient
        );

        // Verify attestation exists
        assertNotEq(uid, bytes32(0), "Attestation should be created");

        // Verify attestation details
        Attestation memory attestation = escrowObligation.getStatement(uid);
        assertEq(
            attestation.schema,
            escrowObligation.ATTESTATION_SCHEMA(),
            "Schema should match"
        );
        assertEq(
            attestation.recipient,
            recipient,
            "Recipient should be the specified recipient"
        );

        // Verify token transfer to escrow
        assertEq(
            token.balanceOf(address(escrowObligation)),
            AMOUNT,
            "Escrow should hold tokens"
        );
        assertEq(
            token.balanceOf(buyer),
            900 * 10 ** 18,
            "Buyer should have sent tokens"
        );
    }

    function testCollectPayment() public {
        // Setup: create an escrow
        vm.startPrank(buyer);
        token.approve(address(escrowObligation), AMOUNT);

        bytes memory demand = abi.encode("test demand");
        ERC20EscrowObligation.StatementData memory data = ERC20EscrowObligation
            .StatementData({
                token: address(token),
                amount: AMOUNT,
                arbiter: address(mockArbiter),
                demand: demand
            });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 paymentUid = escrowObligation.makeStatement(data, expiration);
        vm.stopPrank();

        // Create a fulfillment attestation from the seller
        vm.prank(seller);
        bytes32 fulfillmentUid = eas.attest({
            request: AttestationRequest({
                schema: escrowObligation.ATTESTATION_SCHEMA(),
                data: AttestationRequestData({
                    recipient: seller,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode("fulfillment data"),
                    value: 0
                })
            })
        });

        // Collect payment
        vm.prank(seller);
        bool success = escrowObligation.collectPayment(
            paymentUid,
            fulfillmentUid
        );

        assertTrue(success, "Payment collection should succeed");

        // Verify token transfer to seller
        assertEq(
            token.balanceOf(seller),
            AMOUNT,
            "Seller should have received tokens"
        );
        assertEq(
            token.balanceOf(address(escrowObligation)),
            0,
            "Escrow should have zero tokens left"
        );
    }

    function testCollectPaymentWithRejectedFulfillment() public {
        // Setup: create an escrow with rejecting arbiter
        vm.startPrank(buyer);
        token.approve(address(escrowObligation), AMOUNT);

        bytes memory demand = abi.encode("test demand");
        ERC20EscrowObligation.StatementData memory data = ERC20EscrowObligation
            .StatementData({
                token: address(token),
                amount: AMOUNT,
                arbiter: address(rejectingArbiter),
                demand: demand
            });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        bytes32 paymentUid = escrowObligation.makeStatement(data, expiration);
        vm.stopPrank();

        // Create a fulfillment attestation from the seller
        vm.prank(seller);
        bytes32 fulfillmentUid = eas.attest({
            request: AttestationRequest({
                schema: escrowObligation.ATTESTATION_SCHEMA(),
                data: AttestationRequestData({
                    recipient: seller,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode("fulfillment data"),
                    value: 0
                })
            })
        });

        // Try to collect payment, should revert with InvalidFulfillment
        vm.prank(seller);
        vm.expectRevert(ERC20EscrowObligation.InvalidFulfillment.selector);
        escrowObligation.collectPayment(paymentUid, fulfillmentUid);
    }

    function testCollectExpired() public {
        // Setup: create an escrow
        vm.startPrank(buyer);
        token.approve(address(escrowObligation), AMOUNT);

        bytes memory demand = abi.encode("test demand");
        ERC20EscrowObligation.StatementData memory data = ERC20EscrowObligation
            .StatementData({
                token: address(token),
                amount: AMOUNT,
                arbiter: address(mockArbiter),
                demand: demand
            });

        uint64 expiration = uint64(block.timestamp + 100);
        bytes32 paymentUid = escrowObligation.makeStatement(data, expiration);
        vm.stopPrank();

        // Attempt to collect before expiration (should fail)
        vm.prank(buyer);
        vm.expectRevert(ERC20EscrowObligation.UnauthorizedCall.selector);
        escrowObligation.collectExpired(paymentUid);

        // Fast forward past expiration time
        vm.warp(block.timestamp + 200);

        // Collect expired funds
        vm.prank(buyer);
        bool success = escrowObligation.collectExpired(paymentUid);

        assertTrue(success, "Expired fund collection should succeed");

        // Verify token transfer back to buyer
        assertEq(
            token.balanceOf(buyer),
            1000 * 10 ** 18,
            "Buyer should have received tokens back"
        );
        assertEq(
            token.balanceOf(address(escrowObligation)),
            0,
            "Escrow should have zero tokens left"
        );
    }

    function testCheckStatement() public {
        // Create statement data
        ERC20EscrowObligation.StatementData
            memory paymentData = ERC20EscrowObligation.StatementData({
                token: address(token),
                amount: AMOUNT,
                arbiter: address(mockArbiter),
                demand: abi.encode("specific demand")
            });

        // Create an attestation from the buyer
        vm.prank(buyer);
        bytes32 attestationId = eas.attest({
            request: AttestationRequest({
                schema: escrowObligation.ATTESTATION_SCHEMA(),
                data: AttestationRequestData({
                    recipient: buyer,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode(paymentData),
                    value: 0
                })
            })
        });

        Attestation memory attestation = eas.getAttestation(attestationId);

        // Test exact match
        ERC20EscrowObligation.StatementData
            memory exactDemand = ERC20EscrowObligation.StatementData({
                token: address(token),
                amount: AMOUNT,
                arbiter: address(mockArbiter),
                demand: abi.encode("specific demand")
            });

        bool exactMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(exactDemand),
            bytes32(0)
        );
        assertTrue(exactMatch, "Should match exact demand");

        // Test lower amount demand (should succeed)
        ERC20EscrowObligation.StatementData
            memory lowerDemand = ERC20EscrowObligation.StatementData({
                token: address(token),
                amount: AMOUNT - 50 * 10 ** 18,
                arbiter: address(mockArbiter),
                demand: abi.encode("specific demand")
            });

        bool lowerMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(lowerDemand),
            bytes32(0)
        );
        assertTrue(lowerMatch, "Should match lower amount demand");

        // Test higher amount demand (should fail)
        ERC20EscrowObligation.StatementData
            memory higherDemand = ERC20EscrowObligation.StatementData({
                token: address(token),
                amount: AMOUNT + 50 * 10 ** 18,
                arbiter: address(mockArbiter),
                demand: abi.encode("specific demand")
            });

        bool higherMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(higherDemand),
            bytes32(0)
        );
        assertFalse(higherMatch, "Should not match higher amount demand");

        // Test different token (should fail)
        MockERC20 differentToken = new MockERC20();
        ERC20EscrowObligation.StatementData
            memory differentTokenDemand = ERC20EscrowObligation.StatementData({
                token: address(differentToken),
                amount: AMOUNT,
                arbiter: address(mockArbiter),
                demand: abi.encode("specific demand")
            });

        bool differentTokenMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(differentTokenDemand),
            bytes32(0)
        );
        assertFalse(
            differentTokenMatch,
            "Should not match different token demand"
        );

        // Test different arbiter (should fail)
        ERC20EscrowObligation.StatementData
            memory differentArbiterDemand = ERC20EscrowObligation
                .StatementData({
                    token: address(token),
                    amount: AMOUNT,
                    arbiter: address(rejectingArbiter),
                    demand: abi.encode("specific demand")
                });

        bool differentArbiterMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(differentArbiterDemand),
            bytes32(0)
        );
        assertFalse(
            differentArbiterMatch,
            "Should not match different arbiter demand"
        );

        // Test different demand (should fail)
        ERC20EscrowObligation.StatementData
            memory differentDemandData = ERC20EscrowObligation.StatementData({
                token: address(token),
                amount: AMOUNT,
                arbiter: address(mockArbiter),
                demand: abi.encode("different demand")
            });

        bool differentDemandMatch = escrowObligation.checkStatement(
            attestation,
            abi.encode(differentDemandData),
            bytes32(0)
        );
        assertFalse(differentDemandMatch, "Should not match different demand");
    }

    function testInvalidEscrowReverts() public {
        uint256 largeAmount = 2000 * 10 ** 18; // More than buyer has

        // Approve tokens first
        vm.startPrank(buyer);
        token.approve(address(escrowObligation), largeAmount);

        // Try to create escrow with insufficient balance
        bytes memory demand = abi.encode("test demand");
        ERC20EscrowObligation.StatementData memory data = ERC20EscrowObligation
            .StatementData({
                token: address(token),
                amount: largeAmount,
                arbiter: address(mockArbiter),
                demand: demand
            });

        uint64 expiration = uint64(block.timestamp + EXPIRATION_TIME);
        vm.expectRevert(ERC20EscrowObligation.InvalidEscrow.selector);
        escrowObligation.makeStatement(data, expiration);
        vm.stopPrank();
    }
}
