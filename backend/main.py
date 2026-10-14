"""
Bitcoin-VisualCore: Step 3 - FastAPI Application Server (main.py)
Implements all required REST gateways with CORSMiddleware enabled to prevent browser CORS errors.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import time

from .keys import generate_key_pair
from .blockchain import Transaction, Block, double_sha256
from .mining import proof_of_work

app = FastAPI(
    title="Bitcoin-VisualCore Engine",
    description="Educational Bitcoin Architecture Simulator API with SECP256k1 & Proof-of-Work",
    version="1.0.0"
)

# -------------------------------------------------------------
# MISTAKE #1 PREVENTION: Full CORS Middleware Configuration
# Allows requests from Vite (port 3000), local live servers (port 5500/8080),
# or GitHub Pages without browser CORS blocks.
# -------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory distributed state simulation
MEMPOOL: list[dict] = []
CHAIN: list[Block] = []

# Initialize Genesis Block (Jan 3, 2009)
def init_genesis_block():
    satoshi_wallet = generate_key_pair()
    genesis_tx = {
        "tx_id": double_sha256("COINBASE_GENESIS_50_BTC"),
        "sender_address": "COINBASE (Mint)",
        "receiver_address": satoshi_wallet["address"],
        "amount": 50.0,
        "fee": 0.0,
        "signature": "GENESIS_PROOF_OF_WORK",
        "public_key": satoshi_wallet["public_key"],
        "timestamp": 1231006505
    }
    genesis = Block(
        index=0,
        previous_hash="0" * 64,
        transactions=[genesis_tx],
        difficulty=3,
        nonce=2083236893,
        timestamp=1231006505
    )
    genesis.hash = genesis.calculate_hash()
    return genesis

if not CHAIN:
    CHAIN.append(init_genesis_block())

class NewTransactionRequest(BaseModel):
    sender_address: str = Field(..., description="Sender's Bitcoin address")
    receiver_address: str = Field(..., description="Recipient's Bitcoin address")
    amount: float = Field(..., gt=0, description="Amount in BTC")
    fee: float = Field(0.001, ge=0, description="Miner incentive fee in BTC")
    public_key: str = Field(..., description="Hex-encoded 33-byte/65-byte public key")
    signature: str = Field(..., description="Hex-encoded ECDSA digital signature")

@app.get("/")
def root():
    return {
        "name": "Bitcoin-VisualCore API",
        "status": "online",
        "blocks_count": len(CHAIN),
        "mempool_count": len(MEMPOOL)
    }

# Gateway 1: GET /api/chain - Transmits entire block history
@app.get("/api/chain")
def get_chain():
    return {
        "length": len(CHAIN),
        "chain": [b.to_dict() for b in CHAIN]
    }

# Gateway 2: GET /api/mempool - View unconfirmed transactions
@app.get("/api/mempool")
def get_mempool():
    return {
        "count": len(MEMPOOL),
        "mempool": MEMPOOL
    }

# Gateway 3: POST /api/transactions/new - Validates incoming signatures; accepts/rejects from mempool
@app.post("/api/transactions/new", status_code=201)
def create_transaction(req: NewTransactionRequest):
    tx = Transaction(
        sender_address=req.sender_address,
        receiver_address=req.receiver_address,
        amount=req.amount,
        fee=req.fee,
        signature=req.signature,
        public_key=req.public_key
    )

    # Cryptographic verification check
    is_valid = tx.verify_signature()
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail="[CRITICAL: Invalid Digital Signature - Transaction Blocked]"
        )

    MEMPOOL.append(tx.to_dict())
    return {
        "status": "accepted",
        "message": "Digital signature verified. Transaction pushed to Mempool.",
        "tx_id": tx.tx_id
    }

# Gateway 4: GET /api/mine - Runs Proof of Work engine, mints new block, clears mempool
@app.get("/api/mine")
def mine_block(miner_address: str = "1CharlieMinerPoolAddress"):
    global MEMPOOL
    last_block = CHAIN[-1]

    # Prepend Coinbase transaction (Subsidy 3.125 BTC + accumulated fees)
    fees_sum = sum(tx.get("fee", 0.0) for tx in MEMPOOL)
    coinbase_tx = {
        "tx_id": double_sha256(f"COINBASE_MINT_BLOCK_{len(CHAIN)}"),
        "sender_address": "COINBASE (Mint)",
        "receiver_address": miner_address,
        "amount": round(3.125 + fees_sum, 8),
        "fee": 0.0,
        "signature": f"COINBASE_BLOCK_{len(CHAIN)}",
        "public_key": "00" * 33,
        "timestamp": time.time()
    }

    candidate_transactions = [coinbase_tx] + list(MEMPOOL)

    # Target prefix based on difficulty
    difficulty = 3
    target_prefix = "0" * difficulty

    candidate_block = Block(
        index=len(CHAIN),
        previous_hash=last_block.hash,
        transactions=candidate_transactions,
        difficulty=difficulty
    )

    winning_nonce, winning_hash = proof_of_work(candidate_block, target_prefix=target_prefix)

    candidate_block.nonce = winning_nonce
    candidate_block.hash = winning_hash

    # Commit to ledger and clear Mempool
    CHAIN.append(candidate_block)
    MEMPOOL = []

    return {
        "status": "mined",
        "message": f"Block #{candidate_block.index} successfully mined!",
        "block": candidate_block.to_dict()
    }

# Gateway 5: GET /api/wallet/new - Generate a fresh SECP256k1 keypair
@app.get("/api/wallet/new")
def new_wallet():
    return generate_key_pair()
