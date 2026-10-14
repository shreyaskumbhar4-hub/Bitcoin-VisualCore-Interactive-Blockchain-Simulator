/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Wallet, Transaction, Block, P2PNode, NetworkPacket } from './core/types';
import { getInitialWallets, getInitialNodes } from './core/initialState';
import {
  createGenesisBlock,
  validateChain,
  calculateBalances,
  computeBlockHash,
  calculateMerkleRoot,
} from './core/blockchain';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { WalletManager } from './components/WalletManager';
import { TransactionConsole } from './components/TransactionConsole';
import { MempoolQueue } from './components/MempoolQueue';
import { MiningRig } from './components/MiningRig';
import { BlockchainExplorer } from './components/BlockchainExplorer';
import { P2PNetworkSimulator } from './components/P2PNetworkSimulator';
import { StudentLabGuide } from './components/StudentLabGuide';
import { HashLab } from './components/HashLab';
import { ApiExplorer } from './components/ApiExplorer';
import { BlockCreationPipeline } from './components/BlockCreationPipeline';
import { UTXOVisualizer } from './components/UTXOVisualizer';
import { ForkConsensusVisualizer } from './components/ForkConsensusVisualizer';
import { SPVProofLab } from './components/SPVProofLab';
import { serializeTransactionPayload, signTransaction, verifyTransactionSignature } from './core/crypto';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'pipeline' | 'utxo' | 'network' | 'spv' | 'labs' | 'hashlab' | 'api'
  >('dashboard');

  // Wallets
  const [wallets, setWallets] = useState<Wallet[]>(() => getInitialWallets());
  const [selectedWalletId, setSelectedWalletId] = useState<string>('alice');

  // Mempool
  const [mempool, setMempool] = useState<Transaction[]>([]);

  // Blockchain (Genesis block initialized to Satoshi address)
  const [chain, setChain] = useState<Block[]>(() => {
    const initialWallets = getInitialWallets();
    const satoshi = initialWallets.find((w) => w.id === 'satoshi') || initialWallets[0];
    return [createGenesisBlock(satoshi.address)];
  });

  // Mining difficulty
  const [difficulty, setDifficulty] = useState<number>(3);

  // Network Nodes & Gossip packets
  const [nodes, setNodes] = useState<P2PNode[]>(() => getInitialNodes());
  const [packets, setPackets] = useState<NetworkPacket[]>([]);

  // Packet animation loop
  useEffect(() => {
    if (packets.length === 0) return;

    const interval = setInterval(() => {
      setPackets((prev) =>
        prev
          .map((pkt) => ({ ...pkt, progress: pkt.progress + 0.04 }))
          .filter((pkt) => pkt.progress < 1)
      );
    }, 40);

    return () => clearInterval(interval);
  }, [packets.length]);

  // Broadcast packet handler
  const handleBroadcastPacket = (type: 'tx' | 'block', dataId: string, label: string) => {
    const newPackets: NetworkPacket[] = [
      { id: `${Date.now()}-1`, fromNodeId: 'node-alice', toNodeId: 'node-charlie', type, dataId, progress: 0, label },
      { id: `${Date.now()}-2`, fromNodeId: 'node-charlie', toNodeId: 'node-bob', type, dataId, progress: 0, label },
      { id: `${Date.now()}-3`, fromNodeId: 'node-bob', toNodeId: 'node-dave', type, dataId, progress: 0, label },
    ];
    setPackets((prev) => [...prev, ...newPackets]);
  };

  // Add Transaction to Mempool
  const handleAddTransaction = (tx: Transaction) => {
    setMempool((prev) => [tx, ...prev]);

    // Deduct pending balance for sender display
    setWallets((prev) =>
      prev.map((w) =>
        w.address === tx.senderAddress
          ? { ...w, balance: Math.max(0, w.balance - (tx.amount + tx.fee)) }
          : w
      )
    );
  };

  // Quick simulate a random peer transaction
  const handleQuickSimulate = () => {
    const sender = wallets.find((w) => w.id === 'alice') || wallets[0];
    const recipient = wallets.find((w) => w.id === 'bob') || wallets[1];
    const amounts = [0.25, 0.5, 1.25, 2.0];
    const fees = [0.0005, 0.001, 0.0025];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const fee = fees[Math.floor(Math.random() * fees.length)];
    const timestamp = Date.now();

    const payload = serializeTransactionPayload(sender.address, recipient.address, amount, fee, timestamp);
    const { signatureHex, txHash } = signTransaction(payload, sender.privateKey);

    const tx: Transaction = {
      id: txHash,
      senderAddress: sender.address,
      senderPublicKey: sender.publicKey,
      recipientAddress: recipient.address,
      amount,
      fee,
      timestamp,
      signature: signatureHex,
      isValid: true,
      validationMessage: 'Verified signature',
      isTampered: false,
    };

    handleAddTransaction(tx);
    handleBroadcastPacket('tx', tx.id, `${amount} BTC peer tx`);
  };

  // When a block is mined
  const handleBlockMined = (newBlock: Block) => {
    setChain((prev) => [...prev, newBlock]);
    setMempool([]); // Clear mined transactions from mempool

    // Update balances from the ledger
    setWallets((prev) => {
      const knownAddrs = prev.map((w) => w.address);
      const newChain = [...chain, newBlock];
      const newBalances = calculateBalances(newChain, knownAddrs);

      return prev.map((w) => ({
        ...w,
        balance: newBalances[w.address] ?? w.balance,
      }));
    });
  };

  // Reset entire simulation to initial Genesis state
  const handleResetSimulation = () => {
    const initialWallets = getInitialWallets();
    const satoshi = initialWallets.find((w) => w.id === 'satoshi') || initialWallets[0];
    setWallets(initialWallets);
    setMempool([]);
    setChain([createGenesisBlock(satoshi.address)]);
    setPackets([]);
  };

  // Tamper attack on historical block
  const handleTamperBlock = (blockIndex: number, txIndex: number, newAmount: number) => {
    setChain((prevChain) => {
      return prevChain.map((block, idx) => {
        if (idx !== blockIndex) return block;

        const updatedTxs = block.transactions.map((tx, tIdx) => {
          if (tIdx !== txIndex) return tx;
          return {
            ...tx,
            amount: newAmount,
            isTampered: true,
          };
        });

        // Recalculate Merkle root of altered block
        const alteredMerkleRoot = calculateMerkleRoot(updatedTxs);
        // Header hash becomes corrupted
        const alteredHash = computeBlockHash(
          block.index,
          block.previousHash,
          alteredMerkleRoot,
          block.timestamp,
          block.difficulty,
          block.nonce
        );

        return {
          ...block,
          transactions: updatedTxs,
          merkleRoot: alteredMerkleRoot,
          hash: alteredHash,
          isTampered: true,
          isValidHash: false,
        };
      });
    });
  };

  // Restore chain integrity after tamper attack
  const handleRestoreChain = () => {
    setChain((prevChain) => {
      return prevChain.map((block) => {
        if (!block.isTampered) return block;

        const restoredTxs = block.transactions.map((tx) => ({
          ...tx,
          amount: tx.isCoinbase ? 3.125 : 1.5,
          isTampered: false,
        }));

        const cleanMerkleRoot = calculateMerkleRoot(restoredTxs);
        // Restore valid hash
        const restoredHash = computeBlockHash(
          block.index,
          block.previousHash,
          cleanMerkleRoot,
          block.timestamp,
          block.difficulty,
          block.nonce
        );

        return {
          ...block,
          transactions: restoredTxs,
          merkleRoot: cleanMerkleRoot,
          hash: restoredHash,
          isTampered: false,
          isValidHash: true,
        };
      });
    });
  };

  // Add newly created user wallet
  const handleAddWallet = (newWallet: Wallet) => {
    setWallets((prev) => [...prev, newWallet]);
  };

  // Calculate circulating Bitcoin supply
  const circulatingBtc = chain.reduce((sum, b) => {
    const coinbase = b.transactions.find((tx) => tx.isCoinbase);
    return sum + (coinbase?.amount || 0);
  }, 0);

  const chainValidation = validateChain(chain);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract (3 zones) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetSimulation={handleResetSimulation}
        chainValid={chainValidation.isValid}
        totalBlocks={chain.length}
      />

      {/* Network Telemetry Stats Bar */}
      <StatsBar
        blockHeight={chain.length - 1}
        mempoolCount={mempool.length}
        difficulty={difficulty}
        circulatingBtc={circulatingBtc}
        activePeers={nodes.length}
        isMining={false}
        hashRate={0}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Quick concept jump bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-medium text-slate-300">Interactive Learning Modules:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('pipeline')}
              className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded transition-colors text-[11px] font-semibold"
            >
              Sender-to-Receiver Pipeline →
            </button>
            <button
              onClick={() => setActiveTab('utxo')}
              className="px-2.5 py-1 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded transition-colors text-[11px] font-semibold"
            >
              UTXO Model & Double-Spend →
            </button>
            <button
              onClick={() => setActiveTab('network')}
              className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded transition-colors text-[11px] font-semibold"
            >
              Forks & Longest Chain →
            </button>
            <button
              onClick={() => setActiveTab('spv')}
              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded transition-colors text-[11px] font-semibold"
            >
              SPV Light Proofs →
            </button>
          </div>
        </div>

        {/* Tab 1: Core Ledger & Mining Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Row: Cryptographic Identity & Transaction Console */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WalletManager
                wallets={wallets}
                selectedWalletId={selectedWalletId}
                onSelectWallet={setSelectedWalletId}
                onAddWallet={handleAddWallet}
              />
              <TransactionConsole
                wallets={wallets}
                selectedWalletId={selectedWalletId}
                onAddTransaction={handleAddTransaction}
                onBroadcastPacket={handleBroadcastPacket}
              />
            </div>

            {/* Middle Row: Live Mempool Queue & Mining Control Room */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <MempoolQueue
                mempool={mempool}
                onClearMempool={() => setMempool([])}
                onQuickSimulate={handleQuickSimulate}
              />
              <MiningRig
                chain={chain}
                mempool={mempool}
                wallets={wallets}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                onBlockMined={handleBlockMined}
                onBroadcastPacket={handleBroadcastPacket}
              />
            </div>

            {/* Bottom Row: Visual Blockchain Explorer */}
            <div>
              <BlockchainExplorer
                chain={chain}
                onTamperBlock={handleTamperBlock}
                onRestoreChain={handleRestoreChain}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Block Creation & Delivery Pipeline */}
        {activeTab === 'pipeline' && (
          <BlockCreationPipeline
            wallets={wallets}
            chain={chain}
            onTriggerMineSample={handleQuickSimulate}
          />
        )}

        {/* Tab 3: UTXO Architecture & Double Spend Defense */}
        {activeTab === 'utxo' && (
          <UTXOVisualizer chain={chain} wallets={wallets} />
        )}

        {/* Tab 4: P2P Network Simulator & Forks */}
        {activeTab === 'network' && (
          <div className="space-y-6">
            <P2PNetworkSimulator
              nodes={nodes}
              packets={packets}
              chainHeight={chain.length - 1}
              mempoolCount={mempool.length}
              onSimulateGossip={(type) => {
                handleBroadcastPacket(type, `manual-${Date.now()}`, `P2P Gossip ${type.toUpperCase()}`);
              }}
            />
            <ForkConsensusVisualizer />
          </div>
        )}

        {/* Tab 5: SPV Merkle Proofs for Light Clients */}
        {activeTab === 'spv' && (
          <SPVProofLab chain={chain} />
        )}

        {/* Tab 6: Student Labs & Whitepaper Curriculum */}
        {activeTab === 'labs' && (
          <StudentLabGuide onNavigateToTab={(tab) => setActiveTab(tab as any)} />
        )}

        {/* Tab 7: SHA-256 Scratchpad */}
        {activeTab === 'hashlab' && (
          <HashLab />
        )}

        {/* Tab 8: REST APIs & Python Backend Reference */}
        {activeTab === 'api' && (
          <ApiExplorer
            chain={chain}
            mempool={mempool}
            onTriggerMine={handleQuickSimulate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>Bitcoin-VisualCore · Educational Architecture Simulator</span>
          <span>SECP256k1 Curve · Double-SHA256 · Nakamoto Consensus</span>
        </div>
      </footer>
    </div>
  );
}
