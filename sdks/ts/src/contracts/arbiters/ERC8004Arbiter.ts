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
          "name": "escrowUid",
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
          "internalType": "struct ERC8004Arbiter.DemandData",
          "components": [
            {
              "name": "validationRegistry",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "validatorAddress",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "minResponse",
              "type": "uint8",
              "internalType": "uint8"
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
      "name": "requestHashFor",
      "inputs": [
        {
          "name": "uid",
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
      "name": "FulfillmentMustReferenceEscrow",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidMinResponse",
      "inputs": []
    },
    {
      "type": "error",
      "name": "ResponseBelowMinimum",
      "inputs": []
    },
    {
      "type": "error",
      "name": "ValidationNotFound",
      "inputs": []
    },
    {
      "type": "error",
      "name": "ValidatorMismatch",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x60808060405234601557610740908161001a8239f35b5f80fdfe6080806040526004361015610012575f80fd5b5f3560e01c90816301ffc9a71461053d57508063728797ee146104f8578063838a68d91461039e57638da3721a14610048575f80fd5b34610352576060366003190112610352576004356001600160401b038111610352576101406003198236030112610352576040519061014082018281106001600160401b0382111761038a5760405280600401358252602481013560208301526100b460448201610651565b60408301526100c560648201610651565b60608301526100d660848201610651565b608083015260a082019060a481013582526100f360c48201610665565b60c084015261010460e48201610665565b60e0840152610104810135801515810361035257610100840152610124810135906001600160401b03821161035257600461014292369201016105e7565b6101208301526024356001600160401b038111610352576101679036906004016105e7565b80518101916020830191602081850312610352576020810151906001600160401b0382116103525701926080908490031261035257604051936101a985610590565b6101b5602085016106b2565b85526101c3604085016106b2565b92602086019384526101d7606086016106c6565b946040870195865260808101516001600160401b0381116103525760209101019080601f83011215610352578151610211926020016106d4565b916060860192835260443590510361037b5760ff8451168015908115610370575b50610361575f916102469151905190610679565b935160405160016234050160e21b031981526004810195909552849060249082906001600160a01b03165afa928315610356575f905f946102e7575b506001600160a01b03169081156102d857516001600160a01b0316036102c95760ff809151169116106102ba57602060405160018152f35b632be54c6b60e21b5f5260045ffd5b63d5fd645b60e01b5f5260045ffd5b637f7667e360e11b5f5260045ffd5b9350503d805f853e6102f981856105ab565b830160c0848203126103525761030e846106b2565b9061031b604086016106c6565b946080810151906001600160401b03821161035257019080601f8301121561035257815161034b926020016106d4565b505f610282565b5f80fd5b6040513d5f823e3d90fd5b6346162fc560e01b5f5260045ffd5b60649150115f610232565b638874563160e01b5f5260045ffd5b634e487b7160e01b5f52604160045260245ffd5b34610352576020366003190112610352576004356001600160401b03811161035257366023820112156103525780600401356001600160401b038111610352578101906024820190368211610352576060806040516103fc81610590565b5f81525f60208201525f6040820152015260206023196024838603010112610352576024810135906001600160401b03821161035257019160809083900312610352576040519061044c82610590565b61045860248401610665565b825261046660448401610665565b926020830193845260648101359060ff82168203610352576040840191825260848101356001600160401b038111610352576104f49360246104ac9260ff9401016105e7565b91606085019283526040519586956020875260018060a01b03905116602087015260018060a01b039051166040860152511660608401525160808084015260a083019061062d565b0390f35b34610352576040366003190112610352576024356001600160401b0381116103525761053561052d60209236906004016105e7565b600435610679565b604051908152f35b34610352576020366003190112610352576004359063ffffffff60e01b8216809203610352576020916346d1b90d60e11b811490811561057f575b5015158152f35b6301ffc9a760e01b14905083610578565b608081019081106001600160401b0382111761038a57604052565b90601f801991011681019081106001600160401b0382111761038a57604052565b6001600160401b03811161038a57601f01601f191660200190565b81601f82011215610352578035906105fe826105cc565b9261060c60405194856105ab565b8284526020838301011161035257815f926020809301838601378301015290565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b35906001600160401b038216820361035257565b35906001600160a01b038216820361035257565b906106ac61069e9160405192839160208301958652604080840152606083019061062d565b03601f1981018352826105ab565b51902090565b51906001600160a01b038216820361035257565b519060ff8216820361035257565b9291926106e0826105cc565b916106ee60405193846105ab565b829481845281830111610352578281602093845f96015e01015256fea2646970667358221220531ae5d4161e9ead9e2e486fa236fcf7afff8fce65728d43bc63e4fa3d7c4a5064736f6c634300081b0033",
    "sourceMap": "970:3801:95:-:0;;;;;;;;;;;;;;;;;",
    "linkReferences": {}
  },
  "deployedBytecode": {
    "object": "0x6080806040526004361015610012575f80fd5b5f3560e01c90816301ffc9a71461053d57508063728797ee146104f8578063838a68d91461039e57638da3721a14610048575f80fd5b34610352576060366003190112610352576004356001600160401b038111610352576101406003198236030112610352576040519061014082018281106001600160401b0382111761038a5760405280600401358252602481013560208301526100b460448201610651565b60408301526100c560648201610651565b60608301526100d660848201610651565b608083015260a082019060a481013582526100f360c48201610665565b60c084015261010460e48201610665565b60e0840152610104810135801515810361035257610100840152610124810135906001600160401b03821161035257600461014292369201016105e7565b6101208301526024356001600160401b038111610352576101679036906004016105e7565b80518101916020830191602081850312610352576020810151906001600160401b0382116103525701926080908490031261035257604051936101a985610590565b6101b5602085016106b2565b85526101c3604085016106b2565b92602086019384526101d7606086016106c6565b946040870195865260808101516001600160401b0381116103525760209101019080601f83011215610352578151610211926020016106d4565b916060860192835260443590510361037b5760ff8451168015908115610370575b50610361575f916102469151905190610679565b935160405160016234050160e21b031981526004810195909552849060249082906001600160a01b03165afa928315610356575f905f946102e7575b506001600160a01b03169081156102d857516001600160a01b0316036102c95760ff809151169116106102ba57602060405160018152f35b632be54c6b60e21b5f5260045ffd5b63d5fd645b60e01b5f5260045ffd5b637f7667e360e11b5f5260045ffd5b9350503d805f853e6102f981856105ab565b830160c0848203126103525761030e846106b2565b9061031b604086016106c6565b946080810151906001600160401b03821161035257019080601f8301121561035257815161034b926020016106d4565b505f610282565b5f80fd5b6040513d5f823e3d90fd5b6346162fc560e01b5f5260045ffd5b60649150115f610232565b638874563160e01b5f5260045ffd5b634e487b7160e01b5f52604160045260245ffd5b34610352576020366003190112610352576004356001600160401b03811161035257366023820112156103525780600401356001600160401b038111610352578101906024820190368211610352576060806040516103fc81610590565b5f81525f60208201525f6040820152015260206023196024838603010112610352576024810135906001600160401b03821161035257019160809083900312610352576040519061044c82610590565b61045860248401610665565b825261046660448401610665565b926020830193845260648101359060ff82168203610352576040840191825260848101356001600160401b038111610352576104f49360246104ac9260ff9401016105e7565b91606085019283526040519586956020875260018060a01b03905116602087015260018060a01b039051166040860152511660608401525160808084015260a083019061062d565b0390f35b34610352576040366003190112610352576024356001600160401b0381116103525761053561052d60209236906004016105e7565b600435610679565b604051908152f35b34610352576020366003190112610352576004359063ffffffff60e01b8216809203610352576020916346d1b90d60e11b811490811561057f575b5015158152f35b6301ffc9a760e01b14905083610578565b608081019081106001600160401b0382111761038a57604052565b90601f801991011681019081106001600160401b0382111761038a57604052565b6001600160401b03811161038a57601f01601f191660200190565b81601f82011215610352578035906105fe826105cc565b9261060c60405194856105ab565b8284526020838301011161035257815f926020809301838601378301015290565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b35906001600160401b038216820361035257565b35906001600160a01b038216820361035257565b906106ac61069e9160405192839160208301958652604080840152606083019061062d565b03601f1981018352826105ab565b51902090565b51906001600160a01b038216820361035257565b519060ff8216820361035257565b9291926106e0826105cc565b916106ee60405193846105ab565b829481845281830111610352578281602093845f96015e01015256fea2646970667358221220531ae5d4161e9ead9e2e486fa236fcf7afff8fce65728d43bc63e4fa3d7c4a5064736f6c634300081b0033",
    "sourceMap": "970:3801:95:-:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;970:3801:95;;;;;;-1:-1:-1;;;;;970:3801:95;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;970:3801:95;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;970:3801:95;;;;;;;;;;;;:::i;:::-;;;;;;;-1:-1:-1;;;;;970:3801:95;;;;;;;;;;;:::i;:::-;;;2808:32;;;970:3801;2808:32;;970:3801;;;;;;;;;2808:32;;970:3801;;-1:-1:-1;;;;;970:3801:95;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;-1:-1:-1;;;;;970:3801:95;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;2916:31;2912:101;;970:3801;;;;3135:24;;:53;;;;;970:3801;3131:86;;;970:3801;;3250:45;970:3801;;3282:12;;3250:45;;:::i;:::-;970:3801;;;;-1:-1:-1;;;;;;3626:41:95;;970:3801;3626:41;;970:3801;;;;;;;;;;-1:-1:-1;;;;;970:3801:95;3626:41;;;;;;;970:3801;;;3626:41;;;970:3801;-1:-1:-1;;;;;;970:3801:95;;3753:30;;3749:63;;970:3801;-1:-1:-1;;;;;970:3801:95;3884:44;3880:101;;970:3801;;;;;;;4050:30;4046:65;;970:3801;;;;;;;4046:65;4089:22;;;970:3801;4089:22;970:3801;;4089:22;3880:101;3951:19;;;970:3801;3951:19;970:3801;;3951:19;3749:63;3792:20;;;970:3801;3792:20;970:3801;;3792:20;3626:41;;;;;;970:3801;3626:41;;;;;;:::i;:::-;;;970:3801;;;;;;;;;;:::i;:::-;;;;;;;:::i;:::-;;;;;;;-1:-1:-1;;;;;970:3801:95;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;3626:41;;;970:3801;;;;3626:41;970:3801;;;;;;;;;3131:86;3197:20;;;970:3801;3197:20;970:3801;;3197:20;3135:53;970:3801;3163:25;;;3135:53;;;2912:101;2970:32;;;970:3801;2970:32;970:3801;;2970:32;970:3801;;;;;;;;;;;;;;;;;;-1:-1:-1;;970:3801:95;;;;;;-1:-1:-1;;;;;970:3801:95;;;;;;;;;;;;;;;;-1:-1:-1;;;;;970:3801:95;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;970:3801:95;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;970:3801:95;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;-1:-1:-1;;970:3801:95;;;;;;-1:-1:-1;;;;;970:3801:95;;;;;;;;;;;;;:::i;:::-;;;;:::i;:::-;;;;;;;;;;;;;-1:-1:-1;;970:3801:95;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;573:41:88;;;:81;;;;970:3801:95;;;;;;;573:81:88;-1:-1:-1;;;829:40:77;;-1:-1:-1;573:81:88;;;970:3801:95;;;;;;;-1:-1:-1;;;;;970:3801:95;;;;;;;:::o;:::-;;;;;;;;;;;;;-1:-1:-1;;;;;970:3801:95;;;;;;;:::o;:::-;-1:-1:-1;;;;;970:3801:95;;;;;;-1:-1:-1;;970:3801:95;;;;:::o;:::-;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;-1:-1:-1;970:3801:95;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;970:3801:95;;;;;;;;-1:-1:-1;;970:3801:95;;;;:::o;:::-;;;-1:-1:-1;;;;;970:3801:95;;;;;;:::o;:::-;;;-1:-1:-1;;;;;970:3801:95;;;;;;:::o;4627:142::-;;4740:21;970:3801;4627:142;970:3801;;4740:21;;;;;;970:3801;;;;;;;;;;;;;:::i;:::-;4740:21;970:3801;;4740:21;;;;;;:::i;:::-;970:3801;4730:32;;4627:142;:::o;970:3801::-;;;-1:-1:-1;;;;;970:3801:95;;;;;;:::o;:::-;;;;;;;;;;:::o;:::-;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;-1:-1:-1;970:3801:95;;;;;;:::o",
    "linkReferences": {}
  },
  "methodIdentifiers": {
    "check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)": "8da3721a",
    "decodeDemandData(bytes)": "838a68d9",
    "requestHashFor(bytes32,bytes)": "728797ee",
    "supportsInterface(bytes4)": "01ffc9a7"
  },
  "rawMetadata": "{\"compiler\":{\"version\":\"0.8.27+commit.40a35a09\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[],\"name\":\"FulfillmentMustReferenceEscrow\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidMinResponse\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"ResponseBelowMinimum\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"ValidationNotFound\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"ValidatorMismatch\",\"type\":\"error\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"fulfillment\",\"type\":\"tuple\"},{\"internalType\":\"bytes\",\"name\":\"demand\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"}],\"name\":\"check\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"decodeDemandData\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"validationRegistry\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"validatorAddress\",\"type\":\"address\"},{\"internalType\":\"uint8\",\"name\":\"minResponse\",\"type\":\"uint8\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct ERC8004Arbiter.DemandData\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"requestHashFor\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"}],\"devdoc\":{\"details\":\"The DemandData specifies a minimum response uint8 (1-100).      The validation requestHash is derived from the fulfillment attestation      UID and caller-supplied binding data.\",\"kind\":\"dev\",\"methods\":{\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"params\":{\"demand\":\"ABI-encoded DemandData containing registry address and min response\",\"escrowUid\":\"The escrow UID that this fulfillment must reference\",\"fulfillment\":\"The attestation representing the obligation\"},\"returns\":{\"_0\":\"bool True if the validation response >= minResponse\"}},\"decodeDemandData(bytes)\":{\"params\":{\"data\":\"ABI-encoded DemandData\"},\"returns\":{\"_0\":\"DemandData struct\"}},\"requestHashFor(bytes32,bytes)\":{\"params\":{\"data\":\"Opaque binding data from `DemandData`.\",\"uid\":\"Fulfillment attestation UID.\"}},\"supportsInterface(bytes4)\":{\"details\":\"Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section] to learn more about how these ids are created. This function call must use less than 30 000 gas.\"}},\"title\":\"ERC8004Arbiter\",\"version\":1},\"userdoc\":{\"errors\":{\"FulfillmentMustReferenceEscrow()\":[{\"notice\":\"Raised when the fulfillment does not reference the escrow UID supplied by the escrow contract.\"}],\"InvalidMinResponse()\":[{\"notice\":\"Raised when the minimum response is outside the supported 1-100 range.\"}],\"ResponseBelowMinimum()\":[{\"notice\":\"Raised when the registry response is below the requested minimum.\"}],\"ValidationNotFound()\":[{\"notice\":\"Raised when the registry has no validation for the derived request hash.\"}],\"ValidatorMismatch()\":[{\"notice\":\"Raised when the registry response came from a different validator.\"}]},\"kind\":\"user\",\"methods\":{\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"notice\":\"Check if the validation response meets the minimum requirement\"},\"decodeDemandData(bytes)\":{\"notice\":\"Helper function to decode DemandData\"},\"requestHashFor(bytes32,bytes)\":{\"notice\":\"Computes the ERC-8004 validation request hash used by this arbiter.\"}},\"notice\":\"Arbiter that wraps ERC-8004's ValidationRegistry.\",\"version\":1}},\"settings\":{\"compilationTarget\":{\"src/arbiters/ERC8004Arbiter.sol\":\"ERC8004Arbiter\"},\"evmVersion\":\"prague\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[\":@eas/=lib/eas-contracts/contracts/\",\":@erc8004/=lib/erc-8004-contracts/contracts/\",\":@openzeppelin/=lib/openzeppelin-contracts/\",\":@src/=src/\",\":@test/=test/\",\":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/\",\":eas-contracts/=lib/eas-contracts/contracts/\",\":erc-8004-contracts/=lib/erc-8004-contracts/contracts/\",\":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/\",\":eth-gas-reporter/=lib/eas-contracts/node_modules/eth-gas-reporter/\",\":forge-std/=lib/forge-std/src/\",\":halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/\",\":hardhat-deploy/=lib/eas-contracts/node_modules/hardhat-deploy/\",\":hardhat/=lib/eas-contracts/node_modules/hardhat/\",\":openzeppelin-contracts/=lib/openzeppelin-contracts/\"],\"viaIR\":true},\"sources\":{\"lib/eas-contracts/contracts/Common.sol\":{\"keccak256\":\"0x957bd2e6d0d6d637f86208b135c29fbaf4412cb08e5e7a61ede16b80561bf685\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://da1dc9aedbb1d4d39c46c2235918d3adfbc5741dd34a46010cf425d134e7936d\",\"dweb:/ipfs/QmWUk6bXnLaghS2riF3GTFEeURCzgYFMA5woa6AsgPwEgc\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/ERC165.sol\":{\"keccak256\":\"0x2d9dc2fe26180f74c11c13663647d38e259e45f95eb88f57b61d2160b0109d3e\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://81233d1f98060113d9922180bb0f14f8335856fe9f339134b09335e9f678c377\",\"dweb:/ipfs/QmWh6R35SarhAn4z2wH8SU456jJSYL2FgucfTFgbHJJN4E\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol\":{\"keccak256\":\"0x8891738ffe910f0cf2da09566928589bf5d63f4524dd734fd9cedbac3274dd5c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://971f954442df5c2ef5b5ebf1eb245d7105d9fbacc7386ee5c796df1d45b21617\",\"dweb:/ipfs/QmadRjHbkicwqwwh61raUEapaVEtaLMcYbQZWs9gUkgj3u\"]},\"src/BaseArbiter.sol\":{\"keccak256\":\"0x27fa97834bcd6e592f3b534e64859b208c688363d33fb9b62436d009ffff3ed1\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://b61ac6195ae644325adf77fdb301651cddfca4b63d9db5123ee075869f3784aa\",\"dweb:/ipfs/QmYRu5hER8gaMjqyY5bDV9EAwVN12CbS3Z2bW8dLp7sPSE\"]},\"src/IArbiter.sol\":{\"keccak256\":\"0x00f3f5d8460c738eff4a776cf309efe38342fcc951abfe97d1c2e285acb1e330\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://7201a176f3d5c3d01ca13bbcd9ef5587effe8fabf20e0b8f81f2d6ee362269b9\",\"dweb:/ipfs/QmXn9aSvoGPQuNTxe3mM47RNQ1bfYCEczQCYsDDM9ohc8M\"]},\"src/arbiters/ERC8004Arbiter.sol\":{\"keccak256\":\"0x1f46f5ae2f8e1e0fc52ec5f4133be82610395c3ac8f22722d8b631d1371b92c4\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://957b305befa6f7ef634fc13a8e1d61e7e8ab7f55fc4547180f0aa7930ce2ff3e\",\"dweb:/ipfs/QmXUsezq9vL6a246JaW122qpS3HVquG5HUUQV7hvs71PyT\"]},\"src/libraries/ArbiterUtils.sol\":{\"keccak256\":\"0xb87e2bfb9c7292daf6426fbedc09c8683b92841d1b92e7359c0ff94d42be632f\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://3acf498c3c59891d76db768ea57d8f7f6b4010dcbaf44a5f93d95d72f0b12441\",\"dweb:/ipfs/QmVbkioM8dWwYxqatm1dyo9PRFNZ6c7Kbang7pozbnyS7j\"]}},\"version\":1}",
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
          "name": "FulfillmentMustReferenceEscrow"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidMinResponse"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "ResponseBelowMinimum"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "ValidationNotFound"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "ValidatorMismatch"
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
              "name": "escrowUid",
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
              "internalType": "struct ERC8004Arbiter.DemandData",
              "name": "",
              "type": "tuple",
              "components": [
                {
                  "internalType": "address",
                  "name": "validationRegistry",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "validatorAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint8",
                  "name": "minResponse",
                  "type": "uint8"
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
              "name": "uid",
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
          "name": "requestHashFor",
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
              "demand": "ABI-encoded DemandData containing registry address and min response",
              "escrowUid": "The escrow UID that this fulfillment must reference",
              "fulfillment": "The attestation representing the obligation"
            },
            "returns": {
              "_0": "bool True if the validation response >= minResponse"
            }
          },
          "decodeDemandData(bytes)": {
            "params": {
              "data": "ABI-encoded DemandData"
            },
            "returns": {
              "_0": "DemandData struct"
            }
          },
          "requestHashFor(bytes32,bytes)": {
            "params": {
              "data": "Opaque binding data from `DemandData`.",
              "uid": "Fulfillment attestation UID."
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
            "notice": "Check if the validation response meets the minimum requirement"
          },
          "decodeDemandData(bytes)": {
            "notice": "Helper function to decode DemandData"
          },
          "requestHashFor(bytes32,bytes)": {
            "notice": "Computes the ERC-8004 validation request hash used by this arbiter."
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
        "src/arbiters/ERC8004Arbiter.sol": "ERC8004Arbiter"
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
      "src/arbiters/ERC8004Arbiter.sol": {
        "keccak256": "0x1f46f5ae2f8e1e0fc52ec5f4133be82610395c3ac8f22722d8b631d1371b92c4",
        "urls": [
          "bzz-raw://957b305befa6f7ef634fc13a8e1d61e7e8ab7f55fc4547180f0aa7930ce2ff3e",
          "dweb:/ipfs/QmXUsezq9vL6a246JaW122qpS3HVquG5HUUQV7hvs71PyT"
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
  "id": 95
} as const;
