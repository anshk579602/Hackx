from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.hackathons import router as hackathons_router
from app.api.rubrics import router as rubrics_router
from app.api.teams import router as teams_router
from app.api.submissions import router as submissions_router
from app.api.evaluations import router as evaluations_router
from app.api.ai_evidence import router as ai_evidence_router
from app.api.anomalies import router as anomalies_router
from app.api.integrity import router as integrity_router
from app.api.audit import router as audit_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(hackathons_router)
api_router.include_router(rubrics_router)
api_router.include_router(teams_router)
api_router.include_router(submissions_router)
api_router.include_router(evaluations_router)
api_router.include_router(ai_evidence_router)
api_router.include_router(anomalies_router)
api_router.include_router(integrity_router)
api_router.include_router(audit_router)
