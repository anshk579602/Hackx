@echo off
echo ============================================================
echo   HackJudge (VeriJudge AI) - Full Verification Test Suite
echo ============================================================

echo [1/3] Running Backend Tests (pytest)...
cd backend
python -m pytest -v
if errorlevel 1 (
    echo [ERROR] Backend tests failed.
    exit /b 1
)
cd ..

echo.
echo [2/3] Running Smart Contract Tests (Hardhat)...
cd blockchain
call npx.cmd hardhat test
if errorlevel 1 (
    echo [ERROR] Blockchain tests failed.
    exit /b 1
)
cd ..

echo.
echo [3/3] Verifying Frontend Next.js Build...
cd frontend
call npm.cmd run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed.
    exit /b 1
)
cd ..

echo.
echo ============================================================
echo   ALL VERIFICATION SUITES PASSED CLEANLY!
echo ============================================================
