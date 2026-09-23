from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.evaluation import Evaluation, EvaluationStatus
from app.models.submission import Submission
from app.models.claim import Claim
from app.models.rubric import Rubric, RubricCategory
from app.models.blockchain_record import BlockchainRecord
from app.models.user import User, UserRole
from app.schemas.evaluation import EvaluationCreate, EvaluationResponse, EvaluationGuardrailCheck
from app.services.auth_service import get_current_user, require_role
from app.services.scoring_guardrail import ScoringGuardrailService
from app.services.crypto import (
    create_canonical_evaluation_payload,
    compute_canonical_evaluation_hash,
    sha256_hex
)
from app.services.blockchain_service import BlockchainService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/evaluations", tags=["Evaluations"])

@router.get("", response_model=List[EvaluationResponse])
async def list_evaluations(
    team_id: str | None = None,
    judge_id: str | None = None,
    hackathon_id: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Evaluation).order_by(Evaluation.created_at.desc())
    if team_id:
        stmt = stmt.where(Evaluation.team_id == team_id)
    if judge_id:
        stmt = stmt.where(Evaluation.judge_id == judge_id)
    if hackathon_id:
        stmt = stmt.where(Evaluation.hackathon_id == hackathon_id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{evaluation_id}", response_model=EvaluationResponse)
async def get_evaluation(evaluation_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Evaluation).where(Evaluation.id == evaluation_id)
    result = await db.execute(stmt)
    evaluation = result.scalar_one_or_none()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return evaluation

@router.post("/guardrail-check", response_model=EvaluationGuardrailCheck)
async def check_guardrail(
    eval_in: EvaluationCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Simulates the autonomous guardrail check before submission.
    Returns whether human justification is required and suggested challenge questions.
    """
    # Fetch rubric categories
    rubric_stmt = select(Rubric).where(
        Rubric.hackathon_id == eval_in.hackathon_id,
        Rubric.version == eval_in.rubric_version
    )
    rubric_res = await db.execute(rubric_stmt)
    rubric = rubric_res.scalar_one_or_none()
    categories = rubric.categories if rubric else []

    # Fetch submission claims
    sub_stmt = select(Submission).where(Submission.team_id == eval_in.team_id)
    sub_res = await db.execute(sub_stmt)
    submission = sub_res.scalar_one_or_none()
    claims = submission.claims if submission else []

    guardrail_result = ScoringGuardrailService.evaluate_score_alignment(
        category_scores=eval_in.category_scores,
        rubric_categories=categories,
        claims=claims,
        justification=eval_in.justification
    )
    return guardrail_result

@router.post("/draft", response_model=EvaluationResponse)
async def save_draft_evaluation(
    eval_in: EvaluationCreate,
    current_user: User = Depends(require_role([UserRole.JUDGE, UserRole.ORGANIZER])),
    db: AsyncSession = Depends(get_db)
):
    # Check if existing evaluation exists for this judge & team
    stmt = select(Evaluation).where(
        Evaluation.team_id == eval_in.team_id,
        Evaluation.judge_id == current_user.id
    )
    res = await db.execute(stmt)
    evaluation = res.scalar_one_or_none()

    final_score = sum(eval_in.category_scores.values())

    if evaluation:
        if evaluation.status == EvaluationStatus.SUBMITTED:
            raise HTTPException(status_code=400, detail="Cannot edit an evaluation that has already been anchored to the blockchain.")
        evaluation.category_scores = eval_in.category_scores
        evaluation.final_score = final_score
        evaluation.category_comments = eval_in.category_comments
        evaluation.overall_feedback = eval_in.overall_feedback
        evaluation.justification = eval_in.justification
    else:
        evaluation = Evaluation(
            hackathon_id=eval_in.hackathon_id,
            team_id=eval_in.team_id,
            judge_id=current_user.id,
            rubric_version=eval_in.rubric_version,
            category_scores=eval_in.category_scores,
            final_score=final_score,
            category_comments=eval_in.category_comments,
            overall_feedback=eval_in.overall_feedback,
            justification=eval_in.justification,
            status=EvaluationStatus.DRAFT
        )
        db.add(evaluation)

    await db.commit()
    await db.refresh(evaluation)
    return evaluation

@router.post("/submit", response_model=EvaluationResponse)
async def submit_and_anchor_evaluation(
    eval_in: EvaluationCreate,
    current_user: User = Depends(require_role([UserRole.JUDGE, UserRole.ORGANIZER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Finalizes evaluation, runs guardrail check, generates canonical record,
    and anchors keccak256 hash to blockchain.
    """
    # 1. Fetch rubric & submission claims for guardrail check
    rubric_stmt = select(Rubric).where(
        Rubric.hackathon_id == eval_in.hackathon_id,
        Rubric.version == eval_in.rubric_version
    )
    rubric_res = await db.execute(rubric_stmt)
    rubric = rubric_res.scalar_one_or_none()
    categories = rubric.categories if rubric else []

    sub_stmt = select(Submission).where(Submission.team_id == eval_in.team_id)
    sub_res = await db.execute(sub_stmt)
    submission = sub_res.scalar_one_or_none()
    claims = submission.claims if submission else []

    # 2. Run Guardrail
    guardrail = ScoringGuardrailService.evaluate_score_alignment(
        category_scores=eval_in.category_scores,
        rubric_categories=categories,
        claims=claims,
        justification=eval_in.justification
    )

    if guardrail["requires_justification"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Score requires justification before final submission.",
                "reasons": guardrail["reasons"],
                "suggested_questions": guardrail["suggested_questions"],
                "discrepant_categories": guardrail["discrepant_categories"]
            }
        )

    # 3. Find or create evaluation record
    eval_stmt = select(Evaluation).where(
        Evaluation.team_id == eval_in.team_id,
        Evaluation.judge_id == current_user.id
    )
    eval_res = await db.execute(eval_stmt)
    evaluation = eval_res.scalar_one_or_none()

    final_score = sum(eval_in.category_scores.values())
    now = datetime.utcnow()
    now_iso = now.isoformat() + "Z"

    justification_hash = sha256_hex(eval_in.justification or "")
    evidence_bundle_hash = submission.evidence_bundle_hash if submission and submission.evidence_bundle_hash else sha256_hex("empty")

    if not evaluation:
        evaluation = Evaluation(
            hackathon_id=eval_in.hackathon_id,
            team_id=eval_in.team_id,
            judge_id=current_user.id,
            rubric_version=eval_in.rubric_version,
            category_scores=eval_in.category_scores,
            final_score=final_score,
            category_comments=eval_in.category_comments,
            overall_feedback=eval_in.overall_feedback,
            justification=eval_in.justification,
            justification_hash=justification_hash,
            evidence_bundle_hash=evidence_bundle_hash,
            created_at=now
        )
        db.add(evaluation)
        await db.flush()
    else:
        if evaluation.status == EvaluationStatus.SUBMITTED:
            raise HTTPException(status_code=400, detail="Evaluation is already finalized and anchored on blockchain.")
        evaluation.category_scores = eval_in.category_scores
        evaluation.final_score = final_score
        evaluation.category_comments = eval_in.category_comments
        evaluation.overall_feedback = eval_in.overall_feedback
        evaluation.justification = eval_in.justification
        evaluation.justification_hash = justification_hash
        evaluation.evidence_bundle_hash = evidence_bundle_hash

    # 4. Generate canonical evaluation dictionary and compute keccak256
    canonical_payload = create_canonical_evaluation_payload(
        hackathon_id=eval_in.hackathon_id,
        team_id=eval_in.team_id,
        judge_id=current_user.id,
        rubric_version=eval_in.rubric_version,
        final_score=final_score,
        category_scores=eval_in.category_scores,
        justification_hash=justification_hash,
        evidence_bundle_hash=evidence_bundle_hash,
        timestamp=evaluation.created_at.isoformat() + "Z"
    )
    canonical_hash = compute_canonical_evaluation_hash(canonical_payload)
    evaluation.canonical_hash = canonical_hash
    evaluation.status = EvaluationStatus.SUBMITTED

    # 5. Anchor to Blockchain
    anchor_result = await BlockchainService.anchor_evaluation(
        evaluation_id=evaluation.id,
        evaluation_hash=canonical_hash
    )

    # 6. Save BlockchainRecord
    bc_record = BlockchainRecord(
        evaluation_id=evaluation.id,
        network=anchor_result["network"],
        tx_hash=anchor_result["tx_hash"],
        block_number=anchor_result["block_number"],
        evaluation_hash=canonical_hash,
        status="ANCHORED",
        explorer_url=anchor_result.get("explorer_url")
    )
    db.add(bc_record)

    # 7. Make Rubric immutable
    if rubric:
        rubric.is_immutable = True

    # 8. Log Audit event
    await AuditService.log_event(
        db=db,
        entity_type="EVALUATION",
        entity_id=evaluation.id,
        action="EVALUATION_FINALIZED_AND_ANCHORED",
        actor_id=current_user.id,
        actor_role=current_user.role.value,
        actor_name=current_user.full_name,
        details={
            "final_score": final_score,
            "canonical_hash": canonical_hash,
            "tx_hash": anchor_result["tx_hash"]
        }
    )

    await db.commit()
    await db.refresh(evaluation)
    return evaluation
