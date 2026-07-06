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
          "name": "",
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
      "name": "confirm",
      "inputs": [
        {
          "name": "_fulfillment",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "_escrow",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "confirmations",
      "inputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
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
      "name": "escrowToFulfillment",
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
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "requestConfirmation",
      "inputs": [
        {
          "name": "_fulfillment",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "_escrow",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "revoke",
      "inputs": [
        {
          "name": "_fulfillment",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "_escrow",
          "type": "bytes32",
          "internalType": "bytes32"
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
      "name": "ConfirmationMade",
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
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ConfirmationRequested",
      "inputs": [
        {
          "name": "fulfillment",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "confirmer",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "escrow",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ConfirmationRevoked",
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
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "AnotherFulfillmentAlreadyConfirmed",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidFulfillment",
      "inputs": []
    },
    {
      "type": "error",
      "name": "NoConfirmationToRevoke",
      "inputs": []
    },
    {
      "type": "error",
      "name": "UnauthorizedConfirmation",
      "inputs": []
    },
    {
      "type": "error",
      "name": "UnauthorizedConfirmationRequest",
      "inputs": []
    },
    {
      "type": "error",
      "name": "UnauthorizedRevocation",
      "inputs": []
    }
  ],
  "bytecode": {
    "object": "0x60a03461007e57601f6109e338819003918201601f19168301916001600160401b038311848410176100825780849260209460405283398101031261007e57516001600160a01b038116810361007e5760805260405161094c9081610097823960805181818160a0015281816103460152818161039c01526105490152f35b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe6080806040526004361015610012575f80fd5b5f3560e01c90816301ffc9a71461068b575080633786930d1461066157806352155df71461052257806357f784ba146103755780638150864d14610331578063887d686d146102fe5780638da3721a146101c75763c266461014610074575f80fd5b346101c357610082366106de565b6040516328c44a9960e21b8152600481018290529091905f816024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9081156101b8575f91610196575b5060c001516001600160a01b0316330361018757805f525f60205260405f20825f5260205260ff60405f205416158015610171575b61016257805f525f60205260405f20825f5260205260405f2060ff198154169055815f5260016020525f60408120557f137a0dfcce695307235e039aa2ae70da634ed7f10a6a5a536b3a8c15d758aa1e5f80a3005b6339abb17d60e01b5f5260045ffd5b50815f5260016020528060405f2054141561010d565b630feaf7d560e31b5f5260045ffd5b6101b291503d805f833e6101aa8183610725565b8101906107fb565b5f6100d8565b6040513d5f823e3d90fd5b5f80fd5b346101c35760603660031901126101c35760043567ffffffffffffffff81116101c35761014060031982360301126101c35760405190610206826106f4565b806004013582526024810135602083015261022360448201610747565b604083015261023460648201610747565b606083015261024560848201610747565b608083015260a481013560a083015261026060c4820161075c565b60c083015261027160e4820161075c565b60e083015261010481013580151581036101c3576101008301526101248101359067ffffffffffffffff82116101c35760046102b0923692010161078c565b61012082015260243567ffffffffffffffff81116101c3576102d690369060040161078c565b50515f525f60205260405f206044355f52602052602060ff60405f2054166040519015158152f35b346101c35761030c366106de565b905f525f60205260405f20905f52602052602060ff60405f2054166040519015158152f35b346101c3575f3660031901126101c3576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346101c357610383366106de565b6040516328c44a9960e21b8152600481018290529091907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165f82602481845afa9081156101b8576024925f92610504575b505f90604051938480926328c44a9960e21b82528760048301525afa9182156101b8575f926104e8575b5060c001516001600160a01b031633036104d957518181159182156104ce575b50506104bf57815f52600160205260405f20541515806104a9575b61049a57805f525f60205260405f20825f5260205260405f20600160ff19825416179055815f5260016020528060405f20557fd22fd165f2b163f7b94d6e2b15443105c17bfae3fa2242150644ab76a95d532e5f80a3005b633ea893c560e21b5f5260045ffd5b50815f5260016020528060405f20541415610442565b630ebe58ef60e11b5f5260045ffd5b141590508184610427565b6331eb5cd360e11b5f5260045ffd5b6104fd9192503d805f833e6101aa8183610725565b9084610407565b5f91925061051b903d8084833e6101aa8183610725565b91906103dd565b346101c357610530366106de565b6040516328c44a9960e21b8152600481018390529091907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316905f81602481855afa9081156101b8575f91610647575b5060e08101516001600160a01b0316331415908161062f575b50610620575f602491604051928380926328c44a9960e21b82528760048301525afa9081156101b8575f91610606575b5060c001516001600160a01b0316907f93ece828de650a0159786850192cbcd721ab720e1ee81b00365a5c8d63886b315f80a4005b61061a91503d805f833e6101aa8183610725565b836105d1565b63020a627d60e11b5f5260045ffd5b60c001516001600160a01b03163314159050846105a1565b61065b91503d805f833e6101aa8183610725565b84610588565b346101c35760203660031901126101c3576004355f526001602052602060405f2054604051908152f35b346101c35760203660031901126101c3576004359063ffffffff60e01b82168092036101c3576020916346d1b90d60e11b81149081156106cd575b5015158152f35b6301ffc9a760e01b149050836106c6565b60409060031901126101c3576004359060243590565b610140810190811067ffffffffffffffff82111761071157604052565b634e487b7160e01b5f52604160045260245ffd5b90601f8019910116810190811067ffffffffffffffff82111761071157604052565b359067ffffffffffffffff821682036101c357565b35906001600160a01b03821682036101c357565b67ffffffffffffffff811161071157601f01601f191660200190565b81601f820112156101c3578035906107a382610770565b926107b16040519485610725565b828452602083830101116101c357815f926020809301838601378301015290565b519067ffffffffffffffff821682036101c357565b51906001600160a01b03821682036101c357565b6020818303126101c35780519067ffffffffffffffff82116101c3570190610140828203126101c35760405191610831836106f4565b805183526020810151602084015261084b604082016107d2565b604084015261085c606082016107d2565b606084015261086d608082016107d2565b608084015260a081015160a084015261088860c082016107e7565b60c084015261089960e082016107e7565b60e084015261010081015180151581036101c3576101008401526101208101519067ffffffffffffffff82116101c3570181601f820112156101c3578051906108e182610770565b926108ef6040519485610725565b828452602083830101116101c357815f9260208093018386015e830101526101208201529056fea26469706673582212209b6a79ea737f93da3f5148cab7368c244b7c735f67d3f60aea133fe7c3fd014964736f6c634300081b0033",
    "sourceMap": "582:3779:111:-:0;;;;;;;;;;;;;-1:-1:-1;;582:3779:111;;;;-1:-1:-1;;;;;582:3779:111;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;582:3779:111;;;;;;1923:10;;582:3779;;;;;;;;1923:10;582:3779;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;582:3779:111;;;;;;-1:-1:-1;582:3779:111;;;;;-1:-1:-1;582:3779:111",
    "linkReferences": {}
  },
  "deployedBytecode": {
    "object": "0x6080806040526004361015610012575f80fd5b5f3560e01c90816301ffc9a71461068b575080633786930d1461066157806352155df71461052257806357f784ba146103755780638150864d14610331578063887d686d146102fe5780638da3721a146101c75763c266461014610074575f80fd5b346101c357610082366106de565b6040516328c44a9960e21b8152600481018290529091905f816024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9081156101b8575f91610196575b5060c001516001600160a01b0316330361018757805f525f60205260405f20825f5260205260ff60405f205416158015610171575b61016257805f525f60205260405f20825f5260205260405f2060ff198154169055815f5260016020525f60408120557f137a0dfcce695307235e039aa2ae70da634ed7f10a6a5a536b3a8c15d758aa1e5f80a3005b6339abb17d60e01b5f5260045ffd5b50815f5260016020528060405f2054141561010d565b630feaf7d560e31b5f5260045ffd5b6101b291503d805f833e6101aa8183610725565b8101906107fb565b5f6100d8565b6040513d5f823e3d90fd5b5f80fd5b346101c35760603660031901126101c35760043567ffffffffffffffff81116101c35761014060031982360301126101c35760405190610206826106f4565b806004013582526024810135602083015261022360448201610747565b604083015261023460648201610747565b606083015261024560848201610747565b608083015260a481013560a083015261026060c4820161075c565b60c083015261027160e4820161075c565b60e083015261010481013580151581036101c3576101008301526101248101359067ffffffffffffffff82116101c35760046102b0923692010161078c565b61012082015260243567ffffffffffffffff81116101c3576102d690369060040161078c565b50515f525f60205260405f206044355f52602052602060ff60405f2054166040519015158152f35b346101c35761030c366106de565b905f525f60205260405f20905f52602052602060ff60405f2054166040519015158152f35b346101c3575f3660031901126101c3576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346101c357610383366106de565b6040516328c44a9960e21b8152600481018290529091907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165f82602481845afa9081156101b8576024925f92610504575b505f90604051938480926328c44a9960e21b82528760048301525afa9182156101b8575f926104e8575b5060c001516001600160a01b031633036104d957518181159182156104ce575b50506104bf57815f52600160205260405f20541515806104a9575b61049a57805f525f60205260405f20825f5260205260405f20600160ff19825416179055815f5260016020528060405f20557fd22fd165f2b163f7b94d6e2b15443105c17bfae3fa2242150644ab76a95d532e5f80a3005b633ea893c560e21b5f5260045ffd5b50815f5260016020528060405f20541415610442565b630ebe58ef60e11b5f5260045ffd5b141590508184610427565b6331eb5cd360e11b5f5260045ffd5b6104fd9192503d805f833e6101aa8183610725565b9084610407565b5f91925061051b903d8084833e6101aa8183610725565b91906103dd565b346101c357610530366106de565b6040516328c44a9960e21b8152600481018390529091907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316905f81602481855afa9081156101b8575f91610647575b5060e08101516001600160a01b0316331415908161062f575b50610620575f602491604051928380926328c44a9960e21b82528760048301525afa9081156101b8575f91610606575b5060c001516001600160a01b0316907f93ece828de650a0159786850192cbcd721ab720e1ee81b00365a5c8d63886b315f80a4005b61061a91503d805f833e6101aa8183610725565b836105d1565b63020a627d60e11b5f5260045ffd5b60c001516001600160a01b03163314159050846105a1565b61065b91503d805f833e6101aa8183610725565b84610588565b346101c35760203660031901126101c3576004355f526001602052602060405f2054604051908152f35b346101c35760203660031901126101c3576004359063ffffffff60e01b82168092036101c3576020916346d1b90d60e11b81149081156106cd575b5015158152f35b6301ffc9a760e01b149050836106c6565b60409060031901126101c3576004359060243590565b610140810190811067ffffffffffffffff82111761071157604052565b634e487b7160e01b5f52604160045260245ffd5b90601f8019910116810190811067ffffffffffffffff82111761071157604052565b359067ffffffffffffffff821682036101c357565b35906001600160a01b03821682036101c357565b67ffffffffffffffff811161071157601f01601f191660200190565b81601f820112156101c3578035906107a382610770565b926107b16040519485610725565b828452602083830101116101c357815f926020809301838601378301015290565b519067ffffffffffffffff821682036101c357565b51906001600160a01b03821682036101c357565b6020818303126101c35780519067ffffffffffffffff82116101c3570190610140828203126101c35760405191610831836106f4565b805183526020810151602084015261084b604082016107d2565b604084015261085c606082016107d2565b606084015261086d608082016107d2565b608084015260a081015160a084015261088860c082016107e7565b60c084015261089960e082016107e7565b60e084015261010081015180151581036101c3576101008401526101208101519067ffffffffffffffff82116101c3570181601f820112156101c3578051906108e182610770565b926108ef6040519485610725565b828452602083830101116101c357815f9260208093018386015e830101526101208201529056fea26469706673582212209b6a79ea737f93da3f5148cab7368c244b7c735f67d3f60aea133fe7c3fd014964736f6c634300081b0033",
    "sourceMap": "582:3779:111:-:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;-1:-1:-1;;;3076:27:111;;582:3779;3076:27;;582:3779;;;;;;-1:-1:-1;582:3779:111;3076:27;582:3779;3076:3;-1:-1:-1;;;;;582:3779:111;3076:27;;;;;;;582:3779;3076:27;;;582:3779;-1:-1:-1;3118:16:111;;582:3779;-1:-1:-1;;;;;582:3779:111;3138:10;3118:30;3114:92;;582:3779;;;;;;;;;;;;;;;;;;;;3220:37;582:3779;;3220:85;;582:3779;3216:147;;582:3779;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;3484:42;582:3779;3484:42;;582:3779;3216:147;3328:24;;;582:3779;3328:24;582:3779;;3328:24;3220:85;582:3779;;;;3261:19;582:3779;;;;;;;3261:44;;3220:85;;3114:92;3171:24;;;582:3779;3171:24;582:3779;;3171:24;3076:27;;;;;;582:3779;3076:27;;;;;;:::i;:::-;;;;;:::i;:::-;;;;;582:3779;;;;;;;;;;;;;;;;;;;-1:-1:-1;;582:3779:111;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;582:3779:111;;;;;;1519:25;-1:-1:-1;;;;;582:3779:111;;;;;;;;;;;;;:::i;:::-;;;-1:-1:-1;;;2125:27:111;;582:3779;2125:27;;582:3779;;;;;;2125:3;-1:-1:-1;;;;;582:3779:111;-1:-1:-1;582:3779:111;2125:27;582:3779;;2125:27;;;;;;;;;582:3779;2125:27;;;582:3779;;;;;;;;;;;;;2195:32;;;582:3779;2195:32;;582:3779;2195:32;;;;;;;582:3779;2195:32;;;582:3779;-1:-1:-1;2242:16:111;;582:3779;-1:-1:-1;;;;;582:3779:111;2262:10;2242:30;2238:94;;582:3779;2346:29;;;:64;;;;;582:3779;2342:122;;;;582:3779;;;2557:19;582:3779;;;;;;2557:42;;:90;;;582:3779;2553:164;;582:3779;;;;;;;;;;;;;;;;;2557:19;582:3779;;;;;;;;;;;2557:19;582:3779;;;;;;;2839:39;582:3779;2839:39;;582:3779;2553:164;2670:36;;;582:3779;2670:36;582:3779;;2670:36;2557:90;582:3779;;;;2557:19;582:3779;;;;;;;2603:44;;2557:90;;2342:122;2433:20;;;582:3779;2433:20;582:3779;;2433:20;2346:64;2379:31;;;-1:-1:-1;2346:64:111;;;;2238:94;2295:26;;;582:3779;2295:26;582:3779;;2295:26;2195:32;;;;;;;582:3779;2195:32;;;;;;:::i;:::-;;;;;2125:27;582:3779;2125:27;;;;;;;;;;;;;;:::i;:::-;;;;;582:3779;;;;;;;:::i;:::-;;;-1:-1:-1;;;3722:32:111;;582:3779;3722:32;;582:3779;;;;;;3722:3;-1:-1:-1;;;;;582:3779:111;;-1:-1:-1;582:3779:111;3722:32;582:3779;;3722:32;;;;;;;582:3779;3722:32;;;582:3779;-1:-1:-1;582:3779:111;3768:20;;582:3779;-1:-1:-1;;;;;582:3779:111;3792:10;3768:34;;;;:73;;582:3779;3764:144;;;582:3779;3722:32;582:3779;;;;;;;;;;3946:27;;;582:3779;3946:27;;582:3779;3946:27;;;;;;;582:3779;3946:27;;;582:3779;-1:-1:-1;4025:16:111;;582:3779;-1:-1:-1;;;;;582:3779:111;;3989:62;582:3779;;3989:62;582:3779;3946:27;;;;;;582:3779;3946:27;;;;;;:::i;:::-;;;;3764:144;3864:33;;;582:3779;3864:33;582:3779;;3864:33;3768:73;3806:21;;582:3779;-1:-1:-1;;;;;582:3779:111;3792:10;3806:35;;;-1:-1:-1;3768:73:111;;;3722:32;;;;;;582:3779;3722:32;;;;;;:::i;:::-;;;;582:3779;;;;;;-1:-1:-1;;582:3779:111;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;582:3779:111;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;573:41:88;;;:81;;;;582:3779:111;;;;;;;573:81:88;-1:-1:-1;;;829:40:77;;-1:-1:-1;573:81:88;;;582:3779:111;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;:::o;:::-;;;;-1:-1:-1;582:3779:111;;;;;-1:-1:-1;582:3779:111;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;:::o;:::-;;;-1:-1:-1;;;;;582:3779:111;;;;;;:::o;:::-;;;;;;;;-1:-1:-1;;582:3779:111;;;;:::o;:::-;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;-1:-1:-1;582:3779:111;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;:::o;:::-;;;-1:-1:-1;;;;;582:3779:111;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;-1:-1:-1;582:3779:111;;;;;;;;;;;;;;;;;;:::o",
    "linkReferences": {},
    "immutableReferences": {
      "61577": [
        {
          "start": 160,
          "length": 32
        },
        {
          "start": 838,
          "length": 32
        },
        {
          "start": 924,
          "length": 32
        },
        {
          "start": 1353,
          "length": 32
        }
      ]
    }
  },
  "methodIdentifiers": {
    "check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)": "8da3721a",
    "confirm(bytes32,bytes32)": "57f784ba",
    "confirmations(bytes32,bytes32)": "887d686d",
    "eas()": "8150864d",
    "escrowToFulfillment(bytes32)": "3786930d",
    "requestConfirmation(bytes32,bytes32)": "52155df7",
    "revoke(bytes32,bytes32)": "c2664610",
    "supportsInterface(bytes4)": "01ffc9a7"
  },
  "rawMetadata": "{\"compiler\":{\"version\":\"0.8.27+commit.40a35a09\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[{\"internalType\":\"contract IEAS\",\"name\":\"_eas\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"AnotherFulfillmentAlreadyConfirmed\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidFulfillment\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"NoConfirmationToRevoke\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"UnauthorizedConfirmation\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"UnauthorizedConfirmationRequest\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"UnauthorizedRevocation\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"fulfillment\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrow\",\"type\":\"bytes32\"}],\"name\":\"ConfirmationMade\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"fulfillment\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"confirmer\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrow\",\"type\":\"bytes32\"}],\"name\":\"ConfirmationRequested\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"fulfillment\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrow\",\"type\":\"bytes32\"}],\"name\":\"ConfirmationRevoked\",\"type\":\"event\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"fulfillment\",\"type\":\"tuple\"},{\"internalType\":\"bytes\",\"name\":\"\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"}],\"name\":\"check\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"_fulfillment\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"_escrow\",\"type\":\"bytes32\"}],\"name\":\"confirm\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"confirmations\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"eas\",\"outputs\":[{\"internalType\":\"contract IEAS\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"escrowToFulfillment\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"_fulfillment\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"_escrow\",\"type\":\"bytes32\"}],\"name\":\"requestConfirmation\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"_fulfillment\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"_escrow\",\"type\":\"bytes32\"}],\"name\":\"revoke\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"}],\"devdoc\":{\"details\":\"The escrow attestation recipient is the confirmer; at most one fulfillment may be confirmed per escrow.\",\"kind\":\"dev\",\"methods\":{\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"params\":{\"demand\":\"Arbiter-specific demand data encoded by the escrow creator.\",\"escrowUid\":\"The UID of the escrow attestation being fulfilled.\",\"fulfillment\":\"The EAS attestation being used as fulfillment.\"}},\"constructor\":{\"params\":{\"_eas\":\"EAS contract used to load attestations.\"}},\"supportsInterface(bytes4)\":{\"details\":\"Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section] to learn more about how these ids are created. This function call must use less than 30 000 gas.\"}},\"title\":\"ExclusiveRevocableConfirmationArbiter\",\"version\":1},\"userdoc\":{\"events\":{\"ConfirmationMade(bytes32,bytes32)\":{\"notice\":\"Emitted when an escrow recipient confirms a fulfillment.\"},\"ConfirmationRequested(bytes32,address,bytes32)\":{\"notice\":\"Emitted by a fulfillment participant to request recipient confirmation.\"},\"ConfirmationRevoked(bytes32,bytes32)\":{\"notice\":\"Emitted when an escrow recipient revokes a confirmation.\"}},\"kind\":\"user\",\"methods\":{\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"notice\":\"Returns true when `fulfillment` satisfies `demand` for `escrowUid`.\"},\"confirm(bytes32,bytes32)\":{\"notice\":\"Confirms a fulfillment for an escrow as the escrow recipient.\"},\"confirmations(bytes32,bytes32)\":{\"notice\":\"Whether a fulfillment is confirmed for an escrow.\"},\"eas()\":{\"notice\":\"EAS contract used to load escrow and fulfillment attestations.\"},\"escrowToFulfillment(bytes32)\":{\"notice\":\"Currently confirmed fulfillment for each escrow, or zero if none.\"},\"requestConfirmation(bytes32,bytes32)\":{\"notice\":\"Requests confirmation from the escrow recipient.\"},\"revoke(bytes32,bytes32)\":{\"notice\":\"Revokes the currently confirmed fulfillment as the escrow recipient.\"}},\"notice\":\"Accepts only the currently confirmed fulfillment for an escrow, with recipient-controlled revocation.\",\"version\":1}},\"settings\":{\"compilationTarget\":{\"src/arbiters/confirmation/ExclusiveRevocableConfirmationArbiter.sol\":\"ExclusiveRevocableConfirmationArbiter\"},\"evmVersion\":\"prague\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[\":@eas/=lib/eas-contracts/contracts/\",\":@erc8004/=lib/erc-8004-contracts/contracts/\",\":@openzeppelin/=lib/openzeppelin-contracts/\",\":@src/=src/\",\":@test/=test/\",\":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/\",\":eas-contracts/=lib/eas-contracts/contracts/\",\":erc-8004-contracts/=lib/erc-8004-contracts/contracts/\",\":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/\",\":eth-gas-reporter/=lib/eas-contracts/node_modules/eth-gas-reporter/\",\":forge-std/=lib/forge-std/src/\",\":halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/\",\":hardhat-deploy/=lib/eas-contracts/node_modules/hardhat-deploy/\",\":hardhat/=lib/eas-contracts/node_modules/hardhat/\",\":openzeppelin-contracts/=lib/openzeppelin-contracts/\"],\"viaIR\":true},\"sources\":{\"lib/eas-contracts/contracts/Common.sol\":{\"keccak256\":\"0x957bd2e6d0d6d637f86208b135c29fbaf4412cb08e5e7a61ede16b80561bf685\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://da1dc9aedbb1d4d39c46c2235918d3adfbc5741dd34a46010cf425d134e7936d\",\"dweb:/ipfs/QmWUk6bXnLaghS2riF3GTFEeURCzgYFMA5woa6AsgPwEgc\"]},\"lib/eas-contracts/contracts/IEAS.sol\":{\"keccak256\":\"0xdad0674defce04905dc7935f2756d6c477a6e876c0b1b7094b112a862f164c12\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://49e448c26c08952df034692d2ab3519dd40a1ebbeae4ce68b294567441933880\",\"dweb:/ipfs/QmWHcudjskUSCjgqsNWE65LVfWvcYB2vBn8RB1SmzvRLNR\"]},\"lib/eas-contracts/contracts/ISchemaRegistry.sol\":{\"keccak256\":\"0xea97dcd36a0c422169cbaac06698249e199049b627c16bff93fb8ab829058754\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://d453a929ef64a69cd31195ec2ee5ed1193bfa29f633e13c960e92154c37ad158\",\"dweb:/ipfs/QmXs1Z3njbHs2EMgHonrZDfcwdog4kozHY5tYNrhZK5yqz\"]},\"lib/eas-contracts/contracts/ISemver.sol\":{\"keccak256\":\"0x04a67939b4e1a8d0a51101b8f69f8882930bbdc66319f38023828625b5d1ff18\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://3dd543fa0e33cef1ea757627f9c2a10a66ee1ce17aa9087f437c5b53a903c7f0\",\"dweb:/ipfs/QmXsy6UsGBzF9zPCCjmiwPpCcX3tHqU13TmR67B69tKnR6\"]},\"lib/eas-contracts/contracts/resolver/ISchemaResolver.sol\":{\"keccak256\":\"0xb7d1961ed928c620cddf35c2bf46845b10828bc5d73145214630202ed355b6bb\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://cf1cabacfb15c9bace8280b540b52e5aa440e1b4eba675f9782c34ce0f03902f\",\"dweb:/ipfs/QmakYcK4xbrijzvoaBCmBJK6HeaBqbXxWKtDQ1z62aXwCR\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/ERC165.sol\":{\"keccak256\":\"0x2d9dc2fe26180f74c11c13663647d38e259e45f95eb88f57b61d2160b0109d3e\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://81233d1f98060113d9922180bb0f14f8335856fe9f339134b09335e9f678c377\",\"dweb:/ipfs/QmWh6R35SarhAn4z2wH8SU456jJSYL2FgucfTFgbHJJN4E\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol\":{\"keccak256\":\"0x8891738ffe910f0cf2da09566928589bf5d63f4524dd734fd9cedbac3274dd5c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://971f954442df5c2ef5b5ebf1eb245d7105d9fbacc7386ee5c796df1d45b21617\",\"dweb:/ipfs/QmadRjHbkicwqwwh61raUEapaVEtaLMcYbQZWs9gUkgj3u\"]},\"src/BaseArbiter.sol\":{\"keccak256\":\"0x27fa97834bcd6e592f3b534e64859b208c688363d33fb9b62436d009ffff3ed1\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://b61ac6195ae644325adf77fdb301651cddfca4b63d9db5123ee075869f3784aa\",\"dweb:/ipfs/QmYRu5hER8gaMjqyY5bDV9EAwVN12CbS3Z2bW8dLp7sPSE\"]},\"src/IArbiter.sol\":{\"keccak256\":\"0x00f3f5d8460c738eff4a776cf309efe38342fcc951abfe97d1c2e285acb1e330\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://7201a176f3d5c3d01ca13bbcd9ef5587effe8fabf20e0b8f81f2d6ee362269b9\",\"dweb:/ipfs/QmXn9aSvoGPQuNTxe3mM47RNQ1bfYCEczQCYsDDM9ohc8M\"]},\"src/arbiters/confirmation/ExclusiveRevocableConfirmationArbiter.sol\":{\"keccak256\":\"0x5b8e33b1d5d8c97a35fa915b20a10eee46c61fb08e64151ba95d875fc2d3540e\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://9ccb936e7bafe7c87c36454db275653da3b7a529a8c6203b1e4723e7fc79fb64\",\"dweb:/ipfs/QmWL7JUv9R5qfUNVDW7BCwpmCTfgiLM4kEg1BAdwfEpUCj\"]},\"src/libraries/ArbiterUtils.sol\":{\"keccak256\":\"0xb87e2bfb9c7292daf6426fbedc09c8683b92841d1b92e7359c0ff94d42be632f\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://3acf498c3c59891d76db768ea57d8f7f6b4010dcbaf44a5f93d95d72f0b12441\",\"dweb:/ipfs/QmVbkioM8dWwYxqatm1dyo9PRFNZ6c7Kbang7pozbnyS7j\"]}},\"version\":1}",
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
          "name": "AnotherFulfillmentAlreadyConfirmed"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidFulfillment"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "NoConfirmationToRevoke"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "UnauthorizedConfirmation"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "UnauthorizedConfirmationRequest"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "UnauthorizedRevocation"
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
            }
          ],
          "type": "event",
          "name": "ConfirmationMade",
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
              "internalType": "address",
              "name": "confirmer",
              "type": "address",
              "indexed": true
            },
            {
              "internalType": "bytes32",
              "name": "escrow",
              "type": "bytes32",
              "indexed": true
            }
          ],
          "type": "event",
          "name": "ConfirmationRequested",
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
            }
          ],
          "type": "event",
          "name": "ConfirmationRevoked",
          "anonymous": false
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
              "name": "",
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
              "internalType": "bytes32",
              "name": "_fulfillment",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "_escrow",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "confirm"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "confirmations",
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
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "name": "escrowToFulfillment",
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
              "name": "_fulfillment",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "_escrow",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "requestConfirmation"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_fulfillment",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "_escrow",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function",
          "name": "revoke"
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
              "_eas": "EAS contract used to load attestations."
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
          "confirm(bytes32,bytes32)": {
            "notice": "Confirms a fulfillment for an escrow as the escrow recipient."
          },
          "confirmations(bytes32,bytes32)": {
            "notice": "Whether a fulfillment is confirmed for an escrow."
          },
          "eas()": {
            "notice": "EAS contract used to load escrow and fulfillment attestations."
          },
          "escrowToFulfillment(bytes32)": {
            "notice": "Currently confirmed fulfillment for each escrow, or zero if none."
          },
          "requestConfirmation(bytes32,bytes32)": {
            "notice": "Requests confirmation from the escrow recipient."
          },
          "revoke(bytes32,bytes32)": {
            "notice": "Revokes the currently confirmed fulfillment as the escrow recipient."
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
        "src/arbiters/confirmation/ExclusiveRevocableConfirmationArbiter.sol": "ExclusiveRevocableConfirmationArbiter"
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
      "src/arbiters/confirmation/ExclusiveRevocableConfirmationArbiter.sol": {
        "keccak256": "0x5b8e33b1d5d8c97a35fa915b20a10eee46c61fb08e64151ba95d875fc2d3540e",
        "urls": [
          "bzz-raw://9ccb936e7bafe7c87c36454db275653da3b7a529a8c6203b1e4723e7fc79fb64",
          "dweb:/ipfs/QmWL7JUv9R5qfUNVDW7BCwpmCTfgiLM4kEg1BAdwfEpUCj"
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
  "id": 111
} as const;
