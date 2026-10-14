/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wallet, Transaction, Block } from '../core/types';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Key,
  Layers,
  Cpu,
  GitBranch,
  ShieldCheck,
  Radio,
  UserCheck,
  ArrowRight,
  Sparkles,
  Coins,
} from 'lucide-react';

interface BlockCreationPipelineProps {
  wallets: Wallet[];
  chain: Block[];
  onTriggerMineSample?: () => void;
}

interface StepData {
  step: number;
  id: string;
  title: string;
  actor: string;
  icon: React.ReactNode;
  summary: string;
  details: string;
  bitcoinWhitepaperRef: string;
}

const PIPELINE_STEPS: StepData[] = [
  {
    step: 1,
    id: 'sender_sign',
    title: '1. Sender Cryptographic Signing',
    actor: 'Sender (Alice) · Wallet Client',
    icon: <Key className="w-5 h-5 text-amber-400" />,
    summary: 'Alice authorizes the payment by creating an ECDSA digital signature over the transaction hash.',
    details:
      'Alice signs the transaction payload (Sender, Recipient, Amount, Fee) using her 256-bit SECP256k1 private key. This yields signature pair (r, s). Because only Alice possesses her private key, no middleman can forge or tamper with the transfer details in transit.',
    bitcoinWhitepaperRef: 'Section 2: "An electronic coin is a chain of digital signatures."',
  },
  {
    step: 2,
    id: 'mempool_queue',
    title: '2. Mempool Broadcast & Fee Market',
    actor: 'P2P Gossip Network · Full Nodes',
    icon: <Layers className="w-5 h-5 text-sky-400" />,
    summary: 'The signed transaction is broadcast to neighbor nodes and enters the unconfirmed Mempool.',
    details:
      'Every receiving node verifies Alice\'s signature against her public key before relaying the transaction to peers. Transactions wait in the memory pool (Mempool). Miners will prioritize transactions offering higher fee rates (sat/vB).',
    bitcoinWhitepaperRef: 'Section 5: "1) New transactions are broadcast to all nodes."',
  },
  {
    step: 3,
    id: 'miner_package',
    title: '3. Miner Candidate Block Assembly',
    actor: 'Miner Node (Charlie) · Mining Rig',
    icon: <Coins className="w-5 h-5 text-amber-500" />,
    summary: 'Charlie collects top-fee transactions and prepends the Coinbase Reward transaction.',
    details:
      'Charlie creates a candidate block. The very first transaction is the special "Coinbase Transaction", minting 3.125 fresh Bitcoins plus all accumulated transaction fees directly to Charlie\'s miner address.',
    bitcoinWhitepaperRef: 'Section 5: "2) Each node collects new transactions into a block."',
  },
  {
    step: 4,
    id: 'merkle_construct',
    title: '4. Merkle Tree Root Computation',
    actor: 'Consensus Engine · Binary Hash Tree',
    icon: <GitBranch className="w-5 h-5 text-purple-400" />,
    summary: 'Transactions are paired and hashed recursively into a single 32-byte Merkle Root.',
    details:
      'Transactions are arranged in pairs and hashed with double-SHA256: H(H(A) + H(B)). This binary tree converges to a single 32-byte root hash. Modifying even one satoshi anywhere in the block changes the root completely.',
    bitcoinWhitepaperRef: 'Section 7: "Transactions are hashed in a Merkle Tree, with only the root included in the block\'s hash."',
  },
  {
    step: 5,
    id: 'pow_mining',
    title: '5. Proof-of-Work Nonce Hunting',
    actor: 'ASIC / Hardware · Hashcash Loop',
    icon: <Cpu className="w-5 h-5 text-rose-400" />,
    summary: 'Miner increments a 32-bit nonce until double-SHA256 satisfies the difficulty target.',
    details:
      'The miner repeatedly hashes: SHA256(SHA256(Index + PrevHash + MerkleRoot + Time + Difficulty + Nonce)). Millions of nonces are tested until the output hash begins with the required number of leading zeroes (e.g. 000...).',
    bitcoinWhitepaperRef: 'Section 4: "Scanning for a value that when hashed... begins with a number of zero bits."',
  },
  {
    step: 6,
    id: 'chain_link',
    title: '6. Cryptographic Chain Anchoring',
    actor: 'Blockchain Ledger · Consensus Link',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    summary: 'The new block points to the previous block\'s hash, extending the immutable ledger.',
    details:
      'By embedding previous_hash into the new block header, the new block becomes permanently anchored. Altering any prior block would require re-doing the proof of work for every single subsequent block.',
    bitcoinWhitepaperRef: 'Section 4: "The proof-of-work also solves the problem of determining representation in majority decision making."',
  },
  {
    step: 7,
    id: 'receiver_confirmed',
    title: '7. P2P Propagation & Receiver Confirmation',
    actor: 'Recipient (Bob) · Final Settlement',
    icon: <UserCheck className="w-5 h-5 text-emerald-400" />,
    summary: 'The mined block is propagated via gossip to Bob. Bob receives 1 Confirmation!',
    details:
      'Bob\'s node receives the new block over the P2P network, validates all transactions, and confirms that Alice\'s payment is permanently recorded. The funds are now available in Bob\'s UTXO set with 1 Confirmation.',
    bitcoinWhitepaperRef: 'Section 5: "Nodes accept the block only if all transactions in it are valid and not already spent."',
  },
];

export const BlockCreationPipeline: React.FC<BlockCreationPipelineProps> = ({
  wallets,
  chain,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const activeStep = PIPELINE_STEPS[currentStepIndex];

  // Auto-play timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= PIPELINE_STEPS.length - 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 3200);

    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Interactive Block Creation & Miner-to-Destination Pipeline
            </h2>
            <p className="text-xs text-slate-400">
              Visual step-by-step lifecycle from Sender's wallet to Miner to Receiver's confirmation
            </p>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Journey' : 'Auto-Play Pipeline'}</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graphical Flow Bar: Connected Nodes */}
      <div className="mb-6 p-4 bg-slate-950 rounded-lg border border-slate-800">
        <div className="relative">
          {/* Connecting Background Line */}
          <div className="absolute top-5 left-4 right-4 h-0.5 bg-slate-800 -z-0" />
          {/* Active progress line */}
          <div
            className="absolute top-5 left-4 h-0.5 bg-amber-500 transition-all duration-500 -z-0"
            style={{
              width: `${(currentStepIndex / (PIPELINE_STEPS.length - 1)) * 100}%`,
            }}
          />

          {/* Stepper Nodes */}
          <div className="flex justify-between relative z-10">
            {PIPELINE_STEPS.map((s, idx) => {
              const isActive = idx === currentStepIndex;
              const isPast = idx < currentStepIndex;

              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(idx);
                  }}
                  className="flex flex-col items-center group cursor-pointer focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/30 scale-110 shadow-lg'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 border-2 border-slate-700 text-slate-400 group-hover:border-slate-500'
                    }`}
                  >
                    {s.icon}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 font-mono text-center max-w-[80px] hidden sm:block ${
                      isActive ? 'text-amber-400 font-bold' : isPast ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {s.title.split('. ')[1]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Stage Detailed Graphical Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Left: Interactive Diagram / Visual Simulation */}
        <div className="lg:col-span-2 p-5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                  Phase {activeStep.step} of 7:
                </span>
                <span className="text-white text-sm font-bold font-sans">
                  {activeStep.title}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {activeStep.actor}
              </span>
            </div>

            {/* Custom Graphical Representation per Stage */}
            <div className="my-4 p-4 rounded-lg bg-slate-900/60 border border-slate-800 min-h-[160px] flex items-center justify-center">
              {/* Stage 1: Sender Signs */}
              {activeStep.id === 'sender_sign' && (
                <div className="flex flex-col sm:flex-row items-center gap-6 text-xs font-mono">
                  <div className="p-3 bg-slate-950 rounded border border-amber-500/40 text-center">
                    <span className="text-amber-400 block font-bold mb-1">Alice's Private Key (k)</span>
                    <span className="text-slate-400 text-[10px]">256-bit Secret Scalar</span>
                  </div>
                  <div className="flex flex-col items-center text-amber-500">
                    <span className="text-[10px] text-slate-400 mb-1">ECDSA Signature Math</span>
                    <ArrowRight className="w-5 h-5 text-amber-400 animate-pulse" />
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-emerald-500/40 text-center">
                    <span className="text-emerald-400 block font-bold mb-1">Signature (r, s)</span>
                    <span className="text-slate-400 text-[10px]">Locked to Tx Hash</span>
                  </div>
                </div>
              )}

              {/* Stage 2: Mempool */}
              {activeStep.id === 'mempool_queue' && (
                <div className="w-full flex items-center justify-around text-xs font-mono">
                  <div className="text-center p-2.5 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Alice's Node</span>
                    <span className="text-sky-400 font-bold">1.5 BTC</span>
                  </div>
                  <div className="text-sky-400 flex items-center gap-1 animate-pulse">
                    <span className="text-[10px]">Gossip Protocol</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="text-center p-3 bg-amber-950/20 rounded border border-amber-500/40">
                    <span className="text-amber-400 block font-bold">Global Mempool</span>
                    <span className="text-slate-300 text-[10px]">Sorted by Fee (sat/vB)</span>
                  </div>
                </div>
              )}

              {/* Stage 3: Miner Collects */}
              {activeStep.id === 'miner_package' && (
                <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-mono">
                  <div className="p-2.5 bg-emerald-950/30 rounded border border-emerald-500/30 text-center">
                    <span className="text-emerald-400 block font-bold">Coinbase Mint</span>
                    <span className="text-slate-400 text-[10px]">3.125 BTC + Fees to Charlie</span>
                  </div>
                  <span className="text-slate-500 font-bold">+</span>
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-amber-400 block font-bold">Alice &rarr; Bob</span>
                    <span className="text-slate-400 text-[10px]">1.5 BTC (Fee: 0.001)</span>
                  </div>
                  <div className="flex items-center text-amber-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="p-2.5 bg-purple-950/30 rounded border border-purple-500/40 text-center">
                    <span className="text-purple-300 block font-bold">Candidate Block</span>
                    <span className="text-slate-400 text-[10px]">Block Height #{chain.length}</span>
                  </div>
                </div>
              )}

              {/* Stage 4: Merkle Tree */}
              {activeStep.id === 'merkle_construct' && (
                <div className="flex flex-col items-center gap-2 text-xs font-mono">
                  <div className="px-3 py-1 bg-purple-950/50 border border-purple-500/50 rounded text-purple-300 font-bold">
                    Merkle Root: H(H(0+1) + H(2+3))
                  </div>
                  <div className="w-32 h-2 border-b-2 border-l-2 border-r-2 border-purple-600/60" />
                  <div className="flex gap-4">
                    <div className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-400 text-[10px]">
                      H(TX 0)
                    </div>
                    <div className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-400 text-[10px]">
                      H(TX 1)
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 5: PoW Nonce */}
              {activeStep.id === 'pow_mining' && (
                <div className="flex flex-col items-center gap-2 text-xs font-mono text-center">
                  <div className="text-rose-400 font-bold animate-pulse text-sm">
                    Scanning Nonces: 0 ... 2,083,236,893
                  </div>
                  <div className="p-2 bg-black rounded border border-slate-800 text-[11px] text-slate-300">
                    <code>SHA256(SHA256(BlockHeader + Nonce)) &lt; Target</code>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    ✓ Found: 0000a4b8... (Meets Difficulty Target)
                  </span>
                </div>
              )}

              {/* Stage 6: Chain Link */}
              {activeStep.id === 'chain_link' && (
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">Block #{chain.length - 1}</span>
                    <span className="text-white text-[11px]">Hash: {chain[chain.length - 1]?.hash.slice(0, 10)}...</span>
                  </div>
                  <div className="flex flex-col items-center text-amber-400">
                    <span className="text-[9px] text-slate-500">prev_hash</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <div className="p-2.5 bg-emerald-950/40 rounded border border-emerald-500/50 text-center">
                    <span className="text-emerald-400 block font-bold text-[10px]">Block #{chain.length}</span>
                    <span className="text-emerald-200 text-[11px]">Anchored to Ledger</span>
                  </div>
                </div>
              )}

              {/* Stage 7: Destination Delivery */}
              {activeStep.id === 'receiver_confirmed' && (
                <div className="flex flex-col sm:flex-row items-center gap-5 text-xs font-mono">
                  <div className="p-3 bg-amber-950/20 rounded border border-amber-500/30 text-center">
                    <span className="text-amber-400 block font-bold">Miner (Charlie)</span>
                    <span className="text-slate-300 text-[10px]">+3.126 BTC Reward</span>
                  </div>
                  <div className="text-emerald-400 flex items-center gap-1 font-sans font-bold">
                    <span>1 Confirmation</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="p-3 bg-emerald-950/30 rounded border border-emerald-500/50 text-center">
                    <span className="text-emerald-400 block font-bold">Receiver (Bob)</span>
                    <span className="text-white text-[10px]">+1.50 BTC Settled</span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeStep.details}
            </p>
          </div>

          {/* Step Navigation Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              disabled={currentStepIndex === 0}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex((prev) => Math.max(0, prev - 1));
              }}
              className="px-3 py-1.5 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous Phase</span>
            </button>

            <span className="text-xs text-slate-500 font-mono">
              Step {currentStepIndex + 1} of {PIPELINE_STEPS.length}
            </span>

            <button
              disabled={currentStepIndex === PIPELINE_STEPS.length - 1}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex((prev) => Math.min(PIPELINE_STEPS.length - 1, prev + 1));
              }}
              className="px-3 py-1.5 text-xs text-slate-200 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 rounded transition-colors flex items-center gap-1 font-semibold"
            >
              <span>Next Phase</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Bitcoin Whitepaper Quote & Concept Anchor */}
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex flex-col justify-between text-xs">
          <div className="space-y-3">
            <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
              Satoshi Nakamoto's Whitepaper Formulation:
            </span>
            <div className="p-3 bg-slate-900 rounded border-l-2 border-amber-500 italic text-slate-200 font-serif text-[11px] leading-relaxed">
              {activeStep.bitcoinWhitepaperRef}
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
              <span className="text-amber-400 font-semibold block font-sans">
                Key Blockchain Takeaway:
              </span>
              <p>{activeStep.summary}</p>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-slate-900/80 rounded border border-slate-800 font-mono text-[10px] text-slate-400">
            <span>Status:</span>{' '}
            <span className="text-emerald-400 font-bold">Active in Consensus Loop</span>
          </div>
        </div>
      </div>
    </div>
  );
};
