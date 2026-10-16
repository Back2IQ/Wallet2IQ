@echo off
title DAIO Commander - Back2IQ Ahead by Design
echo ================================
echo   DAIO COMMANDER
echo   Back2IQ - Ahead by Design
echo ================================
echo.

REM Check if node and npm are available
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js (version 18 or higher) from https://nodejs.org/
    echo.
    echo After installation, please run this script again.
    pause
    exit /b 1
)

for /f "tokens=1,2 delims=v." %%a in ('node --version') do (
    set major=%%b
)
if %major% LSS 18 (
    echo WARNING: Node.js version 18 or higher is recommended.
    echo Current version: %major%
    echo.
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version: 
node --version
echo npm version:
npm --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take a few minutes...
    npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies
        echo Please check your internet connection and try again
        echo.
        echo Alternative: Try running 'npm install' manually
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
) else (
    echo Dependencies already installed.
    echo.
)

echo Starting DAIO Commander...
echo.
echo The application will be available at: http://localhost:3010
echo Press CTRL+C to stop the application
echo.

REM Start the development server
npm run dev