#!/bin/bash
echo "========================================"
echo "  SecurePeople - Backend Server"
echo "========================================"
echo ""
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
echo "Starting backend server on port 3000..."
npm run dev
