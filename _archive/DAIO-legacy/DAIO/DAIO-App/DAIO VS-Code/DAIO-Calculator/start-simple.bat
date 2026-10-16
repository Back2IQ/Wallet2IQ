@echo off
title DAIO Value Explorer Starter
cd /d "%~dp0"

echo ========================================
echo   DAIO Value Explorer Starter
echo ========================================
echo.

echo Checking Node.js...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found successfully.

if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo Dependencies installed.
) else (
    echo Dependencies already installed.
)

echo.
echo Starting DAIO Value Explorer...
echo App will be available at: http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

npm run dev