from sqlalchemy import Column, String, DateTime, Text, JSON
from datetime import datetime
import uuid
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type = Column(String(50), nullable=False)  # SUBMISSION, EVALUATION, RUBRIC, HACKATHON, TAMPER_SIMULATION
    entity_id = Column(String(36), nullable=False)
    actor_id = Column(String(36), nullable=True)
    actor_role = Column(String(50), nullable=True)     # PARTICIPANT, JUDGE, ORGANIZER, AI_AGENT, BLOCKCHAIN_SERVICE
    actor_name = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)      # SUBMISSION_CREATED, AI_ANALYSIS_COMPLETED, SCORE_SUBMITTED, etc.
    details = Column(JSON, default=dict)
    ip_address = Column(String(45), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow)
