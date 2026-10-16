#!/bin/bash

echo "========================================"
echo "DAIO Commander MVP"
echo "Digitale Asset-Inheritance Orchestration"
echo "========================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js nicht gefunden!"
    echo "Bitte installieren Sie Node.js von https://nodejs.org"
    read -p "Enter druecken zum Beenden..."
    exit 1
fi

echo "Node.js gefunden:"
node --version
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installiere Abhaengigkeiten..."
    echo "Dies kann einige Minuten dauern..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo "FEHLER: Installation fehlgeschlagen!"
        read -p "Enter druecken zum Beenden..."
        exit 1
    fi
    echo ""
    echo "Installation abgeschlossen!"
    echo ""
fi

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "Erstelle Build..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "FEHLER: Build fehlgeschlagen!"
        read -p "Enter druecken zum Beenden..."
        exit 1
    fi
    echo "Build abgeschlossen!"
    echo ""
fi

echo "Starte DAIO Commander..."
echo ""

# Start Electron
node node_modules/electron/cli.js .

if [ $? -ne 0 ]; then
    echo ""
    echo "FEHLER: Anwendung konnte nicht gestartet werden."
    read -p "Enter druecken zum Beenden..."
fi
