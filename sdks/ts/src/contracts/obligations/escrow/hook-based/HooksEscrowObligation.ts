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
      "name": "MAX_HOOKS",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
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
          "internalType": "struct HooksEscrowObligation.ObligationData",
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
              "name": "hooks",
              "type": "address[]",
              "internalType": "address[]"
            },
            {
              "name": "hookDatas",
              "type": "bytes[]",
              "internalType": "bytes[]"
            },
            {
              "name": "values",
              "type": "uint256[]",
              "internalType": "uint256[]"
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
          "internalType": "struct HooksEscrowObligation.ObligationData",
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
              "name": "hooks",
              "type": "address[]",
              "internalType": "address[]"
            },
            {
              "name": "hookDatas",
              "type": "bytes[]",
              "internalType": "bytes[]"
            },
            {
              "name": "values",
              "type": "uint256[]",
              "internalType": "uint256[]"
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
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "doObligationFor",
      "inputs": [
        {
          "name": "data",
          "type": "tuple",
          "internalType": "struct HooksEscrowObligation.ObligationData",
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
              "name": "hooks",
              "type": "address[]",
              "internalType": "address[]"
            },
            {
              "name": "hookDatas",
              "type": "bytes[]",
              "internalType": "bytes[]"
            },
            {
              "name": "values",
              "type": "uint256[]",
              "internalType": "uint256[]"
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
      "stateMutability": "payable"
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
          "internalType": "struct HooksEscrowObligation.ObligationData",
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
              "name": "hooks",
              "type": "address[]",
              "internalType": "address[]"
            },
            {
              "name": "hookDatas",
              "type": "bytes[]",
              "internalType": "bytes[]"
            },
            {
              "name": "values",
              "type": "uint256[]",
              "internalType": "uint256[]"
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
      "name": "ArrayLengthMismatch",
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
      "name": "TooManyHooks",
      "inputs": [
        {
          "name": "provided",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "max",
          "type": "uint256",
          "internalType": "uint256"
        }
      ]
    },
    {
      "type": "error",
      "name": "UnauthorizedCall",
      "inputs": []
    },
    {
      "type": "error",
      "name": "ValueMismatch",
      "inputs": [
        {
          "name": "expected",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "received",
          "type": "uint256",
          "internalType": "uint256"
        }
      ]
    }
  ],
  "bytecode": {
    "object": "0x61018080604052346101ff57604081612f4e80380380916100208285610203565b8339810103126101ff578051906001600160a01b038216908183036101ff57602001516001600160a01b03811691908281036101ff5760405191610065608084610203565b605383527f6164647265737320617262697465722c2062797465732064656d616e642c206160208401527f6464726573735b5d20686f6f6b732c2062797465735b5d20686f6f6b4461746160408401527f732c2075696e743235365b5d2076616c7565730000000000000000000000000060608401526001608052600360a0525f60c052156101f0578361010b9460e0526101205261010052600161016052309161031e565b6101405260017f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f0055604051612a5490816104fa8239608051816113af015260a051816113da015260c05181611405015260e0518161269f015261010051816112260152610120518181816102190152818161079101528181610b3501528181610dad01528181612350015261288e015261014051818181610147015281816107d101528181610a1c01528181610d5e015281816111f40152818161136d01528181611ea1015261222f01526101605181818161087401528181610a5e01526122790152f35b6341bc07ff60e11b5f5260045ffd5b5f80fd5b601f909101601f19168101906001600160401b0382119082101761022657604052565b634e487b7160e01b5f52604160045260245ffd5b6020818303126101ff578051906001600160401b0382116101ff5701906080828203126101ff5760405191608083016001600160401b03811184821017610226576040528051835260208101516001600160a01b03811681036101ff576020840152604081015180151581036101ff5760408401526060810151906001600160401b0382116101ff570181601f820112156101ff578051906001600160401b03821161022657604051926102f8601f8401601f191660200185610203565b828452602083830101116101ff57815f9260208093018386015e83010152606082015290565b929160405190602082018351926103686015602083818901978089885e810160018060601b03198860601b1683820152600160f81b60348201520301600a19810184520182610203565b5190206040516351753e3760e11b81526004810182905290956001600160a01b031693905f81602481885afa80156104795787915f916104df575b5051146104d9579060846020926040519485938492630c1af44f60e31b8452606060048501525180928160648601528585015e5f84838501015260018060a01b0316602483015260016044830152601f801991011681010301815f865af15f91816104a5575b5061048457505f602491604051928380926351753e3760e11b82528760048301525afa80156104795783915f91610457575b5051146104555750639e6113d560e01b5f5260045260245ffd5b565b61047391503d805f833e61046b8183610203565b81019061023a565b5f61043b565b6040513d5f823e3d90fd5b91928091508203610493575090565b639e6113d560e01b5f5260045260245ffd5b9091506020813d6020116104d1575b816104c160209383610203565b810103126101ff5751905f610409565b3d91506104b4565b50505050565b6104f391503d805f833e61046b8183610203565b5f6103a356fe6080806040526004361015610029575b50361561001a575f80fd5b631574f9f360e01b5f5260045ffd5b5f905f3560e01c90816301ffc9a7146115255750806306920f96146114ad5780634fa4467c1461149257806354fd4d50146113905780635bf2f20d146113565780636b122fe0146111b5578063760bd1181461115757806388e5b2d9146110205780638da3721a1461103f57806391db0b7e1461102057806393abe3dc14610fb257806396afb36514610d31578063b3b902d414610899578063b587a5eb1461085c578063c6ec507014610750578063c93844be14610511578063ce46e046146104f5578063e49617e1146104d0578063e60c3505146104d05763ea6ec49c0361000f57346104cd5760403660031901126104cd5760043560243561012c6126f7565b61013582612868565b61013e82612868565b906020810151917f00000000000000000000000000000000000000000000000000000000000000008093036104be576101768261292a565b156104be5761012082019261018b8451611d8b565b9060a08401518551036104af576101a18461292a565b156104af576101e86020918651936040518095819482936346d1b90d60e11b8452606060048501526101d6606485018c612055565b848103600319016024860152906115e1565b604483019190915203916001600160a01b03165afa9081156104a4578891610466575b5015610457576040518791907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169061024b81611650565b8881528360208201526040519261026184611650565b83526020830152803b156103c757604051634692626760e01b8152825160048201526020928301518051602483015290920151604483015290919081908390606490829084905af1918261043e575b50506102ca5763614cf93960e01b86526004859052602486fd5b9260c086959401906102f060018060a01b03835116945160208082518301019101611ba1565b946102fa8661299c565b604086019560600192875b875180518210156103cb5789906001600160a01b0390610326908490612916565b5116610333838851612916565b5190803b156103c75788839161036d838d9561038460405197889687958694630fa37a1f60e01b86526080600487015260848601906115e1565b916024850152600319848303016044850152612055565b8c606483015203925af180156103bc576103a3575b5050600101610305565b816103ad916116a1565b6103b857888a610399565b8880fd5b6040513d84823e3d90fd5b8280fd5b7ff96e77bc177ae8e2ff25185e7c6d85f8ba97c8bdd9d46933aac70a7a33edf6c08a61043a858789604051926104026020856116a1565b858452516040519687966001600160a01b03909216939180a460015f5160206129ff5f395f51905f52556020835260208301906115e1565b0390f35b81610448916116a1565b61045357865f6102b0565b8680fd5b630ebe58ef60e11b8752600487fd5b90506020813d60201161049c575b81610481602093836116a1565b810103126104985761049290611b19565b5f61020b565b8780fd5b3d9150610474565b6040513d8a823e3d90fd5b630ebe58ef60e11b8952600489fd5b63629cd40b60e11b8652600486fd5b80fd5b60206104eb6104de36611918565b6104e661269d565b6126de565b6040519015158152f35b50346104cd57806003193601126104cd57602090604051908152f35b50346104cd5760203660031901126104cd576004356001600160401b038111610703576105429036906004016117b1565b61054d92919261202b565b50820191602081840312610703578035906001600160401b0382116103c757019060a0828403126104cd57604051916105858361166b565b61058e816115cd565b835260208101356001600160401b0381116103c757846105af918301611713565b602084015260408101356001600160401b0381116103c757810184601f820112156103c7578035906105e082611b8a565b916105ee60405193846116a1565b80835260208084019160051b8301019187831161073457602001905b82821061073857505050604084015260608101356001600160401b0381116103c757810184601f820112156103c75780359061064582611b8a565b9161065360405193846116a1565b80835260208084019160051b830101918783116107345760208101915b838310610707575050505060608401526080810135906001600160401b0382116103c757019280601f85011215610703578335936106ad85611b8a565b926106bb60405194856116a1565b85845260208085019660051b8301019283116104cd5750602001935b8185106106f357608084018390526040518061043a8682611869565b84358152602094850194016106d7565b5080fd5b82356001600160401b038111610498576020916107298b848094870101611713565b815201920191610670565b8580fd5b60208091610745846115cd565b81520191019061060a565b50346104cd5760203660031901126104cd5761076a61202b565b5061077361272f565b506040516328c44a9960e21b815260048035908201529080826024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa91821561084f57819261082b575b5060208201517f00000000000000000000000000000000000000000000000000000000000000000361081c5761043a61081061012084015160208082518301019101611ba1565b60405191829182611869565b635527981560e11b8152600490fd5b6108489192503d8084833e61084081836116a1565b81019061278d565b905f6107c9565b50604051903d90823e3d90fd5b50346104cd57806003193601126104cd5760206040517f000000000000000000000000000000000000000000000000000000000000000015158152f35b5060603660031901126104cd576004356001600160401b038111610703576108c59036906004016117b1565b6108dc6108d06115a3565b926044359236916116dd565b906108e56126f7565b8151916108fa60208083019483010184611ba1565b6109038161299c565b85869460808301915b8251805188101561094a578761092191612916565b5181018091116109365760019096019561090c565b634e487b7160e01b89526011600452602489fd5b509550868895873403610d19578680985094965084956060604089019801965b88518051821015610a16576001600160a01b0390610989908390612916565b5116610996828851612916565b51906109a3838b51612916565b51813b15610a125789916109d591604051948580948193631dc8160b60e01b83526060600484015260648301906115e1565b33602483015230604483015203925af19081156104a45788916109fd575b505060010161096a565b81610a07916116a1565b61045357868b6109f3565b8980fd5b505085937f0000000000000000000000000000000000000000000000000000000000000000916001600160401b0360405195610a5187611686565b33875216938460208701527f00000000000000000000000000000000000000000000000000000000000000001515948560408801528160608801528260808801528760a08801526020604051610aa681611650565b8681528181019889526040518099819263f17325e760e01b8352846004840152516024830152516040604483015260018060a01b0381511660648301526001600160401b03848201511660848301526040810151151560a4830152606081015160c483015260a0610b27608083015160c060e48601526101248501906115e1565b91015161010483015203818b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af19687156104a4578897610cdc575b5091602091610bd2949360409897985196610b8788611634565b888852848801526001600160401b0342166040880152606087015288608087015260a086015260c08501963388523060e0870152610100860152806101208601528051010190611ba1565b92610bdc8461299c565b604084019360600192855b85518051821015610c8c5787906001600160a01b0390610c08908490612916565b5116610c15838851612916565b5190803b156103c757610c4c8391610c5e938360405180968195829463be1e753b60e01b84526040600485015260448401906115e1565b8281036003190160248401528d612055565b03925af180156103bc57610c77575b5050600101610be7565b81610c81916116a1565b610453578688610c6d565b8451845160209185916001600160a01b0316907f8f7f2dbafd79125e808bf16a53d7fa4e17b8b6374ced76d946a45f94b7bf4d068c80a360015f5160206129ff5f395f51905f5255604051908152f35b9193929096506020823d602011610d11575b81610cfb602093836116a1565b8101031261049857905195919290916020610b6d565b3d9150610cee565b630626ade360e41b8752600488905234602452604487fd5b5034610f90576020366003190112610f9057600435610d4e6126f7565b610d5781612868565b60208101517f0000000000000000000000000000000000000000000000000000000000000000809103610fa357606082016001600160401b0381511615610f9457516001600160401b03164210610f94576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690610ddf81611650565b8481525f602082015260405192610df584611650565b83526020830152803b15610f9057604051634692626760e01b815282516004820152602092830151805160248301529092015160448301525f908290606490829084905af19081610f7b575b50610e5a5763614cf93960e01b83526004829052602483fd5b9060c082019160018060a01b0383511691610e8361012083015160208082518301019101611ba1565b93610e8d8561299c565b604085019460600191865b86518051821015610f2e5788906001600160a01b0390610eb9908490612916565b5116610ec6838751612916565b5190803b156103c75787839161036d838c95610f006040519788968795869463561ca52560e01b86526060600487015260648601906115e1565b03925af180156103bc57610f19575b5050600101610e98565b81610f23916116a1565b61049857875f610f0f565b83516040516020916001600160a01b0316857f655ef333d5efcbf5aa343f02bcd9e3539f9c9f9ee8b9cfa7d8910b1bd7e0a8328d80a360015f5160206129ff5f395f51905f525560018152f35b610f889194505f906116a1565b5f925f610e41565b5f80fd5b637bf6a16f60e01b5f5260045ffd5b63629cd40b60e11b5f5260045ffd5b6040366003190112610f90576004356001600160401b038111610f905760a06003198236030112610f9057611018611003602092611011610ff16115a3565b916040519384916004018783016119d1565b03601f1981018452836116a1565b33916120f4565b604051908152f35b60206104eb61102e36611761565b9261103a92919261269d565b611db4565b34610f90576060366003190112610f90576004356001600160401b038111610f90576101406003198236030112610f90576040519061107d82611634565b806004013582526024810135602083015261109a604482016115b9565b60408301526110ab606482016115b9565b60608301526110bc608482016115b9565b608083015260a481013560a08301526110d760c482016115cd565b60c08301526110e860e482016115cd565b60e08301526101048101358015158103610f9057610100830152610124810135906001600160401b038211610f905760046111269236920101611713565b6101208201526024356001600160401b038111610f90576020916111516104eb923690600401611713565b90611e9a565b34610f90576020366003190112610f90576004356001600160401b038111610f905761118a61118f913690600401611713565b611d8b565b604080516001600160a01b03909316835260208301819052829161043a918301906115e1565b34610f90575f366003190112610f90576060806040516111d481611605565b5f81525f60208201525f604082015201526040516351753e3760e11b81527f000000000000000000000000000000000000000000000000000000000000000060048201525f8160248160018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165afa801561134b575f9061129b575b60609061043a604051928392602084528051602085015260018060a01b0360208201511660408501526040810151151582850152015160808084015260a08301906115e1565b503d805f833e6112ab81836116a1565b810190602081830312610f90578051906001600160401b038211610f905701608081830312610f9057604051906112e182611605565b8051825260208101516001600160a01b0381168103610f9057602083015261130b60408201611b19565b60408301526060810151906001600160401b038211610f90570182601f82011215610f905760609281602061134293519101611b26565b82820152611255565b6040513d5f823e3d90fd5b34610f90575f366003190112610f905760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b34610f90575f366003190112610f905761043a602061147e60016113d37f0000000000000000000000000000000000000000000000000000000000000000612530565b81846113fe7f0000000000000000000000000000000000000000000000000000000000000000612530565b81806114297f0000000000000000000000000000000000000000000000000000000000000000612530565b9260405199878b985191829101848a015e870190601760f91b83830152805192839101602183015e010190601760f91b84830152805192839101600283015e01015f838201520301601f1981018352826116a1565b6040519182916020835260208301906115e1565b34610f90575f366003190112610f9057602060405160328152f35b6060366003190112610f90576004356001600160401b038111610f905760a06003198236030112610f90576114e06115a3565b906044356001600160a01b0381168103610f9057602092611512611520611018946040519283916004018883016119d1565b03601f1981018352826116a1565b6120f4565b34610f90576020366003190112610f90576004359063ffffffff60e01b8216809203610f90576020916346d1b90d60e11b8114908115908161156a575b505015158152f35b90611578575b508380611562565b630acaa6e160e01b811491508115611592575b5083611570565b6301ffc9a760e01b1490508361158b565b602435906001600160401b0382168203610f9057565b35906001600160401b0382168203610f9057565b35906001600160a01b0382168203610f9057565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b608081019081106001600160401b0382111761162057604052565b634e487b7160e01b5f52604160045260245ffd5b61014081019081106001600160401b0382111761162057604052565b604081019081106001600160401b0382111761162057604052565b60a081019081106001600160401b0382111761162057604052565b60c081019081106001600160401b0382111761162057604052565b90601f801991011681019081106001600160401b0382111761162057604052565b6001600160401b03811161162057601f01601f191660200190565b9291926116e9826116c2565b916116f760405193846116a1565b829481845281830111610f90578281602093845f960137010152565b9080601f83011215610f905781602061172e933591016116dd565b90565b9181601f84011215610f90578235916001600160401b038311610f90576020808501948460051b010111610f9057565b6040600319820112610f90576004356001600160401b038111610f90578161178b91600401611731565b92909291602435906001600160401b038211610f90576117ad91600401611731565b9091565b9181601f84011215610f90578235916001600160401b038311610f905760208381860195010111610f9057565b9080602083519182815201916020808360051b8301019401925f915b83831061180957505050505090565b9091929394602080611827600193601f1986820301875289516115e1565b970193019301919392906117fa565b90602080835192838152019201905f5b8181106118535750505090565b8251845260209384019390920191600101611846565b602080825282516001600160a01b03168183015282015160a06040830152909291906118999060c08501906115e1565b92604082015193601f19828203016060830152602080865192838152019501905f5b8181106118f95750505060806118e461172e94956060850151601f1985830301848601526117de565b9201519060a0601f1982850301910152611836565b82516001600160a01b03168752602096870196909201916001016118bb565b6020600319820112610f9057600435906001600160401b038211610f9057610140908290036003190112610f905760040190565b9035601e1982360301811215610f905701602081359101916001600160401b038211610f90578136038313610f9057565b908060209392818452848401375f828201840152601f01601f1916010190565b9035601e1982360301811215610f905701602081359101916001600160401b038211610f90578160051b36038313610f9057565b602081526001600160a01b036119e6836115cd565b166020820152611a0d6119fc602084018461194c565b60a0604085015260c084019161197d565b916020611a1d604083018361199d565b848603601f1901606086015280865294909101935f5b818110611af357505050611a4a606082018261199d565b601f19848603016080850152808552602085019460208260051b82010195835f925b848410611abb57505050505050806080611a8792019061199d565b828403601f190160a09093019290925281835290916001600160fb1b038311610f905760209260051b809284830137010190565b909192939497602080611ae3600193601f19868203018852611add8d8861194c565b9061197d565b9a01940194019294939190611a6c565b909194602080600192838060a01b03611b0b8a6115cd565b168152019601929101611a33565b51908115158203610f9057565b929192611b32826116c2565b91611b4060405193846116a1565b829481845281830111610f90578281602093845f96015e010152565b51906001600160a01b0382168203610f9057565b9080601f83011215610f9057815161172e92602001611b26565b6001600160401b0381116116205760051b60200190565b602081830312610f90578051906001600160401b038211610f9057019060a082820312610f905760405191611bd58361166b565b611bde81611b5c565b835260208101516001600160401b038111610f905782611bff918301611b70565b602084015260408101516001600160401b038111610f9057810182601f82011215610f9057805190611c3082611b8a565b91611c3e60405193846116a1565b80835260208084019160051b83010191858311610f9057602001905b828210611d7357505050604084015260608101516001600160401b038111610f9057810182601f82011215610f90578051611c9481611b8a565b91611ca260405193846116a1565b81835260208084019260051b82010191858311610f905760208201905b838210611d46575050505060608401526080810151906001600160401b038211610f9057019080601f83011215610f90578151611cfb81611b8a565b92611d0960405194856116a1565b81845260208085019260051b820101928311610f9057602001905b828210611d3657505050608082015290565b8151815260209182019101611d24565b81516001600160401b038111610f9057602091611d6889848094880101611b70565b815201910190611cbf565b60208091611d8084611b5c565b815201910190611c5a565b611d9e9060208082518301019101611ba1565b80516020909101516001600160a01b0390911691565b929092818403611e49575f91345b85841015611e3e5781841015611e2a578360051b8086013590828211611e1b5784013561013e1985360301811215610f9057611dff9085016126de565b15611e105760019103930192611dc2565b505050505050505f90565b63044044a560e21b5f5260045ffd5b634e487b7160e01b5f52603260045260245ffd5b505050505050600190565b63251f56a160e21b5f5260045ffd5b60206040818301928281528451809452019201905f5b818110611e7b5750505090565b82516001600160a01b0316845260209384019390920191600101611e6e565b60208101517f00000000000000000000000000000000000000000000000000000000000000000361202557611ee0610120611ef092015160208082518301019101611ba1565b9160208082518301019101611ba1565b815181516001600160a01b039081169116149182612004575b82611fc1575b82611f6e575b82611f1f57505090565b6080919250810151604051611f44816115126020820194602086526040830190611836565b519020910151604051611f67816115126020820194602086526040830190611836565b5190201490565b91506060820151604051611f928161151260208201946020865260408301906117de565b5190206060820151604051611fb78161151260208201946020865260408301906117de565b5190201491611f15565b91506040820151604051611fdd81611512602082019485611e58565b5190206040820151604051611ffa81611512602082019485611e58565b5190201491611f0f565b91506020820151602081519101206020820151602081519101201491611f09565b50505f90565b604051906120388261166b565b60606080835f815282602082015282604082015282808201520152565b9061014061012061172e9380518452602081015160208501526001600160401b0360408201511660408501526001600160401b0360608201511660608501526001600160401b03608082015116608085015260a081015160a085015260018060a01b0360c08201511660c085015260018060a01b0360e08201511660e085015261010081015115156101008501520151918161012082015201906115e1565b906120fd6126f7565b81519061211260208085019385010183611ba1565b9161211c8361299c565b5f905f9660808501925b835180518a1015612164578961213b91612916565b51810180911161215057600190980197612126565b634e487b7160e01b5f52601160045260245ffd5b5090939692959194975080340361251a57506060870196604001955f5b87518051821015612223576001600160a01b03906121a0908390612916565b5116906121ae818951612916565b51916121bb828c51612916565b51813b15610f90575f916121ed91604051958680948193631dc8160b60e01b83526060600484015260648301906115e1565b33602483015230604483015203925af191821561134b57600192612213575b5001612181565b5f61221d916116a1565b5f61220c565b505093929650935093507f0000000000000000000000000000000000000000000000000000000000000000926001600160401b036040519561226487611686565b60018060a01b031693848752168060208701527f00000000000000000000000000000000000000000000000000000000000000001515908160408801525f60608801528260808801525f60a088015260206040516122c181611650565b8781528181019889526040518099819263f17325e760e01b8352846004840152516024830152516040604483015260018060a01b0381511660648301526001600160401b03848201511660848301526040810151151560a4830152606081015160c483015260a0612342608083015160c060e48601526101248501906115e1565b91015161010483015203815f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af196871561134b575f976124dd575b50916020916123ed9493604099989951976123a289611634565b8a8952848901526001600160401b034216604089015260608801525f60808801525f60a088015260c087019586523060e0880152610100870152806101208701528051010190611ba1565b926123f78461299c565b5f946060604086019501955b85518051821015612491576001600160a01b0390612422908390612916565b511690612430818951612916565b5191803b15610f9057610c4c5f91612467948360405180978195829463be1e753b60e01b84526040600485015260448401906115e1565b03925af191821561134b57600192612481575b5001612403565b5f61248b916116a1565b5f61247a565b50509350935090519060018060a01b03905116907f8f7f2dbafd79125e808bf16a53d7fa4e17b8b6374ced76d946a45f94b7bf4d065f80a39060015f5160206129ff5f395f51905f5255565b9193929096506020823d602011612512575b816124fc602093836116a1565b81010312610f9057905195919290916020612388565b3d91506124ef565b630626ade360e41b5f526004523460245260445ffd5b805f9172184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b82101561267a575b806d04ee2d6d415b85acef8100000000600a92101561265f575b662386f26fc1000081101561264b575b6305f5e10081101561263a575b61271081101561262b575b606481101561261d575b1015612612575b600a602160018401936125b7856116c2565b946125c560405196876116a1565b8086526125d4601f19916116c2565b013660208701378401015b5f1901916f181899199a1a9b1b9c1cb0b131b232b360811b8282061a835304801561260d57600a90916125df565b505090565b6001909101906125a5565b60646002910493019261259e565b61271060049104930192612594565b6305f5e10060089104930192612589565b662386f26fc100006010910493019261257c565b6d04ee2d6d415b85acef81000000006020910493019261256c565b506040915072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b8104612552565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031633036126cf57565b634ca8886760e01b5f5260045ffd5b60e0013560018060a01b038116809103610f9057301490565b60025f5160206129ff5f395f51905f5254146127205760025f5160206129ff5f395f51905f5255565b633ee5aeb560e01b5f5260045ffd5b6040519061273c82611634565b6060610120835f81525f60208201525f60408201525f838201525f60808201525f60a08201525f60c08201525f60e08201525f6101008201520152565b51906001600160401b0382168203610f9057565b602081830312610f90578051906001600160401b038211610f90570161014081830312610f9057604051916127c183611634565b81518352602082015160208401526127db60408301612779565b60408401526127ec60608301612779565b60608401526127fd60808301612779565b608084015260a082015160a084015261281860c08301611b5c565b60c084015261282960e08301611b5c565b60e084015261283b6101008301611b19565b6101008401526101208201516001600160401b038111610f905761285f9201611b70565b61012082015290565b9061287161272f565b506040516328c44a9960e21b815260048101839052915f836024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa92831561134b575f936128fa575b5082518181159182156128ef575b50506128dd5750565b6301fb6dd160e01b5f5260045260245ffd5b14159050815f6128d4565b61290f9193503d805f833e61084081836116a1565b915f6128c6565b8051821015611e2a5760209160051b010190565b80511561298d576001600160401b036060820151168015159081612982575b5061297357608001516001600160401b031661296457600190565b637b6227e960e11b5f5260045ffd5b631ab7da6b60e01b5f5260045ffd5b90504210155f612949565b635c2c7f8960e01b5f5260045ffd5b60408101908151516060820151518114918215926129ee575b50506129df575151603281116129c85750565b630e9407b360e11b5f52600452603260245260445ffd5b63512509d360e11b5f5260045ffd5b6080015151141590505f806129b556fe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a2646970667358221220413ef5a83827f556f672afbc3c9951b80b8a87df8cfb6ba80b7b278dbe5672c664736f6c634300081b0033",
    "sourceMap": "812:5182:136:-:0;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;1526:4;812:5182;759:14:6;688:1:9;783:14:6;;-1:-1:-1;807:14:6;;708:26:9;704:76;;790:10;2065:81:89;790:10:9;;;1932::89;;1952:32;;1526:4:136;1994:40:89;;2128:4;2065:81;;:::i;:::-;2044:102;;1526:4:136;1505:66:68;2365:1;812:5182:136;;;;;;;;;;;;;;783:14:6;812:5182:136;;;;;807:14:6;812:5182:136;;;;;790:10:9;812:5182:136;;;;;1952:32:89;812:5182:136;;;;;1932:10:89;812:5182:136;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2044:102:89;812:5182:136;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1994:40:89;812:5182:136;;;;;;;;;;;;;;;;704:76:9;757:12;;;-1:-1:-1;757:12:9;;-1:-1:-1;757:12:9;812:5182:136;-1:-1:-1;812:5182:136;;;;;;;-1:-1:-1;;812:5182:136;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;:::o;:::-;;;;-1:-1:-1;812:5182:136;;;;;-1:-1:-1;812:5182:136;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;-1:-1:-1;;812:5182:136;;;;;:::i;:::-;;;;;;;;;;;;;-1:-1:-1;812:5182:136;;;;;;;;;;;;;;;;;;:::o;597:755:125:-;;;812:5182:136;;1602:45:125;;;;812:5182:136;;;1602:45:125;812:5182:136;1602:45:125;812:5182:136;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1602:45:125;;;;;;;;;;;:::i;:::-;812:5182:136;1592:56:125;;812:5182:136;;-1:-1:-1;;;880:29:125;;;;;812:5182:136;;;1592:56:125;;-1:-1:-1;;;;;812:5182:136;;;-1:-1:-1;812:5182:136;880:29:125;812:5182:136;;880:29:125;;;;;;;;-1:-1:-1;880:29:125;;;597:755;812:5182:136;;923:19:125;919:35;;812:5182:136;;1602:45:125;812:5182:136;;;;;;;;;;;969:52:125;;812:5182:136;880:29:125;969:52;;812:5182:136;;;;;;;;;;;;;-1:-1:-1;812:5182:136;;;;;;;;;;;;880:29:125;812:5182:136;;;1526:4;812:5182;;;;;;;;;;;;969:52:125;;;-1:-1:-1;969:52:125;;;-1:-1:-1;;969:52:125;;;597:755;-1:-1:-1;965:381:125;;812:5182:136;-1:-1:-1;880:29:125;812:5182:136;;;;;;;;;;1207:29:125;;;880;1207;;812:5182:136;1207:29:125;;;;;;;;-1:-1:-1;1207:29:125;;;965:381;812:5182:136;;1254:19:125;1250:35;;1101:29;;;;-1:-1:-1;1306:29:125;880;812:5182:136;880:29:125;-1:-1:-1;1306:29:125;1250:35;1275:10::o;1207:29::-;;;;;;-1:-1:-1;1207:29:125;;;;;;:::i;:::-;;;;;:::i;:::-;;;;;812:5182:136;;;-1:-1:-1;812:5182:136;;;;;965:381:125;1072:20;;;;;;;1068:62;;1144:20;;:::o;1068:62::-;1101:29;;;-1:-1:-1;1101:29:125;880;812:5182:136;880:29:125;-1:-1:-1;1101:29:125;969:52;;;;1602:45;969:52;;1602:45;969:52;;;;;;1602:45;969:52;;;:::i;:::-;;;812:5182:136;;;;;969:52:125;;;;;;;-1:-1:-1;969:52:125;;919:35;944:10;;;;:::o;880:29::-;;;;;;-1:-1:-1;880:29:125;;;;;;:::i;:::-;;;",
    "linkReferences": {}
  },
  "deployedBytecode": {
    "object": "0x6080806040526004361015610029575b50361561001a575f80fd5b631574f9f360e01b5f5260045ffd5b5f905f3560e01c90816301ffc9a7146115255750806306920f96146114ad5780634fa4467c1461149257806354fd4d50146113905780635bf2f20d146113565780636b122fe0146111b5578063760bd1181461115757806388e5b2d9146110205780638da3721a1461103f57806391db0b7e1461102057806393abe3dc14610fb257806396afb36514610d31578063b3b902d414610899578063b587a5eb1461085c578063c6ec507014610750578063c93844be14610511578063ce46e046146104f5578063e49617e1146104d0578063e60c3505146104d05763ea6ec49c0361000f57346104cd5760403660031901126104cd5760043560243561012c6126f7565b61013582612868565b61013e82612868565b906020810151917f00000000000000000000000000000000000000000000000000000000000000008093036104be576101768261292a565b156104be5761012082019261018b8451611d8b565b9060a08401518551036104af576101a18461292a565b156104af576101e86020918651936040518095819482936346d1b90d60e11b8452606060048501526101d6606485018c612055565b848103600319016024860152906115e1565b604483019190915203916001600160a01b03165afa9081156104a4578891610466575b5015610457576040518791907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169061024b81611650565b8881528360208201526040519261026184611650565b83526020830152803b156103c757604051634692626760e01b8152825160048201526020928301518051602483015290920151604483015290919081908390606490829084905af1918261043e575b50506102ca5763614cf93960e01b86526004859052602486fd5b9260c086959401906102f060018060a01b03835116945160208082518301019101611ba1565b946102fa8661299c565b604086019560600192875b875180518210156103cb5789906001600160a01b0390610326908490612916565b5116610333838851612916565b5190803b156103c75788839161036d838d9561038460405197889687958694630fa37a1f60e01b86526080600487015260848601906115e1565b916024850152600319848303016044850152612055565b8c606483015203925af180156103bc576103a3575b5050600101610305565b816103ad916116a1565b6103b857888a610399565b8880fd5b6040513d84823e3d90fd5b8280fd5b7ff96e77bc177ae8e2ff25185e7c6d85f8ba97c8bdd9d46933aac70a7a33edf6c08a61043a858789604051926104026020856116a1565b858452516040519687966001600160a01b03909216939180a460015f5160206129ff5f395f51905f52556020835260208301906115e1565b0390f35b81610448916116a1565b61045357865f6102b0565b8680fd5b630ebe58ef60e11b8752600487fd5b90506020813d60201161049c575b81610481602093836116a1565b810103126104985761049290611b19565b5f61020b565b8780fd5b3d9150610474565b6040513d8a823e3d90fd5b630ebe58ef60e11b8952600489fd5b63629cd40b60e11b8652600486fd5b80fd5b60206104eb6104de36611918565b6104e661269d565b6126de565b6040519015158152f35b50346104cd57806003193601126104cd57602090604051908152f35b50346104cd5760203660031901126104cd576004356001600160401b038111610703576105429036906004016117b1565b61054d92919261202b565b50820191602081840312610703578035906001600160401b0382116103c757019060a0828403126104cd57604051916105858361166b565b61058e816115cd565b835260208101356001600160401b0381116103c757846105af918301611713565b602084015260408101356001600160401b0381116103c757810184601f820112156103c7578035906105e082611b8a565b916105ee60405193846116a1565b80835260208084019160051b8301019187831161073457602001905b82821061073857505050604084015260608101356001600160401b0381116103c757810184601f820112156103c75780359061064582611b8a565b9161065360405193846116a1565b80835260208084019160051b830101918783116107345760208101915b838310610707575050505060608401526080810135906001600160401b0382116103c757019280601f85011215610703578335936106ad85611b8a565b926106bb60405194856116a1565b85845260208085019660051b8301019283116104cd5750602001935b8185106106f357608084018390526040518061043a8682611869565b84358152602094850194016106d7565b5080fd5b82356001600160401b038111610498576020916107298b848094870101611713565b815201920191610670565b8580fd5b60208091610745846115cd565b81520191019061060a565b50346104cd5760203660031901126104cd5761076a61202b565b5061077361272f565b506040516328c44a9960e21b815260048035908201529080826024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa91821561084f57819261082b575b5060208201517f00000000000000000000000000000000000000000000000000000000000000000361081c5761043a61081061012084015160208082518301019101611ba1565b60405191829182611869565b635527981560e11b8152600490fd5b6108489192503d8084833e61084081836116a1565b81019061278d565b905f6107c9565b50604051903d90823e3d90fd5b50346104cd57806003193601126104cd5760206040517f000000000000000000000000000000000000000000000000000000000000000015158152f35b5060603660031901126104cd576004356001600160401b038111610703576108c59036906004016117b1565b6108dc6108d06115a3565b926044359236916116dd565b906108e56126f7565b8151916108fa60208083019483010184611ba1565b6109038161299c565b85869460808301915b8251805188101561094a578761092191612916565b5181018091116109365760019096019561090c565b634e487b7160e01b89526011600452602489fd5b509550868895873403610d19578680985094965084956060604089019801965b88518051821015610a16576001600160a01b0390610989908390612916565b5116610996828851612916565b51906109a3838b51612916565b51813b15610a125789916109d591604051948580948193631dc8160b60e01b83526060600484015260648301906115e1565b33602483015230604483015203925af19081156104a45788916109fd575b505060010161096a565b81610a07916116a1565b61045357868b6109f3565b8980fd5b505085937f0000000000000000000000000000000000000000000000000000000000000000916001600160401b0360405195610a5187611686565b33875216938460208701527f00000000000000000000000000000000000000000000000000000000000000001515948560408801528160608801528260808801528760a08801526020604051610aa681611650565b8681528181019889526040518099819263f17325e760e01b8352846004840152516024830152516040604483015260018060a01b0381511660648301526001600160401b03848201511660848301526040810151151560a4830152606081015160c483015260a0610b27608083015160c060e48601526101248501906115e1565b91015161010483015203818b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af19687156104a4578897610cdc575b5091602091610bd2949360409897985196610b8788611634565b888852848801526001600160401b0342166040880152606087015288608087015260a086015260c08501963388523060e0870152610100860152806101208601528051010190611ba1565b92610bdc8461299c565b604084019360600192855b85518051821015610c8c5787906001600160a01b0390610c08908490612916565b5116610c15838851612916565b5190803b156103c757610c4c8391610c5e938360405180968195829463be1e753b60e01b84526040600485015260448401906115e1565b8281036003190160248401528d612055565b03925af180156103bc57610c77575b5050600101610be7565b81610c81916116a1565b610453578688610c6d565b8451845160209185916001600160a01b0316907f8f7f2dbafd79125e808bf16a53d7fa4e17b8b6374ced76d946a45f94b7bf4d068c80a360015f5160206129ff5f395f51905f5255604051908152f35b9193929096506020823d602011610d11575b81610cfb602093836116a1565b8101031261049857905195919290916020610b6d565b3d9150610cee565b630626ade360e41b8752600488905234602452604487fd5b5034610f90576020366003190112610f9057600435610d4e6126f7565b610d5781612868565b60208101517f0000000000000000000000000000000000000000000000000000000000000000809103610fa357606082016001600160401b0381511615610f9457516001600160401b03164210610f94576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690610ddf81611650565b8481525f602082015260405192610df584611650565b83526020830152803b15610f9057604051634692626760e01b815282516004820152602092830151805160248301529092015160448301525f908290606490829084905af19081610f7b575b50610e5a5763614cf93960e01b83526004829052602483fd5b9060c082019160018060a01b0383511691610e8361012083015160208082518301019101611ba1565b93610e8d8561299c565b604085019460600191865b86518051821015610f2e5788906001600160a01b0390610eb9908490612916565b5116610ec6838751612916565b5190803b156103c75787839161036d838c95610f006040519788968795869463561ca52560e01b86526060600487015260648601906115e1565b03925af180156103bc57610f19575b5050600101610e98565b81610f23916116a1565b61049857875f610f0f565b83516040516020916001600160a01b0316857f655ef333d5efcbf5aa343f02bcd9e3539f9c9f9ee8b9cfa7d8910b1bd7e0a8328d80a360015f5160206129ff5f395f51905f525560018152f35b610f889194505f906116a1565b5f925f610e41565b5f80fd5b637bf6a16f60e01b5f5260045ffd5b63629cd40b60e11b5f5260045ffd5b6040366003190112610f90576004356001600160401b038111610f905760a06003198236030112610f9057611018611003602092611011610ff16115a3565b916040519384916004018783016119d1565b03601f1981018452836116a1565b33916120f4565b604051908152f35b60206104eb61102e36611761565b9261103a92919261269d565b611db4565b34610f90576060366003190112610f90576004356001600160401b038111610f90576101406003198236030112610f90576040519061107d82611634565b806004013582526024810135602083015261109a604482016115b9565b60408301526110ab606482016115b9565b60608301526110bc608482016115b9565b608083015260a481013560a08301526110d760c482016115cd565b60c08301526110e860e482016115cd565b60e08301526101048101358015158103610f9057610100830152610124810135906001600160401b038211610f905760046111269236920101611713565b6101208201526024356001600160401b038111610f90576020916111516104eb923690600401611713565b90611e9a565b34610f90576020366003190112610f90576004356001600160401b038111610f905761118a61118f913690600401611713565b611d8b565b604080516001600160a01b03909316835260208301819052829161043a918301906115e1565b34610f90575f366003190112610f90576060806040516111d481611605565b5f81525f60208201525f604082015201526040516351753e3760e11b81527f000000000000000000000000000000000000000000000000000000000000000060048201525f8160248160018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165afa801561134b575f9061129b575b60609061043a604051928392602084528051602085015260018060a01b0360208201511660408501526040810151151582850152015160808084015260a08301906115e1565b503d805f833e6112ab81836116a1565b810190602081830312610f90578051906001600160401b038211610f905701608081830312610f9057604051906112e182611605565b8051825260208101516001600160a01b0381168103610f9057602083015261130b60408201611b19565b60408301526060810151906001600160401b038211610f90570182601f82011215610f905760609281602061134293519101611b26565b82820152611255565b6040513d5f823e3d90fd5b34610f90575f366003190112610f905760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b34610f90575f366003190112610f905761043a602061147e60016113d37f0000000000000000000000000000000000000000000000000000000000000000612530565b81846113fe7f0000000000000000000000000000000000000000000000000000000000000000612530565b81806114297f0000000000000000000000000000000000000000000000000000000000000000612530565b9260405199878b985191829101848a015e870190601760f91b83830152805192839101602183015e010190601760f91b84830152805192839101600283015e01015f838201520301601f1981018352826116a1565b6040519182916020835260208301906115e1565b34610f90575f366003190112610f9057602060405160328152f35b6060366003190112610f90576004356001600160401b038111610f905760a06003198236030112610f90576114e06115a3565b906044356001600160a01b0381168103610f9057602092611512611520611018946040519283916004018883016119d1565b03601f1981018352826116a1565b6120f4565b34610f90576020366003190112610f90576004359063ffffffff60e01b8216809203610f90576020916346d1b90d60e11b8114908115908161156a575b505015158152f35b90611578575b508380611562565b630acaa6e160e01b811491508115611592575b5083611570565b6301ffc9a760e01b1490508361158b565b602435906001600160401b0382168203610f9057565b35906001600160401b0382168203610f9057565b35906001600160a01b0382168203610f9057565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b608081019081106001600160401b0382111761162057604052565b634e487b7160e01b5f52604160045260245ffd5b61014081019081106001600160401b0382111761162057604052565b604081019081106001600160401b0382111761162057604052565b60a081019081106001600160401b0382111761162057604052565b60c081019081106001600160401b0382111761162057604052565b90601f801991011681019081106001600160401b0382111761162057604052565b6001600160401b03811161162057601f01601f191660200190565b9291926116e9826116c2565b916116f760405193846116a1565b829481845281830111610f90578281602093845f960137010152565b9080601f83011215610f905781602061172e933591016116dd565b90565b9181601f84011215610f90578235916001600160401b038311610f90576020808501948460051b010111610f9057565b6040600319820112610f90576004356001600160401b038111610f90578161178b91600401611731565b92909291602435906001600160401b038211610f90576117ad91600401611731565b9091565b9181601f84011215610f90578235916001600160401b038311610f905760208381860195010111610f9057565b9080602083519182815201916020808360051b8301019401925f915b83831061180957505050505090565b9091929394602080611827600193601f1986820301875289516115e1565b970193019301919392906117fa565b90602080835192838152019201905f5b8181106118535750505090565b8251845260209384019390920191600101611846565b602080825282516001600160a01b03168183015282015160a06040830152909291906118999060c08501906115e1565b92604082015193601f19828203016060830152602080865192838152019501905f5b8181106118f95750505060806118e461172e94956060850151601f1985830301848601526117de565b9201519060a0601f1982850301910152611836565b82516001600160a01b03168752602096870196909201916001016118bb565b6020600319820112610f9057600435906001600160401b038211610f9057610140908290036003190112610f905760040190565b9035601e1982360301811215610f905701602081359101916001600160401b038211610f90578136038313610f9057565b908060209392818452848401375f828201840152601f01601f1916010190565b9035601e1982360301811215610f905701602081359101916001600160401b038211610f90578160051b36038313610f9057565b602081526001600160a01b036119e6836115cd565b166020820152611a0d6119fc602084018461194c565b60a0604085015260c084019161197d565b916020611a1d604083018361199d565b848603601f1901606086015280865294909101935f5b818110611af357505050611a4a606082018261199d565b601f19848603016080850152808552602085019460208260051b82010195835f925b848410611abb57505050505050806080611a8792019061199d565b828403601f190160a09093019290925281835290916001600160fb1b038311610f905760209260051b809284830137010190565b909192939497602080611ae3600193601f19868203018852611add8d8861194c565b9061197d565b9a01940194019294939190611a6c565b909194602080600192838060a01b03611b0b8a6115cd565b168152019601929101611a33565b51908115158203610f9057565b929192611b32826116c2565b91611b4060405193846116a1565b829481845281830111610f90578281602093845f96015e010152565b51906001600160a01b0382168203610f9057565b9080601f83011215610f9057815161172e92602001611b26565b6001600160401b0381116116205760051b60200190565b602081830312610f90578051906001600160401b038211610f9057019060a082820312610f905760405191611bd58361166b565b611bde81611b5c565b835260208101516001600160401b038111610f905782611bff918301611b70565b602084015260408101516001600160401b038111610f9057810182601f82011215610f9057805190611c3082611b8a565b91611c3e60405193846116a1565b80835260208084019160051b83010191858311610f9057602001905b828210611d7357505050604084015260608101516001600160401b038111610f9057810182601f82011215610f90578051611c9481611b8a565b91611ca260405193846116a1565b81835260208084019260051b82010191858311610f905760208201905b838210611d46575050505060608401526080810151906001600160401b038211610f9057019080601f83011215610f90578151611cfb81611b8a565b92611d0960405194856116a1565b81845260208085019260051b820101928311610f9057602001905b828210611d3657505050608082015290565b8151815260209182019101611d24565b81516001600160401b038111610f9057602091611d6889848094880101611b70565b815201910190611cbf565b60208091611d8084611b5c565b815201910190611c5a565b611d9e9060208082518301019101611ba1565b80516020909101516001600160a01b0390911691565b929092818403611e49575f91345b85841015611e3e5781841015611e2a578360051b8086013590828211611e1b5784013561013e1985360301811215610f9057611dff9085016126de565b15611e105760019103930192611dc2565b505050505050505f90565b63044044a560e21b5f5260045ffd5b634e487b7160e01b5f52603260045260245ffd5b505050505050600190565b63251f56a160e21b5f5260045ffd5b60206040818301928281528451809452019201905f5b818110611e7b5750505090565b82516001600160a01b0316845260209384019390920191600101611e6e565b60208101517f00000000000000000000000000000000000000000000000000000000000000000361202557611ee0610120611ef092015160208082518301019101611ba1565b9160208082518301019101611ba1565b815181516001600160a01b039081169116149182612004575b82611fc1575b82611f6e575b82611f1f57505090565b6080919250810151604051611f44816115126020820194602086526040830190611836565b519020910151604051611f67816115126020820194602086526040830190611836565b5190201490565b91506060820151604051611f928161151260208201946020865260408301906117de565b5190206060820151604051611fb78161151260208201946020865260408301906117de565b5190201491611f15565b91506040820151604051611fdd81611512602082019485611e58565b5190206040820151604051611ffa81611512602082019485611e58565b5190201491611f0f565b91506020820151602081519101206020820151602081519101201491611f09565b50505f90565b604051906120388261166b565b60606080835f815282602082015282604082015282808201520152565b9061014061012061172e9380518452602081015160208501526001600160401b0360408201511660408501526001600160401b0360608201511660608501526001600160401b03608082015116608085015260a081015160a085015260018060a01b0360c08201511660c085015260018060a01b0360e08201511660e085015261010081015115156101008501520151918161012082015201906115e1565b906120fd6126f7565b81519061211260208085019385010183611ba1565b9161211c8361299c565b5f905f9660808501925b835180518a1015612164578961213b91612916565b51810180911161215057600190980197612126565b634e487b7160e01b5f52601160045260245ffd5b5090939692959194975080340361251a57506060870196604001955f5b87518051821015612223576001600160a01b03906121a0908390612916565b5116906121ae818951612916565b51916121bb828c51612916565b51813b15610f90575f916121ed91604051958680948193631dc8160b60e01b83526060600484015260648301906115e1565b33602483015230604483015203925af191821561134b57600192612213575b5001612181565b5f61221d916116a1565b5f61220c565b505093929650935093507f0000000000000000000000000000000000000000000000000000000000000000926001600160401b036040519561226487611686565b60018060a01b031693848752168060208701527f00000000000000000000000000000000000000000000000000000000000000001515908160408801525f60608801528260808801525f60a088015260206040516122c181611650565b8781528181019889526040518099819263f17325e760e01b8352846004840152516024830152516040604483015260018060a01b0381511660648301526001600160401b03848201511660848301526040810151151560a4830152606081015160c483015260a0612342608083015160c060e48601526101248501906115e1565b91015161010483015203815f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af196871561134b575f976124dd575b50916020916123ed9493604099989951976123a289611634565b8a8952848901526001600160401b034216604089015260608801525f60808801525f60a088015260c087019586523060e0880152610100870152806101208701528051010190611ba1565b926123f78461299c565b5f946060604086019501955b85518051821015612491576001600160a01b0390612422908390612916565b511690612430818951612916565b5191803b15610f9057610c4c5f91612467948360405180978195829463be1e753b60e01b84526040600485015260448401906115e1565b03925af191821561134b57600192612481575b5001612403565b5f61248b916116a1565b5f61247a565b50509350935090519060018060a01b03905116907f8f7f2dbafd79125e808bf16a53d7fa4e17b8b6374ced76d946a45f94b7bf4d065f80a39060015f5160206129ff5f395f51905f5255565b9193929096506020823d602011612512575b816124fc602093836116a1565b81010312610f9057905195919290916020612388565b3d91506124ef565b630626ade360e41b5f526004523460245260445ffd5b805f9172184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b82101561267a575b806d04ee2d6d415b85acef8100000000600a92101561265f575b662386f26fc1000081101561264b575b6305f5e10081101561263a575b61271081101561262b575b606481101561261d575b1015612612575b600a602160018401936125b7856116c2565b946125c560405196876116a1565b8086526125d4601f19916116c2565b013660208701378401015b5f1901916f181899199a1a9b1b9c1cb0b131b232b360811b8282061a835304801561260d57600a90916125df565b505090565b6001909101906125a5565b60646002910493019261259e565b61271060049104930192612594565b6305f5e10060089104930192612589565b662386f26fc100006010910493019261257c565b6d04ee2d6d415b85acef81000000006020910493019261256c565b506040915072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b8104612552565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031633036126cf57565b634ca8886760e01b5f5260045ffd5b60e0013560018060a01b038116809103610f9057301490565b60025f5160206129ff5f395f51905f5254146127205760025f5160206129ff5f395f51905f5255565b633ee5aeb560e01b5f5260045ffd5b6040519061273c82611634565b6060610120835f81525f60208201525f60408201525f838201525f60808201525f60a08201525f60c08201525f60e08201525f6101008201520152565b51906001600160401b0382168203610f9057565b602081830312610f90578051906001600160401b038211610f90570161014081830312610f9057604051916127c183611634565b81518352602082015160208401526127db60408301612779565b60408401526127ec60608301612779565b60608401526127fd60808301612779565b608084015260a082015160a084015261281860c08301611b5c565b60c084015261282960e08301611b5c565b60e084015261283b6101008301611b19565b6101008401526101208201516001600160401b038111610f905761285f9201611b70565b61012082015290565b9061287161272f565b506040516328c44a9960e21b815260048101839052915f836024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa92831561134b575f936128fa575b5082518181159182156128ef575b50506128dd5750565b6301fb6dd160e01b5f5260045260245ffd5b14159050815f6128d4565b61290f9193503d805f833e61084081836116a1565b915f6128c6565b8051821015611e2a5760209160051b010190565b80511561298d576001600160401b036060820151168015159081612982575b5061297357608001516001600160401b031661296457600190565b637b6227e960e11b5f5260045ffd5b631ab7da6b60e01b5f5260045ffd5b90504210155f612949565b635c2c7f8960e01b5f5260045ffd5b60408101908151516060820151518114918215926129ee575b50506129df575151603281116129c85750565b630e9407b360e11b5f52600452603260245260445ffd5b63512509d360e11b5f5260045ffd5b6080015151141590505f806129b556fe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a2646970667358221220413ef5a83827f556f672afbc3c9951b80b8a87df8cfb6ba80b7b278dbe5672c664736f6c634300081b0033",
    "sourceMap": "812:5182:136:-:0;;;;;;;;;;-1:-1:-1;812:5182:136;;;;;;;;;1183:12:9;;;1054:5;1183:12;812:5182:136;1054:5:9;1183:12;812:5182:136;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;812:5182:136;;;;;;;;2989:103:68;;:::i;:::-;4062:32:90;;;:::i;:::-;4137:37;;;:::i;:::-;4236:13;812:5182:136;4236:13:90;;812:5182:136;4253:18:90;;4236:35;;;4232:99;;4346:24;;;:::i;:::-;4345:25;4341:64;;4528:11;;;;4512:28;4528:11;;4512:28;:::i;:::-;4621:18;;;;812:5182:136;;;4621:32:90;4617:65;;4698:29;;;:::i;:::-;4697:30;4693:63;;812:5182:136;;;;;;;;1796:26;;;;;;;;;4827:56:90;;812:5182:136;;4827:56:90;;812:5182:136;;;;;;;:::i;:::-;;;;-1:-1:-1;;812:5182:136;;;;;;;:::i;:::-;;;;;;;;4827:56:90;;-1:-1:-1;;;;;812:5182:136;4827:56:90;;;;;;;;;;;812:5182:136;4826:57:90;;4822:115;;812:5182:136;;;;;4981:3:90;-1:-1:-1;;;;;812:5182:136;;;;;:::i;:::-;;;;5058:47:90;812:5182:136;5058:47:90;;812:5182:136;;;;;;;:::i;:::-;;;;5005:102:90;;812:5182:136;4981:136:90;;;;;812:5182:136;;-1:-1:-1;;;4981:136:90;;812:5182:136;;;4981:136:90;;812:5182:136;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;4981:136:90;;;;;;812:5182:136;-1:-1:-1;;4977:215:90;;-1:-1:-1;;;5156:25:90;;812:5182:136;;;;;6295:21:90;5156:25;4977:215;;5285:21;4977:215;;;5285:21;812:5182:136;3285:41;812:5182;;;;;;;;3296:11;;812:5182;;;;3285:41;;;;;;:::i;:::-;3353:7;;;;:::i;:::-;812:5182;3392:13;;;812:5182;3473:17;;3377:9;3414:3;3392:13;;812:5182;;3388:24;;;;;812:5182;;-1:-1:-1;;;;;812:5182:136;3445:16;;812:5182;;3445:16;:::i;:::-;812:5182;;3473:20;:17;;;:20;:::i;:::-;;3433:89;;;;;;812:5182;;;;;;;;;;;;;;;;;;;;3433:89;;812:5182;;3433:89;;812:5182;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;3433:89;;;;;;;;;;3414:3;;;812:5182;;3377:9;;3433:89;;;;;:::i;:::-;812:5182;;3433:89;;;;812:5182;;;;3433:89;812:5182;;;;;;;;;3433:89;812:5182;;;3388:24;5337:61:90;3388:24:136;812:5182;3388:24;;;812:5182;;;;;;;:::i;:::-;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;5337:61:90;812:5182:136;-1:-1:-1;;;;;;;;;;;2407:1:68;812:5182:136;;;;;;;;:::i;:::-;;;;4981:136:90;;;;;:::i;:::-;812:5182:136;;4981:136:90;;;;812:5182:136;;;;4822:115:90;-1:-1:-1;;;4906:20:90;;812:5182:136;4662:20:90;4906;4827:56;;;812:5182:136;4827:56:90;;812:5182:136;4827:56:90;;;;;;812:5182:136;4827:56:90;;;:::i;:::-;;;812:5182:136;;;;;;;:::i;:::-;4827:56:90;;;812:5182:136;;;;4827:56:90;;;-1:-1:-1;4827:56:90;;;812:5182:136;;;;;;;;;4693:63:90;-1:-1:-1;;;4736:20:90;;812:5182:136;4662:20:90;4736;4341:64;-1:-1:-1;;;4379:26:90;;812:5182:136;5745:26:90;4379;812:5182:136;;;;;3045:39:9;812:5182:136;;;:::i;:::-;881:58:9;;:::i;:::-;3045:39;:::i;:::-;812:5182:136;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;812:5182:136;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;:::i;:::-;;;;;;:::i;:::-;;5602:34;;812:5182;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;:::i;:::-;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;:::i;:::-;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;-1:-1:-1;;812:5182:136;;;;;;:::i;:::-;;;;:::i;:::-;-1:-1:-1;812:5182:136;;-1:-1:-1;;;4191:23:89;;812:5182:136;;;4191:23:89;;;812:5182:136;;;;4191:23:89;812:5182:136;4191:3:89;-1:-1:-1;;;;;812:5182:136;4191:23:89;;;;;;;;;;;812:5182:136;4228:19:89;812:5182:136;4228:19:89;;812:5182:136;4251:18:89;4228:41;4224:100;;812:5182:136;5431:46;5442:16;;;;812:5182;;;;5431:46;;;;;;:::i;:::-;812:5182;;;;;;;:::i;4224:100:89:-;-1:-1:-1;;;4292:21:89;;812:5182:136;;4292:21:89;4191:23;;;;;;;;;;;;;;:::i;:::-;;;;;:::i;:::-;;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;;;;;;;;;1332:50:89;812:5182:136;;;;;;-1:-1:-1;812:5182:136;;-1:-1:-1;;812:5182:136;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;:::i;:::-;;;;:::i;:::-;;;;;;;;:::i;:::-;2176:12:92;2989:103:68;;:::i;:::-;812:5182:136;;2240:34;;812:5182;2240:34;;;;;;;;;:::i;:::-;2301:7;;;:::i;:::-;2320:18;2353:9;2368:14;;;;2348:104;2391:3;2368:14;;812:5182;;2364:25;;;;;2424:17;;;;:::i;:::-;812:5182;;;;;;;;;2410:31;2391:3;812:5182;2353:9;;;812:5182;-1:-1:-1;;;812:5182:136;;;;;;;;2364:25;;;;;;;2465:9;;:23;2461:72;;2549:9;;;;;;;;2564:13;812:5182;;2564:13;;2668:17;;2544:177;2586:3;2564:13;;812:5182;;2560:24;;;;;-1:-1:-1;;;;;812:5182:136;2617:16;;812:5182;;2617:16;:::i;:::-;812:5182;;2649:17;:14;;;:17;:::i;:::-;812:5182;2668:17;:20;:17;;;:20;:::i;:::-;;2605:105;;;;;812:5182;;;;;;;;;;;;;;;2605:105;;812:5182;;2605:105;;812:5182;;;;;;:::i;:::-;1625:10:92;812:5182:136;;;;2704:4;812:5182;;;;2605:105;;;;;;;;;;;;;2586:3;;;812:5182;;2549:9;;2605:105;;;;;:::i;:::-;812:5182;;2605:105;;;;;812:5182;;;2560:24;;;;;3559:18:89;812:5182:136;-1:-1:-1;;;;;812:5182:136;;;;;;:::i;:::-;1625:10:92;812:5182:136;;;3601:295:89;;812:5182:136;3601:295:89;;812:5182:136;3751:28:89;812:5182:136;;3601:295:89;;812:5182:136;3601:295:89;;812:5182:136;3601:295:89;812:5182:136;3601:295:89;;812:5182:136;3601:295:89;2368:14:136;3601:295:89;;812:5182:136;3601:295:89;;;;812:5182:136;;;;;;;:::i;:::-;;;;3514:397:89;;;812:5182:136;;;;;;;;;;;;3490:431:89;;;812:5182:136;3490:431:89;;812:5182:136;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;;;;;;;;;3601:295:89;812:5182:136;2368:14;812:5182;;;;;;;;;;;;;:::i;:::-;;;;;;;;3490:431:89;812:5182:136;;3490:3:89;-1:-1:-1;;;;;812:5182:136;3490:431:89;;;;;;;;;;;2544:177:136;812:5182;;;;2848:41;812:5182;;;;;;;;;;;:::i;:::-;;;;2347:424:92;;;812:5182:136;-1:-1:-1;;;;;2461:15:92;812:5182:136;;2347:424:92;;812:5182:136;;2347:424:92;;812:5182:136;2347:424:92;2368:14:136;2347:424:92;;812:5182:136;3601:295:89;2347:424:92;;812:5182:136;;2347:424:92;;1625:10;;812:5182:136;;2704:4;812:5182;2347:424:92;;812:5182:136;2347:424:92;;;812:5182:136;2347:424:92;;;;812:5182:136;;;2848:41;;;;:::i;:::-;2916:7;;;;:::i;:::-;812:5182;2955:13;;;812:5182;3035:17;;2940:9;2977:3;2955:13;;812:5182;;2951:24;;;;;812:5182;;-1:-1:-1;;;;;812:5182:136;3008:16;;812:5182;;3008:16;:::i;:::-;812:5182;;3035:20;:17;;;:20;:::i;:::-;;2996:68;;;;;;812:5182;;;;;;;;;;;;;;;;;2996:68;;812:5182;;2996:68;;812:5182;;;;;;:::i;:::-;;;;-1:-1:-1;;812:5182:136;;;;;;;:::i;:::-;2996:68;;;;;;;;;;2977:3;;;812:5182;;2940:9;;2996:68;;;;;:::i;:::-;812:5182;;2996:68;;;;2951:24;812:5182;;;;;;2951:24;;-1:-1:-1;;;;;812:5182:136;;7355:50:90;2951:24:136;;7355:50:90;812:5182:136;-1:-1:-1;;;;;;;;;;;2407:1:68;812:5182:136;;;;;;3490:431:89;;;;;;;812:5182:136;3490:431:89;;812:5182:136;3490:431:89;;;;;;812:5182:136;3490:431:89;;;:::i;:::-;;;812:5182:136;;;;;;;3490:431:89;;;;812:5182:136;3490:431:89;;;;;-1:-1:-1;3490:431:89;;2461:72:136;-1:-1:-1;;;2497:36:136;;812:5182;;;;2465:9;812:5182;;;2497:36;;812:5182;;;;;;;-1:-1:-1;;812:5182:136;;;;;;2989:103:68;;:::i;:::-;5587:28:90;;;:::i;:::-;812:5182:136;5682:18:90;;812:5182:136;5704:18:90;5682:40;;;5678:104;;5891:26;;;-1:-1:-1;;;;;812:5182:136;;;5891:31:90;5887:62;;812:5182:136;-1:-1:-1;;;;;812:5182:136;5964:15:90;:44;5960:100;;812:5182:136;;6124:3:90;-1:-1:-1;;;;;812:5182:136;;;;;:::i;:::-;;;;;;6201:43:90;;812:5182:136;;;;;;;:::i;:::-;;;;6148:98:90;;812:5182:136;6124:132:90;;;;;812:5182:136;;-1:-1:-1;;;6124:132:90;;812:5182:136;;;6124:132:90;;812:5182:136;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;812:5182:136;;;;;;-1:-1:-1;;6124:132:90;;;;;;812:5182:136;-1:-1:-1;6120:207:90;;-1:-1:-1;;;6295:21:90;;812:5182:136;;;;;6295:21:90;;6120:207;;6419:21;;;812:5182:136;;;;;;;;;3697:11;3686:41;3697:11;;;;812:5182;;;;3686:41;;;;;;:::i;:::-;3754:7;;;;:::i;:::-;812:5182;3793:13;;;5891:26:90;3873:17:136;;3778:9;3815:3;3793:13;;812:5182;;3789:24;;;;;812:5182;;-1:-1:-1;;;;;812:5182:136;3846:16;;812:5182;;3846:16;:::i;:::-;812:5182;;3873:20;:17;;;:20;:::i;:::-;;3834:72;;;;;;812:5182;;;;;;;;;;;;;;;;;;;;3834:72;;5891:26:90;812:5182:136;3834:72;;812:5182;;;;;;:::i;:::-;3834:72;;;;;;;;;;3815:3;;;812:5182;;3778:9;;3834:72;;;;;:::i;:::-;812:5182;;3834:72;;;;3789:24;812:5182;;;;;;-1:-1:-1;;;;;812:5182:136;3789:24;6457:43:90;3789:24:136;;6457:43:90;812:5182:136;-1:-1:-1;;;;;;;;;;;2407:1:68;812:5182:136;;;;6124:132:90;;;;;812:5182:136;6124:132:90;;:::i;:::-;812:5182:136;6124:132:90;;;;;812:5182:136;;;5960:100:90;5931:18;;;812:5182:136;6031:18:90;812:5182:136;;6031:18:90;5678:104;5745:26;;;812:5182:136;5745:26:90;812:5182:136;;5745:26:90;812:5182:136;;;-1:-1:-1;;812:5182:136;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;2176:12:92;4931:16:136;812:5182;;4931:16;812:5182;;:::i;:::-;;;;;;;;;4931:16;;;;:::i;:::-;;5198;;4931;;;;;;:::i;:::-;4965:10;2176:12:92;;:::i;:::-;812:5182:136;;;;;;;;1442:1461:9;812:5182:136;;;:::i;:::-;881:58:9;;;;;;:::i;:::-;1442:1461;:::i;812:5182:136:-;;;;;;-1:-1:-1;;812:5182:136;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;:::i;:::-;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;:::i;:::-;;;:::i;:::-;;;;;;-1:-1:-1;;812:5182:136;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;:::i;:::-;;:::i;:::-;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;-1:-1:-1;;812:5182:136;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;2937:44:89;;2962:18;812:5182:136;2937:44:89;;812:5182:136;;;2937:44:89;812:5182:136;;;;;;2937:14:89;812:5182:136;2937:44:89;;;;;;812:5182:136;2937:44:89;;;812:5182:136;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;2937:44:89:-;;;;812:5182:136;2937:44:89;;;;;;:::i;:::-;;;812:5182:136;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;2937:44:89;;;812:5182:136;;;;;;;;;;;;;;;-1:-1:-1;;812:5182:136;;;;;;;1204:43:89;812:5182:136;;;;;;;;;-1:-1:-1;;812:5182:136;;;;;1055:104:6;;812:5182:136;1072:24:6;1089:6;1072:24;:::i;:::-;1120:6;;1103:24;1120:6;1103:24;:::i;:::-;1151:6;;1134:24;1151:6;1134:24;:::i;:::-;812:5182:136;;;;;;;;;;;;1055:104:6;;;812:5182:136;;;;-1:-1:-1;;;812:5182:136;;;;;;;;;;;;;;;;;-1:-1:-1;;;812:5182:136;;;;;;;;;;;;;;;;;;;;;1055:104:6;;5198:16:136;;1055:104:6;;;;;;:::i;:::-;812:5182:136;;;;;1055:104:6;812:5182:136;;1055:104:6;812:5182:136;;;;:::i;:::-;;;;;;-1:-1:-1;;812:5182:136;;;;;;;1273:2;812:5182;;;;;;-1:-1:-1;;812:5182:136;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;:::i;:::-;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;5198:16;;2176:12:92;812:5182:136;;;;;;;;5198:16;;;;:::i;:::-;;;;;;;;;;:::i;:::-;2176:12:92;:::i;812:5182:136:-;;;;;;-1:-1:-1;;812:5182:136;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;1781:41:136;;;:81;;;;;;812:5182;;;;;;;;1781:81;573::88;;;1781::136;;;;;;573::88;-1:-1:-1;;;2366:40:90;;;-1:-1:-1;2366:80:90;;;;573:81:88;;;;;2366:80:90;-1:-1:-1;;;829:40:77;;-1:-1:-1;2366:80:90;;;812:5182:136;;;;-1:-1:-1;;;;;812:5182:136;;;;;;:::o;:::-;;;-1:-1:-1;;;;;812:5182:136;;;;;;:::o;:::-;;;-1:-1:-1;;;;;812:5182:136;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;812:5182:136;;;;;;;;-1:-1:-1;;812:5182:136;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;:::o;:::-;;;;-1:-1:-1;812:5182:136;;;;;-1:-1:-1;812:5182:136;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;:::o;:::-;;;5198:16;;812:5182;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;:::o;:::-;-1:-1:-1;;;;;812:5182:136;;;;;;-1:-1:-1;;812:5182:136;;;;:::o;:::-;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;812:5182:136;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;:::o;:::-;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;:::o;:::-;;-1:-1:-1;;812:5182:136;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;:::i;:::-;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;:::i;:::-;;;:::o;:::-;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;812:5182:136;;;;;;;;;;;;;:::o;:::-;5198:16;;;;;812:5182;5198:16;812:5182;;5198:16;;;812:5182;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;812:5182:136;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;5198:16;;;812:5182;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;5198:16;;812:5182;;;;;;;;;:::i;:::-;;;;5198:16;812:5182;5198:16;;812:5182;;;;;;;;:::i;:::-;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;-1:-1:-1;;812:5182:136;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;-1:-1:-1;;812:5182:136;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;-1:-1:-1;812:5182:136;;;;;;;;-1:-1:-1;;812:5182:136;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;:::o;:::-;;;;-1:-1:-1;;;;;812:5182:136;;;:::i;:::-;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;:::i;:::-;;;;;;;;;:::i;:::-;;;;-1:-1:-1;;812:5182:136;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;5198:16;;812:5182;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;-1:-1:-1;;812:5182:136;;;;;;;;;;;;5198:16;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;:::o;:::-;5198:16;;;;;;812:5182;5198:16;812:5182;;5198:16;;;812:5182;;;;;;;;;;:::i;:::-;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;812:5182:136;;;;;;:::o;:::-;;;-1:-1:-1;;;;;812:5182:136;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;:::i;:::-;-1:-1:-1;;;;;812:5182:136;;;;;;;;;:::o;:::-;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;:::i;:::-;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;:::i;:::-;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;1875:245;2029:34;1875:245;2029:34;812:5182;;;2029:34;;;;;;:::i;:::-;812:5182;;2029:34;2098:14;;;;-1:-1:-1;;;;;812:5182:136;;;;1875:245::o;3133:1460:9:-;;;;3340:23;;;3336:76;;3881:1;;3844:9;3896:19;3884:10;;;;;;812:5182:136;;;;;;;;;;;;;4064:22:9;;;;4060:87;;812:5182:136;;;;;;;;;;;;;;4274:33:9;812:5182:136;;;4274:33:9;:::i;:::-;;4270:84;;1489:1:0;812:5182:136;;3896:19:9;812:5182:136;3869:13:9;;;4270:84;4327:12;;;;;;;3881:1;4327:12;:::o;4060:87::-;4113:19;;;3881:1;4113:19;;3881:1;4113:19;812:5182:136;;;;3881:1:9;812:5182:136;;;;;3881:1:9;812:5182:136;3884:10:9;;;;;;;1489:1:0;3133:1460:9;:::o;3336:76::-;3386:15;;;;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;3929:849;4138:17;;;812:5182;4159:18;4138:39;4134:57;;4234:45;4245:15;4324:36;4245:15;;;4138:17;812:5182;;;4234:45;;;;;;:::i;:::-;812:5182;4138:17;812:5182;;;4324:36;;;;;;:::i;:::-;812:5182;;;;-1:-1:-1;;;;;812:5182:136;;;;;4378:37;;;:98;;3929:849;4378:193;;;3929:849;4378:296;;;3929:849;4378:393;;;4371:400;;3929:849;:::o;4378:393::-;4711:14;;;;;;;812:5182;;4700:26;;812:5182;4138:17;4700:26;;812:5182;4138:17;812:5182;;;;;;;:::i;4700:26::-;812:5182;4690:37;;4752:17;;;812:5182;;4741:29;;812:5182;4138:17;4741:29;;812:5182;4138:17;812:5182;;;;;;;:::i;4741:29::-;812:5182;4731:40;;4690:81;3929:849;:::o;4378:296::-;4608:17;;;;;;812:5182;;4597:29;;812:5182;4138:17;4597:29;;812:5182;4138:17;812:5182;;;;;;;:::i;4597:29::-;812:5182;4587:40;;4608:17;4652:20;;;812:5182;;4641:32;;812:5182;4138:17;4641:32;;812:5182;4138:17;812:5182;;;;;;;:::i;4641:32::-;812:5182;4631:43;;4587:87;4378:296;;;:193;4513:13;;;;;;;812:5182;4502:25;;;4138:17;4502:25;;;;;:::i;:::-;812:5182;4492:36;;4513:13;4553:16;;;4513:13;812:5182;4542:28;;;4138:17;4542:28;;;;;:::i;:::-;812:5182;4532:39;;4492:79;4378:193;;;:98;4429:14;;4138:17;4429:14;;;4138:17;812:5182;;;;4419:25;4138:17;4458;;;4138;812:5182;;;;4448:28;4419:57;4378:98;;;4134:57;4179:12;;812:5182;4179:12;:::o;812:5182::-;;;;;;;:::i;:::-;;;;-1:-1:-1;812:5182:136;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;2989:103:68:-;;;;:::i;:::-;812:5182:136;;2240:34;;;;;;;;;;;;:::i;:::-;2301:7;;;;:::i;:::-;812:5182;2353:9;812:5182;2368:14;;;;2348:104;2391:3;2368:14;;812:5182;;2364:25;;;;;2424:17;;;;:::i;:::-;812:5182;;;;;;;;;2410:31;2391:3;812:5182;2353:9;;;812:5182;;;;;;;;;;;;2364:25;;;;;;;;;;;2465:9;;:23;2461:72;;-1:-1:-1;2668:17:136;;;;2564:13;;;812:5182;2586:3;2564:13;;812:5182;;2560:24;;;;;-1:-1:-1;;;;;812:5182:136;2617:16;;812:5182;;2617:16;:::i;:::-;812:5182;;2649:14;:17;:14;;;:17;:::i;:::-;812:5182;2668:17;:20;:17;;;:20;:::i;:::-;;2605:105;;;;;812:5182;;;;2564:13;812:5182;;;;;;;;;;2605:105;;2668:17;2605:105;;;812:5182;;;;;;:::i;:::-;2224:10:92;812:5182:136;;;;2704:4;812:5182;;;;2605:105;;;;;;;;;812:5182;2605:105;;;2586:3;;812:5182;2549:9;;2605:105;812:5182;2605:105;;;:::i;:::-;;;;2560:24;;;;;;;;;;;3559:18:89;812:5182:136;-1:-1:-1;;;;;2564:13:136;812:5182;;;;;:::i;:::-;;;;;;;;;;;;3601:295:89;2240:34:136;3601:295:89;;812:5182:136;3751:28:89;812:5182:136;;3601:295:89;;2564:13:136;3601:295:89;;812:5182:136;;2668:17;3601:295:89;;812:5182:136;3601:295:89;2368:14:136;3601:295:89;;812:5182:136;;3601:295:89;;;812:5182:136;2240:34;2564:13;812:5182;;;;:::i;:::-;;;;3514:397:89;;;812:5182:136;;;2564:13;812:5182;;;;;;;;3490:431:89;;;2605:105:136;3490:431:89;;812:5182:136;;;;;;;2564:13;812:5182;;;;;;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;2564:13;812:5182;;;;;;;;;2668:17;812:5182;;;;;;;3601:295:89;812:5182:136;2368:14;812:5182;;;;;;;;;;;;;:::i;:::-;;;;;;;;3490:431:89;812:5182:136;;3490:3:89;-1:-1:-1;;;;;812:5182:136;3490:431:89;;;;;;;812:5182:136;3490:431:89;;;2544:177:136;812:5182;;2240:34;812:5182;2848:41;812:5182;;2564:13;812:5182;;;;;;;;:::i;:::-;;;;2347:424:92;;;812:5182:136;-1:-1:-1;;;;;2461:15:92;812:5182:136;2564:13;2347:424:92;;812:5182:136;2668:17;2347:424:92;;812:5182:136;;2368:14;2347:424:92;;812:5182:136;;3601:295:89;2347:424:92;;812:5182:136;;2347:424:92;;812:5182:136;;;2704:4;812:5182;2347:424:92;;812:5182:136;2347:424:92;;;812:5182:136;2347:424:92;;;;812:5182:136;;;2848:41;;;;:::i;:::-;2916:7;;;;:::i;:::-;812:5182;2955:13;2668:17;2564:13;2955;;3035:17;;2935:140;2977:3;2955:13;;812:5182;;2951:24;;;;;-1:-1:-1;;;;;812:5182:136;3008:16;;812:5182;;3008:16;:::i;:::-;812:5182;;3035:17;:20;:17;;;:20;:::i;:::-;;2996:68;;;;;;812:5182;;;;;;2564:13;812:5182;;;;;;;;;;2996:68;;2564:13;2605:105;2996:68;;812:5182;;;;;;:::i;:::-;2996:68;;;;;;;;;812:5182;2996:68;;;2977:3;;812:5182;2940:9;;2996:68;812:5182;2996:68;;;:::i;:::-;;;;2951:24;;;;;;;;812:5182;;;;;;;;;;7355:50:90;;812:5182:136;7355:50:90;;2407:1:68;812:5182:136;-1:-1:-1;;;;;;;;;;;2407:1:68;2989:103::o;3490:431:89:-;;;;;;;2240:34:136;3490:431:89;;2240:34:136;3490:431:89;;;;;;2240:34:136;3490:431:89;;;:::i;:::-;;;812:5182:136;;;;;;;3490:431:89;;;;2240:34:136;3490:431:89;;;;;-1:-1:-1;3490:431:89;;2461:72:136;2497:36;;;812:5182;2497:36;;812:5182;2465:9;812:5182;;;;2497:36;1343:634:72;1465:17;-1:-1:-1;29298:17:79;-1:-1:-1;;;29298:17:79;;;29294:103;;1343:634:72;29414:17:79;29423:8;29994:7;29414:17;;;29410:103;;1343:634:72;29539:8:79;29530:17;;;29526:103;;1343:634:72;29655:7:79;29646:16;;;29642:100;;1343:634:72;29768:7:79;29759:16;;;29755:100;;1343:634:72;29881:7:79;29872:16;;;29868:100;;1343:634:72;29985:16:79;;29981:66;;1343:634:72;29994:7:79;1580:94:72;1485:1;812:5182:136;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;5198:16;;812:5182;;:::i;:::-;;;;;;;1580:94:72;;;1687:247;-1:-1:-1;;812:5182:136;;-1:-1:-1;;;1741:111:72;;;;812:5182:136;1741:111:72;812:5182:136;1902:10:72;;1898:21;;29994:7:79;1687:247:72;;;;1898:21;1914:5;;1343:634;:::o;29981:66:79:-;30031:1;812:5182:136;;;;29981:66:79;;29868:100;29881:7;29952:1;812:5182:136;;;;29868:100:79;;;29755;29768:7;29839:1;812:5182:136;;;;29755:100:79;;;29642;29655:7;29726:1;812:5182:136;;;;29642:100:79;;;29526:103;29539:8;29612:2;812:5182:136;;;;29526:103:79;;;29410;29423:8;29496:2;812:5182:136;;;;29410:103:79;;;29294;-1:-1:-1;29380:2:79;;-1:-1:-1;;;;812:5182:136;;29294:103:79;;6040:128:9;6109:4;-1:-1:-1;;;;;812:5182:136;6087:10:9;:27;6083:79;;6040:128::o;6083:79::-;6137:14;;;;;;;;2506:271:89;2733:20;;812:5182:136;;;;;;;;;;;;;2765:4:89;2733:37;2506:271;:::o;3749:292:68:-;2407:1;-1:-1:-1;;;;;;;;;;;812:5182:136;4560:63:68;3644:93;;2407:1;-1:-1:-1;;;;;;;;;;;2407:1:68;3749:292::o;3644:93::-;3696:30;;;-1:-1:-1;3696:30:68;;-1:-1:-1;3696:30:68;812:5182:136;;;;;;;:::i;:::-;;;;-1:-1:-1;812:5182:136;;-1:-1:-1;812:5182:136;;;;-1:-1:-1;812:5182:136;;;;-1:-1:-1;812:5182:136;;;;-1:-1:-1;812:5182:136;;;;-1:-1:-1;812:5182:136;;;;-1:-1:-1;812:5182:136;;;;-1:-1:-1;812:5182:136;;;;-1:-1:-1;812:5182:136;;;;;;:::o;:::-;;;-1:-1:-1;;;;;812:5182:136;;;;;;:::o;:::-;;;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;-1:-1:-1;;;;;812:5182:136;;;;;;;;:::i;:::-;;;;;;:::o;6683:257:90:-;;812:5182:136;;:::i;:::-;-1:-1:-1;812:5182:136;;-1:-1:-1;;;6808:23:90;;;;;812:5182:136;;;;-1:-1:-1;812:5182:136;6808:23:90;812:5182:136;6808:3:90;-1:-1:-1;;;;;812:5182:136;6808:23:90;;;;;;;-1:-1:-1;6808:23:90;;;6683:257;6794:37;;812:5182:136;6845:29:90;;;:55;;;;;6683:257;6841:92;;;;6683:257;:::o;6841:92::-;6909:24;;;-1:-1:-1;6909:24:90;6808:23;812:5182:136;6808:23:90;-1:-1:-1;6909:24:90;6845:55;6878:22;;;-1:-1:-1;6845:55:90;;;;6808:23;;;;;;;-1:-1:-1;6808:23:90;;;;;;:::i;:::-;;;;;812:5182:136;;;;;;;;;;;;;;;:::o;1185:321:124:-;812:5182:136;;1284:28:124;1280:64;;-1:-1:-1;;;;;801:25:124;;;812:5182:136;;801:30:124;;;:78;;;;1185:321;1354:55;;;1057:25;;812:5182:136;-1:-1:-1;;;;;812:5182:136;1419:58:124;;1495:4;1185:321;:::o;1419:58::-;1457:20;;;-1:-1:-1;1457:20:124;;-1:-1:-1;1457:20:124;1354:55;1392:17;;;-1:-1:-1;1392:17:124;;-1:-1:-1;1392:17:124;801:78;864:15;;;-1:-1:-1;835:44:124;801:78;;;1280:64;1321:23;;;-1:-1:-1;1321:23:124;;-1:-1:-1;1321:23:124;5649:343:136;5734:13;;;;;;812:5182;5758:17;;;;812:5182;5734:48;;;;;:97;;;5649:343;5730:156;;;;5899:13;812:5182;1273:2;5899:32;;5895:90;;5649:343;:::o;5895:90::-;5940:45;;;-1:-1:-1;5940:45:136;;812:5182;1273:2;812:5182;;;-1:-1:-1;5940:45:136;5730:156;5854:21;;;-1:-1:-1;5854:21:136;;-1:-1:-1;5854:21:136;5734:97;5810:14;;;812:5182;5786:45;;;-1:-1:-1;5734:97:136;;;",
    "linkReferences": {},
    "immutableReferences": {
      "2532": [
        {
          "start": 5039,
          "length": 32
        }
      ],
      "2534": [
        {
          "start": 5082,
          "length": 32
        }
      ],
      "2536": [
        {
          "start": 5125,
          "length": 32
        }
      ],
      "3008": [
        {
          "start": 9887,
          "length": 32
        }
      ],
      "59046": [
        {
          "start": 4646,
          "length": 32
        }
      ],
      "59050": [
        {
          "start": 537,
          "length": 32
        },
        {
          "start": 1937,
          "length": 32
        },
        {
          "start": 2869,
          "length": 32
        },
        {
          "start": 3501,
          "length": 32
        },
        {
          "start": 9040,
          "length": 32
        },
        {
          "start": 10382,
          "length": 32
        }
      ],
      "59053": [
        {
          "start": 327,
          "length": 32
        },
        {
          "start": 2001,
          "length": 32
        },
        {
          "start": 2588,
          "length": 32
        },
        {
          "start": 3422,
          "length": 32
        },
        {
          "start": 4596,
          "length": 32
        },
        {
          "start": 4973,
          "length": 32
        },
        {
          "start": 7841,
          "length": 32
        },
        {
          "start": 8751,
          "length": 32
        }
      ],
      "59056": [
        {
          "start": 2164,
          "length": 32
        },
        {
          "start": 2654,
          "length": 32
        },
        {
          "start": 8825,
          "length": 32
        }
      ]
    }
  },
  "methodIdentifiers": {
    "ATTESTATION_SCHEMA()": "5bf2f20d",
    "ATTESTATION_SCHEMA_REVOCABLE()": "b587a5eb",
    "MAX_HOOKS()": "4fa4467c",
    "attest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))": "e60c3505",
    "check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)": "8da3721a",
    "collect(bytes32,bytes32)": "ea6ec49c",
    "decodeCondition(bytes)": "760bd118",
    "decodeObligationData(bytes)": "c93844be",
    "doObligation((address,bytes,address[],bytes[],uint256[]),uint64)": "93abe3dc",
    "doObligationFor((address,bytes,address[],bytes[],uint256[]),uint64,address)": "06920f96",
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
  "rawMetadata": "{\"compiler\":{\"version\":\"0.8.27+commit.40a35a09\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[{\"internalType\":\"contract IEAS\",\"name\":\"_eas\",\"type\":\"address\"},{\"internalType\":\"contract ISchemaRegistry\",\"name\":\"_schemaRegistry\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"AccessDenied\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"ArrayLengthMismatch\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"attestationId\",\"type\":\"bytes32\"}],\"name\":\"AttestationNotFound\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"AttestationRevoked\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"DeadlineExpired\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InsufficientValue\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidAttestationUid\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidEAS\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidEscrowAttestation\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidFulfillment\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidLength\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"NotFromThisAttester\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"NotPayable\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"ReentrancyGuardReentrantCall\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"attestationId\",\"type\":\"bytes32\"}],\"name\":\"RevocationFailed\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"SchemaRegistrationFailed\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"provided\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"max\",\"type\":\"uint256\"}],\"name\":\"TooManyHooks\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"UnauthorizedCall\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"expected\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"received\",\"type\":\"uint256\"}],\"name\":\"ValueMismatch\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"fulfillmentUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"fulfiller\",\"type\":\"address\"}],\"name\":\"EscrowCollected\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"escrower\",\"type\":\"address\"}],\"name\":\"EscrowMade\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"escrower\",\"type\":\"address\"}],\"name\":\"EscrowReclaimed\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"ATTESTATION_SCHEMA\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"ATTESTATION_SCHEMA_REVOCABLE\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"MAX_HOOKS\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"attestation\",\"type\":\"tuple\"}],\"name\":\"attest\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"obligation\",\"type\":\"tuple\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"check\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"_escrow\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"_fulfillment\",\"type\":\"bytes32\"}],\"name\":\"collect\",\"outputs\":[{\"internalType\":\"bytes\",\"name\":\"\",\"type\":\"bytes\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"decodeCondition\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"decodeObligationData\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"address[]\",\"name\":\"hooks\",\"type\":\"address[]\"},{\"internalType\":\"bytes[]\",\"name\":\"hookDatas\",\"type\":\"bytes[]\"},{\"internalType\":\"uint256[]\",\"name\":\"values\",\"type\":\"uint256[]\"}],\"internalType\":\"struct HooksEscrowObligation.ObligationData\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"address[]\",\"name\":\"hooks\",\"type\":\"address[]\"},{\"internalType\":\"bytes[]\",\"name\":\"hookDatas\",\"type\":\"bytes[]\"},{\"internalType\":\"uint256[]\",\"name\":\"values\",\"type\":\"uint256[]\"}],\"internalType\":\"struct HooksEscrowObligation.ObligationData\",\"name\":\"data\",\"type\":\"tuple\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"}],\"name\":\"doObligation\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"address[]\",\"name\":\"hooks\",\"type\":\"address[]\"},{\"internalType\":\"bytes[]\",\"name\":\"hookDatas\",\"type\":\"bytes[]\"},{\"internalType\":\"uint256[]\",\"name\":\"values\",\"type\":\"uint256[]\"}],\"internalType\":\"struct HooksEscrowObligation.ObligationData\",\"name\":\"data\",\"type\":\"tuple\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"}],\"name\":\"doObligationFor\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"}],\"name\":\"doObligationRaw\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid_\",\"type\":\"bytes32\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"getObligationData\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"address[]\",\"name\":\"hooks\",\"type\":\"address[]\"},{\"internalType\":\"bytes[]\",\"name\":\"hookDatas\",\"type\":\"bytes[]\"},{\"internalType\":\"uint256[]\",\"name\":\"values\",\"type\":\"uint256[]\"}],\"internalType\":\"struct HooksEscrowObligation.ObligationData\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getSchema\",\"outputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"contract ISchemaResolver\",\"name\":\"resolver\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"string\",\"name\":\"schema\",\"type\":\"string\"}],\"internalType\":\"struct SchemaRecord\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"isPayable\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation[]\",\"name\":\"attestations\",\"type\":\"tuple[]\"},{\"internalType\":\"uint256[]\",\"name\":\"values\",\"type\":\"uint256[]\"}],\"name\":\"multiAttest\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation[]\",\"name\":\"attestations\",\"type\":\"tuple[]\"},{\"internalType\":\"uint256[]\",\"name\":\"values\",\"type\":\"uint256[]\"}],\"name\":\"multiRevoke\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"reclaim\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"attestation\",\"type\":\"tuple\"}],\"name\":\"revoke\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"version\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"stateMutability\":\"payable\",\"type\":\"receive\"}],\"devdoc\":{\"details\":\"Security note: This contract has not been included in professional manual audits and      has only been reviewed by automated audit tooling so far.\",\"errors\":{\"ReentrancyGuardReentrantCall()\":[{\"details\":\"Unauthorized reentrant call.\"}]},\"kind\":\"dev\",\"methods\":{\"attest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"params\":{\"attestation\":\"The new attestation.\"},\"returns\":{\"_0\":\"Whether the attestation is valid.\"}},\"collect(bytes32,bytes32)\":{\"params\":{\"escrowUid\":\"UID of the escrow attestation.\",\"fulfillmentUid\":\"UID of the fulfillment attestation.\"},\"returns\":{\"_0\":\"Escrow-specific return data from the underlying release logic.\"}},\"decodeCondition(bytes)\":{\"params\":{\"escrowData\":\"ABI-encoded escrow obligation data.\"},\"returns\":{\"arbiter\":\"Address of the arbiter that validates fulfillment.\",\"demand\":\"Arbiter-specific demand bytes.\"}},\"doObligationRaw(bytes,uint64,bytes32)\":{\"params\":{\"data\":\"ABI-encoded obligation data.\",\"expirationTime\":\"EAS expiration timestamp, or zero for no expiration.\",\"refUID\":\"Reference UID stored on the EAS attestation.\"}},\"isPayable()\":{\"returns\":{\"_0\":\"Whether the resolver supports ETH transfers.\"}},\"multiAttest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"params\":{\"attestations\":\"The new attestations.\",\"values\":\"Explicit ETH amounts which were sent with each attestation.\"},\"returns\":{\"_0\":\"Whether all the attestations are valid.\"}},\"multiRevoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"params\":{\"attestations\":\"The existing attestations to be revoked.\",\"values\":\"Explicit ETH amounts which were sent with each revocation.\"},\"returns\":{\"_0\":\"Whether the attestations can be revoked.\"}},\"reclaim(bytes32)\":{\"params\":{\"escrowUid\":\"UID of the escrow attestation.\"},\"returns\":{\"_0\":\"True if the reclaim succeeds.\"}},\"revoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"params\":{\"attestation\":\"The existing attestation to be revoked.\"},\"returns\":{\"_0\":\"Whether the attestation can be revoked.\"}},\"supportsInterface(bytes4)\":{\"details\":\"Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section] to learn more about how these ids are created. This function call must use less than 30 000 gas.\"},\"version()\":{\"returns\":{\"_0\":\"Semver contract version as a string.\"}}},\"title\":\"HooksEscrowObligation\",\"version\":1},\"userdoc\":{\"errors\":{\"AttestationNotFound(bytes32)\":[{\"notice\":\"Raised when EAS has no attestation for the requested UID.\"}],\"AttestationRevoked()\":[{\"notice\":\"Raised when an attestation has been revoked.\"}],\"DeadlineExpired()\":[{\"notice\":\"Raised when an attestation has expired.\"}],\"InvalidAttestationUid()\":[{\"notice\":\"Raised when an attestation UID is zero.\"}],\"InvalidEscrowAttestation()\":[{\"notice\":\"Raised when the escrow attestation is missing, invalid, expired, revoked, or has the wrong schema.\"}],\"InvalidFulfillment()\":[{\"notice\":\"Raised when the fulfillment does not satisfy the escrow's default checks or arbiter.\"}],\"NotFromThisAttester()\":[{\"notice\":\"Raised when an attestation does not belong to this contract's schema.\"}],\"RevocationFailed(bytes32)\":[{\"notice\":\"Raised when revoking the escrow attestation fails during collect or reclaim.\"}],\"SchemaRegistrationFailed(bytes32)\":[{\"notice\":\"Raised when a schema cannot be registered or found at its deterministic UID.\"}],\"UnauthorizedCall()\":[{\"notice\":\"Raised when a caller attempts an action that is not currently permitted.\"}]},\"events\":{\"EscrowCollected(bytes32,bytes32,address)\":{\"notice\":\"Emitted when an escrow is successfully collected by a fulfillment recipient.\"},\"EscrowMade(bytes32,address)\":{\"notice\":\"Emitted when escrow assets are locked and the escrow attestation is created.\"},\"EscrowReclaimed(bytes32,address)\":{\"notice\":\"Emitted when an expired escrow is reclaimed by its original escrower.\"}},\"kind\":\"user\",\"methods\":{\"ATTESTATION_SCHEMA()\":{\"notice\":\"UID of the schema used by attestations created by this contract.\"},\"ATTESTATION_SCHEMA_REVOCABLE()\":{\"notice\":\"Whether attestations under `ATTESTATION_SCHEMA` are revocable.\"},\"attest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"notice\":\"Processes an attestation and verifies whether it's valid.\"},\"collect(bytes32,bytes32)\":{\"notice\":\"Collects an escrow using a fulfillment attestation.\"},\"decodeCondition(bytes)\":{\"notice\":\"Decodes an escrow attestation's condition into arbiter and demand data.\"},\"doObligationRaw(bytes,uint64,bytes32)\":{\"notice\":\"Creates an obligation attestation from pre-encoded data.\"},\"getSchema()\":{\"notice\":\"Returns the schema record registered for this attester.\"},\"isPayable()\":{\"notice\":\"Checks if the resolver can be sent ETH.\"},\"multiAttest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"notice\":\"Processes multiple attestations and verifies whether they are valid.\"},\"multiRevoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"notice\":\"Processes revocation of multiple attestation and verifies they can be revoked.\"},\"reclaim(bytes32)\":{\"notice\":\"Reclaims an expired escrow and returns locked assets to the escrower.\"},\"revoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"notice\":\"Processes an attestation revocation and verifies if it can be revoked.\"},\"version()\":{\"notice\":\"Returns the full semver contract version.\"}},\"notice\":\"A multi-hook escrow obligation that calls each IEscrowHook directly         during lock, release, and return.\",\"version\":1}},\"settings\":{\"compilationTarget\":{\"src/obligations/escrow/hook-based/HooksEscrowObligation.sol\":\"HooksEscrowObligation\"},\"evmVersion\":\"prague\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[\":@eas/=lib/eas-contracts/contracts/\",\":@erc8004/=lib/erc-8004-contracts/contracts/\",\":@openzeppelin/=lib/openzeppelin-contracts/\",\":@src/=src/\",\":@test/=test/\",\":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/\",\":eas-contracts/=lib/eas-contracts/contracts/\",\":erc-8004-contracts/=lib/erc-8004-contracts/contracts/\",\":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/\",\":eth-gas-reporter/=lib/eas-contracts/node_modules/eth-gas-reporter/\",\":forge-std/=lib/forge-std/src/\",\":halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/\",\":hardhat-deploy/=lib/eas-contracts/node_modules/hardhat-deploy/\",\":hardhat/=lib/eas-contracts/node_modules/hardhat/\",\":openzeppelin-contracts/=lib/openzeppelin-contracts/\"],\"viaIR\":true},\"sources\":{\"lib/eas-contracts/contracts/Common.sol\":{\"keccak256\":\"0x957bd2e6d0d6d637f86208b135c29fbaf4412cb08e5e7a61ede16b80561bf685\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://da1dc9aedbb1d4d39c46c2235918d3adfbc5741dd34a46010cf425d134e7936d\",\"dweb:/ipfs/QmWUk6bXnLaghS2riF3GTFEeURCzgYFMA5woa6AsgPwEgc\"]},\"lib/eas-contracts/contracts/IEAS.sol\":{\"keccak256\":\"0xdad0674defce04905dc7935f2756d6c477a6e876c0b1b7094b112a862f164c12\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://49e448c26c08952df034692d2ab3519dd40a1ebbeae4ce68b294567441933880\",\"dweb:/ipfs/QmWHcudjskUSCjgqsNWE65LVfWvcYB2vBn8RB1SmzvRLNR\"]},\"lib/eas-contracts/contracts/ISchemaRegistry.sol\":{\"keccak256\":\"0xea97dcd36a0c422169cbaac06698249e199049b627c16bff93fb8ab829058754\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://d453a929ef64a69cd31195ec2ee5ed1193bfa29f633e13c960e92154c37ad158\",\"dweb:/ipfs/QmXs1Z3njbHs2EMgHonrZDfcwdog4kozHY5tYNrhZK5yqz\"]},\"lib/eas-contracts/contracts/ISemver.sol\":{\"keccak256\":\"0x04a67939b4e1a8d0a51101b8f69f8882930bbdc66319f38023828625b5d1ff18\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://3dd543fa0e33cef1ea757627f9c2a10a66ee1ce17aa9087f437c5b53a903c7f0\",\"dweb:/ipfs/QmXsy6UsGBzF9zPCCjmiwPpCcX3tHqU13TmR67B69tKnR6\"]},\"lib/eas-contracts/contracts/Semver.sol\":{\"keccak256\":\"0x4f23442d048661b6aaa188ddc16b69cb310c2e44066b3852026afcb4201d61a9\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://30c36e580cd93d9acb13e1a11e833946a8bd0bd2a8d1b2be049f0d96e0989808\",\"dweb:/ipfs/QmXmQTxKjSrUWutafQsqkbGufXqtzxuDAiMMJjXCHXiEqh\"]},\"lib/eas-contracts/contracts/resolver/ISchemaResolver.sol\":{\"keccak256\":\"0xb7d1961ed928c620cddf35c2bf46845b10828bc5d73145214630202ed355b6bb\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://cf1cabacfb15c9bace8280b540b52e5aa440e1b4eba675f9782c34ce0f03902f\",\"dweb:/ipfs/QmakYcK4xbrijzvoaBCmBJK6HeaBqbXxWKtDQ1z62aXwCR\"]},\"lib/eas-contracts/contracts/resolver/SchemaResolver.sol\":{\"keccak256\":\"0x385d8c0edbdc96af15cf8f22333183162561cbf7d3fb0df95287741e59899983\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://ff7e8a17f69dcb7ddc937446e868d34baea61bbe249a8f5d8be486ab93001828\",\"dweb:/ipfs/QmUz9i7ViNK9kUWHeJRtE44HmpbxBDGJBjyec2aPD6Nn3Q\"]},\"lib/openzeppelin-contracts/contracts/utils/Bytes.sol\":{\"keccak256\":\"0x8140d608316521b1fd71167c3b708ebb8659da070723fc8807609553b296ee33\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://a7bf7db66869ba1e945a0390b85da2f6afc7e42a4735ca918d0d56ac90c50147\",\"dweb:/ipfs/QmRmNyhpBpgzSdQqLtrQCYE7H7eLnVVxh2Yy4YMrySR8AR\"]},\"lib/openzeppelin-contracts/contracts/utils/Panic.sol\":{\"keccak256\":\"0xf7fe324703a64fc51702311dc51562d5cb1497734f074e4f483bfb6717572d7a\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://c6a5ff4f9fd8649b7ee20800b7fa387d3465bd77cf20c2d1068cd5c98e1ed57a\",\"dweb:/ipfs/QmVSaVJf9FXFhdYEYeCEfjMVHrxDh5qL4CGkxdMWpQCrqG\"]},\"lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol\":{\"keccak256\":\"0xa516cbf1c7d15d3517c2d668601ce016c54395bf5171918a14e2686977465f53\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://1e1d079e8edfb58efd23a311e315a4807b01b5d1cf153f8fa2d0608b9dec3e99\",\"dweb:/ipfs/QmTBExeX2SDTkn5xbk5ssbYSx7VqRp9H4Ux1CY4uQM4b9N\"]},\"lib/openzeppelin-contracts/contracts/utils/StorageSlot.sol\":{\"keccak256\":\"0xcf74f855663ce2ae00ed8352666b7935f6cddea2932fdf2c3ecd30a9b1cd0e97\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://9f660b1f351b757dfe01438e59888f31f33ded3afcf5cb5b0d9bf9aa6f320a8b\",\"dweb:/ipfs/QmarDJ5hZEgBtCmmrVzEZWjub9769eD686jmzb2XpSU1cM\"]},\"lib/openzeppelin-contracts/contracts/utils/Strings.sol\":{\"keccak256\":\"0x36d1750bf1aa5fee9c52adb2f7857ab652daca722fc05dff533b364f67a1139a\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://2e5e7052539b7849d02f3ce25acc1dce29373c11cfae9f0bc918c54b780c549a\",\"dweb:/ipfs/QmRGE32xNkMTo6i4pHHMxjpiu77yPwnTA25SFngw2NXJys\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/ERC165.sol\":{\"keccak256\":\"0x2d9dc2fe26180f74c11c13663647d38e259e45f95eb88f57b61d2160b0109d3e\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://81233d1f98060113d9922180bb0f14f8335856fe9f339134b09335e9f678c377\",\"dweb:/ipfs/QmWh6R35SarhAn4z2wH8SU456jJSYL2FgucfTFgbHJJN4E\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol\":{\"keccak256\":\"0x8891738ffe910f0cf2da09566928589bf5d63f4524dd734fd9cedbac3274dd5c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://971f954442df5c2ef5b5ebf1eb245d7105d9fbacc7386ee5c796df1d45b21617\",\"dweb:/ipfs/QmadRjHbkicwqwwh61raUEapaVEtaLMcYbQZWs9gUkgj3u\"]},\"lib/openzeppelin-contracts/contracts/utils/math/Math.sol\":{\"keccak256\":\"0x09e3f1c72d4c5cbe8e2644ab7313f8f7177533ae2f4c24cdcbbeaf520a73734c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://93208401215d539fa2d81626b207c1f611def7883d0e447b3b5969ebaa7b3c2c\",\"dweb:/ipfs/QmXPxDnQPx8LAweX5ZJqEcwkvs59kP4c64VVDG1Jjq1mef\"]},\"lib/openzeppelin-contracts/contracts/utils/math/SafeCast.sol\":{\"keccak256\":\"0x195533c86d0ef72bcc06456a4f66a9b941f38eb403739b00f21fd7c1abd1ae54\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://b1d578337048cad08c1c03041cca5978eff5428aa130c781b271ad9e5566e1f8\",\"dweb:/ipfs/QmPFKL2r9CBsMwmUqqdcFPfHZB2qcs9g1HDrPxzWSxomvy\"]},\"lib/openzeppelin-contracts/contracts/utils/math/SignedMath.sol\":{\"keccak256\":\"0xb1970fac7b64e6c09611e6691791e848d5e3fe410fa5899e7df2e0afd77a99e3\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://db5fbb3dddd8b7047465b62575d96231ba8a2774d37fb4737fbf23340fabbb03\",\"dweb:/ipfs/QmVUSvooZKEdEdap619tcJjTLcAuH6QBdZqAzWwnAXZAWJ\"]},\"src/BaseArbiter.sol\":{\"keccak256\":\"0x27fa97834bcd6e592f3b534e64859b208c688363d33fb9b62436d009ffff3ed1\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://b61ac6195ae644325adf77fdb301651cddfca4b63d9db5123ee075869f3784aa\",\"dweb:/ipfs/QmYRu5hER8gaMjqyY5bDV9EAwVN12CbS3Z2bW8dLp7sPSE\"]},\"src/BaseAttester.sol\":{\"keccak256\":\"0x12339a862aa0571244f4a0c2dae1a7bcc1734717474dbf0d69b63886987d1f99\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://d40e983dece581ecb49a1a01bc87c66e86f8c954cc442a02151ec427d680682d\",\"dweb:/ipfs/QmVA7Tqk1KaYhrZpxWx3cdsjUoxsRaoBjJX8k6nCSEk8En\"]},\"src/BaseEscrowObligation.sol\":{\"keccak256\":\"0x49717032f4edbbfd52bf160a99b7b39f726e8a2f968ed4b261ee31b1622a22ac\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://1aba86a5094f4be28de1c5782087aff65c6d0bbc8ab124501e0677b5cab843f2\",\"dweb:/ipfs/QmXfo8c532ALhAUC9iae2mrSWLmDTSABunMJP2iU7PpKek\"]},\"src/BaseObligation.sol\":{\"keccak256\":\"0xf00b1317dd9203ea59e8da6c0bb23267b50ecb2751cd11b26a6330d1e596eb7b\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://5b9762a2ba2251c6ae9d23aa3ba49a8124f3348ac13c9271b8b9ada438dff475\",\"dweb:/ipfs/QmeBZUvNjNyC7W1hb1PKQq8CawC5ULWX9KXgJjH37wvPGH\"]},\"src/IArbiter.sol\":{\"keccak256\":\"0x00f3f5d8460c738eff4a776cf309efe38342fcc951abfe97d1c2e285acb1e330\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://7201a176f3d5c3d01ca13bbcd9ef5587effe8fabf20e0b8f81f2d6ee362269b9\",\"dweb:/ipfs/QmXn9aSvoGPQuNTxe3mM47RNQ1bfYCEczQCYsDDM9ohc8M\"]},\"src/IEscrow.sol\":{\"keccak256\":\"0x8803bb72e285722a5e90f08046cfee7d37acc6cf83c13a5074cfb0740e316a45\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://965024e29be08418fd9acef578b5253af5fb0d39227c291298d83dae5d7ffd01\",\"dweb:/ipfs/QmPh2h21EC6L4aWauvk5cFzc4x3Xf4f1brxyrgxeKUuWEs\"]},\"src/libraries/ArbiterUtils.sol\":{\"keccak256\":\"0xb87e2bfb9c7292daf6426fbedc09c8683b92841d1b92e7359c0ff94d42be632f\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://3acf498c3c59891d76db768ea57d8f7f6b4010dcbaf44a5f93d95d72f0b12441\",\"dweb:/ipfs/QmVbkioM8dWwYxqatm1dyo9PRFNZ6c7Kbang7pozbnyS7j\"]},\"src/libraries/SchemaRegistryUtils.sol\":{\"keccak256\":\"0x81e4728ad79515866f28175a00a512afd2f7010bd109ae221defb29a87430cd0\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://4edac7284c764f1236b5875ed00f357f0e30aecc5006c88afe220bef60b541d3\",\"dweb:/ipfs/QmXj8oLa1RXMgHCXtgdbriVqQFgX6rjnPNbmQpwpK2YXsK\"]},\"src/obligations/escrow/hook-based/HooksEscrowObligation.sol\":{\"keccak256\":\"0x12ed636600d518e8355da390193e4bd8dcb0b79b06b3542e4b7d093700c005ce\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://1d7d76abe0a404f210974b655afbdba05aae400e133054887d1a34c4e3f147d8\",\"dweb:/ipfs/QmfEpHNaBPxSSX2NUh6fyhXMYroBnfrmkHnHaKLqYoMfgf\"]},\"src/obligations/escrow/hook-based/IEscrowHook.sol\":{\"keccak256\":\"0xe4c07cf45e405453c3c561471444ac84aff687597dd70a7cea5ea2053b6f6d10\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://7e6a02ea0dadcdf5819f0c37f07c06b3c7a9428cdbeac6f7d6b514032fe331e4\",\"dweb:/ipfs/QmQhB7msNcUcXEJLUv35JyKsgpfZsXPvQhpEdPEbDCwSX3\"]}},\"version\":1}",
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
          "inputs": [],
          "type": "error",
          "name": "ArrayLengthMismatch"
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
          "inputs": [
            {
              "internalType": "uint256",
              "name": "provided",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "max",
              "type": "uint256"
            }
          ],
          "type": "error",
          "name": "TooManyHooks"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "UnauthorizedCall"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "expected",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "received",
              "type": "uint256"
            }
          ],
          "type": "error",
          "name": "ValueMismatch"
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
          "name": "MAX_HOOKS",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
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
              "internalType": "struct HooksEscrowObligation.ObligationData",
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
                  "internalType": "address[]",
                  "name": "hooks",
                  "type": "address[]"
                },
                {
                  "internalType": "bytes[]",
                  "name": "hookDatas",
                  "type": "bytes[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "values",
                  "type": "uint256[]"
                }
              ]
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "struct HooksEscrowObligation.ObligationData",
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
                  "internalType": "address[]",
                  "name": "hooks",
                  "type": "address[]"
                },
                {
                  "internalType": "bytes[]",
                  "name": "hookDatas",
                  "type": "bytes[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "values",
                  "type": "uint256[]"
                }
              ]
            },
            {
              "internalType": "uint64",
              "name": "expirationTime",
              "type": "uint64"
            }
          ],
          "stateMutability": "payable",
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
              "internalType": "struct HooksEscrowObligation.ObligationData",
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
                  "internalType": "address[]",
                  "name": "hooks",
                  "type": "address[]"
                },
                {
                  "internalType": "bytes[]",
                  "name": "hookDatas",
                  "type": "bytes[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "values",
                  "type": "uint256[]"
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
          "stateMutability": "payable",
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
              "internalType": "struct HooksEscrowObligation.ObligationData",
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
                  "internalType": "address[]",
                  "name": "hooks",
                  "type": "address[]"
                },
                {
                  "internalType": "bytes[]",
                  "name": "hookDatas",
                  "type": "bytes[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "values",
                  "type": "uint256[]"
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
          "collect(bytes32,bytes32)": {
            "notice": "Collects an escrow using a fulfillment attestation."
          },
          "decodeCondition(bytes)": {
            "notice": "Decodes an escrow attestation's condition into arbiter and demand data."
          },
          "doObligationRaw(bytes,uint64,bytes32)": {
            "notice": "Creates an obligation attestation from pre-encoded data."
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
        "src/obligations/escrow/hook-based/HooksEscrowObligation.sol": "HooksEscrowObligation"
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
      "src/obligations/escrow/hook-based/HooksEscrowObligation.sol": {
        "keccak256": "0x12ed636600d518e8355da390193e4bd8dcb0b79b06b3542e4b7d093700c005ce",
        "urls": [
          "bzz-raw://1d7d76abe0a404f210974b655afbdba05aae400e133054887d1a34c4e3f147d8",
          "dweb:/ipfs/QmfEpHNaBPxSSX2NUh6fyhXMYroBnfrmkHnHaKLqYoMfgf"
        ],
        "license": "UNLICENSED"
      },
      "src/obligations/escrow/hook-based/IEscrowHook.sol": {
        "keccak256": "0xe4c07cf45e405453c3c561471444ac84aff687597dd70a7cea5ea2053b6f6d10",
        "urls": [
          "bzz-raw://7e6a02ea0dadcdf5819f0c37f07c06b3c7a9428cdbeac6f7d6b514032fe331e4",
          "dweb:/ipfs/QmQhB7msNcUcXEJLUv35JyKsgpfZsXPvQhpEdPEbDCwSX3"
        ],
        "license": "UNLICENSED"
      }
    },
    "version": 1
  },
  "id": 136
} as const;
