from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

class SubmissionStatus:
    SUBMITTED = "SUBMITTED"
    EXTRACTING = "EXTRACTING"
    CLAIMS_IDENTIFIED = "CLAIMS_IDENTIFIED"
    VERIFYING = "VERIFYING"
    READY = "READY"

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = Column(String(36), ForeignKey("teams.id"), unique=True, nullable=False)
    project_title = Column(String(255), nullable=False)
    problem_statement = Column(Text, nullable=False)
    project_description = Column(Text, nullable=False)
    github_url = Column(String(512), nullable=True)
    live_demo_url = Column(String(512), nullable=True)
    ppt_url = Column(String(512), nullable=True)
    architecture_url = Column(String(512), nullable=True)
    screenshots = Column(JSON, default=list)        # list of image URLs/paths
    demo_video_url = Column(String(512), nullable=True)
    tech_stack = Column(JSON, default=list)         # list of strings e.g. ["Next.js", "FastAPI", "PyTorch"]
    raw_claims = Column(JSON, default=list)         # list of submitted claims strings
    
    # AI Analysis & Status Pipeline
    ai_analysis_status = Column(String(50), default=SubmissionStatus.SUBMITTED)
    ai_status_message = Column(String(255), default="Submission received. Queued for AI analysis.")
    project_summary = Column(Text, nullable=True)
    evidence_bundle_hash = Column(String(66), nullable=True) # SHA-256 of claims & verification
    
    submitted_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    team = relationship("Team", back_populates="submission")
    claims = relationship("Claim", back_populates="submission", cascade="all, delete-orphan", lazy="selectin")
