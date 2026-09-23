from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

class BlockchainRecord(Base):
    __tablename__ = "blockchain_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    evaluation_id = Column(String(36), ForeignKey("evaluations.id"), unique=True, nullable=False)
    network = Column(String(100), default="Polygon Amoy (Testnet)")
    tx_hash = Column(String(66), nullable=False)
    block_number = Column(Integer, default=14982312)
    evaluation_hash = Column(String(66), nullable=False)  # keccak256 anchored
    anchored_by_address = Column(String(42), default="0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
    status = Column(String(20), default="ANCHORED")        # ANCHORED, PENDING, FAILED
    explorer_url = Column(String(512), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    evaluation = relationship("Evaluation", back_populates="blockchain_record")
