@echo off
chcp 65001 >nul
title DAIO Commander
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    DAIO Commander MVP                        ║
echo ║         Digitale Asset-Inheritance Orchestration             ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo  📦 Erstinstallation wird durchgeführt...
    echo.
    call npm install
    if errorlevel 1 (
        echo  ❌ Installation fehlgeschlagen!
        echo  Bitte stellen Sie sicher, dass Node.js installiert ist.
        pause
        exit /b 1
    )
    echo  ✅ Installation abgeschlossen!
    echo.
)

:: Check if dist exists
if not exist "dist" (
    echo  📦 Build wird erstellt...
    echo.
    call npm run build
    if errorlevel 1 (
        echo  ❌ Build fehlgeschlagen!
        pause
        exit /b 1
    )
    echo  ✅ Build abgeschlossen!
    echo.
)

echo  🚀 Starte DAIO Commander...
echo.

:: Start Electron
node node_modules\electron\cli.js . %*

if errorlevel 1 (
    echo.
    echo  ❌ Fehler beim Starten der Anwendung.
    pause
)
