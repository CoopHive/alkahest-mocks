export const abi = {
  "abi": [
    {
      "type": "function",
      "name": "approveEscrow",
      "inputs": [
        {
          "name": "escrow",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "approvedEscrows",
      "inputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "",
          "type": "address",
          "internalType": "address"
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
      "name": "decodeHookData",
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
          "internalType": "struct ERC20EscrowHook.HookData",
          "components": [
            {
              "name": "token",
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
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "deposits",
      "inputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "",
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
      "name": "encodeHookData",
      "inputs": [
        {
          "name": "hookData",
          "type": "tuple",
          "internalType": "struct ERC20EscrowHook.HookData",
          "components": [
            {
              "name": "token",
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
      "outputs": [
        {
          "name": "",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "isEscrowApproved",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "escrow",
          "type": "address",
          "internalType": "address"
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
      "name": "onAttest",
      "inputs": [
        {
          "name": "",
          "type": "bytes",
          "internalType": "bytes"
        },
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
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "onLock",
      "inputs": [
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "from",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "escrow",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "onRelease",
      "inputs": [
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "to",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "escrow",
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
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "onReturn",
      "inputs": [
        {
          "name": "data",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "to",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "escrow",
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
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "unapproveEscrow",
      "inputs": [
        {
          "name": "escrow",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "EscrowApproval",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "escrow",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "approved",
          "type": "bool",
          "indexed": false,
          "internalType": "bool"
        }
      ],
      "anonymous": false
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
          "name": "from",
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
      "name": "EscrowCallerMismatch",
      "inputs": [
        {
          "name": "caller",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "escrow",
          "type": "address",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "error",
      "name": "InsufficientDeposit",
      "inputs": [
        {
          "name": "caller",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "token",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "requested",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "available",
          "type": "uint256",
          "internalType": "uint256"
        }
      ]
    },
    {
      "type": "error",
      "name": "NoDeposit",
      "inputs": [
        {
          "name": "caller",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "token",
          "type": "address",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "error",
      "name": "UnauthorizedEscrowCaller",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "caller",
          "type": "address",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "error",
      "name": "UnexpectedNativeValue",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x60808060405234601557610a8a908161001a8239f35b5f80fdfe60806040526004361015610011575f80fd5b5f3560e01c80630fa37a1f14610665578063136befcf146102f65780631dc8160b146103c2578063297ae4121461034c5780633d0e5a6a146102f65780634591152814610288578063488a6ebe1461021a578063561ca525146101a85780638f601f6614610158578063be1e753b146101015763f73085df14610092575f80fd5b346100fd5760203660031901126100fd5760043567ffffffffffffffff81116100fd576100e36100c86040923690600401610692565b5f602085516100d6816106ec565b828152015281019061073e565b602082519160018060a01b03815116835201516020820152f35b5f80fd5b346100fd5760403660031901126100fd5760043567ffffffffffffffff81116100fd57610132903690600401610692565b505060243567ffffffffffffffff81116100fd576101409060031990360301126100fd57005b346100fd5760403660031901126100fd576101716106d6565b6101796106c0565b6001600160a01b039182165f908152600160209081526040808320949093168252928352819020549051908152f35b346100fd5760603660031901126100fd5760043567ffffffffffffffff81116100fd576101d9903690600401610692565b6101e16106c0565b906044359267ffffffffffffffff84116100fd5761014060031985360301126100fd57610213610218946004016107ad565b6107f8565b005b346100fd5760403660031901126100fd57604080516020810191906001600160a01b036102456106d6565b1683526024358282015281815261025d60608261071c565b8151928391602083525180918160208501528484015e5f828201840152601f01601f19168101030190f35b346100fd5760203660031901126100fd576102a16106d6565b335f818152602081815260408083206001600160a01b0395909516808452948252808320805460ff19169055519182527fbfe3408398a6b959bc04ab1cfde500aff4ee06af8ed2483286cc8d1feeb85ed991a3005b346100fd5760403660031901126100fd5761030f6106d6565b6103176106c0565b9060018060a01b03165f525f60205260405f209060018060a01b03165f52602052602060ff60405f2054166040519015158152f35b346100fd5760203660031901126100fd576103656106d6565b335f818152602081815260408083206001600160a01b039590951680845294825291829020805460ff1916600190811790915591519182527fbfe3408398a6b959bc04ab1cfde500aff4ee06af8ed2483286cc8d1feeb85ed991a3005b60603660031901126100fd5760043567ffffffffffffffff81116100fd576103ee903690600401610692565b906103f76106c0565b916044356001600160a01b038116908190036100fd5780330361064f57506001600160a01b0383165f8181526020818152604080832033845290915290205490929060ff16156106385734610629576104529181019061073e565b80516040516370a0823160e01b815230600482015291939190602090829060249082906001600160a01b03165afa9081156105df575f916105f7575b5060018060a01b038451169260208501938451604051926323b872dd60e01b5f526004523060245260445260205f60648180855af19060015f51148216156105ea575b5060408290525f60605285516370a0823160e01b8352306004840152602090839060249082906001600160a01b03165afa9182156105df575f926105ab575b5015918215610595575b5050610558575051335f90815260016020908152604080832094516001600160a01b03168352939052919091208054909161055491610778565b9055005b82519151604051634a73404560e11b81526001600160a01b0393841660048201529190921660248201523060448201526064810191909152608490fd5b6105a3919250845190610778565b11848061051a565b9091506020813d6020116105d7575b816105c76020938361071c565b810103126100fd57519086610510565b3d91506105ba565b6040513d5f823e3d90fd5b3b15153d151616866104d1565b90506020813d602011610621575b816106126020938361071c565b810103126100fd57518461048e565b3d9150610605565b63e0aeda7d60e01b5f5260045ffd5b826310d5e09d60e11b5f526004523360245260445ffd5b6303e011e160e31b5f523360045260245260445ffd5b346100fd5760803660031901126100fd5760043567ffffffffffffffff81116100fd576101d99036906004015b9181601f840112156100fd5782359167ffffffffffffffff83116100fd57602083818601950101116100fd57565b602435906001600160a01b03821682036100fd57565b600435906001600160a01b03821682036100fd57565b6040810190811067ffffffffffffffff82111761070857604052565b634e487b7160e01b5f52604160045260245ffd5b90601f8019910116810190811067ffffffffffffffff82111761070857604052565b908160409103126100fd5760405190610756826106ec565b8035906001600160a01b03821682036100fd5760209183520135602082015290565b9190820180921161078557565b634e487b7160e01b5f52601160045260245ffd5b356001600160a01b03811681036100fd5790565b60e0016001600160a01b036107c182610799565b1633036107cb5750565b6107d490610799565b6303e011e160e31b5f908152336004526001600160a01b0391909116602452604490fd5b6108049181019061073e565b335f90815260016020908152604080832084516001600160a01b03168452909152902054908115610a3057602081019182518082106109f957508251810390811161078557335f90815260016020908152604080832085516001600160a01b0390811685529083529281902093909355835192516370a0823160e01b8152868316600482018190529093909284916024918391165afa9182156105df575f926109c5575b5060018060a01b03835116908451916040519263a9059cbb60e01b5f52826004526024528260205f60448180865af19160015f51148316156109b3575b50602481602093948160405260018060a01b03895116906370a0823160e01b835260048301525afa9182156105df575f9261097f575b5015918215610969575b505061093057505050565b519051604051634a73404560e11b81526001600160a01b0392831660048201523060248201529290911660448301526064820152608490fd5b610977919250845190610778565b115f80610925565b9091506020813d6020116109ab575b8161099b6020938361071c565b810103126100fd5751905f61091b565b3d915061098e565b3d15903b1515169091169060246108e5565b9091506020813d6020116109f1575b816109e16020938361071c565b810103126100fd5751905f6108a8565b3d91506109d4565b915160405163b90e11b560e01b81523360048201526001600160a01b03909116602482015260448101929092526064820152608490fd5b51631f5f09af60e21b5f908152336004526001600160a01b03909116602452604490fdfea2646970667358221220b68280b89ca3b53bf911ba2ecc0ebb1b318077cfefe08737cf353c6919fd55c264736f6c634300081b0033",
    "sourceMap": "1115:3703:142:-:0;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  },
  "deployedBytecode": {
    "object": "0x60806040526004361015610011575f80fd5b5f3560e01c80630fa37a1f14610665578063136befcf146102f65780631dc8160b146103c2578063297ae4121461034c5780633d0e5a6a146102f65780634591152814610288578063488a6ebe1461021a578063561ca525146101a85780638f601f6614610158578063be1e753b146101015763f73085df14610092575f80fd5b346100fd5760203660031901126100fd5760043567ffffffffffffffff81116100fd576100e36100c86040923690600401610692565b5f602085516100d6816106ec565b828152015281019061073e565b602082519160018060a01b03815116835201516020820152f35b5f80fd5b346100fd5760403660031901126100fd5760043567ffffffffffffffff81116100fd57610132903690600401610692565b505060243567ffffffffffffffff81116100fd576101409060031990360301126100fd57005b346100fd5760403660031901126100fd576101716106d6565b6101796106c0565b6001600160a01b039182165f908152600160209081526040808320949093168252928352819020549051908152f35b346100fd5760603660031901126100fd5760043567ffffffffffffffff81116100fd576101d9903690600401610692565b6101e16106c0565b906044359267ffffffffffffffff84116100fd5761014060031985360301126100fd57610213610218946004016107ad565b6107f8565b005b346100fd5760403660031901126100fd57604080516020810191906001600160a01b036102456106d6565b1683526024358282015281815261025d60608261071c565b8151928391602083525180918160208501528484015e5f828201840152601f01601f19168101030190f35b346100fd5760203660031901126100fd576102a16106d6565b335f818152602081815260408083206001600160a01b0395909516808452948252808320805460ff19169055519182527fbfe3408398a6b959bc04ab1cfde500aff4ee06af8ed2483286cc8d1feeb85ed991a3005b346100fd5760403660031901126100fd5761030f6106d6565b6103176106c0565b9060018060a01b03165f525f60205260405f209060018060a01b03165f52602052602060ff60405f2054166040519015158152f35b346100fd5760203660031901126100fd576103656106d6565b335f818152602081815260408083206001600160a01b039590951680845294825291829020805460ff1916600190811790915591519182527fbfe3408398a6b959bc04ab1cfde500aff4ee06af8ed2483286cc8d1feeb85ed991a3005b60603660031901126100fd5760043567ffffffffffffffff81116100fd576103ee903690600401610692565b906103f76106c0565b916044356001600160a01b038116908190036100fd5780330361064f57506001600160a01b0383165f8181526020818152604080832033845290915290205490929060ff16156106385734610629576104529181019061073e565b80516040516370a0823160e01b815230600482015291939190602090829060249082906001600160a01b03165afa9081156105df575f916105f7575b5060018060a01b038451169260208501938451604051926323b872dd60e01b5f526004523060245260445260205f60648180855af19060015f51148216156105ea575b5060408290525f60605285516370a0823160e01b8352306004840152602090839060249082906001600160a01b03165afa9182156105df575f926105ab575b5015918215610595575b5050610558575051335f90815260016020908152604080832094516001600160a01b03168352939052919091208054909161055491610778565b9055005b82519151604051634a73404560e11b81526001600160a01b0393841660048201529190921660248201523060448201526064810191909152608490fd5b6105a3919250845190610778565b11848061051a565b9091506020813d6020116105d7575b816105c76020938361071c565b810103126100fd57519086610510565b3d91506105ba565b6040513d5f823e3d90fd5b3b15153d151616866104d1565b90506020813d602011610621575b816106126020938361071c565b810103126100fd57518461048e565b3d9150610605565b63e0aeda7d60e01b5f5260045ffd5b826310d5e09d60e11b5f526004523360245260445ffd5b6303e011e160e31b5f523360045260245260445ffd5b346100fd5760803660031901126100fd5760043567ffffffffffffffff81116100fd576101d99036906004015b9181601f840112156100fd5782359167ffffffffffffffff83116100fd57602083818601950101116100fd57565b602435906001600160a01b03821682036100fd57565b600435906001600160a01b03821682036100fd57565b6040810190811067ffffffffffffffff82111761070857604052565b634e487b7160e01b5f52604160045260245ffd5b90601f8019910116810190811067ffffffffffffffff82111761070857604052565b908160409103126100fd5760405190610756826106ec565b8035906001600160a01b03821682036100fd5760209183520135602082015290565b9190820180921161078557565b634e487b7160e01b5f52601160045260245ffd5b356001600160a01b03811681036100fd5790565b60e0016001600160a01b036107c182610799565b1633036107cb5750565b6107d490610799565b6303e011e160e31b5f908152336004526001600160a01b0391909116602452604490fd5b6108049181019061073e565b335f90815260016020908152604080832084516001600160a01b03168452909152902054908115610a3057602081019182518082106109f957508251810390811161078557335f90815260016020908152604080832085516001600160a01b0390811685529083529281902093909355835192516370a0823160e01b8152868316600482018190529093909284916024918391165afa9182156105df575f926109c5575b5060018060a01b03835116908451916040519263a9059cbb60e01b5f52826004526024528260205f60448180865af19160015f51148316156109b3575b50602481602093948160405260018060a01b03895116906370a0823160e01b835260048301525afa9182156105df575f9261097f575b5015918215610969575b505061093057505050565b519051604051634a73404560e11b81526001600160a01b0392831660048201523060248201529290911660448301526064820152608490fd5b610977919250845190610778565b115f80610925565b9091506020813d6020116109ab575b8161099b6020938361071c565b810103126100fd5751905f61091b565b3d915061098e565b3d15903b1515169091169060246108e5565b9091506020813d6020116109f1575b816109e16020938361071c565b810103126100fd5751905f6108a8565b3d91506109d4565b915160405163b90e11b560e01b81523360048201526001600160a01b03909116602482015260448101929092526064820152608490fd5b51631f5f09af60e21b5f908152336004526001600160a01b03909116602452604490fdfea2646970667358221220b68280b89ca3b53bf911ba2ecc0ebb1b318077cfefe08737cf353c6919fd55c264736f6c634300081b0033",
    "sourceMap": "1115:3703:142:-:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;1115:3703:142;;;;;;;;;;;4781:28;1115:3703;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;4781:28;;;;:::i;:::-;1115:3703;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;1115:3703:142;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;1115:3703:142;;;;;;:::i;:::-;;;:::i;:::-;-1:-1:-1;;;;;1115:3703:142;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;1115:3703:142;;;;;;;;;;;;;;;;;;:::i;:::-;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;2919:6;2955:2;1115:3703;;;2919:6;:::i;:::-;2955:2;:::i;:::-;1115:3703;;;;;;;-1:-1:-1;;1115:3703:142;;;;;;;4646:20;;;;1115:3703;-1:-1:-1;;;;;1115:3703:142;;:::i;:::-;;;;;;;;;;4646:20;;;;;;;:::i;:::-;1115:3703;;;;;4646:20;1115:3703;;;;;;4646:20;1115:3703;;;;;;;;;;;;;;;;-1:-1:-1;;1115:3703:142;;;;;;;;;;;;;-1:-1:-1;;1115:3703:142;;;;;;:::i;:::-;1160:10:138;1115:3703:142;;;;;;;;;;;;-1:-1:-1;;;;;1115:3703:142;;;;;;;;;;;;;;;-1:-1:-1;;1115:3703:142;;;;;;;1570:39:138;;;1115:3703:142;;;;;;;-1:-1:-1;;1115:3703:142;;;;;;:::i;:::-;;;:::i;:::-;;;;;;;;;;;;;;;;1378:30:138;1115:3703:142;;;;;;-1:-1:-1;1115:3703:142;;;;;;-1:-1:-1;1115:3703:142;;;;;;;;;;;;;;;;;-1:-1:-1;;1115:3703:142;;;;;;:::i;:::-;954:10:138;1115:3703:142;;;;;;;;;;;;-1:-1:-1;;;;;1115:3703:142;;;;;;;;;;;;;;;;-1:-1:-1;;1115:3703:142;;;;;;;;;;;;;1570:39:138;;;1115:3703:142;;;;-1:-1:-1;;1115:3703:142;;;;;;;;;;;;;;;;;;:::i;:::-;;;;:::i;:::-;;;;-1:-1:-1;;;;;1115:3703:142;;;;;;;;1707:10:138;;:20;1703:73;;-1:-1:-1;;;;;;1115:3703:142;;;;;;;;;;;;;;1707:10:138;1115:3703:142;;;;;;;;;;;;;1790:35:138;1786:91;;1975:9:142;1971:62;;2070:28;;;;;;:::i;:::-;1115:3703;;;;-1:-1:-1;;;2133:46:142;;2173:4;1115:3703;2133:46;;1115:3703;;;;;;;;;;;;;-1:-1:-1;;;;;1115:3703:142;2133:46;;;;;;;1115:3703;2133:46;;;1115:3703;;;;;;;;;;2268:14;1115:3703;2268:14;;1115:3703;;;;10404:1148:53;10365:28;;;;1115:3703:142;10404:1148:53;1115:3703:142;10404:1148:53;2173:4:142;1115:3703;10404:1148:53;1115:3703:142;10404:1148:53;1115:3703:142;;10404:1148:53;;;;;;;;1115:3703:142;10404:1148:53;;;;;;;1115:3703:142;-1:-1:-1;1115:3703:142;10404:1148:53;;;1115:3703:142;;10404:1148:53;1115:3703:142;;-1:-1:-1;;;2317:46:142;;2173:4;1115:3703;2317:46;;1115:3703;;;10404:1148:53;;1115:3703:142;;10404:1148:53;;-1:-1:-1;;;;;1115:3703:142;2317:46;;;;;;;1115:3703;2317:46;;;1115:3703;2378:8;;1115:3703;;;2378:57;;1115:3703;2374:166;;;;-1:-1:-1;1115:3703:142;1707:10:138;1115:3703:142;;;;10404:1148:53;1115:3703:142;;;;;;;;;;-1:-1:-1;;;;;1115:3703:142;;;;;;;;;;;;;;2550:53;;;:::i;:::-;1115:3703;;;2374:166;1115:3703;;;;;;-1:-1:-1;;;2458:71:142;;-1:-1:-1;;;;;1115:3703:142;;;;2458:71;;1115:3703;;;;;;;;;2173:4;1115:3703;;;;;;;;;;;;;2458:71;2378:57;2405:30;1115:3703;;;;;2405:30;;:::i;:::-;-1:-1:-1;2378:57:142;;;;2317:46;;;;1115:3703;2317:46;;1115:3703;2317:46;;;;;;1115:3703;2317:46;;;:::i;:::-;;;1115:3703;;;;;2317:46;;;;;;;-1:-1:-1;2317:46:142;;;1115:3703;;;;;;;;;10404:1148:53;;;;;;;;;;;2133:46:142;;;1115:3703;2133:46;;1115:3703;2133:46;;;;;;1115:3703;2133:46;;;:::i;:::-;;;1115:3703;;;;;2133:46;;;;;;-1:-1:-1;2133:46:142;;1971:62;1998:35;;;1115:3703;1998:35;1115:3703;;1998:35;1786:91:138;1834:43;;;;1115:3703:142;1834:43:138;1115:3703:142;;1707:10:138;1115:3703:142;;;;1834:43:138;1703:73;1736:40;;;1115:3703:142;1736:40:138;1707:10;1115:3703:142;;;;;;1736:40:138;1115:3703:142;;;;;;-1:-1:-1;;1115:3703:142;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;-1:-1:-1;;;;;1115:3703:142;;;;;;:::o;:::-;;;;-1:-1:-1;;;;;1115:3703:142;;;;;;:::o;:::-;;;;;;;;;;;;;;;:::o;:::-;;;;-1:-1:-1;1115:3703:142;;;;;-1:-1:-1;1115:3703:142;;;;4646:20;;1115:3703;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;:::i;:::-;;;;-1:-1:-1;;;;;1115:3703:142;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;-1:-1:-1;;;;;1115:3703:142;;;;;;;:::o;1890:184:138:-;1994:15;;-1:-1:-1;;;;;1994:15:138;;;:::i;:::-;1115:3703:142;1980:10:138;:29;1976:91;;1890:184;:::o;1976:91::-;2051:15;;;:::i;:::-;-1:-1:-1;;;;2018:49:138;;;1980:10;2018:49;1115:3703:142;-1:-1:-1;;;;;1115:3703:142;;;;;;;;2018:49:138;3302:915:142;3402:28;3302:915;3402:28;;;;:::i;:::-;3470:10;-1:-1:-1;1115:3703:142;;;3461:8;1115:3703;;;;;;;;;;-1:-1:-1;;;;;1115:3703:142;;;;;;;;;;3510:14;;3506:88;;1115:3703;3619:14;;1115:3703;;;3607:26;;;3603:137;;1115:3703;;;;;;;;;;3470:10;-1:-1:-1;1115:3703:142;;;3461:8;1115:3703;;;;;;;;;;-1:-1:-1;;;;;1115:3703:142;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;3849:35:142;;1115:3703;;;3849:35;;;1115:3703;;;;;;;;;3849:35;;1115:3703;;;3849:35;;;;;;;-1:-1:-1;3849:35:142;;;3302:915;1115:3703;;;;;;;;;;;;2138:38:53;1115:3703:142;8544:1067:53;8509:24;;;;-1:-1:-1;8544:1067:53;;3849:35:142;8544:1067:53;3849:35:142;8544:1067:53;;1115:3703:142;-1:-1:-1;8544:1067:53;;;;;;;3461:8:142;-1:-1:-1;8544:1067:53;;;;;;;3302:915:142;8544:1067:53;3849:35:142;8544:1067:53;1115:3703:142;8544:1067:53;;;1115:3703:142;8544:1067:53;1115:3703:142;;;;;;;;;;;;4001:35;;3849;4001;;1115:3703;4001:35;;;;;;;-1:-1:-1;4001:35:142;;;3302:915;4051:8;;1115:3703;;;4051:57;;3302:915;4047:164;;;;3302:915;;;:::o;4047:164::-;1115:3703;;;;;-1:-1:-1;;;4131:69:142;;-1:-1:-1;;;;;1115:3703:142;;;3849:35;4131:69;;1115:3703;4174:4;1115:3703;;;;;;;;;;;;;;;;;;2458:71;4051:57;4078:30;1115:3703;;;;;4078:30;;:::i;:::-;-1:-1:-1;4051:57:142;;;;4001:35;;;;1115:3703;4001:35;;1115:3703;4001:35;;;;;;1115:3703;4001:35;;;:::i;:::-;;;1115:3703;;;;;4001:35;;;;;;;-1:-1:-1;4001:35:142;;8544:1067:53;;;;;;;;;;;;3849:35:142;8544:1067:53;;3849:35:142;;;;1115:3703;3849:35;;1115:3703;3849:35;;;;;;1115:3703;3849:35;;;:::i;:::-;;;1115:3703;;;;;3849:35;;;;;;;-1:-1:-1;3849:35:142;;3603:137;1115:3703;;;;-1:-1:-1;;;3656:73:142;;3470:10;3656:73;;;1115:3703;-1:-1:-1;;;;;1115:3703:142;;;;;;;;;;;;;;;;;;3656:73;;;3506:88;1115:3703;-1:-1:-1;;;;3547:36:142;;;3470:10;3547:36;1115:3703;-1:-1:-1;;;;;1115:3703:142;;;;;;;3547:36",
    "linkReferences": {}
  },
  "methodIdentifiers": {
    "approveEscrow(address)": "297ae412",
    "approvedEscrows(address,address)": "136befcf",
    "decodeHookData(bytes)": "f73085df",
    "deposits(address,address)": "8f601f66",
    "encodeHookData((address,uint256))": "488a6ebe",
    "isEscrowApproved(address,address)": "3d0e5a6a",
    "onAttest(bytes,(bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))": "be1e753b",
    "onLock(bytes,address,address)": "1dc8160b",
    "onRelease(bytes,address,(bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes32)": "0fa37a1f",
    "onReturn(bytes,address,(bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))": "561ca525",
    "unapproveEscrow(address)": "45911528"
  },
  "rawMetadata": "{\"compiler\":{\"version\":\"0.8.27+commit.40a35a09\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[{\"internalType\":\"address\",\"name\":\"token\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"ERC20TransferFailed\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"escrow\",\"type\":\"address\"}],\"name\":\"EscrowCallerMismatch\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"token\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"requested\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"available\",\"type\":\"uint256\"}],\"name\":\"InsufficientDeposit\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"token\",\"type\":\"address\"}],\"name\":\"NoDeposit\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"}],\"name\":\"UnauthorizedEscrowCaller\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"UnexpectedNativeValue\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"escrow\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"bool\",\"name\":\"approved\",\"type\":\"bool\"}],\"name\":\"EscrowApproval\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"escrow\",\"type\":\"address\"}],\"name\":\"approveEscrow\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"approvedEscrows\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"decodeHookData\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"token\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"internalType\":\"struct ERC20EscrowHook.HookData\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"deposits\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"token\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"internalType\":\"struct ERC20EscrowHook.HookData\",\"name\":\"hookData\",\"type\":\"tuple\"}],\"name\":\"encodeHookData\",\"outputs\":[{\"internalType\":\"bytes\",\"name\":\"\",\"type\":\"bytes\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"escrow\",\"type\":\"address\"}],\"name\":\"isEscrowApproved\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"\",\"type\":\"bytes\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"\",\"type\":\"tuple\"}],\"name\":\"onAttest\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"escrow\",\"type\":\"address\"}],\"name\":\"onLock\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"escrow\",\"type\":\"tuple\"},{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"onRelease\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"escrow\",\"type\":\"tuple\"}],\"name\":\"onReturn\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"escrow\",\"type\":\"address\"}],\"name\":\"unapproveEscrow\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}],\"devdoc\":{\"details\":\"hookData is abi.encode(HookData).      Security model: deposits are tracked per-caller (msg.sender) per-token.      Only hook-approved escrow contracts can deposit on behalf of a user.      Approved escrows can only withdraw what they deposited via      onRelease/onReturn.      Users must approve this hook contract for the token and approve the      escrow obligation contract in this hook before the obligation calls      onLock.      Security note: This contract has not been included in professional manual audits and      has only been reviewed by automated audit tooling so far.\",\"kind\":\"dev\",\"methods\":{\"onLock(bytes,address,address)\":{\"params\":{\"data\":\"Hook-specific parameters (e.g. token address, amount).\",\"escrow\":\"The escrow obligation contract that initiated the lock.\",\"from\":\"The address providing the assets.\"}},\"onReturn(bytes,address,(bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"params\":{\"data\":\"The same hook data that was passed to onLock.\",\"escrow\":\"The full escrow attestation.\",\"to\":\"The address to return assets to (original creator).\"}}},\"title\":\"ERC20EscrowHook\",\"version\":1},\"userdoc\":{\"kind\":\"user\",\"methods\":{\"approveEscrow(address)\":{\"notice\":\"Approves an escrow obligation contract to use this hook for the caller.\"},\"approvedEscrows(address,address)\":{\"notice\":\"owner -> escrow obligation contract -> approved.\"},\"deposits(address,address)\":{\"notice\":\"Tracks deposits: caller (obligation) \\u2192 token \\u2192 amount held.\"},\"isEscrowApproved(address,address)\":{\"notice\":\"Returns whether `owner` approved `escrow` to use this hook.\"},\"onLock(bytes,address,address)\":{\"notice\":\"Lock assets into escrow on behalf of `from`.\"},\"onReturn(bytes,address,(bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))\":{\"notice\":\"Return escrowed assets to the original owner on expiry.\"},\"unapproveEscrow(address)\":{\"notice\":\"Revokes a previously approved escrow obligation contract for the caller.\"}},\"notice\":\"An IEscrowHook that escrows a single ERC20 token + amount.\",\"version\":1}},\"settings\":{\"compilationTarget\":{\"src/obligations/escrow/hook-based/hooks/ERC20EscrowHook.sol\":\"ERC20EscrowHook\"},\"evmVersion\":\"prague\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[\":@eas/=lib/eas-contracts/contracts/\",\":@erc8004/=lib/erc-8004-contracts/contracts/\",\":@openzeppelin/=lib/openzeppelin-contracts/\",\":@src/=src/\",\":@test/=test/\",\":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/\",\":eas-contracts/=lib/eas-contracts/contracts/\",\":erc-8004-contracts/=lib/erc-8004-contracts/contracts/\",\":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/\",\":eth-gas-reporter/=lib/eas-contracts/node_modules/eth-gas-reporter/\",\":forge-std/=lib/forge-std/src/\",\":halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/\",\":hardhat-deploy/=lib/eas-contracts/node_modules/hardhat-deploy/\",\":hardhat/=lib/eas-contracts/node_modules/hardhat/\",\":openzeppelin-contracts/=lib/openzeppelin-contracts/\"],\"viaIR\":true},\"sources\":{\"lib/eas-contracts/contracts/Common.sol\":{\"keccak256\":\"0x957bd2e6d0d6d637f86208b135c29fbaf4412cb08e5e7a61ede16b80561bf685\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://da1dc9aedbb1d4d39c46c2235918d3adfbc5741dd34a46010cf425d134e7936d\",\"dweb:/ipfs/QmWUk6bXnLaghS2riF3GTFEeURCzgYFMA5woa6AsgPwEgc\"]},\"lib/openzeppelin-contracts/contracts/interfaces/IERC1363.sol\":{\"keccak256\":\"0xd5ea07362ab630a6a3dee4285a74cf2377044ca2e4be472755ad64d7c5d4b69d\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://da5e832b40fc5c3145d3781e2e5fa60ac2052c9d08af7e300dc8ab80c4343100\",\"dweb:/ipfs/QmTzf7N5ZUdh5raqtzbM11yexiUoLC9z3Ws632MCuycq1d\"]},\"lib/openzeppelin-contracts/contracts/interfaces/IERC165.sol\":{\"keccak256\":\"0x0afcb7e740d1537b252cb2676f600465ce6938398569f09ba1b9ca240dde2dfc\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://1c299900ac4ec268d4570ecef0d697a3013cd11a6eb74e295ee3fbc945056037\",\"dweb:/ipfs/Qmab9owJoxcA7vJT5XNayCMaUR1qxqj1NDzzisduwaJMcZ\"]},\"lib/openzeppelin-contracts/contracts/interfaces/IERC20.sol\":{\"keccak256\":\"0x1a6221315ce0307746c2c4827c125d821ee796c74a676787762f4778671d4f44\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://1bb2332a7ee26dd0b0de9b7fe266749f54820c99ab6a3bcb6f7e6b751d47ee2d\",\"dweb:/ipfs/QmcRWpaBeCYkhy68PR3B4AgD7asuQk7PwkWxrvJbZcikLF\"]},\"lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol\":{\"keccak256\":\"0x74ed01eb66b923d0d0cfe3be84604ac04b76482a55f9dd655e1ef4d367f95bc2\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://5282825a626cfe924e504274b864a652b0023591fa66f06a067b25b51ba9b303\",\"dweb:/ipfs/QmeCfPykghhMc81VJTrHTC7sF6CRvaA1FXVq2pJhwYp1dV\"]},\"lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol\":{\"keccak256\":\"0x304d732678032a9781ae85c8f204c8fba3d3a5e31c02616964e75cfdc5049098\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://299ced486011781dc98f638059678323c03079fefae1482abaa2135b22fa92d0\",\"dweb:/ipfs/QmbZNbcPTBxNvwChavN2kkZZs7xHhYL7mv51KrxMhsMs3j\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol\":{\"keccak256\":\"0x8891738ffe910f0cf2da09566928589bf5d63f4524dd734fd9cedbac3274dd5c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://971f954442df5c2ef5b5ebf1eb245d7105d9fbacc7386ee5c796df1d45b21617\",\"dweb:/ipfs/QmadRjHbkicwqwwh61raUEapaVEtaLMcYbQZWs9gUkgj3u\"]},\"src/obligations/escrow/hook-based/IEscrowHook.sol\":{\"keccak256\":\"0xe4c07cf45e405453c3c561471444ac84aff687597dd70a7cea5ea2053b6f6d10\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://7e6a02ea0dadcdf5819f0c37f07c06b3c7a9428cdbeac6f7d6b514032fe331e4\",\"dweb:/ipfs/QmQhB7msNcUcXEJLUv35JyKsgpfZsXPvQhpEdPEbDCwSX3\"]},\"src/obligations/escrow/hook-based/hooks/ApprovedEscrowHook.sol\":{\"keccak256\":\"0x86ba6fc57effdb22f3475a4bdc033b23e3637866fc6d981a6208e1e9ff83f746\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://ba62b59e577e72e02e7d3bc0dcbb4c206a3071e78f34741973609c229b58eaef\",\"dweb:/ipfs/QmaWtsagF7yHQ3UcvGLdjw6Lv9uXe1xrB36pF6KegfHbXB\"]},\"src/obligations/escrow/hook-based/hooks/ERC20EscrowHook.sol\":{\"keccak256\":\"0x4e55d6cc07e0bc255a58681665c8cc02aa4529b86778c567900f2bd55aea0dd2\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://3ad0c0bc4734e2369a4ceac37a184bec93968cefbcd1ea6f2c92e9b7b1fbe50a\",\"dweb:/ipfs/QmTz8pyKTU9nTqWsobhLbQaRd8PTnw2bxobNc3FBV3c82Q\"]}},\"version\":1}",
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
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "from",
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
          "inputs": [
            {
              "internalType": "address",
              "name": "caller",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "escrow",
              "type": "address"
            }
          ],
          "type": "error",
          "name": "EscrowCallerMismatch"
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
              "name": "token",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "requested",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "available",
              "type": "uint256"
            }
          ],
          "type": "error",
          "name": "InsufficientDeposit"
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
              "name": "token",
              "type": "address"
            }
          ],
          "type": "error",
          "name": "NoDeposit"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "caller",
              "type": "address"
            }
          ],
          "type": "error",
          "name": "UnauthorizedEscrowCaller"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "UnexpectedNativeValue"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "escrow",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "bool",
              "name": "approved",
              "type": "bool",
              "indexed": false
            }
          ],
          "type": "event",
          "name": "EscrowApproval",
          "anonymous": false
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "escrow",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "approveEscrow"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "approvedEscrows",
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
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            }
          ],
          "stateMutability": "pure",
          "type": "function",
          "name": "decodeHookData",
          "outputs": [
            {
              "internalType": "struct ERC20EscrowHook.HookData",
              "name": "",
              "type": "tuple",
              "components": [
                {
                  "internalType": "address",
                  "name": "token",
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
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "deposits",
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
              "internalType": "struct ERC20EscrowHook.HookData",
              "name": "hookData",
              "type": "tuple",
              "components": [
                {
                  "internalType": "address",
                  "name": "token",
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
          "stateMutability": "pure",
          "type": "function",
          "name": "encodeHookData",
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
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "escrow",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "isEscrowApproved",
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
              "internalType": "bytes",
              "name": "",
              "type": "bytes"
            },
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
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "onAttest"
        },
        {
          "inputs": [
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            },
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "escrow",
              "type": "address"
            }
          ],
          "stateMutability": "payable",
          "type": "function",
          "name": "onLock"
        },
        {
          "inputs": [
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "struct Attestation",
              "name": "escrow",
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
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "onRelease"
        },
        {
          "inputs": [
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "struct Attestation",
              "name": "escrow",
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
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "onReturn"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "escrow",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "unapproveEscrow"
        }
      ],
      "devdoc": {
        "kind": "dev",
        "methods": {
          "onLock(bytes,address,address)": {
            "params": {
              "data": "Hook-specific parameters (e.g. token address, amount).",
              "escrow": "The escrow obligation contract that initiated the lock.",
              "from": "The address providing the assets."
            }
          },
          "onReturn(bytes,address,(bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))": {
            "params": {
              "data": "The same hook data that was passed to onLock.",
              "escrow": "The full escrow attestation.",
              "to": "The address to return assets to (original creator)."
            }
          }
        },
        "version": 1
      },
      "userdoc": {
        "kind": "user",
        "methods": {
          "approveEscrow(address)": {
            "notice": "Approves an escrow obligation contract to use this hook for the caller."
          },
          "approvedEscrows(address,address)": {
            "notice": "owner -> escrow obligation contract -> approved."
          },
          "deposits(address,address)": {
            "notice": "Tracks deposits: caller (obligation) → token → amount held."
          },
          "isEscrowApproved(address,address)": {
            "notice": "Returns whether `owner` approved `escrow` to use this hook."
          },
          "onLock(bytes,address,address)": {
            "notice": "Lock assets into escrow on behalf of `from`."
          },
          "onReturn(bytes,address,(bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))": {
            "notice": "Return escrowed assets to the original owner on expiry."
          },
          "unapproveEscrow(address)": {
            "notice": "Revokes a previously approved escrow obligation contract for the caller."
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
        "src/obligations/escrow/hook-based/hooks/ERC20EscrowHook.sol": "ERC20EscrowHook"
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
      "lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol": {
        "keccak256": "0x8891738ffe910f0cf2da09566928589bf5d63f4524dd734fd9cedbac3274dd5c",
        "urls": [
          "bzz-raw://971f954442df5c2ef5b5ebf1eb245d7105d9fbacc7386ee5c796df1d45b21617",
          "dweb:/ipfs/QmadRjHbkicwqwwh61raUEapaVEtaLMcYbQZWs9gUkgj3u"
        ],
        "license": "MIT"
      },
      "src/obligations/escrow/hook-based/IEscrowHook.sol": {
        "keccak256": "0xe4c07cf45e405453c3c561471444ac84aff687597dd70a7cea5ea2053b6f6d10",
        "urls": [
          "bzz-raw://7e6a02ea0dadcdf5819f0c37f07c06b3c7a9428cdbeac6f7d6b514032fe331e4",
          "dweb:/ipfs/QmQhB7msNcUcXEJLUv35JyKsgpfZsXPvQhpEdPEbDCwSX3"
        ],
        "license": "UNLICENSED"
      },
      "src/obligations/escrow/hook-based/hooks/ApprovedEscrowHook.sol": {
        "keccak256": "0x86ba6fc57effdb22f3475a4bdc033b23e3637866fc6d981a6208e1e9ff83f746",
        "urls": [
          "bzz-raw://ba62b59e577e72e02e7d3bc0dcbb4c206a3071e78f34741973609c229b58eaef",
          "dweb:/ipfs/QmaWtsagF7yHQ3UcvGLdjw6Lv9uXe1xrB36pF6KegfHbXB"
        ],
        "license": "UNLICENSED"
      },
      "src/obligations/escrow/hook-based/hooks/ERC20EscrowHook.sol": {
        "keccak256": "0x4e55d6cc07e0bc255a58681665c8cc02aa4529b86778c567900f2bd55aea0dd2",
        "urls": [
          "bzz-raw://3ad0c0bc4734e2369a4ceac37a184bec93968cefbcd1ea6f2c92e9b7b1fbe50a",
          "dweb:/ipfs/QmTz8pyKTU9nTqWsobhLbQaRd8PTnw2bxobNc3FBV3c82Q"
        ],
        "license": "UNLICENSED"
      }
    },
    "version": 1
  },
  "id": 142
} as const;
