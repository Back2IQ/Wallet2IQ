@echo off
title DAIO BTC Loss Ticker - Back2IQ
color 0A
cd /d "%~dp0"

echo ==========================================
echo   Back2IQ - Ahead by Design
echo   DAIO Global BTC Loss Ticker
echo   http://localhost:3000
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
    echo.
)

echo [START] Launching BTC Loss Ticker on http://localhost:3000 ...
echo.

REM Open browser after 3 seconds
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

REM Start dev server
call npx vite --port 3000
