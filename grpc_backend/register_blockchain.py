from web3 import Web3 # type: ignore
import json

try:
   # w3 = Web3(Web3.HTTPProvider("http://host.docker.internal:8545"))
    w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))


    if not w3.is_connected():
        print("Blockchain não conectada")
        contract = None
    else:
        print("Conectou blockchain")
        w3.eth.default_account = w3.eth.accounts[0]

        with open("TuneChainABI.json") as f:
            abi = json.load(f)

        contract_address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
        contract = w3.eth.contract(address=contract_address, abi=abi)

except Exception as e:
    print("erro na conexão da block", e)
    contract = None

def registrar_receita(title, artist, plays, revenue):
    if not contract:
        raise Exception("Blockchain não conectou")
    tx_hash = contract.functions.registerRevenue(title, artist, plays, revenue).transact()
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(receipt)
    return receipt
