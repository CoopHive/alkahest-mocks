import type { ChainAddresses } from "../../../types";
import type { ViemClient } from "../../../utils";
import { makeCommitmentTrustedOracleArbiterClient } from "./commitmentTrustedOracle";
import { makeERC8004ArbiterClient } from "./erc8004Arbiter";
import { makeIntrinsicsArbiterClient } from "./intrinsicsArbiter";
import { makeReferencesEscrowArbiterClient } from "./referencesEscrowArbiter";
import { makeTrivialArbiterClient } from "./trivialArbiter";
import { makeTrustedOracleArbiterClient } from "./trustedOracle";

export {
  decodeDemand as decodeERC8004Demand,
  encodeDemand as encodeERC8004Demand,
  type ERC8004ArbiterDemandData,
  requestHashFor as erc8004RequestHashFor,
} from "./erc8004Arbiter";

export {
  attestationIntentHash,
  decodeDemand as decodeCommitmentTrustedOracleDemand,
  decisionKeyFor as commitmentTrustedOracleDecisionKeyFor,
  encodeDemand as encodeCommitmentTrustedOracleDemand,
  type AttestationIntent,
  type CommitmentTrustedOracleArbiterDemandData,
} from "./commitmentTrustedOracle";

export {
  decodeDemand as decodeReferencesEscrowDemand,
  encodeDemand as encodeReferencesEscrowDemand,
} from "./referencesEscrowArbiter";

// Re-export static encode/decode functions and types from trustedOracle
export {
  type ArbitrationMode,
  type AttestationWithDemand,
  decodeDemand as decodeTrustedOracleDemand,
  encodeDemand as encodeTrustedOracleDemand,
  type TrustedOracleArbiterDemandData,
} from "./trustedOracle";

/**
 * General Arbiters Client
 *
 * Provides access to basic arbiters that don't depend on specific attestation properties:
 * - IntrinsicsArbiter: Basic validation (not expired, not revoked) - no DemandData
 * - TrustedOracleArbiter: Oracle-based decision making with arbitration requests
 * - CommitmentTrustedOracleArbiter: Oracle decisions over future attestation intents
 *
 * Note: TrustedPartyArbiter has been removed (identical to RecipientArbiter)
 * Note: SpecificAttestationArbiter has been removed (identical to UidArbiter)
 */
export const makeGeneralArbitersClient = (viemClient: ViemClient, addresses: ChainAddresses) => {
  const trivial = makeTrivialArbiterClient(viemClient, addresses);
  const intrinsics = makeIntrinsicsArbiterClient(viemClient, addresses);
  const referencesEscrow = makeReferencesEscrowArbiterClient(viemClient, addresses);
  const trustedOracle = makeTrustedOracleArbiterClient(viemClient, addresses);
  const commitmentTrustedOracle = makeCommitmentTrustedOracleArbiterClient(viemClient, addresses);
  const erc8004 = makeERC8004ArbiterClient(viemClient, addresses);

  return {
    trivial,
    intrinsics,
    referencesEscrow,
    trustedOracle,
    commitmentTrustedOracle,
    erc8004,
  };
};
