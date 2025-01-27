# %%
import os
import shutil

current_contracts = os.listdir("alkahest-rs/src/contracts")

#%%
contracts = os.listdir("out")
contracts = [c for c in contracts if c.replace("sol", "json") in current_contracts]

#%%
os.makedirs("alkahest-rs/src/contracts/bak", exist_ok=True)
for contract in contracts:
    json = contract.replace("sol", "json")
    os.rename(f"alkahest-rs/src/contracts/{json}", f"alkahest-rs/src/contracts/bak/{json}")
    shutil.copy(f"out/{contract}/{json}", f"alkahest-rs/src/contracts/{json}")
