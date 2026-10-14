/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Wallet {
  id: string;
  label: string;
  privateKey: string; // 64 hex chars (256 bits)
  publicKey: string;  // Hex format (compressed: 66 chars or uncompressed: 130 chars)
  publicKeyCoordinates?: {
    x: string;
    y: string;
  };
  address: string;    // Bitcoin-style address (1... or bc1...)
  balance: number;    // In BTC
}

export interface Transaction {
  id: string;
  senderAddress: string;
  senderPublicKey: string;
  recipientAddress: string;
  amount: number;       // in BTC
  fee: number;          // in BTC
  timestamp: number;
  signature: string;    // ECDSA hex (r || s or DER)
  isValid: boolean;     // Cryptographic signature check
  validationMessage?: string;
  isTampered?: boolean;
  originalPayloadHash?: string;
  currentPayloadHash?: string;
  isCoinbase?: boolean;
}

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  txId?: string;
}

export interface Block {
  index: number;
  timestamp: number;
  previousHash: string;
  merkleRoot: string;
  transactions: Transaction[];
  nonce: number;
  difficulty: number;   // number of required leading zeroes in hex (e.g. 3 => '000...')
  hash: string;
  minedBy?: string;     // miner address
  reward?: number;      // block reward (BTC)
  feesCollected?: number;
  isGenesis?: boolean;
  isTampered?: boolean;
  isValidHash?: boolean;
}

export interface MiningState {
  isMining: boolean;
  currentNonce: number;
  currentHash: string;
  targetPrefix: string;
  hashRate: number;     // Hashes per second
  attempts: number;
  startTime?: number;
}

export interface P2PNode {
  id: string;
  name: string;
  type: 'miner' | 'full' | 'merchant' | 'light';
  location: string;
  x: number; // For visual canvas layout
  y: number;
  peers: string[]; // Connected node IDs
  mempoolCount: number;
  chainHeight: number;
  lastMinedBlockHash?: string;
  status: 'idle' | 'transmitting' | 'verifying' | 'mining' | 'synced';
}

export interface NetworkPacket {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: 'tx' | 'block';
  dataId: string;
  progress: number; // 0 to 1
  label: string;
}

export interface UTXO {
  id: string;             // txid:vout
  txId: string;
  outputIndex: number;
  amount: number;         // in BTC
  ownerAddress: string;   // Address that can spend this output
  scriptPubKey: string;   // OP_DUP OP_HASH160 <PubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
  isSpent: boolean;
  spentInTxId?: string;
  blockHeight?: number;
}

export interface TxInput {
  prevTxId: string;
  outputIndex: number;
  scriptSig?: string;
  amount: number;
}

export interface TxOutput {
  amount: number;
  recipientAddress: string;
  scriptPubKey: string;
}

export type PipelineStageId =
  | 'idle'
  | 'sender_sign'
  | 'mempool_queue'
  | 'miner_package'
  | 'merkle_construct'
  | 'pow_mining'
  | 'chain_link'
  | 'p2p_propagate'
  | 'receiver_confirmed';

export interface PipelineStepInfo {
  id: PipelineStageId;
  title: string;
  shortDesc: string;
  actor: string;
  graphicIcon: string;
}

export interface ForkBlock {
  block: Block;
  branch: 'main' | 'fork';
  cumulativeWork: number;
  isOrphaned: boolean;
}

export interface SPVProof {
  txId: string;
  blockHash: string;
  blockHeight: number;
  merkleRoot: string;
  path: {
    hash: string;
    isRightSibling: boolean;
  }[];
  isValid: boolean;
}

export interface LearningModule {
  id: string;
  title: string;
  whitepaperSection: string;
  whitepaperExcerpt: string;
  explanation: string;
  interactiveChallenge: {
    instruction: string;
    actionLabel: string;
    targetTab: 'wallets' | 'mempool' | 'mining' | 'explorer' | 'network' | 'hashlab';
  };
}

