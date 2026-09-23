from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class EvidenceItem(BaseModel):
    source_type: str
    source_name: str
    url: Optional[str] = None
    excerpt: str
    stance: str  # "supporting", "neutral", "contradicting"

class ClaimBase(BaseModel):
    claim_text: str
    subclaims: List[str] = []
    category: str = "Technical Quality"
    status: str = "Needs Human Review"  # Supported, Partially Supported, Unsupported, Contradicted, Needs Human Review
    confidence: int = 75
    reasoning: Optional[str] = None
    evidence: List[Dict[str, Any]] = []

class ClaimCreate(ClaimBase):
    pass

class ClaimResponse(ClaimBase):
    id: str
    submission_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
