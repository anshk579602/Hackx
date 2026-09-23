from typing import Dict, Any, List
from app.models.claim import Claim

class ScoringGuardrailService:
    @staticmethod
    def evaluate_score_alignment(
        category_scores: Dict[str, float],
        rubric_categories: List[Any],
        claims: List[Claim],
        justification: str | None = None
    ) -> Dict[str, Any]:
        """
        Autonomous score guardrail:
        Compares judge category scores against AI evidence findings.
        If a score is near maximum (e.g. >= 90% of max_score) while associated claims
        in that category are unsupported or contradicted, flags the need for human justification.
        Never alters judge score.
        """
        reasons = []
        suggested_questions = []
        discrepant_categories = []

        # Map claims by category
        claims_by_category: Dict[str, List[Claim]] = {}
        for c in claims:
            cat = c.category or "Technical Quality"
            claims_by_category.setdefault(cat, []).append(c)

        for cat in rubric_categories:
            cat_name = cat.name
            max_score = float(cat.max_score)
            awarded = float(category_scores.get(cat_name, 0.0))
            score_ratio = awarded / max_score if max_score > 0 else 0

            cat_claims = claims_by_category.get(cat_name, [])
            unsupported_or_contradicted = [
                c for c in cat_claims if c.status in ["Unsupported", "Contradicted"]
            ]
            supported_count = len([c for c in cat_claims if c.status == "Supported"])

            # Rule: High score (>= 88%) with unverified or contradicted claims
            if score_ratio >= 0.88 and unsupported_or_contradicted:
                bad_claim_names = [f"'{c.claim_text}' ({c.status})" for c in unsupported_or_contradicted[:2]]
                reasons.append(
                    f"You awarded {awarded:g}/{max_score:g} in {cat_name}, but AI evidence flagged "
                    f"{', '.join(bad_claim_names)}. The evidence report found only {supported_count} verified supporting criteria."
                )
                suggested_questions.append(
                    f"Your {cat_name} score is {awarded:g}/{max_score:g}. Which specific technical demonstration or unlisted evidence supports this top-tier rating?"
                )
                discrepant_categories.append(cat_name)

            # Rule: Low score (<= 40%) when all evidence was verified as Supported
            elif score_ratio <= 0.40 and cat_claims and supported_count == len(cat_claims):
                reasons.append(
                    f"You awarded {awarded:g}/{max_score:g} in {cat_name}, but all {supported_count} identified criteria were verified as fully Supported."
                )
                suggested_questions.append(
                    f"Your {cat_name} score is {awarded:g}/{max_score:g} despite verified evidence. Did the team fail to demonstrate this during live Q&A?"
                )
                discrepant_categories.append(cat_name)

        has_justification = bool(justification and len(justification.strip()) >= 15)
        requires_justification = len(reasons) > 0 and not has_justification

        return {
            "requires_justification": requires_justification,
            "reasons": reasons,
            "suggested_questions": suggested_questions,
            "discrepant_categories": discrepant_categories,
            "has_valid_justification": has_justification,
        }
