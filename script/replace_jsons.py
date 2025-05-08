# %%
import os
import shutil

dir = "alkahest-ts"
current_contracts = os.listdir(f"{dir}/src/contracts")

# %%
contracts = os.listdir("out")
contracts = [c for c in contracts if c.replace("sol", "json") in current_contracts]

# %%
os.makedirs(f"{dir}/src/contracts/bak", exist_ok=True)
for contract in contracts:
    json = contract.replace("sol", "json")
    os.rename(f"{dir}/src/contracts/{json}", f"{dir}/src/contracts/bak/{json}")
    shutil.copy(f"out/{contract}/{json}", f"{dir}/src/contracts/{json}")
