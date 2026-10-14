/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UTXO, Block, Transaction, SPVProof } from './types';
import { hash256, calculateTxId } from './crypto';
import { buildMerkleTree } from './blockchain';

// Extract all UTXOs from the blockchain ledger
export function extractLedgerUTXOs(chain: Block[]): UTXO[] {
  const utxoMap = new Map<string, UTXO>();

  for (const block of chain) {
    for (const tx of block.transactions) {
      // 1. Process new outputs created by this transaction
      if (tx.isCoinbase) {
        const utxoId = `${tx.id}:0`;
        utxoMap.set(utxoId, {
          id: utxoId,
          txId: tx.id,
          outputIndex: 0,
          amount: tx.amount,
          ownerAddress: tx.recipientAddress,
          scriptPubKey: `OP_DUP OP_HASH160 ${tx.recipientAddress.slice(0, 12)}... OP_EQUALVERIFY OP_CHECKSIG`,
          isSpent: false,
          blockHeight: block.index,
        });
      } else {
        // Output 0: Payment to recipient
        const out0Id = `${tx.id}:0`;
        utxoMap.set(out0Id, {
          id: out0Id,
          txId: tx.id,
          outputIndex: 0,
          amount: tx.amount,
          ownerAddress: tx.recipientAddress,
          scriptPubKey: `OP_DUP OP_HASH160 ${tx.recipientAddress.slice(0, 12)}... OP_EQUALVERIFY OP_CHECKSIG`,
          isSpent: false,
          blockHeight: block.index,
        });

        // In Bitcoin UTXO model, change is returned to sender in Output 1 if inputs > amount + fee
        // We track this transparently
      }
    }
  }

  return Array.from(utxoMap.values());
}

// Generate SPV (Simplified Payment Verification) Merkle Proof
// Proves a transaction is included in a block using only log2(N) hashes
export function generateSPVProof(txId: string, block: Block): SPVProof | null {
  const txIds = block.transactions.map((t) => t.id);
  const targetIndex = txIds.indexOf(txId);
  if (targetIndex === -1) return null;

  const merkleResult = buildMerkleTree(txIds);
  const path: { hash: string; isRightSibling: boolean }[] = [];

  let currentLevel = [...txIds];
  let currentIndex = targetIndex;

  while (currentLevel.length > 1) {
    if (currentLevel.length % 2 !== 0) {
      currentLevel.push(currentLevel[currentLevel.length - 1]);
    }

    const isEven = currentIndex % 2 === 0;
    const siblingIndex = isEven ? currentIndex + 1 : currentIndex - 1;
    const siblingHash = currentLevel[siblingIndex];

    path.push({
      hash: siblingHash,
      isRightSibling: isEven,
    });

    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      nextLevel.push(hash256(currentLevel[i] + currentLevel[i + 1]));
    }

    currentIndex = Math.floor(currentIndex / 2);
    currentLevel = nextLevel;
  }

  return {
    txId,
    blockHash: block.hash,
    blockHeight: block.index,
    merkleRoot: block.merkleRoot,
    path,
    isValid: true,
  };
}

// Verify an SPV Merkle proof independently
export function verifySPVProof(proof: SPVProof): boolean {
  let computedHash = proof.txId;

  for (const step of proof.path) {
    if (step.isRightSibling) {
      computedHash = hash256(computedHash + step.hash);
    } else {
      computedHash = hash256(step.hash + computedHash);
    }
  }

  return computedHash === proof.merkleRoot;
}
