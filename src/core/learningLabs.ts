/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LearningModule } from './types';

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'crypto-identity',
    title: '1. Cryptographic Identity & SECP256k1',
    whitepaperSection: 'Section 2: Transactions',
    whitepaperExcerpt:
      'We define an electronic coin as a chain of digital signatures. Each owner transfers the coin to the next by digitally signing a hash of the previous transaction and the public key of the next owner...',
    explanation:
      'Bitcoin uses asymmetric cryptography. Your Private Key (a secret 256-bit number) is mathematically mapped via elliptic curve scalar multiplication (K = k · G) onto the SECP256k1 curve (y² = x³ + 7 mod p). The resulting coordinate (x, y) is your Public Key. Hashing this public key with SHA-256 and RIPEMD-160 yields your public Bitcoin Address.',
    interactiveChallenge: {
      instruction:
        'Open the Wallets panel, generate a new cryptographic keypair, and compare the 256-bit private key to the derived public key coordinates.',
      actionLabel: 'Go to Wallet Generator',
      targetTab: 'wallets',
    },
  },
  {
    id: 'digital-signatures',
    title: '2. ECDSA Signatures & Fraud Protection',
    whitepaperSection: 'Section 2: Transactions',
    whitepaperExcerpt:
      'A payee can verify the signatures to verify the chain of ownership. What is needed is a way to ensure that previous owners did not sign earlier transactions...',
    explanation:
      'When you send Bitcoin, you create a cryptographic signature (r, s) over the exact transaction parameters. Anyone in the world can verify this signature using your public key without ever discovering your private key. If a dishonest actor or middleman alters the recipient or amount by even a single Satoshi, the signature verification equation fails instantly.',
    interactiveChallenge: {
      instruction:
        'Create a transaction, click "Tamper Transaction (Fraud Demo)", and observe how the cryptographic verification engine flags and blocks the forgery.',
      actionLabel: 'Test Digital Signature Fraud',
      targetTab: 'mempool',
    },
  },
  {
    id: 'mempool-fees',
    title: '3. The Mempool & Fee Incentives',
    whitepaperSection: 'Section 6: Incentive',
    whitepaperExcerpt:
      'The incentive can also be funded with transaction fees. If the output value of a transaction is less than its input value, the difference is a transaction fee that is added to the incentive value of the block containing the transaction.',
    explanation:
      'Before transactions are written into blocks, they sit in the Mempool (Memory Pool) of every full node. Because block space is scarce (limited capacity), miners prioritize transactions offering higher transaction fees (sat/vB) to maximize their block reward.',
    interactiveChallenge: {
      instruction:
        'Create multiple pending transactions with different fee rates, then observe how the mempool prioritizes transactions for the next block candidate.',
      actionLabel: 'Explore Mempool Queue',
      targetTab: 'mempool',
    },
  },
  {
    id: 'proof-of-work',
    title: '4. Proof of Work & Mining Puzzle',
    whitepaperSection: 'Section 4: Proof-of-Work',
    whitepaperExcerpt:
      'To implement a distributed timestamp server on a peer-to-peer basis, we will need to use a proof-of-work system similar to Adam Back\'s Hashcash... The proof-of-work involves scanning for a value that when hashed, such as with SHA-256, the hash begins with a number of zero bits.',
    explanation:
      'SHA-256 is a one-way mathematical function. There is no shortcut to finding a hash starting with N leading zeros; miners must blindly test millions of "nonce" numbers. This computational expenditure creates an unforgeable cost, ensuring history cannot be altered without expending equivalent compute power.',
    interactiveChallenge: {
      instruction:
        'Switch to the Mining Rig. Try the "Step 1 Nonce" button to see the Avalanche Effect, then hit "Start Mining Rig" to solve a real proof-of-work block.',
      actionLabel: 'Open Mining Control Room',
      targetTab: 'mining',
    },
  },
  {
    id: 'merkle-trees',
    title: '5. Merkle Trees & Block Integrity',
    whitepaperSection: 'Section 7: Reclaiming Disk Space',
    whitepaperExcerpt:
      'Transactions are hashed in a Merkle Tree, with only the root included in the block\'s hash. Old blocks can then be compacted by stubbing off branches of the tree.',
    explanation:
      'A Merkle Tree is a binary cryptographic tree where every parent node is the hash of its two child hashes. The top hash (Merkle Root) summarizes all transactions in the block. If any transaction is modified, its hash changes, propagating up the tree and breaking the root.',
    interactiveChallenge: {
      instruction:
        'Inspect any block in the Blockchain Explorer and click "View Merkle Tree" to examine the hierarchical hash tree and proof paths.',
      actionLabel: 'View Blockchain Explorer',
      targetTab: 'explorer',
    },
  },
  {
    id: 'chain-immutability',
    title: '6. The Chain of Hashes & 51% Immutability',
    whitepaperSection: 'Section 1: Introduction',
    whitepaperExcerpt:
      'The system is secure as long as honest nodes collectively control more CPU power than any cooperating group of attacker nodes.',
    explanation:
      'Each block header contains the SHA-256 hash of the previous block header ("Previous Hash"). This links all blocks into an unbroken chain. If an attacker alters transaction data in Block #1, its hash changes, breaking Block #2\'s link, Block #3\'s link, and so on. The attacker would have to re-mine all subsequent blocks faster than the entire honest network.',
    interactiveChallenge: {
      instruction:
        'In the Blockchain Explorer, trigger the "Tamper Block History" experiment to see the entire downstream chain break with cryptographic errors.',
      actionLabel: 'Launch Immutability Test',
      targetTab: 'explorer',
    },
  },
  {
    id: 'p2p-gossip',
    title: '7. P2P Gossip Protocol & Consensus',
    whitepaperSection: 'Section 5: Network',
    whitepaperExcerpt:
      'The steps to run the network are as follows: 1) New transactions are broadcast to all nodes. 2) Each node collects new transactions into a block. 3) Each node works on finding a difficult proof-of-work for its block. 4) When a node finds a proof-of-work, it broadcasts the block to all nodes. 5) Nodes accept the block only if all transactions in it are valid...',
    explanation:
      'Bitcoin has no central server or bank. Nodes communicate over a peer-to-peer gossip protocol. When Alice announces a transaction or Charlie mines a block, the message floods through neighbor connections until the entire global network achieves consensus on the longest valid chain.',
    interactiveChallenge: {
      instruction:
        'Open the P2P Network Simulator to view nodes propagating transactions and newly mined blocks across the peer topology.',
      actionLabel: 'View P2P Network',
      targetTab: 'network',
    },
  },
];
