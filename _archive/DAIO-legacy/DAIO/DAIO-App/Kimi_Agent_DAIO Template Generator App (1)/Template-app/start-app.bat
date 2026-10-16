@echo off
REM Back2IQ DAIO Value Explorer - One-Click Start Script
REM Windows Batch Script zum Starten der React/Vite App

title Back2IQ - Ahead by Design - DAIO Value Explorer

cls
echo ========================================
echo   Back2IQ - Ahead by Design
echo   DAIO Value Explorer
echo ========================================
echo.

REM Prüfe Node.js Installation
echo Prüfe Node.js Installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo FEHLER: Node.js ist nicht installiert!
    echo Bitte installiere Node.js von: https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    for /f %%i in ('node --version') do set NODE_VERSION=%%i
    echo Node.js Version: %NODE_VERSION%
)

REM Prüfe npm Installation
echo Prüfe npm Installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo FEHLER: npm ist nicht verfügbar!
    echo.
    pause
    exit /b 1
) else (
    for /f %%i in ('npm --version') do set NPM_VERSION=%%i
    echo npm Version: %NPM_VERSION%
)

echo.

REM Prüfe node_modules Verzeichnis
if exist "node_modules" (
    echo node_modules gefunden
) else (
    echo node_modules nicht gefunden. Installiere Abhängigkeiten...
    echo Dies kann einige Minuten dauern...
    echo.
    
    npm install
    if %errorlevel% neq 0 (
        echo FEHLER: Installation fehlgeschlagen!
        echo.
        pause
        exit /b 1
    )
    echo Installation erfolgreich abgeschlossen!
)

echo.
echo Starte Entwicklungsserver...
echo Die App wird unter http://localhost:5173 verfügbar sein
echo Drücke STRG+C zum Beenden
echo.

REM Starte Vite Entwicklungsserver
npm run dev