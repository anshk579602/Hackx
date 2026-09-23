from pydantic import BaseModel, ConfigDict
from typing import Dict, Optional, List
from datetime import datetime
from app.schemas.user import UserResponse
from app.schemas.team import TeamResponse

class BlockchainRecordResponse(BaseModel):
    id: str
    network: str
    tx_hash: str
    block_number: int
    evaluation_hash: str
    anchored_by_address: str
    status: str
    explorer_url: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class EvaluationBase(BaseModel):
    hackathon_id: str
    team_id: str
    rubric_version: str
    category_scores: Dict[str, float]
    category_comments: Dict[str, str] = {}
    overall_feedback: Optional[str] = None
    justification: Optional[str] = None

class EvaluationCreate(EvaluationBase):
    pass

class EvaluationGuardrailCheck(BaseModel):
    requires_justification: bool
    reasons: List[str]
    suggested_questions: List[str]
    discrepant_categories: List[str]

class EvaluationResponse(EvaluationBase):
    id: str
    judge_id: str
    final_score: float
    justification_hash: Optional[str] = None
    evidence_bundle_hash: Optional[str] = None
    canonical_hash: Optional[str] = None
    status: str
    is_tampered_demo: bool
    original_score_before_tamper: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    judge: Optional[UserResponse] = None
    team: Optional[TeamResponse] = None
    blockchain_record: Optional[BlockchainRecordResponse] = None

    model_config = ConfigDict(from_attributes=True)
