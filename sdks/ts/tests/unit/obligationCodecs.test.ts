import { describe, expect, test } from "bun:test";
// Attestation codecs
import {
  type AttestationEscrowObligationData,
  decodeObligation as decodeAttestationEscrowDefault,
  encodeObligation as encodeAttestationEscrowDefault,
} from "../../src/clients/obligations/attestation/escrow/default";
import {
  type AttestationReferenceEscrowObligationData,
  decodeObligation as decodeAttestationReferenceEscrow,
  encodeObligation as encodeAttestationReferenceEscrow,
} from "../../src/clients/obligations/attestation/escrow/reference";
// ERC20 codecs
import {
  decodeObligation as decodeErc20DefaultEscrow,
  type Erc20DefaultEscrowObligationData,
  encodeObligation as encodeErc20DefaultEscrow,
} from "../../src/clients/obligations/erc20/escrow/default";
import {
  decodeObligation as decodeErc20UnconditionalEscrow,
  type Erc20UnconditionalEscrowObligationData,
  encodeObligation as encodeErc20UnconditionalEscrow,
} from "../../src/clients/obligations/erc20/escrow/unconditional";
import {
  decodeObligation as decodeErc20Payment,
  type Erc20PaymentObligationData,
  encodeObligation as encodeErc20Payment,
} from "../../src/clients/obligations/erc20/payment";
// ERC721 codecs
import {
  decodeObligation as decodeErc721DefaultEscrow,
  type Erc721DefaultEscrowObligationData,
  encodeObligation as encodeErc721DefaultEscrow,
} from "../../src/clients/obligations/erc721/escrow/default";
import {
  decodeObligation as decodeErc721UnconditionalEscrow,
  type Erc721UnconditionalEscrowObligationData,
  encodeObligation as encodeErc721UnconditionalEscrow,
} from "../../src/clients/obligations/erc721/escrow/unconditional";
import {
  decodeObligation as decodeErc721Payment,
  type Erc721PaymentObligationData,
  encodeObligation as encodeErc721Payment,
} from "../../src/clients/obligations/erc721/payment";
// ERC1155 codecs
import {
  decodeObligation as decodeErc1155DefaultEscrow,
  type Erc1155DefaultEscrowObligationData,
  encodeObligation as encodeErc1155DefaultEscrow,
} from "../../src/clients/obligations/erc1155/escrow/default";
import {
  decodeObligation as decodeErc1155UnconditionalEscrow,
  type Erc1155UnconditionalEscrowObligationData,
  encodeObligation as encodeErc1155UnconditionalEscrow,
} from "../../src/clients/obligations/erc1155/escrow/unconditional";
import {
  decodeObligation as decodeErc1155Payment,
  type Erc1155PaymentObligationData,
  encodeObligation as encodeErc1155Payment,
} from "../../src/clients/obligations/erc1155/payment";
// NativeToken codecs
import {
  decodeObligation as decodeNativeTokenDefaultEscrow,
  encodeObligation as encodeNativeTokenDefaultEscrow,
  type NativeTokenDefaultEscrowObligationData,
} from "../../src/clients/obligations/nativeToken/escrow/default";
import {
  decodeObligation as decodeNativeTokenUnconditionalEscrow,
  encodeObligation as encodeNativeTokenUnconditionalEscrow,
  type NativeTokenUnconditionalEscrowObligationData,
} from "../../src/clients/obligations/nativeToken/escrow/unconditional";
import {
  decodeObligation as decodeNativeTokenPayment,
  encodeObligation as encodeNativeTokenPayment,
  type NativeTokenPaymentObligationData,
} from "../../src/clients/obligations/nativeToken/payment";
// String codecs
import {
  decodeObligation as decodeString,
  encodeObligation as encodeString,
  type StringObligationData,
} from "../../src/clients/obligations/string";
// TokenBundle codecs
import {
  decodeObligation as decodeTokenBundleDefaultEscrow,
  encodeObligation as encodeTokenBundleDefaultEscrow,
  type TokenBundleDefaultEscrowObligationData,
} from "../../src/clients/obligations/tokenBundle/escrow/default";
import {
  decodeObligation as decodeTokenBundleUnconditionalEscrow,
  encodeObligation as encodeTokenBundleUnconditionalEscrow,
  type TokenBundleUnconditionalEscrowObligationData,
} from "../../src/clients/obligations/tokenBundle/escrow/unconditional";
import {
  decodeObligation as decodeTokenBundlePayment,
  encodeObligation as encodeTokenBundlePayment,
  type TokenBundlePaymentObligationData,
} from "../../src/clients/obligations/tokenBundle/payment";

// Mock addresses for testing
const mockAddress = "0x1111111111111111111111111111111111111111" as `0x${string}`;
const mockAddress2 = "0x2222222222222222222222222222222222222222" as `0x${string}`;
const mockArbiter = "0x3333333333333333333333333333333333333333" as `0x${string}`;
const mockDemand = "0xdeadbeef" as `0x${string}`;
const mockSchema = "0x4444444444444444444444444444444444444444444444444444444444444444" as `0x${string}`;
const mockRefUID = "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;

describe("Obligation Codec Static Functions", () => {
  describe("ERC20 Codecs", () => {
    describe("Default Escrow", () => {
      test("should encode and decode ERC20 default escrow obligation", () => {
        const data: Erc20DefaultEscrowObligationData = {
          token: mockAddress,
          amount: 1000000n,
          arbiter: mockArbiter,
          demand: mockDemand,
        };

        const encoded = encodeErc20DefaultEscrow(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeErc20DefaultEscrow(encoded);
        expect(decoded.token.toLowerCase()).toBe(data.token.toLowerCase());
        expect(decoded.amount).toBe(data.amount);
        expect(decoded.arbiter.toLowerCase()).toBe(data.arbiter.toLowerCase());
        expect(decoded.demand).toBe(data.demand);
      });

      test("should handle edge cases for ERC20 default escrow", () => {
        const data: Erc20DefaultEscrowObligationData = {
          token: mockAddress,
          amount: 0n,
          arbiter: mockArbiter,
          demand: "0x",
        };

        const encoded = encodeErc20DefaultEscrow(data);
        const decoded = decodeErc20DefaultEscrow(encoded);
        expect(decoded.amount).toBe(0n);
        expect(decoded.demand).toBe("0x");
      });
    });

    describe("Unconditional Escrow", () => {
      test("should encode and decode ERC20 unconditional escrow obligation", () => {
        const data: Erc20UnconditionalEscrowObligationData = {
          token: mockAddress,
          amount: 5000000n,
          arbiter: mockArbiter,
          demand: mockDemand,
        };

        const encoded = encodeErc20UnconditionalEscrow(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeErc20UnconditionalEscrow(encoded);
        expect(decoded.token.toLowerCase()).toBe(data.token.toLowerCase());
        expect(decoded.amount).toBe(data.amount);
        expect(decoded.arbiter.toLowerCase()).toBe(data.arbiter.toLowerCase());
        expect(decoded.demand).toBe(data.demand);
      });
    });

    describe("Payment", () => {
      test("should encode and decode ERC20 payment obligation", () => {
        const data: Erc20PaymentObligationData = {
          token: mockAddress,
          amount: 2500000n,
          payee: mockAddress2,
        };

        const encoded = encodeErc20Payment(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeErc20Payment(encoded);
        expect(decoded.token.toLowerCase()).toBe(data.token.toLowerCase());
        expect(decoded.amount).toBe(data.amount);
        expect(decoded.payee.toLowerCase()).toBe(data.payee.toLowerCase());
      });
    });
  });

  describe("ERC721 Codecs", () => {
    describe("Default Escrow", () => {
      test("should encode and decode ERC721 default escrow obligation", () => {
        const data: Erc721DefaultEscrowObligationData = {
          token: mockAddress,
          tokenId: 42n,
          arbiter: mockArbiter,
          demand: mockDemand,
        };

        const encoded = encodeErc721DefaultEscrow(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeErc721DefaultEscrow(encoded);
        expect(decoded.token.toLowerCase()).toBe(data.token.toLowerCase());
        expect(decoded.tokenId).toBe(data.tokenId);
        expect(decoded.arbiter.toLowerCase()).toBe(data.arbiter.toLowerCase());
        expect(decoded.demand).toBe(data.demand);
      });
    });

    describe("Unconditional Escrow", () => {
      test("should encode and decode ERC721 unconditional escrow obligation", () => {
        const data: Erc721UnconditionalEscrowObligationData = {
          token: mockAddress,
          tokenId: 123n,
          arbiter: mockArbiter,
          demand: mockDemand,
        };

        const encoded = encodeErc721UnconditionalEscrow(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeErc721UnconditionalEscrow(encoded);
        expect(decoded.token.toLowerCase()).toBe(data.token.toLowerCase());
        expect(decoded.tokenId).toBe(data.tokenId);
        expect(decoded.arbiter.toLowerCase()).toBe(data.arbiter.toLowerCase());
        expect(decoded.demand).toBe(data.demand);
      });
    });

    describe("Payment", () => {
      test("should encode and decode ERC721 payment obligation", () => {
        const data: Erc721PaymentObligationData = {
          token: mockAddress,
          tokenId: 999n,
          payee: mockAddress2,
        };

        const encoded = encodeErc721Payment(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeErc721Payment(encoded);
        expect(decoded.token.toLowerCase()).toBe(data.token.toLowerCase());
        expect(decoded.tokenId).toBe(data.tokenId);
        expect(decoded.payee.toLowerCase()).toBe(data.payee.toLowerCase());
      });
    });
  });

  describe("ERC1155 Codecs", () => {
    describe("Default Escrow", () => {
      test("should encode and decode ERC1155 default escrow obligation", () => {
        const data: Erc1155DefaultEscrowObligationData = {
          token: mockAddress,
          tokenId: 1n,
          amount: 100n,
          arbiter: mockArbiter,
          demand: mockDemand,
        };

        const encoded = encodeErc1155DefaultEscrow(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeErc1155DefaultEscrow(encoded);
        expect(decoded.token.toLowerCase()).toBe(data.token.toLowerCase());
        expect(decoded.tokenId).toBe(data.tokenId);
        expect(decoded.amount).toBe(data.amount);
        expect(decoded.arbiter.toLowerCase()).toBe(data.arbiter.toLowerCase());
        expect(decoded.demand).toBe(data.demand);
      });
    });

    describe("Unconditional Escrow", () => {
      test("should encode and decode ERC1155 unconditional escrow obligation", () => {
        const data: Erc1155UnconditionalEscrowObligationData = {
          token: mockAddress,
          tokenId: 5n,
          amount: 500n,
          arbiter: mockArbiter,
          demand: mockDemand,
        };

        const encoded = encodeErc1155UnconditionalEscrow(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeErc1155UnconditionalEscrow(encoded);
        expect(decoded.token.toLowerCase()).toBe(data.token.toLowerCase());
        expect(decoded.tokenId).toBe(data.tokenId);
        expect(decoded.amount).toBe(data.amount);
        expect(decoded.arbiter.toLowerCase()).toBe(data.arbiter.toLowerCase());
        expect(decoded.demand).toBe(data.demand);
      });
    });

    describe("Payment", () => {
      test("should encode and decode ERC1155 payment obligation", () => {
        const data: Erc1155PaymentObligationData = {
          token: mockAddress,
          tokenId: 10n,
          amount: 50n,
          payee: mockAddress2,
        };

        const encoded = encodeErc1155Payment(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeErc1155Payment(encoded);
        expect(decoded.token.toLowerCase()).toBe(data.token.toLowerCase());
        expect(decoded.tokenId).toBe(data.tokenId);
        expect(decoded.amount).toBe(data.amount);
        expect(decoded.payee.toLowerCase()).toBe(data.payee.toLowerCase());
      });
    });
  });

  describe("NativeToken Codecs", () => {
    describe("Default Escrow", () => {
      test("should encode and decode NativeToken default escrow obligation", () => {
        const data: NativeTokenDefaultEscrowObligationData = {
          arbiter: mockArbiter,
          demand: mockDemand,
          amount: 1000000000000000000n, // 1 ETH
        };

        const encoded = encodeNativeTokenDefaultEscrow(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeNativeTokenDefaultEscrow(encoded);
        expect(decoded.arbiter.toLowerCase()).toBe(data.arbiter.toLowerCase());
        expect(decoded.demand).toBe(data.demand);
        expect(decoded.amount).toBe(data.amount);
      });
    });

    describe("Unconditional Escrow", () => {
      test("should encode and decode NativeToken unconditional escrow obligation", () => {
        const data: NativeTokenUnconditionalEscrowObligationData = {
          arbiter: mockArbiter,
          demand: mockDemand,
          amount: 500000000000000000n, // 0.5 ETH
        };

        const encoded = encodeNativeTokenUnconditionalEscrow(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeNativeTokenUnconditionalEscrow(encoded);
        expect(decoded.arbiter.toLowerCase()).toBe(data.arbiter.toLowerCase());
        expect(decoded.demand).toBe(data.demand);
        expect(decoded.amount).toBe(data.amount);
      });
    });

    describe("Payment", () => {
      test("should encode and decode NativeToken payment obligation", () => {
        const data: NativeTokenPaymentObligationData = {
          amount: 250000000000000000n, // 0.25 ETH
          payee: mockAddress2,
        };

        const encoded = encodeNativeTokenPayment(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeNativeTokenPayment(encoded);
        expect(decoded.amount).toBe(data.amount);
        expect(decoded.payee.toLowerCase()).toBe(data.payee.toLowerCase());
      });
    });
  });

  describe("TokenBundle Codecs", () => {
    describe("Default Escrow", () => {
      test("should encode and decode TokenBundle default escrow obligation", () => {
        const data: TokenBundleDefaultEscrowObligationData = {
          nativeAmount: 1000000000000000000n,
          erc20Tokens: [mockAddress],
          erc20Amounts: [5000000n],
          erc721Tokens: [mockAddress2],
          erc721TokenIds: [42n],
          erc1155Tokens: [],
          erc1155TokenIds: [],
          erc1155Amounts: [],
          arbiter: mockArbiter,
          demand: mockDemand,
        };

        const encoded = encodeTokenBundleDefaultEscrow(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeTokenBundleDefaultEscrow(encoded);
        expect(decoded.nativeAmount).toBe(data.nativeAmount);
        expect(decoded.erc20Tokens.length).toBe(1);
        expect(decoded.erc20Tokens[0]!.toLowerCase()).toBe(data.erc20Tokens[0]!.toLowerCase());
        expect(decoded.erc20Amounts[0]).toBe(data.erc20Amounts[0]);
        expect(decoded.arbiter.toLowerCase()).toBe(data.arbiter.toLowerCase());
        expect(decoded.demand).toBe(data.demand);
      });

      test("should handle empty token bundle", () => {
        const data: TokenBundleDefaultEscrowObligationData = {
          nativeAmount: 0n,
          erc20Tokens: [],
          erc20Amounts: [],
          erc721Tokens: [],
          erc721TokenIds: [],
          erc1155Tokens: [],
          erc1155TokenIds: [],
          erc1155Amounts: [],
          arbiter: mockArbiter,
          demand: "0x",
        };

        const encoded = encodeTokenBundleDefaultEscrow(data);
        const decoded = decodeTokenBundleDefaultEscrow(encoded);
        expect(decoded.nativeAmount).toBe(0n);
        expect(decoded.erc20Tokens.length).toBe(0);
      });
    });

    describe("Unconditional Escrow", () => {
      test("should encode and decode TokenBundle unconditional escrow obligation", () => {
        const data: TokenBundleUnconditionalEscrowObligationData = {
          nativeAmount: 2000000000000000000n,
          erc20Tokens: [mockAddress, mockAddress2],
          erc20Amounts: [1000000n, 2000000n],
          erc721Tokens: [],
          erc721TokenIds: [],
          erc1155Tokens: [mockAddress],
          erc1155TokenIds: [1n],
          erc1155Amounts: [100n],
          arbiter: mockArbiter,
          demand: mockDemand,
        };

        const encoded = encodeTokenBundleUnconditionalEscrow(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeTokenBundleUnconditionalEscrow(encoded);
        expect(decoded.nativeAmount).toBe(data.nativeAmount);
        expect(decoded.erc20Tokens.length).toBe(2);
        expect(decoded.erc1155Tokens.length).toBe(1);
        expect(decoded.arbiter.toLowerCase()).toBe(data.arbiter.toLowerCase());
      });
    });

    describe("Payment", () => {
      test("should encode and decode TokenBundle payment obligation", () => {
        const data: TokenBundlePaymentObligationData = {
          nativeAmount: 500000000000000000n,
          erc20Tokens: [mockAddress],
          erc20Amounts: [3000000n],
          erc721Tokens: [],
          erc721TokenIds: [],
          erc1155Tokens: [],
          erc1155TokenIds: [],
          erc1155Amounts: [],
          payee: mockAddress2,
        };

        const encoded = encodeTokenBundlePayment(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeTokenBundlePayment(encoded);
        expect(decoded.nativeAmount).toBe(data.nativeAmount);
        expect(decoded.erc20Tokens.length).toBe(1);
        expect(decoded.payee.toLowerCase()).toBe(data.payee.toLowerCase());
      });
    });
  });

  describe("Attestation Codecs", () => {
    describe("Default escrow", () => {
      test("should encode and decode Attestation escrow obligation", () => {
        const data: AttestationEscrowObligationData = {
          attestation: {
            schema: mockSchema,
            data: {
              recipient: mockAddress,
              expirationTime: 0n,
              revocable: true,
              refUID: mockRefUID,
              data: "0x1234",
              value: 0n,
            },
          },
          arbiter: mockArbiter,
          demand: mockDemand,
        };

        const encoded = encodeAttestationEscrowDefault(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeAttestationEscrowDefault(encoded);
        expect(decoded.attestation.schema).toBe(data.attestation.schema);
        expect(decoded.attestation.data.recipient.toLowerCase()).toBe(data.attestation.data.recipient.toLowerCase());
        expect(decoded.attestation.data.revocable).toBe(data.attestation.data.revocable);
        expect(decoded.arbiter.toLowerCase()).toBe(data.arbiter.toLowerCase());
        expect(decoded.demand).toBe(data.demand);
      });
    });

    describe("Reference escrow", () => {
      test("should encode and decode Attestation reference escrow obligation", () => {
        const data: AttestationReferenceEscrowObligationData = {
          referencedAttestationUid: mockSchema, // Using mockSchema as a 32-byte UID
          arbiter: mockArbiter,
          demand: mockDemand,
          expirationTime: 0n,
        };

        const encoded = encodeAttestationReferenceEscrow(data);
        expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

        const decoded = decodeAttestationReferenceEscrow(encoded);
        expect(decoded.referencedAttestationUid).toBe(data.referencedAttestationUid);
        expect(decoded.arbiter.toLowerCase()).toBe(data.arbiter.toLowerCase());
        expect(decoded.demand).toBe(data.demand);
        expect(decoded.expirationTime).toBe(data.expirationTime);
      });
    });
  });

  describe("String Codecs", () => {
    test("should encode and decode String obligation", () => {
      const data: StringObligationData = {
        item: "Hello, World!",
        schema: mockSchema,
      };

      const encoded = encodeString(data);
      expect(encoded).toMatch(/^0x[0-9a-fA-F]+$/);

      const decoded = decodeString(encoded);
      expect(decoded.item).toBe(data.item);
      expect(decoded.schema).toBe(data.schema);
    });

    test("should handle empty string", () => {
      const data: StringObligationData = {
        item: "",
        schema: mockRefUID,
      };

      const encoded = encodeString(data);
      const decoded = decodeString(encoded);
      expect(decoded.item).toBe("");
      expect(decoded.schema).toBe(mockRefUID);
    });

    test("should handle JSON string", () => {
      const jsonData = { name: "test", value: 123 };
      const data: StringObligationData = {
        item: JSON.stringify(jsonData),
        schema: mockSchema,
      };

      const encoded = encodeString(data);
      const decoded = decodeString(encoded);
      expect(JSON.parse(decoded.item)).toEqual(jsonData);
    });

    test("should handle unicode characters", () => {
      const data: StringObligationData = {
        item: "Hello, 世界! 🌍",
        schema: mockSchema,
      };

      const encoded = encodeString(data);
      const decoded = decodeString(encoded);
      expect(decoded.item).toBe(data.item);
    });
  });

  describe("Round-trip consistency", () => {
    test("multiple encodes of same data should produce identical output", () => {
      const data: Erc20DefaultEscrowObligationData = {
        token: mockAddress,
        amount: 1000000n,
        arbiter: mockArbiter,
        demand: mockDemand,
      };

      const encoded1 = encodeErc20DefaultEscrow(data);
      const encoded2 = encodeErc20DefaultEscrow(data);
      expect(encoded1).toBe(encoded2);
    });

    test("decode-encode-decode should preserve data", () => {
      const originalData: Erc721DefaultEscrowObligationData = {
        token: mockAddress,
        tokenId: 12345n,
        arbiter: mockArbiter,
        demand: mockDemand,
      };

      const encoded1 = encodeErc721DefaultEscrow(originalData);
      const decoded1 = decodeErc721DefaultEscrow(encoded1);
      const encoded2 = encodeErc721DefaultEscrow(decoded1);
      const decoded2 = decodeErc721DefaultEscrow(encoded2);

      expect(decoded2.token.toLowerCase()).toBe(originalData.token.toLowerCase());
      expect(decoded2.tokenId).toBe(originalData.tokenId);
      expect(decoded2.arbiter.toLowerCase()).toBe(originalData.arbiter.toLowerCase());
      expect(decoded2.demand).toBe(originalData.demand);
    });
  });

  describe("Large values", () => {
    test("should handle large bigint values", () => {
      const data: Erc20DefaultEscrowObligationData = {
        token: mockAddress,
        amount: 2n ** 128n - 1n, // Large but valid uint256 value
        arbiter: mockArbiter,
        demand: mockDemand,
      };

      const encoded = encodeErc20DefaultEscrow(data);
      const decoded = decodeErc20DefaultEscrow(encoded);
      expect(decoded.amount).toBe(data.amount);
    });

    test("should handle max uint256 for token IDs", () => {
      const data: Erc721DefaultEscrowObligationData = {
        token: mockAddress,
        tokenId: 2n ** 256n - 1n,
        arbiter: mockArbiter,
        demand: mockDemand,
      };

      const encoded = encodeErc721DefaultEscrow(data);
      const decoded = decodeErc721DefaultEscrow(encoded);
      expect(decoded.tokenId).toBe(data.tokenId);
    });
  });
});
