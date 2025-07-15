// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import {AttestationBarterUtils} from "@src/utils/AttestationBarterUtils.sol";
import {AttestationEscrowObligation2} from "@src/obligations/AttestationEscrowObligation2.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry, SchemaRecord} from "@eas/ISchemaRegistry.sol";
import {SchemaResolver} from "@eas/resolver/SchemaResolver.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";

contract AttestationBarterUtilsIntegrationTest is Test {
    AttestationBarterUtils public barterUtils;
    AttestationEscrowObligation2 public escrowContract;
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;

    uint256 internal constant ALICE_PRIVATE_KEY = 0xa11ce;
    uint256 internal constant BOB_PRIVATE_KEY = 0xb0b;

    address public alice;
    address public bob;

    bytes32 public testSchema;
    string constant TEST_SCHEMA = "bool value";

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        alice = vm.addr(ALICE_PRIVATE_KEY);
        bob = vm.addr(BOB_PRIVATE_KEY);

        // Deploy contracts
        escrowContract = new AttestationEscrowObligation2(eas, schemaRegistry);
        barterUtils = new AttestationBarterUtils(
            eas,
            schemaRegistry,
            escrowContract
        );

        // Register test schema
        testSchema = barterUtils.registerSchema(TEST_SCHEMA, barterUtils, true);
    }

    function testAttestAndCreateEscrow() public {
        bytes memory attestationData = abi.encode(true);
        bytes memory demandData = abi.encode(false);

        vm.prank(alice);
        (bytes32 attestationUid, bytes32 escrowUid) = barterUtils
            .attestAndCreateEscrow(
                AttestationRequest({
                    schema: testSchema,
                    data: AttestationRequestData({
                        recipient: bob,
                        expirationTime: uint64(block.timestamp + 1 days),
                        revocable: false,
                        refUID: 0,
                        data: attestationData,
                        value: 0
                    })
                }),
                address(this), // arbiter
                demandData,
                uint64(block.timestamp + 2 days) // escrow expiration
            );

        // Verify both UIDs are valid
        assertNotEq(
            attestationUid,
            bytes32(0),
            "Attestation should be created"
        );
        assertNotEq(escrowUid, bytes32(0), "Escrow should be created");

        // Verify attestation details
        AttestationEscrowObligation2.ObligationData memory escrowData = abi
            .decode(
                eas.getAttestation(escrowUid).data,
                (AttestationEscrowObligation2.ObligationData)
            );

        assertEq(
            escrowData.attestationUid,
            attestationUid,
            "Attestation UID should match"
        );
        assertEq(escrowData.arbiter, address(this), "Arbiter should match");
        assertEq(
            keccak256(escrowData.demand),
            keccak256(demandData),
            "Demand data should match"
        );
    }
}
