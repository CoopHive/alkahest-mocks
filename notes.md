## Pre-deployed vs extensible contracts
bytes32 "demand" fields mean that many different statements and validators can be predeployed and interoperate with each other. customization of a network is mostly in choosing which statements/validators to use.

abstract arbiters known by statements mean that separate contracts have to be deployed per statement/counterparty pair, but has stronger types. checkStatement can be meaningfully typed rather than internally decoding `bytes demand`.