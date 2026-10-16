#!/bin/bash

# DAIO Blueprint - Digital Asset Inheritance Playbook
# One-Click Launch Script
# Back2IQ - Ahead By Design

set -e

echo "=========================================="
echo "  DAIO Blueprint Interactive Document"
echo "  Digital Asset Inheritance Playbook"
echo "  Back2IQ - Ahead By Design"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo "Please install Node.js 20 or higher from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}Warning: Node.js version is below 20. Recommended: Node.js 20+${NC}"
fi

echo -e "${BLUE}Node.js version:${NC} $(node -v)"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_DIR="$SCRIPT_DIR/app"

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}Error: Application directory not found at $APP_DIR${NC}"
    echo "Please ensure the 'app' folder is in the same directory as this script."
    exit 1
fi

echo -e "${BLUE}Application directory:${NC} $APP_DIR"
echo ""

# Check if node_modules exists, if not install dependencies
if [ ! -d "$APP_DIR/node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    cd "$APP_DIR"
    npm install
    echo -e "${GREEN}Dependencies installed successfully!${NC}"
    echo ""
fi

# Check if dist folder exists, if not build
echo -e "${BLUE}Checking build status...${NC}"
if [ ! -d "$APP_DIR/dist" ]; then
    echo -e "${YELLOW}Building application...${NC}"
    cd "$APP_DIR"
    npm run build
    echo -e "${GREEN}Build completed successfully!${NC}"
    echo ""
fi

# Start the server
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  Starting DAIO Blueprint Server...${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "${BLUE}The application will be available at:${NC}"
echo -e "${GREEN}  http://localhost:3009${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Use npx serve to serve the static files on port 3009
cd "$APP_DIR"
npx serve dist -p 3009 -s
