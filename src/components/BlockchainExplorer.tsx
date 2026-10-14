/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Block, Transaction } from '../core/types';
import { buildMerkleTree } from '../core/blockchain';
import {
  Boxes,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  GitBranch,
  FileText,
  RotateCcw,
  X,
  Hash,
  ExternalLink,
} from 'lucide-react';

interface BlockchainExplorerProps {
  chain: Block[];
  onTamperBlock: (blockIndex: number, txIndex: number, newAmount: number) => void;
  onRestoreChain: () => void;
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({
  chain,
  onTamperBlock,
  onRestoreChain,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [showMerkleModal, setShowMerkleModal] = useState<Block | null>(null);
  const [tamperingBlockIndex, setTamperingBlockIndex] = useState<number | null>(null);
  const [tamperAmount, setTamperAmount] = useState<number>(999.0);

  // Check which blocks in the chain are valid
  const blockValidity = chain.map((b, i) => {
    if (i === 0) return true;
    const prev = chain[i - 1];
    return b.previousHash === prev.hash && !b.isTampered;
  });

  const anyTampered = chain.some((b) => b.isTampered);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Visual Blockchain Explorer</span>
              <span className="text-xs text-slate-400 font-mono font-normal">
                ({chain.length} blocks minted)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Cryptographically linked block timeline with Merkle tree verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {anyTampered && (
            <button
              onClick={onRestoreChain}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Chain Integrity</span>
            </button>
          )}
        </div>
      </div>

      {/* Explanatory Tamper Banner */}
      {anyTampered && (
        <div className="mb-4 p-3.5 bg-rose-950/70 border border-rose-500/50 rounded-lg text-xs text-rose-200">
          <div className="flex items-center gap-2 font-bold text-rose-300 mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Cryptographic Chain Invalidation Detected!</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            A transaction in a historical block was modified. This changed the block's Merkle root and invalidated its SHA-256 header hash. Because subsequent blocks reference the previous hash, all downstream blocks now have broken cryptographic pointers. This demonstrates why modifying blockchain history is computationally impossible without re-mining every block!
          </p>
        </div>
      )}

      {/* Horizontal Chain Timeline */}
      <div className="overflow-x-auto pb-4 pt-1">
        <div className="flex items-center gap-3 min-w-max">
          {chain.map((block, idx) => {
            const isValid = blockValidity[idx];
            const isGenesis = block.isGenesis;

            return (
              <React.Fragment key={block.index}>
                {/* Block Card */}
                <div
                  onClick={() => setSelectedBlock(block)}
                  className={`w-72 p-4 rounded-lg cursor-pointer transition-all border ${
                    !isValid
                      ? 'bg-rose-950/50 border-rose-500 hover:border-rose-400 shadow-md'
                      : isGenesis
                      ? 'bg-slate-950 border-amber-500/40 hover:border-amber-400'
                      : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-xs font-mono flex items-center gap-1.5">
                      <span>Block #{block.index}</span>
                      {isGenesis && (
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-sans font-semibold">
                          Genesis
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-[10px] flex items-center gap-1 font-mono ${
                        isValid ? 'text-emerald-400' : 'text-rose-400 font-bold'
                      }`}
                    >
                      {isValid ? (
                        <>
                          <ShieldCheck className="w-3 h-3" />
                          <span>Valid</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          <span>Broken</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Header metadata */}
                  <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500 block text-[9px]">BLOCK HASH</span>
                      <span className="text-slate-200 truncate block font-bold">
                        {block.hash.slice(0, 16)}...{block.hash.slice(-6)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[9px]">PREVIOUS HASH</span>
                      <span className="text-slate-400 truncate block">
                        {block.previousHash.slice(0, 16)}...
                      </span>
                    </div>

                    <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span>Nonce: <strong className="text-amber-400">{block.nonce.toLocaleString()}</strong></span>
                      <span>TXs: <strong className="text-white">{block.transactions.length}</strong></span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMerkleModal(block);
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <GitBranch className="w-3 h-3" />
                      <span>Merkle Tree</span>
                    </button>

                    {!isGenesis && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTamperingBlockIndex(block.index);
                        }}
                        className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                        title="Simulate modifying a past transaction to observe chain failure"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>Tamper TX</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Directional Cryptographic Pointer Arrow */}
                {idx < chain.length - 1 && (
                  <div className="flex flex-col items-center justify-center px-1 text-slate-600">
                    <div className="text-[9px] font-mono text-slate-500 mb-0.5">prev_hash</div>
                    <ArrowRight className="w-5 h-5 text-amber-500/70" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Tamper Modal / Drawer */}
      {tamperingBlockIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-5 text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Tamper Experiment: Block #{tamperingBlockIndex}</span>
              </span>
              <button
                onClick={() => setTamperingBlockIndex(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 mb-3 leading-relaxed">
              In this experiment, you act as a malicious node modifying a past confirmed transaction amount in Block #{tamperingBlockIndex}. Notice how altering history breaks the Merkle tree and the entire hash chain downstream.
            </p>

            <div className="mb-4">
              <label className="block text-slate-400 mb-1">Set Fraudulent Amount (BTC):</label>
              <input
                type="number"
                value={tamperAmount}
                onChange={(e) => setTamperAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded font-mono text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setTamperingBlockIndex(null)}
                className="px-3 py-1.5 text-slate-300 bg-slate-800 hover:bg-slate-750 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onTamperBlock(tamperingBlockIndex, 0, tamperAmount);
                  setTamperingBlockIndex(null);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded text-xs flex items-center gap-1.5"
              >
                <span>Execute Tamper Attack</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Details Modal */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full p-6 text-xs text-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="font-bold text-white text-base font-mono">
                  Block #{selectedBlock.index} Inspection
                </span>
                <span className="text-slate-400 block text-xs">
                  Mined {new Date(selectedBlock.timestamp).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Block Header Structure */}
            <div className="space-y-2.5 font-mono text-xs mb-5">
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">BLOCK HASH (SHA-256)</span>
                <span className="text-amber-400 font-bold break-all select-all">
                  {selectedBlock.hash}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">PREVIOUS HASH</span>
                  <span className="text-slate-300 break-all select-all">
                    {selectedBlock.previousHash}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">MERKLE ROOT</span>
                  <span className="text-sky-400 break-all select-all">
                    {selectedBlock.merkleRoot}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px]">NONCE</span>
                  <span className="text-white font-bold">{selectedBlock.nonce.toLocaleString()}</span>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px]">DIFFICULTY</span>
                  <span className="text-white font-bold">{selectedBlock.difficulty} Zeroes</span>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px]">TRANSACTIONS</span>
                  <span className="text-white font-bold">{selectedBlock.transactions.length}</span>
                </div>
              </div>
            </div>

            {/* Transactions in block */}
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Confirmed Transactions in Block</span>
            </h3>

            <div className="space-y-2">
              {selectedBlock.transactions.map((tx, i) => (
                <div
                  key={tx.id + i}
                  className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono"
                >
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                    <span>TX #{i + 1} {tx.isCoinbase && '(COINBASE SUBSIDY)'}</span>
                    <span className="text-emerald-400 font-bold">{tx.amount.toFixed(4)} BTC</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mb-1">
                    TXID: {tx.id}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-300">
                    <span className="truncate max-w-[180px]">{tx.senderAddress}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="truncate max-w-[180px]">{tx.recipientAddress}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Merkle Tree Modal */}
      {showMerkleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-3xl w-full p-6 text-xs text-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-white text-base font-mono">
                  Merkle Tree Hierarchy (Block #{showMerkleModal.index})
                </span>
              </div>
              <button
                onClick={() => setShowMerkleModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-300 mb-4 leading-relaxed text-xs">
              Bitcoin aggregates all transactions in a block into a binary Merkle Tree. Pairs of hashes are concatenated and hashed with double-SHA256 until a single Merkle Root is obtained. This root is committed into the block header.
            </p>

            {/* Tree rendering */}
            {(() => {
              const txIds = showMerkleModal.transactions.map((tx) => tx.id);
              const merkle = buildMerkleTree(txIds);

              return (
                <div className="space-y-4 font-mono text-[11px]">
                  {/* Root */}
                  <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-lg text-center">
                    <span className="text-amber-400 block text-[10px] font-bold">
                      MERKLE ROOT (Level 0 - Block Header Anchor)
                    </span>
                    <span className="text-white font-bold select-all break-all">
                      {merkle.root}
                    </span>
                  </div>

                  {/* Levels */}
                  {merkle.levels.length > 1 && (
                    <div className="space-y-3">
                      {merkle.levels.map((level, lvlIdx) => (
                        <div key={lvlIdx} className="space-y-1">
                          <span className="text-[10px] text-slate-500 block">
                            {lvlIdx === merkle.levels.length - 1
                              ? 'Leaves (Individual Transaction Hashes):'
                              : `Intermediate Hash Level ${merkle.levels.length - 1 - lvlIdx}:`}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {level.map((h, itemIdx) => (
                              <div
                                key={itemIdx}
                                className="p-2 bg-slate-950 rounded border border-slate-800 text-[10px] truncate"
                                title={h}
                              >
                                <span className="text-slate-500">Node {itemIdx}:</span>{' '}
                                <span className="text-slate-300">{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
