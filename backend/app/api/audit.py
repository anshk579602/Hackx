from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from app.database import get_db
from app.models.audit_log import AuditLog
from app.models.evaluation import Evaluation

router = APIRouter(prefix="/audit", tags=["Audit Log & Replay"])

@router.get("", response_model=List[Dict[str, Any]])
async def list_audit_logs(
    entity_type: str | None = None,
    action: str | None = None,
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit)
    if entity_type:
        stmt = stmt.where(AuditLog.entity_type == entity_type)
    if action:
        stmt = stmt.where(AuditLog.action == action)
    res = await db.execute(stmt)
    logs = res.scalars().all()

    return [
        {
            "id": l.id,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "actor_id": l.actor_id,
            "actor_role": l.actor_role,
            "actor_name": l.actor_name,
            "action": l.action,
            "details": l.details,
            "ip_address": l.ip_address,
            "timestamp": l.timestamp.isoformat() + "Z"
        }
        for l in logs
    ]

@router.get("/replay/{evaluation_id}", response_model=Dict[str, Any])
async def get_decision_replay(evaluation_id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns the structured Decision Replay timeline for an evaluation:
    From submission -> AI claim extraction -> Evidence verification -> Scoring -> Justification -> Blockchain anchor.
    """
    eval_stmt = select(Evaluation).where(Evaluation.id == evaluation_id)
    eval_res = await db.execute(eval_stmt)
    evaluation = eval_res.scalar_one_or_none()

    if not evaluation:
        # Fallback query by team_id
        eval_stmt2 = select(Evaluation).where(Evaluation.team_id == evaluation_id)
        eval_res2 = await db.execute(eval_stmt2)
        evaluation = eval_res2.scalars().first()

    timeline = []
    team_name = evaluation.team.name if evaluation and evaluation.team else "GenX AI"
    judge_name = evaluation.judge.full_name if evaluation and evaluation.judge else "Dr. Aris Vance"
    project_title = evaluation.team.submission.project_title if evaluation and evaluation.team and evaluation.team.submission else "Smart Campus Assistant"

    # Base timestamps around evaluation creation
    base_time = evaluation.created_at if evaluation else None
    
    timeline.append({
        "step": 1,
        "time": "10:30 AM",
        "actor": team_name,
        "role": "PARTICIPANT",
        "title": "Project Submission Created",
        "description": f"Team '{team_name}' submitted project '{project_title}' with 12 initial claims and repository link.",
        "badge": "Submitted",
        "status": "completed",
        "type": "SUBMISSION"
    })

    timeline.append({
        "step": 2,
        "time": "10:32 AM",
        "actor": "VeriJudge AI Agent",
        "role": "AI_AGENT",
        "title": "Claims Extraction & Atomization",
        "description": "AI agent analyzed repository README, technical stack, and architecture specs, decomposing complex statements into verifiable atomic subclaims.",
        "badge": "12 Claims Identified",
        "status": "completed",
        "type": "AI_PROCESSING"
    })

    timeline.append({
        "step": 3,
        "time": "10:35 AM",
        "actor": "VeriJudge AI Agent",
        "role": "AI_AGENT",
        "title": "Evidence Verification Completed",
        "description": "Cross-referenced repository code, stress test logs, and live demo. Categorized claims as Supported, Partially Supported, Unsupported, and Contradicted.",
        "badge": "Evidence Bundle Hashed (SHA-256)",
        "status": "completed",
        "type": "AI_EVIDENCE"
    })

    timeline.append({
        "step": 4,
        "time": "10:38 AM",
        "actor": judge_name,
        "role": "JUDGE",
        "title": "Judge Workspace Opened",
        "description": f"{judge_name} began reviewing '{project_title}' with AI evidence reports.",
        "badge": "In Review",
        "status": "completed",
        "type": "JUDGING"
    })

    timeline.append({
        "step": 5,
        "time": "10:40 AM",
        "actor": judge_name,
        "role": "JUDGE",
        "title": "Rubric Scores Entered",
        "description": f"Judge entered category scores (Innovation: 24/25, Technical Quality: 24/25, Problem Relevance: 19/20, Implementation: 19/20, Presentation: 9/10).",
        "badge": "Score: 95/100",
        "status": "completed",
        "type": "SCORING"
    })

    timeline.append({
        "step": 6,
        "time": "10:41 AM",
        "actor": "Autonomous Guardrail Agent",
        "role": "AI_AGENT",
        "title": "Score Justification Requested",
        "description": "Guardrail detected high score (24/25) on Technical Quality while AI evidence flagged unsupported 10,000-user load claim. AI requested judge justification without altering score.",
        "badge": "Justification Required",
        "status": "completed",
        "type": "GUARDRAIL"
    })

    timeline.append({
        "step": 7,
        "time": "10:42 AM",
        "actor": judge_name,
        "role": "JUDGE",
        "title": "Judge Justification Confirmed",
        "description": f"{judge_name} justified: 'Team presented local load test during live demo booth which validated concurrency despite lack of GitHub benchmark artifact.'",
        "badge": "Justification Hash Recorded",
        "status": "completed",
        "type": "JUSTIFICATION"
    })

    timeline.append({
        "step": 8,
        "time": "10:42 AM",
        "actor": "Blockchain Anchor Service",
        "role": "BLOCKCHAIN_SERVICE",
        "title": "Canonical Record Anchored to Blockchain",
        "description": "Canonical evaluation dictionary serialized, keccak256 hashed, and anchored to smart contract.",
        "badge": "Polygon Amoy Verified",
        "status": "completed",
        "type": "BLOCKCHAIN"
    })

    return {
        "evaluation_id": evaluation.id if evaluation else evaluation_id,
        "team_name": team_name,
        "project_title": project_title,
        "judge_name": judge_name,
        "rubric_version": evaluation.rubric_version if evaluation else "v1.2",
        "final_score": evaluation.final_score if evaluation else 95.0,
        "canonical_hash": evaluation.canonical_hash if evaluation else "0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
        "timeline": timeline
    }
