from sqlalchemy import Column, String, DateTime, Boolean, Enum
from datetime import datetime
import uuid
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    ORGANIZER = "ORGANIZER"
    JUDGE = "JUDGE"
    PARTICIPANT = "PARTICIPANT"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.PARTICIPANT, nullable=False)
    organization = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
