from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from app.database import get_db
from app.models.evaluation import Evaluation
from app.models.user import User, UserRole
from app.services.auth_service import require_role
from app.services.integrity_service import IntegrityService
from app.services.audit_service import AuditService
from app.config import settings

router = APIRouter(prefix="/integrity", tags=["Integrity Center"])

@router.get("", response_model=Dict[str, Any])
async def get_all_integrity_status(db: AsyncSession = Depends(get_db)):
    """
    Returns cryptographic integrity verification for all submitted evaluations.
    """
    stmt = select(Evaluation).where(Evaluation.status == "SUBMITTED")
    res = await db.execute(stmt)
    evaluations = res.scalars().all()

    results = []
    verified_count = 0
    tampered_count = 0

    for ev in evaluations:
        status_info = await IntegrityService.verify_evaluation_integrity(ev.id, db)
        team_name = ev.team.name if ev.team else "Team"
        judge_name = ev.judge.full_name if ev.judge else "Judge"

        item = {
            "evaluation_id": ev.id,
            "team_id": ev.team_id,
            "team_name": team_name,
            "judge_id": ev.judge_id,
            "judge_name": judge_name,
            "rubric_version": ev.rubric_version,
            "is_tampered_demo": ev.is_tampered_demo,
            **status_info
        }
        results.append(item)

        if status_info.get("status") == "VERIFIED":
            verified_count += 1
        elif status_info.get("status") == "TAMPERED":
            tampered_count += 1

    return {
        "total_evaluations": len(evaluations),
        "verified_count": verified_count,
        "tampered_count": tampered_count,
        "system_status": "INTEGRITY_VIOLATION" if tampered_count > 0 else "ALL_VERIFIED",
        "evaluations": results
    }

@router.get("/verify/{evaluation_id}", response_model=Dict[str, Any])
async def verify_single_evaluation(evaluation_id: str, db: AsyncSession = Depends(get_db)):
    result = await IntegrityService.verify_evaluation_integrity(evaluation_id, db)
    return result

@router.post("/simulate-tampering", response_model=Dict[str, Any])
async def simulate_database_tampering(
    evaluation_id: str | None = None,
    current_user: User = Depends(require_role([UserRole.ORGANIZER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Development/Demo only:
    Simulates malicious database alteration without on-chain consent.
    Alters a score in the SQL database, causing immediate cryptographic mismatch in the Integrity Center.
    """
    if not settings.DEMO_MODE:
        raise HTTPException(status_code=403, detail="Tampering simulation is disabled in production environments.")

    stmt = select(Evaluation).where(Evaluation.status == "SUBMITTED")
    if evaluation_id:
        stmt = stmt.where(Evaluation.id == evaluation_id)
    res = await db.execute(stmt)
    evaluation = res.scalars().first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="No submitted evaluation found to simulate tampering on.")

    # Save original score & categories if not already saved
    if not evaluation.original_score_before_tamper:
        evaluation.original_score_before_tamper = evaluation.final_score

    original_score = evaluation.final_score
    original_categories = dict(evaluation.category_scores or {})
    tampered_score = min(100.0, original_score + 7.0)
    scores = dict(original_categories)
    tech_score = scores.get("Technical Quality", 20.0)
    scores["Technical Quality"] = min(25.0, tech_score + 7.0)

    evaluation.final_score = tampered_score
    evaluation.category_scores = scores
    evaluation.is_tampered_demo = True

    await AuditService.log_event(
        db=db,
        entity_type="TAMPER_SIMULATION",
        entity_id=evaluation.id,
        action="DATABASE_SCORE_TAMPERED",
        actor_id=current_user.id,
        actor_role=current_user.role.value,
        actor_name=current_user.full_name,
        details={
            "original_score": original_score,
            "original_categories": original_categories,
            "tampered_score": tampered_score,
            "note": "Demo-only database value alteration to demonstrate cryptographic integrity mismatch."
        }
    )

    await db.commit()
    await db.refresh(evaluation)

    # Re-verify to return the tampered state
    verification = await IntegrityService.verify_evaluation_integrity(evaluation.id, db)
    return {
        "success": True,
        "message": "Demo database tampering simulated successfully. Check Integrity Center to view cryptographic mismatch.",
        "evaluation_id": evaluation.id,
        "original_score": evaluation.original_score_before_tamper,
        "tampered_database_score": evaluation.final_score,
        "verification": verification
    }

@router.post("/restore-demo", response_model=Dict[str, Any])
async def restore_demo_records(
    current_user: User = Depends(require_role([UserRole.ORGANIZER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Restores any tampered demo evaluation records to their original pristine state.
    """
    stmt = select(Evaluation).where(Evaluation.is_tampered_demo == True)
    res = await db.execute(stmt)
    tampered_evals = res.scalars().all()

    for ev in tampered_evals:
        if ev.original_score_before_tamper:
            ev.final_score = ev.original_score_before_tamper
            scores = dict(ev.category_scores or {})
            if "Technical Quality" in scores:
                scores["Technical Quality"] = 24.0 if ev.final_score == 95.0 else 21.0
            ev.category_scores = scores
            ev.is_tampered_demo = False
            ev.original_score_before_tamper = None

    await db.commit()
    return {"message": f"Restored {len(tampered_evals)} evaluation(s) to original verified cryptographic state."}
