from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.schemas.claim import ClaimResponse

class SubmissionBase(BaseModel):
    project_title: str
    problem_statement: str
    project_description: str
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    ppt_url: Optional[str] = None
    architecture_url: Optional[str] = None
    screenshots: List[str] = []
    demo_video_url: Optional[str] = None
    tech_stack: List[str] = []
    raw_claims: List[str] = []

class SubmissionCreate(SubmissionBase):
    team_id: str

class SubmissionResponse(SubmissionBase):
    id: str
    team_id: str
    ai_analysis_status: str
    ai_status_message: Optional[str] = None
    project_summary: Optional[str] = None
    evidence_bundle_hash: Optional[str] = None
    submitted_at: datetime
    updated_at: datetime
    claims: List[ClaimResponse] = []

    model_config = ConfigDict(from_attributes=True)
