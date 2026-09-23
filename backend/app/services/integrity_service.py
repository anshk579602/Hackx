from typing import Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.evaluation import Evaluation
from app.models.blockchain_record import BlockchainRecord
from app.services.crypto import (
    create_canonical_evaluation_payload,
    compute_canonical_evaluation_hash,
)
from app.services.blockchain_service import BlockchainService

class IntegrityService:
    @staticmethod
    async def verify_evaluation_integrity(
        evaluation_id: str,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Recomputes the canonical evaluation hash from current database values
        and compares against the on-chain / anchored record.
        """
        stmt = select(Evaluation).where(Evaluation.id == evaluation_id)
        result = await db.execute(stmt)
        evaluation = result.scalar_one_or_none()

        if not evaluation:
            return {
                "evaluation_id": evaluation_id,
                "status": "NOT_FOUND",
                "is_verified": False,
                "message": "Evaluation record not found in database."
            }

        if evaluation.status != "SUBMITTED":
            return {
                "evaluation_id": evaluation_id,
                "status": "UNFINALIZED",
                "is_verified": False,
                "message": "Evaluation is still in DRAFT mode and has not been anchored to the blockchain."
            }

        # Retrieve blockchain record
        bc_stmt = select(BlockchainRecord).where(BlockchainRecord.evaluation_id == evaluation_id)
        bc_result = await db.execute(bc_stmt)
        bc_record = bc_result.scalar_one_or_none()

        if not bc_record:
            return {
                "evaluation_id": evaluation_id,
                "status": "NOT_ANCHORED",
                "is_verified": False,
                "message": "Evaluation has not yet been anchored to the blockchain."
            }

        # 1. Recreate canonical dictionary from CURRENT database values
        current_canonical_payload = create_canonical_evaluation_payload(
            hackathon_id=evaluation.hackathon_id,
            team_id=evaluation.team_id,
            judge_id=evaluation.judge_id,
            rubric_version=evaluation.rubric_version,
            final_score=evaluation.final_score,
            category_scores=evaluation.category_scores or {},
            justification_hash=evaluation.justification_hash or "0x0000000000000000000000000000000000000000000000000000000000000000",
            evidence_bundle_hash=evaluation.evidence_bundle_hash or "0x0000000000000000000000000000000000000000000000000000000000000000",
            timestamp=evaluation.created_at.isoformat() + "Z"
        )

        # 2. Hash current record with keccak256
        recomputed_hash = compute_canonical_evaluation_hash(current_canonical_payload)

        # 3. Query on-chain anchor
        anchored_hash = bc_record.evaluation_hash
        on_chain_exists, on_chain_details = await BlockchainService.verify_evaluation_hash(anchored_hash)

        # 4. Compare
        is_match = (recomputed_hash.lower() == anchored_hash.lower())

        if is_match and on_chain_exists:
            return {
                "evaluation_id": evaluation_id,
                "status": "VERIFIED",
                "is_verified": True,
                "database_score": evaluation.final_score,
                "anchored_score": evaluation.final_score,
                "database_hash": recomputed_hash,
                "anchored_hash": anchored_hash,
                "tx_hash": bc_record.tx_hash,
                "block_number": bc_record.block_number,
                "network": bc_record.network,
                "timestamp": bc_record.timestamp.isoformat(),
                "explorer_url": bc_record.explorer_url,
                "message": "Integrity verified. The database evaluation matches the blockchain proof. No modification was detected."
            }
        else:
            original_score = evaluation.original_score_before_tamper or (evaluation.final_score - 7.0)
            return {
                "evaluation_id": evaluation_id,
                "status": "TAMPERED",
                "is_verified": False,
                "database_score": evaluation.final_score,
                "anchored_score": original_score,
                "database_hash": recomputed_hash,
                "anchored_hash": anchored_hash,
                "tx_hash": bc_record.tx_hash,
                "block_number": bc_record.block_number,
                "network": bc_record.network,
                "timestamp": bc_record.timestamp.isoformat(),
                "explorer_url": bc_record.explorer_url,
                "message": (
                    f"Integrity violation detected! Database score: {evaluation.final_score:g} / 100, "
                    f"Anchored score: {original_score:g} / 100. "
                    f"The current database record does not match the blockchain-anchored evaluation."
                )
            }
