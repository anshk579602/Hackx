from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class RubricCategoryBase(BaseModel):
    name: str
    max_score: float
    weight: float = 1.0
    evaluation_criteria: str
    ai_evidence_checklist: List[str] = []
    is_active: bool = True
    order_index: int = 0

class RubricCategoryCreate(RubricCategoryBase):
    pass

class RubricCategoryResponse(RubricCategoryBase):
    id: str
    rubric_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RubricBase(BaseModel):
    hackathon_id: str
    version: str
    title: str = "Standard Evaluation Rubric"
    description: Optional[str] = None
    is_active: bool = True

class RubricCreate(RubricBase):
    categories: List[RubricCategoryCreate]

class RubricResponse(RubricBase):
    id: str
    is_immutable: bool
    created_at: datetime
    categories: List[RubricCategoryResponse] = []

    model_config = ConfigDict(from_attributes=True)
