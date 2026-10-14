/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Block,
  Transaction,
  MerkleNode,
} from './types';
import {
  hash256,
  calculateTxId,
  serializeTransactionPayload,
  verifyTransactionSignature,
} from './crypto';

// Format block header for hashing
export function serializeBlockHeader(
  index: number,
  previousHash: string,
  merkleRoot: string,
  timestamp: number,
  difficulty: number,
  nonce: number
): string {
  return `${index}|${previousHash}|${merkleRoot}|${timestamp}|${difficulty}|${nonce}`;
}

// Compute block hash using Bitcoin's double-SHA256
export function computeBlockHash(
  index: number,
  previousHash: string,
  merkleRoot: string,
  timestamp: number,
  difficulty: number,
  nonce: number
): string {
  const header = serializeBlockHeader(index, previousHash, merkleRoot, timestamp, difficulty, nonce);
  return hash256(header);
}

// Check if a hash satisfies the difficulty target (leading zeros)
export function isValidProofOfWork(hash: string, difficulty: number): boolean {
  const targetPrefix = '0'.repeat(difficulty);
  return hash.startsWith(targetPrefix);
}

// Merkle Tree computation with full tree node structure for visualization
export interface MerkleResult {
  root: string;
  tree: MerkleNode;
  levels: string[][];
}

export function buildMerkleTree(txIds: string[]): MerkleResult {
  if (txIds.length === 0) {
    const emptyHash = hash256('EMPTY_BLOCK');
    return {
      root: emptyHash,
      tree: { hash: emptyHash },
      levels: [[emptyHash]],
    };
  }

  const levels: string[][] = [];
  let currentLevel = [...txIds];
  levels.push([...currentLevel]);

  let currentNodes: MerkleNode[] = currentLevel.map((txId) => ({
    hash: txId,
    txId,
  }));

  while (currentLevel.length > 1) {
    // If odd number of elements, duplicate last element (Bitcoin standard)
    if (currentLevel.length % 2 !== 0) {
      currentLevel.push(currentLevel[currentLevel.length - 1]);
      currentNodes.push({ ...currentNodes[currentNodes.length - 1] });
    }

    const nextLevel: string[] = [];
    const nextNodes: MerkleNode[] = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const combined = currentLevel[i] + currentLevel[i + 1];
      const parentHash = hash256(combined);
      nextLevel.push(parentHash);

      nextNodes.push({
        hash: parentHash,
        left: currentNodes[i],
        right: currentNodes[i + 1],
      });
    }

    levels.push(nextLevel);
    currentLevel = nextLevel;
    currentNodes = nextNodes;
  }

  return {
    root: currentLevel[0],
    tree: currentNodes[0],
    levels,
  };
}

// Calculate Merkle root of transaction list
export function calculateMerkleRoot(transactions: Transaction[]): string {
  const txIds = transactions.map((tx) => tx.id);
  return buildMerkleTree(txIds).root;
}

// Generate the Bitcoin Genesis Block
export function createGenesisBlock(satoshiAddress: string): Block {
  const genesisTimestamp = 1231006505000; // Jan 3, 2009
  const previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
  const difficulty = 3;

  // Satoshi's Genesis Coinbase Transaction
  const coinbasePayload = serializeTransactionPayload(
    'COINBASE',
    satoshiAddress,
    50.0,
    0,
    genesisTimestamp
  );
  const genesisTxId = calculateTxId(coinbasePayload + '|The Times 03/Jan/2009 Chancellor on brink of second bailout for banks');

  const genesisTx: Transaction = {
    id: genesisTxId,
    senderAddress: 'COINBASE (System Mint)',
    senderPublicKey: '00'.repeat(33),
    recipientAddress: satoshiAddress,
    amount: 50.0,
    fee: 0,
    timestamp: genesisTimestamp,
    signature: 'GENESIS_COINBASE_PROOF_OF_WORK',
    isValid: true,
    validationMessage: 'Genesis Mint: "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"',
    isCoinbase: true,
  };

  const merkleRoot = calculateMerkleRoot([genesisTx]);

  // Find a valid nonce for Genesis difficulty 3
  let nonce = 0;
  let blockHash = '';
  while (true) {
    blockHash = computeBlockHash(0, previousHash, merkleRoot, genesisTimestamp, difficulty, nonce);
    if (isValidProofOfWork(blockHash, difficulty)) {
      break;
    }
    nonce++;
  }

  return {
    index: 0,
    timestamp: genesisTimestamp,
    previousHash,
    merkleRoot,
    transactions: [genesisTx],
    nonce,
    difficulty,
    hash: blockHash,
    minedBy: satoshiAddress,
    reward: 50.0,
    feesCollected: 0,
    isGenesis: true,
    isTampered: false,
    isValidHash: true,
  };
}

// Create a Coinbase Transaction (mining reward + collected fees)
export function createCoinbaseTransaction(
  minerAddress: string,
  reward: number,
  feesCollected: number,
  blockHeight: number
): Transaction {
  const timestamp = Date.now();
  const payload = serializeTransactionPayload(
    'COINBASE',
    minerAddress,
    reward + feesCollected,
    0,
    timestamp
  );
  const id = calculateTxId(payload + `|BLOCK_${blockHeight}`);

  return {
    id,
    senderAddress: 'COINBASE (Mint)',
    senderPublicKey: '00'.repeat(33),
    recipientAddress: minerAddress,
    amount: Number((reward + feesCollected).toFixed(8)),
    fee: 0,
    timestamp,
    signature: `COINBASE_MINT_BLOCK_${blockHeight}`,
    isValid: true,
    validationMessage: `Minted ${reward} BTC block subsidy + ${feesCollected.toFixed(4)} BTC fees`,
    isCoinbase: true,
  };
}

// Validate individual block integrity
export function validateBlock(block: Block, prevBlock?: Block): { isValid: boolean; error?: string } {
  // Check previous hash link
  if (prevBlock && block.previousHash !== prevBlock.hash) {
    return {
      isValid: false,
      error: `Previous hash mismatch: expected ${prevBlock.hash.slice(0, 10)}... but got ${block.previousHash.slice(0, 10)}...`,
    };
  }

  // Check Merkle Root
  const calculatedRoot = calculateMerkleRoot(block.transactions);
  if (calculatedRoot !== block.merkleRoot) {
    return {
      isValid: false,
      error: `Merkle root mismatch! Calculated ${calculatedRoot.slice(0, 10)}... vs Block Header ${block.merkleRoot.slice(0, 10)}...`,
    };
  }

  // Check Proof of Work target
  const targetPrefix = '0'.repeat(block.difficulty);
  if (!block.hash.startsWith(targetPrefix)) {
    return {
      isValid: false,
      error: `Proof of Work violated: hash ${block.hash} does not satisfy target difficulty ${block.difficulty}`,
    };
  }

  // Check double-SHA256 hash recalculation
  const recomputedHash = computeBlockHash(
    block.index,
    block.previousHash,
    block.merkleRoot,
    block.timestamp,
    block.difficulty,
    block.nonce
  );
  if (recomputedHash !== block.hash) {
    return {
      isValid: false,
      error: `Header hash mismatch: recalculation yields ${recomputedHash.slice(0, 12)}...`,
    };
  }

  return { isValid: true };
}

// Validate entire blockchain from Genesis to Tip
export function validateChain(chain: Block[]): {
  isValid: boolean;
  firstInvalidIndex: number | null;
  errors: Record<number, string>;
} {
  const errors: Record<number, string> = {};

  for (let i = 0; i < chain.length; i++) {
    const current = chain[i];
    const prev = i > 0 ? chain[i - 1] : undefined;

    const result = validateBlock(current, prev);
    if (!result.isValid) {
      errors[i] = result.error || 'Invalid block';
    }
  }

  const invalidIndices = Object.keys(errors).map(Number);
  return {
    isValid: invalidIndices.length === 0,
    firstInvalidIndex: invalidIndices.length > 0 ? Math.min(...invalidIndices) : null,
    errors,
  };
}

// Helper to calculate total balances from the chain
export function calculateBalances(
  chain: Block[],
  knownAddresses: string[]
): Record<string, number> {
  const balances: Record<string, number> = {};
  knownAddresses.forEach((addr) => {
    balances[addr] = 0;
  });

  for (const block of chain) {
    for (const tx of block.transactions) {
      if (tx.isCoinbase) {
        balances[tx.recipientAddress] = (balances[tx.recipientAddress] || 0) + tx.amount;
      } else {
        if (tx.isValid) {
          balances[tx.senderAddress] = (balances[tx.senderAddress] || 0) - (tx.amount + tx.fee);
          balances[tx.recipientAddress] = (balances[tx.recipientAddress] || 0) + tx.amount;
        }
      }
    }
  }

  return balances;
}
