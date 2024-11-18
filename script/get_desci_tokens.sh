export $(cat ../.env | xargs)

TOKENS=($VITA $NEURON $ATH $RSC $GROW $CRYO $LAKE $HAIR $GLW_BETA $AXGT $NOBL $WEL)
HOLDERS=($VITA_HOLDER $NEURON_HOLDER $ATH_HOLDER $RSC_HOLDER $GROW_HOLDER $CRYO_HOLDER $LAKE_HOLDER $HAIR_HOLDER $GLW_BETA_HOLDER $AXGT_HOLDER $NOBL_HOLDER $WEL_HOLDER)

RECEIVERS=($BUYER $SELLER $IPNFT_HOLDER ${HOLDERS[@]})

cast rpc anvil_impersonateAccount $ETH_HOLDER

for RECEIVER in ${RECEIVERS[@]}; do
  echo "Sending 1 ETH to $RECEIVER"
  cast send --from $ETH_HOLDER --unlocked $RECEIVER --value 1ether --rpc-url $RPC_URL
done

cast rpc anvil_stopImpersonatingAccount $ETH_HOLDER --rpc-url $RPC_URL

# ------------------------------ERC20------------------------------
for i in ${!TOKENS[@]}; do
  TOKEN=${TOKENS[$i]}
  HOLDER=${HOLDERS[$i]}

  echo "Impersonating account: $HOLDER"
  cast rpc anvil_impersonateAccount $HOLDER --rpc-url $RPC_URL

  for RECEIVER in $BUYER $SELLER; do
    echo "Transferring tokens from $HOLDER to $RECEIVER"

    GAS_ESTIMATE=$(cast estimate $TOKEN "transfer(address,uint256)(bool)" $RECEIVER 10000 --from $HOLDER --rpc-url $RPC_URL)
    GAS_LIMIT=$((GAS_ESTIMATE + 50000))

    cast send $TOKEN --from $HOLDER "transfer(address,uint256)(bool)" $RECEIVER 10000 \
      --unlocked --rpc-url $RPC_URL --gas-limit $GAS_LIMIT
    
    BALANCE=$(cast call $TOKEN "balanceOf(address)(uint256)" $RECEIVER --rpc-url $RPC_URL)
    echo "Balance of $RECEIVER: $BALANCE"
  done

  cast rpc anvil_stopImpersonatingAccount $HOLDER --rpc-url $RPC_URL
done

# ------------------------------ERC721------------------------------
# Impersonate account
cast rpc anvil_impersonateAccount $IPNFT_HOLDER

TOKEN_ID=44

cast send $IPNFT --from $IPNFT_HOLDER "safeTransferFrom(address,address,uint256)" $IPNFT_HOLDER $BUYER $TOKEN_ID --unlocked

# Check the balance of the holder and receiver
cast call $IPNFT "balanceOf(address)(uint256)" $BUYER --rpc-url $RPC_URL
cast call $IPNFT "ownerOf(uint256)(address)" $TOKEN_ID --rpc-url $RPC_URL