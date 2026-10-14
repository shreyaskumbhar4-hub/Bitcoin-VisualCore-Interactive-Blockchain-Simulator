/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Block, Transaction } from '../core/types';
import { Code, Copy, Check, Terminal, Play, Database } from 'lucide-react';

interface ApiExplorerProps {
  chain: Block[];
  mempool: Transaction[];
  onTriggerMine: () => void;
}

export const ApiExplorer: React.FC<ApiExplorerProps> = ({
  chain,
  mempool,
  onTriggerMine,
}) => {
  const [activeEndpoint, setActiveEndpoint] = useState<'chain' | 'tx_new' | 'mine' | 'python_code'>('chain');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chainResponse = {
    length: chain.length,
    chain: chain.map((b) => ({
      index: b.index,
      timestamp: b.timestamp,
      previous_hash: b.previousHash,
      merkle_root: b.merkleRoot,
      transactions_count: b.transactions.length,
      nonce: b.nonce,
      difficulty: b.difficulty,
      hash: b.hash,
      mined_by: b.minedBy,
    })),
  };

  const txSchema = {
    endpoint: 'POST /api/transactions/new',
    request_body_example: {
      sender_address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      recipient_address: '1Bob4v7T2Z6g9KzQWpLtY98mNvKxL5m',
      amount: 1.5,
      fee: 0.001,
      public_key: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      signature: '3045022100e4d7...9f0220268a...7e',
    },
    responses: {
      '201 Created': {
        status: 'accepted',
        message: 'Digital signature verified. Transaction added to mempool.',
        txid: '3a4928e8f81014588df8e983279c13b...6f',
      },
      '400 Bad Request': {
        status: 'rejected',
        error: '[CRITICAL: Invalid Digital Signature - Transaction Blocked]',
      },
    },
  };

  const pythonReferenceCode = `# ====================================================================
# Bitcoin-VisualCore: Backend Architecture (FastAPI & SECP256k1)
# Direct Python Implementation based on Satoshi Nakamoto's Whitepaper
# ====================================================================

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import hashlib
import time
import ecdsa

app = FastAPI(title="Bitcoin-VisualCore Engine")

# --- Step 1: SECP256k1 Elliptic Curve Key Generation ---
def generate_bitcoin_keys():
    # 256-bit private key on SECP256k1
    sk = ecdsa.SigningKey.generate(curve=ecdsa.SECP256k1)
    vk = sk.verifying_key
    priv_hex = sk.to_string().hex()
    pub_hex = vk.to_string().hex()
    
    # Hash160 address derivation (SHA-256 + RIPEMD-160)
    sha = hashlib.sha256(vk.to_string()).digest()
    rip = hashlib.new('ripemd160', sha).hexdigest()
    address = f"1{rip[:30]}"
    return priv_hex, pub_hex, address

# --- Step 2: Transaction & Signature Verification ---
class TransactionIn(BaseModel):
    sender: str
    recipient: str
    amount: float
    fee: float
    public_key: str
    signature: str

mempool = []

@app.post("/api/transactions/new")
def new_transaction(tx: TransactionIn):
    # Reconstruct raw payload
    payload = f"{tx.sender}|{tx.recipient}|{tx.amount}|{tx.fee}".encode()
    tx_hash = hashlib.sha256(hashlib.sha256(payload).digest()).digest()
    
    # Cryptographic ECDSA signature verification
    try:
        vk = ecdsa.VerifyingKey.from_string(bytes.fromhex(tx.public_key), curve=ecdsa.SECP256k1)
        if vk.verify(bytes.fromhex(tx.signature), tx_hash):
            mempool.append(tx.dict())
            return {"status": "accepted", "txid": tx_hash.hex()}
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="[CRITICAL: Invalid Digital Signature - Transaction Blocked]"
        )

# --- Step 3: Proof-of-Work Mining Engine ---
@app.get("/api/mine")
def mine_block():
    target_prefix = "0000"
    nonce = 0
    while True:
        header = f"height|prev_hash|merkle_root|{nonce}".encode()
        block_hash = hashlib.sha256(hashlib.sha256(header).digest()).hexdigest()
        if block_hash.startswith(target_prefix):
            return {"status": "mined", "nonce": nonce, "hash": block_hash}
        nonce += 1
`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              API Gateways & Python Backend Code
            </h2>
            <p className="text-xs text-slate-400">
              FastAPI endpoint specifications matching project blueprint
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-md border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveEndpoint('chain')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeEndpoint === 'chain' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            GET /api/chain
          </button>
          <button
            onClick={() => setActiveEndpoint('tx_new')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeEndpoint === 'tx_new' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            POST /api/transactions/new
          </button>
          <button
            onClick={() => setActiveEndpoint('python_code')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeEndpoint === 'python_code' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Python Backend Code
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {activeEndpoint === 'chain' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
              <span className="text-emerald-400 font-bold">200 OK · application/json</span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(chainResponse, null, 2))}
                className="text-slate-400 hover:text-amber-400 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">Copy JSON</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 max-h-[380px] overflow-y-auto leading-relaxed select-all">
              {JSON.stringify(chainResponse, null, 2)}
            </pre>
          </div>
        )}

        {activeEndpoint === 'tx_new' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
              <span className="text-amber-400 font-bold">POST /api/transactions/new</span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(txSchema, null, 2))}
                className="text-slate-400 hover:text-amber-400 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">Copy Schema</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 max-h-[380px] overflow-y-auto leading-relaxed select-all">
              {JSON.stringify(txSchema, null, 2)}
            </pre>
          </div>
        )}

        {activeEndpoint === 'python_code' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
              <span className="text-sky-400 font-bold">FastAPI + SECP256k1 Blueprint Reference</span>
              <button
                onClick={() => copyToClipboard(pythonReferenceCode)}
                className="text-slate-400 hover:text-amber-400 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">Copy Python Code</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 max-h-[380px] overflow-y-auto leading-relaxed select-all">
              {pythonReferenceCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
