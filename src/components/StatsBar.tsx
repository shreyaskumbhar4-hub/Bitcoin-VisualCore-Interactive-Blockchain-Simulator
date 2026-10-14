/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface StatsBarProps {
  blockHeight: number;
  mempoolCount: number;
  difficulty: number;
  circulatingBtc: number;
  activePeers: number;
  isMining: boolean;
  hashRate: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  blockHeight,
  mempoolCount,
  difficulty,
  circulatingBtc,
  activePeers,
  isMining,
  hashRate,
}) => {
  return (
    <div className="border-b border-slate-800 bg-slate-900/40 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2 text-xs text-slate-400 font-mono">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div>
            <span className="text-slate-500">Block Height</span>{' '}
            <span className="text-white font-semibold">#{blockHeight}</span>
          </div>
          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">·</span>
          <div>
            <span className="text-slate-500">Mempool</span>{' '}
            <span className="text-amber-400 font-semibold">{mempoolCount} unconfirmed</span>
          </div>
          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">·</span>
          <div>
            <span className="text-slate-500">PoW Difficulty</span>{' '}
            <span className="text-white font-semibold">{difficulty} leading zeros</span>
          </div>
          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">·</span>
          <div>
            <span className="text-slate-500">Circulation</span>{' '}
            <span className="text-white font-semibold">{circulatingBtc.toFixed(2)} BTC</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <span className="text-slate-500">Network Peers</span>{' '}
            <span className="text-emerald-400 font-semibold">{activePeers} online</span>
          </div>
          {isMining && (
            <>
              <span className="text-slate-700" aria-hidden="true">·</span>
              <div className="text-amber-400 animate-pulse">
                <span>Mining: {hashRate.toLocaleString()} H/s</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
