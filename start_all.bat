@echo off
echo 
echo   HackX - Launching Full Platform
echo
echo Starting Backend on http://localhost:8000 ...
start "HackX Backend" cmd /c "call run_backend.bat"

echo Starting Frontend on http://localhost:3000 ...
start "HackX Frontend" cmd /c "call run_frontend.bat"

echo.
echo Both servers are launching. Please wait a few seconds...
echo.
echo Backend API Docs: http://localhost:8000/docs
echo Frontend Portal: http://localhost:3000
echo 
pause
