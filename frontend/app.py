import streamlit as st
from web3 import Web3

# ---------- Page Config ----------
st.set_page_config(page_title="Land Registry DApp", layout="centered")

# ---------- Title ----------
st.title("🏛️ Land Registry (Blockchain Demo)")

st.write("A simple decentralized app to register and fetch land records.")

# Connect to Ganache
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))

# Load Contract
import json

with open("build/contracts/LandRegistry.json") as f:
    contract_json = json.load(f)
    abi = contract_json["abi"]
    contract_address = contract_json["networks"]["5777"]["address"]

contract = w3.eth.contract(address=contract_address, abi=abi)

account = w3.eth.accounts[0]

# ---------- Register Land ----------
st.subheader("📌 Register Land")

with st.form("register_form"):
    title = st.text_input("Land Title")
    location = st.text_input("Location")
    area = st.number_input("Area (m²)", min_value=1, value=100)
    submit = st.form_submit_button("Register Land")

if submit:
    tx = contract.functions.registerLand(title, location, int(area)).transact({"from": account})
    st.success("Land registered successfully!")
    st.write("Transaction Hash:", tx.hex())


# ---------- Fetch Land ----------
st.subheader("🔍 Get Land Details")

land_id = st.number_input("Enter Land ID", min_value=0, step=1)
fetch_btn = st.button("Fetch")

if fetch_btn:
    try:
        land = contract.functions.getLand(int(land_id)).call()

        title, location, area, owner = land

        st.success("Land Found!")

        st.markdown(f"""
        ### 🧾 Land Info
        **Title:** {title}  
        **Location:** {location}  
        **Area:** {area} m²  
        **Owner:** `{owner}`
        """)

    except:
        st.error("Land ID not found!")
