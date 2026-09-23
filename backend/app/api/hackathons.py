from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db
from app.models.hackathon import Hackathon
from app.models.rubric import Rubric
from app.models.evaluation import Evaluation
from app.models.user import User, UserRole
from app.schemas.hackathon import HackathonCreate, HackathonResponse
from app.services.auth_service import get_current_user, require_role
from app.services.integrity_service import IntegrityService

router = APIRouter(prefix="/hackathons", tags=["Hackathons"])

@router.get("", response_model=List[HackathonResponse])
async def list_hackathons(db: AsyncSession = Depends(get_db)):
    stmt = select(Hackathon).order_by(Hackathon.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{hackathon_id}", response_model=HackathonResponse)
async def get_hackathon(hackathon_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Hackathon).where(Hackathon.id == hackathon_id)
    result = await db.execute(stmt)
    hackathon = result.scalar_one_or_none()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    return hackathon

@router.post("", response_model=HackathonResponse)
async def create_hackathon(
    hackathon_in: HackathonCreate,
    current_user: User = Depends(require_role([UserRole.ORGANIZER])),
    db: AsyncSession = Depends(get_db)
):
    hackathon = Hackathon(
        title=hackathon_in.title,
        tagline=hackathon_in.tagline,
        description=hackathon_in.description,
        start_date=hackathon_in.start_date,
        end_date=hackathon_in.end_date,
        status="ACTIVE"
    )
    db.add(hackathon)
    await db.commit()
    await db.refresh(hackathon)
    return hackathon

@router.post("/{hackathon_id}/publish-results")
async def publish_results(
    hackathon_id: str,
    current_user: User = Depends(require_role([UserRole.ORGANIZER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Publish final results.
    Strict Rule: Do not allow result publication when integrity violations are unresolved.
    """
    stmt = select(Hackathon).where(Hackathon.id == hackathon_id)
    result = await db.execute(stmt)
    hackathon = result.scalar_one_or_none()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")

    # Fetch all submitted evaluations
    eval_stmt = select(Evaluation).where(
        Evaluation.hackathon_id == hackathon_id,
        Evaluation.status == "SUBMITTED"
    )
    eval_res = await db.execute(eval_stmt)
    evaluations = eval_res.scalars().all()

    # Check integrity of all evaluations
    for evaluation in evaluations:
        integrity = await IntegrityService.verify_evaluation_integrity(evaluation.id, db)
        if not integrity.get("is_verified", False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot publish results: Evaluation for team {evaluation.team_id} failed cryptographic integrity verification! {integrity.get('message')}"
            )

    hackathon.is_published = True
    hackathon.status = "COMPLETED"
    await db.commit()
    return {"message": "Hackathon results published successfully. All evaluations verified."}
