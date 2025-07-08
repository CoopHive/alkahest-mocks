## Pre-deployed vs extensible contracts
bytes32 "demand" fields mean that many different statements and validators can be predeployed and interoperate with each other. customization of a network is mostly in choosing which statements/validators to use.

abstract arbiters known by statements mean that separate contracts have to be deployed per statement/counterparty pair, but has stronger types. checkObligation can be meaningfully typed rather than internally decoding `bytes demand`.


## Statements as Attester vs. Resolver vs. Delegating Attestor
Attestor:
- onAttest and onRevoke can be implemented in Statement abstract contract, and just check `attestation.attester == address(this)`
- or, Statement can not be a resolver, and only check that `statement.attestor == address(this)` in `checkObligation`
- Statement contract attests and revokes directly. 

Resolver:
- user interacts with EAS to make and revoke attestations; more work in SDK
- onAttest and onRevoke implement statement logic. finalization clauses interact more directly with EAS.
- how to handle relation between finalization terms & revocation?

Delegating Attestor
- enables revocation of fulfillment attestation inside finalization terms

## Offer/Fulfillment Symmetry
solved with validators

## Effect-Free Validators
validators end up making attestations that their implementation of checkObligation looks at, but this doesn't have to be the case.
- we can detach "validations" (checkObligation) from "comments", which are statements asserting properties of other statements.
- IArbiter doesn't have to make attestations. IArbiter.ATTESTATION_SCHEMA doesn't have to be its own
    - IArbiter doesn't necessarily need ATTESTATION_SCHEMA. checks could be generic to attestations or a class of statements (e.g., "statement recipient is x"). maybe move ATTESTATION_SCHEMA to BaseStatement
- checkObligation is already view



## To Explore
- abstract common fields of statements like arbiter, demand, counterparty
- detach checkObligation from statement creating contracts
- dedicated "comment" vs "obligation" statements
- off-chain attestations
- checkObligation as multi-dispatch polymorphism

See [functional domain model](https://github.com/CoopHive/holistic-models/tree/main/as_functions/contracts_ecosystem).