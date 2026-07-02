import { decodeAbiParameters, encodeAbiParameters, getAbiItem } from "viem";
import { abi as hookEscrowAbi } from "../../../contracts/obligations/escrow/hook-based/HookEscrowObligation";
import { abi as hooksEscrowAbi } from "../../../contracts/obligations/escrow/hook-based/HooksEscrowObligation";
import { abi as attestationEscrowHookAbi } from "../../../contracts/obligations/escrow/hook-based/hooks/AttestationEscrowHook";
import { abi as attestationReferenceEscrowHookAbi } from "../../../contracts/obligations/escrow/hook-based/hooks/AttestationReferenceEscrowHook";
import { abi as erc20EscrowHookAbi } from "../../../contracts/obligations/escrow/hook-based/hooks/ERC20EscrowHook";
import { abi as erc721EscrowHookAbi } from "../../../contracts/obligations/escrow/hook-based/hooks/ERC721EscrowHook";
import { abi as erc1155EscrowHookAbi } from "../../../contracts/obligations/escrow/hook-based/hooks/ERC1155EscrowHook";
import { abi as nativeTokenEscrowHookAbi } from "../../../contracts/obligations/escrow/hook-based/hooks/NativeTokenEscrowHook";
import { abi as erc20Abi } from "../../../contracts/ERC20Permit";
import { abi as erc721Abi } from "../../../contracts/IERC721";
import { abi as erc1155Abi } from "../../../contracts/IERC1155";
import type { ChainAddresses } from "../../../types";
import { getAttestation, getAttestedEventFromTxHash, readContract, type ViemClient, writeContract } from "../../../utils";

/**
 * Security note: the underlying hook-based escrow contracts and hooks were not
 * included in professional manual audits and have only been reviewed by
 * automated audit tooling so far.
 */

/** Deployed hook-based escrow and hook contract addresses. */
export type HookBasedAddresses = {
  eas: `0x${string}`;
  hookEscrowObligation: `0x${string}`;
  hooksEscrowObligation: `0x${string}`;
  erc20EscrowHook: `0x${string}`;
  erc721EscrowHook: `0x${string}`;
  erc1155EscrowHook: `0x${string}`;
  nativeTokenEscrowHook: `0x${string}`;
  attestationEscrowHook: `0x${string}`;
  attestationReferenceEscrowHook: `0x${string}`;
};

/** Pick hook-based escrow addresses from a full chain address map. */
export const pickHookBasedAddresses = (addresses: ChainAddresses): HookBasedAddresses => ({
  eas: addresses.eas,
  hookEscrowObligation: addresses.hookEscrowObligation,
  hooksEscrowObligation: addresses.hooksEscrowObligation,
  erc20EscrowHook: addresses.erc20EscrowHook,
  erc721EscrowHook: addresses.erc721EscrowHook,
  erc1155EscrowHook: addresses.erc1155EscrowHook,
  nativeTokenEscrowHook: addresses.nativeTokenEscrowHook,
  attestationEscrowHook: addresses.attestationEscrowHook,
  attestationReferenceEscrowHook: addresses.attestationReferenceEscrowHook,
});

const hookEscrowObligationDataType = getAbiItem({ abi: hookEscrowAbi.abi, name: "doObligation" }).inputs[0];
const hooksEscrowObligationDataType = getAbiItem({ abi: hooksEscrowAbi.abi, name: "doObligation" }).inputs[0];

const erc20HookDataType = getAbiItem({ abi: erc20EscrowHookAbi.abi, name: "encodeHookData" }).inputs[0];
const erc721HookDataType = getAbiItem({ abi: erc721EscrowHookAbi.abi, name: "encodeHookData" }).inputs[0];
const erc1155HookDataType = getAbiItem({ abi: erc1155EscrowHookAbi.abi, name: "encodeHookData" }).inputs[0];
const nativeTokenHookDataType = getAbiItem({ abi: nativeTokenEscrowHookAbi.abi, name: "encodeHookData" }).inputs[0];
const attestationHookDataType = getAbiItem({ abi: attestationEscrowHookAbi.abi, name: "encodeHookData" }).inputs[0];
const attestationReferenceHookDataType = getAbiItem({
  abi: attestationReferenceEscrowHookAbi.abi,
  name: "encodeHookData",
}).inputs[0];

/** Obligation data for a hook-based escrow with one hook. */
export type HookEscrowObligationData = {
  /** Arbiter contract that validates fulfillment. */
  arbiter: `0x${string}`;
  /** ABI-encoded arbiter demand. */
  demand: `0x${string}`;
  /** Hook contract that locks and releases escrowed assets. */
  hook: `0x${string}`;
  /** ABI-encoded hook-specific escrow data. */
  hookData: `0x${string}`;
};

/** Obligation data for a hook-based escrow with multiple hooks. */
export type HooksEscrowObligationData = {
  /** Arbiter contract that validates fulfillment. */
  arbiter: `0x${string}`;
  /** ABI-encoded arbiter demand. */
  demand: `0x${string}`;
  /** Hook contracts that lock and release escrowed assets. */
  hooks: `0x${string}`[];
  /** ABI-encoded hook-specific escrow data by index. */
  hookDatas: `0x${string}`[];
  /** Native-token values sent to each hook by index. */
  values: bigint[];
};

/** Hook data for ERC20 amount escrows. */
export type AmountSplitHookData = {
  token: `0x${string}`;
  amount: bigint;
};

/** Hook data for single-token-ID escrows. */
export type TokenIdHookData = {
  token: `0x${string}`;
  tokenId: bigint;
};

/** Hook data for ERC1155 amount escrows. */
export type Erc1155HookData = TokenIdHookData & {
  amount: bigint;
};

/** Hook data for native-token escrows. */
export type NativeTokenHookData = {
  amount: bigint;
};

/** Hook data for creating an EAS attestation as an escrow asset. */
export type AttestationEscrowHookData = {
  attestation: {
    schema: `0x${string}`;
    data: {
      recipient: `0x${string}`;
      expirationTime: bigint;
      revocable: boolean;
      refUID: `0x${string}`;
      data: `0x${string}`;
      value: bigint;
    };
  };
};

/** Hook data for escrowing a reference to an existing attestation. */
export type AttestationReferenceEscrowHookData = {
  referencedAttestationUid: `0x${string}`;
  recipient: `0x${string}`;
  expirationTime: bigint;
};

/** ABI-encode single-hook escrow obligation data. */
export const encodeHookEscrowObligation = (data: HookEscrowObligationData): `0x${string}` =>
  encodeAbiParameters([hookEscrowObligationDataType], [data]);

/** Decode ABI-encoded single-hook escrow obligation data. */
export const decodeHookEscrowObligation = (data: `0x${string}`): HookEscrowObligationData =>
  decodeAbiParameters([hookEscrowObligationDataType], data)[0] as HookEscrowObligationData;

/** ABI-encode multi-hook escrow obligation data. */
export const encodeHooksEscrowObligation = (data: HooksEscrowObligationData): `0x${string}` =>
  encodeAbiParameters([hooksEscrowObligationDataType], [data]);

/** Decode ABI-encoded multi-hook escrow obligation data. */
export const decodeHooksEscrowObligation = (data: `0x${string}`): HooksEscrowObligationData =>
  decodeAbiParameters([hooksEscrowObligationDataType], data)[0] as HooksEscrowObligationData;

const makeSingleEscrowClient = (viemClient: ViemClient, addresses: HookBasedAddresses) => {
  const getSchema = async () =>
    await viemClient.readContract({
      address: addresses.hookEscrowObligation,
      abi: hookEscrowAbi.abi,
      functionName: "ATTESTATION_SCHEMA",
      authorizationList: undefined,
    });

  return {
    address: addresses.hookEscrowObligation,
    getSchema,
    encodeObligation: encodeHookEscrowObligation,
    decodeObligation: decodeHookEscrowObligation,
    getObligation: async (uid: `0x${string}`) => {
      const [attestation, schema] = await Promise.all([getAttestation(viemClient, uid, addresses), getSchema()]);
      if (attestation.schema !== schema) throw new Error(`Unsupported schema: ${attestation.schema}`);
      return { ...attestation, data: decodeHookEscrowObligation(attestation.data) };
    },
    create: async (data: HookEscrowObligationData, expiration: bigint, value = 0n) => {
      const hash = await writeContract(viemClient, {
        address: addresses.hookEscrowObligation,
        abi: hookEscrowAbi.abi,
        functionName: "doObligation",
        args: [data, expiration],
        value,
      } as unknown as Parameters<typeof writeContract>[1]);
      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },
    createFor: async (data: HookEscrowObligationData, expiration: bigint, recipient: `0x${string}`, value = 0n) => {
      const hash = await writeContract(viemClient, {
        address: addresses.hookEscrowObligation,
        abi: hookEscrowAbi.abi,
        functionName: "doObligationFor",
        args: [data, expiration, recipient],
        value,
      } as unknown as Parameters<typeof writeContract>[1]);
      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },
    collect: async (escrow: `0x${string}`, fulfillment: `0x${string}`) =>
      await writeContract(viemClient, {
        address: addresses.hookEscrowObligation,
        abi: hookEscrowAbi.abi,
        functionName: "collect",
        args: [escrow, fulfillment],
      }),
    reclaim: async (escrow: `0x${string}`) =>
      await writeContract(viemClient, {
        address: addresses.hookEscrowObligation,
        abi: hookEscrowAbi.abi,
        functionName: "reclaim",
        args: [escrow],
      }),
  };
};

const makeMultiEscrowClient = (viemClient: ViemClient, addresses: HookBasedAddresses) => {
  const getSchema = async () =>
    await viemClient.readContract({
      address: addresses.hooksEscrowObligation,
      abi: hooksEscrowAbi.abi,
      functionName: "ATTESTATION_SCHEMA",
      authorizationList: undefined,
    });

  return {
    address: addresses.hooksEscrowObligation,
    getSchema,
    encodeObligation: encodeHooksEscrowObligation,
    decodeObligation: decodeHooksEscrowObligation,
    getObligation: async (uid: `0x${string}`) => {
      const [attestation, schema] = await Promise.all([getAttestation(viemClient, uid, addresses), getSchema()]);
      if (attestation.schema !== schema) throw new Error(`Unsupported schema: ${attestation.schema}`);
      return { ...attestation, data: decodeHooksEscrowObligation(attestation.data) };
    },
    create: async (data: HooksEscrowObligationData, expiration: bigint, value = data.values.reduce((a, b) => a + b, 0n)) => {
      const hash = await writeContract(viemClient, {
        address: addresses.hooksEscrowObligation,
        abi: hooksEscrowAbi.abi,
        functionName: "doObligation",
        args: [data, expiration],
        value,
      } as unknown as Parameters<typeof writeContract>[1]);
      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },
    createFor: async (
      data: HooksEscrowObligationData,
      expiration: bigint,
      recipient: `0x${string}`,
      value = data.values.reduce((a, b) => a + b, 0n),
    ) => {
      const hash = await writeContract(viemClient, {
        address: addresses.hooksEscrowObligation,
        abi: hooksEscrowAbi.abi,
        functionName: "doObligationFor",
        args: [data, expiration, recipient],
        value,
      } as unknown as Parameters<typeof writeContract>[1]);
      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },
    collect: async (escrow: `0x${string}`, fulfillment: `0x${string}`) =>
      await writeContract(viemClient, {
        address: addresses.hooksEscrowObligation,
        abi: hooksEscrowAbi.abi,
        functionName: "collect",
        args: [escrow, fulfillment],
      }),
    reclaim: async (escrow: `0x${string}`) =>
      await writeContract(viemClient, {
        address: addresses.hooksEscrowObligation,
        abi: hooksEscrowAbi.abi,
        functionName: "reclaim",
        args: [escrow],
      }),
  };
};

export const makeHookBasedClient = (viemClient: ViemClient, addresses: HookBasedAddresses) => ({
  escrow: {
    single: makeSingleEscrowClient(viemClient, addresses),
    multi: makeMultiEscrowClient(viemClient, addresses),
  },
  hooks: {
    erc20: {
      address: addresses.erc20EscrowHook,
      encodeHookData: (data: AmountSplitHookData) => encodeAbiParameters([erc20HookDataType], [data]),
      decodeHookData: (data: `0x${string}`) => decodeAbiParameters([erc20HookDataType], data)[0] as AmountSplitHookData,
      approve: async (token: AmountSplitHookData) =>
        await writeContract(viemClient, {
          address: token.token,
          abi: erc20Abi.abi,
          functionName: "approve",
          args: [addresses.erc20EscrowHook, token.amount],
        }),
      deposit: async (caller: `0x${string}`, token: `0x${string}`) =>
        await readContract<bigint>(viemClient, {
          address: addresses.erc20EscrowHook,
          abi: erc20EscrowHookAbi.abi,
          functionName: "deposits",
          args: [caller, token],
        }),
    },
    erc721: {
      address: addresses.erc721EscrowHook,
      encodeHookData: (data: TokenIdHookData) => encodeAbiParameters([erc721HookDataType], [data]),
      decodeHookData: (data: `0x${string}`) => decodeAbiParameters([erc721HookDataType], data)[0] as TokenIdHookData,
      approve: async (token: TokenIdHookData) =>
        await writeContract(viemClient, {
          address: token.token,
          abi: erc721Abi.abi,
          functionName: "approve",
          args: [addresses.erc721EscrowHook, token.tokenId],
        }),
      deposit: async (caller: `0x${string}`, token: `0x${string}`, tokenId: bigint) =>
        await readContract<boolean>(viemClient, {
          address: addresses.erc721EscrowHook,
          abi: erc721EscrowHookAbi.abi,
          functionName: "deposits",
          args: [caller, token, tokenId],
        }),
    },
    erc1155: {
      address: addresses.erc1155EscrowHook,
      encodeHookData: (data: Erc1155HookData) => encodeAbiParameters([erc1155HookDataType], [data]),
      decodeHookData: (data: `0x${string}`) => decodeAbiParameters([erc1155HookDataType], data)[0] as Erc1155HookData,
      setApprovalForAll: async (token: `0x${string}`, approved = true) =>
        await writeContract(viemClient, {
          address: token,
          abi: erc1155Abi.abi,
          functionName: "setApprovalForAll",
          args: [addresses.erc1155EscrowHook, approved],
        }),
      deposit: async (caller: `0x${string}`, token: `0x${string}`, tokenId: bigint) =>
        await readContract<bigint>(viemClient, {
          address: addresses.erc1155EscrowHook,
          abi: erc1155EscrowHookAbi.abi,
          functionName: "deposits",
          args: [caller, token, tokenId],
        }),
    },
    nativeToken: {
      address: addresses.nativeTokenEscrowHook,
      encodeHookData: (data: NativeTokenHookData) => encodeAbiParameters([nativeTokenHookDataType], [data]),
      decodeHookData: (data: `0x${string}`) => decodeAbiParameters([nativeTokenHookDataType], data)[0] as NativeTokenHookData,
      deposit: async (caller: `0x${string}`) =>
        await readContract<bigint>(viemClient, {
          address: addresses.nativeTokenEscrowHook,
          abi: nativeTokenEscrowHookAbi.abi,
          functionName: "deposits",
          args: [caller],
        }),
    },
    attestation: {
      address: addresses.attestationEscrowHook,
      encodeHookData: (data: AttestationEscrowHookData) => encodeAbiParameters([attestationHookDataType], [data]),
      decodeHookData: (data: `0x${string}`) =>
        decodeAbiParameters([attestationHookDataType], data)[0] as AttestationEscrowHookData,
    },
    attestationReference: {
      address: addresses.attestationReferenceEscrowHook,
      encodeHookData: (data: AttestationReferenceEscrowHookData) =>
        encodeAbiParameters([attestationReferenceHookDataType], [data]),
      decodeHookData: (data: `0x${string}`) =>
        decodeAbiParameters([attestationReferenceHookDataType], data)[0] as AttestationReferenceEscrowHookData,
    },
  },
});

export type HookBasedClient = ReturnType<typeof makeHookBasedClient>;
