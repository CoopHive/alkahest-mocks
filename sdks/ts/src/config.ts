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

    erc20AtomicPaymentUtils: "0xd9833df4cf9Eb2745320bD2281E7D0e872e7ec92",
    erc20EscrowObligation: "0x235E4D9d329460fEE53A45cC6b14109bC74818AA",
    erc20UnconditionalEscrowObligation: "0x81e1806dcCFD707dbf2874bB74308807BB532d9f",
    erc20PaymentObligation: "0x20f725Bdc602Bc800301104eaBC70F8bf88F3213",

    erc721AtomicPaymentUtils: "0xd9833df4cf9Eb2745320bD2281E7D0e872e7ec92",
    erc721EscrowObligation: "0x6d29B32149659F79B117470787ee34a3f6A79d03",
    erc721UnconditionalEscrowObligation: "0x8307e27672508975CbBDEb9acDe45ec860dd7ed1",
    erc721PaymentObligation: "0xA98DC1d798640b15575b44445C592DaA28b93b62",

    erc1155AtomicPaymentUtils: "0xd9833df4cf9Eb2745320bD2281E7D0e872e7ec92",
    erc1155EscrowObligation: "0x11A656dbA6aCde48c8d2C3e1AdE9BD3694A3802a",
    erc1155UnconditionalEscrowObligation: "0xe2EC5037e1bA475F1E607c186Ba7eDA118917d0f",
    erc1155PaymentObligation: "0x64d92832Fa3f34b12511ac422f171Def00980F50",

    tokenBundleAtomicPaymentUtils: "0xd9833df4cf9Eb2745320bD2281E7D0e872e7ec92",
    tokenBundleEscrowObligation: "0xdEb301Db1Cc9ab09D9576945aDb7610055a0cfA1",
    tokenBundleUnconditionalEscrowObligation: "0x588008DAc52A711F1f812EeDd0b6da0cF78F3daf",
    tokenBundlePaymentObligation: "0x4b427BA39F4fEa7CBB624b5DD1E3e90FeD7290d7",

    atomicAttestationUtils: "0x60d9a3A4D95D88E15EeE23E2294dEC13a652Bf73",
    attestationEscrowObligation: "0x587A3758A96B4dC1A165D1F0BE73d1B188c5064b",
    attestationUnconditionalEscrowObligation: "0x01d31477aa1d223a80Eed95C1bceFa80d089a32F",
    attestationReferenceEscrowObligation: "0xff322C52a6413183792FbE27e1e810ceB49681d9",
    attestationReferenceUnconditionalEscrowObligation: "0x9ad58BE5E8250dd57554ad3CF9f8A235FDB24954",

    stringObligation: "0xB1e14fdeBB8192Fb0bEe918075CcD350d0Cb47a7",
    commitRevealObligation: "0x2834FFf408D729d08058E24002B19B45B1Ec06cd",

    trivialArbiter: "0x23846807203E7127864FFF04ad63e3e93bfC6110",
    trustedOracleArbiter: "0xCA13C55a1863fF8F6CEF9166C30bb4563EB7Dca3",
    commitmentTrustedOracleArbiter: "0x788d645cAe8003642e2B2071932e64AA3dC811A9",
    allArbiter: "0xf00006E11eDa09E038d43888Eba986828BBd2a54",
    anyArbiter: "0x0fBa3E59d1a13dA50F816E932F0dF96b5Efe3dF7",
    intrinsicsArbiter: "0x675d853A878F3F28c8122d016Ea3348EE1C1e5e0",
    erc8004Arbiter: "0xbD925DeDE4351f102C1b3247c5D5F8299b6844AA",
    referencesEscrowArbiter: "0x4e1dF4fDd731DdFBE6fF7fB6Fa8a44849f272610",

    nativeTokenAtomicPaymentUtils: "0xd9833df4cf9Eb2745320bD2281E7D0e872e7ec92",
    nativeTokenEscrowObligation: "0x2B642E572B06627678531C4f088DBFc0682b2D5c",
    nativeTokenUnconditionalEscrowObligation: "0xd52B703F10aA973fAeC389eBb69A42f21D99eB97",
    nativeTokenPaymentObligation: "0xFB427bE43800eF8b7DE0eD2FcB4a2104be7a1790",

    exclusiveRevocableConfirmationArbiter: "0x5ff930aD34f43C0aFd4bd0d22bDd35436D0Fa848",
    exclusiveUnrevocableConfirmationArbiter: "0x6955B6BCaD7D9d1d73b0930bBACBA003a17715cA",
    nonexclusiveRevocableConfirmationArbiter: "0xE31E829b18C06315c5B16Ab931E185C011b71eD9",
    nonexclusiveUnrevocableConfirmationArbiter: "0x3a7720AED5Dc2F62558aCA635cc7827dA7cE3f93",

    recipientArbiter: "0x3db22f5b8D64E97D23b01D96f5369150e3e01b8a",
    attesterArbiter: "0x9Dc4e63cc3F89029249E867D3d726FDAfdFCe2dd",
    schemaArbiter: "0x32FdE48386Af5FeA027e6ee6e7918900378bfDf7",
    uidArbiter: "0xc11FbF317a26cc3f79f71ba7b8591833ADDE6B31",
    refUidArbiter: "0x3430240Ab3400f61cb76880bD5160Cd2de7d8F62",
    revocableArbiter: "0x9Ce06047462fCc630fE0bA93d68536AA91E1F1Ba",
    timeAfterArbiter: "0x48B01BEE7eeF3958661472a42887D0D00383f4Ee",
    timeBeforeArbiter: "0x8D0b01464f8011906b3A27fd9E21d6447770753f",
    timeEqualArbiter: "0x53B9EAd4674A3519dcd1469A5E407687f0406cD4",
    expirationTimeAfterArbiter: "0x564Fd8E21eD72Ef3e9Dfd2958AbC7B1Ce9cEBf2e",
    expirationTimeBeforeArbiter: "0x32523acf7bF94d0f86dB124EC4066cfe2dF57122",
    expirationTimeEqualArbiter: "0x990504e5a8c961daC16eaE0A3c0765f4bf8c6A90",

    hookEscrowObligation: "0xFf6DeD2CfCebbdf5098cbAF1bC2fF89dAF1c95c7",
    hooksEscrowObligation: "0xa8192c4ECa1F9a02C22197Ab10125E860AfD2b37",
    erc20EscrowHook: "0x52be764BA05b78CedDD7C21B413c84e13ebbf6af",
    erc721EscrowHook: "0xa999c27F2e5daad0F572A5B9De1A6FEeF769135A",
    erc1155EscrowHook: "0x2ec34B98eB236c74390cf4A64E098Be5C63660F7",
    nativeTokenEscrowHook: "0x25f074830caF1C3421f5d8898dd02C49AB9Febaa",
    attestationEscrowHook: "0x681949aeeF9Fd1555ae13E5d3DC34602a86Ed159",
    attestationReferenceEscrowHook: "0x96c06811fCa2B29de325690182c8920A32d1bfb2",

    erc20Splitter: "0x4B4AFF3422904C90809dA132138D9c341ec84daF",
    erc1155Splitter: "0x5ec064e9Bd0A4657fE83FF4f8856e018144D180b",
    nativeTokenSplitter: "0x264fEfd1B4AF4CA3BFC094eBf1ea24E45f71cbC5",
    tokenBundleSplitter: "0xFC6a485c342a1Ec87F501bb2182A5b4474788835",
    tokenBundleSplitterUnvalidated: "0xEeE931766ADCfB5677152A86531f001540c73aFE",
    commitmentERC20Splitter: "0x1e3a3DfF0E60451aBEc16Ec9A52e9B53DF74c148",
    commitmentERC1155Splitter: "0xf34DBEfD26A6116a57DBb38c360d64B5CAD10880",
    commitmentNativeTokenSplitter: "0x1Eb4471ce98fab4EAE96A8b6CbDF0eDf4bC87afa",
    commitmentTokenBundleSplitter: "0x935ad3B4c6fc3Acc2604658100Cb9e628090FBAC",
    commitmentTokenBundleSplitterUnvalidated: "0xA273ab8dA9547a6444DcD5d22078a076c8EA0DBc",
  },
  Sepolia: {
    eas: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
    easSchemaRegistry: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0",

    erc20AtomicPaymentUtils: "0x79cff100A510e0F0e7f18690CC13F5BBFB1E3304",
    erc20EscrowObligation: "0xAcF53c13DaC16F5339925B6ef868C4Cd6A10dEdD",
    erc20UnconditionalEscrowObligation: "0xA57042D7372d5C8D7B63935f85Aa907e056cE81E",
    erc20PaymentObligation: "0xE3Ee61A399ef304dA80f8b994CA453E071e626D8",

    erc721AtomicPaymentUtils: "0x79cff100A510e0F0e7f18690CC13F5BBFB1E3304",
    erc721EscrowObligation: "0x3fb846B3BF47267350b3Dd5388C2Eec64B9f64eD",
    erc721UnconditionalEscrowObligation: "0x5a36F46eEbEfF5Bc1aff2Ac10e68F3B397c2247A",
    erc721PaymentObligation: "0x77Dea40229D73Be57836C58457BAd31CEB7F76Eb",

    erc1155AtomicPaymentUtils: "0x79cff100A510e0F0e7f18690CC13F5BBFB1E3304",
    erc1155EscrowObligation: "0xe19B5aAe789cADa9f9838CB6492892D4f9257FA5",
    erc1155UnconditionalEscrowObligation: "0xDe0fdfa44a6Cbd1861f712B82209c6504d1EC367",
    erc1155PaymentObligation: "0xa5dce45770b086ca9B94bE539f2f07ad295A33d8",

    tokenBundleAtomicPaymentUtils: "0x79cff100A510e0F0e7f18690CC13F5BBFB1E3304",
    tokenBundleEscrowObligation: "0x46143219C66Bc881544A87a764E9E699a7B36825",
    tokenBundleUnconditionalEscrowObligation: "0xDc59dF345dea522D54FB7D79543a2CD861E40d3b",
    tokenBundlePaymentObligation: "0xf81C2B5A816190A2c49AB16052E33ff6ae0bAD2f",

    atomicAttestationUtils: "0x027E8d4DC75C28c6d298dE63E86e24A8126283c5",
    attestationEscrowObligation: "0xaBd9bAB75BA9Ba9eF300B180Aff552aa6f2741fd",
    attestationUnconditionalEscrowObligation: "0x9c07Bb1A9B2609021C0e280B104efA2bcbb5bcaB",
    attestationReferenceEscrowObligation: "0x3e9DD609A0Bcfe7A40480B61E6Ad275c96C1E6A4",
    attestationReferenceUnconditionalEscrowObligation: "0xf10C4dfaEF05a7e8bbd2B66d37b29D10Fb0a4B86",

    stringObligation: "0x92e4A31c4204eDA513C97a6C238B6Ea85f97A20C",
    commitRevealObligation: "0xDC61f88A3129506319E6CC032F54414F774C76bb",

    trivialArbiter: "0x60Dea7f27bc89846833D6bACE9dad9EF782af642",
    trustedOracleArbiter: "0x53517F742A7390deA3604206b66A2469E1CB8568",
    commitmentTrustedOracleArbiter: "0x1509cA51eBBD72cfA00134f3823C19D2B2771d3b",
    allArbiter: "0x63Dcb7272289D542F47BF432395aa1C2E5433634",
    anyArbiter: "0x85Ea0f23b445274D362aE083fEf687C2c5678953",
    intrinsicsArbiter: "0xEeDD6477e13c094aCd556093F2d6747C7fe39Ba7",
    erc8004Arbiter: "0x40fF917fD34153159A0cC8545152D3D78D71e308",
    referencesEscrowArbiter: "0xc23c9d04D44c5DbE670aC4a4DbDDcc9fD5b427d6",

    nativeTokenAtomicPaymentUtils: "0x79cff100A510e0F0e7f18690CC13F5BBFB1E3304",
    nativeTokenEscrowObligation: "0xD183a6C2064732a6aea6aB99a7AD82B429cEf84c",
    nativeTokenUnconditionalEscrowObligation: "0x0e6227F1f0718d5eeFc99316092CA1a3CC437dE2",
    nativeTokenPaymentObligation: "0xE9d2d571223690cd4ED607baC928821A3490027E",

    exclusiveRevocableConfirmationArbiter: "0x174abA9406cecEabbEe50d5fc79349395725ED30",
    exclusiveUnrevocableConfirmationArbiter: "0x6734e47E4b0ac0CbBB0B77B3fb826dd91c67dF79",
    nonexclusiveRevocableConfirmationArbiter: "0xdF6eb180de4F146Bb9Bb703DDbB8bF3f0761a070",
    nonexclusiveUnrevocableConfirmationArbiter: "0x45833200308028534AEC1DF1FF3DaE8a42d0857A",

    recipientArbiter: "0x9497262a1D684287C267Da62cB9c0d76500cFB82",
    attesterArbiter: "0x5Feb12E6f0bc1E59E35bA9e6C045E195e9071952",
    schemaArbiter: "0xE015c65a10d63f5E92d4827B5B7237A2Becd7234",
    uidArbiter: "0x45A700735FB979151A2CC140504Ec08563322167",
    refUidArbiter: "0x6770500a9ed5F990dCe9E8076fDbDB546b6b6eEc",
    revocableArbiter: "0xA2D8F8Eb6826CfaC815c84C6f1bcd2e31917bc04",
    timeAfterArbiter: "0x44c5f324CF2c068efd2E14ACDd54f0320901AD36",
    timeBeforeArbiter: "0x80E343D826E5dba460C90ddb4bE064b173F723a0",
    timeEqualArbiter: "0x41062C84256e40c8CBc89C9948b6597a9eFe1E53",
    expirationTimeAfterArbiter: "0x888436DdFE79aeDFB589AF4D27D04c78d10091ee",
    expirationTimeBeforeArbiter: "0x8DCAe180E1ab21C92A7bfCc6D4E6edac48901C1C",
    expirationTimeEqualArbiter: "0xC5c626B5Df414dd9e0A1912980947C7A97028b18",

    hookEscrowObligation: "0x33Ac7EF225195af907F26F41D7338Ccf12696645",
    hooksEscrowObligation: "0x49Aca5C9Cf0C61C38B99c3a462517c6E37Ae2D28",
    erc20EscrowHook: "0x6EAD59f2EB3149B876682FceD53e6432E599Cd93",
    erc721EscrowHook: "0xb986720B58f7D27599544268758888b85Ba89ded",
    erc1155EscrowHook: "0x6CbB5166676BA59A535352042AA767F02C7bAE63",
    nativeTokenEscrowHook: "0x0eC191E21808eC4eF0a581C57115eb3Be73A31f8",
    attestationEscrowHook: "0x7b6e3a5bC939c4ecE08d5622cD937aCA79f82c2d",
    attestationReferenceEscrowHook: "0x6C65e7237D8b34DB97d55E044876d4169350EDfE",

    erc20Splitter: "0x564239fcb7018cbC090B0Bd6d6734881c3273578",
    erc1155Splitter: "0xd49669e2c4D90ec3d6f6fB8685c4D49297D123eA",
    nativeTokenSplitter: "0xE5E04525187025fEA7742325828fb3Bb2D7d88d2",
    tokenBundleSplitter: "0x913F92ff33E900303aC6668948818E8866bCe61d",
    tokenBundleSplitterUnvalidated: "0xD2CF1aeE77fbF238AF484DB35bd8477Dc430FEf7",
    commitmentERC20Splitter: "0xb6209F00BdcfC4fA8EF355842f00874321DAA01a",
    commitmentERC1155Splitter: "0xB77d903Ad9ade33A4b2730F1f07E0aFBb5263D9A",
    commitmentNativeTokenSplitter: "0x2cAfa083086e42013f05ff5F84CC69feb5D0B8AA",
    commitmentTokenBundleSplitter: "0x1a3A07C9649D46a0f75C44b2E51407575E0b763A",
    commitmentTokenBundleSplitterUnvalidated: "0xc6370A8B067E7Be7adaea6c4b79062EB0e9fA95c",
  },
  "GenLayer Bradbury": {
    ...unreleasedAddresses,
    eas: "0xaC18Fa0DE3123215404a0C5f6d02ed9B2D0D0d98",
    easSchemaRegistry: "0xA1F9076932f6eEA0D90BBfA1D6E81D001012645D",
  },
  Ethereum: {
    ...unreleasedAddresses,
    eas: "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587",
    easSchemaRegistry: "0xA7b39296258348C78294F95B872b282326A97BDF",
  },
} as const;

export const supportedChains = ["Base Sepolia", "Sepolia", "GenLayer Bradbury", "Ethereum"];
