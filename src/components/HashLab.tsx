/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { sha256, hash256, hexToBytes } from '../core/crypto';
import { Binary, Sparkles, RefreshCw, Layers } from 'lucide-react';

export const HashLab: React.FC = () => {
  const [inputText, setInputText] = useState<string>('Bitcoin: A Peer-to-Peer Electronic Cash System');
  const [nonce, setNonce] = useState<number>(0);

  const rawData = `${inputText}|${nonce}`;
  const singleHash = sha256(rawData);
  const doubleHash = hash256(rawData);

  // Convert single hash to binary string
  const hashBytes = hexToBytes(singleHash);
  let binaryString = '';
  for (let i = 0; i < hashBytes.length; i++) {
    binaryString += hashBytes[i].toString(2).padStart(8, '0');
  }

  const onesCount = (binaryString.match(/1/g) || []).length;
  const zerosCount = 256 - onesCount;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Binary className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              SHA-256 & Hash256 Scratchpad
            </h2>
            <p className="text-xs text-slate-400">
              Interactive demonstration of the Cryptographic Avalanche Effect
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        {/* Input box */}
        <div>
          <label className="block text-slate-400 font-medium mb-1">
            Input Message / Block Payload:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="sm:col-span-3 px-3 py-2 bg-slate-950 border border-slate-800 rounded-md font-mono text-white text-xs focus:outline-none focus:border-amber-500"
              placeholder="Type any message..."
            />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-mono">Nonce:</span>
              <input
                type="number"
                value={nonce}
                onChange={(e) => setNonce(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-md font-mono text-white text-xs text-center"
              />
            </div>
          </div>
        </div>

        {/* Hashes output */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-sky-400 block text-[10px] font-bold mb-1">
              SINGLE SHA-256 (256-bit Hex):
            </span>
            <div className="text-white break-all select-all text-xs font-semibold">
              {singleHash}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-amber-400 block text-[10px] font-bold mb-1">
              BITCOIN DOUBLE-SHA256 (Hash256):
            </span>
            <div className="text-white break-all select-all text-xs font-semibold">
              {doubleHash}
            </div>
          </div>
        </div>

        {/* 256-bit Binary visualization */}
        <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-mono">
            <span>256 Bits Distribution (Uniformity Check):</span>
            <span className="text-slate-300">
              1s: <strong className="text-amber-400">{onesCount}</strong> ({((onesCount / 256) * 100).toFixed(1)}%) · 0s: <strong className="text-sky-400">{zerosCount}</strong>
            </span>
          </div>
          <div className="font-mono text-[9px] text-slate-400 break-all leading-relaxed p-2 bg-black/60 rounded border border-slate-900 select-all">
            {binaryString.match(/.{1,32}/g)?.map((chunk, i) => (
              <span key={i} className="inline-block mr-2 text-slate-300">
                {chunk}
              </span>
            ))}
          </div>
        </div>

        {/* Educational concept note */}
        <div className="p-3 bg-slate-950/60 rounded border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1">
          <span className="font-semibold text-white block">
            The Avalanche Effect in Cryptography:
          </span>
          <p>
            Notice that altering even a single character in the input message completely randomizes every byte of the output hash. SHA-256 is mathematically designed so that output bits have no observable correlation with input bits, making it impossible to "predict" which nonce will yield leading zeros without brute-force computation.
          </p>
        </div>
      </div>
    </div>
  );
};
