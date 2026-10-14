/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wallet, Transaction } from '../core/types';
import {
  serializeTransactionPayload,
  calculateTxId,
  signTransaction,
  verifyTransactionSignature,
} from '../core/crypto';
import { Send, AlertOctagon, CheckCircle2, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';

interface TransactionConsoleProps {
  wallets: Wallet[];
  selectedWalletId: string;
  onAddTransaction: (tx: Transaction) => void;
  onBroadcastPacket?: (type: 'tx', dataId: string, label: string) => void;
}

export const TransactionConsole: React.FC<TransactionConsoleProps> = ({
  wallets,
  selectedWalletId,
  onAddTransaction,
  onBroadcastPacket,
}) => {
  const senderWallet = wallets.find((w) => w.id === selectedWalletId) || wallets[0];
  const otherWallets = wallets.filter((w) => w.id !== senderWallet.id);

  const [recipientId, setRecipientId] = useState<string>(otherWallets[0]?.id || '');
  const [customRecipient, setCustomRecipient] = useState<string>('');
  const [amount, setAmount] = useState<number>(1.5);
  const [fee, setFee] = useState<number>(0.001);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronize recipient when sender changes
  React.useEffect(() => {
    if (recipientId === senderWallet.id || !otherWallets.some((w) => w.id === recipientId)) {
      if (otherWallets.length > 0) {
        setRecipientId(otherWallets[0].id);
      }
    }
  }, [senderWallet.id, wallets]);

  // Fraud / Attack simulation states
  const [tamperAlert, setTamperAlert] = useState<{
    show: boolean;
    tx?: Transaction;
    reason?: string;
  } | null>(null);

  const [lastSuccessTx, setLastSuccessTx] = useState<Transaction | null>(null);

  const recipientWallet = wallets.find((w) => w.id === recipientId) || otherWallets[0];
  const recipientAddress = customRecipient.trim() || recipientWallet?.address || '1BitcoinRecipientAddressExample';

  // Honest workflow: sign and broadcast valid transaction
  const handleSignAndSend = () => {
    setTamperAlert(null);
    setLastSuccessTx(null);
    setErrorMessage(null);

    try {
      const timestamp = Date.now();
      const payload = serializeTransactionPayload(
        senderWallet.address,
        recipientAddress,
        amount,
        fee,
        timestamp
      );

      // Step 1: Sender signs hash with their private key
      const { signatureHex, txHash } = signTransaction(payload, senderWallet.privateKey);

      // Step 2: Verification check (performed by network nodes)
      const verification = verifyTransactionSignature(payload, signatureHex, senderWallet.publicKey);

      const newTx: Transaction = {
        id: txHash,
        senderAddress: senderWallet.address,
        senderPublicKey: senderWallet.publicKey,
        recipientAddress,
        amount,
        fee,
        timestamp,
        signature: signatureHex,
        isValid: verification.isValid,
        validationMessage: 'Verified: ECDSA signature matches sender public key',
        isTampered: false,
      };

      if (verification.isValid) {
        onAddTransaction(newTx);
        setLastSuccessTx(newTx);
        if (onBroadcastPacket) {
          onBroadcastPacket('tx', newTx.id, `${amount} BTC from ${senderWallet.label.split(' ')[0]}`);
        }
      } else {
        setErrorMessage(verification.reason || 'Cryptographic signature verification failed.');
      }
    } catch (err) {
      console.error('Error during transaction signing:', err);
      setErrorMessage(`Failed to sign transaction: ${(err as Error).message}`);
    }
  };

  // Malicious workflow: The Fraud Demo Button
  // Deliberately alters the payload after signing to demonstrate signature invalidation
  const handleFraudDemo = () => {
    setLastSuccessTx(null);
    const timestamp = Date.now();

    // 1. Legitimate signing for 1.00 BTC
    const originalAmount = amount;
    const honestPayload = serializeTransactionPayload(
      senderWallet.address,
      recipientAddress,
      originalAmount,
      fee,
      timestamp
    );
    const { signatureHex } = signTransaction(honestPayload, senderWallet.privateKey);
    const originalHash = calculateTxId(honestPayload);

    // 2. Middleman / Attacker alters the amount to 999.00 BTC
    const tamperedAmount = Number((originalAmount * 10 + 50).toFixed(2));
    const tamperedPayload = serializeTransactionPayload(
      senderWallet.address,
      recipientAddress,
      tamperedAmount,
      fee,
      timestamp
    );
    const tamperedHash = calculateTxId(tamperedPayload);

    // 3. Network node verification against the tampered payload
    const verification = verifyTransactionSignature(
      tamperedPayload,
      signatureHex, // Using original signature on tampered payload!
      senderWallet.publicKey
    );

    const fraudulentTx: Transaction = {
      id: tamperedHash,
      senderAddress: senderWallet.address,
      senderPublicKey: senderWallet.publicKey,
      recipientAddress,
      amount: tamperedAmount,
      fee,
      timestamp,
      signature: signatureHex,
      isValid: false,
      validationMessage: 'CRITICAL: Digital signature verification failed! Payload was modified in-flight.',
      isTampered: true,
      originalPayloadHash: originalHash,
      currentPayloadHash: tamperedHash,
    };

    // Trigger UI flash and blocked transaction banner
    setTamperAlert({
      show: true,
      tx: fraudulentTx,
      reason: `Signature failed verification! Attacker attempted to alter transfer amount from ${originalAmount} BTC to ${tamperedAmount} BTC.`,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Transaction Signing & Verification
            </h2>
            <p className="text-xs text-slate-400">
              ECDSA digital signature mechanism & anti-tamper security
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Sender details */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Sender Wallet (Signs with ECDSA Private Key):
          </label>
          <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-md flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-white">{senderWallet.label}</span>
              <div className="text-[11px] text-slate-500 font-mono truncate max-w-[280px]">
                {senderWallet.address}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Available Balance</span>
              <span className="text-amber-400 font-mono font-semibold">
                {senderWallet.balance.toFixed(4)} BTC
              </span>
            </div>
          </div>
        </div>

        {/* Recipient selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Select Recipient:
            </label>
            <select
              value={recipientId}
              onChange={(e) => {
                setRecipientId(e.target.value);
                setCustomRecipient('');
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {otherWallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label} ({w.balance.toFixed(2)} BTC)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Amount (BTC):
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.001"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(Math.max(0.0001, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-mono">
                {(amount * 100_000_000).toLocaleString()} Sats
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px]">
              <span className="text-slate-500">Presets:</span>
              {[0.5, 1.0, 2.5, 5.0].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                >
                  {preset} BTC
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Miner Fee Slider */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 font-medium">Miner Transaction Fee:</span>
            <span className="text-amber-400 font-mono">
              {fee.toFixed(4)} BTC ({(fee * 100_000_000).toLocaleString()} sats)
            </span>
          </div>
          <input
            type="range"
            min="0.0001"
            max="0.01"
            step="0.0001"
            value={fee}
            onChange={(e) => setFee(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
            <span>Low Priority (0.0001 BTC)</span>
            <span>Standard (0.001 BTC)</span>
            <span>Fast Miner Priority (0.01 BTC)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleSignAndSend}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Sign & Send to Mempool</span>
          </button>

          <button
            onClick={handleFraudDemo}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            title="Demonstrate how modifying transaction values causes signature verification failure"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Tamper Transaction (Fraud Demo)</span>
          </button>
        </div>

        {/* Error Message Banner */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-md text-xs text-rose-200 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Banner */}
        {lastSuccessTx && !tamperAlert && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-md text-xs text-emerald-200">
            <div className="flex items-center gap-2 font-semibold text-emerald-300 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Valid Digital Signature Verified! Broadcasted to Mempool</span>
            </div>
            <div className="font-mono text-[11px] text-slate-300 break-all">
              <span className="text-slate-500">TXID:</span> {lastSuccessTx.id}
            </div>
          </div>
        )}

        {/* CRITICAL FRAUD BANNER (Explicit Requirement) */}
        {tamperAlert && (
          <div className="p-4 bg-rose-950/80 border-2 border-rose-500 rounded-md text-xs text-rose-100 animate-pulse transition-all">
            <div className="flex items-center gap-2 font-bold text-rose-300 text-sm mb-2">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <span>[CRITICAL: Invalid Digital Signature - Transaction Blocked]</span>
            </div>
            <p className="text-rose-200 text-xs mb-3 leading-relaxed">
              {tamperAlert.reason}
            </p>
            <div className="p-2.5 bg-black/60 rounded border border-rose-900 font-mono text-[11px] space-y-1.5">
              <div className="text-slate-400">
                <span className="text-rose-400 font-semibold">Original Signed Hash:</span>{' '}
                {tamperAlert.tx?.originalPayloadHash?.slice(0, 24)}...
              </div>
              <div className="text-slate-400">
                <span className="text-rose-400 font-semibold">Altered Payload Hash:</span>{' '}
                {tamperAlert.tx?.currentPayloadHash?.slice(0, 24)}...
              </div>
              <div className="text-rose-300 text-[10px] font-sans pt-1 border-t border-rose-900/60">
                Lesson for Students: Because digital signatures bind mathematically to the hash of the original data, modifying even 1 Satoshi creates a completely different SHA-256 hash that fails ECDSA verification. No middleman can alter your Bitcoin payment!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
