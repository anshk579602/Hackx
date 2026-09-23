from pydantic import BaseModel
from typing import Optional, Dict, Any

class AnchorRequest(BaseModel):
    evaluation_id: str

class AnchorResponse(BaseModel):
    success: bool
    evaluation_id: str
    network: str
    tx_hash: str
    block_number: int
    evaluation_hash: str
    timestamp: str
    explorer_url: Optional[str] = None
    integrity_status: str = "Verified"

class VerifyRequest(BaseModel):
    evaluation_hash: str

class VerifyResponse(BaseModel):
    is_valid: bool
    status: str
    evaluation_id: Optional[str] = None
    stored_hash: Optional[str] = None
    anchored_hash: Optional[str] = None
    message: str
    details: Optional[Dict[str, Any]] = None
