from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.database import Base

class ClaimStatus(str, enum.Enum):
    SUPPORTED = "Supported"
    PARTIALLY_SUPPORTED = "Partially Supported"
    UNSUPPORTED = "Unsupported"
    CONTRADICTED = "Contradicted"
    NEEDS_HUMAN_REVIEW = "Needs Human Review"

class Claim(Base):
    __tablename__ = "claims"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(String(36), ForeignKey("submissions.id"), nullable=False)
    claim_text = Column(Text, nullable=False)
    subclaims = Column(JSON, default=list)  # list of split subclaims
    category = Column(String(100), default="Technical Quality")  # Associated rubric category
    status = Column(String(50), default=ClaimStatus.NEEDS_HUMAN_REVIEW)
    confidence = Column(Integer, default=75)  # 0 to 100
    reasoning = Column(Text, nullable=True)
    evidence = Column(JSON, default=list)
    # Evidence item structure:
    # [
    #   {
    #     "source_type": "GitHub README" | "Repository Code" | "Architecture Diagram" | "Demo Video",
    #     "source_name": "Project repository",
    #     "url": "https://github.com/...",
    #     "excerpt": "No load-testing benchmark found.",
    #     "stance": "supporting" | "neutral" | "contradicting"
    #   }
    # ]
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="claims")
