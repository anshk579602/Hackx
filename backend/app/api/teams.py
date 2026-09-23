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
from app.models.submission import Submission
from app.models.evaluation import Evaluation
from app.models.blockchain_record import BlockchainRecord
from app.models.audit_log import AuditLog
from app.services.auth_service import get_current_user, get_password_hash

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

@router.get("/my-participations")
async def get_my_participations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    member_stmt = select(TeamMember).where(TeamMember.user_id == current_user.id)
    result = await db.execute(member_stmt)
    memberships = result.scalars().all()

    participations = []
    for mem in memberships:
        team_res = await db.execute(select(Team).where(Team.id == mem.team_id))
        team = team_res.scalar_one_or_none()
        if not team:
            continue

        hack_res = await db.execute(select(Hackathon).where(Hackathon.id == team.hackathon_id))
        hack = hack_res.scalar_one_or_none()

        sub_res = await db.execute(select(Submission).where(Submission.team_id == team.id))
        sub = sub_res.scalar_one_or_none()

        eval_res = await db.execute(select(Evaluation).where(Evaluation.team_id == team.id))
        evaluation = eval_res.scalars().first()

        participations.append({
            "team": team,
            "hackathon": hack,
            "submission": sub,
            "evaluation": evaluation
        })

    return participations

@router.get("/my-team", response_model=TeamResponse | None)
async def get_my_team(
    hackathon_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    member_stmt = select(TeamMember).where(TeamMember.user_id == current_user.id)
    result = await db.execute(member_stmt)
    memberships = result.scalars().all()
    if not memberships:
        return None

    if hackathon_id:
        for mem in memberships:
            team_res = await db.execute(select(Team).where(Team.id == mem.team_id, Team.hackathon_id == hackathon_id))
            team = team_res.scalar_one_or_none()
            if team:
                return team
        return None

    # Return most recent team
    latest_mem = memberships[-1]
    team_stmt = select(Team).where(Team.id == latest_mem.team_id)
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

    # Check if user already in a team for this specific hackathon
    existing_mem = await db.execute(
        select(TeamMember).join(Team).where(
            TeamMember.user_id == current_user.id,
            Team.hackathon_id == target_hackathon_id
        )
    )
    if existing_mem.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You are already registered in a team for this hackathon.")

    # Enforce team size limits configured by organizer
    min_members = (hack.min_team_size if hack and hack.min_team_size else 1)
    max_members = (hack.max_team_size if hack and hack.max_team_size else 4)

    # Process additional members (up to max_members - 1)
    cleaned_members = []
    if team_in.members:
        added_emails = {current_user.email.strip().lower()}
        for mem_in in team_in.members:
            clean_email = mem_in.email.strip().lower()
            if not clean_email or clean_email in added_emails:
                continue
            added_emails.add(clean_email)
            cleaned_members.append(mem_in)

    total_members = 1 + len(cleaned_members)
    if total_members > max_members:
        raise HTTPException(
            status_code=400,
            detail=f"Team size exceeds the maximum limit of {max_members} members for this hackathon."
        )
    if total_members < min_members:
        raise HTTPException(
            status_code=400,
            detail=f"This hackathon requires a minimum of {min_members} members (currently {total_members})."
        )

    code = generate_join_code()
    team = Team(
        name=team_in.name.strip(),
        hackathon_id=target_hackathon_id,
        join_code=code
    )
    db.add(team)
    await db.flush()

    # Add creator as Team Leader
    lead_member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role_in_team="Team Leader"
    )
    db.add(lead_member)

    # Add additional teammates
    for mem_in in cleaned_members[:max_members - 1]:
        clean_email = mem_in.email.strip().lower()
        # Check if user exists
        u_stmt = select(User).where(User.email == clean_email)
        u_res = await db.execute(u_stmt)
        mem_user = u_res.scalar_one_or_none()
        if not mem_user:
            mem_user = User(
                email=clean_email,
                full_name=mem_in.full_name.strip() or clean_email.split("@")[0],
                role=UserRole.PARTICIPANT,
                hashed_password=get_password_hash("Demo123!"),
            )
            db.add(mem_user)
            await db.flush()

        role_desc = mem_in.role_in_team.strip() if mem_in.role_in_team else "Developer"
        tm = TeamMember(
            team_id=team.id,
            user_id=mem_user.id,
            role_in_team=role_desc
        )
        db.add(tm)

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

    # Check max team size configured for the hackathon
    hack_res = await db.execute(select(Hackathon).where(Hackathon.id == team.hackathon_id))
    hack = hack_res.scalar_one_or_none()
    max_allowed = (hack.max_team_size if hack and hack.max_team_size else 4)

    mem_count_res = await db.execute(select(TeamMember).where(TeamMember.team_id == team.id))
    current_count = len(mem_count_res.scalars().all())
    if current_count >= max_allowed:
        raise HTTPException(
            status_code=400,
            detail=f"This team is already full. The organizer set a maximum limit of {max_allowed} members for this hackathon."
        )

    member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role_in_team="Contributor"
    )
    db.add(member)
    await db.commit()
    await db.refresh(team)
    return team

@router.delete("/{team_id}")
async def delete_team(
    team_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a team and cleanly cascade remove related submissions, evaluations, and memberships.
    Organizers have unrestricted authority to manage and delete any team.
    Team leaders may also delete their own team.
    """
    team_res = await db.execute(select(Team).where(Team.id == team_id))
    team = team_res.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    is_organizer = current_user.role == UserRole.ORGANIZER
    if not is_organizer:
        leader_res = await db.execute(
            select(TeamMember).where(
                TeamMember.team_id == team_id,
                TeamMember.user_id == current_user.id,
                TeamMember.role_in_team == "Team Leader"
            )
        )
        if not leader_res.scalar_one_or_none():
            raise HTTPException(
                status_code=403,
                detail="Access denied: Only organizers or the team leader can delete this team."
            )

    team_name = team.name

    # 1. Clean up evaluations & blockchain records
    eval_res = await db.execute(select(Evaluation).where(Evaluation.team_id == team_id))
    evaluations = eval_res.scalars().all()
    for ev in evaluations:
        bc_res = await db.execute(select(BlockchainRecord).where(BlockchainRecord.evaluation_id == ev.id))
        bc = bc_res.scalar_one_or_none()
        if bc:
            await db.delete(bc)
        await db.delete(ev)

    # 2. Clean up submissions & claims
    sub_res = await db.execute(select(Submission).where(Submission.team_id == team_id))
    sub = sub_res.scalar_one_or_none()
    if sub:
        await db.delete(sub)

    # 3. Clean up team members
    mem_res = await db.execute(select(TeamMember).where(TeamMember.team_id == team_id))
    members = mem_res.scalars().all()
    for m in members:
        await db.delete(m)

    # 4. Delete the team itself
    await db.delete(team)

    # 5. Log audit trail entry
    role_str = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    audit = AuditLog(
        entity_type="TEAM",
        entity_id=team_id,
        actor_id=current_user.id,
        actor_role=role_str,
        actor_name=current_user.full_name,
        action="TEAM_DELETED",
        details={"team_name": team_name, "deleted_by": current_user.email}
    )
    db.add(audit)

    await db.commit()
    return {"message": f"Team '{team_name}' has been successfully deleted.", "team_id": team_id}

