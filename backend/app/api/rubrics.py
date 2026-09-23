from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db
from app.models.rubric import Rubric, RubricCategory
from app.models.evaluation import Evaluation
from app.models.user import User, UserRole
from app.schemas.rubric import RubricCreate, RubricResponse
from app.services.auth_service import require_role

router = APIRouter(prefix="/rubrics", tags=["Rubrics"])

@router.get("", response_model=List[RubricResponse])
async def list_rubrics(hackathon_id: str | None = None, db: AsyncSession = Depends(get_db)):
    stmt = select(Rubric).order_by(Rubric.created_at.desc())
    if hackathon_id:
        stmt = stmt.where(Rubric.hackathon_id == hackathon_id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{rubric_id}", response_model=RubricResponse)
async def get_rubric(rubric_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Rubric).where(Rubric.id == rubric_id)
    result = await db.execute(stmt)
    rubric = result.scalar_one_or_none()
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found")
    return rubric

@router.post("", response_model=RubricResponse)
async def create_rubric_version(
    rubric_in: RubricCreate,
    current_user: User = Depends(require_role([UserRole.ORGANIZER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new rubric version (e.g. v1.0, v1.1, v1.2).
    Enforces that version is unique within the hackathon.
    """
    existing_stmt = select(Rubric).where(
        Rubric.hackathon_id == rubric_in.hackathon_id,
        Rubric.version == rubric_in.version
    )
    res = await db.execute(existing_stmt)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rubric version '{rubric_in.version}' already exists. Historical versions are immutable. Please specify a new version identifier (e.g. v1.3)."
        )

    # Calculate total category scores - must total 100 points
    total_score = sum(c.max_score for c in rubric_in.categories)
    if abs(total_score - 100.0) > 0.01:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rubric category maximum scores must sum to 100. Current sum: {total_score:g}"
        )

    rubric = Rubric(
        hackathon_id=rubric_in.hackathon_id,
        version=rubric_in.version,
        title=rubric_in.title,
        description=rubric_in.description,
        is_active=rubric_in.is_active,
        is_immutable=False
    )
    db.add(rubric)
    await db.flush()

    for idx, cat_in in enumerate(rubric_in.categories):
        cat = RubricCategory(
            rubric_id=rubric.id,
            name=cat_in.name,
            max_score=cat_in.max_score,
            weight=cat_in.weight,
            evaluation_criteria=cat_in.evaluation_criteria,
            ai_evidence_checklist=cat_in.ai_evidence_checklist,
            is_active=cat_in.is_active,
            order_index=cat_in.order_index or idx
        )
        db.add(cat)

    await db.commit()
    await db.refresh(rubric)
    return rubric

@router.put("/{rubric_id}/archive")
async def archive_rubric(
    rubric_id: str,
    current_user: User = Depends(require_role([UserRole.ORGANIZER])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Rubric).where(Rubric.id == rubric_id)
    result = await db.execute(stmt)
    rubric = result.scalar_one_or_none()
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found")

    rubric.is_active = False
    await db.commit()
    return {"message": f"Rubric {rubric.version} deactivated"}
