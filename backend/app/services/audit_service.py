from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit_log import AuditLog

class AuditService:
    @staticmethod
    async def log_event(
        db: AsyncSession,
        entity_type: str,
        entity_id: str,
        action: str,
        actor_id: Optional[str] = None,
        actor_role: Optional[str] = None,
        actor_name: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: str = "127.0.0.1"
    ) -> AuditLog:
        """
        Appends an immutable audit event to the audit trail.
        """
        log_entry = AuditLog(
            entity_type=entity_type,
            entity_id=entity_id,
            actor_id=actor_id,
            actor_role=actor_role,
            actor_name=actor_name,
            action=action,
            details=details or {},
            ip_address=ip_address
        )
        db.add(log_entry)
        await db.flush()
        return log_entry
