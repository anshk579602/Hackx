from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from typing import List
from app.database import get_db
from app.models.hackathon import Hackathon
from app.models.rubric import Rubric
from app.models.evaluation import Evaluation
from app.models.team import Team, TeamMember
from app.models.submission import Submission
from app.models.user import User, UserRole
from app.schemas.hackathon import HackathonCreate, HackathonUpdate, HackathonResponse
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

@router.put("/{hackathon_id}", response_model=HackathonResponse)
async def update_hackathon(
    hackathon_id: str,
    update_in: HackathonUpdate,
    current_user: User = Depends(require_role([UserRole.ORGANIZER])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Hackathon).where(Hackathon.id == hackathon_id)
    result = await db.execute(stmt)
    hackathon = result.scalar_one_or_none()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")

    update_data = update_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(hackathon, field, value)

    await db.commit()
    await db.refresh(hackathon)
    return hackathon

@router.get("/{hackathon_id}/teams-summary")
async def get_hackathon_teams_summary(
    hackathon_id: str,
    current_user: User = Depends(require_role([UserRole.ORGANIZER])),
    db: AsyncSession = Depends(get_db)
):
    """Returns teams, submission count, and evaluation summary for a hackathon."""
    stmt = select(Hackathon).where(Hackathon.id == hackathon_id)
    h_res = await db.execute(stmt)
    hackathon = h_res.scalar_one_or_none()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")

    teams_res = await db.execute(select(Team).where(Team.hackathon_id == hackathon_id))
    teams = teams_res.scalars().all()

    summary = []
    for team in teams:
        # Count members
        mem_res = await db.execute(select(TeamMember).where(TeamMember.team_id == team.id))
        members = mem_res.scalars().all()

        # Get user info for members
        member_details = []
        for m in members:
            u_res = await db.execute(select(User).where(User.id == m.user_id))
            u = u_res.scalar_one_or_none()
            member_details.append({
                "user_id": m.user_id,
                "name": u.full_name if u else "Unknown",
                "email": u.email if u else "",
                "role_in_team": m.role_in_team
            })

        # Submission
        sub_res = await db.execute(select(Submission).where(Submission.team_id == team.id))
        sub = sub_res.scalar_one_or_none()

        # Evaluation
        eval_res = await db.execute(select(Evaluation).where(Evaluation.team_id == team.id))
        evals = eval_res.scalars().all()
        avg_score = None
        if evals:
            submitted = [e for e in evals if e.status == "SUBMITTED"]
            if submitted:
                scores = [e.total_score for e in submitted if e.total_score is not None]
                avg_score = round(sum(scores) / len(scores), 2) if scores else None

        summary.append({
            "team_id": team.id,
            "team_name": team.name,
            "join_code": team.join_code,
            "member_count": len(members),
            "members": member_details,
            "has_submission": sub is not None,
            "submission_id": sub.id if sub else None,
            "project_title": sub.project_title if sub else None,
            "submission_url": sub.github_url if sub else None,
            "evaluation_count": len(evals),
            "avg_score": avg_score,
        })

    return {
        "hackathon_id": hackathon_id,
        "total_teams": len(teams),
        "teams": summary
    }

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

@router.delete("/{hackathon_id}")
async def delete_hackathon(
    hackathon_id: str,
    current_user: User = Depends(require_role([UserRole.ORGANIZER])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Hackathon).where(Hackathon.id == hackathon_id)
    result = await db.execute(stmt)
    hackathon = result.scalar_one_or_none()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")

    # Clean up associated teams, rubrics, submissions, evaluations
    await db.execute(text("DELETE FROM evaluations WHERE hackathon_id = :hid"), {"hid": hackathon_id})
    await db.execute(text("DELETE FROM submissions WHERE hackathon_id = :hid"), {"hid": hackathon_id})
    await db.execute(text("DELETE FROM teams WHERE hackathon_id = :hid"), {"hid": hackathon_id})
    await db.execute(text("DELETE FROM rubrics WHERE hackathon_id = :hid"), {"hid": hackathon_id})
    await db.delete(hackathon)
    await db.commit()
    return {"message": "Hackathon event deleted successfully by organizer."}
