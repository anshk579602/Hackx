from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.schemas.user import UserResponse

class TeamMemberResponse(BaseModel):
    id: str
    team_id: str
    user_id: str
    role_in_team: str
    joined_at: datetime
    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)

class TeamBase(BaseModel):
    name: str
    hackathon_id: str

class TeamMemberInput(BaseModel):
    full_name: str
    email: str
    role_in_team: str = "Member"

class TeamCreate(TeamBase):
    members: Optional[List[TeamMemberInput]] = None

class TeamJoin(BaseModel):
    join_code: str

class TeamResponse(TeamBase):
    id: str
    join_code: str
    created_at: datetime
    members: List[TeamMemberResponse] = []

    model_config = ConfigDict(from_attributes=True)
