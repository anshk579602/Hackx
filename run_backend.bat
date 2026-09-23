@echo off
echo ============================================================
echo   HackJudge (VeriJudge AI) - Starting FastAPI Backend Server
echo ============================================================
cd backend
python -m uvicorn app.main:app --reload --port 8000
pause
