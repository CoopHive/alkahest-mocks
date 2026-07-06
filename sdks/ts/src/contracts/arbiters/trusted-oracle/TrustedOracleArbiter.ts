export const abi = {
  "abi": [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "_eas",
          "type": "address",
          "internalType": "contract IEAS"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "arbitrate",
      "inputs": [
        {
          "name": "fulfillmentUid",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "demand",
          "type": "bytes",
          "internalType": "bytes"
        },
        {
          "name": "decision",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
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
          "internalType": "struct TrustedOracleArbiter.DemandData",
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
      "name": "requestArbitration",
      "inputs": [
        {
          "name": "fulfillmentUid",
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
          "name": "fulfillmentUid",
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
          "name": "decision",
          "type": "bool",
          "indexed": false,
          "internalType": "bool"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ArbitrationRequested",
      "inputs": [
        {
          "name": "fulfillmentUid",
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
      "type": "error",
      "name": "UnauthorizedArbitrationRequest",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x608034606f57601f61089738819003918201601f19168301916001600160401b03831184841017607357808492602094604052833981010312606f57516001600160a01b03811690819003606f575f80546001600160a01b03191691909117905560405161080f90816100888239f35b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe6080806040526004361015610012575f80fd5b5f3560e01c90816301ffc9a7146105e6575080636f6bd32b146103e2578063838a68d9146102df5780638da3721a146101115763fcb0c39014610053575f80fd5b3461010d57606036600319011261010d576004356024356001600160401b03811161010d576100869036906004016106d4565b906044359182151580930361010d576040516100b9816100ab602082019486866107c0565b03601f198101835282610698565b519020335f52600160205260405f20815f5260205260405f2060ff1981541660ff85161790556040519283527fbbe9caf8b56a2139bcb80c791657954e2e1ddfad0cf3725d0ce16838a46752d160203394a4005b5f80fd5b3461010d57606036600319011261010d576004356001600160401b03811161010d57610140600319823603011261010d576040519061014f8261064d565b806004013582526024810135602083015261016c6044820161073e565b604083015261017d6064820161073e565b606083015261018e6084820161073e565b608083015260a481013560a08301526101a960c48201610639565b60c08301526101ba60e48201610639565b60e0830152610104810135801515810361010d57610100830152610124810135906001600160401b03821161010d5760046101f892369201016106d4565b6101208201526024356001600160401b03811161010d5761021d9036906004016106d4565b90815182019160208184031261010d576020810151906001600160401b03821161010d570160408184031261010d57604051926102598461067d565b61026560208301610766565b845260408201516001600160401b03811161010d576100ab92602061029292816102ac950192010161077a565b9283602086015251926040519283916020830195866107c0565b5190209060018060a01b039051165f52600160205260405f20905f52602052602060ff60405f2054166040519015158152f35b3461010d57602036600319011261010d576004356001600160401b03811161010d573660238201121561010d5780600401356001600160401b03811161010d578101602481019136831161010d576060602060405161033d8161067d565b5f8152015260208183031261010d576024810135906001600160401b03821161010d5701906040908290031261010d576040519161037a8361067d565b61038660248301610639565b83526044820135916001600160401b03831161010d576103a992016024016106d4565b90602081019182526103de6040519283926020845260018060a01b03905116602084015251604080840152606083019061071a565b0390f35b3461010d57606036600319011261010d576024356001600160a01b038116906004359082900361010d576044356001600160401b03811161010d5761042b9036906004016106d4565b5f80546040516328c44a9960e21b8152600481018590529190829060249082906001600160a01b03165afa9081156105db575f916104e7575b5060e08101516001600160a01b031633141590816104cf575b506104c0576104bb7f5a87a605f49708d9bbadaa74684a5e23583375d9ed010cda2db60567202de60b9160405191829160208352602083019061071a565b0390a3005b63ff323ecb60e01b5f5260045ffd5b60c001516001600160a01b031633141590508461047d565b90503d805f833e6104f88183610698565b81019060208183031261010d578051906001600160401b03821161010d57016101408183031261010d576040519161052f8361064d565b815183526020820151602084015261054960408301610752565b604084015261055a60608301610752565b606084015261056b60808301610752565b608084015260a082015160a084015261058660c08301610766565b60c084015261059760e08301610766565b60e0840152610100820151801515810361010d576101008401526101208201516001600160401b03811161010d576105cf920161077a565b61012082015284610464565b6040513d5f823e3d90fd5b3461010d57602036600319011261010d576004359063ffffffff60e01b821680920361010d576020916346d1b90d60e11b8114908115610628575b5015158152f35b6301ffc9a760e01b14905083610621565b35906001600160a01b038216820361010d57565b61014081019081106001600160401b0382111761066957604052565b634e487b7160e01b5f52604160045260245ffd5b604081019081106001600160401b0382111761066957604052565b90601f801991011681019081106001600160401b0382111761066957604052565b6001600160401b03811161066957601f01601f191660200190565b81601f8201121561010d578035906106eb826106b9565b926106f96040519485610698565b8284526020838301011161010d57815f926020809301838601378301015290565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b35906001600160401b038216820361010d57565b51906001600160401b038216820361010d57565b51906001600160a01b038216820361010d57565b81601f8201121561010d57805190610791826106b9565b9261079f6040519485610698565b8284526020838301011161010d57815f9260208093018386015e8301015290565b602092839282528051928391018483015e01015f81529056fea264697066735822122090cb8106e6711a647e211ab4fdd87950baa709976d3828503b17cf494e009fe164736f6c634300081b0033",
    "sourceMap": "585:2899:123:-:0;;;;;;;;;;;;;-1:-1:-1;;585:2899:123;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;;-1:-1:-1;585:2899:123;;-1:-1:-1;;;;;;585:2899:123;;;;;;;;;;;;;;;;;-1:-1:-1;585:2899:123;;;;;;-1:-1:-1;585:2899:123;;;;;-1:-1:-1;585:2899:123",
    "linkReferences": {}
  },
  "deployedBytecode": {
    "object": "0x6080806040526004361015610012575f80fd5b5f3560e01c90816301ffc9a7146105e6575080636f6bd32b146103e2578063838a68d9146102df5780638da3721a146101115763fcb0c39014610053575f80fd5b3461010d57606036600319011261010d576004356024356001600160401b03811161010d576100869036906004016106d4565b906044359182151580930361010d576040516100b9816100ab602082019486866107c0565b03601f198101835282610698565b519020335f52600160205260405f20815f5260205260405f2060ff1981541660ff85161790556040519283527fbbe9caf8b56a2139bcb80c791657954e2e1ddfad0cf3725d0ce16838a46752d160203394a4005b5f80fd5b3461010d57606036600319011261010d576004356001600160401b03811161010d57610140600319823603011261010d576040519061014f8261064d565b806004013582526024810135602083015261016c6044820161073e565b604083015261017d6064820161073e565b606083015261018e6084820161073e565b608083015260a481013560a08301526101a960c48201610639565b60c08301526101ba60e48201610639565b60e0830152610104810135801515810361010d57610100830152610124810135906001600160401b03821161010d5760046101f892369201016106d4565b6101208201526024356001600160401b03811161010d5761021d9036906004016106d4565b90815182019160208184031261010d576020810151906001600160401b03821161010d570160408184031261010d57604051926102598461067d565b61026560208301610766565b845260408201516001600160401b03811161010d576100ab92602061029292816102ac950192010161077a565b9283602086015251926040519283916020830195866107c0565b5190209060018060a01b039051165f52600160205260405f20905f52602052602060ff60405f2054166040519015158152f35b3461010d57602036600319011261010d576004356001600160401b03811161010d573660238201121561010d5780600401356001600160401b03811161010d578101602481019136831161010d576060602060405161033d8161067d565b5f8152015260208183031261010d576024810135906001600160401b03821161010d5701906040908290031261010d576040519161037a8361067d565b61038660248301610639565b83526044820135916001600160401b03831161010d576103a992016024016106d4565b90602081019182526103de6040519283926020845260018060a01b03905116602084015251604080840152606083019061071a565b0390f35b3461010d57606036600319011261010d576024356001600160a01b038116906004359082900361010d576044356001600160401b03811161010d5761042b9036906004016106d4565b5f80546040516328c44a9960e21b8152600481018590529190829060249082906001600160a01b03165afa9081156105db575f916104e7575b5060e08101516001600160a01b031633141590816104cf575b506104c0576104bb7f5a87a605f49708d9bbadaa74684a5e23583375d9ed010cda2db60567202de60b9160405191829160208352602083019061071a565b0390a3005b63ff323ecb60e01b5f5260045ffd5b60c001516001600160a01b031633141590508461047d565b90503d805f833e6104f88183610698565b81019060208183031261010d578051906001600160401b03821161010d57016101408183031261010d576040519161052f8361064d565b815183526020820151602084015261054960408301610752565b604084015261055a60608301610752565b606084015261056b60808301610752565b608084015260a082015160a084015261058660c08301610766565b60c084015261059760e08301610766565b60e0840152610100820151801515810361010d576101008401526101208201516001600160401b03811161010d576105cf920161077a565b61012082015284610464565b6040513d5f823e3d90fd5b3461010d57602036600319011261010d576004359063ffffffff60e01b821680920361010d576020916346d1b90d60e11b8114908115610628575b5015158152f35b6301ffc9a760e01b14905083610621565b35906001600160a01b038216820361010d57565b61014081019081106001600160401b0382111761066957604052565b634e487b7160e01b5f52604160045260245ffd5b604081019081106001600160401b0382111761066957604052565b90601f801991011681019081106001600160401b0382111761066957604052565b6001600160401b03811161066957601f01601f191660200190565b81601f8201121561010d578035906106eb826106b9565b926106f96040519485610698565b8284526020838301011161010d57815f926020809301838601378301015290565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b35906001600160401b038216820361010d57565b51906001600160401b038216820361010d57565b51906001600160a01b038216820361010d57565b81601f8201121561010d57805190610791826106b9565b9261079f6040519485610698565b8284526020838301011161010d57815f9260208093018386015e8301015290565b602092839282528051928391018483015e01015f81529056fea264697066735822122090cb8106e6711a647e211ab4fdd87950baa709976d3828503b17cf494e009fe164736f6c634300081b0033",
    "sourceMap": "585:2899:123:-:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;585:2899:123;;;;;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;2129:40;;;585:2899;2129:40;;;;;;:::i;:::-;;585:2899;;2129:40;;;;;;:::i;:::-;585:2899;2119:51;;2190:10;585:2899;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2240:66;585:2899;2190:10;2240:66;;585:2899;;;;;;;;;;;-1:-1:-1;;585:2899:123;;;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;;;;;;:::i;:::-;;;;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;;;;;:::i;:::-;;;;3087:32;;585:2899;;;;;;;;;3087:32;;585:2899;;-1:-1:-1;;;;;585:2899:123;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;:::i;:::-;;;;;;;-1:-1:-1;;;;;585:2899:123;;;;3161:47;3087:32;585:2899;;3087:32;;3161:47;3087:32;;585:2899;;;;:::i;:::-;;;;;;;;;;;3161:47;;;585:2899;3161:47;;;;;:::i;:::-;585:2899;3151:58;;585:2899;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;585:2899:123;;;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;;;;;;;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;:::i;:::-;;;;;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;-1:-1:-1;;585:2899:123;;;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;;;;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;;;;;:::i;:::-;;;;;;-1:-1:-1;;;2559:34:123;;585:2899;2559:34;;585:2899;;;;;;;;;;;-1:-1:-1;;;;;585:2899:123;2559:34;;;;;;;585:2899;2559:34;;;585:2899;-1:-1:-1;585:2899:123;2607:20;;585:2899;-1:-1:-1;;;;;585:2899:123;2631:10;2607:34;;;;:73;;585:2899;2603:143;;;585:2899;2761:52;585:2899;;;;;;;;;;;;;;:::i;:::-;2761:52;;;585:2899;2603:143;2703:32;;;585:2899;2703:32;585:2899;;2703:32;2607:73;2645:21;;585:2899;-1:-1:-1;;;;;585:2899:123;2631:10;2645:35;;;-1:-1:-1;2607:73:123;;;2559:34;;;;;585:2899;2559:34;;;;;;:::i;:::-;;;585:2899;;;;;;;;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;;:::i;:::-;;;;;2559:34;;;;585:2899;;;;;;;;;;;;;;;-1:-1:-1;;585:2899:123;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;573:41:88;;;:81;;;;585:2899:123;;;;;;;573:81:88;-1:-1:-1;;;829:40:77;;-1:-1:-1;573:81:88;;;585:2899:123;;;-1:-1:-1;;;;;585:2899:123;;;;;;:::o;:::-;;;;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;:::o;:::-;;;;-1:-1:-1;585:2899:123;;;;;-1:-1:-1;585:2899:123;;;;;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;:::o;:::-;;;;;;;;;;;;;-1:-1:-1;;;;;585:2899:123;;;;;;;:::o;:::-;-1:-1:-1;;;;;585:2899:123;;;;;;-1:-1:-1;;585:2899:123;;;;:::o;:::-;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;-1:-1:-1;585:2899:123;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;585:2899:123;;;;;;;;-1:-1:-1;;585:2899:123;;;;:::o;:::-;;;-1:-1:-1;;;;;585:2899:123;;;;;;:::o;:::-;;;-1:-1:-1;;;;;585:2899:123;;;;;;:::o;:::-;;;-1:-1:-1;;;;;585:2899:123;;;;;;:::o;:::-;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;-1:-1:-1;585:2899:123;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;-1:-1:-1;585:2899:123;;;:::o",
    "linkReferences": {}
  },
  "methodIdentifiers": {
    "arbitrate(bytes32,bytes,bool)": "fcb0c390",
    "check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)": "8da3721a",
    "decodeDemandData(bytes)": "838a68d9",
    "requestArbitration(bytes32,address,bytes)": "6f6bd32b",
    "supportsInterface(bytes4)": "01ffc9a7"
  },
  "rawMetadata": "{\"compiler\":{\"version\":\"0.8.27+commit.40a35a09\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[{\"internalType\":\"contract IEAS\",\"name\":\"_eas\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"UnauthorizedArbitrationRequest\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"decisionKey\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"fulfillmentUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"oracle\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"bool\",\"name\":\"decision\",\"type\":\"bool\"}],\"name\":\"ArbitrationMade\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"fulfillmentUid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"oracle\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"}],\"name\":\"ArbitrationRequested\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"fulfillmentUid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bool\",\"name\":\"decision\",\"type\":\"bool\"}],\"name\":\"arbitrate\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"fulfillment\",\"type\":\"tuple\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"check\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"decodeDemandData\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"oracle\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct TrustedOracleArbiter.DemandData\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"fulfillmentUid\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"oracle\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"}],\"name\":\"requestArbitration\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"}],\"devdoc\":{\"details\":\"Oracle decisions are keyed by `(fulfillment.uid, demand.data)`, allowing the same decision to be reused wherever that demand context is valid.\",\"kind\":\"dev\",\"methods\":{\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"params\":{\"demand\":\"Arbiter-specific demand data encoded by the escrow creator.\",\"escrowUid\":\"The UID of the escrow attestation being fulfilled.\",\"fulfillment\":\"The EAS attestation being used as fulfillment.\"}},\"constructor\":{\"params\":{\"_eas\":\"EAS contract used to load fulfillment attestations.\"}},\"supportsInterface(bytes4)\":{\"details\":\"Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section] to learn more about how these ids are created. This function call must use less than 30 000 gas.\"}},\"title\":\"TrustedOracleArbiter\",\"version\":1},\"userdoc\":{\"errors\":{\"UnauthorizedArbitrationRequest()\":[{\"notice\":\"Raised when a caller that is neither attester nor recipient requests arbitration.\"}]},\"events\":{\"ArbitrationMade(bytes32,bytes32,address,bool)\":{\"notice\":\"Emitted when an oracle records a decision for a fulfillment and context.\"},\"ArbitrationRequested(bytes32,address,bytes)\":{\"notice\":\"Emitted by an attestation participant to request oracle review.\"}},\"kind\":\"user\",\"methods\":{\"arbitrate(bytes32,bytes,bool)\":{\"notice\":\"Records the caller's oracle decision for a fulfillment and demand context.\"},\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"notice\":\"Returns true when `fulfillment` satisfies `demand` for `escrowUid`.\"},\"decodeDemandData(bytes)\":{\"notice\":\"Decodes ABI-encoded trusted-oracle demand data.\"},\"requestArbitration(bytes32,address,bytes)\":{\"notice\":\"Emits an arbitration request if the caller is the fulfillment attester or recipient.\"}},\"notice\":\"Defers fulfillment acceptance to a trusted oracle address selected in demand data.\",\"version\":1}},\"settings\":{\"compilationTarget\":{\"src/arbiters/trusted-oracle/TrustedOracleArbiter.sol\":\"TrustedOracleArbiter\"},\"evmVersion\":\"prague\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[\":@eas/=lib/eas-contracts/contracts/\",\":@erc8004/=lib/erc-8004-contracts/contracts/\",\":@openzeppelin/=lib/openzeppelin-contracts/\",\":@src/=src/\",\":@test/=test/\",\":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/\",\":eas-contracts/=lib/eas-contracts/contracts/\",\":erc-8004-contracts/=lib/erc-8004-contracts/contracts/\",\":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/\",\":eth-gas-reporter/=lib/eas-contracts/node_modules/eth-gas-reporter/\",\":forge-std/=lib/forge-std/src/\",\":halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/\",\":hardhat-deploy/=lib/eas-contracts/node_modules/hardhat-deploy/\",\":hardhat/=lib/eas-contracts/node_modules/hardhat/\",\":openzeppelin-contracts/=lib/openzeppelin-contracts/\"],\"viaIR\":true},\"sources\":{\"lib/eas-contracts/contracts/Common.sol\":{\"keccak256\":\"0x957bd2e6d0d6d637f86208b135c29fbaf4412cb08e5e7a61ede16b80561bf685\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://da1dc9aedbb1d4d39c46c2235918d3adfbc5741dd34a46010cf425d134e7936d\",\"dweb:/ipfs/QmWUk6bXnLaghS2riF3GTFEeURCzgYFMA5woa6AsgPwEgc\"]},\"lib/eas-contracts/contracts/IEAS.sol\":{\"keccak256\":\"0xdad0674defce04905dc7935f2756d6c477a6e876c0b1b7094b112a862f164c12\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://49e448c26c08952df034692d2ab3519dd40a1ebbeae4ce68b294567441933880\",\"dweb:/ipfs/QmWHcudjskUSCjgqsNWE65LVfWvcYB2vBn8RB1SmzvRLNR\"]},\"lib/eas-contracts/contracts/ISchemaRegistry.sol\":{\"keccak256\":\"0xea97dcd36a0c422169cbaac06698249e199049b627c16bff93fb8ab829058754\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://d453a929ef64a69cd31195ec2ee5ed1193bfa29f633e13c960e92154c37ad158\",\"dweb:/ipfs/QmXs1Z3njbHs2EMgHonrZDfcwdog4kozHY5tYNrhZK5yqz\"]},\"lib/eas-contracts/contracts/ISemver.sol\":{\"keccak256\":\"0x04a67939b4e1a8d0a51101b8f69f8882930bbdc66319f38023828625b5d1ff18\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://3dd543fa0e33cef1ea757627f9c2a10a66ee1ce17aa9087f437c5b53a903c7f0\",\"dweb:/ipfs/QmXsy6UsGBzF9zPCCjmiwPpCcX3tHqU13TmR67B69tKnR6\"]},\"lib/eas-contracts/contracts/resolver/ISchemaResolver.sol\":{\"keccak256\":\"0xb7d1961ed928c620cddf35c2bf46845b10828bc5d73145214630202ed355b6bb\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://cf1cabacfb15c9bace8280b540b52e5aa440e1b4eba675f9782c34ce0f03902f\",\"dweb:/ipfs/QmakYcK4xbrijzvoaBCmBJK6HeaBqbXxWKtDQ1z62aXwCR\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/ERC165.sol\":{\"keccak256\":\"0x2d9dc2fe26180f74c11c13663647d38e259e45f95eb88f57b61d2160b0109d3e\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://81233d1f98060113d9922180bb0f14f8335856fe9f339134b09335e9f678c377\",\"dweb:/ipfs/QmWh6R35SarhAn4z2wH8SU456jJSYL2FgucfTFgbHJJN4E\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol\":{\"keccak256\":\"0x8891738ffe910f0cf2da09566928589bf5d63f4524dd734fd9cedbac3274dd5c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://971f954442df5c2ef5b5ebf1eb245d7105d9fbacc7386ee5c796df1d45b21617\",\"dweb:/ipfs/QmadRjHbkicwqwwh61raUEapaVEtaLMcYbQZWs9gUkgj3u\"]},\"src/BaseArbiter.sol\":{\"keccak256\":\"0x27fa97834bcd6e592f3b534e64859b208c688363d33fb9b62436d009ffff3ed1\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://b61ac6195ae644325adf77fdb301651cddfca4b63d9db5123ee075869f3784aa\",\"dweb:/ipfs/QmYRu5hER8gaMjqyY5bDV9EAwVN12CbS3Z2bW8dLp7sPSE\"]},\"src/IArbiter.sol\":{\"keccak256\":\"0x00f3f5d8460c738eff4a776cf309efe38342fcc951abfe97d1c2e285acb1e330\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://7201a176f3d5c3d01ca13bbcd9ef5587effe8fabf20e0b8f81f2d6ee362269b9\",\"dweb:/ipfs/QmXn9aSvoGPQuNTxe3mM47RNQ1bfYCEczQCYsDDM9ohc8M\"]},\"src/arbiters/trusted-oracle/TrustedOracleArbiter.sol\":{\"keccak256\":\"0x66de23c404142901a93693a172bd85c9146b602508894776919acfe4417ca482\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://89280a0bfab2b5cf5985d7655975a04866b40fc1c8e98ea2db7beb44dae7f3bd\",\"dweb:/ipfs/QmQHF8xZqmBTMX3zxVaGuk7F9M28voR8EH4K9rNAXxJgpQ\"]},\"src/libraries/ArbiterUtils.sol\":{\"keccak256\":\"0xb87e2bfb9c7292daf6426fbedc09c8683b92841d1b92e7359c0ff94d42be632f\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://3acf498c3c59891d76db768ea57d8f7f6b4010dcbaf44a5f93d95d72f0b12441\",\"dweb:/ipfs/QmVbkioM8dWwYxqatm1dyo9PRFNZ6c7Kbang7pozbnyS7j\"]}},\"version\":1}",
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
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
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
              "name": "decisionKey",
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
              "name": "oracle",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "bool",
              "name": "decision",
              "type": "bool",
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
              "name": "fulfillmentUid",
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
              "name": "fulfillmentUid",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "demand",
              "type": "bytes"
            },
            {
              "internalType": "bool",
              "name": "decision",
              "type": "bool"
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
              "internalType": "struct TrustedOracleArbiter.DemandData",
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
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "fulfillmentUid",
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
          "constructor": {
            "params": {
              "_eas": "EAS contract used to load fulfillment attestations."
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
          "arbitrate(bytes32,bytes,bool)": {
            "notice": "Records the caller's oracle decision for a fulfillment and demand context."
          },
          "check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)": {
            "notice": "Returns true when `fulfillment` satisfies `demand` for `escrowUid`."
          },
          "decodeDemandData(bytes)": {
            "notice": "Decodes ABI-encoded trusted-oracle demand data."
          },
          "requestArbitration(bytes32,address,bytes)": {
            "notice": "Emits an arbitration request if the caller is the fulfillment attester or recipient."
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
        "src/arbiters/trusted-oracle/TrustedOracleArbiter.sol": "TrustedOracleArbiter"
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
      "lib/eas-contracts/contracts/resolver/ISchemaResolver.sol": {
        "keccak256": "0xb7d1961ed928c620cddf35c2bf46845b10828bc5d73145214630202ed355b6bb",
        "urls": [
          "bzz-raw://cf1cabacfb15c9bace8280b540b52e5aa440e1b4eba675f9782c34ce0f03902f",
          "dweb:/ipfs/QmakYcK4xbrijzvoaBCmBJK6HeaBqbXxWKtDQ1z62aXwCR"
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
      "src/arbiters/trusted-oracle/TrustedOracleArbiter.sol": {
        "keccak256": "0x66de23c404142901a93693a172bd85c9146b602508894776919acfe4417ca482",
        "urls": [
          "bzz-raw://89280a0bfab2b5cf5985d7655975a04866b40fc1c8e98ea2db7beb44dae7f3bd",
          "dweb:/ipfs/QmQHF8xZqmBTMX3zxVaGuk7F9M28voR8EH4K9rNAXxJgpQ"
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
  "id": 123
} as const;
