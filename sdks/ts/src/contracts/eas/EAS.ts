export const abi = {
  "abi": [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "registry",
          "type": "address",
          "internalType": "contract ISchemaRegistry"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "attest",
      "inputs": [
        {
          "name": "request",
          "type": "tuple",
          "internalType": "struct AttestationRequest",
          "components": [
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "data",
              "type": "tuple",
              "internalType": "struct AttestationRequestData",
              "components": [
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
                  "name": "value",
                  "type": "uint256",
                  "internalType": "uint256"
                }
              ]
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
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "attestByDelegation",
      "inputs": [
        {
          "name": "delegatedRequest",
          "type": "tuple",
          "internalType": "struct DelegatedAttestationRequest",
          "components": [
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "data",
              "type": "tuple",
              "internalType": "struct AttestationRequestData",
              "components": [
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
                  "name": "value",
                  "type": "uint256",
                  "internalType": "uint256"
                }
              ]
            },
            {
              "name": "signature",
              "type": "tuple",
              "internalType": "struct Signature",
              "components": [
                {
                  "name": "v",
                  "type": "uint8",
                  "internalType": "uint8"
                },
                {
                  "name": "r",
                  "type": "bytes32",
                  "internalType": "bytes32"
                },
                {
                  "name": "s",
                  "type": "bytes32",
                  "internalType": "bytes32"
                }
              ]
            },
            {
              "name": "attester",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "deadline",
              "type": "uint64",
              "internalType": "uint64"
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
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "eip712Domain",
      "inputs": [],
      "outputs": [
        {
          "name": "fields",
          "type": "bytes1",
          "internalType": "bytes1"
        },
        {
          "name": "name",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "version",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "chainId",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "verifyingContract",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "salt",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "extensions",
          "type": "uint256[]",
          "internalType": "uint256[]"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getAttestTypeHash",
      "inputs": [],
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
      "name": "getAttestation",
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
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getDomainSeparator",
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
      "name": "getName",
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
      "type": "function",
      "name": "getNonce",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        }
      ],
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
      "name": "getRevokeOffchain",
      "inputs": [
        {
          "name": "revoker",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "data",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint64",
          "internalType": "uint64"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getRevokeTypeHash",
      "inputs": [],
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
      "name": "getSchemaRegistry",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract ISchemaRegistry"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getTimestamp",
      "inputs": [
        {
          "name": "data",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint64",
          "internalType": "uint64"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "increaseNonce",
      "inputs": [
        {
          "name": "newNonce",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "isAttestationValid",
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
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "multiAttest",
      "inputs": [
        {
          "name": "multiRequests",
          "type": "tuple[]",
          "internalType": "struct MultiAttestationRequest[]",
          "components": [
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "data",
              "type": "tuple[]",
              "internalType": "struct AttestationRequestData[]",
              "components": [
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
                  "name": "value",
                  "type": "uint256",
                  "internalType": "uint256"
                }
              ]
            }
          ]
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bytes32[]",
          "internalType": "bytes32[]"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "multiAttestByDelegation",
      "inputs": [
        {
          "name": "multiDelegatedRequests",
          "type": "tuple[]",
          "internalType": "struct MultiDelegatedAttestationRequest[]",
          "components": [
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "data",
              "type": "tuple[]",
              "internalType": "struct AttestationRequestData[]",
              "components": [
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
                  "name": "value",
                  "type": "uint256",
                  "internalType": "uint256"
                }
              ]
            },
            {
              "name": "signatures",
              "type": "tuple[]",
              "internalType": "struct Signature[]",
              "components": [
                {
                  "name": "v",
                  "type": "uint8",
                  "internalType": "uint8"
                },
                {
                  "name": "r",
                  "type": "bytes32",
                  "internalType": "bytes32"
                },
                {
                  "name": "s",
                  "type": "bytes32",
                  "internalType": "bytes32"
                }
              ]
            },
            {
              "name": "attester",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "deadline",
              "type": "uint64",
              "internalType": "uint64"
            }
          ]
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bytes32[]",
          "internalType": "bytes32[]"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "multiRevoke",
      "inputs": [
        {
          "name": "multiRequests",
          "type": "tuple[]",
          "internalType": "struct MultiRevocationRequest[]",
          "components": [
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "data",
              "type": "tuple[]",
              "internalType": "struct RevocationRequestData[]",
              "components": [
                {
                  "name": "uid",
                  "type": "bytes32",
                  "internalType": "bytes32"
                },
                {
                  "name": "value",
                  "type": "uint256",
                  "internalType": "uint256"
                }
              ]
            }
          ]
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "multiRevokeByDelegation",
      "inputs": [
        {
          "name": "multiDelegatedRequests",
          "type": "tuple[]",
          "internalType": "struct MultiDelegatedRevocationRequest[]",
          "components": [
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "data",
              "type": "tuple[]",
              "internalType": "struct RevocationRequestData[]",
              "components": [
                {
                  "name": "uid",
                  "type": "bytes32",
                  "internalType": "bytes32"
                },
                {
                  "name": "value",
                  "type": "uint256",
                  "internalType": "uint256"
                }
              ]
            },
            {
              "name": "signatures",
              "type": "tuple[]",
              "internalType": "struct Signature[]",
              "components": [
                {
                  "name": "v",
                  "type": "uint8",
                  "internalType": "uint8"
                },
                {
                  "name": "r",
                  "type": "bytes32",
                  "internalType": "bytes32"
                },
                {
                  "name": "s",
                  "type": "bytes32",
                  "internalType": "bytes32"
                }
              ]
            },
            {
              "name": "revoker",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "deadline",
              "type": "uint64",
              "internalType": "uint64"
            }
          ]
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "multiRevokeOffchain",
      "inputs": [
        {
          "name": "data",
          "type": "bytes32[]",
          "internalType": "bytes32[]"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint64",
          "internalType": "uint64"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "multiTimestamp",
      "inputs": [
        {
          "name": "data",
          "type": "bytes32[]",
          "internalType": "bytes32[]"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint64",
          "internalType": "uint64"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "revoke",
      "inputs": [
        {
          "name": "request",
          "type": "tuple",
          "internalType": "struct RevocationRequest",
          "components": [
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "data",
              "type": "tuple",
              "internalType": "struct RevocationRequestData",
              "components": [
                {
                  "name": "uid",
                  "type": "bytes32",
                  "internalType": "bytes32"
                },
                {
                  "name": "value",
                  "type": "uint256",
                  "internalType": "uint256"
                }
              ]
            }
          ]
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "revokeByDelegation",
      "inputs": [
        {
          "name": "delegatedRequest",
          "type": "tuple",
          "internalType": "struct DelegatedRevocationRequest",
          "components": [
            {
              "name": "schema",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "data",
              "type": "tuple",
              "internalType": "struct RevocationRequestData",
              "components": [
                {
                  "name": "uid",
                  "type": "bytes32",
                  "internalType": "bytes32"
                },
                {
                  "name": "value",
                  "type": "uint256",
                  "internalType": "uint256"
                }
              ]
            },
            {
              "name": "signature",
              "type": "tuple",
              "internalType": "struct Signature",
              "components": [
                {
                  "name": "v",
                  "type": "uint8",
                  "internalType": "uint8"
                },
                {
                  "name": "r",
                  "type": "bytes32",
                  "internalType": "bytes32"
                },
                {
                  "name": "s",
                  "type": "bytes32",
                  "internalType": "bytes32"
                }
              ]
            },
            {
              "name": "revoker",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "deadline",
              "type": "uint64",
              "internalType": "uint64"
            }
          ]
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "revokeOffchain",
      "inputs": [
        {
          "name": "data",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint64",
          "internalType": "uint64"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "timestamp",
      "inputs": [
        {
          "name": "data",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint64",
          "internalType": "uint64"
        }
      ],
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
      "name": "Attested",
      "inputs": [
        {
          "name": "recipient",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "attester",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "uid",
          "type": "bytes32",
          "indexed": false,
          "internalType": "bytes32"
        },
        {
          "name": "schemaUID",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "EIP712DomainChanged",
      "inputs": [],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "NonceIncreased",
      "inputs": [
        {
          "name": "oldNonce",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "newNonce",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Revoked",
      "inputs": [
        {
          "name": "recipient",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "attester",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "uid",
          "type": "bytes32",
          "indexed": false,
          "internalType": "bytes32"
        },
        {
          "name": "schemaUID",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "RevokedOffchain",
      "inputs": [
        {
          "name": "revoker",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "data",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "timestamp",
          "type": "uint64",
          "indexed": true,
          "internalType": "uint64"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Timestamped",
      "inputs": [
        {
          "name": "data",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "timestamp",
          "type": "uint64",
          "indexed": true,
          "internalType": "uint64"
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
      "name": "AlreadyRevoked",
      "inputs": []
    },
    {
      "type": "error",
      "name": "AlreadyRevokedOffchain",
      "inputs": []
    },
    {
      "type": "error",
      "name": "AlreadyTimestamped",
      "inputs": []
    },
    {
      "type": "error",
      "name": "DeadlineExpired",
      "inputs": []
    },
    {
      "type": "error",
      "name": "FailedCall",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InsufficientBalance",
      "inputs": [
        {
          "name": "balance",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "needed",
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
      "name": "InvalidAttestation",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidAttestations",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidExpirationTime",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidLength",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidNonce",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidOffset",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidRegistry",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidRevocation",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidRevocations",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidSchema",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidShortString",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidSignature",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidVerifier",
      "inputs": []
    },
    {
      "type": "error",
      "name": "Irrevocable",
      "inputs": []
    },
    {
      "type": "error",
      "name": "NotFound",
      "inputs": []
    },
    {
      "type": "error",
      "name": "NotPayable",
      "inputs": []
    },
    {
      "type": "error",
      "name": "StringTooLong",
      "inputs": [
        {
          "name": "str",
          "type": "string",
          "internalType": "string"
        }
      ]
    },
    {
      "type": "error",
      "name": "WrongSchema",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x6101e080604052346103335760208161432780380380916100208285610337565b83398101031261033357516001600160a01b03811690818103610333576040519161004c604084610337565b60038352602083016245415360e81b81526040519061006c604083610337565b600582526020820190640312e332e360dc1b82526001608052600360a0525f60c0526100978661035a565b610180526100a4836104dc565b6101a05285519020918261014052519020806101605246610100526040519060208201927f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f8452604083015260608201524660808201523060a082015260a0815261011060c082610337565b51902060e052306101205282516001600160401b03811161031f57600254600181811c91168015610315575b602082101461030157601f811161029e575b506020601f821160011461023b57819293945f92610230575b50508160011b915f199060031b1c1916176002555b15610221576101c052604051613d129081610615823960805181610df0015260a05181610e1b015260c05181610e46015260e0518161339f0152610100518161345c01526101205181613369015261014051816133ee0152610160518161341401526101805181610ca401526101a05181610cd001526101c0518181816101cf015281816107a0015281816111e5015281816125ff015281816127ee0152612ba40152f35b6311a1e69760e01b5f5260045ffd5b015190505f80610167565b601f1982169060025f52805f20915f5b8181106102865750958360019596971061026e575b505050811b0160025561017c565b01515f1960f88460031b161c191690555f8080610260565b9192602060018192868b01518155019401920161024b565b60025f527f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace601f830160051c810191602084106102f7575b601f0160051c01905b8181106102ec575061014e565b5f81556001016102df565b90915081906102d6565b634e487b7160e01b5f52602260045260245ffd5b90607f169061013c565b634e487b7160e01b5f52604160045260245ffd5b5f80fd5b601f909101601f19168101906001600160401b0382119082101761031f57604052565b908151602081105f146103d4575090601f815111610394576020815191015160208210610385571790565b5f198260200360031b1b161790565b604460209160405192839163305a27a960e01b83528160048401528051918291826024860152018484015e5f828201840152601f01601f19168101030190fd5b6001600160401b03811161031f575f54600181811c911680156104d2575b602082101461030157601f81116104a0575b50602092601f821160011461044157928192935f92610436575b50508160011b915f199060031b1c1916175f5560ff90565b015190505f8061041e565b601f198216935f8052805f20915f5b8681106104885750836001959610610470575b505050811b015f5560ff90565b01515f1960f88460031b161c191690555f8080610463565b91926020600181928685015181550194019201610450565b5f8052601f60205f20910160051c810190601f830160051c015b8181106104c75750610404565b5f81556001016104ba565b90607f16906103f2565b908151602081105f14610507575090601f815111610394576020815191015160208210610385571790565b6001600160401b03811161031f57600154600181811c9116801561060a575b602082101461030157601f81116105d7575b50602092601f821160011461057657928192935f9261056b575b50508160011b915f199060031b1c19161760015560ff90565b015190505f80610552565b601f1982169360015f52805f20915f5b8681106105bf57508360019596106105a7575b505050811b0160015560ff90565b01515f1960f88460031b161c191690555f8080610599565b91926020600181928685015181550194019201610586565b60015f52601f60205f20910160051c810190601f830160051c015b8181106105ff5750610538565b5f81556001016105f2565b90607f169061052656fe6101206040526004361015610012575f80fd5b5f3560e01c80630eabf660146118d457806312b11a171461189a57806313893f611461182b57806317d7de7c146117615780632d0335ab146117295780633c042715146110cb57806344adc90e14610fed5780634692626714610fad5780634cb7e9e514610efc5780634d00307014610ed357806354fd4d5014610dd157806379f7573a14610d5957806384b0196e14610c8c5780639541152514610a99578063a3112a6414610a4e578063a6d4dbc714610977578063b469318d1461092a578063b83010d3146108f0578063cf190f34146108c6578063d45c443514610893578063e30bb5631461085f578063e71ff365146107f1578063ed24911d146107cf578063f10b5cc81461078b5763f17325e71461012d575f80fd5b6020366003190112610787576004356001600160401b038111610787578060040190604060031982360301126107875761017c61016861200e565b91610177602436920185612073565b611f52565b61018582611e2c565b5261018f81611e2c565b50610198612b3b565b508051906101a4612b3b565b926101ae836121f3565b60208501526040516351753e3760e11b815281356004820152925f846024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa93841561077c575f94610758575b508351156107495761021c8195949395612593565b90610226816121f3565b925f965b82881061025857602061024f81896102466001348b8b8e6137a9565b81520151611e2c565b51604051908152f35b610269888299979498939699611e39565b519260208401976001600160401b038951168015159081610735575b506107265760408201511580610719575b61070a57606085015198518551604080880151608089015191519c9193901515926001600160a01b031691906001600160401b03168d6102d581611cef565b5f90528d8c3590602001528d426001600160401b031660408201526060015260808d015f905260a08d015260c08c01523360e08c01526101008b01526101208a01525f5b60208a01518a6103e96004609960c0840151602060e086015195604081015190606081015161010082015115159061012060a0840151930151936040519a8b978789019d8e526001600160601b03199060601b1660408901526001600160601b03199060601b1660548801526001600160401b0360c01b9060c01b1660688701526001600160401b0360c01b9060c01b16607086015260f81b607885015260798401528051918291018484015e810163ffffffff60e01b8860e01b16838201520301601b19810184520182611d0b565b519020805f52600460205260405f20541561040d575060010163ffffffff16610319565b91969795905099979198929399818452815f52600460205260405f2084518155602085015160018201556104bb600282016001600160401b0380604089015116166001600160401b0319825416178155606087015167ffffffffffffffff60401b82549160401b169067ffffffffffffffff60401b19161781556001600160401b036080880151168154906001600160401b0360801b9060801b16906001600160401b0360801b1916179055565b60a085810151600383015560c08601516004830180546001600160a01b0319166001600160a01b0392831617905560e08701516005840180546101008a01516001600160a81b0319909116929093169190911791151590921b60ff60a01b161790556101208501518051906001600160401b0382116106f6576105416006840154611e7e565b601f81116106b2575b50602090601f831160011461064757600692915f918361063c575b50508160011b915f199060031b1c1916179101555b8a88606083015180610608575b5084602085936105a8838560019b6105a2836105c199611e39565b52611e39565b508d6105b98460a089015192611e39565b520151611e39565b52838060a01b03905116906040519081528535917f8bf46bf4cfd674fa735a3d63ec1c9ad4153f033c290341f3a588b75685141b3560203393a4019695949392919061022a565b905061062091505f52600460205260405f2054151590565b1561062d578a885f610587565b63c5723b5160e01b5f5260045ffd5b015190505f80610565565b90600684015f52805f20915f5b601f198516811061069a5750918391600193600695601f19811610610682575b505050811b0191015561057a565b01515f1960f88460031b161c191690555f8080610674565b91926020600181928685015181550194019201610654565b600684015f5260205f20601f840160051c8101602085106106ef575b601f830160051c820181106106e457505061054a565b5f81556001016106ce565b50806106ce565b634e487b7160e01b5f52604160045260245ffd5b63157bd4c360e01b5f5260045ffd5b5060408501511515610296565b6308e8b93760e01b5f5260045ffd5b90506001600160401b03421610155f610285565b635f9bd90760e11b5f5260045ffd5b6107759194503d805f833e61076d8183611d0b565b8101906124c0565b925f610207565b6040513d5f823e3d90fd5b5f80fd5b34610787575f366003190112610787576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b34610787575f3660031901126107875760206107e9613366565b604051908152f35b34610787576020366003190112610787576004356001600160401b03811161078757610821903690600401611ad5565b906001600160401b034216915f5b81811061084157602084604051908152f35b80610859856108536001948688611e6e565b35613187565b0161082f565b346107875760203660031901126107875760206108896004355f52600460205260405f2054151590565b6040519015158152f35b34610787576020366003190112610787576004355f52600560205260206001600160401b0360405f205416604051908152f35b346107875760203660031901126107875760206001600160401b0342166107e9816004353361298f565b34610787575f3660031901126107875760206040517fb5d556f07587ec0f08cf386545cc4362c702a001650c2058002615ee5c9d1e758152f35b34610787576040366003190112610787576001600160a01b0361094b611b29565b165f52600660205260405f206024355f5260205260206001600160401b0360405f205416604051908152f35b6101003660031901126107875760405161099081611c83565b60043580825261099f36611d43565b60208301526060366063190112610787576040516109bc81611cb9565b60643560ff81168103610787578152608435602082015260a43560408083019190915283015260c4356001600160a01b03811681036107875780606084015260e4356001600160401b03811681036107875783610a20916080610a4c960152612358565b610a286121a7565b610a3136611d43565b610a3a82611e2c565b52610a4481611e2c565b5034926125e2565b005b3461078757602036600319011261078757610a6761225a565b506004355f526004602052610a95610a8160405f206122a4565b604051918291602083526020830190611bbf565b0390f35b6020366003190112610787576004356001600160401b03811161078757610ac4903690600401611ad5565b610acd8161209c565b5f9290915f198101913491855b818110610afa57610a95610aee888861311f565b60405191829182611b53565b610b0981838598969798611c61565b96610b176020890189612107565b92909183158015610c74575b610c655789965f98959895604089019560608a019a60808b359b0135996001600160401b038b16809b1415995b83811015610bf7578f90610b738b610b6d8360051b8d018d612073565b93612225565b821015610be3578f610b858e91612088565b90610787578f908f90610bc2610bdd94610bb160019860405196610ba888611c83565b87523690611f52565b602086015236906060880201611dda565b6040840152858060a01b031660608301526080820152612a13565b01610b50565b634e487b7160e01b5f52603260045260245ffd5b509a8d9e50839a50610c33949c939291995060019850610c2d610c3c9698889f610c259060209a1496612088565b93369161213c565b90612b54565b95865190611e4d565b94018051610c4a8989611e39565b52610c558888611e39565b5051510196949592939201610ada565b63251f56a160e21b5f5260045ffd5b50610c8260408b018b612225565b9050841415610b23565b34610787575f36600319011261078757610d2b610cc87f0000000000000000000000000000000000000000000000000000000000000000613950565b610a95610cf47f00000000000000000000000000000000000000000000000000000000000000006139af565b610d3960405191610d06602084611d0b565b5f83525f368137604051958695600f60f81b875260e0602088015260e0870190611b05565b908582036040870152611b05565b904660608501523060808501525f60a085015283820360c0850152611b8c565b3461078757602036600319011261078757600435335f52600360205260405f20549081811115610dc2577f57b09af877df9068fd60a69d7b21f5576b8b38955812d6ae4ac52942f1e38fb791604091335f52600360205280835f205582519182526020820152a1005b633ab3447f60e11b5f5260045ffd5b34610787575f36600319011261078757610a956020610ebf6001610e147f00000000000000000000000000000000000000000000000000000000000000006131f9565b8184610e3f7f00000000000000000000000000000000000000000000000000000000000000006131f9565b8180610e6a7f00000000000000000000000000000000000000000000000000000000000000006131f9565b9260405199878b985191829101848a015e870190601760f91b83830152805192839101602183015e010190601760f91b84830152805192839101600283015e01015f838201520301601f198101835282611d0b565b604051918291602083526020830190611b05565b346107875760203660031901126107875760206001600160401b0342166107e981600435613187565b6020366003190112610787576004356001600160401b03811161078757610f27903690600401611ad5565b5f19810191905f90345b818310610f3a57005b610f458383866120e5565b6020810135601e1982360301811215610787578101918235926001600160401b03841161078757602001928060061b360384136107875760019382610f9f92610fa595610f988c8b149433933691611d6b565b90356127cd565b90611e4d565b920191610f31565b606036600319011261078757610a4c610fc46121a7565b610fcd36611d43565b610fd682611e2c565b52610fe081611e2c565b50349033906004356125e2565b6020366003190112610787576004356001600160401b03811161078757611018903690600401611ad5565b906110228261209c565b915f9134905f925f198101905b80851061104357610a95610aee878961311f565b90919293946110538683866120e5565b9060208201916110638382612107565b905015610c65576110a361109a8989888561109361108560019a602099612107565b93909514943393369161213c565b9035612b54565b97885190611e4d565b960180516110b1898b611e39565b526110bc888a611e39565b5051510195019392919061102f565b6020366003190112610787576004356001600160401b038111610787578060040160e060031983360301126107875760405161110681611c83565b81358152602483019283356001600160401b038111610787576111a5926111366111759260043691860101611f52565b60208201526111483660448501611dda565b604082015261116b60c460a485019461116086611b3f565b606085015201611e18565b6080820152612a13565b61118c61118061200e565b94610177369186612073565b61119585611e2c565b5261119f84611e2c565b50612088565b916111ae612b3b565b508051916111ba612b3b565b926111c4816121f3565b60208501526040516351753e3760e11b815282356004820152945f866024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa95861561077c575f9661170d575b508551156107495792859361123183612593565b9261123b816121f3565b945f935b82851061125c57602061024f818b61024660018d8d8d34926137a9565b61126e85829a9496989395979a611e39565b519760208901956001600160401b0387511680151590816116f9575b5061072657604082015115806116ec575b61070a576001600160401b0360608b01519751169660018060a01b038b511660408c015115159060808d0151926040519a6112d58c611cef565b5f8c528a3560208d01526001600160401b03421660408d015260608c01525f60808c015260a08b015260c08a015260018060a01b038a1660e08a01526101008901526101208801525f5b6020880151886113ef6004609960c0840151602060e086015195604081015190606081015161010082015115159061012060a0840151930151936040519a8b978789019d8e526001600160601b03199060601b1660408901526001600160601b03199060601b1660548801526001600160401b0360c01b9060c01b1660688701526001600160401b0360c01b9060c01b16607086015260f81b607885015260798401528051918291018484015e810163ffffffff60e01b8860e01b16838201520301601b19810184520182611d0b565b519020805f52600460205260405f205415611413575060010163ffffffff1661131f565b9197939499929b9896959a9050818452815f52600460205260405f2084518155602085015160018201556114c1600282016001600160401b0380604089015116166001600160401b0319825416178155606087015167ffffffffffffffff60401b82549160401b169067ffffffffffffffff60401b19161781556001600160401b036080880151168154906001600160401b0360801b9060801b16906001600160401b0360801b1916179055565b60a085810151600383015560c08601516004830180546001600160a01b0319166001600160a01b0392831617905560e08701516005840180546101008a01516001600160a81b0319909116929093169190911791151590921b60ff60a01b161790556101208501518051906001600160401b0382116106f6576115476006840154611e7e565b601f81116116a2575b50602090601f831160011461163757600692915f918361162c575b50508160011b915f199060031b1c1916179101555b8a8a8a606084015180611605575b50602085936115ba936115aa898560019c6105a2838099611e39565b506105b98460a089015192611e39565b525160405191825285359160a085901b8590038881169216907f8bf46bf4cfd674fa735a3d63ec1c9ad4153f033c290341f3a588b75685141b3590602090a40193919097969761123f565b91505061161e91505f52600460205260405f2054151590565b1561062d578a8a8a8f61158e565b015190505f8061156b565b90600684015f52805f20915f5b601f198516811061168a5750918391600193600695601f19811610611672575b505050811b01910155611580565b01515f1960f88460031b161c191690555f8080611664565b91926020600181928685015181550194019201611644565b9d9e9d600684015f5260205f20601f840160051c8101602085106116e5575b601f830160051c820181106116da5750509e9d9e611550565b5f81556001016116c1565b50806116c1565b5060408a0151151561129b565b90506001600160401b03421610158c61128a565b6117229196503d805f833e61076d8183611d0b565b948661121d565b34610787576020366003190112610787576001600160a01b0361174a611b29565b165f526003602052602060405f2054604051908152f35b34610787575f366003190112610787576040515f60025461178181611e7e565b808452906001811690811561180757506001146117a9575b610a9583610ebf81850382611d0b565b60025f9081527f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace939250905b8082106117ed57509091508101602001610ebf611799565b9192600181602092548385880101520191019092916117d5565b60ff191660208086019190915291151560051b84019091019150610ebf9050611799565b34610787576020366003190112610787576004356001600160401b0381116107875761185b903690600401611ad5565b906001600160401b034216915f5b81811061187b57602084604051908152f35b806118948561188d6001948688611e6e565b353361298f565b01611869565b34610787575f3660031901126107875760206040517ffeb2925a02bae3dae48d424a0437a2b6ac939aa9230ddc55a1a76f065d9880768152f35b6020366003190112610787576004356001600160401b038111610787576118ff903690600401611ad5565b5f198101915f91345b81841061191157005b61191c848385611c61565b60a0813603126107875760405161193281611c83565b8135815260208201356001600160401b03811161078757820136601f8201121561078757611967903690602081359101611d6b565b906020810191825260408301356001600160401b03811161078757830136601f820112156107875780359061199b82611d2c565b916119a96040519384611d0b565b8083526020606081850192028301019136831161078757602001905b828210611abb57505050604082018181526119f560806119e760608801611b3f565b966060860197885201611e18565b936080840194855251938451928315908115611aaf575b50610c65575f5b838110611a4c57505091519351600195611a44959094610f9f94508a8c14935085926001600160a01b0316916127cd565b930192611908565b600190611aa98651611a5e838a611e39565b51611a6a848851611e39565b51858060a01b038c5116906001600160401b038851169260405194611a8e86611c83565b85526020850152604084015260608301526080820152612358565b01611a13565b9050518314158c611a0c565b6020606091611aca3685611dda565b8152019101906119c5565b9181601f84011215610787578235916001600160401b038311610787576020808501948460051b01011161078757565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b600435906001600160a01b038216820361078757565b35906001600160a01b038216820361078757565b60206040818301928281528451809452019201905f5b818110611b765750505090565b8251845260209384019390920191600101611b69565b90602080835192838152019201905f5b818110611ba95750505090565b8251845260209384019390920191600101611b9c565b90610140610120611c5e9380518452602081015160208501526001600160401b0360408201511660408501526001600160401b0360608201511660608501526001600160401b03608082015116608085015260a081015160a085015260018060a01b0360c08201511660c085015260018060a01b0360e08201511660e08501526101008101511515610100850152015191816101208201520190611b05565b90565b9190811015610be35760051b81013590609e1981360301821215610787570190565b60a081019081106001600160401b038211176106f657604052565b604081019081106001600160401b038211176106f657604052565b606081019081106001600160401b038211176106f657604052565b60c081019081106001600160401b038211176106f657604052565b61014081019081106001600160401b038211176106f657604052565b90601f801991011681019081106001600160401b038211176106f657604052565b6001600160401b0381116106f65760051b60200190565b60409060231901126107875760405190611d5c82611c9e565b60243582526044356020830152565b929192611d7782611d2c565b93611d856040519586611d0b565b602085848152019260061b82019181831161078757925b828410611da95750505050565b6040848303126107875760206040918251611dc381611c9e565b863581528287013583820152815201930192611d9c565b919082606091031261078757604051611df281611cb9565b8092803560ff811681036107875760409182918452602081013560208501520135910152565b35906001600160401b038216820361078757565b805115610be35760200190565b8051821015610be35760209160051b010190565b91908203918211611e5a57565b634e487b7160e01b5f52601160045260245ffd5b9190811015610be35760051b0190565b90600182811c92168015611eac575b6020831014611e9857565b634e487b7160e01b5f52602260045260245ffd5b91607f1691611e8d565b5f9291815491611ec583611e7e565b8083529260018116908115611f1a5750600114611ee157505050565b5f9081526020812093945091925b838310611f00575060209250010190565b600181602092949394548385870101520191019190611eef565b915050602093945060ff929192191683830152151560051b010190565b6001600160401b0381116106f657601f01601f191660200190565b919060c0838203126107875760405190611f6b82611cd4565b8193611f7681611b3f565b8352611f8460208201611e18565b6020840152604081013580151581036107875760408401526060810135606084015260808101356001600160401b0381116107875781019082601f8301121561078757813592611fd384611f37565b90611fe16040519283611d0b565b84825260208585010111610787575f60208560a09682889701838601378301015260808501520135910152565b6040805190919061201f8382611d0b565b6001815291601f1901825f5b82811061203757505050565b60209060405161204681611cd4565b5f81525f838201525f60408201525f6060820152606060808201525f60a08201528282850101520161202b565b90359060be1981360301821215610787570190565b356001600160a01b03811681036107875790565b906120a682611d2c565b6120b36040519182611d0b565b82815280926120c4601f1991611d2c565b01905f5b8281106120d457505050565b8060606020809385010152016120c8565b9190811015610be35760051b81013590603e1981360301821215610787570190565b903590601e198136030182121561078757018035906001600160401b03821161078757602001918160051b3603831361078757565b92919061214881611d2c565b936121566040519586611d0b565b602085838152019160051b8101918383116107875781905b83821061217c575050505050565b81356001600160401b0381116107875760209161219c8784938701611f52565b81520191019061216e565b604080519091906121b88382611d0b565b6001815291601f1901825f5b8281106121d057505050565b6020906040516121df81611c9e565b5f81525f83820152828285010152016121c4565b906121fd82611d2c565b61220a6040519182611d0b565b828152809261221b601f1991611d2c565b0190602036910137565b903590601e198136030182121561078757018035906001600160401b0382116107875760200191606082023603831361078757565b6040519061226782611cef565b6060610120835f81525f60208201525f60408201525f838201525f60808201525f60a08201525f60c08201525f60e08201525f6101008201520152565b9060066101206040516122b681611cef565b612346819580548352600181015460208401526001600160401b0360028201548181166040860152818160401c16606086015260801c166080840152600381015460a084015260018060a01b0360048201541660c084015260ff600582015460018060a01b03811660e086015260a01c16151561010084015261233f6040518096819301611eb6565b0384611d0b565b0152565b5f198114611e5a5760010190565b608081016001600160401b0381511680151590816124a0575b50612491578161242a602061247b94015191604081015193606082019360018060a01b0385511692519160208251920151845f5260036020526001600160401b0360405f20928354936123c38561234a565b90555116926040519460208601967fb5d556f07587ec0f08cf386545cc4362c702a001650c2058002615ee5c9d1e75885260408701526060860152608085015260a084015260c083015260e082015260e0815261242261010082611d0b565b519020613482565b9051602083810151604080860151955181519384019290925282019490945260f89390931b6001600160f81b0319166060840152604183526001600160a01b0316612476606184611d0b565b6134a8565b1561248257565b638baa579f60e01b5f5260045ffd5b631ab7da6b60e01b5f5260045ffd5b90506001600160401b034216115f612371565b5190811515820361078757565b602081830312610787578051906001600160401b0382116107875701906080828203126107875760405191608083018381106001600160401b038211176106f6576040528051835260208101516001600160a01b038116810361078757602084015261252e604082016124b3565b60408401526060810151906001600160401b038211610787570181601f820112156107875780519061255f82611f37565b9261256d6040519485611d0b565b8284526020838301011161078757815f9260208093018386015e83010152606082015290565b9061259d82611d2c565b6125aa6040519182611d0b565b82815280926125bb601f1991611d2c565b01905f5b8281106125cb57505050565b6020906125d661225a565b828285010152016125bf565b6040516351753e3760e11b81526004810182905290915f826024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa91821561077c575f926127b1575b5081511561074957805161264a81612593565b93612654826121f3565b95426001600160401b0316935f5b84811061267d5750505050505091611c5e93916001936135aa565b6126878183611e39565b519081515f52600460205260405f209182541561062d57856001840154036107495760058301546001600160a01b03868116919081168290036127a25760a01c60ff161561070a5760028401916001600160401b03835460801c1661279357825467ffffffffffffffff60801b191660808b901b67ffffffffffffffff60801b16179092556001938792908c9061272e908690612728906122a4565b6122a4565b92611e39565b52612739848d611e39565b506020810151612749858f611e39565b527ff930a6e2523c9cc298691873087a740550b8fc85a0680830414c148ed927f61560208d60c0612780888a8060a01b0393611e39565b510151169251604051908152a401612662565b63905e710760e01b5f5260045ffd5b634ca8886760e01b5f5260045ffd5b6127c69192503d805f833e61076d8183611d0b565b905f612637565b6040516351753e3760e11b8152600481018290529195949392915f816024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa90811561077c575f91612975575b5080511561074957865161283981612593565b92612843826121f3565b945f996001600160401b0342169a5b848110612869575050505050611c5e9596506135aa565b6128738183611e39565b519081515f52600460205260405f209182541561062d57856001840154036107495760058301546001600160a01b03868116919081168290036127a25760a01c60ff161561070a5760028401916001600160401b03835460801c16612793578f600195612723612906928b96908154906001600160401b0360801b9060801b16906001600160401b0360801b1916179055565b612910858d611e39565b5261291b848c611e39565b50602081015161292b858e611e39565b527ff930a6e2523c9cc298691873087a740550b8fc85a0680830414c148ed927f61560208c60c0612962888a8060a01b0393611e39565b510151169251604051908152a401612852565b61298991503d805f833e61076d8183611d0b565b5f612826565b60018060a01b031691825f52600660205260405f2090825f52816020526001600160401b0360405f205416612a04576001600160401b0391835f5260205260405f20828216831982541617905516917f92a1f7a41a7c585a8b09e25b195e225b1d43248daca46b0faf9e0792777a22295f80a4565b63ec9d6eeb60e01b5f5260045ffd5b608081016001600160401b038151168015159081612b28575b50612491578161242a602061247b94015191604081015193606082019360018060a01b0385511692519160018060a01b03825116916001600160401b03602082015116906040810151151560608201519060a060808401516020815191012093015193885f5260036020526001600160401b0360405f2096875497612ab08961234a565b90555116966040519860208a019a7ffeb2925a02bae3dae48d424a0437a2b6ac939aa9230ddc55a1a76f065d9880768c5260408b015260608a0152608089015260a088015260c087015260e0860152610100850152610120840152610140830152610160820152610160815261242261018082611d0b565b90506001600160401b034216115f612a2c565b60405190612b4882611c9e565b60606020835f81520152565b919293909360c05260e052612b67612b3b565b50825190612b73612b3b565b61010052612b80826121f3565b61010051602001526040516351753e3760e11b815260048101829052935f856024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa94851561077c575f95613103575b508451156107495790612bee83612593565b608052612bfa836121f3565b60a0525f915b838310612c31575050505050612c259060e0519060c0519060a05190608051906137a9565b61010051526101005190565b909294919395612c418583611e39565b519260208401966001600160401b0388511680151590816130ef575b5061072657604082015115806130e2575b61070a57606085015197518551604080880151608089015191519b9193901515926001600160a01b031691906001600160401b03168a60208e612cb081611cef565b5f815201528c60406001600160401b03421691015260608d01525f60808d015260a08c015260c08b015260018060a01b038b1660e08b01526101008a01526101208901525f5b602089015189612dc66004609960c0840151602060e086015195604081015190606081015161010082015115159061012060a0840151930151936040519a8b978789019d8e526001600160601b03199060601b1660408901526001600160601b03199060601b1660548801526001600160401b0360c01b9060c01b1660688701526001600160401b0360c01b9060c01b16607086015260f81b607885015260798401528051918291018484015e810163ffffffff60e01b8860e01b16838201520301601b19810184520182611d0b565b519020805f52600460205260405f205415612dea575060010163ffffffff16612cf6565b9050989691979095949298808252805f52600460205260405f20918051835560208101516001840155612e97600284016001600160401b0380604085015116166001600160401b0319825416178155606083015167ffffffffffffffff60401b82549160401b169067ffffffffffffffff60401b19161781556001600160401b036080840151168154906001600160401b0360801b9060801b16906001600160401b0360801b1916179055565b60a081810151600385015560c08201516004850180546001600160a01b0319166001600160a01b0392831617905560e08301516005860180546101008601516001600160a81b0319909116929093169190911791151590921b60ff60a01b1617905561012081015180519093906001600160401b0381116106f6578894612f216006840154611e7e565b601f811161308a575b50602090601f831160011461301c57600692915f9183613011575b50508160011b915f199060031b1c1916179101555b606085015180612fed575b5093600194612f7685608051611e39565b52612f8384608051611e39565b5060a0810151612f958560a051611e39565b5281612fa8856020610100510151611e39565b52848060a01b039051166040519182527f8bf46bf4cfd674fa735a3d63ec1c9ad4153f033c290341f3a588b75685141b356020868060a01b038b1693a4019190612c00565b6130049193505f52600460205260405f2054151590565b1561062d5785915f612f65565b015190505f80612f45565b90600684015f52805f20915f5b601f198516811061306f5750918391600193600695601f19811610613057575b505050811b01910155612f5a565b01515f1960f88460031b161c191690555f8080613049565b8183015184558c985060019093019260209283019201613029565b90919293949550600684015f5260205f20601f840160051c8101602085106130db575b908b979695949392915b601f830160051c820181106130cd575050612f2a565b5f81558c98506001016130b7565b50806130ad565b5060408501511515612c6e565b90506001600160401b03421610155f612c5d565b6131189195503d805f833e61076d8183611d0b565b935f612bdc565b90613129906121f3565b905f8151915f5b83811061313e575050505090565b6131488183611e39565b5180515f915b81831061316057505050600101613130565b909194600180916131718885611e39565b5161317c828c611e39565b52019501919061314e565b90815f5260056020526001600160401b0360405f2054166131ea576001600160401b0390825f52600560205260405f20828216831982541617905516907f5aafceeb1c7ad58e4a84898bdee37c02c0fc46e7d24e6b60e8209449f183459f5f80a3565b6317133ca360e11b5f5260045ffd5b805f9172184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b821015613343575b806d04ee2d6d415b85acef8100000000600a921015613328575b662386f26fc10000811015613314575b6305f5e100811015613303575b6127108110156132f4575b60648110156132e6575b10156132db575b600a6021600184019361328085611f37565b9461328e6040519687611d0b565b80865261329d601f1991611f37565b013660208701378401015b5f1901916f181899199a1a9b1b9c1cb0b131b232b360811b8282061a83530480156132d657600a90916132a8565b505090565b60019091019061326e565b606460029104930192613267565b6127106004910493019261325d565b6305f5e10060089104930192613252565b662386f26fc1000060109104930192613245565b6d04ee2d6d415b85acef810000000060209104930192613235565b506040915072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b810461321b565b307f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03161480613459575b156133c1577f000000000000000000000000000000000000000000000000000000000000000090565b60405160208101907f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f82527f000000000000000000000000000000000000000000000000000000000000000060408201527f000000000000000000000000000000000000000000000000000000000000000060608201524660808201523060a082015260a0815261345360c082611d0b565b51902090565b507f00000000000000000000000000000000000000000000000000000000000000004614613398565b60429061348d613366565b906040519161190160f01b8352600283015260228201522090565b9190823b6134f757906134ba916139e6565b5060048110156134e3571591826134d057505090565b6001600160a01b03918216911614919050565b634e487b7160e01b5f52602160045260245ffd5b916020926064835f94519060405193630b135d3f60e11b855260048501526040602485015286820190604485015e01915afa630b135d3f60e11b5f5114601f3d11161690565b929160408401936040815282518095526060810194602060608260051b8401019401905f5b81811061357f57505050611c5e9394506020818403910152611b8c565b90919460208061359b600193605f19888203018c528951611bbf565b97019801910196919096613562565b9391908051946001861461378357602001516001600160a01b031690811561373957604051636723702360e11b81525f9690602081600481875afa90811561077c575f916136ff575b50905f915b8183106136a3575050509160209161362793876040518096819582946388e5b2d960e01b84526004840161353d565b03925af190811561077c575f91613669575b501561365a57613647575090565b80613650575090565b611c5e9033613c76565b63bf2f3a8b60e01b5f5260045ffd5b90506020813d60201161369b575b8161368460209383611d0b565b8101031261078757613695906124b3565b5f613639565b3d9150613677565b909197966136b18987611e39565b5180156136f45782156136e5578181116136d65780600192039801985b0191906135f8565b63044044a560e21b5f5260045ffd5b631574f9f360e01b5f5260045ffd5b5096976001906136ce565b90506020813d602011613731575b8161371a60209383611d0b565b810103126107875761372b906124b3565b5f6135f3565b3d915061370d565b50505f939192935b82811061376c5750505061375457505f90565b8061375e57505f90565b6137689033613c76565b5f90565b6137768183611e39565b516136e557600101613741565b90611c5e9550916137a261379b600194969596611e2c565b5191611e2c565b5191613a20565b9391908051946001861461393957602001516001600160a01b031690811561390757604051636723702360e11b81525f9690602081600481875afa90811561077c575f916138cd575b50905f915b81831061388f575050509160209161382693876040518096819582946348ed85bf60e11b84526004840161353d565b03925af190811561077c575f91613855575b501561384657613647575090565b63e8bee83960e01b5f5260045ffd5b90506020813d602011613887575b8161387060209383611d0b565b8101031261078757613881906124b3565b5f613838565b3d9150613863565b9091979661389d8987611e39565b5180156138c25782156136e5578181116136d65780600192039801985b0191906137f7565b5096976001906138ba565b90506020813d6020116138ff575b816138e860209383611d0b565b81010312610787576138f9906124b3565b5f6137f2565b3d91506138db565b50505f939192935b8281106139225750505061375457505f90565b61392c8183611e39565b516136e55760010161390f565b90611c5e9550916137a261379b5f94969596611e2c565b60ff81146139965760ff811690601f82116139875760405191613974604084611d0b565b6020808452838101919036833783525290565b632cd44ac360e21b5f5260045ffd5b50604051611c5e816139a8815f611eb6565b0382611d0b565b60ff81146139d35760ff811690601f82116139875760405191613974604084611d0b565b50604051611c5e816139a8816001611eb6565b8151919060418303613a1657613a0f9250602082015190606060408401519301515f1a90613bf4565b9192909190565b50505f9160029190565b6020015191949290916001600160a01b0316908115613be2579085929183613b65575b602092919015613ade57613a749160405194858094819363e49617e160e01b83528760048401526024830190611bbf565b03925af190811561077c575f91613aa4575b5015613a95575b613647575090565b63ccf3bb2760e01b5f5260045ffd5b90506020813d602011613ad6575b81613abf60209383611d0b565b8101031261078757613ad0906124b3565b5f613a86565b3d9150613ab2565b613b059160405194858094819363e60c350560e01b83528760048401526024830190611bbf565b03925af190811561077c575f91613b2b575b50613a8d5763bd8ba84d60e01b5f5260045ffd5b90506020813d602011613b5d575b81613b4660209383611d0b565b8101031261078757613b57906124b3565b5f613b17565b3d9150613b39565b9491909250604051636723702360e11b8152602081600481875afa90811561077c575f91613ba8575b50156136e5578186116136d6579085900393859290613a43565b90506020813d602011613bda575b81613bc360209383611d0b565b8101031261078757613bd4906124b3565b5f613b8e565b3d9150613bb6565b50505090916136e55761375457505f90565b91907f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08411613c6b579160209360809260ff5f9560405194855216868401526040830152606082015282805260015afa1561077c575f516001600160a01b03811615613c6157905f905f90565b505f906001905f90565b5050505f9160039190565b814710613cc5575f808093819382604051613c92602082611d0b565b526001600160a01b03165af115613ca557565b3d15613cb6576040513d5f823e3d90fd5b63d6bda27560e01b5f5260045ffd5b504763cf47918160e01b5f5260045260245260445ffdfea264697066735822122051c0ec218d50feb429d88538fde75524acac82424bb712afb00e91ab8344291164736f6c634300081b0033",
    "sourceMap": "976:28530:1:-:0;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;:::i;:::-;;;;;;;-1:-1:-1;;;976:28530:1;;;;;;;;;:::i;:::-;;;;;;;;-1:-1:-1;;;976:28530:1;;2476:1;759:14:6;;976:28530:1;783:14:6;;-1:-1:-1;807:14:6;;3501:45:74;;;:::i;:::-;3493:53;;3567:51;;;:::i;:::-;3556:62;;976:28530:1;;3642:22:74;;3628:36;;;;976:28530:1;3691:25:74;;3674:42;;;3744:13;3727:30;;976:28530:1;;4304:80:74;976:28530:1;4304:80:74;;2079:95;;;;976:28530:1;2079:95:74;;;;;;;3744:13;759:14:6;2079:95:74;;;4378:4;783:14:6;2079:95:74;;;783:14:6;4304:80:74;;;807:14:6;4304:80:74;;:::i;:::-;976:28530:1;4294:91:74;;3767:48;;4378:4;3825:27;;976:28530:1;;-1:-1:-1;;;;;976:28530:1;;;;2163:12:7;976:28530:1;2476:1;976:28530;;;;;;;;;-1:-1:-1;976:28530:1;;;;;;;;;;;-1:-1:-1;976:28530:1;;;;;;;;;;;;;-1:-1:-1;976:28530:1;;;;;;;2476:1;976:28530;;;;;;;;;;;2163:12:7;976:28530:1;;2531:31;2527:86;;2623:26;;976:28530;;;;;;;;759:14:6;976:28530:1;;;;;783:14:6;976:28530:1;;;;;807:14:6;976:28530:1;;;;;3767:48:74;976:28530:1;;;;;3727:30:74;976:28530:1;;;;;3825:27:74;976:28530:1;;;;;3628:36:74;976:28530:1;;;;;3674:42:74;976:28530:1;;;;;3493:53:74;976:28530:1;;;;;3556:62:74;976:28530:1;;;;;2623:26;976:28530;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2527:86;2585:17;;;-1:-1:-1;2585:17:1;;-1:-1:-1;2585:17:1;976:28530;;;;-1:-1:-1;976:28530:1;;;;;;;;;;2163:12:7;-1:-1:-1;976:28530:1;;-1:-1:-1;976:28530:1;;-1:-1:-1;976:28530:1;;;;;;;;;2476:1;976:28530;;;;;;;;;;;;;2163:12:7;976:28530:1;;;;;;;;;;;;;;;;;;;;;;;;;;;2476:1;976:28530;;;;;;;;;;;;;;;;2163:12:7;-1:-1:-1;976:28530:1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;976:28530:1;;2476:1;976:28530;;;;;;-1:-1:-1;976:28530:1;;;;;;;;-1:-1:-1;976:28530:1;;;;;-1:-1:-1;976:28530:1;;;;;;;;;;;;-1:-1:-1;976:28530:1;;;;;-1:-1:-1;976:28530:1;;-1:-1:-1;976:28530:1;;;;;;;-1:-1:-1;;976:28530:1;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;:::o;2893:342:69:-;;976:28530:1;;3038:4:69;3016:26;;3012:217;3038:4;;;976:28530:1;;1854:4:69;976:28530:1;;1840:18:69;1836:74;;3038:4;976:28530:1;;;;2079:95:74;3038:4:69;976:28530:1;;;;1951:36:69;3058:27;:::o;976:28530:1:-;;;;3038:4:69;976:28530:1;;;;;1951:36:69;3058:27;:::o;1836:74::-;976:28530:1;3038:4:69;976:28530:1;;;1881:18:69;;;;;;;;;;;;976:28530:1;;;;;;;;;;;;;;;;2482:1;976:28530;;;;;;1854:4:69;976:28530:1;-1:-1:-1;;976:28530:1;;;1881:18:69;;;;3012:217;-1:-1:-1;;;;;976:28530:1;;;;2482:1;976:28530;;;;;;;;;;;3012:217:69;3038:4;976:28530:1;;;;;;;;;;3012:217:69;976:28530:1;3038:4:69;976:28530:1;;;;;;;;;;;;2482:1;976:28530;;;;;;;;;;;;;;;;;;;2482:1;976:28530;1390:66:69;3176:42;:::o;976:28530:1:-;;;;-1:-1:-1;976:28530:1;;;;;;;;;;2482:1;976:28530;;;2482:1;976:28530;;2482:1;976:28530;;;;;;;;;;;;;;;;;;;;;2482:1;976:28530;1390:66:69;3176:42;:::o;976:28530:1:-;;;;;;;;;;;;;;;;;;;;;;;3038:4:69;976:28530:1;;;;;;;;;;;;;;;;;2482:1;976:28530;;;3038:4:69;2482:1:1;976:28530;;;;;;;;;;;;;;;;;;;;;;;;2482:1;976:28530;;;;;;;;;;;;;2893:342:69;;976:28530:1;;3038:4:69;3016:26;;3012:217;3038:4;;;976:28530:1;;1854:4:69;976:28530:1;;1840:18:69;1836:74;;3038:4;976:28530:1;;;;2079:95:74;3038:4:69;976:28530:1;;;;1951:36:69;3058:27;:::o;3012:217::-;-1:-1:-1;;;;;976:28530:1;;;;2476:1;976:28530;2476:1;976:28530;;;;;;;;;3012:217:69;3038:4;976:28530:1;;;;;;;;;;3012:217:69;976:28530:1;3038:4:69;976:28530:1;;;;;;;;;;;;;;;;;;;;2476:1;976:28530;;;;;;;;;;;2476:1;976:28530;1390:66:69;3176:42;:::o;976:28530:1:-;;;;-1:-1:-1;976:28530:1;;;;;;;;;;2476:1;976:28530;;;;;;;;;;;;;;;2476:1;976:28530;;;;;;;;;;;;2476:1;976:28530;1390:66:69;3176:42;:::o;976:28530:1:-;;;;;;;;;;;;;;;;;;;;;;;3038:4:69;2476:1:1;976:28530;;;;;;;;;;;;;;;;2476:1;976:28530;;;3038:4:69;976:28530:1;;;;;;;;;;;;;;;;;;;;;;;;;;;;2476:1;976:28530;;;;;;;;;",
    "linkReferences": {}
  },
  "deployedBytecode": {
    "object": "0x6101206040526004361015610012575f80fd5b5f3560e01c80630eabf660146118d457806312b11a171461189a57806313893f611461182b57806317d7de7c146117615780632d0335ab146117295780633c042715146110cb57806344adc90e14610fed5780634692626714610fad5780634cb7e9e514610efc5780634d00307014610ed357806354fd4d5014610dd157806379f7573a14610d5957806384b0196e14610c8c5780639541152514610a99578063a3112a6414610a4e578063a6d4dbc714610977578063b469318d1461092a578063b83010d3146108f0578063cf190f34146108c6578063d45c443514610893578063e30bb5631461085f578063e71ff365146107f1578063ed24911d146107cf578063f10b5cc81461078b5763f17325e71461012d575f80fd5b6020366003190112610787576004356001600160401b038111610787578060040190604060031982360301126107875761017c61016861200e565b91610177602436920185612073565b611f52565b61018582611e2c565b5261018f81611e2c565b50610198612b3b565b508051906101a4612b3b565b926101ae836121f3565b60208501526040516351753e3760e11b815281356004820152925f846024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa93841561077c575f94610758575b508351156107495761021c8195949395612593565b90610226816121f3565b925f965b82881061025857602061024f81896102466001348b8b8e6137a9565b81520151611e2c565b51604051908152f35b610269888299979498939699611e39565b519260208401976001600160401b038951168015159081610735575b506107265760408201511580610719575b61070a57606085015198518551604080880151608089015191519c9193901515926001600160a01b031691906001600160401b03168d6102d581611cef565b5f90528d8c3590602001528d426001600160401b031660408201526060015260808d015f905260a08d015260c08c01523360e08c01526101008b01526101208a01525f5b60208a01518a6103e96004609960c0840151602060e086015195604081015190606081015161010082015115159061012060a0840151930151936040519a8b978789019d8e526001600160601b03199060601b1660408901526001600160601b03199060601b1660548801526001600160401b0360c01b9060c01b1660688701526001600160401b0360c01b9060c01b16607086015260f81b607885015260798401528051918291018484015e810163ffffffff60e01b8860e01b16838201520301601b19810184520182611d0b565b519020805f52600460205260405f20541561040d575060010163ffffffff16610319565b91969795905099979198929399818452815f52600460205260405f2084518155602085015160018201556104bb600282016001600160401b0380604089015116166001600160401b0319825416178155606087015167ffffffffffffffff60401b82549160401b169067ffffffffffffffff60401b19161781556001600160401b036080880151168154906001600160401b0360801b9060801b16906001600160401b0360801b1916179055565b60a085810151600383015560c08601516004830180546001600160a01b0319166001600160a01b0392831617905560e08701516005840180546101008a01516001600160a81b0319909116929093169190911791151590921b60ff60a01b161790556101208501518051906001600160401b0382116106f6576105416006840154611e7e565b601f81116106b2575b50602090601f831160011461064757600692915f918361063c575b50508160011b915f199060031b1c1916179101555b8a88606083015180610608575b5084602085936105a8838560019b6105a2836105c199611e39565b52611e39565b508d6105b98460a089015192611e39565b520151611e39565b52838060a01b03905116906040519081528535917f8bf46bf4cfd674fa735a3d63ec1c9ad4153f033c290341f3a588b75685141b3560203393a4019695949392919061022a565b905061062091505f52600460205260405f2054151590565b1561062d578a885f610587565b63c5723b5160e01b5f5260045ffd5b015190505f80610565565b90600684015f52805f20915f5b601f198516811061069a5750918391600193600695601f19811610610682575b505050811b0191015561057a565b01515f1960f88460031b161c191690555f8080610674565b91926020600181928685015181550194019201610654565b600684015f5260205f20601f840160051c8101602085106106ef575b601f830160051c820181106106e457505061054a565b5f81556001016106ce565b50806106ce565b634e487b7160e01b5f52604160045260245ffd5b63157bd4c360e01b5f5260045ffd5b5060408501511515610296565b6308e8b93760e01b5f5260045ffd5b90506001600160401b03421610155f610285565b635f9bd90760e11b5f5260045ffd5b6107759194503d805f833e61076d8183611d0b565b8101906124c0565b925f610207565b6040513d5f823e3d90fd5b5f80fd5b34610787575f366003190112610787576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b34610787575f3660031901126107875760206107e9613366565b604051908152f35b34610787576020366003190112610787576004356001600160401b03811161078757610821903690600401611ad5565b906001600160401b034216915f5b81811061084157602084604051908152f35b80610859856108536001948688611e6e565b35613187565b0161082f565b346107875760203660031901126107875760206108896004355f52600460205260405f2054151590565b6040519015158152f35b34610787576020366003190112610787576004355f52600560205260206001600160401b0360405f205416604051908152f35b346107875760203660031901126107875760206001600160401b0342166107e9816004353361298f565b34610787575f3660031901126107875760206040517fb5d556f07587ec0f08cf386545cc4362c702a001650c2058002615ee5c9d1e758152f35b34610787576040366003190112610787576001600160a01b0361094b611b29565b165f52600660205260405f206024355f5260205260206001600160401b0360405f205416604051908152f35b6101003660031901126107875760405161099081611c83565b60043580825261099f36611d43565b60208301526060366063190112610787576040516109bc81611cb9565b60643560ff81168103610787578152608435602082015260a43560408083019190915283015260c4356001600160a01b03811681036107875780606084015260e4356001600160401b03811681036107875783610a20916080610a4c960152612358565b610a286121a7565b610a3136611d43565b610a3a82611e2c565b52610a4481611e2c565b5034926125e2565b005b3461078757602036600319011261078757610a6761225a565b506004355f526004602052610a95610a8160405f206122a4565b604051918291602083526020830190611bbf565b0390f35b6020366003190112610787576004356001600160401b03811161078757610ac4903690600401611ad5565b610acd8161209c565b5f9290915f198101913491855b818110610afa57610a95610aee888861311f565b60405191829182611b53565b610b0981838598969798611c61565b96610b176020890189612107565b92909183158015610c74575b610c655789965f98959895604089019560608a019a60808b359b0135996001600160401b038b16809b1415995b83811015610bf7578f90610b738b610b6d8360051b8d018d612073565b93612225565b821015610be3578f610b858e91612088565b90610787578f908f90610bc2610bdd94610bb160019860405196610ba888611c83565b87523690611f52565b602086015236906060880201611dda565b6040840152858060a01b031660608301526080820152612a13565b01610b50565b634e487b7160e01b5f52603260045260245ffd5b509a8d9e50839a50610c33949c939291995060019850610c2d610c3c9698889f610c259060209a1496612088565b93369161213c565b90612b54565b95865190611e4d565b94018051610c4a8989611e39565b52610c558888611e39565b5051510196949592939201610ada565b63251f56a160e21b5f5260045ffd5b50610c8260408b018b612225565b9050841415610b23565b34610787575f36600319011261078757610d2b610cc87f0000000000000000000000000000000000000000000000000000000000000000613950565b610a95610cf47f00000000000000000000000000000000000000000000000000000000000000006139af565b610d3960405191610d06602084611d0b565b5f83525f368137604051958695600f60f81b875260e0602088015260e0870190611b05565b908582036040870152611b05565b904660608501523060808501525f60a085015283820360c0850152611b8c565b3461078757602036600319011261078757600435335f52600360205260405f20549081811115610dc2577f57b09af877df9068fd60a69d7b21f5576b8b38955812d6ae4ac52942f1e38fb791604091335f52600360205280835f205582519182526020820152a1005b633ab3447f60e11b5f5260045ffd5b34610787575f36600319011261078757610a956020610ebf6001610e147f00000000000000000000000000000000000000000000000000000000000000006131f9565b8184610e3f7f00000000000000000000000000000000000000000000000000000000000000006131f9565b8180610e6a7f00000000000000000000000000000000000000000000000000000000000000006131f9565b9260405199878b985191829101848a015e870190601760f91b83830152805192839101602183015e010190601760f91b84830152805192839101600283015e01015f838201520301601f198101835282611d0b565b604051918291602083526020830190611b05565b346107875760203660031901126107875760206001600160401b0342166107e981600435613187565b6020366003190112610787576004356001600160401b03811161078757610f27903690600401611ad5565b5f19810191905f90345b818310610f3a57005b610f458383866120e5565b6020810135601e1982360301811215610787578101918235926001600160401b03841161078757602001928060061b360384136107875760019382610f9f92610fa595610f988c8b149433933691611d6b565b90356127cd565b90611e4d565b920191610f31565b606036600319011261078757610a4c610fc46121a7565b610fcd36611d43565b610fd682611e2c565b52610fe081611e2c565b50349033906004356125e2565b6020366003190112610787576004356001600160401b03811161078757611018903690600401611ad5565b906110228261209c565b915f9134905f925f198101905b80851061104357610a95610aee878961311f565b90919293946110538683866120e5565b9060208201916110638382612107565b905015610c65576110a361109a8989888561109361108560019a602099612107565b93909514943393369161213c565b9035612b54565b97885190611e4d565b960180516110b1898b611e39565b526110bc888a611e39565b5051510195019392919061102f565b6020366003190112610787576004356001600160401b038111610787578060040160e060031983360301126107875760405161110681611c83565b81358152602483019283356001600160401b038111610787576111a5926111366111759260043691860101611f52565b60208201526111483660448501611dda565b604082015261116b60c460a485019461116086611b3f565b606085015201611e18565b6080820152612a13565b61118c61118061200e565b94610177369186612073565b61119585611e2c565b5261119f84611e2c565b50612088565b916111ae612b3b565b508051916111ba612b3b565b926111c4816121f3565b60208501526040516351753e3760e11b815282356004820152945f866024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa95861561077c575f9661170d575b508551156107495792859361123183612593565b9261123b816121f3565b945f935b82851061125c57602061024f818b61024660018d8d8d34926137a9565b61126e85829a9496989395979a611e39565b519760208901956001600160401b0387511680151590816116f9575b5061072657604082015115806116ec575b61070a576001600160401b0360608b01519751169660018060a01b038b511660408c015115159060808d0151926040519a6112d58c611cef565b5f8c528a3560208d01526001600160401b03421660408d015260608c01525f60808c015260a08b015260c08a015260018060a01b038a1660e08a01526101008901526101208801525f5b6020880151886113ef6004609960c0840151602060e086015195604081015190606081015161010082015115159061012060a0840151930151936040519a8b978789019d8e526001600160601b03199060601b1660408901526001600160601b03199060601b1660548801526001600160401b0360c01b9060c01b1660688701526001600160401b0360c01b9060c01b16607086015260f81b607885015260798401528051918291018484015e810163ffffffff60e01b8860e01b16838201520301601b19810184520182611d0b565b519020805f52600460205260405f205415611413575060010163ffffffff1661131f565b9197939499929b9896959a9050818452815f52600460205260405f2084518155602085015160018201556114c1600282016001600160401b0380604089015116166001600160401b0319825416178155606087015167ffffffffffffffff60401b82549160401b169067ffffffffffffffff60401b19161781556001600160401b036080880151168154906001600160401b0360801b9060801b16906001600160401b0360801b1916179055565b60a085810151600383015560c08601516004830180546001600160a01b0319166001600160a01b0392831617905560e08701516005840180546101008a01516001600160a81b0319909116929093169190911791151590921b60ff60a01b161790556101208501518051906001600160401b0382116106f6576115476006840154611e7e565b601f81116116a2575b50602090601f831160011461163757600692915f918361162c575b50508160011b915f199060031b1c1916179101555b8a8a8a606084015180611605575b50602085936115ba936115aa898560019c6105a2838099611e39565b506105b98460a089015192611e39565b525160405191825285359160a085901b8590038881169216907f8bf46bf4cfd674fa735a3d63ec1c9ad4153f033c290341f3a588b75685141b3590602090a40193919097969761123f565b91505061161e91505f52600460205260405f2054151590565b1561062d578a8a8a8f61158e565b015190505f8061156b565b90600684015f52805f20915f5b601f198516811061168a5750918391600193600695601f19811610611672575b505050811b01910155611580565b01515f1960f88460031b161c191690555f8080611664565b91926020600181928685015181550194019201611644565b9d9e9d600684015f5260205f20601f840160051c8101602085106116e5575b601f830160051c820181106116da5750509e9d9e611550565b5f81556001016116c1565b50806116c1565b5060408a0151151561129b565b90506001600160401b03421610158c61128a565b6117229196503d805f833e61076d8183611d0b565b948661121d565b34610787576020366003190112610787576001600160a01b0361174a611b29565b165f526003602052602060405f2054604051908152f35b34610787575f366003190112610787576040515f60025461178181611e7e565b808452906001811690811561180757506001146117a9575b610a9583610ebf81850382611d0b565b60025f9081527f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace939250905b8082106117ed57509091508101602001610ebf611799565b9192600181602092548385880101520191019092916117d5565b60ff191660208086019190915291151560051b84019091019150610ebf9050611799565b34610787576020366003190112610787576004356001600160401b0381116107875761185b903690600401611ad5565b906001600160401b034216915f5b81811061187b57602084604051908152f35b806118948561188d6001948688611e6e565b353361298f565b01611869565b34610787575f3660031901126107875760206040517ffeb2925a02bae3dae48d424a0437a2b6ac939aa9230ddc55a1a76f065d9880768152f35b6020366003190112610787576004356001600160401b038111610787576118ff903690600401611ad5565b5f198101915f91345b81841061191157005b61191c848385611c61565b60a0813603126107875760405161193281611c83565b8135815260208201356001600160401b03811161078757820136601f8201121561078757611967903690602081359101611d6b565b906020810191825260408301356001600160401b03811161078757830136601f820112156107875780359061199b82611d2c565b916119a96040519384611d0b565b8083526020606081850192028301019136831161078757602001905b828210611abb57505050604082018181526119f560806119e760608801611b3f565b966060860197885201611e18565b936080840194855251938451928315908115611aaf575b50610c65575f5b838110611a4c57505091519351600195611a44959094610f9f94508a8c14935085926001600160a01b0316916127cd565b930192611908565b600190611aa98651611a5e838a611e39565b51611a6a848851611e39565b51858060a01b038c5116906001600160401b038851169260405194611a8e86611c83565b85526020850152604084015260608301526080820152612358565b01611a13565b9050518314158c611a0c565b6020606091611aca3685611dda565b8152019101906119c5565b9181601f84011215610787578235916001600160401b038311610787576020808501948460051b01011161078757565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b600435906001600160a01b038216820361078757565b35906001600160a01b038216820361078757565b60206040818301928281528451809452019201905f5b818110611b765750505090565b8251845260209384019390920191600101611b69565b90602080835192838152019201905f5b818110611ba95750505090565b8251845260209384019390920191600101611b9c565b90610140610120611c5e9380518452602081015160208501526001600160401b0360408201511660408501526001600160401b0360608201511660608501526001600160401b03608082015116608085015260a081015160a085015260018060a01b0360c08201511660c085015260018060a01b0360e08201511660e08501526101008101511515610100850152015191816101208201520190611b05565b90565b9190811015610be35760051b81013590609e1981360301821215610787570190565b60a081019081106001600160401b038211176106f657604052565b604081019081106001600160401b038211176106f657604052565b606081019081106001600160401b038211176106f657604052565b60c081019081106001600160401b038211176106f657604052565b61014081019081106001600160401b038211176106f657604052565b90601f801991011681019081106001600160401b038211176106f657604052565b6001600160401b0381116106f65760051b60200190565b60409060231901126107875760405190611d5c82611c9e565b60243582526044356020830152565b929192611d7782611d2c565b93611d856040519586611d0b565b602085848152019260061b82019181831161078757925b828410611da95750505050565b6040848303126107875760206040918251611dc381611c9e565b863581528287013583820152815201930192611d9c565b919082606091031261078757604051611df281611cb9565b8092803560ff811681036107875760409182918452602081013560208501520135910152565b35906001600160401b038216820361078757565b805115610be35760200190565b8051821015610be35760209160051b010190565b91908203918211611e5a57565b634e487b7160e01b5f52601160045260245ffd5b9190811015610be35760051b0190565b90600182811c92168015611eac575b6020831014611e9857565b634e487b7160e01b5f52602260045260245ffd5b91607f1691611e8d565b5f9291815491611ec583611e7e565b8083529260018116908115611f1a5750600114611ee157505050565b5f9081526020812093945091925b838310611f00575060209250010190565b600181602092949394548385870101520191019190611eef565b915050602093945060ff929192191683830152151560051b010190565b6001600160401b0381116106f657601f01601f191660200190565b919060c0838203126107875760405190611f6b82611cd4565b8193611f7681611b3f565b8352611f8460208201611e18565b6020840152604081013580151581036107875760408401526060810135606084015260808101356001600160401b0381116107875781019082601f8301121561078757813592611fd384611f37565b90611fe16040519283611d0b565b84825260208585010111610787575f60208560a09682889701838601378301015260808501520135910152565b6040805190919061201f8382611d0b565b6001815291601f1901825f5b82811061203757505050565b60209060405161204681611cd4565b5f81525f838201525f60408201525f6060820152606060808201525f60a08201528282850101520161202b565b90359060be1981360301821215610787570190565b356001600160a01b03811681036107875790565b906120a682611d2c565b6120b36040519182611d0b565b82815280926120c4601f1991611d2c565b01905f5b8281106120d457505050565b8060606020809385010152016120c8565b9190811015610be35760051b81013590603e1981360301821215610787570190565b903590601e198136030182121561078757018035906001600160401b03821161078757602001918160051b3603831361078757565b92919061214881611d2c565b936121566040519586611d0b565b602085838152019160051b8101918383116107875781905b83821061217c575050505050565b81356001600160401b0381116107875760209161219c8784938701611f52565b81520191019061216e565b604080519091906121b88382611d0b565b6001815291601f1901825f5b8281106121d057505050565b6020906040516121df81611c9e565b5f81525f83820152828285010152016121c4565b906121fd82611d2c565b61220a6040519182611d0b565b828152809261221b601f1991611d2c565b0190602036910137565b903590601e198136030182121561078757018035906001600160401b0382116107875760200191606082023603831361078757565b6040519061226782611cef565b6060610120835f81525f60208201525f60408201525f838201525f60808201525f60a08201525f60c08201525f60e08201525f6101008201520152565b9060066101206040516122b681611cef565b612346819580548352600181015460208401526001600160401b0360028201548181166040860152818160401c16606086015260801c166080840152600381015460a084015260018060a01b0360048201541660c084015260ff600582015460018060a01b03811660e086015260a01c16151561010084015261233f6040518096819301611eb6565b0384611d0b565b0152565b5f198114611e5a5760010190565b608081016001600160401b0381511680151590816124a0575b50612491578161242a602061247b94015191604081015193606082019360018060a01b0385511692519160208251920151845f5260036020526001600160401b0360405f20928354936123c38561234a565b90555116926040519460208601967fb5d556f07587ec0f08cf386545cc4362c702a001650c2058002615ee5c9d1e75885260408701526060860152608085015260a084015260c083015260e082015260e0815261242261010082611d0b565b519020613482565b9051602083810151604080860151955181519384019290925282019490945260f89390931b6001600160f81b0319166060840152604183526001600160a01b0316612476606184611d0b565b6134a8565b1561248257565b638baa579f60e01b5f5260045ffd5b631ab7da6b60e01b5f5260045ffd5b90506001600160401b034216115f612371565b5190811515820361078757565b602081830312610787578051906001600160401b0382116107875701906080828203126107875760405191608083018381106001600160401b038211176106f6576040528051835260208101516001600160a01b038116810361078757602084015261252e604082016124b3565b60408401526060810151906001600160401b038211610787570181601f820112156107875780519061255f82611f37565b9261256d6040519485611d0b565b8284526020838301011161078757815f9260208093018386015e83010152606082015290565b9061259d82611d2c565b6125aa6040519182611d0b565b82815280926125bb601f1991611d2c565b01905f5b8281106125cb57505050565b6020906125d661225a565b828285010152016125bf565b6040516351753e3760e11b81526004810182905290915f826024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa91821561077c575f926127b1575b5081511561074957805161264a81612593565b93612654826121f3565b95426001600160401b0316935f5b84811061267d5750505050505091611c5e93916001936135aa565b6126878183611e39565b519081515f52600460205260405f209182541561062d57856001840154036107495760058301546001600160a01b03868116919081168290036127a25760a01c60ff161561070a5760028401916001600160401b03835460801c1661279357825467ffffffffffffffff60801b191660808b901b67ffffffffffffffff60801b16179092556001938792908c9061272e908690612728906122a4565b6122a4565b92611e39565b52612739848d611e39565b506020810151612749858f611e39565b527ff930a6e2523c9cc298691873087a740550b8fc85a0680830414c148ed927f61560208d60c0612780888a8060a01b0393611e39565b510151169251604051908152a401612662565b63905e710760e01b5f5260045ffd5b634ca8886760e01b5f5260045ffd5b6127c69192503d805f833e61076d8183611d0b565b905f612637565b6040516351753e3760e11b8152600481018290529195949392915f816024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa90811561077c575f91612975575b5080511561074957865161283981612593565b92612843826121f3565b945f996001600160401b0342169a5b848110612869575050505050611c5e9596506135aa565b6128738183611e39565b519081515f52600460205260405f209182541561062d57856001840154036107495760058301546001600160a01b03868116919081168290036127a25760a01c60ff161561070a5760028401916001600160401b03835460801c16612793578f600195612723612906928b96908154906001600160401b0360801b9060801b16906001600160401b0360801b1916179055565b612910858d611e39565b5261291b848c611e39565b50602081015161292b858e611e39565b527ff930a6e2523c9cc298691873087a740550b8fc85a0680830414c148ed927f61560208c60c0612962888a8060a01b0393611e39565b510151169251604051908152a401612852565b61298991503d805f833e61076d8183611d0b565b5f612826565b60018060a01b031691825f52600660205260405f2090825f52816020526001600160401b0360405f205416612a04576001600160401b0391835f5260205260405f20828216831982541617905516917f92a1f7a41a7c585a8b09e25b195e225b1d43248daca46b0faf9e0792777a22295f80a4565b63ec9d6eeb60e01b5f5260045ffd5b608081016001600160401b038151168015159081612b28575b50612491578161242a602061247b94015191604081015193606082019360018060a01b0385511692519160018060a01b03825116916001600160401b03602082015116906040810151151560608201519060a060808401516020815191012093015193885f5260036020526001600160401b0360405f2096875497612ab08961234a565b90555116966040519860208a019a7ffeb2925a02bae3dae48d424a0437a2b6ac939aa9230ddc55a1a76f065d9880768c5260408b015260608a0152608089015260a088015260c087015260e0860152610100850152610120840152610140830152610160820152610160815261242261018082611d0b565b90506001600160401b034216115f612a2c565b60405190612b4882611c9e565b60606020835f81520152565b919293909360c05260e052612b67612b3b565b50825190612b73612b3b565b61010052612b80826121f3565b61010051602001526040516351753e3760e11b815260048101829052935f856024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa94851561077c575f95613103575b508451156107495790612bee83612593565b608052612bfa836121f3565b60a0525f915b838310612c31575050505050612c259060e0519060c0519060a05190608051906137a9565b61010051526101005190565b909294919395612c418583611e39565b519260208401966001600160401b0388511680151590816130ef575b5061072657604082015115806130e2575b61070a57606085015197518551604080880151608089015191519b9193901515926001600160a01b031691906001600160401b03168a60208e612cb081611cef565b5f815201528c60406001600160401b03421691015260608d01525f60808d015260a08c015260c08b015260018060a01b038b1660e08b01526101008a01526101208901525f5b602089015189612dc66004609960c0840151602060e086015195604081015190606081015161010082015115159061012060a0840151930151936040519a8b978789019d8e526001600160601b03199060601b1660408901526001600160601b03199060601b1660548801526001600160401b0360c01b9060c01b1660688701526001600160401b0360c01b9060c01b16607086015260f81b607885015260798401528051918291018484015e810163ffffffff60e01b8860e01b16838201520301601b19810184520182611d0b565b519020805f52600460205260405f205415612dea575060010163ffffffff16612cf6565b9050989691979095949298808252805f52600460205260405f20918051835560208101516001840155612e97600284016001600160401b0380604085015116166001600160401b0319825416178155606083015167ffffffffffffffff60401b82549160401b169067ffffffffffffffff60401b19161781556001600160401b036080840151168154906001600160401b0360801b9060801b16906001600160401b0360801b1916179055565b60a081810151600385015560c08201516004850180546001600160a01b0319166001600160a01b0392831617905560e08301516005860180546101008601516001600160a81b0319909116929093169190911791151590921b60ff60a01b1617905561012081015180519093906001600160401b0381116106f6578894612f216006840154611e7e565b601f811161308a575b50602090601f831160011461301c57600692915f9183613011575b50508160011b915f199060031b1c1916179101555b606085015180612fed575b5093600194612f7685608051611e39565b52612f8384608051611e39565b5060a0810151612f958560a051611e39565b5281612fa8856020610100510151611e39565b52848060a01b039051166040519182527f8bf46bf4cfd674fa735a3d63ec1c9ad4153f033c290341f3a588b75685141b356020868060a01b038b1693a4019190612c00565b6130049193505f52600460205260405f2054151590565b1561062d5785915f612f65565b015190505f80612f45565b90600684015f52805f20915f5b601f198516811061306f5750918391600193600695601f19811610613057575b505050811b01910155612f5a565b01515f1960f88460031b161c191690555f8080613049565b8183015184558c985060019093019260209283019201613029565b90919293949550600684015f5260205f20601f840160051c8101602085106130db575b908b979695949392915b601f830160051c820181106130cd575050612f2a565b5f81558c98506001016130b7565b50806130ad565b5060408501511515612c6e565b90506001600160401b03421610155f612c5d565b6131189195503d805f833e61076d8183611d0b565b935f612bdc565b90613129906121f3565b905f8151915f5b83811061313e575050505090565b6131488183611e39565b5180515f915b81831061316057505050600101613130565b909194600180916131718885611e39565b5161317c828c611e39565b52019501919061314e565b90815f5260056020526001600160401b0360405f2054166131ea576001600160401b0390825f52600560205260405f20828216831982541617905516907f5aafceeb1c7ad58e4a84898bdee37c02c0fc46e7d24e6b60e8209449f183459f5f80a3565b6317133ca360e11b5f5260045ffd5b805f9172184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b821015613343575b806d04ee2d6d415b85acef8100000000600a921015613328575b662386f26fc10000811015613314575b6305f5e100811015613303575b6127108110156132f4575b60648110156132e6575b10156132db575b600a6021600184019361328085611f37565b9461328e6040519687611d0b565b80865261329d601f1991611f37565b013660208701378401015b5f1901916f181899199a1a9b1b9c1cb0b131b232b360811b8282061a83530480156132d657600a90916132a8565b505090565b60019091019061326e565b606460029104930192613267565b6127106004910493019261325d565b6305f5e10060089104930192613252565b662386f26fc1000060109104930192613245565b6d04ee2d6d415b85acef810000000060209104930192613235565b506040915072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b810461321b565b307f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03161480613459575b156133c1577f000000000000000000000000000000000000000000000000000000000000000090565b60405160208101907f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f82527f000000000000000000000000000000000000000000000000000000000000000060408201527f000000000000000000000000000000000000000000000000000000000000000060608201524660808201523060a082015260a0815261345360c082611d0b565b51902090565b507f00000000000000000000000000000000000000000000000000000000000000004614613398565b60429061348d613366565b906040519161190160f01b8352600283015260228201522090565b9190823b6134f757906134ba916139e6565b5060048110156134e3571591826134d057505090565b6001600160a01b03918216911614919050565b634e487b7160e01b5f52602160045260245ffd5b916020926064835f94519060405193630b135d3f60e11b855260048501526040602485015286820190604485015e01915afa630b135d3f60e11b5f5114601f3d11161690565b929160408401936040815282518095526060810194602060608260051b8401019401905f5b81811061357f57505050611c5e9394506020818403910152611b8c565b90919460208061359b600193605f19888203018c528951611bbf565b97019801910196919096613562565b9391908051946001861461378357602001516001600160a01b031690811561373957604051636723702360e11b81525f9690602081600481875afa90811561077c575f916136ff575b50905f915b8183106136a3575050509160209161362793876040518096819582946388e5b2d960e01b84526004840161353d565b03925af190811561077c575f91613669575b501561365a57613647575090565b80613650575090565b611c5e9033613c76565b63bf2f3a8b60e01b5f5260045ffd5b90506020813d60201161369b575b8161368460209383611d0b565b8101031261078757613695906124b3565b5f613639565b3d9150613677565b909197966136b18987611e39565b5180156136f45782156136e5578181116136d65780600192039801985b0191906135f8565b63044044a560e21b5f5260045ffd5b631574f9f360e01b5f5260045ffd5b5096976001906136ce565b90506020813d602011613731575b8161371a60209383611d0b565b810103126107875761372b906124b3565b5f6135f3565b3d915061370d565b50505f939192935b82811061376c5750505061375457505f90565b8061375e57505f90565b6137689033613c76565b5f90565b6137768183611e39565b516136e557600101613741565b90611c5e9550916137a261379b600194969596611e2c565b5191611e2c565b5191613a20565b9391908051946001861461393957602001516001600160a01b031690811561390757604051636723702360e11b81525f9690602081600481875afa90811561077c575f916138cd575b50905f915b81831061388f575050509160209161382693876040518096819582946348ed85bf60e11b84526004840161353d565b03925af190811561077c575f91613855575b501561384657613647575090565b63e8bee83960e01b5f5260045ffd5b90506020813d602011613887575b8161387060209383611d0b565b8101031261078757613881906124b3565b5f613838565b3d9150613863565b9091979661389d8987611e39565b5180156138c25782156136e5578181116136d65780600192039801985b0191906137f7565b5096976001906138ba565b90506020813d6020116138ff575b816138e860209383611d0b565b81010312610787576138f9906124b3565b5f6137f2565b3d91506138db565b50505f939192935b8281106139225750505061375457505f90565b61392c8183611e39565b516136e55760010161390f565b90611c5e9550916137a261379b5f94969596611e2c565b60ff81146139965760ff811690601f82116139875760405191613974604084611d0b565b6020808452838101919036833783525290565b632cd44ac360e21b5f5260045ffd5b50604051611c5e816139a8815f611eb6565b0382611d0b565b60ff81146139d35760ff811690601f82116139875760405191613974604084611d0b565b50604051611c5e816139a8816001611eb6565b8151919060418303613a1657613a0f9250602082015190606060408401519301515f1a90613bf4565b9192909190565b50505f9160029190565b6020015191949290916001600160a01b0316908115613be2579085929183613b65575b602092919015613ade57613a749160405194858094819363e49617e160e01b83528760048401526024830190611bbf565b03925af190811561077c575f91613aa4575b5015613a95575b613647575090565b63ccf3bb2760e01b5f5260045ffd5b90506020813d602011613ad6575b81613abf60209383611d0b565b8101031261078757613ad0906124b3565b5f613a86565b3d9150613ab2565b613b059160405194858094819363e60c350560e01b83528760048401526024830190611bbf565b03925af190811561077c575f91613b2b575b50613a8d5763bd8ba84d60e01b5f5260045ffd5b90506020813d602011613b5d575b81613b4660209383611d0b565b8101031261078757613b57906124b3565b5f613b17565b3d9150613b39565b9491909250604051636723702360e11b8152602081600481875afa90811561077c575f91613ba8575b50156136e5578186116136d6579085900393859290613a43565b90506020813d602011613bda575b81613bc360209383611d0b565b8101031261078757613bd4906124b3565b5f613b8e565b3d9150613bb6565b50505090916136e55761375457505f90565b91907f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08411613c6b579160209360809260ff5f9560405194855216868401526040830152606082015282805260015afa1561077c575f516001600160a01b03811615613c6157905f905f90565b505f906001905f90565b5050505f9160039190565b814710613cc5575f808093819382604051613c92602082611d0b565b526001600160a01b03165af115613ca557565b3d15613cb6576040513d5f823e3d90fd5b63d6bda27560e01b5f5260045ffd5b504763cf47918160e01b5f5260045260245260445ffdfea264697066735822122051c0ec218d50feb429d88538fde75524acac82424bb712afb00e91ab8344291164736f6c634300081b0033",
    "sourceMap": "976:28530:1:-:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;976:28530:1;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;;;;;2963:31;;:::i;:::-;976:28530;3014:12;;976:28530;3014:12;;;;:::i;:::-;976:28530;:::i;:::-;3004:22;;;:::i;:::-;;;;;:::i;:::-;;976:28530;;:::i;:::-;;;;;;;:::i;:::-;16162:21;;;;:::i;:::-;976:28530;16151:8;;:32;976:28530;;-1:-1:-1;;;16309:36:1;;976:28530;;;16309:36;;976:28530;;-1:-1:-1;976:28530:1;3014:12;976:28530;16309:15;-1:-1:-1;;;;;976:28530:1;16309:36;;;;;;;976:28530;16309:36;;;976:28530;;;;16359:29;16355:82;;16483:25;;;;;;;:::i;:::-;16544:21;;;;:::i;:::-;16581:13;976:28530;16576:2029;16596:10;;;;;;976:28530;3044:66;976:28530;3086:9;18631:85;2992:1;3086:9;;;;18631:85;:::i;:::-;976:28530;;16151:8;3044:63;:66;:::i;:::-;976:28530;;;;;;;16608:19;16683:7;;;;;;;;;;;:::i;:::-;;16804:22;976:28530;16804:22;;976:28530;-1:-1:-1;;;;;976:28530:1;;;16804:44;;;:81;;;;16608:19;16800:150;;;976:28530;17073:22;;976:28530;;17072:44;;;16608:19;17068:103;;17323:14;;;976:28530;;;;;;17570:17;;;976:28530;17611:12;;;;976:28530;;;17611:12;;976:28530;;;;-1:-1:-1;;;;;976:28530:1;;;-1:-1:-1;;;;;976:28530:1;;;;;:::i;:::-;;;;;;;17218:420;976:28530;17218:420;976:28530;6500:15:7;;-1:-1:-1;;;;;976:28530:1;;17218:420;;976:28530;17323:14;17218:420;976:28530;17611:12;17218:420;;976:28530;;;17218:420;;;976:28530;17218:420;;;976:28530;3074:10;976:28530;17218:420;;976:28530;17218:420;;;976:28530;17218:420;;;976:28530;;17818:247;976:28530;17218:420;;976:28530;17218:420;26697:392;976:28530;;17218:420;;;976:28530;;;17218:420;;976:28530;17218:420;976:28530;17218:420;;976:28530;17218:420;17323:14;17218:420;;976:28530;17218:420;;;976:28530;;;17218:420;;;;;976:28530;17218:420;;27029:16;976:28530;;;26697:392;;;;;;976:28530;;;-1:-1:-1;;;;;976:28530:1;;17323:14;976:28530;;;;;;-1:-1:-1;;;;;976:28530:1;;17323:14;976:28530;;;;;;-1:-1:-1;;;;;976:28530:1;;;17218:420;976:28530;;;;;;-1:-1:-1;;;;;976:28530:1;;;17218:420;976:28530;;;;;;240:1:0;;976:28530:1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;26697:392;;;;;;;;;;;:::i;:::-;976:28530;26670:433;;976:28530;;;;;;;;;;17903:25;17899:77;;-1:-1:-1;2992:1:1;976:28530;;;17818:247;;17899:77;17952:5;;;;;;;;;;;;;976:28530;;;;;;;;;;;;;;;;;17218:420;;976:28530;2992:1;976:28530;;;;;;;-1:-1:-1;;;;;17218:420:1;976:28530;17218:420;;976:28530;;;-1:-1:-1;;;;;976:28530:1;;;;;;;17323:14;17218:420;;976:28530;-1:-1:-1;;;976:28530:1;;;;;;;-1:-1:-1;;;976:28530:1;;;;;-1:-1:-1;;;;;17611:12:1;17218:420;;976:28530;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;17218:420;;;;976:28530;;;;;17218:420;;;976:28530;;;;;;-1:-1:-1;;;;;;976:28530:1;-1:-1:-1;;;;;976:28530:1;;;;;;;17218:420;;976:28530;;;;;;17218:420;;;976:28530;-1:-1:-1;;;;;;976:28530:1;;;;;;;;;;;;;;;;;-1:-1:-1;;;976:28530:1;;;;17218:420;;;976:28530;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;:::i;:::-;;;;;;17818:247;976:28530;;;;;;;;;;;;;;;;;;;;;;2992:1;976:28530;;;;;;;;;;;;;;;17323:14;;;;;976:28530;18155:27;18151:256;;976:28530;18421:29;;976:28530;18421:29;;;;;2992:1;18421:29;;;18504:17;18421:29;;:::i;:::-;;;:::i;:::-;;18476:13;18464:25;18476:13;17218:420;18476:13;;976:28530;18464:25;;:::i;:::-;976:28530;16151:8;18504;:17;:::i;:::-;976:28530;;;;;;;;;;;;;;;;;3074:10;18541:53;976:28530;3074:10;18541:53;;976:28530;16581:13;;;;;;;;;18151:256;18299:34;;;;;-1:-1:-1;976:28530:1;15013:3;976:28530;;;-1:-1:-1;976:28530:1;;15013:25;;14928:117;;18299:34;18298:35;18294:99;;18151:256;;;;;18294:99;18364:10;;;976:28530;18364:10;976:28530;;18364:10;976:28530;;;;-1:-1:-1;976:28530:1;;;;;;;;;;;;;;;;;-1:-1:-1;;976:28530:1;;;;;;26697:392;;;;2992:1;26697:392;976:28530;26697:392;;;976:28530;;;;;;;;;;;;;;;;;;;;;;240:1:0;976:28530:1;;;;;;;;;;;;;;;;;;2992:1;976:28530;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2992:1;976:28530;;;;;;;;;;;;;;;;;3014:12;976:28530;;17068:103;17143:13;;;976:28530;17143:13;976:28530;;17143:13;17072:44;17099:17;976:28530;17099:17;;976:28530;;;17072:44;;16800:150;16912:23;;;976:28530;16912:23;976:28530;;16912:23;16804:81;6500:15:7;;-1:-1:-1;;;;;6500:15:7;976:28530:1;-1:-1:-1;16852:33:1;16804:81;;;16355:82;16411:15;;;976:28530;16411:15;976:28530;;16411:15;16309:36;;;;;;;976:28530;16309:36;;;;;;:::i;:::-;;;;;:::i;:::-;;;;;;976:28530;;;;;;;;;;;;;;;;;;;-1:-1:-1;;976:28530:1;;;;;;2773:15;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;-1:-1:-1;;976:28530:1;;;;;2475:20:7;;:::i;:::-;976:28530:1;;;;;;;;;;;;-1:-1:-1;;976:28530:1;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;:::i;:::-;6500:15:7;-1:-1:-1;;;;;6500:15:7;976:28530:1;14628:13;976:28530;14643:10;;;;;;976:28530;;;;;;;;14655:19;14701:7;14710:4;14701:7;;1489:1:0;14701:7:1;;;;:::i;:::-;976:28530;14710:4;:::i;:::-;976:28530;14628:13;;976:28530;;;;;;-1:-1:-1;;976:28530:1;;;;;;;;-1:-1:-1;976:28530:1;15013:3;976:28530;;;-1:-1:-1;976:28530:1;;15013:25;;14928:117;;976:28530;;;;;;;;;;;;;;;-1:-1:-1;;976:28530:1;;;;;;;;15160:11;976:28530;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;;;-1:-1:-1;;976:28530:1;;;;;-1:-1:-1;;;;;6500:15:7;976:28530:1;14064:4;976:28530;;;14046:10;14064:4;:::i;976:28530::-;;;;;;-1:-1:-1;;976:28530:1;;;;;;;1451:66:7;976:28530:1;;;;;;;;;-1:-1:-1;;976:28530:1;;;;-1:-1:-1;;;;;976:28530:1;;:::i;:::-;;;;15321:20;976:28530;;;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;-1:-1:-1;;976:28530:1;;;;;;;;;:::i;:::-;;;;;;;;;:::i;:::-;;;;;;;-1:-1:-1;;976:28530:1;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;9575:31;976:28530;;9737:81;976:28530;;;9575:31;:::i;:::-;9655:30;;:::i;:::-;976:28530;;;:::i;:::-;9695:31;;;:::i;:::-;;;;;:::i;:::-;;9802:9;9737:81;;:::i;:::-;976:28530;;;;;;;-1:-1:-1;;976:28530:1;;;;;;:::i;:::-;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;:::i;:::-;;;;;;;-1:-1:-1;;976:28530:1;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;:::i;:::-;6363:23;;;:::i;:::-;976:28530;;6396:25;;-1:-1:-1;;976:28530:1;;;6860:9;;976:28530;6900:10;;;;;;976:28530;9106:36;;;;:::i;:::-;976:28530;;;;;;;:::i;6912:19::-;7393:25;;;;;;;;;:::i;:::-;7473:26;;976:28530;7473:26;;;;:::i;:::-;7614:15;;;;;:72;;;;6912:19;7610:133;;7877:13;;976:28530;7877:13;;;8148:32;976:28530;8148:32;;8219:30;;;;976:28530;8285:30;976:28530;;8285:30;;976:28530;;-1:-1:-1;;;;;976:28530:1;;;;;;7872:499;7908:19;7892:14;;;;;;976:28530;;8148:32;976:28530;;;;;;;;;:::i;:::-;8148:32;;:::i;:::-;976:28530;;;;;8219:30;;;;;:::i;:::-;976:28530;;;;;;;;7982:356;976:28530;;7297:1;976:28530;;;;;;;:::i;:::-;;;;;;:::i;:::-;;7982:356;;976:28530;;;8219:30;976:28530;;;;:::i;:::-;;7982:356;;976:28530;;;;;;;8219:30;7982:356;;976:28530;8285:30;7982:356;;976:28530;7982:356;:::i;:::-;976:28530;7877:13;;976:28530;;;;;;;;;;;;7892:14;;;;;;;;;8475:191;7892:14;;;;;;;7297:1;7892:14;;976:28530;8793:31;7892:14;;;;8568:30;7892:14;976:28530;7892:14;7283:15;8568:30;;:::i;:::-;976:28530;;;;:::i;:::-;8475:191;;:::i;:::-;976:28530;;;8793:31;;:::i;:::-;8906:8;;;;8891:23;;;;:::i;:::-;;;;;;:::i;:::-;-1:-1:-1;8973:8:1;976:28530;;;6885:13;;;;;976:28530;6885:13;;7610:133;12704:15;;;976:28530;7713:15;976:28530;;7713:15;7614:72;7647:32;;976:28530;7647:32;;;;:::i;:::-;7633:53;;;;;7614:72;;976:28530;;;;;;-1:-1:-1;;976:28530:1;;;;;6183:41:74;:5;:41;:::i;:::-;976:28530:1;6638:47:74;:8;:47;:::i;:::-;976:28530:1;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;5674:13:74;;976:28530:1;;;;5709:4:74;976:28530:1;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;-1:-1:-1;;976:28530:1;;;;;;3647:10:7;976:28530:1;;3639:7:7;976:28530:1;;;;;;3672:20:7;;;;;3668:72;;3796:58;3647:10;976:28530:1;3647:10:7;;976:28530:1;;3639:7:7;976:28530:1;;;;;;;;;;;;;;;;3796:58:7;976:28530:1;3668:72:7;3715:14;;;976:28530:1;3715:14:7;976:28530:1;;3715:14:7;976:28530:1;;;;;;-1:-1:-1;;976:28530:1;;;;;1055:104:6;;976:28530:1;1072:24:6;1089:6;1072:24;:::i;:::-;1120:6;;1103:24;1120:6;1103:24;:::i;:::-;1151:6;;1134:24;1151:6;1134:24;:::i;:::-;976:28530:1;;;;;;;;;;;;1055:104:6;;;976:28530:1;;;;-1:-1:-1;;;976:28530:1;;;;;;;;;;;;;;;;;-1:-1:-1;;;976:28530:1;;;;;;;;;;;;;;;;;;;;;1055:104:6;;26697:392:1;;1055:104:6;;;;;;:::i;:::-;976:28530:1;;;;;1055:104:6;976:28530:1;;1055:104:6;976:28530:1;;;;:::i;:::-;;;;;;-1:-1:-1;;976:28530:1;;;;;-1:-1:-1;;;;;6500:15:7;976:28530:1;13859:4;976:28530;;;13859:4;:::i;976:28530::-;;;-1:-1:-1;;976:28530:1;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;:::i;:::-;-1:-1:-1;;976:28530:1;;;10381:9;976:28530;;10381:9;10468:10;;;;;;976:28530;10480:19;10942:16;;;;;:::i;:::-;976:28530;11132:17;;976:28530;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;;10865:1;10851:15;;11103:81;10851:15;11085:99;10851:15;976:28530;10851:15;;;11151:10;;976:28530;;;;:::i;:::-;;;11103:81;:::i;:::-;11085:99;;:::i;:::-;10480:19;976:28530;10453:13;;;976:28530;;;-1:-1:-1;;976:28530:1;;;;9370:58;9297:30;;:::i;:::-;976:28530;;;:::i;:::-;9337:22;;;:::i;:::-;;;;;:::i;:::-;;9412:9;9400:10;;976:28530;;;9370:58;:::i;976:28530::-;;;-1:-1:-1;;976:28530:1;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;:::i;:::-;3964:23;;;;:::i;:::-;3997:25;976:28530;4461:9;;4486:13;976:28530;;;;;;4481:1287;4501:10;;;;;;976:28530;5861:36;;;;:::i;4513:19::-;5034:16;;;;;;;;;;:::i;:::-;5114:17;976:28530;5114:17;;;;;;;:::i;:::-;:29;;;5110:90;;5548:31;5246:175;5308:17;;;;976:28530;5308:17;4898:1;5308:17;976:28530;5308:17;;:::i;:::-;4884:15;;;;5343:10;;976:28530;;;;:::i;:::-;;;5246:175;:::i;:::-;976:28530;;;5548:31;;:::i;:::-;5661:8;;;;5646:23;;;;:::i;:::-;;;;;;:::i;:::-;;5728:8;976:28530;;4513:19;976:28530;4486:13;;;;;;976:28530;;;-1:-1:-1;;976:28530:1;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;3500:25;976:28530;;3290:31;976:28530;;;;;;;;:::i;:::-;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;:::i;:::-;;;;;;;:::i;:::-;;;;;3290:31;:::i;:::-;976:28530;3371:31;;:::i;:::-;976:28530;3422:21;976:28530;3422:21;;;:::i;976:28530::-;3412:31;;;:::i;:::-;;;;;:::i;:::-;;3500:25;:::i;:::-;3461:82;976:28530;;:::i;:::-;;;;;;;:::i;:::-;16162:21;;;;:::i;:::-;976:28530;16151:8;;:32;976:28530;;-1:-1:-1;;;16309:36:1;;976:28530;;;16309:36;;976:28530;;-1:-1:-1;976:28530:1;;;16309:15;-1:-1:-1;;;;;976:28530:1;16309:36;;;;;;;976:28530;16309:36;;;976:28530;;;;16359:29;16355:82;;16483:25;;;;;;:::i;:::-;16544:21;;;;:::i;:::-;16581:13;976:28530;16576:2029;16596:10;;;;;;976:28530;3461:90;3527:9;;18631:85;3400:1;3527:9;;;;18631:85;;:::i;16608:19::-;16683:7;;;;;;;;;;;;:::i;:::-;;16804:22;976:28530;16804:22;;976:28530;-1:-1:-1;;;;;976:28530:1;;;16804:44;;;:81;;;;16608:19;16800:150;;;976:28530;17073:22;;976:28530;;17072:44;;;16608:19;17068:103;;-1:-1:-1;;;;;976:28530:1;17323:14;;976:28530;;;;;;;;;;;;;;17570:17;;976:28530;;;17611:12;976:28530;17611:12;;;976:28530;;;;;;;:::i;:::-;;;;;;;17218:420;;976:28530;-1:-1:-1;;;;;6500:15:7;976:28530:1;;17218:420;;976:28530;;17218:420;;976:28530;;;17218:420;;976:28530;17218:420;;;976:28530;17218:420;;;976:28530;;;;;;;;;17218:420;;976:28530;17218:420;;;976:28530;17218:420;;;976:28530;;17818:247;976:28530;17218:420;;976:28530;17218:420;26697:392;976:28530;;17218:420;;;976:28530;;;17218:420;;976:28530;17218:420;976:28530;17218:420;;976:28530;17218:420;976:28530;17218:420;;976:28530;17218:420;;;976:28530;;;17218:420;;;;;976:28530;17218:420;;27029:16;976:28530;;;26697:392;;;;;;976:28530;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;17218:420;976:28530;;;;;;-1:-1:-1;;;;;976:28530:1;;;17218:420;976:28530;;;;;;240:1:0;;976:28530:1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;26697:392;;;;;;;;;;;:::i;:::-;976:28530;26670:433;;976:28530;;;;;;;;;;17903:25;17899:77;;-1:-1:-1;3400:1:1;976:28530;;;17818:247;;17899:77;17952:5;;;;;;;;;;;;;976:28530;;;;;;;;;;;;;;;;;17218:420;;976:28530;3400:1;976:28530;;;;;;;-1:-1:-1;;;;;17218:420:1;976:28530;17218:420;;976:28530;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;17218:420;;976:28530;-1:-1:-1;;;976:28530:1;;;;;;;-1:-1:-1;;;976:28530:1;;;;;-1:-1:-1;;;;;976:28530:1;17218:420;;976:28530;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;17218:420;;;;976:28530;;;;;17218:420;;;976:28530;;;;;;-1:-1:-1;;;;;;976:28530:1;-1:-1:-1;;;;;976:28530:1;;;;;;;17218:420;;976:28530;;;;;;17218:420;;;976:28530;-1:-1:-1;;;;;;976:28530:1;;;;;;;;;;;;;;;;;-1:-1:-1;;;976:28530:1;;;;17218:420;;;976:28530;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;:::i;:::-;;;;;;17818:247;976:28530;;;;;;;;;;;;;;;;;;;;;;3400:1;976:28530;;;;;;;;;;;;;;;17323:14;;;976:28530;17323:14;;976:28530;18155:27;18151:256;;976:28530;18421:29;976:28530;18421:29;;18504:17;18421:29;;;;3400:1;18421:29;;;;;;:::i;:::-;;18464:25;18476:13;17218:420;18476:13;;976:28530;18464:25;;:::i;18504:17::-;976:28530;;;;;;;;;;;;;;;;;;;;;;;18541:53;;976:28530;;18541:53;976:28530;16581:13;;;;;;;;18151:256;18299:34;;;;;;-1:-1:-1;976:28530:1;15013:3;976:28530;;;-1:-1:-1;976:28530:1;;15013:25;;14928:117;;18299:34;18298:35;18294:99;;18151:256;;;;;;976:28530;;;;-1:-1:-1;976:28530:1;;;;;;;;;;;;;;;;;-1:-1:-1;;976:28530:1;;;;;;26697:392;;;;3400:1;26697:392;976:28530;26697:392;;;976:28530;;;;;;;;;;;;;;;;;;;;;;240:1:0;976:28530:1;;;;;;;;;;;;;;;;;;3400:1;976:28530;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;3400:1;976:28530;;;;;;;;17072:44;17099:17;976:28530;17099:17;;976:28530;;;17072:44;;16804:81;6500:15:7;;-1:-1:-1;;;;;6500:15:7;976:28530:1;-1:-1:-1;16852:33:1;16804:81;;;16309:36;;;;;;;976:28530;16309:36;;;;;;:::i;:::-;;;;;976:28530;;;;;;-1:-1:-1;;976:28530:1;;;;-1:-1:-1;;;;;976:28530:1;;:::i;:::-;;;;2728:7:7;976:28530:1;;;;;;;;;;;;;;;;;;;-1:-1:-1;;976:28530:1;;;;;;;3381:5:7;976:28530:1;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;3381:5:7;976:28530:1;;;;;;;-1:-1:-1;976:28530:1;;;;;;;-1:-1:-1;976:28530:1;;-1:-1:-1;976:28530:1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;976:28530:1;;;;;;;;;;;;;;;;;;;;-1:-1:-1;976:28530:1;;-1:-1:-1;976:28530:1;;;;;;;;-1:-1:-1;;976:28530:1;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;:::i;:::-;6500:15:7;-1:-1:-1;;;;;6500:15:7;976:28530:1;14294:13;976:28530;14309:10;;;;;;976:28530;;;;;;;;14321:19;14384:7;14393:4;14384:7;;1489:1:0;14384:7:1;;;;:::i;:::-;976:28530;14372:10;14393:4;:::i;:::-;976:28530;14294:13;;976:28530;;;;;;-1:-1:-1;;976:28530:1;;;;;;;1124:66:7;976:28530:1;;;;;;-1:-1:-1;;976:28530:1;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;:::i;:::-;-1:-1:-1;;976:28530:1;;;;;11801:9;11897:10;;;;;;976:28530;11909:19;12387:25;;;;;:::i;:::-;976:28530;;;;;;;;;;;;:::i;:::-;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;12464:26;976:28530;;;12605:15;;;:72;;;;;976:28530;12601:133;;;976:28530;12883:14;;;;;;-1:-1:-1;;976:28530:1;;;;12294:1;;13485:208;;976:28530;;13503:190;;-1:-1:-1;12280:15:1;;;;-1:-1:-1;976:28530:1;;-1:-1:-1;;;;;976:28530:1;;13503:190;:::i;13485:208::-;11909:19;976:28530;11882:13;;;12899:19;12294:1;976:28530;12973:353;976:28530;;13094:7;;;;:::i;:::-;;13138:35;:32;;;:35;:::i;:::-;;976:28530;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;:::i;:::-;;;;12973:353;;976:28530;;12973:353;;976:28530;;12973:353;;976:28530;;12973:353;;976:28530;12973:353;:::i;:::-;976:28530;12868:13;;12605:72;976:28530;;;12624:53;;;12605:72;;;976:28530;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;976:28530:1;;;;;;;;-1:-1:-1;;976:28530:1;;;;:::o;:::-;;;;-1:-1:-1;;;;;976:28530:1;;;;;;:::o;:::-;;;-1:-1:-1;;;;;976:28530:1;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;976:28530:1;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;:::o;:::-;;;26697:392;;976:28530;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;:::o;:::-;-1:-1:-1;;;;;976:28530:1;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;:::i;:::-;9347:12;976:28530;;;;;;;;;:::o;:::-;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;-1:-1:-1;;;;;976:28530:1;;;;;;:::o;:::-;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;:::o;:::-;-1:-1:-1;976:28530:1;;;;;;;;-1:-1:-1;976:28530:1;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;-1:-1:-1;;;;;976:28530:1;;;;;;-1:-1:-1;;976:28530:1;;;;:::o;:::-;;;;;;;;;;;;;;;;:::i;:::-;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;-1:-1:-1;976:28530:1;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;:::i;:::-;3400:1;976:28530;;;-1:-1:-1;;976:28530:1;;-1:-1:-1;976:28530:1;;;;;;;;;:::o;:::-;;;;;;;;:::i;:::-;-1:-1:-1;976:28530:1;;-1:-1:-1;976:28530:1;;;;-1:-1:-1;976:28530:1;;;;-1:-1:-1;976:28530:1;;;;;;;;;-1:-1:-1;976:28530:1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;-1:-1:-1;;;;;976:28530:1;;;;;;;:::o;:::-;;;;;:::i;:::-;;;;;;;:::i;:::-;;;;;26697:392;976:28530;26697:392;;976:28530;;:::i;:::-;;;-1:-1:-1;976:28530:1;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;:::i;:::-;9325:1;976:28530;;;-1:-1:-1;;976:28530:1;;-1:-1:-1;976:28530:1;;;;;;;;;:::o;:::-;;;;;;;;:::i;:::-;-1:-1:-1;976:28530:1;;-1:-1:-1;976:28530:1;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;:::i;:::-;;;;;26697:392;976:28530;26697:392;;976:28530;;:::i;:::-;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;:::i;:::-;;;;-1:-1:-1;976:28530:1;;-1:-1:-1;976:28530:1;;;;-1:-1:-1;976:28530:1;;;;-1:-1:-1;976:28530:1;;;;-1:-1:-1;976:28530:1;;;;-1:-1:-1;976:28530:1;;;;-1:-1:-1;976:28530:1;;;;-1:-1:-1;976:28530:1;;;;-1:-1:-1;976:28530:1;;;;;;:::o;:::-;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;:::i;:::-;;;:::o;240:1:0:-;-1:-1:-1;;240:1:0;;;;;;;:::o;5278:988:7:-;5367:16;;;-1:-1:-1;;;;;976:28530:1;;;5367:38:7;;;:68;;;;5278:988;5363:123;;;5532:12;5626:367;5532:12;6021:178;5532:12;;;5583:17;;;;;5752:15;;;;976:28530:1;;;;;;;;;;;;5532:12:7;976:28530:1;;5855:10:7;;976:28530:1;;-1:-1:-1;976:28530:1;5887:7:7;5532:12;976:28530:1;-1:-1:-1;;;;;5583:17:7;-1:-1:-1;976:28530:1;;;;5887:26:7;;;;:::i;:::-;976:28530:1;;;;;5583:17:7;976:28530:1;5683:286:7;5532:12;5683:286;;976:28530:1;1451:66:7;976:28530:1;;5583:17:7;240:1:0;;976:28530:1;5752:15:7;240:1:0;;976:28530:1;5367:16:7;240:1:0;;976:28530:1;240:1:0;;;976:28530:1;240:1:0;;;976:28530:1;240:1:0;;;976:28530:1;240:1:0;5683:286:7;;;;;;:::i;:::-;976:28530:1;5656:327:7;;5626:367;:::i;:::-;976:28530:1;;5532:12:7;6147:11;;;976:28530:1;5583:17:7;6160:11;;;976:28530:1;240:1:0;;976:28530:1;;6130:55:7;;;976:28530:1;;;;240:1:0;;976:28530:1;;;;240:1:0;;;;;-1:-1:-1;;;;;;240:1:0;;;;;6130:55:7;;;-1:-1:-1;;;;;976:28530:1;6130:55:7;240:1:0;976:28530:1;6130:55:7;:::i;:::-;6021:178;:::i;:::-;6020:179;6003:257;;5278:988::o;6003:257::-;6231:18;;;-1:-1:-1;6231:18:7;;-1:-1:-1;6231:18:7;5363:123;5458:17;;;-1:-1:-1;5458:17:7;;-1:-1:-1;5458:17:7;5367:68;6500:15;;-1:-1:-1;;;;;6500:15:7;976:28530:1;-1:-1:-1;5367:68:7;;;976:28530:1;;;;;;;;;;:::o;:::-;;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;-1:-1:-1;976:28530:1;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;:::i;:::-;;;;;;;:::i;:::-;;;;;26697:392;976:28530;26697:392;;976:28530;;:::i;:::-;;;-1:-1:-1;976:28530:1;;;;;;;;;:::o;:::-;;;;;:::i;:::-;;;;;;;;;;19220:2157;976:28530;;-1:-1:-1;;;19537:36:1;;;;;976:28530;;;19220:2157;;-1:-1:-1;976:28530:1;19537:36;976:28530;19537:15;-1:-1:-1;;;;;976:28530:1;19537:36;;;;;;;-1:-1:-1;19537:36:1;;;19220:2157;976:28530;;;19587:29;19583:82;;976:28530;;19749:25;;;:::i;:::-;19810:21;;;;:::i;:::-;19847:13;6500:15:7;-1:-1:-1;;;;;976:28530:1;;-1:-1:-1;19862:10:1;;;;;;21286:84;;;;;;;;;;9325:1;21286:84;;:::i;19874:19::-;19948:7;;;;:::i;:::-;;976:28530;;;-1:-1:-1;976:28530:1;19537:36;976:28530;;;-1:-1:-1;976:28530:1;;;;20125:28;20121:84;;20295:18;9325:1;20295:18;;976:28530;20295:31;20291:92;;20476:20;;;976:28530;-1:-1:-1;;;;;976:28530:1;;;;;;;20476:31;;;20472:91;;976:28530;;;;20773:22;20769:81;;20950:26;;;976:28530;-1:-1:-1;;;;;976:28530:1;;;;;20946:93;;976:28530;;-1:-1:-1;;;;976:28530:1;;;;;-1:-1:-1;;;976:28530:1;;;;;9325:1;;21052:36;;-1:-1:-1;21052:36:1;;21103:29;;21052:36;;976:28530;;;:::i;21052:36::-;976:28530;:::i;:::-;21103:29;;:::i;:::-;;;;;;:::i;:::-;-1:-1:-1;976:28530:1;21158:13;;976:28530;21146:25;21158:13;;21146:25;:::i;:::-;976:28530;21191:67;976:28530;;21199:25;:15;976:28530;;;;;;21199:15;;:::i;:::-;;:25;976:28530;;;;;;;;;21191:67;976:28530;19847:13;;20946:93;21008:16;;;-1:-1:-1;21008:16:1;19537:36;-1:-1:-1;21008:16:1;20472:91;20534:14;;;-1:-1:-1;20534:14:1;19537:36;-1:-1:-1;20534:14:1;19537:36;;;;;;;-1:-1:-1;19537:36:1;;;;;;:::i;:::-;;;;;19220:2157;976:28530;;-1:-1:-1;;;19537:36:1;;;;;976:28530;;;19220:2157;;;;;;-1:-1:-1;976:28530:1;19537:36;976:28530;19537:15;-1:-1:-1;;;;;976:28530:1;19537:36;;;;;;;-1:-1:-1;19537:36:1;;;19220:2157;976:28530;;;19587:29;19583:82;;976:28530;;19749:25;;;:::i;:::-;19810:21;;;;:::i;:::-;19847:13;-1:-1:-1;6500:15:7;-1:-1:-1;;;;;6500:15:7;976:28530:1;19842:1427;19862:10;;;;;;21286:84;;;;;;;;;;:::i;19874:19::-;19948:7;;;;:::i;:::-;;976:28530;;;-1:-1:-1;976:28530:1;19537:36;976:28530;;;-1:-1:-1;976:28530:1;;;;20125:28;20121:84;;20295:18;1489:1:0;20295:18:1;;976:28530;20295:31;20291:92;;20476:20;;;976:28530;-1:-1:-1;;;;;976:28530:1;;;;;;;20476:31;;;20472:91;;976:28530;;;;20773:22;20769:81;;20950:26;;;976:28530;-1:-1:-1;;;;;976:28530:1;;;;;20946:93;;21052:36;1489:1:0;21052:36:1;;976:28530;21052:36;;;976:28530;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;21103:29;;;;:::i;:::-;;;;;;:::i;:::-;-1:-1:-1;976:28530:1;21158:13;;976:28530;21146:25;21158:13;;21146:25;:::i;:::-;976:28530;21191:67;976:28530;;21199:25;:15;976:28530;;;;;;21199:15;;:::i;:::-;;:25;976:28530;;;;;;;;;21191:67;976:28530;19847:13;;19537:36;;;;;;-1:-1:-1;19537:36:1;;;;;;:::i;:::-;;;;28242:368;976:28530;;;;;;;;-1:-1:-1;976:28530:1;28393:20;976:28530;;;-1:-1:-1;976:28530:1;;;-1:-1:-1;976:28530:1;;;;-1:-1:-1;;;;;976:28530:1;-1:-1:-1;976:28530:1;;;28433:84;;-1:-1:-1;;;;;976:28530:1;;-1:-1:-1;976:28530:1;;;;-1:-1:-1;976:28530:1;;;;;;;;;;;;;28567:36;;-1:-1:-1;28567:36:1;;28242:368::o;28433:84::-;28482:24;;;-1:-1:-1;28482:24:1;;-1:-1:-1;28482:24:1;3995:1151:7;4085:16;;;-1:-1:-1;;;;;976:28530:1;;;4085:38:7;;;:68;;;;3995:1151;4081:123;;;4251:12;4345:527;4251:12;4900:179;4251:12;;;4302:17;;;;;4471:16;;;;976:28530:1;;;;;;;;;;;;;;;;;;;;4581:19:7;-1:-1:-1;;;;;4251:12:7;4581:19;;976:28530:1;;4622:14:7;4302:17;4622:14;;976:28530:1;;;4471:16:7;4658:11;;976:28530:1;4701:9:7;4733:10;4085:16;4701:9;;;4251:12;976:28530:1;;;;4691:20:7;4733:10;;976:28530:1;;;-1:-1:-1;976:28530:1;4765:7:7;4251:12;976:28530:1;-1:-1:-1;;;;;4302:17:7;-1:-1:-1;976:28530:1;;;;4765:27:7;;;;:::i;:::-;976:28530:1;;;;;4302:17:7;976:28530:1;4402:446:7;4251:12;4402:446;;976:28530:1;1124:66:7;976:28530:1;;4302:17:7;976:28530:1;;;4471:16:7;976:28530:1;;;4085:16:7;976:28530:1;;;4733:10:7;976:28530:1;;;;;;;;;;;;;;;;;;;;;;;;;;;;4402:446:7;;;;;;:::i;4085:68::-;6500:15;;-1:-1:-1;;;;;6500:15:7;976:28530:1;-1:-1:-1;4085:68:7;;;976:28530:1;;;;;;;:::i;:::-;;;;-1:-1:-1;976:28530:1;;;;:::o;15846:2898::-;;;;;;;;;;976:28530;;:::i;:::-;;;;;;;:::i;:::-;16112:29;;16162:21;;;:::i;:::-;16151:8;;;;:32;976:28530;;-1:-1:-1;;;16309:36:1;;;;;976:28530;;;;-1:-1:-1;976:28530:1;16309:36;976:28530;16309:15;-1:-1:-1;;;;;976:28530:1;16309:36;;;;;;;-1:-1:-1;16309:36:1;;;15846:2898;976:28530;;;16359:29;16355:82;;16483:25;;;;:::i;:::-;;;16544:21;;;:::i;:::-;;;-1:-1:-1;16576:2029:1;16596:10;;;;;;18631:85;;;;;;;;;;;;;;;;;;;;:::i;:::-;976:28530;;;18727:10;;15846:2898;:::o;16608:19::-;16683:7;;;;;;;;;;:::i;:::-;;16804:22;16151:8;16804:22;;976:28530;-1:-1:-1;;;;;976:28530:1;;;16804:44;;;:81;;;;16608:19;16800:150;;;976:28530;17073:22;;976:28530;;17072:44;;;16608:19;17068:103;;17323:14;;;976:28530;;;;;;17570:17;;;976:28530;17611:12;;;;976:28530;;;17611:12;;976:28530;;;;-1:-1:-1;;;;;976:28530:1;;;-1:-1:-1;;;;;976:28530:1;;16151:8;976:28530;;;;:::i;:::-;-1:-1:-1;976:28530:1;;17218:420;976:28530;6500:15:7;976:28530:1;-1:-1:-1;;;;;6500:15:7;976:28530:1;17218:420;;976:28530;17323:14;17218:420;;976:28530;-1:-1:-1;17611:12:1;17218:420;;976:28530;17218:420;;;976:28530;17218:420;;;976:28530;;;;;;;;;17218:420;;976:28530;17218:420;;;976:28530;17218:420;;;976:28530;-1:-1:-1;17818:247:1;16151:8;17218:420;;976:28530;17218:420;26697:392;16309:36;976:28530;17218:420;;;976:28530;16151:8;976:28530;17218:420;;976:28530;17218:420;976:28530;17218:420;;976:28530;17218:420;17323:14;17218:420;;976:28530;17218:420;;;976:28530;;;17218:420;;;;;976:28530;17218:420;;27029:16;976:28530;;;26697:392;;;;;;976:28530;;;-1:-1:-1;;;;;976:28530:1;;17323:14;976:28530;;;;;;-1:-1:-1;;;;;976:28530:1;;17323:14;976:28530;;;;;;-1:-1:-1;;;;;976:28530:1;;;17218:420;976:28530;;;;;;-1:-1:-1;;;;;976:28530:1;;;17218:420;976:28530;;;;;;240:1:0;;976:28530:1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;26697:392;;;;;;;;;;;:::i;:::-;976:28530;26670:433;;976:28530;-1:-1:-1;976:28530:1;16309:36;16151:8;976:28530;;-1:-1:-1;976:28530:1;;17903:25;17899:77;;-1:-1:-1;1489:1:0;976:28530:1;;;17818:247;;17899:77;17952:5;;;;;;;;;;;976:28530;;;;-1:-1:-1;976:28530:1;16309:36;16151:8;976:28530;;-1:-1:-1;976:28530:1;;;;;;16151:8;17218:420;;976:28530;1489:1:0;976:28530:1;;;;;;;-1:-1:-1;;;;;17218:420:1;976:28530;17218:420;;976:28530;;;-1:-1:-1;;;;;976:28530:1;;;;;;;17323:14;17218:420;;976:28530;-1:-1:-1;;;976:28530:1;;;;;;;-1:-1:-1;;;976:28530:1;;;;;-1:-1:-1;;;;;17611:12:1;17218:420;;976:28530;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;17218:420;;;;976:28530;;;;;17218:420;;;976:28530;16309:36;976:28530;;;;-1:-1:-1;;;;;;976:28530:1;-1:-1:-1;;;;;976:28530:1;;;;;;;17218:420;;976:28530;;;;;;17218:420;;;976:28530;-1:-1:-1;;;;;;976:28530:1;;;;;;;;;;;;;;;;;-1:-1:-1;;;976:28530:1;;;;17218:420;;;976:28530;;;;;;-1:-1:-1;;;;;976:28530:1;;;;;;;;;;;;:::i;:::-;;;;;;17818:247;976:28530;16151:8;976:28530;;;;;;;;;;;-1:-1:-1;;976:28530:1;;;;;;;1489:1:0;976:28530:1;;;;;;;;;;;;;;;17323:14;;;976:28530;18155:27;18151:256;;976:28530;18421:29;;1489:1:0;18421:29:1;;;;;;:::i;:::-;;;;;;;:::i;:::-;;17218:420;18476:13;;976:28530;18464:25;;;;;:::i;:::-;976:28530;16151:8;18504:17;16151:8;;;;;18504;:17;:::i;:::-;976:28530;;;;;;;;;;;;;;18541:53;16151:8;976:28530;;;;;;;18541:53;;976:28530;16581:13;;;;18151:256;18299:34;;;;-1:-1:-1;976:28530:1;15013:3;976:28530;;;-1:-1:-1;976:28530:1;;15013:25;;14928:117;;18299:34;18298:35;18294:99;;18151:256;;;;;976:28530;;;;-1:-1:-1;976:28530:1;;;;;;;;;-1:-1:-1;976:28530:1;;-1:-1:-1;976:28530:1;;-1:-1:-1;976:28530:1;-1:-1:-1;;976:28530:1;;;;;;26697:392;;;;1489:1:0;26697:392:1;976:28530;26697:392;;;976:28530;;;;;;;;;;;;;;;;;;;;;;240:1:0;976:28530:1;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;1489:1:0;976:28530:1;;;;16151:8;976:28530;;;;;;;;;;;;;;;;;;-1:-1:-1;976:28530:1;16151:8;-1:-1:-1;976:28530:1;;;;;;;;16151:8;976:28530;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;976:28530:1;;;;-1:-1:-1;1489:1:0;976:28530:1;;;;;;;;17072:44;17099:17;976:28530;17099:17;;976:28530;;;17072:44;;16804:81;6500:15:7;;-1:-1:-1;;;;;6500:15:7;976:28530:1;-1:-1:-1;16852:33:1;16804:81;;;16309:36;;;;;;;-1:-1:-1;16309:36:1;;;;;;:::i;:::-;;;;;28803:701;;28944:23;28803:701;28944:23;:::i;:::-;28978:24;29001:1;976:28530;;29066:13;29001:1;29081:17;;;;;;29486:11;;;;28803:701;:::o;29100:19::-;29166:11;;;;:::i;:::-;;976:28530;;29001:1;29251:215;29271:21;;;;;;29100:19;;;1489:1:0;976:28530:1;29066:13;;29294:19;29354:14;;;1489:1:0;29354:14:1;;;;;;:::i;:::-;976:28530;29333:35;;;;:::i;:::-;976:28530;;29294:19;976:28530;29256:13;;;;27816:225;;976:28530;-1:-1:-1;976:28530:1;27885:11;976:28530;;-1:-1:-1;;;;;976:28530:1;-1:-1:-1;976:28530:1;;;27881:80;;-1:-1:-1;;;;;976:28530:1;;-1:-1:-1;976:28530:1;27885:11;976:28530;;;-1:-1:-1;976:28530:1;;;;;;;;;;;;;28011:23;;-1:-1:-1;28011:23:1;;27816:225::o;27881:80::-;27930:20;;;-1:-1:-1;27930:20:1;;-1:-1:-1;27930:20:1;1343:634:72;1465:17;-1:-1:-1;29298:17:79;-1:-1:-1;;;29298:17:79;;;29294:103;;1343:634:72;29414:17:79;29423:8;29994:7;29414:17;;;29410:103;;1343:634:72;29539:8:79;29530:17;;;29526:103;;1343:634:72;29655:7:79;29646:16;;;29642:100;;1343:634:72;29768:7:79;29759:16;;;29755:100;;1343:634:72;29881:7:79;29872:16;;;29868:100;;1343:634:72;29985:16:79;;29981:66;;1343:634:72;29994:7:79;1580:94:72;1485:1;976:28530:1;;1523:18:72;976:28530:1;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;26697:392;;976:28530;;:::i;:::-;;;;;;;1580:94:72;;;1687:247;-1:-1:-1;;976:28530:1;;-1:-1:-1;;;1741:111:72;;;;976:28530:1;1741:111:72;976:28530:1;1902:10:72;;1898:21;;29994:7:79;1687:247:72;;;;1898:21;1914:5;;1343:634;:::o;29981:66:79:-;30031:1;976:28530:1;;;;29981:66:79;;29868:100;29881:7;29952:1;976:28530:1;;;;29868:100:79;;;29755;29768:7;29839:1;976:28530:1;;;;29755:100:79;;;29642;29655:7;29726:1;976:28530:1;;;;29642:100:79;;;29526:103;29539:8;29612:2;976:28530:1;;;;29526:103:79;;;29410;29423:8;29496:2;976:28530:1;;;;29410:103:79;;;29294;-1:-1:-1;29380:2:79;;-1:-1:-1;;;;976:28530:1;;29294:103:79;;3945:262:74;4029:4;4038:11;-1:-1:-1;;;;;976:28530:1;4021:28:74;;:63;;3945:262;4017:184;;;4107:22;4100:29;:::o;4017:184::-;976:28530:1;;4304:80:74;;;976:28530:1;2079:95:74;976:28530:1;;4326:11:74;976:28530:1;2079:95:74;;976:28530:1;4339:14:74;2079:95;;;976:28530:1;4355:13:74;2079:95;;;976:28530:1;4029:4:74;2079:95;;;976:28530:1;2079:95:74;4304:80;;;;;;:::i;:::-;976:28530:1;4294:91:74;;4160:30;:::o;4021:63::-;4070:14;;4053:13;:31;4021:63;;5017:176;3993:249:75;5017:176:74;5153:20;;:::i;:::-;3993:249:75;;;;-1:-1:-1;;;3993:249:75;;;;;;;;;;;5017:176:74;:::o;1485:429:76:-;;;1611:18;;;;1698:33;;;;:::i;:::-;976:28530:1;;;;;;;1752:33:76;:56;;;;1745:63;;;:::o;1752:56::-;-1:-1:-1;;;;;976:28530:1;;;;;1789:19:76;;1745:63;-1:-1:-1;1745:63:76:o;976:28530:1:-;;;;;;;;;;;;1607:301:76;976:28530:1;3172:708:76;976:28530:1;3172:708:76;976:28530:1;;;;3172:708:76;;;3084:34;;;;3172:708;;;;;;;;;;;;;;;;;;;;;;;3084:34;;;976:28530:1;3172:708:76;;;;;;;1839:58;:::o;976:28530:1:-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;24099:2238;;;;976:28530;;24417:11;1489:1:0;24417:11:1;;24413:146;;24596:21;;976:28530;-1:-1:-1;;;;;976:28530:1;;24631:31;;24627:406;;976:28530;;-1:-1:-1;;;25104:20:1;;976:28530;;;24596:21;976:28530;25104:20;976:28530;25104:20;;;;;;;;976:28530;25104:20;;;24099:2238;25140:13;;976:28530;25135:777;25155:10;;;;;;976:28530;;;;24596:21;976:28530;25959:67;976:28530;;;;;;;;;;;;;25959:67;;25104:20;25959:67;;;:::i;:::-;;;;;;;;;;976:28530;25959:67;;;25135:777;25958:68;;25954:134;;26241:58;;26309:21;24099:2238;:::o;26241:58::-;27328:18;27324:350;;26309:21;24099:2238;:::o;27324:350::-;27648:14;27626:10;;27648:14;:::i;25954:134::-;26053:20;;;976:28530;26053:20;25104;976:28530;26053:20;25959:67;;;24596:21;25959:67;;24596:21;25959:67;;;;;;24596:21;25959:67;;;:::i;:::-;;;976:28530;;;;;;;:::i;:::-;25959:67;;;;;;-1:-1:-1;25959:67:1;;25167:19;25218:9;;;;;;;;:::i;:::-;976:28530;25340:10;;25336:57;;25411:18;;25407:76;;25591:22;;;25587:87;;976:28530;1489:1:0;976:28530:1;;;;25167:19;25140:13;976:28530;25140:13;;;;25587:87;25640:19;;;976:28530;25640:19;25104:20;976:28530;25640:19;25407:76;24875:12;;;976:28530;25456:12;25104:20;976:28530;25456:12;25336:57;25370:8;;;1489:1:0;25370:8:1;;;25104:20;;;24596:21;25104:20;;24596:21;25104:20;;;;;;24596:21;25104:20;;;:::i;:::-;;;976:28530;;;;;;;:::i;:::-;25104:20;;;;;;-1:-1:-1;25104:20:1;;24627:406;24760:13;;976:28530;24760:13;;;;24775:10;;;;;;24934:66;;;;;25014:8;976:28530;25014:8;:::o;24934:66::-;27328:18;27324:350;;25014:8;976:28530;25014:8;:::o;27324:350::-;27648:14;27626:10;;27648:14;:::i;:::-;976:28530;25014:8;:::o;24787:19::-;24830:9;;;;:::i;:::-;976:28530;24826:80;;1489:1:0;976:28530:1;24760:13;;24413:146;24485:15;24451:97;24485:15;;;24502:9;24485:15;1489:1:0;24485:15:1;;;;;:::i;:::-;;24502:9;;:::i;:::-;976:28530;24451:97;;:::i;24099:2238::-;;;;976:28530;;24417:11;24427:1;24417:11;;24413:146;;24596:21;;976:28530;-1:-1:-1;;;;;976:28530:1;;24631:31;;24627:406;;976:28530;;-1:-1:-1;;;25104:20:1;;-1:-1:-1;;976:28530:1;24596:21;976:28530;25104:20;976:28530;25104:20;;;;;;;;-1:-1:-1;25104:20:1;;;24099:2238;25140:13;;-1:-1:-1;25135:777:1;25155:10;;;;;;25922:309;;;;24596:21;25922:309;26109:67;25922:309;976:28530;;;;;;;;;;;;26109:67;;25104:20;26109:67;;;:::i;:::-;;;;;;;;;;25922:309;26109:67;;;25135:777;26108:68;;26104:127;;26241:58;;26309:21;24099:2238;:::o;26104:127::-;26199:21;;;25922:309;26199:21;25104:20;25922:309;26199:21;26109:67;;;24596:21;26109:67;;24596:21;26109:67;;;;;;24596:21;26109:67;;;:::i;:::-;;;976:28530;;;;;;;:::i;:::-;26109:67;;;;;;-1:-1:-1;26109:67:1;;25167:19;25218:9;;;;;;;;:::i;:::-;976:28530;25340:10;;25336:57;;25411:18;;25407:76;;25591:22;;;25587:87;;976:28530;24427:1;976:28530;;;;25167:19;25140:13;976:28530;25140:13;;;;25336:57;25370:8;;;24427:1;25370:8;;;25104:20;;;24596:21;25104:20;;24596:21;25104:20;;;;;;24596:21;25104:20;;;:::i;:::-;;;976:28530;;;;;;;:::i;:::-;25104:20;;;;;;-1:-1:-1;25104:20:1;;24627:406;24760:13;;-1:-1:-1;24760:13:1;;;;24775:10;;;;;;24934:66;;;;;25014:8;-1:-1:-1;25014:8:1;:::o;24787:19::-;24830:9;;;;:::i;:::-;976:28530;24826:80;;24427:1;976:28530;24760:13;;24413:146;24485:15;24451:97;24485:15;;;24502:9;24485:15;-1:-1:-1;24485:15:1;;;;;:::i;3376:267:69:-;1390:66;3499:46;;1390:66;;;2629:40;;2683:13;2692:4;2683:13;;2679:71;;976:28530:1;;;;;;;:::i;:::-;2313:4:69;976:28530:1;;;;;;;26697:392;976:28530;;;2328:106:69;;;3561:22;:::o;2679:71::-;2719:20;;;976:28530:1;2719:20:69;;976:28530:1;2719:20:69;3495:142;976:28530:1;;;1390:66:69;;;;976:28530:1;1390:66:69;:::i;:::-;;;;:::i;3376:267::-;1390:66;3499:46;;1390:66;;;2629:40;;2683:13;2692:4;2683:13;;2679:71;;976:28530:1;;;;;;;:::i;3495:142:69:-;976:28530:1;;;1390:66:69;;;;6668:16:74;1390:66:69;:::i;2433:778:73:-;976:28530:1;;;2433:778:73;2623:2;2603:22;;2623:2;;3055:25;2839:196;;;;;;;;;;;;;;;-1:-1:-1;2839:196:73;3055:25;;:::i;:::-;3048:32;;;;;:::o;2599:606::-;3111:83;;3127:1;3111:83;3131:35;3111:83;;:::o;21968:1538:1:-;22249:21;;976:28530;21968:1538;;;;;-1:-1:-1;;;;;976:28530:1;;22284:31;;22280:309;;22693:10;;;;;22689:449;;21968:1538;22249:21;;23148:261;;;;;976:28530;;;;;;;;;;;;;23185:44;;;;;;976:28530;;;;;;:::i;:::-;23185:44;;;;;;;;;976:28530;23185:44;;;23148:261;23184:45;;23180:110;;23148:261;23419:58;;23487:12;21968:1538;:::o;23180:110::-;23256:19;;;976:28530;23256:19;23185:44;976:28530;23256:19;23185:44;;;22249:21;23185:44;;22249:21;23185:44;;;;;;22249:21;23185:44;;;:::i;:::-;;;976:28530;;;;;;;:::i;:::-;23185:44;;;;;;-1:-1:-1;23185:44:1;;23148:261;976:28530;;;;;;;;;;;;;23311:44;;;;;;976:28530;;;;;;:::i;:::-;23311:44;;;;;;;;;976:28530;23311:44;;;23148:261;23310:45;23148:261;23306:103;23378:20;;;976:28530;23378:20;23311:44;976:28530;23378:20;23311:44;;;22249:21;23311:44;;22249:21;23311:44;;;;;;22249:21;23311:44;;;:::i;:::-;;;976:28530;;;;;;;:::i;:::-;23311:44;;;;;;-1:-1:-1;23311:44:1;;22689:449;976:28530;;;;;;;;;;22724:20;;22249:21;22724:20;;;;;;;;;;;976:28530;22724:20;;;22689:449;22723:21;;22719:79;;22906:22;;;22902:87;;976:28530;;;;;;;;22689:449;;22724:20;;;22249:21;22724:20;;22249:21;22724:20;;;;;;22249:21;22724:20;;;:::i;:::-;;;976:28530;;;;;;;:::i;:::-;22724:20;;;;;;-1:-1:-1;22724:20:1;;22280:309;22412:10;;;;;22408:68;;22490:66;;22570:8;976:28530;22570:8;:::o;7142:1551:73:-;;;8222:66;8209:79;;8205:164;;976:28530:1;;;;;;-1:-1:-1;976:28530:1;;;;;;;;;;;;;;;;;;;8480:24:73;;;;;;;;;-1:-1:-1;8480:24:73;-1:-1:-1;;;;;976:28530:1;;8518:20:73;8514:113;;8637:49;-1:-1:-1;8637:49:73;-1:-1:-1;7142:1551:73;:::o;8514:113::-;8554:62;-1:-1:-1;8554:62:73;8480:24;8554:62;-1:-1:-1;8554:62:73;:::o;8205:164::-;8304:54;;;8320:1;8304:54;8324:30;8304:54;;:::o;1339:506:59:-;1424:21;;:30;1420:125;;976:28530:1;;;;;;;;;;;;;:::i;:::-;;-1:-1:-1;;;;;976:28530:1;905:128:65;;976:28530:1;;;1668:7:59:o;1554:285::-;4536:73:65;1695:33:59;4536:73:65;;976:28530:1;;;;;;;;;1691:148:59;1809:19;;;976:28530:1;1809:19:59;;976:28530:1;1809:19:59;1420:125;1504:21;;1477:57;;;;;;976:28530:1;;;;1477:57:59;",
    "linkReferences": {},
    "immutableReferences": {
      "150": [
        {
          "start": 463,
          "length": 32
        },
        {
          "start": 1952,
          "length": 32
        },
        {
          "start": 4581,
          "length": 32
        },
        {
          "start": 9727,
          "length": 32
        },
        {
          "start": 10222,
          "length": 32
        },
        {
          "start": 11172,
          "length": 32
        }
      ],
      "2532": [
        {
          "start": 3568,
          "length": 32
        }
      ],
      "2534": [
        {
          "start": 3611,
          "length": 32
        }
      ],
      "2536": [
        {
          "start": 3654,
          "length": 32
        }
      ],
      "51913": [
        {
          "start": 13215,
          "length": 32
        }
      ],
      "51915": [
        {
          "start": 13404,
          "length": 32
        }
      ],
      "51917": [
        {
          "start": 13161,
          "length": 32
        }
      ],
      "51919": [
        {
          "start": 13294,
          "length": 32
        }
      ],
      "51921": [
        {
          "start": 13332,
          "length": 32
        }
      ],
      "51924": [
        {
          "start": 3236,
          "length": 32
        }
      ],
      "51927": [
        {
          "start": 3280,
          "length": 32
        }
      ]
    }
  },
  "methodIdentifiers": {
    "attest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)))": "f17325e7",
    "attestByDelegation((bytes32,(address,uint64,bool,bytes32,bytes,uint256),(uint8,bytes32,bytes32),address,uint64))": "3c042715",
    "eip712Domain()": "84b0196e",
    "getAttestTypeHash()": "12b11a17",
    "getAttestation(bytes32)": "a3112a64",
    "getDomainSeparator()": "ed24911d",
    "getName()": "17d7de7c",
    "getNonce(address)": "2d0335ab",
    "getRevokeOffchain(address,bytes32)": "b469318d",
    "getRevokeTypeHash()": "b83010d3",
    "getSchemaRegistry()": "f10b5cc8",
    "getTimestamp(bytes32)": "d45c4435",
    "increaseNonce(uint256)": "79f7573a",
    "isAttestationValid(bytes32)": "e30bb563",
    "multiAttest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)[])[])": "44adc90e",
    "multiAttestByDelegation((bytes32,(address,uint64,bool,bytes32,bytes,uint256)[],(uint8,bytes32,bytes32)[],address,uint64)[])": "95411525",
    "multiRevoke((bytes32,(bytes32,uint256)[])[])": "4cb7e9e5",
    "multiRevokeByDelegation((bytes32,(bytes32,uint256)[],(uint8,bytes32,bytes32)[],address,uint64)[])": "0eabf660",
    "multiRevokeOffchain(bytes32[])": "13893f61",
    "multiTimestamp(bytes32[])": "e71ff365",
    "revoke((bytes32,(bytes32,uint256)))": "46926267",
    "revokeByDelegation((bytes32,(bytes32,uint256),(uint8,bytes32,bytes32),address,uint64))": "a6d4dbc7",
    "revokeOffchain(bytes32)": "cf190f34",
    "timestamp(bytes32)": "4d003070",
    "version()": "54fd4d50"
  },
  "rawMetadata": "{\"compiler\":{\"version\":\"0.8.27+commit.40a35a09\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[{\"internalType\":\"contract ISchemaRegistry\",\"name\":\"registry\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"AccessDenied\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"AlreadyRevoked\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"AlreadyRevokedOffchain\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"AlreadyTimestamped\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"DeadlineExpired\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"FailedCall\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"balance\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"needed\",\"type\":\"uint256\"}],\"name\":\"InsufficientBalance\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InsufficientValue\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidAttestation\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidAttestations\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidExpirationTime\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidLength\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidNonce\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidOffset\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidRegistry\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidRevocation\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidRevocations\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidSchema\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidShortString\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidSignature\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidVerifier\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"Irrevocable\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"NotFound\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"NotPayable\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"str\",\"type\":\"string\"}],\"name\":\"StringTooLong\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"WrongSchema\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"schemaUID\",\"type\":\"bytes32\"}],\"name\":\"Attested\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[],\"name\":\"EIP712DomainChanged\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"oldNonce\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"newNonce\",\"type\":\"uint256\"}],\"name\":\"NonceIncreased\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"schemaUID\",\"type\":\"bytes32\"}],\"name\":\"Revoked\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"revoker\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"data\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"uint64\",\"name\":\"timestamp\",\"type\":\"uint64\"}],\"name\":\"RevokedOffchain\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"data\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"uint64\",\"name\":\"timestamp\",\"type\":\"uint64\"}],\"name\":\"Timestamped\",\"type\":\"event\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"components\":[{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"internalType\":\"struct AttestationRequestData\",\"name\":\"data\",\"type\":\"tuple\"}],\"internalType\":\"struct AttestationRequest\",\"name\":\"request\",\"type\":\"tuple\"}],\"name\":\"attest\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"components\":[{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"internalType\":\"struct AttestationRequestData\",\"name\":\"data\",\"type\":\"tuple\"},{\"components\":[{\"internalType\":\"uint8\",\"name\":\"v\",\"type\":\"uint8\"},{\"internalType\":\"bytes32\",\"name\":\"r\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"s\",\"type\":\"bytes32\"}],\"internalType\":\"struct Signature\",\"name\":\"signature\",\"type\":\"tuple\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"deadline\",\"type\":\"uint64\"}],\"internalType\":\"struct DelegatedAttestationRequest\",\"name\":\"delegatedRequest\",\"type\":\"tuple\"}],\"name\":\"attestByDelegation\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"eip712Domain\",\"outputs\":[{\"internalType\":\"bytes1\",\"name\":\"fields\",\"type\":\"bytes1\"},{\"internalType\":\"string\",\"name\":\"name\",\"type\":\"string\"},{\"internalType\":\"string\",\"name\":\"version\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"chainId\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"verifyingContract\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"salt\",\"type\":\"bytes32\"},{\"internalType\":\"uint256[]\",\"name\":\"extensions\",\"type\":\"uint256[]\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getAttestTypeHash\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"getAttestation\",\"outputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getDomainSeparator\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getName\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"getNonce\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"revoker\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"data\",\"type\":\"bytes32\"}],\"name\":\"getRevokeOffchain\",\"outputs\":[{\"internalType\":\"uint64\",\"name\":\"\",\"type\":\"uint64\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getRevokeTypeHash\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getSchemaRegistry\",\"outputs\":[{\"internalType\":\"contract ISchemaRegistry\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"data\",\"type\":\"bytes32\"}],\"name\":\"getTimestamp\",\"outputs\":[{\"internalType\":\"uint64\",\"name\":\"\",\"type\":\"uint64\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"newNonce\",\"type\":\"uint256\"}],\"name\":\"increaseNonce\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"isAttestationValid\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"components\":[{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"internalType\":\"struct AttestationRequestData[]\",\"name\":\"data\",\"type\":\"tuple[]\"}],\"internalType\":\"struct MultiAttestationRequest[]\",\"name\":\"multiRequests\",\"type\":\"tuple[]\"}],\"name\":\"multiAttest\",\"outputs\":[{\"internalType\":\"bytes32[]\",\"name\":\"\",\"type\":\"bytes32[]\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"components\":[{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"internalType\":\"struct AttestationRequestData[]\",\"name\":\"data\",\"type\":\"tuple[]\"},{\"components\":[{\"internalType\":\"uint8\",\"name\":\"v\",\"type\":\"uint8\"},{\"internalType\":\"bytes32\",\"name\":\"r\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"s\",\"type\":\"bytes32\"}],\"internalType\":\"struct Signature[]\",\"name\":\"signatures\",\"type\":\"tuple[]\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"deadline\",\"type\":\"uint64\"}],\"internalType\":\"struct MultiDelegatedAttestationRequest[]\",\"name\":\"multiDelegatedRequests\",\"type\":\"tuple[]\"}],\"name\":\"multiAttestByDelegation\",\"outputs\":[{\"internalType\":\"bytes32[]\",\"name\":\"\",\"type\":\"bytes32[]\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"internalType\":\"struct RevocationRequestData[]\",\"name\":\"data\",\"type\":\"tuple[]\"}],\"internalType\":\"struct MultiRevocationRequest[]\",\"name\":\"multiRequests\",\"type\":\"tuple[]\"}],\"name\":\"multiRevoke\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"internalType\":\"struct RevocationRequestData[]\",\"name\":\"data\",\"type\":\"tuple[]\"},{\"components\":[{\"internalType\":\"uint8\",\"name\":\"v\",\"type\":\"uint8\"},{\"internalType\":\"bytes32\",\"name\":\"r\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"s\",\"type\":\"bytes32\"}],\"internalType\":\"struct Signature[]\",\"name\":\"signatures\",\"type\":\"tuple[]\"},{\"internalType\":\"address\",\"name\":\"revoker\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"deadline\",\"type\":\"uint64\"}],\"internalType\":\"struct MultiDelegatedRevocationRequest[]\",\"name\":\"multiDelegatedRequests\",\"type\":\"tuple[]\"}],\"name\":\"multiRevokeByDelegation\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32[]\",\"name\":\"data\",\"type\":\"bytes32[]\"}],\"name\":\"multiRevokeOffchain\",\"outputs\":[{\"internalType\":\"uint64\",\"name\":\"\",\"type\":\"uint64\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32[]\",\"name\":\"data\",\"type\":\"bytes32[]\"}],\"name\":\"multiTimestamp\",\"outputs\":[{\"internalType\":\"uint64\",\"name\":\"\",\"type\":\"uint64\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"internalType\":\"struct RevocationRequestData\",\"name\":\"data\",\"type\":\"tuple\"}],\"internalType\":\"struct RevocationRequest\",\"name\":\"request\",\"type\":\"tuple\"}],\"name\":\"revoke\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"internalType\":\"struct RevocationRequestData\",\"name\":\"data\",\"type\":\"tuple\"},{\"components\":[{\"internalType\":\"uint8\",\"name\":\"v\",\"type\":\"uint8\"},{\"internalType\":\"bytes32\",\"name\":\"r\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"s\",\"type\":\"bytes32\"}],\"internalType\":\"struct Signature\",\"name\":\"signature\",\"type\":\"tuple\"},{\"internalType\":\"address\",\"name\":\"revoker\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"deadline\",\"type\":\"uint64\"}],\"internalType\":\"struct DelegatedRevocationRequest\",\"name\":\"delegatedRequest\",\"type\":\"tuple\"}],\"name\":\"revokeByDelegation\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"data\",\"type\":\"bytes32\"}],\"name\":\"revokeOffchain\",\"outputs\":[{\"internalType\":\"uint64\",\"name\":\"\",\"type\":\"uint64\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"data\",\"type\":\"bytes32\"}],\"name\":\"timestamp\",\"outputs\":[{\"internalType\":\"uint64\",\"name\":\"\",\"type\":\"uint64\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"version\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"}],\"devdoc\":{\"errors\":{\"FailedCall()\":[{\"details\":\"A call to an address target failed. The target may have reverted.\"}],\"InsufficientBalance(uint256,uint256)\":[{\"details\":\"The ETH balance of the account is not enough to perform the operation.\"}]},\"events\":{\"Attested(address,address,bytes32,bytes32)\":{\"params\":{\"attester\":\"The attesting account.\",\"recipient\":\"The recipient of the attestation.\",\"schemaUID\":\"The UID of the schema.\",\"uid\":\"The UID of the new attestation.\"}},\"EIP712DomainChanged()\":{\"details\":\"MAY be emitted to signal that the domain could have changed.\"},\"NonceIncreased(uint256,uint256)\":{\"params\":{\"newNonce\":\"The new value.\",\"oldNonce\":\"The previous nonce.\"}},\"Revoked(address,address,bytes32,bytes32)\":{\"params\":{\"attester\":\"The attesting account.\",\"recipient\":\"The recipient of the attestation.\",\"schemaUID\":\"The UID of the schema.\",\"uid\":\"The UID the revoked attestation.\"}},\"RevokedOffchain(address,bytes32,uint64)\":{\"params\":{\"data\":\"The data.\",\"revoker\":\"The address of the revoker.\",\"timestamp\":\"The timestamp.\"}},\"Timestamped(bytes32,uint64)\":{\"params\":{\"data\":\"The data.\",\"timestamp\":\"The timestamp.\"}}},\"kind\":\"dev\",\"methods\":{\"attest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)))\":{\"params\":{\"request\":\"The arguments of the attestation request.\"},\"returns\":{\"_0\":\"The UID of the new attestation. Example:     attest({         schema: \\\"0facc36681cbe2456019c1b0d1e7bedd6d1d40f6f324bf3dd3a4cef2999200a0\\\",         data: {             recipient: \\\"0xdEADBeAFdeAdbEafdeadbeafDeAdbEAFdeadbeaf\\\",             expirationTime: 0,             revocable: true,             refUID: \\\"0x0000000000000000000000000000000000000000000000000000000000000000\\\",             data: \\\"0xF00D\\\",             value: 0         }     })\"}},\"attestByDelegation((bytes32,(address,uint64,bool,bytes32,bytes,uint256),(uint8,bytes32,bytes32),address,uint64))\":{\"params\":{\"delegatedRequest\":\"The arguments of the delegated attestation request.\"},\"returns\":{\"_0\":\"The UID of the new attestation. Example:     attestByDelegation({         schema: '0x8e72f5bc0a8d4be6aa98360baa889040c50a0e51f32dbf0baa5199bd93472ebc',         data: {             recipient: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',             expirationTime: 1673891048,             revocable: true,             refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',             data: '0x1234',             value: 0         },         signature: {             v: 28,             r: '0x148c...b25b',             s: '0x5a72...be22'         },         attester: '0xc5E8740aD971409492b1A63Db8d83025e0Fc427e',         deadline: 1673891048     })\"}},\"constructor\":{\"details\":\"Creates a new EAS instance.\",\"params\":{\"registry\":\"The address of the global schema registry.\"}},\"eip712Domain()\":{\"details\":\"returns the fields and values that describe the domain separator used by this contract for EIP-712 signature.\"},\"getAttestTypeHash()\":{\"returns\":{\"_0\":\"The EIP712 type hash for the attest function.\"}},\"getAttestation(bytes32)\":{\"params\":{\"uid\":\"The UID of the attestation to retrieve.\"},\"returns\":{\"_0\":\"The attestation data members.\"}},\"getDomainSeparator()\":{\"returns\":{\"_0\":\"The domain separator used in the encoding of the signatures for attest, and revoke.\"}},\"getName()\":{\"returns\":{\"_0\":\"The EIP712 name.\"}},\"getNonce(address)\":{\"params\":{\"account\":\"The requested account.\"},\"returns\":{\"_0\":\"The current nonce.\"}},\"getRevokeOffchain(address,bytes32)\":{\"params\":{\"data\":\"The data to query.\"},\"returns\":{\"_0\":\"The timestamp the data was timestamped with.\"}},\"getRevokeTypeHash()\":{\"returns\":{\"_0\":\"The EIP712 type hash for the revoke function.\"}},\"getSchemaRegistry()\":{\"returns\":{\"_0\":\"The address of the global schema registry.\"}},\"getTimestamp(bytes32)\":{\"params\":{\"data\":\"The data to query.\"},\"returns\":{\"_0\":\"The timestamp the data was timestamped with.\"}},\"increaseNonce(uint256)\":{\"params\":{\"newNonce\":\"The (higher) new value.\"}},\"isAttestationValid(bytes32)\":{\"params\":{\"uid\":\"The UID of the attestation to retrieve.\"},\"returns\":{\"_0\":\"Whether an attestation exists.\"}},\"multiAttest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)[])[])\":{\"params\":{\"multiRequests\":\"The arguments of the multi attestation requests. The requests should be grouped by distinct     schema ids to benefit from the best batching optimization.\"},\"returns\":{\"_0\":\"The UIDs of the new attestations. Example:     multiAttest([{         schema: '0x33e9094830a5cba5554d1954310e4fbed2ef5f859ec1404619adea4207f391fd',         data: [{             recipient: '0xdEADBeAFdeAdbEafdeadbeafDeAdbEAFdeadbeaf',             expirationTime: 1673891048,             revocable: true,             refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',             data: '0x1234',             value: 1000         },         {             recipient: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',             expirationTime: 0,             revocable: false,             refUID: '0x480df4a039efc31b11bfdf491b383ca138b6bde160988222a2a3509c02cee174',             data: '0x00',             value: 0         }],     },     {         schema: '0x5ac273ce41e3c8bfa383efe7c03e54c5f0bff29c9f11ef6ffa930fc84ca32425',         data: [{             recipient: '0xdEADBeAFdeAdbEafdeadbeafDeAdbEAFdeadbeaf',             expirationTime: 0,             revocable: true,             refUID: '0x75bf2ed8dca25a8190c50c52db136664de25b2449535839008ccfdab469b214f',             data: '0x12345678',             value: 0         },     }])\"}},\"multiAttestByDelegation((bytes32,(address,uint64,bool,bytes32,bytes,uint256)[],(uint8,bytes32,bytes32)[],address,uint64)[])\":{\"params\":{\"multiDelegatedRequests\":\"The arguments of the delegated multi attestation requests. The requests should be     grouped by distinct schema ids to benefit from the best batching optimization.\"},\"returns\":{\"_0\":\"The UIDs of the new attestations. Example:     multiAttestByDelegation([{         schema: '0x8e72f5bc0a8d4be6aa98360baa889040c50a0e51f32dbf0baa5199bd93472ebc',         data: [{             recipient: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',             expirationTime: 1673891048,             revocable: true,             refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',             data: '0x1234',             value: 0         },         {             recipient: '0xdEADBeAFdeAdbEafdeadbeafDeAdbEAFdeadbeaf',             expirationTime: 0,             revocable: false,             refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',             data: '0x00',             value: 0         }],         signatures: [{             v: 28,             r: '0x148c...b25b',             s: '0x5a72...be22'         },         {             v: 28,             r: '0x487s...67bb',             s: '0x12ad...2366'         }],         attester: '0x1D86495b2A7B524D747d2839b3C645Bed32e8CF4',         deadline: 1673891048     }])\"}},\"multiRevoke((bytes32,(bytes32,uint256)[])[])\":{\"params\":{\"multiRequests\":\"The arguments of the multi revocation requests. The requests should be grouped by distinct     schema ids to benefit from the best batching optimization. Example:     multiRevoke([{         schema: '0x8e72f5bc0a8d4be6aa98360baa889040c50a0e51f32dbf0baa5199bd93472ebc',         data: [{             uid: '0x211296a1ca0d7f9f2cfebf0daaa575bea9b20e968d81aef4e743d699c6ac4b25',             value: 1000         },         {             uid: '0xe160ac1bd3606a287b4d53d5d1d6da5895f65b4b4bab6d93aaf5046e48167ade',             value: 0         }],     },     {         schema: '0x5ac273ce41e3c8bfa383efe7c03e54c5f0bff29c9f11ef6ffa930fc84ca32425',         data: [{             uid: '0x053d42abce1fd7c8fcddfae21845ad34dae287b2c326220b03ba241bc5a8f019',             value: 0         },     }])\"}},\"multiRevokeByDelegation((bytes32,(bytes32,uint256)[],(uint8,bytes32,bytes32)[],address,uint64)[])\":{\"params\":{\"multiDelegatedRequests\":\"The arguments of the delegated multi revocation attestation requests. The requests     should be grouped by distinct schema ids to benefit from the best batching optimization. Example:     multiRevokeByDelegation([{         schema: '0x8e72f5bc0a8d4be6aa98360baa889040c50a0e51f32dbf0baa5199bd93472ebc',         data: [{             uid: '0x211296a1ca0d7f9f2cfebf0daaa575bea9b20e968d81aef4e743d699c6ac4b25',             value: 1000         },         {             uid: '0xe160ac1bd3606a287b4d53d5d1d6da5895f65b4b4bab6d93aaf5046e48167ade',             value: 0         }],         signatures: [{             v: 28,             r: '0x148c...b25b',             s: '0x5a72...be22'         },         {             v: 28,             r: '0x487s...67bb',             s: '0x12ad...2366'         }],         revoker: '0x244934dd3e31bE2c81f84ECf0b3E6329F5381992',         deadline: 1673891048     }])\"}},\"multiRevokeOffchain(bytes32[])\":{\"params\":{\"data\":\"The data to timestamp.\"},\"returns\":{\"_0\":\"The timestamp the data was revoked with.\"}},\"multiTimestamp(bytes32[])\":{\"params\":{\"data\":\"The data to timestamp.\"},\"returns\":{\"_0\":\"The timestamp the data was timestamped with.\"}},\"revoke((bytes32,(bytes32,uint256)))\":{\"params\":{\"request\":\"The arguments of the revocation request. Example:     revoke({         schema: '0x8e72f5bc0a8d4be6aa98360baa889040c50a0e51f32dbf0baa5199bd93472ebc',         data: {             uid: '0x101032e487642ee04ee17049f99a70590c735b8614079fc9275f9dd57c00966d',             value: 0         }     })\"}},\"revokeByDelegation((bytes32,(bytes32,uint256),(uint8,bytes32,bytes32),address,uint64))\":{\"params\":{\"delegatedRequest\":\"The arguments of the delegated revocation request. Example:     revokeByDelegation({         schema: '0x8e72f5bc0a8d4be6aa98360baa889040c50a0e51f32dbf0baa5199bd93472ebc',         data: {             uid: '0xcbbc12102578c642a0f7b34fe7111e41afa25683b6cd7b5a14caf90fa14d24ba',             value: 0         },         signature: {             v: 27,             r: '0xb593...7142',             s: '0x0f5b...2cce'         },         revoker: '0x244934dd3e31bE2c81f84ECf0b3E6329F5381992',         deadline: 1673891048     })\"}},\"revokeOffchain(bytes32)\":{\"params\":{\"data\":\"The data to timestamp.\"},\"returns\":{\"_0\":\"The timestamp the data was revoked with.\"}},\"timestamp(bytes32)\":{\"params\":{\"data\":\"The data to timestamp.\"},\"returns\":{\"_0\":\"The timestamp the data was timestamped with.\"}},\"version()\":{\"returns\":{\"_0\":\"Semver contract version as a string.\"}}},\"title\":\"EAS\",\"version\":1},\"userdoc\":{\"events\":{\"Attested(address,address,bytes32,bytes32)\":{\"notice\":\"Emitted when an attestation has been made.\"},\"NonceIncreased(uint256,uint256)\":{\"notice\":\"Emitted when users invalidate nonces by increasing their nonces to (higher) new values.\"},\"Revoked(address,address,bytes32,bytes32)\":{\"notice\":\"Emitted when an attestation has been revoked.\"},\"RevokedOffchain(address,bytes32,uint64)\":{\"notice\":\"Emitted when a data has been revoked.\"},\"Timestamped(bytes32,uint64)\":{\"notice\":\"Emitted when a data has been timestamped.\"}},\"kind\":\"user\",\"methods\":{\"attest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)))\":{\"notice\":\"Attests to a specific schema.\"},\"attestByDelegation((bytes32,(address,uint64,bool,bytes32,bytes,uint256),(uint8,bytes32,bytes32),address,uint64))\":{\"notice\":\"Attests to a specific schema via the provided ECDSA signature.\"},\"getAttestTypeHash()\":{\"notice\":\"Returns the EIP712 type hash for the attest function.\"},\"getAttestation(bytes32)\":{\"notice\":\"Returns an existing attestation by UID.\"},\"getDomainSeparator()\":{\"notice\":\"Returns the domain separator used in the encoding of the signatures for attest, and revoke.\"},\"getName()\":{\"notice\":\"Returns the EIP712 name.\"},\"getNonce(address)\":{\"notice\":\"Returns the current nonce per-account.\"},\"getRevokeOffchain(address,bytes32)\":{\"notice\":\"Returns the timestamp that the specified data was timestamped with.\"},\"getRevokeTypeHash()\":{\"notice\":\"Returns the EIP712 type hash for the revoke function.\"},\"getSchemaRegistry()\":{\"notice\":\"Returns the address of the global schema registry.\"},\"getTimestamp(bytes32)\":{\"notice\":\"Returns the timestamp that the specified data was timestamped with.\"},\"increaseNonce(uint256)\":{\"notice\":\"Provides users an option to invalidate nonces by increasing their nonces to (higher) new values.\"},\"isAttestationValid(bytes32)\":{\"notice\":\"Checks whether an attestation exists.\"},\"multiAttest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)[])[])\":{\"notice\":\"Attests to multiple schemas.\"},\"multiAttestByDelegation((bytes32,(address,uint64,bool,bytes32,bytes,uint256)[],(uint8,bytes32,bytes32)[],address,uint64)[])\":{\"notice\":\"Attests to multiple schemas using via provided ECDSA signatures.\"},\"multiRevoke((bytes32,(bytes32,uint256)[])[])\":{\"notice\":\"Revokes existing attestations to multiple schemas.\"},\"multiRevokeByDelegation((bytes32,(bytes32,uint256)[],(uint8,bytes32,bytes32)[],address,uint64)[])\":{\"notice\":\"Revokes existing attestations to multiple schemas via provided ECDSA signatures.\"},\"multiRevokeOffchain(bytes32[])\":{\"notice\":\"Revokes the specified multiple bytes32 data.\"},\"multiTimestamp(bytes32[])\":{\"notice\":\"Timestamps the specified multiple bytes32 data.\"},\"revoke((bytes32,(bytes32,uint256)))\":{\"notice\":\"Revokes an existing attestation to a specific schema.\"},\"revokeByDelegation((bytes32,(bytes32,uint256),(uint8,bytes32,bytes32),address,uint64))\":{\"notice\":\"Revokes an existing attestation to a specific schema via the provided ECDSA signature.\"},\"revokeOffchain(bytes32)\":{\"notice\":\"Revokes the specified bytes32 data.\"},\"timestamp(bytes32)\":{\"notice\":\"Timestamps the specified bytes32 data.\"},\"version()\":{\"notice\":\"Returns the full semver contract version.\"}},\"notice\":\"The Ethereum Attestation Service protocol.\",\"version\":1}},\"settings\":{\"compilationTarget\":{\"lib/eas-contracts/contracts/EAS.sol\":\"EAS\"},\"evmVersion\":\"prague\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[\":@eas/=lib/eas-contracts/contracts/\",\":@erc8004/=lib/erc-8004-contracts/contracts/\",\":@openzeppelin/=lib/openzeppelin-contracts/\",\":@src/=src/\",\":@test/=test/\",\":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/\",\":eas-contracts/=lib/eas-contracts/contracts/\",\":erc-8004-contracts/=lib/erc-8004-contracts/contracts/\",\":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/\",\":eth-gas-reporter/=lib/eas-contracts/node_modules/eth-gas-reporter/\",\":forge-std/=lib/forge-std/src/\",\":halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/\",\":hardhat-deploy/=lib/eas-contracts/node_modules/hardhat-deploy/\",\":hardhat/=lib/eas-contracts/node_modules/hardhat/\",\":openzeppelin-contracts/=lib/openzeppelin-contracts/\"],\"viaIR\":true},\"sources\":{\"lib/eas-contracts/contracts/Common.sol\":{\"keccak256\":\"0x957bd2e6d0d6d637f86208b135c29fbaf4412cb08e5e7a61ede16b80561bf685\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://da1dc9aedbb1d4d39c46c2235918d3adfbc5741dd34a46010cf425d134e7936d\",\"dweb:/ipfs/QmWUk6bXnLaghS2riF3GTFEeURCzgYFMA5woa6AsgPwEgc\"]},\"lib/eas-contracts/contracts/EAS.sol\":{\"keccak256\":\"0x60d59e039e6ec40887e8a946f516b55997d689212c44a89f434119535dd9a3c4\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://b5234ba00beaf7a43005c0759e883c6878eecc4d0efeb42c10be8c9e8b17ba21\",\"dweb:/ipfs/QmPdUaubX2Yr9kMSyyYxkY3ueHiGzPfqTq5ubzbmQiQA6B\"]},\"lib/eas-contracts/contracts/IEAS.sol\":{\"keccak256\":\"0xdad0674defce04905dc7935f2756d6c477a6e876c0b1b7094b112a862f164c12\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://49e448c26c08952df034692d2ab3519dd40a1ebbeae4ce68b294567441933880\",\"dweb:/ipfs/QmWHcudjskUSCjgqsNWE65LVfWvcYB2vBn8RB1SmzvRLNR\"]},\"lib/eas-contracts/contracts/ISchemaRegistry.sol\":{\"keccak256\":\"0xea97dcd36a0c422169cbaac06698249e199049b627c16bff93fb8ab829058754\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://d453a929ef64a69cd31195ec2ee5ed1193bfa29f633e13c960e92154c37ad158\",\"dweb:/ipfs/QmXs1Z3njbHs2EMgHonrZDfcwdog4kozHY5tYNrhZK5yqz\"]},\"lib/eas-contracts/contracts/ISemver.sol\":{\"keccak256\":\"0x04a67939b4e1a8d0a51101b8f69f8882930bbdc66319f38023828625b5d1ff18\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://3dd543fa0e33cef1ea757627f9c2a10a66ee1ce17aa9087f437c5b53a903c7f0\",\"dweb:/ipfs/QmXsy6UsGBzF9zPCCjmiwPpCcX3tHqU13TmR67B69tKnR6\"]},\"lib/eas-contracts/contracts/Semver.sol\":{\"keccak256\":\"0x4f23442d048661b6aaa188ddc16b69cb310c2e44066b3852026afcb4201d61a9\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://30c36e580cd93d9acb13e1a11e833946a8bd0bd2a8d1b2be049f0d96e0989808\",\"dweb:/ipfs/QmXmQTxKjSrUWutafQsqkbGufXqtzxuDAiMMJjXCHXiEqh\"]},\"lib/eas-contracts/contracts/eip1271/EIP1271Verifier.sol\":{\"keccak256\":\"0x590977110db1256cc00416bdf74eb8264a0eda358ccded303610369a2930b614\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://ef015b3bee8859e6658c0eac6471d05f2991a5f4b6b5c2aa5571bbdab622d6e9\",\"dweb:/ipfs/QmUHriGkixE62c5qWjyM9DWZFykDcjQ7T6Tbfi3DPD38ym\"]},\"lib/eas-contracts/contracts/resolver/ISchemaResolver.sol\":{\"keccak256\":\"0xb7d1961ed928c620cddf35c2bf46845b10828bc5d73145214630202ed355b6bb\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://cf1cabacfb15c9bace8280b540b52e5aa440e1b4eba675f9782c34ce0f03902f\",\"dweb:/ipfs/QmakYcK4xbrijzvoaBCmBJK6HeaBqbXxWKtDQ1z62aXwCR\"]},\"lib/openzeppelin-contracts/contracts/interfaces/IERC1271.sol\":{\"keccak256\":\"0x66c7ec42c6c43712be2107a50ab4529379bc76a632b425babec698d9da921ac6\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://dce2778f0b638adfc5ba29c2c618c855fe725fa74a16846386aa1d56a834aa04\",\"dweb:/ipfs/QmPV9oWnzQdi58od266j62xvviavLNHqKLZfm6k2K1qy9E\"]},\"lib/openzeppelin-contracts/contracts/interfaces/IERC5267.sol\":{\"keccak256\":\"0xfb223a85dd0b2175cfbbaa325a744e2cd74ecd17c3df2b77b0722f991d2725ee\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://84bf1dea0589ec49c8d15d559cc6d86ee493048a89b2d4adb60fbe705a3d89ae\",\"dweb:/ipfs/Qmd56n556d529wk2pRMhYhm5nhMDhviwereodDikjs68w1\"]},\"lib/openzeppelin-contracts/contracts/interfaces/IERC7913.sol\":{\"keccak256\":\"0xe5a126930df1d54e4a6dd5fea09010c4a7db0ea974c6c17a1e6082879f5a032b\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://2f58f5a90328536a6c68289916bfa4ed653d871319c7b2a416ab3f6263c4f2f5\",\"dweb:/ipfs/Qmaa9DmgUA16Urz5fuF4RbFz2NaVpNLV41ddwykSdasFUd\"]},\"lib/openzeppelin-contracts/contracts/utils/Address.sol\":{\"keccak256\":\"0x0fa9e0d3a859900b5a46f70a03c73adf259603d5e05027a37fe0b45529d85346\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://c2add4da0240c9f2ce47649c8bb6b11b40e98cf6f88b8bdc76b2704e89391710\",\"dweb:/ipfs/QmNQTwF2uVzu4CRtNxr8bxyP9XuW6VsZuo2Nr4KR2bZr3d\"]},\"lib/openzeppelin-contracts/contracts/utils/Bytes.sol\":{\"keccak256\":\"0x8140d608316521b1fd71167c3b708ebb8659da070723fc8807609553b296ee33\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://a7bf7db66869ba1e945a0390b85da2f6afc7e42a4735ca918d0d56ac90c50147\",\"dweb:/ipfs/QmRmNyhpBpgzSdQqLtrQCYE7H7eLnVVxh2Yy4YMrySR8AR\"]},\"lib/openzeppelin-contracts/contracts/utils/Errors.sol\":{\"keccak256\":\"0x6afa713bfd42cf0f7656efa91201007ac465e42049d7de1d50753a373648c123\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://ba1d02f4847670a1b83dec9f7d37f0b0418d6043447b69f3a29a5f9efc547fcf\",\"dweb:/ipfs/QmQ7iH2keLNUKgq2xSWcRmuBE5eZ3F5whYAkAGzCNNoEWB\"]},\"lib/openzeppelin-contracts/contracts/utils/LowLevelCall.sol\":{\"keccak256\":\"0x5b4802a4352474792df3107e961d1cc593e47b820c14f69d3505cb28f5a6a583\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://a6f86fd01f829499fe0545ff5dda07d4521988e88bfe0bf801fc15650921ed56\",\"dweb:/ipfs/QmUUKu4ZDffHAmfkf3asuQfmLTyfpuy2Amdncc3SqfzKPG\"]},\"lib/openzeppelin-contracts/contracts/utils/Panic.sol\":{\"keccak256\":\"0xf7fe324703a64fc51702311dc51562d5cb1497734f074e4f483bfb6717572d7a\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://c6a5ff4f9fd8649b7ee20800b7fa387d3465bd77cf20c2d1068cd5c98e1ed57a\",\"dweb:/ipfs/QmVSaVJf9FXFhdYEYeCEfjMVHrxDh5qL4CGkxdMWpQCrqG\"]},\"lib/openzeppelin-contracts/contracts/utils/ShortStrings.sol\":{\"keccak256\":\"0x0768b3bdb701fe4994b3be932ca8635551dfebe04c645f77500322741bebf57c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://a2059f9ca8d3c11c49ca49fc9c5fb070f18cc85d12a7688e45322ed0e2a1cb99\",\"dweb:/ipfs/QmS2gwX51RAvSw4tYbjHccY2CKbh2uvDzqHLAFXdsddgia\"]},\"lib/openzeppelin-contracts/contracts/utils/StorageSlot.sol\":{\"keccak256\":\"0xcf74f855663ce2ae00ed8352666b7935f6cddea2932fdf2c3ecd30a9b1cd0e97\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://9f660b1f351b757dfe01438e59888f31f33ded3afcf5cb5b0d9bf9aa6f320a8b\",\"dweb:/ipfs/QmarDJ5hZEgBtCmmrVzEZWjub9769eD686jmzb2XpSU1cM\"]},\"lib/openzeppelin-contracts/contracts/utils/Strings.sol\":{\"keccak256\":\"0x36d1750bf1aa5fee9c52adb2f7857ab652daca722fc05dff533b364f67a1139a\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://2e5e7052539b7849d02f3ce25acc1dce29373c11cfae9f0bc918c54b780c549a\",\"dweb:/ipfs/QmRGE32xNkMTo6i4pHHMxjpiu77yPwnTA25SFngw2NXJys\"]},\"lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol\":{\"keccak256\":\"0x360cf86214a764694dae1522a38200b1737fe90e46dcf56a0f89de143071cc20\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://2e393290a46ca6d1fa1addb40709d26e1d250638ab6acdd103b5af21768ebc7b\",\"dweb:/ipfs/QmPwT3tXwQ9NbGtZ99XRq7sr8LCQP8XaCrzw49JdXGn7us\"]},\"lib/openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol\":{\"keccak256\":\"0x8440117ea216b97a7bad690a67449fd372c840d073c8375822667e14702782b4\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://ebb6645995b8290d0b9121825e2533e4e28977b2c6befee76e15e58f0feb61d4\",\"dweb:/ipfs/QmVR72j6kL5R2txuihieDev1FeTi4KWJS1Z6ABbwL3Qtph\"]},\"lib/openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol\":{\"keccak256\":\"0x6abeed5940e1da7bb329e458db9a1c5c4ea6f86d651b952af99c6bddcd6bbb94\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://5fe75e9a6b759c5d7fd82fb59bd4f58c672b36f0a69b84f4789b7c7895d3e61c\",\"dweb:/ipfs/QmX28wsir8w5sS3acfJMNHcBwoPsDpqCu7WDkPnUWLMNiZ\"]},\"lib/openzeppelin-contracts/contracts/utils/cryptography/SignatureChecker.sol\":{\"keccak256\":\"0x445455b8be33e09cf1db14e59c0d1c5aa5d312b5e754e8ae751e42313a0cae88\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://d6939df526d1c3f1d773448f6451eebb8de344113744e0da121b6349658b1298\",\"dweb:/ipfs/QmPffovzJ8qGRuUh57qrnWajHqYPPrntb1EA1VRh8p5TLP\"]},\"lib/openzeppelin-contracts/contracts/utils/math/Math.sol\":{\"keccak256\":\"0x09e3f1c72d4c5cbe8e2644ab7313f8f7177533ae2f4c24cdcbbeaf520a73734c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://93208401215d539fa2d81626b207c1f611def7883d0e447b3b5969ebaa7b3c2c\",\"dweb:/ipfs/QmXPxDnQPx8LAweX5ZJqEcwkvs59kP4c64VVDG1Jjq1mef\"]},\"lib/openzeppelin-contracts/contracts/utils/math/SafeCast.sol\":{\"keccak256\":\"0x195533c86d0ef72bcc06456a4f66a9b941f38eb403739b00f21fd7c1abd1ae54\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://b1d578337048cad08c1c03041cca5978eff5428aa130c781b271ad9e5566e1f8\",\"dweb:/ipfs/QmPFKL2r9CBsMwmUqqdcFPfHZB2qcs9g1HDrPxzWSxomvy\"]},\"lib/openzeppelin-contracts/contracts/utils/math/SignedMath.sol\":{\"keccak256\":\"0xb1970fac7b64e6c09611e6691791e848d5e3fe410fa5899e7df2e0afd77a99e3\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://db5fbb3dddd8b7047465b62575d96231ba8a2774d37fb4737fbf23340fabbb03\",\"dweb:/ipfs/QmVUSvooZKEdEdap619tcJjTLcAuH6QBdZqAzWwnAXZAWJ\"]}},\"version\":1}",
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
              "internalType": "contract ISchemaRegistry",
              "name": "registry",
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
          "name": "AlreadyRevoked"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "AlreadyRevokedOffchain"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "AlreadyTimestamped"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "DeadlineExpired"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "FailedCall"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "balance",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "needed",
              "type": "uint256"
            }
          ],
          "type": "error",
          "name": "InsufficientBalance"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InsufficientValue"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidAttestation"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidAttestations"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidExpirationTime"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidLength"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidNonce"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidOffset"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidRegistry"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidRevocation"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidRevocations"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidSchema"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidShortString"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidSignature"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidVerifier"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "Irrevocable"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "NotFound"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "NotPayable"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "str",
              "type": "string"
            }
          ],
          "type": "error",
          "name": "StringTooLong"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "WrongSchema"
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
              "name": "attester",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "bytes32",
              "name": "uid",
              "type": "bytes32",
              "indexed": false
            },
            {
              "internalType": "bytes32",
              "name": "schemaUID",
              "type": "bytes32",
              "indexed": true
            }
          ],
          "type": "event",
          "name": "Attested",
          "anonymous": false
        },
        {
          "inputs": [],
          "type": "event",
          "name": "EIP712DomainChanged",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "oldNonce",
              "type": "uint256",
              "indexed": false
            },
            {
              "internalType": "uint256",
              "name": "newNonce",
              "type": "uint256",
              "indexed": false
            }
          ],
          "type": "event",
          "name": "NonceIncreased",
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
              "name": "attester",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "bytes32",
              "name": "uid",
              "type": "bytes32",
              "indexed": false
            },
            {
              "internalType": "bytes32",
              "name": "schemaUID",
              "type": "bytes32",
              "indexed": true
            }
          ],
          "type": "event",
          "name": "Revoked",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "revoker",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "bytes32",
              "name": "data",
              "type": "bytes32",
              "indexed": true
            },
            {
              "internalType": "uint64",
              "name": "timestamp",
              "type": "uint64",
              "indexed": true
            }
          ],
          "type": "event",
          "name": "RevokedOffchain",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "data",
              "type": "bytes32",
              "indexed": true
            },
            {
              "internalType": "uint64",
              "name": "timestamp",
              "type": "uint64",
              "indexed": true
            }
          ],
          "type": "event",
          "name": "Timestamped",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "struct AttestationRequest",
              "name": "request",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                },
                {
                  "internalType": "struct AttestationRequestData",
                  "name": "data",
                  "type": "tuple",
                  "components": [
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
                      "internalType": "uint256",
                      "name": "value",
                      "type": "uint256"
                    }
                  ]
                }
              ]
            }
          ],
          "stateMutability": "payable",
          "type": "function",
          "name": "attest",
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
              "internalType": "struct DelegatedAttestationRequest",
              "name": "delegatedRequest",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                },
                {
                  "internalType": "struct AttestationRequestData",
                  "name": "data",
                  "type": "tuple",
                  "components": [
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
                      "internalType": "uint256",
                      "name": "value",
                      "type": "uint256"
                    }
                  ]
                },
                {
                  "internalType": "struct Signature",
                  "name": "signature",
                  "type": "tuple",
                  "components": [
                    {
                      "internalType": "uint8",
                      "name": "v",
                      "type": "uint8"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "r",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "s",
                      "type": "bytes32"
                    }
                  ]
                },
                {
                  "internalType": "address",
                  "name": "attester",
                  "type": "address"
                },
                {
                  "internalType": "uint64",
                  "name": "deadline",
                  "type": "uint64"
                }
              ]
            }
          ],
          "stateMutability": "payable",
          "type": "function",
          "name": "attestByDelegation",
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
          "name": "eip712Domain",
          "outputs": [
            {
              "internalType": "bytes1",
              "name": "fields",
              "type": "bytes1"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "version",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "chainId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "verifyingContract",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "salt",
              "type": "bytes32"
            },
            {
              "internalType": "uint256[]",
              "name": "extensions",
              "type": "uint256[]"
            }
          ]
        },
        {
          "inputs": [],
          "stateMutability": "pure",
          "type": "function",
          "name": "getAttestTypeHash",
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
              "name": "uid",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "getAttestation",
          "outputs": [
            {
              "internalType": "struct Attestation",
              "name": "",
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
          ]
        },
        {
          "inputs": [],
          "stateMutability": "view",
          "type": "function",
          "name": "getDomainSeparator",
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
          "name": "getName",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "getNonce",
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
              "internalType": "address",
              "name": "revoker",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "data",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "getRevokeOffchain",
          "outputs": [
            {
              "internalType": "uint64",
              "name": "",
              "type": "uint64"
            }
          ]
        },
        {
          "inputs": [],
          "stateMutability": "pure",
          "type": "function",
          "name": "getRevokeTypeHash",
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
          "name": "getSchemaRegistry",
          "outputs": [
            {
              "internalType": "contract ISchemaRegistry",
              "name": "",
              "type": "address"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "data",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "getTimestamp",
          "outputs": [
            {
              "internalType": "uint64",
              "name": "",
              "type": "uint64"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "newNonce",
              "type": "uint256"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "increaseNonce"
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
          "name": "isAttestationValid",
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
              "internalType": "struct MultiAttestationRequest[]",
              "name": "multiRequests",
              "type": "tuple[]",
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                },
                {
                  "internalType": "struct AttestationRequestData[]",
                  "name": "data",
                  "type": "tuple[]",
                  "components": [
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
                      "internalType": "uint256",
                      "name": "value",
                      "type": "uint256"
                    }
                  ]
                }
              ]
            }
          ],
          "stateMutability": "payable",
          "type": "function",
          "name": "multiAttest",
          "outputs": [
            {
              "internalType": "bytes32[]",
              "name": "",
              "type": "bytes32[]"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "struct MultiDelegatedAttestationRequest[]",
              "name": "multiDelegatedRequests",
              "type": "tuple[]",
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                },
                {
                  "internalType": "struct AttestationRequestData[]",
                  "name": "data",
                  "type": "tuple[]",
                  "components": [
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
                      "internalType": "uint256",
                      "name": "value",
                      "type": "uint256"
                    }
                  ]
                },
                {
                  "internalType": "struct Signature[]",
                  "name": "signatures",
                  "type": "tuple[]",
                  "components": [
                    {
                      "internalType": "uint8",
                      "name": "v",
                      "type": "uint8"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "r",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "s",
                      "type": "bytes32"
                    }
                  ]
                },
                {
                  "internalType": "address",
                  "name": "attester",
                  "type": "address"
                },
                {
                  "internalType": "uint64",
                  "name": "deadline",
                  "type": "uint64"
                }
              ]
            }
          ],
          "stateMutability": "payable",
          "type": "function",
          "name": "multiAttestByDelegation",
          "outputs": [
            {
              "internalType": "bytes32[]",
              "name": "",
              "type": "bytes32[]"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "struct MultiRevocationRequest[]",
              "name": "multiRequests",
              "type": "tuple[]",
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                },
                {
                  "internalType": "struct RevocationRequestData[]",
                  "name": "data",
                  "type": "tuple[]",
                  "components": [
                    {
                      "internalType": "bytes32",
                      "name": "uid",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "uint256",
                      "name": "value",
                      "type": "uint256"
                    }
                  ]
                }
              ]
            }
          ],
          "stateMutability": "payable",
          "type": "function",
          "name": "multiRevoke"
        },
        {
          "inputs": [
            {
              "internalType": "struct MultiDelegatedRevocationRequest[]",
              "name": "multiDelegatedRequests",
              "type": "tuple[]",
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                },
                {
                  "internalType": "struct RevocationRequestData[]",
                  "name": "data",
                  "type": "tuple[]",
                  "components": [
                    {
                      "internalType": "bytes32",
                      "name": "uid",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "uint256",
                      "name": "value",
                      "type": "uint256"
                    }
                  ]
                },
                {
                  "internalType": "struct Signature[]",
                  "name": "signatures",
                  "type": "tuple[]",
                  "components": [
                    {
                      "internalType": "uint8",
                      "name": "v",
                      "type": "uint8"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "r",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "s",
                      "type": "bytes32"
                    }
                  ]
                },
                {
                  "internalType": "address",
                  "name": "revoker",
                  "type": "address"
                },
                {
                  "internalType": "uint64",
                  "name": "deadline",
                  "type": "uint64"
                }
              ]
            }
          ],
          "stateMutability": "payable",
          "type": "function",
          "name": "multiRevokeByDelegation"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32[]",
              "name": "data",
              "type": "bytes32[]"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "multiRevokeOffchain",
          "outputs": [
            {
              "internalType": "uint64",
              "name": "",
              "type": "uint64"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "bytes32[]",
              "name": "data",
              "type": "bytes32[]"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "multiTimestamp",
          "outputs": [
            {
              "internalType": "uint64",
              "name": "",
              "type": "uint64"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "struct RevocationRequest",
              "name": "request",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                },
                {
                  "internalType": "struct RevocationRequestData",
                  "name": "data",
                  "type": "tuple",
                  "components": [
                    {
                      "internalType": "bytes32",
                      "name": "uid",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "uint256",
                      "name": "value",
                      "type": "uint256"
                    }
                  ]
                }
              ]
            }
          ],
          "stateMutability": "payable",
          "type": "function",
          "name": "revoke"
        },
        {
          "inputs": [
            {
              "internalType": "struct DelegatedRevocationRequest",
              "name": "delegatedRequest",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "schema",
                  "type": "bytes32"
                },
                {
                  "internalType": "struct RevocationRequestData",
                  "name": "data",
                  "type": "tuple",
                  "components": [
                    {
                      "internalType": "bytes32",
                      "name": "uid",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "uint256",
                      "name": "value",
                      "type": "uint256"
                    }
                  ]
                },
                {
                  "internalType": "struct Signature",
                  "name": "signature",
                  "type": "tuple",
                  "components": [
                    {
                      "internalType": "uint8",
                      "name": "v",
                      "type": "uint8"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "r",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "s",
                      "type": "bytes32"
                    }
                  ]
                },
                {
                  "internalType": "address",
                  "name": "revoker",
                  "type": "address"
                },
                {
                  "internalType": "uint64",
                  "name": "deadline",
                  "type": "uint64"
                }
              ]
            }
          ],
          "stateMutability": "payable",
          "type": "function",
          "name": "revokeByDelegation"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "data",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "revokeOffchain",
          "outputs": [
            {
              "internalType": "uint64",
              "name": "",
              "type": "uint64"
            }
          ]
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "data",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "timestamp",
          "outputs": [
            {
              "internalType": "uint64",
              "name": "",
              "type": "uint64"
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
        }
      ],
      "devdoc": {
        "kind": "dev",
        "methods": {
          "attest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)))": {
            "params": {
              "request": "The arguments of the attestation request."
            },
            "returns": {
              "_0": "The UID of the new attestation. Example:     attest({         schema: \"0facc36681cbe2456019c1b0d1e7bedd6d1d40f6f324bf3dd3a4cef2999200a0\",         data: {             recipient: \"0xdEADBeAFdeAdbEafdeadbeafDeAdbEAFdeadbeaf\",             expirationTime: 0,             revocable: true,             refUID: \"0x0000000000000000000000000000000000000000000000000000000000000000\",             data: \"0xF00D\",             value: 0         }     })"
            }
          },
          "attestByDelegation((bytes32,(address,uint64,bool,bytes32,bytes,uint256),(uint8,bytes32,bytes32),address,uint64))": {
            "params": {
              "delegatedRequest": "The arguments of the delegated attestation request."
            },
            "returns": {
              "_0": "The UID of the new attestation. Example:     attestByDelegation({         schema: '0x8e72f5bc0a8d4be6aa98360baa889040c50a0e51f32dbf0baa5199bd93472ebc',         data: {             recipient: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',             expirationTime: 1673891048,             revocable: true,             refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',             data: '0x1234',             value: 0         },         signature: {             v: 28,             r: '0x148c...b25b',             s: '0x5a72...be22'         },         attester: '0xc5E8740aD971409492b1A63Db8d83025e0Fc427e',         deadline: 1673891048     })"
            }
          },
          "constructor": {
            "details": "Creates a new EAS instance.",
            "params": {
              "registry": "The address of the global schema registry."
            }
          },
          "eip712Domain()": {
            "details": "returns the fields and values that describe the domain separator used by this contract for EIP-712 signature."
          },
          "getAttestTypeHash()": {
            "returns": {
              "_0": "The EIP712 type hash for the attest function."
            }
          },
          "getAttestation(bytes32)": {
            "params": {
              "uid": "The UID of the attestation to retrieve."
            },
            "returns": {
              "_0": "The attestation data members."
            }
          },
          "getDomainSeparator()": {
            "returns": {
              "_0": "The domain separator used in the encoding of the signatures for attest, and revoke."
            }
          },
          "getName()": {
            "returns": {
              "_0": "The EIP712 name."
            }
          },
          "getNonce(address)": {
            "params": {
              "account": "The requested account."
            },
            "returns": {
              "_0": "The current nonce."
            }
          },
          "getRevokeOffchain(address,bytes32)": {
            "params": {
              "data": "The data to query."
            },
            "returns": {
              "_0": "The timestamp the data was timestamped with."
            }
          },
          "getRevokeTypeHash()": {
            "returns": {
              "_0": "The EIP712 type hash for the revoke function."
            }
          },
          "getSchemaRegistry()": {
            "returns": {
              "_0": "The address of the global schema registry."
            }
          },
          "getTimestamp(bytes32)": {
            "params": {
              "data": "The data to query."
            },
            "returns": {
              "_0": "The timestamp the data was timestamped with."
            }
          },
          "increaseNonce(uint256)": {
            "params": {
              "newNonce": "The (higher) new value."
            }
          },
          "isAttestationValid(bytes32)": {
            "params": {
              "uid": "The UID of the attestation to retrieve."
            },
            "returns": {
              "_0": "Whether an attestation exists."
            }
          },
          "multiAttest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)[])[])": {
            "params": {
              "multiRequests": "The arguments of the multi attestation requests. The requests should be grouped by distinct     schema ids to benefit from the best batching optimization."
            },
            "returns": {
              "_0": "The UIDs of the new attestations. Example:     multiAttest([{         schema: '0x33e9094830a5cba5554d1954310e4fbed2ef5f859ec1404619adea4207f391fd',         data: [{             recipient: '0xdEADBeAFdeAdbEafdeadbeafDeAdbEAFdeadbeaf',             expirationTime: 1673891048,             revocable: true,             refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',             data: '0x1234',             value: 1000         },         {             recipient: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',             expirationTime: 0,             revocable: false,             refUID: '0x480df4a039efc31b11bfdf491b383ca138b6bde160988222a2a3509c02cee174',             data: '0x00',             value: 0         }],     },     {         schema: '0x5ac273ce41e3c8bfa383efe7c03e54c5f0bff29c9f11ef6ffa930fc84ca32425',         data: [{             recipient: '0xdEADBeAFdeAdbEafdeadbeafDeAdbEAFdeadbeaf',             expirationTime: 0,             revocable: true,             refUID: '0x75bf2ed8dca25a8190c50c52db136664de25b2449535839008ccfdab469b214f',             data: '0x12345678',             value: 0         },     }])"
            }
          },
          "multiAttestByDelegation((bytes32,(address,uint64,bool,bytes32,bytes,uint256)[],(uint8,bytes32,bytes32)[],address,uint64)[])": {
            "params": {
              "multiDelegatedRequests": "The arguments of the delegated multi attestation requests. The requests should be     grouped by distinct schema ids to benefit from the best batching optimization."
            },
            "returns": {
              "_0": "The UIDs of the new attestations. Example:     multiAttestByDelegation([{         schema: '0x8e72f5bc0a8d4be6aa98360baa889040c50a0e51f32dbf0baa5199bd93472ebc',         data: [{             recipient: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',             expirationTime: 1673891048,             revocable: true,             refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',             data: '0x1234',             value: 0         },         {             recipient: '0xdEADBeAFdeAdbEafdeadbeafDeAdbEAFdeadbeaf',             expirationTime: 0,             revocable: false,             refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',             data: '0x00',             value: 0         }],         signatures: [{             v: 28,             r: '0x148c...b25b',             s: '0x5a72...be22'         },         {             v: 28,             r: '0x487s...67bb',             s: '0x12ad...2366'         }],         attester: '0x1D86495b2A7B524D747d2839b3C645Bed32e8CF4',         deadline: 1673891048     }])"
            }
          },
          "multiRevoke((bytes32,(bytes32,uint256)[])[])": {
            "params": {
              "multiRequests": "The arguments of the multi revocation requests. The requests should be grouped by distinct     schema ids to benefit from the best batching optimization. Example:     multiRevoke([{         schema: '0x8e72f5bc0a8d4be6aa98360baa889040c50a0e51f32dbf0baa5199bd93472ebc',         data: [{             uid: '0x211296a1ca0d7f9f2cfebf0daaa575bea9b20e968d81aef4e743d699c6ac4b25',             value: 1000         },         {             uid: '0xe160ac1bd3606a287b4d53d5d1d6da5895f65b4b4bab6d93aaf5046e48167ade',             value: 0         }],     },     {         schema: '0x5ac273ce41e3c8bfa383efe7c03e54c5f0bff29c9f11ef6ffa930fc84ca32425',         data: [{             uid: '0x053d42abce1fd7c8fcddfae21845ad34dae287b2c326220b03ba241bc5a8f019',             value: 0         },     }])"
            }
          },
          "multiRevokeByDelegation((bytes32,(bytes32,uint256)[],(uint8,bytes32,bytes32)[],address,uint64)[])": {
            "params": {
              "multiDelegatedRequests": "The arguments of the delegated multi revocation attestation requests. The requests     should be grouped by distinct schema ids to benefit from the best batching optimization. Example:     multiRevokeByDelegation([{         schema: '0x8e72f5bc0a8d4be6aa98360baa889040c50a0e51f32dbf0baa5199bd93472ebc',         data: [{             uid: '0x211296a1ca0d7f9f2cfebf0daaa575bea9b20e968d81aef4e743d699c6ac4b25',             value: 1000         },         {             uid: '0xe160ac1bd3606a287b4d53d5d1d6da5895f65b4b4bab6d93aaf5046e48167ade',             value: 0         }],         signatures: [{             v: 28,             r: '0x148c...b25b',             s: '0x5a72...be22'         },         {             v: 28,             r: '0x487s...67bb',             s: '0x12ad...2366'         }],         revoker: '0x244934dd3e31bE2c81f84ECf0b3E6329F5381992',         deadline: 1673891048     }])"
            }
          },
          "multiRevokeOffchain(bytes32[])": {
            "params": {
              "data": "The data to timestamp."
            },
            "returns": {
              "_0": "The timestamp the data was revoked with."
            }
          },
          "multiTimestamp(bytes32[])": {
            "params": {
              "data": "The data to timestamp."
            },
            "returns": {
              "_0": "The timestamp the data was timestamped with."
            }
          },
          "revoke((bytes32,(bytes32,uint256)))": {
            "params": {
              "request": "The arguments of the revocation request. Example:     revoke({         schema: '0x8e72f5bc0a8d4be6aa98360baa889040c50a0e51f32dbf0baa5199bd93472ebc',         data: {             uid: '0x101032e487642ee04ee17049f99a70590c735b8614079fc9275f9dd57c00966d',             value: 0         }     })"
            }
          },
          "revokeByDelegation((bytes32,(bytes32,uint256),(uint8,bytes32,bytes32),address,uint64))": {
            "params": {
              "delegatedRequest": "The arguments of the delegated revocation request. Example:     revokeByDelegation({         schema: '0x8e72f5bc0a8d4be6aa98360baa889040c50a0e51f32dbf0baa5199bd93472ebc',         data: {             uid: '0xcbbc12102578c642a0f7b34fe7111e41afa25683b6cd7b5a14caf90fa14d24ba',             value: 0         },         signature: {             v: 27,             r: '0xb593...7142',             s: '0x0f5b...2cce'         },         revoker: '0x244934dd3e31bE2c81f84ECf0b3E6329F5381992',         deadline: 1673891048     })"
            }
          },
          "revokeOffchain(bytes32)": {
            "params": {
              "data": "The data to timestamp."
            },
            "returns": {
              "_0": "The timestamp the data was revoked with."
            }
          },
          "timestamp(bytes32)": {
            "params": {
              "data": "The data to timestamp."
            },
            "returns": {
              "_0": "The timestamp the data was timestamped with."
            }
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
          "attest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)))": {
            "notice": "Attests to a specific schema."
          },
          "attestByDelegation((bytes32,(address,uint64,bool,bytes32,bytes,uint256),(uint8,bytes32,bytes32),address,uint64))": {
            "notice": "Attests to a specific schema via the provided ECDSA signature."
          },
          "getAttestTypeHash()": {
            "notice": "Returns the EIP712 type hash for the attest function."
          },
          "getAttestation(bytes32)": {
            "notice": "Returns an existing attestation by UID."
          },
          "getDomainSeparator()": {
            "notice": "Returns the domain separator used in the encoding of the signatures for attest, and revoke."
          },
          "getName()": {
            "notice": "Returns the EIP712 name."
          },
          "getNonce(address)": {
            "notice": "Returns the current nonce per-account."
          },
          "getRevokeOffchain(address,bytes32)": {
            "notice": "Returns the timestamp that the specified data was timestamped with."
          },
          "getRevokeTypeHash()": {
            "notice": "Returns the EIP712 type hash for the revoke function."
          },
          "getSchemaRegistry()": {
            "notice": "Returns the address of the global schema registry."
          },
          "getTimestamp(bytes32)": {
            "notice": "Returns the timestamp that the specified data was timestamped with."
          },
          "increaseNonce(uint256)": {
            "notice": "Provides users an option to invalidate nonces by increasing their nonces to (higher) new values."
          },
          "isAttestationValid(bytes32)": {
            "notice": "Checks whether an attestation exists."
          },
          "multiAttest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)[])[])": {
            "notice": "Attests to multiple schemas."
          },
          "multiAttestByDelegation((bytes32,(address,uint64,bool,bytes32,bytes,uint256)[],(uint8,bytes32,bytes32)[],address,uint64)[])": {
            "notice": "Attests to multiple schemas using via provided ECDSA signatures."
          },
          "multiRevoke((bytes32,(bytes32,uint256)[])[])": {
            "notice": "Revokes existing attestations to multiple schemas."
          },
          "multiRevokeByDelegation((bytes32,(bytes32,uint256)[],(uint8,bytes32,bytes32)[],address,uint64)[])": {
            "notice": "Revokes existing attestations to multiple schemas via provided ECDSA signatures."
          },
          "multiRevokeOffchain(bytes32[])": {
            "notice": "Revokes the specified multiple bytes32 data."
          },
          "multiTimestamp(bytes32[])": {
            "notice": "Timestamps the specified multiple bytes32 data."
          },
          "revoke((bytes32,(bytes32,uint256)))": {
            "notice": "Revokes an existing attestation to a specific schema."
          },
          "revokeByDelegation((bytes32,(bytes32,uint256),(uint8,bytes32,bytes32),address,uint64))": {
            "notice": "Revokes an existing attestation to a specific schema via the provided ECDSA signature."
          },
          "revokeOffchain(bytes32)": {
            "notice": "Revokes the specified bytes32 data."
          },
          "timestamp(bytes32)": {
            "notice": "Timestamps the specified bytes32 data."
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
        "lib/eas-contracts/contracts/EAS.sol": "EAS"
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
      "lib/eas-contracts/contracts/EAS.sol": {
        "keccak256": "0x60d59e039e6ec40887e8a946f516b55997d689212c44a89f434119535dd9a3c4",
        "urls": [
          "bzz-raw://b5234ba00beaf7a43005c0759e883c6878eecc4d0efeb42c10be8c9e8b17ba21",
          "dweb:/ipfs/QmPdUaubX2Yr9kMSyyYxkY3ueHiGzPfqTq5ubzbmQiQA6B"
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
      "lib/eas-contracts/contracts/eip1271/EIP1271Verifier.sol": {
        "keccak256": "0x590977110db1256cc00416bdf74eb8264a0eda358ccded303610369a2930b614",
        "urls": [
          "bzz-raw://ef015b3bee8859e6658c0eac6471d05f2991a5f4b6b5c2aa5571bbdab622d6e9",
          "dweb:/ipfs/QmUHriGkixE62c5qWjyM9DWZFykDcjQ7T6Tbfi3DPD38ym"
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
      "lib/openzeppelin-contracts/contracts/interfaces/IERC1271.sol": {
        "keccak256": "0x66c7ec42c6c43712be2107a50ab4529379bc76a632b425babec698d9da921ac6",
        "urls": [
          "bzz-raw://dce2778f0b638adfc5ba29c2c618c855fe725fa74a16846386aa1d56a834aa04",
          "dweb:/ipfs/QmPV9oWnzQdi58od266j62xvviavLNHqKLZfm6k2K1qy9E"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/interfaces/IERC5267.sol": {
        "keccak256": "0xfb223a85dd0b2175cfbbaa325a744e2cd74ecd17c3df2b77b0722f991d2725ee",
        "urls": [
          "bzz-raw://84bf1dea0589ec49c8d15d559cc6d86ee493048a89b2d4adb60fbe705a3d89ae",
          "dweb:/ipfs/Qmd56n556d529wk2pRMhYhm5nhMDhviwereodDikjs68w1"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/interfaces/IERC7913.sol": {
        "keccak256": "0xe5a126930df1d54e4a6dd5fea09010c4a7db0ea974c6c17a1e6082879f5a032b",
        "urls": [
          "bzz-raw://2f58f5a90328536a6c68289916bfa4ed653d871319c7b2a416ab3f6263c4f2f5",
          "dweb:/ipfs/Qmaa9DmgUA16Urz5fuF4RbFz2NaVpNLV41ddwykSdasFUd"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/utils/Address.sol": {
        "keccak256": "0x0fa9e0d3a859900b5a46f70a03c73adf259603d5e05027a37fe0b45529d85346",
        "urls": [
          "bzz-raw://c2add4da0240c9f2ce47649c8bb6b11b40e98cf6f88b8bdc76b2704e89391710",
          "dweb:/ipfs/QmNQTwF2uVzu4CRtNxr8bxyP9XuW6VsZuo2Nr4KR2bZr3d"
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
      "lib/openzeppelin-contracts/contracts/utils/Errors.sol": {
        "keccak256": "0x6afa713bfd42cf0f7656efa91201007ac465e42049d7de1d50753a373648c123",
        "urls": [
          "bzz-raw://ba1d02f4847670a1b83dec9f7d37f0b0418d6043447b69f3a29a5f9efc547fcf",
          "dweb:/ipfs/QmQ7iH2keLNUKgq2xSWcRmuBE5eZ3F5whYAkAGzCNNoEWB"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/utils/LowLevelCall.sol": {
        "keccak256": "0x5b4802a4352474792df3107e961d1cc593e47b820c14f69d3505cb28f5a6a583",
        "urls": [
          "bzz-raw://a6f86fd01f829499fe0545ff5dda07d4521988e88bfe0bf801fc15650921ed56",
          "dweb:/ipfs/QmUUKu4ZDffHAmfkf3asuQfmLTyfpuy2Amdncc3SqfzKPG"
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
      "lib/openzeppelin-contracts/contracts/utils/ShortStrings.sol": {
        "keccak256": "0x0768b3bdb701fe4994b3be932ca8635551dfebe04c645f77500322741bebf57c",
        "urls": [
          "bzz-raw://a2059f9ca8d3c11c49ca49fc9c5fb070f18cc85d12a7688e45322ed0e2a1cb99",
          "dweb:/ipfs/QmS2gwX51RAvSw4tYbjHccY2CKbh2uvDzqHLAFXdsddgia"
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
      "lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol": {
        "keccak256": "0x360cf86214a764694dae1522a38200b1737fe90e46dcf56a0f89de143071cc20",
        "urls": [
          "bzz-raw://2e393290a46ca6d1fa1addb40709d26e1d250638ab6acdd103b5af21768ebc7b",
          "dweb:/ipfs/QmPwT3tXwQ9NbGtZ99XRq7sr8LCQP8XaCrzw49JdXGn7us"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol": {
        "keccak256": "0x8440117ea216b97a7bad690a67449fd372c840d073c8375822667e14702782b4",
        "urls": [
          "bzz-raw://ebb6645995b8290d0b9121825e2533e4e28977b2c6befee76e15e58f0feb61d4",
          "dweb:/ipfs/QmVR72j6kL5R2txuihieDev1FeTi4KWJS1Z6ABbwL3Qtph"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol": {
        "keccak256": "0x6abeed5940e1da7bb329e458db9a1c5c4ea6f86d651b952af99c6bddcd6bbb94",
        "urls": [
          "bzz-raw://5fe75e9a6b759c5d7fd82fb59bd4f58c672b36f0a69b84f4789b7c7895d3e61c",
          "dweb:/ipfs/QmX28wsir8w5sS3acfJMNHcBwoPsDpqCu7WDkPnUWLMNiZ"
        ],
        "license": "MIT"
      },
      "lib/openzeppelin-contracts/contracts/utils/cryptography/SignatureChecker.sol": {
        "keccak256": "0x445455b8be33e09cf1db14e59c0d1c5aa5d312b5e754e8ae751e42313a0cae88",
        "urls": [
          "bzz-raw://d6939df526d1c3f1d773448f6451eebb8de344113744e0da121b6349658b1298",
          "dweb:/ipfs/QmPffovzJ8qGRuUh57qrnWajHqYPPrntb1EA1VRh8p5TLP"
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
      }
    },
    "version": 1
  },
  "id": 1
} as const;
