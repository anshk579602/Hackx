from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from app.database import get_db
from app.models.team import Team
from app.models.evaluation import Evaluation
from app.schemas.anomaly import TeamScoreStats
from app.services.anomaly_service import AnomalyService
from app.services.integrity_service import IntegrityService

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])

@router.get("", response_model=Dict[str, Any])
async def get_anomaly_dashboard(hackathon_id: str | None = None, db: AsyncSession = Depends(get_db)):
    teams_stmt = select(Team)
    if hackathon_id:
        teams_stmt = teams_stmt.where(Team.hackathon_id == hackathon_id)
    teams_res = await db.execute(teams_stmt)
    teams = teams_res.scalars().all()

    team_stats_list = []
    total_anomalies_count = 0

    for team in teams:
        eval_stmt = select(Evaluation).where(
            Evaluation.team_id == team.id,
            Evaluation.status == "SUBMITTED"
        )
        eval_res = await db.execute(eval_stmt)
        evaluations = eval_res.scalars().all()

        stats = AnomalyService.calculate_stats(evaluations)
        
        # Check integrity status for the team
        integrity_status = "VERIFIED"
        for e in evaluations:
            v = await IntegrityService.verify_evaluation_integrity(e.id, db)
            if not v.get("is_verified", False):
                integrity_status = "TAMPERED"
                break

        if stats["has_anomaly"]:
            total_anomalies_count += 1

        project_title = team.submission.project_title if team.submission else "No submission"

        team_stats_list.append({
            "team_id": team.id,
            "team_name": team.name,
            "project_title": project_title,
            "evaluation_count": stats["evaluation_count"],
            "mean_score": stats["mean_score"],
            "median_score": stats["median_score"],
            "std_deviation": stats["std_deviation"],
            "category_averages": stats["category_averages"],
            "scores_by_judge": stats["scores_by_judge"],
            "has_anomaly": stats["has_anomaly"],
            "anomaly_details": stats["anomaly_details"],
            "integrity_status": integrity_status
        })

    return {
        "total_teams": len(teams),
        "teams_with_anomalies": total_anomalies_count,
        "team_statistics": team_stats_list,
        "summary_recommendation": (
            f"Cross-judge anomaly analysis detected {total_anomalies_count} team(s) with divergent scoring. "
            "Organizers can review individual category justifications and evidence links before finalizing results."
        ) if total_anomalies_count > 0 else "All evaluations are within normal standard deviation limits."
    }
