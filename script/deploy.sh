export $(cat ../.env | xargs)

# https://github.com/ethereum-attestation-service/eas-contracts?tab=readme-ov-file#deployments

echo "Deploying ERC20PaymentObligation"
forge create src/Statements/ERC20PaymentObligation.sol:ERC20PaymentObligation --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args  0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587 0xA7b39296258348C78294F95B872b282326A97BDF

echo "Deploying ERC721PaymentObligation"
forge create src/Statements/ERC721PaymentObligation.sol:ERC721PaymentObligation --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args  0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587 0xA7b39296258348C78294F95B872b282326A97BDF

echo "Deploying JobResultObligation"
forge create src/Statements/JobResultObligation.sol:JobResultObligation --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args  0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587 0xA7b39296258348C78294F95B872b282326A97BDF

echo "Deploying BundlePaymentObligation"
forge create src/Statements/BundlePaymentObligation.sol:BundlePaymentObligation --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args  0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587 0xA7b39296258348C78294F95B872b282326A97BDF

echo "Deploying TrivialArbiter"
forge create src/Validators/TrivialArbiter.sol:TrivialArbiter --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args  0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587 0xA7b39296258348C78294F95B872b282326A97BDF