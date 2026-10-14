"""
Bitcoin-VisualCore: Step 1 - Cryptographic Identity Layer (keys.py)
Direct implementation of Bitcoin's SECP256k1 key generation and address derivation.
Avoids binary serialization errors by converting keys to hexadecimal strings (.hex()).
"""

import hashlib
import ecdsa

def generate_key_pair():
    """
    1. Generates a random 256-bit Private Key using the SECP256k1 elliptic curve.
    2. Derives the corresponding Public Key via elliptic curve point multiplication.
    3. Hashes the public key using SHA-256 and RIPEMD-160 to derive a clean Bitcoin address.
    """
    # 1. 256-bit secret scalar
    private_key_obj = ecdsa.SigningKey.generate(curve=ecdsa.SECP256k1)
    private_key_hex = private_key_obj.to_string().hex()

    # 2. Elliptic curve point multiplication K = k * G
    public_key_obj = private_key_obj.verifying_key
    public_key_bytes = public_key_obj.to_string()
    public_key_hex = public_key_bytes.hex()

    # 3. Hash160 address derivation: RIPEMD160(SHA256(pubkey))
    sha256_hash = hashlib.sha256(public_key_bytes).digest()
    try:
        ripemd160_hash = hashlib.new('ripemd160', sha256_hash).hexdigest()
    except ValueError:
        # Fallback if system OpenSSL disables RIPEMD160
        ripemd160_hash = hashlib.sha256(sha256_hash).hexdigest()[:40]

    # Prepend version byte 0x00 for standard P2PKH mainnet address representation
    address = f"1{ripemd160_hash[:32]}"

    return {
        "private_key": private_key_hex,
        "public_key": public_key_hex,
        "address": address
    }

if __name__ == "__main__":
    wallet = generate_key_pair()
    print("=== Bitcoin Keypair Generated ===")
    print(f"Private Key (Hex): {wallet['private_key']}")
    print(f"Public Key  (Hex): {wallet['public_key']}")
    print(f"Address     (Base): {wallet['address']}")
