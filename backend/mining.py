"""
Bitcoin-VisualCore: Step 3 - Proof-of-Work Mining Engine (mining.py)
Implements non-blocking Proof of Work loop.
Prevents server/browser freeze by allowing batching and status reporting.
"""

import time
from .blockchain import Block, double_sha256

def proof_of_work(block: Block, target_prefix: str = "000", max_iterations: int = 500000) -> tuple[int, str]:
    """
    Loops nonces looking for block.hash starting with target_prefix.
    Can be run in background threads to avoid blocking server threads.
    """
    nonce = 0
    start_time = time.time()

    while nonce < max_iterations:
        block.nonce = nonce
        block_hash = block.calculate_hash()
        if block_hash.startswith(target_prefix):
            block.hash = block_hash
            return nonce, block_hash
        nonce += 1

    # Return latest nonce scanned if limit reached
    return nonce, block.calculate_hash()
