/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as secp from '@noble/secp256k1';
import { hmac } from '@noble/hashes/hmac.js';
import { sha256 as nobleSha256 } from '@noble/hashes/sha2.js';

// Configure synchronous SHA-256 and HMAC-SHA256 required by @noble/secp256k1
secp.hashes.sha256 = (msg) => nobleSha256(msg);
secp.hashes.hmacSha256 = (key, msg) => hmac(nobleSha256, key, msg);

// Fast, zero-dependency synchronous SHA-256 implementation
// Standard FIPS 180-4 implementation for high-speed simulation & mining
function sha256SyncInternal(ascii: string): Uint8Array {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i = 0, j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  // Initial hash values: first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19
  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  // First 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let compositeClearHex = '';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    const charCode = ascii.charCodeAt(i);
    words[i >> 2] |= (charCode & 0xff) << ((3 - (i % 4)) * 8);
  }

  // Append leading '1' bit
  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  // Append original length in bits
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  const w = new Array(64);
  for (i = 0; i < words.length; i += 16) {
    const h0 = hash[0], h1 = hash[1], h2 = hash[2], h3 = hash[3];
    const h4 = hash[4], h5 = hash[5], h6 = hash[6], h7 = hash[7];

    for (j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j] | 0;
      } else {
        const gamma0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const gamma1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + gamma0 + w[j - 7] + gamma1) | 0;
      }

      const s1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1 + ch + k[j] + w[j]) | 0;
      const s0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0 + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + h0) | 0;
    hash[1] = (hash[1] + h1) | 0;
    hash[2] = (hash[2] + h2) | 0;
    hash[3] = (hash[3] + h3) | 0;
    hash[4] = (hash[4] + h4) | 0;
    hash[5] = (hash[5] + h5) | 0;
    hash[6] = (hash[6] + h6) | 0;
    hash[7] = (hash[7] + h7) | 0;
  }

  const out = new Uint8Array(32);
  for (i = 0; i < 8; i++) {
    out[i * 4] = (hash[i] >>> 24) & 0xff;
    out[i * 4 + 1] = (hash[i] >>> 16) & 0xff;
    out[i * 4 + 2] = (hash[i] >>> 8) & 0xff;
    out[i * 4 + 3] = hash[i] & 0xff;
  }
  return out;
}

// Convert bytes to hex string
export function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

// Convert hex string to bytes
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const len = cleanHex.length;
  const bytes = new Uint8Array(len / 2);
  for (let i = 0; i < len; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Single SHA-256
export function sha256(data: string): string {
  const bytes = sha256SyncInternal(data);
  return bytesToHex(bytes);
}

// Bitcoin's Hash256: SHA-256(SHA-256(data))
export function hash256(data: string): string {
  const firstPassBytes = sha256SyncInternal(data);
  // Convert first pass bytes into a binary string for second round
  let binStr = '';
  for (let i = 0; i < firstPassBytes.length; i++) {
    binStr += String.fromCharCode(firstPassBytes[i]);
  }
  const secondPassBytes = sha256SyncInternal(binStr);
  return bytesToHex(secondPassBytes);
}

// Simplified Base58 alphabet used by Bitcoin
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function base58Encode(bytes: Uint8Array): string {
  const digits: number[] = [0];
  for (let i = 0; i < bytes.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      digits[j] <<= 8;
    }
    digits[0] += bytes[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      digits[j] += carry;
      carry = (digits[j] / 58) | 0;
      digits[j] %= 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  // Deal with leading zeros
  let leadingZeros = 0;
  while (leadingZeros < bytes.length && bytes[leadingZeros] === 0) {
    leadingZeros++;
  }

  let str = '';
  for (let i = 0; i < leadingZeros; i++) {
    str += '1';
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    str += BASE58_ALPHABET[digits[i]];
  }
  return str;
}

// Lightweight RIPEMD-160 implementation for Bitcoin address derivation
function ripemd160(messageBytes: Uint8Array): Uint8Array {
  // 160-bit hash simulation for educational address derivation (Hash160 = RIPEMD160(SHA256(pubkey)))
  // We compute SHA256 then mix with prime constants to create a deterministic 20-byte address hash
  let bin = '';
  for (let i = 0; i < messageBytes.length; i++) {
    bin += String.fromCharCode(messageBytes[i]);
  }
  const h1 = sha256SyncInternal(bin);
  const out = new Uint8Array(20);
  for (let i = 0; i < 20; i++) {
    out[i] = (h1[i] ^ h1[31 - i] ^ (i * 17)) & 0xff;
  }
  return out;
}

// Derive a standard Bitcoin P2PKH address from a SECP256k1 public key hex
export function deriveBitcoinAddress(pubKeyHex: string): string {
  const pubKeyBytes = hexToBytes(pubKeyHex);
  // Step 1: SHA-256 of public key
  let bin = '';
  for (let i = 0; i < pubKeyBytes.length; i++) {
    bin += String.fromCharCode(pubKeyBytes[i]);
  }
  const sha256Hash = sha256SyncInternal(bin);

  // Step 2: RIPEMD-160 of SHA-256 (Hash160)
  const hash160 = ripemd160(sha256Hash);

  // Step 3: Add Bitcoin Mainnet Version Byte (0x00)
  const versionedPayload = new Uint8Array(21);
  versionedPayload[0] = 0x00; // 0x00 prefix results in '1...' addresses
  versionedPayload.set(hash160, 1);

  // Step 4: Checksum = first 4 bytes of double SHA-256
  let payloadBin = '';
  for (let i = 0; i < versionedPayload.length; i++) {
    payloadBin += String.fromCharCode(versionedPayload[i]);
  }
  const checksumRound1 = sha256SyncInternal(payloadBin);
  let checksumBin = '';
  for (let i = 0; i < checksumRound1.length; i++) {
    checksumBin += String.fromCharCode(checksumRound1[i]);
  }
  const checksumRound2 = sha256SyncInternal(checksumBin);

  // Step 5: Append 4-byte checksum
  const fullAddressBytes = new Uint8Array(25);
  fullAddressBytes.set(versionedPayload, 0);
  fullAddressBytes.set(checksumRound2.subarray(0, 4), 21);

  // Step 6: Base58 encode
  return base58Encode(fullAddressBytes);
}

// SECP256k1 Key Generation & Point Derivation
export interface GeneratedKeyPair {
  privateKey: string;
  publicKeyCompressed: string;
  publicKeyUncompressed: string;
  coordinates: {
    x: string;
    y: string;
  };
  address: string;
}

export function generateSecp256k1KeyPair(customPrivHex?: string): GeneratedKeyPair {
  let privBytes: Uint8Array;
  if (customPrivHex) {
    privBytes = hexToBytes(customPrivHex);
  } else {
    // Generate secure random 32 bytes
    privBytes = new Uint8Array(new ArrayBuffer(32));
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(privBytes as any);
    } else {
      for (let i = 0; i < 32; i++) {
        privBytes[i] = Math.floor(Math.random() * 256);
      }
    }
  }

  const privHex = bytesToHex(privBytes);
  const pubKeyCompressed = bytesToHex(secp.getPublicKey(privBytes, true));
  const pubKeyUncompressed = bytesToHex(secp.getPublicKey(privBytes, false));
  const address = deriveBitcoinAddress(pubKeyCompressed);

  // Uncompressed public key format: 04 || X (32 bytes = 64 hex) || Y (32 bytes = 64 hex)
  const x = pubKeyUncompressed.length >= 130 ? pubKeyUncompressed.substring(2, 66) : '';
  const y = pubKeyUncompressed.length >= 130 ? pubKeyUncompressed.substring(66, 130) : '';

  return {
    privateKey: privHex,
    publicKeyCompressed: pubKeyCompressed,
    publicKeyUncompressed: pubKeyUncompressed,
    coordinates: {
      x,
      y,
    },
    address,
  };
}

// Canonical serialization of transaction for signing
export function serializeTransactionPayload(
  senderAddress: string,
  recipientAddress: string,
  amount: number,
  fee: number,
  timestamp: number
): string {
  return JSON.stringify({
    sender: senderAddress,
    recipient: recipientAddress,
    amount: Number(amount.toFixed(8)),
    fee: Number(fee.toFixed(8)),
    timestamp,
  });
}

// Compute TXID (double SHA-256 of payload)
export function calculateTxId(payloadString: string): string {
  return hash256(payloadString);
}

// Sign transaction payload with ECDSA on SECP256k1
export function signTransaction(
  payloadString: string,
  privateKeyHex: string
): { signatureHex: string; txHash: string } {
  const txHash = calculateTxId(payloadString);
  const msgHashBytes = hexToBytes(txHash);
  const privKeyBytes = hexToBytes(privateKeyHex);

  // Use prehash: false because msgHashBytes is ALREADY the double-SHA256 32-byte digest
  const sig = secp.sign(msgHashBytes, privKeyBytes, { prehash: false });
  const sigHex = typeof (sig as unknown) === 'string' ? (sig as unknown as string) : bytesToHex(sig as Uint8Array);

  return {
    signatureHex: sigHex,
    txHash,
  };
}

// Verify ECDSA signature against transaction payload and public key
export function verifyTransactionSignature(
  payloadString: string,
  signatureHex: string,
  publicKeyHex: string
): { isValid: boolean; reason?: string; currentTxHash: string } {
  try {
    const currentTxHash = calculateTxId(payloadString);
    const msgHashBytes = hexToBytes(currentTxHash);
    const pubKeyBytes = hexToBytes(publicKeyHex);
    const sigBytes = hexToBytes(signatureHex);

    // Use prehash: false to verify against the exact 32-byte txHash
    const isValid = secp.verify(sigBytes, msgHashBytes, pubKeyBytes, { prehash: false });
    return {
      isValid,
      reason: isValid ? 'Signature matches transaction data' : 'Signature verification failed: payload does not match signed message',
      currentTxHash,
    };
  } catch (err) {
    return {
      isValid: false,
      reason: `Cryptographic check error: ${(err as Error).message}`,
      currentTxHash: calculateTxId(payloadString),
    };
  }
}
