import type { TokenBundle, TokenBundleFlat } from "../types";

export const flattenTokenBundle = (bundle: TokenBundle): TokenBundleFlat => ({
  nativeAmount: bundle.nativeAmount ?? 0n,
  erc20Tokens: bundle.erc20s.map((x) => x.address),
  erc20Amounts: bundle.erc20s.map((x) => x.value),
  erc721Tokens: bundle.erc721s.map((x) => x.address),
  erc721TokenIds: bundle.erc721s.map((x) => x.id),
  erc1155Tokens: bundle.erc1155s.map((x) => x.address),
  erc1155TokenIds: bundle.erc1155s.map((x) => x.id),
  erc1155Amounts: bundle.erc1155s.map((x) => x.value),
});
