from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.rubric import RubricResponse

class HackathonBase(BaseModel):
    title: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: str = "ACTIVE"

class HackathonCreate(HackathonBase):
    pass

class HackathonResponse(HackathonBase):
    id: str
    is_published: bool
    active_rubric_id: Optional[str] = None
    created_at: datetime
    active_rubric: Optional[RubricResponse] = None

    model_config = ConfigDict(from_attributes=True)
