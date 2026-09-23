from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class JudgeScoreItem(BaseModel):
    judge_id: str
    judge_name: str
    final_score: float
    category_scores: Dict[str, float]

class AnomalyFlag(BaseModel):
    team_id: str
    team_name: str
    project_title: str
    category: str
    outlier_judge_id: str
    outlier_judge_name: str
    judge_score: float
    other_judges_average: float
    deviation: float
    recommendation: str

class TeamScoreStats(BaseModel):
    team_id: str
    team_name: str
    project_title: str
    evaluation_count: int
    mean_score: float
    median_score: float
    std_deviation: float
    category_averages: Dict[str, float]
    scores_by_judge: List[JudgeScoreItem]
    has_anomaly: bool
    anomaly_details: List[AnomalyFlag] = []
    integrity_status: str  # "VERIFIED", "TAMPERED", "PENDING"
