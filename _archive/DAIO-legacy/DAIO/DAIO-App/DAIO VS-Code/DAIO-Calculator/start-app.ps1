# DAIO Value Explorer Starter Script
# This script works directly in PowerShell

# Navigate to the script directory
Set-Location -Path $PSScriptRoot

Write-Output "========================================"
Write-Output "  DAIO Value Explorer Starter"
Write-Output "========================================"
Write-Output ""

# Check if Node.js is available
Write-Output "Checking Node.js..."
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Output "Node.js found successfully (npm version: $npmVersion)"
    } else {
        Write-Output "ERROR: Node.js not found!"
        Write-Output "Please install Node.js from https://nodejs.org/"
        Read-Host "Press Enter to exit"
        exit 1
    }
} catch {
    Write-Output "ERROR: Node.js not found!"
    Write-Output "Please install Node.js from https://nodejs.org/"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check and install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Output "Installing dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Output "ERROR: Failed to install dependencies!"
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Output "Dependencies installed successfully."
} else {
    Write-Output "Dependencies already installed."
}

Write-Output ""
Write-Output "Starting DAIO Value Explorer..."
Write-Output "App will be available at: http://localhost:3001"
Write-Output "Press Ctrl+C to stop the server"
Write-Output ""

# Start the development server
npm run dev