@echo off
echo Building the application...
npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo Build completed successfully!
echo Starting development server...

REM Start the development server in the background
start "Development Server" cmd /c "npm run dev"

REM Wait a moment for the server to start
timeout /t 3 >nul

REM Open browser to localhost:3000
echo Opening browser to http://localhost:3000
start "" "http://localhost:3000"

echo Development server is running!
echo Press Ctrl+C in the server window to stop the server.
pause