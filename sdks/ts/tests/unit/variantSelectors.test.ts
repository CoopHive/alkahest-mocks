import { expect, test } from "bun:test";
import { makeConfirmationArbitersClient } from "../../src/clients/arbiters/confirmation";
import { makeErc20EscrowClient } from "../../src/clients/obligations/erc20/escrow";
import { makeSplittersClient } from "../../src/clients/splitters";
import type { ChainAddresses } from "../../src/types";

const addr = (suffix: string) => `0x${suffix.padStart(40, "0")}` as `0x${string}`;

const addresses: ChainAddresses = {
  eas: addr("1"),
  easSchemaRegistry: addr("2"),
  erc20EscrowObligation: addr("3"),
  erc20UnconditionalEscrowObligation: addr("4"),
  erc20PaymentObligation: addr("5"),
  erc20AtomicPaymentUtils: addr("6"),
  erc721EscrowObligation: addr("7"),
  erc721UnconditionalEscrowObligation: addr("8"),
  erc721PaymentObligation: addr("9"),
  erc721AtomicPaymentUtils: addr("a"),
  erc1155EscrowObligation: addr("b"),
  erc1155UnconditionalEscrowObligation: addr("c"),
  erc1155AtomicPaymentUtils: addr("d"),
  erc1155PaymentObligation: addr("e"),
  tokenBundleEscrowObligation: addr("f"),
  tokenBundleUnconditionalEscrowObligation: addr("10"),
  tokenBundlePaymentObligation: addr("11"),
  tokenBundleAtomicPaymentUtils: addr("12"),
  attestationEscrowObligation: addr("13"),
  attestationUnconditionalEscrowObligation: addr("14"),
  attestationReferenceEscrowObligation: addr("15"),
  attestationReferenceUnconditionalEscrowObligation: addr("16"),
  atomicAttestationUtils: addr("17"),
  hookEscrowObligation: addr("18"),
  hooksEscrowObligation: addr("19"),
  erc20EscrowHook: addr("1a"),
  erc721EscrowHook: addr("1b"),
  erc1155EscrowHook: addr("1c"),
  nativeTokenEscrowHook: addr("1d"),
  attestationEscrowHook: addr("1e"),
  attestationReferenceEscrowHook: addr("1f"),
  erc20Splitter: addr("20"),
  erc1155Splitter: addr("21"),
  nativeTokenSplitter: addr("22"),
  tokenBundleSplitter: addr("23"),
  tokenBundleSplitterUnvalidated: addr("24"),
  commitmentERC20Splitter: addr("25"),
  commitmentERC1155Splitter: addr("26"),
  commitmentNativeTokenSplitter: addr("27"),
  commitmentTokenBundleSplitter: addr("28"),
  commitmentTokenBundleSplitterUnvalidated: addr("29"),
  stringObligation: addr("2a"),
  commitRevealObligation: addr("2b"),
  trivialArbiter: addr("2c"),
  trustedOracleArbiter: addr("2d"),
  commitmentTrustedOracleArbiter: addr("2e"),
  anyArbiter: addr("2f"),
  allArbiter: addr("30"),
  intrinsicsArbiter: addr("31"),
  erc8004Arbiter: addr("32"),
  referencesEscrowArbiter: addr("33"),
  exclusiveRevocableConfirmationArbiter: addr("34"),
  exclusiveUnrevocableConfirmationArbiter: addr("35"),
  nonexclusiveRevocableConfirmationArbiter: addr("36"),
  nonexclusiveUnrevocableConfirmationArbiter: addr("37"),
  nativeTokenEscrowObligation: addr("38"),
  nativeTokenUnconditionalEscrowObligation: addr("39"),
  nativeTokenPaymentObligation: addr("3a"),
  nativeTokenAtomicPaymentUtils: addr("3b"),
  recipientArbiter: addr("3c"),
  attesterArbiter: addr("3d"),
  schemaArbiter: addr("3e"),
  uidArbiter: addr("3f"),
  refUidArbiter: addr("40"),
  revocableArbiter: addr("41"),
  timeAfterArbiter: addr("42"),
  timeBeforeArbiter: addr("43"),
  timeEqualArbiter: addr("44"),
  expirationTimeAfterArbiter: addr("45"),
  expirationTimeBeforeArbiter: addr("46"),
  expirationTimeEqualArbiter: addr("47"),
};

const viemClient = { account: { address: addr("48") } } as any;

test("escrow byChecks selects default and unconditional clients", () => {
  const escrow = makeErc20EscrowClient(viemClient, {
    eas: addresses.eas,
    atomicPaymentUtils: addresses.erc20AtomicPaymentUtils,
    escrowObligation: addresses.erc20EscrowObligation,
    escrowObligationUnconditional: addresses.erc20UnconditionalEscrowObligation,
    paymentObligation: addresses.erc20PaymentObligation,
    packagedEscrowObligations: [],
  });

  expect(escrow.byChecks("default")).toBe(escrow.default);
  expect(escrow.byChecks("unconditional")).toBe(escrow.unconditional);
});

test("confirmation byOptions selects the matching confirmation client", () => {
  const confirmation = makeConfirmationArbitersClient(viemClient, addresses);

  expect(confirmation.byOptions({ exclusive: true, revocable: true })).toBe(confirmation.exclusiveRevocable);
  expect(confirmation.byOptions({ exclusive: true, revocable: false })).toBe(confirmation.exclusiveUnrevocable);
  expect(confirmation.byOptions({ exclusive: false, revocable: true })).toBe(confirmation.nonexclusiveRevocable);
  expect(confirmation.byOptions({ exclusive: false, revocable: false })).toBe(confirmation.nonexclusiveUnrevocable);
});

test("splitter forTarget selects fulfillment and commitment clients", () => {
  const splitters = makeSplittersClient(viemClient, {
    erc20Splitter: addresses.erc20Splitter,
    erc1155Splitter: addresses.erc1155Splitter,
    nativeTokenSplitter: addresses.nativeTokenSplitter,
    tokenBundleSplitter: addresses.tokenBundleSplitter,
    tokenBundleSplitterUnvalidated: addresses.tokenBundleSplitterUnvalidated,
    commitmentERC20Splitter: addresses.commitmentERC20Splitter,
    commitmentERC1155Splitter: addresses.commitmentERC1155Splitter,
    commitmentNativeTokenSplitter: addresses.commitmentNativeTokenSplitter,
    commitmentTokenBundleSplitter: addresses.commitmentTokenBundleSplitter,
    commitmentTokenBundleSplitterUnvalidated: addresses.commitmentTokenBundleSplitterUnvalidated,
  });

  expect(splitters.erc20.forTarget("fulfillment")).toBe(splitters.erc20.fulfillment);
  expect(splitters.erc20.forTarget("commitment")).toBe(splitters.erc20.commitment);
  expect(splitters.erc20.address).toBe(addresses.erc20Splitter);
  expect(splitters.erc20.commitment.address).toBe(addresses.commitmentERC20Splitter);
});
