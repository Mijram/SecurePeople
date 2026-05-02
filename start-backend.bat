@echo off
echo ========================================
echo   SecurePeople - Backend Server
echo ========================================
echo.
cd backend
if not exist node_modules (
    echo Installing dependencies...
    npm install
)
echo Starting backend server on port 3000...
npm run dev
