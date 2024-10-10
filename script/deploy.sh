export $(cat ../.env | xargs)

echo "Deploying ERC20PaymentObligation"
forge create src/Statements/ERC20PaymentObligation.sol:ERC20PaymentObligation --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args  0x4200000000000000000000000000000000000021 0x4200000000000000000000000000000000000020

echo "Deploying ERC721PaymentObligation"
forge create src/Statements/ERC721PaymentObligation.sol:ERC721PaymentObligation --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args  0x4200000000000000000000000000000000000021 0x4200000000000000000000000000000000000020

echo "Deploying JobResultObligation"
forge create src/Statements/JobResultObligation.sol:JobResultObligation --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args  0x4200000000000000000000000000000000000021 0x4200000000000000000000000000000000000020