# DAIO Value Explorer - One-Click Starter (PowerShell)
# This script provides a seamless one-click experience

# Navigate to the script directory
Set-Location -Path $PSScriptRoot

# Clear screen and show header
Clear-Host
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DAIO Value Explorer - One-Click Start" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Checking system requirements..." -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is available
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✅ Node.js found successfully (npm version: $npmVersion)" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "❌ Node.js/npm not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Press Enter to download Node.js, or 'n' to cancel"
    if ($response -ne 'n') {
        Start-Process "https://nodejs.org/"
    }
    exit 1
}

Write-Host ""

# Check and install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        Write-Host "Please check your internet connection and try again." -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host ""
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting DAIO Value Explorer..." -ForegroundColor Green
Write-Host ""
Write-Host "The application will automatically open in your browser at:" -ForegroundColor Cyan
Write-Host "http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop the application, close this window or press Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Wait for user to read the message
Start-Sleep -Seconds 3

# Start the development server in background
Write-Host "Starting development server..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run dev && pause" -WindowStyle Normal

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open browser automatically
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:3001"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Application is now running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Keep this window open while using the application." -ForegroundColor Yellow
Write-Host "Close this window to stop the server." -ForegroundColor Yellow
Write-Host ""

# Keep window open
Read-Host "Press Enter to close this window (this will NOT stop the application)"