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
          "internalType": "struct NativeTokenEscrowObligation.ObligationData",
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
              "name": "amount",
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
      "name": "doObligation",
      "inputs": [
        {
          "name": "data",
          "type": "tuple",
          "internalType": "struct NativeTokenEscrowObligation.ObligationData",
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
              "name": "amount",
              "type": "uint256",
              "internalType": "uint256"
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
          "internalType": "struct NativeTokenEscrowObligation.ObligationData",
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
              "name": "amount",
              "type": "uint256",
              "internalType": "uint256"
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
          "internalType": "struct NativeTokenEscrowObligation.ObligationData",
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
              "name": "amount",
              "type": "uint256",
              "internalType": "uint256"
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
      "name": "IncorrectPayment",
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
      "name": "NativeTokenTransferFailed",
      "inputs": [
        {
          "name": "to",
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
    "object": "0x61018080604052346101c9576040816122e7803803809161002082856101cd565b8339810103126101c9578051906001600160a01b038216908183036101c957602001516001600160a01b03811691908281036101c957604051916100656060846101cd565b602d83527f6164647265737320617262697465722c2062797465732064656d616e642c207560208401526c1a5b9d0c8d4d88185b5bdd5b9d609a1b60408401526001608052600360a0525f60c052156101ba57836100d59460e052610120526101005260016101605230916102e8565b6101405260017f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f0055604051611e2390816104c4823960805181610f8d015260a05181610fb8015260c05181610fe3015260e05181611a5701526101005181610e040152610120518181816102a3015281816105a30152818161083101528181610a3d015281816119420152611c4601526101405181818161013c015281816105e301528181610718015281816109ee01528181610dd201528181610f4b015281816115c601526118220152610160518181816106860152818161075a015261186b0152f35b6341bc07ff60e11b5f5260045ffd5b5f80fd5b601f909101601f19168101906001600160401b038211908210176101f057604052565b634e487b7160e01b5f52604160045260245ffd5b6020818303126101c9578051906001600160401b0382116101c95701906080828203126101c95760405191608083016001600160401b038111848210176101f0576040528051835260208101516001600160a01b03811681036101c9576020840152604081015180151581036101c95760408401526060810151906001600160401b0382116101c9570181601f820112156101c9578051906001600160401b0382116101f057604051926102c2601f8401601f1916602001856101cd565b828452602083830101116101c957815f9260208093018386015e83010152606082015290565b929160405190602082018351926103326015602083818901978089885e810160018060601b03198860601b1683820152600160f81b60348201520301600a198101845201826101cd565b5190206040516351753e3760e11b81526004810182905290956001600160a01b031693905f81602481885afa80156104435787915f916104a9575b5051146104a3579060846020926040519485938492630c1af44f60e31b8452606060048501525180928160648601528585015e5f84838501015260018060a01b0316602483015260016044830152601f801991011681010301815f865af15f918161046f575b5061044e57505f602491604051928380926351753e3760e11b82528760048301525afa80156104435783915f91610421575b50511461041f5750639e6113d560e01b5f5260045260245ffd5b565b61043d91503d805f833e61043581836101cd565b810190610204565b5f610405565b6040513d5f823e3d90fd5b9192809150820361045d575090565b639e6113d560e01b5f5260045260245ffd5b9091506020813d60201161049b575b8161048b602093836101cd565b810103126101c95751905f6103d3565b3d915061047e565b50505050565b6104bd91503d805f833e61043581836101cd565b5f61036d56fe6080806040526004361015610029575b50361561001a575f80fd5b631574f9f360e01b5f5260045ffd5b5f905f3560e01c90816301ffc9a7146110705750806354fd4d5014610f6e5780635bf2f20d14610f345780636b122fe014610d93578063760bd11814610d3557806385514c5114610cbd57806388e5b2d914610b865780638da3721a14610ba557806391db0b7e14610b8657806396afb365146109bf5780639d76101d1461094f578063b3b902d4146106ab578063b587a5eb1461066e578063c6ec507014610562578063c93844be1461049c578063ce46e04614610480578063e49617e11461045b578063e60c35051461045b5763ea6ec49c0361000f57346104585760403660031901126104585760243590600435610122611aaf565b61012b81611c20565b61013484611c20565b9060208101517f00000000000000000000000000000000000000000000000000000000000000008091036104495761016b82611cce565b156104495761017e610120830151611474565b60a0850190815185510361043a5761019586611cce565b1561043a57610120928660209360c093610275895191610263604051998a98899788976346d1b90d60e11b8952606060048a0152815160648a01528c82015160848a01526001600160401b0360408301511660a48a01526001600160401b0360608301511660c48a01526001600160401b0360808301511660e48a015251610104890152019d8e60018060a01b0390511661012488015260018060a01b0360e082015116610144880152610100810151151561016488015201516101406101848701526101a48601906110ee565b848103600319016024860152906110ee565b604483019190915203916001600160a01b03165afa90811561042f5786916103f5575b50156103e6576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031691906102d68161115d565b858152866020820152604051916102ec8361115d565b82526020820152813b156103e257604051634692626760e01b8152815160048201526020918201518051602483015290910151604482015290859081908390606490829084905af191826103c9575b50506103555763614cf93960e01b84526004839052602484fd5b917ff96e77bc177ae8e2ff25185e7c6d85f8ba97c8bdd9d46933aac70a7a33edf6c09461038f6103c59460018060a01b0385511690611d40565b92516040519687966001600160a01b03909216939180a460015f516020611dce5f395f51905f52556020835260208301906110ee565b0390f35b816103d3916111ae565b6103de57845f61033b565b8480fd5b8580fd5b630ebe58ef60e11b8552600485fd5b90506020813d602011610427575b81610410602093836111ae565b810103126103e25761042190611394565b5f610298565b3d9150610403565b6040513d88823e3d90fd5b630ebe58ef60e11b8852600488fd5b63629cd40b60e11b8552600485fd5b80fd5b602061047661046936611360565b610471611a55565b611a96565b6040519015158152f35b5034610458578060031936011261045857602090604051908152f35b5034610458576020366003190112610458576004356001600160401b03811161055a576104cd9036906004016112fc565b6104d892919261166d565b5082019160208184031261055a578035906001600160401b03821161055e57019160608382031261055a576040519161051083611178565b61051984611268565b83526020840135906001600160401b0382116104585750926105426040926103c5958301611220565b60208401520135604082015260405191829182611329565b5080fd5b8280fd5b50346104585760203660031901126104585761057c61166d565b50610585611ae7565b506040516328c44a9960e21b815260048035908201529080826024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa91821561066157819261063d575b5060208201517f00000000000000000000000000000000000000000000000000000000000000000361062e576103c561062261012084015160208082518301019101611405565b60405191829182611329565b635527981560e11b8152600490fd5b61065a9192503d8084833e61065281836111ae565b810190611b45565b905f6105db565b50604051903d90823e3d90fd5b503461045857806003193601126104585760206040517f000000000000000000000000000000000000000000000000000000000000000015158152f35b506060366003190112610458576004356001600160401b03811161055a576106d79036906004016112fc565b916106ef6106e361123e565b926044359436916111ea565b6106f7611aaf565b604061070c6020835184010160208401611405565b015180340361093957507f0000000000000000000000000000000000000000000000000000000000000000936001600160401b036040519461074d86611193565b33865216908160208601527f00000000000000000000000000000000000000000000000000000000000000001515918260408701528160608701528360808701528460a087015260206040516107a28161115d565b8881528181019788526040518098819263f17325e760e01b8352846004840152516024830152516040604483015260018060a01b0381511660648301526001600160401b03848201511660848301526040810151151560a4830152606081015160c483015260a0610823608083015160c060e48601526101248501906110ee565b9101516101048301520381887f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af195861561092e5785966108f9575b509160209691610120936040519361088085611141565b888552898501526001600160401b0342166040850152606084015285608084015260a08301523360c08301523060e08301526101008201520152817f8f7f2dbafd79125e808bf16a53d7fa4e17b8b6374ced76d946a45f94b7bf4d06339280a360015f516020611dce5f395f51905f5255604051908152f35b9095506020813d602011610926575b81610915602093836111ae565b810103126103de5751946020610869565b3d9150610908565b6040513d87823e3d90fd5b630d35e92160e01b835260045234602452604482fd5b50604036600319011261045857600435906001600160401b03821161045857606060031983360301126104585760206109b76109a2846109b061099061123e565b9160405193849160040187830161149d565b03601f1981018452836111ae565b33916117f9565b604051908152f35b5034610b64576020366003190112610b6457600435906109dd611aaf565b6109e682611c20565b9160208301517f0000000000000000000000000000000000000000000000000000000000000000809103610b7757606084016001600160401b0381511615610b6857516001600160401b03164210610b68576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690610a6f8161115d565b8381525f602082015260405192610a858461115d565b83526020830152803b15610b6457604051634692626760e01b815282516004820152602092830151805160248301529092015160448301525f908290606490829084905af19081610b4f575b50610ae95763614cf93960e01b825260045260249150fd5b60c083018051602094610b05916001600160a01b031690611d40565b5060018060a01b03905116907f655ef333d5efcbf5aa343f02bcd9e3539f9c9f9ee8b9cfa7d8910b1bd7e0a8326040519380a360015f516020611dce5f395f51905f525560018152f35b610b5c9193505f906111ae565b5f915f610ad1565b5f80fd5b637bf6a16f60e01b5f5260045ffd5b63629cd40b60e11b5f5260045ffd5b6020610476610b94366112ac565b92610ba0929192611a55565b61151b565b34610b64576060366003190112610b64576004356001600160401b038111610b64576101406003198236030112610b645760405190610be382611141565b8060040135825260248101356020830152610c0060448201611254565b6040830152610c1160648201611254565b6060830152610c2260848201611254565b608083015260a481013560a0830152610c3d60c48201611268565b60c0830152610c4e60e48201611268565b60e08301526101048101358015158103610b6457610100830152610124810135906001600160401b038211610b64576004610c8c9236920101611220565b6101208201526024356001600160401b038111610b6457602091610cb7610476923690600401611220565b906115bf565b6060366003190112610b64576004356001600160401b038111610b645760606003198236030112610b6457610cf061123e565b906044356001600160a01b0381168103610b6457602092610d22610d306109b79460405192839160040188830161149d565b03601f1981018352826111ae565b6117f9565b34610b64576020366003190112610b64576004356001600160401b038111610b6457610d68610d6d913690600401611220565b611474565b604080516001600160a01b0390931683526020830181905282916103c5918301906110ee565b34610b64575f366003190112610b6457606080604051610db281611112565b5f81525f60208201525f604082015201526040516351753e3760e11b81527f000000000000000000000000000000000000000000000000000000000000000060048201525f8160248160018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165afa8015610f29575f90610e79575b6060906103c5604051928392602084528051602085015260018060a01b0360208201511660408501526040810151151582850152015160808084015260a08301906110ee565b503d805f833e610e8981836111ae565b810190602081830312610b64578051906001600160401b038211610b645701608081830312610b645760405190610ebf82611112565b8051825260208101516001600160a01b0381168103610b64576020830152610ee960408201611394565b60408301526060810151906001600160401b038211610b64570182601f82011215610b6457606092816020610f20935191016113a1565b82820152610e33565b6040513d5f823e3d90fd5b34610b64575f366003190112610b645760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b34610b64575f366003190112610b64576103c5602061105c6001610fb17f000000000000000000000000000000000000000000000000000000000000000061168c565b8184610fdc7f000000000000000000000000000000000000000000000000000000000000000061168c565b81806110077f000000000000000000000000000000000000000000000000000000000000000061168c565b9260405199878b985191829101848a015e870190601760f91b83830152805192839101602183015e010190601760f91b84830152805192839101600283015e01015f838201520301601f1981018352826111ae565b6040519182916020835260208301906110ee565b34610b64576020366003190112610b64576004359063ffffffff60e01b8216809203610b64576020916346d1b90d60e11b811490811590816110b5575b505015158152f35b906110c3575b5083806110ad565b630acaa6e160e01b8114915081156110dd575b50836110bb565b6301ffc9a760e01b149050836110d6565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b608081019081106001600160401b0382111761112d57604052565b634e487b7160e01b5f52604160045260245ffd5b61014081019081106001600160401b0382111761112d57604052565b604081019081106001600160401b0382111761112d57604052565b606081019081106001600160401b0382111761112d57604052565b60c081019081106001600160401b0382111761112d57604052565b90601f801991011681019081106001600160401b0382111761112d57604052565b6001600160401b03811161112d57601f01601f191660200190565b9291926111f6826111cf565b9161120460405193846111ae565b829481845281830111610b64578281602093845f960137010152565b9080601f83011215610b645781602061123b933591016111ea565b90565b602435906001600160401b0382168203610b6457565b35906001600160401b0382168203610b6457565b35906001600160a01b0382168203610b6457565b9181601f84011215610b64578235916001600160401b038311610b64576020808501948460051b010111610b6457565b6040600319820112610b64576004356001600160401b038111610b6457816112d69160040161127c565b92909291602435906001600160401b038211610b64576112f89160040161127c565b9091565b9181601f84011215610b64578235916001600160401b038311610b645760208381860195010111610b6457565b6020815260018060a01b038251166020820152606060406113576020850151838386015260808501906110ee565b93015191015290565b6020600319820112610b6457600435906001600160401b038211610b6457610140908290036003190112610b645760040190565b51908115158203610b6457565b9291926113ad826111cf565b916113bb60405193846111ae565b829481845281830111610b64578281602093845f96015e010152565b51906001600160a01b0382168203610b6457565b9080601f83011215610b6457815161123b926020016113a1565b602081830312610b64578051906001600160401b038211610b64570190606082820312610b64576040519161143983611178565b611442816113d7565b835260208101516001600160401b038111610b64576040926114659183016113eb565b60208401520151604082015290565b6114879060208082518301019101611405565b80516020909101516001600160a01b0390911691565b602081526001600160a01b036114b283611268565b1660208201526020820135601e1983360301811215610b645782016020813591016001600160401b038211610b64578136038113610b645760a09382604092606084870152816080870152868601375f84840186015201356060830152601f01601f1916010190565b9290928184036115b0575f91345b858410156115a55781841015611591578360051b80860135908282116115825784013561013e1985360301811215610b6457611566908501611a96565b156115775760019103930192611529565b505050505050505f90565b63044044a560e21b5f5260045ffd5b634e487b7160e01b5f52603260045260245ffd5b505050505050600190565b63251f56a160e21b5f5260045ffd5b60208101517f0000000000000000000000000000000000000000000000000000000000000000036116675761160561012061161592015160208082518301019101611405565b9160208082518301019101611405565b604082015160408201511115918261164e575b8261163257505090565b6020919250810151818151910120910151602081519101201490565b805182516001600160a01b039081169116149250611628565b50505f90565b6040519061167a82611178565b5f604083828152606060208201520152565b805f9172184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b8210156117d6575b806d04ee2d6d415b85acef8100000000600a9210156117bb575b662386f26fc100008110156117a7575b6305f5e100811015611796575b612710811015611787575b6064811015611779575b101561176e575b600a60216001840193611713856111cf565b9461172160405196876111ae565b808652611730601f19916111cf565b013660208701378401015b5f1901916f181899199a1a9b1b9c1cb0b131b232b360811b8282061a835304801561176957600a909161173b565b505090565b600190910190611701565b6064600291049301926116fa565b612710600491049301926116f0565b6305f5e100600891049301926116e5565b662386f26fc10000601091049301926116d8565b6d04ee2d6d415b85acef8100000000602091049301926116c8565b506040915072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b81046116ae565b611801611aaf565b60406118166020835184010160208401611405565b0151803403611a3f57507f00000000000000000000000000000000000000000000000000000000000000006001600160401b036040519461185686611193565b60018060a01b031693848652168060208601527f00000000000000000000000000000000000000000000000000000000000000001515908160408701525f60608701528360808701525f60a087015260206040516118b38161115d565b8481528181019788526040518098819263f17325e760e01b8352846004840152516024830152516040604483015260018060a01b0381511660648301526001600160401b03848201511660848301526040810151151560a4830152606081015160c483015260a0611934608083015160c060e48601526101248501906110ee565b91015161010483015203815f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1958615610f29575f96611a03575b509061012092916040519261198e84611141565b87845260208401526001600160401b034216604084015260608301525f60808301525f60a08301528460c08301523060e08301526101008201520152817f8f7f2dbafd79125e808bf16a53d7fa4e17b8b6374ced76d946a45f94b7bf4d065f80a39060015f516020611dce5f395f51905f5255565b92919095506020833d602011611a37575b81611a21602093836111ae565b81010312610b645761012092519590919261197a565b3d9150611a14565b630d35e92160e01b5f526004523460245260445ffd5b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303611a8757565b634ca8886760e01b5f5260045ffd5b60e0013560018060a01b038116809103610b6457301490565b60025f516020611dce5f395f51905f525414611ad85760025f516020611dce5f395f51905f5255565b633ee5aeb560e01b5f5260045ffd5b60405190611af482611141565b6060610120835f81525f60208201525f60408201525f838201525f60808201525f60a08201525f60c08201525f60e08201525f6101008201520152565b51906001600160401b0382168203610b6457565b602081830312610b64578051906001600160401b038211610b64570161014081830312610b645760405191611b7983611141565b8151835260208201516020840152611b9360408301611b31565b6040840152611ba460608301611b31565b6060840152611bb560808301611b31565b608084015260a082015160a0840152611bd060c083016113d7565b60c0840152611be160e083016113d7565b60e0840152611bf36101008301611394565b6101008401526101208201516001600160401b038111610b6457611c1792016113eb565b61012082015290565b90611c29611ae7565b506040516328c44a9960e21b815260048101839052915f836024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa928315610f29575f93611cb2575b508251818115918215611ca7575b5050611c955750565b6301fb6dd160e01b5f5260045260245ffd5b14159050815f611c8c565b611cc79193503d805f833e61065281836111ae565b915f611c7e565b805115611d31576001600160401b036060820151168015159081611d26575b50611d1757608001516001600160401b0316611d0857600190565b637b6227e960e11b5f5260045ffd5b631ab7da6b60e01b5f5260045ffd5b90504210155f611ced565b635c2c7f8960e01b5f5260045ffd5b611d5a610120604092015160208082518301019101611405565b9160018060a01b031691015f8080808451865af13d15611dc8573d611d7e816111cf565b90611d8c60405192836111ae565b81525f60203d92013e5b15611db1575050604051611dab6020826111ae565b5f815290565b51906338f0620160e21b5f5260045260245260445ffd5b611d9656fe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a264697066735822122030eeb6e10b9a0c242a569076cfa0679376789549cb7d1ac9c1bb76f25702202564736f6c634300081b0033",
    "sourceMap": "693:4302:133:-:0;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;-1:-1:-1;;;693:4302:133;;;;1285:4;759:14:6;;688:1:9;783:14:6;;-1:-1:-1;807:14:6;;708:26:9;704:76;;790:10;2065:81:89;790:10:9;;;1932::89;;1952:32;;1285:4:133;1994:40:89;;2128:4;2065:81;;:::i;:::-;2044:102;;1285:4:133;1505:66:68;2365:1;693:4302:133;;;;;;;;759:14:6;693:4302:133;;;;;783:14:6;693:4302:133;;;;;807:14:6;693:4302:133;;;;;790:10:9;693:4302:133;;;;;1952:32:89;693:4302:133;;;;;1932:10:89;693:4302:133;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2044:102:89;693:4302:133;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1994:40:89;693:4302:133;;;;;;;;;;;;;;;;704:76:9;757:12;;;-1:-1:-1;757:12:9;;-1:-1:-1;757:12:9;693:4302:133;-1:-1:-1;693:4302:133;;;;;;;-1:-1:-1;;693:4302:133;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;:::o;:::-;;;;-1:-1:-1;693:4302:133;;;;;-1:-1:-1;693:4302:133;;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;-1:-1:-1;;693:4302:133;;;;;:::i;:::-;;;;;;;;;;;;;-1:-1:-1;693:4302:133;;;;;;;;;;;;;;;;;;:::o;597:755:125:-;;;693:4302:133;;1602:45:125;;;;693:4302:133;;;1602:45:125;693:4302:133;1602:45:125;693:4302:133;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1602:45:125;;;;;;;;;;;:::i;:::-;693:4302:133;1592:56:125;;693:4302:133;;-1:-1:-1;;;880:29:125;;;;;693:4302:133;;;1592:56:125;;-1:-1:-1;;;;;693:4302:133;;;-1:-1:-1;693:4302:133;880:29:125;693:4302:133;;880:29:125;;;;;;;;-1:-1:-1;880:29:125;;;597:755;693:4302:133;;923:19:125;919:35;;693:4302:133;;1602:45:125;693:4302:133;;;;;;;;;;;969:52:125;;693:4302:133;880:29:125;969:52;;693:4302:133;;;;;;;;;;;;;-1:-1:-1;693:4302:133;;;;;;;;;;;;880:29:125;693:4302:133;;;1285:4;693:4302;;;;;;;;;;;;969:52:125;;;-1:-1:-1;969:52:125;;;-1:-1:-1;;969:52:125;;;597:755;-1:-1:-1;965:381:125;;693:4302:133;-1:-1:-1;880:29:125;693:4302:133;;;;;;;;;;1207:29:125;;;880;1207;;693:4302:133;1207:29:125;;;;;;;;-1:-1:-1;1207:29:125;;;965:381;693:4302:133;;1254:19:125;1250:35;;1101:29;;;;-1:-1:-1;1306:29:125;880;693:4302:133;880:29:125;-1:-1:-1;1306:29:125;1250:35;1275:10::o;1207:29::-;;;;;;-1:-1:-1;1207:29:125;;;;;;:::i;:::-;;;;;:::i;:::-;;;;;693:4302:133;;;-1:-1:-1;693:4302:133;;;;;965:381:125;1072:20;;;;;;;1068:62;;1144:20;;:::o;1068:62::-;1101:29;;;-1:-1:-1;1101:29:125;880;693:4302:133;880:29:125;-1:-1:-1;1101:29:125;969:52;;;;1602:45;969:52;;1602:45;969:52;;;;;;1602:45;969:52;;;:::i;:::-;;;693:4302:133;;;;;969:52:125;;;;;;;-1:-1:-1;969:52:125;;919:35;944:10;;;;:::o;880:29::-;;;;;;-1:-1:-1;880:29:125;;;;;;:::i;:::-;;;",
    "linkReferences": {}
  },
  "deployedBytecode": {
    "object": "0x6080806040526004361015610029575b50361561001a575f80fd5b631574f9f360e01b5f5260045ffd5b5f905f3560e01c90816301ffc9a7146110705750806354fd4d5014610f6e5780635bf2f20d14610f345780636b122fe014610d93578063760bd11814610d3557806385514c5114610cbd57806388e5b2d914610b865780638da3721a14610ba557806391db0b7e14610b8657806396afb365146109bf5780639d76101d1461094f578063b3b902d4146106ab578063b587a5eb1461066e578063c6ec507014610562578063c93844be1461049c578063ce46e04614610480578063e49617e11461045b578063e60c35051461045b5763ea6ec49c0361000f57346104585760403660031901126104585760243590600435610122611aaf565b61012b81611c20565b61013484611c20565b9060208101517f00000000000000000000000000000000000000000000000000000000000000008091036104495761016b82611cce565b156104495761017e610120830151611474565b60a0850190815185510361043a5761019586611cce565b1561043a57610120928660209360c093610275895191610263604051998a98899788976346d1b90d60e11b8952606060048a0152815160648a01528c82015160848a01526001600160401b0360408301511660a48a01526001600160401b0360608301511660c48a01526001600160401b0360808301511660e48a015251610104890152019d8e60018060a01b0390511661012488015260018060a01b0360e082015116610144880152610100810151151561016488015201516101406101848701526101a48601906110ee565b848103600319016024860152906110ee565b604483019190915203916001600160a01b03165afa90811561042f5786916103f5575b50156103e6576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031691906102d68161115d565b858152866020820152604051916102ec8361115d565b82526020820152813b156103e257604051634692626760e01b8152815160048201526020918201518051602483015290910151604482015290859081908390606490829084905af191826103c9575b50506103555763614cf93960e01b84526004839052602484fd5b917ff96e77bc177ae8e2ff25185e7c6d85f8ba97c8bdd9d46933aac70a7a33edf6c09461038f6103c59460018060a01b0385511690611d40565b92516040519687966001600160a01b03909216939180a460015f516020611dce5f395f51905f52556020835260208301906110ee565b0390f35b816103d3916111ae565b6103de57845f61033b565b8480fd5b8580fd5b630ebe58ef60e11b8552600485fd5b90506020813d602011610427575b81610410602093836111ae565b810103126103e25761042190611394565b5f610298565b3d9150610403565b6040513d88823e3d90fd5b630ebe58ef60e11b8852600488fd5b63629cd40b60e11b8552600485fd5b80fd5b602061047661046936611360565b610471611a55565b611a96565b6040519015158152f35b5034610458578060031936011261045857602090604051908152f35b5034610458576020366003190112610458576004356001600160401b03811161055a576104cd9036906004016112fc565b6104d892919261166d565b5082019160208184031261055a578035906001600160401b03821161055e57019160608382031261055a576040519161051083611178565b61051984611268565b83526020840135906001600160401b0382116104585750926105426040926103c5958301611220565b60208401520135604082015260405191829182611329565b5080fd5b8280fd5b50346104585760203660031901126104585761057c61166d565b50610585611ae7565b506040516328c44a9960e21b815260048035908201529080826024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa91821561066157819261063d575b5060208201517f00000000000000000000000000000000000000000000000000000000000000000361062e576103c561062261012084015160208082518301019101611405565b60405191829182611329565b635527981560e11b8152600490fd5b61065a9192503d8084833e61065281836111ae565b810190611b45565b905f6105db565b50604051903d90823e3d90fd5b503461045857806003193601126104585760206040517f000000000000000000000000000000000000000000000000000000000000000015158152f35b506060366003190112610458576004356001600160401b03811161055a576106d79036906004016112fc565b916106ef6106e361123e565b926044359436916111ea565b6106f7611aaf565b604061070c6020835184010160208401611405565b015180340361093957507f0000000000000000000000000000000000000000000000000000000000000000936001600160401b036040519461074d86611193565b33865216908160208601527f00000000000000000000000000000000000000000000000000000000000000001515918260408701528160608701528360808701528460a087015260206040516107a28161115d565b8881528181019788526040518098819263f17325e760e01b8352846004840152516024830152516040604483015260018060a01b0381511660648301526001600160401b03848201511660848301526040810151151560a4830152606081015160c483015260a0610823608083015160c060e48601526101248501906110ee565b9101516101048301520381887f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af195861561092e5785966108f9575b509160209691610120936040519361088085611141565b888552898501526001600160401b0342166040850152606084015285608084015260a08301523360c08301523060e08301526101008201520152817f8f7f2dbafd79125e808bf16a53d7fa4e17b8b6374ced76d946a45f94b7bf4d06339280a360015f516020611dce5f395f51905f5255604051908152f35b9095506020813d602011610926575b81610915602093836111ae565b810103126103de5751946020610869565b3d9150610908565b6040513d87823e3d90fd5b630d35e92160e01b835260045234602452604482fd5b50604036600319011261045857600435906001600160401b03821161045857606060031983360301126104585760206109b76109a2846109b061099061123e565b9160405193849160040187830161149d565b03601f1981018452836111ae565b33916117f9565b604051908152f35b5034610b64576020366003190112610b6457600435906109dd611aaf565b6109e682611c20565b9160208301517f0000000000000000000000000000000000000000000000000000000000000000809103610b7757606084016001600160401b0381511615610b6857516001600160401b03164210610b68576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690610a6f8161115d565b8381525f602082015260405192610a858461115d565b83526020830152803b15610b6457604051634692626760e01b815282516004820152602092830151805160248301529092015160448301525f908290606490829084905af19081610b4f575b50610ae95763614cf93960e01b825260045260249150fd5b60c083018051602094610b05916001600160a01b031690611d40565b5060018060a01b03905116907f655ef333d5efcbf5aa343f02bcd9e3539f9c9f9ee8b9cfa7d8910b1bd7e0a8326040519380a360015f516020611dce5f395f51905f525560018152f35b610b5c9193505f906111ae565b5f915f610ad1565b5f80fd5b637bf6a16f60e01b5f5260045ffd5b63629cd40b60e11b5f5260045ffd5b6020610476610b94366112ac565b92610ba0929192611a55565b61151b565b34610b64576060366003190112610b64576004356001600160401b038111610b64576101406003198236030112610b645760405190610be382611141565b8060040135825260248101356020830152610c0060448201611254565b6040830152610c1160648201611254565b6060830152610c2260848201611254565b608083015260a481013560a0830152610c3d60c48201611268565b60c0830152610c4e60e48201611268565b60e08301526101048101358015158103610b6457610100830152610124810135906001600160401b038211610b64576004610c8c9236920101611220565b6101208201526024356001600160401b038111610b6457602091610cb7610476923690600401611220565b906115bf565b6060366003190112610b64576004356001600160401b038111610b645760606003198236030112610b6457610cf061123e565b906044356001600160a01b0381168103610b6457602092610d22610d306109b79460405192839160040188830161149d565b03601f1981018352826111ae565b6117f9565b34610b64576020366003190112610b64576004356001600160401b038111610b6457610d68610d6d913690600401611220565b611474565b604080516001600160a01b0390931683526020830181905282916103c5918301906110ee565b34610b64575f366003190112610b6457606080604051610db281611112565b5f81525f60208201525f604082015201526040516351753e3760e11b81527f000000000000000000000000000000000000000000000000000000000000000060048201525f8160248160018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165afa8015610f29575f90610e79575b6060906103c5604051928392602084528051602085015260018060a01b0360208201511660408501526040810151151582850152015160808084015260a08301906110ee565b503d805f833e610e8981836111ae565b810190602081830312610b64578051906001600160401b038211610b645701608081830312610b645760405190610ebf82611112565b8051825260208101516001600160a01b0381168103610b64576020830152610ee960408201611394565b60408301526060810151906001600160401b038211610b64570182601f82011215610b6457606092816020610f20935191016113a1565b82820152610e33565b6040513d5f823e3d90fd5b34610b64575f366003190112610b645760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b34610b64575f366003190112610b64576103c5602061105c6001610fb17f000000000000000000000000000000000000000000000000000000000000000061168c565b8184610fdc7f000000000000000000000000000000000000000000000000000000000000000061168c565b81806110077f000000000000000000000000000000000000000000000000000000000000000061168c565b9260405199878b985191829101848a015e870190601760f91b83830152805192839101602183015e010190601760f91b84830152805192839101600283015e01015f838201520301601f1981018352826111ae565b6040519182916020835260208301906110ee565b34610b64576020366003190112610b64576004359063ffffffff60e01b8216809203610b64576020916346d1b90d60e11b811490811590816110b5575b505015158152f35b906110c3575b5083806110ad565b630acaa6e160e01b8114915081156110dd575b50836110bb565b6301ffc9a760e01b149050836110d6565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b608081019081106001600160401b0382111761112d57604052565b634e487b7160e01b5f52604160045260245ffd5b61014081019081106001600160401b0382111761112d57604052565b604081019081106001600160401b0382111761112d57604052565b606081019081106001600160401b0382111761112d57604052565b60c081019081106001600160401b0382111761112d57604052565b90601f801991011681019081106001600160401b0382111761112d57604052565b6001600160401b03811161112d57601f01601f191660200190565b9291926111f6826111cf565b9161120460405193846111ae565b829481845281830111610b64578281602093845f960137010152565b9080601f83011215610b645781602061123b933591016111ea565b90565b602435906001600160401b0382168203610b6457565b35906001600160401b0382168203610b6457565b35906001600160a01b0382168203610b6457565b9181601f84011215610b64578235916001600160401b038311610b64576020808501948460051b010111610b6457565b6040600319820112610b64576004356001600160401b038111610b6457816112d69160040161127c565b92909291602435906001600160401b038211610b64576112f89160040161127c565b9091565b9181601f84011215610b64578235916001600160401b038311610b645760208381860195010111610b6457565b6020815260018060a01b038251166020820152606060406113576020850151838386015260808501906110ee565b93015191015290565b6020600319820112610b6457600435906001600160401b038211610b6457610140908290036003190112610b645760040190565b51908115158203610b6457565b9291926113ad826111cf565b916113bb60405193846111ae565b829481845281830111610b64578281602093845f96015e010152565b51906001600160a01b0382168203610b6457565b9080601f83011215610b6457815161123b926020016113a1565b602081830312610b64578051906001600160401b038211610b64570190606082820312610b64576040519161143983611178565b611442816113d7565b835260208101516001600160401b038111610b64576040926114659183016113eb565b60208401520151604082015290565b6114879060208082518301019101611405565b80516020909101516001600160a01b0390911691565b602081526001600160a01b036114b283611268565b1660208201526020820135601e1983360301811215610b645782016020813591016001600160401b038211610b64578136038113610b645760a09382604092606084870152816080870152868601375f84840186015201356060830152601f01601f1916010190565b9290928184036115b0575f91345b858410156115a55781841015611591578360051b80860135908282116115825784013561013e1985360301811215610b6457611566908501611a96565b156115775760019103930192611529565b505050505050505f90565b63044044a560e21b5f5260045ffd5b634e487b7160e01b5f52603260045260245ffd5b505050505050600190565b63251f56a160e21b5f5260045ffd5b60208101517f0000000000000000000000000000000000000000000000000000000000000000036116675761160561012061161592015160208082518301019101611405565b9160208082518301019101611405565b604082015160408201511115918261164e575b8261163257505090565b6020919250810151818151910120910151602081519101201490565b805182516001600160a01b039081169116149250611628565b50505f90565b6040519061167a82611178565b5f604083828152606060208201520152565b805f9172184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b8210156117d6575b806d04ee2d6d415b85acef8100000000600a9210156117bb575b662386f26fc100008110156117a7575b6305f5e100811015611796575b612710811015611787575b6064811015611779575b101561176e575b600a60216001840193611713856111cf565b9461172160405196876111ae565b808652611730601f19916111cf565b013660208701378401015b5f1901916f181899199a1a9b1b9c1cb0b131b232b360811b8282061a835304801561176957600a909161173b565b505090565b600190910190611701565b6064600291049301926116fa565b612710600491049301926116f0565b6305f5e100600891049301926116e5565b662386f26fc10000601091049301926116d8565b6d04ee2d6d415b85acef8100000000602091049301926116c8565b506040915072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b81046116ae565b611801611aaf565b60406118166020835184010160208401611405565b0151803403611a3f57507f00000000000000000000000000000000000000000000000000000000000000006001600160401b036040519461185686611193565b60018060a01b031693848652168060208601527f00000000000000000000000000000000000000000000000000000000000000001515908160408701525f60608701528360808701525f60a087015260206040516118b38161115d565b8481528181019788526040518098819263f17325e760e01b8352846004840152516024830152516040604483015260018060a01b0381511660648301526001600160401b03848201511660848301526040810151151560a4830152606081015160c483015260a0611934608083015160c060e48601526101248501906110ee565b91015161010483015203815f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1958615610f29575f96611a03575b509061012092916040519261198e84611141565b87845260208401526001600160401b034216604084015260608301525f60808301525f60a08301528460c08301523060e08301526101008201520152817f8f7f2dbafd79125e808bf16a53d7fa4e17b8b6374ced76d946a45f94b7bf4d065f80a39060015f516020611dce5f395f51905f5255565b92919095506020833d602011611a37575b81611a21602093836111ae565b81010312610b645761012092519590919261197a565b3d9150611a14565b630d35e92160e01b5f526004523460245260445ffd5b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303611a8757565b634ca8886760e01b5f5260045ffd5b60e0013560018060a01b038116809103610b6457301490565b60025f516020611dce5f395f51905f525414611ad85760025f516020611dce5f395f51905f5255565b633ee5aeb560e01b5f5260045ffd5b60405190611af482611141565b6060610120835f81525f60208201525f60408201525f838201525f60808201525f60a08201525f60c08201525f60e08201525f6101008201520152565b51906001600160401b0382168203610b6457565b602081830312610b64578051906001600160401b038211610b64570161014081830312610b645760405191611b7983611141565b8151835260208201516020840152611b9360408301611b31565b6040840152611ba460608301611b31565b6060840152611bb560808301611b31565b608084015260a082015160a0840152611bd060c083016113d7565b60c0840152611be160e083016113d7565b60e0840152611bf36101008301611394565b6101008401526101208201516001600160401b038111610b6457611c1792016113eb565b61012082015290565b90611c29611ae7565b506040516328c44a9960e21b815260048101839052915f836024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa928315610f29575f93611cb2575b508251818115918215611ca7575b5050611c955750565b6301fb6dd160e01b5f5260045260245ffd5b14159050815f611c8c565b611cc79193503d805f833e61065281836111ae565b915f611c7e565b805115611d31576001600160401b036060820151168015159081611d26575b50611d1757608001516001600160401b0316611d0857600190565b637b6227e960e11b5f5260045ffd5b631ab7da6b60e01b5f5260045ffd5b90504210155f611ced565b635c2c7f8960e01b5f5260045ffd5b611d5a610120604092015160208082518301019101611405565b9160018060a01b031691015f8080808451865af13d15611dc8573d611d7e816111cf565b90611d8c60405192836111ae565b81525f60203d92013e5b15611db1575050604051611dab6020826111ae565b5f815290565b51906338f0620160e21b5f5260045260245260445ffd5b611d9656fe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a264697066735822122030eeb6e10b9a0c242a569076cfa0679376789549cb7d1ac9c1bb76f25702202564736f6c634300081b0033",
    "sourceMap": "693:4302:133:-:0;;;;;;;;;;-1:-1:-1;693:4302:133;;;;;;;;;1183:12:9;;;1054:5;1183:12;693:4302:133;1054:5:9;1183:12;693:4302:133;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;693:4302:133;;;;;;;;;2989:103:68;;:::i;:::-;4062:32:90;;;:::i;:::-;4137:37;;;:::i;:::-;4236:13;693:4302:133;4236:13:90;;693:4302:133;4253:18:90;4236:35;;;4232:99;;4346:24;;;:::i;:::-;4345:25;4341:64;;4512:28;4528:11;;;;4512:28;:::i;:::-;4621:18;;;693:4302:133;;;;;4621:32:90;4617:65;;4698:29;;;:::i;:::-;4697:30;4693:63;;4528:11;693:4302:133;;;;;;;;;;;;;1546:26;;;;;;;;;;4827:56:90;;693:4302:133;;4827:56:90;;693:4302:133;;;;;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;-1:-1:-1;;693:4302:133;;;;;;;:::i;:::-;;;;;;;;4827:56:90;;-1:-1:-1;;;;;693:4302:133;4827:56:90;;;;;;;;;;;693:4302:133;4826:57:90;;4822:115;;693:4302:133;;4981:3:90;-1:-1:-1;;;;;693:4302:133;;;;;;:::i;:::-;;;;5058:47:90;693:4302:133;5058:47:90;;693:4302:133;;;;;;;:::i;:::-;;;;5005:102:90;;693:4302:133;4981:136:90;;;;;693:4302:133;;-1:-1:-1;;;4981:136:90;;693:4302:133;;;4981:136:90;;693:4302:133;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;4981:136:90;;;;;;693:4302:133;-1:-1:-1;;4977:215:90;;-1:-1:-1;;;5156:25:90;;693:4302:133;;;;;6295:21:90;5156:25;4977:215;;5337:61;4977:215;2376:520:133;693:4302;4977:215:90;693:4302:133;;;;;;;;2376:520;;:::i;:::-;693:4302;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;5337:61:90;693:4302:133;-1:-1:-1;;;;;;;;;;;2407:1:68;693:4302:133;;;;;;;;:::i;:::-;;;;4981:136:90;;;;;:::i;:::-;693:4302:133;;4981:136:90;;;;693:4302:133;;;;4981:136:90;693:4302:133;;;4822:115:90;-1:-1:-1;;;4906:20:90;;693:4302:133;4662:20:90;4906;4827:56;;;693:4302:133;4827:56:90;;693:4302:133;4827:56:90;;;;;;693:4302:133;4827:56:90;;;:::i;:::-;;;693:4302:133;;;;;;;:::i;:::-;4827:56:90;;;;;;-1:-1:-1;4827:56:90;;;693:4302:133;;;;;;;;;4693:63:90;-1:-1:-1;;;4736:20:90;;693:4302:133;4662:20:90;4736;4341:64;-1:-1:-1;;;4379:26:90;;693:4302:133;5745:26:90;4379;693:4302:133;;;;;3045:39:9;693:4302:133;;;:::i;:::-;881:58:9;;:::i;:::-;3045:39;:::i;:::-;693:4302:133;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;693:4302:133;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;:::i;:::-;;;;;;:::i;:::-;;4952:34;;693:4302;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;:::i;:::-;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;-1:-1:-1;;693:4302:133;;;;;;:::i;:::-;;;;:::i;:::-;-1:-1:-1;693:4302:133;;-1:-1:-1;;;4191:23:89;;693:4302:133;;;4191:23:89;;;693:4302:133;;;;4191:23:89;693:4302:133;4191:3:89;-1:-1:-1;;;;;693:4302:133;4191:23:89;;;;;;;;;;;693:4302:133;4228:19:89;693:4302:133;4228:19:89;;693:4302:133;4251:18:89;4228:41;4224:100;;693:4302:133;4719:46;4730:16;;;;693:4302;;;;4719:46;;;;;;:::i;:::-;693:4302;;;;;;;:::i;4224:100:89:-;-1:-1:-1;;;4292:21:89;;693:4302:133;;4292:21:89;4191:23;;;;;;;;;;;;;;:::i;:::-;;;;;:::i;:::-;;;;;;693:4302:133;;;;;;;;;;;;;;;;;;;;;;;;;;;1332:50:89;693:4302:133;;;;;;-1:-1:-1;693:4302:133;;-1:-1:-1;;693:4302:133;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;:::i;:::-;;;;;:::i;:::-;;;;;;;;:::i;:::-;2989:103:68;;:::i;:::-;693:4302:133;2169:34;693:4302;;;2169:34;;;693:4302;2169:34;;;:::i;:::-;2231:14;693:4302;2218:9;;:27;2214:108;;3559:18:89;;693:4302:133;-1:-1:-1;;;;;693:4302:133;;;;;;:::i;:::-;1625:10:92;693:4302:133;;;3601:295:89;;693:4302:133;3601:295:89;;693:4302:133;3751:28:89;693:4302:133;;3601:295:89;;693:4302:133;3601:295:89;;693:4302:133;3601:295:89;693:4302:133;3601:295:89;;693:4302:133;3601:295:89;;;;693:4302:133;3601:295:89;;;;693:4302:133;;;;;;;:::i;:::-;;;;3514:397:89;;;693:4302:133;;;;;;;;;;;;3490:431:89;;;693:4302:133;3490:431:89;;693:4302:133;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;;;;;;;;;;;;3601:295:89;693:4302:133;3601:295:89;693:4302:133;;;;;;;;;;;;;:::i;:::-;;;;;;;;3490:431:89;693:4302:133;;3490:3:89;-1:-1:-1;;;;;693:4302:133;3490:431:89;;;;;;;;;;;693:4302:133;;;;;;2347:424:92;693:4302:133;;;;;;;:::i;:::-;;;;2347:424:92;;;693:4302:133;-1:-1:-1;;;;;2461:15:92;693:4302:133;;2347:424:92;;693:4302:133;;2347:424:92;;693:4302:133;2347:424:92;3601:295:89;2347:424:92;;693:4302:133;3601:295:89;2347:424:92;;693:4302:133;1625:10:92;693:4302:133;2347:424:92;;693:4302:133;2666:4:92;693:4302:133;2347:424:92;;693:4302:133;2347:424:92;;;693:4302:133;2347:424:92;693:4302:133;1625:10:92;7355:50:90;1625:10:92;7355:50:90;;;2365:1:68;-1:-1:-1;;;;;;;;;;;2407:1:68;693:4302:133;;;;;;3490:431:89;;;;693:4302:133;3490:431:89;;693:4302:133;3490:431:89;;;;;;693:4302:133;3490:431:89;;;:::i;:::-;;;693:4302:133;;;;;;;3490:431:89;;;;;-1:-1:-1;3490:431:89;;;693:4302:133;;;;;;;;;2214:108;-1:-1:-1;;;2268:43:133;;693:4302;;2218:9;693:4302;;;2268:43;;693:4302;-1:-1:-1;693:4302:133;;-1:-1:-1;;693:4302:133;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;2176:12:92;4030:16:133;693:4302;4030:16;693:4302;;:::i;:::-;;;;;;;;;4030:16;;;;:::i;:::-;;1055:104:6;;4030:16:133;;;;;;:::i;:::-;4064:10;2176:12:92;;:::i;:::-;693:4302:133;;;;;;;;;;;;;-1:-1:-1;;693:4302:133;;;;;;2989:103:68;;;:::i;:::-;5587:28:90;;;:::i;:::-;5682:18;693:4302:133;5682:18:90;;693:4302:133;5704:18:90;5682:40;;;5678:104;;5891:26;;;-1:-1:-1;;;;;693:4302:133;;;5891:31:90;5887:62;;693:4302:133;-1:-1:-1;;;;;693:4302:133;5964:15:90;:44;5960:100;;693:4302:133;;6124:3:90;-1:-1:-1;;;;;693:4302:133;;;;;:::i;:::-;;;;;;6201:43:90;;693:4302:133;;;;;;;:::i;:::-;;;;6148:98:90;;693:4302:133;6124:132:90;;;;;693:4302:133;;-1:-1:-1;;;6124:132:90;;693:4302:133;;;6124:132:90;;693:4302:133;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;693:4302:133;;;;;;-1:-1:-1;;6124:132:90;;;;;;693:4302:133;-1:-1:-1;6120:207:90;;-1:-1:-1;;;6295:21:90;;693:4302:133;;;;-1:-1:-1;6295:21:90;6120:207;6419:21;;;693:4302:133;;;;6419:21:90;;-1:-1:-1;;;;;693:4302:133;;6419:21:90;:::i;:::-;;693:4302:133;;;;;;;;;6457:43:90;693:4302:133;;6457:43:90;;;693:4302:133;-1:-1:-1;;;;;;;;;;;2407:1:68;693:4302:133;;;;6124:132:90;;;;;693:4302:133;6124:132:90;;:::i;:::-;693:4302:133;6124:132:90;;;;;693:4302:133;;;5960:100:90;5931:18;;;693:4302:133;6031:18:90;693:4302:133;;6031:18:90;5678:104;5745:26;;;693:4302:133;5745:26:90;693:4302:133;;5745:26:90;693:4302:133;;1442:1461:9;693:4302:133;;;:::i;:::-;881:58:9;;;;;;:::i;:::-;1442:1461;:::i;693:4302:133:-;;;;;;-1:-1:-1;;693:4302:133;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;:::i;:::-;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;:::i;:::-;;;:::i;:::-;;;-1:-1:-1;;693:4302:133;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;:::i;:::-;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;4393:16;;2176:12:92;693:4302:133;;;;;;;;4393:16;;;;:::i;:::-;;1055:104:6;;4393:16:133;;;;;;:::i;:::-;2176:12:92;:::i;693:4302:133:-;;;;;;-1:-1:-1;;693:4302:133;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;:::i;:::-;;:::i;:::-;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;-1:-1:-1;;693:4302:133;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;2937:44:89;;2962:18;693:4302:133;2937:44:89;;693:4302:133;;;2937:44:89;693:4302:133;;;;;;2937:14:89;693:4302:133;2937:44:89;;;;;;693:4302:133;2937:44:89;;;693:4302:133;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;2937:44:89:-;;;;693:4302:133;2937:44:89;;;;;;:::i;:::-;;;693:4302:133;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;2937:44:89;;;693:4302:133;;;;;;;;;;;;;;;-1:-1:-1;;693:4302:133;;;;;;;1204:43:89;693:4302:133;;;;;;;;;-1:-1:-1;;693:4302:133;;;;;1055:104:6;;693:4302:133;1072:24:6;1089:6;1072:24;:::i;:::-;1120:6;;1103:24;1120:6;1103:24;:::i;:::-;1151:6;;1134:24;1151:6;1134:24;:::i;:::-;693:4302:133;;;;;;;;;;;;1055:104:6;;;693:4302:133;;;;-1:-1:-1;;;693:4302:133;;;;;;;;;;;;;;;;;-1:-1:-1;;;693:4302:133;;;;;;;;;;;;;;;;;;;;;1055:104:6;;;;;;;;;;:::i;:::-;693:4302:133;;;;;1055:104:6;693:4302:133;;1055:104:6;693:4302:133;;;;:::i;:::-;;;;;;-1:-1:-1;;693:4302:133;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;1531:41:133;;;:81;;;;;;693:4302;;;;;;;;1531:81;573::88;;;1531::133;;;;;;573::88;-1:-1:-1;;;2366:40:90;;;-1:-1:-1;2366:80:90;;;;573:81:88;;;;;2366:80:90;-1:-1:-1;;;829:40:77;;-1:-1:-1;2366:80:90;;;693:4302:133;;;;;;;;;;;;;;;;;-1:-1:-1;693:4302:133;;;;;;;;-1:-1:-1;;693:4302:133;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;:::o;:::-;;;;-1:-1:-1;693:4302:133;;;;;-1:-1:-1;693:4302:133;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;:::o;:::-;;;1055:104:6;;693:4302:133;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;:::o;:::-;-1:-1:-1;;;;;693:4302:133;;;;;;-1:-1:-1;;693:4302:133;;;;:::o;:::-;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;693:4302:133;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;:::o;:::-;;;;-1:-1:-1;;;;;693:4302:133;;;;;;:::o;:::-;;;-1:-1:-1;;;;;693:4302:133;;;;;;:::o;:::-;;;-1:-1:-1;;;;;693:4302:133;;;;;;:::o;:::-;;;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;;:::o;:::-;;-1:-1:-1;;693:4302:133;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;:::i;:::-;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;:::i;:::-;;;:::o;:::-;;;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::o;:::-;;-1:-1:-1;;693:4302:133;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;-1:-1:-1;;693:4302:133;;;;;;;:::o;:::-;;;;;;;;;;:::o;:::-;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;693:4302:133;;;;;;:::o;:::-;;;-1:-1:-1;;;;;693:4302:133;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;:::i;:::-;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;:::o;1718:245::-;1872:34;1718:245;1872:34;693:4302;;;1872:34;;;;;;:::i;:::-;693:4302;;1872:34;1941:14;;;;-1:-1:-1;;;;;693:4302:133;;;;1718:245::o;693:4302::-;;;;-1:-1:-1;;;;;693:4302:133;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;693:4302:133;;;;:::o;3133:1460:9:-;;;;3340:23;;;3336:76;;3881:1;;3844:9;3896:19;3884:10;;;;;;693:4302:133;;;;;;;;;;;;;4064:22:9;;;;4060:87;;693:4302:133;;;;;;;;;;;;;;4274:33:9;693:4302:133;;;4274:33:9;:::i;:::-;;4270:84;;1489:1:0;693:4302:133;;3896:19:9;693:4302:133;3869:13:9;;;4270:84;4327:12;;;;;;;3881:1;4327:12;:::o;4060:87::-;4113:19;;;3881:1;4113:19;;3881:1;4113:19;693:4302:133;;;;3881:1:9;693:4302:133;;;;;3881:1:9;693:4302:133;3884:10:9;;;;;;;1489:1:0;3133:1460:9;:::o;3336:76::-;3386:15;;;;;;;;3154:605:133;3363:17;;;693:4302;3384:18;3363:39;3359:57;;3459:45;3470:15;3549:36;3470:15;;;3363:17;693:4302;;;3459:45;;;;;;:::i;:::-;693:4302;3363:17;693:4302;;;3549:36;;;;;;:::i;:::-;3603:14;;;693:4302;3603:14;3621:17;;693:4302;-1:-1:-1;3603:35:133;:76;;;;3154:605;3603:149;;;3596:156;;3154:605;:::o;3603:149::-;3363:17;3705:14;;;;;;693:4302;;;;;3695:25;3734:17;;;3363;693:4302;;;;3724:28;3695:57;3154:605;:::o;3603:76::-;693:4302;;;;-1:-1:-1;;;;;693:4302:133;;;;;3642:37;;-1:-1:-1;3603:76:133;;3359:57;3404:12;;693:4302;3404:12;:::o;693:4302::-;;;;;;;:::i;:::-;-1:-1:-1;693:4302:133;;;;;;;;;;;;:::o;1343:634:72:-;1465:17;-1:-1:-1;29298:17:79;-1:-1:-1;;;29298:17:79;;;29294:103;;1343:634:72;29414:17:79;29423:8;29994:7;29414:17;;;29410:103;;1343:634:72;29539:8:79;29530:17;;;29526:103;;1343:634:72;29655:7:79;29646:16;;;29642:100;;1343:634:72;29768:7:79;29759:16;;;29755:100;;1343:634:72;29881:7:79;29872:16;;;29868:100;;1343:634:72;29985:16:79;;29981:66;;1343:634:72;29994:7:79;1580:94:72;1485:1;693:4302:133;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;1055:104:6;;693:4302:133;;:::i;:::-;;;;;;;1580:94:72;;;1687:247;-1:-1:-1;;693:4302:133;;-1:-1:-1;;;1741:111:72;;;;693:4302:133;1741:111:72;693:4302:133;1902:10:72;;1898:21;;29994:7:79;1687:247:72;;;;1898:21;1914:5;;1343:634;:::o;29981:66:79:-;30031:1;693:4302:133;;;;29981:66:79;;29868:100;29881:7;29952:1;693:4302:133;;;;29868:100:79;;;29755;29768:7;29839:1;693:4302:133;;;;29755:100:79;;;29642;29655:7;29726:1;693:4302:133;;;;29642:100:79;;;29526:103;29539:8;29612:2;693:4302:133;;;;29526:103:79;;;29410;29423:8;29496:2;693:4302:133;;;;29410:103:79;;;29294;-1:-1:-1;29380:2:79;;-1:-1:-1;;;;693:4302:133;;29294:103:79;;2989::68;;;:::i;:::-;2231:14:133;2169:34;;693:4302;;2169:34;;;;;;;:::i;:::-;2231:14;693:4302;2218:9;;:27;2214:108;;3559:18:89;;-1:-1:-1;;;;;2231:14:133;693:4302;;;;;:::i;:::-;;;;;;;;;;;;3601:295:89;2169:34:133;3601:295:89;;693:4302:133;3751:28:89;693:4302:133;;3601:295:89;;2231:14:133;3601:295:89;;693:4302:133;;3601:295:89;;;693:4302:133;3601:295:89;;;;693:4302:133;;3601:295:89;;;693:4302:133;2169:34;2231:14;693:4302;;;;:::i;:::-;;;;3514:397:89;;;693:4302:133;;;2231:14;693:4302;;;;;;;;3490:431:89;;;;;;693:4302:133;;;;;;;2231:14;693:4302;;;;;;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;2231:14;693:4302;;;;;;;;;3601:295:89;693:4302:133;;;;;;;3601:295:89;693:4302:133;3601:295:89;693:4302:133;;;;;;;;;;;;;:::i;:::-;;;;;;;;3490:431:89;693:4302:133;;3490:3:89;-1:-1:-1;;;;;693:4302:133;3490:431:89;;;;;;;693:4302:133;3490:431:89;;;2989:103:68;693:4302:133;;2347:424:92;693:4302:133;;2231:14;693:4302;;;;;:::i;:::-;;;;2169:34;2347:424:92;;693:4302:133;-1:-1:-1;;;;;2461:15:92;693:4302:133;2231:14;2347:424:92;;693:4302:133;3601:295:89;2347:424:92;;693:4302:133;;3601:295:89;2347:424:92;;693:4302:133;;3601:295:89;2347:424:92;;693:4302:133;2347:424:92;693:4302:133;2347:424:92;;693:4302:133;2666:4:92;693:4302:133;2347:424:92;;693:4302:133;2347:424:92;;;693:4302:133;2347:424:92;693:4302:133;7355:50:90;;693:4302:133;7355:50:90;;2407:1:68;2365;-1:-1:-1;;;;;;;;;;;2407:1:68;2989:103::o;3490:431:89:-;;;;;;2169:34:133;3490:431:89;;2169:34:133;3490:431:89;;;;;;2169:34:133;3490:431:89;;;:::i;:::-;;;693:4302:133;;;;2347:424:92;693:4302:133;;3490:431:89;;;;;;;;;-1:-1:-1;3490:431:89;;2214:108:133;2268:43;;;693:4302;2268:43;;693:4302;2218:9;693:4302;;;;2268:43;6040:128:9;6109:4;-1:-1:-1;;;;;693:4302:133;6087:10:9;:27;6083:79;;6040:128::o;6083:79::-;6137:14;;;;;;;;2506:271:89;2733:20;;693:4302:133;;;;;;;;;;;;;2765:4:89;2733:37;2506:271;:::o;3749:292:68:-;2407:1;-1:-1:-1;;;;;;;;;;;693:4302:133;4560:63:68;3644:93;;2407:1;-1:-1:-1;;;;;;;;;;;2407:1:68;3749:292::o;3644:93::-;3696:30;;;-1:-1:-1;3696:30:68;;-1:-1:-1;3696:30:68;693:4302:133;;;;;;;:::i;:::-;;;;-1:-1:-1;693:4302:133;;-1:-1:-1;693:4302:133;;;;-1:-1:-1;693:4302:133;;;;-1:-1:-1;693:4302:133;;;;-1:-1:-1;693:4302:133;;;;-1:-1:-1;693:4302:133;;;;-1:-1:-1;693:4302:133;;;;-1:-1:-1;693:4302:133;;;;-1:-1:-1;693:4302:133;;;;;;:::o;:::-;;;-1:-1:-1;;;;;693:4302:133;;;;;;:::o;:::-;;;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;-1:-1:-1;;;;;693:4302:133;;;;;;;;:::i;:::-;;;;;;:::o;6683:257:90:-;;693:4302:133;;:::i;:::-;-1:-1:-1;693:4302:133;;-1:-1:-1;;;6808:23:90;;;;;693:4302:133;;;;-1:-1:-1;693:4302:133;6808:23:90;693:4302:133;6808:3:90;-1:-1:-1;;;;;693:4302:133;6808:23:90;;;;;;;-1:-1:-1;6808:23:90;;;6683:257;6794:37;;693:4302:133;6845:29:90;;;:55;;;;;6683:257;6841:92;;;;6683:257;:::o;6841:92::-;6909:24;;;-1:-1:-1;6909:24:90;6808:23;693:4302:133;6808:23:90;-1:-1:-1;6909:24:90;6845:55;6878:22;;;-1:-1:-1;6845:55:90;;;;6808:23;;;;;;;-1:-1:-1;6808:23:90;;;;;;:::i;:::-;;;;;1185:321:124;693:4302:133;;1284:28:124;1280:64;;-1:-1:-1;;;;;801:25:124;;;693:4302:133;;801:30:124;;;:78;;;;1185:321;1354:55;;;1057:25;;693:4302:133;-1:-1:-1;;;;;693:4302:133;1419:58:124;;1495:4;1185:321;:::o;1419:58::-;1457:20;;;-1:-1:-1;1457:20:124;;-1:-1:-1;1457:20:124;1354:55;1392:17;;;-1:-1:-1;1392:17:124;;-1:-1:-1;1392:17:124;801:78;864:15;;;-1:-1:-1;835:44:124;801:78;;;1280:64;1321:23;;;-1:-1:-1;1321:23:124;;-1:-1:-1;1321:23:124;2376:520:133;2610:41;2621:11;2704:14;2376:520;2621:11;;2610:41;693:4302;;;2610:41;;;;;;:::i;:::-;693:4302;;;;;;;2704:14;;-1:-1:-1;693:4302:133;;;;;2680:43;;;693:4302;;;;;;;;:::i;:::-;;;2704:14;693:4302;;;;:::i;:::-;;;-1:-1:-1;2610:41:133;693:4302;;;;;2737:8;2733:91;;693:4302;;2704:14;693:4302;;2610:41;693:4302;;:::i;:::-;-1:-1:-1;693:4302:133;;2376:520;:::o;2733:91::-;693:4302;2768:45;;;;-1:-1:-1;2768:45:133;;693:4302;;;;-1:-1:-1;2768:45:133;693:4302;;",
    "linkReferences": {},
    "immutableReferences": {
      "2532": [
        {
          "start": 3981,
          "length": 32
        }
      ],
      "2534": [
        {
          "start": 4024,
          "length": 32
        }
      ],
      "2536": [
        {
          "start": 4067,
          "length": 32
        }
      ],
      "3008": [
        {
          "start": 6743,
          "length": 32
        }
      ],
      "59046": [
        {
          "start": 3588,
          "length": 32
        }
      ],
      "59050": [
        {
          "start": 675,
          "length": 32
        },
        {
          "start": 1443,
          "length": 32
        },
        {
          "start": 2097,
          "length": 32
        },
        {
          "start": 2621,
          "length": 32
        },
        {
          "start": 6466,
          "length": 32
        },
        {
          "start": 7238,
          "length": 32
        }
      ],
      "59053": [
        {
          "start": 316,
          "length": 32
        },
        {
          "start": 1507,
          "length": 32
        },
        {
          "start": 1816,
          "length": 32
        },
        {
          "start": 2542,
          "length": 32
        },
        {
          "start": 3538,
          "length": 32
        },
        {
          "start": 3915,
          "length": 32
        },
        {
          "start": 5574,
          "length": 32
        },
        {
          "start": 6178,
          "length": 32
        }
      ],
      "59056": [
        {
          "start": 1670,
          "length": 32
        },
        {
          "start": 1882,
          "length": 32
        },
        {
          "start": 6251,
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
    "collect(bytes32,bytes32)": "ea6ec49c",
    "decodeCondition(bytes)": "760bd118",
    "decodeObligationData(bytes)": "c93844be",
    "doObligation((address,bytes,uint256),uint64)": "9d76101d",
    "doObligationFor((address,bytes,uint256),uint64,address)": "85514c51",
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
  "rawMetadata": "{\"compiler\":{\"version\":\"0.8.27+commit.40a35a09\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[{\"internalType\":\"contract IEAS\",\"name\":\"_eas\",\"type\":\"address\"},{\"internalType\":\"contract ISchemaRegistry\",\"name\":\"_schemaRegistry\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"AccessDenied\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"attestationId\",\"type\":\"bytes32\"}],\"name\":\"AttestationNotFound\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"AttestationRevoked\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"DeadlineExpired\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"expected\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"received\",\"type\":\"uint256\"}],\"name\":\"IncorrectPayment\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InsufficientValue\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidAttestationUid\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidEAS\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidEscrowAttestation\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidFulfillment\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidLength\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"NativeTokenTransferFailed\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"NotFromThisAttester\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"NotPayable\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"ReentrancyGuardReentrantCall\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"attestationId\",\"type\":\"bytes32\"}],\"name\":\"RevocationFailed\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"SchemaRegistrationFailed\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"UnauthorizedCall\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"fulfillmentUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"fulfiller\",\"type\":\"address\"}],\"name\":\"EscrowCollected\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"escrower\",\"type\":\"address\"}],\"name\":\"EscrowMade\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"escrower\",\"type\":\"address\"}],\"name\":\"EscrowReclaimed\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"ATTESTATION_SCHEMA\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"ATTESTATION_SCHEMA_REVOCABLE\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"attestation\",\"type\":\"tuple\"}],\"name\":\"attest\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"obligation\",\"type\":\"tuple\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"check\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"_escrow\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"_fulfillment\",\"type\":\"bytes32\"}],\"name\":\"collect\",\"outputs\":[{\"internalType\":\"bytes\",\"name\":\"\",\"type\":\"bytes\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"decodeCondition\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"decodeObligationData\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"internalType\":\"struct NativeTokenEscrowObligation.ObligationData\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"internalType\":\"struct NativeTokenEscrowObligation.ObligationData\",\"name\":\"data\",\"type\":\"tuple\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"}],\"name\":\"doObligation\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"internalType\":\"struct NativeTokenEscrowObligation.ObligationData\",\"name\":\"data\",\"type\":\"tuple\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"}],\"name\":\"doObligationFor\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"}],\"name\":\"doObligationRaw\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid_\",\"type\":\"bytes32\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"getObligationData\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"arbiter\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"internalType\":\"struct NativeTokenEscrowObligation.ObligationData\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getSchema\",\"outputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"contract ISchemaResolver\",\"name\":\"resolver\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"string\",\"name\":\"schema\",\"type\":\"string\"}],\"internalType\":\"struct SchemaRecord\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"isPayable\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation[]\",\"name\":\"attestations\",\"type\":\"tuple[]\"},{\"internalType\":\"uint256[]\",\"name\":\"values\",\"type\":\"uint256[]\"}],\"name\":\"multiAttest\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation[]\",\"name\":\"attestations\",\"type\":\"tuple[]\"},{\"internalType\":\"uint256[]\",\"name\":\"values\",\"type\":\"uint256[]\"}],\"name\":\"multiRevoke\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"reclaim\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"attestation\",\"type\":\"tuple\"}],\"name\":\"revoke\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"version\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"stateMutability\":\"payable\",\"type\":\"receive\"}],\"devdoc\":{\"details\":\"Uses the default escrow checks: fulfillment must reference the escrow UID and pass intrinsic attestation validation.\",\"errors\":{\"ReentrancyGuardReentrantCall()\":[{\"details\":\"Unauthorized reentrant call.\"}]},\"kind\":\"dev\",\"methods\":{\"attest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"params\":{\"attestation\":\"The new attestation.\"},\"returns\":{\"_0\":\"Whether the attestation is valid.\"}},\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"params\":{\"demand\":\"Arbiter-specific demand data encoded by the escrow creator.\",\"escrowUid\":\"The UID of the escrow attestation being fulfilled.\",\"fulfillment\":\"The EAS attestation being used as fulfillment.\"}},\"collect(bytes32,bytes32)\":{\"params\":{\"escrowUid\":\"UID of the escrow attestation.\",\"fulfillmentUid\":\"UID of the fulfillment attestation.\"},\"returns\":{\"_0\":\"Escrow-specific return data from the underlying release logic.\"}},\"decodeCondition(bytes)\":{\"params\":{\"escrowData\":\"ABI-encoded escrow obligation data.\"},\"returns\":{\"arbiter\":\"Address of the arbiter that validates fulfillment.\",\"demand\":\"Arbiter-specific demand bytes.\"}},\"doObligationRaw(bytes,uint64,bytes32)\":{\"params\":{\"data\":\"ABI-encoded obligation data.\",\"expirationTime\":\"EAS expiration timestamp, or zero for no expiration.\",\"refUID\":\"Reference UID stored on the EAS attestation.\"}},\"isPayable()\":{\"returns\":{\"_0\":\"Whether the resolver supports ETH transfers.\"}},\"multiAttest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"params\":{\"attestations\":\"The new attestations.\",\"values\":\"Explicit ETH amounts which were sent with each attestation.\"},\"returns\":{\"_0\":\"Whether all the attestations are valid.\"}},\"multiRevoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"params\":{\"attestations\":\"The existing attestations to be revoked.\",\"values\":\"Explicit ETH amounts which were sent with each revocation.\"},\"returns\":{\"_0\":\"Whether the attestations can be revoked.\"}},\"reclaim(bytes32)\":{\"params\":{\"escrowUid\":\"UID of the escrow attestation.\"},\"returns\":{\"_0\":\"True if the reclaim succeeds.\"}},\"revoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"params\":{\"attestation\":\"The existing attestation to be revoked.\"},\"returns\":{\"_0\":\"Whether the attestation can be revoked.\"}},\"supportsInterface(bytes4)\":{\"details\":\"Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section] to learn more about how these ids are created. This function call must use less than 30 000 gas.\"},\"version()\":{\"returns\":{\"_0\":\"Semver contract version as a string.\"}}},\"title\":\"NativeTokenEscrowObligation\",\"version\":1},\"userdoc\":{\"errors\":{\"AttestationNotFound(bytes32)\":[{\"notice\":\"Raised when EAS has no attestation for the requested UID.\"}],\"AttestationRevoked()\":[{\"notice\":\"Raised when an attestation has been revoked.\"}],\"DeadlineExpired()\":[{\"notice\":\"Raised when an attestation has expired.\"}],\"InvalidAttestationUid()\":[{\"notice\":\"Raised when an attestation UID is zero.\"}],\"InvalidEscrowAttestation()\":[{\"notice\":\"Raised when the escrow attestation is missing, invalid, expired, revoked, or has the wrong schema.\"}],\"InvalidFulfillment()\":[{\"notice\":\"Raised when the fulfillment does not satisfy the escrow's default checks or arbiter.\"}],\"NotFromThisAttester()\":[{\"notice\":\"Raised when an attestation does not belong to this contract's schema.\"}],\"RevocationFailed(bytes32)\":[{\"notice\":\"Raised when revoking the escrow attestation fails during collect or reclaim.\"}],\"SchemaRegistrationFailed(bytes32)\":[{\"notice\":\"Raised when a schema cannot be registered or found at its deterministic UID.\"}],\"UnauthorizedCall()\":[{\"notice\":\"Raised when a caller attempts an action that is not currently permitted.\"}]},\"events\":{\"EscrowCollected(bytes32,bytes32,address)\":{\"notice\":\"Emitted when an escrow is successfully collected by a fulfillment recipient.\"},\"EscrowMade(bytes32,address)\":{\"notice\":\"Emitted when escrow assets are locked and the escrow attestation is created.\"},\"EscrowReclaimed(bytes32,address)\":{\"notice\":\"Emitted when an expired escrow is reclaimed by its original escrower.\"}},\"kind\":\"user\",\"methods\":{\"ATTESTATION_SCHEMA()\":{\"notice\":\"UID of the schema used by attestations created by this contract.\"},\"ATTESTATION_SCHEMA_REVOCABLE()\":{\"notice\":\"Whether attestations under `ATTESTATION_SCHEMA` are revocable.\"},\"attest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"notice\":\"Processes an attestation and verifies whether it's valid.\"},\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"notice\":\"Returns true when `fulfillment` satisfies `demand` for `escrowUid`.\"},\"collect(bytes32,bytes32)\":{\"notice\":\"Collects an escrow using a fulfillment attestation.\"},\"decodeCondition(bytes)\":{\"notice\":\"Decodes an escrow attestation's condition into arbiter and demand data.\"},\"decodeObligationData(bytes)\":{\"notice\":\"Decodes ABI-encoded native-token escrow data.\"},\"doObligation((address,bytes,uint256),uint64)\":{\"notice\":\"Locks native token and creates an escrow attestation for the caller.\"},\"doObligationFor((address,bytes,uint256),uint64,address)\":{\"notice\":\"Locks native token and creates an escrow attestation for an explicit recipient.\"},\"doObligationRaw(bytes,uint64,bytes32)\":{\"notice\":\"Creates an obligation attestation from pre-encoded data.\"},\"getObligationData(bytes32)\":{\"notice\":\"Loads and decodes native-token escrow data from this contract's attestation.\"},\"getSchema()\":{\"notice\":\"Returns the schema record registered for this attester.\"},\"isPayable()\":{\"notice\":\"Checks if the resolver can be sent ETH.\"},\"multiAttest((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"notice\":\"Processes multiple attestations and verifies whether they are valid.\"},\"multiRevoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes)[],uint256[])\":{\"notice\":\"Processes revocation of multiple attestation and verifies they can be revoked.\"},\"reclaim(bytes32)\":{\"notice\":\"Reclaims an expired escrow and returns locked assets to the escrower.\"},\"revoke((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"notice\":\"Processes an attestation revocation and verifies if it can be revoked.\"},\"version()\":{\"notice\":\"Returns the full semver contract version.\"}},\"notice\":\"Escrows native tokens behind an arbiter-defined fulfillment condition.\",\"version\":1}},\"settings\":{\"compilationTarget\":{\"src/obligations/escrow/default/NativeTokenEscrowObligation.sol\":\"NativeTokenEscrowObligation\"},\"evmVersion\":\"prague\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[\":@eas/=lib/eas-contracts/contracts/\",\":@erc8004/=lib/erc-8004-contracts/contracts/\",\":@openzeppelin/=lib/openzeppelin-contracts/\",\":@src/=src/\",\":@test/=test/\",\":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/\",\":eas-contracts/=lib/eas-contracts/contracts/\",\":erc-8004-contracts/=lib/erc-8004-contracts/contracts/\",\":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/\",\":eth-gas-reporter/=lib/eas-contracts/node_modules/eth-gas-reporter/\",\":forge-std/=lib/forge-std/src/\",\":halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/\",\":hardhat-deploy/=lib/eas-contracts/node_modules/hardhat-deploy/\",\":hardhat/=lib/eas-contracts/node_modules/hardhat/\",\":openzeppelin-contracts/=lib/openzeppelin-contracts/\"],\"viaIR\":true},\"sources\":{\"lib/eas-contracts/contracts/Common.sol\":{\"keccak256\":\"0x957bd2e6d0d6d637f86208b135c29fbaf4412cb08e5e7a61ede16b80561bf685\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://da1dc9aedbb1d4d39c46c2235918d3adfbc5741dd34a46010cf425d134e7936d\",\"dweb:/ipfs/QmWUk6bXnLaghS2riF3GTFEeURCzgYFMA5woa6AsgPwEgc\"]},\"lib/eas-contracts/contracts/IEAS.sol\":{\"keccak256\":\"0xdad0674defce04905dc7935f2756d6c477a6e876c0b1b7094b112a862f164c12\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://49e448c26c08952df034692d2ab3519dd40a1ebbeae4ce68b294567441933880\",\"dweb:/ipfs/QmWHcudjskUSCjgqsNWE65LVfWvcYB2vBn8RB1SmzvRLNR\"]},\"lib/eas-contracts/contracts/ISchemaRegistry.sol\":{\"keccak256\":\"0xea97dcd36a0c422169cbaac06698249e199049b627c16bff93fb8ab829058754\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://d453a929ef64a69cd31195ec2ee5ed1193bfa29f633e13c960e92154c37ad158\",\"dweb:/ipfs/QmXs1Z3njbHs2EMgHonrZDfcwdog4kozHY5tYNrhZK5yqz\"]},\"lib/eas-contracts/contracts/ISemver.sol\":{\"keccak256\":\"0x04a67939b4e1a8d0a51101b8f69f8882930bbdc66319f38023828625b5d1ff18\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://3dd543fa0e33cef1ea757627f9c2a10a66ee1ce17aa9087f437c5b53a903c7f0\",\"dweb:/ipfs/QmXsy6UsGBzF9zPCCjmiwPpCcX3tHqU13TmR67B69tKnR6\"]},\"lib/eas-contracts/contracts/Semver.sol\":{\"keccak256\":\"0x4f23442d048661b6aaa188ddc16b69cb310c2e44066b3852026afcb4201d61a9\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://30c36e580cd93d9acb13e1a11e833946a8bd0bd2a8d1b2be049f0d96e0989808\",\"dweb:/ipfs/QmXmQTxKjSrUWutafQsqkbGufXqtzxuDAiMMJjXCHXiEqh\"]},\"lib/eas-contracts/contracts/resolver/ISchemaResolver.sol\":{\"keccak256\":\"0xb7d1961ed928c620cddf35c2bf46845b10828bc5d73145214630202ed355b6bb\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://cf1cabacfb15c9bace8280b540b52e5aa440e1b4eba675f9782c34ce0f03902f\",\"dweb:/ipfs/QmakYcK4xbrijzvoaBCmBJK6HeaBqbXxWKtDQ1z62aXwCR\"]},\"lib/eas-contracts/contracts/resolver/SchemaResolver.sol\":{\"keccak256\":\"0x385d8c0edbdc96af15cf8f22333183162561cbf7d3fb0df95287741e59899983\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://ff7e8a17f69dcb7ddc937446e868d34baea61bbe249a8f5d8be486ab93001828\",\"dweb:/ipfs/QmUz9i7ViNK9kUWHeJRtE44HmpbxBDGJBjyec2aPD6Nn3Q\"]},\"lib/openzeppelin-contracts/contracts/utils/Bytes.sol\":{\"keccak256\":\"0x8140d608316521b1fd71167c3b708ebb8659da070723fc8807609553b296ee33\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://a7bf7db66869ba1e945a0390b85da2f6afc7e42a4735ca918d0d56ac90c50147\",\"dweb:/ipfs/QmRmNyhpBpgzSdQqLtrQCYE7H7eLnVVxh2Yy4YMrySR8AR\"]},\"lib/openzeppelin-contracts/contracts/utils/Panic.sol\":{\"keccak256\":\"0xf7fe324703a64fc51702311dc51562d5cb1497734f074e4f483bfb6717572d7a\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://c6a5ff4f9fd8649b7ee20800b7fa387d3465bd77cf20c2d1068cd5c98e1ed57a\",\"dweb:/ipfs/QmVSaVJf9FXFhdYEYeCEfjMVHrxDh5qL4CGkxdMWpQCrqG\"]},\"lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol\":{\"keccak256\":\"0xa516cbf1c7d15d3517c2d668601ce016c54395bf5171918a14e2686977465f53\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://1e1d079e8edfb58efd23a311e315a4807b01b5d1cf153f8fa2d0608b9dec3e99\",\"dweb:/ipfs/QmTBExeX2SDTkn5xbk5ssbYSx7VqRp9H4Ux1CY4uQM4b9N\"]},\"lib/openzeppelin-contracts/contracts/utils/StorageSlot.sol\":{\"keccak256\":\"0xcf74f855663ce2ae00ed8352666b7935f6cddea2932fdf2c3ecd30a9b1cd0e97\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://9f660b1f351b757dfe01438e59888f31f33ded3afcf5cb5b0d9bf9aa6f320a8b\",\"dweb:/ipfs/QmarDJ5hZEgBtCmmrVzEZWjub9769eD686jmzb2XpSU1cM\"]},\"lib/openzeppelin-contracts/contracts/utils/Strings.sol\":{\"keccak256\":\"0x36d1750bf1aa5fee9c52adb2f7857ab652daca722fc05dff533b364f67a1139a\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://2e5e7052539b7849d02f3ce25acc1dce29373c11cfae9f0bc918c54b780c549a\",\"dweb:/ipfs/QmRGE32xNkMTo6i4pHHMxjpiu77yPwnTA25SFngw2NXJys\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/ERC165.sol\":{\"keccak256\":\"0x2d9dc2fe26180f74c11c13663647d38e259e45f95eb88f57b61d2160b0109d3e\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://81233d1f98060113d9922180bb0f14f8335856fe9f339134b09335e9f678c377\",\"dweb:/ipfs/QmWh6R35SarhAn4z2wH8SU456jJSYL2FgucfTFgbHJJN4E\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol\":{\"keccak256\":\"0x8891738ffe910f0cf2da09566928589bf5d63f4524dd734fd9cedbac3274dd5c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://971f954442df5c2ef5b5ebf1eb245d7105d9fbacc7386ee5c796df1d45b21617\",\"dweb:/ipfs/QmadRjHbkicwqwwh61raUEapaVEtaLMcYbQZWs9gUkgj3u\"]},\"lib/openzeppelin-contracts/contracts/utils/math/Math.sol\":{\"keccak256\":\"0x09e3f1c72d4c5cbe8e2644ab7313f8f7177533ae2f4c24cdcbbeaf520a73734c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://93208401215d539fa2d81626b207c1f611def7883d0e447b3b5969ebaa7b3c2c\",\"dweb:/ipfs/QmXPxDnQPx8LAweX5ZJqEcwkvs59kP4c64VVDG1Jjq1mef\"]},\"lib/openzeppelin-contracts/contracts/utils/math/SafeCast.sol\":{\"keccak256\":\"0x195533c86d0ef72bcc06456a4f66a9b941f38eb403739b00f21fd7c1abd1ae54\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://b1d578337048cad08c1c03041cca5978eff5428aa130c781b271ad9e5566e1f8\",\"dweb:/ipfs/QmPFKL2r9CBsMwmUqqdcFPfHZB2qcs9g1HDrPxzWSxomvy\"]},\"lib/openzeppelin-contracts/contracts/utils/math/SignedMath.sol\":{\"keccak256\":\"0xb1970fac7b64e6c09611e6691791e848d5e3fe410fa5899e7df2e0afd77a99e3\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://db5fbb3dddd8b7047465b62575d96231ba8a2774d37fb4737fbf23340fabbb03\",\"dweb:/ipfs/QmVUSvooZKEdEdap619tcJjTLcAuH6QBdZqAzWwnAXZAWJ\"]},\"src/BaseArbiter.sol\":{\"keccak256\":\"0x27fa97834bcd6e592f3b534e64859b208c688363d33fb9b62436d009ffff3ed1\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://b61ac6195ae644325adf77fdb301651cddfca4b63d9db5123ee075869f3784aa\",\"dweb:/ipfs/QmYRu5hER8gaMjqyY5bDV9EAwVN12CbS3Z2bW8dLp7sPSE\"]},\"src/BaseAttester.sol\":{\"keccak256\":\"0x12339a862aa0571244f4a0c2dae1a7bcc1734717474dbf0d69b63886987d1f99\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://d40e983dece581ecb49a1a01bc87c66e86f8c954cc442a02151ec427d680682d\",\"dweb:/ipfs/QmVA7Tqk1KaYhrZpxWx3cdsjUoxsRaoBjJX8k6nCSEk8En\"]},\"src/BaseEscrowObligation.sol\":{\"keccak256\":\"0x49717032f4edbbfd52bf160a99b7b39f726e8a2f968ed4b261ee31b1622a22ac\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://1aba86a5094f4be28de1c5782087aff65c6d0bbc8ab124501e0677b5cab843f2\",\"dweb:/ipfs/QmXfo8c532ALhAUC9iae2mrSWLmDTSABunMJP2iU7PpKek\"]},\"src/BaseObligation.sol\":{\"keccak256\":\"0xf00b1317dd9203ea59e8da6c0bb23267b50ecb2751cd11b26a6330d1e596eb7b\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://5b9762a2ba2251c6ae9d23aa3ba49a8124f3348ac13c9271b8b9ada438dff475\",\"dweb:/ipfs/QmeBZUvNjNyC7W1hb1PKQq8CawC5ULWX9KXgJjH37wvPGH\"]},\"src/IArbiter.sol\":{\"keccak256\":\"0x00f3f5d8460c738eff4a776cf309efe38342fcc951abfe97d1c2e285acb1e330\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://7201a176f3d5c3d01ca13bbcd9ef5587effe8fabf20e0b8f81f2d6ee362269b9\",\"dweb:/ipfs/QmXn9aSvoGPQuNTxe3mM47RNQ1bfYCEczQCYsDDM9ohc8M\"]},\"src/IEscrow.sol\":{\"keccak256\":\"0x8803bb72e285722a5e90f08046cfee7d37acc6cf83c13a5074cfb0740e316a45\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://965024e29be08418fd9acef578b5253af5fb0d39227c291298d83dae5d7ffd01\",\"dweb:/ipfs/QmPh2h21EC6L4aWauvk5cFzc4x3Xf4f1brxyrgxeKUuWEs\"]},\"src/libraries/ArbiterUtils.sol\":{\"keccak256\":\"0xb87e2bfb9c7292daf6426fbedc09c8683b92841d1b92e7359c0ff94d42be632f\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://3acf498c3c59891d76db768ea57d8f7f6b4010dcbaf44a5f93d95d72f0b12441\",\"dweb:/ipfs/QmVbkioM8dWwYxqatm1dyo9PRFNZ6c7Kbang7pozbnyS7j\"]},\"src/libraries/SchemaRegistryUtils.sol\":{\"keccak256\":\"0x81e4728ad79515866f28175a00a512afd2f7010bd109ae221defb29a87430cd0\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://4edac7284c764f1236b5875ed00f357f0e30aecc5006c88afe220bef60b541d3\",\"dweb:/ipfs/QmXj8oLa1RXMgHCXtgdbriVqQFgX6rjnPNbmQpwpK2YXsK\"]},\"src/obligations/escrow/default/NativeTokenEscrowObligation.sol\":{\"keccak256\":\"0x4f5b137904586c6c27ef47fa063c7a645a2da44fbfa051e5c21db57b4a92c074\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://a739f8873a28033552c105dfe53655e930e3c90ddb5970b37047c35ead362a8b\",\"dweb:/ipfs/QmSfE6wVYXsbvcmpqAgX1P7AD5Ys7ffTRsuEoQM69xxpUu\"]}},\"version\":1}",
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
          "name": "IncorrectPayment"
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
          "inputs": [
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "type": "error",
          "name": "NativeTokenTransferFailed"
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
              "internalType": "struct NativeTokenEscrowObligation.ObligationData",
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
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ]
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "struct NativeTokenEscrowObligation.ObligationData",
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
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
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
              "internalType": "struct NativeTokenEscrowObligation.ObligationData",
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
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
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
              "internalType": "struct NativeTokenEscrowObligation.ObligationData",
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
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
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
            "notice": "Decodes ABI-encoded native-token escrow data."
          },
          "doObligation((address,bytes,uint256),uint64)": {
            "notice": "Locks native token and creates an escrow attestation for the caller."
          },
          "doObligationFor((address,bytes,uint256),uint64,address)": {
            "notice": "Locks native token and creates an escrow attestation for an explicit recipient."
          },
          "doObligationRaw(bytes,uint64,bytes32)": {
            "notice": "Creates an obligation attestation from pre-encoded data."
          },
          "getObligationData(bytes32)": {
            "notice": "Loads and decodes native-token escrow data from this contract's attestation."
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
        "src/obligations/escrow/default/NativeTokenEscrowObligation.sol": "NativeTokenEscrowObligation"
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
      "src/obligations/escrow/default/NativeTokenEscrowObligation.sol": {
        "keccak256": "0x4f5b137904586c6c27ef47fa063c7a645a2da44fbfa051e5c21db57b4a92c074",
        "urls": [
          "bzz-raw://a739f8873a28033552c105dfe53655e930e3c90ddb5970b37047c35ead362a8b",
          "dweb:/ipfs/QmSfE6wVYXsbvcmpqAgX1P7AD5Ys7ffTRsuEoQM69xxpUu"
        ],
        "license": "UNLICENSED"
      }
    },
    "version": 1
  },
  "id": 133
} as const;
