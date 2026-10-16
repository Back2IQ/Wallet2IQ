@echo off
title DAIO Development - Kill All Dev Servers
color 0C
cd /d "%~dp0"

echo ========================================
echo   DAIO Development - Server Killer
echo ========================================
echo.

echo Suchen und Beenden aller Entwicklungsserver...
echo.

REM Kill all node processes (this will stop Vite dev server)
echo Beende Node.js Prozesse...
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ Node.js Prozesse beendet
) else (
    echo ℹ️  Keine Node.js Prozesse gefunden
)

echo.

REM Kill specific ports that might be used by dev servers
echo Beende Prozesse auf typischen Entwicklungsports...
for %%p in (3000 3001 3002 5173 8080 8000) do (
    echo Prüfe Port %%p...
    for /f "tokens=5" %%i in ('netstat -aon ^| findstr :%%p ^| find "LISTENING"') do (
        echo Beende Prozess auf Port %%p (PID: %%i)
        taskkill /f /pid %%i 2>nul
    )
)

echo.

REM Kill any remaining npm processes
echo Beende npm Prozesse...
taskkill /f /im npm.exe 2>nul
taskkill /f /im npm.cmd 2>nul

echo.

REM Kill any PowerShell processes that might be running dev scripts
echo Beende PowerShell Entwicklungsskripte...
taskkill /f /im pwsh.exe 2>nul
taskkill /f /im powershell.exe 2>nul

echo.
echo ========================================
echo Alle Entwicklungsserver beendet!
echo ========================================
echo.

echo Prüfe, ob Ports jetzt frei sind:
echo.

for %%p in (3000 3001 3002 5173 8080 8000) do (
    netstat -an | findstr :%%p | find "LISTENING" >nul
    if %errorlevel% equ 0 (
        echo ❌ Port %%p ist noch belegt
    ) else (
        echo ✅ Port %%p ist frei
    )
)

echo.
echo Alle Entwicklungsumgebungen wurden gestoppt.
echo Sie können jetzt neue Server starten.
echo.

pause