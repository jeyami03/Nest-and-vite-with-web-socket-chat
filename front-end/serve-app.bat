@echo off
echo Starting React app server with SPA support...
echo.

REM Check if dist folder exists
if not exist "dist" (
    echo Error: dist folder not found!
    echo Please run 'npm run build' first.
    pause
    exit /b 1
)

REM Install serve if not already installed
echo Installing serve package if needed...
npm install serve

REM Start the server with SPA support
echo Starting server at http://127.0.0.1:8080
echo Press Ctrl+C to stop the server
echo.
npx serve dist -s -l 8080 