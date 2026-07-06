import { decodeAbiParameters, encodeAbiParameters, getAbiItem } from "viem";
import { abi as erc1155PaymentAbi } from "../../../contracts/obligations/payment/ERC1155PaymentObligation";
import { abi as atomicPaymentUtilsAbi } from "../../../contracts/utils/AtomicPaymentUtils";
import type { Erc1155 } from "../../../types";
import { getAttestation, getAttestedEventFromTxHash, type ViemClient, writeContract } from "../../../utils";
import { getAtomicPaymentEscrowAttestation, type AtomicPaymentOptions } from "../../../utils/contractSafety";
import type { Erc1155Addresses } from "./index";
import { makeErc1155UtilClient } from "./util";

const erc1155PaymentDecodeFunction = getAbiItem({
  abi: erc1155PaymentAbi.abi,
  name: "decodeObligationData",
});

const erc1155PaymentObligationDataType = erc1155PaymentDecodeFunction.outputs[0];

/**
 * ERC1155 Payment ObligationData type
 */
export type Erc1155PaymentObligationData = {
  token: `0x${string}`;
  tokenId: bigint;
  amount: bigint;
  payee: `0x${string}`;
};

/**
 * Encodes ERC1155PaymentObligation.ObligationData to bytes.
 * @param data - struct ObligationData {address token, uint256 tokenId, uint256 amount, address payee}
 * @returns abi encoded bytes
 */
export const encodeObligation = (data: Erc1155PaymentObligationData): `0x${string}` => {
  return encodeAbiParameters([erc1155PaymentObligationDataType], [data]);
};

/**
 * Decodes ERC1155PaymentObligation.ObligationData from bytes.
 * @param obligationData - ObligationData as abi encoded bytes
 * @returns the decoded ObligationData object
 */
export const decodeObligation = (obligationData: `0x${string}`): Erc1155PaymentObligationData => {
  return decodeAbiParameters([erc1155PaymentObligationDataType], obligationData)[0] as Erc1155PaymentObligationData;
};

export type Erc1155PaymentClient = ReturnType<typeof makeErc1155PaymentClient>;

export const makeErc1155PaymentClient = (viemClient: ViemClient, addresses: Erc1155Addresses) => {
  const util = makeErc1155UtilClient(viemClient, addresses);

  const getSchema = async () =>
    await viemClient.readContract({
      address: addresses.paymentObligation,
      abi: erc1155PaymentAbi.abi,
      functionName: "ATTESTATION_SCHEMA",
      authorizationList: undefined,
    });

  return {
    address: addresses.paymentObligation,
    atomicPaymentUtilsAddress: addresses.atomicPaymentUtils,
    getSchema,

    encodeObligationRaw: (data: { token: `0x${string}`; tokenId: bigint; amount: bigint; payee: `0x${string}` }) => {
      return encodeAbiParameters([erc1155PaymentObligationDataType], [data]);
    },

    encodeObligation: (token: Erc1155, payee: `0x${string}`) => {
      return encodeAbiParameters(
        [erc1155PaymentObligationDataType],
        [
          {
            token: token.address,
            tokenId: token.id,
            amount: token.value,
            payee,
          },
        ],
      );
    },

    decodeObligation: (obligationData: `0x${string}`) => {
      return decodeAbiParameters([erc1155PaymentObligationDataType], obligationData)[0];
    },

    getObligation: async (uid: `0x${string}`) => {
      const [attestation, schema] = await Promise.all([getAttestation(viemClient, uid, addresses), getSchema()]);

      if (attestation.schema !== schema) {
        throw new Error(`Unsupported schema: ${attestation.schema}`);
      }
      const data = decodeAbiParameters([erc1155PaymentObligationDataType], attestation.data)[0];

      return {
        ...attestation,
        data,
      };
    },

    pay: async (
      price: Erc1155,
      payee: `0x${string}`,
      refUID: `0x${string}` = "0x0000000000000000000000000000000000000000000000000000000000000000",
    ) => {
      const hash = await writeContract(viemClient, {
        address: addresses.paymentObligation,
        abi: erc1155PaymentAbi.abi,
        functionName: "doObligation",
        args: [
          {
            token: price.address,
            tokenId: price.id,
            amount: price.value,
            payee,
          },
          refUID,
        ],
      });

      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },

    approveAndPay: async (
      price: Erc1155,
      payee: `0x${string}`,
      refUID: `0x${string}` = "0x0000000000000000000000000000000000000000000000000000000000000000",
    ) => {
      await util.approveAll(price.address, "payment");
      const hash = await writeContract(viemClient, {
        address: addresses.paymentObligation,
        abi: erc1155PaymentAbi.abi,
        functionName: "doObligation",
        args: [
          {
            token: price.address,
            tokenId: price.id,
            amount: price.value,
            payee,
          },
          refUID,
        ],
      });

      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },

    /**
     * Security note: uses AtomicPaymentUtils, which was not included in the
     * professional manual audits and has only been reviewed by automated audit
     * tooling so far.
     */
    payErc1155AndCollect: async (escrowUid: `0x${string}`, options?: AtomicPaymentOptions) => {
      await getAtomicPaymentEscrowAttestation(viemClient, addresses, escrowUid, options);
      const hash = await writeContract(viemClient, {
        address: addresses.atomicPaymentUtils,
        abi: atomicPaymentUtilsAbi.abi,
        functionName: "payErc1155AndCollect",
        args: [escrowUid],
      });

      const attested = await getAttestedEventFromTxHash(viemClient, hash);
      return { hash, attested };
    },
  };
};
