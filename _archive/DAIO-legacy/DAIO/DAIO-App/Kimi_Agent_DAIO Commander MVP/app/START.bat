@echo off
setlocal EnableDelayedExpansion

echo ========================================
echo DAIO Commander MVP
echo Digitale Asset-Inheritance Orchestration
echo ========================================
echo.

REM Check for Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js nicht gefunden!
    echo Bitte installieren Sie Node.js von https://nodejs.org
    pause
    exit /b 1
)

echo Node.js gefunden:
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installiere Abhaengigkeiten...
    echo Dies kann einige Minuten dauern...
    echo.
    call npm install
    if errorlevel 1 (
        echo FEHLER: Installation fehlgeschlagen!
        pause
        exit /b 1
    )
    echo.
    echo Installation abgeschlossen!
    echo.
)

REM Check if dist exists
if not exist "dist" (
    echo Erstelle Build...
    call npm run build
    if errorlevel 1 (
        echo FEHLER: Build fehlgeschlagen!
        pause
        exit /b 1
    )
    echo Build abgeschlossen!
    echo.
)

echo Starte DAIO Commander...
echo.

REM Start Electron
node node_modules\electron\cli.js .

if errorlevel 1 (
    echo.
    echo FEHLER: Anwendung konnte nicht gestartet werden.
    pause
)

endlocal
