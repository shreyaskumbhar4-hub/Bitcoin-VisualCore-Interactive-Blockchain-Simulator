/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Block, Transaction, Wallet } from '../core/types';
import {
  calculateMerkleRoot,
  createCoinbaseTransaction,
  serializeBlockHeader,
  computeBlockHash,
  isValidProofOfWork,
} from '../core/blockchain';
import confetti from 'canvas-confetti';
import { Pickaxe, Play, Pause, StepForward, Award, Target, Cpu, CheckCircle } from 'lucide-react';

interface MiningRigProps {
  chain: Block[];
  mempool: Transaction[];
  wallets: Wallet[];
  difficulty: number;
  setDifficulty: (diff: number) => void;
  onBlockMined: (block: Block) => void;
  onBroadcastPacket?: (type: 'block', dataId: string, label: string) => void;
}

export const MiningRig: React.FC<MiningRigProps> = ({
  chain,
  mempool,
  wallets,
  difficulty,
  setDifficulty,
  onBlockMined,
  onBroadcastPacket,
}) => {
  const latestBlock = chain[chain.length - 1];
  const candidateIndex = chain.length;
  const previousHash = latestBlock.hash;

  // Miner recipient wallet (defaults to Charlie ASIC or Satoshi)
  const [minerWalletId, setMinerWalletId] = useState<string>(
    wallets.find((w) => w.id === 'charlie')?.id || wallets[0].id
  );

  const minerWallet = wallets.find((w) => w.id === minerWalletId) || wallets[0];
  const blockReward = 3.125; // Current halving era Bitcoin reward
  const feesCollected = mempool.reduce((sum, tx) => sum + tx.fee, 0);

  // Candidate transactions: Coinbase first, then mempool
  const candidateCoinbase = createCoinbaseTransaction(
    minerWallet.address,
    blockReward,
    feesCollected,
    candidateIndex
  );
  const candidateTransactions = [candidateCoinbase, ...mempool];
  const candidateMerkleRoot = calculateMerkleRoot(candidateTransactions);

  // Mining state
  const [nonce, setNonce] = useState<number>(0);
  const [currentHash, setCurrentHash] = useState<string>('');
  const [isMining, setIsMining] = useState<boolean>(false);
  const [hashRate, setHashRate] = useState<number>(0);
  const [minedBlockFound, setMinedBlockFound] = useState<Block | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const hashCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const nonceRef = useRef<number>(0);

  const targetPrefix = '0'.repeat(difficulty);

  // Compute preview hash on mount or when candidate changes
  useEffect(() => {
    const preview = computeBlockHash(
      candidateIndex,
      previousHash,
      candidateMerkleRoot,
      Date.now(),
      difficulty,
      nonceRef.current
    );
    setCurrentHash(preview);
  }, [candidateIndex, previousHash, candidateMerkleRoot, difficulty]);

  // Single step nonce test for educational demonstration
  const handleStepOnce = () => {
    if (isMining) return;
    const nextNonce = nonce + 1;
    setNonce(nextNonce);
    nonceRef.current = nextNonce;

    const timestamp = Date.now();
    const hash = computeBlockHash(
      candidateIndex,
      previousHash,
      candidateMerkleRoot,
      timestamp,
      difficulty,
      nextNonce
    );
    setCurrentHash(hash);

    if (isValidProofOfWork(hash, difficulty)) {
      triggerBlockFound(nextNonce, hash, timestamp);
    }
  };

  const triggerBlockFound = (winningNonce: number, winningHash: string, timestamp: number) => {
    setIsMining(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Sound effect simulation via Web Audio
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // AudioContext may be restricted by browser policy
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#3b82f6'],
    });

    const newBlock: Block = {
      index: candidateIndex,
      timestamp,
      previousHash,
      merkleRoot: candidateMerkleRoot,
      transactions: candidateTransactions,
      nonce: winningNonce,
      difficulty,
      hash: winningHash,
      minedBy: minerWallet.address,
      reward: blockReward,
      feesCollected,
      isGenesis: false,
      isTampered: false,
      isValidHash: true,
    };

    setMinedBlockFound(newBlock);
    onBlockMined(newBlock);

    if (onBroadcastPacket) {
      onBroadcastPacket('block', newBlock.hash, `Mined Block #${newBlock.index}`);
    }
  };

  // Continuous mining loop
  useEffect(() => {
    if (!isMining) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setHashRate(0);
      return;
    }

    const batchSize = 1500; // hashes per frame
    let localNonce = nonceRef.current;
    const timestamp = Date.now();

    const mineBatch = () => {
      for (let i = 0; i < batchSize; i++) {
        localNonce++;
        const candidateHash = computeBlockHash(
          candidateIndex,
          previousHash,
          candidateMerkleRoot,
          timestamp,
          difficulty,
          localNonce
        );

        hashCountRef.current++;

        if (isValidProofOfWork(candidateHash, difficulty)) {
          setNonce(localNonce);
          nonceRef.current = localNonce;
          setCurrentHash(candidateHash);
          triggerBlockFound(localNonce, candidateHash, timestamp);
          return;
        }
      }

      setNonce(localNonce);
      nonceRef.current = localNonce;

      // Update current displayed hash
      const latestHash = computeBlockHash(
        candidateIndex,
        previousHash,
        candidateMerkleRoot,
        timestamp,
        difficulty,
        localNonce
      );
      setCurrentHash(latestHash);

      // Measure hash rate every 250ms
      const now = performance.now();
      const elapsed = (now - lastTimeRef.current) / 1000;
      if (elapsed > 0.25) {
        const rate = Math.round(hashCountRef.current / elapsed);
        setHashRate(rate);
        hashCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(mineBatch);
    };

    lastTimeRef.current = performance.now();
    hashCountRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(mineBatch);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMining, candidateIndex, previousHash, candidateMerkleRoot, difficulty]);

  // Colorize leading matching zeros
  const matchingZerosCount = currentHash.split('').findIndex((c) => c !== '0');
  const validLeadingZeros = matchingZerosCount === -1 ? currentHash.length : matchingZerosCount;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Pickaxe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Mining Control Room (Proof-of-Work Engine)
            </h2>
            <p className="text-xs text-slate-400">
              SHA-256 Hashcash cryptographic search & difficulty target
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>Rate:</span>
            <span className="text-white font-semibold tabular-nums">
              {hashRate.toLocaleString()} H/s
            </span>
          </div>
        </div>
      </div>

      {/* Target & Miner Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 text-xs">
        <div>
          <label className="block font-medium text-slate-400 mb-1">
            PoW Difficulty Target:
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((d) => (
              <button
                key={d}
                disabled={isMining}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-1.5 px-2 rounded font-mono text-center transition-colors ${
                  difficulty === d
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {d} Zeroes
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Target prefix: <code className="text-amber-400 font-mono">{targetPrefix}</code> (Chance: 1 in {Math.pow(16, difficulty).toLocaleString()})
          </span>
        </div>

        <div>
          <label className="block font-medium text-slate-400 mb-1">
            Coinbase Reward Beneficiary:
          </label>
          <select
            value={minerWalletId}
            disabled={isMining}
            onChange={(e) => setMinerWalletId(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-amber-500"
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Subsidy: {blockReward} BTC + {feesCollected.toFixed(4)} BTC fees
          </span>
        </div>

        <div>
          <label className="block font-medium text-slate-400 mb-1">
            Block Candidate Payload:
          </label>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-slate-300">
            <div>Height: #{candidateIndex}</div>
            <div className="text-slate-500 truncate">
              Merkle: {candidateMerkleRoot.slice(0, 16)}...
            </div>
          </div>
        </div>
      </div>

      {/* Live Hash & Nonce Visualizer */}
      <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 mb-4 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current Nonce (32-bit):</span>
            <span className="text-xl font-bold text-amber-400 tabular-nums">
              {nonce.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Target className="w-3.5 h-3.5 text-amber-500" />
            <span>Required Prefix:</span>
            <span className="text-emerald-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded">
              {targetPrefix}
            </span>
          </div>
        </div>

        {/* Real-time Hash Output with colored match */}
        <div className="p-3 bg-black/80 rounded border border-slate-800 text-xs sm:text-sm break-all select-all font-mono">
          <span className="text-slate-500 block text-[10px] mb-1">
            Double SHA-256 (SHA256(SHA256(BlockHeader))):
          </span>
          <span className="text-emerald-400 font-bold">
            {currentHash.slice(0, validLeadingZeros)}
          </span>
          <span className="text-slate-300">
            {currentHash.slice(validLeadingZeros)}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Matching zeros: <strong className={validLeadingZeros >= difficulty ? 'text-emerald-400' : 'text-slate-400'}>{validLeadingZeros} / {difficulty}</strong>
          </span>
          <span>
            {validLeadingZeros >= difficulty ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Target met! Valid Proof-of-Work
              </span>
            ) : (
              'Scanning nonce space...'
            )}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setIsMining(!isMining)}
          className={`flex-1 py-2.5 px-4 rounded-md font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs ${
            isMining
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-amber-600 hover:bg-amber-500 text-white'
          }`}
        >
          {isMining ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isMining ? 'Stop Mining Rig' : 'Start Mining Rig'}</span>
        </button>

        <button
          disabled={isMining}
          onClick={handleStepOnce}
          className="py-2.5 px-4 bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-md font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          title="Increment nonce by 1 to examine the cryptographic Avalanche Effect"
        >
          <StepForward className="w-4 h-4 text-amber-400" />
          <span>Step 1 Nonce (Slow-Mo)</span>
        </button>
      </div>

      {/* Mined Block Discovery Banner */}
      {minedBlockFound && (
        <div className="mt-4 p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-xs text-emerald-200">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Block #{minedBlockFound.index} Successfully Mined!</span>
            </span>
            <span className="font-mono text-emerald-300">
              Nonce: {minedBlockFound.nonce.toLocaleString()}
            </span>
          </div>
          <p className="text-slate-300 text-[11px] mb-1">
            Coinbase subsidy of {minedBlockFound.reward} BTC + {minedBlockFound.feesCollected?.toFixed(4)} BTC fees credited to miner. Block appended to distributed chain.
          </p>
          <div className="font-mono text-[10px] text-slate-400 truncate">
            Hash: {minedBlockFound.hash}
          </div>
        </div>
      )}
    </div>
  );
};
