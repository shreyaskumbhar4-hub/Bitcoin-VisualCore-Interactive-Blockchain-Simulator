/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wallet, Block } from '../core/types';
import { extractLedgerUTXOs } from '../core/utxo';
import { Coins, ArrowRight, ShieldAlert, CheckCircle2, Split, Database, AlertOctagon } from 'lucide-react';

interface UTXOVisualizerProps {
  chain: Block[];
  wallets: Wallet[];
}

export const UTXOVisualizer: React.FC<UTXOVisualizerProps> = ({ chain, wallets }) => {
  const [doubleSpendAttempt, setDoubleSpendAttempt] = useState<boolean>(false);
  const [activeModelTab, setActiveModelTab] = useState<'utxo' | 'account'>('utxo');

  const utxos = extractLedgerUTXOs(chain);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              UTXO Model vs Account Model & Double-Spend Defense
            </h2>
            <p className="text-xs text-slate-400">
              How Bitcoin links Sender Inputs to Receiver Outputs without central account balances
            </p>
          </div>
        </div>

        {/* Segmented view controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-md border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveModelTab('utxo')}
            className={`px-3 py-1 rounded transition-colors ${
              activeModelTab === 'utxo'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bitcoin UTXO Architecture
          </button>
          <button
            onClick={() => setActiveModelTab('account')}
            className={`px-3 py-1 rounded transition-colors ${
              activeModelTab === 'account'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Account Model Comparison
          </button>
        </div>
      </div>

      {activeModelTab === 'utxo' ? (
        <div className="space-y-5 text-xs">
          {/* Interactive Graphical Flow: Input UTXO -> Transaction -> Output UTXOs + Miner Fee */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-mono text-[11px] block mb-3 font-semibold">
              Anatomy of a Real Bitcoin Transaction (Inputs &rarr; Outputs + Fee):
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Input UTXO */}
              <div className="p-3.5 bg-slate-900 rounded-md border border-amber-500/30 text-left font-mono">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-amber-400 font-bold text-[11px]">CONSUMED INPUT</span>
                  <span className="text-slate-500 text-[10px]">1 Input</span>
                </div>
                <div className="text-white font-bold text-sm mb-1">
                  25.00 BTC (Alice)
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  <span className="text-slate-500 block">scriptSig (Unlocking):</span>
                  <code>ECDSA_SIG(Alice) + PUBKEY</code>
                </div>
              </div>

              {/* Transaction Engine */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-900/60 rounded border border-slate-800 text-center font-mono">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Consensus Math</span>
                <span className="text-emerald-400 font-bold my-1 text-xs">
                  {"Σ(Inputs) ≥ Σ(Outputs)"}
                </span>
                <span className="text-amber-400 text-[11px] font-semibold">
                  Fee: 0.001 BTC
                </span>
                <span className="text-[10px] text-slate-500">
                  (Miner incentive: collected by block finder)
                </span>
              </div>

              {/* Output UTXOs */}
              <div className="space-y-2 font-mono">
                {/* Output 0: Receiver */}
                <div className="p-2.5 bg-emerald-950/30 rounded border border-emerald-500/40 text-left">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400 font-bold">OUTPUT #0 (Payment)</span>
                    <span className="text-white font-bold">1.50 BTC</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Locked to Bob: <code className="text-emerald-300">OP_DUP OP_HASH160 Bob...</code>
                  </span>
                </div>

                {/* Output 1: Change to Sender */}
                <div className="p-2.5 bg-slate-900 rounded border border-slate-700 text-left">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-300 font-bold">OUTPUT #1 (Change)</span>
                    <span className="text-white font-bold">23.499 BTC</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Change returned to Alice's address
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Double Spend Attack Simulation */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Double-Spend Attack Simulation:</span>
              </span>

              <button
                onClick={() => setDoubleSpendAttempt(!doubleSpendAttempt)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  doubleSpendAttempt
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                }`}
              >
                <span>{doubleSpendAttempt ? 'Clear Double-Spend' : 'Simulate Double-Spend Attack'}</span>
              </button>
            </div>

            <p className="text-slate-300 text-xs mb-3 leading-relaxed">
              In digital cash, an attacker might try to spend the same coin twice (e.g. paying Bob for goods while simultaneously broadcasting a competing transaction sending the same coin back to themselves).
            </p>

            {doubleSpendAttempt ? (
              <div className="p-3 bg-rose-950/70 border border-rose-500 rounded-md text-xs font-mono space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>[DOUBLE SPEND BLOCKED BY CONSENSUS ENGINE]</span>
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  TX2 references UTXO <code className="text-rose-400">tx_id_alice:0</code> which is already marked as spent in the node's mempool and candidate ledger. The peer nodes refuse to relay TX2 and all miners drop it immediately.
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-rose-900/60 font-sans">
                  Satoshi's Solution: Proof-of-Work distributed timestamping orders transactions globally. The first valid transaction included in a block with sufficient confirmations becomes the only recognized spend of that UTXO.
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-md text-xs text-slate-400 flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>UTXO Set Status: Clean. All unspent outputs have singular ownership and zero conflicting spends.</span>
              </div>
            )}
          </div>

          {/* Current Active UTXO Set Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-300 text-xs font-mono">
                Active Ledger UTXO Set ({utxos.length} spendable outputs):
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
              {utxos.map((u, i) => (
                <div
                  key={u.id + i}
                  className="p-2.5 bg-slate-950/80 rounded border border-slate-800 flex items-center justify-between"
                >
                  <div className="truncate max-w-[280px]">
                    <span className="text-amber-400 font-bold block">{u.amount.toFixed(4)} BTC</span>
                    <span className="text-slate-500 text-[10px] truncate block">
                      Owner: {u.ownerAddress}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Height #{u.blockHeight}</span>
                    <span className="text-[10px] text-emerald-400 font-sans font-semibold">
                      Unspent (Spendable)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Account Model Comparison */
        <div className="space-y-4 text-xs text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-lg border border-amber-500/40">
              <span className="font-bold text-amber-400 text-sm block mb-2 font-mono">
                Bitcoin: UTXO Model
              </span>
              <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                <li>Coins exist as discrete unspent chunks (like physical dollar bills).</li>
                <li>High parallelizability: Transactions can be validated independently across CPU cores.</li>
                <li>Enhanced privacy: Users can generate a fresh change address for every transaction.</li>
                <li>No account balance state; balance is simply the sum of all UTXOs you own.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-bold text-sky-400 text-sm block mb-2 font-mono">
                Ethereum / Banks: Account Model
              </span>
              <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                <li>Global state table mapping addresses to single balance integers.</li>
                <li>Requires sequential execution and nonce counters to prevent replay attacks.</li>
                <li>Simpler for smart contracts with persistent mutable state.</li>
                <li>Susceptible to race conditions and front-running in mempools.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
