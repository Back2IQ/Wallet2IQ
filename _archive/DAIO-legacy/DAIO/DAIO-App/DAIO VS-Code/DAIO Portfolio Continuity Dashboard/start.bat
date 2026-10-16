@echo off
title DAIO Portfolio Continuity Dashboard - Back2IQ
color 0A
cd /d "%~dp0"

echo ==========================================
echo   Back2IQ - Ahead by Design
echo   DAIO Portfolio Continuity Dashboard
echo   Port: 3003
echo ==========================================
echo.

REM Check Node.js
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js/npm not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo [SETUP] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
    echo.
)

echo [START] Launching DAIO Portfolio Continuity Dashboard on http://localhost:3003 ...
echo.
echo Press Ctrl+C or close this window to stop the server.
echo.

REM Open browser after short delay
start "" cmd /c "timeout /t 3 /nobreak >nul && start "" http://localhost:3003"

REM Start dev server (blocks this window)
call npm run dev
