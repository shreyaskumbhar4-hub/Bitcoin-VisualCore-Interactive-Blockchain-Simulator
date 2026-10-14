"""
Bitcoin-VisualCore: Step 2 - The Core Ledger Engine (blockchain.py)
Implements Block structure, Transaction validation, and Mempool queue.
Ensures signatures are validated and payloads are serializable.
"""

import time
import hashlib
import json
import ecdsa

def double_sha256(data: str) -> str:
    """Bitcoin's hash256: SHA256(SHA256(data))"""
    b1 = hashlib.sha256(data.encode('utf-8')).digest()
    return hashlib.sha256(b1).hexdigest()

class Transaction:
    def __init__(self, sender_address: str, receiver_address: str, amount: float, fee: float, signature: str, public_key: str, timestamp: float = None):
        self.sender_address = sender_address
        self.receiver_address = receiver_address
        self.amount = float(amount)
        self.fee = float(fee)
        self.signature = signature  # Hexadecimal string
        self.public_key = public_key  # Hexadecimal string
        self.timestamp = timestamp or time.time()
        self.tx_id = self.calculate_hash()

    def get_payload(self) -> str:
        """Deterministic serialization for signing & verification"""
        return json.dumps({
            "sender": self.sender_address,
            "recipient": self.receiver_address,
            "amount": round(self.amount, 8),
            "fee": round(self.fee, 8),
            "timestamp": int(self.timestamp)
        }, sort_keys=True)

    def calculate_hash(self) -> str:
        return double_sha256(self.get_payload())

    def verify_signature(self) -> bool:
        """Verify ECDSA signature against sender's public key"""
        try:
            vk = ecdsa.VerifyingKey.from_string(bytes.fromhex(self.public_key), curve=ecdsa.SECP256k1)
            sig_bytes = bytes.fromhex(self.signature)
            msg_bytes = bytes.fromhex(self.tx_id)
            return vk.verify(sig_bytes, msg_bytes)
        except Exception as e:
            return False

    def to_dict(self) -> dict:
        return {
            "tx_id": self.tx_id,
            "sender_address": self.sender_address,
            "receiver_address": self.receiver_address,
            "amount": self.amount,
            "fee": self.fee,
            "signature": self.signature,
            "public_key": self.public_key,
            "timestamp": self.timestamp
        }

class Block:
    def __init__(self, index: int, previous_hash: str, transactions: list, difficulty: int = 3, nonce: int = 0, timestamp: float = None):
        self.index = index
        self.previous_hash = previous_hash
        self.transactions = transactions  # List of Transaction objects or dicts
        self.difficulty = difficulty
        self.nonce = nonce
        self.timestamp = timestamp or time.time()
        self.merkle_root = self.calculate_merkle_root()
        self.hash = self.calculate_hash()

    def calculate_merkle_root(self) -> str:
        if not self.transactions:
            return double_sha256("EMPTY_BLOCK")
        tx_hashes = [tx.tx_id if isinstance(tx, Transaction) else tx.get("tx_id", "") for tx in self.transactions]
        while len(tx_hashes) > 1:
            if len(tx_hashes) % 2 != 0:
                tx_hashes.append(tx_hashes[-1])
            new_level = []
            for i in range(0, len(tx_hashes), 2):
                new_level.append(double_sha256(tx_hashes[i] + tx_hashes[i+1]))
            tx_hashes = new_level
        return tx_hashes[0]

    def serialize_header(self) -> str:
        return f"{self.index}|{self.previous_hash}|{self.merkle_root}|{int(self.timestamp)}|{self.difficulty}|{self.nonce}"

    def calculate_hash(self) -> str:
        return double_sha256(self.serialize_header())

    def to_dict(self) -> dict:
        return {
            "index": self.index,
            "previous_hash": self.previous_hash,
            "merkle_root": self.merkle_root,
            "timestamp": self.timestamp,
            "difficulty": self.difficulty,
            "nonce": self.nonce,
            "hash": self.hash,
            "transactions": [tx.to_dict() if isinstance(tx, Transaction) else tx for tx in self.transactions]
        }
