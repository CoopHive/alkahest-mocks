export const abi = {
  "abi": [
    {
      "type": "constructor",
      "inputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getSchema",
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
      "name": "register",
      "inputs": [
        {
          "name": "schema",
          "type": "string",
          "internalType": "string"
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
      "name": "Registered",
      "inputs": [
        {
          "name": "uid",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "registerer",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "schema",
          "type": "tuple",
          "indexed": false,
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
      "anonymous": false
    },
    {
      "type": "error",
      "name": "AlreadyExists",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x60e08060405234603e576001608052600360a0525f60c0526107d29081610043823960805181610458015260a05181610483015260c051816104ae0152f35b5f80fdfe60806040526004361015610011575f80fd5b5f3560e01c806354fd4d501461043957806360d7a278146101625763a2ea7c6e1461003a575f80fd5b3461015e57602036600319011261015e5760608060405161005a8161059d565b5f81525f60208201525f604082015201526004355f525f60205260405f206002604051916100878361059d565b8054835260ff600182015460018060a01b038116602086015260a01c161515604084015201906040515f928054906100be826105f7565b808452916001811690811561013657506001146100fc575b50506100e7816100f89403826105b9565b60608201526040519182918261055b565b0390f35b9093505f5260205f205f905b8482106101205750810160200192506100e7816100d6565b6001816020925483858701015201910190610108565b6100f8965084925060209150926100e79360ff191682840152151560051b82010194506100d6565b5f80fd5b3461015e57606036600319011261015e5760043567ffffffffffffffff811161015e573660238201121561015e57806004013567ffffffffffffffff811161015e57366024828401011161015e576024356001600160a01b038116919082900361015e576044359182151580930361015e57604051916101e18361059d565b5f835260208301918252604083019384525f60206101fe836105db565b9261020c60405194856105b9565b80845280602483860199018937830101526060830194818652610275601560208551938851151594604051958692848401985180918a5e8301916bffffffffffffffffffffffff199060601b168483015260f81b60348201520301600a198101845201826105b9565b51902092835f525f60205260405f205461042a57600291848452845f525f60205260405f209184518355600183019160018060a01b0390511682549160ff60a01b9051151560a01b16916affffffffffffffffffffff60a81b161717905501925192835167ffffffffffffffff8111610416576102f282546105f7565b601f81116103d1575b50806020958690601f831160011461036f575f92610364575b50508160011b915f199060031b1c19161790555b817fd0b86852e21f9e5fa4bc3b0cff9757ffe243d50c4b43968a42202153d651ea5e6040518061035933958261055b565b0390a3604051908152f35b015190508680610314565b5f8581528281209350601f198516905b8181106103ba57509084600195949392106103a2575b505050811b019055610328565b01515f1960f88460031b161c19169055868080610395565b92938960018192878601518155019501930161037f565b825f5260205f20601f830160051c8101916020841061040c575b601f0160051c01905b81811061040157506102fb565b5f81556001016103f4565b90915081906103eb565b634e487b7160e01b5f52604160045260245ffd5b63119b4fd360e11b5f5260045ffd5b3461015e575f36600319011261015e576100f86020610527600161047c7f000000000000000000000000000000000000000000000000000000000000000061062f565b81846104a77f000000000000000000000000000000000000000000000000000000000000000061062f565b81806104d27f000000000000000000000000000000000000000000000000000000000000000061062f565b9260405199878b985191829101848a015e870190601760f91b83830152805192839101602183015e010190601760f91b84830152805192839101600283015e01015f838201520301601f1981018352826105b9565b6040519182916020835260208301905b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b60a0606061059a936020845280516020850152600180841b03602082015116604085015260408101511515828501520151916080808201520190610537565b90565b6080810190811067ffffffffffffffff82111761041657604052565b90601f8019910116810190811067ffffffffffffffff82111761041657604052565b67ffffffffffffffff811161041657601f01601f191660200190565b90600182811c92168015610625575b602083101461061157565b634e487b7160e01b5f52602260045260245ffd5b91607f1691610606565b805f9172184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b821015610779575b806d04ee2d6d415b85acef8100000000600a92101561075e575b662386f26fc1000081101561074a575b6305f5e100811015610739575b61271081101561072a575b606481101561071c575b1015610711575b600a602160018401936106b6856105db565b946106c460405196876105b9565b8086526106d3601f19916105db565b013660208701378401015b5f1901916f181899199a1a9b1b9c1cb0b131b232b360811b8282061a835304801561070c57600a90916106de565b505090565b6001909101906106a4565b60646002910493019261069d565b61271060049104930192610693565b6305f5e10060089104930192610688565b662386f26fc100006010910493019261067b565b6d04ee2d6d415b85acef81000000006020910493019261066b565b506040915072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b810461065156fea264697066735822122009e064d3bcb83fcf09466b72454466e6bc6c4ecebeb02124de3f1df1453edde364736f6c634300081b0033",
    "sourceMap": "344:1436:5:-:0;;;;;;;640:1;759:14:6;;643:1:5;783:14:6;;646:1:5;807:14:6;;344:1436:5;;;;;;759:14:6;344:1436:5;;;;;783:14:6;344:1436:5;;;;;807:14:6;344:1436:5;;;;;;;;;",
    "linkReferences": {}
  },
  "deployedBytecode": {
    "object": "0x60806040526004361015610011575f80fd5b5f3560e01c806354fd4d501461043957806360d7a278146101625763a2ea7c6e1461003a575f80fd5b3461015e57602036600319011261015e5760608060405161005a8161059d565b5f81525f60208201525f604082015201526004355f525f60205260405f206002604051916100878361059d565b8054835260ff600182015460018060a01b038116602086015260a01c161515604084015201906040515f928054906100be826105f7565b808452916001811690811561013657506001146100fc575b50506100e7816100f89403826105b9565b60608201526040519182918261055b565b0390f35b9093505f5260205f205f905b8482106101205750810160200192506100e7816100d6565b6001816020925483858701015201910190610108565b6100f8965084925060209150926100e79360ff191682840152151560051b82010194506100d6565b5f80fd5b3461015e57606036600319011261015e5760043567ffffffffffffffff811161015e573660238201121561015e57806004013567ffffffffffffffff811161015e57366024828401011161015e576024356001600160a01b038116919082900361015e576044359182151580930361015e57604051916101e18361059d565b5f835260208301918252604083019384525f60206101fe836105db565b9261020c60405194856105b9565b80845280602483860199018937830101526060830194818652610275601560208551938851151594604051958692848401985180918a5e8301916bffffffffffffffffffffffff199060601b168483015260f81b60348201520301600a198101845201826105b9565b51902092835f525f60205260405f205461042a57600291848452845f525f60205260405f209184518355600183019160018060a01b0390511682549160ff60a01b9051151560a01b16916affffffffffffffffffffff60a81b161717905501925192835167ffffffffffffffff8111610416576102f282546105f7565b601f81116103d1575b50806020958690601f831160011461036f575f92610364575b50508160011b915f199060031b1c19161790555b817fd0b86852e21f9e5fa4bc3b0cff9757ffe243d50c4b43968a42202153d651ea5e6040518061035933958261055b565b0390a3604051908152f35b015190508680610314565b5f8581528281209350601f198516905b8181106103ba57509084600195949392106103a2575b505050811b019055610328565b01515f1960f88460031b161c19169055868080610395565b92938960018192878601518155019501930161037f565b825f5260205f20601f830160051c8101916020841061040c575b601f0160051c01905b81811061040157506102fb565b5f81556001016103f4565b90915081906103eb565b634e487b7160e01b5f52604160045260245ffd5b63119b4fd360e11b5f5260045ffd5b3461015e575f36600319011261015e576100f86020610527600161047c7f000000000000000000000000000000000000000000000000000000000000000061062f565b81846104a77f000000000000000000000000000000000000000000000000000000000000000061062f565b81806104d27f000000000000000000000000000000000000000000000000000000000000000061062f565b9260405199878b985191829101848a015e870190601760f91b83830152805192839101602183015e010190601760f91b84830152805192839101600283015e01015f838201520301601f1981018352826105b9565b6040519182916020835260208301905b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b60a0606061059a936020845280516020850152600180841b03602082015116604085015260408101511515828501520151916080808201520190610537565b90565b6080810190811067ffffffffffffffff82111761041657604052565b90601f8019910116810190811067ffffffffffffffff82111761041657604052565b67ffffffffffffffff811161041657601f01601f191660200190565b90600182811c92168015610625575b602083101461061157565b634e487b7160e01b5f52602260045260245ffd5b91607f1691610606565b805f9172184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b821015610779575b806d04ee2d6d415b85acef8100000000600a92101561075e575b662386f26fc1000081101561074a575b6305f5e100811015610739575b61271081101561072a575b606481101561071c575b1015610711575b600a602160018401936106b6856105db565b946106c460405196876105b9565b8086526106d3601f19916105db565b013660208701378401015b5f1901916f181899199a1a9b1b9c1cb0b131b232b360811b8282061a835304801561070c57600a90916106de565b505090565b6001909101906106a4565b60646002910493019261069d565b61271060049104930192610693565b6305f5e10060089104930192610688565b662386f26fc100006010910493019261067b565b6d04ee2d6d415b85acef81000000006020910493019261066b565b506040915072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b810461065156fea264697066735822122009e064d3bcb83fcf09466b72454466e6bc6c4ecebeb02124de3f1df1453edde364736f6c634300081b0033",
    "sourceMap": "344:1436:5:-:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;344:1436:5;;;;;;;;138:1:0;;;:::i;:::-;344:1436:5;;;;;;;;;;;;;;;;;;138:1:0;344:1436:5;;138:1:0;344:1436:5;;138:1:0;344:1436:5;;;138:1:0;;;;:::i;:::-;;;;;344:1436:5;;;;;;;;;;;;;;;138:1:0;344:1436:5;;;;;;;;138:1:0;344:1436:5;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;138:1:0;344:1436:5;;;;;;;:::i;:::-;;;;;138:1:0;;;344:1436:5;138:1:0;344:1436:5;;138:1:0;344:1436:5;;;;;;;;-1:-1:-1;344:1436:5;;;;;-1:-1:-1;344:1436:5;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;138:1:0;344:1436:5;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;344:1436:5;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;344:1436:5;;;;;;;;;;;;;;;;;;;;;;138:1:0;;;;:::i;:::-;344:1436:5;138:1:0;;344:1436:5;849:146;;138:1:0;;;344:1436:5;849:146;;138:1:0;;;344:1436:5;;138:1:0;;;:::i;:::-;344:1436:5;138:1:0;344:1436:5;;138:1:0;;;:::i;:::-;;;;;344:1436:5;138:1:0;;;;344:1436:5;138:1:0;;;;;;344:1436:5;849:146;;138:1:0;;;;1686:84:5;344:1436;;138:1:0;;;;;344:1436:5;;;;;1686:84;;;;;;344:1436;;;;;;;;;;;;;;;;;;;;;;;;;1686:84;;;;;;;;;;;:::i;:::-;344:1436;1676:95;;138:1:0;;344:1436:5;138:1:0;344:1436:5;;138:1:0;344:1436:5;;138:1:0;;1051:84:5;;138:1:0;;;;;;344:1436:5;138:1:0;344:1436:5;;138:1:0;344:1436:5;;138:1:0;;;;;;;;;344:1436:5;;;;;;138:1:0;;344:1436:5;138:1:0;;;;;;;;344:1436:5;;138:1:0;;;;;;;;;;;;;344:1436:5;;;;;;138:1:0;;;;;;;;:::i;:::-;344:1436:5;138:1:0;;;;344:1436:5;138:1:0;;344:1436:5;138:1:0;;;344:1436:5;138:1:0;;;344:1436:5;;;;138:1:0;;;;;;;;;;;;;;;;;;;;;;344:1436:5;1222:41;344:1436;;1238:10;1222:41;1238:10;1222:41;;;:::i;:::-;;;;344:1436;;;;;;138:1:0;;;;-1:-1:-1;138:1:0;;;;;344:1436:5;138:1:0;;;;;;;-1:-1:-1;;;138:1:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;344:1436:5;138:1:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;344:1436:5;138:1:0;344:1436:5;;138:1:0;344:1436:5;138:1:0;;;;;;;344:1436:5;138:1:0;;;;;344:1436:5;138:1:0;;;;;;;;;;;;;;;344:1436:5;138:1:0;;;;;;;;;-1:-1:-1;138:1:0;;;;;344:1436:5;;;;;;;;;;;1051:84;1109:15;;;344:1436;1109:15;344:1436;;1109:15;344:1436;;;;;;-1:-1:-1;;344:1436:5;;;;;1055:104:6;;344:1436:5;1072:24:6;1089:6;1072:24;:::i;:::-;1120:6;;1103:24;1120:6;1103:24;:::i;:::-;1151:6;;1134:24;1151:6;1134:24;:::i;:::-;344:1436:5;;;;;;;;;;;;1055:104:6;;;344:1436:5;;;;-1:-1:-1;;;344:1436:5;;;;;;;;;;;;;;;;;-1:-1:-1;;;344:1436:5;;;;;;;;;;;;;;;;;;;;;1055:104:6;;;;;;;;;;:::i;:::-;344:1436:5;;;;;1055:104:6;344:1436:5;;1055:104:6;344:1436:5;;;;;;;;;;;;;;;;;;;;-1:-1:-1;344:1436:5;;;;;;;;-1:-1:-1;;344:1436:5;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;:::o;:::-;138:1:0;344:1436:5;;;;;;;;;;;;;:::o;:::-;;;1055:104:6;;344:1436:5;;;;;;;;;;;;;;;;:::o;138:1:0:-;;;;;;344:1436:5;;-1:-1:-1;;344:1436:5;138:1:0;;;:::o;:::-;;;;;;;;;;;;;;;;;;;:::o;:::-;344:1436:5;;;138:1:0;;;;;;;;;;;;;;;1343:634:72;1465:17;-1:-1:-1;29298:17:79;-1:-1:-1;;;29298:17:79;;;29294:103;;1343:634:72;29414:17:79;29423:8;29994:7;29414:17;;;29410:103;;1343:634:72;29539:8:79;29530:17;;;29526:103;;1343:634:72;29655:7:79;29646:16;;;29642:100;;1343:634:72;29768:7:79;29759:16;;;29755:100;;1343:634:72;29881:7:79;29872:16;;;29868:100;;1343:634:72;29985:16:79;;29981:66;;1343:634:72;29994:7:79;1580:94:72;1485:1;344:1436:5;;;;;;:::i;:::-;;138:1:0;344:1436:5;;138:1:0;;;:::i;:::-;344:1436:5;;;;1055:104:6;;344:1436:5;;:::i;:::-;;;;;;;1580:94:72;;;1687:247;-1:-1:-1;;344:1436:5;;-1:-1:-1;;;1741:111:72;;;;344:1436:5;1741:111:72;344:1436:5;1902:10:72;;1898:21;;29994:7:79;1687:247:72;;;;1898:21;1914:5;;1343:634;:::o;29981:66:79:-;30031:1;344:1436:5;;;;29981:66:79;;29868:100;29881:7;29952:1;344:1436:5;;;;29868:100:79;;;29755;29768:7;29839:1;344:1436:5;;;;29755:100:79;;;29642;29655:7;29726:1;344:1436:5;;;;29642:100:79;;;29526:103;29539:8;29612:2;344:1436:5;;;;29526:103:79;;;29410;29423:8;29496:2;344:1436:5;;;;29410:103:79;;;29294;-1:-1:-1;29380:2:79;;-1:-1:-1;;;;344:1436:5;;29294:103:79;",
    "linkReferences": {},
    "immutableReferences": {
      "2532": [
        {
          "start": 1112,
          "length": 32
        }
      ],
      "2534": [
        {
          "start": 1155,
          "length": 32
        }
      ],
      "2536": [
        {
          "start": 1198,
          "length": 32
        }
      ]
    }
  },
  "methodIdentifiers": {
    "getSchema(bytes32)": "a2ea7c6e",
    "register(string,address,bool)": "60d7a278",
    "version()": "54fd4d50"
  },
  "rawMetadata": "{\"compiler\":{\"version\":\"0.8.27+commit.40a35a09\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"AlreadyExists\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"registerer\",\"type\":\"address\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"contract ISchemaResolver\",\"name\":\"resolver\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"string\",\"name\":\"schema\",\"type\":\"string\"}],\"indexed\":false,\"internalType\":\"struct SchemaRecord\",\"name\":\"schema\",\"type\":\"tuple\"}],\"name\":\"Registered\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"}],\"name\":\"getSchema\",\"outputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"contract ISchemaResolver\",\"name\":\"resolver\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"string\",\"name\":\"schema\",\"type\":\"string\"}],\"internalType\":\"struct SchemaRecord\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"schema\",\"type\":\"string\"},{\"internalType\":\"contract ISchemaResolver\",\"name\":\"resolver\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"}],\"name\":\"register\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"version\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"}],\"devdoc\":{\"events\":{\"Registered(bytes32,address,(bytes32,address,bool,string))\":{\"params\":{\"registerer\":\"The address of the account used to register the schema.\",\"schema\":\"The schema data.\",\"uid\":\"The schema UID.\"}}},\"kind\":\"dev\",\"methods\":{\"constructor\":{\"details\":\"Creates a new SchemaRegistry instance.\"},\"getSchema(bytes32)\":{\"params\":{\"uid\":\"The UID of the schema to retrieve.\"},\"returns\":{\"_0\":\"The schema data members.\"}},\"register(string,address,bool)\":{\"params\":{\"resolver\":\"An optional schema resolver.\",\"revocable\":\"Whether the schema allows revocations explicitly.\",\"schema\":\"The schema data schema.\"},\"returns\":{\"_0\":\"The UID of the new schema.\"}},\"version()\":{\"returns\":{\"_0\":\"Semver contract version as a string.\"}}},\"title\":\"SchemaRegistry\",\"version\":1},\"userdoc\":{\"events\":{\"Registered(bytes32,address,(bytes32,address,bool,string))\":{\"notice\":\"Emitted when a new schema has been registered\"}},\"kind\":\"user\",\"methods\":{\"getSchema(bytes32)\":{\"notice\":\"Returns an existing schema by UID\"},\"register(string,address,bool)\":{\"notice\":\"Submits and reserves a new schema\"},\"version()\":{\"notice\":\"Returns the full semver contract version.\"}},\"notice\":\"The global schema registry.\",\"version\":1}},\"settings\":{\"compilationTarget\":{\"lib/eas-contracts/contracts/SchemaRegistry.sol\":\"SchemaRegistry\"},\"evmVersion\":\"prague\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[\":@eas/=lib/eas-contracts/contracts/\",\":@erc8004/=lib/erc-8004-contracts/contracts/\",\":@openzeppelin/=lib/openzeppelin-contracts/\",\":@src/=src/\",\":@test/=test/\",\":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/\",\":eas-contracts/=lib/eas-contracts/contracts/\",\":erc-8004-contracts/=lib/erc-8004-contracts/contracts/\",\":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/\",\":eth-gas-reporter/=lib/eas-contracts/node_modules/eth-gas-reporter/\",\":forge-std/=lib/forge-std/src/\",\":halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/\",\":hardhat-deploy/=lib/eas-contracts/node_modules/hardhat-deploy/\",\":hardhat/=lib/eas-contracts/node_modules/hardhat/\",\":openzeppelin-contracts/=lib/openzeppelin-contracts/\"],\"viaIR\":true},\"sources\":{\"lib/eas-contracts/contracts/Common.sol\":{\"keccak256\":\"0x957bd2e6d0d6d637f86208b135c29fbaf4412cb08e5e7a61ede16b80561bf685\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://da1dc9aedbb1d4d39c46c2235918d3adfbc5741dd34a46010cf425d134e7936d\",\"dweb:/ipfs/QmWUk6bXnLaghS2riF3GTFEeURCzgYFMA5woa6AsgPwEgc\"]},\"lib/eas-contracts/contracts/ISchemaRegistry.sol\":{\"keccak256\":\"0xea97dcd36a0c422169cbaac06698249e199049b627c16bff93fb8ab829058754\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://d453a929ef64a69cd31195ec2ee5ed1193bfa29f633e13c960e92154c37ad158\",\"dweb:/ipfs/QmXs1Z3njbHs2EMgHonrZDfcwdog4kozHY5tYNrhZK5yqz\"]},\"lib/eas-contracts/contracts/ISemver.sol\":{\"keccak256\":\"0x04a67939b4e1a8d0a51101b8f69f8882930bbdc66319f38023828625b5d1ff18\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://3dd543fa0e33cef1ea757627f9c2a10a66ee1ce17aa9087f437c5b53a903c7f0\",\"dweb:/ipfs/QmXsy6UsGBzF9zPCCjmiwPpCcX3tHqU13TmR67B69tKnR6\"]},\"lib/eas-contracts/contracts/SchemaRegistry.sol\":{\"keccak256\":\"0x03ba24da8053a6ace797cd2683971b4f4a55909adbb3928c57d9864b71ff0a56\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://14ef01ae0216b9f2eaa794f2bb49705c2d2df6d65e667d8a47d13a2fd3201d79\",\"dweb:/ipfs/QmYALhY8KaD5AhgHiUxZWxpMuD4eznae9dLr9594kZFSgm\"]},\"lib/eas-contracts/contracts/Semver.sol\":{\"keccak256\":\"0x4f23442d048661b6aaa188ddc16b69cb310c2e44066b3852026afcb4201d61a9\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://30c36e580cd93d9acb13e1a11e833946a8bd0bd2a8d1b2be049f0d96e0989808\",\"dweb:/ipfs/QmXmQTxKjSrUWutafQsqkbGufXqtzxuDAiMMJjXCHXiEqh\"]},\"lib/eas-contracts/contracts/resolver/ISchemaResolver.sol\":{\"keccak256\":\"0xb7d1961ed928c620cddf35c2bf46845b10828bc5d73145214630202ed355b6bb\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://cf1cabacfb15c9bace8280b540b52e5aa440e1b4eba675f9782c34ce0f03902f\",\"dweb:/ipfs/QmakYcK4xbrijzvoaBCmBJK6HeaBqbXxWKtDQ1z62aXwCR\"]},\"lib/openzeppelin-contracts/contracts/utils/Bytes.sol\":{\"keccak256\":\"0x8140d608316521b1fd71167c3b708ebb8659da070723fc8807609553b296ee33\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://a7bf7db66869ba1e945a0390b85da2f6afc7e42a4735ca918d0d56ac90c50147\",\"dweb:/ipfs/QmRmNyhpBpgzSdQqLtrQCYE7H7eLnVVxh2Yy4YMrySR8AR\"]},\"lib/openzeppelin-contracts/contracts/utils/Panic.sol\":{\"keccak256\":\"0xf7fe324703a64fc51702311dc51562d5cb1497734f074e4f483bfb6717572d7a\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://c6a5ff4f9fd8649b7ee20800b7fa387d3465bd77cf20c2d1068cd5c98e1ed57a\",\"dweb:/ipfs/QmVSaVJf9FXFhdYEYeCEfjMVHrxDh5qL4CGkxdMWpQCrqG\"]},\"lib/openzeppelin-contracts/contracts/utils/Strings.sol\":{\"keccak256\":\"0x36d1750bf1aa5fee9c52adb2f7857ab652daca722fc05dff533b364f67a1139a\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://2e5e7052539b7849d02f3ce25acc1dce29373c11cfae9f0bc918c54b780c549a\",\"dweb:/ipfs/QmRGE32xNkMTo6i4pHHMxjpiu77yPwnTA25SFngw2NXJys\"]},\"lib/openzeppelin-contracts/contracts/utils/math/Math.sol\":{\"keccak256\":\"0x09e3f1c72d4c5cbe8e2644ab7313f8f7177533ae2f4c24cdcbbeaf520a73734c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://93208401215d539fa2d81626b207c1f611def7883d0e447b3b5969ebaa7b3c2c\",\"dweb:/ipfs/QmXPxDnQPx8LAweX5ZJqEcwkvs59kP4c64VVDG1Jjq1mef\"]},\"lib/openzeppelin-contracts/contracts/utils/math/SafeCast.sol\":{\"keccak256\":\"0x195533c86d0ef72bcc06456a4f66a9b941f38eb403739b00f21fd7c1abd1ae54\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://b1d578337048cad08c1c03041cca5978eff5428aa130c781b271ad9e5566e1f8\",\"dweb:/ipfs/QmPFKL2r9CBsMwmUqqdcFPfHZB2qcs9g1HDrPxzWSxomvy\"]},\"lib/openzeppelin-contracts/contracts/utils/math/SignedMath.sol\":{\"keccak256\":\"0xb1970fac7b64e6c09611e6691791e848d5e3fe410fa5899e7df2e0afd77a99e3\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://db5fbb3dddd8b7047465b62575d96231ba8a2774d37fb4737fbf23340fabbb03\",\"dweb:/ipfs/QmVUSvooZKEdEdap619tcJjTLcAuH6QBdZqAzWwnAXZAWJ\"]}},\"version\":1}",
  "metadata": {
    "compiler": {
      "version": "0.8.27+commit.40a35a09"
    },
    "language": "Solidity",
    "output": {
      "abi": [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "AlreadyExists"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "uid",
              "type": "bytes32",
              "indexed": true
            },
            {
              "internalType": "address",
              "name": "registerer",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "struct SchemaRecord",
              "name": "schema",
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
              ],
              "indexed": false
            }
          ],
          "type": "event",
          "name": "Registered",
          "anonymous": false
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
          "inputs": [
            {
              "internalType": "string",
              "name": "schema",
              "type": "string"
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
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "register",
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
          "constructor": {
            "details": "Creates a new SchemaRegistry instance."
          },
          "getSchema(bytes32)": {
            "params": {
              "uid": "The UID of the schema to retrieve."
            },
            "returns": {
              "_0": "The schema data members."
            }
          },
          "register(string,address,bool)": {
            "params": {
              "resolver": "An optional schema resolver.",
              "revocable": "Whether the schema allows revocations explicitly.",
              "schema": "The schema data schema."
            },
            "returns": {
              "_0": "The UID of the new schema."
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
          "getSchema(bytes32)": {
            "notice": "Returns an existing schema by UID"
          },
          "register(string,address,bool)": {
            "notice": "Submits and reserves a new schema"
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
        "lib/eas-contracts/contracts/SchemaRegistry.sol": "SchemaRegistry"
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
      "lib/eas-contracts/contracts/SchemaRegistry.sol": {
        "keccak256": "0x03ba24da8053a6ace797cd2683971b4f4a55909adbb3928c57d9864b71ff0a56",
        "urls": [
          "bzz-raw://14ef01ae0216b9f2eaa794f2bb49705c2d2df6d65e667d8a47d13a2fd3201d79",
          "dweb:/ipfs/QmYALhY8KaD5AhgHiUxZWxpMuD4eznae9dLr9594kZFSgm"
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
      "lib/openzeppelin-contracts/contracts/utils/Strings.sol": {
        "keccak256": "0x36d1750bf1aa5fee9c52adb2f7857ab652daca722fc05dff533b364f67a1139a",
        "urls": [
          "bzz-raw://2e5e7052539b7849d02f3ce25acc1dce29373c11cfae9f0bc918c54b780c549a",
          "dweb:/ipfs/QmRGE32xNkMTo6i4pHHMxjpiu77yPwnTA25SFngw2NXJys"
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
  "id": 5
} as const;
