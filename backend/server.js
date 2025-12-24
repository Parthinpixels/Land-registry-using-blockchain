require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const app = express();
app.use(cors());
app.use(express.json());


const RPC = process.env.RPC || "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";
const ABI = require('./abi/LandRegistry.json');

const provider = new ethers.JsonRpcProvider(RPC);

const signer = provider.getSigner(0);

const contract = CONTRACT_ADDRESS ? new ethers.Contract(CONTRACT_ADDRESS, ABI, signer) : null;

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/register', async (req, res) => {
  try {
    if (!contract) return res.status(500).json({ error: "Contract not configured" });
    const { title, location, area } = req.body;
    const tx = await contract.registerLand(title, location, area);
    const rc = await tx.wait();
    res.json({ txHash: tx.hash, receipt: rc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.toString() });
  }
});

app.post('/transfer', async (req, res) => {
  try {
    if (!contract) return res.status(500).json({ error: "Contract not configured" });
    const { landId, newOwner } = req.body;
    const tx = await contract.transferOwnership(landId, newOwner);
    const rc = await tx.wait();
    res.json({ txHash: tx.hash, receipt: rc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.toString() });
  }
});

app.get('/land/:id', async (req, res) => {
  try {
    if (!contract) return res.status(500).json({ error: "Contract not configured" });
    const land = await contract.getLand(req.params.id);
    const history = await contract.getOwnershipHistory(req.params.id);
    res.json({ land, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.toString() });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('Backend listening on', PORT);
});
