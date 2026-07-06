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
      "name": "escrowConfirmed",
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
          "type": "bool",
          "internalType": "bool"
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
      "type": "error",
      "name": "EscrowAlreadyConfirmed",
      "inputs": []
    },
    {
      "type": "error",
      "name": "InvalidFulfillment",
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
    }
  ],
  "bytecode": {
    "object": "0x60a034607457601f61088538819003918201601f19168301916001600160401b03831184841017607857808492602094604052833981010312607457516001600160a01b03811681036074576080526040516107f8908161008d82396080518181816101ec01528181610271015261041f0152f35b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe6080806040526004361015610012575f80fd5b5f3560e01c90816301ffc9a7146105375750806352155df7146103f857806357f784ba1461024a5780637556cad51461021b5780638150864d146101d7578063887d686d146101a457638da3721a14610069575f80fd5b346101a05760603660031901126101a05760043567ffffffffffffffff81116101a05761014060031982360301126101a057604051906100a8826105a0565b80600401358252602481013560208301526100c5604482016105f3565b60408301526100d6606482016105f3565b60608301526100e7608482016105f3565b608083015260a481013560a083015261010260c48201610608565b60c083015261011360e48201610608565b60e083015261010481013580151581036101a0576101008301526101248101359067ffffffffffffffff82116101a05760046101529236920101610638565b61012082015260243567ffffffffffffffff81116101a057610178903690600401610638565b50515f525f60205260405f206044355f52602052602060ff60405f2054166040519015158152f35b5f80fd5b346101a0576101b23661058a565b905f525f60205260405f20905f52602052602060ff60405f2054166040519015158152f35b346101a0575f3660031901126101a0576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346101a05760203660031901126101a0576004355f526001602052602060ff60405f2054166040519015158152f35b346101a0576102583661058a565b6040516328c44a9960e21b8152600481018290529091907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165f82602481845afa9081156103cf576024925f926103da575b505f90604051938480926328c44a9960e21b82528760048301525afa9182156103cf575f926103ab575b5060c001516001600160a01b0316330361039c5751818115918215610391575b505061038257815f52600160205260ff60405f20541661037357805f525f60205260405f20825f5260205260405f20600160ff19825416179055815f52600160205260405f20600160ff198254161790557fd22fd165f2b163f7b94d6e2b15443105c17bfae3fa2242150644ab76a95d532e5f80a3005b6336f2b05360e21b5f5260045ffd5b630ebe58ef60e11b5f5260045ffd5b1415905081846102fc565b6331eb5cd360e11b5f5260045ffd5b6103c89192503d805f833e6103c081836105d1565b8101906106a7565b90846102dc565b6040513d5f823e3d90fd5b5f9192506103f1903d8084833e6103c081836105d1565b91906102b2565b346101a0576104063661058a565b6040516328c44a9960e21b8152600481018390529091907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316905f81602481855afa9081156103cf575f9161051d575b5060e08101516001600160a01b03163314159081610505575b506104f6575f602491604051928380926328c44a9960e21b82528760048301525afa9081156103cf575f916104dc575b5060c001516001600160a01b0316907f93ece828de650a0159786850192cbcd721ab720e1ee81b00365a5c8d63886b315f80a4005b6104f091503d805f833e6103c081836105d1565b836104a7565b63020a627d60e11b5f5260045ffd5b60c001516001600160a01b0316331415905084610477565b61053191503d805f833e6103c081836105d1565b8461045e565b346101a05760203660031901126101a0576004359063ffffffff60e01b82168092036101a0576020916346d1b90d60e11b8114908115610579575b5015158152f35b6301ffc9a760e01b14905083610572565b60409060031901126101a0576004359060243590565b610140810190811067ffffffffffffffff8211176105bd57604052565b634e487b7160e01b5f52604160045260245ffd5b90601f8019910116810190811067ffffffffffffffff8211176105bd57604052565b359067ffffffffffffffff821682036101a057565b35906001600160a01b03821682036101a057565b67ffffffffffffffff81116105bd57601f01601f191660200190565b81601f820112156101a05780359061064f8261061c565b9261065d60405194856105d1565b828452602083830101116101a057815f926020809301838601378301015290565b519067ffffffffffffffff821682036101a057565b51906001600160a01b03821682036101a057565b6020818303126101a05780519067ffffffffffffffff82116101a0570190610140828203126101a057604051916106dd836105a0565b80518352602081015160208401526106f76040820161067e565b60408401526107086060820161067e565b60608401526107196080820161067e565b608084015260a081015160a084015261073460c08201610693565b60c084015261074560e08201610693565b60e084015261010081015180151581036101a0576101008401526101208101519067ffffffffffffffff82116101a0570181601f820112156101a05780519061078d8261061c565b9261079b60405194856105d1565b828452602083830101116101a057815f9260208093018386015e830101526101208201529056fea2646970667358221220af29f50a082d3b51fdeeb88c3dc036821dfa62d13234cf8f45c785ea5256bc6164736f6c634300081b0033",
    "sourceMap": "564:2705:112:-:0;;;;;;;;;;;;;-1:-1:-1;;564:2705:112;;;;-1:-1:-1;;;;;564:2705:112;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;564:2705:112;;;;;;1648:10;;564:2705;;;;;;;;1648:10;564:2705;;;;;;;;;;;;;;;;;-1:-1:-1;564:2705:112;;;;;;-1:-1:-1;564:2705:112;;;;;-1:-1:-1;564:2705:112",
    "linkReferences": {}
  },
  "deployedBytecode": {
    "object": "0x6080806040526004361015610012575f80fd5b5f3560e01c90816301ffc9a7146105375750806352155df7146103f857806357f784ba1461024a5780637556cad51461021b5780638150864d146101d7578063887d686d146101a457638da3721a14610069575f80fd5b346101a05760603660031901126101a05760043567ffffffffffffffff81116101a05761014060031982360301126101a057604051906100a8826105a0565b80600401358252602481013560208301526100c5604482016105f3565b60408301526100d6606482016105f3565b60608301526100e7608482016105f3565b608083015260a481013560a083015261010260c48201610608565b60c083015261011360e48201610608565b60e083015261010481013580151581036101a0576101008301526101248101359067ffffffffffffffff82116101a05760046101529236920101610638565b61012082015260243567ffffffffffffffff81116101a057610178903690600401610638565b50515f525f60205260405f206044355f52602052602060ff60405f2054166040519015158152f35b5f80fd5b346101a0576101b23661058a565b905f525f60205260405f20905f52602052602060ff60405f2054166040519015158152f35b346101a0575f3660031901126101a0576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346101a05760203660031901126101a0576004355f526001602052602060ff60405f2054166040519015158152f35b346101a0576102583661058a565b6040516328c44a9960e21b8152600481018290529091907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165f82602481845afa9081156103cf576024925f926103da575b505f90604051938480926328c44a9960e21b82528760048301525afa9182156103cf575f926103ab575b5060c001516001600160a01b0316330361039c5751818115918215610391575b505061038257815f52600160205260ff60405f20541661037357805f525f60205260405f20825f5260205260405f20600160ff19825416179055815f52600160205260405f20600160ff198254161790557fd22fd165f2b163f7b94d6e2b15443105c17bfae3fa2242150644ab76a95d532e5f80a3005b6336f2b05360e21b5f5260045ffd5b630ebe58ef60e11b5f5260045ffd5b1415905081846102fc565b6331eb5cd360e11b5f5260045ffd5b6103c89192503d805f833e6103c081836105d1565b8101906106a7565b90846102dc565b6040513d5f823e3d90fd5b5f9192506103f1903d8084833e6103c081836105d1565b91906102b2565b346101a0576104063661058a565b6040516328c44a9960e21b8152600481018390529091907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316905f81602481855afa9081156103cf575f9161051d575b5060e08101516001600160a01b03163314159081610505575b506104f6575f602491604051928380926328c44a9960e21b82528760048301525afa9081156103cf575f916104dc575b5060c001516001600160a01b0316907f93ece828de650a0159786850192cbcd721ab720e1ee81b00365a5c8d63886b315f80a4005b6104f091503d805f833e6103c081836105d1565b836104a7565b63020a627d60e11b5f5260045ffd5b60c001516001600160a01b0316331415905084610477565b61053191503d805f833e6103c081836105d1565b8461045e565b346101a05760203660031901126101a0576004359063ffffffff60e01b82168092036101a0576020916346d1b90d60e11b8114908115610579575b5015158152f35b6301ffc9a760e01b14905083610572565b60409060031901126101a0576004359060243590565b610140810190811067ffffffffffffffff8211176105bd57604052565b634e487b7160e01b5f52604160045260245ffd5b90601f8019910116810190811067ffffffffffffffff8211176105bd57604052565b359067ffffffffffffffff821682036101a057565b35906001600160a01b03821682036101a057565b67ffffffffffffffff81116105bd57601f01601f191660200190565b81601f820112156101a05780359061064f8261061c565b9261065d60405194856105d1565b828452602083830101116101a057815f926020809301838601378301015290565b519067ffffffffffffffff821682036101a057565b51906001600160a01b03821682036101a057565b6020818303126101a05780519067ffffffffffffffff82116101a0570190610140828203126101a057604051916106dd836105a0565b80518352602081015160208401526106f76040820161067e565b60408401526107086060820161067e565b60608401526107196080820161067e565b608084015260a081015160a084015261073460c08201610693565b60c084015261074560e08201610693565b60e084015261010081015180151581036101a0576101008401526101208101519067ffffffffffffffff82116101a0570181601f820112156101a05780519061078d8261061c565b9261079b60405194856105d1565b828452602083830101116101a057815f9260208093018386015e830101526101208201529056fea2646970667358221220af29f50a082d3b51fdeeb88c3dc036821dfa62d13234cf8f45c785ea5256bc6164736f6c634300081b0033",
    "sourceMap": "564:2705:112:-:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;564:2705:112;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;564:2705:112;;;;;;1262:25;-1:-1:-1;;;;;564:2705:112;;;;;;;;;;;;-1:-1:-1;;564:2705:112;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;-1:-1:-1;;;1850:27:112;;564:2705;1850:27;;564:2705;;;;;;1850:3;-1:-1:-1;;;;;564:2705:112;-1:-1:-1;564:2705:112;1850:27;564:2705;;1850:27;;;;;;;;;564:2705;1850:27;;;564:2705;;;;;;;;;;;;;1920:32;;;564:2705;1920:32;;564:2705;1920:32;;;;;;;564:2705;1920:32;;;564:2705;-1:-1:-1;1967:16:112;;564:2705;-1:-1:-1;;;;;564:2705:112;1987:10;1967:30;1963:94;;564:2705;2071:29;;;:64;;;;;564:2705;2067:122;;;;564:2705;;;2203:15;564:2705;;;;;;;;2199:86;;564:2705;;;;;;;;;;;;;;;;;2203:15;564:2705;;;;;;;;;;;2203:15;564:2705;;;;;2203:15;564:2705;;;;;;;;2395:39;564:2705;2395:39;;564:2705;2199:86;2250:24;;;564:2705;2250:24;564:2705;;2250:24;2067:122;2158:20;;;564:2705;2158:20;564:2705;;2158:20;2071:64;2104:31;;;-1:-1:-1;2071:64:112;;;;1963:94;2020:26;;;564:2705;2020:26;564:2705;;2020:26;1920:32;;;;;;;564:2705;1920:32;;;;;;:::i;:::-;;;;;:::i;:::-;;;;;;564:2705;;;;;;;;;1850:27;564:2705;1850:27;;;;;;;;;;;;;;:::i;:::-;;;;;564:2705;;;;;;;:::i;:::-;;;-1:-1:-1;;;2630:32:112;;564:2705;2630:32;;564:2705;;;;;;2630:3;-1:-1:-1;;;;;564:2705:112;;-1:-1:-1;564:2705:112;2630:32;564:2705;;2630:32;;;;;;;564:2705;2630:32;;;564:2705;-1:-1:-1;564:2705:112;2676:20;;564:2705;-1:-1:-1;;;;;564:2705:112;2700:10;2676:34;;;;:73;;564:2705;2672:144;;;564:2705;2630:32;564:2705;;;;;;;;;;2854:27;;;564:2705;2854:27;;564:2705;2854:27;;;;;;;564:2705;2854:27;;;564:2705;-1:-1:-1;2933:16:112;;564:2705;-1:-1:-1;;;;;564:2705:112;;2897:62;564:2705;;2897:62;564:2705;2854:27;;;;;;564:2705;2854:27;;;;;;:::i;:::-;;;;2672:144;2772:33;;;564:2705;2772:33;564:2705;;2772:33;2676:73;2714:21;;564:2705;-1:-1:-1;;;;;564:2705:112;2700:10;2714:35;;;-1:-1:-1;2676:73:112;;;2630:32;;;;;;564:2705;2630:32;;;;;;:::i;:::-;;;;564:2705;;;;;;-1:-1:-1;;564:2705:112;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;573:41:88;;;:81;;;;564:2705:112;;;;;;;573:81:88;-1:-1:-1;;;829:40:77;;-1:-1:-1;573:81:88;;;564:2705:112;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;:::o;:::-;;;;-1:-1:-1;564:2705:112;;;;;-1:-1:-1;564:2705:112;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;:::o;:::-;;;-1:-1:-1;;;;;564:2705:112;;;;;;:::o;:::-;;;;;;;;-1:-1:-1;;564:2705:112;;;;:::o;:::-;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;-1:-1:-1;564:2705:112;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;:::o;:::-;;;-1:-1:-1;;;;;564:2705:112;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;;;;;;;;;;-1:-1:-1;564:2705:112;;;;;;;;;;;;;;;;;;:::o",
    "linkReferences": {},
    "immutableReferences": {
      "61875": [
        {
          "start": 492,
          "length": 32
        },
        {
          "start": 625,
          "length": 32
        },
        {
          "start": 1055,
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
    "escrowConfirmed(bytes32)": "7556cad5",
    "requestConfirmation(bytes32,bytes32)": "52155df7",
    "supportsInterface(bytes4)": "01ffc9a7"
  },
  "rawMetadata": "{\"compiler\":{\"version\":\"0.8.27+commit.40a35a09\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[{\"internalType\":\"contract IEAS\",\"name\":\"_eas\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"EscrowAlreadyConfirmed\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidFulfillment\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"UnauthorizedConfirmation\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"UnauthorizedConfirmationRequest\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"fulfillment\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrow\",\"type\":\"bytes32\"}],\"name\":\"ConfirmationMade\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"fulfillment\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"confirmer\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"escrow\",\"type\":\"bytes32\"}],\"name\":\"ConfirmationRequested\",\"type\":\"event\"},{\"inputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"uid\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"schema\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"time\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"expirationTime\",\"type\":\"uint64\"},{\"internalType\":\"uint64\",\"name\":\"revocationTime\",\"type\":\"uint64\"},{\"internalType\":\"bytes32\",\"name\":\"refUID\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"attester\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"revocable\",\"type\":\"bool\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"internalType\":\"struct Attestation\",\"name\":\"fulfillment\",\"type\":\"tuple\"},{\"internalType\":\"bytes\",\"name\":\"\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"escrowUid\",\"type\":\"bytes32\"}],\"name\":\"check\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"_fulfillment\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"_escrow\",\"type\":\"bytes32\"}],\"name\":\"confirm\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"confirmations\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"eas\",\"outputs\":[{\"internalType\":\"contract IEAS\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"escrowConfirmed\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"_fulfillment\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"_escrow\",\"type\":\"bytes32\"}],\"name\":\"requestConfirmation\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"}],\"devdoc\":{\"details\":\"The escrow attestation recipient is the confirmer; only one fulfillment may ever be confirmed per escrow.\",\"kind\":\"dev\",\"methods\":{\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"params\":{\"demand\":\"Arbiter-specific demand data encoded by the escrow creator.\",\"escrowUid\":\"The UID of the escrow attestation being fulfilled.\",\"fulfillment\":\"The EAS attestation being used as fulfillment.\"}},\"constructor\":{\"params\":{\"_eas\":\"EAS contract used to load attestations.\"}},\"supportsInterface(bytes4)\":{\"details\":\"Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section] to learn more about how these ids are created. This function call must use less than 30 000 gas.\"}},\"title\":\"ExclusiveUnrevocableConfirmationArbiter\",\"version\":1},\"userdoc\":{\"events\":{\"ConfirmationMade(bytes32,bytes32)\":{\"notice\":\"Emitted when an escrow recipient confirms a fulfillment.\"},\"ConfirmationRequested(bytes32,address,bytes32)\":{\"notice\":\"Emitted by a fulfillment participant to request recipient confirmation.\"}},\"kind\":\"user\",\"methods\":{\"check((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes),bytes,bytes32)\":{\"notice\":\"Returns true when `fulfillment` satisfies `demand` for `escrowUid`.\"},\"confirm(bytes32,bytes32)\":{\"notice\":\"Confirms a fulfillment for an escrow as the escrow recipient.\"},\"confirmations(bytes32,bytes32)\":{\"notice\":\"Whether a fulfillment is confirmed for an escrow.\"},\"eas()\":{\"notice\":\"EAS contract used to load escrow and fulfillment attestations.\"},\"escrowConfirmed(bytes32)\":{\"notice\":\"Whether an escrow already has a confirmed fulfillment.\"},\"requestConfirmation(bytes32,bytes32)\":{\"notice\":\"Requests confirmation from the escrow recipient.\"}},\"notice\":\"Accepts the first confirmed fulfillment for an escrow, with no revocation path.\",\"version\":1}},\"settings\":{\"compilationTarget\":{\"src/arbiters/confirmation/ExclusiveUnrevocableConfirmationArbiter.sol\":\"ExclusiveUnrevocableConfirmationArbiter\"},\"evmVersion\":\"prague\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[\":@eas/=lib/eas-contracts/contracts/\",\":@erc8004/=lib/erc-8004-contracts/contracts/\",\":@openzeppelin/=lib/openzeppelin-contracts/\",\":@src/=src/\",\":@test/=test/\",\":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/\",\":eas-contracts/=lib/eas-contracts/contracts/\",\":erc-8004-contracts/=lib/erc-8004-contracts/contracts/\",\":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/\",\":eth-gas-reporter/=lib/eas-contracts/node_modules/eth-gas-reporter/\",\":forge-std/=lib/forge-std/src/\",\":halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/\",\":hardhat-deploy/=lib/eas-contracts/node_modules/hardhat-deploy/\",\":hardhat/=lib/eas-contracts/node_modules/hardhat/\",\":openzeppelin-contracts/=lib/openzeppelin-contracts/\"],\"viaIR\":true},\"sources\":{\"lib/eas-contracts/contracts/Common.sol\":{\"keccak256\":\"0x957bd2e6d0d6d637f86208b135c29fbaf4412cb08e5e7a61ede16b80561bf685\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://da1dc9aedbb1d4d39c46c2235918d3adfbc5741dd34a46010cf425d134e7936d\",\"dweb:/ipfs/QmWUk6bXnLaghS2riF3GTFEeURCzgYFMA5woa6AsgPwEgc\"]},\"lib/eas-contracts/contracts/IEAS.sol\":{\"keccak256\":\"0xdad0674defce04905dc7935f2756d6c477a6e876c0b1b7094b112a862f164c12\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://49e448c26c08952df034692d2ab3519dd40a1ebbeae4ce68b294567441933880\",\"dweb:/ipfs/QmWHcudjskUSCjgqsNWE65LVfWvcYB2vBn8RB1SmzvRLNR\"]},\"lib/eas-contracts/contracts/ISchemaRegistry.sol\":{\"keccak256\":\"0xea97dcd36a0c422169cbaac06698249e199049b627c16bff93fb8ab829058754\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://d453a929ef64a69cd31195ec2ee5ed1193bfa29f633e13c960e92154c37ad158\",\"dweb:/ipfs/QmXs1Z3njbHs2EMgHonrZDfcwdog4kozHY5tYNrhZK5yqz\"]},\"lib/eas-contracts/contracts/ISemver.sol\":{\"keccak256\":\"0x04a67939b4e1a8d0a51101b8f69f8882930bbdc66319f38023828625b5d1ff18\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://3dd543fa0e33cef1ea757627f9c2a10a66ee1ce17aa9087f437c5b53a903c7f0\",\"dweb:/ipfs/QmXsy6UsGBzF9zPCCjmiwPpCcX3tHqU13TmR67B69tKnR6\"]},\"lib/eas-contracts/contracts/resolver/ISchemaResolver.sol\":{\"keccak256\":\"0xb7d1961ed928c620cddf35c2bf46845b10828bc5d73145214630202ed355b6bb\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://cf1cabacfb15c9bace8280b540b52e5aa440e1b4eba675f9782c34ce0f03902f\",\"dweb:/ipfs/QmakYcK4xbrijzvoaBCmBJK6HeaBqbXxWKtDQ1z62aXwCR\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/ERC165.sol\":{\"keccak256\":\"0x2d9dc2fe26180f74c11c13663647d38e259e45f95eb88f57b61d2160b0109d3e\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://81233d1f98060113d9922180bb0f14f8335856fe9f339134b09335e9f678c377\",\"dweb:/ipfs/QmWh6R35SarhAn4z2wH8SU456jJSYL2FgucfTFgbHJJN4E\"]},\"lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol\":{\"keccak256\":\"0x8891738ffe910f0cf2da09566928589bf5d63f4524dd734fd9cedbac3274dd5c\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://971f954442df5c2ef5b5ebf1eb245d7105d9fbacc7386ee5c796df1d45b21617\",\"dweb:/ipfs/QmadRjHbkicwqwwh61raUEapaVEtaLMcYbQZWs9gUkgj3u\"]},\"src/BaseArbiter.sol\":{\"keccak256\":\"0x27fa97834bcd6e592f3b534e64859b208c688363d33fb9b62436d009ffff3ed1\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://b61ac6195ae644325adf77fdb301651cddfca4b63d9db5123ee075869f3784aa\",\"dweb:/ipfs/QmYRu5hER8gaMjqyY5bDV9EAwVN12CbS3Z2bW8dLp7sPSE\"]},\"src/IArbiter.sol\":{\"keccak256\":\"0x00f3f5d8460c738eff4a776cf309efe38342fcc951abfe97d1c2e285acb1e330\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://7201a176f3d5c3d01ca13bbcd9ef5587effe8fabf20e0b8f81f2d6ee362269b9\",\"dweb:/ipfs/QmXn9aSvoGPQuNTxe3mM47RNQ1bfYCEczQCYsDDM9ohc8M\"]},\"src/arbiters/confirmation/ExclusiveUnrevocableConfirmationArbiter.sol\":{\"keccak256\":\"0x683c3a42f782bc06d1de4194dd0372893bb03ac0a015b3c1431e0a0a86c7ab3b\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://8b00629e9c5dd092d2e21458b82f71b656df740a398631f837e71478e63d8eb9\",\"dweb:/ipfs/QmRxNknfpA8PX1371Y2JYmtqcHMwg7tffeGk69yhJtwdSW\"]},\"src/libraries/ArbiterUtils.sol\":{\"keccak256\":\"0xb87e2bfb9c7292daf6426fbedc09c8683b92841d1b92e7359c0ff94d42be632f\",\"license\":\"UNLICENSED\",\"urls\":[\"bzz-raw://3acf498c3c59891d76db768ea57d8f7f6b4010dcbaf44a5f93d95d72f0b12441\",\"dweb:/ipfs/QmVbkioM8dWwYxqatm1dyo9PRFNZ6c7Kbang7pozbnyS7j\"]}},\"version\":1}",
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
          "name": "EscrowAlreadyConfirmed"
        },
        {
          "inputs": [],
          "type": "error",
          "name": "InvalidFulfillment"
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
          "name": "escrowConfirmed",
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
          "name": "requestConfirmation"
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
          "escrowConfirmed(bytes32)": {
            "notice": "Whether an escrow already has a confirmed fulfillment."
          },
          "requestConfirmation(bytes32,bytes32)": {
            "notice": "Requests confirmation from the escrow recipient."
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
        "src/arbiters/confirmation/ExclusiveUnrevocableConfirmationArbiter.sol": "ExclusiveUnrevocableConfirmationArbiter"
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
      "src/arbiters/confirmation/ExclusiveUnrevocableConfirmationArbiter.sol": {
        "keccak256": "0x683c3a42f782bc06d1de4194dd0372893bb03ac0a015b3c1431e0a0a86c7ab3b",
        "urls": [
          "bzz-raw://8b00629e9c5dd092d2e21458b82f71b656df740a398631f837e71478e63d8eb9",
          "dweb:/ipfs/QmRxNknfpA8PX1371Y2JYmtqcHMwg7tffeGk69yhJtwdSW"
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
  "id": 112
} as const;
