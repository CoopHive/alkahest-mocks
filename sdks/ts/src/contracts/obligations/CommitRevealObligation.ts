export const abi = {
  "abi": [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "_eas",
          "type": "address",
          "internalType": "contract IEAS"
        },
        {
          "name": "_schemaRegistry",
          "type": "address",
          "internalType": "contract ISchemaRegistry"
        },
        {
          "name": "_slashedBondRecipient",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "receive",
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "ATTESTATION_SCHEMA",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "ATTESTATION_SCHEMA_REVOCABLE",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "attest",
      "inputs": [
        {
          "name": "attestation",
          "type": "tuple",
          "internalType": "struct Attestation",
          "components": [
            {
              "name": "uid",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "time",
              "type": "uint64",
              "internalType": "uint64"
            },
            {
              "name": "expirationTime",
              "type": "uint64",
              "internalType": "uint64"
            },
            {
              "name": "revocationTime",
              "type": "uint64",
              "internalType": "uint64"
            },
            {
              "name": "refUID",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "recipient",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "attester",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "revocable",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "data",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "check",
      "inputs": [
        {
          "name": "obligation",
          "type": "tuple",
          "internalType": "struct Attestation",
          "components": [
            {
              "name": "uid",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "time",
              "type": "uint64",
              "internalType": "uint64"
            },
            {
              "name": "expirationTime",
              "type": "uint64",
              "internalType": "uint64"
            },
            {
              "name": "revocationTime",
              "type": "uint64",
              "internalType": "uint64"
            },
            {
              "name": "refUID",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "recipient",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "attester",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "revocable",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "data",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        },
        {
          "name": "demand",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "commit",
      "inputs": [
        {
          "name": "commitment",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "commitDeadline",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "commitmentClaimed",
      "inputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "commitments",
      "inputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "commitBlock",
          "type": "uint64",
          "internalType": "uint64"
        },
        {
          "name": "commitTimestamp",
          "type": "uint64",
          "internalType": "uint64"
        },
        {
          "name": "committer",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "bondAmount",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "commitDeadline",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "computeCommitment",
      "inputs": [
        {
          "name": "claimer",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "expirationTime",
          "type": "uint64",
          "internalType": "uint64"
        },
        {
          "name": "refUID",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "data",
          "type": "tuple",
          "internalType": "struct CommitRevealObligation.ObligationData",
          "components": [
            {
              "name": "payload",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "salt",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            }
          ]
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "computeCommitment",
      "inputs": [
        {
          "name": "claimer",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "refUID",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "data",
          "type": "tuple",
          "internalType": "struct CommitRevealObligation.ObligationData",
          "components": [
            {
              "name": "payload",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "salt",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            }
          ]
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "computeRawCommitment",
      "inputs": [
        {
          "name": "claimer",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "expirationTime",
          "type": "uint64",
          "internalType": "uint64"
        },
        {
          "name": "refUID",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "decodeDemandData",
      "inputs": [
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct CommitRevealObligation.DemandData",
          "components": [
            {
              "name": "bondAmount",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "commitDeadline",
              "type": "uint256",
              "internalType": "uint256"
            }
          ]
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "decodeObligationData",
      "inputs": [
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct CommitRevealObligation.ObligationData",
          "components": [
            {
              "name": "payload",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "salt",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            }
          ]
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "doObligation",
      "inputs": [
        {
          "name": "data",
          "type": "tuple",
          "internalType": "struct CommitRevealObligation.ObligationData",
          "components": [
            {
              "name": "payload",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "salt",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            }
          ]
        },
        {
          "name": "refUID",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "uid_",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "doObligation",
      "inputs": [
        {
          "name": "data",
          "type": "tuple",
          "internalType": "struct CommitRevealObligation.ObligationData",
          "components": [
            {
              "name": "payload",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "salt",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            }
          ]
        },
        {
          "name": "expirationTime",
          "type": "uint64",
          "internalType": "uint64"
        },
        {
          "name": "refUID",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "uid_",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "doObligationFor",
      "inputs": [
        {
          "name": "data",
          "type": "tuple",
          "internalType": "struct CommitRevealObligation.ObligationData",
          "components": [
            {
              "name": "payload",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "salt",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            }
          ]
        },
        {
          "name": "recipient",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "refUID",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "uid_",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "doObligationFor",
      "inputs": [
        {
          "name": "data",
          "type": "tuple",
          "internalType": "struct CommitRevealObligation.ObligationData",
          "components": [
            {
              "name": "payload",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "salt",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            }
          ]
        },
        {
          "name": "expirationTime",
          "type": "uint64",
          "internalType": "uint64"
        },
        {
          "name": "recipient",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "refUID",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "uid_",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "doObligationRaw",
      "inputs": [
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "expirationTime",
          "type": "uint64",
          "internalType": "uint64"
        },
        {
          "name": "refUID",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "uid_",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "getObligationData",
      "inputs": [
        {
          "name": "uid",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct CommitRevealObligation.ObligationData",
          "components": [
            {
              "name": "payload",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "salt",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getSchema",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct SchemaRecord",
          "components": [
            {
              "name": "uid",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "resolver",
              "type": "address",
              "internalType": "contract ISchemaResolver"
            },
            {
              "name": "revocable",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "schema",
              "type": "string",
              "internalType": "string"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "isPayable",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "multiAttest",
      "inputs": [
        {
          "name": "attestations",
          "type": "tuple[]",
          "internalType": "struct Attestation[]",
          "components": [
            {
              "name": "uid",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "time",
              "type": "uint64",
              "internalType": "uint64"
            },
            {
              "name": "expirationTime",
              "type": "uint64",
              "internalType": "uint64"
            },
            {
              "name": "revocationTime",
              "type": "uint64",
              "internalType": "uint64"
            },
            {
              "name": "refUID",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "recipient",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "attester",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "revocable",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "data",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        },
        {
          "name": "values",
          "type": "uint256[]",
          "internalType": "uint256[]"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "multiRevoke",
      "inputs": [
        {
          "name": "attestations",
          "type": "tuple[]",
          "internalType": "struct Attestation[]",
          "components": [
            {
              "name": "uid",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "time",
              "type": "uint64",
              "internalType": "uint64"
            },
            {
              "name": "expirationTime",
              "type": "uint64",
              "internalType": "uint64"
            },
            {
              "name": "revocationTime",
              "type": "uint64",
              "internalType": "uint64"
            },
            {
              "name": "refUID",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "recipient",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "attester",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "revocable",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "data",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        },
        {
          "name": "values",
          "type": "uint256[]",
          "internalType": "uint256[]"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "revealAndCollect",
      "inputs": [
        {
          "name": "data",
          "type": "tuple",
          "internalType": "struct CommitRevealObligation.ObligationData",
          "components": [
            {
              "name": "payload",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "salt",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            }
          ]
        },
        {
          "name": "recipient",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "escrowContract",
          "type": "address",
          "internalType": "contract IEscrow"
        },
        {
          "name": "escrowUid",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "fulfillmentUid",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "collectResult",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "revealAndCollect",
      "inputs": [
        {
          "name": "data",
          "type": "tuple",
          "internalType": "struct CommitRevealObligation.ObligationData",
          "components": [
            {
              "name": "payload",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "salt",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            }
          ]
        },
        {
          "name": "expirationTime",
          "type": "uint64",
          "internalType": "uint64"
        },
        {
          "name": "recipient",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "escrowContract",
          "type": "address",
          "internalType": "contract IEscrow"
        },
        {
          "name": "escrowUid",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "fulfillmentUid",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "collectResult",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "revoke",
      "inputs": [
        {
          "name": "attestation",
          "type": "tuple",
          "internalType": "struct Attestation",
          "components": [
            {
              "name": "uid",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "time",
              "type": "uint64",
              "internalType": "uint64"
            },
            {
              "name": "expirationTime",
              "type": "uint64",
              "internalType": "uint64"
            },
            {
              "name": "revocationTime",
              "type": "uint64",
              "internalType": "uint64"
            },
            {
              "name": "refUID",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "recipient",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "attester",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "revocable",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "data",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "setSlashedBondRecipient",
      "inputs": [
        {
          "name": "_slashedBondRecipient",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "slashBond",
      "inputs": [
        {
          "name": "commitment",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "slashedBondRecipient",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "supportsInterface",
      "inputs": [
        {
          "name": "interfaceId",
          "type": "bytes4",
          "internalType": "bytes4"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        {
          "name": "newOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "version",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "string",
          "internalType": "string"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "event",
      "name": "BondReclaimed",
      "inputs": [
        {
          "name": "fulfillmentUid",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "claimer",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "BondSlashed",
      "inputs": [
        {
          "name": "commitment",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "recipient",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Committed",
      "inputs": [
        {
          "name": "commitment",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "claimer",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "commitDeadline",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "previousOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "AccessDenied",
      "inputs": []
    },
    {
      "type": "error",
      "name": "BondAlreadyClaimed",
      "inputs": [
        {
          "name": "commitment",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ]
    },
    {
      "type": "error",
      "name": "BondTransferFailed",
      "inputs": [
        {
          "name": "claimer",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ]
    },
    {
      "type": "error",
      "name": "CommitDeadlineNotReached",
      "inputs": [
        {
          "name": "commitment",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ]
    },
    {
      "type": "error",
      "name": "CommitmentAlreadyExists",
      "inputs": [
        {
          "name": "commitment",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ]
    },
    {
      "type": "error",
      "name": "CommitmentMissing",
      "inputs": [
        {
          "name": "commitment",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "claimer",
          "type": "address",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "error",
      "name": "CommitmentTooRecent",
      "inputs": [
        {
          "name": "commitment",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "claimer",
          "type": "address",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "error",
      "name": "EmptyCommitment",
      "inputs": []
    },
    {
      "type": "error",
      "name": "EscrowCollectionFailed",
      "inputs": [
        {
          "name": "escrowContract",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "escrowUid",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "fulfillmentUid",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "result",
          "type": "bytes",
          "internalType": "bytes"
        }
      ]
    },
    {
      "type": "error",
      "name": "InsufficientValue",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidEAS",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidLength",
      "inputs": []
    },
    {
      "type": "error",
      "name": "NotFromThisAttester",
      "inputs": []
    },
    {
      "type": "error",
      "name": "NotPayable",
      "inputs": []
    },
    {
      "type": "error",
      "name": "OwnableInvalidOwner",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "error",
      "name": "OwnableUnauthorizedAccount",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "error",
      "name": "ReentrancyGuardReentrantCall",
      "inputs": []
    },
    {
      "type": "error",
      "name": "RevealTooLate",
      "inputs": [
        {
          "name": "commitment",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ]
    },
    {
      "type": "error",
      "name": "SchemaRegistrationFailed",
      "inputs": [
        {
          "name": "uid",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ]
    },
    {
      "type": "error",
      "name": "SlashTransferFailed",
      "inputs": [
        {
          "name": "recipient",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ]
    },
    {
      "type": "error",
      "name": "UnauthorizedReveal",
      "inputs": [
        {
          "name": "caller",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "committer",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "recipient",
          "type": "address",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "error",
      "name": "ZeroBondAmount",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x6101808060405234610217576060816127038038038091610020828561021b565b8339810103126102175780516001600160a01b03811691828203610217576020810151926001600160a01b0384169182850361021757604001516001600160a01b0381169490859003610217576040519161007c60608461021b565b602b83527f6279746573207061796c6f61642c20627974657333322073616c742c2062797460208401526a6573333220736368656d6160a81b60408401526001608052600360a0525f60c0521561020857836100e99460e05261012052610100525f610160523091610336565b6101405260017f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f005533156101f5575f8054336001600160a01b0319821681178355604051939290916001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a3600380546001600160a01b0319169190911790556121f6908161050d823960805181611210015260a0518161123b015260c05181611266015260e05181611cce01526101005181610e9701526101205181818161066d0152611e980152610140518181816106a501528181610e650152818161102e015281816118940152611d640152610160518181816108760152611dc10152f35b631e4fbdf760e01b5f525f60045260245ffd5b6341bc07ff60e11b5f5260045ffd5b5f80fd5b601f909101601f19168101906001600160401b0382119082101761023e57604052565b634e487b7160e01b5f52604160045260245ffd5b602081830312610217578051906001600160401b0382116102175701906080828203126102175760405191608083016001600160401b0381118482101761023e576040528051835260208101516001600160a01b0381168103610217576020840152604081015180151581036102175760408401526060810151906001600160401b038211610217570181601f82011215610217578051906001600160401b03821161023e5760405192610310601f8401601f19166020018561021b565b8284526020838301011161021757815f9260208093018386015e83010152606082015290565b9291604051906020820183519261037c6015602083818901978089885e810160018060601b03198860601b16838201525f60348201520301600a1981018452018261021b565b5190206040516351753e3760e11b81526004810182905290956001600160a01b031693905f81602481885afa801561048c5787915f916104f2575b5051146104ec579060846020926040519485938492630c1af44f60e31b8452606060048501525180928160648601528585015e5f84838501015260018060a01b031660248301525f6044830152601f801991011681010301815f865af15f91816104b8575b5061049757505f602491604051928380926351753e3760e11b82528760048301525afa801561048c5783915f9161046a575b5051146104685750639e6113d560e01b5f5260045260245ffd5b565b61048691503d805f833e61047e818361021b565b810190610252565b5f61044e565b6040513d5f823e3d90fd5b919280915082036104a6575090565b639e6113d560e01b5f5260045260245ffd5b9091506020813d6020116104e4575b816104d46020938361021b565b810103126102175751905f61041c565b3d91506104c7565b50505050565b61050691503d805f833e61047e818361021b565b5f6103b756fe6080806040526004361015610029575b50361561001a575f80fd5b631574f9f360e01b5f5260045ffd5b5f3560e01c90816301ffc9a71461140c575080631f04b6b6146113e45780632cfea7ce146113365780633d447265146112f357806354fd4d50146111f1578063571573ce146110515780635bf2f20d146110175780635fdd720a14610fbc5780636b122fe014610e26578063715018a614610dcf578063838a68d914610d53578063839df94514610cec57806388e5b2d914610b8e5780638da3721a14610bd45780638da5cb5b14610bad57806391db0b7e14610b8e5780639420baf114610a5357806396e1e1a6146109eb578063a19d132814610956578063a50a2162146108e8578063b3b902d41461089b578063b587a5eb1461085f578063c6ec5070146105ea578063c93844be14610535578063cd95b7b9146104dc578063ce46e046146104c2578063d4e063dd14610493578063e0e879c014610424578063e49617e1146103ff578063e60c3505146103ff578063e900ead8146102a6578063ea920e0d146102295763f2fde38b146101a0575f61000f565b34610225576020366003190112610225576101b9611475565b6101c1611ab5565b6001600160a01b03168015610212575f80546001600160a01b03198116831782556001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a3005b631e4fbdf760e01b5f525f60045260245ffd5b5f80fd5b34610225576080366003190112610225576004356001600160401b03811161022557606060031982360301126102255761029e61028760209261026a6114f3565b61029561027561148b565b92604051948591600401888301611a0e565b03601f198101855284611666565b60643592611d57565b604051908152f35b60403660031901126102255760243560043580156103f05734156103e1575f81815260016020819052604090912001546001600160a01b03166103cf576040516102ef816115ca565b6001600160401b03431681526003602082016001600160401b03421681526040830133815260608401903482526080850192878452865f5260016020526001600160401b0360405f209651166fffffffffffffffff00000000000000008754925160401b16916fffffffffffffffffffffffffffffffff191617178555600185019060018060a01b039051166bffffffffffffffffffffffff60a01b825416179055516002840155519101556040519134835260208301527ff9d7d804568de462be82d5c339adb0889f00ebbebe4ffb8b58abd40aed01108360403393a3005b63c5f89f0560e01b5f5260045260245ffd5b636edb2d2f60e11b5f5260045ffd5b635560fe6360e11b5f5260045ffd5b602061041a61040d36611722565b610415611ccc565b611d0d565b6040519015158152f35b34610225576060366003190112610225576004356001600160401b03811161022557606060031982360301126102255761029e60209161047a6104886104686114f3565b92604051928391600401878301611a0e565b03601f198101835282611666565b604435913391611d57565b34610225576020366003190112610225576004355f526002602052602060ff60405f2054166040519015158152f35b34610225575f3660031901126102255760206040515f8152f35b34610225576040366003190112610225576004356001600160401b03811161022557606060031982360301126102255761029e61047a610529602093604051928391600401868301611a0e565b602435905f3391611d57565b34610225576020366003190112610225576004356001600160401b0381116102255761056590369060040161151d565b61056d611a96565b50810190602081830312610225578035906001600160401b03821161022557019060608282031261022557604051906105a58261164b565b8235926001600160401b038411610225576105c76040926105e69583016116d8565b83526020810135602084015201356040820152604051918291826116f3565b0390f35b3461022557602036600319011261022557610603611a96565b5060606101206040516106158161162f565b5f81525f60208201525f60408201525f838201525f60808201525f60a08201525f60c08201525f60e08201525f61010082015201526040516328c44a9960e21b815260043560048201525f8160248160018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165afa908115610854575f91610762575b5060208101517f0000000000000000000000000000000000000000000000000000000000000000036107535761012001518051810190602081830312610225576020810151906001600160401b038211610225570160608183031261022557604051906107098261164b565b6020810151906001600160401b038211610225576107346060926020806105e6970191840101611a7c565b83526040810151602084015201516040820152604051918291826116f3565b635527981560e11b5f5260045ffd5b90503d805f833e6107738183611666565b810190602081830312610225578051906001600160401b03821161022557016101408183031261022557604051916107aa8361162f565b81518352602082015160208401526107c460408301612178565b60408401526107d560608301612178565b60608401526107e660808301612178565b608084015260a082015160a084015261080160c0830161218c565b60c084015261081260e0830161218c565b60e084015261082461010083016117a6565b6101008401526101208201516001600160401b038111610225576108489201611a7c565b6101208201528161069d565b6040513d5f823e3d90fd5b34610225575f3660031901126102255760206040517f000000000000000000000000000000000000000000000000000000000000000015158152f35b6060366003190112610225576004356001600160401b0381116102255761029e6108cb602092369060040161151d565b6108d36114f3565b6108e360443593339336916116a2565b611d57565b34610225576060366003190112610225576004356001600160401b03811161022557606060031982360301126102255761029e61093e60209261094c61092c61145f565b91604051938491600401878301611a0e565b03601f198101845283611666565b5f60443592611d57565b346102255760603660031901126102255761096f611475565b604435906001600160401b0382116102255760606003198336030112610225576020916040516109a98161047a8682019460040185611a0e565b519020604051908382019260018060a01b031683525f604083015260243560608301526080820152608081526109e060a082611666565b519020604051908152f35b3461022557608036600319011261022557610a04611475565b610a0c6114f3565b6064356001600160401b03811161022557606060031982360301126102255760209261029e92610a4a61028793604051948591600401888301611a0e565b60443591611c80565b346102255760a0366003190112610225576004356001600160401b038111610225576060600319823603011261022557610a8b6114f3565b90610a9461148b565b916064356001600160a01b0381169290839003610225576108e393610ace9261047a60843596879460405192839160040160208301611a0e565b604051633a9bb12760e21b81528360048201528160248201525f8160448183875af15f9181610b4f575b50610b3f5750610b3b90610b0a611777565b90604051948594630b836fc760e31b86526004860152602485015260448401526080606484015260848301906114b5565b0390fd5b906105e6604051928392836114d9565b9091503d805f833e610b618183611666565b81016020828203126102255781516001600160401b03811161022557610b879201611a7c565b9085610af8565b602061041a610b9c3661157a565b92610ba8929192611ccc565b6117e9565b34610225575f366003190112610225575f546040516001600160a01b039091168152602090f35b34610225576060366003190112610225576004356001600160401b0381116102255761014060031982360301126102255760405190610c128261162f565b8060040135825260248101356020830152610c2f60448201611509565b6040830152610c4060648201611509565b6060830152610c5160848201611509565b608083015260a481013560a0830152610c6c60c482016114a1565b60c0830152610c7d60e482016114a1565b60e0830152610104810135801515810361022557610100830152610124810135906001600160401b038211610225576004610cbb92369201016116d8565b6101208201526024356001600160401b03811161022557602091610ce661041a9236906004016116d8565b9061188d565b34610225576020366003190112610225576004355f52600160205260a060405f20805490600180841b036001820154169060036002820154910154916001600160401b0360405194818116865260401c166020850152604084015260608301526080820152f35b34610225576020366003190112610225576004356001600160401b03811161022557610d85604091369060040161151d565b9082915f6020839551610d9781611614565b82815201528101031261022557604090815190610db382611614565b6020808235938481520191013581528251918252516020820152f35b34610225575f36600319011261022557610de7611ab5565b5f80546001600160a01b0319811682556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b34610225575f36600319011261022557606080604051610e45816115f9565b5f81525f60208201525f604082015201526040516351753e3760e11b81527f000000000000000000000000000000000000000000000000000000000000000060048201525f8160248160018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165afa8015610854575f90610f0c575b6060906105e6604051928392602084528051602085015260018060a01b0360208201511660408501526040810151151582850152015160808084015260a08301906114b5565b503d805f833e610f1c8183611666565b810190602081830312610225578051906001600160401b03821161022557016080818303126102255760405190610f52826115f9565b8051825260208101516001600160a01b0381168103610225576020830152610f7c604082016117a6565b60408301526060810151906001600160401b038211610225570182601f8201121561022557606092816020610fb3935191016117b3565b82820152610ec6565b3461022557608036600319011261022557610fd5611475565b610fdd6114f3565b606435906001600160401b0382116102255760209261100d61100661029e94369060040161151d565b36916116a2565b9160443591611c80565b34610225575f3660031901126102255760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b346102255760203660031901126102255760043561106d611c48565b805f52600160205260405f20604051611085816115ca565b8154906001600160401b03821681526001600160401b03602082019260401c16825260018060a01b03600184015416806040830152608060036002860154956060850196875201549201918252156111da576001600160401b036110ed925116905190611756565b4211156111c757815f52600260205260ff60405f2054166111b4575190805f52600260205260405f20600160ff198254161790555f8080808560018060a01b03600354165af161113b611777565b5015611193579060209160018060a01b0360035416907f5fab42dd23447bf0a6cc6638a8217a7d477b5067842aedf24b881e132c1c133d84604051858152a360015f5160206121a15f395f51905f5255604051908152f35b5060018060a01b0360035416631f89846360e21b5f5260045260245260445ffd5b506327d117f760e01b5f5260045260245ffd5b50631439fe2d60e01b5f5260045260245ffd5b83630fa254d360e21b5f526004525f60245260445ffd5b34610225575f366003190112610225576105e660206112df60016112347f0000000000000000000000000000000000000000000000000000000000000000611adb565b818461125f7f0000000000000000000000000000000000000000000000000000000000000000611adb565b818061128a7f0000000000000000000000000000000000000000000000000000000000000000611adb565b9260405199878b985191829101848a015e870190601760f91b83830152805192839101602183015e010190601760f91b84830152805192839101600283015e01015f838201520301601f198101835282611666565b6040519182916020835260208301906114b5565b346102255760203660031901126102255761130c611475565b611314611ab5565b600380546001600160a01b0319166001600160a01b0392909216919091179055005b34610225576080366003190112610225576004356001600160401b0381116102255760606003198236030112610225576108e39061139b61137561145f565b9161137e61148b565b925f61047a60643596879460405192839160040160208301611a0e565b604051633a9bb12760e21b815260048101849052602481018290526001600160a01b03909216915f8160448183875af15f9181610b4f5750610b3f5750610b3b90610b0a611777565b34610225575f366003190112610225576003546040516001600160a01b039091168152602090f35b34610225576020366003190112610225576004359063ffffffff60e01b8216809203610225576020916346d1b90d60e11b811490811561144e575b5015158152f35b6301ffc9a760e01b14905083611447565b602435906001600160a01b038216820361022557565b600435906001600160a01b038216820361022557565b604435906001600160a01b038216820361022557565b35906001600160a01b038216820361022557565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b6040906114f09392815281602082015201906114b5565b90565b602435906001600160401b038216820361022557565b35906001600160401b038216820361022557565b9181601f84011215610225578235916001600160401b038311610225576020838186019501011161022557565b9181601f84011215610225578235916001600160401b038311610225576020808501948460051b01011161022557565b6040600319820112610225576004356001600160401b03811161022557816115a49160040161154a565b92909291602435906001600160401b038211610225576115c69160040161154a565b9091565b60a081019081106001600160401b038211176115e557604052565b634e487b7160e01b5f52604160045260245ffd5b608081019081106001600160401b038211176115e557604052565b604081019081106001600160401b038211176115e557604052565b61014081019081106001600160401b038211176115e557604052565b606081019081106001600160401b038211176115e557604052565b90601f801991011681019081106001600160401b038211176115e557604052565b6001600160401b0381116115e557601f01601f191660200190565b9291926116ae82611687565b916116bc6040519384611666565b829481845281830111610225578281602093845f960137010152565b9080601f83011215610225578160206114f0933591016116a2565b6020815260606040611710845183602086015260808501906114b5565b93602081015182850152015191015290565b602060031982011261022557600435906001600160401b038211610225576101409082900360031901126102255760040190565b9190820180921161176357565b634e487b7160e01b5f52601160045260245ffd5b3d156117a1573d9061178882611687565b916117966040519384611666565b82523d5f602084013e565b606090565b5190811515820361022557565b9291926117bf82611687565b916117cd6040519384611666565b829481845281830111610225578281602093845f96015e010152565b92909281840361187e575f91345b85841015611873578184101561185f578360051b80860135908282116118505784013561013e198536030181121561022557611834908501611d0d565b1561184557600191039301926117f7565b505050505050505f90565b63044044a560e21b5f5260045ffd5b634e487b7160e01b5f52603260045260245ffd5b505050505050600190565b63251f56a160e21b5f5260045ffd5b60208101517f000000000000000000000000000000000000000000000000000000000000000003611a08576118c181611d26565b805f52600160205260405f2091604051906118db826115ca565b8354916001600160401b03831681526001600160401b03602082019360401c16835260018060a01b036001860154169081604082015260036002870154966060830197885201549160808201928352156119df57516001600160401b03164311156119b65760408680518101031261022557604080519661195b88611614565b60208101518852015190816020880152519081036119ac576001600160401b0380604061198d94015116935116611756565b1061199a57505190511490565b63b7c2dee760e01b5f5260045260245ffd5b5050505050505f90565b60c08201516309e555e360e01b5f90815260048690526001600160a01b03909116602452604490fd5b60c0830151630fa254d360e21b5f90815260048790526001600160a01b03909116602452604490fd5b50505f90565b602081528135601e19833603018112156102255782016020813591016001600160401b0382116102255781360381136102255760a0938260409260606020870152816080870152868601375f84840186015260208101358285015201356060830152601f01601f1916010190565b9080601f830112156102255781516114f0926020016117b3565b60405190611aa38261164b565b5f604083606081528260208201520152565b5f546001600160a01b03163303611ac857565b63118cdaa760e01b5f523360045260245ffd5b805f9172184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b821015611c25575b806d04ee2d6d415b85acef8100000000600a921015611c0a575b662386f26fc10000811015611bf6575b6305f5e100811015611be5575b612710811015611bd6575b6064811015611bc8575b1015611bbd575b600a60216001840193611b6285611687565b94611b706040519687611666565b808652611b7f601f1991611687565b013660208701378401015b5f1901916f181899199a1a9b1b9c1cb0b131b232b360811b8282061a8353048015611bb857600a9091611b8a565b505090565b600190910190611b50565b606460029104930192611b49565b61271060049104930192611b3f565b6305f5e10060089104930192611b34565b662386f26fc1000060109104930192611b27565b6d04ee2d6d415b85acef810000000060209104930192611b17565b506040915072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b8104611afd565b60025f5160206121a15f395f51905f525414611c715760025f5160206121a15f395f51905f5255565b633ee5aeb560e01b5f5260045ffd5b9291909160208151910120906001600160401b0360405193602085019560018060a01b031686521660408401526060830152608082015260808152611cc660a082611666565b51902090565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303611cfe57565b634ca8886760e01b5f5260045ffd5b60e0013560018060a01b03811680910361022557301490565b6114f09060018060a01b0360c082015116906001600160401b0360608201511661012060a083015192015192611c80565b929192611d62611c48565b7f0000000000000000000000000000000000000000000000000000000000000000926040519460c08601908682106001600160401b038311176115e5576001600160401b039160405260018060a01b03169384875216908160208701527f00000000000000000000000000000000000000000000000000000000000000001515918260408801528160608801528360808801525f60a08801526020604051611e0981611614565b8781528181019889526040518099819263f17325e760e01b8352846004840152516024830152516040604483015260018060a01b0381511660648301526001600160401b03848201511660848301526040810151151560a4830152606081015160c483015260a0611e8a608083015160c060e48601526101248501906114b5565b91015161010483015203815f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1968715610854575f97612144575b5060405195611ede8761162f565b87875260208701526001600160401b034216604087015260608601525f608086015260a085015260c084019283523060e0850152610100840152610120830152611f2782611d26565b91825f52600160205260405f2060405192611f41846115ca565b81546001600160401b03811685526001600160401b03602086019160401c16815260018060a01b03600184015416916040860195838752600360028601549560608301968752015493608082019485521561211e5786516001600160a01b031633811480159061210a575b6120e15750516001600160401b03164311156120bc5750519051611fd8916001600160401b0316611756565b42116120a957835f52600260205260ff60405f2054166120965751925f52600260205260405f20600160ff198254161790555f8080808660018060a01b038751165af1612023611777565b5015612076575190516040519283526001600160a01b0316917fa9b8d1cb23fc6bfcae1f7ed8ec77868451af44dde191688baa93bb00b7ee491790602090a39060015f5160206121a15f395f51905f5255565b5060018060a01b03905116638fdb80a360e01b5f5260045260245260445ffd5b836327d117f760e01b5f5260045260245ffd5b8363b7c2dee760e01b5f5260045260245ffd5b516309e555e360e01b5f90815260048890526001600160a01b03909116602452604490fd5b825163063c75b360e31b5f908152336004526024929092526001600160a01b0316604452606490fd5b5082516001600160a01b0316811415611fac565b8151630fa254d360e21b5f90815260048a90526001600160a01b03909116602452604490fd5b9096506020813d602011612170575b8161216060209383611666565b810103126102255751955f611ed0565b3d9150612153565b51906001600160401b038216820361022557565b51906001600160a01b03821682036102255756fe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a2646970667358221220669571c7d708200fbf38d9897ed6aba042fc8b8c3e9e384b99fdd12b97b195aa64736f6c634300081b0033",
    "sourceMap": "1258:16823:126:-:0;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;-1:-1:-1;;;1258:16823:126;;;;685:1:9;759:14:6;;688:1:9;783:14:6;;-1:-1:-1;807:14:6;;708:26:9;704:76;;790:10;2065:81:89;790:10:9;;;1932::89;;1952:32;;-1:-1:-1;1994:40:89;;2128:4;2065:81;;:::i;:::-;2044:102;;685:1:9;1505:66:68;2365:1;3667:10:126;1273:26:34;1269:95;;-1:-1:-1;1258:16823:126;;3667:10;-1:-1:-1;;;;;;1258:16823:126;;;;;;;;;;3667:10;;-1:-1:-1;;;;;1258:16823:126;;3052:40:34;;-1:-1:-1;3052:40:34;688:1:9;1258:16823:126;;-1:-1:-1;;;;;;1258:16823:126;;;;;;;;;;;;;759:14:6;1258:16823:126;;;;;783:14:6;1258:16823:126;;;;;807:14:6;1258:16823:126;;;;;790:10:9;1258:16823:126;;;;;1952:32:89;1258:16823:126;;;;;1932:10:89;1258:16823:126;;;;;;;;;;2044:102:89;1258:16823:126;;;;;;;;;;;;;;;;;;;;;;;;;1994:40:89;1258:16823:126;;;;;;;;;;;1269:95:34;1322:31;;;-1:-1:-1;1322:31:34;-1:-1:-1;1322:31:34;1258:16823:126;;-1:-1:-1;1322:31:34;704:76:9;757:12;;;-1:-1:-1;757:12:9;;-1:-1:-1;757:12:9;1258:16823:126;-1:-1:-1;1258:16823:126;;;;;;;-1:-1:-1;;1258:16823:126;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;:::o;:::-;;;;-1:-1:-1;1258:16823:126;;;;;-1:-1:-1;1258:16823:126;;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;:::i;:::-;;;;;;;;;;;;;-1:-1:-1;1258:16823:126;;;;;;;;;;;;;;;;;;:::o;597:755:125:-;;;1258:16823:126;;1602:45:125;;;;1258:16823:126;;;1602:45:125;1258:16823:126;1602:45:125;1258:16823:126;;;;;;;;;;;;;;;;;;;;;;;;;3644:5;1258:16823;;;;1602:45:125;;;;;;;;;;;:::i;:::-;1258:16823:126;1592:56:125;;1258:16823:126;;-1:-1:-1;;;880:29:125;;;;;1258:16823:126;;;1592:56:125;;-1:-1:-1;;;;;1258:16823:126;;;-1:-1:-1;1258:16823:126;880:29:125;1258:16823:126;;880:29:125;;;;;;;;3644:5:126;880:29:125;;;597:755;1258:16823:126;;923:19:125;919:35;;1258:16823:126;;1602:45:125;1258:16823:126;;;;;;;;;;;969:52:125;;1258:16823:126;880:29:125;969:52;;1258:16823:126;;;;;;;;;;;;;3644:5;1258:16823;;;;;;;;;;;;880:29:125;1258:16823:126;;;3644:5;1258:16823;;;;;;;;;;;;969:52:125;;;3644:5:126;969:52:125;;;3644:5:126;;969:52:125;;;597:755;-1:-1:-1;965:381:125;;1258:16823:126;3644:5;880:29:125;1258:16823:126;;;;;;;;;;1207:29:125;;;880;1207;;1258:16823:126;1207:29:125;;;;;;;;3644:5:126;1207:29:125;;;965:381;1258:16823:126;;1254:19:125;1250:35;;1101:29;;;;3644:5:126;1306:29:125;880;1258:16823:126;880:29:125;3644:5:126;1306:29:125;1250:35;1275:10::o;1207:29::-;;;;;;3644:5:126;1207:29:125;;;;;;:::i;:::-;;;;;:::i;:::-;;;;;1258:16823:126;;;3644:5;1258:16823;;;;;965:381:125;1072:20;;;;;;;1068:62;;1144:20;;:::o;1068:62::-;1101:29;;;3644:5:126;1101:29:125;880;1258:16823:126;880:29:125;3644:5:126;1101:29:125;969:52;;;;1602:45;969:52;;1602:45;969:52;;;;;;1602:45;969:52;;;:::i;:::-;;;1258:16823:126;;;;;969:52:125;;;;;;;-1:-1:-1;969:52:125;;919:35;944:10;;;;:::o;880:29::-;;;;;;3644:5:126;880:29:125;;;;;;:::i;:::-;;;",
    "linkReferences": {}
  },
  "deployedBytecode": {
    "object": "0x6080806040526004361015610029575b50361561001a575f80fd5b631574f9f360e01b5f5260045ffd5b5f3560e01c90816301ffc9a71461140c575080631f04b6b6146113e45780632cfea7ce146113365780633d447265146112f357806354fd4d50146111f1578063571573ce146110515780635bf2f20d146110175780635fdd720a14610fbc5780636b122fe014610e26578063715018a614610dcf578063838a68d914610d53578063839df94514610cec57806388e5b2d914610b8e5780638da3721a14610bd45780638da5cb5b14610bad57806391db0b7e14610b8e5780639420baf114610a5357806396e1e1a6146109eb578063a19d132814610956578063a50a2162146108e8578063b3b902d41461089b578063b587a5eb1461085f578063c6ec5070146105ea578063c93844be14610535578063cd95b7b9146104dc578063ce46e046146104c2578063d4e063dd14610493578063e0e879c014610424578063e49617e1146103ff578063e60c3505146103ff578063e900ead8146102a6578063ea920e0d146102295763f2fde38b146101a0575f61000f565b34610225576020366003190112610225576101b9611475565b6101c1611ab5565b6001600160a01b03168015610212575f80546001600160a01b03198116831782556001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a3005b631e4fbdf760e01b5f525f60045260245ffd5b5f80fd5b34610225576080366003190112610225576004356001600160401b03811161022557606060031982360301126102255761029e61028760209261026a6114f3565b61029561027561148b565b92604051948591600401888301611a0e565b03601f198101855284611666565b60643592611d57565b604051908152f35b60403660031901126102255760243560043580156103f05734156103e1575f81815260016020819052604090912001546001600160a01b03166103cf576040516102ef816115ca565b6001600160401b03431681526003602082016001600160401b03421681526040830133815260608401903482526080850192878452865f5260016020526001600160401b0360405f209651166fffffffffffffffff00000000000000008754925160401b16916fffffffffffffffffffffffffffffffff191617178555600185019060018060a01b039051166bffffffffffffffffffffffff60a01b825416179055516002840155519101556040519134835260208301527ff9d7d804568de462be82d5c339adb0889f00ebbebe4ffb8b58abd40aed01108360403393a3005b63c5f89f0560e01b5f5260045260245ffd5b636edb2d2f60e11b5f5260045ffd5b635560fe6360e11b5f5260045ffd5b602061041a61040d36611722565b610415611ccc565b611d0d565b6040519015158152f35b34610225576060366003190112610225576004356001600160401b03811161022557606060031982360301126102255761029e60209161047a6104886104686114f3565b92604051928391600401878301611a0e565b03601f198101835282611666565b604435913391611d57565b34610225576020366003190112610225576004355f526002602052602060ff60405f2054166040519015158152f35b34610225575f3660031901126102255760206040515f8152f35b34610225576040366003190112610225576004356001600160401b03811161022557606060031982360301126102255761029e61047a610529602093604051928391600401868301611a0e565b602435905f3391611d57565b34610225576020366003190112610225576004356001600160401b0381116102255761056590369060040161151d565b61056d611a96565b50810190602081830312610225578035906001600160401b03821161022557019060608282031261022557604051906105a58261164b565b8235926001600160401b038411610225576105c76040926105e69583016116d8565b83526020810135602084015201356040820152604051918291826116f3565b0390f35b3461022557602036600319011261022557610603611a96565b5060606101206040516106158161162f565b5f81525f60208201525f60408201525f838201525f60808201525f60a08201525f60c08201525f60e08201525f61010082015201526040516328c44a9960e21b815260043560048201525f8160248160018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165afa908115610854575f91610762575b5060208101517f0000000000000000000000000000000000000000000000000000000000000000036107535761012001518051810190602081830312610225576020810151906001600160401b038211610225570160608183031261022557604051906107098261164b565b6020810151906001600160401b038211610225576107346060926020806105e6970191840101611a7c565b83526040810151602084015201516040820152604051918291826116f3565b635527981560e11b5f5260045ffd5b90503d805f833e6107738183611666565b810190602081830312610225578051906001600160401b03821161022557016101408183031261022557604051916107aa8361162f565b81518352602082015160208401526107c460408301612178565b60408401526107d560608301612178565b60608401526107e660808301612178565b608084015260a082015160a084015261080160c0830161218c565b60c084015261081260e0830161218c565b60e084015261082461010083016117a6565b6101008401526101208201516001600160401b038111610225576108489201611a7c565b6101208201528161069d565b6040513d5f823e3d90fd5b34610225575f3660031901126102255760206040517f000000000000000000000000000000000000000000000000000000000000000015158152f35b6060366003190112610225576004356001600160401b0381116102255761029e6108cb602092369060040161151d565b6108d36114f3565b6108e360443593339336916116a2565b611d57565b34610225576060366003190112610225576004356001600160401b03811161022557606060031982360301126102255761029e61093e60209261094c61092c61145f565b91604051938491600401878301611a0e565b03601f198101845283611666565b5f60443592611d57565b346102255760603660031901126102255761096f611475565b604435906001600160401b0382116102255760606003198336030112610225576020916040516109a98161047a8682019460040185611a0e565b519020604051908382019260018060a01b031683525f604083015260243560608301526080820152608081526109e060a082611666565b519020604051908152f35b3461022557608036600319011261022557610a04611475565b610a0c6114f3565b6064356001600160401b03811161022557606060031982360301126102255760209261029e92610a4a61028793604051948591600401888301611a0e565b60443591611c80565b346102255760a0366003190112610225576004356001600160401b038111610225576060600319823603011261022557610a8b6114f3565b90610a9461148b565b916064356001600160a01b0381169290839003610225576108e393610ace9261047a60843596879460405192839160040160208301611a0e565b604051633a9bb12760e21b81528360048201528160248201525f8160448183875af15f9181610b4f575b50610b3f5750610b3b90610b0a611777565b90604051948594630b836fc760e31b86526004860152602485015260448401526080606484015260848301906114b5565b0390fd5b906105e6604051928392836114d9565b9091503d805f833e610b618183611666565b81016020828203126102255781516001600160401b03811161022557610b879201611a7c565b9085610af8565b602061041a610b9c3661157a565b92610ba8929192611ccc565b6117e9565b34610225575f366003190112610225575f546040516001600160a01b039091168152602090f35b34610225576060366003190112610225576004356001600160401b0381116102255761014060031982360301126102255760405190610c128261162f565b8060040135825260248101356020830152610c2f60448201611509565b6040830152610c4060648201611509565b6060830152610c5160848201611509565b608083015260a481013560a0830152610c6c60c482016114a1565b60c0830152610c7d60e482016114a1565b60e0830152610104810135801515810361022557610100830152610124810135906001600160401b038211610225576004610cbb92369201016116d8565b6101208201526024356001600160401b03811161022557602091610ce661041a9236906004016116d8565b9061188d565b34610225576020366003190112610225576004355f52600160205260a060405f20805490600180841b036001820154169060036002820154910154916001600160401b0360405194818116865260401c166020850152604084015260608301526080820152f35b34610225576020366003190112610225576004356001600160401b03811161022557610d85604091369060040161151d565b9082915f6020839551610d9781611614565b82815201528101031261022557604090815190610db382611614565b6020808235938481520191013581528251918252516020820152f35b34610225575f36600319011261022557610de7611ab5565b5f80546001600160a01b0319811682556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b34610225575f36600319011261022557606080604051610e45816115f9565b5f81525f60208201525f604082015201526040516351753e3760e11b81527f000000000000000000000000000000000000000000000000000000000000000060048201525f8160248160018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165afa8015610854575f90610f0c575b6060906105e6604051928392602084528051602085015260018060a01b0360208201511660408501526040810151151582850152015160808084015260a08301906114b5565b503d805f833e610f1c8183611666565b810190602081830312610225578051906001600160401b03821161022557016080818303126102255760405190610f52826115f9565b8051825260208101516001600160a01b0381168103610225576020830152610f7c604082016117a6565b60408301526060810151906001600160401b038211610225570182601f8201121561022557606092816020610fb3935191016117b3565b82820152610ec6565b3461022557608036600319011261022557610fd5611475565b610fdd6114f3565b606435906001600160401b0382116102255760209261100d61100661029e94369060040161151d565b36916116a2565b9160443591611c80565b34610225575f3660031901126102255760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b346102255760203660031901126102255760043561106d611c48565b805f52600160205260405f20604051611085816115ca565b8154906001600160401b03821681526001600160401b03602082019260401c16825260018060a01b03600184015416806040830152608060036002860154956060850196875201549201918252156111da576001600160401b036110ed925116905190611756565b4211156111c757815f52600260205260ff60405f2054166111b4575190805f52600260205260405f20600160ff198254161790555f8080808560018060a01b03600354165af161113b611777565b5015611193579060209160018060a01b0360035416907f5fab42dd23447bf0a6cc6638a8217a7d477b5067842aedf24b881e132c1c133d84604051858152a360015f5160206121a15f395f51905f5255604051908152f35b5060018060a01b0360035416631f89846360e21b5f5260045260245260445ffd5b506327d117f760e01b5f5260045260245ffd5b50631439fe2d60e01b5f5260045260245ffd5b83630fa254d360e21b5f526004525f60245260445ffd5b34610225575f366003190112610225576105e660206112df60016112347f0000000000000000000000000000000000000000000000000000000000000000611adb565b818461125f7f0000000000000000000000000000000000000000000000000000000000000000611adb565b818061128a7f0000000000000000000000000000000000000000000000000000000000000000611adb565b9260405199878b985191829101848a015e870190601760f91b83830152805192839101602183015e010190601760f91b84830152805192839101600283015e01015f838201520301601f198101835282611666565b6040519182916020835260208301906114b5565b346102255760203660031901126102255761130c611475565b611314611ab5565b600380546001600160a01b0319166001600160a01b0392909216919091179055005b34610225576080366003190112610225576004356001600160401b0381116102255760606003198236030112610225576108e39061139b61137561145f565b9161137e61148b565b925f61047a60643596879460405192839160040160208301611a0e565b604051633a9bb12760e21b815260048101849052602481018290526001600160a01b03909216915f8160448183875af15f9181610b4f5750610b3f5750610b3b90610b0a611777565b34610225575f366003190112610225576003546040516001600160a01b039091168152602090f35b34610225576020366003190112610225576004359063ffffffff60e01b8216809203610225576020916346d1b90d60e11b811490811561144e575b5015158152f35b6301ffc9a760e01b14905083611447565b602435906001600160a01b038216820361022557565b600435906001600160a01b038216820361022557565b604435906001600160a01b038216820361022557565b35906001600160a01b038216820361022557565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b6040906114f09392815281602082015201906114b5565b90565b602435906001600160401b038216820361022557565b35906001600160401b038216820361022557565b9181601f84011215610225578235916001600160401b038311610225576020838186019501011161022557565b9181601f84011215610225578235916001600160401b038311610225576020808501948460051b01011161022557565b6040600319820112610225576004356001600160401b03811161022557816115a49160040161154a565b92909291602435906001600160401b038211610225576115c69160040161154a565b9091565b60a081019081106001600160401b038211176115e557604052565b634e487b7160e01b5f52604160045260245ffd5b608081019081106001600160401b038211176115e557604052565b604081019081106001600160401b038211176115e557604052565b61014081019081106001600160401b038211176115e557604052565b606081019081106001600160401b038211176115e557604052565b90601f801991011681019081106001600160401b038211176115e557604052565b6001600160401b0381116115e557601f01601f191660200190565b9291926116ae82611687565b916116bc6040519384611666565b829481845281830111610225578281602093845f960137010152565b9080601f83011215610225578160206114f0933591016116a2565b6020815260606040611710845183602086015260808501906114b5565b93602081015182850152015191015290565b602060031982011261022557600435906001600160401b038211610225576101409082900360031901126102255760040190565b9190820180921161176357565b634e487b7160e01b5f52601160045260245ffd5b3d156117a1573d9061178882611687565b916117966040519384611666565b82523d5f602084013e565b606090565b5190811515820361022557565b9291926117bf82611687565b916117cd6040519384611666565b829481845281830111610225578281602093845f96015e010152565b92909281840361187e575f91345b85841015611873578184101561185f578360051b80860135908282116118505784013561013e198536030181121561022557611834908501611d0d565b1561184557600191039301926117f7565b505050505050505f90565b63044044a560e21b5f5260045ffd5b634e487b7160e01b5f52603260045260245ffd5b505050505050600190565b63251f56a160e21b5f5260045ffd5b60208101517f000000000000000000000000000000000000000000000000000000000000000003611a08576118c181611d26565b805f52600160205260405f2091604051906118db826115ca565b8354916001600160401b03831681526001600160401b03602082019360401c16835260018060a01b036001860154169081604082015260036002870154966060830197885201549160808201928352156119df57516001600160401b03164311156119b65760408680518101031261022557604080519661195b88611614565b60208101518852015190816020880152519081036119ac576001600160401b0380604061198d94015116935116611756565b1061199a57505190511490565b63b7c2dee760e01b5f5260045260245ffd5b5050505050505f90565b60c08201516309e555e360e01b5f90815260048690526001600160a01b03909116602452604490fd5b60c0830151630fa254d360e21b5f90815260048790526001600160a01b03909116602452604490fd5b50505f90565b602081528135601e19833603018112156102255782016020813591016001600160401b0382116102255781360381136102255760a0938260409260606020870152816080870152868601375f84840186015260208101358285015201356060830152601f01601f1916010190565b9080601f830112156102255781516114f0926020016117b3565b60405190611aa38261164b565b5f604083606081528260208201520152565b5f546001600160a01b03163303611ac857565b63118cdaa760e01b5f523360045260245ffd5b805f9172184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b821015611c25575b806d04ee2d6d415b85acef8100000000600a921015611c0a575b662386f26fc10000811015611bf6575b6305f5e100811015611be5575b612710811015611bd6575b6064811015611bc8575b1015611bbd575b600a60216001840193611b6285611687565b94611b706040519687611666565b808652611b7f601f1991611687565b013660208701378401015b5f1901916f181899199a1a9b1b9c1cb0b131b232b360811b8282061a8353048015611bb857600a9091611b8a565b505090565b600190910190611b50565b606460029104930192611b49565b61271060049104930192611b3f565b6305f5e10060089104930192611b34565b662386f26fc1000060109104930192611b27565b6d04ee2d6d415b85acef810000000060209104930192611b17565b506040915072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b8104611afd565b60025f5160206121a15f395f51905f525414611c715760025f5160206121a15f395f51905f5255565b633ee5aeb560e01b5f5260045ffd5b9291909160208151910120906001600160401b0360405193602085019560018060a01b031686521660408401526060830152608082015260808152611cc660a082611666565b51902090565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303611cfe57565b634ca8886760e01b5f5260045ffd5b60e0013560018060a01b03811680910361022557301490565b6114f09060018060a01b0360c082015116906001600160401b0360608201511661012060a083015192015192611c80565b929192611d62611c48565b7f0000000000000000000000000000000000000000000000000000000000000000926040519460c08601908682106001600160401b038311176115e5576001600160401b039160405260018060a01b03169384875216908160208701527f00000000000000000000000000000000000000000000000000000000000000001515918260408801528160608801528360808801525f60a08801526020604051611e0981611614565b8781528181019889526040518099819263f17325e760e01b8352846004840152516024830152516040604483015260018060a01b0381511660648301526001600160401b03848201511660848301526040810151151560a4830152606081015160c483015260a0611e8a608083015160c060e48601526101248501906114b5565b91015161010483015203815f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1968715610854575f97612144575b5060405195611ede8761162f565b87875260208701526001600160401b034216604087015260608601525f608086015260a085015260c084019283523060e0850152610100840152610120830152611f2782611d26565b91825f52600160205260405f2060405192611f41846115ca565b81546001600160401b03811685526001600160401b03602086019160401c16815260018060a01b03600184015416916040860195838752600360028601549560608301968752015493608082019485521561211e5786516001600160a01b031633811480159061210a575b6120e15750516001600160401b03164311156120bc5750519051611fd8916001600160401b0316611756565b42116120a957835f52600260205260ff60405f2054166120965751925f52600260205260405f20600160ff198254161790555f8080808660018060a01b038751165af1612023611777565b5015612076575190516040519283526001600160a01b0316917fa9b8d1cb23fc6bfcae1f7ed8ec77868451af44dde191688baa93bb00b7ee491790602090a39060015f5160206121a15f395f51905f5255565b5060018060a01b03905116638fdb80a360e01b5f5260045260245260445ffd5b836327d117f760e01b5f5260045260245ffd5b8363b7c2dee760e01b5f5260045260245ffd5b516309e555e360e01b5f90815260048890526001600160a01b03909116602452604490fd5b825163063c75b360e31b5f908152336004526024929092526001600160a01b0316604452606490fd5b5082516001600160a01b0316811415611fac565b8151630fa254d360e21b5f90815260048a90526001600160a01b03909116602452604490fd5b9096506020813d602011612170575b8161216060209383611666565b810103126102255751955f611ed0565b3d9150612153565b51906001600160401b038216820361022557565b51906001600160a01b03821682036102255756fe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a2646970667358221220669571c7d708200fbf38d9897ed6aba042fc8b8c3e9e384b99fdd12b97b195aa64736f6c634300081b0033",
    "sourceMap": "1258:16823:126:-:0;;;;;;;;;;-1:-1:-1;1258:16823:126;;;;;;;;;1183:12:9;;;1054:5;1183:12;1258:16823:126;1054:5:9;1183:12;1258:16823:126;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;:::i;:::-;1500:62:34;;:::i;:::-;-1:-1:-1;;;;;1258:16823:126;2627:22:34;;2623:91;;1258:16823:126;;;-1:-1:-1;;;;;;1258:16823:126;;;;;;-1:-1:-1;;;;;1258:16823:126;;3052:40:34;;1258:16823:126;3052:40:34;1258:16823:126;2623:91:34;2672:31;;;1258:16823:126;2672:31:34;1258:16823:126;;;;;2672:31:34;1258:16823:126;;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;2176:12:92;7118:16:126;1258:16823;;;;:::i;:::-;7118:16;1258:16823;;:::i;:::-;;;;;;;;;7118:16;;;;:::i;:::-;;9094;;7118;;;;;;:::i;:::-;1258:16823;;2176:12:92;;:::i;:::-;1258:16823:126;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;;;11536:24;;11532:54;;11600:9;:14;11596:43;;1258:16823;;;;;;;;;;;;;11654:33;1258:16823;-1:-1:-1;;;;;1258:16823:126;11650:120;;1258:16823;;;;;:::i;:::-;-1:-1:-1;;;;;11851:12:126;1258:16823;;;;;11806:237;;-1:-1:-1;;;;;11902:15:126;1258:16823;;;;11806:237;;11943:10;1258:16823;;11806:237;;;11600:9;;1258:16823;;11806:237;;;1258:16823;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;11600:9;;1258:16823;;;;;;12059:60;1258:16823;11943:10;12059:60;;1258:16823;11650:120;11724:35;;;1258:16823;11724:35;1258:16823;;;;11724:35;11596:43;11623:16;;;1258:16823;11623:16;1258:16823;;11623:16;11532:54;11569:17;;;1258:16823;11569:17;1258:16823;;11569:17;1258:16823;;3045:39:9;1258:16823:126;;;:::i;:::-;881:58:9;;:::i;:::-;3045:39;:::i;:::-;1258:16823:126;;;;;;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;2176:12:92;1258:16823:126;;5636:16;;1258:16823;;:::i;:::-;;;;;;;;;5636:16;;;;:::i;:::-;;9094;;5636;;;;;;:::i;:::-;1258:16823;;5718:10;;2176:12:92;;:::i;1258:16823:126:-;;;;;;-1:-1:-1;;1258:16823:126;;;;;;;;2269:49;1258:16823;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;;;;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;2176:12:92;5636:16:126;;1258:16823;4946:29;1258:16823;;;;;;;5636:16;;;;:::i;:::-;1258:16823;;5718:10;1258:16823;5718:10;2176:12:92;;:::i;1258:16823:126:-;;;;;;-1:-1:-1;;1258:16823:126;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;:::i;:::-;;;:::i;:::-;;17345:34;;1258:16823;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;:::i;:::-;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;4191:23:89;;1258:16823:126;;;4191:23:89;;1258:16823:126;;;4191:23:89;1258:16823:126;;;;;;4191:3:89;1258:16823:126;4191:23:89;;;;;;;1258:16823:126;4191:23:89;;;1258:16823:126;4228:19:89;1258:16823:126;4228:19:89;;1258:16823:126;4251:18:89;4228:41;4224:100;;1258:16823:126;17130:16;;1258:16823;;17119:46;;1258:16823;;;;;;;;;17119:46;;1258:16823;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;17119:46;1258:16823;17119:46;1258:16823;17119:46;;1258:16823;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;:::i;4224:100:89:-;4292:21;;;1258:16823:126;4292:21:89;1258:16823:126;;4292:21:89;4191:23;;;;;1258:16823:126;4191:23:89;;;;;;:::i;:::-;;;1258:16823:126;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;:::i;:::-;;;;;4191:23:89;;;;1258:16823:126;;;;;;;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;;1332:50:89;1258:16823:126;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;2176:12:92;1258:16823:126;;;;;;;;:::i;:::-;;;:::i;:::-;;;;1625:10:92;;1258:16823:126;;;;:::i;:::-;2176:12:92;:::i;1258:16823:126:-;;;;;;-1:-1:-1;;1258:16823:126;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;2176:12:92;7118:16:126;1258:16823;;7118:16;1258:16823;;:::i;:::-;6344:43;1258:16823;;;;;;;7118:16;;;;:::i;:::-;;9094;;7118;;;;;;:::i;:::-;1258:16823;;;2176:12:92;;:::i;1258:16823:126:-;;;;;;-1:-1:-1;;1258:16823:126;;;;;;:::i;:::-;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;;12713:16;;;;;;1258:16823;;;12713:16;;:::i;:::-;1258:16823;18055:15;;1258:16823;;18009:62;;;;1258:16823;;;;;;;;;;;;;;;;;;;;;;;;;18009:62;;;;;;:::i;:::-;1258:16823;17999:73;;1258:16823;;;;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;:::i;:::-;;;:::i;:::-;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;13408:62;1258:16823;13453:16;;1258:16823;;;;;;;;13453:16;;;;:::i;:::-;1258:16823;;13408:62;;:::i;1258:16823::-;;;;;;-1:-1:-1;;1258:16823:126;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;:::i;:::-;;;;:::i;:::-;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;9094:16;1258:16823;2176:12:92;1258:16823:126;9094:16;1258:16823;;;;;;;;;;;;9094:16;;;;:::i;2176:12:92:-;1258:16823:126;;;;;9222:49;;;1258:16823;9222:49;;1258:16823;;;;;;;9222:49;;;;;;;1258:16823;;9222:49;;;1258:16823;-1:-1:-1;9218:274:126;;9350:142;1258:16823;9350:142;;;:::i;:::-;1258:16823;;;9399:82;;;;;;;;1258:16823;9399:82;;1258:16823;;;;;9222:49;1258:16823;;;;;;;;;;;;;:::i;:::-;9399:82;;;9218:274;;1258:16823;;;;;;;;:::i;9222:49::-;;;;;;1258:16823;9222:49;;;;;;:::i;:::-;;;9094:16;1258:16823;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;:::i;:::-;9222:49;;;;1258:16823;;1442:1461:9;1258:16823:126;;;:::i;:::-;881:58:9;;;;;;:::i;:::-;1442:1461;:::i;1258:16823:126:-;;;;;;-1:-1:-1;;1258:16823:126;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;:::i;:::-;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;:::i;:::-;;;:::i;:::-;;;;;;-1:-1:-1;;1258:16823:126;;;;;;;;;;;;;;;;;;;;;;;;2134:49;;1258:16823;;2134:49;;;;;1258:16823;2134:49;;1258:16823;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;:::i;:::-;;;;;;17555:30;;1258:16823;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;1500:62:34;;:::i;:::-;1258:16823:126;;;-1:-1:-1;;;;;;1258:16823:126;;;;-1:-1:-1;;;;;1258:16823:126;3052:40:34;1258:16823:126;;3052:40:34;1258:16823:126;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;2937:44:89;;2962:18;1258:16823:126;2937:44:89;;1258:16823:126;;;2937:44:89;1258:16823:126;;;;;;2937:14:89;1258:16823:126;2937:44:89;;;;;;1258:16823:126;2937:44:89;;;1258:16823:126;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;2937:44:89:-;;;;1258:16823:126;2937:44:89;;;;;;:::i;:::-;;;1258:16823:126;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;2937:44:89;;1258:16823:126;;;;;;-1:-1:-1;;1258:16823:126;;;;;;:::i;:::-;;;:::i;:::-;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;14158:50;1258:16823;;;;;;:::i;:::-;;;;:::i;:::-;;;;14158:50;;:::i;1258:16823::-;;;;;;-1:-1:-1;;1258:16823:126;;;;;;;1204:43:89;1258:16823:126;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;2989:103:68;;:::i;:::-;1258:16823:126;;;;;;;;;;;;;;:::i;:::-;;;;-1:-1:-1;;;;;1258:16823:126;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;16005:28;16001:82;;-1:-1:-1;;;;;16116:42:126;1258:16823;;;;;16116:42;;:::i;:::-;16097:15;:61;;16093:135;;1258:16823;;;;;;;;;;;;16237:72;;1258:16823;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;16419:44;;;;:::i;:::-;;16477:8;16473:70;;1258:16823;;;;;;;;;;;;16559:53;1258:16823;;;;;;16559:53;1258:16823;-1:-1:-1;;;;;;;;;;;1258:16823:126;;;;;;;16473:70;1258:16823;;;;;;;;;16494:49;;;1258:16823;16494:49;1258:16823;;;;;;16494:49;16237:72;16279:30;;;;1258:16823;16279:30;1258:16823;;;;16279:30;16093:135;16181:36;;;;1258:16823;16181:36;1258:16823;;;;16181:36;16001:82;16042:41;;;;1258:16823;16042:41;1258:16823;;;;;;;16042:41;1258:16823;;;;;;-1:-1:-1;;1258:16823:126;;;;;1055:104:6;;1258:16823:126;1072:24:6;1089:6;1072:24;:::i;:::-;1120:6;;1103:24;1120:6;1103:24;:::i;:::-;1151:6;;1134:24;1151:6;1134:24;:::i;:::-;1258:16823:126;;;;;;;;;;;;1055:104:6;;;1258:16823:126;;;;-1:-1:-1;;;1258:16823:126;;;;;;;;;;;;;;;;;-1:-1:-1;;;1258:16823:126;;;;;;;;;;;;;;;;;;;;;1055:104:6;;9094:16:126;;1055:104:6;;;;;;:::i;:::-;1258:16823:126;;;;;1055:104:6;1258:16823:126;;1055:104:6;1258:16823:126;;;;:::i;:::-;;;;;;-1:-1:-1;;1258:16823:126;;;;;;:::i;:::-;1500:62:34;;:::i;:::-;4197:44:126;1258:16823;;-1:-1:-1;;;;;;1258:16823:126;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;9094:16;1258:16823;2176:12:92;1258:16823:126;;:::i;:::-;;;;:::i;:::-;;;9094:16;1258:16823;;8072:63;;;1258:16823;;;;;;;9094:16;;;;:::i;2176:12:92:-;1258:16823:126;;-1:-1:-1;;;9222:49:126;;1258:16823;9222:49;;1258:16823;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;-1:-1:-1;1258:16823:126;9222:49;1258:16823;-1:-1:-1;1258:16823:126;9222:49;;1258:16823;;9222:49;;;-1:-1:-1;9218:274:126;;9350:142;1258:16823;9350:142;;;:::i;1258:16823::-;;;;;;-1:-1:-1;;1258:16823:126;;;;3422:35;1258:16823;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;573:41:88;;;:81;;;;1258:16823:126;;;;;;;573:81:88;-1:-1:-1;;;829:40:77;;-1:-1:-1;573:81:88;;;1258:16823:126;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;:::o;:::-;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;:::o;:::-;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;:::o;:::-;;;-1:-1:-1;;;;;1258:16823:126;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;1258:16823:126;;;;;;;;-1:-1:-1;;1258:16823:126;;;;:::o;:::-;;;;;;;;;;;;;;;;:::i;:::-;;:::o;:::-;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;:::o;:::-;;;-1:-1:-1;;;;;1258:16823:126;;;;;;:::o;:::-;;;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;:::o;:::-;;-1:-1:-1;;1258:16823:126;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;:::i;:::-;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;:::i;:::-;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;:::o;:::-;;;;-1:-1:-1;1258:16823:126;;;;;-1:-1:-1;1258:16823:126;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;:::o;:::-;;;9094:16;;1258:16823;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;:::o;:::-;-1:-1:-1;;;;;1258:16823:126;;;;;;-1:-1:-1;;1258:16823:126;;;;:::o;:::-;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;1258:16823:126;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;:::o;:::-;;-1:-1:-1;;1258:16823:126;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;;;;:::o;:::-;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;-1:-1:-1;1258:16823:126;;;;:::o;:::-;;;:::o;:::-;;;;;;;;;;:::o;:::-;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;1258:16823:126;;;;;;:::o;3133:1460:9:-;;;;3340:23;;;3336:76;;3881:1;;3844:9;3896:19;3884:10;;;;;;1258:16823:126;;;;;;;;;;;;;4064:22:9;;;;4060:87;;1258:16823:126;;;;;;;;;;;;;;4274:33:9;1258:16823:126;;;4274:33:9;:::i;:::-;;4270:84;;1489:1:0;1258:16823:126;;3896:19:9;1258:16823:126;3869:13:9;;;4270:84;4327:12;;;;;;;3881:1;4327:12;:::o;4060:87::-;4113:19;;;3881:1;4113:19;;3881:1;4113:19;1258:16823:126;;;;3881:1:9;1258:16823:126;;;;;3881:1:9;1258:16823:126;3884:10:9;;;;;;;1489:1:0;3133:1460:9;:::o;3336:76::-;3386:15;;;;;;;;14457:1033:126;14666:17;;;1258:16823;14687:18;14666:39;14662:57;;14759:34;;;:::i;:::-;1258:16823;;;14828:11;14666:17;1258:16823;;;;;;;;;;;:::i;:::-;;;;-1:-1:-1;;;;;1258:16823:126;;;;-1:-1:-1;;;;;14666:17:126;1258:16823;;;;;;;;;;;;;14828:11;1258:16823;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;14873:28;14869:125;;1258:16823;-1:-1:-1;;;;;1258:16823:126;15028:12;-1:-1:-1;15008:32:126;15004:131;;1258:16823;;;;15176:32;;1258:16823;;;;;;;;;;;:::i;:::-;14666:17;15176:32;;1258:16823;;;;;;;14666:17;1258:16823;;;;15222:48;;;15218:66;;-1:-1:-1;;;;;15299:15:126;1258:16823;15317:42;15299:15;;1258:16823;;;;;15317:42;:::i;:::-;-1:-1:-1;15295:131:126;;1258:16823;;;;15443:40;14457:1033;:::o;15295:131::-;15382:33;;;1258:16823;15382:33;;1258:16823;;;15382:33;15218:66;15272:12;;;;;;1258:16823;15272:12;:::o;15004:131::-;15103:20;;;1258:16823;-1:-1:-1;;;1258:16823:126;15063:61;;;;1258:16823;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;15063:61;14869:125;14962:20;;;1258:16823;-1:-1:-1;;;1258:16823:126;14924:59;;;;1258:16823;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;14924:59;14662:57;14707:12;;1258:16823;14707:12;:::o;1258:16823::-;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;1258:16823:126;;;;:::o;:::-;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;:::i;:::-;-1:-1:-1;1258:16823:126;;;;;;;;;;;;:::o;1796:162:34:-;1710:6;1258:16823:126;-1:-1:-1;;;;;1258:16823:126;735:10:63;1855:23:34;1851:101;;1796:162::o;1851:101::-;1901:40;;;1710:6;1901:40;735:10:63;1901:40:34;1258:16823:126;;1710:6:34;1901:40;1343:634:72;1465:17;-1:-1:-1;29298:17:79;-1:-1:-1;;;29298:17:79;;;29294:103;;1343:634:72;29414:17:79;29423:8;29994:7;29414:17;;;29410:103;;1343:634:72;29539:8:79;29530:17;;;29526:103;;1343:634:72;29655:7:79;29646:16;;;29642:100;;1343:634:72;29768:7:79;29759:16;;;29755:100;;1343:634:72;29881:7:79;29872:16;;;29868:100;;1343:634:72;29985:16:79;;29981:66;;1343:634:72;29994:7:79;1580:94:72;1485:1;1258:16823:126;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;9094:16;;1258:16823;;:::i;:::-;;;;;;;1580:94:72;;;1687:247;-1:-1:-1;;1258:16823:126;;-1:-1:-1;;;1741:111:72;;;;1258:16823:126;1741:111:72;1258:16823:126;1902:10:72;;1898:21;;29994:7:79;1687:247:72;;;;1898:21;1914:5;;1343:634;:::o;29981:66:79:-;30031:1;1258:16823:126;;;;29981:66:79;;29868:100;29881:7;29952:1;1258:16823:126;;;;29868:100:79;;;29755;29768:7;29839:1;1258:16823:126;;;;29755:100:79;;;29642;29655:7;29726:1;1258:16823:126;;;;29642:100:79;;;29526:103;29539:8;29612:2;1258:16823:126;;;;29526:103:79;;;29410;29423:8;29496:2;1258:16823:126;;;;29410:103:79;;;29294;-1:-1:-1;29380:2:79;;-1:-1:-1;;;;1258:16823:126;;29294:103:79;;3749:292:68;2407:1;-1:-1:-1;;;;;;;;;;;1258:16823:126;4560:63:68;3644:93;;2407:1;-1:-1:-1;;;;;;;;;;;1258:16823:126;3749:292:68:o;3644:93::-;3696:30;;;-1:-1:-1;3696:30:68;;-1:-1:-1;3696:30:68;17824:255:126;;;;;1258:16823;;;;;18055:15;1258:16823;-1:-1:-1;;;;;1258:16823:126;;18009:62;1258:16823;18009:62;;1258:16823;;;;;;;;;;;;;;;;;;;;;;;18009:62;;;;;;:::i;:::-;1258:16823;17999:73;;17824:255;:::o;6040:128:9:-;6109:4;-1:-1:-1;;;;;1258:16823:126;6087:10:9;:27;6083:79;;6040:128::o;6083:79::-;6137:14;;;;;;;;2506:271:89;2733:20;;1258:16823:126;;;;;;;;;;;;;2765:4:89;2733:37;2506:271;:::o;17598:220:126:-;17711:100;17598:220;1258:16823;;;;;17723:21;;;1258:16823;;17746:26;-1:-1:-1;;;;;17746:26:126;;;1258:16823;;17794:16;17774:18;;;1258:16823;17794:16;;;17711:100;;:::i;2989:103:68:-;;;;;;:::i;:::-;3559:18:89;1258:16823:126;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;3601:295:89;;;;;1258:16823:126;3751:28:89;1258:16823:126;;3601:295:89;;1258:16823:126;3601:295:89;;1258:16823:126;3601:295:89;;;;1258:16823:126;3601:295:89;;;;1258:16823:126;;3601:295:89;;;1258:16823:126;3601:295:89;1258:16823:126;;;;;:::i;:::-;;;;3514:397:89;;;1258:16823:126;;;;;;;;;;;;3490:431:89;;;;;;1258:16823:126;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;;;;;;;;;;;;;3601:295:89;1258:16823:126;;;;;;;3601:295:89;1258:16823:126;3601:295:89;1258:16823:126;;;;;;;;;;;;;:::i;:::-;;;;;;;;3490:431:89;1258:16823:126;;3490:3:89;-1:-1:-1;;;;;1258:16823:126;3490:431:89;;;;;;;1258:16823:126;3490:431:89;;;2989:103:68;1258:16823:126;;;;;;;:::i;:::-;;;;3601:295:89;2347:424:92;;1258:16823:126;-1:-1:-1;;;;;2461:15:92;1258:16823:126;;2347:424:92;;1258:16823:126;3601:295:89;2347:424:92;;1258:16823:126;;3601:295:89;2347:424:92;;1258:16823:126;3601:295:89;2347:424:92;;1258:16823:126;;2347:424:92;;1258:16823:126;;;2666:4:92;1258:16823:126;2347:424:92;;1258:16823:126;2347:424:92;;;1258:16823:126;2347:424:92;;;1258:16823:126;9823:35;;;:::i;:::-;1258:16823;;;;9894:11;3601:295:89;1258:16823:126;;;;;;;;;;:::i;:::-;;;-1:-1:-1;;;;;1258:16823:126;;;;-1:-1:-1;;;;;3601:295:89;1258:16823:126;;;;;;;;;;;;;9894:11;1258:16823;;;;;;;;;;;;;;;;;;3601:295:89;1258:16823:126;;;;;;;;3601:295:89;1258:16823:126;;;;;9940:28;9936:126;;1258:16823;;-1:-1:-1;;;;;1258:16823:126;10094:10;10076:28;;;;;:71;;2989:103:68;10072:178:126;;-1:-1:-1;1258:16823:126;-1:-1:-1;;;;;1258:16823:126;10284:12;-1:-1:-1;10264:32:126;10260:132;;-1:-1:-1;1258:16823:126;;;10424:51;;-1:-1:-1;;;;;1258:16823:126;10424:51;:::i;:::-;2461:15:92;10406:69:126;10402:140;;1258:16823;;;;3601:295:89;1258:16823:126;;;;;;;10552:113;;1258:16823;;;;;3601:295:89;1258:16823:126;;;;9894:11;1258:16823;;;;;;;;;;;;;;;;;;;;;10790:38;;;;:::i;:::-;;10842:8;10838:63;;1258:16823;;;;;;;;-1:-1:-1;;;;;1258:16823:126;;10917:54;;3601:295:89;;10917:54:126;1258:16823;9894:11;-1:-1:-1;;;;;;;;;;;1258:16823:126;2989:103:68:o;10838:63:126:-;1258:16823;;;;;;;;;10859:42;;;1258:16823;10859:42;3490:431:89;1258:16823:126;;;;;10859:42;10552:113;16279:30;;;;1258:16823;10616:38;3490:431:89;1258:16823:126;;;10616:38;10402:140;15382:33;;;;1258:16823;10498:33;3490:431:89;1258:16823:126;;;10498:33;10260:132;1258:16823;-1:-1:-1;;;1258:16823:126;10319:62;;;3490:431:89;1258:16823:126;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;10319:62;10072:178;1258:16823;;-1:-1:-1;;;1258:16823:126;10170:69;;;10094:10;3490:431:89;1258:16823:126;;;;;;-1:-1:-1;;;;;1258:16823:126;;;;;10170:69;10076:71;-1:-1:-1;1258:16823:126;;-1:-1:-1;;;;;1258:16823:126;10108:39;;;10076:71;;9936:126;1258:16823;;-1:-1:-1;;;1258:16823:126;9991:60;;;3490:431:89;1258:16823:126;;;-1:-1:-1;;;;;1258:16823:126;;;;;;;9991:60;3490:431:89;;;;3601:295;3490:431;;3601:295;3490:431;;;;;;3601:295;3490:431;;;:::i;:::-;;;1258:16823:126;;;;;3490:431:89;;;;;;;-1:-1:-1;3490:431:89;;1258:16823:126;;;-1:-1:-1;;;;;1258:16823:126;;;;;;:::o;:::-;;;-1:-1:-1;;;;;1258:16823:126;;;;;;:::o",
    "linkReferences": {},
    "immutableReferences": {
      "2532": [
        {
          "start": 4624,
          "length": 32
        }
      ],
      "2534": [
        {
          "start": 4667,
          "length": 32
        }
      ],
      "2536": [
        {
          "start": 4710,
          "length": 32
        }
      ],
      "3008": [
        {
          "start": 7374,
          "length": 32
        }
      ],
      "59046": [
        {
          "start": 3735,
          "length": 32
        }
      ],
      "59050": [
        {
          "start": 1645,
          "length": 32
        },
        {
          "start": 7832,
          "length": 32
        }
      ],
      "59053": [
        {
          "start": 1701,
          "length": 32
        },
        {
          "start": 3685,
          "length": 32
        },
        {
          "start": 4142,
          "length": 32
        },
        {
          "start": 6292,
          "length": 32
        },
        {
          "start": 7524,
          "length": 32
        }
      ],
      "59056": [
        {
          "start": 2166,
          "length": 32
        },
        {
          "start": 7617,
          "length": 32
        }
      ]
    }
  },
  "methodIdentifiers": {
    "ATTESTATION_SCHEMA()": "5bf2f20d",
    "ATTESTATION_SCHEMA_REVOCABLE()": "b587a5eb",
    "attest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))": "e60c3505",
    "check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)": "8da3721a",
    "commit(bytes32,uint256)": "e900ead8",
    "commitmentClaimed(bytes32)": "d4e063dd",
    "commitments(bytes32)": "839df945",
    "computeCommitment(address,bytes32,(bytes,bytes32,bytes32))": "a19d1328",
    "computeCommitment(address,uint64,bytes32,(bytes,bytes32,bytes32))": "96e1e1a6",
    "computeRawCommitment(address,uint64,bytes32,bytes)": "5fdd720a",
    "decodeDemandData(bytes)": "838a68d9",
    "decodeObligationData(bytes)": "c93844be",
    "doObligation((bytes,bytes32,bytes32),bytes32)": "cd95b7b9",
    "doObligation((bytes,bytes32,bytes32),uint64,bytes32)": "e0e879c0",
    "doObligationFor((bytes,bytes32,bytes32),address,bytes32)": "a50a2162",
    "doObligationFor((bytes,bytes32,bytes32),uint64,address,bytes32)": "ea920e0d",
    "doObligationRaw(bytes,uint64,bytes32)": "b3b902d4",
    "getObligationData(bytes32)": "c6ec5070",
    "getSchema()": "6b122fe0",
    "isPayable()": "ce46e046",
    "multiAttest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])": "91db0b7e",
    "multiRevoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])": "88e5b2d9",
    "owner()": "8da5cb5b",
    "renounceOwnership()": "715018a6",
    "revealAndCollect((bytes,bytes32,bytes32),address,address,bytes32)": "2cfea7ce",
    "revealAndCollect((bytes,bytes32,bytes32),uint64,address,address,bytes32)": "9420baf1",
    "revoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))": "e49617e1",
    "setSlashedBondRecipient(address)": "3d447265",
    "slashBond(bytes32)": "571573ce",
    "slashedBondRecipient()": "1f04b6b6",
    "supportsInterface(bytes4)": "01ffc9a7",
    "transferOwnership(address)": "f2fde38b",
    "version()": "54fd4d50"
  },
  "rawMetadata": "{\"compiler\":{\"version\":\"0.8.27+commit.40a35a09\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[{\"internalType\":\"contract IEAS\",\"name\":\"_eas\",\"type\":\"address\"},{\"internalType\":\"contract ISchemaRegistry\",\"name\":\"_schemaRegistry\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"_slashedBondRecipient\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"AccessDenied\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"commitment\",\"type\":\"bytes32\"}],\"name\":\"BondAlreadyClaimed\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"claimer\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"BondTransferFailed\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"commitment\",\"type\":\"bytes32\"}],\"name\":\"CommitDeadlineNotReached\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"commitment\",\"type\":\"bytes32\"}],\"name\":\"CommitmentAlreadyExists\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"commitment\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"claimer\",\"type\":\"address\"}],\"name\":\"CommitmentMissing\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"commitment\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"claimer\",\"type\":\"address\"}],\"name\":\"CommitmentTooRecent\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"EmptyCommitment\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"escrowContract\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"fulfillmentUid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"result\",\"type\":\"bytes\"}],\"name\":\"EscrowCollectionFailed\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InsufficientValue\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidEAS\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidLength\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"NotFromThisAttester\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"NotPayable\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"OwnableInvalidOwner\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"OwnableUnauthorizedAccount\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"ReentrancyGuardReentrantCall\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"commitment\",\"type\":\"bytes32\"}],\"name\":\"RevealTooLate\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"SchemaRegistrationFailed\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"SlashTransferFailed\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"committer\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"}],\"name\":\"UnauthorizedReveal\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"ZeroBondAmount\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"fulfillmentUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"claimer\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"BondReclaimed\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"commitment\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"BondSlashed\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"commitment\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"claimer\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"commitDeadline\",\"type\":\"uint256\"}],\"name\":\"Committed\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"ATTESTATION_SCHEMA\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"ATTESTATION_SCHEMA_REVOCABLE\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"attestation\",\"type\":\"tuple\"}],\"name\":\"attest\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"obligation\",\"type\":\"tuple\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"check\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"commitment\",\"type\":\"bytes32\"},{\"internalType\":\"uint256\",\"name\":\"commitDeadline\",\"type\":\"uint256\"}],\"name\":\"commit\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"commitmentClaimed\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"commitments\",\"outputs\":[{\"internalType\":\"uint64\",\"name\":\"commitBlock\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"commitTimestamp\",\"type\":\"uint64\"},{\"internalType\":\"address\",\"name\":\"committer\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"bondAmount\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"commitDeadline\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"claimer\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"components\":[{\"internalType\":\"bytes\",\"name\":\"payload\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"salt\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"}],\"internalType\":\"struct CommitRevealObligation.ObligationData\",\"name\":\"data\",\"type\":\"tuple\"}],\"name\":\"computeCommitment\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"claimer\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"components\":[{\"internalType\":\"bytes\",\"name\":\"payload\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"salt\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"}],\"internalType\":\"struct CommitRevealObligation.ObligationData\",\"name\":\"data\",\"type\":\"tuple\"}],\"name\":\"computeCommitment\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"claimer\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"computeRawCommitment\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"decodeDemandData\",\"outputs\":[{\"components\":[{\"internalType\":\"uint256\",\"name\":\"bondAmount\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"commitDeadline\",\"type\":\"uint256\"}],\"internalType\":\"struct CommitRevealObligation.DemandData\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"decodeObligationData\",\"outputs\":[{\"components\":[{\"internalType\":\"bytes\",\"name\":\"payload\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"salt\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"}],\"internalType\":\"struct CommitRevealObligation.ObligationData\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes\",\"name\":\"payload\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"salt\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"}],\"internalType\":\"struct CommitRevealObligation.ObligationData\",\"name\":\"data\",\"type\":\"tuple\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"}],\"name\":\"doObligation\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid_\",\"type\":\"bytes32\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes\",\"name\":\"payload\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"salt\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"}],\"internalType\":\"struct CommitRevealObligation.ObligationData\",\"name\":\"data\",\"type\":\"tuple\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"}],\"name\":\"doObligation\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid_\",\"type\":\"bytes32\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes\",\"name\":\"payload\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"salt\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"}],\"internalType\":\"struct CommitRevealObligation.ObligationData\",\"name\":\"data\",\"type\":\"tuple\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"}],\"name\":\"doObligationFor\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid_\",\"type\":\"bytes32\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes\",\"name\":\"payload\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"salt\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"}],\"internalType\":\"struct CommitRevealObligation.ObligationData\",\"name\":\"data\",\"type\":\"tuple\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"}],\"name\":\"doObligationFor\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid_\",\"type\":\"bytes32\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"}],\"name\":\"doObligationRaw\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid_\",\"type\":\"bytes32\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"getObligationData\",\"outputs\":[{\"components\":[{\"internalType\":\"bytes\",\"name\":\"payload\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"salt\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"}],\"internalType\":\"struct CommitRevealObligation.ObligationData\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getSchema\",\"outputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"contract ISchemaResolver\",\"name\":\"resolver\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"string\",\"name\":\"schema\",\"type\":\"string\"}],\"internalType\":\"struct SchemaRecord\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"isPayable\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation[]\",\"name\":\"attestations\",\"type\":\"tuple[]\"},{\"internalType\":\"uint256[]\",\"name\":\"values\",\"type\":\"uint256[]\"}],\"name\":\"multiAttest\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation[]\",\"name\":\"attestations\",\"type\":\"tuple[]\"},{\"internalType\":\"uint256[]\",\"name\":\"values\",\"type\":\"uint256[]\"}],\"name\":\"multiRevoke\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"renounceOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes\",\"name\":\"payload\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"salt\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"}],\"internalType\":\"struct CommitRevealObligation.ObligationData\",\"name\":\"data\",\"type\":\"tuple\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"contract IEscrow\",\"name\":\"escrowContract\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"}],\"name\":\"revealAndCollect\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"fulfillmentUid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"collectResult\",\"type\":\"bytes\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes\",\"name\":\"payload\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"salt\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"}],\"internalType\":\"struct CommitRevealObligation.ObligationData\",\"name\":\"data\",\"type\":\"tuple\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"contract IEscrow\",\"name\":\"escrowContract\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"}],\"name\":\"revealAndCollect\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"fulfillmentUid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"collectResult\",\"type\":\"bytes\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"attestation\",\"type\":\"tuple\"}],\"name\":\"revoke\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_slashedBondRecipient\",\"type\":\"address\"}],\"name\":\"setSlashedBondRecipient\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"commitment\",\"type\":\"bytes32\"}],\"name\":\"slashBond\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"slashedBondRecipient\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"version\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"stateMutability\":\"payable\",\"type\":\"receive\"}],\"devdoc\":{\"details\":\"Security note: This contract has not been included in professional manual audits and      has only been reviewed by automated audit tooling so far.\",\"errors\":{\"OwnableInvalidOwner(address)\":[{\"details\":\"The owner is not a valid owner account. (eg. `address(0)`)\"}],\"OwnableUnauthorizedAccount(address)\":[{\"details\":\"The caller account is not authorized to perform an operation.\"}],\"ReentrancyGuardReentrantCall()\":[{\"details\":\"Unauthorized reentrant call.\"}]},\"kind\":\"dev\",\"methods\":{\"attest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"params\":{\"attestation\":\"The new attestation.\"},\"returns\":{\"_0\":\"Whether the attestation is valid.\"}},\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"params\":{\"demand\":\"Arbiter-specific demand data encoded by the escrow creator.\",\"escrowUid\":\"The UID of the escrow attestation being fulfilled.\",\"fulfillment\":\"The EAS attestation being used as fulfillment.\"}},\"commit(bytes32,uint256)\":{\"params\":{\"commitDeadline\":\"Relative reveal deadline, in seconds after commit, from the escrow demand.\",\"commitment\":\"keccak256(abi.encode(claimer, expirationTime, refUID, keccak256(data))).\"}},\"computeCommitment(address,bytes32,(bytes,bytes32,bytes32))\":{\"params\":{\"claimer\":\"Recipient that will be stored on the fulfillment attestation.\",\"data\":\"Obligation data that will be revealed.\",\"refUID\":\"Reference UID that will be stored on the fulfillment attestation.\"},\"returns\":{\"_0\":\"Commitment hash to submit in `commit`.\"}},\"computeCommitment(address,uint64,bytes32,(bytes,bytes32,bytes32))\":{\"params\":{\"claimer\":\"Recipient that will be stored on the fulfillment attestation.\",\"data\":\"Obligation data that will be revealed.\",\"expirationTime\":\"EAS expiration timestamp that will be stored on the fulfillment attestation.\",\"refUID\":\"Reference UID that will be stored on the fulfillment attestation.\"},\"returns\":{\"_0\":\"Commitment hash to submit in `commit`.\"}},\"computeRawCommitment(address,uint64,bytes32,bytes)\":{\"params\":{\"claimer\":\"Recipient that will be stored on the fulfillment attestation.\",\"data\":\"Pre-encoded obligation data that will be revealed.\",\"expirationTime\":\"EAS expiration timestamp that will be stored on the fulfillment attestation.\",\"refUID\":\"Reference UID that will be stored on the fulfillment attestation.\"},\"returns\":{\"_0\":\"Commitment hash to submit in `commit`.\"}},\"doObligation((bytes,bytes32,bytes32),bytes32)\":{\"params\":{\"data\":\"Revealed data (must match a prior commit) and salt.\",\"refUID\":\"Optional reference UID stored on the fulfillment attestation.\"}},\"doObligation((bytes,bytes32,bytes32),uint64,bytes32)\":{\"params\":{\"data\":\"Revealed data (must match a prior commit) and salt.\",\"expirationTime\":\"EAS expiration timestamp, or zero for no expiration.\",\"refUID\":\"Optional reference UID stored on the fulfillment attestation.\"}},\"doObligationFor((bytes,bytes32,bytes32),address,bytes32)\":{\"params\":{\"data\":\"Revealed data (must match a prior commit) and salt.\",\"recipient\":\"The address to set as the attestation recipient.\",\"refUID\":\"Optional reference UID stored on the fulfillment attestation.\"}},\"doObligationFor((bytes,bytes32,bytes32),uint64,address,bytes32)\":{\"params\":{\"data\":\"Revealed data (must match a prior commit) and salt.\",\"expirationTime\":\"EAS expiration timestamp, or zero for no expiration.\",\"recipient\":\"The address to set as the attestation recipient.\",\"refUID\":\"Optional reference UID stored on the fulfillment attestation.\"}},\"doObligationRaw(bytes,uint64,bytes32)\":{\"params\":{\"data\":\"ABI-encoded obligation data.\",\"expirationTime\":\"EAS expiration timestamp, or zero for no expiration.\",\"refUID\":\"Reference UID stored on the EAS attestation.\"}},\"getObligationData(bytes32)\":{\"params\":{\"uid\":\"UID of the fulfillment attestation.\"}},\"isPayable()\":{\"returns\":{\"_0\":\"Whether the resolver supports ETH transfers.\"}},\"multiAttest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"params\":{\"attestations\":\"The new attestations.\",\"values\":\"Explicit ETH amounts which were sent with each attestation.\"},\"returns\":{\"_0\":\"Whether all the attestations are valid.\"}},\"multiRevoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"params\":{\"attestations\":\"The existing attestations to be revoked.\",\"values\":\"Explicit ETH amounts which were sent with each revocation.\"},\"returns\":{\"_0\":\"Whether the attestations can be revoked.\"}},\"owner()\":{\"details\":\"Returns the address of the current owner.\"},\"renounceOwnership()\":{\"details\":\"Leaves the contract without owner. It will not be possible to call `onlyOwner` functions. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby disabling any functionality that is only available to the owner.\"},\"revealAndCollect((bytes,bytes32,bytes32),address,address,bytes32)\":{\"params\":{\"data\":\"Revealed data and salt.\",\"escrowContract\":\"Escrow contract to collect after reveal.\",\"escrowUid\":\"UID of the escrow attestation being fulfilled.\",\"recipient\":\"Recipient to set on the fulfillment attestation; must        equal the original committer and reveal caller.\"},\"returns\":{\"collectResult\":\"Return data from the escrow contract's `collect` call.\",\"fulfillmentUid\":\"UID of the created fulfillment attestation.\"}},\"revealAndCollect((bytes,bytes32,bytes32),uint64,address,address,bytes32)\":{\"params\":{\"data\":\"Revealed data and salt.\",\"escrowContract\":\"Escrow contract to collect after reveal.\",\"escrowUid\":\"UID of the escrow attestation being fulfilled.\",\"expirationTime\":\"EAS expiration timestamp, or zero for no expiration.\",\"recipient\":\"Recipient to set on the fulfillment attestation; must        equal the original committer and reveal caller.\"},\"returns\":{\"collectResult\":\"Return data from the escrow contract's `collect` call.\",\"fulfillmentUid\":\"UID of the created fulfillment attestation.\"}},\"revoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"params\":{\"attestation\":\"The existing attestation to be revoked.\"},\"returns\":{\"_0\":\"Whether the attestation can be revoked.\"}},\"setSlashedBondRecipient(address)\":{\"params\":{\"_slashedBondRecipient\":\"New recipient for slashed bonds; address(0) burns the native token.\"}},\"slashBond(bytes32)\":{\"params\":{\"commitment\":\"The commitment hash whose bond is being slashed.\"}},\"supportsInterface(bytes4)\":{\"details\":\"Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section] to learn more about how these ids are created. This function call must use less than 30 000 gas.\"},\"transferOwnership(address)\":{\"details\":\"Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.\"},\"version()\":{\"returns\":{\"_0\":\"Semver contract version as a string.\"}}},\"title\":\"CommitRevealObligation\",\"version\":1},\"userdoc\":{\"errors\":{\"NotFromThisAttester()\":[{\"notice\":\"Raised when an attestation does not belong to this contract's schema.\"}],\"SchemaRegistrationFailed(bytes32)\":[{\"notice\":\"Raised when a schema cannot be registered or found at its deterministic UID.\"}]},\"kind\":\"user\",\"methods\":{\"ATTESTATION_SCHEMA()\":{\"notice\":\"UID of the schema used by attestations created by this contract.\"},\"ATTESTATION_SCHEMA_REVOCABLE()\":{\"notice\":\"Whether attestations under `ATTESTATION_SCHEMA` are revocable.\"},\"attest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"notice\":\"Processes an attestation and verifies whether it's valid.\"},\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"notice\":\"Returns true when `fulfillment` satisfies `demand` for `escrowUid`.\"},\"commit(bytes32,uint256)\":{\"notice\":\"Records a commitment hash, locking msg.value as its bond.\"},\"commitmentClaimed(bytes32)\":{\"notice\":\"commitmentClaimed[commitment] => bond already returned/slashed.\"},\"commitments(bytes32)\":{\"notice\":\"commitments[commitment] => commit information.\"},\"computeCommitment(address,bytes32,(bytes,bytes32,bytes32))\":{\"notice\":\"Pure helper to compute the no-expiration commitment expected by this contract.\"},\"computeCommitment(address,uint64,bytes32,(bytes,bytes32,bytes32))\":{\"notice\":\"Pure helper to compute the commitment expected by this contract.\"},\"computeRawCommitment(address,uint64,bytes32,bytes)\":{\"notice\":\"Pure helper to compute a commitment for pre-encoded obligation data.\"},\"decodeDemandData(bytes)\":{\"notice\":\"Decodes ABI-encoded arbiter demand data.\"},\"decodeObligationData(bytes)\":{\"notice\":\"Decodes ABI-encoded obligation data.\"},\"doObligation((bytes,bytes32,bytes32),bytes32)\":{\"notice\":\"Creates a fulfillment attestation containing the payload and salt.         Validates the commitment, enforces the reveal deadline, and         atomically returns the committed bond to the committer.\"},\"doObligation((bytes,bytes32,bytes32),uint64,bytes32)\":{\"notice\":\"Creates a fulfillment attestation containing the payload and salt.         Validates the commitment, enforces the reveal deadline, and         atomically returns the committed bond to the committer.\"},\"doObligationFor((bytes,bytes32,bytes32),address,bytes32)\":{\"notice\":\"Creates a fulfillment attestation with an explicit recipient.         The reveal caller, original committer, and attestation recipient         must all be the same address.\"},\"doObligationFor((bytes,bytes32,bytes32),uint64,address,bytes32)\":{\"notice\":\"Creates a fulfillment attestation with an explicit recipient.         The reveal caller, original committer, and attestation recipient         must all be the same address.\"},\"doObligationRaw(bytes,uint64,bytes32)\":{\"notice\":\"Creates an obligation attestation from pre-encoded data.\"},\"getObligationData(bytes32)\":{\"notice\":\"Loads and decodes this contract's obligation data from an attestation UID.\"},\"getSchema()\":{\"notice\":\"Returns the schema record registered for this attester.\"},\"isPayable()\":{\"notice\":\"Checks if the resolver can be sent ETH.\"},\"multiAttest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"notice\":\"Processes multiple attestations and verifies whether they are valid.\"},\"multiRevoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"notice\":\"Processes revocation of multiple attestation and verifies they can be revoked.\"},\"revealAndCollect((bytes,bytes32,bytes32),address,address,bytes32)\":{\"notice\":\"Reveals a fulfillment and immediately collects the target escrow.\"},\"revealAndCollect((bytes,bytes32,bytes32),uint64,address,address,bytes32)\":{\"notice\":\"Reveals a fulfillment and immediately collects the target escrow.\"},\"revoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"notice\":\"Processes an attestation revocation and verifies if it can be revoked.\"},\"setSlashedBondRecipient(address)\":{\"notice\":\"Updates the recipient for slashed commitment bonds.\"},\"slashBond(bytes32)\":{\"notice\":\"Slashes the bond for a commitment whose deadline has passed without a valid reveal.\"},\"slashedBondRecipient()\":{\"notice\":\"Recipient of slashed bonds (address(0) = burn).\"},\"version()\":{\"notice\":\"Returns the full semver contract version.\"}},\"notice\":\"Globally reusable obligation with built-in commit-reveal anti-front-running checks.         Each commitment locks the native-token bond supplied as msg.value.         Arbiter demand data specifies the exact bond amount and relative         reveal deadline required by escrows, so one valid reveal can satisfy         multiple escrows that intentionally accept the same revealed EAS         attestation. Escrow-specific binding should be composed separately,         for example with `ReferencesEscrowArbiter`.\",\"version\":1}},\"settings\":{\"compilationTarget\":{\"src/obligations/CommitRevealObligation.sol\":\"CommitRevealObligation\"},\"evmVersion\":\"prague\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[\":@eas/=lib/eas-contracts/contracts/\",\":@erc8004/=lib/erc-8004-contracts/contracts/\",\":@openzeppelin/=lib/openzeppelin-contracts/\",\":@src/=src/\",\":@test/=test/\",\":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/\",\":eas-contracts/=lib/eas-contracts/contracts/\",\":erc-8004-contracts/=lib/erc-8004-contracts/contracts/\",\":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/\",\":eth-gas-reporter/=lib/eas-contracts/node_modules/eth-gas-reporter/\",\":forge-std/=lib/forge-std/src/\",\":halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/\",\":hardhat-deploy/=lib/eas-contracts/node_modules/hardhat-deploy/\",\":hardhat/=lib/eas-contracts/node_modules/hardhat/\",\":openzeppelin-contracts/=lib/openzeppelin-contracts/\"],\"viaIR\":true},\"sources\":{\"lib/eas-contracts/contracts/Common.sol\":{\"keccak256\":\"0x957bd2e6d0d6d637f86208b135c29fbaf4412cb08e5e7a61ede16b80561bf685\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://da1dc9aedbb1d4d39c46c2235918d3adfbc5741dd34a46010cf425d134e7936d\",\"dweb:/ipfs/QmWUk6bXnLaghS2riF3GTFEeURCzgYFMA5woa6AsgPwEgc\"]},\"lib/eas-contracts/contracts/IEAS.sol\":{\"keccak256\":\"0xdad0674defce04905dc7935f2756d6c477a6e876c0b1b7094b112a862f164c12\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://49e448c26c08952df034692d2ab3519dd40a1ebbeae4ce68b294567441933880\",\"dweb:/ipfs/QmWHcudjskUSCjgqsNWE65LVfWvcYB2vBn8RB1SmzvRLNR\"]},\"lib/eas-contracts/contracts/ISchemaRegistry.sol\":{\"keccak256\":\"0xea97dcd36a0c422169cbaac06698249e199049b627c16bff93fb8ab829058754\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://d453a929ef64a69cd31195ec2ee5ed1193bfa29f633e13c960e92154c37ad158\",\"dweb:/ipfs/QmXs1Z3njbHs2EMgHonrZDfcwdog4kozHY5tYNrhZK5yqz\"]},\"lib/eas-contracts/contracts/ISemver.sol\":{\"keccak256\":\"0x04a67939b4e1a8d0a51101b8f69f8882930bbdc66319f38023828625b5d1ff18\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://3dd543fa0e33cef1ea757627f9c2a10a66ee1ce17aa9087f437c5b53a903c7f0\",\"dweb:/ipfs/QmXsy6UsGBzF9zPCCjmiwPpCcX3tHqU13TmR67B69tKnR6\"]},\"lib/eas-contracts/contracts/Semver.sol\":{\"keccak256\":\"0x4f23442d048661b6aaa188ddc16b69cb310c2e44066b3852026afcb4201d61a9\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://30c36e580cd93d9acb13e1a11e833946a8bd0bd2a8d1b2be049f0d96e0989808\",\"dweb:/ipfs/QmXmQTxKjSrUWutafQsqkbGufXqtzxuDAiMMJjXCHXiEqh\"]},\"lib/eas-contracts/contracts/resolver/ISchemaResolver.sol\":{\"keccak256\":\"0xb7d1961ed928c620cddf35c2bf46845b10828bc5d73145214630202ed355b6bb\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://cf1cabacfb15c9bace8280b540b52e5aa440e1b4eba675f9782c34ce0f03902f\",\"dweb:/ipfs/QmakYcK4xbrijzvoaBCmBJK6HeaBqbXxWKtDQ1z62aXwCR\"]},\"lib/eas-contracts/contracts/resolver/SchemaResolver.sol\":{\"keccak256\":\"0x385d8c0edbdc96af15cf8f22333183162561cbf7d3fb0df95287741e59899983\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://ff7e8a17f69dcb7ddc937446e868d34baea61bbe249a8f5d8be486ab93001828\",\"dweb:/ipfs/QmUz9i7ViNK9kUWHeJRtE44HmpbxBDGJBjyec2aPD6Nn3Q\"]},\"lib/openzeppelin-contracts/contracts/access/Ownable.sol\":{\"keccak256\":\"0xff6d0bb2e285473e5311d9d3caacb525ae3538a80758c10649a4d61029b017bb\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://8ed324d3920bb545059d66ab97d43e43ee85fd3bd52e03e401f020afb0b120f6\",\"dweb:/ipfs/QmfEckWLmZkDDcoWrkEvMWhms66xwTLff9DDhegYpvHo1a\"]},\"lib/openzeppelin-contracts/contracts/utils/Bytes.sol\":{\"keccak256\":\"0x8140d608316521b1fd71167c3b708ebb8659da070723fc8807609553b296ee33\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://a7bf7db66869ba1e945a0390b85da2f6afc7e42a4735ca918d0d56ac90c50147\",\"dweb:/ipfs/QmRmNyhpBpgzSdQqLtrQCYE7H7eLnVVxh2Yy4YMrySR8AR\"]},\"lib/openzeppelin-contracts/contracts/utils/Context.sol\":{\"keccak256\":\"0x493033a8d1b176a037b2cc6a04dad01a5c157722049bbecf632ca876224dd4b2\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://6a708e8a5bdb1011c2c381c9a5cfd8a9a956d7d0a9dc1bd8bcdaf52f76ef2f12\",\"dweb:/ipfs/Qmax9WHBnVsZP46ZxEMNRQpLQnrdE4dK8LehML1Py8FowF\"]},\"lib/openzeppelin-contracts/contracts/utils/Panic.sol\":{\"keccak256\":\"0xf7fe324703a64fc51702311dc51562d5cb1497734f074e4f483bfb6717572d7a\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://c6a5ff4f9fd8649b7ee20800b7fa387d3465bd77cf20c2d1068cd5c98e1ed57a\",\"dweb:/ipfs/QmVSaVJf9FXFhdYEYeCEfjMVHrxDh5qL4CGkxdMWpQCrqG\"]},\"lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol\":{\"keccak256\":\"0xa516cbf1c7d15d3517c2d668601ce016c54395bf5171918a14e2686977465f53\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://1e1d079e8edfb58efd23a311e315a4807b01b5d1cf153f8fa2d0608b9dec3e99\",\"dweb:/ipfs/QmTBExeX2SDTkn5xbk5ssbYSx7VqRp9H4Ux1CY4uQM4b9N\"]},\"lib/openzeppelin-contracts/contracts/utils/StorageSlot.sol\":{\"keccak256\":\"0xcf74f855663ce2ae00ed8352666b7935f6cddea2932fdf2c3ecd30a9b1cd0e97\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://9f660b1f351b757dfe01438e59888f31f33ded3afcf5cb5b0d9bf9aa6f320a8b\",\"dweb:/ipfs/QmarDJ5hZEgBtCmmrVzEZWjub9769eD686jmzb2XpSU1cM\"]},\"lib/openzeppelin-contracts/contracts/utils/Strings.sol\":{\"keccak256\":\"0x36d1750bf1aa5fee9c52adb2f7857ab652daca722fc05dff533b364f67a1139a\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://2e5e7052539b7849d02f3ce25acc1dce29373c11cfae9f0bc918c54b780c549a\",\"dweb:/ipfs/QmRGE32xNkMTo6i4pHHMxjpiu77yPwnTA25SFngw2NXJys\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/ERC165.sol\":{\"keccak256\":\"0x2d9dc2fe26180f74c11c13663647d38e259e45f95eb88f57b61d2160b0109d3e\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://81233d1f98060113d9922180bb0f14f8335856fe9f339134b09335e9f678c377\",\"dweb:/ipfs/QmWh6R35SarhAn4z2wH8SU456jJSYL2FgucfTFgbHJJN4E\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol\":{\"keccak256\":\"0x8891738ffe910f0cf2da09566928589bf5d63f4524dd734fd9cedbac3274dd5c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://971f954442df5c2ef5b5ebf1eb245d7105d9fbacc7386ee5c796df1d45b21617\",\"dweb:/ipfs/QmadRjHbkicwqwwh61raUEapaVEtaLMcYbQZWs9gUkgj3u\"]},\"lib/openzeppelin-contracts/contracts/utils/math/Math.sol\":{\"keccak256\":\"0x09e3f1c72d4c5cbe8e2644ab7313f8f7177533ae2f4c24cdcbbeaf520a73734c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://93208401215d539fa2d81626b207c1f611def7883d0e447b3b5969ebaa7b3c2c\",\"dweb:/ipfs/QmXPxDnQPx8LAweX5ZJqEcwkvs59kP4c64VVDG1Jjq1mef\"]},\"lib/openzeppelin-contracts/contracts/utils/math/SafeCast.sol\":{\"keccak256\":\"0x195533c86d0ef72bcc06456a4f66a9b941f38eb403739b00f21fd7c1abd1ae54\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://b1d578337048cad08c1c03041cca5978eff5428aa130c781b271ad9e5566e1f8\",\"dweb:/ipfs/QmPFKL2r9CBsMwmUqqdcFPfHZB2qcs9g1HDrPxzWSxomvy\"]},\"lib/openzeppelin-contracts/contracts/utils/math/SignedMath.sol\":{\"keccak256\":\"0xb1970fac7b64e6c09611e6691791e848d5e3fe410fa5899e7df2e0afd77a99e3\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://db5fbb3dddd8b7047465b62575d96231ba8a2774d37fb4737fbf23340fabbb03\",\"dweb:/ipfs/QmVUSvooZKEdEdap619tcJjTLcAuH6QBdZqAzWwnAXZAWJ\"]},\"src/BaseArbiter.sol\":{\"keccak256\":\"0x27fa97834bcd6e592f3b534e64859b208c688363d33fb9b62436d009ffff3ed1\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://b61ac6195ae644325adf77fdb301651cddfca4b63d9db5123ee075869f3784aa\",\"dweb:/ipfs/QmYRu5hER8gaMjqyY5bDV9EAwVN12CbS3Z2bW8dLp7sPSE\"]},\"src/BaseAttester.sol\":{\"keccak256\":\"0x12339a862aa0571244f4a0c2dae1a7bcc1734717474dbf0d69b63886987d1f99\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://d40e983dece581ecb49a1a01bc87c66e86f8c954cc442a02151ec427d680682d\",\"dweb:/ipfs/QmVA7Tqk1KaYhrZpxWx3cdsjUoxsRaoBjJX8k6nCSEk8En\"]},\"src/BaseObligation.sol\":{\"keccak256\":\"0xf00b1317dd9203ea59e8da6c0bb23267b50ecb2751cd11b26a6330d1e596eb7b\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://5b9762a2ba2251c6ae9d23aa3ba49a8124f3348ac13c9271b8b9ada438dff475\",\"dweb:/ipfs/QmeBZUvNjNyC7W1hb1PKQq8CawC5ULWX9KXgJjH37wvPGH\"]},\"src/IArbiter.sol\":{\"keccak256\":\"0x00f3f5d8460c738eff4a776cf309efe38342fcc951abfe97d1c2e285acb1e330\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://7201a176f3d5c3d01ca13bbcd9ef5587effe8fabf20e0b8f81f2d6ee362269b9\",\"dweb:/ipfs/QmXn9aSvoGPQuNTxe3mM47RNQ1bfYCEczQCYsDDM9ohc8M\"]},\"src/IEscrow.sol\":{\"keccak256\":\"0x8803bb72e285722a5e90f08046cfee7d37acc6cf83c13a5074cfb0740e316a45\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://965024e29be08418fd9acef578b5253af5fb0d39227c291298d83dae5d7ffd01\",\"dweb:/ipfs/QmPh2h21EC6L4aWauvk5cFzc4x3Xf4f1brxyrgxeKUuWEs\"]},\"src/libraries/ArbiterUtils.sol\":{\"keccak256\":\"0xb87e2bfb9c7292daf6426fbedc09c8683b92841d1b92e7359c0ff94d42be632f\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://3acf498c3c59891d76db768ea57d8f7f6b4010dcbaf44a5f93d95d72f0b12441\",\"dweb:/ipfs/QmVbkioM8dWwYxqatm1dyo9PRFNZ6c7Kbang7pozbnyS7j\"]},\"src/libraries/SchemaRegistryUtils.sol\":{\"keccak256\":\"0x81e4728ad79515866f28175a00a512afd2f7010bd109ae221defb29a87430cd0\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://4edac7284c764f1236b5875ed00f357f0e30aecc5006c88afe220bef60b541d3\",\"dweb:/ipfs/QmXj8oLa1RXMgHCXtgdbriVqQFgX6rjnPNbmQpwpK2YXsK\"]},\"src/obligations/CommitRevealObligation.sol\":{\"keccak256\":\"0x09de8211753613cb4ff02e88a219a4bf832527d417ad8fe44a384120e67c0bec\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://3f669921bd4da1ef05dfd4fd572f0eac42ea6fd532cdd4b1b9d84d09ae45df7c\",\"dweb:/ipfs/QmWGNxN8oRc3s372EGNbtrAE9JYK94fSogMSkehQbgVJQC\"]}},\"version\":1}",
  "metadata": {
    "compiler": {
      "version": "0.8.27+commit.40a35a09"
    },
    "language": "Solidity",
    "output": {
      "abi": [
        {
          "inputs": [
            {
              "internalType": "contract IEAS",
              "name": "_eas",
              "type": "address"
            },
            {
              "internalType": "contract ISchemaRegistry",
              "name": "_schemaRegistry",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_slashedBondRecipient",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "AccessDenied"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "commitment",
              "type": "bytes32"
            }
          ],
          "type": "error",
          "name": "BondAlreadyClaimed"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "claimer",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "type": "error",
          "name": "BondTransferFailed"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "commitment",
              "type": "bytes32"
            }
          ],
          "type": "error",
          "name": "CommitDeadlineNotReached"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "commitment",
              "type": "bytes32"
            }
          ],
          "type": "error",
          "name": "CommitmentAlreadyExists"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "commitment",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "claimer",
              "type": "address"
            }
          ],
          "type": "error",
          "name": "CommitmentMissing"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "commitment",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "claimer",
              "type": "address"
            }
          ],
          "type": "error",
          "name": "CommitmentTooRecent"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "EmptyCommitment"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "escrowContract",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "escrowUid",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "fulfillmentUid",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "result",
              "type": "bytes"
            }
          ],
          "type": "error",
          "name": "EscrowCollectionFailed"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InsufficientValue"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidEAS"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidLength"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "NotFromThisAttester"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "NotPayable"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "type": "error",
          "name": "OwnableInvalidOwner"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "type": "error",
          "name": "OwnableUnauthorizedAccount"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "ReentrancyGuardReentrantCall"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "commitment",
              "type": "bytes32"
            }
          ],
          "type": "error",
          "name": "RevealTooLate"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "uid",
              "type": "bytes32"
            }
          ],
          "type": "error",
          "name": "SchemaRegistrationFailed"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "type": "error",
          "name": "SlashTransferFailed"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "caller",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "committer",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            }
          ],
          "type": "error",
          "name": "UnauthorizedReveal"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "ZeroBondAmount"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "fulfillmentUid",
              "type": "bytes32",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "claimer",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256",
              "indexed": false
            }
          ],
          "type": "event",
          "name": "BondReclaimed",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "commitment",
              "type": "bytes32",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256",
              "indexed": false
            }
          ],
          "type": "event",
          "name": "BondSlashed",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "commitment",
              "type": "bytes32",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "claimer",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256",
              "indexed": false
            },
            {
              "internalType": "uint256",
              "name": "commitDeadline",
              "type": "uint256",
              "indexed": false
            }
          ],
          "type": "event",
          "name": "Committed",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "previousOwner",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address",
              "indexed": true
            }
          ],
          "type": "event",
          "name": "OwnershipTransferred",
          "anonymous": false
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "ATTESTATION_SCHEMA",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ]
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "ATTESTATION_SCHEMA_REVOCABLE",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "struct Attestation",
              "name": "attestation",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "uid",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint64",
                  "name": "time",
                  "type": "uint64"
                },
                {
                  "internalType": "uint64",
                  "name": "expirationTime",
                  "type": "uint64"
                },
                {
                  "internalType": "uint64",
                  "name": "revocationTime",
                  "type": "uint64"
                },
                {
                  "internalType": "bytes32",
                  "name": "refUID",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "attester",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "revocable",
                  "type": "bool"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ]
            }
          ],
          "stateMutability": "payable",
          "type": "function",
          "name": "attest",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "struct Attestation",
              "name": "obligation",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "uid",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint64",
                  "name": "time",
                  "type": "uint64"
                },
                {
                  "internalType": "uint64",
                  "name": "expirationTime",
                  "type": "uint64"
                },
                {
                  "internalType": "uint64",
                  "name": "revocationTime",
                  "type": "uint64"
                },
                {
                  "internalType": "bytes32",
                  "name": "refUID",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "attester",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "revocable",
                  "type": "bool"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ]
            },
            {
              "internalType": "bytes",
              "name": "demand",
              "type": "bytes"
            },
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "check",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "commitment",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "commitDeadline",
              "type": "uint256"
            }
          ],
          "stateMutability": "payable",
          "type": "function",
          "name": "commit"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "commitmentClaimed",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "commitments",
          "outputs": [
            {
              "internalType": "uint64",
              "name": "commitBlock",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "commitTimestamp",
              "type": "uint64"
            },
            {
              "internalType": "address",
              "name": "committer",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "bondAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "commitDeadline",
              "type": "uint256"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "claimer",
              "type": "address"
            },
            {
              "internalType": "uint64",
              "name": "expirationTime",
              "type": "uint64"
            },
            {
              "internalType": "bytes32",
              "name": "refUID",
              "type": "bytes32"
            },
            {
              "internalType": "struct CommitRevealObligation.ObligationData",
              "name": "data",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes",
                  "name": "payload",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes32",
                  "name": "salt",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                }
              ]
            }
          ],
          "stateMutability": "pure",
          "type": "function",
          "name": "computeCommitment",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "claimer",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "refUID",
              "type": "bytes32"
            },
            {
              "internalType": "struct CommitRevealObligation.ObligationData",
              "name": "data",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes",
                  "name": "payload",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes32",
                  "name": "salt",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                }
              ]
            }
          ],
          "stateMutability": "pure",
          "type": "function",
          "name": "computeCommitment",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "claimer",
              "type": "address"
            },
            {
              "internalType": "uint64",
              "name": "expirationTime",
              "type": "uint64"
            },
            {
              "internalType": "bytes32",
              "name": "refUID",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            }
          ],
          "stateMutability": "pure",
          "type": "function",
          "name": "computeRawCommitment",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            }
          ],
          "stateMutability": "pure",
          "type": "function",
          "name": "decodeDemandData",
          "outputs": [
            {
              "internalType": "struct CommitRevealObligation.DemandData",
              "name": "",
              "type": "tuple",
              "components": [
                {
                  "internalType": "uint256",
                  "name": "bondAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "commitDeadline",
                  "type": "uint256"
                }
              ]
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            }
          ],
          "stateMutability": "pure",
          "type": "function",
          "name": "decodeObligationData",
          "outputs": [
            {
              "internalType": "struct CommitRevealObligation.ObligationData",
              "name": "",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes",
                  "name": "payload",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes32",
                  "name": "salt",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                }
              ]
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "struct CommitRevealObligation.ObligationData",
              "name": "data",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes",
                  "name": "payload",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes32",
                  "name": "salt",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                }
              ]
            },
            {
              "internalType": "bytes32",
              "name": "refUID",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "doObligation",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "uid_",
              "type": "bytes32"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "struct CommitRevealObligation.ObligationData",
              "name": "data",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes",
                  "name": "payload",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes32",
                  "name": "salt",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                }
              ]
            },
            {
              "internalType": "uint64",
              "name": "expirationTime",
              "type": "uint64"
            },
            {
              "internalType": "bytes32",
              "name": "refUID",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "doObligation",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "uid_",
              "type": "bytes32"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "struct CommitRevealObligation.ObligationData",
              "name": "data",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes",
                  "name": "payload",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes32",
                  "name": "salt",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                }
              ]
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "refUID",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "doObligationFor",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "uid_",
              "type": "bytes32"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "struct CommitRevealObligation.ObligationData",
              "name": "data",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes",
                  "name": "payload",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes32",
                  "name": "salt",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                }
              ]
            },
            {
              "internalType": "uint64",
              "name": "expirationTime",
              "type": "uint64"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "refUID",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "doObligationFor",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "uid_",
              "type": "bytes32"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            },
            {
              "internalType": "uint64",
              "name": "expirationTime",
              "type": "uint64"
            },
            {
              "internalType": "bytes32",
              "name": "refUID",
              "type": "bytes32"
            }
          ],
          "stateMutability": "payable",
          "type": "function",
          "name": "doObligationRaw",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "uid_",
              "type": "bytes32"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "uid",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "getObligationData",
          "outputs": [
            {
              "internalType": "struct CommitRevealObligation.ObligationData",
              "name": "",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes",
                  "name": "payload",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes32",
                  "name": "salt",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                }
              ]
            }
          ]
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "getSchema",
          "outputs": [
            {
              "internalType": "struct SchemaRecord",
              "name": "",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "uid",
                  "type": "bytes32"
                },
                {
                  "internalType": "contract ISchemaResolver",
                  "name": "resolver",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "revocable",
                  "type": "bool"
                },
                {
                  "internalType": "string",
                  "name": "schema",
                  "type": "string"
                }
              ]
            }
          ]
        },
        {
          "inputs": [],
          "stateMutability": "pure",
          "type": "function",
          "name": "isPayable",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "struct Attestation[]",
              "name": "attestations",
              "type": "tuple[]",
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "uid",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint64",
                  "name": "time",
                  "type": "uint64"
                },
                {
                  "internalType": "uint64",
                  "name": "expirationTime",
                  "type": "uint64"
                },
                {
                  "internalType": "uint64",
                  "name": "revocationTime",
                  "type": "uint64"
                },
                {
                  "internalType": "bytes32",
                  "name": "refUID",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "attester",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "revocable",
                  "type": "bool"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ]
            },
            {
              "internalType": "uint256[]",
              "name": "values",
              "type": "uint256[]"
            }
          ],
          "stateMutability": "payable",
          "type": "function",
          "name": "multiAttest",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "struct Attestation[]",
              "name": "attestations",
              "type": "tuple[]",
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "uid",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint64",
                  "name": "time",
                  "type": "uint64"
                },
                {
                  "internalType": "uint64",
                  "name": "expirationTime",
                  "type": "uint64"
                },
                {
                  "internalType": "uint64",
                  "name": "revocationTime",
                  "type": "uint64"
                },
                {
                  "internalType": "bytes32",
                  "name": "refUID",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "attester",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "revocable",
                  "type": "bool"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ]
            },
            {
              "internalType": "uint256[]",
              "name": "values",
              "type": "uint256[]"
            }
          ],
          "stateMutability": "payable",
          "type": "function",
          "name": "multiRevoke",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ]
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ]
        },
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "renounceOwnership"
        },
        {
          "inputs": [
            {
              "internalType": "struct CommitRevealObligation.ObligationData",
              "name": "data",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes",
                  "name": "payload",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes32",
                  "name": "salt",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                }
              ]
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "contract IEscrow",
              "name": "escrowContract",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "escrowUid",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "revealAndCollect",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "fulfillmentUid",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "collectResult",
              "type": "bytes"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "struct CommitRevealObligation.ObligationData",
              "name": "data",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes",
                  "name": "payload",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes32",
                  "name": "salt",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                }
              ]
            },
            {
              "internalType": "uint64",
              "name": "expirationTime",
              "type": "uint64"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "contract IEscrow",
              "name": "escrowContract",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "escrowUid",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "revealAndCollect",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "fulfillmentUid",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "collectResult",
              "type": "bytes"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "struct Attestation",
              "name": "attestation",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "uid",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint64",
                  "name": "time",
                  "type": "uint64"
                },
                {
                  "internalType": "uint64",
                  "name": "expirationTime",
                  "type": "uint64"
                },
                {
                  "internalType": "uint64",
                  "name": "revocationTime",
                  "type": "uint64"
                },
                {
                  "internalType": "bytes32",
                  "name": "refUID",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "attester",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "revocable",
                  "type": "bool"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ]
            }
          ],
          "stateMutability": "payable",
          "type": "function",
          "name": "revoke",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_slashedBondRecipient",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "setSlashedBondRecipient"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "commitment",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "slashBond",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ]
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "slashedBondRecipient",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "bytes4",
              "name": "interfaceId",
              "type": "bytes4"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "supportsInterface",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "transferOwnership"
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "version",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ]
        },
        {
          "inputs": [],
          "stateMutability": "payable",
          "type": "receive"
        }
      ],
      "devdoc": {
        "kind": "dev",
        "methods": {
          "attest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))": {
            "params": {
              "attestation": "The new attestation."
            },
            "returns": {
              "_0": "Whether the attestation is valid."
            }
          },
          "check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)": {
            "params": {
              "demand": "Arbiter-specific demand data encoded by the escrow creator.",
              "escrowUid": "The UID of the escrow attestation being fulfilled.",
              "fulfillment": "The EAS attestation being used as fulfillment."
            }
          },
          "commit(bytes32,uint256)": {
            "params": {
              "commitDeadline": "Relative reveal deadline, in seconds after commit, from the escrow demand.",
              "commitment": "keccak256(abi.encode(claimer, expirationTime, refUID, keccak256(data)))."
            }
          },
          "computeCommitment(address,bytes32,(bytes,bytes32,bytes32))": {
            "params": {
              "claimer": "Recipient that will be stored on the fulfillment attestation.",
              "data": "Obligation data that will be revealed.",
              "refUID": "Reference UID that will be stored on the fulfillment attestation."
            },
            "returns": {
              "_0": "Commitment hash to submit in `commit`."
            }
          },
          "computeCommitment(address,uint64,bytes32,(bytes,bytes32,bytes32))": {
            "params": {
              "claimer": "Recipient that will be stored on the fulfillment attestation.",
              "data": "Obligation data that will be revealed.",
              "expirationTime": "EAS expiration timestamp that will be stored on the fulfillment attestation.",
              "refUID": "Reference UID that will be stored on the fulfillment attestation."
            },
            "returns": {
              "_0": "Commitment hash to submit in `commit`."
            }
          },
          "computeRawCommitment(address,uint64,bytes32,bytes)": {
            "params": {
              "claimer": "Recipient that will be stored on the fulfillment attestation.",
              "data": "Pre-encoded obligation data that will be revealed.",
              "expirationTime": "EAS expiration timestamp that will be stored on the fulfillment attestation.",
              "refUID": "Reference UID that will be stored on the fulfillment attestation."
            },
            "returns": {
              "_0": "Commitment hash to submit in `commit`."
            }
          },
          "doObligation((bytes,bytes32,bytes32),bytes32)": {
            "params": {
              "data": "Revealed data (must match a prior commit) and salt.",
              "refUID": "Optional reference UID stored on the fulfillment attestation."
            }
          },
          "doObligation((bytes,bytes32,bytes32),uint64,bytes32)": {
            "params": {
              "data": "Revealed data (must match a prior commit) and salt.",
              "expirationTime": "EAS expiration timestamp, or zero for no expiration.",
              "refUID": "Optional reference UID stored on the fulfillment attestation."
            }
          },
          "doObligationFor((bytes,bytes32,bytes32),address,bytes32)": {
            "params": {
              "data": "Revealed data (must match a prior commit) and salt.",
              "recipient": "The address to set as the attestation recipient.",
              "refUID": "Optional reference UID stored on the fulfillment attestation."
            }
          },
          "doObligationFor((bytes,bytes32,bytes32),uint64,address,bytes32)": {
            "params": {
              "data": "Revealed data (must match a prior commit) and salt.",
              "expirationTime": "EAS expiration timestamp, or zero for no expiration.",
              "recipient": "The address to set as the attestation recipient.",
              "refUID": "Optional reference UID stored on the fulfillment attestation."
            }
          },
          "doObligationRaw(bytes,uint64,bytes32)": {
            "params": {
              "data": "ABI-encoded obligation data.",
              "expirationTime": "EAS expiration timestamp, or zero for no expiration.",
              "refUID": "Reference UID stored on the EAS attestation."
            }
          },
          "getObligationData(bytes32)": {
            "params": {
              "uid": "UID of the fulfillment attestation."
            }
          },
          "isPayable()": {
            "returns": {
              "_0": "Whether the resolver supports ETH transfers."
            }
          },
          "multiAttest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])": {
            "params": {
              "attestations": "The new attestations.",
              "values": "Explicit ETH amounts which were sent with each attestation."
            },
            "returns": {
              "_0": "Whether all the attestations are valid."
            }
          },
          "multiRevoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])": {
            "params": {
              "attestations": "The existing attestations to be revoked.",
              "values": "Explicit ETH amounts which were sent with each revocation."
            },
            "returns": {
              "_0": "Whether the attestations can be revoked."
            }
          },
          "owner()": {
            "details": "Returns the address of the current owner."
          },
          "renounceOwnership()": {
            "details": "Leaves the contract without owner. It will not be possible to call `onlyOwner` functions. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby disabling any functionality that is only available to the owner."
          },
          "revealAndCollect((bytes,bytes32,bytes32),address,address,bytes32)": {
            "params": {
              "data": "Revealed data and salt.",
              "escrowContract": "Escrow contract to collect after reveal.",
              "escrowUid": "UID of the escrow attestation being fulfilled.",
              "recipient": "Recipient to set on the fulfillment attestation; must        equal the original committer and reveal caller."
            },
            "returns": {
              "collectResult": "Return data from the escrow contract's `collect` call.",
              "fulfillmentUid": "UID of the created fulfillment attestation."
            }
          },
          "revealAndCollect((bytes,bytes32,bytes32),uint64,address,address,bytes32)": {
            "params": {
              "data": "Revealed data and salt.",
              "escrowContract": "Escrow contract to collect after reveal.",
              "escrowUid": "UID of the escrow attestation being fulfilled.",
              "expirationTime": "EAS expiration timestamp, or zero for no expiration.",
              "recipient": "Recipient to set on the fulfillment attestation; must        equal the original committer and reveal caller."
            },
            "returns": {
              "collectResult": "Return data from the escrow contract's `collect` call.",
              "fulfillmentUid": "UID of the created fulfillment attestation."
            }
          },
          "revoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))": {
            "params": {
              "attestation": "The existing attestation to be revoked."
            },
            "returns": {
              "_0": "Whether the attestation can be revoked."
            }
          },
          "setSlashedBondRecipient(address)": {
            "params": {
              "_slashedBondRecipient": "New recipient for slashed bonds; address(0) burns the native token."
            }
          },
          "slashBond(bytes32)": {
            "params": {
              "commitment": "The commitment hash whose bond is being slashed."
            }
          },
          "supportsInterface(bytes4)": {
            "details": "Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section] to learn more about how these ids are created. This function call must use less than 30 000 gas."
          },
          "transferOwnership(address)": {
            "details": "Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner."
          },
          "version()": {
            "returns": {
              "_0": "Semver contract version as a string."
            }
          }
        },
        "version": 1
      },
      "userdoc": {
        "kind": "user",
        "methods": {
          "ATTESTATION_SCHEMA()": {
            "notice": "UID of the schema used by attestations created by this contract."
          },
          "ATTESTATION_SCHEMA_REVOCABLE()": {
            "notice": "Whether attestations under `ATTESTATION_SCHEMA` are revocable."
          },
          "attest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))": {
            "notice": "Processes an attestation and verifies whether it's valid."
          },
          "check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)": {
            "notice": "Returns true when `fulfillment` satisfies `demand` for `escrowUid`."
          },
          "commit(bytes32,uint256)": {
            "notice": "Records a commitment hash, locking msg.value as its bond."
          },
          "commitmentClaimed(bytes32)": {
            "notice": "commitmentClaimed[commitment] => bond already returned/slashed."
          },
          "commitments(bytes32)": {
            "notice": "commitments[commitment] => commit information."
          },
          "computeCommitment(address,bytes32,(bytes,bytes32,bytes32))": {
            "notice": "Pure helper to compute the no-expiration commitment expected by this contract."
          },
          "computeCommitment(address,uint64,bytes32,(bytes,bytes32,bytes32))": {
            "notice": "Pure helper to compute the commitment expected by this contract."
          },
          "computeRawCommitment(address,uint64,bytes32,bytes)": {
            "notice": "Pure helper to compute a commitment for pre-encoded obligation data."
          },
          "decodeDemandData(bytes)": {
            "notice": "Decodes ABI-encoded arbiter demand data."
          },
          "decodeObligationData(bytes)": {
            "notice": "Decodes ABI-encoded obligation data."
          },
          "doObligation((bytes,bytes32,bytes32),bytes32)": {
            "notice": "Creates a fulfillment attestation containing the payload and salt.         Validates the commitment, enforces the reveal deadline, and         atomically returns the committed bond to the committer."
          },
          "doObligation((bytes,bytes32,bytes32),uint64,bytes32)": {
            "notice": "Creates a fulfillment attestation containing the payload and salt.         Validates the commitment, enforces the reveal deadline, and         atomically returns the committed bond to the committer."
          },
          "doObligationFor((bytes,bytes32,bytes32),address,bytes32)": {
            "notice": "Creates a fulfillment attestation with an explicit recipient.         The reveal caller, original committer, and attestation recipient         must all be the same address."
          },
          "doObligationFor((bytes,bytes32,bytes32),uint64,address,bytes32)": {
            "notice": "Creates a fulfillment attestation with an explicit recipient.         The reveal caller, original committer, and attestation recipient         must all be the same address."
          },
          "doObligationRaw(bytes,uint64,bytes32)": {
            "notice": "Creates an obligation attestation from pre-encoded data."
          },
          "getObligationData(bytes32)": {
            "notice": "Loads and decodes this contract's obligation data from an attestation UID."
          },
          "getSchema()": {
            "notice": "Returns the schema record registered for this attester."
          },
          "isPayable()": {
            "notice": "Checks if the resolver can be sent ETH."
          },
          "multiAttest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])": {
            "notice": "Processes multiple attestations and verifies whether they are valid."
          },
          "multiRevoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])": {
            "notice": "Processes revocation of multiple attestation and verifies they can be revoked."
          },
          "revealAndCollect((bytes,bytes32,bytes32),address,address,bytes32)": {
            "notice": "Reveals a fulfillment and immediately collects the target escrow."
          },
          "revealAndCollect((bytes,bytes32,bytes32),uint64,address,address,bytes32)": {
            "notice": "Reveals a fulfillment and immediately collects the target escrow."
          },
          "revoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))": {
            "notice": "Processes an attestation revocation and verifies if it can be revoked."
          },
          "setSlashedBondRecipient(address)": {
            "notice": "Updates the recipient for slashed commitment bonds."
          },
          "slashBond(bytes32)": {
            "notice": "Slashes the bond for a commitment whose deadline has passed without a valid reveal."
          },
          "slashedBondRecipient()": {
            "notice": "Recipient of slashed bonds (address(0) = burn)."
          },
          "version()": {
            "notice": "Returns the full semver contract version."
          }
        },
        "version": 1
      }
    },
    "settings": {
      "remappings": [
        "@eas/=lib/eas-contracts/contracts/",
        "@erc8004/=lib/erc-8004-contracts/contracts/",
        "@openzeppelin/=lib/openzeppelin-contracts/",
        "@src/=src/",
        "@test/=test/",
        "ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/",
        "eas-contracts/=lib/eas-contracts/contracts/",
        "erc-8004-contracts/=lib/erc-8004-contracts/contracts/",
        "erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/",
        "eth-gas-reporter/=lib/eas-contracts/node_modules/eth-gas-reporter/",
        "forge-std/=lib/forge-std/src/",
        "halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/",
        "hardhat-deploy/=lib/eas-contracts/node_modules/hardhat-deploy/",
        "hardhat/=lib/eas-contracts/node_modules/hardhat/",
        "openzeppelin-contracts/=lib/openzeppelin-contracts/"
      ],
      "optimizer": {
        "enabled": true,
        "runs": 200
      },
      "metadata": {
        "bytecodeHash": "ipfs"
      },
      "compilationTarget": {
        "src/obligations/CommitRevealObligation.sol": "CommitRevealObligation"
      },
      "evmVersion": "prague",
      "libraries": {},
      "viaIR": true
    },
    "sources": {
      "lib/eas-contracts/contracts/Common.sol": {
        "keccak256": "0x957bd2e6d0d6d637f86208b135c29fbaf4412cb08e5e7a61ede16b80561bf685",
        "urls": [
          "bzz-raw://da1dc9aedbb1d4d39c46c2235918d3adfbc5741dd34a46010cf425d134e7936d",
          "dweb:/ipfs/QmWUk6bXnLaghS2riF3GTFEeURCzgYFMA5woa6AsgPwEgc"
        ],
        "license": "MIT"
      },
      "lib/eas-contracts/contracts/IEAS.sol": {
        "keccak256": "0xdad0674defce04905dc7935f2756d6c477a6e876c0b1b7094b112a862f164c12",
        "urls": [
          "bzz-raw://49e448c26c08952df034692d2ab3519dd40a1ebbeae4ce68b294567441933880",
          "dweb:/ipfs/QmWHcudjskUSCjgqsNWE65LVfWvcYB2vBn8RB1SmzvRLNR"
        ],
        "license": "MIT"
      },
      "lib/eas-contracts/contracts/ISchemaRegistry.sol": {
        "keccak256": "0xea97dcd36a0c422169cbaac06698249e199049b627c16bff93fb8ab829058754",
        "urls": [
          "bzz-raw://d453a929ef64a69cd31195ec2ee5ed1193bfa29f633e13c960e92154c37ad158",
          "dweb:/ipfs/QmXs1Z3njbHs2EMgHonrZDfcwdog4kozHY5tYNrhZK5yqz"
        ],
        "license": "MIT"
      },
      "lib/eas-contracts/contracts/ISemver.sol": {
        "keccak256": "0x04a67939b4e1a8d0a51101b8f69f8882930bbdc66319f38023828625b5d1ff18",
        "urls": [
          "bzz-raw://3dd543fa0e33cef1ea757627f9c2a10a66ee1ce17aa9087f437c5b53a903c7f0",
          "dweb:/ipfs/QmXsy6UsGBzF9zPCCjmiwPpCcX3tHqU13TmR67B69tKnR6"
        ],
        "license": "MIT"
      },
      "lib/eas-contracts/contracts/Semver.sol": {
        "keccak256": "0x4f23442d048661b6aaa188ddc16b69cb310c2e44066b3852026afcb4201d61a9",
        "urls": [
          "bzz-raw://30c36e580cd93d9acb13e1a11e833946a8bd0bd2a8d1b2be049f0d96e0989808",
          "dweb:/ipfs/QmXmQTxKjSrUWutafQsqkbGufXqtzxuDAiMMJjXCHXiEqh"
        ],
        "license": "MIT"
      },
      "lib/eas-contracts/contracts/resolver/ISchemaResolver.sol": {
        "keccak256": "0xb7d1961ed928c620cddf35c2bf46845b10828bc5d73145214630202ed355b6bb",
        "urls": [
          "bzz-raw://cf1cabacfb15c9bace8280b540b52e5aa440e1b4eba675f9782c34ce0f03902f",
          "dweb:/ipfs/QmakYcK4xbrijzvoaBCmBJK6HeaBqbXxWKtDQ1z62aXwCR"
        ],
        "license": "MIT"
      },
      "lib/eas-contracts/contracts/resolver/SchemaResolver.sol": {
        "keccak256": "0x385d8c0edbdc96af15cf8f22333183162561cbf7d3fb0df95287741e59899983",
        "urls": [
          "bzz-raw://ff7e8a17f69dcb7ddc937446e868d34baea61bbe249a8f5d8be486ab93001828",
          "dweb:/ipfs/QmUz9i7ViNK9kUWHeJRtE44HmpbxBDGJBjyec2aPD6Nn3Q"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/access/Ownable.sol": {
        "keccak256": "0xff6d0bb2e285473e5311d9d3caacb525ae3538a80758c10649a4d61029b017bb",
        "urls": [
          "bzz-raw://8ed324d3920bb545059d66ab97d43e43ee85fd3bd52e03e401f020afb0b120f6",
          "dweb:/ipfs/QmfEckWLmZkDDcoWrkEvMWhms66xwTLff9DDhegYpvHo1a"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/utils/Bytes.sol": {
        "keccak256": "0x8140d608316521b1fd71167c3b708ebb8659da070723fc8807609553b296ee33",
        "urls": [
          "bzz-raw://a7bf7db66869ba1e945a0390b85da2f6afc7e42a4735ca918d0d56ac90c50147",
          "dweb:/ipfs/QmRmNyhpBpgzSdQqLtrQCYE7H7eLnVVxh2Yy4YMrySR8AR"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/utils/Context.sol": {
        "keccak256": "0x493033a8d1b176a037b2cc6a04dad01a5c157722049bbecf632ca876224dd4b2",
        "urls": [
          "bzz-raw://6a708e8a5bdb1011c2c381c9a5cfd8a9a956d7d0a9dc1bd8bcdaf52f76ef2f12",
          "dweb:/ipfs/Qmax9WHBnVsZP46ZxEMNRQpLQnrdE4dK8LehML1Py8FowF"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/utils/Panic.sol": {
        "keccak256": "0xf7fe324703a64fc51702311dc51562d5cb1497734f074e4f483bfb6717572d7a",
        "urls": [
          "bzz-raw://c6a5ff4f9fd8649b7ee20800b7fa387d3465bd77cf20c2d1068cd5c98e1ed57a",
          "dweb:/ipfs/QmVSaVJf9FXFhdYEYeCEfjMVHrxDh5qL4CGkxdMWpQCrqG"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol": {
        "keccak256": "0xa516cbf1c7d15d3517c2d668601ce016c54395bf5171918a14e2686977465f53",
        "urls": [
          "bzz-raw://1e1d079e8edfb58efd23a311e315a4807b01b5d1cf153f8fa2d0608b9dec3e99",
          "dweb:/ipfs/QmTBExeX2SDTkn5xbk5ssbYSx7VqRp9H4Ux1CY4uQM4b9N"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/utils/StorageSlot.sol": {
        "keccak256": "0xcf74f855663ce2ae00ed8352666b7935f6cddea2932fdf2c3ecd30a9b1cd0e97",
        "urls": [
          "bzz-raw://9f660b1f351b757dfe01438e59888f31f33ded3afcf5cb5b0d9bf9aa6f320a8b",
          "dweb:/ipfs/QmarDJ5hZEgBtCmmrVzEZWjub9769eD686jmzb2XpSU1cM"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/utils/Strings.sol": {
        "keccak256": "0x36d1750bf1aa5fee9c52adb2f7857ab652daca722fc05dff533b364f67a1139a",
        "urls": [
          "bzz-raw://2e5e7052539b7849d02f3ce25acc1dce29373c11cfae9f0bc918c54b780c549a",
          "dweb:/ipfs/QmRGE32xNkMTo6i4pHHMxjpiu77yPwnTA25SFngw2NXJys"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/utils/introspection/ERC165.sol": {
        "keccak256": "0x2d9dc2fe26180f74c11c13663647d38e259e45f95eb88f57b61d2160b0109d3e",
        "urls": [
          "bzz-raw://81233d1f98060113d9922180bb0f14f8335856fe9f339134b09335e9f678c377",
          "dweb:/ipfs/QmWh6R35SarhAn4z2wH8SU456jJSYL2FgucfTFgbHJJN4E"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol": {
        "keccak256": "0x8891738ffe910f0cf2da09566928589bf5d63f4524dd734fd9cedbac3274dd5c",
        "urls": [
          "bzz-raw://971f954442df5c2ef5b5ebf1eb245d7105d9fbacc7386ee5c796df1d45b21617",
          "dweb:/ipfs/QmadRjHbkicwqwwh61raUEapaVEtaLMcYbQZWs9gUkgj3u"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/utils/math/Math.sol": {
        "keccak256": "0x09e3f1c72d4c5cbe8e2644ab7313f8f7177533ae2f4c24cdcbbeaf520a73734c",
        "urls": [
          "bzz-raw://93208401215d539fa2d81626b207c1f611def7883d0e447b3b5969ebaa7b3c2c",
          "dweb:/ipfs/QmXPxDnQPx8LAweX5ZJqEcwkvs59kP4c64VVDG1Jjq1mef"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/utils/math/SafeCast.sol": {
        "keccak256": "0x195533c86d0ef72bcc06456a4f66a9b941f38eb403739b00f21fd7c1abd1ae54",
        "urls": [
          "bzz-raw://b1d578337048cad08c1c03041cca5978eff5428aa130c781b271ad9e5566e1f8",
          "dweb:/ipfs/QmPFKL2r9CBsMwmUqqdcFPfHZB2qcs9g1HDrPxzWSxomvy"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/utils/math/SignedMath.sol": {
        "keccak256": "0xb1970fac7b64e6c09611e6691791e848d5e3fe410fa5899e7df2e0afd77a99e3",
        "urls": [
          "bzz-raw://db5fbb3dddd8b7047465b62575d96231ba8a2774d37fb4737fbf23340fabbb03",
          "dweb:/ipfs/QmVUSvooZKEdEdap619tcJjTLcAuH6QBdZqAzWwnAXZAWJ"
        ],
        "license": "MIT"
      },
      "src/BaseArbiter.sol": {
        "keccak256": "0x27fa97834bcd6e592f3b534e64859b208c688363d33fb9b62436d009ffff3ed1",
        "urls": [
          "bzz-raw://b61ac6195ae644325adf77fdb301651cddfca4b63d9db5123ee075869f3784aa",
          "dweb:/ipfs/QmYRu5hER8gaMjqyY5bDV9EAwVN12CbS3Z2bW8dLp7sPSE"
        ],
        "license": "UNLICENSED"
      },
      "src/BaseAttester.sol": {
        "keccak256": "0x12339a862aa0571244f4a0c2dae1a7bcc1734717474dbf0d69b63886987d1f99",
        "urls": [
          "bzz-raw://d40e983dece581ecb49a1a01bc87c66e86f8c954cc442a02151ec427d680682d",
          "dweb:/ipfs/QmVA7Tqk1KaYhrZpxWx3cdsjUoxsRaoBjJX8k6nCSEk8En"
        ],
        "license": "UNLICENSED"
      },
      "src/BaseObligation.sol": {
        "keccak256": "0xf00b1317dd9203ea59e8da6c0bb23267b50ecb2751cd11b26a6330d1e596eb7b",
        "urls": [
          "bzz-raw://5b9762a2ba2251c6ae9d23aa3ba49a8124f3348ac13c9271b8b9ada438dff475",
          "dweb:/ipfs/QmeBZUvNjNyC7W1hb1PKQq8CawC5ULWX9KXgJjH37wvPGH"
        ],
        "license": "UNLICENSED"
      },
      "src/IArbiter.sol": {
        "keccak256": "0x00f3f5d8460c738eff4a776cf309efe38342fcc951abfe97d1c2e285acb1e330",
        "urls": [
          "bzz-raw://7201a176f3d5c3d01ca13bbcd9ef5587effe8fabf20e0b8f81f2d6ee362269b9",
          "dweb:/ipfs/QmXn9aSvoGPQuNTxe3mM47RNQ1bfYCEczQCYsDDM9ohc8M"
        ],
        "license": "UNLICENSED"
      },
      "src/IEscrow.sol": {
        "keccak256": "0x8803bb72e285722a5e90f08046cfee7d37acc6cf83c13a5074cfb0740e316a45",
        "urls": [
          "bzz-raw://965024e29be08418fd9acef578b5253af5fb0d39227c291298d83dae5d7ffd01",
          "dweb:/ipfs/QmPh2h21EC6L4aWauvk5cFzc4x3Xf4f1brxyrgxeKUuWEs"
        ],
        "license": "UNLICENSED"
      },
      "src/libraries/ArbiterUtils.sol": {
        "keccak256": "0xb87e2bfb9c7292daf6426fbedc09c8683b92841d1b92e7359c0ff94d42be632f",
        "urls": [
          "bzz-raw://3acf498c3c59891d76db768ea57d8f7f6b4010dcbaf44a5f93d95d72f0b12441",
          "dweb:/ipfs/QmVbkioM8dWwYxqatm1dyo9PRFNZ6c7Kbang7pozbnyS7j"
        ],
        "license": "UNLICENSED"
      },
      "src/libraries/SchemaRegistryUtils.sol": {
        "keccak256": "0x81e4728ad79515866f28175a00a512afd2f7010bd109ae221defb29a87430cd0",
        "urls": [
          "bzz-raw://4edac7284c764f1236b5875ed00f357f0e30aecc5006c88afe220bef60b541d3",
          "dweb:/ipfs/QmXj8oLa1RXMgHCXtgdbriVqQFgX6rjnPNbmQpwpK2YXsK"
        ],
        "license": "UNLICENSED"
      },
      "src/obligations/CommitRevealObligation.sol": {
        "keccak256": "0x09de8211753613cb4ff02e88a219a4bf832527d417ad8fe44a384120e67c0bec",
        "urls": [
          "bzz-raw://3f669921bd4da1ef05dfd4fd572f0eac42ea6fd532cdd4b1b9d84d09ae45df7c",
          "dweb:/ipfs/QmWGNxN8oRc3s372EGNbtrAE9JYK94fSogMSkehQbgVJQC"
        ],
        "license": "UNLICENSED"
      }
    },
    "version": 1
  },
  "id": 126
} as const;
