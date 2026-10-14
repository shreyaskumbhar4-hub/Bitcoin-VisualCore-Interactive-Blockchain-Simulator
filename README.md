# 🪙 Bitcoin-VisualCore: An Educational Bitcoin Architecture Simulator

> An interactive, public blockchain simulator built directly upon Satoshi Nakamoto's 2008 whitepaper. Implements cryptographic identity (SECP256k1), ECDSA digital signatures, transactional mempool queue, proof-of-work mining rig, and an interactive P2P graphical dashboard.

---

## 🚀 Live Demo & Quick Start

### 1. Web Graphical Dashboard (Frontend)
```bash
# Install dependencies
npm install

# Start local interactive simulator (Port 3000)
npm run dev

# Build for GitHub Pages / Static Hosting
npm run build
```

### 2. Optional Python FastAPI Backend
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run FastAPI server with CORS enabled (Port 8000)
uvicorn backend.main:app --reload --port 8000
```

---

## 🛠️ Architecture & Core Components

```
bitcoin-visual-core/
├── backend/
│   ├── keys.py         # ECDSA SECP256k1 key generation & Base58 address derivation
│   ├── blockchain.py   # Block classes, Merkle tree & Mempool queue
│   ├── mining.py       # Non-blocking Proof-of-Work engine
│   └── main.py         # FastAPI backend server with CORSMiddleware
├── src/
│   ├── core/
│   │   ├── crypto.ts   # Synchronous SECP256k1 & SHA-256 implementation
│   │   ├── blockchain.ts # Ledger, Merkle tree, and validation rules
│   │   └── utxo.ts     # UTXO model and SPV Merkle proofs
│   └── components/
│       ├── WalletManager.tsx         # Asymmetric key generator
│       ├── TransactionConsole.tsx    # ECDSA signing & Fraud Demo
│       ├── MempoolQueue.tsx          # Pending fee-prioritized queue
│       ├── MiningRig.tsx             # Animated nonce counter & PoW search
│       ├── BlockchainExplorer.tsx    # Hash pointers & tamper detector
│       ├── BlockCreationPipeline.tsx # 7-stage lifecycle visualizer
│       ├── UTXOVisualizer.tsx        # UTXO model vs Account model
│       └── ForkConsensusVisualizer.tsx # Longest chain rule & reorgs
├── .github/workflows/deploy.yml      # Automated GitHub Pages deployment
└── requirements.txt                  # Python dependencies
```

---

## 🛡️ Critical Design Decisions & Mistake Preventions

1. **The CORS Block Error Avoided**:
   - `backend/main.py` explicitly integrates `CORSMiddleware` with `allow_origins=["*"]`, `allow_methods=["*"]`, and `allow_headers=["*"]`.
   - The frontend simulator also runs completely self-contained in the browser, ensuring GitHub Pages deployments function with 100% interactivity with zero external backend dependencies.

2. **Zero Browser Freezing During Mining**:
   - The mining rig operates via `requestAnimationFrame` with sliced batching (1,500 nonces/frame), achieving 30,000+ H/s while keeping the UI responsive.

3. **Hexadecimal Signature JSON Serialization**:
   - Digital signatures and public keys are strictly converted into 64-byte / 128-byte hexadecimal strings (`.hex()`), avoiding raw binary serialization issues across JSON APIs.

4. **Controlled Event-Driven Polling**:
   - Prevents API hammering through state synchronization and bounded interval timers.

---

## 📜 Educational Modules Grounded in the 2008 Whitepaper

1. **Cryptographic Identity**: Curve math $y^2 \equiv x^3 + 7 \pmod p$, private keys, and public keys.
2. **Digital Signatures & Fraud Protection**: ECDSA signing and tamper detection.
3. **The Mempool & Fee Market**: Priority based on sat/vB fees.
4. **Proof of Work**: Hashcash puzzle and exponential difficulty scaling.
5. **Merkle Trees**: Binary hash tree and block header commitments.
6. **Chain Immutability**: Cryptographic linking via `prev_hash` pointers.
7. **Nakamoto Consensus**: Longest chain rule, simultaneous block forks, and chain reorganizations.
8. **Simplified Payment Verification (SPV)**: Merkle proof verification for mobile light clients.
