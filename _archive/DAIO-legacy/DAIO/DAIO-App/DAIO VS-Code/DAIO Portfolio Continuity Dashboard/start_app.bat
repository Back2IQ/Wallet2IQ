@echo off
echo Starting DAIO Platform on localhost:3003...
echo Please make sure Node.js and npm are installed on your system.
echo.

REM Install dependencies if not already installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Start the Vite development server on port 3003
npm run dev:3003

pause