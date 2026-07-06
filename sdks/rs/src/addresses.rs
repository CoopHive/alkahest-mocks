use alloy::primitives::{Address, address};

use crate::{
    DefaultExtensionConfig,
    clients::{
        arbiters::ArbitersAddresses, attestation::AttestationAddresses,
        commit_reveal_obligation::CommitRevealObligationAddresses, erc20::Erc20Addresses,
        erc721::Erc721Addresses, erc1155::Erc1155Addresses, hook_based::HookBasedAddresses,
        native_token::NativeTokenAddresses, splitters::SplittersAddresses,
        string_obligation::StringObligationAddresses, token_bundle::TokenBundleAddresses,
    },
};

pub const BASE_SEPOLIA_ADDRESSES: DefaultExtensionConfig = DefaultExtensionConfig {
    arbiters_addresses: ArbitersAddresses {
        eas: address!("0x4200000000000000000000000000000000000021"),
        trivial_arbiter: address!("0x23846807203E7127864FFF04ad63e3e93bfC6110"),
        trusted_oracle_arbiter: address!("0xCA13C55a1863fF8F6CEF9166C30bb4563EB7Dca3"),
        commitment_trusted_oracle_arbiter: address!("0x788d645cAe8003642e2B2071932e64AA3dC811A9"),
        intrinsics_arbiter: address!("0x675d853A878F3F28c8122d016Ea3348EE1C1e5e0"),
        erc8004_arbiter: address!("0xbD925DeDE4351f102C1b3247c5D5F8299b6844AA"),
        references_escrow_arbiter: address!("0x4e1dF4fDd731DdFBE6fF7fB6Fa8a44849f272610"),
        any_arbiter: address!("0x0fBa3E59d1a13dA50F816E932F0dF96b5Efe3dF7"),
        all_arbiter: address!("0xf00006E11eDa09E038d43888Eba986828BBd2a54"),
        attester_arbiter: address!("0x9Dc4e63cc3F89029249E867D3d726FDAfdFCe2dd"),
        expiration_time_after_arbiter: address!("0x564Fd8E21eD72Ef3e9Dfd2958AbC7B1Ce9cEBf2e"),
        expiration_time_before_arbiter: address!("0x32523acf7bF94d0f86dB124EC4066cfe2dF57122"),
        expiration_time_equal_arbiter: address!("0x990504e5a8c961daC16eaE0A3c0765f4bf8c6A90"),
        recipient_arbiter: address!("0x3db22f5b8D64E97D23b01D96f5369150e3e01b8a"),
        ref_uid_arbiter: address!("0x3430240Ab3400f61cb76880bD5160Cd2de7d8F62"),
        revocable_arbiter: address!("0x9Ce06047462fCc630fE0bA93d68536AA91E1F1Ba"),
        schema_arbiter: address!("0x32FdE48386Af5FeA027e6ee6e7918900378bfDf7"),
        time_after_arbiter: address!("0x48B01BEE7eeF3958661472a42887D0D00383f4Ee"),
        time_before_arbiter: address!("0x8D0b01464f8011906b3A27fd9E21d6447770753f"),
        time_equal_arbiter: address!("0x53B9EAd4674A3519dcd1469A5E407687f0406cD4"),
        uid_arbiter: address!("0xc11FbF317a26cc3f79f71ba7b8591833ADDE6B31"),
        exclusive_revocable_confirmation_arbiter: address!(
            "0x5ff930aD34f43C0aFd4bd0d22bDd35436D0Fa848"
        ),
        exclusive_unrevocable_confirmation_arbiter: address!(
            "0x6955B6BCaD7D9d1d73b0930bBACBA003a17715cA"
        ),
        nonexclusive_revocable_confirmation_arbiter: address!(
            "0xE31E829b18C06315c5B16Ab931E185C011b71eD9"
        ),
        nonexclusive_unrevocable_confirmation_arbiter: address!(
            "0x3a7720AED5Dc2F62558aCA635cc7827dA7cE3f93"
        ),
    },
    string_obligation_addresses: StringObligationAddresses {
        eas: address!("0x4200000000000000000000000000000000000021"),
        obligation: address!("0xB1e14fdeBB8192Fb0bEe918075CcD350d0Cb47a7"),
    },
    commit_reveal_obligation_addresses: CommitRevealObligationAddresses {
        eas: address!("0x4200000000000000000000000000000000000021"),
        obligation: address!("0x2834FFf408D729d08058E24002B19B45B1Ec06cd"),
    },
    erc20_addresses: Erc20Addresses {
        eas: address!("0x4200000000000000000000000000000000000021"),
        atomic_payment_utils: address!("0xd9833df4cf9Eb2745320bD2281E7D0e872e7ec92"),
        escrow_obligation_default: address!("0x235E4D9d329460fEE53A45cC6b14109bC74818AA"),
        escrow_obligation_unconditional: address!("0x81e1806dcCFD707dbf2874bB74308807BB532d9f"),
        payment_obligation: address!("0x20f725Bdc602Bc800301104eaBC70F8bf88F3213"),
    },
    erc721_addresses: Erc721Addresses {
        eas: address!("0x4200000000000000000000000000000000000021"),
        atomic_payment_utils: address!("0xd9833df4cf9Eb2745320bD2281E7D0e872e7ec92"),
        escrow_obligation_default: address!("0x6d29B32149659F79B117470787ee34a3f6A79d03"),
        escrow_obligation_unconditional: address!("0x8307e27672508975CbBDEb9acDe45ec860dd7ed1"),
        payment_obligation: address!("0xA98DC1d798640b15575b44445C592DaA28b93b62"),
    },
    erc1155_addresses: Erc1155Addresses {
        eas: address!("0x4200000000000000000000000000000000000021"),
        atomic_payment_utils: address!("0xd9833df4cf9Eb2745320bD2281E7D0e872e7ec92"),
        escrow_obligation_default: address!("0x11A656dbA6aCde48c8d2C3e1AdE9BD3694A3802a"),
        escrow_obligation_unconditional: address!("0xe2EC5037e1bA475F1E607c186Ba7eDA118917d0f"),
        payment_obligation: address!("0x64d92832Fa3f34b12511ac422f171Def00980F50"),
    },
    native_token_addresses: NativeTokenAddresses {
        eas: address!("0x4200000000000000000000000000000000000021"),
        atomic_payment_utils: address!("0xd9833df4cf9Eb2745320bD2281E7D0e872e7ec92"),
        escrow_obligation_default: address!("0x2B642E572B06627678531C4f088DBFc0682b2D5c"),
        escrow_obligation_unconditional: address!("0xd52B703F10aA973fAeC389eBb69A42f21D99eB97"),
        payment_obligation: address!("0xFB427bE43800eF8b7DE0eD2FcB4a2104be7a1790"),
    },
    token_bundle_addresses: TokenBundleAddresses {
        eas: address!("0x4200000000000000000000000000000000000021"),
        atomic_payment_utils: address!("0xd9833df4cf9Eb2745320bD2281E7D0e872e7ec92"),
        escrow_obligation_default: address!("0xdEb301Db1Cc9ab09D9576945aDb7610055a0cfA1"),
        escrow_obligation_unconditional: address!("0x588008DAc52A711F1f812EeDd0b6da0cF78F3daf"),
        payment_obligation: address!("0x4b427BA39F4fEa7CBB624b5DD1E3e90FeD7290d7"),
    },
    hook_based_addresses: HookBasedAddresses {
        eas: address!("0x4200000000000000000000000000000000000021"),
        hook_escrow_obligation: address!("0xFf6DeD2CfCebbdf5098cbAF1bC2fF89dAF1c95c7"),
        hooks_escrow_obligation: address!("0xa8192c4ECa1F9a02C22197Ab10125E860AfD2b37"),
        erc20_escrow_hook: address!("0x52be764BA05b78CedDD7C21B413c84e13ebbf6af"),
        erc721_escrow_hook: address!("0xa999c27F2e5daad0F572A5B9De1A6FEeF769135A"),
        erc1155_escrow_hook: address!("0x2ec34B98eB236c74390cf4A64E098Be5C63660F7"),
        native_token_escrow_hook: address!("0x25f074830caF1C3421f5d8898dd02C49AB9Febaa"),
        attestation_escrow_hook: address!("0x681949aeeF9Fd1555ae13E5d3DC34602a86Ed159"),
        attestation_reference_escrow_hook: address!("0x96c06811fCa2B29de325690182c8920A32d1bfb2"),
    },
    splitters_addresses: SplittersAddresses {
        erc20_splitter: address!("0x4B4AFF3422904C90809dA132138D9c341ec84daF"),
        erc1155_splitter: address!("0x5ec064e9Bd0A4657fE83FF4f8856e018144D180b"),
        native_token_splitter: address!("0x264fEfd1B4AF4CA3BFC094eBf1ea24E45f71cbC5"),
        token_bundle_splitter: address!("0xFC6a485c342a1Ec87F501bb2182A5b4474788835"),
        token_bundle_splitter_unvalidated: address!("0xEeE931766ADCfB5677152A86531f001540c73aFE"),
        commitment_erc20_splitter: address!("0x1e3a3DfF0E60451aBEc16Ec9A52e9B53DF74c148"),
        commitment_erc1155_splitter: address!("0xf34DBEfD26A6116a57DBb38c360d64B5CAD10880"),
        commitment_native_token_splitter: address!("0x1Eb4471ce98fab4EAE96A8b6CbDF0eDf4bC87afa"),
        commitment_token_bundle_splitter: address!("0x935ad3B4c6fc3Acc2604658100Cb9e628090FBAC"),
        commitment_token_bundle_splitter_unvalidated: address!(
            "0xA273ab8dA9547a6444DcD5d22078a076c8EA0DBc"
        ),
    },
    attestation_addresses: AttestationAddresses {
        eas: address!("0x4200000000000000000000000000000000000021"),
        eas_schema_registry: address!("0x4200000000000000000000000000000000000020"),
        atomic_attestation_utils: address!("0x60d9a3A4D95D88E15EeE23E2294dEC13a652Bf73"),
        escrow_obligation_default: address!("0x587A3758A96B4dC1A165D1F0BE73d1B188c5064b"),
        escrow_obligation_unconditional: address!("0x01d31477aa1d223a80Eed95C1bceFa80d089a32F"),
        attestation_reference_escrow_obligation_default: address!(
            "0xff322C52a6413183792FbE27e1e810ceB49681d9"
        ),
        attestation_reference_escrow_obligation_unconditional: address!(
            "0x9ad58BE5E8250dd57554ad3CF9f8A235FDB24954"
        ),
    },
};

pub const ETHEREUM_SEPOLIA_ADDRESSES: DefaultExtensionConfig = DefaultExtensionConfig {
    arbiters_addresses: ArbitersAddresses {
        eas: address!("0xC2679fBD37d54388Ce493F1DB75320D236e1815e"),
        trivial_arbiter: address!("0x60Dea7f27bc89846833D6bACE9dad9EF782af642"),
        trusted_oracle_arbiter: address!("0x53517F742A7390deA3604206b66A2469E1CB8568"),
        commitment_trusted_oracle_arbiter: address!("0x1509cA51eBBD72cfA00134f3823C19D2B2771d3b"),
        intrinsics_arbiter: address!("0xEeDD6477e13c094aCd556093F2d6747C7fe39Ba7"),
        erc8004_arbiter: address!("0x40fF917fD34153159A0cC8545152D3D78D71e308"),
        references_escrow_arbiter: address!("0xc23c9d04D44c5DbE670aC4a4DbDDcc9fD5b427d6"),
        any_arbiter: address!("0x85Ea0f23b445274D362aE083fEf687C2c5678953"),
        all_arbiter: address!("0x63Dcb7272289D542F47BF432395aa1C2E5433634"),
        attester_arbiter: address!("0x5Feb12E6f0bc1E59E35bA9e6C045E195e9071952"),
        expiration_time_after_arbiter: address!("0x888436DdFE79aeDFB589AF4D27D04c78d10091ee"),
        expiration_time_before_arbiter: address!("0x8DCAe180E1ab21C92A7bfCc6D4E6edac48901C1C"),
        expiration_time_equal_arbiter: address!("0xC5c626B5Df414dd9e0A1912980947C7A97028b18"),
        recipient_arbiter: address!("0x9497262a1D684287C267Da62cB9c0d76500cFB82"),
        ref_uid_arbiter: address!("0x6770500a9ed5F990dCe9E8076fDbDB546b6b6eEc"),
        revocable_arbiter: address!("0xA2D8F8Eb6826CfaC815c84C6f1bcd2e31917bc04"),
        schema_arbiter: address!("0xE015c65a10d63f5E92d4827B5B7237A2Becd7234"),
        time_after_arbiter: address!("0x44c5f324CF2c068efd2E14ACDd54f0320901AD36"),
        time_before_arbiter: address!("0x80E343D826E5dba460C90ddb4bE064b173F723a0"),
        time_equal_arbiter: address!("0x41062C84256e40c8CBc89C9948b6597a9eFe1E53"),
        uid_arbiter: address!("0x45A700735FB979151A2CC140504Ec08563322167"),
        exclusive_revocable_confirmation_arbiter: address!(
            "0x174abA9406cecEabbEe50d5fc79349395725ED30"
        ),
        exclusive_unrevocable_confirmation_arbiter: address!(
            "0x6734e47E4b0ac0CbBB0B77B3fb826dd91c67dF79"
        ),
        nonexclusive_revocable_confirmation_arbiter: address!(
            "0xdF6eb180de4F146Bb9Bb703DDbB8bF3f0761a070"
        ),
        nonexclusive_unrevocable_confirmation_arbiter: address!(
            "0x45833200308028534AEC1DF1FF3DaE8a42d0857A"
        ),
    },
    string_obligation_addresses: StringObligationAddresses {
        eas: address!("0xC2679fBD37d54388Ce493F1DB75320D236e1815e"),
        obligation: address!("0x92e4A31c4204eDA513C97a6C238B6Ea85f97A20C"),
    },
    commit_reveal_obligation_addresses: CommitRevealObligationAddresses {
        eas: address!("0xC2679fBD37d54388Ce493F1DB75320D236e1815e"),
        obligation: address!("0xDC61f88A3129506319E6CC032F54414F774C76bb"),
    },
    erc20_addresses: Erc20Addresses {
        eas: address!("0xC2679fBD37d54388Ce493F1DB75320D236e1815e"),
        atomic_payment_utils: address!("0x79cff100A510e0F0e7f18690CC13F5BBFB1E3304"),
        escrow_obligation_default: address!("0xAcF53c13DaC16F5339925B6ef868C4Cd6A10dEdD"),
        escrow_obligation_unconditional: address!("0xA57042D7372d5C8D7B63935f85Aa907e056cE81E"),
        payment_obligation: address!("0xE3Ee61A399ef304dA80f8b994CA453E071e626D8"),
    },
    erc721_addresses: Erc721Addresses {
        eas: address!("0xC2679fBD37d54388Ce493F1DB75320D236e1815e"),
        atomic_payment_utils: address!("0x79cff100A510e0F0e7f18690CC13F5BBFB1E3304"),
        escrow_obligation_default: address!("0x3fb846B3BF47267350b3Dd5388C2Eec64B9f64eD"),
        escrow_obligation_unconditional: address!("0x5a36F46eEbEfF5Bc1aff2Ac10e68F3B397c2247A"),
        payment_obligation: address!("0x77Dea40229D73Be57836C58457BAd31CEB7F76Eb"),
    },
    erc1155_addresses: Erc1155Addresses {
        eas: address!("0xC2679fBD37d54388Ce493F1DB75320D236e1815e"),
        atomic_payment_utils: address!("0x79cff100A510e0F0e7f18690CC13F5BBFB1E3304"),
        escrow_obligation_default: address!("0xe19B5aAe789cADa9f9838CB6492892D4f9257FA5"),
        escrow_obligation_unconditional: address!("0xDe0fdfa44a6Cbd1861f712B82209c6504d1EC367"),
        payment_obligation: address!("0xa5dce45770b086ca9B94bE539f2f07ad295A33d8"),
    },
    native_token_addresses: NativeTokenAddresses {
        eas: address!("0xC2679fBD37d54388Ce493F1DB75320D236e1815e"),
        atomic_payment_utils: address!("0x79cff100A510e0F0e7f18690CC13F5BBFB1E3304"),
        escrow_obligation_default: address!("0xD183a6C2064732a6aea6aB99a7AD82B429cEf84c"),
        escrow_obligation_unconditional: address!("0x0e6227F1f0718d5eeFc99316092CA1a3CC437dE2"),
        payment_obligation: address!("0xE9d2d571223690cd4ED607baC928821A3490027E"),
    },
    token_bundle_addresses: TokenBundleAddresses {
        eas: address!("0xC2679fBD37d54388Ce493F1DB75320D236e1815e"),
        atomic_payment_utils: address!("0x79cff100A510e0F0e7f18690CC13F5BBFB1E3304"),
        escrow_obligation_default: address!("0x46143219C66Bc881544A87a764E9E699a7B36825"),
        escrow_obligation_unconditional: address!("0xDc59dF345dea522D54FB7D79543a2CD861E40d3b"),
        payment_obligation: address!("0xf81C2B5A816190A2c49AB16052E33ff6ae0bAD2f"),
    },
    hook_based_addresses: HookBasedAddresses {
        eas: address!("0xC2679fBD37d54388Ce493F1DB75320D236e1815e"),
        hook_escrow_obligation: address!("0x33Ac7EF225195af907F26F41D7338Ccf12696645"),
        hooks_escrow_obligation: address!("0x49Aca5C9Cf0C61C38B99c3a462517c6E37Ae2D28"),
        erc20_escrow_hook: address!("0x6EAD59f2EB3149B876682FceD53e6432E599Cd93"),
        erc721_escrow_hook: address!("0xb986720B58f7D27599544268758888b85Ba89ded"),
        erc1155_escrow_hook: address!("0x6CbB5166676BA59A535352042AA767F02C7bAE63"),
        native_token_escrow_hook: address!("0x0eC191E21808eC4eF0a581C57115eb3Be73A31f8"),
        attestation_escrow_hook: address!("0x7b6e3a5bC939c4ecE08d5622cD937aCA79f82c2d"),
        attestation_reference_escrow_hook: address!("0x6C65e7237D8b34DB97d55E044876d4169350EDfE"),
    },
    splitters_addresses: SplittersAddresses {
        erc20_splitter: address!("0x564239fcb7018cbC090B0Bd6d6734881c3273578"),
        erc1155_splitter: address!("0xd49669e2c4D90ec3d6f6fB8685c4D49297D123eA"),
        native_token_splitter: address!("0xE5E04525187025fEA7742325828fb3Bb2D7d88d2"),
        token_bundle_splitter: address!("0x913F92ff33E900303aC6668948818E8866bCe61d"),
        token_bundle_splitter_unvalidated: address!("0xD2CF1aeE77fbF238AF484DB35bd8477Dc430FEf7"),
        commitment_erc20_splitter: address!("0xb6209F00BdcfC4fA8EF355842f00874321DAA01a"),
        commitment_erc1155_splitter: address!("0xB77d903Ad9ade33A4b2730F1f07E0aFBb5263D9A"),
        commitment_native_token_splitter: address!("0x2cAfa083086e42013f05ff5F84CC69feb5D0B8AA"),
        commitment_token_bundle_splitter: address!("0x1a3A07C9649D46a0f75C44b2E51407575E0b763A"),
        commitment_token_bundle_splitter_unvalidated: address!(
            "0xc6370A8B067E7Be7adaea6c4b79062EB0e9fA95c"
        ),
    },
    attestation_addresses: AttestationAddresses {
        eas: address!("0xC2679fBD37d54388Ce493F1DB75320D236e1815e"),
        eas_schema_registry: address!("0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0"),
        atomic_attestation_utils: address!("0x027E8d4DC75C28c6d298dE63E86e24A8126283c5"),
        escrow_obligation_default: address!("0xaBd9bAB75BA9Ba9eF300B180Aff552aa6f2741fd"),
        escrow_obligation_unconditional: address!("0x9c07Bb1A9B2609021C0e280B104efA2bcbb5bcaB"),
        attestation_reference_escrow_obligation_default: address!(
            "0x3e9DD609A0Bcfe7A40480B61E6Ad275c96C1E6A4"
        ),
        attestation_reference_escrow_obligation_unconditional: address!(
            "0xf10C4dfaEF05a7e8bbd2B66d37b29D10Fb0a4B86"
        ),
    },
};

pub const MONAD_TESTNET_ADDRESSES: DefaultExtensionConfig = DefaultExtensionConfig {
    arbiters_addresses: ArbitersAddresses {
        eas: address!("0xeEB66949FEaB4e0b43C7b8100c796F7dfE957b10"),
        trivial_arbiter: address!("0x6ab2079cd54A91895b6184118d58c106387EF653"),
        trusted_oracle_arbiter: address!("0xe2dAe1C6627a88f34CD43aBa3A7c0972042A2afE"),
        commitment_trusted_oracle_arbiter: address!("0x0Fb4b2C566EFD1A264709Dfb363D6f022E5DDd8F"),
        intrinsics_arbiter: address!("0xE923ca73F70a9eDfd36eA202C5964700B3f596b6"),
        erc8004_arbiter: address!("0xaaD33b541E4C55E58bcCe9cAbC242c939D134f41"),
        references_escrow_arbiter: address!("0x24afa9a8De66E4447717cd39440973878E8E45D3"),
        any_arbiter: address!("0xa6f47524148D2A5304779C5F9c536786Bc553e49"),
        all_arbiter: address!("0x08aF8e62a6508F357bd501d1e1223d38912bc708"),
        attester_arbiter: address!("0x036922eBCB8cCf7c117015EE7C3fE85dB71EC81f"),
        expiration_time_after_arbiter: address!("0xd89D75E0C94027f57a15AfaD4B7f3Ef34f674d41"),
        expiration_time_before_arbiter: address!("0x4DF3BA02dE10EF594Ab1BBc790d343D0C4A304eA"),
        expiration_time_equal_arbiter: address!("0x2BB94a4E6eC0D81dE7f81007b572Ac09A5BE37b4"),
        recipient_arbiter: address!("0x3c79a0225380fB6F3CB990FfC4E3D5aF4546b524"),
        ref_uid_arbiter: address!("0x10788ba2c4c65D1E97Bc6005436b61C2C2E51572"),
        revocable_arbiter: address!("0xED550301B3258612509615bbDDD4B2383cF32df4"),
        schema_arbiter: address!("0x6E9Bc0d34FfF16140401fC51653347Be0A1F0Ec0"),
        time_after_arbiter: address!("0x5f1dB54DBc5006894Ef6C43b2174C05ccaA250ec"),
        time_before_arbiter: address!("0xbB022fc36D0cc97B6cAe5a2E15d45B7a9aD46F99"),
        time_equal_arbiter: address!("0x235792a6d077a04FB190a19F362AcEcAB7866Ab5"),
        uid_arbiter: address!("0xD8b6199aa91992f5d3bAFDdC3372B391e46C92cE"),
        exclusive_revocable_confirmation_arbiter: address!(
            "0xE82EBB37FD7835798F8F7860683FEe29C8EBE796"
        ),
        exclusive_unrevocable_confirmation_arbiter: address!(
            "0xd31445b7CaC686C9917Fba62e76098b02C8d280c"
        ),
        nonexclusive_revocable_confirmation_arbiter: address!(
            "0x182EA2DA239590Ae10f9DEcCfb07ceD78591Aa12"
        ),
        nonexclusive_unrevocable_confirmation_arbiter: address!(
            "0x71A1437A3D921CD0CF98e4B7a3569FbfA86b833B"
        ),
    },
    string_obligation_addresses: StringObligationAddresses {
        eas: address!("0xeEB66949FEaB4e0b43C7b8100c796F7dfE957b10"),
        obligation: address!("0x336F2F91B093001edD90e49216422B33b8b4E03B"),
    },
    commit_reveal_obligation_addresses: CommitRevealObligationAddresses {
        eas: address!("0xeEB66949FEaB4e0b43C7b8100c796F7dfE957b10"),
        obligation: address!("0x4b9B6ff4A7c2BC89EeE6F28355B9A94E6649bbF8"),
    },
    erc20_addresses: Erc20Addresses {
        eas: address!("0xeEB66949FEaB4e0b43C7b8100c796F7dfE957b10"),
        atomic_payment_utils: address!("0xD56bD862e7BEbD0BD7356603e9E52B32c241E2AE"),
        escrow_obligation_default: address!("0x96C14B182cD99a09dDdDc6B755ba0c4Ed3D6991c"),
        escrow_obligation_unconditional: address!("0x903caa028b1848ab8Fdd15C4CCD20C4E7be2B1C0"),
        payment_obligation: address!("0xDcC1104325d9D99c6BD5faa0804A7d743f3D0c20"),
    },
    erc721_addresses: Erc721Addresses {
        eas: address!("0xeEB66949FEaB4e0b43C7b8100c796F7dfE957b10"),
        atomic_payment_utils: address!("0xD56bD862e7BEbD0BD7356603e9E52B32c241E2AE"),
        escrow_obligation_default: address!("0xab43CCE34a7b831Fa7Ab134bCDc21a6bA20882B6"),
        escrow_obligation_unconditional: address!("0xb63cF08C6623F69D2Ad34E37b8A68ccA6c125d49"),
        payment_obligation: address!("0xAeeddD0a2f24f7286EAE7e7fa5CEa746fcF064fc"),
    },
    erc1155_addresses: Erc1155Addresses {
        eas: address!("0xeEB66949FEaB4e0b43C7b8100c796F7dfE957b10"),
        atomic_payment_utils: address!("0xD56bD862e7BEbD0BD7356603e9E52B32c241E2AE"),
        escrow_obligation_default: address!("0x2129F46737135FE4EBb3c49953487122088bC739"),
        escrow_obligation_unconditional: address!("0x66b7398B2bb322Bb4a480aE370142c02c52b886a"),
        payment_obligation: address!("0x553E4DE0916074201a9d32123eFcc8F734ee5675"),
    },
    native_token_addresses: NativeTokenAddresses {
        eas: address!("0xeEB66949FEaB4e0b43C7b8100c796F7dfE957b10"),
        atomic_payment_utils: address!("0xD56bD862e7BEbD0BD7356603e9E52B32c241E2AE"),
        escrow_obligation_default: address!("0x2963e27976E765105fAF613Bae049ff8a3939E35"),
        escrow_obligation_unconditional: address!("0x0965d908C552c2F7a13Cf41D42fcE4f4F2f512B5"),
        payment_obligation: address!("0x785aE79F247155Afe93E24119790667096281EAb"),
    },
    token_bundle_addresses: TokenBundleAddresses {
        eas: address!("0xeEB66949FEaB4e0b43C7b8100c796F7dfE957b10"),
        atomic_payment_utils: address!("0xD56bD862e7BEbD0BD7356603e9E52B32c241E2AE"),
        escrow_obligation_default: address!("0x11C3931F2715d8fca8ea5ca79fAc4BbBCDBe9903"),
        escrow_obligation_unconditional: address!("0x0c19138441E1bEe2964e65e0Edf1702d59a2E786"),
        payment_obligation: address!("0x7F8E031C82216071b0B9e7d5116640BF34Af120e"),
    },
    hook_based_addresses: HookBasedAddresses {
        eas: address!("0xeEB66949FEaB4e0b43C7b8100c796F7dfE957b10"),
        hook_escrow_obligation: address!("0x194C3Da79a1De5f9141b1DbCdF98eC5d511B4E5a"),
        hooks_escrow_obligation: address!("0xFeaA2fa295d1453BA382b7eE0e3F66c489A6d9Bb"),
        erc20_escrow_hook: address!("0x831B40aE79D391C7d56209802b9745Fe0743DBF5"),
        erc721_escrow_hook: address!("0xB3D71c6f96cdD41e56dd9870b232225C379f2890"),
        erc1155_escrow_hook: address!("0xa740634E718c8727853D1E69963303D5cB8Ea44C"),
        native_token_escrow_hook: address!("0xE571D48D05962C57c95e48b8A7375466D1d02487"),
        attestation_escrow_hook: address!("0xbD90aF50Fb667724338EB8DA541f923F1822ac3C"),
        attestation_reference_escrow_hook: address!("0xbCCE130337F2D8029982a14471d8686AFceF20fF"),
    },
    splitters_addresses: SplittersAddresses {
        erc20_splitter: address!("0x98D5bC7593143E55e9949da97603126CAe0BfD7F"),
        erc1155_splitter: address!("0xE0d55949E6e1590F26eF37a1D01df52Fbb1b2FcE"),
        native_token_splitter: address!("0x546526311E6639399FdC583dF84eEe8b123D79d5"),
        token_bundle_splitter: address!("0xe8d45cf2471882730a7e0ac142966DF07ae148d4"),
        token_bundle_splitter_unvalidated: address!("0x9D5817Ff5519f45bf8ed6C3ADa638b874DBCb540"),
        commitment_erc20_splitter: address!("0x2725A6869b42eDfD155889098408CcB3b1ed060e"),
        commitment_erc1155_splitter: address!("0x014aA3DC53004B50bC13aa1D85A83bccA5c0671a"),
        commitment_native_token_splitter: address!("0x1c21A8fB4F69ADb0ccDd22D8C125F8689bf227AF"),
        commitment_token_bundle_splitter: address!("0xaA9aEf96068f2BE679ae8781A4fC33FF4798758F"),
        commitment_token_bundle_splitter_unvalidated: address!(
            "0x66c3f78258823B9B899aB14B11e1DCf978c060D7"
        ),
    },
    attestation_addresses: AttestationAddresses {
        eas: address!("0xeEB66949FEaB4e0b43C7b8100c796F7dfE957b10"),
        eas_schema_registry: address!("0x321E37E27cB9B5E948208f32dCfA256ef695EAF8"),
        atomic_attestation_utils: address!("0x7B20A4b25af2a2637C240622d6C3875DeA609A64"),
        escrow_obligation_default: address!("0x61dC9c2D757A1C9D0d38A281288d9ef918e77Baa"),
        escrow_obligation_unconditional: address!("0x49026902790A8ECb427f335cA0d097c7C5795d13"),
        attestation_reference_escrow_obligation_default: address!(
            "0xb6890A8Cb8CDeFcE11Edc0314125b750F48BFF1B"
        ),
        attestation_reference_escrow_obligation_unconditional: address!(
            "0x81dC8f2C5677b02aFcAFef34Fa7E75D55dfAEF20"
        ),
    },
};

const fn unreleased_alkahest_addresses(
    eas: Address,
    eas_schema_registry: Address,
) -> DefaultExtensionConfig {
    DefaultExtensionConfig {
        arbiters_addresses: ArbitersAddresses {
            eas,
            trivial_arbiter: Address::ZERO,
            trusted_oracle_arbiter: Address::ZERO,
            commitment_trusted_oracle_arbiter: Address::ZERO,
            intrinsics_arbiter: Address::ZERO,
            erc8004_arbiter: Address::ZERO,
            references_escrow_arbiter: Address::ZERO,
            any_arbiter: Address::ZERO,
            all_arbiter: Address::ZERO,
            attester_arbiter: Address::ZERO,
            expiration_time_after_arbiter: Address::ZERO,
            expiration_time_before_arbiter: Address::ZERO,
            expiration_time_equal_arbiter: Address::ZERO,
            recipient_arbiter: Address::ZERO,
            ref_uid_arbiter: Address::ZERO,
            revocable_arbiter: Address::ZERO,
            schema_arbiter: Address::ZERO,
            time_after_arbiter: Address::ZERO,
            time_before_arbiter: Address::ZERO,
            time_equal_arbiter: Address::ZERO,
            uid_arbiter: Address::ZERO,
            exclusive_revocable_confirmation_arbiter: Address::ZERO,
            exclusive_unrevocable_confirmation_arbiter: Address::ZERO,
            nonexclusive_revocable_confirmation_arbiter: Address::ZERO,
            nonexclusive_unrevocable_confirmation_arbiter: Address::ZERO,
        },
        string_obligation_addresses: StringObligationAddresses {
            eas,
            obligation: Address::ZERO,
        },
        commit_reveal_obligation_addresses: CommitRevealObligationAddresses {
            eas,
            obligation: Address::ZERO,
        },
        erc20_addresses: Erc20Addresses {
            eas,
            atomic_payment_utils: Address::ZERO,
            escrow_obligation_default: Address::ZERO,
            escrow_obligation_unconditional: Address::ZERO,
            payment_obligation: Address::ZERO,
        },
        erc721_addresses: Erc721Addresses {
            eas,
            atomic_payment_utils: Address::ZERO,
            escrow_obligation_default: Address::ZERO,
            escrow_obligation_unconditional: Address::ZERO,
            payment_obligation: Address::ZERO,
        },
        erc1155_addresses: Erc1155Addresses {
            eas,
            atomic_payment_utils: Address::ZERO,
            escrow_obligation_default: Address::ZERO,
            escrow_obligation_unconditional: Address::ZERO,
            payment_obligation: Address::ZERO,
        },
        native_token_addresses: NativeTokenAddresses {
            eas,
            atomic_payment_utils: Address::ZERO,
            escrow_obligation_default: Address::ZERO,
            escrow_obligation_unconditional: Address::ZERO,
            payment_obligation: Address::ZERO,
        },
        token_bundle_addresses: TokenBundleAddresses {
            eas,
            atomic_payment_utils: Address::ZERO,
            escrow_obligation_default: Address::ZERO,
            escrow_obligation_unconditional: Address::ZERO,
            payment_obligation: Address::ZERO,
        },
        hook_based_addresses: HookBasedAddresses {
            eas,
            hook_escrow_obligation: Address::ZERO,
            hooks_escrow_obligation: Address::ZERO,
            erc20_escrow_hook: Address::ZERO,
            erc721_escrow_hook: Address::ZERO,
            erc1155_escrow_hook: Address::ZERO,
            native_token_escrow_hook: Address::ZERO,
            attestation_escrow_hook: Address::ZERO,
            attestation_reference_escrow_hook: Address::ZERO,
        },
        splitters_addresses: SplittersAddresses {
            erc20_splitter: Address::ZERO,
            erc1155_splitter: Address::ZERO,
            native_token_splitter: Address::ZERO,
            token_bundle_splitter: Address::ZERO,
            token_bundle_splitter_unvalidated: Address::ZERO,
            commitment_erc20_splitter: Address::ZERO,
            commitment_erc1155_splitter: Address::ZERO,
            commitment_native_token_splitter: Address::ZERO,
            commitment_token_bundle_splitter: Address::ZERO,
            commitment_token_bundle_splitter_unvalidated: Address::ZERO,
        },
        attestation_addresses: AttestationAddresses {
            eas,
            eas_schema_registry,
            atomic_attestation_utils: Address::ZERO,
            escrow_obligation_default: Address::ZERO,
            escrow_obligation_unconditional: Address::ZERO,
            attestation_reference_escrow_obligation_default: Address::ZERO,
            attestation_reference_escrow_obligation_unconditional: Address::ZERO,
        },
    }
}

pub const GENLAYER_BRADBURY_ADDRESSES: DefaultExtensionConfig = unreleased_alkahest_addresses(
    address!("0xaC18Fa0DE3123215404a0C5f6d02ed9B2D0D0d98"),
    address!("0xA1F9076932f6eEA0D90BBfA1D6E81D001012645D"),
);

pub const ETHEREUM_ADDRESSES: DefaultExtensionConfig = unreleased_alkahest_addresses(
    address!("0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587"),
    address!("0xA7b39296258348C78294F95B872b282326A97BDF"),
);
