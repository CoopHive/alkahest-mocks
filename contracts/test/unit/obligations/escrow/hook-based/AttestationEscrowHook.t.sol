// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "forge-std/Vm.sol";
import {IEscrowHook} from "@src/obligations/escrow/hook-based/IEscrowHook.sol";
import {AttestationEscrowHook} from "@src/obligations/escrow/hook-based/hooks/AttestationEscrowHook.sol";
import {
    AttestationReferenceEscrowHook
} from "@src/obligations/escrow/hook-based/hooks/AttestationReferenceEscrowHook.sol";
import {IEAS, Attestation, AttestationRequest, AttestationRequestData} from "@eas/IEAS.sol";
import {ISchemaRegistry} from "@eas/ISchemaRegistry.sol";
import {ISchemaResolver} from "@eas/resolver/ISchemaResolver.sol";
import {SchemaRegistryUtils} from "@src/libraries/SchemaRegistryUtils.sol";
import {EASDeployer} from "@test/utils/EASDeployer.sol";
import {PayableResolver} from "../../fixtures/PayableResolver.sol";

contract AttestationEscrowHookTest is Test {
    IEAS public eas;
    ISchemaRegistry public schemaRegistry;
    AttestationEscrowHook public hook;
    AttestationReferenceEscrowHook public hook2;

    address internal caller = makeAddr("caller");
    address internal recipient = makeAddr("recipient");
    address internal otherRecipient = makeAddr("otherRecipient");
    bytes32 internal testSchema;
    bytes32 internal paidSchema;
    bytes32 internal existingAttestation;
    PayableResolver internal payableResolver;

    function setUp() public {
        EASDeployer easDeployer = new EASDeployer();
        (eas, schemaRegistry) = easDeployer.deployEAS();

        hook = new AttestationEscrowHook(eas);
        hook2 = new AttestationReferenceEscrowHook(eas, schemaRegistry);
        vm.startPrank(caller);
        hook.approveEscrow(caller);
        hook2.approveEscrow(caller);
        vm.stopPrank();

        testSchema = schemaRegistry.register("string testData", ISchemaResolver(address(0)), true);
        payableResolver = new PayableResolver(eas);
        paidSchema = schemaRegistry.register("string testData", payableResolver, true);
        existingAttestation = eas.attest(
            AttestationRequest({
                schema: testSchema,
                data: AttestationRequestData({
                    recipient: recipient,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: abi.encode("existing"),
                    value: 0
                })
            })
        );
    }

    function _dummyEscrow() internal view returns (Attestation memory) {
        return Attestation({
            uid: keccak256("escrow"),
            schema: bytes32(0),
            time: 0,
            expirationTime: 0,
            revocationTime: 0,
            refUID: bytes32(0),
            recipient: address(0),
            attester: caller,
            revocable: true,
            data: ""
        });
    }

    function testAttestationHookCountsIdenticalPendingLocks() public {
        bytes memory data = abi.encode(
            AttestationEscrowHook.HookData({
                attestation: AttestationRequest({
                    schema: testSchema,
                    data: AttestationRequestData({
                        recipient: recipient,
                        expirationTime: 0,
                        revocable: false,
                        refUID: bytes32(0),
                        data: abi.encode("release"),
                        value: 0
                    })
                })
            })
        );
        bytes32 dataHash = keccak256(data);

        vm.startPrank(caller);
        hook.onLock(data, caller, caller);
        hook.onLock(data, caller, caller);
        assertEq(hook.pending(caller, dataHash), 2);

        hook.onRelease(data, recipient, _dummyEscrow(), bytes32(0));
        assertEq(hook.pending(caller, dataHash), 1);

        hook.onRelease(data, recipient, _dummyEscrow(), bytes32(0));
        assertEq(hook.pending(caller, dataHash), 0);

        vm.expectRevert(abi.encodeWithSelector(AttestationEscrowHook.NoPendingAttestation.selector, caller, dataHash));
        hook.onRelease(data, recipient, _dummyEscrow(), bytes32(0));
        vm.stopPrank();
    }

    function testAttestationHookRequiresExactNativeValueOnLock() public {
        bytes memory data = abi.encode(
            AttestationEscrowHook.HookData({
                attestation: AttestationRequest({
                    schema: paidSchema,
                    data: AttestationRequestData({
                        recipient: recipient,
                        expirationTime: 0,
                        revocable: false,
                        refUID: bytes32(0),
                        data: abi.encode("release"),
                        value: 1 wei
                    })
                })
            })
        );

        vm.deal(caller, 1 ether);
        vm.prank(caller);
        vm.expectRevert(abi.encodeWithSelector(AttestationEscrowHook.IncorrectPayment.selector, 1 wei, 0));
        hook.onLock(data, caller, caller);

        assertEq(address(hook).balance, 0);
    }

    function testAttestationHookForwardsPaidAttestationValueOnRelease() public {
        bytes memory data = abi.encode(
            AttestationEscrowHook.HookData({
                attestation: AttestationRequest({
                    schema: paidSchema,
                    data: AttestationRequestData({
                        recipient: recipient,
                        expirationTime: 0,
                        revocable: false,
                        refUID: bytes32(0),
                        data: abi.encode("paid release"),
                        value: 1 wei
                    })
                })
            })
        );
        bytes32 dataHash = keccak256(data);

        vm.deal(caller, 1 ether);
        vm.startPrank(caller);
        hook.onLock{value: 1 wei}(data, caller, caller);
        assertEq(hook.pending(caller, dataHash), 1);
        assertEq(hook.pendingValue(caller, dataHash), 1 wei);
        assertEq(address(hook).balance, 1 wei);

        hook.onRelease(data, recipient, _dummyEscrow(), bytes32(0));
        assertEq(hook.pending(caller, dataHash), 0);
        assertEq(hook.pendingValue(caller, dataHash), 0);
        vm.stopPrank();

        assertEq(payableResolver.attestValue(), 1 wei);
        assertEq(address(hook).balance, 0);
    }

    function testAttestationHookRefundsPaidAttestationValueOnReturn() public {
        bytes memory data = abi.encode(
            AttestationEscrowHook.HookData({
                attestation: AttestationRequest({
                    schema: paidSchema,
                    data: AttestationRequestData({
                        recipient: recipient,
                        expirationTime: 0,
                        revocable: false,
                        refUID: bytes32(0),
                        data: abi.encode("paid return"),
                        value: 1 wei
                    })
                })
            })
        );

        vm.deal(caller, 1 ether);
        uint256 balanceBefore = caller.balance;

        vm.startPrank(caller);
        hook.onLock{value: 1 wei}(data, caller, caller);
        hook.onReturn(data, caller, _dummyEscrow());
        vm.stopPrank();

        assertEq(caller.balance, balanceBefore);
        assertEq(payableResolver.attestValue(), 0);
        assertEq(address(hook).balance, 0);
    }

    function testAttestationHookReturnDecrementsOnePendingLock() public {
        bytes memory data = abi.encode(
            AttestationEscrowHook.HookData({
                attestation: AttestationRequest({
                    schema: testSchema,
                    data: AttestationRequestData({
                        recipient: recipient,
                        expirationTime: 0,
                        revocable: false,
                        refUID: bytes32(0),
                        data: abi.encode("return"),
                        value: 0
                    })
                })
            })
        );
        bytes32 dataHash = keccak256(data);

        vm.startPrank(caller);
        hook.onLock(data, caller, caller);
        hook.onLock(data, caller, caller);
        hook.onReturn(data, caller, _dummyEscrow());
        assertEq(hook.pending(caller, dataHash), 1);
        hook.onRelease(data, recipient, _dummyEscrow(), bytes32(0));
        assertEq(hook.pending(caller, dataHash), 0);
        vm.stopPrank();
    }

    function testAttestationHook2CountsIdenticalPendingLocks() public {
        bytes memory data = abi.encode(
            AttestationReferenceEscrowHook.HookData({
                referencedAttestationUid: existingAttestation,
                recipient: recipient,
                expirationTime: 0
            })
        );
        bytes32 dataHash = keccak256(data);

        vm.startPrank(caller);
        hook2.onLock(data, caller, caller);
        hook2.onLock(data, caller, caller);
        assertEq(hook2.pending(caller, dataHash), 2);

        hook2.onRelease(data, recipient, _dummyEscrow(), bytes32(0));
        assertEq(hook2.pending(caller, dataHash), 1);

        hook2.onRelease(data, recipient, _dummyEscrow(), bytes32(0));
        assertEq(hook2.pending(caller, dataHash), 0);

        vm.expectRevert(
            abi.encodeWithSelector(AttestationReferenceEscrowHook.NoPendingReferenceAttestation.selector, caller, dataHash)
        );
        hook2.onRelease(data, recipient, _dummyEscrow(), bytes32(0));
        vm.stopPrank();
    }

    function testAttestationHook2RejectsNativeValueOnLock() public {
        bytes memory data = abi.encode(
            AttestationReferenceEscrowHook.HookData({
                referencedAttestationUid: existingAttestation,
                recipient: recipient,
                expirationTime: 0
            })
        );

        vm.deal(caller, 1 ether);
        vm.prank(caller);
        vm.expectRevert(IEscrowHook.UnexpectedNativeValue.selector);
        hook2.onLock{value: 1 wei}(data, caller, caller);

        assertEq(address(hook2).balance, 0);
    }

    function testAttestationHook2ConstructorReusesExistingReferenceAttestationSchema() public {
        address predicted = vm.computeCreateAddress(address(this), vm.getNonce(address(this)));
        bytes32 expectedSchema =
            SchemaRegistryUtils.getUID("bytes32 referencedAttestationUid", ISchemaResolver(predicted), false);

        bytes32 registeredSchema =
            schemaRegistry.register("bytes32 referencedAttestationUid", ISchemaResolver(predicted), false);
        assertEq(registeredSchema, expectedSchema);

        AttestationReferenceEscrowHook reusedSchemaHook = new AttestationReferenceEscrowHook(eas, schemaRegistry);
        assertEq(reusedSchemaHook.REFERENCE_ATTESTATION_SCHEMA(), expectedSchema);
        assertEq(schemaRegistry.getSchema(expectedSchema).uid, expectedSchema);
    }

    function testAttestationHook2ReturnDecrementsOnePendingLock() public {
        bytes memory data = abi.encode(
            AttestationReferenceEscrowHook.HookData({
                referencedAttestationUid: existingAttestation,
                recipient: recipient,
                expirationTime: 0
            })
        );
        bytes32 dataHash = keccak256(data);

        vm.startPrank(caller);
        hook2.onLock(data, caller, caller);
        hook2.onLock(data, caller, caller);
        hook2.onReturn(data, caller, _dummyEscrow());
        assertEq(hook2.pending(caller, dataHash), 1);
        hook2.onRelease(data, recipient, _dummyEscrow(), bytes32(0));
        assertEq(hook2.pending(caller, dataHash), 0);
        vm.stopPrank();
    }

    function testAttestationHook2RejectsForgedReferenceAttestation() public {
        bytes32 referenceSchema = hook2.REFERENCE_ATTESTATION_SCHEMA();

        vm.expectRevert();
        vm.prank(caller);
        eas.attest(
            AttestationRequest({
                schema: referenceSchema,
                data: AttestationRequestData({
                    recipient: recipient,
                    expirationTime: 0,
                    revocable: false,
                    refUID: existingAttestation,
                    data: abi.encode(existingAttestation),
                    value: 0
                })
            })
        );
    }

    function testAttestationHook2UsesEncodedRecipient() public {
        bytes memory data = abi.encode(
            AttestationReferenceEscrowHook.HookData({
                referencedAttestationUid: existingAttestation,
                recipient: recipient,
                expirationTime: 0
            })
        );

        vm.startPrank(caller);
        hook2.onLock(data, caller, caller);

        vm.recordLogs();
        hook2.onRelease(data, otherRecipient, _dummyEscrow(), bytes32(0));
        Vm.Log[] memory logs = vm.getRecordedLogs();
        vm.stopPrank();

        bytes32 uid = _findReferenceAttestationUid(logs);
        assertNotEq(uid, bytes32(0));

        (, address attester, bytes32 schema) = _readAttestedTopics(logs, uid);
        assertEq(attester, address(hook2));
        assertEq(schema, hook2.REFERENCE_ATTESTATION_SCHEMA());

        assertEq(eas.getAttestation(uid).recipient, recipient);
        assertEq(eas.getAttestation(uid).refUID, existingAttestation);
    }

    function testAttestationHook2UsesExpiration() public {
        uint64 expiration = uint64(block.timestamp + 30 days);
        bytes memory data = abi.encode(
            AttestationReferenceEscrowHook.HookData({
                referencedAttestationUid: existingAttestation,
                recipient: recipient,
                expirationTime: expiration
            })
        );

        vm.startPrank(caller);
        hook2.onLock(data, caller, caller);

        vm.recordLogs();
        hook2.onRelease(data, recipient, _dummyEscrow(), bytes32(0));
        Vm.Log[] memory logs = vm.getRecordedLogs();
        vm.stopPrank();

        bytes32 uid = _findReferenceAttestationUid(logs);
        assertNotEq(uid, bytes32(0));

        Attestation memory referenceAttestation = eas.getAttestation(uid);
        assertEq(referenceAttestation.expirationTime, expiration);
        assertFalse(referenceAttestation.revocable);
    }

    function testAttestationHookRejectsRevocableAttestation() public {
        bytes memory data = abi.encode(
            AttestationEscrowHook.HookData({
                attestation: AttestationRequest({
                    schema: testSchema,
                    data: AttestationRequestData({
                        recipient: recipient,
                        expirationTime: 0,
                        revocable: true,
                        refUID: bytes32(0),
                        data: abi.encode("release"),
                        value: 0
                    })
                })
            })
        );

        vm.prank(caller);
        vm.expectRevert(AttestationEscrowHook.UnsupportedRevocableAttestation.selector);
        hook.onLock(data, caller, caller);
    }

    function _findReferenceAttestationUid(Vm.Log[] memory logs) internal view returns (bytes32 uid) {
        for (uint256 i; i < logs.length; ++i) {
            if (
                logs[i].topics.length == 4
                    && logs[i].topics[0] == keccak256("Attested(address,address,bytes32,bytes32)")
                    && logs[i].topics[3] == hook2.REFERENCE_ATTESTATION_SCHEMA()
            ) {
                return abi.decode(logs[i].data, (bytes32));
            }
        }
    }

    function _readAttestedTopics(Vm.Log[] memory logs, bytes32 uid)
        internal
        pure
        returns (address recipient_, address attester, bytes32 schema)
    {
        for (uint256 i; i < logs.length; ++i) {
            if (
                logs[i].topics.length == 4
                    && logs[i].topics[0] == keccak256("Attested(address,address,bytes32,bytes32)")
                    && abi.decode(logs[i].data, (bytes32)) == uid
            ) {
                recipient_ = address(uint160(uint256(logs[i].topics[1])));
                attester = address(uint160(uint256(logs[i].topics[2])));
                schema = logs[i].topics[3];
                return (recipient_, attester, schema);
            }
        }
    }
}
