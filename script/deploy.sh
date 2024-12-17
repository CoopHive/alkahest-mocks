#export $(cat ../.env | xargs)

# https://github.com/ethereum-attestation-service/eas-contracts?tab=readme-ov-file#deployments

# echo "Deploying ERC20PaymentObligation"
# forge create src/Statements/ERC20PaymentObligation.sol:ERC20PaymentObligation --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args $EAS_ADDRESS $EAS_SR_ADDRESS
#
# echo "Deploying ERC721PaymentObligation"
# forge create src/Statements/ERC721PaymentObligation.sol:ERC721PaymentObligation --broadcast --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args  0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587 0xA7b39296258348C78294F95B872b282326A97BDF
#
# echo "Deploying JobResultObligation"
# forge create src/Statements/JobResultObligation.sol:JobResultObligation --broadcast --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args  0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587 0xA7b39296258348C78294F95B872b282326A97BDF
#
# echo "Deploying BundlePaymentObligation"
# forge create src/Statements/BundlePaymentObligation.sol:BundlePaymentObligation --broadcast --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args  0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587 0xA7b39296258348C78294F95B872b282326A97BDF
#
# echo "Deploying TrivialArbiter"
# forge create src/Validators/TrivialArbiter.sol:TrivialArbiter --broadcast --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args  0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587 0xA7b39296258348C78294F95B872b282326A97BDF
#
# echo "Deploying ERC20PaymentFulfillmentArbiter"
# forge create src/Validators/ERC20PaymentFulfillmentArbiter.sol:ERC20PaymentFulfillmentArbiter --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args $ERC20_PAYMENT_ADDRESS
#
echo "Deploying ERC20BarterUtils"
forge create src/Utils/ERC20BarterUtils.sol:ERC20BarterUtils --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args $EAS_ADDRESS $ERC20_PAYMENT_ADDRESS $ERC20_PAYMENT_FULFILLMENT_ADDRESS 

