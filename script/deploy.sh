#export $(cat ../.env | xargs)

# https://github.com/ethereum-attestation-service/eas-contracts?tab=readme-ov-file#deployments

#echo "Deploying ERC20EscrowObligation"
#forge create src/obligations/ERC20EscrowObligation.sol:ERC20EscrowObligation --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args $EAS_ADDRESS $EAS_SR_ADDRESS
#
# echo "Deploying ERC721PaymentObligation"
# forge create src/obligations/ERC721PaymentObligation.sol:ERC721PaymentObligation --broadcast --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args  0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587 0xA7b39296258348C78294F95B872b282326A97BDF
#
# echo "Deploying JobResultObligation"
# forge create src/obligations/JobResultObligation.sol:JobResultObligation --broadcast --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args  0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587 0xA7b39296258348C78294F95B872b282326A97BDF
#
# echo "Deploying TokenBundlePaymentObligation"
# forge create src/obligations/TokenBundlePaymentObligation.sol:TokenBundlePaymentObligation --broadcast --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args  0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587 0xA7b39296258348C78294F95B872b282326A97BDF
#
# echo "Deploying TrivialArbiter"
# forge create src/arbiters/TrivialArbiter.sol:TrivialArbiter --broadcast --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args  0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587 0xA7b39296258348C78294F95B872b282326A97BDF
#
#echo "Deploying ERC20PaymentFulfillmentArbiter"
#forge create src/arbiters/ERC20PaymentFulfillmentArbiter.sol:ERC20PaymentFulfillmentArbiter --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args $ERC20_PAYMENT_ADDRESS
#
echo "Deploying ERC20BarterUtils"
forge create src/utils/ERC20BarterUtils.sol:ERC20BarterUtils --rpc-url $RPC_URL --private-key $DEPLOYMENT_KEY --constructor-args $EAS_ADDRESS $ERC20_PAYMENT_ADDRESS $ERC20_PAYMENT_FULFILLMENT_ADDRESS
