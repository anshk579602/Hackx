from sqlalchemy import Column, String, DateTime, Float, Text, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

class EvaluationStatus:
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hackathon_id = Column(String(36), ForeignKey("hackathons.id"), nullable=False)
    team_id = Column(String(36), ForeignKey("teams.id"), nullable=False)
    judge_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    rubric_version = Column(String(20), nullable=False)  # e.g., 'v1.2'
    
    # Scores
    category_scores = Column(JSON, default=dict)   # {"Innovation": 22, "Technical Quality": 24, ...}
    final_score = Column(Float, nullable=False, default=0.0)
    category_comments = Column(JSON, default=dict) # {"Innovation": "Good novelty", ...}
    overall_feedback = Column(Text, nullable=True)
    
    # Justification & Guardrails
    justification = Column(Text, nullable=True)
    justification_hash = Column(String(66), nullable=True) # SHA-256 hash of justification
    evidence_bundle_hash = Column(String(66), nullable=True) # SHA-256 hash of claims evidence bundle
    canonical_hash = Column(String(66), nullable=True) # keccak256 hash anchored to blockchain
    
    # Status and audit
    status = Column(String(20), default=EvaluationStatus.DRAFT)
    is_tampered_demo = Column(Boolean, default=False) # For local demo tampering simulation
    original_score_before_tamper = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    judge = relationship("User", lazy="selectin")
    team = relationship("Team", lazy="selectin")
    blockchain_record = relationship("BlockchainRecord", back_populates="evaluation", uselist=False, lazy="selectin")
