from sqlalchemy import Column, String, DateTime, Boolean, Text
from datetime import datetime
import uuid
from app.database import Base

class Hackathon(Base):
    __tablename__ = "hackathons"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    tagline = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    is_published = Column(Boolean, default=False)  # Results published or not
    active_rubric_id = Column(String(36), nullable=True)
    status = Column(String(50), default="ACTIVE")  # UPCOMING, ACTIVE, EVALUATING, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)
