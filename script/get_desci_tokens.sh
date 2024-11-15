export $(cat ../.env | xargs)

cast rpc anvil_impersonateAccount $ETH_HOLDER
cast send --from $ETH_HOLDER --unlocked $BUYER --value 0.1ether
cast send --from $ETH_HOLDER --unlocked $SELLER --value 0.1ether
cast balance $BUYER --rpc-url $RPC_URL
cast balance $SELLER --rpc-url $RPC_URL

# Define arrays for tokens and holders
TOKENS=($VITA $NEURON $ATH $RSC $GROW $CRYO $LAKE $HAIR $GLW_BETA $AXGT $NOBL)
HOLDERS=($VITA_HOLDER $NEURON_HOLDER $ATH_HOLDER $RSC_HOLDER $GROW_HOLDER $CRYO_HOLDER $LAKE_HOLDER $HAIR_HOLDER $GLW_BETA_HOLDER $AXGT_HOLDER $NOBL_HOLDER)

# Loop through tokens and holders
for i in ${!TOKENS[@]}; do
  TOKEN=${TOKENS[$i]}
  HOLDER=${HOLDERS[$i]}

  # Impersonate account
  cast rpc anvil_impersonateAccount $HOLDER

  # Transfer tokens to BUYER and SELLER
  for RECEIVER in $BUYER $SELLER; do
    cast send $TOKEN --from $HOLDER "transfer(address,uint256)(bool)" $RECEIVER --unlocked 10000
    # Check the balance of the receiver
    cast call $TOKEN "balanceOf(address)(uint256)" $RECEIVER --rpc-url $RPC_URL
  done
done