@echo off
title Back2IQ - Ahead by Design - DAIO Value Explorer
color 0A
cd /d "%~dp0"

echo ========================================
echo   Back2IQ - Ahead by Design
echo   DAIO Value Explorer Starter
echo ========================================
echo.

echo Checking prerequisites...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js/npm not found!
    echo Please install Node.js from: https://nodejs.org/
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo ✅ Node.js found

if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Dependency installation failed!
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🚀 Starting DAIO Value Explorer...
echo The app will be available at: http://localhost:3001
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

call npm run dev

echo.
echo Server stopped. Press any key to close...
pause >nul