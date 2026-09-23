import pytest
from app.services.crypto import (
    pure_keccak_256,
    keccak256_hex,
    sha256_hex,
    create_canonical_evaluation_payload,
    canonicalize_json,
    compute_canonical_evaluation_hash,
    compute_evidence_bundle_hash
)

def test_keccak256_empty_string():
    # Canonical Ethereum keccak256("") hash
    expected = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
    assert keccak256_hex(b"") == expected

def test_canonical_json_deterministic_ordering():
    payload_a = {
        "team_id": "team-1",
        "final_score": 90.0,
        "category_scores": {"Technical Quality": 25.0, "Innovation": 25.0},
        "rubric_version": "v1.2",
        "hackathon_id": "hack-1",
        "judge_id": "judge-1",
        "timestamp": "2026-09-23T10:00:00Z",
        "justification_hash": "0x123",
        "evidence_bundle_hash": "0x456"
    }

    # Different insertion order
    payload_b = {
        "timestamp": "2026-09-23T10:00:00Z",
        "judge_id": "judge-1",
        "hackathon_id": "hack-1",
        "rubric_version": "v1.2",
        "category_scores": {"Innovation": 25.0, "Technical Quality": 25.0},
        "final_score": 90.0,
        "team_id": "team-1",
        "evidence_bundle_hash": "0x456",
        "justification_hash": "0x123"
    }

    json_a = canonicalize_json(payload_a)
    json_b = canonicalize_json(payload_b)
    assert json_a == json_b, "Canonical JSON must be identical regardless of dictionary key insertion order"

    hash_a = compute_canonical_evaluation_hash(payload_a)
    hash_b = compute_canonical_evaluation_hash(payload_b)
    assert hash_a == hash_b
    assert hash_a.startswith("0x")
    assert len(hash_a) == 66  # 0x + 64 hex chars

def test_sha256_evidence_bundle_hash():
    claims = [
        {"claim": "System handles 10,000 users", "status": "Unsupported"},
        {"claim": "Works in Hindi and English", "status": "Supported"}
    ]
    bundle_hash = compute_evidence_bundle_hash(claims)
    assert bundle_hash.startswith("0x")
    assert len(bundle_hash) == 66
