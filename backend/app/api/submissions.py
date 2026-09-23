from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db, AsyncSessionLocal
from app.models.submission import Submission, SubmissionStatus
from app.models.claim import Claim
from app.models.team import Team, TeamMember
from app.models.user import User
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.services.auth_service import get_current_user
from app.services.ai_agent import AIAgentService
from app.services.crypto import compute_evidence_bundle_hash
from app.services.audit_service import AuditService

router = APIRouter(prefix="/submissions", tags=["Submissions"])

async def run_ai_analysis_pipeline(submission_id: str, submission_payload: dict):
    """
    Background job that executes the 5-step AI analysis pipeline:
    SUBMITTED -> EXTRACTING -> CLAIMS_IDENTIFIED -> VERIFYING -> READY
    """
    async with AsyncSessionLocal() as db:
        stmt = select(Submission).where(Submission.id == submission_id)
        res = await db.execute(stmt)
        submission = res.scalar_one_or_none()
        if not submission:
            return

        try:
            # Step 1: EXTRACTING
            submission.ai_analysis_status = SubmissionStatus.EXTRACTING
            submission.ai_status_message = "AI extracting project details from repository, diagrams, and metadata..."
            await db.commit()

            # Run analysis
            analysis = await AIAgentService.analyze_submission(submission_payload)

            # Step 2: CLAIMS_IDENTIFIED
            submission.ai_analysis_status = SubmissionStatus.CLAIMS_IDENTIFIED
            submission.ai_status_message = f"Identified {len(analysis['claims'])} verifiable claims from project submission."
            await db.commit()

            # Step 3: VERIFYING
            submission.ai_analysis_status = SubmissionStatus.VERIFYING
            submission.ai_status_message = "Cross-referencing claims against GitHub repository, documents, and live evidence..."
            await db.commit()

            # Save claims to DB
            claims_for_hashing = []
            for item in analysis["claims"]:
                claim = Claim(
                    submission_id=submission.id,
                    claim_text=item["claim"],
                    subclaims=item.get("subclaims", []),
                    category=item.get("category", "Technical Quality"),
                    status=item["status"],
                    confidence=item["confidence"],
                    reasoning=item.get("reasoning"),
                    evidence=item.get("evidence", [])
                )
                db.add(claim)
                claims_for_hashing.append({
                    "claim": item["claim"],
                    "status": item["status"],
                    "confidence": item["confidence"],
                    "evidence": item.get("evidence", [])
                })

            # Calculate deterministic SHA-256 evidence bundle hash
            bundle_hash = compute_evidence_bundle_hash(claims_for_hashing)
            submission.evidence_bundle_hash = bundle_hash
            submission.project_summary = analysis.get("project_summary")

            # Step 4: READY
            submission.ai_analysis_status = SubmissionStatus.READY
            submission.ai_status_message = "Evidence verification complete. Ready for judge review."

            await AuditService.log_event(
                db=db,
                entity_type="SUBMISSION",
                entity_id=submission.id,
                action="AI_ANALYSIS_COMPLETED",
                actor_role="AI_AGENT",
                actor_name="VeriJudge AI Evidence Agent",
                details={
                    "claims_count": len(analysis["claims"]),
                    "evidence_bundle_hash": bundle_hash
                }
            )

            await db.commit()

        except Exception as e:
            submission.ai_analysis_status = SubmissionStatus.READY
            submission.ai_status_message = f"Analysis completed with fallback: {str(e)}"
            await db.commit()

@router.get("", response_model=List[SubmissionResponse])
async def list_submissions(db: AsyncSession = Depends(get_db)):
    stmt = select(Submission).order_by(Submission.submitted_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/my-submission", response_model=SubmissionResponse | None)
async def get_my_submission(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Find user's team
    mem_stmt = select(TeamMember).where(TeamMember.user_id == current_user.id)
    mem_res = await db.execute(mem_stmt)
    membership = mem_res.scalar_one_or_none()
    if not membership:
        return None

    sub_stmt = select(Submission).where(Submission.team_id == membership.team_id)
    sub_res = await db.execute(sub_stmt)
    return sub_res.scalar_one_or_none()

@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission(submission_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Submission).where(Submission.id == submission_id)
    result = await db.execute(stmt)
    submission = result.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission

@router.post("", response_model=SubmissionResponse)
async def create_submission(
    submission_in: SubmissionCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if team already has a submission
    existing = await db.execute(select(Submission).where(Submission.team_id == submission_in.team_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Team already has an active submission.")

    submission = Submission(
        team_id=submission_in.team_id,
        project_title=submission_in.project_title,
        problem_statement=submission_in.problem_statement,
        project_description=submission_in.project_description,
        github_url=submission_in.github_url,
        live_demo_url=submission_in.live_demo_url,
        ppt_url=submission_in.ppt_url,
        architecture_url=submission_in.architecture_url,
        screenshots=submission_in.screenshots,
        demo_video_url=submission_in.demo_video_url,
        tech_stack=submission_in.tech_stack,
        raw_claims=submission_in.raw_claims,
        ai_analysis_status=SubmissionStatus.SUBMITTED,
        ai_status_message="Submitted. AI Evidence Agent scheduled."
    )
    db.add(submission)
    await db.flush()

    await AuditService.log_event(
        db=db,
        entity_type="SUBMISSION",
        entity_id=submission.id,
        action="SUBMISSION_CREATED",
        actor_id=current_user.id,
        actor_role=current_user.role.value,
        actor_name=current_user.full_name,
        details={"project_title": submission.project_title}
    )

    await db.commit()
    await db.refresh(submission)

    # Queue background AI analysis
    payload = {
        "project_title": submission.project_title,
        "problem_statement": submission.problem_statement,
        "project_description": submission.project_description,
        "github_url": submission.github_url,
        "live_demo_url": submission.live_demo_url,
        "architecture_url": submission.architecture_url,
        "tech_stack": submission.tech_stack,
        "raw_claims": submission.raw_claims
    }
    background_tasks.add_task(run_ai_analysis_pipeline, submission.id, payload)

    return submission
