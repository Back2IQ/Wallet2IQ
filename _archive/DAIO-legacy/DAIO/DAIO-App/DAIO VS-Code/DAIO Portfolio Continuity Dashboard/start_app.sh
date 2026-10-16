#!/bin/bash
echo "Starting DAIO Platform on localhost:3003..."
echo "Please make sure Node.js and npm are installed on your system."
echo ""

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the Vite development server on port 3003
npm run dev:3003