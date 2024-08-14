## Pre-deployed vs extensible contracts
bytes32 "demand" fields mean that many different statements and validators can be predeployed and interoperate with each other. customization of a network is mostly in choosing which statements/validators to use.

abstract arbiters known by statements mean that separate contracts have to be deployed per statement/counterparty pair, but has stronger types. checkStatement can be meaningfully typed rather than internally decoding `bytes demand`.


## Statements as Attester vs. Resolver vs. Delegating Attestor
Attestor:
- onAttest and onRevoke can be implemented in Statement abstract contract, and just check `attestation.attester == address(this)`
- or, Statement can not be a resolver, and only check that `statement.attestor == address(this)` in `checkStatement`
- Statement contract attests and revokes directly. 

Resolver:
- user interacts with EAS to make and revoke attestations; more work in SDK
- onAttest and onRevoke implement statement logic. finalization clauses interact more directly with EAS.
- how to handle relation between finalization terms & revocation?

Delegating Attestor
- enables revocation of fulfillment attestation inside finalization terms

## Offer/Fulfillment Symmetry
in `collectPayment`, the payment statement attestation is revoked. but what if we want to use it to collect the fullfillment statement's payment?

options:
- don't revoke on collection, and use separate state instead to prevent multiple collections on the same statement
- `checkStatement` doesn't always fail on revoked/expired attestations
- separate offer vs fulfillment statements
    - maybe this makes sense anyway; e.g., pay immediately in fulfillment

## ERC20PaymentStatement
Requirements:
- each payment can only be collected once
- statement fulfilling demands can be used to collect
- (? maybe specified in demand) fullfillment statement invalidated after finalization 
