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
      "name": "REFERENCE_ATTESTATION_SCHEMA",
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
      "name": "collect",
      "inputs": [
        {
          "name": "_escrow",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "_fulfillment",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "decodeCondition",
      "inputs": [
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "arbiter",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "demand",
          "type": "bytes",
          "internalType": "bytes"
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
          "internalType": "struct UnconditionalAttestationReferenceEscrowObligation.ObligationData",
          "components": [
            {
              "name": "arbiter",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "demand",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "referencedAttestationUid",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "expirationTime",
              "type": "uint64",
              "internalType": "uint64"
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
          "internalType": "struct UnconditionalAttestationReferenceEscrowObligation.ObligationData",
          "components": [
            {
              "name": "arbiter",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "demand",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "referencedAttestationUid",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "expirationTime",
              "type": "uint64",
              "internalType": "uint64"
            }
          ]
        },
        {
          "name": "expirationTime",
          "type": "uint64",
          "internalType": "uint64"
        }
      ],
      "outputs": [
        {
          "name": "",
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
          "internalType": "struct UnconditionalAttestationReferenceEscrowObligation.ObligationData",
          "components": [
            {
              "name": "arbiter",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "demand",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "referencedAttestationUid",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "expirationTime",
              "type": "uint64",
              "internalType": "uint64"
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
        }
      ],
      "outputs": [
        {
          "name": "",
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
          "internalType": "struct UnconditionalAttestationReferenceEscrowObligation.ObligationData",
          "components": [
            {
              "name": "arbiter",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "demand",
              "type": "bytes",
              "internalType": "bytes"
            },
            {
              "name": "referencedAttestationUid",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "expirationTime",
              "type": "uint64",
              "internalType": "uint64"
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
      "name": "reclaim",
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
          "type": "bool",
          "internalType": "bool"
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
      "name": "EscrowCollected",
      "inputs": [
        {
          "name": "escrowUid",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "fulfillmentUid",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "fulfiller",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "EscrowMade",
      "inputs": [
        {
          "name": "escrowUid",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "escrower",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "EscrowReclaimed",
      "inputs": [
        {
          "name": "escrowUid",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "escrower",
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
      "name": "AttestationNotFound",
      "inputs": [
        {
          "name": "attestationId",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ]
    },
    {
      "type": "error",
      "name": "AttestationRevoked",
      "inputs": []
    },
    {
      "type": "error",
      "name": "DeadlineExpired",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InsufficientValue",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidAttestationUid",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidEAS",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidEscrowAttestation",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidFulfillment",
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
      "name": "ReentrancyGuardReentrantCall",
      "inputs": []
    },
    {
      "type": "error",
      "name": "RevocationFailed",
      "inputs": [
        {
          "name": "attestationId",
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
      "name": "UnauthorizedCall",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x6101a08060405234610256576040816124e38038038091610020828561025a565b8339810103126102565780516001600160a01b038116918282036102565760200151906001600160a01b038216808303610256576040519361006360808661025a565b605685527f6164647265737320617262697465722c2062797465732064656d616e642c206260208601527f797465733332207265666572656e6365644174746573746174696f6e5569642c60408601527f2075696e7436342065787069726174696f6e54696d650000000000000000000060608601526001608052600360a0525f60c0521561024757610175938261010e9360e0526101205283610100526001610160523091610375565b6101405260017f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f005560405161014460408261025a565b602081527f62797465733332207265666572656e6365644174746573746174696f6e55696460208201523091610550565b61018052604051611e48908161069b823960805181610fc3015260a05181610fee015260c05181611019015260e05181611b1901526101005181610e3a0152610120518181816102be015281816107350152818161094001528181610acc015281816118ad0152611cf4015261014051818181610148015281816107750152818161089001528181610a7d01528181610e0801528181610f81015281816117120152611815015261016051818181610818015281816108d301526118610152610180518181816103f30152610c300152f35b6341bc07ff60e11b5f5260045ffd5b5f80fd5b601f909101601f19168101906001600160401b0382119082101761027d57604052565b634e487b7160e01b5f52604160045260245ffd5b602081830312610256578051906001600160401b0382116102565701906080828203126102565760405191608083016001600160401b0381118482101761027d576040528051835260208101516001600160a01b0381168103610256576020840152604081015180151581036102565760408401526060810151906001600160401b038211610256570181601f82011215610256578051906001600160401b03821161027d576040519261034f601f8401601f19166020018561025a565b8284526020838301011161025657815f9260208093018386015e83010152606082015290565b929160405190602082018351926103bf6015602083818901978089885e810160018060601b03198860601b1683820152600160f81b60348201520301600a1981018452018261025a565b5190206040516351753e3760e11b81526004810182905290956001600160a01b031693905f81602481885afa80156104d05787915f91610536575b505114610530579060846020926040519485938492630c1af44f60e31b8452606060048501525180928160648601528585015e5f84838501015260018060a01b0316602483015260016044830152601f801991011681010301815f865af15f91816104fc575b506104db57505f602491604051928380926351753e3760e11b82528760048301525afa80156104d05783915f916104ae575b5051146104ac5750639e6113d560e01b5f5260045260245ffd5b565b6104ca91503d805f833e6104c2818361025a565b810190610291565b5f610492565b6040513d5f823e3d90fd5b919280915082036104ea575090565b639e6113d560e01b5f5260045260245ffd5b9091506020813d602011610528575b816105186020938361025a565b810103126102565751905f610460565b3d915061050b565b50505050565b61054a91503d805f833e6104c2818361025a565b5f6103fa565b929160405190602082018351926105966015602083818901978089885e810160018060601b03198860601b16838201525f60348201520301600a1981018452018261025a565b5190206040516351753e3760e11b81526004810182905290956001600160a01b031693905f81602481885afa80156104d05787915f91610680575b505114610530579060846020926040519485938492630c1af44f60e31b8452606060048501525180928160648601528585015e5f84838501015260018060a01b031660248301525f6044830152601f801991011681010301815f865af15f91816104fc57506104db57505f602491604051928380926351753e3760e11b82528760048301525afa80156104d05783915f916104ae575051146104ac5750639e6113d560e01b5f5260045260245ffd5b61069491503d805f833e6104c2818361025a565b5f6105d156fe6080806040526004361015610029575b50361561001a575f80fd5b631574f9f360e01b5f5260045ffd5b5f905f3560e01c90816301ffc9a7146111965750806332bd03ad146111195780634b379a90146110a657806354fd4d5014610fa45780635bf2f20d14610f6a5780636b122fe014610dc9578063760bd11814610d6b57806388e5b2d914610bfa5780638da3721a14610c535780638e8a4da414610c1957806391db0b7e14610bfa57806396afb36514610a4e578063b3b902d41461083d578063b587a5eb14610800578063c6ec5070146106f4578063c93844be1461061d578063ce46e04614610601578063e49617e1146105dc578063e60c3505146105dc5763ea6ec49c0361000f57346105d95760403660031901126105d9576024359060043561012d611b71565b61013681611cce565b61013f84611cce565b906020810151907f00000000000000000000000000000000000000000000000000000000000000008092036105ca578051156105bb576001600160401b0360608201511680151590816105b0575b506105a1576001600160401b036080820151166105925761027e60206101208084019360c0876102906101c0885161163e565b9190945191604051988997889687966346d1b90d60e11b885260606004890152805160648901528b81015160848901526001600160401b0360408201511660a48901526001600160401b0360608201511660c48901526001600160401b0360808201511660e489015260a0810151610104890152019d8e60018060a01b0390511661012488015260018060a01b0360e082015116610144880152610100810151151561016488015201516101406101848701526101a4860190611241565b84810360031901602486015290611241565b604483019190915203916001600160a01b03165afa90811561058757869161054d575b501561053e576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031692906102f1816112b0565b85815286602082015260405191610307836112b0565b82526020820152823b1561053a57604051634692626760e01b8152815160048201526020918201518051602483015290910151604482015285808260648183885af19182610525575b505061036a5763614cf93960e01b85526004849052602485fd5b6104348594939260209261039160018060a01b0386511691518580825183010191016115be565b60406001600160401b036060830151169101516040519181878401528683526103bb6040846112e6565b604051936103c8856112cb565b845286840152886040840152606083015260808201528660a0820152604051906103f1826112b0565b7f000000000000000000000000000000000000000000000000000000000000000082528482015260405196878094819363f17325e760e01b835260048301611d7c565b03925af192831561051a5784936104c0575b50907ff96e77bc177ae8e2ff25185e7c6d85f8ba97c8bdd9d46933aac70a7a33edf6c0946104bc9392604051936020850152602084526104876040856112e6565b516040519687966001600160a01b03909216939180a460015f516020611df35f395f51905f5255602083526020830190611241565b0390f35b9250906020833d602011610512575b816104dc602093836112e6565b8101031261050e57915191907ff96e77bc177ae8e2ff25185e7c6d85f8ba97c8bdd9d46933aac70a7a33edf6c0610446565b5f80fd5b3d91506104cf565b6040513d86823e3d90fd5b8161052f916112e6565b61053a57855f610350565b8580fd5b630ebe58ef60e11b8552600485fd5b90506020813d60201161057f575b81610568602093836112e6565b8101031261053a5761057990611539565b5f6102b3565b3d915061055b565b6040513d88823e3d90fd5b637b6227e960e11b8552600485fd5b631ab7da6b60e01b8552600485fd5b90504210155f61018d565b635c2c7f8960e01b8552600485fd5b63629cd40b60e11b8552600485fd5b80fd5b60206105f76105ea3661146d565b6105f2611b17565b611b58565b6040519015158152f35b50346105d957806003193601126105d957602090604051908152f35b50346105d95760203660031901126105d9576004356001600160401b0381116106ec5761064e9036906004016113f6565b6106599291926117e3565b508201916020818403126106ec578035906001600160401b0382116106f05701916080838203126106ec576040519161069183611265565b61069a8461122d565b83526020840135906001600160401b0382116105d95750836106c66106db936060936104bc9701611358565b60208501526040810135604085015201611219565b606082015260405191829182611423565b5080fd5b8280fd5b50346105d95760203660031901126105d95761070e6117e3565b50610717611ba9565b506040516328c44a9960e21b815260048035908201529080826024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9182156107f35781926107cf575b5060208201517f0000000000000000000000000000000000000000000000000000000000000000036107c0576104bc6107b4610120840151602080825183010191016115be565b60405191829182611423565b635527981560e11b8152600490fd5b6107ec9192503d8084833e6107e481836112e6565b810190611bf3565b905f61076d565b50604051903d90823e3d90fd5b50346105d957806003193601126105d95760206040517f000000000000000000000000000000000000000000000000000000000000000015158152f35b5060603660031901126105d9576004356001600160401b0381116106ec5761086c61093b9136906004016113f6565b9290610885610879611203565b91604435953691611322565b9061088e611b71565b7f0000000000000000000000000000000000000000000000000000000000000000906001600160401b03604051916108c5836112cb565b3383521680602083015260207f00000000000000000000000000000000000000000000000000000000000000001515928360408201528860608201528560808201528660a08201526040519061091a826112b0565b858252828201526040518098819263f17325e760e01b835260048301611d7c565b0381887f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1958615610a43578596610a08575b509060209661012093926040519361098f85611294565b888552898501526001600160401b0342166040850152606084015285608084015260a08301523360c08301523060e08301526101008201520152817f8f7f2dbafd79125e808bf16a53d7fa4e17b8b6374ced76d946a45f94b7bf4d06339280a360015f516020611df35f395f51905f5255604051908152f35b92919095506020833d602011610a3b575b81610a26602093836112e6565b8101031261050e579151949091906020610978565b3d9150610a19565b6040513d87823e3d90fd5b503461050e57602036600319011261050e5760043590610a6c611b71565b610a7582611cce565b9160208301517f0000000000000000000000000000000000000000000000000000000000000000809103610beb57606084016001600160401b0381511615610bdc57516001600160401b03164210610bdc576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690610afe816112b0565b8381525f602082015260405192610b14846112b0565b83526020830152803b1561050e57604051634692626760e01b815282516004820152602092830151805160248301529092015160448301525f908290606490829084905af19081610bc7575b50610b785763614cf93960e01b825260045260249150fd5b60209260c060018060a01b0391015116907f655ef333d5efcbf5aa343f02bcd9e3539f9c9f9ee8b9cfa7d8910b1bd7e0a8326040519380a360015f516020611df35f395f51905f525560018152f35b610bd49193505f906112e6565b5f915f610b60565b637bf6a16f60e01b5f5260045ffd5b63629cd40b60e11b5f5260045ffd5b60206105f7610c08366113a6565b92610c14929192611b17565b611667565b3461050e575f36600319011261050e5760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b3461050e57606036600319011261050e576004356001600160401b03811161050e57610140600319823603011261050e5760405190610c9182611294565b8060040135825260248101356020830152610cae60448201611219565b6040830152610cbf60648201611219565b6060830152610cd060848201611219565b608083015260a481013560a0830152610ceb60c4820161122d565b60c0830152610cfc60e4820161122d565b60e0830152610104810135801515810361050e57610100830152610124810135906001600160401b03821161050e576004610d3a9236920101611358565b6101208201526024356001600160401b03811161050e57602091610d656105f7923690600401611358565b9061170b565b3461050e57602036600319011261050e576004356001600160401b03811161050e57610d9e610da3913690600401611358565b61163e565b604080516001600160a01b0390931683526020830181905282916104bc91830190611241565b3461050e575f36600319011261050e57606080604051610de881611265565b5f81525f60208201525f604082015201526040516351753e3760e11b81527f000000000000000000000000000000000000000000000000000000000000000060048201525f8160248160018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165afa8015610f5f575f90610eaf575b6060906104bc604051928392602084528051602085015260018060a01b0360208201511660408501526040810151151582850152015160808084015260a0830190611241565b503d805f833e610ebf81836112e6565b81019060208183031261050e578051906001600160401b03821161050e570160808183031261050e5760405190610ef582611265565b8051825260208101516001600160a01b038116810361050e576020830152610f1f60408201611539565b60408301526060810151906001600160401b03821161050e570182601f8201121561050e57606092816020610f5693519101611546565b82820152610e69565b6040513d5f823e3d90fd5b3461050e575f36600319011261050e5760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b3461050e575f36600319011261050e576104bc60206110926001610fe77f00000000000000000000000000000000000000000000000000000000000000006119aa565b81846110127f00000000000000000000000000000000000000000000000000000000000000006119aa565b818061103d7f00000000000000000000000000000000000000000000000000000000000000006119aa565b9260405199878b985191829101848a015e870190601760f91b83830152805192839101602183015e010190601760f91b84830152805192839101600283015e01015f838201520301601f1981018352826112e6565b604051918291602083526020830190611241565b3461050e57604036600319011261050e576004356001600160401b03811161050e576080600319823603011261050e576111116110fc60209261110a6110ea611203565b916040519384916004018783016114a1565b03601f1981018452836112e6565b3391611807565b604051908152f35b3461050e57606036600319011261050e576004356001600160401b03811161050e576080600319823603011261050e57611151611203565b906044356001600160a01b038116810361050e57602092611183611191611111946040519283916004018883016114a1565b03601f1981018352826112e6565b611807565b3461050e57602036600319011261050e576004359063ffffffff60e01b821680920361050e576020916346d1b90d60e11b81149081156111d8575b5015158152f35b630acaa6e160e01b8114915081156111f2575b50836111d1565b6301ffc9a760e01b149050836111eb565b602435906001600160401b038216820361050e57565b35906001600160401b038216820361050e57565b35906001600160a01b038216820361050e57565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b608081019081106001600160401b0382111761128057604052565b634e487b7160e01b5f52604160045260245ffd5b61014081019081106001600160401b0382111761128057604052565b604081019081106001600160401b0382111761128057604052565b60c081019081106001600160401b0382111761128057604052565b90601f801991011681019081106001600160401b0382111761128057604052565b6001600160401b03811161128057601f01601f191660200190565b92919261132e82611307565b9161133c60405193846112e6565b82948184528183011161050e578281602093845f960137010152565b9080601f8301121561050e5781602061137393359101611322565b90565b9181601f8401121561050e578235916001600160401b03831161050e576020808501948460051b01011161050e57565b604060031982011261050e576004356001600160401b03811161050e57816113d091600401611376565b92909291602435906001600160401b03821161050e576113f291600401611376565b9091565b9181601f8401121561050e578235916001600160401b03831161050e576020838186019501011161050e57565b6020815260018060a01b03825116602082015260806001600160401b03606061145a602086015184604087015260a0860190611241565b9460408101518286015201511691015290565b602060031982011261050e57600435906001600160401b03821161050e5761014090829003600319011261050e5760040190565b602081526001600160a01b036114b68361122d565b1660208201526020820135601e198336030181121561050e5782016020813591016001600160401b03821161050e57813603811361050e57611527606060c095846001600160401b0394608060408901528160a0890152888801375f87868801015260408101358287015201611219565b166080830152601f01601f1916010190565b5190811515820361050e57565b92919261155282611307565b9161156060405193846112e6565b82948184528183011161050e578281602093845f96015e010152565b51906001600160a01b038216820361050e57565b9080601f8301121561050e57815161137392602001611546565b51906001600160401b038216820361050e57565b60208183031261050e578051906001600160401b03821161050e570160808183031261050e57604051916115f183611265565b6115fa8261157c565b83526020820151916001600160401b03831161050e57611621606092611636948301611590565b602085015260408101516040850152016115aa565b606082015290565b61165190602080825183010191016115be565b80516020909101516001600160a01b0390911691565b9290928184036116fc575f91345b858410156116f157818410156116dd578360051b80860135908282116116ce5784013561013e198536030181121561050e576116b2908501611b58565b156116c35760019103930192611675565b505050505050505f90565b63044044a560e21b5f5260045ffd5b634e487b7160e01b5f52603260045260245ffd5b505050505050600190565b63251f56a160e21b5f5260045ffd5b60208101517f0000000000000000000000000000000000000000000000000000000000000000036117dd57611751610120611761920151602080825183010191016115be565b91602080825183010191016115be565b604082015160408201511491826117b8575b8261179f575b8261178357505090565b6020919250810151818151910120910151602081519101201490565b805182516001600160a01b039081169116149250611779565b91506001600160401b036060830151166001600160401b036060830151161491611773565b50505f90565b604051906117f082611265565b5f6060838281528160208201528260408201520152565b6118a892611813611b71565b7f0000000000000000000000000000000000000000000000000000000000000000906001600160401b036040519161184a836112cb565b60018060a01b0316948583521680602083015260207f00000000000000000000000000000000000000000000000000000000000000001515928360408201525f60608201528560808201525f60a08201526040519061091a826112b0565b03815f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1958615610f5f575f9661196e575b50906101209291604051926118f984611294565b87845260208401526001600160401b034216604084015260608301525f60808301525f60a08301528460c08301523060e08301526101008201520152817f8f7f2dbafd79125e808bf16a53d7fa4e17b8b6374ced76d946a45f94b7bf4d065f80a39060015f516020611df35f395f51905f5255565b92919095506020833d6020116119a2575b8161198c602093836112e6565b8101031261050e576101209251959091926118e5565b3d915061197f565b805f9172184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b821015611af4575b806d04ee2d6d415b85acef8100000000600a921015611ad9575b662386f26fc10000811015611ac5575b6305f5e100811015611ab4575b612710811015611aa5575b6064811015611a97575b1015611a8c575b600a60216001840193611a3185611307565b94611a3f60405196876112e6565b808652611a4e601f1991611307565b013660208701378401015b5f1901916f181899199a1a9b1b9c1cb0b131b232b360811b8282061a8353048015611a8757600a9091611a59565b505090565b600190910190611a1f565b606460029104930192611a18565b61271060049104930192611a0e565b6305f5e10060089104930192611a03565b662386f26fc10000601091049301926119f6565b6d04ee2d6d415b85acef8100000000602091049301926119e6565b506040915072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b81046119cc565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303611b4957565b634ca8886760e01b5f5260045ffd5b60e0013560018060a01b03811680910361050e57301490565b60025f516020611df35f395f51905f525414611b9a5760025f516020611df35f395f51905f5255565b633ee5aeb560e01b5f5260045ffd5b60405190611bb682611294565b6060610120835f81525f60208201525f60408201525f838201525f60808201525f60a08201525f60c08201525f60e08201525f6101008201520152565b60208183031261050e578051906001600160401b03821161050e57016101408183031261050e5760405191611c2783611294565b8151835260208201516020840152611c41604083016115aa565b6040840152611c52606083016115aa565b6060840152611c63608083016115aa565b608084015260a082015160a0840152611c7e60c0830161157c565b60c0840152611c8f60e0830161157c565b60e0840152611ca16101008301611539565b6101008401526101208201516001600160401b03811161050e57611cc59201611590565b61012082015290565b90611cd7611ba9565b506040516328c44a9960e21b815260048101839052915f836024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa928315610f5f575f93611d60575b508251818115918215611d55575b5050611d435750565b6301fb6dd160e01b5f5260045260245ffd5b14159050815f611d3a565b611d759193503d805f833e6107e481836112e6565b915f611d2c565b9060209081835280518284015201519060408082015260018060a01b0382511660608201526001600160401b0360208301511660808201526040820151151560a0820152606082015160c082015261010060a0611de9608085015160c060e0860152610120850190611241565b9301519101529056fe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a26469706673582212201c6eb8eecb79e7d555e1bc0edb4faa84ec551c99464665e3340515d75d3b41cd64736f6c634300081b0033",
    "sourceMap": "948:4730:68:-:0;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;1717:4;948:4730;759:14:6;688:1:9;783:14:6;;-1:-1:-1;807:14:6;;708:26:9;704:76;;1789:106:68;790:10:9;;2065:81:55;790:10:9;;;1932::55;;1952:32;;;1717:4:68;1994:40:55;;2128:4;2065:81;;:::i;:::-;2044:102;;1717:4:68;1505:66:41;2365:1;948:4730:68;;;;;;:::i;:::-;;;;;;;;;2128:4:55;1789:106:68;;:::i;:::-;1746:149;;948:4730;;;;;;;;;;;;;;783:14:6;948:4730:68;;;;;807:14:6;948:4730:68;;;;;790:10:9;948:4730:68;;;;;1952:32:55;948:4730:68;;;;;1932:10:55;948:4730:68;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2044:102:55;948:4730:68;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1994:40:55;948:4730:68;;;;;;;;;;;;;;;1746:149;948:4730;;;;;;;;;;;704:76:9;757:12;;;-1:-1:-1;757:12:9;;-1:-1:-1;757:12:9;948:4730:68;-1:-1:-1;948:4730:68;;;;;;;-1:-1:-1;;948:4730:68;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;:::o;:::-;;;;-1:-1:-1;948:4730:68;;;;;-1:-1:-1;948:4730:68;;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;-1:-1:-1;;948:4730:68;;;;;:::i;:::-;;;;;;;;;;;;;-1:-1:-1;948:4730:68;;;;;;;;;;;;;;;;;;:::o;597:755:62:-;;;948:4730:68;;1602:45:62;;;;948:4730:68;;;1602:45:62;948:4730:68;1602:45:62;948:4730:68;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1602:45:62;;;;;;;;;;;:::i;:::-;948:4730:68;1592:56:62;;948:4730:68;;-1:-1:-1;;;880:29:62;;;;;948:4730:68;;;1592:56:62;;-1:-1:-1;;;;;948:4730:68;;;-1:-1:-1;948:4730:68;880:29:62;948:4730:68;;880:29:62;;;;;;;;-1:-1:-1;880:29:62;;;597:755;948:4730:68;;923:19:62;919:35;;948:4730:68;;1602:45:62;948:4730:68;;;;;;;;;;;969:52:62;;948:4730:68;880:29:62;969:52;;948:4730:68;;;;;;;;;;;;;-1:-1:-1;948:4730:68;;;;;;;;;;;;880:29:62;948:4730:68;;;1717:4;948:4730;;;;;;;;;;;;969:52:62;;;-1:-1:-1;969:52:62;;;-1:-1:-1;;969:52:62;;;597:755;-1:-1:-1;965:381:62;;948:4730:68;-1:-1:-1;880:29:62;948:4730:68;;;;;;;;;;1207:29:62;;;880;1207;;948:4730:68;1207:29:62;;;;;;;;-1:-1:-1;1207:29:62;;;965:381;948:4730:68;;1254:19:62;1250:35;;1101:29;;;;-1:-1:-1;1306:29:62;880;948:4730:68;880:29:62;-1:-1:-1;1306:29:62;1250:35;1275:10::o;1207:29::-;;;;;;-1:-1:-1;1207:29:62;;;;;;:::i;:::-;;;;;:::i;:::-;;;;;948:4730:68;;;-1:-1:-1;948:4730:68;;;;;965:381:62;1072:20;;;;;;;1068:62;;1144:20;;:::o;1068:62::-;1101:29;;;-1:-1:-1;1101:29:62;880;948:4730:68;880:29:62;-1:-1:-1;1101:29:62;969:52;;;;1602:45;969:52;;1602:45;969:52;;;;;;1602:45;969:52;;;:::i;:::-;;;948:4730:68;;;;;969:52:62;;;;;;;-1:-1:-1;969:52:62;;919:35;944:10;;;;:::o;880:29::-;;;;;;-1:-1:-1;880:29:62;;;;;;:::i;:::-;;;;597:755;;;948:4730:68;;1602:45:62;;;;948:4730:68;;;1602:45:62;948:4730:68;1602:45:62;948:4730:68;;;;;;;;;;;;;;;;;;;;;;;;;691:1:9;948:4730:68;;;;1602:45:62;;;;;;;;;;;:::i;:::-;948:4730:68;1592:56:62;;948:4730:68;;-1:-1:-1;;;880:29:62;;;;;948:4730:68;;;1592:56:62;;-1:-1:-1;;;;;948:4730:68;;;-1:-1:-1;948:4730:68;880:29:62;948:4730:68;;880:29:62;;;;;;;;691:1:9;880:29:62;;;597:755;948:4730:68;;923:19:62;919:35;;948:4730:68;;1602:45:62;948:4730:68;;;;;;;;;;;969:52:62;;948:4730:68;880:29:62;969:52;;948:4730:68;;;;;;;;;;;;;691:1:9;948:4730:68;;;;;;;;;;;;880:29:62;948:4730:68;;;691:1:9;948:4730:68;;;;;;;;;;;;969:52:62;;;691:1:9;969:52:62;;;691:1:9;;969:52:62;;;-1:-1:-1;965:381:62;;948:4730:68;691:1:9;880:29:62;948:4730:68;;;;;;;;;;1207:29:62;;;880;1207;;948:4730:68;1207:29:62;;;;;;;;691:1:9;1207:29:62;;;948:4730:68;;1254:19:62;1250:35;;1101:29;;;;691:1:9;1306:29:62;880;948:4730:68;880:29:62;691:1:9;1306:29:62;880;;;;;;691:1:9;880:29:62;;;;;;:::i;:::-;;;",
    "linkReferences": {}
  },
  "deployedBytecode": {
    "object": "0x6080806040526004361015610029575b50361561001a575f80fd5b631574f9f360e01b5f5260045ffd5b5f905f3560e01c90816301ffc9a7146111965750806332bd03ad146111195780634b379a90146110a657806354fd4d5014610fa45780635bf2f20d14610f6a5780636b122fe014610dc9578063760bd11814610d6b57806388e5b2d914610bfa5780638da3721a14610c535780638e8a4da414610c1957806391db0b7e14610bfa57806396afb36514610a4e578063b3b902d41461083d578063b587a5eb14610800578063c6ec5070146106f4578063c93844be1461061d578063ce46e04614610601578063e49617e1146105dc578063e60c3505146105dc5763ea6ec49c0361000f57346105d95760403660031901126105d9576024359060043561012d611b71565b61013681611cce565b61013f84611cce565b906020810151907f00000000000000000000000000000000000000000000000000000000000000008092036105ca578051156105bb576001600160401b0360608201511680151590816105b0575b506105a1576001600160401b036080820151166105925761027e60206101208084019360c0876102906101c0885161163e565b9190945191604051988997889687966346d1b90d60e11b885260606004890152805160648901528b81015160848901526001600160401b0360408201511660a48901526001600160401b0360608201511660c48901526001600160401b0360808201511660e489015260a0810151610104890152019d8e60018060a01b0390511661012488015260018060a01b0360e082015116610144880152610100810151151561016488015201516101406101848701526101a4860190611241565b84810360031901602486015290611241565b604483019190915203916001600160a01b03165afa90811561058757869161054d575b501561053e576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031692906102f1816112b0565b85815286602082015260405191610307836112b0565b82526020820152823b1561053a57604051634692626760e01b8152815160048201526020918201518051602483015290910151604482015285808260648183885af19182610525575b505061036a5763614cf93960e01b85526004849052602485fd5b6104348594939260209261039160018060a01b0386511691518580825183010191016115be565b60406001600160401b036060830151169101516040519181878401528683526103bb6040846112e6565b604051936103c8856112cb565b845286840152886040840152606083015260808201528660a0820152604051906103f1826112b0565b7f000000000000000000000000000000000000000000000000000000000000000082528482015260405196878094819363f17325e760e01b835260048301611d7c565b03925af192831561051a5784936104c0575b50907ff96e77bc177ae8e2ff25185e7c6d85f8ba97c8bdd9d46933aac70a7a33edf6c0946104bc9392604051936020850152602084526104876040856112e6565b516040519687966001600160a01b03909216939180a460015f516020611df35f395f51905f5255602083526020830190611241565b0390f35b9250906020833d602011610512575b816104dc602093836112e6565b8101031261050e57915191907ff96e77bc177ae8e2ff25185e7c6d85f8ba97c8bdd9d46933aac70a7a33edf6c0610446565b5f80fd5b3d91506104cf565b6040513d86823e3d90fd5b8161052f916112e6565b61053a57855f610350565b8580fd5b630ebe58ef60e11b8552600485fd5b90506020813d60201161057f575b81610568602093836112e6565b8101031261053a5761057990611539565b5f6102b3565b3d915061055b565b6040513d88823e3d90fd5b637b6227e960e11b8552600485fd5b631ab7da6b60e01b8552600485fd5b90504210155f61018d565b635c2c7f8960e01b8552600485fd5b63629cd40b60e11b8552600485fd5b80fd5b60206105f76105ea3661146d565b6105f2611b17565b611b58565b6040519015158152f35b50346105d957806003193601126105d957602090604051908152f35b50346105d95760203660031901126105d9576004356001600160401b0381116106ec5761064e9036906004016113f6565b6106599291926117e3565b508201916020818403126106ec578035906001600160401b0382116106f05701916080838203126106ec576040519161069183611265565b61069a8461122d565b83526020840135906001600160401b0382116105d95750836106c66106db936060936104bc9701611358565b60208501526040810135604085015201611219565b606082015260405191829182611423565b5080fd5b8280fd5b50346105d95760203660031901126105d95761070e6117e3565b50610717611ba9565b506040516328c44a9960e21b815260048035908201529080826024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9182156107f35781926107cf575b5060208201517f0000000000000000000000000000000000000000000000000000000000000000036107c0576104bc6107b4610120840151602080825183010191016115be565b60405191829182611423565b635527981560e11b8152600490fd5b6107ec9192503d8084833e6107e481836112e6565b810190611bf3565b905f61076d565b50604051903d90823e3d90fd5b50346105d957806003193601126105d95760206040517f000000000000000000000000000000000000000000000000000000000000000015158152f35b5060603660031901126105d9576004356001600160401b0381116106ec5761086c61093b9136906004016113f6565b9290610885610879611203565b91604435953691611322565b9061088e611b71565b7f0000000000000000000000000000000000000000000000000000000000000000906001600160401b03604051916108c5836112cb565b3383521680602083015260207f00000000000000000000000000000000000000000000000000000000000000001515928360408201528860608201528560808201528660a08201526040519061091a826112b0565b858252828201526040518098819263f17325e760e01b835260048301611d7c565b0381887f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1958615610a43578596610a08575b509060209661012093926040519361098f85611294565b888552898501526001600160401b0342166040850152606084015285608084015260a08301523360c08301523060e08301526101008201520152817f8f7f2dbafd79125e808bf16a53d7fa4e17b8b6374ced76d946a45f94b7bf4d06339280a360015f516020611df35f395f51905f5255604051908152f35b92919095506020833d602011610a3b575b81610a26602093836112e6565b8101031261050e579151949091906020610978565b3d9150610a19565b6040513d87823e3d90fd5b503461050e57602036600319011261050e5760043590610a6c611b71565b610a7582611cce565b9160208301517f0000000000000000000000000000000000000000000000000000000000000000809103610beb57606084016001600160401b0381511615610bdc57516001600160401b03164210610bdc576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690610afe816112b0565b8381525f602082015260405192610b14846112b0565b83526020830152803b1561050e57604051634692626760e01b815282516004820152602092830151805160248301529092015160448301525f908290606490829084905af19081610bc7575b50610b785763614cf93960e01b825260045260249150fd5b60209260c060018060a01b0391015116907f655ef333d5efcbf5aa343f02bcd9e3539f9c9f9ee8b9cfa7d8910b1bd7e0a8326040519380a360015f516020611df35f395f51905f525560018152f35b610bd49193505f906112e6565b5f915f610b60565b637bf6a16f60e01b5f5260045ffd5b63629cd40b60e11b5f5260045ffd5b60206105f7610c08366113a6565b92610c14929192611b17565b611667565b3461050e575f36600319011261050e5760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b3461050e57606036600319011261050e576004356001600160401b03811161050e57610140600319823603011261050e5760405190610c9182611294565b8060040135825260248101356020830152610cae60448201611219565b6040830152610cbf60648201611219565b6060830152610cd060848201611219565b608083015260a481013560a0830152610ceb60c4820161122d565b60c0830152610cfc60e4820161122d565b60e0830152610104810135801515810361050e57610100830152610124810135906001600160401b03821161050e576004610d3a9236920101611358565b6101208201526024356001600160401b03811161050e57602091610d656105f7923690600401611358565b9061170b565b3461050e57602036600319011261050e576004356001600160401b03811161050e57610d9e610da3913690600401611358565b61163e565b604080516001600160a01b0390931683526020830181905282916104bc91830190611241565b3461050e575f36600319011261050e57606080604051610de881611265565b5f81525f60208201525f604082015201526040516351753e3760e11b81527f000000000000000000000000000000000000000000000000000000000000000060048201525f8160248160018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165afa8015610f5f575f90610eaf575b6060906104bc604051928392602084528051602085015260018060a01b0360208201511660408501526040810151151582850152015160808084015260a0830190611241565b503d805f833e610ebf81836112e6565b81019060208183031261050e578051906001600160401b03821161050e570160808183031261050e5760405190610ef582611265565b8051825260208101516001600160a01b038116810361050e576020830152610f1f60408201611539565b60408301526060810151906001600160401b03821161050e570182601f8201121561050e57606092816020610f5693519101611546565b82820152610e69565b6040513d5f823e3d90fd5b3461050e575f36600319011261050e5760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b3461050e575f36600319011261050e576104bc60206110926001610fe77f00000000000000000000000000000000000000000000000000000000000000006119aa565b81846110127f00000000000000000000000000000000000000000000000000000000000000006119aa565b818061103d7f00000000000000000000000000000000000000000000000000000000000000006119aa565b9260405199878b985191829101848a015e870190601760f91b83830152805192839101602183015e010190601760f91b84830152805192839101600283015e01015f838201520301601f1981018352826112e6565b604051918291602083526020830190611241565b3461050e57604036600319011261050e576004356001600160401b03811161050e576080600319823603011261050e576111116110fc60209261110a6110ea611203565b916040519384916004018783016114a1565b03601f1981018452836112e6565b3391611807565b604051908152f35b3461050e57606036600319011261050e576004356001600160401b03811161050e576080600319823603011261050e57611151611203565b906044356001600160a01b038116810361050e57602092611183611191611111946040519283916004018883016114a1565b03601f1981018352826112e6565b611807565b3461050e57602036600319011261050e576004359063ffffffff60e01b821680920361050e576020916346d1b90d60e11b81149081156111d8575b5015158152f35b630acaa6e160e01b8114915081156111f2575b50836111d1565b6301ffc9a760e01b149050836111eb565b602435906001600160401b038216820361050e57565b35906001600160401b038216820361050e57565b35906001600160a01b038216820361050e57565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b608081019081106001600160401b0382111761128057604052565b634e487b7160e01b5f52604160045260245ffd5b61014081019081106001600160401b0382111761128057604052565b604081019081106001600160401b0382111761128057604052565b60c081019081106001600160401b0382111761128057604052565b90601f801991011681019081106001600160401b0382111761128057604052565b6001600160401b03811161128057601f01601f191660200190565b92919261132e82611307565b9161133c60405193846112e6565b82948184528183011161050e578281602093845f960137010152565b9080601f8301121561050e5781602061137393359101611322565b90565b9181601f8401121561050e578235916001600160401b03831161050e576020808501948460051b01011161050e57565b604060031982011261050e576004356001600160401b03811161050e57816113d091600401611376565b92909291602435906001600160401b03821161050e576113f291600401611376565b9091565b9181601f8401121561050e578235916001600160401b03831161050e576020838186019501011161050e57565b6020815260018060a01b03825116602082015260806001600160401b03606061145a602086015184604087015260a0860190611241565b9460408101518286015201511691015290565b602060031982011261050e57600435906001600160401b03821161050e5761014090829003600319011261050e5760040190565b602081526001600160a01b036114b68361122d565b1660208201526020820135601e198336030181121561050e5782016020813591016001600160401b03821161050e57813603811361050e57611527606060c095846001600160401b0394608060408901528160a0890152888801375f87868801015260408101358287015201611219565b166080830152601f01601f1916010190565b5190811515820361050e57565b92919261155282611307565b9161156060405193846112e6565b82948184528183011161050e578281602093845f96015e010152565b51906001600160a01b038216820361050e57565b9080601f8301121561050e57815161137392602001611546565b51906001600160401b038216820361050e57565b60208183031261050e578051906001600160401b03821161050e570160808183031261050e57604051916115f183611265565b6115fa8261157c565b83526020820151916001600160401b03831161050e57611621606092611636948301611590565b602085015260408101516040850152016115aa565b606082015290565b61165190602080825183010191016115be565b80516020909101516001600160a01b0390911691565b9290928184036116fc575f91345b858410156116f157818410156116dd578360051b80860135908282116116ce5784013561013e198536030181121561050e576116b2908501611b58565b156116c35760019103930192611675565b505050505050505f90565b63044044a560e21b5f5260045ffd5b634e487b7160e01b5f52603260045260245ffd5b505050505050600190565b63251f56a160e21b5f5260045ffd5b60208101517f0000000000000000000000000000000000000000000000000000000000000000036117dd57611751610120611761920151602080825183010191016115be565b91602080825183010191016115be565b604082015160408201511491826117b8575b8261179f575b8261178357505090565b6020919250810151818151910120910151602081519101201490565b805182516001600160a01b039081169116149250611779565b91506001600160401b036060830151166001600160401b036060830151161491611773565b50505f90565b604051906117f082611265565b5f6060838281528160208201528260408201520152565b6118a892611813611b71565b7f0000000000000000000000000000000000000000000000000000000000000000906001600160401b036040519161184a836112cb565b60018060a01b0316948583521680602083015260207f00000000000000000000000000000000000000000000000000000000000000001515928360408201525f60608201528560808201525f60a08201526040519061091a826112b0565b03815f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1958615610f5f575f9661196e575b50906101209291604051926118f984611294565b87845260208401526001600160401b034216604084015260608301525f60808301525f60a08301528460c08301523060e08301526101008201520152817f8f7f2dbafd79125e808bf16a53d7fa4e17b8b6374ced76d946a45f94b7bf4d065f80a39060015f516020611df35f395f51905f5255565b92919095506020833d6020116119a2575b8161198c602093836112e6565b8101031261050e576101209251959091926118e5565b3d915061197f565b805f9172184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b821015611af4575b806d04ee2d6d415b85acef8100000000600a921015611ad9575b662386f26fc10000811015611ac5575b6305f5e100811015611ab4575b612710811015611aa5575b6064811015611a97575b1015611a8c575b600a60216001840193611a3185611307565b94611a3f60405196876112e6565b808652611a4e601f1991611307565b013660208701378401015b5f1901916f181899199a1a9b1b9c1cb0b131b232b360811b8282061a8353048015611a8757600a9091611a59565b505090565b600190910190611a1f565b606460029104930192611a18565b61271060049104930192611a0e565b6305f5e10060089104930192611a03565b662386f26fc10000601091049301926119f6565b6d04ee2d6d415b85acef8100000000602091049301926119e6565b506040915072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b81046119cc565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303611b4957565b634ca8886760e01b5f5260045ffd5b60e0013560018060a01b03811680910361050e57301490565b60025f516020611df35f395f51905f525414611b9a5760025f516020611df35f395f51905f5255565b633ee5aeb560e01b5f5260045ffd5b60405190611bb682611294565b6060610120835f81525f60208201525f60408201525f838201525f60808201525f60a08201525f60c08201525f60e08201525f6101008201520152565b60208183031261050e578051906001600160401b03821161050e57016101408183031261050e5760405191611c2783611294565b8151835260208201516020840152611c41604083016115aa565b6040840152611c52606083016115aa565b6060840152611c63608083016115aa565b608084015260a082015160a0840152611c7e60c0830161157c565b60c0840152611c8f60e0830161157c565b60e0840152611ca16101008301611539565b6101008401526101208201516001600160401b03811161050e57611cc59201611590565b61012082015290565b90611cd7611ba9565b506040516328c44a9960e21b815260048101839052915f836024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa928315610f5f575f93611d60575b508251818115918215611d55575b5050611d435750565b6301fb6dd160e01b5f5260045260245ffd5b14159050815f611d3a565b611d759193503d805f833e6107e481836112e6565b915f611d2c565b9060209081835280518284015201519060408082015260018060a01b0382511660608201526001600160401b0360208301511660808201526040820151151560a0820152606082015160c082015261010060a0611de9608085015160c060e0860152610120850190611241565b9301519101529056fe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a26469706673582212201c6eb8eecb79e7d555e1bc0edb4faa84ec551c99464665e3340515d75d3b41cd64736f6c634300081b0033",
    "sourceMap": "948:4730:68:-:0;;;;;;;;;;-1:-1:-1;948:4730:68;;;;;;;;;1183:12:9;;;1054:5;1183:12;948:4730:68;1054:5:9;1183:12;948:4730:68;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;948:4730:68;;;;;;;;;2989:103:41;;:::i;:::-;4123:32:57;;;:::i;:::-;4198:37;;;:::i;:::-;4297:13;948:4730:68;4297:13:57;;948:4730:68;4314:18:57;;4297:35;;;4293:99;;948:4730:68;;1284:28:61;1280:64;;-1:-1:-1;;;;;948:4730:68;801:25:61;;948:4730:68;;801:30:61;;;:78;;;;948:4730:68;1354:55:61;;;-1:-1:-1;;;;;1057:25:61;;;948:4730:68;;1419:58:61;;948:4730:68;;4589:11:57;;;;;948:4730:68;4589:11:57;948:4730:68;4573:28:57;4589:11;;4573:28;:::i;:::-;948:4730:68;;;;;;;588:26:54;;;;;;;;;;4815:56:57;;948:4730:68;;4815:56:57;;948:4730:68;;;;;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;-1:-1:-1;;;;;1057:25:61;948:4730:68;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;-1:-1:-1;;948:4730:68;;;;;;;:::i;:::-;;;;;;;;4815:56:57;;-1:-1:-1;;;;;948:4730:68;4815:56:57;;;;;;;;;;;948:4730:68;4814:57:57;;4810:115;;948:4730:68;;4969:3:57;-1:-1:-1;;;;;948:4730:68;;;;;;:::i;:::-;;;;5046:47:57;948:4730:68;5046:47:57;;948:4730:68;;;;;;;:::i;:::-;;;;4993:102:57;;948:4730:68;4969:136:57;;;;;948:4730:68;;-1:-1:-1;;;4969:136:57;;948:4730:68;;;4969:136:57;;948:4730:68;;;;;;;;;;;;;;;;;;;;;;;;;;4969:136:57;;;;;;;948:4730:68;-1:-1:-1;;4965:215:57;;-1:-1:-1;;;5144:25:57;;948:4730:68;;;;;6283:21:57;5144:25;4965:215;2945:485:68;4965:215:57;;;;948:4730:68;4965:215:57;2859:41:68;948:4730;;;;;;;;2870:11;;948:4730;;;;2859:41;;;;;;:::i;:::-;948:4730;-1:-1:-1;;;;;948:4730:68;3162:22;;948:4730;;3252:32;;948:4730;;;3312:44;;;;;948:4730;3312:44;;;;948:4730;3312:44;;:::i;:::-;948:4730;;;;;;:::i;:::-;;;3066:339;;;948:4730;3066:339;948:4730;3066:339;;948:4730;;3066:339;;948:4730;1057:25:61;3066:339:68;;948:4730;3066:339;948:4730;3066:339;;948:4730;;;;;;;:::i;:::-;3014:28;948:4730;;2969:451;;;948:4730;;;;;;;;;;;;2945:485;;948:4730;2945:485;;;:::i;:::-;;;;;;;;;;;;;;4965:215:57;948:4730:68;;5325:61:57;948:4730:68;;;;;;3448:35;948:4730;3448:35;;948:4730;;3448:35;;;948:4730;3448:35;;:::i;:::-;948:4730;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;5325:61:57;948:4730:68;-1:-1:-1;;;;;;;;;;;2407:1:41;948:4730:68;;;;;;;;:::i;:::-;;;;2945:485;;;;948:4730;2945:485;;948:4730;2945:485;;;;;;948:4730;2945:485;;;:::i;:::-;;;948:4730;;;;;;;2945:485;5325:61:57;2945:485:68;;948:4730;-1:-1:-1;948:4730:68;;2945:485;;;-1:-1:-1;2945:485:68;;;948:4730;;;;;;;;;4969:136:57;;;;;:::i;:::-;948:4730:68;;4969:136:57;;;;948:4730:68;;;;4810:115:57;-1:-1:-1;;;4894:20:57;;948:4730:68;4894:20:57;;4815:56;;;948:4730:68;4815:56:57;;948:4730:68;4815:56:57;;;;;;948:4730:68;4815:56:57;;;:::i;:::-;;;948:4730:68;;;;;;;:::i;:::-;4815:56:57;;;;;;-1:-1:-1;4815:56:57;;;948:4730:68;;;;;;;;;1419:58:61;-1:-1:-1;;;1457:20:61;;948:4730:68;1457:20:61;;1354:55;-1:-1:-1;;;1392:17:61;;948:4730:68;1392:17:61;;801:78;864:15;;;-1:-1:-1;835:44:61;801:78;;;1280:64;-1:-1:-1;;;1321:23:61;;948:4730:68;1321:23:61;;4293:99:57;-1:-1:-1;;;4355:26:57;;948:4730:68;5733:26:57;4355;948:4730:68;;;;;3045:39:9;948:4730:68;;;:::i;:::-;881:58:9;;:::i;:::-;3045:39;:::i;:::-;948:4730:68;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;948:4730:68;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;:::i;:::-;;;;;;:::i;:::-;;5635:34;;948:4730;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;:::i;:::-;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;-1:-1:-1;;948:4730:68;;;;;;:::i;:::-;;;;:::i;:::-;-1:-1:-1;948:4730:68;;-1:-1:-1;;;4191:23:55;;948:4730:68;;;4191:23:55;;;948:4730:68;;;;4191:23:55;948:4730:68;4191:3:55;-1:-1:-1;;;;;948:4730:68;4191:23:55;;;;;;;;;;;948:4730:68;4228:19:55;948:4730:68;4228:19:55;;948:4730:68;4251:18:55;4228:41;4224:100;;948:4730:68;5393:46;5404:16;;;;948:4730;;;;5393:46;;;;;;:::i;:::-;948:4730;;;;;;;:::i;4224:100:55:-;-1:-1:-1;;;4292:21:55;;948:4730:68;;4292:21:55;4191:23;;;;;;;;;;;;;;:::i;:::-;;;;;:::i;:::-;;;;;;948:4730:68;;;;;;;;;;;;;;;;;;;;;;;;;;;1332:50:55;948:4730:68;;;;;;-1:-1:-1;948:4730:68;;-1:-1:-1;;948:4730:68;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;3490:431:55;948:4730:68;;;;;;:::i;:::-;;;;;;:::i;:::-;;;;;;;;:::i;:::-;2176:12:58;2989:103:41;;:::i;:::-;3559:18:55;948:4730:68;-1:-1:-1;;;;;948:4730:68;;;;;;:::i;:::-;1625:10:58;948:4730:68;;;3601:295:55;948:4730:68;3601:295:55;;948:4730:68;;3751:28:55;948:4730:68;;3601:295:55;;948:4730:68;3601:295:55;;948:4730:68;3601:295:55;948:4730:68;3601:295:55;;948:4730:68;3601:295:55;;;;948:4730:68;3601:295:55;;;;948:4730:68;;;;;;;:::i;:::-;;;;3514:397:55;;;948:4730:68;;;;;;;;;;3490:431:55;;948:4730:68;3490:431:55;;;:::i;:::-;;948:4730:68;;3490:3:55;-1:-1:-1;;;;;948:4730:68;3490:431:55;;;;;;;;;;;948:4730:68;;;;;2347:424:58;948:4730:68;;;;;;;;:::i;:::-;;;;2347:424:58;;;948:4730:68;-1:-1:-1;;;;;2461:15:58;948:4730:68;;2347:424:58;;948:4730:68;;2347:424:58;;948:4730:68;2347:424:58;3601:295:55;2347:424:58;;948:4730:68;3601:295:55;2347:424:58;;948:4730:68;1625:10:58;948:4730:68;2347:424:58;;948:4730:68;2666:4:58;948:4730:68;2347:424:58;;948:4730:68;2347:424:58;;;948:4730:68;2347:424:58;948:4730:68;1625:10:58;7343:50:57;1625:10:58;7343:50:57;;;2365:1:41;-1:-1:-1;;;;;;;;;;;2407:1:41;948:4730:68;;;;;;3490:431:55;;;;;;948:4730:68;3490:431:55;;948:4730:68;3490:431:55;;;;;;948:4730:68;3490:431:55;;;:::i;:::-;;;948:4730:68;;;;;;;3490:431:55;;;948:4730:68;3490:431:55;;;;;-1:-1:-1;3490:431:55;;;948:4730:68;;;;;;;;;;;;;;;;-1:-1:-1;;948:4730:68;;;;;;2989:103:41;;;:::i;:::-;5575:28:57;;;:::i;:::-;5670:18;948:4730:68;5670:18:57;;948:4730:68;5692:18:57;5670:40;;;5666:104;;5879:26;;;-1:-1:-1;;;;;948:4730:68;;;5879:31:57;5875:62;;948:4730:68;-1:-1:-1;;;;;948:4730:68;5952:15:57;:44;5948:100;;948:4730:68;;6112:3:57;-1:-1:-1;;;;;948:4730:68;;;;;:::i;:::-;;;;;;6189:43:57;;948:4730:68;;;;;;;:::i;:::-;;;;6136:98:57;;948:4730:68;6112:132:57;;;;;948:4730:68;;-1:-1:-1;;;6112:132:57;;948:4730:68;;;6112:132:57;;948:4730:68;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;948:4730:68;;;;;;-1:-1:-1;;6112:132:57;;;;;;948:4730:68;-1:-1:-1;6108:207:57;;-1:-1:-1;;;6283:21:57;;948:4730:68;;;;-1:-1:-1;6283:21:57;6108:207;948:4730:68;6108:207:57;6466:21;948:4730:68;;;;;6466:21:57;;948:4730:68;;;6445:43:57;948:4730:68;;6445:43:57;;;948:4730:68;-1:-1:-1;;;;;;;;;;;2407:1:41;948:4730:68;;;;6112:132:57;;;;;948:4730:68;6112:132:57;;:::i;:::-;948:4730:68;6112:132:57;;;;5948:100;5919:18;;;948:4730:68;6019:18:57;948:4730:68;;6019:18:57;5666:104;5733:26;;;948:4730:68;5733:26:57;948:4730:68;;5733:26:57;948:4730:68;;1442:1461:9;948:4730:68;;;:::i;:::-;881:58:9;;;;;;:::i;:::-;1442:1461;:::i;948:4730:68:-;;;;;;-1:-1:-1;;948:4730:68;;;;;;;1155:53;948:4730;;;;;;;;;-1:-1:-1;;948:4730:68;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;:::i;:::-;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;:::i;:::-;;;:::i;:::-;;;;;;-1:-1:-1;;948:4730:68;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;:::i;:::-;;:::i;:::-;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;-1:-1:-1;;948:4730:68;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;2937:44:55;;2962:18;948:4730:68;2937:44:55;;948:4730:68;;;2937:44:55;948:4730:68;;;;;;2937:14:55;948:4730:68;2937:44:55;;;;;;948:4730:68;2937:44:55;;;948:4730:68;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;2937:44:55:-;;;;948:4730:68;2937:44:55;;;;;;:::i;:::-;;;948:4730:68;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;2937:44:55;;;948:4730:68;;;;;;;;;;;;;;;-1:-1:-1;;948:4730:68;;;;;;;1204:43:55;948:4730:68;;;;;;;;;-1:-1:-1;;948:4730:68;;;;;1055:104:6;;948:4730:68;1072:24:6;1089:6;1072:24;:::i;:::-;1120:6;;1103:24;1120:6;1103:24;:::i;:::-;1151:6;;1134:24;1151:6;1134:24;:::i;:::-;948:4730:68;;;;;;;;;;;;1055:104:6;;;948:4730:68;;;;-1:-1:-1;;;948:4730:68;;;;;;;;;;;;;;;;;-1:-1:-1;;;948:4730:68;;;;;;;;;;;;;;;;;;;;;1055:104:6;;5058:16:68;;1055:104:6;;;;;;:::i;:::-;948:4730:68;;;;;1055:104:6;948:4730:68;;1055:104:6;948:4730:68;;;;:::i;:::-;;;;;;-1:-1:-1;;948:4730:68;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;2176:12:58;4724:16:68;948:4730;;4724:16;948:4730;;:::i;:::-;;;;;;;;;4724:16;;;;:::i;:::-;;5058;;4724;;;;;;:::i;:::-;4758:10;2176:12:58;;:::i;:::-;948:4730:68;;;;;;;;;;;;-1:-1:-1;;948:4730:68;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;:::i;:::-;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;5058:16;;2176:12:58;948:4730:68;;;;;;;;5058:16;;;;:::i;:::-;;;;;;;;;;:::i;:::-;2176:12:58;:::i;948:4730:68:-;;;;;;-1:-1:-1;;948:4730:68;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;573:41:54;;;:81;;;;948:4730:68;;;;;;;573:81:54;-1:-1:-1;;;2431:40:57;;;-1:-1:-1;2431:80:57;;;;573:81:54;;;;;2431:80:57;-1:-1:-1;;;829:40:49;;-1:-1:-1;2431:80:57;;;948:4730:68;;;;-1:-1:-1;;;;;948:4730:68;;;;;;:::o;:::-;;;-1:-1:-1;;;;;948:4730:68;;;;;;:::o;:::-;;;-1:-1:-1;;;;;948:4730:68;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;948:4730:68;;;;;;;;-1:-1:-1;;948:4730:68;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;:::o;:::-;;;;-1:-1:-1;948:4730:68;;;;;-1:-1:-1;948:4730:68;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;:::o;:::-;;;5058:16;;948:4730;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;:::o;:::-;-1:-1:-1;;;;;948:4730:68;;;;;;-1:-1:-1;;948:4730:68;;;;:::o;:::-;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;948:4730:68;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;:::o;:::-;;;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;;:::o;:::-;;-1:-1:-1;;948:4730:68;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;:::i;:::-;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;:::i;:::-;;;:::o;:::-;;;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;:::o;:::-;;-1:-1:-1;;948:4730:68;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;-1:-1:-1;;948:4730:68;;;;;;;:::o;:::-;;;;-1:-1:-1;;;;;948:4730:68;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;-1:-1:-1;;948:4730:68;;;;:::o;:::-;;;;;;;;;;:::o;:::-;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;948:4730:68;;;;;;:::o;:::-;;;-1:-1:-1;;;;;948:4730:68;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;:::i;:::-;;;-1:-1:-1;;;;;948:4730:68;;;;;;:::o;:::-;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;;;:::i;:::-;;;;:::i;:::-;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;:::i;:::-;;;;;;:::o;2317:245::-;2471:34;2317:245;2471:34;948:4730;;;2471:34;;;;;;:::i;:::-;948:4730;;2471:34;2540:14;;;;-1:-1:-1;;;;;948:4730:68;;;;2317:245::o;3133:1460:9:-;;;;3340:23;;;3336:76;;3881:1;;3844:9;3896:19;3884:10;;;;;;948:4730:68;;;;;;;;;;;;;4064:22:9;;;;4060:87;;948:4730:68;;;;;;;;;;;;;;4274:33:9;948:4730:68;;;4274:33:9;:::i;:::-;;4270:84;;1489:1:0;948:4730:68;;3896:19:9;948:4730:68;3869:13:9;;;4270:84;4327:12;;;;;;;3881:1;4327:12;:::o;4060:87::-;4113:19;;;3881:1;4113:19;;3881:1;4113:19;948:4730:68;;;;3881:1:9;948:4730:68;;;;;3881:1:9;948:4730:68;3884:10:9;;;;;;;1489:1:0;3133:1460:9;:::o;3336:76::-;3386:15;;;;;;;;3747:703:68;3956:17;;;948:4730;3977:18;3956:39;3952:57;;4051:45;4062:15;4141:36;4062:15;;;3956:17;948:4730;;;4051:45;;;;;;:::i;:::-;948:4730;3956:17;948:4730;;;4141:36;;;;;;:::i;:::-;4195:31;;;948:4730;4195:31;4230:35;;948:4730;4195:70;:136;;;;3747:703;4195:176;;;3747:703;4195:248;;;4188:255;;3747:703;:::o;4195:248::-;3956:17;4397:13;;;;;;948:4730;;;;;4387:24;4425:17;;;3956;948:4730;;;;4415:28;4387:56;3747:703;:::o;4195:176::-;948:4730;;;;-1:-1:-1;;;;;948:4730:68;;;;;4335:36;;-1:-1:-1;4195:176:68;;:136;4281:21;;-1:-1:-1;;;;;4281:21:68;;;948:4730;;-1:-1:-1;;;;;4281:21:68;4306:25;;948:4730;;4281:50;4195:136;;;3952:57;3997:12;;948:4730;3997:12;:::o;948:4730::-;;;;;;;:::i;:::-;-1:-1:-1;948:4730:68;;;;;;;;;;;;;;;;;:::o;2989:103:41:-;3490:431:55;2989:103:41;;;:::i;:::-;3559:18:55;948:4730:68;-1:-1:-1;;;;;948:4730:68;;;;;;:::i;:::-;;;;;;;;;;;;3601:295:55;;;;948:4730:68;3601:295:55;3751:28;948:4730:68;;3601:295:55;;948:4730:68;3601:295:55;;948:4730:68;;3601:295:55;;;948:4730:68;3601:295:55;;;;948:4730:68;;3601:295:55;;;948:4730:68;;;;;;;:::i;3490:431:55:-;;948:4730:68;;3490:3:55;-1:-1:-1;;;;;948:4730:68;3490:431:55;;;;;;;948:4730:68;3490:431:55;;;2989:103:41;948:4730:68;;2347:424:58;948:4730:68;;;;;;;;:::i;:::-;;;;3601:295:55;2347:424:58;;948:4730:68;-1:-1:-1;;;;;2461:15:58;948:4730:68;;2347:424:58;;948:4730:68;3601:295:55;2347:424:58;;948:4730:68;;3601:295:55;2347:424:58;;948:4730:68;;3601:295:55;2347:424:58;;948:4730:68;2347:424:58;948:4730:68;2347:424:58;;948:4730:68;2666:4:58;948:4730:68;2347:424:58;;948:4730:68;2347:424:58;;;948:4730:68;2347:424:58;948:4730:68;7343:50:57;;948:4730:68;7343:50:57;;2407:1:41;2365;-1:-1:-1;;;;;;;;;;;2407:1:41;2989:103::o;3490:431:55:-;;;;;;3601:295;3490:431;;3601:295;3490:431;;;;;;948:4730:68;3490:431:55;;;:::i;:::-;;;948:4730:68;;;;2347:424:58;948:4730:68;;3490:431:55;;;;;;;;;-1:-1:-1;3490:431:55;;1343:634:44;1465:17;-1:-1:-1;29298:17:51;-1:-1:-1;;;29298:17:51;;;29294:103;;1343:634:44;29414:17:51;29423:8;29994:7;29414:17;;;29410:103;;1343:634:44;29539:8:51;29530:17;;;29526:103;;1343:634:44;29655:7:51;29646:16;;;29642:100;;1343:634:44;29768:7:51;29759:16;;;29755:100;;1343:634:44;29881:7:51;29872:16;;;29868:100;;1343:634:44;29985:16:51;;29981:66;;1343:634:44;29994:7:51;1580:94:44;1485:1;948:4730:68;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;5058:16;;948:4730;;:::i;:::-;;;;;;;1580:94:44;;;1687:247;-1:-1:-1;;948:4730:68;;-1:-1:-1;;;1741:111:44;;;;948:4730:68;1741:111:44;948:4730:68;1902:10:44;;1898:21;;29994:7:51;1687:247:44;;;;1898:21;1914:5;;1343:634;:::o;29981:66:51:-;30031:1;948:4730:68;;;;29981:66:51;;29868:100;29881:7;29952:1;948:4730:68;;;;29868:100:51;;;29755;29768:7;29839:1;948:4730:68;;;;29755:100:51;;;29642;29655:7;29726:1;948:4730:68;;;;29642:100:51;;;29526:103;29539:8;29612:2;948:4730:68;;;;29526:103:51;;;29410;29423:8;29496:2;948:4730:68;;;;29410:103:51;;;29294;-1:-1:-1;29380:2:51;;-1:-1:-1;;;;948:4730:68;;29294:103:51;;6040:128:9;6109:4;-1:-1:-1;;;;;948:4730:68;6087:10:9;:27;6083:79;;6040:128::o;6083:79::-;6137:14;;;;;;;;2506:271:55;2733:20;;948:4730:68;;;;;;;;;;;;;2765:4:55;2733:37;2506:271;:::o;3749:292:41:-;2407:1;-1:-1:-1;;;;;;;;;;;948:4730:68;4560:63:41;3644:93;;2407:1;-1:-1:-1;;;;;;;;;;;2407:1:41;3749:292::o;3644:93::-;3696:30;;;-1:-1:-1;3696:30:41;;-1:-1:-1;3696:30:41;948:4730:68;;;;;;;:::i;:::-;;;;-1:-1:-1;948:4730:68;;-1:-1:-1;948:4730:68;;;;-1:-1:-1;948:4730:68;;;;-1:-1:-1;948:4730:68;;;;-1:-1:-1;948:4730:68;;;;-1:-1:-1;948:4730:68;;;;-1:-1:-1;948:4730:68;;;;-1:-1:-1;948:4730:68;;;;-1:-1:-1;948:4730:68;;;;;;:::o;:::-;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;:::i;:::-;;;;;;:::o;6671:257:57:-;;948:4730:68;;:::i;:::-;-1:-1:-1;948:4730:68;;-1:-1:-1;;;6796:23:57;;;;;948:4730:68;;;;-1:-1:-1;948:4730:68;6796:23:57;948:4730:68;6796:3:57;-1:-1:-1;;;;;948:4730:68;6796:23:57;;;;;;;-1:-1:-1;6796:23:57;;;6671:257;6782:37;;948:4730:68;6833:29:57;;;:55;;;;;6671:257;6829:92;;;;6671:257;:::o;6829:92::-;6897:24;;;-1:-1:-1;6897:24:57;6796:23;948:4730:68;6796:23:57;-1:-1:-1;6897:24:57;6833:55;6866:22;;;-1:-1:-1;6833:55:57;;;;6796:23;;;;;;;-1:-1:-1;6796:23:57;;;;;;:::i;:::-;;;;;948:4730:68;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;948:4730:68;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::o",
    "linkReferences": {},
    "immutableReferences": {
      "2532": [
        {
          "start": 4035,
          "length": 32
        }
      ],
      "2534": [
        {
          "start": 4078,
          "length": 32
        }
      ],
      "2536": [
        {
          "start": 4121,
          "length": 32
        }
      ],
      "3008": [
        {
          "start": 6937,
          "length": 32
        }
      ],
      "50371": [
        {
          "start": 3642,
          "length": 32
        }
      ],
      "50375": [
        {
          "start": 702,
          "length": 32
        },
        {
          "start": 1845,
          "length": 32
        },
        {
          "start": 2368,
          "length": 32
        },
        {
          "start": 2764,
          "length": 32
        },
        {
          "start": 6317,
          "length": 32
        },
        {
          "start": 7412,
          "length": 32
        }
      ],
      "50378": [
        {
          "start": 328,
          "length": 32
        },
        {
          "start": 1909,
          "length": 32
        },
        {
          "start": 2192,
          "length": 32
        },
        {
          "start": 2685,
          "length": 32
        },
        {
          "start": 3592,
          "length": 32
        },
        {
          "start": 3969,
          "length": 32
        },
        {
          "start": 5906,
          "length": 32
        },
        {
          "start": 6165,
          "length": 32
        }
      ],
      "50381": [
        {
          "start": 2072,
          "length": 32
        },
        {
          "start": 2259,
          "length": 32
        },
        {
          "start": 6241,
          "length": 32
        }
      ],
      "52874": [
        {
          "start": 1011,
          "length": 32
        },
        {
          "start": 3120,
          "length": 32
        }
      ]
    }
  },
  "methodIdentifiers": {
    "ATTESTATION_SCHEMA()": "5bf2f20d",
    "ATTESTATION_SCHEMA_REVOCABLE()": "b587a5eb",
    "REFERENCE_ATTESTATION_SCHEMA()": "8e8a4da4",
    "attest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))": "e60c3505",
    "check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)": "8da3721a",
    "collect(bytes32,bytes32)": "ea6ec49c",
    "decodeCondition(bytes)": "760bd118",
    "decodeObligationData(bytes)": "c93844be",
    "doObligation((address,bytes,bytes32,uint64),uint64)": "4b379a90",
    "doObligationFor((address,bytes,bytes32,uint64),uint64,address)": "32bd03ad",
    "doObligationRaw(bytes,uint64,bytes32)": "b3b902d4",
    "getObligationData(bytes32)": "c6ec5070",
    "getSchema()": "6b122fe0",
    "isPayable()": "ce46e046",
    "multiAttest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])": "91db0b7e",
    "multiRevoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])": "88e5b2d9",
    "reclaim(bytes32)": "96afb365",
    "revoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))": "e49617e1",
    "supportsInterface(bytes4)": "01ffc9a7",
    "version()": "54fd4d50"
  },
  "rawMetadata": "{\"compiler\":{\"version\":\"0.8.27+commit.40a35a09\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[{\"internalType\":\"contract IEAS\",\"name\":\"_eas\",\"type\":\"address\"},{\"internalType\":\"contract ISchemaRegistry\",\"name\":\"_schemaRegistry\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"AccessDenied\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"attestationId\",\"type\":\"bytes32\"}],\"name\":\"AttestationNotFound\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"AttestationRevoked\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"DeadlineExpired\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InsufficientValue\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidAttestationUid\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidEAS\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidEscrowAttestation\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidFulfillment\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidLength\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"NotFromThisAttester\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"NotPayable\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"ReentrancyGuardReentrantCall\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"attestationId\",\"type\":\"bytes32\"}],\"name\":\"RevocationFailed\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"SchemaRegistrationFailed\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"UnauthorizedCall\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"fulfillmentUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"fulfiller\",\"type\":\"address\"}],\"name\":\"EscrowCollected\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"escrower\",\"type\":\"address\"}],\"name\":\"EscrowMade\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"escrower\",\"type\":\"address\"}],\"name\":\"EscrowReclaimed\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"ATTESTATION_SCHEMA\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"ATTESTATION_SCHEMA_REVOCABLE\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"REFERENCE_ATTESTATION_SCHEMA\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"attestation\",\"type\":\"tuple\"}],\"name\":\"attest\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"obligation\",\"type\":\"tuple\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"check\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"_escrow\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"_fulfillment\",\"type\":\"bytes32\"}],\"name\":\"collect\",\"outputs\":[{\"internalType\":\"bytes\",\"name\":\"\",\"type\":\"bytes\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"decodeCondition\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"decodeObligationData\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"referencedAttestationUid\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"}],\"internalType\":\"struct UnconditionalAttestationReferenceEscrowObligation.ObligationData\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"referencedAttestationUid\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"}],\"internalType\":\"struct UnconditionalAttestationReferenceEscrowObligation.ObligationData\",\"name\":\"data\",\"type\":\"tuple\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"}],\"name\":\"doObligation\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"referencedAttestationUid\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"}],\"internalType\":\"struct UnconditionalAttestationReferenceEscrowObligation.ObligationData\",\"name\":\"data\",\"type\":\"tuple\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"}],\"name\":\"doObligationFor\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"}],\"name\":\"doObligationRaw\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid_\",\"type\":\"bytes32\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"getObligationData\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"referencedAttestationUid\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"}],\"internalType\":\"struct UnconditionalAttestationReferenceEscrowObligation.ObligationData\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getSchema\",\"outputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"contract ISchemaResolver\",\"name\":\"resolver\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"string\",\"name\":\"schema\",\"type\":\"string\"}],\"internalType\":\"struct SchemaRecord\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"isPayable\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation[]\",\"name\":\"attestations\",\"type\":\"tuple[]\"},{\"internalType\":\"uint256[]\",\"name\":\"values\",\"type\":\"uint256[]\"}],\"name\":\"multiAttest\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation[]\",\"name\":\"attestations\",\"type\":\"tuple[]\"},{\"internalType\":\"uint256[]\",\"name\":\"values\",\"type\":\"uint256[]\"}],\"name\":\"multiRevoke\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"reclaim\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"attestation\",\"type\":\"tuple\"}],\"name\":\"revoke\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"version\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"stateMutability\":\"payable\",\"type\":\"receive\"}],\"devdoc\":{\"details\":\"Does not apply the default fulfillment refUID or intrinsic checks; use arbiters to add any required checks.\",\"errors\":{\"ReentrancyGuardReentrantCall()\":[{\"details\":\"Unauthorized reentrant call.\"}]},\"kind\":\"dev\",\"methods\":{\"attest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"params\":{\"attestation\":\"The new attestation.\"},\"returns\":{\"_0\":\"Whether the attestation is valid.\"}},\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"params\":{\"demand\":\"Arbiter-specific demand data encoded by the escrow creator.\",\"escrowUid\":\"The UID of the escrow attestation being fulfilled.\",\"fulfillment\":\"The EAS attestation being used as fulfillment.\"}},\"collect(bytes32,bytes32)\":{\"params\":{\"escrowUid\":\"UID of the escrow attestation.\",\"fulfillmentUid\":\"UID of the fulfillment attestation.\"},\"returns\":{\"_0\":\"Escrow-specific return data from the underlying release logic.\"}},\"decodeCondition(bytes)\":{\"params\":{\"escrowData\":\"ABI-encoded escrow obligation data.\"},\"returns\":{\"arbiter\":\"Address of the arbiter that validates fulfillment.\",\"demand\":\"Arbiter-specific demand bytes.\"}},\"doObligationRaw(bytes,uint64,bytes32)\":{\"params\":{\"data\":\"ABI-encoded obligation data.\",\"expirationTime\":\"EAS expiration timestamp, or zero for no expiration.\",\"refUID\":\"Reference UID stored on the EAS attestation.\"}},\"isPayable()\":{\"returns\":{\"_0\":\"Whether the resolver supports ETH transfers.\"}},\"multiAttest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"params\":{\"attestations\":\"The new attestations.\",\"values\":\"Explicit ETH amounts which were sent with each attestation.\"},\"returns\":{\"_0\":\"Whether all the attestations are valid.\"}},\"multiRevoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"params\":{\"attestations\":\"The existing attestations to be revoked.\",\"values\":\"Explicit ETH amounts which were sent with each revocation.\"},\"returns\":{\"_0\":\"Whether the attestations can be revoked.\"}},\"reclaim(bytes32)\":{\"params\":{\"escrowUid\":\"UID of the escrow attestation.\"},\"returns\":{\"_0\":\"True if the reclaim succeeds.\"}},\"revoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"params\":{\"attestation\":\"The existing attestation to be revoked.\"},\"returns\":{\"_0\":\"Whether the attestation can be revoked.\"}},\"supportsInterface(bytes4)\":{\"details\":\"Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section] to learn more about how these ids are created. This function call must use less than 30 000 gas.\"},\"version()\":{\"returns\":{\"_0\":\"Semver contract version as a string.\"}}},\"title\":\"UnconditionalAttestationReferenceEscrowObligation\",\"version\":1},\"userdoc\":{\"errors\":{\"AttestationNotFound(bytes32)\":[{\"notice\":\"Raised when EAS has no attestation for the requested UID.\"}],\"AttestationRevoked()\":[{\"notice\":\"Raised when an attestation has been revoked.\"}],\"DeadlineExpired()\":[{\"notice\":\"Raised when an attestation has expired.\"}],\"InvalidAttestationUid()\":[{\"notice\":\"Raised when an attestation UID is zero.\"}],\"InvalidEscrowAttestation()\":[{\"notice\":\"Raised when the escrow attestation is missing, invalid, expired, revoked, or has the wrong schema.\"}],\"InvalidFulfillment()\":[{\"notice\":\"Raised when the fulfillment does not satisfy the escrow's configured arbiter.\"}],\"NotFromThisAttester()\":[{\"notice\":\"Raised when an attestation does not belong to this contract's schema.\"}],\"RevocationFailed(bytes32)\":[{\"notice\":\"Raised when revoking the escrow attestation fails during collect or reclaim.\"}],\"SchemaRegistrationFailed(bytes32)\":[{\"notice\":\"Raised when a schema cannot be registered or found at its deterministic UID.\"}],\"UnauthorizedCall()\":[{\"notice\":\"Raised when a caller attempts an action that is not currently permitted.\"}]},\"events\":{\"EscrowCollected(bytes32,bytes32,address)\":{\"notice\":\"Emitted when an escrow is successfully collected by a fulfillment recipient.\"},\"EscrowMade(bytes32,address)\":{\"notice\":\"Emitted when escrow assets are locked and the escrow attestation is created.\"},\"EscrowReclaimed(bytes32,address)\":{\"notice\":\"Emitted when an expired escrow is reclaimed by its original escrower.\"}},\"kind\":\"user\",\"methods\":{\"ATTESTATION_SCHEMA()\":{\"notice\":\"UID of the schema used by attestations created by this contract.\"},\"ATTESTATION_SCHEMA_REVOCABLE()\":{\"notice\":\"Whether attestations under `ATTESTATION_SCHEMA` are revocable.\"},\"attest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"notice\":\"Processes an attestation and verifies whether it's valid.\"},\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"notice\":\"Returns true when `fulfillment` satisfies `demand` for `escrowUid`.\"},\"collect(bytes32,bytes32)\":{\"notice\":\"Collects an escrow using a fulfillment attestation.\"},\"decodeCondition(bytes)\":{\"notice\":\"Decodes an escrow attestation's condition into arbiter and demand data.\"},\"decodeObligationData(bytes)\":{\"notice\":\"Decodes ABI-encoded attestation-reference escrow data.\"},\"doObligation((address,bytes,bytes32,uint64),uint64)\":{\"notice\":\"Creates an escrow attestation that certifies an existing attestation reference.\"},\"doObligationFor((address,bytes,bytes32,uint64),uint64,address)\":{\"notice\":\"Creates an attestation-reference escrow for an explicit recipient.\"},\"doObligationRaw(bytes,uint64,bytes32)\":{\"notice\":\"Creates an obligation attestation from pre-encoded data.\"},\"getObligationData(bytes32)\":{\"notice\":\"Loads and decodes attestation-reference escrow data from this contract's attestation.\"},\"getSchema()\":{\"notice\":\"Returns the schema record registered for this attester.\"},\"isPayable()\":{\"notice\":\"Checks if the resolver can be sent ETH.\"},\"multiAttest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"notice\":\"Processes multiple attestations and verifies whether they are valid.\"},\"multiRevoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"notice\":\"Processes revocation of multiple attestation and verifies they can be revoked.\"},\"reclaim(bytes32)\":{\"notice\":\"Reclaims an expired escrow and returns locked assets to the escrower.\"},\"revoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"notice\":\"Processes an attestation revocation and verifies if it can be revoked.\"},\"version()\":{\"notice\":\"Returns the full semver contract version.\"}},\"notice\":\"Escrows a reference to an existing attestation behind an arbiter-defined fulfillment condition.\",\"version\":1}},\"settings\":{\"compilationTarget\":{\"src/obligations/escrow/unconditional/UnconditionalAttestationReferenceEscrowObligation.sol\":\"UnconditionalAttestationReferenceEscrowObligation\"},\"evmVersion\":\"prague\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[\":@eas/=lib/eas-contracts/contracts/\",\":@erc8004/=lib/erc-8004-contracts/contracts/\",\":@openzeppelin/=lib/openzeppelin-contracts/\",\":@src/=src/\",\":@test/=test/\",\":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/\",\":eas-contracts/=lib/eas-contracts/contracts/\",\":erc-8004-contracts/=lib/erc-8004-contracts/contracts/\",\":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/\",\":eth-gas-reporter/=lib/eas-contracts/node_modules/eth-gas-reporter/\",\":forge-std/=lib/forge-std/src/\",\":halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/\",\":hardhat-deploy/=lib/eas-contracts/node_modules/hardhat-deploy/\",\":hardhat/=lib/eas-contracts/node_modules/hardhat/\",\":openzeppelin-contracts/=lib/openzeppelin-contracts/\"],\"viaIR\":true},\"sources\":{\"lib/eas-contracts/contracts/Common.sol\":{\"keccak256\":\"0x957bd2e6d0d6d637f86208b135c29fbaf4412cb08e5e7a61ede16b80561bf685\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://da1dc9aedbb1d4d39c46c2235918d3adfbc5741dd34a46010cf425d134e7936d\",\"dweb:/ipfs/QmWUk6bXnLaghS2riF3GTFEeURCzgYFMA5woa6AsgPwEgc\"]},\"lib/eas-contracts/contracts/IEAS.sol\":{\"keccak256\":\"0xdad0674defce04905dc7935f2756d6c477a6e876c0b1b7094b112a862f164c12\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://49e448c26c08952df034692d2ab3519dd40a1ebbeae4ce68b294567441933880\",\"dweb:/ipfs/QmWHcudjskUSCjgqsNWE65LVfWvcYB2vBn8RB1SmzvRLNR\"]},\"lib/eas-contracts/contracts/ISchemaRegistry.sol\":{\"keccak256\":\"0xea97dcd36a0c422169cbaac06698249e199049b627c16bff93fb8ab829058754\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://d453a929ef64a69cd31195ec2ee5ed1193bfa29f633e13c960e92154c37ad158\",\"dweb:/ipfs/QmXs1Z3njbHs2EMgHonrZDfcwdog4kozHY5tYNrhZK5yqz\"]},\"lib/eas-contracts/contracts/ISemver.sol\":{\"keccak256\":\"0x04a67939b4e1a8d0a51101b8f69f8882930bbdc66319f38023828625b5d1ff18\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://3dd543fa0e33cef1ea757627f9c2a10a66ee1ce17aa9087f437c5b53a903c7f0\",\"dweb:/ipfs/QmXsy6UsGBzF9zPCCjmiwPpCcX3tHqU13TmR67B69tKnR6\"]},\"lib/eas-contracts/contracts/Semver.sol\":{\"keccak256\":\"0x4f23442d048661b6aaa188ddc16b69cb310c2e44066b3852026afcb4201d61a9\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://30c36e580cd93d9acb13e1a11e833946a8bd0bd2a8d1b2be049f0d96e0989808\",\"dweb:/ipfs/QmXmQTxKjSrUWutafQsqkbGufXqtzxuDAiMMJjXCHXiEqh\"]},\"lib/eas-contracts/contracts/resolver/ISchemaResolver.sol\":{\"keccak256\":\"0xb7d1961ed928c620cddf35c2bf46845b10828bc5d73145214630202ed355b6bb\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://cf1cabacfb15c9bace8280b540b52e5aa440e1b4eba675f9782c34ce0f03902f\",\"dweb:/ipfs/QmakYcK4xbrijzvoaBCmBJK6HeaBqbXxWKtDQ1z62aXwCR\"]},\"lib/eas-contracts/contracts/resolver/SchemaResolver.sol\":{\"keccak256\":\"0x385d8c0edbdc96af15cf8f22333183162561cbf7d3fb0df95287741e59899983\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://ff7e8a17f69dcb7ddc937446e868d34baea61bbe249a8f5d8be486ab93001828\",\"dweb:/ipfs/QmUz9i7ViNK9kUWHeJRtE44HmpbxBDGJBjyec2aPD6Nn3Q\"]},\"lib/openzeppelin-contracts/contracts/utils/Bytes.sol\":{\"keccak256\":\"0x8140d608316521b1fd71167c3b708ebb8659da070723fc8807609553b296ee33\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://a7bf7db66869ba1e945a0390b85da2f6afc7e42a4735ca918d0d56ac90c50147\",\"dweb:/ipfs/QmRmNyhpBpgzSdQqLtrQCYE7H7eLnVVxh2Yy4YMrySR8AR\"]},\"lib/openzeppelin-contracts/contracts/utils/Panic.sol\":{\"keccak256\":\"0xf7fe324703a64fc51702311dc51562d5cb1497734f074e4f483bfb6717572d7a\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://c6a5ff4f9fd8649b7ee20800b7fa387d3465bd77cf20c2d1068cd5c98e1ed57a\",\"dweb:/ipfs/QmVSaVJf9FXFhdYEYeCEfjMVHrxDh5qL4CGkxdMWpQCrqG\"]},\"lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol\":{\"keccak256\":\"0xa516cbf1c7d15d3517c2d668601ce016c54395bf5171918a14e2686977465f53\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://1e1d079e8edfb58efd23a311e315a4807b01b5d1cf153f8fa2d0608b9dec3e99\",\"dweb:/ipfs/QmTBExeX2SDTkn5xbk5ssbYSx7VqRp9H4Ux1CY4uQM4b9N\"]},\"lib/openzeppelin-contracts/contracts/utils/StorageSlot.sol\":{\"keccak256\":\"0xcf74f855663ce2ae00ed8352666b7935f6cddea2932fdf2c3ecd30a9b1cd0e97\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://9f660b1f351b757dfe01438e59888f31f33ded3afcf5cb5b0d9bf9aa6f320a8b\",\"dweb:/ipfs/QmarDJ5hZEgBtCmmrVzEZWjub9769eD686jmzb2XpSU1cM\"]},\"lib/openzeppelin-contracts/contracts/utils/Strings.sol\":{\"keccak256\":\"0x36d1750bf1aa5fee9c52adb2f7857ab652daca722fc05dff533b364f67a1139a\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://2e5e7052539b7849d02f3ce25acc1dce29373c11cfae9f0bc918c54b780c549a\",\"dweb:/ipfs/QmRGE32xNkMTo6i4pHHMxjpiu77yPwnTA25SFngw2NXJys\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/ERC165.sol\":{\"keccak256\":\"0x2d9dc2fe26180f74c11c13663647d38e259e45f95eb88f57b61d2160b0109d3e\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://81233d1f98060113d9922180bb0f14f8335856fe9f339134b09335e9f678c377\",\"dweb:/ipfs/QmWh6R35SarhAn4z2wH8SU456jJSYL2FgucfTFgbHJJN4E\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol\":{\"keccak256\":\"0x8891738ffe910f0cf2da09566928589bf5d63f4524dd734fd9cedbac3274dd5c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://971f954442df5c2ef5b5ebf1eb245d7105d9fbacc7386ee5c796df1d45b21617\",\"dweb:/ipfs/QmadRjHbkicwqwwh61raUEapaVEtaLMcYbQZWs9gUkgj3u\"]},\"lib/openzeppelin-contracts/contracts/utils/math/Math.sol\":{\"keccak256\":\"0x09e3f1c72d4c5cbe8e2644ab7313f8f7177533ae2f4c24cdcbbeaf520a73734c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://93208401215d539fa2d81626b207c1f611def7883d0e447b3b5969ebaa7b3c2c\",\"dweb:/ipfs/QmXPxDnQPx8LAweX5ZJqEcwkvs59kP4c64VVDG1Jjq1mef\"]},\"lib/openzeppelin-contracts/contracts/utils/math/SafeCast.sol\":{\"keccak256\":\"0x195533c86d0ef72bcc06456a4f66a9b941f38eb403739b00f21fd7c1abd1ae54\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://b1d578337048cad08c1c03041cca5978eff5428aa130c781b271ad9e5566e1f8\",\"dweb:/ipfs/QmPFKL2r9CBsMwmUqqdcFPfHZB2qcs9g1HDrPxzWSxomvy\"]},\"lib/openzeppelin-contracts/contracts/utils/math/SignedMath.sol\":{\"keccak256\":\"0xb1970fac7b64e6c09611e6691791e848d5e3fe410fa5899e7df2e0afd77a99e3\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://db5fbb3dddd8b7047465b62575d96231ba8a2774d37fb4737fbf23340fabbb03\",\"dweb:/ipfs/QmVUSvooZKEdEdap619tcJjTLcAuH6QBdZqAzWwnAXZAWJ\"]},\"src/BaseArbiter.sol\":{\"keccak256\":\"0x27fa97834bcd6e592f3b534e64859b208c688363d33fb9b62436d009ffff3ed1\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://b61ac6195ae644325adf77fdb301651cddfca4b63d9db5123ee075869f3784aa\",\"dweb:/ipfs/QmYRu5hER8gaMjqyY5bDV9EAwVN12CbS3Z2bW8dLp7sPSE\"]},\"src/BaseAttester.sol\":{\"keccak256\":\"0x12339a862aa0571244f4a0c2dae1a7bcc1734717474dbf0d69b63886987d1f99\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://d40e983dece581ecb49a1a01bc87c66e86f8c954cc442a02151ec427d680682d\",\"dweb:/ipfs/QmVA7Tqk1KaYhrZpxWx3cdsjUoxsRaoBjJX8k6nCSEk8En\"]},\"src/BaseEscrowObligationUnconditional.sol\":{\"keccak256\":\"0x4b5953fe02bf51931db76577be2688e2193b0fbc387a077e52ab57c01d981d6b\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://f83218c7d1dba95fe81ef42108978a8e67c93cd84991213e36693817b7e2aa3a\",\"dweb:/ipfs/QmSjVxWETZJC58XxyhVbwZ6iU77a6oXATvwjH7aJG7DofW\"]},\"src/BaseObligation.sol\":{\"keccak256\":\"0xf00b1317dd9203ea59e8da6c0bb23267b50ecb2751cd11b26a6330d1e596eb7b\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://5b9762a2ba2251c6ae9d23aa3ba49a8124f3348ac13c9271b8b9ada438dff475\",\"dweb:/ipfs/QmeBZUvNjNyC7W1hb1PKQq8CawC5ULWX9KXgJjH37wvPGH\"]},\"src/IArbiter.sol\":{\"keccak256\":\"0x00f3f5d8460c738eff4a776cf309efe38342fcc951abfe97d1c2e285acb1e330\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://7201a176f3d5c3d01ca13bbcd9ef5587effe8fabf20e0b8f81f2d6ee362269b9\",\"dweb:/ipfs/QmXn9aSvoGPQuNTxe3mM47RNQ1bfYCEczQCYsDDM9ohc8M\"]},\"src/IEscrow.sol\":{\"keccak256\":\"0x8803bb72e285722a5e90f08046cfee7d37acc6cf83c13a5074cfb0740e316a45\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://965024e29be08418fd9acef578b5253af5fb0d39227c291298d83dae5d7ffd01\",\"dweb:/ipfs/QmPh2h21EC6L4aWauvk5cFzc4x3Xf4f1brxyrgxeKUuWEs\"]},\"src/libraries/ArbiterUtils.sol\":{\"keccak256\":\"0xb87e2bfb9c7292daf6426fbedc09c8683b92841d1b92e7359c0ff94d42be632f\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://3acf498c3c59891d76db768ea57d8f7f6b4010dcbaf44a5f93d95d72f0b12441\",\"dweb:/ipfs/QmVbkioM8dWwYxqatm1dyo9PRFNZ6c7Kbang7pozbnyS7j\"]},\"src/libraries/SchemaRegistryUtils.sol\":{\"keccak256\":\"0x81e4728ad79515866f28175a00a512afd2f7010bd109ae221defb29a87430cd0\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://4edac7284c764f1236b5875ed00f357f0e30aecc5006c88afe220bef60b541d3\",\"dweb:/ipfs/QmXj8oLa1RXMgHCXtgdbriVqQFgX6rjnPNbmQpwpK2YXsK\"]},\"src/obligations/escrow/unconditional/UnconditionalAttestationReferenceEscrowObligation.sol\":{\"keccak256\":\"0xddcf929e1051a4b0f8f7f7d6bab8b9ae224038ea59694d96347d101979c7a8a0\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://4dbb677c7c2bb9e60f5086b9d510678b31caf4515515fc4491440b9180eafa37\",\"dweb:/ipfs/QmQZo2H3Mizu4CL5uZCnho6KUKSNxWHGMDbABh2NTTfUbM\"]}},\"version\":1}",
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
              "name": "attestationId",
              "type": "bytes32"
            }
          ],
          "type": "error",
          "name": "AttestationNotFound"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "AttestationRevoked"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "DeadlineExpired"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InsufficientValue"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidAttestationUid"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidEAS"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidEscrowAttestation"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidFulfillment"
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
          "inputs": [],
          "type": "error",
          "name": "ReentrancyGuardReentrantCall"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "attestationId",
              "type": "bytes32"
            }
          ],
          "type": "error",
          "name": "RevocationFailed"
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
          "inputs": [],
          "type": "error",
          "name": "UnauthorizedCall"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "escrowUid",
              "type": "bytes32",
              "indexed": true
            },
            {
              "internalType": "bytes32",
              "name": "fulfillmentUid",
              "type": "bytes32",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "fulfiller",
              "type": "address",
              "indexed": true
            }
          ],
          "type": "event",
          "name": "EscrowCollected",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "escrowUid",
              "type": "bytes32",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "escrower",
              "type": "address",
              "indexed": true
            }
          ],
          "type": "event",
          "name": "EscrowMade",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "escrowUid",
              "type": "bytes32",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "escrower",
              "type": "address",
              "indexed": true
            }
          ],
          "type": "event",
          "name": "EscrowReclaimed",
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
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "REFERENCE_ATTESTATION_SCHEMA",
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
              "name": "_escrow",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "_fulfillment",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "collect",
          "outputs": [
            {
              "internalType": "bytes",
              "name": "",
              "type": "bytes"
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
          "name": "decodeCondition",
          "outputs": [
            {
              "internalType": "address",
              "name": "arbiter",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "demand",
              "type": "bytes"
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
              "internalType": "struct UnconditionalAttestationReferenceEscrowObligation.ObligationData",
              "name": "",
              "type": "tuple",
              "components": [
                {
                  "internalType": "address",
                  "name": "arbiter",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "demand",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes32",
                  "name": "referencedAttestationUid",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint64",
                  "name": "expirationTime",
                  "type": "uint64"
                }
              ]
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "struct UnconditionalAttestationReferenceEscrowObligation.ObligationData",
              "name": "data",
              "type": "tuple",
              "components": [
                {
                  "internalType": "address",
                  "name": "arbiter",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "demand",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes32",
                  "name": "referencedAttestationUid",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint64",
                  "name": "expirationTime",
                  "type": "uint64"
                }
              ]
            },
            {
              "internalType": "uint64",
              "name": "expirationTime",
              "type": "uint64"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "doObligation",
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
              "internalType": "struct UnconditionalAttestationReferenceEscrowObligation.ObligationData",
              "name": "data",
              "type": "tuple",
              "components": [
                {
                  "internalType": "address",
                  "name": "arbiter",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "demand",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes32",
                  "name": "referencedAttestationUid",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint64",
                  "name": "expirationTime",
                  "type": "uint64"
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
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "doObligationFor",
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
              "internalType": "struct UnconditionalAttestationReferenceEscrowObligation.ObligationData",
              "name": "",
              "type": "tuple",
              "components": [
                {
                  "internalType": "address",
                  "name": "arbiter",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "demand",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes32",
                  "name": "referencedAttestationUid",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint64",
                  "name": "expirationTime",
                  "type": "uint64"
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
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "uid",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "reclaim",
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
          "collect(bytes32,bytes32)": {
            "params": {
              "escrowUid": "UID of the escrow attestation.",
              "fulfillmentUid": "UID of the fulfillment attestation."
            },
            "returns": {
              "_0": "Escrow-specific return data from the underlying release logic."
            }
          },
          "decodeCondition(bytes)": {
            "params": {
              "escrowData": "ABI-encoded escrow obligation data."
            },
            "returns": {
              "arbiter": "Address of the arbiter that validates fulfillment.",
              "demand": "Arbiter-specific demand bytes."
            }
          },
          "doObligationRaw(bytes,uint64,bytes32)": {
            "params": {
              "data": "ABI-encoded obligation data.",
              "expirationTime": "EAS expiration timestamp, or zero for no expiration.",
              "refUID": "Reference UID stored on the EAS attestation."
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
          "reclaim(bytes32)": {
            "params": {
              "escrowUid": "UID of the escrow attestation."
            },
            "returns": {
              "_0": "True if the reclaim succeeds."
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
          "supportsInterface(bytes4)": {
            "details": "Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section] to learn more about how these ids are created. This function call must use less than 30 000 gas."
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
          "collect(bytes32,bytes32)": {
            "notice": "Collects an escrow using a fulfillment attestation."
          },
          "decodeCondition(bytes)": {
            "notice": "Decodes an escrow attestation's condition into arbiter and demand data."
          },
          "decodeObligationData(bytes)": {
            "notice": "Decodes ABI-encoded attestation-reference escrow data."
          },
          "doObligation((address,bytes,bytes32,uint64),uint64)": {
            "notice": "Creates an escrow attestation that certifies an existing attestation reference."
          },
          "doObligationFor((address,bytes,bytes32,uint64),uint64,address)": {
            "notice": "Creates an attestation-reference escrow for an explicit recipient."
          },
          "doObligationRaw(bytes,uint64,bytes32)": {
            "notice": "Creates an obligation attestation from pre-encoded data."
          },
          "getObligationData(bytes32)": {
            "notice": "Loads and decodes attestation-reference escrow data from this contract's attestation."
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
          "reclaim(bytes32)": {
            "notice": "Reclaims an expired escrow and returns locked assets to the escrower."
          },
          "revoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))": {
            "notice": "Processes an attestation revocation and verifies if it can be revoked."
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
        "src/obligations/escrow/unconditional/UnconditionalAttestationReferenceEscrowObligation.sol": "UnconditionalAttestationReferenceEscrowObligation"
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
      "lib/openzeppelin-contracts/contracts/utils/Bytes.sol": {
        "keccak256": "0x8140d608316521b1fd71167c3b708ebb8659da070723fc8807609553b296ee33",
        "urls": [
          "bzz-raw://a7bf7db66869ba1e945a0390b85da2f6afc7e42a4735ca918d0d56ac90c50147",
          "dweb:/ipfs/QmRmNyhpBpgzSdQqLtrQCYE7H7eLnVVxh2Yy4YMrySR8AR"
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
      "src/BaseEscrowObligationUnconditional.sol": {
        "keccak256": "0x4b5953fe02bf51931db76577be2688e2193b0fbc387a077e52ab57c01d981d6b",
        "urls": [
          "bzz-raw://f83218c7d1dba95fe81ef42108978a8e67c93cd84991213e36693817b7e2aa3a",
          "dweb:/ipfs/QmSjVxWETZJC58XxyhVbwZ6iU77a6oXATvwjH7aJG7DofW"
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
      "src/obligations/escrow/unconditional/UnconditionalAttestationReferenceEscrowObligation.sol": {
        "keccak256": "0xddcf929e1051a4b0f8f7f7d6bab8b9ae224038ea59694d96347d101979c7a8a0",
        "urls": [
          "bzz-raw://4dbb677c7c2bb9e60f5086b9d510678b31caf4515515fc4491440b9180eafa37",
          "dweb:/ipfs/QmQZo2H3Mizu4CL5uZCnho6KUKSNxWHGMDbABh2NTTfUbM"
        ],
        "license": "UNLICENSED"
      }
    },
    "version": 1
  },
  "id": 68
} as const;
