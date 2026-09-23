from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any
from app.database import get_db
from app.models.submission import Submission
from app.models.claim import Claim
from app.services.ai_agent import AIAgentService
from app.services.crypto import compute_evidence_bundle_hash

router = APIRouter(prefix="/ai-evidence", tags=["AI Evidence Agent"])

@router.get("/{submission_id}", response_model=Dict[str, Any])
async def get_submission_evidence(submission_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Submission).where(Submission.id == submission_id)
    res = await db.execute(stmt)
    submission = res.scalar_one_or_none()

    if not submission:
        # Try finding by team_id
        stmt2 = select(Submission).where(Submission.team_id == submission_id)
        res2 = await db.execute(stmt2)
        submission = res2.scalar_one_or_none()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    claim_stmt = select(Claim).where(Claim.submission_id == submission.id)
    claim_res = await db.execute(claim_stmt)
    claims = claim_res.scalars().all()

    # Calculate status counts
    status_counts = {
        "Supported": 0,
        "Partially Supported": 0,
        "Unsupported": 0,
        "Contradicted": 0,
        "Needs Human Review": 0
    }
    for c in claims:
        if c.status in status_counts:
            status_counts[c.status] += 1
        else:
            status_counts["Needs Human Review"] += 1

    return {
        "submission_id": submission.id,
        "project_title": submission.project_title,
        "project_summary": submission.project_summary,
        "analysis_status": submission.ai_analysis_status,
        "status_message": submission.ai_status_message,
        "evidence_bundle_hash": submission.evidence_bundle_hash,
        "status_breakdown": status_counts,
        "claims": [
            {
                "id": c.id,
                "claim": c.claim_text,
                "subclaims": c.subclaims,
                "category": c.category,
                "status": c.status,
                "confidence": c.confidence,
                "reasoning": c.reasoning,
                "evidence": c.evidence
            }
            for c in claims
        ]
    }
