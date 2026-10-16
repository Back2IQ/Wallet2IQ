@echo off
setlocal
echo ===================================================
echo   DAIO Wallet - Decentralized Inheritance
echo ===================================================
echo.

echo [1/3] Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please download it from https://nodejs.org/
    pause
    exit /b
)

if not exist node_modules (
    echo [2/3] First-time setup: Installing dependencies...
    echo This may take a few minutes...
    call npm install
) else (
    echo [2/3] Dependencies already installed.
)

echo.
echo [3/3] Launching Development Servers...
echo Opening Metro (App) and Express (Server) concurrently...
echo.

set EXPO_PORT=8082
npx concurrently -k "npm run dev:server" "npm run dev:metro"

pause
