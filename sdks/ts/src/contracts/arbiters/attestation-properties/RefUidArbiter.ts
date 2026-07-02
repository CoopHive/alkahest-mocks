export const abi = {
  "abi": [
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
          "internalType": "struct RefUidArbiter.DemandData",
          "components": [
            {
              "name": "refUID",
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
      "type": "error",
      "name": "RefUidMismatched",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x6080806040523460155761036d908161001a8239f35b5f80fdfe6080806040526004361015610012575f80fd5b5f3560e01c90816301ffc9a71461023357508063838a68d9146101b557638da3721a1461003d575f80fd5b3461019d57606036600319011261019d5760043567ffffffffffffffff811161019d57610140600319823603011261019d57604051610140810181811067ffffffffffffffff8211176101a15760405281600401358152602482013560208201526100aa604483016102a6565b60408201526100bb606483016102a6565b60608201526100cc608483016102a6565b608082015260a081019160a481013583526100e960c482016102bb565b60c08301526100fa60e482016102bb565b60e0830152610104810135801515810361019d5761010083015261012481013567ffffffffffffffff811161019d5761012091600461013c92369201016102cf565b91015260243567ffffffffffffffff811161019d5761015f9036906004016102cf565b9060208280518101031261019d576020610177610286565b920151809252510361018e57602060405160018152f35b635f11c88560e11b5f5260045ffd5b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b3461019d57602036600319011261019d5760043567ffffffffffffffff811161019d573660238201121561019d57806004013567ffffffffffffffff811161019d57810136602482011161019d576020905f61020f610286565b528290031261019d576020906024610225610286565b910135809152604051908152f35b3461019d57602036600319011261019d576004359063ffffffff60e01b821680920361019d576020916346d1b90d60e11b8114908115610275575b5015158152f35b6301ffc9a760e01b1490508361026e565b604051906020820182811067ffffffffffffffff8211176101a157604052565b359067ffffffffffffffff8216820361019d57565b35906001600160a01b038216820361019d57565b81601f8201121561019d5780359067ffffffffffffffff82116101a15760405192601f8301601f19908116603f0116840167ffffffffffffffff8111858210176101a1576040528284526020838301011161019d57815f92602080930183860137830101529056fea26469706673582212202218da869e7b72a8a1de0bdc2e88e808217f20bc4e60608a11270b6c0c5395a864736f6c634300081b0033",
    "sourceMap": "358:849:104:-:0;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  },
  "deployedBytecode": {
    "object": "0x6080806040526004361015610012575f80fd5b5f3560e01c90816301ffc9a71461023357508063838a68d9146101b557638da3721a1461003d575f80fd5b3461019d57606036600319011261019d5760043567ffffffffffffffff811161019d57610140600319823603011261019d57604051610140810181811067ffffffffffffffff8211176101a15760405281600401358152602482013560208201526100aa604483016102a6565b60408201526100bb606483016102a6565b60608201526100cc608483016102a6565b608082015260a081019160a481013583526100e960c482016102bb565b60c08301526100fa60e482016102bb565b60e0830152610104810135801515810361019d5761010083015261012481013567ffffffffffffffff811161019d5761012091600461013c92369201016102cf565b91015260243567ffffffffffffffff811161019d5761015f9036906004016102cf565b9060208280518101031261019d576020610177610286565b920151809252510361018e57602060405160018152f35b635f11c88560e11b5f5260045ffd5b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b3461019d57602036600319011261019d5760043567ffffffffffffffff811161019d573660238201121561019d57806004013567ffffffffffffffff811161019d57810136602482011161019d576020905f61020f610286565b528290031261019d576020906024610225610286565b910135809152604051908152f35b3461019d57602036600319011261019d576004359063ffffffff60e01b821680920361019d576020916346d1b90d60e11b8114908115610275575b5015158152f35b6301ffc9a760e01b1490508361026e565b604051906020820182811067ffffffffffffffff8211176101a157604052565b359067ffffffffffffffff8216820361019d57565b35906001600160a01b038216820361019d57565b81601f8201121561019d5780359067ffffffffffffffff82116101a15760405192601f8301601f19908116603f0116840167ffffffffffffffff8111858210176101a1576040528284526020838301011161019d57815f92602080930183860137830101529056fea26469706673582212202218da869e7b72a8a1de0bdc2e88e808217f20bc4e60608a11270b6c0c5395a864736f6c634300081b0033",
    "sourceMap": "358:849:104:-:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;358:849:104;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;864:32;;358:849;;;;;;;:::i;:::-;864:32;;358:849;;;;;910:36;906:67;;358:849;;;;;;;906:67;955:18;;;358:849;955:18;358:849;;955:18;358:849;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;358:849:104;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;-1:-1:-1;;358:849:104;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;573:41:88;;;:81;;;;358:849:104;;;;;;;573:81:88;-1:-1:-1;;;829:40:77;;-1:-1:-1;573:81:88;;;358:849:104;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;:::o;:::-;;;-1:-1:-1;;;;;358:849:104;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;358:849:104;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;358:849:104;;;;;;;;;;;;;;:::o",
    "linkReferences": {}
  },
  "methodIdentifiers": {
    "check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)": "8da3721a",
    "decodeDemandData(bytes)": "838a68d9",
    "supportsInterface(bytes4)": "01ffc9a7"
  },
  "rawMetadata": "{\"compiler\":{\"version\":\"0.8.27+commit.40a35a09\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[],\"name\":\"RefUidMismatched\",\"type\":\"error\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"fulfillment\",\"type\":\"tuple\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"check\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"decodeDemandData\",\"outputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"}],\"internalType\":\"struct RefUidArbiter.DemandData\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"}],\"devdoc\":{\"kind\":\"dev\",\"methods\":{\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"params\":{\"demand\":\"Arbiter-specific demand data encoded by the escrow creator.\",\"escrowUid\":\"The UID of the escrow attestation being fulfilled.\",\"fulfillment\":\"The EAS attestation being used as fulfillment.\"}},\"supportsInterface(bytes4)\":{\"details\":\"Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section] to learn more about how these ids are created. This function call must use less than 30 000 gas.\"}},\"title\":\"RefUidArbiter\",\"version\":1},\"userdoc\":{\"kind\":\"user\",\"methods\":{\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"notice\":\"Returns true when `fulfillment` satisfies `demand` for `escrowUid`.\"},\"decodeDemandData(bytes)\":{\"notice\":\"Decodes ABI-encoded refUID demand data.\"}},\"notice\":\"Accepts fulfillments with a specific EAS `refUID`.\",\"version\":1}},\"settings\":{\"compilationTarget\":{\"src/arbiters/attestation-properties/RefUidArbiter.sol\":\"RefUidArbiter\"},\"evmVersion\":\"prague\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[\":@eas/=lib/eas-contracts/contracts/\",\":@erc8004/=lib/erc-8004-contracts/contracts/\",\":@openzeppelin/=lib/openzeppelin-contracts/\",\":@src/=src/\",\":@test/=test/\",\":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/\",\":eas-contracts/=lib/eas-contracts/contracts/\",\":erc-8004-contracts/=lib/erc-8004-contracts/contracts/\",\":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/\",\":eth-gas-reporter/=lib/eas-contracts/node_modules/eth-gas-reporter/\",\":forge-std/=lib/forge-std/src/\",\":halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/\",\":hardhat-deploy/=lib/eas-contracts/node_modules/hardhat-deploy/\",\":hardhat/=lib/eas-contracts/node_modules/hardhat/\",\":openzeppelin-contracts/=lib/openzeppelin-contracts/\"],\"viaIR\":true},\"sources\":{\"lib/eas-contracts/contracts/Common.sol\":{\"keccak256\":\"0x957bd2e6d0d6d637f86208b135c29fbaf4412cb08e5e7a61ede16b80561bf685\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://da1dc9aedbb1d4d39c46c2235918d3adfbc5741dd34a46010cf425d134e7936d\",\"dweb:/ipfs/QmWUk6bXnLaghS2riF3GTFEeURCzgYFMA5woa6AsgPwEgc\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/ERC165.sol\":{\"keccak256\":\"0x2d9dc2fe26180f74c11c13663647d38e259e45f95eb88f57b61d2160b0109d3e\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://81233d1f98060113d9922180bb0f14f8335856fe9f339134b09335e9f678c377\",\"dweb:/ipfs/QmWh6R35SarhAn4z2wH8SU456jJSYL2FgucfTFgbHJJN4E\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol\":{\"keccak256\":\"0x8891738ffe910f0cf2da09566928589bf5d63f4524dd734fd9cedbac3274dd5c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://971f954442df5c2ef5b5ebf1eb245d7105d9fbacc7386ee5c796df1d45b21617\",\"dweb:/ipfs/QmadRjHbkicwqwwh61raUEapaVEtaLMcYbQZWs9gUkgj3u\"]},\"src/BaseArbiter.sol\":{\"keccak256\":\"0x27fa97834bcd6e592f3b534e64859b208c688363d33fb9b62436d009ffff3ed1\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://b61ac6195ae644325adf77fdb301651cddfca4b63d9db5123ee075869f3784aa\",\"dweb:/ipfs/QmYRu5hER8gaMjqyY5bDV9EAwVN12CbS3Z2bW8dLp7sPSE\"]},\"src/IArbiter.sol\":{\"keccak256\":\"0x00f3f5d8460c738eff4a776cf309efe38342fcc951abfe97d1c2e285acb1e330\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://7201a176f3d5c3d01ca13bbcd9ef5587effe8fabf20e0b8f81f2d6ee362269b9\",\"dweb:/ipfs/QmXn9aSvoGPQuNTxe3mM47RNQ1bfYCEczQCYsDDM9ohc8M\"]},\"src/arbiters/attestation-properties/RefUidArbiter.sol\":{\"keccak256\":\"0xf9c1d227d57a7146343274a7d83891994941ce758fd1d54d9110c50ac8514933\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://4c76641b9e6d2db6897f192ee15a5b11915c8de91d4296c4baaba3bea973c310\",\"dweb:/ipfs/QmQ731d2NHvBdmHL7rNkVm61rFCVeipr4LTzXc2722XAhM\"]},\"src/libraries/ArbiterUtils.sol\":{\"keccak256\":\"0xb87e2bfb9c7292daf6426fbedc09c8683b92841d1b92e7359c0ff94d42be632f\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://3acf498c3c59891d76db768ea57d8f7f6b4010dcbaf44a5f93d95d72f0b12441\",\"dweb:/ipfs/QmVbkioM8dWwYxqatm1dyo9PRFNZ6c7Kbang7pozbnyS7j\"]}},\"version\":1}",
  "metadata": {
    "compiler": {
      "version": "0.8.27+commit.40a35a09"
    },
    "language": "Solidity",
    "output": {
      "abi": [
        {
          "inputs": [],
          "type": "error",
          "name": "RefUidMismatched"
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
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "pure",
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
              "internalType": "struct RefUidArbiter.DemandData",
              "name": "",
              "type": "tuple",
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "refUID",
                  "type": "bytes32"
                }
              ]
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
          }
        },
        "version": 1
      },
      "userdoc": {
        "kind": "user",
        "methods": {
          "check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)": {
            "notice": "Returns true when `fulfillment` satisfies `demand` for `escrowUid`."
          },
          "decodeDemandData(bytes)": {
            "notice": "Decodes ABI-encoded refUID demand data."
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
        "src/arbiters/attestation-properties/RefUidArbiter.sol": "RefUidArbiter"
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
      "src/BaseArbiter.sol": {
        "keccak256": "0x27fa97834bcd6e592f3b534e64859b208c688363d33fb9b62436d009ffff3ed1",
        "urls": [
          "bzz-raw://b61ac6195ae644325adf77fdb301651cddfca4b63d9db5123ee075869f3784aa",
          "dweb:/ipfs/QmYRu5hER8gaMjqyY5bDV9EAwVN12CbS3Z2bW8dLp7sPSE"
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
      "src/arbiters/attestation-properties/RefUidArbiter.sol": {
        "keccak256": "0xf9c1d227d57a7146343274a7d83891994941ce758fd1d54d9110c50ac8514933",
        "urls": [
          "bzz-raw://4c76641b9e6d2db6897f192ee15a5b11915c8de91d4296c4baaba3bea973c310",
          "dweb:/ipfs/QmQ731d2NHvBdmHL7rNkVm61rFCVeipr4LTzXc2722XAhM"
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
      }
    },
    "version": 1
  },
  "id": 104
} as const;
