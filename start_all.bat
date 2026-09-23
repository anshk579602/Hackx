@echo off
echo ============================================================
echo   HackJudge (VeriJudge AI) - Launching Full Platform
echo ============================================================
echo Starting Backend on http://localhost:8000 ...
start "HackJudge Backend" cmd /c "call run_backend.bat"

echo Starting Frontend on http://localhost:3000 ...
start "HackJudge Frontend" cmd /c "call run_frontend.bat"

echo.
echo Both servers are launching.
echo Backend Swagger API: http://localhost:8000/docs
echo Frontend Portal:     http://localhost:3000
echo ============================================================
