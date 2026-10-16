@echo off
title DAIO Value Explorer - One-Click Starter
color 0A
cd /d "%~dp0"

echo ========================================
echo   DAIO Value Explorer - One-Click Start
echo ========================================
echo.

echo Checking system requirements...
echo.

REM Check if Node.js is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js/npm not found!
    echo Please install Node.js from: https://nodejs.org/
    echo.
    echo Press any key to download Node.js...
    pause >nul
    start "" "https://nodejs.org/"
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies (this may take a few minutes)...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies!
        echo Please check your internet connection and try again.
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
    echo.
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🚀 Starting DAIO Value Explorer...
echo.
echo The application will automatically open in your browser at:
echo http://localhost:3001
echo.
echo To stop the application, close this window or press Ctrl+C
echo.

REM Wait a moment for user to read the message
timeout /t 3 /nobreak >nul

REM Start the development server in background
start "" cmd /c "npm run dev ^&^& pause"

REM Wait for server to start
timeout /t 5 /nobreak >nul

REM Open browser automatically
echo Opening browser...
start "" "http://localhost:3001"

echo.
echo ========================================
echo Application is now running!
echo ========================================
echo.
echo Keep this window open while using the application.
echo Close this window to stop the server.
echo.

REM Keep window open
pause >nul