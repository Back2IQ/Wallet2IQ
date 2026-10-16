#!/bin/bash

# DAIO Commander MVP
# Digitale Asset-Inheritance Orchestration

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    DAIO Commander MVP                        ║"
echo "║         Digitale Asset-Inheritance Orchestration             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Erstinstallation wird durchgeführt...${NC}"
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Installation fehlgeschlagen!${NC}"
        echo "Bitte stellen Sie sicher, dass Node.js installiert ist."
        read -p "Drücken Sie Enter zum Beenden..."
        exit 1
    fi
    echo -e "${GREEN}✅ Installation abgeschlossen!${NC}"
    echo ""
fi

# Check if dist exists
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}📦 Build wird erstellt...${NC}"
    echo ""
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build fehlgeschlagen!${NC}"
        read -p "Drücken Sie Enter zum Beenden..."
        exit 1
    fi
    echo -e "${GREEN}✅ Build abgeschlossen!${NC}"
    echo ""
fi

echo -e "${GREEN}🚀 Starte DAIO Commander...${NC}"
echo ""

# Start Electron
node node_modules/electron/cli.js . "$@"

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Fehler beim Starten der Anwendung.${NC}"
    read -p "Drücken Sie Enter zum Beenden..."
fi
