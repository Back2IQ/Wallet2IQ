@echo off
title DAIO Value Explorer - Dependency Fixer
color 0A
cd /d "%~dp0"

echo ========================================
echo   DAIO Value Explorer Dependency Fixer
echo ========================================
echo.

echo Running npm audit fix...
call npm audit fix

if %errorlevel% neq 0 (
    echo Some issues couldn't be fixed automatically.
    echo Running npm install to reinstall packages...
    call npm install
)

echo.
echo Dependency fixing completed. Press any key to close...
pause >nul