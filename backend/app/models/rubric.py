from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

class Rubric(Base):
    __tablename__ = "rubrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hackathon_id = Column(String(36), ForeignKey("hackathons.id"), nullable=False)
    version = Column(String(20), nullable=False)  # e.g., 'v1.0', 'v1.1', 'v1.2'
    title = Column(String(255), default="Standard Evaluation Rubric")
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    is_immutable = Column(Boolean, default=False)  # Set to True once an evaluation is submitted using it
    created_at = Column(DateTime, default=datetime.utcnow)

    categories = relationship("RubricCategory", back_populates="rubric", cascade="all, delete-orphan", lazy="selectin")

class RubricCategory(Base):
    __tablename__ = "rubric_categories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    rubric_id = Column(String(36), ForeignKey("rubrics.id"), nullable=False)
    name = Column(String(100), nullable=False)  # e.g., 'Innovation', 'Technical Quality'
    max_score = Column(Float, nullable=False)    # e.g., 25.0
    weight = Column(Float, default=1.0)
    evaluation_criteria = Column(Text, nullable=False)
    ai_evidence_checklist = Column(JSON, default=list)  # List of criteria strings AI checks
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    rubric = relationship("Rubric", back_populates="categories")
