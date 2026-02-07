@echo off
REM Pre-commit hook for Windows to scan for secrets
REM Install: Copy to .git/hooks/pre-commit.bat

echo 🔍 Scanning for potential secrets...

REM Check for .env files being committed
git diff --cached --name-only | findstr /B "\.env" >nul
if %errorlevel% == 0 (
    echo ❌ ERROR: .env file(s) are staged for commit!
    echo    Remove with: git reset HEAD .env*
    exit /b 1
)

echo ✓ Basic checks passed
exit /b 0
