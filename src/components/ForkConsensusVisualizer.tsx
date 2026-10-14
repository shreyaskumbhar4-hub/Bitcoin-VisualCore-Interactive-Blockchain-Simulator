/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GitFork, ArrowRight, ShieldCheck, AlertTriangle, RotateCcw, Check, Zap } from 'lucide-react';

export const ForkConsensusVisualizer: React.FC = () => {
  const [forkState, setForkState] = useState<'single' | 'forked' | 'resolved'>('single');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Blockchain Forks & Nakamoto Consensus (Longest Chain Rule)
            </h2>
            <p className="text-xs text-slate-400">
              Interactive simulation of chain splits, orphan blocks, and automatic reorganizations
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 text-xs">
          {forkState === 'single' && (
            <button
              onClick={() => setForkState('forked')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Simultaneous Block Split (Fork)</span>
            </button>
          )}

          {forkState === 'forked' && (
            <button
              onClick={() => setForkState('resolved')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mine Next Block on Chain A (Trigger Reorg)</span>
            </button>
          )}

          {forkState === 'resolved' && (
            <button
              onClick={() => setForkState('single')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Consensus Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Graphical Fork Diagram */}
      <div className="p-5 bg-slate-950 rounded-lg border border-slate-800 mb-4 overflow-x-auto">
        <div className="min-w-[620px] space-y-5 font-mono text-xs">
          {/* Common History */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 border border-slate-700 rounded-md text-center w-36">
              <span className="text-amber-400 font-bold block text-[11px]">Genesis #0</span>
              <span className="text-slate-500 text-[9px]">Hash: 0000a1...</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
            <div className="p-3 bg-slate-900 border border-slate-700 rounded-md text-center w-36">
              <span className="text-white font-bold block text-[11px]">Block #1</span>
              <span className="text-slate-500 text-[9px]">Hash: 0000b2...</span>
            </div>

            {/* Split starts */}
            {forkState === 'single' ? (
              <>
                <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-md text-center w-36">
                  <span className="text-emerald-400 font-bold block text-[11px]">Block #2 (Tip)</span>
                  <span className="text-slate-400 text-[9px]">Unanimous Tip</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 ml-2">
                {/* Branch A (Miner 1) */}
                <div className="flex items-center gap-3">
                  <div className="text-[10px] text-amber-400 w-20 font-bold">Branch A:</div>
                  <div
                    className={`p-3 rounded-md text-center w-40 border ${
                      forkState === 'resolved'
                        ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                        : 'bg-slate-900 border-amber-500/50 text-white'
                    }`}
                  >
                    <span className="font-bold block text-[11px]">Block #2a (Charlie)</span>
                    <span className="text-slate-400 text-[9px]">Hash: 0000c3...</span>
                  </div>

                  {forkState === 'resolved' && (
                    <>
                      <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="p-3 bg-emerald-950/70 border border-emerald-500 rounded-md text-center w-40 shadow-md">
                        <span className="text-emerald-300 font-bold block text-[11px]">Block #3 (Winner!)</span>
                        <span className="text-emerald-400 text-[9px] font-bold">Longest Chain Tip</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Branch B (Miner 2) */}
                <div className="flex items-center gap-3">
                  <div className="text-[10px] text-sky-400 w-20 font-bold">Branch B:</div>
                  <div
                    className={`p-3 rounded-md text-center w-40 border ${
                      forkState === 'resolved'
                        ? 'bg-rose-950/30 border-rose-500/50 opacity-60 text-rose-300'
                        : 'bg-slate-900 border-sky-500/50 text-white'
                    }`}
                  >
                    <span className="font-bold block text-[11px]">Block #2b (Alpha)</span>
                    <span className="text-slate-400 text-[9px]">
                      {forkState === 'resolved' ? 'ORPHANED BLOCK' : 'Hash: 0000d4...'}
                    </span>
                  </div>

                  {forkState === 'resolved' && (
                    <div className="text-[10px] text-rose-400 font-sans italic">
                      ← Abandoned! Transactions return to Mempool
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explanatory Consensus Card */}
      <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-2">
        <div className="font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>The Nakamoto Consensus Rule Explained:</span>
        </div>
        <p className="leading-relaxed text-slate-300 text-xs">
          Because network latency exists across continents, two miners occasionally discover a valid Proof-of-Work block at virtually the same second. When this happens, the network temporarily forks into two rival chains of equal height.
        </p>
        <p className="leading-relaxed text-slate-300 text-xs">
          Satoshi designed the **Longest Chain Rule**: All nodes keep working on whichever chain they saw first, but agree to switch unconditionally to whichever chain discovers the next block first (representing more accumulated Proof-of-Work). The shorter branch is discarded as an **Orphan Block**, restoring universal consensus automatically with zero human coordination!
        </p>
      </div>
    </div>
  );
};
