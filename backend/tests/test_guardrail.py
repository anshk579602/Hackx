import pytest
from app.services.scoring_guardrail import ScoringGuardrailService

class MockCategory:
    def __init__(self, name, max_score):
        self.name = name
        self.max_score = max_score

class MockClaim:
    def __init__(self, text, category, status):
        self.claim_text = text
        self.category = category
        self.status = status

def test_guardrail_triggers_justification_for_unsupported_claim():
    categories = [
        MockCategory("Technical Quality", 25.0),
        MockCategory("Innovation", 25.0)
    ]
    claims = [
        MockClaim("Supports 10,000 users", "Technical Quality", "Unsupported"),
        MockClaim("Differentiation", "Innovation", "Supported")
    ]
    category_scores = {
        "Technical Quality": 24.0,  # 24/25 = 96% with Unsupported claim
        "Innovation": 22.0
    }

    # Without justification: requires justification
    res = ScoringGuardrailService.evaluate_score_alignment(
        category_scores=category_scores,
        rubric_categories=categories,
        claims=claims,
        justification=None
    )
    assert res["requires_justification"] is True
    assert "Technical Quality" in res["discrepant_categories"]
    assert len(res["suggested_questions"]) > 0

    # With justification provided: passes
    res_justified = ScoringGuardrailService.evaluate_score_alignment(
        category_scores=category_scores,
        rubric_categories=categories,
        claims=claims,
        justification="Verified in live demonstration via local k6 load test cluster."
    )
    assert res_justified["requires_justification"] is False
    assert res_justified["has_valid_justification"] is True
