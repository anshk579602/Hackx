import random
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db
from app.models.team import Team, TeamMember
from app.models.hackathon import Hackathon
from app.models.user import User, UserRole
from app.schemas.team import TeamCreate, TeamResponse, TeamJoin
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/teams", tags=["Teams"])

def generate_join_code(length=6) -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=length))

@router.get("", response_model=List[TeamResponse])
async def list_teams(hackathon_id: str | None = None, db: AsyncSession = Depends(get_db)):
    stmt = select(Team)
    if hackathon_id:
        stmt = stmt.where(Team.hackathon_id == hackathon_id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/my-team", response_model=TeamResponse | None)
async def get_my_team(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    member_stmt = select(TeamMember).where(TeamMember.user_id == current_user.id)
    result = await db.execute(member_stmt)
    membership = result.scalar_one_or_none()
    if not membership:
        return None

    team_stmt = select(Team).where(Team.id == membership.team_id)
    team_res = await db.execute(team_stmt)
    return team_res.scalar_one_or_none()

@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(team_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Team).where(Team.id == team_id)
    result = await db.execute(stmt)
    team = result.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@router.post("", response_model=TeamResponse)
async def create_team(
    team_in: TeamCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if user already in a team
    existing_mem = await db.execute(select(TeamMember).where(TeamMember.user_id == current_user.id))
    if existing_mem.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You are already a member of a team.")

    target_hackathon_id = team_in.hackathon_id
    if target_hackathon_id:
        hack_res = await db.execute(select(Hackathon).where(Hackathon.id == target_hackathon_id))
        hack = hack_res.scalar_one_or_none()
        if not hack:
            target_hackathon_id = None

    if not target_hackathon_id:
        first_hack = (await db.execute(select(Hackathon).order_by(Hackathon.created_at.desc()))).scalars().first()
        if first_hack:
            target_hackathon_id = first_hack.id
        else:
            raise HTTPException(
                status_code=400,
                detail="No hosted hackathon event exists yet. An organiser must first host a hackathon before teams can register."
            )

    code = generate_join_code()
    team = Team(
        name=team_in.name,
        hackathon_id=target_hackathon_id,
        join_code=code
    )
    db.add(team)
    await db.flush()

    # Add creator as Team Lead
    lead_member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role_in_team="Team Lead"
    )
    db.add(lead_member)
    await db.commit()
    await db.refresh(team)
    return team

@router.post("/join", response_model=TeamResponse)
async def join_team(
    join_in: TeamJoin,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    existing_mem = await db.execute(select(TeamMember).where(TeamMember.user_id == current_user.id))
    if existing_mem.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You are already in a team.")

    team_stmt = select(Team).where(Team.join_code == join_in.join_code.strip().upper())
    result = await db.execute(team_stmt)
    team = result.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Invalid team join code.")

    member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role_in_team="Contributor"
    )
    db.add(member)
    await db.commit()
    await db.refresh(team)
    return team
