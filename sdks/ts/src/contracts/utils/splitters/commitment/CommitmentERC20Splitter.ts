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
          "name": "_escrowObligation",
          "type": "address",
          "internalType": "contract ERC20EscrowObligation"
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
      "name": "EXECUTOR_SENTINEL",
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
      "name": "MAX_SPLITS",
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
      "name": "activeSettlement",
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
      "name": "arbitrate",
      "inputs": [
        {
          "name": "intentHash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "escrow",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "splits",
          "type": "tuple[]",
          "internalType": "struct CommitmentERC20Splitter.Split[]",
          "components": [
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
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "attestationIntentHash",
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
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "attestationIntentHash",
      "inputs": [
        {
          "name": "schema",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "attester",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "recipient",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "expirationTime",
          "type": "uint64",
          "internalType": "uint64"
        },
        {
          "name": "revocable",
          "type": "bool",
          "internalType": "bool"
        },
        {
          "name": "refUID",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "dataHash",
          "type": "bytes32",
          "internalType": "bytes32"
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
      "name": "attestationIntentHash",
      "inputs": [
        {
          "name": "schema",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "attester",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "recipient",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "expirationTime",
          "type": "uint64",
          "internalType": "uint64"
        },
        {
          "name": "revocable",
          "type": "bool",
          "internalType": "bool"
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
      "name": "check",
      "inputs": [
        {
          "name": "fulfillment",
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
          "name": "escrow",
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
      "name": "collectAndDistribute",
      "inputs": [
        {
          "name": "escrow",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "fulfillment",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "createFulfillment",
      "inputs": [
        {
          "name": "obligationContract",
          "type": "address",
          "internalType": "address"
        },
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
          "name": "fulfillmentUid",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "createFulfillmentAndCollectAndDistribute",
      "inputs": [
        {
          "name": "escrow",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "obligationContract",
          "type": "address",
          "internalType": "address"
        },
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
          "name": "fulfillmentUid",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "payable"
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
          "internalType": "struct CommitmentERC20Splitter.DemandData",
          "components": [
            {
              "name": "oracle",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "data",
              "type": "bytes",
              "internalType": "bytes"
            }
          ]
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "eas",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract IEAS"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "escrowObligation",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract IEscrow"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "fulfillers",
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
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "fulfillmentIntentHash",
      "inputs": [
        {
          "name": "schema",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "attester",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "recipient",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "expirationTime",
          "type": "uint64",
          "internalType": "uint64"
        },
        {
          "name": "revocable",
          "type": "bool",
          "internalType": "bool"
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
        },
        {
          "name": "fulfiller",
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
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "fulfillmentIntentHash",
      "inputs": [
        {
          "name": "schema",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "attester",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "recipient",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "expirationTime",
          "type": "uint64",
          "internalType": "uint64"
        },
        {
          "name": "revocable",
          "type": "bool",
          "internalType": "bool"
        },
        {
          "name": "refUID",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "dataHash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "fulfiller",
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
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "fulfillmentIntentHash",
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
        },
        {
          "name": "fulfiller",
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
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "getSplits",
      "inputs": [
        {
          "name": "oracle",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "intentHash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "escrow",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple[]",
          "internalType": "struct CommitmentERC20Splitter.Split[]",
          "components": [
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
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "hasDecision",
      "inputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
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
      "name": "requestArbitration",
      "inputs": [
        {
          "name": "intentHash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "escrow",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "oracle",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "demand",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
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
      "name": "unsafePartiallyCollectAndDistribute",
      "inputs": [
        {
          "name": "escrow",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "fulfillment",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "ArbitrationMade",
      "inputs": [
        {
          "name": "decisionKey",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "intentHash",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "oracle",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "splits",
          "type": "tuple[]",
          "indexed": false,
          "internalType": "struct CommitmentERC20Splitter.Split[]",
          "components": [
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
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ArbitrationRequested",
      "inputs": [
        {
          "name": "fulfillment",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "escrow",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "oracle",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "demand",
          "type": "bytes",
          "indexed": false,
          "internalType": "bytes"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "CommitmentArbitrationRequested",
      "inputs": [
        {
          "name": "intentHash",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "escrow",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "oracle",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "demand",
          "type": "bytes",
          "indexed": false,
          "internalType": "bytes"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ERC20TransferFailedOnDistribute",
      "inputs": [
        {
          "name": "recipient",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "token",
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
      "name": "EscrowCollectedAndDistributed",
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
        },
        {
          "name": "token",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        },
        {
          "name": "splits",
          "type": "tuple[]",
          "indexed": false,
          "internalType": "struct CommitmentERC20Splitter.Split[]",
          "components": [
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
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "FulfillmentCreated",
      "inputs": [
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
        },
        {
          "name": "obligationContract",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
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
      "name": "ERC20TransferFailed",
      "inputs": [
        {
          "name": "token",
          "type": "address",
          "internalType": "address"
        },
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
      "name": "EmptySplits",
      "inputs": []
    },
    {
      "type": "error",
      "name": "FulfillerAlreadyRecorded",
      "inputs": [
        {
          "name": "fulfillment",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ]
    },
    {
      "type": "error",
      "name": "InvalidAttestationUid",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidCollectedAmount",
      "inputs": [
        {
          "name": "expected",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "actual",
          "type": "uint256",
          "internalType": "uint256"
        }
      ]
    },
    {
      "type": "error",
      "name": "InvalidCreatedFulfillment",
      "inputs": [
        {
          "name": "fulfillment",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ]
    },
    {
      "type": "error",
      "name": "InvalidEscrowAttestation",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidFulfillmentRecipient",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidFulfillmentUid",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidSplits",
      "inputs": [
        {
          "name": "totalExpected",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "totalProvided",
          "type": "uint256",
          "internalType": "uint256"
        }
      ]
    },
    {
      "type": "error",
      "name": "NoFulfillerRecorded",
      "inputs": [
        {
          "name": "fulfillment",
          "type": "bytes32",
          "internalType": "bytes32"
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
      "name": "TooManySplits",
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
      "name": "UnauthorizedArbitrationRequest",
      "inputs": []
    },
    {
      "type": "error",
      "name": "UnauthorizedPartialSettlement",
      "inputs": [
        {
          "name": "fulfillment",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "caller",
          "type": "address",
          "internalType": "address"
        }
      ]
    }
  ],
  "bytecode": {
    "object": "0x60a0346100c257601f611ffc38819003918201601f19168301916001600160401b038311848410176100c65780849260409485528339810103126100c25780516001600160a01b03811691908290036100c257602001516001600160a01b03811691908290036100c25760017f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00555f80546001600160a01b031916919091179055608052604051611f2190816100db82396080518181816101b601526117a20152f35b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe608080604052600436101561001c575b50361561001a575f80fd5b005b5f3560e01c90816301ffc9a7146110705750806320249e2014610fed5780632257c0e314610f2357806333f37e4a14610edb57806339fcc92b14610ebe5780633de93b3814610db95780634e2d3b1214610d875780635123666d14610a625780636c09ac16146109eb5780638150864d146109c4578063838a68d9146108e857806386314b0d146107cb5780638da3721a1461070d5780638ed98101146105835780639e22e24c14610532578063a0c16047146104ef578063a1a80488146104a6578063b48210ca1461048b578063c880c06f1461046f578063cd8c1ef3146103fa578063d1be3507146101e5578063d43a0c93146101a15763ed7180e314610125575f61000f565b608036600319011261019d57610139611145565b6024356001600160401b03811161019d57610158903690600401611353565b916044356001600160401b038116810361019d576020936101849361017b611725565b60643593611c75565b60015f516020611ecc5f395f51905f5255604051908152f35b5f80fd5b3461019d575f36600319011261019d576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b3461019d576101f33661133d565b906101fc611725565b5f8281526003602052604080822054825491516328c44a9960e21b815260048101869052926001600160a01b0391821692909184916024918391165afa9182156103ef575f926103cb575b5033141590816103b3575b5061039c57610261828261175d565b5f848152600360205260408120546001600160a01b031694905b8351811015610352576001906102a687846001600160a01b0361029e858a611405565b515116611bd3565b828060a01b0385169060206102bb8489611405565b510151906040519063a9059cbb60e01b5f52858060a01b0316918260045260245260205f60448180875af190855f5114821615610343575b60405215610304575b50500161027b565b7ff74480709fec33a3b1a6a81aaf2a8fa70d719b88009fbee204be461d84f84df0602080610332868b611405565b510151604051908152a387806102fc565b90833b15153d151616906102f3565b5092917f714782dc6680078d5eb534cd9b313845e31db3ecb4bf91d308795ef34ec7b0ea9161038660405192839283611419565b0390a460015f516020611ecc5f395f51905f5255005b506345fbd31960e11b5f526004523360245260445ffd5b60e001516001600160a01b0316331415905083610252565b6103e89192503d805f833e6103e081836110fa565b8101906114a9565b9084610247565b6040513d5f823e3d90fd5b3461019d5760e036600319011261019d5761041361115b565b61041b611171565b9061042461111b565b9161042d6111b1565b9160c435926001600160401b03841161019d57602094610454610467953690600401611211565b8681519101209360a435936004356113a4565b604051908152f35b3461019d575f36600319011261019d57602060405161eeee8152f35b3461019d575f36600319011261019d57602060405160328152f35b3461019d57604036600319011261019d576001600160a01b036104c7611145565b165f52600160205260405f206024355f52602052602060ff60405f2054166040519015158152f35b3461019d57604036600319011261019d576004356001600160401b03811161019d57610467610524602092369060040161122f565b61052c61115b565b906116b0565b3461019d5761010036600319011261019d57602061046761055161115b565b610559611171565b61056161111b565b9161056a6111b1565b610572611187565b9360c4359360a43593600435611679565b60a036600319011261019d5760043561059a61115b565b604435906001600160401b03821161019d576105bd6105d7923690600401611353565b6105c561111b565b916105ce611725565b60843593611c75565b906105e2828261175d565b5f84815260036020526040812054929491926001600160a01b031691905b85518110156106ba5761062083836001600160a01b0361029e858b611405565b6001600160a01b038516906020610637848a611405565b510151906040519063a9059cbb60e01b5f5260018060a01b0316918260045260245260205f60448180875af19060015f51148216156106ab575b60405215610683575050600101610600565b602061068f848a611405565b510151916307a1d48760e01b5f5260045260245260445260645ffd5b90833b15153d15161690610671565b506020937f714782dc6680078d5eb534cd9b313845e31db3ecb4bf91d308795ef34ec7b0ea8683956106f160405192839283611419565b0390a460015f516020611ecc5f395f51905f5255604051908152f35b3461019d57606036600319011261019d576004356001600160401b03811161019d5761073d90369060040161122f565b6024356001600160401b03811161019d5761077a610762610784923690600401611211565b61076b84611c24565b60208082518301019101611616565b9160443590611c48565b908160025414908161079e575b6020826040519015158152f35b905060018060a01b039051165f52600160205260405f20905f52602052602060ff60405f20541682610791565b3461019d57608036600319011261019d576024356107e7611171565b906064356001600160401b03811161019d57610807903690600401611211565b5f80546040516328c44a9960e21b8152600481018590529190829060249082906001600160a01b03165afa9081156103ef575f916108ce575b5060e08101516001600160a01b031633141590816108b6575b506108a7577f108df26ad37e907e17227d7de58b0e241bfb128eae0ecea60f6bdb6082b2b146604051936020855260018060a01b031693806108a2600435946020830190611380565b0390a4005b63ff323ecb60e01b5f5260045ffd5b60c001516001600160a01b0316331415905084610859565b6108e291503d805f833e6103e081836110fa565b84610840565b3461019d57602036600319011261019d576004356001600160401b03811161019d57610918903690600401611353565b60606020604051610928816110c3565b5f8152015281019060208183031261019d578035906001600160401b03821161019d570160408183031261019d5760405191610963836110c3565b61096c8261119d565b835260208201356001600160401b03811161019d5761098b9201611211565b90602081019182526109c06040519283926020845260018060a01b039051166020840152516040808401526060830190611380565b0390f35b3461019d575f36600319011261019d575f546040516001600160a01b039091168152602090f35b3461019d5761010036600319011261019d57610a0561115b565b610a0d611171565b90610a1661111b565b610a1e6111b1565b9260c435926001600160401b03841161019d57602094610a45610467953690600401611211565b93610a4e611187565b948781519101209360a43593600435611679565b3461019d57606036600319011261019d576044356004356024356001600160401b03831161019d573660238401121561019d578260040135906001600160401b03821161019d576024840193602436918460061b01011161019d575f80546040516328c44a9960e21b8152600481018490529190829060249082906001600160a01b03165afa80156103ef57610120610b11916060935f91610d6d575b50015160208082518301019101611586565b01518215610d5e5760328311610d46575f905f5b848110610d245750808203610d0f575050610b409083611705565b90335f52600460205260405f20825f5260205260405f208054905f815581610cc4575b50505f5b818110610c0a5750335f52600160205260405f20825f5260205260405f20600160ff1982541617905560405190806020830160208452526040820194905f5b818110610bda57505050807fcb69e0d2c25bc3247c37f1a1b54a09e56f58301351ae8eeb49fb9750045ba7409133950390a4005b909195604080600192838060a01b03610bf28b61119d565b16815260208a81013590820152019701929101610ba6565b335f52600460205260405f20835f5260205260405f2090610c2c818488611c14565b9180549068010000000000000000821015610cb05760018201808255821015610c9c575f5260205f209060011b0182359260018060a01b038416840361019d5781546001600160a01b0319166001600160a01b039094169390931781556020929092013560019283015501610b67565b634e487b7160e01b5f52603260045260245ffd5b634e487b7160e01b5f52604160045260245ffd5b6001600160ff1b0382168203610cfb575f5260205f209060011b8101905b81811015610b63575f8082556001820155600201610ce2565b634e487b7160e01b5f52601160045260245ffd5b63ba660bff60e01b5f5260045260245260445ffd5b916020610d3284878a611c14565b01358101809111610cfb5791600101610b25565b8263b268613560e01b5f52600452603260245260445ffd5b63143160cf60e01b5f5260045ffd5b610d8191503d805f833e6103e081836110fa565b88610aff565b3461019d57602036600319011261019d576004355f526003602052602060018060a01b0360405f205416604051908152f35b3461019d57610dc73661133d565b90610dd0611725565b610dda828261175d565b5f84815260036020526040812054929491926001600160a01b031691905b8551811015610e8a57610e1883836001600160a01b0361029e858b611405565b6001600160a01b038516906020610e2f848a611405565b510151906040519063a9059cbb60e01b5f5260018060a01b0316918260045260245260205f60448180875af19060015f5114821615610e7b575b60405215610683575050600101610df8565b90833b15153d15161690610e69565b50837f714782dc6680078d5eb534cd9b313845e31db3ecb4bf91d308795ef34ec7b0ea868561038660405192839283611419565b3461019d575f36600319011261019d576020600254604051908152f35b3461019d5760e036600319011261019d576020610467610ef961115b565b610f01611171565b90610f0a61111b565b610f126111b1565b9060c4359360a435936004356113a4565b3461019d57606036600319011261019d576001600160a01b03610f44611145565b165f52600460205260405f20610f5e604435602435611705565b5f5260205260405f2080546001600160401b038111610cb05760405191610f8b60208360051b01846110fa565b81835260208301905f5260205f205f915b838310610fb957604051602080825281906109c0908201886112f5565b60026020600192604051610fcc816110c3565b848060a01b0386541681528486015483820152815201920192019190610f9c565b3461019d57602036600319011261019d576004356001600160401b03811161019d57610467611022602092369060040161122f565b828101519060018060a01b0360e08201511660018060a01b0360c0830151166001600160401b036060840151169061010084015115159261012060a0860151950151888151910120956113a4565b3461019d57602036600319011261019d576004359063ffffffff60e01b821680920361019d576020916346d1b90d60e11b81149081156110b2575b5015158152f35b6301ffc9a760e01b149050836110ab565b604081019081106001600160401b03821117610cb057604052565b61014081019081106001600160401b03821117610cb057604052565b90601f801991011681019081106001600160401b03821117610cb057604052565b606435906001600160401b038216820361019d57565b35906001600160401b038216820361019d57565b600435906001600160a01b038216820361019d57565b602435906001600160a01b038216820361019d57565b604435906001600160a01b038216820361019d57565b60e435906001600160a01b038216820361019d57565b35906001600160a01b038216820361019d57565b60843590811515820361019d57565b6001600160401b038111610cb057601f01601f191660200190565b9291926111e7826111c0565b916111f560405193846110fa565b82948184528183011161019d578281602093845f960137010152565b9080601f8301121561019d5781602061122c933591016111db565b90565b91906101408382031261019d5760405190611249826110de565b8193803583526020810135602084015261126560408201611131565b604084015261127660608201611131565b606084015261128760808201611131565b608084015260a081013560a08401526112a260c0820161119d565b60c08401526112b360e0820161119d565b60e0840152610100810135801515810361019d57610100840152610120810135916001600160401b03831161019d57610120926112f09201611211565b910152565b90602080835192838152019201905f5b8181106113125750505090565b825180516001600160a01b031685526020908101518186015260409094019390920191600101611305565b604090600319011261019d576004359060243590565b9181601f8401121561019d578235916001600160401b03831161019d576020838186019501011161019d57565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b959391926001600160401b03919593604051966020880198895260018060a01b0316604088015260018060a01b03166060870152166080850152151560a084015260c083015260e082015260e081526113ff610100826110fa565b51902090565b8051821015610c9c5760209160051b010190565b6001600160a01b03909116815260406020820181905261122c929101906112f5565b51906001600160401b038216820361019d57565b51906001600160a01b038216820361019d57565b81601f8201121561019d5780519061147a826111c0565b9261148860405194856110fa565b8284526020838301011161019d57815f9260208093018386015e8301015290565b60208183031261019d578051906001600160401b03821161019d57016101408183031261019d57604051916114dd836110de565b81518352602082015160208401526114f76040830161143b565b60408401526115086060830161143b565b60608401526115196080830161143b565b608084015260a082015160a084015261153460c0830161144f565b60c084015261154560e0830161144f565b60e0840152610100820151801515810361019d576101008401526101208201516001600160401b03811161019d5761157d9201611463565b61012082015290565b60208183031261019d578051906001600160401b03821161019d57019060808282031261019d5760405191608083018381106001600160401b03821117610cb0576040526115d38161144f565b835260208101516001600160401b03811161019d576060926115f6918301611463565b60208401526116076040820161144f565b60408401520151606082015290565b60208183031261019d578051906001600160401b03821161019d570160408183031261019d5760405191611649836110c3565b6116528261144f565b835260208201516001600160401b03811161019d576116719201611463565b602082015290565b906116889695949392916113a4565b60408051602081019283526001600160a01b03909316838201528252906113ff6060826110fa565b9061122c9160208101519060018060a01b0360e08201511660018060a01b0360c0830151166001600160401b036060840151169061010084015115159261012060a08601519501516020815191012095611679565b9060405190602082019283526040820152604081526113ff6060826110fa565b60025f516020611ecc5f395f51905f52541461174e5760025f516020611ecc5f395f51905f5255565b633ee5aeb560e01b5f5260045ffd5b9160018060a01b035f5416604051906328c44a9960e21b82528460048301525f82602481845afa9182156103ef575f92611bb7575b5060e08201516001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000811691168114801590611b51575b611b4257825115611b33576001600160401b036060840151168015159081611b28575b50611b19576001600160401b03608084015116611b0a576040516328c44a9960e21b815260048101869052925f84602481865afa9384156103ef575f94611ae6575b506101206118569161184586611c24565b015160208082518301019101611586565b92602084015161187660018060a01b039160208082518301019101611616565b51165f52600460205261188d8760405f2092611c48565b5f5260205260405f2080546001600160401b038111610cb057604051916118ba60208360051b01846110fa565b81835260208301905f5260205f205f915b838310611ab257505050509560018060a01b0360408501511695604051936370a0823160e01b85523060048601526020856024818b5afa9485156103ef575f95611a7e575b505f602491604051928380926328c44a9960e21b82528660048301525afa9283156103ef5761194b815f956044948791611a64575b50611c48565b600255836040519586948593633a9bb12760e21b8552600485015260248401525af180156103ef57611a2a575b505f6002556040516370a0823160e01b815230600482015291602083602481885afa9283156103ef575f936119f5575b5060600151908083106119de578203918211610cfb578082036119c9575050565b631a3dba0360e31b5f5260045260245260445ffd5b50631a3dba0360e31b5f526004525f60245260445ffd5b9092506020813d602011611a22575b81611a11602093836110fa565b8101031261019d57519160606119a8565b3d9150611a04565b3d805f833e611a3981836110fa565b810160208282031261019d5781516001600160401b03811161019d57611a5f9201611463565b611978565b611a7891503d8089833e6103e081836110fa565b5f611945565b9094506020813d602011611aaa575b81611a9a602093836110fa565b8101031261019d5751935f611910565b3d9150611a8d565b60026020600192604051611ac5816110c3565b848060a01b03865416815284860154838201528152019201920191906118cb565b611856919450611b02610120913d805f833e6103e081836110fa565b949150611834565b637b6227e960e11b5f5260045ffd5b631ab7da6b60e01b5f5260045ffd5b90504210155f6117f2565b635c2c7f8960e01b5f5260045ffd5b63629cd40b60e11b5f5260045ffd5b50602083810151604051635bf2f20d60e01b81529182600481865afa9182156103ef575f92611b83575b5014156117cf565b9091506020813d602011611baf575b81611b9f602093836110fa565b8101031261019d5751905f611b7b565b3d9150611b92565b611bcc9192503d805f833e6103e081836110fa565b905f611792565b91906001600160a01b03831661eeee14611bec57505090565b9091506001600160a01b03821615611c02575090565b6379c5a2db60e01b5f5260045260245ffd5b9190811015610c9c5760061b0190565b60c001516001600160a01b03163003611c3957565b634672d00f60e01b5f5260045ffd5b80515f9081526003602052604090205461122c9291611c70916001600160a01b0316906116b0565b611705565b604051632cee40b560e21b815260606004820152606481018490529495946001600160a01b03909116939092906001600160401b0390828460848701375f608484870101521691826024850152866044850152602084608481601f19601f870116810103018134895af19384156103ef575f94611e97575b5083968415611e88575f80546040516328c44a9960e21b815260048101889052929190839060249082906001600160a01b03165afa9182156103ef575f92611e6c575b508582511494851595611e54575b8515611e3c575b8515611e24575b508415611e15575b508315611dea575b505050611dd8575f818152600360205260409020546001600160a01b0316611dc6575f81815260036020526040812080546001600160a01b0319163390811790915591907ff845579b2e96200541b4e2b438fbb65e772b70ac68265030aa16f6d8e16501d99080a4565b63aa8904b160e01b5f5260045260245ffd5b63f9d7a76560e01b5f5260045260245ffd5b611e049293506101200151602081519101209236916111db565b6020815191012014155f8080611d5c565b60a0820151141593505f611d54565b60608301516001600160401b0316141594505f611d4c565b60c08301516001600160a01b03163014159550611d45565b60e08301516001600160a01b03168814159550611d3e565b611e819192503d805f833e6103e081836110fa565b905f611d30565b6303acddcd60e41b5f5260045ffd5b9093506020813d602011611ec3575b81611eb3602093836110fa565b8101031261019d5751925f611ced565b3d9150611ea656fe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a2646970667358221220ea5e7452770ba9d0893a3620718bfb251299c27937b19b38de22230066ff05bf64736f6c634300081b0033",
    "sourceMap": "841:7367:169:-:0;;;;;;;;;;;;;-1:-1:-1;;841:7367:169;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;2365:1:68;1505:66;2365:1;-1:-1:-1;841:7367:169;;-1:-1:-1;;;;;;841:7367:169;;;;;;;3409:36:174;;841:7367:169;;;;;;;;3409:36:174;841:7367:169;;;;;;;;;;;;-1:-1:-1;841:7367:169;;;;;;-1:-1:-1;841:7367:169;;;;;-1:-1:-1;841:7367:169",
    "linkReferences": {}
  },
  "deployedBytecode": {
    "object": "0x608080604052600436101561001c575b50361561001a575f80fd5b005b5f3560e01c90816301ffc9a7146110705750806320249e2014610fed5780632257c0e314610f2357806333f37e4a14610edb57806339fcc92b14610ebe5780633de93b3814610db95780634e2d3b1214610d875780635123666d14610a625780636c09ac16146109eb5780638150864d146109c4578063838a68d9146108e857806386314b0d146107cb5780638da3721a1461070d5780638ed98101146105835780639e22e24c14610532578063a0c16047146104ef578063a1a80488146104a6578063b48210ca1461048b578063c880c06f1461046f578063cd8c1ef3146103fa578063d1be3507146101e5578063d43a0c93146101a15763ed7180e314610125575f61000f565b608036600319011261019d57610139611145565b6024356001600160401b03811161019d57610158903690600401611353565b916044356001600160401b038116810361019d576020936101849361017b611725565b60643593611c75565b60015f516020611ecc5f395f51905f5255604051908152f35b5f80fd5b3461019d575f36600319011261019d576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b3461019d576101f33661133d565b906101fc611725565b5f8281526003602052604080822054825491516328c44a9960e21b815260048101869052926001600160a01b0391821692909184916024918391165afa9182156103ef575f926103cb575b5033141590816103b3575b5061039c57610261828261175d565b5f848152600360205260408120546001600160a01b031694905b8351811015610352576001906102a687846001600160a01b0361029e858a611405565b515116611bd3565b828060a01b0385169060206102bb8489611405565b510151906040519063a9059cbb60e01b5f52858060a01b0316918260045260245260205f60448180875af190855f5114821615610343575b60405215610304575b50500161027b565b7ff74480709fec33a3b1a6a81aaf2a8fa70d719b88009fbee204be461d84f84df0602080610332868b611405565b510151604051908152a387806102fc565b90833b15153d151616906102f3565b5092917f714782dc6680078d5eb534cd9b313845e31db3ecb4bf91d308795ef34ec7b0ea9161038660405192839283611419565b0390a460015f516020611ecc5f395f51905f5255005b506345fbd31960e11b5f526004523360245260445ffd5b60e001516001600160a01b0316331415905083610252565b6103e89192503d805f833e6103e081836110fa565b8101906114a9565b9084610247565b6040513d5f823e3d90fd5b3461019d5760e036600319011261019d5761041361115b565b61041b611171565b9061042461111b565b9161042d6111b1565b9160c435926001600160401b03841161019d57602094610454610467953690600401611211565b8681519101209360a435936004356113a4565b604051908152f35b3461019d575f36600319011261019d57602060405161eeee8152f35b3461019d575f36600319011261019d57602060405160328152f35b3461019d57604036600319011261019d576001600160a01b036104c7611145565b165f52600160205260405f206024355f52602052602060ff60405f2054166040519015158152f35b3461019d57604036600319011261019d576004356001600160401b03811161019d57610467610524602092369060040161122f565b61052c61115b565b906116b0565b3461019d5761010036600319011261019d57602061046761055161115b565b610559611171565b61056161111b565b9161056a6111b1565b610572611187565b9360c4359360a43593600435611679565b60a036600319011261019d5760043561059a61115b565b604435906001600160401b03821161019d576105bd6105d7923690600401611353565b6105c561111b565b916105ce611725565b60843593611c75565b906105e2828261175d565b5f84815260036020526040812054929491926001600160a01b031691905b85518110156106ba5761062083836001600160a01b0361029e858b611405565b6001600160a01b038516906020610637848a611405565b510151906040519063a9059cbb60e01b5f5260018060a01b0316918260045260245260205f60448180875af19060015f51148216156106ab575b60405215610683575050600101610600565b602061068f848a611405565b510151916307a1d48760e01b5f5260045260245260445260645ffd5b90833b15153d15161690610671565b506020937f714782dc6680078d5eb534cd9b313845e31db3ecb4bf91d308795ef34ec7b0ea8683956106f160405192839283611419565b0390a460015f516020611ecc5f395f51905f5255604051908152f35b3461019d57606036600319011261019d576004356001600160401b03811161019d5761073d90369060040161122f565b6024356001600160401b03811161019d5761077a610762610784923690600401611211565b61076b84611c24565b60208082518301019101611616565b9160443590611c48565b908160025414908161079e575b6020826040519015158152f35b905060018060a01b039051165f52600160205260405f20905f52602052602060ff60405f20541682610791565b3461019d57608036600319011261019d576024356107e7611171565b906064356001600160401b03811161019d57610807903690600401611211565b5f80546040516328c44a9960e21b8152600481018590529190829060249082906001600160a01b03165afa9081156103ef575f916108ce575b5060e08101516001600160a01b031633141590816108b6575b506108a7577f108df26ad37e907e17227d7de58b0e241bfb128eae0ecea60f6bdb6082b2b146604051936020855260018060a01b031693806108a2600435946020830190611380565b0390a4005b63ff323ecb60e01b5f5260045ffd5b60c001516001600160a01b0316331415905084610859565b6108e291503d805f833e6103e081836110fa565b84610840565b3461019d57602036600319011261019d576004356001600160401b03811161019d57610918903690600401611353565b60606020604051610928816110c3565b5f8152015281019060208183031261019d578035906001600160401b03821161019d570160408183031261019d5760405191610963836110c3565b61096c8261119d565b835260208201356001600160401b03811161019d5761098b9201611211565b90602081019182526109c06040519283926020845260018060a01b039051166020840152516040808401526060830190611380565b0390f35b3461019d575f36600319011261019d575f546040516001600160a01b039091168152602090f35b3461019d5761010036600319011261019d57610a0561115b565b610a0d611171565b90610a1661111b565b610a1e6111b1565b9260c435926001600160401b03841161019d57602094610a45610467953690600401611211565b93610a4e611187565b948781519101209360a43593600435611679565b3461019d57606036600319011261019d576044356004356024356001600160401b03831161019d573660238401121561019d578260040135906001600160401b03821161019d576024840193602436918460061b01011161019d575f80546040516328c44a9960e21b8152600481018490529190829060249082906001600160a01b03165afa80156103ef57610120610b11916060935f91610d6d575b50015160208082518301019101611586565b01518215610d5e5760328311610d46575f905f5b848110610d245750808203610d0f575050610b409083611705565b90335f52600460205260405f20825f5260205260405f208054905f815581610cc4575b50505f5b818110610c0a5750335f52600160205260405f20825f5260205260405f20600160ff1982541617905560405190806020830160208452526040820194905f5b818110610bda57505050807fcb69e0d2c25bc3247c37f1a1b54a09e56f58301351ae8eeb49fb9750045ba7409133950390a4005b909195604080600192838060a01b03610bf28b61119d565b16815260208a81013590820152019701929101610ba6565b335f52600460205260405f20835f5260205260405f2090610c2c818488611c14565b9180549068010000000000000000821015610cb05760018201808255821015610c9c575f5260205f209060011b0182359260018060a01b038416840361019d5781546001600160a01b0319166001600160a01b039094169390931781556020929092013560019283015501610b67565b634e487b7160e01b5f52603260045260245ffd5b634e487b7160e01b5f52604160045260245ffd5b6001600160ff1b0382168203610cfb575f5260205f209060011b8101905b81811015610b63575f8082556001820155600201610ce2565b634e487b7160e01b5f52601160045260245ffd5b63ba660bff60e01b5f5260045260245260445ffd5b916020610d3284878a611c14565b01358101809111610cfb5791600101610b25565b8263b268613560e01b5f52600452603260245260445ffd5b63143160cf60e01b5f5260045ffd5b610d8191503d805f833e6103e081836110fa565b88610aff565b3461019d57602036600319011261019d576004355f526003602052602060018060a01b0360405f205416604051908152f35b3461019d57610dc73661133d565b90610dd0611725565b610dda828261175d565b5f84815260036020526040812054929491926001600160a01b031691905b8551811015610e8a57610e1883836001600160a01b0361029e858b611405565b6001600160a01b038516906020610e2f848a611405565b510151906040519063a9059cbb60e01b5f5260018060a01b0316918260045260245260205f60448180875af19060015f5114821615610e7b575b60405215610683575050600101610df8565b90833b15153d15161690610e69565b50837f714782dc6680078d5eb534cd9b313845e31db3ecb4bf91d308795ef34ec7b0ea868561038660405192839283611419565b3461019d575f36600319011261019d576020600254604051908152f35b3461019d5760e036600319011261019d576020610467610ef961115b565b610f01611171565b90610f0a61111b565b610f126111b1565b9060c4359360a435936004356113a4565b3461019d57606036600319011261019d576001600160a01b03610f44611145565b165f52600460205260405f20610f5e604435602435611705565b5f5260205260405f2080546001600160401b038111610cb05760405191610f8b60208360051b01846110fa565b81835260208301905f5260205f205f915b838310610fb957604051602080825281906109c0908201886112f5565b60026020600192604051610fcc816110c3565b848060a01b0386541681528486015483820152815201920192019190610f9c565b3461019d57602036600319011261019d576004356001600160401b03811161019d57610467611022602092369060040161122f565b828101519060018060a01b0360e08201511660018060a01b0360c0830151166001600160401b036060840151169061010084015115159261012060a0860151950151888151910120956113a4565b3461019d57602036600319011261019d576004359063ffffffff60e01b821680920361019d576020916346d1b90d60e11b81149081156110b2575b5015158152f35b6301ffc9a760e01b149050836110ab565b604081019081106001600160401b03821117610cb057604052565b61014081019081106001600160401b03821117610cb057604052565b90601f801991011681019081106001600160401b03821117610cb057604052565b606435906001600160401b038216820361019d57565b35906001600160401b038216820361019d57565b600435906001600160a01b038216820361019d57565b602435906001600160a01b038216820361019d57565b604435906001600160a01b038216820361019d57565b60e435906001600160a01b038216820361019d57565b35906001600160a01b038216820361019d57565b60843590811515820361019d57565b6001600160401b038111610cb057601f01601f191660200190565b9291926111e7826111c0565b916111f560405193846110fa565b82948184528183011161019d578281602093845f960137010152565b9080601f8301121561019d5781602061122c933591016111db565b90565b91906101408382031261019d5760405190611249826110de565b8193803583526020810135602084015261126560408201611131565b604084015261127660608201611131565b606084015261128760808201611131565b608084015260a081013560a08401526112a260c0820161119d565b60c08401526112b360e0820161119d565b60e0840152610100810135801515810361019d57610100840152610120810135916001600160401b03831161019d57610120926112f09201611211565b910152565b90602080835192838152019201905f5b8181106113125750505090565b825180516001600160a01b031685526020908101518186015260409094019390920191600101611305565b604090600319011261019d576004359060243590565b9181601f8401121561019d578235916001600160401b03831161019d576020838186019501011161019d57565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b959391926001600160401b03919593604051966020880198895260018060a01b0316604088015260018060a01b03166060870152166080850152151560a084015260c083015260e082015260e081526113ff610100826110fa565b51902090565b8051821015610c9c5760209160051b010190565b6001600160a01b03909116815260406020820181905261122c929101906112f5565b51906001600160401b038216820361019d57565b51906001600160a01b038216820361019d57565b81601f8201121561019d5780519061147a826111c0565b9261148860405194856110fa565b8284526020838301011161019d57815f9260208093018386015e8301015290565b60208183031261019d578051906001600160401b03821161019d57016101408183031261019d57604051916114dd836110de565b81518352602082015160208401526114f76040830161143b565b60408401526115086060830161143b565b60608401526115196080830161143b565b608084015260a082015160a084015261153460c0830161144f565b60c084015261154560e0830161144f565b60e0840152610100820151801515810361019d576101008401526101208201516001600160401b03811161019d5761157d9201611463565b61012082015290565b60208183031261019d578051906001600160401b03821161019d57019060808282031261019d5760405191608083018381106001600160401b03821117610cb0576040526115d38161144f565b835260208101516001600160401b03811161019d576060926115f6918301611463565b60208401526116076040820161144f565b60408401520151606082015290565b60208183031261019d578051906001600160401b03821161019d570160408183031261019d5760405191611649836110c3565b6116528261144f565b835260208201516001600160401b03811161019d576116719201611463565b602082015290565b906116889695949392916113a4565b60408051602081019283526001600160a01b03909316838201528252906113ff6060826110fa565b9061122c9160208101519060018060a01b0360e08201511660018060a01b0360c0830151166001600160401b036060840151169061010084015115159261012060a08601519501516020815191012095611679565b9060405190602082019283526040820152604081526113ff6060826110fa565b60025f516020611ecc5f395f51905f52541461174e5760025f516020611ecc5f395f51905f5255565b633ee5aeb560e01b5f5260045ffd5b9160018060a01b035f5416604051906328c44a9960e21b82528460048301525f82602481845afa9182156103ef575f92611bb7575b5060e08201516001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000811691168114801590611b51575b611b4257825115611b33576001600160401b036060840151168015159081611b28575b50611b19576001600160401b03608084015116611b0a576040516328c44a9960e21b815260048101869052925f84602481865afa9384156103ef575f94611ae6575b506101206118569161184586611c24565b015160208082518301019101611586565b92602084015161187660018060a01b039160208082518301019101611616565b51165f52600460205261188d8760405f2092611c48565b5f5260205260405f2080546001600160401b038111610cb057604051916118ba60208360051b01846110fa565b81835260208301905f5260205f205f915b838310611ab257505050509560018060a01b0360408501511695604051936370a0823160e01b85523060048601526020856024818b5afa9485156103ef575f95611a7e575b505f602491604051928380926328c44a9960e21b82528660048301525afa9283156103ef5761194b815f956044948791611a64575b50611c48565b600255836040519586948593633a9bb12760e21b8552600485015260248401525af180156103ef57611a2a575b505f6002556040516370a0823160e01b815230600482015291602083602481885afa9283156103ef575f936119f5575b5060600151908083106119de578203918211610cfb578082036119c9575050565b631a3dba0360e31b5f5260045260245260445ffd5b50631a3dba0360e31b5f526004525f60245260445ffd5b9092506020813d602011611a22575b81611a11602093836110fa565b8101031261019d57519160606119a8565b3d9150611a04565b3d805f833e611a3981836110fa565b810160208282031261019d5781516001600160401b03811161019d57611a5f9201611463565b611978565b611a7891503d8089833e6103e081836110fa565b5f611945565b9094506020813d602011611aaa575b81611a9a602093836110fa565b8101031261019d5751935f611910565b3d9150611a8d565b60026020600192604051611ac5816110c3565b848060a01b03865416815284860154838201528152019201920191906118cb565b611856919450611b02610120913d805f833e6103e081836110fa565b949150611834565b637b6227e960e11b5f5260045ffd5b631ab7da6b60e01b5f5260045ffd5b90504210155f6117f2565b635c2c7f8960e01b5f5260045ffd5b63629cd40b60e11b5f5260045ffd5b50602083810151604051635bf2f20d60e01b81529182600481865afa9182156103ef575f92611b83575b5014156117cf565b9091506020813d602011611baf575b81611b9f602093836110fa565b8101031261019d5751905f611b7b565b3d9150611b92565b611bcc9192503d805f833e6103e081836110fa565b905f611792565b91906001600160a01b03831661eeee14611bec57505090565b9091506001600160a01b03821615611c02575090565b6379c5a2db60e01b5f5260045260245ffd5b9190811015610c9c5760061b0190565b60c001516001600160a01b03163003611c3957565b634672d00f60e01b5f5260045ffd5b80515f9081526003602052604090205461122c9291611c70916001600160a01b0316906116b0565b611705565b604051632cee40b560e21b815260606004820152606481018490529495946001600160a01b03909116939092906001600160401b0390828460848701375f608484870101521691826024850152866044850152602084608481601f19601f870116810103018134895af19384156103ef575f94611e97575b5083968415611e88575f80546040516328c44a9960e21b815260048101889052929190839060249082906001600160a01b03165afa9182156103ef575f92611e6c575b508582511494851595611e54575b8515611e3c575b8515611e24575b508415611e15575b508315611dea575b505050611dd8575f818152600360205260409020546001600160a01b0316611dc6575f81815260036020526040812080546001600160a01b0319163390811790915591907ff845579b2e96200541b4e2b438fbb65e772b70ac68265030aa16f6d8e16501d99080a4565b63aa8904b160e01b5f5260045260245ffd5b63f9d7a76560e01b5f5260045260245ffd5b611e049293506101200151602081519101209236916111db565b6020815191012014155f8080611d5c565b60a0820151141593505f611d54565b60608301516001600160401b0316141594505f611d4c565b60c08301516001600160a01b03163014159550611d45565b60e08301516001600160a01b03168814159550611d3e565b611e819192503d805f833e6103e081836110fa565b905f611d30565b6303acddcd60e41b5f5260045ffd5b9093506020813d602011611ec3575b81611eb3602093836110fa565b8101031261019d5751925f611ced565b3d9150611ea656fe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a2646970667358221220ea5e7452770ba9d0893a3620718bfb251299c27937b19b38de22230066ff05bf64736f6c634300081b0033",
    "sourceMap": "841:7367:169:-:0;;;;;;;;;;-1:-1:-1;841:7367:169;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;841:7367:169;;;;;;:::i;:::-;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;:::i;:::-;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;2989:103:68;4902:68:174;2989:103:68;;;:::i;:::-;841:7367:169;;4902:68:174;;:::i;:::-;841:7367:169;-1:-1:-1;;;;;;;;;;;2407:1:68;841:7367:169;;;;;;;;;;;;;;;;-1:-1:-1;;841:7367:169;;;;;;2738:41:174;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;:::i;:::-;2989:103:68;;;:::i;:::-;841:7367:169;;;;6807:10:174;841:7367:169;;;;;;;;;;;-1:-1:-1;;;6884:31:174;;841:7367:169;6884:31:174;;841:7367:169;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;6884:31:174;;841:7367:169;;;6884:31:174;;;;;;;841:7367:169;6884:31:174;;;841:7367:169;6929:10:174;;:23;;:72;;;;841:7367:169;6925:164:174;;;5452:38:169;;;;:::i;:::-;841:7367;;;;6807:10:174;841:7367:169;;;;;;-1:-1:-1;;;;;841:7367:169;;;5596:3;841:7367;;5577:17;;;;;841:7367;;5635:61;841:7367;;-1:-1:-1;;;;;5652:9:169;841:7367;5652:9;;:::i;:::-;;841:7367;;5635:61;:::i;:::-;841:7367;;;;;;;5766:9;841:7367;5766:9;;;;:::i;:::-;;:16;841:7367;2138:38:53;841:7367:169;8544:1067:53;8509:24;;;;841:7367:169;8544:1067:53;841:7367:169;;;;;8544:1067:53;;;841:7367:169;8544:1067:53;6884:31:174;8544:1067:53;841:7367:169;;8544:1067:53;;;;;;;;841:7367:169;8544:1067:53;;;;;;;5596:3:169;841:7367;8544:1067:53;5801:8:169;5797:119;;5596:3;;;841:7367;5566:9;;5797:119;5834:67;841:7367;5884:9;;;;;:::i;:::-;;:16;841:7367;;;;;;5834:67;5797:119;;;;8544:1067:53;;;;;;;;;;;;;5577:17:169;;;;5940:76;5577:17;5940:76;841:7367;;5940:76;;;;;:::i;:::-;;;;841:7367;-1:-1:-1;;;;;;;;;;;2407:1:68;841:7367:169;6925:164:174;7024:54;;;;841:7367:169;7024:54:174;841:7367:169;;6929:10:174;6884:31;841:7367:169;;;7024:54:174;6929:72;841:7367:169;6970:31:174;841:7367:169;-1:-1:-1;;;;;841:7367:169;6929:10:174;6956:45;;;-1:-1:-1;6929:72:174;;;6884:31;;;;;;;841:7367:169;6884:31:174;;;;;;:::i;:::-;;;;;:::i;:::-;;;;;;841:7367:169;;;;;;;;;;;;;;;-1:-1:-1;;841:7367:169;;;;;;:::i;:::-;;;:::i;:::-;;;;:::i;:::-;;;;:::i;:::-;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;3317:102:167;841:7367:169;;;;;;:::i;:::-;;;;;;3403:15:167;841:7367:169;;;;;;3317:102:167;:::i;:::-;841:7367:169;;;;;;;;;;;;-1:-1:-1;;841:7367:169;;;;;;;1573:6:174;841:7367:169;;;;;;;;;-1:-1:-1;;841:7367:169;;;;;;;1687:2:174;841:7367:169;;;;;;;;;-1:-1:-1;;841:7367:169;;;;-1:-1:-1;;;;;841:7367:169;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;841:7367:169;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;:::i;:::-;;;:::i;:::-;;;:::i;:::-;;;;;;-1:-1:-1;;841:7367:169;;;;;;;;:::i;:::-;;;:::i;:::-;;;:::i;:::-;;;;:::i;:::-;;;:::i;:::-;;;;;;;;;;;:::i;:::-;;;-1:-1:-1;;841:7367:169;;;;;;;;:::i;:::-;;;;-1:-1:-1;;;;;841:7367:169;;;;;4304:68;841:7367;;;;;;:::i;:::-;;;:::i;:::-;2989:103:68;;;:::i;:::-;841:7367:169;;4304:68;;:::i;:::-;4423:41;;;;;:::i;:::-;841:7367;;;;7214:10:174;841:7367:169;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;4573:3;841:7367;;4554:17;;;;;4612:64;841:7367;;-1:-1:-1;;;;;4629:9:169;;;;:::i;4612:64::-;-1:-1:-1;;;;;841:7367:169;;;;4746:9;;;;:::i;:::-;;:16;841:7367;2138:38:53;841:7367:169;8544:1067:53;8509:24;;;;841:7367:169;8544:1067:53;841:7367:169;;;;;8544:1067:53;;;841:7367:169;8544:1067:53;841:7367:169;8544:1067:53;841:7367:169;;;8544:1067:53;;;;;;841:7367:169;;8544:1067:53;;;;;;;4573:3:169;841:7367;8544:1067:53;4781:8:169;4777:76;;4573:3;;841:7367;;4543:9;;4777:76;841:7367;4836:9;;;;:::i;:::-;;:16;841:7367;3740:55;;;;841:7367;4798:55;841:7367;;;;;;;;4798:55;8544:1067:53;;;;;;;;;;;;;4554:17:169;;841:7367;4554:17;4878:79;4554:17;;;4878:79;841:7367;;4878:79;;;;;:::i;:::-;;;;841:7367;-1:-1:-1;;;;;;;;;;;2407:1:68;841:7367:169;;;;;;;;;;;;-1:-1:-1;;841:7367:169;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;:::i;:::-;;;-1:-1:-1;;;;;841:7367:169;;;;2237:40:167;841:7367:169;2309:47:167;841:7367:169;;;;;;:::i;:::-;2148:38:167;;;:::i;:::-;841:7367:169;;;;2237:40:167;;;;;;:::i;:::-;841:7367:169;;;2309:47:167;;:::i;:::-;841:7367:169;;2373:16:167;841:7367:169;2373:31:167;:78;;;;841:7367:169;;;;;;;;;;;2373:78:167;841:7367:169;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2373:78:167;;;841:7367:169;;;;;;-1:-1:-1;;841:7367:169;;;;;;;;:::i;:::-;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;:::i;:::-;;;;;;-1:-1:-1;;;1649:26:167;;841:7367:169;1649:26:167;;841:7367:169;;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;1649:26:167;;;;;;;841:7367:169;1649:26:167;;;841:7367:169;-1:-1:-1;841:7367:169;1689:26:167;;841:7367:169;-1:-1:-1;;;;;841:7367:169;1719:10:167;1689:40;;;;:85;;841:7367:169;1685:155:167;;;1854:66;841:7367:169;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;1854:66:167;;;841:7367:169;1685:155:167;1797:32;;;841:7367:169;1797:32:167;841:7367:169;;1797:32:167;1689:85;1733:27;;841:7367:169;-1:-1:-1;;;;;841:7367:169;1719:10:167;1733:41;;;-1:-1:-1;1689:85:167;;;1649:26;;;;;;841:7367:169;1649:26:167;;;;;;:::i;:::-;;;;841:7367:169;;;;;;-1:-1:-1;;841:7367:169;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;7506:30;;841:7367;;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;;;;;;:::i;:::-;;;;:::i;:::-;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;-1:-1:-1;;841:7367:169;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;;-1:-1:-1;;841:7367:169;;;;;;:::i;:::-;;;:::i;:::-;;;;:::i;:::-;;;:::i;:::-;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;4826:135:167;841:7367:169;;;;;;:::i;:::-;;;;:::i;:::-;;;;;;;4925:15:167;841:7367:169;;;;;;4826:135:167;:::i;841:7367:169:-;;;;;;-1:-1:-1;;841:7367:169;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;2701:26:169;;841:7367;2701:26;;841:7367;;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;2701:26;;;;;;2789:22;2778:58;2701:26;841:7367;2701:26;841:7367;2701:26;;;841:7367;2789:22;;;841:7367;;;;2778:58;;;;;;:::i;:::-;2875:17;841:7367;6105:15:174;;6101:41;;1687:2;6156:23;;6152:73;;841:7367:169;7719:9;841:7367;7730:17;;;;;;7817;;;;7813:60;;2926:32;;;;;;:::i;:::-;2983:10;;841:7367;;;;;;;;;;;;;;;;;;;;;;;;;7714:90;8043:9;;841:7367;8054:17;;;;;;2983:10;;841:7367;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2983:10;;;;3031:60;2983:10;;3031:60;;;;841:7367;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;8073:3;2983:10;841:7367;;;;;;;;;;;;;;;;8128:9;;;;;;:::i;:::-;841:7367;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;;841:7367:169;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;;;;;;;2407:1:68;841:7367:169;8043:9;;841:7367;;;;;;1687:2:174;841:7367:169;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;7813:60;7843:30;;;841:7367;7843:30;841:7367;;;;;;7843:30;7749:3;7777:9;841:7367;7777:9;;;;;:::i;:::-;:16;841:7367;;;;;;;;7768:25;841:7367;;7719:9;;6152:73:174;6188:37;;;;841:7367:169;6188:37:174;841:7367:169;;1687:2:174;841:7367:169;;;;6188:37:174;6101:41;6129:13;;;841:7367:169;6129:13:174;841:7367:169;;6129:13:174;2701:26:169;;;;;;841:7367;2701:26;;;;;;:::i;:::-;;;;841:7367;;;;;;-1:-1:-1;;841:7367:169;;;;;;;;3133:45:174;841:7367:169;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;2989:103:68;;;:::i;:::-;3374:38:169;;;;:::i;:::-;841:7367;;;;7214:10:174;841:7367:169;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;3518:3;841:7367;;3499:17;;;;;3557:61;841:7367;;-1:-1:-1;;;;;3574:9:169;;;;:::i;3557:61::-;-1:-1:-1;;;;;841:7367:169;;;;3688:9;;;;:::i;:::-;;:16;841:7367;2138:38:53;841:7367:169;8544:1067:53;8509:24;;;;841:7367:169;8544:1067:53;841:7367:169;;;;;8544:1067:53;;;841:7367:169;8544:1067:53;;;841:7367:169;;8544:1067:53;;;;;;;841:7367:169;;8544:1067:53;;;;;;;3518:3:169;841:7367;8544:1067:53;3723:8:169;3719:76;;3518:3;;841:7367;;3488:9;;8544:1067:53;;;;;;;;;;;;;3499:17:169;;;3820:76;3499:17;;3820:76;841:7367;;3820:76;;;;;:::i;841:7367::-;;;;;;-1:-1:-1;;841:7367:169;;;;;3019:31:174;841:7367:169;;;;;;;;;;;;;-1:-1:-1;;841:7367:169;;;;;;;;:::i;:::-;;;:::i;:::-;;;;:::i;:::-;;;:::i;:::-;;;;;;;;;;;:::i;:::-;;;;;;-1:-1:-1;;841:7367:169;;;;-1:-1:-1;;;;;841:7367:169;;:::i;:::-;;;;;;;;;;7290:32;841:7367;;;;7290:32;:::i;:::-;841:7367;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;841:7367:169;;;;;;-1:-1:-1;;;;;841:7367:169;;;;2677:280:167;841:7367:169;;;;;;;;:::i;:::-;2712:18:167;;;841:7367:169;;;;;;;;2744:20:167;;841:7367:169;;;;;;;2778:21:167;;;841:7367:169;;-1:-1:-1;;;;;2813:26:167;;;841:7367:169;;2853:21:167;;;;841:7367:169;;;2888:18:167;2930:16;2888:18;;;841:7367:169;2930:16:167;;;841:7367:169;;;;;2920:27:167;2677:280;;:::i;841:7367:169:-;;;;;;-1:-1:-1;;841:7367:169;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;573:41:88;;;:81;;;;841:7367:169;;;;;;;573:81:88;-1:-1:-1;;;829:40:77;;-1:-1:-1;573:81:88;;;841:7367:169;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;:::o;:::-;;;;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;:::o;:::-;;;;-1:-1:-1;;;;;841:7367:169;;;;;;:::o;:::-;;;-1:-1:-1;;;;;841:7367:169;;;;;;:::o;:::-;;;;-1:-1:-1;;;;;841:7367:169;;;;;;:::o;:::-;;;;-1:-1:-1;;;;;841:7367:169;;;;;;:::o;:::-;;;;-1:-1:-1;;;;;841:7367:169;;;;;;:::o;:::-;;;;-1:-1:-1;;;;;841:7367:169;;;;;;:::o;:::-;;;-1:-1:-1;;;;;841:7367:169;;;;;;:::o;:::-;;;;;;;;;;;:::o;:::-;-1:-1:-1;;;;;841:7367:169;;;;;;-1:-1:-1;;841:7367:169;;;;:::o;:::-;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;841:7367:169;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;:::o;:::-;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;:::i;:::-;;;;:::o;:::-;;;;;;;;;;;;;;-1:-1:-1;841:7367:169;;;;;;;;;;:::o;:::-;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;841:7367:169;;;;;;;;-1:-1:-1;;841:7367:169;;;;:::o;3513:368:167:-;;;;;-1:-1:-1;;;;;3513:368:167;;;841:7367:169;;3789:84:167;;;;841:7367:169;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;3789:84:167;;;;;;:::i;:::-;841:7367:169;3779:95:167;;3513:368;:::o;841:7367:169:-;;;;;;;;;;;;;;;:::o;:::-;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;;;;;;:::i;:::-;;;-1:-1:-1;;;;;841:7367:169;;;;;;:::o;:::-;;;-1:-1:-1;;;;;841:7367:169;;;;;;:::o;:::-;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;-1:-1:-1;841:7367:169;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;:::i;:::-;;;;;;:::o;:::-;;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;:::i;:::-;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;;;;;;:::i;:::-;;;;:::i;:::-;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;:::i;:::-;;;;;;:::o;5063:497:167:-;;5407:95;5063:497;;;;;;5407:95;:::i;:::-;841:7367:169;;;5379:164:167;;;841:7367:169;;;-1:-1:-1;;;;;841:7367:169;;;;;;;5379:164:167;;;;;841:7367:169;5379:164:167;:::i;3999:439::-;;4128:303;3999:439;4163:18;;;841:7367:169;;;;;;;4195:20:167;;;841:7367:169;;;;;;;4229:21:167;;;841:7367:169;;-1:-1:-1;;;;;4264:26:167;;;841:7367:169;;4304:21:167;;;;841:7367:169;;;4339:18:167;4381:16;4339:18;;;841:7367:169;4381:16:167;;;4163:18;841:7367:169;;;;4371:27:167;4128:303;;:::i;5632:163:174:-;;841:7367:169;;5750:37:174;;;;841:7367:169;;;;;;;;5750:37:174;;;;;;:::i;3749:292:68:-;2407:1;-1:-1:-1;;;;;;;;;;;841:7367:169;4560:63:68;3644:93;;2407:1;-1:-1:-1;;;;;;;;;;;2407:1:68;3749:292::o;3644:93::-;3696:30;;;-1:-1:-1;3696:30:68;;-1:-1:-1;3696:30:68;6029:1014:169;;841:7367;;;;;6218:3;841:7367;;;;;;;;6218:26;;;;;;841:7367;6218:3;:26;;;;;;;;;;;:3;:26;;;6029:1014;-1:-1:-1;841:7367:169;1174:26:166;;841:7367:169;-1:-1:-1;;;;;6304:16:169;841:7367;;;;1174:44:166;;;;;:154;;6029:1014:169;1157:240:166;;841:7367:169;;1284:28:124;1280:64;;-1:-1:-1;;;;;801:25:124;;;841:7367:169;;801:30:124;;;:78;;;;6029:1014:169;1354:55:124;;;-1:-1:-1;;;;;1057:25:124;;;841:7367:169;;1419:58:124;;841:7367:169;;-1:-1:-1;;;6376:31:169;;6218:26;6376:31;;841:7367;;;;-1:-1:-1;841:7367:169;6218:26;841:7367;6376:31;;;;;;;;6218:3;6376:31;;;6029:1014;6417:49;6531:22;6520:58;6417:49;;;;:::i;:::-;6531:22;;841:7367;;;;6520:58;;;;;;:::i;:::-;6630:17;841:7367;6630:17;;;6619:43;841:7367;;;;;;;;;;6619:43;;;;;;:::i;:::-;841:7367;;6218:3;841:7367;6218:26;841:7367;;6710:58;841:7367;;6218:3;841:7367;6710:58;;:::i;:::-;6218:3;841:7367;;;;6218:3;841:7367;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;6218:3;841:7367;;6218:3;841:7367;6218:3;841:7367;;;;;;;6672:97;;;;841:7367;;;;;;;6787:16;;841:7367;;;;;;;;;6837:38;;6869:4;6218:26;6837:38;;841:7367;;6837:38;6218:26;6837:38;;;;;;;;;6218:3;6837:38;;;841:7367;;6218:3;:26;841:7367;;;;;;;;;;6065:31:167;;;6218:26:169;6065:31:167;;841:7367:169;6065:31:167;;;;;;;6128:58;6065:31;6218:3:169;6065:31:167;6245:45;6065:31;;;;;841:7367:169;6128:58:167;;:::i;:::-;841:7367:169;2407:1:68;841:7367:169;;;;;;;;;;;6245:45:167;;6218:26:169;6245:45:167;;841:7367:169;6218:26;841:7367;;;6245:45:167;;;;;;;;841:7367:169;-1:-1:-1;6218:3:169;841:7367;2407:1:68;841:7367:169;;-1:-1:-1;;;6978:38:169;;6869:4;6218:26;6978:38;;841:7367;;;;6218:26;841:7367;6978:38;;;;;;;;6218:3;6978:38;;;841:7367;7018:17;801:25:124;7018:17:169;841:7367;1919:28:166;;;;1915:76;;841:7367:169;;;;;;;2060:18:166;;;2056:71;;6029:1014:169;;:::o;2056:71:166:-;1956:35;;;6218:3:169;2087:40:166;6218:26:169;841:7367;6218:26;841:7367;6245:45:167;6218:3:169;2087:40:166;1915:76;1956:35;;;;6218:3:169;1956:35:166;6218:26:169;841:7367;6218:3;:26;841:7367;6245:45:167;6218:3:169;1956:35:166;6978:38:169;;;;841:7367;6978:38;;841:7367;6978:38;;;;;;841:7367;6978:38;;;:::i;:::-;;;841:7367;;;;;;801:25:124;6978:38:169;;;;;-1:-1:-1;6978:38:169;;6245:45:167;;;6218:3:169;6245:45:167;;;;;;:::i;:::-;;;841:7367:169;;;;;;;;;-1:-1:-1;;;;;841:7367:169;;;;;;;;:::i;:::-;6245:45:167;;6065:31;;;;;;;;;;;;;:::i;:::-;;;;6837:38:169;;;;841:7367;6837:38;;841:7367;6837:38;;;;;;841:7367;6837:38;;;:::i;:::-;;;841:7367;;;;;;6218:3;6837:38;;;;;-1:-1:-1;6837:38:169;;841:7367;;;1495:4:124;841:7367:169;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;6376:31;6520:58;6376:31;;;;6531:22;6376:31;;;6218:3;6376:31;;;;;;:::i;:::-;;;;;;1419:58:124;1457:20;;;6218:3:169;1457:20:124;6218:26:169;:3;1457:20:124;1354:55;1392:17;;;6218:3:169;1392:17:124;6218:26:169;:3;1392:17:124;801:78;864:15;;;-1:-1:-1;835:44:124;801:78;;;1280:64;1321:23;;;6218:3:169;1321:23:124;6218:26:169;:3;1321:23:124;1157:240:166;1360:26;;;6218:3:169;1360:26:166;6218::169;:3;1360:26:166;1174:154;-1:-1:-1;841:7367:169;1238:24:166;;;841:7367:169;;;-1:-1:-1;;;1266:62:166;;841:7367:169;;6218:26;841:7367;1266:62:166;;;;;;;;6218:3:169;1266:62:166;;;1174:154;1238:90;;;1174:154;;1266:62;;;;841:7367:169;1266:62:166;;841:7367:169;1266:62:166;;;;;;841:7367:169;1266:62:166;;;:::i;:::-;;;841:7367:169;;;;;1266:62:166;;;;;;;-1:-1:-1;1266:62:166;;6218:26:169;;;;;;;:3;:26;;;;;;:::i;:::-;;;;;7250:351:174;;;-1:-1:-1;;;;;841:7367:169;;1573:6:174;7409:30;7405:164;;7578:16;;7250:351;:::o;7405:164::-;841:7367:169;;-1:-1:-1;;;;;;841:7367:169;;7459:23:174;7455:68;;7537:21;7250:351;:::o;7455:68::-;7491:32;;;7480:1;7491:32;;841:7367:169;;7480:1:174;7491:32;841:7367:169;;;;;;;;;;;;:::o;1548:179:166:-;1644:21;;841:7367:169;-1:-1:-1;;;;;841:7367:169;1677:4:166;1644:38;1640:80;;1548:179::o;1640:80::-;1691:29;;;-1:-1:-1;1691:29:166;;-1:-1:-1;1691:29:166;5566:286:167;841:7367:169;;-1:-1:-1;841:7367:169;;;5808:10:167;841:7367:169;;;;;;5760:85:167;;5566:286;5773:63;;-1:-1:-1;;;;;841:7367:169;;5773:63:167;:::i;:::-;5760:85;:::i;4983:643:174:-;841:7367:169;;-1:-1:-1;;;5188:95:174;;841:7367:169;5188:95:174;;;841:7367:169;;;;;;;4983:643:174;;;-1:-1:-1;;;;;841:7367:169;;;;;;4983:643:174;-1:-1:-1;;;;;841:7367:169;4983:643:174;841:7367:169;;;;;-1:-1:-1;841:7367:169;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;5188:95:174;;5243:9;;5188:95;;;;;;;;-1:-1:-1;5188:95:174;;;4983:643;5171:112;;7830:28;;;7826:64;;-1:-1:-1;841:7367:169;;;;-1:-1:-1;;;7934:34:174;;5188:95;7934:34;;841:7367:169;;;;;-1:-1:-1;841:7367:169;;;;;;-1:-1:-1;;;;;841:7367:169;7934:34:174;;;;;;;-1:-1:-1;7934:34:174;;;4983:643;841:7367:169;;;;7995:33:174;;;;:79;;;4983:643;7995:137;;;;4983:643;7995:185;;;;4983:643;7995:233;;;;;4983:643;7995:283;;;;;4983:643;7978:384;;;;;-1:-1:-1;841:7367:169;;;5400:10:174;841:7367:169;;;;;;-1:-1:-1;;;;;841:7367:169;5396:93:174;;-1:-1:-1;841:7367:169;;;5400:10:174;841:7367:169;;;;;;;-1:-1:-1;;;;;;841:7367:169;5528:10:174;841:7367:169;;;;;;5528:10:174;841:7367:169;5553:66:174;;-1:-1:-1;5553:66:174;4983:643::o;5396:93::-;5449:40;;;-1:-1:-1;5449:40:174;5188:95;841:7367:169;;-1:-1:-1;5449:40:174;7978:384;8310:41;;;-1:-1:-1;8310:41:174;5188:95;841:7367:169;;-1:-1:-1;8310:41:174;7995:283;841:7367:169;8242:16:174;;;;;;841:7367:169;;;;;8232:27:174;841:7367:169;;;;:::i;:::-;;;;;;8263:15:174;8232:46;;7995:283;;;;;:233;8200:18;;;841:7367:169;8200:28:174;;;-1:-1:-1;7995:233:174;;;:185;841:7367:169;8136:26:174;;841:7367:169;-1:-1:-1;;;;;841:7367:169;8136:44:174;;;-1:-1:-1;7995:185:174;;;:137;8094:21;;;841:7367:169;-1:-1:-1;;;;;841:7367:169;8127:4:174;8094:38;;;-1:-1:-1;7995:137:174;;:79;841:7367:169;8032:20:174;;841:7367:169;-1:-1:-1;;;;;841:7367:169;8032:42:174;;;;-1:-1:-1;7995:79:174;;7934:34;;;;;;;-1:-1:-1;7934:34:174;;;;;;:::i;:::-;;;;;7826:64;7867:23;;;-1:-1:-1;7867:23:174;5188:95;-1:-1:-1;7867:23:174;5188:95;;;;841:7367:169;5188:95:174;;841:7367:169;5188:95:174;;;;;;841:7367:169;5188:95:174;;;:::i;:::-;;;841:7367:169;;;;;5188:95:174;;;;;;;-1:-1:-1;5188:95:174;",
    "linkReferences": {},
    "immutableReferences": {
      "91872": [
        {
          "start": 438,
          "length": 32
        },
        {
          "start": 6050,
          "length": 32
        }
      ]
    }
  },
  "methodIdentifiers": {
    "EXECUTOR_SENTINEL()": "c880c06f",
    "MAX_SPLITS()": "b48210ca",
    "activeSettlement()": "39fcc92b",
    "arbitrate(bytes32,bytes32,(address,uint256)[])": "5123666d",
    "attestationIntentHash((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))": "20249e20",
    "attestationIntentHash(bytes32,address,address,uint64,bool,bytes32,bytes)": "cd8c1ef3",
    "attestationIntentHash(bytes32,address,address,uint64,bool,bytes32,bytes32)": "33f37e4a",
    "check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)": "8da3721a",
    "collectAndDistribute(bytes32,bytes32)": "3de93b38",
    "createFulfillment(address,bytes,uint64,bytes32)": "ed7180e3",
    "createFulfillmentAndCollectAndDistribute(bytes32,address,bytes,uint64,bytes32)": "8ed98101",
    "decodeDemandData(bytes)": "838a68d9",
    "eas()": "8150864d",
    "escrowObligation()": "d43a0c93",
    "fulfillers(bytes32)": "4e2d3b12",
    "fulfillmentIntentHash((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),address)": "a0c16047",
    "fulfillmentIntentHash(bytes32,address,address,uint64,bool,bytes32,bytes,address)": "6c09ac16",
    "fulfillmentIntentHash(bytes32,address,address,uint64,bool,bytes32,bytes32,address)": "9e22e24c",
    "getSplits(address,bytes32,bytes32)": "2257c0e3",
    "hasDecision(address,bytes32)": "a1a80488",
    "requestArbitration(bytes32,bytes32,address,bytes)": "86314b0d",
    "supportsInterface(bytes4)": "01ffc9a7",
    "unsafePartiallyCollectAndDistribute(bytes32,bytes32)": "d1be3507"
  },
  "rawMetadata": "{\"compiler\":{\"version\":\"0.8.27+commit.40a35a09\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[{\"internalType\":\"contract IEAS\",\"name\":\"_eas\",\"type\":\"address\"},{\"internalType\":\"contract ERC20EscrowObligation\",\"name\":\"_escrowObligation\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"AttestationRevoked\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"DeadlineExpired\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"token\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"ERC20TransferFailed\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"EmptySplits\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"fulfillment\",\"type\":\"bytes32\"}],\"name\":\"FulfillerAlreadyRecorded\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidAttestationUid\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"expected\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"actual\",\"type\":\"uint256\"}],\"name\":\"InvalidCollectedAmount\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"fulfillment\",\"type\":\"bytes32\"}],\"name\":\"InvalidCreatedFulfillment\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidEscrowAttestation\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidFulfillmentRecipient\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidFulfillmentUid\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"totalExpected\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"totalProvided\",\"type\":\"uint256\"}],\"name\":\"InvalidSplits\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"fulfillment\",\"type\":\"bytes32\"}],\"name\":\"NoFulfillerRecorded\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"ReentrancyGuardReentrantCall\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"provided\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"max\",\"type\":\"uint256\"}],\"name\":\"TooManySplits\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"UnauthorizedArbitrationRequest\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"fulfillment\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"}],\"name\":\"UnauthorizedPartialSettlement\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"decisionKey\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"intentHash\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"oracle\",\"type\":\"address\"},{\"components\":[{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"indexed\":false,\"internalType\":\"struct CommitmentERC20Splitter.Split[]\",\"name\":\"splits\",\"type\":\"tuple[]\"}],\"name\":\"ArbitrationMade\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"fulfillment\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrow\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"oracle\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"}],\"name\":\"ArbitrationRequested\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"intentHash\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrow\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"oracle\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"}],\"name\":\"CommitmentArbitrationRequested\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"token\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"ERC20TransferFailedOnDistribute\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"fulfillmentUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"fulfiller\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"address\",\"name\":\"token\",\"type\":\"address\"},{\"components\":[{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"indexed\":false,\"internalType\":\"struct CommitmentERC20Splitter.Split[]\",\"name\":\"splits\",\"type\":\"tuple[]\"}],\"name\":\"EscrowCollectedAndDistributed\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"fulfillmentUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"fulfiller\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"obligationContract\",\"type\":\"address\"}],\"name\":\"FulfillmentCreated\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"EXECUTOR_SENTINEL\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"MAX_SPLITS\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"activeSettlement\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"intentHash\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"escrow\",\"type\":\"bytes32\"},{\"components\":[{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"internalType\":\"struct CommitmentERC20Splitter.Split[]\",\"name\":\"splits\",\"type\":\"tuple[]\"}],\"name\":\"arbitrate\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"attestation\",\"type\":\"tuple\"}],\"name\":\"attestationIntentHash\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"dataHash\",\"type\":\"bytes32\"}],\"name\":\"attestationIntentHash\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"attestationIntentHash\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"fulfillment\",\"type\":\"tuple\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"escrow\",\"type\":\"bytes32\"}],\"name\":\"check\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"escrow\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"fulfillment\",\"type\":\"bytes32\"}],\"name\":\"collectAndDistribute\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"obligationContract\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"}],\"name\":\"createFulfillment\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"fulfillmentUid\",\"type\":\"bytes32\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"escrow\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"obligationContract\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"}],\"name\":\"createFulfillmentAndCollectAndDistribute\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"fulfillmentUid\",\"type\":\"bytes32\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"decodeDemandData\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"oracle\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct CommitmentERC20Splitter.DemandData\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"eas\",\"outputs\":[{\"internalType\":\"contract IEAS\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"escrowObligation\",\"outputs\":[{\"internalType\":\"contract IEscrow\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"fulfillers\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"address\",\"name\":\"fulfiller\",\"type\":\"address\"}],\"name\":\"fulfillmentIntentHash\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"dataHash\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"fulfiller\",\"type\":\"address\"}],\"name\":\"fulfillmentIntentHash\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"attestation\",\"type\":\"tuple\"},{\"internalType\":\"address\",\"name\":\"fulfiller\",\"type\":\"address\"}],\"name\":\"fulfillmentIntentHash\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"oracle\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"intentHash\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"escrow\",\"type\":\"bytes32\"}],\"name\":\"getSplits\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"internalType\":\"struct CommitmentERC20Splitter.Split[]\",\"name\":\"\",\"type\":\"tuple[]\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"hasDecision\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"intentHash\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"escrow\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"oracle\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"}],\"name\":\"requestArbitration\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"escrow\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"fulfillment\",\"type\":\"bytes32\"}],\"name\":\"unsafePartiallyCollectAndDistribute\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"stateMutability\":\"payable\",\"type\":\"receive\"}],\"devdoc\":{\"details\":\"Security note: This contract has not been included in professional manual audits and      has only been reviewed by automated audit tooling so far.\",\"errors\":{\"ReentrancyGuardReentrantCall()\":[{\"details\":\"Unauthorized reentrant call.\"}]},\"kind\":\"dev\",\"methods\":{\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"params\":{\"demand\":\"Arbiter-specific demand data encoded by the escrow creator.\",\"escrowUid\":\"The UID of the escrow attestation being fulfilled.\",\"fulfillment\":\"The EAS attestation being used as fulfillment.\"}},\"supportsInterface(bytes4)\":{\"details\":\"Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section] to learn more about how these ids are created. This function call must use less than 30 000 gas.\"},\"unsafePartiallyCollectAndDistribute(bytes32,bytes32)\":{\"details\":\"Use only as a last resort when collectAndDistribute is permanently blocked.      Failed transfers emit events but do not revert. Stuck tokens remain in the splitter.\"}},\"title\":\"CommitmentERC20Splitter\",\"version\":1},\"userdoc\":{\"errors\":{\"AttestationRevoked()\":[{\"notice\":\"Raised when an attestation has been revoked.\"}],\"DeadlineExpired()\":[{\"notice\":\"Raised when an attestation has expired.\"}],\"InvalidAttestationUid()\":[{\"notice\":\"Raised when an attestation UID is zero.\"}]},\"events\":{\"ArbitrationMade(bytes32,bytes32,address,(address,uint256)[])\":{\"notice\":\"Emitted when an oracle records ERC20 splits for a future fulfillment intent and escrow.\"},\"ArbitrationRequested(bytes32,bytes32,address,bytes)\":{\"notice\":\"Emitted by an escrow participant to request a split decision.\"},\"CommitmentArbitrationRequested(bytes32,bytes32,address,bytes)\":{\"notice\":\"Emitted by an escrow participant to request a split decision for a future fulfillment.\"},\"EscrowCollectedAndDistributed(bytes32,bytes32,address,address,(address,uint256)[])\":{\"notice\":\"Emitted after an escrow is collected and ERC20 splits are distributed.\"},\"FulfillmentCreated(bytes32,address,address)\":{\"notice\":\"Emitted when the splitter creates a fulfillment and records the external fulfiller.\"}},\"kind\":\"user\",\"methods\":{\"EXECUTOR_SENTINEL()\":{\"notice\":\"Sentinel address meaning \\\"the fulfiller who created the fulfillment\\\".\"},\"MAX_SPLITS()\":{\"notice\":\"Maximum number of splits allowed per decision.\"},\"activeSettlement()\":{\"notice\":\"Decision key the splitter is currently collecting, or zero when idle.\"},\"arbitrate(bytes32,bytes32,(address,uint256)[])\":{\"notice\":\"Records the caller's split decision for a future fulfillment intent and escrow.\"},\"attestationIntentHash((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"notice\":\"Hashes the semantic attestation fields an oracle can approve before EAS assigns a UID.\"},\"attestationIntentHash(bytes32,address,address,uint64,bool,bytes32,bytes)\":{\"notice\":\"Hashes an attestation intent from pre-encoded attestation data.\"},\"attestationIntentHash(bytes32,address,address,uint64,bool,bytes32,bytes32)\":{\"notice\":\"Hashes an attestation intent from an already-computed data hash.\"},\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"notice\":\"Returns true when `fulfillment` satisfies `demand` for `escrowUid`.\"},\"collectAndDistribute(bytes32,bytes32)\":{\"notice\":\"Collects an ERC20 escrow and distributes tokens per oracle splits.         Reverts if any transfer fails.\"},\"createFulfillment(address,bytes,uint64,bytes32)\":{\"notice\":\"Creates a fulfillment attestation addressed to this splitter and records the caller as fulfiller.\"},\"createFulfillmentAndCollectAndDistribute(bytes32,address,bytes,uint64,bytes32)\":{\"notice\":\"Creates a splitter-owned fulfillment and atomically collects and distributes the escrow.\"},\"decodeDemandData(bytes)\":{\"notice\":\"Decodes ABI-encoded ERC20 splitter demand data.\"},\"eas()\":{\"notice\":\"EAS contract used to load escrow and fulfillment attestations.\"},\"escrowObligation()\":{\"notice\":\"Canonical escrow obligation this splitter is allowed to collect.\"},\"fulfillers(bytes32)\":{\"notice\":\"External fulfiller recorded for splitter-owned fulfillments.\"},\"fulfillmentIntentHash((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),address)\":{\"notice\":\"Hashes a splitter fulfillment intent, binding the attestation fields to the recorded fulfiller.\"},\"fulfillmentIntentHash(bytes32,address,address,uint64,bool,bytes32,bytes,address)\":{\"notice\":\"Hashes a splitter fulfillment intent from pre-encoded attestation data.\"},\"fulfillmentIntentHash(bytes32,address,address,uint64,bool,bytes32,bytes32,address)\":{\"notice\":\"Hashes a splitter fulfillment intent from an already-computed data hash.\"},\"getSplits(address,bytes32,bytes32)\":{\"notice\":\"Returns ERC20 splits recorded by an oracle for a fulfillment intent and escrow.\"},\"hasDecision(address,bytes32)\":{\"notice\":\"Whether an oracle has recorded a decision for a decision key.\"},\"requestArbitration(bytes32,bytes32,address,bytes)\":{\"notice\":\"Emits an arbitration request for a future fulfillment when called by the escrow attester or recipient.\"},\"unsafePartiallyCollectAndDistribute(bytes32,bytes32)\":{\"notice\":\"Unsafe partial distribution -- continues on individual transfer failures.\"}},\"notice\":\"Collects ERC20 escrows and distributes the received amount according to oracle-provided splits.\",\"version\":1}},\"settings\":{\"compilationTarget\":{\"src/utils/splitters/commitment/CommitmentERC20Splitter.sol\":\"CommitmentERC20Splitter\"},\"evmVersion\":\"prague\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[\":@eas/=lib/eas-contracts/contracts/\",\":@erc8004/=lib/erc-8004-contracts/contracts/\",\":@openzeppelin/=lib/openzeppelin-contracts/\",\":@src/=src/\",\":@test/=test/\",\":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/\",\":eas-contracts/=lib/eas-contracts/contracts/\",\":erc-8004-contracts/=lib/erc-8004-contracts/contracts/\",\":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/\",\":eth-gas-reporter/=lib/eas-contracts/node_modules/eth-gas-reporter/\",\":forge-std/=lib/forge-std/src/\",\":halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/\",\":hardhat-deploy/=lib/eas-contracts/node_modules/hardhat-deploy/\",\":hardhat/=lib/eas-contracts/node_modules/hardhat/\",\":openzeppelin-contracts/=lib/openzeppelin-contracts/\"],\"viaIR\":true},\"sources\":{\"lib/eas-contracts/contracts/Common.sol\":{\"keccak256\":\"0x957bd2e6d0d6d637f86208b135c29fbaf4412cb08e5e7a61ede16b80561bf685\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://da1dc9aedbb1d4d39c46c2235918d3adfbc5741dd34a46010cf425d134e7936d\",\"dweb:/ipfs/QmWUk6bXnLaghS2riF3GTFEeURCzgYFMA5woa6AsgPwEgc\"]},\"lib/eas-contracts/contracts/IEAS.sol\":{\"keccak256\":\"0xdad0674defce04905dc7935f2756d6c477a6e876c0b1b7094b112a862f164c12\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://49e448c26c08952df034692d2ab3519dd40a1ebbeae4ce68b294567441933880\",\"dweb:/ipfs/QmWHcudjskUSCjgqsNWE65LVfWvcYB2vBn8RB1SmzvRLNR\"]},\"lib/eas-contracts/contracts/ISchemaRegistry.sol\":{\"keccak256\":\"0xea97dcd36a0c422169cbaac06698249e199049b627c16bff93fb8ab829058754\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://d453a929ef64a69cd31195ec2ee5ed1193bfa29f633e13c960e92154c37ad158\",\"dweb:/ipfs/QmXs1Z3njbHs2EMgHonrZDfcwdog4kozHY5tYNrhZK5yqz\"]},\"lib/eas-contracts/contracts/ISemver.sol\":{\"keccak256\":\"0x04a67939b4e1a8d0a51101b8f69f8882930bbdc66319f38023828625b5d1ff18\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://3dd543fa0e33cef1ea757627f9c2a10a66ee1ce17aa9087f437c5b53a903c7f0\",\"dweb:/ipfs/QmXsy6UsGBzF9zPCCjmiwPpCcX3tHqU13TmR67B69tKnR6\"]},\"lib/eas-contracts/contracts/Semver.sol\":{\"keccak256\":\"0x4f23442d048661b6aaa188ddc16b69cb310c2e44066b3852026afcb4201d61a9\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://30c36e580cd93d9acb13e1a11e833946a8bd0bd2a8d1b2be049f0d96e0989808\",\"dweb:/ipfs/QmXmQTxKjSrUWutafQsqkbGufXqtzxuDAiMMJjXCHXiEqh\"]},\"lib/eas-contracts/contracts/resolver/ISchemaResolver.sol\":{\"keccak256\":\"0xb7d1961ed928c620cddf35c2bf46845b10828bc5d73145214630202ed355b6bb\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://cf1cabacfb15c9bace8280b540b52e5aa440e1b4eba675f9782c34ce0f03902f\",\"dweb:/ipfs/QmakYcK4xbrijzvoaBCmBJK6HeaBqbXxWKtDQ1z62aXwCR\"]},\"lib/eas-contracts/contracts/resolver/SchemaResolver.sol\":{\"keccak256\":\"0x385d8c0edbdc96af15cf8f22333183162561cbf7d3fb0df95287741e59899983\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://ff7e8a17f69dcb7ddc937446e868d34baea61bbe249a8f5d8be486ab93001828\",\"dweb:/ipfs/QmUz9i7ViNK9kUWHeJRtE44HmpbxBDGJBjyec2aPD6Nn3Q\"]},\"lib/openzeppelin-contracts/contracts/interfaces/IERC1363.sol\":{\"keccak256\":\"0xd5ea07362ab630a6a3dee4285a74cf2377044ca2e4be472755ad64d7c5d4b69d\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://da5e832b40fc5c3145d3781e2e5fa60ac2052c9d08af7e300dc8ab80c4343100\",\"dweb:/ipfs/QmTzf7N5ZUdh5raqtzbM11yexiUoLC9z3Ws632MCuycq1d\"]},\"lib/openzeppelin-contracts/contracts/interfaces/IERC165.sol\":{\"keccak256\":\"0x0afcb7e740d1537b252cb2676f600465ce6938398569f09ba1b9ca240dde2dfc\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://1c299900ac4ec268d4570ecef0d697a3013cd11a6eb74e295ee3fbc945056037\",\"dweb:/ipfs/Qmab9owJoxcA7vJT5XNayCMaUR1qxqj1NDzzisduwaJMcZ\"]},\"lib/openzeppelin-contracts/contracts/interfaces/IERC20.sol\":{\"keccak256\":\"0x1a6221315ce0307746c2c4827c125d821ee796c74a676787762f4778671d4f44\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://1bb2332a7ee26dd0b0de9b7fe266749f54820c99ab6a3bcb6f7e6b751d47ee2d\",\"dweb:/ipfs/QmcRWpaBeCYkhy68PR3B4AgD7asuQk7PwkWxrvJbZcikLF\"]},\"lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol\":{\"keccak256\":\"0x74ed01eb66b923d0d0cfe3be84604ac04b76482a55f9dd655e1ef4d367f95bc2\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://5282825a626cfe924e504274b864a652b0023591fa66f06a067b25b51ba9b303\",\"dweb:/ipfs/QmeCfPykghhMc81VJTrHTC7sF6CRvaA1FXVq2pJhwYp1dV\"]},\"lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol\":{\"keccak256\":\"0x304d732678032a9781ae85c8f204c8fba3d3a5e31c02616964e75cfdc5049098\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://299ced486011781dc98f638059678323c03079fefae1482abaa2135b22fa92d0\",\"dweb:/ipfs/QmbZNbcPTBxNvwChavN2kkZZs7xHhYL7mv51KrxMhsMs3j\"]},\"lib/openzeppelin-contracts/contracts/utils/Bytes.sol\":{\"keccak256\":\"0x8140d608316521b1fd71167c3b708ebb8659da070723fc8807609553b296ee33\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://a7bf7db66869ba1e945a0390b85da2f6afc7e42a4735ca918d0d56ac90c50147\",\"dweb:/ipfs/QmRmNyhpBpgzSdQqLtrQCYE7H7eLnVVxh2Yy4YMrySR8AR\"]},\"lib/openzeppelin-contracts/contracts/utils/Panic.sol\":{\"keccak256\":\"0xf7fe324703a64fc51702311dc51562d5cb1497734f074e4f483bfb6717572d7a\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://c6a5ff4f9fd8649b7ee20800b7fa387d3465bd77cf20c2d1068cd5c98e1ed57a\",\"dweb:/ipfs/QmVSaVJf9FXFhdYEYeCEfjMVHrxDh5qL4CGkxdMWpQCrqG\"]},\"lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol\":{\"keccak256\":\"0xa516cbf1c7d15d3517c2d668601ce016c54395bf5171918a14e2686977465f53\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://1e1d079e8edfb58efd23a311e315a4807b01b5d1cf153f8fa2d0608b9dec3e99\",\"dweb:/ipfs/QmTBExeX2SDTkn5xbk5ssbYSx7VqRp9H4Ux1CY4uQM4b9N\"]},\"lib/openzeppelin-contracts/contracts/utils/StorageSlot.sol\":{\"keccak256\":\"0xcf74f855663ce2ae00ed8352666b7935f6cddea2932fdf2c3ecd30a9b1cd0e97\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://9f660b1f351b757dfe01438e59888f31f33ded3afcf5cb5b0d9bf9aa6f320a8b\",\"dweb:/ipfs/QmarDJ5hZEgBtCmmrVzEZWjub9769eD686jmzb2XpSU1cM\"]},\"lib/openzeppelin-contracts/contracts/utils/Strings.sol\":{\"keccak256\":\"0x36d1750bf1aa5fee9c52adb2f7857ab652daca722fc05dff533b364f67a1139a\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://2e5e7052539b7849d02f3ce25acc1dce29373c11cfae9f0bc918c54b780c549a\",\"dweb:/ipfs/QmRGE32xNkMTo6i4pHHMxjpiu77yPwnTA25SFngw2NXJys\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/ERC165.sol\":{\"keccak256\":\"0x2d9dc2fe26180f74c11c13663647d38e259e45f95eb88f57b61d2160b0109d3e\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://81233d1f98060113d9922180bb0f14f8335856fe9f339134b09335e9f678c377\",\"dweb:/ipfs/QmWh6R35SarhAn4z2wH8SU456jJSYL2FgucfTFgbHJJN4E\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol\":{\"keccak256\":\"0x8891738ffe910f0cf2da09566928589bf5d63f4524dd734fd9cedbac3274dd5c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://971f954442df5c2ef5b5ebf1eb245d7105d9fbacc7386ee5c796df1d45b21617\",\"dweb:/ipfs/QmadRjHbkicwqwwh61raUEapaVEtaLMcYbQZWs9gUkgj3u\"]},\"lib/openzeppelin-contracts/contracts/utils/math/Math.sol\":{\"keccak256\":\"0x09e3f1c72d4c5cbe8e2644ab7313f8f7177533ae2f4c24cdcbbeaf520a73734c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://93208401215d539fa2d81626b207c1f611def7883d0e447b3b5969ebaa7b3c2c\",\"dweb:/ipfs/QmXPxDnQPx8LAweX5ZJqEcwkvs59kP4c64VVDG1Jjq1mef\"]},\"lib/openzeppelin-contracts/contracts/utils/math/SafeCast.sol\":{\"keccak256\":\"0x195533c86d0ef72bcc06456a4f66a9b941f38eb403739b00f21fd7c1abd1ae54\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://b1d578337048cad08c1c03041cca5978eff5428aa130c781b271ad9e5566e1f8\",\"dweb:/ipfs/QmPFKL2r9CBsMwmUqqdcFPfHZB2qcs9g1HDrPxzWSxomvy\"]},\"lib/openzeppelin-contracts/contracts/utils/math/SignedMath.sol\":{\"keccak256\":\"0xb1970fac7b64e6c09611e6691791e848d5e3fe410fa5899e7df2e0afd77a99e3\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://db5fbb3dddd8b7047465b62575d96231ba8a2774d37fb4737fbf23340fabbb03\",\"dweb:/ipfs/QmVUSvooZKEdEdap619tcJjTLcAuH6QBdZqAzWwnAXZAWJ\"]},\"src/BaseArbiter.sol\":{\"keccak256\":\"0x27fa97834bcd6e592f3b534e64859b208c688363d33fb9b62436d009ffff3ed1\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://b61ac6195ae644325adf77fdb301651cddfca4b63d9db5123ee075869f3784aa\",\"dweb:/ipfs/QmYRu5hER8gaMjqyY5bDV9EAwVN12CbS3Z2bW8dLp7sPSE\"]},\"src/BaseAttester.sol\":{\"keccak256\":\"0x12339a862aa0571244f4a0c2dae1a7bcc1734717474dbf0d69b63886987d1f99\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://d40e983dece581ecb49a1a01bc87c66e86f8c954cc442a02151ec427d680682d\",\"dweb:/ipfs/QmVA7Tqk1KaYhrZpxWx3cdsjUoxsRaoBjJX8k6nCSEk8En\"]},\"src/BaseEscrowObligation.sol\":{\"keccak256\":\"0x49717032f4edbbfd52bf160a99b7b39f726e8a2f968ed4b261ee31b1622a22ac\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://1aba86a5094f4be28de1c5782087aff65c6d0bbc8ab124501e0677b5cab843f2\",\"dweb:/ipfs/QmXfo8c532ALhAUC9iae2mrSWLmDTSABunMJP2iU7PpKek\"]},\"src/BaseObligation.sol\":{\"keccak256\":\"0xf00b1317dd9203ea59e8da6c0bb23267b50ecb2751cd11b26a6330d1e596eb7b\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://5b9762a2ba2251c6ae9d23aa3ba49a8124f3348ac13c9271b8b9ada438dff475\",\"dweb:/ipfs/QmeBZUvNjNyC7W1hb1PKQq8CawC5ULWX9KXgJjH37wvPGH\"]},\"src/IArbiter.sol\":{\"keccak256\":\"0x00f3f5d8460c738eff4a776cf309efe38342fcc951abfe97d1c2e285acb1e330\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://7201a176f3d5c3d01ca13bbcd9ef5587effe8fabf20e0b8f81f2d6ee362269b9\",\"dweb:/ipfs/QmXn9aSvoGPQuNTxe3mM47RNQ1bfYCEczQCYsDDM9ohc8M\"]},\"src/IEscrow.sol\":{\"keccak256\":\"0x8803bb72e285722a5e90f08046cfee7d37acc6cf83c13a5074cfb0740e316a45\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://965024e29be08418fd9acef578b5253af5fb0d39227c291298d83dae5d7ffd01\",\"dweb:/ipfs/QmPh2h21EC6L4aWauvk5cFzc4x3Xf4f1brxyrgxeKUuWEs\"]},\"src/libraries/ArbiterUtils.sol\":{\"keccak256\":\"0xb87e2bfb9c7292daf6426fbedc09c8683b92841d1b92e7359c0ff94d42be632f\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://3acf498c3c59891d76db768ea57d8f7f6b4010dcbaf44a5f93d95d72f0b12441\",\"dweb:/ipfs/QmVbkioM8dWwYxqatm1dyo9PRFNZ6c7Kbang7pozbnyS7j\"]},\"src/libraries/SchemaRegistryUtils.sol\":{\"keccak256\":\"0x81e4728ad79515866f28175a00a512afd2f7010bd109ae221defb29a87430cd0\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://4edac7284c764f1236b5875ed00f357f0e30aecc5006c88afe220bef60b541d3\",\"dweb:/ipfs/QmXj8oLa1RXMgHCXtgdbriVqQFgX6rjnPNbmQpwpK2YXsK\"]},\"src/obligations/escrow/default/ERC20EscrowObligation.sol\":{\"keccak256\":\"0x3e787151419a97f81e29f5a5c7c1e2bfc140958f1da7d60428987bc9111d7d97\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://072ed048c2cf8324bc5f31ffeb161a389e21316dd575b217bf5c770ceb6cee69\",\"dweb:/ipfs/QmVDbP76B1JfgPBSgSdKtqYUZQ9spGcFcYSU5qmt42WYfK\"]},\"src/utils/splitters/SplitterVerification.sol\":{\"keccak256\":\"0xe44de375f61523e820159040a5643ee57d29969c083c889bf1c3cba62a5d0422\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://8cc3495c7bf1f8b8fac20b6d4ee36e96abf4b9f885c21287434c8824a6c1084f\",\"dweb:/ipfs/QmaYPYkK9qD8DadfRzfnNFGRD2cDerwz7TQoXHN3TZ8Ws2\"]},\"src/utils/splitters/commitment/CommitmentBaseSplitter.sol\":{\"keccak256\":\"0x3a8dfb947f58dd84f2f8e143cac9c183b24213293b990bff4dee0b397bdc21cd\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://f260a55f6a1b12013f3cdc72370e9f6f0b1c79e87d696233f5c06a745630a993\",\"dweb:/ipfs/QmRgKgALG76k3Qp9AUmZWSFxwwn8gmHeJpsMdhL1iqwh7r\"]},\"src/utils/splitters/commitment/CommitmentERC20Splitter.sol\":{\"keccak256\":\"0xb2666f13b6af1ec595daceabf6b7b2d8adfaa2c649ea7119beda33722b6f1b46\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://75acec71aaf1877c47e0b5e89687b52c39e65fd078bb1b2d7855631306095b5d\",\"dweb:/ipfs/QmP4VvxuA5ZtwTKDSzHN2JDvjQ4B24W8uWWGvModJwaPth\"]},\"src/utils/splitters/default/BaseSplitter.sol\":{\"keccak256\":\"0x4afde2ead2a9123638360f326d623fe3a260d04c205d5af7836fb726cd086d15\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://48f585a248769bc71f3fa35a4ae7287244a21f151957577bc2a990a91687d65b\",\"dweb:/ipfs/QmbWdW3eCdzp7XWaLhU1eyDF11o1thdzWJzSwJ1afGnRxW\"]}},\"version\":1}",
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
              "internalType": "contract ERC20EscrowObligation",
              "name": "_escrowObligation",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
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
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
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
          "name": "ERC20TransferFailed"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "EmptySplits"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "fulfillment",
              "type": "bytes32"
            }
          ],
          "type": "error",
          "name": "FulfillerAlreadyRecorded"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidAttestationUid"
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
              "name": "actual",
              "type": "uint256"
            }
          ],
          "type": "error",
          "name": "InvalidCollectedAmount"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "fulfillment",
              "type": "bytes32"
            }
          ],
          "type": "error",
          "name": "InvalidCreatedFulfillment"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidEscrowAttestation"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidFulfillmentRecipient"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidFulfillmentUid"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "totalExpected",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalProvided",
              "type": "uint256"
            }
          ],
          "type": "error",
          "name": "InvalidSplits"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "fulfillment",
              "type": "bytes32"
            }
          ],
          "type": "error",
          "name": "NoFulfillerRecorded"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "ReentrancyGuardReentrantCall"
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
          "name": "TooManySplits"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "UnauthorizedArbitrationRequest"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "fulfillment",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "caller",
              "type": "address"
            }
          ],
          "type": "error",
          "name": "UnauthorizedPartialSettlement"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "decisionKey",
              "type": "bytes32",
              "indexed": true
            },
            {
              "internalType": "bytes32",
              "name": "intentHash",
              "type": "bytes32",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "oracle",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "struct CommitmentERC20Splitter.Split[]",
              "name": "splits",
              "type": "tuple[]",
              "components": [
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
              "indexed": false
            }
          ],
          "type": "event",
          "name": "ArbitrationMade",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "fulfillment",
              "type": "bytes32",
              "indexed": true
            },
            {
              "internalType": "bytes32",
              "name": "escrow",
              "type": "bytes32",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "oracle",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "bytes",
              "name": "demand",
              "type": "bytes",
              "indexed": false
            }
          ],
          "type": "event",
          "name": "ArbitrationRequested",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "intentHash",
              "type": "bytes32",
              "indexed": true
            },
            {
              "internalType": "bytes32",
              "name": "escrow",
              "type": "bytes32",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "oracle",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "bytes",
              "name": "demand",
              "type": "bytes",
              "indexed": false
            }
          ],
          "type": "event",
          "name": "CommitmentArbitrationRequested",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "token",
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
          "name": "ERC20TransferFailedOnDistribute",
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
            },
            {
              "internalType": "address",
              "name": "token",
              "type": "address",
              "indexed": false
            },
            {
              "internalType": "struct CommitmentERC20Splitter.Split[]",
              "name": "splits",
              "type": "tuple[]",
              "components": [
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
              "indexed": false
            }
          ],
          "type": "event",
          "name": "EscrowCollectedAndDistributed",
          "anonymous": false
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
              "name": "fulfiller",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "obligationContract",
              "type": "address",
              "indexed": true
            }
          ],
          "type": "event",
          "name": "FulfillmentCreated",
          "anonymous": false
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "EXECUTOR_SENTINEL",
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
          "stateMutability": "view",
          "type": "function",
          "name": "MAX_SPLITS",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ]
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "activeSettlement",
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
              "internalType": "bytes32",
              "name": "intentHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "escrow",
              "type": "bytes32"
            },
            {
              "internalType": "struct CommitmentERC20Splitter.Split[]",
              "name": "splits",
              "type": "tuple[]",
              "components": [
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
              ]
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "arbitrate"
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
          "stateMutability": "pure",
          "type": "function",
          "name": "attestationIntentHash",
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
              "internalType": "bytes32",
              "name": "schema",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "attester",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint64",
              "name": "expirationTime",
              "type": "uint64"
            },
            {
              "internalType": "bool",
              "name": "revocable",
              "type": "bool"
            },
            {
              "internalType": "bytes32",
              "name": "refUID",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "dataHash",
              "type": "bytes32"
            }
          ],
          "stateMutability": "pure",
          "type": "function",
          "name": "attestationIntentHash",
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
              "internalType": "bytes32",
              "name": "schema",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "attester",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint64",
              "name": "expirationTime",
              "type": "uint64"
            },
            {
              "internalType": "bool",
              "name": "revocable",
              "type": "bool"
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
          "name": "attestationIntentHash",
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
              "name": "fulfillment",
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
              "name": "escrow",
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
              "name": "escrow",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "fulfillment",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "collectAndDistribute"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "obligationContract",
              "type": "address"
            },
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
          "name": "createFulfillment",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "fulfillmentUid",
              "type": "bytes32"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "escrow",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "obligationContract",
              "type": "address"
            },
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
          "name": "createFulfillmentAndCollectAndDistribute",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "fulfillmentUid",
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
              "internalType": "struct CommitmentERC20Splitter.DemandData",
              "name": "",
              "type": "tuple",
              "components": [
                {
                  "internalType": "address",
                  "name": "oracle",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ]
            }
          ]
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "eas",
          "outputs": [
            {
              "internalType": "contract IEAS",
              "name": "",
              "type": "address"
            }
          ]
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "escrowObligation",
          "outputs": [
            {
              "internalType": "contract IEscrow",
              "name": "",
              "type": "address"
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
          "name": "fulfillers",
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
              "internalType": "bytes32",
              "name": "schema",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "attester",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint64",
              "name": "expirationTime",
              "type": "uint64"
            },
            {
              "internalType": "bool",
              "name": "revocable",
              "type": "bool"
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
            },
            {
              "internalType": "address",
              "name": "fulfiller",
              "type": "address"
            }
          ],
          "stateMutability": "pure",
          "type": "function",
          "name": "fulfillmentIntentHash",
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
              "internalType": "bytes32",
              "name": "schema",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "attester",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint64",
              "name": "expirationTime",
              "type": "uint64"
            },
            {
              "internalType": "bool",
              "name": "revocable",
              "type": "bool"
            },
            {
              "internalType": "bytes32",
              "name": "refUID",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "dataHash",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "fulfiller",
              "type": "address"
            }
          ],
          "stateMutability": "pure",
          "type": "function",
          "name": "fulfillmentIntentHash",
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
            },
            {
              "internalType": "address",
              "name": "fulfiller",
              "type": "address"
            }
          ],
          "stateMutability": "pure",
          "type": "function",
          "name": "fulfillmentIntentHash",
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
              "name": "oracle",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "intentHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "escrow",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "getSplits",
          "outputs": [
            {
              "internalType": "struct CommitmentERC20Splitter.Split[]",
              "name": "",
              "type": "tuple[]",
              "components": [
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
              ]
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "hasDecision",
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
              "name": "intentHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "escrow",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "oracle",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "demand",
              "type": "bytes"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "requestArbitration"
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
              "internalType": "bytes32",
              "name": "escrow",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "fulfillment",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "unsafePartiallyCollectAndDistribute"
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
          "check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)": {
            "params": {
              "demand": "Arbiter-specific demand data encoded by the escrow creator.",
              "escrowUid": "The UID of the escrow attestation being fulfilled.",
              "fulfillment": "The EAS attestation being used as fulfillment."
            }
          },
          "supportsInterface(bytes4)": {
            "details": "Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section] to learn more about how these ids are created. This function call must use less than 30 000 gas."
          },
          "unsafePartiallyCollectAndDistribute(bytes32,bytes32)": {
            "details": "Use only as a last resort when collectAndDistribute is permanently blocked.      Failed transfers emit events but do not revert. Stuck tokens remain in the splitter."
          }
        },
        "version": 1
      },
      "userdoc": {
        "kind": "user",
        "methods": {
          "EXECUTOR_SENTINEL()": {
            "notice": "Sentinel address meaning \"the fulfiller who created the fulfillment\"."
          },
          "MAX_SPLITS()": {
            "notice": "Maximum number of splits allowed per decision."
          },
          "activeSettlement()": {
            "notice": "Decision key the splitter is currently collecting, or zero when idle."
          },
          "arbitrate(bytes32,bytes32,(address,uint256)[])": {
            "notice": "Records the caller's split decision for a future fulfillment intent and escrow."
          },
          "attestationIntentHash((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))": {
            "notice": "Hashes the semantic attestation fields an oracle can approve before EAS assigns a UID."
          },
          "attestationIntentHash(bytes32,address,address,uint64,bool,bytes32,bytes)": {
            "notice": "Hashes an attestation intent from pre-encoded attestation data."
          },
          "attestationIntentHash(bytes32,address,address,uint64,bool,bytes32,bytes32)": {
            "notice": "Hashes an attestation intent from an already-computed data hash."
          },
          "check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)": {
            "notice": "Returns true when `fulfillment` satisfies `demand` for `escrowUid`."
          },
          "collectAndDistribute(bytes32,bytes32)": {
            "notice": "Collects an ERC20 escrow and distributes tokens per oracle splits.         Reverts if any transfer fails."
          },
          "createFulfillment(address,bytes,uint64,bytes32)": {
            "notice": "Creates a fulfillment attestation addressed to this splitter and records the caller as fulfiller."
          },
          "createFulfillmentAndCollectAndDistribute(bytes32,address,bytes,uint64,bytes32)": {
            "notice": "Creates a splitter-owned fulfillment and atomically collects and distributes the escrow."
          },
          "decodeDemandData(bytes)": {
            "notice": "Decodes ABI-encoded ERC20 splitter demand data."
          },
          "eas()": {
            "notice": "EAS contract used to load escrow and fulfillment attestations."
          },
          "escrowObligation()": {
            "notice": "Canonical escrow obligation this splitter is allowed to collect."
          },
          "fulfillers(bytes32)": {
            "notice": "External fulfiller recorded for splitter-owned fulfillments."
          },
          "fulfillmentIntentHash((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),address)": {
            "notice": "Hashes a splitter fulfillment intent, binding the attestation fields to the recorded fulfiller."
          },
          "fulfillmentIntentHash(bytes32,address,address,uint64,bool,bytes32,bytes,address)": {
            "notice": "Hashes a splitter fulfillment intent from pre-encoded attestation data."
          },
          "fulfillmentIntentHash(bytes32,address,address,uint64,bool,bytes32,bytes32,address)": {
            "notice": "Hashes a splitter fulfillment intent from an already-computed data hash."
          },
          "getSplits(address,bytes32,bytes32)": {
            "notice": "Returns ERC20 splits recorded by an oracle for a fulfillment intent and escrow."
          },
          "hasDecision(address,bytes32)": {
            "notice": "Whether an oracle has recorded a decision for a decision key."
          },
          "requestArbitration(bytes32,bytes32,address,bytes)": {
            "notice": "Emits an arbitration request for a future fulfillment when called by the escrow attester or recipient."
          },
          "unsafePartiallyCollectAndDistribute(bytes32,bytes32)": {
            "notice": "Unsafe partial distribution -- continues on individual transfer failures."
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
        "src/utils/splitters/commitment/CommitmentERC20Splitter.sol": "CommitmentERC20Splitter"
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
      "lib/openzeppelin-contracts/contracts/interfaces/IERC1363.sol": {
        "keccak256": "0xd5ea07362ab630a6a3dee4285a74cf2377044ca2e4be472755ad64d7c5d4b69d",
        "urls": [
          "bzz-raw://da5e832b40fc5c3145d3781e2e5fa60ac2052c9d08af7e300dc8ab80c4343100",
          "dweb:/ipfs/QmTzf7N5ZUdh5raqtzbM11yexiUoLC9z3Ws632MCuycq1d"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/interfaces/IERC165.sol": {
        "keccak256": "0x0afcb7e740d1537b252cb2676f600465ce6938398569f09ba1b9ca240dde2dfc",
        "urls": [
          "bzz-raw://1c299900ac4ec268d4570ecef0d697a3013cd11a6eb74e295ee3fbc945056037",
          "dweb:/ipfs/Qmab9owJoxcA7vJT5XNayCMaUR1qxqj1NDzzisduwaJMcZ"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/interfaces/IERC20.sol": {
        "keccak256": "0x1a6221315ce0307746c2c4827c125d821ee796c74a676787762f4778671d4f44",
        "urls": [
          "bzz-raw://1bb2332a7ee26dd0b0de9b7fe266749f54820c99ab6a3bcb6f7e6b751d47ee2d",
          "dweb:/ipfs/QmcRWpaBeCYkhy68PR3B4AgD7asuQk7PwkWxrvJbZcikLF"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol": {
        "keccak256": "0x74ed01eb66b923d0d0cfe3be84604ac04b76482a55f9dd655e1ef4d367f95bc2",
        "urls": [
          "bzz-raw://5282825a626cfe924e504274b864a652b0023591fa66f06a067b25b51ba9b303",
          "dweb:/ipfs/QmeCfPykghhMc81VJTrHTC7sF6CRvaA1FXVq2pJhwYp1dV"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol": {
        "keccak256": "0x304d732678032a9781ae85c8f204c8fba3d3a5e31c02616964e75cfdc5049098",
        "urls": [
          "bzz-raw://299ced486011781dc98f638059678323c03079fefae1482abaa2135b22fa92d0",
          "dweb:/ipfs/QmbZNbcPTBxNvwChavN2kkZZs7xHhYL7mv51KrxMhsMs3j"
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
      "src/obligations/escrow/default/ERC20EscrowObligation.sol": {
        "keccak256": "0x3e787151419a97f81e29f5a5c7c1e2bfc140958f1da7d60428987bc9111d7d97",
        "urls": [
          "bzz-raw://072ed048c2cf8324bc5f31ffeb161a389e21316dd575b217bf5c770ceb6cee69",
          "dweb:/ipfs/QmVDbP76B1JfgPBSgSdKtqYUZQ9spGcFcYSU5qmt42WYfK"
        ],
        "license": "UNLICENSED"
      },
      "src/utils/splitters/SplitterVerification.sol": {
        "keccak256": "0xe44de375f61523e820159040a5643ee57d29969c083c889bf1c3cba62a5d0422",
        "urls": [
          "bzz-raw://8cc3495c7bf1f8b8fac20b6d4ee36e96abf4b9f885c21287434c8824a6c1084f",
          "dweb:/ipfs/QmaYPYkK9qD8DadfRzfnNFGRD2cDerwz7TQoXHN3TZ8Ws2"
        ],
        "license": "UNLICENSED"
      },
      "src/utils/splitters/commitment/CommitmentBaseSplitter.sol": {
        "keccak256": "0x3a8dfb947f58dd84f2f8e143cac9c183b24213293b990bff4dee0b397bdc21cd",
        "urls": [
          "bzz-raw://f260a55f6a1b12013f3cdc72370e9f6f0b1c79e87d696233f5c06a745630a993",
          "dweb:/ipfs/QmRgKgALG76k3Qp9AUmZWSFxwwn8gmHeJpsMdhL1iqwh7r"
        ],
        "license": "UNLICENSED"
      },
      "src/utils/splitters/commitment/CommitmentERC20Splitter.sol": {
        "keccak256": "0xb2666f13b6af1ec595daceabf6b7b2d8adfaa2c649ea7119beda33722b6f1b46",
        "urls": [
          "bzz-raw://75acec71aaf1877c47e0b5e89687b52c39e65fd078bb1b2d7855631306095b5d",
          "dweb:/ipfs/QmP4VvxuA5ZtwTKDSzHN2JDvjQ4B24W8uWWGvModJwaPth"
        ],
        "license": "UNLICENSED"
      },
      "src/utils/splitters/default/BaseSplitter.sol": {
        "keccak256": "0x4afde2ead2a9123638360f326d623fe3a260d04c205d5af7836fb726cd086d15",
        "urls": [
          "bzz-raw://48f585a248769bc71f3fa35a4ae7287244a21f151957577bc2a990a91687d65b",
          "dweb:/ipfs/QmbWdW3eCdzp7XWaLhU1eyDF11o1thdzWJzSwJ1afGnRxW"
        ],
        "license": "UNLICENSED"
      }
    },
    "version": 1
  },
  "id": 169
} as const;
