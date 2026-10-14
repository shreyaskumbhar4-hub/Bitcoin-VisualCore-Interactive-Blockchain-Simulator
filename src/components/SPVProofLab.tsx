/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Block } from '../core/types';
import { generateSPVProof, verifySPVProof } from '../core/utxo';
import { Smartphone, CheckCircle, GitBranch, ArrowRight, ShieldCheck, Binary } from 'lucide-react';

interface SPVProofLabProps {
  chain: Block[];
}

export const SPVProofLab: React.FC<SPVProofLabProps> = ({ chain }) => {
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(0);
  const activeBlock = chain[selectedBlockIndex] || chain[0];

  const [selectedTxId, setSelectedTxId] = useState<string>(
    activeBlock.transactions[0]?.id || ''
  );

  const proof = generateSPVProof(selectedTxId, activeBlock);
  const isValidProof = proof ? verifySPVProof(proof) : false;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              SPV Light Clients & Merkle Proof Verification
            </h2>
            <p className="text-xs text-slate-400">
              How mobile Bitcoin wallets verify transactions without downloading the entire 600GB blockchain
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        {/* Controls */}
        <div className="space-y-3">
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Select Block to Audit:
            </label>
            <select
              value={selectedBlockIndex}
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                setSelectedBlockIndex(idx);
                setSelectedTxId(chain[idx]?.transactions[0]?.id || '');
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            >
              {chain.map((b) => (
                <option key={b.index} value={b.index}>
                  Block #{b.index} ({b.transactions.length} txs)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Target Transaction ID to Verify:
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {activeBlock.transactions.map((tx, idx) => (
                <button
                  key={tx.id + idx}
                  onClick={() => setSelectedTxId(tx.id)}
                  className={`w-full text-left p-2 rounded border font-mono text-[10px] truncate transition-all ${
                    selectedTxId === tx.id
                      ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 font-bold'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block truncate">TX #{idx + 1}: {tx.id.slice(0, 16)}...</span>
                  <span className="text-slate-500 text-[9px] block">
                    {tx.amount.toFixed(2)} BTC to {tx.recipientAddress.slice(0, 10)}...
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Stage */}
        <div className="md:col-span-2 space-y-4">
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sky-400 font-bold flex items-center gap-1.5 text-xs">
                <GitBranch className="w-4 h-4" />
                <span>Logarithmic Merkle Audit Path (O(log2 N) Hashes)</span>
              </span>
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>SPV Proof Valid</span>
              </span>
            </div>

            {proof && (
              <div className="space-y-2 text-[11px]">
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-300">
                  <span className="text-slate-500 block text-[9px]">TARGET TX HASH:</span>
                  <span className="text-white truncate block">{proof.txId}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-slate-500 text-[10px] block">
                    SIBLING HASHES NEEDED FOR PROOF ({proof.path.length} steps):
                  </span>
                  {proof.path.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-slate-900/60 rounded border border-slate-800 flex items-center justify-between text-[10px]"
                    >
                      <span className="text-purple-300 truncate max-w-[240px]">
                        Sibling {idx + 1}: {step.hash.slice(0, 20)}...
                      </span>
                      <span className="text-slate-400 font-sans">
                        Position: {step.isRightSibling ? 'Right sibling' : 'Left sibling'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-amber-950/20 rounded border border-amber-500/30 text-amber-300">
                  <span className="text-amber-400 block text-[9px] font-bold">
                    RECONSTRUCTED ROOT HASH EQUALS BLOCK HEADER:
                  </span>
                  <span className="text-white truncate block text-[11px] font-bold">
                    {proof.merkleRoot}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Educational Whitepaper Note */}
          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1 font-sans">
            <span className="font-semibold text-white block">
              Satoshi Nakamoto (Section 8: Simplified Payment Verification):
            </span>
            <p>
              "He can't check the transaction himself, but by linking it to a place in the chain, he can see that a network node has accepted it, and blocks added after it further confirm the network has accepted it."
            </p>
            <p className="text-slate-300">
              For a block with 4,000 transactions, a light client only needs $\log_2(4000) \approx 12$ hashes ($\approx 384$ bytes) instead of downloading 2 megabytes of raw data!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
