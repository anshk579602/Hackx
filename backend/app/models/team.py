from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hackathon_id = Column(String(36), ForeignKey("hackathons.id"), nullable=False)
    name = Column(String(255), nullable=False)
    join_code = Column(String(20), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan", lazy="selectin")
    submission = relationship("Submission", back_populates="team", uselist=False, lazy="selectin")

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = Column(String(36), ForeignKey("teams.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    role_in_team = Column(String(100), default="Contributor")  # Lead, Developer, Designer, ML Engineer
    joined_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="members")
    user = relationship("User", lazy="selectin")
