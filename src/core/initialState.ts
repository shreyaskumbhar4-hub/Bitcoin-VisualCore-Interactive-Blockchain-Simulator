/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Wallet, P2PNode } from './types';
import { generateSecp256k1KeyPair } from './crypto';

// Fixed private keys for predictable educational demos
const INITIAL_KEYS = [
  {
    id: 'satoshi',
    label: 'Satoshi Nakamoto (Genesis Miner)',
    privKeyHex: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    initialBalance: 50.0,
  },
  {
    id: 'alice',
    label: 'Alice (Full Node User)',
    privKeyHex: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    initialBalance: 25.0,
  },
  {
    id: 'bob',
    label: 'Bob (Coffee Merchant)',
    privKeyHex: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    initialBalance: 5.0,
  },
  {
    id: 'charlie',
    label: 'Charlie (Mining Pool)',
    privKeyHex: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    initialBalance: 12.5,
  },
  {
    id: 'eve',
    label: 'Eve (Malicious Actor / Tamperer)',
    privKeyHex: '5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    initialBalance: 0.0,
  },
];

export function getInitialWallets(): Wallet[] {
  return INITIAL_KEYS.map((k) => {
    const pair = generateSecp256k1KeyPair(k.privKeyHex);
    return {
      id: k.id,
      label: k.label,
      privateKey: pair.privateKey,
      publicKey: pair.publicKeyCompressed,
      publicKeyCoordinates: pair.coordinates,
      address: pair.address,
      balance: k.initialBalance,
    };
  });
}

export function getInitialNodes(): P2PNode[] {
  return [
    {
      id: 'node-alice',
      name: 'Node Alpha (Alice)',
      type: 'full',
      location: 'North America (Oregon)',
      x: 160,
      y: 130,
      peers: ['node-charlie', 'node-bob'],
      mempoolCount: 0,
      chainHeight: 1,
      status: 'synced',
    },
    {
      id: 'node-charlie',
      name: 'Node Beta (Charlie ASIC Miner)',
      type: 'miner',
      location: 'Europe (Iceland)',
      x: 400,
      y: 80,
      peers: ['node-alice', 'node-bob', 'node-dave'],
      mempoolCount: 0,
      chainHeight: 1,
      status: 'mining',
    },
    {
      id: 'node-bob',
      name: 'Node Gamma (Bob Merchant)',
      type: 'full',
      location: 'Asia (Tokyo)',
      x: 640,
      y: 130,
      peers: ['node-alice', 'node-charlie', 'node-dave'],
      mempoolCount: 0,
      chainHeight: 1,
      status: 'synced',
    },
    {
      id: 'node-dave',
      name: 'Node Delta (Dave Mobile SPV)',
      type: 'light',
      location: 'South America (São Paulo)',
      x: 400,
      y: 290,
      peers: ['node-charlie', 'node-bob'],
      mempoolCount: 0,
      chainHeight: 1,
      status: 'synced',
    },
  ];
}
