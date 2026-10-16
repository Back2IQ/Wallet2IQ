@echo off
title Back2IQ Strategic Platform
echo ========================================
echo   Back2IQ - Ahead by Design
echo   Strategic Platform Starter
echo ========================================
echo.

echo Starting development server...
echo Port: 3004
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
npm run dev

pause