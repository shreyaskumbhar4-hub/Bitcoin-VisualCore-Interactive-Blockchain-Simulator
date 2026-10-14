/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Transaction } from '../core/types';
import { Layers, ArrowRight, ShieldCheck, Trash2, Zap } from 'lucide-react';

interface MempoolQueueProps {
  mempool: Transaction[];
  onClearMempool: () => void;
  onQuickSimulate: () => void;
  onFocusMiner?: () => void;
}

export const MempoolQueue: React.FC<MempoolQueueProps> = ({
  mempool,
  onClearMempool,
  onQuickSimulate,
  onFocusMiner,
}) => {
  const totalFees = mempool.reduce((acc, tx) => acc + tx.fee, 0);
  const totalVolume = mempool.reduce((acc, tx) => acc + tx.amount, 0);

  // Sort by highest fee first (miner priority incentive)
  const sortedMempool = [...mempool].sort((a, b) => b.fee - a.fee);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Live Mempool Queue</span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  mempool.length > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-500'
                }`}
              >
                ({mempool.length} pending)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Unconfirmed transactions waiting for miner inclusion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onQuickSimulate}
            className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Generate a simulated peer transaction"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Peer TX</span>
          </button>
          {mempool.length > 0 && (
            <button
              onClick={onClearMempool}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title="Clear all mempool transactions"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mempool Economics Banner */}
      <div className="grid grid-cols-2 gap-3 mb-3 p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-md text-xs font-mono">
        <div>
          <span className="text-slate-500 block text-[10px]">Pending Fees for Next Miner</span>
          <span className="text-emerald-400 font-semibold">{totalFees.toFixed(4)} BTC</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 block text-[10px]">Total Unconfirmed Volume</span>
          <span className="text-amber-400 font-semibold">{totalVolume.toFixed(2)} BTC</span>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 overflow-y-auto max-h-[360px] space-y-2.5 pr-1">
        {sortedMempool.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
            <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="font-medium text-slate-400 mb-1">Mempool is currently empty</p>
            <p className="text-[11px] text-slate-500">
              Sign a new transaction or click "Simulate Peer TX" to push unconfirmed transactions into the queue.
            </p>
          </div>
        ) : (
          sortedMempool.map((tx, idx) => (
            <div
              key={tx.id}
              className="p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-md transition-all text-xs"
            >
              <div className="flex items-center justify-between mb-1.5 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 text-[10px]">#{idx + 1}</span>
                  <span className="text-slate-400 truncate max-w-[140px] text-[11px]">
                    TX: {tx.id.slice(0, 10)}...{tx.id.slice(-6)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-sans">
                    <ShieldCheck className="w-3 h-3" />
                    <span>ECDSA Verified</span>
                  </span>
                  <span className="text-amber-400 font-semibold text-[11px]">
                    Fee: {tx.fee.toFixed(4)} BTC
                  </span>
                </div>
              </div>

              {/* Sender & Recipient flow */}
              <div className="flex items-center justify-between text-[11px] text-slate-300 py-1 bg-slate-900/50 px-2 rounded font-mono">
                <span className="truncate max-w-[120px]" title={tx.senderAddress}>
                  {tx.senderAddress.slice(0, 10)}...
                </span>
                <div className="flex items-center gap-1 text-slate-500">
                  <span className="text-white font-bold">{tx.amount.toFixed(2)} BTC</span>
                  <ArrowRight className="w-3 h-3 text-amber-500" />
                </div>
                <span className="truncate max-w-[120px]" title={tx.recipientAddress}>
                  {tx.recipientAddress.slice(0, 10)}...
                </span>
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                <span>{(tx.amount * 100_000_000).toLocaleString()} sats</span>
                <span>Time: {new Date(tx.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
