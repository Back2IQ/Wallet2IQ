# DAIO Development - Kill All Dev Servers (PowerShell)
# Stops all development servers and frees up ports

# Clear screen and show header
Clear-Host
Write-Host "========================================" -ForegroundColor Red
Write-Host "  DAIO Development - Server Killer" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

Write-Host "Suchen und Beenden aller Entwicklungsserver..." -ForegroundColor Yellow
Write-Host ""

# Kill all Node.js processes
Write-Host "Beende Node.js Prozesse..." -ForegroundColor Yellow
try {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Node.js Prozesse beendet" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  Keine Node.js Prozesse gefunden" -ForegroundColor Yellow
}

Write-Host ""

# Kill processes on common development ports
Write-Host "Beende Prozesse auf typischen Entwicklungsports..." -ForegroundColor Yellow
$ports = @(3000, 3001, 3002, 5173, 8080, 8000)

foreach ($port in $ports) {
    Write-Host "Prüfe Port $port..." -ForegroundColor Cyan
    
    # Get processes listening on this port
    $processes = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | 
                 Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($processes) {
        foreach ($pid in $processes) {
            try {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "Beende Prozess auf Port $port (PID: $pid, Name: $($process.ProcessName))" -ForegroundColor Yellow
                    Stop-Process -Id $pid -Force
                }
            } catch {
                Write-Host "❌ Konnte Prozess $pid nicht beenden" -ForegroundColor Red
            }
        }
    }
}

Write-Host ""

# Kill npm processes
Write-Host "Beende npm Prozesse..." -ForegroundColor Yellow
Stop-Process -Name "npm" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "npm.cmd" -Force -ErrorAction SilentlyContinue

Write-Host ""

# Kill PowerShell processes running dev scripts (be careful with this)
Write-Host "Beende PowerShell Entwicklungsskripte..." -ForegroundColor Yellow
# Only kill PowerShell processes that are running from this directory
Get-Process -Name "pwsh" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*$PSScriptRoot*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "powershell" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*$PSScriptRoot*" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Alle Entwicklungsserver beendet!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if ports are now free
Write-Host "Prüfe, ob Ports jetzt frei sind:" -ForegroundColor Yellow
Write-Host ""

foreach ($port in $ports) {
    $listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listening) {
        Write-Host "❌ Port $port ist noch belegt" -ForegroundColor Red
    } else {
        Write-Host "✅ Port $port ist frei" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Alle Entwicklungsumgebungen wurden gestoppt." -ForegroundColor Green
Write-Host "Sie können jetzt neue Server starten." -ForegroundColor Yellow
Write-Host ""

Read-Host "Drücken Sie Enter, um das Fenster zu schließen"