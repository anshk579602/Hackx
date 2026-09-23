@echo off
echo Starting Hackx backend...
cd backend
python -m uvicorn app.main:app --reload
pause
