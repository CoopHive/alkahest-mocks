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
          "internalType": "struct AttestationReferenceEscrowObligation.ObligationData",
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
          "internalType": "struct AttestationReferenceEscrowObligation.ObligationData",
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
          "internalType": "struct AttestationReferenceEscrowObligation.ObligationData",
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
          "internalType": "struct AttestationReferenceEscrowObligation.ObligationData",
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
    "object": "0x6101a08060405234610256576040816125168038038091610020828561025a565b8339810103126102565780516001600160a01b038116918282036102565760200151906001600160a01b038216808303610256576040519361006360808661025a565b605685527f6164647265737320617262697465722c2062797465732064656d616e642c206260208601527f797465733332207265666572656e6365644174746573746174696f6e5569642c60408601527f2075696e7436342065787069726174696f6e54696d650000000000000000000060608601526001608052600360a0525f60c0521561024757610175938261010e9360e0526101205283610100526001610160523091610375565b6101405260017f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f005560405161014460408261025a565b602081527f62797465733332207265666572656e6365644174746573746174696f6e55696460208201523091610550565b61018052604051611e7b908161069b823960805181610f84015260a05181610faf015260c05181610fda015260e05181611ada01526101005181610dfb0152610120518181816102a8015281816106f60152818161090101528181610a8d0152818161186e0152611cb5015261014051818181610148015281816107360152818161085101528181610a3e01528181610dc901528181610f42015281816116d301526117d60152610160518181816107d90152818161089401526118220152610180518181816103dd0152610bf10152f35b6341bc07ff60e11b5f5260045ffd5b5f80fd5b601f909101601f19168101906001600160401b0382119082101761027d57604052565b634e487b7160e01b5f52604160045260245ffd5b602081830312610256578051906001600160401b0382116102565701906080828203126102565760405191608083016001600160401b0381118482101761027d576040528051835260208101516001600160a01b0381168103610256576020840152604081015180151581036102565760408401526060810151906001600160401b038211610256570181601f82011215610256578051906001600160401b03821161027d576040519261034f601f8401601f19166020018561025a565b8284526020838301011161025657815f9260208093018386015e83010152606082015290565b929160405190602082018351926103bf6015602083818901978089885e810160018060601b03198860601b1683820152600160f81b60348201520301600a1981018452018261025a565b5190206040516351753e3760e11b81526004810182905290956001600160a01b031693905f81602481885afa80156104d05787915f91610536575b505114610530579060846020926040519485938492630c1af44f60e31b8452606060048501525180928160648601528585015e5f84838501015260018060a01b0316602483015260016044830152601f801991011681010301815f865af15f91816104fc575b506104db57505f602491604051928380926351753e3760e11b82528760048301525afa80156104d05783915f916104ae575b5051146104ac5750639e6113d560e01b5f5260045260245ffd5b565b6104ca91503d805f833e6104c2818361025a565b810190610291565b5f610492565b6040513d5f823e3d90fd5b919280915082036104ea575090565b639e6113d560e01b5f5260045260245ffd5b9091506020813d602011610528575b816105186020938361025a565b810103126102565751905f610460565b3d915061050b565b50505050565b61054a91503d805f833e6104c2818361025a565b5f6103fa565b929160405190602082018351926105966015602083818901978089885e810160018060601b03198860601b16838201525f60348201520301600a1981018452018261025a565b5190206040516351753e3760e11b81526004810182905290956001600160a01b031693905f81602481885afa80156104d05787915f91610680575b505114610530579060846020926040519485938492630c1af44f60e31b8452606060048501525180928160648601528585015e5f84838501015260018060a01b031660248301525f6044830152601f801991011681010301815f865af15f91816104fc57506104db57505f602491604051928380926351753e3760e11b82528760048301525afa80156104d05783915f916104ae575051146104ac5750639e6113d560e01b5f5260045260245ffd5b61069491503d805f833e6104c2818361025a565b5f6105d156fe6080806040526004361015610029575b50361561001a575f80fd5b631574f9f360e01b5f5260045ffd5b5f905f3560e01c90816301ffc9a7146111575750806332bd03ad146110da5780634b379a901461106757806354fd4d5014610f655780635bf2f20d14610f2b5780636b122fe014610d8a578063760bd11814610d2c57806388e5b2d914610bbb5780638da3721a14610c145780638e8a4da414610bda57806391db0b7e14610bbb57806396afb36514610a0f578063b3b902d4146107fe578063b587a5eb146107c1578063c6ec5070146106b5578063c93844be146105de578063ce46e046146105c2578063e49617e11461059d578063e60c35051461059d5763ea6ec49c0361000f573461059a57604036600319011261059a576024359060043561012d611b32565b61013681611c8f565b61013f84611c8f565b906020810151907f000000000000000000000000000000000000000000000000000000000000000080920361058b5761017781611d3d565b1561058b5761012081019061018c82516115ff565b60a0869392930191825181510361057c576101a687611d3d565b1561057c5751604080516346d1b90d60e11b8152606060048201819052895160648301526020808b01516084840152928a01516001600160401b0390811660a4840152908a0151811660c483015260808a01511660e4820152935161010485015260c0880180516001600160a01b0390811661012487015260e08a01511661014486015261010089015115156101648601526101209098015161014061018486015293949093859391928492839261027a9190610268906101a4860190611202565b84810360031901602486015290611202565b604483019190915203916001600160a01b03165afa908115610571578691610537575b5015610528576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031692906102db81611271565b858152866020820152604051916102f183611271565b82526020820152823b1561052457604051634692626760e01b8152815160048201526020918201518051602483015290910151604482015285808260648183885af1918261050f575b50506103545763614cf93960e01b85526004849052602485fd5b61041e8594939260209261037b60018060a01b03865116915185808251830101910161157f565b60406001600160401b036060830151169101516040519181878401528683526103a56040846112a7565b604051936103b28561128c565b845286840152886040840152606083015260808201528660a0820152604051906103db82611271565b7f000000000000000000000000000000000000000000000000000000000000000082528482015260405196878094819363f17325e760e01b835260048301611daf565b03925af19283156105045784936104aa575b50907ff96e77bc177ae8e2ff25185e7c6d85f8ba97c8bdd9d46933aac70a7a33edf6c0946104a69392604051936020850152602084526104716040856112a7565b516040519687966001600160a01b03909216939180a460015f516020611e265f395f51905f5255602083526020830190611202565b0390f35b9250906020833d6020116104fc575b816104c6602093836112a7565b810103126104f857915191907ff96e77bc177ae8e2ff25185e7c6d85f8ba97c8bdd9d46933aac70a7a33edf6c0610430565b5f80fd5b3d91506104b9565b6040513d86823e3d90fd5b81610519916112a7565b61052457855f61033a565b8580fd5b630ebe58ef60e11b8552600485fd5b90506020813d602011610569575b81610552602093836112a7565b8101031261052457610563906114fa565b5f61029d565b3d9150610545565b6040513d88823e3d90fd5b630ebe58ef60e11b8952600489fd5b63629cd40b60e11b8552600485fd5b80fd5b60206105b86105ab3661142e565b6105b3611ad8565b611b19565b6040519015158152f35b503461059a578060031936011261059a57602090604051908152f35b503461059a57602036600319011261059a576004356001600160401b0381116106ad5761060f9036906004016113b7565b61061a9291926117a4565b508201916020818403126106ad578035906001600160401b0382116106b15701916080838203126106ad576040519161065283611226565b61065b846111ee565b83526020840135906001600160401b03821161059a57508361068761069c936060936104a69701611319565b602085015260408101356040850152016111da565b6060820152604051918291826113e4565b5080fd5b8280fd5b503461059a57602036600319011261059a576106cf6117a4565b506106d8611b6a565b506040516328c44a9960e21b815260048035908201529080826024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9182156107b4578192610790575b5060208201517f000000000000000000000000000000000000000000000000000000000000000003610781576104a66107756101208401516020808251830101910161157f565b604051918291826113e4565b635527981560e11b8152600490fd5b6107ad9192503d8084833e6107a581836112a7565b810190611bb4565b905f61072e565b50604051903d90823e3d90fd5b503461059a578060031936011261059a5760206040517f000000000000000000000000000000000000000000000000000000000000000015158152f35b50606036600319011261059a576004356001600160401b0381116106ad5761082d6108fc9136906004016113b7565b929061084661083a6111c4565b916044359536916112e3565b9061084f611b32565b7f0000000000000000000000000000000000000000000000000000000000000000906001600160401b03604051916108868361128c565b3383521680602083015260207f00000000000000000000000000000000000000000000000000000000000000001515928360408201528860608201528560808201528660a0820152604051906108db82611271565b858252828201526040518098819263f17325e760e01b835260048301611daf565b0381887f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1958615610a045785966109c9575b509060209661012093926040519361095085611255565b888552898501526001600160401b0342166040850152606084015285608084015260a08301523360c08301523060e08301526101008201520152817f8f7f2dbafd79125e808bf16a53d7fa4e17b8b6374ced76d946a45f94b7bf4d06339280a360015f516020611e265f395f51905f5255604051908152f35b92919095506020833d6020116109fc575b816109e7602093836112a7565b810103126104f8579151949091906020610939565b3d91506109da565b6040513d87823e3d90fd5b50346104f85760203660031901126104f85760043590610a2d611b32565b610a3682611c8f565b9160208301517f0000000000000000000000000000000000000000000000000000000000000000809103610bac57606084016001600160401b0381511615610b9d57516001600160401b03164210610b9d576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690610abf81611271565b8381525f602082015260405192610ad584611271565b83526020830152803b156104f857604051634692626760e01b815282516004820152602092830151805160248301529092015160448301525f908290606490829084905af19081610b88575b50610b395763614cf93960e01b825260045260249150fd5b60209260c060018060a01b0391015116907f655ef333d5efcbf5aa343f02bcd9e3539f9c9f9ee8b9cfa7d8910b1bd7e0a8326040519380a360015f516020611e265f395f51905f525560018152f35b610b959193505f906112a7565b5f915f610b21565b637bf6a16f60e01b5f5260045ffd5b63629cd40b60e11b5f5260045ffd5b60206105b8610bc936611367565b92610bd5929192611ad8565b611628565b346104f8575f3660031901126104f85760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b346104f85760603660031901126104f8576004356001600160401b0381116104f85761014060031982360301126104f85760405190610c5282611255565b8060040135825260248101356020830152610c6f604482016111da565b6040830152610c80606482016111da565b6060830152610c91608482016111da565b608083015260a481013560a0830152610cac60c482016111ee565b60c0830152610cbd60e482016111ee565b60e083015261010481013580151581036104f857610100830152610124810135906001600160401b0382116104f8576004610cfb9236920101611319565b6101208201526024356001600160401b0381116104f857602091610d266105b8923690600401611319565b906116cc565b346104f85760203660031901126104f8576004356001600160401b0381116104f857610d5f610d64913690600401611319565b6115ff565b604080516001600160a01b0390931683526020830181905282916104a691830190611202565b346104f8575f3660031901126104f857606080604051610da981611226565b5f81525f60208201525f604082015201526040516351753e3760e11b81527f000000000000000000000000000000000000000000000000000000000000000060048201525f8160248160018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165afa8015610f20575f90610e70575b6060906104a6604051928392602084528051602085015260018060a01b0360208201511660408501526040810151151582850152015160808084015260a0830190611202565b503d805f833e610e8081836112a7565b8101906020818303126104f8578051906001600160401b0382116104f857016080818303126104f85760405190610eb682611226565b8051825260208101516001600160a01b03811681036104f8576020830152610ee0604082016114fa565b60408301526060810151906001600160401b0382116104f8570182601f820112156104f857606092816020610f1793519101611507565b82820152610e2a565b6040513d5f823e3d90fd5b346104f8575f3660031901126104f85760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b346104f8575f3660031901126104f8576104a660206110536001610fa87f000000000000000000000000000000000000000000000000000000000000000061196b565b8184610fd37f000000000000000000000000000000000000000000000000000000000000000061196b565b8180610ffe7f000000000000000000000000000000000000000000000000000000000000000061196b565b9260405199878b985191829101848a015e870190601760f91b83830152805192839101602183015e010190601760f91b84830152805192839101600283015e01015f838201520301601f1981018352826112a7565b604051918291602083526020830190611202565b346104f85760403660031901126104f8576004356001600160401b0381116104f857608060031982360301126104f8576110d26110bd6020926110cb6110ab6111c4565b91604051938491600401878301611462565b03601f1981018452836112a7565b33916117c8565b604051908152f35b346104f85760603660031901126104f8576004356001600160401b0381116104f857608060031982360301126104f8576111126111c4565b906044356001600160a01b03811681036104f8576020926111446111526110d294604051928391600401888301611462565b03601f1981018352826112a7565b6117c8565b346104f85760203660031901126104f8576004359063ffffffff60e01b82168092036104f8576020916346d1b90d60e11b8114908115611199575b5015158152f35b630acaa6e160e01b8114915081156111b3575b5083611192565b6301ffc9a760e01b149050836111ac565b602435906001600160401b03821682036104f857565b35906001600160401b03821682036104f857565b35906001600160a01b03821682036104f857565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b608081019081106001600160401b0382111761124157604052565b634e487b7160e01b5f52604160045260245ffd5b61014081019081106001600160401b0382111761124157604052565b604081019081106001600160401b0382111761124157604052565b60c081019081106001600160401b0382111761124157604052565b90601f801991011681019081106001600160401b0382111761124157604052565b6001600160401b03811161124157601f01601f191660200190565b9291926112ef826112c8565b916112fd60405193846112a7565b8294818452818301116104f8578281602093845f960137010152565b9080601f830112156104f857816020611334933591016112e3565b90565b9181601f840112156104f8578235916001600160401b0383116104f8576020808501948460051b0101116104f857565b60406003198201126104f8576004356001600160401b0381116104f8578161139191600401611337565b92909291602435906001600160401b0382116104f8576113b391600401611337565b9091565b9181601f840112156104f8578235916001600160401b0383116104f857602083818601950101116104f857565b6020815260018060a01b03825116602082015260806001600160401b03606061141b602086015184604087015260a0860190611202565b9460408101518286015201511691015290565b60206003198201126104f857600435906001600160401b0382116104f8576101409082900360031901126104f85760040190565b602081526001600160a01b03611477836111ee565b1660208201526020820135601e19833603018112156104f85782016020813591016001600160401b0382116104f85781360381136104f8576114e8606060c095846001600160401b0394608060408901528160a0890152888801375f878688010152604081013582870152016111da565b166080830152601f01601f1916010190565b519081151582036104f857565b929192611513826112c8565b9161152160405193846112a7565b8294818452818301116104f8578281602093845f96015e010152565b51906001600160a01b03821682036104f857565b9080601f830112156104f857815161133492602001611507565b51906001600160401b03821682036104f857565b6020818303126104f8578051906001600160401b0382116104f857016080818303126104f857604051916115b283611226565b6115bb8261153d565b83526020820151916001600160401b0383116104f8576115e26060926115f7948301611551565b6020850152604081015160408501520161156b565b606082015290565b611612906020808251830101910161157f565b80516020909101516001600160a01b0390911691565b9290928184036116bd575f91345b858410156116b2578184101561169e578360051b808601359082821161168f5784013561013e19853603018112156104f857611673908501611b19565b156116845760019103930192611636565b505050505050505f90565b63044044a560e21b5f5260045ffd5b634e487b7160e01b5f52603260045260245ffd5b505050505050600190565b63251f56a160e21b5f5260045ffd5b60208101517f00000000000000000000000000000000000000000000000000000000000000000361179e576117126101206117229201516020808251830101910161157f565b916020808251830101910161157f565b60408201516040820151149182611779575b82611760575b8261174457505090565b6020919250810151818151910120910151602081519101201490565b805182516001600160a01b03908116911614925061173a565b91506001600160401b036060830151166001600160401b036060830151161491611734565b50505f90565b604051906117b182611226565b5f6060838281528160208201528260408201520152565b611869926117d4611b32565b7f0000000000000000000000000000000000000000000000000000000000000000906001600160401b036040519161180b8361128c565b60018060a01b0316948583521680602083015260207f00000000000000000000000000000000000000000000000000000000000000001515928360408201525f60608201528560808201525f60a0820152604051906108db82611271565b03815f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1958615610f20575f9661192f575b50906101209291604051926118ba84611255565b87845260208401526001600160401b034216604084015260608301525f60808301525f60a08301528460c08301523060e08301526101008201520152817f8f7f2dbafd79125e808bf16a53d7fa4e17b8b6374ced76d946a45f94b7bf4d065f80a39060015f516020611e265f395f51905f5255565b92919095506020833d602011611963575b8161194d602093836112a7565b810103126104f8576101209251959091926118a6565b3d9150611940565b805f9172184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b821015611ab5575b806d04ee2d6d415b85acef8100000000600a921015611a9a575b662386f26fc10000811015611a86575b6305f5e100811015611a75575b612710811015611a66575b6064811015611a58575b1015611a4d575b600a602160018401936119f2856112c8565b94611a0060405196876112a7565b808652611a0f601f19916112c8565b013660208701378401015b5f1901916f181899199a1a9b1b9c1cb0b131b232b360811b8282061a8353048015611a4857600a9091611a1a565b505090565b6001909101906119e0565b6064600291049301926119d9565b612710600491049301926119cf565b6305f5e100600891049301926119c4565b662386f26fc10000601091049301926119b7565b6d04ee2d6d415b85acef8100000000602091049301926119a7565b506040915072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b810461198d565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303611b0a57565b634ca8886760e01b5f5260045ffd5b60e0013560018060a01b0381168091036104f857301490565b60025f516020611e265f395f51905f525414611b5b5760025f516020611e265f395f51905f5255565b633ee5aeb560e01b5f5260045ffd5b60405190611b7782611255565b6060610120835f81525f60208201525f60408201525f838201525f60808201525f60a08201525f60c08201525f60e08201525f6101008201520152565b6020818303126104f8578051906001600160401b0382116104f85701610140818303126104f85760405191611be883611255565b8151835260208201516020840152611c026040830161156b565b6040840152611c136060830161156b565b6060840152611c246080830161156b565b608084015260a082015160a0840152611c3f60c0830161153d565b60c0840152611c5060e0830161153d565b60e0840152611c6261010083016114fa565b6101008401526101208201516001600160401b0381116104f857611c869201611551565b61012082015290565b90611c98611b6a565b506040516328c44a9960e21b815260048101839052915f836024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa928315610f20575f93611d21575b508251818115918215611d16575b5050611d045750565b6301fb6dd160e01b5f5260045260245ffd5b14159050815f611cfb565b611d369193503d805f833e6107a581836112a7565b915f611ced565b805115611da0576001600160401b036060820151168015159081611d95575b50611d8657608001516001600160401b0316611d7757600190565b637b6227e960e11b5f5260045ffd5b631ab7da6b60e01b5f5260045ffd5b90504210155f611d5c565b635c2c7f8960e01b5f5260045ffd5b9060209081835280518284015201519060408082015260018060a01b0382511660608201526001600160401b0360208301511660808201526040820151151560a0820152606082015160c082015261010060a0611e1c608085015160c060e0860152610120850190611202565b9301519101529056fe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a2646970667358221220be3a7200b7d81ec65f3309892ac2ac30ee19663e660a4d10d92a017ddbe7dc1e64736f6c634300081b0033",
    "sourceMap": "918:4652:64:-:0;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;1648:4;918:4652;759:14:6;688:1:9;783:14:6;;-1:-1:-1;807:14:6;;708:26:9;704:76;;1720:106:64;790:10:9;;2065:81:55;790:10:9;;;1932::55;;1952:32;;;1648:4:64;1994:40:55;;2128:4;2065:81;;:::i;:::-;2044:102;;1648:4:64;1505:66:41;2365:1;918:4652:64;;;;;;:::i;:::-;;;;;;;;;2128:4:55;1720:106:64;;:::i;:::-;1677:149;;918:4652;;;;;;;;;;;;;;783:14:6;918:4652:64;;;;;807:14:6;918:4652:64;;;;;790:10:9;918:4652:64;;;;;1952:32:55;918:4652:64;;;;;1932:10:55;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2044:102:55;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1994:40:55;918:4652:64;;;;;;;;;;;;;;;1677:149;918:4652;;;;;;;;;;;704:76:9;757:12;;;-1:-1:-1;757:12:9;;-1:-1:-1;757:12:9;918:4652:64;-1:-1:-1;918:4652:64;;;;;;;-1:-1:-1;;918:4652:64;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;:::o;:::-;;;;-1:-1:-1;918:4652:64;;;;;-1:-1:-1;918:4652:64;;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;-1:-1:-1;;918:4652:64;;;;;:::i;:::-;;;;;;;;;;;;;-1:-1:-1;918:4652:64;;;;;;;;;;;;;;;;;;:::o;597:755:62:-;;;918:4652:64;;1602:45:62;;;;918:4652:64;;;1602:45:62;918:4652:64;1602:45:62;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1602:45:62;;;;;;;;;;;:::i;:::-;918:4652:64;1592:56:62;;918:4652:64;;-1:-1:-1;;;880:29:62;;;;;918:4652:64;;;1592:56:62;;-1:-1:-1;;;;;918:4652:64;;;-1:-1:-1;918:4652:64;880:29:62;918:4652:64;;880:29:62;;;;;;;;-1:-1:-1;880:29:62;;;597:755;918:4652:64;;923:19:62;919:35;;918:4652:64;;1602:45:62;918:4652:64;;;;;;;;;;;969:52:62;;918:4652:64;880:29:62;969:52;;918:4652:64;;;;;;;;;;;;;-1:-1:-1;918:4652:64;;;;;;;;;;;;880:29:62;918:4652:64;;;1648:4;918:4652;;;;;;;;;;;;969:52:62;;;-1:-1:-1;969:52:62;;;-1:-1:-1;;969:52:62;;;597:755;-1:-1:-1;965:381:62;;918:4652:64;-1:-1:-1;880:29:62;918:4652:64;;;;;;;;;;1207:29:62;;;880;1207;;918:4652:64;1207:29:62;;;;;;;;-1:-1:-1;1207:29:62;;;965:381;918:4652:64;;1254:19:62;1250:35;;1101:29;;;;-1:-1:-1;1306:29:62;880;918:4652:64;880:29:62;-1:-1:-1;1306:29:62;1250:35;1275:10::o;1207:29::-;;;;;;-1:-1:-1;1207:29:62;;;;;;:::i;:::-;;;;;:::i;:::-;;;;;918:4652:64;;;-1:-1:-1;918:4652:64;;;;;965:381:62;1072:20;;;;;;;1068:62;;1144:20;;:::o;1068:62::-;1101:29;;;-1:-1:-1;1101:29:62;880;918:4652:64;880:29:62;-1:-1:-1;1101:29:62;969:52;;;;1602:45;969:52;;1602:45;969:52;;;;;;1602:45;969:52;;;:::i;:::-;;;918:4652:64;;;;;969:52:62;;;;;;;-1:-1:-1;969:52:62;;919:35;944:10;;;;:::o;880:29::-;;;;;;-1:-1:-1;880:29:62;;;;;;:::i;:::-;;;;597:755;;;918:4652:64;;1602:45:62;;;;918:4652:64;;;1602:45:62;918:4652:64;1602:45:62;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;;;691:1:9;918:4652:64;;;;1602:45:62;;;;;;;;;;;:::i;:::-;918:4652:64;1592:56:62;;918:4652:64;;-1:-1:-1;;;880:29:62;;;;;918:4652:64;;;1592:56:62;;-1:-1:-1;;;;;918:4652:64;;;-1:-1:-1;918:4652:64;880:29:62;918:4652:64;;880:29:62;;;;;;;;691:1:9;880:29:62;;;597:755;918:4652:64;;923:19:62;919:35;;918:4652:64;;1602:45:62;918:4652:64;;;;;;;;;;;969:52:62;;918:4652:64;880:29:62;969:52;;918:4652:64;;;;;;;;;;;;;691:1:9;918:4652:64;;;;;;;;;;;;880:29:62;918:4652:64;;;691:1:9;918:4652:64;;;;;;;;;;;;969:52:62;;;691:1:9;969:52:62;;;691:1:9;;969:52:62;;;-1:-1:-1;965:381:62;;918:4652:64;691:1:9;880:29:62;918:4652:64;;;;;;;;;;1207:29:62;;;880;1207;;918:4652:64;1207:29:62;;;;;;;;691:1:9;1207:29:62;;;918:4652:64;;1254:19:62;1250:35;;1101:29;;;;691:1:9;1306:29:62;880;918:4652:64;880:29:62;691:1:9;1306:29:62;880;;;;;;691:1:9;880:29:62;;;;;;:::i;:::-;;;",
    "linkReferences": {}
  },
  "deployedBytecode": {
    "object": "0x6080806040526004361015610029575b50361561001a575f80fd5b631574f9f360e01b5f5260045ffd5b5f905f3560e01c90816301ffc9a7146111575750806332bd03ad146110da5780634b379a901461106757806354fd4d5014610f655780635bf2f20d14610f2b5780636b122fe014610d8a578063760bd11814610d2c57806388e5b2d914610bbb5780638da3721a14610c145780638e8a4da414610bda57806391db0b7e14610bbb57806396afb36514610a0f578063b3b902d4146107fe578063b587a5eb146107c1578063c6ec5070146106b5578063c93844be146105de578063ce46e046146105c2578063e49617e11461059d578063e60c35051461059d5763ea6ec49c0361000f573461059a57604036600319011261059a576024359060043561012d611b32565b61013681611c8f565b61013f84611c8f565b906020810151907f000000000000000000000000000000000000000000000000000000000000000080920361058b5761017781611d3d565b1561058b5761012081019061018c82516115ff565b60a0869392930191825181510361057c576101a687611d3d565b1561057c5751604080516346d1b90d60e11b8152606060048201819052895160648301526020808b01516084840152928a01516001600160401b0390811660a4840152908a0151811660c483015260808a01511660e4820152935161010485015260c0880180516001600160a01b0390811661012487015260e08a01511661014486015261010089015115156101648601526101209098015161014061018486015293949093859391928492839261027a9190610268906101a4860190611202565b84810360031901602486015290611202565b604483019190915203916001600160a01b03165afa908115610571578691610537575b5015610528576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031692906102db81611271565b858152866020820152604051916102f183611271565b82526020820152823b1561052457604051634692626760e01b8152815160048201526020918201518051602483015290910151604482015285808260648183885af1918261050f575b50506103545763614cf93960e01b85526004849052602485fd5b61041e8594939260209261037b60018060a01b03865116915185808251830101910161157f565b60406001600160401b036060830151169101516040519181878401528683526103a56040846112a7565b604051936103b28561128c565b845286840152886040840152606083015260808201528660a0820152604051906103db82611271565b7f000000000000000000000000000000000000000000000000000000000000000082528482015260405196878094819363f17325e760e01b835260048301611daf565b03925af19283156105045784936104aa575b50907ff96e77bc177ae8e2ff25185e7c6d85f8ba97c8bdd9d46933aac70a7a33edf6c0946104a69392604051936020850152602084526104716040856112a7565b516040519687966001600160a01b03909216939180a460015f516020611e265f395f51905f5255602083526020830190611202565b0390f35b9250906020833d6020116104fc575b816104c6602093836112a7565b810103126104f857915191907ff96e77bc177ae8e2ff25185e7c6d85f8ba97c8bdd9d46933aac70a7a33edf6c0610430565b5f80fd5b3d91506104b9565b6040513d86823e3d90fd5b81610519916112a7565b61052457855f61033a565b8580fd5b630ebe58ef60e11b8552600485fd5b90506020813d602011610569575b81610552602093836112a7565b8101031261052457610563906114fa565b5f61029d565b3d9150610545565b6040513d88823e3d90fd5b630ebe58ef60e11b8952600489fd5b63629cd40b60e11b8552600485fd5b80fd5b60206105b86105ab3661142e565b6105b3611ad8565b611b19565b6040519015158152f35b503461059a578060031936011261059a57602090604051908152f35b503461059a57602036600319011261059a576004356001600160401b0381116106ad5761060f9036906004016113b7565b61061a9291926117a4565b508201916020818403126106ad578035906001600160401b0382116106b15701916080838203126106ad576040519161065283611226565b61065b846111ee565b83526020840135906001600160401b03821161059a57508361068761069c936060936104a69701611319565b602085015260408101356040850152016111da565b6060820152604051918291826113e4565b5080fd5b8280fd5b503461059a57602036600319011261059a576106cf6117a4565b506106d8611b6a565b506040516328c44a9960e21b815260048035908201529080826024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9182156107b4578192610790575b5060208201517f000000000000000000000000000000000000000000000000000000000000000003610781576104a66107756101208401516020808251830101910161157f565b604051918291826113e4565b635527981560e11b8152600490fd5b6107ad9192503d8084833e6107a581836112a7565b810190611bb4565b905f61072e565b50604051903d90823e3d90fd5b503461059a578060031936011261059a5760206040517f000000000000000000000000000000000000000000000000000000000000000015158152f35b50606036600319011261059a576004356001600160401b0381116106ad5761082d6108fc9136906004016113b7565b929061084661083a6111c4565b916044359536916112e3565b9061084f611b32565b7f0000000000000000000000000000000000000000000000000000000000000000906001600160401b03604051916108868361128c565b3383521680602083015260207f00000000000000000000000000000000000000000000000000000000000000001515928360408201528860608201528560808201528660a0820152604051906108db82611271565b858252828201526040518098819263f17325e760e01b835260048301611daf565b0381887f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1958615610a045785966109c9575b509060209661012093926040519361095085611255565b888552898501526001600160401b0342166040850152606084015285608084015260a08301523360c08301523060e08301526101008201520152817f8f7f2dbafd79125e808bf16a53d7fa4e17b8b6374ced76d946a45f94b7bf4d06339280a360015f516020611e265f395f51905f5255604051908152f35b92919095506020833d6020116109fc575b816109e7602093836112a7565b810103126104f8579151949091906020610939565b3d91506109da565b6040513d87823e3d90fd5b50346104f85760203660031901126104f85760043590610a2d611b32565b610a3682611c8f565b9160208301517f0000000000000000000000000000000000000000000000000000000000000000809103610bac57606084016001600160401b0381511615610b9d57516001600160401b03164210610b9d576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690610abf81611271565b8381525f602082015260405192610ad584611271565b83526020830152803b156104f857604051634692626760e01b815282516004820152602092830151805160248301529092015160448301525f908290606490829084905af19081610b88575b50610b395763614cf93960e01b825260045260249150fd5b60209260c060018060a01b0391015116907f655ef333d5efcbf5aa343f02bcd9e3539f9c9f9ee8b9cfa7d8910b1bd7e0a8326040519380a360015f516020611e265f395f51905f525560018152f35b610b959193505f906112a7565b5f915f610b21565b637bf6a16f60e01b5f5260045ffd5b63629cd40b60e11b5f5260045ffd5b60206105b8610bc936611367565b92610bd5929192611ad8565b611628565b346104f8575f3660031901126104f85760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b346104f85760603660031901126104f8576004356001600160401b0381116104f85761014060031982360301126104f85760405190610c5282611255565b8060040135825260248101356020830152610c6f604482016111da565b6040830152610c80606482016111da565b6060830152610c91608482016111da565b608083015260a481013560a0830152610cac60c482016111ee565b60c0830152610cbd60e482016111ee565b60e083015261010481013580151581036104f857610100830152610124810135906001600160401b0382116104f8576004610cfb9236920101611319565b6101208201526024356001600160401b0381116104f857602091610d266105b8923690600401611319565b906116cc565b346104f85760203660031901126104f8576004356001600160401b0381116104f857610d5f610d64913690600401611319565b6115ff565b604080516001600160a01b0390931683526020830181905282916104a691830190611202565b346104f8575f3660031901126104f857606080604051610da981611226565b5f81525f60208201525f604082015201526040516351753e3760e11b81527f000000000000000000000000000000000000000000000000000000000000000060048201525f8160248160018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165afa8015610f20575f90610e70575b6060906104a6604051928392602084528051602085015260018060a01b0360208201511660408501526040810151151582850152015160808084015260a0830190611202565b503d805f833e610e8081836112a7565b8101906020818303126104f8578051906001600160401b0382116104f857016080818303126104f85760405190610eb682611226565b8051825260208101516001600160a01b03811681036104f8576020830152610ee0604082016114fa565b60408301526060810151906001600160401b0382116104f8570182601f820112156104f857606092816020610f1793519101611507565b82820152610e2a565b6040513d5f823e3d90fd5b346104f8575f3660031901126104f85760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b346104f8575f3660031901126104f8576104a660206110536001610fa87f000000000000000000000000000000000000000000000000000000000000000061196b565b8184610fd37f000000000000000000000000000000000000000000000000000000000000000061196b565b8180610ffe7f000000000000000000000000000000000000000000000000000000000000000061196b565b9260405199878b985191829101848a015e870190601760f91b83830152805192839101602183015e010190601760f91b84830152805192839101600283015e01015f838201520301601f1981018352826112a7565b604051918291602083526020830190611202565b346104f85760403660031901126104f8576004356001600160401b0381116104f857608060031982360301126104f8576110d26110bd6020926110cb6110ab6111c4565b91604051938491600401878301611462565b03601f1981018452836112a7565b33916117c8565b604051908152f35b346104f85760603660031901126104f8576004356001600160401b0381116104f857608060031982360301126104f8576111126111c4565b906044356001600160a01b03811681036104f8576020926111446111526110d294604051928391600401888301611462565b03601f1981018352826112a7565b6117c8565b346104f85760203660031901126104f8576004359063ffffffff60e01b82168092036104f8576020916346d1b90d60e11b8114908115611199575b5015158152f35b630acaa6e160e01b8114915081156111b3575b5083611192565b6301ffc9a760e01b149050836111ac565b602435906001600160401b03821682036104f857565b35906001600160401b03821682036104f857565b35906001600160a01b03821682036104f857565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b608081019081106001600160401b0382111761124157604052565b634e487b7160e01b5f52604160045260245ffd5b61014081019081106001600160401b0382111761124157604052565b604081019081106001600160401b0382111761124157604052565b60c081019081106001600160401b0382111761124157604052565b90601f801991011681019081106001600160401b0382111761124157604052565b6001600160401b03811161124157601f01601f191660200190565b9291926112ef826112c8565b916112fd60405193846112a7565b8294818452818301116104f8578281602093845f960137010152565b9080601f830112156104f857816020611334933591016112e3565b90565b9181601f840112156104f8578235916001600160401b0383116104f8576020808501948460051b0101116104f857565b60406003198201126104f8576004356001600160401b0381116104f8578161139191600401611337565b92909291602435906001600160401b0382116104f8576113b391600401611337565b9091565b9181601f840112156104f8578235916001600160401b0383116104f857602083818601950101116104f857565b6020815260018060a01b03825116602082015260806001600160401b03606061141b602086015184604087015260a0860190611202565b9460408101518286015201511691015290565b60206003198201126104f857600435906001600160401b0382116104f8576101409082900360031901126104f85760040190565b602081526001600160a01b03611477836111ee565b1660208201526020820135601e19833603018112156104f85782016020813591016001600160401b0382116104f85781360381136104f8576114e8606060c095846001600160401b0394608060408901528160a0890152888801375f878688010152604081013582870152016111da565b166080830152601f01601f1916010190565b519081151582036104f857565b929192611513826112c8565b9161152160405193846112a7565b8294818452818301116104f8578281602093845f96015e010152565b51906001600160a01b03821682036104f857565b9080601f830112156104f857815161133492602001611507565b51906001600160401b03821682036104f857565b6020818303126104f8578051906001600160401b0382116104f857016080818303126104f857604051916115b283611226565b6115bb8261153d565b83526020820151916001600160401b0383116104f8576115e26060926115f7948301611551565b6020850152604081015160408501520161156b565b606082015290565b611612906020808251830101910161157f565b80516020909101516001600160a01b0390911691565b9290928184036116bd575f91345b858410156116b2578184101561169e578360051b808601359082821161168f5784013561013e19853603018112156104f857611673908501611b19565b156116845760019103930192611636565b505050505050505f90565b63044044a560e21b5f5260045ffd5b634e487b7160e01b5f52603260045260245ffd5b505050505050600190565b63251f56a160e21b5f5260045ffd5b60208101517f00000000000000000000000000000000000000000000000000000000000000000361179e576117126101206117229201516020808251830101910161157f565b916020808251830101910161157f565b60408201516040820151149182611779575b82611760575b8261174457505090565b6020919250810151818151910120910151602081519101201490565b805182516001600160a01b03908116911614925061173a565b91506001600160401b036060830151166001600160401b036060830151161491611734565b50505f90565b604051906117b182611226565b5f6060838281528160208201528260408201520152565b611869926117d4611b32565b7f0000000000000000000000000000000000000000000000000000000000000000906001600160401b036040519161180b8361128c565b60018060a01b0316948583521680602083015260207f00000000000000000000000000000000000000000000000000000000000000001515928360408201525f60608201528560808201525f60a0820152604051906108db82611271565b03815f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1958615610f20575f9661192f575b50906101209291604051926118ba84611255565b87845260208401526001600160401b034216604084015260608301525f60808301525f60a08301528460c08301523060e08301526101008201520152817f8f7f2dbafd79125e808bf16a53d7fa4e17b8b6374ced76d946a45f94b7bf4d065f80a39060015f516020611e265f395f51905f5255565b92919095506020833d602011611963575b8161194d602093836112a7565b810103126104f8576101209251959091926118a6565b3d9150611940565b805f9172184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b821015611ab5575b806d04ee2d6d415b85acef8100000000600a921015611a9a575b662386f26fc10000811015611a86575b6305f5e100811015611a75575b612710811015611a66575b6064811015611a58575b1015611a4d575b600a602160018401936119f2856112c8565b94611a0060405196876112a7565b808652611a0f601f19916112c8565b013660208701378401015b5f1901916f181899199a1a9b1b9c1cb0b131b232b360811b8282061a8353048015611a4857600a9091611a1a565b505090565b6001909101906119e0565b6064600291049301926119d9565b612710600491049301926119cf565b6305f5e100600891049301926119c4565b662386f26fc10000601091049301926119b7565b6d04ee2d6d415b85acef8100000000602091049301926119a7565b506040915072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b810461198d565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303611b0a57565b634ca8886760e01b5f5260045ffd5b60e0013560018060a01b0381168091036104f857301490565b60025f516020611e265f395f51905f525414611b5b5760025f516020611e265f395f51905f5255565b633ee5aeb560e01b5f5260045ffd5b60405190611b7782611255565b6060610120835f81525f60208201525f60408201525f838201525f60808201525f60a08201525f60c08201525f60e08201525f6101008201520152565b6020818303126104f8578051906001600160401b0382116104f85701610140818303126104f85760405191611be883611255565b8151835260208201516020840152611c026040830161156b565b6040840152611c136060830161156b565b6060840152611c246080830161156b565b608084015260a082015160a0840152611c3f60c0830161153d565b60c0840152611c5060e0830161153d565b60e0840152611c6261010083016114fa565b6101008401526101208201516001600160401b0381116104f857611c869201611551565b61012082015290565b90611c98611b6a565b506040516328c44a9960e21b815260048101839052915f836024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa928315610f20575f93611d21575b508251818115918215611d16575b5050611d045750565b6301fb6dd160e01b5f5260045260245ffd5b14159050815f611cfb565b611d369193503d805f833e6107a581836112a7565b915f611ced565b805115611da0576001600160401b036060820151168015159081611d95575b50611d8657608001516001600160401b0316611d7757600190565b637b6227e960e11b5f5260045ffd5b631ab7da6b60e01b5f5260045ffd5b90504210155f611d5c565b635c2c7f8960e01b5f5260045ffd5b9060209081835280518284015201519060408082015260018060a01b0382511660608201526001600160401b0360208301511660808201526040820151151560a0820152606082015160c082015261010060a0611e1c608085015160c060e0860152610120850190611202565b9301519101529056fe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a2646970667358221220be3a7200b7d81ec65f3309892ac2ac30ee19663e660a4d10d92a017ddbe7dc1e64736f6c634300081b0033",
    "sourceMap": "918:4652:64:-:0;;;;;;;;;;-1:-1:-1;918:4652:64;;;;;;;;;1183:12:9;;;1054:5;1183:12;918:4652:64;1054:5:9;1183:12;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;918:4652:64;;;;;;;;;2989:103:41;;:::i;:::-;4062:32:56;;;:::i;:::-;4137:37;;;:::i;:::-;4236:13;918:4652:64;4236:13:56;;918:4652:64;4253:18:56;;4236:35;;;4232:99;;4346:24;;;:::i;:::-;4345:25;4341:64;;4528:11;;;;4512:28;4528:11;;4512:28;:::i;:::-;4621:18;;;;;;918:4652:64;;;;;4621:32:56;4617:65;;4698:29;;;:::i;:::-;4697:30;4693:63;;918:4652:64;;;;-1:-1:-1;;;4827:56:56;;918:4652:64;;4827:56:56;;918:4652:64;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;;;;4528:11:56;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;-1:-1:-1;;918:4652:64;;;;;;;:::i;:::-;;;;;;;;4827:56:56;;-1:-1:-1;;;;;918:4652:64;4827:56:56;;;;;;;;;;;918:4652:64;4826:57:56;;4822:115;;918:4652:64;;4981:3:56;-1:-1:-1;;;;;918:4652:64;;;;;;:::i;:::-;;;;5058:47:56;918:4652:64;5058:47:56;;918:4652:64;;;;;;;:::i;:::-;;;;5005:102:56;;918:4652:64;4981:136:56;;;;;918:4652:64;;-1:-1:-1;;;4981:136:56;;918:4652:64;;;4981:136:56;;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;;;;4981:136:56;;;;;;;918:4652:64;-1:-1:-1;;4977:215:56;;-1:-1:-1;;;5156:25:56;;918:4652:64;;;;;6295:21:56;5156:25;4977:215;2837:485:64;4977:215:56;;;;918:4652:64;4977:215:56;2751:41:64;918:4652;;;;;;;;2762:11;;918:4652;;;;2751:41;;;;;;:::i;:::-;918:4652;-1:-1:-1;;;;;918:4652:64;3054:22;;918:4652;;3144:32;;918:4652;;;3204:44;;;;;918:4652;3204:44;;;;918:4652;3204:44;;:::i;:::-;918:4652;;;;;;:::i;:::-;;;2958:339;;;918:4652;2958:339;918:4652;2958:339;;918:4652;;2958:339;;918:4652;;2958:339;;918:4652;2958:339;4621:18:56;2958:339:64;;918:4652;;;;;;;:::i;:::-;2906:28;918:4652;;2861:451;;;918:4652;;;;;;;;;;;;2837:485;;918:4652;2837:485;;;:::i;:::-;;;;;;;;;;;;;;4977:215:56;918:4652:64;;5337:61:56;918:4652:64;;;;;;3340:35;918:4652;3340:35;;918:4652;;3340:35;;;918:4652;3340:35;;:::i;:::-;918:4652;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;5337:61:56;918:4652:64;-1:-1:-1;;;;;;;;;;;2407:1:41;918:4652:64;;;;;;;;:::i;:::-;;;;2837:485;;;;918:4652;2837:485;;918:4652;2837:485;;;;;;918:4652;2837:485;;;:::i;:::-;;;918:4652;;;;;;;2837:485;5337:61:56;2837:485:64;;918:4652;-1:-1:-1;918:4652:64;;2837:485;;;-1:-1:-1;2837:485:64;;;918:4652;;;;;;;;;4981:136:56;;;;;:::i;:::-;918:4652:64;;4981:136:56;;;;918:4652:64;;;;4822:115:56;-1:-1:-1;;;4906:20:56;;918:4652:64;4662:20:56;4906;4827:56;;;918:4652:64;4827:56:56;;918:4652:64;4827:56:56;;;;;;918:4652:64;4827:56:56;;;:::i;:::-;;;918:4652:64;;;;;;;:::i;:::-;4827:56:56;;;;;;-1:-1:-1;4827:56:56;;;918:4652:64;;;;;;;;;4693:63:56;-1:-1:-1;;;4736:20:56;;918:4652:64;4662:20:56;4736;4341:64;-1:-1:-1;;;4379:26:56;;918:4652:64;5745:26:56;4379;918:4652:64;;;;;3045:39:9;918:4652:64;;;:::i;:::-;881:58:9;;:::i;:::-;3045:39;:::i;:::-;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;918:4652:64;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;:::i;:::-;;;;;;:::i;:::-;;5527:34;;918:4652;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;:::i;:::-;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;-1:-1:-1;;918:4652:64;;;;;;:::i;:::-;;;;:::i;:::-;-1:-1:-1;918:4652:64;;-1:-1:-1;;;4191:23:55;;918:4652:64;;;4191:23:55;;;918:4652:64;;;;4191:23:55;918:4652:64;4191:3:55;-1:-1:-1;;;;;918:4652:64;4191:23:55;;;;;;;;;;;918:4652:64;4228:19:55;918:4652:64;4228:19:55;;918:4652:64;4251:18:55;4228:41;4224:100;;918:4652:64;5285:46;5296:16;;;;918:4652;;;;5285:46;;;;;;:::i;:::-;918:4652;;;;;;;:::i;4224:100:55:-;-1:-1:-1;;;4292:21:55;;918:4652:64;;4292:21:55;4191:23;;;;;;;;;;;;;;:::i;:::-;;;;;:::i;:::-;;;;;;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;;;;;1332:50:55;918:4652:64;;;;;;-1:-1:-1;918:4652:64;;-1:-1:-1;;918:4652:64;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;3490:431:55;918:4652:64;;;;;;:::i;:::-;;;;;;:::i;:::-;;;;;;;;:::i;:::-;2176:12:58;2989:103:41;;:::i;:::-;3559:18:55;918:4652:64;-1:-1:-1;;;;;918:4652:64;;;;;;:::i;:::-;1625:10:58;918:4652:64;;;3601:295:55;918:4652:64;3601:295:55;;918:4652:64;;3751:28:55;918:4652:64;;3601:295:55;;918:4652:64;3601:295:55;;918:4652:64;3601:295:55;918:4652:64;3601:295:55;;918:4652:64;3601:295:55;;;;918:4652:64;3601:295:55;;;;918:4652:64;;;;;;;:::i;:::-;;;;3514:397:55;;;918:4652:64;;;;;;;;;;3490:431:55;;918:4652:64;3490:431:55;;;:::i;:::-;;918:4652:64;;3490:3:55;-1:-1:-1;;;;;918:4652:64;3490:431:55;;;;;;;;;;;918:4652:64;;;;;2347:424:58;918:4652:64;;;;;;;;:::i;:::-;;;;2347:424:58;;;918:4652:64;-1:-1:-1;;;;;2461:15:58;918:4652:64;;2347:424:58;;918:4652:64;;2347:424:58;;918:4652:64;2347:424:58;3601:295:55;2347:424:58;;918:4652:64;3601:295:55;2347:424:58;;918:4652:64;1625:10:58;918:4652:64;2347:424:58;;918:4652:64;2666:4:58;918:4652:64;2347:424:58;;918:4652:64;2347:424:58;;;918:4652:64;2347:424:58;918:4652:64;1625:10:58;7355:50:56;1625:10:58;7355:50:56;;;2365:1:41;-1:-1:-1;;;;;;;;;;;2407:1:41;918:4652:64;;;;;;3490:431:55;;;;;;918:4652:64;3490:431:55;;918:4652:64;3490:431:55;;;;;;918:4652:64;3490:431:55;;;:::i;:::-;;;918:4652:64;;;;;;;3490:431:55;;;918:4652:64;3490:431:55;;;;;-1:-1:-1;3490:431:55;;;918:4652:64;;;;;;;;;;;;;;;;-1:-1:-1;;918:4652:64;;;;;;2989:103:41;;;:::i;:::-;5587:28:56;;;:::i;:::-;5682:18;918:4652:64;5682:18:56;;918:4652:64;5704:18:56;5682:40;;;5678:104;;5891:26;;;-1:-1:-1;;;;;918:4652:64;;;5891:31:56;5887:62;;918:4652:64;-1:-1:-1;;;;;918:4652:64;5964:15:56;:44;5960:100;;918:4652:64;;6124:3:56;-1:-1:-1;;;;;918:4652:64;;;;;:::i;:::-;;;;;;6201:43:56;;918:4652:64;;;;;;;:::i;:::-;;;;6148:98:56;;918:4652:64;6124:132:56;;;;;918:4652:64;;-1:-1:-1;;;6124:132:56;;918:4652:64;;;6124:132:56;;918:4652:64;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;918:4652:64;;;;;;-1:-1:-1;;6124:132:56;;;;;;918:4652:64;-1:-1:-1;6120:207:56;;-1:-1:-1;;;6295:21:56;;918:4652:64;;;;-1:-1:-1;6295:21:56;6120:207;918:4652:64;6120:207:56;6478:21;918:4652:64;;;;;6478:21:56;;918:4652:64;;;6457:43:56;918:4652:64;;6457:43:56;;;918:4652:64;-1:-1:-1;;;;;;;;;;;2407:1:41;918:4652:64;;;;6124:132:56;;;;;918:4652:64;6124:132:56;;:::i;:::-;918:4652:64;6124:132:56;;;;5960:100;5931:18;;;918:4652:64;6031:18:56;918:4652:64;;6031:18:56;5678:104;5745:26;;;918:4652:64;5745:26:56;918:4652:64;;5745:26:56;918:4652:64;;1442:1461:9;918:4652:64;;;:::i;:::-;881:58:9;;;;;;:::i;:::-;1442:1461;:::i;918:4652:64:-;;;;;;-1:-1:-1;;918:4652:64;;;;;;;1099:53;918:4652;;;;;;;;;-1:-1:-1;;918:4652:64;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;:::i;:::-;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;:::i;:::-;;;:::i;:::-;;;;;;-1:-1:-1;;918:4652:64;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;:::i;:::-;;:::i;:::-;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;-1:-1:-1;;918:4652:64;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;2937:44:55;;2962:18;918:4652:64;2937:44:55;;918:4652:64;;;2937:44:55;918:4652:64;;;;;;2937:14:55;918:4652:64;2937:44:55;;;;;;918:4652:64;2937:44:55;;;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;2937:44:55:-;;;;918:4652:64;2937:44:55;;;;;;:::i;:::-;;;918:4652:64;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;2937:44:55;;;918:4652:64;;;;;;;;;;;;;;;-1:-1:-1;;918:4652:64;;;;;;;1204:43:55;918:4652:64;;;;;;;;;-1:-1:-1;;918:4652:64;;;;;1055:104:6;;918:4652:64;1072:24:6;1089:6;1072:24;:::i;:::-;1120:6;;1103:24;1120:6;1103:24;:::i;:::-;1151:6;;1134:24;1151:6;1134:24;:::i;:::-;918:4652:64;;;;;;;;;;;;1055:104:6;;;918:4652:64;;;;-1:-1:-1;;;918:4652:64;;;;;;;;;;;;;;;;;-1:-1:-1;;;918:4652:64;;;;;;;;;;;;;;;;;;;;;1055:104:6;;4950:16:64;;1055:104:6;;;;;;:::i;:::-;918:4652:64;;;;;1055:104:6;918:4652:64;;1055:104:6;918:4652:64;;;;:::i;:::-;;;;;;-1:-1:-1;;918:4652:64;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;2176:12:58;4616:16:64;918:4652;;4616:16;918:4652;;:::i;:::-;;;;;;;;;4616:16;;;;:::i;:::-;;4950;;4616;;;;;;:::i;:::-;4650:10;2176:12:58;;:::i;:::-;918:4652:64;;;;;;;;;;;;-1:-1:-1;;918:4652:64;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;:::i;:::-;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;4950:16;;2176:12:58;918:4652:64;;;;;;;;4950:16;;;;:::i;:::-;;;;;;;;;;:::i;:::-;2176:12:58;:::i;918:4652:64:-;;;;;;-1:-1:-1;;918:4652:64;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;573:41:54;;;:81;;;;918:4652:64;;;;;;;573:81:54;-1:-1:-1;;;2366:40:56;;;-1:-1:-1;2366:80:56;;;;573:81:54;;;;;2366:80:56;-1:-1:-1;;;829:40:49;;-1:-1:-1;2366:80:56;;;918:4652:64;;;;-1:-1:-1;;;;;918:4652:64;;;;;;:::o;:::-;;;-1:-1:-1;;;;;918:4652:64;;;;;;:::o;:::-;;;-1:-1:-1;;;;;918:4652:64;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;918:4652:64;;;;;;;;-1:-1:-1;;918:4652:64;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;:::o;:::-;;;;-1:-1:-1;918:4652:64;;;;;-1:-1:-1;918:4652:64;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;:::o;:::-;;;4950:16;;918:4652;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;:::o;:::-;-1:-1:-1;;;;;918:4652:64;;;;;;-1:-1:-1;;918:4652:64;;;;:::o;:::-;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;918:4652:64;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;:::o;:::-;;;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;;:::o;:::-;;-1:-1:-1;;918:4652:64;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;:::i;:::-;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;:::i;:::-;;;:::o;:::-;;;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;:::o;:::-;;-1:-1:-1;;918:4652:64;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;-1:-1:-1;;918:4652:64;;;;;;;:::o;:::-;;;;-1:-1:-1;;;;;918:4652:64;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;-1:-1:-1;;918:4652:64;;;;:::o;:::-;;;;;;;;;;:::o;:::-;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;918:4652:64;;;;;;:::o;:::-;;;-1:-1:-1;;;;;918:4652:64;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;:::i;:::-;;;-1:-1:-1;;;;;918:4652:64;;;;;;:::o;:::-;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;;;:::i;:::-;;;;:::i;:::-;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;:::i;:::-;;;;;;:::o;2209:245::-;2363:34;2209:245;2363:34;918:4652;;;2363:34;;;;;;:::i;:::-;918:4652;;2363:34;2432:14;;;;-1:-1:-1;;;;;918:4652:64;;;;2209:245::o;3133:1460:9:-;;;;3340:23;;;3336:76;;3881:1;;3844:9;3896:19;3884:10;;;;;;918:4652:64;;;;;;;;;;;;;4064:22:9;;;;4060:87;;918:4652:64;;;;;;;;;;;;;;4274:33:9;918:4652:64;;;4274:33:9;:::i;:::-;;4270:84;;1489:1:0;918:4652:64;;3896:19:9;918:4652:64;3869:13:9;;;4270:84;4327:12;;;;;;;3881:1;4327:12;:::o;4060:87::-;4113:19;;;3881:1;4113:19;;3881:1;4113:19;918:4652:64;;;;3881:1:9;918:4652:64;;;;;3881:1:9;918:4652:64;3884:10:9;;;;;;;1489:1:0;3133:1460:9;:::o;3336:76::-;3386:15;;;;;;;;3639:703:64;3848:17;;;918:4652;3869:18;3848:39;3844:57;;3943:45;3954:15;4033:36;3954:15;;;3848:17;918:4652;;;3943:45;;;;;;:::i;:::-;918:4652;3848:17;918:4652;;;4033:36;;;;;;:::i;:::-;4087:31;;;918:4652;4087:31;4122:35;;918:4652;4087:70;:136;;;;3639:703;4087:176;;;3639:703;4087:248;;;4080:255;;3639:703;:::o;4087:248::-;3848:17;4289:13;;;;;;918:4652;;;;;4279:24;4317:17;;;3848;918:4652;;;;4307:28;4279:56;3639:703;:::o;4087:176::-;918:4652;;;;-1:-1:-1;;;;;918:4652:64;;;;;4227:36;;-1:-1:-1;4087:176:64;;:136;4173:21;;-1:-1:-1;;;;;4173:21:64;;;918:4652;;-1:-1:-1;;;;;4173:21:64;4198:25;;918:4652;;4173:50;4087:136;;;3844:57;3889:12;;918:4652;3889:12;:::o;918:4652::-;;;;;;;:::i;:::-;-1:-1:-1;918:4652:64;;;;;;;;;;;;;;;;;:::o;2989:103:41:-;3490:431:55;2989:103:41;;;:::i;:::-;3559:18:55;918:4652:64;-1:-1:-1;;;;;918:4652:64;;;;;;:::i;:::-;;;;;;;;;;;;3601:295:55;;;;918:4652:64;3601:295:55;3751:28;918:4652:64;;3601:295:55;;918:4652:64;3601:295:55;;918:4652:64;;3601:295:55;;;918:4652:64;3601:295:55;;;;918:4652:64;;3601:295:55;;;918:4652:64;;;;;;;:::i;3490:431:55:-;;918:4652:64;;3490:3:55;-1:-1:-1;;;;;918:4652:64;3490:431:55;;;;;;;918:4652:64;3490:431:55;;;2989:103:41;918:4652:64;;2347:424:58;918:4652:64;;;;;;;;:::i;:::-;;;;3601:295:55;2347:424:58;;918:4652:64;-1:-1:-1;;;;;2461:15:58;918:4652:64;;2347:424:58;;918:4652:64;3601:295:55;2347:424:58;;918:4652:64;;3601:295:55;2347:424:58;;918:4652:64;;3601:295:55;2347:424:58;;918:4652:64;2347:424:58;918:4652:64;2347:424:58;;918:4652:64;2666:4:58;918:4652:64;2347:424:58;;918:4652:64;2347:424:58;;;918:4652:64;2347:424:58;918:4652:64;7355:50:56;;918:4652:64;7355:50:56;;2407:1:41;2365;-1:-1:-1;;;;;;;;;;;2407:1:41;2989:103::o;3490:431:55:-;;;;;;3601:295;3490:431;;3601:295;3490:431;;;;;;918:4652:64;3490:431:55;;;:::i;:::-;;;918:4652:64;;;;2347:424:58;918:4652:64;;3490:431:55;;;;;;;;;-1:-1:-1;3490:431:55;;1343:634:44;1465:17;-1:-1:-1;29298:17:51;-1:-1:-1;;;29298:17:51;;;29294:103;;1343:634:44;29414:17:51;29423:8;29994:7;29414:17;;;29410:103;;1343:634:44;29539:8:51;29530:17;;;29526:103;;1343:634:44;29655:7:51;29646:16;;;29642:100;;1343:634:44;29768:7:51;29759:16;;;29755:100;;1343:634:44;29881:7:51;29872:16;;;29868:100;;1343:634:44;29985:16:51;;29981:66;;1343:634:44;29994:7:51;1580:94:44;1485:1;918:4652:64;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;4950:16;;918:4652;;:::i;:::-;;;;;;;1580:94:44;;;1687:247;-1:-1:-1;;918:4652:64;;-1:-1:-1;;;1741:111:44;;;;918:4652:64;1741:111:44;918:4652:64;1902:10:44;;1898:21;;29994:7:51;1687:247:44;;;;1898:21;1914:5;;1343:634;:::o;29981:66:51:-;30031:1;918:4652:64;;;;29981:66:51;;29868:100;29881:7;29952:1;918:4652:64;;;;29868:100:51;;;29755;29768:7;29839:1;918:4652:64;;;;29755:100:51;;;29642;29655:7;29726:1;918:4652:64;;;;29642:100:51;;;29526:103;29539:8;29612:2;918:4652:64;;;;29526:103:51;;;29410;29423:8;29496:2;918:4652:64;;;;29410:103:51;;;29294;-1:-1:-1;29380:2:51;;-1:-1:-1;;;;918:4652:64;;29294:103:51;;6040:128:9;6109:4;-1:-1:-1;;;;;918:4652:64;6087:10:9;:27;6083:79;;6040:128::o;6083:79::-;6137:14;;;;;;;;2506:271:55;2733:20;;918:4652:64;;;;;;;;;;;;;2765:4:55;2733:37;2506:271;:::o;3749:292:41:-;2407:1;-1:-1:-1;;;;;;;;;;;918:4652:64;4560:63:41;3644:93;;2407:1;-1:-1:-1;;;;;;;;;;;2407:1:41;3749:292::o;3644:93::-;3696:30;;;-1:-1:-1;3696:30:41;;-1:-1:-1;3696:30:41;918:4652:64;;;;;;;:::i;:::-;;;;-1:-1:-1;918:4652:64;;-1:-1:-1;918:4652:64;;;;-1:-1:-1;918:4652:64;;;;-1:-1:-1;918:4652:64;;;;-1:-1:-1;918:4652:64;;;;-1:-1:-1;918:4652:64;;;;-1:-1:-1;918:4652:64;;;;-1:-1:-1;918:4652:64;;;;-1:-1:-1;918:4652:64;;;;;;:::o;:::-;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;:::i;:::-;;;;;;:::o;6683:257:56:-;;918:4652:64;;:::i;:::-;-1:-1:-1;918:4652:64;;-1:-1:-1;;;6808:23:56;;;;;918:4652:64;;;;-1:-1:-1;918:4652:64;6808:23:56;918:4652:64;6808:3:56;-1:-1:-1;;;;;918:4652:64;6808:23:56;;;;;;;-1:-1:-1;6808:23:56;;;6683:257;6794:37;;918:4652:64;6845:29:56;;;:55;;;;;6683:257;6841:92;;;;6683:257;:::o;6841:92::-;6909:24;;;-1:-1:-1;6909:24:56;6808:23;918:4652:64;6808:23:56;-1:-1:-1;6909:24:56;6845:55;6878:22;;;-1:-1:-1;6845:55:56;;;;6808:23;;;;;;;-1:-1:-1;6808:23:56;;;;;;:::i;:::-;;;;;1185:321:61;918:4652:64;;1284:28:61;1280:64;;-1:-1:-1;;;;;801:25:61;;;918:4652:64;;801:30:61;;;:78;;;;1185:321;1354:55;;;1057:25;;918:4652:64;-1:-1:-1;;;;;918:4652:64;1419:58:61;;1495:4;1185:321;:::o;1419:58::-;1457:20;;;-1:-1:-1;1457:20:61;;-1:-1:-1;1457:20:61;1354:55;1392:17;;;-1:-1:-1;1392:17:61;;-1:-1:-1;1392:17:61;801:78;864:15;;;-1:-1:-1;835:44:61;801:78;;;1280:64;1321:23;;;-1:-1:-1;1321:23:61;;-1:-1:-1;1321:23:61;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;918:4652:64;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::o",
    "linkReferences": {},
    "immutableReferences": {
      "2532": [
        {
          "start": 3972,
          "length": 32
        }
      ],
      "2534": [
        {
          "start": 4015,
          "length": 32
        }
      ],
      "2536": [
        {
          "start": 4058,
          "length": 32
        }
      ],
      "3008": [
        {
          "start": 6874,
          "length": 32
        }
      ],
      "50371": [
        {
          "start": 3579,
          "length": 32
        }
      ],
      "50375": [
        {
          "start": 680,
          "length": 32
        },
        {
          "start": 1782,
          "length": 32
        },
        {
          "start": 2305,
          "length": 32
        },
        {
          "start": 2701,
          "length": 32
        },
        {
          "start": 6254,
          "length": 32
        },
        {
          "start": 7349,
          "length": 32
        }
      ],
      "50378": [
        {
          "start": 328,
          "length": 32
        },
        {
          "start": 1846,
          "length": 32
        },
        {
          "start": 2129,
          "length": 32
        },
        {
          "start": 2622,
          "length": 32
        },
        {
          "start": 3529,
          "length": 32
        },
        {
          "start": 3906,
          "length": 32
        },
        {
          "start": 5843,
          "length": 32
        },
        {
          "start": 6102,
          "length": 32
        }
      ],
      "50381": [
        {
          "start": 2009,
          "length": 32
        },
        {
          "start": 2196,
          "length": 32
        },
        {
          "start": 6178,
          "length": 32
        }
      ],
      "51962": [
        {
          "start": 989,
          "length": 32
        },
        {
          "start": 3057,
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
  "rawMetadata": "{\"compiler\":{\"version\":\"0.8.27+commit.40a35a09\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[{\"internalType\":\"contract IEAS\",\"name\":\"_eas\",\"type\":\"address\"},{\"internalType\":\"contract ISchemaRegistry\",\"name\":\"_schemaRegistry\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"AccessDenied\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"attestationId\",\"type\":\"bytes32\"}],\"name\":\"AttestationNotFound\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"AttestationRevoked\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"DeadlineExpired\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InsufficientValue\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidAttestationUid\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidEAS\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidEscrowAttestation\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidFulfillment\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidLength\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"NotFromThisAttester\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"NotPayable\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"ReentrancyGuardReentrantCall\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"attestationId\",\"type\":\"bytes32\"}],\"name\":\"RevocationFailed\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"SchemaRegistrationFailed\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"UnauthorizedCall\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"fulfillmentUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"fulfiller\",\"type\":\"address\"}],\"name\":\"EscrowCollected\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"escrower\",\"type\":\"address\"}],\"name\":\"EscrowMade\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"escrower\",\"type\":\"address\"}],\"name\":\"EscrowReclaimed\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"ATTESTATION_SCHEMA\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"ATTESTATION_SCHEMA_REVOCABLE\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"REFERENCE_ATTESTATION_SCHEMA\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"attestation\",\"type\":\"tuple\"}],\"name\":\"attest\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"obligation\",\"type\":\"tuple\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"check\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"_escrow\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"_fulfillment\",\"type\":\"bytes32\"}],\"name\":\"collect\",\"outputs\":[{\"internalType\":\"bytes\",\"name\":\"\",\"type\":\"bytes\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"decodeCondition\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"decodeObligationData\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"referencedAttestationUid\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"}],\"internalType\":\"struct AttestationReferenceEscrowObligation.ObligationData\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"referencedAttestationUid\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"}],\"internalType\":\"struct AttestationReferenceEscrowObligation.ObligationData\",\"name\":\"data\",\"type\":\"tuple\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"}],\"name\":\"doObligation\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"referencedAttestationUid\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"}],\"internalType\":\"struct AttestationReferenceEscrowObligation.ObligationData\",\"name\":\"data\",\"type\":\"tuple\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"}],\"name\":\"doObligationFor\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"}],\"name\":\"doObligationRaw\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid_\",\"type\":\"bytes32\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"getObligationData\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"referencedAttestationUid\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"}],\"internalType\":\"struct AttestationReferenceEscrowObligation.ObligationData\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getSchema\",\"outputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"contract ISchemaResolver\",\"name\":\"resolver\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"string\",\"name\":\"schema\",\"type\":\"string\"}],\"internalType\":\"struct SchemaRecord\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"isPayable\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation[]\",\"name\":\"attestations\",\"type\":\"tuple[]\"},{\"internalType\":\"uint256[]\",\"name\":\"values\",\"type\":\"uint256[]\"}],\"name\":\"multiAttest\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation[]\",\"name\":\"attestations\",\"type\":\"tuple[]\"},{\"internalType\":\"uint256[]\",\"name\":\"values\",\"type\":\"uint256[]\"}],\"name\":\"multiRevoke\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"reclaim\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"attestation\",\"type\":\"tuple\"}],\"name\":\"revoke\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"version\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"stateMutability\":\"payable\",\"type\":\"receive\"}],\"devdoc\":{\"details\":\"Uses the default escrow checks: fulfillment must reference the escrow UID and pass intrinsic attestation validation.\",\"errors\":{\"ReentrancyGuardReentrantCall()\":[{\"details\":\"Unauthorized reentrant call.\"}]},\"kind\":\"dev\",\"methods\":{\"attest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"params\":{\"attestation\":\"The new attestation.\"},\"returns\":{\"_0\":\"Whether the attestation is valid.\"}},\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"params\":{\"demand\":\"Arbiter-specific demand data encoded by the escrow creator.\",\"escrowUid\":\"The UID of the escrow attestation being fulfilled.\",\"fulfillment\":\"The EAS attestation being used as fulfillment.\"}},\"collect(bytes32,bytes32)\":{\"params\":{\"escrowUid\":\"UID of the escrow attestation.\",\"fulfillmentUid\":\"UID of the fulfillment attestation.\"},\"returns\":{\"_0\":\"Escrow-specific return data from the underlying release logic.\"}},\"decodeCondition(bytes)\":{\"params\":{\"escrowData\":\"ABI-encoded escrow obligation data.\"},\"returns\":{\"arbiter\":\"Address of the arbiter that validates fulfillment.\",\"demand\":\"Arbiter-specific demand bytes.\"}},\"doObligationRaw(bytes,uint64,bytes32)\":{\"params\":{\"data\":\"ABI-encoded obligation data.\",\"expirationTime\":\"EAS expiration timestamp, or zero for no expiration.\",\"refUID\":\"Reference UID stored on the EAS attestation.\"}},\"isPayable()\":{\"returns\":{\"_0\":\"Whether the resolver supports ETH transfers.\"}},\"multiAttest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"params\":{\"attestations\":\"The new attestations.\",\"values\":\"Explicit ETH amounts which were sent with each attestation.\"},\"returns\":{\"_0\":\"Whether all the attestations are valid.\"}},\"multiRevoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"params\":{\"attestations\":\"The existing attestations to be revoked.\",\"values\":\"Explicit ETH amounts which were sent with each revocation.\"},\"returns\":{\"_0\":\"Whether the attestations can be revoked.\"}},\"reclaim(bytes32)\":{\"params\":{\"escrowUid\":\"UID of the escrow attestation.\"},\"returns\":{\"_0\":\"True if the reclaim succeeds.\"}},\"revoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"params\":{\"attestation\":\"The existing attestation to be revoked.\"},\"returns\":{\"_0\":\"Whether the attestation can be revoked.\"}},\"supportsInterface(bytes4)\":{\"details\":\"Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section] to learn more about how these ids are created. This function call must use less than 30 000 gas.\"},\"version()\":{\"returns\":{\"_0\":\"Semver contract version as a string.\"}}},\"title\":\"AttestationReferenceEscrowObligation\",\"version\":1},\"userdoc\":{\"errors\":{\"AttestationNotFound(bytes32)\":[{\"notice\":\"Raised when EAS has no attestation for the requested UID.\"}],\"AttestationRevoked()\":[{\"notice\":\"Raised when an attestation has been revoked.\"}],\"DeadlineExpired()\":[{\"notice\":\"Raised when an attestation has expired.\"}],\"InvalidAttestationUid()\":[{\"notice\":\"Raised when an attestation UID is zero.\"}],\"InvalidEscrowAttestation()\":[{\"notice\":\"Raised when the escrow attestation is missing, invalid, expired, revoked, or has the wrong schema.\"}],\"InvalidFulfillment()\":[{\"notice\":\"Raised when the fulfillment does not satisfy the escrow's default checks or arbiter.\"}],\"NotFromThisAttester()\":[{\"notice\":\"Raised when an attestation does not belong to this contract's schema.\"}],\"RevocationFailed(bytes32)\":[{\"notice\":\"Raised when revoking the escrow attestation fails during collect or reclaim.\"}],\"SchemaRegistrationFailed(bytes32)\":[{\"notice\":\"Raised when a schema cannot be registered or found at its deterministic UID.\"}],\"UnauthorizedCall()\":[{\"notice\":\"Raised when a caller attempts an action that is not currently permitted.\"}]},\"events\":{\"EscrowCollected(bytes32,bytes32,address)\":{\"notice\":\"Emitted when an escrow is successfully collected by a fulfillment recipient.\"},\"EscrowMade(bytes32,address)\":{\"notice\":\"Emitted when escrow assets are locked and the escrow attestation is created.\"},\"EscrowReclaimed(bytes32,address)\":{\"notice\":\"Emitted when an expired escrow is reclaimed by its original escrower.\"}},\"kind\":\"user\",\"methods\":{\"ATTESTATION_SCHEMA()\":{\"notice\":\"UID of the schema used by attestations created by this contract.\"},\"ATTESTATION_SCHEMA_REVOCABLE()\":{\"notice\":\"Whether attestations under `ATTESTATION_SCHEMA` are revocable.\"},\"attest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"notice\":\"Processes an attestation and verifies whether it's valid.\"},\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"notice\":\"Returns true when `fulfillment` satisfies `demand` for `escrowUid`.\"},\"collect(bytes32,bytes32)\":{\"notice\":\"Collects an escrow using a fulfillment attestation.\"},\"decodeCondition(bytes)\":{\"notice\":\"Decodes an escrow attestation's condition into arbiter and demand data.\"},\"decodeObligationData(bytes)\":{\"notice\":\"Decodes ABI-encoded attestation-reference escrow data.\"},\"doObligation((address,bytes,bytes32,uint64),uint64)\":{\"notice\":\"Creates an escrow attestation that certifies an existing attestation reference.\"},\"doObligationFor((address,bytes,bytes32,uint64),uint64,address)\":{\"notice\":\"Creates an attestation-reference escrow for an explicit recipient.\"},\"doObligationRaw(bytes,uint64,bytes32)\":{\"notice\":\"Creates an obligation attestation from pre-encoded data.\"},\"getObligationData(bytes32)\":{\"notice\":\"Loads and decodes attestation-reference escrow data from this contract's attestation.\"},\"getSchema()\":{\"notice\":\"Returns the schema record registered for this attester.\"},\"isPayable()\":{\"notice\":\"Checks if the resolver can be sent ETH.\"},\"multiAttest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"notice\":\"Processes multiple attestations and verifies whether they are valid.\"},\"multiRevoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"notice\":\"Processes revocation of multiple attestation and verifies they can be revoked.\"},\"reclaim(bytes32)\":{\"notice\":\"Reclaims an expired escrow and returns locked assets to the escrower.\"},\"revoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"notice\":\"Processes an attestation revocation and verifies if it can be revoked.\"},\"version()\":{\"notice\":\"Returns the full semver contract version.\"}},\"notice\":\"Escrows a reference to an existing attestation behind an arbiter-defined fulfillment condition.\",\"version\":1}},\"settings\":{\"compilationTarget\":{\"src/obligations/escrow/default/AttestationReferenceEscrowObligation.sol\":\"AttestationReferenceEscrowObligation\"},\"evmVersion\":\"prague\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[\":@eas/=lib/eas-contracts/contracts/\",\":@erc8004/=lib/erc-8004-contracts/contracts/\",\":@openzeppelin/=lib/openzeppelin-contracts/\",\":@src/=src/\",\":@test/=test/\",\":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/\",\":eas-contracts/=lib/eas-contracts/contracts/\",\":erc-8004-contracts/=lib/erc-8004-contracts/contracts/\",\":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/\",\":eth-gas-reporter/=lib/eas-contracts/node_modules/eth-gas-reporter/\",\":forge-std/=lib/forge-std/src/\",\":halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/\",\":hardhat-deploy/=lib/eas-contracts/node_modules/hardhat-deploy/\",\":hardhat/=lib/eas-contracts/node_modules/hardhat/\",\":openzeppelin-contracts/=lib/openzeppelin-contracts/\"],\"viaIR\":true},\"sources\":{\"lib/eas-contracts/contracts/Common.sol\":{\"keccak256\":\"0x957bd2e6d0d6d637f86208b135c29fbaf4412cb08e5e7a61ede16b80561bf685\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://da1dc9aedbb1d4d39c46c2235918d3adfbc5741dd34a46010cf425d134e7936d\",\"dweb:/ipfs/QmWUk6bXnLaghS2riF3GTFEeURCzgYFMA5woa6AsgPwEgc\"]},\"lib/eas-contracts/contracts/IEAS.sol\":{\"keccak256\":\"0xdad0674defce04905dc7935f2756d6c477a6e876c0b1b7094b112a862f164c12\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://49e448c26c08952df034692d2ab3519dd40a1ebbeae4ce68b294567441933880\",\"dweb:/ipfs/QmWHcudjskUSCjgqsNWE65LVfWvcYB2vBn8RB1SmzvRLNR\"]},\"lib/eas-contracts/contracts/ISchemaRegistry.sol\":{\"keccak256\":\"0xea97dcd36a0c422169cbaac06698249e199049b627c16bff93fb8ab829058754\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://d453a929ef64a69cd31195ec2ee5ed1193bfa29f633e13c960e92154c37ad158\",\"dweb:/ipfs/QmXs1Z3njbHs2EMgHonrZDfcwdog4kozHY5tYNrhZK5yqz\"]},\"lib/eas-contracts/contracts/ISemver.sol\":{\"keccak256\":\"0x04a67939b4e1a8d0a51101b8f69f8882930bbdc66319f38023828625b5d1ff18\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://3dd543fa0e33cef1ea757627f9c2a10a66ee1ce17aa9087f437c5b53a903c7f0\",\"dweb:/ipfs/QmXsy6UsGBzF9zPCCjmiwPpCcX3tHqU13TmR67B69tKnR6\"]},\"lib/eas-contracts/contracts/Semver.sol\":{\"keccak256\":\"0x4f23442d048661b6aaa188ddc16b69cb310c2e44066b3852026afcb4201d61a9\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://30c36e580cd93d9acb13e1a11e833946a8bd0bd2a8d1b2be049f0d96e0989808\",\"dweb:/ipfs/QmXmQTxKjSrUWutafQsqkbGufXqtzxuDAiMMJjXCHXiEqh\"]},\"lib/eas-contracts/contracts/resolver/ISchemaResolver.sol\":{\"keccak256\":\"0xb7d1961ed928c620cddf35c2bf46845b10828bc5d73145214630202ed355b6bb\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://cf1cabacfb15c9bace8280b540b52e5aa440e1b4eba675f9782c34ce0f03902f\",\"dweb:/ipfs/QmakYcK4xbrijzvoaBCmBJK6HeaBqbXxWKtDQ1z62aXwCR\"]},\"lib/eas-contracts/contracts/resolver/SchemaResolver.sol\":{\"keccak256\":\"0x385d8c0edbdc96af15cf8f22333183162561cbf7d3fb0df95287741e59899983\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://ff7e8a17f69dcb7ddc937446e868d34baea61bbe249a8f5d8be486ab93001828\",\"dweb:/ipfs/QmUz9i7ViNK9kUWHeJRtE44HmpbxBDGJBjyec2aPD6Nn3Q\"]},\"lib/openzeppelin-contracts/contracts/utils/Bytes.sol\":{\"keccak256\":\"0x8140d608316521b1fd71167c3b708ebb8659da070723fc8807609553b296ee33\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://a7bf7db66869ba1e945a0390b85da2f6afc7e42a4735ca918d0d56ac90c50147\",\"dweb:/ipfs/QmRmNyhpBpgzSdQqLtrQCYE7H7eLnVVxh2Yy4YMrySR8AR\"]},\"lib/openzeppelin-contracts/contracts/utils/Panic.sol\":{\"keccak256\":\"0xf7fe324703a64fc51702311dc51562d5cb1497734f074e4f483bfb6717572d7a\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://c6a5ff4f9fd8649b7ee20800b7fa387d3465bd77cf20c2d1068cd5c98e1ed57a\",\"dweb:/ipfs/QmVSaVJf9FXFhdYEYeCEfjMVHrxDh5qL4CGkxdMWpQCrqG\"]},\"lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol\":{\"keccak256\":\"0xa516cbf1c7d15d3517c2d668601ce016c54395bf5171918a14e2686977465f53\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://1e1d079e8edfb58efd23a311e315a4807b01b5d1cf153f8fa2d0608b9dec3e99\",\"dweb:/ipfs/QmTBExeX2SDTkn5xbk5ssbYSx7VqRp9H4Ux1CY4uQM4b9N\"]},\"lib/openzeppelin-contracts/contracts/utils/StorageSlot.sol\":{\"keccak256\":\"0xcf74f855663ce2ae00ed8352666b7935f6cddea2932fdf2c3ecd30a9b1cd0e97\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://9f660b1f351b757dfe01438e59888f31f33ded3afcf5cb5b0d9bf9aa6f320a8b\",\"dweb:/ipfs/QmarDJ5hZEgBtCmmrVzEZWjub9769eD686jmzb2XpSU1cM\"]},\"lib/openzeppelin-contracts/contracts/utils/Strings.sol\":{\"keccak256\":\"0x36d1750bf1aa5fee9c52adb2f7857ab652daca722fc05dff533b364f67a1139a\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://2e5e7052539b7849d02f3ce25acc1dce29373c11cfae9f0bc918c54b780c549a\",\"dweb:/ipfs/QmRGE32xNkMTo6i4pHHMxjpiu77yPwnTA25SFngw2NXJys\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/ERC165.sol\":{\"keccak256\":\"0x2d9dc2fe26180f74c11c13663647d38e259e45f95eb88f57b61d2160b0109d3e\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://81233d1f98060113d9922180bb0f14f8335856fe9f339134b09335e9f678c377\",\"dweb:/ipfs/QmWh6R35SarhAn4z2wH8SU456jJSYL2FgucfTFgbHJJN4E\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol\":{\"keccak256\":\"0x8891738ffe910f0cf2da09566928589bf5d63f4524dd734fd9cedbac3274dd5c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://971f954442df5c2ef5b5ebf1eb245d7105d9fbacc7386ee5c796df1d45b21617\",\"dweb:/ipfs/QmadRjHbkicwqwwh61raUEapaVEtaLMcYbQZWs9gUkgj3u\"]},\"lib/openzeppelin-contracts/contracts/utils/math/Math.sol\":{\"keccak256\":\"0x09e3f1c72d4c5cbe8e2644ab7313f8f7177533ae2f4c24cdcbbeaf520a73734c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://93208401215d539fa2d81626b207c1f611def7883d0e447b3b5969ebaa7b3c2c\",\"dweb:/ipfs/QmXPxDnQPx8LAweX5ZJqEcwkvs59kP4c64VVDG1Jjq1mef\"]},\"lib/openzeppelin-contracts/contracts/utils/math/SafeCast.sol\":{\"keccak256\":\"0x195533c86d0ef72bcc06456a4f66a9b941f38eb403739b00f21fd7c1abd1ae54\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://b1d578337048cad08c1c03041cca5978eff5428aa130c781b271ad9e5566e1f8\",\"dweb:/ipfs/QmPFKL2r9CBsMwmUqqdcFPfHZB2qcs9g1HDrPxzWSxomvy\"]},\"lib/openzeppelin-contracts/contracts/utils/math/SignedMath.sol\":{\"keccak256\":\"0xb1970fac7b64e6c09611e6691791e848d5e3fe410fa5899e7df2e0afd77a99e3\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://db5fbb3dddd8b7047465b62575d96231ba8a2774d37fb4737fbf23340fabbb03\",\"dweb:/ipfs/QmVUSvooZKEdEdap619tcJjTLcAuH6QBdZqAzWwnAXZAWJ\"]},\"src/BaseArbiter.sol\":{\"keccak256\":\"0x27fa97834bcd6e592f3b534e64859b208c688363d33fb9b62436d009ffff3ed1\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://b61ac6195ae644325adf77fdb301651cddfca4b63d9db5123ee075869f3784aa\",\"dweb:/ipfs/QmYRu5hER8gaMjqyY5bDV9EAwVN12CbS3Z2bW8dLp7sPSE\"]},\"src/BaseAttester.sol\":{\"keccak256\":\"0x12339a862aa0571244f4a0c2dae1a7bcc1734717474dbf0d69b63886987d1f99\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://d40e983dece581ecb49a1a01bc87c66e86f8c954cc442a02151ec427d680682d\",\"dweb:/ipfs/QmVA7Tqk1KaYhrZpxWx3cdsjUoxsRaoBjJX8k6nCSEk8En\"]},\"src/BaseEscrowObligation.sol\":{\"keccak256\":\"0x49717032f4edbbfd52bf160a99b7b39f726e8a2f968ed4b261ee31b1622a22ac\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://1aba86a5094f4be28de1c5782087aff65c6d0bbc8ab124501e0677b5cab843f2\",\"dweb:/ipfs/QmXfo8c532ALhAUC9iae2mrSWLmDTSABunMJP2iU7PpKek\"]},\"src/BaseObligation.sol\":{\"keccak256\":\"0xf00b1317dd9203ea59e8da6c0bb23267b50ecb2751cd11b26a6330d1e596eb7b\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://5b9762a2ba2251c6ae9d23aa3ba49a8124f3348ac13c9271b8b9ada438dff475\",\"dweb:/ipfs/QmeBZUvNjNyC7W1hb1PKQq8CawC5ULWX9KXgJjH37wvPGH\"]},\"src/IArbiter.sol\":{\"keccak256\":\"0x00f3f5d8460c738eff4a776cf309efe38342fcc951abfe97d1c2e285acb1e330\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://7201a176f3d5c3d01ca13bbcd9ef5587effe8fabf20e0b8f81f2d6ee362269b9\",\"dweb:/ipfs/QmXn9aSvoGPQuNTxe3mM47RNQ1bfYCEczQCYsDDM9ohc8M\"]},\"src/IEscrow.sol\":{\"keccak256\":\"0x8803bb72e285722a5e90f08046cfee7d37acc6cf83c13a5074cfb0740e316a45\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://965024e29be08418fd9acef578b5253af5fb0d39227c291298d83dae5d7ffd01\",\"dweb:/ipfs/QmPh2h21EC6L4aWauvk5cFzc4x3Xf4f1brxyrgxeKUuWEs\"]},\"src/libraries/ArbiterUtils.sol\":{\"keccak256\":\"0xb87e2bfb9c7292daf6426fbedc09c8683b92841d1b92e7359c0ff94d42be632f\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://3acf498c3c59891d76db768ea57d8f7f6b4010dcbaf44a5f93d95d72f0b12441\",\"dweb:/ipfs/QmVbkioM8dWwYxqatm1dyo9PRFNZ6c7Kbang7pozbnyS7j\"]},\"src/libraries/SchemaRegistryUtils.sol\":{\"keccak256\":\"0x81e4728ad79515866f28175a00a512afd2f7010bd109ae221defb29a87430cd0\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://4edac7284c764f1236b5875ed00f357f0e30aecc5006c88afe220bef60b541d3\",\"dweb:/ipfs/QmXj8oLa1RXMgHCXtgdbriVqQFgX6rjnPNbmQpwpK2YXsK\"]},\"src/obligations/escrow/default/AttestationReferenceEscrowObligation.sol\":{\"keccak256\":\"0xa0bb18ca0bc7b3e02958efe4d77e25bb2e732bf13d2590402652b2a8ad5493b1\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://2c171358980a8b8305e0bba99a15247c80431bc27921aa4a8acf13b3e7886017\",\"dweb:/ipfs/Qmf2T72h4ajEAcpcW1WVmk3nHVZ85dnxA8WKw8XtsYVCjY\"]}},\"version\":1}",
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
              "internalType": "struct AttestationReferenceEscrowObligation.ObligationData",
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
              "internalType": "struct AttestationReferenceEscrowObligation.ObligationData",
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
              "internalType": "struct AttestationReferenceEscrowObligation.ObligationData",
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
              "internalType": "struct AttestationReferenceEscrowObligation.ObligationData",
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
        "src/obligations/escrow/default/AttestationReferenceEscrowObligation.sol": "AttestationReferenceEscrowObligation"
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
      "src/BaseEscrowObligation.sol": {
        "keccak256": "0x49717032f4edbbfd52bf160a99b7b39f726e8a2f968ed4b261ee31b1622a22ac",
        "urls": [
          "bzz-raw://1aba86a5094f4be28de1c5782087aff65c6d0bbc8ab124501e0677b5cab843f2",
          "dweb:/ipfs/QmXfo8c532ALhAUC9iae2mrSWLmDTSABunMJP2iU7PpKek"
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
      "src/obligations/escrow/default/AttestationReferenceEscrowObligation.sol": {
        "keccak256": "0xa0bb18ca0bc7b3e02958efe4d77e25bb2e732bf13d2590402652b2a8ad5493b1",
        "urls": [
          "bzz-raw://2c171358980a8b8305e0bba99a15247c80431bc27921aa4a8acf13b3e7886017",
          "dweb:/ipfs/Qmf2T72h4ajEAcpcW1WVmk3nHVZ85dnxA8WKw8XtsYVCjY"
        ],
        "license": "UNLICENSED"
      }
    },
    "version": 1
  },
  "id": 64
} as const;
