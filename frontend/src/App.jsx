import React, { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import landRegistryArtifact from "./abi/LandRegistry.json";

// Contract address .env se
const CONTRACT_ADDRESS = import.meta.env.VITE_LAND_REGISTRY_ADDRESS || "";

// Main component
export default function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [landId, setLandId] = useState("");
  const [land, setLand] = useState(null);
  const [message, setMessage] = useState("");

  // 1. Wallet + contract connect
  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask first.");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const [addr] = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const c = new Contract(
        CONTRACT_ADDRESS,
        landRegistryArtifact.abi,
        signer
      );

      setAccount(addr);
      setContract(c);
      setMessage("Wallet connected.");
    } catch (e) {
      console.error(e);
      setMessage("Error connecting wallet: " + e.message);
    }
  }

  // 2. Register land → smart contract call
  async function register() {
    try {
      if (!contract) {
        setMessage("Connect wallet first.");
        return;
      }
      if (!title || !location || !area) {
        setMessage("Please fill all fields.");
        return;
      }

      const tx = await contract.registerLand(
        title,
        location,
        Number(area)
      );
      const receipt = await tx.wait();

      setMessage("Land registered. Tx hash: " + receipt.hash);

      // Optional: clear form
      setTitle("");
      setLocation("");
      setArea("");
    } catch (e) {
      console.error(e);
      setMessage("Error registering land: " + e.message);
    }
  }

  // 3. Fetch land details by ID
  async function fetchLand() {
    try {
      if (!contract) {
        setMessage("Connect wallet first.");
        return;
      }
      if (!landId) {
        setMessage("Please enter Land ID.");
        return;
      }

      const data = await contract.getLand(Number(landId));
      // data is a struct: [id, title, location, area, owner, exists]
      setLand({
        id: data.id.toString(),
        title: data.title,
        location: data.location,
        area: data.area.toString(),
        owner: data.owner,
        exists: data.exists
      });
      setMessage("");
    } catch (e) {
      console.error(e);
      setMessage("Error fetching land: " + e.message);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Land Registry (Demo)</h1>

      {/* Wallet connect */}
      <button onClick={connectWallet} style={{ marginBottom: 20 }}>
        {account ? `Connected: ${account.slice(0, 8)}...` : "Connect Wallet"}
      </button>

      <section style={{ marginBottom: 20 }}>
        <h3>Register Land</h3>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <br />
        <input
          placeholder="Area (m2)"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />
        <br />
        <button onClick={register}>Register</button>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h3>Get Land</h3>
        <input
          placeholder="Land ID"
          value={landId}
          onChange={(e) => setLandId(e.target.value)}
        />
        <button onClick={fetchLand}>Fetch</button>

        {land && (
          <pre style={{ background: "#f4f4f4", padding: 10, marginTop: 10 }}>
{JSON.stringify(land, null, 2)}
          </pre>
        )}
      </section>

      <div>{message}</div>
    </div>
  );
}
