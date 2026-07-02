import type { ChainAddresses } from "./types";

const zeroAddress = "0x0000000000000000000000000000000000000000" as const;

const unreleasedAddresses = {
  erc20EscrowObligation: zeroAddress,
  erc20UnconditionalEscrowObligation: zeroAddress,
  erc20PaymentObligation: zeroAddress,
  erc20AtomicPaymentUtils: zeroAddress,
  erc721EscrowObligation: zeroAddress,
  erc721UnconditionalEscrowObligation: zeroAddress,
  erc721PaymentObligation: zeroAddress,
  erc721AtomicPaymentUtils: zeroAddress,
  erc1155EscrowObligation: zeroAddress,
  erc1155UnconditionalEscrowObligation: zeroAddress,
  erc1155PaymentObligation: zeroAddress,
  erc1155AtomicPaymentUtils: zeroAddress,
  nativeTokenEscrowObligation: zeroAddress,
  nativeTokenUnconditionalEscrowObligation: zeroAddress,
  nativeTokenPaymentObligation: zeroAddress,
  nativeTokenAtomicPaymentUtils: zeroAddress,
  tokenBundleEscrowObligation: zeroAddress,
  tokenBundleUnconditionalEscrowObligation: zeroAddress,
  tokenBundlePaymentObligation: zeroAddress,
  tokenBundleAtomicPaymentUtils: zeroAddress,
  atomicAttestationUtils: zeroAddress,
  attestationEscrowObligation: zeroAddress,
  attestationUnconditionalEscrowObligation: zeroAddress,
  attestationReferenceEscrowObligation: zeroAddress,
  attestationReferenceUnconditionalEscrowObligation: zeroAddress,
  stringObligation: zeroAddress,
  commitRevealObligation: zeroAddress,
  trivialArbiter: zeroAddress,
  trustedOracleArbiter: zeroAddress,
  commitmentTrustedOracleArbiter: zeroAddress,
  allArbiter: zeroAddress,
  anyArbiter: zeroAddress,
  intrinsicsArbiter: zeroAddress,
  erc8004Arbiter: zeroAddress,
  referencesEscrowArbiter: zeroAddress,
  exclusiveRevocableConfirmationArbiter: zeroAddress,
  exclusiveUnrevocableConfirmationArbiter: zeroAddress,
  nonexclusiveRevocableConfirmationArbiter: zeroAddress,
  nonexclusiveUnrevocableConfirmationArbiter: zeroAddress,
  recipientArbiter: zeroAddress,
  attesterArbiter: zeroAddress,
  schemaArbiter: zeroAddress,
  uidArbiter: zeroAddress,
  refUidArbiter: zeroAddress,
  revocableArbiter: zeroAddress,
  timeAfterArbiter: zeroAddress,
  timeBeforeArbiter: zeroAddress,
  timeEqualArbiter: zeroAddress,
  expirationTimeAfterArbiter: zeroAddress,
  expirationTimeBeforeArbiter: zeroAddress,
  expirationTimeEqualArbiter: zeroAddress,
  hookEscrowObligation: zeroAddress,
  hooksEscrowObligation: zeroAddress,
  erc20EscrowHook: zeroAddress,
  erc721EscrowHook: zeroAddress,
  erc1155EscrowHook: zeroAddress,
  nativeTokenEscrowHook: zeroAddress,
  attestationEscrowHook: zeroAddress,
  attestationReferenceEscrowHook: zeroAddress,
  erc20Splitter: zeroAddress,
  erc1155Splitter: zeroAddress,
  nativeTokenSplitter: zeroAddress,
  tokenBundleSplitter: zeroAddress,
  tokenBundleSplitterUnvalidated: zeroAddress,
  commitmentERC20Splitter: zeroAddress,
  commitmentERC1155Splitter: zeroAddress,
  commitmentNativeTokenSplitter: zeroAddress,
  commitmentTokenBundleSplitter: zeroAddress,
  commitmentTokenBundleSplitterUnvalidated: zeroAddress,
} satisfies Pick<
  ChainAddresses,
  | "erc20EscrowObligation"
  | "erc20UnconditionalEscrowObligation"
  | "erc20PaymentObligation"
  | "erc20AtomicPaymentUtils"
  | "erc721EscrowObligation"
  | "erc721UnconditionalEscrowObligation"
  | "erc721PaymentObligation"
  | "erc721AtomicPaymentUtils"
  | "erc1155EscrowObligation"
  | "erc1155UnconditionalEscrowObligation"
  | "erc1155PaymentObligation"
  | "erc1155AtomicPaymentUtils"
  | "nativeTokenEscrowObligation"
  | "nativeTokenUnconditionalEscrowObligation"
  | "nativeTokenPaymentObligation"
  | "nativeTokenAtomicPaymentUtils"
  | "tokenBundleEscrowObligation"
  | "tokenBundleUnconditionalEscrowObligation"
  | "tokenBundlePaymentObligation"
  | "tokenBundleAtomicPaymentUtils"
  | "atomicAttestationUtils"
  | "attestationEscrowObligation"
  | "attestationUnconditionalEscrowObligation"
  | "attestationReferenceEscrowObligation"
  | "attestationReferenceUnconditionalEscrowObligation"
  | "stringObligation"
  | "commitRevealObligation"
  | "trivialArbiter"
  | "trustedOracleArbiter"
  | "commitmentTrustedOracleArbiter"
  | "allArbiter"
  | "anyArbiter"
  | "intrinsicsArbiter"
  | "erc8004Arbiter"
  | "referencesEscrowArbiter"
  | "exclusiveRevocableConfirmationArbiter"
  | "exclusiveUnrevocableConfirmationArbiter"
  | "nonexclusiveRevocableConfirmationArbiter"
  | "nonexclusiveUnrevocableConfirmationArbiter"
  | "recipientArbiter"
  | "attesterArbiter"
  | "schemaArbiter"
  | "uidArbiter"
  | "refUidArbiter"
  | "revocableArbiter"
  | "timeAfterArbiter"
  | "timeBeforeArbiter"
  | "timeEqualArbiter"
  | "expirationTimeAfterArbiter"
  | "expirationTimeBeforeArbiter"
  | "expirationTimeEqualArbiter"
  | "hookEscrowObligation"
  | "hooksEscrowObligation"
  | "erc20EscrowHook"
  | "erc721EscrowHook"
  | "erc1155EscrowHook"
  | "nativeTokenEscrowHook"
  | "attestationEscrowHook"
  | "attestationReferenceEscrowHook"
  | "erc20Splitter"
  | "erc1155Splitter"
  | "nativeTokenSplitter"
  | "tokenBundleSplitter"
  | "tokenBundleSplitterUnvalidated"
  | "commitmentERC20Splitter"
  | "commitmentERC1155Splitter"
  | "commitmentNativeTokenSplitter"
  | "commitmentTokenBundleSplitter"
  | "commitmentTokenBundleSplitterUnvalidated"
>;

export const contractAddresses: Record<string, ChainAddresses> = {
  "Base Sepolia": {
    eas: "0x4200000000000000000000000000000000000021",
    easSchemaRegistry: "0x4200000000000000000000000000000000000020",

    erc20AtomicPaymentUtils: "0x4c597Ee412A4414e80Ddb79Fde1Fb704bc1358c0",
    erc20EscrowObligation: "0x5c55EFa334A7FceF530a081D19Be98E871EdbB83",
    erc20UnconditionalEscrowObligation: "0x56AcF1b3A736C5524b8836534D15445322a50a2B",
    erc20PaymentObligation: "0x0f953267E8d835b9f33b361C963F126775316dcA",

    erc721AtomicPaymentUtils: "0x4c597Ee412A4414e80Ddb79Fde1Fb704bc1358c0",
    erc721EscrowObligation: "0x0850d8F7015Ba183227925cd100968e82aCb266A",
    erc721UnconditionalEscrowObligation: "0x63A26965Ea23A61219128a57392f8a2A4E7be140",
    erc721PaymentObligation: "0x2e8aa787750853ce422E487dacad385296F81169",

    erc1155AtomicPaymentUtils: "0x4c597Ee412A4414e80Ddb79Fde1Fb704bc1358c0",
    erc1155EscrowObligation: "0x267C98D752C6B9F9B354471A08F72aaCb9eC8567",
    erc1155UnconditionalEscrowObligation: "0x62c1351503Ef1308FfF550cD594c95F3112F61aB",
    erc1155PaymentObligation: "0x1F559CE3f65374593ff39EC5a74ea36db0b817d1",

    tokenBundleAtomicPaymentUtils: "0x4c597Ee412A4414e80Ddb79Fde1Fb704bc1358c0",
    tokenBundleEscrowObligation: "0xC52c611c0C9A11fF625B93f9D1fb9E74C45d9859",
    tokenBundleUnconditionalEscrowObligation: "0xa5ba8B7382093525F5F6739cCff910376D63c1ba",
    tokenBundlePaymentObligation: "0x7F445E83779Df77cAB8E71eC3C5E2Bffe4EB1314",

    atomicAttestationUtils: "0x886f7cE4bF11dBDbA163bEE866533965177ae680",
    attestationEscrowObligation: "0xFa299C13D7F17B6a3E63b1bE985F93020Db1169C",
    attestationUnconditionalEscrowObligation: "0x61504DB9850e54fEb9f0681631BE8906a75B3bB9",
    attestationReferenceEscrowObligation: "0x18a38eE1e1609e21b29F9bec07Ea6633BB5E8368",
    attestationReferenceUnconditionalEscrowObligation: "0x7833cD2ADD07CD7bD0DA20020663D6857fDa1E6C",

    stringObligation: "0x22d3203992CCC7Dfb2Ec12D87E15b0d8698De35b",
    commitRevealObligation: "0x14d0B7D4ed6915CE0b1a0d54F9D5912584dB550E",

    trivialArbiter: "0xa42Df9aDF17f26Ff1eD5206cf83E5dab88bD3523",
    trustedOracleArbiter: "0x504f496F696c41558070a933c90a98604c3f4475",
    commitmentTrustedOracleArbiter: zeroAddress,
    allArbiter: "0x9F78AAca04A2c005618c3B214e609B13Bbe66356",
    anyArbiter: "0xaF67e09D889e0df9d404059283A1FA7BA7Ac7d88",
    intrinsicsArbiter: "0xd78d4404E2E1a9033eEf1ac69BF488f6a4Ea9aC0",
    erc8004Arbiter: "0x65dE059a0B2A060E842B8106B1BE365bf5f2F80f",
    referencesEscrowArbiter: "0x335441cc9813558067e5b3a4c39AF8a9cFb6fAF8",

    nativeTokenAtomicPaymentUtils: "0x4c597Ee412A4414e80Ddb79Fde1Fb704bc1358c0",
    nativeTokenEscrowObligation: "0x5d83C1Cb608e891F7B2Bcc12294d1e64aBB8eC7F",
    nativeTokenUnconditionalEscrowObligation: "0x58368eE14F75FA38366E7da12707Ec501e3F042a",
    nativeTokenPaymentObligation: "0xd53357af507f4c865A6345a05dC9849BB3eFD7c7",

    exclusiveRevocableConfirmationArbiter: "0xf6388A7b78c4A130249160CbcC609530D267B59B",
    exclusiveUnrevocableConfirmationArbiter: "0x21F1402b4006B4A799502F948cfED187E66e9bb9",
    nonexclusiveRevocableConfirmationArbiter: "0xC4876Bf97a5C24E26e8286fF7a3391c20A8a0A6e",
    nonexclusiveUnrevocableConfirmationArbiter: "0x9F8AF67d89B674513eFAdf29ed936c4704A64fEb",

    recipientArbiter: "0x507CFD91DD2d2b8E7F93812414d8Ce9dC5404F62",
    attesterArbiter: "0xa50365B53232f54cf6C60f0f432ad64169A6e76e",
    schemaArbiter: "0xA8f8e66d12b97EbE93C79b36D015666DEC2Dd151",
    uidArbiter: "0x9F06F7E040d57e21964cCa4D91CBC57b25C55D67",
    refUidArbiter: "0xafA3c1593ca451DA36dB7fD36077BcFFf7B4c717",
    revocableArbiter: "0x6a9e076cf1Df39D029A7B6d48A1Ab36B3cC28639",
    timeAfterArbiter: "0x24D729f6f8Fc3DF5EB42939276cF2Efe9fF963d6",
    timeBeforeArbiter: "0xCE156DEAB9B4A525640a0BC2Ad9966d13f9a134a",
    timeEqualArbiter: "0x5dc2d28f06DDB3e60b76fab033F672126572c976",
    expirationTimeAfterArbiter: "0xd8C0Ab60B431061a079C8b4e0BaCf7CbF6aEA29d",
    expirationTimeBeforeArbiter: "0xcae48f46d89cd2d78118a84d8CA589Ee7d29C98c",
    expirationTimeEqualArbiter: "0x9354ca2BdB314BB41C78CBff4C4443718a8813DF",

    hookEscrowObligation: "0x5aD1B5f0eE7A520311B4b8d8f758d48934851981",
    hooksEscrowObligation: "0xa21a3A6db8b00303D7e919Ea8983CFd2DC6Ed1d3",
    erc20EscrowHook: "0xEF0473fE3777b45C68455f90d4edCC1A8673c518",
    erc721EscrowHook: "0x80016D907E87989457C0253D42e0a4348476DBb3",
    erc1155EscrowHook: "0xC2045eF34C8789dE4744272706a8800A03cE1f11",
    nativeTokenEscrowHook: "0xFeE4003D97e77251091D9C686ba4da4E46D98c05",
    attestationEscrowHook: "0x2fd54cC36e441B2a3c0202B621208db046C18ea3",
    attestationReferenceEscrowHook: "0x335cE1C9DFA441C2db31914502E5CeD9b38DCBFD",

    erc20Splitter: "0xd6816aC123844edb88f0AF146Cc565C6663DE97B",
    erc1155Splitter: "0xB386B657F66c8eAb3A3335d590Eef4a0871e63a3",
    nativeTokenSplitter: "0xa32161d10B31f3eB5BfC0EEfDE64784e01CBD9E1",
    tokenBundleSplitter: "0xceC0D468b29cA55FEA224e2b66AC5694036aA24d",
    tokenBundleSplitterUnvalidated: "0x6c1c55E13E5Ec8668dad15dbe1B461E7814643a1",
    commitmentERC20Splitter: zeroAddress,
    commitmentERC1155Splitter: zeroAddress,
    commitmentNativeTokenSplitter: zeroAddress,
    commitmentTokenBundleSplitter: zeroAddress,
    commitmentTokenBundleSplitterUnvalidated: zeroAddress,
  },
  "Sepolia": {
    eas: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
    easSchemaRegistry: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0",

    erc20AtomicPaymentUtils: "0xD59c6c6Cb025E76a0a1E706c62A9dF38b04694E2",
    erc20EscrowObligation: "0x6bcec91a89A63D50368BCe54Cb9eD0399992C18b",
    erc20UnconditionalEscrowObligation: "0x33F6f558c1FCac597F2b635bc50554055FF98165",
    erc20PaymentObligation: "0x99F5335B95e1C0bE4C218a59aae26Efc50d5673f",

    erc721AtomicPaymentUtils: "0xD59c6c6Cb025E76a0a1E706c62A9dF38b04694E2",
    erc721EscrowObligation: "0x5B6Bff4DC108C58b97721330666f56c8028C097c",
    erc721UnconditionalEscrowObligation: "0xF9Dbc74553FaeCAC775201113198085c4D572805",
    erc721PaymentObligation: "0x4CB076aF47F0F3909Ebafd88cBc0c4CC8Dee17DD",

    erc1155AtomicPaymentUtils: "0xD59c6c6Cb025E76a0a1E706c62A9dF38b04694E2",
    erc1155EscrowObligation: "0x902ac1997bd29A037263E0d80952C80d69D9aFd4",
    erc1155UnconditionalEscrowObligation: "0xc1b02eFEc19a171ECBB7C8ad54B9617E80fdF40F",
    erc1155PaymentObligation: "0xfca2C2DF4023A0A418BF354B5Bfff1EbFe0520A9",

    tokenBundleAtomicPaymentUtils: "0xD59c6c6Cb025E76a0a1E706c62A9dF38b04694E2",
    tokenBundleEscrowObligation: "0x7490102a8B821C70679508426823F26C9bab4714",
    tokenBundleUnconditionalEscrowObligation: "0xD511278D5b9e5F8F9B99d01Ea326B8232C133be5",
    tokenBundlePaymentObligation: "0xb5800e34602154cE92C5eb0e7Cb455306d7d590E",

    atomicAttestationUtils: "0xE800A6E43615C5ba54c2851633f4F92548052cd2",
    attestationEscrowObligation: "0xa22b4D9Fe7a746D44BE1e724BB1a26593BCa2C1B",
    attestationUnconditionalEscrowObligation: "0xcda1e1EA425E31a789fefFC8e3d90f839fF49C9F",
    attestationReferenceEscrowObligation: "0xD57f20673091fB43D55eABf48b4F421DAe70A7C2",
    attestationReferenceUnconditionalEscrowObligation: "0xb47c24E94E852521b21D384981F4CEfD1AB9680C",

    stringObligation: "0x66c3f78258823B9B899aB14B11e1DCf978c060D7",
    commitRevealObligation: "0x931b35F81e7A585317f8cF8B45795F403EEfe468",

    trivialArbiter: "0xD56bD862e7BEbD0BD7356603e9E52B32c241E2AE",
    trustedOracleArbiter: "0x61dC9c2D757A1C9D0d38A281288d9ef918e77Baa",
    commitmentTrustedOracleArbiter: zeroAddress,
    allArbiter: "0xb6890A8Cb8CDeFcE11Edc0314125b750F48BFF1B",
    anyArbiter: "0x81dC8f2C5677b02aFcAFef34Fa7E75D55dfAEF20",
    intrinsicsArbiter: "0x7B20A4b25af2a2637C240622d6C3875DeA609A64",
    erc8004Arbiter: "0x194C3Da79a1De5f9141b1DbCdF98eC5d511B4E5a",
    referencesEscrowArbiter: "0x49026902790A8ECb427f335cA0d097c7C5795d13",

    nativeTokenAtomicPaymentUtils: "0xD59c6c6Cb025E76a0a1E706c62A9dF38b04694E2",
    nativeTokenEscrowObligation: "0x797a737deFB8cAE0a30324ecFa52eaab9c0A5fD6",
    nativeTokenUnconditionalEscrowObligation: "0x850D8Df3fF0149Bd5a9191A958B287B25564716B",
    nativeTokenPaymentObligation: "0x3c07027874650794EaE300C603f066af182EA86A",

    exclusiveRevocableConfirmationArbiter: "0xa740634E718c8727853D1E69963303D5cB8Ea44C",
    exclusiveUnrevocableConfirmationArbiter: "0xB3D71c6f96cdD41e56dd9870b232225C379f2890",
    nonexclusiveRevocableConfirmationArbiter: "0x831B40aE79D391C7d56209802b9745Fe0743DBF5",
    nonexclusiveUnrevocableConfirmationArbiter: "0xFeaA2fa295d1453BA382b7eE0e3F66c489A6d9Bb",

    recipientArbiter: "0xE0d55949E6e1590F26eF37a1D01df52Fbb1b2FcE",
    attesterArbiter: "0xE571D48D05962C57c95e48b8A7375466D1d02487",
    schemaArbiter: "0x9D5817Ff5519f45bf8ed6C3ADa638b874DBCb540",
    uidArbiter: "0xaA9aEf96068f2BE679ae8781A4fC33FF4798758F",
    refUidArbiter: "0x546526311E6639399FdC583dF84eEe8b123D79d5",
    revocableArbiter: "0xe8d45cf2471882730a7e0ac142966DF07ae148d4",
    timeAfterArbiter: "0x2725A6869b42eDfD155889098408CcB3b1ed060e",
    timeBeforeArbiter: "0x014aA3DC53004B50bC13aa1D85A83bccA5c0671a",
    timeEqualArbiter: "0x1c21A8fB4F69ADb0ccDd22D8C125F8689bf227AF",
    expirationTimeAfterArbiter: "0xbD90aF50Fb667724338EB8DA541f923F1822ac3C",
    expirationTimeBeforeArbiter: "0xbCCE130337F2D8029982a14471d8686AFceF20fF",
    expirationTimeEqualArbiter: "0x98D5bC7593143E55e9949da97603126CAe0BfD7F",

    hookEscrowObligation: "0xaFfE00b43dD7843E8F6E8A2B4df0a62949Bf8352",
    hooksEscrowObligation: "0xc79668ec88dA1fa6efd645Eca2dF338f39E4Dcb6",
    erc20EscrowHook: "0x13034d319e72e77e69EDD2ef09ed084d8Fc7cbAE",
    erc721EscrowHook: "0x3c1E21911C609714dBc0Ab90800c7aD8817B8e83",
    erc1155EscrowHook: "0x32889Ee549d61Ed5D14f2D499fCc809a4feC0dD8",
    nativeTokenEscrowHook: "0xb0A6DDB4eBA2B11371b605eCFdDFE7491eE28bc0",
    attestationEscrowHook: "0x4De7D702A4edC5fe136B6899E10D770633F337aD",
    attestationReferenceEscrowHook: "0xCFa0756162eE176106185A42ed14f340aAA76F8a",

    erc20Splitter: "0x5313f28c9e32f45Bd639701e2E7e080b61c0f39e",
    erc1155Splitter: "0x11f6b04b2a8FB648fcD20bd4124c448a16ca37D1",
    nativeTokenSplitter: "0xdA1fD1aC28C1d09E723e5a23Cd16554C87D0D09C",
    tokenBundleSplitter: "0x0F235Bf6e5725791e118A25b4903856030525EF0",
    tokenBundleSplitterUnvalidated: "0x4621C947D713cC7f63a377EE4D05eea789ab0956",
    commitmentERC20Splitter: zeroAddress,
    commitmentERC1155Splitter: zeroAddress,
    commitmentNativeTokenSplitter: zeroAddress,
    commitmentTokenBundleSplitter: zeroAddress,
    commitmentTokenBundleSplitterUnvalidated: zeroAddress,
  },
  "GenLayer Bradbury": {
    ...unreleasedAddresses,
    eas: "0xaC18Fa0DE3123215404a0C5f6d02ed9B2D0D0d98",
    easSchemaRegistry: "0xA1F9076932f6eEA0D90BBfA1D6E81D001012645D",
  },
  "Ethereum": {
    ...unreleasedAddresses,
    eas: "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587",
    easSchemaRegistry: "0xA7b39296258348C78294F95B872b282326A97BDF",
  },
} as const;

export const supportedChains = ["Base Sepolia", "Sepolia", "GenLayer Bradbury", "Ethereum"];
