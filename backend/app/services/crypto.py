import json
import hashlib
from typing import Dict, Any

def pure_keccak_256(data: bytes) -> bytes:
    """
    Standard Ethereum Keccak-256 implementation (with 0x01 ... 0x80 padding).
    """
    RC = [
        0x0000000000000001, 0x0000000000008082, 0x800000000000808A, 0x8000000080008000,
        0x000000000000808B, 0x0000000080000001, 0x8000000080008081, 0x8000000000008009,
        0x000000000000008A, 0x0000000000000088, 0x0000000080008009, 0x000000008000000A,
        0x000000008000808B, 0x800000000000008B, 0x8000000000008089, 0x8000000000008003,
        0x8000000000008002, 0x8000000000000080, 0x000000000000800A, 0x800000008000000A,
        0x8000000080008081, 0x8000000000008080, 0x0000000080000001, 0x8000000080008008
    ]
    r = 136  # Rate for Keccak-256 (1088 bits = 136 bytes)
    state = [0] * 25
    
    padlen = r - (len(data) % r)
    if padlen == 1:
        padding = b'\x81'
    else:
        padding = b'\x01' + b'\x00' * (padlen - 2) + b'\x80'
    padded = data + padding

    for block_idx in range(0, len(padded), r):
        block = padded[block_idx:block_idx + r]
        for i in range(len(block) // 8):
            val = int.from_bytes(block[i*8:(i+1)*8], 'little')
            state[i] ^= val
            
        for round_idx in range(24):
            # Theta
            C = [state[x] ^ state[x+5] ^ state[x+10] ^ state[x+15] ^ state[x+20] for x in range(5)]
            D = [C[(x+4)%5] ^ (((C[(x+1)%5] << 1) | (C[(x+1)%5] >> 63)) & 0xFFFFFFFFFFFFFFFF) for x in range(5)]
            for x in range(5):
                for y in range(5):
                    state[x + 5*y] ^= D[x]
            # Rho and Pi
            rot = [
                0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14
            ]
            pi = [
                0, 10, 20, 5, 15, 16, 1, 11, 21, 6, 7, 17, 2, 12, 22, 23, 8, 18, 3, 13, 14, 24, 9, 19, 4
            ]
            B = [0] * 25
            for i in range(25):
                r_amount = rot[i]
                val = state[i]
                rot_val = (((val << r_amount) | (val >> (64 - r_amount))) & 0xFFFFFFFFFFFFFFFF) if r_amount != 0 else val
                B[pi[i]] = rot_val
            # Chi
            for y in range(5):
                for x in range(5):
                    state[x + 5*y] = B[x + 5*y] ^ ((~B[((x+1)%5) + 5*y]) & B[((x+2)%5) + 5*y])
            # Iota
            state[0] ^= RC[round_idx]
            for i in range(25):
                state[i] &= 0xFFFFFFFFFFFFFFFF

    out = bytearray()
    for i in range(4):
        out.extend(state[i].to_bytes(8, 'little'))
    return bytes(out)

def keccak256_hex(data: bytes | str) -> str:
    """Returns 0x-prefixed keccak256 hex string."""
    if isinstance(data, str):
        data = data.encode('utf-8')
    return "0x" + pure_keccak_256(data).hex()

def sha256_hex(data: bytes | str) -> str:
    """Returns 0x-prefixed sha256 hex string."""
    if isinstance(data, str):
        data = data.encode('utf-8')
    return "0x" + hashlib.sha256(data).hexdigest()

def create_canonical_evaluation_payload(
    hackathon_id: str,
    team_id: str,
    judge_id: str,
    rubric_version: str,
    final_score: float,
    category_scores: Dict[str, float],
    justification_hash: str,
    evidence_bundle_hash: str,
    timestamp: str,
) -> Dict[str, Any]:
    """
    Constructs the canonical dictionary representation of an evaluation.
    Keys are strictly ordered.
    """
    sorted_category_scores = {k: round(float(v), 2) for k, v in sorted(category_scores.items())}
    return {
        "category_scores": sorted_category_scores,
        "evidence_bundle_hash": str(evidence_bundle_hash),
        "final_score": round(float(final_score), 2),
        "hackathon_id": str(hackathon_id),
        "judge_id": str(judge_id),
        "justification_hash": str(justification_hash),
        "rubric_version": str(rubric_version),
        "team_id": str(team_id),
        "timestamp": str(timestamp),
    }

def canonicalize_json(payload: Dict[str, Any]) -> str:
    """
    Produces deterministic canonical JSON string:
    - Sorted keys
    - No whitespace after separators
    - UTF-8 encoding
    """
    return json.dumps(payload, sort_keys=True, separators=(',', ':'), ensure_ascii=True)

def compute_canonical_evaluation_hash(payload: Dict[str, Any]) -> str:
    """
    Canonicalizes the evaluation record and computes its keccak256 hash.
    """
    canonical_str = canonicalize_json(payload)
    return keccak256_hex(canonical_str)

def compute_evidence_bundle_hash(claims_data: list) -> str:
    """
    Computes SHA-256 hash of claims and evidence bundle.
    """
    canonical_claims = json.dumps(claims_data, sort_keys=True, separators=(',', ':'), ensure_ascii=True)
    return sha256_hex(canonical_claims)
