export $(cat ../.env | xargs)

cast rpc anvil_impersonateAccount $ETH_HOLDER
cast send --from $ETH_HOLDER --unlocked $BUYER --value 1ether
cast send --from $ETH_HOLDER --unlocked $SELLER --value 1ether
cast send --from $ETH_HOLDER --unlocked $IPNFT_HOLDER --value 1ether
cast balance $BUYER --rpc-url $RPC_URL
cast balance $SELLER --rpc-url $RPC_URL
cast balance $IPNFT_HOLDER --rpc-url $RPC_URL

# Define arrays for tokens and holders
TOKENS=($VITA $NEURON $ATH $RSC $GROW $CRYO $LAKE $HAIR $GLW_BETA $AXGT $NOBL)
HOLDERS=($VITA_HOLDER $NEURON_HOLDER $ATH_HOLDER $RSC_HOLDER $GROW_HOLDER $CRYO_HOLDER $LAKE_HOLDER $HAIR_HOLDER $GLW_BETA_HOLDER $AXGT_HOLDER $NOBL_HOLDER)

# Loop through ERC20 tokens and holders
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

# ERC721
# Impersonate account
cast rpc anvil_impersonateAccount $IPNFT_HOLDER

TOKEN_ID=44

# cast send $IPNFT --from $IPNFT_HOLDER "approve(address,uint256)" $BUYER $TOKEN_ID --unlocked
cast send $IPNFT --from $IPNFT_HOLDER "safeTransferFrom(address,address,uint256)" $IPNFT_HOLDER $BUYER $TOKEN_ID --unlocked

# Check the balance of the holder and receiver
cast call $IPNFT "balanceOf(address)(uint256)" $BUYER --rpc-url $RPC_URL
cast call $IPNFT "ownerOf(uint256)(address)" $TOKEN_ID --rpc-url $RPC_URL