# Back2IQ DAIO Value Explorer - One-Click Start Script
# PowerShell Script zum Starten der React/Vite App

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Back2IQ - Ahead by Design" -ForegroundColor Green
Write-Host "  DAIO Value Explorer" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe Node.js Installation
Write-Host "Prüfe Node.js Installation..." -ForegroundColor Blue
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "FEHLER: Node.js ist nicht installiert!" -ForegroundColor Red
    Write-Host "Bitte installiere Node.js von: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Drücke eine beliebige Taste zum Beenden..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
} else {
    Write-Host "Node.js Version: $nodeVersion" -ForegroundColor Green
}

# Prüfe npm Installation
Write-Host "Prüfe npm Installation..." -ForegroundColor Blue
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "FEHLER: npm ist nicht verfügbar!" -ForegroundColor Red
    Write-Host "Drücke eine beliebige Taste zum Beenden..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
} else {
    Write-Host "npm Version: $npmVersion" -ForegroundColor Green
}

Write-Host ""

# Prüfe node_modules Verzeichnis
if (Test-Path "node_modules") {
    Write-Host "node_modules gefunden" -ForegroundColor Green
} else {
    Write-Host "node_modules nicht gefunden. Installiere Abhängigkeiten..." -ForegroundColor Yellow
    Write-Host "Dies kann einige Minuten dauern..." -ForegroundColor Gray
    
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FEHLER: Installation fehlgeschlagen!" -ForegroundColor Red
        Write-Host "Drücke eine beliebige Taste zum Beenden..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    Write-Host "Installation erfolgreich abgeschlossen!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starte Entwicklungsserver..." -ForegroundColor Blue
Write-Host "Die App wird unter http://localhost:5173 verfügbar sein" -ForegroundColor Gray
Write-Host "Drücke STRG+C zum Beenden" -ForegroundColor Yellow
Write-Host ""

# Starte Vite Entwicklungsserver
npm run dev