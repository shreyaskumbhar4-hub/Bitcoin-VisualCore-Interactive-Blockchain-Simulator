/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wallet } from '../core/types';
import { generateSecp256k1KeyPair } from '../core/crypto';
import { Copy, Check, Eye, EyeOff, Plus, Key, ArrowRight, Info } from 'lucide-react';

interface WalletManagerProps {
  wallets: Wallet[];
  selectedWalletId: string;
  onSelectWallet: (id: string) => void;
  onAddWallet: (wallet: Wallet) => void;
}

export const WalletManager: React.FC<WalletManagerProps> = ({
  wallets,
  selectedWalletId,
  onSelectWallet,
  onAddWallet,
}) => {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showMathExplainer, setShowMathExplainer] = useState(false);

  const activeWallet = wallets.find((w) => w.id === selectedWalletId) || wallets[0];

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerateNewWallet = () => {
    const pair = generateSecp256k1KeyPair();
    const newCount = wallets.length + 1;
    const newWallet: Wallet = {
      id: `wallet-${Date.now()}`,
      label: `Learner Wallet #${newCount}`,
      privateKey: pair.privateKey,
      publicKey: pair.publicKeyCompressed,
      publicKeyCoordinates: pair.coordinates,
      address: pair.address,
      balance: 10.0, // Initial demonstration faucet balance
    };
    onAddWallet(newWallet);
    onSelectWallet(newWallet.id);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Cryptographic Identity (SECP256k1)
            </h2>
            <p className="text-xs text-slate-400">
              Bitcoin's asymmetric key derivation and address generation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMathExplainer(!showMathExplainer)}
            className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Curve Math</span>
          </button>
          <button
            onClick={handleGenerateNewWallet}
            className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate New Keypair</span>
          </button>
        </div>
      </div>

      {/* Wallet Switcher Tabs */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          Active Identity Profile:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 p-1 bg-slate-950/60 border border-slate-800/80 rounded-md">
          {wallets.map((w) => (
            <button
              key={w.id}
              onClick={() => onSelectWallet(w.id)}
              className={`px-2.5 py-2 text-xs font-medium rounded text-left transition-colors truncate ${
                w.id === activeWallet.id
                  ? 'bg-slate-800 text-amber-400 font-semibold shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="truncate font-semibold">{w.label.split(' ')[0]}</div>
              <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                {w.balance.toFixed(2)} BTC
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Math Explainer Callout */}
      {showMathExplainer && (
        <div className="mb-4 p-4 rounded-md bg-slate-950 border border-amber-500/30 text-xs text-slate-300 space-y-2">
          <div className="font-semibold text-amber-400 flex items-center gap-2">
            <span>SECP256k1 Curve Formula:</span>
            <code className="text-white bg-slate-800 px-2 py-0.5 rounded font-mono">y² = x³ + 7 (mod p)</code>
          </div>
          <p className="text-slate-300 leading-relaxed">
            In Bitcoin, a private key <code className="text-amber-300 font-mono">k</code> is simply a 256-bit scalar integer chosen at random from <code className="font-mono text-slate-400">[1, n-1]</code>.
            By performing scalar point multiplication with the curve generator point <code className="text-amber-300 font-mono">G</code>:
            <span className="block mt-1 font-mono text-emerald-400 bg-slate-900 p-2 rounded border border-slate-800">
              Public Key K = k · G = (x, y)
            </span>
            Because of the Discrete Logarithm Problem (ECDLP) over finite fields, calculating <code className="font-mono text-white">K</code> from <code className="font-mono text-white">k</code> takes milliseconds, but deriving <code className="font-mono text-white">k</code> from <code className="font-mono text-white">K</code> would require more energy than exists in the observable universe.
          </p>
        </div>
      )}

      {/* Key Fields Grid */}
      <div className="space-y-3 font-mono text-xs">
        {/* Private Key */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-rose-400 font-semibold tracking-wide flex items-center gap-1.5">
              <span>● 256-Bit Private Key (Secret)</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="text-slate-400 hover:text-white transition-colors"
                title={showPrivateKey ? 'Hide Private Key' : 'Reveal Private Key'}
              >
                {showPrivateKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleCopy(activeWallet.privateKey, 'priv')}
                className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
                title="Copy Private Key"
              >
                {copiedField === 'priv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px]">Copy</span>
              </button>
            </div>
          </div>
          <div className="text-slate-200 break-all select-all font-mono py-1">
            {showPrivateKey ? activeWallet.privateKey : '•'.repeat(64)}
          </div>
          <div className="text-[10px] text-slate-500 font-sans mt-0.5">
            Never share this in production. Used by ECDSA to digitally sign outgoing transactions.
          </div>
        </div>

        {/* Public Key Point & Compressed Format */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sky-400 font-semibold tracking-wide">
              Public Key Point (K = k · G)
            </span>
            <button
              onClick={() => handleCopy(activeWallet.publicKey, 'pub')}
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              {copiedField === 'pub' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px]">Copy</span>
            </button>
          </div>
          <div className="text-slate-200 break-all select-all font-mono py-1">
            {activeWallet.publicKey}
          </div>
          {activeWallet.publicKeyCoordinates && (
            <div className="mt-1 pt-1 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-400">
              <div className="truncate">
                <span className="text-slate-500">X:</span> {activeWallet.publicKeyCoordinates.x}
              </div>
              <div className="truncate">
                <span className="text-slate-500">Y:</span> {activeWallet.publicKeyCoordinates.y}
              </div>
            </div>
          )}
        </div>

        {/* Derived Bitcoin Address */}
        <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-amber-400 font-semibold tracking-wide">
              Bitcoin Wallet Address (Base58Check P2PKH)
            </span>
            <div className="flex items-center gap-3">
              <span className="text-slate-300 font-semibold">
                {activeWallet.balance.toFixed(4)} BTC
              </span>
              <button
                onClick={() => handleCopy(activeWallet.address, 'addr')}
                className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                {copiedField === 'addr' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px]">Copy Address</span>
              </button>
            </div>
          </div>
          <div className="text-amber-200 text-sm font-bold break-all select-all py-1">
            {activeWallet.address}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-sans mt-1">
            <span>Derivation steps:</span>
            <span className="text-slate-300">Public Key</span>
            <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
            <span className="text-slate-300">SHA-256</span>
            <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
            <span className="text-slate-300">RIPEMD-160</span>
            <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
            <span className="text-slate-300">Base58Check</span>
          </div>
        </div>
      </div>
    </div>
  );
};
